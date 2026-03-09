---
name: cloud-azure
description: Azure cloud deployment. App Service, Functions, Container Instances, Azure OpenAI.
last_updated: 2026-03
owner: Frank
---

# Azure Cloud

Deploy and scale on Microsoft Azure.

> **See also:** `agents/cloud-aws/SKILL.md`, `agents/cloud-google/SKILL.md`

---

## Context Questions

Before deploying to Azure:

1. **Why Azure?** — Enterprise/Microsoft shop, Azure OpenAI, existing Azure credits
2. **What's the deployment model?** — App Service (PaaS), Functions (serverless), containers
3. **What AI needs?** — Azure OpenAI for GPT-4, embeddings, enterprise compliance
4. **What's the DevOps setup?** — Azure DevOps, GitHub Actions, or manual
5. **Infrastructure as code?** — Bicep, Terraform, or portal

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Compute** | App Service ←→ Functions ←→ ACI ←→ AKS |
| **AI** | None ←→ Azure OpenAI ←→ Cognitive Services |
| **IaC** | Portal (manual) ←→ Bicep ←→ Terraform |
| **CI/CD** | GitHub Actions ←→ Azure DevOps |
| **Secrets** | Environment vars ←→ Key Vault |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Enterprise/Microsoft shop | Azure (natural fit) |
| Need Azure OpenAI | Required for GPT-4 with enterprise compliance |
| .NET backend | App Service (best support) |
| Serverless | Azure Functions |
| Container workloads | ACI (simple) or AKS (complex) |
| Already using GitHub | GitHub Actions over Azure DevOps |

---

## TL;DR

| Service | Use Case |
|---------|----------|
| **App Service** | Web apps, APIs |
| **Functions** | Serverless, event-driven |
| **Container Instances** | Quick containers |
| **Azure OpenAI** | GPT-4, embeddings |
| **Key Vault** | Secrets |
| **DevOps** | CI/CD pipelines |

---

## Part 1: Azure App Service

### Deploy Next.js App

```bash
# Install Azure CLI
brew install azure-cli

# Login
az login

# Create resource group
az group create --name myapp-rg --location eastus

# Create App Service plan
az appservice plan create \
  --name myapp-plan \
  --resource-group myapp-rg \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --name myapp-prod \
  --resource-group myapp-rg \
  --plan myapp-plan \
  --runtime "NODE:20-lts"

# Deploy from GitHub
az webapp deployment source config \
  --name myapp-prod \
  --resource-group myapp-rg \
  --repo-url https://github.com/user/repo \
  --branch main \
  --manual-integration
```

### Staging Slots

```bash
# Create staging slot
az webapp deployment slot create \
  --name myapp-prod \
  --resource-group myapp-rg \
  --slot staging

# Deploy to staging
az webapp deployment source config \
  --name myapp-prod \
  --resource-group myapp-rg \
  --slot staging \
  --repo-url https://github.com/user/repo \
  --branch develop

# Swap staging to production
az webapp deployment slot swap \
  --name myapp-prod \
  --resource-group myapp-rg \
  --slot staging \
  --target-slot production
```

### Environment Variables

```bash
# Set app settings
az webapp config appsettings set \
  --name myapp-prod \
  --resource-group myapp-rg \
  --settings \
    DATABASE_URL="@Microsoft.KeyVault(SecretUri=https://myvault.vault.azure.net/secrets/db-url)" \
    NODE_ENV="production"
```

---

## Part 2: Azure Functions

### HTTP Trigger (TypeScript)

```typescript
// src/functions/hello.ts
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function hello(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("HTTP trigger function processed a request.");

  const name = request.query.get("name") || (await request.text()) || "World";

  return {
    status: 200,
    jsonBody: { message: `Hello, ${name}!` },
  };
}

app.http("hello", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: hello,
});
```

### Queue Trigger

```typescript
// src/functions/processQueue.ts
import { app, InvocationContext } from "@azure/functions";

interface QueueMessage {
  userId: string;
  action: string;
}

export async function processQueue(
  message: QueueMessage,
  context: InvocationContext
): Promise<void> {
  context.log("Queue trigger processed:", message);

  // Process the message
  await handleUserAction(message.userId, message.action);
}

app.storageQueue("processQueue", {
  queueName: "user-actions",
  connection: "AzureWebJobsStorage",
  handler: processQueue,
});
```

### Timer Trigger (Cron)

