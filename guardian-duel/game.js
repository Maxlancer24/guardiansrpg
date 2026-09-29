/* Guardian-only presentation. Rules resolve once; sprites never calculate damage. */
(()=>{'use strict';
const $=id=>document.getElementById(id),canvas=$('arena'),ctx=canvas.getContext('2d'),images={},base='/assets/demo-battle/';
let appearance='lancer',attackSerial=0;
const attackKey=()=>GuardianAnimation.attackKey(AVATARS[appearance].actions,modes[0].variant||0);
const AVATARS={brisa:{actions:BRISA_ACTIONS,es:'Brisa',en:'Brisa'},alchemist:{actions:ALCHEMIST_ACTIONS,es:'Alquimista',en:'Alchemist'},lancer:{actions:LANCER_ACTIONS,es:'Lancero',en:'Lancer'},explorer:{actions:EXPLORER_ACTIONS,es:'Exploradora',en:'Explorer'},duelist:{actions:DUELIST_ACTIONS,es:'Duelista',en:'Duelist'},sentinel:{actions:SENTINEL_ACTIONS,es:'Centinela',en:'Sentinel'},vanguard:{actions:VANGUARD_ACTIONS,es:'Vanguardia',en:'Vanguard'},arcanist:{actions:ARCANIST_ACTIONS,es:'Arcanista',en:'Arcanist'},pugilist:{actions:PUGILIST_ACTIONS,es:'Pugilista',en:'Pugilist'},tracker:{actions:TRACKER_ACTIONS,es:'Rastreadora',en:'Tracker'},custodian:{actions:CUSTODIAN_ACTIONS,es:'Custodio',en:'Custodian'},wanderer:{actions:WANDERER_ACTIONS,es:'Errante',en:'Wanderer'},guardian:{actions:GUARDIAN_ACTIONS,es:'Guardián',en:'Guardian'}};
const paletteCache=GuardianPaletteEngine.createCache(GuardianPalettes),selectedVariants={},paletteControls=[];
let paletteBusy=false;
const variant=id=>selectedVariants[id]||'original';
const isRanged=()=>appearance==='explorer'||appearance==='arcanist'||appearance==='tracker'||appearance==='alchemist';
let en=new URLSearchParams(location.search).get('lang')==='en',battle,display,intent,choice=null,active=false,busy=false,paused=false,clock=0,last=0,current=null,queue=[],result=null,labels=[],sparks=[],deaths={},readyAssets=false,loadPromise=null;
const modes=[{name:'idle',at:0},{name:'idle',at:0}],voices=new Set(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const music=new PracticeMusic(!en);
const tr=(es,english)=>en?english:es,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},copy=x=>JSON.parse(JSON.stringify(x));
const source={arena:base+'black-lotus-arena.png',whurt:base+'warden-feedback-v1/hurt.png',wkneel:base+'warden-feedback-v1/kneel.png',wfallen:base+'warden-feedback-v1/fallen.png'};
for(const [id,avatar] of Object.entries(AVATARS))for(const [key,pack] of Object.entries(avatar.actions))source[id+':'+key]=pack.src;
for(let i=0;i<4;i++)source['wi'+i]=base+'ambient-loops-v1/warden-'+i+'.png';
for(let i=0;i<8;i++)source['wa'+i]=base+'combat-reactions-v1/warden-'+i+'.png';
const pendingLoads={};
function load(key){if(images[key])return Promise.resolve();if(pendingLoads[key])return pendingLoads[key];return pendingLoads[key]=new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[key]=im;delete pendingLoads[key];resolve()};im.onerror=()=>{delete pendingLoads[key];reject(Error(key))};im.src=source[key]})}
function localize(){document.documentElement.lang=en?'en':'es';document.querySelectorAll('[data-es]').forEach(el=>el.textContent=el.dataset[en?'en':'es']);$('language').textContent=en?'Español':'English';document.title=tr('Guardián vs. Hollow','Guardian vs. Hollow')+' · Guardians';$('arena').setAttribute('aria-label',tr('Escenario del combate. Resultados disponibles en el registro.','Battle scene. Results available in the battle log.'));localizePalettes();if(display)ui()}
function name(id){return id===0?AVATARS[appearance][en?'en':'es']+(variant(appearance)==='original'?'':' · '+GuardianPalettes[appearance].variants[variant(appearance)][en?'en':'es']):'Hollow'}

