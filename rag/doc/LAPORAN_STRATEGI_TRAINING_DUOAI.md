# Laporan Komprehensif: Strategi AI Training, Dataset, & Integrasi DuoAI (DuoWallet)

**Tanggal:** 6 Oktober 2026  
**Aplikasi:** DuoWallet (`websitekeuangan-v2`)  
**Status Eksekusi:** Selesai (Dataset Synthesizer terverifikasi, Live Prompt Inference berhasil)

---

## 1. Eksekutif & Ringkasan Hasil

Sebelumnya, fitur DuoAI pada aplikasi DuoWallet hanya mengandalkan pencarian kata kunci statis (*string matching* sederhana) pada berkas `websitekeuangan-v2/js/app.js`:
```javascript
// Implementasi lama (Rule-based)
if (q.includes('kopi')) return 'Budget kopi aman...';
if (q.includes('makan')) return 'Pengeluaran makan...';
```

Untuk mentransformasi DuoAI menjadi asisten finansial cerdas, otonom, dan akurat secara matematis tanpa halusinasi, telah dirumuskan dan diuji strategi **Hybrid RAG + Function Calling / Action Parsing Fine-Tuning**.

### Temuan Utama Pengujian Model
1. **smollm2:135m (Tidak Disarankan):** Mengalami degradasi token bahasa Indonesia (output terpotong, repetitive loop), dan tidak mampu mematuhi skema format JSON terstruktur.
2. **llama3.2:3b (Sangat Disarankan untuk On-Device/Lokal):** Mampu mengeksekusi logika *Safe-to-Spend*, memahami split bill 50:50, serta memformat output `record_transaction` JSON dengan parameter akurat.
3. **Qwen2.5-3B-Instruct (Rekomendasi Utama untuk Produksi):** Pilihan alternatif terkuat untuk penalaran logika terstruktur, dukungan multibahasa (Indonesia formal/santai), dan *zero-shot tool calling*.

---

## 2. Penjelasan File-File yang Dibuat & Kegunaannya

Berikut adalah rincian berkas yang telah dibuat di dalam repositori:

### 1. `generate_dataset.py` (Synthesizer Dataset Otomatis)
* **Deskripsi:** Script Python generator otomatis untuk memproduksi dataset latihan sintetis berformat JSON Lines (JSONL / ChatML).
* **Fungsi:** Menghasilkan pasangan prompt *System-User-Assistant* berdasarkan arsitektur state DuoWallet (`DuoState`), formula kuota belanja dinamis harian, dan etika komunikasi finansial pasangan.
* **Fitur Generator:**
  * Pengacakan skenario harga barang dan kuota harian.
  * Perhitungan surplus / defisit prorata hari secara otomatis.
  * Serialisasi format JSON untuk aksi aplikasi (*function calling*).
  * Dukungan 3 bahasa: Bahasa Indonesia, Bahasa Sunda, dan Bahasa Inggris.

### 2. `duoai_training_dataset.jsonl` (Dataset Latihan Utama)
* **Deskripsi:** Berkas dataset siap pakai untuk proses Supervised Fine-Tuning (SFT) / QLoRA berformat ChatML standard.
* **Ukuran:** 66 percakapan komprehensif terbagi ke dalam 8 kategori spesifik domain DuoWallet:
  * `safe_to_spend_logic` (40 percakapan): Analisis kuota belanja harian vs sisa hari dan dampak pembelian impulsif.
  * `function_calling_expense` (5 percakapan): Konversi bahasa kasual menjadi perintah transaksi pribadi (`record_transaction`).
  * `function_calling_collab` (4 percakapan): Ekstraksi transaksi bersama, pembagian split 50:50 / 60:40, dan penghitungan utang partner.
  * `function_calling_income` (3 percakapan): Pemasukan gaji, freelance, dan deposit dompet.
  * `couple_finance_counseling` (4 percakapan): Diplomasi penagihan utang santai tanpa canggung, isolasi privasi *Zero Leaks*, dan metode alokasi pool kas bersama.
  * `health_and_buffer` (3 percakapan): Edukasi Financial Health Score (5 pilar) dan fungsi jaring pengaman *Emergency Safety Buffer*.
  * `multilingual_sundanese` (4 percakapan): Konsultasi dan status hutang dalam Bahasa Sunda halus (*lemes*).
  * `multilingual_english` (3 percakapan): Interaksi dalam Bahasa Inggris formal dan kasual.

### 3. `test_inference_prompt.py` (Skrip Uji Coba Model Riil)
* **Deskripsi:** Skrip evaluasi *live prompt inference* yang langsung terhubung ke daemon Ollama lokal (`llama3.2:3b`).
* **Hasil Pengujian Langsung:**
  * **Uji Kasus 1 (Safe-to-Spend):** User bertanya apakah aman membeli jaket Rp 300.000 dengan kuota Rp 150.000/hari dan sisa 7 hari. Model berhasil menghitung total sisa aman (Rp 1.050.000), dampak penurunan kuota, dan memberikan saran solutif untuk menunda.
  * **Uji Kasus 2 (Action Parsing):** User meminta *"Catat pengeluaran makan malam di Solaria 110.000 bayar pake QRIS GoPay, split 50:50 sama Dimas"*. Model langsung mengembalikan format JSON valid:
    ```json
    {
      "action": "record_transaction",
      "transaction_type": "pengeluaran",
      "description": "Makan malam di Solaria",
      "amount": 110000,
      "method": "QRIS GoPay",
      "split": { "dimas": 50, "pengguna": 50 }
    }
    ```

