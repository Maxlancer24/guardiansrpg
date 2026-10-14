const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createServer,root}=require('./preview.cjs');
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const out=path.join(root,'../guardian-hero-qa'),results=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
  await page.addInitScript(()=>{
   const names=new WeakMap(),get=WebGLRenderingContext.prototype.getUniformLocation,uniform=WebGLRenderingContext.prototype.uniform1f,draw=WebGLRenderingContext.prototype.drawArrays;
   WebGLRenderingContext.prototype.getUniformLocation=function(program,name){const loc=get.call(this,program,name);if(loc)names.set(loc,name);return loc;};
   WebGLRenderingContext.prototype.uniform1f=function(loc,value){uniform.call(this,loc,names.get(loc)==='u_time'&&window.heroTestTime!==undefined?window.heroTestTime:value);};
   WebGLRenderingContext.prototype.drawArrays=function(...args){
    draw.apply(this,args);
    if(window.captureCloth&&this.canvas.classList.contains('hero-cloth')){
     const pixels=new Uint8Array(this.drawingBufferWidth*this.drawingBufferHeight*4);
     this.readPixels(0,0,this.drawingBufferWidth,this.drawingBufferHeight,this.RGBA,this.UNSIGNED_BYTE,pixels);
     window.capeFrame={pixels,width:this.drawingBufferWidth,height:this.drawingBufferHeight};window.captureCloth=false;
    }
   };
  });
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:'+server.address().port+'/es/');
   await page.locator('.ed-hero[data-cloth=ready]').waitFor();await page.addStyleTag({content:'.hero-atmosphere{visibility:hidden!important}'});
   const phases=[];
   for(const phase of [0,.625,1.25,1.875,2.5,3.125,3.75,4.375]){
    await page.evaluate(t=>{window.heroTestTime=t;window.captureCloth=true;window.capeFrame=null;},phase);await page.waitForFunction(()=>window.capeFrame);
    const result=await page.evaluate(()=>{
     const f=window.capeFrame,img=document.querySelector('.ed-hero-art'),r=img.getBoundingClientRect();
     const scale=Math.max(r.width/img.naturalWidth,r.height/img.naturalHeight),pos=getComputedStyle(img).objectPosition.split(' ').map(v=>parseFloat(v)/100);
     let outsideEnvelope=0,tipCount=0,tipY=0,tipMinY=1000;
     for(let y=0;y<f.height;y++)for(let x=0;x<f.width;x++){
      const i=(y*f.width+x)*4;if(!f.pixels[i+3])continue;
      const sx=((x+.5)/f.width*r.width+(img.naturalWidth*scale-r.width)*pos[0])/scale;
      const sy=((f.height-y-.5)/f.height*r.height+(img.naturalHeight*scale-r.height)*pos[1])/scale;
      if(sx<1080||sx>1280||sy<465||sy>656)outsideEnvelope++;
      if(sx>1090&&sx<1135&&sy>530&&sy<650&&f.pixels[i+3]>220&&f.pixels[i+2]>f.pixels[i]+10&&f.pixels[i+2]>f.pixels[i+1]+5){tipCount++;tipY+=sy;tipMinY=Math.min(tipMinY,sy);}
     }
     return {phase:window.heroTestTime,outsideEnvelope,tipCount,tipY:tipY/Math.max(1,tipCount),tipMinY,scale};
    });
    assert.equal(result.outsideEnvelope,0,'Scenery outside the cape envelope must stay transparent');assert.ok(result.tipCount>5,'Visible free cape tip');phases.push(result);
    if([.625,3.125].includes(phase)){
     const clip=await page.locator('.ed-hero-art').evaluate(img=>{const r=img.getBoundingClientRect(),s=Math.max(r.width/1536,r.height/1024),pos=getComputedStyle(img).objectPosition.split(' ').map(v=>parseFloat(v)/100);return{x:r.x+1080*s-(1536*s-r.width)*pos[0],y:r.y+460*s-(1024*s-r.height)*pos[1],width:220*s,height:200*s};});
     await page.screenshot({clip,path:path.join(out,`cape-v3-${width}-${phase}.png`)});
    }
   }
   const travel=(Math.max(...phases.map(f=>f.tipMinY))-Math.min(...phases.map(f=>f.tipMinY)))*phases[0].scale;
   assert.ok(travel>6,`Visible cape silhouette travel required, got ${travel}px`);
   results.push({viewport:width,tipTravelCssPixels:travel,phases});
   await page.screenshot({path:path.join(out,`cape-v3-full-${width}.png`)});
  }
  fs.writeFileSync(path.join(out,'cape-isolation.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(r=>({viewport:r.viewport,tipTravelCssPixels:r.tipTravelCssPixels,outsideEnvelope:r.phases.reduce((n,p)=>n+p.outsideEnvelope,0)}))));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
