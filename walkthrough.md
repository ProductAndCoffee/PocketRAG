# Simple RAG Tool - Walkthrough

## 1. Backend Setup
The backend is built with FastAPI and uses SQLite + ChromaDB.

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  (Optional) Create and activate a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the server:
    ```bash
    uvicorn app.main:app --reload
    ```
    The API will be available at [http://localhost:8000](http://localhost:8000).

## 2. Frontend Setup
The frontend is a React app using Vite.

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The UI will be available at [http://localhost:5173](http://localhost:5173).

## 3. Usage Guide
1.  **Create a Subject Folder**: Use the "+" button in the sidebar to create a folder (e.g., "Finance").
2.  **Upload PDFs**: Select the folder, click "Upload PDF" and choose a file.
3.  **Chat**: Type your question in the chat box. The system will retrieve relevant chunks and answer.
    *   *Note*: To enable real LLM answers, set the `OPENAI_API_KEY` environment variable before running the backend. Otherwise, it uses a mock response with real retrieved citations.
