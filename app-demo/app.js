(()=>{
const $=s=>document.querySelector(s), V=$('#view');
const LS=k=>JSON.parse(localStorage.getItem('bdDemo_'+k)||'null'), SS=(k,v)=>localStorage.setItem('bdDemo_'+k,JSON.stringify(v));
let pts=LS('pts')??3740; let freeAt=LS('freeAt')??0; let text=LS('text')??true; let won=LS('won')||[];
const fmt=n=>n.toLocaleString('en-US');
const worth=p=>'$'+Math.floor(p/100); // 10 pts per $1 spent; 100 pts ≈ $1 reward value
function setPts(n){pts=Math.max(0,n);SS('pts',pts);const c=$('#chip');c.textContent=fmt(pts)+' pts';c.classList.add('bump');setTimeout(()=>c.classList.remove('bump'),350);document.querySelectorAll('[data-pts]').forEach(e=>e.textContent=fmt(pts));document.querySelectorAll('[data-worth]').forEach(e=>e.textContent='worth '+worth(pts));}
const wave=n=>'<div class="wave">'+Array.from({length:n},(_,i)=>`<i style="height:${30+Math.abs(Math.sin(i*1.7))*70}%;animation-delay:${(i%7)*-.17}s"></i>`).join('')+'</div>';
function fizz(emoji){const f=$('#fizz');for(let i=0;i<28;i++){const e=document.createElement(emoji&&i%3==0?'b':'i');if(e.tagName=='B')e.textContent=emoji;else{const s=4+Math.random()*10;e.style.width=e.style.height=s+'px';}e.style.left=Math.random()*100+'%';e.style.setProperty('--dx',(Math.random()*60-30)+'px');e.style.animationDuration=(1.6+Math.random()*1.8)+'s';e.style.animationDelay=Math.random()*.5+'s';f.appendChild(e);setTimeout(()=>e.remove(),4200);}}
function modal(html){$('#mcard').innerHTML=html;$('#modal').hidden=false;}
$('#modal').onclick=e=>{if(e.target.id=='modal'||e.target.dataset.close!==undefined)$('#modal').hidden=true;};
const EV=(window.BD_EVENTS&&window.BD_EVENTS.events||[]).slice().sort((a,b)=>a.start.localeCompare(b.start));
const today=new Date();const ymd=d=>d.toISOString().slice(0,10);
const localYmd=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
const upcoming=EV.filter(e=>e.start.slice(0,10)>=localYmd);
const clean=t=>t.replace(/[🎵🎼🎶🎤🍣🌮🍕🍔]/gu,'').replace(/\s+&\s+$/,'').trim();
const tm=s=>new Date(s).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});

