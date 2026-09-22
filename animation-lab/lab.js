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
  const parts=['master','body','upper-arm','forearm'];
  const lerp=Phaser.Math.Linear, ease=t=>t*t*(3-2*t), clamp=Phaser.Math.Clamp;
  const blend=(a,b,t)=>a.map((v,i)=>lerp(v,b[i],ease(clamp(t,0,1))));
  // [shoulder, elbow, torso, head] radians, continuous pose curves.
  const idle=[0,0,0,0], aim=[-.78,-.09,.008,0], recoil=[-.89,-.13,-.022,0];
  class Lab extends Phaser.Scene {
    preload(){
      this.failed=false;
      this.load.on('loaderror',()=>{this.failed=true; $('loading').textContent=strings.error;});
      this.load.image('arena','/assets/demo-battle/black-lotus-arena.png');
      this.load.image('target','/assets/demo-battle/warden-idle-cutout.png');
      parts.forEach(p=>this.load.image(p,`/assets/demo-battle/jessie-coherent-v1/${p}.png`));
      this.load.json('rig','/assets/demo-battle/jessie-coherent-v1/rig.json');
    }
    create(){
      if(this.failed)return;
      scene=this;this.timeNow=0;this.attack=-1;this.rest=0;this.fired=false;this.hitAt=-10000;
      const mobile=this.scale.width<1000;
      this.add.image(640,300,'arena').setDisplaySize(1280,720).setTint(0xc5d2d4);
      this.add.rectangle(640,300,1400,700,0x09151b,.10);
      this.heroX=mobile?300:410;
      this.heroShadow=this.add.ellipse(this.heroX,470,122,18,0x050a09,.53);
      this.targetShadow=this.add.ellipse(mobile?705:958,470,155,17,0x050a09,.45);
      this.target=this.add.image(mobile?705:958,470,'target').setOrigin(.5,1).setDisplaySize(226,350).setAlpha(.85);
      this.rig=this.cache.json.get('rig');this.artScale=.50;
      const r=this.rig, [sx,sy]=r.shoulder,[ex,ey]=r.elbow,[mx,my]=r.muzzle;
      this.root=this.add.container(this.heroX-r.centerX*this.artScale,470-r.floor*this.artScale).setScale(this.artScale);
      // Every layer shares the same canvas and scale. No head/torso/leg resizing.
      if(this.game.renderer.type===Phaser.WEBGL){
        this.body=this.add.mesh(r.width/2,r.height/2,'body');
        this.body.setSize(r.width,r.height).setOrtho(r.width,r.height);
        this.body.hideCCW=false;this.body.ignoreDirtyCache=true;
        Phaser.Geom.Mesh.GenerateGridVerts({mesh:this.body,width:r.width,height:r.height,widthSegments:20,heightSegments:30});
        this.restVertices=this.body.vertices.map(v=>({v,x:v.x+r.width/2,y:r.height/2-v.y}));
      }else{this.body=this.add.image(0,0,'body').setOrigin(0);}
      this.root.add(this.body);
      this.arm=this.add.container(sx,sy);this.root.add(this.arm);
      this.arm.add(this.add.image(-sx,-sy,'upper-arm').setOrigin(0));
      this.elbow=this.add.container(ex-sx,ey-sy);this.arm.add(this.elbow);
      this.elbow.add(this.add.image(-ex,-ey,'forearm').setOrigin(0));
      this.muzzle=this.add.container(mx-ex,my-ey);this.elbow.add(this.muzzle);
      this.fx=this.add.graphics();this.bones=this.add.graphics();
      this.phaseName='';this.pose(idle);this.updatePhase('idle');
      $('loading').hidden=true;$('pause').disabled=false;$('shoot').disabled=paused;
      $('pause').textContent=paused?strings.resume:strings.pause;
      // Read-only QA snapshot: no game or account state is exposed.
      window.jessieLab={snapshot:()=>({time:this.timeNow,attack:this.attack,paused,speed,phase:this.phaseName,feet:this.root.getWorldTransformMatrix().transformPoint(r.centerX,r.floor),muzzle:this.muzzle.getWorldTransformMatrix().transformPoint(0,0),shoulder:this.arm.rotation,elbow:this.elbow.rotation,coherent:true,mesh:!!this.restVertices})};
      this.scale.on('resize',()=>{const small=this.scale.width<1000;this.heroX=small?300:410;this.root.x=this.heroX-r.centerX*this.artScale;this.heroShadow.x=this.heroX;this.targetShadow.x=small?705:958;});
    }
    shoot(){if(this.attack>=0||paused)return;this.attack=0;this.fired=false;this.rest=0;$('shoot').disabled=true;}
    updatePhase(name){if(name===this.phaseName)return;this.phaseName=name;$('phase-label').textContent=strings[name];document.querySelectorAll('.steps li').forEach((el,i)=>el.classList.toggle('active',i===['idle','aim','fire','recover'].indexOf(name)));}
    pose(p){
      const t=this.timeNow/1000, breath=Math.sin(t*1.65), age=Math.max(0,this.timeNow-this.hitAt);
      const settle=Math.sin(age/145)*Math.exp(-age/260);
      const warp=(x,y)=>{
        const weight=ease(clamp((490-y)/200,0,1)),a=p[2]*weight;
        const dx=x-255,dy=y-310;
        let X=255+dx*Math.cos(a)-dy*Math.sin(a),Y=310+dx*Math.sin(a)+dy*Math.cos(a)-breath*1.6*weight;
        const hair=clamp((245-x)/85,0,1)*clamp((y-15)/80,0,1)*clamp((190-y)/45,0,1);
        const coat=clamp((y-320)/130,0,1)*clamp((635-y)/80,0,1)*Math.max(clamp((190-x)/65,0,1),clamp((x-345)/65,0,1));
        X+=hair*(Math.sin(t*1.4-.6)*3.2+settle*3)+coat*(Math.sin(t*1.1-.8)*2+settle*2);
        return {x:X,y:Y};
      };
      if(this.restVertices){for(const v of this.restVertices){const q=warp(v.x,v.y);v.v.x=q.x-this.rig.width/2;v.v.y=this.rig.height/2-q.y;}}
      const [sx,sy]=this.rig.shoulder,q=this.restVertices?warp(sx,sy):{x:sx,y:sy};
      this.arm.setPosition(q.x,q.y);this.arm.rotation=p[0]+p[2];this.elbow.rotation=p[1];
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
          if(a>=880&&!this.fired){this.fired=true;this.hitAt=this.timeNow;this.shotPoint=this.muzzle.getWorldTransformMatrix().transformPoint(0,0);this.shotAngle=this.rig.barrelAngle+aim[0]+aim[1]+aim[2];}
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
      const point=o=>o.getWorldTransformMatrix().transformPoint(0,0), points=[this.root.getWorldTransformMatrix().transformPoint(255,310),point(this.arm),point(this.elbow),point(this.muzzle)];
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
