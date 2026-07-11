# Wave 003: AI Verticals & Chronological Feed Integration Dispatch

## Goal
Integrate the 5 AI Verticals into the post generator modal, synchronize feed ingestion categories, implement deterministic time-decay metrics and absolute dates, and unify sidebar dots style.

## Lanes
1. **Lane 1: AI Verticals Curation (Agent 1)**
   - Target: `app/app.js` (`SEGMENT_TOPICS`)
   - Goal: Add 10 curated topics for each of the 5 AI Verticals.
2. **Lane 2: Generator Tab Integration (Agent 2)**
   - Target: `app/app.js` (`ghBuildTopicCats()`, `fetchTrendingTopics()`)
   - Goal: Register AI Verticals tabs in generator modal and expand trending RSS ingestion.
3. **Lane 3: Chronological Feed Engine (Agent 3)**
   - Target: `app/src/trending.js`
   - Goal: Implement stable URL-hash metrics, time-decay score formulas, and inline absolute+relative date formats.
4. **Lane 4: Styling & Layout Refactor (Agent 4)**
   - Target: `app/styles.css`
   - Goal: Standardize sidebar dots to monochromatic active styles and ensure generator tabs wrap beautifully.
