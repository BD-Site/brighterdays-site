#!/usr/bin/env python3
"""Render upcoming events as static HTML + Event JSON-LD into marker blocks, so crawlers and
voice assistants that don't run JavaScript can read them.

Source of truth: data/events.json (written only by scripts/update_untappd.py from the Untappd scrape).
Nothing here is hand-entered. Only the text BETWEEN these marker comments is ever rewritten:
  <!-- EVENTS:START --> ... <!-- EVENTS:END -->        (inside <div id="ev"> / <div id="homeWeek">)
  <!-- EVENTS-LD:START --> ... <!-- EVENTS-LD:END -->  (in <head>)
The visible markup is a byte-for-byte port of renderChalk() in assets/chalk.js (+ linkTitle() in
assets/site.js), so the JS replaces it with identical markup (no flash, no duplicates).

Usage: python3 scripts/render_events.py PAGE.html [PAGE.html ...]   (paths relative to repo root)
       index.html pages get the 'This Week' board (6 events); every other page gets the full list.
Exits non-zero (writing nothing) if the data is missing/empty or a page lacks its markers."""
import datetime, html, json, os, re, sys
from zoneinfo import ZoneInfo

REPO = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
TZ = ZoneInfo("America/New_York")
SITE = "https://brighterdaysbeer.com/"
IMG = SITE + "assets/img/og/brighter-days-cans-1200x630.jpg"
HOME_LIMIT = 6
LD_LIMIT = 25
M_START, M_END = "<!-- EVENTS:START -->", "<!-- EVENTS:END -->"
L_START, L_END = "<!-- EVENTS-LD:START -->", "<!-- EVENTS-LD:END -->"

CH_ICONS = {
 "guitar": '<svg viewBox="0 0 40 40"><path d="M27 4l5 5-9 9"/><path d="M30 2l4 4"/><path d="M19 17c-3-2-7-1-8 2-1 2-4 2-6 4-3 3-2 8 2 11s8 3 10 0c2-2 2-4 4-5 3-1 4-5 2-8z"/><circle cx="14" cy="25" r="2.2"/><path d="M10 29l3 3"/></svg>',
 "truck": '<svg viewBox="0 0 40 40"><path d="M3 12h22v16H3z"/><path d="M25 17h7l5 6v5H25"/><circle cx="10" cy="30" r="3"/><circle cx="30" cy="30" r="3"/><path d="M7 16h6v5H7zM16 16h5"/></svg>',
 "mic": '<svg viewBox="0 0 40 40"><rect x="15" y="4" width="10" height="17" rx="5"/><path d="M11 17c0 6 4 9 9 9s9-3 9-9M20 26v8M14 35h12"/><path d="M8 8l-3-2M32 8l3-2M7 14H3M33 14h4"/></svg>',
 "helmet": '<svg viewBox="0 0 40 40"><path d="M6 24c0-10 6-17 15-17s14 6 14 14v5H22l-3 6H11c-3 0-5-3-5-8z"/><path d="M22 26l10 0M27 21v10M33 31h-8"/><circle cx="19" cy="19" r="2"/></svg>',
 "bike": '<svg viewBox="0 0 40 40"><circle cx="9" cy="27" r="6"/><circle cx="31" cy="27" r="6"/><path d="M9 27l7-11h10l5 11M16 16l5 11h-12M24 12h4M15 13h4"/></svg>',
 "beer": '<svg viewBox="0 0 40 40"><path d="M9 11h16v23H9z"/><path d="M25 15h4c2 0 3 1 3 3v7c0 2-1 3-3 3h-4"/><path d="M9 11c0-3 2-5 5-5 1-2 4-2 6 0 3 0 5 2 5 5"/><path d="M14 17v12M20 17v12"/></svg>'}
