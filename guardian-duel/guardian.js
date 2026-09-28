/* Guardian: story protagonist (Max artwork). Special comes from player equipment.
 * Original RGBA atlases, measured rectangles and foot anchors. No art warping.
 */
const GUARDIAN_ACTIONS=(()=>{
 const cells=(x,y)=>x.map((a,i)=>[i%3*512,Math.floor(i/3)*512,512,512,a,y[i]]);
 const pack=(name,x,y,sequence,scale=.67)=>({src:'/guardian-duel/assets/guardian-v1/'+name+'.png',frames:cells(x,y),sequence,scale,loop:false});
 const p={
  idle:pack('idle-v2',[257,257,257,257,257,257],[504,504,504,503,503,503],[[0,500],[1,350],[2,450],[3,350],[4,450],[0,500]]),
  attack:{src:'/guardian-duel/assets/guardian-v1/attack.png',scale:.67,frames:[
   [0,0,500,512,240,510],[500,0,498,512,242,507],[998,0,538,512,207,501],
   [0,512,602,512,277,492],[602,512,422,512,156,501],[1024,512,512,512,211,501]
  ],sequence:[[0,350],[1,525],[2,110],[3,150],[4,150],[5,135]],loop:false},
  attack2:{src:'/guardian-duel/assets/guardian-v1/attack-b.png',scale:.67,frames:[
   [0,0,512,500,252,495],[512,0,480,512,233,493],[992,0,544,512,220,491],
   [0,480,512,544,289,525],[512,512,512,512,249,494],[1024,512,512,512,208,495]
  ],sequence:[[0,350],[1,525],[2,110],[3,150],[4,150],[5,135]],loop:false,
  clips:[[[0,0],[512,0],[512,480],[385,480],[385,500],[0,500]],null,null,
   [[0,500],[360,500],[450,480],[512,480],[512,1024],[0,1024]],null,null]},
  guard:pack('guard',[271,238,229,268,244,234],[510,510,510,493,495,496],[[0,250],[1,250],[2,400],[3,140],[4,300],[5,220]],.64),
  hurt:pack('hurt',[262,261,238,263,255,230],[503,503,503,502,502,503],[[0,65],[1,100],[2,150],[3,140],[4,110],[5,85]]),
  rest:pack('rest',[272,245,246,274,245,239],[506,506,505,505,505,505],[[0,180],[1,300],[2,400],[3,300],[4,350],[5,400]]),
  motion:{src:'/guardian-duel/assets/guardian-v1/motion-v2.png',scale:.67,frames:[
   [0,0,525,512,280,494],[525,0,515,512,276,494],[1040,0,496,512,281,496],
   [0,512,500,512,290,481],[500,512,524,512,286,480],[1024,512,512,512,302,484]
  ],sequence:[[0,120],[1,120],[2,120],[3,157],[4,156],[5,157]],loop:false},
  activation:pack('activation',[253,256,254,269,258,254],[506,506,506,503,503,505],[[0,180],[1,230],[2,280],[3,300],[4,230],[5,200]]),
  victory:pack('victory',[268,254,249,272,255,246],[508,509,509,506,506,505],[[0,400],[1,450],[2,650],[3,450],[4,450],[5,110],[0,450]]),
  defeat:{src:'/guardian-duel/assets/guardian-v1/defeat.png',scale:.62,frames:[
   [0,0,512,575,258,548],[512,0,512,575,240,540],[1024,0,512,575,245,546],
   [0,575,512,449,250,382],[512,575,512,449,240,388],[1024,575,512,449,242,379]
  ],sequence:[[0,170],[1,240],[2,330],[3,370],[4,320],[5,800]],loop:false}
 };
 p.idle.loop=true;
 // The cleanup atlas has the closed-eye pose in cell 4. Keep runtime blink index 5.
 [p.idle.frames[4],p.idle.frames[5]]=[p.idle.frames[5],p.idle.frames[4]];
 p.attack.reach=319;
 p.attack.blade={2:[[1335,187],[1524,233]],3:[[409,801],[589,919]]};
 p.attack.markers=[{at:875,event:'visual-impact',frame:2,point:p.attack.blade[2][1]}];
 p.attack2.reach=300;
 p.attack2.blade={2:[[1338,105],[1512,33]],3:[[211,558],[451,485]]};
 p.attack2.sweep=-1;
 p.attack2.markers=[{at:875,event:'visual-impact',frame:2,point:p.attack2.blade[2][1]}];
 p.victory.settled={sequence:[[0,1400],[5,110],[0,1200]],loop:true};
 return p;
})();
if(typeof module!=='undefined')module.exports=GUARDIAN_ACTIONS;
