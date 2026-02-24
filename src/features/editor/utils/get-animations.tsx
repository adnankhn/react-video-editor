import {
  IBasicAnimation,
  ICompositionAnimation,
  ITrackItem
} from "@designcombo/types";
import { Easing } from "remotion";
import { Animation } from "../player/animated";
import { EasingOption } from "../constants/easing-options";

const smoothSlide = Easing.bezier(0.16, 1, 0.3, 1);
const bounceLand = Easing.bezier(0.34, 1.56, 0.64, 1);
const snapIn = Easing.bezier(0.22, 1, 0.36, 1);
const backOut2 = Easing.bezier(0.34, 1.4, 0.64, 1);

const resolveEasing = (ease?: string): ((t: number) => number) => {
  switch (ease as EasingOption) {
    case "smoothSlide":
      return smoothSlide;
    case "bounceLand":
      return bounceLand;
    case "snapIn":
      return snapIn;
    case "backOut2":
      return backOut2;
    case "elasticOut":
      return Easing.out(Easing.elastic(1.1));
    case "none":
      return Easing.linear;
    case "easeOut":
      return Easing.out(Easing.quad);
    case "easeIn":
      return Easing.in(Easing.quad);
    case "linear":
      return Easing.linear;
    default:
      return smoothSlide;
  }
};

const getCompEase = (comp: ICompositionAnimation) => {
  const composition = comp as ICompositionAnimation & {
    ease?: string;
    easing?: string;
  };
  return composition.ease || composition.easing;
};

const getCompDistance = (
  comp: ICompositionAnimation,
  fallback: number
): number => {
  const composition = comp as ICompositionAnimation & {
    distance?: number;
  };
  const value = composition.distance;
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(0, value);
};

