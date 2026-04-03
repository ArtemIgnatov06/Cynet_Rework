# Cynet Helper Agent

This project contains two parts:

1. `scraper.py` — crawls the Cynet help center category and exports clean JSONL files for agent use.
2. `agent.py` — loads the exported chunks and serves a helper agent over CLI or FastAPI.

## Output format for the agent

The scraper writes:

- `data/articles.jsonl` — one article per line
- `data/chunks.jsonl` — one retrieval chunk per line
- `data/manifest.json` — crawl summary

### Chunk schema

```json
{
  "chunk_id": "example-0",
  "article_title": "Some Article",
  "article_url": "https://help.cynet.com/en/articles/...",
  "category": "User Guide",
  "breadcrumb": ["Home", "User Guide", "Some Article"],
  "section_heading": "How to configure X",
  "content": "Chunk text here"
}
```

This format is suitable for:

- RAG pipelines
- vector databases
- BM25 / TF-IDF retrieval
- FAQ helpers
- support copilots

## Run the parser

```bash
pip install -r requirements.txt
python scraper.py \
  --category-url "https://help.cynet.com/en/categories/6-user-guide" \
  --out-dir data
```

## Ask questions from the terminal

```bash
python agent.py --chunks data/chunks.jsonl "How do I investigate an alert?"
```

## Run the API

```bash
uvicorn agent:app --reload --host 0.0.0.0 --port 8000
```

Then call:

```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "How do I view audit trails?", "top_k": 5}'
```

## Optional LLM synthesis

Without an API key, the agent returns the best matching excerpts.

With an OpenAI API key, it will synthesize a grounded answer from the retrieved chunks:

```bash
export OPENAI_API_KEY="your_key_here"
export OPENAI_MODEL="gpt-4.1-mini"
```

## Notes

- The crawler is designed for help-center sites whose article pages use standard semantic markup and article/category URL patterns.
- It intentionally stores both article-level and chunk-level outputs so you can rebuild retrieval strategies later without recrawling.
- Respect the site owner’s terms and rate limits when crawling.
