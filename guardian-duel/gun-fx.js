/* Single revolver shot: presentation only. The combat rules own damage. */
(function(root){
 'use strict';
 const release=1300,impact=1440,end=1750;
 function socket(pack,frame,factor,x,y){
  const r=pack.frames[frame],m=pack.muzzle?.[frame];if(!r||!m)return null;
  const s=pack.scale*factor*(pack.frameScale?.[frame]||1);
  return{x:x+(m[0]-r[0]-r[4])*s,y:y+(m[1]-r[1]-r[5])*s};
 }
 function sample(o){
  if(o.age<release||o.age>=end)return null;
  // Projectile origin stays at the firing pose: recoil cannot drag a flying bullet.
  const start=socket(o.pack,2,o.factor,o.x,o.y);if(!start)return null;
  const muzzle=socket(o.pack,o.frame,o.factor,o.x,o.y)||start;
  const u=Math.max(0,Math.min(1,(o.age-release)/(impact-release)));
  return{start,muzzle,u,projectile:o.age<impact,flash:Math.max(0,1-(o.age-release)/95),
   point:{x:start.x+(o.end.x-start.x)*u,y:start.y+(o.end.y-start.y)*u},
   angle:Math.atan2(o.end.y-start.y,o.end.x-start.x),fade:Math.max(0,1-(o.age-impact)/(end-impact))};
 }
 function draw(ctx,o){const g=sample(o);if(!g)return false;
  const s=(o.size||230)/230,enabled=o.enabled!==false;ctx.save();
  if(g.projectile){ctx.save();ctx.translate(g.point.x,g.point.y);ctx.rotate(g.angle);
   const trail=ctx.createLinearGradient(-45*s,0,4*s,0);trail.addColorStop(0,'rgba(255,173,76,0)');trail.addColorStop(1,'rgba(255,236,180,.95)');
   ctx.strokeStyle=trail;ctx.lineWidth=(o.reduced?1.3:2.4)*s;ctx.beginPath();ctx.moveTo(-45*s,0);ctx.lineTo(2*s,0);ctx.stroke();ctx.restore();
  }
  if(enabled&&g.flash>0){ctx.save();ctx.translate(g.muzzle.x,g.muzzle.y);ctx.rotate(g.angle);
   ctx.globalAlpha=g.flash*(o.reduced?.35:1);
   const halo=ctx.createRadialGradient(0,0,0,0,0,42*s);halo.addColorStop(0,'rgba(255,224,158,.65)');halo.addColorStop(1,'rgba(255,161,48,0)');
   ctx.fillStyle=halo;ctx.fillRect(-42*s,-42*s,84*s,84*s);
   ctx.fillStyle='#ffe8b1';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(11*s,-6*s);ctx.lineTo(8*s,-15*s);ctx.lineTo(22*s,-4*s);ctx.lineTo(43*s,0);ctx.lineTo(21*s,4*s);ctx.lineTo(9*s,13*s);ctx.lineTo(10*s,5*s);ctx.closePath();ctx.fill();ctx.restore();
  }
  if(enabled&&!o.reduced&&o.age>release+60){
   const t=(o.age-release-60)/(end-release-60);ctx.globalAlpha=(1-t)*.22;
   const x=g.muzzle.x+12*s,y=g.muzzle.y-22*t*s,r=(5+13*t)*s;
   const smoke=ctx.createRadialGradient(x,y,0,x,y,r);smoke.addColorStop(0,'#d9cec0');smoke.addColorStop(1,'rgba(217,206,192,0)');ctx.fillStyle=smoke;ctx.fillRect(x-r,y-r,2*r,2*r);
  }
  ctx.restore();return true;
 }
 const api={release,impact,end,socket,sample,draw};if(typeof module!=='undefined')module.exports=api;else root.GuardianGunFX=api;
})(typeof window!=='undefined'?window:globalThis);