export const getAnimations = (
  animation: {
    in: IBasicAnimation;
    out: IBasicAnimation;
    loop?: IBasicAnimation;
    timed?: IBasicAnimation;
  },
  item: ITrackItem,
  frame?: number,
  fps?: number
): {
  animationIn: Animation | Animation[] | null;
  animationOut: Animation | Animation[] | null;
  animationLoop?: Animation | Animation[] | null;
  animationTimed?: Animation | Animation[] | null;
} => {
  let animationIn = null;
  let animationOut = null;
  let animationLoop = null;
  let animationTimed = null;
  if (animation?.in) {
    animationIn = [];
    animation.in.composition.forEach((comp) => {
      if (animation.in.name.includes("slide")) {
        animationIn.push(getSlideAnimation(animation.in.name, comp, item));
      } else if (comp.property.startsWith("fadeScaleBump")) {
        const curve = resolveEasing(getCompEase(comp));
        animationIn.push({
          property: "opacity",
          from: 0,
          to: 1,
          durationInFrames: Math.round(comp.durationInFrames * 0.7),
          ease: Easing.out(Easing.cubic)
        });
        animationIn.push({
          property: "scale",
          from: 0.82,
          to: 1,
          durationInFrames: comp.durationInFrames,
          ease: curve
        });
      } else if (comp.property.startsWith("slideUp")) {
        const curve = resolveEasing(getCompEase(comp));
        const distance = getCompDistance(comp, 60);
        animationIn.push({
          property: "translateY",
          from: distance,
          to: 0,
          durationInFrames: comp.durationInFrames,
          ease: curve
        });
        animationIn.push({
          property: "opacity",
          from: 0,
          to: 1,
          durationInFrames: Math.round(comp.durationInFrames * 0.6),
          ease: Easing.out(Easing.quad)
        });
      } else if (comp.property.startsWith("swooshRight")) {
        const curve = resolveEasing(getCompEase(comp));
        const distance = getCompDistance(comp, 80);
        const blurAmount = Math.max(6, Math.min(16, distance * 0.12));
        animationIn.push({
          property: "translateX",
          from: -distance,
          to: 0,
          durationInFrames: comp.durationInFrames,
          ease: curve
        });
        animationIn.push({
          property: "opacity",
          from: 0,
          to: 1,
          durationInFrames: Math.round(comp.durationInFrames * 0.5),
          ease: Easing.out(Easing.cubic)
        });
        animationIn.push({
          property: "scale",
          from: 0.97,
          to: 1,
          durationInFrames: comp.durationInFrames,
          ease: curve
        });
        animationIn.push({
          property: "blur",
          from: blurAmount,
          to: 0,
          durationInFrames: Math.round(comp.durationInFrames * 0.75),
          ease: Easing.out(Easing.cubic)
        });
      } else if (comp.property.startsWith("swooshLeft")) {
        const curve = resolveEasing(getCompEase(comp));
        const distance = getCompDistance(comp, 80);
        const blurAmount = Math.max(6, Math.min(16, distance * 0.12));
        animationIn.push({
          property: "translateX",
          from: distance,
          to: 0,
          durationInFrames: comp.durationInFrames,
          ease: curve
        });
        animationIn.push({
          property: "opacity",
          from: 0,
          to: 1,
          durationInFrames: Math.round(comp.durationInFrames * 0.5),
          ease: Easing.out(Easing.cubic)
        });
        animationIn.push({
          property: "scale",
          from: 0.97,
          to: 1,
          durationInFrames: comp.durationInFrames,
          ease: curve
        });
        animationIn.push({
          property: "blur",
          from: blurAmount,
          to: 0,
          durationInFrames: Math.round(comp.durationInFrames * 0.75),
          ease: Easing.out(Easing.cubic)
        });
      } else if (comp.property.startsWith("blurFade")) {
        const curve = resolveEasing(getCompEase(comp));
        const distance = getCompDistance(comp, 12);
        animationIn.push({
          property: "opacity",
          from: 0,
          to: 1,
          durationInFrames: comp.durationInFrames,
          ease: curve
        });
        animationIn.push({
          property: "blur",
          from: distance,
          to: 0,
          durationInFrames: comp.durationInFrames,
          ease: curve
        });
        animationIn.push({
          property: "scale",
          from: 0.96,
          to: 1,
          durationInFrames: comp.durationInFrames,
          ease: curve
        });
      } else if (comp.property.startsWith("zoomIn")) {
        const curve = resolveEasing(getCompEase(comp));
        animationIn.push({
          property: "scale",
          from: 0.8,
          to: 1,
          durationInFrames: comp.durationInFrames,
          ease: curve
        });
        animationIn.push({
          property: "opacity",
          from: 0,
          to: 1,
          durationInFrames: Math.round(comp.durationInFrames * 0.6),
          ease: Easing.out(Easing.quad)
        });
      } else if (comp.property.startsWith("bounceIn")) {
        const curve = resolveEasing(getCompEase(comp));
        animationIn.push({
          property: "scale",
          from: 0.75,
          to: 1,
          durationInFrames: comp.durationInFrames,
          ease: curve
        });
        animationIn.push({
          property: "opacity",
          from: 0,
          to: 1,
          durationInFrames: Math.round(comp.durationInFrames * 0.5),
          ease: Easing.out(Easing.quad)
        });
      } else if (comp.property.startsWith("flipIn")) {
        const curve = resolveEasing(getCompEase(comp));
        animationIn.push({
          property: "rotateY",
          from: -90,
          to: 0,
          durationInFrames: comp.durationInFrames,
          ease: curve
        });
        animationIn.push({
          property: "opacity",
          from: 0,
          to: 1,
          durationInFrames: Math.round(comp.durationInFrames * 0.4),
          ease: Easing.out(Easing.quad)
        });
        animationIn.push({
          property: "scale",
          from: 0.85,
          to: 1,
          durationInFrames: comp.durationInFrames,
          ease: curve
        });
      } else if (comp.property.startsWith("splitWipeV")) {
        const curve = resolveEasing(getCompEase(comp));
        animationIn.push({
          property: "clipPath",
          from: "inset(50% 0 50% 0)",
          to: "inset(0 0 0 0)",
          durationInFrames: comp.durationInFrames,
          ease: curve
        });
        animationIn.push({
          property: "opacity",
          from: 0,
          to: 1,
          durationInFrames: Math.round(comp.durationInFrames * 0.5),
          ease: Easing.out(Easing.quad)
        });
      } else if (comp.property.startsWith("splitWipeH")) {
        const curve = resolveEasing(getCompEase(comp));
        animationIn.push({
          property: "clipPath",
          from: "inset(0 50% 0 50%)",
          to: "inset(0 0 0 0)",
          durationInFrames: comp.durationInFrames,
          ease: curve
        });
        animationIn.push({
          property: "opacity",
          from: 0,
          to: 1,
          durationInFrames: Math.round(comp.durationInFrames * 0.5),
          ease: Easing.out(Easing.quad)
        });
      } else if (comp.property.startsWith("slideLeft")) {
        const curve = resolveEasing(getCompEase(comp));
        const distance = getCompDistance(comp, 80);
        animationIn.push({
          property: "translateX",
          from: distance,
          to: 0,
          durationInFrames: comp.durationInFrames,
          ease: curve
        });
        animationIn.push({
          property: "opacity",
          from: 0,
          to: 1,
          durationInFrames: Math.round(comp.durationInFrames * 0.5),
          ease: Easing.out(Easing.cubic)
        });
      } else {
        animationIn.push({
          property: comp.property,
          from: comp.from,
          to: comp.to,
          durationInFrames: comp.durationInFrames,
          ease: resolveEasing(getCompEase(comp))
        });
      }
    });
  }
  if (animation?.out) {
    animationOut = [];
    animation.out.composition.forEach((comp) => {
      if (animation.out.name.includes("slide")) {
        animationOut.push(getSlideAnimation(animation.out.name, comp, item));
      } else {
        animationOut.push({
          property: comp.property,
          from: comp.from,
          to: comp.to,
          durationInFrames: comp.durationInFrames,
          ease: resolveEasing(getCompEase(comp))
        });
      }
    });
  }
  return {
    animationIn,
    animationOut,
    animationLoop,
    animationTimed
  };
};

