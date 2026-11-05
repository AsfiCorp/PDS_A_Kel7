# PANDUAN MATERI PRESENTASI: DEEP-DIVE SEMANTIC SEARCH & VECTOR INDEXING
### Panduan Lengkap Presentasi, Alur Indexing, Cara Pakai, Bedah Kode, & Skenario Live Demo

---

## 🎯 TUJUAN PRESENTASI
1. Menjelaskan secara gamblang **mengapa Semantic Search jauh lebih unggul** dibanding pencarian kata kunci tradisional (Lexical / SQL LIKE / BM25).
2. Membedah **alur kerja Indexing (Data Preparation -> Dense Vector -> OpenSearch k-NN)** dari hulu ke hilir.
3. Menunjukkan **cara pakai & testing** baik via Terminal (curl/script), GUI OpenSearch Dashboards, maupun Antarmuka Web Chatbot.
4. Memberikan **naskah presentasi siap pakai (word-by-word script)** dan skenario demo live di hadapan dosen penguji.

---

## 📌 SLIDE 1: MENGAPA SEMANTIC SEARCH? (LEXICAL VS SEMANTIC)

### 1. Masalah Utama Pencarian Konvensional (Lexical Search)
- **Cara Kerja Lexical Search (SQL `LIKE %...%`, grep, BM25)**:
  Hanya mencocokkan kemunculan karakter string atau kata kunci yang persis sama (*exact keyword match*).
- **Kelemahan Fatal**:
  Jika pengguna mencari: *"Bagaimana cara izin tidak kuliah satu semester?"*,  
  sedangkan dokumen resmi kampus menulis judul: *"SOP Permohonan Cuti Akademik"*.
  - Lexical search akan menghasilkan: **0 hasil (Nihil)**, karena kata *"izin tidak kuliah"* tidak ada di dokumen.

### 2. Solusi: Semantic Vector Search (k-NN)
- **Cara Kerja Semantic Search**:
  Teks dokumen dan kueri pengguna tidak dicocokkan berdasarkan ejaan kata, melainkan diubah menjadi representasi makna matematis berupa koordinat vektor rapat (*dense vector*) berdimensi tinggi (768 dimensi menggunakan model `nomic-embed-text`).
- **Hasilnya**:
  Kalimat *"izin tidak kuliah"* dan *"cuti akademik"* memiliki sudut arah vektor yang berdekatan dalam ruang 768 dimensi. OpenSearch k-NN menghitung jarak sudut (*Cosine Similarity*) dan **berhasil menemukan dokumen yang tepat dengan skor relevansi di atas 0.83 (83%)**!

### 3. Tabel Perbandingan Cepat untuk Dosen
| Parameter | Lexical Search (BM25 / SQL LIKE) | Semantic Search (DuoAI k-NN) |
| :--- | :--- | :--- |
| **Pencocokan** | Ejaan kata persis (*Exact string match*) | Makna & konteks semantik (*Concept similarity*) |
| **Menangani Sinonim** | ❌ Gagal total tanpa kamus sinonim manual | ✅ Otomatis memahami padanan kata & konteks |
| **Toleransi Typo** | ❌ Rendah | ✅ Tinggi (vektor tetap memiliki kedekatan orientasi) |
| **Format Representasi** | Teks mentah / Inverted Index | Dense Vector Float 768-D (`nomic-embed-text`) |
| **Mesin Pencari** | Database relasional / Lucene standar | OpenSearch k-NN Index (HNSW Graph Engine) |

---

## 🔄 SLIDE 2: ARSITEKTUR & PIPELINE INDEXING DOKUMEN (HULU KE HILIR)

Bagaimana sebuah file Markdown (`.md`) di laptop dapat dicari maknanya oleh AI?  
Proses ini disebut **Vector Ingestion & Indexing Pipeline**:

