from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agent import load_chunks, Retriever, build_answer

# ── Paths ──────────────────────────────────────────────────────────────────────
CHUNKS_PATH = Path(__file__).parent / "data" / "chunks.jsonl"

# ── Startup: load once, reuse ──────────────────────────────────────────────────
chunks = load_chunks(str(CHUNKS_PATH))
retriever = Retriever(chunks) if chunks else None

# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(title="Cynet Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    query: str
    top_k: int = 5


@app.get("/health")
def health():
    return {"status": "ok", "chunks_loaded": len(chunks)}


@app.post("/chat")
def chat(req: ChatRequest):
    if retriever is None:
        return {
            "answer": "No documentation loaded. Check that chunks.jsonl exists.",
            "sources": [],
        }
    results = retriever.search(req.query, top_k=req.top_k)
    response = build_answer(req.query, results)
    # Return only what the frontend needs
    return {
        "answer": response["answer"],
        "sources": response["sources"],
    }
