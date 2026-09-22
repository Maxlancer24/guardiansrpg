/* Hidden, standalone battle sandbox. No account, API or game database access. */
(() => {
  "use strict";
  const es = document.documentElement.lang === "es";
  const $ = id => document.getElementById(id);
  const canvas = $("battle-canvas"), ctx = canvas.getContext("2d", {alpha:false});
  const stage = $("battle-stage"), shell = $("battle-shell");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const say = (a,b) => es ? a : b;
  const clamp = (v,a=0,b=1) => Math.min(b,Math.max(a,v));
  const lerp = (a,b,t) => a+(b-a)*t;
  const ease = t => {t=clamp(t);return t*t*(3-2*t);};
  const rand = (a,b) => a+Math.random()*(b-a);
  const ROOT = "/assets/demo-battle/";
  const assets = {};
  let ready=false, clock=0, previous=0, width=1280, height=680, sound=false, audio;
  let state, particles=[], rings=[], rays=[], numbers=[], blasts=[];
  let shake=0, hitStop=0, goldFlash=0, hero={x:270,y:462,h:276}, enemyPos={};
  const max={jessie:140,marauder:80,warden:110};
  const buttons=[...$("actions").querySelectorAll("button")];
  const targetButtons=[...$("targets").querySelectorAll("button")];
  const idlePaths=Array.from({length:8},(_,i)=>ROOT+"jessie-idle-v2/frame-"+String(i+1).padStart(2,"0")+".png");
  const quickPaths=Array.from({length:8},(_,i)=>ROOT+"jessie-quick-shot-v1/frame-"+String(i+1).padStart(2,"0")+".png");
  function load(key,src) {return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{assets[key]=im;resolve();};im.onerror=()=>reject(new Error("Asset: "+src));im.src=src;});}
  function resize() {
    const box=stage.getBoundingClientRect(), dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(box.width*dpr);canvas.height=Math.round(box.height*dpr);
    width=1280;height=1280*box.height/box.width;
    hero={x:width*.235,y:height*.725,h:Math.min(height*.435,width*.25)};
    enemyPos={marauder:{x:width*.635,y:height*.725,h:Math.min(height*.345,width*.20)},warden:{x:width*.855,y:height*.70,h:Math.min(height*.40,width*.235)}};
  }
  new ResizeObserver(resize).observe(stage);
  function reset() {
    state={hp:{...max},target:"marauder",mode:"idle",t:0,events:new Set(),cooldown:0,focus:false,guard:false,round:1,hits:0,enemyQueue:[],hurt:{},deadAt:{}};
    particles=[];rings=[];rays=[];numbers=[];blasts=[];shake=goldFlash=hitStop=0;
    $("result").hidden=true;stage.classList.remove("cinematic");$("combo").classList.remove("visible");
    log(say("Elige un objetivo y una habilidad.","Choose a target and a skill."));
    update();
  }
  function log(text){$("battle-log").textContent=text;}
  function update() {
    const idle=ready&&state.mode==="idle";
    buttons.forEach(b=>b.disabled=!idle||(b.dataset.action==="dual"&&state.cooldown>0));
    targetButtons.forEach(b=>{
      const id=b.dataset.target, hp=state.hp[id];
      b.disabled=!idle||hp<=0;b.classList.toggle("selected",state.target===id);b.classList.toggle("dead",hp<=0);
      b.setAttribute("aria-pressed",String(state.target===id));
      b.querySelector("b").style.width=(hp/max[id]*100)+"%";b.querySelector("em").textContent=hp+" / "+max[id];
    });
    $("hero-hp-bar").style.width=(state.hp.jessie/max.jessie*100)+"%";
    $("hero-hp").textContent=state.hp.jessie+" / "+max.jessie;
    $("hero-status").textContent=state.focus?say("ATAQUE POTENCIADO","ATTACK EMPOWERED"):state.guard?say("EN GUARDIA","GUARDING"):"";
    $("dual-detail").textContent=state.cooldown>0?say("Recarga: ","Cooldown: ")+state.cooldown+say(" turnos"," turns"):say("Ráfaga · Todos","Barrage · All enemies");
    $("turn-label").textContent=state.mode==="enemy"?say("TURNO ENEMIGO","ENEMY TURN"):state.mode==="result"?say("FIN DEL ENCUENTRO","ENCOUNTER ENDED"):idle?say("TU TURNO","YOUR TURN"):say("EN ACCIÓN","IN ACTION");
    $("combo").querySelector("strong").textContent=state.hits;
  }
  function begin(mode) {
    state.mode=mode;state.t=0;state.events.clear();update();
  }
  function once(at,id,fn) {
    if(state.t>=at&&!state.events.has(id)){state.events.add(id);fn();}
  }
  function attack(kind) {
    if(!ready||state.mode!=="idle"||(kind==="dual"&&state.cooldown))return;
    if(sound)unlockAudio();
    state.hits=0;$("combo").classList.remove("visible");
    if(kind==="dual"){state.cooldown=3;log(say("Jessie · Colmillo gemelo","Jessie · Twin Fang"));if(!reduced)stage.classList.add("cinematic");}
    else if(kind==="quick")log(say("Jessie · Disparo rápido","Jessie · Quick Shot"));
    else if(kind==="focus"){state.focus=true;log(say("El próximo ataque hará más daño.","The next attack deals more damage."));}
    else {state.guard=true;log(say("Jessie se prepara para el contraataque.","Jessie braces for the counterattack."));}
    begin(kind);
  }
  function hit(id,amount,big=false) {
    if(state.hp[id]<=0)return;
    state.hp[id]=Math.max(0,state.hp[id]-amount);
    state.hurt[id]=clock;
    if(!state.hp[id])state.deadAt[id]=clock;
    const p=id==="jessie"?hero:enemyPos[id];
    burst(p.x,p.y-p.h*.55,big?36:14,big?"#ffe3a4":"#a8eeea",big?450:230);
    rings.push({x:p.x,y:p.y-p.h*.5,t:0,life:big?.55:.3,size:big?150:66,color:big?"#ffe7a6":"#98d9ef"});
    numbers.push({x:p.x+rand(-16,16),y:p.y-p.h*.8,t:0,amount,big});
    shake=reduced?0:big?11:4;hitStop=reduced?0:big?.085:.025;
    if(big)goldFlash=.18;
    if(id!=="jessie"){state.hits++;$("combo").classList.toggle("visible",state.hits>1&&!reduced);}
    tone(big?"impact":"hit");update();
  }
  function burst(x,y,count,color,speed) {
    if(reduced)return;
    for(let i=0;i<count;i++){const a=rand(-Math.PI,Math.PI),v=rand(speed*.25,speed);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-35,t:0,life:rand(.25,.65),color,size:rand(1.5,4)});}
  }
  function fire(id,big=false) {
    const p=enemyPos[id],pose=heroPose(),kneeling=pose.set==="special"&&pose.frame>=12&&pose.frame<=13;
    const x=pose.x+pose.h*.43,y=pose.y-pose.h*(kneeling?.51:.74);
    if(!reduced){
      rays.push({x,y,tx:p.x,ty:p.y-p.h*.52,t:0,life:big?.42:.14,big});
      if(big)blasts.push({x:p.x,y:p.y-p.h*.5,t:0,life:.8});
      burst(x,y,big?24:8,"#ffe9b0",big?250:120);
      rings.push({x,y,t:0,life:.18,size:big?90:35,color:"#ffd390"});
    }
    tone(big?"blast":"shot");
  }
  function endHero() {
    stage.classList.remove("cinematic");state.focus=false;
    if(state.hp.marauder<=0&&state.hp.warden<=0){finish(true);return;}
    state.enemyQueue=["marauder","warden"].filter(id=>state.hp[id]>0);
    log(say("Los enemigos contraatacan.","The enemies counterattack."));
    begin("enemy");
  }
  function finish(win) {
    begin("result");stage.classList.remove("cinematic");
    const result=$("result");result.hidden=false;
    result.querySelector("small").textContent=say(win?"ENCUENTRO COMPLETADO":"ENCUENTRO TERMINADO",win?"ENCOUNTER COMPLETE":"ENCOUNTER ENDED");
    result.querySelector("h2").textContent=say(win?"Camino asegurado":"Jessie ha caído",win?"Road secured":"Jessie has fallen");
    result.querySelector("p").textContent=say("Puedes reiniciar para probar otra estrategia.","Restart to try another strategy.");
  }
  // The action clock drives both poses and effects. Hit-stop pauses this clock,
  // and hidden tabs pause the battle rather than skipping hits or recovery frames.
  function step(dt) {
    if(hitStop>0){hitStop-=dt;return;}
    state.t+=dt;
    const t=state.t;
    if(state.mode==="quick"){
      once(.24,"shot",()=>{fire(state.target);hit(state.target,state.focus?48:28);});
      if(t>.85)endHero();
    }else if(state.mode==="dual"){
      once(.08,"charge",()=>tone("charge"));
      once(.60,"dash",()=>{tone("dash");burst(hero.x,hero.y,18,"#a4dad4",170);});
      // Six paired shots. Every hit is committed once on the timeline.
      for(let i=0;i<6;i++)once(1.00+i*.14,"volley"+i,()=>{
        for(const id of ["marauder","warden"])if(state.hp[id]>0){fire(id);hit(id,state.focus?4:3);}
      });
      once(2.06,"finish-charge",()=>tone("charge"));
      once(2.67,"final",()=>{
        for(const id of ["marauder","warden"])if(state.hp[id]>0){fire(id,true);hit(id,state.focus?18:12,true);}
        burst(hero.x+150,hero.y,28,"#f7d195",280);
      });
      if(t>3.7)endHero();
    }else if(state.mode==="focus"||state.mode==="guard"){
      once(.12,"buff",()=>{rings.push({x:hero.x,y:hero.y-hero.h*.4,t:0,life:.7,size:95,color:"#8de8db"});tone("charge");});
      if(t>.8){
        state.enemyQueue=["marauder","warden"].filter(id=>state.hp[id]>0);
        log(say("Los enemigos contraatacan.","The enemies counterattack."));begin("enemy");
      }
    }else if(state.mode==="enemy"){
      state.enemyQueue.forEach((id,i)=>once(.65+i*.95,"enemy"+id,()=>hit("jessie",Math.ceil((id==="warden"?16:11)*(state.guard?.4:1)))));
      if(state.hp.jessie<=0){finish(false);return;}
      if(t>state.enemyQueue.length*.95+.45){
        state.guard=false;state.cooldown=Math.max(0,state.cooldown-1);state.round++;
        if(state.hp[state.target]<=0)state.target=state.hp.marauder>0?"marauder":"warden";
        begin("idle");log(say("Elige un objetivo y una habilidad.","Choose a target and a skill."));
      }
    }
  }
  function heroPose() {
    const t=state.t, p={...hero,frame:Math.floor(clock*7.5)%8,set:"idle",scale:1};
    if(state.mode==="quick"){p.set="quick";p.frame=Math.min(7,Math.floor(t/.075));}
    if(state.mode==="dual"&&!reduced){
      p.set="special";
      if(t<.60){p.frame=Math.min(3,Math.floor(t/.15));}
      else if(t<.88){p.frame=4+Math.floor((t-.6)/.07)%2;p.x+=lerp(0,160,ease((t-.6)/.28));}
      else if(t<1){p.frame=6;p.x+=160;}
      else if(t<1.88){p.frame=8+Math.floor((t-1)/.07)%4;p.x+=160-Math.sin((t-1)/.14*Math.PI)*3;}
      else if(t<2.12){p.frame=12;p.x+=160;}
      else if(t<2.67){p.frame=12;p.x+=160;}
      else if(t<2.88){p.frame=13;p.x+=155;}
      else if(t<3.08){p.frame=14;p.x+=155;}
      else if(t<3.4){p.frame=4+Math.floor((t-3.08)/.08)%2;p.x+=lerp(155,0,ease((t-3.08)/.32));}
      else{p.set="idle";p.frame=0;}
    }
    return p;
  }
  function cover(im,x,y,w,h) {
    const s=Math.max(w/im.width,h/im.height),iw=im.width*s,ih=im.height*s;
    ctx.drawImage(im,x+(w-iw)/2,y+(h-ih)/2,iw,ih);
  }
  function actorImage(im,x,y,h,alpha=1,rotation=0) {
    const w=h*im.width/im.height;
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(rotation);ctx.drawImage(im,-w/2,-h,w,h);ctx.restore();
  }
  function drawJessie(p,alpha=1) {
    ctx.save();ctx.globalAlpha=alpha;
    // All special cells share one registration and scale. Their empty canvas
    // remains intact; never independently fit a crouching pose to standing height.
    if(p.set==="special"){
      const cell=512,h=p.h*1.12,w=h;
      ctx.drawImage(assets.special,(p.frame%4)*cell,Math.floor(p.frame/4)*cell,cell,cell,p.x-w/2,p.y-h*.9375,w,h);
    }else{
      const im=assets[p.set+p.frame],h=p.h*1.20,w=h*im.width/im.height;
      ctx.drawImage(im,p.x-w/2,p.y-h*.945,w,h);
    }
    ctx.restore();
  }
  function shadow(x,y,w,alpha=.4) {
    ctx.save();ctx.translate(x,y);ctx.scale(1,.22);
    const g=ctx.createRadialGradient(0,0,0,0,0,w);g.addColorStop(0,"rgba(0,0,0,"+alpha+")");g.addColorStop(1,"transparent");ctx.fillStyle=g;ctx.fillRect(-w,-w,2*w,2*w);ctx.restore();
  }
  function glow(x,y,r,color) {
    if(r<=0)return;
    const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,"transparent");
    ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);
  }
  function drawScene() {
    ctx.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);
    ctx.fillStyle="#080f1d";ctx.fillRect(0,0,width,height);
    if(!ready)return;
    const t=state.t, special=state.mode==="dual"&&!reduced;
    const intensity=special?ease(t/.3)*(1-ease((t-3.05)/.6)):0;
    const zoom=1+intensity*.045;
    const jitter=shake>0&&!reduced?Math.sin(clock*97)*shake:0;
    ctx.save();ctx.translate(width/2+jitter,height*.6+jitter*.3);ctx.scale(zoom,zoom);ctx.translate(-width/2,-height*.6);
    cover(assets.bg,0,0,width,height);
    const shade=ctx.createLinearGradient(0,0,0,height);shade.addColorStop(0,"#030a1955");shade.addColorStop(.5,"#09132905");shade.addColorStop(1,"#030a19cc");ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);
    if(intensity>0){
      ctx.fillStyle="rgba(3,9,25,"+(intensity*.78)+")";ctx.fillRect(0,0,width,height);
      glow(width*.56,height*.6,height*.75,"rgba(29,66,110,"+(intensity*.45)+")");
      // Moving directional streaks are effect geometry, never cropped scenery.
      ctx.save();ctx.globalAlpha=intensity*.3;ctx.strokeStyle="#74bfcf";ctx.lineWidth=1;
      for(let i=0;i<24;i++){const y=(i*97+clock*24)%height,x=((i*151-clock*1200)%1600+1600)%1600-200;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+80+(i%4)*35,y-4);ctx.stroke();}ctx.restore();
    }
    for(let i=0;i<24;i++){
      const x=(i*177+Math.sin(clock*.2+i)*20)%width,y=(i*91+height*.1-Math.sin(clock*.3+i)*8)%(height*.8);
      ctx.globalAlpha=.2+Math.sin(clock+i)*.12;ctx.fillStyle=i%3?"#8abcb8":"#eacb92";ctx.fillRect(x,y,1.5,1.5);
    }ctx.globalAlpha=1;
    const pose=heroPose();
    shadow(pose.x,pose.y,75);
    for(const id of ["marauder","warden"]){
      const p=enemyPos[id],dead=state.hp[id]<=0,fade=dead?1-clamp((clock-state.deadAt[id])/.55):1;
      if(fade<=0)continue;
      let dx=0,rot=0;
      if(state.mode==="enemy"){
        const i=state.enemyQueue.indexOf(id),a=t-i*.95;
        if(i>=0&&a>.2&&a<.95){const n=(a-.2)/.75;dx=-Math.sin(n*Math.PI)*145;rot=-Math.sin(n*Math.PI)*.06;}
      }
      const hurt=clamp(1-(clock-(state.hurt[id]??-100))/.24);
      dx+=hurt*12;
      shadow(p.x+dx,p.y,70,fade*.4);
      if(state.target===id&&state.mode==="idle"){
        ctx.save();ctx.strokeStyle="#e3bd7880";ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(p.x,p.y,49,10,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      }
      ctx.save();if(hurt>.1)ctx.filter="brightness("+(1+hurt*1.7)+")";
      actorImage(assets[id],p.x+dx,p.y+(dead?(1-fade)*20:0),p.h*(1+(!reduced?Math.sin(clock*2+(id==="warden"?2:0))*.003:0)),fade,rot);ctx.restore();
    }
    if(special&&t>.6&&t<.88){
      for(let i=3;i>0;i--)drawJessie({...pose,x:pose.x-i*24},.07*(4-i));
    }
    const heroHurt=clamp(1-(clock-(state.hurt.jessie??-100))/.25);
    ctx.save();if(heroHurt>0)ctx.filter="brightness("+(1+heroHurt)+")";
    drawJessie({...pose,x:pose.x-heroHurt*10});ctx.restore();
    if(state.focus||state.mode==="focus"){
      ctx.save();ctx.strokeStyle="#b9a5fa99";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(pose.x,pose.y,56,11,0,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
    if(state.guard){
      ctx.save();ctx.strokeStyle="#88dbff88";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(pose.x+40,pose.y-pose.h*.42,24,pose.h*.45,-.15,-Math.PI/2,Math.PI/2);ctx.stroke();ctx.restore();
    }
    if(special&&t>2.08&&t<2.67){
      const q=clamp((t-2.08)/.59),x=pose.x+pose.h*.43,y=pose.y-pose.h*.51;
      glow(x,y,35+q*95,"rgba(128,223,255,"+(q*.5)+")");
      ctx.save();ctx.strokeStyle="#b9f5ff";ctx.globalAlpha=q;ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(x,y,65*(1-q)+12,clock*7,clock*7+Math.PI*1.5);ctx.stroke();
      for(let i=0;i<8;i++){const a=i*Math.PI/4+clock;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*(90-q*70),y+Math.sin(a)*(90-q*70));ctx.lineTo(x+Math.cos(a)*12,y+Math.sin(a)*12);ctx.stroke();}
      ctx.restore();
    }
    drawEffects();
    ctx.restore();
    if(goldFlash>0&&!reduced){ctx.fillStyle="rgba(255,219,158,"+(goldFlash*.9)+")";ctx.fillRect(0,0,width,height);}
    if(special){const bars=ease(t/.3)*(1-ease((t-3.2)/.4))*height*.055;ctx.fillStyle="#030813";ctx.fillRect(0,0,width,bars);ctx.fillRect(0,height-bars,width,bars);}
    const v=ctx.createLinearGradient(0,height*.78,0,height);v.addColorStop(0,"transparent");v.addColorStop(1,"#060c18aa");ctx.fillStyle=v;ctx.fillRect(0,0,width,height);
  }
  function drawEffects() {
    ctx.save();ctx.globalCompositeOperation="lighter";
    for(const r of rays){
      const a=1-r.t/r.life;ctx.globalAlpha=a;ctx.lineCap="round";ctx.shadowBlur=r.big?25:12;ctx.shadowColor=r.big?"#a7dfff":"#f2a85c";
      ctx.strokeStyle=r.big?"#85ccec":"#f7c779";ctx.lineWidth=r.big?35:4;ctx.beginPath();ctx.moveTo(r.x,r.y);ctx.lineTo(r.tx,r.ty);ctx.stroke();
      ctx.strokeStyle="#fff8df";ctx.lineWidth=r.big?5:1.5;ctx.stroke();
    }ctx.shadowBlur=0;
    for(const p of particles){ctx.globalAlpha=1-p.t/p.life;ctx.strokeStyle=p.color;ctx.lineWidth=p.size;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*.03,p.y-p.vy*.03);ctx.stroke();}
    for(const r of rings){ctx.globalAlpha=(1-r.t/r.life)*.8;ctx.strokeStyle=r.color;ctx.lineWidth=3*(1-r.t/r.life);ctx.beginPath();ctx.arc(r.x,r.y,4+r.size*ease(r.t/r.life),0,Math.PI*2);ctx.stroke();glow(r.x,r.y,25*(1-r.t/r.life),r.color+"66");}
    for(const b of blasts){
      const q=b.t/b.life,fade=Math.pow(1-q,1.4),radius=45+ease(q)*145;
      ctx.globalAlpha=fade;glow(b.x,b.y,radius*1.4,"#398ccc88");glow(b.x,b.y,radius*.7,"#ffe8b599");
      ctx.save();ctx.translate(b.x,b.y);
      for(let i=0;i<9;i++){
        ctx.save();ctx.rotate(i*Math.PI*2/9+q*.6);ctx.fillStyle=i%2?"#81dbff":"#ffe8ab";
        ctx.beginPath();ctx.moveTo(radius*.08,-3);ctx.quadraticCurveTo(radius*.6,-radius*.16,radius*(i%2?1.4:1),0);ctx.quadraticCurveTo(radius*.55,5,radius*.12,4);ctx.closePath();ctx.fill();ctx.restore();
      }
      ctx.strokeStyle="#b4efff";ctx.lineWidth=4*fade;ctx.beginPath();ctx.ellipse(0,0,radius*.65,radius*1.15,-.4,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle="#ffdc99";ctx.lineWidth=2*fade;ctx.beginPath();ctx.ellipse(0,0,radius*1.12,radius*.55,.3,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
    ctx.restore();
    for(const n of numbers){
      ctx.save();ctx.globalAlpha=clamp((1.1-n.t)*2);ctx.translate(n.x,n.y-Math.min(n.t,.6)*45);
      const s=1+Math.max(0,1-n.t/.12)*.3;ctx.scale(s,s);ctx.textAlign="center";
      ctx.font=(n.big?"italic bold 39px":"bold 27px")+" Georgia";ctx.lineWidth=4;ctx.strokeStyle="#241b24";ctx.strokeText(n.amount,0,0);ctx.fillStyle=n.big?"#ffe1a1":"#f3eed6";ctx.fillText(n.amount,0,0);
      if(n.big){ctx.font="bold 9px system-ui";ctx.fillStyle="#ffd48a";ctx.fillText(say("REMATE","FINISHER"),0,-34);}ctx.restore();
    }
  }
  function animate(now) {
    let dt=Math.min((now-previous)/1000||0,.04);previous=now;
    if(document.hidden)dt=0;
    clock+=dt;
    if(ready&&dt>0){
      step(dt);shake=Math.max(0,shake-dt*55);goldFlash=Math.max(0,goldFlash-dt*1.2);
      for(const p of particles){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;}
      particles=particles.filter(p=>p.t<p.life);
      for(const list of [rings,rays,blasts]){for(const p of list)p.t+=dt;}
      rings=rings.filter(p=>p.t<p.life);rays=rays.filter(p=>p.t<p.life);blasts=blasts.filter(p=>p.t<p.life);
      for(const n of numbers)n.t+=dt;numbers=numbers.filter(n=>n.t<1.1);
    }
    drawScene();requestAnimationFrame(animate);
  }
  // Original synthesized effects, opt-in. No autoplay and no external audio.
  function unlockAudio(){try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==="suspended")audio.resume();}catch{sound=false;}}
  function tone(type) {
    if(!sound||!audio)return;
    const now=audio.currentTime, gain=audio.createGain();gain.connect(audio.destination);
    const osc=audio.createOscillator();osc.connect(gain);
    const data={shot:[700,95,.1,.035],hit:[160,50,.09,.025],blast:[140,30,.32,.06],impact:[90,30,.22,.045],dash:[500,70,.18,.02],charge:[180,620,.38,.016]}[type];
    osc.type=type==="charge"?"sine":"triangle";osc.frequency.setValueAtTime(data[0],now);osc.frequency.exponentialRampToValueAtTime(data[1],now+data[2]);gain.gain.setValueAtTime(data[3],now);gain.gain.exponentialRampToValueAtTime(.001,now+data[2]);osc.start(now);osc.stop(now+data[2]);
    if(type==="shot"||type==="blast"){
      const length=Math.floor(audio.sampleRate*.1),buffer=audio.createBuffer(1,length,audio.sampleRate),samples=buffer.getChannelData(0);
      for(let i=0;i<length;i++)samples[i]=(Math.random()*2-1)*(1-i/length);
      const source=audio.createBufferSource(),g=audio.createGain();g.gain.value=.025;source.buffer=buffer;source.connect(g);g.connect(audio.destination);source.start();
    }
  }
  $("actions").addEventListener("click",e=>{const b=e.target.closest("[data-action]");if(b)attack(b.dataset.action);});
  targetButtons.forEach(b=>b.addEventListener("click",()=>{if(state.mode==="idle"&&state.hp[b.dataset.target]>0){state.target=b.dataset.target;update();}}));
  canvas.addEventListener("click",e=>{
    if(state.mode!=="idle")return;const box=canvas.getBoundingClientRect(),x=(e.clientX-box.left)/box.width*width,y=(e.clientY-box.top)/box.height*height;
    for(const [id,p] of Object.entries(enemyPos))if(state.hp[id]>0&&Math.abs(x-p.x)<p.h*.5&&y>p.y-p.h&&y<p.y+25){state.target=id;update();break;}
  });
  document.addEventListener("keydown",e=>{if(e.repeat||e.ctrlKey||e.altKey||e.metaKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const action={"1":"quick","2":"dual","3":"focus","4":"guard"}[e.key];if(action){e.preventDefault();attack(action);}});
  $("restart").addEventListener("click",reset);$("reset-battle").addEventListener("click",reset);
  $("sound").addEventListener("click",()=>{sound=!sound;if(sound)unlockAudio();$("sound").setAttribute("aria-pressed",String(sound));$("sound").textContent=say("Sonido: ","Sound: ")+(sound?say("sí","on"):say("no","off"));});
  $("fullscreen").addEventListener("click",async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await shell.requestFullscreen();}catch{log(say("La pantalla completa no está disponible en este navegador.","Fullscreen is not available in this browser."));}});
  reset();resize();requestAnimationFrame(animate);
  Promise.all([
    load("bg",ROOT+"black-lotus-arena.png"),load("marauder",ROOT+"marauder-idle-cutout.png"),
    load("warden",ROOT+"warden-idle-cutout.png"),load("special",ROOT+"jessie-special-v2/atlas.webp"),
    ...idlePaths.map((src,i)=>load("idle"+i,src)),...quickPaths.map((src,i)=>load("quick"+i,src))
  ]).then(()=>{ready=true;$("loading").hidden=true;update();}).catch(()=>{
    $("loading").textContent=say("No se pudieron cargar las imágenes. Recarga la página para reintentar.","Images could not load. Reload the page to try again.");
  });
})();
