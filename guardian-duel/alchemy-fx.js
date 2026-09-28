/* Cosmetic flask trajectory. Damage and statuses belong exclusively to the rules. */
(function(root){
 const release=1180,impact=1580;
 function sample(o){
  if(o.age<release||o.age>=impact)return null;
  const r=o.pack.frames[2],point=o.pack.releasePoint;
  if(!r||!point)return null;
  const s=o.pack.scale*o.factor,start={x:o.x+(point[0]-r[0]-r[4])*s,y:o.y+(point[1]-r[1]-r[5])*s};
  const u=(o.age-release)/(impact-release),end=o.end;
  return{start,u,x:start.x+(end.x-start.x)*u,y:start.y+(end.y-start.y)*u-Math.sin(Math.PI*u)*o.size*.28,angle:u*Math.PI*2};
 }
 function draw(ctx,o){
  const p=sample(o),hit=(o.age-impact)/400;
  if(!p&&!(o.enabled&&hit>=0&&hit<1))return false;
  ctx.save();
  if(p){
   ctx.translate(p.x,p.y);ctx.scale(o.size/230,o.size/230);ctx.rotate(o.reduced?0:p.angle);
   if(o.enabled&&!o.reduced){const glow=ctx.createRadialGradient(0,0,1,0,0,20);glow.addColorStop(0,'rgba(100,255,218,.35)');glow.addColorStop(1,'rgba(100,255,218,0)');ctx.fillStyle=glow;ctx.fillRect(-20,-20,40,40);}
   ctx.fillStyle='rgba(134,232,220,.7)';ctx.strokeStyle='#e4fff5';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,1,7,0,Math.PI*2);ctx.fill();ctx.stroke();
   ctx.fillStyle='#4de3c5';ctx.beginPath();ctx.arc(0,2,5,0,Math.PI);ctx.fill();
   ctx.fillStyle='#d2af73';ctx.fillRect(-2.5,-10,5,5);ctx.fillStyle='#fff';ctx.fillRect(-4,-2,1.5,4);
  }else{
   ctx.translate(o.end.x,o.end.y);ctx.scale(o.size/230,o.size/230);ctx.globalAlpha=(1-hit)**2;
   const g=ctx.createRadialGradient(0,0,0,0,0,30+hit*65);g.addColorStop(0,'rgba(219,255,227,.85)');g.addColorStop(.25,'rgba(90,244,191,.5)');g.addColorStop(1,'rgba(58,183,160,0)');ctx.fillStyle=g;ctx.fillRect(-100,-100,200,200);
   if(!o.reduced)for(let i=0;i<14;i++){const a=i*2.399,r=8+hit*(32+i%4*12);ctx.fillStyle=i%3?'#7defc9':'#fff2bd';ctx.beginPath();ctx.ellipse(Math.cos(a)*r,Math.sin(a)*r+hit*hit*20,2+i%3,4+i%2,a,0,Math.PI*2);ctx.fill();}
  }
  ctx.restore();return true;
 }
 const api={sample,draw,release,impact};if(typeof module!=='undefined')module.exports=api;else root.GuardianAlchemyFX=api;
})(typeof window!=='undefined'?window:globalThis);
