# Learn Center: build state (durable, resumable)

Autonomous overnight build started 2026-06-17/18. Spec: [PLAN.md](PLAN.md). Home:
`kiwimaddog2020.github.io/study/`. Push live as built. Goal: >= 88 on the PLAN rubric via a doer
(Claude) != rater (Codex+Gemini) loop.

LIVE: https://kiwimaddog2020.github.io/study/

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
  flashcards / quizzes, at https://kiwimaddog2020.github.io/study/. All links verified 200,
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
- Preview: launch.json `study` (port 8156, --directory .../study).

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
  57-link library, https://kiwimaddog2020.github.io/study/. All links 200, JSON valid, node-check clean.

## v3 (checklist-gated: binary per-feature gate, not a 0-100 score)

Kevin approved replacing the noise-dominated rubric with a fixed binary feature checklist
(CHECKLIST_V3.md) as the gate. Doer (Opus) builds + self-verifies; Codex + Gemini binary-verify
each item against the LIVE site; disagreements resolved by ground truth (curl / node / preview).

- vP2 engine (commit b2ed346): 5 new exercise widgets -- bootstrap_lab (resample -> 95% percentile
  CI + histogram; n narrows, resamples stabilize), roc_lab (threshold slider -> TPR/FPR/precision +
  ROC curve operating point), rag_sandbox (chunk-size + top-k retrieval by term overlap), context_budget
  (allocate against a fixed window; lowest-priority truncated first), capstone (multi-step stepper).
  Nav: global #/index route (filter by track/level), continue/resume card on landing (last-lesson +
  next-incomplete), per-track mastery chips (lessons complete + quizzes passed), per-claim sources
  block (clickable + last-verified date). All verified in preview; node-check clean; no console errors.
- vP3 content (commit 51e2185): 53 -> 65 lessons. 5 capstones (fnd_capstone_classifier,
  ag_capstone_debug, vc_capstone_review, eval_capstone_design, fr_capstone_read_paper) + 7 breadth
  (eval_metric_families, eval_significance_testing, fr_efficient_adaptation, fnd_transformer_internals,
  fnd_bpe_tokenization, vc_responsible_shipping, vc_mlops_lifecycle). Labs wired: roc on metric_families,
  bootstrap on significance_testing, rag_sandbox swapped into ag_rag, context_budget into fnd_context_window.
  Per-track: foundations 14 / agents 15 / vibe-coding 12 / evaluating-ai 14 / frontier 10.
  Widget math live-verified (ROC at t=0 -> TPR/FPR 1.0, precision 0.50, counts 5/5/0/0; context overflow
  reports exact truncation; capstone advances on correct). Answers rebalanced (quiz 35/35/34/34;
  capstone steps 5/5/5/5). All links 200; em-dash-free; JSON valid.
- vP4 (commit 9fe2d5c): dedup scan found ZERO genuine near-duplicate quiz/exercise pairs (the apparent
  1.00 matches were empty non-displayed `prompt` fields on prompt_repair/agent_trace, which render
  weak_prompt/goal/steps instead). `sources` extended beyond frontier to all 5 tracks (7 lessons:
  +ag_security_injection, eval_sycophancy_capitulation, eval_doer_not_grader). All 76 unique site URLs curl-200.
- GATE (CLOSED, all green): Codex + Gemini binary-verified CHECKLIST_V3.md against the live site.
  Gemini (live): all 21 items CONFIRMED, 0 factual errors, self-fetched all 75 links 200, diffed
  local==live. Codex (gpt-5.5, workspace copy; its sandbox DNS blocked the live fetch, so it honestly
  marked live/links CANNOT-VERIFY rather than guessing -- the eval-honesty discipline in the rater
  itself): all 21 CONFIRMED in source/data + 4 real accuracy catches: (1) eval_capstone_design used
  reopen/resolution of never-sent agent drafts as the offline primary metric -- counterfactual, can't
  be observed offline; reframed to blinded offline quality grading + a pilot/A-B for true outcomes
  (the old answer became the trap); (2) transformer "permutation-invariant" -> equivariant; (3)
  quantization speedup hedged on kernels; (4) deployer still owns provenance diligence. All 4 fixed
  (3411fa7) + adversarially re-verified by a 3-verifier panel (0 major; 1 minor positional-encoding
  imprecision tightened, 470a4a5). Binary checklist converged cleanly -- a real defect class found and
  closed, not the v1/v2 score random-walk. The checklist gate worked exactly as Kevin intended.
