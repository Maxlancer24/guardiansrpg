# Guardian vs. Hollow

Character identities, release states and exact active sprite inventory are indexed
in [characters/README.md](../characters/README.md). Use that catalog before adding
or replacing a pack; do not infer active versions from filenames.

Independent local demo at `/guardian-duel/` (Spanish) or `/guardian-duel/?lang=en`.
Does not replace `/duel/`, `/team-battle/` or server-authoritative Discord rooms.
No account writes, rewards, analytics, feedback submission or character persistence.

The appearance selector plays each character's existing idle at 1x with
staggered blinking and the same anatomical scale. It shares the main RAF loop,
repaints only on frame/DPR changes and pauses offscreen, in battle or in a hidden
tab. Reduced-motion users get the neutral still pose. No additional image assets
or animation downloads. Checks: `node guardian-duel/verify-portraits.cjs`.

Guardian idle also runs at 1x in battle, including the idle segments before/after
ranged attacks. Blinking uses real-time cadence. All other actions, damage/FX
timing and Hollow remain at 1.5x; the combat clock is unchanged.

## Playable appearances

Lancer, Explorer, Duelist, Sentinel, Vanguard, Arcanist, Pugilist, Tracker and Custodian. Wanderer is the remaining static concept. Appearance is
independent of STR/AGI/CON and future equipped weapons. This demo uses 12/10/14
against Hollow 10/6/15. It reuses PracticeRules for ATTACK/DEFEND/REST and explicitly
rejects SPECIAL rather than borrowing Jessie's active. Focus activation art is
used for a successful rest. Server combat integration remains a separate task.

## Animation contract

`scale.js` calibrates standing anatomy to the existing protagonist renderers.
At 1280 scene units, crown-to-sole measurements are approximately Jessie 214
(without the ponytail), Garrick 230, Zoe 241. Lancer, Duelist and Arcanist target 230, Explorer 225, Sentinel and Tracker 228, Vanguard and Custodian 235, Pugilist 232.
Weapons never participate in this measurement. One uniform factor applies to
every action, anchored at the feet; no per-frame stretching or stance normalization.
Projectile release uses the same factor. Mobile uses the protagonist camera's
1.5x presentation zoom. Selector portraits also share this anatomical calibration.

Nine active atlases: idle (6), attack (6), guard (6), hurt (4), rest (6), motion (6),
activation (6), victory (6), defeat (6). Coordinates, anchors, durations and masks
are in lancer.js. Guard loops only defensive poses; attack is a separate counter.
Motion uses dash on entry and backward jump on return. Attack impact is at 1235ms
(360ms dash + 875ms spear extension), with 1.5x playback. Defeat holds its last pose.
Blink is independent of the breathing loop. Defeat has priority over idle recovery.

Explorer has its own nine atlases in assets/explorer-v1, with six attack frames.
explorer.js defines its anchors/timing. Ranged release is at 1300ms, projectile
arrival/impact at 1440ms, and idle recovery at 1940ms. Ranged actors stay planted:
no approach displacement or backward hop; their motion atlases remain available.
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

Vanguard is roster design 06 with the requested fair/light skin. Nine atlases
(52 poses) live in assets/vanguard-v1. vanguard.js preserves the full two-handed
cut at the existing 1235ms damage event, defensive blade block, hurt/rest/focus,
approach/back-hop, all six victory frames and six defeat frames. Crossing swords
and row-adjacent boots use explicit rectangles and source-space clipping masks.
Idle and victory anchors are checked against the planted boot positions. Its
armor and sword are cosmetic; rules, damage, audio and effects are unchanged.

`node guardian-duel/verify.cjs` checks actual PNG bounds, rules, complete animated
client turns with a simulated DOM/canvas, results, replay, language and selection.
This is not a browser visual test. The Vanguard integration passes 45 atlas checks,
59 seeded rules battles and 40 complete client-simulated battles across all five
appearances. Native-canvas contact and anatomical-scale renders were visually
inspected. Browser/mobile visual QA is still needed: the browser helper fails
to start in the current sandbox. No existing protagonist files changed.

Victory regression coverage records real client drawImage source rectangles
after wins for all five appearances, asserts that all six poses were drawn and
the whole celebration repeats. Timing boundary tests cover three full cycles and
a longer synthetic gesture, preventing future durations from truncating poses.

Vanguard victory-v2 replaces the abrupt sword reset with neutral, downward
diagonal, horizontal and raised salute poses. Recovery reverses those same
in-betweens before the settled blink. The original sheet is retained.

melee-fx.js draws separate procedural weapon trails at the existing 1235ms
impact event: tapered thrust light for Lancer/Duelist, curved sword ribbons for
Sentinel/Vanguard, brief blade-tip glints and small fading flecks. Atlas-space
blade endpoints share the sprite's frame, foot anchor, scale and dash offset.
No extra sprites, hits, damage, audio changes or protagonist changes are involved.
Reduced motion keeps only a subdued glint; the effects toggle disables them.
`node guardian-duel/verify-melee-fx.cjs` checks timing, both weapon poses,
mobile/desktop registration, deterministic output and canvas state restoration.
Native-canvas attack snapshots were inspected; these do not replace browser QA.

## Arcanist v1

