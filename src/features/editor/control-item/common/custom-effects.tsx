import { IImage, ITrackItem, IVideo } from "@designcombo/types";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT } from "@designcombo/state";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import useLayoutStore from "../../store/use-layout-store";
import { useIsLargeScreen } from "@/hooks/use-media-query";

interface CustomEffectsProps {
  trackItem: ITrackItem & (IImage | IVideo);
}

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
}

// Define custom effects based on the HTML project
const CUSTOM_EFFECTS: Record<CustomEffectType, CustomEffect> = {
  "none": {
    id: "none",
    name: "None",
    description: "No animation"
  },
  "fade-scale-bump": {
    id: "fade-scale-bump",
    name: "Fade + Bump",
    description: "Scale up with bounce"
  },
  "slide-up": {
    id: "slide-up",
    name: "Slide Up",
    description: "Fade in from below"
  },
  "swoosh-right": {
    id: "swoosh-right",
    name: "Swoosh Right",
    description: "Slide from right with skew"
  },
  "swoosh-left": {
    id: "swoosh-left",
    name: "Swoosh Left",
    description: "Slide from left with skew"
  },
  "blur-fade": {
    id: "blur-fade",
    name: "Blur Fade",
    description: "Blur to sharp transition"
  },
  "zoom-in": {
    id: "zoom-in",
    name: "Zoom In",
    description: "Scale down from large"
  },
  "bounce-in": {
    id: "bounce-in",
    name: "Bounce In",
    description: "Elastic bounce entrance"
  },
  "flip-in": {
    id: "flip-in",
    name: "Flip In",
    description: "3D Y-axis rotation"
  },
  "split-wipe-v": {
    id: "split-wipe-v",
    name: "Split Wipe V",
    description: "Vertical split reveal"
  },
  "split-wipe-h": {
    id: "split-wipe-h",
    name: "Split Wipe H",
    description: "Horizontal split reveal"
  }
};

export default function CustomEffects({ trackItem }: CustomEffectsProps) {
  return (
    <div className="flex flex-col gap-2 py-4">
      <Label className="font-sans text-xs font-semibold">Custom Effects</Label>
      <SelectCustomEffect trackItem={trackItem} />
    </div>
  );
}

const SelectCustomEffect = ({ trackItem }: CustomEffectsProps) => {
  const { setFloatingControl } = useLayoutStore();
  const isLargeScreen = useIsLargeScreen();
  
  const [selectedEffect, setSelectedEffect] = useState<CustomEffectType>(
    ((trackItem.details as any).customEffect as CustomEffectType) || "none"
  );

  useEffect(() => {
    setSelectedEffect(
      ((trackItem.details as any).customEffect as CustomEffectType) || "none"
    );
  }, [trackItem]);

  const handleEffectChange = (effectId: CustomEffectType) => {
    // Map custom effect to animation preset
    const presetMap: Record<CustomEffectType, string> = {
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
    
    const presetName = presetMap[effectId];
    
    if (presetName === "none") {
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
      // Apply animation with proper composition structure
      dispatch(EDIT_OBJECT, {
        payload: {
          [trackItem.id]: {
            animations: {
              in: {
                name: presetName,
                composition: [
                  {
                    property: effectId === "slide-up" ? "slideUp" : presetName,
                    from: 0,
                    to: 1,
                    durationInFrames: 30,
                    ease: "ease"
                  }
                ]
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

  const handleCustomEffectClick = () => {
    setFloatingControl("customEffects");
  };

  return (
    <>
      {isLargeScreen ? (
        <div className="relative w-32">
          <Button
            className="flex h-8 w-full items-center justify-between text-sm"
            variant="secondary"
            onClick={handleCustomEffectClick}
          >
            <div className="w-full text-left">
              <p className="truncate">{CUSTOM_EFFECTS[selectedEffect]?.name || "None"}</p>
            </div>
            <ChevronDown className="text-muted-foreground" size={14} />
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {Object.values(CUSTOM_EFFECTS).map((effect) => (
            <Button
              key={effect.id}
              variant={selectedEffect === effect.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleEffectChange(effect.id)}
              className="text-xs h-8"
            >
              {effect.name}
            </Button>
          ))}
        </div>
      )}
    </>
  );
};