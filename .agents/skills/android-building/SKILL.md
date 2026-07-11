---
name: android-building
description: >
  Builds and ships Android applications with Gradle configuration, Play
  Store compliance (API 35, data safety form, MASA), secure storage with
  EncryptedSharedPreferences, permission model, ProGuard/R8 obfuscation,
  and Kotlin-first patterns. Use when building Android features, preparing
  for Play Store submission, configuring Gradle, handling Android permissions,
  or when user mentions Android, Play Store, Gradle, Kotlin, or APK.
---

# Android Building

Build Android apps that pass Play Store review on first submission.
Target API 35+, handle permissions correctly, and encrypt all sensitive data.

---

## 1. Android Project Fundamentals

### Gradle Build Variants

```kotlin
// build.gradle.kts (app level)
android {
    compileSdk = 35
    defaultConfig {
        applicationId = "com.myapp"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    signingConfigs {
        create("release") {
            storeFile = file(System.getenv("KEYSTORE_PATH") ?: "release.keystore")
            storePassword = System.getenv("KEYSTORE_PASSWORD") ?: ""
            keyAlias = System.getenv("KEY_ALIAS") ?: ""
            keyPassword = System.getenv("KEY_PASSWORD") ?: ""
        }
    }
}
```

### Signing

```bash
# Generate a release keystore (ONCE — back this up securely)
keytool -genkey -v -keystore release.keystore \
  -alias myapp -keyalg RSA -keysize 2048 -validity 10000

# NEVER commit the keystore to git
echo "*.keystore" >> .gitignore
echo "*.jks" >> .gitignore
```

---

## 2. Play Store Requirements (2026)

| Requirement | Detail | Deadline |
|---|---|---|
| Target API 35 (Android 15) | All new apps and updates | August 2025+ |
| Developer verification | Identity verification required | September 2026 |
| Data Safety form | Complete in Play Console | Ongoing |
| Privacy policy URL | Public, non-PDF, accessible | Ongoing |
| Financial features declaration | ALL apps must declare | October 2025+ |
| Photo/video permission limits | No broad `READ_MEDIA_*` | May 2025+ |
| Age-restricted content | Dating/gambling must block minors | January 2026+ |

### Target SDK Verification

```bash
# Check current target SDK
grep "targetSdk" app/build.gradle.kts
# Must be >= 35

# Check compile SDK
grep "compileSdk" app/build.gradle.kts
# Must be >= 35
```

---

## 3. MASA Certification

Mobile Application Security Assessment — earns a badge in your Data Safety section.

### Requirements (OWASP MASVS Level 1)

| Check | What It Verifies |
|---|---|
| Data storage | No sensitive data in plaintext |
| Cryptography | AES-256-GCM, no MD5/SHA1 |
| Authentication | Server-side validation, session management |
| Network | HTTPS enforced, cert pinning on sensitive endpoints |
| Platform interaction | No exported activities/receivers without protection |
| Code quality | No debug flags in release, obfuscation enabled |
| Reverse engineering | ProGuard/R8 enabled, no hardcoded secrets |

### Self-Assessment Checklist

```bash
# Check for plaintext sensitive storage
grep -rn "SharedPreferences\|getSharedPreferences" app/src/ --include="*.kt" --include="*.java"
# Should use EncryptedSharedPreferences for sensitive data

# Check for HTTPS enforcement
grep -rn "http://" app/src/ --include="*.kt" --include="*.java" | grep -v "https://"
# Should be zero results (no plain HTTP)

# Check for debug flags
grep -rn "isDebuggable\|debuggable" app/build.gradle*
# Release should have isDebuggable = false
```

---

## 4. Secure Storage

### EncryptedSharedPreferences (Required for Sensitive Data)

```kotlin
// ✅ REQUIRED — Encrypted storage for tokens, keys, PII
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val securePrefs = EncryptedSharedPreferences.create(
    context,
    "secure_prefs",
    masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)

// Store
securePrefs.edit().putString("auth_token", token).apply()

// Retrieve
val token = securePrefs.getString("auth_token", null)

// Delete
securePrefs.edit().remove("auth_token").apply()
```

```kotlin
// ❌ NEVER — Plaintext SharedPreferences for sensitive data
val prefs = context.getSharedPreferences("prefs", Context.MODE_PRIVATE)
prefs.edit().putString("auth_token", token).apply()
// Token stored in plaintext XML — trivially extractable
```

---

## 5. Permission Model

### Runtime Permission Pattern

```kotlin
// ✅ REQUIRED — Runtime permission request
val permissionLauncher = rememberLauncherForActivityResult(
    ActivityResultContracts.RequestPermission()
) { isGranted ->
    if (isGranted) {
        // Permission granted — proceed
    } else {
        // Show rationale or graceful degradation
    }
}

// Request
permissionLauncher.launch(Manifest.permission.CAMERA)
```

### Scoped Storage (Enforced 2025+)

```kotlin
// ✅ App-specific storage (no permission needed)
val file = File(context.filesDir, "data.json")
file.writeText(jsonString)

// ✅ MediaStore for shared media
val values = ContentValues().apply {
    put(MediaStore.Images.Media.DISPLAY_NAME, "photo.jpg")
    put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
}
val uri = contentResolver.insert(
    MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values
)
```

