---
name: openapi
description: OpenAPI specification. Design, generate, and validate APIs.
last_updated: 2026-03
owner: Frank
---

# OpenAPI

Design-first API development.

> **See also:** `agents/backend-patterns/SKILL.md` for route patterns

---

## Context Questions

Before implementing OpenAPI:

1. **API purpose?** — Internal service vs public API
2. **Client generation needed?** — TypeScript, Python SDKs?
3. **Documentation priority?** — Interactive docs for devs?
4. **Validation needs?** — Request/response validation?
5. **Design-first or code-first?** — Spec before code or vice versa?

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Approach** | Code-first ←→ Design-first |
| **Audience** | Internal only ←→ Public API |
| **Tooling** | Minimal (manual) ←→ Full generation |
| **Validation** | None ←→ Strict request/response |
| **Documentation** | Basic ←→ Interactive (Swagger UI) |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Public API | Design-first + Swagger UI |
| Internal service | Code-first with extraction |
| Multiple clients | Generate SDKs from spec |
| tRPC already | May not need OpenAPI |
| API versioning | OpenAPI for contract stability |
| Quick iteration | Code-first, extract later |

---

## TL;DR

| Tool | Purpose |
|------|---------|
| **OpenAPI 3.1** | API specification format |
| **Swagger UI** | Interactive documentation |
| **Zod** | Runtime validation |
| **orval / openapi-typescript** | Code generation |

---

## Part 1: OpenAPI 3.1 Structure

```yaml
# openapi.yaml
openapi: 3.1.0
info:
  title: My API
  version: 1.0.0
  description: API for managing items

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: http://localhost:3000/api
    description: Development

paths:
  /items:
    get:
      summary: List all items
      operationId: listItems
      tags:
        - Items
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
        - name: cursor
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of items
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ItemList'
        '401':
          $ref: '#/components/responses/Unauthorized'

    post:
      summary: Create an item
      operationId: createItem
      tags:
        - Items
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateItem'
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Item'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

components:
  schemas:
    Item:
      type: object
      required:
        - id
        - name
        - createdAt
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
          minLength: 1
          maxLength: 100
        description:
          type: string
          nullable: true
        createdAt:
          type: string
          format: date-time

    CreateItem:
      type: object
      required:
        - name
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        description:
          type: string

    ItemList:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/Item'
        nextCursor:
          type: string
          nullable: true

    Error:
      type: object
      required:
        - error
        - message
      properties:
        error:
          type: string
        message:
          type: string

  responses:
    BadRequest:
      description: Bad request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    Unauthorized:
      description: Unauthorized
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    NotFound:
      description: Not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - BearerAuth: []
```

---

## Part 2: Generate TypeScript Types

```bash
npm install -D openapi-typescript
npx openapi-typescript ./openapi.yaml -o ./src/types/api.ts
```

```typescript
// Generated types usage
import type { paths, components } from "./types/api";

type Item = components["schemas"]["Item"];
type CreateItem = components["schemas"]["CreateItem"];

// Route types
type ListItemsResponse = paths["/items"]["get"]["responses"]["200"]["content"]["application/json"];
```

---

## Part 3: Generate API Client

```bash
npm install -D orval
```

```javascript
// orval.config.js
module.exports = {
  api: {
    input: "./openapi.yaml",
    output: {
      target: "./src/api/client.ts",
      client: "react-query",
      mode: "tags-split",
    },
  },
};
```

```bash
npx orval
```

```typescript
// Usage with React Query
import { useListItems, useCreateItem } from "./api/client";

function ItemsPage() {
  const { data, isLoading } = useListItems({ limit: 20 });
  const createItem = useCreateItem();

  const handleCreate = () => {
    createItem.mutate({ name: "New Item" });
  };

  return (
    <div>
      {data?.items.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  );
}
```

---

## Part 4: Zod Validation from OpenAPI

```bash
npm install zod
npm install -D @anatine/zod-openapi
```

```typescript
// Define Zod schemas that generate OpenAPI
import { z } from "zod";
import { extendZodWithOpenApi } from "@anatine/zod-openapi";

extendZodWithOpenApi(z);

export const ItemSchema = z.object({
  id: z.string().uuid().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
  name: z.string().min(1).max(100).openapi({ example: "My Item" }),
  description: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
}).openapi("Item");

export const CreateItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
}).openapi("CreateItem");

export type Item = z.infer<typeof ItemSchema>;
export type CreateItem = z.infer<typeof CreateItemSchema>;
```

