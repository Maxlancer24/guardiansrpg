/* Reuse the existing consent, receipt and retry flow; never erase a draft on reset. */
(() => {
 const es=document.documentElement.lang==='es',tr=(a,b)=>es?a:b;
 const panel=document.createElement('section');panel.id='feedback-panel';panel.className='feedback-panel';
 panel.innerHTML=`<h2>${tr('Tu opinión nos ayuda','Your feedback helps us')}</h2>
 <p>${tr('Combate 2v2 · Jessie + Garrick. Puedes opinar aunque no termines el combate.','2v2 battle · Jessie + Garrick. You can leave feedback even without finishing.')}</p>
 <label for="feedback-name">${tr('Nombre o apodo','Name or nickname')}</label><input id="feedback-name" required maxlength="80" autocomplete="nickname">
 <label for="feedback-text">${tr('¿Qué te gustó y qué mejorarías?','What did you enjoy and what would you improve?')}</label><textarea id="feedback-text" required minlength="5" maxlength="2900" rows="5"></textarea>
 <label class="consent"><input id="feedback-consent" type="checkbox" required> ${tr('Acepto guardar mi nombre, opinión, modo y resultado de esta prueba para que Max pueda revisarlos.','I agree to save my name, feedback, battle mode and result so Max can review them.')}</label>
 <p><small>${tr('No incluyas contraseñas ni información sensible. Las opiniones no son públicas.','Do not include passwords or sensitive information. Feedback is not public.')}</small></p>
 <button id="send-feedback">${tr('Enviar opinión','Send feedback')}</button><p id="feedback-state" role="status"></p>`;
 document.querySelector('main').append(panel);
 const link=document.createElement('button');link.type='button';link.textContent=tr('Dejar mi opinión','Leave feedback');link.onclick=()=>panel.scrollIntoView({behavior:'auto',block:'start'});document.querySelector('.controls').append(link);
 const state=()=>window.teamBattleSnapshot?.().display;
 const winner=()=>{const a=state()?.actors;if(!a)return null;return a.filter(x=>x.team===1).every(x=>x.hp<=0)?0:a.filter(x=>x.team===0).every(x=>x.hp<=0)?1:null;};
 window.DemoFeedbackForm.attach({get victory(){return winner()===0;},get defeat(){return winner()===1;},get round(){return state()?.round||0;}},es,'2v2');
})();
