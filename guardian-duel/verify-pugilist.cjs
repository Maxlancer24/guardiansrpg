const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pack=require('./pugilist.js'),fx=require('./melee-fx.js'),scale=require('./scale.js'),animation=require('./animation.js');
assert.equal(Object.keys(pack).length,9);
assert.equal(Object.values(pack).reduce((n,p)=>n+p.frames.length,0),52);
assert.equal(pack.attack.sequence.slice(0,2).reduce((n,[f,ms])=>n+ms,0),875);
assert.equal(animation.duration(pack.attack),1420);
assert.equal(animation.frame(pack.attack,1235-360),2,'contact pose at the shared damage event');
assert.equal(animation.frame(pack.attack,1380-360),3,'same punching hand in follow-through');
assert.deepEqual(pack.attack.markers[0].point,pack.attack.knuckles[2]);
assert.equal(animation.frame(pack.defeat,100000),5,'complete collapse holds the last pose');
for(const [i,edge] of [94,94,94,94,94,94].entries())assert.equal(edge-pack.idle.frames[i][4],-157,'idle feet do not slide');
for(const [i,edge] of [125,112,104,146,114,103].entries())assert.equal(edge-pack.victory.frames[i][4],-145,'victory feet stay registered');
assert.deepEqual(pack.victory.sequence.map(([f])=>f),[0,1,2,3,4,0,5,0],'salute lowers through the intermediate pose');
const r=pack.attack.frames[2];
assert.equal(pack.attack.knuckles[2][0]-r[0]-r[4],pack.attack.reach);
for(const cssWidth of [390,640,1240]){
 const size=scale.sceneSize(960,cssWidth),factor=scale.factor('pugilist',size),s=pack.attack.scale*factor;
 const home=960*.28,contact=960*.75-size*.1,advance=contact-home-pack.attack.reach*s;
 assert(advance>0,'fist needs its own approach distance');
 for(const frame of [2,3]){
  const input={id:'pugilist',age:frame===2?1235:1380,frame,pack:pack.attack,factor,x:home+advance,y:490};
  const g=fx.sample(input);assert(g&&g.kind==='punch');
  assert(Math.abs(g.tip.x-contact)<5,'knuckles reach the NPC instead of punching empty air');
 }
}
for(const p of Object.values(pack)){
 const bytes=fs.readFileSync(path.join(__dirname,'..',p.src));
 assert.equal(bytes[25],6,'transparent RGBA source');
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
 for(const [x,y,w,h] of p.frames)assert(x>=0&&y>=0&&x+w<=width&&y+h<=height);
}
console.log('PASS: Pugilist 52 poses, planted idle/victory, complete defeat, right-fist contact and recovery timing, desktop/mobile reach.');
