---
name: creator-platform
description: Build apps for content creators. Monetization, audience management, multi-platform publishing, brand deals.
last_updated: 2026-03
---

# Creator Platform Blueprint

Build apps FOR content creators—tools, platforms, marketplaces.

> **See also:** `content/brand-deals/SKILL.md` for brand deals, `agents/stripe/SKILL.md` for payments

---

## TL;DR

| Category | Examples |
|----------|----------|
| **Link-in-bio** | Linktree, Beacons, Bio.fm |
| **Memberships** | Patreon, Buy Me a Coffee, Ko-fi |
| **Courses** | Teachable, Podia, Gumroad |
| **All-in-one** | Kajabi, Circle, Mighty Networks |
| **Analytics** | Metricool, Sprout Social |

---

## Part 1: Core Features

### Audience Management

```typescript
// Fan CRM schema
interface Creator {
  id: string
  name: string
  platforms: PlatformConnection[]
  tiers: MembershipTier[]
}

interface Fan {
  id: string
  email: string
  tier: 'free' | 'supporter' | 'vip'
  platforms: {
    tiktok?: string
    instagram?: string
    youtube?: string
    twitch?: string
  }
  engagementScore: number
  lifetimeValue: number
  joinedAt: Date
  lastActiveAt: Date
}

interface MembershipTier {
  id: string
  name: string
  price: number // monthly
  benefits: string[]
  stripePriceId: string
}
```

**Key features:**
- Fan database with cross-platform identity
- Segmentation (super fans, casuals, free followers)
- Engagement scoring
- Lifetime value tracking
- Communication tools (email, DM templates)

### Monetization

```typescript
// Revenue streams
interface CreatorRevenue {
  direct: {
    subscriptions: number      // Patreon-style tiers
    digitalProducts: number    // Courses, templates, presets
    tips: number               // Buy Me a Coffee model
    exclusiveContent: number   // Pay-per-view
  }
  indirect: {
    brandDeals: number         // Sponsorships
    affiliates: number         // Commission on sales
    platformPayouts: number    // AdSense, Creator Fund
  }
}

// Monetization config
const MONETIZATION_CONFIG = {
  subscriptions: {
    tiers: [
      { name: 'Supporter', price: 5, benefits: ['Discord access', 'Monthly Q&A'] },
      { name: 'VIP', price: 15, benefits: ['All above', '1:1 monthly call', 'Early access'] },
      { name: 'Inner Circle', price: 50, benefits: ['All above', 'Private community', 'Course access'] },
    ],
    platformFee: 0.05, // 5% platform cut
  },
  digitalProducts: {
    types: ['course', 'template', 'preset', 'ebook', 'coaching'],
    deliveryMethod: 'instant_download' | 'drip' | 'live',
  },
  tips: {
    minAmount: 3,
    suggestedAmounts: [5, 10, 25, 50],
    message: true, // Allow thank-you messages
  },
}
```

**Platform-specific payouts:**
- TikTok Creator Fund (CPM varies by region)
- YouTube AdSense (~$3-5 CPM)
- Twitch subs (50% to creator, 70% if Partner)
- Instagram/Facebook bonuses (invite-only)
- LinkedIn Creator Accelerator (application-based)

### Content Management

```typescript
// Multi-platform publishing
interface ScheduledPost {
  id: string
  creatorId: string
  content: {
    text: string
    media: MediaAsset[]
    hashtags: string[]
  }
  platforms: {
    platform: 'tiktok' | 'instagram' | 'youtube' | 'linkedin' | 'twitter'
    scheduledAt: Date
    status: 'scheduled' | 'published' | 'failed'
    postId?: string
  }[]
}

interface ContentCalendar {
  creatorId: string
  posts: ScheduledPost[]
  templates: PostTemplate[]
  assetLibrary: MediaAsset[]
}
```

**Key features:**
- Multi-platform scheduling
- Content calendar with drag-and-drop
- Asset library (templates, music, stock)
- Collaboration tools (team, editor access)
- Approval workflows

### Analytics Dashboard

```typescript
// Cross-platform metrics aggregation
interface CreatorAnalytics {
  overview: {
    totalFollowers: number
    totalEngagement: number
    totalRevenue: number
    growthRate: number // % change
  }
  byPlatform: {
    [platform: string]: {
      followers: number
      views: number
      engagement: number
      revenue: number
    }
  }
  topContent: {
    postId: string
    platform: string
    views: number
    engagement: number
  }[]
  audienceInsights: {
    demographics: {
      age: Record<string, number>
      gender: Record<string, number>
      location: Record<string, number>
    }
    activeHours: number[] // 0-23
    bestDays: string[]
  }
}
```

