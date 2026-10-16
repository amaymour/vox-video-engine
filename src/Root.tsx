import { Composition as RemotionComposition, staticFile } from "remotion"
import { getAudioDurationInSeconds } from "@remotion/media-utils"
import { VoxVideo } from "./Composition"
import type { VoxProps } from "./types"

const FPS = 30
const MIN_SECONDS = 14
const TAIL_SECONDS = 1.4

const narrationOf = (props: VoxProps): string =>
  props.narration ??
  (props.scenes ?? []).map((scene) => scene.narration).join(" ")

const estimateSeconds = (props: VoxProps): number => {
  const words = narrationOf(props).split(/\s+/).filter(Boolean).length
  const scenes = Math.max(1, props.scenes?.length ?? 1)
  return Math.max(MIN_SECONDS, words / 2.6 + 1.0 + scenes * 0.7)
}

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
  <RemotionComposition
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
