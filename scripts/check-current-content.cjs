const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createServer,root}=require('./preview.cjs');
(async()=>{
 const dataContext={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'current-data.js'),'utf8'),dataContext);
 const data=dataContext.window.GuardiansCurrentData;
 const out=path.join(root,'../qa/website-20261026');fs.mkdirSync(out,{recursive:true});
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.GUARDIANS_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const checks=[],errors=[],failed=[];
 try{
  const page=await browser.newPage({reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failed.push(r.url());});
  await page.route('**/gc.zgo.at/**',r=>r.abort());await page.route('**/*.goatcounter.com/**',r=>r.abort());
  for(const lang of ['en','es'])for(const width of [1440,390,320])for(const id of ['greywood','jadewind','primordial','species']){
   await page.setViewportSize({width,height:1000});await page.goto(base+(lang==='es'?'/es/':'/')+id+'/');
   const active=page.locator('.page.is-on');await active.locator('h1').waitFor();
   assert.equal(await active.locator('h1').count(),1);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow ${lang} ${id} ${width}`);
   const text=await active.innerText();assert.ok(!text.includes('undefined'));
   if(id==='greywood'){
    await active.locator('.update-details summary').click();assert.equal(await active.locator('.update-details tbody tr').count(),7);
    assert.ok(text.includes('Pale Amber')&&text.includes('Amberleaf')&&text.includes('Quartermaster'));
    await active.locator('.update-jumps a').filter({hasText:'Pokemax'}).click();assert.ok(page.url().endsWith('#greywood-pokemon'));
    await page.reload();assert.ok(await page.locator('#greywood-pokemon').isVisible());
   }
   if(lang==='es'&&width!==320){await page.evaluate(()=>document.fonts.ready);await active.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>{i.loading='eager';return i.decode();})));await page.screenshot({path:path.join(out,`${id}-${width}.png`),fullPage:true});}
   checks.push(`${lang} ${id} ${width}: layout, route, content`);
  }
  await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/es/valestia/');
  await page.locator('[data-n="greywood"]').click();const mapText=await page.locator('#dos').innerText();
  assert.ok(mapText.includes('Pale Amber')&&mapText.includes('Hollowbark')&&mapText.includes('Ravennor')&&mapText.includes('Starter Ruins'));
  assert.ok(!mapText.includes('Millhaven'));await page.locator('#dos a').click();assert.ok(page.url().endsWith('/es/greywood/'));checks.push('Greywood map marker uses actual travel edges and links to guide');
  await page.goto(base+'/es/lab/');
  assert.equal(await page.locator('#labSp option').count(),129);
  const greywood=Object.values(data.species).filter(s=>s.region==='greywood');
  for(const s of greywood){await page.selectOption('#labSp',s.id);assert.ok((await page.locator('#labId').innerText()).includes('Greywood'));}
  await page.selectOption('#labSp','oakenfort');await page.locator('#labPerfect').click();
  await page.locator('#labLv').fill('50');await page.locator('#labLv').dispatchEvent('input');
  const values=await page.locator('#labStats .sb__v').allTextContents();
  const stat=data.species.oakenfort.base;
  assert.deepEqual(values.map(Number),[stat.hp+50+10+15,stat.atk+5+15,stat.def+5+15,stat.spd+5+15]);
  assert.ok((await page.locator('#labMoves').innerText()).includes('Bark Renewal'));
  await page.locator('#labLv').fill('15');await page.locator('#labLv').dispatchEvent('input');assert.ok((await page.locator('#labId').innerText()).includes('Barkbud'));
  await page.locator('#labLv').fill('16');await page.locator('#labLv').dispatchEvent('input');assert.ok((await page.locator('#labId').innerText()).includes('Knothold'));
  checks.push('Lab: all 129 species, nine Greywood options, actual base stats and evolution thresholds');
  await page.goto(base+'/es/greywood/');await page.locator('.ed-language').click();assert.ok(page.url().endsWith('/greywood/'));
  assert.ok((await page.locator('.page.is-on').innerText()).includes('How to get there'));
  await page.goBack();assert.ok((await page.locator('.page.is-on').innerText()).includes('Cómo llegar'));checks.push('New route language switching and back');
  const nojs=await browser.newPage({javaScriptEnabled:false});
  for(const id of ['greywood','jadewind','primordial']){
   await nojs.goto(base+'/es/'+id+'/');assert.equal(await nojs.locator('h1').count(),1);
   assert.ok((await nojs.locator('main').innerText()).length>2500);
   assert.equal(await nojs.locator('link[rel="canonical"]').getAttribute('href'),'https://guardiansrpg.com/es/'+id+'/');
  }
  checks.push('New Spanish routes prerender content and canonical metadata without JavaScript');
  assert.deepEqual(errors,[]);assert.deepEqual([...new Set(failed)],[]);
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,errors,failed},null,2));console.log(JSON.stringify({passed:checks.length,out}));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
