---
name: data-analytics
description: SQL analytics patterns. Window functions, CTEs, aggregations, performance optimization.
owner: Frank
last_updated: 2026-03
---

# Data Analytics

Write better SQL for analytics and reporting.

> **See also:** `agents/database/SKILL.md` for ORM and Prisma patterns

---

## Context Questions

Before building analytics queries:

1. **What's the data source?** — PostgreSQL, MySQL, BigQuery, Snowflake
2. **What's the query complexity?** — Simple aggregations vs multi-step analysis
3. **What's the data volume?** — Thousands vs millions of rows
4. **Who consumes the data?** — Dashboards, APIs, reports, ad-hoc analysis
5. **What's the performance requirement?** — Real-time vs batch

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Complexity** | Simple COUNT ←→ Window functions + CTEs |
| **Performance** | Exploratory (slow OK) ←→ Production (fast required) |
| **Aggregation** | Row-level ←→ Rollups + cubes |
| **Tooling** | Raw SQL ←→ BI tools (Metabase, Looker) |
| **Output** | One-off query ←→ Materialized views |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| User dashboards | Materialized views + indexes |
| Ad-hoc exploration | CTEs for readability |
| Time-series analysis | Window functions (LAG, LEAD) |
| Large datasets | Pagination, EXPLAIN ANALYZE |
| Multiple groupings | GROUPING SETS or ROLLUP |
| APIs consuming SQL | Prepared statements + caching |

---

## TL;DR

| Concept | Use Case |
|---------|----------|
| **Window Functions** | Rankings, running totals, comparisons |
| **CTEs** | Complex queries, readability |
| **Aggregations** | Summaries, reports |
| **Indexes** | Query performance |
| **EXPLAIN** | Debug slow queries |

---


## Part 1: Window Functions

### Ranking

```sql
-- Rank users by total spend
SELECT 
  user_id,
  total_spent,
  RANK() OVER (ORDER BY total_spent DESC) as spend_rank,
  DENSE_RANK() OVER (ORDER BY total_spent DESC) as dense_rank,
  ROW_NUMBER() OVER (ORDER BY total_spent DESC) as row_num
FROM user_stats;

-- Rank within categories
SELECT 
  product_id,
  category,
  revenue,
  RANK() OVER (PARTITION BY category ORDER BY revenue DESC) as category_rank
FROM products
WHERE category_rank <= 10;  -- Top 10 per category
```

### Running Totals

```sql
-- Cumulative revenue by day
SELECT 
  date,
  daily_revenue,
  SUM(daily_revenue) OVER (ORDER BY date) as cumulative_revenue,
  AVG(daily_revenue) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as rolling_7day_avg
FROM daily_sales;
```

### Comparisons

```sql
-- Compare to previous period
SELECT 
  month,
  revenue,
  LAG(revenue, 1) OVER (ORDER BY month) as prev_month,
  revenue - LAG(revenue, 1) OVER (ORDER BY month) as month_over_month,
  LEAD(revenue, 1) OVER (ORDER BY month) as next_month,
  FIRST_VALUE(revenue) OVER (ORDER BY month) as first_month_revenue,
  revenue / FIRST_VALUE(revenue) OVER (ORDER BY month) as growth_from_start
FROM monthly_revenue;
```

### Percentiles

```sql
-- User spend percentiles
SELECT 
  user_id,
  total_spent,
  NTILE(4) OVER (ORDER BY total_spent) as quartile,
  PERCENT_RANK() OVER (ORDER BY total_spent) as percentile
FROM users;

-- Median (50th percentile)
SELECT 
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_spent) as median_spend
FROM users;
```

---

## Part 2: CTEs (Common Table Expressions)

### Basic CTE

```sql
WITH active_users AS (
  SELECT user_id, email
  FROM users
  WHERE last_active > NOW() - INTERVAL '30 days'
),
user_orders AS (
  SELECT user_id, COUNT(*) as order_count, SUM(total) as total_spent
  FROM orders
  WHERE user_id IN (SELECT user_id FROM active_users)
  GROUP BY user_id
)
SELECT 
  au.email,
  COALESCE(uo.order_count, 0) as orders,
  COALESCE(uo.total_spent, 0) as spent
FROM active_users au
LEFT JOIN user_orders uo ON au.user_id = uo.user_id
ORDER BY spent DESC;
```

