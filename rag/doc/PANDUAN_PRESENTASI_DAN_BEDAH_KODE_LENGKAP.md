# PANDUAN LENGKAP: DARI VIBE CODER KE MASTER RAG & OPENSEARCH
### Dokumen Rahasia Penguasaan Materi, Bedah File, & Pertahanan Ujian Sidang/Presentasi

---

## DAFTAR ISI
1. **BAB 1: Mental Model & Filosofi RAG (Konsep Dasar untuk Menjawab Penguji)**
2. **BAB 2: Arsitektur Sistem & Alur Data End-to-End (Peta Pertahanan)**
3. **BAB 3: Bedah Tuntas Seluruh File Proyek (Lokasi, Fungsi, Kode Kunci, & Cara Modifikasi)**
4. **BAB 4: Simulasi Tantangan Modifikasi Dosen (Live Coding Defense)**
5. **BAB 5: Bank Tanya-Jawab "Pembantaian" Dosen (Killer Q&A)**
6. **BAB 6: Cheat Sheet Terminal & Emergency Troubleshooting**

---

## BAB 1: MENTAL MODEL & FILOSOFI RAG
> *Kunci menjawab pertanyaan teoritis dosen: Jangan bicara kode dulu, gunakan analogi yang membuat dosen langsung paham bahwa Anda mengerti konsep fundamental.*

### 1.1 Apa Masalah Terbesar AI / LLM Standar?
LLM (seperti ChatGPT, LLaMA, Qwen) memiliki dua kelemahan fatal:
1. **Knowledge Cutoff & Tidak Tahu Data Internal**: Model hanya pintar sampai batas data saat ia dilatih. Ia tidak tahu SOP kampus Anda, kebijakan UKT terbaru, atau daftar pengeluaran dompet Anda.
2. **Halusinasi (Mengarang Bebas)**: Ketika ditanya hal spesifik yang tidak diketahuinya, LLM cenderung mengarang jawaban dengan gaya bahasa yang sangat meyakinkan.

### 1.2 Kenapa Bukan Fine-Tuning? (Pertanyaan Jebakan Dosen)
*Dosen sering bertanya:* *"Kenapa tidak kamu fine-tuning saja modelnya dengan data SOP kampus?"*
*Jawaban Mantap:*
> *"Fine-tuning itu ibarat mengirim dokter sekolah lagi selama berbulan-bulan hanya untuk menghafal satu lembar jadwal piket baru. Biayanya mahal (butuh GPU ratusan jam), prosesnya lambat, dan jika jadwal piket berubah besok pagi, kita harus melatih ulang dari nol.*  
> *Sedangkan **RAG (Retrieval-Augmented Generation)** ibarat memberikan **buku panduan terkini** di atas meja dokter saat ujian (open-book exam). Jika ada aturan baru yang terbit hari ini, kita cukup meletakkan dokumennya di OpenSearch tanpa perlu melatih ulang model AI sedetik pun."*

### 1.3 Analogi 3 Komponen Inti
1. **OpenSearch (Perpustakaan & Katalog Cepat)**:
   - Menyimpan seluruh lembaran dokumen teks beserta **koordinat maknanya** (disebut Vektor Embedding).
   - Saat ada pertanyaan masuk, OpenSearch bertugas mencari 3 sampai 5 paragraf dokumen yang paling relevan dalam hitungan 0.005 detik menggunakan algoritma k-NN (*k-Nearest Neighbors*).
2. **Embedding Model (`nomic-embed-text`) (Penerjemah Bahasa ke Angka)**:
   - Komputer tidak mengerti kata "Presiden" atau "Cuti Kuliah".
   - Embedding model bertugas mengubah kalimat manusia menjadi **deretan 768 angka desimal** (vektor multidimensi). Kalimat dengan makna mirip akan memiliki koordinat angka yang berdekatan.
3. **Ollama / LLM (`duoai-copilot` / LLaMA / Qwen) (Sang Juru Bicara)**:
   - Membaca dokumen yang disodorkan oleh OpenSearch, lalu merangkai jawaban bahasa manusia yang ramah, santun, dan padat ke pengguna.

