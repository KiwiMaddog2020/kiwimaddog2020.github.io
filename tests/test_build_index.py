"""Oracle for the index generator: notes.json + feed rendering, escaping,
destination validation, fail-safe, pagination, and filtering.

The site is a single static app served at the root: there is no Jekyll index
page and no marker surgery anymore. `build_index.py` writes `data/notes.json`
(fetched by the Study app's #/research route) and `feed.xml`.
"""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location("build_index", REPO / "bin" / "build_index.py")
bi = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(bi)

REPO_OK = {
    "name": "note-repo",
    "description": "a note",
    "homepage": "https://kiwimaddog2020.github.io/note-repo/",
    "html_url": "https://github.com/KiwiMaddog2020/note-repo",
    "created_at": "2026-06-12T00:00:00Z",
}


# --- notes.json rendering -------------------------------------------------

def test_render_notes_json_is_valid_json_with_the_expected_shape():
    out = bi.render_notes_json([REPO_OK])
    data = json.loads(out)
    assert data == [
        {
            "title": "a note",
            "url": "https://kiwimaddog2020.github.io/note-repo/",
            "code": "https://github.com/KiwiMaddog2020/note-repo",
            "date": "2026-06-12",
        }
    ]


def test_render_notes_json_stores_title_raw_for_the_client_to_escape():
    # The client (learn.js #/research) escapes on render; the data file keeps
    # the description verbatim so the title is not double-escaped on the page.
    repos = [{**REPO_OK, "description": 'totally <b>bold</b> & "quoted"'}]
    data = json.loads(bi.render_notes_json(repos))
    assert data[0]["title"] == 'totally <b>bold</b> & "quoted"'


def test_render_notes_json_falls_back_to_name_and_pages_url():
    repos = [
        {
            "name": "quiet-repo",
            "description": None,
            "homepage": "",
            "html_url": "https://github.com/KiwiMaddog2020/quiet-repo",
            "created_at": "2026-01-01T00:00:00Z",
        }
    ]
    data = json.loads(bi.render_notes_json(repos))
    assert data[0]["title"] == "quiet-repo"
    assert data[0]["url"] == "https://kiwimaddog2020.github.io/quiet-repo/"


# --- destination validation (the security property) -----------------------

def test_safe_page_url_rejects_crafted_destinations():
    cases = [
        "javascript:alert(1)",
        "https://x.example) <script>bad()</script> (",
        "https://x.example/<!-- notes:end -->",
        'https://x.example/" onmouseover="bad()',
        "https://x.example/' onmouseover='bad()",
        "https://x.example/\tinjected",
        "https://x.example/\ninjected",
        "ftp://x.example/",
        "https://",
    ]
    for homepage in cases:
        assert bi._safe_page_url(homepage, "note-repo") == \
            "https://kiwimaddog2020.github.io/note-repo/", homepage


def test_crafted_destinations_never_reach_notes_json_or_feed():
    for homepage in ("javascript:alert(1)", 'https://x.example/" onmouseover="x', "ftp://x.example/"):
        notes = bi.render_notes_json([{**REPO_OK, "homepage": homepage}])
        feed = bi.render_feed([{**REPO_OK, "homepage": homepage}])
        for out in (notes, feed):
            assert "x.example" not in out
            assert "javascript:" not in out
            assert "onmouseover" not in out
            assert "https://kiwimaddog2020.github.io/note-repo/" in out


def test_safe_page_url_keeps_a_legitimate_destination():
    assert bi._safe_page_url("https://x.example/note/", "r") == "https://x.example/note/"


def test_legitimate_query_string_survives_in_json_and_is_escaped_in_feed():
    homepage = "https://x.example/?a=1&b=2"
    # notes.json carries the raw URL (JSON string; the DOM sets href safely).
    data = json.loads(bi.render_notes_json([{**REPO_OK, "homepage": homepage}]))
    assert data[0]["url"] == homepage
    # The feed is XML, so the ampersand must be entity-escaped.
    feed = bi.render_feed([{**REPO_OK, "homepage": homepage}])
    assert "https://x.example/?a=1&amp;b=2" in feed
    assert "?a=1&b=2" not in feed


# --- feed rendering -------------------------------------------------------

def test_render_feed_structure_escaping_and_updated():
    repos = [
        {**REPO_OK, "description": "Note & <tag>", "created_at": "2026-06-12T00:00:00Z"},
        {**REPO_OK, "name": "older-note", "homepage": "", "created_at": "2026-01-05T00:00:00Z"},
    ]
    feed = bi.render_feed(repos)
    assert feed.startswith('<?xml version="1.0" encoding="utf-8"?>')
    assert '<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>' in feed
    assert feed.count("<entry>") == 2
    assert "Note &amp; &lt;tag&gt;" in feed and "<tag>" not in feed
    # Feed-level updated is the newest entry stamp.
    assert "<updated>2026-06-12T00:00:00Z</updated>" in feed.split("<entry>")[0]
    assert "https://kiwimaddog2020.github.io/older-note/" in feed
    assert "<author><name>Kevin Madson</name></author>" in feed
    assert "Arbiter Machinae" in feed


# --- repo discovery -------------------------------------------------------

def test_note_repos_paginates_across_pages(monkeypatch):
    page1 = [
        {"name": f"r{i}", "private": False, "fork": False, "topics": ["research-note"]}
        for i in range(100)
    ]
    page2 = [{"name": "last", "private": False, "fork": False, "topics": ["research-note"]}]
    seen = {}

    def fake_api(path):
        if "page=1" in path:
            seen["p1"] = True
            return page1
        if "page=2" in path:
            seen["p2"] = True
            return page2
        return []

    monkeypatch.setattr(bi, "_api", fake_api)
    names = [r["name"] for r in bi.note_repos()]
    assert seen == {"p1": True, "p2": True}
    assert len(names) == 101 and names[-1] == "last"


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


# --- main() writes both artifacts, fails safe, and is idempotent ----------

def test_main_writes_notes_json_and_feed_from_repo_data(tmp_path, monkeypatch):
    notes = tmp_path / "notes.json"
    feed = tmp_path / "feed.xml"
    monkeypatch.setattr(bi, "NOTES", notes)
    monkeypatch.setattr(bi, "FEED", feed)
    monkeypatch.setattr(bi, "note_repos", lambda: [REPO_OK])
    assert bi.main() == 0
    data = json.loads(notes.read_text())
    assert data[0]["title"] == "a note"
    assert "<entry>" in feed.read_text()
    # Second run is a no-op: nothing rewritten, exit stays 0.
    before = (notes.read_text(), feed.read_text())
    assert bi.main() == 0
    assert (notes.read_text(), feed.read_text()) == before


def test_empty_repo_set_leaves_notes_and_feed_untouched(tmp_path, monkeypatch):
    # FAIL SAFE: a cron run that finds no public research-note repos (an API
    # hiccup, or every repo still private) must never blank a seeded list.
    notes = tmp_path / "notes.json"
    feed = tmp_path / "feed.xml"
    notes.write_text('[{"title": "seeded"}]\n')
    feed.write_text("seeded")
    monkeypatch.setattr(bi, "NOTES", notes)
    monkeypatch.setattr(bi, "FEED", feed)
    monkeypatch.setattr(bi, "note_repos", lambda: [])
    assert bi.main() == 0
    assert notes.read_text() == '[{"title": "seeded"}]\n'
    assert feed.read_text() == "seeded"
