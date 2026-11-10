(()=>{'use strict';
 const $=id=>document.getElementById(id),params=new URLSearchParams(location.search),en=params.get('lang')==='en',embedded=params.get('embed')==='1';
 const T=(es,english)=>en?english:es,copy=x=>structuredClone(x),actionName=a=>({ATTACK:'Attack',DEFEND:'Parry',REST:'Rest'}[a]);
 let battle,display,busy=true,choice=null,aux=null,mode='basics',loaded=false,lastResult=null,roundChoice=null;
 const scene=new TutorialScene($('arena'),onEvent,onEnd,T);
 const orientation=new CombatOrientation(T,()=>({display}),reason=>{
  if(reason==='step'&&orientation.interactive&&orientation.steps[orientation.index].action)choice=null;
  if((reason==='skip'||reason==='finish')&&orientation.interactive)choice=null;
  ui();
  if(reason==='skip'||reason==='finish')$('actions').scrollIntoView({block:'start',behavior:'auto'});
 });
 document.documentElement.lang=en?'en':'es';document.documentElement.classList.toggle('embedded',embedded);document.title=T('Combate tutorial','Battle tutorial')+' · The Guardians';
 const texts={eyebrow:['CAMPO DE ENTRENAMIENTO','TRAINING GROUND'],title:['Aprende luchando.','Learn by fighting.'],'guide-link':['Volver a la guía ↗','Back to the guide ↗'],'lesson-label':['Tu entrenamiento','Your training'],restart:['Reiniciar','Restart'],retry:['Reintentar','Retry'],'actions-title':['1 · Elige tu acción','1 · Choose your action'],'attack-desc':['Ataca al rival','Strike your opponent'],'parry-desc':['Bloquea y responde','Block and counter'],'rest-desc':['Recupera HP y Focus','Recover HP and Focus'],'aux-title':['Uso auxiliar · opcional','Auxiliary use · optional'],'aux-help':['Se resuelve antes de tu acción. Solo uno por ronda.','Resolves before your action. Only one per round.'],potion:['Health Potion · +50 HP','Health Potion · +50 HP'],dose:['Dosis para ti · +40 HP','Dose for yourself · +40 HP'],'sound-label':['Sonido','Sound'],'motion-label':['Animaciones','Animations'],'speed-label':['Velocidad','Speed'],'log-title':['Registro del combate','Battle log'],'conditions-title':['Qué estamos practicando','What we are practicing'],'next-lesson':['Siguiente lección →','Next lesson →'],again:['Volver a intentar','Try again']};
 for(const [id,pair] of Object.entries(texts))$(id).textContent=T(...pair);
 for(const [id,pair] of Object.entries({'orientation-label':['Aprende la pantalla, después toma tu decisión.','Learn the screen, then make your choice.'],explain:['Explicar la pantalla','Explain the screen'],'stats-label':['Tus estadísticas','Your stats'],'str-label':['Fuerza','Strength'],'con-label':['Constitución','Constitution'],'agi-label':['Agilidad','Agility'],'str-hint':['Potencia de ataque','Attack power'],'con-hint':['Vida y defensa','Health and defense'],'agi-hint':['Iniciativa y probabilidades','Initiative and chances']}))$(id).textContent=T(...pair);
 $('guide-link').href=(en?'/':'/es/')+'combat-guide/';
 const lessonNames=[['01 · Attack, Parry y Rest','01 · Attack, Parry and Rest'],['02 · Consumible + acción','02 · Consumable + action'],['03 · La dosis del Alquimista','03 · The Alchemist’s dose'],['04 · Práctica libre','04 · Free practice']];
 [...$('lesson').options].forEach((o,i)=>o.textContent=T(...lessonNames[i]));
 $('battle').setAttribute('aria-label',T('Combate tutorial','Tutorial battle'));$('arena').setAttribute('aria-label',T('Combate animado. HP, estados y resultados también aparecen en texto y en el registro.','Animated battle. HP, statuses and results are also shown as text and in the battle log.'));
 $('goals').setAttribute('aria-label',T('Objetivos del entrenamiento','Training objectives'));
 $('motion').checked=scene.motion;
 $('conditions-text').textContent=T('Entrenamiento local sin cuenta ni recompensas. Ambos luchadores tienen STR 10, AGI 0 y CON 10: 200 HP máximos, ataque base 50, defensa de Parry 60, contraataque 40 y Rest de 50 HP. La tirada base es fija (10); no hay críticos ni esquivas, equipo, pasivas de clan o modificadores de modo. Hollow anuncia su acción para ayudarte a aprender; un enemigo normal no tiene por qué hacerlo. Focus duplica el ataque y se consume al atacar; un segundo Rest exitoso con Focus prepara Ultra Focus. Los ataques normales contra Rest lo interrumpen y llevan ×1,5 de daño. Solo la lección del Alquimista aplica su maestría de etapa 1: máximo 2 dosis creadas, 1 guardada, disponibles desde la ronda siguiente. La dosis de esta lección se usa sobre ti; en el juego también puede dirigirse a un aliado. Poción y dosis comparten el uso auxiliar y no reemplazan tu acción principal.','Local training with no account or rewards. Both fighters have STR 10, AGI 0 and CON 10: 200 maximum HP, 50 base attack, 60 Parry defense, 40 counter damage and 50 HP Rest. The base roll is fixed (10); no criticals, dodges, gear, clan passives or mode modifiers apply. Hollow announces its action to help you learn; a normal enemy may not do so. Focus doubles an attack and is consumed when attacking; another successful Rest while focused prepares Ultra Focus. Normal attacks against Rest interrupt it and carry ×1.5 damage. Only the Alchemist lesson applies stage-one mastery: at most 2 doses created, 1 stored, usable from the following round. This lesson uses the dose on yourself; in the game it can also target an ally. Potion and dose share the auxiliary-use slot and do not replace your main action.');
 const goalNames={rest:['Descanso exitoso','Successful Rest'],parry:['Bloqueo completo','Full Parry'],focus:['Ataque con Focus','Focused attack'],potion:['Usa poción + acción','Use potion + action'],prepared:['Crea una dosis','Create a dose'],dose:['Usa la dosis + acción','Use dose + action']};
 function name(id){return id===1?'Hollow':mode==='alchemist'?T('Alquimista','Alchemist'):T('Guardián','Guardian');}
 function suggested(){return battle.intent()==='ATTACK'?'DEFEND':battle.intent()==='DEFEND'?'REST':'ATTACK';}
 function hint(){
  if(mode==='practice')return T('Elige libremente. Observa la intención del rival, tu HP y el Focus de ambos.','Choose freely. Watch the enemy’s intent, your HP and both fighters’ Focus.');
  if(mode==='potion'&&battle.resources.potions)return T('Tienes una Health Potion equipada. Prepárala y elige también Attack, Parry o Rest: curarte no gasta tu acción principal.','You have one equipped Health Potion. Prepare it and also choose Attack, Parry or Rest: healing does not spend your main action.');
  if(mode==='alchemist'&&battle.resources.doses)return T('Ya tienes una dosis. Prepárala para curarte 40 HP y elige también tu acción principal. Una dosis y una poción no pueden usarse en la misma ronda.','You have a dose ready. Prepare it to heal 40 HP and also choose your main action. A dose and potion cannot be used in the same round.');
  return battle.intent()==='ATTACK'?T('Hollow atacará. Parry puede bloquear sus 50 de daño si no tiene Focus. Descansar ahora te deja expuesto.','Hollow will attack. Parry can block its 50 damage if it has no Focus. Resting now leaves you exposed.'):battle.intent()==='DEFEND'?T('Hollow prepara Parry. Es una oportunidad de descansar: recuperas HP y preparas Focus si nadie te ataca.','Hollow is preparing Parry. This is a chance to rest: recover HP and prepare Focus if nobody attacks you.'):T('Hollow intentará descansar. Un ataque puede interrumpirlo; comprueba si tienes Focus antes de decidir.','Hollow will try to rest. An attack can interrupt it; check whether you have Focus before deciding.');
 }
 function ui(){
  if(!display)return;
  const finished=lastResult?.finished&&!busy;
  for(let id=0;id<2;id++){
   const a=display.actors[id],prefix=id?'enemy':'hero';$(prefix+'-hp').value=a.hp;$(prefix+'-hp').max=a.max;$(prefix+'-hp').setAttribute('aria-label',name(id)+' HP');$(prefix+'-health').textContent=a.hp+' / '+a.max+' HP';
   $(prefix+'-status').textContent=a.ultra?'ULTRA FOCUS':a.focus?T('Focus listo · ×2','Focus ready · ×2'):T('Sin Focus','No Focus');
  }
  $('hero-name').textContent=name(0);$('round').textContent=T('Ronda ','Round ')+display.round;
  for(const key of ['str','con','agi'])$(key+'-value').textContent=display.actors[0][key];
  $('initiative').textContent=T('Actúa primero: ','Acts first: ')+name(display.order[0]);
  $('intent-label').textContent=finished?T('Resultado','Result'):T('Hollow prepara','Hollow prepares');
  $('intent').textContent=finished?(lastResult.winner===0?T('Victoria','Victory'):T('Derrota','Defeat')):busy?T('Resolviendo…','Resolving…'):actionName(battle.intent());
  $('intent-detail').textContent=busy?T('Las acciones se resuelven por iniciativa.','Actions resolve in initiative order.'):finished?'':T('En este entrenamiento puedes ver su intención.','This training reveals its intent.');
  document.querySelectorAll('[data-action]').forEach(b=>{b.disabled=busy||finished||!orientation.allow(b.dataset.action);b.setAttribute('aria-pressed',String(choice===b.dataset.action));b.dataset.suggested=String(!orientation.active&&!busy&&!finished&&mode!=='practice'&&b.dataset.action===suggested());});
  $('potion').hidden=!['potion','alchemist'].includes(mode);$('dose').hidden=mode!=='alchemist';$('auxiliary').hidden=finished||!['potion','alchemist'].includes(mode);
  $('potion').disabled=busy||finished||orientation.active||!display.resources.potions;$('dose').disabled=busy||finished||orientation.active||!display.resources.doses;
  for(const kind of ['potion','dose'])$(kind).setAttribute('aria-pressed',String(aux===kind));
  $('resources').textContent=T('Pociones restantes: ','Potions remaining: ')+display.resources.potions+(mode==='alchemist'?T(' · Dosis guardadas: ',' · Stored doses: ')+display.resources.doses+'/1'+T(' · Creadas: ',' · Created: ')+display.resources.created+'/2':'');
  $('confirm').disabled=busy||finished||!choice||!orientation.canConfirm();$('confirm').textContent=busy?T('Resolviendo la ronda…','Resolving the round…'):T('Confirmar ronda →','Confirm round →');
  $('selection-help').textContent=busy?T('Mira cómo se resuelve tu decisión. Puedes pausar la animación.','Watch your decision resolve. You can pause the animation.'):finished?'':choice?(aux?T(aux==='potion'?'Poción preparada + ':'Dosis preparada + ',aux==='potion'?'Potion prepared + ':'Dose prepared + '):'')+actionName(choice)+'. '+({ATTACK:T('Gastas tu Focus si lo tienes.','Spends your Focus if ready.'),DEFEND:T('No consume tu Focus.','Keeps your Focus.'),REST:T('Solo cura y genera Focus si nadie te ataca.','Only heals and gains Focus if nobody attacks you.')}[choice]):T('Selecciona una acción; después confirma. Los botones no gastan nada hasta confirmar.','Choose an action, then confirm. Buttons spend nothing until you confirm.');
  $('restart').disabled=busy;$('lesson').disabled=busy;
  $('explain').disabled=busy||finished;$('coach').hidden=orientation.active;$('goals').hidden=orientation.active;
  $('pause').textContent=scene.paused?T('Continuar animación','Resume animation'):T('Pausar animación','Pause animation');
  $('goals').replaceChildren(...battle.objectiveKeys().map(key=>{const el=document.createElement('span');const done=display.goals[key];el.className=done?'complete':'';el.textContent=(done?'✓ ':'○ ')+T(...goalNames[key]);return el;}));
  $('result').hidden=!finished;
  $('actions').hidden=finished;document.querySelector('.decision').hidden=finished;
 }
 function log(message){const li=document.createElement('li');li.textContent=message;$('log').append(li);while($('log').children.length>80)$('log').firstChild.remove();}
 function eventText(e){
  if(e.type==='auxiliary')return name(0)+' · '+(e.kind==='potion'?'Health Potion':T('Dosis','Dose'))+' +'+e.heal+' HP. '+T('Todavía ejecutas tu acción principal.','Your main action still follows.');
  if(e.type==='rest')return name(e.actor)+' · Rest +'+e.heal+' HP · '+(e.state.actors[e.actor].ultra?'Ultra Focus':'Focus')+(e.createdDose?T(' · Dosis creada para la próxima ronda.',' · Dose created for next round.'):'');
  if(e.type==='interrupted')return name(e.actor)+' · '+T('Rest interrumpido: sin cura ni Focus nuevo.','Rest interrupted: no healing or new Focus.');
  if(e.type==='blocked')return name(1-e.actor)+' · '+T('Parry bloquea todo el golpe.','Parry blocks the entire hit.');
  if(e.type==='counter')return name(e.actor)+' · '+T('Contraataque: ','Counterattack: ')+e.reflected+' HP.';
  if(e.type==='attack')return name(e.actor)+' · '+actionName('ATTACK')+' → '+name(1-e.actor)+' −'+e.amount+' HP'+({break:T(' · Guardia rota.',' · Guard broken.'),vulnerable:T(' · ×1,5 contra Rest.',' · ×1.5 against Rest.'),ultra:T(' · Ultra Focus atraviesa la defensa.',' · Ultra Focus bypasses defense.'),dodge:T(' · Esquivado.',' · Dodged.')}[e.outcome]||'.');
  return '';
 }
 function onEvent(e,state){display=copy(state);const message=eventText(e);if(message){log(message);$('scene-label').textContent=message;}ui();}
 function onEnd(result){
  display=copy(result.next);busy=false;lastResult=result;scene.paused=false;choice=null;aux=null;
  let feedback='';const ownRest=result.events.find(e=>e.actor===0&&e.type==='rest'),interrupted=result.events.some(e=>e.actor===0&&e.type==='interrupted'),counter=result.events.some(e=>e.actor===1&&e.outcome==='parry');
  if(interrupted)feedback=T('Tu descanso fue interrumpido: recibiste más daño y no ganaste cura ni Focus nuevo. ','Your Rest was interrupted: you took extra damage and gained no healing or new Focus. ');
  else if(ownRest)feedback=T('Descanso exitoso: +','Successful Rest: +')+ownRest.heal+' HP · '+(ownRest.state.actors[0].ultra?'Ultra Focus':'Focus')+(ownRest.createdDose?T(' y una dosis lista desde ahora. ',' and a dose ready from now on. '):T(' preparado. ',' ready. '));
  else if(counter)feedback=T('Bloqueaste todo el ataque y respondiste con 40 de daño. ','You blocked the entire attack and countered for 40 damage. ');
  else if(roundChoice==='ATTACK')feedback=T('Tu ataque ya se resolvió. Revisa los HP y los estados antes de la siguiente ronda. ','Your attack has resolved. Check HP and statuses before the next round. ');
  $('coach').textContent=feedback+(!result.finished?hint():'');$('scene-label').textContent='';
  if(result.finished){
   $('result-title').textContent=result.winner===0?T('Victoria. Bien luchado.','Victory. Well fought.'):T('Esta vez ganó Hollow.','Hollow won this time.');
   $('result-copy').textContent=result.winner!==0?T('Puedes reiniciar sin perder nada. Observa la intención del rival y evita descansar bajo un ataque.','Restart without losing anything. Watch the enemy’s intent and avoid resting under attack.'):mode==='practice'?T('Venciste a Hollow. Repite y prueba otra estrategia para comparar cómo cambia el combate.','You defeated Hollow. Replay with a different strategy to compare how the fight changes.'):battle.complete()?T('Completaste los objetivos del entrenamiento. Prueba la siguiente lección o repite tomando otras decisiones.','You completed the training objectives. Try the next lesson or replay with different decisions.'):T('Ganaste el combate, pero quedan objetivos sin practicar. Puedes repetirlo y probar las decisiones que te faltan.','You won the battle, but some training objectives remain. Replay and try the decisions you missed.');
   $('next-lesson').hidden=!battle.complete()||mode==='practice';
   $('coach').textContent=$('result-copy').textContent;log($('result-title').textContent);
  }
  ui();if(result.finished){orientation.session=false;$('result-title').tabIndex=-1;$('result-title').focus({preventScroll:true});}
  else if(orientation.session)orientation.afterRound(display.round);
 }
 async function start(){
  if(busy&&loaded)return;
  if(orientation.active)orientation.close('reset');orientation.session=false;
  busy=true;loaded=false;mode=$('lesson').value;choice=null;aux=null;lastResult=null;scene.stopSounds();scene.queue=[];scene.current=null;
  $('load-panel').hidden=false;$('battle').hidden=true;$('retry').hidden=true;$('load-text').textContent=T('Cargando las animaciones del combate…','Loading battle animations…');$('lesson').disabled=true;$('restart').disabled=true;
  try{
   await scene.load(mode==='alchemist'?'alchemist':'guardian');
   battle=new GuardiansTutorialRules.TutorialBattle(mode);display=battle.snapshot();scene.reset(display);busy=false;loaded=true;
   $('load-panel').hidden=true;$('battle').hidden=false;$('log').replaceChildren();$('scene-label').textContent='';$('coach').textContent=hint();ui();scene.draw();
   if(mode==='basics')orientation.begin(true);
  }catch(error){busy=false;$('load-text').textContent=T('No se pudieron cargar todas las animaciones. Reintenta cuando tengas conexión.','Some animations could not load. Retry when connected.');$('retry').hidden=false;$('lesson').disabled=false;$('restart').disabled=false;}
 }
 document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{if(busy||lastResult?.finished||!orientation.allow(b.dataset.action))return;choice=b.dataset.action;orientation.chose(choice);ui();}));
 for(const kind of ['potion','dose'])$(kind).onclick=()=>{if(busy||lastResult?.finished||orientation.active)return;aux=aux===kind?null:kind;ui();};
 $('confirm').onclick=()=>{
  if(busy||!choice||lastResult?.finished||!orientation.canConfirm())return;
  if(orientation.active)orientation.close('confirm');
  const selected=choice,queued=aux;let result;try{result=battle.resolve(selected,queued);}catch(error){$('coach').textContent=T('Revisa tu acción y el recurso disponible antes de confirmar.','Check your action and available resource before confirming.');return;}
  roundChoice=selected;busy=true;lastResult=null;scene.paused=false;
  log(T('Ronda ','Round ')+display.round+' · '+name(0)+': '+actionName(selected)+(queued?' + '+queued:'')+' · Hollow: '+actionName(result.actions[1]));
  $('coach').textContent=T('Tu decisión está confirmada. Observa el orden de las acciones y los cambios de HP.','Your decision is confirmed. Watch the action order and HP changes.');ui();
  $('battle').scrollIntoView({block:'start',behavior:'auto'});scene.play(result);
 };
 $('restart').onclick=start;$('retry').onclick=start;$('again').onclick=start;$('lesson').onchange=start;
 $('explain').onclick=()=>{if(!busy&&!lastResult?.finished)orientation.begin(false);};
 $('next-lesson').onclick=()=>{const i=GuardiansTutorialRules.modes.indexOf(mode);$('lesson').value=GuardiansTutorialRules.modes[Math.min(i+1,3)];start();};
 $('pause').onclick=()=>{scene.paused=!scene.paused;scene.stopSounds();ui();};
 $('sound').onchange=()=>{scene.sound=$('sound').checked;if(!scene.sound)scene.stopSounds();};
 $('motion').onchange=()=>{scene.motion=$('motion').checked;scene.draw();};$('speed').onchange=()=>scene.speed=Number($('speed').value);
 document.addEventListener('visibilitychange',()=>{scene.last=0;if(document.hidden)scene.stopSounds();});
 window.addEventListener('message',e=>{if(e.source!==parent||e.origin!==location.origin||e.data?.type!=='guardians-tutorial-visibility')return;scene.suspended=!e.data.visible;scene.last=0;if(scene.suspended)scene.stopSounds();});
 if(embedded){let lastHeight=0;new ResizeObserver(()=>{const height=Math.ceil($('tutorial').getBoundingClientRect().height);if(height!==lastHeight){lastHeight=height;parent.postMessage({type:'guardians-tutorial-height',height},location.origin);}}).observe($('tutorial'));}
 // Read-only diagnostics used by browser regression checks; actions still use UI.
 window.tutorialSnapshot=()=>({mode,busy,loaded,choice,aux,orientation:orientation.snapshot(),display:copy(display),state:battle?.snapshot(),complete:battle?.complete(),scene:{paused:scene.paused,suspended:scene.suspended,time:scene.time,modes:copy(scene.modes)}});
 start();
})();