```
[ 1. Dokumen Mentah ]  --> knowledge-base/sop-cuti-akademik.md
         │
         ▼
[ 2. Text Extraction & Chunking ] --> app/ingest.py & rag_engine.py
         │                        - Potong per heading & paragraf (~800 karakter)
         ▼
[ 3. Dense Embedding Generation ] --> Ollama /api/embed (Model: nomic-embed-text)
         │                        - Mengubah teks menjadi array 768 angka float:
         │                          [0.0124, -0.0451, ..., 0.0892] (dimensi: 768)
         ▼
[ 4. OpenSearch Vector Store ]    --> app/vector_store.py
         │                        - Buat index 'nala-academic-docs' (k-NN enabled)
         │                        - Simpan via PUT /nala-academic-docs/_doc/{doc_id}
         ▼
[ 5. HNSW Graph Construction ]    --> OpenSearch k-NN Plugin (Engine: nmslib)
                                  - Membangun struktur graf multi-layer untuk
                                    pencarian k-NN sub-milidetik.
```

### Bedah Komponen Indexing:
1. **Pemilihan Model Embedding (`nomic-embed-text`)**:
   - Menghasilkan vektor padat berdimensi **768 float**.
   - Bersifat **ternormalisasi (*unit vector*)**: panjang norm $\|V\| = 1.0$.
   - Berjalan lokal (*on-device*) melalui Ollama tanpa ketergantungan API cloud pihak ketiga.
2. **Skema Pemetaan Indeks OpenSearch (`nala-academic-docs`)**:
   ```json
   {
     "settings": {
       "index": { "knn": true }
     },
     "mappings": {
       "properties": {
         "text": { "type": "text" },
         "embedding": {
           "type": "knn_vector",
           "dimension": 768,
           "method": {
             "name": "hnsw",
             "engine": "nmslib",
             "space_type": "cosinesimil"
           }
         },
         "metadata": { "type": "object" }
       }
     }
   }
   ```
3. **Idempotent Ingestion (`doc_id = filename`)**:
   - Jika proses ingest dijalankan 10 kali sekalipun, jumlah dokumen di OpenSearch tidak akan berlipat ganda karena menggunakan `PUT /nala-academic-docs/_doc/{filename}?refresh=true` (timpa/update dokumen jika ID sama).

---

## 📐 SLIDE 3: CARA KERJA TEMU BALIK SEMANTIK (RETRIEVAL k-NN)

Saat pengguna mengirimkan pertanyaan di ruang obrolan:
1. **Query Embedding**: Pertanyaan diubah menjadi vektor 768-D oleh `nomic-embed-text`.
2. **k-NN Vector Query**: Payload k-NN dikirim ke OpenSearch REST API:
   ```json
   POST /nala-academic-docs/_search
   {
     "size": 5,
     "query": {
       "knn": {
         "embedding": {
           "vector": [ 0.0142, -0.0521, ..., 0.0718 ],
           "k": 5
         }
       }
     }
   }
   ```
3. **Kalkulasi Cosine Similarity**:
   $$\text{Cosine Similarity}(A, B) = \frac{A \cdot B}{\|A\| \|B\|}$$
   Karena vektor telah ternormalisasi $(\|A\| = 1, \|B\| = 1)$, maka:
   $$\text{Cosine Similarity}(A, B) = A \cdot B = \sum_{i=1}^{768} A_i B_i$$
4. **Ranking & Top-K Context Injection**:
   OpenSearch mengembalikan 5 potongan dokumen paling relevan. RAG engine menyatukan potongan teks tersebut ke dalam **System Prompt LLM** sebagai referensi fakta mutlak.
---

## 💻 SLIDE 4: PANDUAN LENGKAP CARA PAKAI & PENGUJIAN (HOW-TO-USE)

Bagaimana cara mendemonstrasikan sistem ini secara langsung saat presentasi? Berikut adalah 4 metode pengujian:

### Metode 1: Menjalankan Indexing Dokumen (Terminal)
Pastikan kontainer Docker menyala (`docker compose up -d`). Jalankan perintah:
```bash
# Opsi A: Jalankan ingest via container rag
docker compose exec rag python3 rag_engine.py --ingest-opensearch

# Opsi B: Jalankan modul ingest langsung
python3 -m app.ingest
```
*Output Terminal*:
```text
[rag] Ingest selesai: 3 dokumen ter-index ke 'nala-academic-docs'.
- presiden-indonesia.md: OK (768 dimensi)
- sop-cuti-akademik.md: OK (768 dimensi)
- sop-pendaftaran-krs.md: OK (768 dimensi)
```

### Metode 2: Verifikasi Visual via OpenSearch Dashboards (GUI)
1. Buka browser ke alamat: **`http://localhost:5601`**
2. Masuk ke menu **Dev Tools** di sidebar kiri.
3. Jalankan query untuk mengecek dokumen ter-index:
   ```http
   GET nala-academic-docs/_search
   {
     "query": { "match_all": {} }
   }
   ```
