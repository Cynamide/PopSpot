import { useRef, useEffect, useState, JSX } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MicrophoneComponent } from "@/components/MicrophoneComponent";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {markers} from "@/components/dummy"


event
interface Location {
  latitude: number;
  longitude: number;
  heading: number | null;
}

interface QueryData {
    "latitude": number;
    "longitude": number;
    "heading": number;
    "query": string;
}
interface QueryResponse {
    message: string;
    status: number;
}

interface MarkerData {
  _id: string;
  name: string;
  icon: string;
  location: {
    type: string;
    coordinates: number[];
  };
  reported_by_users: number;
  timestamp: string[];
}

interface MapMarker extends mapboxgl.Marker {
  _id?: string;
}

mapboxgl.accessToken = 'pk.eyJ1IjoiYWFnYXJ3MzgzOCIsImEiOiJjbTZ3b2VsNXUwZXp0MmtwczF0a2N1dXRzIn0.cD2aom0-V-ZT--XSDj7TVw'; // Replace with your Mapbox token

function MapComponent(): JSX.Element {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const markersRef = useRef<Map<string, MapMarker>>(new Map());

  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null)

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

    // Fetch events from the API
    const fetchEvents = async (): Promise<MarkerData[]> => {
    try {
        const response = await fetch('http://127.0.0.1:5000/get-events');
        console.log(response)
        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
    };

    const postQuery = async (transcript: string): Promise<QueryResponse | undefined> => {
    try {
        const query = {
            "latitude": location?.latitude,
            "longitude": location?.longitude,
            "heading": location?.heading,
            "query": transcript,

        }
        const response = await fetch('http://127.0.0.1:5000/prompt-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(query)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error sending prompt:', error);
        return undefined;
    }
};


    const createPopup = (markerData: MarkerData) => {
    return new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
        <div class="bg-background border border-border rounded-lg p-4 max-w-xs shadow-lg">
            <h3 class="text-xl font-semibold text-foreground mb-2">${markerData.name}</h3>
            <p class="text-sm text-muted-foreground">${markerData.timestamp[0]}</p>
            <p class="text-sm text-muted-foreground">${markerData.timestamp[1]}</p>
            <p class="text-sm text-muted-foreground mt-2">Reported by ${markerData.reported_by_users} user${markerData.reported_by_users !== 1 ? 's' : ''}</p>
        </div>
        `);
    };


    const updateMarkers = async () => {
    if (!mapRef.current) return;

    const newMarkerData = await fetchEvents();
    const currentMarkerIds = new Set(markersRef.current.keys());
    const newMarkerIds = new Set(newMarkerData.map(m => m._id));

    // Remove markers that don't exist in new data
    currentMarkerIds.forEach(id => {
        if (!newMarkerIds.has(id)) {
        const marker = markersRef.current.get(id);
        if (marker) {
            marker.remove();
            markersRef.current.delete(id);
        }
        }
    });

    // Add or update markers
    newMarkerData.forEach(markerData => {
        const existingMarker = markersRef.current.get(markerData._id);
        
        if (existingMarker) {
        // Update existing marker
        existingMarker
            .setLngLat([markerData.location.coordinates[0],markerData.location.coordinates[1]])
            .setPopup(createPopup(markerData));
        
        const el = existingMarker.getElement();
        el.innerHTML = markerData.icon;
        } else {
        // Create new marker
        const markerEl = document.createElement('div');
        markerEl.innerHTML = markerData.icon;
        
        const newMarker = new mapboxgl.Marker({
            element: markerEl,
            rotationAlignment: 'map'
        })
            .setLngLat([markerData.location.coordinates[0],markerData.location.coordinates[1]])
            .setPopup(createPopup(markerData))
            .addTo(mapRef.current !);

        (newMarker as MapMarker)._id = markerData._id;
        markersRef.current.set(markerData._id, newMarker as MapMarker);
        }
    });
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
        <div class="">
        <h3 class="text-lg font-semibold text-foreground mb-2">Your Location</h3>
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

    if (transcript) {
    postQuery(transcript)
    updateMarkers()
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

    // After map loads, fetch and add initial markers
    mapRef.current.on('load', async () => {
        await updateMarkers();
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