# AI Legal Research Assistant

A SciSpace-style research assistant over Pakistani Supreme/High Court case law. FastAPI backend wraps the hybrid graph-RAG pipeline from `supreme_court_scraper` (Qdrant + Neo4j + local LLM via Ollama); React (Vite) frontend provides the chat interface.

## Prerequisites (must already be running locally)

- Neo4j (bolt on 7687)
- Qdrant (6333)
- Ollama (11434)

## Run

**Backend** (from `backend/`):
```
venv\Scripts\uvicorn app.main:app --reload --port 8000
```

**Frontend** (from `frontend/`):
```
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

The backend imports `legal_answer.py` directly from the `supreme_court_scraper` repo and loads that repo's `.env` for Neo4j/Qdrant/Ollama credentials — no secrets are duplicated here.