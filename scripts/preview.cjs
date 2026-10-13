const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg','.wav':'audio/wav','.webmanifest':'application/manifest+json'};
function createServer() {
  return http.createServer((req,res)=>{
    let pathname;
    try { pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch {res.writeHead(400).end();return;}
    let file=path.resolve(root,'.'+pathname);
    if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    if(!fs.existsSync(file)){
      // The three new public routes are generated from the app on the first build.
      if(/^\/(es\/)?(mastery|raids|player-portal)\/$/.test(pathname))file=path.join(root,pathname.startsWith('/es/')?'es/index.html':'index.html');
      else {res.writeHead(404).end('Not found');return;}
    }
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
    fs.createReadStream(file).pipe(res);
  });
}
if(require.main===module)createServer().listen(4183,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4183'));
module.exports={createServer,root};
