# Cloudflare Pages Deployment (GrazzHopper Content Hub)

## Project Details

- **Project dir:** `~/Documents/Automation Centre/grazzhopper-content-hub/`
- **Type:** Static HTML/JS/CSS (no build step)
- **Deploy target:** Cloudflare Pages
- **CLI:** `npx wrangler@latest pages deploy . --project-name=grazzhopper-content-hub`
- **Correct account ID:** `4c54c3e7910ffabc33de85850597460f`

## Wrangler Auth from Hermes Sandbox

Wrangler stores OAuth tokens at:
```
~/Library/Preferences/.wrangler/config/default.toml
```

The file contains `oauth_token`, `refresh_token`, `expiration_time`, and `scopes`.

### Problem

The Hermes sandbox HOME (`~/.hermes/profiles/<name>/home/`) is different from
Frank's real HOME (`/Users/franklawrencejr.`). Wrangler reads its config relative
to HOME, so the sandbox doesn't see Frank's OAuth session.

Additionally:
- OAuth tokens expire (~24h). Wrangler auto-refreshes via browser redirect to
  `localhost:8976/oauth/callback`, but the sandbox can't receive that callback.
- Direct curl to Cloudflare's OAuth token endpoint is IP-blocked (CF WAF).
- Copying `default.toml` to the sandbox HOME path works for reading but NOT for
  refresh (expired token + no callback receiver).

### Solution

**Have Frank run the deploy from his own terminal:**

```bash
cd "/Users/franklawrencejr./Documents/Automation Centre/grazzhopper-content-hub"
npx wrangler pages deploy . --project-name=grazzhopper-content-hub
```

Wrangler will auto-refresh the OAuth token via his browser, then deploy.

### If a fresh login is needed

```bash
cd "/Users/franklawrencejr./Documents/Automation Centre/grazzhopper-content-hub"
npx wrangler logout
npx wrangler login
# Browser opens → click Allow → token saved to default.toml
npx wrangler pages deploy . --project-name=grazzhopper-content-hub
```

## Account-ID Mismatch (2026-06-08)

After re-logging into Cloudflare, Wrangler may route API calls to a stale
account ID. The error:

```
Authentication error [code: 10000]
  A request to the Cloudflare API (/accounts/2747a156fbfdfc0d9e34e604d4b2a4e7/pages/projects/grazzhopper-content-hub) failed.
```

But `wrangler login` output shows the correct account:

```
Account Name                     │ Account ID
Frank@grazzhoppers.com's Account │ 4c54c3e7910ffabc33de85850597460f
```

The old account (`2747...`) is from a previous login session. The token is fresh
and valid — it's just hitting the wrong account. Fix:

```bash
npx wrangler pages deploy . --project-name=grazzhopper-content-hub --account-id=4c54c3e7910ffabc33de85850597460f
```

## Wrangler Version Notes

- Global install (`~/.npm-global/lib/node_modules/wrangler`) may have platform
  mismatch if installed on a different arch. Use `npx wrangler@latest` instead.
- First `npx` run downloads wrangler (~30s). Subsequent runs use cache.

## Project Creation (first time only)

```bash
npx wrangler pages project create grazzhopper-content-hub --production-branch=main
```

Then deploy with the command above. Wrangler uploads all files in the current
directory as a static site.
