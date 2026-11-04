# PANDUAN KERJA DAN PEMBAGIAN PERAN (JOBDESK) PROYEK DUOAI
**Proyek:** DuoAI — Personal & Collaborative Financial Copilot  
**Metodologi Utama:** CRISP-DM (Cross-Industry Standard Process for Data Mining)  
**Teknologi Inti:** Local SLM (Llama 3.2 3B 4-bit via Ollama), Dynamic State Injection, Structured Action Parsing, LocalStorage API, Vanilla JS.

---

## 1. MENGAPA PROYEK INI DIBANGUN SEPERTI INI? (BIG PICTURE)

Sebelum membagi tugas, seluruh tim harus memahami **alasan mendasar filosofi sistem DuoAI**:
1. **Mengapa Pakai AI Lokal (On-Device), Bukan ChatGPT / Cloud API?**
   - *Privasi Finansial*: Data keuangan adalah data yang sangat sensitif. Jika dikirim ke server OpenAI/Anthropic di luar negeri, ada risiko kebocoran privasi dan biaya API per token.
   - *Tanpa Biaya Operasional*: Model 100% gratis berjalan di laptop pengguna secara offline tanpa kartu kredit atau kuota token.
2. **Mengapa Bukan Sekadar Aplikasi Form Catat Uang Biasa?**
   - Orang sering malas mencatat karena harus membuka form, memilih tanggal, mengetik nama toko, memilih kategori, dan memilih dompet. Dengan AI, cukup ketik santai: *"Beli baso aci 25rb pake gopay"*, sistem yang bekerja otomatis.
3. **Mengapa Ada Fitur Split-Bill & Safe-to-Spend?**
   - Mayoritas aplikasi keuangan hanya fokus pada individu tunggal. DuoAI memecahkan masalah riil pasangan muda/teman sekamar: belanja bareng, patungan, dan rasa cemas belanja berlebihan di tengah bulan.

---

## 2. PEMETAAN TANGGUNG JAWAB & ALUR CRISP-DM

| Tahapan CRISP-DM | Data Analyst (DA) | Data Scientist (DS) | Data Engineer (DE) | ML Engineer (MLE) |
| :--- | :--- | :--- | :--- | :--- |
| **01 Business Understanding** | Menetapkan metrik Safe-to-Spend & skenario split-bill | Menentukan batas domain teks finansial vs percakapan bebas | Menetapkan batasan arsitektur offline-first | Menganalisis batas spesifikasi hardware target (RAM 8-16 GB) |
| **02 Data Understanding** | Analisis kebiasaan transaksi, istilah nominal slang & alih kode daerah | Memetakan distribusi 8 pilar finansial & ground-truth label | Memetakan skema objek: Dompet, Transaksi, Hutang | Menghitung budget token context-window model |
| **03 Data Preparation** | Verifikasi agregasi saldo & pengelompokan kategori transaksi | Menyusun 66 pasang dialog ChatML (`generate_dataset.py`) | Membangun pipeline serialisasi state & format JSONL | Memformat token prompt Llama 3 (`<|begin_of_text|>`) |
| **04 Modeling** | Memantau kesesuaian rekomendasi finansial dengan sisa kuota | Merancang Dynamic State Injection & Few-shot prompt | Integrasi asinkronus ke endpoint Ollama | Kuantisasi model Q4_K_M, tuning temperature 0.2, & Rule Fallback |
| **05 Evaluation** | Pengujian Usabilitas Pengguna dengan kuesioner SUS | Uji akurasi sintaks JSON & Exact Match (EM) parameter | Analisis error parsing & integritas mutasi state | Pengukuran latensi inferensi (Tokens/s & TTFT) |
| **06 Deployment** | Pembuatan panduan pengguna & laporan analitik wawasan | Dokumentasi prompt template & taksonomi dialog | Manajemen LocalStorage & peredam bug reaktivitas web | Packaging server lokal & script instalasi Ollama |

---

## 3. PANDUAN DETAIL PER JOBDESK (PENJELASAN UNTUK PEMULA)

---

### A. DATA ANALYST (DA)

#### 1. Peran Utama
Menjadi jembatan antara kebutuhan manusia (pengguna) dengan sistem data. Memastikan aplikasi benar-benar memecahkan masalah psikologis dan praktis dalam mengatur uang.

#### 2. Mengapa Memilih Pendekatan Ini? (The "Why")
- **Mengapa butuh indikator *Safe-to-Spend*?**
  Manusia sulit mengira-ngira apakah uang 3 juta di tanggal 15 masih aman sampai akhir bulan. Indikator Safe-to-Spend membagi sisa uang bebas dengan sisa hari. Ini memberikan pedoman harian yang jelas: *"Hari ini kamu maksimal belanja Rp 100.000 agar tidak boncos"*.