function localizePalettes(){
 for(const control of paletteControls){
  control.label.textContent=tr('Paleta','Palette');
  for(const option of control.select.options)option.textContent=option.value==='original'?'Original':GuardianPalettes[control.id].variants[option.value][en?'en':'es'];
  control.hint.textContent=tr('Solo cambia los colores. Mismas animaciones y stats.','Colors only. Same animations and stats.');
 }
}
async function preparePalette(id){
 for(const [action,pack]of Object.entries(AVATARS[id].actions))await paletteCache.prepare(id,variant(id),action,images[id+':'+action],pack);
}
function mountPalettes(){
 for(const [id,profile]of Object.entries(GuardianPalettes)){
  const button=$(id);if(!button?.parentElement)continue;
  const wrapper=document.createElement('article');wrapper.className='avatar-choice';
  button.parentElement.insertBefore(wrapper,button);wrapper.append(button);
  const field=document.createElement('label'),label=document.createElement('span'),select=document.createElement('select'),hint=document.createElement('small');
  field.className='palette-field';select.id=id+'-palette';hint.id=id+'-palette-hint';select.setAttribute('aria-describedby',hint.id);
  for(const value of ['original',...Object.keys(profile.variants)]){const option=document.createElement('option');option.value=value;select.append(option)}
  field.append(label,select);wrapper.append(field,hint);paletteControls.push({id,label,select,hint});
  select.onchange=async()=>{
   if(loadPromise||paletteBusy){select.value=variant(id);return}
   const wanted=select.value;paletteBusy=true;
   for(const key of Object.keys(AVATARS))$(key).disabled=true;
   for(const c of paletteControls)c.select.disabled=true;
   $('load-status').textContent=tr('Preparando paleta…','Preparing palette…');
   try{
    await load(id+':idle');
    await paletteCache.prepare(id,wanted,'idle',images[id+':idle'],AVATARS[id].actions.idle);
    selectedVariants[id]=wanted;
    const portrait=portraits.find(p=>p.id===id);if(portrait)portrait.frame=-1;
    renderPortraits(0);$('load-status').textContent='';
   }catch(error){
    select.value=variant(id);$('load-status').textContent=tr('No se pudo preparar la paleta. Conservamos tu selección anterior; puedes reintentar.','Could not prepare the palette. Your previous selection is unchanged; you can retry.');
   }finally{
    paletteBusy=false;for(const key of Object.keys(AVATARS))$(key).disabled=false;
    for(const c of paletteControls)c.select.disabled=false;
   }
  };
 }
 localizePalettes();
}

