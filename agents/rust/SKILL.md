---
name: rust
description: Systems programming, memory safety, performance-critical applications, WebAssembly.
owner: Frank
last_updated: 2026-03
---

# Rust

Fast. Safe. Fearless concurrency.

---

## Context Questions

Before implementing with Rust:

1. **Why Rust?** — Performance-critical, memory safety, systems-level?
2. **What's the domain?** — Backend, CLI, WebAssembly, embedded, blockchain?
3. **Team experience?** — Rust native or learning curve factor?
4. **Integration needs?** — Existing systems, FFI, cloud services?
5. **Deployment target?** — Containers, serverless, bare metal?

---

## TL;DR

| Need | Solution |
|------|----------|
| Web API | Axum or Actix Web |
| CLI tool | Clap |
| Async runtime | Tokio |
| WebAssembly | wasm-bindgen, wasm-pack |
| Database | SQLx, Diesel |
| Serialization | Serde |
| Error handling | thiserror, anyhow |

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Performance priority** | Latency-sensitive ←→ Throughput-focused |
| **Safety requirements** | Standard ←→ Security-critical |
| **Team experience** | Learning Rust ←→ Seasoned Rustaceans |
| **Integration** | Greenfield ←→ Legacy system interop |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Building high-perf API | Axum + Tokio + SQLx |
| CLI tool | Clap + tokio for async |
| WebAssembly | wasm-bindgen + wasm-pack |
| Cloud infrastructure | Tokio + AWS SDK |
| Blockchain/crypto | Custom + cryptography crates |
| Embedded systems | no_std, embedded-hal |

---

## When to Use Rust

### ✅ Great Fit

- **Performance-critical systems** — Sub-millisecond latency needs
- **Memory-constrained** — Embedded, edge computing
- **Security-critical** — Memory safety without GC
- **High-concurrency** — Async with zero-cost abstractions
- **WebAssembly** — Near-native speed in browser
- **CLI tools** — Fast startup, single binary

### ❌ Not Ideal For

- **Rapid prototyping** — Steep learning curve slows iteration
- **Dynamic scripting** — Python/Node better for glue code
- **Small team, tight deadline** — Unless Rust experience exists

---

## Quick Start: Web API with Axum

```toml
# Cargo.toml
[package]
name = "my-api"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.7"
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
sqlx = { version = "0.7", features = ["postgres", "runtime-tokio"] }
tower-http = { version = "0.5", features = ["cors", "trace"] }
tracing = "0.1"
tracing-subscriber = "0.3"
```

```rust
// src/main.rs
use axum::{
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
}

#[derive(Deserialize)]
struct CreateUser {
    name: String,
    email: String,
}

#[derive(Serialize)]
struct User {
    id: i64,
    name: String,
    email: String,
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
    })
}

async fn create_user(Json(payload): Json<CreateUser>) -> Json<User> {
    Json(User {
        id: 1,
        name: payload.name,
        email: payload.email,
    })
}

#[tokio::main]
async fn main() {
    tracing_subscriber::init();

    let app = Router::new()
        .route("/health", get(health))
        .route("/users", post(create_user));

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    println!("Listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

---

## Error Handling Patterns

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    
    #[error("Not found: {0}")]
    NotFound(String),
    
    #[error("Validation error: {0}")]
    Validation(String),
}

// Convert to Axum response
impl axum::response::IntoResponse for ApiError {
    fn into_response(self) -> axum::response::Response {
        let (status, message) = match &self {
            ApiError::Database(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Internal error"),
            ApiError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.as_str()),
            ApiError::Validation(msg) => (StatusCode::BAD_REQUEST, msg.as_str()),
        };
        (status, Json(json!({ "error": message }))).into_response()
    }
}
```

---

## Async Patterns

```rust
// Concurrent execution
let (users, posts) = tokio::join!(
    fetch_users(),
    fetch_posts(),
);

// Spawn background task
tokio::spawn(async move {
    process_in_background(data).await;
});

// Timeouts
use tokio::time::{timeout, Duration};

let result = timeout(Duration::from_secs(5), slow_operation())
    .await
    .map_err(|_| ApiError::Timeout)?;
```

---

## WebAssembly

```rust
// lib.rs
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}
```

```bash
# Build
wasm-pack build --target web
```

---

## Common Crates

| Category | Crate | Purpose |
|----------|-------|---------|
| **Web** | axum, actix-web | HTTP frameworks |
| **Async** | tokio | Async runtime |
| **Database** | sqlx, diesel | SQL |
| **Serialization** | serde | JSON/YAML/etc |
| **CLI** | clap | Argument parsing |
| **Error** | thiserror, anyhow | Error handling |
| **HTTP Client** | reqwest | HTTP requests |
| **Logging** | tracing | Structured logging |

---

## Related Skills

- `ai-builder/golang/SKILL.md` — Alternative for simpler concurrency
- `ai-builder/python/SKILL.md` — When prototyping speed matters
- `agents/docker/SKILL.md` — Containerizing Rust apps
- `agents/deployment/SKILL.md` — Deploying Rust services