---

## BAB 2: ARSITEKTUR SISTEM & ALUR DATA END-TO-END

### 2.1 Diagram Alur Komunikasi Sistem
```
[ Browser Klien (DuoWallet UI) ]
             │
             │ (1) User mengetik: "Siapa presiden kedua?"
             ▼
[ Port 8080 : Nginx Reverse Proxy ]
   ├───> (2) /rag/query ──> [ Port 8000 : FastAPI (rag_engine.py) ]
   │                                     │
   │                                     ├──> Ubah query jadi vektor 768-D via Ollama (:11434)
   │                                     └──> k-NN Search ke OpenSearch (:9200)
   │                                     <──  Mengembalikan 3 dokumen paling mirip
   │
   └───> (3) /api/chat ───> [ Port 11434 : Host Ollama GPU Metal ]
                                         │
                                         ├── Input: System Prompt + Dokumen dari RAG + Pertanyaan User
                                         └── Output: "Presiden Kedua Indonesia adalah Soeharto."
             │
             ▼ (4) Menampilkan respon cerdas di balon chat UI (<2 detik)
```

### 2.2 Fungsi Setiap Port Jaringan (Hafalkan Ini!)
- **Port 8080 (`duoai-web`)**: Pintu masuk utama aplikasi web (Nginx). Menghilangkan masalah CORS (*Cross-Origin Resource Sharing*) karena frontend memanggil backend melalui origin yang sama.
- **Port 8000 (`duoai-rag`)**: Layanan microservice FastAPI (`rag_engine.py`) yang mengelola logika pencarian semantik vektor ke OpenSearch.
- **Port 9200 (`duoai-opensearch`)**: REST API database OpenSearch untuk operasi simpan (indexing) dan cari (k-NN search).
- **Port 5601 (`duoai-opensearch-dashboards`)**: Antarmuka visual web (GUI) untuk monitoring database, melihat visualisasi index, dan menjalankan query via Dev Tools.
- **Port 11434 (`duoai-ollama` / Host Ollama)**: Server inferensi LLM lokal dan penghasil vektor embedding.

---

## BAB 3: BEDAH TUNTAS SELURUH FILE PROYEK

### 3.1 Berkas: `app/ingest.py`, `app/embeddings.py`, & `app/vector_store.py`
* **Lokasi**: Folder `/Volumes/ssd atha/rag/app/`
* **Fungsi Utama**: "Pabrik Pengolah Data". Skrip Python mandiri yang membaca seluruh file dokumen di folder `knowledge-base/`, memotongnya menjadi teks ringkas (*chunking*), memanggil Ollama untuk menghitung vektor embedding (`app/embeddings.py`), lalu menyimpannya ke dalam index OpenSearch `nala-academic-docs` (`app/vector_store.py`).
* **Cara Eksekusi**: `python3 -m app.ingest` (dijalankan dari root folder `rag`).

#### Bedah Baris Kode Kunci:
1. **Inisialisasi Model & Dimensi Vektor:**
   ```python
   EMBED_MODEL = os.getenv("EMBED_MODEL", "nomic-embed-text")
   INDEX_NAME = os.getenv("OPENSEARCH_INDEX", "nala-academic-docs")
   DIMENSION = 768  # nomic-embed-text menghasilkan tepat 768 dimensi vektor
   ```
   *Kenapa 768?* Karena model `nomic-embed-text` secara arsitektur selalu memetakan kalimat ke dalam ruang vektor berdimensi 768. Jika diisi angka lain, OpenSearch akan melempar error *dimension mismatch*.

2. **Membuat Indeks Berbasis k-NN di OpenSearch:**
   ```python
   mapping = {
       "settings": {"index": {"knn": True}},
       "mappings": {
           "properties": {
               "text": {"type": "text"},
               "source": {"type": "keyword"},
               "embedding": {
                   "type": "knn_vector",
                   "dimension": 768,
                   "method": {
                       "name": "hnsw",
                       "space_type": "cosinesimil",
                       "engine": "nmslib"
                   }
               }
           }
       }
   }
   ```
   *Istilah Penting:*
   - `knn: True`: Mengaktifkan pencarian tetangga terdekat (Nearest Neighbors).
   - `name: hnsw`: Hierarchical Navigable Small World, struktur data graf super cepat untuk pencarian vektor berskala jutaan data.
   - `space_type: cosinesimil`: Mengukur kemiripan arah sudut vektor (nilai 0.0 sampai 1.0), bukan panjang kalimat.

