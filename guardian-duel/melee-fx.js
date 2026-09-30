/* Procedural weapon trails, not sprites. Pure presentation: never resolves hits.
 * Blade endpoints are measured in the existing source atlases (not screen space).
 */
(function(root){
 const profiles={
  forestbastion:{kind:'shield',color:'185,238,188',width:24,blade:{2:[[1440,227],[1516,227]],3:[[407,730],[491,730]]}},
  autumnwolf:{kind:'claw',color:'255,209,137',width:12,blade:{2:[[1444,126],[1518,129]],3:[[505,744],[553,785]]}},
  kaori:{kind:'punch',color:'255,221,151',width:18,blade:{2:[[545,515],[615,515]],3:[[1135,515],[1210,515]]}},
  lucien:{kind:'slash',color:'181,226,255',width:23,blade:{2:[[550,548],[789,555]],3:[[1135,638],[1246,733]]}},
  lancer:{kind:'thrust',color:'147,231,255',width:10,blade:{2:[[455,570],[620,565]],3:[[1080,576],[1240,576]]}},
  duelist:{kind:'thrust',color:'237,209,255',width:6,blade:{2:[[542,535],[720,530]],3:[[1125,539],[1237,537]]}},
  sentinel:{kind:'slash',color:'193,224,255',width:22,blade:{2:[[1403,298],[1527,418]],3:[[446,767],[600,875]]}},
  vanguard:{kind:'slash',color:'255,204,129',width:32,blade:{2:[[1361,329],[1519,465]],3:[[375,815],[556,955]]}},
  pugilist:{kind:'punch',color:'255,211,143',width:18,blade:{2:[[1435,129],[1501,129]],3:[[438,640],[507,640]]}},
  wanderer:{kind:'slash',color:'136,237,221',width:22,blade:{2:[[1425,305],[1522,410]],3:[[398,800],[544,903]]}},
  guardian:{kind:'slash',color:'144,204,255',width:24,blade:{2:[[1335,187],[1524,233]],3:[[409,801],[589,919]]}},
  custodian:{kind:'hammer',color:'255,202,121',width:38,blade:{2:[[1288,260],[1495,325]],3:[[364,801],[540,940]]}},
  jadewind:{kind:'slash',color:'166,242,219',width:25,blade:{2:[[411,587],[615,606]],3:[[1048,658],[1204,724]]}},
  brisa:{kind:'slash',color:'177,244,193',width:22,blade:{2:[[1368,130],[1498,38]],3:[[410,768],[550,915]],4:[[865,800],[994,935]]}}
 };
 const clamp=n=>Math.max(0,Math.min(1,n));
 const rgba=(color,a)=>'rgba('+color+','+clamp(a)+')';
 function sample({id,age,frame,pack,factor,x,y,reduced=false,enabled=true}){
  const baseProfile=profiles[id],lead=pack.effectLeadIn||0,p=baseProfile&&{...baseProfile,kind:pack.effectKind||baseProfile.kind,width:pack.effectWidth??baseProfile.width,blade:pack.blade||baseProfile.blade,sweep:pack.sweep||1,arcFlatten:pack.arcFlatten??1,arcSpan:pack.arcSpan??2.05},t=(age-(1235-lead))/(240+lead);
  if(!enabled||!p||t<0||t>=1||!p.blade[frame])return null;
  const r=pack.frames[frame],s=pack.scale*factor*(pack.frameScale?.[frame]||1);
  const point=([px,py])=>({x:x+(px-r[0]-r[4])*s,y:y+(py-r[1]-r[5])*s});
  const [base,tip]=p.blade[frame].map(point),angle=Math.atan2(tip.y-base.y,tip.x-base.x);
  return{...p,base,tip,angle,radius:Math.hypot(tip.x-base.x,tip.y-base.y),
   width:p.width*s,scale:s,t,alpha:(1-t)**1.6,reduced,
   center:{x:x+(pack.sweepCenter?.[0]||0)*s,y:y+(pack.sweepCenter?.[1]||0)*s},
   sweepRadius:(pack.sweepRadius||325)*s,sweepFlatten:pack.sweepFlatten??.32,
   sweepProgress:clamp((age-(1235-lead))/Math.max(1,lead))};
 }
 // A tapered half-ellipse across the foreground, never a complete ring.
 // The body pivots first; the crescent reaches the enemy at the shared impact.
 function circularRibbon(ctx,g,width,opacity){
  const end=Math.PI*(1-g.sweepProgress),span=2.8,start=end+span,r=g.sweepRadius;
  ctx.beginPath();
  for(let side=0;side<2;side++)for(let j=0;j<=40;j++){
   const u=side?1-j/40:j/40,a=start+(end-start)*u;
   const bulge=Math.sin(Math.PI*u)**.7*width,rr=r+(side?-bulge*.3:bulge);
   const x=g.center.x+Math.cos(a)*rr,y=g.center.y+Math.sin(a)*rr*g.sweepFlatten;
   if(!side&&!j)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.closePath();
  const grad=ctx.createLinearGradient(g.center.x-r,g.center.y,g.center.x+r,g.center.y);
  grad.addColorStop(0,rgba(g.color,0));grad.addColorStop(.35,rgba(g.color,opacity*.35));
  grad.addColorStop(.8,rgba('241,255,230',opacity));grad.addColorStop(1,rgba(g.color,opacity*.2));
  ctx.fillStyle=grad;ctx.fill();
 }
 function ribbon(ctx,g,width,opacity){
  const span=g.arcSpan*(1-g.t*.35)*(g.sweep||1),start=-span,r=g.radius;
  // Flatten the sweep plane for horizontal cuts, keeping the endpoint on the blade.
  const point=(a,rr)=>{const px=Math.cos(a)*rr,py=Math.sin(a)*rr*g.arcFlatten;
   return [g.base.x+Math.cos(g.angle)*px-Math.sin(g.angle)*py,g.base.y+Math.sin(g.angle)*px+Math.cos(g.angle)*py];};
  ctx.beginPath();
  const count=28;
  for(let i=0;i<=count;i++){const u=i/count,a=start+span*u;
   const bulge=Math.sin(Math.PI*u)**.8*width,rr=r+bulge;
   const [x,y]=point(a,rr);
   i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  for(let i=count;i>=0;i--){const u=i/count,a=start+span*u;
   const rr=r-Math.sin(Math.PI*u)**.8*width*.45;
   ctx.lineTo(...point(a,rr));
  }
  ctx.closePath();
  const grad=ctx.createLinearGradient(g.base.x,g.base.y-r,g.tip.x,g.tip.y);
  grad.addColorStop(0,rgba(g.color,0));grad.addColorStop(.5,rgba(g.color,opacity*.38));
  grad.addColorStop(.86,rgba(g.color,opacity));grad.addColorStop(1,rgba('255,252,236',opacity*.85));
  ctx.fillStyle=grad;ctx.fill();
 }
 function glint(ctx,x,y,r,color,alpha){
  const glow=ctx.createRadialGradient(x,y,0,x,y,r*2.5);
  glow.addColorStop(0,rgba(color,alpha*.65));glow.addColorStop(1,rgba(color,0));
  ctx.fillStyle=glow;ctx.fillRect(x-r*2.5,y-r*2.5,r*5,r*5);
  ctx.beginPath();ctx.moveTo(x-r,y);ctx.quadraticCurveTo(x-r*.15,y-r*.15,x,y-r*.65);
  ctx.quadraticCurveTo(x+r*.15,y-r*.15,x+r,y);ctx.quadraticCurveTo(x+r*.15,y+r*.15,x,y+r*.65);
  ctx.quadraticCurveTo(x-r*.15,y+r*.15,x-r,y);ctx.fillStyle=rgba('255,252,235',alpha);ctx.fill();
 }
 function draw(ctx,input){
  const g=sample(input);if(!g)return false;
  ctx.save();ctx.globalCompositeOperation='lighter';
  if(g.reduced){glint(ctx,g.tip.x,g.tip.y,7*g.scale,g.color,g.alpha*.4);ctx.restore();return true;}
  if(g.kind==='sweep'){
   circularRibbon(ctx,g,g.width*2.1,g.alpha*.12);
   circularRibbon(ctx,g,g.width,g.alpha*.85);
   circularRibbon(ctx,g,g.width*.2,g.alpha);
  }else if(g.kind==='shield'){
   // Short pressure crescent at the shield face, never a sword slash or full ring.
   ctx.save();ctx.translate(g.tip.x,g.tip.y);
   const r=(38+g.t*26)*g.scale;
   ctx.beginPath();ctx.moveTo(-r*.18,-r);
   ctx.bezierCurveTo(r*.9,-r*.5,r*.9,r*.5,-r*.18,r);
   ctx.bezierCurveTo(r*.32,r*.45,r*.32,-r*.45,-r*.18,-r);
   ctx.closePath();
   const pressure=ctx.createLinearGradient(-r,0,r,0);
   pressure.addColorStop(0,rgba(g.color,0));pressure.addColorStop(.6,rgba(g.color,g.alpha*.45));
   pressure.addColorStop(1,rgba('248,255,226',g.alpha*.8));ctx.fillStyle=pressure;ctx.fill();
   ctx.restore();
  }else if(g.kind==='claw'){
   // Three short tapered hand trails, attached to the striking wrist/fingers.
   // They are presentation only; one contact and one damage event remain.
   for(let i=-1;i<=1;i++){
    const dy=i*12*g.scale,trail={...g,base:{x:g.base.x,y:g.base.y+dy},tip:{x:g.tip.x,y:g.tip.y+dy},arcSpan:1.6};
    ribbon(ctx,trail,g.width*1.7,g.alpha*.10);
    ribbon(ctx,trail,g.width*.55,g.alpha*.70);
    ribbon(ctx,trail,g.width*.12,g.alpha*.95);
   }
  }else if(g.kind==='slash'||g.kind==='hammer'){
   ribbon(ctx,g,g.width*1.8,g.alpha*.12);
   ribbon(ctx,g,g.width,g.alpha*.63);
   ribbon(ctx,g,g.width*.18,g.alpha*.9);
  }else{
   // Tapered lance of light around the thrust axis, never a full-screen straight line.
   ctx.save();ctx.translate(g.tip.x,g.tip.y);ctx.rotate(g.angle);
   const length=Math.min((g.kind==='punch'?95:240)*g.scale,g.radius+80*g.scale)*(1-g.t*.22),w=g.width;
   const grad=ctx.createLinearGradient(-length,0,18*g.scale,0);
   grad.addColorStop(0,rgba(g.color,0));grad.addColorStop(.68,rgba(g.color,g.alpha*.5));
   grad.addColorStop(.95,rgba('255,253,236',g.alpha));grad.addColorStop(1,rgba(g.color,0));
   ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(-length,0);
   ctx.bezierCurveTo(-length*.4,-w*.35,-25*g.scale,-w,18*g.scale,0);
   ctx.bezierCurveTo(-25*g.scale,w,-length*.4,w*.35,-length,0);ctx.fill();ctx.restore();
  }
  glint(ctx,g.tip.x,g.tip.y,(g.kind==='hammer'?18:g.kind==='slash'?10:12)*g.scale,g.color,g.alpha*.85);
  // Deterministic tiny tapered flecks drift with the weapon, not confetti or rings.
  for(let i=0;i<5;i++){
   const a=g.angle+(i-2)*.23,d=(10+g.t*(45+i*9))*g.scale;
   const x=g.tip.x+Math.cos(a)*d,y=g.tip.y+Math.sin(a)*d;
   ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle=rgba(g.color,g.alpha*(.5-i*.055));
   const n=(5+i%2*3)*g.scale;ctx.beginPath();ctx.moveTo(-n,0);ctx.lineTo(0,-g.scale);
   ctx.lineTo(n,0);ctx.lineTo(0,g.scale);ctx.closePath();ctx.fill();ctx.restore();
  }
  ctx.restore();return true;
 }
 const api={profiles,sample,draw};
 if(typeof module!=='undefined')module.exports=api;else root.GuardianMeleeFX=api;
})(typeof window!=='undefined'?window:globalThis);
