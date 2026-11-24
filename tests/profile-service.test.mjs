import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { createHash, randomUUID } from 'node:crypto';
import { REPORT_VERSION, CONSENT_VERSION } from '../assessment.js';
import { PROFILE_CONSENT_VERSION } from '../profile-data.js';

const CONTACT_A='11111111-1111-4111-8111-111111111111';
const CONTACT_B='22222222-2222-4222-8222-222222222222';
const ASSESSMENT_A='33333333-3333-4333-8333-333333333333';
const ASSESSMENT_B='44444444-4444-4444-8444-444444444444';
const SESSION_A='a'.repeat(43);
const LOGIN_A='b'.repeat(43);
const ADMIN='c'.repeat(43);
const hash=value=>createHash('sha256').update(value).digest('hex');
const answers={ageBand:'18_60',layout:'A',naps:'A',total:480,alertness:'A'};
const snapshot={answers,traditionsSelection:{},diary:[],birthDetails:null,chart:null};
const now=()=>new Date().toISOString();
const expires=()=>new Date(Date.now()+3600_000).toISOString();

function fixture() {
  return {
    contacts:[{id:CONTACT_A,email:'alice@example.test',name:'Synthetic Alice'},{id:CONTACT_B,email:'bob@example.test',name:'Synthetic Bob'}],
    saved:[{id:ASSESSMENT_A,contact_id:CONTACT_A,report_version:REPORT_VERSION,assessment:structuredClone(snapshot),created_at:now(),confirmed_at:now()},
      {id:ASSESSMENT_B,contact_id:CONTACT_B,report_version:REPORT_VERSION,assessment:{...structuredClone(snapshot),privateMarker:'Bobs private data'},created_at:now(),confirmed_at:now()}],
    tokens:[{token_hash:hash(SESSION_A),kind:'session',contact_id:CONTACT_A,scopes:['profile:read','profile:write','profile:delete'],used_at:null,expires_at:expires()},
      {token_hash:hash(LOGIN_A),kind:'login',contact_id:CONTACT_A,pending_assessment_id:null,used_at:null,expires_at:expires()}],
    admins:[{token_hash:hash(ADMIN),kind:'session',email:'sifu@cloudforesttemple.com',scopes:['contacts:read','contacts:export'],used_at:null,expires_at:expires()}],
    requests:[], consent:[], mail:[], calls:[], refuseFinish:false,
  };
}

