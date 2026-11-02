#!/usr/bin/env python3
"""Three cases for the Untappd events updater. No network, and it never touches data/events.*.

    python3 scripts/test_update_untappd.py -v

1. Real event markup merges into the snapshot (exit 0, files written).
2. Untappd's explicit empty state is a no-change success (exit 0, nothing written).
3. Zero events without that message, or a failed fetch, fails (exit 1, nothing written).
"""
import io, json, os, sys, tempfile, unittest, urllib.error
from contextlib import redirect_stderr, redirect_stdout

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import update_untappd as mod

REAL_EVENT = """
<div class="event-list">
  <div class="event-item">
    <p class="date">Thu, Nov 5th • 6:00 PM EST - Thu, Nov 5th • 8:00 PM EST</p>
    <h4 class="name"><a href="/v/brighter-days-brewing-company/10061420/event/1010467">🎶 Carl August </a></h4>
  </div>
</div>
"""

EMPTY_STATE = """
<div class="content">
  <div class="top-header"><h3>Events</h3></div>
  <div class="venue-content">
    <div class="event-list">
      <div class="event-none">
        <p>This venue has no upcoming events. Be sure to check back soon!</p>
      </div>
    </div>
  </div>
</div>
"""

BLOCK_PAGE = """
<html><head><title>Just a moment...</title></head>
<body><h1>Access denied</h1><p>Please enable JavaScript.</p></body></html>
"""

PARTIAL_PHRASE = """
<div class="event-list"><p>There are no upcoming events listed right now.</p></div>
"""


def seed(root):
    os.makedirs(root, exist_ok=True)
    snap = {
        "source": mod.VENUE + "/events",
        "fetched": "2026-11-01T06:31+00:00",
        "events": [{
            "start": "2026-10-14T18:00",
            "trucks": [],
            "musician": False,
            "id": "1005519",
            "title": "BD Open Mic",
            "when": "Wed, Oct 14th • 6:00 PM EDT - Wed, Oct 14th • 8:00 PM EDT",
            "url": "https://untappd.com/v/brighter-days-brewing-company/10061420/event/1005519",
        }],
    }
    js = "window.BD_EVENTS=" + json.dumps(snap, ensure_ascii=False) + ";\n"
    json_path = os.path.join(root, "events.json")
    js_path = os.path.join(root, "events.js")
    with open(json_path, "w") as f:
        json.dump(snap, f, indent=2, ensure_ascii=False)
    with open(js_path, "w") as f:
        f.write(js)
    return _read(json_path), _read(js_path)


def _read(path):
    with open(path, "rb") as f:
        return f.read()


class UpdateUntappdTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = self.tmp.name
        self.before_json, self.before_js = seed(self.root)
        self.repo_data = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
        self.repo_before = (
            _read(os.path.join(self.repo_data, "events.json")),
            _read(os.path.join(self.repo_data, "events.js")),
        )

    def tearDown(self):
        self.tmp.cleanup()
        after = (
            _read(os.path.join(self.repo_data, "events.json")),
            _read(os.path.join(self.repo_data, "events.js")),
        )
        if after != self.repo_before:
            raise AssertionError("test wrote the repo data/events.* files")

    def files(self):
        return (
            _read(os.path.join(self.root, "events.json")),
            _read(os.path.join(self.root, "events.js")),
        )

    def test_real_events_merge_and_write(self):
        out = io.StringIO()
        with redirect_stdout(out):
            code = mod.run(REAL_EVENT, self.root, now="2026-11-02T17:40-05:00")
        self.assertEqual(code, 0)
        self.assertIn("Parsed 1 upcoming events", out.getvalue())
        self.assertIn("OK: 2 events", out.getvalue())
        data = json.loads(self.files()[0].decode())
        ids = [e["id"] for e in data["events"]]
        self.assertEqual(ids, ["1005519", "1010467"])
        added = data["events"][1]
        self.assertEqual(added["title"], "🎶 Carl August")
        self.assertTrue(added["musician"])
        self.assertEqual(added["url"], "https://untappd.com/v/brighter-days-brewing-company/10061420/event/1010467")
        self.assertEqual(data["fetched"], "2026-11-02T17:40-05:00")
        js = self.files()[1].decode()
        self.assertTrue(js.startswith("window.BD_EVENTS="))
        self.assertIn("1010467", js)
        # A second pass with the same upcoming event must not rewrite the snapshot.
        written = self.files()
        with redirect_stdout(io.StringIO()):
            again = mod.run(REAL_EVENT, self.root, now="2026-11-02T18:00-05:00")
        self.assertEqual(again, 0)
        self.assertEqual(self.files(), written)

    def test_explicit_empty_state_succeeds_without_writing(self):
        out = io.StringIO()
        with redirect_stdout(out):
            code = mod.run(EMPTY_STATE, self.root, now="2026-11-02T17:40-05:00")
        self.assertEqual(code, 0)
        self.assertIn("Parsed 0 upcoming events", out.getvalue())
        self.assertIn("No change: Untappd reports no upcoming events", out.getvalue())
        self.assertEqual(self.files(), (self.before_json, self.before_js))

    def test_unexpected_zero_events_fails_without_writing(self):
        for html in (BLOCK_PAGE, PARTIAL_PHRASE, "<html><body></body></html>"):
            err = io.StringIO()
            with redirect_stdout(io.StringIO()), redirect_stderr(err):
                code = mod.run(html, self.root, now="2026-11-02T17:40-05:00")
            self.assertEqual(code, 1, html)
            self.assertIn("refusing to overwrite", err.getvalue())
            self.assertEqual(self.files(), (self.before_json, self.before_js))

    def test_fetch_error_fails_without_writing(self):
        orig_get, orig_root = mod.get, mod.ROOT
        def boom(url):
            raise urllib.error.HTTPError(url, 403, "Forbidden", hdrs=None, fp=None)
        mod.get, mod.ROOT = boom, self.root
        err = io.StringIO()
        try:
            with redirect_stderr(err):
                code = mod.main()
        finally:
            mod.get, mod.ROOT = orig_get, orig_root
        self.assertEqual(code, 1)
        self.assertIn("could not fetch", err.getvalue())
        self.assertIn("403", err.getvalue())
        self.assertEqual(self.files(), (self.before_json, self.before_js))


if __name__ == "__main__":
    unittest.main()
