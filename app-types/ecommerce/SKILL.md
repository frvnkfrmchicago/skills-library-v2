---
name: app-type-ecommerce
description: E-commerce blueprint for product stores, marketplaces, and digital goods. Cart, checkout, inventory, order management. Production-ready patterns.
last_updated: 2026-03
---

# E-commerce Blueprint

Full-stack e-commerce. Cart to checkout to delivery.

## TL;DR

| Feature | Tool |
|---------|------|
| **Payments** | Stripe Checkout |
| **Products** | Prisma + Supabase |
| **Cart** | Zustand + localStorage |
| **Search** | Prisma full-text or Algolia |
| **Images** | Uploadthing or Cloudinary |
| **Auth** | Clerk |
| **Email** | Resend |

**Ship time:** 2-3 days for MVP, 1-2 weeks for production

---

## Stack Options

### Option A: Full-Stack Next.js (Recommended)
```
Framework:    Next.js 16.1.1 (App Router)
Database:     Supabase (Postgres)
ORM:          Prisma
Payments:     Stripe
Auth:         Clerk
Images:       Uploadthing
Email:        Resend
Styling:      Tailwind + shadcn/ui
```

### Option B: Shopify Headless
```
Backend:      Shopify Storefront API
Frontend:     Next.js
Auth:         Shopify Customer API
Payments:     Shopify Checkout
```

**When to use which:**
| Need | Use |
|------|-----|
| Full control, custom logic | Option A |
| Quick launch, proven infrastructure | Option B |
| Custom checkout flow | Option A |
| Already on Shopify | Option B |

---

## File Structure

```
src/
├── app/
│   ├── page.tsx                 # Home / Featured products
│   ├── products/
│   │   ├── page.tsx             # Product listing
│   │   └── [slug]/page.tsx      # Product detail
│   ├── cart/page.tsx            # Cart view
│   ├── checkout/
│   │   ├── page.tsx             # Checkout form
│   │   └── success/page.tsx     # Order confirmation
│   ├── orders/
│   │   └── [id]/page.tsx        # Order tracking
│   ├── admin/
│   │   ├── products/page.tsx    # Product management
│   │   └── orders/page.tsx      # Order management
│   └── api/
│       ├── checkout/route.ts    # Stripe session
│       └── webhooks/stripe/route.ts
├── components/
│   ├── products/
│   │   ├── product-card.tsx
│   │   ├── product-gallery.tsx
│   │   └── product-filters.tsx
│   ├── cart/
│   │   ├── cart-drawer.tsx
│   │   ├── cart-item.tsx
│   │   └── cart-summary.tsx
│   └── checkout/
│       ├── checkout-form.tsx
│       └── order-summary.tsx
├── lib/
│   ├── db.ts                    # Prisma client
│   ├── store/
│   │   └── cart.ts              # Zustand cart store
│   └── stripe.ts                # Stripe client
└── prisma/
    └── schema.prisma
```

---

## Database Schema

```prisma
// prisma/schema.prisma

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  price       Int      // cents
  comparePrice Int?    // cents, for sale display
  images      String[] // URLs
  category    String?
  tags        String[]
  inventory   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  orderItems  OrderItem[]

  @@index([category])
  @@index([isActive])
}

model Order {
  id              String      @id @default(cuid())
  userId          String?     // Clerk user ID
  email           String
  status          OrderStatus @default(PENDING)
  subtotal        Int         // cents
  shipping        Int         @default(0)
  tax             Int         @default(0)
  total           Int         // cents
  shippingAddress Json?
  stripeSessionId String?     @unique
  stripePaymentId String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  items           OrderItem[]

  @@index([userId])
  @@index([status])
  @@index([email])
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  price     Int     // cents, snapshot at time of order
  name      String  // snapshot

  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id])

  @@index([orderId])
}

enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}
```

---

## Cart State Management

### Zustand Store

```typescript
// lib/store/cart.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      total: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      itemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
```

### Cart Components

