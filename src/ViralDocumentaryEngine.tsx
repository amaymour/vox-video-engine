import React from "react"
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion"

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const

export const ViralDocumentaryEngine: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Layer 1: Cinematic parallax background
  const bgScale = interpolate(frame, [0, 150], [1, 1.08], CLAMP)
  const bgDriftX = Math.sin(frame / 20) * 8

  // Layer 2: Foreground subject & character boil math
  const fgScale = interpolate(frame, [0, 150], [1, 1.15], CLAMP)
  const boilX = frame % 3 === 0 ? Math.sin(frame) * 1.5 : 0
  const boilY = frame % 3 === 0 ? Math.cos(frame) * 1.5 : 0

  // Layer 3: Gate weave (analog film jitter)
  const gateWeaveX = Math.sin(frame / 7) * 2
  const gateWeaveY = Math.cos(frame / 11) * 2

  // Layer 4: Kinetic typography mask
  const textEntrance = spring({
    frame,
    fps,
    config: { mass: 0.4, damping: 12, stiffness: 130 },
    delay: 15,
  })
  const textY = interpolate(textEntrance, [0, 1], [60, 0], CLAMP)
  const textTracking = interpolate(frame, [0, 150], [4, 0], CLAMP)

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* Layer 1: Cinematic parallax background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${bgScale}) translateX(${bgDriftX}px)`,
          transformOrigin: "center",
          background:
            "radial-gradient(circle at 50% 50%, #1a1a2e 0%, #000000 100%)",
        }}
      />

      {/* Layer 2: Foreground subject & character boil */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${fgScale}) translate(${boilX}px, ${boilY}px)`,
          transformOrigin: "center",
          background:
            "radial-gradient(circle at 40% 40%, #2a2a4e 0%, #0a0a0a 100%)",
          opacity: 0.85,
        }}
      />

      {/* Layer 3: Cinematic film texture sandwich */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.12) 1px, transparent 1px)",
          backgroundSize: "100% 4px",
          opacity: 0.12,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle, transparent 45%, rgba(0,0,0,0.9) 100%)",
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

      {/* Layer 4: Kinetic typography mask */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            overflow: "hidden",
            height: 120,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              transform: `translateY(${textY}px)`,
              opacity: interpolate(textEntrance, [0, 1], [0, 1], CLAMP),
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <h1
              style={{
                fontSize: 56,
                fontWeight: 800,
                letterSpacing: `${textTracking}px`,
                color: "#ffffff",
                textAlign: "center",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              VIRAL DOCUMENTARY
            </h1>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 400,
                letterSpacing: `${textTracking}px`,
                color: "#bbbbbb",
                textAlign: "center",
                lineHeight: 1.4,
                marginTop: 16,
                margin: 0,
              }}
            >
              Cinematic vertical storytelling rendered on zero-cost cloud runners.
            </h2>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

export default ViralDocumentaryEngine
