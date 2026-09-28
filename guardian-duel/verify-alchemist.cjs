const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const p=require('./alchemist.js'),a=require('./animation.js'),fx=require('./alchemy-fx.js'),scale=require('./scale.js');
assert.equal(Object.keys(p).length,9);assert.equal(Object.values(p).reduce((n,v)=>n+v.frames.length,0),54);
for(const pack of Object.values(p)){
 const b=fs.readFileSync(path.join(__dirname,'..',pack.src));assert.equal(b[25],6,'RGBA');
 for(const [x,y,w,h]of pack.frames)assert(x>=0&&y>=0&&x+w<=b.readUInt32BE(16)&&y+h<=b.readUInt32BE(20));
 assert.deepEqual([...new Set(pack.sequence.map(s=>s[0]))].sort(),pack===p.idle?[0,1,2,3,4]:[0,1,2,3,4,5]);
}
assert.equal(p.idle.loop,true);assert.equal(a.duration(p.hurt),650);
assert.equal(a.frame(p.attack,fx.release-360-1),1);assert.equal(a.frame(p.attack,fx.release-360),2);
assert.equal(a.frame(p.defeat,100000),5);assert(a.duration(p.victory)>=2850);
let ms=0;for(const [i,d]of p.victory.sequence){assert.equal(a.victory(p.victory,ms+1),i);ms+=d;}
for(const size of [172.5,230,258.75]){
 const o={age:fx.release,pack:p.attack,factor:scale.factor('alchemist',size),x:200,y:450,end:{x:700,y:270},size};
 const s=fx.sample(o);assert.deepEqual({x:s.x,y:s.y},s.start);
 assert.equal(fx.sample({...o,age:fx.release-1}),null);assert.equal(fx.sample({...o,age:fx.impact}),null);
 const last=fx.sample({...o,age:fx.impact-.001});assert(Math.abs(last.x-o.end.x)<.01&&Math.abs(last.y-o.end.y)<.01);
 const gradient={addColorStop(){}};let balance=0,draws=0;
 const ctx=new Proxy({save(){balance++},restore(){balance--},createRadialGradient(){return gradient},fill(){draws++}},{get:(t,k)=>k in t?t[k]:()=>{}});
 for(const enabled of [true,false])for(const reduced of [true,false])for(const age of [1180,1300,1500,1580,1750,2200]){fx.draw(ctx,{...o,age,enabled,reduced});assert.equal(balance,0);}
 assert(draws>0);assert.equal(fx.draw(ctx,{...o,age:1600,enabled:false}),false);
}
console.log('PASS Alchemist: nine clips / 54 poses, timing, victory/defeat, release socket, parabolic projectile, toggles and mobile/desktop scale.');
