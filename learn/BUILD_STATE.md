# Learn Center: build state (durable, resumable)

Autonomous overnight build started 2026-06-17/18. Spec: [PLAN.md](PLAN.md). Home:
`kiwimaddog2020.github.io/learn/`. Push live as built. Goal: >= 88 on the PLAN rubric via a doer
(Claude) != rater (Codex+Gemini) loop.

LIVE: https://kiwimaddog2020.github.io/learn/

## Phase status

- [x] P0: plan + spec written; decorrelated plan audit DONE + folded. Active exercise types added
  (spot_the_bug, agent_trace, predict_output, prompt_repair) + competency metadata + frontier source
  discipline.
- [x] P1: engine LIVE. index.html (no front matter, deploy-safe) + assets/learn.js (hash-router SPA) +
  assets/learn.css + data scaffold. Routes verified: landing, track, lesson, resources, flashcards,
  quiz. Interactivity verified. Commit 2c96ae8.
- [x] P2: lesson content across all 5 tracks LIVE. 44 lessons total: Foundations 9, Agents 11,
  Vibe Coding 9, Evaluating AI 8, Frontier 7. Each with summary, body, key_points, verified links,
  flashcards, quiz; 16 interactive exercises across the set. Em-dash-free; all links verified 200.
  Commits 676a69f (foundations), 75c1f69 (agents), 8407c00 (vibe), beaaece (eval), 289f956 (frontier).
- [x] P3: flashcards + quizzes per track LIVE. Embedded per-lesson; the engine aggregates per-track +
  mixed decks/quizzes automatically (flashcards hub 6 decks, quiz hub 6 quizzes verified).
- [x] P4: resources library LIVE. 35 verified links (7 per track, 5 start-here), filterable by
  track + level; Start Here section. Verified renders all 35.
- [~] P5: polish. Search/jump LIVE; prereqs surfaced on track cards; flashcard flip motion;
  remaining: dark/light verify, deeper a11y, cross-links to research notes.
- [~] GOAL LOOP: round 1 rated + fixed; round 2 rating in flight.

## Scores (goal loop)

- Round 1 (rate): Codex 70, Gemini 76 (both < 88). Convergent findings: broken Start-here CTA;
  factual errors (gradient direction, causal attention, discrimination overclaim, CI-overlap
  fallacy, hallucination monocausal, reasoning over-definitive); 82/89 quiz answers at index 1;
  27/44 lessons had no exercise; no global search; prereqs.json not surfaced.
- Round 1 (fix), all committed + pushed live:
  - engine: dynamic CTA, global #/search + hero box + nav link, prereqs on track cards,
    title dedup, flashcard flip motion.
  - accuracy: all six flagged factual errors corrected across foundations/eval/frontier.
  - interactivity: exercises added to all 27 missing lessons (44/44 now); every MCQ answer
    position deterministically rebalanced by rotation (quiz now 22/21/22/24 across 0-3).
- Round 2 (rate): Codex 73, Gemini 85. Codex (harsh) wanted production breadth +
  diagnosis-level interactivity + 6 more subtle overclaims; Gemini wanted engine UX
  (flashcard loop, trace highlights, bookmarkable search, link aggregation).
- Round 2 (fix), all committed + pushed live:
  - accuracy: 6 more nuances (quadratic attention cost, decoder-only scope, embedding
    geometry caveat, multi-round post-training, doer/grader 'one of largest', MCP
    'addresses' not 'fixes', median even-length).
  - links: canonical non-redirecting URLs (platform.claude.com, developers.openai.com,
    autogen /stable/).
  - engine UX: lesson-link aggregation into resources (47), flashcard completion +
    hide-known, agent_trace correctness highlights + validation, bookmarkable
    #/search/<q>, dynamic crumb, frontier source metadata, search-row layout fix.
  - breadth: +5 production lessons (RAG, prompt-injection/security w/ agent_trace,
    production observability, data quality + leakage, multimodal/MoE/distillation).
    44 -> 49 lessons; answers rebalanced to 25/24/25/25.
- Round 3 (rate): IN FLIGHT (Codex + Gemini).
- Now 49 lessons across 5 tracks; 49 exercises; 47-link resources library.

## Verify ledger (what was checked)

- All JSON parses; tracks.json lesson order matches each track file's ids (set + count).
- All prereqs/next references resolve to real lesson ids.
- Zero em-dashes across learn/ (grep clean).
- Every lesson + library link curl-verified 200 (OpenAI reasoning post 403'd to non-browser clients,
  swapped for arxiv test-time-compute paper in lesson + library).
- Live Pages deploy serves new content (live agents.json = 11 lessons).

## Resume notes

- Hub repo: ~/Code/kiwimaddog2020.github.io ; learn/ holds the center; data/ holds content JSON.
- Engine reads each track's lessons file and orders by tracks.json `lessons` id-list (unlisted -> 999).
  Flashcard/quiz decks build from each lesson's embedded arrays. So adding a lesson = add to the track
  file AND to tracks.json `lessons`.
- Claude is the DOER (authors pedagogy, merges, verifies). Codex+Gemini are RATERS in the goal loop
  (never Claude). Verify agent output before commit; verify links resolve; push + check deploy each phase.
- Preview: launch.json `learn-center` (port 8156, --directory .../learn).
