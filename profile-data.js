import { ageOnDate, deriveBirthProfile } from './birth-profile.js';
import { deriveHumanDesign } from './birth-chart.js';

export const PROFILE_CONSENT_VERSION = '2026-11-24';
export const PROFILE_CONSENT = 'I ask Cloud Forest to save my birth details, chart results, sleep answers and diary so I can return to them. I understand that the Cloud Forest administrator can review this saved profile. I can delete my saved profile without joining or leaving the newsletter.';

const signs = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
const types = ['generator','manifesting_generator','projector','manifestor','reflector'];
const authorities = ['emotional','sacral','splenic','ego_manifested','ego_projected','self_projected','environmental','lunar'];
const definitions = ['none','single','split','triple_split','quadruple_split'];
const centers = ['head','ajna','throat','g','sacral','spleen','solar_plexus','ego','root'];
const bodies = ['sun','earth','moon','north_node','south_node','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'];
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const title = value => value.replace(/_/g,' ').replace(/\b\w/g,letter=>letter.toUpperCase());
function keys(value, allowed, message) {
  if (!object(value) || Object.keys(value).some(key=>!allowed.includes(key))) throw new Error(message);
}
function text(value, max, message, optional=false) {
  if (optional && (value===undefined || value==='')) return '';
  if (typeof value!=='string' || !value.trim() || value.length>max || /[\u0000-\u001f\u007f]/.test(value)) throw new Error(message);
  return value.trim();
}
function uniqueList(values, allowed, max, message) {
  if (!Array.isArray(values) || values.length>max || values.some(value=>!allowed.includes(value)) || new Set(values).size!==values.length) throw new Error(message);
  return [...values];
}

/** The report accepts only derived chart fields. Raw birth data has a separate consent path. */
export function validateChartSummary(value) {
  if (value===undefined || value===null) return null;
  const error='Recalculate your birth chart before including it in the report.';
  keys(value,['version','western','humanDesign','warnings','precision'],error);
  if (value.version!=='cf-chart-1' || !['entered-time','approximate-time'].includes(value.precision)) throw new Error(error);
  keys(value.western,['sun','moon'],error);
  const western={};
  for (const body of ['sun','moon']) {
    keys(value.western[body],['id','name'],error);
    const id=value.western[body].id;
    if (!signs.includes(id)) throw new Error(error);
    western[body]={id,name:title(id)};
  }
  const hd=value.humanDesign;
  keys(hd,['type','typeName','authority','authorityName','profile','definition','definedCenters','channels','activations'],error);
  if (!types.includes(hd.type) || !authorities.includes(hd.authority) || !definitions.includes(hd.definition) || !['1/3','1/4','2/4','2/5','3/5','3/6','4/6','4/1','5/1','5/2','6/2','6/3'].includes(hd.profile)) throw new Error(error);
  const definedCenters=uniqueList(hd.definedCenters,centers,9,error);
  if (!Array.isArray(hd.channels) || hd.channels.length>36) throw new Error(error);
  const channels=hd.channels.map(channel=>{
    keys(channel,['id','gates','centers'],error);
    if (!Array.isArray(channel.gates) || channel.gates.length!==2 || channel.gates.some(gate=>!Number.isInteger(gate)||gate<1||gate>64) || channel.gates[0]===channel.gates[1]) throw new Error(error);
    const channelCenters=uniqueList(channel.centers,centers,2,error);
    if (channelCenters.length!==2 || channelCenters.some(center=>!definedCenters.includes(center))) throw new Error(error);
    const id=text(channel.id,12,error);
    if (!/^\d{1,2}-\d{1,2}$/.test(id) || !id.split('-').every(gate=>channel.gates.includes(Number(gate)))) throw new Error(error);
    return {id,gates:[...channel.gates],centers:channelCenters};
  });
  if (new Set(channels.map(channel=>channel.id)).size!==channels.length) throw new Error(error);
  keys(hd.activations,['personality','design'],error);
  const activations={};
  for (const side of ['personality','design']) {
    const rows=hd.activations[side];
    if (!Array.isArray(rows) || rows.length!==13 || new Set(rows.map(row=>row?.body)).size!==13) throw new Error(error);
    activations[side]=rows.map(row=>{
      keys(row,['body','gate','line'],error);
      if (!bodies.includes(row.body) || !Number.isInteger(row.gate) || row.gate<1 || row.gate>64 || !Number.isInteger(row.line) || row.line<1 || row.line>6) throw new Error(error);
      return {body:row.body,gate:row.gate,line:row.line};
    });
  }
  if (!Array.isArray(value.warnings) || value.warnings.length>12) throw new Error(error);
  const warnings=value.warnings.map(item=>text(item,700,error));
  const derived=deriveHumanDesign(activations);
  if (['type','authority','profile','definition'].some(key=>derived[key]!==hd[key]) ||
    JSON.stringify([...derived.definedCenters].sort())!==JSON.stringify([...definedCenters].sort()) ||
    JSON.stringify(derived.channels.map(item=>item.id).sort())!==JSON.stringify(channels.map(item=>item.id).sort())) throw new Error(error);
  return {version:'cf-chart-1',western,humanDesign:{
    ...derived,activations
  },warnings,precision:value.precision};
}

