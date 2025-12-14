from pydantic import BaseModel
from typing import Optional

# This defines what data the Frontend MUST send us to create a note
class NoteCreate(BaseModel):
    title: str
    content: str
    tags: Optional[str] = None  # This field is optional

# This defines what a Note looks like when we read it from our DB
class Note(NoteCreate):
    id: int