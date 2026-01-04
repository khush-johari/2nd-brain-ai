import { useState, useEffect } from "react";
import { fetchNotes, createNote, searchNotes, askAI } from "./api";
import "./index.css";

function App() {
  // --- STATE (The Memory of the Frontend) ---
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [answer, setAnswer] = useState("");

  // --- EFFECTS (What happens on load) ---
  useEffect(() => {
    // Load existing notes when the page opens, run this function once, immediately when the page first loads.
    loadNotes();
  }, []);

  const loadNotes = async () => {
    //calls fetchNotes() (the Axios bridge), waits for Python to reply, and then dumps the result into our notes state variable. React detects this change and updates the screen.
    const data = await fetchNotes();
    setNotes(data);
  };

  // --- HANDLERS (Actions) ---
  const handleSave = async () => {
    if (!title || !content) return alert("Please fill in both fields!");

    // 1. Send data to Python
    await createNote({ title, content, tags: "general" });

    // 2. Refresh the list and clear form
    loadNotes();
    setTitle("");
    setContent("");
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      loadNotes();
      setAnswer(""); // Clear answer if empty
      return;
    }

    // 1. Get the list of relevant notes (Visual proof)
    const notesResult = await searchNotes(searchQuery);
    setNotes(notesResult);

    // 2. Get the AI's "Thought" (The Answer)
    setAnswer("Thinking..."); // Show loading state
    const aiResult = await askAI(searchQuery);
    setAnswer(aiResult);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-blue-400">
          🧠 Second Brain AI
        </h1>

        {/* --- SEARCH BAR --- */}
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="Ask your brain (e.g., 'What do I know about React?')"
            className="flex-1 p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-700 font-bold"
          >
            Ask AI
          </button>
        </div>
        {/* --- AI ANSWER SECTION --- */}
        {answer && (
          <div className="bg-blue-900/50 p-6 rounded-lg mb-8 border border-blue-500 animate-pulse-once">
            <h2 className="text-xl font-bold text-blue-300 mb-2">
              🤖 AI Answer:
            </h2>
            <p className="text-gray-100 leading-relaxed">{answer}</p>
          </div>
        )}

        {/* --- ADD NOTE FORM --- */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Add New Memory</h2>
          <div className="flex flex-col gap-3">
            <input
              className="p-3 rounded bg-gray-700 border border-gray-600"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="p-3 rounded bg-gray-700 border border-gray-600 h-24"
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button
              onClick={handleSave}
              className="bg-green-600 py-2 rounded hover:bg-green-700 font-bold"
            >
              Save Note
            </button>
          </div>
        </div>

        {/* --- NOTES GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note, index) => (
            <div
              key={index}
              className="bg-gray-800 p-5 rounded-lg border border-gray-700 hover:border-blue-500 transition"
            >
              <h3 className="text-xl font-bold text-blue-300 mb-2">
                {note.title}
              </h3>
              <p className="text-gray-300">{note.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
