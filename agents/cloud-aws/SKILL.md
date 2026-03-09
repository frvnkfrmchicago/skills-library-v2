---
name: cloud-aws
description: AWS patterns for Next.js apps. S3, CloudFront, Lambda, and SST/Serverless deployment.
last_updated: 2026-03
owner: Frank
---

# AWS Cloud Patterns

Beyond Vercel - full AWS control.

---

## Context Questions

Before deploying to AWS:

1. **Why AWS over Vercel?** — Cost control, custom infra, enterprise compliance, existing AWS usage
2. **What services needed?** — Just storage (S3), full deploy (SST), or specific Lambda/containers
3. **What's the traffic pattern?** — Spiky (Lambda), steady (containers), global (CloudFront)
4. **What's the team's AWS experience?** — Beginner (use SST), intermediate (mix), expert (raw CDK)
5. **What's the deployment frequency?** — Continuous (need CI/CD), occasional (manual OK)

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Complexity** | SST (managed) ←→ CDK ←→ Raw AWS |
| **Compute** | Lambda (serverless) ←→ ECS (containers) ←→ EC2 (VMs) |
| **Storage** | S3 only ←→ S3 + CloudFront ←→ Multi-region |
| **Cost** | Pay-per-use ←→ Reserved capacity |
| **Control** | Managed ←→ Custom infrastructure |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Next.js + simple needs | SST (NextjsSite construct) |
| Just file storage | S3 + CloudFront CDN |
| Existing AWS account | Leverage existing infra |
| Enterprise/compliance | VPC, private subnets, security groups |
| High traffic | Reserved concurrency, multi-region |
| Cost-sensitive at scale | Move from Vercel to AWS |

---

## TL;DR

| AWS Service | What It Does |
|-------------|--------------|
| **S3** | Static file storage (images, assets, builds) |
| **CloudFront** | CDN - serves content from edge locations globally |
| **Lambda** | Serverless functions (API routes, SSR) |
| **Lambda@Edge** | Lambda at CloudFront edge (faster SSR) |
| **Route 53** | DNS management |
| **Secrets Manager** | Environment variables/secrets |

---

## When to Use AWS vs Vercel

| Scenario | Recommendation |
|----------|----------------|
| Simple Next.js app | Stay on Vercel |
| Need custom infrastructure | AWS |
| Enterprise/compliance requirements | AWS |
| Cost control at scale | AWS |
| Already using AWS services | AWS |
| Want zero DevOps | Vercel |

---

## S3: File Storage

### Setup

```typescript
// lib/s3.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET!;

// Upload file
export async function uploadFile(key: string, body: Buffer, contentType: string) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
  
  return `https://${BUCKET}.s3.amazonaws.com/${key}`;
}

// Generate presigned upload URL (for client-side uploads)
export async function getUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

// Generate presigned download URL (for private files)
export async function getDownloadUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}
```

### Upload API Route

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUploadUrl } from "@/lib/s3";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { filename, contentType } = await req.json();
  const key = `uploads/${userId}/${Date.now()}-${filename}`;
  
  const uploadUrl = await getUploadUrl(key, contentType);
  const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;

  return NextResponse.json({ uploadUrl, publicUrl, key });
}
```

### Client Upload

```tsx
async function uploadImage(file: File) {
  // 1. Get presigned URL from your API
  const res = await fetch("/api/upload", {
    method: "POST",
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
    }),
  });
  const { uploadUrl, publicUrl } = await res.json();

  // 2. Upload directly to S3
  await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  return publicUrl;
}
```

---

## CloudFront: CDN

### Why CloudFront?

- Caches content at 400+ edge locations globally
- Reduces S3 costs (fewer origin requests)
- HTTPS/SSL included
- Can add Lambda@Edge for dynamic content

### Basic Setup (via Console)

1. Create CloudFront distribution
2. Set S3 bucket as origin
3. Configure caching behavior
4. Get CloudFront domain (e.g., `d1234abcd.cloudfront.net`)

### CloudFront + S3 URL Pattern

```typescript
// Instead of S3 URLs, use CloudFront
const S3_URL = `https://${BUCKET}.s3.amazonaws.com/`;
const CDN_URL = process.env.CLOUDFRONT_URL!; // https://d1234abcd.cloudfront.net

