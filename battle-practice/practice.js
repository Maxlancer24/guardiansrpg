/* Presentation adapter for the local rules-only duel. No calls to the bot/DB. */
(() => {
 const $=id=>document.getElementById(id),es=document.documentElement.lang==='es';
 const tr=(a,b)=>es?a:b,names=['Jessie',tr('Guardián Hollow','Hollow Warden')];
 const actionName={ATTACK:tr('Ataque','Attack'),DEFEND:'Parry',REST:'Rest',SPECIAL:tr('Dos problemas. Dos balas.','Two problems. Two bullets.')};
 const outcomes={hit:tr('Impacto','Hit'),dodge:tr('Esquiva','Dodge'),parry:tr('Bloqueo perfecto · Contraataque','Perfect block · Counter'),break:tr('Ruptura de guardia','Guard break'),ultra:'ULTRA FOCUS',vulnerable:tr('Vulnerable al descansar','Vulnerable while resting')};
 const defaults=[{str:10,agi:12,con:10},{str:12,agi:8,con:12}];
 const Base=window.PracticeFeedback;
 window.PracticeFeedback=class extends Base{
  constructor(s,lang){super(s,lang);this.heroTitle=s.add.text(0,0,'');this.heroHpText=s.add.text(0,0,'');this.movingShadow=s.add.ellipse(0,470,140,16,0x050a09,.4).setVisible(false);this.buildUI();this.reset();}
  buildUI(){
   $('builds').innerHTML=defaults.map((a,id)=>`<fieldset><legend>${names[id]}</legend>${['str','agi','con'].map(k=>`<label>${k.toUpperCase()}<input id="stat-${id}-${k}" type="number" min="0" max="60" step="1" value="${a[k]}" aria-label="${names[id]} ${k.toUpperCase()}"></label>`).join('')}</fieldset>`).join('');
   $('rules-help').textContent=tr('HP = 50 + CON × 15. Parry = CON × 5 + STR; contraataque = CON × 3 + STR. Rest exitoso recupera 20 + CON × 3 y otorga Focus (×2 daño base); descansar con Focus otorga Ultra Focus. AGI afecta iniciativa, crítico, esquiva, daño y mitigación. Un ataque dirigido interrumpe Rest incluso si se esquiva.','HP = 50 + CON × 15. Parry = CON × 5 + STR; counter = CON × 3 + STR. Successful Rest heals 20 + CON × 3 and grants Focus (×2 base damage); resting with Focus grants Ultra Focus. AGI affects initiative, criticals, dodge, damage and mitigation. A targeted attack interrupts Rest even if dodged.');
   $('action-help').textContent=tr('Elige una acción por ronda. Atacar: dos disparos visuales, un solo ataque. Parry: bloquea y contraataca si tu defensa alcanza. Rest: recupera y concentra, pero recibir ataques lo interrumpe. Especial: dos tiros reales, ignora Parry, puede fallar por esquiva y deja Focus; una vez por combate.','Choose one action per round. Attack: two visual shots, one attack. Parry: blocks and counters if defense is sufficient. Rest: recover and focus, but incoming attacks interrupt it. Special: two real shots, bypasses Parry, can be dodged, grants Focus; once per battle.');
   $('apply-build').onclick=()=>{for(const el of $('builds').querySelectorAll('input'))if(!el.reportValidity())return;this.s.reset();};
   $('parry').onclick=()=>this.submit('DEFEND');$('rest').onclick=()=>this.submit('REST');
  }
  reset(){
   super.reset();if(!$('stat-0-str'))return;
   const stats=defaults.map((_,i)=>Object.fromEntries(['str','agi','con'].map(k=>[k,Number($(`stat-${i}-${k}`).value)])));
   this.battle=new PracticeRules.Battle(...stats);this.display=this.battle.snapshot();this.queue=[];this.current=null;this.result=null;this.state='ready';this.victory=false;this.defeat=false;this.endTime=0;this.heroStruck=-10000;
   if(this.s.special){this.s.special.impactHandler=null;this.s.special.practiceTargetDead=false;}
   this.sync();$('battle-log').replaceChildren();this.log(tr('Elige tu acción. La iniciativa determina quién actúa primero.','Choose your action. Initiative determines who acts first.'));this.renderUI();
  }
  busy(){return this.launching?false:this.state!=='ready';}
  sync(){if(!this.display)return;this.heroHp=this.display.actors[0].hp;this.hp=this.display.actors[1].hp;this.round=this.display.round;}
  log(text){const li=document.createElement('li');li.textContent=text;$('battle-log').append(li);while($('battle-log').children.length>100)$('battle-log').firstChild.remove();$('battle-log').scrollTop=$('battle-log').scrollHeight;}
  submit(action){if(this.state!=='ready'||this.s.special.active||$('pause').textContent===tr('Continuar','Resume'))return;if(action==='SPECIAL'&&this.battle.actors[0].used)return;
   this.result=this.battle.resolve(action);this.queue=[...this.result.events];this.state='resolving';this.log(`${tr('Ronda','Round')} ${this.round}: Jessie — ${actionName[action]}; ${names[1]} — ${actionName[this.result.actions[1]]}.`);this.next();this.renderUI();
  }
  next(){
   this.current=this.queue.shift();this.timer=0;this.applied=false;
   if(!this.current){this.display=this.result.next;this.sync();this.state=this.result.finished?(this.result.winner===0?'victory':'defeat'):'ready';this.victory=this.state==='victory';this.defeat=this.state==='defeat';if(this.result.finished)this.log(this.victory?tr('Victoria de Jessie.','Jessie wins.'):tr('Derrota. Prueba otra estrategia.','Defeat. Try another strategy.'));this.renderUI();return;}
   this.state='resolving';const e=this.current;
   if(e.type==='attack'&&e.actor===0){this.launching=true;this.s.shoot();this.launching=false;}
   if(e.type==='special'){this.s.special.practiceTargetDead=false;this.s.special.start();this.s.special.heading.setText(actionName.SPECIAL.toUpperCase());this.s.special.impactHandler=beat=>{const i=beat.name==='first'?0:beat.name==='second'?1:-1;if(i>=0&&e.hits[i]){this.applyHit({...e.hits[i],actor:0});this.display=e.hits[i].state;this.sync();this.s.special.practiceTargetDead=this.hp<=0;this.renderUI();return e.hits[i].amount>0;}return i===-1&&this.hp>0&&e.hits.some(h=>h.amount>0);};}
  }
  startShot(){}
  hit(i){const e=this.current;if(!e||e.type!=='attack')return;
   if(e.amount>0){const n=i?e.amount-Math.floor(e.amount/2):Math.floor(e.amount/2);if(n)this.number(n,1,'#ffd58c');this.struck=this.s.clock;}
   if(i===1)this.applyCurrent();
  }
  afterShot(){this.next();}
  number(value,id,color='#f0d396'){const x=id?this.s.targetShadow.x:this.s.shadow.x;const text=this.s.add.text(x,245,String(value),{fontFamily:'Georgia',fontSize:'24px',color,stroke:'#071410',strokeThickness:4}).setOrigin(.5).setDepth(30);this.labels.push({text,at:this.s.clock});}
  applyHit(e){if(e.amount)this.number(e.amount,1-e.actor);if(e.reflected)this.number(e.reflected,e.actor,'#9affdf');if(e.outcome==='dodge')this.number(outcomes.dodge,1-e.actor,'#a0e9e1');this.log(`${names[e.actor]} · ${outcomes[e.outcome]}${e.crit?' · CRIT':''}: ${e.amount}${e.reflected?` / ${tr('contraataque','counter')} ${e.reflected}`:''}.`);}
  applyCurrent(){const e=this.current;if(this.applied)return;this.applied=true;
   if(e.type==='attack'){if(e.actor===0){if(e.reflected)this.number(e.reflected,0,'#9affdf');if(e.outcome==='dodge')this.number(outcomes.dodge,1);this.log(`${names[0]} · ${outcomes[e.outcome]}${e.crit?' · CRIT':''}: ${e.amount}${e.reflected?` / ${tr('contraataque','counter')} ${e.reflected}`:''}.`);}else{this.applyHit(e);if(e.amount)this.heroStruck=this.s.clock;}}
   else if(e.type==='special')this.log(tr('Jessie obtiene Focus para su próxima acción.','Jessie gains Focus for her next action.'));
   else if(e.type==='rest'){this.number('+'+e.heal,e.actor,'#90efd0');this.log(`${names[e.actor]} · Rest: +${e.heal} HP · ${e.state.actors[e.actor].ultra?'ULTRA FOCUS':'FOCUS'}.`);}
   else if(e.type==='interrupted'){this.number(tr('Interrumpido','Interrupted'),e.actor);this.log(`${names[e.actor]} · ${tr('Rest interrumpido: sin curación ni Focus nuevo.','Rest interrupted: no healing or new Focus.')}`);}
   else this.log(`${names[e.actor]} · ${e.type==='guard'?'Parry':tr('Intenta descansar','Attempts to rest')}.`);
   this.display=e.state;this.sync();this.renderUI();
  }
  renderUI(){if(!this.display)return;
   $('status-cards').innerHTML=this.display.actors.map(a=>`<article class="fighter"><h2>${names[a.id]}</h2><progress max="${a.max}" value="${a.hp}" aria-label="${names[a.id]} HP"></progress><p>${a.hp} / ${a.max} HP · STR ${a.str} / AGI ${a.agi} / CON ${a.con}</p><p>INI ${Math.round(a.meter)} · #${a.rank} · ${tr('Crítico / esquiva','Crit / dodge')} ${PracticeRules.chance(a)}%</p><p class="state">${a.ultra?'ULTRA FOCUS':a.focus?'FOCUS':tr('Sin Focus','No Focus')}${a.id===0&&a.used?' · '+tr('Especial utilizada','Special used'):''}</p></article>`).join('');
   $('round-info').textContent=this.victory?tr('Victoria · Puedes reiniciar para probar otra estrategia.','Victory · Reset to try another strategy.'):this.defeat?tr('Derrota · Puedes ajustar tus estadísticas y volver a intentar.','Defeat · Adjust your stats and try again.'):`${tr('Ronda','Round')} ${this.round} · ${this.state==='ready'?tr('Elige tu acción','Choose your action'):tr('Resolviendo','Resolving')} · ${this.display.order.map(i=>names[i]).join(' → ')}`;
  }
  update(dt){
   if(!this.battle)return;const s=this.s,home=s.targetShadow.x,heroHome=(s.scale.width<1000?280:390)-245*.64;s.hero.x=heroHome;s.target.x=home;s.target.setOrigin(.5,1050/1092);
   s.target.setTexture(this.hp<=0?'fallen':`wardenIdle${[0,1,2,3,2,1][Math.floor(s.clock/240)%6]}`);
   const e=this.current;if(e&&dt>0){this.timer+=dt;
    if(e.type==='attack'&&e.actor===1){const t=this.timer,travel=t<650?Math.max(0,Math.min(1,(t-350)/300)):t>1550?1-Math.min(1,(t-1550)/650):1;
     s.target.x=home+(heroHome+309-home)*travel;s.target.setTexture('wardenAnim'+(t<650?2:t<900?3:t<1120?4:t<1280?5:t<1550?6:7)).setOrigin(.5,1238/1280);
     if(t>=1120&&!this.applied){this.applyCurrent();this.audio.play('impact');}if(t>=2200)this.next();
    }else if(e.type==='special'){this.applyCurrent();s.special.impactHandler=null;this.next();}
    else if(e.type!=='attack'){if(this.timer>=350)this.applyCurrent();if(this.timer>=900)this.next();}
   }
   if((this.current?.type==='guard'&&this.current.actor===0)||(this.current?.type==='attack'&&this.current.actor===1&&this.result?.actions[0]==='DEFEND'&&this.timer<1120))s.hero.setTexture('jessieReaction1');
   if(s.clock-this.heroStruck<450)s.hero.setTexture('jessieReaction2');
   if(this.victory||this.defeat){this.endTime+=dt;s.hero.setTexture(this.victory?`jessieWin${[0,1,2,1][Math.floor(this.endTime/300)%4]}`:'jessieReaction7');}
   if(this.hp<=0)s.target.setTexture('fallen').setOrigin(.5,1050/1092);
   if(s.effectsEnabled&&this.current&&['guard','rest-start','rest'].includes(this.current.type)){const x=this.current.actor?s.target.x:s.shadow.x;s.fx.lineStyle(2,this.current.type==='guard'?0xe5c789:0x7decc7,.55).strokeEllipse(x,405,105,125);}
   for(const l of this.labels){const k=(s.clock-l.at)/1100;l.text.setY(245-30*k).setAlpha(Math.max(0,1-k));}this.labels=this.labels.filter(l=>{if(s.clock-l.at>1100){l.text.destroy();return false;}return true;});
   this.hud.clear();this.title.setVisible(false);this.hpText.setVisible(false);this.banner.setVisible(false);
  }
 };
 window.PracticeController={attach(s){
  s.special.practiceMode=true;
  const original=s.shoot.bind(s);s.shoot=()=>s.feedback.launching?original():s.feedback.submit('ATTACK');s.startSpecial=()=>s.feedback.submit('SPECIAL');
  const drawEffects=s.drawEffects.bind(s);s.drawEffects=()=>{const age=s.hitAge;if(s.feedback.current?.type==='attack'&&s.feedback.current.actor===0&&!s.feedback.current.amount)s.hitAge=9999;drawEffects();s.hitAge=age;};
  const controls=s.controls.bind(s);s.controls=()=>{controls();const f=s.feedback,paused=$('pause').textContent===tr('Continuar','Resume');for(const id of ['shoot','parry','rest','special'])$(id).disabled=paused||f.state!=='ready'||!!s.special.active||(id==='special'&&f.battle.actors[0].used);$('shoot').textContent=tr('Atacar · Dos disparos','Attack · Two shots');$('special').textContent=actionName.SPECIAL;};
  $('special').title=tr('Una vez por combate · Ignora Parry · Puede esquivarse · Otorga Focus','Once per battle · Bypasses Parry · Can be dodged · Grants Focus');
  s.controls();window.practiceSnapshot=()=>({state:s.feedback.state,display:s.feedback.display,battle:s.feedback.battle.snapshot(),current:s.feedback.current?.type,queue:s.feedback.queue.length});
 }};
})();
