#!/usr/bin/env python3
"""Generate data/labs.json for the /labs section from the interactive widgets already
wired into lessons. Each lab = a widget config (pulled from the first lesson that uses that
type) + lab-flavored metadata. Keeps labs in sync with lessons; re-run after adding a lab.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LESSONS = sorted((ROOT / "data" / "lessons").glob("*.json"))

CATEGORIES = [
    {"id": "foundations", "title": "Foundations"},
    {"id": "training", "title": "Training & evaluation"},
    {"id": "agents", "title": "Agents & safety"},
]

# exercise.type -> lab card metadata (order here = order in each category)
META = {
    "tokenizer_lab": ("foundations", "Type", "Tokenizer playground",
        "Watch text break into tokens, and see why token count is not word count.",
        "<p>Models read tokens, not words. Type anything below and watch it split. Try a rare long word, ALL CAPS, code, or heavy punctuation, and switch granularity to feel how token count drifts from word count.</p>"),
    "attention_lab": ("foundations", "Click", "Attention visualizer",
        "Pick a word and see how strongly it attends to the others.",
        "<p>Self-attention lets each word pull information from the rest of the sentence. Click any word to make it the query and watch where its attention goes.</p>"),
    "embedding_lab": ("foundations", "Click", "Embedding explorer",
        "A map of words placed by meaning; click one for its nearest neighbors.",
        "<p>Embeddings turn words into vectors so that similar meanings sit close together. Click a word to see its nearest neighbors, and notice the king/queen analogy.</p>"),
    "sampling_lab": ("foundations", "Slide", "Temperature and sampling",
        "Slide the temperature and watch the next-token probabilities sharpen or flatten.",
        "<p>A model outputs a probability for every possible next token. Temperature reshapes those probabilities before one is sampled. Slide it and watch the distribution move.</p>"),
    "context_budget": ("foundations", "Allocate", "Context-window budget",
        "Fill a fixed token budget and see what gets truncated first.",
        "<p>The context window is finite. When the pieces you want to include exceed it, something is dropped. Allocate against the budget and see what survives.</p>"),
    "metric_lab": ("training", "Slide", "Confusion-matrix calculator",
        "Move the counts and watch precision, recall, and discrimination move.",
        "<p>Most classification metrics come from four counts. Change them and watch recall, false-alarm rate, precision, and discrimination respond.</p>"),
    "roc_lab": ("training", "Slide", "ROC threshold slider",
        "Slide the decision threshold and trace the ROC curve.",
        "<p>A classifier outputs a score; a threshold turns it into a decision. Slide the threshold and watch the true-positive and false-positive rates trace out the ROC curve.</p>"),
    "bootstrap_lab": ("training", "Resample", "Bootstrap confidence intervals",
        "Resample to build a 95% interval and see how sample size changes it.",
        "<p>The bootstrap estimates uncertainty by resampling the data you already have. Resample and watch a 95% interval form, then see it narrow as n grows.</p>"),
    "rag_sandbox": ("agents", "Tune", "RAG retrieval sandbox",
        "Change chunk size and top-k and see what a retriever pulls.",
        "<p>Retrieval-augmented generation finds relevant chunks and feeds them to the model. Tune the chunk size and how many chunks are pulled, and see what the retriever returns.</p>"),
    "injection_lab": ("agents", "Toggle", "Prompt-injection sandbox",
        "Toggle the guardrail and watch an agent block or obey a hidden instruction.",
        "<p>Prompt injection hides instructions inside content an agent reads. Pick an injection, toggle the instruction-source-boundary guardrail, and run the agent.</p>"),
}
ORDER = list(META.keys())


def main():
    seen = {}
    for path in LESSONS:
        for lesson in json.loads(path.read_text()):
            ex = lesson.get("exercise") or {}
            t = ex.get("type")
            if t in META and t not in seen:
                seen[t] = (lesson, ex)
    labs = []
    for t in ORDER:
        if t not in seen:
            continue
        lesson, ex = seen[t]
        cat, kind, title, blurb, concept = META[t]
        labs.append({
            "id": t.replace("_lab", "").replace("_sandbox", "").replace("_budget", "-budget"),
            "title": title,
            "kind": kind,
            "category": cat,
            "blurb": blurb,
            "concept_html": concept,
            "exercise": ex,
            "source_lesson": lesson["id"],
            "source_title": lesson.get("title", lesson["id"]),
        })
    # Standalone labs (no source lesson): full config defined here.
    STANDALONE = [
        {
            "id": "gradient-descent", "title": "Gradient descent", "kind": "Run", "category": "training",
            "blurb": "Set a learning rate and watch the step roll downhill, or fly off when it is too big.",
            "concept_html": "<p>Training a model means minimizing a loss. Gradient descent takes steps downhill in proportion to the slope, scaled by the learning rate. Too small and it crawls; too big and it overshoots and diverges. Set the rate and step through it.</p>",
            "exercise": {"type": "gradient_descent_lab", "a": 0.18, "start": -4.2, "lr": 0.30,
                         "prompt": "Set the learning rate, then Step or Run. Try 0.2, then 1.0, then 2.5, and watch what changes."},
        },
        {
            "id": "neural-net", "title": "Neural network forward pass", "kind": "Slide", "category": "foundations",
            "blurb": "Slide two inputs through a tiny network and watch every unit light up.",
            "concept_html": "<p>A neural network is just weighted sums passed through simple nonlinearities, repeated. This one has two inputs, three hidden units (each a tanh of a weighted sum), and one sigmoid output. The weights are frozen, so you can slide the inputs and watch the arithmetic flow through.</p>",
            "exercise": {"type": "neural_net_lab", "x1": 0.6, "x2": -0.4,
                         "prompt": "Slide the two inputs. Each hidden unit and the output update live; blue edges are positive weights, red negative."},
        },
    ]
    labs = labs + STANDALONE
    out = {"categories": CATEGORIES, "labs": labs}
    (ROOT / "data" / "labs.json").write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
    print(f"wrote data/labs.json: {len(labs)} labs across {len(CATEGORIES)} categories")
    for lab in labs:
        print(f"  {lab['category']:12} {lab['id']:14} <- {lab.get('source_lesson', 'standalone')}")


if __name__ == "__main__":
    main()
