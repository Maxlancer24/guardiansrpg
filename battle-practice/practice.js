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
   this.battle=new PracticeRules.Battle(...stats);this.display=this.battle.snapshot();this.queue=[];this.current=null;this.result=null;this.state='ready';this.victory=false;this.defeat=false;this.endTime=0;this.heroStruck=-10000;this.visualTime=0;this.defensePulse=null;this.notice=null;this.aura?.clear();this.defenseFX?.clear();this.noticeText?.setVisible(false);this.focusTexts?.forEach(t=>t.setVisible(false));
   this.enemyStruck=-10000;this.restPulse=null;
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
   if(e.type==='guard'||(e.type==='attack'&&this.result.actions[1-e.actor]==='DEFEND'))this.announce(tr('EN GUARDIA','GUARDING'),e.type==='guard'?e.actor:1-e.actor,0xb3e9df);
   if(e.type==='counter')this.announce(tr('CONTRAATAQUE','COUNTERATTACK'),e.actor,0x93ffdf);
   if(e.type==='rest-start')this.announce(tr('DESCANSANDO…','RESTING…'),e.actor,0xb3e9df);
   if(e.type==='attack'&&e.actor===0){this.launching=true;this.s.shoot();this.launching=false;}
   if(e.type==='special'){this.s.special.practiceTargetDead=false;this.s.special.start();this.s.special.heading.setText(actionName.SPECIAL.toUpperCase());this.s.special.impactHandler=beat=>{const i=beat.name==='first'?0:beat.name==='second'?1:-1;if(i>=0&&e.hits[i]){this.applyHit({...e.hits[i],actor:0});this.display=e.hits[i].state;this.sync();this.s.special.practiceTargetDead=this.hp<=0;this.renderUI();return e.hits[i].amount>0;}return i===-1&&this.hp>0&&e.hits.some(h=>h.amount>0);};}
  }
  startShot(){}
  hit(i){const e=this.current;if(!e||e.type!=='attack')return;
   if(i===0&&e.outcome==='break'){this.defensePulse={at:this.visualTime,id:1,kind:'break'};this.announce(tr('GUARDIA ROTA','GUARD BREAK'),1,0xffaf83);}
   if(e.amount>0){const n=i?e.amount-Math.floor(e.amount/2):Math.floor(e.amount/2);if(n){this.number(n,1,'#ffd58c');this.enemyStruck=this.visualTime;}this.struck=this.s.clock;}
   if(i===1)this.applyCurrent();
  }
  afterShot(){this.next();}
  number(value,id,color='#f0d396'){
   const occupied=new Set(this.labels.filter(l=>l.id===id).map(l=>l.lane));let lane=0;while(occupied.has(lane))lane++;
   const offsets=[-48,48,-100,100,0],x=this.actorX(id)+offsets[lane%5],y=245-Math.floor(lane/2)*48;
   const text=this.s.add.text(x,y,String(value),{fontFamily:'Georgia',fontSize:typeof value==='number'?'32px':'23px',fontStyle:'bold',color,stroke:'#06100e',strokeThickness:6}).setOrigin(.5).setDepth(30);
   this.labels.push({text,at:this.visualTime,id,lane,x,y,dir:lane%2?1:-1});
  }
  applyHit(e){if(e.amount){this.number(e.amount,1-e.actor);if(e.actor===0)this.enemyStruck=this.visualTime;}if(e.outcome==='dodge')this.number(outcomes.dodge,1-e.actor,'#a0e9e1');this.log(`${names[e.actor]} · ${outcomes[e.outcome]}${e.crit?' · CRIT':''}: ${e.amount}.`);}
  applyCurrent(){const e=this.current;if(this.applied)return;this.applied=true;
   if(e.type==='attack'){if(e.actor===0){if(e.outcome==='dodge')this.number(outcomes.dodge,1);this.log(`${names[0]} · ${outcomes[e.outcome]}${e.crit?' · CRIT':''}: ${e.amount}.`);}else{this.applyHit(e);if(e.amount)this.heroStruck=this.s.clock;}
    if(['parry','break'].includes(e.outcome)){this.defensePulse={at:this.visualTime,id:1-e.actor,kind:e.outcome};this.announce(e.outcome==='parry'?tr('PARRY · BLOQUEO PERFECTO','PARRY · PERFECT BLOCK'):tr('GUARDIA ROTA','GUARD BREAK'),1-e.actor,e.outcome==='parry'?0x98ffe1:0xffaf83);}
   }
   else if(e.type==='counter'){this.number(e.amount,1-e.actor,'#9affdf');this.audio.play(e.actor===0?'shot':'impact');if(e.actor===1)this.heroStruck=this.s.clock;else if(e.amount>0)this.enemyStruck=this.visualTime;this.log(`${names[e.actor]} · ${tr('Contraataque de Parry','Parry counterattack')}: ${e.amount}.`);}
   else if(e.type==='special')this.log(tr('Jessie obtiene Focus para su próxima acción.','Jessie gains Focus for her next action.'));
   else if(e.type==='rest'){this.number('+'+e.heal,e.actor,'#90efd0');this.restPulse={id:e.actor,at:this.visualTime,ultra:e.state.actors[e.actor].ultra};this.announce(`${this.restPulse.ultra?'ULTRA FOCUS':'FOCUS'} · ${tr('OBTENIDO','GAINED')}`,e.actor,this.restPulse.ultra?0xffd679:0x77f5df);this.log(`${names[e.actor]} · Rest: +${e.heal} HP · ${e.state.actors[e.actor].ultra?'ULTRA FOCUS':'FOCUS'}.`);}
   else if(e.type==='interrupted'){this.restPulse=null;this.announce(tr('DESCANSO INTERRUMPIDO','REST INTERRUPTED'),e.actor,0xffaf83);this.number(tr('Interrumpido','Interrupted'),e.actor);this.log(`${names[e.actor]} · ${tr('Rest interrumpido: sin curación ni Focus nuevo.','Rest interrupted: no healing or new Focus.')}`);}
   else this.log(`${names[e.actor]} · ${e.type==='guard'?'Parry':tr('Intenta descansar','Attempts to rest')}.`);
   this.display=e.state;
   if(e.type==='attack'&&e.reflected>0){
    // The resolver already calculated this damage ONCE. Only defer its display
    // until the defender's counter animation connects; never resolve another hit.
    this.queue.unshift({type:'counter',actor:1-e.actor,amount:e.reflected,state:e.state});
    this.display=JSON.parse(JSON.stringify(e.state));this.display.actors[e.actor].hp+=e.reflected;
   }
   this.sync();this.renderUI();
  }
  renderUI(){if(!this.display)return;
   $('status-cards').innerHTML=this.display.actors.map(a=>`<article class="fighter"><h2>${names[a.id]}</h2><progress max="${a.max}" value="${a.hp}" aria-label="${names[a.id]} HP"></progress><p>${a.hp} / ${a.max} HP · STR ${a.str} / AGI ${a.agi} / CON ${a.con}</p><p>INI ${Math.round(a.meter)} · #${a.rank} · ${tr('Crítico / esquiva','Crit / dodge')} ${PracticeRules.chance(a)}%</p><p class="state">${a.ultra?'ULTRA FOCUS':a.focus?'FOCUS':tr('Sin Focus','No Focus')}${a.id===0&&a.used?' · '+tr('Especial utilizada','Special used'):''}</p></article>`).join('');
   $('round-info').textContent=this.victory?tr('Victoria · Puedes reiniciar para probar otra estrategia.','Victory · Reset to try another strategy.'):this.defeat?tr('Derrota · Puedes ajustar tus estadísticas y volver a intentar.','Defeat · Adjust your stats and try again.'):`${tr('Ronda','Round')} ${this.round} · ${this.state==='ready'?tr('Elige tu acción','Choose your action'):tr('Resolviendo','Resolving')} · ${this.display.order.map(i=>names[i]).join(' → ')}`;
  }
  update(dt){
   if(!this.battle)return;const s=this.s,home=s.targetShadow.x,heroHome=(s.scale.width<1000?280:390)-245*.64;s.hero.x=heroHome;s.target.x=home;s.target.setOrigin(.5,1050/1092);
   s.target.setTexture(this.hp<=0?'fallen':`wardenIdle${[0,1,2,3,2,1][Math.floor(s.clock/240)%6]}`);
   const e=this.current;if(e&&dt>0){this.timer+=dt;
    if((e.type==='attack'||e.type==='counter')&&e.actor===1){const t=this.timer*(e.type==='counter'?1.3:1),travel=t<650?Math.max(0,Math.min(1,(t-350)/300)):t>1550?1-Math.min(1,(t-1550)/650):1;
     s.target.x=home+(heroHome+309-home)*travel;s.target.setTexture('wardenAnim'+(t<650?2:t<900?3:t<1120?4:t<1280?5:t<1550?6:7)).setOrigin(.5,1238/1280);
     if(t>=1120&&!this.applied){this.applyCurrent();if(e.type!=='counter')this.audio.play('impact');}if(t>=2200)this.next();
    }else if(e.type==='counter'){if(this.timer>=450&&!this.applied)this.applyCurrent();if(this.timer>=1100)this.next();}
    else if(e.type==='special'){this.applyCurrent();s.special.impactHandler=null;this.next();}
    else if(e.type!=='attack'){const resting=['rest-start','rest'].includes(e.type);if(this.timer>=(resting?600:350))this.applyCurrent();if(this.timer>=(resting?1300:900))this.next();}
   }
   if((this.current?.type==='guard'&&this.current.actor===0)||(this.current?.type==='attack'&&this.current.actor===1&&this.result?.actions[0]==='DEFEND'&&this.timer<1120))s.hero.setTexture('jessieReaction1');
   if(this.current?.type==='counter'&&this.current.actor===0)s.hero.setTexture(this.timer<180?'raise1':this.timer<450?'raise2':this.timer<560?'recoil':this.timer<820?'raise2':'raise0');
   if(this.current&&['rest-start','rest'].includes(this.current.type)){
    // Existing coherent breathing drawings; feet and sprite scale remain fixed.
    const t=this.timer;if(this.current.actor===0)s.hero.setTexture(t<220?'idle5':t<420?'idle6':t<850?'blink':t<1060?'idle6':'idle5');
    else s.target.setTexture(`wardenIdle${[0,1,2,1][Math.floor(t/350)%4]}`);
   }
   if(s.clock-this.heroStruck<450)s.hero.setTexture('jessieReaction2');
   const enemyHurt=this.visualTime-this.enemyStruck;
   if(this.hp>0&&enemyHurt>=0&&enemyHurt<400){s.target.setTexture(enemyHurt<260?'hurt':'wardenIdle1').setOrigin(.5,1050/1092);if(s.effectsEnabled&&enemyHurt<85)s.target.setTint(0xffdab5);}
   if(this.victory||this.defeat){this.endTime+=dt;s.hero.setTexture(this.victory?`jessieWin${[0,1,2,1][Math.floor(this.endTime/300)%4]}`:'jessieReaction7');}
   if(this.hp<=0)s.target.setTexture('fallen').setOrigin(.5,1050/1092);
   if(s.effectsEnabled&&this.current&&['guard','rest-start','rest'].includes(this.current.type)){const x=this.current.actor?s.target.x:s.shadow.x;s.fx.lineStyle(2,this.current.type==='guard'?0xe5c789:0x7decc7,.55).strokeEllipse(x,405,105,125);}
   this.updateVisuals(dt);
   this.hud.clear();this.title.setVisible(false);this.hpText.setVisible(false);this.banner.setVisible(false);
  }
  actorX(id){const sp=this.s.special;return sp?.active?(id?sp.enemy.x:sp.actor.x+256*sp.actor.scaleX):(id?this.s.target.x:this.s.hero.x+256*this.s.hero.scaleX);}
  announce(text,id,color){this.notice={text,id,color,at:this.visualTime};}
  updateVisuals(dt){
   this.visualTime+=dt;const time=this.visualTime,s=this.s,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,fx=s.special?.active?s.special.enabled:s.effectsEnabled;
   for(const l of this.labels){const k=Math.min(1,(time-l.at)/1500),jump=reduced?0:Math.sin(k*Math.PI)*34;
    l.text.setPosition(l.x+(reduced?0:l.dir*16*k),l.y-58*k-jump).setAlpha(k<.65?1:(1-k)/.35).setScale(reduced?1:1+.18*Math.max(0,1-k*5));
   }
   this.labels=this.labels.filter(l=>{if(time-l.at>=1500){l.text.destroy();return false;}return true;});
   if(!this.aura)return;this.aura.clear();this.defenseFX.clear();
   for(const a of this.display.actors){const x=this.actorX(a.id),on=a.hp>0&&(a.focus||a.ultra),color=a.ultra?0xffd679:0x77f5df;
    this.focusTexts[a.id].setText(a.ultra?'ULTRA FOCUS':'FOCUS').setColor(a.ultra?'#ffda82':'#8affdf').setPosition(x,180).setVisible(on);
    if(!on||!fx)continue;const pulse=reduced?1:.8+.2*Math.sin(time*.003);
    this.aura.fillStyle(color,.035*pulse).fillEllipse(x,353,a.ultra?175:145,245);
    this.aura.lineStyle(a.ultra?3:2,color,.55*pulse).strokeEllipse(x,467,a.ultra?158:135,25);
    this.aura.lineStyle(1,color,.22*pulse).strokeEllipse(x,467,a.ultra?182:154,35);
    if(!reduced)for(let i=0;i<10;i++){const k=(time/1700+i/10)%1,side=i%2?1:-1;this.aura.fillStyle(color,.6*Math.sin(k*Math.PI)).fillCircle(x+side*(48+Math.sin(k*5+i)*18),457-k*215,a.ultra?2.4:1.6);}
   }
   const e=this.current;
   const resting=e&&['rest-start','rest'].includes(e.type),restAge=this.restPulse?time-this.restPulse.at:9999;
   if(fx&&(resting||restAge<1050)){
    const success=restAge<1050,id=success?this.restPulse.id:e.actor,x=this.actorX(id),g=this.aura,color=success?(this.restPulse.ultra?0xffd679:0x77f5df):0xb3dfdf;
    const k=success?Math.min(1,restAge/1050):Math.min(1,this.timer/1300),alpha=success?1-k:.45;
    g.lineStyle(success?3:2,color,alpha).strokeEllipse(x,467,success?95+k*115:150-k*45,success?20+k*18:26);
    g.fillStyle(color,.07*alpha).fillEllipse(x,363,115,205);
    if(!reduced)for(let i=0;i<12;i++){const a=i*Math.PI/6,r=success?25+k*65:65*(1-k*.65),y=success?443-k*180:423-Math.sin(a)*40;g.fillStyle(color,.65*alpha).fillCircle(x+Math.cos(a)*r,y,success?3:2);}
   }
   const guarded=e?.type==='attack'&&this.result?.actions[1-e.actor]==='DEFEND'&&this.display.actors[1-e.actor].hp>0&&(!this.applied||e.outcome==='parry');
   const pulse=this.defensePulse,age=pulse?time-pulse.at:9999;
   if(fx&&(guarded||age<900)){
    const id=age<900?pulse.id:1-e.actor,x=this.actorX(id)+(id?-45:45),broken=age<900&&pulse.kind==='break',alpha=broken?Math.max(0,1-age/900):.6;
    const g=this.defenseFX;g.fillStyle(broken?0xffa072:0x8cf5df,.10*alpha).fillEllipse(x,345,82,155);g.lineStyle(3,broken?0xffa072:0x98ffe3,alpha).strokeEllipse(x,345,82,155);
    if(age<900){for(let i=0;i<9;i++){const angle=i*2.4,r=18+(reduced?0:age/900)*(broken?105:65);g.lineStyle(2,broken?0xffb880:0xdbfff2,(1-age/900)*.8);g.lineBetween(x+Math.cos(angle)*r,345+Math.sin(angle)*r,x+Math.cos(angle)*(r+12),345+Math.sin(angle)*(r+12));}
     if(broken)g.lineStyle(3,0x081714,alpha).lineBetween(x-22,298,x+16,333).lineBetween(x+16,333,x-14,371).lineBetween(x-14,371,x+23,407);
    }
   }
   if(e?.type==='counter'&&e.actor===0&&this.timer>=450&&this.timer<600&&fx){const m=s.muzzle(),k=1-(this.timer-450)/150;this.defenseFX.lineStyle(3,0xb3ffe1,k).lineBetween(m.x,m.y,s.target.x-20,m.y);this.defenseFX.fillStyle(0xfff1c4,k).fillCircle(m.x,m.y,9*k);s.target.setTint(0xb3ffe1);}
   if(this.notice&&time-this.notice.at<1400){const n=this.notice;this.noticeText.setText(n.text).setColor('#'+n.color.toString(16).padStart(6,'0')).setPosition(s.scale.width/2,110).setVisible(true).setAlpha(Math.min(1,(1400-(time-n.at))/300));}else this.noticeText.setVisible(false);
  }
 };
 window.PracticeController={attach(s){
  s.special.practiceMode=true;
  const f=s.feedback;f.aura=s.add.graphics().setDepth(9);f.defenseFX=s.add.graphics().setDepth(14);f.noticeText=s.add.text(0,110,'',{fontFamily:'Arial',fontSize:'24px',fontStyle:'bold',stroke:'#06100e',strokeThickness:6}).setOrigin(.5).setDepth(31);f.focusTexts=[0,1].map(()=>s.add.text(0,180,'',{fontFamily:'Arial',fontSize:'16px',fontStyle:'bold',stroke:'#06100e',strokeThickness:4}).setOrigin(.5).setDepth(15));
  const specialUpdate=s.special.update.bind(s.special);s.special.update=(dt,enabled)=>{specialUpdate(dt,enabled);f.updateVisuals(dt);};
  const original=s.shoot.bind(s);s.shoot=()=>s.feedback.launching?original():s.feedback.submit('ATTACK');s.startSpecial=()=>s.feedback.submit('SPECIAL');
  const drawEffects=s.drawEffects.bind(s);s.drawEffects=()=>{const age=s.hitAge;if(s.feedback.current?.type==='attack'&&s.feedback.current.actor===0&&!s.feedback.current.amount)s.hitAge=9999;drawEffects();s.hitAge=age;};
  const controls=s.controls.bind(s);s.controls=()=>{controls();const f=s.feedback,paused=$('pause').textContent===tr('Continuar','Resume');for(const id of ['shoot','parry','rest','special'])$(id).disabled=paused||f.state!=='ready'||!!s.special.active||(id==='special'&&f.battle.actors[0].used);$('shoot').textContent=tr('Atacar · Dos disparos','Attack · Two shots');$('special').textContent=actionName.SPECIAL;};
  $('special').title=tr('Una vez por combate · Ignora Parry · Puede esquivarse · Otorga Focus','Once per battle · Bypasses Parry · Can be dodged · Grants Focus');
  s.controls();window.practiceSnapshot=()=>({state:s.feedback.state,display:s.feedback.display,battle:s.feedback.battle.snapshot(),current:s.feedback.current?.type,queue:s.feedback.queue.length});
 }};
})();