---

## Part 2: Tech Stack 2025-2026

### Frontend

```bash
# Create Next.js 16.1.1 app
npx create-next-app@latest creator-platform --typescript --tailwind --app

# UI components
npx shadcn@latest init
npx shadcn@latest add button card dialog form input table tabs chart

# Additional packages
npm install @tanstack/react-query zustand react-hook-form zod
npm install @hello-pangea/dnd # Drag and drop for calendar
npm install date-fns recharts # Charts and dates
```

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ClerkProvider>
  )
}
```

### Backend

```bash
# Supabase for everything
npx supabase init
npx supabase start

# Or Prisma + PostgreSQL
npm install prisma @prisma/client
npx prisma init
```

```typescript
// Database schema (Prisma)
model Creator {
  id            String   @id @default(cuid())
  clerkId       String   @unique
  name          String
  email         String   @unique
  stripeAccountId String?

  platforms     PlatformConnection[]
  tiers         MembershipTier[]
  fans          Fan[]
  posts         ScheduledPost[]
  products      DigitalProduct[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model PlatformConnection {
  id            String   @id @default(cuid())
  creatorId     String
  platform      String   // tiktok, instagram, youtube, twitch, linkedin
  accessToken   String
  refreshToken  String?
  expiresAt     DateTime?
  platformUserId String
  platformUsername String

  creator       Creator  @relation(fields: [creatorId], references: [id])

  @@unique([creatorId, platform])
}

model Fan {
  id            String   @id @default(cuid())
  creatorId     String
  email         String
  tierId        String?
  stripeCustomerId String?

  creator       Creator  @relation(fields: [creatorId], references: [id])
  tier          MembershipTier? @relation(fields: [tierId], references: [id])

  @@unique([creatorId, email])
}

model MembershipTier {
  id            String   @id @default(cuid())
  creatorId     String
  name          String
  price         Int      // cents
  benefits      String[]
  stripePriceId String

  creator       Creator  @relation(fields: [creatorId], references: [id])
  fans          Fan[]
}
```

### Payments (Stripe Connect)

```typescript
// lib/stripe.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Onboard creator to Stripe Connect
export async function onboardCreator(creatorId: string, email: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    metadata: { creatorId },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/settings?refresh=true`,
    return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/settings?success=true`,
    type: 'account_onboarding',
  })

  return { accountId: account.id, onboardingUrl: accountLink.url }
}

// Create subscription for fan
export async function createFanSubscription(
  fanEmail: string,
  creatorStripeAccountId: string,
  priceId: string,
  platformFeePercent: number = 5
) {
  // Create or get customer
  const customers = await stripe.customers.list({ email: fanEmail, limit: 1 })
  let customer = customers.data[0]

  if (!customer) {
    customer = await stripe.customers.create({ email: fanEmail })
  }

  // Create subscription with platform fee
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    application_fee_percent: platformFeePercent,
    transfer_data: {
      destination: creatorStripeAccountId,
    },
  })

  return subscription
}

// Handle payouts
export async function getCreatorBalance(stripeAccountId: string) {
  const balance = await stripe.balance.retrieve({
    stripeAccount: stripeAccountId,
  })

  return {
    available: balance.available[0]?.amount || 0,
    pending: balance.pending[0]?.amount || 0,
  }
}
```

### Email (Resend)

```typescript
// lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(fan: { email: string; name: string }, creator: { name: string }) {
  await resend.emails.send({
    from: `${creator.name} <hello@yourdomain.com>`,
    to: fan.email,
    subject: `Welcome to ${creator.name}'s community!`,
    html: `
      <h1>Welcome, ${fan.name}!</h1>
      <p>Thanks for joining ${creator.name}'s community.</p>
      <p>Here's what you get access to:</p>
      <ul>
        <li>Exclusive content</li>
        <li>Discord community</li>
        <li>Monthly Q&A sessions</li>
      </ul>
    `,
  })
}

export async function sendNewPostNotification(
  fans: { email: string }[],
  post: { title: string; url: string },
  creator: { name: string }
) {
  const emails = fans.map(fan => fan.email)

  await resend.batch.send(
    emails.map(email => ({
      from: `${creator.name} <hello@yourdomain.com>`,
      to: email,
      subject: `New post from ${creator.name}: ${post.title}`,
      html: `<a href="${post.url}">Check out the new post</a>`,
    }))
  )
}
```

### Storage (Cloudflare R2)

```typescript
// lib/storage.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function uploadAsset(file: Buffer, key: string, contentType: string) {
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType,
  }))

  return `${process.env.R2_PUBLIC_URL}/${key}`
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
  })

  return getSignedUrl(r2, command, { expiresIn })
}
```

---

## Part 3: Platform API Integrations

### TikTok API

```typescript
// lib/platforms/tiktok.ts
interface TikTokTokens {
  accessToken: string
  refreshToken: string
  expiresAt: Date
}

