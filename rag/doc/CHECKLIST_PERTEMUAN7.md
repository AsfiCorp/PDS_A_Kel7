# Checklist Pertemuan 7 (Module 13-16) — Vector Store, Ingest, & Integrasi RAG

Dokumentasi implementasi modul lanjutan dan instruksi screenshot Pak Ilham (Mtk Dasar) serta `Panduan PDS 2.docx`.

---

## 1. Perintah Dev Tools OpenSearch (Sesuai Screenshot Pak Ilham)

Jika melakukan operasi langsung via Dev Tools OpenSearch Dashboards (http://localhost:5601):

### A. Buat Index dengan k-NN Enabled
```http
PUT nala-academic-docs
{
  "settings": { "index": { "knn": true } },
  "mappings": {
    "properties": {
      "text": { "type": "text" },
      "embedding": {
        "type": "knn_vector",
        "dimension": 768,
        "method": {
          "engine": "nmslib",
          "space_type": "cosinesimil",
          "name": "hnsw"
        }
      },
      "metadata": { "type": "object" }
    }
  }
}
```

### B. Generate Embedding via Ollama (Terminal)
```bash
curl -sS http://localhost:11434/api/embed -d '{
  "model": "nomic-embed-text",
  "input": "Presiden Pertama adalah Ir. Soekarno dari 18 Agustus 1945 sampai 12 Maret 1967"
}' | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin)['embeddings'][0]))"
```

### C. Simpan Dokumen ke OpenSearch (Dev Tools)
```http
PUT nala-academic-docs/_doc/presiden-1?refresh=true
{
  "text": "Presiden Pertama adalah Ir. Soekarno dari 18 Agustus 1945 sampai 12 Maret 1967",
  "embedding": [ ...paste array 768 angka dari Langkah B... ],
  "metadata": { "source": "manual" }
}
```

### D. Semantic Search k-NN (Dev Tools)
```http
POST nala-academic-docs/_search
{
  "size": 5,
  "query": {
    "knn": {
      "embedding": {
        "vector": [ ...paste array 768 angka query... ],
        "k": 5
      }
    }
  }
}
```

---

## 2. Checklist Modul 13 — Class `VectorStore`
File: `app/vector_store.py`
- [x] Class `VectorStore(base_url, dimension=768)` tersedia.
- [x] Method `ensure_index(index_name)` idempotent (cek via `HEAD`, return jika sudah 200, aman dipanggil berkali-kali).
- [x] Method `index_document(index_name, doc_id, text, embedding, metadata)` mendukung `refresh=true` (dokumen langsung siap di-query).
- [x] Method `search(index_name, query_embedding, k=5)` mengembalikan daftar `hits` dari k-NN query.
- [x] Mendukung `httpx` jika terinstall, dengan graceful fallback ke Python stdlib `urllib` (zero-dependency).

Uji di container / host:
```bash
python3 -c "
from app.vector_store import VectorStore
vs = VectorStore('http://localhost:9200')
print('VectorStore siap:', vs.dimension)
"
```

---

## 3. Checklist Modul 14 — Simpan Dokumen ke OpenSearch
File: `app/ingest.py`
- [x] `extract_text(file_path)` mengekstrak isi teks file (`.md`, `.txt`, `.pdf`).
- [x] `ingest_documents(kb_path, vector_store, index_name, ollama_url)` membaca semua dokumen di `knowledge-base/`, generate embedding 768-dimensi via Ollama, dan index ke OpenSearch.
- [x] `doc_id = filename` menjamin sifat idempotent overwrite (tidak terjadi duplikasi dokumen saat re-ingest).
- [x] Knowledge base tersedia di folder `knowledge-base/`:
  - `presiden-indonesia.md` (Presiden ke-1 s/d ke-8 Prabowo Subianto).
  - `sop-cuti-akademik.md` (SOP permohonan cuti kuliah).
  - `sop-pendaftaran-krs.md` (SOP KRS online).

Perintah ingest via script:
```bash
python3 rag_engine.py --ingest-opensearch
```

---

## 4. Checklist Modul 15 — Konsep Semantic Search (Cosine vs L2 vs Dot Product)
- [x] Memahami 3 metrik kemiripan:
  - **Cosine Similarity**: Mengukur sudut vektor $\cos(\theta) = \frac{A \cdot B}{\|A\| \|B\|}$.
  - **L2 Distance (Euclidean)**: Mengukur jarak fisik $\|A - B\| = \sqrt{\sum (A_i - B_i)^2}$.
  - **Dot Product**: Mengukur hasil kali titik $\sum A_i B_i$.
- [x] Pembuktian unit vector: Model `nomic-embed-text` menghasilkan vektor ternormalisasi ($\|A\| = \|B\| = 1.0$).
  Secara aljabar:
  - $\text{dot}(A, B) = \text{cosine}(A, B)$
  - $L2(A, B)^2 = 2 - 2 \times \text{cosine}(A, B)$
  Karena ketiganya terhubung secara monoton, **urutan ranking dokumen identik di ketiga metrik**. Mengganti `space_type` tidak mengubah ranking.
- [x] Temuan Ranking Masalah $k$: Dokumen pendek berulang ("Presiden Ke-X adalah...") memiliki kemiripan struktur tinggi sehingga memadatkan skor cosine (0.68 - 0.73), menyebabkan dokumen SOP berada di urutan #4.
- [x] Solusi: Penaikan nilai `RAG_TOP_K` dari `3` menjadi `5` sebagai mitigasi cepat agar dokumen peringkat #4 ikut tersaring.

---

## 5. Checklist Modul 16 — Integrasi RAG ke Chatbot & Engine
- [x] `RAG_TOP_K` dinaikkan ke **`5`** di `rag_engine.py`, `docker-compose.yml`, dan `Dockerfile.rag`.
- [x] `OPENSEARCH_INDEX` dikonfigurasi ke `nala-academic-docs` (sesuai instruksi Pak Ilham).
- [x] `query(q, top_k=5)` di `rag_engine.py` otomatis memanggil `VectorStore.search()` ke OpenSearch jika aktif, dan menyediakan fallback otomatis ke in-memory jika OpenSearch dimatikan.
- [x] Endpoint chat dan proxy nginx tetap stabil tanpa breaking change.

---

## 6. Verifikasi & Pengujian Otomatis

Jalankan test suite mandiri:
```bash
python3 test_modules_13_16.py
```
Hasil: `Ran 4 tests in 0.015s ... OK`.

### Hasil Verifikasi Live Container (E2E)

1. **Status Seluruh Container (`docker compose ps`):**
   - `duoai-ollama`: UP (healthy)
   - `duoai-opensearch`: UP (port 9200)
   - `duoai-opensearch-dashboards`: UP (port 5601)
   - `duoai-rag`: UP (port 8000)
   - `duoai-web`: UP (port 8080)

2. **Ingest ke OpenSearch:**
   ```bash
   docker compose exec rag python3 rag_engine.py --ingest-opensearch
   ```
   Output: `[rag] Ingest selesai: 3 dokumen ter-index ke 'nala-academic-docs'.`

3. **Query Uji 1 (Cuti Akademik):**
   ```bash
   curl -s -X POST http://localhost:8080/rag/query -H "Content-Type: application/json" -d '{"query": "Bagaimana prosedur permohonan cuti akademik?", "top_k": 5}'
   ```
   Output:
   - `engine`: `"opensearch"`
   - Top source: `"sop-cuti-akademik.md"` (score: `0.8395`)

4. **Query Uji 2 (Presiden Indonesia):**
   ```bash
   curl -s -X POST http://localhost:8080/rag/query -H "Content-Type: application/json" -d '{"query": "Siapa presiden ketujuh Indonesia?", "top_k": 5}'
   ```
   Output:
   - `engine`: `"opensearch"`
   - Top source: `"presiden-indonesia.md"` (score: `0.8299`)

5. **Query Uji 3 (Pendaftaran KRS):**
   ```bash
   curl -s -X POST http://localhost:8080/rag/query -H "Content-Type: application/json" -d '{"query": "Bagaimana cara pendaftaran KRS?", "top_k": 5}'
   ```
   Output:
   - `engine`: `"opensearch"`
   - Top source: `"sop-pendaftaran-krs.md"` (score: `0.7766`)
