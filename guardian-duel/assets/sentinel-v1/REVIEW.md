# Sentinel / Centinela — visual and integration review

Generated with the built-in image tool, preserving transparent alpha. Exact
prompts, references and the rejected first victory version are documented in
PROMPTS.md. Final deliverables in this directory: idle.png, attack.png, guard.png,
hurt.png, rest.png, motion.png, activation.png, victory.png and defeat.png.

## Identity and consistency

- Approved roster design 03: auburn bob, plum cloak/tabard, silver armor,
  gold trim, right-hand sword and left-arm round shield with gold star/boss.
- Attack uses a torso turn, not a hand swap. Guard reactions remain defensive;
  the counterattack is separately animated by the existing combat timeline.
- Revised victory salute to restore the blade length from the idle model.
- Standing height calibrated to 228 scene units against Lancer/Duelist 230,
  Explorer 225 and protagonists approximately 214–241. Weapons are excluded.
- Source rectangles and foot anchors are explicit. Higher-resolution hurt
  art and differently sized motion/defeat source drawings have uniform action
  scales; no per-frame stretching or automatic bounding-box normalization.
- Six victory poses complete before a settled pause, then the entire gesture
  repeats. Brief closed-eye frames do not become permanent two-frame loops.

## Checks performed

Inspected all nine source sheets and native-canvas contact renders using the
same source rectangles, masks and scale calculation as the game. Compared idle
anatomy side by side across all four appearances. Checked crossing weapons in
attack/motion and the expanded victory blade crop. Alpha-component checks of
all victory cells found only their own contiguous figure, without adjacent
blade fragments. Original PNG pixels were not edited by code.

Regression harness: 36 atlas bounds checks, 59 seeded rule battles and 32
client-simulated battles, including every appearance's full repeated victory,
language switching, replay, selection, pause and mobile canvas sizing.

This is not an in-browser visual or audio test. Browser helper availability
remains a limitation; final device-specific playback should also be checked on
the published page. Existing shared effects, audio, music and rules are reused.
