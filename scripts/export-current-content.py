"""Export public guide data from the current game checkout, without importing the bot.

Only pet_data.py (pure math/static content) is executed. All other sources are
read as AST/JSON; no database, environment file or player data is opened.
"""
import ast
import hashlib
import json
from pathlib import Path
import runpy
import sys

SITE = Path(__file__).resolve().parents[1]
GAME = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else SITE.parent
used = {}

def read(name):
    raw = (GAME / name).read_bytes()
    used[name] = hashlib.sha256(raw).hexdigest()
    return raw.decode('utf-8-sig')

def literal(name, key):
    for node in ast.parse(read(name)).body:
        target = node.targets[0] if isinstance(node, ast.Assign) else node.target if isinstance(node, ast.AnnAssign) else None
        if isinstance(target, ast.Name) and target.id == key:
            return ast.literal_eval(node.value)
    raise ValueError((name, key))

read('pet_data.py')
pet = runpy.run_path(str(GAME / 'pet_data.py'))
species = {k: v for k, v in pet['SPECIES'].items() if not v.get('hidden')}
move_ids = {move for sp in species.values() for _, move in sp['learnset']}
moves = {k: v for k, v in pet['MOVES'].items() if k in move_ids}
families = {}
for sp in species.values():
    families.setdefault(sp['line'], []).append(sp)
families = [sorted(line, key=lambda s: s['stage']) for line in families.values()]
data = dict(
    reviewed='2026-10-26', species=species, moves=moves, families=families,
    graph=literal('region_system.py', 'REGION_GRAPH'),
    enemies=literal('region_system.py', 'REGION_ENEMIES'),
    drops=literal('region_system.py', 'REGION_DROP_TABLE'),
    dropBase=literal('region_system.py', 'DROP_RATES_BASE'),
    dropStep=literal('region_system.py', 'DROP_LEVEL_STEP'),
    territories=literal('territory_system.py', 'TERRITORIES'),
    materials=literal('crafting_system.py', 'MATERIALS'),
    gear=literal('crafting_system.py', 'GEAR_ITEMS'),
    sets=literal('crafting_system.py', 'GEAR_SETS'),
    clanPassives=literal('clan_system.py', 'PASSIVE_CATALOG'),
    medals=literal('pet_gym_system.py', 'MEDALS'),
    primordial=literal('pokemax_primordial.py', 'PASSIVES'),
    jadeTree=literal('jade_mastery.py', 'TREE'),
    masteryPrices=literal('character_mastery.py', 'STAGE_PRICES'),
    jadePrices=literal('character_mastery.py', 'JADE_STAGE_PRICES'),
    jadeUnlock=literal('character_mastery.py', 'JADE_UNLOCK_PRICE'),
    events=json.loads(read('greywood_regional_events_import.json')),
    missions=json.loads(read('greywood_clan_missions_import.json')),
)
for name in ['greywood_system.py', 'greywood_content.py', 'pet_gym_system.py',
             'pokemax_league_system.py', 'pet_route_trainers.py', 'pet_engine.py',
             'pokemax_primordial_service.py', 'boss_raid_config.py', 'raid_jade_regent.py',
             'raid_phases.py', 'raid_vareth.py', 'portal_characters.py',
             'story_adventure.py', 'story_adventure_economy.py', 'story_adventure_progress.py',
             'story_http.py', 'campaign_war_system.py', 'campaign_late_join.py',
             'combat_rules.py', 'consumable_catalog.py', 'crimson_echo.py']:
    read(name)
# Exclude administrative IDs/configuration, narrative campaign spoilers and all
# hidden species. Only selected public content above is written to the browser.
(SITE / 'current-data.js').write_text('/* Generated from the current game checkout. See CONTENT_REVIEW_20261026.md. */\nwindow.GuardiansCurrentData = '+json.dumps(data, ensure_ascii=False, separators=(',', ':'))+';\n', encoding='utf-8')
(SITE / 'content-source-hashes.json').write_text(json.dumps(used, indent=2, sort_keys=True)+'\n', encoding='utf-8')
print(json.dumps(dict(species=len(species), families=len(families), moves=len(moves), huntRegions=len(data['enemies']), namedEnemies=sum(len(f['names']) for r in data['enemies'].values() for f in r), sources=len(used))))
