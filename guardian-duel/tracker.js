/* Tracker v1: atlas rectangles, planted feet and crossbow release socket.
 * Source images are unchanged RGBA; registration happens only at draw time. */
const TRACKER_ACTIONS=(()=>{
 const grid=(xs,ys,boundary=512)=>xs.map((x,i)=>[i%3*512,i<3?0:boundary,512,i<3?boundary:1024-boundary,x,ys[i]-(i<3?0:boundary)]);
 const pack=(key,x,y,sequence,scale=.67,boundary=512)=>({src:'/guardian-duel/assets/tracker-v1/'+key+'.png',scale,frames:grid(x,y,boundary),sequence,loop:false});
 const out={
 idle:pack('idle-v2',[292,271,251,292,271,251],[514,514,514,1016,1016,1016],[[0,550],[1,350],[2,450],[3,350],[4,450],[0,550]],.67,515),
 guard:pack('guard-v2',[256,272,281,257,272,283],[508,510,510,1012,1012,1012],[[0,180],[1,250],[2,450],[3,140],[4,300],[5,220]]),
 rest:pack('rest',[293,275,261,302,281,265],[502,502,502,1004,1003,1003],[[0,180],[1,360],[2,480],[3,360],[4,300],[5,200]],.69),
 motion:pack('motion',[273,270,260,270,270,265],[502,502,500,1006,1006,1009],[[0,120],[1,120],[2,120],[3,220],[4,220],[5,220]],.69),
 activation:pack('activation',[284,272,259,291,273,262],[507,508,508,1009,1009,1008],[[0,180],[1,230],[2,280],[3,300],[4,230],[5,200]],.684),
 victory:pack('victory',[268,266,277,277,267,271],[507,507,507,1019,1019,1019],[[0,450],[1,450],[2,700],[3,550],[4,650],[5,100]]),
 defeat:pack('defeat',[266,253,256,270,257,263],[557,554,548,923,902,903],[[0,170],[1,240],[2,330],[3,370],[4,320],[5,800]],.63,575)
 };
 const xEdges=[0,443,887,1330,1774],attackX=[221,191,189,189,223,219,222,227],attackY=[441,441,441,441,882,882,882,882];
 out.attack={src:'/guardian-duel/assets/tracker-v1/attack.png',scale:.775,frames:attackX.map((x,i)=>[xEdges[i%4],i<4?0:444,xEdges[i%4+1]-xEdges[i%4],i<4?444:443,x,attackY[i]-(i<4?0:444)]),sequence:[[0,400],[1,540],[2,160],[3,140],[4,145],[5,145],[6,145],[7,145]],loop:false};
 out.attack.muzzle={2:[1290,79]};
 out.attack.markers=[{at:940,event:'release',frame:2,point:out.attack.muzzle[2]}];
 out.hurt={src:'/guardian-duel/assets/tracker-v1/hurt.png',scale:.55,frames:[
 [0,0,627,627,383,614],[627,0,627,614,284,614],
 [0,627,627,627,385,598],[627,614,627,640,319,610]
 ],sequence:[[0,100],[1,150],[2,200],[3,200]],loop:false};
 out.idle.loop=true;
 out.victory.settled={sequence:[[0,1800]],loop:true};
 return out;
})();
if(typeof module!=='undefined')module.exports=TRACKER_ACTIONS;
