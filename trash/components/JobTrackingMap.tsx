

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

/**
 * Represents a geographical point with latitude and longitude.
 * @interface Point
 */
interface Point {
    /** The latitude of the point. */
    lat: number;
    /** The longitude of the point. */
    lng: number;
}

/**
 * Props for the JobTrackingMap component.
 * @interface JobTrackingMapProps
 */
interface JobTrackingMapProps {
    /** An array of points representing the route to be drawn on the map. */
    route: Point[];
    /** The current real-time position of the cleaner. */
    cleanerPosition: Point;
    /** The starting point of the route. */
    startPosition: Point;
    /** The ending point of the route (client's location). */
    endPosition: Point;
}

/**
 * Custom Leaflet icon for the cleaner, featuring a pulsing animation.
 * @const {L.DivIcon} cleanerIcon
 */
const cleanerIcon = L.divIcon({
    html: `
        <div class="relative flex items-center justify-center w-8 h-8">
            <div class="absolute w-8 h-8 bg-primary rounded-full animate-ping opacity-75"></div>
            <div class="relative w-6 h-6 bg-primary rounded-full shadow-lg flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
            </div>
        </div>
    `,
    className: 'bg-transparent border-0',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

/**
 * Custom Leaflet icon for the user's location (the client's home).
 * @const {L.DivIcon} userLocationIcon
 */
const userLocationIcon = L.divIcon({
    html: `<div class="w-5 h-5 bg-blue-500 rounded-full ring-4 ring-white dark:ring-slate-800 shadow-md"></div>`,
    className: 'bg-transparent border-0',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

/**
 * Custom Leaflet icon representing the starting point of the job with a flag icon.
 * @const {L.DivIcon} startIcon
 */
const startIcon = L.divIcon({
    html: `
        <div class="flex items-center justify-center w-8 h-8 bg-slate-500 rounded-full shadow-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z" />
            </svg>
        </div>
    `,
    className: 'bg-transparent border-0',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

/**
 * A sophisticated map component for live-tracking a cleaner's progress to a job.
 * It displays the route, the cleaner's real-time position with an animated marker,
 * and allows toggling between street and satellite map layers.
 *
 * @param {JobTrackingMapProps} props The props for the component.
 * @returns {React.ReactElement} The rendered map container div.
 */
const JobTrackingMap: React.FC<JobTrackingMapProps> = ({ route, cleanerPosition, startPosition, endPosition }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const cleanerMarkerRef = useRef<L.Marker | null>(null);
    const routePolylineRef = useRef<L.Polyline | null>(null);

    // Initialize map
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            const map = L.map(mapContainerRef.current, {
                scrollWheelZoom: false,
                touchZoom: true,
                dragging: true,
                zoomControl: true,
            });
            mapRef.current = map;

            // Define base layers
            const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            });

            const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            });

            const baseLayers = {
                "Street": streetLayer,
                "Satellite": satelliteLayer
            };

            // Add default layer to the map
            streetLayer.addTo(map);

            // Add layer control to the map
            L.control.layers(baseLayers).addTo(map);

            // Add markers for start and end points
            L.marker(startPosition, { icon: startIcon }).addTo(map);
            L.marker(endPosition, { icon: userLocationIcon }).addTo(map);
        }
    }, [startPosition, endPosition]);

    // Draw route and fit bounds
    useEffect(() => {
        const map = mapRef.current;
        if (map && route.length > 0) {
            const latLngs = route.map(p => L.latLng(p.lat, p.lng));

            if (routePolylineRef.current) {
                routePolylineRef.current.setLatLngs(latLngs);
            } else {
                routePolylineRef.current = L.polyline(latLngs, { 
                    color: '#03A9F4', 
                    weight: 5, 
                    opacity: 0.8,
                    dashArray: '10, 10' 
                }).addTo(map);
            }
            
            // Fit map to route bounds
            map.fitBounds(routePolylineRef.current.getBounds(), { padding: [50, 50] });
        }
    }, [route]);

    // Update cleaner position
    useEffect(() => {
        const map = mapRef.current;
        if (map && cleanerPosition) {
            const cleanerLatLng = L.latLng(cleanerPosition.lat, cleanerPosition.lng);
            if (cleanerMarkerRef.current) {
                cleanerMarkerRef.current.setLatLng(cleanerLatLng);
            } else {
                cleanerMarkerRef.current = L.marker(cleanerLatLng, { icon: cleanerIcon, zIndexOffset: 1000 }).addTo(map);
            }
        }
    }, [cleanerPosition]);


    return (
        <div className="w-full h-full" ref={mapContainerRef} aria-label="Job tracking map"></div>
    );
};

export default JobTrackingMap;