const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createServer,root}=require('./preview.cjs');
(async()=>{
 const out=path.join(root,'../qa/website-20261110');fs.mkdirSync(out,{recursive:true});
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.GUARDIANS_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const errors=[],missing=[],checks=[];
 try{
  const page=await browser.newPage({reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)missing.push(r.url());});
  await page.route('**/gc.zgo.at/**',r=>r.abort());await page.route('**/*.goatcounter.com/**',r=>r.abort());
  const fit=async label=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+label);
  for(const lang of ['en','es'])for(const width of [1440,768,390,320]){
   const pre=lang==='es'?'/es/':'/';await page.setViewportSize({width,height:1000});
   await page.goto(base+pre);await page.locator('.nv-quick').waitFor();await fit('home '+width);
   assert.equal(await page.locator('.nv-quick a').count(),3);
   await page.locator('.nv-search').click();assert.equal(await page.locator('#q').evaluate(e=>e===document.activeElement),true);
   if(await page.locator('.rail.is-open').count())await page.locator('.ed-close-menu').click();
   await page.goto(base+pre+'combat-guide/');await page.locator('.page.is-on .nv-hero').waitFor();await fit('combat '+width);
   const bars=page.locator('#combat-visual [role=progressbar]');
   assert.equal(await bars.nth(0).getAttribute('aria-valuenow'),'100');
   for(const [hp,other,focus] of [[150,350,true],[150,250,false],[150,210,false]]){
    await page.locator('[data-lesson-next]').click();assert.equal(await bars.nth(0).getAttribute('aria-valuenow'),String(hp));assert.equal(await bars.nth(1).getAttribute('aria-valuenow'),String(other));assert.equal(await page.locator('.nv-status .is-charged').count(),focus?1:0);
   }
   assert.ok(await page.locator('[data-lesson-next]').isDisabled());
   await page.locator('[data-lesson-prev]').click();assert.equal(await bars.nth(1).getAttribute('aria-valuenow'),'250');
   await page.locator('[data-lesson-step="0"]').focus();await page.keyboard.press('Enter');assert.equal(await bars.nth(0).getAttribute('aria-valuenow'),'100');
   await page.selectOption('[data-lesson-select]','support');await page.locator('[data-lesson-next]').click();await page.locator('[data-lesson-next]').click();
   assert.equal(await bars.nth(1).getAttribute('aria-valuenow'),'120');assert.equal(await page.locator('.nv-status .is-charged').count(),1);
   await page.goto(base+pre+'mastery/');assert.equal(await page.locator('.nv-roster img').count(),12);
   for(const card of await page.locator('.fg-mastery').all()){
    await card.evaluate(e=>e.open=true);assert.equal(await card.locator('.fg-stage').count(),6);assert.equal(await card.locator('.nv-branch').count(),4);await card.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>{i.loading='eager';return i.decode();})));await fit('mastery expanded '+width);await card.evaluate(e=>e.open=false);
   }
   await page.goto(base+pre+'valestia/');await page.locator('[data-atlas-expand]').waitFor();
   assert.ok(!await page.locator('[data-atlas-close]').isVisible());await page.locator('[data-atlas-expand]').click();
   assert.ok(await page.locator('#valestia-map').evaluate(e=>e.getAttribute('aria-modal')==='true'));
   assert.ok(await page.locator('.ed-header').evaluate(e=>e.inert));await fit('map fullscreen '+width);
   await page.locator('[data-atlas-zoom=in]').click();assert.equal(await page.locator('#atlas-zoom-value').textContent(),'150%');
   await page.locator('[data-atlas-zoom=fit]').click();
   await page.selectOption('#atlas-place','greywood');await page.locator('#dos img').evaluate(i=>i.decode());
   assert.equal(await page.locator('#dos').evaluate(e=>getComputedStyle(e).display),'block');
   assert.ok(await page.locator('#dos img').evaluate(e=>{const r=e.getBoundingClientRect();return r.width/r.height>1.5;}),'region image aspect');
   assert.ok((await page.locator('#dos img').getAttribute('src')).includes('greywood'));
   if(width<=700){assert.ok(await page.locator('#valestia-map').evaluate(e=>e.classList.contains('nv-sheet-open')));await page.locator('[data-close-dossier]').click();}
   await page.keyboard.press('Escape');assert.equal(await page.locator('.nv-expanded').count(),0);assert.ok(!await page.locator('.ed-header').evaluate(e=>e.inert));assert.ok(await page.locator('[data-atlas-expand]').evaluate(e=>e===document.activeElement));
   await page.locator('[data-atlas-expand]').click();await page.selectOption('#atlas-place','harrowmere');await page.locator('#dos a').click();
   assert.ok(page.url().endsWith('/expeditions/#harrowmere'));assert.ok(!await page.locator('body').evaluate(e=>e.classList.contains('nv-map-open')));await fit('expedition '+width);
   checks.push(lang+' '+width);
  }
  // Check all rendered section headers and all new images, including seldom visited guides.
  await page.goto(base+'/es/');
  await page.locator('.nv-hero-art').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});
   for(const id of ['','combat-guide/','mastery/','valestia/','expeditions/']){
    await page.goto(base+'/es/'+id);await page.evaluate(()=>document.fonts.ready);
    if(id==='mastery/')await page.locator('[data-open-mastery=alchemist]').click();
    if(id==='valestia/'){await page.locator('[data-atlas-expand]').click();await page.selectOption('#atlas-place','greywood');}
    if(id==='combat-guide/')await page.locator('[data-lesson-next]').click();
    await page.locator('.page.is-on img').evaluateAll(imgs=>Promise.all(imgs.map(i=>{i.loading='eager';return i.decode().catch(()=>{});})));await page.screenshot({path:path.join(out,(id.replace('/','')||'home')+'-'+width+'.png'),fullPage:!['mastery/','valestia/'].includes(id)});
    if(id==='combat-guide/'){
     await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,'combat-header-'+width+'.png')});
     await page.locator('.nv-lesson').screenshot({path:path.join(out,'combat-lesson-'+width+'.png')});
    }
   }
   await page.goto(base+'/es/mastery/');await page.evaluate(()=>document.documentElement.dataset.theme='light');await page.locator('[data-open-mastery=jadewind]').click();await fit('light');await page.screenshot({path:path.join(out,'light-'+width+'.png')});
  }
  const staticPage=await browser.newPage({javaScriptEnabled:false});await staticPage.goto(base+'/es/mastery/');assert.equal(await staticPage.locator('.nv-roster a').count(),12);assert.equal(await staticPage.locator('.nv-hero').count(),1);await staticPage.close();
  assert.deepEqual(errors,[]);assert.deepEqual([...new Set(missing)],[]);
  fs.writeFileSync(path.join(out,'visual-checks.json'),JSON.stringify({checks,errors,missing},null,2));console.log(JSON.stringify({passed:checks.length,checks:'home/search, tutorial numbers, 12 mastery branches, map dialog/zoom/region/escape/focus/navigation, imagery, static HTML, light theme',out}));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exit(1);});
