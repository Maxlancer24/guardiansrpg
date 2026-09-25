/* Optional usage measurement; failure must never block a combat. */
(() => {
 const endpoint='https://guardians-app.discloud.app/api/demo-analytics';
 let match=null,queue=[],sending=false,visitor=null;
 const box=document.getElementById('usage-consent');
 const storage={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};
 const blocked=navigator.doNotTrack==='1'||navigator.globalPrivacyControl===true;
 if(box){box.checked=!blocked&&storage.get('demo-usage-consent')==='yes';box.disabled=blocked;
 box.onchange=()=>{storage.set('demo-usage-consent',box.checked?'yes':'no');if(!box.checked){queue=[];match=null;visitor=null;storage.set('demo-visitor','')}};}
 function identity(){if(visitor)return visitor;try{const saved=JSON.parse(storage.get('demo-visitor'));if(saved&&Date.now()-saved.at<30*86400000&&typeof saved.id==='string')return visitor=saved.id}catch{}
 visitor=crypto.randomUUID();storage.set('demo-visitor',JSON.stringify({id:visitor,at:Date.now()}));return visitor;}
 async function flush(){
  if(sending||!queue.length||!box?.checked)return;sending=true;
  const payload=queue[0],controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
  try{const response=await fetch(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal,keepalive:true});
   if(!response.ok)throw Error('unavailable');
   if(queue[0]===payload)queue.shift();
  }catch{if(queue[0]===payload)queue.shift();}finally{clearTimeout(timer);sending=false;if(queue.length)void flush();}
 }
 function send(event,result){if(!match||!box?.checked||blocked)return;queue.push({...match,event,result,consent:true});queue=queue.slice(-10);void flush();}
 window.DemoAnalytics={
  reset(){match=null},
  start(mode,heroes){if(match||blocked||!box?.checked)return;try{
   match={match_id:crypto.randomUUID(),visitor_id:identity(),mode,heroes:[...heroes],device:matchMedia('(pointer: coarse)').matches?'mobile':'desktop',language:document.documentElement.lang==='es'?'es':'en'};
   send('start','unfinished');
  }catch{match=null}},
  finish(winner){if(!match||match.done)return;send('finish',winner===0?'victory':'defeat');match.done=true}
 };
})();
