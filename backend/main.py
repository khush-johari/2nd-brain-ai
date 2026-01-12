import json
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from utils.file_parser import extract_text_from_pdf, chunk_text
from utils.vector_db import add_chunks_to_vector_db, search_similar_notes, add_note_to_vector_db
from fastapi.middleware.cors import CORSMiddleware
from models import Note, NoteCreate, ChatRequest
from services.ai_service import summarize_text, chat_with_ai, get_rag_response
from fastapi.responses import JSONResponse

app = FastAPI()

# --- PRODUCTION CORS SETUP ---

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

origins = [
    "http://localhost:5173",    # Local React
    "http://127.0.0.1:5173",    # Local React Alternative
    "https://2nd-brain-ai.vercel.app", # Live Vercel URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- DATABASE SETUP ---
DB_FILE = "db.json"

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

@app.get("/notes", response_model=list[Note])
def get_notes():
    return load_notes()

@app.post("/notes", response_model=Note)
def create_note(note: NoteCreate):
    notes = load_notes()
    new_id = 1
    if notes:
        new_id = max(n["id"] for n in notes) + 1
    new_note_entry = note.dict()
    new_note_entry["id"] = new_id
    notes.append(new_note_entry)
    save_notes(notes)
    
    # Add to Vector DB for searching
    add_note_to_vector_db(new_id, note.content, note.title)
    return new_note_entry

# Chat Endpoint
@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    query = request.query
    results = search_similar_notes(query)
    context_text = "\n\n".join([doc.page_content for doc in results])
    if not context_text:
        return {"response": "I couldn't find any relevant notes."}
    ai_response = get_rag_response(query, context_text)
    return {"response": ai_response}

# Summarize Endpoint
@app.post("/summarize")
def summarize_endpoint(request: ChatRequest):
    try:
        summary = summarize_text(request.query)
        return {"response": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Search Endpoint (Used for context cards)
@app.get("/search")
def search_notes(query: str):
    results = search_similar_notes(query, k=5) 
    unique_results = {}
    for doc in results:
        source = doc.metadata.get("source", doc.metadata.get("title", "Unknown"))
        if source not in unique_results:
            unique_results[source] = {
                "id": doc.metadata.get("id", "unknown"),
                "title": doc.metadata.get("title", source),
                "content": doc.page_content,
                "metadata": doc.metadata
            }
    return list(unique_results.values())

# PDF Upload Endpoint
@app.post("/upload-pdf")
def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    try:
        raw_text = extract_text_from_pdf(file.file)
        if not raw_text.strip():
             raise HTTPException(status_code=400, detail="PDF is empty.")
        chunks = chunk_text(raw_text)
        count = add_chunks_to_vector_db(chunks, file.filename)
        return {"status": "success", "filename": file.filename, "chunks_processed": count}
    except Exception as e:
        print(f"Error processing PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/favicon.ico")
async def favicon():
    return JSONResponse(content={})

@app.post("/ask")
def ask_ai_endpoint(request: ChatRequest):
    """
    Intelligent Endpoint: Searches for context, then sends it to the LLM 
    to generate a structured, clean response.
    """
    # 1. Search for context in the Vector DB
    results = search_similar_notes(request.query)
    
    # 2. Check if found anything
    if not results:
        return {
            "answer": "I couldn't find any relevant information in your uploaded documents.",
            "sources": []
        }
    
    # 3. Format the context from the DB
    context_text = "\n\n".join([doc.page_content for doc in results])
    sources = list(set([doc.metadata.get("source", "Unknown") for doc in results]))
    
    # 4. Generate the AI Response
    # This sends the messy PDF text + your question to the AI
    try:
        # We use the existing get_rag_response function you imported
        ai_answer = get_rag_response(request.query, context_text)
        
        return {
            "answer": ai_answer, 
            "sources": sources
        }
    except Exception as e:
        # Fallback if the AI service fails (Eg: Invalid API Key)
        print(f"AI Error: {e}")
        return {
            "answer": "I found the info, but I couldn't summarize it (Check API Key). Here is the raw text:\n\n" + context_text[:500] + "...",
            "sources": sources
        }