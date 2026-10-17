#!/usr/bin/env python3
"""generate_script.py -- AI script + Vox scene design + voiceover.

Pipeline:

  1. Read ``live_trends.csv`` (produced by fetch_trends.py).
  2. Ask the OpenCode / OmniRoute agent at ``OPENCODE_TARGET`` (default
     ``http://localhost:20128/v1``) for a strict-JSON Vox scene plan, routing
     through the free-tier model strings ``auto/coding`` and
     ``oc/deepseek-v4-flash-free`` (first success wins).
  3. Fall back to a deterministic template plan when the gateway is
     unreachable -- expected on GitHub-hosted runners, keeps the pipeline
     100% free and functional with no keys.
  4. Render the narration to ``public/voiceover.mp3`` with edge-tts.
  5. Write ``data/scene.json`` for the Remotion composition.

The agent returns *data* (scenes, copy, character placement, charts). The
React composition is hand-written and deterministic, so a malformed model
reply can never break the render.
"""

import asyncio
import csv
import json
import os
import re
import sys
import urllib.request

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(REPO_ROOT, "data")
PUBLIC_DIR = os.path.join(REPO_ROOT, "public")
SCENE_JSON = os.path.join(DATA_DIR, "scene.json")
SCRIPT_JSON = os.path.join(DATA_DIR, "script.json")
TRENDS_CSV = os.path.join(REPO_ROOT, "live_trends.csv")
VOICEOVER_MP3 = os.path.join(PUBLIC_DIR, "voiceover.mp3")

NICHE = os.environ.get("NICHE", "Tech Tools").strip()
TARGET = os.environ.get("OPENCODE_TARGET", "http://localhost:20128/v1").strip()
MODELS = [
    m.strip()
    for m in os.environ.get(
        "OPENCODE_MODELS", "auto/coding,oc/deepseek-v4-flash-free"
    ).split(",")
    if m.strip()
]

ALLOWED_CHARS = ["host", "presenter", "analyst", "explorer"]
ASSET_KINDS = {"stat", "bars", "line", "flag"}


# --------------------------------------------------------------------------- #
# Trends
# --------------------------------------------------------------------------- #
def read_trends() -> list[dict]:
    if not os.path.exists(TRENDS_CSV):
        return []
    with open(TRENDS_CSV, newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def trends_to_text(rows: list[dict]) -> str:
    lines = [f"Niche: {NICHE}", "Live trends:"]
    for row in rows[:12]:
        lines.append(f"- {row.get('title', '')} ({row.get('source', '')})")
    return "\n".join(lines)


# --------------------------------------------------------------------------- #
# Agent (OpenCode / OmniRoute)
# --------------------------------------------------------------------------- #
def normalize_target(target: str) -> str:
    target = target.rstrip("/")
    if not target.endswith("/v1"):
        target += "/v1"
    return target


def call_model(system_prompt: str, user_prompt: str, model: str) -> str | None:
    url = normalize_target(TARGET) + "/chat/completions"
    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.8,
        "max_tokens": 2200,
    }
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer "
            + os.environ.get("OPENCODE_KEY", "sk_omniroute"),
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
        return payload["choices"][0]["message"]["content"].strip()
    except Exception as exc:  # noqa: BLE001 -- any failure means try next / fallback
        print(f"generate_script: model {model!r} unavailable ({exc})")
        return None


def extract_json(text: str) -> dict | None:
    if not text:
        return None
    fence = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    candidate = fence.group(1) if fence else None
    if candidate is None:
        start = text.find("{")
        end = text.rfind("}")
        candidate = text[start : end + 1] if start != -1 and end > start else None
    if not candidate:
        return None
    try:
        return json.loads(candidate)
    except json.JSONDecodeError:
        return None


