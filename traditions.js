// Companion content from Sleep Patterns: A Field Guide, Part Two, pages 17–23.
// Every association below is attributed to the guide's traditional framework.
export const traditionsData = {
  title: 'Tradition, symbol, and sleep',
  introduction: 'Part Two of the guide explores Western astrology, Chinese traditions and Human Design as ways to reflect on rest. These associations have not been established as predictors of sleep in controlled research. Your reported sleep, total hours, regularity and daytime functioning remain the basis of your sleep result.',
  sourcePages: [17, 23],
  western: {
    title: 'Western astrology',
    introduction: 'The guide describes rest through the four elements and the twelve signs. Its descriptions are associations within the tradition.',
    sourcePages: [17, 18],
    elements: [
      { name: 'Fire', signs: 'Aries, Leo, Sagittarius', summary: 'The guide associates fire with activity followed by strong rest, and restlessness after an underused day.', affinity: 'Monophasic sleep with a firm stopping time, or a main sleep plus a nap after training.', sourcePages: [17] },
      { name: 'Earth', signs: 'Taurus, Virgo, Capricorn', summary: 'The guide associates earth with routine, comfort and sensitivity to disorder or noise.', affinity: 'Regularly scheduled monophasic sleep.', sourcePages: [17] },
      { name: 'Air', signs: 'Gemini, Libra, Aquarius', summary: 'The guide associates air with mental activity at bedtime and wakeful stretches during the night.', affinity: 'Segmented sleep.', sourcePages: [17] },
      { name: 'Water', signs: 'Cancer, Scorpio, Pisces', summary: 'The guide associates water with vivid dreams, emotional quiet and a protected sleeping space.', affinity: 'A long main sleep, or segmented sleep with a dream-rich second stretch.', sourcePages: [17] }
    ],
    signs: [
      { id: 'aries', name: 'Aries', dates: 'March 21–April 19', element: 'Fire', summary: 'The guide describes Aries as quick to sleep and wake, with rest shaped by physical activity and a busy mind.', affinity: 'Monophasic sleep after an active day.', sourcePages: [17] },
      { id: 'taurus', name: 'Taurus', dates: 'April 20–May 20', element: 'Earth', summary: 'The guide links Taurus with a comfortable bed, a full night and a predictable bedtime.', affinity: 'Long monophasic sleep, sometimes with a siesta.', sourcePages: [17] },
      { id: 'gemini', name: 'Gemini', dates: 'May 21–June 20', element: 'Air', summary: 'The guide associates Gemini with a first sleep, a wakeful interval for reading or conversation, and a second sleep.', affinity: 'Segmented sleep.', sourcePages: [17] },
      { id: 'cancer', name: 'Cancer', dates: 'June 21–July 22', element: 'Water', summary: 'The guide connects Cancer’s rest with the household, a sense of home and the moon in the tradition.', affinity: 'Monophasic sleep at home, with more interruptions when away.', sourcePages: [18] },
      { id: 'leo', name: 'Leo', dates: 'July 23–August 22', element: 'Fire', summary: 'The guide describes Leo as benefiting, within this tradition, from a protected bedtime and allowing enough time for rest.', affinity: 'Monophasic sleep with a protected bedtime.', sourcePages: [18] },
      { id: 'virgo', name: 'Virgo', dates: 'August 23–September 22', element: 'Earth', summary: 'The guide associates Virgo with exact routines and setting down unfinished tasks in writing before bed.', affinity: 'Early, regular monophasic sleep.', sourcePages: [18] },
      { id: 'libra', name: 'Libra', dates: 'September 23–October 22', element: 'Air', summary: 'The guide connects Libra with quiet, a comfortable setting and rest affected by interpersonal conflict.', affinity: 'Monophasic sleep or a main sleep with an afternoon rest.', sourcePages: [18] },
      { id: 'scorpio', name: 'Scorpio', dates: 'October 23–November 21', element: 'Water', summary: 'The guide describes Scorpio through later sleep, vivid dreams and activity during quiet nighttime hours.', affinity: 'Late monophasic sleep or segmented sleep with a substantial second stretch.', sourcePages: [18] },
      { id: 'sagittarius', name: 'Sagittarius', dates: 'November 22–December 21', element: 'Fire', summary: 'The guide links Sagittarius with travel, restlessness and changing sleeping environments.', affinity: 'An irregular tendency, with biphasic sleep presented as a regularizing rhythm.', sourcePages: [18] },
      { id: 'capricorn', name: 'Capricorn', dates: 'December 22–January 19', element: 'Earth', summary: 'The guide associates Capricorn with disciplined hours and a tendency to cut rest during demanding periods.', affinity: 'Strictly scheduled monophasic sleep and early rising.', sourcePages: [18] },
      { id: 'aquarius', name: 'Aquarius', dates: 'January 20–February 18', element: 'Air', summary: 'The guide connects Aquarius with unusual, inverted or self-designed sleep schedules.', affinity: 'A personally chosen schedule, including the guide’s association with polyphasic experiments.', sourcePages: [18, 23] },
      { id: 'pisces', name: 'Pisces', dates: 'February 19–March 20', element: 'Water', summary: 'The guide associates Pisces with long sleep, vivid dreams and a protected bedtime.', affinity: 'Long monophasic or segmented sleep, sometimes with naps.', sourcePages: [18] }
    ]
  },
  chinese: {
    title: 'Chinese zodiac and five phases',
    introduction: 'The guide presents birth-year animals and five-phase temperaments as traditional associations. Its animal-to-phase labels describe the guide’s temperament grouping. Choose the animal sign you already use.',
    sourcePages: [19, 20],
    animals: [
      { id: 'rat', name: 'Rat', phase: 'Wood-leaning, yang', summary: 'The guide describes Rat as alert, light-sleeping and active in the late hours.', affinity: 'Segmented sleep.', sourcePages: [19] },
      { id: 'ox', name: 'Ox', phase: 'Earth', summary: 'The guide links Ox with steady hours, early sleep and early rising.', affinity: 'Monophasic sleep.', sourcePages: [20] },
      { id: 'tiger', name: 'Tiger', phase: 'Wood', summary: 'The guide describes Tiger through deep bursts of rest and quick waking.', affinity: 'Biphasic sleep with a substantial nap.', sourcePages: [20] },
      { id: 'rabbit', name: 'Rabbit', phase: 'Wood', summary: 'The guide connects Rabbit with quiet surroundings, a protected room and a long night.', affinity: 'Long monophasic sleep.', sourcePages: [20] },
      { id: 'dragon', name: 'Dragon', phase: 'Earth', summary: 'The guide describes Dragon through intense activity followed by substantial recovery rest.', affinity: 'Monophasic sleep with recovery naps after demanding days.', sourcePages: [20] },
      { id: 'snake', name: 'Snake', phase: 'Fire', summary: 'The guide associates Snake with stillness, slow waking and a contemplative wakeful interval.', affinity: 'Segmented sleep.', sourcePages: [20] },
      { id: 'horse', name: 'Horse', phase: 'Fire', summary: 'The guide links Horse with movement, open spaces and light rest.', affinity: 'Biphasic sleep, described as a main sleep plus a nap.', sourcePages: [20] },
      { id: 'goat', name: 'Goat', phase: 'Earth', summary: 'The guide connects Goat’s rest with a settled household and emotional harmony.', affinity: 'Early, regular monophasic sleep.', sourcePages: [20] },
      { id: 'monkey', name: 'Monkey', phase: 'Metal', summary: 'The guide associates Monkey with an active mind, changing schedules and naps at unusual times.', affinity: 'Segmented sleep plus naps.', sourcePages: [20] },
      { id: 'rooster', name: 'Rooster', phase: 'Metal', summary: 'The guide describes Rooster through early waking and an exact bedtime.', affinity: 'Early, strictly scheduled monophasic sleep.', sourcePages: [20] },
      { id: 'dog', name: 'Dog', phase: 'Earth', summary: 'The guide connects Dog with sensitivity to household sounds and settling when others are home.', affinity: 'Monophasic sleep, described as lighter in the second half.', sourcePages: [20] },
      { id: 'pig', name: 'Pig', phase: 'Water', summary: 'The guide associates Pig with comfort, generous rest and ease in finding a sleeping place.', affinity: 'Long monophasic sleep, sometimes with a siesta.', sourcePages: [20] }
    ],
    phases: [
      { name: 'Wood', summary: 'The guide associates wood with restlessness in spring and during the traditional liver hours. It places Rat, Tiger and Rabbit in this temperament grouping.', sourcePages: [20] },
      { name: 'Fire', summary: 'The guide associates fire with late activity and the traditional theme of settling or cooling the evening.', sourcePages: [20] },
      { name: 'Earth', summary: 'The guide links earth with regular routines and meal timing.', sourcePages: [20] },
      { name: 'Metal', summary: 'The guide links metal with exact hours and emotional reflection during the small hours.', sourcePages: [20] },
      { name: 'Water', summary: 'The guide describes water through deep, long sleep and the traditional concern about sleeping into sluggishness.', sourcePages: [20] }
    ]
  },
  organClock: {
    title: 'The traditional Chinese organ clock',
    introduction: 'In this teaching, qi is said to move through twelve organ systems in two-hour windows. The guide associates gallbladder and liver hours with processing and restoration, and lung and large-intestine hours with letting go. It presents being asleep before 11 PM as a traditional teaching. These clock associations are cultural interpretations of rest.',
    sourcePages: [19],
    windows: [
      { start: '11 PM', end: '1 AM', organ: 'Gallbladder' },
      { start: '1 AM', end: '3 AM', organ: 'Liver' },
      { start: '3 AM', end: '5 AM', organ: 'Lung' },
      { start: '5 AM', end: '7 AM', organ: 'Large intestine' },
      { start: '7 AM', end: '9 AM', organ: 'Stomach' },
      { start: '9 AM', end: '11 AM', organ: 'Spleen' },
      { start: '11 AM', end: '1 PM', organ: 'Heart' },
      { start: '1 PM', end: '3 PM', organ: 'Small intestine' },
      { start: '3 PM', end: '5 PM', organ: 'Bladder' },
      { start: '5 PM', end: '7 PM', organ: 'Kidney' },
      { start: '7 PM', end: '9 PM', organ: 'Pericardium' },
      { start: '9 PM', end: '11 PM', organ: 'Triple burner' }
    ]
  },
  humanDesign: {
    title: 'Human Design',
    introduction: 'The guide presents Human Design’s five types and its beliefs about energy, aura and rest. These are the system’s teachings. The percentages below are the figures quoted by the guide for the system.',
    sourcePages: [21, 22],
    types: [
      { id: 'generator', name: 'Generator', share: 'About 37%', summary: 'The guide describes a defined sacral center and a steady energy supply within Human Design. Its rest teaching is to use the day’s energy and go to bed when honestly tired.', affinity: 'Full monophasic sleep after an active day.', sourcePages: [21] },
      { id: 'manifesting_generator', name: 'Manifesting Generator', share: 'About 33%', summary: 'The guide describes a Generator with a motor connected to the throat in the system. Its teaching links deep rest with using the day’s energy and settling the urge to replay the day.', affinity: 'Monophasic sleep, sometimes with a short nap between projects.', sourcePages: [21] },
      { id: 'projector', name: 'Projector', share: 'About 20%', summary: 'The guide describes an undefined sacral center and a guiding role within the system. The teaching is to lie down and rest before feeling exhausted, with daytime rest and consideration of sleeping alone.', affinity: 'Biphasic sleep with a daytime rest.', sourcePages: [21] },
      { id: 'manifestor', name: 'Manifestor', share: 'About 9%', summary: 'The guide describes energy arriving in surges within the system. Its teaching emphasizes rest before exhaustion, solitude at night and allowing extra sleep after periods of strong activity.', affinity: 'Monophasic sleep with extra-rest days, or segmented sleep during quieter periods.', sourcePages: [21] },
      { id: 'reflector', name: 'Reflector', share: 'About 1%', summary: 'The guide describes no defined centers and sensitivity across a lunar cycle within the system. Its teaching emphasizes a personal sleeping space and observing a rhythm over a full month.', affinity: 'A personally chosen pattern considered across a lunar month.', sourcePages: [22] }
    ],
    sharedTeaching: 'The guide also describes the Human Design belief that sharing a sleeping space can condition someone through another person’s aura. This is presented as a belief within the system. A person can observe practical factors such as a partner’s noise, light and schedule when reflecting on shared sleep.',
    sharedSourcePages: [21, 22]
  },
  comparison: {
    title: 'The guide’s side-by-side associations',
    introduction: 'Page 23 brings the traditions together by sleep pattern. It gives some additional associations alongside the individual profiles.',
    sourcePages: [23],
    rows: [
      { key: 'monophasic', pattern: 'Monophasic', western: 'Earth signs, especially Taurus, Virgo and Capricorn', chinese: 'Ox, Rooster and Goat', humanDesign: 'Generators after using the day’s energy', sourcePages: [23] },
      { key: 'biphasic_siesta', pattern: 'Biphasic with a siesta', western: 'Taurus and Leo', chinese: 'Tiger, Horse and Pig', humanDesign: 'Projectors with a midday rest', sourcePages: [23] },
      { key: 'biphasic_nap', pattern: 'Biphasic with a short nap', western: 'Libra and Virgo', chinese: 'Horse and Dragon after demanding activity', humanDesign: 'Manifesting Generators', sourcePages: [23] },
      { key: 'segmented', pattern: 'Segmented', western: 'Gemini, Scorpio and Pisces', chinese: 'Rat and Snake', humanDesign: 'Manifestors during a quieter period', sourcePages: [23] },
      { key: 'segmented_naps', pattern: 'Segmented plus naps', western: 'Gemini and Aquarius', chinese: 'Monkey', humanDesign: 'Projectors living by their own schedule', sourcePages: [23] },
      { key: 'polyphasic', pattern: 'Triphasic and other polyphasic schedules', western: 'Aquarius as an experimenter', chinese: 'Monkey in a particularly restless phase', humanDesign: 'The guide gives no type this recommendation and says the system prizes full rest', sourcePages: [23] },
      { key: 'irregular', pattern: 'Irregular', western: 'Sagittarius with little routine', chinese: 'Horse with an unsettled environment', humanDesign: 'Any type described by the system as sleeping against its design', sourcePages: [23] }
    ]
  }
};

