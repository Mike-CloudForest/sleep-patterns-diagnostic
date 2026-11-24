import { DateTime, createAstronomyEngine, findDesignJD, longitudeToActivation } from './vendor/chart-engine.js';

export const BIRTH_CHART_VERSION = 'cf-chart-1';
export const birthChartSources = [
  { title: 'Jovian Archive: birth data and chart calculation', url: 'https://jovianarchive.com/pages/get-your-human-design-chart' },
  { title: 'Jovian Archive: Human Design definitions', url: 'https://jovianarchive.com/pages/human-design-dictionary' },
  { title: 'Chart calculation engine and accuracy notes', url: 'https://github.com/domalhambra/hd-chart-engine' },
  { title: 'Astronomy Engine: astronomical calculations', url: 'https://github.com/cosinekitty/astronomy' },
  { title: 'IANA: historical time-zone limitations', url: 'https://data.iana.org/time-zones/theory.html#accuracy' }
];

export class ChartInputError extends Error {
  constructor(code, message, choices) {
    super(message);
    this.name = 'ChartInputError';
    this.code = code;
    if (choices) this.choices = choices;
  }
}

const fail = (code, message, choices) => { throw new ChartInputError(code, message, choices); };
const isObject = value => value && typeof value === 'object' && !Array.isArray(value);
const BODY_IDS = Object.freeze(['sun', 'earth', 'moon', 'north_node', 'south_node', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']);
export const HUMAN_DESIGN_CENTERS = Object.freeze(['head', 'ajna', 'throat', 'g', 'sacral', 'spleen', 'solar_plexus', 'ego', 'root']);
const MOTORS = ['sacral', 'solar_plexus', 'ego', 'root'];
const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const TYPE_NAMES = { generator: 'Generator', manifesting_generator: 'Manifesting Generator', projector: 'Projector', manifestor: 'Manifestor', reflector: 'Reflector' };
const AUTHORITY_NAMES = {
  emotional: 'Emotional (Solar Plexus)', sacral: 'Sacral', splenic: 'Splenic',
  ego_manifested: 'Ego Manifested', ego_projected: 'Ego Projected',
  self_projected: 'Self-Projected', environmental: 'Environmental (Mental Projector)', lunar: 'Lunar (Reflector)'
};
const VALID_PROFILES = new Set(['1/3', '1/4', '2/4', '2/5', '3/5', '3/6', '4/6', '4/1', '5/1', '5/2', '6/2', '6/3']);

// Fixed BodyGraph topology. References: Jovian Archive's dictionary; the
// MIT bodygraph reference in adamblvck/free-human-design (attribution in vendor).
const CENTER_GATES = {
  head: [64, 61, 63], ajna: [47, 24, 4, 17, 11, 43],
  throat: [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16],
  g: [1, 13, 25, 46, 2, 15, 10, 7],
  sacral: [34, 5, 14, 29, 59, 9, 3, 42, 27],
  spleen: [48, 57, 44, 50, 32, 28, 18],
  solar_plexus: [6, 37, 30, 55, 49, 22, 36],
  ego: [21, 40, 26, 51], root: [53, 60, 52, 19, 39, 41, 58, 38, 54]
};
const GATE_CENTER = new Map(Object.entries(CENTER_GATES).flatMap(([center, gates]) => gates.map(gate => [gate, center])));
const CHANNEL_PAIRS = [
  [1, 8], [2, 14], [3, 60], [4, 63], [5, 15], [6, 59], [7, 31], [9, 52],
  [10, 20], [10, 34], [10, 57], [11, 56], [12, 22], [13, 33], [16, 48], [17, 62],
  [18, 58], [19, 49], [20, 34], [20, 57], [21, 45], [23, 43], [24, 61], [25, 51],
  [26, 44], [27, 50], [28, 38], [29, 46], [30, 41], [32, 54], [34, 57], [35, 36],
  [37, 40], [39, 55], [42, 53], [47, 64]
];

function formatOffset(minutes) {
  const seconds = Math.round(Math.abs(minutes) * 60);
  const hours = Math.floor(seconds / 3600);
  const remainder = seconds % 3600;
  return 'UTC' + (minutes < 0 ? '-' : '+') + String(hours).padStart(2, '0') + ':'
    + String(Math.floor(remainder / 60)).padStart(2, '0')
    + (remainder % 60 ? ':' + String(remainder % 60).padStart(2, '0') : '');
}

/**
 * Strictly resolve the local civil birth time. This private calculation result
 * includes the instant; calculateBirthChart deliberately leaves it out of its
 * public result. Coordinates are optional because these are geocentric charts.
 */
export function resolveBirthMoment(details, { now = new Date() } = {}) {
  if (!isObject(details) || typeof details.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(details.date)) {
    fail('invalid_birth_date', 'Enter the complete birth date, including month, day and year.');
  }
  const [year, month, day] = details.date.split('-').map(Number);
  const calendarDate = DateTime.fromObject({ year, month, day }, { zone: 'UTC' });
  if (!calendarDate.isValid || year < 1900 || year > 2100) {
    fail('invalid_birth_date', 'Enter a valid birth date from 1900 onward.');
  }
  if (!['exact', 'approximate', 'unknown'].includes(details.timeAccuracy)) {
    fail('invalid_time_accuracy', 'Tell us whether the recorded birth time is known, approximate or unknown.');
  }
  if (details.timeAccuracy === 'unknown') {
    fail('birth_time_unknown', 'A Human Design chart needs a birth time. Leave it unknown to continue with the date-based profiles.');
  }
  if (typeof details.time !== 'string' || !/^\d{2}:\d{2}(?::\d{2})?$/.test(details.time)) {
    fail('invalid_birth_time', 'Enter the birth time using hours and minutes.');
  }
  const [hour, minute, second = 0] = details.time.split(':').map(Number);
  if (hour > 23 || minute > 59 || second > 59) fail('invalid_birth_time', 'Enter a valid birth time.');
  const place = details.place;
  if (!isObject(place) || typeof place.label !== 'string' || !place.label.trim() || place.label.length > 200 || /[\u0000-\u001f\u007f]/.test(place.label)) {
    fail('invalid_birth_place', 'Choose your birthplace, or enter its name and time zone.');
  }
  const hasLatitude = place.latitude !== undefined;
  const hasLongitude = place.longitude !== undefined;
  if (hasLatitude !== hasLongitude || (hasLatitude && (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude) || Math.abs(place.latitude) > 90 || Math.abs(place.longitude) > 180))) {
    fail('invalid_birth_place', 'Review the birthplace coordinates, or leave both coordinates out.');
  }
  if (place.countryCode !== undefined && (typeof place.countryCode !== 'string' || !/^[A-Z]{2}$/.test(place.countryCode))) {
    fail('invalid_birth_place', 'Review the country selected for the birthplace.');
  }
  if (typeof place.timeZone !== 'string' || !place.timeZone || place.timeZone.length > 100) {
    fail('invalid_time_zone', 'Choose the birthplace time zone.');
  }
  try { new Intl.DateTimeFormat('en-US', { timeZone: place.timeZone }).format(now); }
  catch { fail('invalid_time_zone', 'Choose a valid IANA time zone for the birthplace.'); }
  if (details.timeOccurrence !== undefined && !['earlier', 'later'].includes(details.timeOccurrence)) {
    fail('invalid_time_occurrence', 'Choose the earlier or later occurrence of the repeated clock time.');
  }
  const parts = { year, month, day, hour, minute, second };
  const local = DateTime.fromObject(parts, { zone: place.timeZone });
  if (!local.isValid) fail('invalid_time_zone', 'The birthplace time zone could not be resolved.');
  // Luxon otherwise moves a nonexistent clock time forward silently. Compare
  // the entire civil date too: some historical transitions skipped a day.
  if (Object.entries(parts).some(([key, value]) => local[key] !== value)) {
    fail('nonexistent_birth_time', 'That clock time did not occur in this place because the clocks changed. Check the time or time zone on the birth record.');
  }
  const candidates = local.getPossibleOffsets().sort((a, b) => a.toMillis() - b.toMillis());
  const unique = candidates.filter((candidate, index) => !index || candidate.toMillis() !== candidates[index - 1].toMillis());
  if (unique.length > 1 && !details.timeOccurrence) {
    fail('ambiguous_birth_time', 'The clocks repeated this time on that date. Select which recorded offset applies before calculating the chart.', [
      { occurrence: 'earlier', offsetMinutes: unique[0].offset, label: 'Earlier occurrence (' + formatOffset(unique[0].offset) + ')' },
      { occurrence: 'later', offsetMinutes: unique.at(-1).offset, label: 'Later occurrence (' + formatOffset(unique.at(-1).offset) + ')' }
    ]);
  }
  const chosen = details.timeOccurrence === 'later' ? unique.at(-1) : unique[0];
  if (chosen.toMillis() > now.getTime()) fail('future_birth_date', 'The birth date and time must be in the past.');
  const warnings = [];
  if (details.timeAccuracy === 'approximate') warnings.push('The birth time is approximate. A different time can change the Moon sign, Human Design gates, profile, type or authority.');
  if (year < 1970) warnings.push('Historical time-zone records before 1970 may be incomplete. Check the local offset on the birth record if it is available.');
  return {
    utcDateTime: chosen.toUTC().toISO(),
    utcOffsetMinutes: chosen.offset,
    julianDay: chosen.toMillis() / 86400000 + 2440587.5,
    timeZone: place.timeZone,
    warnings
  };
}

/** Derive fixed BodyGraph relationships from already calculated activations. */
export function deriveHumanDesign(activations) {
  const all = [...activations.personality, ...activations.design];
  if (all.some(a => !BODY_IDS.includes(a.body) || !Number.isInteger(a.gate) || a.gate < 1 || a.gate > 64 || !Number.isInteger(a.line) || a.line < 1 || a.line > 6)) {
    fail('computation_failed', 'The chart activations could not be verified.');
  }
  const gates = new Set(all.map(a => a.gate));
  const channels = CHANNEL_PAIRS.filter(pair => pair.every(gate => gates.has(gate))).map(pair => ({
    id: pair.join('-'), gates: [...pair], centers: pair.map(gate => GATE_CENTER.get(gate))
  }));
  const adjacency = new Map();
  for (const channel of channels) {
    const [first, second] = channel.centers;
    if (!adjacency.has(first)) adjacency.set(first, new Set());
    if (!adjacency.has(second)) adjacency.set(second, new Set());
    adjacency.get(first).add(second);
    adjacency.get(second).add(first);
  }
  const definedCenters = HUMAN_DESIGN_CENTERS.filter(center => adjacency.has(center));
  function reaches(from, to) {
    if (!adjacency.has(from) || !adjacency.has(to)) return false;
    const queue = [from], seen = new Set(queue);
    for (let index = 0; index < queue.length; index++) {
      const current = queue[index];
      if (current === to) return true;
      for (const next of adjacency.get(current)) if (!seen.has(next)) { seen.add(next); queue.push(next); }
    }
    return false;
  }
  const sacral = adjacency.has('sacral');
  const motorToThroat = MOTORS.some(motor => reaches(motor, 'throat'));
  const type = !definedCenters.length ? 'reflector' : sacral ? (motorToThroat ? 'manifesting_generator' : 'generator') : motorToThroat ? 'manifestor' : 'projector';
  let authority;
  if (type === 'reflector') authority = 'lunar';
  else if (adjacency.has('solar_plexus')) authority = 'emotional';
  else if (sacral) authority = 'sacral';
  else if (adjacency.has('spleen')) authority = 'splenic';
  else if (adjacency.has('ego')) authority = reaches('ego', 'throat') ? 'ego_manifested' : 'ego_projected';
  else if (reaches('g', 'throat')) authority = 'self_projected';
  else authority = 'environmental';
  const components = [];
  for (const center of definedCenters) if (!components.some(group => group.some(other => reaches(center, other)))) components.push([center]);
  const definition = ['none', 'single', 'split', 'triple_split', 'quadruple_split'][components.length];
  const pSun = activations.personality.find(a => a.body === 'sun');
  const dSun = activations.design.find(a => a.body === 'sun');
  if (!pSun || !dSun || !definition) fail('computation_failed', 'The chart structure could not be verified.');
  const profile = pSun.line + '/' + dSun.line;
  return { type, typeName: TYPE_NAMES[type], authority, authorityName: AUTHORITY_NAMES[authority], profile, definition, definedCenters, channels, activations };
}

const normalize = angle => ((angle % 360) + 360) % 360;
function signFor(longitude) {
  const name = SIGNS[Math.floor(normalize(longitude) / 30)];
  return { id: name.toLowerCase(), name };
}
function nearEdge(value, width) {
  const remainder = normalize(value) % width;
  return Math.min(remainder, width - remainder) < 1 / 60;
}

/** Calculate locally; the returned chart deliberately excludes birth inputs. */
export function calculateBirthChart(details, options) {
  const moment = resolveBirthMoment(details, options);
  try {
    const engine = createAstronomyEngine();
    const designJD = findDesignJD(moment.julianDay, jd => engine.sunLongitude(jd));
    const personality = engine.bodyLongitudes(moment.julianDay);
    const design = engine.bodyLongitudes(designJD);
    const map = longitudes => BODY_IDS.map(body => {
      const longitude = longitudes[body];
      if (!Number.isFinite(longitude)) throw new Error('Missing planetary longitude.');
      const activation = longitudeToActivation(longitude);
      return { body, gate: activation.g, line: activation.l };
    });
    const humanDesign = deriveHumanDesign({ personality: map(personality), design: map(design) });
    if (!VALID_PROFILES.has(humanDesign.profile)) throw new Error('Unexpected Human Design profile.');
    const warnings = [...moment.warnings];
    if (nearEdge(personality.sun, 30) || nearEdge(personality.moon, 30)) {
      warnings.push('The calculated Sun or Moon is close to a zodiac boundary. Confirm the recorded birth time before relying on that sign.');
    }
    if ([personality, design].some(lons => BODY_IDS.some(body => nearEdge(normalize(lons[body] - 223.25), 5.625))) || [personality.sun, design.sun].some(lon => nearEdge(normalize(lon - 223.25), 0.9375))) {
      warnings.push('An activation is close to a Human Design gate or profile-line boundary. Small differences in birth time or astronomical calculations may change part of this chart.');
    }
    return {
      version: BIRTH_CHART_VERSION,
      western: { sun: signFor(personality.sun), moon: signFor(personality.moon) },
      humanDesign,
      warnings,
      precision: details.timeAccuracy === 'approximate' ? 'approximate-time' : 'entered-time'
    };
  } catch (error) {
    if (error instanceof ChartInputError) throw error;
    fail('computation_failed', 'The birth chart could not be calculated. Review the birth details and try again.');
  }
}