SYSTEM_PROMPT = (
    "You are a Vox-style motion-graphics video director and YouTube scriptwriter. "
    "Confident, energetic, concise. Hook in the first 5 seconds, one idea per "
    "sentence (max 20 words), active voice, no filler, one clear CTA. "
    "Respond with ONLY a JSON object, no markdown fences, no prose."
)


def plan_via_agent(rows: list[dict]) -> dict | None:
    user_prompt = (
        f"Design a 6-scene Vox-style explainer for the niche '{NICHE}'.\n\n"
        f"{trends_to_text(rows)}\n\n"
        "Return JSON with this exact shape:\n"
        "{\n"
        '  "title": "short video title",\n'
        '  "scenes": [\n'
        "    {\n"
        '      "kind": "hook|context|problem|insight|data|cta",\n'
        '      "kicker": "2-3 word label",\n'
        '      "headline": "BOLD ON-SCREEN HEADLINE (<= 6 words)",\n'
        '      "subline": "one supporting line",\n'
        '      "narration": "1-2 spoken sentences",\n'
        '      "characters": [{"src": "characters/host.svg", "x": 0.22, "y": 0.60, "scale": 1.0, "flip": false}],\n'
        '      "assets": [{"kind": "stat|bars|line", "label": "short label", "value": 0.72, "values": [0.4,0.7,0.5,0.9], "x": 0.72, "y": 0.30}],\n'
        '      "sfx": "whoosh|pop|ding"\n'
        "    }\n"
        "  ]\n"
        "}\n"
        "Rules: exactly 6 scenes; x/y are 0..1 canvas positions; scale is 0.6..1.4; "
        "1-2 characters per scene (avoid overlap by spreading x); 1-2 assets per "
        "scene (prefer 'stat'/'bars'/'line'); use only these character files: "
        f"{', '.join('characters/' + c + '.svg' for c in ALLOWED_CHARS)}."
    )
    for model in MODELS:
        raw = call_model(SYSTEM_PROMPT, user_prompt, model)
        plan = extract_json(raw) if raw else None
        if plan and plan.get("scenes"):
            print(f"generate_script: scene plan written via {model}")
            return plan
    return None


