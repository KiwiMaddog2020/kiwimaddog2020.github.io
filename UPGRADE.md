# UPGRADE.md

Audit and upgrade of the Arbiter Machinae research site and its six research repos.
This file is the resume point: a new session should read it and continue from the
first unchecked phase. Status: **approved 2026-11-14. Order: Phase 1, then Phases 2 and 3 back to back, then pause for Kevin.**

Session branch in every repo: `ccr-9a96b288-mubiy9`. One commit per phase, no force-push, no PR.

## Decisions from the interview (2026-11-14)

- Site repo: full upgrade. Six research repos: light tidy plus fresh study runs.
- Site becomes research only. The Study app (lessons, quiz, flashcards, sign-in) is retired and archived.
- Visual identity: "Lab notebook" (mockup B), with a proper dark mode. Mockups: https://claude.ai/artifact/PdjpKDfSU9V4tCc8nWFtWt
- Reruns: the core three studies, small and Claude only. No Gemini or Codex arms this pass.
- Presentation upgrades, all four approved:
  1. Playable figures: interactive hand-sketched charts driven by real run data, drawn by one small in-house renderer.
  2. Chalkboard dark mode: slate and chalk theme, desk-lamp toggle that sweeps the theme across the page.
  3. Red-pen honesty: animated strikethrough corrections, handwritten margin notes, taped status labels, then-vs-now flip cards (flip cards land with the reruns in Phase 5).
  4. Paper-like motion: page-turn transitions, pencil reading-progress line, charts that sketch in on scroll, tilting cards, tipping scale logo.
  All motion must leave the page complete with reduced-motion on and in browsers without the newer APIs.

## Baseline (undo points)

| Repo | Baseline commit | Checks at baseline |
|---|---|---|
| kiwimaddog2020.github.io | d5a64298e3b8622b348ae7b2137574fdd13b3576 | 13 tests pass, 1 test never finished (see decision log), pages load with no console errors |
| trutina | f5d94eab495e84fb94d4c109267fb6ebd5720ac4 | 144 tests pass (needs pyyaml, `PYTHONPATH=.`) |
| rag-lab | 0887f0ad6ef020d567f88bebb90b03beabd2523c | 83 tests pass, ruff clean (`PYTHONPATH=src`, numpy) |
| trust-weighted-evals | c2d5ec2282582b61440afb680b5f39cc5f776be7 | 94 tests pass, 27 hook cases pass |
| decorrelation-study | bc0d414d0b68b9ec4957bcd32b2b65db73ad3435 | `make repro` reproduces published numbers |
| self-improvement-gate | 2c510ee7fa71773bb900983cbfd26deb13561cf5 | 8 tests pass |
| evaluating-claude | 3c244e2285eb9fe7cccd4a9624286816a3c3dc08 | no code, docs only |

Nothing was broken at baseline. Full lane reports are saved in `docs/upgrade-lanes/`.

## Ranked findings (verified by the orchestrator unless marked)

