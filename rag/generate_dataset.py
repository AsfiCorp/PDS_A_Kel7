"""
Generator Dataset Training DuoAI untuk DuoWallet
Menghasilkan dataset format JSONL (ChatML / ShareGPT compatible)
mencakup 4 pilar:
1. Safe-to-Spend & Financial Logic (Prorata, Bills, Buffer)
2. Function Calling / Action Parsing (Input transaksi, deposit, split bill, settle up)
3. Konseling & Diplomasi Keuangan Pasangan (Settle Up, 50:50, 60:40)
4. Dukungan Bahasa Lokal (Bahasa Indonesia santai, Bahasa Sunda, English)
"""

import json
import random

SYSTEM_PROMPT_ID = (
    "Anda adalah DuoAI, asisten keuangan pribadi dan kolaborasi cerdas untuk aplikasi DuoWallet. "
    "Anda membantu pengguna (seperti Rina & Dimas) dalam mengelola keuangan pribadi, kuota Safe-to-Spend harian, "
    "kas bersama (Collab Pool), pelunasan utang (Settle Up), dan target tabungan secara terukur, sopan, dan solutif."
)

SYSTEM_PROMPT_SU = (
    "Sim kuring DuoAI, panaros kauangan pinter kanggo aplikasi DuoWallet. "
    "Ngabantos anjeun ngatur artos pribadi, kuota Aman Dibalanwakeun sadinten, kas babarengan, "
    "sareng sambetan pasangan kalayan taliti tur sopan."
)

SYSTEM_PROMPT_EN = (
    "You are DuoAI, the intelligent personal and collaborative finance assistant for DuoWallet. "
    "You assist users in tracking personal spending, daily Safe-to-Spend allowances, joint shared pools, "
    "fair bill splits, and debt settlements with empathy, precision, and clarity."
)

def gen_pillar1():
    samples = []
    items = [
        ("sepatu lari", 450000), ("tas kerja", 600000), ("kopi kekinian", 35000),
        ("nongkrong di kafe", 120000), ("gadget keyboard mechanical", 850000),
        ("skincare set", 350000), ("dinner fine dining", 500000),
        ("tiket konser", 950000), ("jaket denim", 300000), ("langganan gym tahunan", 1200000)
    ]
    for item_name, price in items:
        for daily_quota in [150000, 180000, 220000, 90000]:
            days_left = random.choice([5, 7, 10, 14])
            is_safe = price <= daily_quota
            price_fmt = f"Rp {price:,.0f}".replace(",", ".")
            quota_fmt = f"Rp {daily_quota:,.0f}".replace(",", ".")
            user_msg = f"Kuota Safe-to-Spend harian saya saat ini {quota_fmt}/hari dengan sisa {days_left} hari lagi bulan ini. Apakah aman kalau hari ini saya beli {item_name} seharga {price_fmt}?"
            
            if is_safe:
                assistant_msg = (
                    f"Aman untuk dibeli! Pengeluaran {price_fmt} masih berada di bawah kuota belanja harianmu "
                    f"({quota_fmt}/hari). Sisa anggaran harian hari ini masih surplus "
                    f"Rp {(daily_quota - price):,.0f}".replace(",", ".") + f". Pastikan untuk tetap mencatatnya di kategori yang sesuai agar anggaran bulanan tetap terkontrol."
                )
            else:
                ratio = round(price / daily_quota, 1)
                assistant_msg = (
                    f"Sebaiknya ditunda atau dipertimbangkan kembali. Nominal {price_fmt} melebihi kuota Safe-to-Spend "
                    f"harianmu ({quota_fmt}/hari), setara dengan menghabiskan jatah belanja sekitar {ratio} hari sekaligus. "
                    f"Jika dibeli hari ini, kuota harian untuk {days_left - 1} hari ke depan akan terpangkas drastis. "
                    f"Alternatifnya: tunggu hingga tanggal gajian berikutnya atau alokasikan dari pos tabungan khusus non-rutin."
                )
            
            samples.append({
                "category": "safe_to_spend_logic",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT_ID},
                    {"role": "user", "content": user_msg},
                    {"role": "assistant", "content": assistant_msg}
                ]
            })
            
    health_cases = [
        (
            "Kenapa target tabungan New Headphones saya statusnya 'At risk'?",
            "Target 'New Headphones' berstatus 'At risk' karena kategori belanja Shopping sudah mencapai 116% dari batas pagu, dan Food & Drinks berpotensi overbudget. Hal ini menyisakan dana cair lebih sedikit dari kebutuhan tabungan bulanan (Rp 290.000/bulan). Saran DuoAI: Pangkas pengeluaran Food & Drinks sebesar Rp 150.000 minggu ini agar target kembali On Track."
        ),
        (
            "Bagaimana cara menaikkan Financial Health Score saya dari 72 ke 85+?",
            "Untuk menaikkan Health Score ke kategori Excellent (80+), fokus pada 2 pilar utama: 1) Naikkan Safety Net coverage dari 1,2 bulan pengeluaran menjadi minimal 3 bulan (tambahkan cadangan darurat). 2) Jaga kepatuhan anggaran (Budget Adherence) terutama kategori Shopping agar tidak melebihi 100% pagu."
        ),
        (
            "Apa fungsi Emergency Safety Buffer di Safe-to-Spend DuoWallet?",
            "Emergency Safety Buffer berfungsi sebagai jaring pengaman dana yang 'dikunci' dari kalkulasi harian. Sistem DuoWallet akan mengurangkan buffer ini terlebih dahulu dari saldo likuid sebelum membagi sisa dana dengan hari tersisa, sehingga Anda tidak akan secara tidak sengaja membelanjakan dana darurat untuk belanja santai."
        )
    ]
    for q, a in health_cases:
        samples.append({
            "category": "health_and_buffer",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT_ID},
                {"role": "user", "content": q},
                {"role": "assistant", "content": a}
            ]
        })
    return samples

