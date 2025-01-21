'use client'
import axios from 'axios'
import { useState, useEffect, useMemo } from 'react'
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DialogTrigger, DialogClose } from "@/components/ui/dialog";
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
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null); // Selected room
  const [selectedShelfSoil, setSelectedShelfSoil] = useState<string | null>(null); // Selected shelf
  const [roomsAndSensors, setRoomsAndSensors] = useState([]); // Rooms with sensors data
  const [roomsAndSensors2, setRoomsAndSensors2] = useState([]); // Rooms with sensors data

    // Fetching room and sensor data
    useEffect(() => {
      const fetchRoomsAndSensors = async () => {
        try {
          const roomsResponse = await fetch('http://127.0.0.1:5017/get_rooms_with_shelves_and_sensors');
          const roomsData = await roomsResponse.json();
  
          const combinedRooms = roomsData.rooms.map((room: any) => ({
            id: `room${room.room_id}`,
            name: room.room_name,
            sensors: room.shelves.flatMap((shelf: any) =>
              shelf.sensors.map((sensor: any) => ({
                id: `sensor${sensor.sensor_id}`,
                name: sensor.name,
                type: sensor.sensor_type,
                value: sensor.last_value,
                room: room.room_name,
                shelfId: `shelf${shelf.shelf_id}`,
              }))
            ),
            shelves: room.shelves.map((shelf: any) => ({
              id: `shelf${shelf.shelf_id}`,
              name: shelf.shelf_name,
              sensors: shelf.sensors.map((sensor: any) => ({
                id: `sensor${sensor.sensor_id}`,
                name: sensor.name,
              }))
            }))
          }));

          setRoomsAndSensors(combinedRooms);
          setRoomsAndSensors2(combinedRooms);
        } catch (error) {
          console.error('Error fetching rooms and sensors data:', error);
        }
      };
  
      fetchRoomsAndSensors();
    }, []);
  
    
  // Fetch devices from the API
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5001/sensors');
        console.log("Fetched Devices:", response.data);  // Log the response data to the console
        setDevices(response.data);  // Update the state with the fetched devices
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };

    fetchDevices();
    // Set up polling interval
    const interval = setInterval(fetchDevices, 10000); // Fetch logs every 10 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
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


    // Set up polling interval
    const interval = setInterval(fetchRooms, 10000); // Fetch data every 10 seconds
  
    // Cleanup interval on component unmount
    return () => clearInterval(interval);

  }, []); // Empty dependency array ensures the fetch happens once when the component mounts

  // Get shelves for the selected room for first shelf dropdown
  const getShelvesForRoom = () => {
    if (!selectedRoom) return [];
    const selectedRoomData = roomsAndSensors.find(room => room.id === selectedRoom);
    if (!selectedRoomData) return [];
  
    // Extract unique shelf IDs from the sensors in the selected room
    const uniqueShelves = Array.from(new Set(selectedRoomData.sensors.map((sensor: any) => sensor.shelfId)))
      .filter((id) => id !== undefined); // Remove undefined values
  
    return uniqueShelves;
  };
  const [devicesPerPage] = useState(10); // Number of devices per page
  const [roomsPerPage] = useState(5); // Number of rooms per page
  
  const [currentDevicePage, setCurrentDevicePage] = useState(1); // Current page for devices
  const [currentRoomPage, setCurrentRoomPage] = useState(1); // Current page for rooms
  
  const paginateDevices = (devicesList = devices) => {
    const startIndex = (currentDevicePage - 1) * devicesPerPage;
    const endIndex = startIndex + devicesPerPage;
    return devicesList.slice(startIndex, endIndex);
  };
  
  
