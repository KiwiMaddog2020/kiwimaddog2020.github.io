#!/usr/bin/env python3
"""Rebuild data/notes.json and feed.xml from research-note repos.

Lists the owner's PUBLIC repositories tagged with the `research-note` topic
via the GitHub API and writes two artifacts the site consumes:

  * `data/notes.json` -- the research notes list, rendered client-side by the
    Study app's #/research route. Each entry uses the repo's description as its
    title and the repo's homepage (the note's GitHub Pages URL) as its link,
    falling back to the conventional Pages URL for project sites.
  * `feed.xml` -- the Atom feed, one entry per note.

The site is a single static app served at the root; there is no Jekyll-rendered
index page anymore, so the notes live as JSON the app fetches.

Pure stdlib. `GITHUB_TOKEN` is used when present (the Actions run); anonymous
requests work locally within the unauthenticated rate limit. Exits 0 with
"unchanged" when both outputs are already current, so the Actions run only
commits real changes.

Titles are HTML/JSON-escaped on use: the list renders on the public site, and
even self-authored metadata should not be able to inject markup. Link
DESTINATIONS are validated (not escaped): a crafted homepage on any repo tagged
research-note would otherwise land verbatim in the published list.
"""

from __future__ import annotations

import html
import json
import os
import sys
import urllib.request
from pathlib import Path

OWNER = "KiwiMaddog2020"
TOPIC = "research-note"
ROOT = Path(__file__).resolve().parent.parent
NOTES = ROOT / "data" / "notes.json"
FEED = ROOT / "feed.xml"
SITE_URL = f"https://{OWNER.lower()}.github.io/"
SITE_TITLE = "Arbiter Machinae · Research notes"


def _api(path: str):
    req = urllib.request.Request(
        f"https://api.github.com{path}",
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": f"{OWNER}-research-index",
            **(
                {"Authorization": f"Bearer {os.environ['GITHUB_TOKEN']}"}
                if os.environ.get("GITHUB_TOKEN")
                else {}
            ),
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def _esc(text: str) -> str:
    """HTML/XML-escape untrusted text for element or attribute context."""
    return html.escape(text, quote=True)


def _safe_page_url(homepage: str, name: str) -> str:
    """Validate a link DESTINATION; fall back to the conventional Pages URL.

    A crafted homepage on any repo tagged research-note (javascript: scheme, a
    quote breakout into attribute context, or control characters) would
    otherwise land verbatim in the public list.
    """
    from urllib.parse import urlsplit

    fallback = f"{SITE_URL}{name}/"
    candidate = (homepage or "").strip()
    if not candidate:
        return fallback
    try:
        parts = urlsplit(candidate)
    except ValueError:
        return fallback
    if parts.scheme not in ("http", "https") or not parts.netloc:
        return fallback
    if any(ch in candidate for ch in "()<>'\"\\ "):
        return fallback
    # Reject ASCII control chars and DEL (tab/newline survive urlsplit and
    # would land raw in the published attribute).
    if any(ord(ch) < 0x21 or ord(ch) == 0x7F for ch in candidate):
        return fallback
    return candidate


def note_repos() -> list[dict]:
    repos = []
    page = 1
    while True:
        batch = _api(f"/users/{OWNER}/repos?per_page=100&page={page}&sort=created&direction=desc")
        if not batch:
            break
        repos.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    return [
        r
        for r in repos
        if not r.get("private")
        and not r.get("fork")
        and TOPIC in (r.get("topics") or [])
        and r.get("name") != f"{OWNER.lower()}.github.io"
    ]


def render_notes_json(repos: list[dict]) -> str:
    """The notes list the Study app fetches and renders client-side.

    Titles are stored raw (the client escapes on render); destinations are
    validated here so a bad homepage cannot reach the page.
    """
    notes = []
    for r in repos:
        notes.append(
            {
                "title": (r.get("description") or r["name"]).strip(),
                "url": _safe_page_url(r.get("homepage") or "", r["name"]),
                "code": r["html_url"],
                "date": (r.get("created_at") or "")[:10],
            }
        )
    return json.dumps(notes, indent=2) + "\n"


def render_feed(repos: list[dict]) -> str:
    """Atom feed, one entry per note.

    Entry timestamps use the repo's created_at: it is stable (pushed_at
    churns on every code commit, which would re-mark entries unread for
    subscribers), and a note is "published" when its repo is.
    """
    entries = []
    newest = ""
    for r in repos:
        title = _esc((r.get("description") or r["name"]).strip())
        page = _safe_page_url(r.get("homepage") or "", r["name"])
        stamp = r.get("created_at") or "1970-01-01T00:00:00Z"
        newest = max(newest, stamp)
        entries.append(
            "  <entry>\n"
            f"    <title>{title}</title>\n"
            f'    <link href="{_esc(page)}"/>\n'
            f"    <id>{_esc(page)}</id>\n"
            f"    <updated>{_esc(stamp)}</updated>\n"
            f"    <summary>{title}</summary>\n"
            "  </entry>"
        )
    return (
        '<?xml version="1.0" encoding="utf-8"?>\n'
        '<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>\n'
        '<feed xmlns="http://www.w3.org/2005/Atom">\n'
        f"  <title>{_esc(SITE_TITLE)}</title>\n"
        f'  <link href="{SITE_URL}feed.xml" rel="self"/>\n'
        f'  <link href="{SITE_URL}"/>\n'
        f"  <id>{SITE_URL}</id>\n"
        f"  <updated>{_esc(newest)}</updated>\n"
        "  <author><name>Kevin Madson</name></author>\n"
        + "\n".join(entries)
        + "\n</feed>\n"
    )


def main() -> int:
    repos = note_repos()
    if not repos:
        # FAIL SAFE: an empty result is more likely a visibility or API
        # hiccup than a real "no notes exist" state, and a hand-seeded entry
        # must survive a cron run that fires before a repo flips public.
        # (A nonempty-but-smaller list DOES overwrite: removing the topic
        # from a repo is the intended de-listing mechanism.)
        print("no public research-note repos found; leaving notes unchanged")
        return 0
    changed = []
    notes = render_notes_json(repos)
    NOTES.parent.mkdir(parents=True, exist_ok=True)
    if not NOTES.exists() or NOTES.read_text(encoding="utf-8") != notes:
        NOTES.write_text(notes, encoding="utf-8")
        changed.append("data/notes.json")
    feed = render_feed(repos)
    if not FEED.exists() or FEED.read_text(encoding="utf-8") != feed:
        FEED.write_text(feed, encoding="utf-8")
        changed.append("feed.xml")
    print("rebuilt: " + ", ".join(changed) if changed else "unchanged")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
