---
name: google-workspace
description: Google Workspace integration. Sheets as database, Docs API, Gmail API.
last_updated: 2026-03
owner: Frank
---

# Google Workspace Skill

**Integrate Google Sheets, Docs, Gmail for rapid prototyping.**

> **See also:** `agents/n8n/SKILL.md` for workflow automation

---

## Context Questions

Before using Google Workspace APIs, ask:

1. **What's the use case?** — Quick database, reports, email automation
2. **What scale?** — < 1000 rows (Sheets), larger needs real DB
3. **What auth?** — Service account vs user OAuth
4. **What services?** — Sheets, Docs, Gmail, Drive
5. **Who updates data?** — Non-tech team, automated, developers

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Scale** | MVP (<1000 rows) ←→ Production DB |
| **Auth** | Service account ←→ User OAuth |
| **Use Case** | Read only ←→ Full CRUD |
| **Audience** | Internal tools ←→ Customer-facing |
| **Integration** | Direct API ←→ n8n automation |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| MVP database | Sheets API + service account |
| Client has Excel | Import to Sheets, expose API |
| Generate reports | Docs API for templates |
| Send notifications | Gmail API or Resend |
| Non-tech updates | Sheets as CMS |
| > 1000 rows | Graduate to Supabase/Postgres |

---

## TL;DR

```bash
npm install googleapis
```

| Service | Use Case | Setup Time |
|---------|----------|------------|
| **Sheets** | Quick database, data import/export | 20 min |
| **Docs** | Generate reports, contracts | 15 min |
| **Gmail** | Send from @gmail.com | 15 min |

---

## Part 1: Setup (One-Time)

### Google Cloud Console

1. Go to console.cloud.google.com
2. Create project
3. Enable APIs: Sheets, Docs, Gmail
4. Create Service Account
5. Download JSON key
6. Share Sheet/Doc with service account email

---

## Part 2: Google Sheets as Database

### Read Data

```typescript
// lib/sheets.ts
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT!),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function getSheetData(spreadsheetId: string, range: string) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range, // 'Sheet1!A1:D100'
  });
  
  return response.data.values || [];
}
```

### Write Data

```typescript
export async function appendToSheet(
  spreadsheetId: string,
  range: string,
  values: string[][]
) {
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
}

// Usage
await appendToSheet(
  'sheet-id-here',
  'Sheet1!A:D',
  [['John', 'john@example.com', '2025-01-01', 'Active']]
);
```

---

## Part 3: Use Cases

| Pattern | When to Use | Example |
|---------|-------------|---------|
| **MVP Database** | Testing ideas, < 1000 rows | Contact list, orders |
| **Data Import** | Client has Excel/CSV | Import to app DB |
| **Reporting** | Generate exports | Daily sales report |
| **CMS** | Non-tech content updates | Blog posts, FAQs |

---

## Part 4: Google Docs API

### Generate Report

```typescript
import { google } from 'googleapis';

const docs = google.docs({ version: 'v1', auth });

export async function createReport(title: string, content: string) {
  const doc = await docs.documents.create({
    requestBody: { title },
  });
  
  await docs.documents.batchUpdate({
    documentId: doc.data.documentId!,
    requestBody: {
      requests: [{
        insertText: {
          location: { index: 1 },
          text: content,
        },
      }],
    },
  });
  
  return doc.data.documentId;
}
```

---

## Part 5: Gmail API

### Send Email

```typescript
const gmail = google.gmail({ version: 'v1', auth });

export async function sendEmail(to: string, subject: string, body: string) {
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    '',
    body,
  ].join('\n');
  
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });
}
```

---

## Part 6: Consistency Checker Integration

**How Sheets help consistency:**
- Design tokens in Sheet → import to app
- Component inventory tracking
- Style guide reference

---

## Resources

- Docs: https://developers.google.com/sheets/api
- Auth: https://cloud.google.com/docs/authentication

---

## Related Skills

- `agents/database/SKILL.md` - When to graduate to real DB
- `workflows/consistency/SKILL.md` - Design system sync
