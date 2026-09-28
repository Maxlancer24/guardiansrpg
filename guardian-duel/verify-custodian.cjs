const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pack=require('./custodian.js'),fx=require('./melee-fx.js'),scale=require('./scale.js'),animation=require('./animation.js');
assert.equal(Object.keys(pack).length,9);
assert.equal(Object.values(pack).reduce((n,p)=>n+p.frames.length,0),52);
assert.equal(pack.attack.sequence.slice(0,2).reduce((n,[f,ms])=>n+ms,0),875);
assert.equal(animation.duration(pack.attack),1420);
assert.equal(animation.frame(pack.attack,1235-360),2,'hammer contact coincides with one shared damage event');
assert.equal(animation.frame(pack.attack,1380-360),3,'follow-through after impact');
assert.deepEqual(pack.attack.markers[0].point,pack.attack.hammer[2]);
assert.equal(animation.frame(pack.defeat,100000),5,'defeat completes and holds final pose');
assert(pack.guard.src.endsWith('guard-v2.png'),'neutral guard uses upright hammer correction');
assert(pack.defeat.src.endsWith('defeat-v2.png'),'fall orientation correction is active');
for(const [i,edge] of [173,141,109,173,141,109].entries())assert.equal(edge-pack.idle.frames[i][4],-134,'idle feet registered');
for(const [i,edge] of [148,143,134,148,144,135].entries())assert.equal(edge-pack.victory.frames[i][4],-137,'salute feet registered');
assert.deepEqual(pack.victory.sequence.map(([f])=>f),[0,1,2,3,4,0,5,0],'salute lowers through intermediate pose, no hammer flip');
const r=pack.attack.frames[2];
assert.equal(pack.attack.hammer[2][0]-r[0]-r[4],pack.attack.reach);
for(const cssWidth of [390,640,1240]){
 const size=scale.sceneSize(960,cssWidth),factor=scale.factor('custodian',size),s=pack.attack.scale*factor;
 const home=960*.28,contact=960*.75-size*.1,advance=contact-home-pack.attack.reach*s;
 assert(advance>0,'hammer has explicit approach reach');
 const input={id:'custodian',age:1235,frame:2,pack:pack.attack,factor,x:home+advance,y:490};
 const g=fx.sample(input);assert.equal(g.kind,'hammer');
 assert(Math.abs(g.tip.x-contact)<1e-8,'head reaches NPC rather than hitting empty air');
 assert.deepEqual(fx.profiles.custodian.blade[2][1],pack.attack.hammer[2]);
 assert.deepEqual(fx.profiles.custodian.blade[3][1],pack.attack.hammer[3]);
}
for(const p of Object.values(pack)){
 const data=fs.readFileSync(path.join(__dirname,'..',p.src));assert.equal(data[25],6,'RGBA source');
 const width=data.readUInt32BE(16),height=data.readUInt32BE(20);
 for(const [x,y,w,h] of p.frames)assert([x,y,w,h].every(Number.isInteger)&&x>=0&&y>=0&&x+w<=width&&y+h<=height);
}
console.log('PASS: Custodian 52 poses, planted idle/salute, corrected guard/fall, full defeat, hammer contact/reach and mobile/desktop effect registration.');
