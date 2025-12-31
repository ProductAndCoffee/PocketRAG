# PocketRAG

A lightweight, local, folder-aware RAG (Retrieval-Augmented Generation) application. Organize your PDFs into subjects and chat with them using AI.

## Features
- 📂 **Subject Organization**: Group PDFs into folders.
- 💬 **Context-Aware Chat**: Ask questions specific to a subject or across all documents.
- ⚡ **Local & Private**: Powered by local embeddings (ChromaDB) and standard APIs.
- 🎨 **Premium UI**: Modern React interface with glassmorphism and animations.

## Tech Stack
- **Backend**: FastAPI, ChromaDB, SQLite, PyPDF
- **Frontend**: React, Vite, Tailwind CSS v4, Framer Motion

## Quick Start
### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Known Limitations

This V1 implementation is optimized for personal use and small-to-medium workloads. Please be aware of the following system limits:

### 1. File Upload & Processing
- **Synchronous Processing**: Document ingestion happens synchronously during the upload request. Uploading very large PDFs (e.g., 50MB+ or 100+ pages) may result in request timeouts (e.g., 60s limit on some clients) even if the server is still processing.
- **Memory**: The system processes entire files in memory. Very large individual files may cause high RAM usage.

### 2. Scalability
- **Vector Database**: Uses a local, persistent instance of ChromaDB (SQLite-based), which is performant for thousands of chunks but may degrade in speed with hundreds of thousands of vectors.
- **Concurrency**: Local CPU-based embedding generation means simultaneous large uploads will compete for resources, potentially slowing down the application.
