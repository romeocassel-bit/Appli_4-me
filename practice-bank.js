'use strict';
// Banque d'orthographe et de maths ; calculs entièrement locaux.
const PracticeBank=(function buildBank(){
"use strict";
const rawTopics=[
["po-accord","Français","Accord sujet-verbe — séries","orth"],["po-adjectif","Français","Accords des adjectifs","orth"],
["po-homophone","Français","Homophones courants","orth"],["po-participe","Français","Participe passé avec être","orth"],
["po-infinitif","Français","Terminaisons -er et -é","orth"],["po-mixte","Français","Orthographe — défi mélangé","orth"],
["pm-relatifs","Maths","Nombres relatifs — comparer","math"],["pm-sommes","Maths","Addition de relatifs","math"],
["pm-equivalences","Maths","Fractions équivalentes","math"],["pm-quantites","Maths","Fraction d’une quantité","math"],
["pm-proportion","Maths","Proportionnalité — prix","math"],["pm-pourcents","Maths","Pourcentages usuels","math"],
["pm-geometrie","Maths","Aires et périmètres","math"],["pm-litteral","Maths","Calcul littéral — remplacer x","math"],
["pm-mixte","Maths","Maths — défi mélangé","math"]
];
const TOPICS=rawTopics.map(([id,subject,topic,domain],i)=>({id,subject,topic,domain,type:"practice",minutes:4,mix:id.endsWith("-mixte"),order:i}));
const QUESTIONS=[],seen=new Set();
function add(topicId,question,right,distractors,explanation,hint,difficulty=1,meta={}){
  const t=TOPICS.find(x=>x.id===topicId);if(!t)throw Error("Topic "+topicId);
  const correct=String(right),wrong=[...new Set(distractors.map(String))].filter(x=>x!==correct);
  if(wrong.length<2)throw Error("Distractors "+question+" "+correct);
  const key=topicId+"|"+question+"|"+correct;
  if(seen.has(key))throw Error("Duplicate "+key);seen.add(key);
  const answer=QUESTIONS.length%3,options=wrong.slice(0,2);
  options.splice(answer,0,correct);
  const id="pvq"+String(QUESTIONS.length+1).padStart(4,"0");
  QUESTIONS.push({id,topicId,domain:t.domain,question,options,answer,right:correct,explanation,hint,difficulty,meta});
}
const agreement=[
["Les élèves de l'Académie","arrivent","arrive","arriver","dans la cour","élèves",2],
["Le groupe de danseuses","arrive","arrivent","arriver","au théâtre","groupe",3],
["La chanteuse","chante","chantent","chanter","sur scène","chanteuse",1],
["Les chanteuses","chantent","chante","chanter","pour la fête","chanteuses",1],
["Le miroir","brille","brillent","briller","sous la lumière","miroir",1],
["Les lanternes","brillent","brille","briller","au plafond","lanternes",1],
["Juno et Sam","dansent","danse","danser","ensemble","Juno et Sam",2],
["Juno","danse","dansent","danser","avec confiance","Juno",1],
["La musique","commence","commencent","commencer","doucement","musique",1],
["Les spectacles","commencent","commence","commencer","ce soir","spectacles",1],
["La couleur des rubans","change","changent","changer","selon la lumière","couleur",3],
["Les couleurs des rubans","changent","change","changer","pendant la fête","couleurs",2],
["Une amie de Naïa","prépare","préparent","préparer","les invitations","amie",2],
["Les amies de Naïa","préparent","prépare","préparer","les invitations","amies",2],
["Le carnet des secrets","reste","restent","rester","sur la table","carnet",3],
["Les carnets de Sam","restent","reste","rester","dans le tiroir","carnets",2],
["Le dessin des étoiles","apparaît","apparaissent","apparaître","dans le miroir","dessin",3],
["Des étoiles lumineuses","apparaissent","apparaît","apparaître","dans le ciel","étoiles",2],
["La porte des studios","s'ouvre","s'ouvrent","ouvrir","sans bruit","porte",3],
["Les portes du théâtre","s'ouvrent","s'ouvre","ouvrir","à dix-neuf heures","portes",2],
["Le costume des musiciens","attire","attirent","attirer","les regards","costume",3],
["Les costumes de la troupe","attirent","attire","attirer","les regards","costumes",2],
["Une nouvelle élève","cherche","cherchent","chercher","sa classe","élève",1],
["Plusieurs élèves","cherchent","cherche","chercher","leurs amis","élèves",1]
];
for(const [subject,right,other,inf,ending,nucleus,level] of agreement){
 add("po-accord",subject+" ___ "+ending+".",right,[other,inf],
 "Le noyau du sujet est « "+nucleus+" ». Le verbe s’écrit « "+right+" ».",
 "Repère le mot principal du sujet ; remplace-le par il, elle, ils ou elles.",level);
}
const adj=[["brillant",["brillant","brillante","brillants","brillantes"]],
 ["doré",["doré","dorée","dorés","dorées"]],["léger",["léger","légère","légers","légères"]],
 ["original",["original","originale","originaux","originales"]],["coloré",["coloré","colorée","colorés","colorées"]],
 ["petit",["petit","petite","petits","petites"]]];
const phrases=[["une cape",1,"féminin singulier"],["des étoiles",3,"féminin pluriel"],
 ["un ruban",0,"masculin singulier"],["des costumes",2,"masculin pluriel"]];
for(const [lemma,forms] of adj)for(const [group,ix,genre] of phrases){
 const answer=forms[ix],wrong=[...new Set(forms.filter((s,j)=>j!==ix&&s!==answer))];
 add("po-adjectif","Accorde « "+lemma+" » : "+group+" ___.",answer,wrong,
 "« "+group+" » est "+genre+" : on écrit « "+answer+" ».","Repère le déterminant, puis le genre et le nombre.",ix>1?2:1);
}
const hom=[
["Naïa ___ reçu une invitation.","a","à","as","« a » est le verbe avoir : Naïa avait reçu."],
["Juno ___ préparé une surprise.","a","à","as","« a » se remplace par « avait »."],
["La musique ___ commencé.","a","à","as","« a » est le verbe avoir."],
["Elles vont ___ la bibliothèque.","à","a","as","« à » introduit un lieu."],
["Le miroir est ___ côté de la porte.","à","a","as","On écrit « à côté »."],
["Le bal commence ___ vingt heures.","à","a","as","« à » indique ici une heure."],
["Juno ___ Sam discutent.","et","est","es","« et » relie deux personnes."],
["La cape ___ les chaussures sont assorties.","et","est","es","« et » relie deux groupes."],
["Le miroir ___ couvert d'étoiles.","est","et","es","« est » se remplace par « était »."],
["Le déguisement ___ prêt.","est","et","es","« est » est le verbe être."],
["Sam ___ heureux.","est","et","es","« est » est le verbe être."],
["La musique ___ les lumières remplissent la salle.","et","est","es","« et » relie deux éléments."],
["Les danseurs ___ prêts.","sont","son","sons","« sont » se remplace par « étaient »."],
["Les lumières ___ éteintes.","sont","son","sons","« sont » est le verbe être."],
["Juno cherche ___ carnet.","son","sont","sons","« son » accompagne « carnet »."],
["Sam a oublié ___ stylo.","son","sont","sons","« son » accompagne un nom."],
["Les invitations ___ arrivées.","sont","son","sons","« sont » se remplace par « étaient »."],
["L'artiste range ___ matériel.","son","sont","sons","« son » est un déterminant possessif."],
["Les élèves ___ choisi les couleurs.","ont","on","ons","« ont » se remplace par « avaient »."],
["Juno et Céleste ___ préparé le décor.","ont","on","ons","« ont » est le verbe avoir."],
["___ joue de la musique.","On","Ont","Ons","« On » est un pronom sujet."],
["___ imagine une histoire.","On","Ont","Ons","« On » peut se remplacer par « quelqu’un »."],
["___ commence par une chanson.","On","Ont","Ons","« On » est le sujet du verbe."],
["Les artistes ___ montré leurs créations.","ont","on","ons","« ont » est le verbe avoir."],
["___ soir, les lanternes brillent.","Ce","Se","Ces","« Ce » accompagne le nom « soir »."],
["___ matin, Juno apporte une surprise.","Ce","Se","Ces","« Ce » est un déterminant démonstratif."],
["Naïa ___ prépare pour la fête.","se","ce","ces","« se » appartient au verbe « se préparer »."],
["Juno ___ regarde dans le miroir.","se","ce","ces","« se » accompagne un verbe pronominal."],
["___ costume est original.","Ce","Se","Ces","« Ce » accompagne « costume »."],
["Le rideau ___ lève.","se","ce","ces","« se » appartient au verbe « se lever »."]
];
for(const [q,correct,b,c,explanation] of hom)add("po-homophone",q,correct,[b,c],explanation,"Demande-toi si le mot est un verbe, un déterminant ou un pronom.",1);
const pass=[
 ["arriver",["arrivé","arrivée","arrivés","arrivées"],"à la fête"],
 ["rester",["resté","restée","restés","restées"],"près du miroir"],
 ["partir",["parti","partie","partis","parties"],"pour le bal"],
 ["entrer",["entré","entrée","entrés","entrées"],"dans la salle"],
 ["venir",["venu","venue","venus","venues"],"à la répétition"]
];
for(const [verb,forms,place] of pass)for(const [subject,ix,genre] of [
 ["Naïa est",1,"féminin singulier"],["Sam est",0,"masculin singulier"],
 ["Juno et Céleste sont",3,"féminin pluriel"],["Les danseurs sont",2,"masculin pluriel"]
]){
 add("po-participe",subject+" ___ "+place+".",forms[ix],forms.filter(x=>x!==forms[ix]),
 "Avec l'auxiliaire « être », le participe passé s'accorde avec le sujet ("+genre+") : « "+forms[ix]+" ».",
 "Repère le genre et le nombre du sujet.",ix>=2?2:1);
}
for(const [inf,pp,ppf,object] of [
 ["décorer","décoré","décorée","sa cape"],["préparer","préparé","préparée","le spectacle"],
 ["dessiner","dessiné","dessinée","une étoile"],["imaginer","imaginé","imaginée","une histoire"],
 ["chanter","chanté","chantée","une mélodie"],["inventer","inventé","inventée","une danse"],
 ["colorier","colorié","coloriée","un masque"],["organiser","organisé","organisée","la fête"],
 ["accrocher","accroché","accrochée","les rubans"],["transformer","transformé","transformée","la salle"]
]){
 add("po-infinitif","Naïa veut ___ "+object+".",inf,[pp,ppf],
 "Après « veut », on emploie l'infinitif « "+inf+" ».","Essaie « veut prendre ».",1);
 add("po-infinitif","Juno a ___ "+object+".",pp,[inf,ppf],
 "Après « a », on emploie ici le participe passé « "+pp+" ».","Essaie « a pris ».",2);
}
const fmt=n=>n<0?"−"+Math.abs(n):String(n);
for(let i=0;i<29;i++){
 const x=-(i%17+1),y=(i*5%13)-4,z=(i*3%15)-7;
 const xs=[x,y,z],distinct=[...new Set(xs)];if(distinct.length<3)continue;
 const largest=i%2===0,value=largest?Math.max(...xs):Math.min(...xs);
 add("pm-relatifs","Quel est le nombre "+(largest?"le plus grand":"le plus petit")+" parmi "+xs.map(fmt).join(", ")+" ?",
 fmt(value),xs.filter(n=>n!==value).map(fmt),
 "Sur la droite graduée, "+fmt(value)+" est "+(largest?"le plus à droite":"le plus à gauche")+".",
 "Les nombres augmentent vers la droite.",xs.every(n=>n<0)?2:1,{kind:"order",xs,largest,expected:value});
}
for(let i=0;i<32;i++){
 const x=(i%2?-1:1)*(i%12+2),y=(i%3?-1:1)*(i%11+4),z=x+y;
 const others=[...new Set([x-y,-z,z+3,z-4])].filter(v=>v!==z);
 add("pm-sommes","Calcule ("+(x>0?"+":"")+x+") + ("+(y>0?"+":"")+y+").",String(z),others.map(String),
 "On additionne "+fmt(x)+" et "+fmt(y)+" : le résultat est "+fmt(z)+".",
 "Avec des signes différents, compare les valeurs absolues.",x*y<0?2:1,
 {kind:"sum",x,y,expected:z});
}
for(const [n,d] of [[1,2],[2,3],[3,4],[3,5],[4,7],[5,8],[2,7],[5,6],[7,9]])
 for(const factor of [2,3,4]){
 const result=(n*factor)+"/"+(d*factor);
 add("pm-equivalences","Multiplie le haut et le bas de "+n+"/"+d+" par "+factor+". Quelle fraction obtiens-tu ?",result,
 [(n*factor)+"/"+d,n+"/"+(d*factor)],
 "On multiplie les deux nombres par "+factor+" : "+n+"/"+d+" = "+result+".",
 "La même multiplication est nécessaire au numérateur et au dénominateur.",factor===2?1:2,
 {kind:"fraction",n,d,factor,expectedNumerator:n*factor,expectedDenominator:d*factor});
}
for(const [n,d] of [[1,2],[1,3],[2,3],[3,4],[2,5],[3,5],[5,6],[1,4]])
 for(const factor of [4,6,8]){
 const total=d*factor,result=n*factor;
 add("pm-quantites","Combien font "+n+"/"+d+" de "+total+" ?",String(result),
 [String(total),String(factor),String(result+d),String(result+2)],
 "("+total+" ÷ "+d+") × "+n+" = "+result+".",
 "Divise la quantité par le dénominateur, puis multiplie par le numérateur.",n===1?1:2,
 {kind:"quantity",n,d,total,expected:result});
}
for(const [object,unit] of [["autocollants",2],["bracelets",4],["carnets",5],["stylos",3],["badges",6],["tickets",7]])
 for(const [start,end] of [[2,5],[3,7],[4,6],[5,8]]){
 const cost=unit*start,result=unit*end;
 add("pm-proportion",start+" "+object+" coûtent "+cost+" €. Combien coûtent "+end+" "+object+" ?",
 result+" €",[cost+" €",unit*(end+1)+" €",result+unit*2+" €"],
 "Un objet coûte "+cost+" ÷ "+start+" = "+unit+" €. Donc "+end+" objets coûtent "+result+" €.",
 "Calcule d'abord le prix d'un objet.",start===2?1:2,
 {kind:"proportion",unit,start,end,expected:result});
}
for(const p of [10,20,25,50,75])for(const total of [40,60,80,100,120,200]){
 const result=total*p/100;
 const others=[...new Set([total/2,total/4,total/10,result+10,result-10])].filter(n=>Number.isInteger(n)&&n>=0&&n!==result);
 add("pm-pourcents","Combien font "+p+" % de "+total+" ?",String(result),others.map(String),
 p+" % de "+total+" = ("+p+" × "+total+") ÷ 100 = "+result+".",
 "10 % est un dixième ; 25 % un quart ; 50 % une moitié.",p===10||p===50?1:p===75?3:2,
 {kind:"percent",p,total,expected:result});
}
for(const [l,w] of [[5,3],[7,4],[9,2],[8,5],[10,3],[6,4],[12,5],[11,3],[9,6],[14,4],[13,7],[8,3]]){
 const per=2*(l+w),area=l*w;
 add("pm-geometrie","Rectangle de "+l+" cm sur "+w+" cm : son périmètre ?",per+" cm",
 [area+" cm",l+w+" cm",per+2+" cm"],
 "Périmètre = 2 × ("+l+" + "+w+") = "+per+" cm.",
 "Le périmètre mesure le contour.",1,{kind:"perimeter",l,w,expected:per});
 add("pm-geometrie","Rectangle de "+l+" cm sur "+w+" cm : son aire ?",area+" cm²",
 [per+" cm²",l+w+" cm²",area+2+" cm²"],
 "Aire = "+l+" × "+w+" = "+area+" cm².",
 "L'aire mesure la surface.",2,{kind:"area",l,w,expected:area});
}
const algebra=[
 ["2x + 3",x=>2*x+3,1,x=>"2 × ("+fmt(x)+") + 3"],
 ["3x − 2",x=>3*x-2,2,x=>"3 × ("+fmt(x)+") − 2"],
 ["x² + 1",x=>x*x+1,3,x=>"("+fmt(x)+")² + 1"],
 ["5 − x",x=>5-x,2,x=>"5 − ("+fmt(x)+")"]
];
for(const [label,fn,level,substitution] of algebra)for(const x of [-3,-2,-1,1,2,3,4,5]){
 const result=fn(x),others=[...new Set([fn(x+1),fn(-x),result+1,result-2,result+3])].filter(n=>n!==result);
 add("pm-litteral","Si x = "+fmt(x)+", combien vaut "+label+" ?",fmt(result),others.map(fmt),
 "On remplace x par "+fmt(x)+" : "+substitution(x)+" = "+fmt(result)+".",
 "Remplace x par sa valeur, avec des parenthèses si x est négatif.",level,
 {kind:"algebra",label,x,expected:result});
}
const index=new Map(QUESTIONS.map(q=>[q.id,q]));
const pool=topicId=>{
 const t=TOPICS.find(x=>x.id===topicId);return t?(t.mix?QUESTIONS.filter(x=>x.domain===t.domain):QUESTIONS.filter(x=>x.topicId===topicId)):[];
};
const verify=()=>{
 const problems=[];
 for(const q of QUESTIONS){
  if(q.options.length!==3||new Set(q.options).size!==3||q.options[q.answer]!==q.right)problems.push(q.id+" options");
  if(q.difficulty<1||q.difficulty>3)problems.push(q.id+" difficulty");
  const m=q.meta;
  if(m.kind==="sum"&&m.expected!==m.x+m.y)problems.push(q.id+" sum");
  if(m.kind==="order"&&m.expected!==(m.largest?Math.max(...m.xs):Math.min(...m.xs)))problems.push(q.id+" order");
  if(m.kind==="quantity"&&m.expected!==m.total*m.n/m.d)problems.push(q.id+" quantity");
  if(m.kind==="fraction"&&m.n*m.expectedDenominator!==m.d*m.expectedNumerator)problems.push(q.id+" fraction");
  if(m.kind==="proportion"&&m.expected!==m.unit*m.end)problems.push(q.id+" proportionality");
  if(m.kind==="percent"&&m.expected!==m.p*m.total/100)problems.push(q.id+" percentage");
  if(m.kind==="perimeter"&&m.expected!==2*(m.l+m.w))problems.push(q.id+" perimeter");
  if(m.kind==="area"&&m.expected!==m.l*m.w)problems.push(q.id+" area");
 }
 for(const t of TOPICS)if(pool(t.id).length<15)problems.push("Underfilled "+t.id);
 return problems;
};
return {TOPICS,QUESTIONS,questionCount:QUESTIONS.length,getQuestion:id=>index.get(id)||null,pool,verify};
})();
if(typeof window!=='undefined')window.PracticeBank=PracticeBank;
if(typeof module!=='undefined'&&module.exports)module.exports=PracticeBank;
