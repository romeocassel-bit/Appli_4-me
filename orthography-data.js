'use strict';
// Activités originales, sans thèmes violents ; validation pédagogique humaine recommandée.
const OrthographyData = {
  "questions": [
    {
      "id": "o4",
      "subject": "Français",
      "topic": "Sujet composé",
      "skillId": "accord-sujet-verbe",
      "question": "Juno et Sam ___ des idées pour le spectacle.",
      "options": [
        "trouvent",
        "trouve",
        "trouvons"
      ],
      "answer": 0,
      "why": "Le sujet « Juno et Sam » désigne deux personnes : « ils trouvent ».",
      "probe": "Juno et Sam, c'est comme :",
      "probeOptions": [
        "il",
        "ils"
      ],
      "probeAnswer": 1
    },
    {
      "id": "o5",
      "subject": "Français",
      "topic": "Son ou sont",
      "skillId": "homophones-son-sont",
      "question": "Les invités ___ arrivés au bal.",
      "options": [
        "son",
        "sont",
        "sons"
      ],
      "answer": 1,
      "why": "« sont » est le verbe être. On peut dire : « Les invités étaient arrivés ».",
      "probe": "« Sont » peut être remplacé par :",
      "probeOptions": [
        "étaient",
        "le sien"
      ],
      "probeAnswer": 0
    },
    {
      "id": "o6",
      "subject": "Français",
      "topic": "A ou à",
      "skillId": "homophones-a-a",
      "question": "Chacun avance ___ son rythme.",
      "options": [
        "a",
        "as",
        "à"
      ],
      "answer": 2,
      "why": "« À » indique ici une relation (« à son rythme »). Ce n'est pas le verbe avoir.",
      "probe": "Dans « Elle a un carnet », « a » peut être remplacé par :",
      "probeOptions": [
        "avait",
        "vers"
      ],
      "probeAnswer": 0
    },
    {
      "id": "o7",
      "subject": "Français",
      "topic": "Le pluriel des noms",
      "skillId": "nom-pluriel",
      "question": "Les ___ flottent dans le grand hall.",
      "options": [
        "ruban",
        "rubans",
        "rubant"
      ],
      "answer": 1,
      "why": "Le déterminant « les » annonce plusieurs rubans : on écrit « rubans ».",
      "probe": "« Les » annonce :",
      "probeOptions": [
        "plusieurs éléments",
        "un seul élément"
      ],
      "probeAnswer": 0
    },
    {
      "id": "o8",
      "subject": "Français",
      "topic": "Accord de l'adjectif",
      "skillId": "adjectif-genre",
      "question": "Juno porte une veste ___.",
      "options": [
        "violets",
        "violet",
        "violette"
      ],
      "answer": 2,
      "why": "« Veste » est féminin singulier. L'adjectif devient « violette ».",
      "probe": "« Une veste » est :",
      "probeOptions": [
        "féminin singulier",
        "masculin pluriel"
      ],
      "probeAnswer": 0
    },
    {
      "id": "o9",
      "subject": "Français",
      "topic": "Adjectif au féminin pluriel",
      "skillId": "adjectif-pluriel",
      "question": "Des étoiles ___ décorent le plafond.",
      "options": [
        "dorés",
        "dorée",
        "dorées"
      ],
      "answer": 2,
      "why": "« Étoiles » est féminin pluriel : l'adjectif s'écrit « dorées ».",
      "probe": "« Des étoiles » est :",
      "probeOptions": [
        "féminin pluriel",
        "masculin singulier"
      ],
      "probeAnswer": 0
    },
    {
      "id": "o10",
      "subject": "Français",
      "topic": "Participe passé avec être",
      "skillId": "participe-etre",
      "question": "Les amies sont ___ ensemble.",
      "options": [
        "parti",
        "parties",
        "partie"
      ],
      "answer": 1,
      "why": "Avec l'auxiliaire être, « parties » s'accorde avec le sujet féminin pluriel « les amies ».",
      "probe": "Dans « Les amies sont parties », le sujet est :",
      "probeOptions": [
        "féminin pluriel",
        "masculin singulier"
      ],
      "probeAnswer": 0
    },
    {
      "id": "o11",
      "subject": "Français",
      "topic": "On ou ont",
      "skillId": "homophones-on-ont",
      "question": "Les élèves ___ terminé leur dessin.",
      "options": [
        "on",
        "ont",
        "ons"
      ],
      "answer": 1,
      "why": "« Ont » est le verbe avoir au pluriel. On peut dire : « Les élèves avaient terminé ».",
      "probe": "« Ont » peut être remplacé par :",
      "probeOptions": [
        "avaient",
        "nous"
      ],
      "probeAnswer": 0
    },
    {
      "id": "o12",
      "subject": "Français",
      "topic": "Et ou est",
      "skillId": "homophones-et-est",
      "question": "La porte ___ ouverte.",
      "options": [
        "et",
        "es",
        "est"
      ],
      "answer": 2,
      "why": "« Est » est le verbe être. On peut remplacer par « était » : « La porte était ouverte ».",
      "probe": "Dans « Juno et Sam », « et » sert à :",
      "probeOptions": [
        "relier deux éléments",
        "dire qu'une chose était"
      ],
      "probeAnswer": 0
    },
    {
      "id": "o13",
      "subject": "Français",
      "topic": "Ce ou se",
      "skillId": "homophones-ce-se",
      "question": "Naïa ___ prépare pour le bal.",
      "options": [
        "ce",
        "se",
        "ces"
      ],
      "answer": 1,
      "why": "« Se » appartient au verbe pronominal « se préparer » : elle se prépare.",
      "probe": "Dans « Elle se coiffe », « se » accompagne :",
      "probeOptions": [
        "un verbe",
        "un nom"
      ],
      "probeAnswer": 0
    },
    {
      "id": "o14",
      "subject": "Français",
      "topic": "Imparfait : habitude passée",
      "skillId": "imparfait",
      "question": "L'année dernière, chaque mercredi, les élèves ___ au studio.",
      "options": [
        "répétaient",
        "répète",
        "répéter"
      ],
      "answer": 0,
      "why": "Une habitude dans le passé se raconte ici à l'imparfait : « ils répétaient ».",
      "probe": "« L'année dernière » renvoie :",
      "probeOptions": [
        "au passé",
        "au futur"
      ],
      "probeAnswer": 0
    },
    {
      "id": "o15",
      "subject": "Français",
      "topic": "Infinitif après vouloir",
      "skillId": "infinitif-er",
      "question": "Naïa veut ___ une carte.",
      "options": [
        "dessiné",
        "dessiner",
        "dessinait"
      ],
      "answer": 1,
      "why": "Après « veut », on emploie l'infinitif « dessiner ».",
      "probe": "Dans « Elle veut chanter », « chanter » est :",
      "probeOptions": [
        "un infinitif",
        "un participe passé"
      ],
      "probeAnswer": 0
    },
    {
      "id": "o16",
      "subject": "Français",
      "topic": "Participe passé avec avoir",
      "skillId": "participe-avoir",
      "question": "Juno a ___ des rubans pour la fête.",
      "options": [
        "choisie",
        "choisir",
        "choisi"
      ],
      "answer": 2,
      "why": "Avec avoir et sans complément d'objet placé avant le verbe, on écrit « choisi ».",
      "probe": "Dans « Elle a dessiné une étoile », on écrit :",
      "probeOptions": [
        "dessiné",
        "dessinée"
      ],
      "probeAnswer": 0
    },
    {
      "id": "o17",
      "subject": "Français",
      "topic": "Trouver le noyau du sujet",
      "skillId": "accord-sujet-verbe",
      "question": "Le groupe de jeunes ___ devant le miroir.",
      "options": [
        "avancent",
        "avance",
        "avancer"
      ],
      "answer": 1,
      "why": "Le noyau du sujet est « groupe », au singulier. On écrit « le groupe avance ».",
      "probe": "Le noyau de « le groupe de jeunes » est :",
      "probeOptions": [
        "groupe",
        "jeunes"
      ],
      "probeAnswer": 0
    }
  ],
  "dictations": [
    {
      "id": "d1",
      "subject": "Français",
      "type": "dictation",
      "topic": "Dictée — les lanternes",
      "skillId": "accords-pluriel",
      "minutes": 4,
      "text": "Dans le grand hall, les lanternes violettes brillent au-dessus du miroir.",
      "hint": "Repère les noms au pluriel, puis vérifie les adjectifs et les verbes qui les accompagnent.",
      "rules": [
        {
          "target": "violettes",
          "alternatives": [
            "violet",
            "violets",
            "violette"
          ],
          "category": "accord",
          "explanation": "« Lanternes » est féminin pluriel : « violettes » prend -es."
        },
        {
          "target": "brillent",
          "alternatives": [
            "brille",
            "brilles"
          ],
          "category": "accord",
          "explanation": "Ce sont « les lanternes » qui brillent : le verbe prend -ent."
        }
      ]
    },
    {
      "id": "d2",
      "subject": "Français",
      "type": "dictation",
      "topic": "Dictée — la préparation du bal",
      "skillId": "homophones-a-a",
      "minutes": 4,
      "text": "Juno a décoré le hall, et les invités sont déjà arrivés.",
      "hint": "Essaie de remplacer « a » par « avait » et « sont » par « étaient ».",
      "rules": [
        {
          "target": "a",
          "alternatives": [
            "à",
            "as"
          ],
          "category": "homophone",
          "explanation": "Ici « a » est le verbe avoir : « Juno avait décoré »."
        },
        {
          "target": "sont",
          "alternatives": [
            "son"
          ],
          "category": "homophone",
          "explanation": "« Sont » est le verbe être : « les invités étaient arrivés »."
        },
        {
          "target": "arrivés",
          "alternatives": [
            "arrivé",
            "arrivée",
            "arrivées"
          ],
          "category": "accord",
          "explanation": "Le participe passé avec « sont » s'accorde avec « les invités », masculin pluriel."
        }
      ]
    },
    {
      "id": "d3",
      "subject": "Français",
      "type": "dictation",
      "topic": "Dictée — les costumes",
      "skillId": "adjectif-pluriel",
      "minutes": 4,
      "text": "Les robes argentées scintillent lorsque la musique commence.",
      "hint": "Souviens-toi : « les robes » est féminin pluriel, mais « la musique » est singulier.",
      "rules": [
        {
          "target": "argentées",
          "alternatives": [
            "argenté",
            "argentée",
            "argentés"
          ],
          "category": "accord",
          "explanation": "« Robes » est féminin pluriel : « argentées » prend -ées."
        },
        {
          "target": "scintillent",
          "alternatives": [
            "scintille",
            "scintilles"
          ],
          "category": "accord",
          "explanation": "Ce sont « les robes » qui scintillent : -ent."
        },
        {
          "target": "commence",
          "alternatives": [
            "commencent"
          ],
          "category": "accord",
          "explanation": "C'est « la musique » qui commence, au singulier."
        }
      ]
    },
    {
      "id": "d4",
      "subject": "Français",
      "type": "dictation",
      "topic": "Dictée — les idées de Juno",
      "skillId": "homophones-on-ont",
      "minutes": 4,
      "text": "Juno et Céleste ont imaginé un costume extraordinaire.",
      "hint": "Le sujet est « Juno et Céleste ». Quel auxiliaire convient à deux personnes ?",
      "rules": [
        {
          "target": "ont",
          "alternatives": [
            "on"
          ],
          "category": "homophone",
          "explanation": "« Ont » est le verbe avoir : elles avaient imaginé."
        },
        {
          "target": "imaginé",
          "alternatives": [
            "imaginée",
            "imaginés",
            "imaginées",
            "imaginer"
          ],
          "category": "forme-verbale",
          "explanation": "Après « ont », on emploie ici « imaginé ». Le complément suit le verbe."
        }
      ]
    },
    {
      "id": "d5",
      "subject": "Français",
      "type": "dictation",
      "topic": "Dictée — une étoile dorée",
      "skillId": "adjectif-genre",
      "minutes": 4,
      "text": "Ce soir, elle choisit une étoile dorée pour sa veste.",
      "hint": "Dans cette phrase, « ce » accompagne « soir », et « dorée » décrit « étoile ».",
      "rules": [
        {
          "target": "Ce",
          "alternatives": [
            "Se",
            "se"
          ],
          "category": "homophone",
          "explanation": "« Ce » accompagne le nom « soir » : c'est un déterminant démonstratif."
        },
        {
          "target": "dorée",
          "alternatives": [
            "doré",
            "dorés",
            "dorées"
          ],
          "category": "accord",
          "explanation": "« Étoile » est féminin singulier : « dorée » prend -e."
        }
      ]
    },
    {
      "id": "d6",
      "subject": "Français",
      "type": "dictation",
      "topic": "Dictée — derrière la porte",
      "skillId": "accord-sujet-verbe",
      "minutes": 4,
      "text": "Derrière la porte, des messages mystérieux apparaissent et disparaissent.",
      "hint": "Le sujet des deux verbes est « des messages ». Repère la marque du pluriel.",
      "rules": [
        {
          "target": "mystérieux",
          "alternatives": [
            "mystérieuse",
            "mystérieuses",
            "mystérieu"
          ],
          "category": "accord",
          "explanation": "« Messages » est masculin pluriel : l'adjectif s'écrit « mystérieux »."
        },
        {
          "target": "apparaissent",
          "alternatives": [
            "apparaît",
            "apparait",
            "apparaisse",
            "apparaisses"
          ],
          "category": "accord",
          "explanation": "« Des messages » est pluriel : « apparaissent »."
        },
        {
          "target": "disparaissent",
          "alternatives": [
            "disparaît",
            "disparait",
            "disparaisse",
            "disparaisses"
          ],
          "category": "accord",
          "explanation": "« Des messages » est pluriel : « disparaissent »."
        }
      ]
    }
  ]
};
if(typeof window!=='undefined')window.ORTHOGRAPHY_DATA=OrthographyData;
if(typeof module!=='undefined'&&module.exports)module.exports=OrthographyData;
