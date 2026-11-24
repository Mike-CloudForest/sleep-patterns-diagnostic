import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBirthChart } from '../birth-chart.js';
import { validateChartSummary, chartSelection, normalizeBirthDetails, validateSavedProfile } from '../profile-data.js';

const NOW = new Date('2026-11-24T12:00:00Z');
const birth = {
  date: '1992-12-09', time: '00:35', timeAccuracy: 'exact',
  place: { label: 'Brussels, Belgium', timeZone: 'Europe/Brussels', countryCode: 'BE', latitude: 50.85, longitude: 4.35 }
};
const chart = calculateBirthChart(birth, { now: NOW });
const clone = value => structuredClone(value);
const normalize = value => normalizeBirthDetails(value, NOW);
const save = value => validateSavedProfile(value, { now: NOW });

test('validated chart reports preserve derived data without retaining the birth input', () => {
  const input = clone(chart);
  const result = validateChartSummary(input);
  assert.deepEqual(result, chart);
  assert.notEqual(result, input);
  assert.notEqual(result.humanDesign.activations.personality, input.humanDesign.activations.personality);
  assert.deepEqual(Object.keys(result).sort(), ['humanDesign', 'precision', 'version', 'warnings', 'western']);
  for (const raw of [birth.date, birth.time, birth.place.label, birth.place.timeZone]) {
    assert.equal(JSON.stringify(result).includes(raw), false, raw + ' must stay in the separate saved-profile path');
  }
  assert.equal(validateChartSummary(null), null);
  assert.equal(validateChartSummary(undefined), null);
});

test('derived chart schema rejects additional raw or unsupported fields at every level', () => {
  const changes = [
    value => { value.birthDetails = clone(birth); },
    value => { value.western.birthDate = birth.date; },
    value => { value.western.sun.longitude = 257; },
    value => { value.humanDesign.birthTime = birth.time; },
    value => { value.humanDesign.activations.personality[0].color = 2; },
    value => { value.humanDesign.channels[0].birthplace = birth.place.label; },
    value => { value.version = 'unknown-version'; },
    value => { value.precision = 'certain'; }
  ];
  for (const change of changes) {
    const input = clone(chart);
    change(input);
    assert.throws(() => validateChartSummary(input), /Recalculate/);
  }
});

test('chart summaries cannot assert a different type, authority, profile or definition from their gates', () => {
  for (const [field, replacement] of [['type', 'reflector'], ['authority', 'sacral'], ['profile', '4/6'], ['definition', 'split']]) {
    const input = clone(chart);
    input.humanDesign[field] = replacement;
    assert.throws(() => validateChartSummary(input), /Recalculate/, field);
  }
  const missingConnection = clone(chart);
  missingConnection.humanDesign.channels.pop();
  assert.throws(() => validateChartSummary(missingConnection), /Recalculate/);
  const missingCenter = clone(chart);
  missingCenter.humanDesign.definedCenters.pop();
  assert.throws(() => validateChartSummary(missingCenter), /Recalculate/);
});

test('each side must contain thirteen distinct known planets with valid gates and lines', () => {
  const changes = [
    value => value.humanDesign.activations.personality.pop(),
    value => { value.humanDesign.activations.design[0].body = value.humanDesign.activations.design[1].body; },
    value => { value.humanDesign.activations.design[0].body = 'ascendant'; },
    value => { value.humanDesign.activations.personality[0].gate = 65; },
    value => { value.humanDesign.activations.personality[0].gate = 1.5; },
    value => { value.humanDesign.activations.personality[0].line = 0; },
    value => { value.humanDesign.activations.personality[0].line = 7; }
  ];
  for (const change of changes) {
    const input = clone(chart);
    change(input);
    assert.throws(() => validateChartSummary(input), /Recalculate/);
  }
});

test('display names and relationship order are canonicalized rather than trusted from requests', () => {
  const input = clone(chart);
  input.western.sun.name = '<script>invented sign</script>';
  input.humanDesign.typeName = 'Sleep diagnosis';
  input.humanDesign.authorityName = 'Invented authority';
  input.humanDesign.definedCenters.reverse();
  input.humanDesign.channels.reverse();
  assert.deepEqual(validateChartSummary(input), chart);
  const selection = { chinese: 'monkey', western: 'aries', humanDesign: 'reflector' };
  assert.deepEqual(chartSelection(chart, selection), {
    chinese: 'monkey', western: 'sagittarius', westernBasis: 'calculated',
    humanDesign: 'manifestor', humanDesignBasis: 'calculated'
  });
  assert.equal(selection.western, 'aries', 'caller input is not mutated');
});

