/* The animated lesson loads only when requested. Its frame is isolated from the
 * guide router, and is paused when hidden or after navigating to another page. */
window.GuardiansBattleTutorialMarkup=({L})=>`<section class="it-tutorial" id="combat-visual" aria-label="${L('Interactive combat tutorial','Tutorial de combate interactivo')}"><div class="it-poster"><img class="it-guardian" src="/assets/design-20261110/guardian.webp" alt="" width="220" height="280"><div class="it-intro"><p class="ed-label">${L('A playable training battle','Una batalla de entrenamiento jugable')}</p><h2>${L('Your choice.<br>Their response.','Tu decisión.<br>Su respuesta.')}</h2><p>${L('Choose Attack, Parry or Rest. Prepare a potion, watch the battle unfold and learn from what happens.','Elige Attack, Parry o Rest. Prepara una poción, mira cómo se resuelve el combate y aprende de lo que ocurre.')}</p><button type="button" data-start-tutorial class="ed-button">${L('Start the training battle','Comenzar el entrenamiento')} <span aria-hidden="true">→</span></button><small>${L('4 lessons · no account needed · no items spent','4 lecciones · sin cuenta · sin gastar objetos')}</small></div></div><div class="it-frame-host"></div><p class="it-direct"><a href="/battle-tutorial/?lang=${L('en','es')}" target="_blank" rel="noopener">${L('Open the battle in its own tab','Abrir el combate en su propia pestaña')} ↗</a></p><noscript><p>${L('The playable lesson requires JavaScript. The full written guide continues below.','La lección jugable necesita JavaScript. La guía escrita completa continúa más abajo.')}</p></noscript></section>`;
(()=>{
 let frame=null,observer=null,visible=true;
 function notify(){if(frame?.contentWindow)frame.contentWindow.postMessage({type:'guardians-tutorial-visibility',visible:visible&&!!frame.closest('.page.is-on')&&!document.hidden},location.origin);}
 document.addEventListener('click',e=>{
  const button=e.target.closest('[data-start-tutorial]');if(!button)return;
  const section=button.closest('.it-tutorial'),en=!location.pathname.startsWith('/es/');
  observer?.disconnect();frame=document.createElement('iframe');frame.title=en?'Playable combat tutorial':'Tutorial de combate jugable';frame.src='/battle-tutorial/?embed=1&lang='+(en?'en':'es');frame.className='it-frame';frame.height='1100';frame.allow='autoplay';
  frame.onload=()=>{notify();frame.focus({preventScroll:true});};
  section.querySelector('.it-frame-host').replaceChildren(frame);section.querySelector('.it-poster').hidden=true;
  observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;notify();},{rootMargin:'200px'});observer.observe(frame);
 });
 window.addEventListener('message',e=>{
  if(!frame?.isConnected||e.source!==frame.contentWindow||e.origin!==location.origin||e.data?.type!=='guardians-tutorial-height')return;
  const height=Number(e.data.height);if(Number.isFinite(height)&&height>0)frame.height=String(Math.max(300,Math.min(5000,Math.ceil(height)+2)));
 });
 document.addEventListener('visibilitychange',notify);
 window.GuardiansTutorialRoute=()=>{if(frame&&!frame.isConnected){observer?.disconnect();frame=null;}notify();};
})();
