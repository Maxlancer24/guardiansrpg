"""Package existing game art: first idle cell, trim transparent padding, WebP.

No repainting or generated art. Sources are always the current game checkout.
"""
from pathlib import Path
from PIL import Image
import hashlib
import json

SITE = Path(__file__).resolve().parents[1]
GAME = SITE.parent
DEST = SITE / 'assets' / 'raids'
DEST.mkdir(parents=True, exist_ok=True)
manifest = {}

def export(name, source, cell=None):
    path = GAME / 'assets' / 'boss-raids' / source
    im = Image.open(path).convert('RGBA')
    if cell:
        im = im.crop((0, 0, *cell))
        bounds = im.getchannel('A').getbbox()
        if not bounds:
            raise ValueError(f'Empty sprite: {source}')
        im = im.crop(bounds)
        im.thumbnail((700, 700), Image.Resampling.LANCZOS)
    else:
        im = im.convert('RGB')
        im.thumbnail((1400, 900), Image.Resampling.LANCZOS)
    target = DEST / (name + '.webp')
    im.save(target, 'WEBP', quality=87, method=6)
    manifest[name] = dict(source=str(path.relative_to(GAME)).replace('\\','/'),
                          source_sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                          cell=cell, size=im.size,
                          output_sha256=hashlib.sha256(target.read_bytes()).hexdigest())

for name, folder, arena, idle, cell in [
    ('centinel', 'first-sentinel', 'arena.png', 'boss-{}-idle.png', (768,768)),
    ('gilded', 'first-sentinel', 'arena.png', 'gilded-boss-{}-idle.png', (768,768)),
    ('vareth', 'vareth', 'arena.png', 'idle-{}-v35.png', (512,512)),
    ('jade', 'jade-regent', 'arena-1.png', 'idle-guard-{}-v3.webp', (896,640)),
    ('crimson', 'jade-regent', 'crimson-arena-1.png', 'crimson-idle-guard-{}-v3.webp', (896,640)),
]:
    if name != 'gilded':
        export(name+'-arena', folder+'/'+arena)
    for phase in [1,2]:
        export(name+'-'+str(phase), folder+'/'+idle.format(phase), cell)
for name, source in [('jade-arena-2','jade-regent/arena-2.png'),('crimson-arena-2','jade-regent/crimson-arena-2.png')]:
    export(name,source)
(DEST/'sources.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print(f'{len(manifest)} assets, {sum(p.stat().st_size for p in DEST.glob("*.webp")):,} bytes')