test('unknown birth time stays unknown and manual places require no invented coordinates', () => {
  const input = { date: birth.date, time: '12:00', timeAccuracy: 'unknown', place: null };
  assert.deepEqual(normalize(input), { date: birth.date, time: '', timeAccuracy: 'unknown', place: null });
  assert.equal(input.time, '12:00');
  assert.deepEqual(normalize({ date: birth.date }), { date: birth.date, time: '', timeAccuracy: 'unknown', place: null });
  const manual = normalize({ ...birth, place: { label: '  Brussels, Belgium  ', timeZone: 'Europe/Brussels', countryCode: 'be' } });
  assert.deepEqual(manual.place, { label: 'Brussels, Belgium', timeZone: 'Europe/Brussels', countryCode: 'BE' });
  assert.equal(normalize(null), null);
});

test('saved birth data rejects invalid calendars, underage dates, unknown fields and unsafe locations', () => {
  for (const date of ['1899-12-31', '2001-02-29', '2027-01-01', '2008-11-25']) {
    assert.throws(() => normalize({ ...birth, date }), undefined, date);
  }
  assert.equal(normalize({ ...birth, date: '2008-11-24' }).date, '2008-11-24', 'eighteenth birthday is eligible');
  const invalid = [
    { ...birth, email: 'extra@example.invalid' },
    { ...birth, time: '24:00' },
    { ...birth, time: '12:60' },
    { ...birth, timeAccuracy: 'guessed' },
    { ...birth, timeOccurrence: 'middle' },
    { ...birth, place: { ...birth.place, postalAddress: 'Extra data' } },
    { ...birth, place: { ...birth.place, timeZone: 'Not/A_Timezone' } },
    { ...birth, place: { ...birth.place, label: 'Brussels\nextra' } },
    { ...birth, place: { label: 'Brussels', timeZone: 'Europe/Brussels', latitude: 50 } },
    { ...birth, place: { ...birth.place, longitude: 181 } },
    { ...birth, place: { ...birth.place, latitude: NaN } }
  ];
  for (const input of invalid) assert.throws(() => normalize(input));
});

test('date-only saves provide the Chinese year and a cautious Sun estimate without fabricating a chart', async () => {
  const result = await save({ birthDetails: { date: '2000-01-01' }, chart: null });
  assert.equal(result.chart, null);
  assert.equal(result.birthDetails.time, '');
  assert.deepEqual(result.traditionsSelection, {
    western: 'capricorn', westernBasis: 'date_range', chinese: 'rabbit', chineseBasis: 'lunar_new_year',
    chineseYear: 1999, chineseElement: 'Earth', chinesePolarity: 'Yin'
  });
  assert.equal(result.ageBand, '18_60');
  const boundary = await save({ birthDetails: { date: '2000-03-21' } });
  assert.equal(Object.hasOwn(boundary.traditionsSelection, 'western'), false, 'a sign-change date needs time/place or the known-sign path');
  assert.deepEqual(await save({}), { birthDetails: null, chart: null, traditionsSelection: {}, ageBand: undefined });
});

test('saved charts are recalculated from birth details instead of trusting a valid chart from another birth', async () => {
  const other = calculateBirthChart({ ...birth, date: '1969-03-11', time: '03:00', place: { label: 'Chicago', timeZone: 'America/Chicago' } }, { now: NOW });
  assert.equal(other.humanDesign.type, 'projector');
  other.warnings = ['Injected warning that must not be retained'];
  other.western.sun = { id: 'aries', name: 'Aries' };
  const result = await save({ birthDetails: birth, chart: other });
  assert.deepEqual(result.chart, chart);
  assert.equal(result.traditionsSelection.humanDesign, 'manifestor');
  assert.equal(result.traditionsSelection.western, 'sagittarius');
  assert.equal(result.traditionsSelection.chinese, 'monkey');
});

test('saving a calculated chart requires its birth details and resolves time ambiguity explicitly', async () => {
  await assert.rejects(save({ chart }), /Include the birth details/);
  await assert.rejects(save({ birthDetails: { date: birth.date }, chart }), error => error.code === 'birth_time_unknown');
  const overlap = { ...birth, date: '1995-10-29', time: '01:30', place: { label: 'New York', timeZone: 'America/New_York' } };
  await assert.rejects(save({ birthDetails: overlap, chart }), error => error.code === 'ambiguous_birth_time');
  const result = await save({ birthDetails: { ...overlap, timeOccurrence: 'later' }, chart });
  assert.equal(result.birthDetails.timeOccurrence, 'later');
  assert.deepEqual(result.chart, calculateBirthChart({ ...overlap, timeOccurrence: 'later' }, { now: NOW }));
});

test('saved-profile age bands are calculated at birthdays instead of trusting a previous selection', async () => {
  const cases = [['1965-11-25', '18_60'], ['1965-11-24', '61_64'], ['1961-11-25', '61_64'], ['1961-11-24', '65_plus']];
  for (const [date, expected] of cases) assert.equal((await save({ birthDetails: { date } })).ageBand, expected, date);
});
