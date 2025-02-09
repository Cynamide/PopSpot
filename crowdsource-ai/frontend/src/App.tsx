import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { MicrophoneComponent } from "./components/MicrophoneComponent";
import React from "react";

function App() {
  // const [count, setCount] = useState(0);

  return (
    <main className="flex items-center justify-center h-screen">
      <MicrophoneComponent />
    </main>
  );
}

export default App;
