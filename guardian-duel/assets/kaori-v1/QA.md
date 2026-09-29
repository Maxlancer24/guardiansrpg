# Kaori — release review

Built-in ImageGen; original generated alpha preserved. Prompts and rejected iterations are recorded in `prompts.json`. No pixel recoloring, resampling or background-removal scripts were used.

- Nine actions, 52 authored drawings. Idle v3, right-cross attack v2, guard, hit reaction v2, rest, movement, activation, victory and defeat.
- Rejected idle v1/v2 (row anatomy/height drift), attack v1 (arm swap), hurt v1 (extra hand). Corrected outputs inspected individually and again as all-frame browser contact sheets.
- Feet registered in source coordinates; uniform anatomical scale based on 464px crown-to-sole idle, excluding ponytail. Target 225 scene units at 1280 width, within protagonist band. Attack recovery frames reduced uniformly 4%; crouching and airborne poses are not stretched to standing height.
- Defeat third crop stops before the adjacent pose. Two right-cross contact poses use right arm, with left fist tucked behind; no weapon or mirrored arm swap.
- Damage, fist trail and optional audio share contact at 1235ms (875ms attack plus 360ms approach). Cosmetic frames never resolve extra damage. Guard animation contains no counterattack.
- Idle 1x with brief blink; actions 1.5x. All six victory entry frames play before the settled smile; defeat holds the last pose.
- Existing shared combat effects and audio system reused. Sound effects remain unchecked by default. No new public menu link; lab and preview remain noindex, accessible by direct URL (not access-controlled).
- Automated: `verify-kaori.cjs`, `verify-melee-fx.cjs`, full `verify.cjs`, character catalog audit. Chrome/Playwright: 1280x1000 desktop and 390x844 mobile emulation, nine-action gallery, normal attack/parry/rest turns, full match outcome, explicit action reset, language and character switching. This is not physical-device testing.
- Release scope: standalone web lab only. Catalog `liveGame:false`; no bot/Discloud deployment or player stats changes.

Review screenshots and browser checks: root workspace `output/kaori-complete-qa/` and `tests/render_kaori_character.cjs`. Live check: `tests/check_kaori_live.cjs` checks playability and exact SHA-256 of all nine atlases after publication.

## Size correction v2

Compared the same ground-line renders against Lancer, Explorer, Pugilist, Lucien, Guardian and Brisa, and between all Kaori actions. Reduced global target height 230→225 (−2.2%). Attack source scale 1.25067→1.12 (−10.4%, independent of global change), guard 1.0131→0.98 and movement 1.02655→0.97. Attack recovery keeps its existing uniform −4% correction. Crouched and airborne poses retain their lower/raised silhouette; no independent X/Y stretch, bitmap edits or altered timing. Preview now consumes GuardianScale too, so it cannot show the old height. Knuckle effects and approach distance inherit the corrected attack scale. Comparison artifacts: `output/kaori-scale-review/before.png`, `after.png`; renderer `tests/review_kaori_scale.cjs`.
