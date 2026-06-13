"""Oracle for the index generator: marker surgery, escaping, fallbacks, feed."""

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
<ul role="list">
<li>old entry</li>
</ul>
<!-- notes:end -->

footer
"""

REPO_OK = {
    "name": "note-repo",
    "description": "a note",
    "homepage": "https://kiwimaddog2020.github.io/note-repo/",
    "html_url": "https://github.com/KiwiMaddog2020/note-repo",
    "created_at": "2026-06-12T00:00:00Z",
}


def test_rebuild_replaces_only_the_marker_block():
    out = bi.rebuild(DOC, "<ul role=\"list\">\n<li>new entry</li>\n</ul>")
    assert "old entry" not in out
    assert "new entry" in out
    assert out.startswith("# Hub")
    assert out.rstrip().endswith("footer")
    # Idempotent: rebuilding with the same entries changes nothing.
    assert bi.rebuild(out, "<ul role=\"list\">\n<li>new entry</li>\n</ul>") == out


def test_render_entries_emits_accessible_html_and_escapes():
    repos = [
        {
            **REPO_OK,
            "name": "evil",
            "description": 'totally <b>bold</b> & "quoted" note',
            "homepage": "https://kiwimaddog2020.github.io/evil/",
            "html_url": "https://github.com/KiwiMaddog2020/evil",
        }
    ]
    out = bi.render_entries(repos)
    assert out.startswith('<ul role="list">')
    assert out.endswith("</ul>")
    assert "<b>" not in out
    assert "&lt;b&gt;" in out and "&amp;" in out and "&quot;quoted&quot;" in out
    # The code link carries an accessible name naming its note.
    assert 'aria-label="Code repository: totally &lt;b&gt;bold&lt;/b&gt;' in out
    assert 'class="note-title" href="https://kiwimaddog2020.github.io/evil/"' in out


def test_render_entries_falls_back_to_name_and_pages_url():
    repos = [
        {
            "name": "quiet-repo",
            "description": None,
            "homepage": "",
            "html_url": "https://github.com/KiwiMaddog2020/quiet-repo",
            "created_at": "2026-01-01T00:00:00Z",
        }
    ]
    out = bi.render_entries(repos)
    assert ">quiet-repo</a>" in out
    assert "https://kiwimaddog2020.github.io/quiet-repo/" in out


def test_empty_repo_set_leaves_index_and_feed_untouched(tmp_path, monkeypatch):
    # FAIL SAFE: a cron run that finds no public research-note repos (an API
    # hiccup, or every repo still private) must never blank a seeded list.
    idx = tmp_path / "index.md"
    feed = tmp_path / "feed.xml"
    idx.write_text(DOC)
    feed.write_text("seeded")
    monkeypatch.setattr(bi, "INDEX", idx)
    monkeypatch.setattr(bi, "FEED", feed)
    monkeypatch.setattr(bi, "note_repos", lambda: [])
    assert bi.main() == 0
    assert idx.read_text() == DOC
    assert feed.read_text() == "seeded"


def test_missing_markers_is_an_error(tmp_path, monkeypatch):
    idx = tmp_path / "index.md"
    idx.write_text("# Hub\n\nno markers here\n")
    monkeypatch.setattr(bi, "INDEX", idx)
    assert bi.main() == 1


def test_out_of_order_markers_is_an_error(tmp_path, monkeypatch):
    idx = tmp_path / "index.md"
    idx.write_text(f"# Hub\n\n{bi.END}\nstranded\n{bi.START}\n")
    monkeypatch.setattr(bi, "INDEX", idx)
    assert bi.main() == 1


def test_malicious_homepage_destinations_fall_back():
    # Destinations are validated, not escaped: a crafted homepage on any
    # tagged repo must never reach the public index verbatim.
    cases = [
        "javascript:alert(1)",
        "https://x.example) <script>bad()</script> (",
        "https://x.example/<!-- notes:end -->",
        'https://x.example/" onmouseover="bad()',
        "https://x.example/' onmouseover='bad()",
        "ftp://x.example/",
        "https://",
    ]
    for homepage in cases:
        out = bi.render_entries([{**REPO_OK, "homepage": homepage}])
        assert 'href="https://kiwimaddog2020.github.io/note-repo/"' in out, homepage
        assert "javascript:" not in out
        assert "<script>" not in out
        assert "notes:end" not in out
        assert "onmouseover" not in out


def test_legitimate_homepage_survives_validation():
    out = bi.render_entries([REPO_OK])
    assert 'href="https://kiwimaddog2020.github.io/note-repo/"' in out


def test_note_repos_filters_private_fork_untagged_and_hub(monkeypatch):
    page = [
        {"name": "good", "private": False, "fork": False, "topics": ["research-note"]},
        {"name": "private", "private": True, "fork": False, "topics": ["research-note"]},
        {"name": "fork", "private": False, "fork": True, "topics": ["research-note"]},
        {"name": "untagged", "private": False, "fork": False, "topics": ["misc"]},
        {"name": "kiwimaddog2020.github.io", "private": False, "fork": False, "topics": ["research-note"]},
    ]
    monkeypatch.setattr(bi, "_api", lambda path: page if "page=1" in path else [])
    names = [r["name"] for r in bi.note_repos()]
    assert names == ["good"]


def test_render_feed_structure_escaping_and_updated():
    repos = [
        {**REPO_OK, "description": "Note & <tag>", "created_at": "2026-06-12T00:00:00Z"},
        {**REPO_OK, "name": "older-note", "homepage": "", "created_at": "2026-01-05T00:00:00Z"},
    ]
    feed = bi.render_feed(repos)
    assert feed.startswith('<?xml version="1.0" encoding="utf-8"?>')
    assert feed.count("<entry>") == 2
    assert "Note &amp; &lt;tag&gt;" in feed and "<tag>" not in feed
    # Feed-level updated is the newest entry stamp.
    assert "<updated>2026-06-12T00:00:00Z</updated>" in feed.split("<entry>")[0]
    assert "https://kiwimaddog2020.github.io/older-note/" in feed


def test_main_writes_feed_and_index_from_repo_data(tmp_path, monkeypatch):
    idx = tmp_path / "index.md"
    feed = tmp_path / "feed.xml"
    idx.write_text(DOC)
    monkeypatch.setattr(bi, "INDEX", idx)
    monkeypatch.setattr(bi, "FEED", feed)
    monkeypatch.setattr(bi, "note_repos", lambda: [REPO_OK])
    assert bi.main() == 0
    assert 'class="note-title"' in idx.read_text()
    assert "<entry>" in feed.read_text()
    # Second run is a no-op: nothing rewritten, exit stays 0.
    before = (idx.read_text(), feed.read_text())
    assert bi.main() == 0
    assert (idx.read_text(), feed.read_text()) == before
