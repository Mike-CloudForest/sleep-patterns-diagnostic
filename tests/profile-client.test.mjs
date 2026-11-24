import test from 'node:test';
import assert from 'node:assert/strict';

const tokenA = 'a'.repeat(43);
const tokenB = 'b'.repeat(43);
const future = () => new Date(Date.now() + 60_000).toISOString();
let moduleId = 0;

async function withClient(run, { blockedStorage = false } = {}) {
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  const originalFetch = globalThis.fetch;
  const stored = new Map();
  const calls = [];
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: {
    getItem(key) { if (blockedStorage) throw new Error('Storage blocked'); return stored.get(key) ?? null; },
    setItem(key, value) { if (blockedStorage) throw new Error('Storage blocked'); stored.set(key, value); },
    removeItem(key) { if (blockedStorage) throw new Error('Storage blocked'); stored.delete(key); }
  } });
  // Intercept every request. These tests never contact the live email service.
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };
  try {
    const client = await import('../profile-client.js?client-test=' + ++moduleId);
    await run({ client, stored, calls });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalStorage) Object.defineProperty(globalThis, 'sessionStorage', originalStorage);
    else delete globalThis.sessionStorage;
  }
}

test('profile sessions retain only a scoped token and expiry, and reject expired credentials', async () => {
  await withClient(async ({ client, stored }) => {
    const expiry = future();
    client.setProfileSession({ token: tokenA, expiresAt: expiry, birthDetails: 'Must not persist' });
    assert.deepEqual(client.getProfileSession(), { token: tokenA, expiresAt: expiry });
    assert.deepEqual(JSON.parse([...stored.values()][0]), { token: tokenA, expiresAt: expiry });
    assert.throws(() => client.setProfileSession({ token: tokenA, expiresAt: '2000-01-01T00:00:00Z' }), /expired/);
    stored.set([...stored.keys()][0], JSON.stringify({ token: tokenA, expiresAt: '2000-01-01T00:00:00Z' }));
    assert.equal(client.getProfileSession(), null);
    assert.equal(stored.size, 0);
  });
});

test('private requests require a session while public sign-in requests omit the bearer token', async () => {
  await withClient(async ({ client, calls }) => {
    await assert.rejects(client.profileRequest('profile-list'), error => error.status === 401);
    assert.equal(calls.length, 0);
    client.setProfileSession({ token: tokenA, expiresAt: future() });
    await client.profileRequest('profile-list', { offset: 0 });
    assert.equal(calls[0].options.headers.Authorization, 'Bearer ' + tokenA);
    assert.equal(calls[0].options.credentials, 'omit');
    assert.equal(calls[0].options.cache, 'no-store');
    assert.equal(calls[0].options.referrerPolicy, 'no-referrer');
    await client.profileRequest('profile-login', { email: 'synthetic@example.test' }, false);
    assert.equal(calls[1].options.headers.Authorization, undefined);
  });
});

test('a late unauthorized response cannot erase a replacement sign-in session', async () => {
  await withClient(async ({ client }) => {
    client.setProfileSession({ token: tokenA, expiresAt: future() });
    let resolveRequest;
    globalThis.fetch = () => new Promise(resolve => { resolveRequest = resolve; });
    const pending = client.profileRequest('profile-get', { id: 'synthetic-assessment' });
    client.setProfileSession({ token: tokenB, expiresAt: future() });
    resolveRequest(new Response(JSON.stringify({ ok: false, message: 'Expired', code: 'session_expired' }), { status: 401 }));
    await assert.rejects(pending, error => error.status === 401);
    assert.equal(client.getProfileSession().token, tokenB);
  });
});

test('a rejected current session is cleared and rate-limit guidance is retained', async () => {
  await withClient(async ({ client }) => {
    client.setProfileSession({ token: tokenA, expiresAt: future() });
    globalThis.fetch = async () => new Response(JSON.stringify({ ok: false, message: 'Expired' }), { status: 401 });
    await assert.rejects(client.profileRequest('profile-list'), error => error.status === 401);
    assert.equal(client.getProfileSession(), null);
    globalThis.fetch = async () => new Response(JSON.stringify({ ok: false, message: 'Try later', code: 'rate_limited' }),
      { status: 429, headers: { 'retry-after': '60' } });
    await assert.rejects(client.profileRequest('profile-login', {}, false),
      error => error.status === 429 && error.retryAfter === 60 && error.code === 'rate_limited');
  });
});

test('blocked browser storage still supports a session in page memory', async () => {
  await withClient(async ({ client }) => {
    client.setProfileSession({ token: tokenA, expiresAt: future() });
    assert.equal(client.getProfileSession().token, tokenA);
    client.setProfileSession(null);
    assert.equal(client.getProfileSession(), null);
  }, { blockedStorage: true });
});
