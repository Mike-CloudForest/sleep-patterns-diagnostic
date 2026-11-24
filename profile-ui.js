import { traditionsData } from './traditions.js';
import { observationQuestions } from './assessment.js';
import { deriveBirthProfile, ageOnDate } from './birth-profile.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const preferenceIds = ['chronotype','restChallenge','energyStyle'];
export const HUMAN_DESIGN_CHART_URL = 'https://jovianarchive.com/pages/get-your-human-design-chart';

function today() {
  const d = new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function ageRange(date) {
  const age = ageOnDate(date);
  return age<18?'under18':age<=60?'18_60':age<=64?'61_64':'65_plus';
}
function options(records, selected, empty) {
  return '<option value="">'+escape(empty)+'</option>'+records.map(item=>'<option value="'+item.id+'"'+(item.id===selected?' selected':'')+'>'+escape(item.name)+'</option>').join('');
}

// Birth date stays in the form and the caller's memory. Only derived sign IDs
// and their calculation basis are passed into the report's validated selection.
export function renderProfileIntake(container, {selection={},answers={},birthDate='',onContinue,onSkip,onBack,onAgeGate}) {
  let draft = {...selection};
  let derived = null;
  let lastDerivedDate = birthDate;
  const preferenceFields = preferenceIds.map(id=>{
    const q=observationQuestions.find(question=>question.id===id);
    return '<label class="field"><span>'+escape(q.q)+'</span><select name="'+id+'"><option value="">Skip / I’m not sure</option>'+q.opts.filter(option=>option.l!=='unknown').map(option=>'<option value="'+option.l+'"'+(answers[id]===option.l?' selected':'')+'>'+escape(option.t)+'</option>').join('')+'</select></label>';
  }).join('');
  container.innerHTML=`<div class="question-card profile-intake">
    <p class="question-progress">Your personal profile · optional final step</p>
    <h2>Bring your sleep and personal profile together</h2>
    <p>Add your signs, Human Design type and everyday preferences. Your report will compare them with the sleep answers you just gave.</p>
    <form id="personal-profile-form">
      <fieldset>
        <legend>Your birth-date signs</legend>
        <p>Use your birth date to look up a Western Sun-sign estimate and your Chinese birth-year animal and element. You can also choose signs you already know.</p>
        <div class="birth-lookup-row">
          <label class="field" for="birth-date"><span>Birth date <span class="optional">(optional)</span></span><input id="birth-date" name="birthDate" type="date" min="1900-01-01" max="${today()}" value="${escape(birthDate)}" aria-describedby="birth-privacy birth-lookup-status"></label>
          <button id="lookup-birth-signs" class="button button-secondary" type="button">Find my signs</button>
        </div>
        <p id="birth-privacy" class="small muted">Your date is used in this tab. The app saves only your selected signs and calculation details with your results; your full birth date is left out of storage, PDFs and email requests.</p>
        <p id="birth-lookup-status" class="profile-lookup-status" role="status"></p>
        <div class="form-grid">
          <label class="field"><span>Western Sun sign</span><select id="profile-western" name="western">${options(traditionsData.western.signs,draft.western,'Unknown / leave out')}</select></label>
          <label class="field"><span>Chinese zodiac animal</span><select id="profile-chinese" name="chinese">${options(traditionsData.chinese.animals,draft.chinese,'Unknown / leave out')}</select></label>
        </div>
        <p class="small muted">Chinese signs use Lunar New Year here. Western dates close to a sign change need confirmation from a birth chart. This step identifies a Sun sign and a Chinese year sign; it does not calculate a full natal or Four Pillars chart.</p>
      </fieldset>
      <fieldset>
        <legend>Your Human Design type</legend>
        <label class="field" for="profile-human-design"><span>Type shown on your Human Design chart</span><select id="profile-human-design" name="humanDesign">${options(traditionsData.humanDesign.types,draft.humanDesign,'I don’t know / leave out')}</select></label>
        <p class="small">If you don’t know it, <a href="${HUMAN_DESIGN_CHART_URL}" target="_blank" rel="noopener noreferrer">open the official free chart calculator</a>, then return and select your type. It asks for birth date, birth time and birthplace. This app does not send those details to that service.</p>
        <p class="small muted">Use the type on your chart. Your answers about personality or sleep cannot determine a Human Design type. Its separate DreamRave sleeping chart is outside this assessment.</p>
      </fieldset>
      <fieldset>
        <legend>Your everyday rhythm</legend>
        <p>These answers describe your own experience and help connect the traditional themes with what actually affects your rest.</p>
        <div class="preference-fields">${preferenceFields}</div>
      </fieldset>
      <p id="profile-intake-error" class="status-message" role="alert"></p>
      <div class="button-row"><button class="button button-primary" type="submit">See my connected report</button><button id="skip-personal-profile" class="button button-secondary" type="button">${Object.keys(selection).length?'Keep my current profile':'Skip optional profile'}</button></div>
      <button id="profile-back" class="text-button" type="button">Back to sleep questions</button>
    </form>
  </div>`;
  const query=selector=>container.querySelector(selector);
  const error=query('#profile-intake-error');
  const lookupStatus=query('#birth-lookup-status');
  function clearChineseMetadata() {
    for(const key of ['chineseYear','chineseElement','chinesePolarity'])delete draft[key];
  }
  function syncSelects() {
    query('#profile-western').value=draft.western||'';
    query('#profile-chinese').value=draft.chinese||'';
  }
  function lookup(clearEmpty=false) {
    error.textContent='';
    const date=query('#birth-date').value;
    if(!date) {
      if(!clearEmpty){lookupStatus.textContent='Enter a birth date to look up signs, or keep the signs already selected below.';return;}
      if(draft.westernBasis==='date_range'){delete draft.western;delete draft.westernBasis;}
      if(draft.chineseBasis==='lunar_new_year'){delete draft.chinese;delete draft.chineseBasis;clearChineseMetadata();}
      derived=null;lastDerivedDate='';syncSelects();lookupStatus.textContent='Choose signs you already know, or leave them out.';return;
    }
    try {
      derived=deriveBirthProfile(date);
      lastDerivedDate=date;
      if(ageRange(date)==='under18'){onAgeGate();return false;}
      const notices=[];
      if(derived.western.boundary) {
        delete draft.western;delete draft.westernBasis;
        const names=derived.western.candidates.map(id=>traditionsData.western.signs.find(sign=>sign.id===id)?.name||id);
        notices.push('Your date is close to a Sun-sign change ('+names.join(' / ')+'). Choose the sign confirmed by your birth chart, or leave it unknown.');
      } else {
        draft.western=derived.western.id;draft.westernBasis='date_range';
        notices.push('Western date-range estimate: '+derived.western.name+'.');
      }
      clearChineseMetadata();
      if(derived.chinese) {
        draft.chinese=derived.chinese.id;draft.chineseBasis='lunar_new_year';
        draft.chineseYear=derived.chinese.year;draft.chineseElement=derived.chinese.element;draft.chinesePolarity=derived.chinese.polarity;
        notices.push('Chinese birth-year profile: '+derived.chinese.polarity+' '+derived.chinese.element+' '+derived.chinese.name+' ('+derived.chinese.year+' lunar year).');
      } else {
        delete draft.chinese;delete draft.chineseBasis;
        notices.push(derived.chineseUnavailable||'This browser cannot calculate the Chinese calendar. Choose your known animal or leave it unknown.');
      }
      syncSelects();
      lookupStatus.textContent=notices.join(' ');
    } catch(problem) {
      derived=null;
      error.textContent=problem.message||'Check the birth date, or leave it blank and choose your known signs.';
      throw problem;
    }
  }
  query('#lookup-birth-signs').addEventListener('click',()=>{try{lookup();}catch{}});
  query('#birth-date').addEventListener('change',()=>{try{lookup(true);}catch{}});
  query('#profile-western').addEventListener('change',event=>{
    if(event.target.value){draft.western=event.target.value;draft.westernBasis=derived?.western.boundary?'confirmed':'selected';}
    else {delete draft.western;delete draft.westernBasis;}
  });
  query('#profile-chinese').addEventListener('change',event=>{
    clearChineseMetadata();
    if(event.target.value){draft.chinese=event.target.value;draft.chineseBasis='selected';}
    else {delete draft.chinese;delete draft.chineseBasis;}
  });
  query('#profile-human-design').addEventListener('change',event=>{
    if(event.target.value)draft.humanDesign=event.target.value;else delete draft.humanDesign;
  });
  query('#personal-profile-form').addEventListener('submit',event=>{
    event.preventDefault();error.textContent='';
    try {
      const date=query('#birth-date').value;
      if(date!==lastDerivedDate&&lookup(true)===false)return;
      if(date&&ageRange(date)==='under18'){onAgeGate();return;}
      const form=new FormData(event.target);
      const preferences=Object.fromEntries(preferenceIds.map(id=>[id,String(form.get(id)||'')]));
      onContinue({selection:{...draft},preferences,birthDate:date,ageBand:date?ageRange(date):undefined});
    } catch(problem) {error.textContent=problem.message||'Review your profile and try again.';}
  });
  query('#skip-personal-profile').addEventListener('click',()=>onSkip());
  query('#profile-back').addEventListener('click',()=>onBack());
  if(draft.chineseBasis==='lunar_new_year')lookupStatus.textContent='Saved Chinese profile: '+draft.chinesePolarity+' '+draft.chineseElement+' '+(traditionsData.chinese.animals.find(item=>item.id===draft.chinese)?.name||'')+' ('+draft.chineseYear+' lunar year). Your full birth date was not saved.';
}
