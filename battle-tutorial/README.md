# Playable combat tutorial

Published at `/battle-tutorial/?lang=es` or `?lang=en`, and loaded on demand inside
the combat guide. Four lessons: basic decisions, equipped Health Potion,
stage-one Alchemist, and free practice. All three main actions remain available;
wrong decisions can cause a real defeat within the local training battle.

`rules.js` wraps the existing `battle-practice/rules.js` event resolver. Both
fighters use STR 10 / AGI 0 / CON 10, with a fixed base roll of 10. This deliberately
removes critical and dodge randomness (the old demo combines their curves, while
current game code distinguishes them). The tutorial does not claim to simulate
gear, weapon actives, clans, all masteries or mode modifiers. These boundaries
are visible in the lesson's conditions. No account API, inventory, database,
rewards or persistence is accessed.

Verified against the current game source on 10 November 2026:

- `combat_rules.py`: `compute_offensive_damage`, `_base_damage_roll`, crit/dodge
  curves and AGI mitigation.
- `main.py`: `_calc_parry_defense_value`, `calc_parry_reflect`, `calc_heal`,
  `_apply_rest_focus_gain`, auxiliary consumable phase and deferred Rest.
- `consumable_catalog.py`: Health Potion heals 50, capped by missing HP.
- `character_mastery.py`: `dose_limit`, `dose_capacity`, `dose_amount`,
  `rest_bonus`, `_use_dose`; stage-one cap 2 created / 1 stored, 40 HP per dose.

Auxiliary validation occurs before mutation. A potion or dose precedes the main
action. Choosing another auxiliary replaces the pending selection; it never
stacks with it. Dose creation happens after successful Rest and becomes usable
in the next round. This lesson targets the Alchemist herself; the guide explains
ally targeting separately.

`scene.js` reuses the current Guardian/Alchemist atlas definitions, frame clocks,
foot anchors and melee/flask effects. Rules emit events once; the scene replays
their snapshots, including a separate block/counter sequence. Changing speed,
pausing, sound or reduced motion never changes damage. The scenery is static.
`assets/tutorial-20261110/sources.json` records 34 optimized WebP derivatives,
original/output SHA256 hashes and URLs. Dimensions and alpha are preserved.

The parent guide pauses the iframe when hidden and checks message origin/source
before accepting resize notifications. Heavy animation assets load only after
starting training. Failed loading offers Retry. The written guide remains intact
and a separate-tab link is always available.

Checks:

- `npm run test:tutorial:rules`: formulas, Focus/Ultra Focus, guard, interrupted
  Rest, victory/defeat, potion ordering/cap/once, dose limits, invalid-action
  atomicity and auxiliary validation.
- `npm run test:tutorial`: both languages at 1440/768/390/320 px, complete basic
  battles, keyboard input, potion/dose selection, defeat/retry, animated attack,
  pause/resume, route suspension, free practice, loading failure recovery.
- `npm run test:combat` and `npm run test:visual`: surrounding guide regressions.

Local QA screenshots are stored outside the published checkout in
`qa/tutorial-20261110/`.
