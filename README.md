# PDS Kelas A — Kelompok 7
## DuoAI Copilot: Financial Assistant & Academic RAG System

Repositori resmi untuk proyek mata kuliah **Pengembangan Data Science (PDS)** Kelas A — Kelompok 7.

---

## 📁 Struktur Repositori

Semua modul kode, arsitektur container, knowledge base, dan frontend aplikasi terorganisir rapi di dalam folder **`rag/`**:

```text
PDS_A_Kel7/
├── README.md                           # Dokumentasi utama repositori
└── rag/                                # Direktori utama seluruh modul RAG & Aplikasi
    ├── app/                            # Microservice Vector Store & Ingest
    │   ├── embeddings.py               # Penghasil vektor 768-D via nomic-embed-text
    │   ├── ingest.py                   # Data ingestion pipeline ke OpenSearch
    │   └── vector_store.py             # Client k-NN & index management OpenSearch
    ├── doc/                            # Dokumentasi, checklist tugas, & panduan sidang
    │   ├── PANDUAN_PRESENTASI_DAN_BEDAH_KODE_LENGKAP.md  # Materi ujian & bedah baris kode
    │   ├── CHECKLIST_PERTEMUAN6.md     # Verifikasi modul 10-12
    │   ├── CHECKLIST_PERTEMUAN7.md     # Verifikasi modul 13-16
    │   └── PANDUAN_PENGGUNA.md         # Panduan operasional DuoWallet
    ├── docker/                         # Konfigurasi container
    │   ├── Dockerfile.rag              # Image untuk microservice FastAPI
    │   ├── nginx.conf                  # Reverse proxy & GPU load balancer
    │   └── init-ollama.sh              # Skrip inisialisasi model lokal
    ├── knowledge-base/                 # Dokumen Markdown sumber pengetahuan RAG
    │   ├── presiden-indonesia.md       # Data sejarah presiden RI
    │   ├── sop-cuti-akademik.md        # SOP pengajuan cuti kuliah
    │   └── sop-pendaftaran-krs.md      # SOP perwalian dan kartu rencana studi
    ├── websitekeuangan-v2/             # Frontend web aplikasi DuoWallet & Copilot
    │   ├── index.html                  # Halaman utama aplikasi
    │   ├── app.js                      # Logika DuoAI Copilot & komunikasi RAG
    │   └── styles.css                  # Desain visual antarmuka
    ├── docker-compose.yml              # Orkestrasi 5 container (Web, RAG, OpenSearch, Dashboards, Ollama)
    ├── rag_engine.py                   # FastAPI service penyedia endpoint /query k-NN
    └── test_modules_13_16.py           # Unit testing & validasi end-to-end
```

---

## 🚀 Panduan Memulai Cepat (Quickstart)

### 1. Menjalankan Seluruh Service (Docker)
Masuk ke direktori `rag/`:
```bash
cd rag
docker compose up -d
```
Layanan akan aktif pada port:
* **Web UI DuoWallet**: [http://localhost:8080](http://localhost:8080)
* **OpenSearch Dashboards**: [http://localhost:5601](http://localhost:5601)
* **OpenSearch REST API**: [http://localhost:9200](http://localhost:9200)
* **RAG Engine FastAPI**: [http://localhost:8000](http://localhost:8000)

### 2. Mengisi Dokumen Knowledge Base (Ingestion)
Untuk memasukkan dokumen dari `knowledge-base/` ke indeks k-NN OpenSearch:
```bash
python3 -m app.ingest
```

### 3. Menguji AI Copilot
Buka browser ke `http://localhost:8080`, buka widget **DuoAI Copilot**, dan ajukan pertanyaan:
* *"Siapa presiden kedua Indonesia?"*
* *"Bagaimana cara dan syarat mengajukan cuti kuliah?"*
* *"Apa saja tahapan pengisian KRS?"*

---

## 📖 Panduan Sidang & Pertahanan Modifikasi Dosen
Seluruh penjelasan baris demi baris, arsitektur inferensi GPU, dan simulasi tantangan modifikasi dosen tersedia lengkap di:
👉 **[`rag/doc/PANDUAN_PRESENTASI_DAN_BEDAH_KODE_LENGKAP.md`](rag/doc/PANDUAN_PRESENTASI_DAN_BEDAH_KODE_LENGKAP.md)**
