# kiwimaddog2020.github.io

Arbiter Machinae, the hub site for my research notes on working with AI
(https://kiwimaddog2020.github.io/). Each note is a GitHub Pages site published
from the repository it describes. This repo holds the home page, the notes
index, the Atom feed, and the shared look every note site uses.

## What is shared with the note sites

Every note layout links these by absolute path, so the filenames and the class
names inside them are a published contract. Do not move or rename them.

- `assets/research-notes.css`: the lab notebook design (graph paper in light,
  chalkboard in dark).
- `assets/notebook.js`: the lamp (theme switch), scroll animations, and the
  hand-sketched playable figures. Pages work without it.
- `assets/fonts/`: self-hosted fonts (all SIL Open Font License; see
  `docs/FONTS.md`). No third-party origins.

## Run and check

```bash
python3 -m http.server 8000      # then open http://localhost:8000/
bash bin/check.sh                # tests
```

There is no build step and no CI. GitHub Pages runs Jekyll when main changes.

## Publishing or updating a note

The note cards on the home page, `data/notes.json` and `feed.xml` are generated.
Do not edit them by hand.

```bash
python3 bin/build_index.py            # fetch the list from GitHub and rebuild
python3 bin/build_index.py --offline  # only re-render the home page cards
python3 bin/stamp-cache.py            # refresh cache stamps on asset links
bash bin/check.sh
```

A note is listed when its public repository has the `research-note` topic; the
repo description becomes the title and the repo homepage becomes the link.
Removing the topic de-lists it on the next rebuild. The one-line finding, kind
and status shown on each card are hand-written in `data/notes-meta.json`.

## Layout

- `index.html`, `assets/home.css`: the home page.
- `_layouts/default.html`: layout for Markdown pages such as `404.md`.
- `data/figures/`: data behind the playable figures, generated from study results.
- `rag-findings/`, `work/`: standalone pages.
- `docs/`: internal notes, never published. `docs/archive/` holds retired
  material, including the old Study app.

Code is MIT licensed (see LICENSE); the prose on the site is mine.
