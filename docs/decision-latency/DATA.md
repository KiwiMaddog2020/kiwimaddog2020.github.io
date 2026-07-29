# Decision latency: mined evidence, 2026-07-28

Companion to `NOTE.md`. Every number in the note traces to a row here. All
times PDT (`TZ=America/Los_Angeles`; the repos' committer offset is -0700).

Sources:

- `whomp`: game source repo (private). Rows citing it are verifiable by the
  repo owner only.
- `whomp-play`: public deploy repo, https://github.com/KiwiMaddog2020/whomp-play.
  Every commit is `play build <short-sha-of-source-HEAD>`.
- Checkpoint/planning docs inside `whomp` at the cited commits.

## Deploy ledger (public, whomp-play)

```
git -C whomp-play log --pretty='%ad %s' --date=format:'%m-%d %H:%M'
```

| # | Ship time | Build sha | Cross-check |
|---|-----------|-----------|-------------|
| 1 | 02:18 | 467306c | "deploys 20-21 ticked" doc commit 03:51 |
| 2 | 03:49 | e21d40c | SPRINT.md: "deploy: #21 (e21d40c Tue 03:50 ...)" |
| 3 | 05:53 | 7fb6dc6 | SPRINT.md checkpoint 06:57: "Live: deploy 22 (7fb6dc6)" |
| 4 | 07:17 | 5913494 | |
| 5 | 09:32 | f46b64b | |
| 6 | 10:48 | 3371c39 | |
| 7 | 12:50 | a3cda2d | CHECKPOINT_6: "Deploy 26 LIVE (a3cda2d, verified by sha 12:50pm)" |
| 8 | 15:35 | c86ce2f | source commit c86ce2fd at 15:32 (deploy-27 payload) |
| 9 | 16:47 | 387b276 | source merge 387b276e 16:29 "glow-up 2" (deploy 28) |
| 10 | 19:38 | 4dde713 | source merge 4dde7132 19:34 "gate reconciliation" (deploy 29) |

Derived: span 02:18-19:38 = 17.3 h; intervals (min) 91, 124, 84, 135, 76,
122, 165, 72, 171; median 123 min.

## Source-repo activity (private, whomp)

```
git log --since='2026-07-28 00:00 -0700' --until='2026-07-29 00:00 -0700' --pretty='%at'
```

272 commits, first 00:37, last 19:34 (span 19.0 h), then silence for the
rest of the calendar day. 21 commits that day are lane merges (`merge:`
prefix). Largest intra-day gaps in the commit stream: 103 min ending 05:35,
48 min ending 15:32, 39 min ending 12:44, 35 min ending 06:32.

## The decision record (docs inside whomp)

- **Ratified same-session (8):** `docs/CHECKPOINT_6_2026-07-28.md`
  (commit 40d28da9, 14:41), section "Today's ratified decisions (all logged
  in TaskList #24-#31)". Includes the verbatim hitbox ruling ("forgiving
  hitboxes... Overwatch not CS:GO").
- **Eyeball ledger (11 items):** same doc, final section, "unchanged,
  batched for one hub lap". Includes "Borealisk pick (BIGGEST content
  gate)" and "report-36 re-snap".
- **Borealisk age:** first flagged in `docs/CODEX_HANDOFFS/PROGRESS.md` at
  commit 9b671369 (2026-07-25 14:57): "Borealisk REDESIGN pending direction
  pick" (siblings Rimestag and Hollow King v2 locked in the same entry).
  Still open at the 19:38 deploy on 07-28: 76.7 h = 3.2 days.
- **report-36 re-snap age:** first "PENDING KEVIN" listing at commit
  1bf6712c (2026-07-26 19:12); still pending at the 14:41 checkpoint:
  43.5 h.
- **Blocking-shape vocabulary (predates this research question):**
  - commit bf320757 (07-27 01:40): "KEVIN VERDICT BASKET (tomorrow,
    batched - nothing blocks on these)" + separate "Kevin-gated:" list.
  - `docs/BACKLOG.md:110`: "...is not a playtest decision. So this waits
    for Kevin."
  - `docs/MULTIPLAYER_PLAN.md:363`: "OPEN DECISIONS FOR KEVIN (rapid-fire
    menu)".

## The 21-report lap

- 16:47: deploy 28 live (rebuilt hub exposed to the director).
- 17:39-19:02: fix commits citing report numbers 117-138 (22 distinct
  numbers cited in commit subjects that day; count via
  `git log --pretty='%s' | grep -oiE 'reports? [0-9/, and]+' | grep -oE '[0-9]+' | sort -un`).
- 19:02: merge f611a938 "hub live-fixes - all 21 director reports".
- 19:38: deploy 29 live. Deploy-exposing-flaws to fixes-live: 171 min.

## Little's Law check

WIP = 11 (eyeball ledger) ÷ throughput ≈ 8 ratifications/day → expected
time-in-queue ≈ 1.4 days. Observed datable ages: 1.8 d (report-36, still
pending) and 3.2 d (Borealisk, still pending). Consistency is
order-of-magnitude only; see the note's hedges (non-stationary rates,
heterogeneous items, undercount of fast decisions).

## Machine-side echo

`oneshot-bench/PROMPT_LEARNINGS.md` (public repo, "Protocol v3 learnings"):
"tuned harnesses spend 5-9% of build cost on checking; unoptimized agent
panels spend 50-70%."

## Known-missing data (blocks on the operator's machine)

- Session transcript: per-decision arrival/answer timestamps, presentation
  format per decision, the claimed 40+ decision count, the token-ceiling
  window (~19:53-20:30, consistent with but not proven by the post-19:38
  ledger silence).
- Endenza memory corpus: work_stealing_loop.md, turbo_mode.md,
  decision-firing.md (design intent behind the routing-around behavior).
