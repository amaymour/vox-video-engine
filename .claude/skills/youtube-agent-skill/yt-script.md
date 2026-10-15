# /yt-script — structural layouts, VO timing & SEO metadata

Turn the chosen hook into a full 6-beat Vox script with explicit screen
layouts, voiceover timing constraints and search metadata.

## Beat sheet (default 6 scenes)
| # | kind    | job                                   | VO target |
|---|---------|---------------------------------------|-----------|
| 1 | hook    | promise + tension                     | 6–9 s     |
| 2 | context | establish the world / the headline    | 8–12 s    |
| 3 | problem | the trap the viewer is in             | 8–12 s    |
| 4 | insight | the contrarian move                   | 8–12 s    |
| 5 | data    | proof — numbers, trend, chart         | 8–12 s    |
| 6 | cta     | one action + subscribe                | 4–6 s     |

## Voiceover timing constraints
- **Rate:** ~150 wpm, i.e. **≈2.5 words/second**. Budget words = seconds × 2.5.
- Never let a scene's VO run past its allocation by more than 15%.
- Pause ~0.35 s between beats (the engine inserts these automatically).
- Total target: **55–75 seconds**.

## Screen layout rules (Vox Engine layers)
- **Layer A — locked background:** never cuts. One continuous shot.
- **Layer B — halftone midground actors:** 1–2 characters per scene. Place them
  with `x` ∈ [0.15, 0.85] and spread them apart (keep ≥ 0.3 apart in `x`) so
  cutouts never overlap. `scale` ∈ [0.6, 1.4].
- **Layer C — foreground assets:** 1–2 assets per scene. Charts/stats enter
  *before* the characters.
- Keep the top-left third clear for the headline block (leave `y` ≤ 0.25 empty
  of characters).

## Per-scene JSON fields
`kind, kicker, headline (≤6 words, UPPER), subline, narration, characters[]
{src,x,y,scale,flip}, assets[] {kind:stat|bars|line|flag,label,value|values,x,y}, sfx`

## SEO metadata
- **Title:** ≤ 60 chars, includes the primary keyword, no clickbait.
- **Description:** first 125 chars carry the promise; then 3 bullet takeaways.
- **Tags:** 8–12, mixing broad + long-tail.
- **Chapters:** one per beat, timestamps derived from the timing table.

## Output (strict JSON)
```json
{
  "title": "...",
  "seo": { "title": "...", "description": "...", "tags": ["..."] },
  "scenes": [
    { "kind": "hook", "kicker": "THE BIG PICTURE", "headline": "...",
      "subline": "...", "narration": "...",
      "characters": [{"src":"characters/host.svg","x":0.22,"y":0.62,"scale":1.0}],
      "assets": [{"kind":"stat","label":"signal","value":0.72,"x":0.73,"y":0.30}],
      "sfx": "whoosh" }
  ]
}
```
