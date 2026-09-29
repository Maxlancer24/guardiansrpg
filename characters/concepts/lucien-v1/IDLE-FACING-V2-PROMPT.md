# Lucien idle facing v2 — ImageGen integrada

Corrección solicitada: Lucien miraba al frente. El nuevo atlas orienta cabeza y mirada al enemigo, hacia la derecha, con torso en tres cuartos.

Resultado activo: `../../../guardian-duel/assets/lucien-v1/idle-facing-v2.png`. Original conservado sin edición de píxeles. V1 queda como borrador rechazado por orientación, no se reproduce.

```text
Use case: identity-preserve, targeted combat-facing correction.
Image 1 is the EDIT TARGET: the six-frame Lucien idle atlas. Image 2 is the correct FACING/POSE and clean sprite-style reference: the Jade Wind idle atlas, not an identity source.
THE USER REJECTED LUCIEN'S FRONT-FACING PORTRAIT ORIENTATION. Redraw all SIX Lucien frames so he is unmistakably watching an enemy to SCREEN-RIGHT. This is the central required correction, not a tiny eye adjustment.
Turn his HEAD to an almost full RIGHT SIDE PROFILE (nose distinctly projects right, visible near eye looking horizontally right, far eye barely visible or hidden). Do not make eye contact with the camera. Do not look forward out of the screen. His chin, nose, gaze, shoulders, chest and hips all face the same enemy on the RIGHT. Use a 65–75 degree turn away from front towards screen-right, matching the battle-ready side orientation of Jade Wind in image 2. See primarily the side of his face and a narrow three-quarter view of his chest, not a frontal chest display. Naturally orient boots towards the enemy too; do not squeeze or warp the frontal drawing.
Keep Lucien's exact identity, natural slender human proportions and outfit from Image 1: pale adult male, silver long hair partly tied at the nape, grey eyes, ONE silver right shoulder pauldron, dark petrol-blue long split coat with burgundy lining, black high-collar tunic, grey trousers, black boots, consistent silver closures and restrained hem ornament. Right hand black glove; empty left hand has exposed fingers. No new accessories or redesigned clothing.
His sword is ALWAYS in HIS ANATOMICAL RIGHT HAND, the near arm visible to the camera. Right shoulder → upper arm → elbow → wrist → gloved hand must be connected and anatomically correct. Keep the right arm relaxed in low guard, and preserve the straight sword with silver winged guard and teal gem. For the new facing orientation, its blade may angle gently DOWN AND FORWARD toward screen-right below the waist, with tip above the boot baseline, as a natural low guard facing the opponent. One continuous sword and one correct grip; fingers around the dark hilt BEHIND the crossguard, blade extending forward from the guard. Far left arm relaxed, hand empty. No mirrored off-hand weapon.
Preserve the deliverable: ONE transparent PNG sprite atlas, landscape 1536x1024, SIX full-body frames arranged exactly 3 columns x 2 rows. Each figure fully inside its 512x512 cell, at identical scale with crown-to-sole height about 455 px and feet at y=485 in each cell. Transparent padding around hair, sword tip and boots, no crossing into other cells. Actual alpha transparency, no scenery, drop shadows, gradients, frame labels or FX.
Preserve the IDLE ANIMATION, no attacks:
1 top-left: resting breath, eyes watching enemy right.
2 top-middle: gentle inhale, chest rises subtly, hair tips drift slightly back.
3 top-right: soft peak breath, hair and coat tails lag softly.
4 bottom-left: exhale toward neutral, soft hair/coat follow-through.
5 bottom-middle: breath settles, slightly different returning hair/coat curves.
6 bottom-right: same right-facing neutral pose as frame 1, eyelids CLOSED briefly. DO NOT bow or turn his head for the blink.
Feet, head direction and right-hand grip stay anchored and consistent in all six. Head does not rotate toward viewer in any frame.
Match the established Guardians anime sprite style of image 2: sharp clean linework, broad cel-shaded tones, readable faces and fabric shapes, no microtexture. Preserve Lucien's body length, no short legs or small torso, no enlarged head. Distinct subtle hand-drawn motion, not six identical clones. Background truly transparent. All six drawings show RIGHT-FACING side-oriented combat posture, NEVER a front-view fashion pose.
```
