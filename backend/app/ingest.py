import chromadb
from chromadb.config import Settings
import os
from pypdf import PdfReader
from typing import List, Dict
import uuid

# Initialize ChromaDB (Persistent)
# We use the default embedding function (all-MiniLM-L6-v2) which runs locally.
CHROMA_DB_DIR = "chroma_db"
client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
collection = client.get_or_create_collection(name="rag_documents")

def parse_pdf(file_path: str) -> List[Dict]:
    """
    Extracts text from PDF and returns a list of pages with text.
    """
    reader = PdfReader(file_path)
    pages = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text:
            pages.append({"page_number": i + 1, "text": text})
    return pages

def chunk_text(pages: List[Dict], chunk_size: int = 1000, overlap: int = 200) -> List[Dict]:
    """
    Splits text into chunks.
    """
    chunks = []
    for page in pages:
        text = page["text"]
        page_num = page["page_number"]
        
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk_text = text[start:end]
            chunks.append({
                "chunk_id": str(uuid.uuid4()),
                "text": chunk_text,
                "page_number": page_num
            })
            start += (chunk_size - overlap)
    return chunks

def ingest_document(file_path: str, document_id: str, document_title: str, folder_id: str):
    """
    Full pipeline: Parse -> Chunk -> Index
    """
    pages = parse_pdf(file_path)
    chunks = chunk_text(pages)
    
    ids = []
    documents = []
    metadatas = []

    for i, chunk in enumerate(chunks):
        ids.append(chunk["chunk_id"])
        documents.append(chunk["text"])
        metadatas.append({
            "document_id": document_id,
            "document_title": document_title,
            "folder_id": folder_id,
            "page_number": chunk["page_number"],
            "chunk_index": i
        })

    if ids:
        collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas
        )
    
    return len(ids)

def query_rag(query_text: str, folder_id: str = None, n_results: int = 5):
    """
    Query the vector DB.
    """
    where_filter = {}
    if folder_id:
        where_filter = {"folder_id": folder_id}
    
    # Handle case where filter is empty
    if not where_filter:
        where_filter = None

    results = collection.query(
        query_texts=[query_text],
        n_results=n_results,
        where=where_filter
    )
    
    # Format results
    formatted_results = []
    if results["ids"]:
        for i in range(len(results["ids"][0])):
            formatted_results.append({
                "document_title": results["metadatas"][0][i]["document_title"],
                "page_number": results["metadatas"][0][i]["page_number"],
                "snippet": results["documents"][0][i],
                "score": results["distances"][0][i] if results["distances"] else 0.0 # Chroma returns distance, lower is better usually, depending on metric
            })
            
    return formatted_results

def delete_document(document_id: str):
    """
    Delete a document and its vectors from ChromaDB.
    """
    collection.delete(
        where={"document_id": document_id}
    )
    return True
