# Asset Persona — API Requirements

> Complete API inventory for the content engine. Every external service,
> its authentication method, rate limits, and key endpoints.

---

## API Inventory

### 1. AI — GLM 5.1

| Field | Value |
|-------|-------|
| **Purpose** | Caption generation, content categorization, scoring, image generation |
| **Base URL** | `https://generativelanguage.googleapis.com/v1beta` |
| **Auth** | API Key (query param `key=API_KEY`) |
| **Rate Limit** | 15 RPM (free), 1500 RPM (pay-as-you-go) |
| **Cost** | Free tier: 15 RPM / 1M TPD · Paid: $0.075/1M input, $0.30/1M output tokens |
| **n8n Credential** | Header Auth or Generic Credential |

**Key Endpoints:**
```
POST /models/gemini-2.0-flash:generateContent?key=KEY
  Body: { contents: [{ parts: [{ text: "..." }] }] }

POST /models/gemini-2.0-flash:generateContent?key=KEY
  Body: { contents: [{ parts: [{ text: "Generate image: ..." }] }],
          generationConfig: { responseModalities: ["IMAGE", "TEXT"] } }
```

**Error Handling:**
- 429 → Respect `Retry-After` header, exponential backoff
- 403 → Check API key validity and quota
- 500 → Retry with backoff (max 3 retries)

---

### 2. Threads Graph API (Meta)

| Field | Value |
|-------|-------|
| **Purpose** | Post text and media to @assetpersona Threads account |
| **Base URL** | `https://graph.threads.net/v1.0` |
| **Auth** | Bearer Token (long-lived user access token) |
| **Rate Limit** | 250 posts/24hr per user |
| **Cost** | Free |
| **n8n Credential** | Header Auth (`Authorization: Bearer TOKEN`) |

**Key Endpoints:**
```
# Step 1: Create container
POST /{user_id}/threads
  Body: { media_type: "TEXT", text: "caption" }
  → Returns: { id: "container_id" }

# Step 2: WAIT 30 SECONDS (mandatory)

# Step 3: Publish
POST /{user_id}/threads_publish
  Body: { creation_id: "container_id" }
  → Returns: { id: "post_id" }

# For image posts:
POST /{user_id}/threads
  Body: { media_type: "IMAGE", image_url: "https://...", text: "caption" }
```

**⚠️ CRITICAL:** Container → 30-second wait → Publish. Skipping the wait
causes `MEDIA_NOT_READY` errors.

**Token Refresh:** Long-lived tokens expire in 60 days. Exchange before expiry:
```
GET /access_token?grant_type=th_exchange_token
    &client_secret=APP_SECRET
    &access_token=CURRENT_TOKEN
```

---

### 3. LinkedIn API

| Field | Value |
|-------|-------|
| **Purpose** | Post thought leadership content to LinkedIn profile/company |
| **Base URL** | `https://api.linkedin.com/v2` |
| **Auth** | OAuth2 (3-legged) |
| **Rate Limit** | 100 requests/day for posting |
| **Cost** | Free (Community Management API) |
| **Scopes** | `w_member_social`, `r_liteprofile` |
| **n8n Credential** | LinkedIn OAuth2 |

**Key Endpoints:**
```
# Create a share
POST /ugcPosts
  Body: {
    author: "urn:li:person:PERSON_ID",
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: "caption" },
        shareMediaCategory: "NONE"
      }
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
  }
```

---

### 4. Instagram Graph API (Meta)

| Field | Value |
|-------|-------|
| **Purpose** | Post images and carousels to Instagram business account |
| **Base URL** | `https://graph.instagram.com/v19.0` |
| **Auth** | Bearer Token (page access token from Meta Business) |
| **Rate Limit** | 25 posts/24hr per account |
| **Cost** | Free |
| **n8n Credential** | Header Auth |

**Key Endpoints:**
```
# Step 1: Create media container
POST /{user_id}/media
  Body: { image_url: "https://...", caption: "..." }
  → Returns: { id: "container_id" }

# Step 2: Publish
POST /{user_id}/media_publish
  Body: { creation_id: "container_id" }
```

---

### 5. TikTok Content Posting API

| Field | Value |
|-------|-------|
| **Purpose** | Post photo and video content |
| **Base URL** | `https://open.tiktokapis.com/v2` |
| **Auth** | OAuth2 (requires approved app) |
| **Rate Limit** | Varies by app approval tier |
| **Cost** | Free |
| **Scopes** | `video.publish`, `video.upload` |
| **n8n Credential** | OAuth2 |

**Key Endpoints:**
```
# Photo post
POST /post/publish/content/init/
  Body: {
    post_info: { title: "caption", privacy_level: "PUBLIC_TO_EVERYONE" },
    source_info: { source: "PULL_FROM_URL", photo_images: ["url1"] },
    media_type: "PHOTO"
  }
```

