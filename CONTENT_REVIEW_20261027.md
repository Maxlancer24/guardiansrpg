# Atlas and Boss Raids — 27 October 2026

This revision integrates Greywood into Valestia's shared regional atlas and replaces the combined raid notes with a guide for each boss. It preserves the existing homepage artwork and motion.

## Regional atlas

- Eleven mainland hunting dossiers use the same format: travel links, seven enemy tiers, category drop probabilities, native Pokemax lines and initial territorial passive.
- Region graph, initial mainland enemy catalog and base drop tables were compared with the **current** `region_system.py`; the relevant data matches the October 26 public export. `territory_system.py` is unchanged. Later runtime material-pool additions are not presented as a complete ingredient inventory.
- `pet_data.py` confirms that Merchant Crossroads borrows first-stage encounters from Starter Ruins, Crimson Plain and Stormbay Docks. Existing regional species used by these dossiers are unchanged. Today's new event species are outside this atlas/raid revision; the general species catalog retains its October 26 scope.
- Greywood's regional activities and Gym remain in its atlas dossier. Gear recipes remain on the gear page. The standalone navigation item and homepage feature were removed.
- `/greywood/` and `/es/greywood/` are redirect documents, excluded from the sitemap; their destination is the matching-language Valestia page with `#region-greywood`.
- Deep links, browser history, refresh and language switching preserve region selection. All dossier content is also rendered in HTML and remains accessible through native details elements without JavaScript.

## Boss mechanics

Read from the current game checkout, never from a ZIP or old output snapshot:

- `boss_raid_config.py`: published encounter options, standard and Ultimate Centinel values, Vareth defaults, appearances.
- `raid_oath.py`: one charge per HP-removing direct Attack action, three charges, usable next round, +50% before defenses, consumed even on dodge or Parry.
- `raid_vareth.py`: highest-current-HP marked target, charge/breath schedule, distinct contributors, extra attack after normal actions, invalid-target cancellation.
- `raid_jade_regent.py` and `raid_phases.py`: independent lives, cancelled remaining actions, no overflow damage, phase-II timing, 75% damage and 1+1+1 / 2+1 / 2 target distribution.
- `main.py`: actual attack hooks, bonus application and the end-of-round Enrage threshold, stat rounding and heal.
- `crimson_echo.py`: equipped title attributes and the third damaging Attack trigger; defenses and offensive multiplier exclusions.
- `boss_raid_http.py` and `boss_raid_web/assets.js`: active asset routes and current idle cells/arenas. Art is sourced directly from `assets/boss-raids/`.

Values are identified as base presets. The guide tells players to use the published lobby and live warnings for the encounter they entered, rather than treating configurable rewards or stats as guaranteed.

## Artwork

`scripts/prepare-raid-art.py` extracts the first idle cell from the current game sprite sheets, trims transparent padding and encodes WebP delivery copies. It also compresses the original arenas. No generated replacement artwork is used. CSS places the characters over their corresponding arena backgrounds.

`assets/raids/sources.json` records source paths, cell dimensions, source SHA256 and output SHA256 for every delivered image. Total image payload: approximately 2.2 MB across sixteen reusable assets. Character images have phase-specific alt text; background images are decorative.

## Verification

- Static build: 102 bilingual guide documents plus two legacy redirects.
- `check-edition.cjs`: 35 existing navigation, layout, metadata, asset and static-document checks passed.
- `check-current-content.cjs`: 27 checks passed after adapting the old standalone-Greywood expectations to the atlas.
- `check-combat-guide.cjs`: 11 checks passed.
- `check-world-raids.cjs`: 15 grouped checks cover both languages at 1440, 390 and 320 px, all eleven markers/dossiers, image decoding, boss links, history, redirects and no-JavaScript content.
- Read-only calls to the current pure engine modules reproduced the guide's Oath timing, 80→20 flame example, extra breath, following charge cycle, Tempest timing, damage percentage and target distribution.
- Desktop and mobile screenshots inspected under `qa/website-20261027` in the game workspace. No bot configuration, inventory, player database or running game service was changed.
