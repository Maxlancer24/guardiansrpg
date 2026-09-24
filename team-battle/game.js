/* Separate team demo renderer. Resolved events drive presentation; canvas never rolls damage. */
(() => {
 'use strict';
 const es=document.documentElement.lang==='es',tr=(a,b)=>es?a:b,$=id=>document.getElementById(id);
 const names=['Jessie','Garrick',tr('Guardián de escarcha','Frost Warden'),tr('Guardián de ceniza','Ash Warden')];
 const actions={ATTACK:tr('Atacar','Attack'),DEFEND:'Parry',REST:tr('Descansar','Rest'),SPECIAL:tr('Especial','Special')};
 const outcomes={hit:tr('Impacto','Hit'),break:tr('Guardia rota','Guard break'),parry:'PARRY',dodge:tr('Esquiva','Dodge'),ultra:'ULTRA FOCUS',vulnerable:tr('Descanso interrumpido','Rest interrupted')};
 const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),imgs={},src={},root='/assets/demo-battle/';
 const homes=[{x:220,y:410},{x:425,y:500},{x:865,y:410},{x:1075,y:500}];
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},lerp=(a,b,t)=>a+(b-a)*t;
 let battle,display,queue=[],current=null,result=null,t=0,clock=0,last=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,ready=false,loaded=false,labels=[],bursts=[],struck={},deadAt={},eventBeat=0,variant=0,selected={},enemyPlans={},serial=0;
 for(const key of ['idle','attack','guard','hurt','rest','victory','defeat','portrait'])src['g'+key]=root+'garrick-v1/'+key+'.png';
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
 function reset(){serial++;stopSounds();battle=new TeamRules.Battle();display=battle.snapshot();queue=[];current=null;result=null;t=0;clock=0;labels=[];bursts=[];struck={};deadAt={};variant=0;ready=true;selected={};enemyPlans=battle.intents();$('log').replaceChildren();$('result').hidden=true;ui();}
 function ui(){
  $('cards').innerHTML=display.actors.map(a=>`<article class="card ${a.hp<=0?'dead':''}"><h2>${names[a.id]}</h2><progress max="${a.max}" value="${a.hp}" aria-label="${names[a.id]} HP"></progress><p>${a.hp} / ${a.max} HP · STR ${a.str} · AGI ${a.agi} · CON ${a.con}</p><p>${a.hp<=0?tr('Fuera de combate','Defeated'):a.ultra?'ULTRA FOCUS':a.focus?'FOCUS':tr('Sin Focus','No Focus')} · #${a.rank}</p><p>${a.id<2?(a.used?tr('Especial utilizada','Special used'):tr('Especial disponible','Special ready')):(ready&&enemyPlans[a.id]?actions[enemyPlans[a.id].action]+(enemyPlans[a.id].action==='ATTACK'?' → '+names[enemyPlans[a.id].target]:''):'')}</p></article>`).join('');
  $('confirm').disabled=!loaded||!ready||paused||battle.winner()!==null;
  if(ready){$('plans').replaceChildren();for(const a of battle.living(0)){
   const p=selected[a.id]||{action:'ATTACK',target:battle.living(1)[0]?.id};if(a.used&&p.action==='SPECIAL')p.action='ATTACK';if(!battle.living(1).some(b=>b.id===Number(p.target)))p.target=battle.living(1)[0]?.id;selected[a.id]=p;
   const box=document.createElement('div');box.className='choice';const title=document.createElement('h2');title.textContent=names[a.id];box.append(title);
   const al=document.createElement('label');al.textContent=tr('Acción','Action');const select=document.createElement('select');select.setAttribute('aria-label',names[a.id]+' '+tr('acción','action'));
   for(const [value,label] of Object.entries(actions)){const o=new Option(value==='SPECIAL'?(a.id===1?'No One Else':tr('Fuego cruzado','Crossfire')):label,value);o.disabled=value==='SPECIAL'&&a.used;select.add(o);}select.value=p.action;al.append(select);box.append(al);
   const tl=document.createElement('label');tl.textContent=tr('Rival','Opponent');const target=document.createElement('select');target.setAttribute('aria-label',names[a.id]+' '+tr('objetivo','target'));for(const b of battle.living(1))target.add(new Option(names[b.id],b.id));target.value=p.target;target.disabled=paused||!['ATTACK','SPECIAL'].includes(p.action)||a.id===1&&p.action==='SPECIAL';tl.append(target);box.append(tl);
   select.disabled=paused;select.onchange=()=>{p.action=select.value;target.disabled=!['ATTACK','SPECIAL'].includes(p.action)||a.id===1&&p.action==='SPECIAL';};target.onchange=()=>p.target=Number(target.value);
   if(a.id===1){const hint=document.createElement('p');hint.textContent=tr('Su especial protege a TODO el equipo, sin elegir aliado.','His special protects the WHOLE team, no ally selection.');box.append(hint);}$('plans').append(box);
  }}else $('plans').querySelectorAll('select').forEach(s=>s.disabled=true);
  if(ready)status(tr('Ronda ','Round ')+display.round+' · '+tr('Elige las acciones de tu equipo.','Choose your team’s actions.'));
 }
 function combine(events){const out=[];for(let i=0;i<events.length;i++){const e=events[i];if(e.type==='special'){
   const hits=[];while(events[i+1]?.special)hits.push(events[++i]);let final=hits.at(-1)?.state||e.state;if(events[i+1]?.type==='focus')final=events[++i].state;out.push({...e,type:'cinematic',hits,state:final});
  }else out.push(e);}return out;}
 function eventDuration(e){return e.type==='protection'?2900:e.type==='cinematic'?4300:['attack','counter'].includes(e.type)?e.actor===0?(e.type==='counter'?1400:3150):2100:['rest','rest-start'].includes(e.type)?1250:e.type==='round-end'?350:750;}
 function impacts(e){if(e.type==='cinematic'){
  const beats=[];e.hits.forEach((h,i)=>{const n=Math.floor(h.amount/2);beats.push({at:1450+i*650,target:h.target,amount:n,outcome:h.outcome});beats.push({at:3350,target:h.target,amount:h.amount-n,outcome:h.outcome});});return beats.sort((a,b)=>a.at-b.at);
 }if(!['attack','counter'].includes(e.type))return [];
 if(e.actor===0&&e.type==='attack'){const n=Math.floor(e.amount/2);return [{at:1980,target:e.target,amount:n,outcome:e.outcome},{at:2280,target:e.target,amount:e.amount-n,outcome:e.outcome}];}
 return [{at:e.actor===0?505:1120,target:e.target,amount:e.amount,outcome:e.outcome}];}
 function begin(){current=queue.shift();t=0;eventBeat=0;if(!current){display=clone(result.next);ready=!result.finished;enemyPlans=battle.intents();if(result.finished){$('result').hidden=false;$('result').textContent=result.winner===0?tr('VICTORIA · Jessie y Garrick vencieron.','VICTORY · Jessie and Garrick prevailed.'):tr('DERROTA · Puedes probar otra estrategia.','DEFEAT · Try another strategy.');status($('result').textContent);}ui();return;}
  current.duration=eventDuration(current);current.beats=impacts(current);if(current.type==='attack'&&current.actor===0){current.variant=variant;variant=1-variant;}
  if(current.type==='protection')display.actors[1].guard=true;
  const n=current.actor===null?'':names[current.actor];status(n+' · '+(current.type==='protection'?tr('Protege a todo el equipo','Protects the whole team'):current.type==='cinematic'?tr('Fuego cruzado','Crossfire'):current.type==='counter'?tr('Contraataque','Counterattack'):actions[current.type.toUpperCase()]||tr('Resolviendo','Resolving')));
 }
 function submit(){if(!ready||paused)return;try{result=battle.resolve(selected,enemyPlans);ready=false;queue=combine(result.events);ui();begin();}catch(e){status(tr('Revisa las acciones y objetivos.','Check actions and targets.'));console.error(e);}}
 function commit(){
  const e=current;for(const a of e.state.actors)if(a.hp<=0&&display.actors[a.id].hp>0)deadAt[a.id]=clock;
  display=clone(e.state);if(e.type==='rest')labels.push({id:e.actor,value:'+'+e.heal,at:clock,color:'#9ff5d4'});
  if(e.type==='attack'||e.type==='counter')log(names[e.actor]+' → '+names[e.target]+' · '+(e.type==='counter'?tr('Contraataque','Counter'):outcomes[e.outcome])+' '+e.amount+(e.protected!==null&&e.protected!==undefined?' · '+tr('Garrick cubre a ','Garrick covers ')+names[e.protected]:'')+(e.lastStand?' · 1 HP':''));
  else if(e.type==='cinematic')log('Jessie · '+tr('Especial: ','Special: ')+e.hits.map(h=>names[h.target]+' '+h.amount).join(' / '));
  else if(e.type!=='round-end')log(names[e.actor]+' · '+({protection:tr('Protección para todo el equipo','Whole-team protection'),guard:'Parry',rest:tr('Recupera vida y Focus','Recovers HP and Focus'),'rest-start':tr('Intenta descansar','Attempts to rest'),interrupted:tr('Descanso interrumpido','Rest interrupted')}[e.type]||e.type));
  ui();begin();
 }
 function beat(b){const a=display.actors[b.target];if(b.amount){a.hp=Math.max(0,a.hp-b.amount);struck[b.target]=clock;if(!a.hp)deadAt[b.target]=clock;}
  const hit=b.outcome!=='dodge';bursts.push({id:b.target,at:clock,parry:b.outcome==='parry',miss:!hit});
  const lane=labels.filter(l=>l.id===b.target&&clock-l.at<1300).length;
  labels.push({id:b.target,value:b.amount||outcomes[b.outcome]||'',at:clock,lane,color:b.outcome==='parry'?'#a6ffdf':'#ffdf9f'});
  if(hit)sound(b.outcome==='parry'?'parry':current.actor===0?'shot':'axe');else if(current.actor===0)sound('shot');ui();
 }
 function txt(s,x,y,size=18,color='#fff0d7',align='center'){ctx.fillStyle=color;ctx.font='600 '+size+'px Georgia';ctx.textAlign=align;ctx.fillText(s,x,y);}
 function drawFrame(key,r,x,y,anchor,floor,scale){const im=imgs[key];if(!im)return;ctx.drawImage(im,...r,x-anchor*scale,y-floor*scale,r[2]*scale,r[3]*scale);}
 function whole(key,x,y,scale=.46,anchor=225,floor=525){const im=imgs[key];drawFrame(key,[0,0,im.width,im.height],x,y,anchor,floor,scale);}
 const guardR=[[0,0,560,520],[560,0,490,520],[1050,0,486,520],[0,520,560,504],[560,520,550,504],[1110,520,426,504]],guardA=[275,224,252,291,212,171],guardF=[516,516,516,473,470,474];
 function garrick(mode,f,p){
  if(mode==='idle'){const row=Math.floor(f/3);drawFrame('gidle',[f%3*512,row*512,512,512],p.x,p.y,270,row?501:504,.48);}
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
 function pose(id,p){
  const a=display.actors[id],e=current,age=clock-(struck[id]??-99999),death=clock-(deadAt[id]??clock),guard=a.guard||(result?.plans[id]?.action==='DEFEND'&&!ready);
  let mode='idle',f=[0,1,2,1,0,5,4,5][Math.floor(clock/360)%8];
  if(a.hp<=0){mode='defeat';f=death<250?0:death<650?1:death<1080?2:3;}
  else if(!current&&result?.winner===a.team){mode='victory';f=clock%4800>4650?3:[1,2,1,2][Math.floor(clock/450)%4];}
  else if(age>=0&&age<600){mode='hurt';f=age<170?1:age<370?2:3;}
  else if(e?.type==='protection'&&id===1){mode='guard';f=1;}
  else if(e&&e.actor===id&&['rest','rest-start'].includes(e.type)){mode='rest';f=t<220?0:t<600?1:t<1020?2:3;}
  else if(e&&e.actor===id&&['attack','counter'].includes(e.type)){mode='attack';f=t<400?0:t<750?1:t<1120?2:t<1280?3:t<1500?4:5;}
  else if(guard){mode='guard';f=1;const pulse=bursts.findLast(b=>b.id===id&&b.parry&&clock-b.at<360);if(pulse)f=clock-pulse.at<180?3:4;}
  if(id===1){garrick(mode,f,p);return;}
  if(id===0){
   if(['guard','hurt','rest','defeat'].includes(mode)){jAtlas(mode,f,p);return;}
   if(mode==='victory'){whole('jw'+(clock%4800>4650?3:[0,1,2,1][Math.floor(clock/300)%4]),p.x,p.y);return;}
   if(e?.type==='cinematic'){const q=t<1000?0:t<1300?1:t<1700?2:t<2050?3:t<2600?4:t<3350?4:t<3550?5:t<3900?6:7;whole('js'+q,p.x,p.y);return;}
   if(mode==='attack'){
    let key;if(e.type==='counter')key=t<180?'jr1':t<505?'jr2':t<620?'jrecoil':t<900?'jr2':'jr0';
    else if(t<120)key='ji0';else if(t<1245)key=e.variant?(t<700?'jp1':t<1050?'jo1':'jo2'):'jp'+[0,1,2,3,2,1][Math.floor(t/170)%6];
    else if(e.variant)key=t<1925?'jo3':t<2005?'jo5':t<2225?'jo3':t<2305?'jo5':t<2500?'jo3':t<2740?'jo6':'jo1';
    else key=t<1485?'jr1':t<1925?'jr2':t<2005?'jrecoil':t<2225?'jr2':t<2305?'jrecoil':t<2500?'jr2':t<2740?'jr1':'jr0';whole(key,p.x,p.y);return;
   }
   whole(clock%4800>4650?'jblink':'ji'+[0,7,6,5,6,7][Math.floor(clock/300)%6],p.x,p.y);return;
  }
  // Palette is applied to every pose, preserving source silhouettes and animation.
  ctx.save();ctx.filter=id===2?'sepia(.45) saturate(1.7) hue-rotate(155deg)':'sepia(.65) saturate(1.8) hue-rotate(330deg)';
  let key='wi'+[0,1,2,3,2,1][Math.floor(clock/250)%6],floor=1050;
  if(mode==='defeat')key=death<240?'whurt':death<1080?'wkneel':'wfallen';
  else if(mode==='hurt')key='whurt';
  else if(mode==='attack'){key='wa'+(t<650?2:t<900?3:t<1120?4:t<1280?5:t<1550?6:7);floor=1238;}
  whole(key,p.x,p.y,.235,720.5,floor);ctx.restore();
 }
 function positions(){const ps=homes.map(p=>({...p})),e=current;if(!e)return ps;
  if(e.protected!==null&&e.protected!==undefined){const a=ps[e.protected],g=ps[e.target],u=ease(t/450)*(1-ease((t-1600)/500));g.x=lerp(g.x,a.x+125,u);g.y=lerp(g.y,a.y+12,u);}
  if(['attack','counter'].includes(e.type)&&e.actor!==0){const a=ps[e.actor],b=ps[e.target],u=ease((t-300)/350)*(1-ease((t-1550)/550));a.x=lerp(a.x,b.x+(e.actor<2?-125:135),u);a.y=lerp(a.y,b.y,u);}
  if(e.type==='cinematic'){ps[0].x+=70*ease((t-900)/350)*(1-ease((t-3600)/650));}
  return ps;
 }
 function glow(p,color,alpha){const g=ctx.createRadialGradient(p.x,p.y-115,10,p.x,p.y-115,135);g.addColorStop(0,color+alpha+')');g.addColorStop(1,color+'0)');ctx.fillStyle=g;ctx.fillRect(p.x-140,p.y-260,280,290);}
 function effects(ps){if(!$('effects').checked)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  for(const a of display.actors){if(a.hp<=0)continue;if(a.focus||a.ultra)glow(ps[a.id],a.ultra?'rgba(255,212,108,':'rgba(100,255,220,',.15);if(display.actors[1].guard&&a.team===0)glow(ps[a.id],'rgba(215,237,162,',.15);}
  for(const b of bursts){const age=clock-b.at;if(age>550||b.miss)continue;const p=ps[b.id],x=p.x+(b.id<2?25:-25),y=p.y-135,k=1-age/550,color=b.parry?'#b5ffe4':'#ffdb9b';ctx.save();ctx.globalAlpha=k;glow(p,b.parry?'rgba(145,255,220,':'rgba(255,207,130,',.25*k);
   if(!reduced){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x-50,y-85);ctx.quadraticCurveTo(x+7,y-8,x+52,y+82);ctx.quadraticCurveTo(x-12,y+8,x-50,y-85);ctx.fill();for(let i=0;i<16;i++){const a=i*2.399,r=12+age*(.08+i%4*.025);ctx.fillStyle=i%2?color:'#fff9e5';ctx.beginPath();ctx.arc(x+Math.cos(a)*r,y+Math.sin(a)*r,1+i%3,0,7);ctx.fill();}}ctx.restore();
  }
  if(current?.actor===0){for(const b of current.beats){const age=t-b.at;if(age<0||age>90)continue;const p=ps[0],m={x:p.x+95,y:p.y-170},target=ps[b.target];ctx.save();ctx.globalAlpha=1-age/90;ctx.strokeStyle='#ffe1a4';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(target.x,target.y-145);ctx.stroke();glow({x:m.x,y:m.y+115},'rgba(255,221,155,',.5);ctx.restore();}}
 }
 function cutin(){const e=current;if(!e||!['protection','cinematic'].includes(e.type))return;const span=e.type==='protection'?2400:950;if(t>span)return;const alpha=Math.min(clamp(t/180),clamp((span-t)/300)),id=e.actor;
  ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle='rgba(3,12,13,.88)';ctx.fillRect(0,0,1280,650);ctx.fillStyle='#213b31';ctx.beginPath();ctx.moveTo(0,80);ctx.lineTo(1280,140);ctx.lineTo(1280,530);ctx.lineTo(0,580);ctx.fill();ctx.save();ctx.beginPath();ctx.rect(0,80,660,500);ctx.clip();const im=imgs[id===1?'gportrait':'jportrait'],scale=600/im.width;ctx.drawImage(im,60,35,im.width*scale,im.height*scale);ctx.restore();txt(names[id].toUpperCase(),930,235,25,'#a9dac1');txt(id===1?'NO ONE ELSE':tr('FUEGO CRUZADO','CROSSFIRE'),930,302,id===1?40:32);txt(id===1?tr('Nadie más. Esta vez no.','No one else. Not this time.'):tr('Dos problemas. Dos balas.','Two problems. Two bullets.'),930,357,22);if(id===1)txt(tr('PROTECCIÓN DE TODO EL EQUIPO','WHOLE-TEAM PROTECTION'),930,415,18,'#d5d79d');ctx.restore();
 }
 function render(){ctx.clearRect(0,0,1280,650);const bg=imgs.arena,s=Math.max(1280/bg.width,650/bg.height);ctx.drawImage(bg,(1280-bg.width*s)/2,(650-bg.height*s)/2,bg.width*s,bg.height*s);ctx.fillStyle='rgba(3,12,14,.2)';ctx.fillRect(0,0,1280,650);
  const ps=positions();[0,1,2,3].sort((a,b)=>ps[a].y-ps[b].y).forEach(id=>{const p=ps[id];ctx.fillStyle='rgba(0,8,6,.35)';ctx.beginPath();ctx.ellipse(p.x,p.y,49,8,0,0,7);ctx.fill();pose(id,p);txt(names[id],p.x,p.y+25,16,id===2?'#b9e0ff':id===3?'#ffd1af':'#f5e5bd');});effects(ps);
  if($('effects').checked&&!matchMedia('(prefers-reduced-motion: reduce)').matches)for(let i=0;i<18;i++){ctx.fillStyle='rgba(195,237,152,'+(.2+.3*Math.sin(clock*.001+i)**2)+')';ctx.beginPath();ctx.arc(50+(i*79)%1200+Math.sin(clock*.0004+i)*12,110+(i*43)%380,1.4,0,7);ctx.fill();}
  for(const l of labels){const k=clamp((clock-l.at)/1300),p=ps[l.id],lane=l.lane||0,dx=[-38,38,-80,80,0][lane%5];ctx.save();ctx.globalAlpha=1-k;txt(String(l.value),p.x+dx,p.y-250-40*Math.floor(lane/2)-50*k,22,l.color);ctx.restore();}
  cutin();
 }
 function tick(now){const dt=last?Math.min(now-last,80)*1.5:0;last=now;if(!paused){clock+=dt;if(current){t+=dt;while(eventBeat<current.beats.length&&t>=current.beats[eventBeat].at)beat(current.beats[eventBeat++]);if(t>=current.duration)commit();}labels=labels.filter(x=>clock-x.at<1300);bursts=bursts.filter(x=>clock-x.at<550);}render();requestAnimationFrame(tick);}
 $('confirm').onclick=submit;$('reset').onclick=()=>{if(loaded)reset();};$('pause').onclick=()=>{paused=!paused;if(paused)stopSounds();$('pause').textContent=paused?tr('Continuar','Resume'):tr('Pausar','Pause');ui();};$('sound').onchange=()=>{if(!$('sound').checked)stopSounds();};
 Promise.all(Object.entries(src).map(([key,path])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{imgs[key]=im;resolve();};im.onerror=()=>reject(Error(path));im.src=path;}))).then(()=>{loaded=true;reset();$('pause').disabled=false;$('reset').disabled=false;$('pause').textContent=paused?tr('Continuar','Resume'):tr('Pausar','Pause');requestAnimationFrame(tick);}).catch(e=>{status(tr('No se pudo cargar un recurso. Recarga la página.','An asset could not be loaded. Reload the page.'));console.error(e);});
 window.teamBattleSnapshot=()=>({ready,paused,event:current?.type,display:clone(display),resolved:battle?.snapshot()});
})();
