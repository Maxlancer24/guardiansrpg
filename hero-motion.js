/* Independent moving cape over a stationary inpainted background patch. */
(function () {
  'use strict';
  let scene=null;
  const key='guardians-hero-paused';
  // Hand-traced cloth silhouette, source-image pixels. Excludes body, coat tails,
  // water, ruins and the concave opening under the left hem.
  const capePath='M1210 483 Q1220 476 1232 480 L1257 485 L1263 491 Q1241 507 1221 540 Q1206 564 1197 585 Q1186 607 1170 622 L1172 632 Q1151 631 1145 616 Q1143 612 1148 606 Q1133 591 1118 594 Q1109 597 1103 605 Q1104 585 1115 575 Q1126 566 1151 555 Q1176 544 1188 531 Q1200 515 1204 498 Z';
  const vertex=`attribute vec2 a_position; varying vec2 v_uv;
    void main(){v_uv=vec2((a_position.x+1.0)*0.5,(1.0-a_position.y)*0.5);gl_Position=vec4(a_position,0.,1.);}`;
  const fragment=`precision highp float;
    uniform sampler2D u_image;
    uniform sampler2D u_mask;
    uniform sampler2D u_background;
    uniform vec2 u_view;
    uniform vec2 u_image_size;
    uniform vec2 u_position;
    uniform float u_time;
    varying vec2 v_uv;
    const float TAU=6.28318530718;
    const vec2 PATCH=vec2(1080.,460.);
    const vec2 PATCH_SIZE=vec2(220.,200.);
    vec2 matte(vec2 p){
      vec2 q=(p-PATCH)/PATCH_SIZE;
      if(q.x<0.||q.y<0.||q.x>1.||q.y>1.)return vec2(0.);
      return texture2D(u_mask,q).rg;
    }
    vec2 wind(vec2 p){
      float free=smoothstep(12.,148.,length((p-vec2(1240.,486.))*vec2(1.,.8)));
      float t=u_time*TAU/5.;
      return free*vec2(7.*sin(t+free*1.5),16.*sin(t+free*2.)+3.*sin(t*2.-free*3.));
    }
    void main(){
      float scale=max(u_view.x/u_image_size.x,u_view.y/u_image_size.y);
      vec2 displayed=u_image_size*scale;
      vec2 uv=(v_uv*u_view+(displayed-u_view)*u_position)/displayed;
      vec2 p=uv*u_image_size;
      if(p.x<1080.||p.x>1280.||p.y<465.||p.y>656.){gl_FragColor=vec4(0.);return;}
      // Reconstruct ONLY the part formerly hidden behind the original cape.
      // This stationary plate is never deformed.
      float ground=matte(p).g;
      vec3 background=texture2D(u_background,(p-PATCH)/PATCH_SIZE).rgb;
      // Inverse-map the independent cloth silhouette. Its shoulder stays pinned;
      // the free tip travels visibly, revealing the stationary plate underneath.
      vec2 cloth=p;
      for(int i=0;i<4;i++)cloth=p-wind(cloth);
      float alpha=matte(cloth).r;
      vec3 fabric=texture2D(u_image,cloth/u_image_size).rgb;
      fabric*=1.+.025*sin(u_time*TAU/5.+cloth.x*.08)*alpha;
      float coverage=alpha+ground*(1.-alpha);
      gl_FragColor=vec4(fabric*alpha+background*ground*(1.-alpha),coverage);
    }`;

  function makeCapeMask(image){
    const width=220,height=200;
    const shape=document.createElement('canvas');shape.width=width;shape.height=height;
    const ctx=shape.getContext('2d',{willReadFrequently:true});
    ctx.translate(-1080,-460);ctx.fillStyle='#fff';ctx.fill(new Path2D(capePath));
    const silhouette=ctx.getImageData(0,0,width,height).data;
    const source=document.createElement('canvas');source.width=width;source.height=height;
    const sc=source.getContext('2d',{willReadFrequently:true});sc.drawImage(image,1080,460,width,height,0,0,width,height);
    const pixels=sc.getImageData(0,0,width,height).data;
    const output=ctx.createImageData(width,height);
    const at=(x,y)=>x<0||x>=width||y<0||y>=height?0:silhouette[(y*width+x)*4+3]/255;
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const i=(y*width+x)*4,a=at(x,y);
      let core=1,cover=0;
      for(let dy=-8;dy<=8;dy++)for(let dx=-8;dx<=8;dx++){
        const sample=at(x+dx,y+dy),distance=Math.max(Math.abs(dx),Math.abs(dy));
        if(distance<=4)core=Math.min(core,sample);
        cover=Math.max(cover,sample*Math.max(0,Math.min(1,(8-distance)/2)));
      }
      const blue=Math.max(0,Math.min(1,(pixels[i+2]-pixels[i]-1)/9,(pixels[i+2]-pixels[i+1]+1)/6));
      output.data[i]=Math.round(255*a*Math.max(core,blue));
      output.data[i+1]=Math.round(255*cover);
      output.data[i+3]=255;
    }
    ctx.setTransform(1,0,0,1,0,0);ctx.putImageData(output,0,0);
    return shape;
  }

  class Scene {
    constructor(root,L){
      this.root=root;this.L=L;this.active=false;this.visible=true;this.running=false;
      this.image=root.querySelector('.ed-hero-art');this.button=root.querySelector('.hero-motion-toggle');
      this.media=matchMedia('(prefers-reduced-motion: reduce)');
      this.paused=false;try{this.paused=localStorage.getItem(key)==='1';}catch(_){}
      this.elapsed=0;this.last=0;this.frame=0;this.gl=null;this.loading=false;this.failed=false;this.destroyed=false;
      this.layer=document.createElement('div');this.layer.className='hero-atmosphere';this.layer.setAttribute('aria-hidden','true');
      this.layer.innerHTML=Array.from({length:24},(_,i)=>{
        const leaf=i<8;
        return `<i class="${leaf?'hero-leaf':'hero-mote'}" style="--x:${10+(i*37)%87}%;--y:${12+(i*29)%76}%;--delay:-${(i*1.73).toFixed(2)}s;--duration:${leaf?18+(i%3)*4:8+(i%4)*2}s;--size:${leaf?7+i%4:2+i%3}px;--drift:${leaf?-110-(i%4)*25:24+(i%5)*12}px;--turn:${i*51}deg"></i>`;
      }).join('');
      root.querySelector('.ed-hero-art').after(this.layer);
      this.onClick=()=>{this.paused=!this.paused;try{localStorage.setItem(key,this.paused?'1':'0');}catch(_){}this.sync();};
      this.onVisibility=()=>this.sync();
      this.onMotion=()=>{if(this.media.matches&&this.canvas)this.canvas.hidden=true;this.sync();};
      this.button.addEventListener('click',this.onClick);
      document.addEventListener('visibilitychange',this.onVisibility);
      this.media.addEventListener('change',this.onMotion);
      this.observer=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;this.sync();},{threshold:.01});
      this.observer.observe(root);
      this.resizeObserver=new ResizeObserver(()=>{if(this.gl)this.resize();});this.resizeObserver.observe(root);
      this.tick=this.tick.bind(this);
      this.sync();
    }
    setActive(value){this.active=value;this.sync();}
    sync(){
      if(this.destroyed)return;
      const reduced=this.media.matches||!!navigator.connection?.saveData;
      this.button.hidden=reduced;
      this.button.textContent=this.paused?this.L('Play animation','Activar animación'):this.L('Pause animation','Pausar animación');
      this.button.setAttribute('aria-label',this.button.textContent);
      this.root.dataset.motion=reduced?'reduced':this.paused?'paused':'enabled';
      const run=this.active&&this.visible&&!document.hidden&&!reduced&&!this.paused;
      this.root.dataset.motionRunning=String(run);
      if(run&&!this.running){this.running=true;this.last=0;this.initGL();this.frame=requestAnimationFrame(this.tick);}
      else if(!run&&this.running){this.running=false;cancelAnimationFrame(this.frame);this.last=0;}
      if(this.canvas&&this.gl&&!reduced)this.canvas.hidden=false;
    }
    async initGL(){
      if(this.gl||this.loading||this.failed||this.destroyed)return;
      this.loading=true;
      try{
        const background=new Image();background.src='/assets/editorial/guardian-cape-background-v3.webp';
        await Promise.all([this.image.decode(),background.decode()]);if(this.destroyed)return;
        const canvas=document.createElement('canvas');canvas.className='hero-cloth';canvas.setAttribute('aria-hidden','true');canvas.hidden=true;
        const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false,powerPreference:'low-power'});
        if(!gl){this.failed=true;return;}
        this.canvas=canvas;
        const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Hero shader compilation failed');return s;};
        const program=gl.createProgram(),vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);
        gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
        gl.deleteShader(vs);gl.deleteShader(fs);
        if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Hero shader link failed');
        gl.useProgram(program);
        this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
        const pos=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
        this.texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.texture);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,this.image);
        gl.uniform1i(gl.getUniformLocation(program,'u_image'),0);
        const mask=makeCapeMask(this.image);
        this.maskTexture=gl.createTexture();gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.maskTexture);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,mask);
        gl.uniform1i(gl.getUniformLocation(program,'u_mask'),1);
        this.backgroundTexture=gl.createTexture();gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,this.backgroundTexture);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,background);
        gl.uniform1i(gl.getUniformLocation(program,'u_background'),2);gl.activeTexture(gl.TEXTURE0);
        gl.uniform2f(gl.getUniformLocation(program,'u_image_size'),this.image.naturalWidth,this.image.naturalHeight);
        this.uniforms={view:gl.getUniformLocation(program,'u_view'),position:gl.getUniformLocation(program,'u_position'),time:gl.getUniformLocation(program,'u_time')};
        this.program=program;this.gl=gl;
        canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.failed=true;canvas.hidden=true;this.gl=null;});
        this.image.after(canvas);this.resize();this.draw();
        canvas.hidden=this.media.matches;this.root.dataset.cloth='ready';
      }catch(_){this.failed=true;if(this.canvas)this.canvas.remove();this.gl=null;this.root.dataset.cloth='fallback';}
      finally{this.loading=false;}
    }
    resize(){
      if(!this.gl)return;
      const {width,height}=this.image.getBoundingClientRect();if(!width||!height)return;
      const dpr=Math.min(devicePixelRatio||1,1.5,1920/width);
      this.canvas.width=Math.round(width*dpr);this.canvas.height=Math.round(height*dpr);
      this.gl.viewport(0,0,this.canvas.width,this.canvas.height);
      this.gl.uniform2f(this.uniforms.view,width,height);
      const position=getComputedStyle(this.image).objectPosition.split(' ').map(x=>parseFloat(x)/100);
      this.gl.uniform2f(this.uniforms.position,position[0],position[1]);this.draw();
    }
    draw(){if(this.gl){this.gl.uniform1f(this.uniforms.time,this.elapsed%20);this.gl.drawArrays(this.gl.TRIANGLES,0,6);}}
    tick(now){
      if(!this.running||this.destroyed)return;
      if(!this.last)this.last=now;
      const dt=now-this.last;
      if(dt>=1000/30){this.elapsed+=Math.min(dt,100)/1000;this.last=now;this.draw();}
      this.frame=requestAnimationFrame(this.tick);
    }
    destroy(){
      this.destroyed=true;cancelAnimationFrame(this.frame);this.observer.disconnect();this.resizeObserver.disconnect();
      document.removeEventListener('visibilitychange',this.onVisibility);this.media.removeEventListener('change',this.onMotion);this.button.removeEventListener('click',this.onClick);
      if(this.gl){this.gl.deleteTexture(this.texture);this.gl.deleteTexture(this.maskTexture);this.gl.deleteTexture(this.backgroundTexture);this.gl.deleteBuffer(this.buffer);this.gl.deleteProgram(this.program);this.gl.getExtension('WEBGL_lose_context')?.loseContext();}
      this.layer.remove();this.canvas?.remove();
    }
  }
  window.GuardiansHeroMotion={route(id,L){
    const root=document.querySelector('#pg-home .ed-hero');
    if(scene&&scene.root!==root){scene.destroy();scene=null;}
    if(!scene&&root&&id==='home')scene=new Scene(root,L);
    if(scene)scene.setActive(id==='home');
  }};
})();