- **Mengapa pengujian menggunakan *System Usability Scale (SUS)*?**
  Akurasi AI yang 100% tidak ada gunanya jika pengguna merasa aplikasinya membingungkan atau lambat. SUS adalah standar baku industri (10 pertanyaan skala 1-5) yang diakui secara akademis untuk mengukur tingkat kepuasan dan kemudahan penggunaan aplikasi secara objektif.

#### 3. Apa yang Dikerjakan & Dipelajari? (The "What" & "How")
- **Rumus Safe-to-Spend**:
  $$\text{Safe-to-Spend Harian} = \frac{\text{Saldo Bebas (Dompet Utama)} - \text{Target Tabungan}}{\text{Jumlah Hari Tersisa Bulan Ini}}$$
- **Akuntansi Kolaboratif (Split-Bill)**:
  - Transaksi patungan dibagi dua: bagian pengguna langsung mengurangi saldo kas/dompet, sedangkan bagian pasangan dicatat sebagai piutang (*Dimas owes*).
- **Metodologi SUS**:
  - Mengedarkan 10 kuesioner baku SUS kepada minimal 5–10 responden penguji.
  - Menghitung skor SUS: untuk pertanyaan bernomor ganjil dikurangi 1 ($X - 1$), untuk nomor genap nilai dikurangkan dari 5 ($5 - X$), lalu jumlahkan dan kalikan 2.5. Target nilai: $\ge 75$ (Kategori *Good* / Grade B+).
- **File Proyek Terkait**: `screens_personal.js`, `screens_collab.js`, Bab 1, 3, dan 7.2 Proposal.

---

### B. DATA SCIENTIST (DS)

#### 1. Peran Utama
Arsitek kecerdasan dan penalaran AI. Bertanggung jawab atas bagaimana AI memahami bahasa manusia, mengekstraksi data secara presisi, dan tidak berhalusinasi.

#### 2. Mengapa Memilih Pendekatan Ini? (The "Why")
- **Mengapa membuat dataset sintetis (66 pasang dialog) lewat *generate_dataset.py*?**
  Dataset riil mutasi bank nasabah tidak boleh disebar secara sembarangan karena hukum perlindungan data pribadi (UU PDP). Maka, kita membuat generator berbasis aturan (*rule-based semantic generator*) yang menghasilkan variasi kalimat realistis masyarakat Indonesia (bahasa gaul, alih kode Basa Sunda, singkatan) secara legal dan etis.
- **Mengapa menerapkan *Dynamic State Injection*?**
  LLM pada dasarnya hanya model teks probabilistik; ia tidak tahu sisa saldo dompet pengguna di dunia nyata. Jika pengguna bertanya *"Boleh beli kopi 40rb gak?"*, LLM tanpa konteks akan menebak asal-asalan. Dengan Dynamic State Injection, sebelum pesan dikirim ke LLM, sistem menyisipkan data saldo aktual ke dalam instruksi rahasia (*system prompt*).
- **Mengapa output harus *Structured Action Parsing* (JSON)?**
  Jika LLM menjawab berupa kalimat panjang seperti: *"Tentu, saya sudah mencatat baso aci 25rb ya kak"*, kode program website tidak bisa mengolahnya. Website butuh data pasti: `amount: 25000, category: Food, wallet: w_gopay`. Format JSON adalah jembatan penghubung antara kecerdasan bahasa LLM dan logika program aplikasi.
- **Mengapa metrik evaluasinya *Exact Match (EM)*?**
  Dalam perbankan/keuangan, tidak ada toleransi kesalahan angka. Jika pengeluaran Rp 35.000 diekstrak menjadi Rp 30.000, laporan keuangan rusak. *Exact Match* mengukur apakah angka, nama merchant, dan dompet cocok 100% tepat terhadap ground-truth.

#### 3. Apa yang Dikerjakan & Dipelajari? (The "What" & "How")
- **Format ChatML / ShareGPT**:
  Format standar pelatihan LLM modern dengan 3 role: `system` (instruksi aturan & live state), `user` (input ucapan), dan `assistant` (output aksi JSON).
- **8 Domain Percakapan Finansial**:
  1. *Expense Single*, 2. *Expense Shared / Split-Bill*, 3. *Income*, 4. *Safe-to-Spend Consultation*, 5. *Multi-turn Follow-up*, 6. *Budget Deficit Alert*, 7. *Ambiguous Confirmation*, 8. *Multilingual Code-Switching*.
- **File Proyek Terkait**: `generate_dataset.py`, `duoai_training_dataset.jsonl`, `test_inference_prompt.py`, Bab 5 dan 7.1 Proposal.

---

### C. DATA ENGINEER (DE)

