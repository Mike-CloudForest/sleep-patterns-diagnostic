import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcileDateSelection } from '../profile-ui.js';
import { validateSavedProfile } from '../profile-data.js';
import { calculateBirthChart } from '../birth-chart.js';

test('known dates reconcile conflicting manual signs with the saved-profile calculation', async () => {
  const input = { western: 'leo', westernBasis: 'selected', chinese: 'dog', chineseBasis: 'selected',
    humanDesign: 'projector', humanDesignBasis: 'selected' };
  const date = '1992-12-09';
  const selected = reconcileDateSelection(input, date);
  const saved = await validateSavedProfile({ birthDetails: { date, timeAccuracy: 'unknown' }, chart: null });
  assert.deepEqual(selected, { ...input, ...saved.traditionsSelection });
  assert.equal(selected.western, 'sagittarius');
  assert.equal(selected.chinese, 'monkey');
  assert.equal(selected.humanDesign, 'projector', 'a known Human Design type stays available without a chart');
  assert.equal(selected.humanDesignBasis, 'selected');
  assert.equal(input.western, 'leo', 'reconciliation must not mutate a prior saved selection');
  assert.ok(!JSON.stringify(selected).includes(date), 'derived selections must not contain the birth date');
});

test('missing dates preserve manually selected signs and types', () => {
  const selected = { western: 'leo', westernBasis: 'selected', chinese: 'dog', chineseBasis: 'selected',
    humanDesign: 'projector', humanDesignBasis: 'selected' };
  assert.deepEqual(reconcileDateSelection(selected, ''), selected);
});

test('date boundaries preserve adjacent confirmed signs but clear unrelated or stale date choices', () => {
  const confirmed = { western: 'aries', westernBasis: 'confirmed', humanDesign: 'manifestor', humanDesignBasis: 'selected' };
  assert.equal(reconcileDateSelection(confirmed, '2000-03-21').western, 'aries');
  assert.equal(reconcileDateSelection({ ...confirmed, western: 'pisces' }, '2000-03-21').western, 'pisces');
  assert.equal(reconcileDateSelection({ ...confirmed, western: 'leo' }, '2000-03-21').western, undefined);
  assert.equal(reconcileDateSelection(confirmed, '2000-03-21', { dateChanged: true }).western, undefined);
  assert.equal(reconcileDateSelection({ western: 'aries', westernBasis: 'date_range' }, '2000-03-21').western, undefined);
});

test('a calculated chart remains authoritative while the Chinese date profile stays consistent', async () => {
  const birthDetails = { date: '1992-12-09', time: '00:35', timeAccuracy: 'exact',
    place: { label: 'Brussels, Belgium', timeZone: 'Europe/Brussels', countryCode: 'BE' } };
  const chart = calculateBirthChart(birthDetails);
  const selected = reconcileDateSelection({ western: 'leo', westernBasis: 'selected',
    chinese: 'dog', chineseBasis: 'selected', humanDesign: 'projector', humanDesignBasis: 'selected' }, birthDetails.date, { chart });
  const saved = await validateSavedProfile({ birthDetails, chart });
  assert.deepEqual(selected, saved.traditionsSelection);
  assert.equal(selected.humanDesign, 'manifestor');
  assert.equal(selected.humanDesignBasis, 'calculated');
});
