---
name: resource-registry
description: >
  Logs all active API keys, keyless endpoints, MCP servers, and custom scripts/CLIs
  available to all Hermes agents. Use this registry to locate search, financial,
  health, prediction, and academic endpoints.
---

# Resource Registry: Keys, Keyless APIs, MCPs, and CLIs

Use this skill to identify pre-configured resources, API keys, Model Context Protocol (MCP) servers, and custom command-line utilities available on the GCE VM and local environment. All agents have access to these APIs and should use them as needed for news, data, and search tasks.

---

## ⚡ Agent Resource Inventory Count

Agents have direct and indexed access to a total of **74 APIs, keys, and developer resources**:
*   **General Search APIs**: 2 (Brave, Tavily)
*   **Social Credentials**: 1 (Threads)
*   **Pre-Configured CLI Utilities**: 2 (`api_tracker.py`, `threads_scrape.py` on the VM)
*   **Keyless VM Data Endpoints**: 9 (Polymarket, Kalshi, FRED, OpenFDA, Bluesky search, HackerNews, Yahoo Finance, SEC EDGAR, arXiv)
*   **Google & Coding APIs**: 8 (Gemini, Custom Search, Maps, Firebase, GitHub, cdnjs, JSONPlaceholder, OpenRouter)
*   **External Curated Directory**: 52 (listed in the `shipfreeapis` skill)

---

## 1. General Search APIs (Available to All Agents)
These keys are pre-loaded in the VM shell environment. All agents can use them for general search, news aggregation, and web queries:

*   **Brave Search API** (`BRAVE_SEARCH_API_KEY`)
    *   **Key**: `BSA5dXUCRVX-CJhyHWq82D7Yo3Ppl3j`
    *   **Purpose**: General web search and news parsing.
*   **Tavily Search API** (`TAVILY_API_KEY`)
    *   **Key**: `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`
    *   **Purpose**: Research and content extraction queries.

---

## 2. Active Social Credentials
*   **Threads API Token** (`THREADS_FRVNK_TOKEN`)
    *   **Token**: `THAANIrUe8ZCs5BYmF0R0FWWEhLMVZA6UjJwaTRqcUtoSFplX0g1ZAUJScTh0OXUybjZAwMTFWNmNSWEVkcmw4LUFPanNYZAV9nZAnhzajU4MmxNeVdLaWFjOXpZAUXUtSU5RMjNlNGJoWjEyTi1DQWN0YVNoQmwxU0N6bWxmYWpSMVVZAWTgtUQZDZD`

---

## 3. Pre-Configured CLI Utilities (VM Scripts)
Run these directly via standard shell commands on the VM:

*   **Unified API Tracker**: `python3 ~/.hermes/api_tracker.py`
    *   **Purpose**: Consolidates queries for prediction markets, macroeconomic indicators, drug safety alerts, social posts, HackerNews, and stock charts.
    *   **Source Options**: `--source [polymarket|kalshi|fred|openfda|bsky|hackernews|yfinance]`
*   **Threads Scraper**: `python3 ~/.hermes/threads_scrape.py`
    *   **Purpose**: Automates feed compilation and post extraction from Threads.

---

## 4. Keyless Public Endpoints (No Keys Required)
The unified tracker script calls these endpoints. If running custom queries, use these base URLs:

*   **Polymarket Gamma API**: `https://gamma-api.polymarket.com/markets`
    *   Use case: Live prediction odds, volume, and contract questions.
*   **Kalshi Public API**: `https://external-api.kalshi.com/trade-api/v2/markets`
    *   Use case: Prediction contracts (binary options).
*   **FRED CSV Fallback** (US Macroeconomic data): `https://fred.stlouisfed.org/graph/fredgraph.csv?id={series_id}`
    *   Use case: Keyless download of CPI (`CPIAUCSL`), Unemployment (`UNRATE`), and Fed Funds (`FEDFUNDS`). Note: Omit the Chrome User-Agent header to prevent Akamai TCP connection drop.
*   **OpenFDA Recalls**: `https://api.fda.gov/drug/enforcement.json`
    *   Use case: U.S. drug enforcement alerts, recalls, and labeling details.
*   **Bluesky public AppView**: `https://api.bsky.app/xrpc/app.bsky.feed.searchPosts`
    *   Use case: Real-time public post extraction (100% keyless for read access). Always filter with `lang=en` to ensure English results.
*   **HackerNews API**: `https://hacker-news.firebaseio.com/v0`
    *   Use case: Tech and startup trends.
*   **Yahoo Finance Charts**: `https://query1.finance.yahoo.com/v8/finance/chart/{ticker}`
    *   Use case: Stock price quotes and historic indicators.
*   **SEC EDGAR filings** (US Corporate Research): `https://data.sec.gov/submissions/CIK{cik_id}.json`
    *   Use case: U.S. corporate filings (10-K/10-Q details). Must set a descriptive `User-Agent` header.
*   **arXiv Academic query**: `https://export.arxiv.org/api/query?search_query=all:{query}`
    *   Use case: U.S. and international research papers and studies.

---

## 5. Model Context Protocol (MCP) Servers
*   **Blender MCP**:
    *   **Status**: 🟢 ACTIVE (VM-side)
    *   **Config**: Run via direct `node` command over entry point: `/home/franklawrencejr./.npm/_npx/ec77bd5cfaee3fe4/node_modules/@blender-mcp/server/dist/index.js`
*   **Unity MCP**:
    *   **Status**: ⚠️ MAC-ONLY (Requires GUI/Project Editor to be active)
    *   **Config**: Executed on local Mac client; do not attempt systemd config on VM.
*   **Rive MCP**:
    *   **Status**: 🔴 DEACTIVATED (NPM package contains empty placeholder class)
