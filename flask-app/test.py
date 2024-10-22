# import requests
# import unittest
# import os
from elasticsearch import Elasticsearch
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

import unittest
import requests
import json
import os
from groq import Groq
import rag

class TestEndpoints(unittest.TestCase):
    def setUp(self):
        load_dotenv() 
        self.key_groq = os.getenv('KEY_groq')
        self.base_url = 'http://localhost:8084'
    
    # def test_rag(self):
    #     print('test----rag')
    #     test_query = "fire"
    #     response = requests.post(
    #         f"{self.base_url}/api/search",
    #         json={"query": test_query}
    #     )
        
    #     self.assertEqual(response.status_code, 200)
    #     data = response.json()
    #     print('sdada',data)
        
    #     # 验证返回数据结构
    #     self.assertIn("answer", data)
    #     self.assertIn("model_used", data)
    #     self.assertIn("relevance", data)
    #     self.assertIn("prompt_tokens", data)
        
    #     # 验证数据内容
    #     self.assertIsInstance(data["answer"], str)
    #     self.assertTrue(len(data["answer"]) > 0)
    #     self.assertIn(data["relevance"], ["NON_RELEVANT", "PARTLY_RELEVANT", "RELEVANT", "UNKNOWN"])
    
    def test_es(self):
        es_client = Elasticsearch([os.getenv('ES_HOST', 'http://elasticsearch:9200')])
        model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
        query = "fire"
        query_vector = model.encode(query).tolist()
        
        search_body = {
            "knn": {
                "field": "combined_text_vector",
                "query_vector": query_vector,
                "k": 5,
                "num_candidates": 100
            },
           "_source": {
                "exclude": ["combined_text_vector"]
            },
        }

        results = es_client.search(
                index="pokemon_index",
                body=search_body
            )
        
        for hit in results['hits']['hits']:
            # 获取文档的所有字段
            source = hit['_source']
            print("\n文档 ID:", hit['_id'])
            print("所有字段:")
            for field, value in source.items():
                print(f"- {field}: {value}")


if __name__ == '__main__':
    unittest.main()