import { useRef, useEffect, useState, JSX } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "@/components/ui/card";
import { MicrophoneComponent } from "@/components/MicrophoneComponent";
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
  const [transcript, setTranscript] = useState<string | null>(null)
  const json = [{'name': 'celebrate', 'icon': '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">\n  <circle cx="25" cy="25" r="25" fill="#FFD700"/>\n  <polygon points="25,10 30,20 40,20 32,28 35,38 25,32 15,38 18,28 10,20 20,20" fill="#FF4500"/>\n  <circle cx="20" cy="15" r="2" fill="#FFFFFF"/>\n  <circle cx="30" cy="15" r="2" fill="#FFFFFF"/>\n  <path d="M25,24 L25,34" stroke="#FFFFFF" stroke-width="2"/>\n</svg>', 'summary': 'Sample event generated after SVG creation.', 'timestamp': ['1:34pm','19 Feb'], 'location': {'type': 'Point', 'coordinates': [-122.4194, 37.7749]}, '_id': '67a802f3b622f5436f37f6f2'}]

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
        <div class="bg-background border border-border rounded-lg p-4 max-w-xs shadow-lg">
        <h3 class="text-xl font-semibold text-foreground mb-2">Your Location</h3>
        <p class="text-sm text-muted-foreground">Latitude: ${position.lat.toFixed(6)}</p>
        <p class="text-sm text-muted-foreground">Longitude: ${position.lng.toFixed(6)}</p>
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

  useEffect(()=>{

    if (transcript){
    console.log(location?.latitude,location?.longitude,location?.heading,transcript)

    json.forEach((m) => {
        const markerEl = document.createElement('div');
        markerEl.innerHTML = m.icon
        new mapboxgl.Marker({
        element: markerEl,
        rotationAlignment: 'map'
        }).setLngLat([m.location.coordinates[0], m.location.coordinates[1]]).setPopup(
        new mapboxgl.Popup({ offset: 25 }) // add popups
        .setHTML(`
        <div class="bg-background border border-border rounded-lg p-4 max-w-xs shadow-lg">
        <h3 class="text-xl font-semibold text-foreground mb-2">${m.name}</h3>
        <p class="text-sm text-muted-foreground">${m.timestamp[0]}</p>
        <p class="text-sm text-muted-foreground">${m.timestamp[1]}</p>
        </div>
      `)
        ).addTo(mapRef.current!);})
    }
    
    

  },[transcript])

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

        
      },
      (err) => {
        if (err.code === err.TIMEOUT) {
          setError("Location error: Timeout expired. Please check your GPS settings.");
        } else {
          setError(`Location error: ${err.message}`);
        }
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
      <MicrophoneComponent setTranscript={setTranscript}/>
    </>
  );
}

export default MapComponent;