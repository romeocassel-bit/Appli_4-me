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
console.log('Tests : moteurs, banque d’exercices, correction et budgets — OK');
