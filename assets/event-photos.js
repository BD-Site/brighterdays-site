/* Static photo map for events (hand-maintained; NOT part of the auto-generated data/events files).
   Keyed by the Untappd event id, with a title+date fallback in case the id ever changes. */
window.BD_EVENT_PHOTOS={
 "1007173":{match:{title:"bd bikes and brews",date:"2026-10-18"},photos:[
  {base:"assets/img/events/bike-20261018-landscape",w:5712,h:4284,max:2400,alt:"A group of cyclists in helmets standing with their bikes on the sidewalk under palm trees and the Brighter Days Brew Co. banner"},
  {base:"assets/img/events/bike-20261018-portrait",w:4284,h:5712,max:2400,alt:"Cyclists lined up with their bikes under the Brighter Days Brew Co. banner, with palm trees and an oak tree overhead on a sunny day"}]}
};
(()=>{const M=window.BD_EVENT_PHOTOS||{},V='bike1';
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
const byId=id=>M[id];
const byTitle=(t,d)=>Object.values(M).find(e=>e.match&&norm(t).includes(e.match.title)&&(!d||String(d).startsWith(e.match.date)));
const pic=p=>{const ws=[800,1600,2400].filter(w=>w<=p.max);return `<figure class="evp-f"><picture><source type="image/webp" sizes="(max-width:760px) 46vw, 260px" srcset="${ws.map(w=>`${p.base}-w${w}.webp?v=${V} ${w}w`).join(', ')}"><img src="${p.base}-w1600.jpg?v=${V}" srcset="${p.base}-w800.jpg?v=${V} 800w, ${p.base}-w1600.jpg?v=${V} 1600w" sizes="(max-width:760px) 46vw, 260px" alt="${p.alt.replace(/"/g,'&quot;')}" loading="lazy" decoding="async" width="${p.w}" height="${p.h}"></picture></figure>`};
function add(root){root.querySelectorAll('li.ch-row').forEach(li=>{if(li.nextElementSibling&&li.nextElementSibling.classList.contains('evp'))return;
 const a=li.querySelector('a[href*="event.html?id="]'),id=a&&new URL(a.getAttribute('href'),location.href).searchParams.get('id');
 const ev=(window.BD_EVENTS&&BD_EVENTS.events||[]).find(e=>e.id===id);const m=byId(id)||(ev&&byTitle(ev.title,ev.start));if(!m)return;
 const x=document.createElement('li');x.className='evp';x.innerHTML=`<div class="evp-g">${m.photos.map(pic).join('')}</div>`;li.after(x)})}
const roots=['homeWeek','ev'].map(i=>document.getElementById(i)).filter(Boolean);
roots.forEach(r=>{add(r);new MutationObserver(()=>add(r)).observe(r,{childList:true,subtree:true})})})();
