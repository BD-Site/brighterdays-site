/* Hero dawn-to-day sky tint only (the sun lives in the page-wide layer). rAF-throttled, opacity only. */
(()=>{const h=document.querySelector('.fx-hero'),s=h&&h.querySelector('.sunrise');if(!s||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const dawn=s.querySelector('.sr-dawn'),day=s.querySelector('.sr-day');let H=h.offsetHeight,tk=0;addEventListener('resize',()=>{H=h.offsetHeight},{passive:true});
function draw(){tk=0;const p=Math.min(1,Math.max(0,scrollY/(H*.5)));dawn.style.opacity=(.62-.32*p).toFixed(3);day.style.opacity=(p*.5).toFixed(3)}
addEventListener('scroll',()=>{if(!tk)tk=requestAnimationFrame(draw)},{passive:true});draw()})();
