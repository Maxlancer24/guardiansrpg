/* A contextual introduction, not another combat resolver. The highlighted real
 * control is used; reading/selecting never advances the battle by itself. */
window.CombatOrientation=class{
 constructor(T,state,changed){
  this.T=T;this.state=state;this.changed=changed;this.active=false;this.session=false;this.index=0;
  this.panel=document.createElement('section');this.panel.id='orientation-card';this.panel.className='orientation-card';this.panel.hidden=true;this.panel.setAttribute('aria-label',T('Guía paso a paso','Step-by-step guide'));
  this.panel.innerHTML='<div class="orientation-top"><span id="orientation-progress"></span><button type="button" id="orientation-skip"></button></div><h2 id="orientation-title" tabindex="-1"></h2><div id="orientation-copy" aria-live="polite"></div><p id="orientation-task" role="status"></p><div class="orientation-nav"><button id="orientation-back" type="button"></button><button id="orientation-next" type="button"></button></div>';
  document.getElementById('battle').append(this.panel);
  this.$=id=>this.panel.querySelector('#'+id);
  this.$('orientation-back').textContent=T('Anterior','Previous');this.$('orientation-skip').textContent=T('Seguir sin guía','Continue without guidance');
  this.$('orientation-back').onclick=()=>{if(this.index>0)this.show(this.index-1);};
  this.$('orientation-next').onclick=()=>{if(this.steps[this.index].action&&this.interactive&&!this.selected)return;if(this.index<this.steps.length-1)this.show(this.index+1);else this.close('finish');};
  this.$('orientation-skip').onclick=()=>this.close('skip');
 }
 overview(){
  const T=this.T,s=this.state().display,a=s.actors[0],b=s.actors[1];
  const step=(id,target,anchor,title,body,extra={})=>({id,target,anchor,title,body,...extra});
  return [
   step('health','#hero-panel','.hud',T('Esta es tu vida.','This is your health.'),[
    T(`La barra verde muestra cuánto puedes resistir. ${a.hp} / ${a.max} HP significa que te quedan ${a.hp} puntos de vida de un máximo de ${a.max}.`,`The green bar shows how much you can withstand. ${a.hp} / ${a.max} HP means you have ${a.hp} health points out of a maximum of ${a.max}.`),
    T('Recibir daño baja la barra. Curarte la recupera. Si llega a 0, quedas derrotado. Aquí empiezas herido para practicar la curación; todavía no tienes que elegir ninguna acción.','Taking damage lowers it. Healing fills it back up. At 0, you are defeated. You start wounded here to practice healing; you do not need to choose an action yet.')]),
   step('enemy','#enemy-panel','.hud',T('Esta es la vida del rival.','This is your opponent’s health.'),[
    T(`Hollow tiene ${b.hp} / ${b.max} HP. Tu objetivo es bajar su vida a 0 antes de que él haga lo mismo contigo.`,`Hollow has ${b.hp} / ${b.max} HP. Your goal is to reduce its health to 0 before it does the same to you.`),
    T('Las dos barras se actualizan cuando se resuelve cada golpe o curación. Podrás ver exactamente qué cambió.','Both bars update as each hit or heal resolves. You will see exactly what changed.')]),
   step('str','#stat-str','.fighter-stats',T('STR significa Fuerza.','STR means Strength.'),[
    T(`Tu STR es ${a.str}. Aumenta el daño base de tus ataques; también ayuda a tu defensa y al contraataque de Parry.`,`Your STR is ${a.str}. It increases your attacks’ base damage and also helps your Parry defense and counterattack.`),
    T('Con estos valores, un ataque normal empieza con 50 de daño. La defensa del enemigo y otros efectos pueden cambiar cuánto HP le quita. No necesitas memorizar la fórmula.','With these values, a normal attack starts at 50 damage. Enemy defense and other effects can change how much HP it removes. You do not need to memorize the formula.')]),
   step('con','#stat-con','.fighter-stats',T('CON significa Constitución.','CON means Constitution.'),[
    T('Te da más vida máxima, mejora la curación de Rest y refuerza el bloqueo y la respuesta de Parry. No es la vida que te queda: esa se ve en la barra verde.','It gives you more maximum health, improves Rest healing, and strengthens Parry’s guard and counter. It is not your remaining health: that is shown by the green bar.'),
    T(`Con CON ${a.con}, aquí tienes ${a.max} HP máximos. Un Rest exitoso puede recuperar hasta 50 HP; nunca supera tu máximo.`,`With CON ${a.con}, you have ${a.max} maximum HP here. A successful Rest can recover up to 50 HP; it never exceeds your maximum.`)]),
   step('agi','#stat-agi','.fighter-stats',T('AGI significa Agilidad.','AGI means Agility.'),[
    T('Influye en la iniciativa: el orden en que se ejecutan las acciones. También afecta al daño y a las probabilidades de crítico y esquiva. No garantiza actuar siempre primero ni esquivar.','It affects initiative: the order in which actions happen. It also affects damage and critical-hit and dodge chances. It does not guarantee always acting first or dodging.'),
    T('Aquí ambos tienen AGI 0. Quitamos críticos y esquivas del entrenamiento inicial para que puedas entender cada resultado sin azar.','Both fighters have AGI 0 here. Criticals and dodges are removed from the introductory training so you can understand each result without randomness.')]),
   step('round','#round-panel','.hud',T('El combate avanza por rondas.','The fight advances in rounds.'),[
    T('En cada ronda, tú eliges una acción principal y el rival elige la suya. Después se resuelven según la iniciativa. Mira el texto «Actúa primero» para saber quién empieza.','Each round, you choose one main action and your opponent chooses theirs. They then resolve in initiative order. Read “Acts first” to see who starts.'),
    T('Seleccionar un botón todavía no ejecuta nada. La ronda empieza cuando pulsas Confirmar ronda. Vamos a conocer primero los tres botones.','Selecting a button does not execute anything yet. The round starts when you press Confirm round. First, let’s learn the three buttons.')]),
   step('attack','[data-action="ATTACK"]','#actions',T('Attack sirve para atacar.','Attack is your attack button.'),[
    T('Atacas al rival para quitarle HP. En este entrenamiento, el golpe normal tiene 50 de daño base. Si el rival bloquea, puede reducirlo o detenerlo.','Attack your opponent to remove HP. In this training, a normal hit has 50 base damage. If the opponent guards, they may reduce or stop it.'),
    T('Pulsa Attack para seleccionarlo. No lo confirmes todavía: estamos aprendiendo los controles y nadie recibirá daño.','Press Attack to select it. Do not confirm yet: we are learning the controls and nobody will take damage.')],{action:'ATTACK'}),
   step('parry','[data-action="DEFEND"]','#actions',T('Parry sirve para defenderte.','Parry is your guard button.'),[
    T('Tu guardia bloquea hasta 60 de daño en este ejemplo. Si detiene todo el golpe, respondes automáticamente con un contraataque de 40. Un ataque más fuerte puede romperla.','Your guard blocks up to 60 damage in this example. If it stops the entire hit, you automatically counter for 40. A stronger attack can break it.'),
    T('Pulsa Parry. Verás que reemplaza a Attack: solo eliges una acción principal por ronda. Todavía no se ejecuta nada.','Press Parry. Notice how it replaces Attack: you choose only one main action per round. Nothing executes yet.')],{action:'DEFEND'}),
   step('rest','[data-action="REST"]','#actions',T('Rest sirve para recuperarte.','Rest helps you recover.'),[
    T('Un descanso exitoso recupera hasta 50 HP y prepara Focus. Pero si el enemigo te ataca, el descanso se interrumpe: no recibes esa cura ni Focus nuevo, y un ataque normal te hace más daño.','A successful Rest recovers up to 50 HP and prepares Focus. But if the enemy attacks you, Rest is interrupted: you gain no healing or new Focus, and a normal attack deals extra damage.'),
    T('Pulsa Rest para seleccionarlo. Antes de confirmarlo, aprenderemos a reconocer un momento seguro para descansar.','Press Rest to select it. Before confirming, we will learn to recognize a safe moment to rest.')],{action:'REST'}),
   step('focus','#hero-status','.hud',T('Focus prepara un golpe más fuerte.','Focus prepares a stronger hit.'),[
    T('Este texto, debajo de tu vida, indica si tienes Focus. Lo ganas con un Rest exitoso. Duplica el daño de tu siguiente ataque básico y se consume al atacar.','This text below your health shows whether you have Focus. A successful Rest grants it. It doubles your next basic attack’s damage and is consumed when you attack.'),
    T('Parry conserva tu Focus. Así puedes descansar, defenderte si hace falta y aprovechar la carga en un ataque posterior.','Parry preserves your Focus. You can rest, defend if needed, and use the charge in a later attack.')]),
   step('intent','#intent-panel','#intent-panel',T('Mira qué prepara el rival.','Look at what the opponent is preparing.'),[
    T('El entrenamiento te muestra la intención de Hollow. Si prepara Attack, descansar es peligroso. Si prepara Parry, va a defenderse y puedes descansar sin recibir un ataque suyo.','Training shows you Hollow’s intent. If it prepares Attack, resting is dangerous. If it prepares Parry, it will defend, so you can rest without being attacked by it.'),
    T('Al comenzar esta lección, Hollow prepara Parry. Por eso conviene Rest en la primera ronda: no es una regla para empezar todos los combates.','At the start of this lesson, Hollow prepares Parry. That is why Rest is useful in the first round: it is not a rule for starting every fight.')]),
   step('confirm','#confirm','.decision',T('Ahora sí: confirma tu primera ronda.','Now confirm your first round.'),[
    T('Has seleccionado Rest. Hasta ahora no ha cambiado ningún HP. Al pulsar Confirmar ronda, se ejecutarán tu descanso y la acción de Hollow.','You have selected Rest. No HP has changed yet. Pressing Confirm round will execute your Rest and Hollow’s action.'),
    T('Mira la animación y después tu barra de vida. Te acompañaré para entender el resultado y elegir la siguiente acción.','Watch the animation, then your health bar. I will help you understand the result and choose the next action.')],{confirm:true})
  ];
 }
 followup(round){
  const T=this.T,s=this.state().display,a=s.actors[0],b=s.actors[1];
  const confirm={id:'confirm',target:'#confirm',anchor:'.decision',title:T('Confirma cuando estés listo.','Confirm when you are ready.'),body:[T('La acción marcada ya está preparada. Pulsa Confirmar ronda para verla en movimiento.','The highlighted action is prepared. Press Confirm round to see it play out.')],confirm:true};
  if(round===2)return [
   {id:'rest-result',target:'#hero-panel',anchor:'.hud',title:T('Tu descanso funcionó.','Your Rest worked.'),body:[T(`Pasaste de 100 a ${a.hp} HP: recuperaste 50. Debajo de la barra ahora aparece Focus listo.`,`You went from 100 to ${a.hp} HP: you recovered 50. Focus ready now appears below your bar.`),T('Hollow no te atacó, así que pudiste descansar. Ahora prepara Attack; vamos a proteger esa vida sin gastar Focus.','Hollow did not attack, so you were able to rest. It now prepares Attack; let’s protect that health without spending Focus.')]},
   {id:'parry',target:'[data-action="DEFEND"]',anchor:'#actions',action:'DEFEND',title:T('Prueba Parry contra su ataque.','Try Parry against its attack.'),body:[T('Hollow va a golpear por 50. Tu guardia de 60 puede detenerlo por completo. Selecciona Parry: bloquearás y responderás con un contraataque.','Hollow will hit for 50. Your 60 guard can stop it completely. Select Parry: you will block and counterattack.'),T('El Focus que ganaste se conserva al defenderte.','The Focus you gained is preserved while defending.')]},confirm
  ];
  if(round===3)return [
   {id:'parry-result',target:'#enemy-panel',anchor:'.hud',title:T('Bloqueaste y respondiste.','You blocked and countered.'),body:[T(`Sigues con ${a.hp} HP: el golpe no te quitó vida. Tu contraataque dejó a Hollow en ${b.hp} HP.`,`You still have ${a.hp} HP: the hit took no health. Your counter left Hollow at ${b.hp} HP.`),T('Tu Focus sigue listo. Ahora Hollow intenta descansar: es un buen momento para usarlo al atacar.','Your Focus is still ready. Hollow now tries to rest: this is a good time to use it in an attack.')]},
   {id:'attack',target:'[data-action="ATTACK"]',anchor:'#actions',action:'ATTACK',title:T('Usa Attack y aprovecha Focus.','Use Attack and spend Focus.'),body:[T('Selecciona Attack. El golpe base de 50 se duplica a 100 por Focus. Como Hollow descansa, el golpe normal recibe además el aumento contra Rest: serán 150 de daño en este ejemplo.','Select Attack. Focus doubles the 50 base hit to 100. Because Hollow is resting, the normal hit also gains the Rest damage bonus: 150 damage in this example.'),T('También interrumpirás su descanso, así que no se curará.','You will also interrupt its Rest, so it will not heal.')]},confirm
  ];
  return [{id:'attack-result',target:'#enemy-panel',anchor:'.hud',title:T('Ya conoces lo esencial.','You now know the essentials.'),body:[T(`Hollow quedó con ${b.hp} HP. Tu Focus se gastó al atacar y su descanso fue interrumpido.`,`Hollow has ${b.hp} HP left. Your Focus was spent on the attack, and its Rest was interrupted.`),T('Ahora termina el combate tomando tus propias decisiones. Mira siempre la vida, el Focus y la intención del rival antes de confirmar.','Now finish the fight with your own decisions. Check health, Focus and the opponent’s intent before confirming.')],lastLabel:T('Seguir por mi cuenta','Continue on my own')}];
 }
 begin(interactive=true){this.clear();this.session=interactive;this.interactive=interactive;this.steps=this.overview();if(!interactive)this.steps=this.steps.map(s=>({...s,action:null,confirm:false,body:s.id==='confirm'?[this.T('Selecciona una acción y luego confirma para resolver una ronda. Revisar esta guía no cambia tu vida, recursos ni ronda.','Select an action, then confirm to resolve a round. Reviewing this guide does not change health, resources or round.')]:s.action?[s.body[0],this.T('Este botón selecciona la acción, pero no la ejecuta. Al terminar esta explicación podrás volver a usarlo.','This button selects the action but does not execute it. You can use it again after finishing this explanation.')]:s.body}));this.active=true;this.show(0);}
 afterRound(round){if(!this.session)return;this.steps=this.followup(round);this.interactive=round<4;this.active=true;this.show(0);}
 clear(){document.querySelectorAll('.orientation-target').forEach(el=>{el.classList.remove('orientation-target');el.removeAttribute('aria-describedby');});}
 show(index){
  this.clear();this.index=index;this.selected=false;const step=this.steps[index],target=document.querySelector(step.target),anchor=document.querySelector(step.anchor);if(!target||!anchor){this.close('skip');return;}
  this.panel.hidden=false;anchor.insertAdjacentElement('afterend',this.panel);target.classList.add('orientation-target');target.setAttribute('aria-describedby','orientation-copy');
  this.panel.dataset.step=step.id;this.$('orientation-progress').textContent=this.T('Paso ','Step ')+(index+1)+' / '+this.steps.length;
  this.$('orientation-title').textContent=step.title;this.$('orientation-copy').replaceChildren(...step.body.map(text=>{const p=document.createElement('p');p.textContent=text;return p;}));
  this.$('orientation-back').disabled=index===0;this.$('orientation-next').hidden=!!step.confirm&&this.interactive;
  this.$('orientation-next').textContent=step.lastLabel||(index===this.steps.length-1?this.T('Volver al combate','Back to the battle'):this.T('Siguiente →','Next →'));
  this.updateTask();this.changed('step');
  // Inline placement keeps both the highlighted control and explanation visible
  // on mobile and inside the guide iframe, without a viewport-sized overlay.
  anchor.scrollIntoView({block:'start',behavior:'auto'});(this.interactive&&(step.action||step.confirm)?target:this.$('orientation-title')).focus({preventScroll:true});
 }
 updateTask(){const s=this.steps[this.index];this.$('orientation-next').disabled=!!s.action&&this.interactive&&!this.selected;this.$('orientation-task').textContent=s.action&&this.interactive?(this.selected?this.T('Seleccionado. Nadie ha actuado todavía; puedes continuar.','Selected. Nobody has acted yet; you can continue.'):this.T('Pulsa el botón señalado para probar su selección.','Press the highlighted button to try selecting it.')):s.confirm&&this.interactive?this.T('Pulsa Confirmar ronda en el combate.','Press Confirm round in the battle.'):this.T('Lee a tu ritmo. La batalla está esperando.','Read at your own pace. The battle is waiting.');}
 allow(action){return !this.active||!!(this.interactive&&this.steps[this.index].action===action);}
 canConfirm(){return !this.active||!!(this.interactive&&this.steps[this.index].confirm);}
 chose(action){if(!this.active||this.steps[this.index].action!==action)return;this.selected=true;this.updateTask();}
 close(reason){this.clear();this.active=false;this.panel.hidden=true;if(reason!=='confirm')this.session=false;this.changed(reason);}
 snapshot(){return {active:this.active,session:this.session,index:this.index,step:this.active?this.steps[this.index].id:null,interactive:this.interactive};}
};
