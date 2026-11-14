"""Tests for bin/stamp-cache.py (content-hash cache stamps on asset links)."""
import importlib.util
import re
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location("stamp_cache", ROOT / "bin" / "stamp-cache.py")
sc = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(sc)


def test_stamp_adds_a_hash_to_a_bare_link(tmp_path):
    page = tmp_path / "page.html"
    page.write_text('<link href="/assets/site.css">')
    assert sc.stamp(page, "site.css", "abc123") is True
    assert page.read_text() == '<link href="/assets/site.css?v=abc123">'


def test_stamp_replaces_an_old_hash_and_is_a_no_op_when_current(tmp_path):
    page = tmp_path / "page.html"
    page.write_text('<script src="/assets/app.js?v=old" defer></script>')
    assert sc.stamp(page, "app.js", "new") is True
    assert page.read_text() == '<script src="/assets/app.js?v=new" defer></script>'
    assert sc.stamp(page, "app.js", "new") is False


def test_stamp_leaves_other_files_alone(tmp_path):
    page = tmp_path / "page.html"
    page.write_text('<link href="/assets/other.css?v=1">')
    assert sc.stamp(page, "site.css", "abc") is False
    assert page.read_text() == '<link href="/assets/other.css?v=1">'


def test_short_hash_tracks_content(tmp_path):
    f = tmp_path / "a.css"
    f.write_text("one")
    first = sc.short_hash(f)
    f.write_text("two")
    assert re.fullmatch(r"[0-9a-f]{10}", first)
    assert sc.short_hash(f) != first


def test_main_fails_on_a_missing_asset(tmp_path, monkeypatch):
    monkeypatch.setattr(sc, "ROOT", tmp_path)
    assert sc.main() == 1


@pytest.mark.parametrize("asset,pages", sorted(sc.ASSETS.items()))
def test_committed_pages_carry_the_current_stamp(asset, pages):
    # Fails when an asset changed and bin/stamp-cache.py was not run.
    name = Path(asset).name
    want = f"{name}?v={sc.short_hash(ROOT / asset)}"
    for page in pages:
        text = (ROOT / page).read_text()
        refs = re.findall(re.escape(name) + r"(?:\?v=[^\"']*)?", text)
        assert refs, f"{page} does not link {name}"
        assert all(r == want for r in refs), f"{page}: run python3 bin/stamp-cache.py"
