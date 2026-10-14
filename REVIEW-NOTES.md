# Brighter Days v1 site: review notes (preview only, Oct 13, 2026)
This is a preview only. No DNS, domain, or deploy changes were made. Static files live here. Preview: `python3 -m http.server 8787` in this folder, then http://localhost:8787/

## Unconfirmed: confirm before launch
- **Hours** (Mon–Thu 12–9, Fri 12–10, Sat 11–10, Sun 11–7): CONFIRMED by Aaron on Oct 13, 2026. All "to be confirmed" badges are removed.
- **Food truck schedule:** shows only trucks found in Untappd event titles. Food hours change, so there is no hard-coded BD truck schedule or menu. The page links to Instagram for updates and has a friendly empty state.
- **Email:** aaron@brighterdaysbeer.com (Aaron's address for now) is used in the private-event form mailto, on the Contact page and in the footer.
- **Story page:** uses copy approved by Aaron (Oct 13, 2026), verbatim. The bio/charity placeholder is removed. The owner/brewhouse photo is still a placeholder. "Live music Thursdays and First Fridays" was added to Home and Events next to the trivia note, based on the approved copy.
- Spaces descriptions (picnic tables, TVs, Adirondack chairs, umbrellas) come from review descriptions. Please verify them.

## Placeholders
- Photos: hero, indoor bar, garage-door room, front deck, walk-up window, owner/brewhouse. Each is a striped box labeled "PHOTO PLACEHOLDER".
- There are no reviews, quotes, or ratings anywhere on the site.

## How Untappd data is pulled
- **Tap list (taps.html):** uses Untappd for Business's official JS menu embed (menu 48872/174590), with the snippet pasted verbatim into the page design. It's live: when staff edit the menu in UfB it shows on the site with no script or redeploy. Checked in headless Chrome, where it renders BUJU etc. with "Updated on Oct 12, 2:29 PM EDT". Needs JavaScript; a noscript link points to Untappd. The embed brings its own header and Events tab styling. Its look can be adjusted in UfB's embed settings.
- **Home page:** has no tap preview now, just a "See the live tap list" link to taps.html. The scraped taplist.json is gone.
- **Events and food trucks:** BD's plan has no events embed, so `scripts/update_untappd.py` still scrapes the PUBLIC events page https://untappd.com/v/brighter-days-brewing-company/10061420/events into `data/events.json|.js`. Run it on a schedule (cron/GitHub Action every 15–30 min) and redeploy. Staff keep adding events in UfB as usual.
- Events: Untappd shows **upcoming events only**. The script merges each run into the existing events.json, so history builds up over time. Event descriptions on Untappd are blank.
- Food trucks: detected from event titles. A title part (split on "&") counts as a truck if it has a food emoji, a food keyword, or a name/alias in `data/foodtrucks.json`. Untappd names only about one truck a week and doesn't list BD's own truck, so those days won't appear on the page. **Ask staff to always put the truck name in the Untappd event title.**
- Limits (events scraper only): scraping is unofficial and breaks if Untappd changes its markup. On a failed parse the script exits and keeps the old snapshot. It may also go against Untappd's terms, so use the official embed or API if BD has access. The year is inferred, since Untappd dates have no year. Friday trivia comes from Big Trophy Trivia and isn't on Untappd, so it's static text.

## Logo
- Official logo pack is in `assets/img/logo/`. The main hexagon logo comes from the vector PDF as SVG, black and white, with a cropped viewBox and transparent background, plus 600-dpi transparent PNGs. The starburst mark is made from the 2000px PNG in black and white, since there's no vector version. Favicons are 16/32/48 (.ico), 192, 512 and a 180 apple-touch icon.
- The header uses the white main logo on desktop and the white starburst on mobile. The footer uses the white main logo.

## Private-event form (Formspree) — setup steps for Aaron
The form on private-events.html posts to Formspree. Until the placeholder is replaced, submissions will fail and visitors see the error message with the aaron@brighterdaysbeer.com fallback.
1. Go to https://formspree.io and create a free account with **aaron@brighterdaysbeer.com**.
2. Verify the email address. Formspree sends a verification link; click it.
3. In the dashboard, click **New Form**. Name it e.g. "Private event inquiry" and send submissions to aaron@brighterdaysbeer.com.
4. Copy the form ID: the endpoint looks like `https://formspree.io/f/abcdwxyz`, and the ID is the part after `/f/`.
5. Open `private-events.html` and replace `FORMSPREE_ID` in the form's `action="https://formspree.io/f/FORMSPREE_ID"`. It's the only place it appears. Redeploy.
6. Send one test inquiry. Formspree may ask you to confirm the form by email on the first submission; confirm it, and submissions will arrive in your inbox from then on.
7. Optional, in the form settings: "Restrict to domain" brighterdaysbeer.com.
- **Free tier limits:** formspree.io/plans, checked Oct 13, 2026, shows the Free plan as "for testing and development": 50 submissions/month, 30-day submission archive, no custom thank-you page (we use our own inline message via AJAX, which Free supports). Limits change, so re-check https://formspree.io/plans before launch.
- Spam: the hidden `_gotcha` honeypot field plus Formspree's basic spam filtering. The email subject is set by `_subject` = "Private event inquiry - Brighter Days".
- Without JavaScript the form does a normal POST, and the visitor lands on Formspree's own thank-you page.

## Event detail pages, performers and food trucks
- Each upcoming event links to `event.html?id=<untappd id>`. It shows cards for performers and trucks matched from the title against `data/performers.json` and `data/foodtrucks.json` (case-insensitive, aliases). Unmatched names, and entries with no verified info, show as plain text.
- **Adding or editing an act or truck means editing just that one JSON file.** The truck detector in `scripts/update_untappd.py` reads `foodtrucks.json`. `trucks-known.json` was removed.
- Seeded only from public sources listed in each entry's `source` field (checked Oct 13, 2026):
  - Greg West: verified (gregwestmusic.com; Spotify linked from his site; bio excerpted from his site).
  - Carl August: verified via a VoyageTampa interview (Tarpon Springs guitarist). No official links.
  - **Adam Christel: NOT verified.** Blank; shows as plain text.
  - Poke 'Em, Sandy's Flavor Station and Easy Cheesy Lemon Squeezy: verified via their own sites.
  - Dairy Rich (Palm Harbor; has a "Dairy Rich Burger Bus"), Steve D's Cheesesteaks (Tampa Bay listings) and Bella Vita (Tarpon Springs mobile pizza): partially verified, no official links.
  - **Burger Bus: NOT verified.** Possibly the Dairy Rich Burger Bus or the national "The Burger Bus". Confirm with BD.
  - BD's own truck: name/aliases are placeholders; menu blank on purpose. Confirm how staff title it on Untappd.
- **Photos:** all blank (neutral placeholder). Only add an act's or truck's own official image, with permission, since those images are their copyright.

## Deploy prep (local only; nothing pushed, no repo created)
- `.github/workflows/update-events.yml`: every 30 min plus workflow_dispatch. It commits `data/events.*` only if changed (`permissions: contents: write`). It runs only once the site is put in a GitHub repo.
- `.nojekyll`, `README.md`, local git repo with an initial commit.

## Untappd visibility (Aaron, Oct 13)
- All customer-visible Untappd wording and links are removed from the pages: footer link, "pulled from Untappd" notes, noscript link, "View on Untappd". Data plumbing is unchanged.
- The embed shows no visible Untappd logo or "powered by" text. In our CSS (assets/style.css) we hide its Menu/Events tab bar and make beer/brewery names non-clickable (they linked to untappd.com). We did NOT remove its screen-reader-only "Rated X on Untappd" text or the cap-rating icons.
- Untappd for Business embed terms were not checked. If UfB requires attribution or links, remove those two CSS rules.

## Home hero photo
- Now `IMG_1217` (Aaron's iCloud): the red taproom building, garage doors and palms. Cropped 16:9 to 1920×1080: `assets/img/home-hero.webp` (~260 KB) / `.jpg` (~389 KB). Chosen over the previous 123_outdoor-palms and IMG_2579 (IMG_2579 is a wedding on the deck at night with identifiable guests, and dark under text).
- A secondary band on Home uses `IMG_1222` (rainbow over the building), cropped 21:9: `assets/img/home-rainbow.*`.
- Hero sizing: object-fit: cover; height 60svh on desktop (max 640px) and 68svh on mobile, with a vh fallback; no background-attachment: fixed. Site-wide `img{max-width:100%;height:auto}`. Gallery thumbnails use fixed 4:3 boxes with object-fit: cover. The logo keeps its aspect ratio. CSS/JS URLs are cache-busted (`?v=`).

## Spaces gallery
- Photos come from Aaron's iCloud album; beer and can shots come from Facebook (011, 083, 128, 074, checked visually; 028 and 042 skipped because of meme text, 077 and 078 because they aren't beer shots). Each has 1600px webp+jpg and a 600px 4:3 thumbnail, EXIF rotation applied, all EXIF/GPS stripped. Lazy loading, alt text, and a small lightbox (keyboard, swipe, and it works as plain links without JS).
- IMG_2343 is the **Bella Vita** pizza trailer (a guest truck), captioned as such. IMG_0797 is a red food trailer; it's unclear whose it is, so the caption is generic. Skipped: IMG_2582 (portrait), IMG_0843 (not assigned), video files.
- The story page placeholder is replaced with the brewhouse photo (IMG_1732). The walk-up window has no verified photo, so its section is text only.

## Other open items
- Map embed is the keyless Google Maps iframe. Swap it for the Maps Embed API with a key if preferred.
- Yelp/TripAdvisor/Google listing fixes and pointing Google's website field to brighterdaysbeer.com come after launch.
