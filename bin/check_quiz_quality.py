#!/usr/bin/env python3
"""Run the quiz answer-quality regression guard without needing pytest installed.

Imports tests/test_quiz_quality.py and executes its test_* functions, so the pre-commit
hook and CI share one source of truth for the thresholds. Exits non-zero if any tell
(longest-correct, absolute-language skew, position imbalance) has crept back into the
lesson data. Run manually any time: python3 bin/check_quiz_quality.py
"""
from __future__ import annotations
import importlib.util
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("tq", REPO / "tests" / "test_quiz_quality.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

failures = []
for name in sorted(n for n in dir(mod) if n.startswith("test_")):
    try:
        getattr(mod, name)()
        print(f"  ok   {name}")
    except AssertionError as e:
        failures.append((name, str(e)))
        print(f"  FAIL {name}: {e}")

if failures:
    print(f"\nquiz-quality guard FAILED ({len(failures)} tell(s) detected) — see messages above.")
    sys.exit(1)
print("quiz-quality guard passed.")
