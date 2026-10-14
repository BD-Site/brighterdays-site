# Brighter Days Brewing Co. website (v1, static)

Plain static HTML/CSS/JS. No build step. Preview locally: `python3 -m http.server 8787`, then open http://localhost:8787/

## Data
- **Tap list:** the official Untappd for Business menu embed on `taps.html` (live).
- **Events / food trucks:** `scripts/update_untappd.py` scrapes the public Untappd venue events page into `data/events.json` and `data/events.js`. `.github/workflows/update-events.yml` runs it every 30 min (and on demand) and commits only when the data changed.
- **Performers / food trucks on event pages:** edit `data/performers.json` or `data/foodtrucks.json` (`name`, `aliases`, `photo`, `bio`/`menu`, `genre`/`cuisine`, `links`, `source`). Names in event titles match case-insensitively, including aliases. `foodtrucks.json` also drives truck detection on the Food Trucks page.

## Hosting
GitHub Pages (`.nojekyll` included) or any static host. Formspree setup for the private-event form: see `REVIEW-NOTES.md`.
