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
