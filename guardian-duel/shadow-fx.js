/* Shadow Weaver presentation only; the combat rules own the single damage event. */
(function(root){
 'use strict';
 const timing={approach:360,release:1300,impact:1440,end:1810};
 const clamp=n=>Math.max(0,Math.min(1,n));
 const smooth=n=>{const t=clamp(n);return t*t*(3-2*t)};
 function socket(pack,frame,factor,x,y){
  const r=pack.frames[frame],p=pack.castSockets.palm[frame],s=pack.scale*factor*(pack.frameScale?.[frame]||1);
  return{x:x+(p[0]-r[0]-r[4])*s,y:y+(p[1]-r[1]-r[5])*s};
 }
 function sample({age,frame,pack,factor,x,y,end}){
  if(age<timing.approach||age>=timing.end||!pack.castSockets?.palm)return null;
  const palm=socket(pack,frame,factor,x,y),start=socket(pack,2,factor,x,y);
  const u=clamp((age-timing.release)/(timing.impact-timing.release));
  const fade=1-clamp((age-timing.impact)/(timing.end-timing.impact));
  return{palm,start,end,charge:clamp((age-timing.approach)/(timing.release-timing.approach)),u,fade,
   projectile:age>=timing.release&&age<timing.impact,
   contact:age>=timing.impact,point:{x:start.x+(end.x-start.x)*u,y:start.y+(end.y-start.y)*u}};
 }
 function glow(ctx,p,r,alpha){
  const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);
  g.addColorStop(0,`rgba(245,220,255,${alpha})`);g.addColorStop(.2,`rgba(185,114,255,${alpha*.8})`);g.addColorStop(1,'rgba(85,34,140,0)');
  ctx.fillStyle=g;ctx.fillRect(p.x-r,p.y-r,r*2,r*2);
 }
 function tendril(ctx,a,b,width,phase,color){
  const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);if(len<1)return;
  const nx=-dy/len,ny=dx/len;ctx.beginPath();
  for(const side of [1,-1])for(let i=0;i<=28;i++){
   const t=side===1?i/28:1-i/28,envelope=Math.sin(Math.PI*t),bend=Math.sin(t*6+phase)*width*1.3*envelope,
    spread=width*envelope*side,px=a.x+dx*t+nx*(bend+spread),py=a.y+dy*t+ny*(bend+spread);
   side===1&&i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
  }
  ctx.closePath();ctx.fillStyle=color;ctx.fill();
 }
 function draw(ctx,input){
  const g=sample(input);if(!g)return false;
  const s=(input.size||230)/230,reduced=!!input.reduced,enabled=input.enabled!==false;
  ctx.save();
  if(enabled){
   glow(ctx,g.palm,(10+g.charge*25)*s,(reduced?.12:.32)*g.charge*g.fade);
   if(!reduced&&!g.contact)for(let i=0;i<7;i++){
    const a=input.age/280+i*2.399,r=(8+(1-g.charge)*22)*s;
    glow(ctx,{x:g.palm.x+Math.cos(a)*r,y:g.palm.y+Math.sin(a)*r*.55},3*s,g.charge*.5);
   }
  }
  if(g.projectile){
   if(enabled)paintOrb(ctx,{center:g.point,radius:18*input.pack.scale*input.factor*(1.15-g.u*.15),phase:input.reduced?0:input.age/540,opacity:1},input.reduced);
   if(enabled&&!reduced){
    tendril(ctx,g.start,g.point,12*s,input.age/160,'rgba(42,14,68,.64)');
    ctx.globalCompositeOperation='lighter';
    tendril(ctx,g.start,g.point,5*s,input.age/110,'rgba(171,100,243,.50)');
    glow(ctx,g.point,28*s,.55);
   }
   // Even with decorative effects disabled, the attack remains readable.
   tendril(ctx,g.start,g.point,(reduced?1.4:2)*s,0,'rgba(239,206,255,.94)');
  }
  if(g.contact&&enabled){
   const t=(input.age-timing.impact)/(timing.end-timing.impact);
   ctx.globalCompositeOperation='lighter';glow(ctx,g.end,(reduced?20:52)*s,g.fade*(reduced?.16:.44));
   if(!reduced){ctx.globalAlpha=g.fade;
    for(let i=0;i<9;i++){
     const a=i*2.399,r=(12+55*t)*s,p={x:g.end.x+Math.cos(a)*r,y:g.end.y+Math.sin(a)*r*.75};
     tendril(ctx,g.end,p,(2+i%3)*s,i,'rgba(208,153,255,.6)');
    }
   }
  }
  ctx.restore();return true;
 }
 function idleSample({age=0,frame,pack,factor,x,y,reduced=false,enabled=true}){
  if(!enabled||!pack.castSockets?.palm?.[frame])return null;
  const palm=socket(pack,frame,factor,x,y),s=pack.scale*factor*(pack.frameScale?.[frame]||1);
  const phase=reduced?0:age*Math.PI*2/3400,pulse=1+Math.sin(phase)*.08;
  return{palm,center:{x:palm.x,y:palm.y-(26+(reduced?0:Math.sin(phase)*1.5))*s},radius:18*s*pulse,phase,scale:s};
 }
 function paintOrb(ctx,g,reduced){
  const {center:p,radius:r,phase}=g;ctx.save();
  ctx.globalAlpha=g.opacity??1;
  glow(ctx,p,r*3.3,reduced?.18:.30);
  // Solid shaded energy core, not an outlined circle or a baked sprite overlay.
  const core=ctx.createRadialGradient(p.x-r*.32,p.y-r*.4,r*.08,p.x,p.y,r);
  core.addColorStop(0,'#fff1ff');core.addColorStop(.18,'#e4b9ff');
  core.addColorStop(.48,'#b067ed');core.addColorStop(.82,'#6737a3');core.addColorStop(1,'rgba(96,45,154,.12)');
  ctx.fillStyle=core;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();
  ctx.globalCompositeOperation='lighter';
  tendril(ctx,{x:p.x-r*.9,y:p.y+r*.24},{x:p.x+r*.85,y:p.y-r*.3},r*.16,phase,'rgba(232,191,255,.58)');
  glow(ctx,{x:p.x-r*.3,y:p.y-r*.32},r*.42,.6);
  if(!reduced)for(let i=0;i<5;i++){
   const a=phase*.7+i*Math.PI*2/5,orbit=r*(1.3+(i%2)*.4);
   glow(ctx,{x:p.x+Math.cos(a)*orbit,y:p.y+Math.sin(a)*orbit*.65},r*.16,.42);
  }
  ctx.restore();return true;
 }
 function drawIdle(ctx,input){const g=idleSample(input);return g?paintOrb(ctx,g,input.reduced):false}
 // Age is relative to the sprite clip (attack release at 940ms, not 1300ms).
 // All centers are authored per drawing; no drifting interpolation away from hands.
 function poseSample(input){
  const {mode='idle',age=0,time=age,pack,frame,factor,x,y,reduced=false,enabled=true}=input;
  if(mode==='idle')return idleSample({...input,age:time});
  const point=pack.orbSockets?.[frame];if(!enabled||!point)return null;
  const r=pack.frames[frame],s=pack.scale*factor*(pack.frameScale?.[frame]||1);
  let strength=1,opacity=1;
  if(mode==='attack'){
   if(age<940)strength=1+.15*smooth((age-350)/590);
   else if(age<1310)return null; // The same sphere is travelling / bursting at the target.
   else{strength=smooth((age-1310)/260);opacity=strength;}
  }else if(mode==='defeat'){opacity=1-smooth(age/600);strength=opacity;}
  else if(mode==='hurt')strength=1-.3*Math.sin(Math.PI*clamp(age/650));
  else if(mode==='activation')strength=1+.3*Math.sin(Math.PI*clamp(age/1420));
  if(strength<.001||opacity<.001)return null;
  const phase=reduced?0:time*Math.PI*2/3400;
  return{center:{x:x+(point[0]-r[0]-r[4])*s,y:y+(point[1]-r[1]-r[5])*s},radius:18*s*strength*(1+Math.sin(phase)*.08),phase,opacity,scale:s};
 }
 function drawPose(ctx,input){const g=poseSample(input);return g?paintOrb(ctx,g,input.reduced):false}
 const api={timing,socket,sample,draw,idleSample,drawIdle,poseSample,drawPose};if(typeof module!=='undefined')module.exports=api;else root.GuardianShadowFX=api;
})(typeof window!=='undefined'?window:globalThis);
