import { traditionsData } from './traditions.js';
export const REPORT_VERSION = '2026-11-23-guide-1';
export const CONSENT_VERSION = '2026-11-23';
export const REPORT_CONSENT = 'I ask Cloud Forest to email my PDF report. I agree that my answers and diary will be processed to create it, and that Cloud Forest will keep my name, email address, consent and delivery record.';
export const NEWSLETTER_CONSENT = 'I agree to receive Cloud Forest newsletters about rest, training and learning. I can unsubscribe at any time. By typing my full name, I sign this consent.';

export const questions = [
      {
        id: 'layout',
        q: 'How did you usually get most of your sleep?',
        help: 'If you work nights, count your daytime sleep. A quick bathroom break counts as part of the same stretch.',
        opts: [
          { l: 'A', t: 'One main sleep, with or without naps' },
          { l: 'B', t: 'My main sleep was split in two, with a long break awake between' },
          { l: 'C', t: 'Three or more shorter sleeps around the clock, with no main stretch' },
          { l: 'D', t: 'I switched between patterns' },
          { l: 'E', t: 'I can’t remember' }
        ]
      },
      {
        id: 'naps',
        q: 'On how many of the last 14 days did you nap?',
        opts: [
          { l: 'A', t: '0 days' },
          { l: 'B', t: '1–7 days' },
          { l: 'C', t: '8–14 days' },
          { l: 'D', t: 'I can’t remember' }
        ]
      },
      {
        id: 'napType',
        q: 'What were your naps usually like?',
        opts: [
          { l: 'A', t: 'One nap, 30 minutes or less' },
          { l: 'B', t: 'One nap, 31–59 minutes' },
          { l: 'C', t: 'One nap, an hour or more around midday' },
          { l: 'D', t: 'One nap, an hour or more at another time' },
          { l: 'E', t: 'Two or more naps' },
          { l: 'F', t: 'It varied from day to day' }
        ]
      },
      {
        id: 'total',
        type: 'duration',
        q: 'How much sleep did you usually get in 24 hours?',
        help: 'Include naps. Your best estimate is fine.'
      },
      {
        id: 'alertness',
        q: 'Did you stay awake most afternoons?',
        opts: [
          { l: 'A', t: 'I stayed awake easily' },
          { l: 'B', t: 'I stayed awake, but it took effort' },
          { l: 'C', t: 'I dozed off without meaning to' },
          { l: 'D', t: 'I was asleep as part of my usual schedule' },
          { l: 'E', t: 'There was no usual pattern' }
        ]
      },
      {
        id: 'schedule',
        q: 'Which schedule comes closest to yours?',
        opts: [
          { l: 'B', t: 'Three sleeps of 90 minutes to 2 hours each, evenly spaced' },
          { l: 'C', t: 'One 3-hour sleep plus three 20-minute naps' },
          { l: 'E', t: 'Six 20-minute naps or four 30-minute naps, evenly spaced across 24 hours' },
          { l: 'A', t: 'No clear match' }
        ]
      }
    ];

