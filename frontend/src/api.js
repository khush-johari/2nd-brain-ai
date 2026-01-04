import axios from "axios";

// 1. Pointing to running Python server
const API_URL = "https://twond-brain-ai.onrender.com";

// 2. Function to Get All Notes
//async tells server to wait for server as it takes time and not freeze
export const fetchNotes = async () => {
  const response = await axios.get(`${API_URL}/notes`);
  return response.data;
};

// 3. Function to Add a Note
// await pauses only this function until the server replies.
export const createNote = async (note) => {
  const response = await axios.post(`${API_URL}/notes`, note);
  return response.data;
};

// 4. Function to Search Notes (The AI Part)
export const searchNotes = async (query) => {
  const response = await axios.get(`${API_URL}/search`, {
    params: { query: query }
  });
  return response.data;
};

// 5. Function to Chat with AI (RAG)
export const askAI = async (query) => {
  const response = await axios.post(`${API_URL}/chat`, { query: query });
  return response.data.response;
};