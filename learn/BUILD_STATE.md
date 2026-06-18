# Learn Center: build state (durable, resumable)

Autonomous overnight build started 2026-06-17/18. Spec: [PLAN.md](PLAN.md). Home:
`kiwimaddog2020.github.io/learn/`. Push live as built. Goal: >= 88 on the PLAN rubric via a doer
(Claude) != rater (Codex+Gemini) loop.

## Phase status

- [x] P0: plan + spec written; decorrelated plan audit DONE + folded. Codex+Gemini converged: passive
  reading+quizzes is mediocre -> added ACTIVE exercise types (spot_the_bug, agent_trace, predict_output,
  prompt_repair) to the schema; added competency metadata (outcome/prereqs/next) + frontier source
  discipline; sequencing = engine + ONE exemplar lesson to >=88 as the TEMPLATE, then replicate breadth.
- [~] P1: IN FLIGHT. Codex building engine (index.html + assets/learn.js + assets/learn.css + data
  scaffold + exemplar lesson `vc_trust_but_verify`). Gemini curating the link library in parallel.
- [ ] P2: lesson content across 5 tracks (Foundations, Agents, Vibe Coding, Evaluating AI, Frontier).
- [ ] P3: flashcards + quizzes per track.
- [ ] P4: resources/links library + Start-here path.
- [ ] P5: polish (a11y, responsive, dark mode, search, cross-links).
- [ ] GOAL LOOP: rate (Codex+Gemini) -> fix -> re-rate until both >= 88.

## Scores (goal loop)

(none yet)

## Resume notes

- Hub repo: ~/Code/kiwimaddog2020.github.io ; learn/ holds the center; data/ holds content JSON.
- Engines: Codex builds JS/engine + CSS from the schema; Gemini curates+fact-checks links/breadth;
  Claude authors pedagogy, defines schema, merges, and is the DOER (never the rater in the goal loop).
- Verify Codex/Gemini output before commit; verify links resolve; push + check Pages deploy each phase.
