# GitHub Portfolio Prep: Trading Intel Dashboard

## Step 1: Read the Skills Library
Before doing anything, read these files:
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/agents/github-portfolio/SKILL.md`
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/agents/github/SKILL.md`
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/agents/documentation/SKILL.md`
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/librarians/pre-deployment-librarian.md`

## Step 2: Assess This Project
Explore the project structure:
- List all directories and files
- Read `package.json` to understand the tech stack
- Read any existing README.md
- Look at `src/` structure for architecture
- Check for `.env.example` or `.env.local`
- Identify key components, API routes, and patterns used
- Look for data visualization libraries (Recharts, D3, Chart.js)
- Look for real-time patterns (WebSocket, polling, React Query)

## Step 3: Security Audit
Following the pre-deployment librarian checklist:
- Search for hardcoded secrets: `grep -rn "sk_live\|pk_live\|api_key\|apiKey\|secret" --include="*.ts" --include="*.tsx" .`
- Check if `.env.local` is in `.gitignore`
- Check `env.example` for real values that need to be replaced with placeholders
- Remove any real financial data or trading API keys
- List any files that contain sensitive data

## Step 4: Create README
Using `agents/documentation/SKILL.md` patterns, create a README with:
- Project title: **Trading Intel Dashboard**
- Live demo link: https://trading-intel-dashboard.vercel.app
- Tech stack table with actual versions from package.json
- Architecture diagram (Mermaid) based on what you found
- Key components/files with code snippets showing impressive patterns
- Getting started instructions using Bun
- Contact section:
  ```
  Built by **Frank Lawrence**
  [Portfolio](https://franklawrence.dev) • [LinkedIn](https://linkedin.com/in/franklawrencejr) • [GitHub](https://github.com/franklawrencejr)
  ```

## Step 5: Include 2026 Keywords
Based on what you find, include relevant keywords:
- Real-time data
- WebSocket / Server-Sent Events (if present)
- Data visualization (Recharts/D3 - whatever you find)
- Dashboard architecture
- React Query / TanStack Query (if present)
- Zustand state management (if present)
- Next.js 16 / React 19 (check versions)
- TypeScript strict mode
- Server Components
- Bun
- Edge-ready

## Step 6: Push to GitHub
```bash
rm -rf .git
git init
git add .
git commit -m "Initial commit: Trading Intel shell"
git branch -m main
gh repo create trading-intel-shell --public --source=. --push
```

## Output Required
1. Summary of what you found in the project
2. List of any secrets that need removal
3. The new README content
4. Confirmation of push to GitHub
