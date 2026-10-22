# Défis de conjugaison — V4

## Objectif
Un défi comprend plusieurs phrases différentes, jamais une seule question. L'élève choisit le temps de conjugaison, pas une durée de chronomètre.

## Fonctionnalités
- Présent, imparfait, futur simple, passé composé et mode mélangé.
- 14 verbes (1er, 2e et 3e groupe), 6 personnes, 4 temps : 336 variantes générées.
- 3, 5 ou 8 questions par défi libre ; 3 questions lorsque le défi est inclus dans une séance quotidienne.
- Trois options par question, feedback immédiatement après la réponse, indice facultatif.
- État du défi sauvegardé dans le navigateur après chaque réponse ; reprise possible.
- Variation des verbes et sujets ; priorité aux difficultés adaptées au stade de révision.
- Réussite sans aide distinguée d'une réussite avec indice.
- Fin du défi : synthèse et inscription du résultat dans l'historique et le rappel espacé.
- Enregistrement de l'historique de variantes pour réduire les répétitions à court terme.
- Toutes les phrases portent sur des thèmes ordinaires, créatifs et non violents.

## Limites actuelles
- Le mode mélangé est disponible sans prérequis vérifié : il n'a pas encore de vrai verrou pédagogique.
- La progression du rappel est encore évaluée au niveau d'un *défi*, et non de chaque personne ou verbe individuel. Les réponses individuelles restent enregistrées pour la suite.
- Les durées prévues des séances sont indicatives et ne mesurent pas le temps réellement passé.
- Les conjugaisons présentées en QCM ne remplacent pas une épreuve de production écrite.
- Le vocabulaire et les exemples restent à relire en situation réelle avec une élève.
- L'application reste basée sur localStorage, sans sauvegarde ni synchronisation serveur.

## Vérifier
1. Matières > Français > Conjugaison — présent > 5 questions.
2. Réponse fausse : vérifier l'explication ; question suivante.
3. Indice : la réussite avec aide n'est pas comptée comme indépendante.
4. Fermer et revenir pendant un défi : reprise de la série.
5. Tester imparfait, futur, passé composé et tous les temps.
6. Finir une série, revoir le bilan, puis en commencer une autre.
7. Lancer une séance qui contient un défi : continuer après les trois questions.
8. Vérifier clavier, mobile et contrastes.

## Tests automatisés
GitHub Actions lance la syntaxe de tous les fichiers JavaScript et `node tests/verify.js` lors des pushs sur la branche de développement. Le résultat GitHub Actions doit être contrôlé avant fusion et test utilisateur.
