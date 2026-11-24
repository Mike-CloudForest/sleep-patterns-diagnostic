import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRhythmInsights } from '../rhythm-insights.js';

const findEvidence = (report, id) => report.findings.find(item => item.evidence.includes(id));

test('changing only schedule fit changes support into tension without inventing a cause or direction', () => {
  const base = { chronotype: 'late', scheduleFit: 'match' };
  const matched = findEvidence(buildRhythmInsights(base), 'scheduleFit');
  const mismatched = findEvidence(buildRhythmInsights({ ...base, scheduleFit: 'rarely' }), 'scheduleFit');
  assert.equal(matched.kind, 'support');
  assert.equal(mismatched.kind, 'tension');
  assert.match(mismatched.text, /prefer later sleep and waking/);
  assert.doesNotMatch(mismatched.text, /early alarm|shift work|caregiving|must wake early/i);
});

test('missing experience answers do not invent findings from a birth type or observed pattern', () => {
  const report = buildRhythmInsights({}, { western: 'aries', chinese: 'tiger', humanDesign: 'generator' }, { key: 'irregular', name: 'A changing sleep pattern' });
  assert.deepEqual(report.findings, []);
  assert.deepEqual(report.observations, []);
});

test('routine preference is compared with actual timing, without treating one main sleep as a regular schedule', () => {
  assert.equal(findEvidence(buildRhythmInsights({ routinePreference: 'routine', layout: 'A' }), 'routinePreference'), undefined);
  const changing = findEvidence(buildRhythmInsights({ routinePreference: 'routine', timing: 'variable' }), 'routinePreference');
  const regular = findEvidence(buildRhythmInsights({ routinePreference: 'routine', timing: 'steady' }), 'routinePreference');
  assert.equal(changing.kind, 'tension');
  assert.equal(regular.kind, 'support');
});

test('welcoming change does not create a recommendation to reduce sleep', () => {
  const finding = findEvidence(buildRhythmInsights({ routinePreference: 'change', layout: 'D' }), 'routinePreference');
  assert.equal(finding.kind, 'reflection');
  assert.match(finding.text, /does not establish a need for less sleep/);
});

test('social recovery produces a concrete observation without assigning a personality type', () => {
  const alone = buildRhythmInsights({ socialRecovery: 'alone' });
  const people = buildRhythmInsights({ socialRecovery: 'people' });
  assert.notEqual(findEvidence(alone, 'socialRecovery').title, findEvidence(people, 'socialRecovery').title);
  assert.equal(alone.observations.length, 1);
  assert.equal(people.observations.length, 1);
  assert.doesNotMatch(JSON.stringify([alone, people]), /introvert|extrovert|diagnos|personality type/i);
});

test('physical discomfort is never transformed into activity advice or a natal agreement', () => {
  const report = buildRhythmInsights({ restChallenge: 'physical' }, { western: 'aries', chinese: 'tiger', humanDesign: 'generator' });
  const content = JSON.stringify(report);
  assert.match(content, /discomfort or tension/);
  assert.doesNotMatch(content, /Aries|Tiger|Generator|work out|exercise|physical activation|activity timing|use.*energy/i);
});

test('duration and unwanted dozing retain priority for every Human Design type', () => {
  const types = ['generator', 'manifesting_generator', 'projector', 'manifestor', 'reflector'];
  const answers = { total: 300, alertness: 'C', scheduleFit: 'match', routinePreference: 'routine', timing: 'steady', restChallenge: 'none', socialRecovery: 'alone', energyStyle: 'bursts' };
  const reports = types.map(humanDesign => buildRhythmInsights(answers, { humanDesign }));
  for (const report of reports) {
    assert.deepEqual(report.findings[0].evidence, ['total', 'alertness']);
    assert.equal(report.findings[0].kind, 'tension');
    assert.ok(report.findings.length <= 6);
    assert.match(report.findings[0].text, /before experimenting with a schedule/);
    assert.deepEqual(report.findings[0], reports[0].findings[0]);
  }
});

test('a traditional energy comparison is qualified and requires a reported energy pattern', () => {
  assert.equal(findEvidence(buildRhythmInsights({}, { humanDesign: 'projector' }), 'energyStyle'), undefined);
  const finding = findEvidence(buildRhythmInsights({ energyStyle: 'bursts' }, { humanDesign: 'projector' }), 'energyStyle');
  assert.match(finding.text, /guide’s Human Design interpretation/);
  assert.match(finding.text, /Projector/);
  assert.match(finding.text, /does not verify a type or establish a sleep requirement/);
});

test('the supplied calculated chart takes precedence over a stale manually selected type', () => {
  const report = buildRhythmInsights({ energyStyle: 'bursts' }, { humanDesign: 'generator' }, {}, { humanDesign: { type: 'manifestor' } });
  const finding = findEvidence(report, 'energyStyle');
  assert.match(finding.text, /Manifestor/);
  assert.doesNotMatch(finding.text, /Generator/);
});

test('all supplied experience fields produce at most six focused findings and three observations', () => {
  const answers = { chronotype: 'early', scheduleFit: 'partly', routinePreference: 'routine', timing: 'variable', restChallenge: 'mental', socialRecovery: 'people', energyStyle: 'bursts' };
  const report = buildRhythmInsights(answers, { humanDesign: 'manifesting_generator' });
  assert.equal(report.findings.length, 5);
  assert.equal(report.observations.length, 3);
  for (const finding of report.findings) {
    assert.ok(finding.evidence.length);
    assert.ok(finding.evidence.every(id => Object.hasOwn(answers, id)));
  }
});

test('the model is deterministic and does not mutate supplied answers or chart selections', () => {
  const answers = { chronotype: 'late', scheduleFit: 'rarely', socialRecovery: 'alone', energyStyle: 'bursts' };
  const selection = { humanDesign: 'projector' };
  const chart = { humanDesign: { type: 'projector' } };
  const before = JSON.stringify({ answers, selection, chart });
  assert.deepEqual(buildRhythmInsights(answers, selection, {}, chart), buildRhythmInsights(answers, selection, {}, chart));
  assert.equal(JSON.stringify({ answers, selection, chart }), before);
});
