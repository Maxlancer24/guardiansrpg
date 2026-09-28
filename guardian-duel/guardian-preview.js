(()=>{'use strict';
const en=new URLSearchParams(location.search).get('lang')==='en',tr=(es,english)=>en?english:es,pack=GUARDIAN_ACTIONS,images={};
const names={idle:['Reposo','Idle'],attack:['Ataque','Attack'],guard:['Guardia / Parry','Guard / Parry'],hurt:['Daño recibido','Hit reaction'],rest:['Descanso','Rest'],motion:['Entrada y regreso','Approach and return'],activation:['Activación','Activation'],victory:['Victoria','Victory'],defeat:['Derrota','Defeat']};
document.documentElement.lang=en?'en':'es';document.title=document.querySelector('#title').textContent=tr('Guardián · Animaciones','Guardian · Animations');
document.querySelector('#lang').textContent=en?'Español':'English';document.querySelector('#lang').href=en?'?lang=es':'?lang=en';
document.querySelector('#speed-label').textContent=tr('Velocidad','Speed');document.querySelector('#play').textContent=tr('Probar combate →','Try battle →');
document.querySelector('#intro').textContent=tr('Avatar narrativo de las quests. Nueve animaciones dibujadas; idle a 1×. No concede una habilidad propia: la activa depende del arma equipada.','Quest player avatar. Nine hand-drawn animations; idle at 1×. No innate skill is added: the active ability comes from the equipped weapon.');
const canvases={};let paused=false,last=0,clock=0;
document.querySelector('#pause').onclick=()=>{paused=!paused;document.querySelector('#pause').textContent=paused?tr('Continuar','Resume'):tr('Pausar','Pause');};
for(const key of Object.keys(pack)){
 const article=document.createElement('article'),heading=document.createElement('h2'),canvas=document.createElement('canvas');
 heading.textContent=names[key][en?1:0];canvas.width=380;canvas.height=300;canvases[key]=canvas;article.append(heading,canvas);document.querySelector('.gallery').append(article);
}
function drawFrame(ctx,key,f,x=190,y=277,size=230){
 const a=pack[key],r=a.frames[f],s=a.scale*GuardianScale.factor('guardian',size);
 ctx.drawImage(images[key],r[0],r[1],r[2],r[3],x-r[4]*s,y-r[5]*s,r[2]*s,r[3]*s);
}
function render(){for(const[key,canvas]of Object.entries(canvases)){
 const ctx=canvas.getContext('2d'),a=pack[key],ms=key==='idle'?clock:clock*Number(document.querySelector('#speed').value),time=ms%(GuardianAnimation.duration(a)+500),f=GuardianAnimation.frame(a,time,key==='idle');
 ctx.clearRect(0,0,380,300);ctx.fillStyle='#173b30';ctx.fillRect(0,275,380,25);ctx.strokeStyle='#75967b';ctx.beginPath();ctx.moveTo(0,277);ctx.lineTo(380,277);ctx.stroke();drawFrame(ctx,key,f);
 if(key==='attack')GuardianMeleeFX.draw(ctx,{id:'guardian',age:time+360,frame:f,pack:a,factor:GuardianScale.factor('guardian',230),x:190,y:277});
 ctx.fillStyle='#e8d598';ctx.font='12px system-ui';ctx.fillText(`${f+1}/6`,10,18);
}}
Promise.all(Object.entries(pack).map(([key,a])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[key]=im;resolve()};im.onerror=reject;im.src=a.src;}))).then(()=>{
 window.guardianPreview={drawFrame,pack,setTime(ms){clock=ms;paused=true;render();},ready:true};
 function tick(t){if(last&&!paused&&!document.hidden)clock+=Math.min(80,t-last);last=t;render();requestAnimationFrame(tick);}requestAnimationFrame(tick);
}).catch(()=>{document.querySelector('#intro').textContent=tr('No se pudieron cargar los sprites.','Unable to load sprites.');});
})();
