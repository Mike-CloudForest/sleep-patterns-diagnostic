import { questions, observationQuestions, breathingOptions, assessPattern, activeQuestions, optionsFor, answerLabel, validateAssessment, REPORT_VERSION, CONSENT_VERSION, REPORT_CONSENT, NEWSLETTER_CONSENT } from './assessment.js';
import { guidePatterns, guideSources, guideLearningSections, guideDiaryPlan, interpretAssessment, formatSleepMinutes } from './guide-model.js';
import { traditionsData, renderTraditions, getPatternEcho } from './traditions.js';
import { createSleepPdf } from './report.js';
import { API_URL } from './config.js';

const byId = id => document.getElementById(id);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paragraphs = values => values.map(text => '<p>'+escape(text)+'</p>').join('');
const bullets = values => '<ul>'+values.map(text=>'<li>'+escape(text)+'</li>').join('')+'</ul>';
const ageQuestion = observationQuestions.find(q=>q.id==='ageBand');
const detailQuestions = observationQuestions.filter(q=>q.id!=='ageBand');
let answers = {};
let traditionsSelection = {};
let diary = [];
let current = 0;
let editing = false;
let pendingEmail = null;

function restore() {
  try {
    const pending = JSON.parse(sessionStorage.getItem('cloudforest-sleep-email-request') || 'null');
    if (pending && /^[a-f0-9]{64}$/.test(pending.fingerprint) && /^[a-f0-9-]{36}$/.test(pending.id)) pendingEmail = pending;
  } catch {}
  try {
    const stored = JSON.parse(sessionStorage.getItem('cloudforest-sleep-guide-1') || 'null');
    if (stored) {
      let safe;
      try { safe = validateAssessment(stored); }
      catch {
        const extras = validateAssessment({...stored,answers:{layout:'E',total:'unknown',alertness:'E'}});
        traditionsSelection = extras.traditionsSelection;
        diary = extras.diary;
        return;
      }
      answers = safe.answers;
      traditionsSelection = safe.traditionsSelection;
      diary = safe.diary;
      byId('start-assessment').textContent = 'Continue my assessment';
    }
  } catch { /* An incomplete or old session starts with a clean assessment. */ }
}
function saveProgress() {
  try { sessionStorage.setItem('cloudforest-sleep-guide-1', JSON.stringify({answers,traditionsSelection,diary})); } catch {}
}
function route() { return [ageQuestion,...activeQuestions(answers)]; }
function selectionOptions(question) { return optionsFor(question,answers); }
function focusHeading(element) {
  const heading = element.querySelector('h1,h2,h3');
  if (heading) {heading.tabIndex=-1;heading.focus({preventScroll:true});heading.scrollIntoView({block:'start',behavior:'auto'});}
}
function showQuestion() {
  if (current>=route().length) {editing=false;showResults(true);return;}
  const question=route()[current];
  const helper=question.id==='naps' && answers.layout==='B'
    ? 'Count naps outside your two main stretches of sleep.' : question.help;
  const isTime=question.type==='duration';
  const amount=Number.isInteger(answers.total)?answers.total:null;
  byId('question-host').innerHTML=`
    <div class="question-card" data-question-id="${question.id}">
      <p class="question-progress">Question ${current+1}</p>
      <h2 id="current-question">${escape(question.q)}</h2>
      ${helper?'<p id="question-help">'+escape(helper)+'</p>':''}
      ${isTime?`<form id="duration-form" aria-labelledby="current-question">
        <div class="time-fields">
          <label class="field">Hours<input id="sleep-hours" type="number" min="0" max="24" step="1" inputmode="numeric" placeholder="0" value="${amount===null?'':Math.floor(amount/60)}"></label>
          <label class="field">Minutes<input id="sleep-minutes" type="number" min="0" max="59" step="1" inputmode="numeric" placeholder="0" value="${amount===null?'':amount%60}"></label>
        </div>
        <p id="duration-error" class="status-message" role="alert"></p>
        <div class="button-row"><button id="submit-duration" class="button button-primary" type="submit">Continue</button><button id="unknown-duration" class="button button-secondary" type="button">I’m not sure</button></div>
      </form>`:`<div class="options">${selectionOptions(question).map(option=>`<button type="button" class="quiz-option" data-letter="${option.l}" aria-pressed="${answers[question.id]===option.l}">${escape(option.t)}</button>`).join('')}</div>`}
      ${current?'<button type="button" id="previous-question" class="text-button">Back</button>':''}
    </div>`;
  focusHeading(byId('question-host'));
}
function recordAnswer(value) {
  const question=route()[current];
  answers[question.id]=value;
  if (question.id==='ageBand' && value==='under18') {
    byId('question-host').innerHTML='<div class="card"><h2>Use guidance matched to your age</h2><p>This assessment and email signup are designed for adults. Children and teenagers have different sleep needs. A parent, caregiver or healthcare professional can help you explore sleep concerns.</p><p><a href="https://www.cdc.gov/sleep/about/">CDC guidance for each age</a></p><button class="button button-secondary" id="change-age" type="button">Change age range</button></div>';
    focusHeading(byId('question-host'));
    return;
  }
  const active=activeQuestions(answers);
  for(const q of questions) {
    if(!active.some(a=>a.id===q.id) || (q.opts && answers[q.id] && !selectionOptions(q).some(o=>o.l===answers[q.id]))) delete answers[q.id];
  }
  if(editing) {
    const missing=route().findIndex(q=>answers[q.id]===undefined);
    current=missing<0?route().length:missing;
  } else current++;
  showQuestion();
}
byId('start-assessment').addEventListener('click',()=>{
  byId('intro').hidden=true;byId('assessment').hidden=false;byId('results').hidden=true;
  current=0;showQuestion();
});
byId('question-host').addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button)return;
  if(button.id==='previous-question'){current--;showQuestion();}
  else if(button.id==='change-age'){current=0;showQuestion();}
  else if(button.id==='unknown-duration')recordAnswer('unknown');
  else if(button.dataset.letter)recordAnswer(button.dataset.letter);
});
byId('question-host').addEventListener('submit',event=>{
  if(event.target.id!=='duration-form')return;
  event.preventDefault();
  const total=Number(byId('sleep-hours').value)*60+Number(byId('sleep-minutes').value);
  if(!Number.isInteger(total)||total<1||total>1440){byId('duration-error').textContent='Enter a sleep time within 24 hours, or choose “I’m not sure.”';return;}
  recordAnswer(total);
});
function sources(ids) {
  return '<ul class="source-list">'+[...new Set(ids)].map(id=>guideSources[id]?'<li><a target="_blank" rel="noopener" href="'+guideSources[id].url+'">'+escape(guideSources[id].title)+'</a></li>':'').join('')+'</ul>';
}
function guidePages(pages) { return '<p class="small muted">Field Guide pages '+pages.join(', ')+' · <a href="./assets/Sleep-Patterns-Guide.pdf" target="_blank" rel="noopener">Read the source guide</a></p>'; }
function timeLabel(text) {
  const [h,m]=text.split(':').map(Number);
  return (h%12||12)+(m?':'+String(m).padStart(2,'0'):'')+(h<12?' am':' pm');
}
function timeline(example) {
  if(!example)return '<p>There isn’t one example schedule that fits all the details you gave. Use the diary to record your own sleep times.</p>';
  const segments=[];
  for(const block of example.blocks){
    const minutes=t=>t.split(':').reduce((h,m)=>Number(h)*60+Number(m));
    const start=minutes(block.start),end=minutes(block.end);
    const ranges=end<=start?[[start,1440],[0,end]]:[[start,end]];
    for(const [a,b] of ranges)segments.push(`<span class="sleep-segment" style="left:${a/14.4}%;width:${(b-a)/14.4}%" title="${escape(block.label)} ${escape(block.start)}–${escape(block.end)}"></span>`);
  }
  return '<p class="small muted">An illustrative day from this pattern. Your own hours may differ.</p><div class="sleep-timeline" aria-hidden="true">'+segments.join('')+'</div><div class="time-axis" aria-hidden="true"><span>Midnight</span><span>6 am</span><span>Noon</span><span>6 pm</span><span>Midnight</span></div>'+
    '<ul class="schedule-list">'+example.blocks.map(b=>'<li><strong>'+escape(b.label)+'</strong> '+timeLabel(b.start)+' – '+timeLabel(b.end)+'</li>').join('')+'</ul><p>Example total <strong>'+escape(example.totalText)+'</strong></p>';
}
function profileDetails(profile) {
  return '<h3>Understanding this pattern</h3>'+paragraphs(profile.overview)+
    '<h4>Practical features</h4>'+bullets(profile.practicalBenefits)+
    '<h4>Tradeoffs to consider</h4>'+bullets(profile.constraints)+
    '<details><summary>Context and evidence</summary>'+paragraphs([...profile.context,...profile.evidence])+sources(profile.sourceIds)+'</details>'+
    guidePages(profile.guideSource.pages);
}
function showResults(moveFocus=false) {
  try { validateAssessment({answers,traditionsSelection,diary}); } catch(error) {byId('question-host').innerHTML='<div class="card"><h2>Review your answers</h2><p>'+escape(error.message)+'</p></div>';return;}
  byId('assessment').hidden=true;byId('results').hidden=false;
  const assessment=assessPattern(answers);
  const info=interpretAssessment(answers,assessment);
  const profile=info.profile;
  byId('result-summary').innerHTML='<p class="eyebrow">Your reported pattern</p><h2>'+escape(profile.name)+'</h2>'+
    '<p class="lead">'+escape(assessment.reason||profile.overview[0])+'</p>'+
    (answers.layout==='B'&&answers.naps==='B'?'<p>You also nap on some days.</p>':'')+
    '<div class="result-facts"><div><span>Reported sleep in 24 hours</span><strong>'+escape(formatSleepMinutes(answers.total))+'</strong></div><div><span>Afternoon alertness</span><strong>'+escape(answerLabel(questions.find(q=>q.id==='alertness'),answers))+'</strong></div></div>'+
    (assessment.edit?.length?'<div class="button-row">'+assessment.edit.map(id=>'<button type="button" class="button button-secondary" data-edit="'+id+'">Review '+escape({total:'total hours',napType:'naps',schedule:'specific schedule',layout:'usual sleep'}[id]||id)+'</button>').join('')+'</div>':'');
  byId('result-analysis').innerHTML='<h3>What your answers suggest</h3><p class="small muted">These observations come from the answers you gave. Add more detail below to expand them.</p>'+
    info.evaluations.map(item=>'<article class="evaluation '+item.level+'"><h4>'+escape(item.title)+'</h4>'+paragraphs(item.paragraphs)+'</article>').join('');
  byId('profile-detail').innerHTML=profileDetails(profile);
  byId('schedule-preview').innerHTML='<h3>A day with this pattern</h3>'+timeline(profile.example);
  byId('next-steps').innerHTML='<h3>Your next steps</h3>'+bullets([...new Set([...info.actions,...profile.nextSteps])])+
    '<p><a href="#diary-panel">Record the next two weeks</a></p>';
  byId('sources').innerHTML='<details><summary>Sources for this evaluation</summary>'+sources(info.sourceIds)+guidePages(profile.guideSource.pages)+'</details>';
  if(!byId('details-form'))renderObservations();
  if(!byId('traditions-panel').hasChildNodes())renderTraditions(byId('traditions-panel'),traditionsSelection);
  saveProgress();
  if(moveFocus)focusHeading(byId('results'));
}
byId('result-summary').addEventListener('click',event=>{
  const button=event.target.closest('[data-edit]');
  if(button)editQuestion(button.dataset.edit);
});
function editQuestion(id) {
  current=route().findIndex(q=>q.id===id);
  if(current<0)return;
  editing=true;byId('results').hidden=true;byId('assessment').hidden=false;showQuestion();
}
byId('review-assessment').addEventListener('click',()=>{
  editing=false;current=0;byId('results').hidden=true;byId('assessment').hidden=false;showQuestion();
});
function renderObservations() {
  byId('details-panel').innerHTML='<details><summary>Add more detail to your evaluation</summary><p>Your preferred hours, sleep interruptions and daytime experiences can help explain the pattern.</p><form id="details-form" class="observation-form"><div class="form-grid">'+
    detailQuestions.map(q=>'<label class="field"><span>'+escape(q.q)+'</span><select name="'+q.id+'"><option value="">Skip this question</option>'+q.opts.map(o=>'<option value="'+o.l+'"'+(answers[q.id]===o.l?' selected':'')+'>'+escape(o.t)+'</option>').join('')+'</select></label>').join('')+
    '</div><fieldset><legend>Sleep observations you have noticed</legend><p class="small muted">Select any that apply. You can leave this blank.</p>'+breathingOptions.map(o=>'<label class="check-field"><input type="checkbox" name="apneaSigns" value="'+o.l+'"'+(answers.apneaSigns?.includes(o.l)?' checked':'')+'><span>'+escape(o.t)+'</span></label>').join('')+'</fieldset><button class="button button-primary" type="submit">Update my evaluation</button><p id="details-status" role="status"></p></form></details>';
}
byId('details-panel').addEventListener('submit',event=>{
  event.preventDefault();
  const form=new FormData(event.target);
  for(const q of detailQuestions){const value=form.get(q.id); if(value)answers[q.id]=value;else delete answers[q.id];}
  answers.apneaSigns=form.getAll('apneaSigns');
  showResults();byId('details-status').textContent='Your evaluation and PDF now include these observations.';
  focusHeading(byId('result-analysis'));
});
byId('traditions-panel').addEventListener('traditionschange',event=>{
  traditionsSelection=event.detail;
  saveProgress();
});
function renderReference() {
  const ids=['monophasic','biphasic_siesta','biphasic_nap','segmented','segmented_naps','triphasic','everyman','uberman','irregular'];
  byId('pattern-explorer').innerHTML='<div class="section-heading"><div><p class="eyebrow">The Field Guide</p><h2>Compare the sleep patterns</h2></div></div><p>Explore the arrangements, everyday tradeoffs and evidence in the guide. The examples show how time is divided across a day.</p><label class="field pattern-select"><span>Choose a pattern</span><select id="explore-pattern">'+ids.map(id=>'<option value="'+id+'">'+escape(guidePatterns[id].name)+'</option>').join('')+'</select></label><div id="explored-pattern" class="card"></div>';
  function updateExplorer(){
    const p=guidePatterns[byId('explore-pattern').value];
    byId('explored-pattern').innerHTML='<h3>'+escape(p.name)+'</h3>'+paragraphs(p.overview)+timeline(p.example)+
      '<div class="result-columns"><div><h4>Practical features</h4>'+bullets(p.practicalBenefits)+'</div><div><h4>Tradeoffs</h4>'+bullets(p.constraints)+'</div></div>'+
      paragraphs(p.evidence)+sources(p.sourceIds)+guidePages(p.guideSource.pages);
  }
  byId('explore-pattern').addEventListener('change',updateExplorer);updateExplorer();
  byId('learning').innerHTML='<p class="eyebrow">How sleep works</p><h2>Read beyond the pattern name</h2><div class="learning-list">'+guideLearningSections.map(section=>'<details><summary>'+escape(section.title)+'</summary>'+paragraphs(section.paragraphs)+sources(section.sourceIds)+guidePages(section.guideSource.pages)+'</details>').join('')+'</div>';
}
function localDate(offset=0){
  const date=new Date();date.setDate(date.getDate()+offset);
  return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
}
function renderDiary() {
  byId('diary-panel').innerHTML='<p class="eyebrow">Observe your own routine</p><h2>A two-week sleep diary</h2><p>For each day, add your main sleep and naps. If your main sleep is split, include both stretches and leave out the time awake. Saved diary entries are included in your PDF.</p>'+
    '<form id="diary-form" class="card"><div class="form-grid">'+
    '<label class="field">Date<input name="date" type="date" required value="'+localDate()+'"></label>'+
    '<label class="field">Main sleep, hours<input name="hours" type="number" inputmode="numeric" min="0" max="24" step="1" required></label>'+
    '<label class="field">Main sleep, extra minutes<input name="minutes" type="number" inputmode="numeric" min="0" max="59" step="1" value="0" required></label>'+
    '<label class="field">Naps, total minutes<input name="napMinutes" type="number" inputmode="numeric" min="0" max="1440" step="1" value="0" required></label>'+
    '<label class="field">How you felt<select name="energy"><option value="">Skip</option><option value="rested">Rested</option><option value="mixed">Mixed</option><option value="sleepy">Sleepy</option></select></label></div>'+
    '<button class="button button-primary" type="submit">Save this day</button><p id="diary-status" role="status"></p></form>'+
    '<div id="diary-entries"></div><p class="small muted">Entries stay in this browser tab until you choose to download or email them. Closing the tab may clear them. You can save a PDF for a lasting copy.</p>'+
    '<details><summary>'+guideDiaryPlan.title+'</summary>'+guideDiaryPlan.steps.map(item=>'<h3>'+escape(item.title)+'</h3><p>'+escape(item.text)+'</p>').join('')+'</details>';
  displayDiary();
}
function displayDiary() {
  if(!diary.length){byId('diary-entries').innerHTML='<p class="muted">Your recorded days will appear here. A blank two-week record is included in the PDF if you leave this empty.</p>';return;}
  const average=Math.round(diary.reduce((sum,r)=>sum+r.mainMinutes+r.napMinutes,0)/diary.length);
  byId('diary-entries').innerHTML='<p><strong>'+diary.length+' recorded days</strong> · average '+escape(formatSleepMinutes(average))+'</p><div class="table-scroll"><table><thead><tr><th>Date</th><th>Main sleep</th><th>Naps</th><th>Total</th><th>Action</th></tr></thead><tbody>'+[...diary].sort((a,b)=>a.date.localeCompare(b.date)).map(row=>'<tr><td>'+row.date+'</td><td>'+escape(row.mainMinutes?formatSleepMinutes(row.mainMinutes):'0 minutes')+'</td><td>'+escape(row.napMinutes?formatSleepMinutes(row.napMinutes):'0 minutes')+'</td><td>'+escape(formatSleepMinutes(row.mainMinutes+row.napMinutes))+'</td><td><button class="text-button" type="button" data-remove-day="'+row.date+'">Remove</button></td></tr>').join('')+'</tbody></table></div>';
}
byId('diary-panel').addEventListener('submit',event=>{
  event.preventDefault();
  const data=new FormData(event.target);
  const mainMinutes=Number(data.get('hours'))*60+Number(data.get('minutes'));
  const napMinutes=Number(data.get('napMinutes'));
  if(mainMinutes+napMinutes>1440||mainMinutes+napMinutes<1){byId('diary-status').textContent='The sleep total should be between one minute and 24 hours.';return;}
  const date=String(data.get('date'));
  if(!diary.some(row=>row.date===date)&&diary.length>=14){byId('diary-status').textContent='Your diary has 14 days. Remove a day to make room for another.';return;}
  diary=diary.filter(row=>row.date!==date);
  diary.push({date,mainMinutes,napMinutes,energy:String(data.get('energy'))});
  saveProgress();displayDiary();
  byId('diary-status').textContent='Saved. Your next PDF will include this day.';
});
byId('diary-panel').addEventListener('click',event=>{
  const btn=event.target.closest('[data-remove-day]');
  if(btn){diary=diary.filter(row=>row.date!==btn.dataset.removeDay);saveProgress();displayDiary();}
});
function pdfName(){return 'Cloud-Forest-Sleep-Report-'+assessPattern(answers).key+'.pdf';}
async function downloadReport(print=false) {
  const button=byId(print?'print-report':'download-report');
  button.disabled=true;
  try {
    const pdf=await createSleepPdf(answers,traditionsSelection,diary,byId('report-name').value);
    const url=URL.createObjectURL(new Blob([pdf],{type:'application/pdf'}));
    const link=document.createElement('a');link.href=url;link.download=pdfName();document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
    byId('report-status').textContent=print?'Open the downloaded PDF and choose Print in your PDF viewer.':'Your PDF is ready to save.';
  }catch(error){byId('report-status').textContent=error.message;}
  finally{button.disabled=false;}
}
byId('download-report').addEventListener('click',()=>downloadReport());
byId('print-report').addEventListener('click',()=>downloadReport(true));
document.querySelector('label[for="report-consent"] span').textContent=REPORT_CONSENT;
document.querySelector('label[for="newsletter-consent"] span').textContent=NEWSLETTER_CONSENT;
byId('report-name').maxLength=100;
byId('newsletter-signature').maxLength=100;
byId('newsletter-consent').addEventListener('change',event=>{
  const checked=event.target.checked;
  byId('newsletter-signature-wrap').hidden=!checked;
  byId('newsletter-signature').disabled=!checked;
  byId('newsletter-signature').required=checked;
  event.target.setAttribute('aria-expanded',String(checked));
});
byId('report-form').addEventListener('submit',async event=>{
  event.preventDefault();
  const button=byId('send-report');button.disabled=true;
  try{
  const safe=validateAssessment({answers,traditionsSelection,diary});
  const payload={
    action:'report',...safe,email:byId('report-email').value.trim(),name:byId('report-name').value.trim(),
    reportConsent:byId('report-consent').checked,newsletterConsent:byId('newsletter-consent').checked,
    signature:byId('newsletter-consent').checked?byId('newsletter-signature').value.trim():'',
    consentVersion:CONSENT_VERSION,reportVersion:REPORT_VERSION,website:byId('contact-website')?.value||''
  };
  const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(payload)));
  const fingerprint=[...new Uint8Array(hash)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
  if(!pendingEmail||pendingEmail.fingerprint!==fingerprint)pendingEmail={fingerprint,id:crypto.randomUUID()};
  try{sessionStorage.setItem('cloudforest-sleep-email-request',JSON.stringify(pendingEmail));}catch{}
  payload.requestId=pendingEmail.id;
  byId('report-status').textContent='Preparing and sending your PDF…';
    const response=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const result=await response.json();
    if(response.status===202){byId('report-status').textContent='Your report is being prepared. Wait a few seconds, then use the same button to check again.';return;}
    if(!response.ok||!result.ok){
      if(['request_expired','request_changed'].includes(result.code))byId('new-report-request').hidden=false;
      throw new Error(result.error||result.message||'The email could not be sent. Please retry. Your PDF is also available to download.');
    }
    byId('new-report-request').hidden=true;
    byId('report-status').textContent='Your PDF is on its way to '+payload.email+'. Check your inbox and spam folder.'+(payload.newsletterConsent?' Your signed newsletter consent has been recorded.':'');
  }catch(error){byId('report-status').textContent=error.message||'The connection was interrupted. Please retry.';}
  finally{button.disabled=false;}
});
byId('new-report-request').addEventListener('click',()=>{
  pendingEmail=null;
  try{sessionStorage.removeItem('cloudforest-sleep-email-request');}catch{}
  byId('new-report-request').hidden=true;
  byId('report-form').requestSubmit();
});
const trap=document.createElement('label');
trap.className='form-trap';trap.setAttribute('aria-hidden','true');
trap.innerHTML='Website<input id="contact-website" type="text" tabindex="-1" autocomplete="off">';
byId('report-form').prepend(trap);
restore();
renderReference();
renderDiary();
