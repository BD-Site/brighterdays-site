/* Page-wide sun v11 (iOS-safe, high arc, ~50% opacity). Same path/smoothness as v8: cached viewport height, iOS toolbar-only resizes ignored, rAF lerp.
   Draws a solid glowing disc + halo + slow rays + glare. Never fades below a visible floor. */
(()=>{const L=document.querySelector('.sun-page');if(!L)return;
const q=s=>L.querySelector(s),halo=q('.sp-halo'),rays=q('.sp-rays'),disc=q('.sp-disc'),gl=q('.sp-glare');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,cl=(a,b,v)=>Math.min(b,Math.max(a,v));
let vw=0,vh=0,max=1,hb=60,target=0,cur=0,raf=0,last=0;
function measure(){vw=document.documentElement.clientWidth;vh=innerHeight;const h=document.querySelector('header');hb=h?h.getBoundingClientRect().height:60;
 max=Math.max(1,document.documentElement.scrollHeight-vh)}
function place(p){const t=p*p*(3-2*p);
 const r=vw<=600?52:75,ed=r*.6,y0=vh*.28,y2=hb+r*.45,u=1-t;/* v11: upper band only */
 const x=ed+(vw-2*ed)*t*t*t,y=u*u*y0+2*u*t*(y2-10)+t*t*y2;
 const half=vw/2,inner=cl(0,1,1-(Math.abs(x-half)-(half-r*1.6))/(r*1.2));/* 1 when the disc is over the centre text column */
 const T=(a,b)=>`translate3d(${a.toFixed(1)}px,${b.toFixed(1)}px,0)`,s=.92+t*.12;
 disc.style.transform=T(x,y)+` scale(${s.toFixed(3)})`;disc.style.opacity=(.5-.12*inner).toFixed(3);
 halo.style.transform=T(x,y)+` scale(${(.9+t*.25).toFixed(3)})`;halo.style.opacity=(.45-.12*inner).toFixed(3);
 rays.style.transform=T(x,y)+` rotate(${(t*120).toFixed(2)}deg)`;rays.style.opacity=(.3-.08*inner).toFixed(3);
 gl.style.transform=T(x,y)+` rotate(${(-20+t*14).toFixed(2)}deg)`;gl.style.opacity=(.23-.1*inner).toFixed(3);
 L.dataset.x=x.toFixed(1);L.dataset.y=y.toFixed(1)}
const prog=()=>reduce?.85:cl(0,1,scrollY/max);
function tick(now){const dt=Math.min(64,now-(last||now));last=now;cur+=(target-cur)*(1-Math.pow(.86,dt/16.67));
 if(Math.abs(target-cur)<.0004){cur=target;raf=0;last=0}else raf=requestAnimationFrame(tick);place(cur)}
function onScroll(){target=prog();if(!raf)raf=requestAnimationFrame(tick)}
function snap(){measure();cur=target=prog();place(cur)}
let w0=0;function onResize(){const w=document.documentElement.clientWidth;if(w===w0)return;w0=w;measure();onScroll()}
snap();w0=vw;
if(!reduce)addEventListener('scroll',onScroll,{passive:true});
addEventListener('resize',onResize,{passive:true});addEventListener('orientationchange',()=>setTimeout(()=>{w0=0;onResize()},250));
addEventListener('load',()=>{const h=document.documentElement.scrollHeight-vh;if(Math.abs(h-max)>1){max=Math.max(1,h);onScroll()}});
addEventListener('pageshow',e=>{if(e.persisted)snap()})})();
