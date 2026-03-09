---
name: vector-db
description: Vector databases for AI. Pinecone, Chroma, Weaviate, Qdrant. Embeddings, semantic search, RAG.
last_updated: 2026-03
owner: Frank
---

# Vector Databases

Store and search embeddings. Power semantic search and RAG.

> **See also:** `ai-builder/rag/SKILL.md`, `ai-builder/langchain/SKILL.md`

---

## Context Questions

Before choosing a vector DB:

1. **What's the scale?** — Prototyping, production, enterprise
2. **What's the hosting preference?** — Managed cloud, self-hosted, embedded
3. **What's the query pattern?** — Simple similarity, filtered, hybrid
4. **What's the data volume?** — Thousands, millions, billions of vectors
5. **What's the latency requirement?** — Real-time, batch acceptable

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Hosting** | Embedded (local) ←→ Managed cloud |
| **Scale** | Dev/prototype ←→ Production billions |
| **Features** | Basic search ←→ Hybrid + filters |
| **Cost** | Free/open source ←→ Enterprise pricing |
| **Setup** | Zero config ←→ Infrastructure required |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Quick prototype | Chroma (in-memory, zero setup) |
| Production SaaS | Pinecone (managed, scalable) |
| Self-hosted production | Qdrant or Weaviate (Docker) |
| Cost-sensitive | Chroma or Qdrant (open source) |
| Hybrid search needed | Weaviate (built-in BM25 + vector) |
| Python-first | Chroma (native Python) |
| Enterprise compliance | Pinecone or Weaviate Cloud |

---

## TL;DR

| Database | Best For | Hosting |
|----------|----------|---------|
| **Chroma** | Prototyping, local dev | Embedded/self-hosted |
| **Pinecone** | Production, managed | Cloud only |
| **Weaviate** | Hybrid search, GraphQL | Cloud + self-hosted |
| **Qdrant** | Performance, self-hosted | Cloud + self-hosted |
| **Milvus** | Enterprise, massive scale | Self-hosted |
| **pgvector** | Postgres users | Postgres extension |

---

## Part 1: Chroma (Local/Prototype)

### Setup

```bash
uv add chromadb
```

### Basic Usage

```python
import chromadb

# In-memory (ephemeral)
client = chromadb.Client()

# Persistent (local files)
client = chromadb.PersistentClient(path="./chroma_db")

# Create collection
collection = client.create_collection(
    name="documents",
    metadata={"hnsw:space": "cosine"}  # Distance metric
)

# Add documents (auto-embeds with default model)
collection.add(
    documents=["Document about AI", "Document about ML", "Document about NLP"],
    metadatas=[{"source": "wiki"}, {"source": "blog"}, {"source": "paper"}],
    ids=["doc1", "doc2", "doc3"]
)

# Query
results = collection.query(
    query_texts=["artificial intelligence"],
    n_results=2,
    where={"source": "wiki"}  # Metadata filter
)

print(results["documents"])
print(results["distances"])
```

### Custom Embeddings

```python
from chromadb.utils import embedding_functions

# OpenAI embeddings
openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key="YOUR_KEY",
    model_name="text-embedding-3-small"
)

collection = client.create_collection(
    name="documents",
    embedding_function=openai_ef
)
```

### With LangChain

```python
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()

# Create from documents
vectorstore = Chroma.from_documents(
    documents=docs,
    embedding=embeddings,
    persist_directory="./chroma_db"
)

# Query
results = vectorstore.similarity_search("AI capabilities", k=5)
```

---

## Part 2: Pinecone (Managed Production)

### Setup

```bash
uv add pinecone-client
```

### Initialize

```python
from pinecone import Pinecone, ServerlessSpec

pc = Pinecone(api_key="YOUR_API_KEY")

# Create index
pc.create_index(
    name="my-index",
    dimension=1536,  # OpenAI embedding size
    metric="cosine",
    spec=ServerlessSpec(
        cloud="aws",
        region="us-east-1"
    )
)

index = pc.Index("my-index")
```

### Upsert Vectors

