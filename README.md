# 宝可梦语义搜索系统

## 项目背景
宝可梦训练师在选择宝可梦时常面临决策困难。现有的搜索系统存在以下局限：

1. **搜索能力受限**
   - 仅支持属性、名称等静态特征匹配
   - 无法处理自然语言描述的需求
   - 缺乏对宝可梦特性和战术价值的理解

2. **用户体验不佳**
   - 检索结果缺乏个性化推荐
   - 没有推荐原因的解释
   - 战术建议和使用场景说明不足

## 解决方案
本项目基于RAG（检索增强生成）技术，构建了智能化的宝可梦搜索推荐系统：

### 核心功能
- 自然语言理解：解析用户复杂的搜索意图
- 语义检索：基于深度向量匹配的相似度搜索
- 智能推荐：结合场景的个性化宝可梦推荐
- 策略分析：提供对战策略和团队搭配建议

### 技术特点
- 高准确度：采用大语言模型提升检索精度
- 快速响应：优化的向量检索算法
- 可扩展性：模块化设计，易于功能扩展

## 技术架构

### 系统组件
```
├── Frontend
│   ├── React 18
│   ├── TailwindCSS
│   └── ShadcnUI
├── Backend
│   ├── FastAPI
│   ├── LangChain
│   └── pydantic
└── Infrastructure
    ├── Elasticsearch (向量存储)
    └── Llama-13B (推理引擎)
```

### RAG 实现细节

#### 1. 数据准备
```python
data/
├── raw/          # 原始宝可梦数据
├── processed/    # 预处理后的结构化数据
└── vectors/      # 向量化后的特征数据
```

#### 2. 检索流程
1. 查询处理
   - 用户输入分析
   - 查询意图识别
   - 关键信息提取

2. 向量检索
   - 多维特征匹配
   - 相似度计算
   - 结果排序优化

3. 内容生成
   - 基于检索结果的内容整合
   - 个性化推荐生成
   - 战术建议生成

## 快速开始

### 环境要求
```bash
Python >= 3.9
Node.js >= 16
Docker >= 20.10
```

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/syuniGo/pokemon_rag.git
cd pokemon_rag
```

2. 环境配置
```bash
# 后端配置
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# 前端配置
cd frontend
npm install
```

3. 启动服务
```bash
# 使用 Docker Compose
docker-compose up -d

# 或手动启动
# 后端
cd backend
uvicorn main:app --reload --port 8084

# 前端
cd frontend
npm run dev
```

### 访问地址
- 网页界面：http://localhost:3000
- API文档：http://localhost:8084/docs
- 健康检查：http://localhost:8084/health

## 使用示例

```bash
# 示例查询
curl -X POST "http://localhost:8080/api/search" \
     -H "Content-Type: application/json" \
     -d "{"query": "fairy"}"
```

响应示例：
```json
{
    "nameEn": "Sylveon",
    "nameCn": "仙子伊布",
    "nameJa": "ニンフィア",
    "types": [
        "フェアリー",
        ""
    ],
    "abilities": [
        "メロメロボディ",
        "",
        "フェアリースキン"
    ],
    "no": "700",
    "description": "敵意を 消す 癒しの 波動を リボンのような 触角から 相手の 体に 送り込む。",
    "descriptionViolet": "触角を なびかせ 軽やかに 舞う 姿は 優雅だが 技は 鋭く 急所を 狙う。",
    "form": "",
    "stats": {
        "hp": 95,
        "attack": 65,
        "defense": 65,
        "specialAttack": 110,
        "specialDefense": 130,
        "speed": 60
    }
}
```
docker exec backend make run