const screens={
home(){const ev=upcoming[0];const isToday=ev&&ev.start.slice(0,10)==localYmd;const h=today.getHours();
const nextR=[750,1500,2500,3500].find(r=>r>pts)||3500;
return `<h1 class="hello">${h<12?'Morning':h<17?'Afternoon':'Evening'}, Alex 🍻</h1><div class="sub">Demo guest · Brighter Days Brewing · Tarpon Springs</div>
<div class="box"><div class="sub">Your points</div><div class="big"><span data-pts>${fmt(pts)}</span></div><span class="worth" data-worth>worth ${worth(pts)}</span>
<div class="bar"><b style="width:${Math.min(100,pts/nextR*100)}%"></b></div><div class="sub">${pts>=nextR?'Reward ready!':fmt(nextR-pts)+' pts to your next reward'} · earn 10 pts per $1</div>${wave(34)}</div>
<div class="box promo"><div class="x2">2×</div><h2>Double Points Saturday</h2><div>Every dollar earns 20 pts all day this Saturday. Bring a friend 🍺</div></div>
${ev?`<div class="box"><div class="sub">${isToday?'Tonight':'Next up'} · ${new Date(ev.start).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} · ${tm(ev.start)}</div>
<div class="row" style="margin-top:10px"><div class="ic">🎵</div><div><h3 style="font-size:22px">${clean(ev.title.split('&')[0])}</h3><div class="sub">${ev.musician?'Live music':'At the taphouse'}</div></div></div>
${ev.trucks.length?`<div class="row" style="margin-top:10px"><div class="ic">🚚</div><div><h3 style="font-size:22px">${ev.trucks.join(', ')}</h3><div class="sub">Food truck on site</div></div></div>`:''}</div>`:''}
<div class="row" style="gap:10px"><button class="btn red" data-go="spin">🎡 Spin</button><button class="btn ghost" data-go="taps">On tap</button></div>
<p class="note">Prototype with demo data. Events are real, from the website feed.</p>`},

spin(){return `<h2 class="h2">Spin to Win</h2><div class="sub">Free spin every 3 days, or 100 pts a spin.</div>
<div class="wheelwrap"><div class="pointer"></div><canvas id="wheel" width="660" height="660"></canvas><div class="hub">BD</div></div>
<button class="btn red" id="free"></button><div style="height:10px"></div><button class="btn ghost" id="paid">Spin for 100 pts</button>
<div class="odds">Odds per spin: big prize (hat or shirt) 5% · small prize (pint, sticker, 50 pts) 20% · try again 75%.<br>Demo only. Real launch needs a Florida sweepstakes rules check.</div>`},

taps(){return `<h2 class="h2">On Tap</h2><div class="sub">Demo tap list using real Brighter Days beers. The live app would sync with Untappd.</div><div id="taplist"><div class="sub" style="padding:20px 0">Pouring…</div></div>`},

events(){return `<h2 class="h2">Events</h2><div class="sub">Live from the website feed (Untappd)</div>
${upcoming.length?upcoming.map(e=>{const d=new Date(e.start);return `<a class="ev" href="${e.url}" target="_blank" rel="noopener"><div class="date"><small>${d.toLocaleDateString('en-US',{month:'short'})}</small><b>${d.getDate()}</b><small style="color:var(--dim)">${d.toLocaleDateString('en-US',{weekday:'short'})}</small></div><div><h3 style="font-size:20px">${clean(e.title)}</h3><div class="sub">${tm(e.start)}</div><div style="margin-top:4px">${e.musician?'<span class="pill">🎵 Live music</span>':''}${e.trucks.map(t=>`<span class="pill">🚚 ${t}</span>`).join('')}</div></div></a>`}).join(''):'<div class="box">No upcoming events in the feed right now. Check back soon!</div>'}
<button class="btn ghost" style="margin-top:16px" onclick="alert('Demo: this would ping you before music nights.')">🔔 Remind me about music nights</button>`},

rewards(){const L=[[750,'🍺','Free pint'],[1500,'💵','$10 off your tab'],[2500,'🧢','BD hat'],[3500,'👕','BD shirt']];
const B=[['🚲','Trail Rider','Ride in on the Pinellas Trail 5 times',true],['🎸','Music Night Regular','4 music nights',true],['🚀','Release Day','Be there for a can release',false],['🍻','Flight Crew','Try 10 different beers',true],['🎂','Birthday Pint','Celebrate with us',false],['🌙','Night Owl','Last call ×3',false]];
return `<h2 class="h2">Rewards</h2><div class="sub">You have <b data-pts>${fmt(pts)}</b> pts (<span data-worth>worth ${worth(pts)}</span>)</div>
<div class="box ladder">${L.map(([p,i,n])=>`<div class="rung ${pts>=p?'ok':''}"><div class="ic">${i}</div><div><h3 style="font-size:20px">${n}</h3><div class="sub">${fmt(p)} pts</div></div><div class="need">${pts>=p?`<button class="redeem" data-redeem="${p}" data-name="${n}" data-i="${i}">Redeem</button>`:fmt(p-pts)+' to go'}</div></div>`).join('')}</div>
<h2 class="h2" style="font-size:24px">Badges</h2><div class="box badges">${B.map(([i,n,d,u])=>`<div class="badge ${u?'':'lock'}" title="${d}"><div class="medal">${i}</div><b>${n}</b><div class="sub" style="font-size:11px">${d}</div></div>`).join('')}</div>
${won.length?`<h2 class="h2" style="font-size:24px">Prizes to claim</h2><div class="box">${won.map(w=>`<div class="row" style="padding:6px 0"><div class="ic">${w.i}</div><div><b>${w.n}</b><div class="sub">Code ${w.c}</div></div></div>`).join('')}</div>`:''}`},

me(){return `<h2 class="h2">Me</h2><div class="box row"><div class="ic" style="border-radius:50%">A</div><div><h3 style="font-size:22px">Alex Demo</h3><div class="sub">Member since Oct 2026 · (727) 555-0142</div></div></div>
<button class="wallet" id="wallet"><svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M16.4 12.6c0-2.4 2-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.2.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.5 1.3-2.6 0 0-2.5-1-2.5-3.6zM14.2 5.5c.6-.8 1.1-1.8 1-2.9-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.8 1 .1 2.1-.5 2.7-1.3z"/></svg>Add to Apple Wallet (demo)</button>
<div id="passslot"></div>
<div class="box"><div class="row"><div class="ic">💳</div><div><b>Linked card ••4242</b><div class="sub">Earns points automatically every time you pay. No app, no QR code.</div></div></div>
<div class="row" style="margin-top:12px"><div class="ic">📱</div><div><b>Apple Pay</b><div class="sub">Linked: tap to pay, points land on their own</div></div></div></div>
<div class="box"><div class="row"><div class="ic">💬</div><div><b>Text club</b><div class="sub">New beers, music nights and double points days. About 4 texts a month. Reply STOP anytime.</div></div><label class="toggle"><input type="checkbox" id="txt" ${text?'checked':''}><span></span></label></div></div>
<button class="btn ghost" id="reset">Reset demo</button><p class="note">Brighter Days app prototype · demo data · not a real account</p>`}
};

