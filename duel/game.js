/* Standalone 1v1 selector. Rules resolve first; animation never rolls combat. */
(() => {
'use strict';
const es=document.documentElement.lang==='es',tr=(a,b)=>es?a:b,$=id=>document.getElementById(id);
const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),imgs={},src={},root='/assets/demo-battle/';
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},lerp=(a,b,t)=>a+(b-a)*t,clone=x=>JSON.parse(JSON.stringify(x));
 for(const key of ['idle','attack','guard','hurt','rest','victory','defeat','portrait'])src['g'+key]=root+'garrick-v1/'+key+'.png';
 src.gmotion=root+'garrick-motion-v1/motion.png';
 src.jcutin=root+'jessie-cutin-v3.png';src.gcutin=root+'garrick-cutin-v3.png';
 Object.assign(src,{arena:root+'black-lotus-arena.png',jportrait:root+'jessie-cutin.png',jguard:root+'jessie-defense-v1/guard.png',jhurt:root+'jessie-defense-v1/hurt.png',jrest:root+'jessie-lifecycle-v1/rest.png',jdefeat:root+'jessie-lifecycle-v1/defeat.png'});
 for(const i of [0,5,6,7])src['ji'+i]=root+'jessie-idle-shot-v1/idle-'+String(i).padStart(2,'0')+'.png';
 for(let i=0;i<4;i++){src['jp'+i]=root+'jessie-prep-v5/prep-'+i+'.png';src['jw'+i]=root+'ambient-loops-v1/jessie-'+i+'.png';src['wi'+i]=root+'ambient-loops-v1/warden-'+i+'.png';}
 for(let i=0;i<3;i++)src['jr'+i]=root+'jessie-polish-v2/raise-'+i+'.png';
 for(const i of [1,2,3,5,6])src['jo'+i]=root+'jessie-other-hand-v1/frame-'+i+'.png';
 for(let i=0;i<8;i++){src['wa'+i]=root+'combat-reactions-v1/warden-'+i+'.png';src['js'+i]=root+'jessie-special-v1/pose-'+i+'.png';}
 for(const key of ['hurt','kneel','fallen'])src['w'+key]=root+'warden-feedback-v1/'+key+'.png';
 src.jrecoil=root+'jessie-double-v4/recoil.png';src.jblink=root+'jessie-acting-v3/blink.png';src.jwinentry=root+'combat-reactions-v1/jessie-4.png';

