# Mobile Security (OWASP Mobile Top 10)

## The Threats

| # | Vulnerability | What it means | Prevention |
|---|---|---|---|
| M1 | Improper Credential Usage | Hardcoded API keys, plaintext passwords | Secure keychain/keystore, revocable tokens |
| M2 | Inadequate Supply Chain | Malicious third-party SDKs | Audit deps, lockfiles, monitor CVEs |
| M3 | Insecure Authentication | Weak login, no server validation | Server-side auth, MFA, biometric fallback |
| M4 | Insufficient Input Validation | SQL injection, XSS | Validate ALL input server-side |
| M5 | Insecure Communication | HTTP, no cert pinning | HTTPS everywhere, SSL pinning |
| M6 | Insecure Data Storage | Sensitive data in SharedPrefs/UserDefaults | Keychain (iOS) / EncryptedSharedPrefs (Android) |
| M7 | Insufficient Cryptography | Weak algorithms, hardcoded keys | AES-256-GCM, RSA-2048+, key rotation |
| M8 | Code Tampering | Modified APKs, jailbreak exploits | Code signing, integrity checks |
| M9 | Reverse Engineering | Decompiled source exposure | Obfuscation (ProGuard/R8) |
| M10 | Improper Platform Usage | Misusing platform APIs | Platform best practices, minimum permissions |

---

## Secure Storage Patterns

### iOS — Keychain

```swift
import Security

func storeToken(_ token: String) {
    let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrAccount as String: "auth_token",
        kSecValueData as String: token.data(using: .utf8)!,
        kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
    ]
    SecItemAdd(query as CFDictionary, nil)
}
```

### Android — EncryptedSharedPreferences

```kotlin
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val prefs = EncryptedSharedPreferences.create(
    context, "secure_prefs", masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)
prefs.edit().putString("auth_token", token).apply()
```

### React Native — SecureStore

```javascript
// ❌ NEVER localStorage
localStorage.setItem('token', authToken)  // XSS = token stolen

// ✅ Use SecureStore
import * as SecureStore from 'expo-secure-store'
await SecureStore.setItemAsync('token', authToken)
```

---

## SSL Certificate Pinning

```typescript
import { fetch as sslFetch } from 'react-native-ssl-pinning'

const response = await sslFetch('https://api.example.com/data', {
  method: 'GET',
  sslPinning: { certs: ['my-cert'] }
})
```

---

## Biometric Authentication

```swift
import LocalAuthentication

let context = LAContext()
if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil) {
    context.evaluatePolicy(
        .deviceOwnerAuthenticationWithBiometrics,
        localizedReason: "Authenticate to access your account"
    ) { success, error in
        // STILL validate server-side after biometric success
    }
}
```

---

## Security Checklist

- [ ] No hardcoded credentials or API keys in source
- [ ] Sensitive data in Keychain/EncryptedSharedPreferences
- [ ] All network calls HTTPS
- [ ] SSL pinning for sensitive endpoints
- [ ] Server-side authentication
- [ ] Dependencies audited for vulnerabilities
