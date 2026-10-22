'use strict';
// Parcours maths 4e : prérequis, automatismes, raisonnement, avec corrections calculées.
const MathJourney=(function buildJourney(){
"use strict";
const LEVELS=[
 {id:"prerequis",label:"1. Retrouver les bases",description:"Trois questions simples pour retrouver les outils utiles."},
 {id:"automatismes",label:"2. S'entraîner",description:"Trois calculs courts, avec des nombres différents."},
 {id:"raisonnement",label:"3. Résoudre un problème",description:"Un problème à résoudre en trois étapes guidées."}
];
const TOPICS=[
 ["relatifs","Produits de relatifs","Règles des signes","Nombres et calculs"],
 ["fractions","Opérations sur les fractions","Calcul et fractions équivalentes","Nombres et calculs"],
 ["equations","Équations du premier degré","Isoler une inconnue","Calcul littéral"],
 ["pythagore","Théorème de Pythagore","Diagonales et triangles rectangles","Espace et géométrie"],
 ["puissances","Puissances entières","Écritures avec exposants","Nombres et calculs"],
 ["probabilites","Probabilités simples","Cas favorables et cas possibles","Gestion de données"],
 ["fonctions","Introduction aux fonctions","Images et tarifs","Gestion de données"],
 ["statistiques","Statistiques","Somme, moyenne, étendue","Gestion de données"]
].map(([slug,topic,subtitle,tag])=>({id:"mj-"+slug,topic,subtitle,tag,subject:"Maths",type:"journey",minutes:5}));
const QUESTIONS=[],index=new Map();
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){const n=a%b;a=b;b=n}return a||1};
const rat=(n,d)=>{if(!d||!Number.isInteger(n)||!Number.isInteger(d))throw Error("Fraction invalide");const g=gcd(n,d),sign=d<0?-1:1;return {n:n*sign/g,d:Math.abs(d)/g}};
function solve(m){
 switch(m.op){
  case "add":return m.a+m.b;
  case "sub":return m.a-m.b;
  case "mul":return m.a*m.b;
  case "square":return m.a*m.a;
  case "pow":return m.a**m.b;
  case "powDiff":return m.a**m.hi-m.a**m.lo;
  case "hypSquare":return m.a*m.a+m.b*m.b;
  case "hyp":return Math.sqrt(m.a*m.a+m.b*m.b);
  case "fracAdd":return rat(m.a.n*m.b.d+m.b.n*m.a.d,m.a.d*m.b.d);
  case "fracSub":return rat(m.a.n*m.b.d-m.b.n*m.a.d,m.a.d*m.b.d);
  case "fracScale":return rat(m.a.n*m.k,m.a.d);
  case "ratio":return rat(m.a,m.b);
  case "lin":return m.a*m.x+m.b;
  case "linInv":return (m.c-m.b)/m.a;
  case "sum":return m.values.reduce((s,n)=>s+n,0);
  case "mean":return m.values.reduce((s,n)=>s+n,0)/m.values.length;
  case "range":return Math.max(...m.values)-Math.min(...m.values);
  default:throw Error("Opération inconnue "+m.op);
 }
}
const fmt=x=>typeof x==="object"?(x.d===1?String(x.n):x.n+"/"+x.d):String(x).replace(/-/g,"−");
const fs=(n,d)=>n+"/"+d;
function add(slug,level,v,step,context,question,meta,hint,method,unit=null,requestFraction=false){
 const expected=solve(meta),id="mj-"+slug+"-"+level+"-"+v+"-"+step;
 if(index.has(id))throw Error("Doublon "+id);
 if(typeof expected==="number"&&!Number.isFinite(expected))throw Error("Resultat invalide "+id);
 // Un entier exact est acceptable lorsque le calcul fractionnaire se simplifie à 1.
 const form=requestFraction&&!(typeof expected==="object"&&expected.d===1)?"fraction":"number";
 const q={id,topicId:"mj-"+slug,level,variant:v,step,context,question,meta,hint,method,unit,form,
    expectedDisplay:fmt(expected)+(unit?" "+unit:"")};
 QUESTIONS.push(q);index.set(q.id,q);
}
for(let v=0;v<4;v++){
 const a=[-4,-7,6,-5][v],b=[8,2,-3,-6][v],x=[-3,-4,5,-6][v],y=[6,-5,-4,-3][v],d=v+2,n=v+3,bonus=[5,8,13,10][v];
 add("relatifs","prerequis",v,0,"Revoir les additions.","Calcule ("+fmt(a)+") + ("+fmt(b)+").",{op:"add",a,b},"Avance ou recule sur la droite graduée.","Additionne en tenant compte des signes.");
 add("relatifs","automatismes",v,0,"Règle des signes.","Calcule ("+fmt(x)+") × ("+fmt(y)+").",{op:"mul",a:x,b:y},"Deux signes identiques donnent + ; deux signes différents donnent −.","Multiplie les valeurs absolues, puis détermine le signe.");
 const ctx="Dans un jeu, on perd "+d+" points pendant chacune des "+n+" premières manches, puis on gagne "+bonus+" points. La dernière manche fait encore perdre "+d+" points.";
 add("relatifs","raisonnement",v,0,ctx,"Quelle est la perte totale des "+n+" premières manches ? (nombre signé)",{op:"mul",a:-d,b:n},"Chaque perte a un signe négatif.","Calcule ("+fmt(-d)+") × "+n+".");
 add("relatifs","raisonnement",v,1,ctx,"Quel est le score après le bonus en partant de zéro ?",{op:"add",a:-d*n,b:bonus},"Ajoute le bonus au score négatif.","Calcule ("+fmt(-d*n)+") + "+bonus+".");
 add("relatifs","raisonnement",v,2,ctx,"Quel est le score final après la dernière manche ?",{op:"sub",a:-d*n+bonus,b:d},"La dernière manche retire encore "+d+" points.","Calcule "+fmt(-d*n+bonus)+" − "+d+".");
}
const pairs=[
 [{n:1,d:4},{n:1,d:2}],
 [{n:1,d:3},{n:1,d:6}],
 [{n:1,d:8},{n:3,d:8}],
 [{n:1,d:6},{n:1,d:3}]
];
for(let v=0;v<4;v++){
 const n=v+1,d=v+2,k=[2,3,2,4][v],[a,b]=pairs[v];
 add("fractions","prerequis",v,0,"Fractions équivalentes.","Complète "+n+"/"+d+" = ?/"+(d*k)+". Quel numérateur manque ?",{op:"mul",a:n,b:k},"Multiplie le haut et le bas par le même facteur.","Multiplie le numérateur par "+k+".");
 add("fractions","automatismes",v,0,"Addition de fractions.","Calcule "+fs(a.n,a.d)+" + "+fs(b.n,b.d)+". Donne une fraction simplifiée.",{op:"fracAdd",a,b},"Mets les fractions au même dénominateur.","Additionne les numérateurs après avoir trouvé un dénominateur commun.",null,true);
 const total=solve({op:"fracAdd",a,b}),ctx="Pour une décoration, Naïa utilise "+fs(a.n,a.d)+" L de peinture violette et "+fs(b.n,b.d)+" L de peinture bleue. Son pot peut contenir 1 L.";
 add("fractions","raisonnement",v,0,ctx,"Quelle quantité de peinture a-t-elle versée ? Donne une fraction de litre.",{op:"fracAdd",a,b},"Trouve un dénominateur commun.","Calcule "+fs(a.n,a.d)+" + "+fs(b.n,b.d)+".",null,true);
 add("fractions","raisonnement",v,1,ctx,"Quelle quantité manque-t-il pour remplir le pot ? Donne une fraction de litre.",{op:"fracSub",a:{n:1,d:1},b:total},"Calcule 1 moins la quantité déjà versée.","Calcule 1 − "+fmt(total)+".",null,true);
 add("fractions","raisonnement",v,2,ctx,"Combien de litres faut-il pour deux pots identiques ? Donne une fraction ou un entier.",{op:"fracScale",a:total,k:2},"Multiplie la quantité pour un pot par 2.","Calcule 2 × "+fmt(total)+".",null,true);
}
for(let v=0;v<4;v++){
 const x=v+2,a=v+2,b=v+3,sol=v+3,c=a*sol+b;
 add("equations","prerequis",v,0,"Calcul littéral.","Si x = "+x+", calcule 2x + 1.",{op:"lin",a:2,b:1,x},"2x veut dire 2 × x.","Calcule 2 × "+x+" + 1.");
 add("equations","automatismes",v,0,"Isoler une inconnue.","Résous "+a+"x + "+b+" = "+c+". Quelle est la valeur de x ?",{op:"linInv",a,b,c},"Retire "+b+", puis divise par "+a+".","L'équation devient "+a+"x = "+(c-b)+".");
 const price=v+3,fixed=[2,5,3,4][v],count=[4,3,5,4][v],total=price*count+fixed;
 const ctx="Un atelier demande "+fixed+" € de frais fixes, puis "+price+" € par participant. Une réservation coûte "+total+" €.";
 add("equations","raisonnement",v,0,ctx,"Quelle somme correspond aux participants après retrait des frais fixes ? (en €)",{op:"sub",a:total,b:fixed},"Soustrais les frais fixes.","Calcule "+total+" − "+fixed+".","€");
 add("equations","raisonnement",v,1,ctx,"Combien de participants sont inscrits ?",{op:"linInv",a:price,b:fixed,c:total},"Divise la somme des inscriptions par le prix par participant.","Résous "+price+"x + "+fixed+" = "+total+".");
 add("equations","raisonnement",v,2,ctx,"Combien coûterait une réservation avec une personne de plus ? (en €)",{op:"lin",a:price,b:fixed,x:count+1},"Ajoute le prix d'un participant supplémentaire.","Calcule "+price+" × "+(count+1)+" + "+fixed+".","€");
}
const triples=[[3,4],[5,12],[6,8],[8,15]];
for(let v=0;v<4;v++){
 const [a,b]=triples[v],base=[3,4,5,7][v],ctx="Une salle rectangulaire mesure "+a+" m de long et "+b+" m de large. Une guirlande doit la traverser en diagonale.";
 add("pythagore","prerequis",v,0,"Les carrés de nombres.","Calcule "+base+"².",{op:"square",a:base},"Le carré d'un nombre est son produit par lui-même.","Calcule "+base+" × "+base+".");
 add("pythagore","automatismes",v,0,"Triangle rectangle.","Les côtés de l'angle droit mesurent "+a+" cm et "+b+" cm. Longueur de l'hypoténuse ? (en cm)",{op:"hyp",a,b},"L'hypoténuse est en face de l'angle droit.","Calcule √("+a+"² + "+b+"²).","cm");
 add("pythagore","raisonnement",v,0,ctx,"Combien vaut le carré de "+a+" m (en m²) ?",{op:"square",a},"Calcule "+a+" × "+a+".","Calcule "+a+"².","m²");
 add("pythagore","raisonnement",v,1,ctx,"Combien vaut la somme des carrés des deux dimensions (en m²) ?",{op:"hypSquare",a,b},"Applique l'égalité de Pythagore.","Calcule "+a+"² + "+b+"².","m²");
 add("pythagore","raisonnement",v,2,ctx,"Quelle est la longueur de la diagonale (en m) ?",{op:"hyp",a,b},"Prends la racine carrée de la somme précédente.","Calcule √("+fmt(a*a+b*b)+").","m");
}
for(let v=0;v<4;v++){
 const repeats=v+2,a=[2,3,2,4][v],power=[3,2,5,3][v],n=v+3;
 add("puissances","prerequis",v,0,"Produit répété.","Calcule "+Array(repeats).fill("2").join(" × ")+".",{op:"pow",a:2,b:repeats},"Une puissance permet d'écrire un produit répété.","Calcule 2 puissance "+repeats+".");
 add("puissances","automatismes",v,0,"Puissance entière.","Combien vaut "+a+"^"+power+" ?",{op:"pow",a,b:power},"L'exposant indique le nombre de facteurs égaux.","Multiplie "+a+" par lui-même "+power+" fois.");
 const ctx="Pour le bal, chacun des "+n+" accessoires peut être choisi dans deux couleurs, indépendamment.";
 add("puissances","raisonnement",v,0,ctx,"Combien de combinaisons de couleurs sont possibles ?",{op:"pow",a:2,b:n},"Chaque accessoire double le nombre de choix.","Calcule 2^"+n+".");
 add("puissances","raisonnement",v,1,ctx,"Avec un accessoire supplémentaire, combien de combinaisons sont possibles ?",{op:"pow",a:2,b:n+1},"Un nouveau choix double le total.","Calcule 2^"+(n+1)+".");
 add("puissances","raisonnement",v,2,ctx,"Combien de combinaisons supplémentaires a-t-on obtenues ?",{op:"powDiff",a:2,lo:n,hi:n+1},"Soustrais le premier nombre de combinaisons du nouveau total.","Calcule 2^"+(n+1)+" − 2^"+n+".");
}
const colors=[[2,3,1],[3,4,2],[4,5,1],[5,2,3]];
for(let v=0;v<4;v++){
 const total=v+3,[r,b,g]=colors[v],all=r+b+g;
 add("probabilites","prerequis",v,0,"Compter les cas possibles.","Un sac contient 1 jeton doré et "+(total-1)+" jetons bleus. Probabilité de tirer le doré ? (fraction)",{op:"ratio",a:1,b:total},"Compte les cas favorables et tous les jetons.","La probabilité est 1/"+total+".",null,true);
 add("probabilites","automatismes",v,0,"Probabilité d'un tirage.","Il y a "+r+" jetons rouges et "+b+" bleus. Probabilité de tirer un rouge ? (fraction)",{op:"ratio",a:r,b:r+b},"Il y a "+(r+b)+" jetons en tout.","La probabilité est "+r+"/"+(r+b)+".",null,true);
 const ctx="Dans un sac opaque, il y a "+r+" jetons rouges, "+b+" bleus et "+g+" verts. Chaque jeton a la même chance d'être tiré.";
 add("probabilites","raisonnement",v,0,ctx,"Quelle est la probabilité de tirer un rouge ? (fraction)",{op:"ratio",a:r,b:all},"Compte les rouges, puis l'ensemble des jetons.","Calcule "+r+"/"+all+".",null,true);
 add("probabilites","raisonnement",v,1,ctx,"Quelle est la probabilité de tirer un jeton non rouge ? (fraction)",{op:"ratio",a:b+g,b:all},"Compte les bleus et les verts.","Calcule ("+b+" + "+g+")/"+all+".",null,true);
 add("probabilites","raisonnement",v,2,ctx,"On ajoute 2 rouges dans le sac avant le tirage. Nouvelle probabilité de tirer un rouge ? (fraction)",{op:"ratio",a:r+2,b:all+2},"Le nombre de rouges et le nombre total augmentent de 2.","Calcule "+(r+2)+"/"+(all+2)+".",null,true);
}
for(let v=0;v<4;v++){
 const x=v+2,a=v+2,b=v+1,n=[4,3,5,4][v],ctx="Un atelier de badges facture "+b+" € de frais fixes puis "+a+" € par badge. Le coût de x badges est C(x) = "+a+"x + "+b+".";
 add("fonctions","prerequis",v,0,"Remplacer une lettre.","Si x = "+x+", combien vaut 2x + 1 ?",{op:"lin",a:2,b:1,x},"Remplace x par "+x+".","Calcule 2 × "+x+" + 1.");
 add("fonctions","automatismes",v,0,"Calculer une image.","f(x) = "+a+"x + "+b+". Combien vaut f("+x+") ?",{op:"lin",a,b,x},"Remplace x par "+x+".","Calcule "+a+" × "+x+" + "+b+".");
 add("fonctions","raisonnement",v,0,ctx,"Quel est le coût de 2 badges ? (en €)",{op:"lin",a,b,x:2},"Remplace x par 2.","Calcule "+a+" × 2 + "+b+".","€");
 add("fonctions","raisonnement",v,1,ctx,"Quel est le coût de 5 badges ? (en €)",{op:"lin",a,b,x:5},"Remplace x par 5.","Calcule "+a+" × 5 + "+b+".","€");
 add("fonctions","raisonnement",v,2,ctx,"Une commande coûte "+(a*n+b)+" €. Combien de badges ont été fabriqués ?",{op:"linInv",a,b,c:a*n+b},"Retire le coût fixe puis divise par le prix d'un badge.","Résous "+a+"x + "+b+" = "+(a*n+b)+".");
}
const values=[[8,10,12],[6,9,12],[7,10,13],[10,12,14]];
for(let v=0;v<4;v++){
 const x=[3,5,7,9][v],y=[4,6,8,10][v],scores=values[v],ctx="Un groupe obtient les scores "+scores.join(", ")+" pendant trois répétitions.";
 add("statistiques","prerequis",v,0,"Additionner des données.","Calcule "+x+" + "+y+" + 2.",{op:"sum",values:[x,y,2]},"Additionne les trois valeurs.","La somme est le total des trois nombres.");
 add("statistiques","automatismes",v,0,"Calculer une moyenne.","Quelle est la moyenne de "+scores.join(", ")+" ?",{op:"mean",values:scores},"Additionne les valeurs, puis divise par leur nombre.","Moyenne = somme ÷ 3.");
 add("statistiques","raisonnement",v,0,ctx,"Quelle est la somme des scores ?",{op:"sum",values:scores},"Additionne les trois résultats.","La somme sert à calculer la moyenne.");
 add("statistiques","raisonnement",v,1,ctx,"Quelle est la moyenne des scores ?",{op:"mean",values:scores},"Divise la somme par trois.","Il y a trois répétitions.");
 add("statistiques","raisonnement",v,2,ctx,"Quelle est l'étendue des scores ?",{op:"range",values:scores},"Calcule maximum moins minimum.","Soustrais le plus petit score du plus grand.");
}
function parse(raw){
 let s=String(raw??"").trim().replace(/[−–]/g,"-").replace(/,/g,".").replace(/[\u00a0\u202f]/g," ").replace(/\s+/g," ");
 if(!s)return {valid:false,reason:"Écris un nombre ou choisis « Passer »."};
 let unit=null;
 const u=s.match(/\s*(cm²|cm2|cm\^2|m²|m2|m\^2|cm|m|€|euros?)$/i);
 if(u){unit=u[1].toLowerCase().replace(/^(?:cm2|cm\^2)$/,"cm²").replace(/^(?:m2|m\^2)$/,"m²").replace(/^euros?$/,"€");s=s.slice(0,u.index).trim()}
 if(!/^[+-]?\d+(?:\.\d+)?(?:\s*\/\s*[+-]?\d+(?:\.\d+)?)?$/.test(s))return {valid:false,reason:"Saisis un nombre ou une fraction, par exemple −4 ou 3/4."};
 const parts=s.split("/").map(Number);
 if(parts.length===2&&parts[1]===0)return {valid:false,reason:"On ne peut pas diviser par zéro."};
 const value=parts.length===1?parts[0]:parts[0]/parts[1];
 if(!Number.isFinite(value)||Math.abs(value)>1e12)return {valid:false,reason:"Le nombre est trop grand pour cet exercice."};
 return {valid:true,unit,value,fraction:parts.length===2};
}
function grade(q,input){
 if(!q||!index.has(q.id))return {valid:false,reason:"Exercice introuvable."};
 const result=parse(input);if(!result.valid)return result;
 if(result.unit&&result.unit!==q.unit)return {valid:true,correct:false,reason:"Vérifie l'unité demandée."};
 const exact=solve(q.meta),number=typeof exact==="number"?exact:exact.n/exact.d;
 if(q.form==="fraction"&&!result.fraction)return {valid:false,reason:"Donne une fraction sous la forme 3/4."};
 const correct=Math.abs(result.value-number)<=1e-10*Math.max(1,Math.abs(number));
 return {valid:true,correct,reason:correct?"Bien trouvé.":"Le résultat n'est pas encore correct."};
}
const pool=(id,level)=>QUESTIONS.filter(q=>q.topicId===id&&q.level===level);
function create(state,topicId,level="prerequis",origin="libre",sessionId=null){
 if(!TOPICS.some(t=>t.id===topicId)||!LEVELS.some(l=>l.id===level))return null;
 const past=Array.isArray(state.mathJourneyHistory)?state.mathJourneyHistory:[];
 const seen=past.filter(a=>a.topicId===topicId&&a.level===level).length;
 let questions;
 if(level==="raisonnement")questions=pool(topicId,level).filter(q=>q.variant===(Math.floor(seen/3)%4)).sort((a,b)=>a.step-b.step);
 else{
  const all=pool(topicId,level).sort((a,b)=>a.variant-b.variant);
  const offset=seen%all.length;
  questions=[...all.slice(offset),...all.slice(0,offset)].slice(0,3);
 }
 if(questions.length!==3)throw Error("Parcours incomplet "+topicId+" "+level);
 return {topicId,level,questions:questions.map(q=>q.id),cursor:0,answers:[],hintShown:false,
   tries:0,draft:"",feedback:"",finished:false,recorded:false,origin,sessionId,createdAt:Date.now()};
}
const current=c=>c&&!c.finished?index.get(c.questions[c.cursor])||null:null;
const submitted=c=>!!(c&&c.answers.some(a=>a.atIndex===c.cursor));
function submit(c,input,skip=false){
 const q=current(c);if(!q||submitted(c))return {valid:false,reason:"Cette question est déjà terminée."};
 if(skip){
  c.answers.push({atIndex:c.cursor,questionId:q.id,correct:false,assisted:true,skipped:true,at:Date.now()});
  c.feedback="La solution est "+q.expectedDisplay+". "+q.method;
  return {valid:true,correct:false,skipped:true};
 }
 const g=grade(q,input);
 if(!g.valid)return g;
 if(!g.correct){
  c.tries++;c.hintShown=true;c.feedback=g.reason+" "+(c.tries>=2?q.method:q.hint);
  return g;
 }
 c.answers.push({atIndex:c.cursor,questionId:q.id,correct:true,
  assisted:!!(c.hintShown||c.tries),skipped:false,tries:c.tries,
  input:String(input).slice(0,100),at:Date.now()});
 c.feedback="";c.draft="";return g;
}
function advance(c){
 if(!c||!submitted(c)||c.finished)return false;
 c.cursor++;c.tries=0;c.hintShown=false;c.feedback="";c.draft="";
 if(c.cursor>=c.questions.length)c.finished=true;
 return true;
}
function summary(c){
 const a=c.answers||[],autonomous=a.filter(x=>x.correct&&!x.assisted).length,helped=a.filter(x=>x.correct&&x.assisted).length;
 return {total:c.questions.length,autonomous,helped,correct:a.filter(x=>x.correct).length,skipped:a.filter(x=>x.skipped).length,
  completed:!!c.finished,successful:!!c.finished&&autonomous>=2};
}
function recordStage(state,c,at=Date.now()){
 if(!c?.finished||c.recorded)return null;
 const sum=summary(c);
 if(!state.mathJourneyProgress||typeof state.mathJourneyProgress!=="object")state.mathJourneyProgress={};
 const progress=state.mathJourneyProgress[c.topicId]||{},old=progress[c.level]||{attempts:0,passes:0,lastAt:0,lastPassAt:0};
 progress[c.level]={attempts:old.attempts+1,passes:old.passes+(sum.successful?1:0),lastAt:at,lastPassAt:sum.successful?at:old.lastPassAt||0};
 state.mathJourneyProgress[c.topicId]=progress;
 if(!Array.isArray(state.mathJourneyHistory))state.mathJourneyHistory=[];
 state.mathJourneyHistory.push(...c.answers.map(x=>({...x,topicId:c.topicId,level:c.level})));
 if(state.mathJourneyHistory.length>1200)state.mathJourneyHistory.splice(0,state.mathJourneyHistory.length-1200);
 c.recorded=true;return sum;
}
function suggestedLevel(state,id){
 const progress=state.mathJourneyProgress?.[id]||{};
 if(!progress.prerequis?.passes)return "prerequis";
 if(!progress.automatismes?.passes)return "automatismes";
 return "raisonnement";
}
function audit(){
 const issues=[];
 for(const t of TOPICS)for(const l of LEVELS){
  const items=pool(t.id,l.id);
  if(items.length!==(l.id==="raisonnement"?12:4))issues.push(t.id+" / "+l.id+": "+items.length);
  for(const q of items){
   if(!q.question||!q.hint||!q.method)issues.push(q.id+" texte manquant");
   if(!grade(q,q.expectedDisplay).correct)issues.push(q.id+" corrigé incorrect "+q.expectedDisplay);
  }
 }
 return {total:QUESTIONS.length,issues,counts:TOPICS.map(t=>({id:t.id,prerequis:pool(t.id,"prerequis").length,
    automatismes:pool(t.id,"automatismes").length,raisonnement:pool(t.id,"raisonnement").length}))};
}
return {TOPICS,LEVELS,QUESTIONS,getQuestion:id=>index.get(id)||null,pool,solve,parse,grade,current,create,submit,submitted,advance,summary,recordStage,suggestedLevel,audit};
})();
if(typeof window!=='undefined')window.MathJourney=MathJourney;
if(typeof module!=='undefined'&&module.exports)module.exports=MathJourney;
