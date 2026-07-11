---
name: rag-building
description: >
  Builds Retrieval-Augmented Generation pipelines — chunking strategies, embedding
  model selection, vector store configuration (pgvector, Pinecone, Qdrant, ChromaDB),
  hybrid search (semantic + keyword), query transformation (HyDE, multi-query),
  reranking, evaluation (faithfulness, relevance, recall), and production patterns
  (GraphRAG, corrective RAG, agentic RAG). Use when building RAG pipelines,
  adding semantic search, connecting LLMs to knowledge bases, or when user mentions
  RAG, embeddings, vector search, chunking, or retrieval.
---

# RAG Building — Retrieval-Augmented Generation

RAG is not "stuff documents into a vector DB and hope." It is a retrieval
engineering discipline with distinct stages, each with failure modes that
compound downstream. Get chunking wrong → embeddings are noisy → retrieval
returns irrelevant context → the model hallucinates with confidence.

This skill covers the full pipeline from raw documents to production RAG.

---

## Table of Contents

1. [The RAG Pipeline](#1--the-rag-pipeline)
2. [Chunking Strategies](#2--chunking-strategies)
3. [Embedding Models](#3--embedding-models)
4. [Vector Stores](#4--vector-stores)
5. [Retrieval Strategies](#5--retrieval-strategies)
6. [Query Transformation](#6--query-transformation)
7. [Reranking](#7--reranking)
8. [Advanced RAG Patterns](#8--advanced-rag-patterns)
9. [Evaluation](#9--evaluation)
10. [STOP Gate](#10--stop-gate)

---

## 1 — The RAG Pipeline

```
Documents → Chunking → Embedding → Indexing → Query → Retrieval → Reranking → Context Assembly → Generation → Evaluation
```

Every stage is a decision point. Don't skip stages.

| Stage | Input | Output | Key Decision |
|-------|-------|--------|-------------|
| Chunking | Raw documents | Text chunks | Chunk size, overlap, strategy |
| Embedding | Text chunks | Vectors | Model selection, dimensions |
| Indexing | Vectors | Searchable index | Vector store, index type |
| Query | User question | Search query | Transformation strategy |
| Retrieval | Search query | Candidate chunks | Top-K, similarity threshold |
| Reranking | Candidate chunks | Ranked chunks | Cross-encoder, relevance filter |
| Context Assembly | Ranked chunks | LLM context | Token budget, ordering |
| Generation | Context + query | Answer | Model selection, system prompt |
| Evaluation | Answer + sources | Quality metrics | Faithfulness, relevance, recall |

---

## 2 — Chunking Strategies

Chunking is where most RAG pipelines fail. Wrong chunk size = wrong retrieval.

### Strategy Decision Tree

```
Is the content structured (code, markdown, HTML)?
  YES → Semantic/structural chunking (split on headings, functions, classes)
  NO  → Is the content long-form prose?
    YES → Recursive character splitting with overlap
    NO  → Is it tabular or key-value?
      YES → Row-level or record-level chunking
      NO  → Fixed-size with overlap (fallback)
```

### Chunk Size Guidelines

| Content Type | Chunk Size | Overlap | Rationale |
|-------------|-----------|---------|-----------|
| Code files | Per function/class | 0 | Semantic boundaries are natural |
| Technical docs | 500–1000 tokens | 100–200 tokens | Preserves concept completeness |
| Conversational text | 200–400 tokens | 50–100 tokens | Shorter = more precise retrieval |
| Legal/medical | 1000–1500 tokens | 200–300 tokens | Context-dependent language needs more |
| Q&A pairs | Per pair | 0 | Each pair is a complete unit |

### Metadata Enrichment

Every chunk must carry metadata. Bare chunks lose their origin and context.

Required metadata per chunk:
- `source_file` — which document this came from
- `chunk_index` — position within the document
- `section_title` — heading or structural context
- `total_chunks` — how many chunks the source produced
- `created_at` — timestamp for freshness filtering

Optional but valuable:
- `author`, `category`, `language`
- `parent_chunk_id` — for hierarchical retrieval
- `summary` — LLM-generated chunk summary for hybrid search

---

## 3 — Embedding Models

### Selection Decision Tree

```
Need multilingual support?
  YES → Cohere embed-v4, Voyage multilingual, or Google multilingual-e5
  NO  → Is cost a constraint?
    YES → Is the corpus small (<100K chunks)?
      YES → OpenAI text-embedding-3-small (1536d) or Gemini text-embedding-004
      NO  → Local model (nomic-embed-text, BGE, GTE)
    NO  → OpenAI text-embedding-3-large (3072d) or Cohere embed-v4
```

### 2026 Model Comparison

| Model | Dimensions | Context | Best For |
|-------|-----------|---------|----------|
| OpenAI text-embedding-3-large | 3072 | 8191 tokens | Highest quality, English |
| OpenAI text-embedding-3-small | 1536 | 8191 tokens | Good quality, lower cost |
| Google text-embedding-004 | 768 | 2048 tokens | Google ecosystem, fast |
| Cohere embed-v4 | 1024 | 512 tokens | Multilingual, compression |
| Voyage-3-large | 1024 | 32K tokens | Long-context embedding |
| nomic-embed-text | 768 | 8192 tokens | Local/open-source, fast |
| BGE-large-en-v1.5 | 1024 | 512 tokens | Open-source, high quality |

### Critical Rules

- **Never mix embedding models** in the same index. Vectors from different
  models are incompatible — cosine similarity across models is meaningless.
- **Normalize dimensions** if using Matryoshka models (text-embedding-3) —
  you can reduce dimensions but must be consistent.
- **Batch embed** — don't embed one chunk at a time. Batch for throughput.

---

## 4 — Vector Stores

### Selection Decision Tree

```
Already using Supabase?
  YES → pgvector extension (zero new infrastructure)
  NO  → Need managed, serverless?
    YES → Pinecone (managed) or Qdrant Cloud
    NO  → Self-hosted?
      YES → Need rich filtering?
        YES → Qdrant or Weaviate
        NO  → ChromaDB (simple, embedded)
      NO  → Pinecone Serverless
```

### Store Comparison

| Store | Type | Best For | Scaling | Filtering |
|-------|------|----------|---------|-----------|
| **pgvector** (Supabase) | Extension | Already on Postgres, small-mid scale | Vertical | SQL WHERE |
| **Pinecone** | Managed SaaS | Zero-ops, serverless, large scale | Horizontal | Metadata filters |
| **Qdrant** | Self-hosted/Cloud | Rich filtering, payload storage | Horizontal | Complex filters |
| **Weaviate** | Self-hosted/Cloud | Multi-modal, hybrid search built-in | Horizontal | GraphQL filters |
| **ChromaDB** | Embedded | Prototyping, local dev, small datasets | Single node | Basic metadata |

### Index Types

| Index | When to Use | Trade-off |
|-------|------------|-----------|
| HNSW | Default for most use cases | Fast search, more memory |
| IVF-Flat | Large datasets, memory constrained | Slower search, less memory |
| IVF-PQ | Very large datasets | Approximate, lossy compression |
| Flat/Brute | <10K vectors | Exact results, no index overhead |

### Supabase pgvector Setup

If using Supabase (check `supabase-building` skill for full patterns):

```sql
-- Enable the extension
create extension if not exists vector;

-- Create embeddings table
create table documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  metadata jsonb default '{}',
  embedding vector(1536),  -- match your model's dimensions
  created_at timestamptz default now()
);

-- Create HNSW index for fast similarity search
create index on documents using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- Similarity search function
create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 5
) returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
) language plpgsql as $$
begin
  return query
  select
    d.id, d.content, d.metadata,
    1 - (d.embedding <=> query_embedding) as similarity
  from documents d
  where 1 - (d.embedding <=> query_embedding) > match_threshold
  order by d.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

---

## 5 — Retrieval Strategies

### Hybrid Search (Recommended Default)

Combine semantic search (vector similarity) with keyword search (BM25/full-text).

```
Score = α * semantic_score + (1 - α) * keyword_score
```

Default α = 0.7 (favor semantic). Tune per domain.

Why hybrid:
- Semantic catches paraphrases and conceptual matches
- Keyword catches exact terms, names, IDs that embeddings miss
- Together they cover each other's blind spots

### Retrieval Parameters

| Parameter | Default | When to Adjust |
|-----------|---------|----------------|
| top_k | 5–10 | Increase for broad questions, decrease for specific |
| similarity_threshold | 0.7 | Lower for recall, raise for precision |
| max_tokens_retrieved | 3000 | Match to model's context budget minus system prompt |
| diversity | off | Enable (MMR) when results are too similar |

### MMR (Maximal Marginal Relevance)

When top-K results are too similar (all from the same section), use MMR:
```
MMR = λ * relevance(chunk, query) - (1-λ) * max_similarity(chunk, selected_chunks)
```
λ = 0.5 balances relevance and diversity.

---

## 6 — Query Transformation

Raw user queries are often poor search queries. Transform them.

| Technique | When to Use | How It Works |
|-----------|------------|-------------|
| **HyDE** (Hypothetical Document Embeddings) | Vague or short queries | Generate a hypothetical answer, embed THAT, search with it |
| **Multi-query** | Broad questions | Generate 3–5 query variations, retrieve for each, merge results |
| **Step-back** | Specific questions needing broader context | Ask a more general version first, use that context |
| **Decomposition** | Complex multi-part questions | Split into sub-questions, retrieve for each, synthesize |
| **Query routing** | Multiple knowledge bases | Classify the query's domain, route to the right index |

### HyDE Example

```
User query: "How do I fix the auth bug?"
→ LLM generates hypothetical answer: "The auth bug is caused by expired JWT
  tokens not being refreshed. Fix by implementing a token refresh middleware
  that checks expiry before each API call..."
→ Embed the hypothetical answer (not the original query)
→ Search with that embedding
→ Results are more semantically aligned to the actual answer
```

---

## 7 — Reranking

Retrieval returns candidates. Reranking sorts them by actual relevance.

### Why Rerank

Vector similarity is a proxy for relevance, not relevance itself. A reranker
(cross-encoder) reads the query AND the chunk together and scores true
relevance. This catches cases where a chunk is semantically close but not
actually answering the question.

### Reranker Options

| Reranker | Type | Best For |
|----------|------|----------|
| Cohere Rerank v3 | API | Production, high quality |
| Jina Reranker v2 | API/Local | Open-source alternative |
| BGE Reranker | Local | Self-hosted, no API cost |
| LLM-as-judge | Any LLM | When dedicated reranker unavailable |

### Pipeline

```
Query → Retrieve top-20 → Rerank → Take top-5 → Assemble context → Generate
```

Retrieve more than you need (top-20), rerank, then take the best (top-5).

---

## 8 — RAG Architecture Types

Every RAG variant is a response to a specific failure mode. Choose the pattern
that addresses YOUR bottleneck, don't default to naive RAG.

### RAG Type Taxonomy

| Type | How It Works | When to Use | Failure It Fixes |
|------|-------------|-------------|-----------------|
| **Naive RAG** | Query → embed → retrieve top-K → generate | Prototyping, simple Q&A | N/A (baseline) |
| **Hybrid RAG** | Semantic search + BM25/keyword search, fused scores | Production default | Semantic misses exact terms, keywords miss paraphrases |
| **GraphRAG** | Knowledge graph + vector index, merged retrieval | Entity-rich domains (code, research, orgs) | Flat retrieval misses structural relationships |
| **Corrective RAG (CRAG)** | Retrieve → evaluate relevance → if low, rewrite + re-retrieve | Noisy corpora, broad queries | Bad retrieval passes to generation unchecked |
| **Self-RAG** | Model decides whether to retrieve, evaluates its own output | Open-ended tasks mixing knowledge + reasoning | Model retrieves when it doesn't need to, or skips when it should |
| **Agentic RAG** | Agent orchestrates retrieval strategy — which indexes, when to search web, when to ask follow-ups | Multi-domain, complex workflows | Static pipelines can't adapt to query complexity |
| **Modular RAG** | Plug-and-play components — swap chunkers, retrievers, rerankers independently | Teams iterating on pipeline quality | Monolithic pipelines are hard to debug and improve |
| **Adaptive RAG** | Routes queries to different pipeline configurations based on complexity | Mixed query types (simple + complex) | One-size pipeline over-retrieves for simple, under-retrieves for complex |
| **Multi-modal RAG** | Embeds and retrieves images, audio, video alongside text | Products with visual/audio content | Text-only misses non-text knowledge |
| **Contextual RAG** | Prepend document-level context to each chunk before embedding | Long documents where chunks lose context | Chunks are semantically ambiguous without surrounding context |
| **RAPTOR** | Recursively summarize chunks into a tree, retrieve at multiple abstraction levels | Long documents needing both detail and summary | Flat retrieval can't zoom in/out on abstraction |
| **FLARE** | Generate token-by-token, trigger retrieval when confidence drops | Real-time generation with dynamic retrieval | Pre-retrieval can't predict what the model will need mid-generation |
| **Multi-hop RAG** | Chain multiple retrieval passes — answer from pass 1 informs query for pass 2 | Questions requiring reasoning across multiple documents | Single-pass retrieval can't follow chains of evidence |
| **Parent-Child RAG** | Embed small child chunks, return large parent chunks to the model | Need precise matching but broad context for generation | Small chunks match well but lack context; large chunks match poorly |
| **Cache-Augmented Generation** | Pre-load full corpus into model's extended context window (1M+ tokens) | Small corpora (<500 pages), latency-sensitive | Retrieval pipeline overhead when the corpus fits in context |
| **Sentence Window** | Embed individual sentences, return surrounding window (±N sentences) | Fine-grained retrieval in dense documents | Chunk-level retrieval is too coarse |
| **Iterative RAG** | Multiple retrieval-generation cycles — each generation refines the next query | Research synthesis, deep analysis | Single-pass can't build complex answers from scattered evidence |

### RAG Type Selection Decision Tree

```
Is your corpus small enough to fit in a 1M context window?
  YES → Cache-Augmented Generation (skip the pipeline entirely)
  NO  → Do queries need to reason across multiple documents?
    YES → Multi-hop RAG or Iterative RAG
    NO  → Does the domain have rich entity relationships?
      YES → GraphRAG (use graphify)
      NO  → Do queries vary wildly in complexity?
        YES → Adaptive RAG (route simple vs complex)
        NO  → Is the corpus noisy or low-quality?
          YES → Corrective RAG (validate before generating)
          NO  → Do you need images/audio/video?
            YES → Multi-modal RAG
            NO  → Start with Hybrid RAG + Reranking (production default)
                   Add Contextual RAG if chunks lose document context
                   Add Parent-Child if you need precision + broad context
```

### Pattern Details

#### GraphRAG

Combines knowledge graphs with vector retrieval. Uses graphify output.

```
Documents → graphify → Knowledge Graph + Vector Index
Query → Graph traversal for structure + Vector search for content → Merged context
```

When to use: Complex domains with entity relationships (codebases, research,
organizational knowledge).

Reference: `.codex/skills/graphify/SKILL.md` for graph generation.

#### Corrective RAG (CRAG)

Self-correcting retrieval that evaluates whether retrieved chunks actually
answer the question before generating.

```
Query → Retrieve → Evaluate relevance
  → RELEVANT: Generate from retrieved context
  → AMBIGUOUS: Rewrite query → Re-retrieve → Generate
  → IRRELEVANT: Fall back to web search or refuse
```

Key: the evaluation step uses an LLM to score chunk relevance before passing
to generation. This prevents the "confident hallucination" failure mode.

#### Self-RAG

The model itself decides:
1. **Should I retrieve?** (Not every question needs retrieval)
2. **Is this chunk relevant?** (Filter before generation)
3. **Is my answer supported?** (Self-check faithfulness)
4. **Is my answer useful?** (Self-check quality)

```
Query → Model decides: retrieve or generate directly?
  → RETRIEVE: Retrieve → Model scores relevance → Generate → Model checks support
  → DIRECT: Generate from parametric knowledge → Model checks quality
```

#### Agentic RAG

The retrieval system is an agent that decides its own strategy:
- Which indexes to query (vector, graph, full-text, web)
- Whether to decompose the question first
- When to ask for clarification
- When to combine multiple retrieval passes
- Whether to cite specific sources or synthesize

Use when: queries span multiple knowledge domains or need dynamic routing.

#### Contextual RAG (Anthropic Pattern)

Before embedding, prepend document-level context to each chunk:

```
Original chunk: "The quarterly revenue increased 15%."
Contextual chunk: "This chunk is from Acme Corp's Q3 2025 earnings report,
  specifically the Financial Highlights section. The quarterly revenue
  increased 15%."
```

The prepended context is generated by an LLM once during indexing. This fixes
the "orphan chunk" problem where chunks lose meaning without their document.

#### RAPTOR

Recursively summarize chunks into a tree:

```
Level 0: Original chunks (leaves)
Level 1: Summaries of chunk groups
Level 2: Summaries of summaries
Level N: Root summary (entire document)
```

Retrieval searches ALL levels. Detailed questions hit Level 0, broad questions
hit higher levels. Best for long documents where you need both detail and overview.

#### Multi-modal RAG

Embed non-text content alongside text:
- **Images**: Use CLIP or multimodal embeddings, store image URLs in metadata
- **Audio**: Transcribe first, then standard text RAG on transcripts
- **Video**: Extract keyframes + transcripts, embed both
- **Tables**: Convert to markdown or structured text before embedding

#### Cache-Augmented Generation

When the corpus is small enough (< ~500 pages / 400K tokens), skip the
retrieval pipeline entirely. Pre-load the full corpus into the model's
context window using Gemini 1M+ context or similar.

```
Full corpus → System prompt / context cache → Query → Generate
```

Advantages: No chunking, no embeddings, no retrieval — the model has everything.
Disadvantages: High cost per query, doesn't scale beyond context limits.

---

## 9 — Troubleshooting & Improvement

### Failure Mode Diagnosis

When your RAG pipeline isn't working, identify WHICH stage is failing before
fixing anything. Don't tune embeddings when the problem is chunking.

| Symptom | Likely Failing Stage | Diagnosis | Fix |
|---------|---------------------|-----------|-----|
| **Returns irrelevant chunks** | Chunking or Embedding | Inspect top-5 chunks manually — are they topically wrong? | If chunks are incoherent: fix chunking. If chunks are coherent but wrong topic: try a different embedding model or add hybrid search |
| **Returns relevant chunks but wrong answer** | Generation or Context Assembly | Check if the answer contradicts the chunks | Fix system prompt — tell the model to ONLY answer from context. Add "If the context doesn't contain the answer, say so." |
| **Confident hallucination** | Retrieval + Generation | Model generates plausible but unsupported claims | Add reranking, add CRAG-style relevance evaluation, add faithfulness check |
| **Missing obvious answers** | Retrieval | The correct chunk exists but isn't in top-K | Lower similarity threshold, increase top-K, add hybrid search, try HyDE query transformation |
| **Works for short queries, fails for long ones** | Query Transformation | Long queries embed poorly — too many concepts in one vector | Add query decomposition — split into sub-queries, retrieve for each |
| **Works for specific terms, fails for concepts** | Embedding or Search | Keyword dependence | Add semantic search if keyword-only. If already semantic, your embedding model may be too weak — upgrade |
| **Chunks from wrong section of a document** | Chunking | Chunks are splitting mid-concept or losing context | Switch to semantic/structural chunking, add metadata, try Contextual RAG |
| **Too slow** | Any stage | Profile each stage independently | Usually: embedding is fine, retrieval is fine, reranking is the bottleneck. Reduce rerank candidates or use a faster reranker |
| **Too expensive** | Embedding or Reranking | Calculate cost per query | Use smaller embedding model (3-small vs 3-large), cache embeddings, reduce rerank candidates, batch queries |
| **Works in testing, fails in production** | Data drift | New data types or topics not in original corpus | Set up automated re-indexing, monitor retrieval scores over time, add freshness signals |

### The "Lost in the Middle" Problem

Models pay more attention to the beginning and end of context windows.
Chunks in the middle get less attention.

**Fix**: Order retrieved chunks by relevance — most relevant FIRST and LAST,
least relevant in the middle. Or: reduce the number of chunks so there's no
"middle" to get lost in.

### Improving Retrieval Quality — Checklist

Run through this when results aren't good enough:

1. **Inspect chunks manually** — read 20 random chunks. Are they coherent?
   Do they make sense standalone? If not, fix chunking first.
2. **Test with known-answer queries** — ask questions where you know which
   chunk contains the answer. Is that chunk in the top-5? If not, the
   retrieval is broken.
3. **Add hybrid search** — if you're vector-only, add BM25. If you're
   keyword-only, add semantic. This is the single highest-impact improvement.
4. **Add reranking** — retrieve top-20, rerank with a cross-encoder, take
   top-5. This consistently improves precision by 15-30%.
5. **Try query transformation** — HyDE for vague queries, multi-query for
   broad ones, decomposition for complex ones.
6. **Add metadata filters** — let users filter by date, source, category
   before retrieval. Reduces noise dramatically.
7. **Contextual chunking** — prepend document context to each chunk before
   embedding (Anthropic's contextual retrieval pattern).
8. **Tune similarity threshold** — too high = misses good matches, too low
   = includes noise. Plot a distribution of similarity scores and find
   the natural breakpoint.
9. **Upgrade embedding model** — if you're on text-embedding-3-small, try
   3-large. If you're on an older model, upgrade. Embedding quality is
   the foundation.
10. **Consider GraphRAG** — if your domain has entity relationships that
    flat retrieval can't capture, add a knowledge graph layer via graphify.

### Improving Generation Quality — Checklist

When retrieval is good but answers are still bad:

1. **Constrain the model** — "Answer ONLY from the provided context. If the
   context doesn't contain the answer, say 'I don't have enough information
   to answer this.'"
2. **Add source citations** — "For each claim in your answer, cite the
   specific chunk number that supports it."
3. **Reduce context volume** — fewer, higher-quality chunks > many
   low-quality chunks. The model drowns in noise.
4. **Order by relevance** — most relevant chunks first and last (lost in
   the middle fix).
5. **Separate context from instructions** — don't mix retrieved chunks with
   system prompt instructions. Use clear delimiters.
6. **Add a faithfulness check** — after generation, use a second LLM call
   to verify each claim against the context. Flag unsupported claims.

### Scaling Considerations

| Scale | Recommendation |
|-------|---------------|
| < 1K documents | ChromaDB or pgvector, no reranker needed |
| 1K–100K documents | pgvector or Pinecone, add reranking, hybrid search |
| 100K–1M documents | Pinecone or Qdrant, HNSW index, reranking required |
| > 1M documents | Qdrant or Weaviate cluster, IVF-PQ index, tiered retrieval |

### Cost Optimization

| Lever | Impact | Trade-off |
|-------|--------|-----------|
| Smaller embedding model | 3-5x cheaper per embed | Slightly lower retrieval quality |
| Matryoshka dimension reduction | 2-4x less storage | Marginal quality loss |
| Embedding cache | Eliminate re-embedding | Stale embeddings if source changes |
| Fewer rerank candidates | Faster, cheaper | May miss relevant chunks |
| Local reranker (BGE) | No API cost | Slightly lower quality vs Cohere |
| Batch embedding | Lower per-unit cost | Higher latency for real-time |

---

## 10 — Evaluation

### The RAG Triad (from Anthropic/TruLens)

| Metric | What It Measures | How to Score |
|--------|-----------------|-------------|
| **Faithfulness** | Is the answer supported by the retrieved context? | LLM-as-judge: does each claim trace to a chunk? |
| **Relevance** | Are the retrieved chunks relevant to the query? | LLM-as-judge: rate each chunk 1–5 for query relevance |
| **Answer Relevance** | Does the answer actually address the question? | LLM-as-judge: does the response answer what was asked? |

### Additional Metrics

| Metric | What It Measures |
|--------|-----------------|
| Context recall | Did we retrieve the chunks that contain the answer? |
| Context precision | Of the chunks retrieved, how many were useful? |
| Chunk utilization | How many retrieved chunks were actually used in generation? |
| Latency (P50, P95) | End-to-end time from query to response |
| Cost per query | Embedding + retrieval + reranking + generation cost |
| Refusal accuracy | Does the model correctly refuse unanswerable questions? |

### Evaluation Pipeline

1. Build a test set: 50–100 question-answer pairs with known source documents
2. Include 10–20 **unanswerable questions** (answers NOT in the corpus)
3. Run the RAG pipeline on each question
4. Score faithfulness, relevance, answer relevance
5. Score refusal accuracy on unanswerable questions
6. Identify failure patterns (wrong chunks, hallucination, missing context)
7. Fix the weakest stage (chunking, retrieval, reranking, or prompt)
8. Re-evaluate — iterate until targets are met

### Target Scores

| Metric | Minimum | Good | Excellent |
|--------|---------|------|-----------|
| Faithfulness | 0.7 | 0.85 | 0.95+ |
| Context relevance | 0.6 | 0.75 | 0.9+ |
| Answer relevance | 0.7 | 0.85 | 0.95+ |
| Refusal accuracy | 0.8 | 0.9 | 0.95+ |
| Latency P95 | < 5s | < 2s | < 1s |

---

## 11 — STOP Gate

DO NOT ship a RAG pipeline without verifying:

- [ ] **Chunking validated** — inspect 20 random chunks, all semantically coherent
- [ ] **Metadata attached** — every chunk has source, position, timestamp
- [ ] **Embedding model locked** — one model per index, dimensions consistent
- [ ] **Hybrid search configured** — not relying on semantic alone
- [ ] **Similarity threshold tuned** — tested on real queries, not defaults
- [ ] **Reranking enabled** — retrieve more, rerank, take top-K
- [ ] **Evaluation run** — faithfulness ≥ 0.8, relevance ≥ 0.7 on test set
- [ ] **Hallucination tested** — unanswerable questions result in refusal, not fabrication
- [ ] **Lost-in-the-middle addressed** — chunk ordering strategy implemented
- [ ] **Latency measured** — P95 under acceptable threshold
- [ ] **Cost per query calculated** — sustainable at expected volume
- [ ] **Freshness strategy** — documented plan for re-indexing new/updated documents
- [ ] **Monitoring in place** — retrieval scores tracked over time, alerting on degradation

