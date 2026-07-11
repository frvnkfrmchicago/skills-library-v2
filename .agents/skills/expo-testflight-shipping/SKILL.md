---
name: expo-testflight-shipping
description: >
  Ships React Native Expo apps to TestFlight and the App Store using
  EAS Build, EAS Submit, and EAS Update. Covers build profiles, signing,
  TestFlight internal/external testing, OTA updates with runtimeVersion,
  environment management with EAS Secrets, CI/CD with GitHub Actions,
  and Android parallel builds. Use when building for TestFlight, submitting
  to the App Store, configuring EAS, managing signing, or when user
  mentions TestFlight, EAS, eas build, ship, App Store submit, or OTA.
---

# Expo TestFlight Shipping

Your pipeline from code to TestFlight tester hands. Every build should
be reproducible, every secret should be injected, every binary should
be signed automatically.

---

## 1. EAS Build Configuration

### eas.json Profiles

```json
{
  "cli": {
    "version": ">= 12.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "bundleIdentifier": "com.myapp.preview"
      },
      "channel": "preview"
    },
    "production": {
      "distribution": "store",
      "autoIncrement": true,
      "channel": "production"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "XXXXXXXXXX"
      }
    }
  }
}
```

### Profile Selection

| Profile | When to Use | Distribution |
|---|---|---|
| `development` | Local dev with dev client | Internal (device registered) |
| `preview` | Team testing, feature review | Internal (ad-hoc) |
| `production` | TestFlight + App Store | Store |

### Build Commands

```bash
# Development build (simulator)
eas build --profile development --platform ios

# Preview build (team testing on real devices)
eas build --profile preview --platform ios

# Production build (for TestFlight / App Store)
eas build --profile production --platform ios

# Both platforms in one command
eas build --profile production --platform all
```

---

## 2. Signing & Credentials

**Let EAS manage credentials.** Do not manually create certificates.

```bash
# Interactive credential setup (first time)
eas credentials

# EAS handles:
# - Apple Distribution Certificate
# - Provisioning Profile
# - Push Notification Key (if needed)
# - App Store Connect API Key
```

### When to Manually Intervene

| Scenario | Action |
|---|---|
| Certificate expired | `eas credentials` → Create new |
| New device for ad-hoc | Register in Apple Developer Portal, rebuild |
| Team member needs access | Share API key, not certificates |
| Multiple apps sharing cert | Use `--auto-submit` flag |

### App Store Connect API Key (Recommended)

```bash
# Set up API key for automated submissions
eas credentials --platform ios
# Select "App Store Connect API Key"
# Follow prompts to create/import key
```

---

## 3. TestFlight Workflow

### Internal Testing (Immediate)

1. Build with `production` profile
2. Submit: `eas submit --platform ios`
3. Wait for App Store Connect processing (~15-30 min)
4. Internal testers (registered in App Store Connect) get the build automatically
5. No Apple review required for internal testers

### External Testing (Review Required)

1. Same build as internal
2. In App Store Connect → TestFlight → External Testing → Add group
3. Select the build → Submit for Beta App Review
4. Review typically takes 24-48 hours (often faster)
5. Once approved, up to 10,000 testers via email or public link

### Tester Management

```
Internal testers: Up to 100
├── Must be App Store Connect users
├── Access to all builds automatically
└── No review required

External testers: Up to 10,000
├── Invite via email or public link
├── Beta review required per build
└── Can create multiple test groups
```

### Build Notes

Always include tester-facing release notes:
```bash
eas submit --platform ios \
  --message "Fixed crash on login screen. Added dark mode support."
```

---

## 4. EAS Submit

```bash
# Submit latest build to App Store Connect
eas submit --platform ios

# Submit a specific build
eas submit --platform ios --id BUILD_ID

# Auto-submit after successful build
eas build --profile production --platform ios --auto-submit
```

### Submit Configuration in eas.json

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "XXXXXXXXXX"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

---

## 5. EAS Update (OTA)

### When OTA vs Binary Rebuild

```
What changed?
│
├── JavaScript/TypeScript logic only?
│   └── EAS Update (OTA) — no new binary needed
│
├── Styling, assets, images?
│   └── EAS Update (OTA) — no new binary needed
│
├── New native dependency (e.g., expo-camera)?
│   └── New EAS Build required — native code changed
│
├── app.json config change (permissions, splash)?
│   └── New EAS Build required — native config changed
│
└── Expo SDK upgrade?
    └── New EAS Build required — increment runtimeVersion
```

### Runtime Version Management

```json
// app.json
{
  "expo": {
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
```

| Policy | Behavior | Use When |
|---|---|---|
| `"appVersion"` | Tied to app version string | Simple apps, manual control |
| `"nativeVersion"` | Tied to native build number | Moderate update frequency |
| `"fingerprint"` | Hash of native dependencies | Maximum safety (recommended) |

### Publishing an Update

```bash
# Push OTA update to production channel
eas update --branch production --message "Fixed homepage layout"

# Push to preview channel
eas update --branch preview --message "Testing new feature"

# Check update status
eas update:list
```

### Critical Rule

