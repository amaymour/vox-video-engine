import type { CSSProperties } from "react"

export const theme = {
  bg: "#0B0F19",
  panel: "rgba(11,15,25,0.8)",
  red: "#e11d2a",
  indigo: "#6366f1",
  cyan: "#38bdf8", // glow color rgba(56,189,248,...)
  paper: "#f8fafc",
  muted: "#94a3b8",
  line: "rgba(255,255,255,0.05)",
} as const

export const FONT_FAMILY =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'

/**
 * Layer 4 — SSS-Grade Tailwind Aesthetic Injector.
 *
 * Real-time moving drop-shadow highlight used on hero cards, metric panels
 * and simulated dashboard widgets.
 */
export const glowStyle: CSSProperties = {
  boxShadow: "0 0 50px -12px rgba(56,189,248,0.3)",
}

/**
 * Layer 4 — Card architecture: sharp outer border + deep internal padding,
 * mixed-opacity dark-mode panel with backdrop blur. Rendered as a style
 * object (Tailwind classes are not processed inside the Remotion render
 * bundle, so inline styles are the reliable path for cloud rendering).
 */
export const cardStyle: CSSProperties = {
  backgroundColor: theme.panel,
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: `1px solid ${theme.line}`,
  borderRadius: "1.5rem",
  padding: "2.5rem",
}

/** Deep vignette shadow behind hero cards. */
export const cardDeepShadow: CSSProperties = {
  boxShadow: "0 40px 80px -20px rgba(0,0,0,0.6)",
}
