import { IImage, IText, ITrackItem } from "@designcombo/types";

export const calculateCropStyles = (
  details: IImage["details"],
  crop: IImage["details"]["crop"]
) => ({
  width: details.width || "100%",
  height: details.height || "auto",
  top: -crop.y || 0,
  left: -crop.x || 0,
  position: "absolute",
  borderRadius: `${Math.min(crop.width, crop.height) * ((details.borderRadius || 0) / 100)}px`
});

export const calculateMediaStyles = (
  details: ITrackItem["details"],
  crop: ITrackItem["details"]["crop"]
) => {
  const borderWidth = details.borderWidth ?? 0;
  const borderColor = details.borderColor ?? "transparent";
  const borderEffect = (details as any).borderEffect ?? "none";

  const styles: React.CSSProperties = {
    pointerEvents: "none",
    ...calculateCropStyles(details, crop),
    overflow: "hidden",
  } as React.CSSProperties;

  // Add regular box shadow if present (non-effect shadows)
  if (details.boxShadow && borderEffect === "none") {
    styles.boxShadow = `${details.boxShadow.x}px ${details.boxShadow.y}px ${details.boxShadow.blur}px ${details.boxShadow.color}`;
  }

  // Add border properties only when NO special effect is active
  // (glow and glass handle their visuals on the effect wrapper)
  if (borderWidth > 0 && borderEffect === "none") {
    styles.borderStyle = "solid";
    styles.borderWidth = `${borderWidth}px`;
    styles.borderColor = borderColor;
  }

  // Add borderRadius if present
  if (details.borderRadius !== undefined && details.borderRadius > 0) {
    const radius = Math.min(details.width || 0, details.height || 0) * ((details.borderRadius || 0) / 100);
    styles.borderRadius = `${radius}px`;
  }

  return styles;
};

/**
 * Calculates styles for the border effect wrapper that sits OUTSIDE MaskAnim.
 * This is needed because MaskAnim has overflow:hidden which clips box-shadows.
 * Returns null if no border effect is active.
 */
export const calculateBorderEffectStyles = (
  details: ITrackItem["details"],
  crop: ITrackItem["details"]["crop"]
): React.CSSProperties | null => {
  const borderWidth = details.borderWidth ?? 0;
  const borderColor = details.borderColor ?? "transparent";
  const borderEffect = (details as any).borderEffect ?? "none";

  if (borderEffect === "none" || borderWidth <= 0) {
    return null;
  }

  const cropWidth = crop?.width || details.width || 0;
  const cropHeight = crop?.height || details.height || 0;

  const styles: React.CSSProperties = {
    position: "relative",
    overflow: "visible",
    pointerEvents: "none",
  };

  const boxShadows: string[] = [];

  // Add regular box shadow if present
  if (details.boxShadow) {
    boxShadows.push(`${details.boxShadow.x}px ${details.boxShadow.y}px ${details.boxShadow.blur}px ${details.boxShadow.color}`);
  }

  if (borderEffect === "glow" && borderColor !== "transparent") {
    // Neon glow effect - trending reels style
    // The wrapper matches the content size — glow extends outward via box-shadow
    styles.width = cropWidth;
    styles.height = cropHeight;

    // User-controllable glow parameters (0-100 range, default 50)
    const userSpread = (details as any).glowSpread ?? 50;
    const userIntensity = (details as any).glowIntensity ?? 50;

    // Map spread (0-100) to actual blur/spread values
    const spreadMultiplier = 0.5 + (userSpread / 100) * 4.5; // 0.5x to 5x
    const glowBlur = Math.max(borderWidth * spreadMultiplier, 4);
    const glowSpread = Math.max(borderWidth * (spreadMultiplier * 0.3), 1);

    // Map intensity (0-100) to opacity (0.2 to 1.0)
    const intensityAlpha = 0.2 + (userIntensity / 100) * 0.8;
    const outerAlpha = Math.round(intensityAlpha * 0.5 * 255).toString(16).padStart(2, '0');
    const innerAlpha = Math.round(intensityAlpha * 0.4 * 255).toString(16).padStart(2, '0');

    // Add the colored border directly on the glow wrapper
    styles.border = `${borderWidth}px solid ${borderColor}`;
    styles.boxSizing = "content-box";
    styles.marginTop = `-${borderWidth}px`;
    styles.marginLeft = `-${borderWidth}px`;

    // Calculate border radius for the glow wrapper (outer = inner + border)
    if (details.borderRadius !== undefined && details.borderRadius > 0) {
      const innerRadius = Math.min(cropWidth, cropHeight) * ((details.borderRadius || 0) / 100);
      const outerRadius = innerRadius + borderWidth;
      styles.borderRadius = `${outerRadius}px`;
    }

    // Multiple glow layers for a vibrant neon look
    boxShadows.push(`0 0 ${glowBlur}px ${glowSpread}px ${borderColor}`);
    boxShadows.push(`0 0 ${glowBlur * 2}px ${glowSpread * 2}px ${borderColor}${outerAlpha}`);
    boxShadows.push(`inset 0 0 ${glowBlur * 0.6}px ${Math.max(glowSpread * 0.3, 1)}px ${borderColor}${innerAlpha}`);
  } else if (borderEffect === "glass") {
    // Glassmorphism border effect
    // The wrapper is LARGER than the content by borderWidth on each side (via padding)
    // This creates a visible glass border area around the media
    styles.width = cropWidth;
    styles.height = cropHeight;
    styles.padding = `${borderWidth}px`;
    styles.boxSizing = "content-box";
    // Offset the wrapper so it's centered around the content position
    styles.marginTop = `-${borderWidth}px`;
    styles.marginLeft = `-${borderWidth}px`;

    // Glassmorphism look
    styles.backdropFilter = `blur(${Math.max(borderWidth * 2, 8)}px)`;
    (styles as any).WebkitBackdropFilter = `blur(${Math.max(borderWidth * 2, 8)}px)`;
    styles.background = `linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.06) 100%)`;
    styles.border = `1px solid rgba(255, 255, 255, 0.25)`;

    // Calculate border radius — outer radius is slightly larger to account for padding
    if (details.borderRadius !== undefined && details.borderRadius > 0) {
      const innerRadius = Math.min(cropWidth, cropHeight) * ((details.borderRadius || 0) / 100);
      const outerRadius = innerRadius + borderWidth;
      styles.borderRadius = `${outerRadius}px`;
    }

    // Glass depth shadows
    boxShadows.push(`0 8px 32px rgba(0, 0, 0, 0.12)`);
    boxShadows.push(`inset 0 1px 0 rgba(255, 255, 255, 0.3)`);
    boxShadows.push(`inset 0 -1px 0 rgba(255, 255, 255, 0.08)`);
    boxShadows.push(`0 0 0 1px rgba(255, 255, 255, 0.15)`);
  }

  if (boxShadows.length > 0) {
    styles.boxShadow = boxShadows.join(", ");
  }

  return styles;
};


