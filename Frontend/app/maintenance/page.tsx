'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import axios from 'axios';

export default function MaintenancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [maintenanceNotes, setMaintenanceNotes] = useState('');
  const [status, setStatus] = useState('');
  const [sensors, setSensors] = useState<any[]>([]); // Define the array type
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [sensorSearchTerm, setSensorSearchTerm] = useState('');

  // Fetch data from API when the component mounts
  useEffect(() => {
    axios
      .get('http://127.0.0.1:5001/api/sensors')
      .then((response) => {
        setSensors(response.data); // Set sensors state with API data
      })
      .catch((error) => {
        console.error('Error fetching sensors:', error);
      });
  }, []);

  const filteredSensors = sensors.filter(
    (sensor) =>
      (sensor.name && sensor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sensor.type && sensor.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sensor.location && sensor.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sensor.status && sensor.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sensor.lastMaintenance && sensor.lastMaintenance.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'good':
        return 'bg-green-500';
      case 'critical':
        return 'bg-yellow-500';
      case 'warning':
        return 'bg-red-500';
      default:
        return '';
    }
  };

  const handleAddMaintenanceLog = () => {
    // Handle adding maintenance log logic here
    setIsDialogOpen(false);
  };

  const filteredSensorOptions = sensors.filter((sensor) =>
    sensor.name.toLowerCase().includes(sensorSearchTerm.toLowerCase())
  );

  return (
    <div>
      <Header />
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Sensor Maintenance</CardTitle>
            <CardDescription>Manage sensor maintenance logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                type="text"
                placeholder="Search sensors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button onClick={() => setIsDialogOpen(true)}>Add Maintenance Log</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Maintenance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSensors.map((sensor) => (
                  <TableRow key={sensor.id}>
                    <TableCell>{sensor.name}</TableCell>
                    <TableCell>{sensor.type}</TableCell>
                    <TableCell>{sensor.location}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(sensor.status)}>
                        {sensor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{sensor.lastMaintenance}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Maintenance Log</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a maintenance log.
              </DialogDescription>
            </DialogHeader>
            <Label htmlFor="sensor">Sensor</Label>
            {/* <Input
              type="text"
              placeholder="Search sensor"
              value={sensorSearchTerm}
              onChange={(e) => setSensorSearchTerm(e.target.value)}
            /> */}
            <Select onValueChange={setSelectedSensor}>
              <SelectTrigger>
                <SelectValue placeholder="Select a sensor" />
              </SelectTrigger>
              <SelectContent>
                {filteredSensorOptions.map((sensor) => (
                  <SelectItem key={sensor.id} value={sensor.id}>
                    {sensor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select sensor status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
            <Label htmlFor="date">Maintenance Date</Label>
            <Input
              type="date"
              id="date"
              value={maintenanceDate}
              onChange={(e) => setMaintenanceDate(e.target.value)}
            />
            {/* <Label htmlFor="notes">Maintenance Notes</Label>
            <Input
              type="text"
              id="notes"
              value={maintenanceNotes}
              onChange={(e) => setMaintenanceNotes(e.target.value)}
            /> */}
            <DialogFooter>
              <Button onClick={handleAddMaintenanceLog}>Add Log</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}