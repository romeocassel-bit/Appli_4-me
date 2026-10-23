'use strict';
// Carnet privé : aucune synchronisation, aucune évaluation automatique des textes.
const NotebookEngine=(()=>{
 const MAX_NOTES=80,MAX_WORDS=100,MAX_TEXT=3500;
 const clean=(s,n)=>String(s??'').trim().slice(0,n);
 function hydrate(raw){
  const x=raw&&typeof raw==='object'?raw:{};
  const notes=Array.isArray(x.notes)?x.notes.filter(n=>n&&typeof n.id==='string').slice(-MAX_NOTES).map(n=>({
   id:clean(n.id,65),title:clean(n.title,100),text:clean(n.text,MAX_TEXT),updated:Number(n.updated)||0
  })):[];
  const words=Array.isArray(x.words)?x.words.filter(w=>w&&typeof w.term==='string').slice(-MAX_WORDS).map(w=>({
   key:clean(w.key||w.term.toLocaleLowerCase('fr'),150),term:clean(w.term,110),
   definition:clean(w.definition,420),storyId:clean(w.storyId,40)
  })):[];
  return {notes,words};
 }
 function saveNote(book,id,title,text,now=Date.now()){
  const t=clean(title,100),body=clean(text,MAX_TEXT);
  if(!t&&!body)return {ok:false,reason:'Écris un titre ou quelques mots pour conserver cette page.'};
  const existing=book.notes.find(n=>n.id===id);
  if(existing){existing.title=t||'Sans titre';existing.text=body;existing.updated=now;return {ok:true,id:existing.id}};
  const newid='n'+now.toString(36)+Math.random().toString(36).slice(2,8);
  book.notes.push({id:newid,title:t||'Sans titre',text:body,updated:now});
  if(book.notes.length>MAX_NOTES)book.notes.shift();
  return {ok:true,id:newid};
 }
 function removeNote(book,id){const k=book.notes.findIndex(n=>n.id===id);if(k<0)return false;book.notes.splice(k,1);return true}
 function toggleWord(book,term,definition,storyId){
  const w={term:clean(term,110),definition:clean(definition,420),storyId:clean(storyId,40)};
  if(!w.term||!w.definition)return false;
  w.key=w.storyId+'|'+w.term.toLocaleLowerCase('fr');
  const idx=book.words.findIndex(x=>x.key===w.key);
  if(idx>=0){book.words.splice(idx,1);return false}
  book.words.push(w);if(book.words.length>MAX_WORDS)book.words.shift();return true;
 }
 const hasWord=(book,term,storyId)=>book.words.some(w=>w.key===clean(storyId,40)+'|'+clean(term,110).toLocaleLowerCase('fr'));
 return {hydrate,saveNote,removeNote,toggleWord,hasWord,MAX_TEXT};
})();
if(typeof window!=='undefined')window.NotebookEngine=NotebookEngine;
if(typeof module!=='undefined'&&module.exports)module.exports=NotebookEngine;
