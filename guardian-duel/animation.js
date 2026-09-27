/* Sprite timing is relative to each action, never the global combat clock. */
(function(root){
 const duration=pack=>pack.sequence.reduce((sum,entry)=>sum+entry[1],0);
 function frame(pack,age,loop=pack.loop){
  const total=duration(pack),elapsed=Math.max(0,age);
  let t=loop?elapsed%total:Math.min(elapsed,total-1);
  for(const [index,ms] of pack.sequence){if(t<ms)return index;t-=ms;}
  return pack.sequence.at(-1)[0];
 }
 function victory(pack,age){
  const entry=duration(pack),rest=pack.settled?duration(pack.settled):1500;
  const t=Math.max(0,age)%(entry+rest);
  // Finish EVERY entry pose before the rest. Then repeat the whole celebration.
  if(t<entry)return frame(pack,t,false);
  return pack.settled?frame(pack.settled,t-entry,true):pack.sequence.at(-1)[0];
 }
 const api={duration,frame,victory};
 if(typeof module!=='undefined')module.exports=api;else root.GuardianAnimation=api;
})(typeof window!=='undefined'?window:globalThis);
