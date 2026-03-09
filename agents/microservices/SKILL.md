---
name: microservices
description: Microservices architecture. Service boundaries, communication, DDD, sagas, distributed tracing.
last_updated: 2026-03
owner: Frank
---

# Microservices

Build distributed systems that scale.

> **Start monolith-first.** Only split when you have clear bounded contexts and team boundaries.

---

## Context Questions

Before architecting microservices:

1. **Team size?** — Under 5 people? Stay monolith
2. **Domain clarity?** — Are bounded contexts obvious?
3. **Deployment needs?** — Do parts need independent scaling?
4. **Tech diversity?** — Different languages/frameworks needed?
5. **Eventual consistency OK?** — Can you handle async?

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Architecture** | Monolith ←→ Full microservices |
| **Communication** | Sync (REST/gRPC) ←→ Async (events) |
| **Data** | Shared DB ←→ Database per service |
| **Transactions** | ACID ←→ Saga/eventual consistency |
| **Team** | Single team ←→ Multiple teams |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Small team, MVP | Monolith with clear modules |
| Multiple teams | Microservices per team |
| Different scale needs | Split high-volume services |
| Clear bounded contexts | Service per context |
| Need transactions | Start monolith or use sagas |
| High performance internal | gRPC between services |

---

## TL;DR

| Concept | When to Use |
|---------|-------------|
| **Monolith** | MVP, small team, unclear domains |
| **Microservices** | Clear domains, multiple teams, scale needs |
| **REST** | Simple CRUD, public APIs |
| **gRPC** | Internal services, high performance |
| **Events** | Decoupling, eventual consistency ok |
| **Saga** | Distributed transactions |

---

## Part 1: When to Split

### Signs You Need Microservices

| Signal | Why It Matters |
|--------|----------------|
| **Multiple teams** colliding | Independent deployment needed |
| **Different scale needs** | Cart (high volume) vs Reports (low) |
| **Technology constraints** | ML in Python, API in Node |
| **Clear bounded contexts** | Orders, Payments, Inventory |

### Signs You DON'T

| Signal | Stay Monolith |
|--------|---------------|
| Team < 5 people | Coordination overhead not worth it |
| Unclear domains | You'll split wrong |
| Shared data model | Distributed monolith risk |
| No deployment bottleneck | Why add complexity? |

### The Monolith-First Path

```
1. Build monolith with clear module boundaries
2. Enforce boundaries via interfaces/contracts
3. Identify natural seams (bounded contexts)
4. Extract services one at a time
5. Keep shared database until ready to split
```

---

## Part 2: Service Boundaries

### Bounded Contexts (DDD)

```
┌─────────────────────────────────────────────────────┐
│                    E-COMMERCE                        │
├──────────────┬──────────────┬───────────────────────┤
│   CATALOG    │    ORDERS    │      PAYMENTS         │
│              │              │                       │
│  • Product   │  • Order     │  • Transaction        │
│  • Category  │  • LineItem  │  • Refund             │
│  • Inventory │  • Customer  │  • PaymentMethod      │
│              │    (copy)    │                       │
└──────────────┴──────────────┴───────────────────────┘
        ↑              ↑               ↑
   Each has own      Events         API calls
    database         between         to Stripe
```

### Anti-Pattern: Distributed Monolith

```typescript
// ❌ BAD - Synchronous calls everywhere
async function createOrder(data: OrderData) {
  const inventory = await inventoryService.check(data.items)  // Sync call
  const user = await userService.getDetails(data.userId)      // Sync call
  const payment = await paymentService.charge(data.total)     // Sync call
  
  // If any fails, whole thing fails
  // If inventory is slow, we're slow
}

// ✅ BETTER - Async where possible
async function createOrder(data: OrderData) {
  // Only sync calls for critical path
  const inventory = await inventoryService.reserveItems(data.items)
  
  // Create order with reserved items
  const order = await orderRepository.create({...data, status: 'pending'})
  
  // Async for the rest
  await eventBus.publish('OrderCreated', { orderId: order.id, ...data })
  
  return order
}
```

