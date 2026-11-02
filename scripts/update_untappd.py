#!/usr/bin/env python3
"""Regenerate data/events.json (and .js mirror) from the PUBLIC Untappd venue pages.
Usage: python3 scripts/update_untappd.py   (requires: pip install beautifulsoup4)
The tap list uses the official UfB menu embed on taps.html. Staff keep editing events in Untappd for Business as usual; this script just snapshots them.
Run on a schedule (cron / GitHub Action every 15-30 min) and redeploy the static files.

Untappd's own empty state ("This venue has no upcoming events. Be sure to check back soon!")
exits 0 and does not touch data/events.*. A failed fetch, or zero parsed events without that
message, exits 1 and also leaves the files alone.
"""
import json, re, sys, os, urllib.request, urllib.error, datetime
from bs4 import BeautifulSoup
VENUE = "https://untappd.com/v/brighter-days-brewing-company/10061420"
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
UA = {"User-Agent": "Mozilla/5.0 (BrighterDays site updater)"}
# Visible copy Untappd puts in <div class="event-none"><p>…</p></div> when a venue has nothing upcoming.
EMPTY_STATE_RE = re.compile(r"no upcoming events\.\s*be sure to check back soon!", re.I)
def get(u): return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30).read().decode()
def txt(el): return re.sub(r"\s+", " ", el.get_text(" ", strip=True)) if el else ""
def write(name, obj, var, root=None):
    root = root or ROOT
    with open(os.path.join(root, name + ".json"), "w") as f: json.dump(obj, f, indent=2, ensure_ascii=False)
    with open(os.path.join(root, name + ".js"), "w") as f: f.write(f"window.{var}=" + json.dumps(obj, ensure_ascii=False) + ";\n")
FOOD_EMOJI = re.compile("[\U0001F354-\U0001F37F\U0001F32D-\U0001F32F\U0001F950-\U0001F96F\U0001F9C0\U0001F9C6\U0001F69A\U0001F6FB\U0001F35F\U0001F363]")
TRUCK_WORDS = re.compile(r"truck|kitchen|bbq|tacos?|burgers?|pizza|food|grill|eats|flavor|cheesy|poke|smash", re.I)
def find_trucks(title, root=None):
    """A food truck = an '&'-separated part of the title with a food emoji or food keyword or matching a name/alias in data/foodtrucks.json."""
    root = root or ROOT
    fp = os.path.join(root, "foodtrucks.json")
    known = [n for t in (json.load(open(fp)) if os.path.exists(fp) else []) for n in [t["name"]] + t.get("aliases", [])]
    out = []
    for part in re.split(r"\s(?:&|\+|and|w/)\s", title):
        clean = re.sub(r"[^\w\s'’‘.-]", "", part).strip()
        if FOOD_EMOJI.search(part) or TRUCK_WORDS.search(part) or any(k.lower() in clean.lower() for k in known):
            out.append(clean)
    return out
def parse_start(when):
    m = re.match(r"\w+, (\w+) (\d+)\w* • (\d+:\d+ [AP]M)", when)
    if not m: return None
    today = datetime.date.today(); d = datetime.datetime.strptime(f"{m[1]} {m[2]} {today.year} {m[3]}", "%b %d %Y %I:%M %p")
    if d.date() < today - datetime.timedelta(days=60): d = d.replace(year=today.year + 1)
    return d.isoformat(timespec="minutes")
def explicit_empty_state(soup):
    """True when the visible page contains Untappd's empty-events sentence. Script and style text does not count."""
    chunks = []
    for node in soup.find_all(string=True):
        parent = getattr(node, "parent", None)
        if parent is not None and parent.name in ("script", "style"): continue
        chunks.append(str(node))
    return bool(EMPTY_STATE_RE.search(re.sub(r"\s+", " ", " ".join(chunks))))
def parse_events(soup, root=None):
    parsed = {}
    for it in soup.select(".event-item"):
        a = it.select_one("h4.name a"); m = re.search(r"/event/(\d+)", a["href"]) if a and a.get("href") else None
        if not m: continue
        when = txt(it.select_one("p.date")); title = txt(a)
        parsed[m.group(1)] = {"start": parse_start(when), "trucks": find_trucks(title, root), "musician": not not re.search("[\U0001F3B5\U0001F3BC\U0001F3B6\U0001F3B8\U0001F3A4]", title), "id": m.group(1), "title": title, "when": when, "url": "https://untappd.com" + a["href"]}
    return parsed
def main(html=None, root=None):
    root = root or ROOT
    if html is None:
        try:
            html = get(VENUE + "/events")
        except (urllib.error.URLError, TimeoutError) as e:
            print(f"ERROR: could not fetch the Untappd events page ({e}); refusing to overwrite data/events.*", file=sys.stderr, flush=True)
            return 1
    now = datetime.datetime.now().astimezone().isoformat(timespec="minutes")
    # --- events (Untappd shows upcoming only; we merge with prior snapshot to keep history)
    path = os.path.join(root, "events.json")
    old = json.load(open(path)) if os.path.exists(path) else {"events": []}
    byid = {e["id"]: e for e in old.get("events", [])}
    soup = BeautifulSoup(html, "html.parser")
    parsed = parse_events(soup, root)
    print(f"Parsed {len(parsed)} upcoming events from Untappd", flush=True)
    if not parsed:
        # Never overwrite data/events.* from an empty parse. A genuine empty venue is a no-change
        # success; anything else (block page, layout change, partial HTML) is a failed run.
        if explicit_empty_state(soup):
            print('No upcoming events on Untappd ("no upcoming events. Be sure to check back soon!"). Leaving data/events.* unchanged.', flush=True)
            return 0
        title = txt(soup.title)
        detail = f" (page title: {title})" if title else ""
        print(f"ERROR: parsed 0 events from the Untappd venue page and did not see the empty-state message{detail}; refusing to overwrite data/events.*", file=sys.stderr, flush=True)
        return 1
    byid.update(parsed)
    evs = sorted(byid.values(), key=lambda x: x.get("start") or x["when"])
    if evs == old.get("events") and os.path.exists(path):
        print(f"No change: {len(evs)} events (snapshot and timestamp left as-is)", flush=True); return 0
    write("events", {"source": VENUE + "/events", "fetched": now, "events": evs}, "BD_EVENTS", root)
    print(f"OK: {len(evs)} events", flush=True)
    return 0
if __name__ == "__main__":
    sys.exit(main())
