#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test self-check untuk Module 13, 14, 15, dan 16.
Verifikasi VectorStore, Ingest logic, dan sifat metrik Cosine / L2 / Dot Product.
"""
import math
import os
import unittest
from app.vector_store import VectorStore
from app.ingest import extract_text, ingest_documents


class TestModules13to16(unittest.TestCase):
    def test_01_vector_store_instantiation(self):
        vs = VectorStore(base_url="http://localhost:9200", dimension=768)
        self.assertEqual(vs.base_url, "http://localhost:9200")
        self.assertEqual(vs.dimension, 768)
        self.assertTrue(callable(vs.ensure_index))
        self.assertTrue(callable(vs.index_document))
        self.assertTrue(callable(vs.search))

    def test_02_extract_text(self):
        path = os.path.join(os.path.dirname(__file__), "knowledge-base", "presiden-indonesia.md")
        self.assertTrue(os.path.isfile(path), "File presiden-indonesia.md harus ada")
        content = extract_text(path)
        self.assertIn("Ir. Soekarno", content)
        self.assertIn("Prabowo Subianto", content)

    def test_03_module15_metrics_unit_vectors(self):
        # Pembuktian matematika Module 15:
        # Jika vektor ternormalisasi (norma = 1.0), ranking Cosine, L2, dan Dot Product selalu identik.
        # Definisikan 3 unit vectors
        v1 = [1.0, 0.0]
        v2 = [math.cos(math.radians(30)), math.sin(math.radians(30))] # 30 derajat
        v3 = [math.cos(math.radians(60)), math.sin(math.radians(60))] # 60 derajat

        # Query vector: [1.0, 0.0]
        q = [1.0, 0.0]

        def dot(a, b):
            return sum(x * y for x, y in zip(a, b))

        def l2(a, b):
            return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))

        def cos(a, b):
            return dot(a, b) / (math.sqrt(dot(a, a)) * math.sqrt(dot(b, b)))

        docs = [("v1", v1), ("v2", v2), ("v3", v3)]

        rank_cos = sorted(docs, key=lambda d: cos(q, d[1]), reverse=True)
        rank_l2 = sorted(docs, key=lambda d: l2(q, d[1])) # jarak terkecil = paling mirip
        rank_dot = sorted(docs, key=lambda d: dot(q, d[1]), reverse=True)

        self.assertEqual([d[0] for d in rank_cos], ["v1", "v2", "v3"])
        self.assertEqual([d[0] for d in rank_l2], ["v1", "v2", "v3"])
        self.assertEqual([d[0] for d in rank_dot], ["v1", "v2", "v3"])

    def test_04_rag_engine_top_k(self):
        import rag_engine
        self.assertEqual(rag_engine.TOP_K, 5, "TOP_K harus 5 sesuai revisi Module 15/16")
        self.assertEqual(rag_engine.OPENSEARCH_INDEX, "nala-academic-docs")


if __name__ == "__main__":
    unittest.main()
