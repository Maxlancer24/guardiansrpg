# Jessie practice audio — revision 19

Both source recordings are published under CC0 1.0:
https://creativecommons.org/publicdomain/zero/1.0/

## shot.wav

Source: **The Free Firearm Sound Library**, by Ben Jaszczak, Brian Nelson,
Kevin Heras and Matthew Nanney; archived on OpenGameArt by bart.

- License/source page: https://opengameart.org/content/the-free-firearm-sound-library
- Archive: https://opengameart.org/sites/default/files/Prepared%20SFX%20Library.7z
- Original file: `Prepared SFX Library/Smith & Wesson 642/V_22P.wav`
- Embedded metadata identifies a .38 Special revolver gunshot, mid-distance.
- Modification: first strong transient at 0.67118 seconds, 1.14997-second excerpt,
  stereo to mono, 32 kHz / 16-bit PCM, peak normalization to 0.8 and edge fades.
- SHA-256: `cb719642b26b0835f226d887b03eb24dfffc1c2f88b35b65c5c37fd03fbe5067`

## mechanism.wav

Source: **Gun reload sounds**, recorded with airsoft guns by SpringySpringo.
This is a short mechanical accent, not a claim to be a recorded revolver hammer.

- License/source page: https://opengameart.org/content/gun-reload-sounds
- Original: https://opengameart.org/sites/default/files/gunreload1.wav
- Modification: excerpt at 0.18048 seconds, duration 0.24 seconds, stereo to mono,
  32 kHz / 16-bit PCM, peak normalization to 0.8 and edge fades.
- SHA-256: `de15e1ed2e15b02aeb49b93d9d6c2566446dc0d417b21c4d39417cfe6fb8ce6c`

## Runtime mix

Charge and low-frequency finisher resonance are synthesized with Web Audio.
The gunshots use the actual recording, with small playback-rate variations.
A compressor and a live master-volume control sit after all voices. Audio is
off by default and loads/decodes after user opt-in. Failed loads retain the
basic synthesized sounds; a late download never replays an expired cue.
Pause, reset, mute and special completion stop all voices.

No Epic Seven audio was copied. No enemy assets or combat rules were changed.

Validation: both WAVs decode in Chromium; mono PCM peaks at 0.8 (no clipped
samples). Desktop/mobile special timing, four muzzle events, three impacts,
portrait length, fixed character scale, pause/reset and unchanged HP were
checked. ES/EN tests cover audio opt-in, live volume, cue order, stop-on-pause,
mute, regular attacks and unavailable-file fallback. These are technical
checks, not a subjective listening review on the player's speakers/headphones.