for(const k of [...Object.keys(ZOE_PACK.specs),'cutin','projectile'])src['z'+k]=root+'zoe-v1/'+k+'.png';
const heroes={
 jessie:{name:'Jessie',portrait:src.jcutin,skill:tr('Fuego cruzado','Crossfire'),description:tr('Dos pistolas, un ataque. Presión ofensiva y Focus.','Two pistols, one attack. Offensive pressure and Focus.'),help:tr('Especial: dos golpes al 100% contra el rival. Ignora Parry, puede esquivarse y otorga Focus.','Special: two 100% strikes against the opponent. Bypasses Parry, can be dodged and grants Focus.')},
 garrick:{name:'Garrick',portrait:src.gcutin,skill:'No One Else',description:tr('Resiste, bloquea y contraataca.','Endure, block and counterattack.'),help:tr('Especial: activa protección antes de la iniciativa, usa Parry y reduce el daño recibido un 35% hasta fin de ronda. Un golpe letal lo deja en 1 HP y termina la protección. En 1v1 se protege a sí mismo.','Special: arms protection before initiative, uses Parry and reduces incoming damage by 35% until round end. A lethal hit leaves him at 1 HP and ends protection. In 1v1 he protects himself.')},
 zoe:{name:'Zoe',portrait:src.zcutin,skill:'I pay attention',description:tr('Velocidad, cuchillos y lectura del rival.','Speed, knives and reading the opponent.'),help:tr('Especial: consume su Focus, elimina el Focus enemigo, impide sus críticos esta ronda y otorga +20% de esquiva al equipo (a Zoe en 1v1). Después realiza un golpe al 75%, directo como en el bot.','Special: consumes her Focus, removes enemy Focus, prevents enemy criticals this round and grants +20% team dodge (Zoe in 1v1). Then makes one direct 75% strike, as in the bot.')}
};
const actions={ATTACK:tr('Atacar','Attack'),DEFEND:'Parry',REST:tr('Descansar','Rest'),SPECIAL:tr('Especial','Special')};
const outcomes={hit:tr('Impacto','Hit'),break:tr('Guardia rota','Guard break'),parry:'PARRY',dodge:tr('Esquiva','Dodge'),ultra:'ULTRA FOCUS',vulnerable:tr('Rest interrumpido','Rest interrupted')};
const homes=[{x:345,y:460},{x:925,y:460}],music=new PracticeMusic(es),voices=new Set();
let key='zoe',battle,display,result,current=null,queue=[],t=0,clock=0,last=0,ready=false,active=false,paused=false,loading=false,choice=null,intent='ATTACK',labels=[],bursts=[],struck={},deadAt={},guardStarted={},eventBeat=0,variant=0,rafStarted=false,serial=0,finishedAt=null;
function sound(kind){if(!$('sound').checked)return;const a=new Audio(root+'audio-v1/'+kind+'.wav');a.volume=.2;voices.add(a);a.onended=()=>voices.delete(a);a.play().catch(()=>voices.delete(a))}
function stopSounds(){for(const a of voices)a.pause();voices.clear()}
function log(s){const li=document.createElement('li');li.textContent=s;$('log').append(li);while($('log').children.length>100)$('log').firstElementChild.remove()}
function status(s){$('status').textContent=s}
function name(id){return id===0?heroes[key].name:tr('Guardián Hollow','Hollow Warden')}
function button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;return b}
function loadAssets(keys){return Promise.all(keys.filter(k=>!imgs[k]).map(k=>new Promise((ok,no)=>{const im=new Image();im.onload=()=>{imgs[k]=im;ok()};im.onerror=()=>no(Error(src[k]));im.src=src[k]})))}
for(const [id,h]of Object.entries(heroes)){const b=button('',()=>start(id));b.className='hero-choice';const im=document.createElement('img');im.src=h.portrait;im.alt=h.name;b.append(im);const title=document.createElement('h2');title.textContent=h.name;b.append(title);for(const [text,cls]of [[h.description,''],[Object.entries(DuelRules.heroes[id]).map(([k,v])=>k.toUpperCase()+' '+v).join(' · '),'stats'],[h.skill,''],[tr('Elegir →','Choose →'),'select-label']]){const p=document.createElement('p');p.textContent=text;p.className=cls;b.append(p)}$('hero-list').append(b)}
async function start(id){if(loading)return;loading=true;$('selection-status').textContent=tr('Preparando a ','Preparing ')+heroes[id].name+'…';try{const prefix=id==='garrick'?'g':id==='zoe'?'z':'j';await loadAssets(Object.keys(src).filter(k=>k==='arena'||k.startsWith('w')||k.startsWith(prefix)));key=id;active=true;paused=matchMedia('(prefers-reduced-motion: reduce)').matches;$('select-screen').hidden=true;$('game-screen').hidden=false;reset();if(!rafStarted){rafStarted=true;requestAnimationFrame(tick)}$('battle-stage').scrollIntoView?.({block:'start'});$('select-actor').focus({preventScroll:true});}catch(e){$('selection-status').textContent=tr('No se pudo cargar el personaje. Vuelve a elegirlo para reintentar.','Could not load the hero. Choose again to retry.');console.error(e)}finally{loading=false}}
function reset(){finishedAt=null;serial++;stopSounds();battle=new DuelRules.Battle(key);display=battle.snapshot();result=null;current=null;queue=[];t=0;clock=0;last=0;labels=[];bursts=[];struck={};deadAt={};guardStarted={};eventBeat=0;variant=0;ready=true;choice=null;intent=battle.chooseEnemy();$('log').replaceChildren();$('result').hidden=true;$('result-panel').hidden=true;$('feedback-panel').hidden=true;$('hero-heading').textContent=heroes[key].name;$('hero-help').textContent=heroes[key].help;$('feedback-mode').textContent='1v1 · '+heroes[key].name;ui();}
function ui(){
 if(!display)return;
 const done=Boolean(result?.finished&&!current&&!queue.length);
 $('cards').replaceChildren();
 for(const a of display.actors){
  const card=document.createElement('article');card.className='fighter';
  const state=a.hp<=0?tr('Caído','Down'):a.guard?tr('Protección','Protection'):a.ultra?'Ultra Focus':a.focus?'Focus':tr('Sin bonificación','No bonus');
  const portrait=a.id===0?heroes[key].portrait:src.wi0;
  card.innerHTML='<details><summary><img src="'+portrait+'" alt=""><span>'+name(a.id)+'</span><small>STR · AGI · CON ⌄</small></summary><p>STR '+a.str+' · AGI '+a.agi+' · CON '+a.con+'</p></details><progress max="'+a.max+'" value="'+a.hp+'" aria-label="'+name(a.id)+' HP"></progress><p>'+a.hp+' / '+a.max+' HP <span class="state">'+state+'</span></p>';
  $('cards').append(card);
 }
 $('round-label').textContent=tr('Ronda ','Round ')+display.round+' · '+(done?tr('Combate finalizado','Battle complete'):ready?tr('Tu decisión','Your decision'):tr('Resolviendo las acciones','Resolving actions'));
 $('enemy-intent').textContent=done?tr('Combate finalizado','Battle complete'):ready?tr('El guardián prepara: ','The warden prepares: ')+actions[intent]:tr('Observa el resultado de tu decisión.','Watch your decision play out.');
 $('turn-tip').textContent=done?'':intent==='ATTACK'?tr('Parry puede bloquear y contraatacar. Descansar ahora te expone a más daño.','Parry can block and counter. Resting now exposes you to extra damage.'):intent==='DEFEND'?tr('El rival se protege. Puedes aprovechar para descansar.','The opponent is guarding. You can take the opportunity to rest.'):tr('Atacar interrumpe la recuperación del rival.','Attacking interrupts the opponent’s recovery.');
 $('pause').textContent=paused?tr('Continuar','Resume'):tr('Pausar','Pause');
 $('plans').replaceChildren();const row=document.createElement('div');row.className='action-picker';
 for(const [v,label]of Object.entries(actions)){
  const b=button(({ATTACK:'✦',DEFEND:'◈',REST:'❋',SPECIAL:'✧'})[v]+' '+label,()=>{if(!ready||paused||(v==='SPECIAL'&&display.actors[0].used))return;choice=v;ui();$('confirm-action').focus({preventScroll:true})});b.disabled=!ready||paused||(v==='SPECIAL'&&display.actors[0].used);
  b.className=v===choice?'selected-action':'';b.setAttribute('aria-pressed',String(v===choice));b.id='action-'+v.toLowerCase();
  b.title=v==='SPECIAL'?heroes[key].help:label;row.append(b);
 }
 $('plans').append(row);
 $('plans').hidden=!ready||paused||done;
 $('select-actor').hidden=!ready||paused||done;
 $('select-actor').setAttribute('aria-label',tr('Elegir acción de ','Choose action for ')+name(0));
 const offensive=choice==='ATTACK'||(choice==='SPECIAL'&&key!=='garrick');
 $('select-target').hidden=!ready||paused||done||!offensive;
 $('select-target').setAttribute('aria-pressed',String(offensive));
 $('planned-action').textContent=choice?name(0)+' → '+actions[choice]+' → '+name(offensive?1:0):tr('Toca tu personaje y elige una acción.','Tap your hero and choose an action.');
 $('confirm-action').disabled=!ready||paused||!choice||(choice==='SPECIAL'&&display.actors[0].used);
 $('confirm-action').hidden=done||(!ready&&!paused);
 $('scene-replay').hidden=!done;
 $('battle-stage').setAttribute('data-resolving',String(!ready&&!done));

 $('action-availability').textContent=done?tr('Combate finalizado. Puedes volver a jugar.','Battle complete. You can play again.'):paused?tr('En pausa. Pulsa «Continuar».','Paused. Select “Resume”.'):!ready?tr('Acciones en curso…','Actions in progress…'):display.actors[0].used?tr('Elige tu próxima acción. Especial ya utilizada.','Choose your next action. Special already used.'):tr('Elige una acción. Especial disponible una vez por combate.','Choose an action. Special available once per battle.');
 $('result-panel').hidden=!done;
 if(done){
  $('result-heading').textContent=result.winner===0?tr('El bosque vuelve a respirar.','The forest breathes again.'):tr('Toda derrota enseña algo.','Every defeat teaches something.');
  $('result-summary').textContent=heroes[key].name+' · '+tr('Rondas: ','Rounds: ')+display.round+' · HP '+display.actors[0].hp+' / '+display.actors[0].max;
 }
}
function combine(events){const out=[];for(let i=0;i<events.length;i++){const e=events[i];if(['special','awareness'].includes(e.type)){const hits=[];while(events[i+1]?.special)hits.push(events[++i]);let final=hits.at(-1)?.state||e.state;if(events[i+1]?.type==='focus')final=events[++i].state;out.push({...e,type:e.type==='awareness'?'zoe-special':'cinematic',hits,state:final})}else out.push(e)}return out}
function eventDuration(e){if(e.type==='cinematic')return 5090;if(e.type==='zoe-special')return 4350;if(e.type==='protection')return 2900;if(['attack','counter'].includes(e.type))return e.actor?2100:key==='garrick'?2300:key==='zoe'?1900:e.type==='counter'?1400:3150;return ['rest','rest-start'].includes(e.type)?1500:e.type==='round-end'?350:750}
function impacts(e){if(e.type==='cinematic'){const beats=[];e.hits.forEach((h,i)=>{const n=Math.floor(h.amount/2);beats.push({at:2240+i*650,target:h.target,amount:n,outcome:h.outcome},{at:4140,target:h.target,amount:h.amount-n,outcome:h.outcome})});return beats.sort((a,b)=>a.at-b.at)}if(e.type==='zoe-special')return e.hits.map(h=>({...h,at:3520}));if(!['attack','counter'].includes(e.type))return [];if(e.actor===0&&key==='jessie'&&e.type==='attack'){const n=Math.floor(e.amount/2);return [{at:1980,target:e.target,amount:n,outcome:e.outcome},{at:2280,target:e.target,amount:e.amount-n,outcome:e.outcome}]}return [{at:e.actor?1120:key==='zoe'?1040:key==='garrick'?1120:505,target:e.target,amount:e.amount,outcome:e.outcome}]}
function begin(){current=queue.shift();t=0;eventBeat=0;if(!current){display=clone(result.next);ready=!result.finished;choice=null;intent=battle.chooseEnemy();if(result.finished){finishedAt=clock;$('result').hidden=false;$('result').textContent=result.winner===0?tr('VICTORIA','VICTORY'):tr('DERROTA','DEFEAT');status($('result').textContent)}ui();return}current.duration=eventDuration(current);current.beats=impacts(current);if(current.type==='attack'&&current.actor===0&&key==='jessie'){current.variant=variant;variant=1-variant}if(current.type==='protection'){display.actors[0].guard=true;guardStarted[0]=clock}if(current.type==='zoe-special')sound('parry');status((current.actor===null?'':name(current.actor)+' · ')+(['cinematic','zoe-special','protection'].includes(current.type)?heroes[key].skill:current.type==='counter'?tr('Contraataque','Counterattack'):actions[current.type.toUpperCase()]||tr('Resolviendo','Resolving')));ui()}
function submit(){if(!ready||paused||!choice||(choice==='SPECIAL'&&display.actors[0].used))return;try{result=battle.resolve(choice,intent);guardStarted={};result.actions.forEach((a,i)=>{if(a==='DEFEND')guardStarted[i]=clock});ready=false;queue=combine(result.events);ui();begin()}catch(e){status(tr('No se pudo resolver la acción. Reinicia el duelo.','Could not resolve action. Restart the duel.'));console.error(e)}}
function commit(){const e=current;for(const a of e.state.actors)if(a.hp<=0&&display.actors[a.id].hp>0)deadAt[a.id]=clock;display=clone(e.state);if(e.type==='rest')labels.push({id:e.actor,value:'+'+e.heal,at:clock,color:'#9ff5d4'});if(['attack','counter'].includes(e.type))log(name(e.actor)+' → '+name(e.target)+' · '+(e.type==='counter'?tr('Contraataque','Counterattack'):outcomes[e.outcome])+' '+e.amount+(e.lastStand?' · 1 HP':''));else if(e.hits)log(heroes[key].name+' · '+heroes[key].skill+' · '+e.hits.reduce((s,h)=>s+h.amount,0));else if(e.type!=='round-end')log(name(e.actor)+' · '+({guard:'Parry',protection:heroes[key].skill,rest:tr('Vida y Focus','HP and Focus'),'rest-start':tr('Descansando','Resting'),interrupted:tr('Descanso interrumpido','Rest interrupted')}[e.type]||e.type));ui();begin()}
function beat(b){const a=display.actors[b.target];if(b.amount){a.hp=Math.max(0,a.hp-b.amount);struck[b.target]=clock;if(!a.hp)deadAt[b.target]=clock}bursts.push({id:b.target,at:clock,parry:b.outcome==='parry',miss:b.outcome==='dodge'});const lane=labels.filter(l=>l.id===b.target&&clock-l.at<1300).length;labels.push({id:b.target,value:b.amount||outcomes[b.outcome]||'',at:clock,lane,color:b.outcome==='parry'?'#a6ffdf':'#ffdf9f'});sound(b.outcome==='parry'?'parry':current.actor===0&&key==='jessie'?'shot':'axe');ui()}
const enemyPalette=null,paletteImage=k=>imgs[k];
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
  if(time<1450)return {mode:'attack',f:time<730?0:time<850?1:time<1120?2:time<1280?3:4};
  if(time<2090)return {mode:'motion',f:time<1600?3:time<1950?4:5};
  if(time<2230)return {mode:'attack',f:5};
  return {mode:'idle',f:0};
 }
 function garrickTravel(time,home,target,reduced=false){
  const outward=ease((time-180)/470),back=ease((time-1450)/500),u=outward*(1-back);
  const groundY=lerp(home.y,target.y,u),lift=reduced?0:Math.sin(Math.PI*clamp((time-1450)/500))*48;
  return {x:lerp(home.x,target.x-125,u),y:groundY-lift,groundY,lift};
 }


