# PWA Configuration

## When to PWA

```
Users return repeatedly → YES
Works offline / poor connection → YES
Needs home screen icon → YES
Push notifications needed → YES
Simple marketing page → NO
Needs native camera/NFC/Bluetooth → NO (use Expo)
```

---

## Manifest

```json
{
  "name": "App Name",
  "short_name": "App",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#060b14",
  "background_color": "#060b14",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

## HTML Head Tags

```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#060b14">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/icon-192.png">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

---

## Service Worker Strategy

### Cache-First (static assets)
Good for: fonts, icons, CSS, JS bundles. Serve from cache, update in background.

### Network-First (API data)
Good for: API responses, user data. Try network, fall back to cache.

### Stale-While-Revalidate (semi-dynamic)
Good for: blog posts, product listings. Serve cached immediately, refresh in background.

### Workbox (recommended for Next.js/Vite)

```bash
npm install workbox-webpack-plugin  # Next.js
npm install vite-plugin-pwa         # Vite
```

For Vite:
```ts
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: { /* manifest config */ },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 300 } }
          }
        ]
      }
    })
  ]
})
```

---

## Offline UX

- Show clear offline indicator (banner or toast)
- Queue form submissions and sync when reconnected
- Cache critical pages for offline access
- Never show a blank white screen — always show cached content or a meaningful offline page

---

## Install Prompt

```tsx
// Capture the beforeinstallprompt event
const [installPrompt, setInstallPrompt] = useState<any>(null);

useEffect(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    setInstallPrompt(e);
  });
}, []);

const handleInstall = async () => {
  if (installPrompt) {
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') setInstallPrompt(null);
  }
};
```

Show install button only when `installPrompt` is available. Do not show on iOS Safari (use instructions modal instead — iOS does not support `beforeinstallprompt`).
