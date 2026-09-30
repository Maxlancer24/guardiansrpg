const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const animation=require('./animation.js'),scale=require('./scale.js');
const game=fs.readFileSync(__dirname+'/game.js','utf8');
const source=game.slice(game.indexOf('function drawActor('),game.indexOf('function render(){'));
const avatars=Object.fromEntries(Object.keys(scale.profiles).map(id=>[id,{actions:require('./'+id+'.js')}]));
for(const [id,{actions}] of Object.entries(avatars)){
 const ctx={clock:0,appearance:id,modes:[{name:'idle',at:0}],display:{actors:[{}]},busy:true,
  AVATARS:avatars,GuardianScale:scale,GuardianAnimation:animation,sequence:animation.frame,
  $:()=>({checked:false}),attackKey:()=>'attack',isRanged:()=>['duskgunner','shadowweaver','explorer','arcanist','tracker','alchemist'].includes(id),ctx:{},
  clamp:n=>Math.max(0,Math.min(1,n)),ease:n=>Math.max(0,Math.min(1,n)),
  sprite(context,mode,frame){ctx.drawn={mode,frame}},setMode(){}};
 vm.createContext(ctx);vm.runInContext(source,ctx);
 for(const elapsed of [200,350,500,800,1100,1800,2500,4200,6000,7050,7300]){
  ctx.clock=elapsed*1.5;ctx.modes[0]={name:'idle',at:0};ctx.drawActor(0,270,480,230);
  const expected=!actions.idle.authoredBlink&&elapsed%7000<110?5:animation.frame(actions.idle,elapsed,true);
  assert.equal(ctx.drawn.frame,expected,id+' idle at 1x, including blink');
 }
 for(const mode of ['rest','hurt','victory']){
  for(const elapsed of [100,350,700,1100]){
   ctx.clock=elapsed*1.5;ctx.modes[0]={name:mode,at:0};ctx.drawActor(0,270,480,230);
   const expected=mode==='victory'?animation.victory(actions[mode],elapsed*1.5):animation.frame(actions[mode],elapsed*1.5,mode==='rest');
   assert.equal(ctx.drawn.frame,expected,id+' '+mode+' retains 1.5x');
  }
 }
 ctx.clock=1235;ctx.modes[0]={name:'attack',at:0};ctx.drawActor(0,270,480,230);
 assert.equal(ctx.drawn.frame,animation.frame(actions.attack,1235-360,false),id+' attack timing unchanged');
 if(ctx.isRanged()){
  for(const age of [200,2400,2540]){
   ctx.clock=age;ctx.drawActor(0,270,480,230);
   assert.equal(ctx.drawn.mode,'idle');
   assert.equal(ctx.drawn.frame,animation.frame(actions.idle,(age<360?age:age-360-animation.duration(actions.attack))/1.5,true),'ranged idle segments at 1x');
  }
 }
}
assert(game.includes('clock+=dt*1.5'),'combat clock stays at 1.5x');
console.log('PASS: all combat idles and blinking at 1x; rest, hurt, victory, attack and damage clock remain at 1.5x.');
