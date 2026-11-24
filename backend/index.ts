import * as PDFLib from 'npm:pdf-lib@1.17.1';
import {
  validateAssessment, REPORT_VERSION, CONSENT_VERSION, REPORT_CONSENT, NEWSLETTER_CONSENT,
} from '../assessment.js';
import { createSleepPdf } from '../report.js';

const SITE_ORIGIN = 'https://mike-cloudforest.github.io';
const SITE_BASE = `${SITE_ORIGIN}/sleep-patterns-diagnostic/`;
const OWNER_EMAIL = 'sifu@cloudforesttemple.com';
const FROM_ADDRESS = 'Cloud Forest <support@traincloudforest.com>';
const MAX_BODY_BYTES = 50 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const OPAQUE_TOKEN = /^[A-Za-z0-9_-]{43}$/;
const encoder = new TextEncoder();

type JsonObject = Record<string, unknown>;
type Config = { resend_api_key: string; signing_secret: string };
type Contact = {
  id: string; email: string; name: string; newsletter_status: string;
  newsletter_signed_name: string | null; newsletter_consent_version: string | null;
  newsletter_consent_text: string | null;
  newsletter_consented_at: string | null; unsubscribed_at: string | null;
  report_count: number; last_report_sent_at: string | null; created_at: string;
};
type PriorRequest = {
  payload_hash: string; report_version: string; status: string;
  lease_expires_at: string | null; created_at: string;
};
type Claim = { status: string; contactId?: string; lockToken?: string; createdAt?: string };
type Assessment = ReturnType<typeof validateAssessment>;
type ReportInput = Assessment & {
  requestId: string; email: string; name: string; newsletterConsent: boolean;
  signature: string; reportConsent: true; reportVersion: string; consentVersion: string;
};

class AppError extends Error {
  constructor(public status: number, public code: string, message: string, public retryAfter?: number) {
    super(message);
  }
}

let configCache: { value: Config; expiresAt: number } | undefined;

function corsHeaders(request: Request): Headers {
  const headers = new Headers({
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff',
  });
  if (request.headers.get('origin') === SITE_ORIGIN) {
    headers.set('Access-Control-Allow-Origin', SITE_ORIGIN);
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'authorization, apikey, content-type, x-client-info');
    headers.set('Access-Control-Expose-Headers', 'Content-Disposition, Retry-After');
    headers.set('Access-Control-Max-Age', '600');
  }
  return headers;
}

function json(request: Request, status: number, data: unknown, retryAfter?: number): Response {
  const headers = corsHeaders(request);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  if (retryAfter !== undefined) headers.set('Retry-After', String(retryAfter));
  return new Response(JSON.stringify(data), { status, headers });
}

async function readBody(request: Request): Promise<JsonObject> {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    throw new AppError(415, 'json_required', 'Send this request as JSON.');
  }
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) {
    throw new AppError(413, 'request_too_large', 'This request is too large.');
  }
  const reader = request.body?.getReader();
  if (!reader) throw new AppError(400, 'missing_request', 'Complete the form before submitting.');
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new AppError(413, 'request_too_large', 'This request is too large.');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  let data: unknown;
  try {
    data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw new AppError(400, 'invalid_json', 'The submitted form could not be read.');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new AppError(400, 'invalid_request', 'The submitted form could not be read.');
  }
  return data as JsonObject;
}

function exactFields(body: JsonObject, fields: string[]): void {
  const allowed = new Set(['action', 'website', ...fields]);
  if (Object.keys(body).some(key => !allowed.has(key))) {
    throw new AppError(400, 'unexpected_field', 'The form contains an unsupported field. Refresh and try again.');
  }
  if (body.website !== undefined && (typeof body.website !== 'string' || body.website.trim() !== '')) {
    throw new AppError(400, 'invalid_request', 'This request could not be accepted.');
  }
}

function shortText(value: unknown, label: string): string {
  if (value === undefined) return '';
  if (typeof value !== 'string' || value.length > 100 || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new AppError(400, 'invalid_name', `Enter a ${label} of up to 100 characters.`);
  }
  return value.trim();
}

function emailAddress(value: unknown): string {
  if (typeof value !== 'string' || value.length > 254) {
    throw new AppError(400, 'invalid_email', 'Enter a valid email address.');
  }
  const email = value.trim().toLowerCase();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || /[\u0000-\u001f\u007f]/.test(email)) {
    throw new AppError(400, 'invalid_email', 'Enter a valid email address.');
  }
  return email;
}