1. **Internal planning docs are live on the public site.** `_config.yml:8` does not exclude `study/*.md` or `data/SCHEMA.md`, so pages such as `/study/PLAN.html` and `/study/FIREBASE_SETUP.html` are published and in the sitemap. (Live 200s reported by lane A; config verified.)
2. **The notes list only exists inside the Study app.** `assets/learn.js:995` is the only renderer of `data/notes.json`. Removing Study without a replacement would remove the research index.
3. **Firebase web config is committed** at `assets/learn.js:195-201` (project `blog-and-research`). These keys are public by design, but once Study is retired the Firebase project should be deleted or locked. Only Kevin can do that.
4. **Scoring bug: wrong answers can be graded correct.** `trutina/experiments/eval-awareness/metrics.py:92-94` accepts any answer that contains the key as a substring ("14" passes for key "4"). Matters for every calibration number, and badly for the unrun 72-item frontier bank where 34 keys are 1 to 2 characters.
5. **Scoring bug: table headers count as findings.** `decorrelation-study/harness/score.py:31-38` treats any line with a pipe as a defect flag, so a header row becomes a false positive on clean snippets. Also credits any flag within one line of a defect regardless of what it says (`score.py:71-77`).
6. **Retired model IDs are hardcoded defaults** in `rag-lab/src/rag_lab/generate.py:45`, `judge.py:61`, `relevance.py:57`, `eval_rag.py:98-99,133`, `scripts/run_rag_paid.sh:32`, and in `trutina/trutina/demo.py:94,200-207`.
7. **Live pages link into Study routes** that will stop existing: `rag-findings/index.html:70-71`, and `work/index.html:271-290` is a case study about the Study app with stale counts.
8. **`data/notes.json` was hand-edited away from its generator.** `bin/build_index.py:124-131` always writes a `date` field the file lacks; the next rebuild overwrites the hand edits.
9. **Five GitHub workflows** to remove: site `rebuild-index.yml` and `tests.yml`, `trutina/.github/workflows/ci.yml`, `rag-lab/.github/workflows/ci.yml`, `self-improvement-gate/.github/workflows/test.yml`. No README badges point at them. The weekly index rebuild becomes a documented local command.
10. **Performance.** Two fonts are preloaded that no stylesheet uses (`_layouts/default.html:32-33`, about 86KB wasted per page); `work/` ships 2000px+ PNGs up to 896KB with no lazy loading; `work/index.html:19-21` pulls Google Fonts against the site's own self-hosting rule.
11. **Stale process docs** to archive: site `study/*.md`, `docs/SITE_AUDIT_*`, `docs/DESIGN_CRITIQUE_*`; `rag-lab/.claude/`, `rag-lab/docs/CODE_RATING_*`, `A_TIER_PLAN_*`; `trutina/RESEARCH_AUDIT_2026-07-10.md` and the `RUN_STATE` / `MORNING_BRIEF` / `CODEX_BRIEF` files under `experiments/`.
12. **Missing licence** in `rag-lab` and `decorrelation-study`.
13. **Stale copy.** Social card alt text says "19 studies, 3 production models" (`_layouts/default.html:21,26`); README describes `index.md` markers that no longer exist (`README.md:10-11`); 3 em-dashes in `work/index.html`.
14. **Calibration metric is weak at the ceiling.** `calibration*/analyze.py:33` puts 90 to 100% confidence in one bin, so ECE just equals overconfidence. The rerun will report Brier and right-vs-wrong confidence instead.
15. Minor: `bin/build_index.py:106-113` does not filter archived repos; `bin/stamp-cache.py` and `_api` are untested; analysis scripts overwrite committed results in place.

No secrets were found in the six research repos. Pre-registrations, audits and run data in the research repos are the research record and stay untouched.

## What the outside research says (summary; full notes in docs/upgrade-lanes/C-literature.md)

- Self-preference in grading is confirmed by larger studies; a panel of judges reduces it but does not remove it.
- Complementary blind spots across models are partly confirmed. The open question is whether the gain comes from diversity or just from a stronger reviewer, and the baseline to beat is the same model reviewing again in a fresh session (Song, Oct 2026).
- When two models are both wrong they give the same wrong answer about 60% of the time, and stronger models are more correlated (Kim et al.).
- Frontier models are still overconfident; Claude tends to be the best calibrated. Nothing published yet on the newest Claude generation.
- Evaluation awareness rises with each model generation. Sycophancy tests of 3 to 5 turns understate the problem; collapse grows out to 25 turns.
- Anthropic's own guidance now matches several of this site's rules: separate skeptical evaluator, graders validated against humans, repeats with confidence intervals.

## Phased plan

- [x] **Phase 1. Foundation (all seven repos).** Agentic reset and archive of stale process docs to `docs/archive/`; one fresh CLAUDE.md per repo; remove all five workflows and replace with a local `bin/check.sh` (or documented command); stop publishing the internal planning docs; add MIT licence to rag-lab and decorrelation-study (matches the other five). Tests must match baseline.
- [x] **Phase 2. New site: Lab notebook identity.** New design tokens with light and dark themes, new research-first home page that renders the notes list without the Study app, the four approved presentation upgrades (sketch chart renderer and first playable figure on the home page, chalkboard dark mode with lamp toggle, red-pen and margin-note components, paper motion layer), self-hosted fonts only, unused font preloads dropped. Study app, lessons, quiz, flashcards and sign-in archived. *Rewrite, not a restyle: the old home page is the Study app itself, so there is nothing to preserve.*
- [x] **Phase 3. Note pages and the rest of the site.** Playable figures and red-pen components made available to note pages through the shared stylesheet and one shared script. Restyle the shared stylesheet (keeps its filename and class names, so all note sites pick up the new look at once), fix `rag-findings` and `work` pages (dead links, stale Study case study removed, images shrunk, fonts self-hosted, em-dashes), new social card, regenerate `notes.json` and feed from the generator, README rewritten, tests for the index builder and cache stamper.
- [x] **Phase 4. Scoring fixes and core-three reruns.** Fix findings 4, 5 and 14 with tests, keeping the original scoring available so old numbers still reproduce. Then run, Claude only, four tiers (Haiku 5.5, Sonnet 5.5, Opus 5.5, Fable 5.2), about 60 to 80 helper calls in total:
  - A. Code-review blind spots: 20 snippets, two fresh-session reviews per tier. New question: do different Claude tiers cover for each other, or is a second look from the same model just as good?
  - B. Calibration: hard bank plus the never-run 72-item frontier bank, exact-match scoring, plus how often tiers share the same wrong answer.
  - C. Self-preference: each tier answers, every tier grades blind, with the corrected two-way analysis.
  - New data goes in new folders. Published July results are never overwritten.
