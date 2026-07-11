# ETA Deal Sourcing Tool (v1 MVP)

Automated B2B services sourcing for ETA searchers.

## Project Structure
- `/prisma`: Database schema and migrations.
- `/server`: Node.js/TypeScript backend logic and n8n workflow definitions.
- `/dashboard`: Next.js frontend for lead visualization and export.

## Quick Start
1. `npm install`
2. `npx prisma generate`
3. `npm run dev` (from dashboard)

## Core Components
- **Scoring Engine**: Evaluates leads based on headcount, B2B signals, and contact info.
- **Workflow**: Automated ingestion from Google Maps and enrichment via Apollo.
- **Dashboard**: Filterable view of proprietary leads and marketed deals.