const getSlideAnimation = (
  type: string,
  anim: ICompositionAnimation,
  item: ITrackItem
) => {
  const transformString = item.details.transform || "";
  const scaleMatch = /scale\(([^,)]+)(?:,\s*([^)]+))?\)/.exec(transformString);
  const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
  const ease = resolveEasing(getCompEase(anim));
  if (type === "slideInRight" || type === "slideOutLeft") {
    const commonValue =
      -parseFloat(item.details.left) - item.details.width / scale;
    const from = type.includes("In") ? commonValue : anim.from;
    const to = type.includes("In") ? anim.to : commonValue;
    return {
      property: anim.property,
      from,
      to,
      durationInFrames: anim.durationInFrames,
      ease
    };
  } else if (type === "slideInLeft" || type === "slideOutRight") {
    const commonValue =
      parseFloat(item.details.left) + item.details.width / scale;
    const from = type.includes("In") ? commonValue : anim.from;
    const to = type.includes("In") ? anim.to : commonValue;
    return {
      property: anim.property,
      from,
      to,
      durationInFrames: anim.durationInFrames,
      ease
    };
  } else if (type === "slideInBottom" || type === "slideOutTop") {
    const commonValue =
      -parseFloat(item.details.top) - item.details.height / scale;
    const from = type.includes("In") ? commonValue : anim.from;
    const to = type.includes("In") ? anim.to : commonValue;
    return {
      property: anim.property,
      from,
      to,
      durationInFrames: anim.durationInFrames,
      ease
    };
  } else if (type === "slideInTop" || type === "slideOutBottom") {
    const commonValue =
      parseFloat(item.details.top) + item.details.height / scale;
    const from = type.includes("In") ? commonValue : anim.from;
    const to = type.includes("In") ? anim.to : commonValue;

    return {
      property: anim.property,
      from,
      to,
      durationInFrames: anim.durationInFrames,
      ease
    };
  }

  return {
    property: anim.property,
    from: anim.from,
    to: anim.to,
    durationInFrames: anim.durationInFrames,
    ease
  };
};
