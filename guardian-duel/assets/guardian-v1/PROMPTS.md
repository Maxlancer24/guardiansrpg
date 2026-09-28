# Guardián / Guardian — prompts de producción

Herramienta integrada image_gen; referencia: characters/concepts/guardian-v1/base-v1.png.
Se conservan originales RGBA. No extracción de fondo por código.

## Invariantes compartidos

Use case: stylized-concept. Production hand-drawn 2D anime RPG sprite atlas, NOT concept thumbnails. The reference is the immutable GUARDIAN character model. Exactly same young adult face, short tousled dark brown hair, amber brown eyes, light warm skin, lean adult 7.5-head proportions. White short-sleeved tunic with blue center placket, navy high collar, tight black undersleeves, BLACK FINGERLESS gloves both hands, brown diagonal shoulder strap and brass buckle, brown waist belt, blue split hip cloths, navy trousers, brown calf boots. ONE straight silver sword, brass crossguard, blue grip, ALWAYS anatomical RIGHT hand (near camera); left hand EMPTY. Empty dark sheath at LEFT hip, NO second sword or spare hilt. Same crisp clean outlines and consistent cel shading and same clothing colors in every frame. Side three-quarter view facing RIGHT throughout, not mirrored. Full character, full boots, full sword, no cutoffs. TRUE TRANSPARENT alpha background, no glow, no shadow, no drawn effects, no ground, no text or grid. Output exactly1536x1024: THREE equal512px columns by TWO equal512px rows; six distinct sequential animation poses in reading order. Every figure fully fits its OWN cell with 18px minimum transparent gutter. Hip localx240; crown aroundlocaly42 and boots sole localy482 for standing; fixed scale each frame (body approx440px crown-to-sole). Weapon length and body proportions DO NOT change. Keep both feet registered in standing actions; breathing only subtle torso/hair/fabric changes. No duplicate neighbors crossing a cell.

## idle

IDLE LOOP: frame0 base ready with right sword lowered diagonally forward, free left hand near waist, knees naturally relaxed;1 slow inhale chest rises 2px cloth stirs,2 peak inhale hair gently lifts,3 exhale toward base,4 soft settling clothes,5 EXACT base0 with eyelids CLOSED for a single blink. All feet EXACT same grounded positions. Small hand/cloth breathing only, no head jerks. Never swap hands.

## attack

NORMAL ATTACK:0 same base ready stance;1 preparation slight torso coil and RIGHT hand brings sword diagonally up behind right shoulder, LEFT hand empty for balance;2 decisive right-handed forward diagonal slash at chest level facing RIGHT, front knee bends, blade still intact visible aimed toward enemy right;3 follow-through sword diagonally down-forward, same right grip;4 gradual recovery torso straightens,5 returns exactly to base ready stance. 0-1 deliberate anticipation,2-3 explosive contact,4-5 return. No sword glow/slash painted, effects are added in code. Keep each pose 512px cell, do NOT change sword hand or sword length.

## guard

PARRY / GUARD:0 base ready;1 brings RIGHT sword hand up in front of chest diagonally with point up-right;2 held defensive stance, left empty hand balances near sternum;3 absorbs incoming impact, knees bend slightly and torso recoils, sword still same right-hand grip;4 stabilizes guarded stance;5 eases back toward frame2. NO counterattack swing in guard frames, counterattack is separate attack animation. Feet firmly registered.

## hurt

HIT REACTION:0 base ready;1 torso recoils backward and eyebrows tighten, right sword kept gripped safely forward-down;2 maximum small recoil knees flex, left empty hand near torso;3 starts recovering;4 mostly upright;5 exact base stance recovered. No falling, no sword hand changes.

## rest

REST LOOP:0 base ready sword down;1 free LEFT hand lifts to chest, right sword down;2 slow calming inhale eyes half closed knees relaxed;3 closed eyes gentle exhale, left hand on chest;4 eyes reopen, left hand begins lowering;5 returns base. Continuous small chest, hair and cloth motion, feet fixed. No symbols or effects painted.

## motion

DASH AND RETURN:0 leaning forward initiating approach to screen right;1 short forward running step right sword trailing diagonally behind in RIGHT hand, LEFT hand empty balancing;2 brakes into ready stance;3 pushes backward to return without turning body away,4 small backward hop facing right knees flexed both boots off floor ~25px;5 grounded landing toward base ready stance. Character same size all poses, not stretched. Six clean distinct locomotion poses.

