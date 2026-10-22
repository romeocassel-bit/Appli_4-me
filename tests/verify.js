'use strict';
const assert=require('node:assert/strict');
const engine=require('../learning-engine.js');
const dict=require('../dictation-engine.js');
const bank=require('../orthography-data.js');
const today=new Date(2026,9,22,12);
const s=engine.fresh(today);
const exercises=[
{id:'a',subject:'Français',minutes:4,type:'dictation'},
{id:'b',subject:'Maths',minutes:2},
{id:'c',subject:'Français',minutes:2},
{id:'d',subject:'Maths',minutes:2},
{id:'e',subject:'Histoire-géo',minutes:2}
];
const readings=[{id:'r',time:6}];
for(const duration of [5,10,15]){
 const plan=engine.buildPlan(s,exercises,readings,duration,today);
 const total=plan.reduce((n,x)=>n+x.minutes,0);
 assert.ok(total<=duration,'La séance ne dépasse pas '+duration+' minutes estimées');
 assert.equal(new Set(plan.map(x=>x.kind+':'+x.id)).size,plan.length,'Pas de doublon');
}
assert.equal(bank.questions.length,14);
assert.equal(bank.dictations.length,6);
for(const q of bank.questions){
 assert.ok(q.answer>=0 && q.answer<q.options.length);
 assert.ok(q.probeAnswer>=0 && q.probeAnswer<q.probeOptions.length);
}
for(const d of bank.dictations){
 assert.ok(d.text.length<220);
 assert.ok(d.rules.length>=1);
 assert.equal(dict.compare(d.text,d.text,d.rules).correct,true);
 assert.equal(dict.compare(d.text,'').valid,false);
}
let result=dict.compare('Les robes argentées scintillent.','Les robes argenté scintille',
 [{target:'argentées',alternatives:['argenté'],category:'accord',explanation:'Accord féminin pluriel'},
 {target:'scintillent',alternatives:['scintille'],category:'accord',explanation:'Accord verbal'}]);
assert.equal(result.byCategory.accord,2);
result=dict.compare('Juno a une veste.','Juno à une veste.',
 [{target:'a',alternatives:['à'],category:'homophone',explanation:'Verbe avoir'}]);
assert.equal(result.byCategory.homophone,1);
assert.deepEqual(dict.compare('Elle a une veste.','Elle a une jolie veste.').errors.map(x=>x.category),['ajout']);
assert.deepEqual(dict.compare('Elle a une jolie veste.','Elle a une veste.').errors.map(x=>x.category),['oubli']);
engine.recordAttempt(s,'a',{correct:true,assisted:true,now:today});
assert.equal(s.reviews.a.stage,0,'Une réussite avec aide ne suffit pas');
engine.recordAttempt(s,'a',{correct:true,now:new Date(2026,9,23,12)});
assert.equal(s.reviews.a.stage,1);

const conjugation=require('../conjugation-engine.js');
assert.equal(conjugation.questionCount,336);
for(const tense of ['present','imparfait','futur','passe']){
 const items=conjugation.poolFor(tense);
 assert.equal(items.length,84);
 for(const q of items){
  assert.equal(q.options.length,3);
  assert.equal(new Set(q.options).size,3);
  assert.equal(q.options[q.answer],q.correctForm);
  assert.ok(q.question.includes('___'));
 }
}
assert.equal(conjugation.getQuestion('cv:imparfait:voir:3').correctForm,'voyions');
assert.equal(conjugation.getQuestion('cv:futur:voir:0').correctForm,'verrai');
for(const topic of conjugation.TOPICS){
 for(const count of [3,5,8]){
  const challenge=conjugation.create({reviews:{},conjugationHistory:[]},topic.id,count);
  assert.equal(challenge.questions.length,count);
  assert.equal(new Set(challenge.questions).size,count);
  if(topic.tense==='mixte')assert.ok(new Set(challenge.questions.map(id=>conjugation.getQuestion(id).tense)).size>=3);
  for(let i=0;i<count;i++){
   const q=conjugation.current(challenge);
   const first=conjugation.answer(challenge,q.answer);
   assert.equal(first.correct,true);
   assert.equal(conjugation.answer(challenge,q.answer),null);
   conjugation.advance(challenge);
  }
  assert.equal(conjugation.summary(challenge).autonomous,true);
 }
}
const adapted=conjugation.create({reviews:{'ct:present':{stage:3}},conjugationHistory:[]},'ct:present',5);
assert.equal(adapted.questions.length,5);

const practiceBank=require('../practice-bank.js');
const practiceEngine=require('../practice-engine.js');
assert.equal(practiceBank.questionCount,338);
assert.deepEqual(practiceBank.verify(),[]);
for(const topic of practiceBank.TOPICS){
 assert.ok(practiceBank.pool(topic.id).length>=15);
 for(const count of [3,5,8]){
  const challenge=practiceEngine.create({reviews:{},practiceHistory:[]},topic.id,count);
  assert.equal(challenge.questions.length,count);
  assert.equal(new Set(challenge.questions).size,count);
  for(let i=0;i<count;i++){
   const q=practiceEngine.current(challenge);
   assert.equal(q.options[q.answer],q.right);
   assert.equal(practiceEngine.answer(challenge,q.answer).correct,true);
   assert.equal(practiceEngine.answer(challenge,q.answer),null);
   assert.equal(practiceEngine.advance(challenge),true);
  }
  assert.equal(practiceEngine.summary(challenge).autonomous,true);
 }
}
console.log('Tests : 336 conjugaisons, 338 exercices orthographe/maths et parcours — OK');
