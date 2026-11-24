import { API_URL } from './config.js';

const status = document.getElementById('unsubscribe-status');
const button = document.getElementById('confirm-unsubscribe');
let token = new URLSearchParams(location.hash.slice(1)).get('token');
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
const validShape = /^u1\.[0-9a-f-]{36}\.[a-f0-9]{64}$/i;

if (token && validShape.test(token)) {
  button.disabled = false;
} else {
  status.textContent = 'Open the newsletter preferences link in your Cloud Forest email. You can also contact sifu@cloudforesttemple.com for help.';
}

document.getElementById('unsubscribe-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (!token || button.disabled) return;
  button.disabled = true;
  status.textContent = 'Updating your newsletter preference…';
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unsubscribe', token }),
      credentials: 'omit',
      cache: 'no-store',
      referrerPolicy: 'no-referrer'
    });
    const result = await response.json();
    if (!response.ok || result.ok !== true) throw new Error(result.message || 'Your preference could not be updated. Please try again.');
    status.textContent = result.message;
    token = null;
    button.textContent = 'Unsubscribed';
  } catch (error) {
    status.textContent = error instanceof TypeError ? 'The service could not be reached. Please try again.' : error.message;
    button.disabled = false;
  }
});