#### 1. Peran Utama
Pembangun pipa data (*data pipeline*) dan pengelola integritas penyimpanan (*state storage*). Memastikan data yang dihasilkan AI masuk ke tempat yang benar dan tidak rusak.

#### 2. Mengapa Memilih Pendekatan Ini? (The "Why")
- **Mengapa menggunakan *Browser LocalStorage API* bukan Database Server (seperti PostgreSQL/MySQL)?**
  Sesuai komitmen awal: DuoAI adalah aplikasi yang memprioritaskan privasi penuh (*zero data leakage*). Dengan LocalStorage, seluruh data saldo dan transaksi tersimpan di memori peramban pengguna sendiri, tidak ada server terpusat yang bisa diretas atau bocor.
- **Mengapa butuh mutasi state yang *atomik*?**
  Jika terjadi transaksi split bill sebesar Rp 50.000 di mana pasangan berhutang Rp 25.000, ada dua perubahan data sekaligus: saldo dompet berkurang Rp 50.000 dan catatan piutang bertambah Rp 25.000. Kedua hal ini harus dieksekusi bersamaan (*atomik*). Jika salah satu gagal, catatan keuangan akan timpang.
- **Mengapa wajib ada *Regex Output Sanitizer* sebelum `JSON.parse()`?**
  Terkadang model LLM membungkus responsnya dengan teks obrolan ramah atau blok kode markdown ````json ... ````. Jika string kotor ini langsung dimasukkan ke fungsi `JSON.parse()`, JavaScript akan melempar *SyntaxError exception* dan aplikasi web akan macet (*crash*). Sanitizer berfungsi membersihkan bungkus tersebut agar hanya JSON murni yang diekstrak.

#### 3. Apa yang Dikerjakan & Dipelajari? (The "What" & "How")
- **Struktur State Sistem (`state.js`)**:
  - `wallets`: Array dompet (`id: 'w_main'`, `name: 'Dompet Utama'`, `balance: 4250000`).
  - `transactions`: Log transaksi berisi ID, nominal, kategori, timestamp ISO, dan flag split.
  - `debts`: Pelacakan saldo utang-piutang pasangan.
- **Alur Data Pipeline**:
  `Input User` $\rightarrow$ `State Snapshot Serializer` $\rightarrow$ `HTTP POST Ollama (:11434)` $\rightarrow$ `Regex Response Cleaner` $\rightarrow$ `JSON Validator` $\rightarrow$ `Mutasi State Saldo` $\rightarrow$ `Save ke LocalStorage`.
- **File Proyek Terkait**: `websitekeuangan-v2/state.js`, `websitekeuangan-v2/app.js`, Bab 8 Proposal.

---

### D. MACHINE LEARNING ENGINEER (MLE)

#### 1. Peran Utama
Insinyur yang mengurusi infrastruktur, penyajian model (*model serving*), efisiensi komputasi, dan keandalan sistem kecerdasan buatan di perangkat lokal.

#### 2. Mengapa Memilih Pendekatan Ini? (The "Why")
- **Mengapa memilih model *Llama 3.2 3B Instruct*?**
  Llama 3.2 3B adalah model *Small Language Model (SLM)* generasi terbaru dari Meta yang dioptimalkan untuk instruksi terarah dan *edge computing*. Model ini memiliki pemahaman bahasa Indonesia yang cukup baik namun ukurannya sangat mungil (hanya 3 miliar parameter).
- **Mengapa menggunakan Kuantisasi 4-bit (*Q4_K_M*)?**
  Model ukuran asli (16-bit float) membutuhkan memori RAM GPU sekitar 7–8 GB dan pemrosesan yang berat. Dengan kuantisasi 4-bit, ukuran file menyusut drastis menjadi hanya **~2.0 GB** dan kebutuhan RAM turun ke ~3.5 GB, sehingga laptop standar penguji (RAM 8 GB / 16 GB) mampu menjalankan inferensi secara lancar tanpa *overheat*.
- **Mengapa runtime-nya *Ollama*?**
  Ollama mengemas runtime `llama.cpp` ke dalam satu daemon ringan berarsitektur REST API lokal (`http://localhost:11434`). Ollama otomatis mendeteksi akselerasi GPU (seperti Metal di Apple Silicon atau CUDA di Nvidia), sehingga inferensi berjalan sangat kencang tanpa perlu konfigurasi driver yang rumit.
- **Mengapa suhu diatur rendah (*temperature = 0.2*)?**
  Dalam tugas kreatif (seperti menulis puisi), kita butuh temperature tinggi (0.8 - 1.0) agar kalimatnya bervariasi. Namun untuk asisten keuangan, kita butuh **kepatuhan format yang kaku dan deterministik**. Suhu 0.2 memastikan model tidak berimajinasi dan konsisten mengeluarkan JSON sesuai instruksi.
