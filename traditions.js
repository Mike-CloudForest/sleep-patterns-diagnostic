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

export function renderTraditions(container, selection = {}) {
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
      <h2>${escapeHtml(data.title)}</h2>
      <p>${escapeHtml(data.introduction)}</p>
      <p>Choose any sign, animal or type you already know. Every choice is optional.</p>
      <div class="tradition-selects">${choices}</div>
      <div data-tradition-cards aria-live="polite"></div>
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
  updateCards();
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
