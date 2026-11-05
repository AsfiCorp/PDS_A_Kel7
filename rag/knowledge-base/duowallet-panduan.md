# Panduan Lengkap Fitur Aplikasi DuoWallet & DuoAI Copilot

## 1. Konsep Ruang: Pribadi vs Kas Bersama (Collab Space)
- **Ruang Pribadi (Personal Space)**: Tempat mengelola anggaran dan dompet milik individu secara mandiri (misal: Rina). Transaksi yang dicatat di sini bersifat privat dan tidak dapat dilihat oleh pasangan.
- **Kas Bersama (Collab Space)**: Ruang keuangan bersama antar pasangan atau teman serumah (misal: Rina & Dimas) untuk mendanai kebutuhan belanja bersama, sewa hunian, liburan, dan tagihan bulanan.

## 2. Fitur Unggulan DuoWallet

### A. Autosplit 50/50 & Pencatatan Utang Bersama
- Setiap transaksi belanja yang ditandai sebagai transaksi patungan (*shared/collab*) dapat dibagi secara otomatis.
- Contoh: Rina membayar belanja bulanan di supermarket sebesar Rp 100.000. Sistem otomatis mencatat bahwa Dimas berutang Rp 50.000 kepada Rina.
- Saldo utang antar pengguna dirangkum secara transparan di dashboard Kas Bersama.

### B. Settle Up (Pelunasan Utang Kas Bersama)
- Ketika pasangan ingin melunasi akumulasi utang patungan, cukup klik tombol **Settle Up** (Beresihan Hutang) di tab Collab.
- Sistem akan mereset saldo utang menjadi Rp 0 dan mencatat riwayat rekonsiliasi kas secara seimbang.

### C. Safe to Spend (S2S) Harian
- Merupakan indikator batas pengeluaran aman harian agar keuangan pengguna tidak defisit di akhir bulan.
- Dihitung secara dinamis: `(Sisa Anggaran Bulanan - Tagihan Wajib) / Sisa Hari dalam Bulan Berjalan`.
- Jika pengeluaran harian berada di bawah angka Safe to Spend, status keuangan tetap berada dalam batas "Aman / Sehat".

### D. Alokasi Anggaran (Budgets) & Target Tabungan (Savings Goals)
- **Kategori Anggaran**: Pengguna dapat membagi dana ke dalam kategori seperti Makanan & Minuman (Food & Drinks), Transportasi, Belanja Harian (Groceries), Tagihan (Bills), dan Kesehatan.
- **Target Tabungan**: Membantu pasangan mencapai tujuan bersama (contoh: Liburan ke Bali, Dana Darurat) dengan indikator persentase capaian dan estimasi waktu selesai.

## 3. Integrasi Chatbot DuoAI Copilot
Pengguna dapat mengelola seluruh fitur di atas cukup dengan mengetik obrolan di jendela DuoAI Copilot:
- Perintah pencatatan: *"Beli kopi kenangan 38rb pakai bca"* -> AI otomatis mencatat transaksi pengeluaran.
- Perintah patungan: *"Belanja indomaret 87500 bagi dua sama dimas"* -> AI otomatis membagi 50/50 dan mencatat utang Dimas.
- Pertanyaan status: *"Berapa safe to spend hari ini?"* atau *"Apakah dimas ada hutang?"* -> AI merespon dengan data riil.
