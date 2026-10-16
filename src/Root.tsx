import { Composition as RemotionComposition } from "remotion"
import KineticPromoCard from "./KineticPromoCard"

export const Root = () => (
  <>
    <RemotionComposition
      id="KineticPromo"
      component={KineticPromoCard}
      width={1920}
      height={1080}
      fps={60}
      durationInFrames={300}
    />
  </>
)
