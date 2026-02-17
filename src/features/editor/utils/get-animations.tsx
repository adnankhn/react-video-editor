import {
  IBasicAnimation,
  ICompositionAnimation,
  ITrackItem
} from "@designcombo/types";
import { Easing } from "remotion";
import { Animation } from "../player/animated";

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
        animationIn.push({
          property: "scale",
          from: 0.5,
          to: 1,
          durationInFrames: comp.durationInFrames,
          ease: Easing.ease
        });
        animationIn.push({
          property: "opacity",
          from: 0,
          to: 1,
          durationInFrames: comp.durationInFrames * 0.3,
          ease: Easing.linear
        });
      } else if (comp.property.startsWith("slideUp")) {
        animationIn.push({
          property: "translateY",
          from: 100,
          to: 0,
          durationInFrames: comp.durationInFrames,
          ease: Easing.ease
        });
        animationIn.push({
          property: "opacity",
          from: 0,
          to: 1,
          durationInFrames: comp.durationInFrames * 0.3,
          ease: Easing.linear
        });
      } else if (comp.property.startsWith("swooshRight")) {
        animationIn.push({
          property: "translateX",
          from: -200,
          to: 0,
          durationInFrames: comp.durationInFrames,
          ease: Easing.ease
        });
        animationIn.push({
          property: "opacity",
          from: 0,
          to: 1,
          durationInFrames: comp.durationInFrames * 0.3,
          ease: Easing.linear
        });
      } else if (comp.property.startsWith("swooshLeft")) {
        animationIn.push({
          property: "translateX",
          from: 200,
          to: 0,
          durationInFrames: comp.durationInFrames,
          ease: Easing.ease
        });
        animationIn.push({
          property: "opacity",
          from: 0,
          to: 1,
          durationInFrames: comp.durationInFrames * 0.3,
          ease: Easing.linear
        });
      } else if (comp.property.startsWith("blurFade")) {
        animationIn.push({
          property: "opacity",
          from: 0,
          to: 1,
          durationInFrames: comp.durationInFrames,
          ease: Easing.linear
        });
      } else if (comp.property.startsWith("zoomIn")) {
        animationIn.push({
          property: "scale",
          from: 3,
          to: 1,
          durationInFrames: comp.durationInFrames,
          ease: Easing.ease
        });
        animationIn.push({
          property: "opacity",
          from: 0,
          to: 1,
          durationInFrames: comp.durationInFrames * 0.3,
          ease: Easing.linear
        });
      } else if (comp.property.startsWith("bounceIn")) {
        animationIn.push({
          property: "scale",
          from: 0.3,
          to: 1,
          durationInFrames: comp.durationInFrames,
          ease: Easing.elastic(1)
        });
        animationIn.push({
          property: "opacity",
          from: 0,
          to: 1,
          durationInFrames: comp.durationInFrames * 0.3,
          ease: Easing.linear
        });
      } else if (comp.property.startsWith("flipIn")) {
        animationIn.push({
          property: "rotateY",
          from: -90,
          to: 0,
          durationInFrames: comp.durationInFrames,
          ease: Easing.ease
        });
        animationIn.push({
          property: "opacity",
          from: 0,
          to: 1,
          durationInFrames: comp.durationInFrames * 0.5,
          ease: Easing.linear
        });
      } else if (comp.property.startsWith("splitWipeV")) {
        animationIn.push({
          property: "clipPath",
          from: "inset(50% 0 50% 0)",
          to: "inset(0 0 0 0)",
          durationInFrames: comp.durationInFrames,
          ease: Easing.ease
        });
        animationIn.push({
          property: "opacity",
          from: 0,
          to: 1,
          durationInFrames: comp.durationInFrames * 0.2,
          ease: Easing.linear
        });
      } else if (comp.property.startsWith("splitWipeH")) {
        animationIn.push({
          property: "clipPath",
          from: "inset(0 50% 0 50%)",
          to: "inset(0 0 0 0)",
          durationInFrames: comp.durationInFrames,
          ease: Easing.ease
        });
        animationIn.push({
          property: "opacity",
          from: 0,
          to: 1,
          durationInFrames: comp.durationInFrames * 0.2,
          ease: Easing.linear
        });
      } else {
        animationIn.push({
          property: comp.property,
          from: comp.from,
          to: comp.to,
          durationInFrames: comp.durationInFrames,
          ease: Easing[comp.easing as keyof typeof Easing] as (
            t: number
          ) => number
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
          ease: Easing[comp.easing as keyof typeof Easing] as (
            t: number
          ) => number
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
  const transformString = item.details.transform;
  const scaleMatch = /scale\(([^,]+), ([^)]+)\)/.exec(transformString);
  const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
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
      ease: Easing[anim.easing as keyof typeof Easing]
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
      ease: Easing[anim.easing as keyof typeof Easing]
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
      ease: Easing[anim.easing as keyof typeof Easing]
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
      ease: Easing[anim.easing as keyof typeof Easing]
    };
  }
};
