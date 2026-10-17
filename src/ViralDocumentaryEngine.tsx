import React from "react"
import {
  AbsoluteFill,
  Audio,
  getInputProps,
  interpolate,
  staticFile,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion"

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const

export const ViralDocumentaryEngine: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const inputProps = getInputProps<{
    audio?: string | null
    niche?: string
    title?: string
    narration?: string
  }>()
  const audio = inputProps?.audio ?? null
  const niche = inputProps?.niche ?? "VIRAL DOCUMENTARY"
  const titleText = inputProps?.title ?? "Render Cinematic Video"
  const subtitleText = titleText.includes("\n")
    ? titleText.split("\n")[1]
    : "Directly in the Cloud"
  const headlineText = titleText.includes("\n")
    ? titleText.split("\n")[0]
    : titleText
  const descText =
    inputProps?.narration ??
    "Layered compositing, edge-to-edge math orchestration, and fluid spring physics motion — rendered seamlessly on headless server architectures."

  const { durationInFrames } = useVideoConfig()
  const t = (frame * 30) / fps
  const totalT = (durationInFrames * 30) / fps

  // -----------------------------------------------------------------------
  // Layer 1: Cinematic parallax background (BIG motion)
  // -----------------------------------------------------------------------
  const bgScale = interpolate(t, [0, totalT], [1, 1.35], CLAMP)
  const bgDriftX = Math.sin(t / 12) * 40
  const bgDriftY = Math.cos(t / 16) * 30

  // -----------------------------------------------------------------------
  // Layer 2: Foreground subject & character boil (BIG motion)
  // -----------------------------------------------------------------------
  const fgScale = interpolate(t, [0, totalT], [1, 1.5], CLAMP)
  const boilX = Math.sin(frame * 0.5) * 3
  const boilY = Math.cos(frame * 0.4) * 3

  // -----------------------------------------------------------------------
  // Layer 3: Gate weave + film texture
  // -----------------------------------------------------------------------
  const gateWeaveX = Math.sin(frame / 6) * 3
  const gateWeaveY = Math.cos(frame / 9) * 3

  // -----------------------------------------------------------------------
  // Layer 4: Kinetic typography (FAST entrance, delay 3 frames)
  // -----------------------------------------------------------------------
  const textEntrance = spring({
    frame,
    fps,
    config: { mass: 0.4, damping: 14, stiffness: 150 },
    delay: 3,
  })
  const textY = interpolate(textEntrance, [0, 1], [80, 0], CLAMP)
  const textTracking = interpolate(t, [0, totalT], [5, -1], CLAMP)
  const titleScale = interpolate(t, [0, totalT], [0.8, 1.1], CLAMP)

  // -----------------------------------------------------------------------
  // Layer 5: Animated code-generated imagery (SVG, no external assets)
  // -----------------------------------------------------------------------
  const orbitAngle = (frame * 2) % 360
  const pulseScale = 1 + Math.sin(frame / 8) * 0.25


  // -----------------------------------------------------------------------
  // Layer 6: Progress bar (0% -> 100% over frames 45-130)
  // -----------------------------------------------------------------------
  const progress = interpolate(t, [45, 130], [0, 100], CLAMP)

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#02040a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Parent perspective for 3D card */}
      <div style={{ perspective: 1800, width: "100%", height: "100%" }}>
        {/* Layer 1: Background with big push-zoom + drift */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `scale(${bgScale}) translate(${bgDriftX}px, ${bgDriftY}px)`,
            transformOrigin: "center",
            background:
              "radial-gradient(circle at 50% 50%, #1a1a2e 0%, #02040a 100%)",
          }}
        />

        {/* Layer 1b: Accent glow that moves */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 30% 30%, rgba(56, 189, 248, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.12) 0%, transparent 40%)",
            transform: `translate(${Math.sin(frame / 10) * 20}px, ${Math.cos(frame / 14) * 20}px)`,
            pointerEvents: "none",
          }}
        />

        {/* Layer 2: Foreground subject (code-generated SVG "subject" with boil) */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${fgScale}) translate(${boilX}px, ${boilY}px)`,
            transformOrigin: "center",
            width: 600,
            height: 600,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <svg
            width={600}
            height={600}
            viewBox="0 0 600 600"
            style={{ filter: "drop-shadow(0 20px 40px rgba(56,189,248,0.4))" }}
          >
            {/* Outer ring rotating */}
            <circle
              cx={300}
              cy={300}
              r={280}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={4}
              strokeDasharray="100 50"
              transform={`rotate(${orbitAngle} 300 300)`}
              opacity={0.6}
            />
            {/* Inner ring counter-rotating */}
            <circle
              cx={300}
              cy={300}
              r={200}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth={3}
              strokeDasharray="80 40"
              transform={`rotate(${-orbitAngle * 0.7} 300 300)`}
              opacity={0.5}
            />
            {/* Center pulsing sun */}
            <circle
              cx={300}
              cy={300}
              r={80 * pulseScale}
              fill="#38bdf8"
              opacity={0.9}
            >
              <animate
                attributeName="r"
                values="60;100;60"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            {/* Particle dots orbiting */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const angle = (frame * 3 + i * 60) % 360
              const rad = (angle * Math.PI) / 180
              const px = 300 + Math.cos(rad) * 220
              const py = 300 + Math.sin(rad) * 220
              return (
                <circle
                  key={i}
                  cx={px}
                  cy={py}
                  r={8}
                  fill="#ffffff"
                  opacity={0.8}
                />
              )
            })}
          </svg>
        </div>

        {/* Layer 3: Film texture sandwich */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px)",
            backgroundSize: "100% 4px",
            opacity: 0.15,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle, transparent 45%, rgba(0,0,0,0.85) 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translate(${gateWeaveX}px, ${gateWeaveY}px)`,
            pointerEvents: "none",
          }}
        />

        {/* Layer 4: Typography mask */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              overflow: "hidden",
              height: 140,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                transform: `translateY(${textY}px)`,
                opacity: interpolate(textEntrance, [0, 1], [0, 1], CLAMP),
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: "1px solid rgba(56, 189, 248, 0.4)",
                  backgroundColor: "rgba(56, 189, 248, 0.15)",
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: "0.2em",
                  color: "#38bdf8",
                  textTransform: "uppercase",
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: "#38bdf8",
                    boxShadow: `0 0 ${8 + Math.abs(Math.sin(frame / 5)) * 6}px #38bdf8`,
                    animation: "pulse 1.5s infinite",
                  }}
                />
                {niche.toUpperCase()}
              </div>

              <h1
                style={{
                  transform: `scale(${titleScale})`,
                  transformOrigin: "center",
                  fontSize: 64,
                  fontWeight: 900,
                  letterSpacing: `${textTracking}px`,
                  color: "#ffffff",
                  textAlign: "center",
                  lineHeight: 1.1,
                  margin: 0,
                  background:
                    "linear-gradient(180deg, #ffffff 30%, #94a3b8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {headlineText}
              </h1>
              <h1
                style={{
                  transform: `scale(${titleScale})`,
                  transformOrigin: "center",
                  fontSize: 64,
                  fontWeight: 900,
                  letterSpacing: `${textTracking}px`,
                  color: "#ffffff",
                  textAlign: "center",
                  lineHeight: 1.1,
                  margin: 0,
                  background:
                    "linear-gradient(180deg, #ffffff 30%, #94a3b8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {subtitleText}
              </h1>
            </div>
          </div>
          <p
            style={{
              opacity: interpolate(textEntrance, [0, 1], [0, 1], CLAMP),
              transform: `translateY(${textY}px)`,
              fontSize: 20,
              color: "#94a3b8",
              maxWidth: 700,
              textAlign: "center",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {descText.slice(0, 140)}
          </p>
        </div>
      </div>

      {/* Layer 5: Progress bar at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: "10%",
          right: "10%",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
            color: "#94a3b8",
            fontFamily: "monospace",
          }}
        >
          <span>CLUSTER_NODE_04 // HEADLESS</span>
          <span>PROGRESS: {Math.floor(progress)}%</span>
        </div>
        <div
          style={{
            position: "relative",
            height: 8,
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${progress}%`,
              borderRadius: 999,
              background:
                "linear-gradient(90deg, #38bdf8, #8b5cf6)",
              boxShadow: `0 0 ${20 + Math.sin(frame / 6) * 10}px rgba(56,189,248,0.6)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${progress}%`,
              width: 14,
              height: 14,
              marginLeft: -7,
              marginTop: -7,
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              boxShadow: "0 0 16px rgba(255,255,255,0.8)",
              opacity: interpolate(progress, [0, 5, 95, 100], [0, 1, 1, 0], CLAMP),
            }}
          />
        </div>
      </div>

      {/* Voiceover audio */}
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  )
}

export default ViralDocumentaryEngine
