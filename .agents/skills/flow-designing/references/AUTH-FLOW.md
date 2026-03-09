# Auth Flow Reference

Detailed audit checklists for authentication flows.

---

## Sign-Up

**Target:** < 30 seconds from "Create Account" to authenticated state.

```
Critical checkpoints:
├── Can user sign up with email + password? (baseline)
├── Can user sign up with social auth (Google, Apple)?
├── Is password requirement shown BEFORE user types?
├── Does confirm-password auto-fill work with password managers?
├── Is email verification required? If so:
│   ├── Is there a "resend" option?
│   ├── Does the deep link work on mobile?
│   ├── What if user checks email 24h later?
│   └── What if user opens link on a different device?
├── Is there a loading state?
├── What happens with duplicate email?
│   └── Does it leak that the email exists? (security risk)
└── Does the user land on a USEFUL screen after signup?
```

---

## Login

```
Critical checkpoints:
├── Does autofill/password manager work?
├── Is "forgot password" VISIBLE and findable?
├── Biometric login available? (Face ID / fingerprint)
├── Passkey support? (FIDO2/WebAuthn — 2026 standard)
├── Session persistence — does closing app require re-login?
├── Multiple device handling — does logging in elsewhere log out here?
├── What error shows for wrong email vs wrong password?
│   └── SECURITY: same generic error for both (no email enumeration)
├── Account lockout after N failed attempts?
└── Rate limiting on login endpoint?
```

---

## Password Reset

```
Critical checkpoints:
├── Can user find the reset link without help?
├── Reset email arrives in < 30 seconds
├── Reset link expires after reasonable time (1-4 hours)
├── Reset link is single-use (can't be replayed)
├── After reset, user is logged in automatically
├── Old password no longer works
└── User receives confirmation notification
```

---

## MFA / 2FA

```
Critical checkpoints:
├── Multiple MFA options (SMS, authenticator app, passkey)
├── Recovery codes generated during setup
├── "Remember this device" option works correctly
├── What happens if user loses their phone? (recovery path)
├── MFA not required for every action (adaptive/risk-based)
└── SMS OTP: auto-fill available on iOS and Android
```

---

## Auth Security Checklist

- [ ] Passwords hashed with bcrypt/scrypt/Argon2 (NEVER MD5/SHA1)
- [ ] Tokens stored in httpOnly secure cookies (web) or Keychain/Keystore (mobile)
- [ ] CSRF protection on all auth endpoints
- [ ] Rate limiting on login/signup/reset endpoints
- [ ] Session expiry configured (access: 15min, refresh: 7-30 days)
- [ ] No email enumeration (same error for wrong email and wrong password)
- [ ] Passkey/WebAuthn supported for passwordless auth
