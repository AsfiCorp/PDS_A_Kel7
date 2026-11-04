import json
import urllib.request

SYSTEM_PROMPT = """Anda adalah DuoAI, asisten keuangan pribadi dan kolaborasi DuoWallet.
Format jawaban:
1. Jika pengguna meminta mencatat transaksi, berikan JSON action.
2. Jika pengguna berkonsultasi, berikan analisis finansial singkat dan solutif.
"""

def test_ollama():
    url = "http://localhost:11434/api/generate"
    test_prompts = [
        "Safe-to-Spend saya Rp 150.000/hari, sisa 7 hari lagi. Aman gak kalau beli jaket 300.000 hari ini?",
        "Catat pengeluaran makan malam di Solaria 110.000 bayar pake QRIS GoPay, split 50:50 sama Dimas."
    ]
    
    print("=== PENGUJIAN PROMPT DUOAI DENGAN LLAMA3.2:3B ===")
    for p in test_prompts:
        print(f"\nUser: {p}")
        payload = {
            "model": "llama3.2:3b",
            "prompt": f"<|system|>\n{SYSTEM_PROMPT}\n<|user|>\n{p}\n<|assistant|>\n",
            "stream": False,
            "options": {"temperature": 0.2}
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req) as response:
                res = json.loads(response.read().decode('utf-8'))
                print("DuoAI:")
                print(res.get("response", "").strip())
        except Exception as e:
            print(f"Error calling Ollama: {e}")

if __name__ == "__main__":
    test_ollama()