function actionName(a){return {ATTACK:tr('Atacar','Attack'),DEFEND:'Parry',REST:tr('Descansar','Rest')}[a]}
function sound(key,volume=.2){if(!$('sound').checked)return;const a=new Audio(base+'audio-v1/'+key+'.wav');a.volume=volume;voices.add(a);a.onended=()=>voices.delete(a);a.play().catch(()=>voices.delete(a))}
function stopSounds(){for(const a of voices)a.pause();voices.clear()}
$('sound').onchange=()=>{if(!$('sound').checked)stopSounds()};
function setMode(id,name,counter=false){modes[id]={name,at:clock};if(id===0&&name==='attack')modes[id].variant=(counter?Math.max(0,attackSerial-1):attackSerial++)%2;}
function log(text){const li=document.createElement('li');li.textContent=text;$('log').append(li);while($('log').children.length>100)$('log').firstElementChild.remove()}
function ui(){if(!display)return;for(let id=0;id<2;id++){const a=display.actors[id],p=id?'enemy':'hero';$(p+'-hp').max=a.max;$(p+'-hp').value=a.hp;$(p+'-health').textContent=a.hp+' / '+a.max+' HP';}const done=result?.finished&&!busy;$('change').disabled=busy;$('hero-name').textContent=name(0);$('round').textContent=tr('Ronda ','Round ')+display.round;$('intent').textContent=done?tr('Combate finalizado','Battle finished'):busy?tr('Resolviendo el turno…','Resolving turn…'):tr('Hollow prepara: ','Hollow prepares: ')+actionName(intent);document.querySelectorAll('[data-action]').forEach(b=>{b.disabled=busy||done;b.setAttribute('aria-pressed',String(b.dataset.action===choice))});$('confirm').disabled=busy||done||!choice;$('confirm').hidden=!!done;$('replay').hidden=!done;$('status').textContent=paused?tr('En pausa','Paused'):busy?tr('Observa el resultado de tu decisión.','Watch your decision play out.'):done?'':tr('Elige una acción y confirma.','Choose an action and confirm.');$('action-help').textContent=choice?({ATTACK:tr('Un ataque. El daño y la iniciativa dependen de tus stats.','One attack. Damage and initiative depend on your stats.'),DEFEND:tr('Bloquea y contraataca si resistes; un golpe fuerte rompe la guardia.','Block and counter if defense holds; a strong hit breaks guard.'),REST:tr('Recupera vida y Focus. Si te atacan, se interrumpe y recibes más daño.','Recover HP and Focus. Incoming attacks interrupt rest and deal extra damage.')})[choice]:tr('La presentación no cambia las reglas.','Presentation does not change the rules.');$('pause').textContent=paused?tr('Continuar','Resume'):tr('Pausar','Pause')}
async function start(id='lancer'){if(loadPromise||paletteBusy||!AVATARS[id])return;try{for(const key of Object.keys(AVATARS))$(key).disabled=true;$('load-status').textContent=tr('Cargando animaciones…','Loading animations…');loadPromise=Promise.all(Object.keys(source).filter(k=>(!k.includes(':')||k.startsWith(id+':'))&&!images[k]).map(load));await loadPromise;await preparePalette(id);appearance=id;readyAssets=true;active=true;$('selection').hidden=true;$('battle').hidden=false;reset();$('stage').scrollIntoView({block:'start'});$('stage').focus({preventScroll:true});$('load-status').textContent='';}catch(error){$('load-status').textContent=tr('No se pudo cargar una animación. Selecciona de nuevo para reintentar.','An animation could not load. Select again to retry.');}finally{loadPromise=null;for(const key of Object.keys(AVATARS))$(key).disabled=false}}
function reset(){attackSerial=0;stopSounds();battle=new GuardianRules.Battle();display=battle.snapshot();intent=battle.chooseEnemy();choice=null;busy=false;paused=false;current=null;queue=[];result=null;labels=[];sparks=[];deaths={};setMode(0,'idle');setMode(1,'idle');$('outcome').hidden=true;$('log').replaceChildren();ui()}
function add(duration,begin,impact,at=Infinity,end=()=>{}){queue.push({duration,begin,impact,at,end,hit:false})}
function floating(id,value,color='#ffdea0'){labels.push({id,value,color,at:clock,lane:labels.filter(l=>l.id===id&&clock-l.at<1200).length})}
function hurt(id,amount){const a=display.actors[id];a.hp=Math.max(0,a.hp-amount);if(a.hp===0){deaths[id]=clock;setMode(id,'defeat')}else setMode(id,'hurt')}
function hitEvent(id,outcome,amount){const target=1-id;if(outcome==='parry'){setMode(target,'guard');modes[target].contact=clock;floating(target,'PARRY','#a3ffdf');sound('parry')}else if(outcome==='dodge')floating(target,tr('ESQUIVA','DODGE'),'#a3ffdf');else{hurt(target,amount);floating(target,amount);sound('axe')}sparks.push({id:target,at:clock,parry:outcome==='parry',miss:outcome==='dodge',radial:id===0&&(appearance==='brisa'||appearance==='guardian'&&attackKey()==='attack2')});if(outcome==='break'||outcome==='vulnerable')floating(target,outcome==='break'?tr('GUARDIA ROTA','GUARD BREAK'):tr('DESCANSO INTERRUMPIDO','REST INTERRUPTED'));ui()}
function strike(id,outcome,amount,counter=false){add(id===0&&isRanged()?2600:2250,()=>{setMode(id,'attack',counter);log(name(id)+' · '+(counter?tr('Contraataque','Counterattack'):actionName('ATTACK')))},()=>{hitEvent(id,outcome,amount);log(name(1-id)+' · '+outcome+' · '+amount+' HP')},id===0&&isRanged()?(appearance==='alchemist'?GuardianAlchemyFX.impact:1440):1235,()=>{if(!deaths.hasOwnProperty(id))setMode(id,'idle');const target=1-id;if(!deaths.hasOwnProperty(target))setMode(target,result.actions[target]==='DEFEND'?'guard':result.actions[target]==='REST'?'rest':'idle')})}
function confirm(){if(busy||!choice||result?.finished)return;busy=true;result=battle.resolve(choice,intent);const selected=choice;choice=null;queue=[];for(let id=0;id<2;id++)setMode(id,result.actions[id]==='DEFEND'?'guard':result.actions[id]==='REST'?'rest':'idle');add(430,()=>{},()=>{});
 for(const e of result.events){if(e.type==='attack'){strike(e.actor,e.outcome,e.amount);if(e.reflected)strike(1-e.actor,'hit',e.reflected,true);add(1,()=>{display.actors[e.actor].focus=e.state.actors[e.actor].focus;display.actors[e.actor].ultra=e.state.actors[e.actor].ultra},()=>{});}else if(e.type==='rest'){add(1420,()=>setMode(e.actor,'activation'),()=>{display.actors[e.actor].hp=e.state.actors[e.actor].hp;display.actors[e.actor].focus=true;display.actors[e.actor].ultra=e.state.actors[e.actor].ultra;floating(e.actor,'+'+e.heal,'#9af3d3');log(name(e.actor)+' · '+tr('Vida y Focus','HP and Focus'));ui()},760,()=>setMode(e.actor,'idle'));}else if(e.type==='interrupted')add(500,()=>{log(name(e.actor)+' · '+tr('Descanso interrumpido','Rest interrupted'))},()=>{});}
 log(tr('Decisión: ','Decision: ')+actionName(selected));next();ui()}
