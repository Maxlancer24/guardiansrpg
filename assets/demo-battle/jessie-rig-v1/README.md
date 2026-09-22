# Jessie articulated rig — phase 1

Original parts generated with the built-in ImageGen tool, using the existing Jessie idle as the character reference. Transparent PNGs are cropped from connected alpha components, not from uniform animation frames. No Epic Seven artwork is used.

Prompt: Create a production-ready 2D cutout puppet parts atlas for adult anime gunslinger Jessie, in a roomy 3×3 transparent grid: head/neck without ponytail; torso without arms; belt/pelvis and planted legs; separate ponytail; back and front blue/burgundy coat tails; upper aiming arm; forearm/hand/silver revolver; relaxed off arm with second revolver. Preserve brown hair, amber eyes, blue/gold coat, black outfit and turquoise charm. Complete hidden rounded joints, clean anime cel shading, no labels, borders, backgrounds or full duplicate characters.

Final assets: `head.png`, `torso.png`, `legs.png`, `hair.png`, `tail-back.png`, `tail-front.png`, `upper-arm.png`, `forearm.png`, `off-arm.png`.

Consumer: `/animation-lab/lab.js`, native Phaser 3.90 containers and continuous pose interpolation. Shoulder → elbow → muzzle transforms are nested. The head, hair, off arm and coat tails have independent pivots; legs remain stationary. This is cutout/skeletal animation, not hand-drawn frame-by-frame animation or mesh deformation. The previous battle demo is unchanged.

Hidden routes: `/animation-lab/` and `/es/animation-lab/`. Unlisted and noindex, **not access-controlled**. No authentication, backend, database, player damage or rewards.
