# Combat guide source audit — 2026-10-13

The public `/combat-guide/` and `/es/combat-guide/` pages were reviewed against the local Guardians bot source, not inferred from old website copy. This is a review date, not a claim that server configuration or the deployed bot version was queried live. No game logic or player data was modified.

## Source of truth

| Topic | Source reviewed | Material findings |
| --- | --- | --- |
| Actions and round resolution | `main.py`: `_resolve_duel_turn_impl`, `_calc_strike_damage`, `_calc_parry_defense_value`, `apply_rest_success`, `deferred_rest` | Parry uses `5*CON+STR`; counter `3*CON+STR`. Rest normally heals `20+3*CON`. Unshielded Rest checks resolved attack attempts, including dodged attacks; protected Rest checks damage reaching HP. Rest resolves after attacks. Player Rest punishment ×1.5. |
| Damage, crit, dodge, initiative | `combat_rules.py`: `compute_offensive_damage`, `compute_strike_damage`, `_agi_chance_bonus`, `_agi_dodge_bonus`, `apply_flat_graze_mitigation`, `prepare_round_initiative`, `spend_leader_initiative`, `drain_initiative` | STR×4 plus 5–15 roll; AGI damage ×(1+0.0175*AGI); Focus ×2, crit ×1.5; AGI mitigation 2.5. Crit and dodge use different curves. Initiative carries between rounds; drain changes next-round meter, not prepared order. |
| Focus | `main.py`: `_apply_rest_focus_gain`, `_apply_focus_potion_effect`, `_start_turn_focus_potion_lifecycle`, normal/Ultra attack branches; `focus_effects.py` | Successful Rest with existing Focus upgrades to Ultra. Potion grants normal Focus next round and cannot upgrade. Ordinary focused attack spends Focus on dodge. Ultra normal Attack skips dodge/Parry/AGI mitigation but still goes through the damage application layer. |
| All 18 consumables | `consumable_catalog.py`, `main.py` consumable dispatch, `DuelConsumableConfirmView`, `raid_consumables.py` | Current names/values; confirm/queue separate from main action; inventory consumed on resolution. One primary equipped consumable in standard shared combat. Scorched Will automatic, Last Stand prepared. No ID suffix used as a numerical value. |
| Weapons | `weapons_system.py`: `WEAPONS`; `weapons_combat.py`: `resolve_attack_active`, `resolve_instant_active`, `apply_pre_turn_setup`, availability checks | Dedicated slot, active replaces action, normal one-use limit, setup vs initiative. Examples: Trainee’s Edge 125%, Gemini 2×60%→75%, Aegis 1.5→1.8, Maul 80→100%, Sunder 60%/30→80%/50. Trainee’s Edge is a starter weapon without enhancement. Borrowed Reflection disabled in Boss Raid. |
| Gear and sets | `crafting_system.py`: `GEAR_ITEMS`, enhancement data, `GEAR_SETS`; `equipment_sets.py`; `main.py` First Aid/Null Crown helpers | Two slots; actual equipped membership required. First Aid 35→60, Mist Cloak 12 points, Shattered Fortress +25 next-round shield (45→70 total), Field Hospital 40 shield. Multiple compatible sets can apply. |
| Mode exceptions | `main.py` shared resolver and `RaidCombatView`; `combat_rules.py` campaign parry pressure | Vanguard/Campaign Rest has no base healing; Horde/BR repeated Rest diminishing healing; Campaign Parry 100/100/75/50/0%; Raid phases and passives. Pokemax/Mechas separate systems. |

## Editorial and implementation choices

- Spanish and English each have 13 navigable sections, all 18 consumables, three isolated worked examples, a decision checklist and FAQs. Keep in-game action/item names recognizable.
- Guide distinguishes offensive damage from actual HP loss, percentage points from percentage damage, one hit from one round, and current-round from next-round effects.
- Main controls and explanations are HTML/CSS diagrams and tables, not simulated game screenshots. No new raster image is needed for this reference guide.
- The old basic/combat/consumables renderers are replaced by the reviewed educational layer. Calculator now uses CON×5, separate dodge, and integer flooring after multipliers. It is explicitly limited to base stats.
- Detailed item availability, prices and server configuration are left to the current game panel. No claim that story-exclusive equipment is publicly obtainable.
- All static pages are regenerated, including native section links, canonical/alternate metadata and no-JavaScript guide content. The generator aborts when the app fails to render all routes.

## Verification

- Bot tests: dodge balance, initiative, Parry defense, Focus cleansing, Power Strike Focus consumption, consumable dispatch/display and equipment sets.
- The combined run passed 60 tests; one existing Parry test lacked a configured `crafting_system._db` fixture. That same test passed in isolation with an in-memory `get_story_account` stub returning no story account. No production database or bot code was changed.
- `node scripts/check-combat-guide.cjs`: both languages at 1440/768/390/320px; 13 sections/18 items; anchors/reload; language/back; FAQ; corrected calculator numbers; light theme screenshot; no-JavaScript content.
- `node scripts/check-edition.cjs`: existing navigation, calculator, themes, and every generated route’s internal links/assets.
- Screenshots are written outside the repository to `../combat-guide-qa` for visual review.

Examples intentionally omit other modifiers. A: CON10/STR10/AGI0 → defense60, counter40; 55 blocked, 90−60=30 through. B: 80/200HP, CON10/AGI0 → Rest50, incoming60×1.5=90, protected by shield200. C: STR10/AGI0/roll10 against AGI4 → normal40, Focus90, Ultra100.
