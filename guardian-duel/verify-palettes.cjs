const assert=require('node:assert/strict'),E=require('./palette-engine.js'),profiles=require('./palettes.js');
const ids=Object.keys(require('./scale.js').profiles);
for(const [id,p]of Object.entries(profiles)){
 assert(ids.includes(id));E.validate(p);
 const pack=require('./'+id+'.js');
 for(const [name,m]of Object.entries(p.materials))for(const [action,regions]of Object.entries(m.regions||{})){
  assert(pack[action]);for(const [frame,region]of Object.entries(regions)){assert(pack[action].frames[frame]);assert.equal(region.length,4);assert(region.every(v=>v>=0&&v<=1));assert(region[0]<region[2]&&region[1]<region[3])}
 }
 for(const key of Object.keys(p.variants))for(const [action,animation]of Object.entries(pack))assert(E.recipe(p,key,animation,action).length);
}
const pack={frames:[[0,0,8,1,0,0]]},p={materials:{cloth:{hue:[165,250],saturation:[.08,.20],value:[.015,.075]}},variants:{red:{es:'Rojo',en:'Red',materials:{cloth:['#160f18','#842f40','#d87880']}}}};
const colors=[[30,90,115,255],[220,156,108,255],[170,170,170,255],[32,29,26,255],[152,103,56,255],[215,170,63,255],[30,90,115,0],[30,90,115,77]];
const original=Uint8ClampedArray.from(colors.flat()),copy=original.slice();
E.transform(copy,8,E.recipe(p,'red',pack,'idle'));
assert.notDeepEqual([...copy.slice(0,3)],colors[0].slice(0,3));
for(let i=1;i<7;i++)assert.deepEqual([...copy.slice(i*4,i*4+4)],colors[i],'skin, steel, hair, leather, gold and transparent pixels untouched');
for(let i=3;i<copy.length;i+=4)assert.equal(copy[i],original[i],'alpha unchanged');
const split=original.slice(),materials=E.recipe(p,'red',pack,'idle');E.transform(split,8,materials,0,16);E.transform(split,8,materials,16,32);assert.deepEqual(split,copy,'chunking identical');
assert.throws(()=>E.recipe(p,'missing',pack,'idle'),/Unknown/);
assert.throws(()=>E.validate({materials:p.materials,variants:{bad:{es:'X',en:'X',materials:{invalid:['#000000','#111111','#ffffff']}}}}),/Invalid/);
(async()=>{
 let draws=0;const createCanvas=()=>({width:0,height:0,getContext(){return {drawImage(){draws++},getImageData:()=>({data:original.slice()}),putImageData(){}}}});
 const cache=E.createCache({test:p},{createCanvas,yieldTask:async()=>{},maxPixels:8});
 const source={width:8,height:1};assert.equal(await cache.prepare('test','original','idle',source,pack),source);assert.equal(draws,0);
 const derived=await cache.prepare('test','red','idle',source,pack);assert.notEqual(derived,source);
 assert.equal(await cache.prepare('test','red','idle',source,pack),derived);assert.equal(draws,1,'no repeated processing');
 for(let i=0;i<100;i++)assert.equal(cache.get('test','red','idle',source),derived);
 await cache.prepare('test','red','attack',source,pack);assert.equal(cache.stats().entries,1);assert.equal(cache.stats().pixels,8);assert.equal(derived.width,0,'evicted backing released');assert.equal(cache.get('test','red','idle',source),source);
 console.log('PASS palettes: recipes, all actions, protected colors, alpha, chunks, original identity, reuse, bounded cache and eviction.');
})().catch(e=>{console.error(e);process.exitCode=1});
