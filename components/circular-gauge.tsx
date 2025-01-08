interface CircularGaugeProps {
  value: number
  max: number
  label: string
  room: string
  shelf: number
}

export function CircularGauge({ value, max, label, room, shelf }: CircularGaugeProps) {
  const percentage = (value / max) * 100
  const rotation = (percentage / 100) * 180

  return (
    <div className="relative w-full aspect-[2/1]">
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold">{value.toFixed(2)}</div>
        <div className="text-sm text-muted-foreground">
          Room: {room}, Shelf: {shelf}
        </div>
      </div>
      <svg className="w-full h-full" viewBox="0 0 100 60">
        <path
          d="M10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-muted"
        />
        <path
          d="M10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeDasharray={`${(180 * rotation) / 180} 180`}
          className="text-green-500"
        />
        <text x="10" y="50" className="text-xs">{0}</text>
        <text x="85" y="50" className="text-xs">{max}</text>
      </svg>
    </div>
  )
}

