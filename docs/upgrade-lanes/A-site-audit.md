## Findings (highest risk first)

1. **Internal planning docs are published and in the sitemap.** Severity: high. `_config.yml:8` excludes only bin/tests/docs/README/LICENSE, so `study/*.md` and `data/SCHEMA.md` get rendered. I fetched these live and each returned 200: `/study/PLAN.html`, `/study/FIREBASE_SETUP.html`, `/study/BUILD_STATE.html` and `/data/SCHEMA.html`. All seven study docs are also listed in the live sitemap.xml. Fix: archive them and add `study/`, `data/SCHEMA.md` and `*.md` planning files to `exclude`.

2. **The homepage is the Study app, and it is the only thing that shows the notes list.** Severity: high. `index.html:35-39` loads learn.css and learn.js, and the notes are drawn only by the `#/research` route (`assets/learn.js:995`). Removing Study removes the notes list. Fix: build a static or Jekyll index that renders `data/notes.json` before you delete anything.

3. **Firebase web config is committed.** Severity: med. It sits at `assets/learn.js:195-200` (apiKey, authDomain, projectId, appId) and is described in `study/FIREBASE_SETUP.md:39`. These keys are public by design, but they stay in git history. Fix: after retiring Study, delete or lock down the `blog-and-research` Firebase project (auth plus Firestore rules), or restrict the key to your domain.

4. **notes.json has been hand-edited away from what the generator writes.** Severity: med. `data/notes.json` has no `date` field and a different trutina title from `feed.xml:11`, while `build_index.py:124-131` always writes `date`. The next rebuild overwrites the hand edits. The client sets `href` from this file with escaping but no scheme check, so hand edits skip `_safe_page_url`. Fix: run the generator and never hand-edit, or validate on render.

5. **Live pages link to Study routes that will 404 after removal.** Severity: med. `rag-findings/index.html:70-71` links to `/#/labs` ("All labs", back arrow). `work/index.html:271-290` is a whole case study on the Study app with stale claims: "5 labs", while `data/colophon.json` says "twelve". `data/labs.json:568-572` is the only index entry for rag-findings. Fix: point these at the new home and rewrite or drop the work case 03.

