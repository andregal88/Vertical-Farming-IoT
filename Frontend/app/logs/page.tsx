'use client'

import { useEffect, useState } from 'react'
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import saveAs from 'file-saver';

export default function LogsPage() {
  const [logs, setLogs] = useState([]) // State to hold logs fetched from the backend
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  // Fetch logs from the backend
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/sensor-maintenance') // Update with your API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch logs')
        }
        const data = await response.json()
        setLogs(data.data) // Assuming the logs are in the "data" key of the API response
      } catch (error) {
        console.error('Error fetching logs:', error)
      }
    }

    fetchLogs()
  }, [])

  const filteredLogs = logs.filter(log => 
    (log.review.toLowerCase().includes(searchTerm.toLowerCase()) ||
     log.sensor_id.toString().includes(searchTerm)) &&
    (filterType === 'all' || log.status.toLowerCase() === filterType.toLowerCase())
  )

  const getLogTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'normal': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const handleExportLogs = () => {
    const csvContent = [
      ['Datetime Review', 'Sensor ID', 'Review', 'Status'],
      ...filteredLogs.map(log => [
        log.datetime_review, log.sensor_id, log.review, log.status
      ])
    ].map(e => e.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, "sensor_maintenance_logs.csv")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Sensor Maintenance Logs</h1>
        <Card>
          <CardHeader>
            <CardTitle>Log Management</CardTitle>
            <CardDescription>View and filter sensor maintenance logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end gap-4 mb-4">
              <div className="w-1/3">
                <Label htmlFor="search">Search Logs</Label>
                <Input
                  id="search"
                  placeholder="Search by review or sensor ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-1/3">
                <Label htmlFor="filter">Filter by Status</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger id="filter">
                    <SelectValue placeholder="Select log status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleExportLogs}>Export Logs</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datetime Review</TableHead>
                  <TableHead>Sensor ID</TableHead>
                  <TableHead>Review</TableHead>
                  {/* <TableHead>Datetime Review</TableHead> */}
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.datetime_review}</TableCell>
                    <TableCell>{log.sensor_id}</TableCell>
                    <TableCell>{log.review}</TableCell>
                    
                    <TableCell>
                      <Badge className={getLogTypeColor(log.status)}>
                        {log.status}
                      </Badge>
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
