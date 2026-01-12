import pdfplumber
import re
from fastapi import UploadFile

def extract_text_from_pdf(file_file):
    """
    Reads a PDF file object using pdfplumber for better layout retention.
    Returns the full text cleaned of excessive whitespace.
    """
    text = ""
    # pdfplumber.open works directly with the file-like object from FastAPI
    with pdfplumber.open(file_file) as pdf:
        for page in pdf.pages:
            # extract_text() in pdfplumber is much smarter about spaces
            page_text = page.extract_text()
            
            if page_text:
                # 1. Replace newlines with spaces (Fixes the "Vertical Text" issue)
                # 2. Collapse multiple spaces into one (Fixes weird gaps)
                clean_text = re.sub(r'\s+', ' ', page_text).strip()
                text += clean_text + "\n\n" 
                
    return text

def chunk_text(text, chunk_size=500, overlap=50):
    """
    Splits text into smaller chunks with overlap.
    """
    chunks = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += (chunk_size - overlap)
    
    return chunks