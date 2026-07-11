---
name: shipfreeapis
description: >
  Comprehensive directory of the best free, keyless, and open APIs categorized
  by industry (US Demographics, Health, Smart Cities, Law, Video Games,
  Anime/Manga, Literature, and Space).
---

# Ship Free APIs: Categorized Open Datasets & API Registry

Use this skill to reference, select, and integrate the best keyless or open-access APIs for building applications. All endpoints listed are completely free to query and do not require developer API keys unless noted.

---

## 1. AI / Intelligence & LLMs
*   **Gemini 3 Flash API** (Free Key via Google AI Studio)
    *   **Limits**: 15 RPM, 1 million TPM, 1,500 requests/day.
    *   **Use case**: Search-grounded AI queries, reasoning, and multimodal inputs (image/video).
*   **Groq API** (Free Key)
    *   **Limits**: 1,000 requests/day.
    *   **Use case**: Ultra-fast LLM inference (Llama, Mixtral) for chat and structured outputs.
*   **OpenRouter API** (Free Key)
    *   **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
    *   **Limits**: Keyless view, free keys allow querying free models ($0 cost).
    *   **Use case**: Query dozens of models (Llama 3 8B, Gemma 2 9B, Mistral 7B) through a single OpenAI-compatible endpoint.

---

## 2. Search & Web Data
*   **Gemini Grounding** (Free Key)
    *   **Limits**: 5,000 queries/month.
    *   **Use case**: Real-time web search results integrated directly into Gemini LLM calls.
*   **Serper.dev** (Free Key)
    *   **Limits**: 2,500 queries free to start.
    *   **Use case**: Structured Google Search Engine Result Page (SERP) scraping.

---

## 3. Trends & Social Media
*   **Reddit API** (OAuth Key)
    *   **Limits**: 100 requests/minute.
    *   **Use case**: Pulling subreddit trends, discussion threads, and market sentiment (e.g., r/wallstreetbets).
*   **SociaVault** (Free Key)
    *   **Limits**: 50 credits free.
    *   **Use case**: Unified scraping across 25+ platforms (TikTok, Instagram, YouTube, X, LinkedIn).
*   **News API** (Free Key)
    *   **Limits**: 100 requests/day.
    *   **Use case**: Global headline feeds and articles filtered by search keyword.
*   **influencers.club** (Free Key)
    *   **Limits**: Generous free tier.
    *   **Use case**: Profiles database for 190M+ content creators.

---

## 4. City, Location & Geocoding
*   **API Ninjas City** (Free Key)
    *   **Limits**: Generous free tier (up to 50,000 requests/mo).
    *   **Use case**: Coordinates, population, and country lookup for ~50,000 cities.
*   **Teleport API** (Keyless)
    *   **Endpoint**: `https://api.teleport.org/api/`
    *   **Limits**: Unlimited.
    *   **Use case**: Quality of life scores, safety metrics, housing cost indices, and education statistics.
*   **REST Countries** (Keyless)
    *   **Endpoint**: `https://restcountries.com/v3.1/all`
    *   **Limits**: Unlimited.
    *   **Use case**: Country flags, currencies, languages, borders, and capital cities.
*   **IPstack** (Free Key)
    *   **Limits**: 100 requests/month.
    *   **Use case**: Geolocating client coordinates from an IP address.
*   **Mapbox** (Free Key)
    *   **Limits**: 100k map loads/month.
    *   **Use case**: Interactive map rendering and custom geocoding.
*   **Positionstack** (Free Key)
    *   **Limits**: 25,000 requests/month.
    *   **Use case**: Forward and reverse geocoding (address to lat/long).
*   **Zippopotam.us** (Keyless)
    *   **Endpoint**: `http://api.zippopotam.us/us/{zip}`
    *   **Limits**: Unlimited.
    *   **Use case**: Instant ZIP code mapping to city and state names.

---

## 5. Weather, Ocean & Seismic Data
*   **Open-Meteo** (Keyless)
    *   **Endpoint**: `https://api.open-meteo.com/v1/forecast`
    *   **Limits**: Unlimited (non-commercial).
    *   **Use case**: Hyperlocal weather forecasts, hourly parameters, and historical weather data.
