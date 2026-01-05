import json
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import Note, NoteCreate, ChatRequest
from services.ai_service import summarize_text, chat_with_ai
from utils.vector_db import add_note_to_vector_db, search_similar_notes
from services.ai_service import get_rag_response

app = FastAPI()

# 1. CORS Setup (Critical for React connection later)
# This allows React app (localhost:5173) to talk to this Python app (localhost:8000)
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# File path for our temporary database
DB_FILE = "db.json"

# Helper function to read/write JSON
def load_notes():
    if not os.path.exists(DB_FILE):
        return []
    with open(DB_FILE, "r") as f:
        return json.load(f)

def save_notes(notes):
    with open(DB_FILE, "w") as f:
        json.dump(notes, f, indent=4)#converts it into text format with indents for human reading

# --- ROUTES ---

@app.get("/")
def read_root():
    return {"message": "Second Brain API is running!"}

# 1. GET all notes
@app.get("/notes", response_model=list[Note])
def get_notes():
    return load_notes()

# 2. POST (Create) a new note
@app.post("/notes", response_model=Note)
def create_note (note: NoteCreate):
    notes = load_notes()

    new_id = 1
    if notes:
        new_id = max(n["id"] for n in notes) + 1

    new_note_entry = note.dict()
    new_note_entry["id"] = new_id

    notes.append(new_note_entry)
    save_notes(notes)

    # --- NEW STEP: Add to AI Memory ---
    # We send the text to ChromaDB so the AI can read it later
    add_note_to_vector_db(new_id, note.content, note.title)

    return new_note_entry

# 3. Chat with AI Endpoint
@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    query = request.query
    
    # 1. Search the Vector DB for the 3 most relevant notes
    results = search_similar_notes(query)
    
    # 2. Combine the content of those notes into one big string
    context_text = "\n\n".join([doc.page_content for doc in results])
    
    # 3. If no notes found, handle it gracefully
    if not context_text:
        return {"response": "I couldn't find any relevant notes in your brain to answer that."}
    
    # 4. Send the Query + Context to the AI
    ai_response = get_rag_response(query, context_text)
    
    return {"response": ai_response}

# 4. Summarize Note Endpoint (New!)
@app.post("/summarize")
def summarize_endpoint(request: ChatRequest):
    # We reuse the ChatRequest model since it just needs a string
    try:
        summary = summarize_text(request.query)
        return {"response": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search")
def search_notes(query: str):
    # This asks ChromaDB: "What notes are related to this query?"
    results = search_similar_notes(query)

    # Format the results to look nice
    response = []
    for doc in results:
        response.append({
            "content": doc.page_content,
            "title": doc.metadata["title"]
        })
    return response