### Permission Decision Table

| Need | Permission | Alternative |
|---|---|---|
| Take a photo | No permission (use `ActivityResultContracts.TakePicture()`) | Intent-based camera |
| Pick an image | `READ_MEDIA_IMAGES` (limited) | Photo picker (no permission) |
| Location | `ACCESS_FINE_LOCATION` | Coarse location if precise not needed |
| Notifications | `POST_NOTIFICATIONS` (API 33+) | Required for push |
| Bluetooth | `BLUETOOTH_CONNECT` (API 31+) | Companion device manager |

---

## 6. Kotlin-First Patterns

### Coroutines for Async Work

```kotlin
// ✅ Structured concurrency
class ItemViewModel : ViewModel() {
    private val _items = MutableStateFlow<List<Item>>(emptyList())
    val items: StateFlow<List<Item>> = _items.asStateFlow()

    fun loadItems() {
        viewModelScope.launch {
            try {
                _items.value = repository.fetchItems()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}
```

### Sealed Classes for State

```kotlin
// ✅ Exhaustive state modeling
sealed class UiState<out T> {
    data object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
}

// Usage
when (val state = viewModel.state.collectAsState().value) {
    is UiState.Loading -> LoadingIndicator()
    is UiState.Success -> ItemList(state.data)
    is UiState.Error -> ErrorMessage(state.message)
}
```

---

## 7. ProGuard / R8

### Enabling Shrinking

```kotlin
// build.gradle.kts
release {
    isMinifyEnabled = true         // Enable R8 code shrinking
    isShrinkResources = true       // Remove unused resources
    proguardFiles(
        getDefaultProguardFile("proguard-android-optimize.txt"),
        "proguard-rules.pro"
    )
}
```

### Common Keep Rules

```proguard
# proguard-rules.pro

# Keep data classes used by Gson/Moshi
-keep class com.myapp.models.** { *; }

# Keep Retrofit interfaces
-keep,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}

# Keep Kotlin metadata (for reflection)
-keep class kotlin.Metadata { *; }

# Keep Expo modules (React Native)
-keep class host.exp.exponent.** { *; }
-keep class com.facebook.react.** { *; }
```

### Testing ProGuard

```bash
# Build release APK and test
./gradlew assembleRelease

# Check for crashes — ProGuard issues show as ClassNotFoundException
adb install app/build/outputs/apk/release/app-release.apk
adb logcat | grep -E "ClassNotFound|NoSuchMethod|ProGuard"
```

---

## 8. Testing

### Unit Testing (JUnit + Kotlin)

```kotlin
@Test
fun `items are filtered correctly`() {
    val items = listOf(
        Item(id = "1", isActive = true),
        Item(id = "2", isActive = false),
    )
    val result = items.filter { it.isActive }
    assertEquals(1, result.size)
    assertEquals("1", result[0].id)
}
```

### UI Testing (Espresso)

```kotlin
@Test
fun loginButton_displaysOnLaunch() {
    onView(withId(R.id.loginButton))
        .check(matches(isDisplayed()))
        .check(matches(withText("Sign In")))
}
```

### CI Integration

```yaml
# GitHub Actions
- name: Run Android Tests
  run: ./gradlew testDebugUnitTest

- name: Run Instrumented Tests
  uses: reactivecircus/android-emulator-runner@v2
  with:
    api-level: 35
    script: ./gradlew connectedDebugAndroidTest
```

---

## ⛔ STOP GATE — Store Readiness

DO NOT submit to Play Store without:

1. **Target SDK ≥ 35** — verified in build.gradle
2. **Data Safety form** — completed in Play Console
3. **Privacy policy** — live public URL linked in app and store listing
4. **Signing correct** — release keystore, not debug
5. **ProGuard/R8 enabled** — `isMinifyEnabled = true`
6. **No hardcoded secrets** — all values via environment or secure storage

```bash
# Quick verification
grep "targetSdk" app/build.gradle.kts
grep "isMinifyEnabled" app/build.gradle.kts
grep -rn "sk_live\|pk_live\|api_key\|password=" app/src/ --include="*.kt"
```

---

## NEVER

- **NEVER** target SDK below 35 for new submissions
- **NEVER** store sensitive data in plaintext SharedPreferences
- **NEVER** commit keystore files or signing passwords to git
- **NEVER** ship with `isDebuggable = true` in release builds
- **NEVER** request broad storage permissions when scoped alternatives exist
- **NEVER** skip ProGuard/R8 for release builds
- **NEVER** use `http://` URLs — enforce HTTPS everywhere

---

## Pre-Completion Checklist

- [ ] Target SDK ≥ 35, Compile SDK ≥ 35
- [ ] Release signing configured with environment variables
- [ ] EncryptedSharedPreferences for all sensitive data
- [ ] ProGuard/R8 enabled with tested keep rules
- [ ] Permissions use runtime request pattern
- [ ] Data Safety form completed in Play Console
- [ ] Privacy policy live and accessible
- [ ] No hardcoded secrets in source
- [ ] Unit tests passing

---

## Related Skills

- `expo-testflight-shipping` — EAS Build for Android
- `native-store-compliance` — Detailed Play Store review guide
- `native-testing-debugging` — Detox and Maestro for Android
- `security-auditing` — Broader security audit
