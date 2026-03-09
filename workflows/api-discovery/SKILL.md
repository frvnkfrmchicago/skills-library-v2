---
name: api-discovery
description: Find and evaluate public APIs. Government data, free tiers, city data portals. Source before you build.
last_updated: 2026-03
owner: Frank
---

# API Discovery Skill

Find the right public API before you build.

> **Owner Context:** Frank uses this to find free/public APIs for product ideas. Example: Chicago tow truck data via city portal. Research APIs first, then build.

---

## Context Questions

Before searching for APIs, ask:

1. **What data do you need?** — Weather, finance, government, social, maps, AI
2. **What's the use case?** — Personal project, commercial product, learning
3. **What's the budget?** — Free only, freemium OK, paid acceptable
4. **What's the reliability need?** — Hobby (downtime OK), production (SLA needed)
5. **What auth can you handle?** — None, API key, OAuth, complex
6. **What's the expected volume?** — Low (1K/day), medium (100K/day), high (1M+)

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Cost** | Free ←→ Freemium ←→ Paid |
| **Auth Complexity** | None ←→ API Key ←→ OAuth ←→ OAuth + Scopes |
| **Rate Limits** | Generous ←→ Restricted ←→ Throttled |
| **Data Freshness** | Real-time ←→ Hourly ←→ Daily ←→ Static |
| **Documentation** | Poor ←→ Adequate ←→ Excellent |
| **Reliability** | Best effort ←→ SLA guaranteed |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Learning/personal project | Free APIs, no auth preferred |
| Commercial product | Check terms of service, rate limits, pricing tiers |
| Government data needed | data.gov, city portals, Census API |
| Real-time data needed | WebSocket APIs, streaming endpoints |
| High volume | APIs with generous limits or paid tiers |
| City-specific data | Local government open data portals |

---

## Part 1: API Directories

### Curated Lists

| Resource | URL | Best For |
|----------|-----|----------|
| **public-apis (GitHub)** | github.com/public-apis/public-apis | Largest curated list, categorized |
| **RapidAPI Hub** | rapidapi.com/hub | Search, test, unified auth |
| **Postman Collections** | postman.com/explore | Pre-built collections, testing |
| **API Ninjas** | api-ninjas.com | Simple free APIs |
| **Any API** | any-api.com | Categorized directory |

### Government Data

| Resource | URL | Data Type |
|----------|-----|-----------|
| **Data.gov** | api.data.gov | US federal data (450+ APIs) |
| **US Census** | api.census.gov | Demographics, economics |
| **Data.gov.uk** | data.gov.uk | UK government data |
| **EU Open Data** | data.europa.eu | European Union data |

### City/Municipal Data

| City | Portal | Example Data |
|------|--------|--------------|
| **Chicago** | data.cityofchicago.org | Tow trucks, crime, 311, transit |
| **New York** | data.cityofnewyork.us | 311, parking, health inspections |
| **Los Angeles** | data.lacity.org | Crime, building permits |
| **San Francisco** | datasf.org | Film locations, 311, transit |

> **Pro tip:** Most US cities with 100K+ population have open data portals. Search "[city name] open data portal".

---

## Part 2: Evaluating an API

### Quick Evaluation Checklist

```markdown
## API Evaluation: [API Name]

### Basics
- [ ] Free tier available?
- [ ] Rate limits acceptable? (___/day, ___/month)
- [ ] Auth type? (none / API key / OAuth)
- [ ] Terms allow commercial use?

### Quality
- [ ] Documentation quality? (1-5)
- [ ] Response time acceptable?
- [ ] Data freshness meets needs?
- [ ] Active support/community?

### Integration
- [ ] SDK available? (Python / Node / etc.)
- [ ] OpenAPI/Swagger spec?
- [ ] Sandbox/test environment?
- [ ] Webhook support?

### Risk
- [ ] Uptime history?
- [ ] Company stability?
- [ ] Deprecation policy?
- [ ] Data backup plan?
```

### Red Flags

| Red Flag | Why It Matters |
|----------|----------------|
| No versioning | Breaking changes without warning |
| No rate limit docs | Could throttle unexpectedly |
| Requires credit card for "free" | May charge overages |
| No status page | No visibility into outages |
| Last updated 2+ years ago | Likely abandoned |

---

## Part 3: API Categories

### Popular Free APIs by Category

#### Finance
| API | Free Tier | Auth | Notes |
|-----|-----------|------|-------|
| Alpha Vantage | 25 req/day | API key | Stock, forex, crypto |
| Finnhub | 60 req/min | API key | Real-time stock data |
| CoinGecko | 10-50 req/min | None | Crypto prices |
| Open Exchange Rates | 1000/month | API key | Currency exchange |

#### Weather
| API | Free Tier | Auth | Notes |
|-----|-----------|------|-------|
| OpenWeatherMap | 1000/day | API key | Current, forecast |
| WeatherAPI | 1M/month | API key | Historical included |
| Open-Meteo | Unlimited | None | No key needed |

