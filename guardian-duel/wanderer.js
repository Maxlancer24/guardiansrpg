/* Wanderer: right-handed saber. Rectangles and foot registration only; RGBA sources unchanged. */
const WANDERER_ACTIONS=(()=>{
 const cells=(xs,ys)=>xs.map((x,i)=>[i%3*512,Math.floor(i/3)*512,512,512,x,ys[i]]);
 const pack=(name,x,y,sequence,scale=.67)=>({src:'/guardian-duel/assets/wanderer-v1/'+name+'.png',frames:cells(x,y),sequence,scale,loop:false});
 const p={
 idle:pack('idle',[272,272,271,272,272,271],[502,502,502,502,502,502],[[0,500],[1,350],[2,450],[3,350],[4,450],[0,500]]),
 attack:{src:'/guardian-duel/assets/wanderer-v1/attack.png',scale:.69,frames:[
 [0,0,512,520,245,508],[512,0,512,520,244,508],[1024,0,512,520,202,508],
 [0,520,565,504,245,477],[565,520,459,504,219,479],[1024,520,512,504,252,483]
 ],sequence:[[0,350],[1,525],[2,110],[3,150],[4,150],[5,135]],loop:false},
 guard:pack('guard',[264,264,264,264,262,264],[505,505,505,502,501,502],[[0,250],[1,250],[2,400],[3,140],[4,300],[5,220]]),
 rest:pack('rest',[273,277,286,274,275,277],[509,508,508,507,506,507],[[0,180],[1,300],[2,400],[3,300],[4,350],[5,400]],.661),
 motion:{src:'/guardian-duel/assets/wanderer-v1/motion.png',scale:.69,frames:[
 [0,0,550,490,230,478],[550,0,474,490,245,485],[1024,0,512,490,293,482],
 [0,490,550,534,383,484],[550,490,474,534,276,520],[1024,490,512,534,266,509]
 ],sequence:[[0,120],[1,120],[2,120],[3,157],[4,156],[5,157]],loop:false},
 activation:pack('activation',[292,267,242,291,266,243],[507,508,508,503,503,504],[[0,180],[1,230],[2,280],[3,300],[4,230],[5,200]]),
 victory:pack('victory',[265,264,265,265,264,264],[504,504,504,503,503,504],[[0,400],[1,450],[2,650],[3,650],[4,450],[0,400],[5,110],[0,300]],.673),
 defeat:{src:'/guardian-duel/assets/wanderer-v1/defeat-v2.png',scale:.60,frames:[
 [0,0,512,600,250,563],[512,0,512,600,255,563],[1024,0,512,600,255,557],
 [0,600,512,424,270,345],[512,600,512,424,265,335],[1024,600,512,424,255,335]
 ],sequence:[[0,170],[1,240],[2,330],[3,370],[4,320],[5,800]],loop:false},
 hurt:{src:'/guardian-duel/assets/wanderer-v1/hurt.png',scale:.553,frames:[[0,0,627,627,384,626],[627,0,627,627,300,625],[0,627,627,627,372,595],[627,627,627,627,315,597]],sequence:[[0,100],[1,150],[2,200],[3,200]],loop:false}
 };
 p.idle.loop=true;
 p.attack.reach=296;
 p.attack.blade={2:[[1425,305],[1522,410]],3:[[398,800],[544,903]]};
 p.attack.markers=[{at:875,event:'visual-impact',frame:2,point:p.attack.blade[2][1]}];
 p.victory.settled={sequence:[[0,1600],[5,110],[0,1100]],loop:true};
 return p;
})();
if(typeof module!=='undefined')module.exports=WANDERER_ACTIONS;
