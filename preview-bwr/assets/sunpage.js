/* Page-wide sunrise: progress = scroll through whole document. rAF-throttled; transform/opacity only. Reduced motion keeps the static CSS sun. */
(()=>{const L=document.querySelector('.sun-page');if(!L||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const sun=L.querySelector('.sp-sun'),glow=L.querySelector('.sp-glow'),gl=L.querySelector('.sp-glare'),dot=L.querySelector('.sp-dot'),core=L.querySelector('.sp-core');
let vh=innerHeight,max=1,tk=0;function m(){vh=innerHeight;max=Math.max(1,document.documentElement.scrollHeight-vh)}
addEventListener('resize',()=>{m();req()},{passive:true});addEventListener('load',()=>{m();req()});
function draw(){tk=0;const p=Math.min(1,Math.max(0,scrollY/max));
 const mob=innerWidth<=600,y=mob?(vh*(.26-.19*p)-85):vh*(.30-.26*p),x=mob?-p*6:-p*28;
 sun.style.transform=`translate(${x}px,${y}px) scale(${.8+p*.35})`;sun.style.opacity=(.8+p*.2).toFixed(3);
 glow.style.transform=`translate(${x}px,${y-190}px) scale(${.8+p*.4})`;glow.style.opacity=(.55+p*.4).toFixed(3);
 core.style.transform=`translate(${x}px,${y}px) scale(${.8+p*.35})`;core.style.opacity=(.9+p*.1).toFixed(3);
 gl.style.transform=`translate(${x*1.4}px,${y+118}px) rotate(${-22+p*10}deg)`;gl.style.opacity=(.2+p*.35).toFixed(3);
 dot.style.transform=`translate(${x*2.2}px,${y+200-p*60}px)`;dot.style.opacity=(.15+p*.3).toFixed(3)}
function req(){if(!tk)tk=requestAnimationFrame(draw)}
addEventListener('scroll',req,{passive:true});m();draw()})();
