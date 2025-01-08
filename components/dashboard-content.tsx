'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { CircularGauge } from "@/components/circular-gauge"
import { ControlSlider } from "@/components/control-slider"
import { Button } from "@/components/ui/button"
import { PlusCircle, X, ChevronDown, ChevronUp, Move } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"


interface Sensor {
  id: string;
  name: string;
  type: string;
  value: number;
  max: number;
  room: string;
  shelf?: string;
}

interface Control extends DashboardItem {
  id: string;
  name: string;
  type: 'slider' | 'switch';
  value: number;
  max?: number;
  room: string;
  shelf: string;
}

interface Graph {
  id: string;
  name: string;
  room: string;
  data: { name: string; value: number }[];
}

interface Room {
  id: string;
  name: string;
  sensors: Sensor[];
}

interface DashboardItem {
  id: string;
  type: 'sensor' | 'control' | 'graph';
  content: Sensor | Control | Graph;
}

function SortableItem(props: { 
  id: string; 
  children: React.ReactNode;
  isArranging: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: props.id});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...(props.isArranging ? { ...attributes, ...listeners } : {})}
      className={`relative ${props.isArranging ? 'cursor-move' : ''}`}
    >
      {props.isArranging && (
        <div className="absolute inset-0 bg-black/5 rounded-lg flex items-center justify-center z-10">
          <Move className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      {props.children}
    </div>
  );
}

