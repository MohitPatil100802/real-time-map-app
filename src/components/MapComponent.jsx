import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvent, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../App.css';

const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [30, 45],
    iconAnchor: [15, 45],
});

const MapComponent = () => {
    const [startLocation, setStartLocation] = useState('');
    const [destinationLocation, setDestinationLocation] = useState('');
    const [startCoords, setStartCoords] = useState([18.5204, 73.8567]); // Default to Pune, India
    const [destinationCoords, setDestinationCoords] = useState([19.076, 72.8777]); // Default to Mumbai, India
    const [distance, setDistance] = useState(null);
    const [duration, setDuration] = useState(null);
    const [clickedLocation, setClickedLocation] = useState(null);
    const [isLocating, setIsLocating] = useState(false);

    const MapCenter = ({ coords }) => {
        const map = useMap();
        useEffect(() => {
            map.setView(coords, 13);
        }, [coords]);
        return null;
    };

    const handleGeocode = async (address, setCoords) => {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`);
        const data = await response.json();
        if (data && data[0]) {
            const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            setCoords(coords);
        } else {
            alert(`Location "${address}" not found.`);
        }
    };

const handleCurrentLocation = () => {
        setIsLocating(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const coords = [latitude, longitude];
                    setStartCoords(coords);
                    setStartLocation('My Current Location');
                    setIsLocating(false);
                },
                (error) => {
                    console.error(`Error fetching location: ${error.message}`);
                    if (error.code === error.TIMEOUT) {
                        alert('Location request timed out. Retrying with extended timeout...');
                        retryLocation();
                    } else {
                        alert(`Error fetching location: ${error.message}. Please ensure GPS is enabled.`);
                        setIsLocating(false);
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,    // 10 seconds timeout for faster retries
                    maximumAge: 0      // Avoid cached locations for accuracy
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
            setIsLocating(false);
        }
    };
    
    const retryLocation = () => {
        setTimeout(() => handleCurrentLocation(), 3000); // Retry after 3 seconds if timeout occurs
    };
    

    const swapLocations = () => {
        setStartCoords(destinationCoords);
        setDestinationCoords(startCoords);
        setStartLocation(destinationLocation);
        setDestinationLocation(startLocation);
    };

    const calculateDistanceAndTime = async () => {
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${destinationCoords[1]},${destinationCoords[0]}?overview=full`);
        const data = await response.json();
        if (data && data.routes) {
            const route = data.routes[0];
            setDistance((route.distance / 1000).toFixed(2));
            setDuration((route.duration / 60).toFixed(0));
        }
    };

    const handleClick = (e) => {
        const coords = e.latlng;
        setClickedLocation({ lat: coords.lat.toFixed(5), lng: coords.lng.toFixed(5) });
    };

    return (
        <div className="map-container">
            <div className="controls">
                <input
                    type="text"
                    placeholder="Enter Start or Current Location"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    onBlur={() => handleGeocode(startLocation, setStartCoords)}
                />
                <button onClick={handleCurrentLocation} disabled={isLocating}>
                    {isLocating ? 'Locating...' : '📍 Current Location'}
                </button>
                <input
                    type="text"
                    placeholder="Enter Destination"
                    value={destinationLocation}
                    onChange={(e) => setDestinationLocation(e.target.value)}
                    onBlur={() => handleGeocode(destinationLocation, setDestinationCoords)}
                />
                <button onClick={swapLocations}>🔄 Swap Locations</button>
                <button onClick={calculateDistanceAndTime}>🔍 Search</button>
            </div>

            <MapContainer center={startCoords} zoom={13} style={{ height: '500px', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapCenter coords={startCoords} />
                
                <Marker position={startCoords} icon={customIcon}><Tooltip permanent>Start: {startLocation}</Tooltip></Marker>
                <Marker position={destinationCoords} icon={customIcon}><Tooltip permanent>Destination: {destinationLocation}</Tooltip></Marker>
                <Polyline positions={[startCoords, destinationCoords]} color="blue" />

                <MapEvent onClick={handleClick} />
                {clickedLocation && (
                    <Marker position={[clickedLocation.lat, clickedLocation.lng]} icon={customIcon}>
                        <Tooltip permanent>Clicked Location: [{clickedLocation.lat}, {clickedLocation.lng}]</Tooltip>
                    </Marker>
                )}
            </MapContainer>

            {distance && duration && (
                <div className="distance-info">
                    Distance: {distance} km | Time: {duration} mins
                </div>
            )}
        </div>
    );
};

const MapEvent = ({ onClick }) => {
    useMapEvent('click', onClick);
    return null;
};

export default MapComponent;