4. Anda akan melihat dokumen lengkap dengan field `embedding` berisi 768 angka float dan field `text` aslinya.

### Metode 3: Menguji Temu Balik Semantik Langsung via cURL
Tunjukkan kemampuan semantic search di terminal tanpa melalui chatbot:
```bash
# Uji: Pertanyaan tentang izin cuti (tanpa kata persis 'cuti')
curl -s -X POST http://localhost:8080/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "bagaimana cara izin tidak kuliah satu semester?", "top_k": 3}' | jq .
```
*Hasil JSON*:
```json
{
  "context": "[sop-cuti-akademik.md] Permohonan Cuti Akademik dapat diajukan...",
  "sources": [
    { "source": "sop-cuti-akademik.md", "score": 0.8395 },
    { "source": "sop-pendaftaran-krs.md", "score": 0.7120 }
  ],
  "engine": "opensearch"
}
```
> **Poin Kunci Demo**: Perhatikan bahwa skor `0.8395` diraih oleh dokumen `sop-cuti-akademik.md` meskipun kata kueri kita sama sekali tidak mengandung kata "cuti"!

### Metode 4: End-to-End Chatbot melalui Web UI
1. Buka **`http://localhost:8080`** di browser.
2. Buka jendela **DuoAI Copilot** di pojok kanan bawah.
3. Ketik pertanyaan: *"Berapa batas maksimal cuti akademik yang diizinkan kampus?"*
4. AI akan menjawab secara presisi sesuai SOP kampus: *"Berdasarkan SOP Cuti Akademik, mahasiswa diizinkan mengambil cuti maksimal 2 semester..."* dan mencantumkan sumber dokumennya.

---

## 🛠️ SLIDE 5: BEDAH KODE TEKNIS (CODE WALKTHROUGH)

Berikut berkas-berkas kunci implementasi Semantic Search di repo ini:

### 1. `app/vector_store.py` (Klien REST OpenSearch Zero-Dependency)
- Dibuat murni menggunakan `urllib` bawaan Python standard library (stdlib) tanpa perlu menginstall library pihak ketiga.
- **Metode Utama**:
  - `ensure_index(index_name)`: Membuat indeks k-NN jika belum ada (idempotent HEAD check).
  - `index_document(index_name, doc_id, text, embedding, metadata)`: Menyimpan vektor dan teks dengan parameter `refresh=true`.
  - `search(index_name, query_embedding, k=5)`: Melakukan pencarian vektor k-NN dengan mengembalikan array `hits`.

### 2. `app/embeddings.py` (Ollama Embedding Client)
- Menghubungkan aplikasi ke endpoint Ollama:
  - Mengirim teks ke `POST /api/embed` dengan model `nomic-embed-text`.
  - Mengembalikan list vektor 768 dimensi.
  - Memiliki mekanisme *fallback* otomatis ke `/api/embeddings` jika Ollama menggunakan versi legacy.

### 3. `rag_engine.py` (Microservice RAG & Graceful Degradation)
- Berjalan sebagai server HTTP mandiri di port 8000 (`ThreadingHTTPServer`).
- Menyediakan endpoint `POST /query`.
- **Fitur Ketahanan Tinggi (*Graceful Fallback*)**:
  Jika OpenSearch aktif $\rightarrow$ Menggunakan k-NN OpenSearch.  
  Jika OpenSearch mati/restart $\rightarrow$ Secara mulus beralih ke *In-Memory Cosine Similarity* lokal tanpa membuat aplikasi crash!

### 4. `websitekeuangan-v2/app.js` (Frontend Dynamic Pre-Fetch)
- Sebelum prompt obrolan dikirim ke model LLaMA 3.2, frontend mengeksekusi request:
  `fetch('/rag/query', { body: JSON.stringify({ query: userText, top_k: 5 }) })`
- Hasil teks dokumen yang relevan langsung digabungkan ke dalam System Prompt AI.

---

## 🎤 SLIDE 6: NASKAH PRESENTASI & SKENARIO LIVE DEMO (5 MENIT SUKSES)

Gunakan naskah ini saat giliran Anda berbicara di hadapan dosen:

### Naskah Pembuka (Menit 00:00 - 01:30):
> *"Selamat pagi/siang Bapak/Ibu Dosen Penguji. Hari ini kami akan membedah salah satu modul paling krusial dalam sistem DuoAI, yaitu **Semantic Search Engine berbasis OpenSearch dan nomic-embed-text**.*  
> 
> *Masalah terbesar pada asisten AI kampus konvensional adalah halusinasi dan ketidakmampuan mencari informasi secara cerdas jika kata kuncinya berbeda. Jika mahasiswa bertanya 'cara izin off kuliah', sistem berbasis kata kunci biasa akan menghasilkan nol karena dokumen resmi berjudul 'SOP Cuti Akademik'.*  
> 
> *Untuk memecahkan masalah ini, kami mengimplementasikan Semantic Vector Search. Seluruh SOP akademik kami transformasikan menjadi vektor koordinat rapat 768 dimensi. Sehingga yang dicocokkan bukanlah ejaan kata, melainkan kedekatan makna matematis dalam ruang semantik."*

### Naskah Demonstrasi Live (Menit 01:30 - 03:30):
> *"Sekarang mari kita buktikan secara langsung pada sistem:*  
> *(1) Pertama, kami perlihatkan proses **Indexing**. Dokumen SOP akademik kami proses melalui model embedding dan kami simpan ke OpenSearch dengan metode HNSW dan Cosine Similarity.*  
> *(2) Mari kita jalankan kueri k-NN via terminal:*  
> `curl -s -X POST http://localhost:8080/rag/query -d '{"query": "izin tidak kuliah", "top_k": 3}'`  
> *(Tunjukkan hasil JSON di layar).*  
> *Dapat kita lihat, dokumen `sop-cuti-akademik.md` keluar di posisi teratas dengan skor kemiripan 0.8395!*  
> *(3) Di antarmuka aplikasi web, hasil temu balik semantik ini disuntikkan secara dinamis ke konteks LLaMA 3.2, sehingga AI menjawab dengan regulasi kampus yang 100% faktual tanpa halusinasi."*

### Naskah Live Proof Spontan Dosen (Menit 03:30 - 05:00):
> *"Jika Bapak/Ibu dosen ingin menguji keabsahan sistem ini, mari kita lakukan uji coba spontan sekarang:*  
> *Kami buat satu file dokumen baru di folder `knowledge-base/`, misalnya `jadwal-uas.md` yang memuat tanggal ujian yang belum pernah dipelajari oleh model AI.*  
> *Kami jalankan `python3 -m app.ingest` dalam 3 detik, lalu kita tanyakan di chatbot.*  
> *Sistem secara instan mampu menjawab tanggal ujian tersebut dengan tepat karena dokumen baru telah terindeks ke dalam OpenSearch!"*

---

## 🛡️ SLIDE 7: KISI-KISI PERTANYAAN KRITIS DOSEN & CARA MENJAWABNYA

#### Q1: "Mengapa menggunakan dimensi 768 bukan 1536 atau 384?"
* **Jawaban**: *"Dimensi 768 merupakan dimensi native dari arsitektur `nomic-embed-text`. Dimensi 768 adalah titik optimal (sweet spot) antara kekayaan representasi semantik bahasa Indonesia dan efisiensi memori RAM saat komputasi graf HNSW di perangkat lokal."*

#### Q2: "Mengapa memilih algoritma HNSW dibanding Inverted Flat (IVF)?"
* **Jawaban**: *"HNSW (Hierarchical Navigable Small World) membangun struktur graf multi-layer yang memungkinkan pencarian tetangga terdekat dengan kompleksitas waktu $O(\log N)$ dan memberikan Recall yang sangat tinggi (>95%) pada latensi sub-milidetik, sangat ideal untuk kueri real-time pada chatbot."*

#### Q3: "Mengapa Cosine Similarity dipilih dibanding L2 (Euclidean Distance)?"
* **Jawaban**: *"Cosine Similarity mengukur sudut orientasi arah makna tanpa dipengaruhi oleh panjang pendeknya kalimat. Selain itu, karena output `nomic-embed-text` sudah berupa unit vector ternormalisasi ($\|V\| = 1$), secara matematis ranking dokumen pada Cosine Similarity, Dot Product, dan L2 Distance terbukti 100% identik!"*

