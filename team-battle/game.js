/* Separate team demo renderer. Resolved events drive presentation; canvas never rolls damage. */
(() => {
 'use strict';
 const es=document.documentElement.lang==='es',tr=(a,b)=>es?a:b,$=id=>document.getElementById(id);
 const names=['Jessie','Garrick',tr('Guardián de escarcha','Frost Warden'),tr('Guardián de ceniza','Ash Warden')];
 const shortNames=['Jessie','Garrick',tr('Escarcha','Frost'),tr('Ceniza','Ash')];
 const actions={ATTACK:tr('Atacar','Attack'),DEFEND:'Parry',REST:tr('Descansar','Rest'),SPECIAL:tr('Especial','Special')};
 const outcomes={hit:tr('Impacto','Hit'),break:tr('Guardia rota','Guard break'),parry:'PARRY',dodge:tr('Esquiva','Dodge'),ultra:'ULTRA FOCUS',vulnerable:tr('Descanso interrumpido','Rest interrupted')};
 const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),imgs={},src={},root='/assets/demo-battle/';
 const homes=[{x:220,y:410},{x:425,y:500},{x:865,y:410},{x:1075,y:500}];
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},lerp=(a,b,t)=>a+(b-a)*t;
 let team=['jessie','garrick'],draftTeam=[...team],selecting=true,finishedAt=null;
 const actorKey=id=>display?.actors[id]?.key;
 const skillName=id=>actorKey(id)==='zoe'?'I pay attention':actorKey(id)==='garrick'?'No One Else':tr('Fuego cruzado','Crossfire');
 let battle,display,queue=[],current=null,result=null,t=0,clock=0,last=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,ready=false,loaded=false,labels=[],bursts=[],struck={},deadAt={},eventBeat=0,variant=0,selected={},enemyPlans={},serial=0;
 for(const key of ['idle','attack','guard','hurt','rest','victory','defeat','portrait'])src['g'+key]=root+'garrick-v1/'+key+'.png';
 src.gmotion=root+'garrick-motion-v1/motion.png';
 for(const k of [...Object.keys(ZOE_PACK.specs),'cutin','projectile'])src['z'+k]=root+'zoe-v1/'+(k==='victory'?'victory-v2':k)+'.png';
 src.jcutin=root+'jessie-cutin-v3.png';src.gcutin=root+'garrick-cutin-v3.png';
 Object.assign(src,{arena:root+'black-lotus-arena.png',jportrait:root+'jessie-cutin.png',jguard:root+'jessie-defense-v1/guard.png',jhurt:root+'jessie-defense-v1/hurt.png',jrest:root+'jessie-lifecycle-v1/rest.png',jdefeat:root+'jessie-lifecycle-v1/defeat.png'});
 for(const i of [0,5,6,7])src['ji'+i]=root+'jessie-idle-shot-v1/idle-'+String(i).padStart(2,'0')+'.png';
 for(let i=0;i<4;i++){src['jp'+i]=root+'jessie-prep-v5/prep-'+i+'.png';src['jw'+i]=root+'ambient-loops-v1/jessie-'+i+'.png';src['wi'+i]=root+'ambient-loops-v1/warden-'+i+'.png';}
 for(let i=0;i<3;i++)src['jr'+i]=root+'jessie-polish-v2/raise-'+i+'.png';
 for(const i of [1,2,3,5,6])src['jo'+i]=root+'jessie-other-hand-v1/frame-'+i+'.png';
 for(let i=0;i<8;i++){src['wa'+i]=root+'combat-reactions-v1/warden-'+i+'.png';src['js'+i]=root+'jessie-special-v1/pose-'+i+'.png';}
 for(const key of ['hurt','kneel','fallen'])src['w'+key]=root+'warden-feedback-v1/'+key+'.png';
 src.jrecoil=root+'jessie-double-v4/recoil.png';src.jblink=root+'jessie-acting-v3/blink.png';src.jwinentry=root+'combat-reactions-v1/jessie-4.png';
 const music=new PracticeMusic(es),voices=new Set();
 function sound(kind){if(!$('sound').checked)return;const a=new Audio(root+'audio-v1/'+kind+'.wav');a.volume=.22;voices.add(a);a.onended=()=>voices.delete(a);a.play().catch(()=>voices.delete(a));}
 function stopSounds(){for(const a of voices)a.pause();voices.clear();}
 const clone=x=>JSON.parse(JSON.stringify(x));
 function log(s){const li=document.createElement('li');li.textContent=s;$('log').append(li);while($('log').children.length>100)$('log').firstElementChild.remove();$('log').scrollTop=$('log').scrollHeight;}
 function status(s){$('status').textContent=s;}
 function reset(){serial++;stopSounds();battle=new TeamRules.Battle(Math.random,team);finishedAt=null;activeAlly=0;guardStarted={};team.forEach((k,i)=>{names[i]=shortNames[i]=k[0].toUpperCase()+k.slice(1)});$('team-heading').textContent=names.slice(0,2).join(' + ');display=battle.snapshot();queue=[];current=null;result=null;t=0;clock=0;labels=[];bursts=[];struck={};deadAt={};variant=0;ready=true;selected={};enemyPlans=battle.intents();$('log').replaceChildren();$('result').hidden=true;ui();}
 let activeAlly=0,guardStarted={};
 const needsTarget=(id,p)=>p&&['ATTACK','SPECIAL'].includes(p.action)&&!(actorKey(id)==='garrick'&&p.action==='SPECIAL');
 function choose(id){if(selecting||!ready||paused||display.actors[id].hp<=0)return;if(id<2)activeAlly=id;else if(needsTarget(activeAlly,selected[activeAlly]))selected[activeAlly].target=id;ui();}
 function button(text,pressed,fn,disabled=false){const b=document.createElement('button');b.type='button';b.textContent=text;b.setAttribute('aria-pressed',String(pressed));b.disabled=disabled;b.onclick=fn;return b;}
 function ui(){
  const focusKey=document.activeElement?.getAttribute?.('data-control');
  $('cards').replaceChildren();for(const a of display.actors){const target=needsTarget(activeAlly,selected[activeAlly])&&selected[activeAlly]?.target===a.id;
   const card=button('',ready&&(a.id===activeAlly||target),()=>choose(a.id),!ready||paused||a.hp<=0);card.className='card team-'+a.team+(a.hp<=0?' dead':'')+(current?.actor===a.id?' acting':'');card.setAttribute('data-control','actor-'+a.id);card.setAttribute('aria-label',names[a.id]+', '+a.hp+'/'+a.max+' HP');
   const state=a.hp<=0?tr('Caído','Down'):a.guard?tr('Protegiendo','Protecting'):a.ultra?'Ultra Focus':a.focus?'Focus':a.id<2?(a.used?tr('Especial usada','Special used'):tr('Especial lista','Special ready')):ready?actions[enemyPlans[a.id]?.action]||'—':tr('En combate','In battle');
   card.innerHTML=`<span class="fighter-name">${shortNames[a.id]} <small>#${a.rank}</small></span><progress max="${a.max}" value="${a.hp}" aria-label="HP"></progress><span class="hp-value">${a.hp} / ${a.max}</span><span class="fighter-state">${state}</span>`;$('cards').append(card);
  }
  $('stats-content').innerHTML=display.actors.map(a=>`<div><strong>${names[a.id]}</strong><span>STR ${a.str} · AGI ${a.agi} · CON ${a.con}</span></div>`).join('');
  $('round-label').textContent=tr('Ronda ','Round ')+display.round;
  $('confirm').disabled=!loaded||!ready||paused||battle.winner()!==null;
  $('plans').replaceChildren();if(ready){for(const a of battle.living(0)){
   const p=selected[a.id]||{action:'ATTACK',target:battle.living(1)[0]?.id};if(a.used&&p.action==='SPECIAL')p.action='ATTACK';if(!battle.living(1).some(b=>b.id===Number(p.target)))p.target=battle.living(1)[0]?.id;selected[a.id]=p;
  }
   if(!battle.living(0).some(a=>a.id===activeAlly))activeAlly=battle.living(0)[0]?.id;
   const allies=document.createElement('div');allies.className='ally-picker';
   for(const a of battle.living(0)){const p=selected[a.id],b=button(names[a.id]+' · '+actions[p.action]+(needsTarget(a.id,p)?' → '+shortNames[p.target]:''),activeAlly===a.id,()=>choose(a.id),paused);b.setAttribute('data-control','plan-'+a.id);allies.append(b);}$('plans').append(allies);
   const a=display.actors[activeAlly];if(a){const p=selected[a.id],box=document.createElement('div');box.className='choice';const title=document.createElement('h2');title.textContent=names[a.id]+' · '+tr('Elige acción','Choose action');box.append(title);
   const row=document.createElement('div');row.className='action-picker';for(const [value,label] of Object.entries(actions)){const b=button(label,p.action===value,()=>{p.action=value;ui();},paused||value==='SPECIAL'&&a.used);b.setAttribute('data-control','action-'+value);b.title=value==='SPECIAL'?skillName(a.id):label;row.append(b);}box.append(row);
   const hint=document.createElement('p');hint.className='target-hint';hint.textContent=needsTarget(a.id,p)?tr('Objetivo:','Target:'):p.action==='SPECIAL'?tr('Protege a TODO el equipo.','Protects the WHOLE team.'):tr('Acción sobre sí mismo.','Self action.');box.append(hint);
   if(needsTarget(a.id,p)){const targets=document.createElement('div');targets.className='target-picker';for(const b of battle.living(1)){const targetButton=button(shortNames[b.id],p.target===b.id,()=>choose(b.id),paused);targetButton.setAttribute('data-control','target-'+b.id);targets.append(targetButton);}box.append(targets);}$('plans').append(box);}
  }else{const summary=document.createElement('p');summary.className='resolution-note';summary.textContent=result?.finished&&!current?tr('Combate terminado.','Battle complete.'):tr('Tu equipo ejecuta las acciones elegidas.','Your team is carrying out your plan.');$('plans').append(summary);if(result?.finished&&!current)$('plans').append(button(tr('Volver a jugar','Play again'),false,reset));
  }
  if(ready)status(paused?tr('En pausa','Paused'):tr('Personaje → acción → objetivo','Character → action → target'));
  if(focusKey)document.querySelector('[data-control="'+focusKey+'"]')?.focus?.({preventScroll:true});
 }
 function combine(events){const out=[];for(let i=0;i<events.length;i++){const e=events[i];if(['special','awareness'].includes(e.type)){
   const hits=[];while(events[i+1]?.special)hits.push(events[++i]);let final=hits.at(-1)?.state||e.state;if(events[i+1]?.type==='focus')final=events[++i].state;out.push({...e,type:e.type==='awareness'?'zoe-special':'cinematic',hits,state:final});
  }else out.push(e);}return out;}
 function sceneTime(){return current?.type==='cinematic'?(t<80?t:t<1660?80+(t-80)/2:t-790):t;}
 function eventDuration(e){return e.type==='zoe-special'?4350:e.type==='protection'?2900:e.type==='cinematic'?5090:['attack','counter'].includes(e.type)?actorKey(e.actor)==='zoe'?1900:actorKey(e.actor)==='jessie'?(e.type==='counter'?1400:3150):actorKey(e.actor)==='garrick'?2300:2100:['rest','rest-start'].includes(e.type)?1250:e.type==='round-end'?350:750;}
 function impacts(e){if(e.type==='zoe-special')return e.hits.map(h=>({...h,at:3520}));if(e.type==='cinematic'){
  const beats=[];e.hits.forEach((h,i)=>{const n=Math.floor(h.amount/2);beats.push({at:2240+i*650,target:h.target,amount:n,outcome:h.outcome});beats.push({at:4140,target:h.target,amount:h.amount-n,outcome:h.outcome});});return beats.sort((a,b)=>a.at-b.at);
 }if(!['attack','counter'].includes(e.type))return [];
 if(actorKey(e.actor)==='jessie'&&e.type==='attack'){const n=Math.floor(e.amount/2);return [{at:1980,target:e.target,amount:n,outcome:e.outcome},{at:2280,target:e.target,amount:e.amount-n,outcome:e.outcome}];}
 return [{at:actorKey(e.actor)==='zoe'?1040:actorKey(e.actor)==='jessie'?505:1120,target:e.target,amount:e.amount,outcome:e.outcome}];}
 function begin(){current=queue.shift();t=0;eventBeat=0;if(!current){display=clone(result.next);ready=!result.finished;enemyPlans=battle.intents();if(result.finished){finishedAt=clock;$('result').hidden=false;$('result').textContent=result.winner===0?tr('VICTORIA · ','VICTORY · ')+names.slice(0,2).join(' + '):tr('DERROTA · Puedes probar otra estrategia.','DEFEAT · Try another strategy.');status($('result').textContent);}ui();return;}
  current.duration=eventDuration(current);current.beats=impacts(current);if(current.type==='attack'&&actorKey(current.actor)==='jessie'){current.variant=variant;variant=1-variant;}
  if(current.type==='protection'){display.actors[current.actor].guard=true;guardStarted[current.actor]??=clock;}
  const n=current.actor===null?'':names[current.actor];status(n+' · '+(current.type==='protection'?tr('Protege a todo el equipo','Protects the whole team'):['cinematic','zoe-special'].includes(current.type)?skillName(current.actor):current.type==='counter'?tr('Contraataque','Counterattack'):actions[current.type.toUpperCase()]||tr('Resolviendo','Resolving')));ui();
 }
 function submit(){if(selecting||!ready||paused)return;try{result=battle.resolve(selected,enemyPlans);guardStarted={};for(const a of display.actors)if(result.plans[a.id]?.action==='DEFEND')guardStarted[a.id]=clock;ready=false;queue=combine(result.events);ui();begin();}catch(e){status(tr('Revisa las acciones y objetivos.','Check actions and targets.'));console.error(e);}}
 function commit(){
  const e=current;for(const a of e.state.actors)if(a.hp<=0&&display.actors[a.id].hp>0)deadAt[a.id]=clock;
  display=clone(e.state);if(e.type==='counter')guardStarted[e.actor]=clock;if(e.type==='rest')labels.push({id:e.actor,value:'+'+e.heal,at:clock,color:'#9ff5d4'});
  if(e.type==='attack'||e.type==='counter')log(names[e.actor]+' → '+names[e.target]+' · '+(e.type==='counter'?tr('Contraataque','Counter'):outcomes[e.outcome])+' '+e.amount+(e.protected!==null&&e.protected!==undefined?' · '+tr('Garrick cubre a ','Garrick covers ')+names[e.protected]:'')+(e.lastStand?' · 1 HP':''));
  else if(['cinematic','zoe-special'].includes(e.type))log(names[e.actor]+' · '+tr('Especial: ','Special: ')+e.hits.map(h=>names[h.target]+' '+h.amount).join(' / '));
  else if(e.type!=='round-end')log(names[e.actor]+' · '+({protection:tr('Protección para todo el equipo','Whole-team protection'),guard:'Parry',rest:tr('Recupera vida y Focus','Recovers HP and Focus'),'rest-start':tr('Intenta descansar','Attempts to rest'),interrupted:tr('Descanso interrumpido','Rest interrupted')}[e.type]||e.type));
  ui();begin();
 }
 function beat(b){const a=display.actors[b.target];if(b.amount){a.hp=Math.max(0,a.hp-b.amount);struck[b.target]=clock;if(!a.hp)deadAt[b.target]=clock;}
  const hit=b.outcome!=='dodge';bursts.push({id:b.target,at:clock,parry:b.outcome==='parry',miss:!hit});
  const lane=labels.filter(l=>l.id===b.target&&clock-l.at<1300).length;
  labels.push({id:b.target,value:b.amount||outcomes[b.outcome]||'',at:clock,lane,color:b.outcome==='parry'?'#a6ffdf':'#ffdf9f'});
  if(hit)sound(b.outcome==='parry'?'parry':actorKey(current.actor)==='jessie'?'shot':'axe');else if(actorKey(current.actor)==='jessie')sound('shot');ui();
 }
 function txt(s,x,y,size=18,color='#fff0d7',align='center'){ctx.fillStyle=color;ctx.font='600 '+size+'px Georgia';ctx.textAlign=align;ctx.fillText(s,x,y);}
 const paletteCache=new Map();let enemyPalette=null;
 function paletteImage(key,id){const cacheKey=key+':'+id;if(paletteCache.has(cacheKey))return paletteCache.get(cacheKey);
  const im=imgs[key],out=document.createElement('canvas');out.width=Math.ceil(im.width*.5);out.height=Math.ceil(im.height*.5);const g=out.getContext('2d');g.drawImage(im,0,0,out.width,out.height);
  // Source-atop works without Canvas filter (not supported by some mobile browsers).
  // Cache at half source resolution: still above the displayed sprite size.
  g.globalCompositeOperation='source-atop';g.fillStyle=id===2?'rgba(65,156,238,.46)':'rgba(231,104,45,.46)';g.fillRect(0,0,out.width,out.height);paletteCache.set(cacheKey,out);return out;
 }
 function drawFrame(key,r,x,y,anchor,floor,scale){const im=imgs[key];if(!im)return;const paint=enemyPalette===null?im:paletteImage(key,enemyPalette),sx=paint.width/im.width,sy=paint.height/im.height;ctx.drawImage(paint,r[0]*sx,r[1]*sy,r[2]*sx,r[3]*sy,x-anchor*scale,y-floor*scale,r[2]*scale,r[3]*scale);}
 function whole(key,x,y,scale=.46,anchor=225,floor=525){const im=imgs[key];drawFrame(key,[0,0,im.width,im.height],x,y,anchor,floor,scale);}
 const guardR=[[0,0,560,520],[560,0,490,520],[1050,0,486,520],[0,520,560,504],[560,520,550,504],[1110,520,426,504]],guardA=[275,224,252,291,212,171],guardF=[516,516,516,473,470,474];
 function garrick(mode,f,p){
  if(mode==='idle'){const row=Math.floor(f/3);drawFrame('gidle',[f%3*512,row*512,512,512],p.x,p.y,270,row?501:504,.48);}
  // Motion drawings have a larger anatomical scale inside their cells than attack.png.
  // Match head/torso proportions, not bounding-box height (dash and jump bend the legs).
  else if(mode==='motion')drawFrame('gmotion',[f%3*512,Math.floor(f/3)*512,512,512],p.x,p.y,[275,288,273,266,276,268][f],[465,468,468,465,378,459][f],.53);
  else if(mode==='guard')drawFrame('gguard',guardR[f],p.x,p.y,guardA[f],guardF[f],.54);
  else if(mode==='attack'){const rs=[[0,0,512,512],[512,0,512,512],[1024,0,512,512],[0,512,540,512],[560,512,464,512],[1024,512,512,512]];drawFrame('gattack',rs[f],p.x,p.y,[270,296,296,270,222,296][f],[482,482,482,443,446,452][f],.6);}
  else if(mode==='hurt'){drawFrame('ghurt',[[0,0,627,627],[627,0,627,627],[0,627,650,627],[650,627,604,627]][f],p.x,p.y,[316,297,324,295][f],[612,612,597,612][f],.41);}
  else{const rs=[[0,0,645,623],[645,0,609,623],[0,623,645,631],[645,623,609,631]],defs={rest:[[310,280,340,282],[618,619,621,621]],victory:[[324,281,324,280],[618,618,619,620]],defeat:[[275,265,280,280],[619,613,578,587]]};drawFrame('g'+mode,rs[f],p.x,p.y,defs[mode][0][f],defs[mode][1][f],.41);}
 }
 function jAtlas(mode,f,p){
  const cell=mode==='guard'?512:627,cols=mode==='guard'?3:2;
  const maps={guard:[[278,270,270,278,268,278],[500,499,500,492,492,494],.98],hurt:[[348,286,348,286],[607,607,565,565],1.05],rest:[[345,318,345,318],[615,615,614,614],.84],defeat:[[337,313,331,328],[684,703,474,474],.77]};
  const m=maps[mode],rect=mode==='defeat'?[[0,0,627,740],[627,0,627,740],[0,740,627,514],[627,740,627,514]][f]:[f%cols*cell,Math.floor(f/cols)*cell,cell,cell];drawFrame('j'+mode,rect,p.x,p.y,m[0][f],m[1][f],m[2]*.46);
 }
 function guardFrame(id,elapsed,contactAge=Infinity){
  // Guard has its own continuous clock, not the clock of each queued attack.
  // Garrick 3/4/5 are counterattack drawings: never play them while blocking.
  if(contactAge>=0&&contactAge<360)return id===1?(contactAge<240?2:1):(contactAge<180?3:4);
  if(elapsed<220)return 0;
  return (id===1?[1,1,0,1]:[1,4,1,4])[Math.floor((elapsed-220)/360)%4];
 }
 function garrickAttackPose(time){
  if(time<650)return {mode:'motion',f:time<180?0:time<420?1:2};
  if(time<1450)return {mode:'attack',f:time<850?1:time<1120?2:time<1280?3:4};
  if(time<2090)return {mode:'motion',f:time<1600?3:time<1950?4:5};
  if(time<2230)return {mode:'attack',f:5};
  return {mode:'idle',f:0};
 }
 function garrickTravel(time,home,target,reduced=false){
  const outward=ease((time-180)/470),back=ease((time-1450)/500),u=outward*(1-back);
  const groundY=lerp(home.y,target.y,u),lift=reduced?0:Math.sin(Math.PI*clamp((time-1450)/500))*48;
  return {x:lerp(home.x,target.x-125,u),y:groundY-lift,groundY,lift};
 }
