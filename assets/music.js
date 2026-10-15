/* Music theme (preview only): tap-to-spin vinyl on song cards. No libraries. */
document.addEventListener('click',e=>{const li=e.target.closest('.playlist li');if(!li||e.target.closest('a'))return;li.classList.toggle('spin')});