export function chartSelection(chart, selection={}) {
  return chart ? {...selection,western:chart.western.sun.id,westernBasis:'calculated',humanDesign:chart.humanDesign.type,humanDesignBasis:'calculated'} : {...selection};
}

export function normalizeBirthDetails(value, now=new Date()) {
  if (value===undefined || value===null) return null;
  const message='Review your birth details before saving your profile.';
  keys(value,['date','time','timeAccuracy','place','timeOccurrence'],message);
  const date=text(value.date,10,message);
  deriveBirthProfile(date,now);
  if (ageOnDate(date,now)<18) throw new Error('Saved profiles and this assessment are designed for adults.');
  const timeAccuracy=value.timeAccuracy||'unknown';
  if (!['exact','approximate','unknown'].includes(timeAccuracy)) throw new Error(message);
  let time=text(value.time,8,message,true);
  if (time && !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(time)) throw new Error('Check the local birth time.');
  if (timeAccuracy==='unknown') time='';
  let place=null;
  if (value.place!==null && value.place!==undefined) {
    keys(value.place,['label','latitude','longitude','timeZone','countryCode'],message);
    const label=text(value.place.label,200,message);
    let timeZone=text(value.place.timeZone,90,message,true);
    if (timeZone) {
      try { timeZone=new Intl.DateTimeFormat('en',{timeZone}).resolvedOptions().timeZone; }
      catch { throw new Error('Choose a valid time zone for the birthplace.'); }
    }
    const countryCode=text(value.place.countryCode,2,message,true).toUpperCase();
    if (countryCode && !/^[A-Z]{2}$/.test(countryCode)) throw new Error(message);
    place={label,timeZone};
    if(countryCode)place.countryCode=countryCode;
    if (value.place.latitude!==undefined || value.place.longitude!==undefined) {
      if (!Number.isFinite(value.place.latitude) || !Number.isFinite(value.place.longitude) || Math.abs(value.place.latitude)>90 || Math.abs(value.place.longitude)>180) throw new Error('Check the birthplace coordinates.');
      place.latitude=value.place.latitude;place.longitude=value.place.longitude;
    }
  }
  const result={date,time,timeAccuracy,place};
  if (value.timeOccurrence!==undefined && value.timeOccurrence!=='') {
    if (!['earlier','later'].includes(value.timeOccurrence)) throw new Error(message);
    result.timeOccurrence=value.timeOccurrence;
  }
  return result;
}

/** Called only after explicit retention consent. Recompute any submitted chart on the server. */
export async function validateSavedProfile(value, {now=new Date()}={}) {
  keys(value,['birthDetails','chart'],'Review the saved-profile fields.');
  const birthDetails=normalizeBirthDetails(value.birthDetails,now);
  let chart=null;
  const traditionsSelection={};
  if (birthDetails) {
    const derived=deriveBirthProfile(birthDetails.date,now);
    if (!derived.western.boundary) Object.assign(traditionsSelection,{western:derived.western.id,westernBasis:'date_range'});
    if (derived.chinese) Object.assign(traditionsSelection,{chinese:derived.chinese.id,chineseBasis:'lunar_new_year',chineseYear:derived.chinese.year,chineseElement:derived.chinese.element,chinesePolarity:derived.chinese.polarity});
  }
  if (value.chart!==undefined && value.chart!==null) {
    if (!birthDetails) throw new Error('Include the birth details used for this chart when saving it, or save a profile without a calculated chart.');
    validateChartSummary(value.chart);
    const {calculateBirthChart}=await import('./birth-chart.js');
    chart=validateChartSummary(calculateBirthChart(birthDetails,{now}));
    Object.assign(traditionsSelection,chartSelection(chart));
  }
  const age=birthDetails?ageOnDate(birthDetails.date,now):null;
  const ageBand=age===null?undefined:age<=60?'18_60':age<=64?'61_64':'65_plus';
  return {birthDetails,chart,traditionsSelection,ageBand};
}
