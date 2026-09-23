/* Player-facing adapter. Loaded only on /play/ and /es/play/. */
(() => {
 const $=id=>document.getElementById(id),es=document.documentElement.lang==='es',tr=(a,b)=>es?a:b;
 const names={ATTACK:tr('Atacar','Attack'),DEFEND:'Parry',REST:tr('Descansar','Rest'),SPECIAL:tr('Especial','Special')};
 const Base=window.PracticeFeedback;
 window.PracticeFeedback=class extends Base {
  buildUI(){super.buildUI();[GuardiansDemo.hero,GuardiansDemo.enemy].forEach((a,i)=>Object.entries(a).forEach(([k,v])=>$(`stat-${i}-${k}`).value=v));}
  reset(){super.reset();if(!this.battle)return;this.battle=new GuardiansDemo.Battle();this.display=this.battle.snapshot();this.moves=[];this.sync();this.renderUI();}
  submit(action){const before=this.battle?.round;super.submit(action);if(this.battle?.round!==before||this.result?.finished){if(this.state==='resolving'){this.moves.push(action);this.renderUI();}}}
  renderUI(){
   if(!this.display)return;
   $('status-cards').innerHTML=this.display.actors.map((a,i)=>`<article class="fighter"><h2>${i?tr('Guardián Hollow','Hollow Warden'):'Jessie'}</h2><progress max="${a.max}" value="${a.hp}" aria-label="${i?'Hollow Warden':'Jessie'} HP"></progress><p>${a.hp} / ${a.max} HP</p><p>STR ${a.str} · AGI ${a.agi} · CON ${a.con}</p><p class="state">${a.ultra?'Ultra Focus':a.focus?'Focus':tr('Sin bonificación','No bonus')} · ${a.rank===1?tr('Actúa primero','Acts first'):tr('Actúa después','Acts second')}</p></article>`).join('');
   const done=this.victory||this.defeat,intent=this.battle.chooseEnemy();
   $('round-info').textContent=done?(this.victory?tr('Victoria de Jessie','Jessie wins'):tr('Jessie ha caído','Jessie has fallen')):`${tr('Ronda','Round')} ${this.round} · ${this.state==='ready'?tr('Tu decisión','Your decision'):tr('Resolviendo las acciones','Resolving actions')}`;
   $('enemy-intent').textContent=done?tr('Combate finalizado','Battle complete'):this.state!=='ready'?tr('Observa el resultado de tu decisión.','Watch your decision play out.'):tr('El guardián prepara: ','The warden prepares: ')+names[intent];
   $('turn-tip').textContent=intent==='ATTACK'?tr('Parry puede bloquear y contraatacar. Descansar ahora te expone a más daño.','Parry can block and counter. Resting now exposes you to extra damage.'):intent==='DEFEND'?tr('Puedes descansar sin recibir un ataque, o usar tu especial para ignorar Parry.','You can rest without an incoming attack, or use your special to bypass Parry.'):tr('El rival va a descansar: atacarlo interrumpe su recuperación.','Your opponent is resting: attacking interrupts their recovery.');
   $('result-panel').hidden=!done;
   if(done){$('result-heading').textContent=this.victory?tr('El bosque vuelve a respirar.','The forest breathes again.'):tr('Toda derrota enseña algo.','Every defeat teaches something.');$('result-summary').textContent=`${tr('Rondas','Rounds')}: ${this.round} · ${tr('Decisiones','Decisions')}: ${this.moves?.length||0} · ${tr('Vida restante','HP remaining')}: ${this.heroHp} / ${this.display.actors[0].max} · ${tr('Especial','Special')}: ${this.display.actors[0].used?tr('utilizada','used'):tr('sin utilizar','unused')}`;}
  }
 };
 const attach=window.PracticeController.attach;
 window.PracticeController.attach=s=>{
  attach(s);const f=s.feedback;
  // Put player actions first; keep sound/music/effects as optional settings.
  for(const id of ['shoot','parry','rest','special'])$('player-actions').append($(id));
  $('pause').textContent=tr('Pausar','Pause');$('reset').textContent=tr('Volver a empezar','Start again');
  const controls=s.controls.bind(s);s.controls=()=>{
   controls();const paused=$('pause').textContent===tr('Continuar','Resume'),ended=f.victory||f.defeat;
   for(const [id,action] of [['shoot','ATTACK'],['parry','DEFEND'],['rest','REST'],['special','SPECIAL']]){
    const button=$(id);button.textContent=names[action];
    const reason=ended?tr('El combate terminó. Puedes volver a jugar.','Battle complete. You can play again.'):paused?tr('Continúa el combate para elegir.','Resume to choose an action.'):f.state!=='ready'?tr('Espera a que termine la acción.','Wait for the action to finish.'):id==='special'&&f.battle.actors[0].used?tr('Ya usaste la especial en este combate.','You already used your special this battle.'):'';
    button.title=reason||$('help-'+id).textContent;button.setAttribute('aria-describedby','help-'+id);
   }
   $('action-availability').textContent=ended?tr('Combate finalizado. Usa «Volver a jugar».','Battle complete. Select “Play again”.'):paused?tr('En pausa. Pulsa «Continuar».','Paused. Select “Resume”.'):f.state!=='ready'?tr('Acciones en curso…','Actions in progress…'):f.battle.actors[0].used?tr('Elige tu próxima acción. Especial ya utilizada.','Choose your next action. Special already used.'):tr('Elige una acción. Especial disponible una vez por combate.','Choose an action. Special available once per battle.');
  };
  $('replay').onclick=()=>{s.reset();if($('pause').textContent===tr('Continuar','Resume'))$('pause').click();$('round-info').scrollIntoView({behavior:'auto',block:'center'});$('shoot').focus();};
  $('dismiss-guide').onclick=()=>{$('first-turn-guide').hidden=true;};
  $('give-feedback').onclick=()=>{$('feedback-panel').hidden=false;$('feedback-text').focus();};
  window.DemoFeedbackForm.attach(f,es);
  $('ready-note').hidden=false;s.controls();
 };
})();
