'use client'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DialogTrigger } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from 'next/link'
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'


export default function DevicesAndSensorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);  // Initially empty array for devices
  
  // Fetch devices from the API
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5001/api/sensors');
        // console.log("Fetched Devices:", response.data);  // Log the response data to the console
        setDevices(response.data);  // Update the state with the fetched devices
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };

    fetchDevices();
  }, []);  

  // Fetch data from the API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5006/get_rooms');
        const data = await response.json();
        setRooms(data.rooms); // Update state with the fetched rooms
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, []); // Empty dependency array ensures the fetch happens once when the component mounts

  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomShelves, setNewRoomShelves] = useState('3')
  const [selectedRoom, setSelectedRoom] = useState('')
  const [soilAmount, setSoilAmount] = useState('')
  const [newCropType, setNewCropType] = useState('')
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
  const [cropTypes, setCropTypes] = useState<{ id: string, name: string }[]>([])
  const [selectedEnvRoom, setSelectedEnvRoom] = useState('')
  const [selectedEnvShelf, setSelectedEnvShelf] = useState('')
  const [phLevel, setPHLevel] = useState(6.5)
  const [ecLevel, setECLevel] = useState(1.5)
  const [phControl, setPHControl] = useState(true)
  const [ecControl, setECControl] = useState(true)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
  const [itemToRemove, setItemToRemove] = useState<{ type: 'room' | 'device', id: string | number } | null>(null)
  const [newRoomAddress, setNewRoomAddress] = useState('');
  const [newRoomCity, setNewRoomCity] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState('');
  const [newUserId, setNewUserId] = useState('');
  const [newNumberOfShelves, setNewNumberOfShelves] = useState('');

  // Fetch crop types when the component mounts
  useEffect(() => {
    const fetchCropTypes = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5009/api/crop_types')
        console.log("Fetched Crop Types:", response.data)  // Log the response data to the console
        setCropTypes(response.data)  // Store the fetched crop types
      } catch (error) {
        console.error("Error fetching crop types:", error)
      }
    }
    fetchCropTypes()
  }, [])  // Empty dependency array ensures this runs only once after the initial render

  useEffect(() => {
    console.log("Crop Types State:", cropTypes)  // Log state to check if cropTypes is updated
  }, [cropTypes])  // Will run whenever cropTypes state is updated

  const addRoom = async () => {
    const newRoom = {
      room_name: newRoomName,
      address: newRoomAddress,
      city: newRoomCity,
      room_number: newRoomNumber,
      floor: newRoomFloor,
      crop_choice: newCropType,  // Ensure this is a numeric ID
      user_choice: newUserId,  // Ensure this is a numeric ID
      number_of_shelves: parseInt(newNumberOfShelves),  // Ensure it's a number
    };
  
    try {
      const response = await axios.post('http://localhost:5006/create_room', newRoom, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // Handle success
      alert(response.data.message);  // Backend's success message
      // Reset form fields after successful creation
      setNewRoomName('');
      setNewRoomAddress('');
      setNewRoomCity('');
      setNewRoomNumber('');
      setNewRoomFloor('');
      setNewCropType('');
      setNewUserId('');
      setNewNumberOfShelves('');
    
    } catch (error) {
      // Handle any errors
      if (error.response) {
        console.error('Error adding room:', error.response.data.message);
        alert(`Error: ${error.response.data.message}`);
      } else {
        console.error('Error adding room:', error.message);
        alert('There was an error adding the room. Please try again later.');
      }
    }
  };
  
  
  const removeRoom = () => {
    if (itemToRemove && itemToRemove.type === 'room') {
      setRooms(rooms.filter(room => room.id !== itemToRemove.id))
      setIsRemoveDialogOpen(false)
      setItemToRemove(null)
    }
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

  const getStatusColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'normal': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
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

  const removeDevice = () => {
    if (itemToRemove && itemToRemove.type === 'device') {
      setDevices(devices.filter(device => device.id !== itemToRemove.id))
      setIsRemoveDialogOpen(false)
      setItemToRemove(null)
    }
  }

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

  function handleStatusToggle(id: any, status: any): void {
    // Update the status of the device to Off when Switch is toggled and when switched back to On, fetch the status from the API
    const newStatus = status === "Off" ? "On" : "Off";
    updateDeviceStatus(id, newStatus);

  }

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
      <TableHead>Values</TableHead> {/* Add the Values column header */}
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
        <Badge className={getStatusColor(device.status)}>
          {device.status}
        </Badge>
      </TableCell>
      <TableCell>{device.lastValue}</TableCell>
      <TableCell>
        {/* Toggle Switch */}
        <Switch
          checked={device.status !== "Off"} // Checked if status is not "Off"
          onCheckedChange={(checked) => handleStatusToggle(device.id, device.status)}
        />
      </TableCell>
    </TableRow>
  ))}
