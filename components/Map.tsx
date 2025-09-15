import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import L from 'leaflet';
import 'leaflet.markercluster'; // Import for side effects, it extends L
import type { Cleaner } from '../types';
import MapCleanerCard from './MapCleanerCard';

// FIX: Removed manual type declaration for leaflet.markercluster.
// The original declaration was causing a "Duplicate identifier 'MarkerClusterGroup'" error,
// which indicates that the types are now being correctly inferred from the imported package.

interface MapProps {
    cleaners: Cleaner[];
    userLocation: { lat: number, lng: number } | null;
    selectedCleaner: Cleaner | null;
    hoveredCleanerId: number | null;
    onMarkerClick: (id: number) => void;
    onMarkerHover: (id: number | null) => void;
    onNavigate: (page: string, props: any) => void;
}

const createCleanerIcon = (cleaner: Cleaner, isSelected: boolean, isHovered: boolean) => {
    const isActive = isSelected || isHovered;
    const classNames = `
        flex items-center justify-center
        font-bold text-primary-content text-xs
        w-24 h-8 rounded-full shadow-lg
        transition-all duration-300
        ${isSelected ? 'bg-primary z-10' : 'bg-neutral-focus dark:bg-neutral'}
        ${isActive ? 'animate-pulse-marker' : ''}
    `;
    
    const iconHtml = `
        <div class="flex items-center justify-around w-full h-full px-2">
            <span class="font-bold">$${cleaner.hourlyRate}</span>
            <div class="border-l h-4 border-white/40 mx-1"></div>
            <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span class="font-semibold ml-1">${cleaner.rating.toFixed(1)}</span>
            </div>
        </div>
    `;

    return L.divIcon({
        html: iconHtml,
        className: classNames,
        iconSize: [96, 32], // w-24, h-8
        iconAnchor: [48, 16], // center
        popupAnchor: [0, -16],
    });
};

const userIcon = L.divIcon({
  html: `<div class="w-5 h-5 bg-blue-500 rounded-full ring-4 ring-white dark:ring-slate-800"></div>`,
  className: 'bg-transparent border-0',
  iconSize: [20, 20],
});


