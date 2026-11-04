# Checklist Pertemuan 6 (Module 10-12) — adaptasi DuoAI
Hasil pemetaan panduan manual NALA ke repo ini. Jalankan perintah cek di bawah,
lalu centang `[x]`.

## Module 10 — Knowledge Base
- [x] KB berisi >= 2 dokumen — 4 dokumen: PANDUAN_PENGGUNA.md, JOBDESK.md,
  LAPORAN_STRATEGI_TRAINING_DUOAI.md, duoai_training_dataset.jsonl (150 chunk).
- [x] Terlihat di container (bind mount `doc/*` -> /app, edit host tanpa rebuild — 4 file terkonfirmasi):
  `docker compose exec rag ls -la /app/*.md`
- [x] extract_text .md utuh + chunking per-heading (`_split_md`, setara Module 15).
- [x] PDF/pypdf — tidak ada PDF di KB (dok: "kalau ada") — dilewati.
- [x] Chat lama tak terganggu — smoke test `/api/chat` via proxy PASS.

## Module 11 — Embedding (nomic-embed-text)
- [x] Model ter-pull — `init-ollama.sh` (`ollama pull nomic-embed-text`).
  Cek: `docker compose exec ollama ollama list`
- [x] Vektor 768-dimensi — terbukti native: `DIMENSI: 768`.
  Ulangi di container:
  `docker compose exec rag python3 -c "from rag_engine import embed_texts as e; print('Dimensi:', len(e(['tes dimensi'])[0]))"`
- [x] Deterministik (teks sama -> vektor identik) — terbukti native: `True`.
  Ulangi di container:
  `docker compose exec rag python3 -c "from rag_engine import embed_texts as e; print('identik:', e(['tes determinisme'])[0]==e(['tes determinisme'])[0])"`
- [x] Chat lama tak terganggu.

## Module 12 — Vector Store (OpenSearch, opsional)
Service `opensearch` + `opensearch-dashboards` ditambahkan dengan
`profiles: [opensearch]` — default deployment dosen (4 GB RAM VM) tidak terbebani.
- [x] Nyalakan — `duoai-opensearch` + `dashboards` UP (RAM total ~1.2/3.8 GB): `docker compose --profile opensearch up -d`
  (butuh `vm.max_map_count=262144`; reset tiap restart Docker Desktop:
  `docker run --rm --privileged --pid=host alpine sysctl -w vm.max_map_count=262144`)
- [x] Cluster health green (1 node, single-node, image 2.11.0): `curl "http://localhost:9200/_cluster/health?pretty"`.
- [x] Dashboards terbuka: http://localhost:5601 (HTTP 200, tanpa login).
- [x] Bukti k-NN semantik (mapping 768-dim nmslib/cosinesimil: index duoai-docs-test, query tanpa kata cuti/akademik -> test-1 skor 0.7458, index dibersihkan):
  dengan kata berbeda):
  - Buat index `duoai-docs-test` via PUT /duoai-docs-test (lihat panduan doc).
  - Vektor lewat container rag (tanpa ekspos port 11434):
    `docker compose exec rag python3 -c "from rag_engine import embed_texts as e; import json; print(json.dumps(e(['Mahasiswa mengajukan cuti akademik lewat portal kampus'])[0]))"`
  - Simpan via PUT /duoai-docs-test/_doc/test-1, cari via POST /duoai-docs-test/_search
    dengan query "bagaimana cara izin tidak kuliah satu semester" -> test-1 ketemu.
  - Bersihkan: `curl -X DELETE http://localhost:9200/duoai-docs-test`
- [x] Chat tak terganggu — diuji /api/chat safe-to-spend dengan OpenSearch menyala.

Catatan: isolasi volume via `.env` (`COMPOSE_PROJECT_NAME=duoai-rag`),
sesuai Module 12 poin 7. Kalau RAM VM dinaikkan ke 8/16 GB, naikkan juga
heap `OPENSEARCH_JAVA_OPTS` ke `-Xms1g -Xmx1g`.
