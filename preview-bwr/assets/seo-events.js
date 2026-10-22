/* Event JSON-LD, built in the browser from window.BD_EVENTS (data/events.js).
   data/events.js is refreshed by the scheduled GitHub Action, so this markup
   updates automatically; nothing here is hand-entered. */
(function(){
  var D=window.BD_EVENTS; if(!D||!Array.isArray(D.events)) return;
  var SITE='https://brighterdaysbeer.com/';
  var IMG=SITE+'assets/img/og/brighter-days-cans-1200x630.jpg';
  var MON={Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12};
  function pad(n){return (n<10?'0':'')+n}
  function off(abbr,y,m,d,h,mi){
    if(abbr==='EDT') return '-04:00'; if(abbr==='EST') return '-05:00';
    try{var p=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',timeZoneName:'shortOffset'}).formatToParts(new Date(Date.UTC(y,m-1,d,h+5,mi)));
      var z=(p.find(function(x){return x.type==='timeZoneName'})||{}).value||'';var r=/GMT([+-])(\d+)/.exec(z);if(r)return r[1]+pad(+r[2])+':00'}catch(e){}
    return '';
  }
  function clean(t){return String(t||'').replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\uFE0F\u200D]/gu,'').replace(/\s+/g,' ').trim()}
  var place={'@type':'Place','name':'Brighter Days Brewing Company','address':{'@type':'PostalAddress','streetAddress':'311 N Safford Ave','addressLocality':'Tarpon Springs','addressRegion':'FL','postalCode':'34689','addressCountry':'US'}};
  var org={'@type':'Organization','@id':SITE+'#brewery','name':'Brighter Days Brewing Company','url':SITE};
  var only=document.documentElement.getAttribute('data-ld-event')==='id'?new URLSearchParams(location.search).get('id'):null;
  /* Pages with a static Event JSON-LD block (written by scripts/render_events.py) need nothing injected. */
  if(!only&&document.querySelector('script#bd-events-ld[data-static]')) return;
  var now=Date.now(),out=[];
  D.events.forEach(function(e){
    if(!e||!e.id||!e.start) return; if(only&&e.id!==only) return;
    var s=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(e.start); if(!s) return;
    var y=+s[1],m=+s[2],d=+s[3],h=+s[4],mi=+s[5];
    var when=String(e.when||''); var tz=(/\b(EDT|EST)\b/.exec(when)||[])[1];
    var so=off(tz,y,m,d,h,mi); var start=e.start.slice(0,16)+':00'+so;
    var end=null,endMs=null;
    var r=/ - \w+, (\w{3}) (\d{1,2})\w* • (\d{1,2}):(\d{2}) (AM|PM)(?: (EDT|EST))?/.exec(when);
    if(r&&MON[r[1]]){var em=MON[r[1]],ed=+r[2],eh=(+r[3])%12+(r[5]==='PM'?12:0),emi=+r[4],ey=em<m?y+1:y;
      var eo=off(r[6]||tz,ey,em,ed,eh,emi);end=ey+'-'+pad(em)+'-'+pad(ed)+'T'+pad(eh)+':'+pad(emi)+':00'+eo;endMs=Date.parse(end)}
    var startMs=Date.parse(start); var last=endMs||(startMs+3*3600e3);
    if(!only&&isFinite(last)&&last<now) return;
    var name=clean(e.title); if(!name) return;
    var ev={'@context':'https://schema.org','@type':'Event','name':name,'startDate':start,
      'eventStatus':'https://schema.org/EventScheduled','eventAttendanceMode':'https://schema.org/OfflineEventAttendanceMode',
      'location':place,'organizer':org,'image':[IMG],'url':SITE+'event.html?id='+encodeURIComponent(e.id),
      'description':name+' at Brighter Days Brewing Company, 311 N Safford Ave, Tarpon Springs, FL.'};
    if(end) ev.endDate=end;
    out.push(ev);
  });
  if(!out.length) return;
  var old=document.getElementById('bd-events-ld'); if(old) old.remove();
  var el=document.createElement('script'); el.type='application/ld+json'; el.id='bd-events-ld';
  el.textContent=JSON.stringify(out.slice(0,25)); document.head.appendChild(el);
  if(only){var c=document.querySelector('link[rel=canonical]'); if(c) c.href=SITE+'event.html?id='+encodeURIComponent(only);}
})();