function selectionRecords(selection = {}) {
  return [
    { group: 'western', title: 'Western astrology', record: traditionsData.western.signs.find(item => item.id === selection.western) },
    { group: 'chinese', title: 'Chinese zodiac', record: traditionsData.chinese.animals.find(item => item.id === selection.chinese) },
    { group: 'humanDesign', title: 'Human Design', record: traditionsData.humanDesign.types.find(item => item.id === selection.humanDesign) }
  ];
}

export function getTraditionReport(selection = {}) {
  const sections = [{
    title: traditionsData.title,
    paragraphs: [traditionsData.introduction],
    sourcePages: traditionsData.sourcePages
  }];
  for (const { title, record } of selectionRecords(selection)) {
    if (!record) continue;
    const classification = record.element ? 'The guide groups this sign with ' + record.element.toLowerCase() + '.'
      : record.phase ? 'The guide’s phase association is ' + record.phase.toLowerCase() + '.'
      : '';
    sections.push({
      title: title + ' — ' + record.name,
      paragraphs: [classification, record.summary, 'The guide associates this with ' + record.affinity.charAt(0).toLowerCase() + record.affinity.slice(1)].filter(Boolean),
      sourcePages: record.sourcePages
    });
  }
  return sections;
}

export function getPatternEcho(patternKey) {
  const aliases = {
    triphasic: 'polyphasic',
    everyman: 'polyphasic',
    uberman: 'polyphasic',
    dymaxion: 'polyphasic',
    uberman_dymaxion: 'polyphasic',
    polyphasic_other: 'polyphasic'
  };
  return traditionsData.comparison.rows.find(row => row.key === (aliases[patternKey] || patternKey)) || null;
}