---

## Part 5: Runtime Validation Middleware

### Next.js API Route

```typescript
// app/api/items/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CreateItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const result = CreateItemSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      {
        error: "validation_error",
        message: "Invalid request body",
        details: result.error.issues,
      },
      { status: 400 }
    );
  }
  
  const item = await createItem(result.data);
  
  return NextResponse.json(item, { status: 201 });
}
```

### Express Middleware

```typescript
import { z, ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: "validation_error",
        message: "Invalid request body",
        details: result.error.issues,
      });
    }
    
    req.body = result.data;
    next();
  };
}

// Usage
app.post("/items", validate(CreateItemSchema), createItemHandler);
```

---

## Part 6: Swagger UI

### Next.js Integration

```bash
npm install swagger-ui-react
```

```tsx
// app/docs/page.tsx
"use client";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function DocsPage() {
  return <SwaggerUI url="/openapi.yaml" />;
}
```

### Serve Spec File

```typescript
// app/openapi.yaml/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const specPath = path.join(process.cwd(), "openapi.yaml");
  const spec = fs.readFileSync(specPath, "utf-8");
  
  return new NextResponse(spec, {
    headers: { "Content-Type": "text/yaml" },
  });
}
```

---

## Part 7: OpenAPI for AI Consumption

AI agents can read OpenAPI specs to understand your API:

```yaml
# Add descriptions for AI understanding
paths:
  /items:
    post:
      summary: Create an item
      description: |
        Creates a new item in the system.
        
        **Rate limit:** 100 requests per minute
        **Auth required:** Yes (Bearer token)
        
        Example use cases:
        - Creating a new product listing
        - Adding a task to a project
```

### Generate API Docs for AI

```typescript
// Generate markdown from OpenAPI for AI context
import SwaggerParser from "@apidevtools/swagger-parser";

async function generateAIDocs(specPath: string) {
  const api = await SwaggerParser.parse(specPath);
  
  let docs = `# API Reference: ${api.info.title}\n\n`;
  
  for (const [path, methods] of Object.entries(api.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      docs += `## ${method.toUpperCase()} ${path}\n`;
      docs += `${operation.summary}\n\n`;
      docs += `${operation.description || ""}\n\n`;
    }
  }
  
  return docs;
}
```

---

## Part 8: Best Practices

### Naming Conventions

```yaml
# operationId: camelCase, action + resource
operationId: listItems     # GET /items
operationId: createItem    # POST /items
operationId: getItem       # GET /items/{id}
operationId: updateItem    # PUT /items/{id}
operationId: deleteItem    # DELETE /items/{id}
```

### Consistent Error Responses

```yaml
components:
  schemas:
    Error:
      type: object
      required: [error, message]
      properties:
        error:
          type: string
          enum:
            - validation_error
            - not_found
            - unauthorized
            - forbidden
            - internal_error
        message:
          type: string
        details:
          type: object
```

### Pagination

```yaml
# Cursor-based (recommended)
parameters:
  - name: cursor
    in: query
    schema:
      type: string
  - name: limit
    in: query
    schema:
      type: integer
      default: 20
      maximum: 100

# Response
ItemList:
  properties:
    items:
      type: array
    nextCursor:
      type: string
      nullable: true
```

---

## Checklist

```markdown
- [ ] OpenAPI spec created
- [ ] All endpoints documented
- [ ] Request/response schemas defined
- [ ] Error responses standardized
- [ ] TypeScript types generated
- [ ] API client generated
- [ ] Validation middleware in place
- [ ] Swagger UI available
```

---

## Resources

- OpenAPI Spec: <https://spec.openapis.org/oas/v3.1.0>
- Swagger Editor: <https://editor.swagger.io/>
- orval: <https://orval.dev/>
- openapi-typescript: <https://github.com/drwpow/openapi-typescript>

---

## Related Skills

- `agents/backend-patterns/SKILL.md` — Route patterns
- `agents/error-handling/SKILL.md` — Error responses
- `agents/testing/SKILL.md` — API testing
