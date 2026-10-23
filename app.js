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
exercises.push(...orthography.questions,...orthography.dictations,...ConjugationEngine.TOPICS,...PracticeBank.TOPICS,...MathJourney.TOPICS,...FrenchPaths.TOPICS);
// Anciennes questions uniques conservées uniquement pour les progrès et les séances déjà commencées.
// Les nouvelles séances et le catalogue exposent les parcours multiquestions et les dictées.
const activeExercises=exercises.filter(e=>['dictation','challenge','practice','journey','frenchPath'].includes(e.type)||e.subject==='Histoire-géo');
let stored=null,legacy=null;
try{stored=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}
try{legacy=JSON.parse(localStorage.getItem(LEGACY)||'null')}catch{}
const state=Engine.normalizeState(stored,legacy);
state.conjugationHistory=Array.isArray(stored?.conjugationHistory)?stored.conjugationHistory:[];
state.practiceHistory=Array.isArray(stored?.practiceHistory)?stored.practiceHistory:[];
state.mathJourneyHistory=Array.isArray(stored?.mathJourneyHistory)?stored.mathJourneyHistory:[];
state.mathJourneyProgress=stored?.mathJourneyProgress&&typeof stored.mathJourneyProgress==='object'?stored.mathJourneyProgress:{};
state.mathJourney=stored?.mathJourney&&MathJourney.TOPICS.some(t=>t.id===stored.mathJourney.topicId)?stored.mathJourney:null;
state.notebook=NotebookEngine.hydrate(stored?.notebook);
state.readingFavorites=Array.isArray(stored?.readingFavorites)?stored.readingFavorites.filter(id=>readings.some(r=>r.id===id)):[];
state.readingBookmarks=stored?.readingBookmarks&&typeof stored.readingBookmarks==='object'?stored.readingBookmarks:{};
state.frenchPathHistory=Array.isArray(stored?.frenchPathHistory)?stored.frenchPathHistory:[];
state.frenchPath=stored?.frenchPath&&FrenchPaths.TOPICS.some(x=>x.id===stored.frenchPath.topicId)?stored.frenchPath:null;
state.readerSettings=stored?.readerSettings&&typeof stored.readerSettings==='object'?stored.readerSettings:{size:'normal',theme:'clair'};
const personalizationMigrated=PersonalizationEngine.hydrate(state,{conjugation:ConjugationEngine,practice:PracticeBank});
state.practiceChallenge=stored?.practiceChallenge&&PracticeBank.TOPICS.some(t=>t.id===stored.practiceChallenge.topicId)?stored.practiceChallenge:null;
state.challenge=stored?.challenge&&Array.isArray(stored.challenge.questions)&&ConjugationEngine.TOPICS.some(t=>t.id===stored.challenge.topicId)?stored.challenge:null;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{saveError=true}};
let saveError=false;
if(!stored||personalizationMigrated)save();
const root=document.getElementById('app');
let route='accueil',activeId=null,mode='question',currentSubject='Français',readId=null;
let notebookEditId=null,notebookError='';
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
 if(state.readingBookmarks[readId]!==index){state.readingBookmarks[readId]=index;save();const progress=document.getElementById('reader-progress');if(progress){const pct=Math.round(100*index/paragraphs.length);progress.setAttribute('aria-valuenow',String(pct));const bar=progress.querySelector('span');if(bar)bar.style.width=pct+'%'}}
}
window.addEventListener('scroll',saveReadingBookmark,{passive:true});
function goSessionStep(){
 const step=sessionStep();
 if(!step){route='accueil';render();return}
 if(step.kind==='reading')openReading(step.id,'session');
 else { const c=findExercise(step.id);if(c?.type==='frenchPath'&&state.frenchPath?.topicId===step.id&&!state.frenchPath.finished){openExercise(step.id,'session');return}if(c?.type==='journey'&&state.mathJourney?.topicId===step.id&&state.mathJourney.sessionId===state.activeSession.id&&!state.mathJourney.finished){openExercise(step.id,'session');return}if(c?.type==='practice'&&state.practiceChallenge?.topicId===step.id&&state.practiceChallenge.sessionId===state.activeSession.id&&!state.practiceChallenge.finished){openExercise(step.id,'session');return}if(c?.type==='challenge'&&state.challenge?.topicId===step.id&&state.challenge.sessionId===state.activeSession.id&&!state.challenge.finished){openExercise(step.id,'session');return}openExercise(step.id,'session',Boolean(state.activeSession.assistedItems[step.id]));}
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
 const next=readings.find(r=>state.readingBookmarks?.[r.id]>0&&!state.reading.some(x=>x.id===r.id))||readings.find(r=>!state.reading.some(x=>x.id===r.id))||readings[0];
 const bk=state.readingBookmarks?.[next.id]||0;
 return '<section class="welcome"><span class="welcome-kicker">TON PETIT UNIVERS ✦</span><h1>Un petit moment <em>pour toi.</em></h1><p>Une histoire, une découverte, ou juste cinq minutes pour progresser. C’est toi qui choisis.</p><span class="welcome-star" aria-hidden="true">✦</span></section>'
 +'<section class="feature-story"><div class="feature-art" aria-hidden="true"><div class="art-moon"></div><div class="art-book"></div><span class="art-star">✦</span></div><div class="feature-info"><span class="eyebrow">'+(bk?'TA LECTURE EN COURS':'UNE HISTOIRE POUR TOI')+'</span><h2>'+esc(next.title)+'</h2><p class="muted">'+(next.seriesId?'Académie Solstice · Épisode '+next.episode:'Une histoire à découvrir')+' · Environ '+next.time+' min</p>'+btn(bk?'Reprendre mon histoire':'Ouvrir mon histoire','read:'+next.id)+'</div></section>'
 +'<section class="home-choices"><h2>Qu’est-ce qui te tente ?</h2><div class="home-choice-grid"><button class="choice-tile tile-read" data-action="nav:lecture"><span class="tile-symbol" aria-hidden="true">☾</span><strong>M’évader</strong><span>Histoires et découvertes</span></button><button class="choice-tile tile-study" data-action="nav:matieres"><span class="tile-symbol" aria-hidden="true">✎</span><strong>M’entraîner</strong><span>Français, maths et défis</span></button></div></section>'
 +(state.activeSession?sessionHome():card('<div class="row"><div><span class="eyebrow">À MON RYTHME</span><h2>Ma petite séance</h2><p class="muted">Un parcours sans chrono, sans pression.</p></div><span class="pill">À ton rythme</span></div><div class="actions">'+[5,10,15].map(x=>btn(x+' min','duration:'+x,state.duration===x?'':'secondary')).join('')+'</div><div class="actions">'+btn('Commencer ma séance','start')+'</div>','session-panel'))
 +'<section class="small-discoveries"><div class="mini-discovery"><span aria-hidden="true">✧</span><div><strong>Une petite découverte</strong><p>« Le vent chuchotait. » Une personnification à retrouver.</p></div>'+btn('Explorer','exercise:fp-figures','secondary')+'</div><div class="mini-discovery"><span aria-hidden="true">↻</span><div><strong>À retrouver en douceur</strong><p>'+(n?n+' notion(s) à revoir aujourd’hui.':'Rien d’urgent aujourd’hui.')+'</p></div>'+btn('Mes rappels','nav:revisions','secondary')+'</div></section>'
 +(suggestions.length?card('<h2>Des idées pour progresser</h2>'+suggestions.slice(0,2).map(x=>'<div class="row"><div><b>'+esc(x.title)+'</b><div class="min">'+esc(x.reason)+'</div></div>'+btn('Essayer','exercise:'+x.id,'secondary')+'</div>').join('')):'')
 +'<p class="muted home-footnote">Reviens quand tu veux. Il n’y a rien à rattraper.</p>'+actionRow();
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
function readingProgress(t){
 const paragraphs=t.text.split(/\n\s*\n/).length;
 const complete=state.reading.some(x=>x.id===t.id);
 const position=complete?paragraphs:Math.max(0,Math.min(paragraphs-1,Number(state.readingBookmarks?.[t.id]||0)));
 return {paragraphs,position,percent:Math.round(100*position/paragraphs),complete};
}
function library(){
 const series=readings.filter(r=>r.seriesId==='solstice'),rest=readings.filter(r=>r.seriesId!=='solstice');
 const fav=new Set(state.readingFavorites||[]);
 const ongoing=readings.filter(r=>state.readingBookmarks?.[r.id]>0&&!state.reading.some(x=>x.id===r.id));
 const active=ongoing[0];
 function entry(r){
  const p=readingProgress(r),favorite=fav.has(r.id),bookmark=state.readingBookmarks?.[r.id]||0;
  return '<article class="story-tile"><div class="story-tile-art '+(r.seriesId?'solstice-art':'other-art')+'" aria-hidden="true"><span>'+(r.seriesId?'✦':r.genre==='Musique'?'♫':r.genre==='Découverte'?'☼':'✎')+'</span></div><div class="story-tile-body"><div class="story-meta"><span class="pill">'+(r.seriesId?'Épisode '+r.episode+'/'+series.length:esc(r.genre))+'</span><button class="favorite-btn'+(favorite?' is-favorite':'')+'" aria-label="'+(favorite?'Retirer des favoris : ':'Ajouter aux favoris : ')+esc(r.title)+'" aria-pressed="'+favorite+'" data-action="readingFavorite:'+r.id+'">'+(favorite?'♥':'♡')+'</button></div><h3>'+esc(r.title)+'</h3><p class="muted">Environ '+r.time+' min'+(p.complete?' · Lu':bookmark?' · En cours':'')+'</p>'+(bookmark&&!p.complete?'<div class="reading-progress" aria-label="Lecture reprise au paragraphe '+(bookmark+1)+' sur '+p.paragraphs+'"><span style="width:'+p.percent+'%"></span></div>':'')+btn(bookmark&&!p.complete?'Reprendre':p.complete?'Relire':'Découvrir','read:'+r.id,'secondary')+'</div></article>';
 }
 const preferred=readings.filter(r=>fav.has(r.id));
 const next=series.find(r=>!state.reading.some(x=>x.id===r.id))||series[0];
 const finished=series.filter(r=>state.reading.some(x=>x.id===r.id)).length;
 return head('TON COIN LECTURE','Des histoires à savourer','Choisis une aventure, garde tes préférées et lis à ton rythme. Aucun questionnaire obligatoire.')
 +(active?'<section class="library-section reading-continue"><span class="eyebrow">EN COURS</span><h2>Reprendre ma lecture</h2>'+entry(active)+'</section>':'')
 +(preferred.length?'<section class="library-section"><h2>Mes histoires préférées</h2><div class="story-grid">'+preferred.filter(r=>r.id!==active?.id).map(entry).join('')+'</div></section>':'')
 +'<section class="library-section"><span class="eyebrow">MA SÉRIE</span><h2>Les secrets de l’Académie Solstice</h2><p class="muted">Amitié, magie douce, musique et mystères. '+finished+' épisode(s) lu(s) sur '+series.length+'.</p><div class="reading-progress series-progress" aria-label="'+finished+' épisodes lus sur '+series.length+'"><span style="width:'+Math.round(100*finished/series.length)+'%"></span></div><div class="episode-strip">'+series.map(r=>'<button data-action="read:'+r.id+'" class="episode-chip'+(state.reading.some(x=>x.id===r.id)?' read':'')+'" aria-label="Épisode '+r.episode+' : '+esc(r.title)+'">'+r.episode+'</button>').join('')+'</div><div class="story-grid">'+series.filter(r=>r.id!==active?.id).map(entry).join('')+'</div>'+(active&&active.seriesId==='solstice'?'<p class="muted">Ton épisode en cours figure juste au-dessus.</p>':'')+'</section>'
 +'<section class="library-section"><span class="eyebrow">D’AUTRES UNIVERS</span><h2>Histoires indépendantes</h2><div class="story-grid">'+rest.filter(r=>r.id!==active?.id).map(entry).join('')+'</div></section>';
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
 const progressPct=Math.round(100*Math.max(0,Math.min(paragraphs.length-1,Number(state.readingBookmarks?.[t.id]||0)))/paragraphs.length);
 return head(t.genre,t.title,'Lis à ton rythme. Les mots soulignés peuvent être expliqués.')
 +'<div class="reader-context"><span class="pill">'+(t.seriesId?'Académie Solstice · Épisode '+t.episode+'/4':esc(t.genre))+'</span><span class="muted">Environ '+t.time+' min</span></div><div class="reading-progress reader-progress" id="reader-progress" role="progressbar" aria-label="Progression de lecture" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+progressPct+'"><span style="width:'+progressPct+'%"></span></div>'
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
function subjects(){
 const list=[['Français','Lire, écrire et apprivoiser les mots','✎','subject-french'],['Maths','Comprendre une étape après l’autre','◇','subject-maths'],['Histoire-géo','Explorer d’autres époques et lieux','◉','subject-history']];
 return head('MON ATELIER','Choisis ce qui t’intéresse','Chaque activité se fait à ton rythme.')
 +'<div class="subject-grid">'+list.map(([name,description,symbol,klass])=>'<button class="subject-tile '+klass+'" data-action="subject:'+name+'"><span class="subject-symbol" aria-hidden="true">'+symbol+'</span><span class="subject-details"><strong>'+name+'</strong><span>'+description+'</span><small>'+activeExercises.filter(x=>x.subject===name).length+' activités disponibles</small></span><span aria-hidden="true">↗</span></button>').join('')+'</div>';
}
function activityCard(e){
 const types={
  frenchPath:{name:'3 étapes',description:'Observer, s’entraîner, puis écrire quelques phrases.',action:'Découvrir le parcours'},
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
  return head('Mes matières','Français','Grammaire, écriture et lectures à ton rythme.')
   +subjectSection('Comprendre et écrire','Six parcours progressifs avec rédaction facultative.',items.filter(e=>e.type==='frenchPath'))
   +subjectSection('Orthographe','Accords, homophones et règles à retrouver.',items.filter(e=>e.type==='practice'))
   +subjectSection('Choisis ton temps de conjugaison','Présent, imparfait, futur simple ou passé composé. Tu peux aussi mélanger les temps.',items.filter(e=>e.type==='challenge'))
   +subjectSection('Mini-dictées','Une phrase complète à écouter puis à écrire.',items.filter(e=>e.type==='dictation'))
   +card('<h2>Pour retrouver un mot ou un auteur</h2><div class="actions">'+btn('Petit lexique','frenchLexicon','secondary')+btn('Quelques auteurs','frenchAuthors','secondary')+'</div>');
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
 if(e.type==='frenchPath')return frenchPathView(e);
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


function frenchPathView(topic){
 const c=state.frenchPath?.topicId===topic.id?state.frenchPath:null;
 if(!c||c.finished)return head('Français · Parcours',topic.topic,'Observer, s’entraîner, puis écrire librement.')
 +card('<p class="muted">Deux petites questions pour comprendre, puis une activité d’écriture facultative. Aucun texte rédigé n’est noté automatiquement.</p>'
 +'<p><b>Repère :</b> '+esc(FrenchPaths.TOPICS.find(t=>t.id===topic.id)?.tag||'Français')+'</p>'
 +btn('Commencer les trois étapes','frenchStart:'+topic.id))
 +card('<p class="muted">Tu peux aussi consulter les repères sans exercice.</p>'+btn('Petit lexique','frenchLexicon','secondary')+btn('Quelques auteurs','frenchAuthors','outline'));
 const q=FrenchPaths.current(c),ans=c.answers.find(x=>x.step===c.cursor);
 if(!q)return head('Français','Parcours terminé')+card(btn('Voir le bilan','frenchNext'));
 const row=head(topic.tag,topic.topic,q.level.label+' · étape '+(c.cursor+1)+'/3');
 if(ans)return row+card('<h2>'+(q.kind==='writing'?'Ton texte est conservé':'La réponse expliquée')+'</h2>'
 +(q.kind==='writing'&&ans.completed?'<p class="writing-saved">'+esc(ans.text)+'</p>':'')
 +'<div class="feedback">'+esc(c.feedback||'Tu as avancé dans ce parcours.')+'</div>'
 +(q.kind==='writing'?'<p class="muted">Exemple possible : '+esc(q.example)+'</p><p class="muted">Il existe plusieurs réponses valables.</p>':'<p><b>'+esc(q.explanation)+'</b></p>')
 +btn('Continuer','frenchNext'));
 if(q.kind==='writing')return row+card('<h2>'+esc(q.prompt)+'</h2><p class="muted">Deux à cinq phrases suffisent. Ce texte ne sera pas évalué automatiquement.</p>'
 +'<label class="field-label" for="french-writing">Mon petit texte</label><textarea id="french-writing" rows="5" maxlength="1200" placeholder="Je raconte, je décris, je reformule…">'+esc(c.draft||'')+'</textarea>'
 +(c.feedback?'<div class="feedback" role="status">'+esc(c.feedback)+'</div>':'')
 +'<div class="writing-checklist"><b>Pour me relire :</b>'+q.checklist.map(x=>'<p>□ '+esc(x)+'</p>').join('')+'</div>'
 +'<div class="actions">'+btn('Conserver mon texte','frenchWrite')+btn('Voir un exemple','frenchExample','secondary')+btn('Passer','frenchSkip','outline')+'</div>'
 +'<div class="actions">'+btn('Faire une pause','nav:matieres','outline')+'</div>');
 return row+card('<h2>'+esc(q.question)+'</h2><div class="choices">'+q.options.map((x,i)=>'<button class="choice" data-action="frenchAnswer:'+i+'">'+esc(x)+'</button>').join('')+'</div>'
 +(c.feedback?'<div class="feedback" role="status">'+esc(c.feedback)+'</div>':'')
 +'<div class="actions">'+btn('Un indice','frenchHint','secondary')+btn('Faire une pause','nav:matieres','outline')+'</div>');
}
function frenchEnd(){
 const c=state.frenchPath;if(!c)return subjects();
 const s=FrenchPaths.summary(c);
 return head('Français','Ton parcours est terminé','Les textes écrits sont des essais, pas des notes.')
 +card('<h2>'+s.correct+' réponse(s) sur '+s.questions+'</h2><p>'+(s.written?'Tu as aussi produit un petit texte.':'L’écriture pourra attendre une prochaine fois.')+'</p>'
 +'<div class="actions">'+btn('Choisir un autre parcours','nav:matieres')+btn('Recommencer','frenchReset','secondary')+'</div>');
}
function frenchLexique(){
 const groups=[...new Set(FrenchPaths.LEXICON.map(x=>x.category))];
 return head('Français','Mon petit lexique','Des mots utiles à retrouver quand tu en as besoin.')
 +groups.map(g=>card('<h2>'+esc(g)+'</h2>'+FrenchPaths.LEXICON.filter(x=>x.category===g).map(x=>'<div class="reference-entry"><b>'+esc(x.term)+'</b><p>'+esc(x.definition)+'</p><p class="muted">Exemple : '+esc(x.example)+'</p></div>').join(''))).join('')
 +card(btn('Retour au français','subject:Français'));
}
function frenchAuteurs(){
 return head('Français','Quelques auteurs à découvrir','Des repères facultatifs, à relier aux cours étudiés.')
 +FrenchPaths.AUTHORS.map(x=>card('<h2>'+esc(x.name)+'</h2><p class="muted">'+esc(x.genre)+'</p><p><b>Une œuvre :</b> '+esc(x.work)+'</p><p>'+esc(x.essential)+'</p>')).join('')
 +card(btn('Retour au français','subject:Français'));
}
function handleFrench(parts){
 const kind=parts[0];
 if(kind==='frenchLexicon'){route='lexique';render();return}
 if(kind==='frenchAuthors'){route='auteurs';render();return}
 if(kind==='frenchStart'){
  const topic=parts.slice(1).join(':');
  state.frenchPath=FrenchPaths.create(state,topic,source,state.activeSession?.id||null);
  activeId=topic;save();render();return;
 }
 const c=state.frenchPath;if(!c)return;
 if(kind==='frenchReset'){activeId=c.topicId;state.frenchPath=null;route='exercice';save();render();return}
 if(c.finished)return;
 const q=FrenchPaths.current(c);
 if(kind==='frenchAnswer'){if(FrenchPaths.select(c,+parts[1]).valid){save();render()}return}
 if(kind==='frenchHint'){c.hintShown=true;c.feedback=q?.kind==='choice'?'Observe les mots importants, puis élimine une proposition.':'';save();render();return}
 if(kind==='frenchExample'){c.feedback='Un exemple possible : '+q.example;save();render();return}
 if(kind==='frenchWrite'||kind==='frenchSkip'){
  if(kind==='frenchWrite'){const input=document.getElementById('french-writing');if(input)c.draft=input.value.slice(0,1200)}
  const res=FrenchPaths.saveWriting(c,c.draft,kind==='frenchSkip');
  if(!res.valid)c.feedback=res.reason;
  save();render();return;
 }
 if(kind==='frenchNext'){
  if(FrenchPaths.advance(c)){if(c.finished){FrenchPaths.record(state,c);route='frenchBilan'}save();render()}return;
 }
}

function notebook(){
 const notes=[...state.notebook.notes].sort((a,b)=>b.updated-a.updated);
 const kept=readings.filter(r=>state.readingFavorites.includes(r.id));
 const pieces=state.frenchPathHistory.filter(x=>x.written).length;
 return head('MON PETIT MONDE','Mon carnet','Mes mots, mes histoires et mes idées. Tout reste sur cet appareil.')
 +'<section class="notebook-intro"><span aria-hidden="true">✎</span><div><h2>Un endroit rien qu’à toi</h2><p>Tu peux écrire, modifier et supprimer tes pages. Personne ne les reçoit automatiquement.</p></div></section>'
 +'<div class="notebook-tabs"><a href="#carnet-pages">Mes pages</a><a href="#carnet-mots">Mes mots</a><a href="#carnet-histoires">Mes histoires</a></div>'
 +'<section id="carnet-pages" class="notebook-section"><div class="row"><h2>Mes pages</h2><span class="pill">'+notes.length+' page(s)</span></div>'
 +card('<h3>'+(notebookEditId?'Modifier ma page':'Une nouvelle page')+'</h3><label class="field-label" for="notebook-title">Mon titre</label><input id="notebook-title" maxlength="100" placeholder="Un titre qui me ressemble…" value="'+esc(notes.find(n=>n.id===notebookEditId)?.title||'')+'"><label class="field-label" for="notebook-text">Mes idées</label><textarea id="notebook-text" rows="5" maxlength="3500" placeholder="Une scène, un souvenir, une idée, quelques phrases…">'+esc(notes.find(n=>n.id===notebookEditId)?.text||'')+'</textarea><p class="muted">Sans note ni correction automatique. Ton texte est privé sur ce navigateur.</p>'+'<p id="notebook-error" class="notebook-error" role="status">'+esc(notebookError)+'</p>'+'<div class="actions">'+btn(notebookEditId?'Enregistrer les modifications':'Garder cette page','notebookSave')+(notebookEditId?btn('Annuler','notebookCancel','outline'):'')+'</div>')
 +(notes.length?notes.map(n=>card('<div class="row"><div><h3>'+esc(n.title)+'</h3><p class="notebook-note-text">'+esc(n.text)+'</p></div></div><div class="actions">'+btn('Modifier','notebookEdit:'+n.id,'secondary')+btn('Supprimer','notebookDelete:'+n.id,'outline')+'</div>')).join(''):'<p class="muted">Ton carnet est encore vierge. Tu peux y déposer une première idée.</p>')
 +'</section><section id="carnet-mots" class="notebook-section"><div class="row"><h2>Mes mots préférés</h2><span class="pill">'+state.notebook.words.length+' mot(s)</span></div><p class="muted">Touche un mot souligné pendant une lecture, puis choisis « Garder ce mot ».</p>'
 +(state.notebook.words.length?state.notebook.words.map(x=>card('<h3>'+esc(x.term)+'</h3><p>'+esc(x.definition)+'</p><div class="actions">'+btn('Retirer ce mot','notebookRemoveWord:'+encodeURIComponent(x.key),'outline')+'</div>')).join(''):'<p class="muted">Aucun mot conservé pour le moment.</p>')
 +'</section><section id="carnet-histoires" class="notebook-section"><div class="row"><h2>Mes histoires favorites</h2><span class="pill">'+kept.length+' histoire(s)</span></div>'
 +(kept.length?kept.map(r=>card('<h3>'+esc(r.title)+'</h3><div class="actions">'+btn('Lire cette histoire','read:'+r.id,'secondary')+'</div>')).join(''):'<p class="muted">Dans la bibliothèque, touche le cœur d’une histoire pour la retrouver ici.</p>')
  +card('<h3>Mes essais d’écriture</h3><p class="muted">'+pieces+' activité(s) d’écriture terminée(s) dans les parcours de français.</p><p class="muted">Les textes des exercices ne sont pas copiés automatiquement dans le carnet. Tu peux recopier ici ceux que tu souhaites garder.</p>')
 +'</section>';
}
function handleNotebook(parts){
 const kind=parts[0],id=parts.slice(1).join(':');
 if(kind==='notebookCancel'){notebookEditId=null;notebookError='';render();return}
 if(kind==='notebookEdit'){if(state.notebook.notes.some(x=>x.id===id)){notebookEditId=id;notebookError='';route='carnet';render();document.getElementById('notebook-title')?.focus()}return}
 if(kind==='notebookDelete'){if(state.notebook.notes.some(x=>x.id===id)){notebookEditId=id;notebookError='';route='carnetSuppression';render()}return}
 if(kind==='notebookConfirmDelete'){if(NotebookEngine.removeNote(state.notebook,id)){notebookEditId=null;save()}route='carnet';render();return}
 if(kind==='notebookNoDelete'){route='carnet';render();return}
 if(kind==='notebookRemoveWord'){const key=decodeURIComponent(id);state.notebook.words=state.notebook.words.filter(x=>x.key!==key);save();render();return}
 if(kind==='notebookSave'){
  const title=document.getElementById('notebook-title')?.value||'',body=document.getElementById('notebook-text')?.value||'';
  const r=NotebookEngine.saveNote(state.notebook,notebookEditId,title,body);
  if(!r.ok){notebookError=r.reason;const el=document.getElementById('notebook-error');if(el)el.textContent=notebookError;else alert(notebookError);return}
  notebookEditId=null;notebookError='';save();render();return
 }
}
function notebookDeleteView(){
 return head('MON CARNET','Supprimer cette page ?','Cette suppression ne pourra pas être annulée.')
 +card('<p>Veux-tu vraiment supprimer cette page de ton carnet ?</p><div class="actions">'+btn('Non, la conserver','notebookNoDelete','secondary')+btn('Oui, supprimer','notebookConfirmDelete:'+esc(notebookEditId||''),'outline')+'</div>');
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
 matieres:subjects,matiere:subjectPage,exercice:exercise,revisions,progres:progress,carnet:notebook,carnetSuppression:notebookDeleteView,resultat:resultView,fin:endView,conjugaisonBilan:conjugationEnd,practiceBilan:practiceEnd,journeyBilan:journeyEnd,frenchBilan:frenchEnd,lexique:frenchLexique,auteurs:frenchAuteurs};
 root.innerHTML=(pages[route]||home)();
 document.querySelectorAll('.bottom button').forEach(b=>b.classList.toggle('active',b.dataset.nav===route||(b.dataset.nav==='matieres'&&['matiere','exercice','frenchBilan','lexique','auteurs','conjugaisonBilan','practiceBilan','journeyBilan'].includes(route))||(b.dataset.nav==='lecture'&&['texte','apreslecture','lecturequiz'].includes(route))));
 document.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',()=>handle(el.dataset.action)));
 const input=document.getElementById('journey-input');
 if(input)input.addEventListener('input',()=>{if(state.mathJourney&&!state.mathJourney.finished){state.mathJourney.draft=input.value.slice(0,100);save()}});
 const writing=document.getElementById('french-writing');
 if(writing)writing.addEventListener('input',()=>{if(state.frenchPath&&!state.frenchPath.finished){state.frenchPath.draft=writing.value.slice(0,1200);save()}});
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
 if(e.type==='dictation'||e.type==='challenge'||e.type==='practice'||e.type==='journey'||e.type==='frenchPath')return;
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
 if(kind==='start'){Engine.beginSession(state,activeExercises.filter(e=>e.type!=='frenchPath'),readings);save();route='seance';render();return}
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
 if(kind.startsWith('notebook')){handleNotebook(p);return}
 if(kind==='readingFavorite'){const set=new Set(state.readingFavorites||[]);if(set.has(id))set.delete(id);else set.add(id);state.readingFavorites=[...set];save();render();return}
 if(kind==='read'){openReading(id);return}
 if(kind==='define'){const r=findReading(id),w=(r?.words||[{term:r?.word,definition:r?.definition}])[Number(p[2]||0)],el=document.getElementById('wordbox');if(w&&el){const saved=NotebookEngine.hasWord(state.notebook,w.term,id);el.innerHTML='<div class="feedback"><b>'+esc(w.term)+'</b> — '+esc(w.definition)+'<div class="actions">'+btn(saved?'Retirer de mon carnet':'Garder ce mot','keepWord:'+id+':'+p[2],'secondary')+'</div></div>'}return}
 if(kind==='keepWord'){const r=findReading(id),w=(r?.words||[{term:r?.word,definition:r?.definition}])[Number(p[2]||0)];if(w){const kept=NotebookEngine.toggleWord(state.notebook,w.term,w.definition,id);save();const el=document.getElementById('wordbox');if(el)el.innerHTML='<div class="feedback" role="status">'+(kept?'Mot conservé dans ton carnet.':'Mot retiré du carnet.')+'</div>'}return}
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
 if(kind.startsWith('french')){handleFrench(p);return}
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