export function assessPattern(answers) {
      const { layout, naps, napType, total, schedule } = answers;
      const hasTotal = Number.isInteger(total) && total > 0 && total <= 1440;
      const regularNaps = layout === 'A' && naps === 'C';
      const nap = regularNaps ? napType : undefined;
      const unclear = (reason, ...edit) => ({ key: 'unclear', reason, edit });

      // Allow 15 minutes for estimates before flagging a nap longer than the daily total.
      const minimumNap = { B: 30, C: 60, D: 60 }[nap];
      if (hasTotal && minimumNap && total < minimumNap - 15) {
        const duration = minimumNap === 60 ? 'an hour or more' : 'over half an hour';
        return unclear(`You described a nap of ${duration}. Your 24-hour total should include that nap and your main sleep.`, 'napType', 'total');
      }

      // Compare only schedules explicitly chosen on the active route. The limits
      // are their stated durations in minutes, with leeway for the visitor's estimate.
      const schedules = {
        B: { key: 'triphasic', layout: 'C', min: 270, max: 360, leeway: 45,
          reason: 'Three sleeps of 90 minutes to two hours add up to about four and a half to six hours. Check which schedule or total fits your usual day.' },
        C: { key: 'everyman', layout: 'A', min: 240, max: 240, leeway: 45,
          reason: 'A three-hour sleep and three 20-minute naps add up to about four hours. Check which schedule or total fits your usual day.' },
        E: { key: 'uberman', layout: 'C', min: 120, max: 120, leeway: 30,
          reason: 'Six 20-minute naps or four half-hour naps add up to about two hours. Check which schedule or total fits your usual day.' }
      };
      const eligible = layout === 'C' || (regularNaps && nap === 'E');
      const selected = eligible && schedules[schedule];
      if (selected && selected.layout === layout) {
        if (hasTotal && (total < selected.min - selected.leeway || total > selected.max + selected.leeway)) {
          return unclear(selected.reason, 'total', 'schedule');
        }
        return { key: selected.key };
      }

      if (layout === 'D') return { key: 'irregular' };
      if (layout === 'C') return { key: 'polyphasic_other' };
      if (layout === 'B') return { key: naps === 'C' ? 'segmented_naps' : 'segmented' };
      if (layout === 'A') {
        if (naps === 'A') return { key: 'monophasic' };
        if (naps === 'B') return { key: 'occasional_naps' };
        const napResults = {
          A: 'biphasic_nap', B: 'biphasic_other', C: 'biphasic_siesta',
          D: 'biphasic_other', E: 'polyphasic_other'
        };
        return { key: napResults[nap] || 'main_sleep' };
      }
      return unclear('There are too few details to describe a usual sleep pattern. You can revisit the first question if one of the choices sounds familiar.', 'layout');
    }

export const observationQuestions = [
  { id: 'ageBand', q: 'Your age range', opts: [
    { l: '18_60', t: '18–60' }, { l: '61_64', t: '61–64' }, { l: '65_plus', t: '65 or older' },
    { l: 'under18', t: 'Under 18' }, { l: 'unknown', t: 'Prefer to skip' }
  ]},
  { id: 'timing', q: 'How much do your usual sleep and wake times change from day to day?', opts: [
    { l: 'steady', t: 'By less than 30 minutes' }, { l: 'within_hour', t: 'By 30 minutes to one hour' },
    { l: 'variable', t: 'By more than an hour' },
    { l: 'unknown', t: 'I’m not sure' }
  ]},
  { id: 'chronotype', q: 'When would you prefer to sleep and wake without work or family obligations?', opts: [
    { l: 'early', t: 'Early to bed, early to rise' }, { l: 'middle', t: 'Somewhere in the middle' },
    { l: 'late', t: 'Later to bed, later to rise' }, { l: 'variable', t: 'It changes' }, { l: 'unknown', t: 'I’m not sure' }
  ]},
  { id: 'waking', q: 'What is waking during your main sleep usually like?', opts: [
    { l: 'none', t: 'I usually sleep through' }, { l: 'brief', t: 'I wake briefly and return to sleep easily' },
    { l: 'settled', t: 'I’m awake for a while and feel comfortable' }, { l: 'trouble', t: 'I want to sleep and struggle to get back to sleep' },
    { l: 'unknown', t: 'It varies, or I’m not sure' }
  ]},
  { id: 'sleepOnset', q: 'How long does it usually take you to fall asleep?', opts: [
    { l: 'under30', t: 'About half an hour or less' }, { l: 'over30', t: 'More than half an hour' },
    { l: 'variable', t: 'It varies' }, { l: 'unknown', t: 'I’m not sure' }
  ]},
  { id: 'sleepyDriving', q: 'Have you recently struggled to stay awake while driving?', opts: [
    { l: 'yes', t: 'Yes' }, { l: 'no', t: 'No' }, { l: 'unknown', t: 'I don’t drive, or I’m unsure' }
  ]}
];
export const breathingOptions = [
  { l: 'snoring', t: 'Frequent loud snoring' }, { l: 'pauses', t: 'Someone noticed pauses in my breathing' },
  { l: 'gasping', t: 'Gasping during sleep' }, { l: 'headaches', t: 'Morning headaches' }
];