---

### 3.2 Berkas: `rag_engine.py`
* **Lokasi**: Root folder `/Volumes/ssd atha/rag/rag_engine.py`
* **Fungsi Utama**: Layanan Web API (Microservice) menggunakan FastAPI. Menyediakan endpoint HTTP `POST /query` yang menerima pertanyaan pengguna, mengonversi pertanyaan menjadi vektor, mencari dokumen terdekat di OpenSearch, lalu merangkumnya menjadi `context`.

#### Bedah Baris Kode Kunci:
1. **Endpoint Query (`/query`):**
   ```python
   @app.post("/query")
   def query_endpoint(req: QueryRequest):
       # 1. Ubah query teks user menjadi 768-D vektor
       q_vec = embed_query(req.query)
       # 2. Eksekusi pencarian kemiripan vektor di OpenSearch
       docs = search_vector(q_vec, top_k=req.top_k)
       # 3. Gabungkan hasil potongan dokumen menjadi satu teks konteks
       context_text = "\n\n---\n\n".join([d["text"] for d in docs])
       return {"context": context_text, "sources": docs, "engine": "opensearch"}
   ```
2. **Kueri k-NN OpenSearch:**
   ```python
   body = {
       "size": top_k,
       "query": {
           "knn": {
               "embedding": {
                   "vector": query_vector,
                   "k": top_k
               }
           }
       }
   }
   ```

---

### 3.3 Berkas: `websitekeuangan-v2/app.js`
* **Lokasi**: `/Volumes/ssd atha/rag/websitekeuangan-v2/app.js`
* **Fungsi Utama**: Logika frontend Copilot UI. Menangkap teks yang diketik pengguna di layar, melakukan *pre-fetch* RAG ke `/rag/query`, menyisipkan konteks tersebut ke dalam *System Prompt*, lalu mengirimkannya ke model Ollama `/api/chat`.

#### Bedah Baris Kode Kunci:
1. **Pemanggilan Layanan RAG (baris ~1604):**
   ```javascript
   const rRes = await fetch(`${ollamaEndpoint}/rag/query`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ query: userQuery, top_k: 5 }),
     signal: rCtrl.signal
   });
   ```
2. **Injeksi Konteks RAG ke System Prompt (baris ~1636):**
   ```javascript
   if (ragContext) {
     sysPrompt += `\n\nKONTEKS PENGETAHUAN / KNOWLEDGE BASE (Gunakan informasi faktual berikut sebagai rujukan utama untuk menjawab pertanyaan):\n${ragContext}`;
   }
   ```
3. **Timeout Protektif & Fallback Cerdas (baris ~1641 & 1852):**
   - Timeout diset 120 detik agar inferensi LLM di perangkat lokal sempat selesai tanpa terpotong.
   - Jika koneksi ke Ollama putus, sistem tetap menyajikan potongan jawaban dari `ragContext` OpenSearch secara langsung (graceful fallback).

---

### 3.4 Berkas: `docker/nginx.conf` & `docker-compose.yml`
* **Fungsi Utama**: Orkestrator infrastruktur kontainer dan jalur distribusi jaringan same-origin bebas CORS.
* **Trik Arsitektur Pintar yang Kita Terapkan:**
   ```nginx
   upstream ollama_backend {
       server host.docker.internal:11434; # Prioritas 1: GPU Apple Silicon Mac Host
       server ollama:11434 backup;        # Prioritas 2 (Cadangan): CPU Docker Container
   }
   ```
   *Kenapa ini penyelamat presentasi?* Di laptop Mac, Docker menjalankan Linux VM yang tidak memiliki akses GPU Metal untuk Ollama (hanya emulasi CPU lambat, 1 jawaban memakan 2 menit). Dengan upstream ke `host.docker.internal:11434`, inferensi diarahkan ke Ollama yang berjalan langsung di GPU Apple Silicon MacBook Anda. Hasilnya, jawaban muncul dalam **1 sampai 2 detik saja** di depan penguji!

