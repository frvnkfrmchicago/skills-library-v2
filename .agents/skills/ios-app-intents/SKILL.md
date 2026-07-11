---
name: ios-app-intents
description: >
  Designs and implements App Intents, AppEntity types, EntityQuery
  resolvers, and AppShortcutsProvider for iOS apps. Exposes app actions
  to Shortcuts, Siri, Spotlight, widgets, controls, and Apple Intelligence.
  Covers intent architecture, entity design, shortcut phrases, interactive
  snippets (iOS 26), and routing execution back into the app. Use when
  exposing app actions outside the UI, adding Siri support, building
  widgets with intents, implementing App Shortcuts, or when user mentions
  intents, Siri, Shortcuts, AppEntity, or Spotlight actions.
---

# iOS App Intents

App Intents are the semantic API that lets iOS understand what your app
can DO and what data it HAS. Every action worth exposing to Siri,
Shortcuts, Spotlight, or Apple Intelligence starts here.

---

## 1. Intent Architecture Decision Tree

```
What are you exposing?
│
├── An action the user performs (create, send, toggle, play)?
│   └── Create an AppIntent
│       └── Define parameters, perform(), and result type
│
├── A data model the system should know about (contacts, items, tasks)?
│   └── Create an AppEntity + EntityQuery
│       └── Define displayRepresentation and query methods
│
├── Zero-configuration shortcuts users discover automatically?
│   └── Implement AppShortcutsProvider
│       └── Define phrases and shortcut definitions
│
├── A configurable widget or Live Activity?
│   └── AppIntent + AppEntity for configuration
│       └── Widget uses intent for user-selected entity
│
└── A Control Center toggle or Lock Screen control?
    └── AppIntent with ControlWidget
        └── iOS 26: Can use interactive glass snippets
```

---

## 2. AppEntity Implementation

An `AppEntity` is a lightweight representation of your app's data.
Keep it minimal — only include what the system UI needs to display.

```swift
// ✅ REQUIRED — Lightweight entity
struct TaskEntity: AppEntity {
    static var typeDisplayRepresentation = TypeDisplayRepresentation(
        name: "Task"
    )

    static var defaultQuery = TaskQuery()

    var id: String
    var title: String
    var isComplete: Bool
    var dueDate: Date?

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(
            title: "\(title)",
            subtitle: isComplete ? "Complete" : "Pending",
            image: .init(systemName: isComplete ? "checkmark.circle.fill" : "circle")
        )
    }
}
```

```swift
// ❌ BAD — Entity mirrors the entire database model
struct TaskEntity: AppEntity {
    var id: String
    var title: String
    var description: String
    var createdAt: Date
    var updatedAt: Date
    var createdBy: String
    var assignedTo: String
    var priority: Int
    var tags: [String]
    var attachments: [Data]  // NEVER put binary data in an entity
    var comments: [Comment]
    // Entity should be a REFERENCE, not the full object
}
```

### Entity Design Rules

- Include ONLY: `id`, display fields, and essential metadata
- `displayRepresentation` must produce a human-readable title and subtitle
- Use `TypeDisplayRepresentation` for plural/singular naming
- Entity should be fast to construct — no I/O in init

---

## 3. EntityQuery Patterns

The query handles entity resolution — how the system finds your entities.

```swift
// ✅ REQUIRED — Full query implementation
struct TaskQuery: EntityQuery {
    // Resolve specific entities by ID (required)
    func entities(for identifiers: [TaskEntity.ID]) async throws -> [TaskEntity] {
        let tasks = try await TaskStore.shared.fetch(ids: identifiers)
        return tasks.map { TaskEntity(from: $0) }
    }

    // Suggest entities for Siri/Shortcuts picker (required for discoverability)
    func suggestedEntities() async throws -> [TaskEntity] {
        let recent = try await TaskStore.shared.fetchRecent(limit: 10)
        return recent.map { TaskEntity(from: $0) }
    }
}
```

### Dynamic Configuration (iOS 26+)

For widgets and controls that let users pick an entity:

```swift
struct SelectTaskIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Select Task"

    @Parameter(title: "Task")
    var task: TaskEntity
}
```

### Query Performance

- `suggestedEntities()` should return quickly (< 500ms)
- Cache results where possible — this method is called frequently
- Limit suggestions to 10-20 most relevant items
- NEVER do a full database scan in `suggestedEntities()`

---

## 4. AppShortcutsProvider

Zero-configuration shortcuts appear automatically in Spotlight and
the Shortcuts app without the user setting anything up.

```swift
// ✅ REQUIRED — System-discoverable shortcuts
struct AppShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: CreateTaskIntent(),
            phrases: [
                "Create a task in \(.applicationName)",
                "Add a new \(.applicationName) task",
                "New task with \(.applicationName)"
            ],
            shortTitle: "Create Task",
            systemImageName: "plus.circle"
        )

        AppShortcut(
            intent: ShowTasksIntent(),
            phrases: [
                "Show my \(.applicationName) tasks",
                "Open \(.applicationName) tasks",
                "What are my tasks in \(.applicationName)"
            ],
            shortTitle: "Show Tasks",
            systemImageName: "list.bullet"
        )
    }
}
```

### Phrase Rules

- Always include `\(.applicationName)` in at least one phrase variant
- Provide 2-5 phrase variations per shortcut
- Use natural language — how would a user actually say this?
- Avoid jargon or internal terminology in phrases

---

## 5. AppIntent Implementation

