// Educational material based on the user's Sleep Patterns Field Guide, Part One.
// Example schedules illustrate arrangements. Personal observations supply the assessment.

export const guideSources = {
  cdcSleep: { title: 'CDC — sleep duration across ages', url: 'https://www.cdc.gov/sleep/about/' },
  aasmDuration: { title: 'AASM and Sleep Research Society — adult sleep duration', url: 'https://pubmed.ncbi.nlm.nih.gov/26039963/' },
  nsfDuration: { title: 'National Sleep Foundation — sleep duration recommendations', url: 'https://pubmed.ncbi.nlm.nih.gov/29073398/' },
  stages: { title: 'NHLBI — sleep phases and stages', url: 'https://www.nhlbi.nih.gov/health/sleep/stages-of-sleep' },
  clock: { title: 'NHLBI — your sleep and wake cycle', url: 'https://www.nhlbi.nih.gov/health/sleep/sleep-wake-cycle' },
  aging: { title: 'NHLBI — what makes you sleep', url: 'https://www.nhlbi.nih.gov/health/sleep-deprivation/body-clock' },
  habits: { title: 'NHLBI — healthy sleep habits', url: 'https://www.nhlbi.nih.gov/health/sleep-deprivation/healthy-sleep-habits' },
  naps: { title: 'NIOSH — nap duration and grogginess', url: 'https://www.cdc.gov/niosh/work-hour-training-for-nurses/longhours/mod7/05.html' },
  napTiming: { title: 'NIOSH — timing naps', url: 'https://www.cdc.gov/niosh/work-hour-training-for-nurses/longhours/mod7/04.html' },
  regularity: { title: 'Sleep timing and variability consensus panel — regularity', url: 'https://pubmed.ncbi.nlm.nih.gov/37684151/' },
  polyphasic: { title: 'Sleep timing consensus panel — reduced polyphasic schedules', url: 'https://pubmed.ncbi.nlm.nih.gov/33795195/' },
  restriction: { title: 'Van Dongen and colleagues — repeated sleep restriction', url: 'https://pubmed.ncbi.nlm.nih.gov/12683469/' },
  segmented: { title: 'Wehr — sleep under a longer period of darkness', url: 'https://pubmed.ncbi.nlm.nih.gov/10607034/' },
  history: { title: 'Ekirch — preindustrial sleep in the British Isles', url: 'https://doi.org/10.1086/ahr/106.2.343' },
  chronotype: { title: 'Wittmann and colleagues — chronotype and social jetlag', url: 'https://pubmed.ncbi.nlm.nih.gov/16687322/' },
  apnea: { title: 'NHLBI — symptoms of sleep apnea', url: 'https://www.nhlbi.nih.gov/health/sleep-apnea/symptoms' },
  sleepStudy: { title: 'NHLBI — sleep studies and sleep diaries', url: 'https://www.nhlbi.nih.gov/health/sleep-apnea/diagnosis' },
  driving: { title: 'NIOSH — driver fatigue', url: 'https://www.cdc.gov/niosh/motor-vehicle/driver-fatigue/index.html' },
  symptoms: { title: 'NIOSH — sleep symptoms to discuss with a clinician', url: 'https://www.cdc.gov/niosh/work-hour-training-for-nurses/longhours/mod6/16.html' }
};

const guideSource = pages => ({ title: 'Sleep Patterns: A Field Guide', pages });
const block = (start, end, label) => ({ start, end, label });
const example = (label, blocks, total, totalText) => ({ label, blocks, total, totalText });

