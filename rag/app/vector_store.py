# app/vector_store.py
# Module 13 — Class VectorStore untuk OpenSearch k-NN
import json
import os
import urllib.error
import urllib.parse
import urllib.request

try:
    import httpx
except ImportError:
    httpx = None


class _StdlibResponse:
    """Fallback response object matching httpx interface when httpx is not installed."""
    def __init__(self, status_code: int, body: bytes):
        self.status_code = status_code
        self._body = body

    def raise_for_status(self):
        if self.status_code >= 400:
            err_msg = self._body.decode("utf-8", errors="replace")
            raise RuntimeError(f"HTTP error {self.status_code}: {err_msg}")

    def json(self):
        return json.loads(self._body.decode("utf-8"))


class _StdlibClient:
    """Fallback HTTP client using Python stdlib urllib."""
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass

    def _request(self, method: str, url: str, params: dict = None, json_data: dict = None, timeout: float = 30.0):
        if params:
            qs = urllib.parse.urlencode(params)
            url = f"{url}?{qs}" if "?" not in url else f"{url}&{qs}"
        data = None
        headers = {}
        if json_data is not None:
            data = json.dumps(json_data).encode("utf-8")
            headers["Content-Type"] = "application/json"

        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return _StdlibResponse(resp.getcode(), resp.read())
        except urllib.error.HTTPError as e:
            return _StdlibResponse(e.code, e.read())

    def head(self, url: str, timeout: float = 30.0):
        return self._request("HEAD", url, timeout=timeout)

    def put(self, url: str, params: dict = None, json: dict = None, timeout: float = 30.0):
        return self._request("PUT", url, params=params, json_data=json, timeout=timeout)

    def post(self, url: str, params: dict = None, json: dict = None, timeout: float = 30.0):
        return self._request("POST", url, params=params, json_data=json, timeout=timeout)


def _get_client():
    if httpx is not None:
        return httpx.Client()
    return _StdlibClient()


class VectorStore:
    def __init__(self, base_url: str, dimension: int = 768):
        self.base_url = base_url.rstrip("/")
        self.dimension = dimension

    def ensure_index(self, index_name: str) -> None:
        with _get_client() as client:
            existing = client.head(f"{self.base_url}/{index_name}", timeout=30.0)
            if existing.status_code == 200:
                return
            response = client.put(
                f"{self.base_url}/{index_name}",
                json={
                    "settings": {"index": {"knn": True}},
                    "mappings": {
                        "properties": {
                            "text": {"type": "text"},
                            "embedding": {
                                "type": "knn_vector",
                                "dimension": self.dimension,
                                "method": {
                                    "engine": "nmslib",
                                    "space_type": "cosinesimil",
                                    "name": "hnsw",
                                },
                            },
                            "metadata": {"type": "object"},
                        }
                    },
                },
                timeout=30.0,
            )
            response.raise_for_status()

    def index_document(
        self,
        index_name: str,
        doc_id: str,
        text: str,
        embedding: list,
        metadata: dict,
    ) -> None:
        with _get_client() as client:
            response = client.put(
                f"{self.base_url}/{index_name}/_doc/{doc_id}",
                params={"refresh": "true"},
                json={"text": text, "embedding": embedding, "metadata": metadata},
                timeout=30.0,
            )
            response.raise_for_status()

    def search(
        self, index_name: str, query_embedding: list, k: int = 5
    ) -> list:
        with _get_client() as client:
            response = client.post(
                f"{self.base_url}/{index_name}/_search",
                json={
                    "size": k,
                    "query": {"knn": {"embedding": {"vector": query_embedding, "k": k}}},
                },
                timeout=30.0,
            )
            response.raise_for_status()
            data = response.json()
            return data.get("hits", {}).get("hits", [])
