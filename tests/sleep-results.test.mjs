import test from 'node:test';
import assert from 'node:assert/strict';
import { assessPattern, validateAssessment, activeQuestions, optionsFor } from '../assessment.js';
import { guidePatterns, guideSources, interpretAssessment } from '../guide-model.js';
import { traditionsData, getTraditionReport } from '../traditions.js';

// Expected outcomes are explicit examples of the arrangements described by the
// answers. They are deliberately independent of any sign or personality type.
const base = { ageBand: '18_60', layout: 'A', naps: 'A', total: 480, alertness: 'A' };
const cases = [
  ['one eight-hour sleep', {}, 'monophasic'],
  ['main sleep during the afternoon', { alertness: 'D' }, 'monophasic'],
  ['naps on some days', { naps: 'B' }, 'occasional_naps'],
  ['regular short nap', { naps: 'C', napType: 'A' }, 'biphasic_nap'],
  ['regular 31–59-minute nap', { naps: 'C', napType: 'B' }, 'biphasic_other'],
  ['regular long midday nap', { naps: 'C', napType: 'C' }, 'biphasic_siesta'],
  ['regular long nap at another time', { naps: 'C', napType: 'D' }, 'biphasic_other'],
  ['two main sleeps', { layout: 'B' }, 'segmented'],
  ['two main sleeps with regular naps', { layout: 'B', naps: 'C' }, 'segmented_naps'],
  ['two main sleeps with occasional naps', { layout: 'B', naps: 'B' }, 'segmented'],
  ['unknown nap frequency', { naps: 'D' }, 'main_sleep'],
  ['variable regular naps', { naps: 'C', napType: 'F' }, 'main_sleep'],
  ['changing arrangements', { layout: 'D' }, 'irregular'],
  ['insufficient arrangement information', { layout: 'E' }, 'unclear'],
  ['three similar sleeps totaling five hours', { layout: 'C', schedule: 'B', total: 300 }, 'triphasic'],
  ['three-hour core plus three short naps', { naps: 'C', napType: 'E', schedule: 'C', total: 240 }, 'everyman'],
  ['naps only totaling two hours', { layout: 'C', schedule: 'E', total: 120 }, 'uberman'],
  ['other multiple sleeps with no main sleep', { layout: 'C', schedule: 'A' }, 'polyphasic_other'],
  ['main sleep plus multiple naps', { naps: 'C', napType: 'E', schedule: 'A' }, 'polyphasic_other'],
  ['triphasic schedule and conflicting total', { layout: 'C', schedule: 'B', total: 480 }, 'unclear'],
  ['Everyman schedule and conflicting total', { naps: 'C', napType: 'E', schedule: 'C', total: 480 }, 'unclear'],
  ['naps-only schedule and conflicting total', { layout: 'C', schedule: 'E', total: 480 }, 'unclear'],
  ['long nap exceeding the full-day estimate', { naps: 'C', napType: 'C', total: 30 }, 'unclear'],
  ['known arrangement with unknown hours', { total: 'unknown' }, 'monophasic']
];

function evaluate(changes = {}, traditionsSelection = {}) {
  const safe = validateAssessment({ answers: { ...base, ...changes }, traditionsSelection });
  const assessment = assessPattern(safe.answers);
  return { ...safe, assessment, result: interpretAssessment(safe.answers, assessment) };
}

for (const [name, changes, expected] of cases) {
  test(`sleep result: ${name}`, () => {
    const { assessment, result } = evaluate(changes);
    assert.equal(assessment.key, expected);
    assert.equal(result.profile.name, guidePatterns[expected].name);
    assert.ok(result.evaluations.length > 0, 'result includes an explanation');
    assert.ok(result.actions.length > 0, 'result includes a next step');
    assert.ok(result.sourceIds.every(id => Object.hasOwn(guideSources, id)));
    if (expected === 'unclear') {
      assert.ok(assessment.reason.length > 30, 'uncertainty is explained');
      assert.ok(assessment.edit.length > 0, 'uncertainty identifies questions to review');
    }
  });
}

test('all current sleep-result categories are reached by real answer examples', () => {
  const reached = new Set(cases.map(([, changes]) => evaluate(changes).assessment.key));
  assert.deepEqual([...reached].sort(), Object.keys(guidePatterns).sort());
});

