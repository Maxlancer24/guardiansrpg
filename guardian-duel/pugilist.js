/* Player appearance 08: fists, not a class or an equipped active skill.
 * Full-body authored poses. Feet anchors and knuckle sockets are source pixels. */
const PUGILIST_ACTIONS=(()=>{
 const cells=(xs,ys)=>xs.map((x,i)=>[i%3*512,Math.floor(i/3)*512,512,512,x,ys[i]]);
 const pack=(name,x,y,sequence,scale=.67)=>({src:'/guardian-duel/assets/pugilist-v1/'+name+'.png',frames:cells(x,y),sequence,scale,loop:false});
 const p={
  idle:pack('idle',[251,251,251,251,251,251],[504,504,504,503,503,503],[[0,500],[1,350],[2,450],[3,350],[4,450],[0,500]]),
  attack:pack('attack',[250,258,225,263,260,218],[505,505,505,496,496,496],[[0,350],[1,525],[2,110],[3,150],[4,150],[5,135]]),
  guard:pack('guard',[260,258,256,264,257,256],[506,506,505,499,499,499],[[0,250],[1,250],[2,400],[1,400],[2,400],[3,140],[4,300],[5,220]]),
  rest:pack('rest',[251,253,255,251,252,250],[504,504,504,503,503,503],[[0,180],[1,280],[2,380],[3,300],[4,260],[5,260]],.665),
  motion:pack('motion',[298,285,248,280,280,263],[495,499,499,481,486,486],[[0,120],[1,120],[2,120],[3,157],[4,156],[5,157]],.69),
  activation:pack('activation',[262,252,260,266,264,261],[509,509,509,485,485,485],[[0,180],[1,230],[2,280],[3,300],[4,230],[5,200]],.66),
  victory:pack('victory',[270,257,249,291,259,248],[508,508,508,506,506,506],[[0,350],[1,400],[2,550],[3,750],[4,450],[0,500],[5,110],[0,300]],.66),
  defeat:{src:'/guardian-duel/assets/pugilist-v1/defeat.png',scale:.57,frames:[
   [0,0,512,625,260,603],[512,0,512,625,239,602],[1024,0,512,625,261,599],
   [0,625,512,399,255,350],[512,625,512,399,256,329],[1024,625,512,399,256,324]
  ],sequence:[[0,170],[1,240],[2,330],[3,370],[4,320],[5,800]],loop:false},
  hurt:{src:'/guardian-duel/assets/pugilist-v1/hurt.png',scale:.54,frames:[
   [0,0,627,627,365,617],[627,0,627,627,303,617],
   [0,627,627,627,340,595],[627,627,627,627,305,600]
  ],sequence:[[0,100],[1,150],[2,200],[3,200]],loop:false}
 };
 // The retreat toe crosses the nominal 512px column by two pixels.
 p.motion.frames[3]=[0,512,528,512,280,481];
 p.motion.frames[4]=[528,512,496,512,264,486];
 p.idle.loop=true;
 p.attack.reach=252;
 p.attack.markers=[{at:875,event:'visual-impact',frame:2,point:[1501,129]}];
 p.attack.knuckles={2:[1501,129],3:[507,640]};
 p.victory.settled={sequence:[[0,1600],[5,110],[0,1100]],loop:true};
 return p;
})();
if(typeof module!=='undefined')module.exports=PUGILIST_ACTIONS;
