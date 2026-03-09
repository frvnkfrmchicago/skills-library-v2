---
name: seo
description: Meta tags, structured data, sitemaps, Open Graph, and search optimization.
owner: Frank
last_updated: 2026-03
---

# SEO

Get found.

---

## Context Questions

Before implementing SEO:

1.  **What type of site?** — Blog, SaaS, e-commerce, portfolio
2.  **What's the content strategy?** — Static pages, dynamic content, user-generated
3.  **What's the target audience?** — B2B, B2C, local, international
4.  **What's the current SEO state?** — Greenfield vs optimizing existing
5.  **What's the traffic goal?** — Organic search, social shares, direct links

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Priority** | Basic meta tags ←→ Full SEO strategy |
| **Content** | Static landing pages ←→ Dynamic blog/CMS |
| **Structured Data** | None ←→ Rich snippets (FAQ, Product, Article) |
| **Social** | Basic OG tags ←→ Dynamic OG image generation |
| **Technical** | Manual sitemap ←→ Auto-generated + robots.txt |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| SaaS landing page | Static metadata + Organization schema + OG images |
| Blog/content site | Dynamic metadata + Article schema + sitemap |
| E-commerce | Product schema + dynamic OG + full sitemap |
| Portfolio | Basic metadata + social cards |
| International | hreflang + canonical URLs per locale |
| Dynamic content | generateMetadata + dynamic OG images |

---

## TL;DR

| Element | Purpose |
|---------|---------|
| **Title tag** | Page title in search results |
| **Meta description** | Snippet under title |
| **Open Graph** | Social media previews |
| **Structured data** | Rich snippets in search |
| **Sitemap** | Help search engines find pages |
| **robots.txt** | Control what gets indexed |

---

## Next.js Metadata

### Static Metadata

```typescript
// app/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home | My App',
  description: 'Build amazing apps faster with AI-powered tools.',
  keywords: ['app builder', 'AI', 'development'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Company',
  publisher: 'Your Company',
  
  // Open Graph
  openGraph: {
    title: 'My App - Build Faster',
    description: 'Build amazing apps faster with AI-powered tools.',
    url: 'https://myapp.com',
    siteName: 'My App',
    images: [
      {
        url: 'https://myapp.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'My App Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'My App - Build Faster',
    description: 'Build amazing apps faster with AI-powered tools.',
    images: ['https://myapp.com/twitter-image.png'],
    creator: '@yourhandle',
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification
  verification: {
    google: 'google-verification-code',
  },
}
```

### Dynamic Metadata

```typescript
// app/blog/[slug]/page.tsx
import { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: `${post.title} | Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  }
}
```

### Layout Metadata (Inherited)

```typescript
// app/layout.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://myapp.com'),
  title: {
    default: 'My App',
    template: '%s | My App', // Pages become "Page Title | My App"
  },
  description: 'Default description for the app',
}
```

---

## Open Graph Images

### Static OG Image

Place in `/app/opengraph-image.png` (1200x630px)

### Dynamic OG Image

```typescript
// app/og/route.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'My App'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          padding: 48,
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#94a3b8',
            marginTop: 24,
          }}
        >
          myapp.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
