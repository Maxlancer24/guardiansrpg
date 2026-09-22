/* Jessie rig lab. Independent of accounts, the bot and the previous demo. */
(() => {
  'use strict';
  const es = document.documentElement.lang === 'es';
  const strings = es ? {
    eyebrow:'JESSIE / ESTUDIO DE MOVIMIENTO',title:'Cada disparo empieza con una respiración.',
    description:'Primera prueba de animación articulada. Sin combate, sin recompensas ni cambios en tu personaje.',
    wood:'BOSQUE DEL LOTO NEGRO',phase:'MOVIMIENTO ACTUAL',loading:'Preparando a Jessie…',class:'PISTOLERA',
    study:'Respirar. Apuntar. Disparar. Recuperarse.',shoot:'Disparar ↗',pause:'Pausar',resume:'Continuar',speed:'Velocidad',
    loop:'Repetir secuencia',joints:'Ver articulaciones',step1:'01 · Reposo',step2:'02 · Apuntar',step3:'03 · Disparar',step4:'04 · Recuperar',
    note:'Prueba de animación articulada · El cabello y el abrigo acompañan el movimiento · Pies firmes en el suelo.',
    compare:'Comparar con la demo anterior ↗',idle:'Reposo',aim:'Apuntando',fire:'Disparo',recover:'Recuperación',
    error:'No se pudo cargar la prueba. Recarga la página para intentarlo de nuevo.'
  } : {idle:'Idle',aim:'Aiming',fire:'Fire',recover:'Recovery',pause:'Pause',resume:'Resume',error:'Could not load the lab. Reload the page to try again.'};
  document.querySelectorAll('[data-copy]').forEach(el => {if(strings[el.dataset.copy]) el.textContent=strings[el.dataset.copy];});
  if(es){document.querySelector('.lab').setAttribute('aria-label','Laboratorio de animación de Jessie');document.getElementById('stage').setAttribute('aria-label','Jessie respira, apunta y dispara a un objetivo de práctica');}
  const $=id=>document.getElementById(id);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paused=reduced, speed=1.5, loop=false, debug=false, scene;
  $('speed').value=String(speed);
  const parts=['head','torso','legs','hair','tail-back','tail-front','upper-arm','forearm','off-arm'];
  const lerp=Phaser.Math.Linear, ease=t=>t*t*(3-2*t), clamp=Phaser.Math.Clamp;
  const blend=(a,b,t)=>a.map((v,i)=>lerp(v,b[i],ease(clamp(t,0,1))));
  // [shoulder, elbow, torso, head] radians, continuous pose curves.
  const idle=[.76,-.39,-.012,.012], aim=[-.08,.18,.018,-.018], recoil=[-.23,.06,-.045,.032];
  class Lab extends Phaser.Scene {
    preload(){
      this.failed=false;
      this.load.on('loaderror',()=>{this.failed=true; $('loading').textContent=strings.error;});
      this.load.image('arena','/assets/demo-battle/black-lotus-arena.png');
      this.load.image('target','/assets/demo-battle/warden-idle-cutout.png');
      parts.forEach(p=>this.load.image(p,`/assets/demo-battle/jessie-rig-v1/${p==='torso'?'torso-v2':p}.png`));
    }
    create(){
      if(this.failed)return;
      scene=this;this.timeNow=0;this.attack=-1;this.rest=0;this.fired=false;this.hitAt=-10000;
      const mobile=this.scale.width<1000;
      this.add.image(640,300,'arena').setDisplaySize(1280,720).setTint(0xc5d2d4);
      this.add.rectangle(640,300,1400,700,0x09151b,.10);
      this.heroShadow=this.add.ellipse(mobile?300:410,470,185,22,0x050a09,.53);
      this.targetShadow=this.add.ellipse(mobile?705:958,470,155,17,0x050a09,.45);
      this.target=this.add.image(mobile?705:958,470,'target').setOrigin(.5,1).setDisplaySize(226,350).setAlpha(.85);
      // Whole-character scale is separate from anatomy. Re-anchor the floor
      // after scaling; individual pieces use the full-character reference ratios.
      this.root=this.add.container(mobile?300:410,470-185*1.10).setScale(1.10);
      const image=(parent,key,x,y,w,ox=.5,oy=.5)=>{const obj=this.add.image(x,y,key).setOrigin(ox,oy);obj.setScale(w/obj.width);parent.add(obj);return obj;};
      this.tailBack=image(this.root,'tail-back',-18,-24,134,.88,.05);
      this.tailFront=image(this.root,'tail-front',16,-24,141,.12,.05);
      this.legs=image(this.root,'legs',0,185,186,.5,1);
      this.legs.scaleY*=1.08;
      // The waist is the shared pivot, with overlap into the belt. Upper-arm
      // caps sit BEHIND the torso so they never read as exposed socket disks.
      this.body=this.add.container(0,-8);this.root.add(this.body);
      this.off=image(this.body,'off-arm',-27,-71,91,.88,.08);
      this.hair=image(this.body,'hair',-9,-125,87,.88,.13);
      this.arm=this.add.container(23,-74);this.body.add(this.arm);
      image(this.arm,'upper-arm',0,0,53,.10,.40);
      this.elbow=this.add.container(40,9);this.arm.add(this.elbow);
      image(this.elbow,'forearm',0,0,82,.08,.55);
      this.muzzle=this.add.container(75,-10);this.elbow.add(this.muzzle);
      this.torso=image(this.body,'torso',0,0,82,.5,1);
      this.torso.scaleY*=.93;
      this.head=image(this.body,'head',5,-86,56,.5,1);
      this.fx=this.add.graphics();this.bones=this.add.graphics();
      this.phaseName='';this.pose(idle);this.updatePhase('idle');
      $('loading').hidden=true;$('pause').disabled=false;$('shoot').disabled=paused;
      $('pause').textContent=paused?strings.resume:strings.pause;
      // Read-only QA snapshot: no game or account state is exposed.
      window.jessieLab={snapshot:()=>({time:this.timeNow,attack:this.attack,paused,speed,phase:this.phaseName,feet:this.root.getWorldTransformMatrix().transformPoint(0,185),muzzle:this.muzzle.getWorldTransformMatrix().transformPoint(0,0),shoulder:this.arm.rotation,elbow:this.elbow.rotation})};
      this.scale.on('resize',()=>{const small=this.scale.width<1000;this.root.x=this.heroShadow.x=small?300:410;this.targetShadow.x=small?705:958;});
    }
    shoot(){if(this.attack>=0||paused)return;this.attack=0;this.fired=false;this.rest=0;$('shoot').disabled=true;}
    updatePhase(name){if(name===this.phaseName)return;this.phaseName=name;$('phase-label').textContent=strings[name];document.querySelectorAll('.steps li').forEach((el,i)=>el.classList.toggle('active',i===['idle','aim','fire','recover'].indexOf(name)));}
    pose(p){
      const t=this.timeNow/1000, breath=Math.sin(t*1.65);
      const age=Math.max(0,this.timeNow-this.hitAt);
      // A damped follow-through, rather than continuous pendulum rotations.
      const settle=Math.sin(age/145)*Math.exp(-age/260);
      this.body.y=-8+breath*.45;this.body.x=p[2]*22;
      this.body.rotation=p[2]+breath*.003;
      this.head.rotation=p[3]+Math.sin(t*1.65-.4)*.004;
      this.arm.rotation=p[0]+breath*.005;this.elbow.rotation=p[1];
      this.hair.rotation=Math.sin(t*1.35-.8)*.012+settle*.028;
      this.tailBack.rotation=Math.sin(t*1.2-.6)*.008+settle*.018;
      this.tailFront.rotation=Math.sin(t*1.2-1.1)*.009+settle*.014;
      this.tailBack.x=-18+this.body.x*.4;this.tailFront.x=16+this.body.x*.4;
      this.off.rotation=Math.sin(t*1.65-.7)*.007-p[2]*.35;
    }
    update(_time,delta){
      if(!scene)return;
      if(!paused){
        const dt=Math.min(delta,50)*speed;this.timeNow+=dt;
        let p=idle;
        if(this.attack>=0){
          this.attack+=dt;const a=this.attack;
          if(a<650){p=blend(idle,aim,a/650);this.updatePhase('aim');}
          else if(a<880){p=aim;this.updatePhase('aim');}
          else if(a<965){p=blend(aim,recoil,(a-880)/85);this.updatePhase('fire');}
          else if(a<1280){p=blend(recoil,aim,(a-965)/315);this.updatePhase('recover');}
          else if(a<1660){p=aim;this.updatePhase('recover');}
          else if(a<2370){p=blend(aim,idle,(a-1660)/710);this.updatePhase('recover');}
          else{this.attack=-1;$('shoot').disabled=false;this.updatePhase('idle');}
          this.pose(p);
          if(a>=880&&!this.fired){this.fired=true;this.hitAt=this.timeNow;this.shotPoint=this.muzzle.getWorldTransformMatrix().transformPoint(0,0);this.shotAngle=aim[0]+aim[1]+aim[2];}
        }else{this.pose(idle);this.rest+=dt;if(loop&&this.rest>1500)this.shoot();}
      }
      this.drawEffects();this.drawBones();
    }
    drawEffects(){
      this.fx.clear();const age=this.timeNow-this.hitAt;
      this.target.x=(this.scale.width<1000?705:958)+(age<300?Math.sin(age/50)*5*Math.exp(-age/130):0);
      this.target.clearTint();if(age<95)this.target.setTintFill(0xffebbc);
      if(age<0||age>550||!this.shotPoint)return;
      const p=this.shotPoint, target={x:this.target.x,y:p.y+(this.target.x-p.x)*Math.tan(this.shotAngle)};
      if(age<90){
        const m=this.muzzle.getWorldTransformMatrix().transformPoint(0,0);
        this.fx.fillStyle(0xffc66b,1-age/100);this.fx.fillTriangle(m.x-6,m.y-5,m.x+54,m.y-1,m.x+7,m.y+9);
        this.fx.fillStyle(0xfffae8,1);this.fx.fillCircle(m.x+5,m.y,6);
        this.fx.lineStyle(2,0xffdf98,(1-age/100)*.8);this.fx.lineBetween(p.x,p.y,target.x,target.y);
      }
      const k=age/550;this.fx.lineStyle(2,0xffd087,(1-k)*.7);this.fx.strokeCircle(target.x,target.y,6+k*35);
      for(let i=0;i<9;i++){const a=i*2.4;this.fx.fillStyle(i%2?0xfff1c1:0xe2a852,1-k);this.fx.fillCircle(target.x+Math.cos(a)*k*65,target.y+Math.sin(a)*k*50+k*k*24,2*(1-k));}
    }
    drawBones(){
      this.bones.clear();if(!debug)return;
      const point=o=>o.getWorldTransformMatrix().transformPoint(0,0), points=[point(this.body),point(this.arm),point(this.elbow),point(this.muzzle)];
      this.bones.lineStyle(2,0x7fffe1,.85);this.bones.beginPath();this.bones.moveTo(points[0].x,points[0].y);points.slice(1).forEach(p=>this.bones.lineTo(p.x,p.y));this.bones.strokePath();
      points.forEach(p=>{this.bones.fillStyle(0x071c1b);this.bones.fillCircle(p.x,p.y,5);this.bones.lineStyle(2,0x7fffe1);this.bones.strokeCircle(p.x,p.y,5);});
    }
  }
  const mobile=matchMedia('(max-width:760px)').matches;
  const game=new Phaser.Game({type:Phaser.AUTO,parent:'stage',width:mobile?900:1280,height:mobile?660:600,backgroundColor:'#101a1b',render:{antialias:true,roundPixels:false},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:Lab,audio:{noAudio:true},banner:false});
  matchMedia('(max-width:760px)').addEventListener('change',e=>game.scale.setGameSize(e.matches?900:1280,e.matches?660:600));
  $('shoot').onclick=()=>scene?.shoot();
  $('pause').onclick=()=>{paused=!paused;$('pause').textContent=paused?strings.resume:strings.pause;$('shoot').disabled=paused||!scene||scene.attack>=0;};
  $('speed').onchange=e=>{speed=Number(e.target.value);};
  $('loop').onchange=e=>{loop=e.target.checked;};
  $('joints').onchange=e=>{debug=e.target.checked;};
})();
