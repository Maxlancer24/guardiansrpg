/* Approved roster 04. Source-space feet anchors; preserve anatomical scale.
 * Attack pose 0 in the generated sheet is deliberately NOT used (wrong arm).
 * Wide blade rectangles and masks retain the rapier without adjacent drawings.
 */
const DUELIST_ACTIONS=(()=>{
 const cells=(xs,ys)=>xs.map((x,i)=>[i%3*512,Math.floor(i/3)*512,512,512,x,ys[i]]);
 const pack=(name,frames,sequence,scale=.67,loop=false)=>({src:'/guardian-duel/assets/duelist-v1/'+name+'.png',frames,sequence,scale,loop});
 const actions={
  idle:pack('idle',cells([333,278,264,337,276,262],[483,483,483,479,479,479]),[[0,500],[1,350],[2,400],[1,350],[0,400],[3,350],[4,400],[3,350]],.67,true),
  attack:pack('attack',[
   [560,0,435,500,190,460],[1030,0,506,500,224,460],
   [0,512,670,488,250,440],[545,512,595,488,225,440],
   [1140,512,396,488,142,446]
  ],[[0,300],[1,575],[2,110],[3,210],[4,225]]),
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
 actions.attack.clips=[null,null,
  [[0,512],[545,512],[545,675],[670,675],[670,710],[545,710],[545,1000],[0,1000]],
  [[545,512],[1140,512],[1140,1000],[545,1000],[545,710],[675,710],[675,675],[545,675]],null];
 actions.attack.markers=[{at:875,event:'visual-impact',frame:2}];
 actions.attack.reach=410; // Hip anchor to rapier tip at full extension, source pixels.
 actions.victory.settled={sequence:[[4,1000],[5,110],[4,750],[3,750]],loop:true};
 return actions;
})();
if(typeof module!=='undefined')module.exports=DUELIST_ACTIONS;