```swift
// ✅ Complete intent with parameters and result
struct CreateTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Create Task"
    static var description: IntentDescription = "Creates a new task"

    @Parameter(title: "Title")
    var title: String

    @Parameter(title: "Due Date", default: nil)
    var dueDate: Date?

    @Parameter(title: "Priority", default: .medium)
    var priority: TaskPriority

    static var parameterSummary: some ParameterSummary {
        Summary("Create \(\.$title)") {
            \.$dueDate
            \.$priority
        }
    }

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let task = try await TaskStore.shared.create(
            title: title,
            dueDate: dueDate,
            priority: priority
        )

        return .result(dialog: "Created \"\(task.title)\"")
    }
}
```

### Intent Parameter Types

| Type | Use For |
|---|---|
| `String` | Free text input |
| `Int`, `Double` | Numeric values |
| `Date` | Date/time selection |
| `Bool` | Toggle options |
| `enum` (AppEnum) | Fixed set of choices |
| `AppEntity` | Entity selection from your app |

---

## 6. Apple Intelligence Integration (iOS 26+)

For Apple Intelligence to proactively invoke your intents, you need
domain declarations that tell the system what category of action this is.

```swift
struct CreateTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Create Task"

    // Domain declaration for Apple Intelligence
    static var authenticationPolicy: IntentAuthenticationPolicy = .alwaysAllowed

    // Semantic metadata
    static var isDiscoverable = true

    // ...
}
```

### Domain Best Practices

- Ensure `displayRepresentation` is descriptive and human-readable
- Keep `suggestedEntities()` current — Apple Intelligence uses these
- Intent `title` and `description` should be natural language
- Test with Siri to verify semantic understanding

---

## 7. Interactive Snippets (iOS 26+)

Intents can return interactive SwiftUI views that render directly
in the Shortcuts app or system surfaces.

```swift
struct ShowTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Show Task"

    @Parameter(title: "Task")
    var task: TaskEntity

    @MainActor
    func perform() async throws -> some IntentResult & ShowsSnippetView {
        let fullTask = try await TaskStore.shared.fetch(id: task.id)

        return .result {
            TaskSnippetView(task: fullTask)
        }
    }
}

// The snippet view renders IN the Shortcuts app
struct TaskSnippetView: View {
    let task: Task

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(task.title)
                .font(.headline)
            if let dueDate = task.dueDate {
                Text(dueDate, style: .date)
                    .foregroundStyle(.secondary)
            }
            HStack {
                Image(systemName: task.isComplete ? "checkmark.circle.fill" : "circle")
                Text(task.isComplete ? "Complete" : "Pending")
            }
        }
        .padding()
    }
}
```

---

## 8. Routing Intent Execution to the App

When an intent needs to open the app and navigate to a specific screen:

```swift
struct OpenTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Open Task"
    static var openAppWhenRun = true  // Opens the app

    @Parameter(title: "Task")
    var task: TaskEntity

    @MainActor
    func perform() async throws -> some IntentResult {
        // Post notification or update shared state
        NavigationManager.shared.navigate(to: .taskDetail(id: task.id))
        return .result()
    }
}
```

### Deep Link Pattern

```swift
// In your App struct
@main
struct MyApp: App {
    @State private var navigationManager = NavigationManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(navigationManager)
                .onContinueUserActivity(
                    "com.myapp.openTask"
                ) { activity in
                    navigationManager.handle(activity)
                }
        }
    }
}
```

---

## 9. Testing Intents

### Shortcuts App Testing
1. Build and run the app on device/simulator
2. Open the Shortcuts app
3. Your `AppShortcutsProvider` shortcuts appear under your app
4. Tap to test parameter input and execution

### Siri Testing
1. Long-press side button or say "Hey Siri"
2. Speak one of your defined phrases
3. Verify Siri resolves the intent correctly
4. Check that parameters are filled as expected

### Unit Testing

```swift
func testCreateTaskIntent() async throws {
    let intent = CreateTaskIntent()
    intent.title = "Test Task"
    intent.priority = .high

    let result = try await intent.perform()
    // Verify the task was created
    let tasks = try await TaskStore.shared.fetchAll()
    XCTAssertTrue(tasks.contains { $0.title == "Test Task" })
}
```

---

## ⛔ STOP GATE — Intent Coverage

DO NOT mark App Intents work as complete without:

1. Every exposed action has a `displayRepresentation` that is human-readable
2. Every `EntityQuery` implements both `entities(for:)` AND `suggestedEntities()`
3. `AppShortcutsProvider` includes at least one shortcut per core action
4. All shortcuts tested in the Shortcuts app
5. At least one phrase tested with Siri
6. `openAppWhenRun` intents verified to navigate correctly

---

## NEVER

- **NEVER** put heavy data (images, binary, full models) in an `AppEntity`
- **NEVER** do synchronous I/O in `suggestedEntities()` — keep it fast
- **NEVER** use URL schemes for actions that should be App Intents
- **NEVER** hardcode phrases without `\(.applicationName)`
- **NEVER** skip `displayRepresentation` — the system UI depends on it
- **NEVER** forget to test with Siri — phrase recognition may differ

---

## Pre-Completion Checklist

- [ ] All core actions have corresponding `AppIntent` implementations
- [ ] All data types have `AppEntity` + `EntityQuery` definitions
- [ ] `AppShortcutsProvider` registered and discoverable
- [ ] `displayRepresentation` descriptive and human-readable on every entity
- [ ] Shortcut phrases sound natural with 2-5 variations each
- [ ] Tested in Shortcuts app and with Siri
- [ ] `openAppWhenRun` intents verified for correct navigation
- [ ] Version-gated any iOS 26-specific features
- [ ] No binary data in entities

---

## Related Skills

- `swiftui-view-building` — View architecture for snippet views
- `swiftui-liquid-glass` — Glass styling for interactive snippets
- `ios-debugging` — Debugging intent execution
- `native-store-compliance` — App Review requirements for Siri integration