- **Mengapa harus ada *Graceful Rule-Based Fallback*?**
  Model AI lokal bergantung pada proses background Ollama. Jika Ollama tiba-tiba mati, memori laptop habis, atau terhambat izin CORS di browser, aplikasi tidak boleh berhenti bekerja. Sistem otomatis beralih ke mesin pencocokan kata kunci reguler (*Regex fallback*) untuk menangani transaksi dasar. Pengguna tidak akan merasakan gangguan.

#### 3. Apa yang Dikerjakan & Dipelajari? (The "What" & "How")
- **Metrik Performa Inferensi**:
  - *Time to First Token (TTFT)*: Waktu sejak tombol kirim ditekan sampai token pertama keluar.
  - *Evaluation Rate / Throughput*: Jumlah token yang dihasilkan per detik (target: > 15 token/detik).
  - *Total Latency*: Waktu total respons (target: < 2.5 detik).
- **Pengoperasian Runtime Ollama**:
  - Memeriksa ketersediaan model: `curl http://localhost:11434/api/tags`
  - Menguji inferensi mentah: `curl http://localhost:11434/api/generate -d '{"model": "llama3.2:3b", "prompt": "test"}'`
- **File Proyek Terkait**: `laporan_benchmark_model.md`, `desktop.js`, fallback logic di `app.js`, Bab 8 & Bab 11 Proposal.

---

## 4. SKENARIO END-TO-END (BAGAIMANA SEMUA PERAN BEKERJA SAMA)

**Studi Kasus:** Pengguna mengetik ke chat:  
> *"Barusan beli paket data indosat 50rb pake gopay, potong kas bersama ya"*

1. **Data Analyst**: Memastikan interaksi ini tercatat rapi: saldo Kas Bersama terpotong Rp 50.000, kategori masuk *Bills & Utilities*, dan sisa kuota Safe-to-Spend hari ini diperbarui.
2. **Data Engineer**: Mengambil data saldo aktif saat ini dari LocalStorage, menyusun payload percakapan, lalu mengirim request HTTP POST ke Ollama lokal.
3. **ML Engineer**: Menjaga server Ollama menyala, model Llama 3.2 3B 4-bit memproses prompt dengan akselerasi Metal/GPU dalam waktu 1.2 detik pada suhu 0.2.
4. **Data Scientist**: Memastikan LLM membaca system prompt terinjeksi dengan benar dan menghasilkan blok JSON valid:
   ```json
   {
     "action": "record_transaction",
     "parameters": {
       "merchant": "Paket Data Indosat",
       "amount": 50000,
       "category": "Bills & Utilities",
       "wallet_id": "w_shared"
     }
   }
   ```
5. **Data Engineer**: Menerima respons teks dari model, menyaring tanda markdown via regex, mem-parsing objek JSON, lalu mengupdate data di `state.js` dan menyimpan kembali ke LocalStorage.
6. **Data Analyst**: Menampilkan perubahan angka di layar pengguna secara realtime dan merekam pengalaman ini sebagai bukti kemudahan di pengujian SUS.

---

## 5. TANYA JAWAB KRUSIAL SAAT SIDANG / PRESENTASI

- **Tanya (ke DA):** *"Mengapa tidak pakai survei kepuasan biasa, kenapa harus SUS?"*  
  **Jawab:** *"SUS adalah kuesioner baku berstandar global dengan validitas dan reliabilitas yang sudah teruji ilmiah selama puluhan tahun, sehingga skor kami dapat diperbandingkan secara objektif dengan tolok ukur industri."*

- **Tanya (ke DS):** *"Kenapa tidak langsung fine-tuning model saja daripada prompt engineering berlapis?"*  
  **Jawab:** *"Untuk Llama 3.2 3B, kemampuan penalaran dasarnya sudah sangat baik. Dengan teknik Dynamic State Injection dan Few-Shot Structured Parsing, akurasi parsing kami sudah mencapai target tanpa memerlukan biaya komputasi GPU besar untuk fine-tuning berulang setiap kali saldo pengguna berubah."*

- **Tanya (ke DE):** *"Kalau tab browser ditutup atau laptop dimatikan, apakah data transaksi hilang?"*  
  **Jawab:** *"Tidak, karena seluruh data dimutasi dan disimpan secara persisten di Browser LocalStorage API yang tetap tersimpan permanen di perangkat pengguna hingga dihapus secara manual."*

- **Tanya (ke MLE):** *"Apa yang terjadi jika memori komputer pengguna penuh dan Ollama mendadak crash?"*  
  **Jawab:** *"Sistem kami dilengkapi arsitektur graceful redundancy. Aplikasi web di app.js akan mendeteksi kegagalan koneksi ke port 11434 dan secara transparan mengalihkan pemrosesan ke local rule-based regex matcher, sehingga pengguna tetap bisa mencatat transaksi tanpa error."*
