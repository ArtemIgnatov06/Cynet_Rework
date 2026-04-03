import argparse
import json
from pathlib import Path
from typing import List

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def load_chunks(path: str) -> List[dict]:
    chunks = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            obj = json.loads(line)
            if valid_chunk(obj):
                chunks.append(obj)
    return chunks


def valid_chunk(chunk: dict) -> bool:
    text = chunk.get("content", "") or chunk.get("text", "")
    if not text or len(text.strip()) < 80:
        return False

    low = text.lower()

    junk_signals = [
        "release notes",
        "installation",
        "api reference",
        "help center",
        "user guide",
        "related articles",
    ]

    if sum(low.count(signal) for signal in junk_signals) >= 4:
        return False

    lines = [ln.strip() for ln in low.splitlines() if ln.strip()]
    if len(lines) >= 6:
        short_lines = [ln for ln in lines if len(ln) < 50]
        if len(short_lines) / len(lines) > 0.7:
            return False

    return True


class Retriever:
    def __init__(self, chunks: List[dict]):
        self.chunks = chunks
        self.texts = [self.chunk_text_for_index(c) for c in chunks]
        self.vectorizer = TfidfVectorizer(stop_words="english")
        self.matrix = self.vectorizer.fit_transform(self.texts)

    @staticmethod
    def chunk_text_for_index(chunk: dict) -> str:
        parts = [
            chunk.get("article_title", ""),
            chunk.get("section_heading", ""),
            chunk.get("category", ""),
            chunk.get("content", "") or chunk.get("text", ""),
        ]
        return "\n".join(p for p in parts if p)

    def search(self, query: str, top_k: int = 5) -> List[dict]:
        qv = self.vectorizer.transform([query])
        sims = cosine_similarity(qv, self.matrix)[0]

        ranked = sorted(
            zip(self.chunks, sims),
            key=lambda x: x[1],
            reverse=True,
        )

        results = []
        seen_docs = set()

        for chunk, score in ranked:
            if score <= 0:
                continue

            doc_key = (chunk.get("doc_id"), chunk.get("section_heading"))
            if doc_key in seen_docs:
                continue
            seen_docs.add(doc_key)

            item = dict(chunk)
            item["score"] = round(float(score), 4)
            results.append(item)

            if len(results) >= top_k:
                break

        return results


def build_answer(query: str, retrieved_chunks: List[dict]) -> dict:
    if not retrieved_chunks:
        return {
            "answer": "I could not find relevant documentation for that question.",
            "sources": [],
            "retrieved_chunks": [],
        }

    lines = ["I found these relevant documentation snippets:\n"]

    for idx, chunk in enumerate(retrieved_chunks, start=1):
        title = chunk.get("article_title", "Untitled")
        heading = chunk.get("section_heading", "")
        content = chunk.get("content", "") or chunk.get("text", "")
        preview = content[:500].strip()

        lines.append(f"{idx}. {title} ({heading})")
        lines.append(preview)
        lines.append("")

    sources = []
    seen = set()
    for chunk in retrieved_chunks:
        key = (chunk.get("article_title"), chunk.get("article_url"))
        if key in seen:
            continue
        seen.add(key)
        sources.append({
            "title": chunk.get("article_title"),
            "url": chunk.get("article_url"),
        })

    return {
        "answer": "\n".join(lines).strip(),
        "sources": sources,
        "retrieved_chunks": retrieved_chunks,
    }


def main():
    parser = argparse.ArgumentParser(description="Cynet helper agent")
    parser.add_argument("--chunks", required=True, help="Path to chunks.jsonl")
    parser.add_argument("query", help="Question to ask")
    args = parser.parse_args()

    if not Path(args.chunks).exists():
        raise FileNotFoundError(f"Chunks file not found: {args.chunks}")

    chunks = load_chunks(args.chunks)
    if not chunks:
        print(json.dumps({
            "answer": "No valid chunks were loaded. Check scraper output/extraction.",
            "sources": [],
            "retrieved_chunks": [],
        }, indent=2, ensure_ascii=False))
        return

    retriever = Retriever(chunks)
    results = retriever.search(args.query, top_k=5)
    response = build_answer(args.query, results)

    print(json.dumps(response, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()