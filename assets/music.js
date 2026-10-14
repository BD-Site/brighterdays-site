/* Music theme (preview only): scroll reveal + tap-to-spin. No libraries. */
(()=>{const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const els=document.querySelectorAll('main > *:not(.mdiv), main .grid > *');
if(!rm&&'IntersectionObserver'in window){document.documentElement.classList.add('mreveal');
els.forEach((e,i)=>{e.classList.add('rv');if(i%2)e.classList.add('rv-l')});
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{rootMargin:'0px 0px -8% 0px',threshold:.05});
els.forEach(e=>io.observe(e))}
document.addEventListener('click',e=>{const li=e.target.closest('.playlist li');if(!li||e.target.closest('a'))return;li.classList.toggle('spin')});})();
