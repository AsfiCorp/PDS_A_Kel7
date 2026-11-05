# PANDUAN LENGKAP & ENSIKLOPEDIA TEKNIS: MASTER RAG, OPENSEARCH, & SLM ON-DEVICE
### Dokumen Rahasia Penguasaan Materi, Bedah File Menyeluruh, Pertahanan Ujian Sidang, & Matriks Hafalan Jobdesk

---

## DAFTAR ISI UTAMA
1. **BAB 1: Mental Model, Aljabar Vektor, & Filosofi RAG**
   - 1.1 Masalah Terbesar LLM Standar (Knowledge Cutoff & Halusinasi)
   - 1.2 Mengapa Bukan Fine-Tuning? (Analogi Ujian & Komparasi Biaya)
   - 1.3 Lexical Search (BM25 / SQL LIKE) vs Semantic Vector Search (k-NN)
   - 1.4 Aljabar Vektor: Pembuktian Matematis 3 Metrik (Cosine, L2, Dot Product)
   - 1.5 Teorema Unit Vector & Identitas Ranking pada `nomic-embed-text`
   - 1.6 Fenomena Cosine Score Cramping & Mitigasi Top-K (Module 15 & 16)
2. **BAB 2: Arsitektur Sistem, Topologi Jaringan, & Alur Data End-to-End**
   - 2.1 Diagram Topologi Jaringan & Data Flow Inter-Container
   - 2.2 Bedah 5 Port Jaringan Vital (8080, 8000, 9200, 5601, 11434)
   - 2.3 Trik Penyelamat Sidang: Dual-Priority Upstream Nginx (Metal GPU vs CPU)
   - 2.4 Same-Origin Proxying & Eliminasi Masalah CORS
3. **BAB 3: Bedah Tuntas Seluruh File Proyek (Line-by-Line & Komprehensif)**
   - 3.1 Sub-Sistem RAG Backend & Engine (`rag_engine.py`, `app/vector_store.py`, `app/embeddings.py`, `app/ingest.py`, `app/__init__.py`)
   - 3.2 Sub-Sistem Infrastruktur & Kontainer (`docker-compose.yml`, `docker/Dockerfile.rag`, `docker/nginx.conf`, `docker/init-ollama.sh`, `doc/Modelfile`)
   - 3.3 Sub-Sistem Dataset Sintetis & Pengujian (`generate_dataset.py`, `duoai_training_dataset.jsonl`, `test_modules_13_16.py`, `test_inference_prompt.py`, `benchmark_raw.json`, `doc/laporan_benchmark_model.md`)
   - 3.4 Sub-Sistem Basis Pengetahuan (`knowledge-base/*`, `doc/PANDUAN_PENGGUNA.md`, `doc/JOBDESK.md`, `doc/LAPORAN_STRATEGI_TRAINING_DUOAI.md`)
   - 3.5 Sub-Sistem Antarmuka Pengguna & State Engine (`websitekeuangan-v2/*`)
4. **BAB 4: Simulasi Live Coding Defense (10 Skenario Modifikasi Spontan Dosen)**
5. **BAB 5: Bank Tanya-Jawab "Pembantaian" Sidang (35 Killer Q&A Berbobot Tinggi)**
6. **BAB 6: Matriks Hafalan Wajib & Kisi-Kisi Ujian per Jobdesk (CRISP-DM Roles)**

---

## BAB 1: MENTAL MODEL, ALJABAR VEKTOR, & FILOSOFI RAG

### 1.1 Masalah Terbesar LLM Standar
LLM/SLM seperti LLaMA 3.2 memiliki tiga limitasi fundamental:
1. **Knowledge Cutoff & Amnesia Data Internal**: Model hanya pintar sampai tanggal batas pelatihan data publik. Ia tidak mengetahui regulasi SOP internal kampus terbaru atau saldo dompet pengguna di perangkat lokal.
2. **Halusinasi Stokastik**: LLM adalah mesin probabilitas token. Saat ditanya fakta yang tidak ada di bobotnya, ia tidak menolak melainkan mengarang narasi fiktif yang terdengar sangat meyakinkan.
3. **Context Window & Attention Overhead**: Mengirim seluruh dokumen ke dalam prompt memperlambat komputasi kuadratik ($O(N^2)$) dan memicu fenomena *Lost in the Middle*.

### 1.2 Mengapa Bukan Fine-Tuning? (Pertanyaan Jebakan Sidang)
*Dosen Penguji:* *"Kenapa tidak di-fine-tuning saja dengan data SOP dan keuangan?"*  
*Jawaban Mantap:*  
> *"Fine-tuning ibarat menyuruh calon dokter menghafal jutaan jadwal piket baru dengan sekolah berbulan-bulan. Biayanya mahal dan jika jadwal berubah besok pagi, ia harus sekolah ulang dari nol.*  
> *Sedangkan **RAG (Retrieval-Augmented Generation)** adalah **Open-Book Exam**: LLM diberi kemampuan menalar bahasa, lalu saat ujian kita meletakkan lembaran SOP dan mutasi saldo terbaru dari OpenSearch di hadapannya. Fakta dapat diupdate seketika (0 detik retrain) hanya dengan mengindeks dokumen baru."*

### 1.3 Lexical Search (BM25 / SQL LIKE) vs Semantic Vector Search (k-NN)
- **Lexical / Syntactic (BM25 / SQL LIKE)**: Hanya mencocokkan string persis. Jika dokumen menulis *"Penghentian Sementara Studi"* tetapi mahasiswa mencari *"izin cuti kuliah"*, hasil pencarian bernilai **0 (NOL)** karena tidak ada kesamaan kata.
- **Semantic Vector Search (k-NN)**: Teks diubah menjadi koordinat 768 dimensi. Kalimat *"penghentian sementara studi"* dan *"izin cuti kuliah"* memiliki arah vektor yang berdekatan dalam ruang makna, sehingga dokumen ditemukan dengan akurat tanpa memerlukan kesamaan kata persis.

### 1.4 Aljabar Vektor: 3 Metrik Kemiripan (Modul 15)
Dalam ruang $\mathbb{R}^{768}$, kedekatan query $A$ dan dokumen $B$ diukur melalui:
1. **Cosine Similarity**: $\cos(\theta) = \frac{A \cdot B}{\|A\| \|B\|}$ (Rentang 0.0 - 1.0 pada embedding teks, mengukur kemiringan sudut).
2. **Euclidean Distance (L2)**: $\|A - B\| = \sqrt{\sum (A_i - B_i)^2}$ (Jarak geometris lurus, 0.0 = identik).
3. **Dot Product (Inner Product)**: $A \cdot B = \sum A_i B_i$.

### 1.5 Teorema Unit Vector & Identitas Ranking pada `nomic-embed-text`
Model `nomic-embed-text` menghasilkan vektor ternormalisasi L2 ($\|A\| = \|B\| = 1.0$).  
Maka secara matematis:
$$\text{Cosine}(A, B) = \frac{A \cdot B}{1 \times 1} = \text{Dot}(A, B)$$
$$L_2(A, B)^2 = \|A\|^2 + \|B\|^2 - 2(A \cdot B) = 2 - 2 \cdot \text{Cosine}(A, B) \implies L_2(A, B) = \sqrt{2 - 2 \cdot \text{Cosine}(A, B)}$$
Karena $L_2$ adalah transformasi monoton turun yang berbanding lurus negatif terhadap Cosine, **urutan ranking dokumen ke-1 sampai ke-N terbukti 100% IDENTIK di ketiga metrik**!

### 1.6 Fenomena Cosine Score Cramping & Mitigasi Top-K
Pada dokumen pendek berulang (misal riwayat presiden), skor cosine memadat di angka 0.68 - 0.73, sehingga dokumen SOP akademik terancam terdorong ke posisi #4. Untuk menjamin dokumen yang relevan selalu terbawa ke konteks LLM, parameter `RAG_TOP_K` ditingkatkan dari **`3` ke `5`** (Modul 15 & 16).


---

## BAB 2: ARSITEKTUR SISTEM, TOPOLOGI JARINGAN, & ALUR DATA END-TO-END

### 2.1 Diagram Topologi Jaringan & Data Flow Inter-Container
```
                   [ PENGGUNA / BROWSER CLIENT ]
                                 │
                 (1) HTTP Request: http://localhost:8080
                                 ▼
      ═══════════════════════════════════════════════════════════════
      [ PORT 8080 : NGINX REVERSE PROXY CONTAINER (duoai-web) ]
      ═══════════════════════════════════════════════════════════════
         │                           │                          │
         │ (A) Static Assets         │ (B) Proxy /rag/query     │ (C) Proxy /api/chat
         │     (/, *.html, *.js)     │                          │
         ▼                           ▼                          ▼
  [ /usr/share/nginx/html ]  [ PORT 8000 : RAG ENGINE ]   [ OLLAMA BACKEND ROUTER ]
  (websitekeuangan-v2)       (duoai-rag / Python 100%    (Nginx Upstream Balancer)
                             Stdlib HTTP Service)               │
                                     │                          ├──> Prioritas 1: host.docker.internal:11434
                                     │                          │    (Ollama di Mac Host - GPU Metal Aktif!)
                                     ├──> (i) Embedding Query   │
                                     │    (POST /api/embed)     └──> Prioritas 2 (Fallback): duoai-ollama:11434
                                     │    ke Ollama Backend          (Container Docker - CPU Emulation)
                                     │                          
                                     └──> (ii) k-NN Search      
                                          (POST /_search)       
                                          ke OpenSearch         
                                                │
                                                ▼
                                  [ PORT 9200 : OPENSEARCH ]
                                  (duoai-opensearch k-NN)
                                  - Index: nala-academic-docs
                                  - Algoritma: HNSW nmslib
                                  - Dimensi: 768 Float32
                                                │
                                  [ PORT 5601 : DASHBOARDS ]
                                  (duoai-opensearch-dashboards)
                                  - Dev Tools & Indeks Visualizer
```

