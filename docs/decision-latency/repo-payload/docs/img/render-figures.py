#!/usr/bin/env python3
"""
Render the two figures for the "decision-latency" research note.

House theme: fixed ink-dark, no light variant (kiwimaddog2020.github.io /
research-notes.css). All data below is a literal transcription of numbers
verified against /scratchpad/lab/MINING_REPORT.md and, where noted, re-derived
directly from the repos on disk. Every dataset is preceded by the exact
command that produced it -- see FIGURES.md for the full trace table and two
places where independent recomputation did not match the mining report's
own summary statistic (both are used as reported here; see FIGURES.md).

Run: python3 render-figures.py
Requires: matplotlib (any recent 3.x), no other dependencies.
"""

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from matplotlib import font_manager

# ---------------------------------------------------------------------------
# House theme (fixed dark ink palette -- kiwimaddog2020.github.io research-notes.css)
# ---------------------------------------------------------------------------
BG = "#14141a"
BG_ELEVATED = "#1b1b22"
BG_CARD = "#21212a"
ACCENT = "#2a95ea"
ACCENT_BRIGHT = "#5aabf6"
ACCENT_SOFT = "#94c9f5"
TEXT = "#e8e6e1"
TEXT_STRONG = "#f2f0eb"
TEXT_2 = "#9a9690"       # secondary text
MUTED = "#96918a"
HAIRLINE = "#2c2c35"      # dark-neutral hairline, one step off BG

SANS = "DejaVu Sans"
plt.rcParams["font.family"] = SANS
plt.rcParams["text.color"] = TEXT
plt.rcParams["axes.edgecolor"] = HAIRLINE

DPI = 200  # render at 2x: figsize below x DPI gives ~2400px wide


def style_axes_dark(fig, ax):
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)
    for spine in ax.spines.values():
        spine.set_visible(False)


# ===========================================================================
# FIGURE 1 -- docs/img/two-queues.png
# "Two decision queues, one operator"
# ===========================================================================

# --- Row 1: rapid-fire ruling gaps -----------------------------------------
# n = 34 inter-ruling gaps inside 8 rapid-fire bursts (consecutive recorded
# rulings <= 30 min apart = one burst). Values in minutes, transcribed from
# MINING_REPORT.md section 2.5, and independently re-derived from the raw
# 82-commit ruling ledger:
#   python3 - <<'PY'
#   lines = open('lab/rulings.txt').read().strip().split('\n')
#   ts = sorted(int(l.split('|')[0]) for l in lines)
#   bursts, cur = [], [ts[0]]
#   for t in ts[1:]:
#       (cur.append(t) if t - cur[-1] <= 1800 else (bursts.append(cur), cur := [t]))
#   bursts.append(cur)
#   gaps = [round((b[i]-b[i-1])/60, 1) for b in bursts if len(b) >= 3 for i in range(1, len(b))]
#   PY
# (source ledger: git -C /workspace/whomp log --all --pretty='%ct|%h|%s' | grep -iE
#  '\|.*(kevin|ratifi|director (ruling|pick|verdict|call|split)|by director|per director)')
# This re-derivation reproduces the exact same 34 gap values as the report's
# per-burst table -- confirmed match. NOTE: the report's own summary states
# "median 7.1 min", which is the 18th of the 34 sorted values rather than the
# average of the two middle ones. The true median is 6.4 min. The note was
# corrected to 6.4 and the tick below is drawn at 6.4 to match it.
row1_fast_gaps = [
    1.7, 24.7, 18.7, 4.0, 10.6,
    10.6, 18.8, 4.6, 16.5,
    13.9, 3.7, 11.4,
    2.7, 5.7, 18.1, 1.4, 2.7, 21.9, 11.0, 17.1, 2.7,
    7.1, 4.6, 4.1,
    3.3, 5.1, 4.0, 2.6,
    13.1, 2.6,
    26.3, 8.8, 2.8, 10.6,
]
row1_median_label = 6.4  # true median of the 34 values above; MINING_REPORT.md sec 2.5
                         # states 7.1, corrected here and in the note (see FIGURES.md)

# --- Row 2: present-to-ratify pairs (n=4) -----------------------------------
# git -C /workspace/whomp show -s --pretty='%h %ad %s' --date=format:'%m-%d %H:%M:%S' \
#   9871ca90 7d4cff84 5ebf68c1 2e20b31d fbab99ef e32a01e2 1b8d1483 e38b847b
# (MINING_REPORT.md sec 2.3a -- "Four clean present->ratify pairs")
row2_present_ratify = [
    5.3,      # R-concept redraft 9871ca90 08:20:13 -> 7d4cff84 08:25:31 (07-27)
    41.9333,  # Hub planet-light elevation 5ebf68c1 13:53:41 -> 2e20b31d 14:35:37 (07-27)
    61.2,     # Void district map v1 fbab99ef 17:04:53 -> e32a01e2 18:06:05 (07-26)
    455.7333, # Boss overhaul spec 1b8d1483 07-18 19:06:14 -> e38b847b 07-19 02:41:58
]
row2_median_label = sorted(row2_present_ratify)[1:3]
row2_median_label = sum(row2_median_label) / 2  # self-derived (not stated in the report
                                                  # as a summary stat for this n=4 subset)

