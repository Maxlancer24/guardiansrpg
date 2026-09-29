/* Build-only inventory. Never loaded by the game. --write refreshes generated inventory. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),catalog=require('./catalog.json');
const scale=require('../guardian-duel/scale.js'),fx=require('../guardian-duel/melee-fx.js');
const palettes=require('../guardian-duel/palettes.js'),paletteEngine=require('../guardian-duel/palette-engine.js');
const required=['idle','attack','guard','hurt','rest','motion','activation','victory','defeat'];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function local(p){
 assert(typeof p==='string'&&!p.includes('\\')&&!p.split('/').includes('..'),'unsafe catalog path');
 const file=path.resolve(root,p.replace(/^\//,''));
 assert(file.startsWith(root+path.sep),'outside site');assert(fs.statSync(file).isFile(),p);
 return file;
}
const ids=new Set(),active=new Set(),characters=[];
assert.equal(catalog.schemaVersion,1);
for(const c of catalog.characters){
 assert(/^[a-z][a-z0-9-]*$/.test(c.id)&&!ids.has(c.id),'unique stable ID');ids.add(c.id);
 assert(c.name.es&&c.name.en);
 if(c.kind==='story-protagonist'){
  assert.equal(c.appearanceSelectableForPlayers,false);
  for(const file of c.sourceFiles)local(file);
  if(!c.manifest){characters.push({id:c.id,kind:c.kind,status:c.status,inventoryCoverage:'source-pointers-only',sourceFiles:c.sourceFiles});continue;}
 }
 assert(['player-appearance','story-protagonist'].includes(c.kind));
 if(c.status==='concept-only'){
  assert(!c.manifest&&!c.release.demo&&!c.release.liveGame);
  const concept=c.conceptAsset?{asset:c.conceptAsset,sha256:hash(fs.readFileSync(local(c.conceptAsset))),designReview:c.designReview}:null;
  characters.push({id:c.id,status:c.status,concept,actions:{}});continue;
 }
 assert.equal(c.status,'demo-ready');assert(c.release.demo&&!c.release.liveGame);
 const manifestFile=local(c.manifest),pack=require(manifestFile),actions={};
 const expected=pack.attack2?[...required,'attack2']:required;assert.deepEqual(Object.keys(pack).sort(),[...expected].sort());assert(scale.profiles[c.id]);
 for(const name of expected){
  const p=pack[name],file=local(p.src),bytes=fs.readFileSync(file);
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
  assert(p.scale>0&&Number.isFinite(p.scale));
  if(p.frameScale){assert.equal(p.frameScale.length,p.frames.length);assert(p.frameScale.every(s=>Number.isFinite(s)&&s>0));}
  for(const r of p.frames){assert.equal(r.length,6);assert(r.every(Number.isFinite));const [x,y,w,h]=r;assert(x>=0&&y>=0&&w>0&&h>0&&x+w<=width&&y+h<=height,p.src);}
  for(const seq of [p.sequence,p.settled?.sequence].filter(Boolean))for(const [f,ms] of seq)assert(p.frames[f]&&Number.isFinite(ms)&&ms>0);
  for(const clip of p.clips||[])if(clip)for(const [x,y] of clip)assert(Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<=width&&y>=0&&y<=height);
  active.add(p.src.replace(/^\//,''));
  actions[name]={asset:p.src,sha256:hash(bytes),dimensions:[width,height],frameCount:p.frames.length,sequence:p.sequence,settled:p.settled||null,scale:p.scale,frameScale:p.frameScale||null,hasClipping:!!p.clips};
 }
 const presentationFiles=(c.presentationFiles||[]).map(file=>({file,sha256:hash(fs.readFileSync(local(file)))}));
 characters.push({id:c.id,kind:c.kind,status:c.status,manifest:c.manifest,manifestSha256:hash(fs.readFileSync(manifestFile)),scale:scale.profiles[c.id],weaponEffect:fx.profiles[c.id]||null,presentationFiles,actions});
}
const available=catalog.characters.filter(c=>c.status==='demo-ready').map(c=>c.id).sort();
assert.deepEqual(available,Object.keys(scale.profiles).sort(),'catalog covers every calibrated appearance');
const game=fs.readFileSync(local('guardian-duel/game.js'),'utf8');
const runtime=[...game.matchAll(/(\w+):\{actions:\w+_ACTIONS/g)].map(m=>m[1]).sort();
assert.deepEqual(available,runtime,'catalog matches current demo roster');
for(const id of Object.keys(fx.profiles))assert(available.includes(id));
for(const [id,profile]of Object.entries(palettes)){assert(available.includes(id));paletteEngine.validate(profile);}
function pngs(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?pngs(path.join(dir,e.name)):e.name.endsWith('.png')?[path.relative(root,path.join(dir,e.name)).split(path.sep).join('/')]:[])}
const data={schemaVersion:1,scope:'Fourteen player appearances and Guardian protagonist: complete action inventory. Legacy protagonists: source pointers only.',characters,
 paletteSystem:{definition:'guardian-duel/palettes.js',definitionSha256:hash(fs.readFileSync(local('guardian-duel/palettes.js'))),engine:'guardian-duel/palette-engine.js',engineSha256:hash(fs.readFileSync(local('guardian-duel/palette-engine.js'))),profiles:palettes},
 retainedAssetsNotSelectedByGuardianManifests:pngs(path.join(root,'guardian-duel/assets')).filter(p=>!active.has(p)).sort(),
 retentionWarning:'Not selected by these manifests does NOT mean unused globally. Do not delete without checking other consumers.'};
const output=path.join(__dirname,'inventory.generated.json'),content=JSON.stringify(data,null,2)+'\n';
if(process.argv.includes('--write'))fs.writeFileSync(output,content);
else assert.equal(fs.readFileSync(output,'utf8'),content,'Inventory stale: run node characters/audit.cjs --write and review the diff');
console.log(`PASS: ${ids.size} identities; ${available.length} complete demo packs / ${active.size} active atlases; source files, crops, durations, scales, hashes and inventory verified.`);
