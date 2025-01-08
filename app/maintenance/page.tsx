'use client'

import { useState } from 'react'
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function MaintenancePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null)
  const [maintenanceDate, setMaintenanceDate] = useState('')
  const [maintenanceNotes, setMaintenanceNotes] = useState('')
  const [sensors, setSensors] = useState([
    { id: 1, name: 'Temperature Sensor 1', type: 'Temperature', location: 'Lettuce Room 3', lastMaintenance: '2024-06-15', status: 'Good' },
    { id: 2, name: 'Humidity Sensor 1', type: 'Humidity', location: 'Lettuce Room 3', lastMaintenance: '2024-06-20', status: 'Needs Attention' },
    { id: 3, name: 'CO2 Sensor 1', type: 'CO2', location: 'Lettuce Room 3', lastMaintenance: '2024-05-30', status: 'Critical' },
    { id: 4, name: 'pH Sensor 1', type: 'pH', location: 'Nutrient Tank 1', lastMaintenance: '2024-07-01', status: 'Good' },
    { id: 5, name: 'EC Sensor 1', type: 'EC', location: 'Nutrient Tank 1', lastMaintenance: '2024-07-05', status: 'Good' },
    { id: 6, name: 'Water Level Sensor 1', type: 'Water Level', location: 'Water Tank 1', lastMaintenance: '2024-06-25', status: 'Needs Attention' },
    { id: 7, name: 'Light Intensity Sensor 1', type: 'Light', location: 'Tomato Section', lastMaintenance: '2024-07-10', status: 'Good' },
    { id: 8, name: 'Airflow Sensor 1', type: 'Airflow', location: 'HVAC System', lastMaintenance: '2024-06-01', status: 'Critical' },
  ])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredSensors = sensors.filter(sensor => 
    sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sensor.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sensor.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'good': return 'bg-green-500'
      case 'needs attention': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const handleMaintenanceSubmit = () => {
    if (selectedSensor && maintenanceDate) {
      // Update the sensor's last maintenance date in the local state
      setSensors(sensors.map(sensor => 
        sensor.name === selectedSensor 
          ? { ...sensor, lastMaintenance: maintenanceDate, status: 'Good' } 
          : sensor
      ));

      // Reset form fields
      setSelectedSensor(null)
      setMaintenanceDate('')
      setMaintenanceNotes('')

      // Close the dialog (you'll need to add state for this)
      setIsDialogOpen(false)

      // Show a success message
      alert(`Maintenance logged for ${selectedSensor} on ${maintenanceDate}`)
    } else {
      alert("Please select a sensor and enter a maintenance date.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Sensor Maintenance</h1>
        <Card>
          <CardHeader>
            <CardTitle>Sensor Maintenance Schedule</CardTitle>
            <CardDescription>View and manage sensor maintenance for vertical farming systems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="w-1/3">
                <Label htmlFor="search">Search Sensors</Label>
                <Input
                  id="search"
                  placeholder="Search by name, type, or location"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsDialogOpen(true)}>Log Maintenance</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Maintenance</DialogTitle>
                    <DialogDescription>Record maintenance performed on a sensor</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="sensorSelect" className="text-right">Sensor</Label>
                      <Select value={selectedSensor || ''} onValueChange={setSelectedSensor} className="col-span-3">
                        <SelectTrigger id="sensorSelect">
                          <SelectValue placeholder="Select a sensor" />
                        </SelectTrigger>
                        <SelectContent>
                          {sensors.map((sensor) => (
                            <SelectItem key={sensor.id} value={sensor.name}>{sensor.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="maintenanceDate" className="text-right">Date</Label>
                      <Input
                        id="maintenanceDate"
                        type="date"
                        value={maintenanceDate}
                        onChange={(e) => setMaintenanceDate(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="maintenanceNotes" className="text-right">Notes</Label>
                      <Input
                        id="maintenanceNotes"
                        value={maintenanceNotes}
                        onChange={(e) => setMaintenanceNotes(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleMaintenanceSubmit}>Submit</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Maintenance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSensors.map((sensor) => (
                  <TableRow key={sensor.id}>
                    <TableCell>{sensor.name}</TableCell>
                    <TableCell>{sensor.type}</TableCell>
                    <TableCell>{sensor.location}</TableCell>
                    <TableCell>{sensor.lastMaintenance}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(sensor.status)}>
                        {sensor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

