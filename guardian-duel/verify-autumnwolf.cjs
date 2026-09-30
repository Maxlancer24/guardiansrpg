const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const p=require('./autumnwolf.js'),a=require('./animation.js'),s=require('./scale.js'),fx=require('./melee-fx.js');
assert.deepEqual(Object.keys(p),['idle','attack','guard','hurt','rest','motion','activation','victory','defeat']);
assert.equal(Object.values(p).reduce((n,v)=>n+v.frames.length,0),52);
for(const [key,pack] of Object.entries(p)){
 assert.equal(pack.frames.length,key==='hurt'?4:6);
 const b=fs.readFileSync(path.join(__dirname,'..',pack.src));assert.equal(b[25],6,'RGBA');
 const w=b.readUInt32BE(16),h=b.readUInt32BE(20);
 for(const [x,y,cw,ch]of pack.frames)assert(x>=0&&y>=0&&x+cw<=w&&y+ch<=h);
 assert.equal(pack.clips.length,pack.frames.length);
 for(const clip of pack.clips)for(const[x,y]of clip)assert(x>=0&&x<=w&&y>=0&&y<=h);
 const seen=new Set();for(let t=0;t<a.duration(pack);t+=5)seen.add(a.frame(pack,t));
 assert.equal(seen.size,pack.frames.length,key+' reaches every drawing');
}
assert(p.idle.authoredBlink);assert.equal(p.idle.sequence.find(([f])=>f===3)[1],110);
assert(a.duration(p.idle)>4000,'no excessive blinking');
assert.equal(a.duration(p.attack),1420);assert.equal(a.frame(p.attack,874),1);assert.equal(a.frame(p.attack,875),2);
assert.equal(p.attack.markers[0].at+360,1235,'sprite contact, damage and FX aligned');
assert.equal(p.attack.markers.length,1,'one damage presentation event');
assert(!p.guard.markers,'parry pose cannot trigger a counterattack');
assert.equal(a.frame(p.defeat,99999),5,'final defeat held');
const seen=new Set();for(let t=0;t<15000;t+=30)seen.add(a.victory(p.victory,t));assert.equal(seen.size,6);
for(const width of [390,640,1280]){
 const factor=s.factor('autumnwolf',s.sceneSize(960,width));
 assert(Math.abs(465*factor-220*.75*(width<=700?1.5:1))<1e-8);
 const input={id:'autumnwolf',age:1235,frame:2,pack:p.attack,factor,x:300,y:450};
 const effect=fx.sample(input);assert.equal(effect.kind,'claw');
 assert(Math.abs(effect.tip.x-(300+p.attack.reach*p.attack.scale*factor))<1e-8);
 assert.equal(fx.sample({...input,enabled:false}),null);
}
console.log('PASS autumnwolf: 52 drawings, 9 actions, blink, complete victory/defeat, guarded parry, responsive scale and single claw impact.');
