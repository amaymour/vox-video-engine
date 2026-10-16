import { Composition as RemotionComposition } from "remotion"
import ViralDocumentaryEngine from "./ViralDocumentaryEngine"

export const Root = () => (
  <>
    <RemotionComposition
      id="ViralDocumentary"
      component={ViralDocumentaryEngine}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={150}
    />
  </>
)
