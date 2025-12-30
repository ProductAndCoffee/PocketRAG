Here’s a tool-agnostic PRD for PocketRAG (a PDF-only RAG MVP), with an embedded TDD inside relevant sections.

⸻

1. Product Overview

1.1 Summary

Build a lightweight Retrieval-Augmented Generation (RAG) assistant that allows users to ask natural language questions about a corpus of PDFs and receive grounded, cited answers.
	•	Input: One or more PDFs (reports, manuals, policy docs, etc.).
	•	Output: Natural language answers with references to specific documents/pages.
	•	Deployment: Local laptop (Lightweight, e.g., Docker or Python script).
	•	Vendors: Pluggable – works with any LLM API, embedding model, and vector index that satisfy minimal interfaces.

⸻

2. Problem Statement

Users have large collections of PDFs that are difficult to search using keyword-based tools:
	•	They remember “what” the PDF says, not the exact text.
	•	Full-text search returns too many irrelevant hits.
	•	Manually skimming or Ctrl+F across multiple docs is slow and error-prone.

We need a question-answering assistant that:
	•	Understands natural language questions,
	•	Retrieves relevant PDF content, and
	•	Generates concise, cited answers.

⸻

3. Goals & Non-Goals

3.1 Goals
	1.	Allow users to organize PDFs into Folders (Subjects/Topics) and upload content for semantic search.
	2.	Let users ask questions and get grounded answers referencing PDF sources.
	3.	Return answers in ≤ 5 seconds for typical questions on a small–medium corpus.
	4.	Make the solution tool-agnostic:
	•	LLM provider can be swapped.
	•	Embedding model can be swapped.
	•	Vector index can be swapped.

3.2 Non-Goals (MVP)
	•	No multi-language support beyond what the selected LLM inherently supports.
	•	No fine-tuning or RLHF; use off-the-shelf LLMs.
	•	No complex user management (basic single-user or simple auth is fine).
	•	No real-time document updates (re-indexing can be batch/on-demand).

⸻

4. Target Users & Use Cases

4.1 Personas
	1.	Knowledge Worker / PM / Analyst
	•	Has many PDFs: reports, RFPs, specs, contracts, policy docs.
	•	Needs quick, accurate answers without reading entire docs.
	2.	Tech Lead / Architect
	•	Evaluating or debugging system behavior.
	•	Wants to ask “how is feature X described?” or “what are constraints in doc Y?”.

4.2 Primary Use Cases
	1.	Ask questions about a single PDF
	•	“What are the SLAs defined in this contract?”
	2.	Ask questions across multiple PDFs
	•	“What are the different pricing tiers mentioned in all documents?”
	3.	Locate source quickly
	•	“Show me where in the document this is stated.”

⸻

5. User Experience (MVP)

5.1 Basic Flow
	1.	Upload PDFs
	•	User selects one or more PDFs to upload.
	•	User selects or creates a target Folder (Subject) for the documents.
	•	System shows indexing status (Pending → Processing → Indexed).
	2.	Ask Question
	•	Simple chat-like input box:
	•	User types a question.
	•	System returns answer + list of sources (doc name + page number).
	3.	View Sources
	•	For each answer, user can see:
	•	Document title
	•	Page number
	•	Short snippet of the source text.

⸻

6. Functional Requirements

6.1 Document Ingestion
	•	FR-1: User can create, rename, and select Folders for organization.
	•	FR-1.1: User can upload one or more PDF files into a specific Folder.
	•	FR-1.2: User can list and delete documents from a folder.
	•	FR-2: System extracts textual content from each PDF page.
	•	FR-3: System splits text into overlapping chunks suitable for embedding.
	•	FR-4: System computes vector embeddings for each chunk.
	•	FR-5: System stores chunks + embeddings + metadata (doc name, page number, etc.) in a vector index.
	•	FR-6: System handles re-ingestion (e.g., clearing and re-indexing for updated PDFs).

[TDD – Ingestion Design]

