/* Material-aware render textures. Original PNGs and alpha remain untouched. */
(function(root){
 'use strict';
 const clamp=x=>Math.max(0,Math.min(1,x));
 const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
 const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
 function validate(profile){
  if(!profile||!profile.materials||!profile.variants)throw Error('Invalid palette profile');
  for(const m of Object.values(profile.materials)){
   if(!m.hue||m.hue[0]>=m.hue[1]||!m.saturation||!m.value)throw Error('Invalid material selector');
  }
  for(const v of Object.values(profile.variants)){
   if(!v.es||!v.en)throw Error('Missing palette translation');
   for(const [key,colors] of Object.entries(v.materials)){
    if(!profile.materials[key]||colors.length!==3||colors.some(c=>!/^#[0-9a-f]{6}$/i.test(c)))throw Error('Invalid material ramp');
   }
  }
 }
 function recipe(profile,variant,pack,action){
  validate(profile);const v=profile.variants[variant];if(!v)throw Error('Unknown palette');
  return Object.entries(v.materials).map(([key,colors])=>({
   ...profile.materials[key],colors:colors.map(rgb),
   regions:pack.frames.map((f,i)=>{
    const m=profile.materials[key],r=m.regions?.[action]?.[i]||m.region||[0,0,1,1];
    return [f[0]+r[0]*f[2],f[1]+r[1]*f[3],f[0]+r[2]*f[2],f[1]+r[3]*f[3]];
   })
  }));
 }
 function transform(data,width,materials,start=0,end=data.length){
  for(let i=start;i<end;i+=4){
   if(!data[i+3])continue;
   const r=data[i]/255,g=data[i+1]/255,b=data[i+2]/255,max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
   if(d===0)continue;
   const sat=d/max;let hue=(max===r?(g-b)/d+(g<b?6:0):max===g?(b-r)/d+2:(r-g)/d+4)*60;
   const x=(i/4)%width,y=Math.floor(i/4/width);
   for(const m of materials){
    const h=hue<m.hue[0]&&m.hue[1]>360?hue+360:hue;
    if(h<=m.hue[0]||h>=m.hue[1]||sat<=m.saturation[0]||max<=m.value[0]||!m.regions.some(a=>x>=a[0]&&y>=a[1]&&x<a[2]&&y<a[3]))continue;
    const weight=smooth(m.hue[0],m.hue[0]+3,h)*(1-smooth(m.hue[1]-3,m.hue[1],h))*smooth(...m.saturation,sat)*smooth(...m.value,max);
    // Keep local light/dark detail; three stops make both dark cloth and pale cloth possible.
    const t=clamp((max-.06)/.72),lo=t<.5?0:1,k=t<.5?t*2:(t-.5)*2;
    for(let c=0;c<3;c++)data[i+c]=Math.round(data[i+c]*(1-weight)+(m.colors[lo][c]*(1-k)+m.colors[lo+1][c]*k)*weight);
    break;
   }
  }
  return data;
 }
 function createCache(profiles,{createCanvas=()=>document.createElement('canvas'),yieldTask=()=>new Promise(r=>setTimeout(r,0)),maxPixels=18000000}={}){
  const cache=new Map();let pixels=0,builds=0;
  const key=(id,variant,action)=>id+':'+variant+':'+action+':'+profiles[id]?.version;
  function get(id,variant,action,source){
   if(!variant||variant==='original')return source;
   const k=key(id,variant,action),entry=cache.get(k);
   if(!entry||entry.source!==source)return source;
   cache.delete(k);cache.set(k,entry);return entry.canvas;
  }
  async function prepare(id,variant,action,source,pack){
   if(!variant||variant==='original')return source;
   const existing=get(id,variant,action,source);if(existing!==source)return existing;
   const canvas=createCanvas();canvas.width=source.width;canvas.height=source.height;
   const count=canvas.width*canvas.height;if(count>maxPixels)throw Error('Palette texture exceeds budget');
   const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(source,0,0);
   const frame=context.getImageData(0,0,canvas.width,canvas.height),materials=recipe(profiles[id],variant,pack,action);
   const chunk=canvas.width*32*4;
   for(let i=0;i<frame.data.length;i+=chunk){transform(frame.data,canvas.width,materials,i,Math.min(frame.data.length,i+chunk));await yieldTask()}
   context.putImageData(frame,0,0);
   while(pixels+count>maxPixels&&cache.size){const [old,e]=cache.entries().next().value;pixels-=e.pixels;cache.delete(old);e.canvas.width=e.canvas.height=0}
   const k=key(id,variant,action),old=cache.get(k);if(old)pixels-=old.pixels;
   cache.set(k,{canvas,source,pixels:count});pixels+=count;builds++;return canvas;
  }
  return {get,prepare,stats:()=>({pixels,builds,entries:cache.size,maxPixels})};
 }
 const api={validate,recipe,transform,createCache};
 if(typeof module!=='undefined')module.exports=api;else root.GuardianPaletteEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
