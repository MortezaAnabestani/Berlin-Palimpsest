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
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (mapInstanceRef.current) return;

    // Simple check loop for Leaflet
    const checkLeaflet = setInterval(() => {
      if (window.L && mapContainerRef.current) {
        clearInterval(checkLeaflet);
        
        try {
          const map = window.L.map(mapContainerRef.current, {
            center: [BERLIN_CENTER.lat, BERLIN_CENTER.lng],
            zoom: 13,
            minZoom: 11,
            zoomControl: false,
            attributionControl: true, // Enabled attribution link
            scrollWheelZoom: false,
            doubleClickZoom: false,
            dragging: true, 
            keyboard: false,
            maxBounds: BERLIN_BOUNDS, // Strictly Berlin
            maxBoundsViscosity: 1.0,
          });

          // Using Carto Dark Matter
          window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20
          }).addTo(map);

          mapInstanceRef.current = map;
          setIsMapReady(true);
          
          // Force resize to prevent gray tiles
          setTimeout(() => {
             map.invalidateSize();
          }, 200);
        } catch (e) {
          console.error("Leaflet init error:", e);
        }
      }
    }, 100);

    return () => clearInterval(checkLeaflet);
  }, []);

  // Handle Coordinates and Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;

    if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    const hasValidCoords = coordinates && 
                           typeof coordinates.lat === 'number' && 
                           !isNaN(coordinates.lat);

    if (hasValidCoords) {
      const customIcon = window.L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="relative flex items-center justify-center w-24 h-24 transform -translate-x-1/2 -translate-y-1/2 group" style="pointer-events: auto; cursor: pointer;">
             <!-- Ripple Effect -->
             <div class="absolute inset-0 bg-neon-magenta/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
             <div class="absolute inset-2 bg-neon-magenta/10 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] delay-75"></div>
             
             <!-- Core Marker -->
             <div class="absolute w-4 h-4 bg-neon-magenta rounded-full shadow-[0_0_15px_rgba(255,0,255,1)] z-10 transition-transform group-hover:scale-125 duration-300"></div>
             <div class="absolute w-8 h-8 border border-neon-magenta rounded-full z-10 opacity-70"></div>
             
             <!-- Label -->
             <div class="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-100 bg-black border border-neon-magenta text-neon-magenta text-[10px] font-bold font-mono px-3 py-1 whitespace-nowrap z-50 shadow-[4px_4px_0px_0px_rgba(255,0,255,0.5)]">
                TARGET IDENTIFIED
             </div>
          </div>
        `,
        iconSize: [60, 60],
        iconAnchor: [30, 30]
      });

      const marker = window.L.marker([coordinates!.lat, coordinates!.lng], { icon: customIcon }).addTo(map);
      
      // Bind click directly to marker
      marker.on('click', (e: any) => {
        window.event?.stopPropagation();
        onHotspotClick();
      });
      
      markerRef.current = marker;

      map.flyTo([coordinates!.lat, coordinates!.lng], 16, {
        duration: 2.0,
        easeLinearity: 0.25
      });
    } else {
      map.flyTo([BERLIN_CENTER.lat, BERLIN_CENTER.lng], 13, { duration: 2 });
    }
  }, [coordinates, onHotspotClick, isMapReady]);

  // Handle Zoom/Focus
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapReady) return;

    const hasValidCoords = coordinates && 
                           typeof coordinates.lat === 'number' && 
                           !isNaN(coordinates.lat);

    if (hasValidCoords) {
      const targetZoom = isFocused ? 17 : 15;
      map.flyTo([coordinates!.lat, coordinates!.lng], targetZoom, {
          duration: 1.5
      });
    }
  }, [isFocused, coordinates, isMapReady]);

  return (
    <>
      <div 
         ref={mapContainerRef} 
         className={`
           absolute inset-0 w-full h-full z-0
           transition-all duration-1000
           ${isIntro ? 'opacity-50 blur-[1px]' : 'opacity-100 blur-0'}
         `}
         style={{ 
             // Increased brightness to make the dark map visible against black bg
             filter: 'grayscale(100%) contrast(1.2) brightness(1.5)',
             background: '#050505' 
         }}
      />
      
      {/* Texture Overlay */}
      <div className="absolute inset-0 z-1 pointer-events-none opacity-5 bg-repeat bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
    </>
  );
};