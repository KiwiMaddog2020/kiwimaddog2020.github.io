#!/usr/bin/env python3
"""Content-hash cache busting.

Stamps each linked stylesheet/script with a short hash of its own content, so a
link's ?v= changes if and only if that file changes. Run automatically by the
.githooks/pre-commit hook; safe to run by hand any time. No Jekyll processing or
GitHub Pages settings needed -- it just rewrites query strings in the HTML.
"""
import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# asset file (hashed)  ->  list of HTML files whose link to it should be stamped
ASSETS = {
    "assets/research-notes.css": ["index.html", "_layouts/default.html"],
    "assets/learn.css": ["index.html"],
    "assets/learn.js": ["index.html"],
}


def short_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:10]


def stamp(html_path: Path, basename: str, h: str) -> bool:
    text = html_path.read_text()
    # Match the file reference (href/src) optionally followed by a ?v=... query,
    # up to the closing quote. Rewrite the query to ?v=<hash>.
    pattern = re.compile(r'(' + re.escape(basename) + r')(\?v=[^"\']*)?')
    new_text, n = pattern.subn(lambda m: f"{m.group(1)}?v={h}", text)
    if n and new_text != text:
        html_path.write_text(new_text)
        return True
    return False


def main() -> int:
    changed = []
    for asset, html_files in ASSETS.items():
        asset_path = ROOT / asset
        if not asset_path.exists():
            print(f"stamp-cache: missing asset {asset}", file=sys.stderr)
            return 1
        h = short_hash(asset_path)
        basename = Path(asset).name
        for hf in html_files:
            if stamp(ROOT / hf, basename, h):
                changed.append(f"{hf} <- {basename}?v={h}")
    for c in changed:
        print("stamp-cache:", c)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
