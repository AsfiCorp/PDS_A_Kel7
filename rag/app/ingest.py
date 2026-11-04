# app/ingest.py
# Module 14 — Simpan Dokumen ke OpenSearch
import os

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

from app.embeddings import embed_text
from app.vector_store import VectorStore


def extract_text(file_path: str) -> str:
    """Ekstraksi teks dari file .pdf atau teks biasa (.md, .txt)."""
    if file_path.endswith(".pdf"):
        if PdfReader is not None:
            reader = PdfReader(file_path)
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        return ""
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        return f.read()


def ingest_documents(
    knowledge_base_path: str,
    vector_store: VectorStore,
    index_name: str,
    ollama_base_url: str,
) -> int:
    """Index seluruh file di knowledge_base_path ke OpenSearch via VectorStore."""
    vector_store.ensure_index(index_name)
    count = 0
    if not os.path.exists(knowledge_base_path):
        return 0

    for filename in sorted(os.listdir(knowledge_base_path)):
        file_path = os.path.join(knowledge_base_path, filename)
        if not os.path.isfile(file_path) or filename.startswith("."):
            continue
        text = extract_text(file_path)
        if not text.strip():
            continue
        embedding = embed_text(text, base_url=ollama_base_url)
        if not embedding:
            continue
        vector_store.index_document(
            index_name,
            doc_id=filename,
            text=text,
            embedding=embedding,
            metadata={"source": filename},
        )
        count += 1
    return count
