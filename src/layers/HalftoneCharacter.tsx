import type { CSSProperties } from "react"
import {
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion"
import { springIn } from "../lib/anim"
import { theme } from "../lib/theme"
import type { CharacterSpec } from "../types"

const BOX_W = 460
const BOX_H = 790

/**
 * Half-tone midground character layer.
 *
 * Each subject cutout is rendered as a stylised black-and-white halftone
 * (white paper + black dot screen) through an alpha mask, with a bold red
 * offset outline vector mask layered *behind* it. `x` / `y` / `scale` come
 * straight from the scene spec so the agent can reposition cutouts.
 */
export const CharacterStage = ({
  characters,
  baseDelay,
}: {
  characters: CharacterSpec[]
  baseDelay: number
}) => (
  <>
    {characters.map((character, i) => (
      <HalftoneCharacter
        key={`${character.src}-${i}`}
        character={character}
        delay={baseDelay + i * 7}
      />
    ))}
  </>
)

const HalftoneCharacter = ({
  character,
  delay,
}: {
  character: CharacterSpec
  delay: number
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const s = springIn(frame, fps, delay)
  const rise = interpolate(s, [0, 1], [70, 0])
  const scale = character.scale * interpolate(s, [0, 1], [0.9, 1])
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
        position: "absolute",
        left: `${character.x * 100}%`,
        top: `${character.y * 100}%`,
        width: BOX_W,
        height: BOX_H,
        transform: `translate(-50%, calc(-50% + ${rise}px)) scale(${scale}) ${
          character.flip ? "scaleX(-1)" : ""
        }`,
        opacity,
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
            "radial-gradient(#0b1020 2.2px, transparent 2.5px), linear-gradient(180deg, #ffffff 0%, #dbe3ef 100%)",
          backgroundSize: "9px 9px, 100% 100%",
        }}
      />
    </div>
  )
}
