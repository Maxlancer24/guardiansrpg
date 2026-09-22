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
    note:'Una misma Jessie en toda la secuencia · Paso doble: apoyo, dos armas y recuperación · Velocidad recomendada: 1.5×.',
    compare:'Comparar con la demo anterior ↗',idle:'Reposo',aim:'Apuntando',fire:'Disparo',recover:'Recuperación',
    error:'No se pudo cargar la prueba. Recarga la página para intentarlo de nuevo.'
  } : {note:'The same Jessie throughout · Double step: weight shift, two weapons and recovery · Recommended speed: 1.5×.',idle:'Idle',aim:'Aiming',fire:'Fire',recover:'Recovery',pause:'Pause',resume:'Resume',error:'Could not load the lab. Reload the page to try again.'};
  document.querySelectorAll('[data-copy]').forEach(el => {if(strings[el.dataset.copy]) el.textContent=strings[el.dataset.copy];});
  if(es){document.querySelector('.lab').setAttribute('aria-label','Laboratorio de animación de Jessie');document.getElementById('stage').setAttribute('aria-label','Jessie respira, apunta y dispara a un objetivo de práctica');}
  const $=id=>document.getElementById(id);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paused=reduced, speed=1.5, loop=false, debug=false, scene;
  $('speed').value=String(speed);
  const comboButton=document.createElement('button');comboButton.id='combo';comboButton.className='primary';comboButton.disabled=true;comboButton.textContent=es?'Paso doble ↗':'Double step ↗';
  $('shoot').after(comboButton);
  const resetButton=document.createElement('button');resetButton.id='reset';resetButton.textContent=es?'Reiniciar':'Reset';$('pause').after(resetButton);
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
      for(const p of ['body','off-upper','off-forearm'])this.load.image('dual-'+p,`/assets/demo-battle/jessie-dual-v2/${p}.png`);
    }
    create(){
      if(this.failed)return;
      scene=this;this.timeNow=0;this.attack=-1;this.comboTime=-1;this.comboFrame=-1;this.comboHits=0;this.lastAction='quick';this.rest=0;this.fired=false;this.hitAt=-10000;
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
      // Original pixels and one coordinate system: no character swap on attack.
      this.offArm=this.add.container(197,174);this.root.add(this.offArm);
      this.offArm.add(this.add.image(-197,-174,'dual-off-upper').setOrigin(0));
      this.offElbow=this.add.container(174-197,274-174);this.offArm.add(this.offElbow);
      this.offElbow.add(this.add.image(-174,-274,'dual-off-forearm').setOrigin(0));
      this.offMuzzle=this.add.container(120-174,472-274);this.offElbow.add(this.offMuzzle);
      this.offArm.setVisible(false);this.comboDuration=2450;this.stepWeight=0;this.offPose=[0,0];this.activeWeapon='front';
      this.fx=this.add.graphics();this.bones=this.add.graphics();
      this.phaseName='';this.pose(idle);this.updatePhase('idle');
      $('loading').hidden=true;$('pause').disabled=false;$('shoot').disabled=paused;
      $('pause').textContent=paused?strings.resume:strings.pause;
      this.syncControls();
      // Read-only QA snapshot: no game or account state is exposed.
      window.jessieLab={snapshot:()=>({time:this.timeNow,attack:this.attack,combo:this.comboTime,frame:this.comboFrame,hits:this.comboHits,paused,speed,phase:this.phaseName,feet:this.root.getWorldTransformMatrix().transformPoint(r.centerX,r.floor),muzzle:this.weaponPoint(),shot:this.shotPoint,flash:this.flashPoint,weapon:this.activeWeapon,offShoulder:this.offArm.rotation,offElbow:this.offElbow.rotation,shoulder:this.arm.rotation,elbow:this.elbow.rotation,coherent:true,mesh:!!this.restVertices})};
      this.scale.on('resize',()=>{const small=this.scale.width<1000;this.heroX=small?300:410;this.root.x=this.heroX-r.centerX*this.artScale;this.heroShadow.x=this.heroX;this.targetShadow.x=small?705:958;});
    }
    syncControls(){const busy=paused||this.attack>=0||this.comboTime>=0;$('shoot').disabled=busy;$('combo').disabled=busy;}
    shoot(){if(this.attack>=0||this.comboTime>=0||paused)return;this.activeWeapon='front';this.lastAction='quick';this.attack=0;this.fired=false;this.rest=0;this.syncControls();}
    combo(){if(this.attack>=0||this.comboTime>=0||paused)return;this.lastAction='combo';this.comboTime=0;this.comboFrame=-1;this.comboHits=0;this.rest=0;this.hitAt=-10000;this.updateCombo(0);this.syncControls();}
    finishCombo(){this.comboTime=-1;this.stepWeight=0;this.offPose=[0,0];this.offArm.setVisible(false);this.body.setTexture('body');this.pose(idle);this.updatePhase('idle');this.syncControls();}
    reset(){loop=false;$('loop').checked=false;this.attack=-1;this.comboFrame=-1;this.comboHits=0;this.hitAt=-10000;this.rest=0;this.finishCombo();}
    weaponPoint(){return (this.activeWeapon==='off'?this.offMuzzle:this.muzzle).getWorldTransformMatrix().transformPoint(0,0);}
    weaponAngle(){return this.activeWeapon==='off'?1.755+this.offArm.rotation+this.offElbow.rotation:this.rig.barrelAngle+this.arm.rotation+this.elbow.rotation;}
    fireWeapon(weapon){this.activeWeapon=weapon;this.hitAt=this.timeNow;this.shotAngle=this.weaponAngle();this.shotPoint=this.weaponPoint();}
    updateCombo(dt){
      const previous=this.comboTime;this.comboTime+=dt;
      if(this.comboTime>=this.comboDuration){this.finishCombo();return;}
      const a=this.comboTime;
      this.comboFrame=Math.floor(a/100);
      this.stepWeight=a<500?ease(a/500):a>1850?1-ease((a-1850)/600):1;
      let front=blend(idle,aim,(a-120)/470);
      if(a>=760&&a<850)front=blend(aim,recoil,(a-760)/90);
      else if(a>=850&&a<1110)front=blend(recoil,aim,(a-850)/260);
      else if(a>=1110)front=blend(aim,[ -.35,-.08,0,0 ],(a-1110)/260);
      const offAim=[-1.57,-.185],offRecoil=[-1.68,-.20];
      let off=blend([0,0],offAim,(a-850)/490);
      if(a>=1430&&a<1520)off=blend(offAim,offRecoil,(a-1430)/90);
      else if(a>=1520&&a<1760)off=blend(offRecoil,offAim,(a-1520)/240);
      else if(a>=1760)off=offAim;
      if(a>=1850){front=blend([-.35,-.08,0,0],idle,(a-1850)/600);off=blend(offAim,[0,0],(a-1850)/600);}
      this.offPose=off;
      const offMoving=a>850;
      this.offArm.setVisible(offMoving);this.body.setTexture(offMoving?'dual-body':'body');
      this.pose(front);
      this.updatePhase((a>=760&&a<850)||(a>=1430&&a<1520)?'fire':a>=1760?'recover':'aim');
      for(const [at,weapon] of [[760,'front'],[1430,'off']])if(previous<at&&a>=at){this.comboHits++;this.fireWeapon(weapon);}
    }
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
        // A restrained planted weight shift, not a sliding full-body translation.
        const upper=clamp((650-y)/300,0,1);
        X+=this.stepWeight*9*upper;Y+=this.stepWeight*3*upper;
        return {x:X,y:Y};
      };
      if(this.restVertices){for(const v of this.restVertices){const q=warp(v.x,v.y);v.v.x=q.x-this.rig.width/2;v.v.y=this.rig.height/2-q.y;}}
      const [sx,sy]=this.rig.shoulder,q=this.restVertices?warp(sx,sy):{x:sx,y:sy};
      this.arm.setPosition(q.x,q.y);this.arm.rotation=p[0]+p[2];this.elbow.rotation=p[1];
      const off=this.restVertices?warp(197,174):{x:197,y:174};this.offArm.setPosition(off.x,off.y);this.offArm.rotation=this.offPose[0]+p[2];this.offElbow.rotation=this.offPose[1];
    }
    update(_time,delta){
      if(!scene)return;
      if(!paused){
        const dt=Math.min(delta,50)*speed;this.timeNow+=dt;
        let p=idle;
        if(this.comboTime>=0){this.updateCombo(dt);}
        else if(this.attack>=0){
          this.attack+=dt;const a=this.attack;
          if(a<650){p=blend(idle,aim,a/650);this.updatePhase('aim');}
          else if(a<880){p=aim;this.updatePhase('aim');}
          else if(a<965){p=blend(aim,recoil,(a-880)/85);this.updatePhase('fire');}
          else if(a<1280){p=blend(recoil,aim,(a-965)/315);this.updatePhase('recover');}
          else if(a<1660){p=aim;this.updatePhase('recover');}
          else if(a<2370){p=blend(aim,idle,(a-1660)/710);this.updatePhase('recover');}
          else{this.attack=-1;this.syncControls();this.updatePhase('idle');}
          this.pose(p);
          if(a>=880&&!this.fired){this.fired=true;this.fireWeapon('front');}
        }else{this.pose(idle);this.rest+=dt;if(loop&&this.rest>1500){if(this.lastAction==='combo')this.combo();else this.shoot();}}
      }
      this.drawEffects();this.drawBones();
    }
    drawEffects(){
      this.fx.clear();this.flashPoint=null;const age=this.timeNow-this.hitAt;
      this.target.x=(this.scale.width<1000?705:958)+(age<300?Math.sin(age/50)*5*Math.exp(-age/130):0);
      this.target.clearTint();if(age<95)this.target.setTintFill(0xffebbc);
      if(age<0||age>550||!this.shotPoint)return;
      const p=this.shotPoint, target={x:this.target.x,y:p.y+(this.target.x-p.x)*Math.tan(this.shotAngle)};
      if(age<40){
        const m=this.weaponPoint(),angle=this.weaponAngle();this.flashPoint={x:m.x,y:m.y};
        const local=(x,y)=>({x:m.x+x*Math.cos(angle)-y*Math.sin(angle),y:m.y+x*Math.sin(angle)+y*Math.cos(angle)});
        const b=local(-2,-5),tip=local(44,0),c=local(-2,5);
        this.fx.fillStyle(0xffc66b,1-age/100);this.fx.fillTriangle(b.x,b.y,tip.x,tip.y,c.x,c.y);
        this.fx.fillStyle(0xfffae8,1);this.fx.fillCircle(m.x,m.y,4);
        if(age<25){this.fx.lineStyle(2,0xffdf98,(1-age/40)*.8);this.fx.lineBetween(m.x,m.y,target.x,target.y);}
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
  $('combo').onclick=()=>scene?.combo();$('reset').onclick=()=>scene?.reset();
  $('pause').onclick=()=>{paused=!paused;$('pause').textContent=paused?strings.resume:strings.pause;scene?.syncControls();};
  $('speed').onchange=e=>{speed=Number(e.target.value);};
  $('loop').onchange=e=>{loop=e.target.checked;};
  $('joints').onchange=e=>{debug=e.target.checked;};
})();
