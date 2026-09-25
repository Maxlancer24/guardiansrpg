window.ZOE_PACK = {
  "version": 1,
  "character": "zoe",
  "defaultSpeed": 1.5,
  "specs": {
    "idle": {
      "size": [
        1254,
        1254
      ],
      "height": 612,
      "feet": [
        621,
        621,
        621,
        607,
        607,
        607
      ],
      "anchors": [
        220,
        220,
        220,
        220,
        220,
        220
      ]
    },
    "attack": {
      "height": 442,
      "feet": [
        495,
        495,
        495,
        478,
        479,
        478
      ],
      "anchors": [
        290,
        270,
        243,
        272,
        269,
        248
      ]
    },
    "parry": {
      "height": 490,
      "feet": [
        512,
        511,
        512,
        496,
        495,
        496
      ],
      "anchors": [
        280,
        280,
        250,
        280,
        280,
        265
      ]
    },
    "hurt": {
      "height": 500,
      "feet": [
        512,
        512,
        512,
        490,
        491,
        491
      ],
      "anchors": [
        290,
        275,
        280,
        290,
        275,
        265
      ]
    },
    "rest": {
      "height": 500,
      "feet": [
        510,
        512,
        512,
        489,
        490,
        489
      ],
      "anchors": [
        288,
        258,
        236,
        288,
        258,
        236
      ]
    },
    "victory": {
      "height": 504,
      "feet": [
        511,
        512,
        512,
        507,
        506,
        509
      ],
      "anchors": [
        265,
        250,
        230,
        265,
        250,
        230
      ]
    },
    "defeat": {
      "height": 528,
      "split": 576,
      "feet": [
        549,
        553,
        546,
        404,
        414,
        415
      ],
      "anchors": [
        285,
        258,
        245,
        270,
        265,
        238
      ]
    },
    "motion": {
      "height": 540,
      "feet": [
        489,
        488,
        491,
        469,
        428,
        490
      ],
      "anchors": [
        230,
        255,
        253,
        215,
        235,
        260
      ]
    },
    "special": {
      "height": 500,
      "feet": [
        510,
        510,
        510,
        492,
        492,
        492
      ],
      "anchors": [
        260,
        260,
        260,
        260,
        260,
        260
      ]
    }
  },
  "states": {
    "idle": {
      "label": "Idle",
      "frames": [
        [
          "idle",
          0,
          300
        ],
        [
          "idle",
          1,
          300
        ],
        [
          "idle",
          2,
          300
        ],
        [
          "idle",
          1,
          300
        ],
        [
          "idle",
          0,
          300
        ],
        [
          "idle",
          3,
          300
        ],
        [
          "idle",
          4,
          300
        ],
        [
          "idle",
          3,
          300
        ],
        [
          "idle",
          0,
          300
        ],
        [
          "idle",
          5,
          110
        ],
        [
          "idle",
          0,
          300
        ]
      ],
      "loop": true
    },
    "attack": {
      "label": "Ataque normal",
      "frames": [
        [
          "attack",
          0,
          300
        ],
        [
          "attack",
          1,
          300
        ],
        [
          "attack",
          2,
          90
        ],
        [
          "attack",
          3,
          220
        ],
        [
          "attack",
          4,
          230
        ],
        [
          "attack",
          5,
          300
        ]
      ],
      "loop": false
    },
    "parry": {
      "label": "Parry completo",
      "frames": [
        [
          "parry",
          0,
          200
        ],
        [
          "parry",
          1,
          150
        ],
        [
          "parry",
          2,
          280
        ],
        [
          "parry",
          3,
          280
        ],
        [
          "parry",
          2,
          280
        ],
        [
          "parry",
          4,
          160
        ],
        [
          "parry",
          1,
          160
        ],
        [
          "parry",
          5,
          350
        ]
      ],
      "loop": false
    },
    "guard": {
      "label": "Guardia sostenida",
      "frames": [
        [
          "parry",
          2,
          330
        ],
        [
          "parry",
          3,
          330
        ]
      ],
      "loop": true
    },
    "counter": {
      "label": "Contraataque (reutiliza ataque)",
      "frames": [
        [
          "attack",
          0,
          300
        ],
        [
          "attack",
          1,
          220
        ],
        [
          "attack",
          2,
          90
        ],
        [
          "attack",
          3,
          220
        ],
        [
          "attack",
          4,
          230
        ],
        [
          "attack",
          5,
          300
        ]
      ],
      "loop": false
    },
    "hurt": {
      "label": "Recibir daño",
      "frames": [
        [
          "hurt",
          0,
          90
        ],
        [
          "hurt",
          1,
          100
        ],
        [
          "hurt",
          2,
          140
        ],
        [
          "hurt",
          3,
          180
        ],
        [
          "hurt",
          4,
          230
        ],
        [
          "hurt",
          5,
          500
        ]
      ],
      "loop": false
    },
    "rest": {
      "label": "Rest / Focus",
      "frames": [
        [
          "rest",
          0,
          220
        ],
        [
          "rest",
          1,
          300
        ],
        [
          "rest",
          2,
          420
        ],
        [
          "rest",
          3,
          420
        ],
        [
          "rest",
          2,
          350
        ],
        [
          "rest",
          3,
          350
        ],
        [
          "rest",
          4,
          200
        ],
        [
          "rest",
          5,
          350
        ]
      ],
      "loop": false
    },
    "victory": {
      "label": "Victoria",
      "frames": [
        [
          "victory",
          0,
          180
        ],
        [
          "victory",
          1,
          220
        ],
        [
          "victory",
          2,
          400
        ],
        [
          "victory",
          3,
          150
        ],
        [
          "victory",
          2,
          500
        ],
        [
          "victory",
          4,
          220
        ],
        [
          "victory",
          5,
          1000
        ]
      ],
      "loop": false
    },
    "defeat": {
      "label": "Derrota",
      "frames": [
        [
          "defeat",
          0,
          180
        ],
        [
          "defeat",
          1,
          160
        ],
        [
          "defeat",
          2,
          200
        ],
        [
          "defeat",
          3,
          220
        ],
        [
          "defeat",
          4,
          400
        ],
        [
          "defeat",
          5,
          900
        ]
      ],
      "loop": false
    },
    "dash": {
      "label": "Dash",
      "frames": [
        [
          "motion",
          0,
          150
        ],
        [
          "motion",
          1,
          130
        ],
        [
          "motion",
          2,
          130
        ],
        [
          "motion",
          1,
          130
        ],
        [
          "motion",
          2,
          130
        ],
        [
          "motion",
          5,
          180
        ]
      ],
      "loop": false
    },
    "evade": {
      "label": "Esquiva / regreso",
      "frames": [
        [
          "motion",
          0,
          130
        ],
        [
          "motion",
          3,
          160
        ],
        [
          "motion",
          4,
          180
        ],
        [
          "motion",
          5,
          220
        ]
      ],
      "loop": false
    },
    "special": {
      "label": "Especial · I pay attention",
      "frames": [
        [
          "special",
          0,
          220
        ],
        [
          "special",
          1,
          380
        ],
        [
          "special",
          2,
          600
        ],
        [
          "special",
          3,
          320
        ],
        [
          "special",
          4,
          380
        ],
        [
          "special",
          5,
          180
        ],
        [
          "attack",
          1,
          180
        ],
        [
          "attack",
          2,
          90
        ],
        [
          "attack",
          3,
          220
        ],
        [
          "attack",
          4,
          230
        ],
        [
          "attack",
          5,
          300
        ]
      ],
      "loop": false
    },
    "cutin": {
      "label": "Portada",
      "frames": [
        [
          "cutin",
          0,
          1000
        ]
      ],
      "loop": false
    },
    "projectile": {
      "label": "Proyectil",
      "frames": [
        [
          "projectile",
          0,
          1000
        ]
      ],
      "loop": false
    }
  },
  "skill": {
    "id": "zoe_i_pay_attention",
    "source": "main.py:17028",
    "damageMultiplier": 0.75,
    "stripEnemyFocus": true,
    "enemyCritDisabledThisRound": true,
    "allLivingAlliesDodgeBonus": 20
  }
};
