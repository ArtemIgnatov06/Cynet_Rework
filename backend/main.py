"""
Unified backend entry point.
Serves both the AI chat agent and all section API routes.
Run: uvicorn main:app --reload --port 8000
"""
import importlib
import sys
from pathlib import Path

from dotenv import load_dotenv

# Try backend/.env first, then backend/agent/.env as fallback
_env = Path(__file__).parent / ".env"
_env_agent = Path(__file__).parent / "agent" / ".env"
load_dotenv(_env if _env.exists() else _env_agent)

# Make sure backend root and agent dir are importable
ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "agent"))

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agent import load_chunks, Retriever, build_answer  # noqa: E402

# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(title="Cynet Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ── Agent setup ────────────────────────────────────────────────────────────────
CHUNKS_PATH = ROOT / "agent" / "data" / "chunks.jsonl"
chunks   = load_chunks(str(CHUNKS_PATH))
retriever = Retriever(chunks) if chunks else None


class ChatRequest(BaseModel):
    query: str
    top_k: int = 5


@app.get("/health")
def health():
    return {"status": "ok", "chunks_loaded": len(chunks)}


@app.post("/chat")
def chat(req: ChatRequest):
    if retriever is None:
        return {"answer": "No documentation loaded.", "sources": []}
    results  = retriever.search(req.query, top_k=req.top_k)
    response = build_answer(req.query, results)
    return {"answer": response["answer"], "sources": response["sources"]}


# ── Auto-register all api/ modules ────────────────────────────────────────────
# Convention: each api/<name>.py must expose _build_<name>_payload(mode, count)
API_DIR = ROOT / "api"

for api_file in sorted(API_DIR.glob("*.py")):
    if api_file.stem.startswith("_"):
        continue
    module_name = f"api.{api_file.stem}"
    try:
        mod = importlib.import_module(module_name)
    except Exception as e:
        print(f"[warn] Could not import {module_name}: {e}")
        continue

    build_fn_name = f"_build_{api_file.stem}_payload"
    build_fn = getattr(mod, build_fn_name, None)
    if build_fn is None:
        continue

    # Capture in closure so each route gets its own build_fn
    def make_route(fn):
        def route(mode: str = Query("critical"), count: int = Query(3)):
            return fn(mode, count)
        return route

    route_path = f"/api/{api_file.stem}"
    app.add_api_route(
        route_path,
        make_route(build_fn),
        methods=["GET"],
        name=api_file.stem,
    )
    print(f"[api] registered GET {route_path}")
