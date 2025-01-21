'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Brush } from 'recharts'; 

export default function RoomPage() {
  const params = useParams()
  const [room, setRoom] = useState<any>(null)
  const [shelves, setShelves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Polling interval (in milliseconds)
  const pollingInterval = 10000; // 10 seconds

  useEffect(() => {
    const fetchRoomData = async (initialFetch = false) => {
      try {
        if (initialFetch) {
          setLoading(true); // Only set loading to true on initial fetch
        }

        const response = await fetch(`http://127.0.0.1:5100/room/${params.id}/shelves`)
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`)
        }
        const data = await response.json()

        // Set state with API response
        setRoom({ id: data.room_id, name: `Room ${data.room_id}` })
        setShelves(data.shelves)
        setError(null) // Clear error on successful fetch
      } catch (err: any) {
        setError(err.message)
      } finally {
        if (initialFetch) {
          setLoading(false); // Only set loading to false on initial fetch
        }
      }
    }

    fetchRoomData(true) // Initial data fetch
    const intervalId = setInterval(() => fetchRoomData(false), pollingInterval) // Set up polling

    return () => clearInterval(intervalId) // Clean up the interval when component unmounts
  }, [params.id])

  if (loading && !room) return <div>Loading...</div> // Show loading only when room data is not yet available
  if (error) return <div>Error: {error}</div>

  // Function to format numbers to two decimal places
  const formatValue = (value: number) => {
    return value !== undefined && value !== null ? value.toFixed(2) : 'N/A'
  }

  // Define units for each sensor type
  const units: { [key: string]: string } = {
    CO2: "ppm",       // Parts per million
    Humidity: "%",    // Percentage
    Light_PAR: "μmol/m²/s", // Micromoles per square meter per second
    Nutrients_EC: "mS/cm",  // Millisiemens per centimeter (Electrical conductivity)
    Temperature: "°C",    // Celsius
    Water_Level: "cm",     // Centimeters
    pH: ""              // No unit for pH, just display the value
  }

  // Function to get the latest sensor data for each shelf (most recent data)
  const getLatestSensorData = (shelf: any) => {
    const latestData: { [key: string]: any } = {}
    Object.keys(shelf.sensors).forEach(sensorType => {
      const latestSensor = shelf.sensors[sensorType][shelf.sensors[sensorType].length - 1] // Get the most recent (last) entry
      latestData[sensorType] = {
        value: latestSensor ? latestSensor.value : 'N/A',
        unit: units[sensorType] || ''
      }
    })
    return latestData
  }

  // Function to format UTC to local time
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp); // Parses the UTC time string
    return date.toUTCString(); // Display in UTC time format
  }

// Function to generate data for Recharts LineChart
const generateChartData = (sensorData: { timestamp: string, value: number }[]) => {
  // Reverse the data to ensure the oldest data is on the left (X-axis) and the newest is on the right
  return sensorData
    .map((data) => ({
      time: formatTimestamp(data.timestamp).toLocaleString(),
      value: data.value
    }))
    .reverse(); // Reverse the order of the data
}


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">{room.name}</h1>

        {/* Table for Latest Sensor Data */}
        <Card>
          <CardHeader>
            <CardTitle>Live Shelf Sensor Values</CardTitle>
            <CardDescription>Current sensor readings for each shelf</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shelf ID</TableHead>
                  {/* Dynamically create sensor headers for each shelf */}
                  {shelves[0]?.sensors && Object.keys(shelves[0]?.sensors).map((sensorType) => (
                    <TableHead key={sensorType}>{sensorType}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {shelves.map((shelf) => {
                  const latestData = getLatestSensorData(shelf)

                  return (
                    <TableRow key={shelf.shelf_id}>
                      <TableCell>{shelf.shelf_id}</TableCell>
                      {/* Display the latest value for each sensor */}
                      {Object.keys(latestData).map((sensorType) => (
                        <TableCell key={sensorType}>
                          {formatValue(latestData[sensorType].value)} {latestData[sensorType].unit}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detailed History of Sensor Data */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Historical Shelf Conditions</CardTitle>
            <CardDescription>Historical sensor values and graphs for each shelf</CardDescription>
          </CardHeader>
          <CardContent>
            {shelves.map((shelf) => {
              const sensorTypes = Object.keys(shelf.sensors)

              return (
                <div key={shelf.shelf_id} className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Shelf ID: {shelf.shelf_id}</h3>
                  {sensorTypes.map((sensorType) => {
                    const sensorData = shelf.sensors[sensorType]

                    return (
                      <div key={sensorType} className="mb-4">
                        <h4 className="text-lg font-medium mb-2">{sensorType}</h4>
                        <div className="max-h-60 overflow-y-auto border border-gray-300 p-2 rounded-md">
                          <div className="space-y-2">
                            {sensorData.reverse().map((sensorData: { timestamp: string, value: number }) => (
                              <div key={sensorData.timestamp} className="flex justify-between text-sm text-gray-700">
                                <span>{formatTimestamp(sensorData.timestamp)}</span>
                                <span className="font-bold">
                                  {formatValue(sensorData.value)} 
                                  {units[sensorType] && ` (${units[sensorType]})`} {/* Display the unit */}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Render Graph using Recharts below each sensor data */}
                        <div className="mt-4" style={{ height: '300px' }}>
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={generateChartData(sensorData)}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="time" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#8884d8" />
      {/* Brush Component for Scrollable Range */}
      <Brush
        dataKey="time"
        startIndex={sensorData.length - 10} 
        endIndex={sensorData.length - 1}   
        height={20}
        stroke="#8884d8"
        fill="#8884d8"
      />
    </LineChart>
  </ResponsiveContainer>
</div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