Ingestion Pipeline Stages:
	1.	PDF Loader
	•	Input: File path or uploaded file stream.
	•	Output: List of (page_number, raw_text) entries.
	•	Requirement: Pluggable PDF parsing library (e.g., any library that given a PDF, returns page-wise text).
	2.	Text Normalizer
	•	Tasks:
	•	Remove extra whitespace.
	•	Optionally normalize unicode.
	•	Output: Clean text per page.
	3.	Chunker
	•	Input: text (per page or aggregated pages).
	•	Parameters:
	•	max_chunk_size (tokens or characters)
	•	chunk_overlap
	•	Output: List of chunk objects:

{
  "chunk_id": "...",
  "document_id": "...",
  "page_number": N,
  "text": "chunk text..."
}


	4.	Embedding Service
	•	Interface (tool-agnostic):

embed_texts(texts: List<string>) -> List<vector<float>>


	•	Constraints:
	•	Model name & provider configurable.
	•	Batch size configurable.

	5.	Vector Index Writer
	•	Interface:

upsert(
  ids: List<string>,
  vectors: List<vector<float>>,
  metadata: List<dict>,
  documents: List<string>
)


	•	Metadata fields (minimum):
	•	document_id
	•	document_title
	•	page_number
	•	folder_name (subject)
	•	chunk_index (position within doc)

	6.	Persistence
	•	Vector index persists locally or via managed service.
	•	Optional: store original PDFs and a lightweight Document Catalog in a relational or key-value store.

⸻

6.2 Question Answering
	•	FR-7: User submits a natural language question via UI, optionally filtering by Folder.
	•	FR-8: System embeds the question using the same embedding model.
	•	FR-9: System retrieves top-k relevant chunks from the vector index.
	•	FR-10: System constructs a prompt with:
	•	System instructions,
	•	Retrieved context chunks,
	•	User question.
	•	FR-11: System calls the LLM provider to generate an answer.
	•	FR-12: System returns:
	•	Answer text,
	•	List of sources (document title, page number, snippet, confidence).

[TDD – Query & RAG Design]

Query Pipeline Stages:
	1.	Query Embedding
	•	Interface (same embedding service as ingestion):

embed_query(query: string) -> vector<float>


	2.	Vector Retrieval
	•	Interface:

search(
  query_vector: vector<float>,
  top_k: int,
  filter: dict = None
) -> List<{
  "id": string,
  "score": float,
  "metadata": dict,
  "document": string
}>


	3.	Context Builder
	•	Aggregates retrieved chunks into a context string.
	•	Includes clearly delimited sections such as:

[Source 1: doc_title, page X]
chunk text...

[Source 2: doc_title, page Y]
chunk text...


	4.	Prompt Composer
	•	Constructs messages for chat-style LLMs:

system_message = """
You are a careful assistant. Answer the question using ONLY the provided context.
If the answer is not present, say you don't know.
At the end, list which sources you used (document title and page number).
"""

user_message = f"""
Context:
{context_text}

Question:
{user_question}
"""


	5.	LLM Client
	•	Tool-agnostic interface:

generate_answer(
  system_message: string,
  user_message: string,
  model_name: string
) -> string


	•	Implementation encapsulates vendor details (API key, base URL, etc.).

	6.	Response Formatter
	•	Output JSON:

{
  "answer": "string",
  "sources": [
    {
      "document_title": "string",
      "page_number": 5,
      "snippet": "short excerpt...",
      "score": 0.87
    }
  ]
}



⸻

6.3 Sources & Explainability
	•	FR-13: For each answer, the system returns a list of sources used.
	•	FR-14: UI lets user expand/collapse per-source snippet.
	•	FR-15: Provide basic ordering of sources by relevance score.

⸻

6.4 Administration / Configuration
	•	FR-16: Admin can configure:
	•	LLM provider & model.
	•	Embedding provider & model.
	•	Vector index type and connection details.
	•	Chunk size, overlap, and top_k.
	•	FR-17: Admin can clear and rebuild the index.