# --- Row 3: confirmed-decided pending items (n=6) ---------------------------
# git -C /workspace/whomp show -s --pretty='%h %ad %s' --date=format:'%m-%d %H:%M:%S' \
#   fbab99ef e32a01e2 5ebf68c1 2e20b31d a9eb3369 86eb219e ac247399 7d4cff84 \
#   1b8d1483 e38b847b 35643ceb 42ac49f3
# (MINING_REPORT.md sec 2.3a table -- 6 distinct confirmed-decided items,
# excluding the redraft-only sub-measurement counted separately in row 2)
row3_confirmed_decided = [
    41.9333,  # Hub planet-light elevation -- 0.7 h
    61.2,     # Void district map v1 -- 1.0 h
    75.6667,  # 33 weapon-anim cards -- 1.3 h
    394.9667, # R/F ability concepts -- 6.6 h
    455.7333, # Boss overhaul spec -- 7.6 h
    808.0333, # Mystery statues (reversal) -- 13.5 h
]
row3_median_label = 3.9 * 60  # precise recompute of the six ages above; MINING_REPORT.md
                              # sec 2.3a states 4.0 h (it rounded before averaging),
                              # corrected here and in the note -- see FIGURES.md.

# --- Row 4: still pending at HEAD (n=13), right-censored --------------------
# Ages at whomp HEAD (4dde7132, 2026-07-28 19:34:45 PDT), i.e. time-since-first-
# seen with NO verdict text anywhere in history. Source: MINING_REPORT.md
# sec 2.3b table, itself built from:
#   git -C /workspace/whomp log --all -S"<phrase>" --pretty='%h %ad' \
#     --date=format:'%m-%d %H:%M:%S' | tail -1     (per item, first-seen commit)
#   git -C /workspace/whomp show -s --pretty=%ad --date=... HEAD   (anchor)
# Values in hours, converted to minutes for the shared axis.
row4_pending_hours = [
    116.6,  # Maps standalone bigger (Kevin-gated) -- first seen 07-23 22:56:06
    76.6,   # Borealisk pick -- 07-25 14:57:12
    51.0,   # report-36 re-snap -- 07-26 16:32:29
    51.0,   # cousin PvP test -- 07-26 16:32:29
    51.0,   # desert-snow-patches call -- 07-26 16:32:29
    43.3,   # audit's 18 rulings -- 07-27 00:15:50
    43.3,   # grotto jump-vs-ramp -- 07-27 00:15:50
    43.3,   # listening pass (B10 + H5) -- 07-27 00:15:50
    41.9,   # mapping plans (minimap) -- 07-27 01:40:00
    41.9,   # payoff name + magnetism -- 07-27 01:40:00
    32.8,   # accounts tap -- 07-27 10:45:34
    17.8,   # feel sessions -- 07-28 01:45:06
    17.8,   # hub taste lap -- 07-28 01:45:06
]
row4_pending = [h * 60 for h in row4_pending_hours]
row4_median_label = 43.3 * 60  # MINING_REPORT.md sec 2.3b: "median 43.3 h" -- confirmed
                                 # exactly by recomputation (7th of 13 sorted values).


def jitter(values, amp=0.16, seed=0):
    """Deterministic small vertical jitter so duplicate/near-duplicate x values
    don't render as a single dot. Fixed seed -> reproducible output."""
    import random
    rnd = random.Random(seed)
    # spread exact duplicates symmetrically; add small pseudo-random jitter otherwise
    out = []
    seen = {}
    for v in values:
        seen.setdefault(v, []).append(len(out))
        out.append(0.0)
    for v, idxs in seen.items():
        n = len(idxs)
        if n == 1:
            out[idxs[0]] = (rnd.random() * 2 - 1) * amp
        else:
            spread = amp * 1.3
            for k, i in enumerate(idxs):
                out[i] = (-spread / 2) + spread * k / (n - 1)
    return out


