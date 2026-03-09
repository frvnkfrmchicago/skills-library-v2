---
name: aws-building
description: >
  Architects and deploys applications on Amazon Web Services. Includes a
  service selection decision tree for S3, Lambda, API Gateway, RDS, DynamoDB,
  ECS, CloudFront, Bedrock, and Secrets Manager. Covers deployment with SST,
  CDK, Terraform, and Serverless Framework. Use when building on AWS, choosing
  AWS services, deploying to Lambda or ECS, setting up S3 or CloudFront,
  or integrating AWS Bedrock for AI workloads.
---

# AWS Building

Architect and deploy on Amazon Web Services. Pick the right services, deploy
with the right tool, and keep costs under control.

---

## ⛔ STOP — Context First

Before architecting on AWS, determine:

1. **What are you deploying?** Next.js, API, containers, static site, AI workload?
2. **Why AWS over Vercel/Railway?** Cost, compliance, existing AWS infra, custom needs?
3. **AWS experience level?** Beginner (use SST), intermediate (CDK), expert (raw CF)?
4. **Budget model?** Pay-as-you-go, reserved, startup credits?
5. **Required integrations?** RDS, S3, Lambda, existing VPCs?

---

## Service Selection Decision Tree

```
What do you need?
│
├── Serve static files / CDN?
│   └── S3 + CloudFront
│
├── Serverless API / functions?
│   └── Lambda + API Gateway
│       ├── REST API → API Gateway REST
│       └── WebSocket → API Gateway WebSocket
│
├── Full-stack web app?
│   ├── Simple, fast setup → SST (deploys to Lambda + CloudFront)
│   ├── Custom control → CDK with Lambda or ECS
│   └── Container-based → ECS Fargate (no servers to manage)
│
├── Database?
│   ├── Relational (SQL) → RDS (PostgreSQL or MySQL)
│   │   ├── Serverless workloads → Aurora Serverless v2
│   │   └── Steady workloads → RDS Provisioned
│   ├── NoSQL / key-value → DynamoDB
│   ├── In-memory cache → ElastiCache (Redis)
│   └── Document / search → OpenSearch
│
├── AI / LLM workloads?
│   ├── Managed LLM API → Bedrock (Claude, Llama, Titan)
│   ├── Custom model training → SageMaker
│   └── Embeddings / RAG → Bedrock + OpenSearch
│
├── File storage / uploads?
│   └── S3
│       ├── Public assets → S3 + CloudFront
│       ├── Private uploads → S3 + presigned URLs
│       └── Large files → S3 multipart upload
│
├── Auth / identity?
│   └── Cognito (or Clerk/Auth.js + Lambda)
│
├── Secrets / config?
│   └── Secrets Manager (rotate-able)
│   └── Parameter Store (static, cheaper)
│
└── Monitoring?
    ├── Logs → CloudWatch Logs
    ├── Metrics → CloudWatch Metrics
    ├── Tracing → X-Ray
    └── Alerting → CloudWatch Alarms → SNS
```

---

## Deployment Tool Decision Tree

```
Your AWS experience?
│
├── Beginner / want fast setup?
│   └── SST (sst.dev)
│       ├── Deploys Next.js, Remix, Astro natively
│       ├── Live Lambda dev environment
│       └── TypeScript-first, batteries included
│
├── Intermediate / want full control?
│   └── AWS CDK
│       ├── TypeScript infrastructure-as-code
│       ├── Full AWS service coverage
│       └── Constructs library for common patterns
│
├── Multi-cloud / team standard?
│   └── Terraform
│       ├── HCL or CDK for Terraform (TypeScript)
│       ├── State management with S3 + DynamoDB
│       └── Works across AWS, GCP, Azure
│
├── Lambda-focused / existing?
│   └── Serverless Framework
│       ├── YAML config, plugin ecosystem
│       └── Good for pure Lambda architectures
│
└── Enterprise / compliance?
    └── Raw CloudFormation
        ├── Maximum control, auditable
        └── Verbose but transparent
```

---

## SST Quick Start (Recommended for Most Projects)

```bash
# Create new SST project
npx create-sst@latest my-app
cd my-app

# Configure (sst.config.ts)
# SST auto-detects Next.js, Remix, Astro

# Deploy to dev
npx sst dev

# Deploy to production
npx sst deploy --stage production
```

### Common SST Constructs

```typescript
// API
new Api(stack, "api", {
  routes: { "GET /": "functions/handler.main" }
});

// Static site
new StaticSite(stack, "site", {
  path: "frontend/",
  buildCommand: "npm run build",
  buildOutput: "dist",
});

// Next.js
new NextjsSite(stack, "site", { path: "frontend/" });

// Database
new RDS(stack, "db", {
  engine: "postgresql13.9",
  defaultDatabaseName: "mydb",
});

// S3 bucket
new Bucket(stack, "uploads");
```

---

## CDK Quick Start

```bash
npm install -g aws-cdk
cdk init app --language typescript
cdk deploy
```

---

## Cost Optimization

| Strategy | Savings | When |
|----------|---------|------|
| **Lambda** over ECS | 60-90% | Low/sporadic traffic |
| **Aurora Serverless** | 50-70% | Variable DB load |
| **S3 Intelligent-Tiering** | 30-50% | Mixed access patterns |
| **Reserved Instances** | 30-60% | Steady 24/7 workloads |
| **Spot Instances** (ECS) | 60-90% | Fault-tolerant batch jobs |

Run:
```bash
# Check current costs
aws ce get-cost-and-usage \
  --time-period Start=2026-01-01,End=2026-02-01 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

---

## Security Essentials

### IAM Principle of Least Privilege

```
NEVER use root account for deployments
NEVER use * permissions in production policies
ALWAYS use service-specific roles
ALWAYS enable MFA on all human accounts
```

### Secrets Management

```bash
# Store a secret
aws secretsmanager create-secret \
  --name "prod/db/password" \
  --secret-string "your-password"

# Retrieve in Lambda
import { SecretsManager } from '@aws-sdk/client-secrets-manager';
const client = new SecretsManager({});
const secret = await client.getSecretValue({ SecretId: 'prod/db/password' });
```

---

## ⛔ STOP GATE

DO NOT deploy to AWS production without:
1. IAM roles use least-privilege (no `*` permissions)
2. Secrets in Secrets Manager or Parameter Store (not env vars or code)
3. CloudWatch alarms set for critical metrics
4. Cost alerts configured in AWS Budgets
5. VPC configured if using RDS or ECS
