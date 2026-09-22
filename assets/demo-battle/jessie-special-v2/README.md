# Jessie — Twin Fang v2

Original sprite art generated with the built-in ImageGen tool; the user's Epic Seven GIFs informed timing and staging only. No reference-game art or audio is shipped.

Final asset: `atlas.webp`, 2048 × 2048 RGBA, 4 × 4 cells, each 512 × 512. All poses share a fixed scale and a foot baseline of 480. Transparent connected components from the source sheet were isolated into cells so weapons cannot spill into adjacent frames. The original generated PNG remains in the local generated-images directory.

Prompt brief: Use the existing Jessie idle drawing as the character-design reference. Produce 16 connected, right-facing, full-body anime RPG animation poses on transparent background: anticipation, low forward dash, planted dual-pistol aim, alternating recoil, kneeling charged shot, and recovery. Preserve head size, anatomy, brown ponytail, blue coat with red lining, gold trim, black boots and two silver pistols. Simplified cel shading, generous margins, no scenery, ground, labels, baked effects or cropped limbs.

The runtime uses selected anticipation and dash cells, cycles the four recoil cells, and holds the kneeling pose for the charge. The return to rest uses the established idle animation. New art is kept separately from the previous special for comparison.

One requestAnimationFrame clock drives poses, movement, camera, hit-stop, damage and particles. Each damage event fires once. Restart replaces the timeline; hidden tabs pause it. Reduced-motion mode preserves damage and turn logic while removing the cinematic, trails and flashes. Audio is original synthesized sound and starts only after the sound button is enabled.

The battle remains a standalone, unlisted sandbox in English and Spanish. It makes no database or account requests.