def fig1_two_queues(path):
    rows = [
        ("Rapid-fire ruling gaps", row1_fast_gaps, "n = 34", 4, row1_median_label, "filled"),
        ("Present → ratify pairs", row2_present_ratify, "n = 4", 3, row2_median_label, "filled"),
        ("Confirmed-decided items", row3_confirmed_decided, "n = 6", 2, row3_median_label, "filled"),
        ("Still pending at HEAD", row4_pending, "n = 13", 1, row4_median_label, "open"),
    ]

    fig = plt.figure(figsize=(12, 7.6), dpi=DPI)
    style_axes_dark(fig, plt.gca())
    fig.clf()

    # left label column + right log-scale plot column, sharing y
    ax_label = fig.add_axes([0.03, 0.225, 0.245, 0.615])
    ax = fig.add_axes([0.30, 0.225, 0.665, 0.615])
    for a in (ax_label, ax):
        a.set_facecolor(BG)
        for s in a.spines.values():
            s.set_visible(False)
        a.set_ylim(0.35, 4.75)
        a.set_yticks([])
    ax_label.set_xlim(0, 1)
    ax_label.set_xticks([])

    ax.set_xscale("log")
    ax.set_xlim(0.9, 9500)

    # hairline row separators + row bands
    for _, _, _, y, _, _ in rows:
        ax.axhline(y, color=HAIRLINE, lw=1, zorder=0)

    for name, values, n_label, y, med, kind in rows:
        amp = 0.24 if len(values) > 10 else 0.14
        offs = jitter(values, amp=amp, seed=int(y))
        ys = [y + o for o in offs]
        if kind == "filled":
            ax.scatter(values, ys, s=30, facecolor=ACCENT, edgecolor=BG,
                       linewidth=0.8, alpha=0.8, zorder=3)
        else:
            ax.scatter(values, ys, s=46, facecolor="none", edgecolor=ACCENT_SOFT,
                       linewidth=1.4, alpha=0.95, zorder=3)
            # small rightward arrow per open marker -> "still open, age keeps growing"
            for v, yy in zip(values, ys):
                ax.annotate("", xy=(v * 1.22, yy), xytext=(v * 1.02, yy),
                            arrowprops=dict(arrowstyle="-|>", color=ACCENT_SOFT,
                                             lw=1.1, alpha=0.75, mutation_scale=9),
                            zorder=3)

        # median tick
        if med is not None:
            ax.plot([med, med], [y - 0.30, y + 0.30], color=TEXT_STRONG, lw=2, zorder=4)
            if med >= 60:
                med_str = f"median {med/60:.1f} h"
            else:
                med_str = f"median {med:.1f} min"
            ax.annotate(med_str, xy=(med, y - 0.30), xytext=(0, -13),
                        textcoords="offset points", ha="center", va="top",
                        fontsize=10.5, color=TEXT_STRONG, fontweight="bold")

        # row label (left column)
        ax_label.text(0.0, y + 0.14, name, fontsize=13.2, color=TEXT_STRONG,
                       ha="left", va="center", fontweight="bold")
        ax_label.text(0.0, y - 0.20, n_label, fontsize=10.5, color=TEXT_2,
                       ha="left", va="center")

    # x-axis: human ticks from 1 min to ~120 h
    ticks = [1, 10, 60, 600, 6000]
    labels = ["1 min", "10 min", "1 h", "10 h", "100 h"]
    ax.set_xticks(ticks)
    ax.set_xticklabels(labels, fontsize=11, color=TEXT_2)
    ax.tick_params(axis="x", length=0)
    ax.xaxis.set_minor_locator(mticker.NullLocator())
    for t in ticks:
        ax.axvline(t, color=HAIRLINE, lw=1, zorder=0)

    # censoring annotation, in the reserved bottom margin (absolute figure coords,
    # not axes-fraction, so it can never land off-canvas regardless of axes sizing)
    fig.text(
        0.03, 0.115,
        "Open dots (bottom row) are ages measured at HEAD, 2026-07-28 19:34:45 PDT —\n"
        "not completed latencies. They are still counting upward (right-censored);\n"
        "the arrow marks the open end.",
        fontsize=10.3, color=MUTED, style="italic", ha="left", va="top", linespacing=1.6,
    )

    # title / subtitle
    fig.text(0.03, 0.955, "Two decision queues, one operator",
              fontsize=21, color=TEXT_STRONG, fontweight="bold", ha="left")
    fig.text(0.03, 0.91,
              "whomp repo, 2026-07-11 to 2026-07-28 (PDT) · commit timestamps, git log --all",
              fontsize=12, color=TEXT_2, ha="left")

    fig.savefig(path, facecolor=BG)
    plt.close(fig)


# ===========================================================================
# FIGURE 2 -- docs/img/deploys-per-day.png
# Deploys per active day, whole project, public whomp-play repo
# ===========================================================================

