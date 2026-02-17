import { Composition, registerRoot } from "remotion";
import RenderComposition from "./render-composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MainComposition"
        component={RenderComposition}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          design: null,
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
