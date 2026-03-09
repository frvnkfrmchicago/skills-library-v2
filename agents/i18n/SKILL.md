---
name: i18n
description: Internationalization for Next.js. next-intl, routing, translations, and locale detection.
last_updated: 2026-03
owner: Frank
---

# Internationalization (i18n)

Multi-language support for global apps.

---

## Context Questions

Before adding internationalization:

1. **Who's the audience?** — Single region, multi-region, global
2. **How many languages?** — 2-3 (manual), 10+ (translation platform)
3. **Who translates?** — Developer, in-house translator, service
4. **What needs translation?** — UI only, content/CMS, legal
5. **What's the URL strategy?** — Subdomain, path prefix, query param

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Languages** | 2-3 (simple) ←→ 10+ (complex) |
| **Management** | JSON files ←→ Crowdin/Lokalise |
| **Routing** | as-needed ←→ always prefix |
| **Content** | Static ←→ CMS-driven |
| **SEO** | Basic hreflang ←→ Full localized sitemap |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| MVP/English-only | Skip i18n for now |
| 2-3 languages | Manual JSON files |
| 10+ languages | Crowdin/Lokalise for management |
| Marketing site | Localized routing, SEO meta |
| SaaS app | User preference stored, lazy load |
| RTL languages | Test layout, use logical properties |

---

## TL;DR

| Library | Best For |
|---------|----------|
| **next-intl** | App Router, full-featured |
| **next-i18next** | Pages Router (legacy) |
| **Crowdin/Lokalise** | Translation management |

---

## When to Use

| Need i18n | Skip i18n |
|-----------|-----------|
| Users in multiple countries | English-only audience |
| Legal requirements (GDPR, etc.) | MVP/prototype |
| Partner with localized content | Simple landing page |

---

## Quick Setup with next-intl

### Install

```bash
pnpm add next-intl
```

### Project Structure

```
app/
├── [locale]/              # Dynamic locale segment
│   ├── layout.tsx
│   ├── page.tsx
│   └── about/
│       └── page.tsx
├── globals.css
messages/
├── en.json                # English translations
├── es.json                # Spanish translations
├── fr.json                # French translations
└── de.json                # German translations
i18n.ts                    # Config
middleware.ts              # Locale detection
```

### Configuration

```typescript
// i18n.ts
import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "es", "fr", "de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}));
```

### Middleware

```typescript
// middleware.ts
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed", // Only add prefix for non-default locale
});

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api, /_next, /_vercel, /static, etc.
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
```

### Next.js Config

```js
// next.config.js
const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin();

module.exports = withNextIntl({
  // Your Next.js config
});
```

---

## Translation Files

### Structure

```json
// messages/en.json
{
  "common": {
    "welcome": "Welcome",
    "signIn": "Sign In",
    "signOut": "Sign Out"
  },
  "home": {
    "title": "Welcome to our app",
    "description": "The best way to manage your projects"
  },
  "errors": {
    "notFound": "Page not found",
    "serverError": "Something went wrong"
  }
}
```

```json
// messages/es.json
{
  "common": {
    "welcome": "Bienvenido",
    "signIn": "Iniciar sesión",
    "signOut": "Cerrar sesión"
  },
  "home": {
    "title": "Bienvenido a nuestra aplicación",
    "description": "La mejor manera de gestionar tus proyectos"
  },
  "errors": {
    "notFound": "Página no encontrada",
    "serverError": "Algo salió mal"
  }
}
```

### With Variables

```json
// messages/en.json
{
  "greeting": "Hello, {name}!",
  "items": "You have {count, plural, =0 {no items} =1 {one item} other {# items}}"
}
```

---

## Using Translations

### Layout

```tsx
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Server Components

```tsx
// app/[locale]/page.tsx
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
    </div>
  );
}
```

### Client Components

```tsx
"use client";

import { useTranslations } from "next-intl";

export function WelcomeMessage({ name }: { name: string }) {
  const t = useTranslations();

  return <p>{t("greeting", { name })}</p>;
}
```

### With Variables

```tsx
const t = useTranslations();

// Simple variable
t("greeting", { name: "John" });  // "Hello, John!"