```tsx
// components/cart/cart-drawer.tsx
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { CartItem } from "./cart-item";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, total, itemCount } = useCartStore();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount() > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
              {itemCount()}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Cart ({itemCount()} items)</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-4">
            {items.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Your cart is empty
              </p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem key={item.productId} item={item} />
                ))}
              </div>
            )}
          </div>
          {items.length > 0 && (
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(total())}</span>
              </div>
              <Button className="w-full" size="lg" asChild>
                <a href="/checkout">Checkout</a>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

---

## Checkout Flow

### Stripe Checkout Session

```typescript
// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { userId } = await auth();
  const { items, email } = await req.json();

  // Validate items and get current prices from DB
  const productIds = items.map((i: any) => i.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  // Build line items with verified prices
  const lineItems = items.map((item: any) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Product not found: ${item.productId}`);
    if (product.inventory < item.quantity) {
      throw new Error(`Insufficient stock for: ${product.name}`);
    }

    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          images: product.images.slice(0, 1),
        },
        unit_amount: product.price,
      },
      quantity: item.quantity,
    };
  });

  // Create pending order
  const order = await db.order.create({
    data: {
      userId,
      email,
      status: "PENDING",
      subtotal: lineItems.reduce(
        (sum: number, item: any) => sum + item.price_data.unit_amount * item.quantity,
        0
      ),
      total: lineItems.reduce(
        (sum: number, item: any) => sum + item.price_data.unit_amount * item.quantity,
        0
      ),
      items: {
        create: items.map((item: any) => {
          const product = products.find((p) => p.id === item.productId)!;
          return {
            productId: product.id,
            quantity: item.quantity,
            price: product.price,
            name: product.name,
          };
        }),
      },
    },
  });

  // Create Stripe session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    customer_email: email,
    metadata: {
      orderId: order.id,
    },
    success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/cart`,
  });

  // Update order with session ID
  await db.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ url: session.url });
}
```

### Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response("Webhook signature verification failed", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      // Update order status
      const order = await db.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          stripePaymentId: session.payment_intent as string,
        },
        include: { items: true },
      });

      // Decrease inventory
      for (const item of order.items) {
        await db.product.update({
          where: { id: item.productId },
          data: { inventory: { decrement: item.quantity } },
        });
      }

      // Send confirmation email
      await resend.emails.send({
        from: "orders@yourstore.com",
        to: order.email,
        subject: `Order Confirmed - #${order.id.slice(-8).toUpperCase()}`,
        html: `
          <h1>Thanks for your order!</h1>
          <p>Order #${order.id.slice(-8).toUpperCase()}</p>
          <p>Total: $${(order.total / 100).toFixed(2)}</p>
          <a href="${process.env.NEXT_PUBLIC_URL}/orders/${order.id}">View Order</a>
        `,
      });
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const session = await stripe.checkout.sessions.list({
      payment_intent: charge.payment_intent as string,
      limit: 1,
    });

    if (session.data[0]?.metadata?.orderId) {
      await db.order.update({
        where: { id: session.data[0].metadata.orderId },
        data: { status: "REFUNDED" },
      });
    }
  }

  return new Response("OK", { status: 200 });
}
```

---

## Inventory Management

### Stock Checking

```typescript
// lib/inventory.ts
import { db } from "./db";

export async function checkStock(productId: string, quantity: number): Promise<{
  available: boolean;
  currentStock: number;
}> {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { inventory: true },
  });

  if (!product) {
    return { available: false, currentStock: 0 };
  }

  return {
    available: product.inventory >= quantity,
    currentStock: product.inventory,
  };
}

export async function reserveInventory(items: { productId: string; quantity: number }[]) {
  // Use transaction for atomic updates
  return db.$transaction(async (tx) => {
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || product.inventory < item.quantity) {
        throw new Error(`Insufficient stock for ${product?.name || item.productId}`);
      }

      await tx.product.update({
        where: { id: item.productId },
        data: { inventory: { decrement: item.quantity } },
      });
    }
  });
}

export async function getLowStockProducts(threshold: number = 5) {
  return db.product.findMany({
    where: {
      isActive: true,
      inventory: { lte: threshold },
    },
    orderBy: { inventory: "asc" },
  });
}
```

### Low Stock Alert (Cron)

```typescript
// app/api/cron/low-stock/route.ts
import { db } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  // Verify cron secret
  if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const lowStock = await db.product.findMany({
    where: { isActive: true, inventory: { lte: 5 } },
  });

  if (lowStock.length > 0) {
    await resend.emails.send({
      from: "alerts@yourstore.com",
      to: "admin@yourstore.com",
      subject: `⚠️ Low Stock Alert: ${lowStock.length} products`,
      html: `
        <h2>Low Stock Products</h2>
        <ul>
          ${lowStock.map((p) => `<li>${p.name}: ${p.inventory} remaining</li>`).join("")}
        </ul>
      `,
    });
  }

  return Response.json({ checked: lowStock.length });
}
```

---

## Search & Filtering

### Product Search

```typescript
// app/products/page.tsx
import { db } from "@/lib/db";
import { ProductCard } from "@/components/products/product-card";
import { ProductFilters } from "@/components/products/product-filters";

