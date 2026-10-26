/* Render the same bilingual source used by the browser into GitHub Pages HTML. */
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const {createServer,root}=require('./preview.cjs');
const escape=s=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.GUARDIANS_BROWSER||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined),headless:true});
 const pages=[];
 try{
  const page=await browser.newPage({reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/gc.zgo.at/**',r=>r.abort());
  await page.route('**/*.goatcounter.com/**',r=>r.abort());
  for(const lang of ['en','es']){
   const prefix=lang==='es'?'/es/':'/';
   await page.goto(base+prefix);
   await page.waitForSelector('.ed-header');
   const ids=await page.locator('main>.page').evaluateAll(es=>es.map(e=>e.id.slice(3)));
   if(errors.length || ids.length<49 || !ids.includes('combat-guide')) throw new Error('App did not render all routes: '+JSON.stringify({errors,ids}));
   for(const id of ids){
    const route=prefix+(id==='home'?'':id+'/');
    await page.evaluate(route=>{history.pushState({},'',route);dispatchEvent(new PopStateEvent('popstate'));},route);
    const data=await page.evaluate(()=>({
     title:document.title,description:document.querySelector('meta[name="description"]').content,
     header:document.querySelector('.ed-header').outerHTML,
     rail:document.querySelector('.rail').outerHTML,
     main:(()=>{const el=document.querySelector('.page.is-on').cloneNode(true);el.querySelectorAll('.hero-cloth,.hero-atmosphere').forEach(n=>n.remove());const hero=el.querySelector('.ed-hero');if(hero){delete hero.dataset.motion;delete hero.dataset.motionRunning;delete hero.dataset.cloth;}const toggle=el.querySelector('.hero-motion-toggle');if(toggle){toggle.hidden=true;toggle.textContent='';toggle.removeAttribute('aria-label');}return el.outerHTML;})(),
     faq:[...document.querySelectorAll('.page.is-on .ed-faq details')].map(d=>({q:d.querySelector('summary').textContent,a:d.querySelector('p').textContent})),
    }));
    const template=fs.readFileSync(path.join(root,lang==='es'?'es/index.html':'index.html'),'utf8');
    let head=template.slice(0,template.indexOf('</head>')+7);
    head=head.replace(/<title>[\s\S]*?<\/title>/,`<title>${escape(data.title)}</title>`);
    head=head.replace(/(<meta (?:name="(?:description|twitter:description)"|property="og:description") content=")[^"]*"/g,`$1${escape(data.description)}"`);
    head=head.replace(/(<meta (?:name="twitter:title"|property="og:title") content=")[^"]*"/g,`$1${escape(data.title)}"`);
    head=head.replace(/(<link rel="canonical" href=")[^"]*"/,`$1https://guardiansrpg.com${route}"`);
    head=head.replace(/(<meta property="og:url" content=")[^"]*"/,`$1https://guardiansrpg.com${route}"`);
    for(const [code,pre] of [['en','/'],['es','/es/'],['x-default','/']])head=head.replace(new RegExp('(<link rel="alternate" hreflang="'+code+'" href=")[^"]*"'),`$1https://guardiansrpg.com${pre}${id==='home'?'':id+'/'}"`);
    head=head.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g,'');
    const schema=[{'@context':'https://schema.org','@type':'WebSite',name:'The Guardians',url:'https://guardiansrpg.com/',inLanguage:lang}];
    if(id==='home')schema.push({'@context':'https://schema.org','@type':'VideoGame',name:'The Guardians',url:'https://guardiansrpg.com/',gamePlatform:['Discord','Web browser'],description:data.description,inLanguage:lang});
    if(data.faq.length)schema.push({'@context':'https://schema.org','@type':'FAQPage',mainEntity:data.faq.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))});
    head=head.replace('</head>',schema.map(s=>`<script type="application/ld+json">${JSON.stringify(s).replace(/</g,'\\u003c')}</script>`).join('\n')+'\n</head>');
    const fixLinks=html=>html.replace(/href="#([^"/]+)"/g,(all,k)=>ids.includes(k)?`href="${prefix}${k==='home'?'':k+'/'}"`:all);
    const html=head+`\n<body class="${id==='home'?'ed-home':''}">\n<a class="skip" href="#main">${lang==='es'?'Saltar al contenido':'Skip to content'}</a>\n${data.header}\n<button class="burger" id="burger" aria-label="${lang==='es'?'Abrir navegación':'Open navigation'}">Menu</button><div class="scrim" id="scrim"></div>\n<div class="app">${fixLinks(data.rail)}<main class="main" id="main" tabindex="-1">${fixLinks(data.main)}</main></div>\n<noscript><style>.ed-menu{display:none!important}.ed-home .rail{display:block;position:static;width:auto;height:auto}.rail{transform:none!important}.reveal{opacity:1;transform:none}@media(max-width:940px){.app{display:block}.rail{position:static;width:auto;height:auto}}</style></noscript>\n<script src="/hero-motion.js?v=20261014c" defer></script><script src="/combat-guide.js?v=20261013b" defer></script><script src="/current-data.js?v=20261026" defer></script><script src="/current-content.js?v=20261026" defer></script><script src="/edition.js?v=20261026" defer></script><script src="/app.js?v=20261026" defer></script>\n</body></html>\n`;
    const dest=path.join(root,route,'index.html');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,html);
    pages.push(route);
   }
  }
  const sitemapFile=path.join(root,'sitemap.xml');let sitemap=fs.readFileSync(sitemapFile,'utf8');
  for(const route of pages)if(!sitemap.includes(`<loc>https://guardiansrpg.com${route}</loc>`))sitemap=sitemap.replace('</urlset>',`<url><loc>https://guardiansrpg.com${route}</loc><lastmod>2026-10-26</lastmod></url>\n</urlset>`);
  sitemap=sitemap.replace(/<lastmod>[^<]*<\/lastmod>/g,'<lastmod>2026-10-26</lastmod>');fs.writeFileSync(sitemapFile,sitemap);
  const manifestPath=path.join(root,'site.webmanifest'),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  manifest.description='Explore Valestia: a fantasy RPG with tactical battles, character mastery and a connected Discord and web adventure.';
  manifest.background_color=manifest.theme_color='#091813';fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify({pages:pages.length,newRoutes:['mastery','raids','player-portal','combat-guide'],languages:['en','es']}));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
