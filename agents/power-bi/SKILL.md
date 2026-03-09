---
name: power-bi
description: Power BI analytics. DAX, data modeling, embedding in web apps, RLS, Python integration.
last_updated: 2026-03
owner: Frank
---

# Power BI

Enterprise business intelligence done right.

> **See also:** `agents/analytics/SKILL.md`, `agents/data-analytics/SKILL.md`

---

## Context Questions

Before building Power BI solutions:

1. **Who's the audience?** — Business users, analysts, executives, external clients
2. **What's the data source?** — SQL Server, Excel, APIs, Dataverse
3. **How will it be accessed?** — Desktop, web, mobile, embedded in app
4. **What security model?** — Open access, RLS by role, tenant isolation
5. **What's the refresh frequency?** — Real-time, hourly, daily, manual

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Complexity** | Simple KPI cards ←→ Complex DAX models |
| **Data Volume** | Small datasets ←→ Billions of rows |
| **Access Model** | Self-service ←→ IT-managed |
| **Deployment** | Power BI Service ←→ Embedded in apps |
| **Security** | Open ←→ Row-level security |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Business users, simple needs | Pre-built templates + Import mode |
| Large datasets | DirectQuery or Aggregations |
| Embedded in product | Power BI Embedded + RLS |
| Real-time dashboards | DirectQuery + streaming datasets |
| Microsoft 365 environment | Native integrations (Teams, SharePoint) |
| Complex calculations | DAX measures + calculated tables |

---

## TL;DR

| Topic | Key Points |
|-------|------------|
| **DAX** | CALCULATE, FILTER, time intelligence |
| **Modeling** | Star schema, facts, dimensions |
| **Embedding** | Power BI Embedded, JS SDK |
| **RLS** | Row-level security with DAX |
| **Python** | Custom visuals, dataflows |

---

## Part 1: DAX Fundamentals

### Measures vs Calculated Columns

| Type | When to Use | Evaluates |
|------|-------------|-----------|
| Measure | Aggregations, KPIs | At query time |
| Calculated Column | Row-level data | At data refresh |

```dax
// Measure - aggregates at query time
Total Sales = SUM(Sales[Amount])

// Calculated Column - computed per row at refresh
Profit Margin = Sales[Revenue] - Sales[Cost]
```

### Core Functions

#### CALCULATE

```dax
// Change filter context
West Sales = 
CALCULATE(
    SUM(Sales[Amount]),
    Region[Name] = "West"
)

// Multiple filters (AND)
West Sales 2024 = 
CALCULATE(
    SUM(Sales[Amount]),
    Region[Name] = "West",
    'Date'[Year] = 2024
)
```

#### FILTER

```dax
// Row-level filter
High Value Sales = 
CALCULATE(
    SUM(Sales[Amount]),
    FILTER(
        Sales,
        Sales[Amount] > 1000
    )
)
```

#### ALL

```dax
// Remove all filters from table
% of Total = 
DIVIDE(
    SUM(Sales[Amount]),
    CALCULATE(SUM(Sales[Amount]), ALL(Sales))
)

// Remove filter from specific column
% of Category = 
DIVIDE(
    SUM(Sales[Amount]),
    CALCULATE(SUM(Sales[Amount]), ALL(Product[Name]))
)
```

### Time Intelligence

```dax
// Year-to-Date
Sales YTD = 
TOTALYTD(SUM(Sales[Amount]), 'Date'[Date])

// Month-to-Date
Sales MTD = 
TOTALMTD(SUM(Sales[Amount]), 'Date'[Date])

// Previous Year
Sales PY = 
CALCULATE(
    SUM(Sales[Amount]),
    SAMEPERIODLASTYEAR('Date'[Date])
)

// Year-over-Year %
YoY % = 
DIVIDE(
    [Total Sales] - [Sales PY],
    [Sales PY]
)

// Rolling 12 Months
Rolling 12M = 
CALCULATE(
    SUM(Sales[Amount]),
    DATESINPERIOD(
        'Date'[Date],
        MAX('Date'[Date]),
        -12,
        MONTH
    )
)
```

### Row Context vs Filter Context

```dax
// Row context - iterates row by row
Running Total = 
SUMX(
    FILTER(
        Sales,
        Sales[Date] <= EARLIER(Sales[Date])
    ),
    Sales[Amount]
)

// Filter context - applies to entire query
Filtered Sum = 
CALCULATE(
    SUM(Sales[Amount])  -- No row context here
)
```

---

## Part 2: Data Modeling

### Star Schema Design

