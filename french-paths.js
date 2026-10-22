'use strict';
// Six parcours originaux de français. Les réponses rédigées ne sont jamais notées automatiquement.
const FrenchPaths=(function makeFrenchPaths(){
"use strict";
const STEPS=[
 {id:"observer",label:"1. Comprendre",description:"Repérer une règle dans une phrase."},
 {id:"entrainer",label:"2. S'entraîner",description:"Utiliser la règle dans un nouvel exemple."},
 {id:"reutiliser",label:"3. Réutiliser",description:"Écrire quelques phrases, à son rythme."}
];
const DATA=[
 {id:"fp-phrases",topic:"Phrase simple et phrase complexe",tag:"Grammaire",tip:"Une proposition contient généralement un verbe conjugué. Une phrase complexe contient au moins deux propositions.",variants:[
  [["Dans « Le miroir s'allume et Naïa recule. », combien y a-t-il de verbes conjugués ?",["Un","Deux","Trois"],1,"« s'allume » et « recule » sont conjugués."],["Quelle phrase est complexe ?",["La porte grince.","Naïa hésite, puis elle avance.","Un immense miroir argenté."],1,"« hésite » et « avance » forment deux propositions."],["Raconte l'ouverture de la porte en deux phrases, dont une avec deux verbes conjugués.",["J'ai écrit deux phrases.","Une de mes phrases contient deux verbes conjugués."],"La porte s'ouvrit doucement. Naïa sursauta et Juno éclata de rire."]],
  [["Dans « Juno danse tandis que Sam joue du piano. », combien de verbes sont conjugués ?",["Un","Deux","Quatre"],1,"« danse » et « joue » sont conjugués."],["Choisis la phrase simple.",["Quand le bal commence, Céleste sourit.","Céleste sourit.","Céleste sourit et Juno applaudit."],1,"Une seule proposition avec « sourit »."],["Écris deux phrases sur une répétition de danse : une simple, une complexe.",["J'ai écrit deux phrases.","J'ai utilisé au moins deux verbes conjugués dans l'une d'elles."],"La musique démarre. Juno tourne et Céleste applaudit."]],
  [["Dans « Le carnet tombe lorsque Sam court. », quels sont les verbes conjugués ?",["tombe et court","carnet et Sam","tombe seulement"],0,"« tombe » et « court » sont les deux verbes conjugués."],["Quelle phrase contient deux propositions ?",["Le carnet aux pages bleues.","Sam écrit et la page s'anime.","Sam écrit dans le carnet."],1,"« écrit » et « s'anime » sont conjugués."],["Imagine deux phrases sur un carnet magique, dont une complexe.",["Mes phrases racontent un petit événement.","J'ai relié deux actions dans une phrase."],"Sam écrit une phrase. Le carnet frémit quand il termine son dernier mot."]],
  [["Dans « La pluie cesse mais le ciel reste gris. », combien de propositions trouve-t-on ?",["Une","Deux","Aucune"],1,"« cesse » et « reste » appartiennent à deux propositions."],["Laquelle de ces phrases est simple ?",["Le ciel se couvre et le vent souffle.","La pluie cesse.","La pluie cesse car le vent tourne."],1,"« cesse » est le seul verbe conjugué."],["Décris la fin d'un orage en deux phrases, dont une complexe.",["J'ai écrit deux phrases.","J'ai utilisé deux verbes conjugués dans une même phrase."],"La pluie s'arrête. Les nuages s'écartent et le soleil revient."]]
 ]},
 {id:"fp-relatives",topic:"Les propositions relatives",tag:"Grammaire",tip:"Une proposition relative complète un nom et commence souvent par qui, que, dont ou où.",variants:[
  [["Dans « Le miroir qui brille cache un secret. », quel mot introduit la relative ?",["miroir","qui","secret"],1,"« qui brille » complète « le miroir »."],["Complète : « La porte ___ apparaît est bleue. »",["qui","que","où"],0,"« qui » est sujet du verbe « apparaît »."],["Décris un objet magique avec une phrase contenant « qui ».",["Mon texte décrit un objet.","J'ai utilisé « qui » pour ajouter une précision."],"J'ai trouvé un bracelet qui change de couleur au soleil."]],
  [["Dans « Le livre que Naïa découvre est ancien. », quelle partie précise le livre ?",["que Naïa découvre","est ancien","Naïa"],0,"« que Naïa découvre » est la proposition relative."],["Complète : « Le carnet ___ tu cherches est ici. »",["qui","que","dont"],1,"« que » reprend « le carnet », complément du verbe « cherches »."],["Écris une phrase avec « que » pour préciser un livre ou un objet.",["Ma phrase est compréhensible.","La relative commence par « que »."],"Le livre que Juno a trouvé contient une carte étrange."]],
  [["Dans « La salle où elles dansent est immense. », quel mot introduit la relative ?",["salle","où","immense"],1,"« où elles dansent » précise le lieu."],["Complète : « Voici le théâtre ___ nous répétons. »",["où","dont","qui"],0,"« où » indique un lieu."],["Écris deux phrases sur un lieu, dont une avec « où ».",["J'ai décrit un lieu.","J'ai utilisé « où » pour préciser ce lieu."],"La salle est vide. C'est le théâtre où les élèves répètent."]],
  [["Dans « L'histoire dont elle parle est mystérieuse. », quelle relative trouve-t-on ?",["dont elle parle","elle parle","est mystérieuse"],0,"« dont » remplace un complément introduit par « de » : parler de."],["Complète : « C'est le mystère ___ Sam se souvient. »",["qui","dont","où"],1,"On se souvient de quelque chose : « dont »."],["Imagine une phrase avec « dont » à propos d'un secret.",["J'ai parlé d'un secret.","J'ai utilisé « dont » pour introduire une relative."],"C'est le secret dont personne ne voulait parler."]]
 ]},
 {id:"fp-discours",topic:"Paroles directes et indirectes",tag:"Grammaire",tip:"Le discours direct rapporte les mots prononcés. Le discours indirect les intègre dans une phrase.",variants:[
  [["« Juno dit : “Je reviendrai demain.” » Quel discours est employé ?",["Direct","Indirect","Ni l'un ni l'autre"],0,"Les paroles sont rapportées directement."],["Quelle phrase rapporte ces paroles indirectement ?",["Juno dit qu'elle reviendra le lendemain.","Juno : « Je reviendrai demain. »","Elle reviendra demain ?"],0,"« qu'elle reviendra » dépend du verbe « dit » et « demain » devient « le lendemain » dans ce récit."],["Imagine un personnage qui parle, puis reformule ses paroles indirectement.",["J'ai écrit une réplique.","J'ai reformulé la réplique sans guillemets."],"Sam dit : « Je suis prêt. » Puis on raconte que Sam est prêt."]],
  [["« Céleste murmura qu'elle avait peur. » Le discours est...",["Direct","Indirect","Une didascalie"],1,"Les paroles sont intégrées après « qu' »."],["Choisis le discours direct correspondant.",["Céleste murmura : « J'ai peur. »","Céleste murmura qu'elle a peur.","Céleste a peur de parler."],0,"Les paroles sont encadrées par des guillemets."],["Écris une réplique de Céleste et rapporte-la au discours indirect.",["J'ai inventé une réplique.","Ma deuxième phrase reformule ce qu'elle a dit."],"« Je veux essayer », dit Céleste. Céleste dit qu'elle veut essayer."]],
  [["« Naïa demanda si la porte était ouverte. » Quel discours est employé ?",["Direct","Indirect","Aucun"],1,"La question est rapportée après « si »."],["Quelle est une formulation directe possible ?",["Naïa demanda : « La porte est-elle ouverte ? »","Naïa demanda si la porte était ouverte.","Naïa se demande pourquoi."],0,"Les guillemets restituent la question."],["Écris une question directe, puis raconte cette question au discours indirect.",["J'ai posé une question.","J'ai utilisé « demanda si » ou « demanda pourquoi »."],"Juno demanda : « La clé fonctionne-t-elle ? » Juno demanda si la clé fonctionnait."]],
  [["« Sam annonça : “Nous avons trouvé une carte !” » Le discours est...",["Direct","Indirect","Une description"],0,"Les mots exacts apparaissent entre guillemets."],["Quelle phrase correspond au discours indirect ?",["Sam annonça qu'ils avaient trouvé une carte.","Sam : « Nous avons trouvé une carte ! »","Une carte était sur le sol."],0,"« nous avons » devient « ils avaient » dans ce contexte raconté au passé."],["Fais parler Sam puis raconte ce qu'il a annoncé.",["J'ai écrit une réplique.","Je l'ai reformulée sans guillemets."],"Sam s'écria : « Nous avons gagné ! » Puis il annonça qu'ils avaient gagné."]]
 ]},
 {id:"fp-participe",topic:"Participe passé avec avoir",tag:"Orthographe",tip:"Avec avoir, le participe passé s'accorde avec le COD si celui-ci est placé avant le verbe.",variants:[
  [["Dans « Naïa a trouvé les clés », le COD est placé...",["Avant « a trouvé »","Après « a trouvé »","Il n'y a pas de COD"],1,"« les clés » est après le verbe ; « trouvé » reste inchangé."],["Complète : « Les clés, Naïa les a ___ ». ",["trouvée","trouvés","trouvées"],2,"« les » reprend « les clés », féminin pluriel, avant le verbe."],["Écris deux phrases parlant de clés retrouvées, dont une avec « les a retrouvées ».",["Mes phrases sont compréhensibles.","J'ai utilisé « les a retrouvées » à bon escient."],"Naïa cherchait ses clés. Elle les a retrouvées sous la table."]],
  [["Dans « Juno a choisi une chanson », où est placé le COD ?",["Avant le verbe","Après le verbe","Aucun COD"],1,"« une chanson » suit le verbe."],["Complète : « La chanson qu'elle a ___ est douce. »",["choisi","choisie","choisis"],1,"« qu' » reprend « la chanson », féminin singulier, placé avant le verbe."],["Écris une phrase avec « la chanson qu'elle a choisie ».",["Ma phrase parle d'une chanson.","Le participe passé est accordé avec le COD avant le verbe."],"La chanson qu'elle a choisie ouvre le spectacle."]],
  [["Dans « Ils ont décoré les affiches », le participe passé est...",["décoré","décorées","décorés"],0,"Le COD suit le verbe, donc pas d'accord avec avoir."],["Complète : « Les affiches, ils les ont ___ ». ",["décorés","décoré","décorées"],2,"« les » reprend « affiches », féminin pluriel, avant le verbe."],["Écris une phrase sur des affiches, avec « les ont décorées ».",["J'ai écrit une phrase complète.","J'ai accordé le participe passé avec « les »."],"Les affiches étaient blanches ; ils les ont décorées ensemble."]],
  [["Dans « Sam a écrit les lettres », le participe passé est...",["écrites","écrit","écrits"],1,"Le COD « les lettres » est après le verbe."],["Complète : « Les lettres que Sam a ___ sont secrètes. »",["écrit","écrite","écrites"],2,"« que » reprend « les lettres », féminin pluriel, avant « a écrites »."],["Écris une phrase avec « les lettres qu'il a écrites ».",["J'ai utilisé une relative.","J'ai accordé « écrites » avec « lettres »."],"Les lettres qu'il a écrites contiennent des indices précieux."]]
 ]},
 {id:"fp-figures",topic:"Comparaisons et figures de style",tag:"Vocabulaire littéraire",tip:"Une comparaison utilise un outil comme « comme » ; une métaphore n'en a pas ; une personnification donne des traits humains à autre chose.",variants:[
  [["« La lune brillait comme une lampe. » Quelle figure reconnais-tu ?",["Métaphore","Comparaison","Personnification"],1,"« comme » est un outil de comparaison."],["« La lune est une lampe suspendue. » Quelle figure reconnais-tu ?",["Métaphore","Comparaison","Anaphore"],0,"Le rapprochement est fait sans « comme »."],["Décris le ciel avec une comparaison et une métaphore, en deux phrases.",["Une phrase utilise un outil de comparaison.","Une phrase crée une image sans cet outil."],"Les étoiles brillent comme des éclats de verre. La nuit est un grand rideau de velours."]],
  [["« Le vent murmurait contre la fenêtre. » Quelle figure apparaît ?",["Personnification","Comparaison","Antithèse"],0,"Le vent reçoit un comportement humain : murmurer."],["« Les ombres dansent sur les murs. » La figure est...",["Comparaison","Personnification","Énumération"],1,"Les ombres semblent effectuer une action humaine."],["Décris un objet magique comme s'il était vivant.",["Un objet semble agir comme un humain.","J'ai utilisé un verbe évocateur."],"Le miroir chuchote doucement, puis détourne le regard."]],
  [["« Je t'ai attendu mille ans ! » Il s'agit d'une...",["Hyperbole","Comparaison","Métonymie"],0,"L'exagération est volontaire."],["« Il murmure, parle, crie puis hurle. » C'est une...",["Métaphore","Gradation","Comparaison"],1,"Les verbes expriment une intensité croissante."],["Écris une exagération amusante et une gradation.",["J'ai inventé une hyperbole.","J'ai rangé des mots du moins intense au plus intense."],"J'ai attendu une éternité ! Je chuchote, je parle, je crie."]],
  [["« Le cœur de la ville battait la nuit. » Quelle figure est utilisée ?",["Métaphore","Comparaison","Ellipse"],0,"« cœur » est une image pour désigner le centre vivant de la ville."],["« La ville s'endormait sous les étoiles. » Quelle figure reconnais-tu ?",["Personnification","Comparaison","Assonance"],0,"Une ville semble accomplir une action humaine."],["Décris une ville la nuit en utilisant une image et une personnification.",["J'ai créé une image pour la ville.","J'ai donné une action humaine à un lieu ou à un objet."],"La ville est un océan de lumières. Ses rues chuchotent au passage des voyageurs."]]
 ]},
 {id:"fp-recits",topic:"Vocabulaire du récit et de l'information",tag:"Lecture et vocabulaire",tip:"Intrigue, péripéties et dénouement structurent un récit. Dans la presse, on distingue une information vérifiable d'une opinion.",variants:[
  [["Dans une histoire, qu'appelle-t-on « intrigue » ?",["La liste des personnages","L'ensemble des événements et des conflits","Le titre uniquement"],1,"L'intrigue fait avancer le récit."],["Une disparition inattendue qui change l'histoire est une...",["Péripétie","Dénouement","Préface"],0,"La péripétie modifie le cours des événements."],["Imagine en deux phrases une intrigue avec une péripétie.",["Ma première phrase présente un problème.","Ma deuxième phrase ajoute un événement imprévu."],"La clé du théâtre a disparu. Soudain, une autre clé tombe du ciel."]],
  [["À la fin d'une enquête, la solution du mystère est le...",["Dénouement","Dialogue","Décor"],0,"Le dénouement résout le problème principal."],["Un retour dans le passé, au milieu du récit, est une...",["Prolepse","Analepse","Ellipse"],1,"L'analepse raconte un événement antérieur."],["Écris deux phrases : un mystère puis son dénouement.",["Un problème est posé.","La fin apporte une réponse."],"La lettre semblait perdue. Juno découvrit qu'elle était cachée dans la doublure du manteau."]],
  [["« La réunion commence à 14 heures. » Cette phrase est plutôt...",["Un fait vérifiable","Une opinion","Une métaphore"],0,"L'heure annoncée peut être vérifiée."],["« Cette réunion est beaucoup trop longue. » Cette phrase est...",["Un fait mesuré","Une opinion","Une date"],1,"« trop longue » exprime une appréciation."],["Écris deux phrases sur un spectacle : un fait vérifiable et une opinion.",["J'ai formulé un fait vérifiable.","J'ai formulé un jugement personnel."],"Le spectacle commence à 19 heures. Je trouve les costumes magnifiques."]],
  [["Quel mot désigne la phrase destinée à attirer l'attention au début d'un article ?",["Accroche","Dénouement","Réplique"],0,"Une accroche attire le lecteur."],["Un journaliste qui vérifie plusieurs sources mène un...",["Journalisme d'investigation","Conte merveilleux","Monologue"],0,"Une enquête journalistique recoupe des documents et témoignages."],["Imagine un titre accrocheur pour un article, puis une phrase factuelle.",["Le titre donne envie de lire.","La phrase suivante est une information vérifiable."],"Une porte mystérieuse au théâtre ? La mairie a annoncé la réouverture du bâtiment mardi."]]
 ]}
];
const TOPICS=DATA.map(d=>({id:d.id,topic:d.topic,tag:d.tag,subject:"Français",type:"frenchPath",minutes:5}));
const map=new Map(DATA.map(d=>[d.id,d]));
const LEXICON=[
 ["Comparaison","Rapprochement entre deux éléments à l'aide de « comme », « tel »…","Sa robe brille comme une étoile.","Figures de style"],
 ["Métaphore","Image qui rapproche deux éléments sans outil de comparaison.","Ce couloir est une rivière d'ombres.","Figures de style"],
 ["Personnification","Procédé qui prête un comportement humain à un objet ou à un animal.","Le miroir s'obstine à garder son secret.","Figures de style"],
 ["Hyperbole","Exagération volontaire pour renforcer une impression.","J'ai attendu une éternité !","Figures de style"],
 ["Gradation","Suite de mots dont l'intensité progresse.","Il chuchote, parle, crie et hurle.","Figures de style"],
 ["Anaphore","Répétition d'un même début de phrase ou de vers.","Je cherche la clé. Je cherche la porte.","Figures de style"],
 ["Antithèse","Rapprochement de deux idées opposées.","Elle rit malgré sa peur.","Figures de style"],
 ["Quatrain","Strophe de quatre vers.","Un court poème en quatre vers.","Poésie"],
 ["Alexandrin","Vers de douze syllabes dans la versification classique.","Beaucoup de tirades classiques sont écrites en alexandrins.","Poésie"],
 ["Calligramme","Poème dont la disposition forme un dessin.","Les mots d'un poème dessinent un oiseau.","Poésie"],
 ["Quiproquo","Malentendu dans lequel on confond des paroles, des objets ou des personnes.","Juno confond une invitation avec une menace.","Théâtre"],
 ["Tirade","Longue réplique prononcée par un personnage au théâtre.","Le personnage défend son idée sans être interrompu.","Théâtre"],
 ["Aparté","Parole entendue du public, mais supposée inaudible pour les personnages.","Un personnage révèle son secret aux spectateurs.","Théâtre"],
 ["Intrigue","Enchaînement des événements et conflits qui font avancer une histoire.","La disparition d'un carnet lance l'enquête.","Récit"],
 ["Péripétie","Événement imprévu qui fait avancer le récit.","Une clé apparaît dans une poche vide.","Récit"],
 ["Dénouement","Moment où le problème principal de l'histoire trouve une solution.","Le secret du miroir est enfin expliqué.","Récit"],
 ["Analepse","Retour en arrière dans un récit.","Naïa se souvient de son premier jour au collège.","Récit"],
 ["Prolepse","Annonce d'un événement qui se produira plus tard dans l'histoire.","Elle ne savait pas encore que tout changerait demain.","Récit"],
 ["Fait","Information vérifiable, indépendamment d'une opinion.","La bibliothèque ouvre à 10 heures.","Presse"],
 ["Opinion","Jugement personnel qui exprime un point de vue.","Cette bibliothèque est la plus belle de la ville.","Presse"],
 ["Accroche","Phrase au début d'un article qui cherche à attirer l'attention.","Une énigme dans le vieux théâtre ?","Presse"]
].map(([term,definition,example,category])=>({term,definition,example,category}));
const AUTHORS=[
 ["Guy de Maupassant","Nouvelle réaliste et fantastique","Le Horla","Ses récits jouent parfois sur l'incertitude entre réalité et surnaturel."],
 ["Victor Hugo","Roman, poésie, théâtre","Les Misérables","Il explore notamment l'injustice, les sentiments et la ville."],
 ["Molière","Théâtre, comédie","L'Avare","Ses comédies font rire tout en critiquant certains comportements."],
 ["Guillaume Apollinaire","Poésie moderne","Calligrammes","Il expérimente la forme visuelle des poèmes."],
 ["Émile Zola","Roman naturaliste","Germinal","Il observe les conditions de vie et les milieux sociaux."],
 ["George Sand","Roman et romantisme","La Mare au diable","Ses romans associent souvent liberté, nature et questions sociales."],
 ["Mary Shelley","Roman gothique et science-fiction","Frankenstein","Ses récits interrogent les conséquences des expériences humaines."],
 ["George Orwell","Roman et satire","La Ferme des animaux","Ses fictions montrent comment le pouvoir peut déformer la vérité."]
].map(([name,genre,work,essential])=>({name,genre,work,essential}));
const scenario=(topicId,variant)=>map.get(topicId)?.variants[variant]||null;
function create(state,topicId,origin="libre",sessionId=null){
 if(!map.has(topicId))return null;
 const history=Array.isArray(state.frenchPathHistory)?state.frenchPathHistory:[];
 const count=history.filter(h=>h.topicId===topicId).length;
 return {topicId,variant:count%4,cursor:0,answers:[],draft:"",feedback:"",hintShown:false,finished:false,recorded:false,origin,sessionId,createdAt:Date.now()};
}
function current(c){
 if(!c||c.finished||c.cursor<0||c.cursor>2)return null;
 const s=scenario(c.topicId,c.variant);if(!s)return null;
 const raw=s[c.cursor],level=STEPS[c.cursor];
 if(c.cursor===2)return {id:c.topicId+"-"+c.variant+"-reutiliser",step:c.cursor,level,kind:"writing",prompt:raw[0],checklist:raw[1],example:raw[2]};
 return {id:c.topicId+"-"+c.variant+"-"+level.id,step:c.cursor,level,kind:"choice",question:raw[0],options:raw[1],answer:raw[2],explanation:raw[3]};
}
function answered(c){return !!c?.answers?.some(a=>a.step===c.cursor)}
function select(c,index){
 const q=current(c);if(!q||q.kind!=="choice"||answered(c)||!Number.isInteger(index)||index<0||index>=q.options.length)return {valid:false};
 const correct=index===q.answer;
 c.answers.push({step:c.cursor,id:q.id,correct,kind:"choice",assisted:!!c.hintShown,answer:index,at:Date.now()});
 c.feedback=(correct?"Bien vu. ":"Ce n'est pas la bonne réponse. ")+q.explanation;
 return {valid:true,correct};
}
function saveWriting(c,text,skipped=false){
 const q=current(c);if(!q||q.kind!=="writing"||answered(c))return {valid:false,reason:"Cette étape est déjà terminée."};
 const clean=String(text??"").trim().slice(0,1200);
 if(!skipped&&clean.split(/\s+/).filter(Boolean).length<8)return {valid:false,reason:"Essaie une ou deux phrases (au moins huit mots), ou choisis « Passer »."};
 c.answers.push({step:c.cursor,id:q.id,kind:"writing",completed:!skipped,skipped,autocorrected:false,text:clean,at:Date.now()});
 c.feedback=skipped?"Tu peux revenir sur ce texte une autre fois.":"Ton texte est enregistré. Les critères t'aident à te relire ; aucune note automatique.";
 c.draft="";
 return {valid:true,completed:!skipped};
}
function advance(c){
 if(!c||!answered(c)||c.finished)return false;
 c.cursor++;c.draft="";c.hintShown=false;c.feedback="";
 if(c.cursor>=3)c.finished=true;
 return true;
}
function summary(c){
 const a=c?.answers||[];
 return {correct:a.filter(x=>x.kind==="choice"&&x.correct).length,questions:a.filter(x=>x.kind==="choice").length,
 written:a.some(x=>x.kind==="writing"&&x.completed),skipped:a.some(x=>x.kind==="writing"&&x.skipped),
 completed:!!c?.finished};
}
function record(state,c){
 if(!c?.finished||c.recorded)return null;
 const s=summary(c);
 if(!Array.isArray(state.frenchPathHistory))state.frenchPathHistory=[];
 state.frenchPathHistory.push({topicId:c.topicId,variant:c.variant,...s,at:Date.now()});
 if(state.frenchPathHistory.length>100)state.frenchPathHistory.splice(0,state.frenchPathHistory.length-100);
 c.recorded=true;return s;
}
function audit(){
 const errors=[];
 for(const d of DATA){
  if(d.variants.length!==4)errors.push(d.id+" nvariants");
  for(let i=0;i<d.variants.length;i++){
   const v=d.variants[i];if(v.length!==3)errors.push(d.id+" "+i+" length");
   for(let k=0;k<2;k++){const q=v[k];if(!q||q.length!==4||q[1].length!==3||!Number.isInteger(q[2])||q[2]<0||q[2]>2||new Set(q[1]).size!==3)errors.push(d.id+" "+i+" "+k+" broken")}
   if(v[2]?.[1]?.length!==2||!v[2][0]||!v[2][2])errors.push(d.id+" "+i+" writing");
  }
 }
 if(LEXICON.length<20||AUTHORS.length<6)errors.push("references too short");
 return {topics:TOPICS.length,scenarios:DATA.reduce((x,d)=>x+d.variants.length,0),activities:DATA.reduce((x,d)=>x+d.variants.length*3,0),lexicon:LEXICON.length,authors:AUTHORS.length,errors};
}
return {TOPICS,STEPS,LEXICON,AUTHORS,create,current,answered,select,saveWriting,advance,summary,record,audit};
})();
if(typeof window!=='undefined')window.FrenchPaths=FrenchPaths;
if(typeof module!=='undefined'&&module.exports)module.exports=FrenchPaths;
