import { API_URL } from './config.js';
import { guidePatterns } from './guide-model.js';
import { renderSavedAssessment } from './profile.js';

const SESSION_KEY = 'cloudforest-sleep-admin-session-v1';
const TOKEN_FORMAT = /^[A-Za-z0-9_-]{43}$/;
const byId = id => document.getElementById(id);
const fragment = new URLSearchParams(location.hash.slice(1));
let loginToken = fragment.get('token');
if (location.hash) history.replaceState(null, '', location.pathname + location.search);

let session = restoreSession();
let loaded = { offset: 0, limit: 50, status: 'all', nextOffset: null, total: 0 };
let listBusy = false;
let profileSequence = 0;
let profileTrigger = null;

function restoreSession() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    if (stored && TOKEN_FORMAT.test(stored.token) && Date.parse(stored.expiresAt) > Date.now()) return stored;
    sessionStorage.removeItem(SESSION_KEY);
  } catch { /* This tab can still hold a new session in memory. */ }
  return null;
}

function rememberSession(value) {
  session = value;
  try {
    if (value) sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch { /* Keep this session in memory when browser storage is unavailable. */ }
}

function setStatus(id, message, error = false) {
  const node = byId(id);
  node.textContent = message;
  node.dataset.state = error ? 'error' : 'success';
}

function signedOut(message = '') {
  rememberSession(null);
  byId('admin-signin').hidden = false;
  byId('admin-dashboard').hidden = true;
  byId('admin-logout').hidden = true;
  byId('contact-rows').replaceChildren();
  byId('admin-summary').replaceChildren();
  byId('contact-range').textContent = '';
  byId('export-status').textContent = '';
  closeSavedProfile(false);
  setStatus('admin-status', message);
}

function signedIn() {
  byId('admin-signin').hidden = true;
  byId('admin-dashboard').hidden = false;
  byId('admin-logout').hidden = false;
  byId('login-status').textContent = '';
}

async function api(action, fields = {}, authenticated = false, csv = false) {
  const requestSession = authenticated ? session?.token : null;
  if (authenticated && !requestSession) throw new Error('Sign in to view these records.');
  const headers = { 'Content-Type': 'application/json' };
  if (requestSession) headers.Authorization = 'Bearer ' + requestSession;
  let response;
  try {
    response = await fetch(API_URL, {
      method: 'POST', headers, body: JSON.stringify({ action, ...fields }),
      credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer'
    });
  } catch {
    throw new Error('The service could not be reached. Please try again.');
  }
  if (!response.ok) {
    const failure = await response.json().catch(() => ({}));
    if (response.status === 401 && requestSession === session?.token) {
      signedOut('Your administrator session has expired. Sign in again.');
    }
    throw new Error(failure.message || 'This request could not be completed.');
  }
  if (csv) {
    if (!response.headers.get('content-type')?.includes('text/csv')) throw new Error('The CSV export could not be read. Try again.');
    return response.blob();
  }
  const result = await response.json();
  if (result.ok !== true) throw new Error(result.message || 'This request could not be completed.');
  return result;
}

function dateText(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
}

function cell(row, value) {
  const td = document.createElement('td');
  td.textContent = value ?? '';
  row.append(td);
  return td;
}

function renderContacts(data) {
  const rows = byId('contact-rows');
  rows.replaceChildren();
  const labels = { active: 'Active', unsubscribed: 'Unsubscribed', not_subscribed: 'Report only' };
  for (const contact of data.contacts) {
    const row = document.createElement('tr');
    cell(row, contact.email);
    cell(row, contact.name);
    cell(row, labels[contact.newsletter_status] || contact.newsletter_status);
    const consent = cell(row, contact.newsletter_signed_name || '');
    for (const detail of [dateText(contact.newsletter_consented_at), contact.newsletter_consent_version]) {
      if (!detail) continue;
      const line = document.createElement('p');
      line.className = 'small muted';
      line.textContent = detail;
      consent.append(line);
    }
    cell(row, dateText(contact.unsubscribed_at));
    cell(row, contact.report_count);
    cell(row, dateText(contact.last_report_sent_at));
    cell(row, dateText(contact.created_at));
    const saved = cell(row, contact.savedProfile ? '' : 'Not saved');
    if (contact.savedProfile) {
      const label = document.createElement('p');
      label.textContent = guidePatterns[contact.savedProfile.pattern]?.name || 'Sleep assessment';
      const created = document.createElement('p');
      created.className = 'small muted';
      created.textContent = dateText(contact.savedProfile.createdAt);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'button button-secondary admin-profile-button';
      button.textContent = 'View saved profile';
      button.setAttribute('aria-label', 'View saved profile for ' + contact.email);
      button.addEventListener('click', () => loadSavedProfile(contact, button));
      saved.append(label, created, button);
    }
    rows.append(row);
  }
  if (!data.contacts.length) {
    const row = document.createElement('tr');
    const empty = cell(row, 'There are no contacts in this view.');
    empty.colSpan = 9;
    rows.append(row);
  }
  byId('contact-range').textContent = data.total
    ? 'Showing ' + (data.offset + 1) + '–' + (data.offset + data.contacts.length) + ' of ' + data.total + ' contacts. Dates use your local time.'
    : '0 contacts.';
  const summary = byId('admin-summary');
  summary.replaceChildren();
  const metrics = [
    ['Contacts', 'contacts'], ['Active subscribers', 'newsletterActive'],
    ['Unsubscribed', 'newsletterUnsubscribed'], ['Reports accepted', 'reportsSent'],
    ['Reports in progress', 'reportsProcessing'], ['Failed or expired reports', 'reportsFailed']
  ];
  for (const [label, key] of metrics) {
    const item = document.createElement('div');
    item.className = 'stat';
    const amount = document.createElement('strong');
    amount.textContent = Number(data.summary?.[key] || 0).toLocaleString();
    const title = document.createElement('span');
    title.textContent = label;
    item.append(amount, title);
    summary.append(item);
  }
}

function closeSavedProfile(restoreFocus = true) {
  profileSequence++;
  byId('admin-saved-profile').hidden = true;
  byId('admin-saved-content').replaceChildren();
  byId('admin-saved-heading').textContent = 'Saved profile';
  byId('admin-saved-meta').textContent = '';
  byId('admin-profile-status').textContent = '';
  if (restoreFocus && profileTrigger?.isConnected) profileTrigger.focus();
  profileTrigger = null;
}

async function loadSavedProfile(contact, button) {
  const requestToken = session?.token;
  if (!requestToken || !contact.savedProfile?.id) return;
  const sequence = ++profileSequence;
  profileTrigger = button;
  byId('admin-saved-profile').hidden = false;
  byId('admin-saved-content').replaceChildren();
  byId('admin-saved-heading').textContent = contact.name ? contact.name + '’s saved profile' : 'Saved profile';
  byId('admin-saved-meta').textContent = contact.email;
  setStatus('admin-profile-status', 'Loading the confirmed saved assessment…');
  byId('admin-saved-heading').focus();
  try {
    const data = await api('admin-profile-get', { id: contact.savedProfile.id }, true);
    if (session?.token !== requestToken || sequence !== profileSequence) return;
    renderSavedAssessment(byId('admin-saved-content'), data);
    byId('admin-saved-meta').textContent = contact.email + ' · Saved ' + dateText(data.createdAt);
    setStatus('admin-profile-status', '');
  } catch (error) {
    if (session?.token === requestToken && sequence === profileSequence) setStatus('admin-profile-status', error.message, true);
  }
}

byId('admin-close-profile').addEventListener('click', () => closeSavedProfile());

function updateControls() {
  byId('contact-filter').disabled = listBusy;
  byId('contact-page-size').disabled = listBusy;
  byId('refresh-contacts').disabled = listBusy;
  byId('contacts-previous').disabled = listBusy || loaded.offset === 0;
  byId('contacts-next').disabled = listBusy || loaded.nextOffset === null;
}

async function loadContacts(offset = 0) {
  if (listBusy || !session) return;
  listBusy = true;
  updateControls();
  const requestToken = session.token;
  const status = byId('contact-filter').value;
  const limit = Number(byId('contact-page-size').value);
  setStatus('admin-status', 'Loading contacts…');
  try {
    const data = await api('admin-list', { status, offset, limit }, true);
    if (session?.token !== requestToken) return;
    loaded = { status, offset: data.offset, limit: data.limit, nextOffset: data.nextOffset, total: data.total };
    renderContacts(data);
    setStatus('admin-status', '');
  } catch (error) {
    if (session?.token === requestToken) {
      byId('contact-filter').value = loaded.status;
      byId('contact-page-size').value = String(loaded.limit);
      setStatus('admin-status', error.message, true);
    }
  } finally {
    listBusy = false;
    updateControls();
  }
}

byId('admin-login-form').addEventListener('submit', async event => {
  event.preventDefault();
  const button = byId('request-admin-link');
  button.disabled = true;
  setStatus('login-status', 'Requesting your sign-in link…');
  try {
    const result = await api('admin-login', { email: byId('admin-email').value.trim() });
    setStatus('login-status', result.message);
  } catch (error) {
    setStatus('login-status', error.message, true);
  } finally {
    button.disabled = false;
  }
});

byId('admin-logout').addEventListener('click', async () => {
  const button = byId('admin-logout');
  button.disabled = true;
  let message = 'Signed out.';
  try {
    await api('admin-logout', {}, true);
  } catch {
    message = 'Signed out in this tab. The server sign-out could not be confirmed, and that session will expire automatically.';
  } finally {
    signedOut(message);
    button.disabled = false;
  }
});

byId('contact-filter').addEventListener('change', () => loadContacts(0));
byId('contact-page-size').addEventListener('change', () => loadContacts(0));
byId('refresh-contacts').addEventListener('click', () => loadContacts(loaded.offset));
byId('contacts-previous').addEventListener('click', () => loadContacts(Math.max(0, loaded.offset - loaded.limit)));
byId('contacts-next').addEventListener('click', () => {
  if (loaded.nextOffset !== null) loadContacts(loaded.nextOffset);
});

byId('admin-export-form').addEventListener('submit', async event => {
  event.preventDefault();
  const requestToken = session?.token;
  if (!requestToken) return;
  const button = byId('export-contacts');
  const select = byId('export-filter');
  const status = select.value;
  button.disabled = true;
  select.disabled = true;
  setStatus('export-status', 'Preparing the CSV file…');
  try {
    const blob = await api('admin-export', { status }, true, true);
    if (session?.token !== requestToken) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cloud-forest-sleep-' + status + '.csv';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    setStatus('export-status', 'Your CSV file is ready.');
  } catch (error) {
    if (session?.token === requestToken) setStatus('export-status', error.message, true);
  } finally {
    button.disabled = false;
    select.disabled = false;
  }
});

async function start() {
  if (loginToken) {
    signedOut();
    setStatus('admin-status', 'Checking your sign-in link…');
    try {
      if (!TOKEN_FORMAT.test(loginToken)) throw new Error('This sign-in link is invalid. Request a new link.');
      const result = await api('admin-redeem', { token: loginToken });
      if (!TOKEN_FORMAT.test(result.sessionToken) || !(Date.parse(result.expiresAt) > Date.now())) {
        throw new Error('The session could not be opened. Request a new sign-in link.');
      }
      rememberSession({ token: result.sessionToken, expiresAt: result.expiresAt });
    } catch (error) {
      setStatus('admin-status', error.message, true);
    } finally {
      loginToken = null;
    }
  }
  if (session) {
    signedIn();
    await loadContacts(0);
  }
}
start();
