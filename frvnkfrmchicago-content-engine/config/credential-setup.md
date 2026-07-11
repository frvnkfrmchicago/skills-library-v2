# Asset Persona — Credential Setup Guide

> Step-by-step instructions for setting up every credential needed
> by the content engine. Follow the dependency order.

---

## Prerequisites

- Google account (Gmail)
- Meta account (with Threads + Instagram business profile)
- LinkedIn account
- Reddit account
- n8n self-hosted instance running at `localhost:5678`

---

## Step 1: Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **"Create Project"** → Name: `assetpersona-content-engine`
3. Enable these APIs (APIs & Services → Library):
   - Generative Language API (Gemini)
   - Google Sheets API
   - Google Drive API
4. Note your **Project ID**

---

## Step 2: Google AI API Key

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **"Create API Key"** → select your project
3. Copy the key

**n8n Setup:**
- Settings → Credentials → New → **Header Auth**
- Name: `Google AI - Gemini`
- Header Name: leave empty (use as query param in HTTP nodes)
- OR: Settings → Credentials → New → **Generic Credential Type**
  - Name: `Gemini API Key`
  - Value: your key (use in HTTP Request URL: `?key={{$credentials.apiKey}}`)

---

## Step 3: Google Sheets OAuth2

1. In Google Cloud Console → APIs & Services → Credentials
2. Click **"Create Credentials"** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Authorized redirect URI: `http://localhost:5678/rest/oauth2-credential/callback`
5. Copy **Client ID** and **Client Secret**

**n8n Setup:**
- Settings → Credentials → New → **Google Sheets OAuth2**
- Paste Client ID and Client Secret
- Click **"Sign in with Google"** → authorize access to Sheets
- Name: `Google Sheets - Content Calendar`

---

## Step 4: Google Drive OAuth2

Same OAuth2 client as Step 3 (Drive API is already enabled).

**n8n Setup:**
- Settings → Credentials → New → **Google Drive OAuth2**
- Paste same Client ID and Client Secret
- Click **"Sign in with Google"** → authorize Drive access
- Name: `Google Drive - Content Assets`

---

## Step 5: Meta Developer App (Threads + Instagram)

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click **"Create App"** → Choose **"Business"**
3. App name: `assetpersona-content-engine`
4. Add Products:
   - **Threads API** → Configure
   - **Instagram Graph API** → Configure
5. Go to Settings → Basic → note **App ID** and **App Secret**

---

## Step 6: Threads Access Token

1. In Meta Developer Dashboard → Threads API → Settings
2. Add Threads account: `@assetpersona`
3. Generate **User Access Token** with permissions:
   - `threads_basic`
   - `threads_content_publish`
   - `threads_manage_insights`
4. Exchange for **long-lived token** (60-day expiry):
   ```
   GET https://graph.threads.net/access_token
     ?grant_type=th_exchange_token
     &client_secret=APP_SECRET
     &access_token=SHORT_LIVED_TOKEN
   ```
5. Note your **Threads User ID** (numeric)

**n8n Setup:**
- Settings → Credentials → New → **Header Auth**
- Name: `Threads - assetpersona`
- Header Name: `Authorization`
- Header Value: `Bearer YOUR_LONG_LIVED_TOKEN`

**⚠️ Set a calendar reminder to refresh this token every 50 days.**

---

## Step 7: Instagram Access Token

1. In Meta Developer Dashboard → Instagram Graph API
2. Connect your Instagram Business account
3. Generate **Page Access Token** with permissions:
   - `instagram_basic`
   - `instagram_content_publish`
4. Note your **Instagram User ID** (numeric)

**n8n Setup:**
- Settings → Credentials → New → **Header Auth**
- Name: `Instagram - assetpersona`
- Header Name: `Authorization`
- Header Value: `Bearer YOUR_TOKEN`

---

## Step 8: LinkedIn App

1. Go to [linkedin.com/developers](https://www.linkedin.com/developers/)
2. Click **"Create App"**
3. App name: `assetpersona-content`
4. Request Products: **Share on LinkedIn**, **Sign In with LinkedIn**
5. In Auth tab → add redirect URL: `http://localhost:5678/rest/oauth2-credential/callback`
6. Note **Client ID** and **Client Secret**
7. Note your **LinkedIn Person URN**: `urn:li:person:XXXXXXX`

**n8n Setup:**
- Settings → Credentials → New → **LinkedIn OAuth2**
- Paste Client ID and Client Secret
- Click **"Sign in"** → authorize
- Name: `LinkedIn - Frank Lawrence`

---

## Step 9: Reddit App

1. Go to [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Click **"create another app..."**
3. Type: **script**
4. Name: `assetpersona-content-engine`
5. Redirect URI: `http://localhost:5678` (not used for script apps)
6. Note **Client ID** (under app name) and **Client Secret**

**Get Access Token:**
```bash
curl -X POST https://www.reddit.com/api/v1/access_token \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -d "grant_type=client_credentials" \
  -A "assetpersona/1.0"
```

**n8n Setup:**
- Settings → Credentials → New → **Header Auth**
- Name: `Reddit - assetpersona`
- Header Name: `Authorization`
- Header Value: `Bearer YOUR_ACCESS_TOKEN`

**Note:** Script tokens don't expire, but may need refresh if Reddit rotates.

---

## Step 10: Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Project name: `assetpersona-content-hub`
3. Region: closest to you (us-central-1 for Chicago)
4. Note: **Project URL**, **anon key**, **service_role key**

**Set Edge Function Secrets:**
```bash
supabase secrets set THREADS_ACCESS_TOKEN="your_threads_token"
supabase secrets set GEMINI_API_KEY="your_gemini_key"
supabase secrets set WEBHOOK_HMAC_SECRET="generate_a_random_32_char_string"
supabase secrets set THREADS_USER_ID="your_numeric_user_id"
```

---

## n8n Variables Setup

After all credentials are configured, set these in n8n:

**Settings → Variables → Add:**

| Variable Name | Value | Used By |
|--------------|-------|---------|
| `BRAND_HANDLE` | `assetpersona` | All workflows |
| `CONTENT_CALENDAR_SHEET_ID` | `your_google_sheet_id` | All pipelines |
| `THREADS_USER_ID` | `numeric_user_id` | Publisher pipeline |
| `LINKEDIN_URN` | `urn:li:person:XXXXXXX` | Publisher pipeline |
| `IG_USER_ID` | `numeric_user_id` | Publisher pipeline |
| `FB_PAGE_ID` | `page_id` | Publisher pipeline |
| `GEMINI_API_KEY` | `your_key` | All pipelines |

---

## Security Checklist

- [ ] All API keys stored in n8n credentials (never in workflow JSON)
- [ ] No secrets in plaintext in any file
- [ ] Long-lived tokens have calendar reminders for refresh
- [ ] HMAC secret generated with `openssl rand -hex 32`
- [ ] OAuth2 redirect URIs locked to `localhost:5678`
- [ ] Reddit User-Agent header set (required by Reddit API)
- [ ] Service role key NEVER exposed to client-side code
