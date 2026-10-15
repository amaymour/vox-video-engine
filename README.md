# 🎬 Vox Engine — Cloud Motion-Graphics Video Engine

A **100% free, zero-key** video factory. A static web dashboard fires a GitHub
`repository_dispatch`; headless **GitHub Actions Ubuntu runners** do everything
else — web-trend scraping, script writing, text-to-speech, multi-layer Remotion
composting and MP4 encoding — and hand back a downloadable video.

> No proprietary APIs. No servers to run. No local GPU.

---

## ✨ What it renders

A Vox-style explainer built from **three locked motion layers**, driven by
`spring()` + `interpolate()`:

| Layer | What it is |
| --- | --- |
| **Background** | One continuous "map canvas" (dark field, dot grid, abstract continents, contour arcs, vignette) with a slow Ken-Burns drift — a single cinematic shot, never cutting. |
| **Midground characters** | Subject cutouts converted to stylised **black-and-white halftone**, each with a **bold red offset-outline vector mask** behind it. Individually positioned via `scale` / `x` / `y` props. |
| **Foreground assets** | Data trends and structures — animated **stat cards**, **bar charts**, **line charts** and **flags** — that spring onto the frame *first*. |

Structural assets enter first, then the midground actors stagger in. `edge-tts`
narration is sized into the clip automatically, and ambient **sound effects are
sequenced onto the cut points** with Remotion `<Audio>` layers.

---

## 🏗 Architecture

```
index.html                 dual-config dashboard (token + OpenCode target)
fetch_trends.py            Google News RSS -> live_trends.csv   (email-key free)
scripts/generate_script.py OpenCode/OmniRoute agent -> data/scene.json + voiceover
scripts/make_sfx.py        stdlib-synthesised SFX (no ffmpeg needed)
src/                       Remotion Vox compositor (3 layers + animations)
.claude/skills/            /yt-viral + /yt-script agent skill prompts
.github/workflows/         dispatch-driven render + GitHub Pages deploy
```

### Data flow

```
Dashboard  ──repository_dispatch {niche, opencode_target}──▶  Actions runner
   ▲                                                            │
   │                                              fetch_trends.py (Google News RSS)
   │                                                            ▼
   │                                              generate_script.py (agent / template)
   │                                                            │  edge-tts
   │                                                            ▼
   │        release asset  ◀── gh release create ◀── remotion render (video.mp4)
   └──────────────  poll run + reveal download  ────────────────┘
```

---

## 🚀 Use the dashboard

1. Open **https://amaymour.github.io/vox-video-engine/**
2. Paste a **GitHub Classic token** with `repo` scope (kept in memory only).
3. Optionally point **OpenCode Connection Terminal** at a reachable OmniRoute
   endpoint (defaults to `http://localhost:20128/v1`).
4. Pick a **niche** (or type a custom one) and hit
   **🚀 Initialize Cloud Video Engine**.
5. Watch the `#console-logs` terminal; when the run succeeds the **download
   zone** opens with a direct `video.mp4` link.

### Or from the CLI

```bash
gh workflow run generate-video.yml \
  -f niche="Keyboard Modding" \
  -f opencode_target="http://localhost:20128/v1"
```

---

## 🧠 The agent

`scripts/generate_script.py` asks the OpenCode / OmniRoute gateway for a
strict-JSON scene plan, routing through the free model strings
`auto/coding` → `oc/deepseek-v4-flash-free` (first success wins). The model
returns **data** (copy, character placement, chart values); the React
composition is hand-written and deterministic, so a malformed reply can never
break a render.

GitHub-hosted runners can't reach `localhost`, so when the gateway is
unreachable the script falls back to a **deterministic template plan** — the
pipeline stays fully functional and free with no keys. Expose OmniRoute through
a tunnel and set `OPENCODE_TARGET` to use the live model.

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `NICHE` | `Tech Tools` | Topic to research + write about |
| `OPENCODE_TARGET` | `http://localhost:20128/v1` | Agent endpoint |
| `OPENCODE_MODELS` | `auto/coding,oc/deepseek-v4-flash-free` | Fallback chain |
| `OPENCODE_KEY` | `sk_omniroute` | Bearer token |

---

## 🖥 Local development

```bash
npm install
python scripts/make_sfx.py          # generate public/sfx/*.wav
npm run dev                          # Remotion studio preview
```

Rendering needs a headless browser; Remotion downloads its own pinned
**Chrome Headless Shell**, so CI (`ubuntu-latest`) is the production render
target.

---

## 📄 License

MIT — fully open-source, zero proprietary dependencies.
