'use client'

import { useState } from 'react'
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [dataSync, setDataSync] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState('')
  const [selectedShelf, setSelectedShelf] = useState('')
  const [temperatureThreshold, setTemperatureThreshold] = useState([20, 30])
  const [humidityThreshold, setHumidityThreshold] = useState([50, 70])
  const [co2Threshold, setCO2Threshold] = useState([400, 1000])
  const [lightIntensity, setLightIntensity] = useState(70)
  const [wateringFrequency, setWateringFrequency] = useState(2)
  const [nutrientDosage, setNutrientDosage] = useState(5)
  const [dataSyncFrequency, setDataSyncFrequency] = useState(5)

  const rooms = [
    { id: 'room1', name: 'Lettuce Room 3', shelves: 5 },
    { id: 'room2', name: 'Tomato Section', shelves: 4 },
  ]

  const handleSaveSettings = () => {
    // Here you would typically save the settings to your backend
    console.log('Settings saved')
    alert('Settings saved successfully!')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="environmental">Environmental Controls</TabsTrigger>
            <TabsTrigger value="irrigation">Irrigation & Nutrients</TabsTrigger>
            <TabsTrigger value="iot">IoT & Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage your account and system preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue="admin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="admin@example.com" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="environmental" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Environmental Control Settings</CardTitle>
                <CardDescription>Configure environmental parameters for your vertical farm</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="room">Select Room</Label>
                    <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                      <SelectTrigger id="room">
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="shelf">Select Shelf</Label>
                    <Select value={selectedShelf} onValueChange={setSelectedShelf}>
                      <SelectTrigger id="shelf">
                        <SelectValue placeholder="Select shelf" />
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
                <div className="space-y-2">
                  <Label>Temperature Threshold (°C)</Label>
                  <Slider
                    value={temperatureThreshold}
                    min={0}
                    max={40}
                    step={1}
                    onValueChange={setTemperatureThreshold}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Min: {temperatureThreshold[0]}°C</span>
                    <span>Max: {temperatureThreshold[1]}°C</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Humidity Threshold (%)</Label>
                  <Slider
                    value={humidityThreshold}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={setHumidityThreshold}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Min: {humidityThreshold[0]}%</span>
                    <span>Max: {humidityThreshold[1]}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>CO2 Threshold (ppm)</Label>
                  <Slider
                    value={co2Threshold}
                    min={0}
                    max={2000}
                    step={50}
                    onValueChange={setCO2Threshold}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Min: {co2Threshold[0]} ppm</span>
                    <span>Max: {co2Threshold[1]} ppm</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Light Intensity (%)</Label>
                  <Slider
                    value={[lightIntensity]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setLightIntensity(value[0])}
                  />
                  <div className="text-sm text-muted-foreground">
                    Current: {lightIntensity}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="irrigation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Irrigation & Nutrient Settings</CardTitle>
                <CardDescription>Configure watering and nutrient delivery for your crops</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Watering Frequency (times per day)</Label>
                  <Slider
                    value={[wateringFrequency]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setWateringFrequency(value[0])}
                  />
                  <div className="text-sm text-muted-foreground">
                    Current: {wateringFrequency} times per day
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nutrient Dosage (ml per liter)</Label>
                  <Slider
                    value={[nutrientDosage]}
                    min={0}
                    max={20}
                    step={0.5}
                    onValueChange={(value) => setNutrientDosage(value[0])}
                  />
                  <div className="text-sm text-muted-foreground">
                    Current: {nutrientDosage} ml/L
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nutrientMix">Nutrient Mix</Label>
                  <Select defaultValue="balanced">
                    <SelectTrigger id="nutrientMix">
                      <SelectValue placeholder="Select nutrient mix" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced Mix</SelectItem>
                      <SelectItem value="nitrogen-rich">Nitrogen Rich</SelectItem>
                      <SelectItem value="bloom-booster">Bloom Booster</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="iot" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>IoT & Data Settings</CardTitle>
                <CardDescription>Configure IoT device settings and data management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dataSync">Automatic Data Sync</Label>
                  <Switch
                    id="dataSync"
                    checked={dataSync}
                    onCheckedChange={setDataSync}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Sync Frequency (minutes)</Label>
                  <Slider
                    value={[dataSyncFrequency]}
                    min={1}
                    max={60}
                    step={1}
                    onValueChange={(value) => setDataSyncFrequency(value[0])}
                  />
                  <div className="text-sm text-muted-foreground">
                    Current: Every {dataSyncFrequency} minutes
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataRetention">Data Retention Period</Label>
                  <Select defaultValue="90">
                    <SelectTrigger id="dataRetention">
                      <SelectValue placeholder="Select data retention period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alertThreshold">Alert Threshold</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger id="alertThreshold">
                      <SelectValue placeholder="Select alert threshold" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Minor deviations)</SelectItem>
                      <SelectItem value="medium">Medium (Significant deviations)</SelectItem>
                      <SelectItem value="high">High (Critical issues only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveSettings}>Save All Settings</Button>
        </div>
      </main>
    </div>
  )
}