```
                     ┌──────────────┐
                     │   Date       │
                     │  (Dimension) │
                     └──────┬───────┘
                            │
┌──────────────┐     ┌──────┴───────┐     ┌──────────────┐
│   Product    │─────│    Sales     │─────│   Customer   │
│  (Dimension) │     │    (Fact)    │     │  (Dimension) │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────┴───────┐
                     │    Region    │
                     │  (Dimension) │
                     └──────────────┘
```

### Fact vs Dimension Tables

| Table Type | Contains | Example |
|------------|----------|---------|
| Fact | Measures, foreign keys | Sales, Orders, Transactions |
| Dimension | Attributes, context | Date, Product, Customer |

### Relationships

```
// 1:N (One-to-Many) - Most common
Product[ProductID] → Sales[ProductID]
- One product can appear in many sales

// M:N (Many-to-Many) - Via bridge table
Customer ← CustomerProduct → Product
- Many customers buy many products

// Bidirectional - Use sparingly
Product ↔ Sales
- Can filter both directions (performance impact)
```

### Role-Playing Dimensions

```dax
// Date table used for multiple purposes
Sales
├── OrderDate → Date (active)
├── ShipDate → Date (inactive)
└── DueDate → Date (inactive)

// Usage with inactive relationship
Shipped Sales = 
CALCULATE(
    SUM(Sales[Amount]),
    USERELATIONSHIP(Sales[ShipDate], 'Date'[Date])
)
```

---

## Part 3: Report Design

### Visualization Best Practices

| Chart Type | Use For |
|------------|---------|
| Bar/Column | Comparisons across categories |
| Line | Trends over time |
| Pie/Donut | Part-to-whole (max 5 slices) |
| Table/Matrix | Detailed data exploration |
| Card | Single KPI values |
| Map | Geographic data |
| Scatter | Correlation between metrics |

### Bookmarks and Drillthrough

```markdown
## Bookmarks
1. Create multiple page views
2. Save filter states
3. Use for storytelling navigation
4. Combine with buttons for custom nav

## Drillthrough
1. Right-click context menu
2. Navigate from summary → detail
3. Carries filter context automatically
4. Create dedicated drillthrough pages
```

### Conditional Formatting

```dax
// Background color based on value
Color = 
SWITCH(
    TRUE(),
    [Value] < 50, "#FF6B6B",   // Red
    [Value] < 80, "#FFE66D",   // Yellow
    "#4ECDC4"                   // Green
)

// Icon sets
Status Icon = 
SWITCH(
    TRUE(),
    [Completion] >= 1, "✅",
    [Completion] >= 0.5, "🔶",
    "❌"
)
```

### Mobile Layouts

1. Design → Mobile Layout
2. Rearrange visuals for portrait
3. Test on mobile app
4. Keep it simple (fewer visuals)

---

## Part 4: Embedding in Web Apps

### Power BI Embedded Setup

```javascript
// 1. Register Azure AD app
// 2. Get workspace and report IDs
// 3. Generate embed token

const config = {
  type: 'report',
  id: 'your-report-id',
  embedUrl: 'https://app.powerbi.com/reportEmbed?...',
  accessToken: 'eyJ...',  // From your backend
  settings: {
    filterPaneEnabled: false,
    navContentPaneEnabled: true
  }
};
```

### JavaScript SDK

```html
<script src="https://cdn.jsdelivr.net/npm/powerbi-client@2.21.0/dist/powerbi.min.js"></script>
```

```javascript
import * as pbi from 'powerbi-client';

const powerbi = new pbi.service.Service(
  pbi.factories.hpmFactory,
  pbi.factories.wpmpFactory,
  pbi.factories.routerFactory
);

// Embed
const container = document.getElementById('report-container');
const report = powerbi.embed(container, config);

// Events
report.on('loaded', () => console.log('Report loaded'));
report.on('error', (event) => console.error(event.detail));

// Programmatic control
await report.setPage('ReportSection123');
await report.setFilters([{
  $schema: 'http://powerbi.com/product/schema#basic',
  target: { table: 'Sales', column: 'Region' },
  operator: 'In',
  values: ['West']
}]);
```

### React Integration

```tsx
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';

function PowerBIReport({ reportId, accessToken }) {
  return (
    <PowerBIEmbed
      embedConfig={{
        type: 'report',
        id: reportId,
        accessToken,
        embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${reportId}`,
        tokenType: models.TokenType.Embed,
        settings: {
          panes: {
            filters: { visible: false },
            pageNavigation: { visible: true }
          }
        }
      }}
      cssClassName="report-container"
      eventHandlers={new Map([
        ['loaded', () => console.log('Report loaded')],
        ['error', (event) => console.error(event.detail)]
      ])}
    />
  );
}
```

### Token Authentication

```typescript
// Backend: Generate embed token
import { PowerBIClient } from '@azure/arm-powerbi';
import { DefaultAzureCredential } from '@azure/identity';

