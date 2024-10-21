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

        self.prompt_template = """
            You're a Pokémon expert. Choose the SINGLE most relevant Pokémon entry from the CONTEXT that best matches the QUESTION. 

            First, explain WHY you chose this particular entry in 2-3 sentences. Consider:
            - How closely it matches the question's topic/theme
            - Specific keywords or concepts that overlap
            - Why other entries are less relevant

            Then, use only facts from your chosen entry to answer the question.

            QUESTION: {question}

            CONTEXT: {context}
        """.strip()



        self.entry_template = """
            "nameEn": {nameEn}
            "nameCn": {nameCn}
            "types": {types}
            "abilities": {abilities}
            "number": {number}
            "description": {description}
            """.strip()
            
            
        self.evaluation_prompt_template = """
            You are an expert evaluator for a RAG system.
            Your task is to analyze the relevance of the generated answer to the given question.
            Based on the relevance of the generated answer, you will classify it
            as "NON_RELEVANT", "PARTLY_RELEVANT", or "RELEVANT".

            Here is the data for evaluation:

            Question: {question}
            Generated Answer: {answer}

            Please analyze the content and context of the generated answer in relation to the question
            and provide your evaluation in parsable JSON without using code blocks:

            {{
            "Relevance": "NON_RELEVANT" | "PARTLY_RELEVANT" | "RELEVANT",
            "Explanation": "[Provide a brief explanation for your evaluation]"
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
                "_source": ["name_english", "name_chinese", "types", 
                        "abilities", "description_scarlet", "global_no"],
            }

            results = self.es_client.search(
                index="pokemon_index",
                body=search_body
            )

            return [{
                'nameEn': hit['_source']['name_english'],
                'nameCn': hit['_source']['name_chinese'],
                'types': hit['_source']['types'],
                'abilities': hit['_source']['abilities'],
                'number': hit['_source']['global_no'],
                'description': hit['_source']['description_scarlet']
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
        evaluation, token_stats = self.llm(prompt, model="mixtral-8x7b-32768")
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
            "search_results": search_results,
            # 移除openai_cost相关内容
        }
    
        return answer_data
