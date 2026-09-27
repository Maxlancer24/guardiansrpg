/* Reviewed Explorer v1: same model across nine atlases. Explicit foot anchors. */
const EXPLORER_ACTIONS=(()=>{
 const grid=(anchors,floors)=>anchors.map((x,i)=>[i%3*512,Math.floor(i/3)*512,512,512,x,floors[i]]);
 const normal=[234,232,234,234,232,234],floor=[495,495,495,490,490,490];
 const pack=(key,anchors,floors,sequence,scale=.67)=>({src:'/guardian-duel/assets/explorer-v1/'+key+'.png',scale,frames:grid(anchors,floors),sequence,loop:false});
 const out={
 idle:pack('idle',normal,floor,[[0,550],[1,350],[2,450],[3,350],[4,450],[0,550]]),
 attack:pack('attack',[240,208,208,224,202,232],[507,507,507,490,490,490],[[0,220],[1,260],[2,460],[3,180],[4,200],[5,260]],.69),
 guard:pack('guard',[242,235,236,250,238,237],[495,495,495,490,490,490],[[0,180],[1,250],[2,450],[3,140],[4,300],[5,220]]),
 rest:pack('rest',normal,floor,[[0,180],[1,360],[2,480],[3,360],[4,300],[5,200]]),
 motion:pack('motion',[265,272,262,275,252,260],[498,492,493,449,478,487],[[0,120],[1,120],[2,120],[3,220],[4,220],[5,220]]),
 activation:pack('activation',normal,floor,[[0,180],[1,230],[2,280],[3,300],[4,230],[5,200]]),
 victory:pack('victory',normal,floor,[[0,180],[1,200],[2,240],[3,300],[4,320],[5,700]]),
 defeat:pack('defeat',[235,245,240,270,250,250],[505,506,520,435,420,425],[[0,170],[1,240],[2,330],[3,370],[4,320],[5,800]],.63)
 };
 // Bow tips in the lower attack row start at y=508; boots above finish at y=507.
 out.attack.frames=out.attack.frames.map((r,i)=>i<3?[r[0],0,512,508,r[4],r[5]]:[r[0],508,512,516,r[4],r[5]+4]);
 // Defeat's upper supporting hand ends at y=520, before lower drawings begin.
 out.defeat.frames=out.defeat.frames.map((r,i)=>i<3?[r[0],0,512,530,r[4],r[5]]:[r[0],530,512,494,r[4],r[5]-18]);
 out.hurt={src:'/guardian-duel/assets/explorer-v1/hurt.png',scale:.53,frames:[
 [0,0,627,627,320,617],[627,0,627,627,290,617],
 [0,627,627,627,335,595],[627,627,627,627,290,604]
 ],sequence:[[0,100],[1,150],[2,200],[3,200]],loop:false};
 out.idle.loop=true;
 out.attack.markers=[{at:940,event:'release',frame:3,point:[430,680]}];
 return out;
})();
if(typeof module!=='undefined')module.exports=EXPLORER_ACTIONS;
