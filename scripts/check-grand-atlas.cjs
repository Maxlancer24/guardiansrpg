const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createServer,root}=require('./preview.cjs');
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port,out=path.join(root,'../qa/grand-atlas-20261027');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.GUARDIANS_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const checks=[],errors=[],failed=[];
 try{
  const page=await browser.newPage({reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failed.push(r.url());});
  await page.route('**/gc.zgo.at/**',r=>r.abort());await page.route('**/*.goatcounter.com/**',r=>r.abort());
  for(const lang of ['en','es'])for(const width of [1440,390,320]){
   const prefix=lang==='es'?'/es/':'/';await page.setViewportSize({width,height:1000});await page.goto(base+prefix+'valestia/');
   const map=page.locator('.mapimg');await map.evaluate(i=>i.decode());
   assert.equal(await map.getAttribute('src'),`/assets/atlas/valestia-grand-atlas-${lang}-v1.webp`);
   assert.deepEqual(await map.evaluate(i=>[i.naturalWidth,i.naturalHeight]),[1697,927]);
   assert.equal(await page.locator('[data-n="willowcross"]').count(),1);
   assert.equal(await page.locator('[data-n="seal_1"]').count(),0);
   for(const [id,text] of [['greywood','Pale Amber'],['willowcross','Willowcross'],['harrowmere','Harrowmere'],['nyxhaven','Nyxhaven'],['sunken_fang_archipelago','Sunken Fang'],['hollowstar_crater','Hollowstar']]){
    await page.selectOption('#atlas-place',id);assert.ok((await page.locator('#dos').innerText()).includes(text));
    assert.equal(await page.locator(`[data-n="${id}"]`).getAttribute('aria-pressed'),'true');
   }
   await page.locator('[data-atlas-zoom="in"]').click();await page.locator('[data-atlas-zoom="in"]').click();
   assert.equal(await page.locator('#atlas-zoom-value').innerText(),'200%');
   assert.ok(await page.locator('#map').evaluate(e=>e.scrollWidth>e.clientWidth*1.9));
   await page.selectOption('#atlas-place','dark_knight_sanctum');
   assert.ok(await page.locator('#map').evaluate(e=>e.scrollLeft>0));
   await page.locator('#atlas-markers').click();assert.equal(await page.locator('[data-n="greywood"]').isVisible(),false);
   await page.locator('#atlas-markers').click();assert.equal(await page.locator('[data-n="greywood"]').isVisible(),true);
   await page.locator('[data-atlas-zoom="fit"]').click();assert.equal(await page.locator('#atlas-zoom-value').innerText(),'100%');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow ${lang} ${width}`);
   for(const dlLang of ['es','en']){
    const link=page.locator(`.atlas-downloads a[download="Valestia-Discord-${dlLang.toUpperCase()}.jpg"]`);
    const [download]=await Promise.all([page.waitForEvent('download'),link.click()]);
    assert.equal(download.suggestedFilename(),`Valestia-Discord-${dlLang.toUpperCase()}.jpg`);
    assert.equal(await download.failure(),null);
   }
   await page.selectOption('#atlas-place','greywood');await page.locator('#valestia-map').scrollIntoViewIfNeeded();
   if(width!==320){await page.locator('#valestia-map').screenshot({path:path.join(out,`atlas-${lang}-${width}.png`)});}
   checks.push(`${lang} ${width}: localized image, new places, zoom/pan, selection, marker toggle, JPEG downloads, layout`);
  }
  await page.goto(base+'/es/valestia/#region-greywood');await page.locator('.ed-language').click();
  assert.ok((await page.locator('.mapimg').getAttribute('src')).includes('-en-'));assert.equal(await page.locator('#atlas-place').inputValue(),'greywood');
  await page.goBack();assert.ok((await page.locator('.mapimg').getAttribute('src')).includes('-es-'));checks.push('Language and history switch artwork while preserving regional selection');
  const nojs=await browser.newPage({javaScriptEnabled:false});
  for(const lang of ['es','en']){await nojs.goto(base+(lang==='es'?'/es/':'/')+'valestia/');assert.ok((await nojs.locator('.mapimg').getAttribute('src')).includes('-'+lang+'-'));assert.equal(await nojs.locator('.atlas-downloads a[download]').count(),2);assert.equal(await nojs.locator('.atlas-toolbar').isVisible(),false);}
  checks.push('Localized static map and image downloads remain usable without JavaScript');
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,errors,failed},null,2));console.log(JSON.stringify({passed:checks.length,out}));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
