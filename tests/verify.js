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
for(const topic of conjugation.TOPICS){
 for(const level of conjugation.LEVELS){
  const c=conjugation.create({reviews:{},conjugationHistory:[]},topic.id,5,'libre',null,level.key);
  assert.equal(c.questions.length,5);
  assert.equal(c.level,level.key);
  assert.ok(c.questions.every(id=>conjugation.getQuestion(id).difficulty===level.difficulty));
 }
}
const writtenState={reviews:{},conjugationHistory:[]};
const written=conjugation.create(writtenState,'ct:present',3,'libre',null,'decouverte');
const firstWritten=conjugation.current(written);
assert.equal(conjugation.submitWritten(written,'').valid,false);
assert.equal(conjugation.submitWritten(written,'mauvaise').correct,false);
assert.equal(conjugation.submitWritten(written,firstWritten.correctForm).correct,true);
assert.equal(written.answers[0].assisted,true);
assert.equal(conjugation.submitWritten(written,firstWritten.correctForm).valid,false);
conjugation.advance(written);
assert.equal(written.wrongTries,0);
const nextWritten=conjugation.current(written);
assert.equal(conjugation.submitWritten(written,nextWritten.correctForm.toUpperCase()).correct,true);
assert.equal(written.answers[1].assisted,false);
const composedWritten=conjugation.create(writtenState,'ct:passe',3,'libre',null,'decouverte');
assert.equal(conjugation.submitWritten(composedWritten,conjugation.current(composedWritten).correctForm).correct,true);
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
const personal=require('../personalization-engine.js');
const profile={practiceHistory:[],conjugationHistory:[],reviews:{}};
assert.equal(personal.hydrate(profile,{practice:practiceBank,conjugation}),true);
const hom=practiceBank.pool('po-homophone')[0];
personal.record(profile,{topicId:'po-homophone',question:hom,correct:false,at:today.getTime()});
personal.record(profile,{topicId:'po-homophone',question:hom,correct:false,at:today.getTime()+1000});
assert.equal(personal.weakSpots(profile,'po-homophone').length,1);
const score=personal.questionBias(profile,'po-homophone',hom);
assert.ok(score>0);
personal.record(profile,{topicId:'po-homophone',question:hom,correct:true,assisted:true,at:today.getTime()+2000});
assert.equal(profile.skillProgress['po-homophone'].independent,0);
assert.equal(personal.hydrate(profile,{practice:practiceBank,conjugation}),false);
assert.ok(personal.recommendations(profile,practiceBank.TOPICS,today.getTime()+3000,3).length>=1);
const mathCoach=require('../math-coach.js');
const mathAudit=mathCoach.audit(practiceBank);
assert.equal(mathAudit.total,220);
assert.deepEqual(mathAudit.issues,[]);
for(const q of practiceBank.QUESTIONS.filter(x=>x.domain==='math')){
 const result=mathCoach.check(q,q.right);
 assert.equal(result.correct,true,'Erreur de réponse libre '+q.id);
}
assert.equal(mathCoach.check(practiceBank.pool('pm-equivalences')[0],'0/0').valid,false);
const journey=require('../math-journey.js');
const journeyAudit=journey.audit();
assert.equal(journeyAudit.total,160);
assert.deepEqual(journeyAudit.issues,[]);
for(const topic of journey.TOPICS)for(const level of journey.LEVELS){
 const st={mathJourneyHistory:[],mathJourneyProgress:{}};
 const challenge=journey.create(st,topic.id,level.id);
 for(let i=0;i<3;i++){
  const q=journey.current(challenge);
  assert.equal(journey.grade(q,q.expectedDisplay).correct,true,q.id);
  assert.equal(journey.submit(challenge,q.expectedDisplay).correct,true);
  assert.equal(journey.advance(challenge),true);
 }
 assert.equal(journey.recordStage(st,challenge).successful,true);
}
console.log('V6 : personnalisation, migration, recommandations et 674 variantes vérifiées');
