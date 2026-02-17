/*
* SRT Caption Synchronization Fix - Time Calculation Approach
*
* For SRT captions, the timing follows these rules:
* 1. Global frame comes from the timeline/preview engine
* 2. Words start from 0 (relative to audio track timing) 
* 3. Timeline position is captured via offsetFrom = display.from
* 4. Actual timeline time for word = timeline position + relative word timing
*
* Formula: actual_activation_time = display.from + word.start_time
*/

import { ICaption } from "@designcombo/types";
import { BaseSequence, SequenceItemOptions } from "../base-sequence";
import { BoxAnim, ContentAnim } from "@designcombo/animations";
import { calculateContainerStyles, calculateTextStyles } from "../styles";
import { getAnimations } from "../../utils/get-animations";
import { calculateFrames } from "../../utils/frames";
import { CaptionWord } from "./caption-word";
import {
  TranslateAnimationCaption,
  TranslateOnceAnimation,
  ScaleAnimationCaption,
  ScaleAnimationBetween,
  ScalePulseAnimationCaption,
  ScaleAnimationLoop,
  OpacityAnimationCaption,
  ANIMATION_CONFIGS,
  captionRotationCache,
  rotationOptions,
  AnimationConfig
} from "./caption-animations";

export default function Caption({
  item,
  options
}: {
  item: ICaption;
  options: SequenceItemOptions;
}) {
  const { fps, frame } = options;
  const { details, display, animations } = item as ICaption;
  const { animationIn, animationOut, animationTimed } = getAnimations(
    animations!,
    item,
    frame,
    fps
  );
  const { from, durationInFrames } = calculateFrames(item.display, fps);
  const [firstWord] = details.words;
  // Always use global frame time
  const globalFrame = frame || 0;
  
  // For offset calculation: use display.from for positioning on timeline
  const offsetFrom = display.from;
  
  // Calculate currentFrame for animations (adjust frame for animations while keeping timing sync correct)
  const animationFrame = (frame || 0) - (item.display.from * fps) / 1000;
  
  // Calculate scale factor and update details
  const updatedDetails = calculateUpdatedDetails(details);
  const scaleFactor = updatedDetails.scaleFactor;

  // Calculate animation transforms
  const { transformStyles, globalOpacity, extraStyles } =
    calculateAnimationTransforms(updatedDetails, frame || 0, from, fps, item);

  const { height, width, ...filteredStyles } =
    calculateContainerStyles(updatedDetails);

  const children = (
    <BoxAnim
      style={{
        ...filteredStyles,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        maxHeight: "max-content",
        height: "100%",
        width: "auto"
      }}
      animationIn={animationIn}
      animationOut={animationOut}
      frame={animationFrame}
      durationInFrames={durationInFrames}

    >
      <ContentAnim
        animationTimed={animationTimed}
        durationInFrames={durationInFrames}
        frame={animationFrame}
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div
          id={`caption-${item.id}`}
          style={{
            ...calculateTextStyles(updatedDetails),
            ...transformStyles,
            ...extraStyles,
            transition: "transform 0.2s ease",
            borderRadius: "16px",
            display: (frame || 0) >= (item.display.from * fps) / 1000 && (frame || 0) <= (item.display.to * fps) / 1000 ? "block" : "none", // Show caption when within its time range
            maxWidth: "100%",
            maxHeight: "max-content",
            height: "100%",
            padding: "8px",
            // Handle SRT-specific background styling
            ...(updatedDetails.isSRTPaired && {
              backgroundColor: updatedDetails.backgroundColor || 'rgba(0, 0, 0, 0.8)',
              opacity: (updatedDetails.backgroundOpacity !== undefined ? updatedDetails.backgroundOpacity / 100 : 1)
            }),
            // Ensure proper text color contrast for SRT captions
            ...(updatedDetails.isSRTPaired && {
              color: updatedDetails.color || '#ffffff'
            })
          }}
        >
          {renderWords(
            item,
            updatedDetails,
            scaleFactor,
            offsetFrom,
            fps,
            globalFrame,
            globalOpacity
          )}
        </div>
      </ContentAnim>
    </BoxAnim>
  );

  return BaseSequence({ item, options, children });
}

