#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DuoAI RAG Engine — retrieval-augmented context untuk DuoAI Copilot.
Embedding: nomic-embed-text via Ollama (/api/embed, fallback /api/embeddings).
100% stdlib Python (tanpa pip), sesuai prinsip zero-dependency DuoWallet.

Perintah:
  python3 rag_engine.py --serve      # bangun index lalu serve HTTP :8000
  python3 rag_engine.py --selftest   # uji retrieval (butuh Ollama + nomic-embed-text)
  python3 rag_engine.py --rebuild    # paksa bangun ulang index embedding
"""
import hashlib
import json
import math
import os
import re
import sys
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib import request as urlreq

try:
    sys.stdout.reconfigure(line_buffering=True)
except Exception:
    pass

from app.vector_store import VectorStore
from app.ingest import ingest_documents

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
EMBED_MODEL = os.environ.get("EMBED_MODEL", "nomic-embed-text")
# Module 12-16: OpenSearch VectorStore
OPENSEARCH_BASE_URL = os.environ.get("OPENSEARCH_BASE_URL", "")
OPENSEARCH_INDEX = os.environ.get("OPENSEARCH_INDEX", "nala-academic-docs")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KB_DIR = os.environ.get("KB_DIR", BASE_DIR)
# Module 15 & 16: dinaikkan ke 5 karena top-3 terlalu kecil (dokumen SOP kalah tipis dari kalimat pendek presiden)
TOP_K = int(os.environ.get("RAG_TOP_K", "5"))
MAX_CHUNK = 800
BATCH = 32
CACHE = os.path.join(BASE_DIR, ".rag_index_cache.json")

_vector_store = VectorStore(base_url=OPENSEARCH_BASE_URL) if OPENSEARCH_BASE_URL else None

_MD_DOCS = ["PANDUAN_PENGGUNA.md", "JOBDESK.md", "LAPORAN_STRATEGI_TRAINING_DUOAI.md"]
_JSONL_DOCS = ["duoai_training_dataset.jsonl"]

_chunks = []
_vectors = []
_ready = False


def _split_md(text, source):
    """Pecah markdown per heading (## dst), lalu per paragraf ~MAX_CHUNK karakter."""
    lines = text.splitlines()
    sections, title, buf = [], "pendahuluan", []
    for ln in lines:
        if re.match(r"^#{1,3} ", ln):
            if buf:
                sections.append((title, "\n".join(buf)))
            title, buf = ln.lstrip("# ").strip(), [ln]
        else:
            buf.append(ln)
    if buf:
        sections.append((title, "\n".join(buf)))

    out = []
    for sec_title, body in sections:
        paras, pbuf, size = [], [], 0
        for p in body.split("\n\n"):
            if size + len(p) > MAX_CHUNK and pbuf:
                paras.append("\n\n".join(pbuf))
                pbuf, size = [], 0
            pbuf.append(p)
            size += len(p)
        if pbuf:
            paras.append("\n\n".join(pbuf))
        for i, para in enumerate(paras):
            tag = f"{source} > {sec_title}" + (f" (bagian {i + 1})" if len(paras) > 1 else "")
            out.append({"text": f"[{tag}]\n{para}", "source": tag})
    return out


def _split_jsonl(path, source):
    """Pecah dataset ChatML menjadi chunk FAQ Q/A."""
    out = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except ValueError:
                continue
            msgs = rec.get("messages", [])
            u = next((m.get("content", "") for m in msgs if m.get("role") == "user"), "")
            a = next((m.get("content", "") for m in msgs if m.get("role") == "assistant"), "")
            if u and a:
                cat = rec.get("category", "umum")
                text = f"[FAQ {cat}] Tanya: {u}\nJawab: {a}"[: MAX_CHUNK + 200]
                out.append({"text": text, "source": f"{source}#{cat}"})
    return out


def _post(path, payload, timeout=120):
    req = urlreq.Request(
        OLLAMA_HOST.rstrip("/") + path,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    with urlreq.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def embed_texts(texts):
    """Embed daftar teks via /api/embed (batch), fallback per-item /api/embeddings."""
    embs = []
    for i in range(0, len(texts), BATCH):
        part = texts[i : i + BATCH]
        got = None
        try:
            res = _post("/api/embed", {"model": EMBED_MODEL, "input": part})
            e = res.get("embeddings")
            if e and len(e) == len(part):
                got = e
        except Exception:
            got = None
        if got is None:
            got = []
            for t in part:
                try:
                    res = _post("/api/embeddings", {"model": EMBED_MODEL, "prompt": t[:2000]})
                    got.append(res.get("embedding") or [])
                except Exception:
                    got.append([])
        embs.extend(got)
    return embs


def _cos(a, b):
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    return dot / (na * nb) if na and nb else 0.0


def build_index(force=False):
    """Bangun (atau muat dari cache) index vektor seluruh knowledge base."""
    global _chunks, _vectors, _ready
    chunks = []
    # 1. Dokumen JSONL
    for name in _JSONL_DOCS:
        for folder in [KB_DIR, BASE_DIR]:
            p = os.path.join(folder, name)
            if os.path.exists(p):
                chunks += _split_jsonl(p, name)
                break
    # 2. Dokumen akademik di knowledge-base/ (Module 10-16: presiden-indonesia, sop-cuti, sop-krs)
    kb_folder = os.path.join(BASE_DIR, "knowledge-base") if os.path.isdir(os.path.join(BASE_DIR, "knowledge-base")) else KB_DIR
    if os.path.isdir(kb_folder):
        for fname in sorted(os.listdir(kb_folder)):
            if fname.endswith(".md"):
                fp = os.path.join(kb_folder, fname)
                with open(fp, encoding="utf-8") as f:
                    chunks += _split_md(f.read(), fname)
    # 3. Fallback dokumen panduan DuoAI jika knowledge-base tidak ditemukan
    if not chunks:
        for name in _MD_DOCS:
            for folder in [KB_DIR, BASE_DIR, os.path.join(BASE_DIR, "doc")]:
                p = os.path.join(folder, name)
                if os.path.exists(p):
                    with open(p, encoding="utf-8") as f:
                        chunks += _split_md(f.read(), name)
                    break

    if not chunks:
        print("[rag] PERINGATAN: tidak ada dokumen knowledge base ditemukan")
        return False

    # Sidik jari isi KB: dokumen bisa di-edit (bind mount) tanpa jumlah chunk berubah.
    sig = hashlib.md5("\x00".join(ch["text"] for ch in chunks).encode("utf-8")).hexdigest()

    if not force and os.path.exists(CACHE):
        try:
            with open(CACHE, encoding="utf-8") as f:
                c = json.load(f)
            if c.get("model") == EMBED_MODEL and c.get("sig") == sig:
                _chunks, _vectors, _ready = c["chunks"], c["vectors"], True
                print(f"[rag] index dimuat dari cache: {len(_chunks)} chunk")
                return True
        except Exception:
            pass

    t0 = time.time()
    _chunks = chunks
    _vectors = embed_texts([c["text"] for c in chunks])
    ok = all(len(v) > 0 for v in _vectors)
    _ready = ok
    if ok:
        try:
            with open(CACHE, "w", encoding="utf-8") as f:
                json.dump({"model": EMBED_MODEL, "sig": sig, "chunks": _chunks, "vectors": _vectors}, f)
        except Exception:
            pass
    print(f"[rag] index dibangun: {len(_chunks)} chunk dalam {time.time() - t0:.1f}s (ready={ok})")
    return ok


def query(q, top_k=TOP_K):
    """Retrieve top-k chunk paling relevan untuk pertanyaan q via OpenSearch k-NN (fallback: in-memory)."""
    qv = embed_texts([q])[0]

    # Module 16: coba retrieval lewat OpenSearch VectorStore jika tersedia
    if _vector_store:
        try:
            hits = _vector_store.search(OPENSEARCH_INDEX, qv, k=top_k)
            if hits:
                parts, sources = [], []
                for h in hits:
                    src = h.get("_source", {})
                    text = src.get("text", "")
                    meta = src.get("metadata", {})
                    source_name = meta.get("source", h.get("_id", "opensearch"))
                    score = h.get("_score", 0.0)
                    if text:
                        parts.append(text)
                        sources.append({"source": source_name, "score": round(score, 4)})
                if parts:
                    return {"context": "\n\n---\n\n".join(parts), "sources": sources, "engine": "opensearch"}
        except Exception as e:
            # OpenSearch tidak aktif / belum ter-index, lanjut fallback in-memory
            pass

    if not _ready:
        return {"context": "", "sources": []}

    scored = sorted(((_cos(qv, v), i) for i, v in enumerate(_vectors)), reverse=True)
    parts, sources = [], []
    for score, i in scored[: max(1, min(top_k, 8))]:
        if score <= 0.0:
            continue
        parts.append(_chunks[i]["text"])
        sources.append({"source": _chunks[i]["source"], "score": round(score, 4)})
    return {"context": "\n\n---\n\n".join(parts), "sources": sources, "engine": "in-memory"}


class Handler(BaseHTTPRequestHandler):
    def _send(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send(204, {})

    def do_GET(self):
        if self.path in ("/", "/health"):
            self._send(200, {"status": "ok", "ready": _ready, "chunks": len(_chunks), "embed_model": EMBED_MODEL})
        else:
            self._send(404, {"error": "not found"})

    def do_POST(self):
        if self.path != "/query":
            self._send(404, {"error": "not found"})
            return
        try:
            n = int(self.headers.get("Content-Length", 0) or 0)
            payload = json.loads(self.rfile.read(n).decode("utf-8") or "{}")
        except Exception:
            self._send(400, {"error": "bad json"})
            return
        q = (payload.get("query") or "").strip()
        k = int(payload.get("top_k") or TOP_K)
        if not q:
            self._send(400, {"error": "query kosong"})
            return
        self._send(200, query(q, k))

    def log_message(self, fmt, *args):
        print("[rag-http]", fmt % args)


def selftest():
    assert build_index(force=False), "index gagal dibangun (Ollama/nomic-embed-text siap?)"
    for q in [
        "Bagaimana cara melunasi utang Dimas lewat Settle Up?",
        "Apa itu Safe-to-Spend dan bagaimana dihitung?",
        "Bagaimana mencatat pengeluaran lewat DuoAI?",
    ]:
        r = query(q, 2)
        assert r["sources"], f"retrieval kosong untuk: {q}"
        print(f"Q: {q}\n  Top-1: {r['sources'][0]}")
    print("SELFTEST OK")


def ingest_opensearch():
    url = OPENSEARCH_BASE_URL or "http://localhost:9200"
    vs = VectorStore(base_url=url)
    kb = os.path.join(BASE_DIR, "knowledge-base") if os.path.isdir(os.path.join(BASE_DIR, "knowledge-base")) else BASE_DIR
    print(f"[rag] Memulai ingest dokumen dari '{kb}' ke OpenSearch '{OPENSEARCH_INDEX}' ({url}) ...")
    count = ingest_documents(kb, vs, OPENSEARCH_INDEX, OLLAMA_HOST)
    print(f"[rag] Ingest selesai: {count} dokumen ter-index ke '{OPENSEARCH_INDEX}'.")


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        selftest()
    elif "--rebuild" in sys.argv:
        build_index(force=True)
    elif "--ingest-opensearch" in sys.argv:
        ingest_opensearch()
    else:
        while not build_index():
            print("[rag] Ollama belum siap, mencoba lagi dalam 10 detik ...")
            time.sleep(10)
        port = int(os.environ.get("RAG_PORT", "8000"))
        print(f"[rag] layanan RAG berjalan di port {port} (model embed: {EMBED_MODEL})")
        ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()
