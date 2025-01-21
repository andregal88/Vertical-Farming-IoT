'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function RoomPage() {
  const params = useParams()
  const [room, setRoom] = useState<any>(null)
  const [shelves, setShelves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://127.0.0.1:5100/room/${params.id}/shelves`)
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`)
        }
        const data = await response.json()

        // Set state with API response
        setRoom({ id: data.room_id, name: `Room ${data.room_id}` })
        setShelves(data.shelves)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRoomData()
  }, [params.id])

  if (loading) return <div>Loading...</div>
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">{room.name}</h1>
        <Card>
          <CardHeader>
            <CardTitle>Shelf Conditions</CardTitle>
            <CardDescription>Historical sensor values for each shelf</CardDescription>
          </CardHeader>
          <CardContent>
            {shelves.map((shelf) => {
              const sensorTypes = Object.keys(shelf.sensors)

              return (
                <div key={shelf.shelf_id} className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Shelf ID: {shelf.shelf_id}</h3>
                  {sensorTypes.map((sensorType) => {
                    return (
                      <div key={sensorType} className="mb-4">
                        <h4 className="text-lg font-medium mb-2">{sensorType}</h4>
                        <div className="max-h-60 overflow-y-auto border border-gray-300 p-2 rounded-md">
                          <div className="space-y-2">
                            {shelf.sensors[sensorType].map((sensorData: { timestamp: string, value: number }) => (
                              <div key={sensorData.timestamp} className="flex justify-between text-sm text-gray-700">
                                <span>{new Date(sensorData.timestamp).toLocaleString()}</span>
                                <span className="font-bold">
                                  {formatValue(sensorData.value)} 
                                  {units[sensorType] && ` (${units[sensorType]})`} {/* Display the unit */}
                                </span>
                              </div>
                            ))}
                          </div>
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