def gen_pillar2():
    samples = []
    expense_intents = [
        ("Baru aja beli susu dan telur di Super Indo habis 125.000 pake BCA", "Super Indo", 125000, "Groceries", "w_bca", False),
        ("Tadi bayar parkir dan tol 45000 pake GoPay", "Tol & Parkir", 45000, "Transport", "w_gopay", False),
        ("Makan siang bakso 35000 tunai", "Bakso", 35000, "Food & Drinks", "w_cash", False),
        ("Beli baju kemeja di Uniqlo 299000 pake debit BCA", "Uniqlo", 299000, "Shopping", "w_bca", False),
        ("Beli obat flu di apotek 58000 pake GoPay", "Apotek Guardian", 58000, "Health", "w_gopay", False),
    ]
    for raw_text, merch, amt, cat, w_id, shared in expense_intents:
        amt_fmt = f"Rp {amt:,.0f}".replace(",", ".")
        resp = json.dumps({
            "action": "record_transaction",
            "parameters": {
                "type": "expense",
                "merchant": merch,
                "amount": -abs(amt),
                "category": cat,
                "wallet_id": w_id,
                "shared": shared
            },
            "user_feedback": f"Pengeluaran {merch} sebesar {amt_fmt} berhasil dicatat pada kategori {cat}."
        }, ensure_ascii=False)
        samples.append({
            "category": "function_calling_expense",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT_ID},
                {"role": "user", "content": f"Catat pengeluaran: {raw_text}"},
                {"role": "assistant", "content": f"```json\n{resp}\n```"}
            ]
        })

    collab_intents = [
        ("Makan malam berdua Dimas di Pizza Hut abis 180000 bagi dua rata, saya yang bayar pake BCA", "Pizza Hut", 180000, "Food & Drinks", "50/50", "Rina", 90000),
        ("Belanja bulanan di Hypermart 650000, saya bayar pribadi, split 50:50 dengan Dimas", "Hypermart", 650000, "Groceries", "50/50", "Rina", 325000),
        ("Dimas bayarin belanja dapur di Alfamart 84000 pake kas bersama", "Alfamart", 84000, "Groceries", "from_pool", "Dimas", 0),
        ("Makan sushi bareng Dimas 300000, porsi saya banyakan jadi split 60:40 (Rina 60%, Dimas 40%)", "Sushi Tei", 300000, "Food & Drinks", "60/40", "Rina", 120000),
    ]
    for raw_text, merch, amt, cat, split_mode, payer, dimas_owes in collab_intents:
        amt_fmt = f"Rp {amt:,.0f}".replace(",", ".")
        owes_fmt = f"Rp {dimas_owes:,.0f}".replace(",", ".")
        resp = json.dumps({
            "action": "record_collab_expense",
            "parameters": {
                "merchant": merch,
                "amount": amt,
                "category": cat,
                "split_ratio": split_mode,
                "paid_by": payer,
                "dimas_owes": dimas_owes
            },
            "user_feedback": f"Transaksi bersama {merch} ({amt_fmt}) berhasil dicatat. Status: Dimas berhutang {owes_fmt} kepada Rina."
        }, ensure_ascii=False)
        samples.append({
            "category": "function_calling_collab",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT_ID},
                {"role": "user", "content": f"Input pengeluaran bersama: {raw_text}"},
                {"role": "assistant", "content": f"```json\n{resp}\n```"}
            ]
        })

    income_intents = [
        ("Gaji bulanan masuk 8.500.000 ke rekening BCA", 8500000, "Monthly Salary", "w_bca"),
        ("Dapat uang freelance design 1.200.000 setor ke GoPay", 1200000, "Freelance Design", "w_gopay"),
        ("Bonus lembur 750.000 ke BCA", 750000, "Bonus Lembur", "w_bca")
    ]
    for raw_text, amt, src, w_id in income_intents:
        amt_fmt = f"Rp {amt:,.0f}".replace(",", ".")
        resp = json.dumps({
            "action": "record_income",
            "parameters": {
                "amount": amt,
                "source": src,
                "wallet_id": w_id
            },
            "user_feedback": f"Pemasukan {src} ({amt_fmt}) berhasil ditambahkan ke saldo."
        }, ensure_ascii=False)
        samples.append({
            "category": "function_calling_income",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT_ID},
                {"role": "user", "content": raw_text},
                {"role": "assistant", "content": f"```json\n{resp}\n```"}
            ]
        })
    return samples