export class TikTokAPI {
  private baseUrl = 'https://open.tiktokapis.com/v2'

  constructor(private tokens: TikTokTokens) {}

  // Refresh tokens before they expire
  async refreshIfNeeded() {
    if (new Date() >= this.tokens.expiresAt) {
      const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_key: process.env.TIKTOK_CLIENT_KEY!,
          client_secret: process.env.TIKTOK_CLIENT_SECRET!,
          grant_type: 'refresh_token',
          refresh_token: this.tokens.refreshToken,
        }),
      })

      const data = await response.json()
      this.tokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      }

      return this.tokens // Save to database
    }
  }

  // Get user info
  async getUserInfo() {
    await this.refreshIfNeeded()

    const response = await fetch(`${this.baseUrl}/user/info/?fields=open_id,display_name,avatar_url,follower_count`, {
      headers: { Authorization: `Bearer ${this.tokens.accessToken}` },
    })

    return response.json()
  }

  // Get video analytics
  async getVideoAnalytics(videoIds: string[]) {
    await this.refreshIfNeeded()

    const response = await fetch(`${this.baseUrl}/video/query/?fields=id,title,view_count,like_count,comment_count,share_count`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filters: { video_ids: videoIds } }),
    })

    return response.json()
  }
}

// Rate limiting: TikTok has strict limits
// - 100 requests per minute for most endpoints
// - Use queue system for batch operations
```

### Instagram Graph API

```typescript
// lib/platforms/instagram.ts
export class InstagramAPI {
  private baseUrl = 'https://graph.facebook.com/v18.0'

  constructor(
    private accessToken: string,
    private igUserId: string
  ) {}

  // Get account insights
  async getInsights(metric: string, period: 'day' | 'week' | 'month' = 'day') {
    const response = await fetch(
      `${this.baseUrl}/${this.igUserId}/insights?metric=${metric}&period=${period}&access_token=${this.accessToken}`
    )

    return response.json()
  }

  // Get media insights
  async getMediaInsights(mediaId: string) {
    const response = await fetch(
      `${this.baseUrl}/${mediaId}/insights?metric=impressions,reach,engagement,saved&access_token=${this.accessToken}`
    )

    return response.json()
  }

  // Schedule a post (requires Business/Creator account)
  async createMediaContainer(imageUrl: string, caption: string) {
    const response = await fetch(`${this.baseUrl}/${this.igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: this.accessToken,
      }),
    })

    return response.json() // Returns container ID
  }

  async publishMedia(containerId: string) {
    const response = await fetch(`${this.baseUrl}/${this.igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: this.accessToken,
      }),
    })

    return response.json()
  }
}

// Rate limiting: 200 calls per user per hour
// App review required for publishing
```

### YouTube Data API

```typescript
// lib/platforms/youtube.ts
import { google } from 'googleapis'

export class YouTubeAPI {
  private youtube

  constructor(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })

    this.youtube = google.youtube({ version: 'v3', auth: oauth2Client })
  }

  // Get channel stats
  async getChannelStats() {
    const response = await this.youtube.channels.list({
      part: ['statistics', 'snippet'],
      mine: true,
    })

    return response.data.items?.[0]
  }

  // Get video analytics
  async getVideoStats(videoId: string) {
    const response = await this.youtube.videos.list({
      part: ['statistics', 'snippet'],
      id: [videoId],
    })

    return response.data.items?.[0]
  }

  // Get recent videos
  async getRecentVideos(maxResults = 10) {
    const response = await this.youtube.search.list({
      part: ['snippet'],
      forMine: true,
      type: ['video'],
      order: 'date',
      maxResults,
    })

    return response.data.items
  }
}

// Quota system: 10,000 units per day
// Read operations: 1-3 units
// Write operations: 50-1600 units
```

### Twitch API

```typescript
// lib/platforms/twitch.ts
export class TwitchAPI {
  private baseUrl = 'https://api.twitch.tv/helix'

  constructor(
    private accessToken: string,
    private clientId: string
  ) {}