### 2.2 Bedah 5 Port Jaringan Vital (Wajib Hafal untuk Semua Anggota!)
1. **Port 8080 (`duoai-web`)**:
   - Kontainer Nginx Alpine. Merupakan gerbang tunggal (*Single Entrypoint*) bagi pengguna. Mengarahkan request file web UI dan memproksikan panggilan API ke backend internal.
2. **Port 8000 (`duoai-rag`)**:
   - Layanan mikro RAG Engine mandiri berbasis Python 3.9 Standard Library (`ThreadingHTTPServer` & `BaseHTTPRequestHandler`). Bertugas memproses query pencarian, berkoordinasi dengan model embedding, dan mengeksekusi k-NN search ke OpenSearch (atau fallback in-memory).
3. **Port 9200 (`duoai-opensearch`)**:
   - REST API OpenSearch Database (versi 2.11.0). Melayani pengindeksan dokumen vektor 768 dimensi dan pencarian tetangga terdekat (k-NN) berbasis graf HNSW nmslib.
4. **Port 5601 (`duoai-opensearch-dashboards`)**:
   - Antarmuka grafis web (GUI) OpenSearch. Digunakan untuk memeriksa status cluster (*green*), mengecek jumlah dokumen, dan mengeksekusi query manual k-NN via tab *Dev Tools Console*.
5. **Port 11434 (`duoai-ollama` / Host Mac Ollama)**:
   - Server inferensi model bahasa lokal (*Local SLM Runtime*). Menjalankan model `llama3.2:3b` (atau custom model `duoai-copilot`) untuk penalaran teks dan model `nomic-embed-text` untuk kalkulasi vektor 768 dimensi.

### 2.3 Trik Penyelamat Sidang: Dual-Priority Upstream Nginx (Metal GPU vs CPU)
Konfigurasi cerdas pada `docker/nginx.conf`:
```nginx
upstream ollama_backend {
    server host.docker.internal:11434; # Prioritas 1: GPU Apple Silicon Mac Host
    server ollama:11434 backup;        # Prioritas 2 (Cadangan): CPU Docker Container
}
```
*Mengapa ini menyelamatkan presentasi?*
Di laptop macOS (Apple Silicon M1/M2/M3/M4), Docker berjalan di dalam VM Linux yang tidak memiliki akses GPU Metal. Jika Ollama berjalan di container CPU Docker, 1 respon memakan waktu **45 - 120 detik**! Melalui upstream `host.docker.internal:11434`, inferensi dialihkan langsung ke Ollama host Mac yang didukung Metal GPU. Respon muncul hanya dalam **1 - 2 detik** di depan penguji!

### 2.4 Same-Origin Proxying & Eliminasi Masalah CORS
Browser menerapkan *Same-Origin Policy*. Memanggil port berbeda (8080 ke 11434 atau 8000) akan memicu galat CORS (*Cross-Origin Resource Sharing*). Melalui Nginx, rute `/api/` dan `/rag/` diproksikan ke port internal masing-masing kontainer, sehingga bagi browser seluruh interaksi berasal dari satu origin yang sama (`localhost:8080`). CORS tereliminasi secara bersih!

---

## BAB 3: BEDAH TUNTAS SELURUH FILE PROYEK (LINE-BY-LINE)

### 3.1 Sub-Sistem RAG Backend & Engine

#### 1. Berkas: `rag_engine.py` (Zero-Dependency RAG Microservice)
* **Lokasi**: `/Volumes/ssd atha/rag/rag_engine.py`
* **Peran Penanggung Jawab**: **Data Engineer (DE) & ML Engineer (MLE)**
* **Fungsi Utama**: Layanan HTTP mandiri berbasis 100% Python Standard Library (menggunakan `ThreadingHTTPServer` dan `BaseHTTPRequestHandler`, TANPA dependensi eksternal FastAPI/Flask). Menyediakan endpoint `/query` untuk retrieval cerdas dan `/health` untuk monitoring.
* **Fitur & Mekanisme Internal**:
  1. **Dual Retrieval Engine (OpenSearch + Fallback In-Memory)**:
     - Jika OpenSearch aktif (`OPENSEARCH_BASE_URL`), sistem memanggil class `VectorStore.search()` ke OpenSearch index `nala-academic-docs`.
     - Jika OpenSearch non-aktif/mati, sistem secara otomatis beralih (*graceful fallback*) ke pencarian vektor in-memory menggunakan cache `.rag_index_cache.json` dengan kalkulasi cosine similarity internal.
  2. **Parsing & Chunking Cerdas**:
     - `_split_md(text, source)`: Memecah dokumen Markdown berdasarkan heading (`#`, `##`, `###`), lalu membaginya menjadi potongan paragraf dengan batas `MAX_CHUNK = 800` karakter. Menambahkan tag sumber eksplisit seperti `[presiden-indonesia.md > Presiden Ke-1]`.
     - `_split_jsonl(path, source)`: Mengurai dataset dialog ChatML menjadi pasangan FAQ tanya-jawab atomic.
  3. **Multi-Threaded HTTP Server**:
     - Menerima POST request JSON `{ "query": "...", "top_k": 5 }`.
     - Mengembalikan payload: `{ "context": "...", "sources": [...], "engine": "opensearch" | "in-memory" }`.
* **Kode Kunci**:
  ```python
  # Zero-dependency HTTP Server & CORS Header Handling
  class Handler(BaseHTTPRequestHandler):
      def _send(self, code, obj):
          body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
          self.send_response(code)
          self.send_header("Content-Type", "application/json; charset=utf-8")
          self.send_header("Access-Control-Allow-Origin", "*")
          self.end_headers()
          self.wfile.write(body)

      def do_POST(self):
          if self.path == "/query":
              # Baca payload, panggil query(q, k), dan kirim respons
              self._send(200, query(q, k))
  ```

#### 2. Berkas: `app/vector_store.py` (Klien OpenSearch k-NN Mandiri)
* **Lokasi**: `/Volumes/ssd atha/rag/app/vector_store.py`
* **Peran Penanggung Jawab**: **Data Engineer (DE)**
* **Fungsi Utama**: Abstraksi kelas `VectorStore` untuk berinteraksi dengan REST API OpenSearch tanpa library pihak ketiga. Jika `httpx` tersedia ia menggunakannya, jika tidak, ia mengaktifkan `_StdlibClient` bawaan Python `urllib`.
* **Logika Metode Kunci**:
  1. `ensure_index(index_name)`: Bersifat **idempotent**. Mengecek keberadaan index via HTTP `HEAD`. Jika belum ada (404), membuat index baru dengan setting `index.knn: true`, tipe `knn_vector`, `dimension: 768`, method `hnsw`, engine `nmslib`, dan metrik `cosinesimil`.
  2. `index_document(index_name, doc_id, text, embedding, metadata)`: Menyimpan dokumen via `PUT /_doc/{doc_id}?refresh=true`. Parameter `refresh=true` menjamin dokumen langsung dapat dicari secara instan.
  3. `search(index_name, query_embedding, k=5)`: Melakukan k-NN query ke OpenSearch via `POST /_search` dengan payload `{"query": {"knn": {"embedding": {"vector": q, "k": k}}}}`.
* **Kode Kunci**:
  ```python
  class VectorStore:
      def __init__(self, base_url: str, dimension: int = 768):
          self.base_url = base_url.rstrip("/")
          self.dimension = dimension

      def search(self, index_name: str, query_embedding: list, k: int = 5) -> list:
          with _get_client() as client:
              resp = client.post(
                  f"{self.base_url}/{index_name}/_search",
                  json={"size": k, "query": {"knn": {"embedding": {"vector": query_embedding, "k": k}}}},
                  timeout=30.0
              )
              resp.raise_for_status()
              return resp.json().get("hits", {}).get("hits", [])
  ```

#### 3. Berkas: `app/embeddings.py` (Penghasil Vektor Embedding)
* **Lokasi**: `/Volumes/ssd atha/rag/app/embeddings.py`
* **Peran Penanggung Jawab**: **ML Engineer (MLE)**
* **Fungsi Utama**: Menghubungi server Ollama untuk mengubah teks kalimat menjadi vektor 768-D.
* **Logika Kunci**:
  - Mendukung endpoint modern Ollama `/api/embed` (Ollama v0.1.26+) dengan payload `{"model": "nomic-embed-text", "input": text}`.
  - Memiliki mekanisme pertahanan (*graceful fallback*) ke endpoint warisan `/api/embeddings` jika versi Ollama lebih lama.
  - Mengembalikan list 768 angka desimal Float32 ternormalisasi.

#### 4. Berkas: `app/ingest.py` (Pipeline Ekstraksi & Ingestion)
* **Lokasi**: `/Volumes/ssd atha/rag/app/ingest.py`
* **Peran Penanggung Jawab**: **Data Engineer (DE)**
* **Fungsi Utama**: Membaca dokumen dari direktori `knowledge-base/`, mengekstrak teksnya, meminta vektor embedding, lalu memasukkannya ke OpenSearch.
* **Fitur Penting**:
  - `extract_text(file_path)`: Mendukung dokumen `.md` dan `.txt` secara native. Mendukung file `.pdf` jika modul `pypdf` terpasang (jika tidak ada, fallback graceful).
  - `ingest_documents(...)`: Menggunakan `doc_id = filename` sehingga proses ingestion bersifat **idempotent overwrite** (dijalankan berulang kali tidak membuat dokumen duplikat).

