# Learn Center: build plan (the spec)

A free, interactive learning center at `kiwimaddog2020.github.io/learn/` -- a Khan-Academy-style site
for vibe coding, working with AI agents, LLM research, and machine learning. Concise, level-labeled,
non-patronizing (expert content uses expert language; simple never means dumbed-down). Static
HTML/CSS/vanilla-JS, no build step, GitHub Pages friendly, reusing the hub's bronze-on-ink house style.

## Principles (the voice + pedagogy)

- **Concise and dense, not thin.** One tight paragraph mental model per concept, then depth via links.
  No filler, no "as you can see", no babying. Plain human voice, em-dash-free.
- **Level-labeled, honestly.** Every lesson and link tagged Beginner / Intermediate / Advanced /
  Expert. Expert material may assume the vocabulary of the level; it is not simplified into mush.
- **Learn by doing.** Each lesson ends with flashcards (recall) and a short quiz (check). A reader can
  self-test, not just read.
- **Curated, not exhaustive-for-its-own-sake.** Point to the best free resource for each idea
  (3Blue1Brown, Karpathy, Distill, the original papers, official docs) rather than reproduce them.
- **Honest about uncertainty.** Where the field is unsettled or a claim is contested, say so.

## Information architecture

- `/learn/` landing: what this is, "choose your path", the 4-level legend, a card per track, a
  "Getting Started" shortcut, and a global search/jump.
- Tracks (each a track page listing its lessons in order, with level badges):
  1. **Foundations of ML** (Beginner -> Advanced): what a model/weight is, neurons and layers,
     activations, training and gradient descent, loss, overfitting and generalization, tokens,
     embeddings, attention and transformers, pretraining vs fine-tuning, RLHF and preference tuning,
     inference/sampling/temperature, the context window. (Absorbs + expands the trutina
     foundations primer.)
  2. **Working with Agents** (Beginner -> Expert): what an agent is, the agent loop, tool use,
     prompting agents, context management and memory, planning and decomposition, multi-agent and
     orchestration, MCP and tool ecosystems, evaluating agents, failure modes and guardrails, when an
     agent is the wrong tool.
  3. **Vibe Coding** (Beginner -> Expert): what vibe coding is, the coding-model landscape (Claude
     Code, Codex, Cursor, etc.), effective prompting for code, plan-first and small commits, review
     and verification (trust but verify), debugging with AI, reading AI-written code, the human in the
     loop, when to take the wheel back.
  4. **Evaluating AI honestly** (Intermediate -> Expert): the doer never grades its own work,
     catch-rate vs discrimination, decorrelation vs competence, pre-registration, confounds, bootstrap
     confidence intervals, the noise floor, sycophancy and capitulation, the "not measured" ledger.
     (Absorbs the trutina eval primer; grounded in the published research notes.)
  5. **LLM Research and the Frontier** (Advanced -> Expert): scaling and emergence, RLHF/RLAIF and
     alignment basics, reasoning and test-time compute, interpretability primer, capabilities and
     limits, evals/benchmarks, the research landscape and key papers.
- `/learn/resources/` -- the compiled link library: a "Start here" beginner path plus the full
  curated library, filterable by track and level.
- `/learn/flashcards/` -- all decks in one place (per-track decks + a mixed review).
- `/learn/quiz/` -- quiz hub (per-track quizzes + a mixed challenge).

## Tech / data model

- Content lives in `learn/data/*.json` (or .js): `tracks.json`, per-track `lessons`, `flashcards`,
  `quizzes`, and `links.json`. Data-driven so the compilation is easy to extend.
- A small vanilla-JS renderer turns the data into pages (track pages, lesson pages, the quiz engine,
  the flashcard engine). No framework, no build.
- Quiz engine: multiple-choice, instant feedback with a one-line explanation per answer, running
  score, per-track and mixed modes, localStorage progress.
- Flashcard engine: flip animation, deck-per-track, shuffle, "got it / review again" self-grading,
  localStorage progress.
- Reuse `/assets/research-notes.css` tokens; add `learn/assets/learn.css` for the center's components
  (track cards, level badges, quiz, flashcards), respecting reduced-motion and a11y.

## Level system

Four badges with consistent color/label: Beginner, Intermediate, Advanced, Expert. Applied to every
lesson, every link, every quiz question. A legend on the landing explains them in one line each.

## Build phases (each a checkpoint commit + push + Pages verify)

- P0: plan + this spec + decorrelated audit of the plan, fold.
- P1: data schema + the JS engine (renderer, quiz, flashcards) + CSS + the landing shell. (Codex builds
  the engine from the schema; Claude defines the schema.)
- P2: content authoring -- lessons across all 5 tracks (Claude writes pedagogy; Gemini curates links +
  breadth + fact-checks), level-labeled.
- P3: flashcards + quizzes per lesson/track (Claude authors items; Codex wires the engine).
- P4: resources library (curated links, Start-here path) -- Gemini-assisted curation, Claude-verified.
- P5: polish -- a11y, responsive, dark mode, search/jump, cross-links into the research notes + the
  hub.

## The /goal loop (doer != rater, anti-inflation)

After P1-P5, run the rating loop until the center scores >= 88 on a 100-point rubric:
- Rubric (weighted): pedagogy/clarity 25, breadth/coverage 20, concision-without-babying 15,
  interactivity (quizzes/cards work + add value) 15, craft/visual 15, link quality/accuracy 10.
- Rater = decorrelated Codex + Gemini panel (NOT Claude, the doer), each scoring + listing the top
  fixes. Anti-inflation: ties break downward, unverified-heavy claims discounted, exit is legitimate
  only when both raters clear 88. Claude applies fixes; re-rate; repeat.
- Each loop iteration: build state + score recorded in BUILD_STATE.md; checkpoint commit + push.

## Guardrails (autonomous run)

- Static site only; no user data, no auth, no irreversible ops. Push to the hub repo main + verify the
  Pages deploy after each phase (post-push deploy check).
- Em-dash-free prose; verify links resolve before listing them (curl) so the compilation has no dead
  links. ALWAYS verify Codex/Gemini output before committing.
- Durable state in BUILD_STATE.md so a fresh session can resume.
