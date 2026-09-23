/* Page-owned music: deliberately independent of battle reset and SFX stop(). */
(() => {
 window.PracticeMusic=class {
  constructor(es){
   this.track=new Audio('/assets/demo-battle/audio-v1/airship-armada.mp3');
   this.track.loop=true;this.track.preload='none';this.track.volume=.10;
   this.enabled=false;this.request=0;
   const controls=document.querySelector('.controls'),label=document.createElement('label');
   label.className='toggle';this.toggle=document.createElement('input');this.toggle.type='checkbox';this.toggle.id='music';
   label.append(this.toggle,document.createTextNode(es?'Música':'Music'));
   const volumeLabel=document.createElement('label');this.volume=document.createElement('input');
   this.volume.id='music-volume';this.volume.type='range';this.volume.min=0;this.volume.max=100;this.volume.value=10;this.volume.style.width='85px';
   this.volume.setAttribute('aria-label',es?'Volumen de música':'Music volume');
   volumeLabel.append(document.createTextNode(es?'Música · volumen':'Music · volume'),this.volume);
   this.status=document.createElement('small');this.status.setAttribute('role','status');
   controls.append(label,volumeLabel,this.status);
   this.toggle.onchange=()=>this.setEnabled(this.toggle.checked,es);
   this.volume.oninput=()=>{this.track.volume=Math.max(0,Math.min(1,Number(this.volume.value)/100));};
   this.track.addEventListener('error',()=>{this.request++;this.enabled=false;this.track.pause();this.toggle.checked=false;this.status.textContent=es?'No se pudo cargar la música. Puedes volver a intentarlo.':'Music could not load. You can try again.';});
  }
  async setEnabled(enabled,es){
   const request=++this.request;this.enabled=enabled;this.toggle.checked=enabled;this.status.textContent='';
   if(!enabled){this.track.pause();return;}
   try{await this.track.play();if(!this.enabled)this.track.pause();}
   catch{if(request!==this.request)return;this.enabled=false;this.toggle.checked=false;this.status.textContent=es?'Pulsa Música para volver a intentar.':'Select Music to try again.';}
  }
 };
})();