function getCdnUrl(s3Key: string) {
  return `${CDN_URL}/${s3Key}`;
}
```

---

## Lambda: Serverless Functions

### Standalone Lambda (for webhooks, crons)

```typescript
// lambda/handler.ts
import { APIGatewayProxyHandler } from "aws-lambda";

export const handler: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body || "{}");

  // Your logic here
  console.log("Received:", body);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ success: true }),
  };
};
```

### Deploy with SST

```typescript
// sst.config.ts
export default {
  config() {
    return { name: "my-app", region: "us-east-1" };
  },
  stacks(app) {
    app.stack(function API({ stack }) {
      const api = new Api(stack, "api", {
        routes: {
          "POST /webhook": "lambda/handler.handler",
        },
      });
      stack.addOutputs({ ApiUrl: api.url });
    });
  },
};
```

---

## SST: The Easy Way to Deploy Next.js to AWS

SST handles all the AWS complexity for you.

### Setup

```bash
# Create new SST app
npx create-sst@latest

# Or add to existing Next.js project
npx sst init
```

### Config

```typescript
// sst.config.ts
import { SSTConfig } from "sst";
import { NextjsSite, Bucket } from "sst/constructs";

export default {
  config() {
    return {
      name: "my-nextjs-app",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      // S3 bucket for uploads
      const bucket = new Bucket(stack, "uploads");

      // Next.js on Lambda + CloudFront
      const site = new NextjsSite(stack, "site", {
        bind: [bucket],
        environment: {
          BUCKET_NAME: bucket.bucketName,
        },
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
```

### Deploy

```bash
# Development (live Lambda dev)
npx sst dev

# Production
npx sst deploy --stage prod
```

### What SST Creates

- Lambda functions for SSR/API routes
- CloudFront CDN
- S3 for static assets
- Route 53 for custom domain (optional)
- SSL certificate (automatic)

---

## Environment Variables

### AWS Secrets Manager

```typescript
// lib/secrets.ts
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: process.env.AWS_REGION });

export async function getSecret(secretName: string) {
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await client.send(command);
  return JSON.parse(response.SecretString || "{}");
}

// Usage
const { DATABASE_URL, STRIPE_KEY } = await getSecret("my-app/production");
```

### SST Secrets

```bash
# Set secrets
npx sst secrets set STRIPE_KEY sk_live_xxx --stage prod
npx sst secrets set DATABASE_URL postgres://... --stage prod

# List secrets
npx sst secrets list --stage prod
```

---

## Cost Optimization

| Strategy | How |
|----------|-----|
| Use CloudFront | Reduces S3 bandwidth costs |
| Set Lambda memory right | Use AWS Lambda Power Tuning |
| Enable S3 Intelligent Tiering | Automatic cost optimization |
| Monitor with Cost Explorer | Set budget alerts |

### Lambda Sizing

```typescript
// In SST, set function memory
new NextjsSite(stack, "site", {
  server: {
    memory: "1024 MB", // Default is 1024
    timeout: "30 seconds",
  },
});
```

---

## Monitoring

### CloudWatch Logs

All Lambda logs go to CloudWatch automatically.

```bash
# View logs with SST
npx sst logs --stage prod
```

### X-Ray Tracing

```typescript
// Enable in SST
new NextjsSite(stack, "site", {
  server: {
    tracing: "active",
  },
});
```

---

## Quick Start Commands

```bash
# Initialize SST in existing Next.js project
npx sst init

# Local development with AWS
npx sst dev

# Deploy to staging
npx sst deploy --stage staging

# Deploy to production
npx sst deploy --stage prod

# View logs
npx sst logs --stage prod

# Remove stack
npx sst remove --stage staging
```

---

## Resources

- SST Docs: [docs.sst.dev](https://docs.sst.dev)
- OpenNext (Next.js on AWS): [open-next.js.org](https://open-next.js.org)
- AWS SDK v3: [docs.aws.amazon.com/sdk-for-javascript/v3](https://docs.aws.amazon.com/sdk-for-javascript/v3)
