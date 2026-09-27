# Vanguard / Vanguardia review

Roster design 06, with fair/light skin as requested. Short black hair, ochre
scarf, angular silver steel armor, sand split tabard, dark trousers and one
broad two-handed sword. Not a protagonist and not a new statistical class.

## Files and animation contract

- idle.png: six poses; gentle scarf/breathing motion and brief neutral-head blink.
- attack.png: six poses; two-handed anticipation, diagonal cut and recovery.
- guard.png: six poses; blade block and impact absorption, not a premature counter.
- hurt.png: four reaction/recovery poses.
- rest.png and activation.png: six poses each, shared in-game Focus aura.
- motion.png: three approach poses and three backward-hop/landing poses.
- victory.png: six poses; complete salute then settled breathing poses.
- defeat.png: six poses including kneeling, collapse and a settled fallen pose.

Built-in image tool generation/editing; exact prompts in PROMPTS.md. Original
generated variants are retained. No pixel edits or background stripping by code.
Source-space clipping in the renderer only separates adjacent atlas poses.

Standing anatomy targets 235 scene units within the protagonist range 214–241.
Higher-resolution hurt artwork is scaled uniformly; no frame-by-frame stretching.
Idle feet and final victory poses share registered foot anchors to prevent slides.
Full victory cycles use animation.js; no two-frame-only terminal loop.
Attack preparation is 875ms after a 360ms approach; shared 1.5x playback retained.

## Validation

All source sheets inspected. Native-canvas renders use the game's source
rectangles, clipping masks and scale factors. Reviewed all poses and compared
idle anatomy with Lancer, Explorer, Duelist and Sentinel. A victory background
halo detected in the first render was sent through a targeted transparency edit.

Automated checks cover 45 active atlases, 59 seeded rule battles and 40 complete
simulated client battles across five appearances, including repeated full
victory sequences, replay, selection, EN/ES, pause and mobile canvas sizing.
This is not a real-browser visual/audio test. Device-specific playback remains
to be checked on the published page; no Discord server or inventory was changed.