Nine atlases / 52 poses in assets/arcanist-v1, with prompts and review notes.
arcanist.js preserves left-hand staff/right-hand gestures, calibrated feet and
230px anatomical height at the 1280-unit reference width. Initial guard generation
was rejected and regenerated to face the incoming threat. Defeat uses explicit
row boundaries and a corner mask; victory returns through all six poses and blinks.

Ranged presentation shares Explorer's 2600ms turn animation: stationary preparation,
release at 1300ms, impact at 1440ms. It is still ONE normal attack under the same
rules. arcane-fx.js attaches charge and a continuous tapered beam to the actual
staff crystal, including follow-through frames. It extends to the target exactly
at 1440ms and fades by 1670ms. No palm projectile. No new special ability, stats,
rewards or bot integration. Sound/music reuse existing assets. Beam core remains
visible with effects off; reduced motion removes outer ribbons and lowers flashes.
Both ranged avatars use idle/attack/recovery poses only during attacks; no motion
sprites, world translation or jump offsets. Explorer's arrow origin was adjusted
to the stationary bow. Automated client instrumentation asserts planted x/y for
preparation, attack and recovery of BOTH appearances; melee movement is unchanged.

Validation: 54 atlas checks, 59 seeded rules battles, 48 client-simulated battles,
all six avatars' full victory playback, and verify-arcanist.cjs timing/socket checks.
Headless Chrome tested the actual page at 1280x1000 and 390x844 (DPR 2 mobile):
selection, attack/parry/rest, ES/EN and switching passed with no HTTP/JS errors.
Browser screenshots of idle, charge/release, guard/contact, rest, activation,
victory and defeat were captured; native-canvas contact sheet covers every pose.
This is emulated mobile, not an iOS/Android device or listening test.

Arcanist aimed-staff attack v2: `assets/arcanist-v1/attack-v2.png` replaces the
upright-staff/free-hand cast. Both hands aim the same staff forward; explicit
wide cell bounds preserve the complete horizontal weapon. Charge and beam follow
the per-frame crystal sockets. Release/impact timing and combat rules are unchanged.
Source/prompt and calibration notes: `assets/arcanist-v1/ATTACK-V2.md`.

## Pugilist v1

Nine independent atlases, 52 full-body poses, same character identity and art style.
Idle breathing/blink, right straight punch, covered parry/contact, hurt, breathing
rest, approach/retreat, focus activation, complete salute and non-graphic collapse.
Fist reach determines approach distance; the 1235ms damage event is unchanged.
Procedural warm knuckle flash and compact hit burst replace the sword-shaped
impact for his punches. Existing audio/music are reused. This is an appearance,
not a new class, equipment rule or special ability.

Sources/prompts: `assets/pugilist-v1/PROMPTS.md`; calibration/QA:
`assets/pugilist-v1/REVIEW.md`. Regression now covers 63 active atlases and
56 client battles for seven appearances; run `node guardian-duel/verify-pugilist.cjs`
for fist reach, feet registration, full defeat and timing checks.

## Tracker v1

Roster concept 07: copper braid, blue-grey cape, leather and olive tunic, crossbow.
Nine atlases / 54 poses include an eight-pose attack with aiming, release, recoil,
reload and return. The ranged actor never advances or jumps backward when firing.
The complete attack sequence now determines the return-to-idle time; Explorer
and Arcanist retain their existing 1940ms boundary, Tracker returns at 2180ms.
The shared ranged turn remains 2600ms with one damage event at 1440ms.

`crossbow-fx.js` starts a separate bolt at the registered rail socket of firing
frame 2 at 1300ms and reaches the target at 1440ms. Optional soft trail; the bolt
stays visible with extra effects disabled. Existing audio and music are reused.
Guard/contact is defensive only; a counterattack is a separate rules event.
Idle runs at 1x in both selector and battle, all other actions remain at 1.5x.

Current checks: 72 active atlases, 59 seeded rules battles, 64 complete animated
client battles across eight appearances, full repeating victories, stationary
ranged actions and registered projectile timing. Headless Chrome checks desktop
1280x1000 and emulated mobile 390x844/DPR2 with no JS or asset-loading errors.
No physical mobile-device or listening test claimed. New pack documentation:
`assets/tracker-v1/PROMPTS.md` and `assets/tracker-v1/REVIEW.md`.

## Custodian v1

Roster concept 10. Nine atlases / 52 poses; mature grey-haired, bearded Guardian
in olive/bronze, one warhammer. Registered feet, readable two-handed strike,
defensive parry without early counterattack, hit/rest/focus, approach and retreat,
full chest-salute victory and corrected consistent-direction collapse.
`custodian.js` defines source rectangles/masks, 235-unit anatomical height and
explicit hammer reach. `melee-fx.js` follows both contact/follow-through head
positions with a broad amber trail and weighted glint; compact impact burst.
Existing single 1235ms melee damage event, sounds/music and rules are unchanged.
Idle remains 1x; all other actions remain 1.5x. No bot restart or character writes.

Current regression: 81 active atlases, 59 seeded rules battles, 72 complete client
battles for nine appearances, full victory cycles and six registered melee effects.
Headless Chrome desktop and emulated mobile verify all nine portraits, selection,
actions, ES/EN, asset loading and layout. Run `verify-custodian.cjs` for specific
feet/reach/weapon-effect checks. Sources/prompts and QA in `assets/custodian-v1/`.
