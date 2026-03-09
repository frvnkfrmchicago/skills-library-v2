---
name: azure-building
description: >
  Architects and deploys applications on Microsoft Azure. Includes a service
  selection decision tree for App Service, Functions, AKS, Azure OpenAI,
  Cosmos DB, Key Vault, and Blob Storage. Covers deployment with Bicep,
  Terraform, and Azure DevOps CI/CD. Use when building on Azure, choosing
  Azure services, deploying App Service or Functions, integrating Azure
  OpenAI, or setting up Key Vault and managed identity.
---

# Azure Building

Architect and deploy on Microsoft Azure. Leverage enterprise services,
Azure OpenAI, and managed identity for secure, scalable applications.

---

## ⛔ STOP — Context First

Before architecting on Azure, determine:

1. **Why Azure?** Enterprise, Microsoft shop, Azure OpenAI access, existing credits?
2. **What are you deploying?** Web app, API, containers, AI workload?
3. **AI needs?** Azure OpenAI for GPT-4, Cognitive Services?
4. **DevOps setup?** Azure DevOps, GitHub Actions?
5. **Infrastructure as code?** Bicep, Terraform, or portal?

---

## Service Selection Decision Tree

```
What do you need?
│
├── Web application / API?
│   ├── Simple web app → App Service (PaaS, easiest)
│   ├── Serverless functions → Azure Functions
│   ├── Quick container run → Container Instances
│   └── Complex containers → AKS (Kubernetes)
│
├── AI / LLM workloads?
│   ├── GPT-4, embeddings → Azure OpenAI Service
│   ├── Vision, speech, language → Cognitive Services
│   └── Custom models → Azure Machine Learning
│
├── Database?
│   ├── Relational SQL → Azure SQL Database
│   ├── PostgreSQL → Azure Database for PostgreSQL
│   ├── Global NoSQL → Cosmos DB
│   └── In-memory cache → Azure Cache for Redis
│
├── Storage?
│   ├── Files, images, blobs → Blob Storage
│   ├── File shares → Azure Files
│   └── CDN → Azure CDN or Front Door
│
├── Auth / Identity?
│   ├── Azure AD B2C (consumer apps)
│   ├── Azure AD (enterprise apps)
│   └── Managed Identity (service-to-service, NO credentials)
│
├── Secrets / Config?
│   └── Key Vault (always — secrets, certificates, keys)
│       ├── Access via Managed Identity (no credentials in code)
│       └── Enable soft-delete and purge protection
│
├── CI/CD?
│   ├── Azure DevOps Pipelines
│   └── GitHub Actions (with Azure login action)
│
└── Monitoring?
    ├── Application Insights (APM)
    ├── Azure Monitor (infrastructure)
    └── Log Analytics (centralized logging)
```

---

## Deployment Tool Decision Tree

```
Your preference?
│
├── Azure-native IaC?
│   └── Bicep
│       ├── First-class Azure support
│       ├── Simpler than ARM templates
│       └── Azure CLI integration
│
├── Multi-cloud / standard?
│   └── Terraform
│       ├── azurerm provider
│       ├── State in Azure Storage Account
│       └── Works across clouds
│
├── Quick / click-based?
│   └── Azure Portal + Azure CLI
│       ├── Good for prototyping
│       └── NOT for production (not reproducible)
│
└── .NET ecosystem?
    └── Azure Developer CLI (azd)
        ├── Template-based
        └── Integrated with VS Code
```

---

## App Service Quick Start

```bash
# Create resource group
az group create --name myapp-rg --location eastus

# Create App Service plan
az appservice plan create \
  --name myapp-plan \
  --resource-group myapp-rg \
  --sku B1 --is-linux

# Create web app
az webapp create \
  --name myapp \
  --resource-group myapp-rg \
  --plan myapp-plan \
  --runtime "NODE:22-lts"

# Deploy from GitHub
az webapp deployment source config \
  --name myapp \
  --resource-group myapp-rg \
  --repo-url https://github.com/USER/REPO \
  --branch main
```

---

## Azure Functions Quick Start

```bash
# Install tools
npm install -g azure-functions-core-tools@4

# Create function project
func init myapi --typescript
cd myapi
func new --name hello --template "HTTP trigger"

# Run locally
func start

# Deploy
func azure functionapp publish myapi-func
```

---

## Key Vault + Managed Identity (Security Best Practice)

```bash
# Create Key Vault
az keyvault create \
  --name myapp-vault \
  --resource-group myapp-rg

# Store secret
az keyvault secret set \
  --vault-name myapp-vault \
  --name "DatabaseUrl" \
  --value "postgres://..."

# Enable managed identity on App Service
az webapp identity assign \
  --name myapp \
  --resource-group myapp-rg

# Grant access to Key Vault
az keyvault set-policy \
  --name myapp-vault \
  --object-id <identity-principal-id> \
  --secret-permissions get list
```

**NEVER** hardcode secrets. **ALWAYS** use Key Vault + Managed Identity.

---

## Azure OpenAI Integration

```bash
# Create Azure OpenAI resource
az cognitiveservices account create \
  --name myapp-openai \
  --resource-group myapp-rg \
  --kind OpenAI \
  --sku S0 \
  --location eastus
```

```typescript
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

const client = new OpenAIClient(
  "https://myapp-openai.openai.azure.com/",
  new AzureKeyCredential(process.env.AZURE_OPENAI_KEY!)
);

const result = await client.getChatCompletions("gpt-4", [
  { role: "user", content: "Hello" }
]);
```

---

## GitHub Actions for Azure

```yaml
name: Deploy to Azure
on:
  push: { branches: [main] }
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      - uses: azure/webapps-deploy@v3
        with:
          app-name: myapp
          package: .
```

---

## ⛔ STOP GATE

DO NOT deploy to Azure production without:
1. Key Vault for ALL secrets (no env vars with credentials)
2. Managed Identity enabled on all services
3. Application Insights connected for monitoring
4. RBAC configured (no classic admin access)
5. Resource locks on production resource groups