// These notes expand the guide's own descriptions into questions a reader can
// compare with everyday experience. They are not personality-test scores.
const personalThemes = {
  western: {
    aries: { temperament: 'Initiative and physical activity are the main themes in the guide’s Aries portrait.', rest: 'Its useful question is whether an active day helps you settle, and whether unfinished activity or a busy mind follows you into bedtime.', reflection: 'On days when you feel physically satisfied, do you settle more easily while still allowing enough sleep?', patterns: ['monophasic'], related: ['occasional_naps','main_sleep'], tags: ['physical','mental'] },
    taurus: { temperament: 'Comfort, predictability and an unhurried rest period are the main themes in this portrait.', rest: 'Consider how the bed, room and bedtime routine affect your willingness to stop for the day. The guide’s longer-sleep association gives you a question to explore; your reported hours and daytime functioning establish whether your current rest is serving you.', reflection: 'Which familiar comforts help you settle, and which interruptions most often shorten your main sleep?', patterns: ['monophasic','biphasic_siesta'], related: ['occasional_naps','main_sleep','biphasic_other'], tags: ['routine','environment'] },
    gemini: { temperament: 'Mental activity, curiosity and a wakeful interval are central to the guide’s Gemini portrait.', rest: 'The guide imagines two substantial sleeps with a comfortable interval between them. If your waking feels frustrating or leaves you tired, include that experience when evaluating the arrangement.', reflection: 'If you wake for a long period, is it comfortable and followed by enough sleep, or are you trying unsuccessfully to get back to sleep?', patterns: ['segmented','segmented_naps'], related: [], tags: ['mental','flexible'], extra: 'The comparison table also connects Gemini with segmented sleep plus naps.' },
    cancer: { temperament: 'A settled household and a sense of emotional security are the central themes in this portrait.', rest: 'Compare familiar and unfamiliar sleeping environments, and evenings when family responsibilities are settled or still active. These concrete circumstances can help you decide which parts of the description fit your life.', reflection: 'How does your sleep change when the household is settled, when you are responsible for someone, or when you sleep away from home?', patterns: ['monophasic'], related: ['occasional_naps','main_sleep'], tags: ['emotional','environment'] },
    leo: { temperament: 'Activity, visibility and protecting enough private rest are the main themes in the guide’s Leo portrait.', rest: 'The guide asks whether social demands or the wish to keep going make bedtime negotiable. Its comparison table also includes a siesta, which is a traditional association to compare with a nap you already take.', reflection: 'Do you put off rest to stay available to others, and how do you feel after evenings with a clear stopping time?', patterns: ['monophasic','biphasic_siesta'], related: ['occasional_naps','main_sleep','biphasic_other'], tags: ['physical','routine'], extra: 'The comparison table also associates Leo with a main sleep and a siesta.' },
    virgo: { temperament: 'Order, precision and completing the day’s unfinished details are the main themes in this portrait.', rest: 'The guide suggests setting tasks down in writing before bed. As a personal observation, compare evenings when the next day is organized with evenings when you continue planning in bed.', reflection: 'Does writing down tomorrow’s tasks make it easier to stop mentally rehearsing them?', patterns: ['monophasic','biphasic_nap'], related: ['occasional_naps','main_sleep','biphasic_other'], tags: ['routine','mental'], extra: 'The comparison table also includes a main sleep with a short nap.' },
    libra: { temperament: 'Harmony, a comfortable setting and sensitivity to interpersonal conflict are the themes in the guide’s Libra portrait.', rest: 'Look at the connection between the evening’s social atmosphere and your own experience of settling. The guide allows both one main sleep and an afternoon rest, so it does not identify a single arrangement for every Libra.', reflection: 'On evenings with conflict or social pressure, what changes in your bedtime, thoughts or ability to settle?', patterns: ['monophasic','biphasic_nap'], related: ['occasional_naps','main_sleep','biphasic_other','biphasic_siesta'], tags: ['emotional','environment'] },
    scorpio: { temperament: 'Later hours, privacy and vivid dreaming are themes in this portrait.', rest: 'The guide allows either a late main sleep or a split main sleep. Compare that description with the hours you would actually choose on a free day; the timing preference you report is more specific to you than a sign label.', reflection: 'When you can choose your hours, do later sleep and wake times feel comfortable and leave you alert?', patterns: ['monophasic','segmented'], related: ['occasional_naps','main_sleep','segmented_naps'], tags: ['flexible','environment'] },
    sagittarius: { temperament: 'Movement, travel and sensitivity to a restrictive routine are themes in this portrait.', rest: 'The guide describes changing hours and a possible affinity with a main sleep plus a nap. Use that as a way to examine what travel or changing obligations do to your sleep, while keeping enough total rest in view.', reflection: 'Which changes in location or obligations alter your hours, and which parts of your routine remain workable across those changes?', patterns: ['irregular','biphasic_nap','biphasic_siesta','biphasic_other'], related: ['occasional_naps'], tags: ['flexible','physical'] },
    capricorn: { temperament: 'Discipline, predictable hours and commitment to responsibilities are the main themes in this portrait.', rest: 'The guide also describes cutting rest during demanding periods. Compare the sleep opportunity you intend to protect with the time work, training or caregiving actually leaves available.', reflection: 'Do ambitious or demanding periods reduce your sleep, even when your bedtime routine is otherwise consistent?', patterns: ['monophasic'], related: ['occasional_naps','main_sleep'], tags: ['routine','obligations'] },
    aquarius: { temperament: 'Independence and personally chosen schedules are the themes in the guide’s Aquarius portrait.', rest: 'Its associations are deliberately broad. The guide’s comparison table mentions segmented sleep with naps and polyphasic experimentation, but this does not establish a need to split sleep or reduce its total. Examine whether your current arrangement supports the hours you need to be awake.', reflection: 'Which parts of your schedule are a personal preference, and which come from work, habit or an experiment that may no longer suit you?', patterns: [], related: ['segmented_naps','triphasic','everyman','uberman','dymaxion','uberman_dymaxion','polyphasic_other'], tags: ['flexible','mental'], open: true },
    pisces: { temperament: 'Dreaming, emotional sensitivity and a protected bedtime are the themes in this portrait.', rest: 'The guide describes longer main sleep or two main stretches, sometimes alongside naps. Consider whether your room and evening boundaries let you stop taking on demands and notice your own tiredness.', reflection: 'What helps you feel settled enough to sleep, and how refreshed are you after the amount of sleep you usually get?', patterns: ['monophasic','segmented'], related: ['occasional_naps','main_sleep','segmented_naps','biphasic_nap','biphasic_siesta','biphasic_other'], tags: ['emotional','environment'] }
  },
  chinese: {
    rat: { temperament: 'Alertness, quick mental activity and later hours are the themes in the guide’s Rat portrait.', rest: 'Its segmented-sleep association describes a wakeful interval between two substantial sleeps. Compare the comfort of that interval and the full-day total with what you actually experience.', reflection: 'If you are awake during the night, do you return to a sufficient second sleep and feel alert the next day?', patterns: ['segmented'], related: ['segmented_naps'], tags: ['mental','flexible'] },
    ox: { temperament: 'Steadiness, early hours and a dependable routine are the themes in this portrait.', rest: 'The guide associates Ox with one main sleep. The personal question is how consistent hours feel to you, especially when comparing workdays and days off.', reflection: 'Does a predictable sleep and wake schedule feel comfortable, or do obligations make it hard to keep?', patterns: ['monophasic'], related: ['occasional_naps','main_sleep'], tags: ['routine'] },
    tiger: { temperament: 'Periods of activity followed by substantial rest are the themes in the guide’s Tiger portrait.', rest: 'Its biphasic association includes a meaningful nap as well as a main sleep. If you already nap, compare how you feel before and after it and whether it affects the following main sleep.', reflection: 'Do planned naps fit comfortably around your main sleep, and do they leave you more alert afterward?', patterns: ['biphasic_siesta'], related: ['biphasic_nap','biphasic_other','occasional_naps'], tags: ['physical','flexible'] },
    rabbit: { temperament: 'Quiet, protection from disturbance and gentle transitions into rest are the themes in this portrait.', rest: 'The guide associates Rabbit with a long main sleep. Observe how noise, light, interruptions and the feeling of being settled in a room affect your actual rest.', reflection: 'Which change in the sleeping environment makes the clearest difference to interruptions or comfort?', patterns: ['monophasic'], related: ['occasional_naps','main_sleep'], tags: ['environment','routine'] },
    dragon: { temperament: 'Intense effort and a strong recovery period are themes in the guide’s Dragon portrait.', rest: 'The guide describes a main sleep with recovery naps after demanding days. Compare ordinary days with unusually demanding ones, and notice whether recovery is planned or repeatedly postponed.', reflection: 'After a demanding day, do you allow enough recovery, or does the next commitment shorten it again?', patterns: ['monophasic','occasional_naps','biphasic_nap'], related: ['main_sleep','biphasic_other','biphasic_siesta'], tags: ['physical','obligations'] },
    snake: { temperament: 'Stillness, slower transitions and a contemplative wakeful interval are themes in this portrait.', rest: 'The guide links Snake with segmented sleep. The useful distinction is between a comfortable period awake and an unwanted interruption that reduces your total sleep.', reflection: 'Does a quiet interval during the night feel restorative or frustrating, and how does it affect the next day?', patterns: ['segmented'], related: ['segmented_naps'], tags: ['mental','environment'] },
    horse: { temperament: 'Movement, independence and sensitivity to confinement are themes in the guide’s Horse portrait.', rest: 'The guide describes a main sleep plus a nap, and its comparison table also mentions changing sleep in unsettled circumstances. Look at the role of your environment and obligations before deciding that variable hours are a fixed personal trait.', reflection: 'If your sleep hours change, do they reflect a preference or a response to travel, the room, work or other demands?', patterns: ['biphasic_nap','biphasic_siesta','biphasic_other'], related: ['occasional_naps','irregular'], tags: ['physical','flexible'], extra: 'The comparison table also describes irregular sleep when circumstances are unsettled.' },
    goat: { temperament: 'A settled home, companionship and emotional ease are the themes in this portrait.', rest: 'The guide associates Goat with an early, regular main sleep. Compare how household worries or changes in routine relate to your ability to settle.', reflection: 'When the household feels settled, do you fall asleep or stay asleep differently?', patterns: ['monophasic'], related: ['occasional_naps','main_sleep'], tags: ['emotional','routine'] },
    monkey: { temperament: 'Mental activity, experimentation and changing rest arrangements are themes in the guide’s Monkey portrait.', rest: 'The guide’s individual profile describes segmented sleep plus naps; its comparison table also mentions more divided schedules. These are descriptive associations. Your total rest and alertness remain central when evaluating a complex schedule.', reflection: 'Does your current arrangement serve your day, or are unusual naps compensating for sleep that was shortened earlier?', patterns: ['segmented_naps'], related: ['segmented','triphasic','everyman','uberman','dymaxion','uberman_dymaxion','polyphasic_other','irregular'], tags: ['mental','flexible'], extra: 'The comparison table also includes Monkey among its illustrations of more divided sleep.' },
    rooster: { temperament: 'Early waking, precise timing and protection of bedtime are the themes in this portrait.', rest: 'The guide associates Rooster with one early main sleep. Compare that description with your preferred hours on a day without an alarm or a fixed obligation.', reflection: 'Would you still choose an early bedtime and wake time on a free day?', patterns: ['monophasic'], related: ['occasional_naps','main_sleep'], tags: ['routine'] },
    dog: { temperament: 'Attention to the household and sensitivity to its sounds are themes in the guide’s Dog portrait.', rest: 'The guide describes one main sleep that may be lighter later in the night. Observe actual interruptions and responsibilities, rather than assuming every awakening belongs to the animal sign.', reflection: 'Which sounds or household responsibilities wake you, and can any of those interruptions be reduced?', patterns: ['monophasic'], related: ['occasional_naps','main_sleep'], tags: ['environment','obligations'] },
    pig: { temperament: 'Comfort, willingness to rest and an unhurried main sleep are themes in this portrait.', rest: 'The guide allows a long main sleep and sometimes a siesta. Compare time asleep with how restored you feel, especially if spending longer in bed still leaves you sleepy.', reflection: 'After a comfortable full sleep, how alert do you feel during the hours you want to be awake?', patterns: ['monophasic','biphasic_siesta'], related: ['occasional_naps','main_sleep','biphasic_other'], tags: ['environment','routine'] }
  },
  humanDesign: {
    generator: { temperament: 'In the guide’s Human Design framework, Generator is associated with a defined sacral center and sustained engagement in activity.', rest: 'Its rest teaching emphasizes noticing genuine tiredness after a satisfying day. Use that idea to observe the relationship between your activities and settling, while preserving adequate sleep opportunity. A type label does not require you to exercise until exhausted.', reflection: 'Which days leave you comfortably ready for sleep, and which leave you mentally or physically activated?', patterns: ['monophasic'], related: ['occasional_naps','main_sleep'], tags: ['physical','routine'] },
    manifesting_generator: { temperament: 'The guide describes Manifesting Generator as the Generator family expressed through a motor-to-throat connection, with quicker shifts between activities.', rest: 'Its rest teaching highlights using the day’s energy and allowing the replay of projects to settle. The guide allows a main sleep and sometimes a short nap; compare that with your actual use of naps and preferred stopping time.', reflection: 'Do unfinished projects keep your attention active at bedtime, and what helps you bring the day to a close?', patterns: ['monophasic','biphasic_nap'], related: ['occasional_naps','main_sleep','biphasic_other'], tags: ['physical','mental'] },
    projector: { temperament: 'Within the guide’s Human Design framework, Projector is associated with an undefined sacral center and a guiding role.', rest: 'Its teaching emphasizes making room for quiet rest before exhaustion. Rest can be a pause in activity without necessarily becoming a nap. If you do nap, examine your own alertness and the effect on your main sleep before deciding how well it fits.', reflection: 'Can you notice a useful time to pause before exhaustion, and does that pause need sleep or simply less stimulation?', patterns: ['biphasic_nap','biphasic_siesta','biphasic_other','segmented_naps'], related: ['occasional_naps'], tags: ['rest','environment'], extra: 'The guide’s comparison table also includes segmented sleep plus naps for Projectors keeping their own schedule.' },
    manifestor: { temperament: 'The guide describes Manifestor through periods of initiating activity followed by a withdrawal of effort in Human Design’s terms.', rest: 'Its rest teaching emphasizes allowing recovery before exhaustion and protecting quiet time. It permits either a main sleep or a split main sleep during quieter periods, so it does not prescribe a single nightly arrangement.', reflection: 'After a period of intense activity, what tells you that it is time to reduce demands and allow recovery?', patterns: ['monophasic','segmented'], related: ['occasional_naps','main_sleep','segmented_naps'], tags: ['rest','flexible'] },
    reflector: { temperament: 'Within the guide’s Human Design framework, Reflector is described as having no defined centers and observing experience over a lunar cycle.', rest: 'The guide asks Reflectors to consider their surroundings and observe patterns over a month. You can record sleep, demands and the environment over that period without assuming that the moon caused any change you notice.', reflection: 'Across several weeks, which changes in your surroundings or obligations accompany easier or harder rest?', patterns: [], related: [], tags: ['environment','flexible'], open: true }
  }
};