const zoeScale={idle:1,attack:.90,parry:.96,hurt:.96,rest:1,victory:1,defeat:1,motion:1,special:.97};
function zScale(mode){return 245/ZOE_PACK.specs[mode].height*(zoeScale[mode]||1)}
function zFrame(mode,f,p){const spec=ZOE_PACK.specs[mode],im=imgs['z'+mode];if(!spec||!im)return;const w=im.width/3,split=spec.split||im.height/2,row=f<3?0:1,y=row?split:0,h=row?im.height-split:split,s=zScale(mode);drawFrame('z'+mode,[f%3*w,y,w,h],p.x,p.y,spec.anchors[f],spec.feet[f],s)}
function zAttack(time){return time<220?0:time<660?1:time<920?2:time<1130?3:time<1390?4:5}

 function pose(id,p){
  const a=display.actors[id],e=current,age=clock-(struck[id]??-99999),death=clock-(deadAt[id]??clock),guard=a.guard||(result?.plans[id]?.action==='DEFEND'&&!ready);
  let mode='idle',f=[0,1,2,1,0,5,4,5][Math.floor(clock/360)%8];
  if(a.hp<=0){mode='defeat';f=death<250?0:death<650?1:death<1080?2:3;}
  else if(!current&&result?.winner===a.team){mode='victory';f=a.team===0?DuelAnimations.victoryFrame(a.key,clock-(finishedAt??clock)):0;}
  else if(age>=0&&age<600){mode='hurt';f=age<170?1:age<370?2:age<470?3:0;}
  else if(e&&e.actor===id&&['rest','rest-start'].includes(e.type)){mode='rest';f=t<220?0:t<600?1:t<1020?2:3;}
  else if(e&&e.actor===id&&['attack','counter'].includes(e.type)){mode='attack';f=t<400?0:t<750?1:t<1120?2:t<1280?3:t<1500?4:5;}
  else if(guard){mode='guard';const pulse=bursts.findLast(b=>b.id===id&&b.parry&&clock-b.at<360);f=guardFrame(a.key==='garrick'?1:0,clock-(guardStarted[id]??clock),pulse?clock-pulse.at:Infinity);if(e?.type==='round-end'){f=0;if(t>=220)mode='idle';}}
if(a.key==='zoe'){
 if(mode==='defeat'){zFrame('defeat',Math.min(5,Math.floor(death/210)),p);return}
 if(mode==='hurt'){zFrame('hurt',age<90?0:age<210?1:age<330?2:age<440?3:age<520?4:5,p);return}
 if(e?.type==='zoe-special'&&e.actor===id){if(t<2480)zFrame('special',t<250?0:t<800?1:t<1800?2:t<2100?3:t<2310?4:5,p);else zFrame('attack',zAttack(t-2480),p);return}
 if(mode==='attack'){zFrame('attack',zAttack(t),p);return}
 if(mode==='guard'){const pulse=bursts.findLast(b=>b.id===id&&b.parry&&clock-b.at<300),elapsed=clock-(guardStarted[id]??clock);zFrame('parry',e?.type==='round-end'?5:pulse?4:elapsed<180?0:elapsed<360?1:2+Math.floor(elapsed/340)%2,p);return}
 if(mode==='rest'){zFrame('rest',t<200?0:t<450?1:t<780?2:t<1120?3:t<1300?4:5,p);return}
 if(mode==='victory'){zFrame('victory',f,p);return}
 zFrame('idle',clock%4800>4640?5:[0,1,2,1,0,3,4,3][Math.floor(clock/300)%8],p);return
}

  if(a.key==='garrick'){if(mode==='attack'){const phase=garrickAttackPose(t);garrick(phase.mode,phase.f,p);}else garrick(mode,f,p);return;}
  if(a.key==='jessie'){
   if(['guard','hurt','rest','defeat'].includes(mode)){jAtlas(mode,f,p);return;}
   if(mode==='victory'){whole('jw'+f,p.x,p.y);return;}
   if(e?.type==='cinematic'&&e.actor===id){const st=sceneTime(),q=st<1000?0:st<1300?1:st<1700?2:st<2050?3:st<3435?4:st<3550?5:st<3900?6:7;whole('js'+q,p.x,p.y);return;}
   if(mode==='attack'){
    let key;if(e.type==='counter')key=t<180?'jr1':t<505?'jr2':t<620?'jrecoil':t<900?'jr2':'jr0';
    else if(t<120)key='ji0';else if(t<1245)key=e.variant?(t<700?'jp1':t<1050?'jo1':'jo2'):'jp'+[0,1,2,3,2,1][Math.floor(t/170)%6];
    else if(e.variant)key=t<1925?'jo3':t<2005?'jo5':t<2225?'jo3':t<2305?'jo5':t<2500?'jo3':t<2740?'jo6':'jo1';
    else key=t<1485?'jr1':t<1925?'jr2':t<2005?'jrecoil':t<2225?'jr2':t<2305?'jrecoil':t<2500?'jr2':t<2740?'jr1':'jr0';whole(key,p.x,p.y);return;
   }
   whole(clock%4800>4650?'jblink':'ji'+[0,7,6,5,6,7][Math.floor(clock/300)%6],p.x,p.y);return;
  }
  // Palette is applied to every pose, preserving source silhouettes and animation.
  ctx.save();enemyPalette=id;
  let key='wi'+[0,1,2,3,2,1][Math.floor(clock/250)%6],floor=1050;
  if(mode==='defeat')key=death<240?'whurt':death<1080?'wkneel':'wfallen';
  else if(mode==='hurt')key='whurt';
  else if(mode==='attack'){key='wa'+(t<650?2:t<900?3:t<1120?4:t<1280?5:t<1550?6:7);floor=1238;}
  whole(key,p.x,p.y,.235,720.5,floor);enemyPalette=null;ctx.restore();
 }
 function positions(){const ps=homes.map(p=>({...p})),e=current;if(!e)return ps;
  if(e.protected!==null&&e.protected!==undefined){const a=ps[e.protected],g=ps[e.target],u=ease(t/450)*(1-ease((t-1600)/500));g.x=lerp(g.x,a.x+125,u);g.y=lerp(g.y,a.y+12,u);}
  if(['attack','counter'].includes(e.type)&&!['jessie','zoe'].includes(actorKey(e.actor))){const a=ps[e.actor],b=ps[e.target];if(actorKey(e.actor)==='garrick')ps[e.actor]=garrickTravel(t,a,b,matchMedia('(prefers-reduced-motion: reduce)').matches);else{const u=ease((t-300)/350)*(1-ease((t-1550)/550));a.x=lerp(a.x,b.x+135,u);a.y=lerp(a.y,b.y,u);}}
  if(e.type==='cinematic'){const st=sceneTime();ps[e.actor].x+=70*ease((st-900)/350)*(1-ease((st-3600)/650));}
  return ps;
 }
 function glow(p,color,alpha){const g=ctx.createRadialGradient(p.x,p.y-115,10,p.x,p.y-115,135);g.addColorStop(0,color+alpha+')');g.addColorStop(1,color+'0)');ctx.fillStyle=g;ctx.fillRect(p.x-140,p.y-260,280,290);}
 function cinematicEnabled(){return current?.type==='cinematic'&&$('effects').checked&&!matchMedia('(prefers-reduced-motion: reduce)').matches;}
 function normalShotMuzzle(p,alternate,recoil){
  // Alternate drawings use a higher barrel; recoil frame 5 also shifts it back/up.
  // Coordinates are in the source sprite, using whole()'s exact anchor and scale.
  if(alternate){const tip=recoil?[438,102]:[447,111];return {x:p.x+(tip[0]-225)*.46,y:p.y+(tip[1]-525)*.46};}
  return {x:p.x+95,y:p.y-170};
 }
 function specialBackdrop(ps){if(!cinematicEnabled())return;const st=sceneTime(),fade=ease(st/400)*(1-ease((st-3750)/550));
  ctx.fillStyle='rgba(2,7,17,'+.72*fade+')';ctx.fillRect(0,0,1280,650);ctx.fillStyle='rgba(2,5,11,'+.92*fade+')';ctx.fillRect(0,0,1280,40);ctx.fillRect(0,616,1280,34);
  const strength=Math.max(ease(st/240)*(1-ease((st-650)/300))*.8,ease((st-2700)/580)*(1-ease((st-3350)/240))),p=ps[current.actor];
  ctx.save();ctx.translate(p.x,p.y-115);ctx.scale(1,1.45);glow({x:0,y:115},'rgba(104,228,210,',.3*strength);glow({x:0,y:115},'rgba(255,213,141,',.15*strength);ctx.restore();
  if(st>=1000&&st<1400){const k=(st-1000)/400;for(let i=3;i>0;i--){ctx.save();ctx.globalAlpha=Math.sin(k*Math.PI)*.15/i;whole('js1',p.x-i*19,p.y);ctx.restore();}}
 }
 function specialEffects(ps){if(!cinematicEnabled())return;const st=sceneTime(),p=ps[current.actor],charge=ease((st-2700)/580)*(1-ease((st-3350)/240));
  const strength=Math.max(ease(st/240)*(1-ease((st-650)/300))*.8,charge);
  const wash=Math.max(Math.sin(Math.PI*clamp((st-180)/520))*.045,Math.sin(Math.PI*clamp((st-3200)/400))*.065);
  ctx.fillStyle='rgba(255,232,188,'+wash+')';ctx.fillRect(0,0,1280,650);
  for(let i=0;i<12;i++){const k=(st/1100+i*.618)%1,x=p.x+(i%2?1:-1)*(85-50*k)+Math.sin(i*2.4+k*3)*12,y=p.y-k*260;ctx.fillStyle='rgba(255,240,197,'+Math.sin(k*Math.PI)*strength*.65+')';ctx.beginPath();ctx.arc(x,y,1.7,0,7);ctx.fill();}
  const muzzle=([x,y])=>({x:p.x+(x-225)*.46,y:p.y+(y-525)*.46});
  for(const tip of [[463,158],[435,201]]){const m=muzzle(tip);if(charge>0){glow({x:m.x,y:m.y+115},'rgba(125,255,230,',charge*.25);for(let i=0;i<10;i++){const a=i*2.4+st*.004,r=10+55*(1-charge);ctx.fillStyle='rgba(244,203,121,'+charge*.8+')';ctx.beginPath();ctx.arc(m.x+Math.cos(a)*r,m.y+Math.sin(a)*r,1.5,0,7);ctx.fill();}}}
  current.beats.forEach((b,i)=>{const age=t-b.at;if(age<0||age>650)return;const final=b.at===4140,m=muzzle(final?(i%2?[435,201]:[463,158]):i===0?[485,150]:[435,201]),target=ps[b.target],end={x:target.x,y:target.y-135};
   if(age<90)glow({x:m.x,y:m.y+115},'rgba(255,221,155,',.6*(1-age/90));
   if(age<260){const head=clamp(age/70),tail=clamp((age-75)/180);ctx.save();ctx.globalAlpha=1-tail;for(const [width,color] of [[final?18:10,'rgba(85,232,218,.15)'],[final?6:3,'#ffcc77'],[1,'#fff2ce']]){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(lerp(m.x,end.x,tail),lerp(m.y,end.y,tail));ctx.lineTo(lerp(m.x,end.x,head),lerp(m.y,end.y,head));ctx.stroke();}ctx.restore();}
   const k=age/650;glow(target,final?'rgba(99,238,214,':'rgba(255,196,119,',.3*(1-k));
   for(let n=0;n<(final?26:13);n++){const a=n*2.39996,r=(final?160:75)*(.5+n%7/10)*k,x=end.x+Math.cos(a)*r,y=end.y+Math.sin(a)*r+k*k*40;ctx.strokeStyle=n%2?'rgba(255,215,141,'+(1-k)*.9+')':'rgba(140,255,238,'+(1-k)*.9+')';ctx.lineWidth=n%3+1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-Math.cos(a)*12*(1-k),y-Math.sin(a)*12*(1-k));ctx.stroke();}
  });
 }
 function effects(ps){if(!$('effects').checked)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduced&&actorKey(current?.actor)==='garrick'&&['attack','counter'].includes(current.type)){
   // Soft dust at launch/landing, separate from the airborne character and shadow.
   for(const at of [180,1950]){const age=t-at;if(age<0||age>400)continue;const k=age/400,home=homes[current.actor];
    for(let i=0;i<5;i++){const x=home.x+(i-2)*(9+15*k),y=home.y-4-k*(8+i*3),r=8+18*k,g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(192,179,149,'+(.1*(1-k))+')');g.addColorStop(1,'rgba(192,179,149,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
   }
  }
  for(const a of display.actors){if(a.hp<=0)continue;if(a.focus||a.ultra)glow(ps[a.id],a.ultra?'rgba(255,212,108,':'rgba(100,255,220,',.15);if(display.actors.some(g=>g.guard&&g.team===a.team))glow(ps[a.id],'rgba(215,237,162,',.15);}
  for(const b of bursts){const age=clock-b.at;if(age>550||b.miss)continue;const p=ps[b.id],x=p.x+(b.id<2?25:-25),y=p.y-135,k=1-age/550,color=b.parry?'#b5ffe4':'#ffdb9b';ctx.save();ctx.globalAlpha=k;glow(p,b.parry?'rgba(145,255,220,':'rgba(255,207,130,',.25*k);
   if(!reduced){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x-50,y-85);ctx.quadraticCurveTo(x+7,y-8,x+52,y+82);ctx.quadraticCurveTo(x-12,y+8,x-50,y-85);ctx.fill();for(let i=0;i<16;i++){const a=i*2.399,r=12+age*(.08+i%4*.025);ctx.fillStyle=i%2?color:'#fff9e5';ctx.beginPath();ctx.arc(x+Math.cos(a)*r,y+Math.sin(a)*r,1+i%3,0,7);ctx.fill();}}ctx.restore();
  }
  if(actorKey(current?.actor)==='jessie'&&current.type!=='cinematic'){for(const b of current.beats){const age=t-b.at;if(age<0||age>90)continue;const p=ps[current.actor],recoil=(t>=1925&&t<2005)||(t>=2225&&t<2305),m=normalShotMuzzle(p,current.variant===1,recoil),target=ps[b.target];ctx.save();ctx.globalAlpha=1-age/90;ctx.strokeStyle='#ffe1a4';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(target.x,target.y-145);ctx.stroke();glow({x:m.x,y:m.y+115},'rgba(255,221,155,',.5);ctx.restore();}}
  specialEffects(ps);
 }
