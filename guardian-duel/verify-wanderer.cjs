const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const p=require('./wanderer.js'),fx=require('./melee-fx.js'),scale=require('./scale.js'),anim=require('./animation.js');
assert.equal(Object.keys(p).length,9);
assert.equal(Object.values(p).reduce((n,a)=>n+a.frames.length,0),52);
assert.equal(anim.duration(p.attack),1420);
assert.equal(anim.frame(p.attack,1235-360),2);
assert.equal(anim.frame(p.attack,1380-360),3);
assert.deepEqual(p.attack.markers[0].point,p.attack.blade[2][1]);
assert.equal(anim.frame(p.defeat,100000),5);
assert.equal(p.idle.loop,true);
for(const [i,edge] of [143,143,142,143,143,142].entries())assert.equal(edge-p.idle.frames[i][4],-129,'idle boots remain planted');
for(const [i,edge] of [148,147,148,148,147,147].entries())assert.equal(edge-p.victory.frames[i][4],-117,'victory boots remain planted');
assert(p.defeat.src.endsWith('/defeat-v2.png'),'uncropped final saber correction is active');
for(const width of [390,640,1240]){
 const size=scale.sceneSize(960,width),factor=scale.factor('wanderer',size),s=p.attack.scale*factor;
 const home=960*.28,target=960*.75-size*.1,advance=target-home-p.attack.reach*s;
 assert(advance>0);
 const g=fx.sample({id:'wanderer',age:1235,frame:2,pack:p.attack,factor,x:home+advance,y:490});
 assert.equal(g.kind,'slash');assert(Math.abs(g.tip.x-target)<1e-8);
 for(const f of [2,3])assert.deepEqual(fx.profiles.wanderer.blade[f],p.attack.blade[f]);
}
for(const a of Object.values(p)){
 const bytes=fs.readFileSync(path.join(__dirname,'..',a.src));
 assert.equal(bytes[25],6,'genuine RGBA sources');
 const w=bytes.readUInt32BE(16),h=bytes.readUInt32BE(20);
 for(const [x,y,cw,ch] of a.frames)assert([x,y,cw,ch].every(Number.isInteger)&&x>=0&&y>=0&&x+cw<=w&&y+ch<=h);
 for(const [f,ms] of a.sequence)assert(a.frames[f]&&ms>0);
}
assert.deepEqual(p.victory.sequence.map(([f])=>f),[0,1,2,3,4,0,5,0]);
console.log('PASS: Wanderer 52 poses, nine actions, full victory/defeat, saber contact timing, source rectangles and mobile/desktop effect sockets.');
