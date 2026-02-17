import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";

interface BorderEffectsProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  glowSpread?: number;
  glowIntensity?: number;
  onChangeGlowSpread?: (value: number) => void;
  onChangeGlowIntensity?: (value: number) => void;
}

export const BorderEffects = ({
  label,
  value,
  onChange,
  glowSpread = 50,
  glowIntensity = 50,
  onChangeGlowSpread,
  onChangeGlowIntensity
}: BorderEffectsProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={onChange}
        className="flex w-full"
      >
        <ToggleGroupItem
          value="none"
          className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          None
        </ToggleGroupItem>
        <ToggleGroupItem
          value="glow"
          className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          Glow
        </ToggleGroupItem>
        <ToggleGroupItem
          value="glass"
          className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          Glass
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Glow adjustment sliders - only visible when glow is selected */}
      {value === "glow" && (
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-xs">Spread</span>
              <span className="text-text-tertiary text-xs">{glowSpread}%</span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[glowSpread]}
              onValueChange={(values) => onChangeGlowSpread?.(values[0])}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-xs">Intensity</span>
              <span className="text-text-tertiary text-xs">{glowIntensity}%</span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[glowIntensity]}
              onValueChange={(values) => onChangeGlowIntensity?.(values[0])}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BorderEffects;