export const guidePatterns = {
  monophasic: {
    name: 'Monophasic',
    overview: [
      'Most of your sleep comes in one stretch. Brief awakenings, including a bathroom trip, can happen within that stretch.',
      'The familiar overnight schedule is one example. Someone who works nights may also have a monophasic pattern when their main sleep falls during the day.'
    ],
    example: example('One illustrative day', [block('23:00','07:00','Main sleep')],480,'8 hours'),
    practicalBenefits: ['One sleep opportunity can be straightforward to protect in a household with fixed working hours.', 'There is one main bedtime and wake time to organize around.'],
    constraints: ['An early alarm or a late bedtime can shorten the day’s entire sleep allowance.', 'A single stretch can still contain frequent awakenings or feel unrefreshing.'],
    context: ['The guide associates this arrangement with fixed work and school schedules. The label describes the arrangement, without assigning a job or personality to the sleeper.'],
    evidence: ['Sleep duration recommendations are often written for a main nighttime sleep. Duration, timing, sleep quality and daytime functioning all help evaluate that sleep.'],
    nextSteps: ['Record actual sleep time as well as time in bed.', 'Notice whether you sleep much longer when the alarm is off.'],
    sourceIds: ['aasmDuration'],
    guideSource: guideSource([5,11])
  },
  biphasic_siesta: {
    name: 'Biphasic with a siesta',
    overview: ['You usually have a main sleep and a longer sleep around midday.', 'The guide relates this arrangement to communities and work schedules that leave time for a midday rest. The combined hours are the useful starting point for your own evaluation.'],
    example: example('A main sleep and a midday siesta', [block('23:30','06:00','Main sleep'),block('13:00','14:00','Siesta')],450,'7 hours 30 minutes'),
    practicalBenefits: ['A planned midday gap can make an additional sleep possible.', 'The two opportunities can be fitted around an early start and afternoon work.'],
    constraints: ['Both sleep opportunities need time and a suitable place.', 'Grogginess after a longer nap can affect the next task. A later nap may also affect the following main sleep.'],
    context: ['This pattern depends on the day’s practical room for a longer nap. It is useful to compare workdays with days off.'],
    evidence: ['Both brief and longer naps can improve alertness. Waking from deeper sleep may bring a period of reduced alertness, and the effect varies with prior sleep loss.'],
    nextSteps: ['Include the siesta in the daily total.', 'Allow time to become fully alert before driving or operating equipment.'],
    sourceIds: ['naps','napTiming'],
    guideSource: guideSource([5,6,11])
  },
  biphasic_nap: {
    name: 'Biphasic with a short nap',
    overview: ['Your usual day includes a main sleep and one short nap.', 'A nap can be a deliberate part of the day or a response to a short night. Recording why it happens helps distinguish those situations.'],
    example: example('A main sleep and one short nap', [block('23:00','06:30','Main sleep'),block('13:30','13:50','Nap')],470,'7 hours 50 minutes'),
    practicalBenefits: ['A short nap can fit into a smaller break.', 'It gives you a clear opportunity to compare alertness before and afterward.'],
    constraints: ['A quiet, safe place and enough time to wake up are still needed.', 'Unplanned dozing and sleepiness despite adequate sleep deserve attention.'],
    context: ['The guide includes people who have a fairly regular main sleep and want or need a daytime rest.'],
    evidence: ['NIOSH describes brief naps as a way to improve alertness temporarily. Even a short nap can leave grogginess, especially after substantial sleep loss.'],
    nextSteps: ['Record nap length, timing and how you felt afterward.', 'If falling asleep at night is difficult, note whether later naps make it harder.'],
    sourceIds: ['naps','habits'],
    guideSource: guideSource([6,11])
  },
  segmented: {
    name: 'Segmented sleep',
    overview: ['Your main sleep usually comes in two stretches, with a sustained period awake between them.', 'For example, a person might sleep for several hours, be awake for an hour or two, then return to sleep. How comfortable that waking feels and how well the person functions afterward matter.'],
    example: example('Two stretches with time awake between', [block('21:30','01:00','First sleep'),block('03:00','06:30','Second sleep')],420,'7 hours'),
    practicalBenefits: ['Describing both stretches gives a more accurate account of the night.', 'A second protected sleep opportunity can make room for the remaining hours.'],
    constraints: ['Work or family demands may cut the second stretch short.', 'A distressing inability to return to sleep deserves discussion even when the pattern has a familiar name.'],
    context: ['The guide discusses historical “first sleep” and “second sleep.” Those accounts give context for the arrangement.'],
    evidence: ['Wehr’s experiment found that sleep often divided into two bouts when participants had a longer nightly period of darkness. The result demonstrates a possible response under those experimental conditions.'],
    nextSteps: ['Add the two actual sleep stretches, leaving out the time awake.', 'Record whether the interval feels comfortable or frustrating and whether the next day is affected.'],
    sourceIds: ['segmented','history','symptoms'],
    guideSource: guideSource([6,7,11])
  },
  segmented_naps: {
    name: 'Segmented sleep with naps',
    overview: ['You usually sleep in two main stretches and also nap on most days.', 'This is the mixed pattern described by the guide’s first reader. The main sleep comes in two pieces, and extra naps fit around work and family life.'],
    example: example('Two main stretches and a short nap', [block('22:00','01:30','First sleep'),block('03:00','06:30','Second sleep'),block('13:30','13:50','Nap')],440,'7 hours 20 minutes'),
    practicalBenefits: ['Tracking all three parts can reveal sleep that a nighttime-only estimate misses.', 'The description accommodates a real routine with both a long waking interval and daytime sleep.'],
    constraints: ['A nap may be missed, and an early obligation may shorten the second main stretch.', 'The number of sleeps gives little information about the total on any particular day.'],
    context: ['The guide’s example includes self-directed work and family demands. Those circumstances can explain opportunities to sleep, while the diary shows what actually happens.'],
    evidence: ['Evidence for any particular split-sleep arrangement is limited. Use total duration, timing, alertness and symptoms to evaluate your own observations.'],
    nextSteps: ['List the first stretch, time awake, second stretch and each nap separately.', 'Compare days with naps to days without them, including changes in daytime alertness.'],
    sourceIds: ['segmented','regularity'],
    guideSource: guideSource([2,7,11,16])
  },
  triphasic: {
    name: 'Triphasic sleep',
    overview: ['You selected three roughly equal sleep periods, each about 90 minutes to two hours, spread across 24 hours.', 'Those durations add up to 4½–6 hours. The example below is an illustration of the named arrangement.'],
    example: example('Illustration of the reduced schedule', [block('00:00','01:30','Sleep 1'),block('08:00','09:30','Sleep 2'),block('16:00','17:30','Sleep 3')],270,'4 hours 30 minutes'),
    practicalBenefits: ['The three appointments make the pattern easy to describe and total.'],
    constraints: ['Three separate sleep appointments can conflict with work and family life.', 'The usual total is below adult recommendations. Cycle length varies, so a 90-minute block does not guarantee a complete set of sleep stages.'],
    context: ['The guide presents this as a deliberately reduced schedule. Its presence in the comparison lets you recognize it if you already follow it.'],
    evidence: ['A sleep-timing consensus panel found no established benefit from adopting reduced polyphasic schedules and advised against deliberate substantial sleep reduction.'],
    nextSteps: ['Count the hours across all three periods and compare them with the age guidance.', 'If using this arrangement to gain waking hours, seek support for increasing the time available to sleep.'],
    sourceIds: ['polyphasic','stages'],
    guideSource: guideSource([8,11])
  },
  everyman: {
    name: 'Everyman-style sleep',
    overview: ['You selected one sleep of about three hours and three naps of about 20 minutes each.', 'Three hours plus those naps totals four hours. Even if the routine feels familiar, that total leaves little sleep opportunity.'],
    example: example('Illustration of the reduced schedule', [block('00:00','03:00','Core sleep'),block('07:00','07:20','Nap 1'),block('12:00','12:20','Nap 2'),block('17:00','17:20','Nap 3')],240,'4 hours'),
    practicalBenefits: ['The named schedule provides a way to record a core sleep and its additional naps accurately.'],
    constraints: ['Missing one of the small sleep opportunities reduces an already short total.', 'Feeling accustomed to a short routine can give an incomplete picture of attention and performance.'],
    context: ['Online communities use several variants of this name. This assessment describes only the three-hour core and three 20-minute naps you selected.'],
    evidence: ['In a controlled experiment, repeated four- or six-hour nights produced accumulating performance deficits while participants’ subjective sleepiness changed much less.'],
    nextSteps: ['Compare your measured daily total with the hours you intended to get.', 'Prioritize enough opportunity to sleep and discuss persistent impairment with a clinician.'],
    sourceIds: ['restriction','polyphasic'],
    guideSource: guideSource([8,9,11])
  },
  uberman: {
    name: 'Uberman / Dymaxion-style sleep',
    overview: ['You selected a naps-only schedule. Six 20-minute sleeps or four 30-minute sleeps total two hours in 24.', 'The guide includes these named schedules so readers can recognize how severely they reduce the time available for sleep.'],
    example: example('Six 20-minute sleeps as an illustration', [block('00:00','00:20','Nap 1'),block('04:00','04:20','Nap 2'),block('08:00','08:20','Nap 3'),block('12:00','12:20','Nap 4'),block('16:00','16:20','Nap 5'),block('20:00','20:20','Nap 6')],120,'2 hours'),
    practicalBenefits: ['Adding each nap makes the very short daily total visible.'],
    constraints: ['This schedule provides very little sleep and can compromise alertness.', 'Every sleep opportunity is small, so interruptions further reduce the total.'],
    context: ['The example is included for recognition and comparison. It should prompt attention to sleep opportunity and daytime safety.'],
    evidence: ['The consensus review of reduced polyphasic schedules found adverse health and performance concerns. A claim that brief naps can supply all required sleep lacks supporting evidence.'],
    nextSteps: ['Avoid driving or hazardous tasks while sleepy.', 'Seek support for returning to enough sleep opportunity, particularly if work or caregiving has imposed this schedule.'],
    sourceIds: ['polyphasic','driving'],
    guideSource: guideSource([9,11])
  },
  irregular: {
    name: 'A changing sleep pattern',
    overview: ['You switched between arrangements during the last two weeks.', 'Shifts, caregiving, illness, travel and competing demands can all change when sleep is possible. Keeping each day’s record is more informative than forcing those days into one schedule.'],
    example: null,
    practicalBenefits: ['A daily record can show which constraints matter most.', 'It can distinguish a change in bedtime from a change in the number of sleeps.'],
    constraints: ['An average can conceal both adequate days and very short ones.', 'A changing schedule can make it harder to protect a dependable opportunity for sleep.'],
    context: ['The guide groups several situations together. A rotating shift schedule and a circadian rhythm disorder need different explanations and care.'],
    evidence: ['A consensus panel supports regular sleep timing for health and performance. Catch-up sleep may help after short sleep on workdays, while the underlying shortage still deserves attention.'],
    nextSteps: ['Record workdays, free days and interrupted days separately.', 'Choose the most feasible regular sleep opportunity within your actual obligations.'],
    sourceIds: ['regularity'],
    guideSource: guideSource([9,10,11,13])
  },
  biphasic_other: {
    name: 'Main sleep and one nap',
    overview: ['You usually have a main sleep and one additional nap.', 'This category accommodates a nap that falls between the guide’s short-nap and midday-siesta examples, or occurs at another time.'],
    example: example('One possible arrangement', [block('23:00','06:30','Main sleep'),block('14:00','14:45','Nap')],495,'8 hours 15 minutes'),
    practicalBenefits: ['Both sleep opportunities count toward the daily record.'],
    constraints: ['The timing and length of the nap may affect how alert you feel on waking and when you next feel sleepy.'],
    context: ['A 45-minute nap is an ordinary example that deserves a clear description.'],
    evidence: ['Nap effects vary with duration, timing and prior sleep. A single duration cannot predict how refreshed a person will feel.'],
    nextSteps: ['Compare nap length with alertness afterward.', 'Keep the main sleep in the record even when the nap feels especially restorative.'],
    sourceIds: ['naps','napTiming'],
    guideSource: guideSource([5,6])
  },
  polyphasic_other: {
    name: 'Several sleeps across the day',
    overview: ['Your sleep is divided among several periods. The details you gave fit a broader pattern with multiple sleeps.', 'Some people keep a main sleep and several naps. Others have several shorter sleeps with no main stretch. Your answer summary shows which you reported.'],
    example: null,
    practicalBenefits: ['Recording all periods gives a fuller account of sleep in a busy or interrupted day.'],
    constraints: ['A shared category can include very different totals and levels of regularity.'],
    context: ['“Polyphasic” describes multiple sleep periods. Exact duration and timing are needed to discuss any specific reduced-sleep schedule.'],
    evidence: ['The research concerns about deliberate reduced polyphasic schedules apply when sleep opportunity is substantially curtailed. Your individual evaluation also uses your reported total.'],
    nextSteps: ['Record every period across 24 hours.', 'Note which sleeps are planned, which are interrupted and which occur unintentionally.'],
    sourceIds: ['polyphasic'],
    guideSource: guideSource([4,8,9,15,16])
  },
  occasional_naps: {
    name: 'One main sleep with occasional naps',
    overview: ['You get most sleep in one main stretch and napped on some days during the last two weeks.', 'This can be a stable routine with extra sleep only after a short night, on a day off, or when time permits.'],
    example: example('An illustrative day when a nap happens', [block('23:00','06:30','Main sleep'),block('14:00','14:20','Occasional nap')],470,'7 hours 50 minutes on this example day'),
    practicalBenefits: ['The description preserves the difference between a usual main sleep and occasional additional sleep.'],
    constraints: ['A total from a nap day may overstate the sleep on other days.'],
    context: ['The guide emphasizes that real routines overlap. This category makes room for that ordinary variation.'],
    evidence: ['A diary of actual nights and naps is useful when a two-week average hides differences.'],
    nextSteps: ['Compare a day with a nap and a day without one.', 'Notice whether the nap follows lost sleep, extra exertion or a free afternoon.'],
    sourceIds: ['sleepStudy'],
    guideSource: guideSource([15,16])
  },
  main_sleep: {
    name: 'One main stretch of sleep',
    overview: ['You can identify one main stretch, while the nap pattern remains uncertain or varied.', 'That is enough to describe the main arrangement. A few days of notes can fill in the details about additional sleep.'],
    example: null,
    practicalBenefits: ['The main stretch gives you a clear starting point for a diary.'],
    constraints: ['Uncounted naps can change both the daily total and the description of the pattern.'],
    context: ['This result retains the part of the routine you could identify.'],
    evidence: ['Sleep diaries can capture variation that is difficult to recall in a short questionnaire.'],
    nextSteps: ['Record the main sleep and any naps for a few days.', 'Return to the nap questions when you have a clearer picture.'],
    sourceIds: ['sleepStudy'],
    guideSource: guideSource([14,15,16])
  },
  unclear: {
    name: 'A few details need another look',
    overview: ['Your answers leave the usual arrangement open or contain estimates that are difficult to fit together.', 'Use the review prompt in your result to revisit the relevant answer. If you cannot remember, start with a few ordinary days of sleep and wake times.'],
    example: null,
    practicalBenefits: ['A question to revisit can be more useful than an ill-fitting label.'],
    constraints: ['A short questionnaire depends on what you can recall about a typical day.'],
    context: ['Changing routines, uncertain estimates and overlapping descriptions are all possible reasons for this result.'],
    evidence: ['A sleep diary offers a record to use in a follow-up discussion or assessment.'],
    nextSteps: ['Review the highlighted answer if you have a better estimate.', 'Keep the estimate marked uncertain when the details are still unclear.'],
    sourceIds: ['sleepStudy'],
    guideSource: guideSource([14,15,16])
  }
};

