#!/usr/bin/env python3
"""Rebuild the Notes list in index.md from public research-note repos.

Lists the owner's PUBLIC repositories tagged with the `research-note` topic
via the GitHub API and regenerates the block between the notes:start /
notes:end markers in index.md. Each entry uses the repo's description as
its title and the repo's homepage (the note's GitHub Pages URL) as its
link, falling back to the conventional Pages URL for project sites.

Pure stdlib. `GITHUB_TOKEN` is used when present (the Actions run);
anonymous requests work locally within the unauthenticated rate limit.
Exits 0 with "unchanged" when the list is already current, so the Actions
run only commits real changes.

Descriptions are markdown-escaped before insertion: the index renders on
the public site, and even self-authored metadata should not be able to
inject markup.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.request
from pathlib import Path

OWNER = "KiwiMaddog2020"
TOPIC = "research-note"
START = "<!-- notes:start -->"
END = "<!-- notes:end -->"
INDEX = Path(__file__).resolve().parent.parent / "index.md"


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


def _escape_md(text: str) -> str:
    """Escape markdown/HTML specials so a description renders as plain text."""
    out = text.replace("\\", "\\\\")
    for ch in "[]()*_`<>#!":
        out = out.replace(ch, "\\" + ch)
    return out


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


def render_entries(repos: list[dict]) -> str:
    lines = []
    for r in repos:
        title = _escape_md((r.get("description") or r["name"]).strip())
        page = (r.get("homepage") or "").strip() or f"https://{OWNER.lower()}.github.io/{r['name']}/"
        lines.append(f"- [{title}]({page}) ([code]({r['html_url']}))")
    return "\n".join(lines)


def rebuild(src: str, entries: str) -> str:
    head, rest = src.split(START, 1)
    _, tail = rest.split(END, 1)
    return f"{head}{START}\n{entries}\n{END}{tail}"


def main() -> int:
    src = INDEX.read_text(encoding="utf-8")
    if START not in src or END not in src:
        print("index.md is missing the notes markers", file=sys.stderr)
        return 1
    repos = note_repos()
    if not repos:
        # FAIL SAFE: an empty result is more likely a visibility or API
        # hiccup than a real "no notes exist" state, and a hand-seeded entry
        # must survive a cron run that fires before a repo flips public.
        print("no public research-note repos found; leaving index unchanged")
        return 0
    new = rebuild(src, render_entries(repos))
    if new == src:
        print("unchanged")
        return 0
    INDEX.write_text(new, encoding="utf-8")
    print("rebuilt")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
