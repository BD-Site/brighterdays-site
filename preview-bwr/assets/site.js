document.getElementById('menuBtn').onclick=()=>document.querySelector('nav').classList.toggle('open');
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmtDate=iso=>new Date(iso).toLocaleString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
function upcoming(){const d=window.BD_EVENTS;if(!d)return[];const t=new Date();t.setHours(0,0,0,0);return d.events.filter(e=>e.start&&new Date(e.start)>=t)}
function renderEvents(el,limit){let ev=upcoming();if(limit)ev=ev.slice(0,limit);el.innerHTML=ev.length?'<div class="grid">'+ev.map(e=>`<div class="card"><div class="small">${esc(e.when.replace(/ - .*• /,' – '))}</div><h3 style="margin:.2rem 0"><a href="event.html?id=${esc(e.id)}">${esc(e.title)}</a></h3>${e.trucks.length?`<span class="pill">🚚 Food truck</span>`:''}<a class="small" href="event.html?id=${esc(e.id)}">Who's playing &amp; eating →</a></div>`).join('')+'</div>':'<p>No upcoming events posted yet. Check back soon or follow <a href="https://instagram.com/brighterdaysbrewco">@brighterdaysbrewco</a>.</p>'}
// ---- event detail matching (data/performers.json + data/foodtrucks.json are the single source of truth)
const norm=s=>String(s||'').toLowerCase().replace(/[‘’`]/g,"'").replace(/[^a-z0-9' ]/g,' ').replace(/\s+/g,' ').trim();
function titleParts(t){return String(t).replace(/^\s*live music\s*[-–:]\s*/i,'').split(/\s(?:&|\+|and|w\/|with)\s/i).map(p=>p.replace(/[^\p{L}\p{N}\s'‘’.&-]/gu,'').trim()).filter(Boolean)}
function findEntry(part,list){const n=norm(part);return list.find(x=>[x.name,...(x.aliases||[])].some(a=>norm(a)===n))||list.find(x=>[x.name,...(x.aliases||[])].some(a=>{const k=norm(a);return k.length>3&&(n.includes(k))}))}
async function loadJSON(u){try{const r=await fetch(u);return r.ok?await r.json():[]}catch(_){return[]}}
function entryCard(x,kind){const L=x.links||{};const links=[['website','Website'],['instagram','Instagram'],['facebook','Facebook'],['spotify','Spotify']].filter(([k])=>L[k]).map(([k,l])=>`<a href="${esc(L[k])}" target="_blank" rel="noopener">${l}</a>`).join(' · ');
 const img=x.photo?`<img src="${esc(x.photo)}" alt="${esc(x.name)}" class="ecard-img">`:`<div class="ecard-img ph-img" aria-hidden="true">${kind==='truck'?'🚚':'🎵'}</div>`;
 const sub=kind==='truck'?x.cuisine:x.genre;const body=kind==='truck'?x.menu:x.bio;
 const href=L.website||L.instagram||L.facebook||L.spotify;
 return `<div class="card ecard">${img}<div><span class="pill">${kind==='truck'?'Food truck':'Performer'}</span><h3>${href?`<a href="${esc(href)}" target="_blank" rel="noopener">${esc(x.name)}</a>`:esc(x.name)}</h3>${sub?`<div class="style">${esc(sub)}</div>`:''}${body?`<p>${esc(body)}</p>`:''}${links?`<p class="small">${links}</p>`:''}</div></div>`}
// ---- Beer Playlist (data/beer-songs.json; only confirmed:true entries are shown)
async function renderPlaylist(el,limit){const all=await loadJSON('data/beer-songs.json');let l=all.filter(x=>x.confirmed);if(!l.length){el.closest('section')?.remove();return}
 if(limit)l=l.sort(()=>Math.random()-.5).slice(0,limit);
 el.innerHTML='<ol class="playlist">'+l.map(x=>{const link=x.spotify||x.youtube;return `<li><div class="pl-beer"><strong>${esc(x.beer)}</strong><span class="small">${esc(x.style)}${x.abv?' · '+esc(x.abv)+' ABV':''}</span></div><div class="pl-song">🎵 ${link?`<a href="${esc(link)}" target="_blank" rel="noopener">${esc(x.song)}</a>`:esc(x.song)} <span class="small">by ${esc(x.artist)}</span></div></li>`}).join('')+'</ol>'}