export function DashboardContent() {
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: 'room1',
      name: 'Lettuce Room 3',
      sensors: [
        { id: 'sensor1', name: 'Water Tank 01', type: 'Water Level', value: 65, max: 100, room: 'room1', shelf: 'A1' },
        { id: 'sensor2', name: 'Temperature Sensor 1', type: 'Temperature', value: 84, max: 100, room: 'room1', shelf: 'B2' },
        { id: 'sensor3', name: 'Humidity Sensor 1', type: 'Humidity', value: 62, max: 100, room: 'room1', shelf: 'C3' },
      ]
    },
    {
      id: 'room2',
      name: 'Tomato Section',
      sensors: [
        { id: 'sensor4', name: 'CO2 Sensor 1', type: 'CO2', value: 425, max: 1000, room: 'room2', shelf: 'D4' },
        { id: 'sensor5', name: 'Light Sensor 1', type: 'Light Intensity', value: 75, max: 100, room: 'room2', shelf: 'E5' },
      ]
    }
  ]);

  const [controls, setControls] = useState<Control[]>([
    { id: 'control1', name: 'Water Level', type: 'slider', value: 6, max: 10, room: 'room1', shelf: 'A1' },
    { id: 'control2', name: 'CO2 Level', type: 'slider', value: 425, max: 1000, room: 'room1', shelf: 'B2' },
    { id: 'control3', name: 'Light Intensity', type: 'slider', value: 75, max: 100, room: 'room2', shelf: 'C3' },
    { id: 'control4', name: 'Drip Irrigation', type: 'switch', value: 1, room: 'room2', shelf: 'D4' },
    { id: 'control5', name: 'Sprinkler System', type: 'switch', value: 0, room: 'room1', shelf: 'E5' },
  ]);

  const [graphs, setGraphs] = useState<Graph[]>([
    {
      id: 'graph1',
      name: 'Temperature Over Time',
      room: 'room1',
      data: [
        { name: '00:00', value: 20 },
        { name: '04:00', value: 18 },
        { name: '08:00', value: 22 },
        { name: '12:00', value: 25 },
        { name: '16:00', value: 23 },
        { name: '20:00', value: 21 },
      ]
    },
    {
      id: 'graph2',
      name: 'Humidity Over Time',
      room: 'room2',
      data: [
        { name: '00:00', value: 60 },
        { name: '04:00', value: 58 },
        { name: '08:00', value: 62 },
        { name: '12:00', value: 65 },
        { name: '16:00', value: 63 },
        { name: '20:00', value: 61 },
      ]
    },
  ]);

  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([
    { id: 'item1', type: 'sensor', content: rooms[0].sensors[0] },
    { id: 'item2', type: 'sensor', content: rooms[0].sensors[1] },
    { id: 'item3', type: 'control', content: controls[0] },
    { id: 'item4', type: 'graph', content: graphs[0] },
  ]);

  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [selectedItemType, setSelectedItemType] = useState<'sensor' | 'control' | 'graph'>('sensor');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [selectedShelf, setSelectedShelf] = useState<string>('');

  const [waterLevel, setWaterLevel] = useState(6);
  const [dewPoint, setDewPoint] = useState(60);
  const [co2Level, setCO2Level] = useState(425);
  const [maxHumidity, setMaxHumidity] = useState(75);
  const [maxTemp, setMaxTemp] = useState(84);
  const [sprinklerLevel, setSprinklerLevel] = useState(3);
  const [dripLevel, setDripLevel] = useState(3);
  const [isDripActive, setIsDripActive] = useState(true);
  const [isSprinklerActive, setIsSprinklerActive] = useState(false);

  const [temperature, setTemperature] = useState(25);
  const [humidity, setHumidity] = useState(60);
  const [waterFlowRate, setWaterFlowRate] = useState(5);
  const [isMistingActive, setIsMistingActive] = useState(false);
  const [lightIntensity, setLightIntensity] = useState(80);
  const [lightCycle, setLightCycle] = useState("18/6");
  const [phLevel, setPHLevel] = useState(6.5);
  const [ecLevel, setECLevel] = useState(1.5);
  const [energyConsumption, setEnergyConsumption] = useState(120);
  const [cropHealthIndex, setCropHealthIndex] = useState(85);
  const [selectedCropType, setSelectedCropType] = useState<string>('lettuce');

  const energyData = [
    { time: '00:00', value: 50 },
    { time: '04:00', value: 80 },
    { time: '08:00', value: 100 },
    { time: '12:00', value: 120 },
    { time: '16:00', value: 150 },
    { time: '20:00', value: 90 },
  ];


  const sensors = useSensor(PointerSensor)
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
  const dndSensors = useSensors(sensors, keyboardSensor)

  const addItem = () => {
    let newItem: DashboardItem | null = null;

    if (selectedItemType === 'sensor') {
      const roomToAddFrom = rooms.find(room => room.id === selectedRoom);
      const sensorToAdd = roomToAddFrom?.sensors.find(sensor => sensor.id === selectedItem);
      if (sensorToAdd) {
        newItem = { 
          id: `item${dashboardItems.length + 1}`, 
          type: 'sensor', 
          content: {...sensorToAdd, room: selectedRoom, shelf: selectedShelf} 
        };
      }
    } else if (selectedItemType === 'control') {
      const controlToAdd = controls.find(control => control.id === selectedItem);
      if (controlToAdd) {
        newItem = { 
          id: `item${dashboardItems.length + 1}`, 
          type: 'control', 
          content: {...controlToAdd, room: selectedRoom, shelf: selectedShelf} 
        };
      }
    } else if (selectedItemType === 'graph') {
      const graphToAdd = graphs.find(graph => graph.id === selectedItem);
      if (graphToAdd) {
        newItem = { 
          id: `item${dashboardItems.length + 1}`, 
          type: 'graph', 
          content: {...graphToAdd, room: selectedRoom} 
        };
      }
    }

    if (newItem && !dashboardItems.some(item => item.content.id === newItem!.content.id)) {
      setDashboardItems([...dashboardItems, newItem]);
    }

    setSelectedRoom('');
    setSelectedItem('');
    setSelectedShelf('');
  };

  const removeItem = (itemId: string) => {
    setDashboardItems(dashboardItems.filter(item => item.id !== itemId));
  };

  const handleDragEnd = (event: any) => {
    const {active, over} = event;

    if (active.id !== over.id) {
      setDashboardItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateSensorValues = (roomId: string, newValues: { [key: string]: number }) => {
    setRooms(rooms.map(room => {
      if (room.id === roomId) {
        const updatedSensors = room.sensors.map(sensor => ({
          ...sensor,
          value: newValues[sensor.id] !== undefined ? newValues[sensor.id] : sensor.value
        }));
        return { ...room, sensors: updatedSensors };
      }
      return room;
    }));

    // Update dashboardItems if they contain any of the updated sensors
    setDashboardItems(dashboardItems.map(item => {
      if (item.type === 'sensor' && (item.content as Sensor).room === roomId) {
        const updatedValue = newValues[(item.content as Sensor).id];
        if (updatedValue !== undefined) {
          return { ...item, content: { ...item.content, value: updatedValue } };
        }
      }
      return item;
    }));
  };

  const [isArranging, setIsArranging] = useState(false);
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());

  const toggleItemCollapse = (itemId: string) => {
    setCollapsedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const getRoomAndShelfInfo = (item: DashboardItem) => {
    if (item.type === 'sensor') {
      const sensor = item.content as Sensor;
      const room = rooms.find(r => r.id === sensor.room);
      return {
        roomName: room?.name || 'Unknown Room',
        shelf: sensor.shelf || 'N/A'
      };
    } else if (item.type === 'control') {
      const control = item.content as Control;
      const room = rooms.find(r => r.id === control.room);
      return {
        roomName: room?.name || 'Unknown Room',
        shelf: control.shelf
      };
    }
    return null;
  };

  const updateControlsForCrop = (cropType: string) => {
    switch (cropType) {
      case 'lettuce':
        setTemperature(18);
        setHumidity(70);
        setLightIntensity(60);
        break;
      case 'tomatoes':
        setTemperature(24);
        setHumidity(65);
        setLightIntensity(80);
        break;
      case 'strawberries':
        setTemperature(20);
        setHumidity(60);
        setLightIntensity(70);
        break;
      case 'herbs':
        setTemperature(22);
        setHumidity(55);
        setLightIntensity(65);
        break;
    }
  };

  return (
    <main className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Add Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Item to Dashboard</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="itemType" className="text-right">
                    Item Type
                  </Label>
                  <Select value={selectedItemType} onValueChange={(value: 'sensor' | 'control' | 'graph') => setSelectedItemType(value)}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select item type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sensor">Sensor</SelectItem>
                      <SelectItem value="control">Control</SelectItem>
                      <SelectItem value="graph">Graph</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="room" className="text-right">
                    Room
                  </Label>
                  <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedItemType !== 'graph' && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="shelf" className="text-right">
                      Shelf
                    </Label>
                    <Select value={selectedShelf} onValueChange={setSelectedShelf}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select shelf" />
                      </SelectTrigger>
                      <SelectContent>
                        {['A1', 'B2', 'C3', 'D4', 'E5'].map((shelf) => (
                          <SelectItem key={shelf} value={shelf}>{shelf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="item" className="text-right">
                    {selectedItemType === 'sensor' ? 'Sensor' : selectedItemType === 'control' ? 'Control' : 'Graph'}
                  </Label>
                  <Select value={selectedItem} onValueChange={setSelectedItem}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder={`Select ${selectedItemType}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedItemType === 'sensor' && rooms.find(room => room.id === selectedRoom)?.sensors.map((sensor) => (
                        <SelectItem key={sensor.id} value={sensor.id}>{sensor.name}</SelectItem>
                      ))}
                      {selectedItemType === 'control' && controls.map((control) => (
                        <SelectItem key={control.id} value={control.id}>{control.name}</SelectItem>
                      ))}
                      {selectedItemType === 'graph' && graphs.map((graph) => (
                        <SelectItem key={graph.id} value={graph.id}>{graph.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={addItem}>Add Item</Button>
            </DialogContent>
          </Dialog>
          <Button 
            variant="outline" 
            onClick={() => setIsArranging(!isArranging)}
            className={isArranging ? 'bg-secondary' : ''}
          >
            {isArranging ? 'Done' : 'Arrange'}
          </Button>
        </div>
      </div>
      <DndContext 
        sensors={dndSensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={dashboardItems.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {dashboardItems.map((item) => {
              const locationInfo = getRoomAndShelfInfo(item);
              return (
                <SortableItem key={item.id} id={item.id} isArranging={isArranging}>
                  <Collapsible open={!collapsedItems.has(item.id)}>
                    <Card className={isArranging ? 'opacity-75' : ''} >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                          <CardTitle className="dark:text-white">{item.content.name}</CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            {locationInfo?.roomName} - Shelf {locationInfo?.shelf}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => toggleItemCollapse(item.id)}>
                              {collapsedItems.has(item.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronUp className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CollapsibleContent>
                        <CardContent>
                          {item.type === 'sensor' && (
                            <CircularGauge 
                              value={(item.content as Sensor).value} 
                              max={(item.content as Sensor).max} 
                              label={(item.content as Sensor).type}
                              room={locationInfo?.roomName || ''}
                              shelf={locationInfo?.shelf || ''}
                            />
                          )}
                          {item.type === 'control' && (item.content as Control).type === 'slider' && (
                            <ControlSlider
                              label={(item.content as Control).name}
                              value={(item.content as Control).value}
                              max={(item.content as Control).max || 100}
                              onChange={([value]) => {
                                const updatedControls = controls.map(control =>
                                  control.id === item.content.id ? { ...control, value } : control
                                );
                                setControls(updatedControls);
                              }}
                            />
                          )}
                          {item.type === 'control' && (item.content as Control).type === 'switch' && (
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{(item.content as Control).value ? 'ON' : 'OFF'}</span>
                              <Switch
                                checked={(item.content as Control).value === 1}
                                onCheckedChange={(checked) => {
                                  const updatedControls = controls.map(control =>
                                    control.id === item.content.id ? { ...control, value: checked ? 1 : 0 } : control
                                  );
                                  setControls(updatedControls);
                                }}
                              />
                            </div>
                          )}
                          {item.type === 'graph' && (
                            <ResponsiveContainer width="100%" height={200}>
                              <LineChart data={(item.content as Graph).data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" stroke="#8884d8" />
                              </LineChart>
                            </ResponsiveContainer>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                </SortableItem>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400 dark:text-white">Global Controls and Widgets</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Manage and monitor your vertical farming system based on crop type
            </CardDescription>
            <div className="mt-2">
              <Label htmlFor="cropType">Select Crop Type</Label>
              <Select
                id="cropType"
                value={selectedCropType}
                onValueChange={(value) => {
                  setSelectedCropType(value);
                  updateControlsForCrop(value);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select crop type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lettuce">Lettuce</SelectItem>
                  <SelectItem value="tomatoes">Tomatoes</SelectItem>
                  <SelectItem value="strawberries">Strawberries</SelectItem>
                  <SelectItem value="herbs">Herbs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Environmental Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ControlSlider
                    label="Temperature (°C)"
                    value={temperature}
                    max={40}
                    onChange={([value]) => setTemperature(value)}
                  />
                  <ControlSlider
                    label="Humidity (%)"
                    value={humidity}
                    max={100}
                    onChange={([value]) => setHumidity(value)}
                  />
                  <ControlSlider
                    label="CO2 Level (ppm)"
                    value={co2Level}
                    max={2000}
                    onChange={([value]) => setCO2Level(value)}
                  />
                </CardContent>
              </Card>
              <Card className="dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Irrigation Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ControlSlider
                    label="Water Flow Rate (L/min)"
                    value={waterFlowRate}
                    max={10}
                    onChange={([value]) => setWaterFlowRate(value)}
                  />
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Drip Irrigation</span>
                    <Switch
                      checked={isDripActive}
                      onCheckedChange={setIsDripActive}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Misting System</span>
                    <Switch
                      checked={isMistingActive}
                      onCheckedChange={setIsMistingActive}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card className="dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Lighting Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ControlSlider
                    label="Light Intensity (%)"
                    value={lightIntensity}
                    max={100}
                    onChange={([value]) => setLightIntensity(value)}
                  />
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Light Cycle</span>
                    <Select value={lightCycle} onValueChange={setLightCycle}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="18/6">18/6 (Veg)</SelectItem>
                        <SelectItem value="12/12">12/12 (Flower)</SelectItem>
                        <SelectItem value="6/18">6/18 (Finish)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Nutrient Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ControlSlider
                    label="pH Level"
                    value={phLevel}
                    max={14}
                    onChange={([value]) => setPHLevel(value)}
                  />
                  <ControlSlider
                    label="EC Level (mS/cm)"
                    value={ecLevel}
                    max={5}
                    onChange={([value]) => setECLevel(value)}
                  />
                  <Button onClick={() => alert("Nutrient dosing initiated")}>
                    Dose Nutrients
                  </Button>
                </CardContent>
              </Card>
              <Card className="dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Energy Consumption</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{energyConsumption} kWh</div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Daily consumption</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={energyData}>
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Crop Health Index</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-white">{cropHealthIndex}%</div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Overall crop health</p>
                  <Progress value={cropHealthIndex} className="mt-2 bg-orange-200 dark:bg-orange-900" />
                  <Button className="mt-4" onClick={() => alert("Generating detailed crop health report")}>
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

