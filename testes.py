from elasticsearch import Elasticsearch

# 创建ES客户端
es_client = Elasticsearch(
   "http://localhost:9200",
   verify_certs=False,
   ssl_show_warn=False
)

# 测试连接
try:
   if es_client.ping():
       print("成功连接到ES!")
       print(es_client.info())
   else:
       print("无法连接到ES")
except Exception as e:
   print(f"连接错误: {e}")