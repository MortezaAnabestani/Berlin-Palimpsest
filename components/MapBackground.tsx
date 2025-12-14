import React, { useEffect, useRef, useState } from 'react';

// Declare Leaflet on window
declare global {
  interface Window {
    L: any;
  }
}

interface Props {
  isFocused: boolean;
  isIntro: boolean;
  coordinates?: { lat: number; lng: number };
  onHotspotClick: () => void;
}

const BERLIN_CENTER = { lat: 52.5200, lng: 13.4050 };
const BERLIN_BOUNDS = [
  [52.3, 13.0], // South West
  [52.7, 13.8]  // North East
];

export const MapBackground: React.FC<Props> = ({ isFocused, isIntro, coordinates, onHotspotClick }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (mapInstanceRef.current) return;

    const checkLeaflet = setInterval(() => {
      if (window.L && mapContainerRef.current) {
        clearInterval(checkLeaflet);
        
        try {
          // Check if map is already initialized on this element (React strict mode edge case)
          if (mapContainerRef.current._leaflet_id) return;

          const map = window.L.map(mapContainerRef.current, {
            center: [BERLIN_CENTER.lat, BERLIN_CENTER.lng],
            zoom: 13,
            minZoom: 11,
            zoomControl: false,
            attributionControl: true,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            dragging: true, 
            keyboard: false,
            maxBounds: BERLIN_BOUNDS,
            maxBoundsViscosity: 1.0,
          });

          // Standard OpenStreetMap Tiles (High availability)
          // We use CSS class 'map-tiles-invert' in index.html to turn this Dark & Brutalist
          window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
            className: 'map-tiles' // Custom class for CSS targeting if needed
          }).addTo(map);

          mapInstanceRef.current = map;
          
          // Force layout recalculation
          setTimeout(() => {
             map.invalidateSize();
          }, 500);
        } catch (e) {
          console.error("Leaflet init error:", e);
        }
      }
    }, 200);

    return () => clearInterval(checkLeaflet);
  }, []);

  // Handle Coordinates and Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;

    // Clean up old markers
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    const hasValidCoords = coordinates && 
                           typeof coordinates.lat === 'number' && 
                           !isNaN(coordinates.lat);

    if (hasValidCoords) {
      const customIcon = window.L.divIcon({
        className: 'bg-transparent',
        html: `
          <div class="relative w-20 h-20 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
             <!-- Radar Ping -->
             <div class="absolute inset-0 border-2 border-neon-magenta rounded-full opacity-0 animate-[ping_2s_ease-out_infinite]"></div>
             <div class="absolute inset-2 border border-neon-magenta rounded-full opacity-0 animate-[ping_2s_ease-out_infinite_0.5s]"></div>
             
             <!-- Center Point -->
             <div class="w-4 h-4 bg-neon-magenta rotate-45 group-hover:rotate-90 transition-transform duration-300 shadow-[0_0_10px_#ff00ff]"></div>
             
             <!-- Label -->
             <div class="absolute bottom-full mb-2 bg-black border border-neon-magenta text-neon-magenta text-[9px] px-2 py-1 font-mono hidden group-hover:block whitespace-nowrap">
                DATA_FOUND
             </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = window.L.marker([coordinates!.lat, coordinates!.lng], { icon: customIcon }).addTo(map);
      
      marker.on('click', (e: any) => {
        window.event?.stopPropagation();
        onHotspotClick();
      });
      
      markerRef.current = marker;

      map.flyTo([coordinates!.lat, coordinates!.lng], 16, {
        duration: 2.5,
        easeLinearity: 0.2
      });
    } else {
      map.flyTo([BERLIN_CENTER.lat, BERLIN_CENTER.lng], 13, { duration: 2 });
    }
  }, [coordinates, onHotspotClick]);

  // Handle Zoom/Focus
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const hasValidCoords = coordinates && 
                           typeof coordinates.lat === 'number' && 
                           !isNaN(coordinates.lat);

    if (hasValidCoords) {
      const targetZoom = isFocused ? 17 : 15;
      map.setZoom(targetZoom); // Direct setZoom for stability
    }
  }, [isFocused, coordinates]);

  // CSS Class handles the visual inversion (White OSM -> Dark Brutalist)
  return (
    <div 
       ref={mapContainerRef} 
       className={`
         absolute inset-0 w-full h-full z-0 map-tiles-invert
         transition-opacity duration-1000
         ${isIntro ? 'opacity-100 blur-[2px]' : 'opacity-100 blur-0'}
       `}
       style={{ background: '#050505' }}
    />
  );
};