// Helper functions
function calculateUpdatedDetails(details: any) {
  const baseFontSize = 20;
  const fontSize = details.fontSize || baseFontSize;
  const scaleFactor = fontSize / baseFontSize;

  let strokeWidth = details.WebkitTextStrokeWidth ?? "0px";
  if (typeof strokeWidth === "string" && strokeWidth.endsWith("px")) {
    strokeWidth = parseFloat(strokeWidth) * scaleFactor + "px";
  }

  let borderWidth = details.borderWidth ?? 0;
  if (typeof borderWidth === "number") {
    borderWidth = borderWidth * scaleFactor;
  }

  const boxShadow = details.boxShadow || {
    x: 0,
    y: 0,
    blur: 0,
    color: "#000000"
  };

  const scaledBoxShadow = {
    ...boxShadow,
    x: boxShadow.x * scaleFactor,
    y: boxShadow.y * scaleFactor,
    blur: boxShadow.blur * scaleFactor
  };

  // Handle SRT-specific styling - textColor from SRT settings vs color from regular caption
  // SRT settings saves to textColor, but Caption expects color
  const textColor = details.color || details.textColor || "#FFFFFF";
  const bgColor = details.backgroundColor || "rgba(0, 0, 0, 0.8)";

  return {
    ...details,
    WebkitTextStrokeWidth: strokeWidth,
    boxShadow: scaledBoxShadow,
    borderWidth,
    scaleFactor,
    // Override color properties for SRT captions to ensure they work
    color: textColor,
    textColor: textColor,
    backgroundColor: bgColor,
    // Ensure proper positioning for SRT captions
    top: details.top || 814,
    left: details.left || 161
  };
}

function calculateAnimationTransforms(
  updatedDetails: any,
  frame: number,
  from: number,
  fps: number,
  item: ICaption
) {
  const relativeFrame = Math.max(frame - from, 0);
  let transformValues: {
    translateX?: number;
    translateY?: number;
    scale?: number;
    opacity?: number;
    rotate?: number;
  } = {};

  let globalOpacity: number | undefined;
  let extraStyles: React.CSSProperties = {};

  if (updatedDetails?.animation) {
    const config = ANIMATION_CONFIGS[updatedDetails.animation] || {};
    const userConfig = parseUserAnimationConfig(updatedDetails.animation);

    // Apply scale animation
    if (config.scale || userConfig.scale) {
      const scaleConfig = userConfig.scale ?? config.scale;
      if (scaleConfig) {
        transformValues.scale = ScaleAnimationCaption(
          relativeFrame,
          item.display.to,
          fps,
          scaleConfig.value,
          scaleConfig.mode
        );
      }
    }

    // Apply translate animation
    if (config.translate || userConfig.translate) {
      const translateConfig = userConfig.translate ?? config.translate;
      const translation = TranslateAnimationCaption(
        relativeFrame,
        translateConfig
      );
      transformValues = { ...transformValues, ...translation };
    }

    // Apply opacity animation
    if (config.opacity || userConfig.opacity) {
      const opacityConfig = userConfig.opacity ?? config.opacity;
      transformValues.opacity = OpacityAnimationCaption(
        relativeFrame,
        item.display.to,
        fps,
        opacityConfig
      );
    }

    // Apply scale pulse animation
    if (config.scalePulse || userConfig.scalePulse) {
      transformValues.scale = ScalePulseAnimationCaption(
        relativeFrame,
        item.display.to,
        fps
      );
    }

    // Apply scale loop animation
    if (config.scaleAnimationLoop || userConfig.scaleAnimationLoop) {
      transformValues.scale = ScaleAnimationLoop(relativeFrame);
    }

    // Apply scale between animation
    if (config.scaleAnimationBetween || userConfig.scaleAnimationBetween) {
      transformValues.scale = ScaleAnimationBetween(
        relativeFrame,
        item.display.to,
        fps,
        50,
        0.8,
        1
      );
    }

    // Apply translate once animation
    if (config.translateOnceAnimation || userConfig.translateOnceAnimation) {
      const translateOnceConfig =
        userConfig.translateOnceAnimation ?? config.translateOnceAnimation;
      if (translateOnceConfig) {
        const { duration = 30, orientation = "horizontal" } =
          translateOnceConfig;
        transformValues = {
          ...transformValues,
          ...TranslateOnceAnimation(relativeFrame, duration, orientation)
        };
      }
    }

    // Apply rotation animations
    if (config.rotateRandom || userConfig.rotateRandom) {
      const captionId = item.id;
      if (!captionRotationCache.has(captionId)) {
        const randomRotation =
          rotationOptions[Math.floor(Math.random() * rotationOptions.length)];
        captionRotationCache.set(captionId, randomRotation);
      }
      transformValues.rotate = captionRotationCache.get(captionId)!;
    }

    if (
      config.rotateFixed !== undefined ||
      userConfig.rotateFixed !== undefined
    ) {
      transformValues.rotate = userConfig.rotateFixed ?? config.rotateFixed;
    }

    // Apply global opacity
    if (
      config.globalOpacity !== undefined ||
      userConfig.globalOpacity !== undefined
    ) {
      const globalOpacityConfig =
        userConfig.globalOpacity ?? config.globalOpacity;
      globalOpacity = OpacityAnimationCaption(
        relativeFrame,
        item.display.to,
        fps,
        globalOpacityConfig
      );
    }

    // Apply extra styles
    if (config.extraStyles || userConfig.extraStyles) {
      extraStyles = {
        ...extraStyles,
        ...(userConfig.extraStyles ?? config.extraStyles)
      };
    }
  }

  // Build transform styles
  const transformParts: string[] = [];

  if (
    transformValues.translateX !== undefined ||
    transformValues.translateY !== undefined
  ) {
    const x = transformValues.translateX ?? 0;
    const y = transformValues.translateY ?? 0;
    transformParts.push(`translate(${x}px, ${y}px)`);
  }

  if (transformValues.scale !== undefined) {
    transformParts.push(`scale(${transformValues.scale})`);
  }

  if (transformValues.rotate !== undefined) {
    transformParts.push(`rotate(${transformValues.rotate}deg)`);
  }

  const transformStyles = {
    ...(transformParts.length > 0 && { transform: transformParts.join(" ") }),
    ...(transformValues.opacity !== undefined && {
      opacity: transformValues.opacity
    })
  };

  return { transformStyles, globalOpacity, extraStyles };
}

