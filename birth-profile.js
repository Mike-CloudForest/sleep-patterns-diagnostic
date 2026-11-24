// Birth-date lookups run entirely in the browser. No date or other birth data
// is sent to a chart provider, and the returned profile contains no birth date.
// This module identifies traditional labels; it does not infer sleep needs.

export const BIRTH_PROFILE_MIN_YEAR = 1900;

export const birthProfileSources = [
  {
    id: 'western_boundary',
    title: 'Astrodienst — Sun-sign changes and birth details',
    url: 'https://www.astro.com/faq/fq_ua_general_e.htm',
    note: 'The Sun changes signs at a different time each year. The Field Guide’s date ranges give an approximate tropical Sun sign; a birth chart can resolve a boundary date using birth time and place.'
  },
  {
    id: 'chinese_calendar',
    title: 'Hong Kong Observatory — Gregorian–lunar calendar conversion',
    url: 'https://www.hko.gov.hk/en/gts/time/conversion1_text.htm',
    note: 'The Chinese birth-year lookup uses the lunar year containing the birth date, so January and February births can belong to the previous zodiac year.'
  },
  {
    id: 'chinese_year_boundary',
    title: 'Hong Kong Observatory — When the Chinese year begins',
    url: 'https://www.hko.gov.hk/en/education/astronomy-and-time/time-service/00506-what-year-is-it-today.html',
    note: 'This app follows the Lunar New Year convention used by the Observatory. Some Four Pillars traditions use the solar term Spring Commences instead; a full Four Pillars reading needs its own calculation.'
  },
  {
    id: 'chinese_cycle',
    title: 'Hong Kong Observatory — Heavenly stems and earthly branches',
    url: 'https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm',
    note: 'The year’s stem and branch form a 60-year cycle. Its year element and yin/yang label are separate from the Field Guide’s animal temperament groupings.'
  },
  {
    id: 'chinese_stem_elements',
    title: 'Emperor’s College — The ten heavenly stems',
    url: 'https://www.emperors.edu/wp-content/uploads/masters/syllabi/OM315%20Notes.pdf',
    note: 'The stem pairs are Wood, Fire, Earth, Metal and Water, with yang followed by yin in each pair.'
  },
  {
    id: 'human_design_chart',
    title: 'Jovian Archive — Human Design chart',
    url: 'https://jovianarchive.com/pages/get-your-human-design-chart',
    note: 'Human Design uses birth date, exact time and place to calculate a chart. Enter a type from a chart you already have, or use the provider’s chart tool and return with the result.'
  }
];

const westernSigns = [
  { id: 'capricorn', name: 'Capricorn', month: 1, day: 1 },
  { id: 'aquarius', name: 'Aquarius', month: 1, day: 20 },
  { id: 'pisces', name: 'Pisces', month: 2, day: 19 },
  { id: 'aries', name: 'Aries', month: 3, day: 21 },
  { id: 'taurus', name: 'Taurus', month: 4, day: 20 },
  { id: 'gemini', name: 'Gemini', month: 5, day: 21 },
  { id: 'cancer', name: 'Cancer', month: 6, day: 21 },
  { id: 'leo', name: 'Leo', month: 7, day: 23 },
  { id: 'virgo', name: 'Virgo', month: 8, day: 23 },
  { id: 'libra', name: 'Libra', month: 9, day: 23 },
  { id: 'scorpio', name: 'Scorpio', month: 10, day: 23 },
  { id: 'sagittarius', name: 'Sagittarius', month: 11, day: 22 },
  { id: 'capricorn', name: 'Capricorn', month: 12, day: 22 }
];

const animalNames = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
const stemElements = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'];
const positiveModulo = (value, divisor) => ((value % divisor) + divisor) % divisor;

function referenceParts(referenceDate) {
  if (!(referenceDate instanceof Date) || !Number.isFinite(referenceDate.getTime())) {
    throw new TypeError('A valid reference date is required.');
  }
  return { year: referenceDate.getFullYear(), month: referenceDate.getMonth() + 1, day: referenceDate.getDate() };
}