function next(){current=queue.shift()||null;if(current){current.started=clock;current.begin();return;}if(!result)return;display=copy(result.next);busy=false;if(result.finished){setMode(result.winner,'victory');$('outcome').textContent=result.winner===0?tr('VICTORIA','VICTORY'):tr('DERROTA','DEFEAT');$('outcome').hidden=false;log($('outcome').textContent);}else{intent=battle.chooseEnemy();setMode(0,'idle');setMode(1,'idle')}ui()}
const sequence=GuardianAnimation.frame;
function sprite(context,mode,f,x,y,factor,avatar=appearance){const p=AVATARS[avatar].actions[mode],r=p.frames[f],s=p.scale*factor*(p.frameScale?.[f]||1),im=paletteCache.get(avatar,variant(avatar),mode,images[avatar+':'+mode]);context.save();const polygon=p.clips?.[f];if(polygon){context.beginPath();polygon.forEach(([px,py],i)=>{const dx=x+(px-r[0]-r[4])*s,dy=y+(py-r[1]-r[5])*s;i?context.lineTo(dx,dy):context.moveTo(dx,dy)});context.closePath();context.clip();}context.drawImage(im,r[0],r[1],r[2],r[3],x-r[4]*s,y-r[5]*s,r[2]*s,r[3]*s);context.restore()}
// Reuse the battle's idle atlases/anchors and its single animation clock callback.
const portraits=Object.entries(AVATARS).map(([id,avatar],i)=>({
 id,pack:avatar.actions.idle,canvas:$(id==='lancer'?'portrait':id+'-portrait'),
 visible:typeof IntersectionObserver==='undefined',age:i*731,frame:-1,ratio:0
}));
function renderPortraits(dt){
 if(document.hidden||$('selection').hidden)return;
 for(const p of portraits){
  if(!p.visible||!images[p.id+':idle'])continue;
  if(!reduced)p.age+=dt; // Idle only: real time (1x), independent of combat's 1.5x.
  const f=reduced?0:!p.pack.authoredBlink&&p.age%7000>=6890?5:sequence(p.pack,p.age,true);
  const ratio=Math.min(3,globalThis.devicePixelRatio||1);
  if(p.frame===f&&p.ratio===ratio)continue;
  const pc=p.canvas.getContext('2d');
  if(p.ratio!==ratio){p.canvas.width=p.canvas.height=Math.round(340*ratio);p.ratio=ratio;}
  pc.setTransform(ratio,0,0,ratio,0,0);
  pc.clearRect(0,0,340,340);
  pc.imageSmoothingEnabled=true;pc.imageSmoothingQuality='high';
  sprite(pc,'idle',f,175,320,GuardianScale.factor(p.id,255),p.id);
  p.frame=f;
 }
}
if(typeof IntersectionObserver!=='undefined'){
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){const p=portraits.find(p=>p.canvas===entry.target);if(p)p.visible=entry.isIntersecting;}
  renderPortraits(0);
 });
 for(const p of portraits)observer.observe(p.canvas);
}
// Same soft aura and curved impact flash as duel/game.js, scaled to this camera.
function combatGlow(p,size,color,alpha){const scale=size/240,g=ctx.createRadialGradient(p.x,p.y-115*scale,10*scale,p.x,p.y-115*scale,135*scale);g.addColorStop(0,color+alpha+')');g.addColorStop(1,color+'0)');ctx.fillStyle=g;ctx.fillRect(p.x-140*scale,p.y-260*scale,280*scale,290*scale);}
function drawActor(id,x,y,size){const state=modes[id],age=clock-state.at;let mode=state.name,f=0;
 if(mode==='attack'){
  if(id===0&&isRanged()){
   // Ranged actors stay planted: no approach frames, translation or retreat hop.
   const idleAt=360+GuardianAnimation.duration(AVATARS[appearance].actions[attackKey()]);
   if(age<360||age>=idleAt){mode='idle';f=sequence(AVATARS[appearance].actions.idle,(age<360?age:age-idleAt)/1.5,true)}
   else f=sequence(AVATARS[appearance].actions[attackKey()],age-360,false);
  }else{
   const backAt=1780,returnTime=470,u=ease(age/360)*(1-ease((age-backAt)/returnTime));
   const attackPack=id===0?AVATARS[appearance].actions[attackKey()]:null;
   const advance=attackPack?.reach?Math.max(0,960*.75-size*.10-x-attackPack.reach*attackPack.scale*GuardianScale.factor(appearance,size)):size*1.03;
   x+=(id?-1:1)*advance*u;
   if(id===0){if(age<360){mode='motion';f=Math.min(2,Math.floor(age/120))}
    else if(age>=backAt){mode='motion';f=Math.min(5,3+Math.floor((age-backAt)/(returnTime/3)));y-=Math.sin(Math.PI*clamp((age-backAt)/returnTime))*size*.18}
    else f=sequence(AVATARS[appearance].actions[attackKey()],age-360,false);}
  }
 }
 if($('effects').checked&&(display.actors[id].focus||mode==='activation'||mode==='rest'||mode==='guard')){const color=display.actors[id].ultra?'rgba(255,212,108,':mode==='guard'?'rgba(160,237,183,':'rgba(100,255,220,';combatGlow({x,y},size,color,mode==='activation'?.23:.15);}
 if(id===0){if(state.name!=='attack'){const p=AVATARS[appearance].actions[mode]||AVATARS[appearance].actions.idle;if(mode==='guard'){const contact=clock-(state.contact??-Infinity);f=contact<660?(contact<140?3:contact<440?4:5):age<250?0:age<500?1:[1,2][Math.floor(age/400)%2];}else if(mode==='victory')f=GuardianAnimation.victory(p,age);else if(mode==='idle'&&!p.authoredBlink&&(clock/1.5)%7000<110)f=5;else f=sequence(p,mode==='idle'?age/1.5:age,mode==='idle'||mode==='rest');}if(mode==='attack')mode=attackKey();sprite(ctx,mode,f,x,y,GuardianScale.factor(appearance,size));}else{let k='wi'+[0,1,2,3,2,1][Math.floor(clock/250)%6],floor=1050;if(mode==='attack'){k='wa'+(age<650?2:age<900?3:age<1120?4:age<1280?5:age<1550?6:7);floor=1238}else if(mode==='hurt')k='whurt';else if(mode==='defeat')k=age<240?'whurt':age<1080?'wkneel':'wfallen';const im=images[k],s=size/950;ctx.drawImage(im,x-720.5*s,y-floor*s,im.width*s,im.height*s)}
 if(mode==='hurt'&&age>650&&!busy)setMode(id,'idle');return{x,y,frame:f,mode};}