const preferredHours = {
  early: ['You prefer earlier hours', 'You chose earlier sleep and waking when free to choose. Compare that preference with the hours work, training and family life allow.'],
  middle: ['You prefer hours in the middle', 'You chose neither especially early nor especially late hours. Look for the sleep opportunity that feels comfortable and leaves you alert across ordinary days.'],
  late: ['You prefer later hours', 'You chose later sleep and waking when free to choose. Compare that preference with any early obligations and with your actual total sleep.'],
  variable: ['Your preferred hours change', 'You described a changing preference. A record of workdays and free days can help distinguish changing demands from a preference that varies even when you control the schedule.'],
  unknown: ['Your preferred hours are still unclear', 'You were unsure which hours you would choose. Record a few days with fewer obligations, including bedtime, waking, naps and how alert you felt.']
};

const restChallenges = {
  mental: { title: 'Your mind stays active', text: 'You identified busy thoughts or unfinished tasks as a barrier to settling. This is something you reported about your own experience; it can be explored directly whatever your sign or type.', experiment: 'Before bed, record the tasks or thoughts you want to return to tomorrow. Compare how settling feels with evenings when you continue working through them in bed.', tag: 'mental' },
  physical: { title: 'Physical discomfort or tension affects settling', text: 'You identified physical discomfort or tension as a barrier to settling. Note what you feel and when it makes it harder to become comfortable or interrupts your rest.', experiment: 'Record when discomfort or tension makes it hard to settle, how long it lasts, and what helps you feel more comfortable. Keep those observations alongside your sleep times and how you feel the next day.', tag: null },
  emotional: { title: 'Emotions or worries affect settling', text: 'You identified emotions, worry or unsettled interactions as a barrier. The circumstances you describe provide a more useful starting point than assuming a sign explains the feeling.', experiment: 'Note what felt unresolved in the evening and what helped you feel settled. Look for repeated circumstances across several days.', tag: 'emotional' },
  environment: { title: 'Your surroundings affect rest', text: 'You identified the room, noise, light or interruptions as a barrier. Compare the specific disturbance with when and how often your sleep is interrupted.', experiment: 'Choose one practical disturbance you can change, such as light or noise, and compare several otherwise ordinary nights before and after that change.', tag: 'environment' },
  obligations: { title: 'Responsibilities limit your sleep', text: 'You identified work, caregiving or other obligations as the main difficulty. The schedule you currently keep may describe the time available to you more than the hours you would freely choose.', experiment: 'Compare one workday with one day off. Record the sleep you wanted, the time available, and which obligation changed it.', tag: 'obligations' },
  none: { title: 'You did not identify a settling barrier', text: 'You did not report a usual difficulty winding down. Keep attention on the parts of your routine that work, your total sleep and daytime alertness.', experiment: 'Record a few ordinary days when rest goes well so you can identify what is already helping.', tag: null },
  unknown: { title: 'No single barrier stands out yet', text: 'You were unsure what most affects settling. Brief notes about timing, activities, surroundings and daytime alertness can reveal a useful pattern without requiring a personality label.', experiment: 'For a week, note one evening circumstance and how settling felt. Look for repetition before choosing something to change.', tag: null }
};

