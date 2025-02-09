import { useRef, useEffect, useState, JSX } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface Location {
  latitude: number;
  longitude: number;
  heading: number | null;
}

mapboxgl.accessToken = 'pk.eyJ1IjoiYWFnYXJ3MzgzOCIsImEiOiJjbTZ3b2VsNXUwZXp0MmtwczF0a2N1dXRzIn0.cD2aom0-V-ZT--XSDj7TVw'; // Replace with your Mapbox token

function MapComponent(): JSX.Element {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate bearing between two points
  const calculateBearing = (
    startLat: number,
    startLng: number,
    destLat: number,
    destLng: number
  ): number => {
    const startLatRad = (startLat * Math.PI) / 180;
    const startLngRad = (startLng * Math.PI) / 180;
    const destLatRad = (destLat * Math.PI) / 180;
    const destLngRad = (destLng * Math.PI) / 180;

    const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
    const x =
      Math.cos(startLatRad) * Math.sin(destLatRad) -
      Math.sin(startLatRad) *
        Math.cos(destLatRad) *
        Math.cos(destLngRad - startLngRad);
    const bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
  };

  // Update marker position and rotation
  const updateMarker = (
    position: { lng: number; lat: number },
    heading: number | null
  ) => {
    if (!markerRef.current) {

        // Create custom marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'custom-marker';
        markerEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
        <defs>
            <filter id="pulse">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 13 -9" result="pulseColor"/>
            <feBlend in="SourceGraphic" in2="pulseColor" mode="normal" />
            </filter>
        </defs>
        <!-- Outer pulsating circle -->
        <circle cx="24" cy="24" r="16" fill="#4285F4" opacity="0.3" filter="url(#pulse)"/>
        <!-- Main blue circle -->
        <circle cx="24" cy="24" r="8" fill="#4285F4"/>
        <!-- White center dot -->
        <circle cx="24" cy="24" r="4" fill="#4285F4"/>
        </svg>
        `;

        // Create marker if it doesn't exist
        markerRef.current = new mapboxgl.Marker({
        element: markerEl,
        rotationAlignment: 'map'
        }).setLngLat([position.lng, position.lat]).setPopup(
        new mapboxgl.Popup({ offset: 25 }) // add popups
        .setHTML(`
        <div class="bg-white rounded-lg  p-4 max-w-xs">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">Your Location</h3>
          <p class="text-gray-600 text-sm">Latitude: ${position.lat.toFixed(6)}</p>
          <p class="text-gray-600 text-sm">Longitude: ${position.lng.toFixed(6)}</p>
        </div>
      `)
        ).addTo(mapRef.current!);
            
    } else {
      // Update existing marker's position
      markerRef.current.setLngLat([position.lng, position.lat]);
    }

    if (heading !== null) {
      const el = markerRef.current.getElement();
      el.style.transform += ` rotate(${heading}deg)`;
    }
  };

  // Initialize map and location tracking
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map instance
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12', // Default style
      zoom: 15,
      center: [0, 0] // Initial center (will be updated with user location)
    });

    let prevPosition: GeolocationPosition | null = null;

    // Watch position
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        let heading = null;

        // Calculate heading if we have a previous position
        if (prevPosition) {
          heading = calculateBearing(
            prevPosition.coords.latitude,
            prevPosition.coords.longitude,
            latitude,
            longitude
          );
        }

        setLocation({ latitude, longitude, heading });
        prevPosition = position;

        // Update map and marker
        if (mapRef.current) {
          mapRef.current.setCenter([longitude, latitude]);
          updateMarker({ lng: longitude, lat: latitude }, heading);
        }

        setIsLoading(false);
      },
      (err) => {
        if (err.code === err.TIMEOUT) {
          setError("Location error: Timeout expired. Please check your GPS settings.");
        } else {
          setError(`Location error: ${err.message}`);
        }
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000, // Timeout after 30 seconds
        maximumAge: 0
      }
    );

    // Cleanup on component unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div 
        ref={mapContainerRef} 
        className="w-full h-full rounded-lg overflow-hidden"
      />
      
    </>
  );
}

export default MapComponent;