---

### 6. Facebook Graph API

| Field | Value |
|-------|-------|
| **Purpose** | Post to Facebook Page |
| **Base URL** | `https://graph.facebook.com/v19.0` |
| **Auth** | Page Access Token |
| **Rate Limit** | 200 calls/user/hour |
| **Cost** | Free |
| **n8n Credential** | Header Auth |

**Key Endpoints:**
```
POST /{page_id}/feed
  Body: { message: "caption" }
  → Returns: { id: "post_id" }

# With image
POST /{page_id}/photos
  Body: { url: "https://...", caption: "..." }
```

---

### 7. Google Sheets API

| Field | Value |
|-------|-------|
| **Purpose** | Read/write Content Calendar |
| **Base URL** | `https://sheets.googleapis.com/v4` |
| **Auth** | OAuth2 (Google Service Account or user consent) |
| **Rate Limit** | 300 requests/min per project |
| **Cost** | Free |
| **n8n Credential** | Google Sheets OAuth2 (native node) |

---

### 8. Google Drive API

| Field | Value |
|-------|-------|
| **Purpose** | Upload generated images, store brand assets |
| **Base URL** | `https://www.googleapis.com/upload/drive/v3` |
| **Auth** | OAuth2 (same as Sheets) |
| **Rate Limit** | 12000 requests/min per project |
| **Cost** | Free (up to 15GB storage) |
| **n8n Credential** | Google Drive OAuth2 (native node) |

---

### 9. Reddit API (OAuth)

| Field | Value |
|-------|-------|
| **Purpose** | Fetch trending posts for Repost/Meme Engine |
| **Base URL** | `https://oauth.reddit.com` |
| **Auth** | OAuth2 (script app type) |
| **Rate Limit** | 60 requests/min with OAuth |
| **Cost** | Free |
| **n8n Credential** | HTTP Header Auth (`Authorization: Bearer TOKEN`) |

**Key Endpoints:**
```
GET /r/{subreddit}/top?t=week&limit=25
  Headers: Authorization: Bearer TOKEN, User-Agent: assetpersona/1.0
```

**Token Acquisition:**
```
POST https://www.reddit.com/api/v1/access_token
  Auth: Basic base64(CLIENT_ID:CLIENT_SECRET)
  Body: grant_type=client_credentials
```

---

### 10. Supabase

| Field | Value |
|-------|-------|
| **Purpose** | Content hub database, Edge Functions, storage |
| **Base URL** | `https://{PROJECT_REF}.supabase.co` |
| **Auth** | `anon` key (public) + `service_role` key (server) |
| **Rate Limit** | Free: 500 req/min. Pro: 2000 req/min |
| **Cost** | Free tier available, Pro $25/mo |

**Key Components:**
- **Database** (PostgreSQL) — content records, user profiles
- **Edge Functions** (Deno) — Threads broadcast, webhook handling
- **Storage** — asset hosting with CDN
- **RLS** — mandatory on all tables per `supabase-building` skill

---

### 11. n8n (Self-Hosted)

| Field | Value |
|-------|-------|
| **Purpose** | Workflow orchestration engine |
| **Base URL** | `http://localhost:5678` (self-hosted) |
| **Auth** | Basic Auth or API Key for webhook endpoints |
| **Rate Limit** | No external limit (self-hosted) |
| **Cost** | Free (self-hosted), Cloud plans from $24/mo |

---

## Rate Limit Strategy

| API | Limit | Strategy |
|-----|-------|----------|
| Gemini | 15 RPM (free) | Wait node: 4s between calls. Batch: 5 items/batch |
| Threads | 250/day | Daily budget: max 5 posts/day |
| LinkedIn | 100/day | Daily budget: max 2 posts/day |
| Instagram | 25/day | Daily budget: max 2 posts/day |
| Reddit | 60/min | Wait node: 1s between calls |
| Google Sheets | 300/min | No throttle needed at content engine scale |

---

## Credential Dependency Order

Set up credentials in this order (each depends on the previous):

```
1. Google Cloud Project (enables all Google APIs)
   │
   ├── 2. Google AI API Key
   ├── 3. Google Sheets OAuth2
   └── 4. Google Drive OAuth2
   
5. Meta Developer App (enables Threads + Instagram)
   │
   ├── 6. Threads User Access Token
   └── 7. Instagram Access Token
   
8. LinkedIn App (developer.linkedin.com)
   └── 9. LinkedIn OAuth2

10. Reddit App (reddit.com/prefs/apps)
    └── 11. Reddit OAuth Token

12. Supabase Project
    └── 13. Supabase service_role key + Edge Function secrets
```