## activation

SPECIAL ACTIVATION, no invented combat mechanic:0 base ready;1 right sword hand lifts blade vertically in front of right shoulder;2 raises chin slightly, confident focused gaze, left empty hand draws near sternum;3 strongest resolute stance slight torso rotation, blade upright same RIGHT hand;4 lowers blade partway;5 returns base. No spell imagery, text, aura or lighting painted. Movement expressive but body and face same identity.

## victory

VICTORY:0 base ready with relaxed face;1 free LEFT hand rises toward collar, right sword remains safely lowered SAME POSITION;2 left hand lightly adjusts navy collar with modest warm smile;3 subtle satisfied nod holding collar;4 left hand gradually lowers;5 EXACT base0 relaxed victory pose with eyes closed blink. Sword never raised, switched, spun or sheathed. Fixed grounded feet throughout, no sideways drift.

## defeat

DEFEAT six progressive poses same anatomy/sword/clothes:0 reels mildly backward, right sword down;1 bends knees exhausted;2 kneels on right knee LEFT hand touching ground;3 sinks onto left hip, RIGHT hand still holds sword on ground directed right;4 reclines onto left elbow almost fallen;5 lies on left side defeated, RIGHT hand rests on ground gripping same sword, blade wholly inside cell to right. No gore. Same body SCALE, do not enlarge fallen poses to fill cell. Complete all boots, blade and hair inside each cell. Individual poses must NEVER overlap neighboring cells.

## Correcciones

Base: quitar segunda empuñadura de vaina. Motion: eliminar segunda hoja en pose3. Activation: conservar largo de espada levantándola diagonalmente, no acortarla para caber.

## Modelo y retrato

Referencia narrativa: el joven de pelo oscuro junto a Jessie en
`assets/story_narrative/story_45_what_we_carry.png`, no el antiguo maxsquall pixel-art.
Modelo base: cuerpo entero, proporción adulta esbelta, túnica blanca con cuello
azul marino, mangas interiores negras, guantes negros, cinturón y correa marrones,
faldones azules, pantalón oscuro, botas marrones y una espada recta en mano derecha.
La vaina del lado izquierdo queda vacía. Mismo estilo anime de los atlas existentes.

Retrato: ilustración anime de cintura hacia arriba para portada de habilidad,
manteniendo exactamente cara, pelo, ropa, colores y espada del modelo base;
actitud resuelta, espada en la mano derecha y fondo transparente. Sin texto,
decoraciones ni efectos horneados: se agregan en el renderizador del combate.

Modo utilizado: herramienta integrada `image_gen`, con referencias locales.
Los PNG finales se conservan sin procesamiento destructivo por código.
## Revisión 2 — prompts exactos (herramienta integrada)

### Idle: extracción del fondo residual

Use case: background-extraction. Input image 1 is the EDIT TARGET: the six-frame Guardian idle sprite atlas. Remove residual opaque or translucent background from ALL negative spaces, especially the holes between upper arms/armpits and torso. Preserve EVERY drawing, face, sword, pose, clothing color, scale, cell layout and pixel positions as closely as possible. Do NOT redraw or redesign the character. Keep white tunic and black undersleeves, do not confuse them with background. Six characters unchanged, 3 columns x 2 rows on 1536x1024. True transparent alpha everywhere outside the character including enclosed armpit holes and between legs. No glow, no haze, no background, no shadow, no checkerboard painted. Frame5 eyes closed must remain closed.

Archivo final: idle-v2.png. Se preservó el PNG generado con su alfa original.

### Segundo ataque normal