# Re-derived directly on disk (report's own numbers reproduced exactly):
#   export TZ=America/Los_Angeles
#   git -C /workspace/whomp-play log --pretty='%ad' --date=format:'%Y-%m-%d' \
#     | sort | uniq -c
# 398 total commits over 18 active days, no gap days, 2026-07-11 -> 2026-07-28.
deploy_dates = [
    "07-11", "07-12", "07-13", "07-14", "07-15", "07-16", "07-17", "07-18",
    "07-19", "07-20", "07-21", "07-22", "07-23", "07-24", "07-25", "07-26",
    "07-27", "07-28",
]
deploy_counts = [9, 5, 8, 46, 49, 11, 39, 26, 18, 42, 15, 19, 6, 21, 37, 22, 15, 10]
assert len(deploy_dates) == len(deploy_counts) == 18
assert sum(deploy_counts) == 398

HIGHLIGHT_DATE = "07-28"
RECORD_DATE = "07-15"
MEAN = sum(deploy_counts) / len(deploy_counts)     # 22.1
MEDIAN = sorted(deploy_counts)[len(deploy_counts) // 2]  # with 18 values, report's stated 18.5
sorted_counts = sorted(deploy_counts)
MEDIAN = (sorted_counts[8] + sorted_counts[9]) / 2  # 18.5, matches MINING_REPORT.md sec 3


def fig2_deploys_per_day(path):
    fig, ax = plt.subplots(figsize=(12, 6.6), dpi=DPI)
    style_axes_dark(fig, ax)

    x = range(len(deploy_dates))
    colors = [ACCENT if d == HIGHLIGHT_DATE else MUTED for d in deploy_dates]
    alphas = [1.0 if d == HIGHLIGHT_DATE else 0.55 for d in deploy_dates]
    bars = ax.bar(x, deploy_counts, width=0.62, color=colors, zorder=3)
    for b, a in zip(bars, alphas):
        b.set_alpha(a)

    # median reference hairline (labeled on the left, over the short early-day bars
    # where there is clear air above the line)
    ax.axhline(MEDIAN, color=HAIRLINE, lw=1.2, zorder=1)
    ax.annotate(f"median {MEDIAN:.1f}/day", xy=(0, MEDIAN),
                xytext=(0, 6), textcoords="offset points",
                fontsize=10.5, color=TEXT_2, ha="left", va="bottom")

    # direct labels: record day and highlighted day
    for i, (d, c) in enumerate(zip(deploy_dates, deploy_counts)):
        if d == RECORD_DATE:
            ax.annotate(f"{c}", xy=(i, c), xytext=(0, 6), textcoords="offset points",
                        ha="center", fontsize=13, color=TEXT_STRONG, fontweight="bold")
            ax.annotate(RECORD_DATE, xy=(i, 0), xytext=(0, -20), textcoords="offset points",
                        ha="center", fontsize=10.5, color=TEXT_2)
        elif d == HIGHLIGHT_DATE:
            ax.annotate(f"{c}", xy=(i, c), xytext=(0, 6), textcoords="offset points",
                        ha="center", fontsize=13, color=ACCENT_BRIGHT, fontweight="bold")
            ax.annotate(HIGHLIGHT_DATE, xy=(i, 0), xytext=(0, -20), textcoords="offset points",
                        ha="center", fontsize=10.5, color=ACCENT_BRIGHT, fontweight="bold")
        else:
            ax.annotate(d[-2:], xy=(i, 0), xytext=(0, -20), textcoords="offset points",
                        ha="center", fontsize=9, color=MUTED)

    ax.set_xlim(-0.7, len(x) - 0.3)
    ax.set_ylim(0, 55)
    ax.set_xticks([])
    yticks = [0, 10, 20, 30, 40, 50]
    ax.set_yticks(yticks)
    ax.set_yticklabels([str(t) for t in yticks], fontsize=10.5, color=TEXT_2)
    ax.tick_params(axis="y", length=0)
    for t in yticks:
        ax.axhline(t, color=HAIRLINE, lw=1, zorder=0)
    ax.set_axisbelow(True)

    fig.text(0.045, 0.945, "Ten deploys, well inside the project's range",
              fontsize=21, color=TEXT_STRONG, fontweight="bold", ha="left")
    fig.text(0.045, 0.895,
              "whomp-play (public), 2026-07-11 to 2026-07-28 · one commit per deploy, "
              "git log --pretty=%ad",
              fontsize=12, color=TEXT_2, ha="left")
    fig.text(0.045, 0.045,
              "398 deploys / 18 active days · mean 22.1, median 18.5 · the studied "
              "day's 10 is the 5th-lowest of the eighteen.",
              fontsize=10.5, color=MUTED, style="italic", ha="left")

    fig.subplots_adjust(left=0.06, right=0.985, top=0.84, bottom=0.14)
    fig.savefig(path, facecolor=BG)
    plt.close(fig)


if __name__ == "__main__":
    fig1_two_queues("two-queues.png")
    fig2_deploys_per_day("deploys-per-day.png")
    print("wrote two-queues.png and deploys-per-day.png")
