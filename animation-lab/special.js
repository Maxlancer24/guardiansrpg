/* Independent visual skill study. Never changes encounter HP, turns or rewards. */
(() => {
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
  const beats=[{at:1240,pose:2,guns:[[485,150]],name:'first'},
    {at:1780,pose:4,guns:[[435,201]],name:'second'},
    {at:3420,pose:4,guns:[[463,158],[435,201]],name:'final'}];
  window.SpecialPreview=class {
    static preload(s){for(let i=0;i<8;i++)s.load.image(`specialPose${i}`,`/assets/demo-battle/jessie-special-v1/pose-${i}.png`);s.load.image('specialImpact','/assets/demo-battle/jessie-special-v1/impact.png');s.load.image('specialPortrait','/assets/demo-battle/jessie-cutin.png');}
    constructor(s,es){
      this.s=s;this.es=es;this.active=false;this.t=0;this.count=0;this.events=[];
      this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.dark=s.add.graphics().setDepth(8);this.floor=s.add.graphics().setDepth(9);
      this.ghosts=Array.from({length:3},()=>s.add.image(0,0,'specialPose1').setOrigin(0).setDepth(10).setTint(0x6cf3e1).setAlpha(0));
      this.enemy=s.add.image(0,470,'target').setOrigin(.5,1050/1092).setScale(318/991).setDepth(11).setVisible(false);
      this.actor=s.add.image(0,0,'specialPose0').setOrigin(0).setDepth(12).setVisible(false);
      this.fx=s.add.graphics().setDepth(13);
      this.burst=s.add.image(0,0,'specialImpact').setDepth(13).setVisible(false);
      this.heading=s.add.text(0,0,'',{fontFamily:'Georgia',fontSize:'26px',color:'#ffe4ac',align:'center'}).setOrigin(.5).setDepth(14);
      this.counter=s.add.text(0,0,'',{fontFamily:'Arial',fontSize:'18px',color:'#a9fff0'}).setOrigin(.5).setDepth(14);
      this.card=s.add.graphics().setDepth(20);
      this.cardMask=s.make.graphics({add:false});
      this.portrait=s.add.image(0,0,'specialPortrait').setOrigin(0).setDepth(21).setMask(this.cardMask.createGeometryMask()).setVisible(false);
      this.cardTitle=s.add.text(0,0,'JESSIE',{fontFamily:'Georgia',fontSize:'42px',color:'#ffe1a3'}).setOrigin(.5).setDepth(22).setVisible(false);
      this.cardSkill=s.add.text(0,0,es?'FUEGO CRUZADO':'CROSSFIRE',{fontFamily:'Arial',fontSize:'18px',color:'#98f4df',letterSpacing:4}).setOrigin(.5).setDepth(22).setVisible(false);
      this.button=document.createElement('button');this.button.id='special';this.button.textContent=es?'Probar especial ✦':'Preview special ✦';
      this.button.title=es?'Cinemática de prueba: no cambia vida ni turnos':'Visual cinematic: health and turns are unchanged';
      document.getElementById('shoot').after(this.button);this.button.onclick=()=>s.startSpecial();
      window.specialSnapshot=()=>({active:this.active,time:this.t,shots:this.count,impacts:this.events.filter(e=>e.impacted).length,pose:this.actor.texture.key,events:this.events.map(e=>({name:e.name,origins:e.origins,impacted:!!e.impacted})),effects:this.enabled,zoom:s.cameras.main.zoom,actorScale:this.actor.scaleX,normalScale:s.hero.scaleX,portrait:this.portrait.visible});
    }
    start(){
      if(this.active)return;this.active=true;this.t=0;this.count=0;this.events=[];this.next=0;this.hold=0;this.audioCues=new Set();this.smoke=[];this.lastSmoke=0;
      const s=this.s;
      this.width=s.scale.width;this.height=s.scale.height;
      this.hidden=[s.hero,s.target,s.shadow,s.targetShadow,s.light,s.fx,s.feedback.hud,s.feedback.title,s.feedback.hpText,s.feedback.heroTitle,s.feedback.heroHpText,s.feedback.banner,s.feedback.movingShadow];
      this.saved=this.hidden.map(o=>o.visible);this.hidden.forEach(o=>o.setVisible(false));
      this.actor.setVisible(true);this.enemy.setVisible(true);this.heading.setVisible(true);this.counter.setVisible(true);
      this.heading.setText(this.es?'JESSIE · FUEGO CRUZADO':'JESSIE · CROSSFIRE');
      this.counter.setText(this.es?'PRUEBA VISUAL · SIN CAMBIOS EN EL COMBATE':'VISUAL PREVIEW · COMBAT UNCHANGED');
      s.feedback.audio.play('cloth');s.controls();
    }
    stop(){
      if(!this.active)return;this.active=false;
      this.hidden.forEach((o,i)=>o.setVisible(this.saved[i]));
      this.actor.setVisible(false);this.enemy.setVisible(false);this.heading.setVisible(false);this.counter.setVisible(false);
      this.burst.setVisible(false);
      this.clearCard();
      this.ghosts.forEach(o=>o.setAlpha(0));this.dark.clear();this.floor.clear();this.fx.clear();
      this.s.cameras.main.setZoom(1).setScroll(0,0);this.s.feedback.audio.stop();this.s.rest=0;this.s.controls();
    }
    layout(t){
      const small=this.s.scale.width<1000,home=small?225:365;
      const advance=85*smooth((t-650)/250)-25*smooth((t-1950)/350)-60*smooth((t-4300)/900);
      this.scale=this.s.hero.scaleX;this.actor.setPosition(home+advance-256*this.scale,470-525*this.scale).setScale(this.scale);
      this.enemyBase=small?690:958;this.enemy.setPosition(this.enemyBase,470).clearTint();
      this.heading.setPosition(this.s.scale.width/2,86);this.counter.setPosition(this.s.scale.width/2,this.s.scale.height-60);
      return home+advance;
    }
    update(dt,enabled){
      this.enabled=enabled&&!this.reduced;
      if(this.hold>0)this.hold=Math.max(0,this.hold-dt);else this.t+=dt;
      // Double only the portrait interval (80–870): 790 -> 1580 virtual ms.
      // After it closes, preserve the original attack rhythm and muzzle events.
      const t=this.t<80?this.t:this.t<1660?80+(this.t-80)/2:this.t-790;
      const s=this.s,w=s.scale.width,h=s.scale.height,foot=this.layout(t);
      // Cues use the same virtual clock as the drawings, never timers or fetch callbacks.
      for(const [at,key] of [[950,'mechanism'],[2700,'charge']])if(t>=at&&!this.audioCues.has(key)){
        this.audioCues.add(key);const speed=Number(document.getElementById('speed').value)||1.5;
        s.feedback.audio.special(key,0,Math.max(.12,(3420-t)/1000/speed));
      }
      let pose=t<650?0:t<900?1:t<1460?2:t<1570?3:t<2000?4:t<2400?6:t<2700?0:t<3480?4:t<3730?5:t<4050?4:t<4450?6:7;
      // Place each muzzle on the actual fired drawing, including after a slow frame.
      while(this.next<beats.length&&t>=beats[this.next].at){
        const b=beats[this.next++];pose=b.pose;
        const origins=b.guns.map(([x,y])=>({x:this.actor.x+x*this.scale,y:this.actor.y+y*this.scale}));
        this.events.push({...b,origins});this.count+=origins.length;
        s.feedback.audio.special(b.name==='final'?'final':'shot',this.next);
      }
      this.actor.setTexture('specialPose'+pose).clearTint();
      for(const e of this.events){if(!e.impacted&&t>=e.at+70){e.impacted=true;s.feedback.audio.play('impact');this.hold=e.name==='final'?110:45;}}
      const last=this.events.at(-1),age=last?t-last.at:9999,final=last?.name==='final';
      const impactAge=age-70;
      this.enemy.setTexture(impactAge>=0&&impactAge<400?'hurt':'target');
      if(impactAge>=0&&impactAge<360)this.enemy.x+=Math.sin(clamp(impactAge/360)*Math.PI)*(final?20:8);
      this.dark.clear();this.floor.clear();this.fx.clear();this.burst.setVisible(false);this.ghosts.forEach(o=>o.setAlpha(0));
      if(this.enabled){
        const fade=smooth(t/400)*(1-smooth((t-4350)/1000));
        this.dark.fillStyle(0x020711,.72*fade).fillRect(0,0,w,h);
        this.dark.fillStyle(0x02050b,.92*fade).fillRect(0,0,w,40).fillRect(0,h-34,w,34);
        this.floor.fillStyle(0x060b0c,.6).fillEllipse(foot,474,130,17).fillEllipse(this.enemy.x,474,150,17);
        const charge=clamp((t-2700)/720)*(t<3420?1:0);
        if(charge>0){
          for(const [x,y] of [[463,158],[435,201]]){
            const mx=this.actor.x+x*this.scale,my=this.actor.y+y*this.scale;
            this.fx.lineStyle(1.5,0x95ffe7,.7*charge).strokeCircle(mx,my,12+24*(1-charge));
            for(let i=0;i<12;i++){const a=i*Math.PI/6+t*.004,r=15+70*(1-charge);this.fx.fillStyle(i%2?0xf4cb79:0x7dffe6,.7*charge).fillCircle(mx+Math.cos(a)*r,my+Math.sin(a)*r,(i%3)+1);}
          }
          // Sweep along each barrel, not across the character's face or entire silhouette.
          for(const [ax,ay,bx,by] of [[391,158,463,158],[365,197,435,201]]){
            const p=smooth(charge),x=this.actor.x+(ax+(bx-ax)*p)*this.scale,y=this.actor.y+(ay+(by-ay)*p)*this.scale;
            this.fx.lineStyle(6,0x8affeb,.16).lineBetween(x-9,y,x+9,y);
            this.fx.lineStyle(2,0xffefbd,.9).lineBetween(x-6,y,x+6,y);
            this.fx.lineBetween(x,y-4,x,y+4);
          }
        }
        if(t>=650&&t<1050){
          const p=clamp((t-650)/400);
          this.ghosts.forEach((g,i)=>g.setPosition(this.actor.x-22*(i+1),this.actor.y).setScale(this.scale).setAlpha((1-p)*.14/(i+1)));
          for(let i=0;i<14;i++){const y=195+i*19;this.fx.lineStyle(i%3+1,0x8de4d7,.25*(1-p));this.fx.lineBetween(foot-260-i*8,y,foot-65,y-3);}
        }
        for(const e of this.events)this.drawBurst(e,t);
        this.drawRecoverySmoke(t,pose,dt);
        if(impactAge>=0&&impactAge<650){const p=impactAge/650,hitY=last.origins.reduce((sum,m)=>sum+m.y,0)/last.origins.length;this.burst.setPosition(this.enemyBase-35,hitY).setScale((final?.52:.21)*(.65+.55*smooth(p*2))).setAlpha((final?.95:.65)*(1-smooth((p-.2)/.8))).setVisible(true);}
        const punch=impactAge>=0&&impactAge<180?(1-impactAge/180):0;
        s.cameras.main.setZoom(1).setScroll(Math.sin(impactAge*.11)*punch*(final?3:1),Math.cos(impactAge*.13)*punch*(final?2:0));
        if(age<75)this.actor.setTint(0xffe8b5);
      }else s.cameras.main.setZoom(1).setScroll(0,0);
      this.drawCard(t,w);
      const label=t<650?(this.es?'Preparación':'Preparing'):t<2400?(this.es?'Ráfaga alternada':'Alternating fire'):t<3420?(this.es?'Concentración':'Gathering energy'):t<4300?(this.es?'Disparo doble':'Twin finisher'):(this.es?'Recuperación':'Recovery');
      document.getElementById('phase-label').textContent=label;
      const step=t<650?1:t<4300?2:3;document.querySelectorAll('.steps li').forEach((li,i)=>li.classList.toggle('active',i===step));
      if(this.count)this.counter.setText(`${this.count} ${this.es?'DISPAROS · PRUEBA VISUAL':'SHOTS · VISUAL PREVIEW'}`);
      if(t>=6000)this.stop();
    }
    clearCard(){this.card.clear();this.cardMask.clear();this.portrait.setVisible(false);this.cardTitle.setVisible(false);this.cardSkill.setVisible(false);}
    drawRecoverySmoke(t,pose,dt){
      // Emit from each current drawing's muzzle; existing wisps keep their world position.
      const tips={4:[[463,158],[435,201]],6:[[416,311],[350,344]],7:[[86,343],[417,331]]};
      if(dt>0&&t>=3730&&t<4900&&tips[pose]&&(!this.lastSmoke||t-this.lastSmoke>=65)){
        this.lastSmoke=t;for(const [x,y] of tips[pose])this.smoke.push({at:t,x:this.actor.x+x*this.scale,y:this.actor.y+y*this.scale});
      }
      this.smoke=this.smoke.filter(p=>t-p.at<750);
      for(const p of this.smoke){const k=clamp((t-p.at)/750);this.fx.fillStyle(0xd7e4de,.1*(1-k)).fillCircle(p.x+7*Math.sin(k*3),p.y-26*k,2+8*k);}
    }
    drawCard(t,w){
      this.clearCard();if(!this.enabled||t<80||t>870)return;
      const alpha=smooth((t-80)/130)*(1-smooth((t-670)/200));
      const slide=-90*(1-smooth((t-80)/160))+100*smooth((t-700)/170),y=130,height=285;
      this.card.fillStyle(0x071423,.96*alpha).fillRect(0,y,w,height);
      this.card.fillStyle(0x123f46,.55*alpha).fillTriangle(w*.4,y,w*.73,y,w*.52,y+height);
      this.card.lineStyle(2,0xe7bb68,alpha).lineBetween(0,y,w,y).lineBetween(0,y+height,w,y+height);
      this.cardMask.fillStyle(0xffffff).fillPoints([{x:0,y},{x:w*.61,y},{x:w*.51,y:y+height},{x:0,y:y+height}],true);
      this.portrait.setPosition(w*.04+slide,y-65).setScale(w<1000?.5:.65).setAlpha(alpha).setVisible(true);
      this.cardTitle.setPosition(w*.74-slide*.15,y+112).setAlpha(alpha).setVisible(true);
      this.cardSkill.setPosition(w*.74-slide*.15,y+157).setAlpha(alpha).setVisible(true);
      for(let i=0;i<5;i++){this.card.lineStyle(1,0x8df2dc,.18*alpha).lineBetween(w*.62+i*30,y+height-25-i*8,w,y+height-25-i*8);}
    }
    drawBurst(e,t){
      const age=t-e.at,g=this.fx,final=e.name==='final',hit={x:this.enemyBase-35,y:e.origins.reduce((sum,m)=>sum+m.y,0)/e.origins.length};
      if(age<0||age>1100)return;
      for(const m of e.origins){
        if(age<85){const k=1-age/85;for(let j=3;j>0;j--)g.fillStyle(0xffc377,.055*k).fillEllipse(m.x,m.y,42*j,25*j);g.fillStyle(0xffe1a0,k).fillTriangle(m.x,m.y-9,m.x+48,m.y,m.x,m.y+9);g.fillStyle(0xffffff,k).fillCircle(m.x+5,m.y,4);}
        if(age<260){const p=clamp(age/70),tail=clamp((age-75)/180),x=m.x+(hit.x-m.x)*p;
          for(const [width,color,alpha] of [[final?22:12,0x55e8da,.12],[final?9:5,0xffcc77,.6],[2,0xfff2ce,1]]){g.lineStyle(width,color,alpha*(1-tail));g.lineBetween(m.x+(hit.x-m.x)*tail,m.y,x,m.y);}
        }
        if(age>90){const k=clamp((age-90)/1000);for(let j=0;j<4;j++)g.fillStyle(0xc1d9d4,.075*(1-k)).fillCircle(m.x+8+j*10+k*20,m.y-k*(35+j*12),4+k*(12+j*3));}
      }
      const a=age-70;if(a<0)return;const p=clamp(a/550),radius=(final?110:55)*p;
      for(let j=3;j>0;j--)g.fillStyle(final?0x63eed6:0xffc477,.025*(1-p)).fillEllipse(hit.x,hit.y,70*j*(.5+p),60*j*(.5+p));
      g.lineStyle(final?4:2,0xffd58f,(1-p)*.8).strokeCircle(hit.x,hit.y,8+radius);
      const count=final?26:13;
      for(let i=0;i<count;i++){const angle=i*2.39996,range=(final?190:90)*(0.5+(i%7)/10)*p,x=hit.x+Math.cos(angle)*range,y=hit.y+Math.sin(angle)*range+p*p*50;g.lineStyle(i%3+1,i%2?0xffd78d:0x8cffee,(1-p)*.9);g.lineBetween(x,y,x-Math.cos(angle)*15*(1-p),y-Math.sin(angle)*15*(1-p));}
      if(final&&a<170){const k=1-a/170;g.lineStyle(6,0xffefb5,k).lineBetween(hit.x-75,hit.y-105,hit.x+75,hit.y+105);g.lineStyle(4,0x8cffee,k).lineBetween(hit.x-80,hit.y+70,hit.x+80,hit.y-70);}
    }
  };
})();
