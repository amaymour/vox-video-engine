import React from "react"
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  getInputProps,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion"

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const

interface CharacterSpec {
  src: string
  x: number
  y: number
  scale: number
  flip?: boolean
}

interface AssetSpec {
  kind: "stat" | "bars" | "line" | "flag"
  label: string
  x: number
  y: number
  value?: number
  values?: number[]
}

interface SceneSpec {
  kind: string
  kicker: string
  headline: string
  subline: string
  narration: string
  characters: CharacterSpec[]
  assets: AssetSpec[]
  sfx: string
  weight: number
}

interface NicheProps {
  niche?: string
  title?: string
  audio?: string | null
  narration?: string
  scenes?: SceneSpec[]
  [key: string]: unknown
}

const SCENE_COLORS: Record<string, { accent: string; glow: string }> = {
  hook: { accent: "#f43f5e", glow: "rgba(244,63,94,0.25)" },
  context: { accent: "#38bdf8", glow: "rgba(56,189,248,0.25)" },
  problem: { accent: "#f97316", glow: "rgba(249,115,22,0.25)" },
  insight: { accent: "#a78bfa", glow: "rgba(167,139,250,0.25)" },
  data: { accent: "#34d399", glow: "rgba(52,211,153,0.25)" },
  cta: { accent: "#facc15", glow: "rgba(250,204,21,0.25)" },
}

const DEFAULT_COLOR = { accent: "#38bdf8", glow: "rgba(56,189,248,0.25)" }

// ── Stat widget ──
const StatWidget: React.FC<{
  asset: AssetSpec
  frame: number
  fps: number
  sceneStart: number
}> = ({ asset, frame, fps, sceneStart }) => {
  const local = frame - sceneStart
  const prog = spring({ frame: local, fps, delay: 12, config: { damping: 18, stiffness: 100 } })
  const value = (asset.value ?? 0.5) * 100
  const displayed = Math.round(value * prog)
  const ringR = 52
  const circ = 2 * Math.PI * ringR
  const dash = circ * (asset.value ?? 0.5) * prog

  return (
    <div
      style={{
        position: "absolute",
        left: `${asset.x * 100}%`,
        top: `${asset.y * 100}%`,
        transform: `translate(-50%, -50%) scale(${interpolate(prog, [0, 1], [0.6, 1], CLAMP)})`,
        opacity: interpolate(prog, [0, 0.3], [0, 1], CLAMP),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <svg width={130} height={130} viewBox="0 0 130 130">
        <circle cx={65} cy={65} r={ringR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
        <circle
          cx={65}
          cy={65}
          r={ringR}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
          style={{ filter: "drop-shadow(0 0 8px rgba(56,189,248,0.6))" }}
        />
        <text x={65} y={72} textAnchor="middle" fill="#ffffff" fontSize={28} fontWeight={800}>
          {displayed}%
        </text>
      </svg>
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: "#94a3b8",
          textTransform: "uppercase",
          textAlign: "center",
          maxWidth: 140,
        }}
      >
        {asset.label}
      </span>
    </div>
  )
}

// ── Bar chart widget ──
const BarsWidget: React.FC<{
  asset: AssetSpec
  frame: number
  fps: number
  sceneStart: number
}> = ({ asset, frame, fps, sceneStart }) => {
  const local = frame - sceneStart
  const prog = spring({ frame: local, fps, delay: 15, config: { damping: 20, stiffness: 90 } })
  const values = asset.values ?? [0.4, 0.7, 0.55, 0.85]

  return (
    <div
      style={{
        position: "absolute",
        left: `${asset.x * 100}%`,
        top: `${asset.y * 100}%`,
        transform: `translate(-50%, -50%) scale(${interpolate(prog, [0, 1], [0.7, 1], CLAMP)})`,
        opacity: interpolate(prog, [0, 0.3], [0, 1], CLAMP),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
        {values.map((v, i) => {
          const barProg = spring({
            frame: local,
            fps,
            delay: 18 + i * 4,
            config: { damping: 16, stiffness: 120 },
          })
          return (
            <div
              key={i}
              style={{
                width: 24,
                height: `${v * 100 * barProg}%`,
                borderRadius: 6,
                background: `linear-gradient(180deg, #38bdf8, #8b5cf6)`,
                boxShadow: "0 0 12px rgba(56,189,248,0.3)",
              }}
            />
          )
        })}
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "#94a3b8",
          textTransform: "uppercase",
        }}
      >
        {asset.label}
      </span>
    </div>
  )
}

// ── Line chart widget ──
const LineWidget: React.FC<{
  asset: AssetSpec
  frame: number
  fps: number
  sceneStart: number
}> = ({ asset, frame, fps, sceneStart }) => {
  const local = frame - sceneStart
  const prog = spring({ frame: local, fps, delay: 14, config: { damping: 18, stiffness: 100 } })
  const values = asset.values ?? [0.2, 0.45, 0.35, 0.6, 0.5, 0.85]
  const w = 160
  const h = 100
  const margin = 8
  const points = values.map((v, i) => ({
    x: margin + (i / (values.length - 1)) * (w - margin * 2),
    y: h - margin - v * (h - margin * 2),
  }))
  const drawn = Math.floor(points.length * prog)
  const pathD = points
    .slice(0, drawn + 1)
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ")

  return (
    <div
      style={{
        position: "absolute",
        left: `${asset.x * 100}%`,
        top: `${asset.y * 100}%`,
        transform: `translate(-50%, -50%) scale(${interpolate(prog, [0, 1], [0.7, 1], CLAMP)})`,
        opacity: interpolate(prog, [0, 0.3], [0, 1], CLAMP),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <path d={pathD || "M 0 0"} fill="none" stroke="#38bdf8" strokeWidth={3} strokeLinecap="round" />
        {points.slice(0, drawn + 1).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill="#ffffff" />
        ))}
      </svg>
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "#94a3b8",
          textTransform: "uppercase",
        }}
      >
        {asset.label}
      </span>
    </div>
  )
}