# --------------------------------------------------------------------------- #
# Deterministic template plan
# --------------------------------------------------------------------------- #
def build_template_plan(rows: list[dict]) -> dict:
    def title(i: int, default: str) -> str:
        return (rows[i].get("title") or default) if i < len(rows) else default

    def source(i: int, default: str) -> str:
        return (rows[i].get("source") or default) if i < len(rows) else default

    top = title(0, f"{NICHE} is changing fast")
    second = title(1, top)
    third = title(2, second)
    pub = source(0, "the wire")

    return {
        "title": f"{NICHE}: what the headlines miss",
        "scenes": [
            {
                "kind": "hook",
                "kicker": "THE BIG PICTURE",
                "headline": f"{NICHE.upper()} IS MOVING",
                "subline": top,
                "narration": (
                    f"Here is the part about {NICHE} that most people are "
                    f"getting wrong."
                ),
                "characters": [
                    {"src": "characters/host.svg", "x": 0.22, "y": 0.62, "scale": 1.0}
                ],
                "assets": [
                    {"kind": "stat", "label": "signal strength", "value": 0.72,
                     "x": 0.73, "y": 0.30}
                ],
                "sfx": "whoosh",
            },
            {
                "kind": "context",
                "kicker": "CONTEXT",
                "headline": "THE HEADLINE",
                "subline": f"{pub}: {second}",
                "narration": (
                    f"The story everyone is talking about: {top.rstrip('.')}."
                ),
                "characters": [
                    {"src": "characters/presenter.svg", "x": 0.78, "y": 0.63,
                     "scale": 0.94, "flip": True}
                ],
                "assets": [
                    {"kind": "bars", "label": "coverage", "values": [0.35, 0.55, 0.9, 0.7],
                     "x": 0.30, "y": 0.33}
                ],
                "sfx": "pop",
            },
            {
                "kind": "problem",
                "kicker": "THE TRAP",
                "headline": "THE NOISE WINS",
                "subline": "Every headline feels urgent. None of them is.",
                "narration": (
                    "Most people chase every headline and finish none of them. "
                    "Attention scatters, and nothing compounds."
                ),
                "characters": [
                    {"src": "characters/analyst.svg", "x": 0.28, "y": 0.64, "scale": 1.0}
                ],
                "assets": [
                    {"kind": "line", "label": "focus over time",
                     "values": [0.85, 0.6, 0.45, 0.3, 0.2, 0.15], "x": 0.70, "y": 0.28}
                ],
                "sfx": "pop",
            },
            {
                "kind": "insight",
                "kicker": "THE SHIFT",
                "headline": "PICK ONE SIGNAL",
                "subline": third,
                "narration": (
                    f"Here is the move: pick one insight from {NICHE}, act on it "
                    "today, and ignore the rest."
                ),
                "characters": [
                    {"src": "characters/explorer.svg", "x": 0.75, "y": 0.64,
                     "scale": 0.98, "flip": True}
                ],
                "assets": [
                    {"kind": "flag", "label": "the one thing", "x": 0.30, "y": 0.30}
                ],
                "sfx": "pop",
            },
            {
                "kind": "data",
                "kicker": "THE EVIDENCE",
                "headline": "SIGNAL BEATS VOLUME",
                "subline": "One focused action outperforms ten scattered ones.",
                "narration": (
                    "Look at the numbers: focus compounds, noise does not. "
                    "The gap widens every single week."
                ),
                "characters": [
                    {"src": "characters/presenter.svg", "x": 0.20, "y": 0.63, "scale": 0.95}
                ],
                "assets": [
                    {"kind": "bars", "label": "results", "values": [0.25, 0.45, 0.6, 0.8, 0.95],
                     "x": 0.66, "y": 0.30}
                ],
                "sfx": "pop",
            },
            {
                "kind": "cta",
                "kicker": "YOUR MOVE",
                "headline": "START TODAY",
                "subline": f"One {NICHE} insight. Applied this week.",
                "narration": (
                    "Try it this week. Subscribe for more breakdowns like this one."
                ),
                "characters": [
                    {"src": "characters/host.svg", "x": 0.30, "y": 0.62, "scale": 1.02, "flip": True},
                    {"src": "characters/explorer.svg", "x": 0.70, "y": 0.66, "scale": 0.90},
                ],
                "assets": [
                    {"kind": "stat", "label": "start now", "value": 1.0, "x": 0.50, "y": 0.28}
                ],
                "sfx": "ding",
            },
        ],
    }


# --------------------------------------------------------------------------- #
# Validation / sanitising
# --------------------------------------------------------------------------- #
def clamp(value, low: float, high: float, default: float) -> float:
    try:
        num = float(value)
    except (TypeError, ValueError):
        return default
    return max(low, min(high, num))


def sanitize_char(char: dict, index: int) -> dict:
    src = str(char.get("src", ""))
    name = os.path.splitext(os.path.basename(src))[0]
    if name not in ALLOWED_CHARS:
        name = ALLOWED_CHARS[index % len(ALLOWED_CHARS)]
    return {
        "src": f"characters/{name}.svg",
        "x": clamp(char.get("x", 0.25 + 0.5 * (index % 2)), 0.05, 0.95, 0.3),
        "y": clamp(char.get("y", 0.63), 0.25, 0.92, 0.63),
        "scale": clamp(char.get("scale", 1.0), 0.5, 1.6, 1.0),
        "flip": bool(char.get("flip", False)),
    }


