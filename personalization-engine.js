'use strict';
// Suivi indicatif des compétences, non diagnostique, conservé dans le navigateur.
const PersonalizationEngine=(function makePersonalization(){
 "use strict";
 const VERSION=1;
 const dateKey=at=>{
  const d=new Date(Number(at)||Date.now());
  const x=Number.isNaN(d.getTime())?new Date():d;
  return [x.getFullYear(),String(x.getMonth()+1).padStart(2,"0"),String(x.getDate()).padStart(2,"0")].join("-");
 };
 const fresh=()=>({attempts:0,independent:0,assisted:0,errors:0,streak:0,lastOutcome:null,lastAt:0,days:{},subskills:{}});
 const freshSub=()=>({attempts:0,independent:0,assisted:0,errors:0,lastOutcome:null,lastAt:0});
 function subskill(q){
  if(!q)return "notion";
  if(q.tense && Number.isInteger(q.person))return "personne:"+q.tense+":"+q.person;
  if(q.topicId==="po-homophone"){
   const w=String(q.right||"").toLocaleLowerCase("fr");
   for(const [family,words] of Object.entries({"a-à":["a","à","as"],"et-est":["et","est","es"],"son-sont":["son","sont"],"on-ont":["on","ont"],"ce-se":["ce","se"]})){
    if(words.includes(w))return "homophone:"+family;
   }
  }
  if(q.topicId==="po-adjectif"){
   const prompt=String(q.question||"");
   for(const [target,key] of [["des étoiles","féminin pluriel"],["une cape","féminin singulier"],["des costumes","masculin pluriel"],["un ruban","masculin singulier"]])
    if(prompt.includes(target))return "accord:"+key;
  }
  if(q.topicId==="po-infinitif")return String(q.question||"").includes(" veut ")?"forme:infinitif":"forme:participe";
  if(q.meta?.kind==="order")return q.meta.largest?"ordre:maximum":"ordre:minimum";
  if(q.meta?.kind==="algebra")return "expression:"+q.meta.label;
  if(q.meta?.kind==="percent")return "pourcentage:"+q.meta.p;
  if(q.meta?.kind)return "type:"+q.meta.kind;
  return "règle:"+String(q.topicId||q.verb||"générale");
 }
 function topicTargets(topicId,question){
  const ids=new Set([topicId]);
  if(question?.topicId)ids.add(question.topicId);
  if(question?.tense)ids.add("ct:"+question.tense);
  return [...ids].filter(Boolean);
 }
 function record(state,{topicId,question,correct,assisted=false,at=Date.now()}){
  if(!state.skillProgress||typeof state.skillProgress!=="object")state.skillProgress={};
  const timestamp=Number.isFinite(Number(at))&&Number(at)>0?Number(at):Date.now();
  const date=dateKey(timestamp),group=subskill(question),isIndependent=Boolean(correct&&!assisted),isAssisted=Boolean(correct&&assisted);
  for(const key of topicTargets(topicId,question)){
   const p=state.skillProgress[key]||fresh();
   p.attempts++;
   if(isIndependent){p.independent++;p.streak++;p.days[date]=1}
   else{p.streak=0;if(isAssisted)p.assisted++;else p.errors++}
   p.lastOutcome=!correct?"erreur":assisted?"aide":"autonome";
   p.lastAt=timestamp;
   const m=p.subskills[group]||freshSub();
   m.attempts++;
   if(isIndependent)m.independent++;else if(isAssisted)m.assisted++;else m.errors++;
   m.lastOutcome=p.lastOutcome;m.lastAt=timestamp;p.subskills[group]=m;
   const dates=Object.keys(p.days);
   if(dates.length>90){dates.sort();for(const old of dates.slice(0,dates.length-90))delete p.days[old]}
   state.skillProgress[key]=p;
  }
 }
 function hydrate(state,{conjugation,practice}={}){
  if(state.personalizationSchema===VERSION&&state.skillProgress&&typeof state.skillProgress==="object")return false;
  state.skillProgress={};
  for(const a of Array.isArray(state.conjugationHistory)?state.conjugationHistory:[]){
   const q=conjugation?.getQuestion(a.questionId);
   if(q&&typeof a.correct==="boolean")record(state,{topicId:a.topicId||"ct:"+q.tense,question:q,correct:a.correct,assisted:!!a.assisted,at:a.at});
  }
  for(const a of Array.isArray(state.practiceHistory)?state.practiceHistory:[]){
   const q=practice?.getQuestion(a.questionId);
   if(q&&typeof a.correct==="boolean")record(state,{topicId:a.challengeTopicId||a.topicId||q.topicId,question:q,correct:a.correct,assisted:!!a.assisted,at:a.at});
  }
  state.personalizationSchema=VERSION;return true;
 }
 function status(p){
  if(!p||!p.attempts)return {code:"new",label:"À découvrir"};
  const days=Object.keys(p.days||{}).length;
  if(p.errors>=2&&(p.streak<2||p.independent<2))return {code:"needs-practice",label:"À consolider"};
  if(p.independent>=6&&days>=3&&p.streak>=3)return {code:"established",label:"En bonne voie"};
  if(p.independent>=3&&days>=2&&p.streak>=2)return {code:"consolidating",label:"En consolidation"};
  if(p.assisted&&p.independent===0)return {code:"assisted",label:"Avec un peu d'aide"};
  return {code:"practising",label:"En entraînement"};
 }
 function subskillLabel(id){
  const labels={"homophone:a-à":"a / à","homophone:et-est":"et / est","homophone:son-sont":"son / sont","homophone:on-ont":"on / ont","homophone:ce-se":"ce / se",
   "accord:féminin pluriel":"féminin pluriel","accord:féminin singulier":"féminin singulier","accord:masculin pluriel":"masculin pluriel","accord:masculin singulier":"masculin singulier",
   "forme:infinitif":"infinitif en -er","forme:participe":"participe en -é","ordre:maximum":"repérer le plus grand","ordre:minimum":"repérer le plus petit",
   "type:perimeter":"périmètre","type:area":"aire"};
  if(labels[id])return labels[id];
  if(id.startsWith("personne:")){
   const p=id.split(":"),person=["je","tu","il / elle","nous","vous","ils / elles"][+p[2]]||"le sujet";
   const tense={present:"présent",imparfait:"imparfait",futur:"futur",passe:"passé composé"}[p[1]]||p[1];
   return person+" au "+tense;
  }
  if(id.startsWith("pourcentage:"))return id.slice(12)+" %";
  if(id.startsWith("expression:"))return id.slice(11);
  if(id.startsWith("type:"))return id.slice(5);
  return "une règle à retrouver";
 }
 function weakSpots(state,topicId,limit=3){
  const p=state.skillProgress?.[topicId];if(!p?.subskills)return [];
  return Object.entries(p.subskills).filter(([,v])=>v.errors>=2&&v.errors>v.independent)
   .sort((a,b)=>(b[1].errors-b[1].independent)-(a[1].errors-a[1].independent)||b[1].lastAt-a[1].lastAt)
   .slice(0,Math.max(0,limit)).map(([id,v])=>({id,label:subskillLabel(id),errors:v.errors,attempts:v.attempts}));
 }
 function priority(state,topic,now=Date.now()){
  const p=state.skillProgress?.[topic.id];if(!p?.attempts)return -100;
  const due=state.reviews?.[topic.id]?.dueDate;
  const dueNow=!!(due&&due<=dateKey(now));
  return (dueNow?60:0)+(status(p).code==="needs-practice"?30:0)+weakSpots(state,topic.id,3).length*12
   +Math.min(12,p.errors*3)-Math.min(12,p.streak*3)-(p.lastAt&&dateKey(p.lastAt)===dateKey(now)?20:0);
 }
 function recommendations(state,topics,now=Date.now(),limit=3){
  const available=topics.filter(t=>["practice","challenge"].includes(t.type));
  return available.filter(t=>state.skillProgress?.[t.id]?.attempts).map(t=>{
   const due=state.reviews?.[t.id]?.dueDate;
   const dueNow=!!(due&&due<=dateKey(now));
   return {id:t.id,title:t.topic,subject:t.subject,label:status(state.skillProgress[t.id]).label,
     reason:dueNow?"Un rappel utile aujourd’hui":weakSpots(state,t.id,1).length?"Quelques exemples à revoir":"Consolider une notion",
     score:priority(state,t,now)};
  }).filter(r=>r.score>0).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title)).slice(0,Math.max(0,Math.min(5,limit)));
 }
 function report(state,topics,subject){
  return topics.filter(t=>!subject||t.subject===subject).map(t=>{
   const p=state.skillProgress?.[t.id];
   return {id:t.id,title:t.topic,subject:t.subject,attempts:p?.attempts||0,
    independent:p?.independent||0,assisted:p?.assisted||0,errors:p?.errors||0,
    days:p?Object.keys(p.days||{}).length:0,status:status(p),weak:weakSpots(state,t.id,2)};
  });
 }
 function questionBias(state,topicId,q){
  let max=0;const tag=subskill(q);
  for(const key of topicTargets(topicId,q)){
   const m=state.skillProgress?.[key]?.subskills?.[tag];
   if(m?.errors>=2&&m.errors>m.independent)max=Math.max(max,Math.min(18,5+(m.errors-m.independent)*4));
  }
  return max;
 }
 return {VERSION,dateKey,subskill,subskillLabel,record,hydrate,status,weakSpots,priority,recommendations,report,questionBias};
})();
if(typeof window!=='undefined')window.PersonalizationEngine=PersonalizationEngine;
if(typeof module!=='undefined'&&module.exports)module.exports=PersonalizationEngine;
