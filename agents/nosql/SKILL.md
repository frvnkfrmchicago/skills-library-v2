---
name: nosql
description: NoSQL databases. MongoDB, DynamoDB, Redis. When to use, patterns, migrations.
last_updated: 2026-03
owner: Frank
---

# NoSQL Databases

When relational doesn't fit.

## TL;DR

| Database | Type | Best For |
|----------|------|----------|
| **MongoDB** | Document | Flexible schemas, rapid prototyping |
| **DynamoDB** | Key-Value | Serverless, infinite scale |
| **Redis** | Key-Value | Caching, real-time, sessions |
| **Cassandra** | Wide-Column | Time-series, write-heavy |

---

## Context Questions

Before choosing NoSQL:

1. **Is data relational?** — Many joins = SQL
2. **Schema flexibility?** — Changing often = NoSQL
3. **Scale requirements?** — Massive write volume = DynamoDB/Cassandra
4. **Latency needs?** — Sub-ms = Redis
5. **Consistency requirements?** — ACID vs eventual?

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Data Model** | Relational ←→ Document/KV |
| **Consistency** | Strong ACID ←→ Eventual |
| **Scale** | Vertical ←→ Infinite horizontal |
| **Query** | Complex joins ←→ Single-table access |
| **Schema** | Fixed ←→ Flexible |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Complex relations | PostgreSQL (stick with SQL) |
| Flexible schema needed | MongoDB |
| Serverless + infinite scale | DynamoDB |
| Caching/sessions | Redis |
| Time-series data | DynamoDB or ClickHouse |
| Real-time leaderboards | Redis sorted sets |

---

## Part 1: When to Use NoSQL

### SQL vs NoSQL Decision Tree

```
Is data highly relational (many joins)?
├─ Yes → Use SQL (PostgreSQL, MySQL)
└─ No → Continue...

Need ACID transactions across tables?
├─ Yes → Use SQL
└─ No → Continue...

Schema changes frequently?
├─ Yes → NoSQL (MongoDB)
└─ No → Continue...

Need infinite horizontal scale?
├─ Yes → NoSQL (DynamoDB, Cassandra)
└─ No → Continue...

Need sub-millisecond latency?
├─ Yes → Redis
└─ No → SQL is probably fine
```

### Quick Decision Table

| Use Case | Choose |
|----------|--------|
| User data, orders, payments | SQL (PostgreSQL) |
| Product catalog with variants | MongoDB |
| Session storage | Redis |
| Real-time leaderboards | Redis |
| IoT sensor data | DynamoDB or Cassandra |
| User activity logs | DynamoDB |
| Social feed, flexible content | MongoDB |
| Analytics events | DynamoDB or ClickHouse |

### CAP Theorem (Simplified)

**You can only have 2 of 3:**

| Property | Meaning |
|----------|---------|
| **Consistency** | All nodes see same data |
| **Availability** | System always responds |
| **Partition Tolerance** | Works despite network splits |

| Database | Prioritizes |
|----------|-------------|
| PostgreSQL | Consistency + Availability |
| MongoDB | Consistency + Partition Tolerance |
| DynamoDB | Availability + Partition Tolerance |
| Cassandra | Availability + Partition Tolerance |

---

## Part 2: MongoDB

### Setup with Mongoose (Node.js)

```bash
npm install mongoose
```

```typescript
// lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}
```

### Schema Design

```typescript
// models/user.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  email: string;
  name: string;
  profile: {
    bio?: string;
    avatar?: string;
    social: {
      twitter?: string;
      github?: string;
    };
  };
  orders: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  profile: {
    bio: String,
    avatar: String,
    social: {
      twitter: String,
      github: String,
    },
  },
  orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
}, { timestamps: true });

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'profile.social.twitter': 1 });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
```

### Query Patterns

```typescript
// Find with filters
const users = await User.find({
  'profile.social.twitter': { $exists: true },
  createdAt: { $gte: new Date('2025-01-01') },
}).limit(10);

// Update nested field
await User.updateOne(
  { email: 'user@example.com' },
  { $set: { 'profile.bio': 'New bio' } }
);

// Add to array
await User.updateOne(
  { _id: userId },
  { $push: { orders: orderId } }
);

// Populate references
const userWithOrders = await User.findById(userId).populate('orders');
```

