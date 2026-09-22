# Jessie — coherent dual-weapon correction

The lab no longer uses the independently generated step-shot atlas. Both attacks use the approved `jessie-coherent-v1` character at the same scale and with the same face, body and legs.

`off-upper.png` and `off-forearm.png` contain original pixels extracted from that master on its unchanged 512 × 768 canvas. `body.png` is the original body with a narrowly masked clean-plate patch beneath the second arm. No new full-body drawing appears during the attack. At rest and during the simple shot, the original body texture remains in use.

The clean plate was created with the built-in ImageGen tool. Prompt: remove only the image-left arm and downward revolver, complete the hidden navy/gold coat and burgundy lining, preserve all other anatomy, clothing, proportions and framing; transparent background, no text, no ground. The returned background was not used: only the masked coat patch was retained, clipped to its contour. All other visible character pixels come from the approved original.

Animation: planted weight shift, first arm raises/fires/lowers, second arm raises/fires, both recover. This is a continuous articulated correction, not a new frame-by-frame cinematic or a full turn. Each muzzle is attached to its own elbow hierarchy. Flashes follow the live weapon transform; each shot's impact is recorded at the trigger instant.
