# Publishing "decision-latency" — the two-minute runbook

The finished note lives in `repo-payload/` in this directory: the Jekyll site
(`docs/index.md`, layout, two figures with their render script), `DATA.md`
(every number with its reproduction command), `README.md`, MIT `LICENSE`, and
`PROPOSALS.md` (the naming record). It is audited: every number was re-derived
from the ledgers, and the corrections trail is in `DATA.md` §16.

The session that produced this could not create a repository (the GitHub App
token lacks that scope), so the last mile is yours. Two options.

## Option A: paste this locally (needs `gh`)

```bash
git clone -b claude/decision-latency-research-l4mt1e \
  https://github.com/KiwiMaddog2020/kiwimaddog2020.github.io /tmp/dl-handoff
cd /tmp/dl-handoff/docs/decision-latency/repo-payload
git init -b main && git add -A && git commit -m "decision-latency research note v1"
gh repo create KiwiMaddog2020/decision-latency --public --source . --push \
  --description "Is decision latency really the bottleneck in human-AI collaboration?" \
  --homepage "https://kiwimaddog2020.github.io/decision-latency/"
gh repo edit KiwiMaddog2020/decision-latency --add-topic research-note
gh api -X POST repos/KiwiMaddog2020/decision-latency/pages \
  -f build_type=legacy -f 'source[branch]=main' -f 'source[path]=/docs'
```

Then either merge this branch (its `data/notes.json` + `feed.xml` already carry
the new entry, so the listing goes live immediately), or skip the merge and run
the "Rebuild research index" workflow on the hub repo, which regenerates both
files from the `research-note` topic. The Sunday rebuild reconciles the entry's
timestamp to the repo's real `created_at` either way.

## Option B: create the empty repo, hand the push back

Create `KiwiMaddog2020/decision-latency` (public, empty is fine) in the GitHub
UI, set the description, homepage, and `research-note` topic as above, enable
Pages (main branch, `/docs` folder), and tell the session "repo exists" — it
will push `repo-payload/` as-is from where it sits.

## What the repo description controls

`bin/build_index.py` turns the repo description into the note's list title on
the hub and its feed title. The line used everywhere here:

> Is decision latency really the bottleneck in human-AI collaboration?

Sanity checks after Pages builds: the page at
https://kiwimaddog2020.github.io/decision-latency/ picks up the hub stylesheet
(same-host `/assets/research-notes.css`), both figures render, and the DATA.md
link in the footer resolves to the repo.