const paginateRooms = (roomsToPaginate) => {
  const startIndex = (currentRoomPage - 1) * roomsPerPage;
  const endIndex = startIndex + roomsPerPage;
  return roomsToPaginate.slice(startIndex, endIndex);
};

  
  const renderDevicePagination = () => {
    const totalDevicePages = Math.ceil(devices.length / devicesPerPage);
  
    return (
      <div className="flex items-center justify-center space-x-4 mt-4">
        {/* First Page Button */}
        <Button
          disabled={currentDevicePage === 1}
          onClick={() => setCurrentDevicePage(1)}
        >
          First
        </Button>
  
        {/* Previous Page Button */}
        <Button
          disabled={currentDevicePage === 1}
          onClick={() => setCurrentDevicePage(currentDevicePage - 1)}
        >
          Previous
        </Button>
  
        {/* Page Numbers */}
        <div className="flex gap-2">
          {/* Display 1st page button if needed */}
          {currentDevicePage > 3 && (
            <Button onClick={() => setCurrentDevicePage(1)}>1</Button>
          )}
  
          {/* Display "..." if skipped pages */}
          {currentDevicePage > 4 && <span className="px-2">...</span>}
  
          {/* Display pages around the current page */}
          {Array.from({ length: 5 }).map((_, index) => {
            const page = currentDevicePage - 2 + index;
            // Only render valid page numbers within the range
            if (page > 0 && page <= totalDevicePages) {
              return (
                <Button
                  key={page}
                  variant={page === currentDevicePage ? 'outline' : 'default'}
                  onClick={() => setCurrentDevicePage(page)}
                >
                  {page}
                </Button>
              );
            }
            return null;
          })}
  
          {/* Display "..." if skipped pages */}
          {currentDevicePage < totalDevicePages - 3 && <span className="px-2">...</span>}
  
          {/* Display last page button if needed */}
          {currentDevicePage < totalDevicePages - 2 && (
            <Button onClick={() => setCurrentDevicePage(totalDevicePages)}>
              {totalDevicePages}
            </Button>
          )}
        </div>
  
        {/* Next Page Button */}
        <Button
          disabled={currentDevicePage === totalDevicePages}
          onClick={() => setCurrentDevicePage(currentDevicePage + 1)}
        >
          Next
        </Button>
  
        {/* Last Page Button */}
        <Button
          disabled={currentDevicePage === totalDevicePages}
          onClick={() => setCurrentDevicePage(totalDevicePages)}
        >
          Last
        </Button>
      </div>
    );
  };
  
  const renderRoomPagination = () => {
    const totalRoomPages = Math.ceil(rooms.length / roomsPerPage);
  
    return (
      <div className="flex items-center justify-center space-x-4 mt-4">
        {/* First Page Button */}
        <Button
          disabled={currentRoomPage === 1}
          onClick={() => setCurrentRoomPage(1)}
        >
          First
        </Button>
  
        {/* Previous Page Button */}
        <Button
          disabled={currentRoomPage === 1}
          onClick={() => setCurrentRoomPage(currentRoomPage - 1)}
        >
          Previous
        </Button>
  
        {/* Page Numbers */}
        <div className="flex gap-2">
          {/* Display 1st page button if needed */}
          {currentRoomPage > 3 && (
            <Button onClick={() => setCurrentRoomPage(1)}>1</Button>
          )}
  
          {/* Display "..." if skipped pages */}
          {currentRoomPage > 4 && <span className="px-2">...</span>}
  
          {/* Display pages around the current page */}
          {Array.from({ length: 5 }).map((_, index) => {
            const page = currentRoomPage - 2 + index;
            // Only render valid page numbers within the range
            if (page > 0 && page <= totalRoomPages) {
              return (
                <Button
                  key={page}
                  variant={page === currentRoomPage ? 'outline' : 'default'}
                  onClick={() => setCurrentRoomPage(page)}
                >
                  {page}
                </Button>
              );
            }
            return null;
          })}
  
          {/* Display "..." if skipped pages */}
          {currentRoomPage < totalRoomPages - 3 && <span className="px-2">...</span>}
  
          {/* Display last page button if needed */}
          {currentRoomPage < totalRoomPages - 2 && (
            <Button onClick={() => setCurrentRoomPage(totalRoomPages)}>
              {totalRoomPages}
            </Button>
          )}
        </div>
  
        {/* Next Page Button */}
        <Button
          disabled={currentRoomPage === totalRoomPages}
          onClick={() => setCurrentRoomPage(currentRoomPage + 1)}
        >
          Next
        </Button>
  
        {/* Last Page Button */}
        <Button
          disabled={currentRoomPage === totalRoomPages}
          onClick={() => setCurrentRoomPage(totalRoomPages)}
        >
          Last
        </Button>
      </div>
    );
  };
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomShelves, setNewRoomShelves] = useState('3')
  // const [selectedRoom, setSelectedRoom] = useState('')
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
      crop_choice: newCropType, // Ensure this is a numeric ID
      user_choice: newUserId,  // Ensure this is a numeric ID
      number_of_shelves: parseInt(newNumberOfShelves), // Ensure it's a number
    };
  
    try {
      const response = await axios.post('http://localhost:5006/create_room', newRoom, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // Handle success
      alert(response.data.message); // Backend's success message
  
      // Append the new room to the state directly
      const newRoomWithId = {
        ...newRoom,
        id: response.data.room_id, // Use the ID returned by the backend, if available
      };
  
      setRooms((prevRooms) => [...prevRooms, newRoomWithId]); // Update the rooms state
      setRoomsAndSensors((prevRoomsAndSensors) => [
        ...prevRoomsAndSensors,
        {
          id: `room${response.data.room_id}`,
          name: newRoom.room_name,
          sensors: [], // Empty initially, add sensors if needed
          shelves: [], // Empty initially, add shelves if needed
        },
      ]);
  
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
  
  const [searchTermRoom, setSearchTermRoom] = useState(""); // Ensure initial value is set

const handleSearchChange = (e) => {
  const value = e.target.value;
  setSearchTermRoom(value);
  console.log("Search Term:", value); // Log the search term
};

<Input
  id="search"
  value={searchTermRoom}
  onChange={handleSearchChange}
  placeholder="Search by room name, number, crop type, floor, city or user name"
/>

const filteredRooms = rooms.filter((room) => {
  const searchTerm = searchTermRoom.toLowerCase();
  return (
    room.room_name.toLowerCase().includes(searchTerm) ||
    room.room_number.toLowerCase().includes(searchTerm) ||
    room.crop_type.toLowerCase().includes(searchTerm) ||
    room.floor.toString().toLowerCase().includes(searchTerm) ||
    room.city.toLowerCase().includes(searchTerm) ||
    room.user_name.toLowerCase().includes(searchTerm)
  );
});

console.log("Filtered Rooms:", filteredRooms); // Check if filteredRooms array is populated

  
  // Now apply pagination to the filtered list of rooms
  const roomsToDisplay = paginateRooms(filteredRooms); 
  console.log("Rooms to Display:", roomsToDisplay); // Check what rooms are being displayed

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

  const updateDeviceStatus = (id, status) => {
    setDevices(devices.map(device => 
      device.id === id ? { ...device, status } : device
    ));
  }

const filteredDevices = devices
  .slice() // Create a shallow copy to avoid mutating the original array
  .sort((a, b) => {
    const extractNumber = (name) => {
      const match = name.match(/_(\d+)$/); // Extract the number at the end of the name
      return match ? parseInt(match[1], 10) : Infinity; // Default to Infinity if no number is found
    };
    return extractNumber(a.name) - extractNumber(b.name); // Sort by the extracted number
  })
  .filter(device => 
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return 'bg-gray-500'; // Default color for null or undefined
    switch (status.toLowerCase()) {
      case 'normal': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }
  



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

  function handleSetControls(roomName, shelfName) {
    if (!roomName || !shelfName) {
      alert("Please select a room and shelf before setting controls.");
      return;
    }
  
    alert(`Environmental controls for ${roomName} and ${shelfName} have been set.`);
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

                </div>
                <Table>
  <TableHeader>
    <TableRow>
      <TableHead className="text-left">Name</TableHead>
      <TableHead className="text-left">Type</TableHead>
      <TableHead className="text-left">Location</TableHead>
      <TableHead className="text-left">Status</TableHead>
      <TableHead className="text-left">Values</TableHead>
      <TableHead className="text-center w-[200px]">Actions</TableHead> {/* Set consistent width */}
    </TableRow>
  </TableHeader>
  <TableBody>
    {paginateDevices(filteredDevices).map((device) => (
      <TableRow key={device.id}>
        <TableCell className="text-left">{device.name}</TableCell>
        <TableCell className="text-left">{device.type}</TableCell>
        <TableCell className="text-left">{device.location}</TableCell>
        <TableCell className="text-left">
          <Badge className={getStatusColor(device.status)}>
            {device.status}
          </Badge>
        </TableCell>
        <TableCell className="text-left">{device.lastValue}</TableCell>
        <TableCell className="text-center w-[200px] flex justify-center gap-2">
          {/* Align buttons in the center of the column */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                onClick={() => setEditingDevice(device)}
              >
                Calibrate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Device: {editingDevice?.name}</DialogTitle>
                <DialogDescription>
                  Modify device details or change its status.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="calibration" className="text-right">
                    Last Calibration
                  </Label>
                  <Input id="calibration" type="date" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="maintenance" className="text-right">
                    Next Calibration
                  </Label>
                  <Input id="maintenance" type="date" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button>Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            className="text-red-500"
            onClick={() => {
              setItemToRemove({ type: 'device', id: device.id });
              setIsRemoveDialogOpen(true);
            }}
          >
            Delete
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>


{/* Render Pagination Controls */}
{renderDevicePagination()}

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
            
{/* Search Bar */}
  <div className="mb-4">
    <Label htmlFor="search">Search Rooms</Label>
    <Input
  id="search"
  value={searchTermRoom}
  onChange={(e) => setSearchTermRoom(e.target.value)} // Captures the search term correctly
  placeholder="Search by room name, number, crop type, floor, city or user name"
/>

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
            <TableHead className="text-center w-[200px]">Actions</TableHead> {/* Set consistent width */}
          </TableRow>
        </TableHeader>
        <TableBody>

  {roomsToDisplay.map((room) => (
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

      {/* Render Pagination Controls */}
      {renderRoomPagination()}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="soil" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Soil Management by Room/Shelf</CardTitle>
                <CardDescription>Monitor and manage soil health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 mb-4">
                  <div>
                    <Label htmlFor="soilRoomSelect">Select Room</Label>
                    <Select value={selectedRoom} onValueChange={setSelectedRoom}>
  <SelectTrigger className="col-span-3">
    <SelectValue placeholder="Select room" />
  </SelectTrigger>
  <SelectContent>
    {roomsAndSensors.map((room) => (
      <SelectItem key={room.id} value={room.id}>
        {room.name}
      </SelectItem>
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
    {getShelvesForRoom().map((shelfId) => (
      <SelectItem key={shelfId} value={shelfId.toString()}>
        {shelfId} {/* This will display the shelfId, but you can map it to a name if necessary */}
      </SelectItem>
    ))}
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
                <CardDescription>Manage actuators for optimal growing conditions</CardDescription>
              </CardHeader>
              <CardContent>
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                  <div>
                    <Label htmlFor="envRoomSelect">Select Room</Label>
                    <Select value={selectedRoom} onValueChange={setSelectedRoom}>
  <SelectTrigger className="col-span-3">
    <SelectValue placeholder="Select room" />
  </SelectTrigger>
  <SelectContent>
    {roomsAndSensors.map((room) => (
      <SelectItem key={room.id} value={room.id}>
        {room.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
                  </div>
                  <div>
                    <Label htmlFor="envShelfSelect">Select Shelf</Label>
                    <Select value={selectedShelf} onValueChange={setSelectedShelf}>
                      <SelectTrigger id="envShelfSelect">
                        <SelectValue placeholder="Select a shelf" />
                      </SelectTrigger>
                      <SelectContent>
    {getShelvesForRoom().map((shelfId) => (
      <SelectItem key={shelfId} value={shelfId.toString()}>
        {shelfId} {/* This will display the shelfId, but you can map it to a name if necessary */}
      </SelectItem>
    ))}
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
                  {/*"Set Controls" button */}
  <div className="mt-6 flex justify-center">
    <Button
      className="mt-2"
      onClick={() => handleSetControls(selectedRoom, selectedShelf)}
    >
      Set Controls
    </Button>
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