type SearchParams = {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: "price-asc" | "price-desc" | "newest" | "popular";
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, category, minPrice, maxPrice, sort } = searchParams;

  const products = await db.product.findMany({
    where: {
      isActive: true,
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { tags: { has: q.toLowerCase() } },
        ],
      }),
      ...(category && { category }),
      ...(minPrice && { price: { gte: parseInt(minPrice) * 100 } }),
      ...(maxPrice && { price: { lte: parseInt(maxPrice) * 100 } }),
    },
    orderBy: {
      ...(sort === "price-asc" && { price: "asc" }),
      ...(sort === "price-desc" && { price: "desc" }),
      ...(sort === "newest" && { createdAt: "desc" }),
      ...(!sort && { createdAt: "desc" }),
    },
  });

  const categories = await db.product.groupBy({
    by: ["category"],
    where: { isActive: true, category: { not: null } },
    _count: true,
  });

  return (
    <div className="container py-8">
      <div className="flex gap-8">
        <aside className="w-64 shrink-0">
          <ProductFilters categories={categories} />
        </aside>
        <main className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {products.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No products found
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
```

---

## Product SEO

### Dynamic Metadata

```typescript
// app/products/[slug]/page.tsx
import { Metadata } from "next";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
  });

  if (!product) return {};

  return {
    title: `${product.name} | Your Store`,
    description: product.description || `Buy ${product.name}`,
    openGraph: {
      title: product.name,
      description: product.description || `Buy ${product.name}`,
      images: product.images.slice(0, 1),
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await db.product.findUnique({
    where: { slug: params.slug, isActive: true },
  });

  if (!product) notFound();

  // Structured data for Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      "@type": "Offer",
      price: (product.price / 100).toFixed(2),
      priceCurrency: "USD",
      availability: product.inventory > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Product detail component */}
    </>
  );
}
```

---

## Order Management

### Admin Orders

```typescript
// app/admin/orders/page.tsx
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminOrdersPage() {
  const { userId } = await auth();
  
  // Check admin role (implement your own logic)
  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (user?.role !== "ADMIN") redirect("/");

  const orders = await db.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Order</th>
            <th className="text-left py-2">Status</th>
            <th className="text-left py-2">Customer</th>
            <th className="text-right py-2">Total</th>
            <th className="text-left py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b">
              <td className="py-2 font-mono">
                #{order.id.slice(-8).toUpperCase()}
              </td>
              <td className="py-2">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="py-2">{order.email}</td>
              <td className="py-2 text-right">
                ${(order.total / 100).toFixed(2)}
              </td>
              <td className="py-2">
                {order.createdAt.toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Quick Start

```bash
# 1. Create project
npx create-next-app@latest store --typescript --tailwind --app
cd store

# 2. Install dependencies
pnpm add @prisma/client zustand stripe @clerk/nextjs resend
pnpm add -D prisma

# 3. Setup Prisma
npx prisma init
# Copy schema above, then:
npx prisma db push

# 4. Setup shadcn
npx shadcn@latest init
npx shadcn@latest add button card badge sheet

# 5. Add env vars
# STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
# CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# DATABASE_URL, RESEND_API_KEY

# 6. Run
pnpm dev
```

---

## Checklist

- [ ] Database schema created
- [ ] Cart state working
- [ ] Stripe Checkout integrated
- [ ] Webhooks handling orders
- [ ] Inventory tracking
- [ ] Product search working
- [ ] SEO metadata set
- [ ] Order confirmation emails
- [ ] Admin dashboard basics
- [ ] Mobile responsive

---

## Related Skills

- `agents/stripe/SKILL.md` - Deep Stripe patterns
- `agents/database/SKILL.md` - Prisma patterns
- `workflows/monetization/SKILL.md` - Pricing strategies
- `agents/seo/SKILL.md` - SEO optimization
- `agents/email/SKILL.md` - Email notifications

---

## Resources

- **Stripe Checkout:** https://stripe.com/docs/checkout
- **Prisma:** https://prisma.io/docs
- **Zustand Persist:** https://zustand.docs.pmnd.rs/middlewares/persist
- **Next.js Commerce:** https://github.com/vercel/commerce (reference)
