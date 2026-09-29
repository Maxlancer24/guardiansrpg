const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const p=require('./kaori.js'),a=require('./animation.js'),s=require('./scale.js'),fx=require('./melee-fx.js');
assert.equal(Object.keys(p).length,9);
assert(p.attack.src.endsWith('/attack-v2.png'),'use reviewed right-cross atlas');
assert.equal(Object.values(p).reduce((n,v)=>n+v.frames.length,0),52);
assert(p.idle.authoredBlink);
assert.equal(s.profiles.kaori.targetHeight,225,'Kaori matches the roster, not the enlarged attack silhouette');
assert.equal(p.attack.scale,1.12,'do not scale bent-knee attack up to standing height');
assert.equal(p.guard.scale,.98);assert.equal(p.motion.scale,.97);
assert.deepEqual(p.attack.frameScale,[1,1,1,1,.96,.96]);
for(const [key,pack]of Object.entries(p)){
 const b=fs.readFileSync(path.join(__dirname,'..',pack.src));assert.equal(b[25],6,'RGBA');
 for(const [x,y,w,h]of pack.frames)assert(x>=0&&y>=0&&x+w<=b.readUInt32BE(16)&&y+h<=b.readUInt32BE(20));
 const seen=new Set();for(let ms=0;ms<a.duration(pack);ms+=5)seen.add(a.frame(pack,ms,false));
 assert.equal(seen.size,pack.frames.length,key+' all frames reached');
}
assert.equal(a.duration(p.attack),1420);
assert.equal(a.frame(p.attack,874),1);assert.equal(a.frame(p.attack,875),2);
assert.equal(p.attack.markers[0].at+360,1235,'contact, damage, trail and audio share one impact');
assert.equal(a.duration(p.hurt),650);assert.equal(a.duration(p.activation),1420);
assert.equal(a.frame(p.defeat,99999),5);
assert(!p.guard.markers,'guard does not embed an extra counterattack');
let t=0;for(const [f,ms]of p.victory.sequence){assert.equal(a.victory(p.victory,t+1),f);t+=ms;}
for(const width of [390,700,1240]){
 const size=s.sceneSize(960,width),factor=s.factor('kaori',size);
 const input={id:'kaori',age:1235,frame:2,pack:p.attack,factor,x:300,y:450};
 const effect=fx.sample(input);assert(effect&&effect.kind==='punch');
 assert(Math.abs(effect.tip.x-(300+p.attack.reach*p.attack.scale*factor))<1e-8);
 assert.equal(fx.sample({...input,enabled:false}),null);
 assert(Math.abs(464*factor-225*.75*(width<=700?1.5:1))<1e-8);
}
console.log('PASS Kaori: 52 drawings, animated blink idle, right cross, single impact, guard, full victory/defeat and proportional responsive scale.');
