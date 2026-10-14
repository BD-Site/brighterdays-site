/* Tags each tap-list item "BD original" or "Guest" from the brewery name the menu embed itself shows. Nothing is guessed: items with no brewery text get no tag. */
(()=>{const m=document.getElementById('menu-container');if(!m)return;
function tag(){m.querySelectorAll('.menu-item').forEach(it=>{if(it.dataset.bdTagged)return;const br=it.querySelector('.brewery');if(!br)return;const bd=/brighter days/i.test(br.textContent);
const s=document.createElement('span');s.className='bd-tag '+(bd?'b-bd':'b-guest');s.textContent=bd?'BD original':'Guest';const d=it.querySelector('.item-details')||it;d.prepend(s);it.dataset.bdTagged='1'})}
new MutationObserver(tag).observe(m,{childList:true,subtree:true});tag()})();