```python
import openai

def get_embedding(text: str) -> list[float]:
    response = openai.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

# Upsert with metadata
vectors = [
    {
        "id": "doc1",
        "values": get_embedding("AI is transforming industries"),
        "metadata": {"source": "blog", "category": "tech"}
    },
    {
        "id": "doc2",
        "values": get_embedding("Machine learning enables prediction"),
        "metadata": {"source": "paper", "category": "ml"}
    }
]

index.upsert(vectors=vectors, namespace="documents")
```

### Query

```python
# Simple query
results = index.query(
    vector=get_embedding("artificial intelligence applications"),
    top_k=5,
    include_metadata=True,
    namespace="documents"
)

for match in results.matches:
    print(f"ID: {match.id}, Score: {match.score}")
    print(f"Metadata: {match.metadata}")

# Filtered query
results = index.query(
    vector=query_embedding,
    top_k=5,
    filter={"category": {"$eq": "tech"}},
    include_metadata=True
)
```

### With LangChain

```python
from langchain_pinecone import PineconeVectorStore
from langchain_openai import OpenAIEmbeddings

vectorstore = PineconeVectorStore(
    index=index,
    embedding=OpenAIEmbeddings(),
    text_key="text"
)

# Add documents
vectorstore.add_documents(documents)

# Search
docs = vectorstore.similarity_search("query", k=5)
```

---

## Part 3: Weaviate (Hybrid Search)

### Setup

```bash
uv add weaviate-client
```

### Cloud Instance

```python
import weaviate
from weaviate.classes.init import Auth

client = weaviate.connect_to_weaviate_cloud(
    cluster_url="https://your-cluster.weaviate.network",
    auth_credentials=Auth.api_key("YOUR_KEY"),
    headers={"X-OpenAI-Api-Key": "YOUR_OPENAI_KEY"}
)
```

### Local Docker

```yaml
# docker-compose.yml
version: '3.4'
services:
  weaviate:
    image: semitechnologies/weaviate:1.24.0
    ports:
      - "8080:8080"
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: 'text2vec-openai'
      ENABLE_MODULES: 'text2vec-openai'
      OPENAI_APIKEY: ${OPENAI_API_KEY}
```

```python
client = weaviate.connect_to_local()
```

### Create Collection

```python
from weaviate.classes.config import Property, DataType, Configure

collection = client.collections.create(
    name="Document",
    vectorizer_config=Configure.Vectorizer.text2vec_openai(),
    properties=[
        Property(name="text", data_type=DataType.TEXT),
        Property(name="source", data_type=DataType.TEXT),
        Property(name="category", data_type=DataType.TEXT),
    ]
)
```

### Add Objects

```python
documents = client.collections.get("Document")

# Single insert
documents.data.insert({
    "text": "AI is transforming healthcare",
    "source": "research",
    "category": "health"
})

# Batch insert
with documents.batch.dynamic() as batch:
    for doc in my_documents:
        batch.add_object({
            "text": doc.text,
            "source": doc.source,
            "category": doc.category
        })
```

### Hybrid Search

```python
# Vector search
response = documents.query.near_text(
    query="artificial intelligence",
    limit=5
)

# Hybrid search (vector + keyword)
response = documents.query.hybrid(
    query="machine learning applications",
    limit=5,
    alpha=0.5  # 0 = pure keyword, 1 = pure vector
)

# With filters
from weaviate.classes.query import Filter

response = documents.query.hybrid(
    query="AI healthcare",
    filters=Filter.by_property("category").equal("health"),
    limit=5
)

for obj in response.objects:
    print(obj.properties["text"])
```

---

## Part 4: Qdrant (High Performance)

### Setup

```bash
uv add qdrant-client
```

### Local

```bash
docker run -p 6333:6333 qdrant/qdrant
```

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

client = QdrantClient("localhost", port=6333)

# Create collection
client.create_collection(
    collection_name="documents",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
)
```

### Cloud

```python
client = QdrantClient(
    url="https://your-cluster.qdrant.io",
    api_key="YOUR_API_KEY"
)
```

### Upsert

```python
points = [
    PointStruct(
        id=1,
        vector=get_embedding("AI transforms industries"),
        payload={"text": "AI transforms industries", "source": "blog"}
    ),
    PointStruct(
        id=2,
        vector=get_embedding("ML enables predictions"),
        payload={"text": "ML enables predictions", "source": "paper"}
    )
]

