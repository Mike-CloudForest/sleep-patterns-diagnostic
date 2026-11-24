import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPersonalProfile, getTraditionReport, renderTraditions, traditionsData } from '../traditions.js';

const base = {ageBand:'18_60',layout:'A',naps:'A',total:480,alertness:'A'};
const mono = {key:'monophasic',name:'Monophasic'};
const selected = {western:'gemini',chinese:'rat',humanDesign:'projector'};

test('the same chosen profiles explain a similarity for split sleep and a difference for one main sleep', () => {
  const split = buildPersonalProfile({...base,layout:'B'},selected,{key:'segmented',name:'Segmented sleep'});
  const single = buildPersonalProfile(base,selected,mono);
  for (const key of ['western','chinese']) {
    assert.match(split.cards.find(card=>card.key===key).comparison.label,/Similar/);
    assert.match(single.cards.find(card=>card.key===key).comparison.label,/Different/);
  }
  assert.match(single.summary.join(' '),/Monophasic/);
  assert.match(single.cards[0].comparison.text,/You reported Monophasic/);
});

test('Projector comparison includes a reported nap without requiring one from a type label', () => {
  const result = buildPersonalProfile({...base,naps:'C',napType:'A'},{humanDesign:'projector'},{key:'biphasic_nap',name:'Biphasic with a short nap'});
  assert.match(result.cards[0].comparison.label,/Similar/);
  assert.match(result.cards[0].paragraphs.join(' '),/without necessarily becoming a nap/);
  assert.match(buildPersonalProfile(base,{humanDesign:'projector'},mono).cards[0].comparison.label,/Different/);
});

test('Chinese year element stays distinct from the guide animal temperament grouping', () => {
  const result = buildPersonalProfile(base,{chinese:'rat',chineseBasis:'lunar_new_year',chineseYear:1960,chineseElement:'Metal',chinesePolarity:'Yang'},mono);
  const card=result.cards[0];
  assert.equal(card.subtitle,'1960 lunar year · Yang Metal Rat');
  assert.match(card.paragraphs.join(' '),/Metal year element belongs to the year’s heavenly stem/);
  assert.match(card.paragraphs.join(' '),/wood-leaning, yang as a temperament theme/);
  assert.match(card.paragraphs.join(' '),/different parts of the tradition/);
});

test('Western source metadata distinguishes date estimates from confirmed selections', () => {
  const estimated=buildPersonalProfile(base,{western:'taurus',westernBasis:'date_range'},mono).cards[0];
  const confirmed=buildPersonalProfile(base,{western:'taurus',westernBasis:'confirmed'},mono).cards[0];
  assert.match(estimated.subtitle,/date-range estimate/);
  assert.match(estimated.paragraphs.join(' '),/exact birth time and place/);
  assert.match(confirmed.subtitle,/confirmed by you/);
});

test('missing profiles stay unknown while self-described preferences remain useful', () => {
  const result=buildPersonalProfile({...base,chronotype:'late',restChallenge:'obligations',energyStyle:'bursts'},{},mono);
  assert.equal(result.cards.length,0);
  assert.equal(result.preferences.length,3);
  assert.match(result.summary.join(' '),/Human Design is left unknown/);
  assert.match(result.preferences.map(item=>item.paragraphs.join(' ')).join(' '),/time available to you/);
  assert.ok(result.experiments.some(item=>/workday/.test(item.text)));
});

test('physical discomfort is interpreted as discomfort without an activity or birth-profile inference', () => {
  const result=buildPersonalProfile({...base,restChallenge:'physical'},{western:'aries',chinese:'tiger',humanDesign:'generator'},mono);
  const preference=result.preferences.find(item=>/discomfort/.test(item.title));
  assert.ok(preference);
  assert.match(preference.paragraphs.join(' '),/physical discomfort or tension/);
  const experiment=result.experiments.find(item=>item.title==='Observe what most affects your rest');
  assert.match(experiment.text,/discomfort or tension/);
  assert.doesNotMatch(preference.paragraphs.join(' ')+experiment.text,/activation|activity|demanding|exertion|exercise/i);
  assert.ok(result.cards.every(card=>!card.paragraphs.some(text=>text.startsWith('You also reported '))));
  assert.doesNotMatch(JSON.stringify(result),/You (?:identified|also reported) physical activation/);
});

