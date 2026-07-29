---
description: "I checked the claim that decision latency, not build speed, bottlenecks human-AI collaboration against the git ledgers of one ten-deploy day. The latency was real, days in one case, and it cost almost nothing, which is the interesting part."
---

# The human queue

*Draft, 2026-07-29. Working note toward a published research piece.*

During a studio session on 2026-07-28 the conductor model, reviewing my notes
on agentic operating loops, made this claim:

> "The bottleneck in human-AI collaboration is never build speed, it's
> decision latency."

It sounds right, which is exactly why it needs checking. I run a setup where
models build a game in parallel lanes and I ratify decisions; if the claim is
true anywhere it should be true in my own logs. So I mined the only
instruments from that day that do not depend on anyone's memory: the git
history of the game's source repo, the git history of the public deploy repo,
and the checkpoint documents the session wrote as it went.

The short version: the claim is half right, and the half that is wrong is
more useful than the half that is right. Latency was enormous, days in one
case. It also cost almost nothing, because the system had been shaped, partly
on purpose, so that pending decisions blocked almost nothing. What governs
throughput is not how long a decision waits. It is how much of the work graph
waits with it.

## The setup

WHOMP is a browser game built almost entirely by coding agents: a conductor
session plans and merges, worker lanes build in parallel worktrees, and I
play the game, file numbered reports, and answer decision prompts. Deploys go
out through a gated script to a public GitHub Pages repo, so every ship has a
public commit with a timestamp and the short sha of the source commit it was
built from.

Three sources, all from 2026-07-28 (times are PDT):

- the source repo's commit log (private repo; the citations from it are
  verifiable only by me, and I say so where it matters),
- the deploy repo's commit log ([whomp-play](https://github.com/KiwiMaddog2020/whomp-play),
  public: every entry is `play build <sha>`),
- the day's checkpoint docs, written mid-session for a future session to
  resume from, which record ratified decisions and pending ones.

What I did not use: the session transcript, which holds the decision prompts
and their answer timestamps. It lives on my machine and was out of reach of
the environment this note was mined in. That absence sets a hard limit on
this note, and the "what was not measured" section owns it.

## What the ledgers show

The deploy repo has ten builds on 2026-07-28: 02:18, 03:49, 05:53, 07:17,
09:32, 10:48, 12:50, 15:35, 16:47, 19:38. That is a 17.3-hour span, median
gap 123 minutes, longest gap 171 minutes. The source repo has 272 commits
that calendar day, first at 00:37, last at 19:34, then silence. The deploy
shas cross-check against the checkpoint doc: it says deploy 26 was "verified
by sha 12:50pm," and the public repo has `play build a3cda2d` at exactly
12:50.

First correction, and it is a correction of me: the handoff notes for this
research described the day from memory as roughly fourteen hours and five
deploys. The ledger says ten deploys across seventeen hours. My recall of my
own headline number was off by a factor of two, one day later. Every count in
this note therefore comes from a log, and the numbers I could not get from a
log are labeled as missing rather than remembered.

## Two queues with different physics

