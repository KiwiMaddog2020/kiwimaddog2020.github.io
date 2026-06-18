# Learn Center: v2 roadmap (the gap-to-88 ledger)

This is the honest "not-measured / not-yet-built" ledger for the Learn Center, in the
spirit of the [Evaluating AI Honestly](https://kiwimaddog2020.github.io/learn/#/track/evaluating-ai)
track. The v1 build was rated by a decorrelated Codex + Gemini panel across four rounds;
both raters agree the content is accurate and the prose is strong, and both place the
remaining gap to a 90s score in **product depth**, not correctness. Those depth items are
a deliberate v2, scoped here.

## Where v1 landed

- 49 lessons across 5 tracks (Foundations, Agents, Vibe Coding, Evaluating AI, Frontier),
  every lesson with key points, verified links, flashcards, a quiz, and an interactive exercise.
- 47-entry resource library (curated + aggregated lesson links), filterable, with a Start-here path.
- Search, flashcards (with completion + spaced review), quizzes (auto-complete on a perfect score),
  and four active exercise types. Honest source metadata on frontier lessons.
- Both raters: no factual errors in the prose; dense, level-labeled, non-patronizing.

## What would close the gap to a 90s score (v2)

1. **Richer interactive widgets (highest leverage).** The current exercises are MCQ-shaped
   (predict_output / prompt_repair / spot_the_bug / agent_trace). Add applied formats that need
   new engine widgets: a confusion-matrix / discrimination calculator, a temperature-sampling
   demo, a tokenizer playground, an embedding-distance widget, and ordering tasks. This is the
   single most-requested upgrade from both raters.
2. **Diagrams and visual learning.** The site reads like dense notes. Add inline SVG diagrams for
   tokens, attention, the context window, the RAG retrieve-augment-generate loop, the agent loop,
   and a confusion matrix. Wire the existing `tracks.json` `icon` ids to real SVGs.
3. **More breadth.** Classical ML (supervised vs unsupervised, train/dev/test, core metrics),
   LLM-as-judge rubric design, inter-rater reliability, red-teaming, tool permissioning,
   current benchmark families, and production cost/latency tradeoffs.
4. **Navigation depth.** A persistent lesson sidebar, prev/next controls in the lesson view,
   level/track filters inside search, and a "resume where I left off" affordance.
5. **Link hygiene at scale.** Add `last_checked` metadata per link and a CI link-checker so the
   library ages honestly; widen sources so the same few links are not reused across lessons.
6. **Source discipline everywhere.** Extend the `source` metadata beyond frontier lessons to the
   agent-security, eval-methodology, and vibe-coding claims that age quickly.

## Known limitations (carried, not hidden)

- Exercises are recognition/diagnosis MCQs, not yet applied calculators or builders.
- No diagrams yet; visual learners are underserved.
- Lesson "complete" is auto-set on a perfect quiz but is otherwise a manual toggle.
- The site is intentionally served from the hub root, so a learn-rooted local server cannot
  resolve the absolute `/assets/research-notes.css`; this is correct for the GitHub Pages
  deployment, not a production bug.

## v2 shipped (2026-06-18) + where it landed

v2 added the depth both raters asked for: three applied interactive widgets (a live confusion-matrix
/ discrimination calculator, a temperature->softmax visualizer, ordering tasks), six inline SVG
diagrams, and four breadth lessons (classical ML, LLM-as-judge, inter-rater reliability, production
cost/latency). 49 -> 53 lessons. The goal-loop ran two more rounds: Codex 78->82->80, Gemini 83->86->84.

The loop then plateaued: a re-rate of a strictly-improved build moved both scores *down*, which means
the rubric scoring is noise-dominated at this quality level. Exited per anti-inflation discipline.
Both raters confirm the content is accurate and dense throughout; the gap to a stable 88+ is structural.

## v3 (would push past the mid-80s plateau)

- More applied labs: a bootstrap confidence-interval simulator, an ROC/PR threshold slider, a RAG
  chunking/retrieval sandbox, a prompt-injection permission sandbox, a context-window budget visualizer.
- One capstone per track (build+evaluate a tiny classifier, debug an agent trace, review an AI patch,
  design an eval, read a frontier paper).
- Breadth: F1/AUC/PR curves, statistical significance, LoRA/PEFT, quantization, residual connections,
  normalization, positional encodings, BPE tokenization, privacy/copyright/fairness, MLOps/data pipelines.
- Source discipline: clickable per-claim source links with last-verified dates, beyond frontier lessons.
- Navigation: a global index/tag view, per-track mastery, "continue learning," randomized quiz mode.
- Dedup the few near-duplicate quiz/exercise pairs flagged in pedagogy review.
