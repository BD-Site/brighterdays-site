#!/usr/bin/env python3
"""Detect whether the Brighter Days YouTube channel is live and record it in data/live.json.

Run by the 30-minute update-events workflow. No API key needed: it loads the public page
https://www.youtube.com/channel/<channelId>/live, which YouTube points (rel=canonical) at the
current watch?v=<id> while a stream is on air, and back at the channel page when it isn't.
A stream counts as live only when the canonical is a watch URL AND the page reports "isLive":true
(so a merely scheduled/upcoming stream doesn't show a play button).

- channelId empty -> no-op (prints a note, writes nothing, exit 0).
- Network/parse trouble -> no-op, exit 0 (never fails the events workflow).
- Writes only when something changes; while live it refreshes checkedAt each run so the
  site's 2-hour staleness guard (assets/live.js) keeps the player up during a long set.

Usage: python3 scripts/check_youtube_live.py [config.json ...]   (default: data/live.json)
"""
import json, re, sys, urllib.request
from datetime import datetime, timezone

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"


def check(channel_id):
    req = urllib.request.Request(
        f"https://www.youtube.com/channel/{channel_id}/live",
        headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.8", "Cookie": "CONSENT=YES+1"},
    )
    html = urllib.request.urlopen(req, timeout=20).read().decode("utf-8", "replace")
    m = re.search(r'<link rel="canonical" href="https://www\.youtube\.com/watch\?v=([\w-]{11})"', html)
    if m and '"isLive":true' in html:
        return True, m.group(1)
    return False, ""


def main(paths):
    for path in paths or ["data/live.json"]:
        with open(path, encoding="utf-8") as f:
            cfg = json.load(f)
        cid = (cfg.get("channelId") or "").strip()
        if not cid:
            print(f"{path}: channelId empty, skipping live check.")
            continue
        if not re.fullmatch(r"UC[\w-]{22}", cid):
            print(f"{path}: channelId {cid!r} doesn't look like a YouTube channel id (UC...); skipping.")
            continue
        try:
            live, vid = check(cid)
        except Exception as e:  # network hiccup: leave the file alone
            print(f"{path}: live check failed ({e}); leaving as is.")
            continue
        new = dict(cfg, isLive=live, liveVideoId=vid)
        if live:
            new["checkedAt"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        if new != cfg:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(new, f, indent=2)
                f.write("\n")
        print(f"{path}: {'LIVE ' + vid if live else 'not live'}")


if __name__ == "__main__":
    main(sys.argv[1:])
