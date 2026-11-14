"""Checks for hand-written pages."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_since_july_note_is_linked_and_clean():
    note = (ROOT / "since-july" / "index.md").read_text(encoding="utf-8")
    assert note.startswith("---\n") and "permalink: /since-july/" in note
    assert "—" not in note
    assert 'href="/since-july/"' in (ROOT / "index.html").read_text(encoding="utf-8")
    for url in re.findall(r"\]\((/[^)]*)\)", note):
        target = ROOT / url.strip("/")
        assert target.exists() or (ROOT / (url.strip("/") + ".html")).exists(), url


def test_note_statuses_are_known():
    meta = json.loads((ROOT / "data" / "notes-meta.json").read_text(encoding="utf-8"))
    for url, m in meta.items():
        assert m.get("status", "untested") in {"holds", "revised", "superseded", "untested"}, url
