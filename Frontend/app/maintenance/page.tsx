'use client'

import { useState, useEffect } from 'react'
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import axios from 'axios'

export default function MaintenancePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null)
  const [maintenanceDate, setMaintenanceDate] = useState('')
  const [maintenanceNotes, setMaintenanceNotes] = useState('')
  const [sensors, setSensors] = useState([])  // Start with an empty array
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10  // Define how many sensors per page

  // Fetch data from API when the component mounts
  useEffect(() => {
    axios.get('http://127.0.0.1:5001/sensors')
      .then(response => {
        setSensors(response.data)  // Set sensors state with API data
      })
      .catch(error => {
        console.error("Error fetching sensors:", error)
      })
  }, [])

  const filteredSensors = sensors.filter(sensor => 
    sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sensor.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sensor.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate total pages
  const totalPages = Math.ceil(filteredSensors.length / pageSize)

  // Get sensors for the current page
  const paginatedSensors = filteredSensors.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return 'bg-gray-500'; // Default color for null or undefined
    switch (status.toLowerCase()) {
      case 'normal': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }
  

  const handleMaintenanceSubmit = () => {
    if (selectedSensor && maintenanceDate) {
      // Update the sensor's last maintenance date in the local state
      setSensors(sensors.map(sensor => 
        sensor.name === selectedSensor 
          ? { ...sensor, lastMaintenance: maintenanceDate, status: maintenanceNotes } 
          : sensor
      ))

      // Reset form fields
      setSelectedSensor(null)
      setMaintenanceDate('')
      setMaintenanceNotes('')

      // Close the dialog
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

            {/* Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Maintenance</TableHead>
                  <TableHead>Status</TableHead>
                  {/* <TableHead>Actions</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSensors.map((sensor) => (
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
                    {/* <TableCell> */}
                      {/* <Button variant="ghost" size="sm">View Details</Button> */}
                    {/* </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex justify-between mt-4 items-center">
              {/* First Page Button */}
              <Button disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
                First
              </Button>

              {/* Previous Page Button */}
              <Button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex gap-2">
                {currentPage > 3 && (
                  <Button onClick={() => setCurrentPage(1)}>1</Button>
                )}

                {currentPage > 4 && <span className="px-2">...</span>}

                {Array.from({ length: 5 }).map((_, index) => {
                  const page = currentPage - 2 + index;
                  if (page > 0 && page <= totalPages) {
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'outline' : 'default'}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  }
                  return null;
                })}

                {currentPage < totalPages - 3 && <span className="px-2">...</span>}

                {currentPage < totalPages - 2 && (
                  <Button onClick={() => setCurrentPage(totalPages)}>{totalPages}</Button>
                )}
              </div>

              {/* Next Page Button */}
              <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                Next
              </Button>

              {/* Last Page Button */}
              <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
                Last
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
