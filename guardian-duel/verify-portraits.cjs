const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const animation=require('./animation.js'),scale=require('./scale.js');
const game=fs.readFileSync(__dirname+'/game.js','utf8');
const start=game.indexOf('// Reuse the battle'),end=game.indexOf('// Same soft aura',start);
assert(start>=0&&end>start);
function setup(reduced=false,observer=true){
 const ids=Object.keys(scale.profiles),draws=[],clears=[],elements={selection:{hidden:false}},images={},avatars={};
 let callback;const observed=[];
 for(const id of ids){
  avatars[id]={actions:require('./'+id+'.js')};images[id+':idle']={};
  elements[id==='lancer'?'portrait':id+'-portrait']={id,getContext(){return new Proxy({
   setTransform(){},clearRect(...a){clears.push(a)},createRadialGradient(){return{addColorStop(){}}}
  },{get:(t,k)=>k in t?t[k]:()=>{}})}};
 }
 const context={AVATARS:avatars,$:id=>elements[id],images,reduced,document:{hidden:false},
  devicePixelRatio:2,GuardianScale:scale,GuardianShadowFX:require('./shadow-fx.js'),sequence:animation.frame,
  sprite(ctx,mode,f,x,y,factor,id){assert(avatars[id].actions.idle.frames[f]);draws.push({id,f,x,y,factor})}
 };
 if(observer)context.IntersectionObserver=class{constructor(cb){callback=cb}observe(el){observed.push(el)}};
 vm.createContext(context);vm.runInContext(game.slice(start,end)+';globalThis.review={step:renderPortraits,portraits};',context);
 return{context,draws,clears,elements,ids,observed,visible(id,value){callback([{target:elements[id==='lancer'?'portrait':id+'-portrait'],isIntersecting:value}])}};
}
const a=setup();
assert.equal(a.observed.length,a.ids.length);
a.context.review.step(80);assert.equal(a.draws.length,0,'no offscreen painting');
a.visible('pugilist',true);assert.equal(a.draws.length,1);
assert.equal(a.elements['pugilist-portrait'].width,680);
a.context.review.step(0);assert.equal(a.draws.length,1,'unchanged frame is not repainted');
for(let i=0;i<90;i++)a.context.review.step(80);
assert(new Set(a.draws.map(d=>d.f)).size>=4,'real idle sequence advances');
assert(a.draws.length<50,'not repainting at display refresh rate');
assert.equal(a.draws.length,a.clears.length,'clear old pose before every paint');
assert(a.draws.every(d=>d.x===175&&d.y===320),'portrait scale and position unchanged');
let count=a.draws.length;
a.visible('pugilist',false);for(let i=0;i<20;i++)a.context.review.step(80);
assert.equal(a.draws.length,count,'offscreen pauses');
a.visible('pugilist',true);a.elements.selection.hidden=true;
for(let i=0;i<20;i++)a.context.review.step(80);
assert.equal(a.draws.length,count,'battle pauses the selector');
a.elements.selection.hidden=false;a.context.document.hidden=true;
for(let i=0;i<20;i++)a.context.review.step(80);
assert.equal(a.draws.length,count,'background document pauses');
a.context.document.hidden=false;
for(let i=0;i<20;i++)a.context.review.step(80);
assert(a.draws.length>count,'return resumes animation');
count=a.draws.length;a.context.devicePixelRatio=3;a.context.review.step(0);
assert.equal(a.elements['pugilist-portrait'].width,1020);
assert.equal(a.draws.length,count+1,'DPR changes repaint the same frame');
const b=setup(true,false);for(let i=0;i<100;i++)b.context.review.step(80);
assert.equal(b.draws.length,b.ids.length);assert(b.draws.every(d=>d.f===0),'reduced motion stays static');
const c=setup(false,false);for(let i=0;i<30;i++)c.context.review.step(80);
assert.equal(new Set(c.draws.map(d=>d.id)).size,c.ids.length,'fallback works without IntersectionObserver');
const d=setup(false,false),ages=d.context.review.portraits.map(p=>p.age);
d.context.review.step(80);
d.context.review.portraits.forEach((p,i)=>assert.equal(p.age-ages[i],80,'every selector idle uses real-time 1x'));
const orb=setup();orb.visible('shadowweaver',true);
const startOrb=orb.draws.length;orb.context.review.step(60);
assert.equal(orb.draws.length,startOrb+1,'orb animates between sprite frame changes');
orb.visible('shadowweaver',false);const stopped=orb.draws.length;orb.context.review.step(500);
assert.equal(orb.draws.length,stopped,'offscreen orb stops painting');
console.log('PASS: all idle portraits, anchors, frame deduplication/clearing, visibility pause/resume, DPR and reduced motion.');