export const guideLearningSections = [
  {
    id: 'stages',
    title: 'What happens within a stretch of sleep',
    paragraphs: [
      'Sleep moves through lighter non-REM stages, deeper slow-wave sleep and REM sleep. Deeper sleep is usually more prominent earlier in a main sleep, while REM periods tend to lengthen later.',
      'A cycle often lasts roughly 80–100 minutes, with variation across people and across the night. A clock-based schedule cannot tell you which stages occurred. Those stages are measured using brain activity and other signals during a sleep study.'
    ],
    sourceIds: ['stages'],
    guideSource: guideSource([3])
  },
  {
    id: 'two-processes',
    title: 'Why sleepiness changes through the day',
    paragraphs: [
      'The longer you are awake, the more pressure to sleep tends to build. Adenosine is involved in this process, and caffeine blocks some of its signaling.',
      'Your circadian system also changes alertness across a roughly 24-hour day. Light is an important timing cue. These processes help explain why a long time awake and a late hour can feel different, and why shifting sleep to another part of the day may take adjustment.'
    ],
    sourceIds: ['clock'],
    guideSource: guideSource([3])
  },
  {
    id: 'chronotype',
    title: 'Your preferred hours',
    paragraphs: [
      'Chronotype concerns preferred sleep timing. People who each sleep in one main stretch can prefer very different bedtimes and wake times.',
      'A self-description as an early or late sleeper is useful context. Comparing the timing of sleep on workdays and free days can reveal a mismatch with obligations. Researchers use the term social jetlag for differences between biological and social timing. Measuring it properly needs timing data beyond a preference question.'
    ],
    sourceIds: ['chronotype'],
    guideSource: guideSource([11,12])
  },
  {
    id: 'lifespan',
    title: 'Sleep changes with age',
    paragraphs: [
      'Sleep is distributed across many periods in infancy, consolidates during childhood, and often shifts later during adolescence. Older adults commonly have earlier timing and lighter, more interrupted sleep.',
      'CDC gives adult guidance of at least seven hours for ages 18–60, seven to nine hours for ages 61–64, and seven to eight hours for ages 65 and older. The interactive assessment is designed for adults. Children and teenagers need guidance matched to their age.'
    ],
    sourceIds: ['aging','cdcSleep'],
    guideSource: guideSource([3,12])
  },
  {
    id: 'history',
    title: 'First sleep and second sleep',
    paragraphs: [
      'The guide draws on historical descriptions of two nighttime sleeps and on an experiment in which longer nights of darkness often led to two sleep bouts. They show that split sleep can occur under particular social and environmental conditions.',
      'For an individual, the useful questions remain concrete. How much sleep is obtained? Does the waking interval cause distress? Can the second stretch happen? Does the person function well during waking hours?'
    ],
    sourceIds: ['history','segmented'],
    guideSource: guideSource([6,7])
  },
  {
    id: 'quality-and-regularity',
    title: 'Evaluating the whole day',
    paragraphs: [
      'A pattern name describes when sleep happens. Evaluation also needs duration, regularity, alertness and symptoms. Two people with the same named pattern may have very different experiences.',
      'Research supports consistent sleep timing. When workdays have been short on sleep, extra sleep on days off may help. A diary can show whether changing obligations repeatedly leave too little time for sleep.'
    ],
    sourceIds: ['regularity'],
    guideSource: guideSource([11,13])
  },
  {
    id: 'naps',
    title: 'Understanding a nap',
    paragraphs: [
      'Record when a nap begins, how long it lasts and whether you intended to sleep. Those details help distinguish a planned rest from unwanted dozing.',
      'NIOSH describes short naps as a temporary aid to alertness. Nap length alone does not guarantee a clear awakening. Sleep loss can make deeper sleep arrive sooner, and grogginess after waking can temporarily reduce performance.'
    ],
    sourceIds: ['naps'],
    guideSource: guideSource([5,6,7])
  },
  {
    id: 'changing',
    title: 'Making a change you can observe',
    paragraphs: [
      'Give sleep enough room in the day. When your schedule permits, aim for consistent sleep and wake times, a quiet dark bedroom, and a calmer hour before sleep. Record late caffeine, alcohol, light exposure and interruptions that may help explain a difficult night.',
      'Try a manageable change and record what happens over the next two weeks. Treat two weeks as an observation period. Persistent symptoms can be discussed with a clinician sooner.'
    ],
    sourceIds: ['habits','symptoms'],
    guideSource: guideSource([13])
  }
];

