import React from "react";
import { useCurrentFrame, useVideoConfig, AbsoluteFill, getInputProps, Font } from "remotion";
import { Video } from "../player/items/video";
import Image from "../player/items/image";
import Caption from "../player/items/caption";
import Audio from "../player/items/audio";
import { RemotionSRTCaption, RemotionSRTWordLevelCaption } from "./srt-caption";
import { SRTSubtitle, parseSRT } from "@/utils/srt-parser";
import { IDesign } from "@designcombo/types";

interface RenderCompositionProps {
  design?: any;
}

const RenderComposition: React.FC<RenderCompositionProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  // Get input props from Remotion
  const inputProps = getInputProps();
  const design = inputProps.design as IDesign;

  // Debug logging
  console.log("RenderComposition received props:", {
    hasDesign: !!design,
    designKeys: design ? Object.keys(design) : [],
    trackItemIds: design?.trackItemIds,
    frame,
    fps
  });

  if (!design) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#000000" }}>
        <div style={{ color: "white", fontSize: 48, textAlign: "center", marginTop: "50%" }}>
          No design data provided
        </div>
      </AbsoluteFill>
    );
  }

  const {
    trackItemIds = [],
    trackItemsMap = {},
    background = { type: "color", value: "#000000" },
  } = design;

  // Get all track items
  const trackItems = trackItemIds
    .map((id: string) => trackItemsMap[id])
    .filter((item: any) => item);

  if (trackItems.length === 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#ff0000" }}>
        <div style={{ color: "white", fontSize: 48, textAlign: "center", marginTop: "50%" }}>
          No track items found
        </div>
      </AbsoluteFill>
    );
  }

  // Collect all unique fonts from caption items for injection
  const captionItems = trackItems.filter((item: any) => item.type === 'caption');
  
  const fontsToLoad = captionItems
    .map((item: any) => ({
      fontFamily: item.details?.fontFamily,
      fontUrl: item.details?.fontUrl,
    }))
    .filter((f: any) => f.fontFamily && f.fontUrl)
    .reduce((acc: any[], curr: any) => {
      // Deduplicate fonts
      if (!acc.find(f => f.fontFamily === curr.fontFamily)) {
        acc.push(curr);
      }
      return acc;
    }, []);

  // Create CSS font-face rules
  const fontFaceCSS = fontsToLoad
    .map((font: any) => `
      @font-face {
        font-family: '${font.fontFamily}';
        src: url('${font.fontUrl}') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    `)
    .join('');

  const bgColor = background.type === "color" ? background.value : "#000000";

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor }}>
      {/* Inject font-face styles */}
      {fontFaceCSS && (
        <style dangerouslySetInnerHTML={{ __html: fontFaceCSS }} />
      )}
      {trackItems.map((item: any) => {
        console.log("Rendering item:", item.id, "type:", item.type, "animations:", item.animations);
        
        // Render different item types
        switch (item.type) {
          case "video":
            return (
              <Video
                key={item.id}
                item={item}
                options={{
                  fps,
                  frame,
                  size: { width, height }
                }}
              />
            );
          case "image":
            return (
              <Image
                key={item.id}
                item={item}
                options={{
                  fps,
                  frame,
                  size: { width, height }
                }}
              />
            );
          case "caption":
            // Use the standard Caption component for ALL captions (including SRT)
            // The Caption component already handles SRT styling via isSRTPaired
            return (
              <Caption
                key={item.id}
                item={item}
                options={{
                  fps,
                  frame,
                  size: { width, height }
                }}
              />
            );
          case "audio":
            return (
              <Audio
                key={item.id}
                item={item}
                options={{
                  fps,
                  frame,
                  size: { width, height }
                }}
              />
            );
          default:
            console.log("Skipping unsupported item type:", item.type);
            return null;
        }
      })}
    </AbsoluteFill>
  );
};

export default RenderComposition;
