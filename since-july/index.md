---
title: What changed since July
description: Three of the July experiments, run again in November 2026 on four current Claude models, with what held, what moved and what can no longer be measured.
permalink: /since-july/
---

# What changed since July

<p class="byline">Kevin Madson · November 14, 2026 · Claude models only</p>

In July I published a set of experiments on how AI models review code, grade
each other and judge their own confidence. Models have moved on since then, so I
ran the three core experiments again on four current Claude models: Haiku 5.5,
Sonnet 5.5, Opus 5.5 and Fable 5.2. The rules for each rerun were written down and
committed before any model was called.

The short version: one finding held, one got a sharper limit, and one test is now
too easy to tell these models apart.

## 1. A second look beats a different model, inside one family

**In June** three reviewers from three different companies, working blind, together
caught all 30 planted bugs in 20 code snippets. The best single reviewer caught 27.

**The question for the rerun** came from outside. A study published in October
([Song, 2026](https://arxiv.org/abs/2610.01471)) found that a second model was not
clearly better than the same model looking again in a fresh session. So I tested
exactly that: does pairing two *different* Claude models catch more than asking the
*same* model twice?

**Now.** Each of the four models reviewed all 20 snippets twice, in separate fresh
sessions.

| Pairing | Bugs caught by the pair | Extra over the better of the two |
|---|---|---|
| Same model, two looks | 26.00 of 30 | 0.50 |
| Two different models | 26.25 of 30 | 0.54 |

The difference is 0.04 bugs, with a 95% range of -0.58 to 0.67. By the rule I set in
advance, that reads: **a second look is just as good**. Taking one review from
each of the four models, the group caught 26 to 29 depending on which reviews were
picked. One bug was missed by every review, eight times out of eight.

<p class="nb-margin">Single models ranged from 23 to 27 of 30. The smallest model was not the weakest reviewer.</p>

What this does not say: it does not test reviewers from different companies. The
June result still stands as measured, and I did not rerun it. What it adds is a
limit. Within one model family, swapping tiers buys you nothing a fresh session
would not.

## 2. Graders still lean toward their own writing

**In July** Claude Opus 4.8, grading blind in a panel of three model families, gave
its own answers +2.7 points more than the same answers earned from others.

**Now.** Four Claude models each wrote answers to ten prompts, then each graded all
of them blind, with the labels shuffled.

| Grader | Extra points for its own answer | 95% range |
|---|---|---|
| Haiku 5.5 | +3.65 | +1.63 to +6.07 |
| Sonnet 5.5 | -1.05 | -2.67 to +0.48 |
| Opus 5.5 | -0.50 | -1.63 to +0.68 |
| Fable 5.2 | +1.90 | +0.52 to +3.40 |
| All four, averaged | +1.00 | +0.32 to +1.77 |

Points are on a 100-point scale, holding the answer fixed and removing how generous
each grader is overall. The average is above zero, so by the rule set in advance:
**Claude models favour their own model's text**, even against close relatives. Two
of the four do it clearly. Two show nothing detectable at this size, which is not
proof of none.

The effect is small, about one point in a hundred. It is still a reason to keep the
first lab rule. Larger outside studies agree that the lean is real and that a panel
of judges shrinks it without removing it
([Pombal and others, 2026](https://arxiv.org/abs/2604.06996)).

The July and November numbers come from different panels, so only the direction can
be compared. The direction is the same.

## 3. The confidence test is now too easy

**In July** Opus 4.8 answered 22 hard questions, got 95.5% right and said it was 99%
sure on average. Slightly overconfident.

**Now.** The same 22 questions plus a harder bank of 72. The table shows the harder
bank; on the original 22 every model scored 100%.

| Model | Right, harder bank | Average confidence |
|---|---|---|
| Haiku 5.5 | 98.6% | 90.5% |
| Sonnet 5.5 | 98.6% | 95.1% |
| Opus 5.5 | 98.6% | 94.6% |
| Fable 5.2 | 100% | 96.0% |

Every model scored above 90%, which the plan had already named as a **ceiling
result**: these questions no longer separate these models. All four now state
slightly less confidence than their scores would justify, the opposite of July. I
would not lean on that. When nearly every answer is right, any confidence short of
100% looks like modesty.

Two honest limits. The answers to these questions have been public since July, so
newer models may have seen them. And with only one or two wrong answers per model,
there is nothing to say about whether models share the same mistakes. That question
matters: an earlier study found that when two models are both wrong they give the
same wrong answer about 60% of the time
([Kim and others, 2025](https://proceedings.mlr.press/v267/kim25e.html)). Testing it
on current models needs harder, private questions.

## Where each July claim stands

| Claim | Status | Why |
|---|---|---|
| A model should never grade its own work | Holds | The lean toward own text showed up again |
| Different reviewers cover each other's blind spots | Holds, with a limit | True across companies in June. Within Claude, a second look does as well |
| Top models are overconfident on hard questions | Not measurable here | The question bank hit its ceiling |
| GPT-5.5 favours its own work most | Not retested | Only Claude models were run this round |
| Everything else on this site | Not retested | Dated July 2026 and should be read that way |

## What I would do with this

- **Asking for a review? Open a fresh session first.** Inside one model family it
  is as good as switching models, and it is cheaper.
- **Reach for a different company's model when the stakes are high.** That is where
  the June result found real extra coverage, and nothing here contradicts it.
- **Keep the grader separate from the writer.** The lean is small but it has now
  shown up in two rounds and in outside research.
- **Retire a test when everyone passes it.** A benchmark at its ceiling tells you
  nothing, however good the numbers look.

## How it was run

- 71 model calls in all: 32 for code review, 20 for confidence, 16 for grading, and
  three early trial calls that were set aside unscored.
- Each call was a fresh session that read one prompt file and wrote one answer file.
  Afterwards every session log was checked to confirm which model answered and that
  it used no other tools.
- Prompts were built by script and answers scored by script. Nobody edited a prompt
  or judged an answer by hand.
- Two things went wrong and are on the record. The trial calls counted line numbers
  from the wrong file, so the layout was changed before the real run. One reply came
  back incomplete and was rerun once under a rule written before any grading.
- A different model then reviewed the analysis and recomputed one headline number
  per experiment from the raw files. All matched.
- One run per model and question, two for code review. Ranges are wide and small
  differences mean little.

The plans, raw answers, session checks and results are in the repositories, under
`round3/` in [decorrelation-study](https://github.com/KiwiMaddog2020/decorrelation-study)
and `experiments/claude-tiers-2026-11/` in
[trutina](https://github.com/KiwiMaddog2020/trutina).

<nav class="note-pager"><a href="/">Back to the notes</a></nav>
