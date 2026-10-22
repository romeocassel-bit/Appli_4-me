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
exercises.push(...orthography.questions,...orthography.dictations,...ConjugationEngine.TOPICS,...PracticeBank.TOPICS,...MathJourney.TOPICS);
// Anciennes questions uniques conservées uniquement pour les progrès et les séances déjà commencées.
// Les nouvelles séances et le catalogue exposent les parcours multiquestions et les dictées.
const activeExercises=exercises.filter(e=>['dictation','challenge','practice','journey'].includes(e.type)||e.subject==='Histoire-géo');
let stored=null,legacy=null;
try{stored=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}
try{legacy=JSON.parse(localStorage.getItem(LEGACY)||'null')}catch{}
const state=Engine.normalizeState(stored,legacy);
state.conjugationHistory=Array.isArray(stored?.conjugationHistory)?stored.conjugationHistory:[];
state.practiceHistory=Array.isArray(stored?.practiceHistory)?stored.practiceHistory:[];
state.mathJourneyHistory=Array.isArray(stored?.mathJourneyHistory)?stored.mathJourneyHistory:[];
state.mathJourneyProgress=stored?.mathJourneyProgress&&typeof stored.mathJourneyProgress==='object'?stored.mathJourneyProgress:{};
state.mathJourney=stored?.mathJourney&&MathJourney.TOPICS.some(t=>t.id===stored.mathJourney.topicId)?stored.mathJourney:null;
state.readingBookmarks=stored?.readingBookmarks&&typeof stored.readingBookmarks==='object'?stored.readingBookmarks:{};
state.readerSettings=stored?.readerSettings&&typeof stored.readerSettings==='object'?stored.readerSettings:{size:'normal',theme:'clair'};
const personalizationMigrated=PersonalizationEngine.hydrate(state,{conjugation:ConjugationEngine,practice:PracticeBank});
state.practiceChallenge=stored?.practiceChallenge&&PracticeBank.TOPICS.some(t=>t.id===stored.practiceChallenge.topicId)?stored.practiceChallenge:null;
state.challenge=stored?.challenge&&Array.isArray(stored.challenge.questions)&&ConjugationEngine.TOPICS.some(t=>t.id===stored.challenge.topicId)?stored.challenge:null;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{saveError=true}};
let saveError=false;
if(!stored||personalizationMigrated)save();
const root=document.getElementById('app');
let route='accueil',activeId=null,mode='question',currentSubject='Français',readId=null;
let mathInput='',mathFeedback=null,mathMistakes=0,mathPrereq=null,mathShowChoices=false;
let source='libre',questionHelped=false,lastSummary=null,feedbackView=null,readingSessionCompleted=false,dictationResult=null,dictationText='';
if(state.activeSession){route='accueil';}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const card=(inner,extra='')=>'<section class="card '+extra+'">'+inner+'</section>';
const head=(k,title,sub='')=>'<div class="hero"><div class="eyebrow">'+esc(k)+'</div><h1>'+esc(title)+'</h1><p class="muted">'+esc(sub)+'</p></div>';
const btn=(label,action,cls='')=>'<button class="btn '+cls+'" data-action="'+esc(action)+'">'+esc(label)+'</button>';
function findExercise(id){return exercises.find(x=>x.id===id)}
function findReading(id){return readings.find(x=>x.id===id)}
function actionRow(){return saveError?'<p class="muted">La sauvegarde locale est indisponible sur ce navigateur.</p>':''}
function due(){return Engine.getDue(state,activeExercises)}
function sessionStep(){return Engine.currentStep(state)}
function openExercise(id,origin='libre',help=false){mathInput='';mathFeedback=null;mathMistakes=0;mathPrereq=null;mathShowChoices=false;activeId=id;dictationResult=null;dictationText='';source=origin;mode='question';questionHelped=help;feedbackView=null;route='exercice';render()}
function openReading(id,origin='libre'){readId=id;source=origin;readingSessionCompleted=false;route='texte';render();restoreReadingBookmark();}
function restoreReadingBookmark(){
 const i=Math.max(0,Number(state.readingBookmarks?.[readId]||0));
 if(!i)return;
 const paragraph=document.querySelector('[data-reading-paragraph="'+i+'"]');
 if(paragraph)paragraph.scrollIntoView({block:'start',behavior:'instant'});
}
function saveReadingBookmark(){
 if(route!=='texte'||!readId)return;
 const paragraphs=[...document.querySelectorAll('[data-reading-paragraph]')];
 if(!paragraphs.length)return;
 const cutoff=Math.max(120,window.innerHeight*.36);
 let index=0;
 for(let i=0;i<paragraphs.length;i++)if(paragraphs[i].getBoundingClientRect().top<=cutoff)index=i;
 if(state.readingBookmarks[readId]!==index){state.readingBookmarks[readId]=index;save()}
}
window.addEventListener('scroll',saveReadingBookmark,{passive:true});
function goSessionStep(){
 const step=sessionStep();
 if(!step){route='accueil';render();return}
 if(step.kind==='reading')openReading(step.id,'session');
 else { const c=findExercise(step.id);if(c?.type==='journey'&&state.mathJourney?.topicId===step.id&&state.mathJourney.sessionId===state.activeSession.id&&!state.mathJourney.finished){openExercise(step.id,'session');return}if(c?.type==='practice'&&state.practiceChallenge?.topicId===step.id&&state.practiceChallenge.sessionId===state.activeSession.id&&!state.practiceChallenge.finished){openExercise(step.id,'session');return}if(c?.type==='challenge'&&state.challenge?.topicId===step.id&&state.challenge.sessionId===state.activeSession.id&&!state.challenge.finished){openExercise(step.id,'session');return}openExercise(step.id,'session',Boolean(state.activeSession.assistedItems[step.id]));}
}
function sessionHome(){
 const session=state.activeSession;
 if(!session)return '';
 const step=sessionStep(),completed=session.completed.length,planned=session.plan.length;
 return card('<div class="row"><div><span class="pill">Séance en cours</span><h2 style="margin-top:12px">À ton rythme</h2></div><span class="min">'+completed+'/'+planned+' activités</span></div><div class="bar" aria-label="Avancement de la séance"><div style="width:'+Math.round(100*completed/planned)+'%"></div></div><p class="muted">Tu peux reprendre là où tu t’es arrêtée.</p><div class="actions">'+btn('Reprendre','resume')+btn('Terminer pour aujourd’hui','endSession','outline')+'</div>','highlight');
}
function home(){
 const n=due().length;
 const suggestions=PersonalizationEngine.recommendations(state,[...ConjugationEngine.TOPICS,...PracticeBank.TOPICS]);
 return head('Un peu chaque jour','Une petite séance à ton rythme','Cinq, dix ou quinze minutes, sans chronomètre ni obligation.')
 +(state.activeSession?sessionHome():card('<div class="row"><div><div class="eyebrow">Ma séance</div><h2>Tu choisis le temps</h2></div><span class="pill">Sans chrono</span></div><div class="actions">'+[5,10,15].map(n=>btn(n+' min','duration:'+n,state.duration===n?'':'secondary')).join('')+'</div><p class="muted">Des rappels utiles, de petits défis et parfois une histoire.</p>'+btn('Commencer ma séance','start'),'highlight'))
 +card('<div class="item"><span class="symbol">▤</span><div><b>Une histoire à découvrir</b><div class="min">Fantastique, musique, créativité…</div></div></div><div class="actions">'+btn('Choisir une lecture','nav:lecture','secondary')+'</div>')
 +card('<div class="item"><span class="symbol">↻</span><div><b>À retrouver en mémoire</b><div class="min">'+(n?n+' notion(s) à revoir':'Rien d’urgent aujourd’hui')+'</div></div></div><div class="actions">'+btn('Voir les rappels','nav:revisions','outline')+'</div>')
 +(suggestions.length?card('<h2>Des idées pour progresser</h2>'+suggestions.map(x=>'<div class="row"><div><b>'+esc(x.title)+'</b><div class="min">'+esc(x.reason)+'</div></div>'+btn('Revoir','exercise:'+x.id,'secondary')).join('<hr>')):'')
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
 function entry(r){const visited=state.reading.some(x=>x.id===r.id);const bookmark=state.readingBookmarks?.[r.id]||0;
 return card('<div class="row"><span class="pill">'+(r.seriesId?'Épisode '+r.episode+'/'+series.length:esc(r.genre))+'</span><span class="min">Environ '+r.time+' min</span></div><h2 style="margin-top:12px">'+esc(r.title)+'</h2>'+(bookmark?'<p class="muted">Marque-page enregistré · paragraphe '+(bookmark+1)+'</p>':'')+'<div class="actions">'+btn(bookmark?'Reprendre':visited?'Relire':'Découvrir','read:'+r.id)+'</div>')}
 return head('Bibliothèque','Et si tu avais envie de la suite ?','Aucun questionnaire obligatoire. Choisis ce qui te plaît.')
 +card('<h2>Les secrets de l’Académie Solstice</h2><p class="muted">Magie, amitié, musique et mystères légers.</p>','highlight')
 +series.map(entry).join('')+'<h2 style="margin-top:25px">D’autres histoires</h2>'+rest.map(entry).join('');
}
function reader(){
 const t=findReading(readId);if(!t)return library();
 const vocab=t.words||[{term:t.word,definition:t.definition}];
 const regex=new RegExp('('+vocab.map(v=>v.term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','gi');
 const paragraphs=t.text.split(/\n\s*\n/);
 function paragraph(text,i){
  const parts=text.split(regex);
  const content=parts.map(part=>{
   const ix=vocab.findIndex(w=>w.term.toLocaleLowerCase('fr')===part.toLocaleLowerCase('fr'));
   return ix<0?esc(part):'<button class="word" data-action="define:'+t.id+':'+ix+'">'+esc(part)+'</button>';
  }).join('');
  return '<p data-reading-paragraph="'+i+'">'+content+'</p>';
 }
 const size=state.readerSettings?.size==='grand'?'grand':'normal';
 const theme=state.readerSettings?.theme==='doux'?'doux':'clair';
 const bookmark=state.readingBookmarks?.[t.id]||0;
 return head(t.genre,t.title,'Lis à ton rythme. Les mots soulignés peuvent être expliqués.')
 +card('<div class="reading-toolbar"><span class="pill">Environ '+t.time+' min</span>'
 +btn(size==='grand'?'Texte normal':'Agrandir le texte','readerSize','secondary')
 +btn(theme==='doux'?'Fond clair':'Fond doux','readerTheme','secondary')+'</div>'
 +(bookmark?'<p class="muted">Ton marque-page est au paragraphe '+(bookmark+1)+'.</p>':'')
 +'<div class="reader reader--'+size+' reader--'+theme+'">'+paragraphs.map(paragraph).join('')+'</div>'
 +'<div id="wordbox" aria-live="polite"></div><p class="muted">Ta position se sauvegarde automatiquement pendant la lecture.</p>'
 +'<div class="actions">'+btn('J’ai terminé','readDone:'+t.id)
 +btn('Reprendre plus tard',source==='session'?'nav:seance':'nav:lecture','outline')+'</div>');
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
function subjects(){return head('Mes matières','Choisis une matière','Des parcours progressifs et des défis à plusieurs questions.')
 +['Français','Maths','Histoire-géo'].map(subject=>card('<div class="row"><h2>'+esc(subject)+'</h2><span class="pill">'+activeExercises.filter(x=>x.subject===subject).length+' activités</span></div>'+btn('Explorer','subject:'+subject))).join('')}
function activityCard(e){
 const types={
  journey:{name:'3 niveaux',description:'Prérequis, automatismes puis problème en trois étapes.',action:'Découvrir le parcours'},
  practice:{name:'3 à 8 questions',description:'Choisir une série de 3, 5 ou 8 questions variées.',action:'Choisir une série'},
  challenge:{name:'3 à 8 questions',description:'Plusieurs phrases et plusieurs temps pour s’entraîner.',action:'Choisir une série'},
  dictation:{name:'Mini-dictée',description:'Écouter, écrire, puis comparer avec une correction.',action:'Faire la dictée'}
 };
 const info=types[e.type]||{name:'1 question',description:'Petite question de découverte.',action:'Essayer'};
 return card('<div class="row"><div><h2>'+esc(e.topic)+'</h2><p class="muted">'+esc(info.description)+'</p></div><span class="pill">'+esc(info.name)+'</span></div><div class="actions">'+btn(info.action,'exercise:'+e.id)+'</div>');
}
function subjectSection(name,description,items){
 return items.length?'<div class="subject-section"><h2>'+esc(name)+'</h2><p class="muted">'+esc(description)+'</p>'+items.map(activityCard).join('')+'</div>':'';
}
function subjectPage(){
 const items=activeExercises.filter(e=>e.subject===currentSubject);
 if(currentSubject==='Maths'){
  return head('Mes matières','Maths','Choisis des automatismes ou un parcours en trois niveaux.')
   +subjectSection('Parcours guidés','Prérequis → automatismes → problèmes à plusieurs étapes.',items.filter(e=>e.type==='journey'))
   +subjectSection('Séries d’automatismes','Plusieurs questions par défi. Pas de question unique.',items.filter(e=>e.type==='practice'));
 }
 if(currentSubject==='Français'){
  return head('Mes matières','Français','Plusieurs exemples par notion et des mini-dictées.')
   +subjectSection('Orthographe','Accords, homophones et règles à retrouver.',items.filter(e=>e.type==='practice'))
   +subjectSection('Choisis ton temps de conjugaison','Présent, imparfait, futur simple ou passé composé. Tu peux aussi mélanger les temps.',items.filter(e=>e.type==='challenge'))
   +subjectSection('Mini-dictées','Une phrase complète à écouter puis à écrire.',items.filter(e=>e.type==='dictation'));
 }
 return head('Mes matières',currentSubject,'De courtes questions pour découvrir une notion.')
  +subjectSection('Questions de découverte','Ces activités contiennent encore une seule question.',items);
}
function exercise(){
 const e=findExercise(activeId);if(!e)return subjects();
 if(e.type==='dictation')return dictationView(e);
 if(e.type==='challenge')return conjugationView(e);
 if(e.type==='practice')return practiceView(e);
 if(e.type==='journey')return mathJourneyView(e);
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
 const wasAssisted=questionHelped||Boolean(source==='session'&&state.activeSession?.assistedItems[e.id]);
 Engine.recordAttempt(state,e.id,{correct:result.correct,assisted:wasAssisted,source:source==='session'?'session':'libre',kind:'question'});
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
  const recommended=ConjugationEngine.recommendedLevel(state,topic.id);
  const levels=ConjugationEngine.LEVELS.map(l=>'<div class="journey-level"><b>'+esc(l.label)+(l.key===recommended?' · conseillé':'')+'</b><p class="muted">'+esc(l.description)+'</p><div class="actions">'+[3,5,8].map(n=>btn(n+' questions','challengeStart:'+topic.id+':'+n+':'+l.key,n===5?'':'secondary')).join('')+'</div></div>').join('');
  return head('Conjugaison',topic.topic,'Choisis ton niveau et la longueur du défi.')
   +card('<p class="muted">Les trois niveaux sont accessibles librement. Aucun classement.</p>'+levels+'<p class="muted">Sans chronomètre, avec pause et reprise.</p>');
 }
 const q=ConjugationEngine.current(challenge);
 if(!q)return head('Conjugaison','Défi terminé')+card(btn('Voir mon bilan','challengeNext'));
 const answered=challenge.answers.find(x=>x.atIndex===challenge.cursor);
 return head('Conjugaison',topic.topic,'Question '+(challenge.cursor+1)+' sur '+challenge.questions.length+' · '+q.tenseLabel)
 +card('<span class="pill">'+q.verb+' · '+q.tenseLabel+'</span><h2 style="margin-top:14px">'+esc(q.question)+'</h2>'
 +(challenge.level==='decouverte'&&!answered&&!challenge.showChoices?'<label class="field-label" for="conjugation-input">Écris la forme du verbe</label><input id="conjugation-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" value="'+esc(challenge.draft||'')+'" placeholder="Ex. : chantons ou avons chanté"><div class="actions">'+btn('Vérifier ma réponse','challengeWrite')+btn('Voir les propositions','challengeChoices','secondary')+'</div>':'<div class="choices">'+q.options.map((x,i)=>'<button class="choice" '+(answered?'disabled ':'')+'data-action="challengeAnswer:'+i+'">'+esc(x)+'</button>').join('')+'</div>')
 +(challenge.feedback&&!answered?'<div class="feedback" role="status">'+esc(challenge.feedback)+'</div>':'')
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
 for(const item of c.answers){PersonalizationEngine.record(state,{topicId:c.topicId,question:ConjugationEngine.getQuestion(item.questionId),correct:item.correct,assisted:item.assisted,at:item.at})}
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
 const kind=p[0],topic=findExercise(p.slice(1,3).join(':'));
 if(kind==='challengeStart'){
  if(!topic||topic.type!=='challenge')return;
  let count=[3,5,8].includes(+p[3])?+p[3]:5;
  if(source==='session')count=3;
  const level=ConjugationEngine.LEVELS.some(l=>l.key===p[4])?p[4]:'auto';
  state.challenge=ConjugationEngine.create(state,topic.id,count,source,state.activeSession?.id||null,level);
  save();render();return;
 }
 const c=state.challenge;if(!c)return;
 if(kind==='challengeHint'){c.hintShown=true;c.feedback=ConjugationEngine.current(c)?.hint||'';save();render();return}
 if(kind==='challengeWrite'){
  const field=document.getElementById('conjugation-input');if(field)c.draft=field.value.slice(0,100);
  const result=ConjugationEngine.submitWritten(c,c.draft);
  c.feedback=result.correct?'':result.reason;
  if((c.wrongTries||0)>=2)c.showChoices=true;
  save();render();return;
 }
 if(kind==='challengeChoices'){c.hintShown=true;c.showChoices=true;c.feedback='Choisis la forme qui convient.';save();render();return}
 if(kind==='challengeAnswer'){if(ConjugationEngine.answer(c,+p[1])){c.feedback='';save();render()}return}
 if(kind==='challengeNext'){
  if(ConjugationEngine.advance(c)){c.feedback='';if(c.finished){completeConjugation();route='conjugaisonBilan'}save();render()}
  return;
 }
 if(kind==='challengeReset'){const id=c.topicId;state.challenge=null;source='libre';activeId=id;route='exercice';save();render();return}
}

function practiceView(topic){
 const c=state.practiceChallenge?.topicId===topic.id?state.practiceChallenge:null;
 if(!c||c.finished){
  return head(topic.subject,topic.topic,'Plusieurs exemples différents, à ton rythme.')
  +card('<span class="pill">Défi progressif</span><h2 style="margin-top:14px">Choisis ton défi</h2><div class="actions">'
    +[3,5,8].map(n=>btn(n+' questions','practiceStart:'+topic.id+':'+n,n===5?'':'secondary')).join('')
    +'</div><p class="muted">Aucun compte à rebours. Tu peux faire une pause.</p>');
 }
 const q=PracticeEngine.current(c);
 if(!q)return head(topic.subject,'Défi terminé')+card(btn('Voir mon bilan','practiceNext'));
 const done=c.answers.find(x=>x.atIndex===c.cursor);
 return head(topic.subject,topic.topic,'Question '+(c.cursor+1)+' sur '+c.questions.length)
 +card('<span class="pill">'+(q.difficulty===1?'Découverte':q.difficulty===2?'Entraînement':'Approfondissement')+'</span><h2 style="margin-top:14px">'+esc(q.question)+'</h2>'
 +(topic.subject==='Maths'&&!done&&!mathShowChoices?'<label class="field-label" for="math-input">Ma réponse (sans choisir parmi des propositions)</label><input id="math-input" type="text" inputmode="decimal" autocomplete="off" value="'+esc(mathInput)+'" placeholder="Ex. : −3, 25 ou 2/5"><div class="actions">'+btn('Vérifier','mathCheck')+btn('Voir les propositions','mathShowChoices','secondary')+'</div>':((topic.subject==='Maths'&&!mathShowChoices)?'':'<div class="choices">'+q.options.map((x,i)=>'<button class="choice" '+(done?'disabled ':'')+'data-action="practiceAnswer:'+i+'">'+esc(x)+'</button>').join('')+'</div>'))
 +(mathPrereq&&!done&&topic.subject==='Maths'?'<div class="feedback"><b>Un rappel avant de continuer : '+esc(MathCoach.PATHS[topic.id]?.before||'Calcul de base')+'</b><p>'+esc(MathCoach.PATHS[topic.id]?.check||'')+'</p><label class="field-label" for="math-prereq">Ma réponse</label><input id="math-prereq" type="text" inputmode="decimal" autocomplete="off"><div class="actions">'+btn('Vérifier le rappel','mathPrereqCheck')+btn('Revenir au défi','mathPrereqClose','secondary')+'</div></div>':'')
 +(mathFeedback&&!done&&topic.subject==='Maths'?'<div class="feedback">'+esc(mathFeedback)+'</div>':'')
 +(done?'<div class="feedback"><b>'+(done.correct?'Bonne réponse.':'Une notion à revoir.')+'</b> '+esc(q.explanation)+'</div><div class="actions">'+btn('Question suivante','practiceNext')+'</div>'
 :'<div class="actions">'+btn('Voir un indice','practiceHint','secondary')+(topic.subject==='Maths'?btn('Revoir un prérequis','mathPrereq','outline')+btn('Passer','mathSkip','outline'):'')+btn('Faire une pause','nav:matieres','outline')+'</div>'
 +(c.hintShown?'<div class="feedback">'+esc(q.hint)+'</div>':'')));
}
function practiceEnd(){
 const c=state.practiceChallenge;if(!c)return head('Mes défis','Bilan')+card(btn('Retour aux matières','nav:matieres'));
 const sum=PracticeEngine.summary(c);
 return head('Défi terminé','Ce que tu as retrouvé','La mémoire progresse grâce à plusieurs essais espacés.')
 +card('<h2>'+sum.correct+' réponse(s) sur '+sum.total+'</h2><p>'+sum.independent+' sans indice, '+sum.assisted+' avec indice.</p>'
 +'<p class="muted">Tu retrouveras d’autres exemples de cette notion plus tard.</p><div class="actions">'+btn('Nouvelle série','practiceReset')+btn('Retour aux matières','nav:matieres','outline')+'</div>');
}
function finishPractice(){
 const c=state.practiceChallenge;if(!c?.finished||c.recorded)return;
 const result=PracticeEngine.summary(c);
 for(const item of c.answers){PersonalizationEngine.record(state,{topicId:c.topicId,question:PracticeBank.getQuestion(item.questionId),correct:item.correct,assisted:item.assisted,at:item.at})}
 Engine.recordAttempt(state,c.topicId,{correct:result.autonomous,assisted:!result.autonomous,kind:'question',source:c.origin});
 state.practiceHistory.push(...c.answers.map(a=>({...a,challengeTopicId:c.topicId})));
 if(state.practiceHistory.length>1500)state.practiceHistory.splice(0,state.practiceHistory.length-1500);
 c.recorded=true;
 if(c.origin==='session'&&state.activeSession&&sessionStep()?.id===c.topicId){
  const last=state.activeSession.cursor===state.activeSession.plan.length-1;
  Engine.finishStep(state,'exercise',c.topicId);
  if(last)lastSummary=state.sessions[state.sessions.length-1];
 }
 save();
}
function handlePractice(parts){
 const action=parts[0],topic=findExercise(parts[1]);
 if(action==='practiceStart'){
  if(!topic||topic.type!=='practice')return;
  let count=[3,5,8].includes(+parts[2])?+parts[2]:5;
  if(source==='session')count=3;
  mathInput='';mathFeedback=null;mathMistakes=0;mathPrereq=null;mathShowChoices=false;
  state.practiceChallenge=PracticeEngine.create(state,topic.id,count,source,state.activeSession?.id||null);
  save();render();return;
 }
 const c=state.practiceChallenge;if(!c)return;
 if(action==='practiceHint'){c.hintShown=true;if(topic?.subject==='Maths')mathFeedback=MathCoach.quickHint(PracticeEngine.current(c));save();render();return}
 if(action==='practiceAnswer'){if(PracticeEngine.answer(c,+parts[1])){mathFeedback=null;mathInput='';mathMistakes=0;mathShowChoices=false;save();render()}return}
 if(action==='practiceNext'){
  if(PracticeEngine.advance(c)){mathFeedback=null;mathMistakes=0;mathInput='';mathPrereq=null;mathShowChoices=false;if(c.finished){finishPractice();route='practiceBilan'}save();render()}
  return;
 }
 if(action==='practiceReset'){const id=c.topicId;mathInput='';mathFeedback=null;mathMistakes=0;mathPrereq=null;mathShowChoices=false;state.practiceChallenge=null;source='libre';activeId=id;route='exercice';save();render();return}
}


function handleMath(kind){
 const c=state.practiceChallenge,q=PracticeEngine.current(c),topic=findExercise(c?.topicId);
 if(!c||!q||topic?.subject!=='Maths'||c.answers.some(a=>a.atIndex===c.cursor))return;
 const input=document.getElementById('math-input');
 if(input)mathInput=input.value;
 if(kind==='mathShowChoices'){c.hintShown=true;mathShowChoices=true;mathFeedback='Tu peux maintenant choisir parmi les propositions.';save();render();return}
 if(kind==='mathCheck'){
  const result=MathCoach.check(q,mathInput);
  if(!result.valid){mathFeedback=result.reason;render();return}
  if(result.correct){
   if(PracticeEngine.answer(c,q.answer)){const recorded=c.answers[c.answers.length-1];recorded.mode='saisie';recorded.assisted=Boolean(c.hintShown||mathMistakes>0);save();render()}
   return;
  }
  mathMistakes++;
  c.hintShown=true;
  const help=mathMistakes>=2?MathCoach.workedExample(q):MathCoach.quickHint(q);
  mathFeedback=(result.reason||'Réessaie.')+' '+help;
  if(mathMistakes>=3){mathShowChoices=true;mathFeedback+=' Tu peux choisir parmi les propositions ou passer à une autre question.'}
  save();render();return;
 }
 if(kind==='mathSkip'){
  const wrong=q.options.findIndex((_,i)=>i!==q.answer);
  c.hintShown=true;
  if(PracticeEngine.answer(c,wrong)){mathFeedback=null;save();render()}
  return;
 }
 if(kind==='mathPrereq'){
  mathPrereq=c.topicId;mathFeedback=null;render();return;
 }
 if(kind==='mathPrereqClose'){mathPrereq=null;mathFeedback=null;render();return}
 if(kind==='mathPrereqCheck'){
  const result=MathCoach.checkPrerequisite(c.topicId,document.getElementById('math-prereq')?.value||'');
  mathFeedback=result.reason||'';
  if(result.valid&&result.correct)mathPrereq=null;
  render();return;
 }
}


function mathJourneyView(topic){
 const c=state.mathJourney?.topicId===topic.id?state.mathJourney:null;
 if(!c||c.finished){
  const suggested=MathJourney.suggestedLevel(state,topic.id);
  const labels=MathJourney.LEVELS;
  return head('Maths · Parcours 4e',topic.topic,topic.subtitle)
   +card('<p class="muted">Trois niveaux courts. Tu peux refaire chaque niveau ou passer à un autre.</p>'
   +labels.map(level=>'<div class="journey-level"><b>'+esc(level.label)+'</b><p class="muted">'+esc(level.description)+'</p>'
     +btn(level.id===suggested?'Commencer ici':'Essayer ce niveau','journeyStart:'+topic.id+':'+level.id,level.id===suggested?'':'secondary')+'</div>').join(''));
 }
 const q=MathJourney.current(c),done=c.answers.find(x=>x.atIndex===c.cursor);
 if(!q)return head('Maths','Parcours terminé')+card(btn('Voir mon bilan','journeyNext'));
 const level=MathJourney.LEVELS.find(x=>x.id===c.level);
 return head('Maths · '+esc(level.label),topic.topic,'Étape '+(c.cursor+1)+' sur '+c.questions.length)
 +card('<span class="pill">'+esc(level.label)+'</span>'
 +(q.context?'<p class="muted">'+esc(q.context)+'</p>':'')
 +'<h2>'+esc(q.question)+'</h2>'
 +(done?'<div class="feedback">'+(done.skipped?'Tu pourras y revenir.':done.assisted?'Réponse retrouvée avec aide.':'Réponse trouvée sans aide.')
    +'<p>'+esc(q.method)+'</p><p><b>Réponse : '+esc(q.expectedDisplay)+'</b></p></div><div class="actions">'+btn('Étape suivante','journeyNext')+'</div>'
 :'<label class="field-label" for="journey-input">Ma réponse</label><input id="journey-input" type="text" inputmode="decimal" autocomplete="off" value="'+esc(c.draft||'')+'" placeholder="Nombre ou fraction (ex. 3/4)">'
    +(c.feedback?'<div class="feedback" role="status">'+esc(c.feedback)+'</div>':'')
    +(c.hintShown?'<p class="muted">Indice : '+esc(q.hint)+'</p>':'')
    +'<div class="actions">'+btn('Vérifier','journeyCheck')+btn('Un indice','journeyHint','secondary')+btn('Passer','journeySkip','outline')+'</div><div class="actions">'+btn('Faire une pause','nav:matieres','outline')+'</div>'));
}
function journeyEnd(){
 const c=state.mathJourney;if(!c)return home();
 const summary=MathJourney.summary(c),topic=findExercise(c.topicId);
 return head('Maths','Ton niveau est terminé','L’objectif est de comprendre la méthode, pas d’aller vite.')
 +card('<h2>'+summary.correct+' réponses trouvées sur '+summary.total+'</h2><p>'+summary.autonomous+' sans aide · '+summary.helped+' avec aide · '+summary.skipped+' passée(s)</p>'
 +'<p class="muted">'+(summary.successful?'Tu peux découvrir le niveau suivant.':'Tu peux refaire ce niveau avec de nouveaux nombres.')+'</p>'
 +'<div class="actions">'+btn('Continuer le parcours','journeyReset')+btn('Retour aux matières','nav:matieres','outline')+'</div>');
}
function finishJourney(){
 const c=state.mathJourney;if(!c?.finished||c.recorded)return;
 const score=MathJourney.recordStage(state,c);
 Engine.recordAttempt(state,c.topicId,{correct:score.successful,assisted:!score.successful,kind:'question',source:c.origin});
 if(c.origin==='session'&&state.activeSession&&sessionStep()?.id===c.topicId){
  const wasLast=state.activeSession.cursor===state.activeSession.plan.length-1;
  Engine.finishStep(state,'exercise',c.topicId);
  if(wasLast)lastSummary=state.sessions[state.sessions.length-1];
 }
 save();
}
function handleJourney(parts){
 const kind=parts[0];
 if(kind==='journeyStart'){
  const topic=findExercise(parts[1]),level=parts[2];
  if(topic?.type!=='journey')return;
  state.mathJourney=MathJourney.create(state,topic.id,level,source,state.activeSession?.id||null);
  save();render();return;
 }
 const c=state.mathJourney;if(!c)return;
 if(kind==='journeyReset'){const id=c.topicId;state.mathJourney=null;activeId=id;source='libre';route='exercice';save();render();return}
 if(c.finished)return;
 if(kind==='journeyHint'){c.hintShown=true;c.feedback=MathJourney.current(c)?.hint||'';save();render();return}
 if(kind==='journeyCheck'){
  const input=document.getElementById('journey-input');if(input)c.draft=input.value;
  const result=MathJourney.submit(c,c.draft);
  if(!result.valid)c.feedback=result.reason;
  save();render();return;
 }
 if(kind==='journeySkip'){MathJourney.submit(c,'',true);save();render();return}
 if(kind==='journeyNext'){
  if(MathJourney.advance(c)){if(c.finished){finishJourney();route='journeyBilan'}save();render()}return;
 }
}

function revisions(){
 const list=due();return head('Mémoire','Ce qui revient aujourd’hui','Les rappels sont espacés. Pas de séance à rattraper.')
 +(list.length?list.map(e=>card('<div class="row"><div><h3>'+esc(e.topic)+'</h3><div class="min">'+esc(e.subject)+'</div></div>'+btn('Revoir','exercise:'+e.id)+'</div>')).join('')
 :card('<h2>Rien d’urgent aujourd’hui</h2><p class="muted">Les notions reviendront à intervalles progressivement plus longs.</p>'+btn('Choisir une matière','nav:matieres','secondary')));
}
function progress(){
 const summary=Engine.recap(state,activeExercises);
 const detailed=PersonalizationEngine.report(state,[...ConjugationEngine.TOPICS,...PracticeBank.TOPICS]).filter(x=>x.attempts).slice(0,12);
 return head('Mon chemin','Mes progrès','On cherche à comprendre ce qui devient plus facile, sans comparaison.')
 +card('<div class="grid"><div><div class="eyebrow">Histoires découvertes</div><h1>'+summary.readings+'</h1></div><div><div class="eyebrow">Séances terminées</div><h1>'+summary.sessions+'</h1></div><div><div class="eyebrow">Réussites autonomes</div><h1>'+summary.independentSuccesses+'</h1></div><div><div class="eyebrow">Réussites avec aide</div><h1>'+summary.assistedSuccesses+'</h1></div></div>')
 +card('<h2>Compétences travaillées</h2>'+(detailed.length?detailed.map(x=>'<div class="row"><div><b>'+esc(x.title)+'</b><div class="min">'+x.independent+' sans indice · '+x.errors+' erreurs'+(x.weak.length?' · À revoir : '+esc(x.weak.map(w=>w.label).join(', ')):'')+'</div></div><span class="pill">'+esc(x.status.label)+'</span></div>').join(''):'<p class="muted">Les compétences apparaîtront après tes premiers défis.</p>'))
 +card('<h2>Les notions en chemin</h2>'+activeExercises.filter(e=>state.reviews[e.id]).map(e=>{
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
 matieres:subjects,matiere:subjectPage,exercice:exercise,revisions,progres:progress,resultat:resultView,fin:endView,conjugaisonBilan:conjugationEnd,practiceBilan:practiceEnd,journeyBilan:journeyEnd};
 root.innerHTML=(pages[route]||home)();
 document.querySelectorAll('.bottom button').forEach(b=>b.classList.toggle('active',b.dataset.nav===route));
 document.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',()=>handle(el.dataset.action)));
 const input=document.getElementById('journey-input');
 if(input)input.addEventListener('input',()=>{if(state.mathJourney&&!state.mathJourney.finished){state.mathJourney.draft=input.value.slice(0,100);save()}});
 const conjugationField=document.getElementById('conjugation-input');
 if(conjugationField)conjugationField.addEventListener('input',()=>{if(state.challenge&&!state.challenge.finished){state.challenge.draft=conjugationField.value.slice(0,100);save()}});
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
 if(e.type==='dictation'||e.type==='challenge'||e.type==='practice'||e.type==='journey')return;
 const probing=mode==='probe',correct=index===(probing?e.probeAnswer:e.answer);
 const origin=source==='session'?'session':'libre';
 if(probing)questionHelped=true;
 Engine.recordAttempt(state,e.id,{correct,assisted:questionHelped,kind:probing?'probe':'question',source:origin});
 if(!correct){questionHelped=true;if(source==='session' && state.activeSession)state.activeSession.assistedItems[e.id]=true;}
 save();
 feedbackView={id:e.id,correct,message:(correct?(questionHelped?'Tu as réussi avec un indice. ':'Tu as réussi seule. '):'Cette réponse ne convient pas encore. ')+e.why,
 continue:source==='session'&&correct&&!probing,probing};
 route='resultat';render();
}
function handle(raw){
 const p=raw.split(':'),kind=p[0],id=p[1];
 if(kind==='nav'){if(route==='texte')saveReadingBookmark();route=id;if(id==='fin'&&!lastSummary)lastSummary=state.sessions[state.sessions.length-1]||null;render();return}
 if(kind==='duration'){if(!state.activeSession && Engine.DURATIONS.includes(+id)){state.duration=+id;save()}render();return}
 if(kind==='start'){Engine.beginSession(state,activeExercises,readings);save();route='seance';render();return}
 if(kind==='resume'){route='seance';render();return}
 if(kind==='doStep'){goSessionStep();return}
 if(kind==='nextStep'){finishCurrentStep();return}
 if(kind==='endSession'){lastSummary=Engine.endSession(state,{partial:true});save();route='fin';render();return}
 if(kind==='exercise'){openExercise(p.slice(1).join(':'));return}
 if(kind==='subject'){currentSubject=p.slice(1).join(':');route='matiere';render();return}
 if(kind==='readerSize'||kind==='readerTheme'){
  saveReadingBookmark();
  if(kind==='readerSize')state.readerSettings.size=state.readerSettings.size==='grand'?'normal':'grand';
  else state.readerSettings.theme=state.readerSettings.theme==='doux'?'clair':'doux';
  save();render();restoreReadingBookmark();return;
 }
 if(kind==='read'){openReading(id);return}
 if(kind==='define'){const r=findReading(id),w=(r?.words||[{term:r?.word,definition:r?.definition}])[Number(p[2]||0)],el=document.getElementById('wordbox');if(w&&el)el.innerHTML='<div class="feedback"><b>'+esc(w.term)+'</b> — '+esc(w.definition)+'</div>';return}
 if(kind==='readDone'){
  saveReadingBookmark();
  state.readingBookmarks[id]=0;
  readingSessionCompleted=false;
  Engine.recordReading(state,id,{source:source==='session'?'session':'libre'});
  if(source==='session'&&sessionStep()?.kind==='reading'&&sessionStep()?.id===id){
    // Lecture terminée : la prochaine étape est seulement proposée après réflexion.
    readingSessionCompleted=true;
    const final=state.activeSession.cursor===state.activeSession.plan.length-1;
    Engine.finishStep(state,'reading',id);
    if(final){lastSummary=state.sessions[state.sessions.length-1];source='libre'}
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
 if(kind.startsWith('practice')){handlePractice(p);return}
 if(kind.startsWith('journey')){handleJourney(p);return}
 if(kind.startsWith('math')){handleMath(kind);return}
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
