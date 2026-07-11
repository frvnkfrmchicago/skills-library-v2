---
name: algorithm-librarian
description: Algorithm design guide covering feed ranking, recommendation engines, matching systems, search relevance, scoring formulas, and content distribution. Covers basic weighted scoring through advanced ML-powered systems. Ensures algorithms are fair, performant, and measurable. Works with Supabase (PostgreSQL) and Firebase.
last_updated: 2026-03-23
---

# Algorithm Librarian

You are an algorithm architect. Your job is to ensure every ranking system has clear signals, every recommendation engine has measurable outcomes, every scoring formula is transparent and tunable, and every feed algorithm handles cold-start gracefully. You never ship an algorithm without defining how to measure if it works.

## TL;DR

| Decision | Options | Default Choice |
|----------|---------|----------------|
| Algorithm type | Ranking, Matching, Recommendation, Search | Start with weighted scoring (simplest) |
| Database | PostgreSQL (Supabase), Firebase | PostgreSQL — SQL is better for complex algorithm queries |
| Search method | Full-text, BM25, Vector, Hybrid | Full-text search (built into PostgreSQL) |
| Scoring approach | Static weights, ML model, Hybrid | Static weighted scoring → upgrade to ML when you have data |
| Cold-start strategy | Popular/trending, onboarding quiz | Popular items globally |
| Evaluation | A/B test, offline metrics | Offline first → A/B in production |

---

## 1. Algorithm Types — Decision Tree

```
What does your app need?
|
|-- Users see a feed of content?
|   |-- Feed Ranking Algorithm (Section 2)
|   |-- E.g., social feed, news feed, activity stream
|
|-- Users get suggestions ("you might like...")?
|   |-- Recommendation Engine (Section 3)
|   |-- E.g., product recs, content discovery, "similar to"
|
|-- Two groups need to find each other?
|   |-- Matching Algorithm (Section 4)
|   |-- E.g., marketplace buyer/seller, dating, freelancer/client
|
|-- Users search and expect ranked results?
|   |-- Search Ranking Algorithm (Section 5)
|   |-- E.g., product search, dispensary search, content search
|
|-- Users see scores / leaderboards / ratings?
|   |-- Scoring Algorithm (Section 6)
|   |-- E.g., reputation, karma, creator score, trust score
```

---

## 2. Feed Ranking Algorithm

### How It Works (Threads/Instagram Model)

Every feed algorithm follows the same 3-step pipeline:

```
Step 1: GATHER CANDIDATES
  All eligible content → posts from follows + public posts + trending

Step 2: SCORE EACH CANDIDATE
  For each post, calculate:
    score = (engagement_weight * engagement_score)
          + (recency_weight * recency_score)
          + (relationship_weight * relationship_score)
          + (relevance_weight * relevance_score)

Step 3: RANK AND SERVE
  Sort by score descending → apply diversity rules → return top N
```

### Engagement Signals (Ranked by Weight)

In 2026, platforms weight signals differently. Here's the hierarchy based on research across Threads, Instagram, LinkedIn, and TikTok:

| Signal | Weight | Why |
|--------|--------|-----|
| **DM shares** | Highest | User found it valuable enough to share privately |
| **Saves** | Very high | User wants to return to it — strong utility signal |
| **Reply depth** | Very high | Back-and-forth conversation = genuine engagement |
| **Watch time / completion** | High | Stayed to consume the whole thing |
| **Comments** | Medium-high | Depends on depth — "nice" vs. real discussion |
| **Likes** | Medium | Easy action, low commitment |
| **Profile visits** | Medium | Curiosity signal |
| **Impressions** | Low | Just seeing it doesn't mean anything |

### Basic Implementation (PostgreSQL / Supabase)

