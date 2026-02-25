import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const BLEND_MODES: { value: string; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "screen", label: "Screen" },
  { value: "multiply", label: "Multiply" },
  { value: "overlay", label: "Overlay" },
  { value: "lighten", label: "Lighten" },
  { value: "darken", label: "Darken" },
  { value: "color-dodge", label: "Color Dodge" },
  { value: "color-burn", label: "Color Burn" },
  { value: "hard-light", label: "Hard Light" },
  { value: "soft-light", label: "Soft Light" },
  { value: "difference", label: "Difference" },
  { value: "exclusion", label: "Exclusion" },
  { value: "hue", label: "Hue" },
  { value: "saturation", label: "Saturation" },
  { value: "color", label: "Color" },
  { value: "luminosity", label: "Luminosity" }
];

const BlendMode = ({
  value,
  onChange
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 items-center text-sm text-muted-foreground">
        Blend Mode
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {BLEND_MODES.map((mode) => (
            <SelectItem key={mode.value} value={mode.value} className="text-xs">
              {mode.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BlendMode;
