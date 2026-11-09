const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createServer,root}=require('./preview.cjs');
(async()=>{
 const out=path.join(root,'../qa/website-20261109');fs.mkdirSync(out,{recursive:true});
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'current-data.js'),'utf8'),ctx);
 const D=ctx.window.GuardiansCurrentData;
 assert.equal(Object.keys(D.species).length,141);assert.equal(D.families.length,47);
 assert.equal(D.badges.length,37);assert.equal(Object.keys(D.masteryTrees).length,12);
 for(const tree of Object.values(D.masteryTrees))assert.equal(tree.length,6);
 for(const b of D.badges)assert.ok(D.badgeCriteria[b.metric_key],b.metric_key);
 for(const s of Object.values(D.species))for(const [,move] of s.learnset)assert.ok(D.moves[move],move);
 for(const id of ['hollowgourd','gallowsrook','pyrehound','wickerhart'])assert.ok(D.primordial[id]);
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.GUARDIANS_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const errors=[],failed=[],checks=[];
 try{
  const page=await browser.newPage({reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failed.push(r.url());});
  await page.route('**/gc.zgo.at/**',r=>r.abort());await page.route('**/*.goatcounter.com/**',r=>r.abort());
  for(const lang of ['en','es'])for(const width of [1440,390,320]){
   const prefix=lang==='es'?'/es/':'/';await page.setViewportSize({width,height:1000});
   for(const id of ['combat-guide','consumables','mastery','species','expeditions','raids','badges','player-portal','gear','economy']){
    await page.goto(base+prefix+id+'/');const active=page.locator('.page.is-on');await active.locator('h1').waitFor();
    assert.equal(await active.locator('h1').count(),1);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow: ${lang} ${id} ${width}`);
    const text=await active.innerText();assert.ok(!/undefined|NaN|\[object Object\]/.test(text),`bad content ${id}`);
    assert.ok(!text.includes('129 ordinary')&&!text.includes('129 especies'),`stale count ${id}`);
    if(id==='economy')assert.ok(!/Achievements for hitting|Logros por alcanzar/.test(text));
    if(id==='badges')assert.equal(await active.locator('.fg-badge').count(),37);
    if(id==='mastery'){
     assert.equal(await active.locator('.fg-mastery').count(),12);
     await active.locator('[data-open-mastery="alchemist"]').click();
     assert.ok(await active.locator('#mastery-alchemist').getAttribute('open')!==null);
     assert.equal(await active.locator('#mastery-alchemist .fg-stage').count(),6);
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'expanded mastery overflow');
    }
    if(id==='species'){
     await active.locator('[data-species-region]').selectOption('harrowmere');
     assert.equal(await active.locator('.fg-species-card:visible').count(),4);
     await active.locator('[data-species-availability]').selectOption('procession');
     assert.equal(await active.locator('.fg-species-card:visible').count(),2);
     await active.locator('[data-species-query]').fill('cinderpup');
     assert.equal(await active.locator('.fg-species-card:visible').count(),1);
     assert.ok((await active.locator('.fg-species-card:visible').innerText()).includes('Pyrehound'));
     await active.locator('[data-species-query]').fill('does-not-exist');
     assert.equal(await active.locator('.fg-species-card:visible').count(),0);
    }
    await active.locator('img[src*="updates-20261109"]').evaluateAll(imgs=>Promise.all(imgs.map(i=>{i.loading='eager';return i.decode();})));
    checks.push(`${lang} ${id} ${width}`);
   }
   await page.goto(base+prefix+'valestia/');await page.selectOption('#atlas-place','harrowmere');
   await page.locator('#dos a').click();assert.ok(page.url().endsWith(prefix+'expeditions/#harrowmere'));
   await page.locator('.page.is-on #harrowmere').waitFor();
   assert.ok((await page.locator('.page.is-on #harrowmere').boundingBox()).y<1001);
   await page.goto(base+prefix+'lab/');assert.equal(await page.locator('#labSp option').count(),141);
   for(const sp of Object.values(D.species).filter(s=>s.region==='harrowmere')){
    await page.selectOption('#labSp',sp.id);assert.ok((await page.locator('#labId').innerText()).includes('Harrowmere'));
   }
   await page.selectOption('#labSp','pyrehound');await page.locator('#labPerfect').click();await page.locator('#labLv').fill('50');await page.locator('#labLv').dispatchEvent('input');
   const stat=D.species.pyrehound.base;
   assert.deepEqual((await page.locator('#labStats .sb__v').allTextContents()).map(Number),[stat.hp+75,stat.atk+20,stat.def+20,stat.spd+20]);
   assert.ok((await page.locator('#labMoves').innerText()).includes('Pyre Fang'));
  }
  // Capture representative sections, including the full expanded rules on mobile.
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});
   for(const [id,anchor] of [['mastery','mastery-alchemist'],['expeditions','harrowmere'],['raids','raid-severin'],['species',''],['badges',''],['combat-guide','combat-worked-turns']]){
    await page.goto(base+'/es/'+id+'/'+(anchor?'#'+anchor:''));await page.evaluate(()=>document.fonts.ready);
    if(anchor){const el=page.locator('#'+anchor);if(id==='mastery')await el.evaluate(e=>e.open=true);await el.scrollIntoViewIfNeeded();}
    await page.locator('.page.is-on img').evaluateAll(imgs=>Promise.all(imgs.map(i=>{i.loading='eager';return i.decode();})));
    await page.screenshot({path:path.join(out,`${id}-${width}.png`)});
   }
  }
  const nojs=await browser.newPage({javaScriptEnabled:false});
  for(const prefix of ['/','/es/'])for(const id of ['mastery','species','badges','expeditions','raids','player-portal']){
   await nojs.goto(base+prefix+id+'/');assert.equal(await nojs.locator('h1').count(),1);
   assert.ok((await nojs.locator('main').innerText()).length>1200);
   assert.equal(await nojs.locator('link[rel="canonical"]').getAttribute('href'),'https://guardiansrpg.com'+prefix+id+'/');
  }
  assert.deepEqual(errors,[]);assert.deepEqual([...new Set(failed)],[]);
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,errors,failed},null,2));
  console.log(JSON.stringify({passed:checks.length,extra:'catalog filters, mastery expansion, map links, 141 lab species, numerical formulas, artwork, static HTML',out}));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
