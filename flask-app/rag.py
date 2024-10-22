import pandas as pd

from sentence_transformers import SentenceTransformer
from elasticsearch import Elasticsearch
import numpy as np
import os
import logging
from time import time
from groq import Groq
import json


class VectorSearchEngine:
    def __init__(self):
    # 初始化ES客户端和模型
        print('-------es init-------')
        self.es_client = Elasticsearch([os.getenv('ES_HOST', 'http://elasticsearch:9200')])
        self.model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
        print('self.es_client', self.es_client.info())  # Shows cluster info
        self.groq = Groq(api_key=os.getenv('KEY_groq'))

        # self.prompt_template = """
        #     You're a Pokémon expert. Use chinese return answer. Choose the SINGLE most relevant Pokémon entry from the CONTEXT that best matches the QUESTION. 

        #     First, explain WHY you chose this particular entry in 2-3 sentences. Consider:
        #     - How closely it matches the question's topic/theme
        #     - Specific keywords or concepts that overlap
        #     - Why other entries are less relevant

        #     Then, use only facts from your chosen entry to answer the question.

        #     QUESTION: {question}

        #     CONTEXT: {context}
        # """.strip()
        
        # self.prompt_template = """You are a Pokémon expert. Please analyze each Pokémon entry in the CONTEXT and evaluate its relevance to the QUESTION. Respond in Chinese using this exact format:
        #         When analyzing, consider:
        #         1. Match between question theme and Pokémon characteristics (type, abilities, description)
        #         2. Keyword overlap
        #         3. Statistical relevance
        #         4. Related information in Pokémon descriptions

        #         QUESTION: {question}

        #         CONTEXT: {context}
                
        #         Please analyze the content and context of the generated answer in relation to the question
        #         and provide your evaluation in parsable JSON without using code blocks:

        #         {{
        #         "no": [宝可梦编号],
        #         "relevance_score": [相关性评分 0-100],
        #         "analysis": [具体分析原因,50字以内,用中文回答]
        #         "most_relevant"
        #         "bestno": [最相关宝可梦的编号],
        #         "explanation": [为什么选择这个作为最相关的,100字以内,用中文回答],
        #         "story": [给每一个宝可梦写一段背景故事,100字以内,用中文来写],
        #         }}
        # # """.strip()
        
        # self.prompt_template = """
        #     You are a Pokémon Master Analyst. For each Pokémon entry in the CONTEXT, analyze and evaluate its relationship to the QUESTION. Present your analysis in Chinese using the following structured format:
        #     评估维度 (Evaluation Dimensions):

        #     主题契合度: 问题与宝可梦特征(属性、特性、描述)的匹配程度
        #     关键词关联: 描述文本与问题的用词重合度
        #     数据相关性: 基础数值与问题的关联度
        #     背景描述关联: 宝可梦描述与问题的关联程度

        #     请对CONTEXT中的每个宝可梦进行分析,并以以下JSON格式输出(无需代码块),不要添加任何额外文本或解释:

        #     {{
        #         "pokemon_entries": [
        #                 {{
        #                     "no": "宝可梦图鉴编号",
        #                     "name": "中文名称",
        #                     "relevance_score": "相关性评分(0-100)",
        #                     "power_rating": "实力评级(S/A/B/C/D)",
        #                     "relevance_analysis": "与问题相关性分析(50字内)",
        #                     "background_story": "为该宝可梦创作一个的背景故事,带悬疑色彩(100字内)"
        #                 }}
        #             ],
        #         "summary": {{
        #             "most_relevant_pokemon": {{
        #             "no": "最相关宝可梦的编号",
        #             "name": "中文名称",
        #             "explanation": "为什么这个宝可梦最相关(100字内)"
        #         }}
        #     }}

        #     QUESTION: {question}
        #     CONTEXT: {context}
        #     评分标准:
        #         - 实力评级参考:
        #         S级: 种族值总和600以上或具有超强特性组合
        #         A级: 种族值总和500-599或拥有优秀特性搭配
        #         B级: 种族值总和400-499且特性正常
        #         C级: 种族值总和300-399
        #         D级: 种族值总和300以下
        # """.strip()
        
        self.prompt_template = """
            あなたはポケモンマスターアナリストです。CONTEXTの各ポケモンエントリーについて、QUESTIONとの関係を分析・評価してください。以下の構造化された形式で分析を日本語で提示してください：

            評価次元：

            テーマ適合性: 質問とポケモンの特徴（タイプ、特性、説明）との適合度
            キーワード関連性: 説明文と質問における用語の一致度
            データ関連性: 基礎値と質問との関連性
            背景説明関連性: ポケモンの説明と質問との関連度

            CONTEXTの各ポケモンを分析し、以下のJSON形式で出力してください（コードブロックなし、追加の説明なし）：

            {{
            "pokemon_entries": [
                {{
                    "no": "ポケモン図鑑番号",
                    "name": "日本語名称",
                    "relevance_score": "関連性スコア（0-100）",
                    "power_rating": "実力ランク（S/A/B/C/D）",
                    "relevance_analysis": "質問との関連性分析（50文字以内）",
                    "background_story": "ミステリアスな背景ストーリー（100文字以内）"
                }}
            ],
            "summary": {{
                "most_relevant_pokemon": {{
                    "no": "最も関連性の高いポケモンの図鑑番号",
                    "name": "日本語名称",
                    "explanation": "このポケモンが最も関連性が高い理由（100文字以内）"
                }}
            }}
            }}

            QUESTION: {question}
            CONTEXT: {context}

            評価基準：
            パワーランクの基準：
            Sランク: 種族値合計600以上または特に強力な特性の組み合わせ
            Aランク: 種族値合計500-599または優れた特性の組み合わせ
            Bランク: 種族値合計400-499で通常の特性
            Cランク: 種族値合計300-399
            Dランク: 種族値合計300未満
        """.strip()
                    

        self.entry_template = """
            "nameEn": {nameEn},
            "nameCn": {nameCn},
            "nameJa": {nameJa},
            "types": {types},
            "abilities": {abilities},
            "no": {no},
            "description": {description},
            "hp": {stats[hp]},
            "attack": {stats[attack]},
            "defense": {stats[defense]},
            "specialAttack": {stats[specialAttack]},
            "specialDefense": {stats[specialDefense]},
            "speed": {stats[speed]}
        """.strip()
            
            
        # self.evaluation_prompt_template = """
        #     You are an expert evaluator for a RAG system.
        #     Your task is to analyze the relevance of the generated answer to the given question.
        #     Based on the relevance of the generated answer, you will classify it
        #     as "NON_RELEVANT", "PARTLY_RELEVANT", or "RELEVANT".

        #     Here is the data for evaluation:

        #     Question: {question}
        #     Generated Answer: {answer}

        #     Please analyze the content and context of the generated answer in relation to the question
        #     and provide your evaluation in parsable JSON without using code blocks:

        #     {{
        #     "Relevance": "NON_RELEVANT" | "PARTLY_RELEVANT" | "RELEVANT",
        #     "Explanation": "[Provide a brief explanation for your evaluation]"
        #     }}
        #     """.strip()
        
        
        self.evaluation_prompt_template = """
            あなたはRAGシステムの専門評価者です。
            与えられた質問に対する生成された回答の関連性を分析することがあなたの任務です。
            生成された回答の関連性に基づいて、「無関係」、「部分的に関連」、または「関連あり」に分類してください。

            評価のためのデータは以下の通りです：

            質問: {question}
            生成された回答: {answer}

            生成された回答の内容と文脈を質問との関連で分析し、
            以下のような解析可能なJSONで評価を提供してください（コードブロックは使用しない）：

            {{
            "関連性": "無関係" | "部分的に関連" | "関連あり",
            "説明": "[評価の簡潔な説明を提供してください]"
            }}
        """.strip()
            
            
    def search(self, query, top_k=100):
        try:
            print(f'Search query: {query}, top_k: {top_k}')
            
            query_vector = self.model.encode(query).tolist()
            
            search_body = {
                "knn": {
                    "field": "combined_text_vector",
                    "query_vector": query_vector,
                    "k": top_k,
                    "num_candidates": 100
                },
                "collapse": {
                    "field": "global_no"  # 按 global_no 去重
                },
                "size": 5,  # 限制返回5个结果
                "_source": {
                    "exclude": ["combined_text_vector"]
                }
            }

            results = self.es_client.search(
                index="pokemon_index",
                body=search_body
            )

            return [{
                'nameEn': hit['_source']['name_english'],
                'nameCn': hit['_source']['name_chinese'],
                'nameJa': hit['_source']['name_japanese'],
                'types': hit['_source']['types'],
                'abilities': hit['_source']['abilities'],
                'no': hit['_source']['global_no'],
                'description': hit['_source']['description_scarlet'],
                'descriptionViolet': hit['_source']['description_violet'],
                'form': hit['_source']['form'],
                'stats': {
                    'hp': hit['_source']['stats_hp'],
                    'attack': hit['_source']['stats_attack'],
                    'defense': hit['_source']['stats_defense'],
                    'specialAttack': hit['_source']['stats_special_attack'],
                    'specialDefense': hit['_source']['stats_special_defense'],
                    'speed': hit['_source']['stats_speed']
                }
            } for hit in results['hits']['hits']]

        except Exception as e:
            return str(e)

    def build_prompt(self, query, search_results):
        context = ""

        for doc in search_results:
            context = context + self.entry_template.format(**doc) + "\n\n"

        prompt = self.prompt_template.format(question=query, context=context).strip()
        return prompt


    def llm(self, prompt, model="llama3-8b-8192"):
        response = self.groq.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=model
        )
        answer = response.choices[0].message.content
        token_stats = {
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens, 
            "total_tokens": response.usage.total_tokens
        }
        return answer, token_stats

    def evaluate_relevance(self, question, answer):
        prompt = self.evaluation_prompt_template.format(question=question, answer=answer)
        evaluation, token_stats = self.llm(prompt, model="llama-3.2-90b-vision-preview")
        print(f'Evaluation prompt: {prompt}')
        print(f'Evaluation result: {evaluation}')

        try:
            json_eval = json.loads(evaluation)
            return json_eval, token_stats
        except json.JSONDecodeError:
            result = {"Relevance": "UNKNOWN", "Explanation": "Failed to parse evaluation"}
            return result, token_stats


    # def calculate_openai_cost(self, model, tokens):
    #     openai_cost = 0

    #     if model == "gpt-4o-mini":
    #         openai_cost = (
    #             tokens["prompt_tokens"] * 0.00015 + tokens["completion_tokens"] * 0.0006
    #         ) / 1000
    #     else:
    #         print("Model not recognized. OpenAI cost calculation failed.")

    #     return openai_cost


    def rag(self, query, model="llama3-8b-8192"):
        t0 = time()
        print(f'Starting RAG pipeline for query: {query}')

        search_results = self.search(query)
        
        print(f'Search results: {search_results}')

        prompt = self.build_prompt(query, search_results)
        print(f'Generated prompt: {prompt}')
        
        answer, token_stats = self.llm(prompt, model=model)
        print(f'LLM answer: {answer}')
        print(f'json.loads: {type(answer)}')
        
     
        try:
            if isinstance(answer, str):
                # 只取第一个 { 之后的所有内容
                answer_json = json.loads(answer[answer.find('{'):])
            else:
                answer_json = answer
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {str(e)}")
            answer_json = {
                "pokemon_entries": [],
                "summary": {}
            }

        print(f'answer_json--------: {answer_json}')

        relevance, rel_token_stats = self.evaluate_relevance(query, answer)
        print(f'Relevance evaluation: {relevance}')
        
        took = time() - t0

        answer_data = {
            "answer": answer,
            "model_used": model,
            "response_time": took,
            "relevance": relevance.get("Relevance", "UNKNOWN"),
            "relevance_explanation": relevance.get("Explanation", "Failed to parse evaluation"),
            "prompt_tokens": token_stats["prompt_tokens"],
            "completion_tokens": token_stats["completion_tokens"], 
            "total_tokens": token_stats["total_tokens"],
            "eval_prompt_tokens": rel_token_stats["prompt_tokens"],
            "eval_completion_tokens": rel_token_stats["completion_tokens"],
            "eval_total_tokens": rel_token_stats["total_tokens"],
            "pokemon_entries": answer_json.get("pokemon_entries"),
            "summary": answer_json.get("summary"),
            "search_results": search_results,
            # 移除openai_cost相关内容
        }
    
        return answer_data
