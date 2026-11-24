import { getProfileSession, setProfileSession, profileRequest } from './profile-client.js';
import { assessPattern, activeQuestions, observationQuestions, breathingOptions, answerLabel, REPORT_VERSION } from './assessment.js';
import { guidePatterns, guideSources, interpretAssessment, formatSleepMinutes } from './guide-model.js';
import { buildPersonalProfile, traditionsData } from './traditions.js';
import { buildRhythmInsights } from './rhythm-insights.js';
import { renderBirthChart } from './chart-view.js';
import { createSleepPdf } from './report.js';

const TOKEN_FORMAT = /^[A-Za-z0-9_-]{43}$/;
const UUID_FORMAT = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DELETE_PHRASE = 'DELETE MY SAVED PROFILE';
const byId = id => document.getElementById(id);
const element = (tag, text = '', className = '') => {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
};
const dateText = value => {
  const date = new Date(value);
  return value && Number.isFinite(date.getTime()) ? date.toLocaleString() : 'Date unavailable';
};
const patternName = key => guidePatterns[key]?.name || 'Saved sleep assessment';
const pretty = value => String(value || '').replace(/_/g, ' ').replace(/\b\w/g, character => character.toUpperCase());

function paragraphs(parent, values) {
  for (const value of values || []) if (typeof value === 'string' && value) parent.append(element('p', value));
}

function facts(parent, entries, className = 'account-facts') {
  const list = element('dl', '', className);
  for (const [label, value] of entries) {
    const item = element('div');
    item.append(element('dt', label), element('dd', value || 'Not supplied'));
    list.append(item);
  }
  parent.append(list);
}

function section(parent, title) {
  const card = element('section', '', 'card account-report-section');
  card.append(element('h3', title));
  parent.append(card);
  return card;
}

