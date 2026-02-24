import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT } from "@designcombo/state";
import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  EASING_OPTIONS,
  EFFECT_EASING_DEFAULTS,
  EasingOption
} from "../../constants/easing-options";
import useLayoutStore from "../../store/use-layout-store";
import useClickOutside from "../../hooks/useClickOutside";

// Define custom effect types
type CustomEffectType = 
  | "fade-scale-bump"
  | "slide-up"
  | "slide-left"
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

const SPEED_MIN = 8;
const SPEED_MAX = 60;
const DISTANCE_MIN = 0;
const DISTANCE_MAX = 240;

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
  "slide-left": {
    id: "slide-left",
    name: "Slide Left",
    description: "Enters from the right edge",
    icon: "fa-arrow-left",
    className: "fx-slide-left"
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

const EFFECT_CONFIG: Record<
  Exclude<CustomEffectType, "none">,
  {
    name: string;
    property: string;
    durationInFrames: number;
    distance: number;
  }
> = {
  "fade-scale-bump": {
    name: "fadeScaleBump",
    property: "fadeScaleBump",
    durationInFrames: 13,
    distance: 18
  },
  "slide-up": {
    name: "upMovement",
    property: "slideUp",
    durationInFrames: 21,
    distance: 60
  },
  "slide-left": {
    name: "leftMovement",
    property: "slideLeft",
    durationInFrames: 19,
    distance: 80
  },
  "swoosh-right": {
    name: "swooshRight",
    property: "swooshRight",
    durationInFrames: 19,
    distance: 80
  },
  "swoosh-left": {
    name: "swooshLeft",
    property: "swooshLeft",
    durationInFrames: 19,
    distance: 80
  },
  "blur-fade": {
    name: "blurFade",
    property: "blurFade",
    durationInFrames: 18,
    distance: 12
  },
  "zoom-in": {
    name: "zoomIn",
    property: "zoomIn",
    durationInFrames: 15,
    distance: 20
  },
  "bounce-in": {
    name: "bounceIn",
    property: "bounceIn",
    durationInFrames: 15,
    distance: 24
  },
  "flip-in": {
    name: "flipIn",
    property: "flipIn",
    durationInFrames: 16,
    distance: 20
  },
  "split-wipe-v": {
    name: "splitWipeV",
    property: "splitWipeV",
    durationInFrames: 18,
    distance: 50
  },
  "split-wipe-h": {
    name: "splitWipeH",
    property: "splitWipeH",
    durationInFrames: 18,
    distance: 50
  }
};

const CustomEffects = () => {
  const { setFloatingControl, trackItem } = useLayoutStore();
  const [selectedEffect, setSelectedEffect] = useState<CustomEffectType>("none");
  const [selectedEasing, setSelectedEasing] = useState<EasingOption>(
    "smoothSlide"
  );
  const [selectedDuration, setSelectedDuration] = useState<number>(21);
  const [selectedDistance, setSelectedDistance] = useState<number>(60);

  // Initialize with the current effect if available
  useEffect(() => {
    const currentEffect =
      (trackItem?.details?.customEffect as CustomEffectType) || "none";
    setSelectedEffect(currentEffect);

    const currentEase = (trackItem?.animations as any)?.in?.composition?.[0]
      ?.ease as EasingOption | undefined;
    if (currentEase) {
      setSelectedEasing(currentEase);
    }

    if (currentEffect !== "none") {
      const config = EFFECT_CONFIG[currentEffect];
      if (!currentEase) {
        setSelectedEasing(
          EFFECT_EASING_DEFAULTS[config.property] || "smoothSlide"
        );
      }

      const currentDuration = (trackItem?.animations as any)?.in?.composition?.[0]
        ?.durationInFrames as number | undefined;
      const currentDistance = (trackItem?.animations as any)?.in?.composition?.[0]
        ?.distance as number | undefined;

      setSelectedDuration(
        typeof currentDuration === "number"
          ? currentDuration
          : config.durationInFrames
      );
      setSelectedDistance(
        typeof currentDistance === "number" ? currentDistance : config.distance
      );
    } else {
      setSelectedEasing("smoothSlide");
      setSelectedDuration(21);
      setSelectedDistance(60);
    }
  }, [trackItem]);

  const applyEffect = (
    effectId: CustomEffectType,
    options?: {
      easingId?: EasingOption;
      durationInFrames?: number;
      distance?: number;
    }
  ) => {
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
      const config = EFFECT_CONFIG[effectId];
      const ease =
        options?.easingId ||
        EFFECT_EASING_DEFAULTS[config.property] ||
        "smoothSlide";
      const durationInFrames =
        options?.durationInFrames || config.durationInFrames;
      const distance = options?.distance ?? config.distance;
      
      // Apply animation
      dispatch(EDIT_OBJECT, {
        payload: {
          [trackItem.id]: {
            animations: {
              in: {
                name: config.name,
                composition: [
                  {
                    property: config.property,
                    from: 0,
                    to: 1,
                    durationInFrames,
                    ease,
                    distance
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

  const handleEffectSelect = (effectId: CustomEffectType) => {
    if (effectId === "none") {
      setSelectedEffect(effectId);
      applyEffect(effectId);
      return;
    }

    const config = EFFECT_CONFIG[effectId];
    const defaultEase = EFFECT_EASING_DEFAULTS[config.property] || "smoothSlide";
    setSelectedEffect(effectId);
    setSelectedEasing(defaultEase);
    setSelectedDuration(config.durationInFrames);
    setSelectedDistance(config.distance);
    applyEffect(effectId, {
      easingId: defaultEase,
      durationInFrames: config.durationInFrames,
      distance: config.distance
    });
  };

  const handleEasingChange = (easingId: EasingOption) => {
    setSelectedEasing(easingId);
    if (selectedEffect !== "none") {
      applyEffect(selectedEffect, {
        easingId,
        durationInFrames: selectedDuration,
        distance: selectedDistance
      });
    }
  };

  const handleSpeedChange = (durationInFrames: number) => {
    const clamped = Math.min(Math.max(durationInFrames, SPEED_MIN), SPEED_MAX);
    setSelectedDuration(clamped);
    if (selectedEffect !== "none") {
      applyEffect(selectedEffect, {
        easingId: selectedEasing,
        durationInFrames: clamped,
        distance: selectedDistance
      });
    }
  };

  const handleDistanceChange = (distance: number) => {
    const clamped = Math.min(Math.max(distance, DISTANCE_MIN), DISTANCE_MAX);
    setSelectedDistance(clamped);
    if (selectedEffect !== "none") {
      applyEffect(selectedEffect, {
        easingId: selectedEasing,
        durationInFrames: selectedDuration,
        distance: clamped
      });
    }
  };

  const handleResetEffect = () => {
    if (selectedEffect === "none") return;

    const config = EFFECT_CONFIG[selectedEffect];
    const defaultEase = EFFECT_EASING_DEFAULTS[config.property] || "smoothSlide";
    setSelectedEasing(defaultEase);
    setSelectedDuration(config.durationInFrames);
    setSelectedDistance(config.distance);
    applyEffect(selectedEffect, {
      easingId: defaultEase,
      durationInFrames: config.durationInFrames,
      distance: config.distance
    });
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
                  onClick={() => handleEffectSelect(effect.id)}
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

            {selectedEffect !== "none" && (
              <div className="space-y-3 px-2 pb-4">
                <div>
                  <p className="mb-2 text-xs font-medium">Easing</p>
                  <Select
                    value={selectedEasing}
                    onValueChange={(value) =>
                      handleEasingChange(value as EasingOption)
                    }
                  >
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EASING_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label className="text-xs">Speed (frames)</Label>
                    <Input
                      type="number"
                      className="h-7 w-16 px-2 text-right text-xs"
                      value={selectedDuration}
                      min={SPEED_MIN}
                      max={SPEED_MAX}
                      onChange={(e) =>
                        handleSpeedChange(Number(e.target.value || SPEED_MIN))
                      }
                    />
                  </div>
                  <Slider
                    value={[selectedDuration]}
                    min={SPEED_MIN}
                    max={SPEED_MAX}
                    step={1}
                    onValueChange={(value) => handleSpeedChange(value[0])}
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label className="text-xs">Travel distance (px)</Label>
                    <Input
                      type="number"
                      className="h-7 w-16 px-2 text-right text-xs"
                      value={selectedDistance}
                      min={DISTANCE_MIN}
                      max={DISTANCE_MAX}
                      onChange={(e) =>
                        handleDistanceChange(
                          Number(e.target.value || DISTANCE_MIN)
                        )
                      }
                    />
                  </div>
                  <Slider
                    value={[selectedDistance]}
                    min={DISTANCE_MIN}
                    max={DISTANCE_MAX}
                    step={1}
                    onValueChange={(value) => handleDistanceChange(value[0])}
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-full"
                  onClick={handleResetEffect}
                >
                  Reset to default
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default CustomEffects;