</TableBody>

          {/* <Dialog>
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
          </Dialog> */}
          {/* <Button 
            variant="ghost" 
            className="text-red-500" 
            onClick={() => {
              setItemToRemove({ type: 'device', id: device.id })
              setIsRemoveDialogOpen(true)
            }}
          >
            Delete
          </Button> */}
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
                <div className="grid gap-4 md:grid-cols-2 mb-4">
                  {/* Room Name */}
                  <div className="flex-1">
                    <Label htmlFor="roomName">Room Name</Label>
                    <Input
                      id="roomName"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="Enter room name"
                    />
                  </div>

                  {/* Address */}
                  <div className="flex-1">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newRoomAddress}
                      onChange={(e) => setNewRoomAddress(e.target.value)}
                      placeholder="Enter room address"
                    />
                  </div>

                  {/* City */}
                  <div className="flex-1">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newRoomCity}
                      onChange={(e) => setNewRoomCity(e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>

                  {/* Room Number */}
                  <div className="flex-1">
                    <Label htmlFor="roomNumber">Room Number</Label>
                    <Input
                      id="roomNumber"
                      value={newRoomNumber}
                      onChange={(e) => setNewRoomNumber(e.target.value)}
                      placeholder="Enter room number"
                    />
                  </div>

                  {/* Floor */}
                  <div className="flex-1">
                    <Label htmlFor="floor">Floor</Label>
                    <Input
                      id="floor"
                      value={newRoomFloor}
                      onChange={(e) => setNewRoomFloor(e.target.value)}
                      placeholder="Enter floor number"
                    />
                  </div>

                  {/* Crop Type */}
                  <div className="flex-1">
                    <Label htmlFor="cropType">Crop Type</Label>
                    <Select value={newCropType} onValueChange={(value) => setNewCropType(value)}>
                      <SelectTrigger id="cropType">
                        <SelectValue placeholder="Select crop type" />
                      </SelectTrigger>
                      <SelectContent>
                        {cropTypes.map((crop) => (
                          <SelectItem key={crop.id} value={crop.id}>  {/* Pass crop.id instead of crop.name */}
                            {crop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>


                  {/* User ID */}
                  <div className="flex-1">
                    <Label htmlFor="user_id">User ID</Label>
                    <Input
                      id="user_id"
                      value={newUserId}
                      onChange={(e) => setNewUserId(e.target.value)}
                      placeholder="Enter user ID"
                    />
                  </div>

                  {/* Number of Shelves */}
                  <div className="flex-1">
                    <Label htmlFor="numberOfShelves">Number of Shelves</Label>
                    <Input
                      id="numberOfShelves"
                      type="number"
                      value={newNumberOfShelves}
                      onChange={(e) => setNewNumberOfShelves(e.target.value)}
                      placeholder="Enter number of shelves"
                      min="1" // Minimum value is 1
                    />
                  </div>
              {/* Submit Button */}
              <Button className="mt-auto" onClick={addRoom}>Add Room</Button>
            </div>
            <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room Name</TableHead>
            <TableHead>Room Number</TableHead>
            <TableHead>Crop Type</TableHead>
            <TableHead>Floor</TableHead>
            <TableHead>City</TableHead>
            <TableHead>User Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms
            .filter((room) =>
              room.room_name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((room) => (
              <TableRow key={room.room_id}>
                <TableCell>{room.room_name}</TableCell>
                <TableCell>{room.room_number}</TableCell>
                <TableCell>{room.crop_type}</TableCell>
                <TableCell>{room.floor}</TableCell>
                <TableCell>{room.city}</TableCell>
                <TableCell>{room.user_name}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link href={`/rooms/${room.room_id}`} passHref>
                      <Button variant="ghost">View Shelves</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 hover:bg-red-100"
                      onClick={() => {
                        setItemToRemove({ type: 'room', id: room.room_id });
                        setIsRemoveDialogOpen(true);
                      }}
                    >
                      Remove
                    </Button>
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
        <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Removal</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove this {itemToRemove?.type}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRemoveDialogOpen(false)}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={() => itemToRemove?.type === 'room' ? removeRoom() : removeDevice()}
              >
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

