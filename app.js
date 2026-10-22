'use strict';
// Prototype pedagogique : les regles ne sont pas un diagnostic et les contenus doivent etre valides.
const KEY='appli4e-prototype-v1';
const TODAY=()=>new Date().toISOString().slice(0,10);
const DAY=86400000;
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
function initial(){return {duration:10,history:[],reviews:{},reading:[],prefs:{},started:TODAY()}}
let state;
try{state={...initial(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{state=initial()}
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const root=document.getElementById('app');
let route='accueil',activeId=null,mode='question',currentSubject='Français',readId=null;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function card(inner,extra=''){return '<section class="card '+extra+'">'+inner+'</section>'}
function head(k,title,sub=''){return '<div class="hero"><div class="eyebrow">'+k+'</div><h1>'+title+'</h1><p class="muted">'+sub+'</p></div>'}
function btn(txt,act,cls=''){return '<button class="btn '+cls+'" data-action="'+act+'">'+esc(txt)+'</button>'}
function days(n){return Date.now()+n*DAY}
function mark(id,correct,kind='question'){let p=state.reviews[id]||{stage:0};let stage=correct?Math.min(5,p.stage+1):0;let intervals=[1/144,1,3,7,14,28];state.reviews[id]={stage,due:days(intervals[stage]),last:Date.now(),lastCorrect:correct};state.history.push({id,correct,kind,at:Date.now()});save()}
function due(){return exercises.filter(e=>state.reviews[e.id]&&state.reviews[e.id].due<=Date.now())}
function activity(id){activeId=id;mode='question';route='exercice';render()}
function reading(id){readId=id;route='texte';render()}
function home(){let n=due().length;let subject=exercises.filter(e=>e.subject==='Français')[0];return head('Un peu chaque jour','Une petite séance à ton rythme','Cinq, dix ou quinze minutes : c’est déjà utile.')+card('<div class="row"><div><div class="eyebrow">Ma séance</div><h2>Tu choisis le temps</h2></div><span class="pill">Sans chrono</span></div><div class="actions">'+[5,10,15].map(n=>btn(n+' min','duration:'+n,state.duration===n?'':'secondary')).join('')+'</div>','highlight')+card('<div class="item"><span class="symbol">▤</span><div><b>L’invitation violette</b><div class="min">Fantastique · épisode 1 · environ 6 min</div></div></div><div class="actions">'+btn('Choisir une histoire','nav:lecture')+'</div>')+card('<div class="item"><span class="symbol">✎</span><div><b>Un petit défi de français</b><div class="min">Orthographe · 3 min</div></div></div><div class="actions">'+btn('Essayer','exercise:'+subject.id,'secondary')+'</div>')+card('<div class="item"><span class="symbol">↻</span><div><b>Mes rappels</b><div class="min">'+(n?n+' notion(s) à revoir':'Pas de révision urgente')+'</div></div></div><div class="actions">'+btn('Voir','nav:revisions','outline')+'</div>')+'<p class="muted">Tu peux aussi terminer ici. Il n’y a aucune séance à rattraper.</p>'}
function library(){
 const all=readings||[];
 const series=all.filter(x=>x.seriesId==='solstice');
 const others=all.filter(x=>x.seriesId!=='solstice');
 function entry(x){
 const seen=state.reading.some(e=>e.id===x.id);
 const category=x.seriesId?'Épisode '+x.episode+' sur '+series.length:x.genre;
 return card('<div class="row"><span class="pill">'+esc(category)+'</span><span class="min">Environ '+x.time+' min</span></div><h2 style="margin-top:14px">'+esc(x.title)+'</h2><div class="min">'+(seen?'Déjà lu · tu peux le relire':'Une lecture sans chrono')+'</div><div class="actions">'+btn(seen?'Relire':'Découvrir','read:'+x.id)+'</div>');
 }
 return head('Bibliothèque','Et si tu avais envie de la suite ?','Des histoires courtes à choisir librement. Pas de test obligatoire.')
 +card('<span class="eyebrow">Série en 4 épisodes</span><h2 style="margin-top:8px">Les secrets de l’Académie Solstice</h2><p class="muted">Magie, amitiés, bal et secrets. Chaque épisode se lit séparément, sans pression.</p>','highlight')
 +series.map(entry).join('')
 +'<h2 style="margin:28px 0 10px">Selon tes envies</h2>'
 +others.map(entry).join('');
}
function reader(){
 const t=readings.find(x=>x.id===readId);
 if(!t)return library();
 const vocab=t.words||[{term:t.word,definition:t.definition}];
 const rx=new RegExp('('+vocab.map(w=>w.term).join('|')+')','gi');
 const body=t.text.split(rx).map(p=>{
   const i=vocab.findIndex(w=>w.term.toLocaleLowerCase('fr')===p.toLocaleLowerCase('fr'));
   return i<0?esc(p):'<button class="word" title="Voir le sens" data-action="define:'+t.id+':'+i+'">'+esc(p)+'</button>';
 }).join('');
 return head(t.genre,t.title,'Lis à ton rythme. Touche les mots soulignés si tu veux connaître leur sens.')
 +card('<div class="reader">'+body+'</div><div id="wordbox" aria-live="polite"></div><div class="actions">'+btn('Terminer ma lecture','readDone:'+t.id)+btn('Retour aux lectures','nav:lecture','outline')+'</div>');
}
function afterReading(id){
 const t=readings.find(x=>x.id===id);
 if(!t)return library();
 const next=t.nextId&&readings.find(x=>x.id===t.nextId);
 const rated=state.prefs[id];
 const rating=['Pas pour moi','Ça allait','J’en lirais un autre'];
 return head('Lecture terminée','Tu as lu '+esc(t.title),'Tu peux t’arrêter ici. Les questions ne sont jamais obligatoires.')
 +card('<h2>Est-ce que cette histoire t’a plu ?</h2><div class="actions">'+rating.map((x,i)=>btn(x,'rating:'+id+':'+i,rated===i?'':'secondary')).join('')+'</div>'+(rated!==undefined?'<p class="muted">Ton avis est noté, merci.</p>':''))
 +(next?card('<span class="eyebrow">La suite de l’histoire</span><h2 style="margin-top:8px">'+esc(next.title)+'</h2><p class="muted">Tu peux la découvrir maintenant ou une autre fois.</p>'+btn('Lire l’épisode suivant','next:'+next.id)):'')
 +card('<h2>Une question, seulement si tu veux</h2><div class="actions">'+btn('Une petite question','readingQuiz:'+id,'secondary')+btn('Je préfère arrêter ici','nav:lecture','outline')+'</div>');
}
function quizReading(){let t=readings.find(x=>x.id===readId);return head('Une question','Qu’as-tu retenu ?')+card('<h2>'+esc(t.question)+'</h2><div class="choices">'+t.options.map((x,i)=>'<button class="choice" data-action="readingAnswer:'+t.id+':'+i+'">'+esc(x)+'</button>').join('')+'</div>')}
function subjects(){return head('Mes matières','Choisis un domaine','Les exercices restent courts et les erreurs sont expliquées.')+['Français','Maths','Histoire-géo'].map(x=>card('<div class="row"><h2>'+x+'</h2><span class="pill">'+exercises.filter(e=>e.subject===x).length+' exercices</span></div><div class="actions">'+btn('Explorer','subject:'+x)+'</div>')).join('')}
function subjectPage(){return head('Matières',currentSubject,'Choisis une petite activité.')+exercises.filter(e=>e.subject===currentSubject).map(e=>card('<h2>'+esc(e.topic)+'</h2><p class="muted">Une question, un retour clair et un rappel futur.</p>'+btn('Commencer','exercise:'+e.id))).join('')}
function exercise(){let e=exercises.find(x=>x.id===activeId);if(!e)return subjects();let probe=mode==='probe';return head(e.subject,e.topic,probe?'Une petite étape pour mieux comprendre.':'Essaie, même si tu hésites.')+card('<h2>'+esc(probe?e.probe:e.question)+'</h2><div class="choices">'+(probe?e.probeOptions:e.options).map((o,i)=>'<button class="choice" data-action="answer:'+i+'">'+esc(o)+'</button>').join('')+'</div>')}
function revisions(){let list=due(),seen=Object.keys(state.reviews).length;return head('Mémoire','À revoir','Quelques questions seulement, sans accumulation.')+(list.length?list.map(e=>card('<div class="row"><div><h3>'+esc(e.topic)+'</h3><div class="min">'+e.subject+'</div></div>'+btn('Revoir','exercise:'+e.id)+'</div>')).join(''):card('<h2>Rien d’urgent aujourd’hui</h2><p class="muted">Les '+seen+' notion(s) déjà rencontrée(s) reviendront progressivement.</p>'+btn('Choisir une matière','nav:matieres','secondary')))}
function progress(){let count=state.history.filter(x=>x.correct).length,total=state.history.length,read=state.reading.length;return head('Mon chemin','Mes progrès','Ce qui compte, c’est ce que tu arrives progressivement à faire seule.')+card('<h2>Ce que tu as déjà fait</h2><div class="grid"><div><div class="eyebrow">Lectures terminées</div><h1>'+read+'</h1></div><div><div class="eyebrow">Réponses réussies</div><h1>'+count+'</h1></div></div><p class="muted">'+(total?'Tu as essayé '+total+' question(s). Chaque essai aide à identifier la prochaine étape.':'Commence par ce qui t’intéresse.')+'</p>')+card('<h2>Notions rencontrées</h2>'+exercises.filter(e=>state.reviews[e.id]).map(e=>'<div class="row"><p>'+esc(e.topic)+'</p><span class="pill">'+(state.reviews[e.id].stage>=3?'En consolidation':'À retrouver')+'</span></div>').join('')+(!Object.keys(state.reviews).length?'<p class="muted">Les notions apparaîtront ici après tes premiers exercices.</p>':''))}
function feedback(correct,e,probing){const copy=correct?'Bien vu. '+e.why:probing?'Cette étape est difficile pour le moment. '+e.why:'Pas encore. '+e.why;root.innerHTML=head('On apprend','Une étape de plus')+card('<div class="feedback">'+esc(copy)+'</div><div class="actions">'+btn(correct?'Continuer':'Réessayer avec un indice',correct?'nav:matieres':'probe:'+e.id)+btn('Arrêter ici','nav:accueil','outline')+'</div>');wire()}
function render(){const html=route==='accueil'?home():route==='lecture'?library():route==='texte'?reader():route==='apreslecture'?afterReading(readId):route==='lecturequiz'?quizReading():route==='matieres'?subjects():route==='matiere'?subjectPage():route==='exercice'?exercise():route==='revisions'?revisions():progress();root.innerHTML=html;document.querySelectorAll('.bottom button').forEach(b=>b.classList.toggle('active',b.dataset.nav===route));wire()}
function wire(){document.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',()=>handle(el.dataset.action)));}
function handle(s){let a=s.split(':'),k=a[0];if(k==='nav'){route=a[1];render()}else if(k==='duration'){state.duration=+a[1];save();render()}else if(k==='exercise')activity(a[1]);else if(k==='subject'){currentSubject=a.slice(1).join(':');route='matiere';render()}else if(k==='read')reading(a[1]);else if(k==='next'){state.prefs['suite:'+a[1]]=true;save();reading(a[1]);}else if(k==='define'){let t=readings.find(x=>x.id===a[1]),b=document.getElementById('wordbox'),v=(t.words||[{term:t.word,definition:t.definition}])[Number(a[2]||0)];if(b&&v)b.innerHTML='<div class="feedback"><b>'+esc(v.term)+'</b> — '+esc(v.definition)+'</div>'}else if(k==='readDone'){readId=a[1];state.reading.push({id:readId,at:Date.now()});save();route='apreslecture';render()}else if(k==='rating'){state.prefs[a[1]]=+a[2];save();render()}else if(k==='readingQuiz'){readId=a[1];route='lecturequiz';render()}else if(k==='readingAnswer'){let t=readings.find(x=>x.id===a[1]),ok=+a[2]===t.answer;state.history.push({id:t.id,correct:ok,kind:'reading',at:Date.now()});save();root.innerHTML=head('Compréhension',ok?'Bien trouvé':'Une occasion de comprendre')+card('<p>'+esc(ok?'Tu as retrouvé l’information essentielle.':'Relis le texte si tu en as envie ; tu trouveras l’indice dans les phrases.')+'</p>'+btn('Terminer','nav:lecture'));wire()}else if(k==='answer'){let e=exercises.find(x=>x.id===activeId);let probing=mode==='probe';let ok=+a[1]===(probing?e.probeAnswer:e.answer);mark(e.id,ok,probing?'probe':'question');feedback(ok,e,probing)}else if(k==='probe'){mode='probe';render()}}
document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>{route=b.dataset.nav;render()}));window.addEventListener('hashchange',()=>{route=location.hash.replace('#','')||'accueil';render()});render();