// Plural
t("items", { count: 5 });  // "You have 5 items"
```

---

## Language Switcher

```tsx
"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next-intl/client";
import { locales } from "@/i18n";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const changeLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <select value={locale} onChange={(e) => changeLocale(e.target.value)}>
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {loc.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
```

### Fancy Language Picker

```tsx
"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next-intl/client";

const languages = {
  en: { name: "English", flag: "🇺🇸" },
  es: { name: "Español", flag: "🇪🇸" },
  fr: { name: "Français", flag: "🇫🇷" },
  de: { name: "Deutsch", flag: "🇩🇪" },
};

export function LanguagePicker() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex gap-2">
      {Object.entries(languages).map(([code, { name, flag }]) => (
        <button
          key={code}
          onClick={() => router.replace(pathname, { locale: code })}
          className={`px-3 py-1 rounded ${
            locale === code ? "bg-blue-500 text-white" : "bg-gray-100"
          }`}
        >
          {flag} {name}
        </button>
      ))}
    </div>
  );
}
```

---

## Localized Routing

### Link Component

```tsx
import { Link } from "next-intl/client";

// Automatically uses current locale
<Link href="/about">About</Link>

// Explicitly set locale
<Link href="/about" locale="es">About (Spanish)</Link>
```

### Dynamic Routes

```tsx
// app/[locale]/posts/[slug]/page.tsx
import { useTranslations } from "next-intl";

export default function PostPage({ 
  params: { locale, slug } 
}: { 
  params: { locale: string; slug: string } 
}) {
  const t = useTranslations("post");
  
  return (
    <article>
      {/* Content */}
    </article>
  );
}
```

---

## Date & Number Formatting

```tsx
import { useFormatter } from "next-intl";

export function DateDisplay({ date }: { date: Date }) {
  const format = useFormatter();

  return (
    <div>
      {/* Date: "December 25, 2024" in English, "25 de diciembre de 2024" in Spanish */}
      <p>{format.dateTime(date, { dateStyle: "long" })}</p>

      {/* Relative: "2 days ago" */}
      <p>{format.relativeTime(date)}</p>

      {/* Number: "1,234.56" in English, "1.234,56" in German */}
      <p>{format.number(1234.56, { style: "currency", currency: "USD" })}</p>
    </div>
  );
}
```

---

## Metadata

```tsx
// app/[locale]/page.tsx
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ 
  params: { locale } 
}: { 
  params: { locale: string } 
}) {
  const t = await getTranslations({ locale, namespace: "home" });

  return {
    title: t("title"),
    description: t("description"),
  };
}
```

---

## Static Generation

```tsx
// app/[locale]/page.tsx
import { locales } from "@/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
```

---

## Translation Workflow

### 1. Extract Strings

Use a consistent key structure:
- `namespace.key`
- `feature.component.element`

### 2. Translation Management

For teams/larger projects, use:

| Tool | Features |
|------|----------|
| **Crowdin** | Crowdsourced, GitHub sync |
| **Lokalise** | Professional translation |
| **Phrase** | Enterprise features |

### 3. Sync Workflow

```bash
# Extract strings to base language
# (Manual or use a tool like i18next-parser)

# Upload to translation platform
# Translators work on platform
# Download translated files

# Commit to repo
git add messages/
git commit -m "Update translations"
```

---

## Best Practices

| Practice | Why |
|----------|-----|
| Use namespaces | Organize by feature/page |
| Include context | Help translators understand usage |
| Handle plurals | `{count, plural, ...}` |
| Format dates/numbers | Respect locale conventions |
| Lazy load | Only load needed translations |
| Test in RTL | Arabic, Hebrew need testing |

---

## Common Patterns

### Fallback

```typescript
// i18n.ts
export default getRequestConfig(async ({ locale }) => ({
  messages: {
    ...(await import(`./messages/en.json`)).default,    // Fallback
    ...(await import(`./messages/${locale}.json`)).default, // Override
  },
}));
```

### Type Safety

```typescript
// global.d.ts
import en from "./messages/en.json";

type Messages = typeof en;

declare global {
  interface IntlMessages extends Messages {}
}
```

---

## Resources

- next-intl: [next-intl.dev](https://next-intl.dev)
- ICU Message Format: [formatjs.io/docs/intl-messageformat](https://formatjs.io/docs/intl-messageformat)
- Crowdin: [crowdin.com](https://crowdin.com)