test('duration changes the evaluation without changing the reported arrangement', () => {
  for (const [total, level] of [[330, 'attention'], [480, 'steady'], [600, 'info']]) {
    const { result, assessment } = evaluate({ total });
    assert.equal(assessment.key, 'monophasic');
    assert.equal(result.evaluations.find(item => item.id === 'duration').level, level);
  }
  assert.match(evaluate({ ageBand: '65_plus', total: 510 }).result.evaluations.find(item => item.id === 'duration').title, /longer/);
  assert.match(evaluate({ total: 'unknown' }).result.evaluations.find(item => item.id === 'duration').title, /still open/);
});

test('additional observations materially change the explanation', () => {
  const { result } = evaluate({ chronotype: 'late', timing: 'variable', waking: 'trouble', sleepyDriving: 'yes', apneaSigns: ['pauses'] });
  assert.match(result.evaluations.find(item => item.id === 'chronotype').paragraphs.join(' '), /later sleep/);
  assert.equal(result.evaluations.find(item => item.id === 'driving').level, 'urgent');
  assert.equal(result.evaluations.find(item => item.id === 'settling').level, 'attention');
  assert.equal(result.evaluations.find(item => item.id === 'breathing').level, 'attention');
  assert.ok(result.evaluations.some(item => item.id === 'timing'));
});

test('hidden answers cannot override the active answer route', () => {
  const { answers, assessment } = evaluate({ napType: 'E', schedule: 'C' });
  assert.equal(assessment.key, 'monophasic');
  assert.equal(answers.napType, undefined);
  assert.equal(answers.schedule, undefined);
  const schedule = activeQuestions({ layout: 'C' }).find(item => item.id === 'schedule');
  assert.deepEqual(optionsFor(schedule, { layout: 'C' }).map(item => item.l).sort(), ['A', 'B', 'E']);
  assert.throws(() => evaluate({ layout: 'C', schedule: 'C' }), /answer/);
});

test('incomplete or invalid answers require correction', () => {
  for (const total of [0, -1, 1441, 60.5, NaN, 'eight']) assert.throws(() => evaluate({ total }));
  assert.throws(() => evaluate({ ageBand: 'under18' }), /adults/);
  assert.throws(() => evaluate({ naps: 'C', napType: undefined }), /answer/);
  assert.throws(() => evaluate({}, { western: 'not-a-sign' }), /tradition/);
});

test('all tradition combinations retain the observed sleep result', () => {
  for (const western of traditionsData.western.signs) {
    for (const chinese of traditionsData.chinese.animals) {
      for (const humanDesign of traditionsData.humanDesign.types) {
        const selection = { western: western.id, chinese: chinese.id, humanDesign: humanDesign.id };
        const { assessment } = evaluate({ layout: 'B', naps: 'C' }, selection);
        assert.equal(assessment.key, 'segmented_naps');
        const text = getTraditionReport(selection).map(section => section.title + ' ' + section.paragraphs.join(' ')).join('\n');
        for (const item of [western, chinese, humanDesign]) assert.ok(text.includes(item.name));
      }
    }
  }
});

test('rest and energy observations round-trip without assigning a Human Design type', () => {
  for (const restChallenge of ['mental', 'physical', 'emotional', 'environment', 'obligations', 'none', 'unknown']) {
    for (const energyStyle of ['steady', 'bursts', 'variable', 'unknown']) {
      const safe = evaluate({ restChallenge, energyStyle });
      assert.equal(safe.answers.restChallenge, restChallenge);
      assert.equal(safe.answers.energyStyle, energyStyle);
      assert.equal(safe.assessment.key, 'monophasic');
      assert.equal(safe.traditionsSelection.humanDesign, undefined);
    }
  }
  assert.throws(() => evaluate({ restChallenge: 'diagnosis' }), /observations/);
  assert.throws(() => evaluate({ energyStyle: 'generator' }), /observations/);
});

const chineseYears = [
  [1899, 'pig', 'Earth', 'Yin'],
  [1984, 'rat', 'Wood', 'Yang'],
  [1985, 'ox', 'Wood', 'Yin'],
  [2023, 'rabbit', 'Water', 'Yin'],
  [2024, 'dragon', 'Wood', 'Yang'],
  [2025, 'snake', 'Wood', 'Yin'],
  [2026, 'horse', 'Fire', 'Yang'],
  [2100, 'monkey', 'Metal', 'Yang']
];

