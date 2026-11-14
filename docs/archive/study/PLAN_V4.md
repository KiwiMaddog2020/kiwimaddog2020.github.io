# Study v4: explorable-explanation labs (plan, durable + resumable)

Home: `kiwimaddog2020.github.io/study/`. Builds on v3 (65 lessons, 9 labs, checklist-gated green;
see BUILD_STATE.md). v4 adds a new *dimension*, not lessons or accuracy (both maxed at the mid-80s
plateau): standout interactive widgets that make abstract AI concepts tangible. The Distill /
explorable-explanations aesthetic, which is also the strongest-rated feature class on the platform.

Doer = Opus (authors + merges + self-verifies). Raters = Codex + Gemini (binary-verify only, never
the doer). Gate = a binary per-feature checklist (CHECKLIST_V4.md), the v3 model that worked, not the
noise-dominated 0-100 rubric.

## Design principle (non-negotiable, the platform's honesty ethos)

Every lab is **deterministic and fully client-side. No live model inference.** Where a concept needs
real model output:

- **Real-but-precomputed:** for attention and embeddings, bundle real data extracted once offline on
  a small curated set (real weights / real embedding coordinates), and restrict input to that set.
  Honest and accurate; never fake a model's output on arbitrary user text.
- **Principle-as-simulation:** for prompt injection (a rule, not a learned behavior), simulate the
  instruction-source-boundary deterministically.

Each lab carries a one-line honest caveat ("illustrative on N curated examples; a real tokenizer
learns merges from data", etc.). Same engine contract as existing labs: a `mount<Name>(container,
exercise)` function + one dispatch line in the `exercise.type` chain in assets/learn.js (~line 1490);
config + caveat live in the lesson's `exercise` object. Each lab ~80-130 lines of JS.

## The four labs (one train each)

### Train A: `tokenizer_lab` (tokenizer playground)
- **Does:** text box -> live token chips (colored), token count, chars/token ratio, and a context-fill
  bar ("N tokens = X% of an 8K window"). Toggle word / subword / char granularity to show count shifts.
- **Honest approach:** a deterministic illustrative subword splitter (common-affix + whitespace +
  punctuation rules), labeled "illustrative subword tokenization; production tokenizers learn merges
  (BPE) from data." Optional later upgrade: bundle a small real BPE vocab/merges.
- **Teaches:** tokens != words, subword units, why casing/spaces/code cost tokens, context window.
- **Wire:** fnd_bpe_tokenization (primary) + fnd_context_window.

### Train B: `attention_lab` (self-attention visualizer)
- **Does:** pick one of ~4 curated sentences; select a query token; see attention as weighted
  highlights over the other tokens (+ a small heatmap row). Honest: real precomputed weights on the
  curated set, NOT arbitrary user text (real attention needs a model we cannot run client-side).
- **Honest approach:** extract real attention from a small open model once, offline, for the curated
  sentences; bundle as `data/attention_examples.json`. Caveat: "real weights from a small model on
  these examples; one head, one layer, for intuition."
- **Teaches:** query/key attention, which tokens attend where, why context matters, transformer internals.
- **Wire:** fnd_transformer_internals (+ the attention diagram lesson).

### Train C: `injection_lab` (prompt-injection sandbox)
- **Does:** a simulated agent with one tool (send_email) and a guardrail toggle. The learner inserts a
  chosen injected instruction into "untrusted content" the agent reads, then runs it and sees the agent
  obey (guardrail off) or refuse + quote the injection (guardrail on, instruction-source boundary).
- **Honest approach:** fully deterministic rule-based simulation of the principle; labeled "a
  simulation of the instruction-source boundary, not a live model."
- **Teaches:** prompt injection, data-is-not-commands, tool permissioning, the agent safety boundary.
- **Wire:** ag_security_injection. (Listed in the v3 roadmap, never built; this closes it.)

### Train D: `embedding_lab` (embedding-distance explorer)
- **Does:** a 2D scatter of ~24 curated words (real embeddings projected to 2D offline); pick a word to
  highlight nearest neighbors + show cosine distance to a second pick; an "odd one out" mini-mode.
- **Honest approach:** real embeddings for the curated vocab, projected once offline (PCA/UMAP),
  bundled as `data/embedding_coords.json`. Caveat: "real embeddings, projected to 2D; distances are
  approximate after projection."
- **Teaches:** embeddings, semantic similarity, how semantic search + RAG retrieval find neighbors.
- **Wire:** the foundations embeddings lesson + ag_rag.

## Gate (CHECKLIST_V4.md, binary, Codex + Gemini vs LIVE)

Per lab, each item true/false against the live site (ground-truth by preview/node/curl on disputes):
mounts + is interactive; the math/behavior is correct (token counts stable; attention weights match the
bundled data; injection blocks iff guardrail on; nearest-neighbor ranking matches the coords); the
honesty caveat is present; wired into its lesson and reachable; no console errors; any new link 200.
Plus the standing invariants: JSON valid, `learn.js` node-check clean, em-dash-free, MCQ answer balance
unchanged. Gate closes only when all green or disagreements are ground-truth-resolved.

## Verify ledger (per train, before commit)

- Preview (launch.json `study`, port 8156) eyes-on: widget mounts, interacts, math/behavior correct.
- `node --check assets/learn.js`; JSON parses; new data files parse; grep em-dash = 0.
- Each new/changed link curl-200. Push, then confirm the Pages deploy serves the new content.

## Resume + memory notes

- Hub repo `~/Code/kiwimaddog2020.github.io`; engine `assets/learn.js`; lesson content `data/lessons/*.json`;
  new lab data in `data/`. Adding a lab = mount fn + dispatch line + lesson `exercise` + (B/D) a data file.
- Adding/Editing a lesson: edit the track file AND tracks.json `lessons` id-list (engine orders by it).
- **OOM caution (2026-06-20):** do NOT run the full hub `pytest tests/` suite; run single test files only.
  One preview in the MAIN session is fine; do not stack codex-backed jobs with other heavy runners.
- Sequencing: A -> B -> C -> D, each build->wire->preview->commit->push->deploy-check, then the gate.
  Offline data extraction for B and D (attention weights, embedding coords) happens once, up front, and
  the result is committed as static JSON so the site stays inference-free.
