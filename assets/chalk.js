/* Chalkboard events renderer (preview only). Uses window.BD_EVENTS (data/events.js) and upcoming()/esc() from site.js. */
const CH_ICONS={
guitar:'<svg viewBox="0 0 40 40"><path d="M27 4l5 5-9 9"/><path d="M30 2l4 4"/><path d="M19 17c-3-2-7-1-8 2-1 2-4 2-6 4-3 3-2 8 2 11s8 3 10 0c2-2 2-4 4-5 3-1 4-5 2-8z"/><circle cx="14" cy="25" r="2.2"/><path d="M10 29l3 3"/></svg>',
truck:'<svg viewBox="0 0 40 40"><path d="M3 12h22v16H3z"/><path d="M25 17h7l5 6v5H25"/><circle cx="10" cy="30" r="3"/><circle cx="30" cy="30" r="3"/><path d="M7 16h6v5H7zM16 16h5"/></svg>',
mic:'<svg viewBox="0 0 40 40"><rect x="15" y="4" width="10" height="17" rx="5"/><path d="M11 17c0 6 4 9 9 9s9-3 9-9M20 26v8M14 35h12"/><path d="M8 8l-3-2M32 8l3-2M7 14H3M33 14h4"/></svg>',
helmet:'<svg viewBox="0 0 40 40"><path d="M6 24c0-10 6-17 15-17s14 6 14 14v5H22l-3 6H11c-3 0-5-3-5-8z"/><path d="M22 26l10 0M27 21v10M33 31h-8"/><circle cx="19" cy="19" r="2"/></svg>',
bike:'<svg viewBox="0 0 40 40"><circle cx="9" cy="27" r="6"/><circle cx="31" cy="27" r="6"/><path d="M9 27l7-11h10l5 11M16 16l5 11h-12M24 12h4M15 13h4"/></svg>',
beer:'<svg viewBox="0 0 40 40"><path d="M9 11h16v23H9z"/><path d="M25 15h4c2 0 3 1 3 3v7c0 2-1 3-3 3h-4"/><path d="M9 11c0-3 2-5 5-5 1-2 4-2 6 0 3 0 5 2 5 5"/><path d="M14 17v12M20 17v12"/></svg>'};
const CH_LABEL={guitar:'Live music',truck:'Food truck',mic:'Open mic',helmet:'Game',bike:'Bike ride',beer:'Beer event'};
function chTypes(e){const t=String(e.title).toLowerCase(),out=[];
 if(/open mic/.test(t))out.push('mic');
 else if(e.musician||/live music|🎵|🎼|band|acoustic/.test(t))out.push('guitar');
 if(/\bbike\b|ride|\brun\b/.test(t))out.push('bike');
 if(/\bvs\.?\b|bucs|steelers|panthers|game|nfl|football/.test(t))out.push('helmet');
 if((e.trucks&&e.trucks.length)||/truck/.test(t))out.push('truck');
 if(/beer share|tasting|release|beer/.test(t)&&!out.length)out.push('beer');
 if(!out.length)out.push('beer');return out}
function chTitle(s){return String(s).replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF\uFE0F]/gu,'').replace(/\s+&\s+/g,' + ').replace(/\s+/g,' ').trim()}
function chTime(w){const m=String(w).match(/•\s*(\d{1,2}):(\d\d)\s*(AM|PM).*?•\s*(\d{1,2}):(\d\d)\s*(AM|PM)/);if(!m)return'';const f=(h,mi)=>h+(mi!=='00'?':'+mi:'');return m[3]===m[6]?`${f(m[1],m[2])}–${f(m[4],m[5])} ${m[6]}`:`${f(m[1],m[2])} ${m[3]}–${f(m[4],m[5])} ${m[6]}`}
function renderChalk(el,limit){let ev=upcoming();if(limit)ev=ev.slice(0,limit);
 if(!ev.length){el.innerHTML='<p class="ch-empty">No upcoming events posted yet. Check back soon or follow <a href="https://instagram.com/brighterdaysbrewco">@brighterdaysbrewco</a>.</p>';return}
 el.innerHTML='<ul class="ch-list">'+ev.map(e=>{const d=new Date(e.start),dow=d.toLocaleDateString('en-US',{weekday:'short'}).toUpperCase(),md=d.toLocaleDateString('en-US',{month:'short',day:'numeric'}).toUpperCase(),ty=chTypes(e);
 return `<li class="ch-row"><div class="ch-date">${dow}<b>${md}</b></div><div class="ch-ico" aria-hidden="true">${ty.map(k=>CH_ICONS[k]).join('')}</div><div class="ch-what"><a href="event.html?id=${esc(e.id)}"><span class="sr">${ty.map(k=>CH_LABEL[k]).join(', ')}: </span><span class="t">${esc(chTitle(e.title))}</span><span class="tm">${esc(chTime(e.when))}</span></a></div></li>`}).join('')+'</ul>'}
