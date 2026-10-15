import { spring } from "remotion"

/**
 * Shared entrance spring. Structural assets call this first; midground
 * characters call it with a staggered `delay`.
 */
export const springIn = (
  frame: number,
  fps: number,
  delay = 0,
  durationInFrames?: number,
): number =>
  spring({
    frame,
    fps,
    delay,
    durationInFrames,
    config: { damping: 14, stiffness: 120, mass: 0.7 },
  })
