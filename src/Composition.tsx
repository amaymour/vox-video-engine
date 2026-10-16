import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion"
import { Background } from "./layers/Background"
import { CharacterStage } from "./layers/HalftoneCharacter"
import { ForegroundAssets } from "./layers/ForegroundAsset"
import { springFast } from "./lib/anim"
import {
  cardDeepShadow,
  cardStyle,
  FONT_FAMILY,
  glowStyle,
  theme,
} from "./lib/theme"
import type { SceneSpec, VoxProps } from "./types"

const FPS = 30

// ============================================================================
// Layer 2 — Matrix & Interpolation Math Proofing
// Precise frame ranges for every interpolation boundary (clamped both ends)
// ============================================================================
const TRANSITION_FRAMES = 30

// Precise 3D interpolation proofs — never plain X/Y animation
export const rotateX = (frame: number) =>
  interpolate(frame, [0, 30], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

export const translateZ = (frame: number) =>
  interpolate(frame, [0, 45], [-200, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

// Hero card 3D matrix transform: perspective + rotateX + translateZ
const heroMatrix = (frame: number) =>
  `perspective(1000px) rotateX(${rotateX(frame)}deg) translateZ(${translateZ(frame)}px)`

interface Slot {
  scene: SceneSpec
  start: number
  duration: number
}

/**
 * Distribute the total clip length across scenes by narration weight. Because
 * the weights are relative, the scene timing automatically adapts to whatever
 * duration calculateMetadata derives from the real voiceover.
 */
const buildTimeline = (scenes: SceneSpec[], total: number): Slot[] => {
  const weights = scenes.map((scene) => Math.max(1, scene.weight ?? 1))
  const sum = weights.reduce((a, b) => a + b, 0)
  const slots: Slot[] = []
  let cursor = 0
  scenes.forEach((scene, i) => {
    const isLast = i === scenes.length - 1
    const duration = isLast
      ? Math.max(1, total - cursor)
      : Math.max(1, Math.round((weights[i] / sum) * total))
    slots.push({ scene, start: cursor, duration })
    cursor += duration
  })
  return slots
}

const buildDefaultScenes = (niche: string): SceneSpec[] => [
  {
    kind: "hook",
    kicker: "THE BIG PICTURE",
    headline: `${niche.toUpperCase()} IS MOVING`,
    subline: "Preview scene — pass --props to drive the real plan.",
    narration: "Here is the part about the topic most people are getting wrong.",
    characters: [{ src: "characters/host.svg", x: 0.22, y: 0.62, scale: 1 }],
    assets: [{ kind: "stat", label: "signal strength", value: 0.72, x: 0.73, y: 0.3 }],
    sfx: "whoosh",
    weight: 10,
  },
  {
    kind: "problem",
    kicker: "THE TRAP",
    headline: "THE NOISE WINS",
    subline: "Every headline feels urgent. None of them is.",
    narration: "Most people chase every headline and finish none of them.",
    characters: [{ src: "characters/analyst.svg", x: 0.28, y: 0.64, scale: 1 }],
    assets: [
      {
        kind: "line",
        label: "focus over time",
        values: [0.85, 0.6, 0.45, 0.3, 0.2, 0.15],
        x: 0.7,
        y: 0.28,
      },
    ],
    sfx: "pop",
    weight: 12,
  },
  {
    kind: "data",
    kicker: "THE EVIDENCE",
    headline: "SIGNAL BEATS VOLUME",
    subline: "One focused action outperforms ten scattered ones.",
    narration: "Focus compounds, noise does not. The gap widens every week.",
    characters: [
      { src: "characters/presenter.svg", x: 0.2, y: 0.63, scale: 0.95 },
    ],
    assets: [
      {
        kind: "bars",
        label: "results",
        values: [0.25, 0.45, 0.6, 0.8, 0.95],
        x: 0.66,
        y: 0.3,
      },
    ],
    sfx: "pop",
    weight: 12,
  },
  {
    kind: "cta",
    kicker: "YOUR MOVE",
    headline: "START TODAY",
    subline: "One insight. Applied this week.",
    narration: "Try it this week. Subscribe for more breakdowns.",
    characters: [
      { src: "characters/host.svg", x: 0.3, y: 0.62, scale: 1.02, flip: true },
      { src: "characters/explorer.svg", x: 0.7, y: 0.66, scale: 0.9 },
    ],
    assets: [{ kind: "flag", label: "start now", x: 0.5, y: 0.28 }],
    sfx: "ding",
    weight: 10,
  },
]

export const VoxVideo = (props: VoxProps) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const scenes =
    props.scenes && props.scenes.length > 0
      ? props.scenes
      : buildDefaultScenes(props.niche ?? "Tech Tools")
  const slots = buildTimeline(scenes, durationInFrames)

  // Layer 3 — hero snappy fade (springFast)
  const heroOpacity = springFast(frame, FPS, 0)

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, fontFamily: FONT_FAMILY }}>
      {/* Layer 4 — locked background canvas */}
      <Background />

      {/* Layer 4 — SSS-Grade Hero Card: 3D matrix + glow + card architecture */}
      <AbsoluteFill
        style={{
          position: "absolute",
          left: "50%",
          top: "26%",
          transform: `translateX(-50%) ${heroMatrix(frame)}`,
          width: 720,
          height: 420,
          opacity: heroOpacity,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            ...cardStyle,
            ...glowStyle,
            ...cardDeepShadow,
            width: 720,
            height: 420,
            overflow: "hidden",
          }}
        >
          <div style={{ color: theme.paper, fontFamily: FONT_FAMILY }}>
            <div
              style={{
                fontSize: 14,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: theme.cyan,
                fontWeight: 800,
                marginBottom: 16,
              }}
            >
              VOX ENGINE
            </div>
            <h2
              style={{
                fontSize: 64,
                fontWeight: 900,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              Motion Graphics
            </h2>
            <p
              style={{
                fontSize: 20,
                color: theme.muted,
                marginTop: 20,
                maxWidth: 560,
                lineHeight: 1.5,
              }}
            >
              Rendered entirely on zero-cost GitHub Actions runners with
              Remotion, edge-tts and OpenCode.
            </p>
          </div>
        </div>
      </AbsoluteFill>

      {slots.map((slot, i) => (
        <Sequence
          key={`scene-${i}`}
          from={slot.start}
          durationInFrames={slot.duration}
        >
          <SceneView scene={slot.scene} index={i} duration={slot.duration} />
        </Sequence>
      ))}

      {/* Ambient sound effects sequenced onto the cut points */}
      {slots.map((slot, i) => (
        <Sequence
          key={`sfx-${i}`}
          from={slot.start}
          durationInFrames={Math.min(slot.duration, 45)}
        >
          <Audio src={staticFile(`sfx/${slot.scene.sfx}.wav`)} volume={0.45} />
        </Sequence>
      ))}

      {/* Looping ambient bed under the whole piece */}
      <Audio src={staticFile("sfx/ambient.wav")} loop volume={0.12} />

      {/* Narrated voiceover, sized by calculateMetadata */}
      {props.audio ? <Audio src={staticFile(props.audio)} /> : null}

      <BrandBug niche={props.niche} title={props.title} />
      <ProgressBar total={durationInFrames} scenes={scenes.length} />
    </AbsoluteFill>
  )
}

const SceneView = ({
  scene,
  index,
  duration,
}: {
  scene: SceneSpec
  index: number
  duration: number
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const inOpacity = interpolate(frame, [0, TRANSITION_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })
  const outOpacity = interpolate(
    frame,
    [Math.max(0, duration - TRANSITION_FRAMES), duration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  )
  const opacity = Math.min(inOpacity, outOpacity)

  // Layer 3 — assets spring in first (springFast), characters after (springHeavy)
  const assetSpring = springFast(frame, fps, 0)

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Layer 4 — foreground structures spring onto frame first */}
      <ForegroundAssets
        assets={scene.assets}
        frame={frame}
        fps={fps}
        baseDelay={0}
      />

      {/* Layer 3 — midground halftone actors stagger in afterwards (heavy physics) */}
      <CharacterStage
        characters={scene.characters}
        frame={frame}
        fps={fps}
        baseDelay={12}
      />

      {/* Premium headline block — card architecture */}
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 110,
          maxWidth: 1100,
          transform: `translateY(${
            40 * (1 - Math.min(1, assetSpring))
          }px)`,
          opacity: assetSpring,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              background: theme.red,
              color: "#ffffff",
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: 2,
              padding: "8px 16px",
              borderRadius: 6,
              textTransform: "uppercase",
            }}
          >
            {scene.kicker || scene.kind}
          </span>
          <span
            style={{
              color: theme.muted,
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: 4,
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <h1
          style={{
            margin: "16px 0 0",
            fontSize: 80,
            lineHeight: 0.98,
            fontWeight: 900,
            color: theme.paper,
            letterSpacing: "-0.03em",
            textTransform: "uppercase",
          }}
        >
          {scene.headline}
        </h1>

        <div
          style={{
            height: 10,
            width: 260 * Math.min(1, assetSpring),
            background: theme.red,
            marginTop: 22,
            borderRadius: 6,
          }}
        />

        {scene.subline ? (
          <p
            style={{
              margin: "20px 0 0",
              fontSize: 28,
              fontWeight: 600,
              color: theme.muted,
              maxWidth: 900,
              lineHeight: 1.35,
            }}
          >
            {scene.subline}
          </p>
        ) : null}
      </div>

      <Caption text={scene.narration} duration={duration} />
    </AbsoluteFill>
  )
}

/** Lower-third captions, chunked and timed across the scene duration. */
const Caption = ({ text, duration }: { text: string; duration: number }) => {
  const frame = useCurrentFrame()
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length === 0) {
    return null
  }
  const perChunk = 9
  const chunks: string[] = []
  for (let i = 0; i < words.length; i += perChunk) {
    chunks.push(words.slice(i, i + perChunk).join(" "))
  }
  const chunkDuration = duration / chunks.length
  const index = Math.min(
    chunks.length - 1,
    Math.max(0, Math.floor(frame / chunkDuration)),
  )
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 54,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          ...cardStyle,
          ...glowStyle,
          padding: "14px 28px",
          maxWidth: 1400,
        }}
      >
        <span style={{ fontSize: 34, fontWeight: 700, color: theme.paper }}>
          {chunks[index]}
        </span>
      </div>
    </div>
  )
}

const ProgressBar = ({ total, scenes }: { total: number; scenes: number }) => {
  const frame = useCurrentFrame()
  const progress = total > 1 ? Math.min(1, frame / (total - 1)) : 0
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 6,
          background: "rgba(148,163,184,0.18)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${theme.indigo}, ${theme.red})`,
            ...glowStyle,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 6,
          height: 6,
          display: "flex",
        }}
      >
        {Array.from({ length: scenes }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              borderRight: i < scenes - 1 ? "2px solid rgba(11,16,32,0.9)" : "none",
            }}
          />
        ))}
      </div>
    </>
  )
}

const BrandBug = ({ niche, title }: { niche?: string; title?: string }) => (
  <div
    style={{
      position: "absolute",
      right: 64,
      top: 56,
      textAlign: "right",
    }}
  >
    <div
      style={{
        fontSize: 18,
        fontWeight: 800,
        letterSpacing: 4,
        color: theme.red,
        textTransform: "uppercase",
      }}
    >
      Vox Engine
    </div>
    <div
      style={{
        fontSize: 24,
        fontWeight: 700,
        color: theme.paper,
        maxWidth: 460,
        marginTop: 4,
      }}
    >
      {title || niche || ""}
    </div>
  </div>
)
