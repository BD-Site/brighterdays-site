/* Hero crossfade: first slide loads normally; the rest load only after the page has loaded. Static with reduced motion. */
(()=>{const h=document.querySelector('.hero-fade');if(!h)return;const rm=matchMedia('(prefers-reduced-motion: reduce)');if(rm.matches)return;
const hs=[...h.querySelectorAll('img.hs')];if(!hs.length)return;let i=-1,t=0;
const load=()=>hs.forEach(im=>{if(!im.src){if(matchMedia('(max-width:760px)').matches&&im.dataset.m){im.removeAttribute('sizes');im.src=im.dataset.m}else{im.srcset=im.dataset.srcset;im.src=im.dataset.src}}});
const go=()=>{if(rm.matches||document.hidden)return;const n=i+1<hs.length?i+1:-1,nx=n<0?null:hs[n];
 if(nx&&!(nx.complete&&nx.naturalWidth)){t=setTimeout(go,1000);return}
 if(nx)nx.classList.add('on');if(i>=0)hs[i].classList.remove('on');i=n;t=setTimeout(go,6000)};
const start=()=>setTimeout(()=>{load();t=setTimeout(go,4500)},1200);
document.readyState==='complete'?start():addEventListener('load',start,{once:true});
document.addEventListener('visibilitychange',()=>{clearTimeout(t);if(!document.hidden)t=setTimeout(go,6000)})})();
