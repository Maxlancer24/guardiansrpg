/* Valestia visual edition. Presentation only; never writes account or battle state. */
window.GuardiansVisual = function(ctx){
 'use strict';
 const {L,PAGES,TR_HEAD,NAV,PLACES}=ctx;
 const art='/assets/design-20261110/';
 const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
 const url=id=>L('/','/es/')+(id?id+'/':'');
 const paths={
  sword:'M5 3l14 14M4 4l1 5 4-4-5-1M14 18l4-4M16 20l4-4M18 18l3 3',
  shield:'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3zm0 4v10M8 11h8',
  spark:'M12 2l2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7L12 2z',
  map:'M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2V5zm6-2v16m6-14v16',
  book:'M12 6C9 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 2zm0 0v15',
  leaf:'M20 3C8 2 2 9 5 16s16 6 15-13zM4 21L16 8',
  compass:'M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20zm4 6-3 6-5 2 2-5 6-3z',
  gear:'M9 3h6l1 4 4 2v6l-4 2-1 4H9l-1-4-4-2V9l4-2 1-4zm3 5a4 4 0 1 0 0 8 4 4 0 1 0 0-8z',
  search:'M10 3a7 7 0 1 0 0 14 7 7 0 1 0 0-14zm5 12 6 6',
  moon:'M19 15A8 8 0 0 1 9 5a8.5 8.5 0 1 0 10 10z',
  sun:'M12 7a5 5 0 1 0 0 10 5 5 0 1 0 0-10zm0-5v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1',
  expand:'M3 9V3h6m6 0h6v6m0 6v6h-6m-6 0H3v-6',
  close:'M5 5l14 14M19 5 5 19',
  arrow:'M4 12h16m-6-6 6 6-6 6',
  flask:'M9 3h6m-5 0v6L4 19q-1 2 2 2h12q3 0 2-2L14 9V3M7 15h10',
  crown:'M3 6l5 4 4-7 4 7 5-4-2 13H5L3 6zm2 16h14'
 };
 const icon=(name,cls='')=>`<svg class="nv-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${paths[name]||paths.spark}"/></svg>`;
 window.GuardiansIcon=icon;
 const groups={
  combat:['combat-guide','combat','tut-combat','duel','modes','battle-royale','team-battle','war-campaign','abyss'],
  mastery:['mastery','jadewind','characters'],
  pokemax:['pets','species','lab','genes','petbattle','catching','gyms','league','team-comet','primordial','tut-pokemax'],
  equipment:['gear','weapons','consumables','economy','badges','mechas','mechawpn','hangar','mechafight','pilot','portal'],
  world:['valestia','lore','story','sides','mysteries','factions','clans','diplomacy','sabotage'],
  expedition:['expeditions','sunken-fang','hollowstar-crater','nyxhaven'],
  raid:['raids'],
  welcome:['start','player-portal','changelog','screens']
 };
 const config={
  combat:['combat-arena.webp','ember','sword'],mastery:['mastery-sanctuary.webp','arcane','spark'],
  pokemax:['/assets/editorial/pokemax-companions-v1.webp','sage','leaf'],equipment:['equipment-workshop.webp','gold','gear'],
  world:['/assets/editorial/adventure-trail-v1.webp','sage','map'],expedition:['/assets/updates-20261109/harrowmere-vigil.webp','amber','compass'],
  raid:['/assets/raids/jade-arena.webp','crimson','crown'],welcome:['/assets/editorial/guardian-refuge-v1.webp','gold','book']
 };
 const group=id=>Object.keys(groups).find(k=>groups[k].includes(id));
 window.GuardiansPageTone=id=>config[group(id)]?.[1]||'sage';
 window.GuardiansPageHeader=(id,p,th)=>{
  const key=group(id);if(!key)return '';
  let [src,tone,symbol]=config[key];src=src.startsWith('/')?src:art+src;
  if(id==='valestia')src='/assets/editorial/valestia-dawn.webp';
  return `<header class="ph nv-hero" data-tone="${tone}"><img class="nv-hero-art" src="${src}" alt="" decoding="async"><div class="nv-hero-copy"><div class="ph__e">${icon(symbol)}<span>${L(p.e,th.e)}</span></div><h1>${L(p.t,th.t)}</h1>${p.d?`<p class="ph__d">${L(p.d,th.d)}</p>`:''}<div class="nv-hero-rule" aria-hidden="true"><i></i><span>VALESTIA</span></div></div></header>`;
 };
 const oldCombat=PAGES['combat-guide'].h;
 PAGES['combat-guide'].h=()=>tutorial()+oldCombat();
 const oldHome=PAGES.home.h;
 PAGES.home.h=()=>oldHome().replace('<section class="ed-section ed-world">',`<nav class="nv-quick" aria-label="${L('Choose your next step','Elige tu próximo paso')}">${[['play','sword','Play','Jugar'],['valestia','map','Explore','Explorar'],['combat-guide','book','Learn','Aprender']].map(([id,i,en,es])=>`<a href="${url(id)}">${icon(i)}<span>${L(en,es)}</span>${icon('arrow')}</a>`).join('')}</nav><section class="ed-section ed-world">`);
 const oldBadges=PAGES.badges.h;PAGES.badges.h=()=>oldBadges().replace(/(<span class="fg-badge-icon"[^>]*>)[\s\S]*?<\/span>/g,'$1'+icon('shield')+'</span>');
 // Native links remain usable without JS; only decorative glyphs are replaced.
 window.GuardiansNavIcon=id=>icon(config[group(id)]?.[2]||'book');
 window.GuardiansDesignHeader=el=>{
  const tools=el.querySelector('.ed-header-tools');if(!tools||tools.querySelector('.nv-search'))return;
  const button=document.createElement('button');button.type='button';button.className='nv-search';button.setAttribute('aria-label',L('Search the guide','Buscar en la guía'));button.innerHTML=icon('search')+`<span>${L('Search','Buscar')}</span>`;
  tools.prepend(button);button.onclick=()=>{const rail=document.getElementById('rail');if(!rail.classList.contains('is-open')&&(innerWidth<=940||document.body.classList.contains('ed-home')))document.getElementById('burger').click();document.getElementById('q').focus();};
 };

 const lessons=()=>({
  focus:{title:L('Rest → Focus → Parry','Rest → Focus → Parry'),hero:'guardian',other:'fallen-squire',otherName:L('Example opponent','Rival del ejemplo'),max:350,
   premise:L('Group situation: the opponent attacks another ally during rounds 1–2. This view follows your Guardian. STR 10, CON 10, AGI 0; no gear, mastery, criticals, dodges or damage reduction. Damage rolls are fixed for this lesson.','Situación de grupo: el rival ataca a otro aliado durante las rondas 1–2. Esta vista sigue a tu Guardián. STR 10, CON 10, AGI 0; sin equipo, maestrías, críticos, esquivas ni reducción de daño. Las tiradas están fijadas para esta lección.'),
   frames:[
    {hp:100,other:350,focus:0,action:L('Read the situation','Lee la situación'),title:L('You have room to recover','Puedes recuperarte'),text:L('You have 100/200 HP. Nobody will attack you this round. Rest can heal you and prepare Focus.','Tienes 100/200 HP. Nadie te atacará esta ronda. Rest puede curarte y preparar Focus.'),formula:'HP 100 / 200',cue:'rest'},
    {hp:150,other:350,focus:1,action:'Rest',title:L('Round 1 · Rest succeeds','Ronda 1 · Rest tiene éxito'),text:L('You recover 50 HP and gain Focus. The enemy was occupied with your teammate, so your Rest was not interrupted.','Recuperas 50 HP y obtienes Focus. El enemigo estaba ocupado con tu compañero, por lo que no interrumpió tu descanso.'),formula:'20 + 3 × CON 10 = 50 HP',cue:'rest'},
    {hp:150,other:250,focus:0,action:'Attack',title:L('Round 2 · Spend Focus','Ronda 2 · Gasta Focus'),text:L('The chosen base roll gives 50 damage. Focus doubles it to 100 and is consumed. With no defenses in this example, the opponent loses 100 HP.','La tirada elegida da 50 de daño base. Focus lo duplica a 100 y se consume. Sin defensas en este ejemplo, el rival pierde 100 HP.'),formula:'(4 × STR 10 + 10) × Focus 2 = 100',cue:'attack'},
    {hp:150,other:210,focus:0,action:'Parry',title:L('Round 3 · Block and answer','Ronda 3 · Bloquea y responde'),text:L('The opponent now attacks you for 60. Your 60 Parry defense blocks it completely. The normal counter deals 40; you lose no HP. A stronger hit could break that guard.','El rival ahora te ataca por 60. Tu defensa de Parry de 60 lo bloquea por completo. El contraataque normal inflige 40; no pierdes HP. Un golpe más fuerte podría romper esa guardia.'),formula:L('Guard: 5 × CON + STR = 60 · Counter: 3 × CON + STR = 40','Defensa: 5 × CON + STR = 60 · Respuesta: 3 × CON + STR = 40'),cue:'parry'}
   ]},
  support:{title:L('Alchemist · help an ally','Alquimista · ayuda a un aliado'),hero:'alchemist',other:'guardian',otherName:L('Your ally','Tu aliado'),max:200,
   premise:L('Stage 1 Alchemist with CON 10. We isolate your support decisions: neither visible ally receives damage in these two rounds. A dose heals 40 HP and shares the auxiliary-use slot with your equipped consumable and First Aid Kit.','Alquimista en etapa 1 con CON 10. Aislamos tus decisiones de apoyo: ninguno de los dos aliados visibles recibe daño en estas dos rondas. Una dosis cura 40 HP y comparte el uso auxiliar con tu consumible equipado y First Aid Kit.'),
   frames:[
    {hp:100,other:80,focus:0,dose:0,action:L('Prepare support','Prepara el apoyo'),title:L('Your ally needs healing','Tu aliado necesita curación'),text:L('Your ally has 80/200 HP. You have no stored dose yet. Choose a safe Rest to prepare one.','Tu aliado tiene 80/200 HP. Todavía no tienes una dosis guardada. Elige un Rest seguro para preparar una.'),formula:L('Stored doses: 0 / 1','Dosis guardadas: 0 / 1'),cue:'rest'},
    {hp:150,other:80,focus:1,dose:1,action:'Rest',title:L('Round 1 · Create a dose','Ronda 1 · Crea una dosis'),text:L('Successful Rest heals you for 50, prepares Focus and creates one dose. That dose can be used from the next round; interrupted Rest would create none.','Un Rest exitoso te cura 50, prepara Focus y crea una dosis. Esa dosis puede usarse desde la ronda siguiente; un Rest interrumpido no crearía ninguna.'),formula:L('Created: 1 / 2 this fight · Stored: 1 / 1','Creadas: 1 / 2 en el combate · Guardadas: 1 / 1'),cue:'rest'},
    {hp:150,other:120,focus:1,dose:0,action:L('Dose + Parry','Dosis + Parry'),title:L('Round 2 · Heal and choose an action','Ronda 2 · Cura y elige una acción'),text:L('Prepare the dose for your ally, then choose Parry as your main action. The dose heals 40: 80 becomes 120 HP. You spend no inventory potion. Parry does not spend your Focus.','Prepara la dosis para tu aliado y elige Parry como acción principal. La dosis cura 40: pasa de 80 a 120 HP. No gastas una poción del inventario. Parry no consume tu Focus.'),formula:'80 + 40 = 120 / 200 HP',cue:'heal'}
   ]}
 });
 function fighter(src,name,hp,max,side){return `<div class="nv-fighter ${side}"><div class="nv-health"><div><strong>${name}</strong><span>${hp} / ${max} HP</span></div><div class="nv-hp-track" role="progressbar" aria-label="${esc(name+' HP')}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${hp}"><i style="width:${hp/max*100}%"></i></div></div><img src="${art+src}.webp" alt="" width="260" height="280"></div>`;}
 function frameHTML(lesson,index){const f=lesson.frames[index];return `<div class="nv-stage" data-cue="${f.cue}">${fighter(lesson.hero,L('Your Guardian','Tu Guardián'),f.hp,200,'nv-you')}<span class="nv-versus" aria-hidden="true">${icon(lesson.hero==='alchemist'?'flask':'sword')}</span>${fighter(lesson.other,lesson.otherName,f.other,lesson.max,'nv-other')}<div class="nv-status"><span class="${f.focus?'is-charged':''}">${icon('spark')}Focus ${f.focus?L('ready','listo'):L('empty','vacío')}</span>${f.dose===undefined?'':`<span>${icon('flask')}${L('Dose','Dosis')} ${f.dose}/1</span>`}<span>${icon(f.cue==='rest'?'moon':f.cue==='attack'?'sword':'shield')}${f.action}</span></div></div><div class="nv-lesson-copy"><p class="ed-label">${L('Observe → choose → understand','Observa → elige → entiende')}</p><h3>${f.title}</h3><p>${f.text}</p><div class="nv-formula">${f.formula}</div></div>`;}
 function tutorial(){const lesson=lessons().focus;return `<section class="nv-lesson" id="combat-visual" data-lesson="focus" data-step="0"><div class="nv-lesson-heading"><div><p class="ed-label">${L('A guided battle','Un combate guiado')}</p><h2>${L('Watch each decision take shape.','Mira qué cambia con cada decisión.')}</h2></div><label>${L('Choose a lesson','Elige una lección')}<select data-lesson-select><option value="focus">${lesson.title}</option><option value="support">${lessons().support.title}</option></select></label></div><p class="nv-lesson-intro">${L('Step through an illustrated example at your own pace. It is a lesson, not a live fight; it uses no account, items or OIL.','Recorre un ejemplo ilustrado a tu ritmo. Es una lección, no un combate real; no usa tu cuenta, objetos ni OIL.')}</p><div data-lesson-view>${frameHTML(lesson,0)}</div><div class="nv-lesson-controls"><button type="button" data-lesson-prev disabled>${L('Previous','Anterior')}</button><div data-lesson-steps>${lesson.frames.map((_,i)=>`<button type="button" data-lesson-step="${i}" aria-label="${L('Show step','Ver paso')} ${i}" ${i===0?'aria-current="step"':''}>${i}</button>`).join('')}</div><button class="nv-next" type="button" data-lesson-next>${L('Next round','Siguiente ronda')}${icon('arrow')}</button></div><p class="nv-lesson-announcement" role="status" aria-live="polite"></p><details class="nv-assumptions"><summary>${L('Conditions of this example','Condiciones de este ejemplo')}</summary><p data-lesson-premise>${lesson.premise}</p></details><noscript><p>${L('Enable JavaScript for the round controls, or use the complete written examples below.','Activa JavaScript para recorrer las rondas, o utiliza los ejemplos completos escritos más abajo.')}</p></noscript></section>`;}
 function updateLesson(root,index,key=root.dataset.lesson){const lesson=lessons()[key];index=Math.max(0,Math.min(lesson.frames.length-1,index));root.dataset.lesson=key;root.dataset.step=index;root.querySelector('[data-lesson-view]').innerHTML=frameHTML(lesson,index);root.querySelector('[data-lesson-prev]').disabled=index===0;root.querySelector('[data-lesson-next]').disabled=index===lesson.frames.length-1;root.querySelector('[data-lesson-steps]').innerHTML=lesson.frames.map((_,i)=>`<button type="button" data-lesson-step="${i}" aria-label="${L('Show step','Ver paso')} ${i}" ${i===index?'aria-current="step"':''}>${i}</button>`).join('');root.querySelector('[data-lesson-premise]').textContent=lesson.premise;root.querySelector('[role="status"]').textContent=lesson.frames[index].title;}
 document.addEventListener('click',e=>{const root=e.target.closest('.nv-lesson');if(!root)return;const b=e.target.closest('button');if(!b)return;const n=Number(root.dataset.step);if(b.hasAttribute('data-lesson-prev'))updateLesson(root,n-1);if(b.hasAttribute('data-lesson-next'))updateLesson(root,n+1);if(b.hasAttribute('data-lesson-step')){const i=+b.dataset.lessonStep;updateLesson(root,i);root.querySelector(`[data-lesson-step="${i}"]`).focus();}});
 document.addEventListener('change',e=>{if(e.target.matches('[data-lesson-select]'))updateLesson(e.target.closest('.nv-lesson'),0,e.target.value);});

 const regionIds=['starter_ruins','stormbay_docks','black_lotus_wood','merchant_crossroads','ravencraft','mist_forest','rocky_chill_pass','crimson_plain','bandit_caves','dark_knight_sanctum','greywood'];
 function regionArt(id){if(id==='stormbay')id='stormbay_docks';if(regionIds.includes(id))return art+'region-'+id+'.webp';if(id==='harrowmere')return '/assets/updates-20261109/harrowmere-vigil.webp';return null;}
 window.GuardiansDossierArt=id=>{const src=regionArt(id);return (src?`<img class="nv-region-cover" src="${src}" alt="" width="900" height="450">`:'')+`<button type="button" class="nv-sheet-close" data-close-dossier aria-label="${L('Close place card','Cerrar ficha del lugar')}">${icon('close')}</button>`;};
 window.GuardiansDossierSelected=(id,fromMap)=>{const section=document.getElementById('valestia-map');if(!section)return;section.querySelector('.atlas__s').setAttribute('aria-label',L('Place details: ','Ficha del lugar: ')+PLACES[id].n);if(fromMap&&innerWidth<=700)section.classList.add('nv-sheet-open');};
 let expanded=null,previousFocus=null,inertNodes=[];
 function closeMap(){if(!expanded)return;expanded.classList.remove('nv-expanded','nv-sheet-open');expanded.removeAttribute('role');expanded.removeAttribute('aria-modal');document.body.classList.remove('nv-map-open');expanded.querySelector('[data-atlas-expand]').setAttribute('aria-expanded','false');inertNodes.forEach(n=>n.inert=false);inertNodes=[];const target=previousFocus;expanded=null;if(target?.isConnected)target.focus();}
 function openMap(section,button){expanded=section;previousFocus=button;section.classList.add('nv-expanded');section.setAttribute('role','dialog');section.setAttribute('aria-modal','true');document.body.classList.add('nv-map-open');button.setAttribute('aria-expanded','true');document.querySelectorAll('.ed-header,.rail,.page.is-on > *').forEach(n=>{if(n!==section&&!n.contains(section)&&!n.inert){n.inert=true;inertNodes.push(n);}});section.querySelector('[data-atlas-close]').focus();}
 window.GuardiansAtlasDesignMount=()=>{
  const section=document.getElementById('valestia-map');if(section.dataset.visualMounted)return;section.dataset.visualMounted='true';
  const tool=section.querySelector('.atlas-toolbar');tool.insertAdjacentHTML('beforeend',`<button type="button" data-atlas-expand aria-expanded="false">${icon('expand')}<span>${L('Full screen','Pantalla completa')}</span></button><button type="button" data-atlas-close aria-label="${L('Close full screen','Cerrar pantalla completa')}">${icon('close')}<span>${L('Close','Cerrar')}</span></button>`);
  tool.querySelector('[data-atlas-expand]').onclick=e=>openMap(section,e.currentTarget);tool.querySelector('[data-atlas-close]').onclick=closeMap;
  section.addEventListener('click',e=>{if(e.target.closest('[data-close-dossier]')){section.classList.remove('nv-sheet-open');section.querySelector('#atlas-place').focus();}if(e.target.closest('#dos a'))closeMap();});
 };
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){const s=document.getElementById('valestia-map');if(s?.classList.contains('nv-sheet-open')){s.classList.remove('nv-sheet-open');s.querySelector('#atlas-place').focus();e.preventDefault();return;}if(expanded){closeMap();e.preventDefault();}}
  if(e.key==='Tab'&&expanded){const nodes=[...expanded.querySelectorAll('button:not([disabled]),a[href],select,[tabindex="0"]')].filter(el=>el.getClientRects().length);const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
 });
 window.GuardiansVisualRoute=id=>{
  if(id!=='valestia'||(expanded&&!expanded.isConnected)){closeMap();document.getElementById('valestia-map')?.classList.remove('nv-sheet-open');}
  const active=document.getElementById('pg-'+id);if(!active)return;
  active.querySelectorAll('.cg-symbol').forEach((s,i)=>{s.innerHTML=icon(['sword','shield','moon'][i%3]);});
 };
};
