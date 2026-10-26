# Public guide content review — October 26, 2026

The current game checkout at `DiscordbotBattleRoyale` is the source of truth.
This website checkout starts from current GitHub `origin/main` (32461cd), not an
old ZIP or an output snapshot. Existing game files, the `site` checkout and other
worktrees are preserved. This change publishes documentation, not the bot.

## Reviewed changes

| Area | Current sources | Published information |
| --- | --- | --- |
| Greywood access/travel | `greywood_system.py`, `region_system.py` | Access and claiming are independent. Actual travel links are Starter Ruins and Ravennor. No assertion of current server flags or campaign outcome. |
| Hunts/materials | `region_system.py`, `crafting_system.py` | 11 hunt rosters / 231 names; Greywood's 21 names, independent category rolls, rare override, effective elite cap 13, exclusive supplies and Seal enhancement ingredients. |
| Regional content | `greywood_content.py`, current event/mission JSON | Six authored activities, recommended parties/levels, objectives and template rewards. Content must be enabled/published separately. No guaranteed live schedule. |
| Territory/clans | `territory_system.py`, `greywood_system.py`, `clan_system.py` | Heart of Greywood, additive maximum HP calculation, passive rank table, separate territorial combat missions. |
| Pokemax | `pet_data.py`, `pet_engine.py`, `pet_route_trainers.py` | All 129 non-hidden species / 43 families, current base stats, 71 moves used by those species, nine Greywood species and new signatures. All hidden species are excluded from the ordinary catalog. |
| Gym/League | `pet_gym_system.py`, `pokemax_league_system.py` | 11 Gyms; Elowen / Amberleaf is optional. Original ten League requirements remain. |
| Primordials | `pokemax_primordial.py`, `pokemax_primordial_service.py` | Level 50, exact-species Resonance 10, cap 60; release rewards 1/2/3 at 45/54/60 genes; no traded/already-awakened recycling; supported passive table. Greywood species have no Primordial entry. |
| Jadewind | `character_mastery.py`, `portal_characters.py`, `jade_mastery.py` | Released special character (RELEASED includes SPECIALS), 75k unlock, 270k mastery, stage effects from current TREE. Old 'unreleased' comments in jade_mastery are superseded by the active catalog and purchase code. |
| Raids/title | `boss_raid_config.py`, `raid_jade_regent.py`, `raid_phases.py`, `raid_vareth.py`, `crimson_echo.py` | Third boss, separate phase HP, current preset recommended levels, Crimson Echo damage/counting rules. Configurable encounter values are not represented as live server state. |
| Story portal | `story_http.py`, `story_adventure.py`, economy/progress modules | Authenticated Chapter I scenes 1–14, saved adventure, actual account consumables, shared first-clear records with Discord, replay rules. Does not claim all 46 missions have a solo web adaptation. |
| War campaign | `campaign_war_system.py`, `campaign_late_join.py` | Administrator-queued human reinforcements deploy next round; distinct from freely rejoining. Greywood's campaign remains separate from local events. |

## Implementation

- `current-content.js` supplies bilingual guides and integrates updates in the
  homepage, map, lab, species, mastery, raids, story, portal, clans, gear, Gym,
  League, genes, combat and changelog pages.
- `current-data.js` is an explicitly selected public-content export. The exporter
  reads Python literals through AST and runs only the dependency-free `pet_data`
  module. It never imports the bot or reads credentials/player databases.
- `content-source-hashes.json` records SHA256 of all consulted source files.
- Art reuses the current `assets/hunt-live/greywood-*` files. Nine species portraits
  are delivery-sized WebP conversions of current `assets/pokemax/pilot/*.png`.
  No new generated art or invented character designs are used.
- The original animated homepage and all standalone demos are preserved.
- Search, bilingual navigation, static HTML, canonical links and sitemap include
  the three new routes: Greywood, Jadewind and Primordial.

## Build and checks

```sh
python scripts/export-current-content.py /path/to/current/game
npm run build
npm test
node scripts/check-current-content.cjs
```

The export is a reviewed snapshot; the public site does not fetch live server
configuration. Availability, published templates and rewards remain governed by
the game's current panels.

Validation completed: 104 bilingual static routes; 35 existing website checks;
28 new-content checks (including 320px layouts, map travel edges, all nine new
Lab entries, stat/evolution checks, language changes and no-JavaScript pages);
11 detailed combat-guide checks; four final Gym layout/content checks. Inspected
desktop/mobile screenshots and fixed mobile table, card and journal layout.
All 31 recorded game source hashes still matched before publication.
