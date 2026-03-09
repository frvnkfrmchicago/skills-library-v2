---
name: swift
description: iOS, macOS, watchOS, visionOS development with SwiftUI and UIKit.
owner: Frank
last_updated: 2026-03
---

# Swift

Apple's modern language. Type-safe. Fast. Beautiful UIs.

---

## Context Questions

Before implementing with Swift:

1. **What Apple platforms?** — iOS, macOS, watchOS, visionOS?
2. **What's the UI approach?** — SwiftUI (modern) or UIKit (legacy)?
3. **What features needed?** — Camera, payments, AR, ML, health?
4. **Team experience?** — Swift native or transitioning from ObjC?
5. **Minimum iOS version?** — Determines available APIs

---

## TL;DR

| Need | Solution |
|------|----------|
| UI framework | SwiftUI (default 2026) |
| Legacy UI | UIKit |
| Networking | URLSession + async/await |
| Data persistence | SwiftData (preferred), Core Data |
| State management | @Observable, @State, @Binding |
| Navigation | NavigationStack |
| On-device ML | Core ML |
| AR experiences | ARKit, RealityKit |

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **UI paradigm** | UIKit (imperative) ←→ SwiftUI (declarative) |
| **Platform scope** | iOS-only ←→ Multi-platform (mac, watch, vision) |
| **iOS minimum** | iOS 15 (legacy) ←→ iOS 18+ (latest APIs) |
| **Complexity** | Simple utility ←→ Feature-rich app |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| New iOS app (2026) | SwiftUI + SwiftData + async/await |
| Existing UIKit app | Gradual SwiftUI integration |
| macOS app | SwiftUI with AppKit bridges |
| visionOS app | SwiftUI + RealityKit |
| Camera/AR features | AVFoundation + ARKit |
| On-device ML | Core ML + Vision |

---

## When to Use Swift

### ✅ Required For

- **iOS apps** — No alternative
- **macOS apps** — Native performance
- **watchOS apps** — Apple Watch
- **visionOS apps** — Apple Vision Pro
- **App Store distribution** — Must be Swift/ObjC

### ❌ Consider Alternatives

- **Cross-platform mobile** — React Native, Flutter
- **Android-only** — Kotlin
- **Backend API** — Node.js, Python, Rust

---

## Quick Start: SwiftUI App

```swift
// ContentView.swift
import SwiftUI

struct ContentView: View {
    @State private var count = 0
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text("Count: \(count)")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                HStack(spacing: 16) {
                    Button("Decrease") {
                        count -= 1
                    }
                    .buttonStyle(.bordered)
                    
                    Button("Increase") {
                        count += 1
                    }
                    .buttonStyle(.borderedProminent)
                }
            }
            .padding()
            .navigationTitle("Counter")
        }
    }
}

#Preview {
    ContentView()
}
```

---

## SwiftUI Patterns

### Observable State (iOS 17+)

```swift
@Observable
class UserViewModel {
    var user: User?
    var isLoading = false
    var error: Error?
    
    func fetchUser(id: String) async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            user = try await api.getUser(id: id)
        } catch {
            self.error = error
        }
    }
}

struct UserView: View {
    @State private var viewModel = UserViewModel()
    
    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView()
            } else if let user = viewModel.user {
                Text("Welcome, \(user.name)!")
            }
        }
        .task {
            await viewModel.fetchUser(id: "123")
        }
    }
}
```

### Navigation

```swift
struct AppView: View {
    var body: some View {
        NavigationStack {
            List(items) { item in
                NavigationLink(value: item) {
                    ItemRow(item: item)
                }
            }
            .navigationDestination(for: Item.self) { item in
                ItemDetailView(item: item)
            }
        }
    }
}
```

---

## SwiftData (iOS 17+)

```swift
import SwiftData

@Model
class Task {
    var title: String
    var isCompleted: Bool
    var createdAt: Date
    
    init(title: String) {
        self.title = title
        self.isCompleted = false
        self.createdAt = Date()
    }
}

struct TaskListView: View {
    @Environment(\.modelContext) private var context
    @Query(sort: \Task.createdAt) private var tasks: [Task]
    
    var body: some View {
        List(tasks) { task in
            TaskRow(task: task)
        }
    }
    
    func addTask(title: String) {
        let task = Task(title: title)
        context.insert(task)
    }
}

// App setup
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: Task.self)
    }
}
```

---

## Async/Await Networking

```swift
actor APIClient {
    private let session = URLSession.shared
    private let decoder = JSONDecoder()
    
    func fetch<T: Decodable>(_ url: URL) async throws -> T {
        let (data, response) = try await session.data(from: url)
        
        guard let http = response as? HTTPURLResponse,
              200..<300 ~= http.statusCode else {
            throw APIError.invalidResponse
        }
        
        return try decoder.decode(T.self, from: data)
    }
}

// Usage
let users: [User] = try await api.fetch(usersURL)
```

---

## Core ML Integration

```swift
import CoreML
import Vision

func classifyImage(_ image: UIImage) async throws -> String {
    guard let model = try? VNCoreMLModel(for: ImageClassifier().model) else {
        throw MLError.modelLoadFailed
    }
    
    let request = VNCoreMLRequest(model: model)
    
    guard let cgImage = image.cgImage else {
        throw MLError.invalidImage
    }
    
    let handler = VNImageRequestHandler(cgImage: cgImage)
    try handler.perform([request])
    
    guard let results = request.results as? [VNClassificationObservation],
          let top = results.first else {
        throw MLError.noResults
    }
    
    return top.identifier
}
```

---

## Project Structure

```
MyApp/
├── App/
│   └── MyApp.swift          # @main entry
├── Models/
│   └── User.swift           # Data models
├── Views/
│   ├── Components/          # Reusable views
│   └── Screens/             # Full screens
├── ViewModels/
│   └── UserViewModel.swift  # @Observable classes
├── Services/
│   └── APIClient.swift      # Networking
└── Resources/
    └── Assets.xcassets      # Images, colors
```

---

## Common Frameworks

| Framework | Purpose |
|-----------|---------|
| **SwiftUI** | Declarative UI |
| **SwiftData** | Data persistence |
| **Combine** | Reactive programming |
| **Core ML** | On-device machine learning |
| **ARKit** | Augmented reality |
| **RealityKit** | 3D content rendering |
| **AVFoundation** | Camera, audio, video |
| **HealthKit** | Health data access |
| **StoreKit 2** | In-app purchases |

---

## Related Skills

- `agents/mobile-native/SKILL.md` — Cross-platform comparison
- `agents/kotlin/SKILL.md` — Android counterpart
- `ai-builder/vision-models/SKILL.md` — Computer vision
- `agents/testing/SKILL.md` — iOS testing (XCTest)
