"use client"

import { getStationByOperator } from "@/actions/stations";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Station } from "@/models/station";
import { PlusCircle, X, Info } from "lucide-react"
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function TravelApp() {
    const [allStations, setAllStations] = useState<Station[]>([]);
    const [selectedStations, setSelectedStations] = useState<Station[]>([]);
    const [activeStation, setActiveStation] = useState<Station | null>(null);
    const [stationLines, setStationLines] = useState<{[key: string]: Station[]}>({});
    const [lineData, setLineData] = useState<{[key: string]: {[key: string]: {price: string, childrenPrice: string, duration: string, time: string}}}>({});
    const [isAddingStation, setIsAddingStation] = useState(false);

    const [routeNumber, setRouteNumber] = useState<string>("");
    const [destination, setDestination] = useState<string>("");
    const [departureTime, setDepartureTime] = useState<string>("");
    const [numberOfTickets, setNumberOfTickets] = useState<number>(48);
    const [weeksToGenerate, setWeeksToGenerate] = useState<number>(1);
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
    const [metadata, setMetadata] = useState<{[key: string]: string}>({});

    useEffect(() => {
        const op_id = "66cba19d1a6e55b32932c59b"
        getStationByOperator(op_id).then((fetchedStations: Station[]) => {
            setAllStations(fetchedStations);
            console.log({stations: fetchedStations})
        })        
    }, []);

    const handleInputChange = (stationId: string, lineId: string, field: string, value: string) => {
        setLineData(prev => ({
            ...prev,
            [stationId]: {
                ...prev[stationId],
                [lineId]: {
                    ...prev[stationId]?.[lineId],
                    [field]: value
                }
            }
        }));
    }

    const handleDayChange = (day: number) => {
        setDaysOfWeek(prev => 
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    }

    const formatStopsData = () => {
        const formattedStops = [];
        for (const stationId in lineData) {
            for (const lineId in lineData[stationId]) {
                const line = lineData[stationId][lineId];
                const station = allStations.find(s => s._id === lineId);
                if (station) {
                    formattedStops.push({
                        station: station._id,
                        price: parseFloat(line.price),
                        children_price: parseFloat(line.childrenPrice),
                        time: line.time,
                        max_buying_time: line.duration 
                    });
                }
            }
        }
        return formattedStops;
    }

    const handleSubmit = () => {
        const formattedStops = formatStopsData();

        const lineDataForBackend = {
            route_number: routeNumber,
            destination: destination || (selectedStations.length > 0 ? selectedStations[selectedStations.length - 1].name : ""),
            time: departureTime,
            stops: formattedStops,
            number_of_tickets: numberOfTickets,
            metadata,
            days_of_week: daysOfWeek,
            weeks_to_generate: weeksToGenerate
        };

        console.log("Data to be sent to backend:", lineDataForBackend);
    }

    const removeLine = (stationId: string, lineId: string) => {
        setStationLines(prev => ({
            ...prev,
            [stationId]: prev[stationId].filter(line => line._id !== lineId)
        }));
        setLineData(prev => {
            const newData = { ...prev };
            if (newData[stationId]) {
                delete newData[stationId][lineId];
            }
            return newData;
        });
    }

    const addStation = () => {
        setIsAddingStation(true);
    }

    const selectStation = (station: Station) => {
        if (!selectedStations.find(s => s._id === station._id)) {
            setSelectedStations(prev => [...prev, station]);
            setStationLines(prev => ({
                ...prev,
                [station._id!]: allStations.filter(s => s._id !== station._id)
            }));
            setLineData(prev => ({
                ...prev,
                [station._id!]: {}
            }));
        }
        setIsAddingStation(false);
    }

    const removeStation = (stationId: string) => {
        setSelectedStations(prev => prev.filter(s => s._id !== stationId));
        setStationLines(prev => {
            const newStationLines = { ...prev };
            delete newStationLines[stationId];
            return newStationLines;
        });
        setLineData(prev => {
            const newLineData = { ...prev };
            delete newLineData[stationId];
            return newLineData;
        });
        if (activeStation?._id === stationId) {
            setActiveStation(null);
        }
    }

    return (
        <div className="flex justify-center items-start space-x-8 p-8 bg-gray-100 min-h-screen">
            <Dialog>
                <DialogTrigger asChild>
                    <Button 
                        className="fixed top-4 right-4 z-10" 
                        variant="outline"
                    >
                        <Info className="h-4 w-4 mr-2" />
                        How to use
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>How to Create Lines</DialogTitle>
                        <DialogDescription>
                            Follow these steps to create lines in the Travel App:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p>1. Add stations using the "Shto stacion të ri" button in the left panel.</p>
                        <p>2. Click on a station in the left panel to select it.</p>
                        <p>3. The right panel will show possible lines from the selected station.</p>
                        <p>4. For each line, enter the price, children's price, start time, and duration.</p>
                        <p>5. Use the red X button to remove unwanted lines.</p>
                        <p>6. Click the "Submit" button to save your changes.</p>
                    </div>
                </DialogContent>
            </Dialog>

            <Card className="w-80">
                <CardHeader>
                    <CardTitle>cikidenski</CardTitle>
                </CardHeader>
                <CardContent>
                    {isAddingStation ? (
                        <ul className="space-y-4">
                            {allStations.map((station, index) => (
                                <li 
                                    key={index} 
                                    onClick={() => selectStation(station)}
                                    className="flex items-center space-x-4 p-2 rounded cursor-pointer hover:bg-gray-200 transition-colors"
                                >
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    <div>
                                        <p className="font-semibold">{station.city}</p>
                                        <p className="text-sm text-gray-500">{station.name}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <ul className="space-y-4">
                            {selectedStations.map((station, index) => (
                                <li 
                                    key={index}
                                    className={`${activeStation?._id === station._id && "bg-black/10"} flex items-center justify-between space-x-4 p-2 rounded cursor-pointer hover:bg-gray-200 transition-colors`}
                                >
                                    <div className="flex items-center space-x-4" onClick={() => setActiveStation(station)}>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                        <div>
                                            <p className="font-semibold">{station.city}</p>
                                            <p className="text-sm text-gray-500">{station.name}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => removeStation(station._id!)}
                                        className="h-8 w-8 bg-red-500 text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <Button className="w-full mt-4" variant="outline" onClick={addStation}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Shto stacion të ri
                    </Button>
                </CardContent>
            </Card>

            <Card className="w-96">
                <CardHeader>
                    <CardTitle className="text-md">Linjat e mundshme prej në {activeStation?.city} - {activeStation?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {activeStation && stationLines[activeStation._id!]?.map((line) => (
                            <li key={line._id} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span>{line.city}</span>
                                    <span className="font-semibold">{line.name}</span>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => removeLine(activeStation._id!, line._id!)}
                                        className="h-8 w-8 bg-red-500 text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input 
                                        type="number" 
                                        placeholder="Price" 
                                        value={lineData[activeStation._id!]?.[line._id!]?.price || ''} 
                                        onChange={(e) => handleInputChange(activeStation._id!, line._id!, 'price', e.target.value)}
                                    />
                                    <Input 
                                        type="number" 
                                        placeholder="Children price" 
                                        value={lineData[activeStation._id!]?.[line._id!]?.childrenPrice || ''} 
                                        onChange={(e) => handleInputChange(activeStation._id!, line._id!, 'childrenPrice', e.target.value)}
                                    />
                                    <Input 
                                        type="text" 
                                        placeholder="Start time" 
                                        value={lineData[activeStation._id!]?.[line._id!]?.time || ''} 
                                        onChange={(e) => handleInputChange(activeStation._id!, line._id!, 'time', e.target.value)}
                                    />
                                    <Input 
                                        type="number" 
                                        placeholder="Duration (hrs)" 
                                        value={lineData[activeStation._id!]?.[line._id!]?.duration || ''} 
                                        onChange={(e) => handleInputChange(activeStation._id!, line._id!, 'duration', e.target.value)}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Button className="w-full mt-4" onClick={handleSubmit}>
                        Submit
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}