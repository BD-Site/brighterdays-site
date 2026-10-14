/* Swooping page-wide sun v5. Scroll only sets a TARGET progress; a rAF loop lerps the current value toward it
   (frame-rate independent) and stops once settled. One continuous eased curve per layout; translate3d/rotate/scale + opacity only. */
(()=>{const L=document.querySelector('.sun-page');if(!L)return;
const q=s=>L.querySelector(s),glow=q('.sp-glow'),sun=q('.sp-sun'),rays=q('.sp-rays'),gl=q('.sp-glare'),dot=q('.sp-dot'),core=q('.sp-core'),bl=q('.sp-blend');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let vw=innerWidth,vh=innerHeight,max=1,hb=60,target=0,cur=0,raf=0,last=0;
const cl=(a,b,v)=>Math.min(b,Math.max(a,v)),ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,ss=(a,b,v)=>{v=cl(0,1,(v-a)/(b-a));return v*v*(3-2*v)};
function m(){vw=innerWidth;vh=innerHeight;max=Math.max(1,document.documentElement.scrollHeight-vh);const h=document.querySelector('header');hb=h?h.getBoundingClientRect().height:60}
function place(p){const t=ease(p),mob=vw<=600;let x,y,edge;
 if(!mob){const x0=vw*.08,x1=vw*.9,yb=vh*.9,yt=hb+110;x=x0+(x1-x0)*t;y=yb-(yb-yt)*Math.sin(t*Math.PI/2);
  edge=cl(0,1,(Math.abs(x-vw/2)-Math.min(560,vw*.5-90))/40)}
 else{/* phone (no side margins): rise up the left edge, sweep across under the header, settle top-right: one smooth curve */
  const yb=vh*.82,yt=hb+58;x=-16+(vw+32)*ss(.38,.66,t);y=yb-(yb-yt)*ss(0,.42,t)-18*Math.sin(Math.PI*ss(.38,.66,t))+vh*.08*ss(.66,1,t);
  edge=cl(0,1,(Math.abs(x-vw/2)-(vw/2-20))/30)}
 const g=.75+t*.5,T=(px,py)=>`translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0)`;
 glow.style.transform=T(x,y)+` scale(${g.toFixed(3)})`;glow.style.opacity=(.35+t*.4).toFixed(3);
 sun.style.transform=T(x,y)+` scale(${(.8+t*.35).toFixed(3)})`;sun.style.opacity=(.5+t*.35).toFixed(3);
 rays.style.transform=T(x,y)+` rotate(${(-30+t*60).toFixed(2)}deg) scale(${g.toFixed(3)})`;rays.style.opacity=(.15+t*.3).toFixed(3);
 gl.style.transform=T(x,y)+` rotate(${(-24+t*14).toFixed(2)}deg) scale(${(.7+t*.5).toFixed(3)},1)`;gl.style.opacity=(.15+t*.3).toFixed(3);
 dot.style.transform=T(x-(x-vw/2)*.6,y+(vh/2-y)*.6);dot.style.opacity=(.1+t*.3).toFixed(3);
 bl.style.opacity=((mob?.1:.22)+(mob?.9:.78)*edge).toFixed(3);
 core.style.transform=T(x,y)+` scale(${(.8+t*.3).toFixed(3)})`;core.style.opacity=(edge*(mob?.95:(.8+t*.2))).toFixed(3)}
function tick(now){const dt=Math.min(64,now-(last||now));last=now;const k=1-Math.pow(.86,dt/16.67);cur+=(target-cur)*k;
 if(Math.abs(target-cur)<.0004){cur=target;raf=0;last=0;place(cur);return}place(cur);raf=requestAnimationFrame(tick)}
function read(){target=cl(0,1,scrollY/max);if(reduce){cur=target=.85;place(cur);return}if(!raf)raf=requestAnimationFrame(tick)}
if(reduce){m();place(.85);addEventListener('resize',()=>{m();place(.85)},{passive:true});return}
addEventListener('scroll',read,{passive:true});addEventListener('resize',()=>{m();read()},{passive:true});addEventListener('load',()=>{m();read()});
m();target=cur=cl(0,1,scrollY/max);place(cur)})();
