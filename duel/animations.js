/* Timelines use time since entering a state, never the global idle clock. */
(() => {
 const sequence=(frames,time,loop=false)=>{
  const duration=frames.reduce((sum,f)=>sum+f[1],0);
  let t=Math.max(0,time);if(loop)t%=duration;
  for(const [frame,ms]of frames){if(t<ms)return frame;t-=ms}
  return frames.at(-1)[0];
 };
 const victory={
  garrick:{entry:[[0,260],[1,320],[2,420],[3,240]],loop:[[2,450],[3,180],[2,450],[1,400]]},
  // Repeat the entire celebration, not just the two arm-lowering frames.
  zoe:{entry:[[0,300],[1,360],[2,450],[3,300],[4,360],[5,450]],loop:[[0,300],[1,360],[2,450],[3,300],[4,360],[5,450]]},
  jessie:{entry:[[0,250],[1,300],[2,300],[3,160]],loop:[[0,400],[1,350],[2,350],[1,350],[3,130]]}
 };
 const api={sequence,victoryFrame(hero,time){const v=victory[hero],duration=v.entry.reduce((n,f)=>n+f[1],0);return time<duration?sequence(v.entry,time):sequence(v.loop,time-duration,true)}};
 if(typeof module!=='undefined')module.exports=api;else window.DuelAnimations=api;
})();