---

## Part 3: Communication Patterns

### REST (Synchronous)

```typescript
// Simple REST client
const catalogService = {
  async getProduct(id: string): Promise<Product> {
    const res = await fetch(`${CATALOG_URL}/products/${id}`)
    if (!res.ok) throw new Error(`Product not found: ${id}`)
    return res.json()
  },
  
  async checkInventory(items: Item[]): Promise<InventoryResult> {
    const res = await fetch(`${CATALOG_URL}/inventory/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
    return res.json()
  }
}
```

### gRPC (High Performance)

```protobuf
// catalog.proto
syntax = "proto3";

service CatalogService {
  rpc GetProduct (ProductRequest) returns (Product);
  rpc CheckInventory (InventoryRequest) returns (InventoryResponse);
}

message ProductRequest {
  string id = 1;
}

message Product {
  string id = 1;
  string name = 2;
  int32 price_cents = 3;
  int32 stock = 4;
}
```

```typescript
// gRPC client
import { CatalogServiceClient } from './generated/catalog_grpc_pb'
import { credentials } from '@grpc/grpc-js'

const client = new CatalogServiceClient(
  'catalog-service:50051',
  credentials.createInsecure()
)

async function getProduct(id: string): Promise<Product> {
  return new Promise((resolve, reject) => {
    client.getProduct({ id }, (err, response) => {
      if (err) reject(err)
      else resolve(response)
    })
  })
}
```

### REST vs gRPC

| Factor | REST | gRPC |
|--------|------|------|
| **Use when** | Public APIs, browser clients | Internal services |
| **Performance** | Good | Excellent (binary, HTTP/2) |
| **Tooling** | Universal | Requires protobuf |
| **Debugging** | Easy (JSON) | Harder (binary) |
| **Streaming** | SSE/WebSocket | Native bidirectional |

### Async Messaging

```typescript
// Event publisher
import { Kafka } from 'kafkajs'

const kafka = new Kafka({ brokers: ['kafka:9092'] })
const producer = kafka.producer()

async function publishOrderCreated(order: Order) {
  await producer.send({
    topic: 'orders',
    messages: [{
      key: order.id,
      value: JSON.stringify({
        type: 'OrderCreated',
        data: order,
        timestamp: new Date().toISOString(),
      }),
    }],
  })
}

// Event consumer
const consumer = kafka.consumer({ groupId: 'payment-service' })

await consumer.subscribe({ topic: 'orders' })
await consumer.run({
  eachMessage: async ({ message }) => {
    const event = JSON.parse(message.value.toString())
    
    if (event.type === 'OrderCreated') {
      await processPayment(event.data)
    }
  },
})
```

---

## Part 4: API Gateway

```
┌─────────────────────────────────────────────────────┐
│                   API GATEWAY                        │
│  • Authentication                                    │
│  • Rate limiting                                     │
│  • Request routing                                   │
│  • Response aggregation                              │
└─────────────────────────────────────────────────────┘
           │           │           │
    ┌──────┴───┐ ┌─────┴────┐ ┌────┴─────┐
    │ Catalog  │ │  Orders  │ │ Payments │
    │ Service  │ │  Service │ │ Service  │
    └──────────┘ └──────────┘ └──────────┘
```

```typescript
// Simple API gateway with tRPC
import { createTRPCRouter, publicProcedure } from './trpc'

export const appRouter = createTRPCRouter({
  // Aggregate from multiple services
  getProductPage: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      const [product, reviews, inventory] = await Promise.all([
        catalogService.getProduct(input.productId),
        reviewService.getReviews(input.productId),
        inventoryService.getStock(input.productId),
      ])
      
      return { product, reviews, inventory }
    }),
})
```

---

## Part 5: Saga Pattern

### Problem: Distributed Transactions

```
Order Service → Inventory Service → Payment Service
     ↓                 ↓                  ↓
  Create Order    Reserve Items      Charge Card
     
