/* Staff beam presentation only. It reaches the target at the existing damage event. */
(function(root){
 const timing={approach:360,release:1300,impact:1440,end:1670};
 const clamp=n=>Math.max(0,Math.min(1,n));
 function sample({age,frame,pack,factor,x,y,end}){
  if(age<timing.approach||age>=timing.end||!pack.castSockets)return null;
  const r=pack.frames[frame],s=pack.scale*factor,v=pack.castSockets.crystal[frame];
  const crystal={x:x+(v[0]-r[0]-r[4])*s,y:y+(v[1]-r[1]-r[5])*s};
  const u=clamp((age-timing.release)/(timing.impact-timing.release));
  const fade=age<timing.impact?1:1-clamp((age-timing.impact)/(timing.end-timing.impact));
  return{crystal,scale:s,charge:clamp((age-timing.approach)/(timing.release-timing.approach)),
   beam:age>=timing.release?{start:crystal,end:{x:crystal.x+(end.x-crystal.x)*u,y:crystal.y+(end.y-crystal.y)*u},alpha:fade,length:u}:null,
   impact:age>=timing.impact?{...end,alpha:fade}:null};
 }
 function glow(ctx,p,r,alpha){
  const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);
  g.addColorStop(0,'rgba(232,252,255,'+alpha+')');g.addColorStop(.22,'rgba(134,220,255,'+alpha*.8+')');g.addColorStop(1,'rgba(120,148,255,0)');
  ctx.fillStyle=g;ctx.fillRect(p.x-r,p.y-r,r*2,r*2);
 }
 function ribbon(ctx,beam,width,color,alpha){
  const a=beam.start,b=beam.end,dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
  if(length<.01)return;
  const nx=-dy/length,ny=dx/length;
  ctx.beginPath();
  for(const sign of [1,-1])for(let j=0;j<=20;j++){
   const t=sign===1?j/20:1-j/20,w=(.2+.8*Math.sin(Math.PI*t)**.65)*width*sign;
   const px=a.x+dx*t+nx*w,py=a.y+dy*t+ny*w;
   sign===1&&j===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
  }
  ctx.closePath();
  const g=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
  g.addColorStop(0,'rgba('+color+','+alpha*.5+')');g.addColorStop(.18,'rgba('+color+','+alpha+')');g.addColorStop(1,'rgba('+color+','+alpha*.75+')');
  ctx.fillStyle=g;ctx.fill();
 }
 function draw(ctx,input){
  const g=sample(input);if(!g)return false;
  const {reduced,enabled}=input;ctx.save();
  if(enabled){ctx.globalCompositeOperation='lighter';
   glow(ctx,g.crystal,(12+g.charge*22)*g.scale,(reduced?.14:.38)*(g.beam?g.beam.alpha:g.charge));
  }
  if(g.beam){
   if(enabled&&!reduced){
    ribbon(ctx,g.beam,17*g.scale,'100,140,255',g.beam.alpha*.10);
    ribbon(ctx,g.beam,8*g.scale,'110,213,255',g.beam.alpha*.38);
   }
   // Clear core remains visible without embellishments or in reduced motion.
   ribbon(ctx,g.beam,(reduced?1.4:2.4)*g.scale,'229,251,255',g.beam.alpha*(reduced?.7:.95));
   if(enabled&&g.impact)glow(ctx,g.impact,(reduced?18:45)*g.scale,g.impact.alpha*(reduced?.12:.42));
  }
  ctx.restore();return true;
 }
 const api={timing,sample,draw};if(typeof module!=='undefined')module.exports=api;else root.GuardianArcaneFX=api;
})(typeof window!=='undefined'?window:globalThis);
