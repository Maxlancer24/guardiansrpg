# Viento de Jade / Jade Wind

- Stable ID: jadewind. Group: player appearance, not a story protagonist.
- Status: demo-ready. Nine actions complete and playable in Guardian vs Hollow. No exclusive ability assigned; no live account integration.
- Reference: concept-approved.png. Combat base: base-v1.png.
- Invariants: adult male, amber eyes, short dark stubble, low dark ponytail; jade-petrol split coat, ivory rolled-sleeve wrap shirt, rust-red two-tail sash, brown bracers/boots, charcoal trousers, three-rod bronze chime. Single katana in anatomical RIGHT hand, empty left hand; scabbard at left hip. Do not mirror hands or copy Yasuo's costume.
- Six idle drawings, authored blink, 1x playback. Hair/sash motion and restrained breathing; no procedural translation of the figure.
- Source reference height 506 px; target 230 at the reference camera. Foot anchors measured independently; lower row receives uniform ~2% anatomical scale correction, no axis warping. Base calibrates future actions; do not fit each pose to weapon bounds.
- Complete: idle, attack, guard, hurt, rest, motion, activation, victory, defeat (52 drawings). Special abilities remain equipment-driven.
- Scope: standalone appearance demo. Existing characters and combat rules are unchanged.

## Original idle review — 2026-09-29

Reviewed the six rendered poses on a neutral background and the idle at 230px reference height beside Guardian in the forest. Conventional right-hand grip and empty left hand remain readable; all six crops include boots and blade tip. Foot placement is registered per drawing. Lower-row size adjustments are uniform, not stretching.

Browser checks: desktop 1280×1000 and emulated mobile 390×844; all six frames reached, one short blink per loop, pause/play, frame inspection, ES/EN labels and no horizontal overflow. Alpha/crop margins verified separately. No physical-device test or complete combat test: this is an idle-only prototype.

Review renders: output/jadewind-idle-review/ in the bot workspace. Prompt history is in PROMPTS.md. Existing player/protagonist roster and combat rules remain unchanged.

## Complete animation review — 2026-09-29

Playable: /guardian-duel/?hero=jadewind. Full inspection: /guardian-duel/jadewind-preview.html.
Manifest: guardian-duel/jadewind.js. Assets: guardian-duel/assets/jadewind-v1/.
The approved idle is preserved exactly. Idle runs at 1x; actions at 1.5x.

| Action | Frames | Presentation |
| --- | --- | --- |
| idle | 6 | Breathing, hair/sash movement and one brief blink per loop |
| attack | 6 | Full-body loading, step, hip/shoulder rotation, lateral cut and recovery |
| guard | 6 | Raised blade, planted stance, hit absorption; no embedded counterattack |
| hurt | 4 | Recoil and recovery |
| rest | 6 | Calm breath, empty hand to chest, eyes close/reopen |
| motion | 6 | Three approach and three retreat drawings |
| activation | 6 | Empty-palm gesture; cosmetic, not an exclusive skill |
| victory | 6 | Friendly salute, all poses shown before settled state |
| defeat | 6 | Knee, supported collapse, lying settle; last frame held |

Attack revision: the first arm-led draft was rejected by the user; final attack-v2.png
uses weight transfer and a full-body turn. Repacked into wide cells to preserve
blade tips. Measured uniform scale 506/414, not per-axis stretching. One contact
marker at 875ms after approach (1235ms battle clock), sharing damage, audio and
procedural jade/silver blade trail. No gameplay calculation in sprite metadata.
Defeat uses explicit crop masks to exclude the neighboring blade tip, not pixel edits.

Visual QA: all nine action contact sheets, desktop and emulated mobile battle,
attack contact/trail, idle, complete victory/defeat, selector and ES/EN inspected.
Chrome 1280x1000 and 390x844, DPR 2; no physical-device testing. Screenshots are
in output/jadewind-complete-qa/ in the bot workspace. No custom audio generated:
the demo uses its existing shared attack, impact, guard, rest and result sounds.

Automated QA: verify-jadewind.cjs (52 drawings, exact idle, crops, timing, scale),
verify.cjs (112 animated battles across 14 demo packs), verify-melee-fx.cjs,
Brisa/Guardian regressions, catalog audit and browser test all pass.
Live account assignment, persistence and Discord-mode inclusion remain separate.
Image generation used built-in image_gen; prompts.json records the action prompts.
