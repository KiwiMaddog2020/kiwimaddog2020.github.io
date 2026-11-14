INVENTORY (read-only). Global: no CLAUDE.md/AGENTS.md/GEMINI.md, no .mcp*, .cursor*, .windsurf*, .codex*, plugin dirs in ANY of the six repos. No README badges anywhere (grep for actions/workflows, shields.io, badge in all READMEs and docs/index.md: none). No em-dashes (0) in any docs/index.md, docs/*.html, _layouts, trutina docs/notes. __pycache__ / .pytest_cache / .ruff_cache exist on disk but are gitignored, none tracked. Links to the stale docs from elsewhere: none found (only self-references).

## trutina
1. Leftovers
- ARCHIVE: /home/user/trutina/RESEARCH_AUDIT_2026-07-10.md (114 lines, root).
- ARCHIVE (process docs, UNVERIFIED whether published pages cite them): experiments/polish-anatomy/MORNING_BRIEF.md, experiments/polish-anatomy/STATE.md, experiments/ai-ai-dynamics/conversation-drift/{CODEX_BRIEF.md,RUN_STATE.md}, experiments/calibration/RUN_STATE.md, experiments/collusion-refusal/RUN_STATE_ADVERSARIAL.md, experiments/eval-awareness/RUN_STATE.md, experiments/eval-awareness-hard/RUN_STATE.md, experiments/blindspot-detection/{PROTOCOL_PROMPT.md,RESULT_PROMPT.md}.
- KEEP (research record): docs/notes/decorrelated-audit.md, docs/SELF_ASSESSMENT.md (judgement call), experiments/perspective-bias/HAND_AUDIT_V4.md, audit_symmetry.py, symmetry_audit*.json, mech-interp/sae_audit.py, 12x experiments/*/rating.json (data, not "ratings docs").
2. GitHub: .github/workflows/ci.yml only: pytest on py 3.10/3.11/3.12 on push/PR to main, `pip install -e ".[test]"`. No badge.
3. Harvest: `pip install -e .`; demo `PYTHONPATH=. python3 -m trutina.cli demo` (README.md:65,82); `pytest -q`. Invariants: trutina/cascade.py:9 and :63 (never-drop invariant); trutina/decorrelate.py:10 (producing family never judges its own output); regression.py:5,104,222 (frozen baseline format, report.json == baseline); judges.py:84 (bool("false") trap). Entry point trutina = trutina.cli:main (pyproject.toml:32). README.md:72 "not yet on PyPI".
4. Secrets: none found. Only env-var NAME references (README.md, tests/test_providers.py etc., experiments/polish-anatomy/openrouter.py); no .env.
5. Hygiene: LICENSE present (MIT). ~5510 tracked files (mostly experiment data; large images up to 224KB docs/notes/img/scorecard-4family.png). .gitignore OK. Python 3.13 pycache locally only.
6. Deps (pyproject.toml): requires-python >=3.10 (:10); pyyaml>=6.0; extras anthropic>=0.40, openai>=1.0, google-genai>=0.3, pytest>=8.0. Nothing pinned; floors loose/old (openai>=1.0, google-genai>=0.3).
7. Models (counts approx, tracked text files): "opus"/Opus 4.8 ~540, gpt-5.5 167, gpt-4o 36, gpt-2/gpt-2-small ~37, claude-sonnet-4-6 24, gemini-2.0-flash 18, claude-opus 8. Hardcoded: trutina/demo.py:94,200,202-207 (claude-sonnet-4-6, gpt-5.5 mock providers, labelled "Gemini 3.1 Pro (High)"). No other hardcoded API defaults in trutina/*.py. Retired candidates: gemini-2.0-flash, gpt-4o in experiments (check path list with grep).
8. Tells: experiments/ai-ai-dynamics/score.py:63-64 (except Exception: return None); experiments/blindspot-detection/grade_err.py:103 (except ... pass); artifacts_err.py:662,674,823, grade_err.py:173, prompt_rescue.py:165 (broad except Exception, bodies UNVERIFIED); calibration-hard/rate_hard.py:81, run.py:61 (except Exception as exc); ai-ai-dynamics/tests/test_self_recognition.py:12 (NotImplementedError "phase 2" test, intentional stub); experiments/ai-ai-dynamics/models.py:96 "placeholder" (benign). No assert-less tests found.

## rag-lab
1. Leftovers
- ARCHIVE: .claude/PROJECT_CHARTER.md (119 lines; says private repo, ruff/pytest, "global lint corpus"), .claude/.chat_slug (contains "rag-lab"); remove whole .claude/.
- ARCHIVE: docs/A_TIER_PLAN_2026-06-22.md, docs/CODE_RATING_2026-06-22.md, docs/CODE_RATING_2026-06-22_0450.md. Note docs/ has NO _config.yml/_layouts/index.md; these .md sit beside the published findings.html. Their public exposure is UNVERIFIED.
- KEEP: docs/findings.html, docs/RESEARCH_2026-06-22.md, docs/ARCHITECTURE.md (judgement: RESEARCH is record), runs/*.json (results).
2. GitHub: .github/workflows/ci.yml: on push+PR (all branches), py3.12, `pip install -e ".[dev]"`, `ruff check .`, `pytest -q`. Actions at checkout@v5/setup-python@v6. No badge.
3. Harvest: README.md:35-38 venv + `pip install -e ".[dev]"` + `pytest`; :48-51 `pip install -e ".[full]"`, `python -m rag_lab.eval_retrieval --limit 50 --k 5 --embedder local|hashing`; :111,138 `python -m rag_lab.eval_rag`; sweep `python -m rag_lab.sweep` (:73); scripts/run_rag_paid.sh. Frozen dataclasses throughout; no explicit "do not remove" markers found. .gitignore:.env guarded.
4. Secrets: none found; no .env; .gitignore:.env* ignored.
5. Hygiene: NO LICENSE. docs has no _config.yml (UNVERIFIED how Pages builds). Largest file runs/research_hotpot_local_k10.json 40KB. Mixed runs/ committed vs runs/matrix, runs/logs ignored.
6. Deps (pyproject.toml): python >=3.11 (:10); numpy>=1.26; dev pytest>=8, ruff>=0.6; embed sentence-transformers>=3.0; data datasets>=2.19; llm anthropic>=0.40; voyage voyageai>=0.3; openai>=1.40. Build backend hatchling. Nothing pinned.
7. Models: claude-opus-4-8 x12, claude-sonnet-4-6 x8, claude-haiku-4-5 x1, plus prose opus/sonnet/haiku ~25. HARDCODED DEFAULTS: src/rag_lab/generate.py:45 (claude-opus-4-8), src/rag_lab/judge.py:61 (claude-sonnet-4-6), src/rag_lab/relevance.py:57 (claude-sonnet-4-6), src/rag_lab/eval_rag.py:98 (--gen-model default), :99 (--judge-model default), :133 (panel_models sonnet-4-6 + haiku-4-5), :6 docstring; scripts/run_rag_paid.sh:32; README.md:138.
8. Tells: src/rag_lab/eval_rag.py:78 (except Exception as exc; body UNVERIFIED). tests/test_embed.py:12,27,33 flagged assert-less by AST scan (probably numpy helper asserts; UNVERIFIED). Else clean.

## trust-weighted-evals
1. Leftovers: NO CLAUDE/.claude/AGENTS. KEEP (product, tested): protocol/ (LOOP_CONTRACT.md, SKILL.md), pipeline/templates/{CODEX_PROMPT_code.md,CODEX_PROMPT_plan.md,CONVERGED_template.md,HANDOFF.md,state_schema.json}, pipeline/bin/ (scaffold_handoff.sh, update_state.py), hooks/, adjudicator/. Nothing to archive found.
2. GitHub: no .github dir, no workflows, no badges.
3. Harvest: README.md:8-20: `python3 -m pytest tests/test_trio_adjudicate.py`, test_trio_weight_apply.py, test_peer_audit_pipeline.py, test_forge_skill.py, `bash hooks/test-pre-commit.sh`; whole suite `python3 -m pytest tests`. Warnings: README.md:34 (four source tests intentionally dropped); protocol/LOOP_CONTRACT.md:48,73,171,245,390,403,465,634,694,918 ("do not reimplement", "math: do not re-derive", fixed allowlist); protocol/SKILL.md:8,107,141; adjudicator/trio_weight_apply.py:33 (nothing writes with --auto).
4. Secrets: none real. Pattern matches only in the secret-scanning hook and its fixtures: hooks/pre-commit:76,78,251; hooks/test-pre-commit.sh:146 (fixtures; values not printed/inspected).
5. Hygiene: LICENSE present. .gitignore minimal (__pycache__, .pytest_cache, .DS_Store); add .venv/.env if desired. Large: protocol/LOOP_CONTRACT.md 56KB, SKILL.md 44KB.
6. Deps: no pyproject.toml, no requirements (stdlib + pytest implied; UNVERIFIED).
7. Models: mostly prose "opus" ~140, haiku 11, sonnet 8, "Opus 4.8" 3, gpt-5.5 x2, gemini-spawn.sh/gemini-review.sh ~31 (script names, not models). No API model IDs hardcoded; adjudicator/trio_adjudicate.py:48-58 and :20 map names (opus/opus48/sonnet/haiku) to family.
8. Tells: pipeline/bin/update_state.py:163,254 and tests/test_peer_audit_pipeline.py:520 (comments narrating past bug fixes: "used to converge"); adjudicator/trio_adjudicate.py:303 ("no longer decides identity"). tests/test_trio_weight_apply.py:110,120,127,150,158,170 flagged assert-less by AST (refuses_* tests; probably assert via helper/pytest.raises; UNVERIFIED).

## decorrelation-study
1. Leftovers: no agent files. KEEP all (research record): PRE_REGISTRATION.md, PRE_REGISTRATION_AMENDMENT.md, ROBUSTNESS_AUDIT_R2.md, round2/PRE_REGISTRATION_R2.md, runs/gemini_audit/* (01-20.json + RECONCILIATION.md), harness/gemini_audit.py, harness/reconcile_audit.py, docs/{FOLLOWUP_human_product_decorrelation,RESEARCH_AGENDA,VERIFICATION_RESIDUE,FORKING_PATHS}.md, protocol/review_prompt.txt, runs/human/PACKET.md. Nothing to archive.
2. GitHub: no .github, no badges.
3. Harvest: Makefile: `make repro` (align+strict+lenient), `make verify` (fails if runs/RESULTS.json drifts from committed pin), `make help`; PY=python3, stdlib >=3.10 (Makefile:1-12). README.md:54-56 `python3 harness/align_report.py`, `harness/metrics.py`, `SCORE_STEM=1 python3 harness/metrics.py`. Frozen: PRE_REGISTRATION.md:3-4 (frozen 2026-06-13), README.md:22-23. runs/RESULTS_lenient.json is gitignored but generated.
4. Secrets: none found.
5. Hygiene: NO LICENSE. No pyproject (stdlib only). .gitignore ok (corpus/h3, runs/h3 ignored). corpus/snippets/*.py are planted-defect data, not code to lint.
6. Deps: none declared.
7. Models: only family names: "claude-codex" 13, "gemini-codex" 9, "claude-gemini" 7 (pair labels), "Opus 4.8" x2 (PRE_REGISTRATION.md:4 etc.). No model IDs in code.
8. Tells: no bare excepts/TODOs. (corpus/snippets/* intentionally buggy; ignore.)

## self-improvement-gate
1. Leftovers: none. protocol_gate.py, protocol_limits.py are the product.
2. GitHub: .github/workflows/test.yml: on push/PR, SHA-pinned checkout/setup-python, py3.12, `pip install pytest==8.3.4`, `pytest tests -q`; permissions contents: read, timeout 10m. No badge.
3. Harvest: README.md:40 `python3 -m pytest tests -q` (8 passed). protocol_gate.py:42-45 family map (opus, opusreview, sonnet, haiku -> claude).
4. Secrets: none found.
5. Hygiene: LICENSE present. Clean.
6. Deps: no pyproject; CI pins pytest==8.3.4 only (the one pinned item across repos).
7. Models: prose/family only (opus x5, sonnet x2, haiku x2), protocol_gate.py:42-45. No IDs.
8. Tells: none found.

## evaluating-claude
1. Leftovers: none; 6 tracked files (LICENSE, README.md, docs/{index.md,_config.yml,_layouts/default.html}).
2. GitHub: none, no badges.
3. Harvest: no code/commands.
4. Secrets: none found.
5. Hygiene: LICENSE present; .gitignore covers _site/.jekyll-cache.
6. Deps: none. 7. Models: no matches. 8. No Python.

## Cross-repo notes
- Only rag-lab and decorrelation-study lack LICENSE (confirmed).
- Retired-model hotspots to fix in a light tidy: rag-lab (generate.py:45, judge.py:61, relevance.py:57, eval_rag.py:98-99,133, run_rag_paid.sh:32, README.md:138) and trutina/trutina/demo.py:94-207.
- Em-dash count 0 in all user-facing pages checked. Unverified: whether Jekyll builds publish rag-lab/docs md files and trutina's experiments/ docs.