export const calculateTextStyles = (
  details: IText["details"]
): React.CSSProperties => {
  const borderEffect = (details as any).borderEffect ?? "none";
  const borderWidth = details.borderWidth || 0;
  const borderColor = details.borderColor || "transparent";

  let boxShadow = details.boxShadow
    ? `${details.boxShadow.x}px ${details.boxShadow.y}px ${details.boxShadow.blur}px ${details.boxShadow.color}`
    : "";

  // Apply border effects for text
  if (borderEffect === "glow" && borderWidth > 0) {
    // Create a glowing effect that's clearly visible
    // Use a much more prominent glow
    const glowBlur = borderWidth * 8;
    const glowSpread = borderWidth * 3;
    // Create a strong glow effect that extends well beyond the border
    const glowEffect = `0 0 ${glowBlur}px ${glowSpread}px ${borderColor}`;
    boxShadow = boxShadow ? `${boxShadow}, ${glowEffect}` : glowEffect;
  } else if (borderEffect === "glass" && borderWidth > 0) {
    // For glass effect, we'll use a combination of outer glow and inner shine
    // Use bright white elements to make the glass effect clearly visible
    const glassOuterGlow = `0 0 ${borderWidth * 4}px rgba(255, 255, 255, 0.9), 0 0 ${borderWidth * 8}px ${borderWidth * 2}px rgba(255, 255, 255, 0.6)`;
    const glassInnerShine = `inset 0 0 ${borderWidth * 5}px rgba(255, 255, 255, 0.8), inset 0 0 ${borderWidth * 10}px rgba(255, 255, 255, 0.4)`;
    const glassEffect = `${glassOuterGlow}, ${glassInnerShine}`;
    boxShadow = boxShadow ? `${boxShadow}, ${glassEffect}` : glassEffect;
  }

  return {
    position: "relative",
    textDecoration: details.textDecoration || "none",
    WebkitTextStroke: `${details.borderWidth}px ${details.borderColor}`, // Outline/stroke color and thickness
    paintOrder: "stroke fill", // Order of painting
    textShadow: boxShadow || "",
    fontFamily: details.fontFamily || "Arial",
    fontWeight: details.fontWeight || "normal",
    lineHeight: details.lineHeight || "normal",
    letterSpacing: details.letterSpacing || "normal",
    wordSpacing: details.wordSpacing || "normal",
    wordWrap: details.wordWrap || "",
    wordBreak: details.wordBreak || "normal",
    textTransform: details.textTransform || "none",
    fontSize: details.fontSize || "16px",
    textAlign: details.textAlign || "left",
    color: details.color || "#000000",
    backgroundColor: details.backgroundColor || "transparent",
    borderRadius: `${Math.min(details.width, details.height) * ((details.borderRadius || 0) / 100)}px`
  };
};

export const calculateContainerStyles = (
  details: ITrackItem["details"],
  crop: ITrackItem["details"]["crop"] = {},
  overrides: React.CSSProperties = {},
  type?: string
): React.CSSProperties => {
  return {
    pointerEvents: "auto",
    top: details.top || 0,
    left: details.left || 0,
    width: crop.width || details.width || "100%",
    height:
      type === "text" || type === "caption"
        ? "max-content"
        : crop.height || details.height || "max-content",
    transform: details.transform || "none",
    opacity: details.opacity !== undefined ? details.opacity / 100 : 1,
    mixBlendMode:
      ((details as any).mixBlendMode as React.CSSProperties["mixBlendMode"]) ||
      "normal",
    transformOrigin: details.transformOrigin || "center center",
    filter: `brightness(${details.brightness}%) blur(${details.blur}px)`,
    rotate: details.rotate || "0deg",
    ...overrides // Merge overrides into the calculated styles
  };
};
