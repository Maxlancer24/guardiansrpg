# Idle and victory alignment correction

Built-in image tool edit, transparent output saved as `idle-v2.png`; original
`idle.png` retained. Reference/edit target: `idle.png`.

## Exact prompt

Use case: identity-preserve. Edit target: the attached transparent 3-column by 2-row idle sprite sheet of the female Sentinel. Make ONE localized correction: bottom-right cell (sixth pose, eyes closed) must have the EXACT SAME neutral head angle, upright neck, chin position, face location and hair silhouette as the bottom-middle cell (fifth pose). Only eyelids close for a blink; no nodding, no head leaning forward, no downward chin tilt, no horizontal head shift. Preserve her face, short auburn hair, purple tabard/cape, silver armor, gold trim, right-hand sword and left-arm star shield. Keep the other five poses completely unchanged. Preserve the full 1536x1024 sheet composition, six full-body figures, sword lengths, boots positions, each cell's character scale, tiny cape/breathing variations, colors, linework, transparency. Do not add background, glow, text or outlines. Output genuinely transparent PNG.

## Integration and review

The blink retains a neutral head angle. The generated sheet also shifted the
third-column drawings, so idle foot anchors were recalibrated from actual boot
positions: 304, 265, 232, 304, 265, 233. Standing size and timing are unchanged.

Victory PNG is unchanged. Its raised blink (frame 2) had an anchor 16 source
pixels too far right, and the settled blink (frame 5) was 13 pixels too far
right. Corrected anchors are 266 and 234 respectively. Regression assertions
compare planted boot positions across those pairs and across all idle poses.

Validated with native-canvas renders and the simulated-client regression suite;
not an in-browser visual test.