  private headers() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Client-Id': this.clientId,
    }
  }

  // Get user info
  async getUser() {
    const response = await fetch(`${this.baseUrl}/users`, {
      headers: this.headers(),
    })

    return response.json()
  }

  // Get channel info
  async getChannel(broadcasterId: string) {
    const response = await fetch(`${this.baseUrl}/channels?broadcaster_id=${broadcasterId}`, {
      headers: this.headers(),
    })

    return response.json()
  }

  // Get subscriber count
  async getSubscribers(broadcasterId: string) {
    const response = await fetch(`${this.baseUrl}/subscriptions?broadcaster_id=${broadcasterId}`, {
      headers: this.headers(),
    })

    return response.json()
  }

  // Get stream info
  async getStream(userId: string) {
    const response = await fetch(`${this.baseUrl}/streams?user_id=${userId}`, {
      headers: this.headers(),
    })

    return response.json()
  }

  // Get clips
  async getClips(broadcasterId: string, first = 20) {
    const response = await fetch(`${this.baseUrl}/clips?broadcaster_id=${broadcasterId}&first=${first}`, {
      headers: this.headers(),
    })

    return response.json()
  }
}

// Rate limit: 800 requests per minute
// Use EventSub for real-time events (webhooks)
```

### Handling Rate Limits

```typescript
// lib/queue.ts
import { Inngest } from 'inngest'

const inngest = new Inngest({ id: 'creator-platform' })

// Queue API calls to respect rate limits
export const syncPlatformData = inngest.createFunction(
  { id: 'sync-platform-data' },
  { event: 'platform/sync' },
  async ({ event, step }) => {
    const { creatorId, platform } = event.data

    // Rate limit by platform
    const delays = {
      tiktok: 600, // 100/min = 600ms between calls
      instagram: 18000, // 200/hour = 18s between calls
      youtube: 8640, // 10k/day = 8.64s between calls
      twitch: 75, // 800/min = 75ms between calls
    }

    await step.sleep('rate-limit', `${delays[platform]}ms`)

    // Fetch data
    const data = await step.run('fetch-data', async () => {
      // Platform-specific fetch logic
    })

    // Cache result
    await step.run('cache-result', async () => {
      // Store in database with TTL
    })

    return data
  }
)
```

---

## Part 4: Feature Implementation

### Link-in-Bio Page

```typescript
// app/[username]/page.tsx
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'

