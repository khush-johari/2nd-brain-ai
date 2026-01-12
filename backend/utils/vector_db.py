import os
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document

# 1. Setup the Embedding Model
# Using 'all-MiniLM-L6-v2' (Small, Fast, Free)
embedding_model = FastEmbedEmbeddings()

# 2. Setup ChromaDB (The Database)
PERSIST_DIRECTORY = "./chroma_db"

vector_store = Chroma(
    collection_name="notes_collection",
    embedding_function=embedding_model,
    persist_directory=PERSIST_DIRECTORY
)

def add_note_to_vector_db(note_id: int, content: str, title: str):
    """
    Takes a single note, turns it into a Document, and saves it.
    (Used for your Manual Note Entry feature)
    """
    print(f"Adding note {note_id} to Vector DB...")
    
    doc = Document(
        page_content=content,
        metadata={"id": note_id, "title": title, "type": "note"}
    )
    
    vector_store.add_documents([doc])
    print("Note added successfully!")

def add_chunks_to_vector_db(chunks: list, filename: str):
    """
    Takes a list of text chunks (strings), converts them to Documents,
    and saves them to ChromaDB.
    (Used for your PDF Upload feature)
    """
    print(f"Adding {len(chunks)} chunks from {filename} to Vector DB...")

    documents = []
    for i, chunk in enumerate(chunks):
        # Create a LangChain Document for each chunk
        doc = Document(
            page_content=chunk,
            # Add metadata so we know which file this came from later
            metadata={
                "source": filename,
                "type": "pdf_chunk",
                "chunk_index": i
            }
        )
        documents.append(doc)

    # Bulk add all chunks at once (Faster than adding one by one)
    if documents:
        vector_store.add_documents(documents)
        print(f"Successfully added {len(documents)} chunks!")
    
    return len(documents)

def search_similar_notes(query: str, k=3):
    """
    Searches for the top 'k' documents (notes or PDF chunks) that match the query.
    """
    print(f"Searching for: {query}")
    results = vector_store.similarity_search(query, k=k)
    return results