export const guideDiaryPlan = {
  title: 'Your next two weeks',
  introduction: 'Use one line for each sleep period. A rough morning estimate is enough to start.',
  fields: ['Date', 'When you tried to sleep', 'Estimated time asleep', 'Time awake between sleeps', 'Final wake time', 'Naps', 'Alertness while awake', 'Relevant interruptions or symptoms'],
  steps: [
    { title: 'Record ordinary days', text: 'Include workdays, days off and days with interruptions. Count each sleep once and leave awake time out of the total.' },
    { title: 'Compare the days', text: 'Look for the shortest totals, the largest shifts in timing and episodes of unwanted dozing. For split sleep, compare both main stretches and each nap.' },
    { title: 'Choose one manageable adjustment', text: 'Use the evaluation above to choose what to address first, such as protecting a longer sleep opportunity or getting help with persistent symptoms.' },
    { title: 'Review what changed', text: 'Compare total sleep, timing and daytime functioning. Bring the record to a healthcare visit if the problem persists or concerns you.' }
  ],
  sourceIds: ['sleepStudy','habits'],
  guideSource: guideSource([13])
};

export function formatSleepMinutes(value) {
  if (!Number.isInteger(value) || value < 1 || value > 1440) return 'You could not estimate the total';
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return [hours ? hours + (hours === 1 ? ' hour' : ' hours') : '', minutes ? minutes + (minutes === 1 ? ' minute' : ' minutes') : ''].filter(Boolean).join(' ');
}