test('sleepiness and short duration take precedence over traditional profile experiments', () => {
  const result=buildPersonalProfile({...base,total:300,alertness:'C',restChallenge:'mental'},selected,mono);
  assert.equal(result.experiments[0].title,'Give unwanted sleepiness priority');
  assert.equal(result.experiments[1].title,'Start with your reported amount of sleep');
  assert.match(result.experiments[1].text,/not a reason to reduce sleep further/);
});

test('unwanted long waking is acknowledged even when the guide describes split sleep', () => {
  const result=buildPersonalProfile({...base,layout:'B',waking:'trouble'},{western:'gemini'},{key:'segmented',name:'Segmented sleep'});
  assert.match(result.cards[0].comparison.text,/struggling to return to sleep/);
});

test('unclear sleep answers cannot become a claimed match through a horoscope', () => {
  const result=buildPersonalProfile({...base,layout:'E'},selected,{key:'unclear',name:'Mixed or unclear pattern'});
  assert.ok(result.cards.every(card=>card.comparison.label==='Sleep comparison still open'));
});

test('open-ended Aquarius and Reflector associations never become claimed pattern confirmations', () => {
  for(const key of ['monophasic','segmented','irregular','triphasic']) {
    const result=buildPersonalProfile(base,{western:'aquarius',humanDesign:'reflector'},{key,name:key});
    assert.ok(result.cards.every(card=>card.comparison.label==='No fixed arrangement in this profile'));
  }
});

test('broad main-sleep and other-nap outcomes receive explicit comparisons', () => {
  const main=buildPersonalProfile(base,{western:'taurus'},{key:'main_sleep',name:'One main sleep with varied naps'});
  const nap=buildPersonalProfile(base,{western:'taurus'},{key:'biphasic_other',name:'Biphasic sleep with another nap length'});
  assert.match(main.cards[0].comparison.label,/Partial overlap/);
  assert.match(nap.cards[0].comparison.label,/Partial overlap/);
});

test('all 720 complete profile combinations produce selected content without filling missing data', () => {
  let count=0;
  for(const western of traditionsData.western.signs) {
    for(const chinese of traditionsData.chinese.animals) {
      for(const humanDesign of traditionsData.humanDesign.types) {
        const result=buildPersonalProfile(base,{western:western.id,chinese:chinese.id,humanDesign:humanDesign.id},mono);
        assert.equal(result.cards.length,3);
        assert.ok(result.cards.every(card=>card.reflection && card.paragraphs.length>=3 && card.sourcePages.length));
        assert.ok(result.cards[0].title.endsWith(western.name));
        assert.ok(result.cards[1].title.endsWith(chinese.name));
        assert.ok(result.cards[2].title.endsWith(humanDesign.name));
        assert.doesNotMatch(JSON.stringify(result),/"(?:undefined|NaN)"/);
        count++;
      }
    }
  }
  assert.equal(count,720);
});

test('report generation is deterministic and leaves caller answers and selections unchanged', () => {
  const answers={...base,chronotype:'early',restChallenge:'mental',energyStyle:'steady'};
  const selections={...selected};
  const before=JSON.stringify({answers,selections});
  assert.deepEqual(buildPersonalProfile(answers,selections,mono),buildPersonalProfile(answers,selections,mono));
  assert.equal(JSON.stringify({answers,selections}),before);
});

test('legacy tradition-report API remains available', () => {
  assert.equal(getTraditionReport(selected).length,4);
});

test('reference-only rendering keeps references without duplicate selectors or selected cards', () => {
  const container={replaceChildren(){},innerHTML:'',querySelectorAll(){return[];}};
  const view=renderTraditions(container,selected,{referenceOnly:true});
  assert.match(container.innerHTML,/Explore the guide’s traditions/);
  assert.match(container.innerHTML,/The traditional Chinese organ clock/);
  assert.doesNotMatch(container.innerHTML,/<select|data-tradition-cards/);
  assert.deepEqual(view.getSelection(),selected);
});