### Aggregation Pipeline

```typescript
// Get user stats by month
const stats = await User.aggregate([
  {
    $match: {
      createdAt: { $gte: new Date('2025-01-01') }
    }
  },
  {
    $group: {
      _id: { $month: '$createdAt' },
      count: { $sum: 1 },
      avgOrders: { $avg: { $size: '$orders' } }
    }
  },
  {
    $sort: { _id: 1 }
  }
]);

// Top users by order count
const topUsers = await User.aggregate([
  {
    $project: {
      name: 1,
      email: 1,
      orderCount: { $size: '$orders' }
    }
  },
  { $sort: { orderCount: -1 } },
  { $limit: 10 }
]);
```

---

## Part 3: DynamoDB

### Setup with AWS SDK (Node.js)

```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

```typescript
// lib/dynamodb.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

export const dynamodb = DynamoDBDocumentClient.from(client);
```

### Single-Table Design

```typescript
// Table: MainTable
// PK: partition key (string)
// SK: sort key (string)

// Entity patterns:
// User:     PK=USER#<userId>    SK=PROFILE
// Order:    PK=USER#<userId>    SK=ORDER#<orderId>
// Product:  PK=PRODUCT#<id>     SK=DETAILS

interface TableItem {
  PK: string;
  SK: string;
  GSI1PK?: string;
  GSI1SK?: string;
  type: 'user' | 'order' | 'product';
  data: Record<string, any>;
}
```

### CRUD Operations

```typescript
import { PutCommand, GetCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = 'MainTable';

// Create
async function createUser(userId: string, userData: UserData) {
  await dynamodb.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
      type: 'user',
      ...userData,
      createdAt: new Date().toISOString(),
    },
  }));
}

// Read
async function getUser(userId: string) {
  const result = await dynamodb.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
    },
  }));
  return result.Item;
}

// Query user's orders
async function getUserOrders(userId: string) {
  const result = await dynamodb.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':sk': 'ORDER#',
    },
  }));
  return result.Items;
}

// Delete
async function deleteUser(userId: string) {
  await dynamodb.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
    },
  }));
}
```

### Global Secondary Index (GSI)

```typescript
// Access pattern: Get all orders by status
// GSI1PK = STATUS#<status>
// GSI1SK = <timestamp>

async function getOrdersByStatus(status: string) {
  const result = await dynamodb.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :status',
    ExpressionAttributeValues: {
      ':status': `STATUS#${status}`,
    },
    ScanIndexForward: false, // Newest first
  }));
  return result.Items;
}
```

### DynamoDB with Python (boto3)

```python
import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('MainTable')

# Create
def create_user(user_id: str, data: dict):
    table.put_item(Item={
        'PK': f'USER#{user_id}',
        'SK': 'PROFILE',
        'type': 'user',
        **data,
        'createdAt': datetime.now().isoformat(),
    })

# Query
def get_user_orders(user_id: str):
    response = table.query(
        KeyConditionExpression='PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues={
            ':pk': f'USER#{user_id}',
            ':sk': 'ORDER#',
        }
    )
    return response['Items']
```

---

## Part 4: Redis as NoSQL

### Beyond Caching

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);
```

### Data Structures

#### Hashes (Objects)

```typescript
// Store user data
await redis.hset('user:123', {
  name: 'John',
  email: 'john@example.com',
  score: 100,
});

// Get all fields
const user = await redis.hgetall('user:123');

// Increment field
await redis.hincrby('user:123', 'score', 10);
```

#### Sets (Unique Collections)

```typescript
// Track user tags
await redis.sadd('user:123:tags', 'premium', 'newsletter');

// Check membership
const isPremium = await redis.sismember('user:123:tags', 'premium');

// Get all tags
const tags = await redis.smembers('user:123:tags');

// Find common tags between users
const commonTags = await redis.sinter('user:123:tags', 'user:456:tags');
```

