"""Regression guard for quiz/exercise answer-quality tells.

A multiple-choice quiz is gameable when a surface feature of the options predicts the
correct one. We caught and fixed three such tells across the Study lessons (2026-06-21):
the correct answer was the longest option 98% of the time, absolute words (always/never/
guarantees/...) skewed heavily to distractors, and (already fine) answer position. This
test fails if any of those tells creep back as lessons are added or edited.

Thresholds sit well above the current healthy values but far below a real tell, so normal
authoring passes and a regression trips. Substance still needs the blind cross-model gate
(experiments/labs-gate/rate_distractors.py in the assay repo); this is the cheap, always-on
deterministic floor.
"""
from __future__ import annotations

import glob
import json
import re
from collections import Counter
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
LESSON_GLOB = str(REPO / "data" / "lessons" / "*.json")
ABS = re.compile(
    r"\b(always|never|guarantee|guarantees|guaranteed|only|every|all|none|cannot|impossible|must)\b",
    re.I,
)


def _collect(obj, out):
    if isinstance(obj, dict):
        if "choices" in obj and "answer" in obj and isinstance(obj["answer"], int):
            out.append(obj)
        for v in obj.values():
            _collect(v, out)
    elif isinstance(obj, list):
        for v in obj:
            _collect(v, out)


def _items():
    out = []
    for f in sorted(glob.glob(LESSON_GLOB)):
        _collect(json.loads(Path(f).read_text()), out)
    return out


def _items_by_file():
    by = {}
    for f in sorted(glob.glob(LESSON_GLOB)):
        out = []
        _collect(json.loads(Path(f).read_text()), out)
        by[Path(f).stem] = out
    return by


def test_lessons_present_and_well_formed():
    items = _items()
    assert len(items) >= 150, f"expected the full lesson set, found only {len(items)} choice items"
    for it in items:
        ch = it["choices"]
        assert len(ch) >= 2, f"item has too few choices: {it.get('q') or it.get('prompt')!r}"
        assert 0 <= it["answer"] < len(ch), f"answer index out of range: {it.get('q')!r}"
        assert all(isinstance(c, str) and c.strip() for c in ch), "blank/non-string choice"


def test_correct_answer_is_not_usually_the_longest_option():
    """The length tell: picking the longest option should be no better than guessing."""
    items = _items()
    longest = sum(
        1 for it in items
        if len(it["choices"][it["answer"]]) == max(len(c) for c in it["choices"])
    )
    rate = longest / len(items)
    # random baseline ~0.25; healthy is ~0.27; the old tell was 0.98.
    assert rate <= 0.45, (
        f"correct-is-longest rate {rate:.0%} exceeds 0.45 — the length tell is creeping back; "
        f"lengthen distractors into plausible misconceptions instead of padding the correct answer"
    )


def test_no_single_lesson_file_is_dominated_by_longest_correct():
    """Catch one fully-regressed file even if the site-wide aggregate still looks fine."""
    for stem, items in _items_by_file().items():
        if len(items) < 10:
            continue
        longest = sum(
            1 for it in items
            if len(it["choices"][it["answer"]]) == max(len(c) for c in it["choices"])
        )
        rate = longest / len(items)
        assert rate <= 0.55, f"{stem}: correct-is-longest {rate:.0%} > 0.55 — length tell in this file"


def test_absolute_language_does_not_predict_the_answer():
    """The absolute-word tell: distractors must not over-carry always/never/guarantees/etc.
    relative to correct answers (and not under-carry them either — that is a reverse tell)."""
    items = _items()
    corr = sum(1 for it in items if ABS.search(it["choices"][it["answer"]]))
    corr_rate = corr / len(items)
    dist = [c for it in items for i, c in enumerate(it["choices"]) if i != it["answer"]]
    dist_rate = sum(1 for c in dist if ABS.search(c)) / len(dist)
    gap = dist_rate - corr_rate
    assert abs(gap) <= 0.12, (
        f"absolute-word rate gap {gap:+.0%} (distractor {dist_rate:.0%} vs correct {corr_rate:.0%}) "
        f"exceeds 0.12 — absolute language is becoming a tell; balance it toward the correct-answer rate"
    )


def test_correct_answer_position_is_roughly_even():
    """The position tell: no single slot should hold a large share of correct answers."""
    items = _items()
    pos = Counter(it["answer"] for it in items)
    top_share = max(pos.values()) / len(items)
    assert top_share <= 0.42, (
        f"correct-answer position {dict(sorted(pos.items()))} is lopsided (top slot {top_share:.0%}); "
        f"rotate answer positions so location does not signal the answer"
    )
