(() => {
 const $=id=>document.getElementById(id),es=document.documentElement.lang==='es';let loading=false;
 $('begin').onclick=async()=>{
  if(loading)return;loading=true;$('begin').disabled=true;$('welcome').hidden=true;$('game').hidden=false;
  const scripts=['/animation-lab/vendor/phaser-3.90.0.min.js','/animation-lab/feedback.js?v=22','/battle-practice/rules.js?v=1','/animation-lab/special.js?v=23','/battle-practice/music.js?v=1','/battle-practice/practice.js?v=14','/play/encounter.js?v=1','/play/feedback.js?v=1','/play/demo.js?v=2','/animation-lab/drawn.js?v=22'];
  try{for(const src of scripts)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.body.append(script);});}
  catch{$('loading').textContent=es?'No se pudo cargar la demo. Recarga la página para intentarlo de nuevo.':'The demo could not load. Reload the page to try again.';}
 };
})();
