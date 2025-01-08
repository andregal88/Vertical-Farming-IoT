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
import saveAs from 'file-saver';

export default function LogsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const logs = [
    { id: 1, timestamp: '2024-07-26 13:45:22', type: 'Alert', message: 'Water level low in Tank 2', device: 'Water Level Sensor 1' },
    { id: 2, timestamp: '2024-07-26 13:30:15', type: 'Warning', message: 'Temperature spike in Lettuce Room 1', device: 'Temperature Sensor 1' },
    { id: 3, timestamp: '2024-07-26 13:15:03', type: 'Info', message: 'Nutrient solution replenished', device: 'Nutrient Dosing System' },
    { id: 4, timestamp: '2024-07-26 13:00:57', type: 'Error', message: 'CO2 sensor malfunction', device: 'CO2 Sensor 1' },
    { id: 5, timestamp: '2024-07-26 12:45:30', type: 'Info', message: 'Light cycle started for Tomato Section', device: 'Lighting Control' },
    { id: 6, timestamp: '2024-07-26 12:30:22', type: 'Warning', message: 'Humidity levels critical in Tomato Section', device: 'Humidity Sensor 2' },
    { id: 7, timestamp: '2024-07-26 12:15:11', type: 'Info', message: 'Daily system health check completed', device: 'System' },
    { id: 8, timestamp: '2024-07-26 12:00:05', type: 'Alert', message: 'Unexpected pH fluctuation detected', device: 'pH Sensor 1' },
  ]

  const filteredLogs = logs.filter(log => 
    (log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
     log.device.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterType === 'all' || log.type.toLowerCase() === filterType.toLowerCase())
  )

  const getLogTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'alert': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      case 'info': return 'bg-blue-500'
      case 'error': return 'bg-red-700'
      default: return 'bg-gray-500'
    }
  }

  const handleExportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Type', 'Message', 'Device'],
      ...filteredLogs.map(log => [log.timestamp, log.type, log.message, log.device])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, "agrisense_logs.csv");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">System Logs</h1>
        <Card>
          <CardHeader>
            <CardTitle>Log Management</CardTitle>
            <CardDescription>View and filter system logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end gap-4 mb-4">
              <div className="w-1/3">
                <Label htmlFor="search">Search Logs</Label>
                <Input
                  id="search"
                  placeholder="Search by message or device"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-1/3">
                <Label htmlFor="filter">Filter by Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger id="filter">
                    <SelectValue placeholder="Select log type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleExportLogs}>Export Logs</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Device</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.timestamp}</TableCell>
                    <TableCell>
                      <Badge className={getLogTypeColor(log.type)}>
                        {log.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.message}</TableCell>
                    <TableCell>{log.device}</TableCell>
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

