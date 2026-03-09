---
name: pwa
description: Progressive Web App patterns for Next.js. Manifest, service workers, offline support, and installability.
last_updated: 2026-03
owner: Frank
---

# Progressive Web Apps (PWA)

Make your web app installable and work offline.

---

## Context Questions

Before implementing PWA features:

1. **What's the offline need?** — None, basic caching, full offline support
2. **What's the install priority?** — Nice-to-have or core experience
3. **What needs caching?** — Static assets, API responses, user data
4. **Push notifications needed?** — Yes (engagement), No (simpler)
5. **What's the update strategy?** — Aggressive, prompt user, or silent

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Offline** | Cache static ←→ Full offline app |
| **Install** | Optional ←→ Required for core UX |
| **Caching** | Stale-while-revalidate ←→ Network-first |
| **Updates** | Silent ←→ Force update |
| **Complexity** | next-pwa (simple) ←→ Custom SW (full control) |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Quick setup | next-pwa with defaults |
| Need offline | Custom service worker |
| Dynamic content | Network-first or stale-while-revalidate |
| Static marketing site | Cache-first, aggressive caching |
| Engagement-focused | Add push notifications |
| Content changes often | Prompt user for updates |

---

## TL;DR

| Feature | What It Does |
|---------|--------------|
| **Web App Manifest** | Makes app installable |
| **Service Worker** | Enables offline, caching, push notifications |
| **HTTPS** | Required for PWA features |
| **Responsive** | Works on all devices |

---

## Why PWA?

| Benefit | Description |
|---------|-------------|
| Installable | Add to home screen, app drawer |
| Offline | Works without internet |
| Fast | Cached assets load instantly |
| Push Notifications | Re-engage users |
| No App Store | Direct distribution |

---

## Quick Setup with next-pwa

### Install

```bash
pnpm add next-pwa
```

### Configure

```js
// next.config.js
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA({
  // Your Next.js config
});
```

### Create Manifest

```json
// public/manifest.json
{
  "name": "My App",
  "short_name": "MyApp",
  "description": "A description of your app",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Link Manifest

```tsx
// app/layout.tsx
export const metadata = {
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "My App",
  },
};

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

That's it! Build and deploy - your app is now a PWA.

---

## Manual Setup (Without next-pwa)

### 1. Manifest with Next.js App Router

```tsx
// app/manifest.ts
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "My App",
    short_name: "MyApp",
    description: "A description of your app",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
```

### 2. Service Worker

```js
// public/sw.js
const CACHE_NAME = "my-app-v1";
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip API and external requests
  if (event.request.url.includes("/api/") || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match("/offline");
          }
        });
    })
  );
});
```

### 3. Register Service Worker

```tsx
// components/service-worker.tsx
"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registered:", reg.scope))
        .catch((err) => console.log("SW registration failed:", err));
    }
  }, []);

  return null;
}
```

```tsx
// app/layout.tsx
import { ServiceWorkerRegistration } from "@/components/service-worker";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
```

### 4. Offline Page

```tsx
// app/offline/page.tsx
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">You're offline</h1>
        <p className="text-gray-600">Please check your internet connection</p>
      </div>
    </div>
  );
}
```

---

## Caching Strategies

### Stale-While-Revalidate (Best for Most Cases)

```js
// Return cached immediately, update cache in background
event.respondWith(
  caches.open(CACHE_NAME).then((cache) =>
    cache.match(event.request).then((cached) => {
      const fetched = fetch(event.request).then((response) => {
        cache.put(event.request, response.clone());
        return response;
      });
      return cached || fetched;
    })
  )
);
```

### Network First (For Dynamic Content)

```js
// Try network first, fallback to cache
event.respondWith(
  fetch(event.request)
    .then((response) => {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      return response;
    })
    .catch(() => caches.match(event.request))
);
```

### Cache First (For Static Assets)

```js
// Use cache, only fetch if not cached
event.respondWith(
  caches.match(event.request).then((cached) => {
    return cached || fetch(event.request);
  })
);
```

---

## Push Notifications

### Request Permission

```tsx
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });
    
    // Send subscription to your server
    await fetch("/api/push/subscribe", {
      method: "POST",
      body: JSON.stringify(subscription),
    });
  }
}
```

### Handle Push in Service Worker

```js
// sw.js
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  
  event.waitUntil(
    self.registration.showNotification(data.title || "Notification", {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/badge.png",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  if (event.notification.data?.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
```

---

## App Icons

Create these icon sizes:

```
public/icons/
├── icon-72.png
├── icon-96.png
├── icon-128.png
├── icon-144.png
├── icon-152.png
├── icon-192.png   # Required
├── icon-384.png
├── icon-512.png   # Required
└── maskable-512.png  # For adaptive icons
```

Use a tool like [realfavicongenerator.net](https://realfavicongenerator.net) to generate all sizes.

---

## Testing PWA

### Lighthouse Audit

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Check "Progressive Web App"
4. Run audit

### DevTools Application Tab

- View manifest
- Check service worker status
- Test offline mode
- Inspect cache storage

### Install Test

- Look for install button in address bar
- Or: Chrome menu → "Install..."

---

## Common Issues

| Issue | Solution |
|-------|----------|
| SW not updating | Add version to cache name, use skipWaiting |
| Manifest not found | Check path in `<link rel="manifest">` |
| Icons not showing | Ensure correct sizes and paths |
| Not installable | Check HTTPS, manifest, service worker |
| Cache too aggressive | Use network-first for dynamic content |

---

## PWA Checklist

```markdown
## Required
- [ ] HTTPS enabled
- [ ] manifest.json with name, icons, start_url, display
- [ ] Service worker registered
- [ ] 192x192 and 512x512 icons
- [ ] Viewport meta tag

## Recommended
- [ ] Offline page
- [ ] Responsive design
- [ ] Fast loading (<3s)
- [ ] Theme color set
- [ ] Apple touch icon
- [ ] Maskable icon for Android
```

---

## Resources

- Web App Manifest: [web.dev/add-manifest](https://web.dev/add-manifest)
- Service Workers: [web.dev/service-workers-cache-storage](https://web.dev/service-workers-cache-storage)
- next-pwa: [github.com/shadowwalker/next-pwa](https://github.com/shadowwalker/next-pwa)
- PWA Builder: [pwabuilder.com](https://pwabuilder.com)
