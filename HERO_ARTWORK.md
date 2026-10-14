# The Guardian at Valestia — 14 October 2026

The new homepage replaces the anonymous hooded traveler with the canonical
Guardian, looking across the same landscape. His uncovered brown hair, white
tunic, blue clothing, dark sleeves, brown straps and silver sword follow the
existing game art. A matching blue travel cape makes the wind animation visible.

## Assets and method

- Generated master: [guardian-valestia-v2.png](assets/editorial/guardian-valestia-v2.png).
- Web delivery: [guardian-valestia-v2.webp](assets/editorial/guardian-valestia-v2.webp),
  1536 × 1024, 315,626 bytes. The previous delivery image was 396,292 bytes.
- Generation used the **built-in Imagegen tool**, with three local image references.
  No external image/video API or CLI generation was used.
- The original was copied from the tool's generated-images directory into the
  repository. Browser canvas converted it to WebP at quality 0.86 without changing
  its composition. The previous cover remains available as a versioned asset.

Reference roles:

1. `assets/editorial/valestia-dawn.webp`: landscape edit target; preserve the scene.
2. Game source `assets/story_narrative/story_45_what_we_carry.png`: canonical Guardian
   costume/identity reference, the brown-haired man in white and blue.
3. Game source `assets/portal-characters/guardian-hd.png`: supporting character sheet.

## Final generation prompt

> Use case: identity-preserve / precise-object-edit. Edit image 1, the existing
> landscape website cover. Keep its beloved landscape, composition, emerald river
> valley, ancient towers, golden sunrise, shadows, mountain silhouettes and
> painterly detail intact. Replace ONLY the tiny hooded traveler on the right-hand
> stone path with the canonical Guardian from images 2 and 3. Image 2: the Guardian
> is the young dark spiky brown-haired MAN with white short-sleeved tunic, black
> high collar/undersleeves, blue central stripe, long royal blue split coat tails,
> brown diagonal strap, belt, dark trousers, brown boots and a long silver sword
> with gold crossguard and blue grip. Image 3 is another identity/costume reference
> of this same man, not six characters to include. Show ONE Guardian from the back
> / slight rear three-quarter view looking toward the luminous valley, with exposed
> brown spiky hair (NO HOOD), recognizable white sleeves and royal blue clothing,
> sword held in his right hand down at his side. Add a tasteful royal blue travel
> cape fastened at shoulders flowing softly to his LEFT in the wind, matching his
> existing blue costume. His feet stand convincingly on the same stone path. Make
> him about 25% larger than the original traveler, but still a landscape adventurer,
> not a closeup. Keep him in the right-hand third (around 80% horizontal position).
> Clearly readable blue cape with softly flowing silhouette suitable for subtle
> cloth animation. Match warm rim lighting and the exquisite existing landscape
> rendering. Preserve the dark left portion as text-safe negative space; do not
> put any characters or bright shapes there. Do not change the scene into the group
> portrait. No text, no logo, no watermark, no new characters. Landscape 1536 by 1024.

## Animation implementation

`hero-motion.js` and `hero-motion.css` create a browser-rendered looping scene:

- The entire cape silhouette moves independently, pinned near the shoulders.
  Its original pixels are clipped using a traced path and a refined color matte.
  An inverse-mapped wind field moves the free tip, including its edge, through a
  five-second loop. A separate stationary inpainted background replaces the area
  originally hidden behind the cape; it is never sampled with displaced coordinates.
  The rest of the original image remains unchanged. This is layered 2D animation,
  not a full 3D cloth simulation.
- CSS leaves and warm motes supply ambient movement. They do not
  intercept clicks or enter the accessibility tree.
- WebGL drawing is capped at 30 fps, 1.5 device pixel ratio and 1920 pixels wide.
- The scene pauses offscreen, on guide routes, and in hidden tabs. Language changes
  dispose the previous context and event listeners.
- A bilingual pause/play control persists the user's choice. Reduced-motion and
  data-saving preferences keep the static cover. No-JavaScript visitors see the
  complete image and no nonfunctional control; no-WebGL devices retain the image
  with lightweight CSS ambient effects.
- Mobile presents a 440px art window above the copy so the Guardian stays visible.

The path, local background patch and source coordinates are specific to this artwork.
Update them together when replacing the composition. Never deform the background.

### Stationary background behind the cape

The built-in Imagegen tool created `assets/editorial/guardian-cleanplate-v3.png`
from the unchanged `guardian-valestia-v2.png`. Only a 220 × 200 crop at source
coordinates (1080, 460) is delivered, as
`assets/editorial/guardian-cape-background-v3.webp` (20,926 bytes). The original
image remains visible outside the local restoration mask, so any unrelated
generator changes outside the patch cannot affect the website.

Final clean-plate prompt:

> Use case: precise-object-edit. Technical clean plate for layered animation.
> Keep this 1536x1024 image EXACTLY aligned: same camera, exact pixel positions,
> landscape, light, character pose, hair, boots, sword, shirt, belt. Remove ONLY
> the flowing blue shoulder cape (from neck/shoulders sweeping to the LEFT of the
> man), revealing the stationary scenery and the man's underlying white tunic /
> dark sleeve / brown strap that it covers. Preserve the separate blue split
> coat-tails hanging from his BELT: those are his clothing, not the shoulder cape.
> Do not remove the man. Do not replace his clothing, move him, alter the background
> or add anything. Inpaint the areas formerly covered by the cape naturally with
> existing river, forest, ruined path and correct underlying clothing. No cape
> hanging off his shoulders remains. This plate will be placed directly behind
> the separately animated original cape, so surrounding pixels and geometry MUST
> match the source. No text or watermark.

## Verification

`npm run test:hero` checks both languages at 1440/768/390/320px, GPU initialization,
single-instance cleanup, actual changes in cape screenshots, exact paused-frame
equality, persisted preference, resume, offscreen suspension, route suspension,
live and initial reduced-motion handling, no-WebGL and no-JavaScript fallbacks.
Screenshots and results are saved outside the repository in `../guardian-hero-qa`.
The existing site checks cover all 98 generated routes and their assets/links.

`npm run test:cape` reads the actual WebGL frame buffer at eight phases of the loop.
It verifies transparent pixels outside the tightly bounded cape area and measures
the free edge's travel: 32 CSS pixels at 1440px viewport width and 15 CSS pixels at
390px. It fails if the silhouette moves fewer than 6 CSS pixels, preventing another
nearly static result. It saves two clearly different cape positions for visual
inspection. CSS particles are disabled only in this isolated check.