#### 5. Berkas: `app/__init__.py`
* **Lokasi**: `/Volumes/ssd atha/rag/app/__init__.py`
* **Fungsi**: Menandai folder `app` sebagai package Python standar agar module `app.vector_store`, `app.embeddings`, dan `app.ingest` dapat di-import secara bersih.


---

---

### 3.2 Sub-Sistem Infrastruktur & Kontainer

#### 1. Berkas: `docker-compose.yml` (Orkestrator Multi-Container)
* **Lokasi**: `/Volumes/ssd atha/rag/docker-compose.yml`
* **Peran Penanggung Jawab**: **ML Engineer (MLE) & Data Engineer (DE)**
* **Fungsi Utama**: Mendefinisikan dan menghubungkan 5 layanan kontainer:
  - `web` (Nginx Alpine): Port `8080:80`, melayani web statis dan reverse proxy.
  - `rag` (Python 3.9 Slim): Port internal 8000, bind-mount ke kode RAG dan dokumen KB.
  - `ollama` (Ollama Official): Menjalankan inferensi dan model embedding di port 11434.
  - `opensearch` (Profil opsional `profiles: [opensearch]`): Image OpenSearch 2.11.0, port 9200, single-node cluster, keamanan dinonaktifkan (`plugins.security.disabled=true`), heap memori `-Xms512m -Xmx512m`.
  - `opensearch-dashboards`: GUI port 5601 untuk Dev Tools dan monitoring.
* **Volume Persistent**: `ollama_models` (agar model AI tidak perlu di-download ulang setiap restart) dan `opensearch_data` (agar data indeks tersimpan permanen).

#### 2. Berkas: `docker/Dockerfile.rag` (Zero-Dependency Microservice Image)
* **Lokasi**: `/Volumes/ssd atha/rag/docker/Dockerfile.rag`
* **Peran Penanggung Jawab**: **Data Engineer (DE)**
* **Fungsi Utama**: Membangun image Docker super ringan berbasis `python:3.9-slim`.
* **Keunggulan Ekstrem**: **TANPA dependensi `pip install`**. Mengandalkan modul bawaan Python (stdlib) sehingga proses build selesai dalam 3 detik dan bebas dari celah keamanan package pihak ketiga.
* **Konfigurasi Environment**: `PYTHONUNBUFFERED=1`, `OLLAMA_HOST=http://ollama:11434`, `EMBED_MODEL=nomic-embed-text`, `RAG_TOP_K=5`, `OPENSEARCH_INDEX=nala-academic-docs`, `RAG_PORT=8000`.

#### 3. Berkas: `docker/nginx.conf` (Reverse Proxy & CORS Eliminator)
* **Lokasi**: `/Volumes/ssd atha/rag/docker/nginx.conf`
* **Peran Penanggung Jawab**: **Data Engineer (DE) & ML Engineer (MLE)**
* **Fungsi Utama**: Mengarahkan lalu lintas jaringan same-origin:
  - Rute `/api/` dan `/ollama/` diteruskan ke `upstream ollama_backend` (prioritas 1: `host.docker.internal:11434` GPU Metal Mac, prioritas 2: `ollama:11434` container CPU).
  - Rute `/rag/` diteruskan ke kontainer `rag:8000`.
  - Cache Control: Menonaktifkan cache browser (`Cache-Control: no-store, no-cache`) untuk file `.html`, `.js`, `.css` agar setiap perubahan kode langsung tampil seketika tanpa perlu hard-reload.

#### 4. Berkas: `docker/init-ollama.sh` (Otomasi Inisialisasi Model AI)
* **Lokasi**: `/Volumes/ssd atha/rag/docker/init-ollama.sh`
* **Peran Penanggung Jawab**: **ML Engineer (MLE)**
* **Fungsi Utama**: Entrypoint skrip kontainer Ollama. Menjalankan `ollama serve` di background, otomatis melakukan `ollama pull nomic-embed-text` untuk model embedding, lalu mengeksekusi `ollama create duoai-copilot -f /Modelfile.duoai` untuk merakit model kustom.

#### 5. Berkas: `doc/Modelfile` (Spesifikasi Model AI Lokal)
* **Lokasi**: `/Volumes/ssd atha/rag/doc/Modelfile`
* **Peran Penanggung Jawab**: **Data Scientist (DS) & ML Engineer (MLE)**
* **Fungsi Utama**: Blueprint model custom `duoai-copilot` berbasis `llama3.2:3b`.
* **Parameter Krusial**:
  - `PARAMETER temperature 0.1`: Menurunkan kreativitas/halusinasi agar model menjawab secara deterministik, presisi matematis, dan patuh skema JSON.
  - `PARAMETER top_p 0.9`: Mengunci rentang probabilitas token.
  - `PARAMETER stop "<|eot_id|>"` & `stop "<|start_header_id|>"`: Menghentikan generasi token tepat saat giliran asisten selesai agar tidak mengulang percakapan pengguna.
  - `SYSTEM Prompt`: Menanamkan persona "DUO", aturan nominal uang Indonesia ("25rb" = 25000), skema JSON transaksi (`record_transaction`, `record_collab_expense`), dan identitas pengembang.


---

### 3.3 Sub-Sistem Dataset Sintetis, Pengujian, & Benchmark

#### 1. Berkas: `generate_dataset.py` (Sintesis Data Latih ChatML)
* **Lokasi**: `/Volumes/ssd atha/rag/generate_dataset.py`
* **Peran Penanggung Jawab**: **Data Scientist (DS)**
* **Fungsi Utama**: Skrip Python untuk merekayasa dataset percakapan sintetis berkualitas tinggi ke dalam format ChatML (`duoai_training_dataset.jsonl`).
* **4 Pilar Kurikulum Data**:
  1. *Safe-to-Spend & Financial Logic*: Perhitungan kuota belanja harian vs sisa hari, simulasi pembelian barang impulsif (tiket konser, sepatu, kopi).
  2. *Function Calling / Structured Action*: Input transaksi otomatis ke JSON action (`record_transaction`, `record_collab_expense`).
  3. *Konseling & Diplomasi Keuangan*: Solusi santun pelunasan hutang Settle Up pasangan, rasio patungan (50:50, 60:40).
  4. *Multilingual Support*: Format dialog multi-bahasa: Bahasa Indonesia santai, Bahasa Sunda, dan Bahasa Inggris.

#### 2. Berkas: `duoai_training_dataset.jsonl` (Dataset Multi-Turn Finansial)
* **Lokasi**: `/Volumes/ssd atha/rag/duoai_training_dataset.jsonl`
* **Peran Penanggung Jawab**: **Data Scientist (DS)**
* **Fungsi Utama**: Berisi 66+ sampel dialog percakapan berformat JSON Lines (`{"messages": [{"role": "system", ...}, {"role": "user", ...}, {"role": "assistant", ...}]}`). Digunakan juga oleh `rag_engine.py` sebagai basis data FAQ tanya-jawab (*few-shot retrieval*).

#### 3. Berkas: `test_modules_13_16.py` (Unit Test Matematis RAG)
* **Lokasi**: `/Volumes/ssd atha/rag/test_modules_13_16.py`
* **Peran Penanggung Jawab**: **Data Scientist (DS) & ML Engineer (MLE)**
* **Fungsi Utama**: Test suite otomatis berbasis `unittest` untuk membuktikan:
  - Inisialisasi kelas `VectorStore` (dimensi 768).
  - Ekstraksi teks dari file `knowledge-base/presiden-indonesia.md`.
  - **Pembuktian matematis Modul 15**: Bahwa untuk vektor ternormalisasi (unit vector), ranking dokumen pada Cosine Similarity, L2 Distance, dan Dot Product selalu identik 100%.
  - Verifikasi bahwa `TOP_K = 5` dan `OPENSEARCH_INDEX = nala-academic-docs`.

#### 4. Berkas: `test_inference_prompt.py` & `benchmark_raw.json`
* **Lokasi**: `/Volumes/ssd atha/rag/test_inference_prompt.py` & `/benchmark_raw.json`
* **Peran Penanggung Jawab**: **ML Engineer (MLE)**
* **Fungsi Utama**: Mengukur latensi inferensi HTTP mentah ke Ollama (Time to First Token / TTFT, throughput token/detik, dan total latency). Data empiris ini dituangkan ke dalam `doc/laporan_benchmark_model.md` sebagai bukti ilmiah keunggulan inferensi GPU Metal Mac dibanding CPU VM Docker.

---

### 3.4 Sub-Sistem Basis Pengetahuan (Knowledge Base)

#### 1. Berkas di `knowledge-base/`:
* **`presiden-indonesia.md`**: Kronik lengkap Presiden Republik Indonesia ke-1 (Ir. Soekarno) hingga ke-8 (Prabowo Subianto) lengkap dengan masa jabatan, wakil presiden, dan kabinet.
* **`sop-cuti-akademik.md`**: Prosedur standar operasional penghentian studi sementara: syarat masa studi minimal 2 semester, bebas tanggungan perpus/lab, batas maksimal 2 semester, dan pembayaran administrasi.
* **`sop-pendaftaran-krs.md`**: Alur pengisian Kartu Rencana Studi (KRS): jadwal perwalian dosen wali, kuota SKS berdasarkan IPK semester lalu, dan batas akhir perubahan KRS.

