import type { CSSProperties } from "react"
import {
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion"
import { springIn } from "../lib/anim"
import { FONT_FAMILY, theme } from "../lib/theme"
import type { AssetSpec } from "../types"

const panel: CSSProperties = {
  background: theme.panel,
  border: `1px solid ${theme.line}`,
  borderRadius: 16,
  padding: "20px 24px",
  boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
  fontFamily: FONT_FAMILY,
}

const labelStyle: CSSProperties = {
  fontSize: 20,
  letterSpacing: 3,
  textTransform: "uppercase",
  color: theme.muted,
  fontWeight: 700,
}

/**
 * Foreground pop-up asset layer: structures, data trends and drawing charts.
 * These spring onto the frame *first* (baseDelay 0) so the midground
 * characters can stagger in afterwards.
 */
export const ForegroundAssets = ({
  assets,
  baseDelay,
}: {
  assets: AssetSpec[]
  baseDelay: number
}) => (
  <>
    {assets.map((asset, i) => (
      <ForegroundAsset key={i} asset={asset} delay={baseDelay + i * 6} />
    ))}
  </>
)

const ForegroundAsset = ({
  asset,
  delay,
}: {
  asset: AssetSpec
  delay: number
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = springIn(frame, fps, delay)
  const opacity = interpolate(frame, [delay, delay + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  const wrap: CSSProperties = {
    position: "absolute",
    left: `${asset.x * 100}%`,
    top: `${asset.y * 100}%`,
    transform: `translate(-50%, -50%) scale(${interpolate(s, [0, 1], [0.86, 1])})`,
    opacity,
  }

  if (asset.kind === "stat") {
    const value = asset.value ?? 0.7
    return (
      <div style={wrap}>
        <div
          style={{
            ...panel,
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
            <span style={{ color: theme.red }}>%</span>
          </div>
          <div style={{ ...labelStyle, marginTop: 8 }}>{asset.label}</div>
        </div>
      </div>
    )
  }

  if (asset.kind === "bars") {
    const values = asset.values ?? [0.4, 0.7, 0.55, 0.85]
    const peak = values.indexOf(Math.max(...values))
    return (
      <div style={wrap}>
        <div style={panel}>
          <div style={labelStyle}>{asset.label}</div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 12,
              height: 200,
              marginTop: 14,
            }}
          >
            {values.map((value, i) => {
              const barScale = springIn(frame, fps, delay + 6 + i * 4)
              return (
                <div
                  key={i}
                  style={{
                    width: 44,
                    height: Math.max(6, 190 * value * barScale),
                    background: i === peak ? theme.red : theme.indigo,
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
    const revealed = Math.floor((values.length - 1) * s) + 1
    return (
      <div style={wrap}>
        <div style={panel}>
          <div style={labelStyle}>{asset.label}</div>
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

  // flag
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
          ...panel,
          padding: "14px 22px",
          transform: `scaleX(${Math.max(0.05, s)})`,
          transformOrigin: "left center",
        }}
      >
        <span style={{ fontSize: 28, fontWeight: 800, color: theme.paper }}>
          {asset.label}
        </span>
      </div>
    </div>
  )
}
