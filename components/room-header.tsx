import { Bell, ExternalLink, Grid, Lock } from 'lucide-react'

export function RoomHeader() {
  return (
    <div className="flex items-center justify-between p-4">
      <h1 className="text-xl font-semibold">Lettuce Room 3</h1>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-muted rounded-lg">
          <Grid className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg">
          <ExternalLink className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg">
          <Lock className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