6. **Unused fonts are preloaded on every page.** Severity: med. `_layouts/default.html:32-33` and `index.html:32-33` preload cormorant-garamond-latin and inter-latin (about 86KB), but no stylesheet declares an @font-face for Cormorant or Inter (grep of assets/*.css). Cormorant and Inter make up 6 files (about 348KB) in `assets/fonts/`. Fix: drop the preloads. Do not delete the files until you have checked whether other note repos reference them (UNVERIFIED).

7. **work/ images are oversized.** Severity: med. In `work/index.html:197,229,282,309` the images are 2000-2400px PNGs (veranota-icons 618KB at 2400x2920) with no `loading="lazy"` and no width/height. The og image `og-card.png` (`work/index.html:14`) is 896KB. The page also blocks render on Google Fonts (`work/index.html:19-21`), a third-party origin, which goes against the site's self-hosted policy. Fix: WebP/AVIF at about 1200px, add lazy loading and dimensions, self-host the fonts.

8. **Stale social card alt text.** Severity: low. `_layouts/default.html:21,26` and `index.html:21,26` say "19 studies, 3 production models", but the hub lists 8 notes. Fix: regenerate the card and alt text during the redesign.

9. **Redirect stubs are in the sitemap.** Severity: low. `learn/index.html` and `study/index.html` are noindex redirects, yet the sitemap lists both (live check). Fix: archive them, or add `sitemap: false`.

10. **Cache stamping is partial.** Severity: low. `bin/stamp-cache.py:17-21` stamps only index.html and the layout. `feed.xsl:16`, `rag-findings` and the redirect pages link research-notes.css without a version. External note sites also link it unversioned, so a redesign of this file restyles every note site at once.

11. **build_index gaps.** Severity: low. `bin/build_index.py:106-113` does not filter archived repos. `:155` feed summary just repeats the title. `:112` compares the hub name in lowercase only. There are no tests for `_api` or `stamp-cache.py`.

12. **README is stale.** Severity: low. `README.md:10-11` describes `index.md` markers that no longer exist (the generator writes notes.json now). `README.md:13,19-21` depend on the workflows you are removing.

13. **Em-dashes and naming inconsistencies.** Severity: low. There are 3 em-dashes in `work/index.html`, including `:7,10,16`. The wordmark in `rag-findings/index.html:69` says "Kevin Madson" where other pages say "Arbiter Machinae", and that page has no description or og meta.

14. **Old-model tells.** Severity: low. Docstrings narrate past edits: `bin/build_index.py:13-14` ("no Jekyll-rendered index page anymore") and `tests/test_build_index.py:4-6`. `docs/` holds dated audit and critique logs (`SITE_AUDIT_2026-06-19.md`, two `DESIGN_CRITIQUE` txt files). Fix: archive them.

**Checked and fine:** contrast passes AA (muted #96918a on #14141a is 5.87:1, accent 5.75:1), a reduced-motion block exists (`research-notes.css:971`), focus-visible styles exist (`:205-209`), and `__pycache__` is ignored and untracked. All 8 note pages returned 200. The GitHub repos for oneshot-bench, craft-fit-rating and audioscan returned 403 through the proxy, so whether they are public is UNVERIFIED.

## Study app removal manifest

**Files to archive:** `index.html` (to be replaced), `assets/learn.js`, `assets/learn.css`, `data/lessons/*.json` (5 files), `data/tracks.json`, `data/prereqs.json`, `data/labs.json`, `data/links.json`, `data/colophon.json`, `data/SCHEMA.md`, `study/` (index.html plus 7 .md files), `learn/index.html`, `bin/build_labs.py`, `bin/check_quiz_quality.py`, `tests/test_quiz_quality.py`, `.githooks/pre-commit` (its quiz half), `work/img/study-lab.png`.

**References elsewhere that must be updated:**
- `bin/stamp-cache.py:18-20`: remove the learn entries; index.html must remain or be replaced.
- `.githooks/pre-commit:3-10`: keep the stamp step and drop the quiz step.
- `research-notes.css:183-187,825`: `body.learn-page` scoping and the learn-app comment.
- `rag-findings/index.html:70-71`: links to `/#/labs`.
- `work/index.html:271-290`: the Study case study.
- `build_index.py:7-8,117` and `tests/test_build_index.py:4-6,45`: docstrings that say "Study app".
- Workflow comment in `tests.yml`.
- The Firebase project itself.

**Keep:** the `.study-list`/`.study-link` classes in research-notes.css. These are note-site components for research studies, not the Study app.

## Workflows to replace locally

- **rebuild-index.yml:** a weekly Sunday cron runs pytest, then `bin/build_index.py` with GITHUB_TOKEN, then commits `data/notes.json` and `feed.xml` if they changed. Replace it with a manual `python3 bin/build_index.py && pytest tests -q` run before committing.
- **tests.yml:** runs pytest on PRs and on manual dispatch. Replace it with the pre-commit hook or a manual run.

## Harvest (for a fresh CLAUDE.md)

- **Do not move or rename** `assets/research-notes.css` or `assets/fonts/*`. Other repos' note sites link them by absolute URL. Treat their class names (`body.hub`, `nav.top`, `.notes-list`, `.note-pager`, `.study-list`, `.feature-tile`, `.skip-link`) as a contract too.
- Notes come from public, non-fork repos owned by KiwiMaddog2020 that have the `research-note` topic. Removing the topic is how a note gets de-listed.
- An empty API result leaves the existing outputs untouched on purpose (fail-safe).
- Repo descriptions become titles and repo homepages become links. Homepages are validated by `_safe_page_url`, so keep that check.
- Build: `python3 bin/build_index.py` (uses GITHUB_TOKEN if set). Test: `python3 -m pytest tests/ -q`. Serve: `python3 -m http.server`.
- Run `bin/stamp-cache.py` before committing; the hook does this through `git config core.hooksPath .githooks`.
- `robots.txt` lists `trust-weighted-evals/sitemap.xml` (verified 200).
- `feed.xsl` styles the feed so it reads in a browser; the feed must stay valid Atom.
- House rules: no em-dashes, links must resolve, self-hosted fonts and no third-party origins on note pages. Code is MIT; the prose belongs to the owner.
- Old warning from `study/PLAN_V4.md:87`: an OOM when running the whole suite. It is likely moot once the quiz tests are gone.