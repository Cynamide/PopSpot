import { useState } from "react";
import { promptData } from "./api";

function App() {
  const [response, setResponse] = useState("");

  const handlePrompt = async () => {
    const result = await promptData();
    setResponse(JSON.stringify(result, null, 2));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Test Flask Route</h1>
      <button
        onClick={handlePrompt}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send Sample JSON
      </button>
      {response && <pre className="mt-4 p-2 rounded">{response}</pre>}
    </div>
  );
}

export default App;