const energyDescriptions = {
  steady: ['You describe steady energy', 'You described your energy as fairly steady. Observe whether that remains true across different activities and after different amounts of sleep.'],
  bursts: ['You describe bursts of activity', 'You described periods of strong activity followed by a need to pause. Record the length and demands of those periods and whether the pauses restore you.'],
  variable: ['Your energy varies from day to day', 'You described variable energy. Sleep opportunity, demands and the day’s circumstances are useful things to record alongside that variation.'],
  unknown: ['Your energy pattern is still unclear', 'You have not identified a usual energy pattern. You can leave this open while you observe a few ordinary days.']
};

const sharedThemes = {
  routine: 'predictable hours and a clear end to the day',
  environment: 'a settled sleeping environment',
  mental: 'mental activity that continues into bedtime',
  emotional: 'emotional ease and settled relationships',
  physical: 'the relationship between activity and recovery',
  flexible: 'variation in timing or the way rest is arranged',
  obligations: 'the effect of responsibilities on rest',
  rest: 'making room for rest before exhaustion'
};

const yearElementReflections = {
  Wood: 'The guide’s Wood reflection concerns restlessness and changing activity. Consider when you feel ready to stop and whether that changes with the season or the demands of the day.',
  Fire: 'The guide’s Fire reflection concerns late activity and settling the evening. Consider what helps you move from activity into a comfortable period of rest.',
  Earth: 'The guide’s Earth reflection concerns daily routines and meal timing. Consider which familiar parts of the day help you keep room for sleep.',
  Metal: 'The guide’s Metal reflection concerns precise hours and emotional reflection. Consider whether a dependable routine or time to acknowledge lingering feelings changes how you settle.',
  Water: 'The guide’s Water reflection concerns longer, deeper rest. Consider how the amount you sleep relates to feeling restored when you wake.'
};

