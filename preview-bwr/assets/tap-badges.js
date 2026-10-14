/* Tags each tap-list item "BD original" or "Guest" from the brewery name the menu embed itself shows. Nothing is guessed: items with no brewery text get no tag. */
(()=>{const m=document.getElementById('menu-container');if(!m)return;
function tag(){m.querySelectorAll('.menu-item').forEach(it=>{if(it.dataset.bdTagged)return;const br=it.querySelector('.brewery');if(!br)return;const bd=/brighter days/i.test(br.textContent);
const s=document.createElement('span');s.className='bd-tag '+(bd?'b-bd':'b-guest');s.textContent=bd?'BD original':'Guest';const d=it.querySelector('.item-details')||it;d.prepend(s);it.dataset.bdTagged='1'})}
new MutationObserver(tag).observe(m,{childList:true,subtree:true});tag()})();

/* Small can art next to exact-name matches on Brighter Days items only. Unknown names get nothing. */
(()=>{const m=document.getElementById('menu-container');if(!m)return;
const CANS={"raspberry beret":"raspberry-beret","endless love":"endless-love","bicycle race":"bicycle-race","marula":"marula","bright lights":"bright-lights","sabrosa":"sabrosa","summertime magic":"summertime-magic","2nd hand raspberry beret":"2nd-hand-raspberry-beret","universal love":"universal-love"};
function th(){m.querySelectorAll('.menu-item').forEach(it=>{if(it.dataset.bdCan)return;it.dataset.bdCan='1';const br=it.querySelector('.brewery');if(!br||!/brighter days/i.test(br.textContent))return;
const n=it.querySelector('.item-name a span');if(!n)return;const k=CANS[n.textContent.trim().toLowerCase()];if(!k)return;
const i=document.createElement('img');i.className='tap-can';i.src='assets/img/cans/'+k+'.webp';i.alt='';i.width=20;i.height=48;i.loading='lazy';n.after(i)})}
new MutationObserver(th).observe(m,{childList:true,subtree:true});th()})();
