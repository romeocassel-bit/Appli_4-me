# Défis d'orthographe et de mathématiques — V5

## Fonctionnalités
- 338 variantes : 118 en orthographe et 220 en maths.
- Orthographe : accords sujet-verbe, accords des adjectifs, homophones, participe passé avec être, infinitif en -er/participe en -é.
- Maths : nombres relatifs, additions de relatifs, fractions équivalentes, fractions de quantités, proportionnalité, pourcentages, aire/périmètre, substitutions dans une expression littérale.
- Chaque compétence propose des séries de 3, 5 ou 8 questions ; 3 questions en séance de durée limitée.
- Difficulté progressive selon le stade de rappel enregistré, indice facultatif, explication systématique après chaque réponse.
- Historique des questions pour éviter de présenter continuellement les mêmes variantes.
- Le bilan différencie une réponse autonome et une réponse avec indice ; la révision espacée revient sur la compétence avec d'autres questions.
- Les calculs sont contrôlés par des assertions déterministes ; aucune donnée personnelle n'est envoyée au serveur.

## Limites
- L'indice et la correction restent fondés sur des réponses à choix multiples, non sur des productions libres.
- Le moteur suit la maîtrise au niveau du *défi*, sans diagnostic détaillé sur chaque micro-compétence.
- Les estimations de durée ne sont pas un chronométrage réel.
- Certains distracteurs sont simples : ils devront être enrichis par observation pédagogique.
- Une validation sur navigateur et une relecture humaine des 338 items restent indispensables avant publication.
- Les progrès sont conservés dans le navigateur ; ils ne sont pas synchronisés entre appareils.
- Les références au niveau scolaire exact n'impliquent aucune évaluation certifiée.

## Vérification
Exécuter `node tests/verify.js` et vérifier les contrôles GitHub Actions.
Dans la prévisualisation Vercel, ouvrir Matières → Français → Accord sujet-verbe — séries et Matières → Maths → Pourcentages usuels. Tester une série complète, un indice, la pause/reprise et l'intégration à une séance de 10 minutes.
