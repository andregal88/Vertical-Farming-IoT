'use client'

import { useState, useEffect } from 'react'
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from 'next/link'
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function DevicesAndSensorsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [rooms, setRooms] = useState([
    { id: 'room1', name: 'Lettuce Room 3', shelves: 5, cropType: 'Lettuce' },
    { id: 'room2', name: 'Tomato Section', shelves: 4, cropType: 'Tomatoes' },
  ])
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomShelves, setNewRoomShelves] = useState('3')
  const [selectedRoom, setSelectedRoom] = useState('')
  const [soilAmount, setSoilAmount] = useState('')
  const [newCropType, setNewCropType] = useState('')
  const [devices, setDevices] = useState([
    { id: 'sensor1', name: 'Temperature Sensor 1', type: 'Temperature', location: 'Lettuce Room 3', status: 'Active', value: 25, max: 40 },
    { id: 'sensor2', name: 'Humidity Sensor 1', type: 'Humidity', location: 'Lettuce Room 3', status: 'Active', value: 60, max: 100 },
    { id: 'sensor3', name: 'CO2 Sensor 1', type: 'CO2', location: 'Lettuce Room 3', status: 'Active', value: 800, max: 2000 },
    { id: 'sensor4', name: 'Light Intensity Sensor 1', type: 'Light Intensity', location: 'Tomato Section', status: 'Active', value: 70, max: 100 },
    { id: 'sensor5', name: 'pH Sensor 1', type: 'pH', location: 'Lettuce Room 3', status: 'Active', value: 6.5, max: 14 },
    { id: 'sensor6', name: 'EC Sensor 1', type: 'EC', location: 'Lettuce Room 3', status: 'Active', value: 1.5, max: 5 },
  ])
  const [newDevice, setNewDevice] = useState({ name: '', type: '', location: '' })
  const [editingDevice, setEditingDevice] = useState(null)
  const [soilHealth, setSoilHealth] = useState({ ph: 6.5, nitrogen: 50, moisture: 60 })
  const [soilMoistureTrend, setSoilMoistureTrend] = useState([])
  const [autoSoilTest, setAutoSoilTest] = useState(false)
  const [nextSoilTest, setNextSoilTest] = useState('')
  const [temperature, setTemperature] = useState(25)
  const [humidity, setHumidity] = useState(60)
  const [co2Level, setCO2Level] = useState(800)
  const [lightIntensity, setLightIntensity] = useState(70)
  const [temperatureControl, setTemperatureControl] = useState(true)
  const [humidityControl, setHumidityControl] = useState(true)
  const [co2Control, setCO2Control] = useState(true)
  const [lightControl, setLightControl] = useState(true)
  const [environmentalTrends, setEnvironmentalTrends] = useState([])
  const [selectedShelf, setSelectedShelf] = useState<string>('')
  const [selectedEnvRoom, setSelectedEnvRoom] = useState('')
  const [selectedEnvShelf, setSelectedEnvShelf] = useState('')
  const [phLevel, setPHLevel] = useState(6.5)
  const [ecLevel, setECLevel] = useState(1.5)
  const [phControl, setPHControl] = useState(true)
  const [ecControl, setECControl] = useState(true)


  const addRoom = () => {
    if (newRoomName && newRoomShelves && newCropType) {
      setRooms([...rooms, { id: rooms.length + 1, name: newRoomName, shelves: parseInt(newRoomShelves), cropType: newCropType }])
      setNewRoomName('')
      setNewRoomShelves('3')
      setNewCropType('')
    } else {
      alert("Please fill in all fields for the new room.")
    }
  }

  const removeRoom = (id: number) => {
    setRooms(rooms.filter(room => room.id !== id))
  }

  const addSoil = () => {
    if (selectedRoom && soilAmount) {
      // Here you would typically update a backend API
      console.log(`Added ${soilAmount} kg of soil to ${selectedRoom}`)
      alert(`Added ${soilAmount} kg of soil to ${selectedRoom}`)
      setSelectedRoom('')
      setSoilAmount('')
    } else {
      alert("Please select a room and enter a soil amount.")
    }
  }

  const addDevice = () => {
    if (newDevice.name && newDevice.type && newDevice.location) {
      setDevices([...devices, { ...newDevice, id: devices.length + 1, status: 'Active' }])
      setNewDevice({ name: '', type: '', location: '' })
    } else {
      alert("Please fill in all fields for the new device.")
    }
  }

  const updateDeviceStatus = (id, status) => {
    setDevices(devices.map(device => 
      device.id === id ? { ...device, status } : device
    ));
  }

  const filteredDevices = devices.filter(device => 
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setSoilMoistureTrend(prev => [
        ...prev.slice(-11),
        { time: new Date().toLocaleTimeString(), moisture: Math.random() * 20 + 50 }
      ])

      setEnvironmentalTrends(prev => [
        ...prev.slice(-11),
        {
          time: new Date().toLocaleTimeString(),
          temperature: temperature + (Math.random() - 0.5) * 2,
          humidity: humidity + (Math.random() - 0.5) * 5,
          co2: co2Level + (Math.random() - 0.5) * 50,
          ph: phLevel + (Math.random() - 0.5) * 0.2,
          ec: ecLevel + (Math.random() - 0.5) * 0.1
        }
      ])
    }, 5000)

    return () => clearInterval(interval)
  }, [temperature, humidity, co2Level, phLevel, ecLevel])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Devices & Sensors</h1>
        <Tabs defaultValue="devices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="rooms">Rooms & Shelves</TabsTrigger>
            <TabsTrigger value="soil">Soil Management by Room/Shelf</TabsTrigger>
            <TabsTrigger value="environment">Environmental Controls by Room/Shelf</TabsTrigger>
          </TabsList>
          <TabsContent value="devices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Device Management</CardTitle>
                <CardDescription>View and manage all your devices and sensors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="w-1/3">
                    <Label htmlFor="search">Search Devices</Label>
                    <Input
                      id="search"
                      placeholder="Search by name, type, or location"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Add New Device</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Device</DialogTitle>
                        <DialogDescription>Enter the details for the new device.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">Name</Label>
                          <Input id="name" value={newDevice.name} onChange={(e) => setNewDevice({...newDevice, name: e.target.value})} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="type" className="text-right">Type</Label>
                          <Input id="type" value={newDevice.type} onChange={(e) => setNewDevice({...newDevice, type: e.target.value})} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="location" className="text-right">Location</Label>
                          <Input id="location" value={newDevice.location} onChange={(e) => setNewDevice({...newDevice, location: e.target.value})} className="col-span-3" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={addDevice}>Add Device</Button>
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
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDevices.map((device) => (
                      <TableRow key={device.id}>
                        <TableCell>{device.name}</TableCell>
                        <TableCell>{device.type}</TableCell>
                        <TableCell>{device.location}</TableCell>
                        <TableCell>
                          <Badge variant={device.status === 'Active' ? 'default' : 'secondary'}>
                            {device.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" onClick={() => setEditingDevice(device)}>Edit</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Device: {editingDevice?.name}</DialogTitle>
                                <DialogDescription>Modify device details or change its status.</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="status">Device Status</Label>
                                  <Switch
                                    id="status"
                                    checked={editingDevice?.status === 'Active'}
                                    onCheckedChange={(checked) => {
                                      updateDeviceStatus(editingDevice?.id, checked ? 'Active' : 'Inactive');
                                      setEditingDevice({...editingDevice, status: checked ? 'Active' : 'Inactive'});
                                    }}
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="calibration" className="text-right">Last Calibration</Label>
                                  <Input id="calibration" type="date" className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="maintenance" className="text-right">Next Maintenance</Label>
                                  <Input id="maintenance" type="date" className="col-span-3" />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={() => setEditingDevice(null)}>Close</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" className="text-red-500" onClick={() => {
                            setDevices(devices.filter(d => d.id !== device.id));
                          }}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="rooms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Room & Shelf Management</CardTitle>
                <CardDescription>Add or remove rooms and manage shelves</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <Label htmlFor="roomName">Room Name</Label>
                    <Input
                      id="roomName"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="Enter room name"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="shelves">Number of Shelves</Label>
                    <Input
                      id="shelves"
                      type="number"
                      value={newRoomShelves}
                      onChange={(e) => setNewRoomShelves(e.target.value)}
                      min="1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="cropType">Crop Type</Label>
                    <Select value={newCropType} onValueChange={setNewCropType}>
                      <SelectTrigger id="cropType">
                        <SelectValue placeholder="Select crop type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lettuce">Lettuce</SelectItem>
                        <SelectItem value="tomatoes">Tomatoes</SelectItem>
                        <SelectItem value="strawberries">Strawberries</SelectItem>
                        <SelectItem value="herbs">Herbs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="mt-auto" onClick={addRoom}>Add Room</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room Name</TableHead>
                      <TableHead>Number of Shelves</TableHead>
                      <TableHead>Crop Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell>{room.name}</TableCell>
                        <TableCell>{room.shelves}</TableCell>
                        <TableCell>{room.cropType}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" onClick={() => removeRoom(room.id)}>Remove</Button>
                            <Link href={`/rooms/${room.id}`} passHref>
                              <Button variant="ghost">View Shelves</Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="soil" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Soil Management by Room/Shelf</CardTitle>
                <CardDescription>Monitor and manage soil health for specific rooms and shelves</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 mb-4">
                  <div>
                    <Label htmlFor="soilRoomSelect">Select Room</Label>
                    <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                      <SelectTrigger id="soilRoomSelect">
                        <SelectValue placeholder="Select a room" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="soilShelfSelect">Select Shelf</Label>
                    <Select value={selectedShelf} onValueChange={setSelectedShelf}>
                      <SelectTrigger id="soilShelfSelect">
                        <SelectValue placeholder="Select a shelf" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedRoom && rooms.find(r => r.id === selectedRoom)?.shelves && 
                          Array.from({length: rooms.find(r => r.id === selectedRoom)!.shelves}, (_, i) => i).map((shelf) => {
                            const letter = String.fromCharCode(65 + Math.floor(shelf / 10));
                            const number = (shelf % 10) + 1;
                            return (
                              <SelectItem key={`${letter}${number}`} value={`${letter}${number}`}>Shelf {letter}{number}</SelectItem>
                            );
                          })
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Soil Health Metrics</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle>pH Level</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{soilHealth.ph.toFixed(1)}</div>
                        <Progress value={(soilHealth.ph / 14) * 100} className="mt-2" />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Nitrogen (N)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{soilHealth.nitrogen} mg/kg</div>
                        <Progress value={(soilHealth.nitrogen / 100) * 100} className="mt-2" />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Moisture</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{soilHealth.moisture}%</div>
                        <Progress value={soilHealth.moisture} className="mt-2" />
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Soil Moisture Trend</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={soilMoistureTrend}>
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="moisture" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Automated Soil Testing</h3>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-soil-test"
                      checked={autoSoilTest}
                      onCheckedChange={setAutoSoilTest}
                    />
                    <Label htmlFor="auto-soil-test">Enable automated soil testing</Label>
                  </div>
                  <Input
                    type="datetime-local"
                    value={nextSoilTest}
                    onChange={(e) => setNextSoilTest(e.target.value)}
                    className="mt-2"
                  />
                  <Button className="mt-2" onClick={() => alert("Soil test scheduled")}>Schedule Next Test</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="environment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Environmental Controls by Room/Shelf</CardTitle>
                <CardDescription>Manage IoT sensors and actuators for optimal growing conditions in specific rooms and shelves</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 mb-4">
                  <div>
                    <Label htmlFor="envRoomSelect">Select Room</Label>
                    <Select value={selectedEnvRoom} onValueChange={setSelectedEnvRoom}>
                      <SelectTrigger id="envRoomSelect">
                        <SelectValue placeholder="Select a room" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="envShelfSelect">Select Shelf</Label>
                    <Select value={selectedEnvShelf} onValueChange={setSelectedEnvShelf}>
                      <SelectTrigger id="envShelfSelect">
                        <SelectValue placeholder="Select a shelf" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedEnvRoom && rooms.find(r => r.id === selectedEnvRoom)?.shelves && 
                          Array.from({length: rooms.find(r => r.id === selectedEnvRoom)!.shelves}, (_, i) => i).map((shelf) => {
                            const letter = String.fromCharCode(65 + Math.floor(shelf / 10));
                            const number = (shelf % 10) + 1;
                            return (
                              <SelectItem key={`${letter}${number}`} value={`${letter}${number}`}>Shelf {letter}{number}</SelectItem>
                            );
                          })
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Temperature Control</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <span>Current: {temperature}°C</span>
                        <Switch
                          checked={temperatureControl}
                          onCheckedChange={setTemperatureControl}
                        />
                      </div>
                      <Slider
                        value={[temperature]}
                        min={10}
                        max={40}
                        step={0.5}
                        onValueChange={(value) => setTemperature(value[0])}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Humidity Control</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <span>Current: {humidity}%</span>
                        <Switch
                          checked={humidityControl}
                          onCheckedChange={setHumidityControl}
                        />
                      </div>
                      <Slider
                        value={[humidity]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) => setHumidity(value[0])}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>CO2 Level Control</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <span>Current: {co2Level} ppm</span>
                        <Switch
                          checked={co2Control}
                          onCheckedChange={setCO2Control}
                        />
                      </div>
                      <Slider
                        value={[co2Level]}
                        min={300}
                        max={2000}
                        step={10}
                        onValueChange={(value) => setCO2Level(value[0])}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Light Intensity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <span>Current: {lightIntensity}%</span>
                        <Switch
                          checked={lightControl}
                          onCheckedChange={setLightControl}
                        />
                      </div>
                      <Slider
                        value={[lightIntensity]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) => setLightIntensity(value[0])}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>pH Control</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <span>Current: {phLevel}</span>
                        <Switch
                          checked={phControl}
                          onCheckedChange={setPHControl}
                        />
                      </div>
                      <Slider
                        value={[phLevel]}
                        min={0}
                        max={14}
                        step={0.1}
                        onValueChange={(value) => setPHLevel(value[0])}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>EC Control</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <span>Current: {ecLevel} mS/cm</span>
                        <Switch
                          checked={ecControl}
                          onCheckedChange={setECControl}
                        />
                      </div>
                      <Slider
                        value={[ecLevel]}
                        min={0}
                        max={5}
                        step={0.1}
                        onValueChange={(value) => setECLevel(value[0])}
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Environmental Trends</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={environmentalTrends}>
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#8884d8" />
                      <Line yAxisId="left" type="monotone" dataKey="humidity" stroke="#82ca9d" />
                      <Line yAxisId="right" type="monotone" dataKey="co2" stroke="#ffc658" />
                      <Line yAxisId="left" type="monotone" dataKey="ph" stroke="#ff7300" />
                      <Line yAxisId="left" type="monotone" dataKey="ec" stroke="#ff00ff" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

