import { Composition, staticFile } from "remotion"
import { getAudioDurationInSeconds } from "@remotion/media-utils"
import { VoxVideo } from "./Composition"
import type { VoxProps } from "./types"

export const FPS = 30
const MIN_SECONDS = 14
const TAIL_SECONDS = 1.4

const narrationOf = (props: VoxProps): string =>
  props.narration ??
  (props.scenes ?? []).map((scene) => scene.narration).join(" ")

/** Word-count fallback used when the TTS audio is missing or unreadable. */
const estimateSeconds = (props: VoxProps): number => {
  const words = narrationOf(props).split(/\s+/).filter(Boolean).length
  const scenes = Math.max(1, props.scenes?.length ?? 1)
  return Math.max(MIN_SECONDS, words / 2.6 + 1.0 + scenes * 0.7)
}

/**
 * Runs in the browser at render time (and in the Studio). Measures the real
 * edge-tts voiceover so the clip length always fits the narration; scene
 * timings are distributed by narration weight in the composition, so they stay
 * correct no matter how many frames this returns.
 */
const calculateMetadata = async ({ props }: { props: VoxProps }) => {
  let seconds = estimateSeconds(props)
  if (props.audio) {
    try {
      const duration = await getAudioDurationInSeconds(staticFile(props.audio))
      if (Number.isFinite(duration) && duration > 1) {
        seconds = duration + TAIL_SECONDS
      }
    } catch {
      // keep the word-count estimate
    }
  }
  return { durationInFrames: Math.ceil(seconds * FPS) }
}

export const Root = () => (
  <Composition
    id="VoxVideo"
    component={VoxVideo}
    durationInFrames={Math.ceil(MIN_SECONDS * FPS)}
    fps={FPS}
    width={1920}
    height={1080}
    calculateMetadata={calculateMetadata}
    // Render-time props are injected with --props=data/scene.json in CI.
    // (The flag is --props, not --props-file.)
  />
)