```typescript
// feed-algorithm.ts — Basic weighted scoring
interface FeedItem {
  id: string;
  created_at: Date;
  author_id: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reply_depth: number;
}

interface ScoredItem extends FeedItem {
  score: number;
}

// TUNABLE WEIGHTS — adjust these based on what your app values
const WEIGHTS = {
  shares: 5.0,      // DM shares = highest signal
  saves: 4.0,       // Bookmarks = strong interest
  reply_depth: 3.5,  // Conversations = genuine engagement
  comments: 2.0,     // Surface engagement
  likes: 1.0,        // Baseline interaction
  recency: 3.0,      // How fresh the content is
  relationship: 2.5,  // How connected the viewer is to the author
};

function calculateRecencyScore(createdAt: Date): number {
  const hoursAgo = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  // Exponential decay: score drops by half every 24 hours
  return Math.exp(-0.029 * hoursAgo); // ln(2)/24 = 0.029
}

function calculateEngagementScore(item: FeedItem): number {
  return (
    WEIGHTS.shares * item.shares +
    WEIGHTS.saves * item.saves +
    WEIGHTS.reply_depth * item.reply_depth +
    WEIGHTS.comments * item.comments +
    WEIGHTS.likes * item.likes
  );
}

function calculateRelationshipScore(
  viewerId: string,
  authorId: string,
  interactions: Map<string, number>
): number {
  // How many times has this viewer interacted with this author?
  const count = interactions.get(authorId) || 0;
  // Logarithmic scale so it doesn't grow infinitely
  return Math.log2(count + 1);
}

function rankFeed(
  items: FeedItem[],
  viewerId: string,
  interactions: Map<string, number>
): ScoredItem[] {
  return items
    .map(item => ({
      ...item,
      score:
        WEIGHTS.recency * calculateRecencyScore(item.created_at) +
        calculateEngagementScore(item) +
        WEIGHTS.relationship * calculateRelationshipScore(
          viewerId, item.author_id, interactions
        ),
    }))
    .sort((a, b) => b.score - a.score);
}
```

### SQL-Based Feed Query (Supabase/PostgreSQL)

```sql
-- Feed ranking query with weighted scoring
-- Run this in Supabase SQL editor or as an RPC function

CREATE OR REPLACE FUNCTION get_ranked_feed(
  viewer_id UUID,
  page_size INT DEFAULT 20,
  page_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  author_id UUID,
  author_name TEXT,
  score FLOAT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.content,
    p.author_id,
    u.name AS author_name,
    (
      -- Engagement score (weighted)
      COALESCE(e.shares, 0) * 5.0 +
      COALESCE(e.saves, 0) * 4.0 +
      COALESCE(e.reply_depth, 0) * 3.5 +
      COALESCE(e.comments, 0) * 2.0 +
      COALESCE(e.likes, 0) * 1.0 +
      -- Recency score (exponential decay, half-life = 24h)
      EXP(-0.029 * EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600) * 3.0 +
      -- Relationship score (log of past interactions)
      LOG(2, COALESCE(r.interaction_count, 0) + 1) * 2.5
    ) AS score,
    p.created_at
  FROM posts p
  JOIN users u ON u.id = p.author_id
  LEFT JOIN post_engagement e ON e.post_id = p.id
  LEFT JOIN user_interactions r ON r.viewer_id = viewer_id AND r.author_id = p.author_id
  WHERE p.created_at > NOW() - INTERVAL '7 days'
  ORDER BY score DESC
  LIMIT page_size
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;
```

### Advanced: Multi-Pass Ranking (How Threads Actually Works)

```
Pass 0: CANDIDATE GENERATION (fast, lightweight)
  └─ Pull ~10,000 candidates from follows + trending + topic matches
  └─ Lightweight model filters to ~500

Pass 1: MAIN RANKING (deeper scoring)
  └─ Score each of the 500 with full engagement + relationship signals
  └─ Sort to top ~50

Pass 2: CONTEXTUAL RE-RANKING (rules and constraints)
  └─ Enforce diversity (no 3 posts from same author in a row)
  └─ Boost recency in first 5 positions
  └─ Remove near-duplicate content
  └─ Apply content integrity rules
  └─ Return final 20 items
```

---

## 3. Recommendation Engine

### Types of Recommendations

| Type | How It Works | Best For | Complexity |
|------|-------------|----------|------------|
| **Popular / Trending** | Sort by recent engagement | Cold start, new users | Basic |
| **Content-based** | "Similar items to what you liked" | Products, articles | Intermediate |
| **Collaborative filtering** | "Users like you also liked..." | Social, media | Intermediate |
| **Hybrid** | Combine content + collaborative | Production systems | Advanced |
| **ML/Vector-based** | Embeddings + similarity search | AI-powered discovery | Advanced |

### Basic: Trending / Popular

```typescript
// Simplest recommendation — most popular in last 7 days
async function getTrending(supabase: SupabaseClient, limit = 10) {
  const { data } = await supabase
    .from('posts')
    .select('*, post_engagement(*)')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('post_engagement(likes)', { ascending: false })
    .limit(limit);
  return data;
}
```

### Intermediate: Content-Based Filtering

