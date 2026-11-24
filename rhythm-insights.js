const hours = {
  early: 'earlier sleep and waking',
  middle: 'sleep and waking somewhere between early and late hours',
  late: 'later sleep and waking',
  variable: 'different sleep hours at different times'
};
const typeTeachings = {
  generator: ['Generator', 'using the day’s energy and noticing when tiredness arrives'],
  manifesting_generator: ['Manifesting Generator', 'settling the urge to keep working and allowing rest between demanding periods'],
  projector: ['Projector', 'making room for quiet rest before exhaustion'],
  manifestor: ['Manifestor', 'allowing recovery after periods of activity'],
  reflector: ['Reflector', 'observing how surroundings and changing circumstances affect rest']
};
const barriers = {
  mental: {
    title: 'Unfinished thoughts make settling harder',
    text: 'You chose ideas, planning or unfinished tasks as your biggest settling obstacle. This identifies something you experience directly, whatever your birth profiles say.',
    observation: ['Notice when thoughts continue into bedtime', 'Record what was on your mind before sleep and whether writing down tomorrow’s tasks helped you leave them for the next day.']
  },
  physical: {
    title: 'Comfort is a practical part of your rest',
    text: 'You chose physical discomfort or tension as your biggest settling obstacle. Note what feels uncomfortable, when it occurs and whether it interrupts rest.',
    observation: ['Record discomfort and comfort', 'Note when discomfort or tension makes it difficult to settle, how long it lasts, and what helps you feel more comfortable. Keep this alongside your sleep times.']
  },
  emotional: {
    title: 'Worry or strong feelings affect settling',
    text: 'You chose worry or strong feelings as your biggest settling obstacle. The particular circumstances and how long those feelings stay with you are useful details to observe.',
    observation: ['Notice what remains unsettled', 'Record the evening circumstance, how you felt and what helped you feel settled. Look for repeated situations across ordinary days.']
  },
  environment: {
    title: 'Your surroundings can get in the way',
    text: 'You chose noise, light or interruptions as your biggest settling obstacle. This points to a circumstance in your sleeping environment; it does not establish a personality trait.',
    observation: ['Observe one disturbance', 'Record the specific disturbance and when it affects rest. If you change something practical in the room, compare several otherwise ordinary nights.']
  },
  obligations: {
    title: 'Responsibilities compete with rest',
    text: 'You chose work, caregiving or other commitments as your biggest settling obstacle. The arrangement you keep may reflect the time available to you as well as your preferences.',
    observation: ['Compare wanted and available sleep', 'On a busy day and a less restricted day, record the hours you wanted to sleep, the time available and which commitment changed it.']
  }
};

