import { spring } from "remotion"

/**
 * Layer 3 — Remotion Spring Physics Simulation.
 *
 * Canonical mass/stiffness profiles for the SSS-grade product animation.
 *
 * - springFast: snappy UI transitions (mass 0.4, damping 10, stiffness 120)
 * - springHeavy: premium cinematic dragging physics
 *   (mass 0.8, damping 15, stiffness 80)
 *
 * Both return a value that starts at 0 and springs toward 1, driven by
 * `frame`/`fps` so the render is deterministic on every GitHub Actions runner.
 */
export const springFast = (
  frame: number,
  fps: number,
  delay = 0,
): number =>
  spring({
    frame,
    fps,
    delay,
    config: { mass: 0.4, damping: 10, stiffness: 120 },
  })

export const springHeavy = (
  frame: number,
  fps: number,
  delay = 0,
): number =>
  spring({
    frame,
    fps,
    delay,
    config: { mass: 0.8, damping: 15, stiffness: 80 },
  })
