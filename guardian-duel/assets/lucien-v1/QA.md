# Lucien — complete cosmetic pack, 2026-09-29

Authoritative manifest: `/guardian-duel/lucien.js`. Nine actions, 52 drawings.

Attack correction: `attack-forward-v2.png` replaces v1. Preparation frame 1 now has the right gloved hand drawn back and the blade pointing right/forward, consistently with the following thrust. Six-frame contact sheet and desktop/mobile combat reviewed again. Timings, contact markers, idle and other actions unchanged. Prompt: `ATTACK-FORWARD-V2-PROMPT.md` (built-in ImageGen).
Approved right-facing idle remains byte-for-byte the same manifest data as the prototype.
The `idle-v1.png` file is an inactive historical draft, not the active idle.

## Identity and presentation

- Silver hair, petrol-blue/burgundy coat, right silver pauldron, right gloved sword hand; left hand empty.
- Idle at 1x, other actions at 1.5x. Body height reference 502px -> 230 scene units, uniform XY scaling only.
- Attack: load, full-body forward step/thrust, downward follow-through, recovery. One gameplay damage event, not a second hit for follow-through.
- Contact at attack age 875ms plus approach 360ms = 1235ms; shared audio and weapon-trail pipeline. Blade-tip markers are measured in atlas coordinates.
- Guard contains only defensive poses/recoil. Counterattack is a separate gameplay event using attack animation.
- Rest: hand to chest, eyes close, breath and recovery. Activation uses the empty hand and does not define an exclusive skill.
- Victory: courteous bow then relaxed smile; all six entry frames play before settled pose. Defeat includes buckle, kneel, brace, slump and lying pose.

## Art handling

Built-in ImageGen; all generation prompts in `prompts.json`. Original RGBA preserved without pixel/background processing.
Defeat v2 repairs the first image's crown framing. Custom manifest crops/polygons isolate attack blade overhang and final defeat sword; no adjacent sprite pixels should render.
Generated originals retained under Codex generated_images. Production copies stored in this folder.

## Verification

- Inspected all nine browser contact sheets on opaque neutral background, plus desktop/mobile battle and contact frames.
- `node guardian-duel/verify-lucien.cjs`: all 52 frames reachable, PNG/crop bounds, idle preservation, action timings, proportional scale and blade endpoints.
- `node guardian-duel/verify.cjs`: 120 simulated animated matches across 15 complete packs.
- `node characters/audit.cjs`: identities, assets, timing, scale and hashes.
- Root workspace `tests/render_lucien_character.cjs`: real Chromium at 1280x1000 and emulated 390x844; nine-action preview, attack/parry/rest, explicit action selection, outcome, ES/EN and switching to Lancer. No JS errors or missing local requests.
- Root workspace `tests/check_public_duel_links.cjs`: public duel remains Jessie/Garrick/Zoe, with no links or asset loads for hidden skin lab.

No physical-device test claimed. This is the existing standalone demo (fixed test stats, no account); persistent Discord appearance registration is not enabled by this release. The skin lab remains unlisted/noindex, not access-controlled.
