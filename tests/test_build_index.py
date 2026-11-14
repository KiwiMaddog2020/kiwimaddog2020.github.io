"""Oracle for the index generator: notes.json + feed rendering, escaping,
destination validation, fail-safe, pagination, and filtering.

The site is a single static app served at the root: there is no Jekyll index
page and no marker surgery anymore. `build_index.py` writes `data/notes.json`
and `feed.xml`, plus the note cards stamped into `index.html`.
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
        # Match "&page=N&" exactly: a bare "page=1" also matches "per_page=100".
        if "&page=1&" in path:
            seen["p1"] = True
            return page1
        if "&page=2&" in path:
            seen["p2"] = True
            return page2
        return []

    monkeypatch.setattr(bi, "_api", fake_api)
    names = [r["name"] for r in bi.note_repos()]
    assert seen == {"p1": True, "p2": True}
    assert len(names) == 101 and names[-1] == "last"


def test_note_repos_stops_at_page_cap_when_api_never_ends(monkeypatch):
    full_page = [
        {"name": f"r{i}", "private": False, "fork": False, "topics": ["research-note"]}
        for i in range(100)
    ]
    calls = []

    def endless_api(path):
        calls.append(path)
        return full_page

    monkeypatch.setattr(bi, "_api", endless_api)
    repos = bi.note_repos()
    assert len(calls) == bi.MAX_PAGES
    assert len(repos) == 100 * bi.MAX_PAGES


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


# --- main() writes its outputs, fails safe, and is idempotent -------------

import pytest


@pytest.fixture(autouse=True)
def _never_write_real_outputs(tmp_path, monkeypatch, request):
    """Point every output path at a temp folder so no test can touch the real
    site files. Tests that check the committed files opt out with the
    `committed_files` marker and only ever read."""
    if request.node.get_closest_marker("committed_files"):
        return
    home = tmp_path / "index.html"
    home.write_text(f"<ul>\n{bi.HOME_START}\n{bi.HOME_END}\n</ul>\n", encoding="utf-8")
    monkeypatch.setattr(bi, "HOME", home)
    monkeypatch.setattr(bi, "META", tmp_path / "notes-meta.json")
    monkeypatch.setattr(bi, "NOTES", tmp_path / "notes.json")
    monkeypatch.setattr(bi, "FEED", tmp_path / "feed.xml")


def test_main_writes_notes_json_and_feed_from_repo_data(tmp_path, monkeypatch):
    notes = tmp_path / "notes.json"
    feed = tmp_path / "feed.xml"
    monkeypatch.setattr(bi, "NOTES", notes)
    monkeypatch.setattr(bi, "FEED", feed)
    monkeypatch.setattr(bi, "note_repos", lambda: [REPO_OK])
    assert bi.main([]) == 0
    data = json.loads(notes.read_text())
    assert data[0]["title"] == "a note"
    assert "<entry>" in feed.read_text()
    assert bi.HOME.read_text().count('class="nb-card"') == 1
    # Second run is a no-op: nothing rewritten, exit stays 0.
    before = (notes.read_text(), feed.read_text(), bi.HOME.read_text())
    assert bi.main([]) == 0
    assert (notes.read_text(), feed.read_text(), bi.HOME.read_text()) == before


def test_offline_mode_restamps_home_without_touching_the_network(tmp_path, monkeypatch):
    def no_network(path):
        raise AssertionError("offline mode must not call the GitHub API")

    monkeypatch.setattr(bi, "_api", no_network)
    bi.NOTES.write_text(json.dumps([_note(title="Offline note")]), encoding="utf-8")
    assert bi.main(["--offline"]) == 0
    assert "Offline note" in bi.HOME.read_text()


def test_empty_repo_set_leaves_notes_and_feed_untouched(tmp_path, monkeypatch):
    # FAIL SAFE: a rebuild that finds no public research-note repos (an API
    # hiccup, or every repo still private) must never blank a seeded list.
    notes = tmp_path / "notes.json"
    feed = tmp_path / "feed.xml"
    notes.write_text('[{"title": "seeded"}]\n')
    feed.write_text("seeded")
    monkeypatch.setattr(bi, "NOTES", notes)
    monkeypatch.setattr(bi, "FEED", feed)
    monkeypatch.setattr(bi, "note_repos", lambda: [])
    home_before = bi.HOME.read_text()
    assert bi.main([]) == 0
    assert bi.HOME.read_text() == home_before
    assert notes.read_text() == '[{"title": "seeded"}]\n'
    assert feed.read_text() == "seeded"


# ---- Home page cards (index.html between the notes markers) ----

def _note(**over):
    base = {
        "title": "A note",
        "url": "https://kiwimaddog2020.github.io/a-note/",
        "code": "https://github.com/KiwiMaddog2020/a-note",
    }
    base.update(over)
    return base


def test_home_cards_escape_titles_and_findings():
    notes = [_note(title='<script>alert(1)</script> & "quotes"')]
    meta = {notes[0]["code"]: {"finding": "<b>bold</b>", "kind": "<i>x</i>"}}
    out = bi.render_home_cards(notes, meta)
    assert "<script>" not in out and "<b>" not in out and "<i>" not in out
    assert "&lt;script&gt;" in out and "&lt;b&gt;bold&lt;/b&gt;" in out


def test_home_cards_reject_foreign_links():
    notes = [_note(url="javascript:alert(1)", code="https://evil.example/repo")]
    out = bi.render_home_cards(notes, {})
    assert "javascript:" not in out and "evil.example" not in out
    assert f'href="{bi.SITE_URL}"' in out
    assert 'href="https://github.com/KiwiMaddog2020"' in out


def test_home_cards_unknown_status_falls_back_to_untested():
    notes = [_note()]
    out = bi.render_home_cards(notes, {notes[0]["code"]: {"status": "amazing"}})
    assert 'data-status="untested"' in out
    out = bi.render_home_cards(notes, {notes[0]["code"]: {"status": "revised", "label": "revised Jul 10"}})
    assert 'data-status="revised"' in out and "revised Jul 10" in out


def test_stamp_home_replaces_only_between_markers_and_is_idempotent():
    page = f"<ul>\n{bi.HOME_START}\nOLD\n{bi.HOME_END}\n</ul><p>keep</p>"
    once = bi.stamp_home(page, "<li>new</li>")
    assert "OLD" not in once and "<li>new</li>" in once and "<p>keep</p>" in once
    assert bi.stamp_home(once, "<li>new</li>") == once


def test_stamp_home_refuses_a_page_without_markers():
    with pytest.raises(ValueError):
        bi.stamp_home("<ul></ul>", "<li>x</li>")


@pytest.mark.committed_files
def test_committed_home_page_matches_notes_json():
    """index.html must be what the generator would write from the committed data."""
    notes = json.loads(bi.NOTES.read_text(encoding="utf-8"))
    page = bi.HOME.read_text(encoding="utf-8")
    assert bi.stamp_home(page, bi.render_home_cards(notes, bi.load_meta())) == page
    assert page.count('class="nb-card"') == len(notes)


@pytest.mark.committed_files
def test_notes_meta_keys_are_listed_notes_with_valid_status():
    notes = json.loads(bi.NOTES.read_text(encoding="utf-8"))
    codes = {n["code"] for n in notes}
    for code, m in bi.load_meta().items():
        assert code in codes, f"notes-meta.json entry for an unlisted note: {code}"
        assert m.get("status", "untested") in bi.STATUSES
        assert "—" not in json.dumps(m, ensure_ascii=False), "no em-dashes in site copy"


def test_figure_data_matches_published_counts():
    data = json.loads((bi.ROOT / "data" / "figures" / "reviewers.json").read_text(encoding="utf-8"))
    assert len(data["defects"]) == data["n_defects"] == 30
    caught = {r["id"]: sum(r["id"] in d["caught"] for d in data["defects"]) for r in data["raters"]}
    assert caught == {"gemini": 27, "claude": 23, "codex": 21}
    assert all(d["caught"] for d in data["defects"])  # the three together caught all 30


def test_broken_home_page_stops_the_run_before_anything_is_written(tmp_path, monkeypatch):
    # A home page that lost its markers must not leave notes.json and feed.xml
    # updated while index.html stays stale.
    notes = tmp_path / "notes.json"
    feed = tmp_path / "feed.xml"
    notes.write_text("old notes")
    feed.write_text("old feed")
    monkeypatch.setattr(bi, "NOTES", notes)
    monkeypatch.setattr(bi, "FEED", feed)
    monkeypatch.setattr(bi, "note_repos", lambda: [REPO_OK])
    bi.HOME.write_text("<ul></ul>\n", encoding="utf-8")
    with pytest.raises(ValueError):
        bi.main([])
    assert notes.read_text() == "old notes"
    assert feed.read_text() == "old feed"
    assert bi.HOME.read_text() == "<ul></ul>\n"
