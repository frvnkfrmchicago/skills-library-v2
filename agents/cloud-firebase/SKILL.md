---
name: cloud-firebase
description: Firebase and Google Cloud patterns. App Hosting, Firestore, Cloud Storage, and Functions.
last_updated: 2026-03
owner: Frank
---

# Firebase & Google Cloud

Fast deployment with Firebase App Hosting.

---

## Context Questions

Before using Firebase:

1. **What database model?** — NoSQL (Firestore), relational (use Supabase), or hybrid
2. **What's the platform?** — Web, mobile (React Native), or both
3. **Do you need offline support?** — Yes = Firestore, No = either works
4. **What's the auth strategy?** — Firebase Auth, Clerk, or custom
5. **What's the deploy target?** — App Hosting (SSR), Hosting (static), or Functions only

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Database** | Firestore (NoSQL) ←→ Cloud SQL (Postgres) |
| **Hosting** | Static ←→ SSR (App Hosting) ←→ Custom Run |
| **Compute** | Functions (serverless) ←→ Cloud Run (containers) |
| **Complexity** | Firebase-only ←→ Firebase + GCP mix |
| **Offline** | None ←→ Firestore offline ←→ Full sync |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Mobile + offline | Firestore with persistence |
| Quick Next.js deploy | Firebase App Hosting |
| Need SQL/relations | Use Supabase instead |
| Already has Clerk | Skip Firebase Auth |
| Heavy real-time | Firestore real-time listeners |
| Simple static site | Firebase Hosting |

---

## TL;DR

| Service | What It Does |
|---------|--------------|
| **Firebase App Hosting** | Deploy Next.js (SSR on Cloud Run, CDN for static) |
| **Firestore** | NoSQL database |
| **Cloud Storage** | File storage (like S3) |
| **Cloud Functions** | Serverless functions |
| **Authentication** | User auth (or use Clerk) |

---

## Firebase App Hosting (Next.js)

### Why Firebase App Hosting?

- **One command deploy** from GitHub
- **Automatic SSR** via Cloud Run
- **Global CDN** for static assets
- **Preview deployments** per PR
- **Free tier** generous for starting out

### Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize in your Next.js project
firebase init apphosting
```

### Deploy

```bash
# Connect to GitHub (one-time)
firebase apphosting:backends:create

# After that, every push to main auto-deploys
git push origin main
```

### Environment Variables

```yaml
# apphosting.yaml
env:
  - variable: DATABASE_URL
    secret: DATABASE_URL  # Stored in Cloud Secret Manager
  - variable: NEXT_PUBLIC_API_URL
    value: https://api.example.com
```

```bash
# Set secrets via CLI
firebase apphosting:secrets:set DATABASE_URL
# Enter value when prompted
```

---

## Cloud Storage (File Uploads)

### Setup

```bash
npm install firebase-admin
```

```typescript
// lib/firebase-admin.ts
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  });
}

export const storage = getStorage().bucket();
```

### Upload Files

```typescript
// lib/storage.ts
import { storage } from "./firebase-admin";

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const file = storage.file(`uploads/${Date.now()}-${filename}`);
  
  await file.save(buffer, {
    metadata: { contentType },
  });

  await file.makePublic();
  
  return file.publicUrl();
}

// Generate signed URL for private files
export async function getSignedUrl(filepath: string): Promise<string> {
  const file = storage.file(filepath);
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 60 * 60 * 1000, // 1 hour
  });
  return url;
}
```

### Upload API Route

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadFile(buffer, file.name, file.type);
  
  return NextResponse.json({ url });
}
```

---

## Firestore (Database)

### When to Use vs Supabase

| Firestore | Supabase |
|-----------|----------|
| NoSQL (flexible schema) | PostgreSQL (relational) |
| Better offline support | Better for complex queries |
| Deep Firebase integration | Prisma-friendly |
| Real-time built-in | Real-time with setup |

### Setup