function render(){if(!active||!readyAssets)return;const w=960,h=Math.round(w*canvas.clientHeight/canvas.clientWidth);const dpr=Math.min(3,globalThis.devicePixelRatio||1),density=Math.min(canvas.clientWidth*dpr/w,Math.sqrt(4000000/(w*h))),pw=Math.max(1,Math.round(w*density)),ph=Math.max(1,Math.round(h*density));if(canvas.width!==pw||canvas.height!==ph){canvas.width=pw;canvas.height=ph}ctx.setTransform(pw/w,0,0,ph/h,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';const im=images.arena,s=Math.max(w/im.width,h/im.height);ctx.drawImage(im,(w-im.width*s)/2,(h-im.height*s)/2,im.width*s,im.height*s);const size=GuardianScale.sceneSize(w,canvas.clientWidth),floor=h*.63,homes=[w*.28,w*.75];if(!reduced)for(let i=0;i<18;i++){ctx.fillStyle='rgba(152,242,191,'+(.16+.22*Math.sin(clock/1300+i)**2)+')';ctx.fillRect((i*193+Math.sin(clock/1600+i)*12)%w,h*.2+(i*89)%(h*.48),2,2)}const poses=[];for(let id=0;id<2;id++)poses[id]=drawActor(id,homes[id],floor,size);
 if(modes[0].name==='attack')GuardianMeleeFX.draw(ctx,{id:appearance,age:clock-modes[0].at,frame:poses[0].frame,pack:AVATARS[appearance].actions[attackKey()],factor:GuardianScale.factor(appearance,size),x:poses[0].x,y:poses[0].y,reduced,enabled:$('effects').checked});
 if(appearance==='arcanist'&&modes[0].name==='attack')GuardianArcaneFX.draw(ctx,{age:clock-modes[0].at,frame:poses[0].frame,pack:ARCANIST_ACTIONS.attack,factor:GuardianScale.factor(appearance,size),x:poses[0].x,y:poses[0].y,end:{x:homes[1],y:floor-size*.8},size,reduced,enabled:$('effects').checked});
 if(appearance==='alchemist'&&modes[0].name==='attack')GuardianAlchemyFX.draw(ctx,{age:clock-modes[0].at,pack:ALCHEMIST_ACTIONS.attack,factor:GuardianScale.factor(appearance,size),x:poses[0].x,y:poses[0].y,end:{x:homes[1],y:floor-size*.8},size,reduced,enabled:$('effects').checked});
 if(appearance==='tracker'&&modes[0].name==='attack')GuardianCrossbowFX.draw(ctx,{age:clock-modes[0].at,frame:poses[0].frame,pack:TRACKER_ACTIONS.attack,factor:GuardianScale.factor(appearance,size),x:poses[0].x,y:poses[0].y,end:{x:homes[1],y:floor-size*.8},size,reduced,enabled:$('effects').checked});
 if(appearance==='explorer'&&modes[0].name==='attack'){const age=clock-modes[0].at;if(age>=1300&&age<1440){const s=AVATARS.explorer.actions.attack.scale*GuardianScale.factor('explorer',size),start={x:poses[0].x+(430-224)*s,y:poses[0].y+(172-494)*s},end={x:homes[1],y:floor-size*.55},u=clamp((age-1300)/140),x=start.x+(end.x-start.x)*u,y=start.y+(end.y-start.y)*u;ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(end.y-start.y,end.x-start.x));ctx.strokeStyle='#e5c28a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-28,0);ctx.lineTo(0,0);ctx.stroke();ctx.fillStyle='#f4f3df';ctx.beginPath();ctx.moveTo(4,0);ctx.lineTo(-3,-3);ctx.lineTo(-3,3);ctx.fill();if($('effects').checked&&!reduced){ctx.globalAlpha=.45;ctx.strokeStyle='#a0f4da';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-65,0);ctx.lineTo(-18,0);ctx.stroke()}ctx.restore()}}
 if($('effects').checked)for(const v of sparks){const age=clock-v.at;if(age>550||v.miss)continue;const p={x:homes[v.id],y:floor},k=1-age/550;ctx.save();ctx.globalAlpha=k;combatGlow(p,size,v.parry?'rgba(145,255,220,':'rgba(255,207,130,',.25*k);if(!reduced){ctx.translate(p.x+(v.id===0?25:-25)*size/240,p.y-135*size/240);ctx.scale(size/240,size/240);ctx.fillStyle=v.parry?'#b5ffe4':'#ffdb9b';if((appearance==='pugilist'||appearance==='custodian'||v.radial)&&v.id===1&&!v.parry){ctx.beginPath();for(let j=0;j<12;j++){const a=j*Math.PI/6,r=j%2?7:24,px=Math.cos(a)*r,py=Math.sin(a)*r;j?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();ctx.fill()}else{ctx.beginPath();ctx.moveTo(-50,-85);ctx.quadraticCurveTo(7,-8,52,82);ctx.quadraticCurveTo(-12,8,-50,-85);ctx.fill();}for(let i=0;i<16;i++){const a=i*2.399,r=12+age*(.08+i%4*.025);ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,1+i%3,0,7);ctx.fill()}}ctx.restore()}
 for(const v of labels){const age=clock-v.at;if(age>1300)continue;ctx.save();ctx.globalAlpha=Math.min(1,(1300-age)/300);ctx.fillStyle=v.color;ctx.strokeStyle='#061612';ctx.lineWidth=4;ctx.textAlign='center';ctx.font='bold '+Math.max(16,size*.12)+'px system-ui';const x=homes[v.id]+(v.lane%2?size*.2:-size*.1),y=floor-size*.65-age*.035-v.lane*30;ctx.strokeText(v.value,x,y);ctx.fillText(v.value,x,y);ctx.restore()}labels=labels.filter(v=>clock-v.at<1300);sparks=sparks.filter(v=>clock-v.at<550);}
function tick(now){const dt=last?Math.min(80,now-last):0;last=now;renderPortraits(dt);if(active&&!paused&&!document.hidden){clock+=dt*1.5;if(current&&isRanged()&&modes[0].name==='attack'&&!modes[0].released&&clock-modes[0].at>=(appearance==='alchemist'?GuardianAlchemyFX.release:1300)){modes[0].released=true;sound('mechanism',.12)}if(current){const age=clock-current.started;if(!current.hit&&age>=current.at){current.hit=true;current.impact()}if(age>=current.duration){current.end();next()}}render()}requestAnimationFrame(tick)}
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{if(!busy&&!result?.finished){choice=b.dataset.action;ui()}});$('confirm').onclick=confirm;for(const id of Object.keys(AVATARS))$(id).onclick=()=>start(id);$('replay').onclick=reset;$('pause').onclick=()=>{paused=!paused;stopSounds();ui()};$('change').onclick=()=>{if(busy)return;active=false;current=null;queue=[];stopSounds();$('battle').hidden=true;$('selection').hidden=false;$(appearance).focus()};$('language').onclick=()=>{en=!en;const url=new URL(location.href);url.searchParams.set('lang',en?'en':'es');history.replaceState(null,'',url);localize()};document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden)stopSounds()});window.guardianBattleSnapshot=()=>({appearance,busy,attackSerial,mode:modes[0].name,attackKey:attackKey(),frameAge:clock-modes[0].at});mountPalettes();localize();for(const id of Object.keys(AVATARS))load(id+':idle').then(()=>{renderPortraits(0)}).catch(()=>{$('load-status').textContent=tr('Selecciona una apariencia para reintentar la carga.','Choose an appearance to retry loading.')});requestAnimationFrame(tick);
const requestedHero=new URLSearchParams(location.search).get('hero');if(Object.hasOwn(AVATARS,requestedHero))start(requestedHero);
})();
