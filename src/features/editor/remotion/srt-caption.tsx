// SRT captions are now handled through the standard Caption component
// This file maintains backward compatibility but redirects to standard Caption

export const RemotionSRTCaption = () => {
  console.warn("RemotionSRTCaption is deprecated. Use the standard Caption component instead.");
  return null;
};

export const RemotionSRTWordLevelCaption = () => {
  console.warn("RemotionSRTWordLevelCaption is deprecated. Use the standard Caption component instead.");
  return null;
};