If payment fails, how do we unreserve inventory?
```

### Solution: Saga with Compensation

```typescript
// Saga orchestrator
interface SagaStep<T> {
  execute: (ctx: T) => Promise<void>
  compensate: (ctx: T) => Promise<void>
}

class OrderSaga {
  private steps: SagaStep<OrderContext>[] = [
    {
      execute: async (ctx) => {
        ctx.reservation = await inventoryService.reserve(ctx.items)
      },
      compensate: async (ctx) => {
        if (ctx.reservation) {
          await inventoryService.release(ctx.reservation.id)
        }
      },
    },
    {
      execute: async (ctx) => {
        ctx.payment = await paymentService.charge(ctx.total, ctx.paymentMethod)
      },
      compensate: async (ctx) => {
        if (ctx.payment) {
          await paymentService.refund(ctx.payment.id)
        }
      },
    },
    {
      execute: async (ctx) => {
        ctx.order = await orderService.create(ctx)
      },
      compensate: async (ctx) => {
        if (ctx.order) {
          await orderService.cancel(ctx.order.id)
        }
      },
    },
  ]

  async execute(ctx: OrderContext): Promise<Order> {
    const completedSteps: SagaStep<OrderContext>[] = []
    
    try {
      for (const step of this.steps) {
        await step.execute(ctx)
        completedSteps.push(step)
      }
      return ctx.order!
    } catch (error) {
      // Compensate in reverse order
      for (const step of completedSteps.reverse()) {
        try {
          await step.compensate(ctx)
        } catch (compensateError) {
          console.error('Compensation failed:', compensateError)
          // Log for manual intervention
        }
      }
      throw error
    }
  }
}
```

### Event-Driven Saga (Choreography)

```typescript
// Each service listens and reacts

// Inventory Service
consumer.on('OrderCreated', async (event) => {
  try {
    await reserveItems(event.items)
    await publish('ItemsReserved', { orderId: event.orderId })
  } catch (error) {
    await publish('ReservationFailed', { orderId: event.orderId, error })
  }
})

// Payment Service
consumer.on('ItemsReserved', async (event) => {
  try {
    await chargeCustomer(event.orderId)
    await publish('PaymentCompleted', { orderId: event.orderId })
  } catch (error) {
    await publish('PaymentFailed', { orderId: event.orderId, error })
  }
})

// Inventory listens for failures
consumer.on('PaymentFailed', async (event) => {
  await releaseReservation(event.orderId)
})
```

---

## Part 6: Domain-Driven Design (DDD)

### Aggregate

```typescript
// Aggregate root - controls all access to children
class Order {
  private items: OrderItem[] = []
  private status: OrderStatus = 'draft'
  
  // All changes go through aggregate root
  addItem(productId: string, quantity: number, price: number) {
    if (this.status !== 'draft') {
      throw new Error('Cannot modify non-draft order')
    }
    
    const existing = this.items.find(i => i.productId === productId)
    if (existing) {
      existing.quantity += quantity
    } else {
      this.items.push(new OrderItem(productId, quantity, price))
    }
  }
  
  submit(): DomainEvent[] {
    if (this.items.length === 0) {
      throw new Error('Cannot submit empty order')
    }
    
    this.status = 'submitted'
    
    // Return domain events
    return [new OrderSubmittedEvent(this.id, this.total)]
  }
  
  get total(): number {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0)
  }
}
```

### Repository Pattern

```typescript
// Repository interface (domain layer)
interface OrderRepository {
  findById(id: string): Promise<Order | null>
  save(order: Order): Promise<void>
  findByCustomerId(customerId: string): Promise<Order[]>
}

// Implementation (infrastructure layer)
class PrismaOrderRepository implements OrderRepository {
  constructor(private prisma: PrismaClient) {}
  
