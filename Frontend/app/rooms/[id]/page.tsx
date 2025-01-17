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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">{room.name}</h1>
        <Card>
          <CardHeader>
            <CardTitle>Shelf Conditions</CardTitle>
            <CardDescription>Latest sensor values for each shelf</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shelf ID</TableHead>
                  <TableHead>CO2 (ppm)</TableHead>
                  <TableHead>Humidity (%)</TableHead>
                  <TableHead>Light PAR (μmol/m²/s)</TableHead>
                  <TableHead>Nutrients EC (mS/cm)</TableHead>
                  <TableHead>Temperature (°C)</TableHead>
                  <TableHead>Water Level (cm)</TableHead>
                  <TableHead>pH</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shelves.map((shelf) => (
                  <TableRow key={shelf.shelf_id}>
                    <TableCell>{shelf.shelf_id}</TableCell>
                    <TableCell className="font-bold">{formatValue(shelf.sensors.CO2)}</TableCell>
                    <TableCell className="font-bold">{formatValue(shelf.sensors.Humidity)}</TableCell>
                    <TableCell className="font-bold">{formatValue(shelf.sensors.Light_PAR)}</TableCell>
                    <TableCell className="font-bold">{formatValue(shelf.sensors.Nutrients_EC)}</TableCell>
                    <TableCell className="font-bold">{formatValue(shelf.sensors.Temperature)}</TableCell>
                    <TableCell className="font-bold">{formatValue(shelf.sensors.Water_Level)}</TableCell>
                    <TableCell className="font-bold">{formatValue(shelf.sensors.pH)}</TableCell>
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
