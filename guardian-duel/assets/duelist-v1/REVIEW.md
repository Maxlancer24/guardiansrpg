# Duelist animation review

Correction after user review: the first attack set still switched arms in the
extended thrust despite the initial review below. It is superseded by
attack-right-v2.png, a six-pose right-handed sequence with a rear three-quarter
torso turn. See ../lancer-refined-v1/REVIEW.md for current review and exact prompts.
The following notes describe the initial release, not the corrected attack.

Uses approved roster design 04 and the shared Guardian combat renderer. Generated
with the built-in image tool (true alpha), using the selected idle as the identity
reference for every action. Exact prompts including rejected attack-v2 are in PROMPTS.md.

Identity: slim adult man, short chestnut hair, burgundy sleeveless long coat with
gold trim, cream rolled sleeves, brown leather straps/gloves/boots, charcoal pants,
one thin silver rapier with a gold cup guard. Left hand is free.

Reviewed all nine sheets and native-canvas renderings of all selected source
rectangles and masks on a contrasting green background. Checked sword continuity,
hands, feet, head/body proportions, alpha and neighboring-sprite fragments.

Corrections/decisions:
- Excluded the first generated attack pose: it uses the wrong arm. The five
  remaining poses keep the same sword hand. An alternate sheet was rejected.
- Wide source rectangles plus clip polygons isolate the extended rapier; no
  fragments of the next pose. Motion frame 1 includes its protruding front boot;
  the following frame starts farther right to exclude that boot.
- Explicit foot anchors, measured idle body height 465px, target height 230 scene
  units. Comparison render beside Lancer (230) and Explorer (225) was inspected.
  No weapon-bound sizing, no per-frame squeezing or stretching.
- Separate defensive contact and counterattack, blink outside the idle loop,
  victory holds a breathing loop with a brief blink, defeat holds its last frame.
- One rules hit at the full thrust; the source rapier reach controls approach
  distance, including mobile zoom. Shared aura/impact/SFX/music are retained.

Validation: 27 atlases, 59 deterministic rules battles, 24 full client-simulated
battles, selection/change/replay, EN/ES, mobile/desktop DPR and crop bounds pass.
The original PNG assets were not edited by code; QA sheets render them using
the runtime rectangles, masks and scale.

Limitation: browser helper fails at sandbox startup. Native-canvas visual review
and client simulation were performed, NOT in-browser animation/audio/mobile QA.
