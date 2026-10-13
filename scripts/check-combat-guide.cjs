const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createServer,root}=require('./preview.cjs');
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const out=path.join(root,'../combat-guide-qa');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.GUARDIANS_BROWSER||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined),headless:true});
 const errors=[],checks=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/gc.zgo.at/**',r=>r.abort());await page.route('**/*.goatcounter.com/**',r=>r.abort());
  for(const lang of ['en','es'])for(const width of [1440,768,390,320]){
   const pre=lang==='es'?'/es/':'/';
   await page.setViewportSize({width,height:1000});await page.goto(base+pre+'combat-guide/');
   await page.locator('.page.is-on .cg-toc').waitFor();
   assert.equal(await page.locator('.page.is-on h1').count(),1);
   assert.equal(await page.locator('.page.is-on .cg-section').count(),13);
   assert.equal(await page.locator('#cg-potions').locator('..').locator('tbody tr').count(),18);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Overflow '+lang+' '+width);
   if(width===1440||width===390){
    await page.screenshot({path:path.join(out,`guide-${lang}-${width}.png`)});
    await page.locator('.page.is-on .cg-toc a[href="#cg-examples"]').click();
    assert.ok(await page.locator('#cg-examples').evaluate(e=>e.getBoundingClientRect().top<400),'TOC scroll');
    await page.screenshot({path:path.join(out,`examples-${lang}-${width}.png`)});
    await page.reload();
    assert.ok(await page.locator('#cg-examples').evaluate(e=>e.getBoundingClientRect().top<400),'Deep link reload');
   }
   checks.push(`guide ${lang} ${width}: layout, 13 sections, 18 potions`);
  }
  await page.goto(base+'/es/combat-guide/');
  const question=page.locator('.page.is-on .cg-faq details').first();await question.locator('summary').click();assert.equal(await question.getAttribute('open'),'');
  await page.locator('.ed-language').click();assert.ok(page.url().endsWith('/combat-guide/'));assert.equal(await page.locator('.page.is-on h1').innerText(),'Combat, step by step');
  await page.goBack();assert.equal(await page.locator('.page.is-on h1').innerText(),'El combate, paso a paso');checks.push('FAQ, language switch and back');
  await page.goto(base+'/es/combat/');
  assert.equal(await page.locator('[data-t="blk"]').innerText(),'60');
  assert.equal(await page.locator('[data-t="crit"]').innerText(),'9%');
  assert.equal(await page.locator('[data-t="dodge"]').innerText(),'4%');
  assert.equal(await page.locator('#nN').innerText(),'52–63');
  assert.equal(await page.locator('#nC').innerText(),'78–95');
  assert.equal(await page.locator('#nF').innerText(),'104–127');
  await page.locator('[data-dec="con"]').click();assert.equal(await page.locator('[data-t="blk"]').innerText(),'55');checks.push('Calculator: corrected Parry, distinct dodge, exact floor at end of damage calculation');
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(base+'/es/combat-guide/');await page.locator('#themesw').click();
  await page.screenshot({path:path.join(out,'guide-es-light.png')});
  const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
  await nojs.goto(base+'/es/combat-guide/#cg-potions');
  assert.equal(await nojs.locator('.cg-section').count(),13);assert.equal(await nojs.locator('#cg-potions').locator('..').locator('tbody tr').count(),18);
  assert.ok((await nojs.locator('main').innerText()).includes('600'));checks.push('No JavaScript: complete guide and native anchors');
  for(const pre of ['','es/'])for(const id of ['combat-guide','combat','consumables','tut-combat']){
   const file=path.join(root,pre,id,'index.html'),html=fs.readFileSync(file,'utf8');
   assert.ok(html.includes(`https://guardiansrpg.com/${pre}${id}/`));
   assert.ok(html.includes('/combat-guide.js?'));assert.ok(html.includes('/combat-guide.css?'));
   assert.ok(!html.includes('crit chance = dodge chance'));assert.ok(!html.includes('CON × 4'));
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({passed:checks.length,output:out}));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
