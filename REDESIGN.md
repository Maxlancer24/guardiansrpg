# Guardians website — October 13, 2026

The public website now introduces the game before opening the full compendium.
Its forest green, ivory, brass and Newsreader typography follow the existing
player portal. English and Spanish have equivalent routes and content.

## Content

- New homepage: world, activities, playable characters, Discord/web explanation,
  first steps, updates and questions.
- New `/mastery/`, `/raids/` and `/player-portal/` guides, plus Spanish equivalents.
- Updated Getting Started, combat context, story count (46, matching the existing
  chapter arrays), changelog and periodic-update wording.
- Existing item tables, calculators, map, story, privacy text and standalone demos
  remain in place. This change does not deploy or modify the game backend.

Facts were checked against the game workspace on October 13, 2026:

| Fact | Source in the bot repository |
| --- | --- |
| Guardian; 11 starters; first free starter | `portal_characters.py` |
| 45,000 OIL additional starters; stages 1–6; 180,000 OIL total | `character_mastery.py`, `portal_characters.py` |
| Permanent branch A/B at stage 5 | `portal_characters.py`, `PUBLIC_RELEASE_INSTALL.txt` |
| Discord/web entry, supported battles and spectators | `PUBLIC_RELEASE_INSTALL.txt`, `web_dashboard.py` |
| Class panel does not consume the turn | `PUBLIC_RELEASE_INSTALL.txt`, `mastery_controls.py` |
| Three-player bosses: First Centinel and Vareth | `boss_raid_config.py`, `README.md` |
| Chapters 45 and 46 | `story_45_import.json`, `story_46_import.json`, existing `CH4` in `app.js` |
| Equipment sets | Existing site main commit `14c58d9` and `app.js` set catalog |

The website does not fetch live game state. Event availability, requirements,
prices and rewards must be checked in the current game panels. No deployment
status or future server launch date is asserted.

## Editing and building

`edition.js` is the bilingual editorial source, loaded before `app.js`. The latter
installs it before rendering navigation and pages. `edition.css` is the shared
visual layer. Update these files, then regenerate HTML:

```sh
npm install
npx playwright install chromium
npm run build
npm test
npm run preview
```

Windows uses installed Chrome by default. Set `GUARDIANS_BROWSER` to another
Chromium executable when needed. Tests use only a loopback fixture server and
block analytics. `GUARDIANS_QA_OUTPUT` changes the screenshot/report destination.

The build prerenders 96 guide routes (48 per language) with titles, descriptions,
canonical/hreflang links and structured data. It preserves the other standalone
applications. Commit the generated HTML for the existing GitHub Pages publishing
flow. The domain remains `guardiansrpg.com`.

## Artwork

The October 14 cover update replaces the anonymous traveler with the canonical
Guardian and adds a looping cape/ambient animation. See [HERO_ARTWORK.md](HERO_ARTWORK.md)
for the current assets, references, full generation prompt and motion behavior.
The original October 13 artwork is retained below for provenance.

The hero was generated with the built-in Imagegen tool. Original:
`assets/editorial/valestia-dawn.png`; optimized delivery:
`assets/editorial/valestia-dawn.webp` (approximately 396 KB).

Final prompt:

> Create a premium illustrated landscape for the hero background of The Guardians,
> a story-rich fantasy RPG set in Valestia. Ultra-wide 3:2 landscape composition,
> painterly anime RPG concept art with finely detailed environments, evocative and
> sophisticated, not photorealistic. A tiny cloaked adventurer seen from behind
> stands on an ancient broken stone path in the RIGHT third, overlooking an
> enormous emerald river valley, layers of forested mountains, elegant ancient
> ruined watchtowers and a faraway harbor city. A luminous golden sunrise behind
> mountains on the upper right, soft mist, warm amber motes, deep pine green
> shadows and muted teal water. Foreground ferns and weathered stone. The LEFT
> third should be mostly deep shadowed forest and hazy dark green sky to leave
> room for ivory website typography overlay. Rich cinematic depth, lush and
> inviting, sense of setting out on an adventure, restrained golden magic.
> No text, no letters, no logos, no UI, no borders, no watermarks. This is
> atmospheric world art, not a literal map.

Other landscapes reuse the existing `assets/portal-v2` artwork from the game;
the four character images reuse original concept portraits. No game character
was redesigned. The hero is an atmospheric illustration, not an in-game map or
screenshot of gameplay.

## Validation

Browser checks cover desktop and mobile (1440, 768, 390 and 320 px), both languages,
navigation, search, language changes/back navigation, FAQ controls, HTML fallback,
local links/assets and console/HTTP errors. Screenshots and the JSON results are
written outside this publication directory by default.
