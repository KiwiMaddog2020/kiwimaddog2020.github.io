# Naming: repo description, config, frontmatter

The GitHub **repo description** is what `bin/build_index.py` turns into the note's list title on
the hub and its feed entry title. It is set on the repo, not in a file, and must be set by hand
(`gh repo edit KiwiMaddog2020/decision-latency --description "..."`). The repo also needs the
topic `research-note` and its homepage set to the Pages URL, or it never appears in the listing.

## Three candidate repo descriptions

1. **Is decision latency really the bottleneck in human-AI collaboration?**
   Question form, matches "Do AI code reviewers have complementary blind spots?". Names the
   claim under test and promises a verdict rather than a war story.

2. **A human decision queue that sat frozen for 41.9 hours and blocked nothing**
   Leads with the strongest single artifact. Concrete and specific, but it gives the answer away
   and reads as a boast about the setup rather than a question about the world.

3. **Measuring what a pending human decision actually costs**
   Gerund form, matches "Rating your own work without lying to yourself". Broadest of the three,
   which is also its weakness: it does not say what was measured or where.

**Pick: 1.** The note is a claim-check, the claim came from a model, and the question form is
the honest advertisement for a piece whose answer is "half right, and the wrong half is the
useful one".

## Values used

### `docs/_config.yml`

```yaml
title: "My decision queue was frozen for 41.9 hours. The board went from 24% to 95%."
description: A model told me that decision latency, not build speed, is the bottleneck in human-AI work. I checked it against my own git ledgers.
```

### `docs/index.md` frontmatter

```yaml
title: "My decision queue was frozen for 41.9 hours. The board went from 24% to 95%."
description: "A model told me that decision latency, not build speed, is the bottleneck in human-AI work. I checked it against my own git ledgers: the latency is real, up to 116.6 hours, and it cost almost nothing."
```

The frontmatter `description` is the longer of the two because it drives the OpenGraph and
Twitter cards, where there is room for the result. The `_config.yml` `description` is only the
site-wide fallback, so it stays short. The H1 matches the frontmatter title exactly, which keeps
`jekyll-titles-from-headings` and the JSON-LD headline in agreement.

### Repo metadata to set once, by hand

```
gh repo edit KiwiMaddog2020/decision-latency \
  --description "Is decision latency really the bottleneck in human-AI collaboration?" \
  --homepage "https://kiwimaddog2020.github.io/decision-latency/" \
  --add-topic research-note
```
