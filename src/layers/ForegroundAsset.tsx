import type { CSSProperties } from "react"
import { interpolate } from "remotion"
import { springFast } from "../lib/anim"
import { cardStyle, glowStyle, FONT_FAMILY, theme } from "../lib/theme"
import type { AssetSpec } from "../types"

/**
 * Layer 4 — Foreground Pop-Up Asset Layer.
 *
 * Dynamic structures, data trends and drawing charts that spring onto the
 * frame *first* so midground actors can stagger afterwards.
 *
 * Screen simulation requirement: elements at index `i` stagger entrance using
 * `delay: i * 3` frames inside the interpolation array.
 *
 * Card architecture: `bg-[#0B0F19]/80 backdrop-blur-xl border border-white/5`
 * with sharp outer borders and deep internal padding.
 * Glow: `shadow-[0_0_50px_-12px_rgba(56,189,248,0.3)]`.
 */
export const ForegroundAssets = ({
  assets,
  frame,
  fps,
  baseDelay = 0,
}: {
  assets: AssetSpec[]
  frame: number
  fps: number
  baseDelay?: number
}) => {
  const TRANSITION_FRAMES = 30

  return (
    <>
      {assets.map((asset, i) => {
        // Layer 4 — staggered screen simulation: delay: i * 3 frames
        const staggerDelay = baseDelay + i * 3
        const s = springFast(frame, fps, staggerDelay)

        const opacity = interpolate(
          frame,
          [staggerDelay, staggerDelay + TRANSITION_FRAMES],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
        const liftY = interpolate(
          frame,
          [staggerDelay, staggerDelay + TRANSITION_FRAMES],
          [40, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )

        const wrap: CSSProperties = {
          position: "absolute",
          left: `${asset.x * 100}%`,
          top: `${asset.y * 100}%`,
          transform: `translate(-50%, calc(-50% + ${liftY * (1 - s)}px)) scale(${0.9 + 0.1 * s})`,
          opacity,
        }

        const panelStyle: CSSProperties = {
          ...cardStyle,
          ...glowStyle,
          fontFamily: FONT_FAMILY,
          minWidth: 320,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }

        if (asset.kind === "stat") {
          const value = asset.value ?? 0.7
          return (
            <div style={wrap}>
              <div
                style={{
                  ...cardStyle,
                  borderLeft: `7px solid ${theme.red}`,
                  minWidth: 320,
                }}
              >
                <div
                  style={{
                    fontSize: 84,
                    fontWeight: 900,
                    color: theme.paper,
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {Math.round(value * 100 * Math.min(1, s))}
                  <span style={{ color: theme.red }}>=</span>
                </div>
                <div
                  style={{
                    fontSize: 20,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    color: theme.muted,
                    fontWeight: 700,
                  }}
                >
                  {asset.label}
                </div>
              </div>
            </div>
          )
        }

        if (asset.kind === "bars") {
          const values = asset.values ?? [0.4, 0.7, 0.55, 0.85]
          const peak = values.indexOf(Math.max(...values))
          return (
            <div style={wrap}>
              <div style={panelStyle}>
                <div
                  style={{
                    fontSize: 20,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    color: theme.muted,
                    fontWeight: 700,
                  }}
                >
                  {asset.label}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 12,
                    height: 200,
                    marginTop: 10,
                  }}
                >
                  {values.map((value, v) => {
                    const barS = springFast(frame, fps, staggerDelay + 4 + v * 4)
                    return (
                      <div
                        key={v}
                        style={{
                          width: 44,
                          height: Math.max(6, 190 * value * barS),
                          background: v === peak ? theme.red : theme.indigo,
                          borderRadius: 7,
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          )
        }

        if (asset.kind === "line") {
          const values = asset.values ?? [0.2, 0.45, 0.35, 0.6, 0.5, 0.85]
          const w = 360
          const h = 220
          const pad = 26
          const points = values.map((value, i) => [
            pad + (i / Math.max(1, values.length - 1)) * (w - 2 * pad),
            h - pad - value * (h - 2 * pad),
          ])
          const d = points
            .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
            .join(" ")
          const revealed = Math.min(values.length, Math.floor((values.length - 1) * s) + 1)

          return (
            <div style={wrap}>
              <div style={panelStyle}>
                <div
                  style={{
                    fontSize: 20,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    color: theme.muted,
                    fontWeight: 700,
                  }}
                >
                  {asset.label}
                </div>
                <svg width={w} height={h} style={{ display: "block", marginTop: 8 }}>
                  <path
                    d={d}
                    fill="none"
                    stroke={theme.indigo}
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={1400}
                    strokeDashoffset={1400 * (1 - Math.min(1, s))}
                  />
                  {points.map((p, i) => (
                    <circle
                      key={i}
                      cx={p[0]}
                      cy={p[1]}
                      r={7}
                      fill={theme.red}
                      opacity={i < revealed ? 1 : 0}
                    />
                  ))}
                </svg>
              </div>
            </div>
          )
        }

        // flag — prestige badge with glow
        const grow = Math.min(1, s * 1.15)
        return (
          <div style={{ ...wrap, display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 12,
                height: Math.max(8, 116 * grow),
                background: theme.red,
                borderRadius: 6,
                boxShadow: "0 0 24px rgba(225,29,42,0.5)",
              }}
            />
            <div
              style={{
                ...cardStyle,
                ...glowStyle,
                padding: "14px 22px",
                transform: `scaleX(${Math.max(0.05, s)})`,
                transformOrigin: "left center",
              }}
            >
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: theme.paper,
                  ...glowStyle,
                }}
              >
                {asset.label}
              </span>
            </div>
          </div>
        )
      })}
    </>
  )
}
