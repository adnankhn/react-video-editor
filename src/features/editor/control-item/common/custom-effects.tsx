import { IImage, ITrackItem, IVideo } from "@designcombo/types";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useState, useEffect } from "react";
import {
  EASING_OPTIONS,
  EFFECT_EASING_DEFAULTS,
  EasingOption
} from "../../constants/easing-options";
import { useIsLargeScreen } from "@/hooks/use-media-query";

interface CustomEffectsProps {
  trackItem: ITrackItem & (IImage | IVideo);
}

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
  "slide-left": {
    id: "slide-left",
    name: "Slide Left",
    description: "Enters from the right edge"
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

export default function CustomEffects({ trackItem }: CustomEffectsProps) {
  return (
    <div className="flex flex-col gap-2 py-4">
      <Label className="font-sans text-xs font-semibold">Custom Effects</Label>
      <SelectCustomEffect trackItem={trackItem} />
    </div>
  );
}

const SelectCustomEffect = ({ trackItem }: CustomEffectsProps) => {
  const isLargeScreen = useIsLargeScreen();
  
  const [selectedEffect, setSelectedEffect] = useState<CustomEffectType>(
    ((trackItem.details as any).customEffect as CustomEffectType) || "none"
  );
  const [selectedEasing, setSelectedEasing] = useState<EasingOption>(
    "smoothSlide"
  );
  const [selectedDuration, setSelectedDuration] = useState<number>(21);
  const [selectedDistance, setSelectedDistance] = useState<number>(60);

  useEffect(() => {
    const currentEffect =
      ((trackItem.details as any).customEffect as CustomEffectType) || "none";
    setSelectedEffect(currentEffect);

    const currentEase = (trackItem.animations as any)?.in?.composition?.[0]
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

      const currentDuration = (trackItem.animations as any)?.in?.composition?.[0]
        ?.durationInFrames as number | undefined;
      const currentDistance = (trackItem.animations as any)?.in?.composition?.[0]
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

  const handleEffectChange = (effectId: CustomEffectType) => {
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

  return (
    <>
      {isLargeScreen ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Effect</Label>
            <Select
              value={selectedEffect}
              onValueChange={(value) =>
                handleEffectChange(value as CustomEffectType)
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CUSTOM_EFFECTS).map((effect) => (
                  <SelectItem key={effect.id} value={effect.id}>
                    {effect.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEffect !== "none" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Easing</Label>
                <Select
                  value={selectedEasing}
                  onValueChange={(value) =>
                    handleEasingChange(value as EasingOption)
                  }
                >
                  <SelectTrigger className="h-8">
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

              <div className="space-y-1">
                <div className="flex items-center justify-between">
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

              <div className="space-y-1">
                <div className="flex items-center justify-between">
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
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {Object.values(CUSTOM_EFFECTS).map((effect) => (
              <Button
                key={effect.id}
                variant={selectedEffect === effect.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleEffectChange(effect.id)}
                className="h-8 text-xs"
              >
                {effect.name}
              </Button>
            ))}
          </div>

          {selectedEffect !== "none" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Easing</Label>
                <Select
                  value={selectedEasing}
                  onValueChange={(value) =>
                    handleEasingChange(value as EasingOption)
                  }
                >
                  <SelectTrigger className="h-8">
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

              <div className="space-y-1">
                <div className="flex items-center justify-between">
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

              <div className="space-y-1">
                <div className="flex items-center justify-between">
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
        </div>
      )}
    </>
  );
};