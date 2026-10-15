# /yt-viral — isolate high-leverage outlier hooks

Use this skill to mine a trend list for the *one* angle worth making a video
about, and to express it as 3–5 hook variants.

## Inputs
- `live_trends.csv` (Google News RSS rows: title, source, published, link).

## Procedure
1. **Collapse duplicates.** Many rows are the same story reworded. Group them.
2. **Score each cluster** on four axes (0–5 each):
   - **Curiosity gap** — does it open a loop the viewer must close?
   - **Contrarian** — does it contradict the common belief?
   - **Concreteness** — is there a number, name or date to anchor it?
   - **Stakes** — does it change what the viewer should *do*?
   `outlier = curiosity + contrarian + concreteness + stakes`
3. **Pick the top cluster.** Discard everything below the 70th percentile.
4. **Write the promise** in one sentence: "By the end you'll know ___."
5. **Write 5 hooks** using these proven patterns:
   - *Mistake*: "Almost everyone gets {X} wrong."
   - *Reveal*: "The real reason {X} is happening isn't what you think."
   - *Stakes*: "{X} is quietly costing you {Y}."
   - *Contrast*: "{A} is loud. {B} is what actually works."
   - *Number*: "{N}% of people will miss this entirely."

## Output (strict JSON)
```json
{
  "cluster": "one-line description of the chosen story",
  "score": { "curiosity": 4, "contrarian": 5, "concreteness": 3, "stakes": 4 },
  "promise": "By the end you'll know ___",
  "hooks": ["...", "...", "...", "...", "..."]
}
```

## Rules
- Prefer the *smallest* true claim over the biggest vague one.
- If two clusters tie, choose the one with a concrete number.
- Never fabricate a statistic. If you have no number, don't invent one.
