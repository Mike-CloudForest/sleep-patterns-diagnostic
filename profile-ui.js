import { traditionsData } from './traditions.js';
import { observationQuestions } from './assessment.js';
import { deriveBirthProfile, ageOnDate } from './birth-profile.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const preferenceIds = ['chronotype', 'restChallenge', 'energyStyle', 'scheduleFit', 'routinePreference', 'socialRecovery'];
const steps = ['Birth details', 'Chinese horoscope', 'Western horoscope', 'Human Design', 'Everyday rhythm'];
export const HUMAN_DESIGN_CHART_URL = 'https://jovianarchive.com/pages/get-your-human-design-chart';

function today() {
  const date = new Date();
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}
function ageRange(date) {
  const age = ageOnDate(date);
  return age < 18 ? 'under18' : age <= 60 ? '18_60' : age <= 64 ? '61_64' : '65_plus';
}
function selectOptions(records, selected, empty) {
  return '<option value="">' + escape(empty) + '</option>' + records.map(item => '<option value="' + escape(item.id) + '"' + (item.id === selected ? ' selected' : '') + '>' + escape(item.name) + '</option>').join('');
}
function pretty(value) {
  return String(value || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}
function cloneBirth(value) {
  if (!value || typeof value !== 'object') return { date: '', timeAccuracy: 'unknown' };
  return { ...value, date: value.date || '', timeAccuracy: value.timeAccuracy || (value.time ? 'exact' : 'unknown'), ...(value.place ? { place: { ...value.place } } : {}) };
}
function recordFor(group, id) {
  const records = group === 'western' ? traditionsData.western.signs : group === 'chinese' ? traditionsData.chinese.animals : traditionsData.humanDesign.types;
  return records.find(item => item.id === id);
}
function warningsMarkup(chart) {
  const warnings = Array.isArray(chart?.warnings) ? chart.warnings.filter(item => typeof item === 'string' && item.trim()) : [];
  return warnings.length ? '<aside class="wizard-note"><h3>Calculation notes</h3><ul>' + warnings.map(text => '<li>' + escape(text) + '</li>').join('') + '</ul></aside>' : '';
}

/** Keep the preview aligned with the date-derived fields used when saving. */
export function reconcileDateSelection(selection, birthDate, { chart = null, dateChanged = false } = {}) {
  const next = { ...selection };
  if (!birthDate) return next;
  const derived = deriveBirthProfile(birthDate);
  if (chart) {
    Object.assign(next, { western: chart.western.sun.id, westernBasis: 'calculated',
      humanDesign: chart.humanDesign.type, humanDesignBasis: 'calculated' });
  } else if (derived.western.boundary) {
    const confirmed = ['confirmed', 'selected'].includes(next.westernBasis) && derived.western.candidates.includes(next.western);
    if (dateChanged || !confirmed) { delete next.western; delete next.westernBasis; }
  } else {
    Object.assign(next, { western: derived.western.id, westernBasis: 'date_range' });
  }
  for (const key of ['chinese', 'chineseBasis', 'chineseYear', 'chineseElement', 'chinesePolarity']) delete next[key];
  if (derived.chinese) Object.assign(next, { chinese: derived.chinese.id, chineseBasis: 'lunar_new_year', chineseYear: derived.chinese.year,
    chineseElement: derived.chinese.element, chinesePolarity: derived.chinese.polarity });
  return next;
}

/** A five-part profile intake. Raw birth details stay in page memory until the caller explicitly saves a profile. */
export function renderProfileIntake(container, {
  selection = {}, answers = {}, birthDetails = null, chart = null, draft = null,
  onDraftChange = () => {}, onContinue, onSkip, onBack, onAgeGate
}) {
  const initialSelection = { ...selection };
  const state = {
    selection: { ...(draft?.selection || selection) },
    birth: cloneBirth(draft?.birthDetails || birthDetails),
    chart: draft && Object.hasOwn(draft, 'chart') ? draft.chart : chart,
    preferences: { ...Object.fromEntries(preferenceIds.map(id => [id, answers[id] || ''])), ...(draft?.preferences || {}) },
    step: Number.isInteger(draft?.step) ? Math.max(0, Math.min(4, draft.step)) : 0,
    country: draft?.birthDetails?.place?.countryCode || birthDetails?.place?.countryCode || '',
    placeQuery: '', placeResults: [], placeStatus: '', error: '', timeChoices: [],
    dateChanged: false, busy: false, countries: [], placesModule: null
  };
  let renderGeneration = 0;
  let activeSearch = 0;
  let placesPromise;
  let chartPromise;

  const query = selector => container.querySelector(selector);
  function snapshot() {
    return { birthDetails: cloneBirth(state.birth), selection: { ...state.selection }, chart: state.chart,
      preferences: { ...state.preferences }, step: state.step };
  }
  function remember() { onDraftChange(snapshot()); }
  function setError(message) {
    state.error = message || '';
    const node = query('#profile-intake-error');
    if (node) node.textContent = state.error;
  }
  function focusHeading() {
    const heading = query('#profile-step-heading');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); heading.scrollIntoView({ block: 'start', behavior: 'auto' }); }
  }
  function clearChinese() {
    for (const key of ['chinese', 'chineseBasis', 'chineseYear', 'chineseElement', 'chinesePolarity']) delete state.selection[key];
  }
  function invalidateBirth({ dateChanged = false } = {}) {
    state.chart = null;
    if (state.selection.westernBasis === 'calculated') { delete state.selection.western; delete state.selection.westernBasis; }
    if (state.selection.humanDesignBasis === 'calculated') { delete state.selection.humanDesign; delete state.selection.humanDesignBasis; }
    if (dateChanged) {
      state.dateChanged = true;
      if (state.selection.westernBasis === 'date_range') { delete state.selection.western; delete state.selection.westernBasis; }
      if (state.selection.chineseBasis === 'lunar_new_year') clearChinese();
    }
    state.timeChoices = [];
    query('.wizard-time-choice')?.remove();
    state.error = '';
  }
  function captureBirth() {
    const dateField = query('#birth-date');
    if (!dateField) return;
    const before = JSON.stringify(state.birth);
    const oldDate = state.birth.date;
    const oldTime = state.birth.time;
    const oldAccuracy = state.birth.timeAccuracy;
    const accuracy = query('#birth-time-accuracy').value;
    state.birth.date = dateField.value;
    state.birth.timeAccuracy = accuracy;
    if (accuracy !== 'unknown' && query('#birth-time').value) state.birth.time = query('#birth-time').value;
    else delete state.birth.time;
    const occurrence = query('input[name="timeOccurrence"]:checked');
    if (oldDate !== state.birth.date || oldTime !== state.birth.time || oldAccuracy !== state.birth.timeAccuracy) delete state.birth.timeOccurrence;
    else if (occurrence) state.birth.timeOccurrence = occurrence.value;
    if (before !== JSON.stringify(state.birth)) invalidateBirth({ dateChanged: oldDate !== state.birth.date });
    query('#birth-time').disabled = accuracy === 'unknown';
    remember();
  }
  function capturePreferences() {
    for (const id of preferenceIds) {
      const field = query('[name="' + id + '"]');
      if (field) state.preferences[id] = field.value;
    }
    remember();
  }
  function captureVisible() {
    if (state.step === 0) captureBirth();
    if (state.step === 4) capturePreferences();
  }
  function dateProfile() {
    if (!state.birth.date) return null;
    try { return deriveBirthProfile(state.birth.date); }
    catch { return null; }
  }
  function applyDateProfile() {
    state.selection = reconcileDateSelection(state.selection, state.birth.date, { chart: state.chart, dateChanged: state.dateChanged });
    state.dateChanged = false;
  }
  function gateAge() {
    if (!state.birth.date) return true;
    if (ageRange(state.birth.date) === 'under18') { onAgeGate(); return false; }
    return true;
  }
  function hasFullBirth() {
    return Boolean(state.birth.date && state.birth.time && state.birth.timeAccuracy !== 'unknown' && state.birth.place?.timeZone);
  }
  function displayChartError(problem) {
    state.error = problem?.message || 'The birth chart could not be calculated. Review the birth details or continue with date-only signs.';
    state.timeChoices = problem?.code === 'ambiguous_birth_time' && Array.isArray(problem.choices) ? problem.choices : [];
    state.step = 0;
    render();
    focusHeading();
  }
  async function calculate() {
    if (!hasFullBirth()) return true;
    state.busy = true;
    const button = query('#profile-next');
    if (button) { button.disabled = true; button.textContent = 'Calculating your profiles…'; }
    try {
      chartPromise ||= import('./birth-chart.js');
      const module = await chartPromise;
      const result = module.calculateBirthChart(state.birth);
      if (!recordFor('western', result?.western?.sun?.id) || !recordFor('humanDesign', result?.humanDesign?.type)) {
        throw new Error('The calculation returned an incomplete profile. Review your birth details and try again.');
      }
      state.chart = result;
      Object.assign(state.selection, { western: result.western.sun.id, westernBasis: 'calculated',
        humanDesign: result.humanDesign.type, humanDesignBasis: 'calculated' });
      state.error = '';
      state.timeChoices = [];
      remember();
      return true;
    } catch (problem) {
      state.chart = null;
      displayChartError(problem);
      return false;
    } finally { state.busy = false; }
  }
  async function prepareBirth() {
    captureBirth();
    setError('');
    try {
      if (!state.birth.date) {
        if (state.birth.time) throw new Error('Enter your full birth date to calculate a chart, or choose that your birth time is unknown.');
        return true;
      }
      if (!gateAge()) return false;
      if (state.birth.timeAccuracy !== 'unknown' && !state.birth.time) throw new Error('Enter your birth time, or choose “I don’t know my birth time.”');
      applyDateProfile();
      if (hasFullBirth() && !state.chart && !(await calculate())) return false;
      remember();
      return true;
    } catch (problem) { setError(problem.message || 'Review your birth details.'); return false; }
  }
  async function moveTo(step) {
    if (state.busy) return;
    captureVisible();
    if (state.step === 0 && step > 0 && !(await prepareBirth())) return;
    state.step = Math.max(0, Math.min(4, step));
    state.error = '';
    remember(); render(); focusHeading();
  }
  async function finish() {
    if (state.busy) return;
    captureVisible();
    if (state.step === 0 && !(await prepareBirth())) return;
    try {
      if (!gateAge()) return;
      applyDateProfile();
      onContinue({ selection: { ...state.selection }, preferences: { ...state.preferences },
        birthDetails: state.birth.date ? cloneBirth(state.birth) : null, chart: state.chart,
        ageBand: state.birth.date ? ageRange(state.birth.date) : undefined });
    } catch (problem) { setError(problem.message || 'Review your profile and try again.'); }
  }
  async function loadPlaces() {
    placesPromise ||= import('./places.js');
    const module = await placesPromise;
    state.placesModule = module;
    state.countries = module.getCountries();
    return module;
  }
  function countryOptions() {
    return '<option value="">Choose a country</option>' + state.countries.map(country => '<option value="' + escape(country.code) + '"' + (country.code === state.country ? ' selected' : '') + '>' + escape(country.name) + '</option>').join('');
  }
  function selectedPlaceMarkup() {
    if (!state.birth.place) return '<p class="small muted">Choose a birthplace to calculate a chart from the local birth time. Date-only signs remain available if you leave this out.</p>';
    return '<div class="wizard-selected-place"><div><strong>' + escape(state.birth.place.label) + '</strong><p class="small">Birthplace time zone: ' + escape(state.birth.place.timeZone) + '</p></div><button type="button" class="text-button" data-action="clear-place">Change birthplace</button></div>';
  }
  function timeChoicesMarkup() {
    if (!state.timeChoices.length) return '';
    return '<fieldset class="wizard-time-choice"><legend>This clock time occurred twice</legend><p>Choose the occurrence shown on your birth record. If you cannot confirm it, choose that your birth time is unknown.</p>' + state.timeChoices.map(choice => '<label class="check-field"><input type="radio" name="timeOccurrence" value="' + escape(choice.occurrence) + '"' + (state.birth.timeOccurrence === choice.occurrence ? ' checked' : '') + '><span>' + escape(choice.label || pretty(choice.occurrence)) + '</span></label>').join('') + '</fieldset>';
  }
  function birthMarkup() {
    return '<h2 id="profile-step-heading">Start with your birth details</h2>' +
      '<p>Enter these once. The next sections use them for your Chinese zodiac, Western horoscope and Human Design.</p>' +
      '<div class="wizard-form-grid"><label class="field"><span>Birth date</span><input id="birth-date" type="date" min="1900-01-01" max="' + today() + '" value="' + escape(state.birth.date) + '"></label>' +
      '<label class="field"><span>How certain is your birth time?</span><select id="birth-time-accuracy"><option value="unknown"' + (state.birth.timeAccuracy === 'unknown' ? ' selected' : '') + '>I don’t know my birth time</option><option value="exact"' + (state.birth.timeAccuracy === 'exact' ? ' selected' : '') + '>Time from a birth record</option><option value="approximate"' + (state.birth.timeAccuracy === 'approximate' ? ' selected' : '') + '>An approximate time</option></select></label>' +
      '<label class="field"><span>Local time of birth</span><input id="birth-time" type="time" step="60" value="' + escape(state.birth.time || '') + '"' + (state.birth.timeAccuracy === 'unknown' ? ' disabled' : '') + ' aria-describedby="birth-time-help"></label></div>' +
      '<p id="birth-time-help" class="small muted">Use the clock time at your birthplace. An unknown time is left unknown; approximate times remain marked as approximate in your report.</p>' + timeChoicesMarkup() +
      '<fieldset><legend>Birthplace</legend><div class="wizard-place-search"><label class="field"><span>Country</span><select id="birth-country">' + countryOptions() + '</select></label>' +
      '<label class="field"><span>Birth city or town</span><input id="birth-place-query" type="search" autocomplete="off" maxlength="100" value="' + escape(state.placeQuery) + '" placeholder="City or town"></label><button type="button" id="search-birthplaces" class="button button-secondary">Find birthplace</button></div>' +
      '<p id="birth-place-status" class="small" role="status">' + escape(state.placeStatus) + '</p><div id="birth-place-results" class="wizard-place-results"></div>' + selectedPlaceMarkup() +
      '<details class="wizard-manual-place"><summary>My birthplace is not listed</summary><p>Enter the place and its known IANA time-zone name. Use the time zone for that place, which may differ from where you live now.</p><div class="wizard-form-grid">' +
      '<label class="field"><span>Birthplace name</span><input id="manual-place-label" type="text" maxlength="160" placeholder="Town, region, country"></label><label class="field"><span>Birthplace time zone</span><input id="manual-place-zone" type="text" maxlength="80" placeholder="For example, America/New_York" autocomplete="off"></label></div>' +
      '<button type="button" class="button button-secondary" data-action="manual-place">Use this birthplace</button></details></fieldset>' +
      '<p class="wizard-privacy">Your profiles are calculated in this browser. Birth details stay in the current page until you explicitly choose to save them with Cloud Forest. Searching the birthplace list does not send the search to another service.</p>' +
      '<p class="small muted">You can continue with a date alone, or leave the birth details blank and use signs or a Human Design type you already know.</p>';
  }
  function chineseMarkup() {
    const record = recordFor('chinese', state.selection.chinese);
    const computed = state.selection.chineseBasis === 'lunar_new_year';
    const derived = dateProfile();
    return '<h2 id="profile-step-heading">Your Chinese horoscope</h2><p>This section identifies your Chinese birth-year animal and element using the Lunar New Year convention.</p>' +
      (record ? '<article class="wizard-profile-preview"><p class="eyebrow">' + (computed ? 'Calculated birth-year profile' : 'Sign you selected') + '</p><h3>' + escape(computed ? state.selection.chinesePolarity + ' ' + state.selection.chineseElement + ' ' + record.name : record.name) + '</h3>' +
        (computed ? '<p>' + escape(state.selection.chineseYear) + ' lunar year</p>' : '') + '<p>' + escape(record.summary) + '</p><p><strong>The guide’s sleep association:</strong> ' + escape(record.affinity) + '</p></article>' : '<div class="wizard-note"><p>' + escape(derived?.chineseUnavailable ? 'Your browser could not calculate the lunar year for this date. You can continue without this section, or return in a browser that supports the Chinese calendar.' : 'Add a birth date to calculate this profile, or choose the animal sign you already know below.') + '</p></div>') +
      '<p class="small muted">The birth-year element and the guide’s temperament grouping for an animal describe different parts of the tradition. This section does not calculate a full Four Pillars chart.</p>' +
      (!state.birth.date ? '<details' + (!record ? ' open' : '') + '><summary>Use a Chinese sign I already know</summary><label class="field"><span>Chinese zodiac animal</span><select id="profile-chinese">' + selectOptions(traditionsData.chinese.animals, state.selection.chinese, 'Unknown / leave out') + '</select></label><p class="small muted">A manual choice is marked as selected by you. Its birth-year element is left unknown.</p></details>' : '') +
      '<button type="button" class="text-button" data-action="birth-details">Edit birth details</button>';
  }
  function westernMarkup() {
    const record = recordFor('western', state.selection.western);
    const derived = dateProfile();
    const full = Boolean(state.chart?.western?.sun);
    const boundary = !full && derived?.western.boundary;
    const boundaryNames = boundary ? derived.western.candidates.map(id => recordFor('western', id)?.name || id).join(' / ') : '';
    const moon = state.chart?.western?.moon;
    return '<h2 id="profile-step-heading">Your Western horoscope</h2><p>Your Sun sign supplies the guide’s Western personality and rest themes. A complete birth calculation also adds your Moon sign.</p>' +
      (record ? '<article class="wizard-profile-preview"><p class="eyebrow">' + (full ? 'Calculated from your birth details' : state.selection.westernBasis === 'date_range' ? 'Date-range estimate' : 'Sign confirmed or selected by you') + '</p><h3>Sun in ' + escape(record.name) + '</h3><p>' + escape(record.element) + ' element</p>' +
        (moon ? '<p><strong>Moon in ' + escape(moon.name) + '</strong></p>' : '') + '<p>' + escape(record.summary) + '</p><p><strong>The guide’s sleep association:</strong> ' + escape(record.affinity) + '</p></article>' : '<div class="wizard-note"><p>' + (boundary ? 'Your date is close to a Sun-sign change: ' + escape(boundaryNames) + '. Add a known birth time and birthplace for a calculation, or select a sign confirmed by your chart.' : 'Add your birth details to calculate this profile, or select a Sun sign you already know.') + '</p></div>') +
      (!full && (!derived || boundary) ? '<label class="field"><span>Western Sun sign</span><select id="profile-western">' + selectOptions(boundary ? traditionsData.western.signs.filter(sign => derived.western.candidates.includes(sign.id)) : traditionsData.western.signs, state.selection.western, 'Unknown / leave out') + '</select></label>' : '') +
      (!full && derived && !boundary ? '<p class="small muted">This estimate follows the birth date you entered. Add a known birth time and birthplace for calculated Sun and Moon signs.</p>' : '') +
      '<p class="small muted">This is a Sun-and-Moon profile within Western astrology. It does not include an ascendant, houses or a complete natal-chart reading. The guide’s sleep associations use the Sun sign.</p>' + warningsMarkup(state.chart) +
      '<button type="button" class="text-button" data-action="birth-details">Edit birth details</button>';
  }
  function humanDesignMarkup() {
    const hd = state.chart?.humanDesign;
    const record = recordFor('humanDesign', hd?.type || state.selection.humanDesign);
    const authority = hd?.authorityName || pretty(hd?.authority);
    const centers = Array.isArray(hd?.definedCenters) ? hd.definedCenters.map(pretty) : [];
    const channels = Array.isArray(hd?.channels) ? hd.channels.map(item => typeof item === 'string' ? item : item.id || item.gates?.join('–')).filter(Boolean) : [];
    const calculation = hd ? '<dl class="wizard-chart-facts"><div><dt>Type</dt><dd>' + escape(hd.typeName || record?.name) + '</dd></div><div><dt>Authority</dt><dd>' + escape(authority) + '</dd></div><div><dt>Profile</dt><dd>' + escape(hd.profile) + '</dd></div><div><dt>Definition</dt><dd>' + escape(pretty(hd.definition)) + '</dd></div></dl>' +
      '<p class="small">Birth time: ' + (state.chart.precision === 'approximate-time' ? 'approximate' : 'entered from your record') + '.</p><details><summary>Centers and channels in this chart</summary><p><strong>Defined centers:</strong> ' + escape(centers.length ? centers.join(', ') : 'None') + '</p><p><strong>Defined channels:</strong> ' + escape(channels.length ? channels.join(', ') : 'None') + '</p></details>' : '';
    return '<h2 id="profile-step-heading">Your Human Design</h2><p>This chart uses your full birth date, local birth time and birthplace. Your personality answers do not determine a Human Design type.</p>' +
      (record ? '<article class="wizard-profile-preview"><p class="eyebrow">' + (hd ? 'Calculated birth chart' : 'Type supplied by you') + '</p><h3>' + escape(record.name) + '</h3>' + calculation + '<p>' + escape(record.summary) + '</p><p><strong>The guide’s sleep association:</strong> ' + escape(record.affinity) + '</p></article>' : '') +
      (!hd ? '<div class="wizard-note"><h3>Your calculated chart is still open</h3><p>A known birth time and birthplace are needed to calculate this part. You can add them now, use a type from a chart you already have, or leave this section unknown.</p></div><label class="field"><span>Type shown on your Human Design chart</span><select id="profile-human-design">' + selectOptions(traditionsData.humanDesign.types, state.selection.humanDesign, 'I don’t know / leave out') + '</select></label><p class="small">You can also <a href="' + HUMAN_DESIGN_CHART_URL + '" target="_blank" rel="noopener noreferrer">check the official chart calculator</a>. That service has its own privacy terms; this app does not automatically send it your birth details.</p>' : '') +
      '<p class="small muted">These are Human Design’s traditional chart categories. The sleep interpretation follows the guide’s waking-type teaching; a separate DreamRave sleeping chart is outside this assessment.</p>' + warningsMarkup(state.chart) +
      '<button type="button" class="text-button" data-action="birth-details">Edit birth details</button>';
  }
  function rhythmMarkup() {
    const fields = preferenceIds.map(id => {
      const question = observationQuestions.find(item => item.id === id);
      if (!question) return '';
      return '<label class="field"><span>' + escape(question.q) + '</span><select name="' + id + '"><option value="">Skip this question</option>' + question.opts.map(option => '<option value="' + escape(option.l) + '"' + (state.preferences[id] === option.l ? ' selected' : '') + '>' + escape(option.t) + '</option>').join('') + '</select></label>';
    }).join('');
    return '<h2 id="profile-step-heading">How does your everyday rhythm feel?</h2><p>Choose what fits your own experience most often. These answers help your report explain where your routine supports your rest and where it feels difficult.</p><div class="wizard-rhythm-fields">' + fields + '</div><p class="small muted">You can leave any question open. Your answers describe your experience; they do not change the signs or Human Design type calculated from birth details.</p>';
  }
  function renderSearchResults() {
    const host = query('#birth-place-results');
    if (!host) return;
    host.innerHTML = state.placeResults.map((place, index) => '<button type="button" class="wizard-place-option" data-place-index="' + index + '"><strong>' + escape(place.label) + '</strong><span>' + escape(place.timeZone) + '</span></button>').join('');
    for (const button of host.querySelectorAll('[data-place-index]')) button.addEventListener('click', () => {
      const selected = state.placeResults[Number(button.dataset.placeIndex)];
      if (!selected) return;
      captureBirth(); state.birth.place = { ...selected }; state.country = selected.countryCode || state.country;
      delete state.birth.timeOccurrence; invalidateBirth(); state.placeResults = []; state.placeStatus = 'Birthplace selected.';
      remember(); render();
    });
  }
  async function searchPlaces() {
    state.country = query('#birth-country').value;
    state.placeQuery = query('#birth-place-query').value.trim();
    if (!state.country) { state.placeStatus = 'Choose a country first.'; query('#birth-place-status').textContent = state.placeStatus; return; }
    if (state.placeQuery.length < 2) { state.placeStatus = 'Enter at least two letters of the city or town.'; query('#birth-place-status').textContent = state.placeStatus; return; }
    const searchId = ++activeSearch;
    const generation = renderGeneration;
    state.placeStatus = 'Searching the local birthplace list…'; query('#birth-place-status').textContent = state.placeStatus;
    const button = query('#search-birthplaces'); button.disabled = true;
    try {
      const module = await loadPlaces();
      const results = await module.findBirthplaces(state.placeQuery, state.country);
      if (searchId !== activeSearch || generation !== renderGeneration) return;
      state.placeResults = Array.isArray(results) ? results.slice(0, 20) : [];
      state.placeStatus = state.placeResults.length ? 'Choose the matching place, including its region and country.' : 'No matching place was found. Try a nearby city in the same time zone, or enter your birthplace below.';
      query('#birth-place-status').textContent = state.placeStatus; renderSearchResults();
    } catch {
      if (generation !== renderGeneration) return;
      state.placeStatus = 'The birthplace list could not load. You can enter the place and its known time zone below.';
      query('#birth-place-status').textContent = state.placeStatus;
    } finally { if (generation === renderGeneration && query('#search-birthplaces')) query('#search-birthplaces').disabled = false; }
  }
  function manualPlace() {
    captureBirth();
    const label = query('#manual-place-label').value.trim();
    const zone = query('#manual-place-zone').value.trim();
    if (!label || !zone) { setError('Enter both a birthplace name and its IANA time-zone name.'); return; }
    try {
      const timeZone = new Intl.DateTimeFormat('en', { timeZone: zone }).resolvedOptions().timeZone;
      state.birth.place = { label, timeZone, ...(state.country ? { countryCode: state.country } : {}) };
      delete state.birth.timeOccurrence; invalidateBirth(); state.placeResults = []; state.placeStatus = 'Birthplace and time zone entered by you.';
      remember(); render();
    } catch { setError('That time-zone name was not recognized. Use an IANA name such as America/New_York.'); }
  }
  function bind() {
    query('#profile-wizard-form').addEventListener('submit', async event => {
      event.preventDefault();
      if (state.step === 4) await finish(); else await moveTo(state.step + 1);
    });
    for (const button of container.querySelectorAll('[data-profile-step]')) button.addEventListener('click', () => moveTo(Number(button.dataset.profileStep)));
    for (const button of container.querySelectorAll('[data-action]')) button.addEventListener('click', async () => {
      const action = button.dataset.action;
      if (action === 'back') { captureVisible(); if (state.step === 0) onBack(); else await moveTo(state.step - 1); }
      if (action === 'birth-details') await moveTo(0);
      if (action === 'finish') await finish();
      if (action === 'skip') {
        captureVisible();
        try { if (gateAge()) onSkip(); } catch (problem) { setError(problem.message || 'Check the birth date.'); }
      }
      if (action === 'manual-place') manualPlace();
      if (action === 'clear-place') {
        captureBirth(); delete state.birth.place; delete state.birth.timeOccurrence; invalidateBirth();
        state.placeStatus = ''; state.placeResults = []; remember(); render();
      }
    });
    if (state.step === 0) {
      for (const id of ['birth-date', 'birth-time', 'birth-time-accuracy']) query('#' + id).addEventListener('change', () => {
        captureBirth(); setError('');
        if (id === 'birth-date' && state.birth.date) {
          try { gateAge(); } catch (problem) { setError(problem.message || 'Check the birth date.'); }
        }
      });
      for (const radio of container.querySelectorAll('input[name="timeOccurrence"]')) radio.addEventListener('change', () => {
        state.birth.timeOccurrence = radio.value; state.chart = null; setError(''); remember();
      });
      query('#birth-country').addEventListener('change', event => {
        captureBirth(); state.country = event.target.value; state.placeResults = []; state.placeStatus = '';
        if (state.birth.place && state.birth.place.countryCode !== state.country) { delete state.birth.place; delete state.birth.timeOccurrence; invalidateBirth(); }
        remember(); render();
      });
      query('#birth-place-query').addEventListener('input', event => { state.placeQuery = event.target.value; });
      query('#birth-place-query').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); searchPlaces(); } });
      query('#search-birthplaces').addEventListener('click', searchPlaces);
      renderSearchResults();
      if (!state.countries.length) {
        const generation = renderGeneration;
        loadPlaces().then(() => { if (generation === renderGeneration && query('#birth-country')) query('#birth-country').innerHTML = countryOptions(); }).catch(() => {
          if (generation === renderGeneration && query('#birth-place-status')) query('#birth-place-status').textContent = 'You can enter a birthplace and its known time zone below.';
        });
      }
    }
    query('#profile-chinese')?.addEventListener('change', event => {
      const value = event.target.value; clearChinese();
      if (value) Object.assign(state.selection, { chinese: value, chineseBasis: 'selected' });
      remember(); render();
    });
    query('#profile-western')?.addEventListener('change', event => {
      if (event.target.value) Object.assign(state.selection, { western: event.target.value, westernBasis: dateProfile()?.western.boundary ? 'confirmed' : 'selected' });
      else { delete state.selection.western; delete state.selection.westernBasis; }
      remember(); render();
    });
    query('#profile-human-design')?.addEventListener('change', event => {
      if (event.target.value) Object.assign(state.selection, { humanDesign: event.target.value, humanDesignBasis: 'selected' });
      else { delete state.selection.humanDesign; delete state.selection.humanDesignBasis; }
      remember(); render();
    });
    if (state.step === 4) for (const field of container.querySelectorAll('.wizard-rhythm-fields select')) field.addEventListener('change', capturePreferences);
  }
  function render() {
    renderGeneration++;
    const content = [birthMarkup, chineseMarkup, westernMarkup, humanDesignMarkup, rhythmMarkup][state.step]();
    container.innerHTML = '<div class="question-card profile-intake profile-wizard"><p class="question-progress">Personal profile · part ' + (state.step + 1) + ' of ' + steps.length + '</p>' +
      '<nav class="wizard-progress" aria-label="Personal profile sections"><ol>' + steps.map((label, index) => '<li><button type="button" data-profile-step="' + index + '"' + (index === state.step ? ' aria-current="step"' : '') + '><span class="wizard-step-number" aria-hidden="true">' + (index + 1) + '</span>' + escape(label) + '</button></li>').join('') + '</ol></nav>' +
      '<form id="profile-wizard-form" novalidate>' + content + '<p id="profile-intake-error" class="status-message" role="alert">' + escape(state.error) + '</p>' +
      '<div class="button-row wizard-actions"><button type="button" class="button button-secondary" data-action="back">' + (state.step === 0 ? 'Back to sleep questions' : 'Back') + '</button><button id="profile-next" type="submit" class="button button-primary">' + (state.step === 4 ? 'See my connected report' : 'Continue') + '</button></div>' +
      (state.step === 0 ? '<button type="button" class="text-button wizard-skip" data-action="skip">' + (Object.keys(initialSelection).length ? 'Keep my current profile' : 'Skip personal profile') + '</button>' : state.step < 4 ? '<button type="button" class="text-button wizard-skip" data-action="finish">Finish with completed sections</button>' : '') + '</form></div>';
    bind();
  }
  try { applyDateProfile(); }
  catch (problem) { state.step = 0; state.error = problem.message || 'Review your birth date.'; }
  render();
}