function parseUserAnimationConfig(animationString: string): AnimationConfig {
  const userConfig: AnimationConfig = {};
  const animationsUser = animationString.split("/");

  animationsUser.forEach((anim) => {
    // Scale
    if (
      anim.includes("scale") &&
      !anim.startsWith("scalePulse") &&
      !anim.startsWith("scaleAnimationLoop") &&
      !anim.startsWith("scale-up-0") &&
      !anim.startsWith("scale-up-08") &&
      !anim.startsWith("scale-up-12")
    ) {
      userConfig.scale = { value: 50 };
    }

    // Translate
    if (anim.startsWith("translate-")) {
      const option = anim.split("-")[1];
      if (
        option === "horizontal" ||
        option === "vertical" ||
        option === "bilateral"
      ) {
        userConfig.translate = option;
      }
    }

    // Opacity
    if (anim.includes("opacity")) {
      userConfig.opacity = 2;
    }

    // Scale Pulse
    if (anim.includes("scale-pulse")) {
      userConfig.scalePulse = true;
    }

    // Scale Animation Loop
    if (anim.includes("scale-animation-loop")) {
      userConfig.scaleAnimationLoop = true;
    }

    // Rotate Random
    if (anim.includes("rotate-random")) {
      userConfig.rotateRandom = true;
    }

    // Rotate Fixed
    if (anim.includes("rotate-fixed")) {
      userConfig.rotateFixed = 10;
    }
  });

  return userConfig;
}

function renderWords(
  item: ICaption,
  updatedDetails: any,
  scaleFactor: number,
  offsetFrom: number,
  fps: number,
  currentFrame: number,
  globalOpacity?: number
) {
  if (
    updatedDetails?.showObject === "line" &&
    updatedDetails?.linesPerCaption
  ) {
    console.log("renderLineBasedWords");
    return renderLineBasedWords(
      item,
      updatedDetails,
      scaleFactor,
      offsetFrom,
      fps,
      currentFrame,
      globalOpacity
    );
  } else if (updatedDetails?.animation === "customAnimation1") {
    console.log("renderCustomAnimation1Words");
    return renderCustomAnimation1Words(
      item,
      updatedDetails,
      scaleFactor,
      offsetFrom,
      globalOpacity,
      fps,
      currentFrame
    );
  } else {
    console.log("renderStandardWords");
    return renderStandardWords(
      item,
      updatedDetails,
      scaleFactor,
      offsetFrom,
      globalOpacity,
      fps,
      currentFrame
    );
  }
}