function naturalList(values) {
  if (values.length < 2) return values[0] || '';
  return values.length === 2 ? values.join(' and ') : values.slice(0,-1).join(', ') + ' and ' + values.at(-1);
}

function compareProfile(theme, observed, answers) {
  const name = observed.name || 'your reported arrangement';
  const key = observed.key || 'unclear';
  if (key === 'unclear') return {
    label: 'Sleep comparison still open',
    text: 'Your sleep answers do not yet establish one usual arrangement. The tradition profile can still offer reflection questions; review the uncertain sleep answers before comparing arrangements.'
  };
  if (theme.open) return {
    label: 'No fixed arrangement in this profile',
    text: 'The guide allows a personally chosen pattern here, so ' + name + ' cannot confirm or contradict this broad association. Compare its themes with the circumstances you actually reported.'
  };
  const similar = theme.patterns.includes(key);
  const related = theme.related.includes(key);
  let text = similar
    ? 'Your reported ' + name + ' arrangement is included in this profile’s associations in the guide. That is a similarity in description; total sleep, comfort and daytime functioning still determine how the routine is working for you.'
    : related
      ? 'Your reported ' + name + ' shares part of this profile’s arrangement or context, but the guide’s description is broader than the details you gave. Keep the actual pattern name and use the comparison to choose what to observe.'
      : 'You reported ' + name + ', while this guide profile emphasizes a different arrangement. Both descriptions can remain in your report. Your answers describe the routine you currently keep; the tradition gives you a question to consider.';
  if (['segmented','segmented_naps'].includes(key) && answers.waking === 'trouble') {
    text += ' You also reported struggling to return to sleep, so the comfort and effect of those awakenings need attention even when the arrangement resembles the guide’s description.';
  }
  return { label: similar ? 'Similar arrangement in the guide' : related ? 'Partial overlap with the guide' : 'Different arrangement from the guide', text };
}

function profileSubtitle(group, record, selection) {
  if (group === 'western') {
    const basis = selection.westernBasis === 'calculated' ? 'Sun sign calculated from birth details' : selection.westernBasis === 'date_range' ? 'Sun-sign date-range estimate'
      : selection.westernBasis === 'confirmed' ? 'Sun sign confirmed by you' : 'Sun sign selected by you';
    return record.element + ' element · ' + basis;
  }
  if (group === 'chinese') {
    if (selection.chineseBasis === 'lunar_new_year' && Number.isInteger(selection.chineseYear) && selection.chineseElement && selection.chinesePolarity) {
      return selection.chineseYear + ' lunar year · ' + selection.chinesePolarity + ' ' + selection.chineseElement + ' ' + record.name;
    }
    return 'Animal sign selected by you';
  }
  return selection.humanDesignBasis==='calculated'?'Type calculated from birth date, local time and time zone':'Type from the Human Design chart you selected';
}