```typescript
// src/functions/dailyCleanup.ts
import { app, InvocationContext, Timer } from "@azure/functions";

export async function dailyCleanup(
  timer: Timer,
  context: InvocationContext
): Promise<void> {
  context.log("Timer trigger executed at:", new Date().toISOString());

  if (timer.isPastDue) {
    context.log("Timer is past due!");
  }

  await performCleanup();
}

app.timer("dailyCleanup", {
  // Every day at 2 AM UTC
  schedule: "0 0 2 * * *",
  handler: dailyCleanup,
});
```

### Deploy Functions

```bash
# Create Function App
az functionapp create \
  --name myapp-functions \
  --resource-group myapp-rg \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4 \
  --storage-account mystorageaccount

# Deploy
func azure functionapp publish myapp-functions
```

---

## Part 3: Azure Container Instances

### Quick Container Deployment

```bash
# Deploy container
az container create \
  --name myapp-container \
  --resource-group myapp-rg \
  --image myregistry.azurecr.io/myapp:latest \
  --cpu 1 \
  --memory 1.5 \
  --ports 80 \
  --environment-variables \
    DATABASE_URL="..." \
    NODE_ENV="production"

# Get public IP
az container show \
  --name myapp-container \
  --resource-group myapp-rg \
  --query ipAddress.ip \
  --output tsv
```

### With Azure Container Registry

```bash
# Create registry
az acr create \
  --name myregistry \
  --resource-group myapp-rg \
  --sku Basic

# Login to registry
az acr login --name myregistry

# Build and push
docker build -t myregistry.azurecr.io/myapp:latest .
docker push myregistry.azurecr.io/myapp:latest

# Deploy with registry credentials
az container create \
  --name myapp-container \
  --resource-group myapp-rg \
  --image myregistry.azurecr.io/myapp:latest \
  --registry-login-server myregistry.azurecr.io \
  --registry-username $(az acr credential show -n myregistry --query username -o tsv) \
  --registry-password $(az acr credential show -n myregistry --query passwords[0].value -o tsv)
```

### ACI vs AKS Decision

| Use ACI | Use AKS |
|---------|---------|
| Simple, single containers | Complex multi-container apps |
| Quick deployments | Need orchestration |
| Dev/test environments | Production at scale |
| Batch jobs | Long-running services |

---

## Part 4: Azure OpenAI Service

### Setup

```bash
# Create Azure OpenAI resource
az cognitiveservices account create \
  --name myapp-openai \
  --resource-group myapp-rg \
  --kind OpenAI \
  --sku S0 \
  --location eastus

# Deploy a model
az cognitiveservices account deployment create \
  --name myapp-openai \
  --resource-group myapp-rg \
  --deployment-name gpt-4o \
  --model-name gpt-4o \
  --model-version "2024-08-06" \
  --model-format OpenAI \
  --sku-capacity 10 \
  --sku-name Standard
```

### Chat Completions (Python)

```python
from openai import AzureOpenAI

client = AzureOpenAI(
    api_key=os.environ["AZURE_OPENAI_API_KEY"],
    api_version="2024-08-01-preview",
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
)

response = client.chat.completions.create(
    model="gpt-4o",  # deployment name
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is the capital of France?"},
    ],
    temperature=0.7,
    max_tokens=500,
)

print(response.choices[0].message.content)
```

### Chat Completions (TypeScript)

```typescript
import { AzureOpenAI } from "openai";

const client = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  apiVersion: "2024-08-01-preview",
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
});

async function chat(prompt: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: "gpt-4o", // deployment name
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0].message.content ?? "";
}
```

### Embeddings

```python
response = client.embeddings.create(
    model="text-embedding-3-small",  # deployment name
    input="The quick brown fox jumps over the lazy dog",
)

embedding = response.data[0].embedding
print(f"Embedding dimension: {len(embedding)}")
```

### Content Filtering

Azure OpenAI has built-in content filtering:

```python
try:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
    )
except openai.BadRequestError as e:
    if "content_filter" in str(e):
        print("Content was filtered by Azure")
        # Handle filtered content
```

### Azure OpenAI vs AWS Bedrock

| Azure OpenAI | AWS Bedrock |
|--------------|-------------|
| OpenAI models only | Multi-provider (Claude, Llama, etc.) |
| OpenAI SDK compatible | AWS SDK required |
| Built-in content filtering | Guardrails separate |
| Enterprise RBAC | IAM-based |

---

## Part 5: Azure Key Vault

### Create and Store Secrets

```bash
# Create Key Vault
az keyvault create \
  --name myapp-vault \
  --resource-group myapp-rg \
  --location eastus

# Store secrets
az keyvault secret set \
  --vault-name myapp-vault \
  --name "database-url" \
  --value "postgresql://..."

az keyvault secret set \
  --vault-name myapp-vault \
  --name "openai-key" \
  --value "sk-..."
```

