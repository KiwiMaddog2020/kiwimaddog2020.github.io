I only read files. Nothing in either repo was edited and no model was called. I tested the three adapters and the scoring bugs below in a scratch copy at /tmp/claude-0/-home-user/5a0bef11-8d36-52c0-89ee-979cff9b0324/scratchpad. "Then" Claude is always labelled **Opus 4.8**.

## A. Code-review blind spots (/home/user/decorrelation-study)

**1. What it measured.** Reviewers blindly reviewed 20 Python snippets: 16 with 30 planted defects across 7 types, plus 4 clean controls (16–19). It scored caught/missed per defect and compared reviewers by pairwise phi, coverage (defects caught by any reviewer ÷ best single reviewer) and per-type catch rate.
- Claude caught **23/30 with 1 false positive** (runs/RESULTS_model_only.md:20).
- corr(claude,codex) **+0.327**, corr(claude,gemini) **−0.184** (:42).
- Claude caught performance 2/4 (:72) and boundary 3/5 (:69).
- Running `make strict` on a copy reproduces these exactly.
- Model: UNVERIFIED. There is no Claude review runner. The reviews are called "Claude clean-room" (runs/smoke/SMOKE_TEST_001.md:3), and the analysis collaborator and commit co-author is Opus 4.8 (PRE_REGISTRATION.md:4), so it was most likely an Opus 4.8 subagent.

**2. Prompt.** Use protocol/review_prompt.txt verbatim, replacing `{{SNIPPET}}` with corpus/snippets/NN.py. Output is one `LOCATION | TYPE | DESCRIPTION` per line, or `NO DEFECTS FOUND`. Keep only lines containing " | ", as harness/run_gemini_reviews.py:20-23 does.

**3. Items and scoring.**
- Items: corpus/snippets/01–20.py. Answer key: corpus/truth/NN.json. Ignore 001, the smoke test.
- Scoring: harness/score.py, a ±1-line or keyword matcher, called by harness/metrics.py.
- metrics.py hardcodes `runs/full` (:51, :57), the rater names (score.py:21; metrics.py:24) and writes runs/RESULTS.json (:114).
- Zero-edit adapter (tested): put files at `<newroot>/runs/full/NN.<tier>.txt`, symlink `<newroot>/corpus` to the real corpus, then load metrics.py with importlib, set `score.RATERS`, `metrics.BASE_RATERS` and `metrics.ROOT=newroot`, and call `main()`. Script: /tmp/claude-0/-home-user/5a0bef11-8d36-52c0-89ee-979cff9b0324/scratchpad/a_adapter.py. Command: `python3 -I a_adapter.py <newroot> haiku,sonnet,opus,top,opus48`.
- Copy runs/full/NN.claude.txt to `NN.opus48.txt` so "then" scores in the same run.

**4. Design.** 4 tiers × 20 snippets, one snippet per call: **80 calls**.
- Table, one row per tier plus opus48: caught/30, false positives, per-type catches.
- Plus a phi matrix over the 5 raters, and coverage of the 4 tiers (all caught ÷ best tier) against the original three-family 1.11x.
- Can conclude: whether tiers miss different defect types, and how far each tier moved from Opus 4.8.
- Cannot conclude: an ordering of phi values. Gaps of 0.06–0.09 were already noise at n=30 (RESULTS_model_only.md:45). It is one rep and still the same family.

## B. Calibration (trutina/experiments/calibration, calibration-hard, frontier-bank)

**1. What it measured.** Models gave an answer plus a 0–100% confidence on questions with checkable keys, scored with no judge. It reports ECE, Brier, overconfidence and AUROC (how well confidence separates right from wrong).
- Easy bank, Opus: **27/28, ECE 0.031, Brier 0.035, AUROC 0.951** (calibration/analysis.json:67-78). Its one miss, C10, came at 98% confidence.
- Hard bank, Opus: **acc 0.955, conf 0.989, ECE 0.035, AUROC 0.696** (calibration-hard/analysis.json:75-90). It missed all 3 reps of H11.
- Model: `opus48` = `claude --print` run from cwd /tmp (experiments/eval-awareness/backends.py:4, :55, :37). The exact ID and effort setting are UNVERIFIED (whatever the CLI defaulted to).
- **frontier-bank was never run.** It has no data/ folder and no RESULT.md, and no runner reads it.

**2. Prompt.** `prompt + elicit_suffix`, where the suffix is in calibration-hard/items.json (key `elicit_suffix`). It ends `Answer: <your answer>\nConfidence: <number>%`. Store the raw text, then pass it through `B.clean_reply` and `strip_conf` (calibration-hard/run.py) for parity.

**3. Items and scoring.**
- Item counts: easy 28 (items.json computational + factual), hard 22 (`items`), frontier 72 (a **bare list** with no suffix, so calibration-hard/run.py:44 `ITEMS["items"]` breaks on it).
- `correct` is computed at write time (run.py:56-57 via eval-awareness/metrics.py), not by analyze.py.
- Write one file per response at `<dir>/data/{tier}__{item_id}__r{rep}.json` with fields `model, item_id, cat, rep, response, correct, confidence`.
- Copy calibration-hard/analyze.py into `<dir>` unmodified (it uses its own folder) and run `python3 -I <dir>/analyze.py`.

