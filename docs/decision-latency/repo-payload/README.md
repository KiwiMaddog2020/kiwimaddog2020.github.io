# decision-latency

A research note testing one claim against git ledgers: *"The bottleneck in human-AI
collaboration is never build speed, it's decision latency."*

**Read it:** <https://kiwimaddog2020.github.io/decision-latency/>

## The finding

The latency is real and large. In a studio where coding agents build a game in parallel lanes
and one human ratifies the decisions, the median item still waiting at the end of the window had
been waiting 43.3 hours, and the oldest 116.6. It also cost close to nothing. The human verdict
queue sat byte-identical for 41.9 hours while the board beside it moved from ~24% to ~95%
complete; exactly 1 of 111 player reports (0.9%) was blocked on a human decision, established by
an audit lane with no knowledge of this question; and the fast and slow decision queues are
separated by a factor of about 406, split not by importance but by the medium the answer needs.
What governs throughput is not how long a decision waits, it is how much of the work graph waits
with it, and that fraction is a design choice.

## How to verify it

- **[DATA.md](DATA.md)** carries every number in the note with the exact command that produced
  it, plus a section listing the four errors and three mischaracterisations that an independent
  re-verification pass found in the first draft.
- The deploy ledger is **public**: <https://github.com/KiwiMaddog2020/whomp-play>. 397 of its
  398 commits read `play build <sha>`, so the deploy cadence rows reproduce for anyone.
- The game's **source repo is private**. Rows citing it are marked *(private)* in DATA.md and
  are verifiable by the repo owner only. They are labelled rather than dressed up as public
  evidence.

## Layout

```
docs/index.md     the note (Jekyll, GitHub Pages)
docs/img/         figures, PNG
DATA.md           the evidence appendix
```

## License

MIT. See [LICENSE](LICENSE).
