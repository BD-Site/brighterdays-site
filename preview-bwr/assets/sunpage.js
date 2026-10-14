/* Page-wide sun v7 (iOS-safe). One quadratic Bezier from bottom-left (P0) via the top-left corner (P1) to top-right (P2).
   Viewport height + scroll height are cached; iOS toolbar resizes (height-only) are ignored; recompute only on orientation/real width change.
   Scroll sets a target; a rAF loop lerps toward it and stops when settled. translate3d/rotate/scale + opacity only. */
(()=>{const L=document.querySelector('.sun-page');if(!L)return;
const q=s=>L.querySelector(s),glow=q('.sp-glow'),sun=q('.sp-sun'),rays=q('.sp-rays'),gl=q('.sp-glare'),dot=q('.sp-dot'),core=q('.sp-core'),bl=q('.sp-blend');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,cl=(a,b,v)=>Math.min(b,Math.max(a,v));
let vw=0,vh=0,max=1,hb=60,target=0,cur=0,raf=0,last=0;
function measure(){vw=document.documentElement.clientWidth;vh=innerHeight;const h=document.querySelector('header');hb=h?h.getBoundingClientRect().height:60;
 max=Math.max(1,document.documentElement.scrollHeight-vh)}
function place(p){const t=p*p*(3-2*p);/* smoothstep easing of progress */
 const ed=Math.min(24,vw*.04),y0=vh*.84,y2=hb+Math.min(90,vw*.15),u=1-t;
 const x=u*u*(-ed)+2*u*t*(-ed)+t*t*(vw+ed),y=u*u*y0+2*u*t*(y2-30)+t*t*y2;
 const half=vw/2,mg=Math.min(34,vw*.05),edge=cl(0,1,(Math.abs(x-half)-(half-mg))/30);
 const g=.75+t*.5,T=(a,b)=>`translate3d(${a.toFixed(1)}px,${b.toFixed(1)}px,0)`;
 glow.style.transform=T(x,y)+` scale(${g.toFixed(3)})`;glow.style.opacity=(.35+t*.4).toFixed(3);
 sun.style.transform=T(x,y)+` scale(${(.8+t*.35).toFixed(3)})`;sun.style.opacity=(.5+t*.35).toFixed(3);
 rays.style.transform=T(x,y)+` rotate(${(-30+t*60).toFixed(2)}deg) scale(${g.toFixed(3)})`;rays.style.opacity=(.15+t*.3).toFixed(3);
 gl.style.transform=T(x,y)+` rotate(${(-24+t*14).toFixed(2)}deg) scale(${(.7+t*.5).toFixed(3)},1)`;gl.style.opacity=(.15+t*.3).toFixed(3);
 dot.style.transform=T(x-(x-half)*.6,y+(vh/2-y)*.6);dot.style.opacity=(.1+t*.3).toFixed(3);
 bl.style.opacity=(.12+.88*edge).toFixed(3);
 core.style.transform=T(x,y)+` scale(${(.8+t*.3).toFixed(3)})`;core.style.opacity=(.95*edge).toFixed(3);
 L.dataset.x=x.toFixed(1);L.dataset.y=y.toFixed(1)}
const prog=()=>reduce?.85:cl(0,1,scrollY/max);
function tick(now){const dt=Math.min(64,now-(last||now));last=now;cur+=(target-cur)*(1-Math.pow(.86,dt/16.67));
 if(Math.abs(target-cur)<.0004){cur=target;raf=0;last=0}else raf=requestAnimationFrame(tick);place(cur)}
function onScroll(){target=prog();if(!raf)raf=requestAnimationFrame(tick)}
function snap(){measure();cur=target=prog();place(cur)}
let w0=0;function onResize(){const w=document.documentElement.clientWidth;if(w===w0)return;/* height-only = iOS toolbar: ignore */w0=w;measure();onScroll()}
snap();w0=vw;/* synchronous first placement, before first paint */
if(!reduce)addEventListener('scroll',onScroll,{passive:true});
addEventListener('resize',onResize,{passive:true});addEventListener('orientationchange',()=>setTimeout(()=>{w0=0;onResize()},250));
addEventListener('load',()=>{const h=document.documentElement.scrollHeight-vh;if(Math.abs(h-max)>1){max=Math.max(1,h);onScroll()}});
addEventListener('pageshow',e=>{if(e.persisted)snap()})})();
