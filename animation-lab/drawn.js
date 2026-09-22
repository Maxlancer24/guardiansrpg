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
  $('shoot').textContent=es?'Dos disparos ↗':'Double shot ↗';
  copy.aim=es?'Preparación':'Preparing';
  let scene,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,speed=1.5,loop=false,debug=false,effects=true;
  $('speed').value=String(speed);
  const reset=document.createElement('button');reset.textContent=es?'Reiniciar':'Reset';reset.id='reset';$('pause').after(reset);
  const fxLabel=document.createElement('label');fxLabel.className='toggle';
  const fxToggle=document.createElement('input');fxToggle.type='checkbox';fxToggle.checked=true;fxToggle.id='effects';
  fxLabel.append(fxToggle,document.createTextNode(es?'Efectos':'Effects'));$('joints').closest('label').after(fxLabel);
  fxToggle.onchange=()=>effects=fxToggle.checked;
  // Restrict idle to calm drawings; no wind extremes or synthetic warping.
  const idleKeys=['idle0','idle7','idle6','idle5','idle6','idle7'];
  const idleDur=[380,240,240,260,240,240];
  // Avoid the old tilted-head acting drawings. Two shots, same gun and stance.
  const shotKeys=['idle0','raise0','raise1','raise2','recoil','raise2','recoil','raise2','raise1','raise0','idle0'];
  const shotDur=[120,1125,240,460,80,220,80,200,220,240,180];
  const prepKeys=['prep0','prep1','prep2','prep3','prep2','prep1','prep0'];
  const prepDur=[170,200,230,200,230,200,270].map(ms=>ms*.75);
  const total=a=>a.reduce((x,y)=>x+y,0),frameAt=(t,d)=>{let end=0;for(let i=0;i<d.length;i++){end+=d[i];if(t<end)return i;}return d.length-1;};
  const FIRES=[1925,2225],END=total(shotDur),S=.64;
  class DrawnLab extends Phaser.Scene {
    preload(){
      this.failed=false;this.load.on('loaderror',()=>{this.failed=true;$('loading').textContent=copy.error;});
      this.load.image('arena','/assets/demo-battle/black-lotus-arena.png');
      this.load.image('target','/assets/demo-battle/warden-idle-cutout.png');
      for(const mode of ['idle','shot'])for(let i=0;i<8;i++)this.load.image(`${mode}${i}`,`/assets/demo-battle/jessie-idle-shot-v1/${mode}-${String(i).padStart(2,'0')}.png`);
      for(let i=0;i<3;i++)this.load.image(`raise${i}`,`/assets/demo-battle/jessie-polish-v2/raise-${i}.png`);
      this.load.image('blink','/assets/demo-battle/jessie-acting-v3/blink.png');
      this.load.image('recoil','/assets/demo-battle/jessie-double-v4/recoil.png');
      for(let i=0;i<4;i++)this.load.image(`prep${i}`,`/assets/demo-battle/jessie-prep-v5/prep-${i}.png`);
    }
    create(){
      if(this.failed)return;scene=this;this.clock=0;this.action=-1;this.idleTime=0;this.rest=0;this.shots=0;this.hits=0;this.fireAge=9999;this.hitAge=9999;
      this.blinkLeft=0;this.blinks=0;this.scheduleBlink();
      this.add.image(640,300,'arena').setDisplaySize(1280,720).setTint(0xc5d2d4);
      this.shadow=this.add.ellipse(0,470,120,16,0x050a09,.45);
      this.targetShadow=this.add.ellipse(0,470,140,16,0x050a09,.45);
      this.target=this.add.image(0,470,'target').setOrigin(.5,1).setDisplaySize(205,318);
      this.hero=this.add.image(0,470-525*S,'idle0').setOrigin(0).setScale(S);
      this.light=this.add.image(0,this.hero.y,'idle0').setOrigin(0).setScale(S).setTintFill(0xffcc89).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
      this.fx=this.add.graphics();this.place();this.scale.on('resize',()=>this.place());
      $('loading').hidden=true;$('pause').disabled=false;this.controls();this.phase('idle');
      window.jessieLab={snapshot:()=>({attack:this.action,frame:this.frame,texture:this.hero.texture.key,phase:this.phaseName,paused,speed,shots:this.shots,hits:this.hits,blinks:this.blinks,blinking:this.blinkLeft>0,fireAge:this.fireAge,hitAge:this.hitAge,muzzle:this.muzzle(),foot:{x:this.hero.x+350*S,y:this.hero.y+525*S},drawn:true})};
    }
    place(){const small=this.scale.width<1000;this.hero.x=(small?280:390)-245*S;this.light.x=this.hero.x;this.shadow.x=small?280:390;this.target.x=small?705:958;this.targetShadow.x=this.target.x;}
    muzzle(){return{x:this.hero.x+431*S,y:this.hero.y+154*S};}
    scheduleBlink(){this.nextBlink=this.clock+3800+Math.random()*2400;}
    controls(){$('shoot').disabled=paused||this.action>=0;$('pause').textContent=paused?copy.resume:copy.pause;}
    phase(name){this.phaseName=name;$('phase-label').textContent=copy[name];const active=['idle','aim','fire','recover'].indexOf(name);document.querySelectorAll('.steps li').forEach((li,i)=>li.classList.toggle('active',i===active));}
    shoot(){if(paused||this.action>=0)return;this.blinkLeft=0;this.scheduleBlink();this.action=0;this.rest=0;this.fireIndex=0;this.hitIndex=0;this.fireAge=9999;this.hitAge=9999;this.controls();}
    reset(){this.action=-1;this.justFired=false;this.blinkLeft=0;this.scheduleBlink();this.idleTime=0;this.rest=0;this.fireAge=9999;this.hitAge=9999;loop=false;$('loop').checked=false;this.hero.setTexture('idle0');this.target.clearTint();this.fx.clear();this.phase('idle');this.controls();}
    update(_,delta){
      if(!scene)return;
      if(!paused){this.justFired=false;const dt=Math.min(delta,80)*speed;this.clock+=dt;this.fireAge+=dt;this.hitAge+=dt;
        if(this.action>=0){this.action+=dt;
          while(this.fireIndex<FIRES.length&&this.action>=FIRES[this.fireIndex]){this.justFired=true;this.shots++;this.fireAge=this.action-FIRES[this.fireIndex++];}
          while(this.hitIndex<FIRES.length&&this.action>=FIRES[this.hitIndex]+55){this.hits++;this.hitAge=this.action-(FIRES[this.hitIndex++]+55);}
          if(this.action>=END){this.action=-1;this.idleTime=0;this.rest=0;this.controls();}
        }else{
          if(this.blinkLeft>0)this.blinkLeft=Math.max(0,this.blinkLeft-dt);
          else{this.idleTime+=dt;if(this.clock>=this.nextBlink&&frameAt(this.idleTime%total(idleDur),idleDur)===0){this.blinkLeft=120;this.blinks++;this.scheduleBlink();}}
          this.rest+=dt;if(loop&&this.rest>1500)this.shoot();
        }
      }
      if(this.action>=0){this.frame=this.justFired?3:frameAt(this.action,shotDur);const key=this.frame===1?prepKeys[frameAt(this.action-120,prepDur)]:shotKeys[this.frame];this.hero.setTexture(key);this.phase(this.action<FIRES[0]?'aim':this.action<FIRES[1]+100?'fire':'recover');}
      else{this.frame=frameAt(this.idleTime%total(idleDur),idleDur);this.hero.setTexture(this.blinkLeft>0?'blink':idleKeys[this.frame]);this.phase('idle');}
      this.drawEffects();
    }
    drawEffects(){
      const g=this.fx,m=this.muzzle(),hit={x:this.target.x-20,y:m.y};g.clear();this.target.clearTint();
      this.light.setTexture(this.hero.texture.key).setAlpha(0);
      if(!effects)return;
      // Each flash is on the stable aimed pose; recoil follows 20ms later.
      if(this.justFired||this.fireAge<85){
        const k=this.justFired?1:Math.max(0,1-this.fireAge/85);this.light.setAlpha(.23*k);
        for(let i=3;i>0;i--){g.fillStyle(0xffad53,.035*k);g.fillEllipse(m.x+12,m.y,38*i,28*i);}
        g.fillStyle(0xffb567,.07*k);g.fillEllipse(this.shadow.x,470,180,24);
      }
      if(this.justFired||this.fireAge<20){g.fillStyle(0xffdc8c,1);g.fillTriangle(m.x,m.y-7,m.x+35,m.y,m.x,m.y+7);g.fillStyle(0xffffff,1);g.fillCircle(m.x+3,m.y,3);}
      if(this.fireAge<55){const p=this.fireAge/55;g.lineStyle(2,0xffe2a5,1-p*.6);g.lineBetween(Phaser.Math.Linear(m.x,hit.x,Math.max(0,p-.18)),Phaser.Math.Linear(m.y,hit.y,Math.max(0,p-.18)),Phaser.Math.Linear(m.x,hit.x,p),Phaser.Math.Linear(m.y,hit.y,p));}
      if(this.fireAge>=25&&this.fireAge<650){const k=this.fireAge/650;for(let i=0;i<3;i++){g.fillStyle(0xb8c5cd,.10*(1-k));g.fillCircle(m.x+8+k*(16+i*9),m.y-k*(22+i*10),3+k*(8+i*2));}}
      if(this.hitAge<240){const k=this.hitAge/240;if(k<.3)this.target.setTintFill(0xffe4b1);g.lineStyle(2,0xffcd83,1-k);g.strokeCircle(hit.x,hit.y,5+k*23);for(let i=0;i<6;i++){const a=i*Math.PI/3;g.lineBetween(hit.x+Math.cos(a)*8,hit.y+Math.sin(a)*8,hit.x+Math.cos(a)*(12+k*36),hit.y+Math.sin(a)*(12+k*36));}}
      if(debug&&this.hero.texture.key==='raise2'){g.lineStyle(1,0x73ffdd);g.strokeCircle(m.x,m.y,6);}
    }
  }
  const mobile=matchMedia('(max-width:760px)');
  const game=new Phaser.Game({type:Phaser.AUTO,parent:'stage',width:mobile.matches?900:1280,height:mobile.matches?660:600,backgroundColor:'#101a1b',render:{antialias:true},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:DrawnLab,audio:{noAudio:true},banner:false});
  mobile.addEventListener('change',e=>game.scale.setGameSize(e.matches?900:1280,e.matches?660:600));
  $('shoot').onclick=()=>scene?.shoot();reset.onclick=()=>scene?.reset();
  $('pause').onclick=()=>{paused=!paused;scene?.controls();};$('speed').onchange=e=>speed=Number(e.target.value);
  $('loop').onchange=e=>loop=e.target.checked;$('joints').onchange=e=>debug=e.target.checked;
})();
