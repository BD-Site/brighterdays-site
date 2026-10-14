/* Scroll-linked sunrise: rAF-throttled, writes transform/opacity only. Skipped with reduced motion (CSS static state stays). */
(()=>{const h=document.querySelector('.fx-hero'),s=h&&h.querySelector('.sunrise');if(!s||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const dawn=s.querySelector('.sr-dawn'),day=s.querySelector('.sr-day'),sun=s.querySelector('.sr-sun'),fl=s.querySelectorAll('.sr-flare');
let H=h.offsetHeight,tk=0;addEventListener('resize',()=>{H=h.offsetHeight},{passive:true});
function draw(){tk=0;const p=Math.min(1,Math.max(0,scrollY/(H*.75)));
 const y=-(H*.05+p*H*.62);sun.style.transform=`translateY(${y}px) scale(${.85+p*.25})`;sun.style.opacity=(.7+p*.3).toFixed(3);
 dawn.style.opacity=(.62*(1-p)).toFixed(3);day.style.opacity=(p*.9).toFixed(3);
 const r=-14+p*8;fl[0].style.transform=`translateY(${y}px) rotate(${r}deg)`;fl[0].style.opacity=(.15+p*.35).toFixed(3);
 fl[1].style.transform=`translate(${-120-p*40}px,${y*.7}px)`;fl[1].style.opacity=(.1+p*.35).toFixed(3);
 fl[2].style.transform=`translate(${-220-p*70}px,${y*.45}px)`;fl[2].style.opacity=(.08+p*.3).toFixed(3)}
addEventListener('scroll',()=>{if(!tk)tk=requestAnimationFrame(draw)},{passive:true});draw()})();
