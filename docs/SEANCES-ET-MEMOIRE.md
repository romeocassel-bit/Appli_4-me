# Fonctionnement du prototype — séances et mémoire

## Séances quotidiennes
- Trois durées **indicatives** : 5, 10 ou 15 minutes, sans chronomètre.
- Composition déterministe : rappels arrivés à échéance en premier, nouveaux exercices et lecture plaisir selon le temps disponible.
- Pour 5 minutes sans rappel, une lecture courte est proposée. Les temps sont estimatifs ; on ne coupe jamais un texte ou un exercice à la minute.
- Les séances entamées sont sauvegardées localement et reprises après rechargement.
- Une séance peut être arrêtée librement ; aucun retard ou rattrapage n'est calculé.
- Le catalogue d'exercices reste limité (8 questions), donc une séance peut avoir moins de tâches que son budget théorique.

## Mémoire (heuristique de prototype, non validée cliniquement)
- Une réussite autonome augmente le stade de rappel : J+1, J+3, J+7, J+14, J+28 (selon le stade).
- Une erreur ramène à un rappel à J+1 et déclenche une aide de prérequis possible.
- Une réussite avec aide **ne compte pas** comme réussite autonome. Les questions d'aide/sondes ne font pas progresser la maîtrise.
- Les échéances reposent sur la **date locale** du navigateur pour éviter les erreurs de journée en France.
- Les rappels sont proposés lorsqu'ils arrivent à échéance, sans empiler de pénalités en cas d'absence.
- Cette planification reste une **approximation pédagogique**, pas une mesure scientifique de mémorisation.
- Le niveau de maîtrise n'est pas déduit du seul score brut.

## Sauvegarde et protection des données
- Données uniquement dans le stockage local du navigateur (**localStorage**).
- Migration non destructive depuis la clé `appli4e-prototype-v1` vers `appli4e-learning-v2`.
- Le nouveau moteur n'efface pas l'ancien stockage.
- Sur navigateur privé, appareil partagé, changement de navigateur ou nettoyage du stockage, les progrès peuvent disparaître ou être vus par d'autres utilisateurs du même navigateur.
- Il n'existe **pas encore de synchronisation, sauvegarde cloud, authentification ou tableau de bord parent**.
- Ne saisir aucun nom complet, adresse, résultat médical ou donnée sensible de mineure.

## Lecture
- Série originale Académie Solstice (4 épisodes) et récits courts indépendants sans sujets difficiles.
- Vocabulaire accessible au toucher, questionnaires facultatifs.
- En séance, terminer une lecture valide l'activité ; les questions optionnelles restent hors décompte.
- Les illustrations et personnages ne doivent pas présenter des adolescentes de façon sexualisée.

## Contrôles attendus avant fusion
1. Séances 5/10/15 minutes : plan cohérent, pas de double comptage d'une étape.
2. Fermer puis rouvrir après la première étape : reprise de la même séance.
3. Mauvaise réponse → aide → réussite aidée distincte d'une réussite autonome.
4. Révision après changement de jour ; absence de pénalité d'absence.
5. Lecture terminée → notation facultative → retour correct à la séance.
6. Lecture dernier élément → écran de fin, sans créer de séance fantôme.
7. Navigation mobile, clavier, stockage bloqué et migration d'un ancien utilisateur.

## Limites
- Les exercices sont encore des démonstrations et ne constituent pas une banque complète de 4e.
- Les estimations temporelles ne mesurent pas le temps réellement écoulé.
- Le moteur n'évalue pas encore finement les prérequis ni les erreurs orthographiques.
- Les tests logiques de moteur ne remplacent pas un test dans Vercel et sur téléphone.
