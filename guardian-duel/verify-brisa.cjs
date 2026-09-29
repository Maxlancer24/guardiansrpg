const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const p=require('./brisa.js'),a=require('./animation.js'),s=require('./scale.js'),fx=require('./melee-fx.js');
assert.equal(Object.keys(p).length,9);
assert.equal(Object.values(p).reduce((n,v)=>n+v.frames.length,0),52);
for(const [key,pack]of Object.entries(p)){
 const b=fs.readFileSync(path.join(__dirname,'..',pack.src));assert.equal(b[25],6,'RGBA');
 for(const [x,y,w,h]of pack.frames)assert(x>=0&&y>=0&&x+w<=b.readUInt32BE(16)&&y+h<=b.readUInt32BE(20));
 const seen=new Set();for(let ms=0;ms<a.duration(pack);ms+=5)seen.add(a.frame(pack,ms,false));
 assert.equal(seen.size,pack.frames.length,key+' all frames reached');
}
assert(p.idle.authoredBlink&&p.idle.loop);
assert.equal(p.idle.sequence.filter(([f])=>f===5).length,1);
assert.equal(a.duration(p.attack),1420);
assert.equal(a.frame(p.attack,874),2);assert.equal(a.frame(p.attack,875),3);
assert.equal(p.attack.markers[0].at+360,1235);
assert.equal(a.duration(p.hurt),650);assert.equal(a.duration(p.activation),1420);
assert.equal(a.frame(p.defeat,99999),5);
assert(p.victory.src.endsWith('victory-v2-clean.png'));
let t=0;for(const [f,ms]of p.victory.sequence){assert.equal(a.victory(p.victory,t+1),f);t+=ms;}
for(const width of [390,700,1240]){
 const size=s.sceneSize(960,width),factor=s.factor('brisa',size);
 const input={id:'brisa',age:1235,frame:3,pack:p.attack,factor,x:300,y:450};
 const effect=fx.sample(input);assert(effect&&effect.kind==='sweep');
 assert(Math.abs(effect.tip.x-(300+(1244-627-307)*p.attack.scale*factor))<1e-8);
 assert.equal(fx.sample({...input,enabled:false}),null);
 const height=492*p.idle.scale*factor;
 assert(Math.abs(height-228*.75*(width<=700?1.5:1))<1e-8);
}
console.log('PASS Brisa: 52 drawings, approved victory, authored idle blink, shared impact/FX timing, full recovery and proportional responsive scale.');
