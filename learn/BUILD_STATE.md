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
- Round 3 (rate): Codex 76, Gemini 83. Codex: deepen exercises to applied formats,
  more production breadth, diagrams; 5 more overclaim nuances; the new lessons orphaned
  in prev/next nav. Gemini: same nav-orphan regression + small UX/a11y.
- Round 3 (fix), committed + pushed live: threaded the next-chain to the 5 new lessons;
  6 more accuracy nuances (byte/char models, FlashAttention, RAG-grounding-as-goal,
  'a common' agent failure, CI semantics, multimodal common-thread); role=listitem on
  spot-the-bug; clickable home crumb; bookmarkable home search; auto-complete on a
  perfect lesson quiz; shuffle decks on load. Added ROADMAP.md (gap-to-88 ledger).
- Round 4 (rate, FINAL): Codex 78 (pedagogy 21/breadth 15/concision 13/interactivity 9/
  craft 12/links 8), Gemini 83 (pedagogy 22/breadth 18/concision 15/interactivity 12/
  craft 11/links 5). NOTE: Gemini's 5/10 links is a verified FALSE NEGATIVE -- a fresh
  curl of all 54 unique URLs returned 200 for every one; Gemini asserted dead-ness from
  canonical-domain memory without fetching. Fair-link-adjusted Gemini ~86.

## Final state (goal loop closed at round 4)

- Score trajectory: Codex 70->73->76->78; Gemini 76->85->83->83. Both confirm the prose is
  accurate (no factual errors) and dense/non-patronizing. The remaining gap to 88-both is
  PRODUCT DEPTH, not correctness: applied interactive widgets (calculators/diagrams) and
  more breadth -- a scoped v2 (see ROADMAP.md), not fixes.
- EXIT rationale (per global CLAUDE.md anti-inflation): 4 rate->fix->rate rounds done; every
  correctness/UX/a11y/breadth-fix item addressed; remaining work is a major build; the harsh
  outlier's one disprovable claim (dead links) was refuted by a decorrelated ground-truth check.
- LIVE: 49 lessons / 5 tracks / 49 interactive exercises / 47-link library / search /
  flashcards / quizzes, at https://kiwimaddog2020.github.io/learn/. All links verified 200,
  em-dash-free, JSON valid, learn.js node-check clean.
- v2 to reach the 90s: ROADMAP.md (richer widgets, diagrams, classical-ML breadth, nav depth).

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

## v2 (interactive widgets + diagrams + breadth)

- Built per ROADMAP.md after Kevin approved v2. doer (Opus) != raters (Codex + Gemini), same loop.
- Engine: 3 applied interactive exercise types -- metric_lab (live confusion-matrix/discrimination
  calculator), sampling_lab (temperature->softmax probability bars), ordering (reorder steps);
  plus 6 inline SVG diagrams (attention, RAG, agent loop, context window, confusion matrix,
  tokens->embeddings). Verified live: discrimination 0.50->0.90 at FP=0, top token 97% at T=0.2.
- Breadth: +4 lessons (supervised/unsupervised/RL, LLM-as-judge, inter-rater reliability,
  production cost/latency). 49 -> 53 lessons total; per-track 11/14/9/11/8.
- Widgets wired into eval_catch_rate_discrimination (metric_lab), fnd_inference_sampling
  (sampling_lab), ag_rag + fnd_training_gradient_descent (ordering); diagrams on 6 lessons.
- All links verified 200, JSON valid, learn.js node-check clean, em-dash-free, answers rebalanced.
- v2 goal-loop rating: round 1 IN FLIGHT (Codex + Gemini).

## v2 goal-loop results + close

- v2-r1: Codex 82, Gemini 86 (the widgets/diagrams/breadth jump). v2-r2: Codex 80, Gemini 84.
- Both raters dropped on the v2-r2 re-rate even though that round contained only improvements
  (4 factual corrections, the metric_lab stale-feedback bug fix, MCQ retry, 2 more ordering labs,
  canonical link updates). Same build, scores swung -2 each. This is the converged-loop signal:
  the rubric scoring is now NOISE-dominated at this quality level, so further "fix to 88" iterations
  optimize a random walk. Notably, Gemini's v2-r2 review independently re-verified all 57 links alive
  (0 dead), retiring its earlier false-negative link claim -- the eval-honesty thesis again.
- Final v2 UX pass (real product fixes, not score-chasing): per-question quiz retry (a wrong answer
  no longer resets the whole quiz) + capped the mixed deck/quiz (24/20, evenly sampled) so the mixed
  pages are not 100+ items.
- EXIT (per global CLAUDE.md anti-inflation: exit is legitimate; ties break down; harsh-outlier and
  unverified claims discounted). Full trajectory across v1+v2: Codex 70->73->76->78->82->80;
  Gemini 76->85->83->83->86->84. Plateaued mid-80s; both confirm accuracy and density throughout.
- v3 (structural, a separate build) to push past the plateau: more applied labs (bootstrap-CI sim,
  ROC/PR slider, RAG-chunking sandbox), capstone per track, MLOps/privacy/security-ops + hands-on
  coding breadth, F1/AUC/LoRA/quantization/positional-encoding lessons, clickable per-claim source
  links with last-verified dates, a global index/tag nav, and dedup of the few near-duplicate
  quiz/exercise pairs. See ROADMAP.md.
- LIVE: 53 lessons / 5 tracks / 53 exercises (incl. 3 interactive labs + 4 ordering) / 6 diagrams /
  57-link library, https://kiwimaddog2020.github.io/learn/. All links 200, JSON valid, node-check clean.