#### Maps/Geo
| API | Free Tier | Auth | Notes |
|-----|-----------|------|-------|
| OpenStreetMap | Unlimited | None | Map data |
| Geocoding.xyz | 1/sec | None | Geocoding |
| IPinfo | 50K/month | API key | IP geolocation |

#### AI/ML
| API | Free Tier | Auth | Notes |
|-----|-----------|------|-------|
| Hugging Face | Rate limited | API key | Models, inference |
| OpenAI | $5 credit | API key | GPT, DALL-E |
| Anthropic | Pay-as-go | API key | Claude models |
| Google AI Studio | Generous | API key | Gemini models |

#### Government/Public
| API | Free Tier | Auth | Notes |
|-----|-----------|------|-------|
| Data USA | Unlimited | None | US statistics |
| FDA | Unlimited | API key | Drug, food data |
| NASA | Unlimited | API key | Space imagery, data |
| USGS | Unlimited | None | Earthquakes, water |

---

## Part 4: City Data Deep Dive

### Chicago Data Portal (Socrata)

```bash
# Example: Get pothole data
curl "https://data.cityofchicago.org/resource/787j-mys9.json" \
  -H "X-App-Token: YOUR_APP_TOKEN"
```

```typescript
// Using Socrata API
const CHICAGO_API = "https://data.cityofchicago.org/resource";

async function getChicagoData(dataset: string, params?: Record<string, string>) {
  const url = new URL(`${CHICAGO_API}/${dataset}.json`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  const response = await fetch(url.toString(), {
    headers: {
      "X-App-Token": process.env.SOCRATA_APP_TOKEN!,
    },
  });
  
  return response.json();
}

// Example: Get tow vehicles
const tows = await getChicagoData("ygr5-vcbg", {
  "$limit": "100",
  "$order": "tow_date DESC",
});
```

### Popular Chicago Datasets

| Dataset ID | Description | Updates |
|------------|-------------|---------|
| `787j-mys9` | 311 Service Requests - Potholes | Daily |
| `ygr5-vcbg` | Towed Vehicles | Real-time |
| `ijzp-q8t2` | Crimes | Daily |
| `m6dm-c72p` | Rideshare Trips | Monthly |
| `97wa-y6ff` | Food Inspections | Daily |

---

## Part 5: Building API-First Products

### Workflow

```
1. IDENTIFY need → What data solves this problem?
2. SEARCH directories → Find candidate APIs
3. EVALUATE → Check limits, auth, terms
4. PROTOTYPE → Test with small integration
5. BUILD → Full implementation
6. MONITOR → Track usage, errors, limits
```

### Integration Pattern

```typescript
// lib/api-client.ts
export function createAPIClient<T>(config: {
  baseUrl: string;
  authHeader?: string;
  rateLimit?: number;
}) {
  let lastCall = 0;
  const minInterval = config.rateLimit ? 1000 / config.rateLimit : 0;

  return async function fetchAPI(endpoint: string, options?: RequestInit): Promise<T> {
    // Rate limiting
    const now = Date.now();
    const wait = Math.max(0, minInterval - (now - lastCall));
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    lastCall = Date.now();

    const url = `${config.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(config.authHeader && { Authorization: config.authHeader }),
      ...options?.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  };
}

// Usage
const chicagoAPI = createAPIClient({
  baseUrl: "https://data.cityofchicago.org/resource",
  authHeader: `Bearer ${process.env.SOCRATA_TOKEN}`,
  rateLimit: 10, // 10 requests per second
});
```

---

## Part 6: Terms of Service Checklist

Before using any API commercially:

```markdown
- [ ] Can I use data commercially?
- [ ] Do I need to attribute the source?
- [ ] Can I cache/store the data?
- [ ] Can I modify/transform the data?
- [ ] What happens if I exceed limits?
- [ ] Is there a termination clause?
- [ ] Do I need to display their branding?
```

---

## Quick Reference

### Finding APIs for Common Needs

| Need | First Place to Look |
|------|---------------------|
| Stock prices | Alpha Vantage, Finnhub |
| Weather | Open-Meteo (no key needed) |
| Maps | OpenStreetMap, Mapbox |
| City data | [city]data.gov or data.[city].org |
| US government | api.data.gov |
| AI models | Hugging Face, OpenRouter |
| News | NewsAPI, GNews |
| Social media | Official platform APIs (Twitter/X, Reddit) |

---

## Related Skills

- [openapi/SKILL.md](file:///agents/openapi/SKILL.md) — Design your own APIs
- [backend-patterns/SKILL.md](file:///agents/backend-patterns/SKILL.md) — Caching, rate limiting
- [n8n/SKILL.md](file:///agents/n8n/SKILL.md) — Automation with APIs
- [research/SKILL.md](file:///workflows/research/SKILL.md) — Research methodology
