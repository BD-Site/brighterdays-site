/* Home v3 (preview only): reveals, parallax, drifting notes/bubbles. No libraries. */
(()=>{const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;if(rm)return;
const small=()=>innerWidth<700;
/* per-section one-time effects */
const fx=document.querySelectorAll('.fx');if('IntersectionObserver'in window){const fo=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('go');fo.unobserve(x.target)}}),{threshold:.25});fx.forEach(e=>fo.observe(e))}
/* reveals */
const rv=document.querySelectorAll('.rv');document.documentElement.classList.add('rv-on');if('IntersectionObserver'in window&&rv.length){
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{rootMargin:'0px 0px -10% 0px',threshold:.05});rv.forEach(e=>io.observe(e))}
/* drift layer */
const N=small()?6:12,L=document.createElement('div');L.className='drift';L.setAttribute('aria-hidden','true');
const note='<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M9 3v10.6A3.5 3.5 0 1 0 11 17V7h6V3z"/></svg>';
const items=[];for(let i=0;i<N;i++){const d=[.25,.5,.9][i%3],isN=i%2==0,el=document.createElement('div'),sz=isN?(14+d*16):(8+d*14);
el.style.width=el.style.height=sz+'px';el.style.color=i%4==0?'#C8102E':'#111';el.style.opacity=(.08+d*.14).toFixed(2);
if(isN)el.innerHTML=note;else el.className='b';L.appendChild(el);items.push({el,d,x:(i*37+11)%100,y:Math.random(),ph:Math.random()*6.28})}
document.body.appendChild(L);
/* parallax targets */
const px=[...document.querySelectorAll('.plx')];
let tick=false;function frame(){tick=false;const sy=scrollY,vh=innerHeight,H=vh+120;
for(const it of items){let y=(it.y*H-sy*it.d*.6)%H;if(y<0)y+=H;y-=60;const x=it.x/100*innerWidth+Math.sin(sy/260+it.ph)*18*it.d;it.el.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${(Math.sin(sy/400+it.ph)*12).toFixed(1)}deg)`}
if(!small())for(const e of px){const r=e.getBoundingClientRect();if(r.bottom<-100||r.top>vh+100)continue;const k=parseFloat(e.dataset.speed||'.08');e.style.transform=`translate3d(0,${((r.top+r.height/2-vh/2)*-k).toFixed(1)}px,0)`}
else for(const e of px)e.style.transform=''}
function req(){if(!tick){tick=true;requestAnimationFrame(frame)}}
addEventListener('scroll',req,{passive:true});addEventListener('resize',req);frame()})();
