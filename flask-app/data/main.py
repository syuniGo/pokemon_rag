from flask import Flask, request, jsonify
# from flask_cors import CORS
from sentence_transformers import SentenceTransformer
from elasticsearch import Elasticsearch
import os
import os

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log', mode='a'),  # 添加 mode='a' 以追加日志
        logging.StreamHandler()
    ]
)
app = Flask(__name__)
# CORS(app)

# 初始化ES客户端和模型
es_client = Elasticsearch([os.getenv('ES_HOST', 'http://elasticsearch:9200')])
model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')

@app.route('/')
def hello():
    """Return a friendly HTTP greeting."""
    print("I am inside hello world")
    return 'Hello World! CD'

@app.route('/echo/<name>')
def echo(name):
    print(f"This was placed in the url: new-{name}")
    val = {"new-name": name}
    return jsonify(val)

@app.route('/api/search', methods=['POST'])
def search():
    try:
        data = request.get_json()

        # 向量化查询
        query_vector = model.encode(query).tolist()

        # 构建搜索请求
        search_body = {
            "knn": {
                "field": "combined_text_vector",
                "query_vector": query_vector,
                "k": top_k,
                "num_candidates": 100
            },
            "_source": ["name_english", "name_chinese", "types", 
                       "abilities", "description_scarlet", "global_no"],
        }

        # 执行搜索
        results = es_client.search(
            index="pokemon_index",
            body=search_body
        )

        # 格式化结果
        formatted_results = [{
            'nameEn': hit['_source']['name_english'],
            'nameCn': hit['_source']['name_chinese'],
            'types': hit['_source']['types'],
            'abilities': hit['_source']['abilities'],
            'number': hit['_source']['global_no'],
            'description': hit['_source']['description_scarlet']
        } for hit in results['hits']['hits']]

        return jsonify({
            'success': True,
            'data': formatted_results
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
        
        
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)
