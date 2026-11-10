const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createServer,root}=require('./preview.cjs');
(async()=>{
 const out=path.join(root,'../qa/orientation-20261110');fs.mkdirSync(out,{recursive:true});
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const errors=[],missing=[],checks=[];
 try{
  const page=await browser.newPage({reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)missing.push(r.url());});await page.route('**/gc.zgo.at/**',r=>r.abort());await page.route('**/*.goatcounter.com/**',r=>r.abort());
  const ready=f=>f.waitForFunction(()=>window.tutorialSnapshot?.().loaded&&!tutorialSnapshot().busy);
  const snapshot=f=>f.evaluate(()=>tutorialSnapshot());
  const next=f=>f.locator('#orientation-next').click();
  for(const lang of ['en','es'])for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:900});await page.goto(base+(lang==='es'?'/es/':'/')+'combat-guide/');await page.locator('[data-start-tutorial]').click();const frame=await(await page.locator('.it-frame').elementHandle()).contentFrame();await ready(frame);
   let s=await snapshot(frame);assert.equal(s.orientation.step,'health');assert.ok(s.orientation.active);assert.equal(s.display.actors[0].hp,100);assert.ok(await frame.locator('#hero-panel').evaluate(e=>e.classList.contains('orientation-target')));assert.equal(await frame.locator('#str-value').textContent(),'10');assert.equal(await frame.locator('#con-value').textContent(),'10');assert.equal(await frame.locator('#agi-value').textContent(),'0');
   assert.ok(await frame.locator('#confirm').isDisabled());assert.ok(await frame.locator('[data-action=REST]').isDisabled());assert.ok(await frame.locator('#coach').isHidden());
   const original=s.state;
   // Even synthetic events cannot bypass the guided introduction or commit HP.
   await frame.locator('[data-action=REST]').dispatchEvent('click');await frame.locator('#confirm').dispatchEvent('click');assert.deepEqual((await snapshot(frame)).state,original);
   const expected=['health','enemy','str','con','agi','round','attack','parry','rest','focus','intent','confirm'];
   for(const id of expected){
    assert.equal((await snapshot(frame)).orientation.step,id);assert.equal(await frame.locator('.orientation-target').count(),1);
    assert.ok(await frame.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    // Target and explanatory panel share the same screen at phone sizes.
    if(width<=390){const distance=await frame.evaluate(()=>{const a=document.querySelector('.orientation-target').getBoundingClientRect(),b=document.getElementById('orientation-card').getBoundingClientRect();return Math.max(a.bottom,b.bottom)-Math.min(a.top,b.top);});assert.ok(distance<860,`${lang} ${width} ${id} target/card span ${distance}`);}
    if(['str','attack','health'].includes(id)&&lang==='es'&&width!==320){await page.screenshot({path:path.join(out,id+'-'+width+'.png')});}
    if(id==='str'){await frame.locator('#orientation-back').click();assert.equal((await snapshot(frame)).orientation.step,'enemy');await next(frame);}
    if(['attack','parry','rest'].includes(id)){
     const action={attack:'ATTACK',parry:'DEFEND',rest:'REST'}[id];assert.ok(await frame.locator('#orientation-next').isDisabled());assert.ok(await frame.locator('#confirm').isDisabled());
     await frame.locator('[data-action='+action+']').press('Enter');assert.equal((await snapshot(frame)).choice,action);assert.ok(!await frame.locator('#orientation-next').isDisabled());assert.deepEqual((await snapshot(frame)).state,original);
    }
    if(id!=='confirm')await next(frame);
   }
   assert.equal((await snapshot(frame)).choice,'REST');assert.ok(!await frame.locator('#confirm').isDisabled());await frame.locator('#confirm').click();await ready(frame);s=await snapshot(frame);assert.equal(s.display.actors[0].hp,150);assert.equal(s.display.actors[0].focus,true);assert.equal(s.orientation.step,'rest-result');
   await next(frame);assert.equal((await snapshot(frame)).orientation.step,'parry');await frame.locator('[data-action=DEFEND]').click();await next(frame);await frame.locator('#confirm').click();await ready(frame);s=await snapshot(frame);assert.equal(s.display.actors[1].hp,160);assert.equal(s.display.actors[0].hp,150);assert.equal(s.orientation.step,'parry-result');
   await next(frame);await frame.locator('[data-action=ATTACK]').click();await next(frame);await frame.locator('#confirm').click();await ready(frame);s=await snapshot(frame);assert.equal(s.display.actors[1].hp,10);assert.equal(s.orientation.step,'attack-result');assert.equal(s.display.actors[0].focus,false);
   await next(frame);assert.ok(!(await snapshot(frame)).orientation.active);await frame.locator('[data-action=ATTACK]').click();await frame.locator('#confirm').click();await ready(frame);assert.ok((await snapshot(frame)).complete);
   await frame.locator('#restart').click();await ready(frame);assert.equal((await snapshot(frame)).orientation.step,'health');await frame.locator('#orientation-skip').click();assert.ok(!(await snapshot(frame)).orientation.session);assert.ok(!await frame.locator('[data-action=ATTACK]').isDisabled());
   // A read-only revisit preserves pending choices and all battle state.
   await frame.locator('[data-action=ATTACK]').click();const beforeReview=(await snapshot(frame)).state;await frame.locator('#explain').click();assert.ok((await snapshot(frame)).orientation.active);await frame.locator('#orientation-skip').click();assert.deepEqual((await snapshot(frame)).state,beforeReview);assert.equal((await snapshot(frame)).choice,'ATTACK');
   await frame.selectOption('#lesson','potion');await ready(frame);assert.ok(!(await snapshot(frame)).orientation.active);assert.equal(await frame.locator('.orientation-target').count(),0);assert.equal((await snapshot(frame)).display.actors[0].hp,45);
   checks.push(lang+' '+width);
  }
  assert.deepEqual(errors,[]);assert.deepEqual([...new Set(missing)],[]);console.log(JSON.stringify({checks,coverage:'12-step introduction, real targets, stats, keyboard, no pre-confirm mutation, guided Rest/Parry/Attack results, victory, skip, restart, revisit, lesson cleanup',out}));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exit(1);});
