# Ambient loops v1

Built-in ImageGen; identity-preserving reference generation. Four unique drawings
per character, not body-part warps. Sources and alpha-only extraction/registration
script live in the parent workspace at output/imagegen/ambient-loops-v1.
Boot-band registration, uniform scale; Warden 1441x1092 baseline1050, Jessie
512x560 matching her existing victory canvas. Idle plays 0,1,2,3,2,1; victory
plays 0,1,2,1 with frame3 reserved for a brief periodic blink. Both clocks pause.
No damage, bot, database or audio changes.

## Exact base prompts

### Warden (reference: warden-idle-cutout.png)
Use case: identity-preserve. Production drawn 2D game sprite sheet, actual transparent alpha background, four isolated FULL BODY cells 2x2 equal grid with ample gutters. Same scale, proportions, camera and foot baseline in ALL cells, no clipping or overlap. EXACT reference Hollow Warden idle breathing. FOUR sequential animation frames in 2x2 grid. Same left-facing pose, helmet, armor, axe planted on ground, identical stationary boots and axe tip. Frame1 neutral; frame2 small inhale shoulder rise cape lags; frame3 full gentle inhale chest slightly lifted cape tip moves; frame4 small exhale. Changes subtle but visible. No walking or attacks. Keep EXACT linework and coloring from reference. No text, no shadows, no scene, no motion blur. No duplicated limbs or weapon changes. Real redrawn frames, not disconnected articulated body parts.

Final generation additionally required: CRITICAL LAYOUT: use a 2048x2048 square, 2 columns by 2 rows. Every knight including entire cape must fit within a central 750x750 box inside each 1024x1024 cell. Leave at least 130px blank transparent margins on EVERY SIDE of EVERY sprite. No silhouettes may touch any other sprite or image edge. Render sprites smaller to ensure complete separation. Feet and planted axe stay identical, tiny shoulder breathing and cloak flutter only.

### Jessie (reference: combat-reactions-v1/jessie-5.png)
Use case: identity-preserve. Production drawn 2D game sprite sheet, actual transparent alpha background, four isolated FULL BODY cells 2x2 equal grid with ample gutters. Same scale, proportions, camera and foot baseline in ALL cells, no clipping or overlap. EXACT reference Jessie victory pose. FOUR sequential animation frames in 2x2 grid. Same face, espresso high ponytail, blue goldtrim coat burgundy lining, black vest white collar, turquoise charm, boots. TWO revolvers ONE per hand: image-left gun upright beside shoulder, image-right gun down, preserve exact grip. Frame1 reference smile; frame2 small inhale shoulders rise 2 pixels hair lags; frame3 gentle inhale coat tips move, confident smile; frame4 exhale hair settles and natural eyes gently closed blink. Boots and gun orientation identical. No arm swings or body rotation. Keep EXACT linework and coloring from reference. No text, no shadows, no scene, no motion blur. No duplicated limbs or weapon changes. Real redrawn frames, not disconnected articulated body parts.