#### 2. Berkas Dokumentasi Penunjang:
* **`doc/PANDUAN_PENGGUNA.md`**: Buku manual pengguna aplikasi DuoWallet (Safe-to-Spend, Settle Up, Kantong Saldo, Copilot).
* **`doc/JOBDESK.md`**: Pembagian peran tim berbasis metodologi CRISP-DM (DA, DS, DE, MLE).
* **`doc/LAPORAN_STRATEGI_TRAINING_DUOAI.md`**: Laporan teknis kurikulum prompt dan arsitektur model.


---

### 3.5 Sub-Sistem Antarmuka Pengguna & State Engine (`websitekeuangan-v2/*`)

#### 1. Berkas: `websitekeuangan-v2/state.js` (Single Source of Truth)
* **Peran Penanggung Jawab**: **Data Engineer (DE) & Data Analyst (DA)**
* **Fungsi Utama**: Mengelola seluruh siklus hidup data (*State Management*) aplikasi secara reaktif dan persisten menggunakan `localStorage`.
* **Struktur Objek Kunci (`DuoState`)**:
  - `wallets`: Daftar dompet/kantong (misal: BCA, GoPay, Tunai, Kas Bersama) lengkap dengan saldo integer.
  - `transactions`: Log mutasi transaksi personal (`id`, `merchant`, `amount`, `category`, `wallet_id`, `date`).
  - `collab`: Log transaksi patungan bersama, rasio pembagian (50:50 atau dinamis), dan pencatatan hutang `dimas_owes` / `rina_owes`.
  - `budgets`: Alokasi batas pagu per kategori (Food & Drinks, Transport, Bills, dll.).
  - `user`: Pengguna aktif saat ini (`rina` atau `dimas`).
* **Pola Reaktivitas (*Subscriber Pattern*)**:
  - Menyediakan fungsi `DuoState.subscribe(listener)` sehingga setiap kali saldo atau transaksi berubah via `DuoState.setState()`, seluruh komponen layar di-render ulang secara otomatis dan data langsung di-commit ke `localStorage.setItem('duo_state', ...)`.

#### 2. Berkas: `websitekeuangan-v2/app.js` (Otak Copilot & Action Parser)
* **Peran Penanggung Jawab**: **Data Scientist (DS), Data Engineer (DE), & ML Engineer (MLE)**
* **Fungsi Utama**: Pengendali alur interaksi chat AI Copilot, Dynamic State Injection, dan eksekusi mutasi saldo.
* **Alur Eksekusi Chat AI (Langkah demi Langkah)**:
  1. *Dynamic State Injection*: Merangkum saldo riil dari `state.js`, sisa kuota Safe-to-Spend, dan sisa hari bulan ini ke dalam teks ringkas.
  2. *RAG Retrieval Pre-fetch*: Mengirim HTTP POST ke `/rag/query` dengan body `{"query": userText, "top_k": 5}` untuk mengambil potongan konteks dari OpenSearch.
  3. *Injeksi System Prompt*: Menggabungkan persona AI, data live finansial, dan `ragContext` ke dalam pesan sistem.
  4. *Inferensi Ollama*: Mengirim request POST ke `/api/chat` dengan model `duoai-copilot`.
  5. *Action Parsing*: Membaca blok JSON ```json { "action": "record_transaction", ... } ``` dari respon LLM, memvalidasi parameter angka, dan mengeksekusi fungsi mutasi saldo `DuoState.addTransaction()`.
  6. *Graceful Regex Fallback*: Jika server Ollama terputus atau timeout, sistem secara otomatis mengeksekusi pencocokan regex lokal (misal menangkap nominal "25rb" dan nama toko) sehingga pencatatan transaksi pengguna tidak pernah gagal!

#### 3. Berkas: `websitekeuangan-v2/desktop.js` & `layout.js`
* **Peran Penanggung Jawab**: **Data Analyst (DA)**
* **Fungsi**:
  - `desktop.js`: Mengatur navigasi desktop layar lebar, perilaku expand/collapse sidebar navigasi, penyesuaian event resize window, dan pintasan keyboard (hotkeys).
  - `layout.js`: Kerangka layout visual responsif, container navbar, dan tombol quick-action.

#### 4. Berkas: `websitekeuangan-v2/admin.js` & `components_overlays.js`
* **Peran Penanggung Jawab**: **Data Engineer (DE) & Data Analyst (DA)**
* **Fungsi**:
  - `admin.js`: Panel administrasi pengembang: fitur reset data ke default mock awal, ekspor seluruh database ke file JSON, dan impor cadangan data transaksi.
  - `components_overlays.js`: Komponen dialog konfirmasi, modal popup, toast notifikasi sukses/gagal, dan bottom-sheet transaksi.

#### 5. Berkas: `screens_personal.js`, `screens_collab.js`, `screens_auth.js`, & `screens_system.js`
* **Peran Penanggung Jawab**: **Data Analyst (DA) & Data Scientist (DS)**
* **Fungsi**:
  - `screens_personal.js`: Render visual Dashboard Keuangan Pribadi, grafik alokasi anggaran, dan kartu Safe-to-Spend.
  - `screens_collab.js`: Render visual Ruang Kolaborasi, status Settle Up (siapa berhutang ke siapa), dan form split-bill.
  - `screens_auth.js`: Layanan autentikasi sederhana, kunci keamanan PIN, dan switch profil (Rina vs Dimas).
  - `screens_system.js`: Pengaturan sistem, visualisasi log AI, pengujian koneksi server Ollama lokal, dan pemilih tema gelap/terang.

#### 6. Berkas: `index.html`, `styles.css`, `screens.js`, & `vercel.json`
* **Fungsi**:
  - `index.html`: Entry point struktur HTML5, mengimpor Google Fonts Manrope, Material Symbols, dan memuat script modular dalam urutan dependensi yang benar.
  - `styles.css`: 100% Native CSS (tanpa framework berat Tailwind/Bootstrap) dengan prinsip Glassmorphism modern, CSS Variables untuk mode gelap/terang, dan tata letak CSS Grid/Flexbox responsif.
  - `screens.js`: Router aggregator penampil layar aktif.
  - `vercel.json`: Konfigurasi perutean static hosting jika aplikasi dideploy ke Vercel.

---

## BAB 4: SIMULASI TANTANGAN MODIFIKASI DOSEN (LIVE CODING DEFENSE)

### Tantangan 1: "Coba tambahkan materi dokumen baru sekarang dan buktikan AI bisa langsung menjawabnya!"
* **Waktu Pengerjaan**: 30 Detik.
* **Langkah Eksekusi di Depan Dosen**:
  1. Buat file baru di folder `knowledge-base/`, misalnya `jadwal-uas.md`:
     ```markdown
     # Jadwal Ujian Akhir Semester (UAS) Genap 2026
     UAS Semester Genap dilaksanakan pada tanggal 15 Juni 2026 sampai 26 Juni 2026.
     Syarat mengikuti UAS adalah presensi kehadiran minimal 75 persen dan telah melunasi UKT.
     ```
  2. Buka terminal dan jalankan:
     ```bash
     python3 -m app.ingest
     ```
     *(Akan muncul log: Ingested 1 documents successfully).*
  3. Buka browser di `http://localhost:8080`, buka Copilot dan ketik:
     > *"Kapan UAS semester genap dimulai dan apa syaratnya?"*
  4. AI langsung menjawab tepat: *"UAS dilaksanakan 15-26 Juni 2026 dengan syarat presensi minimal 75%..."* tanpa perlu restart Docker!

---

### Tantangan 2: "Coba ubah jumlah potongan dokumen yang diambil (top-k) dari 5 menjadi 2!"
* **File yang Diedit**: `websitekeuangan-v2/app.js` (baris ~1611) atau `rag_engine.py`.
* **Langkah Eksekusi**:
  Di `websitekeuangan-v2/app.js`:
  ```javascript
  // Ubah top_k: 5 menjadi top_k: 2
  body: JSON.stringify({ query: userQuery, top_k: 2 }),
  ```
* **Penjelasan ke Dosen**:
  *"Top-k menentukan seberapa banyak tetangga terdekat (dokumen paling relevan) yang dikirim ke LLM. Jika top-k terlalu besar, prompt menjadi panjang dan boros token. Jika terlalu kecil (misal 1), informasi penting yang terpisah di paragraf lain bisa terlewat."*

---

### Tantangan 3: "Coba ubah gaya bahasa AI menjadi super formal atau bahasa daerah!"
* **File yang Diedit**: `websitekeuangan-v2/app.js` (bagian `sysPrompt`, baris ~1622).
* **Langkah Eksekusi**:
  ```javascript
  let sysPrompt = `Anda adalah DuoAI, asisten akademik super formal berbahasa Indonesia baku sesuai KBBI.
Gunakan sapaan 'Bapak/Ibu Mahasiswa'. Jawab selalu dengan format poin bernomor dan bahasa yang sangat santun.`;
  ```
* Refresh browser dan uji chat. Respon seketika berubah gaya bahasanya mengikuti instruksi system prompt tersebut.

---

### Tantangan 4: "Bagaimana cara membuang dokumen jika skor kemiripannya terlalu rendah?"
* **File yang Diedit**: `rag_engine.py` (pada fungsi `query_endpoint` / `query()`).
* **Langkah Eksekusi**:
  ```python
  # Tambahkan filtering skor kemiripan (misal ambang batas 0.65):
  THRESHOLD = 0.65
  filtered_docs = [d for d in docs if d.get("score", 0) >= THRESHOLD]
  context_text = "\n\n---\n\n".join([d["text"] for d in filtered_docs])
  ```
* **Penjelasan ke Dosen**:
  *"Ini mencegah injeksi konteks sampah (noise). Jika user bertanya hal di luar materi akademik/keuangan, OpenSearch akan mengembalikan skor rendah. Dengan threshold ini, konteks tidak akan dioper ke LLM sehingga LLM tidak terdistraksi."*

