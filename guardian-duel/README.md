# Guardian vs. Hollow

Independent local demo at `/guardian-duel/` (Spanish) or `/guardian-duel/?lang=en`.
Does not replace `/duel/`, `/team-battle/` or server-authoritative Discord rooms.
No account writes, rewards, analytics, feedback submission or character persistence.

## Playable appearances

Lancer and Explorer. The other eight static concepts are not playable yet. Appearance is
independent of STR/AGI/CON and future equipped weapons. This demo uses 12/10/14
against Hollow 10/6/15. It reuses PracticeRules for ATTACK/DEFEND/REST and explicitly
rejects SPECIAL rather than borrowing Jessie's active. Focus activation art is
used for a successful rest. Server combat integration remains a separate task.

## Animation contract

Nine atlases: idle (6), attack (8), guard (6), hurt (4), rest (6), motion (6),
activation (6), victory (6), defeat (6). Coordinates, anchors, durations and masks
are in lancer.js. Guard loops only defensive poses; attack is a separate counter.
Motion uses dash on entry and backward jump on return. Attack impact is at 1235ms
(360ms dash + 875ms spear extension), with 1.5x playback. Defeat holds its last pose.
Blink is independent of the breathing loop. Defeat has priority over idle recovery.

Explorer has its own nine atlases in assets/explorer-v1, with six attack frames.
explorer.js defines its anchors/timing. Ranged release is at 1300ms, projectile
arrival/impact at 1440ms, and return at 1940ms. A short step replaces the melee dash.
Both appearances share the unchanged rules, effects, sounds and music. Only the
chosen pack plus each selector idle preview is loaded. Sprite keys include the
appearance ID, so switching cannot accidentally reuse another character's images.

Generated rasters retain alpha. Guard frames retain custom polygon masks to avoid
adjacent-row spear fragments. Source rectangles are explicit, not assumed uniform
for older sheets. New sheets use 512-square cells. Future packs must preserve
anatomical size and weapon length and be visually checked in motion, not only as sheets.

## Validation

`node guardian-duel/verify.cjs` checks actual PNG bounds, rules, complete animated
client turns with a simulated DOM/canvas, results, replay, language and selection.
This is not a browser visual test. Browser/mobile visual QA still needed because
no browser was connected during implementation. No existing protagonist files changed.
