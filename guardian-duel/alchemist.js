/* Alchemist: identity-locked player appearance. No innate class/skill or damage. */
const ALCHEMIST_ACTIONS=(()=>{
 const grid=(x,y)=>x.map((a,i)=>[i%3*512,Math.floor(i/3)*512,512,512,a,y[i]]);
 const pack=(key,x,y,sequence,scale=.67)=>({src:'/guardian-duel/assets/alchemist-v1/'+key+'.png',scale,frames:grid(x,y),sequence,loop:false});
 const p={
  idle:pack('idle',[338,274,212,341,282,214],[507,507,507,504,504,504],[[0,550],[1,400],[2,450],[3,450],[4,400],[0,550]]),
  attack:pack('attack',[298,286,249,314,278,249],[505,505,505,499,499,505],[[0,300],[1,520],[2,280],[3,160],[4,220],[5,220]]),
  guard:pack('guard',[322,256,184,322,256,216],[505,505,505,493,493,501],[[0,250],[1,250],[2,400],[1,400],[2,400],[3,140],[4,300],[5,220]]),
  hurt:pack('hurt',[338,273,218,338,282,216],[508,509,510,506,505,505],[[0,50],[1,80],[2,120],[3,140],[4,130],[5,130]]),
  rest:pack('rest',[338,276,210,340,276,211],[509,508,509,507,507,507],[[0,160],[2,230],[1,400],[3,500],[1,350],[4,230],[5,200]]),
  motion:pack('motion',[240,262,240,288,260,249],[478,479,483,486,487,489],[[0,120],[1,120],[2,120],[3,220],[4,220],[5,220]]),
  activation:pack('activation-v2',[338,272,219,340,275,217],[508,508,508,505,505,505],[[0,180],[1,230],[2,280],[3,300],[4,230],[5,200]]),
  victory:pack('victory',[338,274,213,342,280,216],[507,507,507,504,504,504],[[0,350],[1,450],[2,650],[3,650],[1,300],[4,350],[5,110],[0,350]]),
  defeat:pack('defeat-v2',[304,256,236,274,251,248],[534,531,530,449,438,443],[[0,170],[1,240],[2,330],[3,370],[4,320],[5,800]])
 };
 // Independent crop boundaries exclude neighbouring head/boot silhouettes.
 p.motion.frames=p.motion.frames.map((r,i)=>i<3?[r[0],0,512,490,r[4],r[5]]:[r[0],490,512,534,r[4],r[5]+22]);
 p.defeat.frames=p.defeat.frames.map((r,i)=>i<3?[r[0],0,512,550,r[4],r[5]]:[r[0],550,512,474,r[4],r[5]-38]);
 p.idle.loop=true;
 p.victory.settled={sequence:[[0,1700],[5,110],[0,850]],loop:true};
 // Fixed release socket from the open right hand; never follows later recovery poses.
 p.attack.releasePoint=[1455,108];
 p.attack.markers=[{at:820,event:'release',frame:2,point:p.attack.releasePoint}];
 p.attack.presentation={kind:'flask',release:1180,impact:1580,ranged:true};
 return p;
})();
if(typeof module!=='undefined')module.exports=ALCHEMIST_ACTIONS;