function sceneTime(){return current?.type==='cinematic'?(t<80?t:t<1660?80+(t-80)/2:t-790):t}
// Anatomical scale relative to idle, not the bounding box of a bent pose.
// Keep both axes identical and retain each frame's ground/contact anchor.
const zoeScale={idle:1,attack:.90,parry:.96,hurt:.96,rest:1,victory:1,defeat:1,motion:1,special:.97};
function zScale(mode){return 245/ZOE_PACK.specs[mode].height*(zoeScale[mode]||1)}
function zFrame(mode,f,p){const spec=ZOE_PACK.specs[mode],im=imgs['z'+mode];if(!spec||!im)return;const w=im.width/3,split=spec.split||im.height/2,row=f<3?0:1,y=row?split:0,h=row?im.height-split:split,s=zScale(mode);drawFrame('z'+mode,[f%3*w,y,w,h],p.x,p.y,spec.anchors[f],spec.feet[f],s)}
function zAttack(time){return time<220?0:time<660?1:time<920?2:time<1130?3:time<1390?4:5}
function pose(id,p){const a=display.actors[id],e=current,age=clock-(struck[id]??-99999),death=clock-(deadAt[id]??clock),guard=a.guard||(result?.actions[id]==='DEFEND'&&!ready);
let mode='idle',f=[0,1,2,1,0,5,4,5][Math.floor(clock/360)%8];
if(a.hp<=0){mode='defeat';f=death<250?0:death<650?1:death<1080?2:3}
else if(!current&&result?.winner===a.team){mode='victory';f=DuelAnimations.victoryFrame(key,clock-(finishedAt??clock))}
else if(age>=0&&age<600){mode='hurt';f=age<170?1:age<370?2:age<470?3:0}
else if(e&&e.actor===id&&['rest','rest-start'].includes(e.type)){mode='rest';f=t<220?0:t<600?1:t<1020?2:3}
else if(e&&e.actor===id&&['attack','counter'].includes(e.type)){mode='attack';f=t<400?0:t<750?1:t<1120?2:t<1280?3:t<1500?4:5}
else if(guard||(e?.type==='protection'&&id===0)){mode='guard';const pulse=bursts.findLast(b=>b.id===id&&b.parry&&clock-b.at<360);f=guardFrame(key==='garrick'&&id===0?1:0,clock-(guardStarted[id]??clock),pulse?clock-pulse.at:Infinity);if(e?.type==='round-end'){f=0;if(t>=220)mode='idle'}}
if(id===1){let img='wi'+[0,1,2,3,2,1][Math.floor(clock/250)%6],floor=1050;if(mode==='defeat')img=death<240?'whurt':death<1080?'wkneel':'wfallen';else if(mode==='hurt')img='whurt';else if(mode==='attack'){img='wa'+(t<650?2:t<900?3:t<1120?4:t<1280?5:t<1550?6:7);floor=1238}whole(img,p.x,p.y,.235,720.5,floor);return}
if(key==='garrick'){if(mode==='attack'){const phase=garrickAttackPose(t);garrick(phase.mode,phase.f,p)}else garrick(mode,f,p);return}
if(key==='zoe'){
 if(mode==='defeat'){zFrame('defeat',Math.min(5,Math.floor(death/210)),p);return}
 if(mode==='hurt'){zFrame('hurt',age<90?0:age<210?1:age<330?2:age<440?3:age<520?4:5,p);return}
 if(e?.type==='zoe-special'){if(t<2480)zFrame('special',t<250?0:t<800?1:t<1800?2:t<2100?3:t<2310?4:5,p);else zFrame('attack',zAttack(t-2480),p);return}
 if(mode==='attack'){zFrame('attack',zAttack(t),p);return}
 if(mode==='guard'){const pulse=bursts.findLast(b=>b.id===0&&b.parry&&clock-b.at<300),elapsed=clock-(guardStarted[0]??clock);zFrame('parry',e?.type==='round-end'?5:pulse?4:elapsed<180?0:elapsed<360?1:2+Math.floor(elapsed/340)%2,p);return}
 if(mode==='rest'){zFrame('rest',t<200?0:t<450?1:t<780?2:t<1120?3:t<1300?4:5,p);return}
 if(mode==='victory'){zFrame('victory',f,p);return}
 zFrame('idle',clock%4800>4640?5:[0,1,2,1,0,3,4,3][Math.floor(clock/300)%8],p);return
}
  if(key==='jessie'){
   if(['guard','hurt','rest','defeat'].includes(mode)){jAtlas(mode,f,p);return;}
   if(mode==='victory'){whole('jw'+f,p.x,p.y);return;}
   if(e?.type==='cinematic'){const st=sceneTime(),q=st<1000?0:st<1300?1:st<1700?2:st<2050?3:st<3435?4:st<3550?5:st<3900?6:7;whole('js'+q,p.x,p.y);return;}
   if(mode==='attack'){
    let key;if(e.type==='counter')key=t<180?'jr1':t<505?'jr2':t<620?'jrecoil':t<900?'jr2':'jr0';
    else if(t<120)key='ji0';else if(t<1245)key=e.variant?(t<700?'jp1':t<1050?'jo1':'jo2'):'jp'+[0,1,2,3,2,1][Math.floor(t/170)%6];
    else if(e.variant)key=t<1925?'jo3':t<2005?'jo5':t<2225?'jo3':t<2305?'jo5':t<2500?'jo3':t<2740?'jo6':'jo1';
    else key=t<1485?'jr1':t<1925?'jr2':t<2005?'jrecoil':t<2225?'jr2':t<2305?'jrecoil':t<2500?'jr2':t<2740?'jr1':'jr0';whole(key,p.x,p.y);return;
   }
   whole(clock%4800>4650?'jblink':'ji'+[0,7,6,5,6,7][Math.floor(clock/300)%6],p.x,p.y);return;
  }

}
function positions(){const ps=homes.map(p=>({...p})),e=current;if(!e)return ps;
if(['attack','counter'].includes(e.type)){const a=ps[e.actor],b=ps[e.target];if(e.actor===0&&key==='garrick')ps[0]=garrickTravel(t,a,b,matchMedia('(prefers-reduced-motion: reduce)').matches);else if(e.actor===1){const u=ease((t-300)/350)*(1-ease((t-1550)/550));a.x=lerp(a.x,b.x+135,u);a.y=lerp(a.y,b.y,u)}}
if(e.type==='cinematic'){const st=sceneTime();ps[0].x+=70*ease((st-900)/350)*(1-ease((st-3600)/650))}return ps}
function txt(s,x,y,size=18,color='#fff0d7',align='center'){ctx.fillStyle=color;ctx.font='600 '+size+'px Georgia';ctx.textAlign=align;ctx.fillText(s,x,y)}
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
  const strength=Math.max(ease(st/240)*(1-ease((st-650)/300))*.8,ease((st-2700)/580)*(1-ease((st-3350)/240))),p=ps[0];
  ctx.save();ctx.translate(p.x,p.y-115);ctx.scale(1,1.45);glow({x:0,y:115},'rgba(104,228,210,',.3*strength);glow({x:0,y:115},'rgba(255,213,141,',.15*strength);ctx.restore();
  if(st>=1000&&st<1400){const k=(st-1000)/400;for(let i=3;i>0;i--){ctx.save();ctx.globalAlpha=Math.sin(k*Math.PI)*.15/i;whole('js1',p.x-i*19,p.y);ctx.restore();}}
 }
 function specialEffects(ps){if(!cinematicEnabled())return;const st=sceneTime(),p=ps[0],charge=ease((st-2700)/580)*(1-ease((st-3350)/240));
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

function effects(ps){if(!$('effects').checked)return;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
for(const a of display.actors){if(a.hp<=0)continue;if(a.focus||a.ultra)glow(ps[a.id],a.ultra?'rgba(255,212,108,':'rgba(100,255,220,',.15);if(a.guard||a.dodgeBonus)glow(ps[a.id],'rgba(160,237,183,',.18)}
if(current?.type==='zoe-special'){const p=ps[0];glow(p,'rgba(116,249,209,',.18*(1+Math.sin(t*.007)));if(t>1800&&t<2350)glow(ps[1],'rgba(120,211,192,',.15)}
if(current&&['rest','rest-start'].includes(current.type))glow(ps[current.actor],'rgba(110,248,210,',.12+.05*Math.sin(t*.005));
for(const b of bursts){const age=clock-b.at;if(age>550||b.miss)continue;const p=ps[b.id],x=p.x+(b.id===0?25:-25),y=p.y-135,k=1-age/550;ctx.save();ctx.globalAlpha=k;glow(p,b.parry?'rgba(145,255,220,':'rgba(255,207,130,',.25*k);if(!reduced){ctx.fillStyle=b.parry?'#b5ffe4':'#ffdb9b';ctx.beginPath();ctx.moveTo(x-50,y-85);ctx.quadraticCurveTo(x+7,y-8,x+52,y+82);ctx.quadraticCurveTo(x-12,y+8,x-50,y-85);ctx.fill();for(let i=0;i<16;i++){const a=i*2.399,r=12+age*(.08+i%4*.025);ctx.beginPath();ctx.arc(x+Math.cos(a)*r,y+Math.sin(a)*r,1+i%3,0,7);ctx.fill()}}ctx.restore()}
if(current?.actor===0&&key==='jessie'&&current.type!=='cinematic'){for(const b of current.beats){const age=t-b.at;if(age<0||age>90)continue;const p=ps[0],m=normalShotMuzzle(p,current.variant===1,true);ctx.save();ctx.globalAlpha=1-age/90;ctx.strokeStyle='#ffe1a4';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(ps[b.target].x,ps[b.target].y-145);ctx.stroke();glow({x:m.x,y:m.y+115},'rgba(255,221,155,',.5);ctx.restore()}}
specialEffects(ps)}
function projectile(ps){
 if(key!=='zoe'||!current||!['attack','counter','zoe-special'].includes(current.type)||current.actor!==0)return;
 const release=current.type==='zoe-special'?3400:920,age=t-release;if(age<0||age>120)return;
 const p=ps[0],q=ps[1],k=clamp(age/120),spec=ZOE_PACK.specs.attack,s=zScale('attack');
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
// Dedicated landscape illustrations, all authored to Zoe's approved composition.
function cutin(){if(!current||!['protection','cinematic','zoe-special'].includes(current.type))return;const ct=80+(t-80)/2;if(t<80||ct>870)return;const alpha=ease((ct-80)/130)*(1-ease((ct-670)/200)),slide=-90*(1-ease((ct-80)/160)),y=130,h=285;ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle='#071423f5';ctx.fillRect(0,y,1280,h);ctx.strokeStyle='#e7bb68';ctx.lineWidth=2;ctx.strokeRect(0,y,1280,h);ctx.save();ctx.beginPath();ctx.rect(0,y,720,h);ctx.clip();const im=imgs[key==='zoe'?'zcutin':key==='garrick'?'gcutin':'jcutin'],scale=798.72/im.width;ctx.drawImage(im,50+slide,65,im.width*scale,im.height*scale);ctx.restore();txt(heroes[key].name.toUpperCase(),940,y+115,42,'#ffe1a3');txt(heroes[key].skill,940,y+164,23,'#98f4df');ctx.restore()}
function render(){if(!display)return;ctx.clearRect(0,0,1280,650);const bg=imgs.arena,s=Math.max(1280/bg.width,650/bg.height);ctx.drawImage(bg,(1280-bg.width*s)/2,(650-bg.height*s)/2,bg.width*s,bg.height*s);ctx.fillStyle='#03100c33';ctx.fillRect(0,0,1280,650);const ps=positions();specialBackdrop(ps);if(current?.type==='zoe-special'&&$('effects').checked){ctx.fillStyle='rgba(2,9,18,'+(.65*ease(t/300)*(1-ease((t-3700)/600)))+')';ctx.fillRect(0,0,1280,650)}
for(const id of [0,1]){const p=ps[id],lift=p.lift||0;ctx.fillStyle='#00080655';ctx.beginPath();ctx.ellipse(p.x,p.groundY??p.y,49-lift*.25,8-lift*.04,0,0,7);ctx.fill();pose(id,p);txt(name(id),p.x,(p.groundY??p.y)+27,16)}effects(ps);projectile(ps);
if($('effects').checked&&!matchMedia('(prefers-reduced-motion: reduce)').matches)for(let i=0;i<18;i++){ctx.fillStyle='rgba(195,237,152,'+(.2+.3*Math.sin(clock*.001+i)**2)+')';ctx.beginPath();ctx.arc(50+(i*79)%1200+Math.sin(clock*.0004+i)*12,110+(i*43)%380,1.4,0,7);ctx.fill()}
for(const l of labels){const k=clamp((clock-l.at)/1300),p=ps[l.id],lane=l.lane||0;ctx.save();ctx.globalAlpha=1-k;txt(String(l.value),p.x+[-38,38,-80,80,0][lane%5],p.y-250-40*Math.floor(lane/2)-50*k,22,l.color);ctx.restore()}cutin()}
function tick(now){const dt=last?Math.min(now-last,80)*1.5:0;last=now;if(active){if(!paused){clock+=dt;if(current){t+=dt;while(eventBeat<current.beats.length&&t>=current.beats[eventBeat].at)beat(current.beats[eventBeat++]);if(t>=current.duration)commit()}labels=labels.filter(x=>clock-x.at<1300);bursts=bursts.filter(x=>clock-x.at<550)}render()}requestAnimationFrame(tick)}
function changeHero(){serial++;active=false;ready=false;current=null;queue=[];stopSounds();$('game-screen').hidden=true;$('select-screen').hidden=false;$('selection-status').textContent='';$('hero-list').querySelector('button')?.focus({preventScroll:true})}
$('replay').onclick=()=>{paused=false;reset()};$('give-feedback').onclick=()=>{$('feedback-panel').hidden=false;$('feedback-text').focus()};$('reset').onclick=()=>{if(active)reset()};$('change-hero').onclick=changeHero;$('pause').onclick=()=>{paused=!paused;if(paused)stopSounds();ui()};$('sound').onchange=()=>{if(!$('sound').checked)stopSounds()};
$('confirm-action').onclick=submit;
$('select-actor').onclick=()=>{if(ready&&!paused){$('plans').hidden=false;$('plans').firstElementChild?.firstElementChild?.focus({preventScroll:true})}};
$('select-target').onclick=()=>{if(ready&&!paused)$('confirm-action').focus({preventScroll:true})};
$('scene-replay').onclick=()=>{paused=false;reset()};
window.duelSnapshot=()=>({key,ready,paused,event:current?.type,display:clone(display),resolved:battle?.snapshot(),result:result?.winner});
DemoFeedbackForm.attach({get victory(){return result?.winner===0},get defeat(){return result?.winner===1},get round(){return display?.round||0}},es,()=> '1v1-'+key);
})();
