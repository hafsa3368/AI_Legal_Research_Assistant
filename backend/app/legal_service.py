"""Bridge to the existing supreme_court_scraper hybrid RAG pipeline.

Keeps the two projects as separate repos: the scraper pipeline is imported
directly (not vendored/duplicated) via sys.path, and its own .env is loaded
explicitly so Neo4j/Qdrant/Ollama credentials have a single source of truth
instead of being copied into this project's .env.
"""
import re
import socket
import sys
from pathlib import Path

from dotenv import load_dotenv
from starlette.concurrency import run_in_threadpool

SCRAPER_DIR = Path(r"D:\hafsa_thesis material\supreme_court_scraper")

load_dotenv(dotenv_path=SCRAPER_DIR / ".env")
sys.path.insert(0, str(SCRAPER_DIR))

import legal_answer  # noqa: E402  (must follow the sys.path/env setup above)

_SECTION_HEADERS = [
    "LEGAL ISSUE",
    "ANSWER / SUMMARY",
    "RELEVANT LEGAL PRINCIPLES",
    "RELEVANT CASE LAW",
    "APPLICATION TO THE QUERY",
    "LIMITATIONS",
    "SOURCES CONSULTED",
]

_SECTION_SPLIT_RE = re.compile(
    r"^(" + "|".join(re.escape(h) for h in _SECTION_HEADERS) + r"):[ \t]*$",
    re.MULTILINE,
)

_KEY_BY_HEADER = {
    "LEGAL ISSUE": "legal_issue",
    "ANSWER / SUMMARY": "answer",
    "RELEVANT LEGAL PRINCIPLES": "principles",
    "RELEVANT CASE LAW": "case_law",
    "APPLICATION TO THE QUERY": "application",
    "LIMITATIONS": "limitations",
    "SOURCES CONSULTED": "sources",
}


def parse_final_answer(raw_answer: str) -> dict:
    """Splits legal_answer.py's final formatted string on its fixed,
    literal section headers (e.g. "ANSWER / SUMMARY:") into a dict of
    plain-text sections for the frontend to render as separate cards."""
    sections = {key: "" for key in _KEY_BY_HEADER.values()}
    matches = list(_SECTION_SPLIT_RE.finditer(raw_answer))
    for i, m in enumerate(matches):
        header = m.group(1)
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(raw_answer)
        key = _KEY_BY_HEADER.get(header)
        if key:
            sections[key] = raw_answer[start:end].strip()
    return sections


async def ask(query: str) -> dict:
    raw_answer, debug_info = await run_in_threadpool(
        legal_answer.answer_legal_query, query, return_debug=True
    )
    return {
        "sections": parse_final_answer(raw_answer),
        "mode": debug_info.get("mode", "unknown"),
        "raw_answer": raw_answer,
    }


def _port_open(host: str, port: int, timeout: float = 1.5) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def check_health() -> dict:
    return {
        "neo4j": _port_open("127.0.0.1", 7687),
        "qdrant": _port_open("127.0.0.1", 6333),
        "ollama": _port_open("127.0.0.1", 11434),
    }
