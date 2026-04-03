import argparse
import json
import re
import time
from pathlib import Path
from typing import Optional
from urllib.parse import urljoin, urlparse
from collections import deque

import requests
from bs4 import BeautifulSoup
from urllib import robotparser


DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
}

NOISE_SELECTORS = [
    "nav",
    "header",
    "footer",
    "aside",
    "script",
    "style",
    "noscript",
    "form",
    "button",
    "[role='navigation']",
    "[aria-label*='breadcrumb' i]",
    "[class*='breadcrumb']",
    "[class*='nav']",
    "[class*='menu']",
    "[class*='sidebar']",
    "[class*='related']",
    "[class*='suggested']",
    "[class*='footer']",
    "[class*='header']",
    "[class*='toc']",
    "[class*='table-of-contents']",
]

BODY_CANDIDATE_SELECTORS = [
    "main article",
    "article",
    "main",
    "[class*='article-body']",
    "[class*='article-content']",
    "[class*='article__content']",
    "[class*='article-text']",
    "[class*='content-body']",
    "[class*='post-content']",
    "[class*='entry-content']",
    "[data-testid*='article']",
]

NAV_JUNK_PHRASES = [
    "release notes",
    "installation",
    "api reference",
    "help center",
    "user guide",
    "related articles",
    "table of contents",
]


def parse_args():
    parser = argparse.ArgumentParser(description="Cynet Help Center scraper")
    parser.add_argument("--category-url", required=True, help="Category page URL")
    parser.add_argument("--out-dir", default="data", help="Output directory")
    parser.add_argument(
        "--ignore-robots",
        action="store_true",
        help="Skip robots.txt checks for authorized internal use",
    )
    parser.add_argument(
        "--use-playwright",
        action="store_true",
        help="Enable Playwright fallback",
    )
    parser.add_argument(
        "--prefer-playwright",
        action="store_true",
        help="Use Playwright before requests",
    )
    parser.add_argument(
        "--max-pages",
        type=int,
        default=500,
        help="Maximum pages to visit",
    )
    parser.add_argument(
        "--sleep-seconds",
        type=float,
        default=0.2,
        help="Small polite delay between requests",
    )
    return parser.parse_args()


def normalize_url(base: str, href: str) -> str:
    if not href:
        return ""
    href = href.split("#")[0].strip()
    if not href:
        return ""
    return urljoin(base, href)


def same_host(url: str, expected_host: str) -> bool:
    return urlparse(url).netloc == expected_host


def is_category_url(url: str, expected_host: str) -> bool:
    parsed = urlparse(url)
    return (
        parsed.netloc == expected_host
        and "/en/categories/" in parsed.path
    )


def is_article_url(url: str, expected_host: str) -> bool:
    parsed = urlparse(url)
    return (
        parsed.netloc == expected_host
        and "/en/articles/" in parsed.path
    )