The checkpoint written at 14:41 that day records eight ratified decisions,
all made that session: default control scheme, hitbox philosophy ("forgiving
hitboxes... Overwatch not CS:GO" is preserved verbatim in the doc), scope
calls, scheduling calls. Those cleared in-session, effectively same-day.

The same document carries a second list it calls the eyeball ledger: eleven
items "batched for one hub lap," things I need to see or play in the built
game before ruling. Two of them can be dated across days:

- **The Borealisk pick.** A boss redesign flagged "pending direction pick" in
  a progress doc on 07-25 at 14:57. Its two sibling bosses were locked in the
  same breath; this one needed me to look at directions and choose. At the
  day's last deploy, 76.7 hours later, it was still open, and the checkpoint
  calls it the "BIGGEST content gate."
- **The report-36 re-snap.** First listed under a "PENDING KEVIN" heading on
  07-26 at 19:12, still on the ledger at the 14:41 checkpoint, 43.5 hours
  later.

So the two queues have different physics, and the difference is not
importance. The Borealisk pick was the single most important open item by the
system's own label, and it was also the oldest. What separates the queues is
the medium the answer requires. A decision I can make from the chair, reading
a prompt, clears in minutes to hours. A decision that requires launching the
game, walking somewhere, and forming a taste verdict waits for days and gets
batched into a lap.

The lap itself is measurable from the outside. The 16:47 deploy shipped the
rebuilt hub; I toured it and filed numbered reports; fix commits citing
reports 117 through 138 (22 distinct numbers that day) run from 17:39 to
19:02, when a merge commit titled "all 21 director reports" lands; the next
deploy, at 19:38, put every one of them live. From the deploy that exposed
the flaws to the deploy that fixed them: 171 minutes, for 21 verdicts. Per
verdict, that is a latency no prompt-and-wait loop would touch.

## Blocking shape beat latency

Here is the part that revises the conductor's claim. A 76.7-hour-old decision
sat at the head of the queue, and the day still shipped ten deploys. Nothing
in the deploy ledger shows a stall traceable to a pending human answer. The
snow-tier boss work that genuinely needed the Borealisk pick sat still, one
narrow branch of the work graph, while everything else moved.

That was not luck; it is visible as design in the docs, written before this
question was ever posed. A planning doc from 07-27 batches my open verdicts
into a "KEVIN VERDICT BASKET (tomorrow, batched - nothing blocks on these)"
and keeps a separate, deliberately short "Kevin-gated" list. A backlog entry
ends "So this waits for Kevin." The multiplayer plan presents my open calls
as a "rapid-fire menu." The system's own vocabulary treats a pending decision
as a thing to route around, not a thing to wait on.

So the falsifiable version of the claim should be: throughput is governed by
the product of decision latency and the fraction of the work graph the
decision freezes, summed over pending decisions. Call it blocked-lane-hours.
On this day the latencies were large and the frozen fractions were kept near
zero, so the product stayed small and build speed, not the human queue, set
the pace. The corollary I started with, that latency matters less than
blocking shape, survives contact with the ledger. The stronger versions,
about presentation format and batching effects on answer quality, remain
untested here.

One sanity check from queueing theory, offered with a loose grip. Little's
Law says items in queue equal arrival rate times time in system. The eyeball
ledger held eleven items; the day ratified eight decisions. If those rates
were typical, the expected age of a queued verdict is around 1.4 days, and
the two datable items aged 1.8 and 3.2 days. Same order of magnitude, which
is all the check can claim: the items are not homogeneous, the rates are not
stationary, and fast decisions that never touched a doc are invisible to
this count, which biases the measured queue old.

## Prior art, and what is actually new here

None of the ingredients are new. Little's Law is from 1961. Code-review
research at large companies has measured for a decade that review turnaround,
not coding time, dominates change lead time, and that small, well-framed
requests get faster answers. The interruption-cost literature in CSCW has
long measured that resuming deep work after a context switch costs tens of
minutes. Ousterhout's framing of engineering management as decisions per
unit time points the same direction.

The part I have not seen measured is specific to agentic systems: when the
building, testing, reviewing, and merging are all machine-side, the human
decision queue is the last human-shaped thing in the loop, and the cheap
levers on it, presentation format, batching policy, and defer-and-pivot
buffers, are design choices nobody is instrumenting. There is a machine-side
echo of the same shape in my oneshot-bench notes: untuned agent panels spent
50 to 70 percent of build cost on judging, tuned harnesses 5 to 9 percent.
The deciding loop, human or machine, is where the overhead lives.

## What was not measured

- **Per-decision time-to-answer.** The arrival and answer timestamps live in
  the session transcript, which this note could not read. Everything here is
  bounded from deploy and commit timestamps instead. The handoff notes claim
  the day held forty-plus decisions with card answers in seconds; I could
  verify neither number, so neither appears as a result.
- **Presentation format effects.** The repo's own drift toward "rapid-fire
  menu" formats is circumstantial evidence that cards beat prose, not a
  measurement. Untested.
- **Answer quality.** Fast is not right. Reversal rates for card answers
  versus deliberated answers are unmeasured, so batching and speed get no
  quality credit here.
- **Confounds on the aged decisions.** The Borealisk clock includes nights,
  meals, and a life. Age in queue is not attention demanded, and one blocked
  lane over three days may have cost nothing if I would not have staffed it
  anyway.
- **N.** One operator, one day, observational, mined by the collaborator
  side of the collaboration. Treat every number as a case study, not a
  distribution.

## What I would run next

Two small experiments, preregistered before the next marathon so I cannot
cherry-pick afterward. First, the format A/B: the same class of decision
presented as prose in some sessions and as a card with a recommended default
in others, measuring time-to-answer and later reversals. Second, the replay:
reconstruct the day's work graph and replay it under instant decisions,
measured latencies, and a work-stealing buffer, reporting throughput deltas.
The first tests the cheapest lever; the second puts a number on
blocked-lane-hours instead of an argument.

## Takeaway

The conductor's aphorism compresses to "the human is the bottleneck," and the
ledger says something more precise: the human is the *scarce* resource, and
whether scarcity becomes a bottleneck is a design choice about blocking
shape. Three things visibly did the work on this day, and all three are cheap:
keep the set of decisions that can freeze work deliberately small, batch
verdicts by the medium they need (one lap, 21 rulings) rather than answering
them as they arrive, and let the work route around anything still pending. A
faster model would not have shipped an eleventh deploy that day. Whether one
more hour of my attention would have is exactly the measurement the next
session should make.
