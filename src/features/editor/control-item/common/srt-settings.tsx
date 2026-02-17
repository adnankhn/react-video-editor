import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { 
  Captions as CaptionsIcon,
  Palette,
  Type,
  AlignCenter,
  AlignLeft,
  AlignRight
} from "lucide-react";
import useLayoutStore from "../../store/use-layout-store";
import { ITrackItem } from "@designcombo/types";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT } from "@designcombo/state";

interface SRTPreset {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontWeight: string;
  textAlign: "left" | "center" | "right";
  padding: number;
  borderRadius: number;
  showBackground: boolean;
}

const SRT_PRESETS: SRTPreset[] = [
  {
    id: "default",
    name: "Default Style",
    backgroundColor: "#000000",
    textColor: "#FFFFFF",
    fontSize: 24,
    fontWeight: "normal",
    textAlign: "center",
    padding: 16,
    borderRadius: 8,
    showBackground: true
  },
  {
    id: "minimal",
    name: "Minimal",
    backgroundColor: "transparent",
    textColor: "#FFFFFF",
    fontSize: 20,
    fontWeight: "normal",
    textAlign: "center",
    padding: 8,
    borderRadius: 0,
    showBackground: false
  },
  {
    id: "highlight",
    name: "Highlight Style",
    backgroundColor: "#000000CC",
    textColor: "#FFFF00",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    padding: 20,
    borderRadius: 12,
    showBackground: true
  }
];

interface SRTSettingsProps {
  trackItem: ITrackItem & any;
}

const SRTSettings: React.FC<SRTSettingsProps> = ({ trackItem }) => {
  const { setFloatingControl } = useLayoutStore();
  const [selectedPreset, setSelectedPreset] = useState<string>("default");
  const [settings, setSettings] = useState({
    backgroundColor: "#000000",
    textColor: "#FFFFFF",
    fontSize: 24,
    fontWeight: "normal",
    textAlign: "center" as "left" | "center" | "right",
    padding: 16,
    borderRadius: 8,
    showBackground: true
  });

  // Initialize with track item settings
  useEffect(() => {
    if (trackItem?.details) {
      setSettings({
        backgroundColor: trackItem.details.backgroundColor || "#000000",
        textColor: trackItem.details.textColor || "#FFFFFF",
        fontSize: trackItem.details.fontSize || 24,
        fontWeight: trackItem.details.fontWeight || "normal",
        textAlign: trackItem.details.textAlign || "center",
        padding: trackItem.details.padding || 16,
        borderRadius: trackItem.details.borderRadius || 8,
        showBackground: trackItem.details.showBackground !== false
      });
    }
  }, [trackItem]);

  const applySettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            backgroundColor: newSettings.backgroundColor,
            textColor: newSettings.textColor,
            fontSize: newSettings.fontSize,
            fontWeight: newSettings.fontWeight,
            textAlign: newSettings.textAlign,
            padding: newSettings.padding,
            borderRadius: newSettings.borderRadius,
            showBackground: newSettings.showBackground
          }
        }
      }
    });
  };

  const handlePresetChange = (presetId: string) => {
    const preset = SRT_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      applySettings({
        backgroundColor: preset.backgroundColor,
        textColor: preset.textColor,
        fontSize: preset.fontSize,
        fontWeight: preset.fontWeight,
        textAlign: preset.textAlign,
        padding: preset.padding,
        borderRadius: preset.borderRadius,
        showBackground: preset.showBackground
      });
    }
  };

  const updateSetting = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    applySettings(newSettings);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <CaptionsIcon className="w-4 h-4" />
        <Label className="font-medium">SRT Caption Settings</Label>
      </div>

      {/* Preset Selection */}
      <div className="space-y-2">
        <Label className="text-xs">Template</Label>
        <Select value={selectedPreset} onValueChange={handlePresetChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a template" />
          </SelectTrigger>
          <SelectContent>
            {SRT_PRESETS.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Text Color */}
      <div className="space-y-2">
        <Label className="text-xs flex items-center gap-2">
          <Palette className="w-3 h-3" />
          Text Color
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={settings.textColor}
            onChange={(e) => updateSetting("textColor", e.target.value)}
            className="w-12 h-8 p-1"
          />
          <Input
            type="text"
            value={settings.textColor}
            onChange={(e) => updateSetting("textColor", e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      {/* Background Settings */}
      <Card className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: settings.backgroundColor }}
            />
            Background
          </Label>
          <Switch
            checked={settings.showBackground}
            onCheckedChange={(checked) => updateSetting("showBackground", checked)}
          />
        </div>
        
        {settings.showBackground && (
          <>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={settings.backgroundColor}
                onChange={(e) => updateSetting("backgroundColor", e.target.value)}
                className="w-12 h-8 p-1"
              />
              <Input
                type="text"
                value={settings.backgroundColor}
                onChange={(e) => updateSetting("backgroundColor", e.target.value)}
                className="flex-1"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">Background Opacity</Label>
              <Slider
                value={[parseInt(settings.backgroundColor.slice(7, 9) || "FF", 16) / 2.55]}
                onValueChange={([value]) => {
                  const alpha = Math.round(value * 2.55).toString(16).padStart(2, "0");
                  const color = settings.backgroundColor.slice(0, 7) + alpha;
                  updateSetting("backgroundColor", color);
                }}
                max={100}
                step={1}
              />
            </div>
          </>
        )}
      </Card>

      {/* Text Settings */}
      <Card className="p-3 space-y-3">
        <Label className="text-xs flex items-center gap-2">
          <Type className="w-3 h-3" />
          Text Appearance
        </Label>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Font Size</Label>
            <Input
              type="number"
              value={settings.fontSize}
              onChange={(e) => updateSetting("fontSize", parseInt(e.target.value) || 24)}
              min={12}
              max={72}
            />
          </div>
          
          <div>
            <Label className="text-xs">Padding</Label>
            <Input
              type="number"
              value={settings.padding}
              onChange={(e) => updateSetting("padding", parseInt(e.target.value) || 16)}
              min={0}
              max={50}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={settings.fontWeight === "bold" ? "default" : "outline"}
            size="sm"
            onClick={() => updateSetting("fontWeight", settings.fontWeight === "bold" ? "normal" : "bold")}
          >
            Bold
          </Button>
          
          <div className="flex-1 flex gap-1">
            <Button
              variant={settings.textAlign === "left" ? "default" : "outline"}
              size="icon"
              onClick={() => updateSetting("textAlign", "left")}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              variant={settings.textAlign === "center" ? "default" : "outline"}
              size="icon"
              onClick={() => updateSetting("textAlign", "center")}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant={settings.textAlign === "right" ? "default" : "outline"}
              size="icon"
              onClick={() => updateSetting("textAlign", "right")}
            >
              <AlignRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview */}
      <Card className="p-3">
        <Label className="text-xs block mb-2">Preview</Label>
        <div 
          className="text-center p-3 rounded"
          style={{
            backgroundColor: settings.showBackground ? settings.backgroundColor : "transparent",
            color: settings.textColor,
            fontSize: `${settings.fontSize}px`,
            fontWeight: settings.fontWeight,
            padding: `${settings.padding}px`,
            borderRadius: `${settings.borderRadius}px`,
            textAlign: settings.textAlign as any
          }}
        >
          Sample Caption Text
        </div>
      </Card>
    </div>
  );
};

export default SRTSettings;