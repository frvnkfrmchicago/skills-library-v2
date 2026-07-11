# GitHub Portfolio Prep: SMS Marketing Platform

## Step 1: Read the Skills Library
Before doing anything, read these files:
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/agents/github-portfolio/SKILL.md`
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/agents/github/SKILL.md`
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/agents/documentation/SKILL.md`
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/agents/sms/SKILL.md`
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/librarians/pre-deployment-librarian.md`

## Step 2: Assess This Project
Explore the project structure:
- List all directories and files
- Read `package.json` to understand the tech stack
- Read any existing README.md
- Look at `src/` structure for architecture
- Check for `.env.example` or `.env.local`
- Identify key components, API routes, and patterns used
- Look for queue/job processing (BullMQ, Redis)
- Look for SMS provider integration (Twilio, etc.)
- Look for template/campaign builder components

## Step 3: Security Audit
Following the pre-deployment librarian checklist:
- Search for hardcoded secrets: `grep -rn "sk_live\|pk_live\|api_key\|apiKey\|secret\|twilio\|TWILIO" --include="*.ts" --include="*.tsx" .`
- Check if `.env.local` is in `.gitignore`
- Check `env.example` for real Twilio credentials or phone numbers
- Remove any real phone numbers from the codebase
- List any files that contain sensitive data

## Step 4: Create README
Using `agents/documentation/SKILL.md` patterns, create a README with:
- Project title: **SMS Marketing Platform**
- Live demo link: https://sms-marketing-platform-nu.vercel.app
- Tech stack table with actual versions from package.json
- Architecture diagram (Mermaid) based on what you found: UI → API → Queue → SMS Provider
- Key components/files with code snippets showing impressive patterns
- Getting started instructions using Bun
- Contact section:
  ```
  Built by **Frank Lawrence**
  [Portfolio](https://franklawrence.dev) • [LinkedIn](https://linkedin.com/in/franklawrencejr) • [GitHub](https://github.com/franklawrencejr)
  ```

## Step 5: Include 2026 Keywords
Based on what you find, include relevant keywords:
- Queue architecture (Redis/BullMQ - if present)
- Twilio / SMS API integration
- Campaign automation
- Template engine
- Contact segmentation
- Webhook handling
- Background jobs
- Next.js 16 / React 19 (check versions)
- TypeScript strict mode
- Server Components
- Prisma ORM (if present)
- Bun
- Edge-ready

## Step 6: Push to GitHub
```bash
rm -rf .git
git init
git add .
git commit -m "Initial commit: SMS Marketing shell"
git branch -m main
gh repo create sms-marketing-shell --public --source=. --push
```

## Output Required
1. Summary of what you found in the project
2. List of any secrets that need removal
3. The new README content
4. Confirmation of push to GitHub
