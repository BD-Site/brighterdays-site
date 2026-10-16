/* Album-style tap cards: built ONLY from what the live menu embed renders (name, style, ABV, brewery).
   Cover art priority: our can crops -> our photo-set art -> the embed's own beer label (unless it is the generic brewery logo) -> logo fallback. */
(()=>{const m=document.getElementById('menu-container');if(!m)return;
const norm=s=>String(s||'').toLowerCase().replace(/\(.*?\)/g,' ').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').replace(/^the /,'').trim();
const CANS={"raspberry beret":"raspberry-beret","endless love":"endless-love","bicycle race":"bicycle-race","marula":"marula","bright lights":"bright-lights","sabrosa":"sabrosa","summertime magic":"summertime-magic","2nd hand raspberry beret":"2nd-hand-raspberry-beret","universal love":"universal-love","double trouble":"double-trouble","everlasting love":"everlasting-love","big salty tears":"big-salty-tears","after dark":"after-dark"};
const ART={"blackberry blossom":"blackberry-blossom","bb blossom":"blackberry-blossom","livin is easy":"livin-is-easy","living is easy":"livin-is-easy","axe perience":"axe-perience","pink square candy sour":"pink-square","pink square":"pink-square","rage":"rage","summer ale":"summer-ale","nutcracker ale":"nutcracker","nutcracker":"nutcracker","so fresh n so clean":"so-fresh","juicy lyrics":"juicy-lyrics","chickity czech":"chickity-czech"};
/* label ids whose embed image is the generic Brighter Days logo (identical file, checked 2026-10-16) */
const GENERIC=new Set(['7093530','5503245','4165869','4489451','6049114','4019276','3946630']);
const find=(map,n)=>{if(map[n])return map[n];for(const k in map){if(k.length>=5&&(n===k||n.startsWith(k+' ')||n.endsWith(' '+k)||k.startsWith(n+' ')&&n.length>=5))return map[k]}return null};
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* sharp label sources (checked 2026-10-16): our own BUJU label at 500px; Untappd's largest (_hd) label files for guest beers. Anything not listed shows at native size, never upscaled. */
const HD={'4072729':'assets/img/cans/label-buju.webp?v=live3','1257352':'https://assets.untappd.com/site/beer_logos_hd/beer-1257352_2f424_hd.jpeg','5862':'https://assets.untappd.com/site/beer_logos_hd/beer-5862_a6978_hd.jpeg','8949':'https://assets.untappd.com/site/beer_logos_hd/beer-8949_e3792_hd.jpeg'};
let grid=null,last=-1,t=0;
function build(){const items=[...m.querySelectorAll('.menu-item')];if(!items.length||items.length===last)return;last=items.length;
 if(!grid){grid=document.createElement('ol');grid.className='alb-grid';grid.setAttribute('aria-label','On tap now');m.before(grid)}
 let real=0;
 grid.innerHTML=items.map((it,i)=>{const nm=(it.querySelector('.item-name a span')||it.querySelector('.item-name a'))?.textContent.trim()||'';
  const st=it.querySelector('.item-category')?.textContent.trim()||'',abv=it.querySelector('.item-abv')?.textContent.trim()||'',br=it.querySelector('.brewery')?.textContent.trim()||'';
  const bd=/brighter days/i.test(br),n=norm(nm),lab=it.querySelector('.item-label img')?.getAttribute('src')||'',lid=(lab.match(/(\d+)\s*$/)||[])[1],generic=lid&&GENERIC.has(lid);
  const c=bd&&find(CANS,n),a=!c&&bd&&find(ART,n);let cov,kind;
  const hd=lid&&HD[lid];
  if(c){cov=`<img class="can" src="assets/img/cans/${c}.webp?v=live3" alt="" loading="lazy" decoding="async">`;kind='can'}
  else if(a){cov=`<img src="assets/img/cans/art-${a}.webp?v=live3" alt="" loading="lazy" decoding="async">`;kind='art'}
  else if(hd){cov=`<img class="fit" src="${esc(hd)}" alt="" loading="lazy" decoding="async">`;kind='label'}
  else if(lab&&!generic){cov=`<img class="sm" src="${esc(lab)}" alt="" loading="lazy" decoding="async">`;kind='label'}
  else{cov=`<img class="logo" src="assets/img/logo/bd-logo-main-black.svg?v=live3" alt="" loading="lazy" decoding="async">`;kind='logo'}
  if(kind!=='logo')real++;
  return `<li class="alb" data-art="${kind}"><div class="cov">${cov}</div><p class="trk-n">Track ${String(i+1).padStart(2,'0')}</p><h3>${esc(nm)}</h3><p class="trk">${esc(st)}${abv?'<br>'+esc(abv):''}</p>${bd?'<span class="bd-tag b-bd">BD original</span>':(br?`<p class="trk">${esc(br)}</p>`:'')}</li>`}).join('');
 grid.querySelectorAll('img.fit,img.sm').forEach(im=>{const cap=()=>{if(im.naturalWidth){im.style.maxWidth='min(100%,'+im.naturalWidth/2+'px)';im.style.maxHeight='min(100%,'+im.naturalHeight/2+'px)'}};im.complete?cap():im.addEventListener('load',cap,{once:true})});/* never shown below 2 image px per CSS px, so small labels stay crisp instead of being blown up */
 grid.dataset.realArt=real+'/'+items.length;m.classList.add('alb-on')}
new MutationObserver(()=>{clearTimeout(t);t=setTimeout(build,300)}).observe(m,{childList:true,subtree:true});build()})();

/* Beer Playlist placeholders for songs not yet confirmed (no links, clearly marked). */
(()=>{const el=document.getElementById('pl');if(!el)return;
const TBD=['Endless Love','Marula','Summertime Magic','Double Trouble'];
function add(){const ol=el.querySelector('ol.playlist');if(!ol||ol.querySelector('.pl-tbd'))return;
 ol.insertAdjacentHTML('beforeend',TBD.map(b=>`<li class="pl-tbd"><div class="pl-beer"><strong>${b}</strong> <span class="pill gold">Song coming soon</span></div><div class="pl-song">🎵 Song to be announced</div></li>`).join(''))}
new MutationObserver(add).observe(el,{childList:true,subtree:true});add()})();