- [ ] **Phase 5. Research refresh on the site.** A new note, "What changed since July", combining the literature review and the then-vs-now rerun results; each existing note gets an honest status line (holds, revised, superseded, not retested); `evaluating-claude` field guide updated where the evidence moved.
- [ ] **Phase 6. Research repo tidy.** Update retired model defaults in rag-lab and the trutina demo, loosen-or-raise stale dependency floors after checking real current versions, fix stale claims in READMEs, comments that narrate old edits.
- [ ] **Phase 7. Wrap.** Move this file to `docs/archive/`, final report with everything parked or unverified.

Proof for every phase: tests pass against baseline, new tests cover touched code, a different model reviews the diff, and visual changes are checked in a real browser in both themes and at phone width.

## Lane map

| Phase | Who writes | Who reviews | Branch |
|---|---|---|---|
| 1 | Sonnet lanes, one per repo group (site / trutina+rag-lab / the other four) | Orchestrator | `ccr-9a96b288-mubiy9` (lanes work in separate repos, so no collisions) |
| 2, 3 | Orchestrator (design judgment) | Opus lane | same |
| 4 scoring fixes | Opus lane | Orchestrator | same |
| 4 reruns | Haiku, Sonnet, Opus, Fable helpers as blind subjects; orchestrator scores with scripts only | Opus lane audits the analysis | same |
| 5 | Orchestrator | Opus lane fact-checks every number against the data | same |
| 6 | Sonnet lanes per repo | Orchestrator | same |

Lanes run as in-session helpers. Cloud sessions are not needed at this size.

## Parked

