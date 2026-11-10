const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createServer,root}=require('./preview.cjs');
(async()=>{
 const out=path.join(root,'../qa/tutorial-20261110');fs.mkdirSync(out,{recursive:true});
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const errors=[],missing=[],checks=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)missing.push(r.url());});
  await page.route('**/gc.zgo.at/**',r=>r.abort());await page.route('**/*.goatcounter.com/**',r=>r.abort());
  // These tests exercise freely chosen battles; the guided path has its own suite.
  const ready=async frame=>{await frame.waitForFunction(()=>window.tutorialSnapshot?.().loaded&&!tutorialSnapshot().busy);if(await frame.evaluate(()=>tutorialSnapshot().orientation.active))await frame.locator('#orientation-skip').click();};
  const turn=async(frame,action)=>{await frame.locator('[data-action="'+action+'"]').click();await frame.locator('#confirm').click();await ready(frame);};
  for(const lang of ['en','es'])for(const width of [1440,768,390,320]){
   await page.setViewportSize({width,height:1100});await page.goto(base+(lang==='es'?'/es/':'/')+'combat-guide/');
   assert.equal(await page.locator('.it-frame').count(),0,'lazy loaded');await page.locator('[data-start-tutorial]').click();
   const frame=await(await page.locator('.it-frame').elementHandle()).contentFrame();await ready(frame);
   assert.equal(await frame.locator('[data-action]').count(),3);assert.ok(await frame.locator('#confirm').isDisabled());
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.ok(await frame.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await frame.locator('[data-action=REST]').focus();await frame.locator('[data-action=REST]').press('Enter');await frame.locator('#confirm').press('Enter');await ready(frame);assert.equal(await frame.locator('#hero-hp').getAttribute('value'),'150');
   await turn(frame,'DEFEND');assert.equal(await frame.locator('#enemy-hp').getAttribute('value'),'160');
   await turn(frame,'ATTACK');assert.equal(await frame.locator('#enemy-hp').getAttribute('value'),'10');
   await turn(frame,'ATTACK');assert.ok(await frame.locator('#result').isVisible());assert.ok(await frame.evaluate(()=>tutorialSnapshot().complete));
   assert.equal(await frame.locator('.goals .complete').count(),3);assert.ok(await frame.locator('#confirm').isDisabled());
   if(width===390||width===1440)await page.locator('.it-tutorial').screenshot({path:path.join(out,'guide-'+lang+'-'+width+'.png')});
   await frame.locator('#next-lesson').click();await ready(frame);assert.equal(await frame.locator('#lesson').inputValue(),'potion');
   await frame.locator('#potion').click();assert.equal(await frame.locator('#potion').getAttribute('aria-pressed'),'true');await frame.locator('#potion').click();assert.equal(await frame.locator('#potion').getAttribute('aria-pressed'),'false');await frame.locator('#potion').click();
   await turn(frame,'DEFEND');assert.equal(await frame.locator('#hero-hp').getAttribute('value'),'95');assert.ok(await frame.locator('#potion').isDisabled());
   checks.push(lang+' '+width);
  }
  await page.goto(base+'/battle-tutorial/?lang=es');await ready(page);await page.selectOption('#lesson','alchemist');await ready(page);assert.ok(await page.locator('#dose').isDisabled());
  await turn(page,'REST');assert.ok(!await page.locator('#dose').isDisabled());await page.locator('#potion').click();await page.locator('#dose').click();assert.equal(await page.locator('#potion').getAttribute('aria-pressed'),'false');await turn(page,'DEFEND');assert.equal(await page.locator('#hero-hp').getAttribute('value'),'190');assert.ok(await page.locator('#dose').isDisabled());assert.ok(!await page.locator('#potion').isDisabled());
  await page.selectOption('#lesson','potion');await ready(page);await turn(page,'REST');assert.ok(await page.locator('#result').isVisible());assert.equal(await page.locator('#hero-hp').getAttribute('value'),'0');assert.ok((await page.locator('#result-title').innerText()).includes('Hollow'));await page.locator('#again').click();await ready(page);assert.equal(await page.locator('#hero-hp').getAttribute('value'),'45');
  // Real animation: distinct atlas poses, paused clock, queued action protected.
  await page.setViewportSize({width:1440,height:1100});await page.selectOption('#lesson','basics');await ready(page);await page.locator('#motion').check();await page.selectOption('#speed','1');
  await page.locator('[data-action=ATTACK]').click();await page.locator('#confirm').click();await page.waitForFunction(()=>tutorialSnapshot().busy&&tutorialSnapshot().scene.modes[0].name==='attack');
  await page.locator('#pause').click();const paused=await page.evaluate(()=>tutorialSnapshot());await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>tutorialSnapshot().scene.time),paused.scene.time);assert.ok(await page.locator('#confirm').isDisabled());assert.ok(await page.locator('#restart').isDisabled());await page.locator('#pause').click();
  await page.waitForFunction(()=>{const s=tutorialSnapshot();return s.scene.modes[0].name==='attack'&&s.scene.time-s.scene.modes[0].at>1100;});await page.locator('.stage').screenshot({path:path.join(out,'attack-motion.png')});await ready(page);
  await page.locator('#log-title').click();assert.ok((await page.locator('#log').innerText()).includes('Parry'));assert.equal(await page.locator('#hero-hp').getAttribute('value'),'60');
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1100});await page.locator('#restart').click();await ready(page);await page.screenshot({path:path.join(out,'battle-'+width+'.png'),fullPage:true});
  }
  // Embedded battle pauses when the guide is hidden and survives a route return.
  await page.goto(base+'/es/combat-guide/');await page.locator('[data-start-tutorial]').click();const frame=await(await page.locator('.it-frame').elementHandle()).contentFrame();await ready(frame);
  await page.evaluate(()=>{history.pushState({},'','/es/mastery/');dispatchEvent(new PopStateEvent('popstate'));});await frame.waitForFunction(()=>tutorialSnapshot().scene.suspended);
  await page.evaluate(()=>{history.pushState({},'','/es/combat-guide/#combat-visual');dispatchEvent(new PopStateEvent('popstate'));});await page.locator('.it-frame').scrollIntoViewIfNeeded();await frame.waitForFunction(()=>!tutorialSnapshot().scene.suspended);
  // A failed atlas load must expose a usable retry and never half-start a fight.
  const fail='**/assets/tutorial-20261110/guardian-attack.webp';await page.route(fail,r=>r.abort());await page.goto(base+'/battle-tutorial/?lang=en');await page.locator('#retry').waitFor();assert.ok(await page.locator('#battle').isHidden());await page.unroute(fail);await page.locator('#retry').click();await ready(page);assert.equal(await page.locator('#hero-hp').getAttribute('value'),'100');
  await page.selectOption('#lesson','practice');await ready(page);assert.equal(await page.locator('.goals span').count(),0);assert.equal(await page.locator('[data-suggested=true]').count(),0);
  // Guided arithmetic is unchanged when animation is disabled or sped up.
  await page.locator('#motion').uncheck();await page.selectOption('#speed','2');await turn(page,'REST');assert.equal(await page.locator('#hero-hp').getAttribute('value'),'150');
  assert.deepEqual(errors,[]);assert.deepEqual([...new Set(missing)],[]);console.log(JSON.stringify({passed:checks,extra:'all lessons, victory/defeat, auxiliary slot, pause, motion, lazy loading, mobile, route resume',out}));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exit(1);});