```typescript
// Recommend items similar to what the user has interacted with
// Uses tag/category overlap as the similarity measure

interface Item {
  id: string;
  tags: string[];
  category: string;
}

function jaccardSimilarity(setA: string[], setB: string[]): number {
  const intersection = setA.filter(x => setB.includes(x));
  const union = new Set([...setA, ...setB]);
  return union.size > 0 ? intersection.length / union.size : 0;
}

function getContentRecommendations(
  userLikedItems: Item[],
  allItems: Item[],
  limit = 10
): Item[] {
  // Build a "user profile" from all tags they've interacted with
  const userTags = [...new Set(userLikedItems.flatMap(i => i.tags))];

  return allItems
    .filter(item => !userLikedItems.some(liked => liked.id === item.id))
    .map(item => ({
      ...item,
      similarity: jaccardSimilarity(userTags, item.tags),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}
```

### Intermediate: Collaborative Filtering

```sql
-- "Users who liked X also liked Y" — in pure SQL
-- Find items liked by users who share tastes with the current user

CREATE OR REPLACE FUNCTION get_collaborative_recs(
  current_user_id UUID,
  rec_limit INT DEFAULT 10
)
RETURNS TABLE (item_id UUID, shared_taste_score BIGINT) AS $$
BEGIN
  RETURN QUERY
  WITH user_items AS (
    -- Items the current user has liked
    SELECT item_id FROM user_likes WHERE user_id = current_user_id
  ),
  similar_users AS (
    -- Find users who liked the same items
    SELECT ul.user_id, COUNT(*) AS overlap_count
    FROM user_likes ul
    JOIN user_items ui ON ul.item_id = ui.item_id
    WHERE ul.user_id != current_user_id
    GROUP BY ul.user_id
    ORDER BY overlap_count DESC
    LIMIT 50  -- Top 50 most similar users
  ),
  candidate_items AS (
    -- Items those similar users liked that current user hasn't seen
    SELECT ul.item_id, SUM(su.overlap_count) AS shared_taste_score
    FROM user_likes ul
    JOIN similar_users su ON ul.user_id = su.user_id
    WHERE ul.item_id NOT IN (SELECT item_id FROM user_items)
    GROUP BY ul.item_id
  )
  SELECT ci.item_id, ci.shared_taste_score
  FROM candidate_items ci
  ORDER BY ci.shared_taste_score DESC
  LIMIT rec_limit;
END;
$$ LANGUAGE plpgsql;
```

### Advanced: Vector-Based (pgvector + Supabase)

```sql
-- Store embeddings in Supabase with pgvector
-- Then find similar items by vector distance

-- Enable the extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to items
ALTER TABLE items ADD COLUMN embedding vector(384);

-- Find similar items to a given item
SELECT id, title,
  1 - (embedding <=> (SELECT embedding FROM items WHERE id = 'target_item_id')) AS similarity
FROM items
WHERE id != 'target_item_id'
ORDER BY embedding <=> (SELECT embedding FROM items WHERE id = 'target_item_id')
LIMIT 10;
```

---

## 4. Matching Algorithm

### When to Use

Two-sided platforms: marketplace (buyer/seller), service apps (provider/customer), social (user/user), hiring (employer/candidate).

### Basic: Weighted Score Match

```typescript
// Matching algorithm for a marketplace
interface Buyer {
  id: string;
  location: { lat: number; lng: number };
  priceRange: { min: number; max: number };
  preferredTags: string[];
}

interface Seller {
  id: string;
  location: { lat: number; lng: number };
  price: number;
  tags: string[];
  rating: number;
  responseTime: number; // minutes
}

function calculateMatchScore(buyer: Buyer, seller: Seller): number {
  // Distance score (closer = higher, max 10)
  const distance = haversineDistance(buyer.location, seller.location);
  const distanceScore = Math.max(0, 10 - distance / 5); // 0 at 50+ miles

  // Price fit score (in range = 10, out = 0)
  const priceScore =
    seller.price >= buyer.priceRange.min &&
    seller.price <= buyer.priceRange.max
      ? 10
      : 0;

  // Tag overlap score (Jaccard similarity * 10)
  const tagOverlap = jaccardSimilarity(buyer.preferredTags, seller.tags);
  const tagScore = tagOverlap * 10;

  // Quality score (rating + response speed)
  const qualityScore = seller.rating * 1.5 + Math.max(0, 10 - seller.responseTime / 6);

  // Weighted combination
  return (
    distanceScore * 3.0 +
    priceScore * 2.5 +
    tagScore * 2.0 +
    qualityScore * 1.5
  );
}

function findBestMatches(buyer: Buyer, sellers: Seller[], limit = 10) {
  return sellers
    .map(seller => ({ seller, score: calculateMatchScore(buyer, seller) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
```

### Advanced: Stable Matching (Gale-Shapley)

Used when both sides have preferences (dating, hiring, school assignment). Guarantees no two unmatched people would prefer each other over their current match.

