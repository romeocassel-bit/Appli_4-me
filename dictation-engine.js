'use strict';
// Correction locale fondée sur les mots, sans service distant ni diagnostic automatique.
const DictationEngine=(function makeDictationEngine(){
  "use strict";
  const WORDS=/[\p{L}\p{M}\p{N}]+(?:[-‐‑‒–—'’][\p{L}\p{M}\p{N}]+)*/gu;
  const normalize=s=>String(s||"").normalize("NFC").toLocaleLowerCase("fr").replace(/[’‘]/g,"'").replace(/[‐‑‒–—]/g,"-");
  const stripAccents=s=>normalize(s).normalize("NFD").replace(/\p{M}/gu,"");
  const tokenize=s=>(String(s||"").normalize("NFC").match(WORDS)||[]).map(text=>({text,norm:normalize(text)}));
  const msg={
    accord:"Vérifie le genre ou le nombre du mot qui commande cet accord.",
    homophone:"Ces mots se prononcent de façon proche, mais n'ont pas le même rôle.",
    "forme-verbale":"Observe l'auxiliaire et la terminaison du verbe.",
    accent:"Vérifie les accents de ce mot.",
    orthographe:"Observe les lettres de ce mot dans la correction.",
    oubli:"Un mot de la phrase n'apparaît pas dans ta dictée.",
    ajout:"Un mot a été ajouté à la phrase."
  };
  function compare(expected,actual,rules=[]){
    const target=tokenize(expected).slice(0,120),written=tokenize(actual).slice(0,160);
    const n=target.length,m=written.length;
    if(!n)return {valid:false,reason:"Cette dictée ne contient pas de texte à corriger.",correct:false,errors:[]};
    if(!m)return {valid:false,reason:"Écris au moins quelques mots avant de corriger.",correct:false,errors:[]};
    if(String(actual||"").length>1800)return {valid:false,reason:"Le texte est trop long pour cette mini-dictée.",correct:false,errors:[]};
    const dp=Array.from({length:n+1},()=>new Uint16Array(m+1));
    for(let i=0;i<=n;i++)dp[i][0]=i;
    for(let j=0;j<=m;j++)dp[0][j]=j;
    for(let i=1;i<=n;i++)for(let j=1;j<=m;j++){
      const sub=target[i-1].norm===written[j-1].norm?0:1;
      dp[i][j]=Math.min(dp[i-1][j-1]+sub,dp[i-1][j]+1,dp[i][j-1]+1);
    }
    const errors=[];
    const ruleMap=new Map(rules.map(r=>[normalize(r.target),r]));
    let i=n,j=m;
    function describe(expectedToken,actualToken){
      const actualNorm=normalize(actualToken);
      const r=ruleMap.get(normalize(expectedToken));
      if(r && (r.alternatives||[]).some(a=>normalize(a)===actualNorm)){
        return {category:r.category,explanation:r.explanation||msg[r.category]||msg.orthographe};
      }
      if(stripAccents(expectedToken)===stripAccents(actualToken)){
        return {category:"accent",explanation:msg.accent};
      }
      return {category:"orthographe",explanation:msg.orthographe};
    }
    while(i>0||j>0){
      if(i>0&&j>0&&target[i-1].norm===written[j-1].norm&&dp[i][j]===dp[i-1][j-1]){i--;j--;continue}
      if(i>0&&j>0&&dp[i][j]===dp[i-1][j-1]+1){
        const e=target[i-1],a=written[j-1],rule=describe(e.text,a.text);
        errors.push({expected:e.text,actual:a.text,position:i-1,...rule});i--;j--;continue;
      }
      if(i>0&&dp[i][j]===dp[i-1][j]+1){
        errors.push({expected:target[i-1].text,actual:"",position:i-1,category:"oubli",explanation:msg.oubli});i--;continue;
      }
      if(j>0&&dp[i][j]===dp[i][j-1]+1){
        errors.push({expected:"",actual:written[j-1].text,position:i,category:"ajout",explanation:msg.ajout});j--;continue;
      }
      // Safety fallback for any ambiguous alignment.
      if(i>0){errors.push({expected:target[i-1].text,actual:"",position:i-1,category:"oubli",explanation:msg.oubli});i--}
      else if(j>0){errors.push({expected:"",actual:written[j-1].text,position:0,category:"ajout",explanation:msg.ajout});j--}
    }
    errors.reverse();
    const byCategory={};
    for(const e of errors)byCategory[e.category]=(byCategory[e.category]||0)+1;
    return {valid:true,correct:errors.length===0,errors,byCategory,
      expectedWords:n,providedWords:m,
      note:"La correction ignore volontairement les différences de majuscules et de ponctuation."};
  }
  return {compare,normalize,tokenize};
})();
if(typeof window!=='undefined')window.DICTATION_ENGINE=DictationEngine;
if(typeof module!=='undefined'&&module.exports)module.exports=DictationEngine;