const Map: React.FC<MapProps> = ({ cleaners, userLocation, selectedCleaner, hoveredCleanerId, onMarkerClick, onMarkerHover, onNavigate }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
    const userMarkerRef = useRef<L.Marker | null>(null);
    const popupRootRef = useRef<any>(null);


    // Initialize map on component mount
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            const map = L.map(mapContainerRef.current, {
                scrollWheelZoom: true,
                touchZoom: true,
                zoomControl: false, // Disable default zoom controls
            });
            mapRef.current = map;

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);
            
            clusterGroupRef.current = L.markerClusterGroup({
                chunkedLoading: true,
                maxClusterRadius: 60,
                 iconCreateFunction: function (cluster) {
                    const count = cluster.getChildCount();
                    let size = 40;
                    let fontSize = 'font-bold';
                    if (count >= 10) {
                        size = 48;
                        fontSize = 'font-bold text-lg';
                    }
                    if (count >= 100) {
                        size = 56;
                        fontSize = 'font-bold text-xl';
                    }

                    const iconHtml = `
                        <div class="w-full h-full bg-primary text-primary-content rounded-full flex items-center justify-center shadow-lg ${fontSize} border-2 border-white/50">
                            <span>${count}</span>
                        </div>
                    `;

                    return L.divIcon({
                        html: iconHtml,
                        className: 'bg-transparent', // Let the inner div handle styling
                        iconSize: [size, size],
                        iconAnchor: [size / 2, size / 2],
                    });
                }
            });
            map.addLayer(clusterGroupRef.current);
            
            // Set initial view intelligently. If a cleaner is selected when the map
            // mounts (i.e., switching from list view), center on them instantly.
            if (selectedCleaner) {
                map.setView(selectedCleaner.location, 15);
            } else {
                map.setView([43.05, -87.95], 11);
            }

        }
    }, []);

    // Update markers when cleaner data changes
    useEffect(() => {
        const clusterGroup = clusterGroupRef.current;
        if (!clusterGroup || !mapRef.current) return;
        
        clusterGroup.clearLayers();
        
        const markers: L.Marker[] = [];
        cleaners.forEach(cleaner => {
            const isSelected = selectedCleaner?.id === cleaner.id;
            const isHovered = hoveredCleanerId === cleaner.id;
            const icon = createCleanerIcon(cleaner, isSelected, isHovered);
            const marker = L.marker([cleaner.location.lat, cleaner.location.lng], { icon });

            marker.on('click', () => {
                onMarkerClick(cleaner.id);
            });
            marker.on('mouseover', () => onMarkerHover(cleaner.id));
            marker.on('mouseout', () => onMarkerHover(null));

            markers.push(marker);
        });

        // FIX: Replaced addLayers with a loop using addLayer to conform to the provided MarkerClusterGroup type definitions.
        markers.forEach(marker => {
            clusterGroup.addLayer(marker);
        });

    }, [cleaners, selectedCleaner, hoveredCleanerId, onMarkerClick, onMarkerHover]);

    // Update user location marker
    useEffect(() => {
        if (mapRef.current && userLocation) {
            if (userMarkerRef.current) {
                userMarkerRef.current.setLatLng(userLocation);
            } else {
                userMarkerRef.current = L.marker(userLocation, { icon: userIcon, zIndexOffset: 1000 }).addTo(mapRef.current);
            }
        }
    }, [userLocation]);
    
    // Handle map view changes for selected cleaner
    useEffect(() => {
        if (selectedCleaner && mapRef.current) {
             // FIX: The 'pan' property is not a valid ZoomPanOptions property. 'duration' should be a top-level property.
             mapRef.current.setView(selectedCleaner.location, 15, { animate: true, duration: 0.5 });
        }
    }, [selectedCleaner]);
    
     // Handle popup for selected cleaner
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Close any existing popup first
        map.closePopup();
        if (popupRootRef.current) {
            popupRootRef.current.unmount();
            popupRootRef.current = null;
        }

        if (selectedCleaner) {
            const popupContainer = document.createElement('div');
            const root = createRoot(popupContainer);
            popupRootRef.current = root;
            root.render(<MapCleanerCard cleaner={selectedCleaner} onNavigate={onNavigate} />);

            const popup = L.popup({
                offset: [0, -16],
                closeButton: true,
                autoClose: true,
                className: 'cleaner-popup',
            })
            .setLatLng(selectedCleaner.location)
            .setContent(popupContainer)
            .openOn(map);
            
            // Override the default close button to also reset our selection state
            const originalOnRemove = popup.onRemove;
            // FIX: The onRemove handler signature was corrected to accept a map parameter and return the popup instance (`this`) to match Leaflet's L.Layer.onRemove method type.
            popup.onRemove = function (this: L.Popup, passedMap: L.Map) {
                if (popupRootRef.current) {
                    popupRootRef.current.unmount();
                    popupRootRef.current = null;
                }
                onMarkerClick(0); // Use 0 or null to signify deselecting
                originalOnRemove?.call(this, passedMap);
                return this;
            };
        }
    }, [selectedCleaner, onNavigate, onMarkerClick]);
    
    const handleRecenter = () => {
        if (mapRef.current && userLocation) {
            mapRef.current.setView(userLocation, 14, { animate: true });
        }
    };
    
    return (
        <div className="w-full h-full relative">
            <style>{`
                .leaflet-popup-content-wrapper {
                  background: transparent;
                  box-shadow: none;
                  border: none;
                }
                .leaflet-popup-content {
                  margin: 0 !important;
                  padding: 0 !important;
                }
                .leaflet-popup-tip-container {
                  display: none;
                }
            `}</style>
            <div ref={mapContainerRef} className="w-full h-full" />
            
             {/* Map Controls */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                {/* Zoom Controls */}
                <div className="bg-white/80 dark:bg-neutral/80 backdrop-blur-sm rounded-lg shadow-lg flex flex-col">
                    <button 
                        onClick={() => mapRef.current?.zoomIn()} 
                        className="p-2 text-neutral hover:text-primary dark:text-base-200 dark:hover:text-primary transition-colors"
                        aria-label="Zoom in"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                    <div className="h-px bg-slate-300 dark:bg-slate-600 w-full"></div>
                    <button 
                        onClick={() => mapRef.current?.zoomOut()} 
                        className="p-2 text-neutral hover:text-primary dark:text-base-200 dark:hover:text-primary transition-colors"
                        aria-label="Zoom out"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                        </svg>
                    </button>
                </div>

                {/* Recenter Control */}
                {userLocation && (
                     <div className="bg-white/80 dark:bg-neutral/80 backdrop-blur-sm rounded-lg shadow-lg">
                        <button 
                            onClick={handleRecenter}
                            className="p-2 text-neutral hover:text-primary dark:text-base-200 dark:hover:text-primary transition-colors"
                            aria-label="Center on my location"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Map;