---

### 3.5 Berkas: `knowledge-base/` (Data Knowledge Base)
* **Lokasi**: Folder `/Volumes/ssd atha/rag/knowledge-base/`
* **Isi Dokumen Saat Ini**:
   - `presiden-indonesia.md` (Riwayat presiden 1 sampai 8)
   - `sop-cuti-akademik.md` (Syarat dan tahapan pengajuan cuti kuliah)
   - `sop-pendaftaran-krs.md` (Tahapan perwalian dan pengisian KRS)
* **Aturan Emas Penulisan Dokumen Baru**:
   - Gunakan format Markdown rapi dengan heading (`#`, `##`).
   - Tulis kalimat deklaratif (fakta lugas) dan sertakan sinonim istilah umum.

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

### Tantangan 3: "Coba ubah gaya bahasa AI menjadi super formal atau bahasa Jawa / Sunda!"
* **File yang Diedit**: `websitekeuangan-v2/app.js` (bagian `sysPrompt`, baris ~1622).
* **Langkah Eksekusi**:
  ```javascript
  let sysPrompt = `Anda adalah DuoAI, asisten akademik super formal berbahasa Indonesia baku sesuai KBBI.
Gunakan sapaan 'Bapak/Ibu Mahasiswa'. Jawab selalu dengan format poin bernomor dan bahasa yang sangat santun.`;
  ```
* Refresh browser dan uji chat. Respon seketika berubah gaya bahasanya mengikuti instruksi system prompt tersebut.

---

### Tantangan 4: "Bagaimana cara membuang dokumen jika skor kemiripannya terlalu rendah?"
* **File yang Diedit**: `rag_engine.py` (pada fungsi `query_endpoint`).
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

## BAB 5: BANK TANYA-JAWAB "PEMBANTAIAN" DOSEN (KILLER Q&A)

### Q1: "Kenapa menggunakan k-NN Vector Search di OpenSearch, bukan Full-Text Search biasa (seperti BM25 atau SQL LIKE)?"
* **Jawaban Mantap**:
  > *"Pencarian kata kunci biasa (BM25/SQL LIKE) hanya mencocokkan kemunculan huruf persis (syntactic match). Jika dokumen menulis 'SOP Istirahat Studi', tetapi mahasiswa mencari dengan kalimat 'Bagaimana cara cuti kuliah?', pencarian kata kunci biasa akan menghasilkan 0 hasil karena kata 'cuti' dan 'istirahat' berbeda.*  
  > *Sedangkan k-NN Vector Search mencocokkan makna semantik (semantic similarity). Kalimat 'cuti kuliah' dan 'istirahat studi' dipetakan ke koordinat vektor yang berdekatan dalam ruang 768 dimensi, sehingga dokumen tetap ditemukan dengan akurat."*

### Q2: "Kenapa Anda memilih metrik `cosinesimil` (Cosine Similarity), bukan `l2` (Euclidean Distance)?"
* **Jawaban Mantap**:
  > *"Euclidean Distance (L2) mengukur jarak absolut antar titik, yang sangat dipengaruhi oleh panjang-pendeknya teks. Jika ada dokumen yang panjang dan ada yang pendek, jarak L2-nya bisa menjauh meskipun topiknya sama.*  
  > *Sedangkan Cosine Similarity mengukur sudut kemiringan (arah) antar dua vektor, bukan panjangnya. Nilainya dinormalisasi antara 0 sampai 1 (1.0 = persis sama maknanya). Ini jauh lebih cocok untuk dokumen teks yang panjangnya bervariasi."*