### Recursive CTE

```sql
-- Hierarchical data (org chart, categories)
WITH RECURSIVE org_tree AS (
  -- Base case: top-level managers
  SELECT id, name, manager_id, 1 as level
  FROM employees
  WHERE manager_id IS NULL
  
  UNION ALL
  
  -- Recursive case: employees with managers
  SELECT e.id, e.name, e.manager_id, ot.level + 1
  FROM employees e
  INNER JOIN org_tree ot ON e.manager_id = ot.id
)
SELECT * FROM org_tree ORDER BY level, name;
```

### Multiple CTEs

```sql
WITH 
-- Step 1: Get base metrics
daily_metrics AS (
  SELECT 
    DATE(created_at) as date,
    COUNT(*) as signups,
    COUNT(CASE WHEN source = 'organic' THEN 1 END) as organic
  FROM users
  GROUP BY DATE(created_at)
),
-- Step 2: Add rolling averages
with_rolling AS (
  SELECT 
    date,
    signups,
    organic,
    AVG(signups) OVER (ORDER BY date ROWS 6 PRECEDING) as avg_7d
  FROM daily_metrics
),
-- Step 3: Calculate week-over-week
with_wow AS (
  SELECT 
    *,
    LAG(signups, 7) OVER (ORDER BY date) as prev_week,
    signups - LAG(signups, 7) OVER (ORDER BY date) as wow_change
  FROM with_rolling
)
SELECT * FROM with_wow WHERE date >= CURRENT_DATE - 30;
```

---

## Part 3: Aggregations

### Group By Patterns

```sql
-- Multiple aggregations
SELECT 
  category,
  COUNT(*) as total_products,
  COUNT(DISTINCT vendor_id) as unique_vendors,
  AVG(price) as avg_price,
  MIN(price) as min_price,
  MAX(price) as max_price,
  SUM(stock_quantity) as total_stock
FROM products
GROUP BY category
HAVING COUNT(*) > 10;
```

### Conditional Aggregation

```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'refunded' THEN 1 END) as refunded,
  SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END) as revenue,
  AVG(CASE WHEN status = 'completed' THEN total END) as avg_order_value
FROM orders
GROUP BY DATE(created_at);
```

### GROUPING SETS

```sql
-- Multiple grouping levels in one query
SELECT 
  COALESCE(category, 'ALL') as category,
  COALESCE(region, 'ALL') as region,
  SUM(revenue) as total_revenue
FROM sales
GROUP BY GROUPING SETS (
  (category, region),  -- By category and region
  (category),          -- By category only
  (region),            -- By region only
  ()                   -- Grand total
)
ORDER BY category NULLS FIRST, region NULLS FIRST;
```

---

## Part 4: Performance Optimization

### EXPLAIN ANALYZE

```sql
-- See query execution plan
EXPLAIN ANALYZE
SELECT * FROM orders
WHERE user_id = 123
  AND created_at > '2024-01-01';

-- Look for:
-- - Seq Scan (bad for large tables)
-- - Index Scan (good)
-- - Actual time vs estimated
```

### Index Strategies

```sql
-- Single column index
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Composite index (order matters!)
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);

-- Partial index (smaller, faster)
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';

-- Covering index (includes all needed columns)
CREATE INDEX idx_orders_covering ON orders(user_id, created_at) 
  INCLUDE (total, status);
```

### Query Optimization Tips

| Problem | Solution |
|---------|----------|
| `SELECT *` | Select only needed columns |
| No index on WHERE | Add appropriate index |
| `LIKE '%term%'` | Use full-text search |
| Large IN clause | Use JOIN or temp table |
| N+1 queries | Use JOINs or batch |
| Sorting large results | Add index on ORDER BY columns |

### Pagination

```sql
-- Offset pagination (slow for large offsets)
SELECT * FROM products
ORDER BY id
LIMIT 20 OFFSET 1000;

-- Cursor pagination (fast)
SELECT * FROM products
WHERE id > :last_id
ORDER BY id
LIMIT 20;
```

