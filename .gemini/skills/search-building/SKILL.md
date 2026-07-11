---
name: search-building
description: >
  Implements search functionality including full-text search, vector/semantic
  search, fuzzy matching, autocomplete, and multi-source search protocols.
  Covers Elasticsearch, Typesense, Meilisearch, Algolia, pgvector, and
  browser-side search with Fuse.js. Use when adding search to an app,
  choosing a search engine, implementing autocomplete, building semantic
  search with embeddings, or when user mentions search, find, or query.
---

# Search Building

Build search features that find what users actually want. Covers full-text,
vector/semantic, fuzzy matching, and autocomplete patterns.

---

## ⛔ STOP — What Kind of Search?

| Type | When | Tools |
|------|------|-------|
| **Full-text** | Searching documents, articles, products | Typesense, Meilisearch, Elasticsearch |
| **Vector/Semantic** | "Find similar", AI-powered search | pgvector, Pinecone, Weaviate |
| **Fuzzy** | Typo-tolerant, "did you mean" | Fuse.js, Typesense, Meilisearch |
| **Autocomplete** | Search-as-you-type | Typesense, Algolia, custom |
| **Multi-source** | Aggregating from multiple APIs | Custom orchestration |
| **Client-side** | Small datasets, no server | Fuse.js, MiniSearch |

---

## Search Engine Decision Tree

```
How much data?
│
├── Small (< 10K items, client-side OK)?
│   └── Fuse.js or MiniSearch
│       ├── No server needed
│       ├── Works offline
│       └── Good for: settings, nav, small catalogs
│
├── Medium (10K - 1M items)?
│   ├── Self-hosted, free → Meilisearch or Typesense
│   ├── Managed, free tier → Typesense Cloud
│   └── Managed, premium → Algolia
│
├── Large (1M+ items)?
│   ├── Self-hosted → Elasticsearch or OpenSearch
│   └── Managed → Elastic Cloud or Algolia
│
└── Semantic / AI search needed?
    ├── PostgreSQL already? → pgvector extension
    ├── Dedicated vector DB → Pinecone or Weaviate
    └── Hybrid (text + vector) → Elasticsearch with vectors
```

---

## Pattern 1: Client-Side Search (Fuse.js)

Best for small datasets (< 10K items) where no server is needed.

```typescript
import Fuse from 'fuse.js';

const fuse = new Fuse(items, {
  keys: ['name', 'description', 'tags'],
  threshold: 0.3,        // 0 = exact, 1 = match anything
  includeScore: true,
  minMatchCharLength: 2,
});

const results = fuse.search(query);
// returns [{ item: {...}, score: 0.1 }, ...]
```

**Install:** `npm install fuse.js`

---

## Pattern 2: Typesense (Recommended for Most Apps)

Fast, typo-tolerant, easy to set up. Free self-hosted, affordable cloud.

```typescript
import Typesense from 'typesense';

const client = new Typesense.Client({
  nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
  apiKey: 'xyz',
});

// Create collection (schema)
await client.collections().create({
  name: 'products',
  fields: [
    { name: 'name', type: 'string' },
    { name: 'description', type: 'string' },
    { name: 'price', type: 'float', facet: true },
    { name: 'category', type: 'string', facet: true },
  ],
  default_sorting_field: 'price',
});

// Index documents
await client.collections('products').documents().import(products);

// Search
const results = await client.collections('products').documents().search({
  q: 'wireless headphones',
  query_by: 'name,description',
  filter_by: 'price:<100 && category:electronics',
  sort_by: 'price:asc',
});
```

**Docker:** `docker run -p 8108:8108 typesense/typesense:latest --data-dir=/data --api-key=xyz`

---

## Pattern 3: PostgreSQL Full-Text Search

No extra service needed if you already use PostgreSQL.

```sql
-- Add search column
ALTER TABLE products ADD COLUMN search_vector tsvector;

-- Populate search vector
UPDATE products SET search_vector =
  to_tsvector('english', name || ' ' || description);

-- Create index
CREATE INDEX idx_search ON products USING gin(search_vector);

-- Search
SELECT * FROM products
WHERE search_vector @@ plainto_tsquery('english', 'wireless headphone')
ORDER BY ts_rank(search_vector, plainto_tsquery('english', 'wireless headphone')) DESC;
```

---

## Pattern 4: Vector / Semantic Search (pgvector)

Find semantically similar content using embeddings.

```sql
-- Enable extension
CREATE EXTENSION vector;

-- Add embedding column
ALTER TABLE articles ADD COLUMN embedding vector(1536);

-- Create index
CREATE INDEX ON articles USING ivfflat (embedding vector_cosine_ops);

-- Find similar
SELECT *, embedding <=> '[0.1, 0.2, ...]' AS distance
FROM articles
ORDER BY distance
LIMIT 10;
```

```typescript
// Generate embeddings with OpenAI
const response = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: 'search query here',
});
const queryEmbedding = response.data[0].embedding;

// Search with Prisma
const results = await prisma.$queryRaw`
  SELECT *, embedding <=> ${queryEmbedding}::vector AS distance
  FROM articles
  ORDER BY distance
  LIMIT 10
`;
```

---

## Pattern 5: Autocomplete / Search-as-You-Type

```typescript
// Debounced search input
function useSearch(delay = 300) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.length < 2) return;

    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      setResults(await res.json());
    }, delay);

    return () => clearTimeout(timeout);
  }, [query, delay]);

  return { query, setQuery, results };
}
```

Key rules:
- Debounce 200-300ms to avoid excess requests
- Minimum 2 characters before searching
- Show loading indicator during search
- Highlight matching text in results
- Support keyboard navigation (arrow keys, Enter)

---

## Multi-Source Search Protocol

When searching across multiple APIs or databases:

1. **Decompose** the query into 3-5 targeted sub-queries
2. **Run parallel** searches across all sources simultaneously
3. **Cross-reference** results — 3+ sources agreeing = high confidence
4. **Synthesize** into ranked results with source attribution
5. **Rank sources** by reliability tier (official docs > community > social)

---

## ⛔ STOP GATE

DO NOT ship search without:
1. Testing with typos (does fuzzy matching work?)
2. Testing with empty query (does it handle gracefully?)
3. Testing with no results (is there a helpful empty state?)
4. Performance tested with realistic data volume
5. Debounce implemented on search input (no request spam)
