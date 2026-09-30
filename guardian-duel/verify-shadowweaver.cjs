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
