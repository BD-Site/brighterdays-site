#!/usr/bin/env python3
"""Offline demonstration of the three Untappd updater outcomes.

Does not fetch the network and does not modify data/events.json or data/events.js.

  1. Real event markup  -> exit 0 and the snapshot is updated (history kept).
  2. Explicit empty state ("no upcoming events. Be sure to check back soon!")
                         -> exit 0 and the snapshot is not written.
  3. Unexpected 0 events, or a failed fetch -> exit 1 and the snapshot is not written.

Run: python3 scripts/test_update_untappd.py
"""
import json, os, sys, tempfile, urllib.error
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import update_untappd as u

# Markup copied from a live Untappd venue events page (one upcoming event).
REAL_EVENTS_HTML = """
<div class="event-list">
  <div class="event-list-details">
    <div class="event-item" data-track-venue-impression="venue_id-10061420-event_id-1010467-type-event">
      <div class="event-details">
        <p class="date">Thu, Nov 5th • 6:00 PM EST - Thu, Nov 5th • 8:00 PM EST</p>
        <h4 class="name"><a href="/v/brighter-days-brewing-company/10061420/event/1010467">🎶 Carl August </a></h4>
      </div>
    </div>
    <div class="event-item">
      <div class="event-details">
        <p class="date">Fri, Nov 6th • 6:00 PM EST - Fri, Nov 6th • 9:00 PM EST</p>
        <h4 class="name"><a href="/v/brighter-days-brewing-company/10061420/event/1010468">🎵 Dan Lavoie &amp; 🍕 Bella Vita </a></h4>
      </div>
    </div>
  </div>
</div>
"""

# Markup copied from a live Untappd venue page that has no upcoming events.
EMPTY_STATE_HTML = """
<div class="venue-content">
  <div class="event-list">
    <div class="event-none">
      <p>This venue has no upcoming events. Be sure to check back soon!</p>
    </div>
  </div>
</div>
"""

# Zero .event-item nodes and no empty-state sentence: a block page or a layout change.
UNEXPECTED_EMPTY_HTML = """
<html><head><title>Just a moment...</title></head>
<body>
  <div class="event-list"><div class="event-list-details"></div></div>
  <p>Access denied</p>
  <script>var hint = "This venue has no upcoming events. Be sure to check back soon!";</script>
</body></html>
"""

REPO_DATA = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data"))

def seed(root):
    os.makedirs(root, exist_ok=True)
    doc = {
        "source": u.VENUE + "/events",
        "fetched": "2026-10-01T12:00-04:00",
        "events": [{
            "start": "2026-10-14T18:00",
            "trucks": [],
            "musician": False,
            "id": "1005519",
            "title": "BD Open Mic",
            "when": "Wed, Oct 14th • 6:00 PM EDT - Wed, Oct 14th • 8:00 PM EDT",
            "url": u.VENUE + "/event/1005519",
        }],
    }
    u.write("events", doc, "BD_EVENTS", root)
    return snapshot(root)

def snapshot(root):
    out = {}
    for name in ("events.json", "events.js"):
        path = os.path.join(root, name)
        out[name] = open(path, "rb").read() if os.path.exists(path) else None
    return out

def repo_snapshot():
    return snapshot(REPO_DATA)

def check(name, ok):
    print(("PASS " if ok else "FAIL ") + name)
    if not ok:
        raise SystemExit(1)

def main():
    before_repo = repo_snapshot()
    with tempfile.TemporaryDirectory() as tmp:
        # 1. Real events update the snapshot and keep older events.
        prior = seed(tmp)
        code = u.main(html=REAL_EVENTS_HTML, root=tmp)
        updated = snapshot(tmp)
        doc = json.loads(updated["events.json"])
        ids = [e["id"] for e in doc["events"]]
        bella = next(e for e in doc["events"] if e["id"] == "1010468")
        check("real events -> exit 0 and events.json/.js updated",
              code == 0 and updated != prior and updated["events.js"] is not None
              and ids == ["1005519", "1010467", "1010468"]
              and doc["events"][1]["title"] == "🎶 Carl August" and doc["events"][1]["musician"] is True
              and bella["trucks"] == ["Bella Vita"] and "window.BD_EVENTS=" in updated["events.js"].decode())
        # Same page again is a normal no-change run (no rewrite of the timestamp).
        again = u.main(html=REAL_EVENTS_HTML, root=tmp)
        check("real events, second run -> exit 0 and files left as-is",
              again == 0 and snapshot(tmp) == updated)

        # 2. Explicit empty state succeeds and writes nothing.
        prior = seed(tmp)
        code = u.main(html=EMPTY_STATE_HTML, root=tmp)
        check("explicit empty state -> exit 0, no write",
              code == 0 and snapshot(tmp) == prior)
        bare = os.path.join(tmp, "bare")
        os.makedirs(bare)
        code = u.main(html=EMPTY_STATE_HTML, root=bare)
        check("explicit empty state with no snapshot -> exit 0, files not created",
              code == 0 and snapshot(bare) == {"events.json": None, "events.js": None})

        # 3. Unexpected zero events, and a failed fetch, both fail without writing.
        prior = seed(tmp)
        code = u.main(html=UNEXPECTED_EMPTY_HTML, root=tmp)
        check("unexpected 0 events (message only inside a script) -> exit 1, no write",
              code == 1 and snapshot(tmp) == prior)
        code = u.main(html="<html><body><p>Please log in to Untappd</p></body></html>", root=tmp)
        check("unexpected 0 events (no empty-state message) -> exit 1, no write",
              code == 1 and snapshot(tmp) == prior)

        def blocked(url):
            raise urllib.error.HTTPError(url, 403, "Forbidden", hdrs=None, fp=None)
        orig = u.get
        u.get = blocked
        try:
            code = u.main(root=tmp)
        finally:
            u.get = orig
        check("fetch error -> exit 1, no write", code == 1 and snapshot(tmp) == prior)

    check("repo data/events.json and data/events.js were not modified", repo_snapshot() == before_repo)
    print("All three cases passed.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
