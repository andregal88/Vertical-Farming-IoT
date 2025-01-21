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
import { jwtDecode } from 'jwt-decode'
import { useAuth } from "@/lib/auth"

export default function LogsPage() {
  const { user, loading } = useAuth(); // Get the current user and loading state from the auth hook
  const [logs, setLogs] = useState([]); // State to hold logs fetched from the backend
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10); // Set how many logs to show per page

  useEffect(() => {
    // if (loading || !user?.) return; // Wait until the user and token are loaded
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');
    // Decode the token to get user_id and role
    const decodedToken = jwtDecode(storedToken);
    const userId = decodedToken.id;
    const userRole = decodedToken.role;

    const fetchLogs = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5015/sensor-maintenance?user_id=${userId}&role=${userRole}`, {
          headers: {
            Authorization: `Bearer ${user.token}`, // Pass the token in the Authorization header
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch logs');
        }
        const data = await response.json();
        setLogs(data.data); // Assuming the logs are in the "data" key of the API response
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };
  
    // Fetch logs when the user and token are ready
    fetchLogs();
    // Set up polling interval
    const interval = setInterval(fetchLogs, 10000); // Fetch data every 10 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [loading, user]);
  


  // Filter logs based on the search term and filter type
  const filteredLogs = logs.filter(log => 
    (log.review.toLowerCase().includes(searchTerm.toLowerCase()) ||
     log.sensor_id.toString().includes(searchTerm) ||
     log.sensor_name.toLowerCase().includes(searchTerm.toLowerCase())) && // Added search by sensor_name
    (filterType === 'all' || log.status.toLowerCase() === filterType.toLowerCase())
  )

  // Pagination logic
  const indexOfLastLog = currentPage * logsPerPage
  const indexOfFirstLog = indexOfLastLog - logsPerPage
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog)
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage)

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
      ['Timestamp', 'Sensor Name', 'Sensor ID', 'Review', 'Datetime Review', 'Status'],
      ...currentLogs.map(log => [
        log.timestamp, log.sensor_name, log.sensor_id, log.review, log.datetime_review, log.status
      ])
    ].map(e => e.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, "sensor_maintenance_logs.csv")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Sensors Alert Logs</h1>
        <Card>
          <CardHeader>
            <CardTitle>Log Management</CardTitle>
            <CardDescription>View and filter sensors alert logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end gap-4 mb-4">
              <div className="w-1/3">
                <Label htmlFor="search">Search Logs</Label>
                <Input
                  id="search"
                  placeholder="Search by review, sensor ID, or sensor name"
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
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Sensor Name</TableHead>
                  <TableHead>Sensor ID</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Datetime Review</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.timestamp}</TableCell>
                    <TableCell>{log.sensor_name}</TableCell>
                    <TableCell>{log.sensor_id}</TableCell>
                    <TableCell>{log.review}</TableCell>
                    <TableCell>{log.datetime_review}</TableCell>
                    <TableCell>
                      <Badge className={getLogTypeColor(log.status)}>
                        {log.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-between mt-4 items-center">
              {/* First Page Button */}
              <Button disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
                First
              </Button>

              {/* Previous Page Button */}
              <Button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex gap-2">
                {/* Display 1st page button if needed */}
                {currentPage > 3 && (
                  <Button onClick={() => setCurrentPage(1)}>1</Button>
                )}

                {/* Display "..." if skipped pages */}
                {currentPage > 4 && <span className="px-2">...</span>}

                {/* Display pages around the current page */}
                {Array.from({ length: 5 }).map((_, index) => {
                  const page = currentPage - 2 + index;
                  // Only render valid page numbers within the range
                  if (page > 0 && page <= totalPages) {
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'outline' : 'default'}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  }
                  return null;
                })}

                {/* Display "..." if skipped pages */}
                {currentPage < totalPages - 3 && <span className="px-2">...</span>}

                {/* Display last page button if needed */}
                {currentPage < totalPages - 2 && (
                  <Button onClick={() => setCurrentPage(totalPages)}>{totalPages}</Button>
                )}
              </div>

              {/* Next Page Button */}
              <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                Next
              </Button>

              {/* Last Page Button */}
              <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
                Last
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
