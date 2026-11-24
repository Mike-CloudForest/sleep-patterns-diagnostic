import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getCountries, searchBirthplaces } from '../places.js';

// Same-name locations intentionally have different countries and time zones.
const rows = [
  ['Paris', 'Texas', 'US', 33.66, -95.55, 'America/Chicago', 'Paris', 24000],
  ['Paris', 'Île-de-France', 'FR', 48.86, 2.35, 'Europe/Paris', 'Paris', 2000000],
  ['Paris', 'Ontario', 'CA', 43.19, -80.38, 'America/Toronto', 'Paris', 12000],
  ['São Paulo', 'São Paulo', 'BR', -23.55, -46.63, 'America/Sao_Paulo', 'Sao Paulo', 12000000],
  ['Saint-Étienne', 'Auvergne-Rhône-Alpes', 'FR', 45.43, 4.39, 'Europe/Paris', 'Saint-Etienne', 170000],
  ['East Paris', 'Texas', 'US', 33.65, -95.51, 'America/Chicago', 'East Paris', 500000],
  ['Paris Hill', 'Maine', 'US', 44.25, -70.5, 'America/New_York', 'Paris Hill', 100000]
];

test('same-name cities are restricted to the exact selected country and include disambiguating labels', () => {
  assert.deepEqual(searchBirthplaces(rows, 'Paris', 'FR'), [{
    label: 'Paris, Île-de-France, France', latitude: 48.86, longitude: 2.35,
    timeZone: 'Europe/Paris', countryCode: 'FR'
  }]);
  const us = searchBirthplaces(rows, 'Paris', 'US');
  assert.equal(us.length, 3);
  assert.ok(us.every(item => item.countryCode === 'US'));
  assert.match(us[0].label, /^Paris, Texas,/);
  assert.equal(us[0].timeZone, 'America/Chicago');
  assert.deepEqual(searchBirthplaces(rows, 'Paris', ''), []);
  assert.deepEqual(searchBirthplaces(rows, 'Paris', 'ZZ'), []);
  assert.deepEqual(searchBirthplaces(rows, 'P', 'FR'), []);
});

test('city search handles accents, punctuation, extra whitespace and region words', () => {
  for (const query of ['sao paulo', ' SÃO   PAULO ', 'são-paulo']) {
    assert.match(searchBirthplaces(rows, query, 'BR')[0].label, /^São Paulo,/);
  }
  assert.match(searchBirthplaces(rows, 'saint etienne', 'FR')[0].label, /^Saint-Étienne,/);
  assert.ok(searchBirthplaces(rows, 'paris texas', 'US').some(item => /^Paris, Texas,/.test(item.label)));
  assert.deepEqual(searchBirthplaces(rows, 'paris texas', 'FR'), []);
});

test('exact city names rank ahead of larger partial matches and choices are capped', () => {
  const result = searchBirthplaces(rows, 'Paris', 'US');
  assert.deepEqual(result.map(item => item.label.split(',')[0]), ['Paris', 'Paris Hill', 'East Paris']);
  const many = Array.from({ length: 20 }, (_, index) => ['Springfield', 'Region ' + index, 'US', 1, 1, 'America/Chicago', 'Springfield', index]);
  assert.equal(searchBirthplaces(many, 'Springfield', 'US').length, 15);
});

test('country and territory choices have unique visible names and cannot be mutated by callers', () => {
  const countries = getCountries();
  assert.equal(new Set(countries.map(item => item.code)).size, countries.length);
  assert.equal(new Set(countries.map(item => item.name)).size, countries.length, 'territories need their own labels instead of repeated France entries');
  countries[0].name = 'Changed by caller';
  assert.notEqual(getCountries()[0].name, 'Changed by caller');
});

test('bundled locations produce a usable chart input for the published Brussels fixture', async () => {
  const data = JSON.parse(await readFile(new URL('../assets/birth-cities.json', import.meta.url), 'utf8'));
  const place = searchBirthplaces(data, 'Brussels', 'BE')[0];
  assert.equal(place.countryCode, 'BE');
  assert.equal(place.timeZone, 'Europe/Brussels');
  assert.ok(Number.isFinite(place.latitude) && Number.isFinite(place.longitude));
  assert.match(place.label, /Brussels.*Belgium/);
});

test('place lookup downloads only the static dataset once and never transmits the search text', async () => {
  const original = globalThis.fetch;
  const calls = [];
  try {
    globalThis.fetch = async (url, options) => { calls.push({ url: String(url), options }); return { ok: true, json: async () => rows }; };
    const { findBirthplaces } = await import('../places.js?test-local-search');
    assert.deepEqual(await findBirthplaces('P', 'FR'), []);
    assert.deepEqual(await findBirthplaces('Paris', ''), []);
    assert.equal(calls.length, 0);
    const [paris, saoPaulo] = await Promise.all([findBirthplaces('Paris', 'FR'), findBirthplaces('São Paulo', 'BR')]);
    assert.equal(paris[0].countryCode, 'FR');
    assert.equal(saoPaulo[0].countryCode, 'BR');
    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /\/assets\/birth-cities\.json$/);
    assert.equal(calls[0].options.credentials, 'omit');
    assert.equal(new URL(calls[0].url).search, '');
    assert.equal(calls[0].options.body, undefined);
    await findBirthplaces('Paris', 'CA');
    assert.equal(calls.length, 1, 'subsequent searches use the downloaded data');
  } finally { globalThis.fetch = original; }
});

test('a failed city-list download can be retried and offers manual entry', async () => {
  const original = globalThis.fetch;
  let attempts = 0;
  try {
    globalThis.fetch = async () => ({ ok: ++attempts > 1, json: async () => rows });
    const { findBirthplaces } = await import('../places.js?test-retry');
    await assert.rejects(findBirthplaces('Paris', 'FR'), /enter your birthplace and time zone manually/);
    assert.equal((await findBirthplaces('Paris', 'FR'))[0].countryCode, 'FR');
    assert.equal(attempts, 2);
  } finally { globalThis.fetch = original; }
});
