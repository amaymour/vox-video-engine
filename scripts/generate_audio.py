#!/usr/bin/env python3
"""generate_audio.py — edge-tts voiceover + scene.json for ViralDocumentary.

Runs on GitHub Actions (headless Ubuntu). Zero cost, no API key.
Produces public/voiceover.mp3 and data/script.json from a hardcoded narration.
"""

import asyncio
import json
import os
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(REPO_ROOT, "data")
PUBLIC_DIR = os.path.join(REPO_ROOT, "public")
SCRIPT_JSON = os.path.join(DATA_DIR, "script.json")
VOICEOVER_MP3 = os.path.join(PUBLIC_DIR, "voiceover.mp3")

NARRATION = (
    "Viral documentary. Layered compositing, edge-to-edge math orchestration, "
    "and fluid spring physics motion, rendered seamlessly on headless server "
    "architectures. Zero cost. Zero keys. Zero compromise."
)


async def _run() -> None:
    try:
        import edge_tts  # type: ignore
    except ImportError:
        print("generate_audio: edge-tts not installed; skipping voiceover")
        return

    os.makedirs(PUBLIC_DIR, exist_ok=True)
    os.makedirs(DATA_DIR, exist_ok=True)
    communicate = edge_tts.Communicate(NARRATION, voice="en-US-AriaNeural")
    await communicate.save(VOICEOVER_MP3)
    print(f"generate_audio: voiceover -> {VOICEOVER_MP3}")

    payload = {
        "niche": "Viral Documentary",
        "title": "Render Cinematic Video in the Cloud",
        "audio": "voiceover.mp3",
        "narration": NARRATION,
    }
    with open(SCRIPT_JSON, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2, ensure_ascii=False)
    print(f"generate_audio: scene -> {SCRIPT_JSON}")


def main() -> int:
    try:
        asyncio.run(_run())
    except Exception as exc:  # noqa: BLE001 — network TTS may fail
        print(f"generate_audio: edge-tts failed ({exc}); continuing without audio")
        return 0
    return 0


if __name__ == "__main__":
    sys.exit(main())
