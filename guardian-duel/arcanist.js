/* Arcanist: nine identity-locked atlases. Source-space feet and casting sockets. */
const ARCANIST_ACTIONS=(()=>{
 const grid=(x,y)=>x.map((a,i)=>[i%3*512,Math.floor(i/3)*512,512,512,a,y[i]]);
 const pack=(key,x,y,sequence,scale=.67)=>({src:'/guardian-duel/assets/arcanist-v1/'+key+'.png',scale,frames:grid(x,y),sequence,loop:false});
 const p={
  idle:pack('idle',[272,241,230,270,241,232],[493,493,493,493,493,493],[[0,550],[1,350],[2,450],[3,350],[4,450],[0,550]]),
  attack:pack('attack',[268,228,194,225,264,251],[493,493,494,478,479,480],[[0,400],[1,540],[2,180],[3,200],[4,140],[5,120]],.71),
  guard:pack('guard',[285,256,213,272,247,226],[503,503,503,488,484,489],[[0,250],[1,250],[2,400],[1,400],[2,400],[3,140],[4,300],[5,220]]),
  rest:pack('rest',[267,256,248,269,259,260],[511,511,511,507,507,507],[[0,180],[1,360],[2,480],[3,360],[4,300],[5,200]],.64),
  motion:pack('motion',[280,275,255,330,323,240],[512,510,512,488,449,499],[[0,120],[1,120],[2,120],[3,220],[4,220],[5,220]],.65),
  activation:pack('activation',[270,267,251,271,268,251],[507,507,507,506,506,506],[[0,180],[1,230],[2,280],[3,300],[4,230],[5,200]],.66),
  victory:pack('victory',[283,266,254,282,266,253],[507,507,508,506,506,506],[[0,350],[1,450],[2,650],[3,700],[4,550],[5,110],[0,350]],.64),
  defeat:{src:'/guardian-duel/assets/arcanist-v1/defeat.png',scale:.61,frames:[
   [0,0,512,552,265,550],[512,0,512,552,270,550],[1024,0,512,552,264,548],
   [0,540,512,484,254,454],[512,552,506,472,260,440],[1018,552,518,472,264,422]
  ],sequence:[[0,170],[1,240],[2,330],[3,370],[4,320],[5,800]],loop:false},
  hurt:{src:'/guardian-duel/assets/arcanist-v1/hurt.png',scale:.54,frames:[
   [0,0,627,627,296,611],[627,0,627,627,281,613],
   [0,627,627,627,316,596],[627,627,627,627,327,594]
  ],sequence:[[0,100],[1,150],[2,200],[3,200]],loop:false}
 };
 // Preserve complete upper boots, excluding them from the lower row's retreat.
 p.motion.frames=p.motion.frames.map((r,i)=>i<3?[r[0],0,512,520,r[4],r[5]]:[r[0],520,512,504,r[4],r[5]-8]);
 // First lower-row crystal overlaps only the empty corner of the upper cell.
 p.defeat.clips=[[[0,0],[512,0],[512,540],[420,540],[420,552],[0,552]],null,null,
  [[420,540],[512,540],[512,1024],[0,1024],[0,552],[420,552]],null,null];
 p.idle.loop=true;
 p.victory.settled={sequence:[[0,1600],[5,110],[0,900]],loop:true};
 p.attack.markers=[{at:940,event:'release',frame:2,point:[1350,39]}];
 p.attack.castSockets={palm:[[245,160],[776,138],[1440,137],[420,640],[761,680],[1180,768]],crystal:[[352,35],[849,35],[1350,39],[343,546],[858,548],[1352,547]]};
 return p;
})();
if(typeof module!=='undefined')module.exports=ARCANIST_ACTIONS;