function sources(parent, values) {
  if (!values?.length) return;
  const detail = element('details');
  detail.append(element('summary', 'Sources and further reading'));
  const list = element('ul', '', 'small');
  for (const source of values) {
    if (!source?.title || !/^https:\/\//.test(source.url || '')) continue;
    const item = element('li');
    const link = element('a', source.title);
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    item.append(link);
    list.append(item);
  }
  detail.append(list);
  parent.append(detail);
}

function savedBirthDetails(parent, birthDetails) {
  const details = element('details');
  details.append(element('summary', 'Birth details saved with this assessment'));
  let rendered = false;
  // Populate this separately opened section only on request. Never put birth
  // details in a URL, a history-row label, an analytics event or browser storage.
  details.addEventListener('toggle', () => {
    if (!details.open || rendered) return;
    rendered = true;
    if (!birthDetails) {
      details.append(element('p', 'No birth details were saved with this entry. Any signs or Human Design type supplied separately remain in the report.'));
      return;
    }
    const entries = [
      ['Birth date', birthDetails.date],
      ['Local birth time', birthDetails.timeAccuracy === 'unknown' ? 'Unknown — no time was substituted' : birthDetails.time || 'Not supplied'],
      ['Time accuracy', { exact: 'As entered from your birth record', approximate: 'Approximate', unknown: 'Unknown' }[birthDetails.timeAccuracy]],
      ['Birthplace', birthDetails.place?.label],
      ['Time zone at birthplace', birthDetails.place?.timeZone]
    ];
    if (birthDetails.timeOccurrence) entries.push(['Repeated clock time', pretty(birthDetails.timeOccurrence) + ' occurrence']);
    facts(details, entries);
  });
  parent.append(details);
}

function savedAnswers(parent, answers) {
  const details = element('details');
  details.append(element('summary', 'Review the answers saved with this entry'));
  const entries = [...activeQuestions(answers), ...observationQuestions]
    .filter(question => Object.hasOwn(answers, question.id))
    .map(question => [question.q, answerLabel(question, answers) || 'Not supplied']);
  if (Array.isArray(answers.apneaSigns)) {
    const labels = answers.apneaSigns.map(value => breathingOptions.find(option => option.l === value)?.t).filter(Boolean);
    entries.push(['Sleep observations selected', labels.join(', ') || 'None selected']);
  }
  facts(details, entries, 'account-detail-list');
  parent.append(details);
}

function savedDiary(parent, diary) {
  const card = section(parent, 'Saved sleep diary');
  if (!diary.length) {
    card.append(element('p', 'No diary days were saved with this assessment. The PDF includes a blank two-week record you can use.'));
    return;
  }
  const scroll = element('div', '', 'table-scroll');
  scroll.tabIndex = 0;
  scroll.setAttribute('role', 'region');
  scroll.setAttribute('aria-label', 'Saved sleep diary; scroll for all columns');
  const table = element('table');
  table.append(element('caption', diary.length + ' recorded ' + (diary.length === 1 ? 'day' : 'days')));
  const head = element('thead');
  const heading = element('tr');
  for (const label of ['Date', 'Main sleep', 'Naps', 'Total', 'How the day felt']) {
    const cell = element('th', label);
    cell.scope = 'col';
    heading.append(cell);
  }
  head.append(heading);
  const body = element('tbody');
  for (const day of [...diary].sort((a, b) => a.date.localeCompare(b.date))) {
    const row = element('tr');
    const values = [day.date, day.mainMinutes ? formatSleepMinutes(day.mainMinutes) : '0 minutes',
      day.napMinutes ? formatSleepMinutes(day.napMinutes) : '0 minutes',
      day.mainMinutes + day.napMinutes ? formatSleepMinutes(day.mainMinutes + day.napMinutes) : '0 minutes',
      { rested: 'Rested', mixed: 'Mixed', sleepy: 'Sleepy' }[day.energy] || 'Not recorded'];
    values.forEach(value => row.append(element('td', value)));
    body.append(row);
  }
  table.append(head, body);
  scroll.append(table);
  card.append(scroll);
}

/** Shared with the authenticated administrator view. All saved text is DOM text. */
export function renderSavedAssessment(container, snapshot) {
  container.replaceChildren();
  const data = snapshot?.assessment;
  if (!data?.answers || typeof data.answers !== 'object') {
    container.append(element('p', 'The saved answers for this entry are unavailable.', 'account-empty-note'));
    return;
  }
  const answers = data.answers;
  const selection = data.traditionsSelection || {};
  const chart = data.chart || null;
  const diary = Array.isArray(data.diary) ? data.diary : [];
  const calculated = assessPattern(answers);
  const key = Object.hasOwn(guidePatterns, snapshot.pattern) ? snapshot.pattern : calculated.key;
  const assessment = key === calculated.key ? calculated : { key };
  const interpreted = interpretAssessment(answers, assessment);
  const observed = { key, name: patternName(key) };

  const summary = section(container, observed.name);
  summary.classList.add('result-summary');
  paragraphs(summary, interpreted.profile.overview);
  if (interpreted.review) summary.append(element('p', interpreted.review.reason));
  const alertness = activeQuestions(answers).find(question => question.id === 'alertness');
  facts(summary, [
    ['Reported sleep in 24 hours', formatSleepMinutes(answers.total)],
    ['Afternoon alertness', alertness ? answerLabel(alertness, answers) : 'Not supplied']
  ]);
  summary.append(element('p', 'This result describes the sleep and naps reported for the two weeks before this entry was saved. It is not a medical diagnosis.', 'small'));

  const evaluation = section(container, 'What your sleep answers mean');
  for (const item of interpreted.evaluations) {
    evaluation.append(element('h4', item.title));
    paragraphs(evaluation, item.paragraphs);
  }
  evaluation.append(element('h4', 'Practical next steps'));
  const actions = element('ul');
  for (const text of [...new Set([...interpreted.actions, ...interpreted.profile.nextSteps])]) actions.append(element('li', text));
  evaluation.append(actions);
  sources(evaluation, interpreted.sourceIds.map(id => guideSources[id]).filter(Boolean));

  const rhythm = buildRhythmInsights(answers, selection, observed, chart);
  const fit = section(container, rhythm.title);
  fit.append(element('p', rhythm.introduction));
  if (!rhythm.findings.length) fit.append(element('p', 'No preference comparisons were saved for this entry. You can add your everyday preferences when you review the assessment.'));
  for (const item of rhythm.findings) {
    fit.append(element('h4', item.title));
    fit.append(element('p', item.text));
  }
  for (const item of rhythm.observations) {
    const observation = element('div', '', 'account-comparison');
    observation.append(element('h4', item.title), element('p', item.text));
    fit.append(observation);
  }

  const personal = buildPersonalProfile(answers, selection, observed, chart);
  const profile = section(container, personal.title);
  profile.append(element('p', personal.introduction));
  paragraphs(profile, personal.summary);
  for (const preference of personal.preferences) {
    profile.append(element('h4', preference.title));
    paragraphs(profile, preference.paragraphs);
  }
  for (const item of personal.cards) {
    const detail = element('details');
    detail.append(element('summary', item.title));
    if (item.subtitle) detail.append(element('p', item.subtitle, 'small muted'));
    paragraphs(detail, item.paragraphs);
    const comparison = element('div', '', 'account-comparison');
    comparison.append(element('h4', item.comparison.label), element('p', item.comparison.text));
    detail.append(comparison, element('p', 'Notice in your own life: ' + item.reflection));
    detail.append(element('p', 'Field Guide pages ' + item.sourcePages.join(', '), 'small muted'));
    profile.append(detail);
  }
  if (personal.experiments.length) {
    const next = element('details');
    next.append(element('summary', 'What to observe next'));
    for (const item of personal.experiments) {
      next.append(element('h4', item.title), element('p', item.text));
    }
    profile.append(next);
  }
  sources(profile, personal.sources);

  const birth = section(container, chart ? 'Your saved chart' : 'Your birth-profile details');
  if (chart) {
    const chartContent = element('div');
    // renderBirthChart escapes all variable text and renders validated chart data.
    chartContent.innerHTML = renderBirthChart(chart);
    birth.append(chartContent);
  } else {
    birth.append(element('p', 'A calculated Sun, Moon and Human Design chart was not saved with this entry. Any date-based signs or type you supplied are shown in your personal profile above. A missing or unknown birth time was not replaced with an assumed time.'));
  }
  savedBirthDetails(birth, data.birthDetails);
  savedAnswers(section(container, 'Your saved answers'), answers);
  savedDiary(container, diary);
}

function selectionLabel(selection = {}) {
  return [
    traditionsData.western.signs.find(item => item.id === selection.western)?.name,
    traditionsData.chinese.animals.find(item => item.id === selection.chinese)?.name,
    traditionsData.humanDesign.types.find(item => item.id === selection.humanDesign)?.name
  ].filter(Boolean).join(' · ') || 'Birth profiles not supplied';
}

async function startProfilePage() {
  const fragment = new URLSearchParams(location.hash.slice(1));
  let loginToken = fragment.get('token');
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  let contact = null;
  let current = null;
  let page = { offset: 0, limit: 20, nextOffset: null, total: 0 };
  let listBusy = false;
  let detailSequence = 0;
  let deleting = false;

  function status(id, message, error = false) {
    const node = byId(id);
    node.textContent = message || '';
    node.dataset.state = error ? 'error' : 'success';
  }

  function signedOut(message = '', error = false) {
    setProfileSession(null);
    detailSequence++;
    current = null;
    contact = null;
    byId('profile-dashboard').hidden = true;
    byId('profile-assessment').hidden = true;
    byId('profile-logout').hidden = true;
    byId('profile-signin').hidden = false;
    byId('profile-history-list').replaceChildren();
    byId('profile-assessment-content').replaceChildren();
    byId('profile-contact-name').textContent = '';
    byId('profile-contact-email').textContent = '';
    byId('profile-delete-confirmation').value = '';
    byId('profile-delete-details').open = false;
    status('profile-status', message, error);
  }

  function signedIn() {
    byId('profile-signin').hidden = true;
    byId('profile-dashboard').hidden = false;
    byId('profile-logout').hidden = false;
    status('profile-login-status', '');
  }

  function handleFailure(error, id = 'profile-status') {
    if (error.status === 401 && !getProfileSession()) {
      signedOut('Your saved-profile session has expired. Sign in again.', true);
    } else {
      const wait = error.status === 429 && error.retryAfter ? ' Please wait before trying again.' : '';
      status(id, error.message + wait, true);
    }
  }

  function updateHistoryControls() {
    byId('profile-refresh').disabled = listBusy || deleting;
    byId('profile-previous').disabled = listBusy || deleting || page.offset === 0;
    byId('profile-next').disabled = listBusy || deleting || page.nextOffset === null;
  }

  function highlightCurrent() {
    for (const button of byId('profile-history-list').querySelectorAll('button')) {
      if (button.dataset.assessmentId === current?.id) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    }
  }

  async function loadAssessment(id, moveFocus = false) {
    if (!UUID_FORMAT.test(id)) return;
    const requestToken = getProfileSession()?.token;
    if (!requestToken || deleting) return;
    const sequence = ++detailSequence;
    current = null;
    byId('profile-assessment').hidden = true;
    byId('profile-assessment-content').replaceChildren();
    highlightCurrent();
    status('profile-status', 'Opening your saved assessment…');
    try {
      const data = await profileRequest('profile-get', { id });
      if (getProfileSession()?.token !== requestToken || sequence !== detailSequence) return;
      renderSavedAssessment(byId('profile-assessment-content'), data);
      current = data;
      byId('profile-assessment-heading').textContent = patternName(data.pattern);
      byId('profile-assessment-date').textContent = 'Saved ' + dateText(data.createdAt);
      byId('profile-assessment-label').textContent = data.reportVersion === REPORT_VERSION ? 'Saved assessment' : 'Earlier saved assessment';
      byId('profile-edit').href = './#saved=' + encodeURIComponent(data.id);
      byId('profile-assessment').hidden = false;
      status('profile-download-status', '');
      status('profile-status', '');
      highlightCurrent();
      if (moveFocus) byId('profile-assessment-heading').focus({ preventScroll: false });
    } catch (error) {
      if (sequence === detailSequence && (!getProfileSession() || getProfileSession()?.token === requestToken)) handleFailure(error);
    }
  }

  async function loadHistory(offset = 0) {
    const requestToken = getProfileSession()?.token;
    if (!requestToken || listBusy || deleting) return;
    listBusy = true;
    updateHistoryControls();
    status('profile-status', 'Loading your saved assessments…');
    try {
      const data = await profileRequest('profile-list', { offset, limit: 20 });
      if (getProfileSession()?.token !== requestToken) return;
      contact = data.contact;
      page = { offset: data.offset, limit: data.limit, total: data.total, nextOffset: data.nextOffset };
      byId('profile-contact-name').textContent = contact?.name ? contact.name + '’s profile' : 'Your profile';
      byId('profile-contact-email').textContent = contact?.email || '';
      const list = byId('profile-history-list');
      list.replaceChildren();
      for (const entry of data.assessments) {
        const item = element('li');
        const button = element('button', '', 'account-history-choice');
        button.type = 'button';
        button.dataset.assessmentId = entry.id;
        button.append(element('strong', patternName(entry.pattern)), element('span', dateText(entry.createdAt)),
          element('span', selectionLabel(entry.traditionsSelection)),
          element('span', entry.chartAvailable ? 'Calculated chart saved' : 'No calculated chart saved'));
        button.addEventListener('click', () => loadAssessment(entry.id, true));
        item.append(button);
        list.append(item);
      }
      byId('profile-empty').hidden = data.total > 0;
      byId('profile-history-range').textContent = data.total
        ? 'Showing ' + (data.offset + 1) + '–' + (data.offset + data.assessments.length) + ' of ' + data.total + '. Dates use your current time zone.'
        : 'No confirmed saved assessments.';
      status('profile-status', '');
      if (!data.total) {
        current = null;
        detailSequence++;
        byId('profile-assessment').hidden = true;
        byId('profile-assessment-content').replaceChildren();
      } else if (!current || !data.assessments.some(entry => entry.id === current.id)) {
        await loadAssessment(data.assessments[0]?.id);
      } else highlightCurrent();
    } catch (error) {
      if (!getProfileSession() || getProfileSession()?.token === requestToken) handleFailure(error);
    } finally {
      listBusy = false;
      updateHistoryControls();
    }
  }

  byId('profile-login-form').addEventListener('submit', async event => {
    event.preventDefault();
    const button = byId('profile-send-link');
    button.disabled = true;
    status('profile-login-status', 'Requesting your sign-in link…');
    try {
      const data = await profileRequest('profile-login', { email: byId('profile-email').value.trim() }, false);
      status('profile-login-status', data.message);
    } catch (error) { handleFailure(error, 'profile-login-status'); }
    finally { button.disabled = false; }
  });

  byId('profile-logout').addEventListener('click', async () => {
    const button = byId('profile-logout');
    button.disabled = true;
    let message = 'Signed out.';
    try { await profileRequest('profile-logout'); }
    catch { message = 'Signed out in this tab. Server sign-out could not be confirmed; that session will expire automatically.'; }
    finally { signedOut(message); button.disabled = false; }
  });
  byId('profile-refresh').addEventListener('click', () => loadHistory(page.offset));
  byId('profile-previous').addEventListener('click', () => loadHistory(Math.max(0, page.offset - page.limit)));
  byId('profile-next').addEventListener('click', () => { if (page.nextOffset !== null) loadHistory(page.nextOffset); });

  byId('profile-download').addEventListener('click', async () => {
    if (!current || deleting) return;
    const snapshot = current;
    const requestToken = getProfileSession()?.token;
    if (!requestToken) { signedOut('Your saved-profile session has expired. Sign in again.', true); return; }
    const button = byId('profile-download');
    button.disabled = true;
    status('profile-download-status', 'Preparing this assessment’s PDF…');
    try {
      const data = snapshot.assessment;
      const bytes = await createSleepPdf(data.answers, data.traditionsSelection || {}, data.diary || [], contact?.name || '', globalThis.PDFLib, data.chart || null);
      if (getProfileSession()?.token !== requestToken || current?.id !== snapshot.id) return;
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      const link = element('a');
      link.href = url;
      const savedDate = /^\d{4}-\d{2}-\d{2}/.exec(snapshot.createdAt || '')?.[0] || 'saved';
      link.download = 'cloud-forest-sleep-' + savedDate + '.pdf';
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      status('profile-download-status', 'Your PDF is ready.');
    } catch (error) {
      if (getProfileSession()?.token === requestToken && current?.id === snapshot.id) status('profile-download-status', error.message, true);
    } finally { button.disabled = false; }
  });

  byId('profile-delete-confirmation').addEventListener('input', () => {
    byId('profile-delete-button').disabled = deleting || byId('profile-delete-confirmation').value !== DELETE_PHRASE;
  });
  byId('profile-delete-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (deleting || byId('profile-delete-confirmation').value !== DELETE_PHRASE) return;
    deleting = true;
    byId('profile-delete-button').disabled = true;
    byId('profile-delete-confirmation').disabled = true;
    updateHistoryControls();
    status('profile-delete-status', 'Deleting your saved assessments and birth details…');
    try {
      const data = await profileRequest('profile-delete', { requestId: crypto.randomUUID(), confirmation: DELETE_PHRASE });
      signedOut(data.message);
      byId('profile-signin-heading').focus?.();
    } catch (error) { handleFailure(error, 'profile-delete-status'); }
    finally {
      deleting = false;
      byId('profile-delete-confirmation').disabled = false;
      byId('profile-delete-button').disabled = byId('profile-delete-confirmation').value !== DELETE_PHRASE;
      updateHistoryControls();
    }
  });

  window.addEventListener('pageshow', () => {
    if (!byId('profile-dashboard').hidden && !getProfileSession()) signedOut('Sign in again to open your saved profile.');
  });

  if (loginToken !== null) {
    signedOut();
    byId('profile-send-link').disabled = true;
    status('profile-status', 'Checking your sign-in link…');
    try {
      if (!TOKEN_FORMAT.test(loginToken)) throw new Error('This sign-in link is invalid. Request a new link.');
      const data = await profileRequest('profile-redeem', { token: loginToken }, false);
      setProfileSession({ token: data.sessionToken, expiresAt: data.expiresAt });
    } catch (error) { status('profile-status', error.message, true); }
    finally { loginToken = null; byId('profile-send-link').disabled = false; }
  }
  if (getProfileSession()) { signedIn(); await loadHistory(); }
}

// admin.js imports the renderer. It must never redeem or clear an admin token.
if (typeof document !== 'undefined' && byId('profile-page')) startProfilePage();
