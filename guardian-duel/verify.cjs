/* Non-browser regression harness: real client script, fake DOM/canvas, real asset paths. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),R=require('./rules.js'),pack={...Object.fromEntries(Object.entries(require('./lancer.js')).map(([k,v])=>['lancer:'+k,v])),...Object.fromEntries(Object.entries(require('./explorer.js')).map(([k,v])=>['explorer:'+k,v])),...Object.fromEntries(Object.entries(require('./duelist.js')).map(([k,v])=>['duelist:'+k,v])),...Object.fromEntries(Object.entries(require('./sentinel.js')).map(([k,v])=>['sentinel:'+k,v])),...Object.fromEntries(Object.entries(require('./vanguard.js')).map(([k,v])=>['vanguard:'+k,v]))};
Object.assign(pack,Object.fromEntries(Object.entries(require('./arcanist.js')).map(([k,v])=>['arcanist:'+k,v])));
Object.assign(pack,Object.fromEntries(Object.entries(require('./pugilist.js')).map(([k,v])=>['pugilist:'+k,v])));
const dimensions=file=>{const b=fs.readFileSync(file);assert.equal(b.toString('ascii',1,4),'PNG');return [b.readUInt32BE(16),b.readUInt32BE(20)]};
for(const p of Object.values(pack)){const [w,h]=dimensions(path.join(root,p.src));for(const [x,y,cw,ch] of p.frames)assert(x>=0&&y>=0&&x+cw<=w&&y+ch<=h);for(const [f,ms] of p.sequence)assert(p.frames[f]&&ms>0)}
assert.throws(()=>new R.Battle().resolve('SPECIAL'),/unsupported/);
const scale=require('./scale.js');
const duelist=require('./duelist.js');
assert.equal(Object.keys(duelist).length,9);
assert.equal(duelist.attack.frames.length,6,'corrected right-handed anticipation, thrust and recovery');
assert(duelist.attack.src.endsWith('attack-right-v2.png'));
assert.equal(duelist.attack.sequence.slice(0,2).reduce((n,f)=>n+f[1],0),875,'thrust and damage timing');
assert.equal(duelist.attack.markers[0].frame,2);
assert.equal(duelist.attack.sequence.reduce((n,f)=>n+f[1],0),1420,'return begins after the thrust recovery');
const animation=require('./animation.js');
const sentinel=require('./sentinel.js');
const vanguard=require('./vanguard.js');
assert.equal(Object.keys(vanguard).length,9);
assert.equal(vanguard.attack.sequence.slice(0,2).reduce((n,f)=>n+f[1],0),875,'Vanguard slash matches the shared damage event');
assert.equal(vanguard.attack.sequence.reduce((n,f)=>n+f[1],0),1420,'Vanguard finishes recovery before returning');
for(const [i,leftBoot] of [136,132,135,135,133,135].entries()){
 assert(Math.abs(leftBoot-vanguard.idle.frames[i][4]+130)<=1,'Vanguard idle keeps planted feet registered');
}
assert.deepEqual(vanguard.victory.sequence.map(f=>f[0]),[0,1,2,3,4,3,2,1,0,5],'Vanguard lowers through both intermediate poses');
assert(sentinel.idle.src.endsWith('/idle-v2.png'),'Sentinel uses the corrected neutral-head blink');
for(const [i,leftBoot] of [184,144,111,184,144,112].entries()){
 assert(Math.abs(leftBoot-sentinel.idle.frames[i][4]+121)<=1,'Sentinel idle boots stay registered');
}
for(const [a,b,edgeA,edgeB] of [[1,2,140,140],[4,5,139,107]]){
 assert.equal(edgeA-sentinel.victory.frames[a][4],edgeB-sentinel.victory.frames[b][4],
  'Sentinel victory blink retains the same planted boot position');
}
for(const [key,p] of Object.entries(pack).filter(([k])=>k.endsWith(':victory'))){
 const entry=animation.duration(p),cycle=entry+animation.duration(p.settled);
 assert(entry/1.5>=1.9,key+' readable full entry');
 for(const offset of [0,cycle,cycle*2]){
  let start=0;
  for(const [index,ms] of p.sequence){
   assert.equal(animation.victory(p,offset+start+1),index,key+' frame start');
   assert.equal(animation.victory(p,offset+start+ms-1),index,key+' full frame duration');
   start+=ms;
  }
 }
 assert.equal(animation.victory(p,entry),p.settled.sequence[0][0]);
 const visited=new Set();for(let ms=0;ms<cycle;ms+=75)visited.add(animation.victory(p,ms));
 assert.deepEqual([...visited].sort(),[0,1,2,3,4,5],key+' all six at 1.5x');
 // No fixed 1940ms cutoff: a future longer gesture also finishes fully.
 const longer={...p,sequence:p.sequence.map(([i,ms])=>[i,ms*2])};
 assert.equal(animation.victory(longer,animation.duration(longer)-1),p.sequence.at(-1)[0]);
}
for(const [f,ms] of duelist.victory.settled.sequence){assert(duelist.victory.frames[f]);if(f===5)assert(ms<=120,'settled victory blink is brief');}
for(const cssWidth of [390,640,701,1240]){
 const sceneSize=scale.sceneSize(960,cssWidth),zoom=cssWidth<=700?1.5:1;
 for(const [id,p] of Object.entries(scale.profiles)){
  const body=p.sourceBodyHeight*p.idleScale*scale.factor(id,sceneSize);
  assert(Math.abs(body-p.targetHeight*960/1280*zoom)<1e-9);
  assert(p.targetHeight>=214&&p.targetHeight<=245);
 }
 assert(scale.profiles.explorer.targetHeight<scale.profiles.lancer.targetHeight);
 const reach=duelist.attack.reach*duelist.attack.scale*scale.factor('duelist',sceneSize);
 const advance=960*.75-sceneSize*.10-960*.28-reach;
 assert(advance>0);
 assert(Math.abs(960*.28+advance+reach-(960*.75-sceneSize*.10))<1e-9,'rapier reaches target at each zoom');
}
for(let seed=1;seed<60;seed++){let n=seed;const rng=()=>((n=(n*1664525+1013904223)>>>0)/4294967296);const b=new R.Battle(rng);for(let t=0;t<100;t++){const before=b.snapshot(),r=b.resolve(['ATTACK','DEFEND','REST'][t%3]);for(const a of r.state.actors)assert(a.hp>=0&&a.hp<=a.max);assert.deepEqual(before.actors.map(a=>a.max),r.state.actors.map(a=>a.max));if(r.finished)break;if(t===99)throw Error('battle failed to terminate');}}
let drawCalls=0;const victoryDraws=[],victoryCovered=new Set();
const paint={addColorStop(){}};
const ctx=new Proxy({drawImage(im,...args){assert(im&&im.width>0);assert(args.every(Number.isFinite));if(args.length===8){const [x,y,w,h]=args;assert(x>=0&&y>=0&&x+w<=im.width&&y+h<=im.height)}if(im.assetPath&&/\/victory(?:-v2)?\.png$/.test(im.assetPath)){
 const found=Object.entries(pack).find(([k,p])=>k.endsWith(':victory')&&p.src===im.assetPath);
 if(found){const [key,p]=found;victoryDraws.push({key,frame:p.frames.findIndex(r=>r.slice(0,4).every((v,i)=>v===args[i]))});}
}drawCalls++;},createRadialGradient(){return paint},createLinearGradient(){return paint}}, {get:(t,k)=>k in t?t[k]:()=>{}});
class El{constructor(id){this.id=id;this.style={};this.dataset={};this.hidden=['battle','outcome','replay'].includes(id);this.disabled=false;this.children=[];this.clientWidth=390;this.clientHeight=690;this.checked=false;this.textContent='';}getContext(){return ctx}setAttribute(){}append(el){this.children.push(el)}replaceChildren(){this.children=[]}focus(){}scrollIntoView(){}get firstElementChild(){return {remove:()=>this.children.shift()}}}
const ids=[...fs.readFileSync(path.join(__dirname,'index.html'),'utf8').matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
const els=Object.fromEntries(ids.map(id=>[id,new El(id)]));els.effects.checked=true;const actions=['ATTACK','DEFEND','REST'].map(a=>{const e=new El(a);e.dataset.action=a;return e});
let raf,time=0;const context={console,devicePixelRatio:2,GuardianRules:R,Math,URL,URLSearchParams,location:{search:'',href:'http://localhost/guardian-duel/'},history:{replaceState(){}},matchMedia:()=>({matches:false}),document:{hidden:false,documentElement:{lang:'es'},getElementById:id=>{assert(els[id],id);return els[id]},querySelectorAll:s=>s==='[data-action]'?actions:[],querySelector:()=>new El(),createTextNode:s=>({textContent:s}),createElement:()=>new El(),addEventListener(){}},Image:class{set src(v){this.assetPath=v;const [w,h]=dimensions(path.join(root,v));this.width=w;this.height=h;queueMicrotask(()=>this.onload())}},Audio:class{addEventListener(){}play(){return Promise.resolve()}pause(){}},requestAnimationFrame:fn=>{raf=fn}};
const rangedCoverage=new Set();
context.__checkRanged=(v)=>{assert.equal(v.x,v.origin.x,'ranged x stays planted');assert.equal(v.y,v.origin.y,'ranged y stays planted');assert.notEqual(v.mode,'motion','no ranged dash/hop sprites');rangedCoverage.add(v.appearance+':'+(v.age<360?'prepare':v.age>=1940?'recover':'attack'))};
context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'battle-practice/music.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(__dirname,'lancer.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(__dirname,'explorer.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(__dirname,'duelist.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(__dirname,'sentinel.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(__dirname,'vanguard.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(__dirname,'arcanist.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(__dirname,'pugilist.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(__dirname,'arcane-fx.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(__dirname,'scale.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(__dirname,'animation.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(__dirname,'melee-fx.js'),'utf8'),context);const instrumented=fs.readFileSync(path.join(__dirname,'game.js'),'utf8').replace('function drawActor(id,x,y,size){','function drawActor(id,x,y,size){const origin={x,y};').replace('return{x,y,frame:f,mode};',"if(id===0&&state.name==='attack'&&isRanged())__checkRanged({x,y,origin,mode,age,appearance});return{x,y,frame:f,mode};");vm.runInContext(instrumented,context);
const tick=()=>{time+=50;raf(time)};
(async()=>{await new Promise(r=>setImmediate(r));await els.lancer.onclick();assert.equal(els.battle.hidden,false);for(let trial=0;trial<56;trial++){if(trial===8){els.change.onclick();await els.explorer.onclick();assert.equal(els['hero-name'].textContent,'Exploradora');}if(trial===16){els.change.onclick();await els.duelist.onclick();assert.equal(els['hero-name'].textContent,'Duelista');}if(trial===24){els.change.onclick();await els.sentinel.onclick();assert.equal(els['hero-name'].textContent,'Centinela');}if(trial===32){els.change.onclick();await els.vanguard.onclick();assert.equal(els['hero-name'].textContent,'Vanguardia');}if(trial===40){els.change.onclick();await els.arcanist.onclick();assert.equal(els['hero-name'].textContent,'Arcanista');}if(trial===48){els.change.onclick();await els.pugilist.onclick();assert.equal(els['hero-name'].textContent,'Pugilista');}let rounds=0;while(els.replay.hidden&&rounds++<70){actions[trial%2===0?rounds%3:0].onclick();assert.equal(els.confirm.disabled,false);els.confirm.onclick();assert.equal(actions[0].disabled,true);for(let i=0;actions[0].disabled&&els.replay.hidden&&i<500;i++)tick();assert(!actions[0].disabled||!els.replay.hidden);}assert(!els.replay.hidden,'expected completed battle');assert.equal(els.outcome.hidden,false);if(els.outcome.textContent==='VICTORIA'){
 victoryDraws.length=0;for(let n=0;n<180;n++)tick();
 const id=trial<8?'lancer':trial<16?'explorer':trial<24?'duelist':trial<32?'sentinel':trial<40?'vanguard':trial<48?'arcanist':'pugilist',key=id+':victory';
 const frames=victoryDraws.filter(v=>v.key===key).map(v=>v.frame);
 assert.deepEqual([...new Set(frames)].sort(),[0,1,2,3,4,5],key+' actual game renderer shows every pose');
 const transitions=frames.filter((v,i)=>i===0||v!==frames[i-1]);
 assert(transitions.filter(v=>v===0).length>=2,key+' repeats complete celebration');
 victoryCovered.add(id);
}els.replay.onclick();assert.equal(els.outcome.hidden,true);assert.equal(els['hero-hp'].value,260);}assert.equal(victoryCovered.size,7,'victory render coverage for every avatar');els.pause.onclick();assert.equal(els.status.textContent,'En pausa');els.pause.onclick();els.language.onclick();assert.equal(context.document.documentElement.lang,'en');els.change.onclick();assert.equal(els.selection.hidden,false);assert.equal(els.battle.hidden,true);assert(drawCalls>100);assert.equal(els.arena.width,780,'mobile backing uses CSS width times DPR');assert.equal(ctx.imageSmoothingEnabled,true);assert.equal(ctx.imageSmoothingQuality,'high');els.arena.clientWidth=1240;els.arena.clientHeight=775;await els.lancer.onclick();tick();assert.equal(els.arena.width,2480,'desktop retina backing');context.devicePixelRatio=3;els.arena.clientWidth=390;els.arena.clientHeight=690;tick();assert.equal(els.arena.width,1170,'3x mobile backing');assert(els.arena.width*els.arena.height<=4000000);assert.equal(rangedCoverage.size,6,'both ranged actors cover preparation, attack and recovery without displacement');console.log('PASS: 63 atlases, 59 seeded battles, 56 animated client battles across all seven appearances, full victory poses and repeated cycles for all avatars, replay, selection, pause, language, mobile canvas and crop bounds. Draw calls:',drawCalls)})().catch(e=>{console.error(e);process.exitCode=1});
