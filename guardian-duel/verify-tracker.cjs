const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pack=require('./tracker.js'),fx=require('./crossbow-fx.js'),scale=require('./scale.js'),animation=require('./animation.js');
assert.equal(Object.keys(pack).length,9);
assert.equal(Object.values(pack).reduce((n,p)=>n+p.frames.length,0),54);
assert.equal(pack.attack.sequence.slice(0,2).reduce((n,[f,ms])=>n+ms,0)+360,fx.release);
assert.equal(animation.duration(pack.attack)+360,2180,'complete reload before idle');
assert.equal(animation.frame(pack.attack,fx.release-360),2,'release uses firing pose');
assert.equal(animation.frame(pack.attack,fx.impact-360-1),2,'same socket while projectile travels');
assert.deepEqual(pack.attack.markers[0].point,pack.attack.muzzle[2]);
const r=pack.attack.frames[2],[mx,my]=pack.attack.muzzle[2];
assert(mx>=r[0]&&mx<r[0]+r[2]&&my>=r[1]&&my<r[1]+r[3]);
for(const [f,leftFoot] of [149,128,107,150,128,108].entries())assert(Math.abs(leftFoot-pack.idle.frames[f][4]+143)<=1,'idle soles registered');
assert(pack.guard.src.endsWith('guard-v2.png'),'corrected guard has no duplicated supporting hand');
assert.equal(animation.frame(pack.defeat,100000),5);
for(const width of [390,640,1240]){
 const factor=scale.factor('tracker',scale.sceneSize(960,width));
 const input={age:1300,frame:2,pack:pack.attack,factor,x:270,y:440,end:{x:720,y:300},size:230,enabled:true,reduced:false};
 const state=JSON.stringify(input),first=fx.sample(input),last=fx.sample({...input,age:1439});
 assert.equal(first.x,first.start.x);assert.equal(first.y,first.start.y);
 assert(Math.abs(last.x-720)<5&&Math.abs(last.y-300)<5,'bolt reaches damage target');
 assert.equal(fx.sample({...input,age:1299}),null);assert.equal(fx.sample({...input,age:1440}),null);
 assert.equal(fx.sample({...input,frame:0}),null,'no projectile from a resting weapon');
 for(const enabled of [true,false])for(const reduced of [true,false]){
  let depth=0,fills=0;const ctx=new Proxy({save(){depth++},restore(){depth--},createLinearGradient(){return{addColorStop(){}}},fill(){fills++}}, {get:(t,k)=>k in t?t[k]:(...args)=>assert(args.every(Number.isFinite))});
  assert(fx.draw(ctx,{...input,age:1360,enabled,reduced}));assert.equal(depth,0);assert(fills>0,'bolt remains visible when extra effects disabled');
 }
 assert.equal(JSON.stringify(input),state,'effects cannot mutate combat state');
}
for(const p of Object.values(pack)){
 const data=fs.readFileSync(path.join(__dirname,'..',p.src));assert.equal(data[25],6,'PNG RGBA');
 const width=data.readUInt32BE(16),height=data.readUInt32BE(20);
 for(const [x,y,w,h] of p.frames)assert([x,y,w,h].every(Number.isInteger)&&x>=0&&y>=0&&x+w<=width&&y+h<=height);
}
console.log('PASS: Tracker 54 poses, planted idle, eight-stage reload, crossbow socket/release/impact, full defeat, mobile scaling, effects toggle and reduced motion.');
