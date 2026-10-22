/* Live from the stage: reads data/live.json and, only when the channel is known to be live,
   swaps the static "no stream" fallback for a click-to-load play button.
   Nothing from YouTube (iframe, JS, thumbnails) loads until the visitor clicks Play.
   Config (data/live.json): {"channelId":"", "isLive":false, "liveVideoId":"", "checkedAt":""}
   - channelId empty  -> always the fallback (current state).
   - isLive is written by scripts/check_youtube_live.py from the 30-minute workflow; it is ignored
     if checkedAt is more than 2 hours old, so a stalled workflow can't leave a dead player up. */
(function(){
  var MAX_AGE_MS=2*60*60*1000;
  function liveNow(c){
    if(!c||!/^UC[\w-]{22}$/.test(c.channelId||''))return false;
    if(c.isLive!==true)return false;
    var t=Date.parse(c.checkedAt||'');
    return !isNaN(t)&&Date.now()-t<MAX_AGE_MS;
  }
  function src(c){
    var q='autoplay=1&rel=0&modestbranding=1&playsinline=1';
    var base='https://www.youtube-nocookie.com/embed/';
    if(/^[\w-]{11}$/.test(c.liveVideoId||''))return base+c.liveVideoId+'?'+q;
    return base+'live_stream?channel='+encodeURIComponent(c.channelId)+'&'+q;
  }
  function facade(box,c){
    var b=document.createElement('button');
    b.type='button';b.className='live-play';
    b.setAttribute('aria-label','Play the live stream from the Brighter Days stage (loads a YouTube player)');
    b.innerHTML='<span class="live-badge">LIVE NOW</span>'+
      '<span class="live-btn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>Watch live</span>';
    b.addEventListener('click',function(){
      var f=document.createElement('iframe');
      f.src=src(c);
      f.title='Live from the stage at Brighter Days Brewing Company (YouTube video player)';
      f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.setAttribute('allowfullscreen','');
      f.referrerPolicy='strict-origin-when-cross-origin';
      box.replaceChildren(f);
      f.focus();
    },{once:true});
    box.replaceChildren(b);
    var n=box.parentNode.querySelector('.live-note');if(n)n.hidden=false;
  }
  function apply(c){
    var on=liveNow(c);
    document.querySelectorAll('[data-live-box]').forEach(function(box){if(on)facade(box,c);});
    document.querySelectorAll('.live-link').forEach(function(a){
      if(!on)return;a.classList.add('on');var t=a.querySelector('.live-txt');if(t)t.textContent='Live now from the stage →';
    });
  }
  window.BDLive={apply:apply,liveNow:liveNow};
  var s=document.currentScript,url=(s&&s.getAttribute('data-config'))||'data/live.json';
  if(!window.fetch)return;
  fetch(url,{cache:'no-cache'}).then(function(r){return r.ok?r.json():null}).then(function(c){if(c)apply(c)}).catch(function(){});
})();
