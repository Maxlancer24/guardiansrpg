/* Player appearance 10: Custodian. Same warhammer and character across nine atlases.
 * Source-space rectangles/anchors only; original transparent artwork is preserved. */
const CUSTODIAN_ACTIONS=(()=>{
 const grid=(xs,ys,split=512)=>xs.map((x,i)=>[i%3*512,i<3?0:split,512,i<3?split:1024-split,x,ys[i]-(i<3?0:split)]);
 const pack=(name,x,y,sequence,scale=.67,split=512)=>({src:'/guardian-duel/assets/custodian-v1/'+name+'.png',scale,frames:grid(x,y,split),sequence,loop:false});
 const p={
 idle:pack('idle',[307,275,243,307,275,243],[510,510,510,1021,1021,1021],[[0,500],[1,350],[2,450],[3,350],[4,450],[0,500]]),
 attack:{src:'/guardian-duel/assets/custodian-v1/attack.png',scale:.71,frames:[
  [0,0,512,530,264,511],[512,0,448,530,236,514],[960,0,576,530,214,507],
  [0,530,570,494,246,461],[570,490,454,534,210,514],[1024,530,512,494,267,473]
 ],sequence:[[0,350],[1,525],[2,110],[3,150],[4,150],[5,135]],loop:false},
 guard:pack('guard-v2',[263,257,237,261,258,252],[510,510,510,1012,1012,1012],[[0,250],[1,250],[2,400],[3,140],[4,300],[5,220]]),
 rest:pack('rest',[312,278,246,309,278,247],[510,510,510,1016,1018,1018],[[0,180],[1,300],[2,400],[3,300],[4,350],[5,400]],.666),
 motion:pack('motion',[250,285,282,272,255,282],[505,503,501,999,999,1010],[[0,120],[1,120],[2,120],[3,157],[4,156],[5,157]],.67),
 activation:pack('activation',[282,282,282,283,283,284],[506,506,506,1015,1015,1016],[[0,180],[1,230],[2,280],[3,300],[4,230],[5,200]],.675),
 victory:pack('victory',[285,280,271,285,281,272],[508,508,508,1020,1020,1021],[[0,400],[1,450],[2,650],[3,650],[4,450],[0,400],[5,110],[0,300]],.66),
 defeat:pack('defeat-v2',[241,244,260,270,256,255],[548,542,540,956,900,900],[[0,170],[1,240],[2,330],[3,370],[4,320],[5,800]],.637,575),
 hurt:{src:'/guardian-duel/assets/custodian-v1/hurt.png',scale:.562,frames:[
  [0,0,627,627,401,612],[627,0,627,627,301,607],
  [0,627,627,627,380,601],[627,627,627,627,348,601]
 ],sequence:[[0,100],[1,150],[2,200],[3,200]],loop:false}
 };
 // Raised hammer in recovery starts above the nominal lower row, between upper boots.
 p.attack.clips=[null,[[512,0],[960,0],[960,530],[790,530],[790,490],[650,490],[650,530],[512,530]],null,null,
  [[650,490],[790,490],[790,530],[1024,530],[1024,1024],[570,1024],[570,530],[650,530]],null];
 p.idle.loop=true;
 p.attack.reach=321;
 p.attack.hammer={2:[1495,325],3:[540,940]};
 p.attack.markers=[{at:875,event:'visual-impact',frame:2,point:p.attack.hammer[2]}];
 p.victory.settled={sequence:[[0,1600],[5,110],[0,1100]],loop:true};
 return p;
})();
if(typeof module!=='undefined')module.exports=CUSTODIAN_ACTIONS;
