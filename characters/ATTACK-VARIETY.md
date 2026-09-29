# Brisa and Guardian attack revision — 2026-09-29

## Selected assets and generation

Created with built-in ImageGen (not the API/CLI), using the existing character art as identity references. PNG transparency is preserved; no pixel extraction or repainting scripts were used.

- Brisa: [attack-circular-v3.png](../guardian-duel/assets/brisa-v1/attack-circular-v3.png). Six poses in a 1254 × 1254 atlas. [Movement prompt](../guardian-duel/assets/brisa-v1/attack-circular-prompt.md), [anatomy correction](../guardian-duel/assets/brisa-v1/attack-anatomy-correction.md), [atlas refinement](../guardian-duel/assets/brisa-v1/attack-atlas-cleanup.md).
- Guardian attack B: [attack-b-thrust-v4.png](../guardian-duel/assets/guardian-v1/attack-b-thrust-v4.png). Six poses in a 1254 × 1254 atlas. [Thrust and sword correction prompts](../guardian-duel/assets/guardian-v1/attack-thrust-prompt.md), [atlas refinement](../guardian-duel/assets/guardian-v1/attack-atlas-cleanup.md).

## Movement and effects

Brisa performs a waist-level circular sweep, inspired by the user's broad horizontal slash reference. The right elbow folds naturally during preparation/recovery; the sword stays in the right hand. A separate procedural, tapered foreground crescent follows the sweep. It is not painted into the sprite sheet.

Guardian's second attack is a forward thrust with a straight blade-tip glint. His first attack and A/B alternation are unchanged. A uniform per-frame scale correction on the last thrust frame aligns its anatomical height with the other poses; no horizontal or vertical stretching is applied.

Both sequences retain the existing single damage event at 1235 ms on the action timeline. Brisa's visual trail begins 120 ms before that event. There are no extra attacks, balance, ability, database, or bot-rule changes.

## Review and checks

Rejected drafts included an unnatural Brisa elbow and a shortened Guardian thrust blade. The replacements were reviewed as individual poses, contact sheets, and rendered animations. Checked shoulder/elbow/wrist continuity, sword hand, blade length, transparent edges, crop margins, feet anchors, size, and timing.

Automated coverage: atlas alpha/crop checks, manifest and melee-effect checks, character catalog audit, 104 simulated client battles, and browser playback on desktop and emulated mobile. Brisa's other actions and Guardian's other actions were compared with the prior revision and remain unchanged. This is browser emulation, not a physical-device test.

Production scope is the static web demo and previews. The synchronized-room renderer compatibility changes are prepared separately in the bot workspace; publishing this site does not deploy or restart the Discloud bot. Brisa is not added to the synchronized-room roster by this revision.

Previous web revision: `5df928ea08d92f729ef9536d18fcc9cf5a56920a`.