export function activeQuestions(answers = {}) {
  return questions.filter(question => {
    if (question.id === 'naps') return ['A', 'B'].includes(answers.layout);
    if (question.id === 'napType') return answers.layout === 'A' && answers.naps === 'C';
    if (question.id === 'schedule') return answers.layout === 'C' ||
      (answers.layout === 'A' && answers.naps === 'C' && answers.napType === 'E');
    return true;
  });
}
export function optionsFor(question, answers) {
  if (question.id !== 'schedule') return question.opts;
  const choices = answers.layout === 'C' ? ['A','B','E'] : ['A','C'];
  return question.opts.filter(option => choices.includes(option.l));
}
export function answerLabel(question, answers) {
  if (question.id === 'total') {
    if (answers.total === 'unknown') return 'Couldn’t estimate';
    const hours = Math.floor(answers.total / 60);
    const minutes = answers.total % 60;
    return [hours && hours + (hours === 1 ? ' hour' : ' hours'), minutes && minutes + (minutes === 1 ? ' minute' : ' minutes')].filter(Boolean).join(' ');
  }
  return question.opts.find(option => option.l === answers[question.id])?.t || '';
}
function object(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}
export function validateAssessment(payload) {
  if (!object(payload) || !object(payload.answers)) throw new Error('Complete the sleep questions before requesting a report.');
  const raw = payload.answers;
  if (raw.ageBand === 'under18') throw new Error('This report and email signup are designed for adults.');
  const answers = {};
  for (const question of activeQuestions(raw)) {
    const value = raw[question.id];
    if (question.type === 'duration') {
      if (value !== 'unknown' && (!Number.isInteger(value) || value < 1 || value > 1440)) throw new Error('Enter a total between one minute and 24 hours, or choose that you are unsure.');
    } else if (!optionsFor(question, raw).some(option => option.l === value)) {
      throw new Error('Please answer “' + question.q + '”');
    }
    answers[question.id] = value;
  }
  for (const question of observationQuestions) {
    if (raw[question.id] === undefined || raw[question.id] === '') continue;
    if (!question.opts.some(option => option.l === raw[question.id])) throw new Error('Review your additional sleep observations.');
    answers[question.id] = raw[question.id];
  }
  if (raw.apneaSigns !== undefined) {
    if (!Array.isArray(raw.apneaSigns) || raw.apneaSigns.length > 4 ||
      !raw.apneaSigns.every(value => breathingOptions.some(option => option.l === value))) throw new Error('Review your sleep observations.');
    answers.apneaSigns = [...new Set(raw.apneaSigns)];
  }
  const selection = payload.traditionsSelection || {};
  if (!object(selection)) throw new Error('Review the optional tradition selections.');
  const groups = {
    western: traditionsData.western.signs,
    chinese: traditionsData.chinese.animals,
    humanDesign: traditionsData.humanDesign.types
  };
  const traditionsSelection = {};
  for (const [id, list] of Object.entries(groups)) {
    if (!selection[id]) continue;
    if (!list.some(item => item.id === selection[id])) throw new Error('Review the optional tradition selections.');
    traditionsSelection[id] = selection[id];
  }
  const rawDiary = payload.diary || [];
  if (!Array.isArray(rawDiary) || rawDiary.length > 14) throw new Error('The diary can include up to 14 days.');
  const diary = rawDiary.map(row => {
    if (!object(row) || !/^\d{4}-\d{2}-\d{2}$/.test(row.date) || isNaN(Date.parse(row.date + 'T12:00:00Z')) || new Date(row.date + 'T12:00:00Z').toISOString().slice(0,10)!==row.date) throw new Error('Check the diary dates.');
    if (![row.mainMinutes, row.napMinutes].every(n => Number.isInteger(n) && n >= 0 && n <= 1440) ||
      row.mainMinutes + row.napMinutes > 1440) throw new Error('Check that each diary total fits within 24 hours.');
    const energy = ['rested','mixed','sleepy',''].includes(row.energy) ? row.energy : '';
    return { date: row.date, mainMinutes: row.mainMinutes, napMinutes: row.napMinutes, energy };
  });
  if (new Set(diary.map(row => row.date)).size !== diary.length) throw new Error('Each diary date should appear once.');
  return { answers, traditionsSelection, diary };
}
