# Audit maths 4e — version candidate V8

## Référentiel
- Programme en vigueur pour la 4e en **2026-2027** : programme de mathématiques du cycle 4 fixé par l'arrêté du 17 juillet 2020 ; le nouveau programme de 2026 s'applique en 4e à partir de la rentrée 2027.
- Sources officielles : https://eduscol.education.fr/document/14080/download et https://www.education.gouv.fr/bo/2026/Hebdo10/MENE2605194A

## Matrice de couverture initiale
| Domaine de compétence | Dans la banque V7/V8 | Qualification |
| --- | --- | --- |
| Comparaison de relatifs | 27 QCM | Automatismes et prérequis |
| Addition de relatifs | 32 QCM | Automatismes de base |
| Fractions équivalentes | 27 QCM | Automatismes et fraction écrite exacte |
| Fraction d'une quantité | 24 QCM | Calcul de base |
| Proportionnalité, prix unitaires | 24 QCM | Calculs simples, pas problèmes complexes |
| Pourcentages usuels | 30 QCM | Automatismes simples |
| Aires et périmètres de rectangles | 24 QCM | Pré requis ; géométrie 4e à enrichir |
| Substitution dans expression littérale | 32 QCM | Début du calcul littéral |
| Équations, distributivité, puissances | Non présents | Manquant |
| Pythagore, transformations, triangles | Non présents | Manquant |
| Statistiques, probabilités, fonctions, algorithmique | Non présents | Manquant |

**Total 220 questions**, dont une majorité d'automatismes transversaux, pas une validation du programme complet.

## Vérification indépendante des réponses
`math-coach.js` recalcule les solutions directement à partir des paramètres des questions et **ne réutilise pas l'indice de bonne réponse**. Il contrôle les 220 corrigés, chaque distracteur, la présence des unités et les réponses libres. Les tests exécutent `MathCoach.audit(PracticeBank)` en CI.

## Remédiation
- Saisie libre pour les défis de maths, avec acceptation des formats numériques usuels et des unités pertinentes.
- Correction calculée ; aucune expression utilisateur n'est évaluée comme du code.
- Premier échec : indice ; échecs suivants : exemple analogue, puis QCM accessible à la demande.
- Pré requis courts proposés sans examen noté.
- Retour possible au QCM et option Passer pour éviter le blocage.

## Limites
- Audit automatisé de la banque, **pas une relecture humaine experte de chaque situation pédagogique**.
- Le référencement officiel couvre le programme mais ne certifie pas la progression dans la classe de l'élève.
- Les bonnes réponses libres n'analysent pas encore la démarche complète de calcul ; elles vérifient une réponse numérique.
- Les exercices absents de la matrice ne sont pas automatiquement générés : prévoir une nouvelle passe structurée pour couvrir les attendus manquants.
- Les tests Chromium ne remplacent pas un essai réel sur téléphone.
