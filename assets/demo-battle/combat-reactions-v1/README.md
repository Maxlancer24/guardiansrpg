# Combat reactions v1

Generated with the built-in ImageGen tool, referenced from the approved
`jessie-idle-shot-v1/idle-00.png` and `warden-idle-cutout.png`. No external API.
Local generation sources and extraction script: `output/imagegen/combat-reactions-v1/`
in the parent bot workspace. Only alpha extraction, uniform resizing and canvas
registration are performed mechanically; body parts are not warped or puppeted.

## Prompt set / art direction

Jessie: 4-by-2 transparent full-body sheet, same anime cel style and exact reference
identity, espresso ponytail, amber eyes, blue gold-trim coat, burgundy lining,
white collar, black button vest, turquoise charm, boots. Two silver revolvers,
one per hand, anatomically held. Fixed scale and foot baseline. Reading order:
idle, brace, receive hit, recover, victory relax, victory raised revolver,
exhaustion, kneeling defeat. No text, backgrounds, effects, clipped limbs or
weapons. Modest connected acting changes rather than different illustrations.

Warden: 4-by-2 transparent full-body sheet of the exact reference armor, angular
helmet, amber slit, tattered gray cape, one double-headed axe, facing left.
Reading order: idle, breathe, anticipate, raise axe behind shoulder, overhead
swing midpoint, contact, follow-through, recover. Same scale/proportions, enough
room for whole axe, no effects, captions or background. Both gauntlets hold axe
during attack. Additional walk-sheet candidate was rejected, not integrated.

## Assets and registration

Jessie 0–7: 512x560, baseline 525; Warden 0–7: 1441x1280, baseline 1238.
Extra Warden headroom preserves the overhead axe. Original enemy/hurt/defeat
images remain 1441x1092 with baseline 1050; the renderer switches origins.
All scaling is uniform. Jessie keeps her previously approved idle and shot loop;
these new images are only reactions and encounter outcomes.

## Scope and rules

This is an isolated animation fixture, not a port of the bot combat engine.
`combat_rules.py` defines one action per living combatant per round and cumulative
initiative. Here the choreography fixes Jessie first, then Warden; no real
initiative roll, defense, equipment, critical, dodge or passive resolution.
Demo values: 140 HP each, Jessie 42 damage split visually as 21+21 in ONE action,
Warden 38 damage in ONE contact event. These are not production character stats.
Both participants stop acting on defeat. Preview defeat starts a labelled test
scenario at 1 Jessie HP. No accounts, bot restarts, database reads/writes or rewards.

## QA

Playwright desktop 1280 and mobile 390, Spanish and English: full four-round win,
three enemy contacts, pause/resume without duplicate damage, dedicated defeat,
reset to clean HP/state, no JavaScript errors. Screenshots checked at contact,
victory and defeat; equal-axis enemy scaling retained. Default speed remains 1.5x.
