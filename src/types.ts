export interface CharacterSpec {
  /** Path relative to public/, e.g. "characters/host.svg". */
  src: string
  /** Horizontal canvas position, 0..1. */
  x: number
  /** Vertical canvas position, 0..1. */
  y: number
  /** Size multiplier, 0.5..1.6. */
  scale: number
  /** Mirror horizontally. */
  flip?: boolean
}

export type AssetKind = "stat" | "bars" | "line" | "flag"

export interface AssetSpec {
  kind: AssetKind
  label: string
  x: number
  y: number
  /** For kind "stat": 0..1. */
  value?: number
  /** For kinds "bars" | "line". */
  values?: number[]
}

export type SfxName = "whoosh" | "pop" | "ding"

export interface SceneSpec {
  kind: string
  kicker: string
  headline: string
  subline: string
  narration: string
  characters: CharacterSpec[]
  assets: AssetSpec[]
  sfx: SfxName
  /** Relative narration length, used to distribute scene timing. */
  weight: number
}

export interface VoxProps {
  niche?: string
  title?: string
  /** File in public/, e.g. "voiceover.mp3"; null when TTS failed. */
  audio?: string | null
  narration?: string
  trends_count?: number
  scenes?: SceneSpec[]
}