> If you change native code and push an OTA update with the SAME
> runtimeVersion, the app WILL CRASH. Always increment runtimeVersion
> when native code changes.

---

## 6. Environment Management

### EAS Secrets

```bash
# Set a secret (injected at build time)
eas secret:create --scope project --name API_URL --value "https://api.prod.com"
eas secret:create --scope project --name STRIPE_KEY --value "pk_live_xxx"

# List secrets
eas secret:list

# Delete a secret
eas secret:delete --name API_URL
```

### Config Plugins for Staging/Prod

```javascript
// app.config.js
const IS_PROD = process.env.APP_VARIANT === 'production';

export default {
  name: IS_PROD ? "MyApp" : "MyApp (Beta)",
  slug: "myapp",
  ios: {
    bundleIdentifier: IS_PROD
      ? "com.myapp.production"
      : "com.myapp.preview",
    icon: IS_PROD ? "./assets/icon.png" : "./assets/icon-beta.png"
  },
  extra: {
    apiUrl: process.env.API_URL,
    eas: {
      projectId: "your-project-id"
    }
  }
};
```

### .env Pattern (Local Development)

```bash
# .env.local (NOT committed to git)
API_URL=http://localhost:3000
STRIPE_KEY=pk_test_xxx

# .env.production (reference only — actual values in EAS Secrets)
API_URL=set-via-eas-secrets
STRIPE_KEY=set-via-eas-secrets
```

---

## 7. CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/eas-build.yml
name: EAS Build & Submit

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - run: npm ci

      - name: Build iOS
        run: eas build --profile production --platform ios --non-interactive

      - name: Submit to TestFlight
        run: eas submit --platform ios --latest --non-interactive
```

### Branch Strategy

| Branch | Trigger | Build Profile | Submit To |
|---|---|---|---|
| `main` | Push | `production` | TestFlight |
| `develop` | Push | `preview` | Internal testing |
| `feature/*` | Manual | `development` | Simulator only |

---

## 8. Android Parallel

### Building for Android

```bash
# Production build for Play Store
eas build --profile production --platform android

# Submit to internal testing track
eas submit --platform android
```

### Play Store Configuration

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal",
        "releaseStatus": "draft"
      }
    }
  }
}
```

### Google Service Account

1. Google Cloud Console → IAM → Service Accounts
2. Create account with "Service Account User" role
3. Grant "Android Management API" access
4. Download JSON key → reference in eas.json
5. Add to `.gitignore` — NEVER commit

---

## 9. Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| "Provisioning profile not found" | Profile expired or device not registered | `eas credentials` → regenerate |
| "Build number already in use" | Duplicate build number in App Store Connect | Enable `autoIncrement: true` |
| Build stuck at "Processing" | App Store Connect delay | Wait 30 min, then contact Apple |
| "No matching provisioning profile" | Bundle ID mismatch | Verify `bundleIdentifier` matches portal |
| OTA update causes crash | runtimeVersion mismatch | Increment runtimeVersion, rebuild |
| "EAS_BUILD_RUNNER is not set" | Running EAS command outside CI | Use `--non-interactive` flag |
| Large build size | Unoptimized assets | Run `npx expo-optimize` |
| Signing certificate revoked | Someone regenerated in portal | `eas credentials` → create new |

---

## ⛔ STOP GATE — Ship Readiness

DO NOT submit to TestFlight or App Store without:

1. **runtimeVersion** set and correct for the current native dependencies
2. **No hardcoded secrets** — all sensitive values via EAS Secrets
3. **Privacy labels** completed in App Store Connect
4. **Privacy policy** URL is live and accessible
5. **Build tested locally** before submitting
6. **autoIncrement** enabled to prevent build number conflicts

```bash
# Quick verification
cat eas.json | grep -E "autoIncrement|runtimeVersion|distribution"
grep -rn "sk_live\|pk_live\|apiKey=" src/ app/ --include="*.ts" --include="*.tsx"
```

---

## NEVER

- **NEVER** manually create signing certificates — let EAS manage them
- **NEVER** commit `.env` files with real secrets to git
- **NEVER** push OTA updates without verifying runtimeVersion compatibility
- **NEVER** submit to App Store without privacy labels
- **NEVER** skip build number auto-increment
- **NEVER** commit Google service account JSON files to git
- **NEVER** use `internal` distribution for App Store submissions

---

## Pre-Completion Checklist

- [ ] `eas.json` has development, preview, and production profiles
- [ ] `autoIncrement: true` on production profile
- [ ] Signing credentials managed via `eas credentials`
- [ ] All secrets in EAS Secrets, not in code
- [ ] runtimeVersion policy set in app.json
- [ ] CI/CD pipeline configured for automated builds
- [ ] TestFlight build tested by at least one team member
- [ ] Privacy labels and policy completed
- [ ] `.gitignore` covers `.env*`, `*.jks`, `*.p12`, `google-service-account.json`

---

## Related Skills

- `react-native-expo-building` — Expo architecture and project setup
- `native-store-compliance` — App Store and Play Store review requirements
- `ios-debugging` — TestFlight crash log analysis
- `native-testing-debugging` — E2E testing before submission
- `deploying` — Web deployment (complementary skill)
