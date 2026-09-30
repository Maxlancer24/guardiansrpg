const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const p=require('./shadowweaver.js'),a=require('./animation.js'),s=require('./scale.js'),fx=require('./shadow-fx.js');
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
assert.equal(a.duration(p.attack),1770);
assert.equal(a.frame(p.attack,939),1);assert.equal(a.frame(p.attack,940),2);
assert.equal(p.attack.markers[0].at+360,fx.timing.release,'cast pose and release synchronized');
assert.equal(p.attack.presentation.impact,fx.timing.impact);
assert(!p.guard.markers,'defending is not a counterattack');
assert.equal(a.frame(p.defeat,99999),5);
const seen=new Set();for(let t=0;t<15000;t+=30)seen.add(a.victory(p.victory,t));assert.equal(seen.size,6);
for(const width of [390,640,1280]){
 const factor=s.factor('shadowweaver',s.sceneSize(960,width));
 assert(Math.abs(501*factor-224*.75*(width<=700?1.5:1))<1e-8);
 const input={age:1300,frame:2,pack:p.attack,factor,x:300,y:450,end:{x:720,y:300}};
 const release=fx.sample(input);assert.equal(release.u,0);assert.deepEqual(release.point,release.start);
 assert.deepEqual(release.start,release.palm);assert(release.projectile&&!release.contact);
 const impact=fx.sample({...input,age:1440,frame:3});assert.equal(impact.u,1);
 assert.deepEqual(impact.point,input.end);assert(impact.contact&&!impact.projectile);
 assert.equal(fx.sample({...input,age:1810}),null);
 for(let f=0;f<6;f++){const [x,y,w,h]=p.attack.frames[f],v=p.attack.castSockets.palm[f];assert(v[0]>=x&&v[0]<=x+w&&v[1]>=y&&v[1]<=y+h,'palm socket inside its frame');}
}
console.log('PASS shadowweaver: 52 drawings, 9 actions, blink, complete victory/defeat, defensive parry, responsive scale and synchronized palm projectile.');
for(const factor of [.33,.5,1])for(let frame=0;frame<6;frame++){
 const input={age:0,frame,pack:p.idle,factor,x:300,y:450};
 const orb=fx.idleSample(input),palm=fx.socket(p.idle,frame,factor,300,450);
 assert.equal(orb.center.x,palm.x);assert(orb.center.y+orb.radius<palm.y,'orb floats above hand');
 assert.equal(orb.radius,18*factor);
 assert.notEqual(fx.idleSample({...input,age:850}).radius,orb.radius,'slow breathing pulse');
 assert.deepEqual(fx.idleSample({...input,reduced:true}),fx.idleSample({...input,reduced:true,age:9500}));
 assert.equal(fx.idleSample({...input,enabled:false}),null);
}
console.log('PASS idle orb: all six palm sockets, proportional scale, pulse, effects toggle and reduced motion.');
for(const [mode,pack] of Object.entries(p)){
 if(mode==='idle')continue;
 assert.equal(pack.orbSockets.length,pack.frames.length,mode+' orb registration');
 for(let frame=0;frame<pack.frames.length;frame++){
  const input={mode,pack,frame,age:0,time:850,factor:.5,x:300,y:450};
  const g=fx.poseSample(input),r=pack.frames[frame],point=pack.orbSockets[frame],scale=pack.scale*.5*(pack.frameScale?.[frame]||1);
  assert(g&&Number.isFinite(g.radius));
  assert.deepEqual(g.center,{x:300+(point[0]-r[0]-r[4])*scale,y:450+(point[1]-r[1]-r[5])*scale});
  assert.equal(fx.poseSample({...input,enabled:false}),null);
  assert.deepEqual(fx.poseSample({...input,reduced:true}),fx.poseSample({...input,reduced:true,time:5000}));
 }
}
const cast=age=>fx.poseSample({mode:'attack',pack:p.attack,frame:a.frame(p.attack,age),age,time:0,factor:1,x:300,y:450});
for(const age of [0,350,939])assert(cast(age),'held through anticipation and charge');
for(const age of [940,1080,1309])assert.equal(cast(age),null,'released orb must not remain in hand');
assert.equal(cast(1310),null);assert(cast(1440).opacity>0&&cast(1440).opacity<1);
assert.equal(cast(1570).opacity,1);assert.equal(cast(1769).opacity,1);
for(let age=1311;age<1570;age+=10)assert((cast(age+1)?.radius||0)>=(cast(age)?.radius||0),'smooth reformation');
assert.equal(fx.poseSample({mode:'defeat',pack:p.defeat,frame:2,age:600,factor:1,x:0,y:0}),null);
console.log('PASS orb continuity: all poses registered, charge/release/reformation, reduced motion, effects off and defeat dissipation.');
