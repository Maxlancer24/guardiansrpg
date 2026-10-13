const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createServer,root}=require('./preview.cjs');
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const out=process.env.GUARDIANS_QA_OUTPUT||path.join(root,'../website-redesign-qa');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.GUARDIANS_BROWSER||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined),headless:true});
 const failures=[],errors=[],checks=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  await page.route('**/gc.zgo.at/**',r=>r.abort());await page.route('**/*.goatcounter.com/**',r=>r.abort());
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failures.push(r.url().slice(base.length));});
  for(const lang of ['en','es'])for(const width of [1440,768,390,320]){
   await page.setViewportSize({width,height:1000});await page.goto(base+(lang==='es'?'/es/':'/'));
   await page.locator('.ed-hero').waitFor();await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('.page.is-on h1').count(),1);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Home overflow '+lang+' '+width);
   const first=page.locator('.page.is-on .ed-faq details').first();await first.locator('summary').click();assert.equal(await first.getAttribute('open'),'');
   if(width===1440||width===390){await page.locator('.page.is-on img').evaluateAll(async imgs=>{await Promise.all(imgs.map(img=>{img.loading='eager';return img.decode().catch(()=>{});}));});await page.screenshot({path:path.join(out,`home-${lang}-${width}.png`),fullPage:true});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`hero-${lang}-${width}.png`)});}
   checks.push(`home ${lang} ${width}: layout, FAQ`);
  }
  await page.setViewportSize({width:390,height:844});await page.goto(base+'/es/');
  await page.locator('.ed-menu').click();assert.equal(await page.locator('.ed-menu').getAttribute('aria-expanded'),'true');
  await page.locator('#q').fill('maestr');await page.locator('#qres button').first().waitFor();
  await page.keyboard.press('Escape');assert.equal(await page.locator('.ed-menu').getAttribute('aria-expanded'),'false');
  await page.locator('.ed-menu').click();await page.locator('#nav a[data-p="mastery"]').click();assert.ok(page.url().endsWith('/es/mastery/'));
  assert.equal(await page.locator('.page.is-on h1').innerText(),'Personajes y maestrías');
  await page.locator('.ed-language').click();assert.ok(page.url().endsWith('/mastery/'));
  assert.equal(await page.locator('.page.is-on h1').innerText(),'Characters & mastery');
  await page.goBack();assert.equal(await page.locator('.page.is-on h1').innerText(),'Personajes y maestrías');
  checks.push('mobile menu, search, Escape, route, language switch, back');
  for(const lang of ['en','es'])for(const id of ['start','mastery','player-portal','raids','characters','gear','combat','valestia','changelog','story','privacy']){
   for(const width of [1440,390]){
    await page.setViewportSize({width,height:1000});await page.goto(base+(lang==='es'?'/es/':'/')+id+'/');
    await page.locator('.page.is-on h1').waitFor();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Guide overflow ${lang} ${id} ${width}`);
    if(lang==='es'&&['mastery','start'].includes(id))await page.screenshot({path:path.join(out,`${id}-${width}.png`),fullPage:true});
   }
   checks.push(`guide ${lang} ${id}: desktop/mobile`);
  }
  // All generated pages must have real destinations, bilingual metadata and no broken local assets.
  const paths=[];for(const lang of ['','es/']){
   const dir=path.join(root,lang);for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(entry.isDirectory()&&fs.existsSync(path.join(dir,entry.name,'index.html')))paths.push(path.join(dir,entry.name,'index.html'));
   }paths.push(path.join(dir,'index.html'));
  }
  const broken=new Set();let generated=0;
  for(const file of new Set(paths)){const html=fs.readFileSync(file,'utf8');if(!html.includes('/edition.js'))continue;generated++;
   assert.ok(html.includes('href="#main"'),file+' skip link');
   assert.ok(!/94 story|94 misiones|entirely inside Discord|se lee del bot en vivo/.test(html),file+' stale content');
   for(const [,raw] of html.matchAll(/(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g)){
    if(raw.startsWith('//'))continue;const dest=path.join(root,decodeURIComponent(raw));
    if(!fs.existsSync(dest))broken.add(raw);
   }
  }
  assert.deepEqual([...broken],[],'Broken static local links/assets');
  checks.push(`${generated} pre-rendered routes: local links and metadata`);
  await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/es/combat/');
  const str=page.locator('[data-v="str"]');const before=Number(await str.innerText());await page.locator('[data-dec="str"]').click();assert.equal(Number(await str.innerText()),before-1);checks.push('Existing combat calculator remains interactive');
  await page.locator('#themesw').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');await page.locator('#themesw').click();checks.push('Light/dark preference persists');
  const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
  await nojs.goto(base+'/es/');assert.equal(await nojs.locator('h1').count(),1);assert.ok((await nojs.locator('body').innerText()).includes('Tu aventura comienza en Valestia.'));
  await nojs.goto(base+'/es/mastery/');assert.ok((await nojs.locator('body').innerText()).includes('180.000 OIL'));checks.push('No JavaScript: home and mastery content');
  assert.deepEqual(errors,[],'Browser errors');assert.deepEqual([...new Set(failures)],[],'HTTP failures');
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,errors,failures,generated},null,2));console.log(JSON.stringify({passed:checks.length,generated,screenshots:out}));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
