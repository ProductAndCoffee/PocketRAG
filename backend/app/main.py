from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
import uuid
from . import database, schemas, ingest
from dotenv import load_dotenv

load_dotenv(override=True)

app = FastAPI(title="Simple RAG Tool")

# CORS (Allow all for local dev)
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def startup_event():
    database.init_db()
    os.makedirs("uploads", exist_ok=True)

@app.post("/folders", response_model=schemas.Folder)
def create_folder(folder: schemas.FolderCreate, db: Session = Depends(get_db)):
    db_folder = database.Folder(name=folder.name)
    db.add(db_folder)
    try:
        db.commit()
        db.refresh(db_folder)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="Folder already exists")
    return db_folder

@app.put("/folders/{folder_id}", response_model=schemas.Folder)
def update_folder(folder_id: str, folder: schemas.FolderUpdate, db: Session = Depends(get_db)):
    db_folder = db.query(database.Folder).filter(database.Folder.id == folder_id).first()
    if not db_folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    # Check for name uniqueness if name is changing
    if db_folder.name != folder.name:
        existing_folder = db.query(database.Folder).filter(database.Folder.name == folder.name).first()
        if existing_folder:
            raise HTTPException(status_code=400, detail="Folder with this name already exists")
    
    db_folder.name = folder.name
    try:
        db.commit()
        db.refresh(db_folder)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update folder")
    
    return db_folder

@app.get("/folders", response_model=List[schemas.Folder])
def read_folders(db: Session = Depends(get_db)):
    return db.query(database.Folder).all()

@app.get("/folders/{folder_id}/documents", response_model=List[schemas.Document])
def read_folder_documents(folder_id: str, db: Session = Depends(get_db)):
    return db.query(database.Document).filter(database.Document.folder_id == folder_id).all()

@app.post("/upload/{folder_id}")
def upload_document(folder_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    # 1. Save file locally
    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    saved_filename = f"uploads/{file_id}{file_extension}"
    
    with open(saved_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 2. Create DB Record
    db_doc = database.Document(
        id=file_id,
        filename=file.filename,
        folder_id=folder_id,
        status="processing"
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    
    # 3. Trigger Ingestion (Synchronous for now)
    try:
        num_chunks = ingest.ingest_document(
            file_path=saved_filename,
            document_id=file_id,
            document_title=file.filename,
            folder_id=folder_id
        )
        db_doc.status = "indexed"
        db.commit()
    except Exception as e:
        db_doc.status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")
        
    return {"status": "success", "chunks_indexed": num_chunks}

@app.delete("/documents/{document_id}")
def delete_document(document_id: str, db: Session = Depends(get_db)):
    db_doc = db.query(database.Document).filter(database.Document.id == document_id).first()
    if not db_doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # 1. Delete from ChromaDB
    try:
        ingest.delete_document(document_id)
    except Exception as e:
        print(f"Error deleting from ChromaDB: {e}")
        # Continue to delete from DB even if Chroma fails (orphaned vectors are better than zombie records)

    # 2. Delete file from disk
    file_path = f"uploads/{db_doc.id}{os.path.splitext(db_doc.filename)[1]}"
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except OSError:
            pass # File might not exist or other error

    # 3. Delete from DB
    db.delete(db_doc)
    db.commit()
    
    return {"status": "success"}

@app.post("/query", response_model=schemas.QueryResponse)
def query_rag(request: schemas.QueryRequest, db: Session = Depends(get_db)):
    # 1. Retrieve relevant chunks
    results = ingest.query_rag(request.question, request.folder_id)
    
    # 2. Construct Context
    context_text = "\n\n".join([f"Source ({r['document_title']}, p.{r['page_number']}): {r['snippet']}" for r in results])
    
    # 3. Generate Answer (Mock LLM or Real if Key present)
    api_key = os.environ.get("OPENAI_API_KEY")
    if api_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            
            system_prompt = """You are a helpful and comprehensive assistant. Answer the user's question in detail using ONLY the following context. 
            Explain the concepts fully and provide examples from the text if available.
            If the answer is not in the context, say you don't know. 
            Cite your sources by referring to the document titles and page numbers provided in the context."""
            
            user_prompt = f"Context:\n{context_text}\n\nQuestion: {request.question}"
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )
            answer = response.choices[0].message.content
        except Exception as e:
            answer = f"Error generating answer: {str(e)}"
    else:
        answer = f"Based on the documents, here is the information:\n\n{context_text[:500]}...\n\n(Note: Connect an OPENAI_API_KEY in .env to get a real synthesized answer.)"
    
    return schemas.QueryResponse(
        answer=answer,
        sources=[schemas.Source(**r) for r in results]
    )