---

## Part 5: SQL vs Application Logic

| Use SQL | Use Application |
|---------|-----------------|
| Aggregations (SUM, AVG, COUNT) | Complex business rules |
| Filtering large datasets | Multi-step transformations |
| Joins across tables | External API calls |
| Sorting and pagination | Real-time calculations |
| Simple calculations | Formatting for display |

### Hybrid Example

```sql
-- Do heavy lifting in SQL
WITH user_metrics AS (
  SELECT 
    user_id,
    COUNT(*) as order_count,
    SUM(total) as total_spent,
    MAX(created_at) as last_order
  FROM orders
  WHERE created_at > NOW() - INTERVAL '1 year'
  GROUP BY user_id
)
SELECT * FROM user_metrics WHERE total_spent > 1000;
```

```typescript
// Do business logic in app
const users = await db.execute(sql);

const enrichedUsers = users.map(user => ({
  ...user,
  tier: calculateTier(user.total_spent),
  nextReward: getNextRewardThreshold(user.total_spent),
  displayDate: formatDate(user.last_order)
}));
```

---

## Part 6: Common Analytics Queries

### Cohort Analysis

```sql
WITH user_cohorts AS (
  SELECT 
    user_id,
    DATE_TRUNC('month', created_at) as cohort_month
  FROM users
),
user_activity AS (
  SELECT 
    user_id,
    DATE_TRUNC('month', created_at) as activity_month
  FROM orders
)
SELECT 
  uc.cohort_month,
  ua.activity_month,
  COUNT(DISTINCT ua.user_id) as active_users
FROM user_cohorts uc
JOIN user_activity ua ON uc.user_id = ua.user_id
GROUP BY uc.cohort_month, ua.activity_month
ORDER BY uc.cohort_month, ua.activity_month;
```

### Funnel Analysis

```sql
WITH funnel AS (
  SELECT 
    user_id,
    MAX(CASE WHEN event = 'page_view' THEN 1 ELSE 0 END) as viewed,
    MAX(CASE WHEN event = 'add_to_cart' THEN 1 ELSE 0 END) as added,
    MAX(CASE WHEN event = 'checkout' THEN 1 ELSE 0 END) as checked_out,
    MAX(CASE WHEN event = 'purchase' THEN 1 ELSE 0 END) as purchased
  FROM events
  WHERE created_at > NOW() - INTERVAL '7 days'
  GROUP BY user_id
)
SELECT 
  SUM(viewed) as step1_viewed,
  SUM(added) as step2_added,
  SUM(checked_out) as step3_checkout,
  SUM(purchased) as step4_purchased,
  ROUND(100.0 * SUM(purchased) / NULLIF(SUM(viewed), 0), 2) as conversion_rate
FROM funnel;
```

### Retention

```sql
WITH first_activity AS (
  SELECT user_id, MIN(DATE(created_at)) as first_date
  FROM events
  GROUP BY user_id
),
daily_activity AS (
  SELECT DISTINCT user_id, DATE(created_at) as activity_date
  FROM events
)
SELECT 
  fa.first_date,
  da.activity_date - fa.first_date as days_since_first,
  COUNT(DISTINCT da.user_id) as retained_users
FROM first_activity fa
JOIN daily_activity da ON fa.user_id = da.user_id
GROUP BY fa.first_date, da.activity_date - fa.first_date
ORDER BY fa.first_date, days_since_first;
```

---

## Checklist

- [ ] Using window functions for rankings/comparisons
- [ ] CTEs for complex query readability
- [ ] Appropriate indexes created
- [ ] EXPLAIN ANALYZE run on slow queries
- [ ] Pagination using cursors (not offset)
- [ ] Heavy computation in SQL, logic in app

---

## Resources

- PostgreSQL Docs: https://www.postgresql.org/docs/
- Use The Index, Luke: https://use-the-index-luke.com/
- Mode Analytics SQL Tutorial: https://mode.com/sql-tutorial/

---

## Related Skills

- `agents/database/SKILL.md` — Prisma and ORM patterns
- `agents/performance/SKILL.md` — General optimization
- `agents/backend-patterns/SKILL.md` — API data patterns
