import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  isFocused: boolean;
  isIntro: boolean;
  coordinates?: { lat: number; lng: number };
  onHotspotClick: () => void;
}

const BERLIN_CENTER = { lat: 52.5200, lng: 13.4050 };
// Bounds to restrict the view to Berlin area
const BERLIN_BOUNDS = [
  [52.3, 13.0], // South West
  [52.7, 13.8]  // North East
];

export const MapBackground: React.FC<Props> = ({ isFocused, isIntro, coordinates, onHotspotClick }) => {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Initialize Map
  useEffect(() => {
    // Cleanup existing map if strict mode triggered double mount
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Ensure DOM element exists
    const container = document.getElementById('map');
    if (!container) return;

    // --- LEAFLET INITIALIZATION START ---
    const map = L.map('map', {
      center: [BERLIN_CENTER.lat, BERLIN_CENTER.lng],
      zoom: 13,
      minZoom: 12, // Restrict zoom out
      zoomControl: false,
      attributionControl: true,
      maxBounds: BERLIN_BOUNDS, // Restrict panning
      maxBoundsViscosity: 1.0,
    });

    // Standard OSM Layer as requested
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      className: 'invert-tiles' // CSS class to invert colors
    }).addTo(map);

    mapRef.current = map;
    // --- LEAFLET INITIALIZATION END ---

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Handle Markers & Coordinates
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old marker
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    // Validate coordinates
    const hasValidCoords = coordinates && 
                           typeof coordinates.lat === 'number' && 
                           !isNaN(coordinates.lat);

    if (hasValidCoords) {
      // Create Custom Brutalist Marker
      const customIcon = L.divIcon({
        className: 'bg-transparent',
        html: `
          <div class="relative w-24 h-24 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group pointer-events-auto">
             <!-- Radar Ping Animation -->
             <div class="absolute inset-0 border-2 border-neon-magenta rounded-full animate-[ping_2s_ease-out_infinite] opacity-70"></div>
             <div class="absolute inset-4 border border-neon-magenta rounded-full animate-[ping_2s_ease-out_infinite_0.5s] opacity-50"></div>

             <!-- Core Point -->
             <div class="absolute w-4 h-4 bg-neon-magenta transform rotate-45 group-hover:rotate-0 transition-all duration-300 shadow-[0_0_20px_#ff00ff] z-20"></div>

             <!-- Label -->
             <div class="absolute -top-8 bg-black text-neon-magenta border border-neon-magenta text-[10px] px-2 py-1 font-mono whitespace-nowrap z-50 shadow-lg">
               DETECTED_SIGNAL
             </div>
          </div>
        `,
        iconSize: [60, 60],
        iconAnchor: [30, 30]
      });

      const marker = L.marker([coordinates!.lat, coordinates!.lng], { icon: customIcon }).addTo(map);

      // Handle Click
      marker.on('click', (e: any) => {
        L.DomEvent.stopPropagation(e);
        onHotspotClick();
      });

      markerRef.current = marker;

      // Fly to location
      map.flyTo([coordinates!.lat, coordinates!.lng], 16, { 
        duration: 2.5,
        easeLinearity: 0.25
      });
    } else {
      // Reset view if no coordinates
      map.flyTo([BERLIN_CENTER.lat, BERLIN_CENTER.lng], 13, { duration: 1.5 });
    }
  }, [coordinates, onHotspotClick]);

  // Handle Focus State (Zoom)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    
    if (isFocused) {
        map.setZoom(17, { animate: true });
    }
  }, [isFocused]);

  return (
    <div 
       id="map" 
       className={`absolute inset-0 w-full h-full z-0 transition-all duration-1000 ease-in-out
         ${isIntro ? 'opacity-40 blur-[2px]' : 'opacity-100 blur-0'}
       `}
       style={{ background: '#050505' }} // Dark background behind map
    />
  );
};