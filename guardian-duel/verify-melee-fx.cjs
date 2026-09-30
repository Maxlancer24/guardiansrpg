const assert=require('node:assert/strict');
const fx=require('./melee-fx.js'),scale=require('./scale.js');
function canvas(){
 const calls=[],stack=[];
 const ctx={globalCompositeOperation:'source-over',save(){stack.push(this.globalCompositeOperation)},restore(){assert(stack.length);this.globalCompositeOperation=stack.pop()}};
 for(const key of ['beginPath','closePath','fill','fillRect','moveTo','lineTo','quadraticCurveTo','bezierCurveTo','translate','rotate'])ctx[key]=(...args)=>{assert(args.every(Number.isFinite));calls.push([key,...args])};
 for(const key of ['createLinearGradient','createRadialGradient'])ctx[key]=(...args)=>{assert(args.every(Number.isFinite));return{addColorStop(n,color){assert(n>=0&&n<=1);assert(!color.includes('NaN'))}}};
 return{ctx,calls,stack};
}
assert.deepEqual(Object.keys(fx.profiles),['forestbastion','autumnwolf','kaori','lucien','lancer','duelist','sentinel','vanguard','pugilist','wanderer','guardian','custodian','jadewind','brisa']);
for(const id of Object.keys(fx.profiles))for(const cssWidth of [390,1240])for(const frame of [2,3]){
 const pack=require('./'+id+'.js').attack;
 const input={id,age:1240,frame,pack,factor:scale.factor(id,scale.sceneSize(960,cssWidth)),x:310,y:470};
 const before=JSON.stringify(input),g=fx.sample(input),r=pack.frames[frame],s=pack.scale*input.factor;
 const endpoint=fx.profiles[id].blade[frame][1];
 assert.equal(g.tip.x,input.x+(endpoint[0]-r[0]-r[4])*s);
 assert.equal(g.tip.y,input.y+(endpoint[1]-r[1]-r[5])*s);
 assert(g.radius>0&&g.width>0);
 assert.deepEqual(g,fx.sample(input),'deterministic weapon attachment');
 assert(fx.sample({...input,age:1400}).alpha<g.alpha,'trail fades');
 for(const override of [{age:1234-(pack.effectLeadIn||0)},{age:1475},{frame:0},{enabled:false},{id:'explorer'}]){
  const c=canvas();assert.equal(fx.sample({...input,...override}),null);
  assert.equal(fx.draw(c.ctx,{...input,...override}),false);assert.equal(c.calls.length,0);
 }
 const full=canvas(),reduced=canvas();
 assert(fx.draw(full.ctx,input));assert(fx.draw(reduced.ctx,{...input,reduced:true}));
 assert(reduced.calls.length<full.calls.length,'reduced motion removes arcs and flecks');
 for(const c of [full,reduced]){assert.equal(c.stack.length,0);assert.equal(c.ctx.globalCompositeOperation,'source-over');}
 assert.equal(JSON.stringify(input),before,'presentation must not mutate actor data');
}
console.log('PASS: fourteen melee effects including shield bash and autumn wolf claws, both attack poses, mobile/desktop registration, impact window, fade, reduced motion, effects toggle and canvas isolation.');
