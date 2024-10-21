# import requests
# import unittest
# import os
# from elasticsearch import Elasticsearch
from dotenv import load_dotenv

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

    # def test_hello_endpoint(self):
    #     response = requests.get(f'{self.base_url}/')
    #     self.assertEqual(response.text, 'Hello World! CD')
    
    # def test_echo_endpoint(self):
    #     name = "test"
    #     response = requests.get(f'{self.base_url}/echo/{name}')
    #     self.assertEqual(response.json(), {"new-name": name})

    # def test_search_endpoint(self):
    #     data = {"query": "pikachu", "top_k": 5}
    #     response = requests.post(f'{self.base_url}/api/search', json=data)
    #     self.assertEqual(response.status_code, 200)
    #     response_data = response.json()
    #     # 改为检查返回值是dict而不是list 
    #     self.assertTrue(isinstance(response_data, dict))
    #     # 如果有error字段说明出错
    #     self.assertNotIn('error', response_data)
            
    # def test_basic_search(self):
    #     print('--------test_basic_search----------')
    #     response = requests.post(
    #         f"{self.base_url}/api/search",
    #         json={
    #             "query": "Pikachu",
    #             "top_k": 5
    #         }
    #     )
    #     # self.assertEqual(response.status_code, 200)
    #     data = response.json()
    #     # self.assertTrue(data["success"])
    #     # self.assertIsInstance(data["data"], list)
    #     print(data["data"])
        
    # def test_groq(self):
    #     client = Groq(
    #         api_key=self.key_groq,
    #     )

    #     chat_completion = client.chat.completions.create(
    #         messages=[
    #             {
    #                 "role": "user",
    #                 "content": "Explain the importance of fast language models",
    #             }
    #         ],
    #         model="llama3-8b-8192",
    #     )

    #     print(chat_completion.choices[0].message.content)
    
    def test_rag(self):
        print('test----rag')
        test_query = "fire"
        response = requests.post(
            f"{self.base_url}/api/search",
            json={"query": test_query}
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        print('sdada',data)
        
        # 验证返回数据结构
        self.assertIn("answer", data)
        self.assertIn("model_used", data)
        self.assertIn("relevance", data)
        self.assertIn("prompt_tokens", data)
        
        # 验证数据内容
        self.assertIsInstance(data["answer"], str)
        self.assertTrue(len(data["answer"]) > 0)
        print(f'data["relevance"]------------:{data["relevance"]}')
        self.assertIn(data["relevance"], ["NON_RELEVANT", "PARTLY_RELEVANT", "RELEVANT", "UNKNOWN"])
            

if __name__ == '__main__':
    unittest.main()