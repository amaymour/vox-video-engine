#!/usr/bin/env python3
"""make_sfx.py -- synthesize ambient sound effects as WAV using only the stdlib.

Zero-cost, zero-dependency: no ffmpeg, no sample libraries. Produces:

    public/sfx/whoosh.wav    scene transition sweep
    public/sfx/pop.wav       foreground asset entrance
    public/sfx/ding.wav      reveal / call-to-action
    public/sfx/ambient.wav   looping low bed

These are referenced by src/Composition.tsx and sequenced onto the cut points
with Remotion's native <Audio /> layers.
"""

import array
import math
import os
import random
import wave

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(REPO_ROOT, "public", "sfx")
RATE = 44100


def write_wav(name: str, samples: list[float]) -> None:
    path = os.path.join(OUT_DIR, name)
    data = array.array(
        "h", (max(-32767, min(32767, int(s * 32767))) for s in samples)
    )
    with wave.open(path, "w") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(RATE)
        wav.writeframes(data.tobytes())
    print(f"make_sfx: {name} ({len(samples) / RATE:.2f}s)")


def whoosh(dur: float = 0.55) -> list[float]:
    out: list[float] = []
    prev = 0.0
    for i in range(int(RATE * dur)):
        t = i / RATE
        noise = random.uniform(-1, 1)
        # one-pole low-pass with a sweeping cutoff -> airy sweep
        cutoff = 0.05 + 0.35 * math.sin(math.pi * (t / dur))
        prev = prev + cutoff * (noise - prev)
        fade = min(1.0, t / 0.15) * min(1.0, (dur - t) / 0.25)
        out.append(prev * fade * 0.5)
    return out


def pop(dur: float = 0.14) -> list[float]:
    out: list[float] = []
    for i in range(int(RATE * dur)):
        t = i / RATE
        freq = 380 + 700 * (t / dur)
        out.append(math.sin(2 * math.pi * freq * t) * math.exp(-18 * t) * 0.6)
    return out


def ding(dur: float = 0.9) -> list[float]:
    out: list[float] = []
    for i in range(int(RATE * dur)):
        t = i / RATE
        s = (
            0.5 * math.sin(2 * math.pi * 880 * t)
            + 0.3 * math.sin(2 * math.pi * 1320 * t)
            + 0.2 * math.sin(2 * math.pi * 1760 * t)
        )
        out.append(s * math.exp(-4 * t) * 0.4)
    return out


def ambient(dur: float = 8.0) -> list[float]:
    out: list[float] = []
    for i in range(int(RATE * dur)):
        t = i / RATE
        s = (
            0.5 * math.sin(2 * math.pi * 55 * t)
            + 0.25 * math.sin(2 * math.pi * 82.5 * t)
            + 0.12 * math.sin(2 * math.pi * 110 * t)
            + 0.03 * random.uniform(-1, 1)
        )
        fade = min(1.0, t / 0.5) * min(1.0, (dur - t) / 0.5)
        out.append(s * fade * 0.35)
    return out


def main() -> int:
    os.makedirs(OUT_DIR, exist_ok=True)
    random.seed(7)
    write_wav("whoosh.wav", whoosh())
    write_wav("pop.wav", pop())
    write_wav("ding.wav", ding())
    write_wav("ambient.wav", ambient())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
