const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pack=require('./arcanist.js'),fx=require('./arcane-fx.js'),scale=require('./scale.js'),animation=require('./animation.js');
assert.equal(Object.keys(pack).length,9);
assert.equal(Object.values(pack).reduce((n,p)=>n+p.frames.length,0),52);
assert.equal(pack.attack.sequence.slice(0,2).reduce((n,[f,ms])=>n+ms,0)+360,fx.timing.release);
assert.equal(animation.frame(pack.attack,fx.timing.release-360),2,'release uses casting pose');
assert.equal(animation.frame(pack.attack,fx.timing.impact-360-1),2,'same pose while beam extends');
assert.deepEqual(pack.attack.markers[0].point,pack.attack.castSockets.crystal[2],'marker is the staff crystal');
assert.equal(animation.frame(pack.defeat,100000),5,'defeat holds full final pose');
for(const [f,leftFoot] of [164,133,119,162,133,124].entries())assert(Math.abs(leftFoot-pack.idle.frames[f][4]+108)<=3,'idle feet registered');
for(const width of [390,640,1240]){
 const factor=scale.factor('arcanist',scale.sceneSize(960,width));
 const input={age:1300,frame:2,pack:pack.attack,factor,x:310,y:440,end:{x:720,y:300},size:230,enabled:true,reduced:false};
 const state=JSON.stringify(input),first=fx.sample(input),last=fx.sample({...input,age:1439});
 assert.deepEqual(first.beam.start,first.crystal);assert.deepEqual(first.beam.end,first.crystal);
 assert(Math.abs(last.beam.end.x-720)<5&&Math.abs(last.beam.end.y-300)<5);
 const hit=fx.sample({...input,age:1440});assert.deepEqual(hit.beam.end,input.end,'beam reaches target on damage event');assert(hit.impact);
 assert.equal(fx.sample({...input,age:359}),null);assert.equal(fx.sample({...input,age:fx.timing.end}),null);
 assert.equal(fx.sample({...input,age:1299,frame:1}).beam,null);
 const follow=fx.sample({...input,age:1550,frame:3});assert.deepEqual(follow.beam.start,follow.crystal);assert(follow.beam.alpha<hit.beam.alpha);
 for(const enabled of [true,false])for(const reduced of [true,false]){
  let depth=0,fills=0;const ctx=new Proxy({save(){depth++},restore(){depth--},createRadialGradient(){return{addColorStop(){}}},createLinearGradient(){return{addColorStop(){}}},fill(){fills++}}, {get:(t,k)=>k in t?t[k]:(...args)=>assert(args.every(Number.isFinite))});
  assert(fx.draw(ctx,{...input,age:1360,enabled,reduced}));assert.equal(depth,0);assert(fills>0,'beam visible in accessible mode');
 }
 assert.equal(JSON.stringify(input),state);
}
for(const p of Object.values(pack)){
 const data=fs.readFileSync(path.join(__dirname,'..',p.src));assert.equal(data[25],6,'PNG RGBA color type');
}
console.log('PASS: Arcanist 52 poses, registered idle, complete defeat, release-frame/impact sync, mobile sockets, reduced motion and effects toggle.');
