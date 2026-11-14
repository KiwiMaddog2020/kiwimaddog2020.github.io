# Learn Center content schema (data-driven)

All content is data; the JS engine renders it. Files in `learn/data/`. JSON (or JS exporting the same
shape). This schema folds the plan audit: lessons carry not just text + quiz + flashcards but optional
INTERACTIVE EXERCISES (active learning), the audit's key upgrade against the "passive textbook trap".

## tracks.json

```
[
  { "id": "foundations", "title": "Foundations of ML", "order": 1,
    "level_range": "Beginner to Advanced", "blurb": "one tight sentence",
    "icon": "optional emoji or svg id", "lessons": ["f01_weights", "f02_..."] },
  ... (agents, vibe-coding, evaluating-ai, frontier)
]
```

## lessons/<track>.json  (array of lesson objects)

```
{
  "id": "f01_weights",
  "track": "foundations",
  "title": "What is a weight?",
  "level": "Beginner",            // Beginner | Intermediate | Advanced | Expert
  "minutes": 2,                    // est. read time
  "summary": "one-line hook",
  "body_html": "<p>...</p>",       // concise, dense, non-patronizing; em-dash-free
  "key_points": ["...", "..."],   // 2-4 bullets, the takeaways
  "links": [ {"title":"3Blue1Brown: Neural Networks","url":"https://...",
              "level":"Beginner","kind":"video","note":"visual intuition"} ],
  "flashcards": [ {"front":"...","back":"..."} ],
  "quiz": [ {"q":"...","choices":["a","b","c","d"],"answer":1,"explain":"why"} ],
  "exercise": null   // or one of the exercise objects below
}
```

## Exercise types (the active-learning upgrade)

`exercise.type` is one of:

- **spot_the_bug** (Vibe Coding): an AI-written snippet/diff with a planted fault; the learner picks
  the faulty line.
  ```
  { "type":"spot_the_bug", "prompt":"This AI-written function has one bug. Click the faulty line.",
    "lines":["def f(x):","    return x / len(x)","    # ..."], "bug_line":1,
    "explain":"Divides by len of a scalar; ..." }
  ```
- **agent_trace** (Agents): a Thought/Tool/Observation trajectory with one faulty step; the learner
  labels which step and what failure.
  ```
  { "type":"agent_trace",
    "steps":[ {"thought":"...","tool":"search(...)","observation":"..."}, ... ],
    "fault_step":2, "fault_type":"context truncation",
    "choices":["context truncation","wrong tool","hallucinated arg","none"],
    "answer":0, "explain":"..." }
  ```
- **predict_output** (Foundations/Frontier): show a tiny setup (e.g., temperature, a sampling step)
  and ask the learner to predict the behavior from choices.
  ```
  { "type":"predict_output", "prompt":"...", "choices":["..."], "answer":2, "explain":"..." }
  ```

The engine renders each type with click-to-answer + instant explanation. Lessons may have 0 or 1
exercise (quizzes + flashcards are always allowed).

## links.json  (the resources library, also aggregated from lesson links)

```
[ { "title":"Karpathy: Zero to Hero", "url":"https://...", "track":"foundations",
    "level":"Intermediate", "kind":"course", "note":"build it from scratch",
    "start_here": true } ]
```
`kind`: video | course | paper | docs | article | tool | interactive. `start_here:true` marks the
curated beginner on-ramp.

## prereqs.json  (concept dependency graph, for the landing map; audit improvement #4)

```
[ {"id":"foundations","needs":[]}, {"id":"agents","needs":["foundations"]},
  {"id":"vibe-coding","needs":["foundations"]}, {"id":"evaluating-ai","needs":["foundations"]},
  {"id":"frontier","needs":["foundations","evaluating-ai"]} ]
```

## Folded from the plan audit (Codex + Gemini convergent)

Active learning is the core, not a garnish. Add one more exercise type and per-lesson competency
metadata; the frontier track gets source discipline.

- **prompt_repair** (Vibe Coding / Agents): a weak prompt + the goal; the learner picks the best
  rewrite from choices (or orders fixes).
  ```
  { "type":"prompt_repair", "weak_prompt":"make it better",
    "goal":"a precise spec for a function", "choices":["...","...","..."], "answer":2,
    "explain":"names the contract, inputs, and the check" }
  ```
- Lesson competency metadata (Codex: paths not encyclopedia): each lesson MAY carry
  `"outcome":"what you can do after"`, `"prereqs":["lesson_id"]`, `"next":"lesson_id"`.
- Frontier source discipline (Codex): frontier/research lessons carry
  `"source":{"type":"paper|post|docs","date":"2026-..","confidence":"high|medium|low",
  "contested":false,"last_verified":"2026-06-18"}` so the track ages honestly.

## Build sequencing (scope realism)

Build the engine + ONE exemplar lesson to final (>=88) quality as the TEMPLATE
("Trust but verify AI-written code" or "Debug an agent failure"), goal-loop it, THEN replicate breadth
across all five tracks using that template. This reconciles "massive compilation" with a sound
one-night build: the template de-risks everything downstream.

## Invariants

- Every lesson, link, and quiz question carries a `level`.
- Prose is concise and em-dash-free; links must resolve (verified before commit).
- Answers (`answer`, `bug_line`, `fault_step`) are 0-indexed and authoritative for scoring.
