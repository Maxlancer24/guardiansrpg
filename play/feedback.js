(() => {
 window.DemoFeedbackForm={attach(f,es){
  const $=id=>document.getElementById(id),tr=(a,b)=>es?a:b;let pending=false,lastBody='',submissionId='';
  $('send-feedback').onclick=async()=>{
   if(pending)return;
   for(const id of ['feedback-name','feedback-text','feedback-consent'])if(!$(id).reportValidity())return;
   const name=$('feedback-name').value.trim(),feedback=$('feedback-text').value.trim();
   if(!name||feedback.length<5){$('feedback-state').textContent=tr('Escribe tu nombre y una opinión de al menos 5 caracteres.','Enter your name and at least 5 characters of feedback.');return;}
   const data={name,feedback,consent:$('feedback-consent').checked,language:es?'es':'en',result:f.victory?'victory':f.defeat?'defeat':'unfinished',rounds:f.round};
   const body=JSON.stringify(data);if(body!==lastBody){submissionId=crypto.randomUUID();lastBody=body;}
   pending=true;$('send-feedback').disabled=true;$('feedback-state').textContent=tr('Enviando…','Sending…');
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
   try{
    const response=await fetch('https://guardians-app.discloud.app/api/demo-feedback',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,submission_id:submissionId}),signal:controller.signal});
    if(!response.ok){const error=new Error();error.status=response.status;throw error;}
    const saved=await response.json();if(saved.ok!==true||!Number.isInteger(saved.id))throw new Error('Invalid receipt');
    $('feedback-state').textContent=tr('¡Gracias! Tu opinión quedó guardada. Referencia #','Thank you! Your feedback was saved. Reference #')+saved.id;
   }catch(error){$('feedback-state').textContent=error.status===429?tr('Demasiados envíos. Espera unos minutos y vuelve a intentarlo.','Too many submissions. Wait a few minutes and try again.'):tr('No se pudo confirmar el guardado. El servicio puede no estar disponible todavía. Conservamos tu texto aquí; vuelve a intentarlo sin cerrar esta página.','Saving could not be confirmed. The service may not be available yet. Your text is still here; try again without closing this page.');}
   finally{clearTimeout(timeout);pending=false;$('send-feedback').disabled=false;}
  };
 }};
})();
