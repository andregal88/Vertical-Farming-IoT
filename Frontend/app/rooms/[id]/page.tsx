'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RoomPage() {
  const params = useParams()
  const [room, setRoom] = useState<any>(null)
  const [shelves, setShelves] = useState<any[]>([])

  useEffect(() => {
    // In a real application, you would fetch the room and shelf data from an API
    // For this example, we'll use mock data
    const mockRoom = { id: params.id, name: 'Lettuce Room 3', shelves: 5, cropType: 'Lettuce' }
    setRoom(mockRoom)

    const mockShelves = Array.from({ length: mockRoom.shelves }, (_, i) => ({
      id: i + 1,
      temperature: 20 + Math.random() * 5,
      humidity: 60 + Math.random() * 10,
      lightIntensity: 5000 + Math.random() * 1000,
    }))
    setShelves(mockShelves)
  }, [params.id])

  const updateShelfCondition = (shelfId: number, condition: string, value: number) => {
    setShelves(shelves.map(shelf => 
      shelf.id === shelfId ? { ...shelf, [condition]: value } : shelf
    ))
  }

  if (!room) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">{room.name} - {room.cropType}</h1>
        <Card>
          <CardHeader>
            <CardTitle>Shelf Conditions</CardTitle>
            <CardDescription>Manage conditions for each shelf</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shelf Number</TableHead>
                  <TableHead>Temperature (°C)</TableHead>
                  <TableHead>Humidity (%)</TableHead>
                  <TableHead>Light Intensity (lux)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shelves.map((shelf) => (
                  <TableRow key={shelf.id}>
                    <TableCell>{shelf.id}</TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={shelf.temperature.toFixed(1)} 
                        onChange={(e) => updateShelfCondition(shelf.id, 'temperature', parseFloat(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={shelf.humidity.toFixed(1)} 
                        onChange={(e) => updateShelfCondition(shelf.id, 'humidity', parseFloat(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={shelf.lightIntensity.toFixed(0)} 
                        onChange={(e) => updateShelfCondition(shelf.id, 'lightIntensity', parseFloat(e.target.value))}
                      />
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

