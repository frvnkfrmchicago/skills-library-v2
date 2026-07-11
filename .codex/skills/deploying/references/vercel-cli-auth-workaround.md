# Vercel CLI Auth Token Workaround

## Problem
`npx vercel whoami` returns "No existing credentials found" even after a successful `vercel login`.
This happens when `npx` resolves an older cached CLI version (e.g. v47) that reads auth from a
different path than where the newer global install (v54+) stores it.

## Auth file location (newer Vercel CLI)
```
~/Library/Application Support/com.vercel.cli/auth.json
```

## Fix: extract token and pass via --token
```bash
# Extract token
VERCEL_TOKEN=$(python3 -c "import json; print(json.load(open('$HOME/Library/Application Support/com.vercel.cli/auth.json'))['token'])")

# Use with any vercel command
npx vercel list --token "$VERCEL_TOKEN" <project-name>
npx vercel inspect <deployment-url> --token "$VERCEL_TOKEN"
npx vercel deploy --token "$VERCEL_TOKEN"
```

## Deployment history inspection
```bash
# List all deployments for a project
npx vercel list --token "$VERCEL_TOKEN" trading-intel-dashboard

# Inspect a specific deployment (shows aliases, builds, status)
npx vercel inspect <deployment-url> --token "$VERCEL_TOKEN"
```

## Key details
- `.vercel/project.json` in the repo holds `projectId` and `orgId` — no need to re-link
- Vercel keeps serving the last successful build even when newer deploys fail
- GitHub remote can be deleted; local git + `.vercel/project.json` still provide full history
- When user says "I was already logged in", check the auth file — don't assume they need to re-login
