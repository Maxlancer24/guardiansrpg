/* Approved roster 04. The corrected thrust rotates the torso away from camera:
 * the right arm remains the weapon arm through anticipation, impact and return.
 */
const DUELIST_ACTIONS=(()=>{
 const cells=(xs,ys)=>xs.map((x,i)=>[i%3*512,Math.floor(i/3)*512,512,512,x,ys[i]]);
 const pack=(name,frames,sequence,scale=.67,loop=false)=>({src:'/guardian-duel/assets/duelist-v1/'+name+'.png',frames,sequence,scale,loop});
 const actions={
  idle:pack('idle',cells([333,278,264,337,276,262],[483,483,483,479,479,479]),[[0,500],[1,350],[2,400],[1,350],[0,400],[3,350],[4,400],[3,350]],.67,true),
  attack:pack('attack',[
   [0,0,627,442,267,431],[700,0,554,442,215,431],
   [0,442,724,354,264,347],[648,442,606,354,230,347],
   [64,796,600,458,243,426],[750,796,504,458,184,426]
  ],[[0,350],[1,525],[2,110],[3,150],[4,150],[5,135]],.75),
  guard:pack('guard',cells([274,218,213,282,235,216],[494,494,494,491,491,491]),[[0,250],[1,250],[2,400],[1,400],[2,400],[3,140],[4,300],[5,220]]),
  hurt:pack('hurt',[
   [0,0,627,627,393,596],[627,0,627,627,348,596],
   [0,627,627,627,392,591],[627,627,627,627,342,591]
  ],[[0,100],[1,150],[2,200],[3,200]],.54),
  rest:pack('rest',cells([335,278,265,334,278,263],[484,484,484,481,481,481]),[[0,160],[1,260],[2,450],[3,350],[4,320],[5,350]]),
  motion:pack('motion',[
   [0,0,512,496,242,455],[512,0,568,496,310,455],
   [1100,0,436,496,208,455],[0,512,512,512,310,455],
   [512,496,512,528,249,435],[1024,512,512,512,304,455]
  ],[[0,120],[1,120],[2,120],[3,157],[4,156],[5,157]]),
  activation:pack('activation',cells([335,278,265,337,278,265],[483,483,483,481,481,481]),[[0,180],[1,230],[2,280],[3,300],[4,230],[5,200]]),
  victory:pack('victory',cells([338,264,263,336,282,265],[498,498,498,479,479,479]),[[0,180],[1,200],[2,240],[3,300],[4,910],[5,110]]),
  defeat:pack('defeat',cells([314,275,280,285,252,250],[509,509,509,422,422,422]),[[0,170],[1,240],[2,330],[3,370],[4,320],[5,800]],.65)
 };
 actions.attack.src='/guardian-duel/assets/duelist-v1/attack-right-v2.png';
 actions.attack.clips=[null,null,
  [[0,442],[650,442],[650,520],[724,520],[724,547],[650,547],[650,796],[0,796]],
  [[648,442],[1254,442],[1254,796],[648,796],[648,547],[724,547],[724,520],[648,520]],null,null];
 actions.attack.markers=[{at:875,event:'visual-impact',frame:2}];
 actions.attack.reach=456; // Hip anchor to rapier tip at full extension, source pixels.
 actions.victory.settled={sequence:[[4,1000],[5,110],[4,750],[3,750]],loop:true};
 return actions;
})();
if(typeof module!=='undefined')module.exports=DUELIST_ACTIONS;
