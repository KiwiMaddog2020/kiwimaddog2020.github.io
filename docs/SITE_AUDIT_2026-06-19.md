# Site regression audit — Arbiter Machinae root-restructure (2026-06-19)

Audit of today's restructure arc (commits `b28109e`..`0fae838`): Firebase Google
sign-in activated, brand rename to "Arbiter Machinae" (author stays Kevin Madson),
Study app moved to the site root with Research folded in as `#/research`, search
turned into a dropdown, track cards made tap targets, nav cluster right-aligned.

Method: the repo's own test suite, a live-deployment sweep (every key URL on
`kiwimaddog2020.github.io`), and three decorrelated read-only code-audit agents
(asset/redirect integrity, SPA router/UI, Firebase + brand/SEO). Findings below;
all fixes in this pass are committed locally and NOT pushed (left for review).

## Headline

The restructure is sound for a live visitor. The deployed site returns 200 on
`/`, `/study/`, `/learn/`, all assets, `data/notes.json`, the feed, and 404; the
brand reads "Arbiter Machinae"; assets are cache-busted; the SPA router survives
cold loads of `/`, `/#/research`, deep lesson hashes, and old `/study/#/...`
links; Firebase is correctly built as progressive enhancement and cannot
white-screen the app for signed-out visitors; and no secret beyond the public
web config is committed. The real defects were in maintenance plumbing and one
missed wordmark, not the served page.

## Fixed in this pass (committed locally, awaiting push)

| sev | file | issue | fix |
|---|---|---|---|
| High | `tests/test_build_index.py` | whole suite (9/9) red: it tested the removed `index.md` marker API (`rebuild`/`render_entries`/`INDEX`) | rewrote against the real `notes.json` contract (`render_notes_json` + `render_feed` + `_safe_page_url`); 12/12 green, every security property preserved (escaping, destination validation, fail-safe, pagination, filter) |
| High | `.github/workflows/rebuild-index.yml` | weekly bot still diffs/stages `index.md` (gone); regenerated `data/notes.json` would never commit, so the research list silently rots | target `data/notes.json feed.xml` in both the diff guard and `git add` |
| High | `feed.xsl` | the one missed wordmark: `/feed.xml` viewed in a browser still showed "Kevin Madson" in the wordmark and `<title>` | both → "Arbiter Machinae" (author still Kevin Madson everywhere it belongs) |
| Med | `.githooks/pre-commit` | re-staged `_layouts/default.html study/index.html`, but after the move `index.html` is the file `stamp-cache.py` actually stamps; future `learn.css`/`learn.js`/`research-notes.css` changes would ship an un-updated `?v=` | stage `index.html _layouts/default.html` |
| Med | `learn/index.html` | no-JS fallback copy said "moved to /study/" (itself a redirect stub), while the real redirect goes to `/` | copy now points at the home page |
| Low | `_layouts/default.html` | stale Research/Study `section-switch` toggle (the disbanded feature) still rendered on the 404 page | removed the toggle markup |
| Low | `index.html` | `learn.css`/`learn.js` used bare relative paths while everything else is absolute `/assets/...` (works at root, fragile) | normalized to `/assets/...` |

Verification: `pytest tests/` 12/12 green; `bin/stamp-cache.py` clean (hashes
current); section-switch gone from served HTML; live URL sweep all 200.

## Deferred (need a decision or design assets — NOT changed)

1. **Brand image regen (Low, known follow-up).** `assets/social-card.png` and the
   PNG favicons (`apple-touch-icon-180.png`, `favicon-32.png`, `favicon-16.png`)
   still render the old "KM" / "Kevin Madson" art, and the inline-SVG favicon in
   `index.html:30` + `_layouts/default.html:30` hardcodes `KM`. These need a mark
   decision (is the new mark "AM", a glyph, something else?) plus image tooling,
   so they are out of scope for an autonomous text pass. The inline-SVG "KM" is
   editable as text once the mark is chosen.
2. **Dead `section-switch` CSS (Low).** `assets/research-notes.css:182-201` (and a
   stray rule near `:588`) still style the removed toggle. The CSS is harmless
   dead weight, but `research-notes.css` is the SHARED stylesheet linked by every
   note repo, so removing it should be done with a quick check that no other
   repo's layout still uses the class. Left for that cross-repo pass.

## Verified clean (no action)

- **Firebase safety:** `initAuth()` runs after `renderRoute()`; the entire SDK
  load is in one try/catch that degrades to "no sign-in UI" on any failure; every
  Firestore read/write and storage call is guarded; all sync paths early-return
  unless signed in. Google-only provider. Only the four public web-config keys are
  committed; no service-account/private key anywhere in the tree.
- **SPA router/UI:** all routes resolve, no dead routes, `renderNotFound`
  fallback prevents blank screens, `renderResearch` handles fetch failure and
  empty list, track-card hrefs and state-aware CTAs are correct, the search
  dropdown has Escape/outside-click/`hashchange` close with no keyboard trap, and
  the disbanded toggle left no live code in the SPA.
- **Author preserved:** "Kevin Madson" intact in `<meta name=author>`, schema.org
  Person, feed `<author>`, and the home byline.
- **Redirect stubs:** `/study/` and `/learn/` both redirect to `/` preserving the
  hash fragment.