#### Sorted Sets (Leaderboards)

```typescript
// Add scores
await redis.zadd('leaderboard', 100, 'user:123');
await redis.zadd('leaderboard', 200, 'user:456');
await redis.zadd('leaderboard', 150, 'user:789');

// Get top 10
const top10 = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');

// Get user rank
const rank = await redis.zrevrank('leaderboard', 'user:123');

// Increment score
await redis.zincrby('leaderboard', 50, 'user:123');
```

#### Lists (Queues, Activity Feeds)

```typescript
// Add to activity feed
await redis.lpush('feed:user:123', JSON.stringify({
  type: 'post',
  content: 'Hello world',
  timestamp: Date.now(),
}));

// Trim to last 100 items
await redis.ltrim('feed:user:123', 0, 99);

// Get recent activity
const feed = await redis.lrange('feed:user:123', 0, 19);
```

### Pub/Sub for Real-time

```typescript
// Publisher
await redis.publish('notifications', JSON.stringify({
  userId: '123',
  message: 'New order received',
}));

// Subscriber
const sub = new Redis(process.env.REDIS_URL);
sub.subscribe('notifications');

sub.on('message', (channel, message) => {
  const data = JSON.parse(message);
  console.log('Notification:', data);
});
```

### Session Storage

```typescript
// Store session
const sessionId = crypto.randomUUID();
await redis.set(
  `session:${sessionId}`,
  JSON.stringify({ userId: '123', role: 'admin' }),
  'EX', 
  3600 // Expire in 1 hour
);

// Get session
const session = await redis.get(`session:${sessionId}`);
```

---

## Part 5: Migration Patterns

### SQL to NoSQL Considerations

| Consideration | Action |
|---------------|--------|
| Joins | Embed related data in documents |
| Normalization | Denormalize for read performance |
| Transactions | Use single-document transactions |
| Schema | Plan for flexible schemas |
| Indexes | Design based on query patterns |

### Gradual Migration Strategy

```
Phase 1: Dual Write
├── Write to both SQL and NoSQL
├── Read from SQL
└── Monitor NoSQL consistency

Phase 2: Shadow Read
├── Write to both
├── Read from NoSQL, compare to SQL
└── Fix discrepancies

Phase 3: NoSQL Primary
├── Write to NoSQL first
├── Async sync to SQL (backup)
└── Read from NoSQL

Phase 4: SQL Removal
├── Write only to NoSQL
├── Keep SQL as archive
└── Full NoSQL
```

### Data Transformation Example

```typescript
// SQL normalized structure
interface SQLUser {
  id: number;
  email: string;
  name: string;
}

interface SQLAddress {
  id: number;
  user_id: number;
  street: string;
  city: string;
}

// MongoDB denormalized structure
interface MongoUser {
  _id: ObjectId;
  email: string;
  name: string;
  addresses: {
    street: string;
    city: string;
  }[];
}

// Migration function
async function migrateUser(sqlUser: SQLUser) {
  const addresses = await sql('SELECT * FROM addresses WHERE user_id = ?', sqlUser.id);
  
  await User.create({
    email: sqlUser.email,
    name: sqlUser.name,
    addresses: addresses.map(a => ({
      street: a.street,
      city: a.city,
    })),
  });
}
```

---

## Checklist

Before using NoSQL:

- [ ] Confirmed SQL doesn't fit the use case
- [ ] Access patterns defined (not just data model)
- [ ] Index strategy planned
- [ ] Backup strategy in place
- [ ] Local development setup working
- [ ] Connection pooling configured

---

## Resources

- [MongoDB University](https://university.mongodb.com)
- [DynamoDB Guide](https://www.dynamodbguide.com)
- [Redis University](https://university.redis.com)
- [The DynamoDB Book](https://www.dynamodbbook.com)

---

## Related Skills

- `database/SKILL.md` — SQL with Prisma/Supabase
- `backend-patterns/SKILL.md` — Caching with Redis
- `realtime/SKILL.md` — Pub/sub patterns
- `deployment/SKILL.md` — Database hosting
