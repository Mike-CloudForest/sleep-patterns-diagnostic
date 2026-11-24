import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveBirthProfile, ageOnDate, birthProfileSources } from '../birth-profile.js';
import { validateAssessment } from '../assessment.js';

const today = new Date(2026, 10, 24, 12);
const profile = date => deriveBirthProfile(date, today);

test('all twelve Western signs have useful date-range results', () => {
  const fixtures = [
    ['2000-01-05','capricorn'],['2000-02-05','aquarius'],['2000-03-05','pisces'],
    ['2000-04-05','aries'],['2000-05-05','taurus'],['2000-06-05','gemini'],
    ['2000-07-05','cancer'],['2000-08-05','leo'],['2000-09-05','virgo'],
    ['2000-10-05','libra'],['2000-11-05','scorpio'],['2000-12-05','sagittarius']
  ];
  for (const [date,id] of fixtures) {
    assert.equal(profile(date).western.id,id,date);
    assert.equal(profile(date).western.boundary,false,date);
    assert.deepEqual(profile(date).western.candidates,[id],date);
  }
});

test('sign-change dates request chart review and expose both candidates', () => {
  const fixtures = [
    ['2000-01-20','capricorn','aquarius'],['2000-02-19','aquarius','pisces'],
    ['2000-03-21','pisces','aries'],['2000-04-20','aries','taurus'],
    ['2000-05-21','taurus','gemini'],['2000-06-21','gemini','cancer'],
    ['2000-07-23','cancer','leo'],['2000-08-23','leo','virgo'],
    ['2000-09-23','virgo','libra'],['2000-10-23','libra','scorpio'],
    ['2000-11-22','scorpio','sagittarius'],['2000-12-22','sagittarius','capricorn']
  ];
  for (const [date,before,after] of fixtures) {
    assert.equal(profile(date).western.boundary,true,date);
    assert.deepEqual(profile(date).western.candidates,[before,after],date);
  }
  assert.equal(profile('2000-03-19').western.boundary,true);
  assert.equal(profile('2000-03-18').western.boundary,false);
  assert.equal(profile('2000-03-23').western.boundary,true);
  assert.equal(profile('2000-03-24').western.boundary,false);
});

// Primary fixtures: HKO Gregorian–Lunar conversion tables. Each year has
// https://www.hko.gov.hk/en/gts/time/calendar/text/files/T{year}e.txt
// Rows mark "1st Lunar month"; table headings identify the year's Gan-Zhi.
const lunarFixtures = [
  ['1901-02-18',1900,'rat','Metal','Yang'],
  ['1901-02-19',1901,'ox','Metal','Yin'],
  ['1978-02-06',1977,'snake','Fire','Yin'],
  ['1978-02-07',1978,'horse','Earth','Yang'],
  ['2000-02-04',1999,'rabbit','Earth','Yin'],
  ['2000-02-05',2000,'dragon','Metal','Yang'],
  ['2024-02-09',2023,'rabbit','Water','Yin'],
  ['2024-02-10',2024,'dragon','Wood','Yang'],
  ['2026-02-16',2025,'snake','Wood','Yin'],
  ['2026-02-17',2026,'horse','Fire','Yang']
];

test('Chinese results follow HKO Lunar New Year boundaries and year stems', () => {
  for (const [date,year,id,element,polarity] of lunarFixtures) {
    const result=profile(date).chinese;
    assert.ok(result,date+' requires Chinese calendar support in the test runtime');
    assert.equal(result.year,year,date);
    assert.equal(result.id,id,date);
    assert.equal(result.element,element,date);
    assert.equal(result.polarity,polarity,date);
  }
});

test('January does not automatically use the Gregorian birth year', () => {
  assert.deepEqual(
    Object.fromEntries(['year','id','element','polarity'].map(key=>[key,profile('1900-01-01').chinese[key]])),
    {year:1899,id:'pig',element:'Earth',polarity:'Yin'}
  );
  assert.equal(profile('2000-01-01').chinese.year,1999);
  assert.equal(profile('2026-01-01').chinese.year,2025);
});