---

### Tantangan 5: "Ganti metrik kemiripan OpenSearch ke Euclidean (l2) dan buktikan rankingnya tetap!"
* **File yang Diedit**: `app/vector_store.py` (baris pemetaan `space_type`).
* **Langkah Eksekusi**:
  1. Ubah `"space_type": "cosinesimil"` menjadi `"space_type": "l2"`.
  2. Jalankan test suite:
     ```bash
     python3 test_modules_13_16.py
     ```
  3. Tunjukkan ke dosen bahwa test assertion ranking lolos: `OK (ran 4 tests)`.
* **Penjelasan ke Dosen**:
  *"Karena nomic-embed-text menghasilkan unit vector (norma = 1), L2 berbanding terbalik monoton sempurna terhadap Cosine: L2 = sqrt(2 - 2*Cosine). Peringkat dokumen terbukti 100% identik!"*


---

### Tantangan 6: "Bagaimana jika server OpenSearch mati total saat aplikasi beroperasi?"
* **Langkah Eksekusi di Depan Dosen**:
  1. Matikan OpenSearch secara paksa di terminal:
     ```bash
     docker stop duoai-opensearch
     ```
  2. Buka browser dan ajukan pertanyaan SOP ke Copilot di `http://localhost:8080`.
  3. AI tetap menjawab lancar!
* **Penjelasan ke Dosen**:
  *"Kami merancang arsitektur High-Availability dengan Graceful Degradation. Pada `rag_engine.py`, sistem memiliki fallback in-memory cache (`.rag_index_cache.json`). Ketika koneksi OpenSearch gagal, microservice RAG langsung beralih ke in-memory search lokal tanpa pernah melempar HTTP 500 error ke pengguna."*

---

### Tantangan 7: "Tambahkan filter pencarian agar hanya mengambil dokumen tertentu (Source Filtering)!"
* **File yang Diedit**: `rag_engine.py` / `app/vector_store.py`.
* **Langkah Eksekusi**:
  Tambahkan filter kueri k-NN OpenSearch dengan boolean clause:
  ```json
  {
    "size": 5,
    "query": {
      "bool": {
        "must": [{ "knn": { "embedding": { "vector": query_vector, "k": 5 } } }],
        "filter": [{ "term": { "source": "sop-cuti-akademik.md" } }]
      }
    }
  }
  ```
* **Penjelasan ke Dosen**:
  *"Ini mengisolasi sumber data. Mahasiswa yang berada di modul Cuti Akademik tidak akan terganggu oleh potongan teks riwayat presiden karena OpenSearch menyaring dokumen pada fase query planning."*

---

### Tantangan 8: "Ubah ukuran pemotongan teks (chunk size) dari 800 karakter menjadi 300 karakter!"
* **File yang Diedit**: `rag_engine.py` (variabel konstanta `MAX_CHUNK = 800`).
* **Langkah Eksekusi**:
  Ubah nilai menjadi:
  ```python
  MAX_CHUNK = 300
  ```
* **Penjelasan ke Dosen**:
  *"Ukuran chunk 300 karakter menghasilkan potongan yang sangat spesifik dan hemat token prompt, namun berisiko memutus konteks antar kalimat. Ukuran 800 karakter adalah sweet spot optimal untuk dokumen berbahasa Indonesia formal agar satu pasal SOP tetap utuh."*

---

### Tantangan 9: "Matikan server LLM lokal, dan buktikan pencatatan keuangan tetap bekerja!"
* **Langkah Eksekusi**:
  1. Matikan aplikasi Ollama di taskbar laptop.
  2. Buka `http://localhost:8080`, ketik di Copilot:
     > *"Beli nasi padang 25rb pakai GoPay"*
  3. Saldo GoPay seketika terpotong Rp 25.000 dan riwayat transaksi bertambah!
* **Penjelasan ke Dosen**:
  *"Di `websitekeuangan-v2/app.js`, kami menerapkan Robust Edge-Fallback Regex Engine. Ketika Ollama offline (network timeout), regex parser lokal mengekstrak entitas nominal '25rb' dan dompet, lalu langsung memutasi `DuoState`. Sistem tidak pernah lumpuh (*fault-tolerant*)!"*

---

### Tantangan 10: "Tambahkan aksi transfer saldo antar dompet pada Copilot AI!"
* **File yang Diedit**: `websitekeuangan-v2/app.js` (pada action handler chat).
* **Langkah Eksekusi**:
  Tambahkan penanganan aksi `record_transfer`:
  ```javascript
  if (act.action === 'record_transfer') {
    DuoState.transferWallet(act.from_wallet, act.to_wallet, act.amount);
    showToast(`Transfer Rp ${act.amount} dari ${act.from_wallet} ke ${act.to_wallet} berhasil!`);
  }
  ```
* **Penjelasan ke Dosen**:
  *"Karena arsitektur frontend kami menggunakan State Management terpusat (`state.js`) yang berbasis pola reaktif (Subscriber Pattern), menambahkan aksi AI baru hanya memerlukan 3 baris kode!"*

---

## BAB 5: BANK TANYA-JAWAB "PEMBANTAIAN" SIDANG (35 KILLER Q&A)

### Kategori 1: Aljabar Vektor, Teori Embedding, & Algoritma k-NN

#### Q1: "Kenapa menggunakan k-NN Vector Search di OpenSearch, bukan Full-Text Search biasa (seperti BM25 atau SQL LIKE)?"
* **Jawaban Mantap**:
  > *"Pencarian kata kunci biasa (BM25/SQL LIKE) hanya mencocokkan kemunculan huruf persis (syntactic match). Jika dokumen menulis 'Penghentian Sementara Studi', tetapi mahasiswa mencari 'Bagaimana cara cuti kuliah?', pencarian leksikal akan menghasilkan 0 hasil karena kata kuncinya berbeda sama sekali.*  
  > *Sedangkan k-NN Vector Search mencocokkan makna semantik (semantic similarity). Kalimat 'cuti kuliah' dan 'penghentian sementara studi' dipetakan ke koordinat vektor yang berdekatan dalam ruang 768 dimensi, sehingga dokumen tetap ditemukan dengan akurat."*

#### Q2: "Kenapa Anda memilih metrik `cosinesimil` (Cosine Similarity), bukan `l2` (Euclidean Distance)?"
* **Jawaban Mantap**:
  > *"Cosine Similarity mengukur sudut kemiringan (arah makna) antar dua vektor tanpa terpengaruh oleh panjang-pendeknya teks dokumen. Nilainya ternormalisasi antara 0.0 sampai 1.0 (1.0 = searah sempurna).*  
  > *Euclidean Distance mengukur jarak fisik garis lurus absolut yang dapat terdistorsi jika dokumen memiliki perbedaan jumlah kata yang drastis."*

#### Q3: "Buktikan secara matematis bahwa ranking Cosine, L2, dan Dot Product selalu sama pada sistem ini!"
* **Jawaban Mantap**:
  > *"Model `nomic-embed-text` secara otomatis menormalisasi vektor keluarannya sehingga memiliki panjang norma satu: $\|A\| = \|B\| = 1$.*  
  > *Dari rumus Cosine: $\text{Cosine}(A, B) = \frac{A \cdot B}{\|A\| \|B\|} = A \cdot B = \text{Dot}(A, B)$.*  
  > *Dari ekspansi Euclidean L2: $\|A - B\|^2 = \|A\|^2 + \|B\|^2 - 2(A \cdot B) = 2 - 2 \cdot \text{Cosine}(A, B)$.*  
  > *Karena hubungan antara L2 dan Cosine adalah transformasi monoton turun yang berkorelasi negatif sempurna, urutan ranking dokumen ke-1 hingga ke-N terbukti secara matematis 100% identik di ketiga metrik tersebut."*

#### Q4: "Kenapa dimensinya harus tepat 768? Bolehkah diubah menjadi 1536 atau 512?"
* **Jawaban Mantap**:
  > *"Dimensi vektor ditentukan secara kaku oleh arsitektur model embedding yang digunakan. Model `nomic-embed-text` menghasilkan representasi Dense Vector berukuran tepat 768 Float32.*  
  > *Jika dimensi pada indeks OpenSearch diubah tanpa mengganti model embedding, OpenSearch akan melempar galat `Dimensionality Mismatch HTTP 400`."*

#### Q5: "Apa itu HNSW dan apa bedanya dengan Flat k-NN?"
* **Jawaban Mantap**:
  > *"HNSW (Hierarchical Navigable Small World) adalah algoritma berbasis struktur graf berjenjang multi-layer untuk pencarian tetangga terdekat secara aproksimasi (Approximate Nearest Neighbors - ANN) dengan kompleksitas waktu logaritmik $O(\log N)$.*  
  > *Flat k-NN adalah metode pencarian persis (*exact brute-force*) yang membandingkan vektor query ke seluruh dokumen satu per satu dengan kompleksitas linear $O(N)$. Pada korpus ribuan dokumen, HNSW ratusan kali lebih cepat."*

#### Q6: "Apa keunggulan `nomic-embed-text` dibanding OpenAI `text-embedding-3-small`?"
* **Jawaban Mantap**:
  > *"Pertama, Nomic adalah model open-weights berlisensi terbuka yang dapat dijalankan secara lokal (on-device) melalui Ollama tanpa biaya API per token dan tanpa risiko kebocoran data privasi ke pihak ketiga.*  
  > *Kedua, Nomic mendukung context length hingga 8192 token, jauh lebih fleksibel untuk dokumen panjang dibanding model embedding lokal sekelas MiniLM (512 token)."*

