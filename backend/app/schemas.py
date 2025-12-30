from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class FolderBase(BaseModel):
    name: str

class FolderCreate(FolderBase):
    pass

class FolderUpdate(FolderBase):
    pass

class Folder(FolderBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    filename: str

class Document(DocumentBase):
    id: str
    folder_id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class QueryRequest(BaseModel):
    question: str
    folder_id: Optional[str] = None

class Source(BaseModel):
    document_title: str
    page_number: int
    snippet: str
    score: float

class QueryResponse(BaseModel):
    answer: str
    sources: List[Source]
