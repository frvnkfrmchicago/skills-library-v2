---
name: shopify
description: E-commerce with Shopify themes, Liquid, Hydrogen, and Storefront API.
owner: Frank
last_updated: 2026-03
---

# Shopify

E-commerce done right. Themes, headless, or full custom.

---

## Context Questions

Before building with Shopify:

1. **What's the approach?** — Theme customization, headless, or hybrid?
2. **What's the scale?** — Small shop, enterprise, multi-store?
3. **Custom features needed?** — Subscriptions, custom checkout, B2B?
4. **Frontend preference?** — Liquid themes or React (Hydrogen)?
5. **Integration needs?** — ERP, inventory, shipping systems?

---

## TL;DR

| Need | Solution |
|------|----------|
| Quick store | Shopify Theme + Dawn |
| Custom theme | Liquid + Theme Kit |
| Headless React | Hydrogen |
| Headless any stack | Storefront API |
| Backend logic | Shopify Functions |
| Admin extensions | Shopify App |

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Customization** | Theme tweaks ←→ Fully custom headless |
| **Speed to market** | Days ←→ Months |
| **Developer control** | Liquid templates ←→ Full React app |
| **Hosting** | Shopify managed ←→ Self-hosted |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Simple store, fast launch | Dawn theme + customization |
| Custom design, Shopify hosting | Custom Liquid theme |
| Full control, React stack | Hydrogen |
| Next.js/existing stack | Storefront API headless |
| Custom checkout logic | Checkout Extensions |
| B2B or complex pricing | Shopify Functions |

---

## Approaches

### 1. Theme Development (Liquid)

Best for: Quick launch, Shopify-hosted, merchant-friendly

```liquid
<!-- sections/hero.liquid -->
<section class="hero" style="background: {{ section.settings.bg_color }}">
  <div class="hero__content">
    <h1>{{ section.settings.heading }}</h1>
    <p>{{ section.settings.subheading }}</p>
    {% if section.settings.button_link != blank %}
      <a href="{{ section.settings.button_link }}" class="btn">
        {{ section.settings.button_text }}
      </a>
    {% endif %}
  </div>
</section>

{% schema %}
{
  "name": "Hero",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Welcome"
    },
    {
      "type": "text",
      "id": "subheading",
      "label": "Subheading"
    },
    {
      "type": "url",
      "id": "button_link",
      "label": "Button Link"
    },
    {
      "type": "text",
      "id": "button_text",
      "label": "Button Text",
      "default": "Shop Now"
    },
    {
      "type": "color",
      "id": "bg_color",
      "label": "Background Color",
      "default": "#f5f5f5"
    }
  ],
  "presets": [
    {
      "name": "Hero"
    }
  ]
}
{% endschema %}
```

### 2. Hydrogen (React Headless)

Best for: Full control, React developers, custom experiences

```tsx
// app/routes/products.$handle.tsx
import { useLoaderData } from '@remix-run/react'
import { json, LoaderFunctionArgs } from '@shopify/remix-oxygen'
import { ProductPrice, AddToCartButton } from '@shopify/hydrogen'

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { product } = await context.storefront.query(PRODUCT_QUERY, {
    variables: { handle: params.handle },
  })
  
  if (!product) {
    throw new Response('Product not found', { status: 404 })
  }
  
  return json({ product })
}

export default function ProductPage() {
  const { product } = useLoaderData<typeof loader>()
  const selectedVariant = product.variants.nodes[0]
  
  return (
    <div className="product-page">
      <div className="product-images">
        <img 
          src={product.featuredImage?.url} 
          alt={product.title} 
        />
      </div>
      
      <div className="product-info">
        <h1>{product.title}</h1>
        <ProductPrice data={product} />
        
        <div 
          dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} 
        />
        
        <AddToCartButton
          lines={[{ merchandiseId: selectedVariant.id, quantity: 1 }]}
        >
          Add to Cart
        </AddToCartButton>
      </div>
    </div>
  )
}

const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      title
      descriptionHtml
      featuredImage {
        url
        altText
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 10) {
        nodes {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
`
```

### 3. Storefront API (Any Stack)

Best for: Next.js, existing frontend, maximum flexibility

```typescript
// lib/shopify.ts
const SHOPIFY_STOREFRONT_API = `https://${process.env.SHOPIFY_STORE}.myshopify.com/api/2024-01/graphql.json`

export async function shopifyFetch<T>({ 
  query, 
  variables 
}: { 
  query: string
  variables?: Record<string, unknown> 
}): Promise<T> {
  const response = await fetch(SHOPIFY_STOREFRONT_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
  })
  
  const json = await response.json()
  
  if (json.errors) {
    throw new Error(json.errors[0].message)
  }
  
  return json.data
}

// Usage in Next.js
export async function getProducts() {
  const { products } = await shopifyFetch<{ products: ProductConnection }>({
    query: `
      query GetProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              handle
              title
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              featuredImage {
                url
                altText
              }
            }
          }
        }
      }
    `,
    variables: { first: 20 },
  })
  
  return products.edges.map(edge => edge.node)
}
```

---

## Theme Structure

```
my-theme/
├── assets/           # CSS, JS, images
├── config/
│   ├── settings_data.json
│   └── settings_schema.json
├── layout/
│   └── theme.liquid  # Main layout
├── locales/          # Translations
├── sections/         # Customizable sections
├── snippets/         # Reusable partials
└── templates/        # Page templates
    ├── product.liquid
    ├── collection.liquid
    └── cart.liquid
```

---

## Common Tasks

### Cart Operations (Storefront API)

```typescript
const CREATE_CART = `#graphql
  mutation CreateCart($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
        checkoutUrl
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                }
              }
            }
          }
        }
      }
    }
  }
`

const ADD_TO_CART = `#graphql
  mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 10) {
          edges {
            node {
              id
              quantity
            }
          }
        }
      }
    }
  }
`
```

---

## Development Tools

```bash
# Shopify CLI
npm install -g @shopify/cli

# Create Hydrogen app
npm create @shopify/hydrogen@latest

# Theme development
shopify theme dev --store=your-store.myshopify.com

# Push theme
shopify theme push
```

---

## Related Skills

- `app-types/ecommerce/SKILL.md` — E-commerce patterns
- `agents/payments/SKILL.md` — Stripe integration
- `agents/seo/SKILL.md` — E-commerce SEO
- `tech-stack/SKILL.md` — Stack decisions
