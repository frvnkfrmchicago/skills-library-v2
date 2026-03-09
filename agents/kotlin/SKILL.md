---
name: kotlin
description: Modern Android development, JVM backend, multiplatform apps.
owner: Frank
last_updated: 2026-03
---

# Kotlin

Modern, concise, safe. Android's first language.

---

## Context Questions

Before implementing with Kotlin:

1. **What's the platform?** — Android, JVM backend, multiplatform?
2. **What's the project type?** — Mobile app, API, shared library?
3. **Team background?** — Java shop, fresh start?
4. **Integration needs?** — Existing Java code, Android SDK?
5. **Build system?** — Gradle (default), Maven?

---

## TL;DR

| Need | Solution |
|------|----------|
| Android app | Jetpack Compose + Kotlin |
| Backend API | Ktor or Spring Boot |
| Multiplatform | Kotlin Multiplatform (KMP) |
| Async | Coroutines + Flow |
| Dependency injection | Koin or Hilt |
| Networking | Retrofit or Ktor Client |
| Database | Room (Android), Exposed (Backend) |

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Platform focus** | Android-only ←→ Full multiplatform |
| **Java interop** | Greenfield ←→ Heavy legacy Java |
| **UI paradigm** | XML layouts ←→ Compose declarative |
| **Backend needs** | Android-only ←→ Shared business logic |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Modern Android app | Jetpack Compose + Hilt + Room |
| Backend API (lightweight) | Ktor + Exposed |
| Backend API (enterprise) | Spring Boot + Kotlin |
| Shared mobile logic | Kotlin Multiplatform |
| Migrating from Java | Gradual conversion, keep interop |

---

## When to Use Kotlin

### ✅ Great Fit

- **Android development** — First-class support, mandatory in 2026
- **JVM backend** — Spring Boot or Ktor
- **Multiplatform** — Share code iOS/Android/Web
- **Java migration** — 100% Java interop
- **Coroutines** — Clean async code

### ❌ Consider Alternatives

- **iOS-only** — Use Swift instead
- **Web frontend** — React/TypeScript dominant
- **Systems programming** — Use Rust

---

## Quick Start: Android with Compose

```kotlin
// MainActivity.kt
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MyAppTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    Greeting("Android")
                }
            }
        }
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Hello $name!",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(8.dp))
        Button(onClick = { /* Handle click */ }) {
            Text("Click me")
        }
    }
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    MyAppTheme {
        Greeting("Android")
    }
}
```

---

## Coroutines

```kotlin
// Suspend function
suspend fun fetchUser(id: String): User {
    return withContext(Dispatchers.IO) {
        api.getUser(id)
    }
}

// ViewModel with StateFlow
class UserViewModel : ViewModel() {
    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user.asStateFlow()
    
    fun loadUser(id: String) {
        viewModelScope.launch {
            _user.value = fetchUser(id)
        }
    }
}

// Collecting in Compose
@Composable
fun UserScreen(viewModel: UserViewModel = hiltViewModel()) {
    val user by viewModel.user.collectAsState()
    
    user?.let { 
        Text("Welcome, ${it.name}!")
    } ?: CircularProgressIndicator()
}
```

---

## Ktor Backend

```kotlin
// Application.kt
fun main() {
    embeddedServer(Netty, port = 8080, module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    install(ContentNegotiation) {
        json()
    }
    
    routing {
        get("/health") {
            call.respond(mapOf("status" to "ok"))
        }
        
        get("/users/{id}") {
            val id = call.parameters["id"] ?: throw BadRequestException("Missing id")
            val user = userService.getById(id)
            call.respond(user)
        }
        
        post("/users") {
            val request = call.receive<CreateUserRequest>()
            val user = userService.create(request)
            call.respond(HttpStatusCode.Created, user)
        }
    }
}

@Serializable
data class User(
    val id: String,
    val name: String,
    val email: String
)

@Serializable
data class CreateUserRequest(
    val name: String,
    val email: String
)
```

---

## Android Architecture

```
app/
├── data/
│   ├── local/        # Room database
│   ├── remote/       # API calls
│   └── repository/   # Data sources
├── di/               # Dependency injection
├── domain/           # Use cases, models
└── ui/
    ├── components/   # Reusable Compose
    ├── screens/      # Screen composables
    └── theme/        # Material theme
```

---

## Common Libraries

| Category | Library | Purpose |
|----------|---------|---------|
| **UI** | Jetpack Compose | Declarative UI |
| **DI** | Hilt, Koin | Dependency injection |
| **Async** | Coroutines, Flow | Async programming |
| **Network** | Retrofit, Ktor Client | HTTP |
| **Database** | Room | Local persistence |
| **Navigation** | Navigation Compose | Screen navigation |
| **Image** | Coil | Image loading |

---

## Related Skills

- `agents/mobile-native/SKILL.md` — Cross-platform comparison
- `agents/swift/SKILL.md` — iOS counterpart
- `ai-builder/java/SKILL.md` — Java interop
- `agents/testing/SKILL.md` — Android testing
