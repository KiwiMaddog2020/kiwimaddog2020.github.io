# Decision latency: the evidence

Companion to the note at <https://kiwimaddog2020.github.io/decision-latency/>. Every number in
the note traces to a row here, and every row carries the command that produced it.

All times PDT (`export TZ=America/Los_Angeles`; both repos' committer offset is `-0700`). One
decimal on anything derived. All mining was read-only; no repo was modified.

Sources:

- **`whomp-play`**, the public deploy repo, <https://github.com/KiwiMaddog2020/whomp-play>. Every
  commit is `play build <short-sha-of-source-HEAD>`. Anyone can reproduce these rows.
- **`whomp`**, the game's source repo. **Private.** Rows citing it are verifiable by the repo
  owner only, and are marked *(private)*.
- Planning and checkpoint documents inside `whomp`, read at the commits that introduced them
  *(private)*.

Anchors used throughout:

| Anchor | Value | Command |
|---|---|---|
| `whomp` HEAD (end of window) | `4dde7132` 2026-07-28 19:34:45 | `git -C whomp show -s --pretty='%ad' --date=format:'%Y-%m-%d %H:%M:%S' HEAD` |
| Last deploy of 07-28 | 2026-07-28 19:38:21 (`play build 4dde713`) | `git -C whomp-play log -1 --pretty='%ad %s' --date=format:'%Y-%m-%d %H:%M:%S'` |
| `CHECKPOINT_6` written | `40d28da9` 2026-07-28 14:41:04 | `git -C whomp show -s --pretty='%ad' --date=format:'%Y-%m-%d %H:%M:%S' 40d28da9` |

> **Corrections against the first draft of this appendix.** An independent re-verification pass
> found four outright errors and three mischaracterisations in the original DATA.md. They are
> listed in full in the last section, "What the first draft got wrong". The values below are the
> corrected ones.

---

## 1. Deploy ledger, 2026-07-28 (public)

```
git -C whomp-play log --pretty='%ad %s' --date=format:'%Y-%m-%d %H:%M:%S' \
  --since='2026-07-28 00:00 -0700' --until='2026-07-29 00:00 -0700' | sort
```

| # | Ship time | Build sha | Cross-check |
|---|---|---|---|
| 1 | 02:18:44 | `467306c` | studio deploy #20; "deploys 20-21 ticked" in the 03:51 doc commit |
| 2 | 03:49:51 | `e21d40c` | `SPRINT.md`: "deploy: #21 (e21d40c Tue 03:50 ...)" |
| 3 | 05:53:06 | `7fb6dc6` | `SPRINT.md` 06:57: "Live: deploy 22 (7fb6dc6)" |
| 4 | 07:17:48 | `5913494` | |
| 5 | 09:32:23 | `f46b64b` | |
| 6 | 10:48:09 | `3371c39` | |
| 7 | 12:50:46 | `a3cda2d` | `CHECKPOINT_6`: "Deploy 26 LIVE (a3cda2d, verified by sha 12:50pm)" |
| 8 | 15:35:03 | `c86ce2f` | source commit `c86ce2fd` 15:32 (deploy-27 payload) |
| 9 | 16:47:37 | `387b276` | source merge `387b276e` 16:29 "glow-up 2" (deploy 28) |
| 10 | 19:38:21 | `4dde713` | source merge `4dde7132` 19:34 "gate reconciliation" (deploy 29) |

Derived:

- Span 02:18:44 → 19:38:21 = **17.3 h**.
- Intervals, minutes: **91.1, 123.2, 84.7, 134.6, 75.8, 122.6, 164.3, 72.6, 170.7**.
- **Median gap 122.6 min. Longest gap 170.7 min.**

Studio deploy numbering restarts mid-project; `#1` is `5ebbe66` 07-26 20:29. Verified against
three independent citations in `REPORT_RECONCILIATION_2026-07-28.md` (`D3=719da21`,
`D4=e1d8135`, `D5=900db71`), which match positions 3, 4 and 5 exactly:

```
git -C whomp-play log --reverse --pretty='%ad %s' --date=format:'%m-%d %H:%M' \
  --since='2026-07-26 20:00 -0700' | cat -n
```
→ `#20 = 467306c` 02:18 … `#26 = a3cda2d` 12:50 … `#29 = 4dde713` 19:38. **29 numbered deploys
in 47.1 h.**

## 2. Deploy cadence, whole project (public)

```
git -C whomp-play log --pretty='%ad' --date=format:'%Y-%m-%d %H:%M' | sort \
 | awk '{c[$1]++} END{for(d in c) print d, c[d]}' | sort
git -C whomp-play log --pretty='%s' | grep -cv '^play build '     # -> 0
```

**397 of the 398 commits are `play build <sha>`.** The one exception is the repo's first
commit, `0cc6180` 2026-07-11 13:30, whose subject is `WHOMP v0.9.0 play build`. (The mining
pass reported zero exceptions; re-running its own `grep -cv '^play build '` returns 1. No
plotted or quoted count depends on the filter, since the daily totals come from log dates.)
18 active days, 2026-07-11 → 2026-07-28, no gap days.

| Date | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Deploys | 9 | 5 | 8 | 46 | **49** | 11 | 39 | 26 | 18 | 42 | 15 | 19 | 6 | 21 | 37 | 22 | 15 | **10** |

- **Total 398 / 18 active days. Mean 22.1. Median 18.5. Record 49 on 07-15.**
- **2026-07-28's ten deploys is the 5th-lowest of the 18 active days**, below both mean and
  median. Only 07-12 (5), 07-23 (6), 07-13 (8) and 07-11 (9) were lower.
- Capacity ratio used in the note: 49 / 10 = **4.9×**.

This is the figure `docs/img/deploys-per-day.png`.

## 3. Source-repo activity, 2026-07-28 *(private)*

```
git -C whomp log --since='2026-07-28 00:00 -0700' --until='2026-07-29 00:00 -0700' --pretty='%at' | wc -l
git -C whomp log --since=... --until=... --merges | grep -c ^commit
git -C whomp log --since=... --until=... --pretty='%s' | grep -c '^merge:'
```

- **272 commits**, first `f8603428` 00:37:18, last `4dde7132` 19:34:45.
- **46 merge commits** (two-parent). **21** of them carry the `merge:` subject prefix. Both
  numbers are correct answers to different questions; the note uses 21 for lane landings and
  states the 46.

## 4. Lane concurrency, 2026-07-28 *(private)*: a lower bound, not a measurement

Lane names are **not** recorded in merge subjects that day:

```
git -C whomp log --since='2026-07-28 00:00 -0700' --until='2026-07-29 00:00 -0700' --pretty='%B' \
 | grep -oE '\b(claude|sol|codex|fable)/[a-zA-Z0-9._-]+' | sort | uniq -c
```
→ **one** hit all day (`sol/starfield-hitboxes`). Lane branches were deleted after merge; only
`main` exists. Counting distinct lanes from merge subjects is therefore not answerable. The
convention was used earlier in the project (`claude/hub-lod`, `claude/b6x-lockout` on 07-24 and
07-26) and dropped.

Substitute: reconstruct each merge's side-branch interval from topology.

```
for h in $(git -C whomp log --since='2026-07-28 00:00 -0700' \
             --until='2026-07-29 00:00 -0700' --merges --pretty=%H); do
  read p1 p2 <<< "$(git -C whomp show -s --pretty=%P $h)"
  b=$(git -C whomp merge-base $p1 $p2)
  start=$(git -C whomp log --pretty=%ct $p2 ^$b | sort -n | head -1)
  echo "$start $(git -C whomp show -s --pretty=%ct $h) ${h:0:8}"
done | sort -n
```

- 46 side branches merged, carrying 4 to 52 commits each (median 4).
- **Maximum simultaneously-open side branches: 6, at 09:02.**
- Total open-branch time **34.0 lane-hours**; mean concurrency across the 00:41 → 19:34 window
  **1.6**.

**Label: topology-derived lower bound.** A branch's start is its first *commit*, not the moment
the lane was spawned; work committed straight to `main` is invisible to it; and the 52-commit
branch `00e0ca58` began the previous evening (07-27 22:41).

## 5. The fast queue: rulings recorded in commit subjects *(private)*

```
git -C whomp log --all --pretty='%ad|%h|%s' --date=format:'%m-%d %H:%M' \
 | grep -iE '\|.*(kevin|ratifi|director (ruling|pick|verdict|call|split)|by director|per director)' | sort
```
→ **82 commits** whose subject records a human decision. Per day:

| Day | 07-11 | 07-12 | 07-13 | 07-16 | 07-18 | 07-19 | 07-20 | 07-24 | 07-25 | 07-26 | 07-27 | 07-28 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| n | 1 | 1 | 1 | 7 | 2 | 1 | 3 | 8 | 23 | 22 | 12 | **1** |

The studied day recorded **exactly one** human ruling in a commit subject (`7f38e53e` 00:45:22,
"meteor ground-target decal deleted by director ruling"), against 23 on 07-25 and 22 on 07-26.
**The arrival rate is wildly non-stationary**, which is why the note demotes Little's Law to a
frame and prints no expected-wait arithmetic.

Grouping consecutive rulings ≤30 min apart into one burst:

| Burst | Window | n | Span | Inter-ruling gaps (min) |
|---|---|---|---|---|
| style-lab boots | 07-16 00:54→01:54 | 6 | 60 min | 1.7, 24.7, 18.7, 4.0, 10.6 |
| B6y/B6z live review | 07-24 23:08→23:58 | 5 | 51 min | 10.6, 18.8, 4.6, 16.5 |
| Homefall | 07-25 08:32→09:01 | 4 | 29 min | 13.9, 3.7, 11.4 |
| B17-B21 | 07-25 22:27→23:51 | 10 | 83 min | 2.7, 5.7, 18.1, 1.4, 2.7, 21.9, 11.0, 17.1, 2.7 |
| B22/B17 addenda | 07-26 00:56→01:11 | 4 | 16 min | 7.1, 4.6, 4.1 |
| B20/B23 | 07-26 01:48→02:03 | 5 | 15 min | 3.3, 5.1, 4.0, 2.6 |
| Composition Law rounds | 07-26 10:39→10:54 | 3 | 16 min | 13.1, 2.6 |
| aimed-core / round-4 | 07-27 01:02→01:50 | 5 | 48 min | 26.3, 8.8, 2.8, 10.6 |

**All intra-burst gaps: n = 34 · median 6.4 min · min 1.4 · max 26.3.**

*Correction against the mining pass, which reported 7.1 min.* Sorted, the 34 values are 1.4,
1.7, 2.6, 2.6, 2.7, 2.7, 2.7, 2.8, 3.3, 3.7, 4.0, 4.0, 4.1, 4.6, 4.6, 5.1, 5.7, 7.1, 8.8, 10.6,
10.6, 10.6, 11.0, 11.4, 13.1, 13.9, 16.5, 17.1, 18.1, 18.7, 18.8, 21.9, 24.7, 26.3. With n even,
the median is the mean of the 17th and 18th (5.7 and 7.1) = **6.4**. The pass took the 18th
value alone. The note and both figures use 6.4.

Upper bound on
per-decision answer time: each gap also contains the agent writing the design doc between
rulings, and only decisions a commit recorded are visible.

## 6. The 33-card ratification *(private)*

Four decision documents exist across the full history, all present at HEAD:

```
git -C whomp log --all --diff-filter=A --name-only --pretty='' | sort -u \
  | grep -iE 'RATIF|VERDICT|DECISION|CARD'
git -C whomp show -s --pretty='%h %ad %s' --date=format:'%Y-%m-%d %H:%M:%S' \
  a9eb3369 86eb219e e2981efe 13cb8c21
```

| Doc | Commit | PDT |
|---|---|---|
| `docs/design/weapon_anim_overhaul/AUDIT_CARDS.md` | `a9eb3369` | 2026-07-27 13:32:17 |
| `docs/design/weapon_anim_overhaul/RATIFICATION_2026-07-27.md` | `86eb219e` | 2026-07-27 14:47:57 |
| `docs/CODEX_HANDOFFS/2026-07-27_loose_ends_ratification.md` | `e2981efe` | 2026-07-26 13:44:54 |
| `docs/CODEX_HANDOFFS/2026-07-27_tier2_accounts_verdict.md` | `13cb8c21` | 2026-07-27 05:10:12 |

*Ambiguity flagged:* two filenames read `2026-07-27` but were committed on 07-26. Filename
dates in `docs/CODEX_HANDOFFS/` are not reliable timestamps; commit dates are.

The ratification opens: *"Kevin rated all 33 audit cards in one rapid-fire session against
AUDIT_CARDS.md."* Audit presented 13:32:17, ratification recorded 14:47:57:

**75.7 min for 33 decisions = ≤2.3 min per decision.** This is an **upper bound** and nothing
tighter is recoverable: the window also contains the agent's own doc-writing time, and the
document records **no per-card timestamps**. Corroboration that the session was live inside the
window: `2e20b31d` 14:35:37 "planet climbs to 40deg, director split-difference on shadow
length" lands 12 min before the ratification and the same ruling appears in its non-weapon
section.

Defaults accepted, by the doc's own convention (deviations are set in **bold** and "OVERRIDE the
audit cards where they conflict"):

```
git -C whomp show 86eb219e:docs/design/weapon_anim_overhaul/RATIFICATION_2026-07-27.md \
 | awk '/^\| Card \| Verdict/{f=1;next} /^\|---/{next} f&&/^\|/{n++; if($0 ~ /\*\*/) b++} END{print n,b,n-b}'
```
→ `33 10 23`. **23/33 (69.7%) ratified as carded; 10/33 (30.3%) carried an override.** A looser
rule (any of `**`, `PLUS`, `BUT`, `only if`, `RESTART`, `RENAMED`, `LOWER`, `first, then`) gives
14 modified / 19 pure = **57.6% unmodified**. Both are reported; the choice of rule is a
judgement, not a measurement.

The same sitting also produced 6 standing taste laws, a 5-stage wave plan (W0-W4), and 3
non-weapon rulings. The presentation format **is** recoverable and is a card table
(`| Card | Verdict |`), which is evidence of *format used*, not of *format effect*.

The other three docs, for contrast: `2026-07-27_loose_ends_ratification.md` carries **8 numbered
calls** in one document with no per-call timestamps; `2026-07-27_tier2_accounts_verdict.md` is a
single FIX-FORWARD verdict in prose with 4 findings, the prose end of the format spectrum.
`AUDIT_CARDS.md`'s §8 `WIRE`/`SKIP`/`PARTIAL` column refers to wiring weapons into
`WeaponFxDescriptor`, **not** to a do/don't recommendation; it is not an override baseline.

## 7. The day's ratified decisions *(private)*

`docs/CHECKPOINT_6_2026-07-28.md` (`40d28da9`, 14:41:04), section header: *"Today's ratified
decisions (all logged in TaskList #24-#31)"*.

- **"8" is a TaskList id span (#24-#31), not a count of decisions.**
- The section has **5 bullets**. Two of them (hub finale scope, accounts next week) carry no
  task id.
- The weapon-integration bullet alone contains **3** distinct rulings: manual-aim default for
  mouse and keyboard; *"forgiving hitboxes... Overwatch not CS:GO"* (verbatim); pad default =
  soft-lock.
- **Distinct rulings recorded ≥ 10.**

## 8. Pending lists and per-item ages *(private)*

Twelve files ever carry a structured pending-decision heading; five carry a live rolling queue
(`docs/CODEX_HANDOFFS/PROGRESS.md`, `docs/SPRINT.md`, `docs/SESSION_HANDOFF.md`,
`docs/CHECKPOINT_6_2026-07-28.md`, `docs/TRAIN_LEDGER_2026-07-26.md`).

```
git -C whomp rev-list --all -- docs/ > /tmp/docrevs.txt     # 495 commits
git -C whomp grep -l -iE 'PENDING KEVIN|Kevin-gated|KEVIN VERDICT BASKET|eyeball ledger|Kevin verdict queue|OPEN DECISIONS FOR KEVIN' \
  $(cat /tmp/docrevs.txt) -- docs/ | sed 's/^[0-9a-f]*://' | sort | uniq -c | sort -rn
```

### 8.1 The verdict basket was byte-identical for 41.9 hours

`docs/SPRINT.md` gained `## KEVIN VERDICT BASKET (tomorrow, batched - nothing blocks on these)`
at `bf320757` **2026-07-27 01:40:00**, with 11 items, plus a strict-subset `Kevin verdict
queue:` line of 6. It is present and byte-identical in every later revision and at HEAD:

```
for r in bf320757 83841b7b 22276f9e c7821a7f a79328e5 HEAD; do
  printf "%-9s %s\n" "$r" "$(git -C whomp show $r:docs/SPRINT.md \
    | grep -A2 'KEVIN VERDICT BASKET' | md5sum | cut -c1-12)"; done
```
→ all six: `7d128cfcc3d9`.

**01:40:00 on 07-27 → HEAD 19:34:45 on 07-28 = 41.9 h with zero items added or removed.** Over
the same span the file's own `Board complete:` counter, one line below the basket, moved
**~24% → ~95%** (71 points):

```
git -C whomp log --all --reverse --pretty='%h %ad' --date=format:'%m-%d %H:%M' -- docs/SPRINT.md \
 | while read s d t; do printf "%s %s %s  %s\n" "$s" "$d" "$t" \
     "$(git -C whomp show $s:docs/SPRINT.md | grep -o 'Board complete: ~[0-9]*%')"; done
```
→ 07-27 01:40 ~24% · 01:52 ~24% · 02:19 ~24% · 03:11 ~38% · 04:32 ~46% · 04:59 ~50% · 08:53 ~58% ·
10:45 ~70% · 13:25 ~82% · 15:30 ~85% · 16:54 ~87% · 17:43 ~88% · 19:33 ~90% · 21:40 ~91% ·
22:41 ~92% · 07-28 03:51 ~95%.

**Caveat, carried in the note:** at least one basket item was decided while the basket kept
listing it (§8.4). Byte-identity proves the queue was never *curated*; it does not by itself
prove no item was answered.

### 8.2 The eyeball ledger (11 items)

`docs/CHECKPOINT_6_2026-07-28.md` @ `40d28da9` 07-28 14:41:04, heading *"Kevin's eyeball ledger
(unchanged, batched for one hub lap)"*, 11 semicolon-separated items. Only **3** carry over from
the 07-27 basket (Borealisk pick, report-36 re-snap, feel sessions); **8 are new that day**. The
word "(unchanged," is the document asserting no movement, consistent with but independent of the
md5 result above.

### 8.3 Confirmed decided: presented → verdict

Method: first-seen = earliest commit whose diff introduces the phrase
(`git log --all -S'<phrase>' | tail -1`); resolution = a commit or doc whose text records a
verdict. Conservative by construction.

| Item | Presented | Verdict recorded | Age |
|---|---|---|---|
| Void district map v1 | `fbab99ef` 07-26 17:04:53 "pending Kevin approval" | `e32a01e2` 07-26 18:06:05 "relocate the void district onto the approved map" | **1.0 h** |
| Hub planet-light elevation | `5ebf68c1` 07-27 13:53:41 | `2e20b31d` 07-27 14:35:37 (40°) | **0.7 h** |
| 33 weapon-anim cards | `a9eb3369` 07-27 13:32:17 | `86eb219e` 07-27 14:47:57 | **1.3 h** (33 decisions) |
| R/F ability concepts | `ac247399` 07-27 01:50:33 "concept sheets for ratification" | `7d4cff84` 07-27 08:25:31 "R kits v2 RATIFIED" | **6.6 h** |
| Same item, from redraft | `9871ca90` 07-27 08:20:13 "R_CONCEPTS draft 2" | `7d4cff84` 08:25:31 | **5.3 min** |
| Boss overhaul spec | `1b8d1483` 07-18 19:06 "draft spec for ratification (#21)" | `e38b847b` 07-19 02:41 "ratified boss overhaul" | **7.6 h** |
| Mystery statues (reversal) | built `35643ceb` 07-26 20:22 (report 54) | `42ac49f3` 07-27 09:50 "mystery statues DELETED (Kevin ruling)" (report 84) | **13.5 h** |

```
git -C whomp show -s --pretty='%h %ad %s' --date=format:'%m-%d %H:%M:%S' \
  fbab99ef e32a01e2 5ebf68c1 2e20b31d a9eb3369 86eb219e ac247399 9871ca90 7d4cff84 \
  1b8d1483 e38b847b 35643ceb 42ac49f3
```

**Over the 6 distinct items** (excluding the redraft sub-measurement): 0.7, 1.0, 1.3, 6.6, 7.6,
13.5 h → **median 3.9 h · min 0.7 · max 13.5**.

*Second correction against the mining pass, which reported 4.0 h.* Computed from the unrounded
minute values (41.9333, 61.2000, 75.6667, 394.9667, 455.7333, 808.0333), the median is
(75.6667 + 394.9667) / 2 = 235.3167 min = **3.92 h**, which prints as 3.9. The pass averaged the
already-rounded hour figures ((1.3 + 6.6) / 2 = 3.95) and rounded up. Rounding before averaging
rather than after.

### 8.4 Still pending at HEAD (07-28 19:34:45)

No verdict text anywhere in history for any of these.

| Item | First seen | Age at HEAD |
|---|---|---|
| Maps standalone bigger (Kevin-gated) | `40186bc5` 07-23 22:56:06 | **116.6 h** |
| Borealisk pick | `9b671369` 07-25 14:57:12 | **76.6 h** |
| report-36 re-snap | `e9d2c697` 07-26 16:32:29 | **51.0 h** |
| cousin PvP test | `e9d2c697` 07-26 16:32:29 | **51.0 h** |
| desert-snow-patches call | `e9d2c697` 07-26 16:32:29 | **51.0 h** |
| audit's 18 rulings | `5a37efdb` 07-27 00:15:50 | **43.3 h** |
| grotto jump-vs-ramp | `5a37efdb` 07-27 00:15:50 | **43.3 h** |
| listening pass (B10 + H5) | `5a37efdb` 07-27 00:15:50 | **43.3 h** |
| mapping plans (minimap) | `bf320757` 07-27 01:40:00 | **41.9 h** |
| payoff name + magnetism | `bf320757` 07-27 01:40:00 | **41.9 h** |
| accounts tap | `f6f6888b` 07-27 10:45:34 | **32.8 h** |
| feel sessions | `e6a02fde` 07-28 01:45:06 | **17.8 h** |
| hub taste lap | `e6a02fde` 07-28 01:45:06 | **17.8 h** |

**Over these 13: median 43.3 h · min 17.8 · max 116.6.** Eight further items enter the eyeball
ledger at 14:41:04 and are open at HEAD (**4.9 h** each): Fallen Column statue; bridge joint;
bird perch silhouette; roofless museum + tailor + forge bake + observatory; detail sweep tour;
legendary jingle; chain lightning while strafe-turning; F in a run for rune hoop. Including
them (n = 21): median 41.9 h · min 4.9 · max 116.6.

```
for q in 'Maps standalone bigger' 'Borealisk' 'report 36' 'cousin PvP' \
         'desert-snow-patches' 'accounts tap' 'feel sessions' 'hub taste lap'; do
  printf "%-26s " "$q"
  git -C whomp log --all -S"$q" --pretty='%h %ad' --date=format:'%m-%d %H:%M:%S' | tail -1
done
```

Borealisk, for the note's dateline: first flagged `9b671369` 07-25 14:57:12 in
`docs/CODEX_HANDOFFS/PROGRESS.md` ("Borealisk REDESIGN pending direction pick"; siblings
Rimestag and Hollow King v2 locked in the same entry). **76.7 h to the 19:38:21 deploy**, 76.6 h
to HEAD. `CHECKPOINT_6` labels it "BIGGEST content gate".

report-36, for the note's dateline: first flagged `e9d2c697` **07-26 16:32:29** ("PENDING KEVIN:
PvP cousin test ..., report 36 re-snap, desert-snow-patches design call"). **46.1 h to the
14:41:04 checkpoint, 51.1 h to the 19:38:21 deploy.**

### 8.5 Vanished or ambiguous: not evidence of a decision

| Item | Note |
|---|---|
| sprite sketches + R concept ratification | The R half **is** confirmed decided (`7d4cff84`, 07-27 08:25:31) yet the basket still listed it at 07-28 03:51 and at HEAD: **19.4 h of stale queue**. The sprite half traces separately to `86eb219e`'s Graviton "variant A The Fallen Column" ruling. Classify: decided, ledger never updated. |
| The basket after 07-28 03:51 | `docs/SPRINT.md`'s last commit is `a79328e5` 07-28 03:51; the file still exists at HEAD. The basket did not vanish; the document stopped being written to and the live ledger moved to `CHECKPOINT_6` at 14:41. Not a resolution event. |
| `PENDING KEVIN (nag gently)` in `SESSION_HANDOFF.md` | Byte-identical at `2b483c9c` 07-26 22:01:08, `e6a02fde` 07-28 01:45:06 and `c5ab9e35` 07-28 06:51:15 (4 items). Persistence, not resolution. |
| "bridge joint" | First string hit `35745225` 07-27 11:48:46 is a **camera-bookmark id**, not a pending item. As a decision item its first appearance is 07-28 14:41:04. The later date is used. |

> **Zero items in this corpus were observed to disappear from a pending list because they were
> answered.** Every traceable disappearance is a document rewrite or a document going stale. Git
> gives clean *arrival* times, and clean *verdict* times when a verdict commit exists. It does
> not give reliable *removal-from-queue* times.

## 9. Independent corroboration: 1 of 111 reports was human-gated *(private)*

`docs/REPORT_RECONCILIATION_2026-07-28.md` (`97fc227d`, 07-28 01:01:51) audits every player
report id 3 → 113, written by a lane with no knowledge of this research question.

```
git -C whomp show 97fc227d:docs/REPORT_RECONCILIATION_2026-07-28.md
```

Disposition, verbatim from the doc: **FIXED 105 · UNADDRESSED 3 (111, 112, 113) · NEEDS-KEVIN 1
(id 36) · SUPERSEDED 1 (54) · NOT-A-BUG 1 (106) · IN-FLIGHT 0 · QUEUED 0**, out of **111
reports** spanning `dump-2026-07-17` → `dump-2026-07-28`.

**Exactly 1 of 111 (0.9%) was blocked on a human decision**, and it is report 36, the same item
dated in §8.4.

The three UNADDRESSED reports flagged at 01:01:51 were fixed and merged by `7617374d` at
02:20:08: **78.3 minutes** from audit-flag to merged fix, with no human decision in the loop.

Contrast, same repo: the Laws 12-13 hub audit (`0c2c80a8`, 07-27 00:07, ~75 findings) marks
**17 findings `needs-Kevin`**:
```
git -C whomp show 0c2c80a8:docs/audits/2026-07-26_law12_13_audit.md | grep -oic 'needs-kevin'
```
→ `17`, roughly **23%**. Audits generate decisions; bug reports generate work. The gating rate
is a property of the instrument as well as the person.

## 10. The two queues, side by side

| Queue | Statistic | Value | n | Ratio |
|---|---|---|---|---|
| Fast, in-session rapid-fire | median gap between consecutive rulings | **6.4 min** | 34 gaps | 1× |
| Fast, present→ratify pairs | median age | **3.9 h** | 6 items | 36.6× |
| Slow, eyeball/taste, still pending | median age at HEAD | **43.3 h** | 13 items | **406×** |

43.3 h = 2598 min; 2598 / 6.4 = **406.0**, reported as ~406×. This is the figure
`docs/img/two-queues.png`.

## 11. The 21-report hub lap, 2026-07-28 *(private, except the deploys)*

| Time | Event |
|---|---|
| 16:47:37 | deploy 28 live (`387b276`), rebuilt hub exposed to the director |
| 17:49:41 | fix lane's first commit (`fb161f60`) |
| 18:57:49 | fix lane's last commit |
| 19:02:12 | merge `f611a938` "hub live-fixes - all 21 director reports" |
| 19:38:21 | deploy 29 live (`4dde713`) |

- **Lane span 17:49:41 → 18:57:49 = 72.5 min of fix work.**
- **Exposure to live: 16:47:37 → 19:38:21 = 170.7 min.**
- **The "21" is exact.** The lane's commits cite 18 ids as `report(s) N` plus 3 more written as
  `seam class 116/119/125`, giving 21 distinct ids: 116-134 and 137-138. A grep for
  `reports? [0-9/, and]+` alone yields 22 numbers that day (8, 111, 112, 113, 117, 118, 120-124,
  126-134, 137, 138), but only 18 of those 22 fall in 117-138; the other four were fixed between
  01:09 and 02:20, fourteen hours before the lap. Do not describe the lap as "reports 117
  through 138".

## 12. Blocking-shape vocabulary, written before this question was asked *(private)*

- `bf320757` 07-27 01:40:00: `## KEVIN VERDICT BASKET (tomorrow, batched - nothing blocks on
  these)`, plus a separate `Kevin verdict queue:` line.
- `docs/BACKLOG.md:110`: "...is not a playtest decision. So this waits for Kevin."
- `docs/MULTIPLAYER_PLAN.md:363`: "OPEN DECISIONS FOR KEVIN (rapid-fire menu)".

## 13. Little's Law: demoted, deliberately

The first draft ran WIP 11 ÷ 8 ratifications/day ≈ 1.4 d. The arithmetic is right (11/8 =
1.375) and both inputs are not. The "8" is a TaskList id span (§7), and the arrival rate is
non-stationary by more than twentyfold between adjacent days (23 on 07-25, 1 on 07-28; §5). No
defensible expected wait can be computed from this data, so the note keeps Little's Law as a
qualitative frame and prints no number from it.

## 14. Machine-side echo (public)

`oneshot-bench/PROMPT_LEARNINGS.md:80-81`, verbatim: *"Verification economics decide loop
efficiency: tuned harnesses spend 5-9% of build cost on checking; unoptimized agent panels spend
50-70%."* The noun is **checking**.

## 15. Known-missing / not measurable

- **Per-card timestamps** inside `RATIFICATION_2026-07-27.md`: do not exist. Only the 75.7-min
  envelope.
- **Removal-from-queue times**: do not exist (§8.5).
- **Lane names and true agent concurrency on 07-28**: not recorded (§4).
- **Session transcript**: off-machine. Arrival and answer times for decisions that never
  produced a commit are invisible, which biases every latency here **long** and every count
  **low**, since fast decisions leave no trace.
- **Reversal rate**: n = 1 measured (§8.3, mystery statues). Not a rate.
- **Presentation-format effect**: format *used* is recoverable; format *effect* is not. No prose
  control was run.

## 16. What the first draft got wrong

An independent re-verification pass checked all 23 claims in the original appendix.

| Original claim | Verdict | Corrected |
|---|---|---|
| Intervals `91, 124, 84, 135, 76, 122, 165, 72, 171` | **wrong (rounding)** | `91.1, 123.2, 84.7, 134.6, 75.8, 122.6, 164.3, 72.6, 170.7`; four of nine misrounded |
| Median gap 123 min | confirmed barely | true median **122.6**; the median of the printed integer list was 122, an internal inconsistency |
| report-36 first flagged `1bf6712c` 07-26 19:12 | **wrong** | `1bf6712c` is the *second* occurrence; first is `e9d2c697` **07-26 16:32:29** |
| report-36 age 43.5 h | **wrong** | right arithmetic, wrong anchor: **46.1 h** to the checkpoint, **51.1 h** to the last deploy |
| The lap ran 17:39-19:02 | **wrong** | 17:39:36 (`1c52e097`) belongs to the *fuel* lane, merged separately at 17:50:19. Lap lane is **17:49:41 → 18:57:49** |
| "reports 117 through 138", 22 distinct | **mischaracterised** | 22 is the correct grep count, but only 18 fall in 117-138; the merge's "21" is exact for a different reason (§11) |
| 8 ratified decisions | **mischaracterised** | TaskList id span #24-#31; 5 bullets; ≥10 distinct rulings (§7) |
| 21 lane merges | confirmed, incomplete | 21 by subject prefix, **46** actual merge commits |
| Little's Law ≈ 1.4 d | arithmetic fine, inputs shaky | demoted (§13) |

A second pass, rebuilding the figures from the raw values, found three more:

| Claim | Verdict | Corrected |
|---|---|---|
| Fast-queue median 7.1 min | **wrong** | **6.4 min**; 7.1 is the 18th of 34 sorted values, not the mean of the 17th and 18th (§5) |
| Confirmed-decided median 4.0 h | **wrong** | **3.9 h**; the pass rounded to one decimal before averaging (§8.3) |
| "All 398 deploy commits are `play build <sha>`, zero exceptions" | **wrong** | 397 of 398; the repo's first commit reads `WHOMP v0.9.0 play build` (§2) |

The queue ratio in §10 moves with the first of these, from ~366× to **~406×**.

Confirmed unchanged: 10 deploys and their times to the second, span 17.3 h, longest gap 170.7
min, 272 source commits, first 00:37 / last 19:34, Borealisk anchor and 76.7 h age, the 19:02:12
merge, the 19:38:21 deploy, the 170.7-min exposure window, 11 eyeball-ledger items, the
`oneshot-bench` quote, and all three blocking-shape vocabulary citations.

---

*Public rows reproduce against <https://github.com/KiwiMaddog2020/whomp-play> with the commands
above. Rows marked private cite a repo I have not published; they are owner-verifiable only, and
I would rather say so than present them as public evidence.*
