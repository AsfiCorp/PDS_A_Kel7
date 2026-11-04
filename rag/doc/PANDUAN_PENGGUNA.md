# Panduan Pengguna & Dokumentasi Fitur DuoWallet

Selamat datang di **DuoWallet**, platform manajemen keuangan modern yang menggabungkan pengelolaan **Keuangan Pribadi (Personal)** dan **Keuangan Bersama (Kolaborasi Pasangan / Partner)** dalam satu ekosistem terpadu.

Dokumen ini memuat panduan lengkap, definisi konsep, serta tata cara penggunaan seluruh fitur yang tersedia di DuoWallet.

---

## Daftar Isi
1. [Prinsip Desain & Konsep Workspace](#1-prinsip-desain--konsep-workspace)
2. [Tampilan Antarmuka: Mode Desktop vs Mobile](#2-tampilan-antarmuka-mode-desktop-vs-mobile)
3. [Fitur Unggulan & Definisi Konsep](#3-fitur-unggulan--definisi-konsep)
   - [Safe-to-Spend (Aman Belanja)](#a-safe-to-spend-aman-belanja)
   - [Settle Up & Pembagian Tagihan (Split Bill)](#b-settle-up--pembagian-tagihan-split-bill)
   - [Multi-Kantong Saldo (Wallets / Pockets)](#c-multi-kantong-saldo-wallets--pockets)
   - [Alokasi Anggaran (Budgets)](#d-alokasi-anggaran-budgets)
   - [Target Tabungan (Savings Goals)](#e-target-tabungan-savings-goals)
   - [DuoAI Copilot (Asisten Finansial Cerdas)](#f-duoai-copilot-asisten-finansial-cerdas)
   - [Mode Privasi & Sensor Saldo (Mask Amounts)](#g-mode-privasi--sensor-saldo-mask-amounts)
4. [Panduan Operasional Langkah demi Langkah](#4-panduan-operasional-langkah-demi-langkah)
5. [Tutorial Praktik: Skenario Penggunaan Nyata](#5-tutorial-praktik-skenario-penggunaan-nyata)
   - [Skenario A: Kencan Makan Malam & Split Bill di Kasir](#skenario-a-kencan-makan-malam--split-bill-di-kasir)
   - [Skenario B: Belanja Rumah Tangga dengan Rasio Bobot (60:40)](#skenario-b-belanja-rumah-tangga-dengan-rasio-bobot-6040)
   - [Skenario C: Menahan Belanja Impulsif Bersama DuoAI Copilot](#skenario-c-menahan-belanja-impulsif-bersama-duoai-copilot)
   - [Skenario D: Rekonsiliasi Akhir Bulan & Pelunasan Utang (Settle Up)](#skenario-d-rekonsiliasi-akhir-bulan--pelunasan-utang-settle-up)
   - [Skenario E: Pengelolaan Gaji Baru & Pengamanan Dana Darurat](#skenario-e-pengelolaan-gaji-baru--pengamanan-dana-darurat)
   - [Skenario F: Mengakses Aplikasi di Tempat Umum (Mode Privasi)](#skenario-f-mengakses-aplikasi-di-tempat-umum-mode-privasi)
6. [Keamanan & Validasi Data](#6-keamanan--validasi-data)
7. [Tanya Jawab (FAQ)](#7-tanya-jawab-faq)

---

## 1. Prinsip Desain & Konsep Workspace

DuoWallet menyelesaikan masalah klasik: *"Bagaimana memisahkan uang pribadi dan kas bersama tanpa repot memakai dua aplikasi berbeda?"*

DuoWallet membagi pengelolaan keuangan ke dalam 2 Ruang Kerja (*Workspace*):

```text
                       +-----------------------+
                       |   DUOWALLET ENGINE    |
                       +-----------+-----------+
                                   |
         +-------------------------+-------------------------+
         |                                                   |
         v                                                   v
+-----------------------+                         +-----------------------+
|  PERSONAL WORKSPACE   |                         |   COLLAB WORKSPACE    |
|   (Keuangan Pribadi)  |                         |   (Kas Patungan)      |
| • Dompet Bank & Tunai |                         | • Pool Bersama        |
| • Tagihan Bulanan     |                         | • Split Bill Proporsi |
| • Anggaran Konsumsi   |                         | • Settle Up (Utang)   |
| • Safe-to-Spend Kuota |                         | • Rekap Belanja Rumah |
+-----------------------+                         +-----------------------+
```

1. **Personal Workspace (Ruang Pribadi)**:
   - Dikhususkan untuk transaksi harian Anda sendiri (makan, transportasi, hobi, gaji masuk, cicilan pribadi).
   - Data keuangan ini privat dan menjadi acuan utama kuota belanja harian (*Safe-to-Spend*).

2. **Collab Workspace (Ruang Kolaborasi)**:
   - Dikhususkan untuk kebutuhan bersama dengan pasangan (misal: Rina & Dimas) atau rekan serumah.

---

## 2. Tampilan Antarmuka: Mode Desktop vs Mobile

DuoWallet dirancang dengan arsitektur **Responsive Hybrid**:

### Mode Desktop (Layar >= 1024px)
- **Sidebar Navigasi Tetap**: Akses cepat ke Dashboard, Aktivitas, Dompet, Anggaran, Tagihan, dan Pengaturan. Terdapat switcher cepat untuk beralih antara ruang Personal dan Kolaborasi.
- **Header Atas Terpadu**: Menampilkan ringkasan langsung kuota *Aman Belanja*, status *Settle Up*, tombol cepat penambahan transaksi (`+ Catat`), serta tombol aktivasi *DuoAI*.
- **AI Side Panel (Docked)**: Asisten DuoAI terbuka di panel sisi kanan tanpa menutup layar dashboard Anda, memudahkan analisa finansial sembari melihat grafik.
- **Grid Multikolom**: Menampilkan kartu ringkasan, riwayat mutasi terbaru, dan widget aksi samping secara berdampingan.

### Mode Mobile / Tablet (Layar < 1024px)
- **Mobile Frame**: Mengadopsi pengalaman aplikasi mobile native.
- **Bottom Navigation Bar**: Tombol menu navigasi di bagian bawah layar (Personal, Collab, Tambah Transaksi, AI, Akun).
- **Full-Screen AI & Bottom Sheets**: Seluruh formulir input dan AI chat terbuka sebagai *Bottom Sheet* atau layar penuh yang ramah sentuhan jari (*thumb-friendly*).

> **Tips Navigasi:** Di bilah atas (atau tombol toggle), Anda dapat menekan tombol **Toggle View Mode** untuk mempratinjau bagaimana aplikasi terlihat dalam mode Mobile maupun Desktop.

---

## 3. Fitur Unggulan & Definisi Konsep

### A. Safe-to-Spend (Aman Belanja)
*Safe-to-Spend* adalah indikator kompas keuangan DuoWallet untuk mencegah fenomena "kantong kering di akhir bulan".

* **Definisi:** Jumlah uang riil yang boleh Anda habiskan **per hari ini** untuk kebutuhan santai (kopi, jajan, hiburan) tanpa khawatir kehabisan uang untuk membayar tagihan wajib atau menabung.
* **Perhitungan Dinamis:**
  $$\text{Safe to Spend Harian} = \frac{\text{Total Saldo Pribadi} - \text{Sisa Tagihan Belum Terbayar} - \text{Cadangan Darurat}}{\text{Sisa Hari dalam Bulan Ini}}$$
* **Mengapa ini penting?** Saldo bank sebesar Rp 5.000.000 sering membuat kita merasa aman. Padahal jika ada tagihan sewa Rp 2.000.000 lusa, uang riil Anda sebenarnya hanya Rp 3.000.000. *Safe-to-Spend* menghitung angka aman sebenarnya secara otomatis setiap saat.

### B. Settle Up & Pembagian Tagihan (Split Bill)
Fitur ini mencatat dan merekonsiliasi talangan dana antar pihak secara adil.

* **Definisi:** Mekanisme pembagian pengeluaran bersama ketika salah satu pihak membayari terlebih dahulu di kasir.
* **Pilihan Proporsi (Split Ratio):**
  1. **50 : 50 (Bagi Rata):** Pengeluaran dibagi dua sama rata.
  2. **60 : 40:** Proporsi berbobot (misalnya jika salah satu pihak mengonsumsi porsi lebih besar).
  3. **100 : 0 (Ditalangi Penuh):** Seluruh tagihan menjadi kewajiban pihak kedua.
* **Settle Up Tracker:** Dashboard kolaborasi selalu memperlihatkan saldo neto utang-piutang. Anda cukup menekan tombol **Settle Up** untuk menandai pelunasan utang tanpa perlu repot menghitung manual di kalkulator.

### C. Multi-Kantong Saldo (Wallets / Pockets)
DuoWallet membedakan kantong penyimpanan uang berdasarkan likuiditas dan kegunaannya:
* **Akun Utama (BCA / Bank):** Rekening transaksi utama tempat gaji dan transfer masuk.
* **E-Wallet (GoPay, OVO, ShopeePay):** Dana siap pakai untuk transportasi online dan pesan antar makanan.
* **Tunai (Cash):** Uang fisik di dompet.
* **Kantong Tabungan / Darurat:** Pos simpanan yang dialokasikan terpisah agar tidak terpakai untuk konsumsi harian.

### D. Alokasi Anggaran (Budgets)
Membatasi belanja berdasarkan kategori konsumsi:
* Kategori mencakup: **Makan & Minum**, **Transportasi**, **Belanja Rumah**, **Tagihan & Utilitas**, dan **Hiburan**.
* Dilengkapi status bar visual:
  * **Hijau (< 70%):** Pengeluaran aman dan terkendali.
  * **Kuning (70% - 90%):** Memerlukan kehati-hatian.
  * **Merah (> 90% atau Lewat Kuota):** Peringatan defisit anggaran.

### E. Target Tabungan (Savings Goals)
Fitur perencanaan target finansial masa depan:
* Contoh target: *Dana Liburan Akhir Tahun*, *Beli Laptop Baru*, *Koleksi Emas Batangan*.
* Setiap target memiliki indikator nominal terkumpul, target total, dan persentase ketercapaian secara visual.

### F. DuoAI Copilot (Asisten Finansial Cerdas)
Asisten AI finansial kontekstual yang dapat diajak berdiskusi mengenai kondisi dompet Anda.
* **Bukan Sekadar Chatbot Generik:** DuoAI membaca data saldo riil, sisa hari, dan pengeluaran aktif Anda.
* **Contoh Pertanyaan yang Dapat Diajukan:**
  * *"Aman nggak beli kopi Rp 40.000 sekarang?"* -> DuoAI mengecek sisa kuota Safe-to-Spend Anda.
  * *"Berapa utang Dimas ke saya saat ini?"* -> DuoAI memeriksa status saldo Settle Up.
  * *"Kasih tips hemat minggu ini"* -> DuoAI menganalisis kategori yang mendekati batas pagu.

### G. Mode Privasi & Sensor Saldo (Mask Amounts)

---

## 4. Panduan Operasional Langkah demi Langkah

### 1. Mencatat Transaksi Pengeluaran
1. Klik tombol **`+ Catat`** di header desktop atau tombol tengah `+` pada bottom navigation mobile.
2. Pilih tab **Pengeluaran (Expense)**.
3. Masukkan nominal uang (contoh: `45000`).
4. Pilih kategori yang sesuai (misal: *Food & Dining*).
5. Pilih kantong pembayaran (misal: *GoPay* atau *BCA*).
6. Tulis catatan opsional (misal: *Makan siang nasi padang*).
7. Klik **Simpan Transaksi**. Saldo kantong akan langsung terpotong, anggaran kategori ter-update, dan kuota *Safe-to-Spend* dihitung ulang seketika.

### 2. Mencatat Pemasukan
1. Buka menu pencatatan transaksi (`+`).
2. Pilih tab **Pemasukan (Income)**.
3. Masukkan nominal uang yang masuk.
4. Pilih kantong penerima (misal: *BCA*).
5. Tulis sumber pemasukan (misal: *Gaji Bulanan*, *Freelance Design*).
6. Klik **Simpan Pemasukan**.

### 3. Menyesuaikan Cadangan Dana Darurat (Safety Buffer)
1. Buka menu **Safe-to-Spend** (klik kartu Safe-to-Spend di dashboard atau melalui sidebar).
2. Klik tombol **`tune`** (ikon setelan) atau tombol **Adjust Safety Buffer**.
3. Masukkan nominal cadangan darurat yang ingin Anda amankan (misal: `500.000`).
4. Klik **Save Buffer**. Kuota harian akan langsung disesuaikan dengan formula baru.

### 4. Mencatat Pengeluaran Bersama & Pembagian Proporsi
1. Beralih ke **Collab Workspace**.
2. Klik **Catat Pengeluaran Bersama**.
3. Masukkan total biaya (misal: belanja mingguan supermarket `600.000`).
4. Pilih skema pembagian:
   * **50:50**: Anda menanggung Rp 300.000, partner Rp 300.000.
   * **60:40**: Anda Rp 360.000, partner Rp 240.000.
5. Konfirmasi siapa yang membayar di muka. Catatan piutang/utang di menu *Settle Up* akan diperbarui otomatis.

### 5. Melunasi Utang Bersama (Settle Up)
1. Masuk ke halaman **Collab** -> pilih menu **Settle Up**.
2. Periksa rincian utang aktif yang tercatat.
3. Klik tombol **Settle Up**.
4. Masukkan nominal transfer pelunasan, lalu klik konfirmasi. Status utang akan kembali seimbang (Rp 0).

### 6. Berkonsultasi dengan DuoAI Copilot
1. Klik tombol **DuoAI** di header atas desktop atau tab AI di mobile nav.
2. Panel chat akan terbuka.
3. Anda bisa mengetik pertanyaan langsung di kolom chat atau mengklik salah satu **Prompt Cepat**:
   * *Analisis Pengeluaran*
   * *Aman Beli Kopi?*
   * *Tips Hemat*
   * *Cek Utang Bersama*
4. DuoAI akan memberikan analisis terukur berbasis data keuangan Anda saat ini.

---

## 5. Keamanan & Validasi Data
---

## 5. Tutorial Praktik: Skenario Penggunaan Nyata

Berikut adalah panduan kasus nyata dari hulu ke hilir untuk membantu Anda memanfaatkan fitur DuoWallet secara optimal dalam kehidupan sehari-hari:

### Skenario A: Kencan Makan Malam & Split Bill di Kasir
* **Konteks:** Rina dan Dimas makan malam bersama di restoran dengan total tagihan Rp 350.000. Rina membayar seluruhnya terlebih dahulu menggunakan kartu debit BCA miliknya. Keduanya sepakat untuk membagi rata biaya (50:50).
* **Langkah Penyelesaian:**
  1. Di aplikasi DuoWallet, klik tombol ruang kerja dan pilih **Collab Workspace**.
  2. Klik tombol **`+ Catat Pengeluaran Bersama`** (atau `Split Expense`).
  3. Masukkan nominal tagihan: `350000`.
  4. Pilih kategori: **Food & Dining**.
  5. Pada kolom *Dibayar Oleh (Paid By)*, pilih **Rina**.
  6. Pada pilihan *Proporsi (Split Ratio)*, pilih opsi **50 : 50**.
  7. Kotak pratinjau akan menampilkan:
     * *Bagian Rina:* Rp 175.000
     * *Bagian Dimas:* Rp 175.000
  8. Klik **Simpan Transaksi**.
* **Hasil Otomatis:**
  * Dompet BCA Rina terpotong Rp 350.000.
  * Kartu status *Settle Up* di dashboard kolaborasi langsung bertambah: **Dimas berutang Rp 175.000 kepada Rina**. Rina tidak perlu mengingat atau menagih secara canggung.

---

### Skenario B: Belanja Rumah Tangga dengan Rasio Bobot (60:40)
* **Konteks:** Pasangan berbelanja kebutuhan bahan dapur bulanan di supermarket senilai Rp 800.000. Mengingat konsumsi Rina lebih besar untuk kebutuhan hobi memasak, disepakati pembagian 60% ditanggung Rina dan 40% ditanggung Dimas. Dimas yang membayar di kasir supermarket.
* **Langkah Penyelesaian:**
  1. Masuk ke **Collab Workspace** -> klik **Catat Pengeluaran Bersama**.
  2. Masukkan total biaya: `800000`.
  3. Pilih kategori: **Household / Groceries**.
  4. Pilih *Paid By:* **Dimas**.
  5. Pilih skema pembagian: **60 : 40** (Rina 60%, Dimas 40%).
  6. Sistem menghitung: Beban Rina adalah Rp 480.000, beban Dimas Rp 320.000.
  7. Klik **Simpan**.
* **Hasil Otomatis:**
  * Sistem melakukan *Net Balance Reconciliation* terhadap utang sebelumnya.
  * Jika sebelumnya Dimas berutang Rp 175.000 (dari skenario A), maka kewajiban Rina sebesar Rp 480.000 otomatis dipotong Rp 175.000.
  * Kini saldo neto berganti menjadi: **Rina berutang Rp 305.000 kepada Dimas**.

---

### Skenario C: Menahan Belanja Impulsif Bersama DuoAI Copilot
* **Konteks:** Di tanggal 24 bulan berjalan, Rina melihat promo diskon tas/sepatu seharga Rp 600.000 dan ingin membelinya, tetapi ragu apakah uangnya cukup sampai tanggal gajian (tanggal 31, tersisa 7 hari lagi).
* **Langkah Penyelesaian:**
  1. Buka aplikasi dan klik tombol **DuoAI** di header desktop atau ikon robot di bilah mobile.
  2. Ketik di chat: *"Aman nggak kalau aku belanja sepatu Rp 600.000 hari ini?"*
  3. DuoAI membaca data riil:
     * Saldo likuid Rina saat ini.
     * Sisa tagihan wajib bulan ini yang belum lunas.
     * Kuota *Safe-to-Spend* saat ini (misal Rp 180.000/hari).
  4. DuoAI membalas: *"Perhatian: Kuota Safe to Spend harianmu adalah Rp 180.000/hari dengan sisa 7 hari. Pembelian Rp 600.000 setara dengan menghabiskan jatah santai 3,3 hari sekaligus. Disarankan menunda hingga gajian atau mengalihkan dari pos tabungan sekunder agar anggaran tidak defisit."*
  5. Rina mengklik menu **Safe-to-Spend (S43)** untuk memeriksa diagram prorata harian dan memutuskan untuk menunda pembelian tanpa rasa bersalah.


DuoWallet dilengkapi dengan lapisan pertahanan keamanan sisi klien (*Client-Side Hardening*):
1. **Sanitasi Anti-XSS (Cross-Site Scripting)**:
   Seluruh input teks (nama transaksi, profil pengguna, chat) disanitasi secara ketat sebelum ditampilkan di antarmuka (DOM).
2. **Validasi Batas Nominal**:
   Mencegah penginputan nilai negatif, karakter ilegal, atau angka di luar batas wajar yang dapat merusak kalkulator keuangan.

---

### Skenario D: Rekonsiliasi Akhir Bulan & Pelunasan Utang (Settle Up)
* **Konteks:** Menjelang pergantian bulan, Rina dan Dimas ingin membersihkan seluruh buku talangan bersama agar bulan berikutnya dimulai dari nol (Zero Pending Balance). Pada dashboard tercatat Rina berutang Rp 305.000 kepada Dimas.
* **Langkah Penyelesaian:**
  1. Rina membuka aplikasi bank miliknya di ponsel dan mentransfer dana Rp 305.000 ke rekening Dimas.
  2. Buka **Collab Workspace** -> pilih menu **Settle Up (S30)**.
  3. Layar memperlihatkan saldo tertunggak: *Rina owes Dimas Rp 305.000*.
  4. Klik tombol utama **Settle Up**.
  5. Masukkan nominal pelunasan `305000` dan konfirmasi status pembayaran.
* **Hasil Otomatis:**
  * Status buku kas bersama berubah menjadi **All Settled Up / Lunas (Rp 0)**.
  * Riwayat pelunasan tercatat di log aktivitas bersama sebagai bukti transparansi kedua belah pihak.

---

### Skenario E: Pengelolaan Gaji Baru & Pengamanan Dana Darurat
* **Konteks:** Tanggal 25 Rina menerima transfer gaji bulanan sebesar Rp 8.500.000 di rekening BCA. Rina ingin memastikan bahwa uang gajinya tidak habis tak terasa dengan segera mengamankan Rp 2.000.000 sebagai dana darurat cadangan yang tidak boleh disentuh oleh kuota belanja harian.
* **Langkah Penyelesaian:**
  1. Klik tombol **`+ Catat`** -> pilih tab **Pemasukan (Income)**.
  2. Masukkan nominal: `8500000`, pilih kantong: **BCA**, ketik sumber: `Gaji Bulanan PT ABC`. Klik Simpan.
  3. Buka halaman **Safe-to-Spend (S43)** dari menu samping atau kartu ringkasan.
  4. Klik tombol **Adjust Safety Buffer** (ikon *tune*).
  5. Masukkan nominal: `2000000` (Rp 2 juta sebagai cadangan darurat).
  6. Klik **Save Buffer**.
* **Hasil Otomatis:**
  * Formula *Safe-to-Spend* secara otomatis mengurangi Rp 2.000.000 tersebut dari dana cair sebelum menghitung jatah harian.
  * Rina dapat membelanjakan sisa kuota hariannya dengan tenang, karena dana darurat Rp 2 juta sudah terlindungi di balik sistem.

---

### Skenario F: Mengakses Aplikasi di Tempat Umum (Mode Privasi)
* **Konteks:** Anda sedang berada di dalam kereta rel listrik (KRL) yang padat atau kafe ramai dan ingin mengecek apakah tagihan listrik sudah terbayar, tetapi Anda tidak ingin orang di samping Anda melihat nominal saldo tabungan Anda.
* **Langkah Penyelesaian:**
  1. Buka aplikasi DuoWallet di smartphone.
  2. Ketuk ikon **Mata (Eye Icon / Mask Amounts)** di bilah navigasi atas (atau menu profil).
  3. Seluruh nominal angka di layar (saldo bank, e-wallet, Safe-to-Spend, dan riwayat mutasi) langsung disamarkan menjadi karakter bintang/titik: `••••`.
  4. Anda dapat memeriksa nama transaksi, status tagihan ("Lunas" / "Belum"), dan kategori tanpa mengekspos jumlah uang riil Anda.
  5. Saat sudah di tempat aman/privat, ketuk ikon mata sekali lagi untuk membuka kembali sensor nominal.

---

## 6. Keamanan & Validasi Data

DuoWallet dilengkapi dengan lapisan pertahanan keamanan sisi klien (*Client-Side Hardening*):
1. **Sanitasi Anti-XSS (Cross-Site Scripting)**:
   Seluruh input teks (nama transaksi, profil pengguna, chat) disanitasi secara ketat sebelum ditampilkan di antarmuka (DOM).
2. **Validasi Batas Nominal**:
   Mencegah penginputan nilai negatif, karakter ilegal, atau angka di luar batas wajar yang dapat merusak kalkulator keuangan.
3. **Pencegahan Overdraft (Saldo Minus)**:
   Sistem menolak transaksi pengeluaran apabila saldo di kantong yang dipilih tidak mencukupi, mencegah anomali data saldo minus.

---

## 7. Tanya Jawab (FAQ)

**Q: Mengapa angka *Safe-to-Spend* saya berkurang drastis hari ini?**
> *Jawab:* Penurunan ini biasanya dipicu oleh:
> 1. Baru saja mencatat pengeluaran bernilai besar dari kantong pribadi.
> 2. Adanya penambahan tagihan bulanan baru yang jatuh tempo sebelum akhir bulan.
> 3. Nilai *Emergency Buffer* dinaikkan.

**Q: Apakah data keuangan saya dikirim ke server pihak ketiga?**
> *Jawab:* Tidak. Seluruh state, riwayat mutasi, dan preferensi tersimpan dalam state aplikasi lokal pada peramban web (*Local Browser Storage*), menjamin privasi keuangan Anda tetap aman.

**Q: Bagaimana cara beralih bahasa antara Indonesia dan Inggris?**
> *Jawab:* Masuk ke menu **Settings (Pengaturan)** atau klik tombol bahasa di header/sidebar untuk berganti antara Bahasa Indonesia (ID) dan English (EN). Seluruh antarmuka, format mata uang, dan respon DuoAI akan menyesuaikan otomatis.

---

*DuoWallet — Kelola Bersama, Tumbuh Bersama.*