**4. Design.** Batch 11–12 items per call, with each item answered independently. This deviates from the original one item per call and can make confidences relative across items, so flag it.
- Hard bank: 3 reps × 2 calls × 4 tiers = 24 calls.
- Frontier bank: 2 reps × 6 calls × 4 tiers = 48 calls.
- Easy bank: 1 call × 4 tiers = 4 calls.
- **Total 76 calls.**
- Table, one row per tier plus Opus 4.8 (then): accuracy, mean confidence, overconfidence, ECE, AUROC, mean confidence on right vs wrong, number of misses.
- Can conclude: whether newer tiers still sit at the ceiling, and whether confidence dips on misses.
- Cannot conclude: anything from AUROC with fewer than about 10 misses. The frontier-bank pilot gate (3 families × 9 responses) can't be applied as registered.

## C. Self-preference (trutina/experiments/self-preference; judge-self-preference)

**1. What it measured.** Each model answered 10 prompts, then each graded all answers blind, 0–100. Self-preference is the producer's own rating minus the others' rating of the same answer.
- Overall: **+3.47 [1.2, 5.8]**.
- Opus, three ways:
  - Naive (pre-registered): **−3.75** (RESULT.md:17).
  - Within-grader (the old headline, now retracted): **+8.05** (:49).
  - Two-way fixed effects (the correct one): **+2.7 [0.2, 5.65]**. GPT is highest at +7.6 (reanalysis_two_way.json:6-21).
- Opus leniency: 84.8, the harshest grader (:37).
- Model: same `claude --print` Opus 4.8 as B.
- judge-self-preference has **no Claude arm** (local qwen/llama/mistral, judge-self-preference/self_preference.py:35-39). It only adds a test-retest noise floor; skip it.

**2. Prompts.**
- Produce: items.json prompt text + `PRODUCE_SUFFIX` (run.py:21).
- Grade: `GRADE_TMPL` (run.py:23-31), STRICT JSON `{"A":..,"B":..,"C":..}`, with order shuffled by `random.Random("seed-"+g+"-"+pid)` (:72).

**3. Items and scoring.**
- Items: 10 prompts in self-preference/items.json.
- Write `<dir>/items.json` (copy) and `<dir>/data/grade/{grader}__{pid}.json` = `{"grader","pid","mapping","scores":{producer:int}}`.
- Adapter (tested on fake 4-tier data; it recovers a planted self-bias): import reanalysis_two_way.py, rebind `MODELS`, `NAME`, `DG`, `HERE`, `PROMPTS`, then call `main()`. Script: /tmp/claude-0/-home-user/5a0bef11-8d36-52c0-89ee-979cff9b0324/scratchpad/c_adapter.py. Command: `python3 -I c_adapter.py <dir> haiku,sonnet,opus,top`.
- analyze.py needs the same rebinding (MODELS comes from backends, :14). UNVERIFIED.

**4. Design.** 40 produce calls + 40 grade calls (4 answers, A–D) = **80 calls**.
- Optional anchor: add the 3 original answers from data/produce/ to each grading call (7 answers, same 40 calls). Then the then-vs-now question becomes "does today's Opus favour Opus 4.8's text?"
- Table, one row per tier: naive, within-grader and two-way favoritism with CI, plus leniency, next to the Opus 4.8 row.
- Can conclude: whether a tier favours its own text.
- Cannot conclude: family self-preference, since every grader is Claude. Two-way numbers depend on the panel, so they don't compare across panels; leniency and the sign are the only rough then-vs-now comparisons.

## 5. Contamination and validity risks (cheapest fix for each)

- **Public repos.** The remotes are github.com/KiwiMaddog2020/decorrelation-study and /trutina. The truth JSON and answer keys have been public since June–July 2026 (public visibility UNVERIFIED). Fix: four short probe calls ("do you know repo X / snippet 11's bugs?"). Report any tier that recognises them. Frontier-bank keys are also public.
- **Subagents can read files.** Run each from an empty working directory with the prompt pasted inline. Add "Do not read files or run tools; answer from the text only." Check transcripts for tool calls if visible (UNVERIFIED). Calculators broke the original computational items.
- **The orchestrator is the top tier and has read the truth files.** Build every prompt with a Python template (no paraphrasing) and score only with the scripts. The top tier must never grade in C as the orchestrator; spawn it as a separate subagent.
- **Batching (B).** Randomise item order per rep.
- **Version drift.** Record the tier-to-model ID for each call.

## 6. Bugs and fragility

- **Wrong answers graded correct.** eval-awareness/metrics.py:92-94 does a substring accept, tested: `"14"` is accepted for key "4", `"not a knight"` for "knight", and `"12/50"` for "2/5". 34 of 72 frontier keys are 1–2 characters. Grade new data with an exact-match check as well.
- **ECE is not meaningful here.** calibration*/analyze.py puts 90–100% in one bin (:33), so when confidence is ≥90 ECE just equals |overconfidence|.
- **Table header counted as a finding.** score.py:31-38 parses any line with a pipe. A `LOCATION | TYPE | DESCRIPTION` header or markdown table becomes a flag, which counts as a false positive on clean snippets (metrics.py:63-64). Strip headers.
- **Verbose reviewers get extra credit.** score.py:71-77 credits any flag within ±1 line of a defect, whatever its description.
- **Cosmetic.** metrics.py:102 garbles the per-type table. reanalysis_two_way.py:187 hardcodes "90 ratings".
- **Silent gaps (self-preference/run.py).** A missing answer is graded as "(missing)" (:76). A JSON parse failure stores empty scores and the row is silently dropped (:79-85). The labels A/B/C are hardcoded (:23-31, :74).
- **Overwrites committed results.** metrics.py and the analyze scripts overwrite committed RESULTS/analysis files in place. Always run them on copies, or through the adapters above.

Scratch files from this check, all in /tmp/claude-0/-home-user/5a0bef11-8d36-52c0-89ee-979cff9b0324/scratchpad: a_adapter.py, c_adapter.py, and the test folders ds/, a/ and c/.