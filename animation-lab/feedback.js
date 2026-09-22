/* Local-only practice feedback. Audio is synthesized and opt-in, never autoplayed. */
(() => {
  class PracticeAudio {
    constructor(es){
      this.enabled=false;this.volume=.25;
      const label=document.createElement('label');label.className='toggle';
      const check=document.createElement('input');check.type='checkbox';check.id='sound';
      label.append(check,document.createTextNode(es?'Sonido':'Sound'));
      const volume=document.createElement('input');volume.type='range';volume.min=0;volume.max=100;volume.value=25;volume.id='volume';volume.style.width='85px';volume.setAttribute('aria-label',es?'Volumen':'Volume');
      const volumeLabel=document.createElement('label');volumeLabel.append(document.createTextNode(es?'Volumen':'Volume'),volume);
      document.querySelector('.controls').append(label,volumeLabel);
      check.onchange=()=>{this.enabled=check.checked;if(!this.enabled)this.stop();if(this.enabled){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('unsupported');this.ctx??=new AC();this.ctx.resume().catch(()=>{});}catch{this.enabled=false;check.checked=false;check.disabled=true;}}};
      volume.oninput=()=>this.volume=Number(volume.value)/100;
      this.nodes=new Set();
    }
    stop(){for(const n of this.nodes){try{n.stop();}catch{}}this.nodes.clear();}
    play(kind,variation=0){
      if(!this.enabled||!this.ctx||this.ctx.state!=='running'||this.volume===0)return;
      const c=this.ctx,t=c.currentTime,d=kind==='shot'?.16:kind==='impact'?.22:.12;
      const gain=c.createGain();gain.gain.setValueAtTime(this.volume*(kind==='shot'?.3:.14),t);gain.gain.exponentialRampToValueAtTime(.0001,t+d);gain.connect(c.destination);
      const buffer=c.createBuffer(1,Math.ceil(c.sampleRate*d),c.sampleRate),data=buffer.getChannelData(0);
      for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/(data.length*.2));
      const noise=c.createBufferSource();noise.buffer=buffer;const filter=c.createBiquadFilter();filter.type=kind==='cloth'?'lowpass':'highpass';filter.frequency.value=kind==='cloth'?450:kind==='shot'?700+variation*90:1800;noise.connect(filter);filter.connect(gain);noise.start(t);noise.stop(t+d);this.nodes.add(noise);noise.onended=()=>{this.nodes.delete(noise);noise.disconnect();filter.disconnect();};
      if(kind!=='cloth'){const o=c.createOscillator();o.type=kind==='impact'?'triangle':'sine';o.frequency.setValueAtTime(kind==='impact'?1400:160,t);o.frequency.exponentialRampToValueAtTime(kind==='impact'?470:45,t+d);o.connect(gain);o.start(t);o.stop(t+d);this.nodes.add(o);o.onended=()=>{this.nodes.delete(o);o.disconnect();gain.disconnect();};}
    }
  }
  window.PracticeFeedback=class {
    constructor(scene,es){
      this.s=scene;this.es=es;this.audio=new PracticeAudio(es);this.labels=[];
      this.hud=scene.add.graphics();this.title=scene.add.text(0,90,es?'GUARDIÁN HOLLOW · PRUEBA':'HOLLOW WARDEN · PRACTICE',{fontFamily:'Arial',fontSize:'12px',color:'#dce8df'}).setOrigin(.5);
      this.hpText=scene.add.text(0,120,'',{fontFamily:'Arial',fontSize:'12px',color:'#dce8df'}).setOrigin(.5);
      this.banner=scene.add.text(0,505,'',{fontFamily:'Georgia',fontSize:'24px',color:'#f3d292',align:'center',stroke:'#10201d',strokeThickness:4}).setOrigin(.5);
      this.reset();
    }
    reset(){this.hp=100;this.shown=100;this.deadAt=null;this.struck=-10000;this.victory=false;this.s.target.setTexture('target').setAlpha(1);this.s.targetShadow.setAlpha(1);this.banner.setText('');for(const x of this.labels)x.text.destroy();this.labels=[];this.audio.stop();}
    fire(i){this.audio.play('shot',i);}
    hit(i){
      if(this.hp===0)return;
      const damage=i===0?45:55;this.hp=Math.max(0,this.hp-damage);this.struck=this.s.clock;if(this.hp===0)this.deadAt=this.s.clock;
      this.audio.play('impact',i);
      const text=this.s.add.text(this.s.targetShadow.x+(i?18:-18),240,String(damage),{fontFamily:'Georgia',fontSize:'28px',color:i?'#ffd58c':'#fff0d3',stroke:'#1b1715',strokeThickness:4}).setOrigin(.5);
      this.labels.push({text,at:this.s.clock});
    }
    update(dt){
      const s=this.s,age=s.clock-this.struck,death=this.deadAt===null?-1:s.clock-this.deadAt;
      this.shown+=(this.hp-this.shown)*(1-Math.exp(-dt/110));
      const base=s.targetShadow.x;s.target.x=base+(age<250?Math.sin(Math.min(1,age/250)*Math.PI)*9:0);
      const key=death>=650?'fallen':death>=180?'kneel':age<180?'hurt':'target';s.target.setTexture(key);
      const small=s.scale.width<1000,y=small?160:82,w=small?240:190,x=base-w/2;
      this.hud.clear();this.hud.fillStyle(0x081510,.82).fillRoundedRect(x-10,y,w+20,small?72:58,4);this.hud.fillStyle(0x473830).fillRect(x,y+30,w,5);this.hud.fillStyle(0xe2ac60).fillRect(x,y+30,w*this.shown/100,5);this.hud.fillStyle(0x74cbb0).fillRect(x,y+30,w*this.hp/100,5);
      this.title.setPosition(base,y+8).setFontSize(small?20:12).setText(small?(this.es?'GUARDIÁN HOLLOW':'HOLLOW WARDEN'):(this.es?'GUARDIÁN HOLLOW · PRUEBA':'HOLLOW WARDEN · PRACTICE'));
      this.hpText.setPosition(base,y+(small?48:38)).setFontSize(small?18:12).setText(`${this.hp} / 100`);
      for(const label of this.labels){const k=(s.clock-label.at)/650;label.text.setY(240-38*Math.min(k,1)).setAlpha(Math.max(0,1-k));}
      this.labels=this.labels.filter(x=>{if(s.clock-x.at>650){x.text.destroy();return false;}return true;});
      if(this.hp===0&&s.action<0){
        this.victory=true;this.banner.setPosition(s.scale.width/2,515).setText(this.es?'Victoria · Prueba completada':'Victory · Practice complete');
        s.phase('victory');document.getElementById('shoot').textContent=this.es?'Volver a probar ↗':'Try again ↗';
        if(death<1600)s.hero.setTexture('idle0');
      }
    }
  };
})();
