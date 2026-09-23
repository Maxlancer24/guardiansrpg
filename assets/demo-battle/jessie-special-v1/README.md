# Jessie special — Crossfire visual study

Independent preview button, ES/EN. This is NOT a production skill or a change to
the Discord combat resolver: no HP, initiative, turns, account or DB mutations.
The normal two-shot action remains unchanged. Four visual shots: single first
gun, alternate lower gun, two guns together. Three impact beats, not damage rolls.

## Choreography

6000 virtual ms at the existing default 1.5x, plus brief impact holds. Staged
anticipation, fast lunge, first shot at1240, alternate at1780, charged twin shot
at3420, recoil and recovery. Holds45/45/110ms. Drawings are intentionally held
for readable poses, accelerated between beats. Fullbody sprites; no limb puppets.

The user-supplied Epic Seven GIF was inspected as a timed contact sheet (231
frames, 11.55s). Inspiration is its pose holds, rapid transitions, darkened
arena and emphatic impact timing. No art/audio was copied from the GIF.

## Rendering

Eight drawn poses, uniform source scale, foot registered on768x560 canvas,
floor525. Muzzle coordinates measured on extracted drawings: pose2=(485,150),
pose4 upper=(463,158), lower=(435,201). First fires pose2; second fires lower
gun in pose4; final fires both in pose4. Actor changes to recoil after release.
Transparent drawn impact, code-driven trails, sparks, smoke, charged motes,
localized glows, small zoom/shake and silhouette echoes. No full-screen flashes.
The crowded later VFX cells were rejected; only isolated first burst is used.
Pause freezes cinematic clock; reset/resize cancels and restores the scene.
Reduced-motion preference suppresses effects/camera. Effects toggle allows
inspection of the body animation alone. Sound opt-in, synthesized Web Audio,
with shared volume/mute and node cleanup; no claim of studio-recorded audio.

## Art generation

Built-in ImageGen with the approved idle-00.png as reference. Local sources and
mechanical alpha extraction/uniform registration scripts are in the parent bot
workspace at output/imagegen/jessie-special-v1. No image API/CLI used.

### Character prompt
Use case: identity-preserve. Create production 2D anime RPG sprite animation sheet EXACTLY preserving reference Jessie face hair costume palette and cel linework. Transparent alpha background. EIGHT fullbody poses in 4 columns 2 rows equal cells, 100px+ blank gutters around each whole sprite, NO touching silhouettes, no cutoffs. All face RIGHT, same body proportions and scale. Dark espresso high ponytail, amber eyes, blue goldtrim longcoat burgundy lining, white collar black buttoned vest, turquoise belt charm, black pants goldtrim boots and fingerless gloves. Exactly TWO silver revolvers, ONE firmly gripped in EACH hand with finger through trigger guard, never both hands on one weapon. Reading order: 1 crouched anticipation knees flex both guns lowered ready; 2 quick forward low lunge both guns kept separate; 3 torso twists aiming first arm straight RIGHT at shoulder height, second pistol held down; 4 alternate firing pose other arm extended RIGHT at chest height first arm drawn back pistol upright by shoulder, clearly separated hands; 5 both arms extended RIGHT in parallel, TWO distinctly visible pistols one just above other, aggressive grounded firing stance; 6 recoil from dual shot, both elbows flexed slightly, both barrels still right, hair and coat thrown back left; 7 followthrough guns lowering halfway, confident stern expression; 8 settle into reference idle guns lowered one per hand. Poses must tell a connected rapid gunfighter attack with actual wholebody acting and changes in silhouette. No muzzle flash, beams, effects, text, panels or background. Feet baseline uniform, complete boots visible. Reference is identity/style guide, do not use different character designs. Extra space essential to avoid adjacent weapons overlapping.

### Transparency follow-up
Background extraction only. Remove the entire gray/brown background from this sprite sheet and replace it with REAL transparent alpha. Keep ALL EIGHT Jessie sprites pixel-faithful with exact current poses face costume hands revolvers hair boots. Do not redesign or repaint. Preserve clean hair edges. No shadow or background remaining, no checkerboard baked in. Eight separate isolated fullbody cutouts in same 4 columns 2 rows arrangement; separate the narrow gaps between neighboring sprites so none touch, without cutting any weapons or hair. All gray between the legs and arms must be transparent.

### Effects prompt
2D hand-drawn anime game VFX sprite sheet, FOUR sequential impact explosion frames in 2x2 grid, actual transparent alpha background. No characters, scenery or text. Each isolated burst centered in its own cell with generous transparent gutters. Palette warm white core, molten gold flame edges and turquoise cyan lightning accents, sharp ink-like tapered shapes and curling smoke. Frame1 compact bright star-shaped impact with jagged energy petals; frame2 forceful expanding explosive bloom of sweeping flame blades and a broken circular shockwave; frame3 larger dissipating gold/cyan flame ribbons curling outward around transparent dark center; frame4 scattered fading smoky wisps and luminous shards. Professional Japanese anime fighting game finishing shot effect, expressive hand-drawn shapes not simple geometric circles, no flat rectangular backdrop, no photograph. All four bursts same canvas scale, growth is within cell, no cropping or overlap. 2048x2048 square sprite atlas. Keep sufficient transparency to see the hit enemy through outer ribbons.

## QA

Desktop1280 and mobile390, ES/EN: pause at anticipation, firstshot, charge and
finisher; four emitted bullets and three impact beats; repeat, cancel/reset,
FX toggle, restored camera, unchanged140/140HP and round1; normal attack still
advances round2 and leaves102 playerHP. Reduced-motion disables visual effects.
No JS errors. Screenshots reviewed at game size; audio control tested, not
subjectively evaluated through speakers. Regression suite checks full encounter.
