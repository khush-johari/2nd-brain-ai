import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document

# 1. Setup the Embedding Model
# We are using 'all-MiniLM-L6-v2' (Small, Fast, Free)
embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# 2. Setup ChromaDB (The Database)
PERSIST_DIRECTORY = "./chroma_db"

vector_store = Chroma(
    collection_name="notes_collection",
    embedding_function=embedding_model,
    persist_directory=PERSIST_DIRECTORY
)

def add_note_to_vector_db(note_id: int, content: str, title: str):
    """
    Takes a note, turns it into numbers (vectors), and saves it.
    """
    print(f"Adding note {note_id} to Vector DB...")
    
    # Create a 'Document' object that LangChain understands
    doc = Document(
        page_content=content,
        metadata={"id": note_id, "title": title}
    )
    
    # Save to Chroma
    vector_store.add_documents([doc])
    print("Note added successfully!")

def search_similar_notes(query: str, k=3):
    """
    Searches for the top 'k' notes that match the meaning of the query.
    """
    print(f"Searching for: {query}")
    results = vector_store.similarity_search(query, k=k)
    return results