⸻

7. Non-Functional Requirements

7.1 Performance
	•	For a corpus up to ~500 pages, typical question should return an answer in ≤ 5 seconds on a modest cloud instance.
	•	Retrieval latency (vector search) ≤ 500 ms for small corpora.

7.2 Scalability (MVP)
	•	Initial design targets local laptop deployment (minimize resource overhead).
	•	Architecture should allow:
	•	Moving vector index to a managed service.
	•	Scaling LLM calls horizontally (stateless API).

7.3 Reliability & Error Handling
	•	Graceful failure with user-visible error messages:
	•	“LLM provider unavailable.”
	•	“Embedding service error.”
	•	Log all errors with correlation IDs.

7.4 Security & Privacy
	•	PDFs are not sent to any external service except:
	•	For embedding (text chunks) and
	•	LLM answer generation (context + question),
depending on chosen providers.
	•	Configurable data retention:
	•	Ability to delete all indexed data and uploaded PDFs.

[TDD – Security & Config Design]

	•	Store credentials (API keys, URLs) in environment variables or secure config store.
	•	Simple RBAC (optional for MVP):
	•	Single admin user or basic auth token to access ingestion endpoints.
	•	Ensure no personally identifiable info is logged in plain text outside of minimal metadata.

⸻

8. High-Level Architecture

[TDD – Architecture]

8.1 Components
	1.	Web/API Layer
	•	Serves UI and exposes HTTP endpoints:
	•	POST /documents – upload PDFs
	•	POST /reindex – re-index all PDFs (optional)
	•	POST /query – ask a question
	•	GET /health – health check
	2.	Ingestion Service
	•	Handles PDF parsing, chunking, embedding, and index writes.
	•	Can run synchronous (blocking on upload) or async (via queue/worker).
	3.	Vector Index
	•	Any vector database or library (in-process or remote) that provides:
	•	Upsert
	•	Search (kNN / similarity)
	4.	LLM & Embedding Clients
	•	Abstraction over third-party APIs or self-hosted models.
	•	Configurable via environment settings.
	5.	Storage
	•	Blob storage for original PDFs.
	•	(Optional) Relational/NoSQL store for document catalog and logs.

8.2 Sequence Flow (Query)
	1.	User sends POST /query with { "question": "..." }.
	2.	API calls Embedding Client → embed_query().
	3.	API calls Vector Index → search(query_vector, top_k).
	4.	API builds context from retrieved chunks.
	5.	API calls LLM Client → generate_answer(system_message, user_message).
	6.	API returns answer + sources JSON to frontend.

⸻

9. Data Model (Conceptual)

[TDD – Data Model]

9.1 Entities
	1.	Document
	•	document_id (string, unique)
	•	title (string)
	•	file_path or storage_uri (string)
	•	uploaded_at (datetime)
	•	folder_id (FK to Folder) or folder_name (string)
	•	status (enum: uploaded, processing, indexed, error)
	2.	Folder
	•	folder_id (string, unique)
	•	name (string)
	•	created_at (datetime)
	2.	Chunk
	•	chunk_id (string, unique)
	•	document_id (FK)
	•	page_number (int)
	•	text (string)
	•	chunk_index (int)
	•	embedding_vector (stored in vector index, not necessarily in relational store)
	3.	QueryLog (Optional for MVP but recommended)
	•	query_id (string)
	•	question (string)
	•	timestamp (datetime)
	•	retrieved_chunk_ids (array)
	•	answer (string)
	•	latency_ms (int)
	•	error (nullable string)

⸻

10. Future Enhancements
	•	Multi-user / tenancy
	•	Should different users have isolated corpora?
	•	Feedback loop
	•	Allow users to thumbs-up/down answers and use this for future evaluation.
	•	Evaluation
	•	Add internal metrics for retrieval quality and hallucination rate.
	•	Multi-format support
	•	Extend ingestion to HTML, DOCX, plain text.

⸻
