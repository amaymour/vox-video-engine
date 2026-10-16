import { Composition as RemotionComposition } from "remotion"
import KineticPromoCard from "./KineticPromoCard"
import { MotionTest } from "./MotionTest"

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
    <RemotionComposition
      id="MotionTest"
      component={MotionTest}
      width={200}
      height={200}
      fps={30}
      durationInFrames={90}
    />
  </>
)