async function getEmbedToken(reportId: string, workspaceId: string) {
  const credential = new DefaultAzureCredential();
  const client = new PowerBIClient(credential);
  
  const token = await client.reports.generateToken(
    workspaceId,
    reportId,
    {
      accessLevel: 'View',
      identities: [{
        username: 'user@example.com',
        roles: ['Sales'],
        datasets: ['dataset-id']
      }]
    }
  );
  
  return token.token;
}
```

---

## Part 5: Row-Level Security (RLS)

### Define Roles in Power BI Desktop

```dax
// Role: Sales Rep
// Table: Sales
[SalesRepEmail] = USERPRINCIPALNAME()

// Role: Regional Manager
// Table: Region
[ManagerEmail] = USERPRINCIPALNAME()
OR [Region] IN {"East", "West"}  // Static
```

### Dynamic RLS with Security Table

```dax
// Security table structure:
// UserEmail | Region | Department

// DAX filter on Sales table
LOOKUPVALUE(
    Security[Region],
    Security[UserEmail],
    USERPRINCIPALNAME()
) = Sales[Region]
```

### Testing RLS

1. Modeling → View as Roles
2. Select role(s) to test
3. Optionally enter "Other user" email
4. Verify data is filtered correctly

### RLS in Embedded Reports

```typescript
// Include identity in embed token request
const tokenRequest = {
  accessLevel: 'View',
  identities: [{
    username: 'user@example.com',
    roles: ['SalesRep'],  // Must match role name
    datasets: ['dataset-guid']
  }]
};
```

---

## Part 6: Python/R Integration

### Python Visuals

```python
# In Power BI visual
import matplotlib.pyplot as plt
import pandas as pd

# 'dataset' is auto-provided by Power BI
df = dataset  # Contains selected fields

# Create visualization
fig, ax = plt.subplots(figsize=(8, 6))
df.groupby('Category')['Sales'].sum().plot(kind='bar', ax=ax)
plt.title('Sales by Category')
plt.xticks(rotation=45)
plt.tight_layout()

# plt.show() is called automatically
```

### Python in Power Query

```python
# Transform 'dataset' dataframe
import pandas as pd

df = dataset
df['processed'] = df['text'].str.lower()
df['year'] = pd.to_datetime(df['date']).dt.year
```

### R Scripts

```r
# In Power BI visual
library(ggplot2)

# 'dataset' is auto-provided
ggplot(dataset, aes(x = Category, y = Sales, fill = Category)) +
  geom_bar(stat = "identity") +
  theme_minimal() +
  labs(title = "Sales by Category")
```

### Dataflow with Python

```python
# In Dataflows (Power Query Online)
import pandas as pd
from sklearn.preprocessing import StandardScaler

# Normalize numeric columns
scaler = StandardScaler()
df[['Sales', 'Quantity']] = scaler.fit_transform(df[['Sales', 'Quantity']])
```

---

## Part 7: vs Other Tools

| Feature | Power BI | Looker | Metabase | Tableau |
|---------|----------|--------|----------|---------|
| Pricing | $10/mo/user | $$$$$ | Free/OSS | $70/mo |
| DAX/LookML | DAX | LookML | SQL | Calc fields |
| Embedding | Excellent | Good | Good | Good |
| Microsoft integration | Native | Limited | Limited | Limited |
| Learning curve | Medium | High | Low | Medium |
| Self-service | Excellent | Good | Good | Excellent |
| Real-time | DirectQuery | Yes | Limited | Yes |

### When to Use Each

| Tool | Best For |
|------|----------|
| **Power BI** | Microsoft shops, Excel users, embedded analytics |
| **Looker** | Enterprise with dedicated analytics team |
| **Metabase** | Quick setup, SQL-first teams, open source |
| **Tableau** | Data exploration, advanced visualizations |

---

## Checklist

Before publishing:

- [ ] Star schema proper (facts and dimensions)
- [ ] Relationships defined (1:N preferred)
- [ ] Date table created and marked
- [ ] Measures in dedicated folder
- [ ] RLS tested with View as Roles
- [ ] Mobile layout configured
- [ ] Performance analyzer checked
- [ ] Incremental refresh for large datasets

---

## Resources

- [DAX.guide](https://dax.guide)
- [SQLBI](https://sqlbi.com)
- [Power BI Docs](https://docs.microsoft.com/power-bi)
- [Power BI Embedded Docs](https://docs.microsoft.com/power-bi/developer/embedded)

---

## Related Skills

- `analytics/SKILL.md` — PostHog analytics
- `database/SKILL.md` — Data sources
- `documentation/SKILL.md` — Report documentation