export function interpretAssessment(answers, assessment = { key: 'unclear' }) {
  const key = Object.hasOwn(guidePatterns, assessment.key) ? assessment.key : 'unclear';
  const profile = guidePatterns[key];
  const evaluations = [];
  const actions = [];
  const observedSummary = [];
  const optionalFields = ['timing','chronotype','waking','apneaSigns','sleepyDriving','sleepOnset'];
  const suppliedObservations = optionalFields.filter(id => answers[id] !== undefined && answers[id] !== '' && answers[id] !== 'unknown');
  const result = {
    patternKey: key,
    profile,
    observedSummary,
    evaluations,
    actions,
    review: assessment.reason ? { reason: assessment.reason, edit: assessment.edit || [] } : null,
    sourceIds: [],
    completedObservationIds: suppliedObservations,
    adultOnly: answers.ageBand === 'under18',
    guideSource: guideSource([3,7,11,12,13,16])
  };
  const add = (id, title, level, paragraphs, sourceIds) => evaluations.push({ id, title, level, paragraphs, sourceIds });

  if (result.adultOnly) {
    add('age', 'This assessment is designed for adults', 'info', [
      'Sleep needs and schedules change substantially during childhood and adolescence. Use age-specific guidance with a parent, caregiver or healthcare professional.'
    ], ['cdcSleep']);
    result.sourceIds = ['cdcSleep'];
    return result;
  }

  const knownAge = ['18_60','61_64','65_plus'].includes(answers.ageBand);
  const hasTotal = Number.isInteger(answers.total) && answers.total > 0 && answers.total <= 1440;
  observedSummary.push(profile.name);
  observedSummary.push('Reported sleep across 24 hours — ' + formatSleepMinutes(answers.total));
  if (answers.layout === 'B' && answers.naps === 'B') observedSummary.push('You also napped on some days.');
  if (answers.layout === 'B' && answers.naps === 'D') observedSummary.push('You were unsure how often you napped outside the two main stretches.');

  if (!knownAge) {
    add('duration', 'Add your age range for a duration comparison', 'info', [
      'Your pattern can be described from the sleep arrangement. The age range lets this report compare the hours with the appropriate adult guidance.'
    ], ['cdcSleep']);
  } else if (!hasTotal) {
    add('duration', 'Your daily total is still open', 'info', [
      'Add the time asleep in your main stretch or stretches and any naps. A few days of notes can help when the estimate is difficult.'
    ], ['sleepStudy']);
    actions.push('Record the hours across a full day, including each nap.');
  } else {
    const ageText = answers.ageBand === '18_60' ? 'For adults ages 18–60, the general recommendation is at least seven hours.' :
      answers.ageBand === '61_64' ? 'For adults ages 61–64, the general recommendation is seven to nine hours.' :
      'For adults ages 65 and older, the general recommendation is seven to eight hours.';
    if (answers.total < 420) {
      add('duration', 'Your reported total falls below adult guidance', 'attention', [
        'You estimated ' + formatSleepMinutes(answers.total) + ' across the full day. ' + ageText,
        'Consider whether work, caregiving or difficulty sleeping limits the available hours. The first practical goal is enough opportunity to sleep.'
      ], ['cdcSleep']);
      actions.push('Look for a realistic way to protect more time for sleep and discuss persistent difficulty with a clinician.');
    } else if (answers.total > (answers.ageBand === '65_plus' ? 480 : 540)) {
      add('duration', 'Your reported total is longer than the usual range', 'info', [
        'You estimated ' + formatSleepMinutes(answers.total) + ' in 24 hours. ' + ageText,
        'Longer sleep can occur during recovery from sleep loss or illness. If this is a new change, concerns you, or still leaves you sleepy, discuss it with a healthcare professional.'
      ], ['cdcSleep','aasmDuration']);
    } else {
      add('duration', 'Your reported hours reach the adult guideline', 'steady', [
        'You estimated ' + formatSleepMinutes(answers.total) + ' across the day. ' + ageText,
        'Also look at how refreshed and alert you feel, how often sleep is interrupted and how consistent the timing is.'
      ], ['cdcSleep']);
    }
  }

  const alertness = {
    A: ['You stayed awake easily in the afternoon.', 'Your description suggests that staying awake felt comfortable at that time.'],
    B: ['Staying awake took effort.', 'Effort to stay awake is worth tracking alongside sleep duration and timing. If it persists, discuss it with a healthcare professional.'],
    C: ['You dozed off without intending to.', 'Unwanted dozing deserves attention, especially when you have allowed enough time for sleep or when it affects safety.'],
    D: ['Afternoons were part of your main sleep.', 'This can happen when someone works nights. Evaluate alertness during the hours you need to be awake.'],
    E: ['Your afternoon alertness varied.', 'Record both the sleepy days and the easier days, along with the previous sleep.']
  }[answers.alertness];
  if (alertness) {
    observedSummary.push(alertness[0]);
    add('alertness', alertness[0], ['B','C'].includes(answers.alertness) ? 'attention' : 'info', [alertness[1]], ['symptoms']);
    if (answers.alertness === 'C') actions.push('Avoid driving when sleepy and arrange a healthcare discussion about repeated unwanted dozing.');
  }

  if (answers.sleepyDriving === 'yes') {
    add('driving', 'Sleepiness while driving needs immediate attention', 'urgent', [
      'If you are sleepy while driving now, stop in a safe place. Arrange rest or another way to travel. Persistent or recurrent sleepiness while driving warrants a prompt healthcare discussion.'
    ], ['driving']);
    actions.unshift('Make a safe travel plan before the next drive if sleepiness could recur.');
  }

  if (answers.timing === 'steady' || answers.timing === 'within_hour') {
    add('timing', 'Your timing is fairly consistent', 'steady', ['You reported similar sleep timing across days. Protect the sleep opportunity as well as the timing.'], ['regularity']);
  } else if (answers.timing === 'variable' || answers.timing === 'shifts' || key === 'irregular') {
    const scheduleText = answers.timing === 'shifts' ? 'Shifts can limit when sleep is possible. Compare each shift type and the transition days separately.' : 'Write down when each sleep starts and ends. This shows whether the changes concern bedtime, total hours or both.';
    add('timing', 'Look at the changes across days', 'info', [scheduleText, 'A sleep opportunity you can protect consistently is a practical place to start.'], ['regularity']);
    actions.push('Compare workdays and days off before choosing a schedule change.');
  }

  const preference = {
    early: 'You prefer earlier sleep and wake times.',
    middle: 'You described a preference around the middle of the day-to-night range.',
    late: 'You prefer later sleep and wake times.',
    variable: 'Your preferred timing varies.'
  }[answers.chronotype];
  if (preference) add('chronotype', 'Your preferred timing', 'info', [
    preference,
    'Notice whether the hours you would choose on a free day differ from the hours obligations require. The preference gives context to the pattern you keep.'
  ], ['chronotype']);

  if (answers.waking === 'trouble' || answers.sleepOnset === 'over30') {
    const text = answers.waking === 'trouble' ? 'You described difficulty returning to sleep after waking.' : 'You described regularly taking more than half an hour to fall asleep.';
    add('settling', 'Difficulty sleeping deserves its own attention', 'attention', [
      text,
      'Track how often it happens and its effect on the next day. Discuss persistent or bothersome difficulty with a healthcare professional.'
    ], ['symptoms']);
    actions.push('Note the frequency of difficulty sleeping and its daytime effects.');
  } else if (answers.waking === 'settled' && ['segmented','segmented_naps'].includes(key)) {
    add('settling', 'You felt comfortable during the waking interval', 'info', [
      'That describes your experience of the gap. Continue to include both stretches in the total and notice whether the second stretch is being cut short.'
    ], ['segmented']);
  }

  const signs = Array.isArray(answers.apneaSigns) ? answers.apneaSigns.filter(sign => ['snoring','pauses','gasping','headaches'].includes(sign)) : [];
  if (signs.length) {
    const labels = { snoring: 'frequent loud snoring', pauses: 'observed pauses in breathing', gasping: 'gasping during sleep', headaches: 'morning headaches' };
    add('breathing', 'Discuss these sleep observations with a clinician', 'attention', [
      'You reported ' + signs.map(sign => labels[sign]).join(', ') + '. These observations can be relevant to sleep apnea and deserve a healthcare discussion.',
      'A clinician can review the symptoms and decide whether a sleep study is appropriate.'
    ], ['apnea','sleepStudy']);
    actions.push('Share the breathing or morning symptoms you reported with a healthcare professional.');
  }

  if (['triphasic','everyman','uberman'].includes(key)) {
    add('reduced-schedule', 'The selected schedule limits sleep opportunity', 'attention', [
      'Compare the actual total with your age guidance. Familiarity with a short routine can coexist with impaired attention. Prioritize adequate time to sleep.'
    ], ['restriction']);
  }

  if (['segmented','segmented_naps'].includes(key)) {
    add('split-sleep', 'Account for every part of the split sleep', 'info', [
      key === 'segmented_naps' ? 'Count the first stretch, the second stretch and each nap once. Leave the waking interval out. Compare a day with naps with a day when a nap was missed.' : 'Add the actual sleep in both stretches and leave the waking interval out. If you occasionally nap, record that separately.',
      'The main questions are whether the full total is sufficient, whether the timing can be protected and whether waking or daytime sleepiness is causing trouble.'
    ], ['segmented']);
  }

  if (!actions.length) actions.push('Keep a brief sleep record and compare the hours, timing and alertness across ordinary days.');
  result.sourceIds = [...new Set([...profile.sourceIds, ...evaluations.flatMap(item => item.sourceIds), ...guideDiaryPlan.sourceIds])];
  return result;
}

