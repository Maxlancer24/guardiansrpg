# Guardian identity restoration

Built-in ImageGen. Reference: idle-v2.png. Final selected output: attack-b-identity-v5.png.

## Initial generation

Use case: identity-preserve.
Asset type: six-frame transparent game sprite sheet for the same Guardian as reference.
Input image 1 is the approved idle sheet. Treat it as exact character model, NOT loose inspiration. Copy the identical head, hair spikes, narrow young adult face, slender torso, same long legs, muted blue fabric and light-blue edging, white short-sleeve shirt, navy collar and dark fitted undersleeves, brown diagonal chest strap and gold buckle, dark trousers, and brown buckled boots. DO NOT turn blue fabric into bright electric blue or change belt/shirt construction.
Produce six full body consecutive frames of a right-handed thrust, same rendering/palette/shading and camera as reference. 3 columns x 2 rows, landscape 1536x1024 style sheet, genuine transparent alpha background. Same character scale in every frame (~460px from head to sole; same head pixel size as reference), natural 3/4 right-facing side view. Plenty of room for sword tips. No images overlapping neighboring cells. Slightly crouched poses are SHORTER in height, not inflated to fill the cell. NO bulky body, no wide thighs, no change in head size.
Sword always in anatomical RIGHT hand (near arm from the shoulder on image-left as in reference). OTHER hand visibly empty. Keep SAME near shoulder visible, never show back or mirror shoulders. Conventional sword grip, thumb toward gold crossguard, pommel behind little finger. Same narrow long silver blade, blue grip, gold crossguard/pommel.
Frame1: reference neutral ready pose, sword down-right across legs.
Frame2: coil near/right elbow back beside ribs; armed fist beside waist on image-left; blade level and pointing RIGHT across his front; empty left hand near far hip. Shallow bend in knees, no exaggerated squat.
Frame3: step slightly forward and extend SAME near/right arm across FRONT of torso toward screen-right, point thrusting right at chest height, straight wrist. Right shoulder remains screen-left, torso only slight rotation, far left hand visibly empty at far hip. Not a back-facing fist in the other hand.
Frame4: thrust follow-through, blade still right, small forward lean, SAME body/head scale and face. Not huge lunge.
Frame5: retract same right fist toward ribs, blade still RIGHT, keep his original muted blue waist panels and thin legs.
Frame6: lower sword to down-right neutral exactly matching reference ready silhouette.
Genuinely transparent background, no fake checkerboard, no glow, no trail, no effects, no text, no grid lines. Keep blade and all hands completely visible. This is an animation continuation of the SAME existing character, NOT a redesigned or more saturated reinterpretation.

## Targeted blade correction (selected)

Use case: precise-object-edit.
Input image: six-frame game animation, edit target. Keep this EXACT image's character design, anatomy, proportions, colors, drawing style and 3 columns x 2 rows layout. This is not a redesign. All original pixels except blade extension / translations should look identical.
Fix only the sword blade length in top-right and bottom-left frames. Those two thrust blades are visibly too short. Extend their silver blade to match the long silver blade in the top-middle frame. Every sword blade must have the same apparent length.
To make room, move the entire top-right drawing left within its own space by about 95px without resizing or redrawing him. Its long sword then fits toward right edge. Move top-middle drawing slightly left if needed for a clear margin. Move the bottom-middle drawing slightly RIGHT to provide room for bottom-left's longer blade. Do NOT change anybody's scale. Do not shorten blade to fit cells. Keep all six drawings separate with no overlapping body or swords; equal-width cells are NOT required. We will use custom crop rectangles.
IMPORTANT same muted blue clothes and same face from input. Same body size and slender legs. Do not introduce stronger saturation. No VFX, no trails, no background, genuine transparent alpha background. Only blade length and whole-drawing horizontal placement change. All sword grips remain anatomical right hand.

The intermediate square repacking draft was rejected because it changed relative body sizes.
