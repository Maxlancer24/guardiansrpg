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
   const draw=WebGLRenderingContext.prototype.drawArrays;
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
   await page.locator('.ed-hero[data-cloth=ready]').waitFor();
   // Temporarily hide only decorative particles so scenery equality is measurable.
   await page.addStyleTag({content:'.hero-atmosphere{visibility:hidden!important}'});
   await page.evaluate(()=>{window.captureCloth=true;window.capeFrame=null;});await page.waitForFunction(()=>window.capeFrame);
   const result=await page.evaluate(()=>{
    const f=window.capeFrame,img=document.querySelector('.ed-hero-art'),r=img.getBoundingClientRect();
    const scale=Math.max(r.width/img.naturalWidth,r.height/img.naturalHeight),pos=getComputedStyle(img).objectPosition.split(' ').map(v=>parseFloat(v)/100);
    const source=document.createElement('canvas');source.width=img.naturalWidth;source.height=img.naturalHeight;const ctx=source.getContext('2d');ctx.drawImage(img,0,0);
    const art=ctx.getImageData(0,0,source.width,source.height).data;
    let opaque=0,nonBlue=0,outsideCapeBounds=0;const leaks=[];
    for(let y=0;y<f.height;y++)for(let x=0;x<f.width;x++){
     const i=(y*f.width+x)*4;if(!f.pixels[i+3])continue;opaque++;
     const sx=Math.round(((x+.5)/f.width*r.width+(img.naturalWidth*scale-r.width)*pos[0])/scale);
     const sy=Math.round(((f.height-y-.5)/f.height*r.height+(img.naturalHeight*scale-r.height)*pos[1])/scale);
     if(sx<1103||sx>1263||sy<490||sy>632)outsideCapeBounds++;
     const j=(sy*source.width+sx)*4;
     if(art[j+2]<=art[j]+4||art[j+2]<=art[j+1]+2){nonBlue++;if(leaks.length<6)leaks.push({sx,sy,r:art[j],g:art[j+1],b:art[j+2]});}
    }
    window.firstCapeFrame=f;
    return {viewport:innerWidth,opaque,nonBlue,outsideCapeBounds,transparent:f.width*f.height-opaque,leaks};
   });
   assert.ok(result.opaque>500,'Cloth overlay must exist');assert.equal(result.outsideCapeBounds,0,'Overlay leaks beyond cape');assert.equal(result.nonBlue,0,'Overlay paints non-cloth scenery: '+JSON.stringify(result));
   await page.waitForTimeout(900);await page.evaluate(()=>{window.captureCloth=true;window.capeFrame=null;});await page.waitForFunction(()=>window.capeFrame);
   const diff=await page.evaluate(()=>{const a=window.firstCapeFrame.pixels,b=window.capeFrame.pixels;let changed=0,backgroundChanged=0;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]||a[i+3]!==b[i+3]){changed++;if(a[i+3]===0)backgroundChanged++;}return{changed,backgroundChanged};});
   assert.ok(diff.changed>100,'Cloth folds must animate');assert.equal(diff.backgroundChanged,0,'Transparent scenery pixels must remain identical');
   results.push({...result,...diff});await page.screenshot({path:path.join(out,`isolated-cape-${width}.png`)});
  }
  fs.writeFileSync(path.join(out,'cape-isolation.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
