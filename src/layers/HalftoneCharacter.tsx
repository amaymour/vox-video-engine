import type { CSSProperties } from "react"
import { interpolate, staticFile } from "remotion"
import { springHeavy } from "../lib/anim"
import { theme } from "../lib/theme"
import type { CharacterSpec } from "../types"

const BOX_W = 460
const BOX_H = 790

/**
 * Layer 3 + 4 — Half-tone Midground Character Layer.
 *
 * Each subject cutout is rendered as a stylised black-and-white halftone
 * (white paper + black dot screen) through an alpha mask, with a bold red
 * offset-outline vector mask layered *behind* it.
 *
 * Uses springHeavy cinematic dragging physics (mass 0.8, damping 15,
 * stiffness 80) and explicit 3D matrix transforms — never plain X/Y:
 *
 *   transform: perspective(1000px) rotateX(${rotateX}deg)
 *              translateZ(${translateZ}px)
 *
 * Per-character scale / x / y come straight from the scene spec so the
 * coding agent can dynamically tweak positioning to avoid overlaps.
 */
export const CharacterStage = ({
  characters,
  frame,
  fps,
  baseDelay = 12,
}: {
  characters: CharacterSpec[]
  frame: number
  fps: number
  baseDelay?: number
}) => (
  <>
    {characters.map((character, i) => (
      <HalftoneCharacter
        key={`${character.src}-${i}`}
        character={character}
        frame={frame}
        fps={fps}
        delay={baseDelay + i * 6}
      />
    ))}
  </>
)

const HalftoneCharacter = ({
  character,
  frame,
  fps,
  delay,
}: {
  character: CharacterSpec
  frame: number
  fps: number
  delay: number
}) => {
  // Layer 3 — cinematic dragging spring physics
  const s = springHeavy(frame, fps, delay)

  // Layer 2 — precise 3D interpolation proofs (clamped both ends)
  const rotateX = interpolate(frame, [0, 30], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })
  const translateZ = interpolate(frame, [0, 45], [-200, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  const matrix: CSSProperties = {
    transform: `translate(-50%, calc(-50% + ${20 * (1 - s)}px)) perspective(1000px) rotateX(${rotateX}deg) translateZ(${translateZ}px) scale(${character.scale * (0.85 + 0.15 * s)}) ${
      character.flip ? "scaleX(-1)" : ""
    }`,
  }

  const opacity = interpolate(frame, [delay, delay + 7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  const url = staticFile(character.src)
  const mask: CSSProperties = {
    WebkitMaskImage: `url(${url})`,
    maskImage: `url(${url})`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  }

  return (
    <div
      style={{
        ...matrix,
        position: "absolute",
        left: `${character.x * 100}%`,
        top: `${character.y * 100}%`,
        width: BOX_W,
        height: BOX_H,
        opacity,
        pointerEvents: "none",
      }}
    >
      {/* Bold red graphic offset outline vector mask, behind the subject */}
      <div
        style={{
          ...mask,
          position: "absolute",
          inset: 0,
          transform: "translate(18px, 12px)",
          backgroundColor: theme.red,
          filter: "drop-shadow(0 22px 36px rgba(225,29,42,0.35))",
        }}
      />
      {/* Stylised black-and-white halftone subject */}
      <div
        style={{
          ...mask,
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(#0B0F19 2.2px, transparent 2.5px), linear-gradient(180deg, #ffffff 0%, #dbe3ef 100%)",
          backgroundSize: "9px 9px, 100% 100%",
        }}
      />
    </div>
  )
}