client.upsert(collection_name="documents", points=points)
```

### Search

```python
from qdrant_client.models import Filter, FieldCondition, MatchValue

# Simple search
results = client.search(
    collection_name="documents",
    query_vector=get_embedding("artificial intelligence"),
    limit=5
)

# Filtered search
results = client.search(
    collection_name="documents",
    query_vector=query_vector,
    query_filter=Filter(
        must=[
            FieldCondition(key="source", match=MatchValue(value="blog"))
        ]
    ),
    limit=5
)

for result in results:
    print(f"Score: {result.score}, Payload: {result.payload}")
```

---

## Part 5: pgvector (PostgreSQL)

### Setup

```sql
-- Enable extension
CREATE EXTENSION vector;

-- Create table
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    content TEXT,
    embedding vector(1536),
    metadata JSONB
);

-- Create index for fast search
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### Python Usage

```python
import psycopg2
from pgvector.psycopg2 import register_vector

conn = psycopg2.connect("postgresql://user:pass@localhost/mydb")
register_vector(conn)

cur = conn.cursor()

# Insert
embedding = get_embedding("AI is transforming industries")
cur.execute(
    "INSERT INTO documents (content, embedding, metadata) VALUES (%s, %s, %s)",
    ("AI is transforming industries", embedding, {"source": "blog"})
)

# Search
query_embedding = get_embedding("artificial intelligence")
cur.execute(
    """
    SELECT content, metadata, 1 - (embedding <=> %s) as similarity
    FROM documents
    ORDER BY embedding <=> %s
    LIMIT 5
    """,
    (query_embedding, query_embedding)
)

results = cur.fetchall()
```

### With SQLAlchemy

```python
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base
from pgvector.sqlalchemy import Vector

Base = declarative_base()

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True)
    content = Column(String)
    embedding = Column(Vector(1536))
```

---

## Part 6: Comparison

| Feature | Chroma | Pinecone | Weaviate | Qdrant |
|---------|--------|----------|----------|--------|
| **Hosting** | Local/Self | Cloud | Both | Both |
| **Free tier** | Unlimited | 100K vectors | Yes | Yes |
| **Hybrid search** | No | No | Yes | Yes |
| **Filtering** | Basic | Advanced | Advanced | Advanced |
| **Ease of use** | Easiest | Easy | Medium | Medium |
| **Performance** | Good | Excellent | Excellent | Excellent |
| **GraphQL** | No | No | Yes | No |

---

## Part 7: RAG Pattern

```python
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA

# Setup
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(docs, embeddings)

# Create retriever
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 5}
)

# RAG chain
llm = ChatOpenAI(model="gpt-4")
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever
)

# Query
response = qa_chain.invoke("What is the main topic?")
```

---

## Part 8: Best Practices

### Chunking Strategy

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ". ", " ", ""]
)

chunks = splitter.split_documents(documents)
```

### Metadata Design

```python
# Good metadata structure
{
    "source": "technical_docs",
    "section": "installation",
    "version": "2.0",
    "last_updated": "2025-01-01",
    "doc_id": "install-guide-001"
}
```

### Index Optimization

```python
# Pinecone: Use namespaces for organization
index.upsert(vectors, namespace="product_docs")
index.upsert(vectors, namespace="support_tickets")

# Query specific namespace
index.query(vector, namespace="product_docs", top_k=5)
```

---

## Checklist

- [ ] Vector DB chosen based on requirements
- [ ] Embedding model selected
- [ ] Collection/index created
- [ ] Chunking strategy defined
- [ ] Metadata schema designed
- [ ] Upsert pipeline working
- [ ] Query with filters tested
- [ ] Performance benchmarked
- [ ] RAG integration complete

---

## Resources

- Chroma: https://docs.trychroma.com
- Pinecone: https://docs.pinecone.io
- Weaviate: https://weaviate.io/developers/weaviate
- Qdrant: https://qdrant.tech/documentation

---

## Related Skills

- `ai-builder/rag/SKILL.md` — RAG pipelines
- `ai-builder/langchain/SKILL.md` — LangChain integration
- `ai-builder/huggingface/SKILL.md` — Embedding models
- `agents/database/SKILL.md` — Traditional databases
