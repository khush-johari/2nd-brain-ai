import json
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import Note, NoteCreate

app = FastAPI()

# 1. CORS Setup (Critical for React connection later)
# This allows your React app (localhost:5173) to talk to this Python app (localhost:8000)
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
        json.dump(notes, f, indent=4)

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
def create_note(note: NoteCreate):
    notes = load_notes()
    
    # Generate a simple ID (max ID + 1)
    new_id = 1
    if notes:
        new_id = max(n["id"] for n in notes) + 1
        
    new_note_entry = note.dict()
    new_note_entry["id"] = new_id
    
    notes.append(new_note_entry)
    save_notes(notes)
    
    return new_note_entry

# 3. Dummy Chat Endpoint (Preparation for AI)
@app.post("/chat")
def chat_with_ai(query: str):
    # For now, just echo back. We will add real AI here on Day 3/6.
    return {"response": f"AI received your query: '{query}'. (Brain not connected yet!)"}