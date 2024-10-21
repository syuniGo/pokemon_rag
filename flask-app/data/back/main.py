from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
from elasticsearch import Elasticsearch
import os
import rag

app = Flask(__name__)
CORS(app)

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
    data = request.get_json()
    query = data.get('query', '')
    engine = rag.VectorSearchEngine()
    res = engine.search(query)
    return res

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)
