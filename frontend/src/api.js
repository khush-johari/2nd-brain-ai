import axios from "axios";

// 1. Dynamic Base URL
// VITE_API_URL should be set in Vercel/Netlify Environment Variables.
// If it's missing, it falls back to localhost for development.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

console.log(`Connecting to Brain at: ${API_BASE_URL}`);

const api = axios.create({
  baseURL: API_BASE_URL,
});

// --- API FUNCTIONS ---

export const fetchNotes = async () => {
  try {
    const response = await api.get("/notes");
    return response.data;
  } catch (error) {
    console.error("Error fetching notes:", error);
    return [];
  }
};

export const createNote = async (note) => {
  try {
    const response = await api.post("/notes", note);
    return response.data;
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
};

export const searchNotes = async (query) => {
  try {
    const response = await api.get(`/search`, { params: { query } });
    return response.data;
  } catch (error) {
    console.error("Error searching notes:", error);
    return [];
  }
};

export const askAI = async (query) => {
  try {
    const response = await api.post("/ask", { query });
    return response.data; // Returns object { answer: "...", sources: [...] }
  } catch (error) {
    console.error("Error asking AI:", error);
    return { 
        answer: "I'm sorry, I couldn't reach the brain. (Check Server Connection)", 
        sources: [] 
    };
  }
};

export const uploadPDF = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    // Using fetch to avoid axios multipart header issues
    const response = await fetch(`${API_BASE_URL}/upload-pdf`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Upload failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Upload Error:", error);
    throw error;
  }
};