'use strict';
// Correction calculée indépendamment de la banque de QCM. Aucune exécution d'expression saisie.
const MathCoach=(function createMathCoach(){
 "use strict";
 const PATHS={
  "pm-relatifs":{before:"Lire et comparer des entiers",check:"Quel est le plus grand nombre : 6 ou 3 ?",expected:"6",hint:"Un nombre plus à droite est plus grand.",example:"Exemple : −2 est plus grand que −7, car −2 est plus à droite sur la droite graduée."},
  "pm-sommes":{before:"Additionner et soustraire des entiers",check:"Calcule 9 − 4.",expected:"5",hint:"Retire quatre unités à neuf.",example:"Exemple : (−3) + (+5) = 2. En avançant de cinq depuis −3, on atteint 2."},
  "pm-equivalences":{before:"Multiplier deux nombres entiers",check:"Combien font 4 × 3 ?",expected:"12",hint:"Quatre groupes de trois.",example:"Exemple : 2/5 × (3/3) = 6/15. On multiplie le numérateur ET le dénominateur par trois."},
  "pm-quantites":{before:"Partager une quantité",check:"Combien font 18 ÷ 3 ?",expected:"6",hint:"Répartis dix-huit objets en trois parts égales.",example:"Exemple : 2/3 de 12 = (12 ÷ 3) × 2 = 8."},
  "pm-proportion":{before:"Calculer un prix unitaire",check:"Trois bracelets coûtent 12 €. Quel est le prix d'un bracelet, en euros ?",expected:"4",hint:"Divise le prix total par le nombre de bracelets.",example:"Exemple : 4 cahiers coûtent 12 €. Un cahier coûte 3 € et 6 cahiers coûtent 18 €."},
  "pm-pourcents":{before:"Prendre une fraction simple d'un nombre",check:"Quelle est la moitié de 18 ?",expected:"9",hint:"Une moitié signifie diviser par deux.",example:"Exemple : 25 % de 80 = 80 ÷ 4 = 20. Pour 10 %, on divise par 10."},
  "pm-geometrie":{before:"Additionner et multiplier des longueurs",check:"Combien font 5 × 4 ?",expected:"20",hint:"Cinq rangées de quatre.",example:"Exemple : rectangle 6 cm × 2 cm ; aire = 12 cm² et périmètre = 2 × (6 + 2) = 16 cm."},
  "pm-litteral":{before:"Calculer une expression numérique",check:"Combien font 3 × 4 + 2 ?",expected:"14",hint:"Effectue la multiplication avant l'addition.",example:"Exemple : si x = −2, alors 3x + 1 = 3 × (−2) + 1 = −5."}
 };
 function normalize(raw){
  return String(raw??"").trim().replace(/[\u00a0\u202f]/g," ").replace(/[−–]/g,"-").replace(/\s+/g," ").replace(/,/g,".").trim();
 }
 function parse(raw){
  let s=normalize(raw);
  if(!s)return {valid:false,reason:"Écris une réponse pour commencer."};
  let unit=null;
  const match=s.match(/\s*(cm(?:\^?2|²)?|€|euros?)\s*$/i);
  if(match){unit=match[1].toLowerCase().replace(/^euros?$/,"€").replace(/(?:cm\^2|cm2)/,"cm²");s=s.slice(0,match.index).trim()}
  if(!/^[+-]?\d+(?:\.\d+)?(?:\s*\/\s*[+-]?\d+(?:\.\d+)?)?$/.test(s))
   return {valid:false,reason:"Utilise un nombre (par exemple −4, 2,5 ou 3/4), sans calcul à écrire."};
  const parts=s.split("/").map(Number);
  if(parts.length===2&&parts[1]===0)return {valid:false,reason:"On ne peut pas diviser par zéro."};
  const value=parts.length===1?parts[0]:parts[0]/parts[1];
  if(!Number.isFinite(value)||Math.abs(value)>1e12)return {valid:false,reason:"Ce nombre est trop grand pour ce petit défi."};
  return {valid:true,value,unit,fraction:parts.length===2?{n:parts[0],d:parts[1]}:null,raw:s};
 }
 function fromBank(q){
  const m=q?.meta;
  if(!m||!m.kind)return null;
  switch(m.kind){
   case "order":return m.largest?Math.max(...m.xs):Math.min(...m.xs);
   case "sum":return m.x+m.y;
   case "fraction":return {n:m.n*m.factor,d:m.d*m.factor};
   case "quantity":return m.total*m.n/m.d;
   case "proportion":return m.unit*m.end;
   case "percent":return m.total*m.p/100;
   case "perimeter":return 2*(m.l+m.w);
   case "area":return m.l*m.w;
   case "algebra":
    if(m.label==="2x + 3")return 2*m.x+3;
    if(m.label==="3x − 2")return 3*m.x-2;
    if(m.label==="x² + 1")return m.x*m.x+1;
    if(m.label==="5 − x")return 5-m.x;
    return null;
   default:return null;
  }
 }
 const unitFor=q=>q?.meta?.kind==="perimeter"?"cm":q?.meta?.kind==="area"?"cm²":q?.meta?.kind==="proportion"?"€":null;
 function near(a,b){return Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b))}
 function check(q,raw){
  const answer=parse(raw);if(!answer.valid)return answer;
  const exact=fromBank(q);if(exact===null)return {valid:false,reason:"Cette question n'a pas encore été vérifiée pour une réponse libre."};
  const unit=unitFor(q);
  if(answer.unit && answer.unit!==unit)return {valid:true,correct:false,reason:"Vérifie l'unité. "+(unit?"Cette grandeur s'exprime en "+unit+".":"Écris seulement le nombre demandé.")};
  if(typeof exact==="object"){
   if(!answer.fraction)return {valid:true,correct:false,reason:"Écris une fraction sous la forme numérateur/dénominateur."};
   if(answer.fraction.n===exact.n&&answer.fraction.d===exact.d)return {valid:true,correct:true};
   if(near(answer.value,exact.n/exact.d))return {valid:true,correct:false,reason:"Cette fraction a la même valeur, mais retrouve exactement les deux nombres obtenus en multipliant le haut et le bas."};
   return {valid:true,correct:false,reason:"Pense à multiplier séparément le numérateur et le dénominateur."};
  }
  if(near(answer.value,exact))return {valid:true,correct:true};
  return {valid:true,correct:false,reason:"Ce résultat ne convient pas encore. Vérifie ton calcul."};
 }
 function checkPrerequisite(topicId,raw){
  const p=PATHS[topicId];if(!p)return {valid:false,reason:"Pas de rappel prévu pour ce défi."};
  const result=parse(raw);
  if(!result.valid)return result;
  return {valid:true,correct:near(result.value,Number(p.expected)),reason:near(result.value,Number(p.expected))?"Bien vu.":"Regarde cet exemple : "+p.hint+" La réponse est "+p.expected+"."};
 }
 function quickHint(q){
  const kind=q?.meta?.kind;
  const map={
   order:"Place mentalement les trois nombres sur une droite : celui de droite est le plus grand.",
   sum:"Regarde les signes, puis compare les distances à zéro.",
   fraction:"Repère le facteur : applique-le au numérateur ET au dénominateur.",
   quantity:"Partage la quantité en autant de parts que le dénominateur, puis prends le bon nombre de parts.",
   proportion:"Calcule le prix d'un seul objet avant de multiplier.",
   percent:"10 % est un dixième, 25 % un quart, 50 % une moitié.",
   perimeter:"Le périmètre est la longueur du contour : additionne les quatre côtés.",
   area:"L'aire d'un rectangle se calcule en multipliant longueur et largeur.",
   algebra:"Remplace la lettre par sa valeur et respecte la priorité des opérations."
  };
  return map[kind]||"Repère les informations importantes de la question.";
 }
 function workedExample(q){
  const topic=q?.topicId;
  return PATHS[topic]?.example||"Relis la règle avant de réessayer avec un exemple différent.";
 }
 function audit(bank){
  const questions=bank.QUESTIONS.filter(q=>q.domain==="math");
  const issues=[],counts={},kinds={};
  for(const q of questions){
   counts[q.topicId]=(counts[q.topicId]||0)+1;
   kinds[q.meta?.kind]=(kinds[q.meta?.kind]||0)+1;
   const checkRight=check(q,q.right);
   if(!checkRight.valid||!checkRight.correct)issues.push({id:q.id,kind:"corrige",message:checkRight.reason||"Réponse incohérente"});
   if(!q.explanation||!q.hint||q.options.length!==3||new Set(q.options).size!==3||q.options[q.answer]!==q.right)
    issues.push({id:q.id,kind:"structure",message:"QCM invalide"});
   if(!q.question.includes("?")&&!q.question.includes("Calcule")&&!q.question.includes("Multiplie"))issues.push({id:q.id,kind:"énoncé",message:"Consigne à relire"});
   for(const [i,v] of q.options.entries()){
    const c=check(q,v);
    if(i!==q.answer&&c.valid&&c.correct)issues.push({id:q.id,kind:"choix",message:"Autre proposition acceptée : "+v});
   }
   if(q.meta?.kind==="proportion"&&!q.question.includes("€"))issues.push({id:q.id,kind:"unité",message:"Prix sans unité"});
   if(q.meta?.kind==="area"&&!q.right.includes("cm²"))issues.push({id:q.id,kind:"unité",message:"Aire sans unité"});
   if(q.meta?.kind==="perimeter"&&!q.right.includes("cm"))issues.push({id:q.id,kind:"unité",message:"Périmètre sans unité"});
  }
  return {total:questions.length,counts,kinds,issues};
 }
 return {PATHS,normalize,parse,fromBank,check,checkPrerequisite,quickHint,workedExample,audit};
})();
if(typeof window!=='undefined')window.MathCoach=MathCoach;
if(typeof module!=='undefined'&&module.exports)module.exports=MathCoach;