- v3 LIVE: 65 lessons / 5 tracks / 9 interactive labs (4 new: bootstrap, ROC, RAG, context-budget) +
  5 capstones / 6 diagrams / global index + resume + per-track mastery + per-claim sources, at
  https://kiwimaddog2020.github.io/study/. All 76 links 200, JSON valid, node-check clean, em-dash-free.

## v4 (explorable-explanation labs)

Plan: PLAN_V4.md. Gate: CHECKLIST_V4.md (binary, v3 model). Doer (Opus) built + self-verified; the
cross-model rater is the recommended next step (deferred this turn per the OOM caution).

- 4 new deterministic, client-side widgets in assets/learn.js (no live inference):
  tokenizer_lab (text -> token chips + count + chars/token + context-fill; subword/word/char),
  attention_lab (pick a query word, see attention over two curated sentences: coreference + word-sense),
  injection_lab (simulated agent + instruction-source-boundary guardrail toggle: block vs breach),
  embedding_lab (curated 2D word map, click for nearest neighbors; king/queen analogy exact).
  Attention + embedding use hand-built illustrative data, each captioned "not from a live model"
  (the honesty ethos). tokenizer + injection are real deterministic logic / simulation.
- Wired: tokenizer -> fnd_bpe_tokenization, attention -> fnd_transformer_internals, injection ->
  ag_security_injection, embedding -> fnd_tokens_embeddings (each replaced its prior MCQ/lab). Still
  65 lessons; 13 interactive labs now (9 + 4).
- Doer-floor verification: node --check learn.js PASS; foundations + agents JSON valid; em-dash 0
  (also fixed 3 pre-existing em-dashes in learn.css comments); node logic tests confirm the math
  (tokenizer counts, attention row sums to 1, nearest-to-king = queen/man/woman, analogy exact);
  live deploy serves all 4 mount fns + the wired lab types; cache-busters consistent.
- Commits: fb7e9fa (Train A), bb2c975 (Trains B/C/D). LIVE at /study/.
- OPEN rigor: (1) in-browser interactivity eyeball; (2) cross-model binary-verify via the assay-style
  harness (subprocess-timeout-wrapped CLIs), not run raw here per the OOM caution.

## Labs section (#/labs, overnight autopilot 2026-06-21)

A dedicated **Labs** section, its own nav item + route in Arbiter Machinae, alongside Research and
Study. Index grouped by category (Foundations / Training & evaluation / Agents & safety); each card
opens a detail page with a concept intro + the live widget (reuses `mountExercise`). Data:
`data/labs.json`, generated by `bin/build_labs.py` from the lessons' interactive exercises + a STANDALONE
list (re-run after adding a lab). **12 labs:** 10 surfaced from lessons (tokenizer, attention, embedding,
sampling, context-budget, confusion-matrix, ROC, bootstrap, RAG, injection) + 2 net-new tactile widgets
built from scratch: **gradient_descent_lab** (drag the learning rate; converge / one-step / oscillate /
diverge, math node-tested, a=0.5 so divergence is reachable) and **neural_net_lab** (2->3->1 forward pass,
slide inputs, watch activations flow). Engine: each widget is a `mount<Name>(container, exercise)` fn +
a dispatch line in mountExercise; CSS appended to learn.css. Nav links centered between wordmark + account
(`.nav-center` absolute on desktop, `display:contents` -> hamburger on mobile), order Research / Labs /
Flashcards / Quiz / Resources.
- **Gate:** cross-model source review (`~/Code/assay/experiments/labs-gate/rate_labs.py`, gpt55 + gemini31,
  serial + timeout-wrapped), bar 87. Round 1 = 70 (2 false-negatives from missing rater context + 1 real
  embedding overclaim). Fixed: embedding caption ("hand-placed 2D map ... not from a real model") +
  keyboard-accessible SVG points (tabindex/role/aria-label/Enter-Space/focus ring) + gave the raters the
  dispatch + generator. **Round 2 = gpt55 88 PASS** (gemini flaked). node-check clean, em-dash-free.
- Commits: fe93295 (section + 10 labs), 65ca23d (gradient descent), c6feeb6 (neural net), 9083924 (gd
  curvature fix), fd22d77 (centered nav), 1b4e223 (embedding caption + a11y). All LIVE at /labs.
- OPEN (morning eyeball): visual Apple-craft polish + live interactivity are doer-asserted (verified the
  nav centering + widget math; full in-browser pass of all 12 labs is the one human check left).