function validateReport(body: JsonObject): ReportInput {
  exactFields(body, ['requestId', 'email', 'name', 'answers', 'traditionsSelection', 'diary',
    'reportConsent', 'newsletterConsent', 'signature', 'consentVersion', 'reportVersion']);
  if (body.reportVersion !== REPORT_VERSION || body.consentVersion !== CONSENT_VERSION) {
    throw new AppError(409, 'update_required', 'Refresh this page to use the current report and consent form.');
  }
  if (typeof body.requestId !== 'string' || !UUID.test(body.requestId)) {
    throw new AppError(400, 'invalid_request_id', 'Start a new report request and try again.');
  }
  if (body.reportConsent !== true) {
    throw new AppError(400, 'report_consent_required', 'Confirm that you want Cloud Forest to process and email this report.');
  }
  if (body.newsletterConsent !== undefined && typeof body.newsletterConsent !== 'boolean') {
    throw new AppError(400, 'invalid_consent', 'Review the newsletter choice.');
  }
  const newsletterConsent = body.newsletterConsent === true;
  const signature = shortText(body.signature, 'signature');
  if (newsletterConsent && !signature) {
    throw new AppError(400, 'signature_required', 'Type your full name to sign the newsletter consent.');
  }
  let assessment: Assessment;
  try {
    assessment = validateAssessment(body);
  } catch (error) {
    throw new AppError(400, 'invalid_assessment', error instanceof Error ? error.message : 'Review your sleep answers.');
  }
  return {
    ...assessment,
    requestId: body.requestId.toLowerCase(),
    email: emailAddress(body.email),
    name: shortText(body.name, 'name'),
    reportConsent: true,
    newsletterConsent,
    signature: newsletterConsent ? signature : '',
    consentVersion: CONSENT_VERSION,
    reportVersion: REPORT_VERSION,
  };
}

async function database(path: string, options: RequestInit = {}): Promise<Response> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    throw new AppError(503, 'service_configuration', 'The report service is temporarily unavailable.');
  }
  const headers = new Headers(options.headers);
  headers.set('apikey', serviceKey);
  headers.set('Authorization', `Bearer ${serviceKey}`);
  headers.set('Content-Type', 'application/json');
  let response: Response;
  try {
    response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...options, headers, signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new AppError(503, 'database_unavailable', 'The report service is temporarily unavailable. Retry this same request shortly.');
  }
  if (!response.ok) {
    console.error('Sleep database request failed', { status: response.status, resource: path.split('?')[0] });
    throw new AppError(503, 'database_unavailable', 'The report service is temporarily unavailable. Retry this same request shortly.');
  }
  return response;
}

async function rpc<T>(name: string, arguments_: JsonObject = {}): Promise<T> {
  const response = await database(`rpc/${name}`, { method: 'POST', body: JSON.stringify(arguments_) });
  return await response.json() as T;
}

async function getConfig(): Promise<Config> {
  if (configCache && configCache.expiresAt > Date.now()) return configCache.value;
  const config = await rpc<Config | null>('sleep_get_config');
  if (!config?.resend_api_key || typeof config.signing_secret !== 'string' || config.signing_secret.length < 32) {
    throw new AppError(503, 'service_configuration', 'The report email service is temporarily unavailable.');
  }
  configCache = { value: config, expiresAt: Date.now() + 60_000 };
  return config;
}

function bytesToHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function sha256(value: string): Promise<string> {
  return bytesToHex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function hmac(secret: string, message: string): Promise<string> {
  return bytesToHex(await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(message)));
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const record = value as JsonObject;
    return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function enforceRate(request: Request, config: Config, action: string, email?: string): Promise<void> {
  const clientIp = (request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown').trim().slice(0, 128);
  const ipHash = await hmac(config.signing_secret, `rate-ip:${clientIp}`);
  const entries = [
    { key: `${action}:ip:${ipHash}`, limit: action === 'report' ? 8 : 20, seconds: 3600 },
    { key: `${action}:global-hour`, limit: 100, seconds: 3600 },
    { key: `${action}:global-day`, limit: 500, seconds: 86400 },
  ];
  if (email) {
    const emailHash = await hmac(config.signing_secret, `rate-email:${email}`);
    entries.push({ key: `${action}:email:${emailHash}`, limit: action === 'report' ? 4 : 3, seconds: 3600 });
  }
  if (!await rpc<boolean>('sleep_take_rate_limit', { p_entries: entries })) {
    throw new AppError(429, 'rate_limited', 'Too many requests have been made. Please try again in an hour.', 3600);
  }
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function unsubscribeToken(contactId: string, secret: string): Promise<string> {
  return `u1.${contactId}.${await hmac(secret, `unsubscribe:v1:${contactId}`)}`;
}

async function verifyUnsubscribeToken(token: unknown, secret: string): Promise<string> {
  if (typeof token !== 'string' || token.length > 110) {
    throw new AppError(400, 'invalid_unsubscribe_link', 'This unsubscribe link is invalid.');
  }
  const [version, contactId, signature, extra] = token.split('.');
  if (version !== 'u1' || !contactId || !UUID.test(contactId) || !/^[a-f0-9]{64}$/.test(signature || '') || extra) {
    throw new AppError(400, 'invalid_unsubscribe_link', 'This unsubscribe link is invalid.');
  }
  const signatureBytes = Uint8Array.from(signature.match(/.{2}/g)!, pair => parseInt(pair, 16));
  const valid = await crypto.subtle.verify('HMAC', await hmacKey(secret), signatureBytes,
    encoder.encode(`unsubscribe:v1:${contactId}`));
  if (!valid) throw new AppError(400, 'invalid_unsubscribe_link', 'This unsubscribe link is invalid.');
  return contactId;
}

async function sendMail(config: Config, idempotencyKey: string, mail: JsonObject): Promise<string> {
  let response: Response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.resend_api_key}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({ from: FROM_ADDRESS, reply_to: OWNER_EMAIL, ...mail }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new AppError(503, 'delivery_unconfirmed', 'The email service did not confirm this request. Retry the same request to check or complete delivery.');
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok || typeof result.id !== 'string') {
    console.error('Sleep email provider response', { status: response.status });
    throw new AppError(503, 'email_not_accepted', 'The email service could not accept this request. Retry the same request shortly.');
  }
  return result.id;
}

function base64(bytes: Uint8Array): string {
  let binary = '';
  for (let start = 0; start < bytes.length; start += 8192) {
    binary += String.fromCharCode(...bytes.subarray(start, start + 8192));
  }
  return btoa(binary);
}

function processing(request: Request, requestId: string): Response {
  return json(request, 202, { ok: false, status: 'processing', requestId, retryAfter: 5,
    message: 'This report request is being processed. Check again shortly using the same request.' }, 5);
}

async function report(request: Request, body: JsonObject): Promise<Response> {
  const input = validateReport(body);
  const config = await getConfig();
  const payloadHash = await hmac(config.signing_secret, `report-payload:v1:${canonicalJson(input)}`);
  const query = new URLSearchParams({
    select: 'payload_hash,report_version,status,lease_expires_at,created_at',
    request_id: `eq.${input.requestId}`, limit: '1',
  });
  const priorRows = await (await database(`sleep_report_requests?${query}`)).json() as PriorRequest[];
  const prior = priorRows[0];
  if (prior) {
    if (prior.payload_hash !== payloadHash || prior.report_version !== REPORT_VERSION) {
      throw new AppError(409, 'request_changed', 'This request ID belongs to an earlier form submission. Start a new report request.');
    }
    if (prior.status === 'sent') return json(request, 200, { ok: true, status: 'sent', requestId: input.requestId });
    if (prior.status === 'sending' && Date.parse(prior.lease_expires_at || '') > Date.now()) {
      return processing(request, input.requestId);
    }
  }
  await enforceRate(request, config, 'report', input.email);
  const claim = await rpc<Claim>('sleep_claim_report', {
    p_request_id: input.requestId, p_payload_hash: payloadHash, p_report_version: REPORT_VERSION,
    p_email: input.email, p_name: input.name, p_newsletter_consent: input.newsletterConsent,
    p_signature: input.signature, p_consent_version: CONSENT_VERSION,
    p_report_consent_text: REPORT_CONSENT, p_newsletter_consent_text: NEWSLETTER_CONSENT,
  });
  if (claim.status === 'sent') return json(request, 200, { ok: true, status: 'sent', requestId: input.requestId });
  if (claim.status === 'processing') return processing(request, input.requestId);
  if (claim.status === 'conflict') {
    throw new AppError(409, 'request_changed', 'This request ID belongs to an earlier form submission. Start a new report request.');
  }
  if (claim.status === 'expired') {
    throw new AppError(409, 'request_expired', 'This request is more than 20 hours old. Start a new report request.');
  }
  if (claim.status !== 'claimed' || !claim.contactId || !claim.lockToken) {
    throw new AppError(503, 'claim_failed', 'The report service is temporarily unavailable. Retry this same request.');
  }

  let emailId: string;
  try {
    const pdf = await createSleepPdf(input.answers, input.traditionsSelection, input.diary, input.name, PDFLib);
    if (!(pdf instanceof Uint8Array) || pdf.byteLength === 0 || pdf.byteLength > 8 * 1024 * 1024) {
      throw new AppError(503, 'pdf_generation_failed', 'The report could not be generated. Retry this same request.');
    }
    const token = await unsubscribeToken(claim.contactId, config.signing_secret);
    const unsubscribeUrl = `${SITE_BASE}unsubscribe.html#token=${encodeURIComponent(token)}`;
    const greeting = input.name ? `Hello ${input.name},` : 'Hello,';
    const newsletter = input.newsletterConsent
      ? 'You also signed up for the Cloud Forest newsletter. Your signed consent has been recorded.' : '';
    emailId = await sendMail(config, `sleep-report/${input.requestId}`, {
      to: [input.email],
      subject: 'Your Cloud Forest sleep-pattern report',
      text: `${greeting}\n\nYour requested PDF report is attached. It includes your sleep-pattern result, the guide information, your selected tradition notes and any diary entries you provided.\n\n${newsletter}\n\nQuestions? Reply to this email.\n\nManage Cloud Forest newsletter emails: ${unsubscribeUrl}\n\nCloud Forest Martial Arts Institute\n719 W Gate City Blvd, Greensboro, NC 27403`,
      html: `<p>${escapeHtml(greeting)}</p><p>Your requested PDF report is attached. It includes your sleep-pattern result, the guide information, your selected tradition notes and any diary entries you provided.</p>${newsletter ? `<p>${newsletter}</p>` : ''}<p>Questions? Reply to this email.</p><p><a href="${escapeHtml(unsubscribeUrl)}">Manage Cloud Forest newsletter emails</a></p><p>Cloud Forest Martial Arts Institute<br>719 W Gate City Blvd, Greensboro, NC 27403</p>`,
      attachments: [{ filename: 'Cloud-Forest-Sleep-Report.pdf', content: base64(pdf), content_type: 'application/pdf' }],
    });
  } catch (error) {
    const failure = error instanceof AppError ? error
      : new AppError(503, 'pdf_generation_failed', 'The report could not be generated. Retry this same request.');
    try {
      await rpc('sleep_finish_report', { p_request_id: input.requestId, p_lock_token: claim.lockToken,
        p_email_id: null, p_error_code: failure.code });
    } catch {
      // The existing lease will expire. A retry retains the same provider key.
      console.error('Sleep failed request status could not be recorded');
    }
    throw failure;
  }
  try {
    const saved = await rpc<boolean>('sleep_finish_report', {
      p_request_id: input.requestId, p_lock_token: claim.lockToken, p_email_id: emailId, p_error_code: null,
    });
    if (!saved) return processing(request, input.requestId);
  } catch {
    throw new AppError(503, 'delivery_record_pending', 'The email service accepted the report, but its delivery record is still pending. Retry this same request to confirm its status.');
  }
  return json(request, 200, { ok: true, status: 'sent', requestId: input.requestId,
    message: 'The email service accepted your report. Check your inbox and spam folder.' });
}

async function adminLogin(request: Request, body: JsonObject): Promise<Response> {
  exactFields(body, ['email']);
  const email = emailAddress(body.email);
  const config = await getConfig();
  await enforceRate(request, config, 'admin-login', email);
  const message = 'If this address has administrator access, a sign-in email will arrive shortly.';
  if (email !== OWNER_EMAIL) return json(request, 200, { ok: true, message });
  const token = randomToken();
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await database('sleep_admin_tokens', { method: 'POST', body: JSON.stringify({
    token_hash: tokenHash, kind: 'login', email: OWNER_EMAIL, expires_at: expiresAt,
    scopes: ['contacts:read', 'contacts:export'],
  }) });
  const url = `${SITE_BASE}admin.html#token=${token}`;
  try {
    await sendMail(config, `sleep-admin-login/${tokenHash}`, {
      to: [OWNER_EMAIL], subject: 'Sign in to Cloud Forest sleep-report administration',
      text: `Use this link to view sleep-report contacts and newsletter consent records:\n\n${url}\n\nThis link expires in 15 minutes and can be used once. If you did not request it, you can leave it unused.`,
      html: `<p>Use this link to view sleep-report contacts and newsletter consent records.</p><p><a href="${url}">Sign in to sleep-report administration</a></p><p>This link expires in 15 minutes and can be used once. If you did not request it, you can leave it unused.</p>`,
    });
  } catch (error) {
    // A timed-out provider request may still deliver. Keep that link usable
    // until its short expiry rather than invalidating an already sent email.
    if (error instanceof AppError && error.code === 'email_not_accepted') {
      await database(`sleep_admin_tokens?token_hash=eq.${tokenHash}`, { method: 'DELETE' }).catch(() => undefined);
    }
    throw error;
  }
  return json(request, 200, { ok: true, message });
}

async function adminRedeem(request: Request, body: JsonObject): Promise<Response> {
  exactFields(body, ['token']);
  if (typeof body.token !== 'string' || !OPAQUE_TOKEN.test(body.token)) {
    throw new AppError(401, 'invalid_login_link', 'This sign-in link is invalid or expired. Request a new one.');
  }
  const config = await getConfig();
  await enforceRate(request, config, 'admin-redeem');
  const sessionToken = randomToken();
  const result = await rpc<{ ok: boolean; expiresAt?: string }>('sleep_redeem_admin_token', {
    p_token_hash: await sha256(body.token), p_session_hash: await sha256(sessionToken),
  });
  if (!result.ok) throw new AppError(401, 'invalid_login_link', 'This sign-in link is invalid or expired. Request a new one.');
  return json(request, 200, { ok: true, sessionToken, expiresAt: result.expiresAt });
}

async function requireAdmin(request: Request, scope: string): Promise<string> {
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!OPAQUE_TOKEN.test(token)) throw new AppError(401, 'sign_in_required', 'Sign in to view these records.');
  const tokenHash = await sha256(token);
  const query = new URLSearchParams({
    select: 'scopes', token_hash: `eq.${tokenHash}`, kind: 'eq.session', email: `eq.${OWNER_EMAIL}`,
    used_at: 'is.null', expires_at: `gt.${new Date().toISOString()}`, limit: '1',
  });
  const sessions = await (await database(`sleep_admin_tokens?${query}`)).json() as { scopes: string[] }[];
  if (!sessions[0]?.scopes.includes(scope)) {
    throw new AppError(401, 'session_expired', 'Your administrator session has expired. Sign in again.');
  }
  return tokenHash;
}

function contactStatus(value: unknown, fallback: string): string {
  const status = value === undefined ? fallback : value;
  if (typeof status !== 'string' || !['all', 'active', 'unsubscribed', 'not_subscribed'].includes(status)) {
    throw new AppError(400, 'invalid_status', 'Choose a valid contact filter.');
  }
  return status;
}

const CONTACT_COLUMNS = 'id,email,name,newsletter_status,newsletter_signed_name,newsletter_consent_version,newsletter_consent_text,newsletter_consented_at,unsubscribed_at,report_count,last_report_sent_at,created_at';

async function contactPage(status: string, offset: number, limit: number): Promise<{ contacts: Contact[]; total: number }> {
  const query = new URLSearchParams({ select: CONTACT_COLUMNS, order: 'created_at.desc,id', offset: String(offset), limit: String(limit) });
  if (status !== 'all') query.set('newsletter_status', `eq.${status}`);
  const response = await database(`sleep_contacts?${query}`, { headers: { Prefer: 'count=exact' } });
  const total = Number(response.headers.get('Content-Range')?.split('/')[1] || '0');
  return { contacts: await response.json() as Contact[], total };
}

async function adminList(request: Request, body: JsonObject): Promise<Response> {
  exactFields(body, ['offset', 'limit', 'status']);
  await requireAdmin(request, 'contacts:read');
  const offset = body.offset ?? 0;
  const limit = body.limit ?? 50;
  if (!Number.isInteger(offset) || Number(offset) < 0 || !Number.isInteger(limit) || Number(limit) < 1 || Number(limit) > 100) {
    throw new AppError(400, 'invalid_pagination', 'Choose a valid page size and offset.');
  }
  const status = contactStatus(body.status, 'all');
  const [page, summary] = await Promise.all([
    contactPage(status, Number(offset), Number(limit)), rpc('sleep_admin_overview'),
  ]);
  return json(request, 200, { ok: true, ...page, summary, offset, limit,
    nextOffset: Number(offset) + page.contacts.length < page.total ? Number(offset) + page.contacts.length : null });
}

function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

async function adminExport(request: Request, body: JsonObject): Promise<Response> {
  exactFields(body, ['status']);
  await requireAdmin(request, 'contacts:export');
  const status = contactStatus(body.status, 'active');
  const rows = [['Email', 'Name', 'Newsletter status', 'Signed name', 'Consent version',
    'Consent text', 'Consent recorded UTC', 'Unsubscribed UTC', 'Reports accepted', 'Last report accepted UTC', 'Contact created UTC']];
  const contacts = await rpc<Contact[]>('sleep_export_contacts', { p_status: status });
  for (const contact of contacts) {
    rows.push([contact.email, contact.name, contact.newsletter_status, contact.newsletter_signed_name || '',
      contact.newsletter_consent_version || '', contact.newsletter_consent_text || '',
      contact.newsletter_consented_at || '', contact.unsubscribed_at || '',
      String(contact.report_count), contact.last_report_sent_at || '', contact.created_at]);
  }
  const headers = corsHeaders(request);
  headers.set('Content-Type', 'text/csv; charset=utf-8');
  headers.set('Content-Disposition', `attachment; filename="cloud-forest-sleep-${status}.csv"`);
  return new Response('\ufeff' + rows.map(row => row.map(csvCell).join(',')).join('\r\n'), { headers });
}

async function unsubscribe(request: Request, body: JsonObject): Promise<Response> {
  exactFields(body, ['token']);
  const config = await getConfig();
  await enforceRate(request, config, 'unsubscribe');
  const contactId = await verifyUnsubscribeToken(body.token, config.signing_secret);
  const updated = await rpc<boolean>('sleep_unsubscribe', { p_contact_id: contactId });
  if (!updated) throw new AppError(400, 'invalid_unsubscribe_link', 'This unsubscribe link is invalid.');
  return json(request, 200, { ok: true, status: 'unsubscribed', message: 'You have been unsubscribed from the Cloud Forest newsletter list for this app.' });
}

export async function handleRequest(request: Request): Promise<Response> {
  try {
    const origin = request.headers.get('origin');
    if (origin && origin !== SITE_ORIGIN) throw new AppError(403, 'origin_not_allowed', 'This website cannot submit to this service.');
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request) });
    if (request.method === 'GET') return json(request, 200, { ok: true, service: 'sleep-reports', reportVersion: REPORT_VERSION });
    if (request.method !== 'POST') throw new AppError(405, 'method_not_allowed', 'Use POST to submit this request.');
    const body = await readBody(request);
    switch (body.action) {
      case 'report': return await report(request, body);
      case 'admin-login': return await adminLogin(request, body);
      case 'admin-redeem': return await adminRedeem(request, body);
      case 'admin-list': return await adminList(request, body);
      case 'admin-export': return await adminExport(request, body);
      case 'unsubscribe': return await unsubscribe(request, body);
      case 'admin-logout': {
        exactFields(body, []);
        const hash = await requireAdmin(request, 'contacts:read');
        await database(`sleep_admin_tokens?token_hash=eq.${hash}`, { method: 'DELETE' });
        return json(request, 200, { ok: true });
      }
      default: throw new AppError(400, 'unknown_action', 'Choose a supported action.');
    }
  } catch (error) {
    const failure = error instanceof AppError ? error
      : new AppError(503, 'service_unavailable', 'The report service is temporarily unavailable. Please try again shortly.');
    if (!(error instanceof AppError)) console.error('Sleep request failed unexpectedly');
    return json(request, failure.status, { ok: false, code: failure.code, message: failure.message }, failure.retryAfter);
  }
}

Deno.serve(handleRequest);
