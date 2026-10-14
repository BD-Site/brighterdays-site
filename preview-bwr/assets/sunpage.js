/* Sun swoops along a curved arc (lower-left -> upper-right) tied to full-page scroll, eased. rAF-throttled; transform/opacity only.
   Where the arc passes over the centred text column the bright unblended core fades out and only the soft screen-blended glow remains. */
(()=>{const L=document.querySelector('.sun-page');if(!L||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const q=s=>L.querySelector(s),glow=q('.sp-glow'),sun=q('.sp-sun'),rays=q('.sp-rays'),gl=q('.sp-glare'),dot=q('.sp-dot'),core=q('.sp-core'),bl=q('.sp-blend');
let vw=innerWidth,vh=innerHeight,max=1,hb=60,tk=0;
function m(){vw=innerWidth;vh=innerHeight;max=Math.max(1,document.documentElement.scrollHeight-vh);const h=document.querySelector('header');hb=h?h.getBoundingClientRect().height:60}
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,cl=(a,b,v)=>Math.min(b,Math.max(a,v));
function draw(){tk=0;const p=cl(0,1,scrollY/max),t=ease(p),mob=vw<=600;
 const x0=vw*(mob?.04:.08),x1=vw*(mob?.97:.9),yb=vh*.9,yt=hb+(mob?70:110);
 const x=x0+(x1-x0)*t,y=yb-(yb-yt)*Math.sin(t*Math.PI/2);
 const col=mob?vw*.5-14:Math.min(560,vw*.5-90),off=Math.abs(x-vw/2),edge=cl(0,1,(off-col)/40);
 const g=.75+t*.5,rot=-30+t*60;
 glow.style.transform=`translate(${x}px,${y}px) scale(${g})`;glow.style.opacity=(.35+t*.4).toFixed(3);
 sun.style.transform=`translate(${x}px,${y}px) scale(${.8+t*.35})`;sun.style.opacity=(.5+t*.35).toFixed(3);
 rays.style.transform=`translate(${x}px,${y}px) rotate(${rot}deg) scale(${g})`;rays.style.opacity=(.15+t*.3).toFixed(3);
 gl.style.transform=`translate(${x}px,${y}px) rotate(${-24+t*14}deg) scale(${.7+t*.5},1)`;gl.style.opacity=(.15+t*.3).toFixed(3);
 dot.style.transform=`translate(${x-(x-vw/2)*.6}px,${y+(vh/2-y)*.6}px)`;dot.style.opacity=(.1+t*.3).toFixed(3);
 bl.style.opacity=((mob?.12:.22)+(mob?.88:.78)*edge).toFixed(3);
 core.style.transform=`translate(${x}px,${y}px) scale(${.8+t*.3})`;core.style.opacity=(edge*(.8+t*.2)).toFixed(3)}
function req(){if(!tk)tk=requestAnimationFrame(draw)}
addEventListener('scroll',req,{passive:true});addEventListener('resize',()=>{m();req()},{passive:true});addEventListener('load',()=>{m();req()});m();draw()})();
