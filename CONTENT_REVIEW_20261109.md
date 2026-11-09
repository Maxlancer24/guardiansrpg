# Field guide update · 9 November 2026

Source of truth: the current game files in the parent working directory. No previous ZIP,
backup or staging copy supplied game code. No database, account, secret or live event state
was read or exported. The bot was not deployed or restarted.

## Player content

- Combat: self/ally consumable targeting, exceptions, Alchemist auxiliary-use limits and
  three worked sequences (Lancer, Alchemist, Vareth team coordination).
- Mastery: all six stages, costs, branches and limitations for the eleven starters and
  Jadewind. Balthier is explicitly in preparation, following `UNRELEASED`.
- Expeditions: Harrowmere remains within the expedition guide and is linked from its
  atlas marker. Covers travel, phases, wildlife, hunts, three-player story, Trial,
  exchange, ownership workshop, lantern, scythe and Last Light equipment set.
- Pokemax: 141 ordinary species / 47 families; region, name and availability filters;
  all twelve Harrowmere species in the Lab; four signature moves and Primordial passives.
  Hidden/unique species remain outside the ordinary species count.
- Raids: illustrated Severin preview. His configuration explicitly marks balance as
  unvalidated, so no final difficulty stats, reward promise or live opening is announced.
- Badges: all 37 current definitions with criteria and combined bonuses. One badge per
  player, one owner per badge, rolling 14-day combat eligibility, 3-day preference lock,
  and the Apex vacancy exception are explained. No owner or ranking data is published.
- Portal: Discord-to-web Pokemax flow, same-account access, shared turn choices, resume
  behavior and differences between demo, account practice, story and real Pokemax battles.

## Maintaining the data

`scripts/export-current-content.py` exports public constants from the current checkout.
It reads AST literals for persistence modules and executes only the pure pet catalog.
The latter composes the current Harrowmere species without database dependencies.
Primordial additions are explicitly merged. Mastery descriptions, rules, costs and badge
definitions are read directly from current sources instead of duplicating numerical trees.

Run with an available Python interpreter, then `npm run build`, `npm run test:field`, and
`python scripts/check-source-hashes.py`. If sources change, review prose as well as data:
exporting does not prove that an event has opened in production. Review the existing
combat, content, atlas and site regression checks when their corresponding code changes.

`content-source-hashes.json` records the reviewed game sources. Original art provenance
and hashes are in `assets/updates-20261109/sources.json`. Use the current source files
again for future updates; neither manifest contains player data.

## Verification

Static pages render in both English and Spanish without JavaScript. The field-guide check
covers 1440, 390 and 320 px layouts, expanded mastery cards, filter combinations and empty
results, all twelve Harrowmere Lab entries, computed final stats, illustrated resources,
the atlas-to-Harrowmere link and canonical metadata. Existing combat calculator, site
navigation, language/back navigation, regional atlas, raids and theme checks also pass.

Browser screenshots are local QA artifacts in `../qa/website-20261109`, outside the website
repository. The in-chat browser host was unavailable; local Chrome rendering and screenshots
were used for visual verification. No new hosting service or audience change was introduced.
