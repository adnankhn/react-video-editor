/*
* SRT Caption Word Timing Logic
*
* For SRT captions:
* - currentFrame is global timeline frame (not adjusted)
* - offsetFrom is display.from (timeline position where caption starts)
* - word.start is zero-based relative to audio track
* - absolute activation = offsetFrom + word.start
*
* This ensures SRT captions sync properly with audio regardless of timeline position
*/

import React from "react";
import styled from "@emotion/styled";
import { css, keyframes } from "@emotion/react";
import { useCurrentPlayerFrame } from "../../hooks/use-current-frame";
import useStore from "../../store/use-store";
import { ANIMATION_CAPTION_LIST } from "./caption-animations";
import {
  createAnimationFunctions,
  ANIMATION_CONFIGS,
  ANIMATION_FUNCTIONS,
  WordAnimationState
} from "./caption-word-animations";

const scalePulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

interface WordSpanProps {
  isActive: boolean;
  activeFillColor: string;
  wordColor: string;
  scale: number;
  animation: string;
  isAppeared: boolean;
  scaleFactor: number;
  animationNoneCaption: boolean;
  showObject: string;
  isSRTPaired?: boolean;
}

const WordSpan = styled.span<WordSpanProps>`
  position: relative;
  display: inline-block;
  padding: 0 0.2em;
  color: ${(props) => props.wordColor};
  scale: ${(props) => props.scale};
  border-radius: 16px;
  z-index: 1;
  transition: ${(props) => props.isSRTPaired ? 'none' : 'opacity 0.2s ease'};

  ${(props) => {
    if (props.isActive && props.animation.includes("underline-effect")) {
      return `
        text-decoration: underline;
        text-decoration-color: #9238ef;
        text-decoration-thickness: 0.2em;
      `;
    }

    if (!props.isActive && props.animationNoneCaption) {
      return `display: none;`;
    }

    if (
      !props.isAppeared &&
      (ANIMATION_CAPTION_LIST.includes(props.animation) ||
        props.showObject === "word")
    ) {
      return `display: none;`;
    }

    if (!props.isActive && props.animation === "customAnimation1") {
      return `display: none;`;
    }

    return "";
  }}

  &::before {
    content: "";
    position: absolute;
    z-index: -1;
    left: -0.2em;
    right: -0.2em;
    top: 0;
    bottom: 0;
    transition: ${(props) => props.isSRTPaired ? 'none !important' : 'background-color 0.2s ease'};
    border-radius: ${(props) => `${props.scaleFactor * 16}px`};
  }

  ${(props) =>
    props.isActive &&
    css`
      &::before {
        background-color: ${props.activeFillColor};

        ${props.isSRTPaired ? '' : (props.animation === "captionAnimation10" ||
        props.animation === "captionAnimationKeyword42" ||
        props.animation === "captionAnimationKeyword57" ||
        props.animation === "captionAnimationKeyword48") &&
          css`
            animation: ${scalePulse} 0.4s ease-in-out;
            transform-origin: center;
          `}
      }
    `}
`;

interface CaptionWordProps {
  word: any;
  offsetFrom: number;
  activeColor: string;
  activeFillColor: string;
  appearedColor: string;
  color: string;
  animation: string;
  globalOpacity?: number;
  isKeywordColor: string;
  preservedColorKeyWord: boolean;
  scaleFactor: number;
  animationNoneCaption: boolean;
  showObject: string;
  lineIndex?: number;
  currentLine?: number;
  fps?: number;
  currentFrame?: number;
  isSRTPaired?: boolean;
}