  async findById(id: string): Promise<Order | null> {
    const data = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })
    
    if (!data) return null
    return this.toDomain(data)
  }
  
  async save(order: Order): Promise<void> {
    const data = this.toData(order)
    await this.prisma.order.upsert({
      where: { id: order.id },
      create: data,
      update: data,
    })
  }
  
  private toDomain(data: OrderData): Order {
    // Map database model to domain model
  }
}
```

### Domain Events

```typescript
// Domain event
class OrderSubmittedEvent {
  readonly type = 'OrderSubmitted' as const
  readonly occurredAt = new Date()
  
  constructor(
    readonly orderId: string,
    readonly total: number
  ) {}
}

// Event dispatcher
class DomainEventDispatcher {
  private handlers = new Map<string, ((event: DomainEvent) => Promise<void>)[]>()
  
  on(eventType: string, handler: (event: DomainEvent) => Promise<void>) {
    const handlers = this.handlers.get(eventType) || []
    handlers.push(handler)
    this.handlers.set(eventType, handlers)
  }
  
  async dispatch(event: DomainEvent) {
    const handlers = this.handlers.get(event.type) || []
    await Promise.all(handlers.map(h => h(event)))
  }
}

// Usage
dispatcher.on('OrderSubmitted', async (event) => {
  await emailService.sendOrderConfirmation(event.orderId)
  await analyticsService.trackOrder(event.orderId, event.total)
})
```

---

## Part 7: Distributed Tracing

```typescript
// Propagate trace context across services
import { trace, context, propagation } from '@opentelemetry/api'

// Service A - Start trace
async function handleRequest(req: Request) {
  const tracer = trace.getTracer('order-service')
  
  return tracer.startActiveSpan('process-order', async (span) => {
    span.setAttribute('order.id', req.orderId)
    
    // Call Service B with trace context
    const headers: Record<string, string> = {}
    propagation.inject(context.active(), headers)
    
    await fetch('http://inventory-service/reserve', {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.items),
    })
    
    span.end()
  })
}

// Service B - Continue trace
async function handleReserve(req: Request) {
  // Extract trace context from headers
  const ctx = propagation.extract(context.active(), req.headers)
  const tracer = trace.getTracer('inventory-service')
  
  return context.with(ctx, () => {
    return tracer.startActiveSpan('reserve-items', async (span) => {
      // This span is now a child of the order-service span
      span.setAttribute('items.count', req.items.length)
      
      // Do work...
      
      span.end()
    })
  })
}
```

---

## Part 8: Service Mesh (Advanced)

When to consider:
- Many services (10+)
- Need mTLS between services
- Complex traffic routing
- Automatic retries/circuit breaking

Options: **Istio**, **Linkerd**, **Consul Connect**

```yaml
# Istio virtual service
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: orders
spec:
  hosts:
    - orders
  http:
    - route:
        - destination:
            host: orders
            subset: v2
          weight: 90
        - destination:
            host: orders
            subset: v1
          weight: 10
```

---

## Checklist

Before building microservices:
- [ ] Have clear bounded contexts?
- [ ] Multiple teams need independent deployment?
- [ ] Monolith-first explored?

Per service:
- [ ] Single responsibility
- [ ] Own database
- [ ] API contract defined
- [ ] Health checks
- [ ] Distributed tracing enabled
- [ ] Saga for multi-service transactions

---

## Resources

- Martin Fowler: https://martinfowler.com/microservices/
- DDD Reference: https://www.domainlanguage.com/ddd/reference/
- gRPC: https://grpc.io/docs/languages/node/

---

## Related Skills

- `agents/backend-patterns/SKILL.md` — API patterns
- `agents/cloud-observability/SKILL.md` — Distributed tracing
- `ai-builder/event-driven/SKILL.md` — Kafka, SQS
- `ai-builder/kubernetes/SKILL.md` — Deployment