### Access from App Service (Managed Identity)

```bash
# Enable managed identity
az webapp identity assign \
  --name myapp-prod \
  --resource-group myapp-rg

# Get identity principal ID
PRINCIPAL_ID=$(az webapp identity show \
  --name myapp-prod \
  --resource-group myapp-rg \
  --query principalId \
  --output tsv)

# Grant access to Key Vault
az keyvault set-policy \
  --name myapp-vault \
  --object-id $PRINCIPAL_ID \
  --secret-permissions get list

# Reference in app settings
az webapp config appsettings set \
  --name myapp-prod \
  --resource-group myapp-rg \
  --settings \
    DATABASE_URL="@Microsoft.KeyVault(VaultName=myapp-vault;SecretName=database-url)"
```

### Access from Code (Python)

```python
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient

credential = DefaultAzureCredential()
vault_url = "https://myapp-vault.vault.azure.net"
client = SecretClient(vault_url=vault_url, credential=credential)

# Get secret
secret = client.get_secret("database-url")
database_url = secret.value
```

---

## Part 6: Azure DevOps CI/CD

### Pipeline YAML

```yaml
# azure-pipelines.yml
trigger:
  - main

pool:
  vmImage: "ubuntu-latest"

variables:
  - group: myapp-secrets

stages:
  - stage: Build
    jobs:
      - job: BuildApp
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: "20.x"

          - script: |
              npm ci
              npm run build
              npm run test
            displayName: "Build and Test"

          - task: ArchiveFiles@2
            inputs:
              rootFolderOrFile: "$(Build.SourcesDirectory)"
              includeRootFolder: false
              archiveType: "zip"
              archiveFile: "$(Build.ArtifactStagingDirectory)/app.zip"

          - publish: $(Build.ArtifactStagingDirectory)/app.zip
            artifact: drop

  - stage: DeployStaging
    dependsOn: Build
    condition: succeeded()
    jobs:
      - deployment: DeployToStaging
        environment: "staging"
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureWebApp@1
                  inputs:
                    azureSubscription: "MyAzureSubscription"
                    appName: "myapp-prod"
                    slotName: "staging"
                    package: "$(Pipeline.Workspace)/drop/app.zip"

  - stage: DeployProduction
    dependsOn: DeployStaging
    condition: succeeded()
    jobs:
      - deployment: DeployToProduction
        environment: "production"
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureAppServiceManage@0
                  inputs:
                    azureSubscription: "MyAzureSubscription"
                    action: "Swap Slots"
                    webAppName: "myapp-prod"
                    resourceGroupName: "myapp-rg"
                    sourceSlot: "staging"
                    targetSlot: "production"
```

### GitHub Actions Alternative

```yaml
# .github/workflows/azure.yml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install and Build
        run: |
          npm ci
          npm run build

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: myapp-prod
          slot-name: staging
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: .
```

---

## Part 7: Bicep (Infrastructure as Code)

```bicep
// main.bicep
param location string = resourceGroup().location
param appName string = 'myapp'

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '${appName}-plan'
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// Web App
resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: '${appName}-web'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appSettings: [
        {
          name: 'NODE_ENV'
          value: 'production'
        }
      ]
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
}

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: '${appName}-vault'
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: webApp.identity.principalId
        permissions: {
          secrets: ['get', 'list']
        }
      }
    ]
  }
}

output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
```

Deploy:

```bash
az deployment group create \
  --resource-group myapp-rg \
  --template-file main.bicep \
  --parameters appName=myapp
```

---

## Checklist

```markdown
- [ ] Resource group created
- [ ] App Service deployed
- [ ] Staging slot configured
- [ ] Environment variables set
- [ ] Key Vault configured
- [ ] Managed identity enabled
- [ ] CI/CD pipeline set up
- [ ] Azure OpenAI configured (if using)
```

---

## Resources

- Azure CLI: <https://learn.microsoft.com/en-us/cli/azure/>
- Azure Functions: <https://learn.microsoft.com/en-us/azure/azure-functions/>
- Azure OpenAI: <https://learn.microsoft.com/en-us/azure/ai-services/openai/>
- Bicep: <https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/>

---

## Related Skills

- `agents/cloud-aws/SKILL.md` — AWS patterns
- `agents/cloud-google/SKILL.md` — GCP patterns
- `agents/deployment/SKILL.md` — General deployment
- `ai-builder/aws-bedrock/SKILL.md` — Compare with Bedrock
