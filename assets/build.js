/* Album-style tap cards: built ONLY from what the live menu embed renders (name, style, ABV, brewery). */
(()=>{const m=document.getElementById('menu-container');if(!m)return;
const CANS={"raspberry beret":"raspberry-beret","endless love":"endless-love","bicycle race":"bicycle-race","marula":"marula","bright lights":"bright-lights","sabrosa":"sabrosa","summertime magic":"summertime-magic","2nd hand raspberry beret":"2nd-hand-raspberry-beret","universal love":"universal-love","double trouble":"double-trouble","everlasting love":"everlasting-love","big salty tears":"big-salty-tears","after dark":"after-dark"};
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let grid=null,last=-1,t=0;
function build(){const items=[...m.querySelectorAll('.menu-item')];if(!items.length||items.length===last)return;last=items.length;
 if(!grid){grid=document.createElement('ol');grid.className='alb-grid';grid.setAttribute('aria-label','On tap now');m.before(grid)}
 grid.innerHTML=items.map((it,i)=>{const nm=(it.querySelector('.item-name a span')||it.querySelector('.item-name a'))?.textContent.trim()||'';
  const st=it.querySelector('.item-category')?.textContent.trim()||'',abv=it.querySelector('.item-abv')?.textContent.trim()||'',br=it.querySelector('.brewery')?.textContent.trim()||'';
  const bd=/brighter days/i.test(br),k=bd&&CANS[nm.toLowerCase()],lab=it.querySelector('.item-label img')?.getAttribute('src');
  const cov=k?`<img class="can" src="assets/img/cans/${k}.webp" alt="" loading="lazy" decoding="async">`:(lab?`<img src="${esc(lab)}" alt="" loading="lazy" decoding="async">`:'');
  return `<li class="alb"><div class="cov">${cov}</div><p class="trk-n">Track ${String(i+1).padStart(2,'0')}</p><h3>${esc(nm)}</h3><p class="trk">${esc(st)}${abv?'<br>'+esc(abv):''}</p>${bd?'<span class="bd-tag b-bd">BD original</span>':(br?`<p class="trk">${esc(br)}</p>`:'')}</li>`}).join('');
 m.classList.add('alb-on')}
new MutationObserver(()=>{clearTimeout(t);t=setTimeout(build,300)}).observe(m,{childList:true,subtree:true});build()})();

