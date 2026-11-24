import { API_URL } from './config.js';

const SESSION_KEY = 'cloudforest-sleep-profile-session-v1';
const TOKEN_FORMAT = /^[A-Za-z0-9_-]{43}$/;
let session = null;
let memoryOnly = false;

function validSession(value) {
  return value && typeof value === 'object' && typeof value.token === 'string' &&
    TOKEN_FORMAT.test(value.token) && typeof value.expiresAt === 'string' &&
    Date.parse(value.expiresAt) > Date.now();
}

/** This session belongs to this tab. No birth details are kept in browser storage. */
export function getProfileSession() {
  if (!memoryOnly) {
    let stored;
    try { stored = sessionStorage.getItem(SESSION_KEY); }
    catch { memoryOnly = true; }
    if (!memoryOnly) {
      try { session = JSON.parse(stored || 'null'); }
      catch { session = null; }
    }
  }
  if (!validSession(session)) {
    setProfileSession(null);
    return null;
  }
  return { token: session.token, expiresAt: session.expiresAt };
}

export function setProfileSession(value) {
  if (value !== null && !validSession(value)) throw new Error('This sign-in session is invalid or expired. Request a new link.');
  session = value ? { token: value.token, expiresAt: value.expiresAt } : null;
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
    memoryOnly = false;
  } catch { memoryOnly = true; /* A blocked storage area still permits a session in this page's memory. */ }
}

export class ProfileRequestError extends Error {
  constructor(message, { code = 'request_failed', status = 0, retryAfter = null } = {}) {
    super(message);
    this.name = 'ProfileRequestError';
    this.code = code;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export async function profileRequest(action, fields = {}, authenticated = true) {
  const requestToken = authenticated ? getProfileSession()?.token : null;
  if (authenticated && !requestToken) {
    throw new ProfileRequestError('Your saved-profile session has expired. Sign in again.', { code: 'sign_in_required', status: 401 });
  }
  const headers = { 'Content-Type': 'application/json' };
  if (requestToken) headers.Authorization = 'Bearer ' + requestToken;
  let response;
  try {
    response = await fetch(API_URL, {
      method: 'POST', headers, body: JSON.stringify({ ...fields, action }),
      credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer'
    });
  } catch {
    throw new ProfileRequestError('The service could not be reached. Check your connection and try again.', { code: 'network_error' });
  }
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.ok !== true) {
    // An older request must never erase a replacement session opened meanwhile.
    if (response.status === 401 && requestToken && getProfileSession()?.token === requestToken) setProfileSession(null);
    const seconds = Number(response.headers.get('retry-after'));
    throw new ProfileRequestError(result?.message || 'This request could not be completed. Please try again.', {
      code: typeof result?.code === 'string' ? result.code : 'request_failed',
      status: response.status,
      retryAfter: Number.isFinite(seconds) && seconds > 0 ? seconds : null
    });
  }
  return result;
}
