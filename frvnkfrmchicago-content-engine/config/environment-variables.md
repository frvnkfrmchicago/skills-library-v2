# Asset Persona — Environment Variables

> All environment variables needed across n8n, Supabase, and local dev.

---

## .env Template

```bash
# ============================================================
# Asset Persona Content Engine — Environment Variables
# ============================================================
# NEVER commit this file to version control.
# Copy to .env.local and fill in real values.
# ============================================================

# --- Google AI (Gemini) ---
GEMINI_API_KEY=your_gemini_api_key_here

# --- Google Sheets ---
GOOGLE_SHEETS_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_SHEETS_CLIENT_SECRET=your_client_secret
CONTENT_CALENDAR_SHEET_ID=your_sheet_id_from_url

# --- Google Drive ---
GOOGLE_DRIVE_CLIENT_ID=same_as_sheets_client_id
GOOGLE_DRIVE_CLIENT_SECRET=same_as_sheets_secret
CONTENT_ASSETS_FOLDER_ID=your_drive_folder_id

# --- Threads (Meta) ---
THREADS_ACCESS_TOKEN=your_long_lived_token
THREADS_USER_ID=your_numeric_user_id
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret

# --- Instagram (Meta) ---
INSTAGRAM_ACCESS_TOKEN=your_ig_page_token
INSTAGRAM_USER_ID=your_ig_numeric_user_id

# --- LinkedIn ---
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_PERSON_URN=urn:li:person:your_person_id

# --- Facebook ---
FACEBOOK_PAGE_TOKEN=your_page_access_token
FACEBOOK_PAGE_ID=your_page_id

# --- TikTok ---
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
TIKTOK_ACCESS_TOKEN=your_tiktok_token

# --- Reddit ---
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_ACCESS_TOKEN=your_reddit_bearer_token

# --- Supabase ---
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# --- Webhook Security ---
WEBHOOK_HMAC_SECRET=generate_with_openssl_rand_hex_32

# --- n8n ---
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key

# --- MiniMax (Optional) ---
MINIMAX_API_KEY=your_minimax_key
MINIMAX_GROUP_ID=your_minimax_group_id
```

---

## Variable Locations

| Variable | Where It Goes | Why |
|----------|--------------|-----|
| `GEMINI_API_KEY` | n8n Credentials + Supabase Secrets | Used by n8n workflows AND Edge Functions |
| `GOOGLE_SHEETS_*` | n8n Credentials (OAuth2) | Native Google Sheets node |
| `GOOGLE_DRIVE_*` | n8n Credentials (OAuth2) | Native Google Drive node |
| `THREADS_ACCESS_TOKEN` | n8n Credentials + Supabase Secrets | Publisher pipeline + broadcast Edge Function |
| `THREADS_USER_ID` | n8n Variables | Used in URL construction |
| `INSTAGRAM_*` | n8n Credentials | Publisher pipeline |
| `LINKEDIN_*` | n8n Credentials (OAuth2) | Native LinkedIn node |
| `FACEBOOK_*` | n8n Credentials | Publisher pipeline |
| `TIKTOK_*` | n8n Credentials | Publisher pipeline |
| `REDDIT_*` | n8n Credentials | Repost/Meme pipeline |
| `SUPABASE_*` | .env.local (web app) | Client-side Supabase connection |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Secrets ONLY | NEVER in client code |
| `WEBHOOK_HMAC_SECRET` | n8n Variables + Supabase Secrets | Both sides need this for verification |

---

## Required vs Optional

| Variable | Required | Notes |
|----------|----------|-------|
| `GEMINI_API_KEY` | ✅ Required | Core AI engine |
| `CONTENT_CALENDAR_SHEET_ID` | ✅ Required | Central data hub |
| `GOOGLE_SHEETS_*` | ✅ Required | Read/write content calendar |
| `GOOGLE_DRIVE_*` | ✅ Required | Image storage |
| `THREADS_*` | ✅ Required | Primary social platform |
| `LINKEDIN_*` | ✅ Required | Professional content |
| `WEBHOOK_HMAC_SECRET` | ✅ Required | Security |
| `INSTAGRAM_*` | ⚡ Recommended | Visual content |
| `REDDIT_*` | ⚡ Recommended | Repost/Meme engine |
| `FACEBOOK_*` | ⬜ Optional | Community reach |
| `TIKTOK_*` | ⬜ Optional | Short-form video |
| `MINIMAX_*` | ⬜ Optional | Alternative AI model |

---

## Supabase Secrets Commands

```bash
# Set all required secrets
supabase secrets set GEMINI_API_KEY="your_key"
supabase secrets set THREADS_ACCESS_TOKEN="your_token"
supabase secrets set THREADS_USER_ID="your_id"
supabase secrets set WEBHOOK_HMAC_SECRET="your_hmac_secret"

# Verify secrets are set
supabase secrets list
```

---

## n8n Variable Import

In n8n UI: Settings → Variables → Add each:

```
BRAND_HANDLE = assetpersona
CONTENT_CALENDAR_SHEET_ID = [sheet ID from URL]
THREADS_USER_ID = [numeric ID]
LINKEDIN_URN = urn:li:person:[ID]
IG_USER_ID = [numeric ID]
FB_PAGE_ID = [page ID]
WEBHOOK_HMAC_SECRET = [32-char hex string]
```

---

## HMAC Secret Generation

```bash
# Generate a cryptographically secure 32-byte hex string
openssl rand -hex 32

# Example output: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
# Use this same value in BOTH n8n variables AND Supabase secrets
```
