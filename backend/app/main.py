from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app import legal_service

app = FastAPI(
    title="AI Legal Research Assistant",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AskRequest(BaseModel):
    query: str


@app.get("/")
def home():
    return {
        "message": "AI Legal Research Assistant is running successfully."
    }


@app.get("/api/health")
def health():
    return legal_service.check_health()


@app.post("/api/ask")
async def ask(request: AskRequest):
    try:
        return await legal_service.ask(request.query)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