function filterRows(rows, params) {
  return rows.filter(row=>[...params.entries()].every(([field,condition])=>{
    if(['select','order','offset','limit','on_conflict'].includes(field)) return true;
    if(condition==='is.null') return row[field]==null;
    if(condition==='not.is.null') return row[field]!=null;
    if(condition.startsWith('eq.')) return String(row[field])===condition.slice(3);
    if(condition.startsWith('gt.')) return row[field]>condition.slice(3);
    throw new Error('Unexpected database filter '+field+'='+condition);
  }));
}
function response(data,status=200,headers={}) {return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json',...headers}});}

async function withService(run) {
  const db=fixture();
  const oldFetch=globalThis.fetch;
  const oldDeno=globalThis.Deno;
  globalThis.Deno={env:{get:key=>({SUPABASE_URL:'https://database.example.test',SUPABASE_SERVICE_ROLE_KEY:'test-only-service-key'}[key])},serve(){}};
  globalThis.fetch=async(input,options={})=>{
    const url=new URL(String(input));
    const method=options.method||'GET';
    const body=options.body?JSON.parse(options.body):null;
    db.calls.push({url:String(url),method,body});
    if(url.origin==='https://api.resend.com') {db.mail.push({headers:options.headers,body});return response({id:'test-mail-id'});}
    assert.equal(url.origin,'https://database.example.test','Tests must never contact a real service');
    assert.equal(new Headers(options.headers).get('authorization'),'Bearer test-only-service-key');
    const resource=url.pathname.replace('/rest/v1/','');
    if(resource.startsWith('rpc/')) {
      switch(resource.slice(4)) {
        case 'sleep_get_config':return response({resend_api_key:'test-only-mail-key',signing_secret:'test-only-signing-secret-'.repeat(3)});
        case 'sleep_take_rate_limit':return response(true);
        case 'sleep_claim_report':{
          let row=db.requests.find(x=>x.request_id===body.p_request_id);
          if(!row){row={request_id:body.p_request_id,payload_hash:body.p_payload_hash,report_version:body.p_report_version,status:'sending',contact_id:CONTACT_A,created_at:now(),lease_expires_at:expires()};db.requests.push(row);}
          return response({status:'claimed',contactId:row.contact_id,lockToken:randomUUID(),createdAt:row.created_at});
        }
        case 'sleep_finish_report':{
          if(db.refuseFinish)return response(false);
          const row=db.requests.find(x=>x.request_id===body.p_request_id);
          if(row)row.status=body.p_email_id?'sent':'failed';
          return response(true);
        }
        case 'sleep_save_assessment':{
          const prior=db.saved.find(row=>row.id===body.p_submission_id);
          if(prior)return response({status:prior.payload_hash===body.p_payload_hash?'saved':'conflict',id:prior.id});
          if(body.p_confirmed&&!db.tokens.some(row=>row.token_hash===body.p_session_hash&&row.contact_id===body.p_contact_id&&row.kind==='session'&&row.expires_at>now()))return response({status:'unauthorized'});
          db.saved.push({id:body.p_submission_id,contact_id:body.p_contact_id,assessment:body.p_assessment,payload_hash:body.p_payload_hash,report_version:body.p_report_version,created_at:body.p_created_at||now(),confirmed_at:body.p_confirmed?now():null,pending_expires_at:new Date(Date.now()+7*86400_000).toISOString()});
          db.consent.push(body);
          return response({status:'saved',id:body.p_submission_id,confirmed:body.p_confirmed});
        }
        case 'sleep_redeem_profile_token':{
          const row=db.tokens.find(x=>x.token_hash===body.p_token_hash&&x.kind==='login'&&x.used_at===null&&x.expires_at>now());
          if(!row)return response({ok:false});
          row.used_at=now();
          if(row.pending_assessment_id){const saved=db.saved.find(x=>x.id===row.pending_assessment_id&&x.contact_id===row.contact_id);if(!saved)return response({ok:false});saved.confirmed_at=now();}
          db.tokens.push({token_hash:body.p_session_hash,contact_id:row.contact_id,kind:'session',used_at:null,expires_at:expires(),scopes:['profile:read','profile:write','profile:delete']});
          return response({ok:true,expiresAt:expires()});
        }
        case 'sleep_delete_saved_profile':
          db.saved=db.saved.filter(row=>row.contact_id!==body.p_contact_id);
          db.tokens=db.tokens.filter(row=>row.contact_id!==body.p_contact_id);
          db.consent.push(body);return response(true);
        case 'sleep_admin_profile_summaries':return response(db.saved.filter(row=>body.p_contact_ids.includes(row.contact_id)&&row.confirmed_at));
        case 'sleep_admin_overview':return response({contacts:db.contacts.length});
        default:throw new Error('Unexpected RPC '+resource);
      }
    }
    const table=({sleep_contacts:'contacts',sleep_saved_assessments:'saved',sleep_profile_tokens:'tokens',sleep_admin_tokens:'admins',sleep_report_requests:'requests'})[resource];
    assert.ok(table,'Unexpected table '+resource);
    if(method==='POST'){
      if(resource==='sleep_profile_tokens'&&db.tokens.some(row=>row.token_hash===body.token_hash)) {
        if(new Headers(options.headers).get('Prefer')!=='resolution=ignore-duplicates')return response({error:'duplicate token'},409);
      } else db[table].push({...body,used_at:null});
      return response(null,201);
    }
    const matching=filterRows(db[table],url.searchParams);
    if(method==='DELETE'){db[table]=db[table].filter(row=>!matching.includes(row));return response(null);}
    assert.equal(method,'GET');
    const offset=Number(url.searchParams.get('offset')||0), limit=Number(url.searchParams.get('limit')||1000);
    return response(matching.slice(offset,offset+limit),200,{'Content-Range':`0-${matching.length-1}/${matching.length}`});
  };
  let source=fs.readFileSync(new URL('../backend/index.ts',import.meta.url),'utf8');
  source=source.replace("import * as PDFLib from 'npm:pdf-lib@1.17.1';",'const PDFLib = {};')
    .replace("import { createSleepPdf } from '../report.js';",'const createSleepPdf = async () => new Uint8Array([37,80,68,70,45,49,46,55]);');
  for(const name of ['assessment.js','profile-data.js'])source=source.replaceAll(`'../${name}'`,JSON.stringify(new URL(`../${name}`,import.meta.url).href));
  source=stripTypeScriptTypes(source,{mode:'transform'});
  try{
    const {handleRequest}=await import('data:text/javascript;base64,'+Buffer.from(source+'\n// '+randomUUID()).toString('base64'));
    const call=async(body,token)=>{
      const res=await handleRequest(new Request('https://service.example.test',{method:'POST',headers:{'content-type':'application/json',origin:'https://mike-cloudforest.github.io',...(token?{authorization:'Bearer '+token}:{})},body:JSON.stringify(body)}));
      return {status:res.status,body:await res.json()};
    };
    await run({db,call});
  }finally{globalThis.fetch=oldFetch;globalThis.Deno=oldDeno;}
}

function reportBody(extra={}) {return {action:'report',requestId:randomUUID(),email:'alice@example.test',name:'Synthetic Alice',...structuredClone(snapshot),reportConsent:true,newsletterConsent:false,signature:'',reportVersion:REPORT_VERSION,consentVersion:CONSENT_VERSION,...extra};}
function saveBody(extra={}) {return {action:'profile-save',requestId:randomUUID(),...structuredClone(snapshot),reportVersion:REPORT_VERSION,saveProfileConsent:true,profileConsentVersion:PROFILE_CONSENT_VERSION,...extra};}

test('Saved profiles require a visitor session; administrator tokens do not substitute',()=>withService(async({call})=>{
  assert.equal((await call({action:'profile-get'})).status,401);
  assert.equal((await call({action:'profile-get'},ADMIN)).status,401);
  assert.equal((await call({action:'admin-profile-get',id:ASSESSMENT_A},SESSION_A)).status,401);
}));

test('A visitor sees only their confirmed history and cannot retrieve another contact by ID',()=>withService(async({call,db})=>{
  db.saved.push({id:randomUUID(),contact_id:CONTACT_A,report_version:REPORT_VERSION,assessment:snapshot,created_at:now(),confirmed_at:null});
  const list=await call({action:'profile-list'},SESSION_A);
  assert.equal(list.status,200);assert.equal(list.body.assessments.length,1);assert.equal(list.body.contact.email,'alice@example.test');
  assert.equal((await call({action:'profile-get',id:ASSESSMENT_B},SESSION_A)).status,404);
  assert.equal((await call({action:'profile-get',id:ASSESSMENT_A},SESSION_A)).body.assessment.privateMarker,undefined);
}));

test('Expired and read-only profile sessions cannot write',()=>withService(async({call,db})=>{
  db.tokens[0].scopes=['profile:read'];assert.equal((await call(saveBody(),SESSION_A)).status,401);
  db.tokens[0].expires_at='2000-01-01T00:00:00Z';assert.equal((await call({action:'profile-get'},SESSION_A)).status,401);
}));

test('Login responses do not reveal whether the email has a saved profile',()=>withService(async({call,db})=>{
  const unknown=await call({action:'profile-login',email:'unknown@example.test'});
  assert.equal(db.mail.length,0);
  const known=await call({action:'profile-login',email:'alice@example.test'});
  assert.deepEqual(known,unknown);assert.equal(db.mail.length,1);
  assert.equal(db.mail[0].body.to[0],'alice@example.test');
  assert.match(db.mail[0].body.text,/profile\.html#token=/);
}));

test('Visitor login tokens are one-use and issue a separate scoped session',()=>withService(async({call,db})=>{
  const first=await call({action:'profile-redeem',token:LOGIN_A});assert.equal(first.status,200);
  assert.notEqual(first.body.sessionToken,LOGIN_A);
  assert.equal((await call({action:'profile-redeem',token:LOGIN_A})).status,401);
  assert.equal((await call({action:'profile-list'},first.body.sessionToken)).status,200);
  assert.ok(db.tokens.some(row=>row.token_hash===hash(first.body.sessionToken)&&row.kind==='session'));
}));

test('Saving requires explicit current consent and rejects unexpected fields',()=>withService(async({call})=>{
  assert.equal((await call(saveBody({saveProfileConsent:false}),SESSION_A)).body.code,'profile_consent_required');
  assert.equal((await call(saveBody({profileConsentVersion:'outdated'}),SESSION_A)).status,409);
  assert.equal((await call(saveBody({contactId:CONTACT_B}),SESSION_A)).body.code,'unexpected_field');
}));

test('Authenticated saves use the session owner and preserve prior history',()=>withService(async({call,db})=>{
  const body=saveBody();const first=await call(body,SESSION_A);assert.equal(first.status,200);
  const row=db.saved.find(item=>item.id===body.requestId);assert.equal(row.contact_id,CONTACT_A);assert.ok(row.confirmed_at);
  const replay=await call(body,SESSION_A);assert.equal(replay.status,200);assert.equal(db.consent.length,1);
  const changed=await call({...body,answers:{...answers,total:420}},SESSION_A);assert.equal(changed.status,409);
  assert.equal(db.saved.filter(item=>item.contact_id===CONTACT_A).length,2);
}));

test('A report-only request rejects raw birth details before any persistence or delivery',()=>withService(async({call,db})=>{
  const response=await call(reportBody({birthDetails:{date:'1990-06-06'}}));
  assert.equal(response.body.code,'profile_consent_required');assert.equal(db.mail.length,0);assert.equal(db.consent.length,0);
}));

test('Report-only delivery does not create a saved assessment or profile token',()=>withService(async({call,db})=>{
  const body=reportBody();delete body.birthDetails;
  const before=db.saved.length, tokenCount=db.tokens.length;
  const result=await call(body);assert.equal(result.status,200);
  assert.equal(db.saved.length,before);assert.equal(db.tokens.length,tokenCount);assert.equal(db.consent.length,0);
  assert.doesNotMatch(db.mail[0].body.text,/Open your saved profile/);
}));

test('Opted-in report stages a pending snapshot and confirms only through inbox token redemption',()=>withService(async({call,db})=>{
  const body=reportBody({saveProfileConsent:true,profileConsentVersion:PROFILE_CONSENT_VERSION});
  const result=await call(body);assert.equal(result.status,200);
  const row=db.saved.find(item=>item.id===body.requestId);assert.equal(row.confirmed_at,null);
  const token=db.mail[0].body.text.match(/profile\.html#token=([A-Za-z0-9_-]{43})/)[1];
  assert.equal((await call({action:'profile-get',id:row.id},SESSION_A)).status,404);
  const redeemed=await call({action:'profile-redeem',token});assert.equal(redeemed.status,200);
  assert.equal((await call({action:'profile-get',id:row.id},redeemed.body.sessionToken)).status,200);
}));

test('Retried saved reports reuse email bytes, tokens and one saved-consent event',()=>withService(async({call,db})=>{
  const body=reportBody({saveProfileConsent:true,profileConsentVersion:PROFILE_CONSENT_VERSION});
  db.refuseFinish=true;assert.equal((await call(body)).status,202);
  db.requests[0].status='failed';db.requests[0].lease_expires_at='2000-01-01T00:00:00Z';db.refuseFinish=false;
  assert.equal((await call(body)).status,200);assert.equal(db.mail.length,2);
  assert.deepEqual(db.mail[1].body,db.mail[0].body);assert.equal(db.consent.length,1);
  assert.equal(db.tokens.filter(row=>row.pending_assessment_id===body.requestId).length,1);
}));

test('Delete requires confirmation, is owner-scoped, signs out sessions, and retains contact records',()=>withService(async({call,db})=>{
  assert.equal((await call({action:'profile-delete',requestId:randomUUID(),confirmation:'yes'},SESSION_A)).status,400);
  const response=await call({action:'profile-delete',requestId:randomUUID(),confirmation:'DELETE MY SAVED PROFILE'},SESSION_A);
  assert.equal(response.status,200);assert.equal(db.saved.some(row=>row.contact_id===CONTACT_A),false);
  assert.equal(db.saved.some(row=>row.contact_id===CONTACT_B),true);assert.equal(db.contacts.length,2);
  assert.equal((await call({action:'profile-get'},SESSION_A)).status,401);
}));

test('Sign out revokes only the presented visitor session',()=>withService(async({call,db})=>{
  assert.equal((await call({action:'profile-logout'},SESSION_A)).status,200);
  assert.equal((await call({action:'profile-list'},SESSION_A)).status,401);
  assert.equal(db.tokens.some(row=>row.token_hash===hash(LOGIN_A)),true);
}));

test('Owner administration includes confirmed profile summaries and supports authorized detail reads',()=>withService(async({call})=>{
  const list=await call({action:'admin-list'},ADMIN);assert.equal(list.status,200);
  assert.equal(list.body.contacts[0].savedProfile.id,ASSESSMENT_A);
  assert.equal(list.body.contacts[0].savedProfile.pattern,'monophasic');
  assert.equal(list.body.contacts[0].savedProfile.birthDetails,undefined);
  assert.equal((await call({action:'admin-profile-get',id:ASSESSMENT_B},ADMIN)).body.assessment.privateMarker,'Bobs private data');
}));


test('Saved date-only profiles reconcile age and date-derived signs on the server',()=>withService(async({call,db})=>{
  const body=saveBody({birthDetails:{date:'1940-06-06',time:'',timeAccuracy:'unknown',place:null},answers:{...answers,ageBand:'18_60'},traditionsSelection:{western:'aries',chinese:'rat'}});
  const result=await call(body,SESSION_A);assert.equal(result.status,200);
  const saved=db.saved.find(row=>row.id===body.requestId).assessment;
  assert.equal(saved.answers.ageBand,'65_plus');assert.equal(saved.traditionsSelection.western,'gemini');
  assert.equal(saved.traditionsSelection.chinese,'dragon');assert.equal(saved.chart,null);
}));

test('A saved chart is recalculated from birth details and cannot retain a forged client type',()=>withService(async({call,db})=>{
  const {calculateBirthChart}=await import('../birth-chart.js');
  const birthDetails={date:'1990-06-06',time:'12:00',timeAccuracy:'exact',place:{label:'New York, United States',timeZone:'America/New_York',countryCode:'US'}};
  const expected=calculateBirthChart(birthDetails);
  // A structurally consistent chart from a different date still cannot override
  // the chart recomputed for the visitor's submitted birth details.
  const other=calculateBirthChart({...birthDetails,date:'1980-01-01'});
  const body=saveBody({birthDetails,chart:other,traditionsSelection:{western:other.western.sun.id,humanDesign:other.humanDesign.type}});
  const result=await call(body,SESSION_A);assert.equal(result.status,200);
  const saved=db.saved.find(row=>row.id===body.requestId).assessment;
  assert.deepEqual(saved.chart,expected);assert.equal(saved.traditionsSelection.western,'gemini');
  assert.equal(saved.traditionsSelection.humanDesign,expected.humanDesign.type);
}));

test('A birthday during retry preserves the original saved age band and report identity',async()=>{
  const RealDate=globalThis.Date;
  let clock=RealDate.parse('2026-11-24T23:59:00Z');
  globalThis.Date=class extends RealDate {
    constructor(...args){super(...(args.length?args:[clock]));}
    static now(){return clock;}
  };
  try {
    await withService(async({call,db})=>{
      const birthDetails={date:'1961-11-25',time:'',timeAccuracy:'unknown',place:null};
      const body=reportBody({birthDetails,saveProfileConsent:true,profileConsentVersion:PROFILE_CONSENT_VERSION});
      db.refuseFinish=true;assert.equal((await call(body)).status,202);
      assert.equal(db.saved.find(row=>row.id===body.requestId).assessment.answers.ageBand,'61_64');
      clock=RealDate.parse('2026-11-25T00:01:00Z');
      db.requests[0].status='failed';db.requests[0].lease_expires_at='2000-01-01T00:00:00Z';db.refuseFinish=false;
      assert.equal((await call(body)).status,200);
      assert.equal(db.saved.find(row=>row.id===body.requestId).assessment.answers.ageBand,'61_64');
      assert.deepEqual(db.mail[1].body,db.mail[0].body);
      assert.equal(db.consent.length,1);
    });
  } finally {globalThis.Date=RealDate;}
});
