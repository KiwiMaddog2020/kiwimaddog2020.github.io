"""Oracle for the index generator: marker surgery, escaping, fallbacks."""

from __future__ import annotations

import importlib.util
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location("build_index", REPO / "bin" / "build_index.py")
bi = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(bi)

DOC = """# Hub

intro

<!-- notes:start -->
- old entry
<!-- notes:end -->

footer
"""


def test_rebuild_replaces_only_the_marker_block():
    out = bi.rebuild(DOC, "- new entry")
    assert "- old entry" not in out
    assert "- new entry" in out
    assert out.startswith("# Hub")
    assert out.rstrip().endswith("footer")
    # Idempotent: rebuilding with the same entries changes nothing.
    assert bi.rebuild(out, "- new entry") == out


def test_render_entries_uses_description_homepage_and_escapes():
    repos = [
        {
            "name": "evil",
            "description": "totally [normal](https://attacker.invalid) <b>note</b>",
            "homepage": "https://kiwimaddog2020.github.io/evil/",
            "html_url": "https://github.com/KiwiMaddog2020/evil",
        }
    ]
    out = bi.render_entries(repos)
    assert "](https://attacker.invalid)" not in out
    assert "<b>" not in out
    assert "https://kiwimaddog2020.github.io/evil/" in out


def test_render_entries_falls_back_to_name_and_pages_url():
    repos = [
        {
            "name": "quiet-repo",
            "description": None,
            "homepage": "",
            "html_url": "https://github.com/KiwiMaddog2020/quiet-repo",
        }
    ]
    out = bi.render_entries(repos)
    assert "[quiet\\-repo]" in out or "[quiet-repo]" in out
    assert "https://kiwimaddog2020.github.io/quiet-repo/" in out


def test_empty_repo_set_leaves_index_untouched(tmp_path, monkeypatch):
    # FAIL SAFE: a cron run that finds no public research-note repos (an API
    # hiccup, or every repo still private) must never blank a seeded list.
    idx = tmp_path / "index.md"
    idx.write_text(DOC)
    monkeypatch.setattr(bi, "INDEX", idx)
    monkeypatch.setattr(bi, "note_repos", lambda: [])
    assert bi.main() == 0
    assert idx.read_text() == DOC