def clean_text(text: str) -> str:
    text = text.replace("\xa0", " ")
    text = re.sub(r"\r", "\n", text)
    text = re.sub(r"\n[ \t]*\n[ \t]*\n+", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def get_robot_parser(base_url: str) -> robotparser.RobotFileParser:
    parsed = urlparse(base_url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    rp = robotparser.RobotFileParser()
    rp.set_url(robots_url)
    try:
        rp.read()
    except Exception:
        pass
    return rp


def can_fetch(url: str, rp: Optional[robotparser.RobotFileParser], ignore_robots: bool) -> bool:
    if ignore_robots:
        return True
    if rp is None:
        return True
    try:
        return rp.can_fetch(DEFAULT_HEADERS["User-Agent"], url)
    except Exception:
        return True


def fetch_html_requests(session: requests.Session, url: str, timeout: int = 30) -> str:
    response = session.get(url, timeout=timeout)
    response.raise_for_status()
    return response.text


def fetch_html_playwright(url: str) -> str:
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url, wait_until="networkidle", timeout=60000)
        html = page.content()
        browser.close()
        return html


def fetch_html(
    session: requests.Session,
    url: str,
    rp: Optional[robotparser.RobotFileParser],
    ignore_robots: bool,
    use_playwright: bool,
    prefer_playwright: bool,
) -> Optional[str]:
    if not can_fetch(url, rp, ignore_robots):
        print(f"[warn] failed to fetch {url}: Blocked by robots.txt: {url}")
        return None

    if prefer_playwright and use_playwright:
        try:
            return fetch_html_playwright(url)
        except Exception as e:
            print(f"[warn] playwright fetch failed for {url}: {e}")
            try:
                return fetch_html_requests(session, url)
            except Exception as e2:
                print(f"[warn] requests fetch failed for {url}: {e2}")
                return None

    try:
        return fetch_html_requests(session, url)
    except Exception as e:
        print(f"[warn] requests fetch failed for {url}: {e}")
        if use_playwright:
            try:
                return fetch_html_playwright(url)
            except Exception as e2:
                print(f"[warn] playwright fetch failed for {url}: {e2}")
        return None


def score_candidate(node) -> int:
    text = node.get_text("\n", strip=True)
    if not text:
        return -10**9

    score = len(text)
    score += text.count(". ") * 20
    score += text.count("\n") * 3

    lower = text.lower()
    for phrase in NAV_JUNK_PHRASES:
        score -= lower.count(phrase) * 120

    short_lines = sum(
        1 for line in text.splitlines()
        if 0 < len(line.strip()) < 40
    )
    score -= short_lines * 8

    return score


def extract_heading_structure(container):
    sections = []
    current_heading = None
    buffer = []

    for el in container.find_all(["h1", "h2", "h3", "p", "li"], recursive=True):
        text = clean_text(el.get_text(" ", strip=True))
        if not text:
            continue

        if el.name in ("h1", "h2", "h3"):
            if buffer:
                sections.append({
                    "heading": current_heading,
                    "text": "\n".join(buffer).strip()
                })
                buffer = []
            current_heading = text
        else:
            buffer.append(text)

    if buffer:
        sections.append({
            "heading": current_heading,
            "text": "\n".join(buffer).strip()
        })

    return sections


def extract_breadcrumb(soup: BeautifulSoup) -> list[str]:
    breadcrumb = []

    candidates = []
    candidates.extend(soup.select("[aria-label*='breadcrumb' i] a"))
    candidates.extend(soup.select("[class*='breadcrumb'] a"))

    for el in candidates:
        text = clean_text(el.get_text(" ", strip=True))
        if text and text not in breadcrumb:
            breadcrumb.append(text)

    return breadcrumb


def extract_article(url: str, html: str) -> Optional[dict]:
    soup = BeautifulSoup(html, "html.parser")

    for sel in NOISE_SELECTORS:
        for tag in soup.select(sel):
            tag.decompose()

    title = None
    h1 = soup.find("h1")
    if h1:
        title = clean_text(h1.get_text(" ", strip=True))
    elif soup.title:
        title = clean_text(soup.title.get_text(" ", strip=True))

    breadcrumb = extract_breadcrumb(soup)

    candidates = []
    for sel in BODY_CANDIDATE_SELECTORS:
        candidates.extend(soup.select(sel))

    if not candidates and soup.body:
        candidates = [soup.body]

    if not candidates:
        return None

    best = max(candidates, key=score_candidate)

    for sel in NOISE_SELECTORS:
        for tag in best.select(sel):
            tag.decompose()

    sections = extract_heading_structure(best)

    full_text_parts = []
    for section in sections:
        if section["heading"]:
            full_text_parts.append(section["heading"])
        if section["text"]:
            full_text_parts.append(section["text"])

    content = clean_text("\n\n".join(full_text_parts))
    if not content or len(content) < 200:
        return None

    category = ""
    if breadcrumb:
        if "User Guide" in breadcrumb and len(breadcrumb) >= 2:
            category = breadcrumb[-2] if breadcrumb[-1] == title else breadcrumb[-1]
        else:
            category = breadcrumb[-2] if len(breadcrumb) >= 2 else breadcrumb[-1]

    return {
        "title": title or url,
        "url": url,
        "breadcrumb": breadcrumb,
        "category": category,
        "content": content,
        "sections": sections,
        "source_type": "web",
    }


def discover_links(base_url: str, html: str, expected_host: str) -> tuple[list[str], list[str]]:
    soup = BeautifulSoup(html, "html.parser")
    article_urls = set()
    category_urls = set()

    for a in soup.find_all("a", href=True):
        url = normalize_url(base_url, a["href"])
        if not url or not same_host(url, expected_host):
            continue

        if is_article_url(url, expected_host):
            article_urls.add(url)
        elif is_category_url(url, expected_host):
            category_urls.add(url)

    return sorted(article_urls), sorted(category_urls)


def is_bad_chunk(text: str) -> bool:
    low = text.lower().strip()

    if len(low) < 80:
        return True

    bad_phrases = [
        "release notes",
        "installation",
        "api reference",
        "help center",
        "related articles",
        "table of contents",
    ]

    lines = [ln.strip() for ln in low.splitlines() if ln.strip()]
    short_lines = [ln for ln in lines if len(ln) < 50]

    if len(lines) >= 6 and len(short_lines) / max(len(lines), 1) > 0.7:
        return True

    phrase_hits = sum(low.count(p) for p in bad_phrases)
    if phrase_hits >= 4:
        return True

    if len(lines) >= 5 and all(
        ln.startswith("-") or len(ln.split()) <= 5 for ln in lines[:8]
    ):
        return True

    return False


def chunk_text(text: str, max_chars: int = 1200) -> list[str]:
    paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
    chunks = []
    current = []
    current_len = 0

    for p in paragraphs:
        if current and current_len + len(p) + 1 > max_chars:
            chunks.append("\n".join(current).strip())
            current = [p]
            current_len = len(p)
        else:
            current.append(p)
            current_len += len(p) + 1

    if current:
        chunks.append("\n".join(current).strip())

    return chunks


def build_chunks_from_article(article: dict) -> list[dict]:
    chunks = []
    doc_id = article["doc_id"]
    sections = article.get("sections") or [{
        "heading": article["title"],
        "text": article["content"]
    }]

    chunk_idx = 0
    for section in sections:
        heading = section.get("heading") or article["title"]
        text = clean_text(section.get("text", ""))

        if not text:
            continue

        for piece in chunk_text(text):
            if is_bad_chunk(piece):
                continue

            chunks.append({
                "chunk_id": f"{doc_id}::chunk-{chunk_idx:03d}",
                "doc_id": doc_id,
                "article_title": article["title"],
                "article_url": article["url"],
                "category": article.get("category", ""),
                "breadcrumb": article.get("breadcrumb", []),
                "section_heading": heading,
                "content": piece,
                "source_type": article.get("source_type", "web"),
            })
            chunk_idx += 1

    return chunks


def write_jsonl(path: Path, rows: list[dict]) -> None:
    with path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def main():
    args = parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    articles_path = out_dir / "articles.jsonl"
    chunks_path = out_dir / "chunks.jsonl"
    manifest_path = out_dir / "manifest.json"

    session = requests.Session()
    session.headers.update(DEFAULT_HEADERS)

    expected_host = urlparse(args.category_url).netloc
    rp = None if args.ignore_robots else get_robot_parser(args.category_url)

    visited = set()
    queued = set([args.category_url])
    q = deque([args.category_url])

    article_urls = set()
    all_articles = []
    all_chunks = []

    while q and len(visited) < args.max_pages:
        url = q.popleft()
        queued.discard(url)

        if url in visited:
            continue
        visited.add(url)

        html = fetch_html(
            session=session,
            url=url,
            rp=rp,
            ignore_robots=args.ignore_robots,
            use_playwright=args.use_playwright,
            prefer_playwright=args.prefer_playwright,
        )

        if html is None:
            continue

        if is_article_url(url, expected_host):
            article = extract_article(url, html)
            if article:
                article["doc_id"] = f"cynet-{len(all_articles):04d}"
                all_articles.append(article)
                all_chunks.extend(build_chunks_from_article(article))
                print(f"[info] parsed article: {article['title']} ({len(article['content'])} chars)")
            else:
                print(f"[warn] failed to extract article body: {url}")
        else:
            found_articles, found_categories = discover_links(url, html, expected_host)
            for a in found_articles:
                article_urls.add(a)
                if a not in visited and a not in queued:
                    q.append(a)
                    queued.add(a)

            for c in found_categories:
                if c not in visited and c not in queued:
                    q.append(c)
                    queued.add(c)

            print(
                f"[info] scanned page: {url} | "
                f"found {len(found_articles)} article URLs, {len(found_categories)} category URLs"
            )

        time.sleep(args.sleep_seconds)

    write_jsonl(articles_path, all_articles)
    write_jsonl(chunks_path, all_chunks)

    manifest = {
        "source_category_url": args.category_url,
        "articles": len(all_articles),
        "chunks": len(all_chunks),
        "visited_pages": len(visited),
        "files": [
            "articles.jsonl",
            "chunks.jsonl",
        ],
    }

    with manifest_path.open("w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(json.dumps(manifest, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()