function lunarSelection([chineseYear, chinese, chineseElement, chinesePolarity]) {
  return { chinese, chineseBasis: 'lunar_new_year', chineseYear, chineseElement, chinesePolarity };
}

test('derived Chinese profiles round-trip across cycle and supported-year boundaries', () => {
  for (const record of chineseYears) {
    const selection = { western: 'aquarius', westernBasis: 'date_range', ...lunarSelection(record), humanDesign: 'projector' };
    const safe = evaluate({}, selection);
    assert.deepEqual(safe.traditionsSelection, selection);
    assert.deepEqual(validateAssessment(safe).traditionsSelection, selection);
  }
});

test('Chinese derived metadata cannot claim a mismatched animal, element, polarity or year', () => {
  const valid = lunarSelection([1984, 'rat', 'Wood', 'Yang']);
  for (const changes of [
    { chinese: 'ox' }, { chineseElement: 'Fire' }, { chinesePolarity: 'Yin' },
    { chineseYear: 1985 }, { chineseYear: '1984' }, { chineseYear: 1984.5 },
    { chineseYear: 1898 }, { chineseYear: 2101 }, { chineseYear: NaN },
    { chineseYear: undefined }, { chineseElement: undefined }, { chinesePolarity: undefined },
    { chineseElement: 'wood' }, { chinesePolarity: 'yang' }
  ]) assert.throws(() => evaluate({}, { ...valid, ...changes }), /Chinese zodiac/);
});

test('manual and legacy profiles preserve known signs while dropping stale derived details', () => {
  const legacy = { western: 'taurus', chinese: 'ox', humanDesign: 'generator' };
  assert.deepEqual(evaluate({}, legacy).traditionsSelection, legacy);
  for (const westernBasis of ['date_range', 'confirmed', 'selected']) {
    assert.deepEqual(evaluate({}, { western: 'taurus', westernBasis }).traditionsSelection, { western: 'taurus', westernBasis });
  }
  for (const chineseBasis of ['selected', undefined]) {
    const raw = { chinese: 'ox', chineseYear: 1984, chineseElement: 'Fire', chinesePolarity: 'Yang', ...(chineseBasis ? { chineseBasis } : {}) };
    const original = JSON.stringify(raw);
    assert.deepEqual(evaluate({}, raw).traditionsSelection, { chinese: 'ox', ...(chineseBasis ? { chineseBasis } : {}) });
    assert.equal(JSON.stringify(raw), original, 'normalization does not mutate the browser selection');
  }
});

test('orphan metadata does not create a selected tradition profile', () => {
  const raw = { western: '', westernBasis: 'date_range', chinese: '', chineseBasis: 'lunar_new_year', chineseYear: 1984, chineseElement: 'Wood', chinesePolarity: 'Yang' };
  assert.deepEqual(evaluate({}, raw).traditionsSelection, {});
  assert.deepEqual(evaluate({}, { ...raw, humanDesign: 'projector' }).traditionsSelection, { humanDesign: 'projector' });
});

test('birth details and unexpected metadata cannot enter the selected profile payload', () => {
  for (const key of ['birthDate', 'birthTime', 'birthPlace', 'dob', 'unexpected']) {
    assert.throws(() => evaluate({}, { western: 'taurus', [key]: 'synthetic input' }), /Only selected profile details/);
  }
  for (const raw of [false, 0, '', [], 'taurus']) assert.throws(() => evaluate({}, raw), /tradition/);
  assert.throws(() => evaluate({}, { western: 'taurus', westernBasis: 'guessed' }), /Western sign/);
  assert.throws(() => evaluate({}, { chinese: 'ox', chineseBasis: 'gregorian_year' }), /Chinese zodiac/);
  const safe = validateAssessment({
    answers: { ...base, birthDate: '1984-02-02', birthTime: '12:00', birthPlace: 'Synthetic place' },
    traditionsSelection: { western: 'aquarius', westernBasis: 'confirmed' },
    birthDate: '1984-02-02', birthTime: '12:00', birthPlace: 'Synthetic place'
  });
  const serialized = JSON.stringify(safe);
  for (const value of ['birthDate', 'birthTime', 'birthPlace', '1984-02-02', '12:00', 'Synthetic place']) {
    assert.ok(!serialized.includes(value), `validated payload excludes ${value}`);
  }
});
