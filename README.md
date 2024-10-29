# Pokemon RAG System

A Pokemon retrieval and question answering system based on vector search and large language models. This system utilizes vector database and semantic search technologies to return relevant Pokemon information based on natural language queries.

## AI Models Used

### 1. Sentence Transformer
- Model: `paraphrase-multilingual-mpnet-base-v2`
- Purpose: Multilingual text embedding generation
- Features:
  - Supports multiple languages (Chinese, Japanese, English)
  - Optimized for semantic similarity tasks
  - 768-dimensional vector outputs

### 2. Large Language Model (via Groq)
- Model: `llama-3.2-90b-vision-preview`
- Purpose: Natural language understanding and generation
- Features:
  - Advanced context understanding
  - Multilingual response generation
  - Story generation capabilities

## Important Note About API Keys

⚠️ **Groq API Configuration Required**

This system uses Groq's LLM API for advanced language processing. You must configure your Groq API key before using the system:

1. Create a `.env` file in the `flask-app` directory
2. Add your Groq API key:
```
KEY_groq=your_groq_api_key_here
```

Never commit your actual API key to version control. The system will not function properly without a valid Groq API key.

## System Architecture

The system consists of the following main components:

- **Frontend**: React-based user interface
  - Search interface
  - Pokemon detail display
  - Similarity score visualization

- **Backend**: Flask-based backend service
  - Query processing using SentenceTransformer
  - Vector retrieval service
  - Llama 3.2 90B integration via Groq API
  
- **Elasticsearch**: Vector database
  - Pokemon information storage
  - Vector similarity search

## Core Features

1. **Semantic Search**
   - Natural language query support via SentenceTransformer
   - Similarity-based Pokemon retrieval
   - Multi-language support (Chinese, Japanese, English)

2. **Advanced Language Processing (via Llama 3.2)**
   - Context-aware response generation
   - Pokemon background story creation
   - Relevance analysis

3. **RAG (Retrieval Augmented Generation)**
   - Context generation based on retrieval results
   - Relevance analysis and scoring
   - Automatic Pokemon background story generation

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.8+
- Valid Groq API key
- At least 16GB RAM recommended (for model loading)

### Installation Steps

1. Clone the repository
```bash
git clone <repository-url>
cd pokemon_rag
```

2. Configure Groq API key
```bash
# In flask-app/.env
KEY_groq=your_groq_api_key_here
```

3. Build services
```bash
docker-compose build
```

4. Start services
```bash
docker-compose up -d
```

5. Generate initial data
```bash
docker exec -it pokemon_rag_backend_1 bash
python injest.py
```


The system will start on the following ports:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Elasticsearch: http://localhost:9200


