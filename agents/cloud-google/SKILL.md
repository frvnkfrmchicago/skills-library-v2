---
name: cloud-google
description: Google Cloud deployment. Cloud Run, App Engine, Firebase Hosting.
last_updated: 2026-03
owner: Frank
---

# Google Cloud Deployment Skill

**Deploy to Cloud Run, App Engine, Firebase.**

---

## Context Questions

Before deploying to GCP:

1. **What's the app type?** — Container, static site, traditional web app
2. **Why GCP over Vercel?** — Need containers, WebSockets, Google services, cost control
3. **What's the runtime?** — Node.js, Python, Go, Docker container
4. **Scaling needs?** — Scale to zero (Run), always-on (App Engine), static (Hosting)
5. **Integration needs?** — BigQuery, Pub/Sub, Cloud SQL, Vertex AI

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Compute** | Cloud Run (containers) ←→ App Engine ←→ GKE |
| **Hosting** | Firebase (static) ←→ Cloud Run (dynamic) |
| **Scaling** | Scale to zero ←→ Min instances ←→ Always-on |
| **Complexity** | firebase deploy ←→ gcloud run deploy ←→ Terraform |
| **Cost** | Pay-per-request ←→ Reserved |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Static site | Firebase Hosting |
| Next.js with SSR | Firebase App Hosting or Cloud Run |
| Docker container | Cloud Run |
| Need WebSockets | Cloud Run (not Vercel) |
| Backend API | Cloud Run |
| Google services heavy | GCP native (easier integration) |

---

## TL;DR

| Platform | Best For | Setup Time | Cost |
|----------|----------|------------|------|
| **Cloud Run** | Containers, APIs | 15 min | Pay per use |
| **Firebase Hosting** | Static sites, Next.js | 10 min | Free tier generous |
| **App Engine** | Traditional web apps | 20 min | Always-on pricing |

**vs Vercel:** Use Google for backend APIs, Google services integration. Use Vercel for Next.js (easier).

---

## Part 1: Cloud Run (Containers)

```bash
# Install CLI
gcloud components install cloud-run

# Deploy
gcloud run deploy my-app \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

**Next.js 16.1.1 Dockerfile:**
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

**Cost:** $0.00002400 per request (100K requests = $2.40)

---

## Part 2: Firebase Hosting (Static/Next.js)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

**Next.js config:**
```json
// firebase.json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  }
}
```

**Cost:** Free up to 10GB/month

---

## Part 3: When to Use Google vs Vercel

| Use Case | Google | Vercel |
|----------|--------|--------|
| Next.js app | ❌ | ✅ (easier) |
| Backend API | ✅ | ⚠️ (functions only) |
| Containers | ✅ | ❌ |
| Google services | ✅ | ❌ |
| WebSockets | ✅ | ❌ |
| Cost control | ✅ | ⚠️ (can get expensive) |

---

## Part 4: Environment Variables

```bash
# Cloud Run
gcloud run services update my-app \
  --set-env-vars="DATABASE_URL=xxx,API_KEY=yyy"

# Firebase
firebase functions:config:set stripe.key="xxx"
```

---

## Part 5: Custom Domains

```bash
# Cloud Run
gcloud run domain-mappings create \
  --service=my-app \
  --domain=myapp.com

# Firebase
firebase hosting:channel:deploy production \
  --only hosting
```

---

## Resources

- Cloud Run: https://cloud.google.com/run/docs
- Firebase: https://firebase.google.com/docs/hosting

---

## Related Skills

- `agents/deployment/SKILL.md` - Vercel deployment
- `agents/database/SKILL.md` - Connect to Cloud SQL