export const CaptionWord: React.FC<CaptionWordProps> = ({
  word,
  offsetFrom,
  activeColor,
  activeFillColor,
  appearedColor,
  color,
  animation,
  globalOpacity,
  isKeywordColor,
  preservedColorKeyWord,
  scaleFactor,
  animationNoneCaption,
  showObject,
  lineIndex,
  currentLine,
  fps: propFps,
  currentFrame: propFrame,
  isSRTPaired
}) => {
  // Strictly use passed props if available (Remotion mode)
  // Only use player hook for preview mode when props aren't passed
  const { playerRef } = useStore();
  const playerFrame = useCurrentPlayerFrame(playerRef!);
  
  // Priority: passed props > player hook
  const fps = propFps || 30;
  const currentFrame = propFrame !== undefined ? propFrame : playerFrame;
  
  const { start, end } = word;
  
  // Declare variables
  let isActive: boolean;
  let isAppeared: boolean;
  let startAtFrame: number;
  let endAtFrame: number;
  
  // For SRT captions, use time-based calculation with global frame
  if (isSRTPaired) {
    // Convert global frame to time in milliseconds
    const currentTimeMs = (currentFrame / fps) * 1000;
    // Word timings are ZERO-BASED (relative to audio file start)
    // offsetFrom is display.from (timeline position where caption starts)
    // So absolute time = timeline position + relative word time
    const absoluteStartTime = offsetFrom + start;
    const absoluteEndTime = offsetFrom + end;
    
    isActive = currentTimeMs >= absoluteStartTime && currentTimeMs < absoluteEndTime;
    isAppeared = currentTimeMs >= absoluteStartTime;
    
    // Calculate frame equivalents for animation functions
    startAtFrame = Math.round(absoluteStartTime / 1000 * fps);
    endAtFrame = Math.round(absoluteEndTime / 1000 * fps);
  } else {
    // Use original frame-based calculation for non-SRT captions
    // Fix timing precision with proper rounding
    startAtFrame = Math.round(((start + offsetFrom) / 1000) * fps);
    endAtFrame = Math.round(((end + offsetFrom) / 1000) * fps);
    isActive = currentFrame >= startAtFrame && currentFrame < endAtFrame;
    isAppeared = currentFrame >= startAtFrame;
  }

  // Handle line-based visibility
  if (
    showObject === "line" &&
    lineIndex !== undefined &&
    currentLine !== undefined
  ) {
    if (lineIndex > currentLine) {
      return null;
    }
  }

  // Word color logic
  const getWordColor = () => {
    // For SRT captions: only the current/active word should be highlighted
    // Words that have been spoken should return to normal color
    let baseColor = isActive ? activeColor : (isAppeared ? appearedColor : color);

    if (word.is_keyword && isKeywordColor !== "transparent") {
      if (isActive) {
        return isKeywordColor;
      }
    }
    
    // Special handling for SRT captions to ensure proper highlighting
    if (isActive) {
      return activeColor;
    } else if (isAppeared) {
      return appearedColor;
    } else {
      return color;
    }
  };

  const wordColor = getWordColor();

  // Calculate animation state
  const animationState = calculateAnimationState(
    currentFrame,
    startAtFrame,
    endAtFrame,
    animation,
    word,
    globalOpacity
  );

  // Display text logic
  const getDisplayText = () => {
    if (animation.includes("typewriter-effect")) {
      const totalLetters = word.word.length;
      const animationDuration = endAtFrame - startAtFrame;
      const lettersToShow = Math.min(
        totalLetters,
        Math.floor(
          ((currentFrame - startAtFrame) / animationDuration) * totalLetters
        )
      );
      return word.word.slice(0, lettersToShow);
    }
    return word.word;
  };

  const displayText = getDisplayText();

  // Transform style helper
  const getTransformStyle = () => {
    const transforms = [];
    if (animationState.translateX !== 0 || animationState.translateY !== 0) {
      transforms.push(
        `translate(${animationState.translateX}px, ${animationState.translateY}px)`
      );
    }
    return transforms.length > 0 ? transforms.join(" ") : undefined;
  };

  // For SRT captions, use global opacity instead of animationState.opacity to avoid interference
  const finalOpacity = isSRTPaired
    ? (globalOpacity !== undefined ? globalOpacity : 1)
    : animationState.opacity;

  return (
    <WordSpan
      isActive={isActive}
      wordColor={wordColor}
      activeFillColor={activeFillColor}
      scale={animationState.scale}
      animation={animation}
      animationNoneCaption={animationNoneCaption}
      style={{
        opacity: finalOpacity,
        ...(getTransformStyle() && { transform: getTransformStyle() })
      }}
      isAppeared={isAppeared}
      scaleFactor={scaleFactor}
      showObject={showObject}
      isSRTPaired={isSRTPaired}
    >
      {displayText}
    </WordSpan>
  );
};

function calculateAnimationState(
  currentFrame: number,
  startAtFrame: number,
  endAtFrame: number,
  animation: string,
  word: any,
  globalOpacity?: number
): WordAnimationState {
  const initialState: WordAnimationState = {
    opacity: 1,
    scale: 1,
    translateX: 0,
    translateY: 0
  };

  // Apply basic animation effects
  const basicEffects = {
    scaleAnimationLetterEffect: () => ({
      scale:
        currentFrame > startAtFrame && currentFrame < endAtFrame ? 1.4 : 0.9
    }),
    animationScaleMinEffect: () => ({ scale: 0.8 }),
    animationScaleDinamicEffect: () => ({ scale: word.is_keyword ? 1.4 : 0.9 }),
    captionAnimation26: () => ({
      opacity:
        currentFrame > startAtFrame && currentFrame < endAtFrame ? 1 : 0.6
    })
  };

  // Apply basic effects
  Object.entries(basicEffects).forEach(([effect, handler]) => {
    if (animation.includes(effect) || animation === effect) {
      Object.assign(initialState, handler());
    }
  });

  // Create animation helpers
  const animationHelpers = createAnimationFunctions(
    currentFrame,
    startAtFrame,
    endAtFrame
  );

  // Apply animation configurations
  const animationConfig = ANIMATION_CONFIGS[animation];
  if (animationConfig) {
    const configResult = animationConfig(animationHelpers);
    Object.assign(initialState, configResult);
  }

  // Apply animation functions from slash-separated animations
  const selectedAnimations = animation.split("/") || [];
  selectedAnimations.forEach((anim) => {
    const animationFn = ANIMATION_FUNCTIONS[anim];
    if (animationFn) {
      const result = animationFn(animationHelpers);
      Object.assign(initialState, result);
    }
  });

  // Handle global opacity
  if (globalOpacity !== undefined) {
    initialState.opacity = globalOpacity;
  }

  return initialState;
}