Use case: stylized-concept. Asset: SECOND normal attack animation atlas for this EXACT Guardian anime RPG protagonist. Image1 idle is immutable character design reference, image2 attack is style/anatomy/weapon reference. Draw a NEW attack, not a mirror of the first. Same young adult face, short dark brown hair, white short-sleeve tunic/navy collar and blue placket, black undersleeves and black fingerless gloves, brown chest strap/belt, blue hip cloths, navy trousers, brown boots. ONE straight silver sword with brass crossguard and blue grip ALWAYS in anatomical RIGHT hand; left hand EMPTY; empty sheath left hip. Six consecutive poses, 3 columns x 2 rows, 1536x1024, each 512x512 cell. Full body and entire weapon contained within each cell, 20px clear gutter, fixed scale approx450px standing crown-to-sole. Facing screen RIGHT throughout. Animation is a LOW-TO-HIGH rising diagonal sword cut (first existing attack is descending). Pose0 neutral reference ready, sword lowered forward. Pose1 anticipation: flex knees slightly and coil torso, right sword lowered across front near opposite hip, empty left hand balancing. Pose2 explosive rising cut toward enemy at right, right forearm extends forward, blade pointing right and slightly upward at chest level, strong stance. Pose3 follow-through sword elevated diagonally up-right above right shoulder, blade not cropped; torso follows motion. Pose4 gradual lowering/recovery to ready. Pose5 exact neutral ready silhouette. Natural anatomy and SAME right-hand grip every pose, no switching hands, no second blade, no tiny sword, no extra fingers. Crisp clean anime cel shading, SAME rendering complexity as reference; no chibi or photorealism. TRUE TRANSPARENT background including armpit gaps; no atmospheric glow or shadows, no VFX painted, no text, no grid. Feet/body proportion and costume identical across all six poses.

Archivo final: attack-b.png. Cortes, anclajes y estelas se definen en el código;
no se modificaron los dibujos por código. Originales y versión previa conservados.


## Revision 3 — right-handed cross-body horizontal slash

Mode: built-in image_gen. Source: exec-141b7103-1f2a-4053-9679-1bcdcbb94388.png.
Saved unchanged as `attack-b-v3.png` (1536x1024 RGBA, 3x2). References: idle-v2.png for identity; attack.png for linework/anatomy only.

```text
Use case: stylized-concept. Create a NEW six-frame attack sprite atlas for the EXACT Guardian protagonist in reference1; reference2 defines the same cel-shaded linework and proportions only, NOT the new attack choreography.
The NEW choreography is a RIGHT-HANDED CROSS-BODY BACKHAND HORIZONTAL SLASH FROM LEFT TO RIGHT. NOT an upward cut, NOT an overhead downward cut, NOT a forward stab.
Frame0: neutral idle reference stance, sword in anatomical RIGHT hand lowered diagonally forward.
Frame1: preparation: his RIGHT arm crosses IN FRONT of his torso, right fist placed beside his LEFT waist/ribs; sword blade extends toward SCREEN LEFT behind this hand horizontally. His left hand is empty, held clear near his chest, never on sword. Torso twists into the windup.
Frame2: uncoils: the SAME RIGHT hand sweeps from his LEFT side across the front of his torso, sword cutting at waist/chest height from SCREEN LEFT toward SCREEN RIGHT, broad horizontal arc. No stabbing thrust.
Frame3: follow-through: RIGHT arm opens out toward his RIGHT side, blade now extended to SCREEN RIGHT horizontally, torso turned with the cut, weight on forward boot. Left hand still EMPTY balancing behind torso. The hand visibly traveled across his body, not overhead.
Frame4: returns sword downward to ready, gradual recovery.
Frame5: original neutral ready pose.
CRITICAL: same anatomical RIGHT hand in every drawing. In the initial stance his sword hand is on the viewer-left/near side. Never swap weapon to the opposite arm when crossing his body. Exactly two arms and hands, one blade. Keep anatomical shoulder continuity.
Subject and invariants: lean young adult male, short tousled dark-brown hair, amber eyes, white short-sleeve tunic with blue vertical placket and navy collar, black fitted undersleeves, black fingerless gloves, brown diagonal strap and belt with brass buckles, blue split hip panels, navy trousers, brown calf boots. Empty scabbard LEFT hip. Same straight long silver sword brass crossguard blue handle. Do not redesign, shorten body, enlarge head or change palette.
Atlas 1536x1024, THREE columns TWO rows, 512px cells, reading order. Full body AND full blade stay inside EACH cell with 18px margin. Fixed standing crown-to-sole around465px; feet y490. Fixed camera, slight three-quarter side view facing screen right, planted feet except natural knee flexion. TRUE transparent RGBA background including enclosed arm gaps; no colored haze, no floor, no glow, no painted slash, no text, no grid. Effects are added in engine. Each pose distinct, clean professional anime game linework identical to references.
```
