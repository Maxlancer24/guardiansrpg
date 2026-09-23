# Local playable practice — base duel rules, revision 1

Routes: `/battle-practice/` (EN), `/es/battle-practice/` (neutral ES).
Unlisted/noindex, not access-controlled. No homepage promotion, account access,
API calls, inventory writes, rewards or bot runtime changes.

## Supported subset and sources

- STR, AGI, CON: editable 0–60, synthetic starting builds clearly labelled.
- HP: `50 + 15*CON` from `database.create_player`.
- Base damage, AGI overcrit, critical/dodge chance, Focus, flat mitigation:
  `combat_rules.py` functions `compute_offensive_damage`, `crit_chance_pct`,
  `dodge_chance_pct`, `compute_strike_damage`, `apply_flat_graze_mitigation`.
- Accumulated initiative: `prepare_round_initiative`. Each living actor has
  one action; only the round leader spends a full meter when attacking.
- Parry: DEF = `5*CON + STR`; perfect-block counter = `3*CON + STR`.
  Overflow damage receives AGI mitigation. No per-visual-bullet counter.
- Rest: deferred until all attacks resolve, heals `20 + 3*CON`, grants Focus;
  resting with Focus grants Ultra. Any targeted attack interrupts unshielded
  Rest, including a dodged attack. Rest vulnerability is x1.5 before mitigation.
- Ultra: guaranteed normal attack, bypasses dodge, guard and flat mitigation;
  consumes Focus/Ultra, retains the underlying damage/critical computation.
- Jessie `jessie_two_problems`: once per combat; two separate actual hits,
  each can dodge, ignores Parry, receives flat mitigation, no crit roll,
  clears prior Focus before firing and grants Focus afterward. In this 1v1
  version both shots target the sole opponent; stop if no live target remains.

Normal shot animation splits ONE resolved damage total into two displayed
numbers. Special cinematic has extra visual muzzle flashes, but resolves only
the two logical hits. Damage is calculated first; presentation cannot generate
extra crits, actions or damage. Enemy decisions do not inspect the chosen action.

This is a JavaScript port for an isolated demonstration, **not** the entire
Python combat engine or a secure multiplayer implementation. Practice opponent
AI is explicitly simplified. No equipped weapons/gears, enhancements, clan or
territory bonuses, NPC passives, consumables, shields, revives, teams or mode
overrides (War/Vanguard/Horde/BR). The existing enemy art is reused unchanged.
Account-backed combat must use a server-authoritative shared resolver later.

## Validation

`check-practice-rules.cjs`: 72 comparisons with the actual Python damage/chance
helpers; initiative retention, guard/counter, Rest interruption on dodge,
Focus/Ultra, special limit, KO, invalid actions and 100 simulated duels.
`check-practice-adapter.cjs`: fake-scene unit integration for action queues,
state snapshots, special cancellation/reset and complete victory/defeat flow.
Syntax and route/asset checks also run. These are not browser visual tests.

Existing animation lab remains available separately. Shared rendering changes
are optional hooks, inactive there. Existing audio credits remain in
`assets/demo-battle/audio-v1/CREDITS.md`.

## Presentation revision 2

Focus uses a turquoise aura; Ultra Focus uses gold. Labels remain readable
with effects disabled; reduced-motion disables orbiting motes and number bounce.
Aura state follows the displayed combat snapshots and disappears after use/KO.
Parry announces guarding, perfect block or guard break, followed by a distinct
counter animation. Reflected HP loss is presented on counter contact, using the
already-resolved amount: no extra attack, random roll or damage calculation.
Normal attack and special numbers occupy separate lanes and rise on a dedicated
presentation clock, which advances during the cinematic and stops when paused.
Tests cover lane separation, cinematic label expiry, pause, Focus/Ultra/KO,
deferred counter HP and reset cleanup. Enemy artwork and game rules unchanged.

## Presentation revision 3

Restore the existing enemy hurt drawing for actual damage, ahead of the idle
and recovery drawings; KO remains higher priority. Normal shots, special hits
and Jessie's counter notify the reaction timer; dodges and full blocks do not.
Rest has a 1300 ms virtual breathing/eyes-closed sequence using existing frames
without moving the feet or changing proportions. Success gets a separate
recovery pulse and Focus/Ultra announcement; interrupted Rest has no success
pulse and grants no new Focus. Both actors use the same outcome timing.
Unit regressions cover hurt/recovery/pause/dodge and Rest pose, delayed Focus,
interruption and reset. Rules tests still pass unchanged.

## Presentation revision 4

Jessie's special displays its already-resolved total across three beats:
25%, 25%, 50%. Integer rounding assigns the remaining point to the finisher.
Visible HP follows the same cumulative values; lethal damage is shown on the
finisher. The underlying two logical hits, dodge results, Focus and action
count are unchanged and remain recorded in the chronicle. Zero-total skills
show dodges, not invented damage. Duplicate beat callbacks are ignored.