---

## 3. Metodologi Pelatihan (Training Methodology)

### Prinsip Utama: Jangan Biarkan AI Menghafal Saldo di Bobot Model!
Di bidang finansial, data transaksi berubah setiap jam. Model **tidak boleh** dilatih untuk menghafal "Saldo Rina adalah Rp 5.000.000". AI harus dilatih sebagai **Decision & Function-Calling Engine**, sementara data riil disuntikkan secara dinamis saat *runtime* (In-Context Snapshot).

```
   [Pengguna Mengetik Input]
              │
              ▼
  ┌───────────────────────┐
  │ Context Injection     │ ◄── Ambil live state dari `DuoState.data`
  │ (System Prompt Web)   │     (Saldo terkini, Safe-to-Spend, Hutang Dimas)
  └───────────┬───────────┘
              │
              ▼
  ┌───────────────────────┐
  │ Fine-Tuned DuoAI      │ (Model 3B LoRA: Qwen2.5 / Llama-3.2)
  │ (Inference Engine)    │
  └───────────┬───────────┘
              │
      ┌───────┴───────────────────────┐
      │                               │
      ▼                               ▼
[Percakapan Finansial / Saran]   [Output JSON Action]
                                      │
                                      ▼
                        Panggil Fungsi UI DuoWallet
                        (saveExpense, settleDebt, dsb.)
```

### Parameter Fine-Tuning yang Direkomendasikan (QLoRA)
Bila ingin melakukan fine-tuning LoRA lokal (menggunakan Unsloth / HuggingFace PEFT / MLX):
* **Base Model:** `unsloth/Qwen2.5-3B-Instruct` atau `meta-llama/Llama-3.2-3B-Instruct`
* **Quantization:** 4-bit (NF4)
* **LoRA Rank ($r$):** 16
* **LoRA Alpha ($\alpha$):** 32
* **Target Modules:** `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`
* **Epochs:** 3 - 5 epoch
* **Learning Rate:** $2 \times 10^{-4}$ (Cosine scheduler)
* **Estimasi Waktu Training:** ~15 menit di Apple Silicon M-Series (MLX) atau Google Colab T4 gratis.

---

## 4. Skema Integrasi ke Frontend DuoWallet (`websitekeuangan-v2`)

Untuk menghubungkan model ini ke frontend DuoWallet, perbarui fungsi `generateAiResponse` di `js/app.js`:

```javascript
// Blueprint integrasi ke js/app.js
async function askDuoAI(userText) {
  const snapshot = {
    safeToSpendDaily: DuoState.getDailySafeToSpend?.() || 180000,
    daysLeft: DuoState.getDaysLeftInMonth?.() || 8,
    dimasDebt: 320000,
    activeWorkspace: DuoState.currentWorkspace
  };

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2:3b",
      prompt: `<|system|>
Anda adalah DuoAI. Status pengguna saat ini:
- Safe-to-Spend: Rp ${snapshot.safeToSpendDaily.toLocaleString('id-ID')}/hari (sisa ${snapshot.daysLeft} hari)
- Hutang pending Dimas: Rp ${snapshot.dimasDebt.toLocaleString('id-ID')}
- Workspace aktif: ${snapshot.activeWorkspace}
Jika pengguna meminta aksi, kembalikan format JSON saja.
<|user|>
${userText}
<|assistant|>
`,
      stream: false,
      options: { temperature: 0.2 }
    })
  });

  const data = await response.json();
  const reply = data.response;

  // Cek apakah output berupa tindakan JSON
  try {
    const jsonMatch = reply.match(/```json\s*([\s\S]*?)\s*```/) || reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const actionPayload = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      executeDuoAction(actionPayload); // Jalankan fungsi di UI
      return actionPayload.user_feedback || "Transaksi berhasil dicatat ke DuoWallet!";
    }
  } catch (e) {
    // Percakapan biasa
  }

  return reply;
}
```

---

## 5. Kesimpulan & Roadmap Implementasi

1. **Dataset Synthesizer Siap Digunakan:** Dataset `duoai_training_dataset.jsonl` dapat diperbanyak kapan saja dengan menambah list transaksi di `generate_dataset.py`.
2. **Kinerja Model 3B:** Model ukuran 3-Billion parameter (`llama3.2:3b` / `qwen2.5:3b`) adalah titik keseimbangan sempurna untuk DuoWallet: sangat cepat (30-60 token/detik di Mac), hemat memori (~2 GB VRAM), dan patuh pada instruksi JSON.
3. **Privasi & Keamanan:** Karena berjalan secara lokal di Ollama, seluruh percakapan dan saldo keuangan pengguna tidak pernah dikirim ke pihak ketiga, sejalan dengan prinsip privasi **Zero Leaks** DuoWallet.