// ── Flag/badge widget ──
const FlagWidget: React.FC<{
  asset: AssetSpec
  frame: number
  fps: number
  sceneStart: number
}> = ({ asset, frame, fps, sceneStart }) => {
  const local = frame - sceneStart
  const prog = spring({ frame: local, fps, delay: 10, config: { damping: 14, stiffness: 130 } })

  return (
    <div
      style={{
        position: "absolute",
        left: `${asset.x * 100}%`,
        top: `${asset.y * 100}%`,
        transform: `translate(-50%, -50%) scale(${interpolate(prog, [0, 1], [0.5, 1], CLAMP)})`,
        opacity: interpolate(prog, [0, 0.3], [0, 1], CLAMP),
        padding: "14px 28px",
        borderRadius: 999,
        border: "2px solid rgba(56,189,248,0.5)",
        backgroundColor: "rgba(56,189,248,0.12)",
        fontSize: 18,
        fontWeight: 800,
        letterSpacing: "0.15em",
        color: "#38bdf8",
        textTransform: "uppercase",
        boxShadow: "0 0 20px rgba(56,189,248,0.3)",
      }}
    >
      {asset.label}
    </div>
  )
}

// ── Asset router ──
const AssetWidget: React.FC<{
  asset: AssetSpec
  frame: number
  fps: number
  sceneStart: number
}> = (props) => {
  switch (props.asset.kind) {
    case "stat":
      return <StatWidget {...props} />
    case "bars":
      return <BarsWidget {...props} />
    case "line":
      return <LineWidget {...props} />
    case "flag":
      return <FlagWidget {...props} />
    default:
      return null
  }
}

