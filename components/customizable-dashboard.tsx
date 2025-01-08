import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CircularGauge } from "@/components/circular-gauge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

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

interface CustomizableDashboardProps {
  allSensors: Sensor[];
  rooms: Room[];
}

export function CustomizableDashboard({ allSensors, rooms }: CustomizableDashboardProps) {
  const [selectedSensors, setSelectedSensors] = useState<Sensor[]>([])
  const [availableSensors, setAvailableSensors] = useState<Sensor[]>([])

  useEffect(() => {
    setAvailableSensors(allSensors.filter(sensor => !selectedSensors.some(s => s.id === sensor.id)))
  }, [allSensors, selectedSensors])

  const addSensor = (sensorId: string) => {
    const sensorToAdd = availableSensors.find(s => s.id === sensorId)
    if (sensorToAdd) {
      setSelectedSensors([...selectedSensors, sensorToAdd])
    }
  }

  const removeSensor = (sensorId: string) => {
    setSelectedSensors(selectedSensors.filter(s => s.id !== sensorId))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Customizable Dashboard</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Sensor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Sensor to Dashboard</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sensor-select" className="text-right">
                  Sensor
                </Label>
                <Select onValueChange={addSensor}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a sensor" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSensors.map((sensor) => (
                      <SelectItem key={sensor.id} value={sensor.id}>
                        {sensor.name} - {sensor.type} (Room: {rooms.find(r => r.id === sensor.room)?.name}, Shelf: {sensor.shelf})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {selectedSensors.map((sensor) => (
          <Card key={sensor.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {sensor.name} - {sensor.type}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => removeSensor(sensor.id)}>
                Remove
              </Button>
            </CardHeader>
            <CardContent>
              <CircularGauge
                value={sensor.value}
                max={100}
                label={sensor.type}
                room={rooms.find(r => r.id === sensor.room)?.name || ''}
                shelf={sensor.shelf}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

