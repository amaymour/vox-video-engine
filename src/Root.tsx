import { Composition as RemotionComposition } from "remotion"
import ViralDocumentaryEngine from "./ViralDocumentaryEngine"
import KineticPromoCard from "./KineticPromoCard"
import NicheExplainer from "./NicheExplainer"

export const Root = () => (
  <>
    <RemotionComposition
      id="ViralDocumentary"
      component={ViralDocumentaryEngine}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={1800}
    />
    <RemotionComposition
      id="KineticPromo"
      component={KineticPromoCard}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={1800}
    />
    <RemotionComposition
      id="NicheExplainer"
      component={NicheExplainer}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={1800}
    />
  </>
)