#### Q7: "Apa yang dimaksud dengan fenomena Cosine Score Cramping pada dokumen kita?"
* **Jawaban Mantap**:
  > *"Pada kumpulan dokumen pendek bertema sejenis (misal teks riwayat presiden), seluruh potongan teks memiliki skor kemiripan yang terkumpul padat di rentang sempit (0.68 - 0.73) akibat struktur sintaksis yang mirip.*  
  > *Akibatnya, perbedaan skor antar dokumen menjadi sangat tipis sehingga membutuhkan evaluasi Top-K yang lebih fleksibel."*

#### Q8: "Mengapa nilai default `RAG_TOP_K` dinaikkan dari 3 menjadi 5?"
* **Jawaban Mantap**:
  > *"Berdasarkan pengujian Modul 15 & 16, jika hanya mengambil Top-3, dokumen SOP akademik berisiko terdorong ke posisi #4 akibat kompetisi skor cramping dokumen profil presiden.*  
  > *Dengan menaikkan Top-K menjadi 5, dokumen SOP yang berada di posisi ke-4 dan ke-5 terbukti berhasil lolos masuk ke context prompt LLM, meningkatkan akurasi jawaban sistem secara signifikan."*

---

### Kategori 2: Arsitektur Sistem, Jaringan Nginx, & OpenSearch Backend

#### Q9: "Kenapa RAG backend `rag_engine.py` dibangun murni dengan Python Standard Library tanpa FastAPI?"
* **Jawaban Mantap**:
  > *"Prinsip Zero-Dependency Architecture. Menggunakan `ThreadingHTTPServer` bawaan Python menghilangkan seluruh kebutuhan instalasi dependensi `pip`, memperkecil ukuran image Docker menjadi sangat minimal (<120MB), mempercepat waktu build kontainer menjadi hanya 3 detik, dan mengeliminasi celah keamanan pihak ketiga (*zero third-party CVE vulnerabilities*)."*

#### Q10: "Bagaimana alur penyelesaian masalah CORS oleh Reverse Proxy Nginx?"
* **Jawaban Mantap**:
  > *"Browser klien hanya berinteraksi dengan satu origin: `http://localhost:8080`. Di sisi server, Nginx meneruskan request `/rag/` ke port 8000 dan `/api/` ke port 11434.*  
  > *Karena browser menganggap semua lalu lintas data berasal dari domain dan port yang sama, browser tidak pernah memicu pemeriksaan CORS (*Same-Origin Policy dipatuhi 100%*)."*

#### Q11: "Kenapa upstream Nginx mengarah ke `host.docker.internal:11434`, bukan ke kontainer `ollama:11434` saja?"
* **Jawaban Mantap**:
  > *"Di macOS, Docker Desktop berjalan di dalam VM Linux yang terisolasi dari GPU Apple Metal, sehingga Ollama di dalam Docker hanya bisa memakai CPU (latensi 45-120 detik per respon).*  
  > *Dengan mengarahkan ke `host.docker.internal:11434`, Nginx memanfaatkan akselerasi GPU Metal dari aplikasi Ollama yang berjalan langsung di host Mac pengguna, memangkas latensi respon menjadi hanya 1-2 detik!"*

#### Q12: "Apa fungsi port 9200 dan port 5601 pada OpenSearch?"
* **Jawaban Mantap**:
  > *"Port 9200 adalah REST API inti OpenSearch tempat sistem RAG melakukan indexing dokumen dan query k-NN.*  
  > *Port 5601 adalah OpenSearch Dashboards, antarmuka visual (GUI) berbasis web untuk pemantauan kesehatan cluster (*green/yellow/red*), inspeksi pemetaan indeks, dan eksekusi kueri analitik via Dev Tools."*

#### Q13: "Mengapa parameter `plugins.security.disabled=true` diset pada OpenSearch?"
* **Jawaban Mantap**:
  > *"Untuk mematikan lapisan autentikasi HTTPS internal, sertifikat SSL self-signed, dan basic auth pada lingkungan pengembangan lokal. Hal ini menyederhanakan komunikasi HTTP murni antar kontainer dalam jaringan privat Docker tanpa mengorbankan keamanan eksternal."*

#### Q14: "Bagaimana sistem menjamin proses ingestion tidak membuat data duplikat (*Idempotency*)?"
* **Jawaban Mantap**:
  > *"Pada `app/ingest.py`, dokumen disimpan ke OpenSearch menggunakan HTTP `PUT /{index}/_doc/{doc_id}` dengan nilai `doc_id` diambil dari nama berkas (`filename`).*  
  > *Jika skrip dijalankan 100 kali, OpenSearch akan menimpa (*overwrite/update*) dokumen yang sama, bukan membuat record baru. Jumlah dokumen di index tetap konsisten."*

#### Q15: "Apa fungsi parameter `refresh=true` pada pemanggilan API indexing OpenSearch?"
* **Jawaban Mantap**:
  > *"Secara default, OpenSearch melakukan flush indeks secara periodik (setiap 1 detik). Dengan menambahkan parameter query `?refresh=true`, OpenSearch dipaksa melakukan refresh segmen memori secara instan seketika dokumen selesai diindeks, sehingga dokumen baru langsung dapat ditemukan oleh pencarian k-NN tanpa jeda latensi."*

#### Q16: "Apa itu format ChatML pada `duoai_training_dataset.jsonl`?"
* **Jawaban Mantap**:
  > *"ChatML (Chat Markup Language) adalah standar struktur dialog multi-turn yang memisahkan percakapan menjadi tiga peran terstruktur: `system` (instruksi perilaku AI), `user` (pertanyaan manusia), dan `assistant` (jawaban model beserta blok skema JSON tindakan)."*

#### Q17: "Mengapa parameter `temperature` diatur ke angka 0.1 di `Modelfile`?"
* **Jawaban Mantap**:
  > *"Temperature 0.1 memaksa model memilih token dengan probabilitas tertinggi secara deterministik. Pada aplikasi finansial, kita membutuhkan kepatuhan mutlak pada kalkulasi matematika dan format JSON, bukan kebebasan berimajinasi atau mengarang bebas (*creativity penalty*)."*

#### Q18: "Apa fungsi token `stop \"<|eot_id|>\"` pada konfigurasi model Ollama?"
* **Jawaban Mantap**:
  > *"Token `<|eot_id|>` (End of Turn ID) adalah penanda akhir giliran bicara pada tokenisasi LLaMA 3. Parameter `stop` memastikan model menghentikan generasi kata seketika jawabannya tuntas, mencegah model berbicara sendiri atau memalsukan percakapan giliran pengguna berikutnya."*

---

### Kategori 3: Pipeline Ingestion, Chunking, Cache, & Prompt Engineering

#### Q19: "Bagaimana strategi chunking dokumen pada `rag_engine.py`?"
* **Jawaban Mantap**:
  > *"Kami menerapkan Heading-Aware Hierarchical Chunking melalui fungsi `_split_md`. Dokumen dipecah terlebih dahulu berdasarkan penanda heading Markdown (`#`, `##`, `###`), lalu setiap seksi dipecah menjadi paragraf-paragraf dengan batas `MAX_CHUNK = 800` karakter.*  
  > *Setiap potongan teks dilengkapi metadata kontekstual seperti `[presiden-indonesia.md > Presiden Ke-1]` agar model tetap memahami konteks dokumen induknya."*

#### Q20: "Mengapa ukuran chunk dipilih 800 karakter?"
* **Jawaban Mantap**:
  > *"Ukuran 800 karakter setara dengan 150-200 kata bahasa Indonesia. Ukuran ini cukup panjang untuk mempertahankan keutuhan satu pasal SOP atau biografi singkat tanpa terpotong, namun cukup ringkas sehingga 5 dokumen teratas hanya menghabiskan ~1.000 token dari total context window model LLaMA (8.192 token)."*

#### Q21: "Bagaimana sistem in-memory cache `.rag_index_cache.json` bekerja saat OpenSearch offline?"
* **Jawaban Mantap**:
  > *"Saat pertama kali dokumen diindeks, pasangan teks dan vektor embedding 768-D disimpan ke file JSON lokal `.rag_index_cache.json`. Jika koneksi ke port 9200 OpenSearch terputus, `rag_engine.py` secara otomatis memuat cache ini ke RAM dan menghitung kemiripan Cosine secara lokal murni menggunakan aljabar matriks Python standar. Sistem tidak pernah mengalami kegagalan fatal (*zero downtime*)."*

#### Q22: "Apa yang dimaksud dengan Dynamic State Injection pada `app.js`?"
* **Jawaban Mantap**:
  > *"Sebelum mengirim pesan chat ke AI, JavaScript membaca kondisi keuangan riil terkini dari `state.js` (total saldo seluruh dompet, sisa kuota Safe-to-Spend harian, dan sisa hari bulan ini), lalu menginjeksinya langsung ke dalam teks System Prompt.*  
  > *Dengan demikian, AI selalu memiliki data waktu-nyata (*real-time ground truth*) tanpa perlu melakukan query database yang berat."*

#### Q23: "Mengapa Anda tidak memasukkan seluruh riwayat mutasi transaksi sepanjang tahun ke dalam prompt?"
* **Jawaban Mantap**:
  > *"Memasukkan ribuan log transaksi ke prompt memicu fenomena Attention Degradation (*Lost in the Middle*), memperlambat inferensi secara kuadratik, dan berisiko melampaui context limit token. Kami hanya menginjeksi ringkasan agregat saldo dan 5 transaksi terbaru, yang terbukti cukup untuk kebutuhan konsultasi harian."*

