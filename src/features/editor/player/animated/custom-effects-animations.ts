import { interpolate, spring } from "remotion";

// Fade + Scale Bump animation
export const fadeScaleBump = (frame: number, durationInFrames: number) => {
  const progress = frame / durationInFrames;
  
  // Fade in
  const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 1], {
    extrapolateRight: "clamp"
  });
  
  // Scale with bounce
  const scale = spring({
    frame,
    fps: 30,
    from: 0.5,
    to: 1,
    config: {
      damping: 10,
      mass: 1,
      stiffness: 100
    }
  });
  
  return { opacity, transform: `scale(${scale})` };
};

// Slide Up animation
export const slideUp = (frame: number, durationInFrames: number) => {
  const progress = frame / durationInFrames;
  
  // Fade in
  const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 1], {
    extrapolateRight: "clamp"
  });
  
  // Slide from bottom
  const translateY = interpolate(progress, [0, 1], [100, 0], {
    extrapolateRight: "clamp"
  });
  
  return { opacity, transform: `translateY(${translateY}px)` };
};

// Swoosh Right animation
export const swooshRight = (frame: number, durationInFrames: number) => {
  const progress = frame / durationInFrames;
  
  // Fade in
  const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 1], {
    extrapolateRight: "clamp"
  });
  
  // Slide from left with skew
  const translateX = interpolate(progress, [0, 1], [-200, 0], {
    extrapolateRight: "clamp"
  });
  
  const skewX = interpolate(progress, [0, 0.3, 0.7, 1], [45, -10, 5, 0], {
    extrapolateRight: "clamp"
  });
  
  return { 
    opacity, 
    transform: `translateX(${translateX}px) skewX(${skewX}deg)` 
  };
};

// Swoosh Left animation
export const swooshLeft = (frame: number, durationInFrames: number) => {
  const progress = frame / durationInFrames;
  
  // Fade in
  const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 1], {
    extrapolateRight: "clamp"
  });
  
  // Slide from right with skew
  const translateX = interpolate(progress, [0, 1], [200, 0], {
    extrapolateRight: "clamp"
  });
  
  const skewX = interpolate(progress, [0, 0.3, 0.7, 1], [-45, 10, -5, 0], {
    extrapolateRight: "clamp"
  });
  
  return { 
    opacity, 
    transform: `translateX(${translateX}px) skewX(${skewX}deg)` 
  };
};

// Blur Fade animation
export const blurFade = (frame: number, durationInFrames: number) => {
  const progress = frame / durationInFrames;
  
  // Fade in
  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateRight: "clamp"
  });
  
  // Blur to sharp
  const blur = interpolate(progress, [0, 1], [20, 0], {
    extrapolateRight: "clamp"
  });
  
  return { 
    opacity, 
    filter: `blur(${blur}px)` 
  };
};

// Zoom In animation
export const zoomIn = (frame: number, durationInFrames: number) => {
  const progress = frame / durationInFrames;
  
  // Fade in
  const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 1], {
    extrapolateRight: "clamp"
  });
  
  // Scale down from large
  const scale = interpolate(progress, [0, 1], [3, 1], {
    extrapolateRight: "clamp"
  });
  
  return { 
    opacity, 
    transform: `scale(${scale})` 
  };
};

// Bounce In animation
export const bounceIn = (frame: number, durationInFrames: number) => {
  const scale = spring({
    frame,
    fps: 30,
    from: 0.3,
    to: 1,
    config: {
      damping: 5,
      mass: 1,
      stiffness: 150
    }
  });
  
  const opacity = interpolate(frame, [0, durationInFrames * 0.3], [0, 1], {
    extrapolateRight: "clamp"
  });
  
  return { 
    opacity, 
    transform: `scale(${scale})` 
  };
};

// Flip In animation
export const flipIn = (frame: number, durationInFrames: number) => {
  const progress = frame / durationInFrames;
  
  // Fade in
  const opacity = interpolate(progress, [0, 0.5, 1], [0, 1, 1], {
    extrapolateRight: "clamp"
  });
  
  // 3D Y-axis rotation
  const rotateY = interpolate(progress, [0, 1], [-90, 0], {
    extrapolateRight: "clamp"
  });
  
  return { 
    opacity, 
    transform: `rotateY(${rotateY}deg)` 
  };
};

// Split Wipe Vertical animation
export const splitWipeV = (frame: number, durationInFrames: number) => {
  const progress = frame / durationInFrames;
  
  // Opacity
  const opacity = interpolate(progress, [0, 0.2, 1], [0, 1, 1], {
    extrapolateRight: "clamp"
  });
  
  // Vertical split reveal
  const clipPath = interpolate(progress, [0, 1], [0, 50], {
    extrapolateRight: "clamp"
  });
  
  return { 
    opacity,
    clipPath: `inset(${50 - clipPath}% 0 ${50 - clipPath}% 0)` 
  };
};

// Split Wipe Horizontal animation
export const splitWipeH = (frame: number, durationInFrames: number) => {
  const progress = frame / durationInFrames;
  
  // Opacity
  const opacity = interpolate(progress, [0, 0.2, 1], [0, 1, 1], {
    extrapolateRight: "clamp"
  });
  
  // Horizontal split reveal
  const clipPath = interpolate(progress, [0, 1], [0, 50], {
    extrapolateRight: "clamp"
  });
  
  return { 
    opacity,
    clipPath: `inset(0 ${50 - clipPath}% 0 ${50 - clipPath}%)` 
  };
};