```typescript
// Gale-Shapley stable matching algorithm
function stableMatch(
  proposers: Map<string, string[]>, // proposer -> ranked list of acceptors
  acceptors: Map<string, string[]>  // acceptor -> ranked list of proposers
): Map<string, string> {
  const matches = new Map<string, string>();     // acceptor -> proposer
  const freeProposers = new Set(proposers.keys());
  const proposalIndex = new Map<string, number>(); // which index proposer is at

  proposers.forEach((_, id) => proposalIndex.set(id, 0));

  while (freeProposers.size > 0) {
    const proposer = freeProposers.values().next().value;
    const prefs = proposers.get(proposer)!;
    const idx = proposalIndex.get(proposer)!;

    if (idx >= prefs.length) {
      freeProposers.delete(proposer);
      continue;
    }

    const target = prefs[idx];
    proposalIndex.set(proposer, idx + 1);

    if (!matches.has(target)) {
      matches.set(target, proposer);
      freeProposers.delete(proposer);
    } else {
      const currentMatch = matches.get(target)!;
      const acceptorPrefs = acceptors.get(target)!;

      if (acceptorPrefs.indexOf(proposer) < acceptorPrefs.indexOf(currentMatch)) {
        matches.set(target, proposer);
        freeProposers.delete(proposer);
        freeProposers.add(currentMatch);
      }
    }
  }

  return matches;
}
```

---

## 5. Search Ranking

### PostgreSQL Full-Text Search (Built-in)

```sql
-- Basic full-text search with ranking
SELECT id, title, description,
  ts_rank(
    to_tsvector('english', title || ' ' || description),
    plainto_tsquery('english', 'cannabis dispensary')
  ) AS relevance
FROM businesses
WHERE to_tsvector('english', title || ' ' || description) @@
      plainto_tsquery('english', 'cannabis dispensary')
ORDER BY relevance DESC
LIMIT 20;
```

### BM25 Search (Better Relevance)

```sql
-- If pg_textsearch extension is available
-- BM25 = industry standard for relevance ranking
-- Better than basic TF-IDF because it handles document length

CREATE INDEX idx_items_search ON items USING GIN (to_tsvector('english', title || ' ' || description));

-- Hybrid search: BM25 keyword + vector similarity
SELECT id, title,
  (0.7 * bm25_score + 0.3 * (1 - (embedding <=> query_embedding))) AS hybrid_score
FROM items
ORDER BY hybrid_score DESC;
```

### Fuzzy Search (Typo-Tolerant)

```sql
-- Enable trigram extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Find items even when user misspells
SELECT id, title,
  similarity(title, 'canabis') AS sim_score
FROM products
WHERE similarity(title, 'canabis') > 0.3
ORDER BY sim_score DESC
LIMIT 10;
```

---

## 6. Scoring / Reputation Algorithm

### Weighted Activity Score

```typescript
// User reputation/trust score
interface UserActivity {
  posts_created: number;
  helpful_replies: number;
  upvotes_received: number;
  downvotes_received: number;
  reports_against: number;
  days_active: number;
  verified: boolean;
}

function calculateReputationScore(activity: UserActivity): number {
  const rawScore =
    activity.posts_created * 1.0 +
    activity.helpful_replies * 3.0 +
    activity.upvotes_received * 2.0 -
    activity.downvotes_received * 1.5 -
    activity.reports_against * 10.0;

  // Time decay — newer activity counts more
  const tenureFactor = Math.log2(activity.days_active + 1);

  // Normalize to 0-100 scale
  const normalized = Math.max(0, Math.min(100,
    (rawScore / tenureFactor) * (activity.verified ? 1.2 : 1.0)
  ));

  return Math.round(normalized * 10) / 10;
}
```

---

## 7. Cold Start Strategies

The biggest challenge for any algorithm: what do you show when you have no data?

| Strategy | When to Use | Implementation |
|----------|------------|----------------|
| **Global popular** | Day 1, no user data at all | Sort by total engagement, show to everyone |
| **Trending (time-weighted)** | Some data exists | Popular in last 24h, weighted by recency |
| **Onboarding quiz** | User signs up | Ask 3-5 preference questions, seed their profile |
| **Category defaults** | New user, known category | Show top items in categories they picked |
| **Social graph seeding** | User connects accounts | Use their follows/friends to bootstrap preferences |
| **Explore/random** | All else fails | Random sample from quality-filtered pool |

---

## 8. Measuring Your Algorithm

### Metrics That Matter