/** Build a shared web/PDF reading without inferring an observed pattern from a birth profile. */
export function buildPersonalProfile(answers = {}, selection = {}, observed = {}, chart = null) {
  const selected = selectionRecords(selection).filter(({record}) => record).map(item => ({...item, theme: personalThemes[item.group][item.record.id]}));
  const name = observed.name || 'the arrangement described in your sleep result';
  const summary = ['Your current sleep result is ' + name + '. It comes from your answers about sleep and naps over the past two weeks.'];
  const preferences = [];
  const experiments = [];
  const cards = selected.map(({group,title,record,theme}) => {
    const paragraphs = [theme.temperament, theme.rest, 'Sleep association in the guide: ' + record.affinity];
    if (theme.extra) paragraphs.push(theme.extra);
    if (group === 'western' && selection.westernBasis === 'date_range') {
      paragraphs.push('This uses the guide’s conventional Sun-sign date ranges. A full birth chart uses the exact birth time and place, especially near a sign change.');
    }
    if(group==='western'&&chart)paragraphs.push('The calculated Moon sign is '+chart.western.moon.name+'. The Field Guide’s sleep comparison uses your Sun sign; the Moon sign is additional chart context.');
    if (group === 'chinese') {
      if (selection.chineseBasis === 'lunar_new_year' && Number.isInteger(selection.chineseYear) && selection.chineseElement && selection.chinesePolarity) {
        paragraphs.push('Your birth-year label uses the Lunar New Year convention. The ' + selection.chineseElement + ' year element belongs to the year’s heavenly stem. The guide separately groups ' + record.name + ' with ' + record.phase.toLowerCase() + ' as a temperament theme; these two labels describe different parts of the tradition.');
        if (yearElementReflections[selection.chineseElement]) paragraphs.push('Applying the guide’s general five-phase reflection to your year element: ' + yearElementReflections[selection.chineseElement]);
      } else {
        paragraphs.push('The guide’s temperament grouping for this animal is ' + record.phase.toLowerCase() + '. A birth-year element can be added when the birth date is used to establish the lunar year.');
      }
    }
    if (group === 'humanDesign') {
      if(chart)paragraphs.push('Your calculated chart has '+chart.humanDesign.authorityName+' authority and a '+chart.humanDesign.profile+' profile. The chart details above explain these traditional categories.');
      paragraphs.push('This follows the guide’s rest teaching for your '+(chart?'calculated':'selected')+' waking type. Human Design’s separate DreamRave sleeping chart uses different calculations and may have a different type. This report does not calculate a DreamRave chart.');
    }
    const challenge = restChallenges[answers.restChallenge];
    if (challenge?.tag && theme.tags.includes(challenge.tag)) {
      paragraphs.push('You also reported ' + ({mental:'an active mind',emotional:'emotions or worry',environment:'the sleeping environment',obligations:'responsibilities'}[challenge.tag]) + ' as something that affects settling. That gives this theme a specific connection to your own answers.');
    }
    return { key: group, title: title + ': ' + record.name, subtitle: profileSubtitle(group,record,selection), paragraphs, comparison: compareProfile(theme,observed,answers), reflection: theme.reflection, sourcePages: [...new Set([...record.sourcePages,...(theme.extra ? [23] : []),...(group==='chinese' && selection.chineseElement ? [20] : [])])].sort((a,b)=>a-b) };
  });
  if (selected.length) {
    summary.push('Your profiles are ' + naturalList(selected.map(item=>item.record.name)) + '. Their meanings below come from the Field Guide’s traditional interpretations.');
    const shared = Object.entries(sharedThemes).map(([key,text]) => ({key,text,members:selected.filter(item=>item.theme.tags.includes(key))})).filter(item=>item.members.length>1).sort((a,b)=>b.members.length-a.members.length).slice(0,2);
    if (shared.length) {
      for (const item of shared) summary.push(naturalList(item.members.map(member=>member.record.name)) + ' share a theme of ' + item.text + ' in the guide. Compare that theme with the preferences and circumstances you reported.');
    } else if (selected.length>1) {
      summary.push('These profiles emphasize different aspects of rest. Use each reflection to examine a concrete experience instead of trying to make every tradition prescribe the same schedule.');
    }
    const overlaps=cards.filter(card=>card.comparison.label==='Similar arrangement in the guide');
    const differences=cards.filter(card=>card.comparison.label==='Different arrangement from the guide');
    if (overlaps.length && differences.length) summary.push('The comparisons include both similarities and differences. A difference does not mean you answered incorrectly or that your current pattern needs to be changed to match a sign.');
  } else {
    summary.push('No birth-profile signs or Human Design type were supplied. Your sleep result and any preferences you described remain available, and you can add the traditional profiles when you know them.');
  }
  const missing=[];
  if (!selection.western) missing.push('Western Sun sign');
  if (!selection.chinese) missing.push('Chinese animal sign');
  if (!selection.humanDesign) missing.push('Human Design type');
  if (selected.length && missing.length) summary.push(naturalList(missing) + (missing.length===1?' was':' were') + ' not supplied, so those parts of the reading remain open.');
  if (!selection.humanDesign) summary.push('Human Design is left unknown until you add a full birth date, local birth time and birthplace, or supply a type from a chart you already have. Birth date alone does not establish that type.');
  const hours=preferredHours[answers.chronotype];
  if (hours) {
    const paragraphs=[hours[1], 'This is your self-described timing preference. It does not establish an inborn or permanent sleep requirement.'];
    if (answers.alertness==='D') paragraphs.push('You also reported that afternoons are usually part of your main sleep. Compare your preferred hours with the hours your current schedule requires.');
    preferences.push({title:hours[0],paragraphs});
  }
  const challenge=restChallenges[answers.restChallenge];
  if (challenge) {
    preferences.push({title:challenge.title,paragraphs:[challenge.text]});
    experiments.push({title:'Observe what most affects your rest',text:challenge.experiment});
  }
  const energy=energyDescriptions[answers.energyStyle];
  if (energy) {
    const paragraphs=[energy[1]];
    if (selection.humanDesign && answers.energyStyle!=='unknown') paragraphs.push('Compare this self-description with your selected Human Design profile below. Agreement or difference does not verify or change a chart-derived type.');
    preferences.push({title:energy[0],paragraphs});
  }
  if (Number.isInteger(answers.total) && answers.total<420) experiments.unshift({title:'Start with your reported amount of sleep',text:'Your full-day total is below seven hours. Review the age-based duration guidance in your sleep result before experimenting with the arrangement. A traditional affinity is not a reason to reduce sleep further.'});
  if (answers.alertness==='C' || answers.sleepyDriving==='yes') experiments.unshift({title:'Give unwanted sleepiness priority',text:'Review the daytime-alertness guidance in your sleep result first. A sign or type association does not explain away dozing when you intended to stay awake.'});
  if (answers.chronotype && !['unknown','variable'].includes(answers.chronotype)) experiments.push({title:'Compare preferred and required hours',text:'Record a workday and a free day. Compare the hours you choose, the hours obligations require, your total sleep and your alertness.'});
  experiments.push({title:'Use the profile as a question to investigate',text:selected.length?'Choose one reflection from your personal profile and follow it alongside your sleep diary. Keep the schedule that provides adequate rest and fits your life; revise an interpretation when your observations disagree.':'Keep a brief record of your usual sleep and naps, including what changes on days off. You can compare that record with a birth profile later.'});
  const sources=[{title:'Sleep Patterns: A Field Guide, Part Two, pages 17–23',url:'https://mike-cloudforest.github.io/sleep-patterns-diagnostic/assets/Sleep-Patterns-Guide.pdf'}];
  if (selection.westernBasis==='date_range') sources.push({title:'Astrodienst: why Sun-sign boundary dates need birth details',url:'https://www.astro.com/faq/fq_ua_general_e.htm'});
  if(chart)sources.push({title:'Birth chart calculation methods and accuracy',url:'https://github.com/domalhambra/hd-chart-engine'});
  if (selection.chineseBasis==='lunar_new_year') sources.push(
    {title:'Hong Kong Observatory: Lunar New Year and the year convention',url:'https://www.hko.gov.hk/en/education/astronomy-and-time/time-service/00506-what-year-is-it-today.html'},
    {title:'Hong Kong Observatory: heavenly stems and earthly branches',url:'https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm'}
  );
  sources.push({title:'Jovian Archive: find your Human Design birth chart',url:'https://jovianarchive.com/pages/get-your-human-design-chart'});
  if (selection.humanDesign) sources.push({title:'Jovian Archive: the separate DreamRave sleeping chart',url:'https://jovianarchive.com/pages/understanding-dreams-with-human-design'});
  return {
    title:'Your sleep and personal profile',
    introduction:'Your answers describe your current sleep and your own preferences. The Field Guide adds Western astrology, Chinese zodiac and Human Design interpretations for reflection. Those traditions do not establish a biological sleep need or a measured personality type.',
    summary,cards,preferences,experiments,
    sources
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

function sourceLabel(pages) {
  return 'Guide ' + (pages.length === 1 ? 'page ' : 'pages ') + pages.join(', ');
}

function referenceTable(headers, rows) {
  return '<div class="tradition-table-scroll"><table><thead><tr>' +
    headers.map(header => '<th scope="col">' + escapeHtml(header) + '</th>').join('') +
    '</tr></thead><tbody>' +
    rows.map(row => '<tr>' + row.map((cell, index) => index === 0
      ? '<th scope="row">' + escapeHtml(cell) + '</th>'
      : '<td>' + escapeHtml(cell) + '</td>').join('') + '</tr>').join('') +
    '</tbody></table></div>';
}

function referenceDetails(title, introduction, pages, content) {
  return '<details><summary>' + escapeHtml(title) + '</summary><p>' + escapeHtml(introduction) +
    '</p><p class="tradition-source">' + escapeHtml(sourceLabel(pages)) + '</p>' + content + '</details>';
}

export function renderTraditions(container, selection = {}, options = {}) {
  if (!container || typeof container.replaceChildren !== 'function') throw new TypeError('A DOM container is required.');
  const data = traditionsData;
  const groups = [
    { key: 'western', label: 'Your Western sign', records: data.western.signs },
    { key: 'chinese', label: 'Your Chinese zodiac animal', records: data.chinese.animals },
    { key: 'humanDesign', label: 'Your Human Design type', records: data.humanDesign.types }
  ];
  const current = Object.fromEntries(groups.map(group => [group.key, group.records.some(record => record.id === selection[group.key]) ? selection[group.key] : '']));
  const choices = groups.map(group => '<label>' + escapeHtml(group.label) +
    '<select data-tradition="' + group.key + '"><option value="">Skip / I don’t know</option>' +
    group.records.map(record => '<option value="' + record.id + '"' +
      (record.id === current[group.key] ? ' selected' : '') + '>' + escapeHtml(record.name) + '</option>').join('') +
    '</select></label>').join('');

  const western = referenceDetails('Western signs and elements', data.western.introduction, data.western.sourcePages,
    referenceTable(['Element', 'Signs', 'The guide’s association', 'Pattern'], data.western.elements.map(item => [item.name, item.signs, item.summary, item.affinity])) +
    referenceTable(['Sign', 'Dates in the guide', 'The guide’s association', 'Pattern', 'Source'], data.western.signs.map(item => [item.name, item.dates, item.summary, item.affinity, sourceLabel(item.sourcePages)])));

  const chinese = referenceDetails('Chinese zodiac and five phases', data.chinese.introduction, data.chinese.sourcePages,
    referenceTable(['Animal', 'Guide’s phase grouping', 'The guide’s association', 'Pattern', 'Source'], data.chinese.animals.map(item => [item.name, item.phase, item.summary, item.affinity, sourceLabel(item.sourcePages)])) +
    referenceTable(['Phase', 'The guide’s association'], data.chinese.phases.map(item => [item.name, item.summary])));

  const clock = referenceDetails(data.organClock.title, data.organClock.introduction, data.organClock.sourcePages,
    referenceTable(['Time', 'Traditional organ system'], data.organClock.windows.map(item => [item.start + '–' + item.end, item.organ])));

  const humanDesign = referenceDetails('Human Design types', data.humanDesign.introduction, data.humanDesign.sourcePages,
    referenceTable(['Type', 'Share quoted by the guide', 'The guide’s teaching', 'Pattern', 'Source'], data.humanDesign.types.map(item => [item.name, item.share, item.summary, item.affinity, sourceLabel(item.sourcePages)])) +
    '<p>' + escapeHtml(data.humanDesign.sharedTeaching) + '</p>');

  const comparison = referenceDetails(data.comparison.title, data.comparison.introduction, data.comparison.sourcePages,
    referenceTable(['Sleep pattern', 'Western association', 'Chinese association', 'Human Design association'],
      data.comparison.rows.map(item => [item.pattern, item.western, item.chinese, item.humanDesign])));

  container.innerHTML = `
    <style>
      .sleep-traditions p { line-height: 1.55; margin: .6rem 0; }
      .sleep-traditions .tradition-selects { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); gap: 1rem; margin: 1rem 0; }
      .sleep-traditions label { display: block; font-weight: 600; }
      .sleep-traditions select { display: block; width: 100%; min-height: 2.75rem; margin-top: .4rem; padding: .5rem; font: inherit; background: white; color: #172033; border: 1px solid #aeb9c8; border-radius: .35rem; }
      .sleep-traditions details { margin-top: 1rem; border-top: 1px solid #ccd5df; padding-top: 1rem; }
      .sleep-traditions summary { cursor: pointer; font-weight: 600; padding: .3rem 0; }
      .sleep-traditions .tradition-source { font-size: .9rem; color: #4b5563; }
      .sleep-traditions .tradition-selected { border-left: 3px solid #698ba3; padding-left: 1rem; margin: 1.2rem 0; }
      .sleep-traditions .tradition-table-scroll { overflow-x: auto; margin: 1rem 0; }
      .sleep-traditions table { border-collapse: collapse; width: 100%; font-size: .95rem; line-height: 1.45; }
      .sleep-traditions th, .sleep-traditions td { text-align: left; vertical-align: top; padding: .65rem; border-bottom: 1px solid #dce1e9; min-width: 8rem; }
      .sleep-traditions th { font-weight: 600; }
      @media print { .sleep-traditions .tradition-selects { display: none; } }
    </style>
    <section class="sleep-traditions">
      <h2>${escapeHtml(options.referenceOnly ? 'Explore the guide’s traditions' : data.title)}</h2>
      <p>${escapeHtml(data.introduction)}</p>
      ${options.referenceOnly ? '' : `<p>Choose any sign, animal or type you already know. Every choice is optional.</p>
      <div class="tradition-selects">${choices}</div>
      <div data-tradition-cards aria-live="polite"></div>`}
      ${western}${chinese}${clock}${humanDesign}${comparison}
    </section>`;

  function updateCards() {
    const cards = getTraditionReport(current).slice(1);
    container.querySelector('[data-tradition-cards]').innerHTML = cards.map(card =>
      '<article class="tradition-selected"><h3>' + escapeHtml(card.title) + '</h3>' +
      card.paragraphs.map(paragraph => '<p>' + escapeHtml(paragraph) + '</p>').join('') +
      '<p class="tradition-source">' + escapeHtml(sourceLabel(card.sourcePages)) + '</p></article>'
    ).join('');
  }
  if (!options.referenceOnly) updateCards();
  container.querySelectorAll('select[data-tradition]').forEach(select => {
    select.addEventListener('change', () => {
      current[select.dataset.tradition] = select.value;
      updateCards();
      const EventConstructor = container.ownerDocument.defaultView.CustomEvent;
      container.dispatchEvent(new EventConstructor('traditionschange', { bubbles: true, detail: { ...current } }));
    });
  });
  return { getSelection: () => ({ ...current }) };
}