```

```typescript
// Usage in page metadata
openGraph: {
  images: [`/og?title=${encodeURIComponent(post.title)}`],
}
```

---

## Structured Data (JSON-LD)

### Organization

```typescript
// components/StructuredData.tsx
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Your Company',
    url: 'https://myapp.com',
    logo: 'https://myapp.com/logo.png',
    sameAs: [
      'https://twitter.com/yourcompany',
      'https://linkedin.com/company/yourcompany',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### Article/Blog Post

```typescript
export function ArticleSchema({ post }: { post: Post }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: post.author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Your Company',
      logo: {
        '@type': 'ImageObject',
        url: 'https://myapp.com/logo.png',
      },
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### Product

```typescript
export function ProductSchema({ product }: { product: Product }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: product.inStock 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    } : undefined,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### SaaS/Software Application

```typescript
export function SoftwareSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'My App',
    operatingSystem: 'Web',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### FAQ

```typescript
export function FAQSchema({ faqs }: { faqs: FAQ[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

---

## Sitemap

### Static Sitemap

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://myapp.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://myapp.com/pricing',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://myapp.com/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ]
}
```

### Dynamic Sitemap

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://myapp.com'
  
  // Static pages
  const staticPages = [
    { url: baseUrl, priority: 1 },
    { url: `${baseUrl}/pricing`, priority: 0.8 },
    { url: `${baseUrl}/about`, priority: 0.5 },
  ]
  
  // Dynamic pages (blog posts)
  const posts = await getAllPosts()
  const blogPages = posts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))
  
  // Dynamic pages (products)
  const products = await getAllProducts()
  const productPages = products.map(product => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    priority: 0.7,
  }))

  return [...staticPages, ...blogPages, ...productPages]
}
```

---

## Robots.txt

```typescript
// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/settings/',
        ],
      },
    ],
    sitemap: 'https://myapp.com/sitemap.xml',
  }
}
```

---

## Canonical URLs

```typescript
// Prevent duplicate content issues
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://myapp.com/page',
    languages: {
      'en-US': 'https://myapp.com/en-US/page',
      'es-ES': 'https://myapp.com/es-ES/page',
    },
  },
}
```

---

## Common Patterns

### Blog Post Page

```typescript
// app/blog/[slug]/page.tsx
import { Metadata } from 'next'
import { ArticleSchema } from '@/components/StructuredData'

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug)
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      images: [post.coverImage],
    },
    alternates: {
      canonical: `https://myapp.com/blog/${params.slug}`,
    },
  }
}

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug)
  
  return (
    <>
      <ArticleSchema post={post} />
      <article>...</article>
    </>
  )
}
```

### Product Page

```typescript
// app/products/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.slug)
  
  return {
    title: `${product.name} - $${product.price}`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      type: 'product',
      images: product.images,
    },
  }
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug)
  
  return (
    <>
      <ProductSchema product={product} />
      <div>...</div>
    </>
  )
}
```

---

## SEO Checklist

### Technical SEO
- [ ] **Title tags** - Unique, under 60 characters
- [ ] **Meta descriptions** - Unique, under 160 characters
- [ ] **Canonical URLs** - Set on all pages
- [ ] **Sitemap** - Generated and submitted
- [ ] **robots.txt** - Configured correctly
- [ ] **Mobile friendly** - Responsive design
- [ ] **Page speed** - Core Web Vitals passing
- [ ] **HTTPS** - SSL certificate active

### Content SEO
- [ ] **Headings** - One H1, logical hierarchy
- [ ] **Images** - Alt text on all images
- [ ] **Internal links** - Connect related content
- [ ] **URL structure** - Clean, readable URLs

### Social SEO
- [ ] **Open Graph** - Title, description, image
- [ ] **Twitter Cards** - summary_large_image
- [ ] **OG Image** - 1200x630px, branded

### Structured Data
- [ ] **Organization** - On homepage
- [ ] **Article** - On blog posts
- [ ] **Product** - On product pages
- [ ] **FAQ** - On FAQ page
- [ ] **Breadcrumbs** - On nested pages

---

## Testing Tools

| Tool | What It Does |
|------|--------------|
| **Google Search Console** | Index status, search performance |
| **Google Rich Results Test** | Validate structured data |
| **PageSpeed Insights** | Core Web Vitals |
| **Facebook Sharing Debugger** | Test Open Graph |
| **Twitter Card Validator** | Test Twitter Cards |
| **Ahrefs/SEMrush** | Keyword research, backlinks |

---

## Prompt Examples

```
"Add SEO metadata to this Next.js page with Open Graph and Twitter cards"

"Create a dynamic sitemap that includes all blog posts and products"

"Add Article structured data to this blog post template"

"Set up dynamic OG image generation for blog posts"

"Configure robots.txt to block admin pages from indexing"
```
