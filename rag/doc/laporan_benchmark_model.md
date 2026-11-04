# Laporan Evaluasi Benchmark Model Ollama

**Tanggal Pengujian:** 6 Oktober 2026  
**Infrastruktur:** Ollama Local Server (macOS, Apple Silicon)  
**Model Diuji:**
1. `llama3.2:3b` (Ukuran: 2.0 GB, Parameter: 3.2B)
2. `smollm2:135m` (Ukuran: 270 MB, Parameter: 135M)

---

## 1. Ringkasan Skor & Metrik Evaluasi

Skala penilaian: **1 (Sangat Buruk) s.d. 5 (Sangat Baik)**  
Kriteria:
- **Kejelasan (K)**: Kemudahan dipahami, struktur penjelasan, dan kesesuaian bahasa instruksi.
- **Akurasi (A)**: Kebenaran konsep teknis dan kode yang dihasilkan.
- **Waktu Eksekusi (W)**: Efisiensi latensi inferensi.

| Pertanyaan | Metrik | `llama3.2:3b` | `smollm2:135m` | Catatan Utama |
| :--- | :--- | :---: | :---: | :--- |
| **Q1:** ML vs DL | Kejelasan<br>Akurasi<br>Waktu Eksekusi | 4.5<br>4.5<br>3.5 (24.62s) | 2.5<br>2.0<br>4.5 (14.13s) | `llama3.2` terstruktur bhs Indo; `smollm2` bhs Inggris & salah relasi taksonomi. |
| **Q2:** Overfitting | Kejelasan<br>Akurasi<br>Waktu Eksekusi | 4.5<br>4.5<br>5.0 (7.37s) | 1.0<br>1.0<br>1.0 (56.30s) | `llama3.2` sangat jelas & analogis; `smollm2` repetisi token loop (5581 token). |
| **Q3:** Python Script | Kejelasan<br>Akurasi<br>Waktu Eksekusi | 5.0<br>5.0<br>3.5 (25.22s) | 2.0<br>2.0<br>5.0 (3.59s) | `llama3.2` script valid load & inference; `smollm2` script training tak lengkap. |
| **Rata-rata** | | **4.5** / 5.0 | **2.1** / 5.0 | **`llama3.2:3b` unggul mutlak.** |

---

## 2. Detail Evaluasi per Pertanyaan

### Pertanyaan 1: Perbedaan Machine Learning vs Deep Learning
- **`llama3.2:3b`**: 24.62s | Kejelasan: 4.5 | Akurasi: 4.5 | Waktu: 3.5  
  *Catatan:* Struktur rapi dlm bahasa Indonesia, membagi kelebihan/kekurangan dan prinsip dasar neural network.
- **`smollm2:135m`**: 14.13s | Kejelasan: 2.5 | Akurasi: 2.0 | Waktu: 4.5  
  *Catatan:* Menjawab bahasa Inggris dan membuat klaim keliru bahwa "machine learning is a subset of deep learning".

### Pertanyaan 2: Jelaskan "overfitting" dalam bahasa indonesia sederhana
- **`llama3.2:3b`**: 7.37s | Kejelasan: 4.5 | Akurasi: 4.5 | Waktu: 5.0  
  *Catatan:* Sangat komunikatif dengan contoh analogi prediksi harga properti.
- **`smollm2:135m`**: 56.30s | Kejelasan: 1.0 | Akurasi: 1.0 | Waktu: 1.0  
  *Catatan:* Terjebak dalam pengulangan frasa (looping token) selama hampir 1 menit tanpa kesimpulan logis.

### Pertanyaan 3: Contoh Python script load model + inference
- **`llama3.2:3b`**: 25.22s | Kejelasan: 5.0 | Akurasi: 5.0 | Waktu: 3.5  
  *Catatan:* Menyediakan script `tf.keras.models.load_model` dan `model.predict()` yang sintaksnya langsung siap pakai.
- **`smollm2:135m`**: 3.59s | Kejelasan: 2.0 | Akurasi: 2.0 | Waktu: 5.0  
  *Catatan:* Waktu cepat namun kode hanya mendefinisikan model baru tanpa kode pemuatan model yang benar.

---

## 3. Kesimpulan
`llama3.2:3b` terbukti jauh lebih stabil, paham instruksi multibahasa (Indonesia), serta akurat untuk pemakaian coding/RAG dibandingkan model sub-milyar parameter seperti `smollm2:135m`.
