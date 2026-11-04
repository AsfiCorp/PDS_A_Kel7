#!/bin/sh
# Init container Ollama: serve + siapkan model LLM & embedding (sekali, lalu di-cache di volume)
ollama serve &
sleep 3

echo "[init] Memastikan model embedding nomic-embed-text tersedia..."
ollama pull nomic-embed-text

echo "[init] Membangun model duoai-copilot dari Modelfile..."
ollama create duoai-copilot -f /Modelfile.duoai || echo "[init] duoai-copilot sudah ada / gagal create, lanjut"

echo "[init] Selesai. Ollama berjalan di port 11434."
wait
