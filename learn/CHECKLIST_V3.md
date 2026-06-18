# Learn Center v3: the binary feature checklist (the gate)

v3 replaces the noise-dominated 0-100 rubric (see BUILD_STATE.md plateau finding) with a
**fixed, binary per-feature gate**. Each item is either DONE (present + verified working) or
NOT. The build is complete when every box is checked and independently verified by the
decorrelated rater panel (Codex gpt-5.5 + Gemini CLI). No fuzzy scores; "present and works" or not.

Doer = Claude (Opus). Verifiers = Codex + Gemini, each checking items against the LIVE site and
the source. A box is only checked when the doer has verified it AND at least one rater confirms it
(or a ground-truth check -- curl, node --check, live preview -- confirms it when raters disagree).

## A. New interactive labs (engine widgets)

- [ ] A1. **Bootstrap CI simulator** -- resample a small score set, show the distribution of the
  mean and a 95% percentile interval that narrows with more resamples. Teaches why a point
  estimate needs an interval. Wired into an evaluating-ai lesson.
- [ ] A2. **ROC / PR threshold slider** -- a labeled-example set with scores; a draggable
  threshold updates TPR/FPR (and precision/recall) live and plots the operating point on an ROC
  curve. Teaches threshold choice and the precision-recall tradeoff. Wired into an evaluating-ai lesson.
- [ ] A3. **RAG retrieval / chunking sandbox** -- a short corpus, adjustable chunk size and top-k;
  a query retrieves the closest chunks (simple term-overlap score) and shows what would land in
  the prompt. Teaches chunking and retrieval tradeoffs. Wired into an agents lesson.
- [ ] A4. **Context-window budget visualizer** -- sliders for system / history / retrieved / output
  reservations against a fixed window; shows what overflows and gets truncated. Teaches context
  budgeting. Wired into a foundations or agents lesson.

Each lab: renders, is interactive (live recompute on input), math is correct (verified against a
hand calc), has a stated learning goal, and clears stale feedback on re-input (the v2 metric_lab bug pattern).

## B. Capstones (one per track)

- [ ] B1. **Foundations capstone** -- build + evaluate a tiny classifier (walk train/dev/test +
  read a confusion matrix to a decision). Multi-step, synthesizes the track.
- [ ] B2. **Agents capstone** -- debug a multi-step agent trace end to end (find the fault, choose
  the fix, justify it).
- [ ] B3. **Vibe-coding capstone** -- review an AI-generated patch (spot the bug, the missing test,
  the security issue; decide merge/revise/reject).
- [ ] B4. **Evaluating-AI capstone** -- design an eval for a stated capability (pick metric, build a
  rubric, choose a baseline, name the failure mode you would miss).
- [ ] B5. **Frontier capstone** -- read a frontier paper abstract + claim and judge it (what is
  measured, what is overclaimed, what evidence is missing).

Each capstone: is a distinct lesson, marked as a capstone, is genuinely multi-step (not a single
MCQ), uses a real interactive exercise, and ends the track's `next` chain.

## C. Breadth lessons

- [ ] C1. **F1 / precision-recall / AUC** -- the metric family, when each is right, what AUC means.
- [ ] C2. **Statistical significance / p-values / multiple comparisons** -- what a p-value is and is
  not, and the multiple-comparisons trap in eval.
- [ ] C3. **LoRA / PEFT / quantization** -- parameter-efficient finetuning and quantization tradeoffs.
- [ ] C4. **Transformer internals** -- residual connections, normalization, positional encodings.
- [ ] C5. **BPE tokenization (detail)** -- how byte-pair merges build a vocab; why token counts surprise.
- [ ] C6. **Privacy / copyright / fairness** -- training-data provenance, PII, fairness failure modes.
- [ ] C7. **MLOps / data pipelines / deployment monitoring** -- the lifecycle around a deployed model.

Each breadth lesson: accurate (no factual errors), em-dash-free, level-labeled, has key points +
verified links (curl 200) + flashcards + a quiz + an exercise, and is threaded into its track's nav.

## D. Navigation + craft

- [ ] D1. **Global index / tag view** -- a single route listing every lesson, filterable by track
  and level (and/or tag), each a direct link. Bookmarkable.
- [ ] D2. **Resume / continue learning** -- the landing surfaces the last-viewed (or next
  incomplete) lesson as a one-click "continue" affordance.
- [ ] D3. **Per-track mastery view** -- each track shows progress (lessons complete / total, and
  quiz pass state) at a glance.
- [ ] D4. **Clickable per-claim source links with last-verified dates** -- source metadata extended
  beyond frontier lessons; rendered as clickable links with a visible last-checked date.

## E. Content hygiene

- [ ] E1. **Dedup** the near-duplicate quiz/exercise pairs flagged in pedagogy review; no two
  lessons share a near-identical question.
- [ ] E2. **Global invariants hold**: all JSON parses; tracks.json order matches each track file's
  ids; all prereqs/next resolve; zero em-dashes across learn/; every link curl-200; learn.js
  `node --check` clean; live Pages deploy serves the new content.

## Verification protocol

For each item: (1) doer builds + self-verifies (preview, node --check, curl, hand-calc the math);
(2) commit + push live; (3) Codex + Gemini each get the checklist + the live URL and report, per
item, CONFIRMED / NOT / CANNOT-VERIFY with evidence; (4) any NOT gets fixed; (5) repeat until every
box is CONFIRMED by the doer AND corroborated (rater or ground-truth). Disagreements resolved by
ground truth (curl / node / live preview), never by re-running the score.
