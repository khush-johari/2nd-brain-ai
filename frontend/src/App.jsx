import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { fetchNotes, createNote, searchNotes, askAI } from "./api";
import "./index.css";
import PDFUploader from "./components/PDFUploader";

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const data = await fetchNotes();
    setNotes(data);
  };

  const handleSave = async () => {
    if (!title || !content) return alert("Please fill in both fields!");
    await createNote({ title, content, tags: "general" });
    loadNotes();
    setTitle("");
    setContent("");
  };

  // --- THIS IS THE FIXED FUNCTION ---
  const handleSearch = async () => {
    if (!searchQuery) {
      loadNotes();
      setAnswer("");
      return;
    }
    setLoadingAnswer(true);

    try {
      // 1. Fetch relevant context (Visual feedback)
      const notesResult = await searchNotes(searchQuery);
      setNotes(notesResult);

      // 2. Fetch AI Answer
      const aiResult = await askAI(searchQuery);

      // ✅ FIX: Extract just the string '.answer' from the object
      setAnswer(aiResult.answer);
    } catch (err) {
      console.error(err);
      setAnswer("Failed to get response from AI.");
    } finally {
      setLoadingAnswer(false);
    }
  };

  const handleUploadSuccess = () => {
    loadNotes();
  };

  return (
    <div className="min-h-screen p-6 md:p-12 relative overflow-hidden">
      {/* --- BACKGROUND BLOBS  --- */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-10">
        {/* --- HEADER --- */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.3)]">
              Second Brain AI
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto">
            Your personal reasoning engine. Upload documents, ask questions, and
            retrieve memories instantly.
          </p>
        </div>

        {/* --- MAIN SEARCH BAR (Hero Section) --- */}
        <div className="relative max-w-3xl mx-auto group z-20">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative flex gap-2 bg-slate-900/80 backdrop-blur-xl p-2 rounded-xl border border-white/10 shadow-2xl">
            <input
              type="text"
              placeholder="Ask your brain anything..."
              className="flex-1 bg-transparent p-4 text-lg text-white placeholder-gray-500 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loadingAnswer}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingAnswer ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Thinking
                </span>
              ) : (
                "Ask AI"
              )}
            </button>
          </div>
        </div>

        {/* --- AI ANSWER CARD (Appears on Search) --- */}
        {(answer || loadingAnswer) && (
          <div className="max-w-3xl mx-auto bg-slate-800/40 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl animate-pulse-glow">
            <div className="flex items-start gap-5">
              <div className="p-3 bg-blue-500/20 rounded-lg text-2xl border border-blue-500/30">
                🤖
              </div>
              <div className="space-y-3 w-full">
                <h2 className="text-xl font-bold text-blue-200">AI Analysis</h2>
                {loadingAnswer ? (
                  <div className="space-y-3 pt-2">
                    <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-white/5 rounded w-1/2 animate-pulse"></div>
                    <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse"></div>
                  </div>
                ) : (
                  <div className="text-gray-200 text-lg font-light leading-relaxed">
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => (
                          <h2
                            className="text-2xl font-bold text-blue-300 mt-6 mb-3"
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h3
                            className="text-xl font-bold text-blue-200 mt-5 mb-2"
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h4
                            className="text-lg font-bold text-white mt-4 mb-2"
                            {...props}
                          />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong
                            className="font-bold text-blue-400"
                            {...props}
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            className="list-disc list-outside ml-5 space-y-2 mb-4 text-gray-300"
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="pl-1" {...props} />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="mb-4" {...props} />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            className="border-l-4 border-blue-500/50 pl-4 italic text-gray-400 my-4"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {answer}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <hr className="border-white/5" />

        {/* --- TWO COLUMN LAYOUT: Tools --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* LEFT: Upload Section */}
          <div className="space-y-4 h-full flex flex-col">
            <h3 className="text-xl font-semibold text-gray-300 flex items-center gap-2">
              <span className="text-purple-400">⚡</span> Add Source Material
            </h3>
            {/* Glass Uploader Component */}
            <div className="flex-1">
              <PDFUploader onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>

          {/* RIGHT: Quick Note Section */}
          <div className="space-y-4 h-full flex flex-col">
            <h3 className="text-xl font-semibold text-gray-300 flex items-center gap-2">
              <span className="text-green-400">✍️</span> Quick Memory
            </h3>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl space-y-4 hover:border-white/20 transition-colors flex-1 flex flex-col">
              <input
                className="w-full p-4 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-green-500/50 focus:outline-none focus:bg-black/40 transition-all"
                placeholder="Memory Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="w-full p-4 bg-black/20 border border-white/10 rounded-xl flex-1 text-white placeholder-gray-500 focus:border-green-500/50 focus:outline-none focus:bg-black/40 transition-all resize-none"
                placeholder="What do you want to remember?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <button
                onClick={handleSave}
                className="w-full bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30 py-3 rounded-xl font-bold transition-all"
              >
                Save to Brain
              </button>
            </div>
          </div>
        </div>

        {/* --- CONTEXT GRID --- */}
        <div className="pt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-200">
              Brain Context{" "}
              <span className="text-gray-500 text-base font-normal">
                ({notes.length} items)
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.map((note, index) => (
              <div
                key={index}
                className="group relative bg-slate-800/30 backdrop-blur-md border border-white/5 hover:border-blue-500/30 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10"
              >
                {/* Type Badge */}
                <div className="absolute top-4 right-4 opacity-50 group-hover:opacity-100 transition-opacity">
                  {note.metadata?.source ? "📄" : "📝"}
                </div>

                <h3 className="font-bold text-blue-300 mb-3 pr-6 truncate text-lg">
                  {note.title || "Untitled Memory"}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed line-clamp-4 font-light">
                  {note.content}
                </p>

                {/* Footer Metadata */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {note.metadata?.source ? "Source: PDF" : "Manual Entry"}
                  </span>
                  {note.metadata?.source && (
                    <span className="text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                      {note.metadata.source}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
