'use strict';
// Smoke tests navigateur : aucun réseau externe ni donnée personnelle.
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript'};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent((req.url||'/').split('?')[0]);
 const name=pathname==='/'?'/index.html':pathname;
 const resolved=path.resolve(root,'.'+name);
 if(!resolved.startsWith(root+path.sep)){res.writeHead(403).end();return}
 fs.readFile(resolved,(e,data)=>{
  if(e){res.writeHead(404).end('Not found');return}
  res.writeHead(200,{'content-type':types[path.extname(resolved)]||'text/plain'}).end(data);
 });
});
async function run(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true});
 try{
  for(const viewport of [{width:390,height:844},{width:1280,height:900}]){
   const context=await browser.newContext({viewport});
   const page=await context.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url);await page.getByText('Commencer ma séance').waitFor();
   assert.equal(errors.length,0,'Homepage JS errors: '+errors.join('; '));
   await page.locator('[data-nav="matieres"]').click();
   await page.locator('[data-action="subject:Maths"]').click();
   assert.equal(await page.locator('[data-action="exercise:m1"]').count(),0,'Ancien QCM isolé visible');
   assert.equal(await page.locator('[data-action="exercise:m2"]').count(),0,'Ancien QCM relatifs visible');
   assert.ok((await page.locator('#app').innerText()).includes('Parcours guidés'));
   assert.ok((await page.locator('#app').innerText()).includes('Séries d’automatismes'));
   await page.locator('[data-nav="matieres"]').click();
   await page.locator('[data-action="subject:Français"]').click();
   assert.equal(await page.locator('[data-action="exercise:o1"]').count(),0,'Ancien QCM orthographe visible');
   assert.ok((await page.locator('#app').innerText()).includes('Choisis ton temps de conjugaison'));
   for(const tense of ['present','imparfait','futur','passe','mixte']){
    await page.locator('[data-action="exercise:ct:'+tense+'"]').click();
    assert.ok((await page.locator('#app').innerText()).includes('Découverte'),'Conjugaison '+tense+': '+(await page.locator('#app').innerText()).slice(0,900));
    assert.ok((await page.locator('#app').innerText()).includes('Entraînement'));
    assert.ok((await page.locator('#app').innerText()).includes('Défi'));
    await page.locator('[data-nav="matieres"]').click();
    await page.locator('[data-action="subject:Français"]').click();
   }
   await page.locator('[data-action="exercise:ct:present"]').click();
   await page.locator('[data-action="challengeStart:ct:present:3:decouverte"]').click();
   assert.ok((await page.locator('#app').innerText()).includes('Question 1 sur 3'));
   assert.equal(await page.locator('#conjugation-input').count(),1);
   await page.locator('#conjugation-input').fill('essai');
   await page.reload();
   await page.locator('[data-nav="matieres"]').click();
   await page.locator('[data-action="subject:Français"]').click();
   await page.locator('[data-action="exercise:ct:present"]').click();
   assert.equal(await page.locator('#conjugation-input').inputValue(),'essai');
   await page.locator('[data-action="challengeWrite"]').click();
   assert.ok((await page.locator('#app').innerText()).includes('terminaison'));
   await page.locator('#conjugation-input').fill('encore faux');
   await page.locator('[data-action="challengeWrite"]').click();
   assert.equal(await page.locator('[data-action^="challengeAnswer:"]').count(),3);
   await page.locator('[data-nav="matieres"]').click();
   await page.locator('[data-action="subject:Français"]').click();
   await page.locator('[data-action="exercise:po-accord"]').click();
   await page.locator('[data-action="practiceStart:po-accord:5"]').click();
   assert.ok((await page.locator('.hero').innerText()).includes('Question 1 sur 5'));
   await page.locator('[data-action="practiceHint"]').click();
   assert.ok((await page.locator('#app').innerText()).includes('Repère'));
   await page.locator('[data-action^="practiceAnswer:"]').first().click();
   await page.reload();
   // Revenir au défi en cours après rechargement : il doit conserver ses réponses et l'indice.
   await page.locator('[data-nav="matieres"]').click();
   await page.locator('[data-action="subject:Français"]').click();
   await page.locator('[data-action="exercise:po-accord"]').click();
   assert.ok((await page.locator('#app').innerText()).includes('Question 1 sur 5'));
   assert.equal(await page.locator('[data-action="practiceNext"]').count(),1);
   for(let i=0;i<5;i++){
    if(i>0)await page.locator('[data-action^="practiceAnswer:"]').first().click();
    await page.locator('[data-action="practiceNext"]').click();
   }
   assert.ok((await page.locator('#app').innerText()).includes('Ce que tu as retrouvé'));
   await page.locator('[data-nav="progres"]').click();
   assert.ok((await page.locator('#app').innerText()).includes('Compétences travaillées'));
   await page.locator('[data-nav="matieres"]').click();
   await page.locator('[data-action="subject:Maths"]').click();
   await page.locator('[data-action="exercise:pm-pourcents"]').click();
   await page.locator('[data-action="practiceStart:pm-pourcents:3"]').click();
   assert.equal(await page.locator('#math-input').count(),1);
   await page.locator('#math-input').fill('invalide');
   await page.locator('[data-action="mathCheck"]').click();
   assert.ok((await page.locator('#app').innerText()).includes('Utilise un nombre'));
   await page.locator('[data-action="mathPrereq"]').click();
   assert.equal(await page.locator('#math-prereq').count(),1);
   await page.locator('[data-action="mathPrereqClose"]').click();
   await page.locator('[data-action="mathShowChoices"]').click();
   assert.equal(await page.locator('[data-action^="practiceAnswer:"]').count(),3);
   assert.ok((await page.locator('#app').innerText()).includes('Question 1 sur 3'));
   await page.locator('[data-nav="matieres"]').click();
   await page.locator('[data-action="subject:Maths"]').click();
   await page.locator('[data-action="exercise:mj-equations"]').click();
   await page.locator('[data-action="journeyStart:mj-equations:prerequis"]').click();
   assert.ok((await page.locator('#app').innerText()).includes('Étape 1 sur 3'));
   await page.locator('#journey-input').fill('7');
   await page.reload();
   await page.locator('[data-nav="matieres"]').click();
   await page.locator('[data-action="subject:Maths"]').click();
   await page.locator('[data-action="exercise:mj-equations"]').click();
   assert.equal(await page.locator('#journey-input').inputValue(),'7');
   for(let i=0;i<3;i++){
     const answer=await page.evaluate(()=>{
       const c=window.MathJourney.current(JSON.parse(localStorage.getItem('appli4e-learning-v2')).mathJourney);
       return c.expectedDisplay;
     });
     await page.locator('#journey-input').fill(answer);
     await page.locator('[data-action="journeyCheck"]').click();
     await page.locator('[data-action="journeyNext"]').click();
   }
   assert.ok((await page.locator('#app').innerText()).includes('Ton niveau est terminé'));
   await page.locator('[data-nav="accueil"]').click();
   await page.locator('[data-action="start"]').click();
   assert.ok((await page.locator('#app').innerText()).includes('Étape 1'));
   await page.reload();
   assert.ok((await page.locator('#app').innerText()).includes('Séance en cours'));
   await page.locator('[data-action="resume"]').click();
   await page.locator('[data-action="endSession"]').click();
   const finishText=await page.locator('#app').innerText();
   assert.ok(finishText.toLocaleLowerCase('fr').includes('pour aujourd’hui'),'Fin de séance incorrecte : '+finishText.slice(0,450));
   assert.equal(errors.length,0,'Browser JavaScript errors: '+errors.join('; '));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3);
   assert.equal(overflow,false,'Horizontal overflow at width '+viewport.width);
   await context.close();
  }
  console.log('Tests navigateur Chromium : navigation, défis, reprise, progrès et mobile — OK');
 }finally{await browser.close();server.close()}
}
run().catch(e=>{console.error(e);server.close();process.exitCode=1});