### Q3: "Kenapa dimensinya harus tepat 768? Bolehkah saya ganti jadi 1536 atau 512?"
* **Jawaban Mantap**:
  > *"Dimensi vektor ditentukan secara permanen oleh arsitektur model embedding yang digunakan. Model `nomic-embed-text` yang kita gunakan menghasilkan representasi Dense Vector berukuran tepat 768 angka desimal (768 dimensi).*  
  > *Jika kita ubah dimensi di OpenSearch menjadi 512 atau 1536 tanpa mengganti model embedding-nya, OpenSearch akan menolak data tersebut karena terjadi Dimensionality Mismatch."*

### Q4: "Apa itu HNSW pada pengaturan index OpenSearch?"
* **Jawaban Mantap**:
  > *"HNSW singkatan dari Hierarchical Navigable Small World. Ini adalah algoritma struktur data graf multi-layer yang memungkinkan pencarian tetangga terdekat secara aproksimasi (Approximate Nearest Neighbors - ANN) dalam kompleksitas waktu O(log N).*  
  > *Tanpa HNSW (misalnya menggunakan Exact Flat k-NN), sistem harus membandingkan query dengan seluruh dokumen satu per satu (O(N)), yang akan sangat lambat jika dokumen sudah mencapai puluhan ribu."*

### Q5: "Bagaimana sistem Anda menjamin data privasi keuangan pengguna tidak bocor saat menggunakan AI?"
* **Jawaban Mantap**:
  > *"Ada 2 lapis pengamanan: Pertama, data sensitif transaksi disimpan di Local Storage browser pengguna secara terisolasi berdasarkan Session ID. Kedua, pada System Prompt di `app.js`, kami menerapkan System-Level Guardrails yang secara ketat melarang AI menjawab saldo atau mutasi akun lain jika pengguna yang sedang aktif bukan pemilik akun tersebut."*

---

## BAB 6: CHEAT SHEET TERMINAL & EMERGENCY TROUBLESHOOTING

### 6.1 Perintah Terminal Wajib Hafal
1. **Mengecek Status Seluruh Kontainer:**
   ```bash
   docker ps
   ```
   *(Pastikan kelima kontainer berstatus `Up`: `duoai-web`, `duoai-rag`, `duoai-opensearch`, `duoai-opensearch-dashboards`, `duoai-ollama`).*

2. **Menjalankan Ingest Dokumen:**
   ```bash
   python3 -m app.ingest
   ```

3. **Menguji OpenSearch Secara Langsung via Curl:**
   ```bash
   # Cek kesehatan cluster OpenSearch:
   curl -s http://localhost:9200/_cluster/health | jq .

   # Cek jumlah dokumen dalam index:
   curl -s http://localhost:9200/nala-academic-docs/_count | jq .
   ```

4. **Menguji Endpoint RAG Python:**
   ```bash
   curl -s -X POST http://localhost:8000/query \
     -H "Content-Type: application/json" \
     -d '{"query": "cuti kuliah", "top_k": 2}' | jq .
   ```

5. **Menguji Respon Chat LLM (Port 8080):**
   ```bash
   curl -s -X POST http://localhost:8080/api/chat \
     -d '{"model": "duoai-copilot", "messages": [{"role": "user", "content": "halo"}], "stream": false}' | jq .
   ```

---

### 6.2 Emergency Troubleshooting (Jika Tiba-Tiba Error di Depan Dosen)
1. **Masalah: Browser menjawab teks aneh atau tidak berubah.**
   - *Penyebab*: Cache JavaScript browser belum diperbarui.
   - *Solusi Darurat*: Tekan **Cmd + Shift + R** (Mac) atau **Ctrl + F5** (Windows) untuk memaksa browser mengunduh ulang file JavaScript terbaru.

2. **Masalah: AI merespon sangat lambat (>30 detik).**
   - *Penyebab*: Ollama di host Mac belum aktif sehingga request beralih ke kontainer Docker CPU.
   - *Solusi Darurat*: Buka aplikasi Ollama di Mac Anda (pastikan icon Ollama muncul di taskbar/menu bar Mac).

3. **Masalah: Kontainer mati mendadak.**
   - *Solusi Darurat*: Jalankan:
     ```bash
     docker compose up -d
     ```

