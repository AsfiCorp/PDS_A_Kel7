# app/embeddings.py
# Helper untuk generate embedding nomic-embed-text via Ollama (/api/embed atau /api/embeddings)
import json
import urllib.error
import urllib.request


def embed_text(text: str, base_url: str = "http://localhost:11434", model: str = "nomic-embed-text") -> list:
    """Generate 768-dimensi embedding untuk satu teks via Ollama."""
    base_url = base_url.rstrip("/")
    # Coba endpoint baru /api/embed (Ollama >= 0.1.26)
    req = urllib.request.Request(
        f"{base_url}/api/embed",
        data=json.dumps({"model": model, "input": text}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if "embeddings" in data and data["embeddings"]:
                return data["embeddings"][0]
    except Exception:
        pass

    # Fallback endpoint lama /api/embeddings
    req_legacy = urllib.request.Request(
        f"{base_url}/api/embeddings",
        data=json.dumps({"model": model, "prompt": text}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req_legacy, timeout=60) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        return data.get("embedding", [])
