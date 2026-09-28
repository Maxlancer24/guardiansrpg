const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const p=require('./guardian.js'),fx=require('./melee-fx.js'),scale=require('./scale.js'),anim=require('./animation.js');
assert.equal(Object.keys(p).length,9);
assert.equal(Object.values(p).reduce((n,a)=>n+a.frames.length,0),54);
assert.equal(anim.duration(p.attack),1420);
assert.equal(anim.frame(p.attack,1235-360),2);
assert.equal(anim.frame(p.attack,1380-360),3);
assert.equal(anim.frame(p.defeat,100000),5);
assert.equal(anim.duration(p.hurt),650);
assert.equal(p.idle.loop,true);
for(const [i,edge]of [140,140,140,139,139,140].entries())assert.equal(edge-p.idle.frames[i][4],-117);
for(const [i,edge]of [158,144,139,162,145,136].entries())assert.equal(edge-p.victory.frames[i][4],-110);
for(const a of Object.values(p)){
 const bytes=fs.readFileSync(path.join(__dirname,'..',a.src));
 assert.equal(bytes[25],6,'RGBA');
 const w=bytes.readUInt32BE(16),h=bytes.readUInt32BE(20);
 for(const [x,y,cw,ch]of a.frames)assert(x>=0&&y>=0&&x+cw<=w&&y+ch<=h);
 for(const [f,ms]of a.sequence)assert(a.frames[f]&&ms>0);
}
for(const f of [2,3])assert.deepEqual(fx.profiles.guardian.blade[f],p.attack.blade[f]);
const size=230,factor=scale.factor('guardian',size),s=p.attack.scale*factor;
const g=fx.sample({id:'guardian',age:1235,frame:2,pack:p.attack,factor,x:900-p.attack.reach*s,y:500});
assert(Math.abs(g.tip.x-900)<1e-8,'blade reaches the real contact point');
let at=0;for(const [f,ms]of p.victory.sequence){assert.equal(anim.victory(p.victory,at+1),f);at+=ms;}
console.log('Guardian: 54 frames / nine actions; feet, full victory, defeat, RGBA, melee contact and shared scale verified.');
