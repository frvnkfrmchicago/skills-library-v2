---
name: cms-integration
description: Headless CMS integration patterns. Sanity, Contentful, Payload. Content modeling, preview mode, revalidation.
last_updated: 2026-03
owner: Frank
---

# CMS Integration

Headless content management for dynamic sites.

## TL;DR

| CMS | Best For | Pricing | Complexity |
|-----|----------|---------|------------|
| **Sanity** | Flexibility, custom schemas | Free tier + usage | Medium |
| **Contentful** | Enterprise, structured content | Paid (expensive) | Low |
| **Payload** | Self-hosted, full control | Open source | High |

**Default choice:** Sanity (best DX, generous free tier)

---

## Context Questions

Before choosing a CMS:

1. **Who edits content?** — Developers, marketers, clients?
2. **Content complexity?** — Simple blog vs rich page builder?
3. **Self-hosted requirement?** — Data sovereignty needs?
4. **Budget?** — Enterprise budget or free tier?
5. **Preview needs?** — Live preview before publish?

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Hosting** | SaaS (Sanity) ←→ Self-hosted (Payload) |
| **Flexibility** | Structured (Contentful) ←→ Flexible (Sanity) |
| **Cost** | Free tier ←→ Enterprise pricing |
| **Complexity** | Simple blog ←→ Full page builder |
| **Control** | Managed ←→ Full code control |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Quick blog setup | Sanity (best DX, free tier) |
| Enterprise budget | Contentful (structured, enterprise) |
| Full control needed | Payload (self-hosted, open source) |
| Marketing team users | Sanity (good UI) |
| Complex page builder | Sanity sections + arrays |
| Static content | MDX files (no CMS needed) |

---

## Sanity Setup

### Install

```bash
# In your Next.js project
npm install next-sanity @sanity/image-url

# Create Sanity studio (in project or separate)
npm create sanity@latest -- --template clean --create-project "My Project" --dataset production
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=sk_... # For preview/mutations
```

### Sanity Client

```typescript
// lib/sanity/client.ts
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
})

// For preview mode
export const previewClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})
```

---

## Content Schemas

### Blog Post Schema

```typescript
// sanity/schemas/post.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent', // Portable Text
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
  ],
  preview: {
    select: { title: 'title', author: 'author.name', media: 'mainImage' },
  },
})
```

### Page Schema (Flexible)

```typescript
// sanity/schemas/page.ts
export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
    defineField({
      name: 'sections',
      title: 'Page Sections',
      type: 'array',
      of: [
        { type: 'hero' },
        { type: 'features' },
        { type: 'testimonials' },
        { type: 'cta' },
      ],
    }),
  ],
})
```

---

## GROQ Queries

### Fetch All Posts

```typescript
// lib/sanity/queries.ts
export const postsQuery = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  "excerpt": pt::text(body)[0...200],
  mainImage {
    asset-> { url }
  }
}`

export const postBySlugQuery = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  publishedAt,
  body,
  mainImage {
    asset-> { url, metadata { dimensions } }
  },
  author-> { name, image { asset-> { url } } }
}`
```

### Use in Pages

```typescript
// app/blog/page.tsx
import { client } from '@/lib/sanity/client'
import { postsQuery } from '@/lib/sanity/queries'

export default async function BlogPage() {
  const posts = await client.fetch(postsQuery)

  return (
    <div className="grid gap-6">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  )
}
```

---

## Preview Mode

### Setup Preview Route

```typescript
// app/api/preview/route.ts
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const secret = searchParams.get('secret')

  if (secret !== process.env.SANITY_PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  draftMode().enable()
  redirect(slug || '/')
}

// app/api/exit-preview/route.ts
export async function GET() {
  draftMode().disable()
  redirect('/')
}
```

### Preview-Aware Fetching

```typescript
// lib/sanity/fetch.ts
import { draftMode } from 'next/headers'
import { client, previewClient } from './client'

export async function sanityFetch<T>(query: string, params = {}): Promise<T> {
  const { isEnabled } = draftMode()
  const sanityClient = isEnabled ? previewClient : client

  return sanityClient.fetch<T>(query, params, {
    next: { revalidate: isEnabled ? 0 : 60 },
  })
}
```

---

## Revalidation (On-Demand)

### Webhook Handler

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Verify webhook signature (Sanity sends this)
  const signature = req.headers.get('sanity-webhook-signature')
  // Validate signature...

  const { _type, slug } = body

  switch (_type) {
    case 'post':
      revalidatePath('/blog')
      if (slug?.current) revalidatePath(`/blog/${slug.current}`)
      break
    case 'page':
      if (slug?.current) revalidatePath(`/${slug.current}`)
      break
    default:
      revalidateTag('sanity')
  }

  return NextResponse.json({ revalidated: true })
}
```

### Sanity Webhook Setup

1. Go to sanity.io/manage → Your Project → API → Webhooks
2. Add webhook: `https://yoursite.com/api/revalidate`
3. Trigger on: Create, Update, Delete
4. Filter: `_type in ["post", "page"]`

---

## Image Handling

```typescript
// lib/sanity/image.ts
import imageUrlBuilder from '@sanity/image-url'
import { client } from './client'

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

// Usage in component
<img
  src={urlFor(post.mainImage).width(800).height(400).url()}
  alt={post.title}
/>
```

---

## Checklist

- [ ] Sanity project created
- [ ] Schemas defined
- [ ] Client configured
- [ ] Queries written
- [ ] Preview mode working
- [ ] Revalidation webhook set up
- [ ] Images optimized

---

## Resources

- **Sanity Docs:** https://www.sanity.io/docs
- **GROQ Cheat Sheet:** https://www.sanity.io/docs/groq-cheat-sheet
- **next-sanity:** https://github.com/sanity-io/next-sanity

---

## Related Skills

- `agents/seo/SKILL.md` - SEO for dynamic content
- `app-types/landing/SKILL.md` - Landing pages with CMS
- `agents/deployment/SKILL.md` - Deploy with preview
