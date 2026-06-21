# Study v4 gate: binary feature checklist (explorable labs)

Same gate model as v3: a fixed binary per-feature checklist, not a noise-dominated 0-100 score.
Doer (Opus) builds + self-verifies; an independent rater binary-verifies each item against the LIVE
site; disputes resolved by ground truth (node / curl / the deployed files). Memory note: the heavy
`codex exec` rater is avoided this round per the OOM caution; the lighter Gemini CLI is the cross-model
rater, with the doer's deterministic checks (node logic tests + deploy presence) as the ground-truth floor.

LIVE: https://kiwimaddog2020.github.io/study/  ·  engine: /assets/learn.js  ·  HEAD bb2c975

## Items (true / false against the live site)

1. tokenizer_lab mounts on fnd_bpe_tokenization and is interactive (typing changes the token chips).
2. tokenizer count behaves correctly: a rare long word fragments into several pieces; a common short word stays one; char/word/subword toggle changes the count.
3. tokenizer carries the honest caveat (illustrative subword tokenization; real BPE learns merges from data).
4. attention_lab mounts on fnd_transformer_internals; clicking a query word re-weights the highlights; two example sentences switch.
5. attention weights are sane: each query row is a distribution (sums to 1), and the coreference example shows "it" attending most to "cat".
6. attention carries the honest caveat (illustrative, hand-built patterns, not extracted from a live model).
7. injection_lab mounts on ag_security_injection; picking an injection + toggling the guardrail + Run shows block (guardrail on) vs breach (off).
8. injection blocks iff the guardrail is on; the outcome text matches (the instruction-source boundary).
9. injection carries the honest caveat (a simulation of the principle, not a live model).
10. embedding_lab mounts on fnd_tokens_embeddings; clicking a word highlights its three nearest neighbors with distances.
11. embedding nearest-neighbors are correct: clicking "king" returns queen/man/woman; the king-man+woman parallelogram lands on queen.
12. embedding carries the honest caveat (curated 2D map of real relationships; real embeddings are high-dimensional).

## Invariants (carried from v3)

13. `node --check assets/learn.js` passes; both touched lesson JSONs parse.
14. Zero em-dashes across the touched files.
15. The four new exercise types are dispatched in learn.js and each wired into exactly one lesson.
16. Cache-busters in index.html match the current learn.js / learn.css (browsers fetch the new build).

## Doer ground-truth (verified before rating)

- node logic tests: subword("unbelievable") -> 3 pieces; subword("cat") -> 1; attention row sums to 1.000 with max at the focus token; nearest-to-king = [queen, man, woman]; analogy king-man+woman = (3, 2.2) = queen exactly.
- node --check learn.js PASS; foundations.json + agents.json valid; em-dash sweep 0.
- live deploy: learn.js serves all 4 mount fns (4/4); foundations.json serves tokenizer/attention/embedding labs; agents.json serves injection_lab; cache-busters consistent (learn.css?v=5e629a0716, learn.js?v=5cbfbf721d).

## Result

- Doer self-verification: items 2, 5, 8, 11 (the math/behavior) and 13-16 (invariants) confirmed by deterministic ground truth above. Items 1, 4, 7, 10 (mount + interactivity) and 3, 6, 9, 12 (captions) confirmed in source + deploy; live in-browser interactivity is the one thing a static check cannot prove and is the recommended human eyeball.
- Cross-model rater: RECOMMENDED NEXT, not run this turn. The cross-model binary-verify (Gemini and/or
  Codex) should run through the assay-style harness that wraps each CLI call in a subprocess timeout;
  running the CLIs raw here was deferred per the OOM caution (a raw `codex exec` is the process that
  caused the earlier crashes, and the Gemini CLI can hang without a timeout). The doer ground-truth above
  is the verified floor; the in-browser interactivity eyeball + the cross-model pass are the two open
  rigor items.
