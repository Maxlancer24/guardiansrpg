# Guardian vs. Hollow

Independent local demo at `/guardian-duel/` (Spanish) or `/guardian-duel/?lang=en`.
Does not replace `/duel/`, `/team-battle/` or server-authoritative Discord rooms.
No account writes, rewards, analytics, feedback submission or character persistence.

## Playable appearances

Lancer, Explorer, Duelist and Sentinel. The other six static concepts are not playable yet. Appearance is
independent of STR/AGI/CON and future equipped weapons. This demo uses 12/10/14
against Hollow 10/6/15. It reuses PracticeRules for ATTACK/DEFEND/REST and explicitly
rejects SPECIAL rather than borrowing Jessie's active. Focus activation art is
used for a successful rest. Server combat integration remains a separate task.

## Animation contract

`scale.js` calibrates standing anatomy to the existing protagonist renderers.
At 1280 scene units, crown-to-sole measurements are approximately Jessie 214
(without the ponytail), Garrick 230, Zoe 241. Lancer and Duelist target 230, Explorer 225, Sentinel 228.
Weapons never participate in this measurement. One uniform factor applies to
every action, anchored at the feet; no per-frame stretching or stance normalization.
Projectile release uses the same factor. Mobile uses the protagonist camera's
1.5x presentation zoom. Selector portraits also share this anatomical calibration.

Nine atlases: idle (6), attack (8), guard (6), hurt (4), rest (6), motion (6),
activation (6), victory (6), defeat (6). Coordinates, anchors, durations and masks
are in lancer.js. Guard loops only defensive poses; attack is a separate counter.
Motion uses dash on entry and backward jump on return. Attack impact is at 1235ms
(360ms dash + 875ms spear extension), with 1.5x playback. Defeat holds its last pose.
Blink is independent of the breathing loop. Defeat has priority over idle recovery.

Explorer has its own nine atlases in assets/explorer-v1, with six attack frames.
explorer.js defines its anchors/timing. Ranged release is at 1300ms, projectile
arrival/impact at 1440ms, and return at 1940ms. A short step replaces the melee dash.
All appearances share the unchanged rules, effects, sounds and music. Only the
chosen pack plus each selector idle preview is loaded. Sprite keys include the
appearance ID, so switching cannot accidentally reuse another character's images.

Duelist has nine active atlases in assets/duelist-v1. duelist.js uses the corrected
six-pose right-handed attack-right-v2 sheet, six poses for each
other action except hurt (four). Its single rapier thrust impacts at 1235ms,
after 360ms approach + 875ms anticipation. Melee travel accounts for source-space
rapier reach and camera scale, so the extended blade reaches the target on mobile
as well as desktop. Wide attack polygons isolate blades crossing nominal cells.
Victory timing is handled by animation.js: play every entry pose for its declared
duration, pause in the character's settled pose, then repeat the WHOLE gesture.
There is no hardcoded 1940ms cutoff or permanent last-two-frame loop. Lancer and
Explorer entries take 3100 animation ms; Duelist takes 2860 with a short 110ms
blink. The shared 1.5x combat playback remains unchanged. Cycle time is relative
to entering victory, not the global scene clock. Pausing/hidden-tab behavior is
unchanged. No sprite assets were changed for this timing fix.

Lancer idle/attack/guard use refined source drawings in assets/lancer-refined-v1.
The attack now has six poses with the same 1235ms overall impact timing. Larger
source figures are scaled down to the original anatomical height, not enlarged
in-world. The selector respects device pixel density; combat supports up to 3x
with the existing 4-million-pixel backing budget. Original assets are preserved.

Generated rasters retain alpha. Guard frames retain custom polygon masks to avoid
adjacent-row spear fragments. Source rectangles are explicit, not assumed uniform
for older sheets. New sheets use 512-square cells. Future packs must preserve
anatomical size and weapon length and be visually checked in motion, not only as sheets.

## Validation

Sentinel adds nine transparent atlases (52 poses) in assets/sentinel-v1.
sentinel.js keeps the sword in her right hand and shield on her left arm.
The melee impact is synchronized at 1235ms (360ms approach + 875ms preparation).
Its widened attack rectangles and motion masks isolate weapons crossing cells.
Victory includes all six poses, a brief blink, and repeated full celebrations.
Its shield is visual only: it does not change the shared DEFEND rules or stats.
Generation prompts and visual review notes are saved beside the atlases.

`node guardian-duel/verify.cjs` checks actual PNG bounds, rules, complete animated
client turns with a simulated DOM/canvas, results, replay, language and selection.
This is not a browser visual test. The Sentinel integration passes 36 atlas checks,
59 seeded rules battles and 32 complete client-simulated battles across all four
appearances. Native-canvas contact and anatomical-scale renders were visually
inspected. Browser/mobile visual QA is still needed: the browser helper fails
to start in the current sandbox. No existing protagonist files changed.

Victory regression coverage records real client drawImage source rectangles
after wins for all four appearances, asserts that all six poses were drawn and
the whole celebration repeats. Timing boundary tests cover three full cycles and
a longer synthetic gesture, preventing future durations from truncating poses.