test('date-only lookup is unchanged by the device timezone', () => {
  const previous=process.env.TZ;
  const expected=profile('2000-02-05');
  try {
    for (const zone of ['America/Los_Angeles','Pacific/Kiritimati','Asia/Hong_Kong','UTC']) {
      process.env.TZ=zone;
      assert.deepEqual(profile('2000-02-05'),expected,zone);
    }
  } finally {
    if(previous===undefined)delete process.env.TZ;else process.env.TZ=previous;
  }
});

test('invalid and future dates produce actionable validation errors', () => {
  for (const value of ['',null,{},'2000-2-05','02/05/2000','2001-02-29','1900-02-29','2000-13-01','2000-04-31','1899-12-31','2027-01-01','2026-11-25']) {
    assert.throws(()=>profile(value),RangeError,String(value));
  }
  assert.equal(profile('2000-02-29').western.id,'pisces');
  assert.equal(profile('2026-11-24').western.id,'sagittarius');
});

test('whole-year ages respect the birthday and leap-day rollover', () => {
  assert.equal(ageOnDate('2008-11-24',today),18);
  assert.equal(ageOnDate('2008-11-25',today),17);
  assert.equal(ageOnDate('2008-11-23',today),18);
  assert.equal(ageOnDate('2000-02-29',new Date(2025,1,28,12)),24);
  assert.equal(ageOnDate('2000-02-29',new Date(2025,2,1,12)),25);
});

test('unavailable or incomplete Chinese calendar support preserves Western results', () => {
  const original=Intl.DateTimeFormat;
  const implementations=[
    function(){throw new RangeError('Unsupported calendar');},
    function(){return {resolvedOptions:()=>({calendar:'gregory'}),formatToParts:()=>[{type:'year',value:'2000'}]};},
    function(){return {resolvedOptions:()=>({calendar:'chinese'}),formatToParts:()=>[{type:'yearName',value:'geng-chen'}]};},
    function(){return {resolvedOptions:()=>({calendar:'chinese'}),formatToParts:()=>[{type:'relatedYear',value:'NaN'}]};},
    function(){return {resolvedOptions:()=>({calendar:'chinese'}),formatToParts:()=>[{type:'relatedYear',value:'1800'}]};}
  ];
  try {
    for(const replacement of implementations){
      Intl.DateTimeFormat=replacement;
      const result=profile('2000-04-05');
      assert.equal(result.western.id,'aries');
      assert.equal(result.chinese,null);
      assert.match(result.chineseUnavailable,/Choose the animal/);
    }
  } finally {Intl.DateTimeFormat=original;}
});

test('derived metadata round-trips through assessment validation without birth data', () => {
  const answers={ageBand:'18_60',layout:'A',naps:'A',total:480,alertness:'A'};
  for(const [date] of lunarFixtures){
    const {western,chinese}=profile(date);
    const traditionsSelection={western:western.id,westernBasis:'date_range',chinese:chinese.id,chineseBasis:'lunar_new_year',chineseYear:chinese.year,chineseElement:chinese.element,chinesePolarity:chinese.polarity};
    const validated=validateAssessment({answers,traditionsSelection});
    assert.deepEqual(validated.traditionsSelection,traditionsSelection);
    assert.ok(!JSON.stringify({western,chinese,validated}).includes(date));
  }
});

test('source notes document the calculation limits and calendar convention', () => {
  assert.ok(birthProfileSources.every(source=>source.url.startsWith('https://')&&source.note));
  assert.match(birthProfileSources.find(source=>source.id==='western_boundary').note,/approximate/);
  assert.match(birthProfileSources.find(source=>source.id==='chinese_year_boundary').note,/Lunar New Year/);
  assert.match(birthProfileSources.find(source=>source.id==='human_design_chart').note,/exact time and place/);
});
