# Orthographe et mini-dictées — chantier V3

## Fonctionnement
- 14 questions originales sur les accords, homophones et formes verbales, avec question de prérequis et retour explicatif.
- 6 mini-dictées (thèmes : magie douce, musique, création, costumes), accessibles depuis Français et les séances.
- Lecture audio du navigateur via SpeechSynthesis, lorsque disponible ; à défaut, lecture de la phrase par un adulte.
- Aucun enregistrement ni transmission de voix. La réponse est saisie au clavier, et corrigée localement.
- Les réponses peuvent être saisies avec ou sans certaines variantes de ponctuation et de majuscules.
- Alignement mot à mot par programmation dynamique : une insertion ne décale pas toutes les fautes suivantes.
- Catégories prudentes : accord, homophone, forme verbale, accent, orthographe générique, mot ajouté ou manquant.
- Les règles spécifiques s'appliquent aux erreurs fréquentes prévues dans chaque phrase. Les autres erreurs restent classées de manière générique.
- L'indice ne fait pas gagner le même stade de révision qu'une réussite sans aide.
- Après une réponse à la question d'aide, retour à la question initiale ; la réponse d'aide n'est pas comptée comme preuve de maîtrise.
- Une dictée est estimée à quatre minutes et le moteur de séance tient compte de sa durée au lieu de lui attribuer deux minutes.

## Limites à connaître
- Ce correcteur n'est **pas** un analyseur morphosyntaxique général : une même graphie erronée peut résulter de plusieurs causes.
- La ponctuation n'est pas évaluée dans cette première version.
- La disponibilité et la qualité de la synthèse vocale française dépendent de l'appareil et du navigateur.
- Les exemples pédagogiques et les données d'élève restent à relire et à vérifier avant un usage régulier.
- Le stockage local n'est pas une sauvegarde à distance et n'est pas adapté au partage d'un appareil entre plusieurs personnes.
- Ne jamais confondre score observé et diagnostic scolaire ou médical.

## Tests
Un script de non-régression est disponible à `tests/verify.js` et peut être lancé avec :
```bash
node tests/verify.js
```

Avant de fusionner : vérifier sur navigateur moderne l'audio, les caractères accentués, la saisie, la correction, le passage à la suite, l'aide et le retour à la question principale. Tester sur mobile et avec un clavier. Ce script n'a pas encore été exécuté dans un environnement Node dans cette intervention.