function projectile(ps){
 if(actorKey(current?.actor)!=='zoe'||!current||!['attack','counter','zoe-special'].includes(current.type))return;
 const release=current.type==='zoe-special'?3400:920,age=t-release;if(age<0||age>120)return;
 const p=ps[current.actor],q=ps[current.target??current.hits?.[0]?.target],k=clamp(age/120),spec=ZOE_PACK.specs.attack,s=zScale('attack');
 // Frame 3: extended throwing hand. This follows sprite calibration as well.
 const sx=p.x+(465-spec.anchors[3])*s,sy=p.y+(129-spec.feet[3])*s,
 dx=q.x-sx,dy=q.y-145-sy,x=lerp(sx,q.x,k),y=lerp(sy,q.y-145,k),angle=Math.atan2(dy,dx);
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);
 if($('effects').checked&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const special=current.type==='zoe-special',length=Math.min(special?210:125,Math.hypot(dx,dy)*k+24),trail=ctx.createLinearGradient(-length,0,30,0);
  trail.addColorStop(0,'#79dccc00');trail.addColorStop(.65,'#a5ffee88');trail.addColorStop(1,'#f3ffefe6');
  ctx.globalCompositeOperation='lighter';ctx.fillStyle=trail;
  const width=special?13:7;
  ctx.beginPath();ctx.moveTo(-length,0);ctx.quadraticCurveTo(-25,-width,30,0);ctx.quadraticCurveTo(-25,width,-length,0);ctx.fill();
  ctx.strokeStyle=trail;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-length*.75,0);ctx.lineTo(30,0);ctx.stroke();
  ctx.shadowColor='#b9fff1';ctx.shadowBlur=special?22:10;ctx.strokeStyle='#f5fff7';ctx.lineWidth=special?2:1.2;
  ctx.beginPath();ctx.moveTo(19,0);ctx.lineTo(38,0);ctx.moveTo(29,-5);ctx.lineTo(29,5);ctx.stroke();
 }
 ctx.globalCompositeOperation='source-over';ctx.shadowBlur=0;ctx.drawImage(imgs.zprojectile,-35,-18,70,35);ctx.restore();
}

 function cutin(){const e=current;if(!e||!['protection','cinematic','zoe-special'].includes(e.type))return;
  // Match the 1v1 drawCard and its doubled portrait interval.
  const ct=80+(t-80)/2;if(t<80||ct>870)return;
  const alpha=ease((ct-80)/130)*(1-ease((ct-670)/200)),slide=-90*(1-ease((ct-80)/160))+100*ease((ct-700)/170),y=130,h=285,w=1280,id=e.actor;
  ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle='rgba(7,20,35,.96)';ctx.fillRect(0,y,w,h);
  ctx.fillStyle='rgba(18,63,70,.55)';ctx.beginPath();ctx.moveTo(w*.4,y);ctx.lineTo(w*.73,y);ctx.lineTo(w*.52,y+h);ctx.fill();
  ctx.strokeStyle='#e7bb68';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.moveTo(0,y+h);ctx.lineTo(w,y+h);ctx.stroke();
  ctx.save();ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w*.61,y);ctx.lineTo(w*.51,y+h);ctx.lineTo(0,y+h);ctx.closePath();ctx.clip();const im=imgs[actorKey(id)==='zoe'?'zcutin':actorKey(id)==='garrick'?'gcutin':'jcutin'];ctx.drawImage(im,w*.04+slide,y-65,im.width*.52,im.height*.52);ctx.restore();
  ctx.textBaseline='middle';txt(names[id].toUpperCase(),w*.74-slide*.15,y+112,42,'#ffe1a3');ctx.font='18px Arial';ctx.fillStyle='#98f4df';ctx.fillText(skillName(id).toUpperCase(),w*.74-slide*.15,y+157);
  ctx.strokeStyle='rgba(141,242,220,.18)';ctx.lineWidth=1;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(w*.62+i*30,y+h-25-i*8);ctx.lineTo(w,y+h-25-i*8);ctx.stroke();}ctx.restore();
 }
 function render(){ctx.clearRect(0,0,1280,650);const bg=imgs.arena,s=Math.max(1280/bg.width,650/bg.height);ctx.drawImage(bg,(1280-bg.width*s)/2,(650-bg.height*s)/2,bg.width*s,bg.height*s);ctx.fillStyle='rgba(3,12,14,.2)';ctx.fillRect(0,0,1280,650);
  const ps=positions();specialBackdrop(ps);if(current?.type==='zoe-special'&&$('effects').checked){ctx.fillStyle='rgba(2,9,18,'+(.65*ease(t/300)*(1-ease((t-3700)/600)))+')';ctx.fillRect(0,0,1280,650);glow(ps[current.actor],'rgba(116,249,209,',.25)}[0,1,2,3].sort((a,b)=>(ps[a].groundY??ps[a].y)-(ps[b].groundY??ps[b].y)).forEach(id=>{const p=ps[id],lift=p.lift||0;ctx.fillStyle='rgba(0,8,6,'+(.35-lift*.002)+')';ctx.beginPath();ctx.ellipse(p.x,p.groundY??p.y,49-lift*.25,8-lift*.04,0,0,7);ctx.fill();pose(id,p);txt(names[id],p.x,(p.groundY??p.y)+25,16,id===2?'#b9e0ff':id===3?'#ffd1af':'#f5e5bd');});effects(ps);projectile(ps);
  if($('effects').checked&&!matchMedia('(prefers-reduced-motion: reduce)').matches)for(let i=0;i<18;i++){ctx.fillStyle='rgba(195,237,152,'+(.2+.3*Math.sin(clock*.001+i)**2)+')';ctx.beginPath();ctx.arc(50+(i*79)%1200+Math.sin(clock*.0004+i)*12,110+(i*43)%380,1.4,0,7);ctx.fill();}
  for(const l of labels){const k=clamp((clock-l.at)/1300),p=ps[l.id],lane=l.lane||0,dx=[-38,38,-80,80,0][lane%5];ctx.save();ctx.globalAlpha=1-k;txt(String(l.value),p.x+dx,p.y-250-40*Math.floor(lane/2)-50*k,22,l.color);ctx.restore();}
  if(ready&&!paused&&display.actors[activeAlly]?.hp>0){const p=selected[activeAlly];for(const id of [activeAlly,...(needsTarget(activeAlly,p)?[p.target]:[])]){const pos=ps[id];txt(id<2?tr('▼ ACCIÓN','▼ ACTION'):tr('▼ OBJETIVO','▼ TARGET'),pos.x,pos.y-280,18,id<2?'#a6ffdf':'#ffe1a3');}}
  cutin();
 }
 function tick(now){if(selecting){last=now;requestAnimationFrame(tick);return;}const dt=last?Math.min(now-last,80)*1.5:0;last=now;if(!paused){clock+=dt;if(current){t+=dt;while(eventBeat<current.beats.length&&t>=current.beats[eventBeat].at)beat(current.beats[eventBeat++]);if(t>=current.duration)commit();}labels=labels.filter(x=>clock-x.at<1300);bursts=bursts.filter(x=>clock-x.at<550);}render();requestAnimationFrame(tick);}
 $('confirm').onclick=submit;$('reset').onclick=()=>{if(loaded)reset();};$('pause').onclick=()=>{paused=!paused;if(paused)stopSounds();$('pause').textContent=paused?tr('Continuar','Resume'):tr('Pausar','Pause');ui();};$('sound').onchange=()=>{if(!$('sound').checked)stopSounds();};

 function selectorUI(){
  $('team-options').replaceChildren();
  for(const [key,stats]of Object.entries(TeamRules.heroes)){
   const on=draftTeam.includes(key),b=button('',on,()=>{
    if(on)draftTeam=draftTeam.filter(k=>k!==key);
    else if(draftTeam.length<2)draftTeam.push(key);
    selectorUI();
   });
   b.className='team-option';const im=document.createElement('img');
   im.src=src[key==='zoe'?'zcutin':key==='garrick'?'gcutin':'jcutin'];im.alt='';
   const text=document.createElement('span');text.textContent=(on?'✓ ':'')+key[0].toUpperCase()+key.slice(1);
   const stat=document.createElement('small');stat.textContent='STR '+stats.str+' · AGI '+stats.agi+' · CON '+stats.con;
   b.append(im,text,stat);b.disabled=!on&&draftTeam.length===2;$('team-options').append(b);
  }
  $('team-start').disabled=!loaded||draftTeam.length!==2;
  $('team-selection-status').textContent=!loaded?tr('Cargando personajes…','Loading heroes…'):draftTeam.length===2?tr('Equipo listo. Para cambiar un integrante, desmárcalo primero.','Team ready. Deselect a hero first to replace them.'):tr('Elige dos personajes distintos.','Choose two different heroes.');
 }
 function openTeamSelector(){
  selecting=true;stopSounds();draftTeam=[...team];$('team-selector').hidden=false;$('team-game').hidden=true;$('team-cancel').hidden=!display;selectorUI();
 }
 $('change-team').onclick=openTeamSelector;
 $('team-cancel').onclick=()=>{selecting=false;$('team-selector').hidden=true;$('team-game').hidden=false;last=0};
 $('team-start').onclick=()=>{if(!loaded||draftTeam.length!==2)return;team=[...draftTeam];selecting=false;paused=false;$('team-selector').hidden=true;$('team-game').hidden=false;reset();last=0;$('pause').textContent=tr('Pausar','Pause')};
 selectorUI();

 Promise.all(Object.entries(src).map(([key,path])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{imgs[key]=im;resolve();};im.onerror=()=>reject(Error(path));im.src=path;}))).then(()=>{loaded=true;reset();selectorUI();$('pause').disabled=false;$('reset').disabled=false;$('pause').textContent=paused?tr('Continuar','Resume'):tr('Pausar','Pause');requestAnimationFrame(tick);}).catch(e=>{status(tr('No se pudo cargar un recurso. Recarga la página.','An asset could not be loaded. Reload the page.'));console.error(e);});
 function canvasPoint(clientX,clientY,r){const scale=Math.min(r.width/1280,r.height/650);return {x:(clientX-r.left-(r.width-1280*scale)/2)/scale,y:(clientY-r.top-(r.height-650*scale)/2)/scale};}
 canvas.onclick=ev=>{if(!ready||paused)return;const {x,y}=canvasPoint(ev.clientX,ev.clientY,canvas.getBoundingClientRect());const hit=homes.map((p,id)=>({p,id})).filter(({p,id})=>display.actors[id].hp>0&&Math.abs(x-p.x)<105&&y>p.y-270&&y<p.y+35).sort((a,b)=>Math.abs(x-a.p.x)-Math.abs(x-b.p.x))[0];if(hit)choose(hit.id);};
 window.teamBattleSnapshot=()=>({team:[...team],selecting,ready,paused,event:current?.type,activeAlly,selected:clone(selected),display:clone(display),resolved:battle?.snapshot()});
})();
