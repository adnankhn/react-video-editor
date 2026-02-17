import { ScrollArea } from "@/components/ui/scroll-area";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT } from "@designcombo/state";
import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import useLayoutStore from "../../store/use-layout-store";
import useClickOutside from "../../hooks/useClickOutside";
import useStore from "../../store/use-store";

// Define custom effect types
type CustomEffectType = 
  | "fade-scale-bump"
  | "slide-up"
  | "swoosh-right"
  | "swoosh-left"
  | "blur-fade"
  | "zoom-in"
  | "bounce-in"
  | "flip-in"
  | "split-wipe-v"
  | "split-wipe-h"
  | "none";

interface CustomEffect {
  id: CustomEffectType;
  name: string;
  description: string;
  icon: string;
  className: string;
}

// Define custom effects based on the HTML project
const CUSTOM_EFFECTS: Record<CustomEffectType, CustomEffect> = {
  "none": {
    id: "none",
    name: "None",
    description: "No animation",
    icon: "fa-ban",
    className: ""
  },
  "fade-scale-bump": {
    id: "fade-scale-bump",
    name: "Fade + Bump",
    description: "Scale up with bounce",
    icon: "fa-expand",
    className: "fx-fade-scale-bump"
  },
  "slide-up": {
    id: "slide-up",
    name: "Slide Up",
    description: "Fade in from below",
    icon: "fa-arrow-up",
    className: "fx-slide-up"
  },
  "swoosh-right": {
    id: "swoosh-right",
    name: "Swoosh Right",
    description: "Slide from right with skew",
    icon: "fa-long-arrow-alt-right",
    className: "fx-swoosh-right"
  },
  "swoosh-left": {
    id: "swoosh-left",
    name: "Swoosh Left",
    description: "Slide from left with skew",
    icon: "fa-long-arrow-alt-left",
    className: "fx-swoosh-left"
  },
  "blur-fade": {
    id: "blur-fade",
    name: "Blur Fade",
    description: "Blur to sharp transition",
    icon: "fa-tint",
    className: "fx-blur-fade"
  },
  "zoom-in": {
    id: "zoom-in",
    name: "Zoom In",
    description: "Scale down from large",
    icon: "fa-search-plus",
    className: "fx-zoom-in"
  },
  "bounce-in": {
    id: "bounce-in",
    name: "Bounce In",
    description: "Elastic bounce entrance",
    icon: "fa-basketball-ball",
    className: "fx-bounce-in"
  },
  "flip-in": {
    id: "flip-in",
    name: "Flip In",
    description: "3D Y-axis rotation",
    icon: "fa-sync-alt",
    className: "fx-flip-in"
  },
  "split-wipe-v": {
    id: "split-wipe-v",
    name: "Split Wipe V",
    description: "Vertical split reveal",
    icon: "fa-arrows-alt-v",
    className: "fx-split-wipe-v"
  },
  "split-wipe-h": {
    id: "split-wipe-h",
    name: "Split Wipe H",
    description: "Horizontal split reveal",
    icon: "fa-arrows-alt-h",
    className: "fx-split-wipe-h"
  }
};

const CustomEffects = () => {
  const { setFloatingControl, trackItem } = useLayoutStore();
  const { trackItemsMap } = useStore();
  const [selectedEffect, setSelectedEffect] = useState<CustomEffectType>("none");

  // Initialize with the current effect if available
  useEffect(() => {
    if (trackItem?.details?.customEffect) {
      setSelectedEffect(trackItem.details.customEffect as CustomEffectType);
    } else {
      setSelectedEffect("none");
    }
  }, [trackItem]);

  const applyEffect = (effectId: CustomEffectType) => {
    if (!trackItem?.id) {
      console.warn("No active ID to apply the effect to.");
      return;
    }

    if (effectId === "none") {
      // Remove animations
      dispatch(EDIT_OBJECT, {
        payload: {
          [trackItem.id]: {
            animations: {
              in: null,
              out: null,
              loop: null
            },
            details: {
              customEffect: effectId
            }
          }
        }
      });
    } else {
      // Create proper composition based on effect type
      const compositionMap: Record<CustomEffectType, any[]> = {
        "none": [],
        "fade-scale-bump": [
          { property: "fadeScaleBump", from: 0, to: 1, durationInFrames: 30, ease: "ease" }
        ],
        "slide-up": [
          { property: "slideUp", from: 0, to: 1, durationInFrames: 30, ease: "ease" }
        ],
        "swoosh-right": [
          { property: "swooshRight", from: 0, to: 1, durationInFrames: 30, ease: "ease" }
        ],
        "swoosh-left": [
          { property: "swooshLeft", from: 0, to: 1, durationInFrames: 30, ease: "ease" }
        ],
        "blur-fade": [
          { property: "blurFade", from: 0, to: 1, durationInFrames: 30, ease: "ease" }
        ],
        "zoom-in": [
          { property: "zoomIn", from: 0, to: 1, durationInFrames: 30, ease: "ease" }
        ],
        "bounce-in": [
          { property: "bounceIn", from: 0, to: 1, durationInFrames: 30, ease: "ease" }
        ],
        "flip-in": [
          { property: "flipIn", from: 0, to: 1, durationInFrames: 30, ease: "ease" }
        ],
        "split-wipe-v": [
          { property: "splitWipeV", from: 0, to: 1, durationInFrames: 30, ease: "ease" }
        ],
        "split-wipe-h": [
          { property: "splitWipeH", from: 0, to: 1, durationInFrames: 30, ease: "ease" }
        ]
      };

      const presetNameMap: Record<CustomEffectType, string> = {
        "none": "none",
        "fade-scale-bump": "fadeScaleBump",
        "slide-up": "upMovement",  // Changed to NOT include "slide"
        "swoosh-right": "swooshRight",
        "swoosh-left": "swooshLeft",
        "blur-fade": "blurFade",
        "zoom-in": "zoomIn",
        "bounce-in": "bounceIn",
        "flip-in": "flipIn",
        "split-wipe-v": "splitWipeV",
        "split-wipe-h": "splitWipeH"
      };
      
      // Apply animation
      dispatch(EDIT_OBJECT, {
        payload: {
          [trackItem.id]: {
            animations: {
              in: {
                name: presetNameMap[effectId],
                composition: compositionMap[effectId]
              }
            },
            details: {
              customEffect: effectId
            }
          }
        }
      });
    }
    
    setSelectedEffect(effectId);
  };

  const floatingRef = useRef<HTMLDivElement>(null);

  useClickOutside(floatingRef as React.RefObject<HTMLElement>, () =>
    setFloatingControl("")
  );

  return (
    <div
      className="bg-sidebar absolute right-2 top-2 z-[200] h-[calc(100%-80px)] w-64 border p-0"
      ref={floatingRef}
    >
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="handle flex cursor-grab justify-between">
          <p>Custom Effects</p>
          <div className="h-4 w-4" onClick={() => setFloatingControl("")}>
            <X className="h-3 w-3 cursor-pointer font-extrabold text-muted-foreground" />
          </div>
        </div>
        <div className="h-full overflow-hidden">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-1 gap-2 py-4">
              {Object.values(CUSTOM_EFFECTS).map((effect) => (
                <div
                  key={effect.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 ${
                    selectedEffect === effect.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onClick={() => applyEffect(effect.id)}
                >
                  <div className="w-8">
                    <i className={`fas ${effect.icon}`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{effect.name}</div>
                    <div className="text-xs opacity-70">{effect.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default CustomEffects;