function renderLineBasedWords(
  item: ICaption,
  updatedDetails: any,
  scaleFactor: number,
  offsetFrom: number,
  fps: number,
  currentFrame: number,
  globalOpacity?: number
) {
  const wordsPerLine = Math.ceil(
    item.details.words.length / updatedDetails.linesPerCaption
  );
  const lines: any[][] = [];

  for (let i = 0; i < updatedDetails.linesPerCaption; i++) {
    const startIndex = i * wordsPerLine;
    const endIndex = Math.min(
      startIndex + wordsPerLine,
      item.details.words.length
    );
    lines.push(item.details.words.slice(startIndex, endIndex));
  }

  const lineDuration =
    (item.display.to - item.display.from) / updatedDetails.linesPerCaption;
  const currentLine = Math.min(
    Math.floor(currentFrame / ((lineDuration * fps) / 1000)),
    updatedDetails.linesPerCaption - 1
  );

  return lines.map((lineWords, lineIndex) => (
    <div
      key={lineIndex}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        marginBottom: lineIndex < lines.length - 1 ? "8px" : "0"
      }}
    >
      {lineWords.map((word: any, wordIndex: number) => (
        <CaptionWord
          {...createCaptionWordProps(
            word,
            updatedDetails,
            scaleFactor,
            offsetFrom,
            updatedDetails.animation || "",
            globalOpacity,
            undefined,
            lineIndex,
            currentLine,
            fps,
            frame
          )}
          key={`${lineIndex}-${wordIndex}`}
        />
      ))}
    </div>
  ));
}

function renderCustomAnimation1Words(
  item: ICaption,
  updatedDetails: any,
  scaleFactor: number,
  offsetFrom: number,
  globalOpacity?: number,
  fps?: number,
  currentFrame?: number
) {
  const nonKeywordWords = item.details.words.filter(
    (word: any) => !word.is_keyword
  );
  const keywordWords = item.details.words.filter(
    (word: any) => word.is_keyword
  );
  const groupedWords: any[] = [];

  if (nonKeywordWords.length > 0) {
    const firstNonKeyword = nonKeywordWords[0];
    const lastNonKeyword = nonKeywordWords[nonKeywordWords.length - 1];
    const firstKeywordWord = keywordWords[0];
    const groupEndTime = firstKeywordWord
      ? firstKeywordWord.start
      : lastNonKeyword.end;

    const groupWord = {
      word: nonKeywordWords.map((w) => w.word).join(" "),
      start: firstNonKeyword.start,
      end: groupEndTime,
      is_keyword: false
    };
    groupedWords.push(groupWord);
  }

  keywordWords.forEach((word) => {
    groupedWords.push(word);
  });

  return groupedWords.map((word: any, index: number) => (
    <CaptionWord
      {...createCaptionWordProps(
        word,
        updatedDetails,
        scaleFactor,
        offsetFrom,
        updatedDetails.animation || "",
        globalOpacity,
        "word",
        undefined,
        undefined,
        fps,
        currentFrame
      )}
      key={index}
    />
  ));
}

function renderStandardWords(
  item: ICaption,
  updatedDetails: any,
  scaleFactor: number,
  offsetFrom: number,
  globalOpacity?: number,
  fps?: number,
  currentFrame?: number
) {
  return item.details.words.map((word: any, index: number) => (
    <CaptionWord
      {...createCaptionWordProps(
        word,
        updatedDetails,
        scaleFactor,
        offsetFrom,
        updatedDetails.animation || "",
        globalOpacity,
        undefined,
        undefined,
        undefined,
        fps,
        currentFrame
      )}
      key={index}
    />
  ));
}

// Helper function to create common CaptionWord props
const createCaptionWordProps = (
  word: any,
  updatedDetails: any,
  scaleFactor: number,
  offsetFrom: number,
  animation: string,
  globalOpacity?: number,
  showObject?: string,
  lineIndex?: number,
  currentLine?: number,
  fps?: number,
  currentFrame?: number
) => ({
  isSRTPaired: updatedDetails.isSRTPaired || false,
  word,
  offsetFrom,
  activeColor: updatedDetails.activeColor || updatedDetails.color,
  activeFillColor: updatedDetails.activeFillColor || "transparent",
  appearedColor: updatedDetails.appearedColor || updatedDetails.color,
  color: updatedDetails.color,
  animation,
  globalOpacity,
  isKeywordColor: updatedDetails?.isKeywordColor || "transparent",
  preservedColorKeyWord: updatedDetails?.preservedColorKeyWord || false,
  scaleFactor,
  animationNoneCaption: false,
  showObject: showObject || updatedDetails?.showObject || "page",
  lineIndex,
  currentLine,
  fps,
  currentFrame
});
