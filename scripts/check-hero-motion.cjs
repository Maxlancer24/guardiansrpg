const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createServer,root}=require('./preview.cjs');
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port,out=path.join(root,'../guardian-hero-qa');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.GUARDIANS_BROWSER||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined),headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const errors=[],checks=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/gc.zgo.at/**',r=>r.abort());await page.route('**/*.goatcounter.com/**',r=>r.abort());
  for(const lang of ['en','es'])for(const width of [1440,768,390,320]){
   await page.setViewportSize({width,height:1000});await page.goto(base+(lang==='es'?'/es/':'/'));
   await page.locator('.ed-hero[data-cloth="ready"]').waitFor();await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('.hero-cloth').count(),1);assert.equal(await page.locator('.hero-atmosphere').count(),1);
   assert.equal(await page.locator('.ed-hero').getAttribute('data-motion-running'),'true');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   assert.ok((await page.locator('.ed-hero-art').getAttribute('src')).includes('guardian-valestia-v2.webp'));
   if(lang==='es')await page.screenshot({path:path.join(out,`hero-es-${width}.png`)});
   checks.push(`Animated hero ${lang} ${width}: WebGL ready, one canvas, no overflow`);
  }
  await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/es/');await page.locator('.ed-hero[data-cloth="ready"]').waitFor();
  await page.waitForTimeout(1200);
  const first=await page.locator('.ed-hero').screenshot({path:path.join(out,'motion-a.png')});await page.waitForTimeout(800);
  const second=await page.locator('.ed-hero').screenshot({path:path.join(out,'motion-b.png')});assert.ok(!first.equals(second),'Animation must actually change rendered frames');
  // Compare the cloth region (source art x1090–1250, y490–640), not just ambient particles.
  const crop=await page.locator('.ed-hero-art').evaluate(img=>{const r=img.getBoundingClientRect(),scale=Math.max(r.width/1536,r.height/1024);return{x:Math.round(r.x+1090*scale-(1536*scale-r.width)*.5),y:Math.round(r.y+490*scale-(1024*scale-r.height)*.49),width:Math.round(160*scale),height:Math.round(150*scale)};});
  const clothA=await page.screenshot({clip:crop,path:path.join(out,'cloth-a.png')});await page.waitForTimeout(650);
  const clothB=await page.screenshot({clip:crop,path:path.join(out,'cloth-b.png')});assert.ok(!clothA.equals(clothB),'Cloth region must move');checks.push('Rendered scene and cape region change between frames');
  await page.locator('.hero-motion-toggle').click();assert.equal(await page.locator('.ed-hero').getAttribute('data-motion-running'),'false');
  await page.mouse.move(0,0);await page.waitForTimeout(300);
  const pausedA=await page.locator('.ed-hero').screenshot();await page.waitForTimeout(400);const pausedB=await page.locator('.ed-hero').screenshot();assert.ok(pausedA.equals(pausedB),'Paused scene must remain exactly still');
  await page.reload();assert.equal(await page.locator('.ed-hero').getAttribute('data-motion'),'paused');assert.equal(await page.locator('.hero-cloth').count(),0);
  await page.locator('.hero-motion-toggle').click();await page.locator('.ed-hero[data-cloth="ready"]').waitFor();checks.push('Pause freezes the full scene; preference persists; resume works');
  await page.locator('.ed-final').scrollIntoViewIfNeeded();await page.waitForTimeout(100);assert.equal(await page.locator('.ed-hero').getAttribute('data-motion-running'),'false');
  await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(100);assert.equal(await page.locator('.ed-hero').getAttribute('data-motion-running'),'true');checks.push('Offscreen animation suspends and resumes');
  await page.locator('.ed-language').click();await page.locator('.ed-hero[data-cloth="ready"]').waitFor();assert.equal(await page.locator('.hero-cloth').count(),1);assert.equal(await page.locator('.hero-atmosphere').count(),1);checks.push('Language re-render disposes the old animation');
  await page.locator('.ed-header nav a').filter({hasText:'Characters'}).click();assert.equal(await page.locator('#pg-home .ed-hero').getAttribute('data-motion-running'),'false');checks.push('Guide navigation suspends the home animation');
  await page.goto(base+'/es/');await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
  assert.equal(await page.locator('.ed-hero').getAttribute('data-motion'),'reduced');assert.equal(await page.locator('.hero-motion-toggle').isVisible(),false);assert.equal(await page.locator('.hero-cloth').isVisible(),false);checks.push('Live reduced-motion preference disables motion');
  const reduced=await browser.newPage({reducedMotion:'reduce'});await reduced.goto(base+'/es/');assert.equal(await reduced.locator('.hero-cloth').count(),0);checks.push('Reduced-motion initial visit never creates a GPU canvas');
  const fallback=await browser.newPage();await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?null:original.call(this,type,...args);};});await fallback.goto(base+'/es/');await fallback.locator('.ed-hero-art').evaluate(i=>i.decode());assert.equal(await fallback.locator('.hero-cloth').count(),0);assert.ok(await fallback.locator('.ed-hero-art').isVisible());checks.push('No WebGL: static Guardian remains visible with ambient decoration');
  const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:1000}});await nojs.goto(base+'/es/');assert.ok(await nojs.locator('.ed-hero-art').isVisible());assert.equal(await nojs.locator('.hero-motion-toggle').isVisible(),false);assert.equal(await nojs.locator('.hero-atmosphere').count(),0);checks.push('No JavaScript: complete static hero, no dead motion control');
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({passed:checks.length,out}));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
