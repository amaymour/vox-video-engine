import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion"
import { theme } from "../lib/theme"

/**
 * Static locked background layer.
 *
 * A single continuous "map canvas" runs underneath the whole scene sequence
 * (one cinematic shot): a dark slate field, a fine dot grid, abstract
 * continents / contour arcs, accent glows and a vignette. A very slow
 * Ken-Burns drift keeps it alive without ever cutting.
 */
export const Background = () => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const p = durationInFrames > 1 ? frame / (durationInFrames - 1) : 0

  const scale = interpolate(p, [0, 1], [1.06, 1.14])
  const driftX = interpolate(p, [0, 1], [-24, 24])
  const driftY = interpolate(p, [0, 1], [10, -18])

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translate(${driftX}px, ${driftY}px)`,
        }}
      >
        {/* Fine dot grid */}
        <AbsoluteFill
          style={{
            backgroundImage:
              "radial-gradient(rgba(148,163,184,0.16) 1.3px, transparent 1.5px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* Accent glows */}
        <div
          style={{
            position: "absolute",
            left: "-10%",
            top: "-16%",
            width: 980,
            height: 980,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.20), transparent 62%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "-14%",
            bottom: "-20%",
            width: 1080,
            height: 1080,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(225,29,42,0.15), transparent 62%)",
          }}
        />

        {/* Abstract map canvas */}
        <svg
          width="1920"
          height="1080"
          viewBox="0 0 1920 1080"
          style={{ position: "absolute", inset: 0, opacity: 0.6 }}
        >
          <g
            fill="rgba(148,163,184,0.06)"
            stroke="rgba(148,163,184,0.22)"
            strokeWidth="2"
          >
            <path d="M180 300 q120 -110 300 -60 t250 70 q110 90 -40 170 t-330 30 q-190 -70 -180 -210 z" />
            <path d="M760 220 q150 -70 260 -10 t150 120 q40 120 -120 160 t-260 -20 q-90 -120 -30 -250 z" />
            <path d="M1240 640 q140 -90 320 -40 t180 160 q-10 120 -220 150 t-300 -60 q-80 -110 20 -210 z" />
            <path d="M420 700 q120 -60 230 10 t90 170 q-60 110 -230 90 t-170 -140 q20 -90 80 -130 z" />
            <path d="M1480 260 q110 -50 200 0 t70 130 q-50 100 -190 90 t-130 -120 q10 -70 50 -100 z" />
          </g>
          <g
            fill="none"
            stroke="rgba(225,29,42,0.35)"
            strokeWidth="2.5"
            strokeDasharray="6 10"
          >
            <circle cx="1180" cy="420" r="40" />
            <circle cx="1180" cy="420" r="90" />
            <circle cx="1180" cy="420" r="150" />
          </g>
          <g fill="rgba(99,102,241,0.55)">
            <circle cx="700" cy="360" r="6" />
            <circle cx="1180" cy="420" r="7" />
            <circle cx="1490" cy="300" r="5" />
            <circle cx="560" cy="780" r="5" />
            <circle cx="1330" cy="740" r="6" />
          </g>
        </svg>
      </AbsoluteFill>

      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 42%, rgba(0,0,0,0.62) 100%)",
        }}
      />
    </AbsoluteFill>
  )
}
