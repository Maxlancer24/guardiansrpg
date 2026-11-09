"""Check the reviewed public guide against current local source files; no imports of the bot."""
import hashlib
import json
from pathlib import Path
import sys

site = Path(__file__).resolve().parents[1]
game = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else site.parent
hashes = json.loads((site / 'content-source-hashes.json').read_text(encoding='utf-8'))
changed = [name for name, expected in hashes.items()
           if not (game / name).is_file()
           or hashlib.sha256((game / name).read_bytes()).hexdigest() != expected]
assets = json.loads((site / 'assets/updates-20261109/sources.json').read_text(encoding='utf-8'))
for name, row in assets.items():
    for file, expected in [(game / row['source'], row['source_sha256']),
                           (site / 'assets/updates-20261109' / (name + '.webp'), row['output_sha256'])]:
        if not file.is_file() or hashlib.sha256(file.read_bytes()).hexdigest() != expected:
            changed.append(str(file))
if changed:
    raise SystemExit('Review changed sources before publishing:\n' + '\n'.join(changed))
print(f'Current source hashes match: {len(hashes)} game files and {len(assets)} illustrations.')
