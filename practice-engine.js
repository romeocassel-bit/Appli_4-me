'use strict';
// Défis communs à l'orthographe et aux mathématiques.
const PracticeEngine=(function createPractice(){
"use strict";
const Bank=typeof PracticeBank!=="undefined"?PracticeBank:null;
function current(c){return c&&!c.finished?Bank.getQuestion(c.questions[c.cursor]):null}
function create(state,topicId,count=5,origin="libre",sessionId=null){
 const topic=Bank.TOPICS.find(t=>t.id===topicId);if(!topic)return null;
 const length=[3,5,8].includes(count)?count:5;
 const past=Array.isArray(state.practiceHistory)?state.practiceHistory:[];
 const recent=new Map();
 past.slice(-250).forEach((x,i)=>recent.set(x.questionId,i));
 const mastery=state.reviews?.[topicId]?.stage||0;
 const desired=mastery>=3?[2,3,3]:mastery>=1?[1,2,3]:[1,1,2];
 const questions=[],used=new Set(),topics=new Set();
 for(let i=0;i<length;i++){
  const target=desired[Math.min(i,2)];
  const options=Bank.pool(topicId).filter(q=>!used.has(q.id));
  options.sort((a,b)=>{
   const score=q=>Math.abs(q.difficulty-target)*15+(recent.has(q.id)?200+recent.get(q.id):0)+(topics.has(q.topicId)?(topic.mix?18:0):0);
   return score(a)-score(b)||a.id.localeCompare(b.id);
  });
  const q=options[0];if(!q)break;
  questions.push(q.id);used.add(q.id);topics.add(q.topicId);
 }
 return {topicId,questions,cursor:0,answers:[],hintShown:false,finished:false,recorded:false,origin,sessionId,createdAt:Date.now()};
}
function answer(c,index){
 const q=current(c);if(!q||c.answers.some(x=>x.atIndex===c.cursor)||!Number.isInteger(index)||index<0||index>=q.options.length)return null;
 const result={atIndex:c.cursor,questionId:q.id,correct:index===q.answer,assisted:!!c.hintShown,answer:index,topicId:q.topicId,at:Date.now()};
 c.answers.push(result);return result;
}
function advance(c){
 if(!c||c.finished||!c.answers.some(x=>x.atIndex===c.cursor))return false;
 c.cursor++;c.hintShown=false;if(c.cursor>=c.questions.length)c.finished=true;return true;
}
function summary(c){
 const answers=c.answers||[],correct=answers.filter(a=>a.correct).length,assisted=answers.filter(a=>a.correct&&a.assisted).length;
 return {total:c.questions.length,attempted:answers.length,correct,assisted,independent:answers.filter(a=>a.correct&&!a.assisted).length,completed:!!c.finished,autonomous:!!c.finished&&correct===c.questions.length&&assisted===0};
}
return {create,current,answer,advance,summary};
})();
if(typeof window!=='undefined')window.PracticeEngine=PracticeEngine;
if(typeof module!=='undefined'&&module.exports)module.exports=PracticeEngine;