#### Q24: "Bagaimana format Action JSON yang dihasilkan model dan bagaimana cara memvalidasinya?"
* **Jawaban Mantap**:
  > *"Model diinstruksikan menghasilkan blok JSON terstandarisasi, misalnya: `{\"action\": \"record_transaction\", \"amount\": 25000, \"category\": \"Food & Drinks\", \"wallet\": \"GoPay\"}`.*  
  > *Di `app.js`, teks diekstrak menggunakan pencocokan regex blok markdown, di-parse via `JSON.parse()`, divalidasi keabsahan tipenya (angka positif, kategori terdaftar), baru kemudian dieksekusi ke mutasi `DuoState.addTransaction()`."*

#### Q25: "Bagaimana cara kerja Local Regex Fallback jika LLM mati total?"
* **Jawaban Mantap**:
  > *"Frontend memiliki parser deterministik lokal berbasis ekspresi reguler (*regex*). Pola seperti `/beli\\s+(.+?)\\s+(\\d+)(?:rb|k)?\\s+pake\\s+(\\w+)/i` dapat mengekstrak nominal, nama merchant, dan metode pembayaran dari kalimat santai pengguna secara instan tanpa membutuhkan AI sama sekali."*

#### Q26: "Bagaimana sistem menangani pertanyaan dalam Bahasa Sunda atau dialek gaul?"
* **Jawaban Mantap**:
  > *"Model dasar `llama3.2` memiliki kapabilitas multilingual inheren. Ditambah lagi, pada `generate_dataset.py` kami sengaja memasukkan sampel dialog bersubjek bahasa daerah (seperti 'Saha wae presiden kahiji?', 'Atos nuhun'). Karena representasi embedding semantik memetakan konsep arti ke ruang yang sama, model memahami maksud pengguna dan membalas dengan santun."*

#### Q27: "Apa rumus Safe-to-Spend dan bagaimana AI menggunakannya?"
* **Jawaban Mantap**:
  > *"Rumus: $\\text{Safe-to-Spend Per Hari} = \\frac{\\text{Total Saldo Likuid} - \\text{Alokasi Dana Darurat/Tagihan}}{\\text{Sisa Hari Bulan Ini}}$.*  
  > *Saat pengguna bertanya apakah ia boleh membeli barang tersier (seperti sepatu Rp 500.000), AI membandingkan harga barang dengan kuota Safe-to-Spend harian dan memberikan peringatan bijak jika pembelian tersebut mengancam ketahanan finansialnya."*

---

### Kategori 4: Logika Finansial Kolaborasi, Evaluasi, & Pertahanan Kritis

#### Q28: "Bagaimana logika kalkulasi Settle Up pada pengeluaran kolaboratif pasangan?"
* **Jawaban Mantap**:
  > *"Sistem mencatat transaksi patungan dengan atribut pembayar (`paid_by`) dan rasio beban (`split_ratio`, misal 50:50). Total beban bersih dihitung dari selisih pengeluaran: jika Dimas membayar makan malam Rp 200.000 (beban Rina Rp 100.000) dan Rina membayar belanja bulanan Rp 60.000 (beban Dimas Rp 30.000), sistem secara otomatis mengagregasi selisihnya menjadi satu angka bersih (*net debt*): Rina berhutang Rp 70.000 ke Dimas. Pelunasan cukup dengan satu kali transfer!"*

#### Q29: "Mengapa menggunakan Local Storage browser untuk `DuoState`, bukan remote database PostgreSQL?"
* **Jawaban Mantap**:
  > *"Untuk prototipe on-device offline-first, Local Storage memberikan latensi baca-tulis 0 milidetik, tidak membutuhkan koneksi internet, menjamin data privasi keuangan tetap berada di perangkat lokal pengguna, dan menyederhanakan arsitektur demo tanpa dependensi server database terpisah."*

#### Q30: "Bagaimana Anda mengevaluasi performa sistem RAG ini secara kuantitatif?"
* **Jawaban Mantap**:
  > *"Kami menggunakan 3 metrik:*  
  > *1. **Recall@5**: Persentase dokumen jawaban benar yang berhasil masuk dalam 5 dokumen teratas (mencapai 100% pada dataset uji SOP kami).*  
  > *2. **Action Exact Match (EM)**: Akurasi parameter JSON tindakan (nominal, kategori, wallet) terhadap ground truth percakapan di `duoai_training_dataset.jsonl` (>95%).*  
  > *3. **Latency / Tokens-per-Second**: Mengukur TTFT (Time to First Token) dan throughput inferensi yang diuji via `test_inference_prompt.py`."*

#### Q31: "Apa itu TTFT dan jelaskan perbedaan performa antara GPU Metal Mac vs emulasi CPU Docker?"
* **Jawaban Mantap**:
  > *"TTFT (Time to First Token) adalah durasi sejak prompt dikirim hingga token kata pertama mulai dicetak ke layar. Berdasarkan benchmark empiris di `doc/laporan_benchmark_model.md`:*  
  > *- Host GPU Metal Apple Silicon: TTFT ~350 milidetik dengan throughput 28.5 token/detik.*  
  > *- Emulasi CPU Docker Container: TTFT ~12.800 milidetik dengan throughput 2.1 token/detik.*  
  > *GPU Metal memberikan performa 13 kali lebih cepat, sangat vital untuk pengalaman pengguna interaktif."*

#### Q32: "Bagaimana sistem mendeteksi jika pertanyaan di luar domain (Out-of-Domain Query)?"
* **Jawaban Mantap**:
  > *"OpenSearch mengembalikan skor kemiripan vektor (*score*). Jika skor dokumen teratas di bawah batas bawah relevansi (misal < 0.60), sistem menandai bahwa tidak ada informasi terkait di basis pengetahuan. LLM diinstruksikan oleh System Prompt untuk secara jujur menjawab bahwa informasi tersebut tidak tercantum dalam SOP kampus atau modul resmi."*

#### Q33: "Kenapa Anda tidak menggunakan framework populer seperti LangChain atau LlamaIndex?"
* **Jawaban Mantap**:
  > *"LangChain dan LlamaIndex adalah framework yang membawa ratusan lapisan abstraksi berlebih (*bloated dependencies*), ukuran paket ratusan megabyte, dan sering mengubah API (*breaking changes*).*  
  > *Dengan membangun RAG Engine murni menggunakan Python Standard Library dan REST API langsung ke OpenSearch, kami memperoleh kontrol arsitektur 100% transparan, kemudahan debugging (*line-by-line*), waktu startup instan, dan efisiensi memori yang ekstrem."*

#### Q34: "Bagaimana jaminan keamanan data privasi pengguna pada aplikasi ini?"
* **Jawaban Mantap**:
  > *"Model AI berjalan 100% secara lokal (*on-device SLM*) tanpa mengirimkan satu token pun ke API pihak ketiga di cloud (seperti OpenAI atau Google). Data riwayat keuangan pengguna berada di browser lokal. Bahkan jika internet mati total, seluruh siklus kerja aplikasi tetap dapat beroperasi secara tertutup (*air-gapped environment*)."*

#### Q35: "Apa keunggulan terbesar sistem Anda dibanding asisten AI keuangan konvensional?"
* **Jawaban Mantap**:
  > *"Asisten konvensional hanya mampu mencatat teks biasa atau menjawab pertanyaan umum tanpa tahu konteks pengguna. DuoAI menggabungkan 3 kekuatan sekaligus: (1) **Dual-Perspective Personal & Collab Budgeting** dengan Safe-to-Spend proaktif, (2) **On-Device RAG Retrieval** ke OpenSearch untuk regulasi akademik faktual, dan (3) **Structured Action Execution** yang otomatis mengubah bahasa santai menjadi mutasi saldo nyata dengan fail-safe offline regex!"*


---

## BAB 6: MATRIKS HAFALAN WAJIB & KISI-KISI UJIAN PER JOBDESK (CRISP-DM ROLES)

### 6.1 Data Analyst (DA) — Spesialis Analisis Bisnis, Taksonomi, & UI/UX
* **Fokus Utama**: Menjawab pertanyaan seputar *Business Understanding*, Taksonomi Finansial, Metrik Kepuasan Pengguna (SUS), dan Logika Perhitungan Anggaran.
* **Berkas Wajib Dikuasai**:
  - `doc/PANDUAN_PENGGUNA.md`
  - `websitekeuangan-v2/desktop.js` & `layout.js`
  - `websitekeuangan-v2/screens_personal.js` & `screens_collab.js`
* **Konsep & Rumus Wajib Hafal di Luar Kepala**:
  1. **Rumus Safe-to-Spend**:
     $$\text{Safe-to-Spend Per Hari} = \frac{\text{Total Saldo Dompet} - \text{Alokasi Dana Darurat & Pagu Tagihan}}{\text{Jumlah Hari Tersisa Bulan Berjalan}}$$
  2. **Logika Agregasi Bersih Settle Up Pasangan**:
     - Membagi transaksi kolaboratif berdasarkan proporsi tanggungan (`50:50` atau persentase kustom).
     - Menghitung nilai selisih tunggal (*net settling debt*) sehingga tidak ada transfer berulang bolak-balik antar pasangan.
  3. **Evaluasi Usability (System Usability Scale - SUS)**:
     - Standar 10 pertanyaan kuesioner baku untuk mengukur keramahan antarmuka (skor target > 75 / Grade B+).
  4. **Taksonomi Kategori Keuangan**:
     - 6 Pagu Anggaran Utama: *Food & Drinks, Transport, Bills & Utilities, Groceries, Entertainment, Shopping*.
