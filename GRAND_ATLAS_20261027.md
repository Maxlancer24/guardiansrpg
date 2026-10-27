# Bilingual Grand Atlas

The approved Spanish atlas and its English edition now replace the old map in the Valestia guide. Both images have a native resolution of 1697 × 927 pixels. The English edition was localized with the built-in ImageGen tool; its final Nyxhaven plaque has only the destination name. Nyxhaven's eastern location is explained in the interactive destination description.

## Assets

- `assets/atlas/valestia-grand-atlas-es-v1.webp`: web edition, 807,160 bytes.
- `assets/atlas/valestia-grand-atlas-en-v1.webp`: web edition, 620,834 bytes.
- `assets/atlas/valestia-discord-es-v1.jpg`: original-resolution JPEG, 1,312,780 bytes.
- `assets/atlas/valestia-discord-en-v1.jpg`: original-resolution JPEG, 1,043,706 bytes.
- `assets/atlas/sources.json`: workspace source paths, SHA256 hashes and dimensions.

Source PNGs, Discord JPEG copies and the image-generation prompts are retained under `design/valestia-atlas/` in the current game workspace. Delivery files were encoded from those sources using WebP quality 93 and JPEG quality 95 with full chroma resolution; no upscaling or repainting was applied during packaging.

## Integration

- Artwork follows the page language, including language switching and browser history.
- Main map uses the full guide width, with the selected-place information below it.
- Markers were repositioned against the new artwork. Willowcross and the four expedition charts are selectable. The old generic seal marker has no counterpart in this artwork and is no longer plotted.
- Expedition descriptions use current game content. Charts are explicitly out of scale; they do not assert exact offshore coordinates or live availability. Ravennor remains the departure port.
- Zoom from 100% to 400%, scroll, fit, marker visibility toggle and a keyboard-accessible place selector are available. Full-size images and both Discord JPEGs have direct links.
- Prerendered pages preserve the localized artwork, downloads and regional dossiers without JavaScript. Inactive JavaScript controls are hidden in that mode.
- Existing mainland travel edges, regional dossiers and site content are preserved. No bot or player data was changed.

## Checks

- Static build: 102 bilingual documents, plus the two existing Greywood redirects.
- `check-grand-atlas.cjs`: 8 grouped checks passed (English/Spanish at desktop 1440 px and mobile 390/320 px, image dimensions, added places, zoom/pan, selector, marker toggle, both downloads, language/history and no-JavaScript behavior).
- `check-world-raids.cjs`: 15 existing atlas/raid checks passed.
- `check-edition.cjs`: 35 site checks passed, including internal assets, links and prerendered documents.
- Desktop and mobile screenshots inspected in `qa/grand-atlas-20261027/` in the game workspace.
