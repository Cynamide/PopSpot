const API_URL = "http://127.0.0.1:5000";

export const promptData = async () => {
  const sampleData = {
    latitude: 40.7128,
    longitude: -74.006,
    heading: 90,
    query:
      "Hello, I saw a fire just a minute back behind me on the same street from my current location. I am walking on the street",
  };

  try {
    const response = await fetch(`${API_URL}/prompt-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sampleData),
    });

    return response.json(); // Convert backend response to JSON
  } catch (error) {
    console.error("Error testing API:", error);
    return { error: "Failed to send data" };
  }
};