function parseBirthDate(dateString, referenceDate) {
  if (typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new RangeError('Enter a valid birth date in YYYY-MM-DD format.');
  }
  const [year, month, day] = dateString.split('-').map(Number);
  const today = referenceParts(referenceDate);
  if (year < BIRTH_PROFILE_MIN_YEAR || year > today.year) {
    throw new RangeError('Enter a birth year from ' + BIRTH_PROFILE_MIN_YEAR + ' through ' + today.year + '.');
  }
  // UTC noon gives the calendar formatter the entered civil date, independent
  // of the device timezone. It is not an assumed birth time.
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) {
    throw new RangeError('Enter a real calendar date. Check the month and day.');
  }
  const dateNumber = year * 10000 + month * 100 + day;
  const todayNumber = today.year * 10000 + today.month * 100 + today.day;
  if (dateNumber > todayNumber) throw new RangeError('A birth date cannot be in the future.');
  return { year, month, day, date };
}

function westernFromDate({ month, day }) {
  const numericDay = month * 100 + day;
  const sign = westernSigns.filter(item => item.month * 100 + item.day <= numericDay).at(-1);
  // A conservative five-day window around each conventional date avoids
  // presenting an exact Sun sign on days affected by year and timezone.
  // This is a review flag, not an ephemeris calculation or a "cusp" type.
  const transitionIndex = westernSigns.findIndex((item, index) => index > 0 && item.month === month && Math.abs(day - item.day) <= 2);
  const boundary = transitionIndex > 0;
  return {
    id: sign.id,
    name: sign.name,
    boundary,
    candidates: boundary
      ? [westernSigns[transitionIndex - 1].id, westernSigns[transitionIndex].id]
      : [sign.id],
    method: boundary
      ? 'Approximate tropical Sun sign from the Field Guide’s date ranges. This date is near a sign change; confirm the sign from a chart using birth time and place.'
      : 'Approximate tropical Sun sign from the Field Guide’s date ranges.'
  };
}

function chineseFromDate({ year, month, date }) {
  try {
    if (typeof Intl === 'undefined' || typeof Intl.DateTimeFormat !== 'function') return null;
    const formatter = new Intl.DateTimeFormat('en-u-ca-chinese', {
      calendar: 'chinese', year: 'numeric', month: 'numeric', day: 'numeric',
      numberingSystem: 'latn', timeZone: 'UTC'
    });
    if (formatter.resolvedOptions().calendar !== 'chinese' || typeof formatter.formatToParts !== 'function') return null;
    const parts = formatter.formatToParts(date);
    const relatedYear = parts.find(part => part.type === 'relatedYear')?.value;
    // Never treat a Gregorian year fallback or a cycle year as the lunar year.
    if (!/^\d{4}$/.test(relatedYear || '')) return null;
    const lunarYear = Number(relatedYear);
    if (lunarYear !== year && !(month <= 2 && lunarYear === year - 1)) return null;
    const animal = animalNames[positiveModulo(lunarYear - 4, 12)];
    const stemIndex = positiveModulo(lunarYear - 4, 10);
    return {
      id: animal.toLowerCase(),
      name: animal,
      year: lunarYear,
      element: stemElements[stemIndex],
      polarity: stemIndex % 2 === 0 ? 'Yang' : 'Yin',
      method: 'Chinese birth-year sign using the Lunar New Year boundary. The element and yin/yang label come from the year’s heavenly stem.'
    };
  } catch {
    return null;
  }
}

/**
 * Derive traditional birth labels locally from a YYYY-MM-DD civil date.
 * referenceDate is optional and used only for current-date validation/testing.
 * Throws RangeError for malformed, impossible, pre-1900 or future dates.
 * Chinese calendar support is optional: western still succeeds if it is absent.
 * The result contains labels and methods only, never the birth date itself.
 */
export function deriveBirthProfile(dateString, referenceDate = new Date()) {
  const parsed = parseBirthDate(dateString, referenceDate);
  const result = { western: westernFromDate(parsed), chinese: chineseFromDate(parsed) };
  if (!result.chinese) {
    result.chineseUnavailable = 'This browser could not calculate the Chinese lunar year. Choose the animal from a chart you already know, or check the Hong Kong Observatory calendar.';
  }
  return result;
}

/** Whole years on a civil date; this helper does not determine consent rules. */
export function ageOnDate(dateString, referenceDate = new Date()) {
  const birth = parseBirthDate(dateString, referenceDate);
  const today = referenceParts(referenceDate);
  const birthdayPending = today.month < birth.month || (today.month === birth.month && today.day < birth.day);
  return today.year - birth.year - Number(birthdayPending);
}
