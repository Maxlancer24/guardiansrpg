/* Animation sandbox, NOT the authoritative Discord combat resolver.
 * One action per living actor per round. Jessie splits ONE action's demo damage
 * across two visual impacts; no extra turn, critical roll or passive trigger.
 * Fixed Jessie-first order is the choreography fixture, not live initiative.
 */
(() => {
  const Previous=window.PracticeFeedback;
  window.PracticeFeedback=class extends Previous {
    constructor(s,es){
      super(s,es);
      const style={fontFamily:'Arial',fontSize:'12px',color:'#dce8df'};
      this.heroTitle=s.add.text(0,0,'JESSIE',style).setOrigin(.5);
      this.heroHpText=s.add.text(0,0,'',style).setOrigin(.5);
      this.movingShadow=s.add.ellipse(0,470,140,16,0x050a09,.45).setVisible(false);
      s.children.sendToBack(this.movingShadow);s.children.sendToBack(s.children.list.find(x=>x.texture?.key==='arena'));
      const b=document.createElement('button');b.id='preview-defeat';b.textContent=es?'Probar derrota':'Preview defeat';
      b.title=es?'Escenario de animación con 1 PV; no afecta tu personaje':'Animation scenario with 1 HP; does not affect your character';
      document.getElementById('reset').after(b);
      b.onclick=()=>{if(s.action>=0||this.state==='enemy')return;s.reset();this.heroHp=1;this.heroShown=1;this.beginEnemy();};
      document.querySelector('[data-copy="description"]').textContent=es?'Prueba visual por rondas: una acción por personaje. Dos disparos de Jessie dentro de una sola acción. Sin conexión al bot ni recompensas.':'Round-based animation sandbox: one action per character. Jessie fires twice within one action. No bot connection or rewards.';
      document.querySelector('[data-copy="note"]').textContent=es?'Vida y daño de prueba · Orden fijo Jessie → Guardián · Las reglas completas de iniciativa, equipo y estados siguen en el bot.':'Demo health and damage · Fixed Jessie → Warden order · Full initiative, equipment and status rules remain in the bot.';
    }
    reset(){
      super.reset();this.hp=140;this.shown=140;this.heroHp=140;this.heroShown=140;this.state='ready';this.round=1;
      this.enemyTime=0;this.enemyHits=0;this.heroStruck=-10000;this.endTime=0;this.defeat=false;
      if(this.s.hero){this.s.hero.x=this.s.scale.width<1000?123.2:233.2;this.s.hero.clearTint();}
      document.getElementById('shoot').textContent=this.es?'Dos disparos ↗':'Double shot ↗';
    }
    busy(){return this.state==='enemy'||this.state==='victory'||this.state==='defeat';}
    startShot(){this.state='shoot';}
    hit(i){
      if(!this.hp)return;
      // Fixture: 42 total, split 21+21. This is not two independent attacks.
      const damage=Math.min(21,this.hp);this.hp-=damage;this.struck=this.s.clock;
      if(!this.hp)this.deadAt=this.s.clock;
      this.audio.play('impact',i);this.number(damage,this.s.target.x+(i?18:-18),'#ffd58c');
    }
    number(n,x,color){const text=this.s.add.text(x,260,String(n),{fontFamily:'Georgia',fontSize:'28px',color,stroke:'#18201a',strokeThickness:4}).setOrigin(.5);this.labels.push({text,at:this.s.clock});}
    afterShot(){if(!this.hp){this.state='victory';this.victory=true;this.endTime=0;}else this.beginEnemy();this.s.controls();}
    beginEnemy(){this.state='enemy';this.enemyTime=0;this.connected=false;this.s.controls();}
    update(dt){
      const s=this.s,small=s.scale.width<1000,home=s.targetShadow.x,heroHome=(small?280:390)-245*.64;
      const age=s.clock-this.struck,death=this.deadAt===null?-1:s.clock-this.deadAt;
      this.shown+=(this.hp-this.shown)*(1-Math.exp(-dt/110));this.heroShown+=(this.heroHp-this.heroShown)*(1-Math.exp(-dt/110));
      s.hero.x=heroHome;s.hero.clearTint();s.target.x=home;
      const breathe=[0,1,2,3,2,1][Math.floor(s.clock/240)%6];
      s.target.setTexture(death>=650?'fallen':death>=180?'kneel':age<220?'hurt':`wardenIdle${breathe}`);
      if(this.state==='enemy'){
        this.enemyTime+=dt;const t=this.enemyTime,contact=heroHome+256*.64+145;
        const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
        const travel=t<650?ease((t-350)/300):t>1550?1-ease((t-1550)/650):1;
        s.target.x=home+(contact-home)*travel;
        const key=t<650?2:t<900?3:t<1120?4:t<1280?5:t<1550?6:7;
        s.target.setTexture('wardenAnim'+key);
        s.phase(t<1120?'enemyAim':t<1550?'enemyFire':'enemyRecover');
        if(t<1120)s.hero.setTexture(t<650?'idle0':'jessieReaction1');
        if(t>=1120&&!this.connected){this.connected=true;this.enemyHits++;const damage=Math.min(38,this.heroHp);this.heroHp-=damage;this.heroStruck=s.clock;this.audio.play('impact');this.number(damage,heroHome+256*.64,'#ffbcaa');}
        const hurt=s.clock-this.heroStruck;
        if(hurt>=0&&hurt<700){s.hero.setTexture(hurt<260?'jessieReaction2':'jessieReaction3');s.hero.x=heroHome-7*Math.sin(Math.min(1,hurt/700)*Math.PI);}
        if(t>=2200){s.target.x=home;if(!this.heroHp){this.state='defeat';this.defeat=true;this.endTime=0;}else{this.state='ready';this.round++;s.rest=0;}s.controls();}
      }
      if(this.state==='victory'||this.state==='defeat'){
        this.endTime+=dt;
        const winTime=Math.max(0,this.endTime-450);
        const winBlink=winTime%4800>=4500&&winTime%4800<4620;
        const winFrame=winBlink?3:[0,1,2,1][Math.floor(winTime/300)%4];
        s.hero.setTexture(this.state==='victory'?(this.endTime<450?'jessieReaction4':`jessieWin${winFrame}`):(this.endTime<450?'jessieReaction6':'jessieReaction7'));
        s.phase(this.state);
      }
      // Contact accent is drawn only on the axe's hit, never while winding up.
      const hurt=s.clock-this.heroStruck;
      if(s.effectsEnabled&&hurt>=0&&hurt<200){const k=1-hurt/200,x=s.target.x-130,y=435;s.fx.lineStyle(3,0xffd2a2,k);s.fx.lineBetween(x-14,y-18,x+15,y+18);s.fx.lineBetween(x-18,y+12,x+18,y-12);if(hurt<70)s.hero.setTint(0xffcfb4);}
      s.target.setOrigin(.5,s.target.texture.key.startsWith('wardenAnim')?1238/1280:1050/1092);
      this.movingShadow.setPosition(s.target.x,470).setVisible(this.state==='enemy');s.targetShadow.setVisible(this.state!=='enemy');
      this.hud.clear();const y=small?485:82,w=small?216:190;
      const bar=(x,title,label,hp,shown,color)=>{this.hud.fillStyle(0x081510,.85).fillRoundedRect(x-w/2-10,y,w+20,small?72:58,4);this.hud.fillStyle(0x473830).fillRect(x-w/2,y+30,w,5);this.hud.fillStyle(0xe2ac60).fillRect(x-w/2,y+30,w*shown/140,5);this.hud.fillStyle(color).fillRect(x-w/2,y+30,w*hp/140,5);title.setPosition(x,y+8).setFontSize(small?18:12);label.setPosition(x,y+(small?48:38)).setFontSize(small?18:12).setText(`${hp} / 140`);};
      this.title.setText(this.es?'GUARDIÁN HOLLOW':'HOLLOW WARDEN');bar(home,this.title,this.hpText,this.hp,this.shown,0x74cbb0);bar(small?280:390,this.heroTitle,this.heroHpText,this.heroHp,this.heroShown,0x74cbb0);
      const message=this.victory?(this.es?'Victoria · Jessie':'Victory · Jessie'):this.defeat?(this.es?'Derrota · Vuelve a intentarlo':'Defeat · Try again'):this.es?`Ronda ${this.round} · ${this.state==='enemy'?'Turno del guardián':'Turno de Jessie'}`:`Round ${this.round} · ${this.state==='enemy'?'Warden’s turn':'Jessie’s turn'}`;
      this.banner.setPosition(s.scale.width/2,small?600:530).setFontSize(small?23:22).setText(message);
      for(const label of this.labels){const k=(s.clock-label.at)/650;label.text.setY(260-38*Math.min(k,1)).setAlpha(Math.max(0,1-k));}
      this.labels=this.labels.filter(x=>{if(s.clock-x.at>650){x.text.destroy();return false;}return true;});
      document.getElementById('preview-defeat').disabled=s.action>=0||this.state==='enemy';
    }
  };
})();
