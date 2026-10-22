'use strict';
const Engine=LearningEngine;
const KEY='appli4e-learning-v2', LEGACY='appli4e-prototype-v1';
const exercises=[
{id:'o1',subject:'Français',topic:'Accord sujet-verbe',question:'Les élèves de la classe ___ à huit heures.',options:['arrive','arrivent','arrivons'],answer:1,why:'Le sujet est « les élèves » : plusieurs personnes. Le verbe prend -ent.',probe:'Quel est le sujet du verbe ?',probeOptions:['la classe','les élèves'],probeAnswer:1},
{id:'o2',subject:'Français',topic:'Homophones',question:'Elle ___ oublié son carnet.',options:['a','à','as'],answer:0,why:'« a » est le verbe avoir. On peut dire « Elle avait oublié son carnet ».',probe:'Quel mot peut remplacer « a » ?',probeOptions:['avait','vers'],probeAnswer:0},
{id:'o3',subject:'Français',topic:'Participe passé',question:'Les filles sont ___ avant la pluie.',options:['arrivé','arrivées','arriver'],answer:1,why:'Avec être, le participe passé s’accorde avec « les filles » : féminin pluriel.',probe:'Le sujet « les filles » est :',probeOptions:['féminin pluriel','masculin singulier'],probeAnswer:0},
{id:'m1',subject:'Maths',topic:'Fractions',question:'Quelle fraction est égale à 3/4 ?',options:['3/8','6/8','4/6'],answer:1,why:'On multiplie le numérateur ET le dénominateur par 2 : 3/4 = 6/8.',probe:'Dans une fraction équivalente, on transforme :',probeOptions:['seulement le haut','le haut et le bas de la même façon'],probeAnswer:1},
{id:'m2',subject:'Maths',topic:'Relatifs',question:'Quel nombre est le plus grand ?',options:['−7','−2','−5'],answer:1,why:'Sur la droite graduée, −2 est plus à droite que −5 et −7.',probe:'Sur la droite graduée, le plus grand est celui situé :',probeOptions:['à droite','à gauche'],probeAnswer:0},
{id:'m3',subject:'Maths',topic:'Pourcentages',question:'Combien font 25 % de 80 ?',options:['10','20','25'],answer:1,why:'25 % = un quart ; un quart de 80 vaut 20.',probe:'25 %, c’est :',probeOptions:['un quart','la moitié'],probeAnswer:0},
{id:'h1',subject:'Histoire-géo',topic:'Les transports au XIXe siècle',question:'Quel transport se développe au XIXe siècle grâce à la vapeur ?',options:['Le train','L’avion de ligne','La fusée'],answer:0,why:'Les locomotives à vapeur permettent le développement du chemin de fer au XIXe siècle.',probe:'Une locomotive sert à :',probeOptions:['Tirer des wagons','Faire voler un avion'],probeAnswer:0},
{id:'h2',subject:'Histoire-géo',topic:'Urbanisation',question:'Que signifie « urbanisation » ?',options:['Baisse du nombre de villes','Augmentation de la population urbaine','Disparition des transports'],answer:1,why:'L’urbanisation est l’augmentation de la part de population vivant en ville.',probe:'Le mot « urbain » concerne :',probeOptions:['la ville','la montagne'],probeAnswer:0}
];
const readings=window.APP_READINGS||[];
const orthography=window.ORTHOGRAPHY_DATA||{questions:[],dictations:[]};
exercises.push(...orthography.questions,...orthography.dictations,...ConjugationEngine.TOPICS);
let stored=null,legacy=null;
try{stored=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}
try{legacy=JSON.parse(localStorage.getItem(LEGACY)||'null')}catch{}
const state=Engine.normalizeState(stored,legacy);
state.conjugationHistory=Array.isArray(stored?.conjugationHistory)?stored.conjugationHistory:[];
state.challenge=stored?.challenge&&Array.isArray(stored.challenge.questions)&&ConjugationEngine.TOPICS.some(t=>t.id===stored.challenge.topicId)?stored.challenge:null;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{saveError=true}};
let saveError=false;
if(!stored)save();
const root=document.getElementById('app');
let route='accueil',activeId=null,mode='question',currentSubject='Français',readId=null;
let source='libre',questionHelped=false,lastSummary=null,feedbackView=null,readingSessionCompleted=false,dictationResult=null,dictationText='';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const card=(inner,extra='')=>'<section class="card '+extra+'">'+inner+'</section>';
const head=(k,title,sub='')=>'<div class="hero"><div class="eyebrow">'+esc(k)+'</div><h1>'+esc(title)+'</h1><p class="muted">'+esc(sub)+'</p></div>';
const btn=(label,action,cls='')=>'<button class="btn '+cls+'" data-action="'+esc(action)+'">'+esc(label)+'</button>';
function findExercise(id){return exercises.find(x=>x.id===id)}
function findReading(id){return readings.find(x=>x.id===id)}
function actionRow(){return saveError?'<p class="muted">La sauvegarde locale est indisponible sur ce navigateur.</p>':''}
function due(){return Engine.getDue(state,exercises)}
function sessionStep(){return Engine.currentStep(state)}
function openExercise(id,origin='libre',help=false){activeId=id;dictationResult=null;dictationText='';source=origin;mode='question';questionHelped=help;feedbackView=null;route='exercice';render()}
function openReading(id,origin='libre'){readId=id;source=origin;readingSessionCompleted=false;route='texte';render()}
function goSessionStep(){
 const step=sessionStep();
 if(!step){route='accueil';render();return}
 if(step.kind==='reading')openReading(step.id,'session');
 else openExercise(step.id,'session',Boolean(state.activeSession.assistedItems[step.id]));
}
function sessionHome(){
 const session=state.activeSession;
 if(!session)return '';
 const step=sessionStep(),completed=session.completed.length,planned=session.plan.length;
 return card('<div class="row"><div><span class="pill">Séance en cours</span><h2 style="margin-top:12px">À ton rythme</h2></div><span class="min">'+completed+'/'+planned+' activités</span></div><div class="bar" aria-label="Avancement de la séance"><div style="width:'+Math.round(100*completed/planned)+'%"></div></div><p class="muted">Tu peux reprendre là où tu t’es arrêtée.</p><div class="actions">'+btn('Reprendre','resume')+btn('Terminer pour aujourd’hui','endSession','outline')+'</div>','highlight');
}
function home(){
 const n=due().length;
 return head('Un peu chaque jour','Une petite séance à ton rythme','Cinq, dix ou quinze minutes, sans chronomètre ni obligation.')
 +(state.activeSession?sessionHome():card('<div class="row"><div><div class="eyebrow">Ma séance</div><h2>Tu choisis le temps</h2></div><span class="pill">Sans chrono</span></div><div class="actions">'+[5,10,15].map(n=>btn(n+' min','duration:'+n,state.duration===n?'':'secondary')).join('')+'</div><p class="muted">Des rappels utiles, de petits défis et parfois une histoire.</p>'+btn('Commencer ma séance','start'),'highlight'))
 +card('<div class="item"><span class="symbol">▤</span><div><b>Une histoire à découvrir</b><div class="min">Fantastique, musique, créativité…</div></div></div><div class="actions">'+btn('Choisir une lecture','nav:lecture','secondary')+'</div>')
 +card('<div class="item"><span class="symbol">↻</span><div><b>À retrouver en mémoire</b><div class="min">'+(n?n+' notion(s) à revoir':'Rien d’urgent aujourd’hui')+'</div></div></div><div class="actions">'+btn('Voir les rappels','nav:revisions','outline')+'</div>')
 +'<p class="muted">Pas de retard à rattraper si tu fais une pause.</p>'+actionRow();
}
function sessionView(){
 const sess=state.activeSession;
 if(!sess)return head('Séance','Bien joué','Ta séance est terminée.')+card(btn('Retour à l’accueil','nav:accueil'));
 const step=sessionStep();if(!step)return home();
 const item=step.kind==='reading'?findReading(step.id):findExercise(step.id);
 if(!item)return head('Séance','Activité introuvable')+card(btn('Terminer la séance','endSession'));
 return head('Ma séance','Étape '+(sess.cursor+1)+' sur '+sess.plan.length,'Durée indicative : '+sess.duration+' min. Aucune limite de temps.')
 +card('<span class="pill">'+(step.kind==='reading'?'Lecture plaisir':step.source==='review'?'Rappel mémoire':'Petit défi')+'</span><h2 style="margin-top:14px">'+esc(item.title||item.topic)+'</h2><p class="muted">'+(step.kind==='reading'?'Un moment de lecture, sans question obligatoire.':esc(item.subject)+' · Environ '+(item.minutes||2)+' min')+'</p>'+btn('C’est parti','doStep')+' '+btn('Arrêter ici','endSession','outline'),'highlight');
}
function library(){
 const series=readings.filter(r=>r.seriesId==='solstice');
 const rest=readings.filter(r=>r.seriesId!=='solstice');
 function entry(r){const visited=state.reading.some(x=>x.id===r.id);
 return card('<div class="row"><span class="pill">'+(r.seriesId?'Épisode '+r.episode+'/'+series.length:esc(r.genre))+'</span><span class="min">Environ '+r.time+' min</span></div><h2 style="margin-top:12px">'+esc(r.title)+'</h2><div class="actions">'+btn(visited?'Relire':'Découvrir','read:'+r.id)+'</div>')}
 return head('Bibliothèque','Et si tu avais envie de la suite ?','Aucun questionnaire obligatoire. Choisis ce qui te plaît.')
 +card('<h2>Les secrets de l’Académie Solstice</h2><p class="muted">Magie, amitié, musique et mystères légers.</p>','highlight')
 +series.map(entry).join('')+'<h2 style="margin-top:25px">D’autres histoires</h2>'+rest.map(entry).join('');
}
function reader(){
 const t=findReading(readId);if(!t)return library();
 const vocab=t.words||[{term:t.word,definition:t.definition}];
 const parts=t.text.split(new RegExp('('+vocab.map(v=>v.term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','gi'));
 const body=parts.map(p=>{const i=vocab.findIndex(w=>w.term.toLocaleLowerCase('fr')===p.toLocaleLowerCase('fr'));return i<0?esc(p):'<button class="word" data-action="define:'+t.id+':'+i+'">'+esc(p)+'</button>'}).join('');
 return head(t.genre,t.title,'Lis sans te presser. Touche un mot souligné pour voir son sens.')
 +card('<div class="reader">'+body+'</div><div id="wordbox" aria-live="polite"></div><div class="actions">'+btn('J’ai terminé','readDone:'+t.id)+btn(source==='session'?'Pause de séance':'Retour aux histoires',source==='session'?'nav:seance':'nav:lecture','outline')+'</div>');
}
function afterReading(id){
 const t=findReading(id);if(!t)return library();
 const next=t.nextId&&findReading(t.nextId);
 return head('Lecture terminée','Tu as lu '+t.title,'Tu peux t’arrêter là. Aucune question n’est obligatoire.')
 +card('<h2>Cette histoire t’a plu ?</h2><div class="actions">'+['Pas pour moi','Ça allait','J’en lirais un autre'].map((x,i)=>btn(x,'rating:'+id+':'+i,state.prefs[id]===i?'':'secondary')).join('')+'</div>')
 +(next?card('<h2>La suite : '+esc(next.title)+'</h2><p class="muted">Tu pourras la lire une prochaine fois.</p>'+btn('Lire la suite','read:'+next.id,'secondary')):'')
 +card('<h2>Et maintenant ?</h2><div class="actions">'+btn('Une question facultative','readingQuiz:'+id,'secondary')+btn('Terminer ici',readingSessionCompleted?(state.activeSession?'nav:seance':'nav:fin'):'nav:lecture','outline')+'</div>');
}
function readingQuiz(){const t=findReading(readId);return head('Si tu en as envie','Une petite question','Tu peux aussi passer sans répondre.')+card('<h2>'+esc(t.question)+'</h2><div class="choices">'+t.options.map((x,i)=>'<button class="choice" data-action="readingAnswer:'+t.id+':'+i+'">'+esc(x)+'</button>').join('')+'</div>'+btn('Passer',readingSessionCompleted?(state.activeSession?'nav:seance':'nav:fin'):'nav:lecture','outline'))}
function subjects(){return head('Mes matières','Choisis une matière','Un essai, un conseil précis, et des rappels plus tard.')
 +['Français','Maths','Histoire-géo'].map(subject=>card('<div class="row"><h2>'+subject+'</h2><span class="pill">'+exercises.filter(x=>x.subject===subject).length+' défis</span></div>'+btn('Explorer','subject:'+subject))).join('')}
function subjectPage(){return head('Mes matières',currentSubject,'À toi de choisir.')
 +exercises.filter(e=>e.subject===currentSubject).map(e=>card('<h2>'+esc(e.topic)+'</h2>'+btn('Essayer','exercise:'+e.id))).join('')}
function exercise(){
 const e=findExercise(activeId);if(!e)return subjects();
 if(e.type==='dictation')return dictationView(e);
 if(e.type==='challenge'){if(state.challenge&&state.challenge.topicId!==e.id)state.challenge=null;return conjugationView(e);}
 const probe=mode==='probe';
 return head(e.subject,e.topic,probe?'Cette étape est une aide, pas un examen.':'Tu peux chercher à ton rythme.')
 +card('<h2>'+esc(probe?e.probe:e.question)+'</h2><div class="choices">'+(probe?e.probeOptions:e.options).map((t,i)=>'<button class="choice" data-action="answer:'+i+'">'+esc(t)+'</button>').join('')+'</div>'+btn('Arrêter ici',source==='session'?'nav:seance':'nav:matieres','outline'));
}

function dictationView(e){
 const supported='speechSynthesis' in window;
 return head('Français',e.topic,'Écoute la phrase, écris ce que tu entends, puis vérifie. Sans chronomètre.')
 +card('<p class="muted">Tu peux réécouter autant de fois que nécessaire.</p><div class="actions">'+btn('Écouter la phrase','dictationListen:'+e.id,'secondary')+'</div>'
 +(supported?'':'<p class="muted">La lecture audio n’est pas disponible sur ce navigateur. Tu peux demander à un adulte de lire la phrase.</p>')
 +'<label for="dictation-input" class="field-label">Ma dictée</label><textarea id="dictation-input" rows="4" maxlength="1800" spellcheck="false" autocapitalize="off" placeholder="Écris ici la phrase entendue…"></textarea>'
 +'<p id="dictation-hint" class="muted" aria-live="polite"></p><div class="actions">'+btn('Voir un indice','dictationHint:'+e.id,'secondary')+btn('Corriger ma dictée','dictationCheck')+'</div>');}
function checkDictation(){
 const e=findExercise(activeId),field=document.getElementById('dictation-input');
 if(!e||e.type!=='dictation'||!field)return;
 const input=field.value;
 const result=DictationEngine.compare(e.text,input,e.rules||[]);
 if(!result.valid){const hint=document.getElementById('dictation-hint');if(hint)hint.textContent=result.reason;return}
 const previous=state.reviews[e.id]; 
 const wasAssisted=questionHelped||Boolean(source==='session'&&state.activeSession?.assistedItems[e.id]);
 const once=Boolean(previous&&previous.lastReviewed===Engine.localDay()&&state.history.some(h=>h.id===e.id&&h.at&&Engine.localDay(h.at)===Engine.localDay()));
 if(!once){Engine.recordAttempt(state,e.id,{correct:result.correct,assisted:wasAssisted,source:source==='session'?'session':'libre',kind:'question'});}
 if(!result.correct&&source==='session'&&state.activeSession)state.activeSession.assistedItems[e.id]=true;
 save();
 const details=result.errors.slice(0,12).map(e=>'<li><b>'+esc(e.expected||'Mot ajouté')+'</b> — '+esc(e.actual||'mot absent')+' : '+esc(e.explanation)+'</li>').join('');
 root.innerHTML=head('Correction',result.correct?'Phrase retrouvée !':'Ce que nous allons retenir','Comparer les mots aide à repérer les accords et les homophones.')
 +card('<h2>La phrase attendue</h2><p>'+esc(e.text)+'</p><p class="muted">La ponctuation et les majuscules ne sont pas notées.</p>'
 +(result.correct?'<div class="feedback">Tu as retrouvé tous les mots.</div>':'<h2>Points à observer</h2><ul class="corrections">'+details+'</ul><p class="muted">Ces catégories sont indicatives : elles ne remplacent pas une analyse linguistique complète.</p>')
 +'<div class="actions">'+btn(source==='session'?'Continuer la séance':'Retour aux matières','dictationNext')+'</div>');
 root.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',()=>handle(el.dataset.action)));
}


function conjugationView(topic){
 const challenge=state.challenge?.topicId===topic.id?state.challenge:null;
 if(!challenge||challenge.finished){
  const choices=[3,5,8].map(n=>btn(n+' questions','challengeStart:'+topic.id+':'+n,n===5?'':'secondary')).join('');
  return head('Conjugaison',topic.topic,'Choisis une série courte. Les phrases varient d’une séance à l’autre.')
   +card('<span class="pill">Présent · Imparfait · Futur · Passé composé</span><h2 style="margin-top:14px">Combien de questions ?</h2><div class="actions">'+choices+'</div><p class="muted">Sans chronomètre. Tu peux interrompre et reprendre le défi.</p>');
 }
 const q=ConjugationEngine.current(challenge);
 if(!q)return head('Conjugaison','Défi terminé')+card(btn('Voir mon bilan','challengeNext'));
 const answered=challenge.answers.find(x=>x.atIndex===challenge.cursor);
 return head('Conjugaison',topic.topic,'Question '+(challenge.cursor+1)+' sur '+challenge.questions.length+' · '+q.tenseLabel)
 +card('<span class="pill">'+q.verb+' · '+q.tenseLabel+'</span><h2 style="margin-top:14px">'+esc(q.question)+'</h2>'
 +'<div class="choices">'+q.options.map((x,i)=>'<button class="choice" '+(answered?'disabled ':'')+'data-action="challengeAnswer:'+i+'">'+esc(x)+'</button>').join('')+'</div>'
 +(answered?'<div class="feedback"><b>'+(answered.correct?'Bonne réponse.':'À revoir.')+'</b> '+esc(q.why)+'</div><div class="actions">'+btn('Question suivante','challengeNext')+'</div>'
 :'<div class="actions">'+btn('Un indice','challengeHint','secondary')+btn('Faire une pause','nav:matieres','outline')+'</div>'
 +(challenge.hintShown?'<div class="feedback">'+esc(q.hint)+'</div>':''))
 );
}
function conjugationEnd(){
 const c=state.challenge;
 if(!c)return head('Conjugaison','Bilan')+card(btn('Retour aux matières','nav:matieres'));
 const result=ConjugationEngine.summary(c);
 return head('Conjugaison','Ton défi est terminé','Les nouvelles phrases reviendront dans de prochains défis.')
 +card('<h2>'+result.correct+' réponse(s) retrouvée(s) sur '+result.total+'</h2><p>'+result.independent+' réussite(s) sans indice et '+result.assisted+' avec indice.</p><p class="muted">Le résultat sert à choisir les prochaines questions. Il ne définit pas ton niveau.</p><div class="actions">'+btn('Autre série','challengeReset')+btn('Retour aux matières','nav:matieres','outline')+'</div>');
}
function completeConjugation(){
 const c=state.challenge;if(!c?.finished||c.recorded)return;
 const result=ConjugationEngine.summary(c);
 const autonomous=result.autonomous;
 // Un défi n'est considéré acquis qu'après toutes les questions réussies sans indice.
 Engine.recordAttempt(state,c.topicId,{correct:autonomous,assisted:!autonomous,kind:'question',source:c.origin});
 for(const item of c.answers){
  state.conjugationHistory.push({...item,topicId:c.topicId});
 }
 if(state.conjugationHistory.length>1200)state.conjugationHistory.splice(0,state.conjugationHistory.length-1200);
 c.recorded=true;
 if(c.origin==='session'&&state.activeSession&&sessionStep()?.id===c.topicId){
  const wasLast=state.activeSession.cursor===state.activeSession.plan.length-1;
  Engine.finishStep(state,'exercise',c.topicId);
  if(wasLast)lastSummary=state.sessions[state.sessions.length-1];
 }
 save();
}
function handleConjugation(p){
 const kind=p[0],topic=findExercise(p[1]);
 if(kind==='challengeStart'){
  if(!topic||topic.type!=='challenge')return;
  let count=[3,5,8].includes(+p[2])?+p[2]:5;
  if(source==='session')count=3;
  state.challenge=ConjugationEngine.create(state,topic.id,count,source,state.activeSession?.id||null);
  save();render();return;
 }
 const c=state.challenge;if(!c)return;
 if(kind==='challengeHint'){c.hintShown=true;save();render();return}
 if(kind==='challengeAnswer'){if(ConjugationEngine.answer(c,+p[1])){save();render()}return}
 if(kind==='challengeNext'){
  if(ConjugationEngine.advance(c)){if(c.finished){completeConjugation();route='conjugaisonBilan'}save();render()}
  return;
 }
 if(kind==='challengeReset'){state.challenge=null;source='libre';activeId='ct:present';route='matiere';currentSubject='Français';save();render();return}
}
function revisions(){
 const list=due();return head('Mémoire','Ce qui revient aujourd’hui','Les rappels sont espacés. Pas de séance à rattraper.')
 +(list.length?list.map(e=>card('<div class="row"><div><h3>'+esc(e.topic)+'</h3><div class="min">'+esc(e.subject)+'</div></div>'+btn('Revoir','exercise:'+e.id)+'</div>')).join('')
 :card('<h2>Rien d’urgent aujourd’hui</h2><p class="muted">Les notions reviendront à intervalles progressivement plus longs.</p>'+btn('Choisir une matière','nav:matieres','secondary')));
}
function progress(){
 const summary=Engine.recap(state,exercises);
 return head('Mon chemin','Mes progrès','On cherche à comprendre ce qui devient plus facile, sans comparaison.')
 +card('<div class="grid"><div><div class="eyebrow">Histoires découvertes</div><h1>'+summary.readings+'</h1></div><div><div class="eyebrow">Séances terminées</div><h1>'+summary.sessions+'</h1></div><div><div class="eyebrow">Réussites autonomes</div><h1>'+summary.independentSuccesses+'</h1></div><div><div class="eyebrow">Réussites avec aide</div><h1>'+summary.assistedSuccesses+'</h1></div></div>')
 +card('<h2>Les notions en chemin</h2>'+exercises.filter(e=>state.reviews[e.id]).map(e=>{
 const r=state.reviews[e.id],label=r.stage>=3?'En consolidation':r.lastOutcome==='avec aide'?'Avec aide':'À retrouver';
 return '<div class="row"><p>'+esc(e.topic)+'</p><span class="pill">'+label+'</span></div>';
 }).join('')+(!summary.seen?'<p class="muted">Les notions apparaîtront après tes premiers défis.</p>':''));
}
function resultView(){
 const x=feedbackView;if(!x)return home();
 return head('On apprend',x.correct?'Bien vu !':'On continue à comprendre','Une erreur donne une information utile.')
 +card('<div class="feedback">'+esc(x.message)+'</div><div class="actions">'
 +(x.continue?btn('Continuer la séance','nextStep'):x.probing?btn('Revenir à la question','returnMain'):x.correct?btn('Choisir un autre défi','nav:matieres'):btn('Une aide pour comprendre','probe:'+x.id))
 +btn('Arrêter ici',x.continue?'endSession':'nav:accueil','outline')+'</div>');
}
function endView(){return head('Pour aujourd’hui','C’est déjà bien','Tu as avancé à ton rythme.')
 +card('<h2>'+((lastSummary&&lastSummary.completed)||0)+' activité(s) réalisées</h2><p class="muted">Tu peux revenir quand tu en auras envie. Aucune absence n’est pénalisée.</p>'+btn('Retour à l’accueil','nav:accueil'))}
function render(){
 const pages={accueil:home,seance:sessionView,lecture:library,texte:reader,apreslecture:()=>afterReading(readId),lecturequiz:readingQuiz,
 matieres:subjects,matiere:subjectPage,exercice:exercise,revisions,progres:progress,resultat:resultView,fin:endView,conjugaisonBilan:conjugationEnd};
 root.innerHTML=(pages[route]||home)();
 document.querySelectorAll('.bottom button').forEach(b=>b.classList.toggle('active',b.dataset.nav===route));
 document.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',()=>handle(el.dataset.action)));
}
function finishCurrentStep(){
 const step=sessionStep();if(!step){route='accueil';render();return}
 const wasLast=state.activeSession.cursor===state.activeSession.plan.length-1;
 const now=new Date();
 if(!Engine.finishStep(state,step.kind,step.id,{now})){route='seance';render();return}
 save();if(wasLast){lastSummary=state.sessions[state.sessions.length-1];route='fin';render()}else{route='seance';render()}
}
function submitAnswer(index){
 const e=findExercise(activeId);if(!e)return;
 if(e.type==='dictation'||e.type==='challenge')return;
 const probing=mode==='probe',correct=index===(probing?e.probeAnswer:e.answer);
 const origin=source==='session'?'session':'libre';
 if(probing)questionHelped=true;
 Engine.recordAttempt(state,e.id,{correct,assisted:questionHelped,kind:probing?'probe':'question',source:origin});
 if(!correct && source==='session' && state.activeSession)state.activeSession.assistedItems[e.id]=true;
 save();
 feedbackView={id:e.id,correct,message:(correct?(questionHelped?'Tu as réussi avec un indice. ':'Tu as réussi seule. '):'Cette réponse ne convient pas encore. ')+e.why,
 continue:source==='session'&&correct&&!probing,probing};
 route='resultat';render();
}
function handle(raw){
 const p=raw.split(':'),kind=p[0],id=p[1];
 if(kind==='nav'){route=id;render();return}
 if(kind==='duration'){if(!state.activeSession && Engine.DURATIONS.includes(+id)){state.duration=+id;save()}render();return}
 if(kind==='start'){Engine.beginSession(state,exercises,readings);save();route='seance';render();return}
 if(kind==='resume'){route='seance';render();return}
 if(kind==='doStep'){goSessionStep();return}
 if(kind==='nextStep'){finishCurrentStep();return}
 if(kind==='endSession'){lastSummary=Engine.endSession(state,{partial:true});save();route='fin';render();return}
 if(kind==='exercise'){openExercise(id);return}
 if(kind==='subject'){currentSubject=p.slice(1).join(':');route='matiere';render();return}
 if(kind==='read'){openReading(id);return}
 if(kind==='define'){const r=findReading(id),w=(r?.words||[{term:r?.word,definition:r?.definition}])[Number(p[2]||0)],el=document.getElementById('wordbox');if(w&&el)el.innerHTML='<div class="feedback"><b>'+esc(w.term)+'</b> — '+esc(w.definition)+'</div>';return}
 if(kind==='readDone'){
  readingSessionCompleted=false;
  Engine.recordReading(state,id,{source:source==='session'?'session':'libre'});
  if(source==='session'&&sessionStep()?.kind==='reading'&&sessionStep()?.id===id){
    // Lecture terminée : la prochaine étape est seulement proposée après réflexion.
    readingSessionCompleted=true;
    const current=state.activeSession;
    current.completed.push({kind:'reading',id,at:Date.now(),outcome:'complete'});
    current.cursor++;
    if(current.cursor>=current.plan.length){lastSummary=Engine.endSession(state,{partial:false});source='libre'}
  }
  save();readId=id;route='apreslecture';render();return;
 }
 if(kind==='rating'){state.prefs[id]=Number(p[2]);save();render();return}
 if(kind==='readingQuiz'){readId=id;route='lecturequiz';render();return}
 if(kind==='readingAnswer'){
 const r=findReading(id),correct=Number(p[2])===r.answer;Engine.recordAttempt(state,id,{correct,kind:'reading',source:'libre'});save();
 root.innerHTML=head('Compréhension',correct?'Bien trouvé !':'Une occasion de relire')+card('<p>'+esc(correct?'Tu as retrouvé une information importante.':'Relis le passage qui raconte ce moment si tu en as envie.')+'</p>'+btn('Continuer',readingSessionCompleted?(state.activeSession?'nav:seance':'nav:fin'):'nav:lecture'));root.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',()=>handle(el.dataset.action)));return;
 }
 if(kind==='returnMain'){mode='question';route='exercice';render();return}
 if(kind.startsWith('challenge')){handleConjugation(p);return}
 if(kind==='answer'){submitAnswer(Number(id));return}
 if(kind==='dictationListen'){const e=findExercise(id);if(e&&'speechSynthesis' in window){window.speechSynthesis.cancel();const msg=new SpeechSynthesisUtterance(e.text);msg.lang='fr-FR';msg.rate=0.85;window.speechSynthesis.speak(msg)}return}
 if(kind==='dictationCheck'){checkDictation();return}
 if(kind==='dictationHint'){const e=findExercise(id);if(e){questionHelped=true;const element=document.getElementById('dictation-hint');if(element)element.textContent=e.hint}return}
 if(kind==='dictationNext'){if(source==='session')finishCurrentStep();else{route='matieres';render()}return}
 if(kind==='probe'){questionHelped=true;mode='probe';route='exercice';render();return}
}
document.querySelectorAll('[data-nav]').forEach(el=>el.addEventListener('click',()=>{route=el.dataset.nav;render()}));
document.querySelector('.brand')?.addEventListener('click',()=>{route='accueil';render()});
render();