```typescript
// lib/firestore.ts
import { getFirestore } from "firebase-admin/firestore";
import "./firebase-admin"; // Initialize first

export const db = getFirestore();
```

### CRUD Operations

```typescript
import { db } from "@/lib/firestore";

// Create
async function createUser(data: { name: string; email: string }) {
  const ref = await db.collection("users").add({
    ...data,
    createdAt: new Date(),
  });
  return ref.id;
}

// Read one
async function getUser(id: string) {
  const doc = await db.collection("users").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

// Read many
async function getUsers() {
  const snapshot = await db.collection("users").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Update
async function updateUser(id: string, data: Partial<User>) {
  await db.collection("users").doc(id).update(data);
}

// Delete
async function deleteUser(id: string) {
  await db.collection("users").doc(id).delete();
}

// Query
async function getUsersByRole(role: string) {
  const snapshot = await db
    .collection("users")
    .where("role", "==", role)
    .orderBy("createdAt", "desc")
    .limit(10)
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

---

## Cloud Functions

### When to Use

- Background processing
- Scheduled tasks (crons)
- Firestore triggers
- Webhooks

### Setup

```bash
firebase init functions
cd functions
npm install
```

### HTTP Function

```typescript
// functions/src/index.ts
import * as functions from "firebase-functions";

export const helloWorld = functions.https.onRequest((req, res) => {
  res.json({ message: "Hello from Firebase!" });
});
```

### Firestore Trigger

```typescript
export const onUserCreate = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snapshot, context) => {
    const user = snapshot.data();
    
    // Send welcome email
    await sendWelcomeEmail(user.email);
    
    // Update user count
    await db.doc("stats/users").update({
      count: FieldValue.increment(1),
    });
  });
```

### Scheduled Function (Cron)

```typescript
export const dailyCleanup = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async () => {
    // Delete old sessions
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    
    const oldSessions = await db
      .collection("sessions")
      .where("createdAt", "<", cutoff)
      .get();
    
    const batch = db.batch();
    oldSessions.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  });
```

### Deploy Functions

```bash
firebase deploy --only functions
```

---

## Authentication (Optional)

If not using Clerk, Firebase Auth is built-in:

```typescript
// Client-side
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const auth = getAuth();
const provider = new GoogleAuthProvider();

async function signIn() {
  const result = await signInWithPopup(auth, provider);
  return result.user;
}
```

---

## Firebase vs Supabase Decision

| Choose Firebase When | Choose Supabase When |
|---------------------|---------------------|
| Need offline-first mobile | Need SQL/relations |
| Heavy real-time needs | Using Prisma |
| Already on Google Cloud | Need PostgreSQL extensions |
| Want no-config hosting | Prefer open source |

---

## Project Structure

```
my-app/
├── app/                    # Next.js app
├── lib/
│   ├── firebase-admin.ts   # Server-side Firebase
│   ├── firestore.ts        # Database operations
│   └── storage.ts          # File operations
├── functions/              # Cloud Functions (optional)
│   └── src/
│       └── index.ts
├── firebase.json           # Firebase config
├── apphosting.yaml         # App Hosting config
└── .firebaserc            # Project alias
```

---

## Quick Commands

```bash
# Login
firebase login

# Initialize App Hosting
firebase init apphosting

# Create backend (connects to GitHub)
firebase apphosting:backends:create

# Set secret
firebase apphosting:secrets:set SECRET_NAME

# Deploy functions only
firebase deploy --only functions

# View logs
firebase apphosting:backends:logs

# Emulate locally
firebase emulators:start
```

---

## Resources

- Firebase App Hosting: [firebase.google.com/docs/app-hosting](https://firebase.google.com/docs/app-hosting)
- Firestore: [firebase.google.com/docs/firestore](https://firebase.google.com/docs/firestore)
- Cloud Functions: [firebase.google.com/docs/functions](https://firebase.google.com/docs/functions)
