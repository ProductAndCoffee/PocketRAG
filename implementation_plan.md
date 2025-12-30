# Implementation Plan - Simple RAG Tool

## Goal
Build a lightweight, local, folder-aware RAG application. Users can upload PDFs into specific folders (subjects) and ask questions.
**Key Features**: Local Deployment (Laptop), Folders/Subject Organization, "Wow" Aesthetics.

## User Review Required
> [!IMPORTANT]
> **Tech Stack Choice**:
> - **Backend**: Python (FastAPI). Chosen for lightweight performance and rich ecosystem for RAG.
> - **Frontend**: React (Vite). Chosen to allow premium, "wow" aesthetics and dynamic interactions (folders, chat) better than Streamlit.
> - **Database**: SQLite (Metadata) + ChromaDB (Vectors). Both are zero-setup, file-based, and perfect for local deployment.
> - **Environment**: Requires Python 3.9+ and Node.js installed on the user's laptop.

## Proposed Changes

### Project Structure
```text
/backend
  /app
    main.py          # API Endpoints
    ingest.py        # PDF extraction & Chunking
    rag.py           # Embedding & Retrieval logic (ChromaDB)
    database.py      # SQLite models (Folder, Document)
    schemas.py       # Pydantic models
/frontend
  (Vite + React Setup)
  /src
    /components      # UI Components (Sidebar, Chat, FileUpload)
    App.jsx
```

### Backend Implementation
#### [NEW] [backend/requirements.txt](file:///Users/v1/My Projects 2025/Code/Simple RAG 1.0/backend/requirements.txt)
Dependencies: `fastapi`, `uvicorn`, `chromadb`, `pypdf`, `openai` (or other LLM client), `python-multipart`, `sqlalchemy`.

#### [NEW] [backend/app/database.py](file:///Users/v1/My Projects 2025/Code/Simple RAG 1.0/backend/app/database.py)
SQLite setup using SQLAlchemy.
Entities:
- `Folder`: id, name, created_at
- `Document`: id, title, folder_id, status

#### [NEW] [backend/app/ingest.py](file:///Users/v1/My Projects 2025/Code/Simple RAG 1.0/backend/app/ingest.py)
Logic to:
1. Parse PDF (pypdf).
2. Chunk text.
3. Embed & Store in ChromaDB.

#### [NEW] [backend/app/main.py](file:///Users/v1/My Projects 2025/Code/Simple RAG 1.0/backend/app/main.py)
Endpoints:
- `POST /folders`: Create folder.
- `GET /folders`: List folders.
- `POST /upload/{folder_id}`: Upload PDF.
- `POST /query`: RAG QA Endpoint.

### Frontend Implementation
#### [NEW] [frontend/](file:///Users/v1/My Projects 2025/Code/Simple RAG 1.0/frontend/)
Initialize Vite project (`npm create vite@latest`).
- **Styling**: `index.css` with CSS Variables for themes (Dark/Light). Glassmorphism effects.
- **Components**:
    - `Sidebar`: Folder navigation.
    - `ChatArea`: Message bubbles, Source citations.
    - `UploadModal`: Drag & drop, Folder selection.

## Verification Plan

### Automated Tests
- **Backend Tests**: `pytest` for API endpoints (mocking LLM calls).
- **Frontend Build**: Ensure `npm run build` succeeds.

### Manual Verification
1.  **Setup**: Run `uvicorn` (backend) and `npm run dev` (frontend).
2.  **Folder Flow**: Create a folder "Biology". Verify it appears in sidebar.
3.  **Ingestion**: Upload a PDF to "Biology". Check logs for indexing success.
4.  **Query**: Ask a question relevant to the PDF. Verify answer + source citation.
