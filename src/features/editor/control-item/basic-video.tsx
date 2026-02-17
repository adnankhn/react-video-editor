import { ScrollArea } from "@/components/ui/scroll-area";
import { IBoxShadow, ITrackItem, IVideo } from "@designcombo/types";
import Outline from "./common/outline";
import Shadow from "./common/shadow";
import Opacity from "./common/opacity";
import Corners from "./corners";
import AspectRatio from "./common/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Crop } from "lucide-react";
import Volume from "./common/volume";
import React, { useEffect, useState } from "react";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT } from "@designcombo/state";
import Speed from "./common/speed";
import useLayoutStore from "../store/use-layout-store";
import { Label } from "@/components/ui/label";
import { Animations } from "./common/animations";
import CustomEffects from "./common/custom-effects";
import BorderEffects from "./border-effects";

const BasicVideo = ({
  trackItem,
  type
}: {
  trackItem: ITrackItem & IVideo;
  type?: string;
}) => {
  const showAll = !type;
  const [properties, setProperties] = useState(trackItem);
  const { setCropTarget } = useLayoutStore();
  const handleChangeVolume = (v: number) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            volume: v
          }
        }
      }
    });

    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          volume: v
        }
      };
    });
  };

  const onChangeBorderWidth = (v: number) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            borderWidth: v
          }
        }
      }
    });
    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          borderWidth: v
        }
      };
    });
  };

  const onChangeBorderEffect = (v: string) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            borderEffect: v
          }
        }
      }
    });
    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          borderEffect: v
        }
      };
    });
  };

  const onChangeGlowSpread = (v: number) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            glowSpread: v
          }
        }
      }
    });
    setProperties((prev) => ({
      ...prev,
      details: { ...prev.details, glowSpread: v }
    }));
  };

  const onChangeGlowIntensity = (v: number) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            glowIntensity: v
          }
        }
      }
    });
    setProperties((prev) => ({
      ...prev,
      details: { ...prev.details, glowIntensity: v }
    }));
  };

  const onChangeBorderColor = (v: string) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            borderColor: v
          }
        }
      }
    });
    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          borderColor: v
        }
      };
    });
  };

  const handleChangeOpacity = (v: number) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            opacity: v
          }
        }
      }
    });
    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          opacity: v
        }
      };
    });
  };

  const onChangeBorderRadius = (v: number) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            borderRadius: v
          }
        }
      }
    });
    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          borderRadius: v
        }
      };
    });
  };

  const onChangeBoxShadow = (boxShadow: IBoxShadow) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            boxShadow: boxShadow
          }
        }
      }
    });

    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          boxShadow
        }
      };
    });
  };
  useEffect(() => {
    setProperties(trackItem);
  }, [trackItem]);

  const handleChangeSpeed = (v: number) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          playbackRate: v
        }
      }
    });

    setProperties((prev) => {
      return {
        ...prev,
        playbackRate: v
      };
    });
  };

  const components = [
    {
      key: "crop",
      component: (
        <div className="mb-4">
          <Button
            variant={"secondary"}
            size={"icon"}
            onClick={() => {
              setCropTarget(trackItem);
            }}
          >
            <Crop size={18} />
          </Button>
        </div>
      )
    },
    {
      key: "basic",
      component: (
        <div className="flex flex-col gap-2">
          <Label className="font-sans text-xs font-semibold text-primary">
            Basic
          </Label>
          <AspectRatio />
          <Volume
            onChange={(v: number) => handleChangeVolume(v)}
            value={properties.details.volume ?? 100}
          />
          <Opacity
            onChange={(v: number) => handleChangeOpacity(v)}
            value={properties.details.opacity ?? 100}
          />
          <Speed
            value={properties.playbackRate ?? 1}
            onChange={handleChangeSpeed}
          />
          <Corners
            label="Corners"
            value={properties.details.borderRadius as number}
            onChange={(v: number) => onChangeBorderRadius(v)}
          />
        </div>
      )
    },
    {
      key: "animations",
      component: <Animations trackItem={trackItem} properties={properties} />
    },
    {
      key: "customEffects",
      component: <CustomEffects trackItem={trackItem} />
    },
    {
      key: "outline",
      component: (
        <Outline
          onChageBorderWidth={(v: number) => onChangeBorderWidth(v)}
          onChangeBorderColor={(v: string) => onChangeBorderColor(v)}
          valueBorderWidth={properties.details.borderWidth as number}
          valueBorderColor={properties.details.borderColor as string}
          label="Outline"
        />
      )
    },
    {
      key: "borderEffects",
      component: (
        <BorderEffects
          label="Border Effects"
          value={(properties.details as any).borderEffect as string || "none"}
          onChange={(v: string) => onChangeBorderEffect(v)}
          glowSpread={(properties.details as any).glowSpread ?? 50}
          glowIntensity={(properties.details as any).glowIntensity ?? 50}
          onChangeGlowSpread={onChangeGlowSpread}
          onChangeGlowIntensity={onChangeGlowIntensity}
        />
      )
    },
    {
      key: "shadow",
      component: (
        <Shadow
          onChange={(v: IBoxShadow) => onChangeBoxShadow(v)}
          value={
            properties.details.boxShadow ?? {
              color: "transparent",
              x: 0,
              y: 0,
              blur: 0
            }
          }
          label="Shadow"
        />
      )
    }
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="text-text-primary flex h-12 flex-none items-center px-4 text-sm font-medium">
        Video
      </div>
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-2 px-4 py-4">
          {components
            .filter((comp) => showAll || comp.key === type)
            .map((comp) => (
              <React.Fragment key={comp.key}>{comp.component}</React.Fragment>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default BasicVideo;