let cur='home';
function go(t){cur=t;V.innerHTML=`<div class="screen">${screens[t]()}</div>`;document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t==t));scrollTo(0,0);(after[t]||(()=>{}))();history.replaceState(null,'','#'+t);}
document.getElementById('tabs').onclick=e=>{const b=e.target.closest('button');if(b)go(b.dataset.t)};
V.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g)go(g.dataset.go);const r=e.target.closest('[data-redeem]');if(r){const p=+r.dataset.redeem;setPts(pts-p);modal(`<div class="prize">${r.dataset.i}</div><h2>${r.dataset.name}</h2><div class="ticket">BD-${Math.random().toString(36).slice(2,7).toUpperCase()}</div><div class="sub">Show this at the counter</div><br><button class="btn" data-close>Cheers!</button>`);fizz('🍺');go('rewards');}});

// wheel: 8 slices
const SL=[['🍺','Free pint','s'],['😅','Try again','x'],['✨','Sticker','s'],['😅','Try again','x'],['🧢','BD hat','b'],['😅','Try again','x'],['⭐','+50 pts','s'],['👕','BD shirt','b']];
let rot=0,spinning=false;
function draw(){const c=$('#wheel');if(!c)return;const x=c.getContext('2d'),R=330,n=SL.length,a=2*Math.PI/n;x.clearRect(0,0,660,660);
SL.forEach((s,i)=>{x.beginPath();x.moveTo(R,R);x.arc(R,R,R-6,i*a-Math.PI/2-a/2,(i+1)*a-Math.PI/2-a/2);x.closePath();x.fillStyle=s[2]=='b'?'#e2312d':s[2]=='s'?'#2b2b2b':'#161616';x.fill();x.strokeStyle='#f4f1ea';x.lineWidth=4;x.stroke();
x.save();x.translate(R,R);x.rotate(i*a);x.textAlign='center';x.font='64px sans-serif';x.fillText(s[0],0,-R+100);x.fillStyle='#f4f1ea';x.font='bold 30px "BD Chalk",sans-serif';x.fillText(s[1],0,-R+150);x.restore();});
x.beginPath();x.arc(R,R,R-4,0,7);x.lineWidth=8;x.strokeStyle='#f4f1ea';x.stroke();}
function pick(){const r=Math.random();if(r<.03)return 4;if(r<.05)return 7;if(r<.12)return 2;if(r<.19)return 6;if(r<.25)return 0;return[1,3,5][Math.floor(Math.random()*3)];}
function spin(paid){if(spinning)return;if(paid){if(pts<100)return alert('Not enough points (demo)');setPts(pts-100);}else{freeAt=Date.now()+3*864e5;SS('freeAt',freeAt);}
spinning=true;updBtns();const i=pick(),a=360/SL.length;const jitter=(Math.random()-.5)*a*.6;rot+=360*6+((360-i*a-(rot%360))+360)%360+jitter;rot-=jitter; rot+=jitter;
$('#wheel').style.transform=`rotate(${rot}deg)`;
setTimeout(()=>{spinning=false;updBtns();const s=SL[i];if(s[2]=='x'){modal(`<div class="prize">😅</div><h2>So close!</h2><p class="sub">No prize this time. Grab a pint and try again.</p><button class="btn" data-close>OK</button>`);return;}
if(i==6)setPts(pts+50);const code='BD-'+Math.random().toString(36).slice(2,7).toUpperCase();if(i!=6){won.unshift({i:s[0],n:s[1],c:code});SS('won',won);}
modal(`<div class="prize">${s[0]}</div><h2>You won ${s[2]=='b'?'big! ':''}${s[1]}!</h2>${i==6?'<p class="sub">50 bonus points added to your balance.</p>':`<div class="ticket">${code}</div><p class="sub"><b style="color:var(--chalk)">Show this at the counter</b> to claim. Saved in Rewards.</p>`}<button class="btn red" data-close>Cheers!</button>`);fizz(s[0]);},4700);}
let tick;
function updBtns(){const f=$('#free'),p=$('#paid');if(!f)return;const left=freeAt-Date.now();
if(left<=0){f.disabled=spinning;f.textContent='🎁 Free spin ready!';}else{f.disabled=true;const d=Math.floor(left/864e5),h=Math.floor(left%864e5/36e5),m=Math.floor(left%36e5/6e4),s=Math.floor(left%6e4/1e3);f.textContent=`Next free spin in ${d}d ${h}h ${m}m ${String(s).padStart(2,'0')}s`;}
p.disabled=spinning||pts<100;}
const after={
spin(){draw();$('#wheel').style.transition='none';$('#wheel').style.transform=`rotate(${rot}deg)`;requestAnimationFrame(()=>$('#wheel').style.transition='');document.fonts.ready.then(draw);$('#free').onclick=()=>spin(false);$('#paid').onclick=()=>spin(true);updBtns();clearInterval(tick);tick=setInterval(()=>cur=='spin'?updBtns():clearInterval(tick),1000);},
async taps(){let beers=[];try{beers=await (await fetch('../data/beer-songs.json')).json();}catch(e){}
const cans={'Bicycle Race':'bicycle-race','Raspberry Beret':'raspberry-beret','Double Trouble':'double-trouble','Summertime Magic':'summertime-magic','Bright Lights':'bright-lights','Endless Love':'endless-love','Marula':'marula','Sabrosa':'sabrosa','Universal Love':'universal-love'};
const pickN=['Brighter Days IPA','Bright Lights','Bicycle Race','Chickity Czech','Endless Love','Raspberry Beret','Summertime Magic','Sabrosa','Marula','Double Trouble','Oktoberfest','Tin Roof Rusted','Midnight Marauders'];
const list=pickN.map(n=>beers.find(b=>b.beer==n)).filter(Boolean);const el=$('#taplist');if(!el)return;
el.innerHTML=list.map((b,k)=>`<div class="beer">${cans[b.beer]?`<img class="can" loading="lazy" src="../assets/img/cans/${cans[b.beer]}.webp" alt="">`:`<div class="canph">${[5,9,14,8,12,6,10].map((h,j)=>`<i style="height:${h*3}px"></i>`).join('')}</div>`}<div><h3>${b.beer}</h3><div class="s">${b.style}</div>${b.song?`<div class="song">♪ ${b.song}${b.artist?' · '+b.artist:''}</div>`:''}</div><div class="abv">${b.abv}</div></div>`).join('')||'<div class="box">Tap list unavailable (demo).</div>';},
me(){$('#txt').onchange=e=>{text=e.target.checked;SS('text',text);if(text)fizz('🎵');};
$('#wallet').onclick=()=>{$('#passslot').innerHTML=`<div class="pass"><div class="row" style="justify-content:space-between"><img src="../assets/img/logo/bd-logo-main-white.svg" style="height:28px"><div style="text-align:right"><div class="sub" style="font-size:11px">POINTS</div><b data-pts style="font-size:22px">${fmt(pts)}</b></div></div><div class="sub" style="margin-top:12px">ALEX DEMO · MEMBER</div><svg class="qr" viewBox="0 0 21 21">${Array.from({length:441},(_,i)=>((i*7919)%13<6||(i%21<7&&i<147&&(i%21==0||i%21==6||i<21||(i>=126&&i<147))))?`<rect x="${i%21}" y="${Math.floor(i/21)}" width="1" height="1"/>`:'').join('')}</svg><div class="sub" style="text-align:center;font-size:11px;margin-top:6px">DEMO PASS · not scannable</div></div>`;fizz();};
$('#reset').onclick=()=>{Object.keys(localStorage).filter(k=>k.startsWith('bdDemo_')).forEach(k=>localStorage.removeItem(k));location.hash='';location.reload();};}
};
setPts(pts);go((location.hash.slice(1) in screens)?location.hash.slice(1):'home');
})();
