import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Sensor {
  id: string;
  name: string;
  type: string;
  value: number;
  room: string;
  shelf: number;
}

interface Room {
  id: string;
  name: string;
  shelves: number;
}

interface SensorManagementProps {
  sensors: Sensor[];
  rooms: Room[];
  onAddSensor: (sensor: Omit<Sensor, 'id'>) => void;
  onRemoveSensor: (id: string) => void;
}

export function SensorManagement({ sensors, rooms, onAddSensor, onRemoveSensor }: SensorManagementProps) {
  const [newSensor, setNewSensor] = useState<Omit<Sensor, 'id'>>({
    name: '',
    type: '',
    value: 0,
    room: '',
    shelf: 1
  })

  const handleAddSensor = () => {
    if (newSensor.name && newSensor.type && newSensor.room) {
      onAddSensor(newSensor)
      setNewSensor({ name: '', type: '', value: 0, room: '', shelf: 1 })
    }
  }

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add New Sensor</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Sensor</DialogTitle>
            <DialogDescription>Enter the details for the new sensor.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={newSensor.name}
                onChange={(e) => setNewSensor({...newSensor, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Input
                id="type"
                value={newSensor.type}
                onChange={(e) => setNewSensor({...newSensor, type: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="room" className="text-right">Room</Label>
              <Select
                value={newSensor.room}
                onValueChange={(value) => setNewSensor({...newSensor, room: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shelf" className="text-right">Shelf</Label>
              <Select
                value={newSensor.shelf.toString()}
                onValueChange={(value) => setNewSensor({...newSensor, shelf: parseInt(value)})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select shelf" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: rooms.find(r => r.id === newSensor.room)?.shelves || 0 }, (_, i) => (
                    <SelectItem key={i} value={(i + 1).toString()}>{i + 1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddSensor}>Add Sensor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Current Sensors</h3>
        <ul className="space-y-2">
          {sensors.map((sensor) => (
            <li key={sensor.id} className="flex justify-between items-center">
              <span>{sensor.name} - {sensor.type} (Room: {sensor.room}, Shelf: {sensor.shelf})</span>
              <Button variant="destructive" size="sm" onClick={() => onRemoveSensor(sensor.id)}>Remove</Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