- Gemini and Codex arms of every study (out of scope by Kevin's choice).
- Scrubbing the Firebase config from git history (Kevin's call; the keys are public-by-design web config).
- Deleting or locking the `blog-and-research` Firebase project (only Kevin can; flagged for the Phase 2 summary).
- Repos not attached to this session: oneshot-bench, craft-fit-rating, audioscan. Their note pages will inherit the new shared stylesheet but cannot be edited or checked here.
- The frontier bank's pre-registered three-family pilot gate cannot be applied in a Claude-only run; the rerun will be labelled exploratory.
- Branch protection: if any repo requires a removed workflow check before merging, only Kevin can change that rule.

## Decision log

- 2026-11-14: One master UPGRADE.md lives in the site repo and covers all seven repos, instead of seven copies.
- 2026-11-14: Reruns batch several items per helper call to keep usage sane. This deviates from the original one-item-per-call protocol and will be stated on the results.
- 2026-11-14: The newest model is both the orchestrator and a test subject. Prompts are built by script from templates and scored only by script, and the subject copies are fresh helpers that never see the answer keys.
- 2026-11-14: Added a same-tier second review to study A so the result can be compared with the fresh-session baseline from the outside literature.
- 2026-11-14: Shared stylesheet keeps its path and class names (published contract with the note sites).
- 2026-11-14: MIT chosen for the two unlicensed repos to match the other five and the `pyproject.toml` declarations.
- 2026-11-14: Archived docs go to `docs/archive/` and that folder is excluded from each repo's published Pages site, so archiving never publishes anything new.
- 2026-11-14: No animation library. Motion uses CSS, the View Transitions API and a small hand-written script, to keep pages light and free of third-party origins.
- 2026-11-14: Baseline correction. The site suite was not fully green: `test_note_repos_paginates_across_pages` looped forever and was killed for memory, because its fake matched `page=1` inside `per_page=100`. Fixed the fake, added a 20-page cap to `note_repos()` and a test for it. Site suite is now 18 passed.
- 2026-11-14: Phase 1 done in all seven repos. In trutina, `polish-anatomy/STATE.md` and `conversation-drift/CODEX_BRIEF.md` were left in place because other files cite them.
- 2026-11-14: Phase 2 done. Home page is static HTML with generated note cards (`bin/build_index.py`, `--offline` to re-render without the network); the Study app is archived under `docs/archive/study-app/`, with `/study/` and `/learn/` left as redirect stubs so old links land on the home page.
- 2026-11-14: Fonts are Bricolage Grotesque, Source Serif 4, Source Sans 3 and Caveat, all self-hosted (OFL). No animation library: View Transitions, CSS scroll timelines and one small shared script (`assets/notebook.js`).
- 2026-11-14: Baseline correction. The old pagination test looped forever (its fake matched `page=1` inside `per_page=100`); fixed the fake and capped the generator at 20 pages.
- 2026-11-14: Phase 2 review (different model, read-only) found 8 items; all fixed: figure under reduced motion, layout shift when the figure loads, lamp button without scripts, label injection hardening, generator writing outputs before validating the home page, `.byline` centring restored, two copy fixes, chip border contrast.
- 2026-11-14: `data/notes.json` was not regenerated from GitHub (API not reachable from the session). Titles in it are the committed ones; a networked rebuild will replace them with repo descriptions.
- 2026-11-14: Phase 3 built and committed: RAG findings page rethemed, work page cleaned up (Study case study removed, fonts self-hosted, images shrunk), new social card and icons (sources in `docs/brand/`), README rewritten, cache-stamp tests, font licence note (`docs/FONTS.md`), phone nav fixed for note pages without a menu button. All seven repos pass their checks. The different-model review of this phase is still running; its fixes land as a follow-up commit before the phase is ticked.
- 2026-11-14: `rag-lab/docs/findings.html` (the generator's copy of the findings page) was not re-synced with the hub's rethemed copy; left for Phase 6.
- 2026-11-14: Phase 3 review (different model, read-only) found 8 items; fixed: four note layouts still pointed at the old social card, heat map unreadable on the chalkboard (cells now outlined, caption corrected), stale copy and screenshot on the work page, real Cormorant italic self-hosted, pre-commit hook now re-stages every stamped page, wrong axis labels on two RAG charts (0.25 and 0.75 were shown as 0.2 and 0.8, an older bug), unused font face removed. Left as is: note sites link the shared stylesheet without a cache stamp, so a hub style change can take about ten minutes to show there.
- 2026-11-14: Not verified: the real GitHub Pages build (checked with a local Jekyll build only), browsers without `:has()` (simulated), and how social sites refresh the card.
- 2026-11-14: Phase 4 done. Scoring fixes are opt-in switches so every July number still reproduces byte for byte: `SCORE_HEADERS=1` and `SCORE_DESCRIBED=1` in decorrelation-study, `correct_strict()` in trutina. Header mode keeps a flag with an off-list type when it has a line number (the first draft dropped real flags).
- 2026-11-14: Phase 4 deviation from "one commit per phase": each pre-registration was committed before its data, as its own commit, so the record shows the rules came first. Data, amendments and review fixes follow as separate commits.
- 2026-11-14: Phase 4 helper calls: 71 in total, all checked from their transcripts for serving model and tool use. Code review 32 (plus 3 pilot calls, kept unscored: they showed line numbers were being read from the prompt file, so each snippet became its own file, amendment 1). Calibration 20. Self-preference 16 plus one rerun of an incomplete reply (amendment 2, written before any grading).
- 2026-11-14: Result, code review (decorrelation-study `round3/`): pairing two different Claude tiers gained no more than a second look from the same tier. Difference 0.04 defects, 95% interval -0.58 to 0.67. All four tiers together caught 27 of 30; one defect was missed by every review.
- 2026-11-14: Result, calibration (trutina `experiments/claude-tiers-2026-11/calibration`): ceiling. Every tier scored 98.6 to 100% on both banks, so the banks no longer separate models. All tiers read slightly underconfident, which is close to automatic at a ceiling. July's Opus 4.8 was slightly overconfident on the same hard bank.
- 2026-11-14: Result, self-preference (same folder, `self-preference/`): Claude tiers favour their own tier's text by +1.00 point on a 100-point scale, 95% interval +0.32 to +1.77. Haiku (+3.65) and Fable (+1.90) clear zero; Sonnet and Opus do not. Ten prompts, one family.
- 2026-11-14: Phase 4 review (different model, read-only) recomputed one headline number per study and all matched. Fixed: the two trutina result files now state the pre-registered verdicts and drop a limit that amendment 1 had superseded. Left as is and noted: in the opt-in "described" scorer an untyped flag gets type credit (no effect on any result here; changing it would touch the tie-break the July numbers used); a snippet-level bootstrap gives 0.00 to 0.67 for the code review difference, same verdict.
- 2026-11-14: Lanes finished in Phase 4 and safe to clear: E (scorer switches), F (rerun tooling), the Phase 4 review lane, and all helper sessions.
