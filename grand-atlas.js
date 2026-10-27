/* Locations are measured against the approved 1697 × 927 bilingual atlas. */
window.GuardiansGrandAtlas=function(ctx){
 'use strict';
 const {L,PLACES,DTR}=ctx;
 const positions={
  starter_ruins:[10.1,27.9],greywood:[23.8,20.8],ravennor:[20.7,36.5],
  black_lotus_wood:[34.5,38.4],stormbay:[28.1,54.3],cape_greyveil:[11.9,57.6],
  ravencraft:[47.1,41.3],merchant_crossroads:[45.1,55.5],mist_forest:[51.2,26.7],
  rocky_chill_pass:[65.7,15.4],crimson_plain:[61.7,57.8],bandit_caves:[74.1,39.9],
  dark_knight_sanctum:[92.7,32.6],millhaven:[37,19.1],aldenmoor:[46.6,15.4],
  ironhollow:[60.1,18.9],tawnholt:[55.8,6.2],dragons_lair:[66.5,7.2],
  valdris_keep:[88.7,10.2],veldran:[78.5,23.5],mirefall:[78.3,55.6],
  titans_arena:[94.2,59.9],unnamed_cove:[36.1,65.1],wasteland:[86.5,44.3],
 };
 Object.entries(positions).forEach(([id,[x,y]])=>Object.assign(PLACES[id],{x,y}));
 // The old generic seal marker has no matching landmark on the approved atlas.
 PLACES.seal_1.t='geo';
 PLACES.willowcross={n:'Willowcross',x:61.4,y:47.9,t:'story',d:'A village across a stone river bridge, reached after Verdant Fields on the road from Veldran toward Mirefall. The beginning of Chapter IV.'};
 DTR[PLACES.willowcross.d]='Aldea al otro lado de un puente de piedra, después de Verdant Fields, en el camino de Veldran hacia Mirefall. El comienzo del capítulo IV.';
 const destinations=[
  ['sunken_fang_archipelago','Sunken Fang',13.8,86.5,'sunken-fang','A tidal archipelago beyond the Sable Sea, built over the ribs of an ancient leviathan. Board a scheduled expedition from Ravennor.','Archipiélago de mareas más allá del Sable Sea, sobre las costillas de un leviatán ancestral. Embarca en una expedición programada desde Ravennor.'],
  ['hollowstar_crater','Hollowstar',39.6,86.5,'hollowstar-crater','A distant impact basin with craterglass terraces and the Starwarden Observatory. Expedition departures are from Ravennor.','Cuenca de impacto lejana con terrazas de craterglass y el Starwarden Observatory. Las expediciones salen de Ravennor.'],
  ['harrowmere','Harrowmere',63.4,86.5,'expeditions','A vanished harvest village returning through the fog. Lanterns, the bellkeeper and the Procession shape this expedition from Ravennor.','Una aldea de cosecha desaparecida que regresa entre la niebla. Los faroles, el campanero y la Procesión dan forma a esta expedición desde Ravennor.'],
  ['nyxhaven','Nyxhaven',87.1,86.5,'nyxhaven','A frozen island kingdom far east of Valestia, with moonlit gardens and mirror-water courts. Board the expedition from Ravennor.','Reino insular helado al este lejano de Valestia, con jardines de luna y patios de aguas espejadas. Embarca en la expedición desde Ravennor.'],
 ];
 destinations.forEach(([id,n,x,y,guide,d,es])=>{PLACES[id]={n,x,y,t:'expedition',guide,d};DTR[d]=es;});
 const src=()=>`/assets/atlas/valestia-grand-atlas-${L('en','es')}-v1.webp`;
 const jpg=lang=>`/assets/atlas/valestia-discord-${lang}-v1.jpg`;
 window.GuardiansAtlasSource=src;
 window.GuardiansAtlasToolbar=()=>`<div class="atlas-toolbar">
  <div class="atlas-zoom"><button type="button" data-atlas-zoom="out" aria-label="${L('Zoom out','Alejar')}">−</button><output id="atlas-zoom-value" aria-live="polite">100%</output><button type="button" data-atlas-zoom="in" aria-label="${L('Zoom in','Acercar')}">+</button><button type="button" data-atlas-zoom="fit">${L('Fit','Ajustar')}</button></div>
  <label class="atlas-picker" for="atlas-place">${L('Find a place','Buscar un lugar')}<select id="atlas-place">${Object.entries(PLACES).filter(([,p])=>p.t!=='geo').sort(([,a],[,b])=>a.n.localeCompare(b.n)).map(([id,p])=>`<option value="${id}">${p.n}</option>`).join('')}</select></label>
  <button type="button" id="atlas-markers" aria-pressed="true">${L('Markers','Marcadores')}</button>
 </div><div class="atlas-downloads"><a href="${jpg(L('en','es'))}" target="_blank" rel="noopener">${L('Open full-size image','Abrir imagen completa')} ↗</a><a href="${jpg('es')}" download="Valestia-Discord-ES.jpg">${L('Download · Spanish','Descargar · Español')} ↓</a><a href="${jpg('en')}" download="Valestia-Discord-EN.jpg">${L('Download · English','Descargar · Inglés')} ↓</a></div>
 <p class="atlas-help">${L('Zoom in and scroll to explore the artwork. Select a marker or use the place list. Expedition charts are not to scale; departure is from Ravennor.','Acerca y desplázate para explorar la ilustración. Selecciona un marcador o usa la lista de lugares. Las cartas de expedición están fuera de escala; la salida es desde Ravennor.')}</p>`;
 window.GuardiansAtlasMount=function(select){
  const viewport=document.getElementById('map'),wrap=viewport.querySelector('.mapwrap'),picker=document.getElementById('atlas-place');
  let zoom=1;
  document.querySelectorAll('[data-atlas-zoom]').forEach(button=>button.addEventListener('click',()=>{
   const mode=button.dataset.atlasZoom,oldWidth=wrap.offsetWidth,cx=(viewport.scrollLeft+viewport.clientWidth/2)/oldWidth,cy=(viewport.scrollTop+viewport.clientHeight/2)/wrap.offsetHeight;
   zoom=mode==='fit'?1:Math.max(1,Math.min(4,zoom+(mode==='in'?.5:-.5)));
   wrap.style.width=(zoom*100)+'%';document.getElementById('atlas-zoom-value').textContent=Math.round(zoom*100)+'%';
   document.querySelector('[data-atlas-zoom="out"]').disabled=zoom===1;
   document.querySelector('[data-atlas-zoom="in"]').disabled=zoom===4;
   viewport.scrollLeft=mode==='fit'?0:cx*wrap.offsetWidth-viewport.clientWidth/2;
   viewport.scrollTop=mode==='fit'?0:cy*wrap.offsetHeight-viewport.clientHeight/2;
  }));
  document.querySelector('[data-atlas-zoom="out"]').disabled=true;
  picker.addEventListener('change',()=>{
   select(picker.value,true);
   const pin=wrap.querySelector(`[data-n="${picker.value}"]`);
   if(pin){viewport.scrollLeft=pin.offsetLeft-viewport.clientWidth/2;viewport.scrollTop=pin.offsetTop-viewport.clientHeight/2;}
  });
  document.getElementById('atlas-markers').addEventListener('click',function(){
   const show=this.getAttribute('aria-pressed')!=='true';this.setAttribute('aria-pressed',String(show));wrap.classList.toggle('hide-pins',!show);
  });
 };
};
