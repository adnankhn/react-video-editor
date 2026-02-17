import useLayoutStore from "../../store/use-layout-store";
import AnimationCaption from "./animation-caption";
import AnimationPicker from "./animation-picker";
import CaptionPresetPicker from "./caption-preset-picker";
import FontFamilyPicker from "./font-family-picker";
import TextPresetPicker from "./text-preset-picker";
import CustomEffects from "./custom-effects";

export default function FloatingControl() {
  const { floatingControl, trackItem } = useLayoutStore();

  console.log("FloatingControl render:", {
    floatingControl,
    hasTrackItem: !!trackItem,
    trackItemType: trackItem?.type,
  });

  if (!trackItem) return null;

  if (floatingControl === "font-family-picker") {
    return <FontFamilyPicker />;
  }
  if (floatingControl === "text-preset-picker") {
    return <TextPresetPicker trackItem={trackItem} />;
  }
  if (floatingControl === "animation-picker") {
    console.log("Rendering AnimationPicker");
    return (
      <AnimationPicker
        animationType={trackItem.type === "text" ? "text" : undefined}
      />
    );
  }
  if (floatingControl === "animation-caption") {
    return <AnimationCaption />;
  }
  if (floatingControl === "caption-preset-picker") {
    return <CaptionPresetPicker trackItem={trackItem} />;
  }
  if (floatingControl === "customEffects") {
    return <CustomEffects />;
  }
  return null;
}
