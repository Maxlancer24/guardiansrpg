const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {createServer,root}=require('./preview.cjs');
(async()=>{
 const out=path.join(root,'../qa/website-20261027');fs.mkdirSync(out,{recursive:true});
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.GUARDIANS_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const checks=[],errors=[],failed=[];
 try{
  const page=await browser.newPage({reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failed.push(r.url());});
  await page.route('**/gc.zgo.at/**',r=>r.abort());await page.route('**/*.goatcounter.com/**',r=>r.abort());
  for(const lang of ['en','es'])for(const width of [1440,390,320]){
   const prefix=lang==='es'?'/es/':'/';
   await page.setViewportSize({width,height:1000});await page.goto(base+prefix+'raids/');
   assert.equal(await page.locator('.page.is-on .raid-boss').count(),3);
   assert.equal(await page.locator('.page.is-on .raid-scene').count(),9);
   await page.locator('.page.is-on img').evaluateAll(imgs=>Promise.all(imgs.map(i=>{i.loading='eager';return i.decode();})));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`raids overflow ${lang} ${width}`);
   assert.ok((await page.locator('.page.is-on').innerText()).includes('0.75')||lang==='es');
   for(const id of ['centinel','vareth','jade']){
    await page.locator(`.raid-directory a[href="#raid-${id}"]`).click();
    assert.ok(page.url().endsWith('#raid-'+id));
    assert.ok(await page.locator('#raid-'+id).isVisible());
   }
   if(lang==='es'&&width!==320){await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:path.join(out,`raids-${width}.png`),fullPage:true});}
   checks.push(`${lang} raids ${width}: three bosses, nine scenes, decoded art, anchor navigation, no overflow`);
   await page.goto(base+prefix+'valestia/');
   await page.locator('.mapimg').evaluate(i=>i.decode());
   assert.equal(await page.locator('.region-dossier').count(),11);
   assert.equal(await page.locator('.nav a[href*="greywood/"]').count(),0);
   const ids=await page.locator('.region-dossier').evaluateAll(es=>es.map(e=>e.dataset.region));
   for(const id of ids){
    await page.locator(`[data-n="${id==='stormbay_docks'?'stormbay':id}"]`).click();
    assert.equal(await page.locator(`#region-${id}`).getAttribute('open'),'');
    assert.ok(page.url().endsWith('#region-'+id));
    assert.equal(await page.locator(`#region-${id}>.region-body>.tw`).first().locator('tbody tr').count(),7);
    const lineCount=await page.locator(`#region-${id}>.region-body>.region-pokemon li`).count();
    assert.ok(id==='merchant_crossroads'?lineCount===0:lineCount>0,`Pokemax catalog mismatch ${id}`);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`atlas overflow ${lang} ${width} ${id}`);
   }
   await page.goto(base+prefix+'valestia/#region-greywood');
   assert.equal(await page.locator('#region-greywood').getAttribute('open'),'');
   assert.ok((await page.locator('#dos').innerText()).includes('Pale Amber'));
   await page.reload();assert.equal(await page.locator('#region-greywood').getAttribute('open'),'');
   await page.locator('.mapimg').evaluate(i=>i.decode());
   if(lang==='es'&&width!==320){await page.screenshot({path:path.join(out,`atlas-${width}.png`),fullPage:true});}
   checks.push(`${lang} atlas ${width}: all 11 markers, seven hunt tiers, Pokemax, deep links and refresh`);
  }
  await page.goto(base+'/es/valestia/#region-greywood');await page.locator('.ed-language').click();
  assert.ok(page.url().endsWith('/valestia/#region-greywood')&&!page.url().includes('/es/'));
  assert.equal(await page.locator('#region-greywood').getAttribute('open'),'');
  assert.ok((await page.locator('#region-greywood').innerText()).includes('Travel connections'));
  await page.goBack();assert.ok((await page.locator('#region-greywood').innerText()).includes('Conexiones de viaje'));
  await page.locator('.region-index a[href="#region-ravencraft"]').click();assert.ok((await page.locator('#dos').innerText()).includes('Ravencraft'));
  await page.goBack();assert.ok((await page.locator('#dos').innerText()).includes('Greywood'));
  checks.push('Atlas language switch, sibling links and history preserve selection');
  for(const prefix of ['/','/es/']){await page.goto(base+prefix+'greywood/');await page.waitForURL('**/valestia/#region-greywood');assert.equal(await page.locator('#region-greywood').getAttribute('open'),'');}
  checks.push('Both legacy Greywood routes redirect to the atlas');
  const nojs=await browser.newPage({javaScriptEnabled:false});
  for(const prefix of ['/','/es/']){
   await nojs.goto(base+prefix+'raids/');assert.equal(await nojs.locator('.raid-boss').count(),3);assert.ok((await nojs.locator('main').innerText()).includes('Unbroken Oath'));
   await nojs.goto(base+prefix+'valestia/');assert.equal(await nojs.locator('.region-dossier').count(),11);
   await nojs.locator('#region-greywood>summary').click();assert.ok((await nojs.locator('#region-greywood').innerText()).includes('Pale Amber'));
  }
  checks.push('Both languages include full raid and regional content without JavaScript');
  assert.ok(!fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').includes('/greywood/'));
  assert.deepEqual(errors,[]);assert.deepEqual([...new Set(failed)],[]);
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,errors,failed},null,2));console.log(JSON.stringify({passed:checks.length,out}));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