CH_LABEL = {"guitar": "Live music", "truck": "Food truck", "mic": "Open mic", "helmet": "Game", "bike": "Bike ride", "beer": "Beer event"}
EMPTY = '<p class="ch-empty">No upcoming events posted yet. Check back soon or follow <a href="https://instagram.com/brighterdaysbrewco">@brighterdaysbrewco</a>.</p>'
MON = {m: i for i, m in enumerate("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(), 1)}

def esc(s):  # same 4 chars as esc() in site.js
    return str(s if s is not None else "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")

def norm(s):  # norm() in site.js
    s = re.sub(r"[‘’`]", "'", str(s or "").lower())
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9' ]", " ", s)).strip()

def find_entry(part, lst):  # findEntry() in site.js
    n = norm(part)
    names = lambda x: [x.get("name", "")] + list(x.get("aliases") or [])
    for x in lst:
        if any(norm(a) == n for a in names(x)): return x
    for x in lst:
        if any(len(norm(a)) > 3 and norm(a) in n for a in names(x)): return x
    return None

def truck_url(x):
    L = (x or {}).get("links") or {}
    return L.get("website") or L.get("instagram") or L.get("facebook") or ""

def core_of(p):  # p.replace(/[^\p{L}\p{N}\s'‘’.&-]/gu,'').trim()
    return "".join(c for c in p if c.isalpha() or c.isdigit() or c.isspace() or c in "'‘’.&-").strip()

def link_title(title, wrap, trucks):  # linkTitle() in site.js
    out = []
    for i, p in enumerate(re.split(r"(\s(?:&|\+|and|w/|with)\s)", str(title), flags=re.I)):
        if i % 2: out.append(esc(p)); continue
        core = core_of(p); x = find_entry(core, trucks) if core else None; u = truck_url(x)
        if u:
            out.append(f'<a class="trk" href="{esc(u)}" target="_blank" rel="noopener">{esc(core)}</a>'.join(esc(s) for s in p.replace(core, "\0").split("\0")))
        else:
            out.append(wrap(p))
    return "".join(out)

EMOJI_CH = re.compile("[\U0001F300-\U0001FAFF\u2600-\u27BF\uFE0F]")
def ch_title(s):  # chTitle() in chalk.js
    return re.sub(r"\s+", " ", re.sub(r"\s+&\s+", " + ", EMOJI_CH.sub("", str(s)))).strip()

def ch_time(w):  # chTime() in chalk.js
    m = re.search(r"•\s*(\d{1,2}):(\d\d)\s*(AM|PM).*?•\s*(\d{1,2}):(\d\d)\s*(AM|PM)", str(w))
    if not m: return ""
    f = lambda h, mi: h + (":" + mi if mi != "00" else "")
    return f"{f(m[1], m[2])}–{f(m[4], m[5])} {m[6]}" if m[3] == m[6] else f"{f(m[1], m[2])} {m[3]}–{f(m[4], m[5])} {m[6]}"

def ch_types(e):  # chTypes() in chalk.js
    t = str(e.get("title", "")).lower(); out = []
    if re.search(r"open mic", t): out.append("mic")
    elif e.get("musician") or re.search(r"live music|🎵|🎼|band|acoustic", t): out.append("guitar")
    if re.search(r"\bbike\b|ride|\brun\b", t, re.A): out.append("bike")
    if re.search(r"\bvs\.?\b|bucs|steelers|panthers|game|nfl|football", t, re.A): out.append("helmet")
    if e.get("trucks") or "truck" in t: out.append("truck")
    if re.search(r"beer share|tasting|release|beer", t) and not out: out.append("beer")
    if not out: out.append("beer")
    return out

def start_dt(e):
    try: return datetime.datetime.fromisoformat(e["start"]).replace(tzinfo=TZ)
    except Exception: return None

def end_dt(e, s):
    r = re.search(r" - \w+, (\w{3}) (\d{1,2})\w* • (\d{1,2}):(\d{2}) (AM|PM)", str(e.get("when", "")))
    if not (r and r[1] in MON): return None
    em, ed = MON[r[1]], int(r[2]); eh = int(r[3]) % 12 + (12 if r[5] == "PM" else 0)
    ey = s.year + 1 if em < s.month else s.year
    return datetime.datetime(ey, em, ed, eh, int(r[4]), tzinfo=TZ)

def iso(d):  # 2026-10-22T18:00:00-04:00 (DST-aware via zoneinfo)
    return d.isoformat(timespec="seconds")

def upcoming(events, now):  # upcoming() in site.js: start >= local midnight today (Eastern)
    midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
    return [e for e in events if e.get("start") and start_dt(e) and start_dt(e) >= midnight]

def render_list(evs, trucks):
    if not evs: return EMPTY
    rows = []
    for e in evs:
        d = start_dt(e); ty = ch_types(e); href = f'event.html?id={esc(e["id"])}'
        wrap = lambda t, h=href: '<a href="' + h + '">' + esc(t) + '</a>'
        linked = link_title(ch_title(e["title"]), wrap, trucks)
        rows.append(f'<li class="ch-row"><div class="ch-date">{d.strftime("%a").upper()}<b>{(d.strftime("%b") + " " + str(d.day)).upper()}</b></div>'
                    f'<div class="ch-ico" aria-hidden="true">{"".join(CH_ICONS[k] for k in ty)}</div>'
                    f'<div class="ch-what"><span class="sr">{", ".join(CH_LABEL[k] for k in ty)}: </span>'
                    f'<span class="t">{linked}</span>'
                    f'<a class="tm" href="{href}">{esc(ch_time(e.get("when")))}</a></div></li>')
    return '<ul class="ch-list">' + "".join(rows) + "</ul>"

PICTO = re.compile("[\U0001F000-\U0001FAFF\u2600-\u27BF\u2190-\u21FF\u2B00-\u2BFF\uFE0F\u200D\U0001F3FB-\U0001F3FF]")
def clean(t): return re.sub(r"\s+", " ", PICTO.sub("", str(t or ""))).strip()

def title_parts(t):  # titleParts() in site.js
    t = re.sub(r"^\s*live music\s*[-–:]\s*", "", str(t), flags=re.I)
    return [p for p in (core_of(x) for x in re.split(r"\s(?:&|\+|and|w/|with)\s", t, flags=re.I)) if p]

def render_ld(events, now, trucks, performers):
    place = {"@type": "Place", "name": "Brighter Days Brewing Company",
             "address": {"@type": "PostalAddress", "streetAddress": "311 N Safford Ave", "addressLocality": "Tarpon Springs",
                         "addressRegion": "FL", "postalCode": "34689", "addressCountry": "US"}}
    org = {"@type": "Organization", "@id": SITE + "#brewery", "name": "Brighter Days Brewing Company", "url": SITE}
    out = []
    for e in events:
        s = start_dt(e) if e.get("id") and e.get("start") else None
        if not s: continue
        en = end_dt(e, s); last = en or s + datetime.timedelta(hours=3)
        if last < now: continue  # already over (an event happening right now is kept)
        name = clean(e.get("title"))
        if not name: continue
        music = bool(e.get("musician")) or "guitar" in ch_types(e) or "mic" in ch_types(e)
        ev = {"@context": "https://schema.org", "@type": "MusicEvent" if music else "Event", "name": name, "startDate": iso(s)}
        if en: ev["endDate"] = iso(en)
        ev.update({"eventStatus": "https://schema.org/EventScheduled",
                   "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                   "location": place, "organizer": org, "image": [IMG],
                   "url": SITE + "event.html?id=" + str(e["id"]),
                   "description": name + " at Brighter Days Brewing Company, 311 N Safford Ave, Tarpon Springs, FL."})
        perf = []
        for p in title_parts(e.get("title")):
            x = find_entry(p, performers)
            if x and not any(q["name"] == x["name"] for q in perf):
                q = {"@type": "Person", "name": x["name"]}
                L = x.get("links") or {}
                if L.get("website"): q["url"] = L["website"]
                perf.append(q)
        if perf: ev["performer"] = perf[0] if len(perf) == 1 else perf
        out.append(ev)
    out = out[:LD_LIMIT]
    if not out: return ""
    body = json.dumps(out, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    return f'<script type="application/ld+json" id="bd-events-ld" data-static="1">{body}</script>'

def replace_block(text, a, b, inner, page):
    if text.count(a) != 1 or text.count(b) != 1 or text.index(a) > text.index(b):
        raise SystemExit(f"ERROR: {page}: expected exactly one {a} ... {b} pair; nothing written")
    i, j = text.index(a) + len(a), text.index(b)
    return text[:i] + inner + text[j:]

def outside(text):  # page with marker contents removed, used to prove nothing else changed
    for a, b in ((M_START, M_END), (L_START, L_END)):
        text = re.sub(re.escape(a) + ".*?" + re.escape(b), a + b, text, flags=re.S)
    return text

def load(p, default):
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else default

def main(pages, now=None):
    now = now or datetime.datetime.now(TZ)
    data = load(os.path.join(REPO, "data", "events.json"), {})
    events = [e for e in data.get("events", []) if isinstance(e, dict)]
    if not events: raise SystemExit("ERROR: data/events.json has 0 events; refusing to render (nothing written)")
    events.sort(key=lambda x: x.get("start") or x.get("when") or "")
    performers = load(os.path.join(REPO, "data", "performers.json"), [])
    up = upcoming(events, now)
    print(f"render_events: {len(events)} events in data, {len(up)} upcoming (Eastern, from {now:%Y-%m-%d %H:%M %Z})")
    for e in up: print("  ", e["id"], e["start"], ch_title(e["title"]), "|", ch_time(e.get("when")))
    new_texts = {}
    for page in pages:
        path = os.path.join(REPO, page)
        old = open(path, encoding="utf-8").read()
        trucks = load(os.path.join(os.path.dirname(path), "data", "foodtrucks.json"), [])
        limit = HOME_LIMIT if os.path.basename(page) == "index.html" else None
        evs = up[:limit] if limit else up
        new = replace_block(old, M_START, M_END, render_list(evs, trucks), page)
        new = replace_block(new, L_START, L_END, render_ld(events, now, trucks, performers), page)
        if outside(new) != outside(old): raise SystemExit(f"ERROR: {page}: change outside marker blocks; nothing written")
        new_texts[path] = (old, new)
    for path, (old, new) in new_texts.items():  # write only after every page rendered cleanly
        if new != old:
            open(path, "w", encoding="utf-8").write(new); print("updated", os.path.relpath(path, REPO))
        else:
            print("unchanged", os.path.relpath(path, REPO))

if __name__ == "__main__":
    args = sys.argv[1:]
    now = None
    if args and args[0].startswith("--now="):  # testing only, e.g. --now=2026-10-22T21:00
        now = datetime.datetime.fromisoformat(args.pop(0)[6:]).replace(tzinfo=TZ)
    if not args: raise SystemExit(__doc__)
    main(args, now)
