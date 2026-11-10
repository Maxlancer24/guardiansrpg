/* Presentation adapter for the existing battle atlases. Only rules.js changes HP.
 * Scene events replay committed snapshots; movement never affects battle results. */
window.TutorialScene=class{
 constructor(canvas,onUpdate,onEnd,words){
  this.canvas=canvas;this.ctx=canvas.getContext('2d');this.update=onUpdate;this.end=onEnd;this.words=words;
  this.images={};this.time=0;this.last=0;this.queue=[];this.current=null;this.modes=[{name:'idle',at:0},{name:'idle',at:0}];this.labels=[];this.sparks=[];this.serial=0;this.speed=1.5;this.motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;this.paused=false;this.suspended=false;this.voices=new Set();this.sound=false;
  this.raf=requestAnimationFrame(t=>this.tick(t));
 }
 async load(avatar){
  const packs=avatar==='alchemist'?ALCHEMIST_ACTIONS:GUARDIAN_ACTIONS;
  const paths={arena:'/assets/design-20261110/combat-arena.webp'};
  for(const key of Object.keys(packs))paths[avatar+':'+key]='/assets/tutorial-20261110/'+avatar+'-'+key+'.webp';
  for(let i=0;i<4;i++)paths['hi'+i]='/assets/tutorial-20261110/hollow-idle-'+i+'.webp';
  for(let i=0;i<8;i++)paths['ha'+i]='/assets/tutorial-20261110/hollow-attack-'+i+'.webp';
  for(const key of ['hurt','kneel','fallen'])paths['h'+key]='/assets/tutorial-20261110/hollow-'+key+'.webp';
  await Promise.all(Object.entries(paths).map(([key,src])=>this.images[key]?null:new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>{this.images[key]=i;resolve();};i.onerror=()=>reject(Error('asset '+key));i.src=src;})));
  this.avatar=avatar;this.packs=packs;
 }
 reset(state){this.state=structuredClone(state);this.queue=[];this.current=null;this.result=null;this.modes=[{name:'idle',at:this.time},{name:'idle',at:this.time}];this.labels=[];this.sparks=[];this.serial=0;this.paused=false;this.stopSounds();this.draw();}
 setMode(id,name){this.modes[id]={name,at:this.time};if(id===0&&name==='attack')this.modes[id].variant=this.serial++%2;}
 attackPack(){return GuardianAnimation.attackKey(this.packs,this.modes[0].variant||0);}
 audio(key){if(!this.sound||this.suspended||document.hidden)return;const voice=new Audio('/assets/demo-battle/audio-v1/'+key+'.wav');voice.volume=.16;this.voices.add(voice);voice.onended=()=>this.voices.delete(voice);voice.play().catch(()=>this.voices.delete(voice));}
 stopSounds(){for(const voice of this.voices)voice.pause();this.voices.clear();}
 float(id,value,good=false){this.labels.push({id,value,good,at:this.time});}
 add(duration,at,begin,impact,finish=()=>{}){this.queue.push({duration:this.motion?duration:380,at:this.motion?at:180,begin,impact,finish,hit:false});}
 apply(event){this.state=structuredClone(event.state);this.update(event,this.state);}
 attack(id,event,counter=false){
  const target=1-id,outcome=counter?'hit':event.outcome,amount=counter?event.reflected:event.amount;
  this.add(id===0&&this.avatar==='alchemist'?2600:2250,id===0&&this.avatar==='alchemist'?1580:1235,
   ()=>{this.setMode(id,'attack');},
   ()=>{
    if(outcome==='parry'){this.setMode(target,'guard');this.modes[target].contact=this.time;this.float(target,'PARRY',true);this.audio('parry');}
    else if(outcome==='dodge')this.float(target,this.words('Esquiva','Dodge'),true);
    else{this.state.actors[target].hp=Math.max(0,this.state.actors[target].hp-amount);this.setMode(target,this.state.actors[target].hp?'hurt':'defeat');this.float(target,'−'+amount);this.audio('axe');}
    this.sparks.push({id:target,good:outcome==='parry',at:this.time});
    if(!counter&&event.reflected){this.state.actors[id].focus=event.state.actors[id].focus;this.state.actors[id].ultra=event.state.actors[id].ultra;this.update({...event,type:'blocked'},this.state);}
    else this.apply(counter?{...event,type:'counter',actor:id}:event);
   },()=>{for(const n of [id,target])if(this.state.actors[n].hp>0)this.setMode(n,this.actions[n]==='DEFEND'?'guard':this.actions[n]==='REST'?'rest':'idle');});
 }
 play(result){
  this.actions=result.actions;this.result=result;this.queue=[];
  this.actions.forEach((a,id)=>this.setMode(id,a==='DEFEND'?'guard':a==='REST'?'rest':'idle'));
  for(const e of result.events){
   if(e.type==='attack'){this.attack(e.actor,e);if(e.reflected)this.attack(1-e.actor,e,true);}
   else if(e.type==='rest'||e.type==='auxiliary'){
    this.add(1350,700,()=>this.setMode(e.actor,'activation'),()=>{this.apply(e);this.float(e.actor,'+'+e.heal,true);this.audio('mechanism');},()=>this.setMode(e.actor,this.actions[e.actor]==='DEFEND'?'guard':'idle'));
   }else if(e.type==='interrupted')this.add(550,100,()=>{},()=>this.apply(e));
  }
  this.next();
 }
 next(){
  this.current=this.queue.shift()||null;
  if(this.current){this.current.started=this.time;this.current.begin();return;}
  if(!this.result)return;
  this.state=structuredClone(this.result.next);
  for(let id=0;id<2;id++)this.setMode(id,this.state.actors[id].hp>0?(this.result.finished?'victory':'idle'):'defeat');
  const done=this.result;this.result=null;this.end(done);this.draw();
 }
 sprite(mode,frame,x,y,size){const p=this.packs[mode]||this.packs.idle,r=p.frames[frame],factor=GuardianScale.factor(this.avatar,size),s=p.scale*factor*(p.frameScale?.[frame]||1);this.ctx.drawImage(this.images[this.avatar+':'+mode],r[0],r[1],r[2],r[3],x-r[4]*s,y-r[5]*s,r[2]*s,r[3]*s);}
 actor(id,x,y,size){
  const st=this.modes[id],age=this.motion?this.time-st.at:900;let mode=st.name,frame=0;
  if(mode==='attack'&&this.motion){
   if(id===0&&this.avatar==='alchemist'){
    if(age<360){mode='idle';frame=0;}else frame=GuardianAnimation.frame(this.packs.attack,age-360,false);
   }else{
    const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n);},back=1780,pack=id===0?this.packs[this.attackPack()]:null;
    const advance=id===0?Math.max(0,720-size*.1-x-pack.reach*pack.scale*GuardianScale.factor(this.avatar,size)):size*1.03;
    x+=(id?-1:1)*advance*ease(age/360)*(1-ease((age-back)/470));
    if(id===0){if(age<360){mode='motion';frame=Math.min(2,Math.floor(age/120));}else if(age>=back){mode='motion';frame=Math.min(5,3+Math.floor((age-back)/(470/3)));y-=Math.sin(Math.PI*clamp((age-back)/470))*size*.15;}else frame=GuardianAnimation.frame(pack,age-360,false);}
   }
  }
  const ctx=this.ctx;
  if(this.state.actors[id].focus||mode==='activation'||mode==='guard'){
   const g=ctx.createRadialGradient(x,y-size*.45,4,x,y-size*.45,size*.65);g.addColorStop(0,this.state.actors[id].ultra?'#efc86a55':mode==='guard'?'#9fe3cd30':'#85dbf22c');g.addColorStop(1,'#80cfb000');ctx.fillStyle=g;ctx.fillRect(x-size*.7,y-size*1.1,size*1.4,size*1.3);
  }
  if(id===0){
   if(st.name!=='attack'||!this.motion){const p=this.packs[mode]||this.packs.idle;if(mode==='guard'){const contact=this.time-(st.contact??-Infinity);frame=contact<660?(contact<140?3:contact<440?4:5):1;}else if(mode==='victory')frame=GuardianAnimation.victory(p,age);else frame=GuardianAnimation.frame(p,this.motion?age:0,mode==='idle'||mode==='rest');}
   if(mode==='attack')mode=this.attackPack();this.sprite(mode,frame,x,y,size);
  }else{
   let key='hi'+(this.motion?[0,1,2,3,2,1][Math.floor(this.time/350)%6]:0),anchor=1050;
   if(mode==='attack'){key='ha'+(age<650?2:age<900?3:age<1120?4:age<1280?5:age<1550?6:7);anchor=1238;}
   else if(mode==='hurt')key='hhurt';else if(mode==='defeat')key=age<240?'hhurt':age<1080?'hkneel':'hfallen';
   const im=this.images[key],s=size/950;ctx.drawImage(im,x-720.5*s,y-anchor*s,im.width*s,im.height*s);
  }
  return {x,y,frame,mode};
 }
 draw(){
  if(!this.state||!this.avatar||!this.canvas.clientWidth)return;
  const ctx=this.ctx,w=960,h=w*this.canvas.clientHeight/this.canvas.clientWidth,dpr=Math.min(devicePixelRatio||1,2),pw=Math.round(this.canvas.clientWidth*dpr),ph=Math.round(this.canvas.clientHeight*dpr);
  if(this.canvas.width!==pw||this.canvas.height!==ph){this.canvas.width=pw;this.canvas.height=ph;}
  ctx.setTransform(pw/w,0,0,ph/h,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  const bg=this.images.arena,s=Math.max(w/bg.width,h/bg.height);ctx.drawImage(bg,(w-bg.width*s)/2,(h-bg.height*s)/2,bg.width*s,bg.height*s);
  const shade=ctx.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#06161030');shade.addColorStop(.6,'#06161000');shade.addColorStop(1,'#06161099');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
  const size=this.canvas.clientWidth<=600?300:250,floor=h*.83,homes=[265,720],poses=homes.map((x,id)=>this.actor(id,x,floor,size));
  if(this.motion&&this.modes[0].name==='attack'){
   const args={id:this.avatar,age:this.time-this.modes[0].at,frame:poses[0].frame,pack:this.packs[this.attackPack()],factor:GuardianScale.factor(this.avatar,size),x:poses[0].x,y:poses[0].y,end:{x:homes[1],y:floor-size*.7},size,reduced:false,enabled:true};
   if(this.avatar==='alchemist')GuardianAlchemyFX.draw(ctx,args);else GuardianMeleeFX.draw(ctx,args);
  }
  for(const spark of this.sparks){const age=this.time-spark.at;if(age>450||!this.motion)continue;ctx.save();ctx.globalAlpha=1-age/450;ctx.strokeStyle=spark.good?'#b7ffe2':'#ffe5ac';ctx.lineWidth=3;const x=homes[spark.id],y=floor-size*.65;for(let i=0;i<10;i++){const a=i*Math.PI/5,r=12+age*.15;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r*.55,y+Math.sin(a)*r*.55);ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);ctx.stroke();}ctx.restore();}
  for(const label of this.labels){const age=this.time-label.at;if(age>1400)continue;ctx.save();ctx.globalAlpha=Math.min(1,(1400-age)/300);ctx.font='bold 34px Arial';ctx.textAlign='center';ctx.strokeStyle='#071711';ctx.lineWidth=5;ctx.fillStyle=label.good?'#aff7ce':'#ffe2ab';const x=homes[label.id],y=floor-size*.8-(this.motion?age*.045:0);ctx.strokeText(label.value,x,y);ctx.fillText(label.value,x,y);ctx.restore();}
  this.labels=this.labels.filter(e=>this.time-e.at<1400);this.sparks=this.sparks.filter(e=>this.time-e.at<450);
 }
 tick(now){const dt=this.last?Math.min(80,now-this.last):0;this.last=now;
  if(!this.paused&&!this.suspended&&!document.hidden){this.time+=dt*this.speed;const e=this.current;if(e){const age=this.time-e.started;if(!e.hit&&age>=e.at){e.hit=true;e.impact();}if(age>=e.duration){e.finish();this.next();}}this.draw();}
  this.raf=requestAnimationFrame(t=>this.tick(t));
 }
};