def gen_pillar3():
    samples = []
    dialogues = [
        (
            "Gimana cara ngomong ke Dimas kalau utang split bill-nya udah numpuk Rp 320.000 tanpa bikin canggung?",
            "Gunakan fitur Settle Up DuoWallet sebagai jembatan komunikasi netral tanpa kesan menuduh. Anda bisa mengirimkan ringkasan santai via WhatsApp: 'Hai Dimas! Aku baru rekap transaksi belanja kita di DuoWallet nih. Ada total pending split bill Rp 320.000 dari 4 belanjaan kemarin. Pas kamu senggang, boleh minta tolong di-settle ya biar buku kas kita rapi lagi. Makasih!' Cara ini memposisikan aplikasi sebagai pihak pencatat, bukan tuntutan emosional."
        ),
        (
            "Dimas merasa pembagian 50:50 untuk belanja bulanan kurang adil karena porsi makan saya lebih banyak. Solusinya gimana?",
            "DuoWallet menyediakan opsi split proporsional berbobot (60:40) atau Split by Item (C02). Untuk kebutuhan bersama yang konsumsinya tidak merata, Anda dapat menyepakati skema 60:40 di mana Anda menanggung 60% dan Dimas 40%, atau menggunakan mode Itemized Split agar masing-masing hanya membayar barang konsumsi pribadinya. Ini menjaga transparansi tanpa membebani salah satu pihak."
        ),
        (
            "Apakah Dimas bisa melihat saldo rekening pribadi saya atau riwayat belanja pribadi saya?",
            "Sama sekali tidak. DuoWallet dirancang dengan arsitektur isolasi privasi 'Zero Leaks'. Dimas hanya memiliki akses pada Collab Space (kas bersama, pengeluaran yang secara sadar di-share, dan target bersama). Saldo tabungan pribadi, dompet mandiri, dan transaksi private Anda 100% disembunyikan secara kriptografis."
        ),
        (
            "Kami baru gajian dan mau alokasi kas bersama. Berapa proporsi ideal untuk setor ke Joint BCA?",
            "Rekomendasi metode 50/30/20 yang disesuaikan: Alokasikan 50-60% dari estimasi belanja dapur dan tagihan bulanan bersama ke rekening Joint BCA di awal bulan (tanggal 1-3). DuoWallet memungkinkan pencatatan deposit otomatis (S29) dari rekening pribadi Rina dan Dimas sehingga kas operasional rumah tangga terkunci aman sejak awal."
        )
    ]
    for q, a in dialogues:
        samples.append({
            "category": "couple_finance_counseling",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT_ID},
                {"role": "user", "content": q},
                {"role": "assistant", "content": a}
            ]
        })
    return samples

