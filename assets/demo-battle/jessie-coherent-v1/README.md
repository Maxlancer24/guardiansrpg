# Jessie — coherent full-body source

Revision 4 replaces the independently generated body-part atlas in the animation lab. The older assets and battle demo are preserved.

## Artwork and provenance

Built-in ImageGen mode, using `assets/char-jessie.webp` as the authoritative identity reference.

Prompt summary: one complete adult Jessie in a natural narrow, asymmetric ready stance, weight over her supporting leg, a modest forward step and relaxed knee. Preserve the reference face, amber eyes, dark-brown high ponytail, slender athletic anatomy, navy/gold long coat with burgundy lining, white shirt, black vest/trousers/boots and turquoise charm. Right arm at low ready, left pistol down. Full body on transparent alpha; no oversized chest, wide symmetrical straddle, mannequin pose or disconnected parts.

A second background-extraction pass preserved the character and removed background alpha. A clean-plate edit removed only the right shooting arm and filled the hidden blue shoulder/armpit. Only the arm region of that clean plate is used; the rest of the body retains the master artwork.

Saved assets:

- `master.png`: complete reference pose.
- `body.png`: the same pose with the shooting arm removed and its occluded shoulder completed.
- `upper-arm.png`, `forearm.png`: pixels extracted from **that same master**, including the original hand and gun. Not independently redrawn limbs.
- `rig.json`: source-canvas coordinates for pivots, muzzle and floor.

All four images use the same 512×768 canvas and the same uniform export scale. Do not separately resize head, torso, legs or arms. Rendering has one overall scale of 0.5, anchored to the floor.

## Animation

Phaser 3.90: nested shoulder/elbow transforms plus a 20×30 body mesh. Breathing and recoil smoothly fade out above the knees; boot vertices stay fixed. Hair/coat have small localized deformation, not whole-piece pendulum rotation. Face and body are not reassembled from separately scaled images. Canvas fallback preserves the intact body and articulated shooting arm without mesh effects. Default playback is **1.5×**.

This remains an articulated animation prototype, not hand-drawn frame-by-frame anime animation. Unlisted ES/EN routes, no bot/backend/account changes.