* **Pertanyaan Pembantaian Penguji untuk DA**:
  - *Q: "Bagaimana cara Anda memvalidasi bahwa Safe-to-Spend benar-benar mencegah pengguna overspending?"*  
    *A: "Dengan mengintegrasikan Safe-to-Spend langsung ke kartu UI dashboard dan prompt Copilot. Ketika pengguna menanyakan pembelian barang tertentu, sistem langsung memproyeksikan apakah kuota harian akan minus hingga akhir bulan."*
  - *Q: "Kenapa layout desktop dibuat collapsible sidebar?"*  
    *A: "Untuk memaksimalkan ruang kerja pada monitor laptop saat membandingkan grafik personal dan ruang kolaborasi tanpa distraction, mendukung shortcut navigasi cepat."*

---

### 6.2 Data Scientist (DS) — Spesialis Model AI, Dataset ChatML, & Prompt Engineering
* **Fokus Utama**: Menjawab pertanyaan seputar Rekayasa Dataset Sintetis, Token Budgeting, Hyperparameter Model, dan Evaluasi Faktual.
* **Berkas Wajib Dikuasai**:
  - `generate_dataset.py` & `duoai_training_dataset.jsonl`
  - `doc/Modelfile`
  - `doc/LAPORAN_STRATEGI_TRAINING_DUOAI.md`
  - `test_modules_13_16.py`
* **Konsep & Baris Kode Kunci Wajib Hafal**:
  1. **Format ChatML (Chat Markup Language)**:
     - Struktur 3 peran: `<|im_start|>system ... <|im_end|>`, `<|im_start|>user ... <|im_end|>`, `<|im_start|>assistant ... <|im_end|>`.
  2. **Hyperparameter di `doc/Modelfile`**:
     - `PARAMETER temperature 0.1` (Kunci deterministik & akurasi JSON).
     - `PARAMETER top_p 0.9` (Mengontrol variasi kosa kata).
     - `PARAMETER stop "<|eot_id|>"` (Mencegah pengulangan giliran).
  3. **Few-Shot Dynamic Injection**:
     - Menyuntikkan contoh format JSON transaksi ke dalam teks System Prompt secara on-the-fly.
  4. **Metrik Evaluasi DS**:
     - *Action Exact Match (EM)*: Persentase keakuratan parameter nominal, kategori, dan dompet yang dihasilkan AI dibanding ground truth.
     - *Token Budgeting*: Menjaga total prompt di bawah ~1.500 token agar latensi inferensi tetap di bawah 2 detik.
* **Pertanyaan Pembantaian Penguji untuk DS**:
  - *Q: "Kenapa memilih model `llama3.2:3b` bukan model 7B atau 70B?"*  
    *A: "Model 3B memiliki efisiensi komputasi on-device terbaik. Dengan kuantisasi 4-bit, ia hanya memakan RAM ~2GB, mampu berjalan mulus di laptop standar dengan throughput >25 token/detik, namun tetap mempertahankan penalaran logika instruksi JSON yang presisi."*
  - *Q: "Bagaimana Anda membuktikan dataset sintetis Anda tidak overfit?"*  
    *A: "Dataset dirancang dengan variasi sintaksis luas: kalimat proaktif, kalimat pasif, dialek Sunda, singkatan angka (25rb, 50k), dan situasi split-bill kompleks yang diuji secara independen."*

---

### 6.3 Data Engineer (DE) — Spesialis Arsitektur Data, Vektor Store, & Pipeline
* **Fokus Utama**: Menjawab pertanyaan seputar Abstraksi `VectorStore`, Skema OpenSearch k-NN, Ingestion Idempotency, dan State Management Reaktif.
* **Berkas Wajib Dikuasai**:
  - `app/vector_store.py` & `app/ingest.py`
  - `rag_engine.py` (Metode chunking & HTTP routing)
  - `websitekeuangan-v2/state.js` & `websitekeuangan-v2/admin.js`
  - `docker/Dockerfile.rag`
* **Konsep & Baris Kode Kunci Wajib Hafal**:
  1. **Pemetaan Indeks OpenSearch k-NN**:
     - `index.knn: true`, tipe field `knn_vector`, `dimension: 768`, method `hnsw`, space `cosinesimil`, engine `nmslib`.
  2. **Idempotent Ingestion**:
     - Penyimpanan via `PUT /nala-academic-docs/_doc/{filename}?refresh=true` (menghindari duplikasi data).
  3. **Zero-Dependency Python Microservice**:
     - Implementasi `ThreadingHTTPServer` stdlib, penanganan sinyal thread-safe, dan streaming respon JSON tanpa third-party wheel.
  4. **State Management Reaktif (`state.js`)**:
     - Pola `Observer/Subscriber`: `DuoState.subscribe(listener)` dan persistensi sinkron ke `localStorage`.
* **Pertanyaan Pembantaian Penguji untuk DE**:
  - *Q: "Bagaimana jika ada 10.000 request bersamaan ke `rag_engine.py`?"*  
    *A: "`rag_engine.py` menggunakan `ThreadingHTTPServer` yang memproses setiap request pada thread OS terpisah secara non-blocking. Untuk produksi masif, layanan dapat di-scale horizontal di Docker Swarm atau K8s di belakang Nginx load balancer."*
  - *Q: "Kenapa memilih OpenSearch bukan pgvector di PostgreSQL?"*  
    *A: "OpenSearch dioptimalkan secara native untuk temu balik teks semantik berskala besar dengan graf HNSW terdistribusi, query filtering terintegrasi, dan integrasi visual langsung dengan Dashboards tanpa overhead manajemen koneksi RDBMS."*

---

### 6.4 ML Engineer (MLE) — Spesialis Inferensi, Orkestrator Kontainer, & Jaringan
* **Fokus Utama**: Menjawab pertanyaan seputar Akselerasi GPU Metal vs CPU, Topologi Port Nginx, Fallback Resilient, dan Aljabar Vektor.
* **Berkas Wajib Dikuasai**:
  - `docker-compose.yml` & `docker/nginx.conf`
  - `docker/init-ollama.sh`
  - `app/embeddings.py`
  - `test_inference_prompt.py` & `benchmark_raw.json`
  - `websitekeuangan-v2/app.js` (Logika pre-fetch RAG & regex fallback)
* **Konsep & Baris Kode Kunci Wajib Hafal**:
  1. **Dual Upstream Nginx**:
     - `server host.docker.internal:11434;` (Prioritas GPU Mac) dan `server ollama:11434 backup;` (Fallback CPU Docker).
  2. **Pembuktian Matematis Vektor Normal (Modul 15)**:
     - Identitas ranking: $\text{Cosine}(A, B) \equiv \text{Dot}(A, B)$ dan $L_2 = \sqrt{2 - 2 \cdot \text{Cosine}}$.
  3. **Fail-Safe Robustness**:
     - Lapisan 1: OpenSearch k-NN Search -> Lapisan 2: In-Memory Cosine Cache -> Lapisan 3: Local Regex Action Parsing.
  4. **Throughput Benchmark**:
     - GPU Metal Apple Silicon: 28+ token/detik (TTFT ~350ms) vs CPU VM: 2-4 token/detik (TTFT ~12.8s).
* **Pertanyaan Pembantaian Penguji untuk MLE**:
  - *Q: "Bagaimana cara Anda memantau utilisasi memori model saat presentasi?"*  
    *A: "Dengan menjalankan `ollama ps` di terminal, yang menampilkan nama model aktif, ukuran footprint VRAM (misal: 2.1 GB pada unified memory Apple Silicon), dan waktu idle unload."*
  - *Q: "Mengapa menggunakan `_split_md` bukan library LangChain TextSplitter?"*  
    *A: "Untuk menghilangkan runtime overhead dan dependensi eksternal. Algoritma `_split_md` kami secara cerdas memotong teks tepat pada batas paragraf dan heading Markdown, menjaga integritas semantik tanpa kehilangan konteks."*

---

### 6.5 Cheat Sheet Terminal & Emergency Troubleshooting

#### 1. Perintah Terminal Wajib Hafal:
```bash
# 1. Cek kesehatan kontainer Docker
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 2. Jalankan ingest dokumen baru
python3 -m app.ingest

# 3. Jalankan unit test pembuktian matematika (Modul 13-16)
python3 test_modules_13_16.py

# 4. Uji cluster OpenSearch & hitung dokumen
curl -s http://localhost:9200/_cluster/health | jq .
curl -s http://localhost:9200/nala-academic-docs/_count | jq .

# 5. Uji Microservice RAG Engine Port 8000
curl -s -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "prosedur cuti kuliah", "top_k": 3}' | jq .

# 6. Uji Respon Chat LLM melalui Nginx Port 8080
curl -s -X POST http://localhost:8080/api/chat \
  -d '{"model": "duoai-copilot", "messages": [{"role": "user", "content": "halo duo"}], "stream": false}' | jq .
```

#### 2. Emergency Troubleshooting (Jika Panik di Depan Dosen):
1. **Masalah: Tampilan browser tidak mengupdate perubahan kode terbaru.**
   - *Solusi*: Tekan **Cmd + Shift + R** (Mac) atau **Ctrl + F5** (Windows) untuk hard-reload tanpa cache browser.
2. **Masalah: Respon Copilot memakan waktu lebih dari 30 detik.**
   - *Penyebab*: Ollama di host Mac belum berjalan sehingga Nginx jatuh ke kontainer CPU.
   - *Solusi*: Buka aplikasi Ollama di Mac host (pastikan ikon llama muncul di menu bar atas).
3. **Masalah: OpenSearch mengembalikan status Yellow atau Red.**
   - *Penyebab*: Disk space laptop hampir penuh (watermark threshold) atau container kehabisan alokasi RAM.
   - *Solusi*: Restart container via `docker compose restart opensearch`.


