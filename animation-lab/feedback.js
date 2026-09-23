/* Local-only practice feedback. CC0 recordings + synthesized accents; opt-in. */
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
      this.status=document.createElement('small');this.status.setAttribute('role','status');this.status.style.maxWidth='180px';document.querySelector('.controls').append(this.status);this.es=es;this.buffers={};this.cues=[];
      check.onchange=()=>{this.enabled=check.checked;if(!this.enabled)this.stop();if(this.enabled){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('unsupported');this.ctx??=new AC();this.initBus();this.ctx.resume().catch(()=>{});this.loadSamples();}catch{this.enabled=false;check.checked=false;check.disabled=true;}}};
      volume.oninput=()=>{this.volume=Number(volume.value)/100;if(this.master)this.master.gain.setTargetAtTime(this.volume,this.ctx.currentTime,.015);};
      this.nodes=new Set();
      window.audioSnapshot=()=>({enabled:this.enabled,volume:this.volume,master:this.master?.gain.value,loaded:Object.keys(this.buffers),voices:this.nodes.size,cues:this.cues.slice(-30),state:this.ctx?.state});
    }
    initBus(){
      if(this.master)return;const c=this.ctx;this.master=c.createGain();this.master.gain.value=this.volume;
      this.compressor=c.createDynamicsCompressor();this.compressor.threshold.value=-12;this.compressor.knee.value=12;this.compressor.ratio.value=6;this.compressor.attack.value=.003;this.compressor.release.value=.18;
      this.compressor.connect(this.master);this.master.connect(c.destination);
    }
    async loadSamples(){
      if(this.loading)return;this.loading=true;this.status.textContent=this.es?'Cargando sonidos…':'Loading sounds…';
      await Promise.all(['shot','mechanism'].map(async name=>{try{
        const r=await fetch(`/assets/demo-battle/audio-v1/${name}.wav`,{signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error(r.status);
        this.buffers[name]=await this.ctx.decodeAudioData(await r.arrayBuffer());
      }catch{/* No late playback. Missing samples retain the synthesized fallback. */}}));
      this.status.textContent=Object.keys(this.buffers).length===2?(this.es?'Audio real listo':'Recorded audio ready'):(this.es?'Audio básico disponible':'Basic audio available');
    }
    sample(name,{level=.5,pan=-.2,rate=1}={}){
      if(!this.enabled||!this.ctx||this.ctx.state!=='running'||!this.volume)return false;
      const buffer=this.buffers[name];if(!buffer)return false;
      const c=this.ctx,n=c.createBufferSource(),g=c.createGain(),p=c.createStereoPanner();n.buffer=buffer;n.playbackRate.value=rate;g.gain.value=level;p.pan.value=pan;
      n.connect(g);g.connect(p);p.connect(this.compressor);this.nodes.add(n);n.onended=()=>{this.nodes.delete(n);n.disconnect();g.disconnect();p.disconnect();};n.start();return true;
    }
    special(kind,variation=0,duration=.48){
      if(!this.enabled||!this.ctx||this.ctx.state!=='running'||!this.volume)return;
      this.cues.push(kind);if(this.cues.length>100)this.cues.shift();
      if(kind==='mechanism'){if(!this.sample('mechanism',{level:.28}))this.play('cloth');return;}
      if(kind==='shot'||kind==='final'){
        if(!this.sample('shot',{level:kind==='final'?.6:.48,rate:variation%2?.98:1.02}))this.play('shot',variation);
        if(kind==='final'){this.sample('shot',{level:.26,pan:.12,rate:.91});this.special('tail');}return;
      }
      const c=this.ctx,t=c.currentTime,o=c.createOscillator(),g=c.createGain(),charge=kind==='charge',d=charge?Math.max(.12,duration):.55;
      o.type='sine';o.frequency.setValueAtTime(charge?180:105,t);o.frequency.exponentialRampToValueAtTime(charge?820:32,t+d);
      g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(charge?.065:.2,t+(charge?d*.7:.015));g.gain.exponentialRampToValueAtTime(.0001,t+d);
      o.connect(g);g.connect(this.compressor);this.nodes.add(o);o.onended=()=>{this.nodes.delete(o);o.disconnect();g.disconnect();};o.start(t);o.stop(t+d);
    }
    effect(kind,variation=0){
      if(!this.enabled||!this.ctx||this.ctx.state!=='running'||!this.volume||this.nodes.size>24)return;
      const c=this.ctx,t=c.currentTime,pan=kind==='whoosh'?.25:kind==='parry'?-.18:0;
      this.cues.push(kind);if(this.cues.length>100)this.cues.shift();
      const layer=(freq,end,d,level,type='sine',noise=false,delay=0)=>{
        const start=t+delay,g=c.createGain(),p=c.createStereoPanner();p.pan.value=pan;
        g.gain.setValueAtTime(.0001,start);g.gain.linearRampToValueAtTime(level,start+.012);g.gain.exponentialRampToValueAtTime(.0001,start+d);
        let n,filter;if(noise){n=c.createBufferSource();const b=c.createBuffer(1,Math.ceil(c.sampleRate*d),c.sampleRate),data=b.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;n.buffer=b;filter=c.createBiquadFilter();filter.type='bandpass';filter.Q.value=.7;filter.frequency.setValueAtTime(freq,start);filter.frequency.exponentialRampToValueAtTime(end,start+d);n.connect(filter);filter.connect(g);}else{n=c.createOscillator();n.type=type;n.frequency.setValueAtTime(freq,start);n.frequency.exponentialRampToValueAtTime(end,start+d);n.connect(g);}
        g.connect(p);p.connect(this.compressor);this.nodes.add(n);n.onended=()=>{this.nodes.delete(n);n.disconnect();filter?.disconnect();g.disconnect();p.disconnect();};n.start(start);n.stop(start+d);
      };
      if(kind==='whoosh'||kind==='dash'){layer(500,2400,.24,.09,'sine',true);layer(180,65,.2,.045);return;}
      if(kind==='parry'){for(const [i,f] of [1480,2371,3547].entries())layer(f,f*.96,.24+i*.09,.045/(i+1));layer(4500,1600,.08,.09,'sine',true);return;}
      if(kind==='break'){layer(170,38,.35,.17);layer(3200,280,.25,.13,'sine',true);layer(770,160,.18,.05,'triangle');return;}
      if(kind==='rest'){layer(420,630,.55,.035);layer(840,1260,.7,.018,'sine',false,.08);return;}
      // Dense short transient + body + a quiet material tail, not a piercing beep.
      layer(145+variation*6,42,.22,.14);layer(2400,700,.10,.11,'sine',true);layer(630,230,.16,.035,'triangle');
    }
    stop(){for(const n of this.nodes){try{n.stop();}catch{}}this.nodes.clear();}
    play(kind,variation=0){
      if(!this.enabled||!this.ctx||this.ctx.state!=='running'||this.volume===0)return;
      if(['impact','parry','break','whoosh','dash','rest'].includes(kind)){this.effect(kind,variation);return;}
      const c=this.ctx,t=c.currentTime,d=kind==='shot'?.16:kind==='impact'?.22:.12;
      if(kind==='shot'&&this.sample('shot',{level:.48,rate:variation%2?.98:1.02}))return;
      const gain=c.createGain();gain.gain.setValueAtTime(kind==='shot'?.3:.14,t);gain.gain.exponentialRampToValueAtTime(.0001,t+d);gain.connect(this.compressor);
      const buffer=c.createBuffer(1,Math.ceil(c.sampleRate*d),c.sampleRate),data=buffer.getChannelData(0);
      for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/(data.length*.2));
      const noise=c.createBufferSource();noise.buffer=buffer;const filter=c.createBiquadFilter();filter.type=kind==='cloth'?'lowpass':'highpass';filter.frequency.value=kind==='cloth'?450:kind==='shot'?700+variation*90:1800;noise.connect(filter);filter.connect(gain);noise.start(t);noise.stop(t+d);this.nodes.add(noise);noise.onended=()=>{this.nodes.delete(noise);noise.disconnect();filter.disconnect();if(kind==='cloth')gain.disconnect();};
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
