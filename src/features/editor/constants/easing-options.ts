export type EasingOption =
  | "smoothSlide"
  | "bounceLand"
  | "snapIn"
  | "backOut2"
  | "elasticOut"
  | "none"
  | "easeOut"
  | "easeIn"
  | "linear";

export const EASING_OPTIONS: {
  value: EasingOption;
  label: string;
  description: string;
}[] = [
  {
    value: "smoothSlide",
    label: "Smooth Slide",
    description: "Fast decel — best for slides"
  },
  {
    value: "bounceLand",
    label: "Bounce Land",
    description: "Overshoots then settles — cards"
  },
  {
    value: "snapIn",
    label: "Snap In",
    description: "Snappy UI entrance"
  },
  {
    value: "backOut2",
    label: "Back Out",
    description: "Subtle bounce — text reveals"
  },
  {
    value: "elasticOut",
    label: "Elastic Out",
    description: "Bouncy elastic finish"
  },
  {
    value: "none",
    label: "None",
    description: "No easing curve"
  },
  {
    value: "easeOut",
    label: "Ease Out",
    description: "Standard smooth deceleration"
  },
  {
    value: "easeIn",
    label: "Ease In",
    description: "Starts slow, ends fast"
  },
  {
    value: "linear",
    label: "Linear",
    description: "Constant speed"
  }
];

export const EFFECT_EASING_DEFAULTS: Record<string, EasingOption> = {
  slideUp: "smoothSlide",
  slideLeft: "smoothSlide",
  swooshRight: "smoothSlide",
  swooshLeft: "smoothSlide",
  zoomIn: "bounceLand",
  fadeScaleBump: "bounceLand",
  flipIn: "bounceLand",
  blurFade: "smoothSlide",
  splitWipeV: "snapIn",
  splitWipeH: "snapIn",
  bounceIn: "bounceLand"
};
