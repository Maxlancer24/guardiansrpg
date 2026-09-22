/* Isolated drawn-animation test. No account, bot or database access. */
(() => {
  'use strict';
  const es=document.documentElement.lang==='es', $=id=>document.getElementById(id);
  const copy=es?{
    eyebrow:'JESSIE / ANIMACIÓN DIBUJADA',title:'Cada disparo empieza con una respiración.',
    description:'Prueba de idle y disparo con fotogramas dibujados. Sin recompensas ni cambios en tu personaje.',
    wood:'BOSQUE DEL LOTO NEGRO',phase:'MOVIMIENTO ACTUAL',loading:'Preparando a Jessie…',class:'PISTOLERA',
    study:'Respirar. Apuntar. Disparar. Recuperarse.',shoot:'Disparo normal ↗',pause:'Pausar',resume:'Continuar',speed:'Velocidad',
    loop:'Repetir disparo',joints:'Ver punto del cañón',step1:'01 · Reposo',step2:'02 · Apuntar',step3:'03 · Disparar',step4:'04 · Recuperar',
    note:'Prueba de sprites · Dos revólveres, uno por mano · Destello, retroceso e impacto sincronizados.',
    compare:'Demo anterior ↗',idle:'Reposo',aim:'Apuntando',fire:'Disparo',recover:'Recuperación',error:'No se pudo cargar la prueba. Recarga la página.'
  }:{description:'Drawn idle and normal-shot animation test. No rewards or changes to your character.',shoot:'Normal shot ↗',pause:'Pause',resume:'Resume',loop:'Repeat shot',joints:'Show muzzle point',note:'Sprite test · Two revolvers, one per hand · Synchronized flash, recoil and impact.',idle:'Idle',aim:'Aiming',fire:'Fire',recover:'Recovery',error:'Could not load the test. Reload the page.'};
  document.querySelectorAll('[data-copy]').forEach(el=>{if(copy[el.dataset.copy])el.textContent=copy[el.dataset.copy];});
  let scene,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,speed=1,loop=false,debug=false;
  $('speed').value='1';
  const reset=document.createElement('button');reset.textContent=es?'Reiniciar':'Reset';reset.id='reset';$('pause').after(reset);
  const idleDur=[230,230,230,100,130,230,230,230],shotDur=[100,110,90,70,70,110,140,180];
  const total=a=>a.reduce((x,y)=>x+y,0),frameAt=(t,d)=>{let end=0;for(let i=0;i<d.length;i++){end+=d[i];if(t<end)return i;}return d.length-1;};
  const FIRE=350,IMPACT=405,END=total(shotDur),S=.64;
  class DrawnLab extends Phaser.Scene {
    preload(){
      this.failed=false;this.load.on('loaderror',()=>{this.failed=true;$('loading').textContent=copy.error;});
      this.load.image('arena','/assets/demo-battle/black-lotus-arena.png');
      this.load.image('target','/assets/demo-battle/warden-idle-cutout.png');
      for(const mode of ['idle','shot'])for(let i=0;i<8;i++)this.load.image(`${mode}${i}`,`/assets/demo-battle/jessie-idle-shot-v1/${mode}-${String(i).padStart(2,'0')}.png`);
    }
    create(){
      if(this.failed)return;scene=this;this.clock=0;this.action=-1;this.idleTime=0;this.rest=0;this.shots=0;this.hits=0;this.fireAge=9999;this.hitAge=9999;
      this.add.image(640,300,'arena').setDisplaySize(1280,720).setTint(0xc5d2d4);
      this.shadow=this.add.ellipse(0,470,120,16,0x050a09,.45);
      this.targetShadow=this.add.ellipse(0,470,140,16,0x050a09,.45);
      this.target=this.add.image(0,470,'target').setOrigin(.5,1).setDisplaySize(205,318);
      this.hero=this.add.image(0,470-525*S,'idle0').setOrigin(0).setScale(S);
      this.fx=this.add.graphics();this.place();this.scale.on('resize',()=>this.place());
      $('loading').hidden=true;$('pause').disabled=false;this.controls();this.phase('idle');
      window.jessieLab={snapshot:()=>({attack:this.action,frame:this.frame,phase:this.phaseName,paused,speed,shots:this.shots,hits:this.hits,fireAge:this.fireAge,hitAge:this.hitAge,muzzle:this.muzzle(),foot:{x:this.hero.x+350*S,y:this.hero.y+525*S},drawn:true})};
    }
    place(){const small=this.scale.width<1000;this.hero.x=(small?280:390)-245*S;this.shadow.x=small?280:390;this.target.x=small?705:958;this.targetShadow.x=this.target.x;}
    muzzle(){return{x:this.hero.x+398*S,y:this.hero.y+128*S};}
    controls(){$('shoot').disabled=paused||this.action>=0;$('pause').textContent=paused?copy.resume:copy.pause;}
    phase(name){this.phaseName=name;$('phase-label').textContent=copy[name];const active=['idle','aim','fire','recover'].indexOf(name);document.querySelectorAll('.steps li').forEach((li,i)=>li.classList.toggle('active',i===active));}
    shoot(){if(paused||this.action>=0)return;this.action=0;this.rest=0;this.didFire=false;this.didHit=false;this.fireAge=9999;this.hitAge=9999;this.controls();}
    reset(){this.action=-1;this.idleTime=0;this.rest=0;this.fireAge=9999;this.hitAge=9999;loop=false;$('loop').checked=false;this.hero.setTexture('idle0');this.target.clearTint();this.fx.clear();this.phase('idle');this.controls();}
    update(_,delta){
      if(!scene)return;
      if(!paused){this.justFired=false;const dt=Math.min(delta,80)*speed;this.clock+=dt;this.fireAge+=dt;this.hitAge+=dt;
        if(this.action>=0){this.action+=dt;
          if(!this.didFire&&this.action>=FIRE){this.didFire=true;this.justFired=true;this.shots++;this.fireAge=this.action-FIRE;}
          if(!this.didHit&&this.action>=IMPACT){this.didHit=true;this.hits++;this.hitAge=this.action-IMPACT;}
          if(this.action>=END){this.action=-1;this.idleTime=0;this.rest=0;this.controls();}
        }else{this.idleTime+=dt;this.rest+=dt;if(loop&&this.rest>1500)this.shoot();}
      }
      if(this.action>=0){this.frame=this.justFired?3:frameAt(this.action,shotDur);this.hero.setTexture(`shot${this.frame}`);this.phase(this.action<FIRE?'aim':this.action<440?'fire':'recover');}
      else{this.frame=frameAt(this.idleTime%total(idleDur),idleDur);this.hero.setTexture(`idle${this.frame}`);this.phase('idle');}
      this.drawEffects();
    }
    drawEffects(){
      const g=this.fx,m=this.muzzle(),hit={x:this.target.x-20,y:310};g.clear();this.target.clearTint();
      // Fire while frame 3 still holds the horizontal barrel. Recoil starts at 370ms.
      if(this.justFired||this.fireAge<20){g.fillStyle(0xffdc8c,1);g.fillTriangle(m.x,m.y-7,m.x+35,m.y,m.x,m.y+7);g.fillStyle(0xffffff,1);g.fillCircle(m.x+3,m.y,3);}
      if(this.fireAge<55){const p=this.fireAge/55;g.lineStyle(2,0xffe2a5,1-p*.6);g.lineBetween(Phaser.Math.Linear(m.x,hit.x,Math.max(0,p-.18)),Phaser.Math.Linear(m.y,hit.y,Math.max(0,p-.18)),Phaser.Math.Linear(m.x,hit.x,p),Phaser.Math.Linear(m.y,hit.y,p));}
      if(this.hitAge<240){const k=this.hitAge/240;if(k<.3)this.target.setTintFill(0xffe4b1);g.lineStyle(2,0xffcd83,1-k);g.strokeCircle(hit.x,hit.y,5+k*23);for(let i=0;i<6;i++){const a=i*Math.PI/3;g.lineBetween(hit.x+Math.cos(a)*8,hit.y+Math.sin(a)*8,hit.x+Math.cos(a)*(12+k*36),hit.y+Math.sin(a)*(12+k*36));}}
      if(debug&&this.action>=300&&this.action<370){g.lineStyle(1,0x73ffdd);g.strokeCircle(m.x,m.y,6);}
    }
  }
  const mobile=matchMedia('(max-width:760px)');
  const game=new Phaser.Game({type:Phaser.AUTO,parent:'stage',width:mobile.matches?900:1280,height:mobile.matches?660:600,backgroundColor:'#101a1b',render:{antialias:true},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:DrawnLab,audio:{noAudio:true},banner:false});
  mobile.addEventListener('change',e=>game.scale.setGameSize(e.matches?900:1280,e.matches?660:600));
  $('shoot').onclick=()=>scene?.shoot();reset.onclick=()=>scene?.reset();
  $('pause').onclick=()=>{paused=!paused;scene?.controls();};$('speed').onchange=e=>speed=Number(e.target.value);
  $('loop').onchange=e=>loop=e.target.checked;$('joints').onchange=e=>debug=e.target.checked;
})();