export default async function CreatorPage({ params }: { params: { username: string } }) {
  const creator = await db.creator.findFirst({
    where: { username: params.username },
    include: {
      links: { orderBy: { order: 'asc' } },
      tiers: true,
    },
  })

  if (!creator) notFound()

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Profile */}
        <div className="text-center">
          <img src={creator.avatar} className="w-24 h-24 rounded-full mx-auto" />
          <h1 className="text-2xl font-bold text-white mt-4">{creator.name}</h1>
          <p className="text-gray-300">{creator.bio}</p>
        </div>

        {/* Links */}
        <div className="space-y-3">
          {creator.links.map(link => (
            <a
              key={link.id}
              href={link.url}
              className="block w-full p-4 bg-white/10 rounded-lg text-white text-center hover:bg-white/20 transition"
            >
              {link.title}
            </a>
          ))}
        </div>

        {/* Support tiers */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Support me</h2>
          {creator.tiers.map(tier => (
            <div key={tier.id} className="p-4 bg-white/10 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">{tier.name}</span>
                <span className="text-purple-300">${tier.price}/mo</span>
              </div>
              <ul className="mt-2 text-sm text-gray-300">
                {tier.benefits.map((benefit, i) => (
                  <li key={i}>• {benefit}</li>
                ))}
              </ul>
              <button className="mt-3 w-full py-2 bg-purple-600 rounded-lg text-white">
                Join
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Analytics Dashboard

```typescript
// app/dashboard/analytics/page.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function AnalyticsPage() {
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => fetch('/api/analytics').then(r => r.json()),
  })

  if (!analytics) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Followers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalFollowers.toLocaleString()}</div>
            <div className="text-sm text-green-500">+{analytics.overview.growthRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revenue (MTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(analytics.overview.totalRevenue / 100).toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.engagementRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.activeSubscribers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Growth chart */}
      <Card>
        <CardHeader>
          <CardTitle>Follower Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.growthHistory}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="followers" stroke="#8b5cf6" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Platform breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>By Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.byPlatform).map(([platform, stats]: [string, any]) => (
              <div key={platform} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PlatformIcon platform={platform} />
                  <span className="font-medium capitalize">{platform}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{stats.followers.toLocaleString()} followers</div>
                  <div className="text-sm text-gray-500">{stats.engagement}% engagement</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## Part 5: Unique Challenges

### Platform API Limits

```typescript
// solutions/rate-limiting.ts

// 1. Queue system for batch operations
// 2. Caching with appropriate TTLs
// 3. Graceful degradation when limits hit

const CACHE_TTLS = {
  tiktok: 60 * 15,     // 15 minutes (strict limits)
  instagram: 60 * 60,  // 1 hour
  youtube: 60 * 60,    // 1 hour
  twitch: 60 * 5,      // 5 minutes (generous limits)
}

// Show cached data with "last updated" timestamp
// Queue refresh in background
```

### Monetization Complexity

```typescript
// Tax handling with Stripe Tax
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  automatic_tax: { enabled: true }, // Handles VAT/GST
  application_fee_percent: 5,
  transfer_data: { destination: creatorStripeAccountId },
})

// 1099 generation at year end
// Stripe Connect handles this for US creators
// Creator receives 1099-K if >$600/year
```

### Compliance

```typescript
// FTC disclosure automation
interface SponsoredPost {
  brandName: string
  compensation: 'paid' | 'gifted' | 'affiliate'
}

function generateDisclosure(post: SponsoredPost): string {
  const disclosures = {
    paid: `#ad #sponsored | Paid partnership with ${post.brandName}`,
    gifted: `#gifted | Product provided by ${post.brandName}`,
    affiliate: `#affiliate | I may earn commission from purchases`,
  }

  return disclosures[post.compensation]
}

// Auto-add to post caption
// Platform-specific disclosure toggles
```

### Content Moderation

```typescript
// Basic moderation for UGC
import { OpenAI } from 'openai'

const openai = new OpenAI()

async function moderateContent(content: string): Promise<{
  allowed: boolean
  flags: string[]
}> {
  const response = await openai.moderations.create({ input: content })

  const result = response.results[0]
  const flags = Object.entries(result.categories)
    .filter(([_, flagged]) => flagged)
    .map(([category]) => category)

  return {
    allowed: !result.flagged,
    flags,
  }
}
```

---

## Part 6: Example Architectures

### Link-in-Bio Clone (Simple)

```
Stack:
- Next.js 16.1.1 + Tailwind
- Supabase (auth + database)
- Vercel (hosting)

Features:
- Custom URL (/username)
- Drag-and-drop link editor
- Basic analytics (clicks)
- Theme customization

Complexity: Low
Time to build: 1-2 weeks
```

### Membership Platform (Medium)

```
Stack:
- Next.js 16.1.1 + Tailwind
- Supabase (auth + database + storage)
- Stripe Connect (payments)
- Resend (email)
- Cloudflare R2 (media)

Features:
- Tiered memberships
- Content gating
- Community feed
- Creator payouts
- Email notifications

Complexity: Medium
Time to build: 4-8 weeks
```

### Creator Dashboard (Advanced)

```
Stack:
- Next.js 16.1.1 + Tailwind
- Supabase/PostgreSQL
- Stripe Connect
- Inngest (background jobs)
- All platform APIs
- Redis (caching)

Features:
- Multi-platform analytics
- Unified inbox
- Content scheduler
- Revenue dashboard
- Team collaboration
- API rate limit handling

Complexity: High
Time to build: 12-20 weeks
```

---

## Checklist

```markdown
- [ ] Auth with Clerk or Supabase Auth
- [ ] Database schema for creators + fans
- [ ] Stripe Connect integration
- [ ] At least one platform API connected
- [ ] Analytics dashboard
- [ ] Email system (welcome, transactions)
- [ ] Content delivery (if applicable)
- [ ] Rate limiting/caching strategy
- [ ] Compliance (FTC disclosure)
- [ ] Basic content moderation
```

---

## Resources

- Stripe Connect: https://stripe.com/connect
- TikTok API: https://developers.tiktok.com/
- Instagram Graph API: https://developers.facebook.com/docs/instagram-api
- YouTube Data API: https://developers.google.com/youtube/v3
- Twitch API: https://dev.twitch.tv/docs/api

---

## Related Skills

- `agents/stripe/SKILL.md` — Payment implementation
- `agents/advertising/SKILL.md` — Brand deals and sponsorships
- `agents/analytics/SKILL.md` — Tracking metrics
- `workflows/monetization/SKILL.md` — Pricing strategies
- `content/social/SKILL.md` — Multi-platform content strategy
- `agents/algorithm/SKILL.md` — Platform algorithms
