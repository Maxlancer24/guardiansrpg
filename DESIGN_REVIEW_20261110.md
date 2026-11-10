# Visual update · 10 November 2026

The bilingual compendium now uses illustrated section headers, a consistent icon
set, and green/gold surfaces with restrained category accents. Mobile home
sections and activity cards are more compact, with direct Play / Explore / Learn
links. The existing Guardian cover and localized cape animation are preserved.

All 12 mastery cards use the current character artwork. Opening a card shows a
worked example, a six-stage timeline, and separate A/B panels at stages 5 and 6.
The shared stage-six introduction remains above both branches. Rules and prices
still come from `current-data.js`; this release does not regenerate gameplay data.

The combat guide adds two reversible, deterministic lessons: Rest / Focus / Parry,
and the stage-one Alchemist's dose. HP, Focus and dose counters reflect each
step. Explicit example conditions explain the absent modifiers and attacks on
other allies. The examples were checked against the current `main.py`,
`combat_rules.py` and `character_mastery.py` source. They do not change accounts,
inventory, rewards, or real battles.

The Valestia atlas has an immersive dialog with zoom, keyboard focus management,
Escape/close controls, and illustrated regional details. Mobile selections open
a dismissible bottom sheet. Images stay static; map markers retain their original
coordinates. Greywood remains one of the regions, not a separate guide.

Assets in `assets/design-20261110/` are optimized derivatives of existing game
art. `sources.json` records their provenance and source hashes. No generated
replacement art was needed. Source game files were not changed.

Validation completed:

- Static build: 104 English/Spanish pages.
- Field guide: 60 route/language/viewport checks plus catalog and lab behavior.
- Edition: 35 checks, including navigation and static content.
- Combat guide: 11 checks.
- Hero: 17 checks; cape isolation also passes at 1440 and 390 pixels, with zero
  changed pixels outside the permitted cape envelope.
- Visual suite: both languages at 1440, 768, 390 and 320 pixels; tutorial numeric
  states, all character portraits and branches, search, atlas zoom, regional image
  proportions, modal dismissal/focus restoration and onward navigation.
- Rendered screenshots inspected in desktop/mobile and light/dark presentation.

Run `npm run test:visual` for the new interaction/layout regression checks.
Screenshots are local QA artifacts outside the published website directory.