// ── Single scene ──
const Scene: React.FC<{
  scene: SceneSpec
  index: number
  sceneDuration: number
}> = ({ scene, index, sceneDuration }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const colors = SCENE_COLORS[scene.kind] ?? DEFAULT_COLOR

  const fadeIn = interpolate(frame, [0, 15], [0, 1], CLAMP)
  const fadeOut = interpolate(frame, [sceneDuration - 12, sceneDuration], [1, 0], CLAMP)
  const opacity = fadeIn * fadeOut

  const kickerSpring = spring({ frame, fps, delay: 5, config: { damping: 14, stiffness: 140, mass: 0.5 } })
  const headlineSpring = spring({ frame, fps, delay: 10, config: { damping: 16, stiffness: 120, mass: 0.7 } })
  const sublineSpring = spring({ frame, fps, delay: 18, config: { damping: 18, stiffness: 100, mass: 0.8 } })

  const bgDriftX = Math.sin((frame + index * 100) / 60) * 30
  const bgDriftY = Math.cos((frame + index * 80) / 80) * 20
  const bgScale = interpolate(frame, [0, sceneDuration], [1, 1.15], CLAMP)

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Background */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${colors.glow} 0%, #02040a 70%)`,
          transform: `scale(${bgScale}) translate(${bgDriftX}px, ${bgDriftY}px)`,
        }}
      />

      {/* Mesh glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at ${30 + index * 10}% ${40 + index * 5}%, ${colors.glow}, transparent 50%)`,
          transform: `translate(${Math.sin(frame / 15) * 25}px, ${Math.cos(frame / 20) * 20}px)`,
        }}
      />

      {/* Scan lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(0,0,0,0.12) 1px, transparent 1px)",
          backgroundSize: "100% 4px",
          opacity: 0.12,
          pointerEvents: "none",
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle, transparent 40%, rgba(0,0,0,0.7) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Characters */}
      {scene.characters.map((char, ci) => {
        const charSpring = spring({
          frame,
          fps,
          delay: 8 + ci * 6,
          config: { damping: 16, stiffness: 110 },
        })
        const boilX = Math.sin(frame * 0.4 + ci) * 2
        const boilY = Math.cos(frame * 0.35 + ci) * 2

        return (
          <div
            key={ci}
            style={{
              position: "absolute",
              left: `${char.x * 100}%`,
              top: `${char.y * 100}%`,
              transform: `translate(-50%, -50%) scale(${char.scale * interpolate(charSpring, [0, 1], [0.3, 1], CLAMP)}) scaleX(${char.flip ? -1 : 1}) translate(${boilX}px, ${boilY}px)`,
              opacity: interpolate(charSpring, [0, 0.5], [0, 1], CLAMP),
              filter: `drop-shadow(0 8px 24px ${colors.glow})`,
              width: 200,
              height: 200,
            }}
          >
            <Img src={staticFile(char.src)} style={{ width: "100%", height: "100%" }} />
          </div>
        )
      })}

      {/* Data viz assets */}
      {scene.assets.map((asset, ai) => (
        <AssetWidget key={ai} asset={asset} frame={frame} fps={fps} sceneStart={0} />
      ))}

      {/* Typography */}
      <div
        style={{
          position: "absolute",
          bottom: 220,
          left: 60,
          right: 60,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Kicker */}
        <div
          style={{
            transform: `translateY(${interpolate(kickerSpring, [0, 1], [40, 0], CLAMP)}px)`,
            opacity: interpolate(kickerSpring, [0, 1], [0, 1], CLAMP),
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            alignSelf: "flex-start",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: colors.accent,
              boxShadow: `0 0 12px ${colors.accent}`,
            }}
          />
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "0.2em",
              color: colors.accent,
              textTransform: "uppercase",
            }}
          >
            {scene.kicker}
          </span>
        </div>

        {/* Headline */}
        <div style={{ overflow: "hidden" }}>
          <h1
            style={{
              transform: `translateY(${interpolate(headlineSpring, [0, 1], [100, 0], CLAMP)}%)`,
              opacity: interpolate(headlineSpring, [0, 1], [0, 1], CLAMP),
              fontSize: 62,
              fontWeight: 900,
              lineHeight: 1.1,
              margin: 0,
              color: "#ffffff",
              letterSpacing: `${interpolate(frame, [0, sceneDuration], [0.02, -0.01], CLAMP)}em`,
              background: "linear-gradient(180deg, #ffffff 30%, #94a3b8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {scene.headline}
          </h1>
        </div>

        {/* Subline */}
        <p
          style={{
            transform: `translateY(${interpolate(sublineSpring, [0, 1], [30, 0], CLAMP)}px)`,
            opacity: interpolate(sublineSpring, [0, 1], [0, 1], CLAMP),
            fontSize: 22,
            fontWeight: 400,
            lineHeight: 1.5,
            margin: 0,
            color: "#94a3b8",
            maxWidth: 800,
          }}
        >
          {scene.subline}
        </p>
      </div>

      {/* Scene counter */}
      <div
        style={{
          position: "absolute",
          top: 60,
          right: 60,
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "monospace",
          color: "rgba(148,163,184,0.5)",
          letterSpacing: "0.15em",
        }}
      >
        {String(index + 1).padStart(2, "0")} / 06
      </div>
    </AbsoluteFill>
  )
}

// ── Main composition ──
export const NicheExplainer: React.FC = () => {
  const { durationInFrames } = useVideoConfig()
  const inputProps = getInputProps<NicheProps>()
  const audio = inputProps?.audio ?? null
  const scenes = inputProps?.scenes ?? []

  if (scenes.length === 0) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "#02040a",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#94a3b8",
          fontSize: 32,
          fontFamily: "system-ui",
        }}
      >
        No scenes — run generate_script.py first
      </AbsoluteFill>
    )
  }

  const totalWeight = scenes.reduce((sum, s) => sum + (s.weight || 1), 0)
  const sceneTimings: { start: number; duration: number }[] = []
  let cursor = 0
  for (const scene of scenes) {
    const weight = scene.weight || 1
    const dur = Math.round((weight / totalWeight) * durationInFrames)
    sceneTimings.push({ start: cursor, duration: dur })
    cursor += dur
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#02040a" }}>
      {scenes.map((scene, i) => (
        <Sequence
          key={i}
          from={sceneTimings[i].start}
          durationInFrames={sceneTimings[i].duration}
        >
          <Scene
            scene={scene}
            index={i}
            sceneDuration={sceneTimings[i].duration}
          />
        </Sequence>
      ))}

      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  )
}

export default NicheExplainer
