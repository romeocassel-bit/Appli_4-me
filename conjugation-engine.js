'use strict';
// Défis de conjugaison originaux. Formes explicites, vérifiées par tests déterministes.
const ConjugationEngine=(function buildConjugation(){
  "use strict";
  const TENSES=[
    {key:"present",label:"Présent",context:"En ce moment",detail:"Ce qui se passe maintenant"},
    {key:"imparfait",label:"Imparfait",context:"Autrefois",detail:"Une habitude ou une situation passée"},
    {key:"futur",label:"Futur simple",context:"Demain",detail:"Ce qui se passera plus tard"},
    {key:"passe",label:"Passé composé",context:"Hier",detail:"Un fait achevé dans le passé"}
  ];
  const TOPICS=[
    {id:"ct:present",tense:"present",topic:"Conjugaison — présent",subject:"Français",type:"challenge",minutes:4,priority:0},
    {id:"ct:imparfait",tense:"imparfait",topic:"Conjugaison — imparfait",subject:"Français",type:"challenge",minutes:4,priority:0.1},
    {id:"ct:futur",tense:"futur",topic:"Conjugaison — futur simple",subject:"Français",type:"challenge",minutes:4,priority:0.2},
    {id:"ct:passe",tense:"passe",topic:"Conjugaison — passé composé",subject:"Français",type:"challenge",minutes:4,priority:0.3},
    {id:"ct:mixte",tense:"mixte",topic:"Conjugaison — tous les temps",subject:"Français",type:"challenge",minutes:4,priority:0.4,requires:["ct:present","ct:imparfait"]}
  ];
  const SUBJECTS=[
    {name:"je",pronoun:"je",label:"je / j’"},
    {name:"tu",pronoun:"tu",label:"tu"},
    {name:"Naïa",pronoun:"elle",label:"elle"},
    {name:"nous",pronoun:"nous",label:"nous"},
    {name:"vous",pronoun:"vous",label:"vous"},
    {name:"Juno et Sam",pronoun:"ils",label:"ils"}
  ];
  const AUX=["ai","as","a","avons","avez","ont"];
  const VERBS=[
    {id:"danser",complement:"sur la scène",level:1,pp:"dansé",
      present:["danse","danses","danse","dansons","dansez","dansent"],
      imparfait:["dansais","dansais","dansait","dansions","dansiez","dansaient"],
      futur:["danserai","danseras","dansera","danserons","danserez","danseront"]},
    {id:"chanter",complement:"dans la salle de musique",level:1,pp:"chanté",
      present:["chante","chantes","chante","chantons","chantez","chantent"],
      imparfait:["chantais","chantais","chantait","chantions","chantiez","chantaient"],
      futur:["chanterai","chanteras","chantera","chanterons","chanterez","chanteront"]},
    {id:"jouer",complement:"une mélodie au piano",level:1,pp:"joué",
      present:["joue","joues","joue","jouons","jouez","jouent"],
      imparfait:["jouais","jouais","jouait","jouions","jouiez","jouaient"],
      futur:["jouerai","joueras","jouera","jouerons","jouerez","joueront"]},
    {id:"inventer",complement:"une chorégraphie originale",level:1,pp:"inventé",
      present:["invente","inventes","invente","inventons","inventez","inventent"],
      imparfait:["inventais","inventais","inventait","inventions","inventiez","inventaient"],
      futur:["inventerai","inventeras","inventera","inventerons","inventerez","inventeront"]},
    {id:"finir",complement:"un dessin coloré",level:2,pp:"fini",
      present:["finis","finis","finit","finissons","finissez","finissent"],
      imparfait:["finissais","finissais","finissait","finissions","finissiez","finissaient"],
      futur:["finirai","finiras","finira","finirons","finirez","finiront"]},
    {id:"choisir",complement:"un ruban lumineux",level:2,pp:"choisi",
      present:["choisis","choisis","choisit","choisissons","choisissez","choisissent"],
      imparfait:["choisissais","choisissais","choisissait","choisissions","choisissiez","choisissaient"],
      futur:["choisirai","choisiras","choisira","choisirons","choisirez","choisiront"]},
    {id:"réussir",complement:"le défi du miroir",level:2,pp:"réussi",
      present:["réussis","réussis","réussit","réussissons","réussissez","réussissent"],
      imparfait:["réussissais","réussissais","réussissait","réussissions","réussissiez","réussissaient"],
      futur:["réussirai","réussiras","réussira","réussirons","réussirez","réussiront"]},
    {id:"prendre",complement:"une carte mystérieuse",level:3,pp:"pris",
      present:["prends","prends","prend","prenons","prenez","prennent"],
      imparfait:["prenais","prenais","prenait","prenions","preniez","prenaient"],
      futur:["prendrai","prendras","prendra","prendrons","prendrez","prendront"]},
    {id:"faire",complement:"une décoration pour le bal",level:3,pp:"fait",
      present:["fais","fais","fait","faisons","faites","font"],
      imparfait:["faisais","faisais","faisait","faisions","faisiez","faisaient"],
      futur:["ferai","feras","fera","ferons","ferez","feront"]},
    {id:"voir",complement:"une étoile dans le miroir",level:3,pp:"vu",
      present:["vois","vois","voit","voyons","voyez","voient"],
      imparfait:["voyais","voyais","voyait","voyions","voyiez","voyaient"],
      futur:["verrai","verras","verra","verrons","verrez","verront"]},
    {id:"écrire",complement:"un message secret",level:3,pp:"écrit",
      present:["écris","écris","écrit","écrivons","écrivez","écrivent"],
      imparfait:["écrivais","écrivais","écrivait","écrivions","écriviez","écrivaient"],
      futur:["écrirai","écriras","écrira","écrirons","écrirez","écriront"]},
    {id:"lire",complement:"une histoire fantastique",level:3,pp:"lu",
      present:["lis","lis","lit","lisons","lisez","lisent"],
      imparfait:["lisais","lisais","lisait","lisions","lisiez","lisaient"],
      futur:["lirai","liras","lira","lirons","lirez","liront"]},
    {id:"être",complement:"dans le grand hall",level:3,pp:"été",
      present:["suis","es","est","sommes","êtes","sont"],
      imparfait:["étais","étais","était","étions","étiez","étaient"],
      futur:["serai","seras","sera","serons","serez","seront"]},
    {id:"avoir",complement:"une idée pour la fête",level:3,pp:"eu",
      present:["ai","as","a","avons","avez","ont"],
      imparfait:["avais","avais","avait","avions","aviez","avaient"],
      futur:["aurai","auras","aura","aurons","aurez","auront"]}
  ];
  const index=new Map();
  function makeItem(verb,tense,person,vi,ti) {
    const sid=SUBJECTS[person];
    const answerForm=tense==="passe"?AUX[person]+" "+verb.pp:verb[tense][person];
    const elide=person===0 && (tense==="passe"||/^[aeiouéèêëàâîïôùû]/i.test(answerForm));
    const subject=elide?"j'":sid.name;
    const blank=elide?subject+"___":subject+" ___";
    const context=TENSES.find(t=>t.key===tense);
    const question=context.context+", "+blank+" "+verb.complement+".";
    const candidates=tense==="passe"?
      AUX.filter((x,i)=>i!==person).map(aux=>aux+" "+verb.pp):
      [1,2,3,4,5,0].filter(p=>p!==person).map(p=>verb[tense][p]);
    if(tense!=="passe") {
      for(const t of TENSES.filter(x=>x.key!==tense)){
        candidates.push(t.key==="passe"?AUX[person]+" "+verb.pp:verb[t.key][person]);
      }
    }
    const others=[];
    for(const x of candidates)if(x!==answerForm&&!others.includes(x)){others.push(x);if(others.length===2)break}
    if(others.length!==2)throw Error("Distractors "+verb.id+" "+tense+" "+person);
    const correctIndex=(vi*11+ti*7+person*5)%3;
    const options=others.slice();
    options.splice(correctIndex,0,answerForm);
    const personLabel=sid.pronoun;
    const agreement=`« ${sid.name} » correspond à « ${personLabel} »`;
    const why=`${context.label} : ${agreement}. Pour « ${verb.id} », la bonne forme est « ${answerForm} ».`;
    const hint=`Repère le sujet : ${agreement}. L'indication « ${context.context.toLowerCase()} » aide à reconnaître le temps.`;
    return {
      id:"cv:"+tense+":"+verb.id+":"+person,
      tense,tenseLabel:context.label,verb:verb.id,person,difficulty:verb.level,question,
      options,answer:correctIndex,why,hint,correctForm:answerForm
    };
  }
  for(let vi=0;vi<VERBS.length;vi++){
    const verb=VERBS[vi];
    for(let ti=0;ti<TENSES.length;ti++)
      for(let person=0;person<6;person++){
        const item=makeItem(verb,TENSES[ti].key,person,vi,ti);
        if(index.has(item.id))throw Error("Duplicate "+item.id);
        index.set(item.id,item);
      }
  }
  const getQuestion=id=>index.get(id)||null;
  const poolFor=tense=>[...index.values()].filter(q=>tense==="mixte"||q.tense===tense);
  function history(state){
    return Array.isArray(state.conjugationHistory)?state.conjugationHistory:[];
  }
  function create(state,topicId,count=5,origin="libre",sessionId=null){
    const topic=TOPICS.find(t=>t.id===topicId);
    if(!topic)return null;
    const desired=[3,4,5,8].includes(count)?count:5;
    const previous=history(state),used=new Set(),questions=[],verbs=new Set(),persons=new Set();
    const mastery=state.reviews&&state.reviews[topicId]?state.reviews[topicId].stage:0;
    const levels=mastery>=3?[2,2,3,3]:mastery>=1?[1,2,2,3]:[1,1,2,2];
    const allTenses=topic.tense==="mixte"?TENSES.map(x=>x.key):[topic.tense];
    const rotate=previous.filter(x=>x.topicId===topicId).length%allTenses.length;
    for(let i=0;i<desired;i++){
      const tense=allTenses[(i+rotate)%allTenses.length];
      const targetLevel=levels[Math.min(i,levels.length-1)];
      const candidates=poolFor(tense).filter(q=>!used.has(q.id));
      candidates.sort((a,b)=>{
        function score(q){
          const recent=previous.slice(-85).findLastIndex(e=>e.questionId===q.id);
          const repeat=recent<0?0:70+recent;
          const difficulty=Math.abs(q.difficulty-targetLevel)*12;
          const sameVerb=verbs.has(q.verb)?22:0;
          const samePerson=persons.has(q.person)?4:0;
          return repeat+difficulty+sameVerb+samePerson-(typeof PersonalizationEngine!=='undefined'?PersonalizationEngine.questionBias(state,topicId,q):0);
        }
        return score(a)-score(b)||a.id.localeCompare(b.id);
      });
      const best=candidates[0];
      if(!best)break;
      used.add(best.id);verbs.add(best.verb);persons.add(best.person);questions.push(best.id);
    }
    if(questions.length!==desired)throw Error("Banque insuffisante pour "+topicId);
    return {topicId,questions,cursor:0,answers:[],hintShown:false,finished:false,
      recorded:false,origin,sessionId,createdAt:Date.now()};
  }
  function current(challenge){
    return challenge&&challenge.questions&&getQuestion(challenge.questions[challenge.cursor]);
  }
  function hasAnswer(challenge){
    return challenge&&challenge.answers.some(x=>x.atIndex===challenge.cursor);
  }
  function answer(challenge,indexValue) {
    const q=current(challenge);
    if(!q||challenge.finished||hasAnswer(challenge))return null;
    if(!Number.isInteger(indexValue)||indexValue<0||indexValue>=q.options.length)return null;
    const result={atIndex:challenge.cursor,questionId:q.id,correct:indexValue===q.answer,
      assisted:Boolean(challenge.hintShown),answer:indexValue,tense:q.tense,verb:q.verb,at:Date.now()};
    challenge.answers.push(result);
    return result;
  }
  function advance(challenge){
    if(!challenge||!hasAnswer(challenge)||challenge.finished)return false;
    challenge.cursor++;
    challenge.hintShown=false;
    if(challenge.cursor>=challenge.questions.length)challenge.finished=true;
    return true;
  }
  function summary(challenge){
    const answers=challenge.answers||[];
    const correct=answers.filter(x=>x.correct).length;
    const assisted=answers.filter(x=>x.correct&&x.assisted).length;
    return {total:challenge.questions.length,attempted:answers.length,correct,assisted,
      independent:answers.filter(x=>x.correct&&!x.assisted).length,
      completed:Boolean(challenge.finished),
      autonomous:challenge.finished&&correct===challenge.questions.length&&assisted===0};
  }
  return {TOPICS,TENSES,VERBS,questionCount:index.size,poolFor,getQuestion,create,current,answer,advance,summary,history};
})();
if(typeof window!=='undefined')window.ConjugationEngine=ConjugationEngine;
if(typeof module!=='undefined'&&module.exports)module.exports=ConjugationEngine;
