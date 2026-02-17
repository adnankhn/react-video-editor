import { Easing } from "remotion";
import { Animation } from "./types";

// Define custom effect preset names
export type CustomEffectPresetName =
  | "fadeScaleBump"
  | "slideUp"
  | "swooshRight"
  | "swooshLeft"
  | "blurFade"
  | "zoomIn"
  | "bounceIn"
  | "flipIn"
  | "splitWipeV"
  | "splitWipeH";

// Custom effect presets using Remotion animations
export const customEffectPresets: Record<CustomEffectPresetName, Animation> = {
  fadeScaleBump: {
    property: "fadeScaleBump",
    from: 0,
    to: 1,
    durationInFrames: 30,
    ease: Easing.ease,
    previewUrl: "https://cdn.designcombo.dev/animations/scaleAndRotate.webp",
    name: "Fade + Bump"
  },
  slideUp: {
    property: "slideUp",
    from: 0,
    to: 1,
    durationInFrames: 30,
    ease: Easing.ease,
    previewUrl: "https://cdn.designcombo.dev/animations/SlideInTop.webp",
    name: "Slide Up"
  },
  swooshRight: {
    property: "swooshRight",
    from: 0,
    to: 1,
    durationInFrames: 30,
    ease: Easing.ease,
    previewUrl: "https://cdn.designcombo.dev/animations/SlideInRight.webp",
    name: "Swoosh Right"
  },
  swooshLeft: {
    property: "swooshLeft",
    from: 0,
    to: 1,
    durationInFrames: 30,
    ease: Easing.ease,
    previewUrl: "https://cdn.designcombo.dev/animations/SlideInLeft.webp",
    name: "Swoosh Left"
  },
  blurFade: {
    property: "blurFade",
    from: 0,
    to: 1,
    durationInFrames: 30,
    ease: Easing.ease,
    previewUrl: "https://cdn.designcombo.dev/animations/scaleAndRotate.webp",
    name: "Blur Fade"
  },
  zoomIn: {
    property: "zoomIn",
    from: 0,
    to: 1,
    durationInFrames: 30,
    ease: Easing.ease,
    previewUrl: "https://cdn.designcombo.dev/animations/ScaleIn.webp",
    name: "Zoom In"
  },
  bounceIn: {
    property: "bounceIn",
    from: 0,
    to: 1,
    durationInFrames: 30,
    ease: Easing.elastic(1),
    previewUrl: "https://cdn.designcombo.dev/animations/scaleAndRotate.webp",
    name: "Bounce In"
  },
  flipIn: {
    property: "flipIn",
    from: 0,
    to: 1,
    durationInFrames: 30,
    ease: Easing.ease,
    previewUrl: "https://cdn.designcombo.dev/animations/flipIn.webp",
    name: "Flip In"
  },
  splitWipeV: {
    property: "splitWipeV",
    from: 0,
    to: 1,
    durationInFrames: 30,
    ease: Easing.ease,
    previewUrl: "https://cdn.designcombo.dev/animations/scaleAndRotate.webp",
    name: "Split Wipe V"
  },
  splitWipeH: {
    property: "splitWipeH",
    from: 0,
    to: 1,
    durationInFrames: 30,
    ease: Easing.ease,
    previewUrl: "https://cdn.designcombo.dev/animations/scaleAndRotate.webp",
    name: "Split Wipe H"
  }
} as const;

// Export type for external usage
export type CustomEffectPresets = typeof customEffectPresets;