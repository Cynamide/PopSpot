import { useRef, useEffect, JSX, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { promptData } from "./api";

import 'mapbox-gl/dist/mapbox-gl.css';

import './App.css'
import MapComponent from './components/mapComponent';

// Add this to fix TypeScript error with mapboxgl
mapboxgl.accessToken = 'pk.eyJ1IjoiYWFnYXJ3MzgzOCIsImEiOiJjbTZ3b2VsNXUwZXp0MmtwczF0a2N1dXRzIn0.cD2aom0-V-ZT--XSDj7TVw';

function App(): JSX.Element {
  const [response, setResponse] = useState("");

  const handlePrompt = async () => {
    const result = await promptData();
    setResponse(JSON.stringify(result, null, 2));
  };

  return (
    <MapComponent />
  );
}

export default App;
