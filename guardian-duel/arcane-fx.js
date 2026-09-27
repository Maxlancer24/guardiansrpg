/* Separate procedural presentation. Release 1300ms, impact 1440ms; no damage here. */
(function(root){
 const timing={approach:360,release:1300,impact:1440};
 function sample(input){
  const {age,frame,pack,factor,x,y,end}=input;
  if(age<timing.approach||age>=1540||!pack.castSockets)return null;
  const r=pack.frames[frame],s=pack.scale*factor;
  const point=v=>({x:x+(v[0]-r[0]-r[4])*s,y:y+(v[1]-r[1]-r[5])*s});
  const palm=point(pack.castSockets.palm[frame]),crystal=point(pack.castSockets.crystal[frame]);
  const u=Math.max(0,Math.min(1,(age-timing.release)/(timing.impact-timing.release)));
  return{palm,crystal,scale:s,charge:Math.min(1,(age-timing.approach)/(timing.release-timing.approach)),
   projectile:age>=timing.release&&age<timing.impact?{x:palm.x+(end.x-palm.x)*u,y:palm.y+(end.y-palm.y)*u,angle:Math.atan2(end.y-palm.y,end.x-palm.x)}:null,
   flash:age>=timing.release?Math.max(0,1-(age-timing.release)/240):0};
 }
 function glow(ctx,p,r,alpha){
  const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);
  g.addColorStop(0,'rgba(232,252,255,'+alpha+')');g.addColorStop(.22,'rgba(134,220,255,'+alpha*.8+')');g.addColorStop(1,'rgba(120,148,255,0)');
  ctx.fillStyle=g;ctx.fillRect(p.x-r,p.y-r,r*2,r*2);
 }
 function draw(ctx,input){
  const g=sample(input);if(!g)return false;
  const {age,reduced,enabled}=input;
  ctx.save();
  if(enabled){ctx.globalCompositeOperation='lighter';
   if(age<timing.release)glow(ctx,g.crystal,(10+g.charge*22)*g.scale,(reduced?.14:.3)*g.charge);
   if(g.flash)glow(ctx,g.palm,40*g.scale,g.flash*(reduced?.15:.5));
  }
  // The projectile remains legible with embellishments disabled.
  if(g.projectile){const p=g.projectile;
   ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);
   if(enabled&&!reduced){
    const tail=ctx.createLinearGradient(-70*g.scale,0,10*g.scale,0);
    tail.addColorStop(0,'rgba(110,145,255,0)');tail.addColorStop(.8,'rgba(116,213,255,.7)');tail.addColorStop(1,'rgba(232,250,255,.9)');
    ctx.fillStyle=tail;ctx.beginPath();ctx.moveTo(-70*g.scale,0);ctx.quadraticCurveTo(-20*g.scale,-11*g.scale,13*g.scale,0);ctx.quadraticCurveTo(-20*g.scale,11*g.scale,-70*g.scale,0);ctx.fill();
   }
   ctx.fillStyle='#e5fbff';ctx.beginPath();ctx.moveTo(12*g.scale,0);ctx.lineTo(0,-5*g.scale);ctx.lineTo(-13*g.scale,0);ctx.lineTo(0,5*g.scale);ctx.closePath();ctx.fill();
   ctx.restore();
  }
  ctx.restore();return true;
 }
 const api={timing,sample,draw};if(typeof module!=='undefined')module.exports=api;else root.GuardianArcaneFX=api;
})(typeof window!=='undefined'?window:globalThis);