| Metric | What It Measures | Formula |
|--------|-----------------|---------|
| **CTR** | Click-through rate | clicks / impressions |
| **Engagement rate** | Meaningful interactions | (likes + comments + shares + saves) / impressions |
| **Dwell time** | Time spent on content | avg seconds per item |
| **Precision@K** | Relevance of top K results | relevant items in top K / K |
| **NDCG** | Ranking quality | normalized discounted cumulative gain |
| **Retention** | Did users come back? | users returning in 7 days / total users |
| **Serendipity** | Unexpected useful results | novel + useful items / total recommended |

### A/B Testing Your Algorithm

```typescript
// Simple A/B test setup for algorithms
function getAlgorithmVariant(userId: string): 'control' | 'experiment' {
  // Deterministic bucketing — same user always gets same variant
  const hash = hashCode(userId);
  return hash % 100 < 50 ? 'control' : 'experiment';
}

// Track which algorithm variant each user sees
async function trackImpression(userId: string, variant: string, itemId: string) {
  await supabase.from('algorithm_experiments').insert({
    user_id: userId,
    variant,
    item_id: itemId,
    event: 'impression',
    created_at: new Date().toISOString(),
  });
}
```

---

## 9. Database Schema Patterns

### Core Tables for Any Algorithm

```sql
-- User interactions table — the foundation of ALL algorithms
CREATE TABLE user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL,        -- 'post', 'product', 'profile'
  action TEXT NOT NULL,           -- 'view', 'like', 'save', 'share', 'comment', 'purchase'
  metadata JSONB DEFAULT '{}',    -- extra context (watch_time, scroll_depth, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_interactions_user ON user_interactions(user_id, created_at DESC);
CREATE INDEX idx_interactions_item ON user_interactions(item_id, action);

-- Aggregated engagement table (materialized for speed)
CREATE MATERIALIZED VIEW item_engagement AS
SELECT
  item_id,
  COUNT(*) FILTER (WHERE action = 'view') AS views,
  COUNT(*) FILTER (WHERE action = 'like') AS likes,
  COUNT(*) FILTER (WHERE action = 'comment') AS comments,
  COUNT(*) FILTER (WHERE action = 'share') AS shares,
  COUNT(*) FILTER (WHERE action = 'save') AS saves,
  COUNT(*) FILTER (WHERE action = 'purchase') AS purchases
FROM user_interactions
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY item_id;

-- Refresh periodically
-- REFRESH MATERIALIZED VIEW CONCURRENTLY item_engagement;
```

---

## Algorithm Complexity Levels

| Level | What You Build | Tools Needed | Time to Implement |
|-------|---------------|--------------|-------------------|
| **Basic** | Sort by recency + likes | SQL ORDER BY | 1 hour |
| **Intermediate** | Weighted scoring with 3-5 signals | SQL function or TypeScript | 1 day |
| **Advanced** | Multi-pass ranking + collaborative filtering | SQL + application code + caching | 1 week |
| **Expert** | ML-powered with embeddings + A/B testing | pgvector + ML pipeline + experiment framework | 1-2 months |

---

## NEVER

- **NEVER** optimize for a single metric (e.g., clicks only) — it leads to clickbait
- **NEVER** ship an algorithm without measuring its impact — always have before/after metrics
- **NEVER** hardcode weights without a plan to tune them — use config, not magic numbers
- **NEVER** ignore cold start — new users bounce if they see nothing relevant
- **NEVER** skip diversity rules — showing 10 posts from the same author kills engagement
- **NEVER** deploy without a kill switch — you need to be able to revert to chronological sorting instantly
- **NEVER** confuse algorithm code with database schema — the algorithm is logic ON TOP of the data

---

## Pre-Completion Checklist

Before shipping any algorithm feature, verify:

- [ ] Signals are defined and weighted with clear rationale
- [ ] Cold start is handled (new users see something useful)
- [ ] Scoring formula is configurable (weights in config, not hardcoded)
- [ ] Diversity constraints exist (no single source domination)
- [ ] Kill switch exists (revert to simple chronological)
- [ ] Metrics are defined (what does "working" mean?)
- [ ] Database indexes exist for all algorithm queries
- [ ] Edge cases handled (empty data, single item, new user)
- [ ] A/B test infrastructure is in place or planned

---

## Related Skills

- [backend-librarian](/librarians/backend-librarian.md) — API design, database selection
- [supabase-librarian](/librarians/supabase-librarian.md) — Supabase-specific patterns, RLS, real-time
- [database-librarian](/librarians/database-librarian.md) — Schema design, query optimization
- [frontend-librarian](/librarians/frontend-librarian.md) — Rendering feeds, infinite scroll, optimistic UI
