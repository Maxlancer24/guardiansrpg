/* Crossbow projectile is presentation only; the rules own the single damage event. */
(function(root){
 const release=1300,impact=1440;
 function sample(o){
  if(o.age<release||o.age>=impact)return null;
  const r=o.pack.frames[o.frame],point=o.pack.muzzle?.[o.frame];
  if(!r||!point)return null;
  const s=o.pack.scale*o.factor,start={x:o.x+(point[0]-r[0]-r[4])*s,y:o.y+(point[1]-r[1]-r[5])*s};
  const u=(o.age-release)/(impact-release),end=o.end;
  return{start,x:start.x+(end.x-start.x)*u,y:start.y+(end.y-start.y)*u,angle:Math.atan2(end.y-start.y,end.x-start.x),u};
 }
 function draw(ctx,o){const p=sample(o);if(!p)return false;
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.scale(o.size/230,o.size/230);
  if(o.enabled&&!o.reduced){const glow=ctx.createLinearGradient(-64,0,5,0);glow.addColorStop(0,'rgba(165,225,242,0)');glow.addColorStop(1,'rgba(194,244,255,.65)');ctx.strokeStyle=glow;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-64,0);ctx.lineTo(0,0);ctx.stroke();}
  ctx.strokeStyle='#e7c68e';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-24,0);ctx.lineTo(0,0);ctx.stroke();
  ctx.fillStyle='#edf7fa';ctx.beginPath();ctx.moveTo(5,0);ctx.lineTo(-3,-3.5);ctx.lineTo(-1,0);ctx.lineTo(-3,3.5);ctx.closePath();ctx.fill();
  ctx.fillStyle='#93bacc';ctx.beginPath();ctx.moveTo(-20,0);ctx.lineTo(-27,-4);ctx.lineTo(-23,0);ctx.lineTo(-27,4);ctx.closePath();ctx.fill();ctx.restore();return true;
 }
 const api={sample,draw,release,impact};if(typeof module!=='undefined')module.exports=api;else root.GuardianCrossbowFX=api;
})(typeof window!=='undefined'?window:globalThis);
