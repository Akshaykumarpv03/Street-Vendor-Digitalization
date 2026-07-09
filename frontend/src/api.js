// frontend/src/api.js
const API_BASE_URL = "http://localhost:5000/api";

export const chatWithAgent = async (message) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    return data; // Expected shape: { message: "..." }
  } catch (error) {
    console.error("API Error in chatWithAgent:", error);
    throw error;
  }
};