/** Describe reported fit and practical questions without inventing personality scores or changing sleep classification. */
export function buildRhythmInsights(answers = {}, selection = {}, observed = {}, chart = null) {
  const findings = [];
  const observations = [];
  const add = (kind, title, text, evidence) => findings.push({ kind, title, text, evidence });
  const observe = (title, text) => observations.push({ title, text });
  const shortSleep = Number.isInteger(answers.total) && answers.total > 0 && answers.total < 420;
  const dozing = answers.alertness === 'C';
  const driving = answers.sleepyDriving === 'yes';
  if (shortSleep || dozing || driving) {
    const statements = [];
    const evidence = [];
    if (shortSleep) { statements.push('Your reported total is below seven hours in 24 hours.'); evidence.push('total'); }
    if (dozing) { statements.push('You reported dozing when you intended to stay awake.'); evidence.push('alertness'); }
    if (driving) { statements.push('You reported struggling to stay awake while driving.'); evidence.push('sleepyDriving'); }
    statements.push('Review the duration and alertness guidance in your sleep evaluation before experimenting with a schedule. A sign or Human Design type does not change these reported observations.');
    add('tension', shortSleep && (dozing || driving) ? 'Start with sleep amount and unwanted sleepiness' : shortSleep ? 'Start with your reported sleep amount' : 'Give unwanted sleepiness priority', statements.join(' '), evidence);
    observe('Use the sleep evaluation first', 'Keep the amount of sleep and daytime alertness in view as you use the diary. Bring these observations into any discussion of a different routine.');
  }

  const preferred = Object.hasOwn(hours, answers.chronotype) ? hours[answers.chronotype] : null;
  const preferenceText = preferred ? 'You prefer ' + preferred + '. ' : '';
  if (answers.scheduleFit === 'match') {
    add('support', 'Your usual hours fit your preference', preferenceText + 'You said your usual sleep hours match the hours you would choose. That reported fit is one part of the picture; total sleep, comfort and daytime alertness still matter.', preferred ? ['chronotype', 'scheduleFit'] : ['scheduleFit']);
  } else if (answers.scheduleFit === 'partly' || answers.scheduleFit === 'rarely') {
    const partial = answers.scheduleFit === 'partly';
    add('tension', partial ? 'Your hours only partly fit your preference' : 'Your usual hours rarely fit your preference', preferenceText + (partial ? 'You said your usual hours only partly match the hours you would choose.' : 'You said your usual hours rarely match the hours you would choose.') + ' Record what creates the difference before attributing it to personality or a traditional profile.', preferred ? ['chronotype', 'scheduleFit'] : ['scheduleFit']);
    observe('Compare preferred and actual hours', 'Record a day with fixed commitments and a day with more choice. Compare the hours you wanted, the hours you slept and how you felt the next day.');
  } else if (preferred) {
    add('reflection', 'Your preferred timing gives the comparison a starting point', preferenceText + (answers.scheduleFit === 'unknown' ? 'You were unsure how closely your current hours match that preference.' : 'You have not described how closely your current hours match that preference.') + ' Compare your preferred and actual hours in the diary.', answers.scheduleFit === 'unknown' ? ['chronotype', 'scheduleFit'] : ['chronotype']);
  }

  const changingHours = answers.timing === 'variable';
  const changingPattern = answers.layout === 'D';
  const fairlyConsistent = ['steady', 'within_hour'].includes(answers.timing);
  if (answers.routinePreference === 'routine' && (changingHours || changingPattern)) {
    const description = changingHours ? 'your sleep and wake times change by more than an hour' : 'you switch between sleep patterns';
    add('tension', 'Your preference for routine meets a changing pattern', 'You prefer to return to your usual routine, while ' + description + '. Notice whether chosen changes feel different from changes imposed by circumstances.', ['routinePreference', changingHours ? 'timing' : 'layout']);
    observe('Separate chosen and required changes', 'When your routine changes, note whether you chose the change and how settling, total sleep and alertness were affected.');
  } else if (answers.routinePreference === 'routine' && fairlyConsistent) {
    add('support', 'Familiarity and reported timing fit together', 'You prefer returning to your usual routine and report sleep and wake times that change by no more than an hour. Those answers describe some agreement between your preference and your current timing.', ['routinePreference', 'timing']);
  } else if (answers.routinePreference === 'change' && (changingHours || changingPattern)) {
    add('reflection', 'You welcome change and report a changing routine', 'You welcome changes in routine and also describe changes in your sleep. Check whether each change leaves enough time for sleep and supports daytime alertness; welcoming variety does not establish a need for less sleep.', ['routinePreference', changingHours ? 'timing' : 'layout']);
  } else if (answers.routinePreference === 'change' && fairlyConsistent) {
    add('reflection', 'A flexible preference can coexist with regular hours', 'You welcome changes in routine while reporting fairly consistent sleep and wake times. Those answers can coexist. Observe which parts of the day benefit from flexibility and which parts help you settle when they are familiar.', ['routinePreference', 'timing']);
  }

  const barrier = Object.hasOwn(barriers, answers.restChallenge) ? barriers[answers.restChallenge] : null;
  if (barrier) {
    add('tension', barrier.title, barrier.text, ['restChallenge']);
    observe(...barrier.observation);
  } else if (answers.restChallenge === 'none') {
    add('support', 'You did not identify a settling barrier', 'You did not select a usual obstacle to settling for sleep. Notice what is working in those ordinary evenings, alongside any separate concerns about sleep amount or daytime alertness.', ['restChallenge']);
  }

  if (answers.socialRecovery === 'alone') {
    add('reflection', 'Time on your own helps you recharge', 'You said time on your own is most helpful after a socially busy day. That is a recovery preference you reported. Observe whether having some quiet transition time changes how you settle for sleep.', ['socialRecovery']);
    observe('Notice the transition after social time', 'Record whether you had the time on your own that you wanted, how settled you felt and when you went to sleep.');
  } else if (answers.socialRecovery === 'people') {
    add('reflection', 'Connection helps you recharge', 'You said time with other people is most helpful after a socially busy day. Observe which kinds of company feel restorative and how their timing fits the hours you want for sleep.', ['socialRecovery']);
    observe('Notice which company feels restorative', 'Record the kind of social time you chose, how you felt afterward and whether it left room for the sleep you wanted.');
  } else if (answers.socialRecovery === 'varies') {
    add('open', 'What helps you recharge depends on the day', 'You said your preferred recovery after social activity varies. Note the day’s demands and whether time alone, company or another circumstance helped you feel ready to rest.', ['socialRecovery']);
  }

  const candidateType = chart?.humanDesign?.type || selection.humanDesign;
  const teaching = Object.hasOwn(typeTeachings, candidateType) ? typeTeachings[candidateType] : null;
  if (answers.energyStyle === 'bursts') {
    let text = 'You described strong bursts of activity followed by a need to rest. Record when those bursts occur and whether the pauses leave you feeling restored.';
    if (teaching) text += ' In the guide’s Human Design interpretation, ' + teaching[0] + ' emphasizes ' + teaching[1] + '. You can compare that traditional theme with your experience; agreement does not verify a type or establish a sleep requirement.';
    add('reflection', 'Your reported energy comes in bursts', text, ['energyStyle']);
  } else if (answers.energyStyle === 'steady') {
    add('reflection', 'You describe fairly steady energy', 'You described your energy as fairly steady. Compare how that feels after different amounts of sleep and different daily demands, without assuming the same energy will be available every day.', ['energyStyle']);
  } else if (answers.energyStyle === 'variable') {
    add('open', 'Your energy changes across days', 'You described energy that changes a lot from day to day. Sleep opportunity, demands and the day’s circumstances are useful details to record alongside that variation.', ['energyStyle']);
  }

  // Keep the most immediate observations first. Safety findings never fall off
  // the end when a visitor supplied all optional profile answers.
  const selectedFindings = findings.slice(0, 6);
  return {
    title: 'Where your preferences fit your sleep',
    introduction: 'These comparisons use the experiences you reported. Traditional themes can provide questions to explore, while your sleep record shows how a routine is working for you.',
    findings: selectedFindings,
    observations: observations.slice(0, 3)
  };
}