*   **USGS Earthquake Hazards API** (Keyless)
    *   **Endpoint**: `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=10`
    *   **Limits**: Unlimited.
    *   **Use case**: Live global earthquake logs and magnitudes.
*   **NOAA Tides & Currents API** (Keyless)
    *   **Endpoint**: `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter`
    *   **Limits**: Unlimited.
    *   **Use case**: Live tide levels, water temperatures, and current speeds.

---

## 6. U.S. Demographics, Wealth & Corporate Research
*   **U.S. Census Bureau API** (Keyless / Public)
    *   **Endpoint**: `https://api.census.gov/data/2020/dec/pl`
    *   **Limits**: Rate-limited without key, free keys are instant.
    *   **Use case**: Demographic distribution, state profiles, and population counts.
*   **Bureau of Labor Statistics (BLS) API** (Keyless / Free Key)
    *   **Endpoint**: `https://api.bls.gov/publicAPI/v1/timeseries/data/` (v1 is keyless)
    *   **Limits**: 25 requests/day without key, 500/day with free key.
    *   **Use case**: Macroeconomic indicators (CPI inflation, unemployment).
*   **SEC EDGAR Filings** (Keyless)
    *   **Endpoint**: `https://data.sec.gov/submissions/CIK{CIK}.json`
    *   **Limits**: Unlimited (must specify a descriptive `User-Agent` header).
    *   **Use case**: Institutional ownership transfers, company filings (10-K/10-Q), and executive data.
*   **Federal Register API** (Keyless)
    *   **Endpoint**: `https://www.federalregister.gov/api/v1/documents.json`
    *   **Limits**: Unlimited.
    *   **Use case**: Real-time log of proposed rules, public notices, and executive orders.

---

## 7. Health, Studies & Botanicals
*   **NIH PubMed Central (PMC) API** (Keyless)
    *   **Endpoint**: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc`
    *   **Limits**: Rate-limited without key (3 requests/second).
    *   **Use case**: Search academic journals, clinical studies, and medical trial abstracts.
*   **OpenFDA Recalls & Labeling** (Keyless)
    *   **Endpoint**: `https://api.fda.gov/drug/enforcement.json`
    *   **Limits**: 240 requests/minute.
    *   **Use case**: Drug, food, and cosmetic enforcement recalls or labeling alerts.
*   **Corpora Cannabis Strains Database** (Keyless)
    *   **Endpoint**: `https://raw.githubusercontent.com/dariusk/corpora/master/data/plants/cannabis.json`
    *   **Limits**: Static raw file.
    *   **Use case**: Simple JSON array mapping 420 popular cannabis strains.
*   **iNaturalist Observations API** (Keyless)
    *   **Endpoint**: `https://api.inaturalist.org/v1/observations`
    *   **Limits**: Unlimited.
    *   **Use case**: Botanical and zoological observations, taxonomy trees, and high-res photos.

---

## 8. Space, Astronomy & Earth Observation
*   **Spaceflight News API (SNAPI)** (Keyless)
    *   **Endpoint**: `https://api.spaceflightnewsapi.net/v4/articles/` (trailing slash required)
    *   **Limits**: Unlimited.
    *   **Use case**: Clean index of space articles, launch schedules, and astronomical news.
*   **Open Notify ISS Tracker** (Keyless)
    *   **Endpoint**: `http://api.open-notify.org/iss-now.json`
    *   **Limits**: Unlimited.
    *   **Use case**: Real-time coordinates of the International Space Station.
*   **NASA APOD & NEO** (Keyless via DEMO_KEY)
    *   **Endpoint**: `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY`
    *   **Limits**: Rate-limited to 50 requests/hour per IP.
    *   **Use case**: Astronomy Picture of the Day and Near-Earth Objects.

---

## 9. Games, Gaming & Mock Data
*   **PokeAPI** (Keyless)
    *   **Endpoint**: `https://pokeapi.co/api/v2/pokemon/{name}`
    *   **Limits**: Unlimited.
    *   **Use case**: Complete database of Pokémon stats, types, moves, and sprites.
*   **FreeToGame API** (Keyless)
    *   **Endpoint**: `https://www.freetogame.com/api/games`
    *   **Limits**: Unlimited.
    *   **Use case**: Full index of free-to-play PC and browser multiplayer games.