def gen_pillar4():
    samples = []
    sunda_cases = [
        (
            "Sabaraha total sambetan anu kedah ditaros ka Dimas ayeuna?",
            "Dumasar kana data transaksi babarengan di Collab Space, Dimas ayeuna gaduh sambetan **Rp 320.000** tina 4 transaksi split 50/50. Anjeun tiasa muka layar **Beresihan Hutang (S30)** teras klik 'Kirim Panginget' supados artosna tiasa énggal dilunasan."
        ),
        (
            "Naha wates dinten abdi aman kanggo jajan kopi Rp 35.000?",
            "Aman pisan! Kuota **Aman Dibalanwakeun** sadinten anjeun ayeuna aya dina angka **Rp 180.000/dinten**. Mesér kopi Rp 35.000 moal matak ngirangan anggaran pokok sasih ieu."
        ),
        (
            "Kumaha kamajuan udagan tabungan Liburan ka Bali urang duaan?",
            "Udagan **Anniversary Trip / Liburan Bali** parantos kahontal **60%** (parantos kakumpul Rp 2.400.000 tina target Rp 4.000.000). Masih aya sésa Rp 1.600.000 kalayan waktos 52 dinten deui. Upami anjeun sareng Dimas nyimpen Rp 200.000/minggu, target ieu bakal kahontal kalayan tepat waktu!"
        ),
        (
            "Pasihan abdi tips nyimpen artos dumasar kana pangaluaran sasih ieu.",
            "💡 **Tips Kauangan DuoAI:**\n1. Pantau kuota Aman Dibalanwakeun sadinten supados teu kaleuwihan balanja santai.\n2. Tagih sambetan Rp 320.000 ti Dimas supados kas pribadi tetep aman.\n3. Alokasikeun langkungna saldo kana Pos Tabungan Darurat (Safety Net) minimal 3 sasih biaya hirup."
        )
    ]
    for q, a in sunda_cases:
        samples.append({
            "category": "multilingual_sundanese",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT_SU},
                {"role": "user", "content": q},
                {"role": "assistant", "content": a}
            ]
        })
        
    english_cases = [
        (
            "Can I afford to spend Rp 500,000 on shopping today?",
            "Based on your current Safe-to-Spend limit of Rp 180,000/day and 8 remaining days in this month, spending Rp 500,000 today is risky. It will consume nearly 2.8 days worth of uncommitted allowance, dropping your future daily allowance. It's recommended to postpone this purchase until next payday."
        ),
        (
            "How much does Dimas owe me right now?",
            "Dimas currently owes you **Rp 320,000** across 4 shared expenses (including Indomaret pantry essentials and dining at Warung Bu Sri). You can navigate to the Settle Up screen (S30) to send a polite reminder or record a settlement."
        ),
        (
            "What is the difference between Personal Space and Collab Space?",
            "Personal Space is 100% private to you—your partner never sees your bank balance, individual wallets, or private transactions. Collab Space is your shared workspace where you can jointly track pool balances, split household bills (50/50 or custom), and track shared goals together."
        )
    ]
    for q, a in english_cases:
        samples.append({
            "category": "multilingual_english",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT_EN},
                {"role": "user", "content": q},
                {"role": "assistant", "content": a}
            ]
        })
    return samples

def main():
    dataset = []
    dataset.extend(gen_pillar1())
    dataset.extend(gen_pillar2())
    dataset.extend(gen_pillar3())
    dataset.extend(gen_pillar4())
    
    random.seed(42)
    random.shuffle(dataset)
    
    output_filename = "duoai_training_dataset.jsonl"
    with open(output_filename, "w", encoding="utf-8") as f:
        for entry in dataset:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
            
    print(f"Dataset berhasil dibuat: {output_filename}")
    print(f"Total baris contoh percakapan: {len(dataset)}")
    
    cat_counts = {}
    for entry in dataset:
        c = entry["category"]
        cat_counts[c] = cat_counts.get(c, 0) + 1
    print("\nDistribusi Kategori Dataset:")
    for c, cnt in sorted(cat_counts.items(), key=lambda x: x[1], reverse=True):
        print(f" - {c}: {cnt} percakapan")

if __name__ == "__main__":
    main()