export function buildGuideReport(answers, assessment, questionList = []) {
  const result = interpretAssessment(answers, assessment);
  const profile = result.profile;
  const paragraphs = [
    { kind: 'title', text: 'Cloud Forest Sleep Patterns Report' },
    { kind: 'paragraph', text: 'Based on your observations over the past two weeks and the Sleep Patterns Field Guide. This educational report describes your answers. A healthcare professional can evaluate persistent symptoms or a suspected sleep disorder.' }
  ];
  const add = (kind, text) => paragraphs.push({ kind, text });
  if (result.adultOnly) {
    add('heading', result.evaluations[0].title);
    result.evaluations[0].paragraphs.forEach(text => add('paragraph', text));
    add('paragraph', guideSources.cdcSleep.title + ' — ' + guideSources.cdcSleep.url);
    return paragraphs;
  }
  add('heading', profile.name);
  result.observedSummary.slice(1).forEach(text => add('paragraph', text));
  if (result.review) add('paragraph', result.review.reason);
  profile.overview.forEach(text => add('paragraph', text));
  if (profile.example) {
    add('heading', 'Illustrative schedule');
    add('paragraph', 'This is an example for understanding the arrangement. Your recorded times provide your personal schedule.');
    profile.example.blocks.forEach(item => add('bullet', item.label + ' — ' + item.start + ' to ' + item.end));
    add('paragraph', 'Example total — ' + profile.example.totalText);
  }
  for (const [title, field] of [
    ['Practical features','practicalBenefits'], ['Tradeoffs and constraints','constraints'],
    ['Context from the guide','context'], ['What the evidence supports','evidence']
  ]) {
    add('heading', title);
    profile[field].forEach(text => add('paragraph', text));
  }
  add('paragraph', 'Field Guide pages ' + profile.guideSource.pages.join(', '));
  for (const evaluation of result.evaluations) {
    add('heading', evaluation.title);
    evaluation.paragraphs.forEach(text => add('paragraph', text));
  }
  add('heading', 'Your next steps');
  result.actions.forEach(text => add('bullet', text));
  profile.nextSteps.forEach(text => add('bullet', text));
  add('heading', guideDiaryPlan.title);
  add('paragraph', guideDiaryPlan.introduction);
  guideDiaryPlan.steps.forEach(item => {
    add('heading', item.title);
    add('paragraph', item.text);
  });
  if (questionList.length) {
    add('heading', 'Your answers');
    for (const question of questionList) {
      if (answers[question.id] === undefined) continue;
      const selected = Array.isArray(answers[question.id]) ? answers[question.id] : [answers[question.id]];
      const optionText = question.opts?.filter(item => selected.includes(item.l)).map(item => item.t).join(', ');
      const label = question.id === 'total' ? formatSleepMinutes(answers.total) : optionText;
      if (label) {
        add('heading', question.q);
        add('paragraph', label);
      }
    }
  }
  add('heading', 'Sources');
  result.sourceIds.forEach(id => add('paragraph', guideSources[id].title + ' — ' + guideSources[id].url));
  return paragraphs;
}
