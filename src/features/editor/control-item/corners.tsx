import { Slider } from "@/components/ui/slider";

interface CornersProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export const Corners = ({ label, value, onChange }: CornersProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
        <span className="text-text-tertiary text-xs">{value}px</span>
      </div>
      <Slider
        min={0}
        max={100}
        step={1}
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
      />
    </div>
  );
};

export default Corners;