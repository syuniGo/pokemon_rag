import requests
import unittest

class TestPokemonSearchAPI(unittest.TestCase):
    def setUp(self):
        self.base_url = "http://localhost:8084"
        
        
    def test_hello_endpoint(self):
        response = requests.get(f"{self.base_url}/")
        print('-------------',response)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.text, 'Hello World! CD')


    # def test_basic_search(self):
    #     response = requests.post(
    #         f"{self.base_url}/api/search",
    #         json={
    #             "query": "Pikachu",
    #             "top_k": 5
    #         }
    #     )
    #     self.assertEqual(response.status_code, 200)
    #     data = response.json()
    #     self.assertTrue(data["success"])
    #     self.assertIsInstance(data["data"], list)
    #     print(data["data"])
        
    # def test_empty_query(self):
    #     response = requests.post(
    #         f"{self.base_url}/api/search",
    #         json={
    #             "query": "",
    #             "top_k": 5
    #         }
    #     )
    #     self.assertEqual(response.status_code, 200)
        
    # def test_invalid_request(self):
    #     response = requests.post(
    #         f"{self.base_url}/api/search",
    #         json={}
    #     )
    #     self.assertEqual(response.status_code, 500)

if __name__ == '__main__':
    unittest.main()