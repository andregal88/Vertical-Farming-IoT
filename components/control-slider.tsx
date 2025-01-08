import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface ControlSliderProps {
  label: string
  value: number
  max: number
  onChange: (value: number[]) => void
}

export function ControlSlider({ label, value, max, onChange }: ControlSliderProps) {
  return (
    <div className="grid gap-2">
      <div className="flex justify-between">
        <Label>{label}</Label>
        <span className="text-sm text-muted-foreground">{value}/{max}</span>
      </div>
      <Slider
        value={[value]}
        max={max}
        step={1}
        className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
        onValueChange={onChange}
      />
    </div>
  )
}