def sanitize_asset(asset: dict) -> dict:
    kind = str(asset.get("kind", "stat")).lower()
    if kind not in ASSET_KINDS:
        kind = "stat"
    out = {
        "kind": kind,
        "label": str(asset.get("label", "SIGNAL"))[:40],
        "x": clamp(asset.get("x", 0.7), 0.12, 0.88, 0.7),
        "y": clamp(asset.get("y", 0.3), 0.12, 0.82, 0.3),
    }
    if kind == "stat":
        out["value"] = clamp(asset.get("value", 0.7), 0.0, 1.0, 0.7)
    if kind in ("bars", "line"):
        values = asset.get("values") or ([0.4, 0.7, 0.55, 0.85] if kind == "bars"
                                         else [0.2, 0.45, 0.35, 0.6, 0.5, 0.85])
        out["values"] = [clamp(v, 0.05, 1.0, 0.5) for v in list(values)[:8]]
    return out


def sanitize_scene(scene: dict, index: int) -> dict:
    chars = [
        sanitize_char(c, i)
        for i, c in enumerate(list(scene.get("characters") or [])[:3])
    ]
    if not chars:
        chars = [sanitize_char({"src": ALLOWED_CHARS[index % len(ALLOWED_CHARS)]}, 0)]
    assets = [sanitize_asset(a) for a in list(scene.get("assets") or [])[:3]]
    narration = str(scene.get("narration", "")).strip() or str(
        scene.get("headline", "")
    ).strip()
    sfx = str(scene.get("sfx", "whoosh"))
    if sfx not in ("whoosh", "pop", "ding"):
        sfx = "whoosh"
    return {
        "kind": str(scene.get("kind", "beat"))[:16],
        "kicker": str(scene.get("kicker", ""))[:28],
        "headline": str(scene.get("headline", ""))[:64],
        "subline": str(scene.get("subline", ""))[:120],
        "narration": narration,
        "characters": chars,
        "assets": assets,
        "sfx": sfx,
    }


def sanitize_plan(plan: dict) -> dict | None:
    scenes = [
        sanitize_scene(s, i) for i, s in enumerate(list(plan.get("scenes") or [])[:8])
    ]
    if len(scenes) < 3:
        return None
    return {
        "title": str(plan.get("title", NICHE))[:80],
        "scenes": scenes,
    }


# --------------------------------------------------------------------------- #
# Voiceover
# --------------------------------------------------------------------------- #
def generate_voiceover(text: str) -> bool:
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    try:
        import edge_tts  # type: ignore
    except ImportError:
        print("generate_script: edge-tts not installed; skipping voiceover")
        return False

    async def run() -> None:
        communicate = edge_tts.Communicate(text, voice="en-US-AriaNeural")
        await communicate.save(VOICEOVER_MP3)

    try:
        asyncio.run(run())
        print(f"generate_script: voiceover -> {VOICEOVER_MP3}")
        return True
    except Exception as exc:  # noqa: BLE001 -- network TTS may fail
        print(f"generate_script: edge-tts failed ({exc}); continuing without audio")
        return False


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #
def main() -> int:
    os.makedirs(DATA_DIR, exist_ok=True)
    rows = read_trends()

    plan = plan_via_agent(rows)
    if plan:
        plan = sanitize_plan(plan)
    if not plan:
        print("generate_script: using deterministic template plan")
        plan = build_template_plan(rows)

    scenes = plan["scenes"]
    for scene in scenes:
        scene["weight"] = max(1, len(scene["narration"].split()))

    narration = " ".join(s["narration"] for s in scenes).strip()
    has_audio = generate_voiceover(narration)

    payload = {
        "niche": NICHE,
        "title": plan["title"],
        "audio": "voiceover.mp3" if has_audio else None,
        "narration": narration,
        "trends_count": len(rows),
        "scenes": scenes,
    }
    with open(SCENE_JSON, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2, ensure_ascii=False)

    with open(SCRIPT_JSON, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2, ensure_ascii=False)

    print(
        f"generate_script: {len(rows)} trends -> data/scene.json "
        f"({len(scenes)} scenes, {len(narration)} chars, audio={has_audio})"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
