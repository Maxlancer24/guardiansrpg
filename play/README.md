# Guardians player demo 0.1

Routes: `/play/` (English), `/es/play/` (neutral Spanish). Unlisted/noindex, not
access-controlled. No portal/home links were added. `/battle-practice/` and
`/es/battle-practice/` remain unchanged and retain editable development controls.

The static welcome loads the existing engine only after Play. The demo-only
adapter hides developer controls, locks 1.5x playback and fixed builds, shows
opponent intent and beginner guidance, and keeps the detailed chronicle collapsed.
Jessie: STR 9 / AGI 12 / CON 14. Warden: STR 10 / AGI 6 / CON 15.
Enemy actions cycle Attack, Defend, Attack, Rest, Attack, Defend; from round 9 it
attacks to prevent indefinite Rest stalls. All math is the shared unchanged
bot-parity rules. No account, rewards, persistence or backend writes.

End state includes win/loss, rounds, decisions, remaining HP, special use and
replay. The page-owned music is preserved on replay. Audio remains opt-in.
Feedback is explicitly copy-only, not submitted or stored. Clipboard rejection
reveals a selectable plain-text fallback. Three optional hit previews use the
existing dry/metal recordings or a slower recorded hit with a synthetic body;
they do not alter the battle or claim to be three newly sourced recordings.

Validation: Node fake-scene lifecycle, isolated demo configuration, 200 seeded
duels per strategy, shared practice regressions and formula parity. Guided play
won 200/200 samples, averaging 5.1 rounds; attack-only won 87/200; Rest-only lost
200/200. These simulations are not browser visual QA or an audio listening test.
Shared engine versions match practice revision 11. Engine URLs are reused, so
future shared engine edits should regression-test both surfaces.
