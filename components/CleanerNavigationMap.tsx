import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface Point {
    lat: number;
    lng: number;
}

interface CleanerNavigationMapProps {
    route: Point[];
    startPosition: Point;
    endPosition: Point;
}

// Start (cleaner) Icon
const cleanerIcon = L.divIcon({
    html: `
        <div class="relative flex items-center justify-center w-8 h-8">
            <div class="relative w-7 h-7 bg-primary rounded-full shadow-lg flex items-center justify-center text-white ring-4 ring-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
            </div>
        </div>
    `,
    className: 'bg-transparent border-0',
    iconSize: [32, 32],
    iconAnchor: [16, 32], // Point at bottom center
});

// Destination (client home) Icon
const destinationIcon = L.divIcon({
    html: `
        <div class="relative flex items-center justify-center w-8 h-8">
            <div class="relative w-7 h-7 bg-accent rounded-full shadow-lg flex items-center justify-center text-white ring-4 ring-white">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
            </div>
        </div>
    `,
    className: 'bg-transparent border-0',
    iconSize: [32, 32],
    iconAnchor: [16, 32], // Point at bottom center
});


const CleanerNavigationMap: React.FC<CleanerNavigationMapProps> = ({ route, startPosition, endPosition }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            const map = L.map(mapContainerRef.current, {
                scrollWheelZoom: true,
                touchZoom: true,
                dragging: true,
                zoomControl: true,
            });
            mapRef.current = map;

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);

            // Add markers for start and end points
            L.marker(startPosition, { icon: cleanerIcon, zIndexOffset: 1000 }).addTo(map);
            L.marker(endPosition, { icon: destinationIcon }).addTo(map);
        }
    }, [startPosition, endPosition]);

    // Draw route and fit bounds
    useEffect(() => {
        const map = mapRef.current;
        if (map && route.length > 0) {
            const latLngs = route.map(p => L.latLng(p.lat, p.lng));
            
            const routePolyline = L.polyline(latLngs, { 
                color: '#3B82F6', // A nice blue
                weight: 6, 
                opacity: 0.8,
            }).addTo(map);
            
            // Fit map to route bounds
            map.fitBounds(routePolyline.getBounds(), { padding: [60, 60] });
        }
    }, [route]);

    return (
        <div className="w-full h-full" ref={mapContainerRef} aria-label="Cleaner navigation map"></div>
    );
};

export default CleanerNavigationMap;