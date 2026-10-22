'use strict';
// Coeur pedagogique : orchestration et rappels indicatifs, pas un diagnostic.
const LearningEngine=(function buildEngine() {
  "use strict";
  const DURATIONS = [5, 10, 15];
  const INTERVALS = [1, 1, 3, 7, 14, 28];
  const MAX_HISTORY = 1500;

  function localDay(value = new Date()) {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return localDay(new Date());
    const pad = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  function plusDays(ymd, days) {
    if (!/^\d{4}-\d\d-\d\d$/.test(String(ymd))) return localDay();
    const [y, m, d] = ymd.split("-").map(Number);
    const date = new Date(y, m - 1, d, 12);
    date.setDate(date.getDate() + days);
    return localDay(date);
  }
  function fresh(now = new Date()) {
    return {schema:2,duration:10,history:[],reviews:{},reading:[],prefs:{},
      started:localDay(now),sessions:[],activeSession:null};
  }
  function normalReview(value, today) {
    if (!value || typeof value !== "object") return null;
    const stage = Math.max(0,Math.min(5,Math.trunc(Number(value.stage)||0)));
    let dueDate = /^\d{4}-\d\d-\d\d$/.test(value.dueDate) ? value.dueDate : null;
    if (!dueDate && Number.isFinite(Number(value.due)) && Number(value.due)>0) {
      dueDate = localDay(new Date(Number(value.due)));
    }
    return {
      stage:Math.min(5,stage),
      dueDate:dueDate || today,
      attempts:Number.isFinite(value.attempts)?Math.max(0,value.attempts):0,
      independentSuccesses:Number.isFinite(value.independentSuccesses)?Math.max(0,value.independentSuccesses):0,
      assistedSuccesses:Number.isFinite(value.assistedSuccesses)?Math.max(0,value.assistedSuccesses):0,
      lapses:Number.isFinite(value.lapses)?Math.max(0,value.lapses):0,
      lastOutcome:value.lastOutcome||null,
      lastReviewed:value.lastReviewed||null
    };
  }
  function normalizeState(saved, old, now = new Date()) {
    const base = fresh(now);
    let incoming = saved && typeof saved === "object" && !Array.isArray(saved) ? saved : null;
    if (!incoming) incoming = old && typeof old === "object" && !Array.isArray(old) ? old : {};
    base.duration=DURATIONS.includes(incoming.duration)?incoming.duration:10;
    base.history=Array.isArray(incoming.history)?incoming.history.slice(-MAX_HISTORY):[];
    base.reading=Array.isArray(incoming.reading)?incoming.reading.slice(-500):[];
    base.prefs=incoming.prefs && typeof incoming.prefs==="object"&&!Array.isArray(incoming.prefs)?incoming.prefs:{};
    base.started=/^\d{4}-\d\d-\d\d$/.test(incoming.started)?incoming.started:base.started;
    if (incoming.reviews && typeof incoming.reviews==="object") {
      for (const [id, value] of Object.entries(incoming.reviews)) {
        if (/^[a-zA-Z0-9_-]{1,40}$/.test(id)) {
          const review=normalReview(value,localDay(now));
          if (review) base.reviews[id]=review;
        }
      }
    }
    base.sessions=Array.isArray(incoming.sessions)?incoming.sessions.slice(-400):[];
    const s=incoming.activeSession;
    if (s && Array.isArray(s.plan) && Number.isInteger(s.cursor)
       && s.cursor>=0 && s.cursor<s.plan.length && DURATIONS.includes(s.duration)
       && s.plan.every(step=>step && ["exercise","reading"].includes(step.kind)&&typeof step.id==="string")) {
      base.activeSession={...s,assistedItems:s.assistedItems&&typeof s.assistedItems==="object"?s.assistedItems:{},
        completed:Array.isArray(s.completed)?s.completed:[]};
    }
    return base;
  }
  function getDue(state, exercises, now=new Date()) {
    const today=localDay(now);
    return exercises.filter(e=>state.reviews[e.id] && state.reviews[e.id].dueDate<=today).sort((a,b)=>{
      const ra=state.reviews[a.id],rb=state.reviews[b.id];
      return ra.dueDate.localeCompare(rb.dueDate)
        || Number(rb.lastOutcome==="incorrect")-Number(ra.lastOutcome==="incorrect")
        || (ra.stage-rb.stage) || a.id.localeCompare(b.id);
    });
  }
  function readingCandidate(state, readings, maxTime) {
    const counts=new Map();
    for(const event of state.reading) if (event&&typeof event.id==="string") counts.set(event.id,(counts.get(event.id)||0)+1);
    const eligible=readings.filter(r=>r && Number(r.time)>0 && Number(r.time)<=maxTime && (
      !r.seriesId || r.episode===1 || readings.some(p=>p.seriesId===r.seriesId && p.episode===r.episode-1 && counts.has(p.id))
    ));
    eligible.sort((a,b)=>{
      const ca=counts.get(a.id)||0,cb=counts.get(b.id)||0;
      if(ca!==cb) return ca-cb;
      const continuation=r=>Boolean(r.seriesId && r.episode>1 && counts.has(
        (readings.find(p=>p.seriesId===r.seriesId && p.episode===r.episode-1)||{}).id
      ));
      if(continuation(a)!==continuation(b)) return continuation(a)?-1:1;
      const pa=state.prefs[a.id]===2?-1:state.prefs[a.id]===0?2:0;
      const pb=state.prefs[b.id]===2?-1:state.prefs[b.id]===0?2:0;
      if(pa!==pb) return pa-pb;
      return readings.indexOf(a)-readings.indexOf(b);
    });
    return eligible[0]||null;
  }
  function buildPlan(state, exercises, readings, requested=state.duration, now=new Date()) {
    const duration=DURATIONS.includes(requested)?requested:10;
    const today=localDay(now);
    const due=getDue(state,exercises,now);
    const selected=[];
    const used=new Set();
    const historical=new Map();
    const weekAgo=plusDays(today,-7);
    for(const h of state.history) {
      if(!h||h.kind!=="question"||!h.id||!h.at) continue;
      const e=exercises.find(item=>item.id===h.id);
      if(e&&localDay(h.at)>=weekAgo) historical.set(e.subject,(historical.get(e.subject)||0)+1);
    }
    const doneToday=new Set(state.history.filter(h=>h && h.kind==="question" && h.at
      && localDay(h.at)===today).map(h=>h.id));
    const ranked=pool=>pool.filter(e=>!used.has(e.id)&&!doneToday.has(e.id)).sort((a,b)=>{
      function score(e) {
        const already=selected.filter(x=>x.subject===e.subject).length;
        const base=e.subject==="Histoire-géo"?1:0;
        return already*9+(historical.get(e.subject)||0)*0.8+base;
      }
      return score(a)-score(b)||a.id.localeCompare(b.id);
    });
    let budget=duration;
    let reading=null;
    if(duration===5 && due.length===0) {
      reading=readingCandidate(state,readings,5);
      if(reading) return [{kind:"reading",id:reading.id,minutes:Number(reading.time),source:"plaisir"}];
    }
    if(duration>=10) {
      reading=readingCandidate(state,readings,duration-4);
      if(reading) budget-=Number(reading.time);
    }
    const reviewLimit=duration>=15?3:2;
    const cost=e=>Math.max(1,Math.min(5,Number(e.minutes)||2));
    const dueAvailable=[...due];
    while(selected.filter(x=>x.source==="review").length<reviewLimit) {
      const item=ranked(dueAvailable.filter(e=>cost(e)<=budget))[0];
      if(!item)break;
      used.add(item.id);
      budget-=cost(item);
      selected.push({...item,kind:"exercise",minutes:cost(item),source:"review"});
    }
    while(budget>=2) {
      const candidates=exercises.filter(e=>!state.reviews[e.id]&&cost(e)<=budget);
      const item=ranked(candidates)[0];
      if(!item)break;
      used.add(item.id);
      budget-=cost(item);
      selected.push({...item,kind:"exercise",minutes:cost(item),source:"new"});
    }
    // Ne pas créer de faux rappels avant échéance ni dépasser le budget prévu.
    const compact=selected.map(x=>({kind:"exercise",id:x.id,minutes:x.minutes,source:x.source}));
    if(reading)compact.splice(Math.min(1,compact.length),0,{kind:"reading",id:reading.id,minutes:Number(reading.time),source:"plaisir"});
    else if(!compact.length && duration===5){
      const extra=readingCandidate(state,readings,5);
      if(extra)compact.push({kind:"reading",id:extra.id,minutes:Number(extra.time),source:"plaisir"});
    }
    return compact;
  }
  function beginSession(state, exercises, readings, now=new Date()) {
    if(state.activeSession)return state.activeSession;
    const plan=buildPlan(state,exercises,readings,state.duration,now);
    if(!plan.length)return null;
    state.activeSession={id:"session-"+now.getTime(),date:localDay(now),
      startedAt:now.getTime(),duration:state.duration,plan,cursor:0,completed:[],assistedItems:{}};
    return state.activeSession;
  }
  function currentStep(state) {
    const s=state.activeSession;
    return s && s.plan[s.cursor] || null;
  }
  function recordAttempt(state,id,{correct,assisted=false,kind="question",now=new Date(),source="libre"}={}) {
    const at=now.getTime(),isRight=Boolean(correct),help=Boolean(assisted),today=localDay(now);
    const event={id,kind,correct:isRight,assisted:help,at,source,
      sessionId:source==="session"&&state.activeSession?state.activeSession.id:null};
    state.history.push(event);
    if(state.history.length>MAX_HISTORY)state.history.splice(0,state.history.length-MAX_HISTORY);
    if(kind!=="question")return event;
    const prev=state.reviews[id] || normalReview({},today);
    const stage=isRight&&!help?Math.min(5,prev.stage+1):(isRight?Math.min(1,prev.stage):0);
    const nextDate=plusDays(today,INTERVALS[stage]);
    state.reviews[id]={stage,dueDate:nextDate,attempts:prev.attempts+1,
      independentSuccesses:prev.independentSuccesses+Number(isRight&&!help),
      assistedSuccesses:prev.assistedSuccesses+Number(isRight&&help),
      lapses:prev.lapses+Number(!isRight),lastOutcome:!isRight?"incorrect":help?"avec aide":"autonome",
      lastReviewed:today};
    if(state.activeSession && source==="session" && (!isRight || help))
      state.activeSession.assistedItems[id]=true;
    return event;
  }
  function recordReading(state,id,{now=new Date(),source="libre"}={}) {
    const rec={id,at:now.getTime(),source,sessionId:source==="session"&&state.activeSession?state.activeSession.id:null};
    state.reading.push(rec);
    if(state.reading.length>500)state.reading.shift();
    return rec;
  }
  function finishStep(state,kind,id,{now=new Date(),outcome="complete"}={}) {
    const s=state.activeSession;
    if(!s)return false;
    const step=currentStep(state);
    if(!step||step.kind!==kind||step.id!==id)return false;
    s.completed.push({kind,id,at:now.getTime(),outcome});
    s.cursor++;
    if(s.cursor>=s.plan.length)endSession(state,{now,partial:false});
    return true;
  }
  function endSession(state,{now=new Date(),partial=true}={}) {
    const s=state.activeSession;
    if(!s)return null;
    const summary={id:s.id,date:s.date,startedAt:s.startedAt,endedAt:now.getTime(),
      duration:s.duration,planned:s.plan.length,completed:s.completed.length,
      estimatedMinutes:s.completed.reduce((sum,item)=>sum+(s.plan.find(p=>p.kind===item.kind&&p.id===item.id)?.minutes||0),0),
      partial:Boolean(partial)};
    state.sessions.push(summary);
    if(state.sessions.length>400)state.sessions.shift();
    state.activeSession=null;
    return summary;
  }
  function recap(state,exercises,now=new Date()) {
    const activity=state.history.filter(h=>h.kind==="question");
    return {seen:exercises.filter(e=>state.reviews[e.id]).length,
      due:getDue(state,exercises,now).length,
      independentSuccesses:activity.filter(h=>h.correct&&!h.assisted).length,
      assistedSuccesses:activity.filter(h=>h.correct&&h.assisted).length,
      attempts:activity.length,
      readings:new Set(state.reading.map(r=>r.id)).size,
      sessions:state.sessions.length};
  }
  return {DURATIONS,INTERVALS,localDay,plusDays,fresh,normalizeState,getDue,readingCandidate,
    buildPlan,beginSession,currentStep,recordAttempt,recordReading,finishStep,endSession,recap};
})();
if(typeof module!== 'undefined' && module.exports)module.exports=LearningEngine;
