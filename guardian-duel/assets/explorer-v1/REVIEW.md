# Explorer v1 visual review

Reviewed all nine generated sheets directly, including the revised defeat sheet.
Identity: short ivory hair, brown skin, green eyes, green cape, ochre scarf, cream
tunic, brown leather straps/gloves/boots, charcoal trousers, hip quiver.
The left hand carries the bow throughout; the right hand draws, guards or gestures.
The attack has a single arrow only before release. The runtime projectile begins
at frame 3's bow grip and arrives before applying the damage label. Cosmetic ranged
animation does not change the existing damage, parry or counter rules.

Corrections made during review:
- Rejected initial defeat proportions and requested a targeted redraw.
- Explicit per-frame foot anchors and action scale; no bounding-box auto-scaling.
- Attack row boundary at 508 instead of 512 preserves lower bow tips without
  including upper-row boots. Defeat row boundary at 530 preserves the upper hand.
- Victory enters through all six poses, then loops only the settled poses.
- Blink uses idle frame 5 independently; no rapid repeated closing of the eyes.
- Ranged approach is short; no melee charge and no extra damage roll for flight.

All PNGs have alpha and pass rectangle/sequence checks. The integration harness
passes 16 complete client-simulated battles across both appearances, 59 rules-only
battles, change/replay, language, DPR scaling and shared music initialization.

Limitation: no connected browser was available. Sheet-level visual inspection is
complete; in-browser animated/mobile visual review has NOT been performed. The
simulation validates execution and crop bounds, not visual smoothness or audio.