*   **IGDB** (Free Key via Twitch)
    *   **Limits**: Twitch developer registration.
    *   **Use case**: Comprehensive game titles, release histories, and cover art.
*   **RAWG Video Game Database** (Free Key)
    *   **Limits**: Generous free tier.
    *   **Use case**: Game database search and user reviews.
*   **Open Trivia DB** (Keyless)
    *   **Endpoint**: `https://opentdb.com/api.php?amount=10`
    *   **Limits**: Unlimited.
    *   **Use case**: Quiz questions (5k+ across multiple categories) for game gamification.
*   **JSONPlaceholder** (Keyless)
    *   **Endpoint**: `https://jsonplaceholder.typicode.com/posts`
    *   **Limits**: Unlimited.
    *   **Use case**: Instant mock REST API (posts, comments, users) for frontend prototyping.

---

## 10. Speech, Music & Image Media
*   **Spotify API** (OAuth Key)
    *   **Limits**: Developer app registration.
    *   **Use case**: Playlists, track metadata, and recommendations.
*   **Mubert AI** (Free Key)
    *   **Limits**: Generous free tier.
    *   **Use case**: AI-generated royalty-free music.
*   **AssemblyAI** (Free Key)
    *   **Limits**: $50 free credit.
    *   **Use case**: Speech-to-text transcription and speaker diarization.
*   **Deepgram** (Free Key)
    *   **Limits**: $200 free credit.
    *   **Use case**: High-accuracy real-time STT and audio processing.
*   **Leonardo.ai** (Free Key)
    *   **Limits**: 150 tokens/day.
    *   **Use case**: Branded social media image generation.
*   **Giphy API** (Free Key)
    *   **Limits**: Free developer key.
    *   **Use case**: GIF searches and trending reactions.

---

## 11. Creators, Notifications & CRM
*   **YouTube Data API v3** (Free Key)
    *   **Limits**: 10,000 units/day.
    *   **Use case**: Video metadata, playlist management, and channel metrics.
*   **Twitch API** (OAuth Key)
    *   **Limits**: Developer credentials.
    *   **Use case**: Live streams, channel chat status, and moderation.
*   **OneSignal** (Free Key)
    *   **Limits**: Unlimited push users.
    *   **Use case**: Web and mobile push notifications.
*   **SendGrid** (Free Key)
    *   **Limits**: 100 emails/day.
    *   **Use case**: Transactional transactional emails.
*   **HubSpot CRM** (Free Key)
    *   **Limits**: Core features free.
    *   **Use case**: Contacts database and deal routing.
*   **Zoho CRM** (Free Key)
    *   **Limits**: Free for up to 3 users.
    *   **Use case**: Customer relationship management API.

---

## 12. Deployment, Hosting & Backend
*   **Vercel** (Free Account)
    *   **Limits**: Unlimited personal projects.
    *   **Use case**: Serverless functions and Next.js/React static hosting.
*   **Supabase** (Free Account)
    *   **Limits**: 500MB DB storage, 50k users auth.
    *   **Use case**: Managed Postgres, vector storage, and user authentication.
*   **Cloudflare Pages** (Free Account)
    *   **Limits**: Unlimited static builds.
    *   **Use case**: Global edge CDN and routing.

---

## 13. Other Curated Fields (Pets & Zodiac)
*   **TheMealDB** (Keyless)
    *   **Endpoint**: `https://www.themealdb.com/api/json/v1/1/search.php?s=pasta`
    *   **Use case**: Recipe search and ingredients mapping.
*   **Open Food Facts** (Keyless)
    *   **Endpoint**: `https://world.openfoodfacts.org/api/v2/product/737628064502.json`
    *   **Use case**: Food product ingredients, nutrition grades, and allergens.
*   **TheDogAPI / TheCatAPI** (Free Key)
    *   **Use case**: Breeds databases and images.
*   **Petfinder API** (Free Key)
    *   **Use case**: Adoptable pets near coordinate queries.
*   **API Ninjas Horoscope** (Free Key)
    *   **Use case**: Daily zodiac horoscope updates.
*   **RoxyAPI** (Free Key)
    *   **Limits**: 50 calls/month.
    *   **Use case**: Astrology charts, numerology readings, and tarot cards.
