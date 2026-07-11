---
name: wings
description: Wings are grouped sets of librarians that activate together. Instead of calling one librarian at a time, activate a Wing to load every librarian needed for a specific objective. Think of Wings as departments within the library, each staffed by specialists who work in concert.
last_updated: 2026-03-08
---

# Wings

A **Wing** is a curated group of librarians that activate together for a specific objective. Instead of remembering which 5 librarians to load for an app build, activate one Wing and get them all.

---

## How to Use

```
"Open the Build Wing"
"Activate the Design Wing"
"I need the Ship Wing"
"Launch Quality Wing"
```

The agent should load ALL librarians in that Wing and apply them throughout the conversation. Each librarian retains its own rules and gates.

---

## Wing: Build

**For:** Building a new application from scratch or adding significant features.

**Activate when:** "I'm building an app" or "new feature" or "start a project"

| Librarian | Role in This Wing |
|-----------|-------------------|
| `design-librarian` | Creative direction, palette, visual identity |
| `experience-designer-librarian` | Design tokens, visual system |
| `typography-librarian` | Type scale, font cascade |
| `components-librarian` | Interactive components |
| `flow-librarian` | User story flows (auth, onboarding, payment) |
| `copywriting-librarian` | UI text, error messages, labels |
| `anti-mock-data-librarian` | Real data from the start |
| `mobile-first-librarian` | Responsive, touch-first |
| `live-session-librarian` | Real-time session architecture (if applicable) |
| `ad-planner-librarian` | First-party ad network surfaces, placements, compliance |

---

## Wing: Design

**For:** Visual design work, UI decisions, creating or refining the look and feel.

**Activate when:** "Design this" or "make it look better" or "visual overhaul"

| Librarian | Role in This Wing |
|-----------|-------------------|
| `design-librarian` | **Wing Lead** — creative direction, palette, branding, icons, engagement patterns |
| `experience-designer-librarian` | Token system implementation |
| `creative-motion-librarian` | Spatial layouts, Bento templates, ambient vs. interactive loops, WebGL overlays |
| `gamification-librarian` | Hook progression, variable reward likeloops, 18+ safety gating |
| `typography-librarian` | Type hierarchy, font selection |
| `animation-librarian` | Motion design, micro-interactions |
| `3d-librarian` | 3D elements, WebGL effects |
| `components-librarian` | Interactive component behavior |
| `mobbin-librarian` | Real-world pattern reference |
| `clone-mobbin-librarian` | Automated app cloning from Mobbin flows |
| `live-teardown-librarian` | Measure live apps via CDP for design specs |

---

## Wing: Ship

**For:** Getting a project from "works locally" to "live on the internet."

**Activate when:** "Deploy this" or "ship it" or "put it live" or "push to production"

| Librarian | Role in This Wing |
|-----------|-------------------|
| `deployment-librarian` | GitHub Pages, Vercel, Cloudflare |
| `pre-deployment-librarian` | Pre-deploy verification checklist |
| `hacker-attacker-librarian` | Security scan before push |
| `anti-glitch-librarian` | Performance check before deploy |
| `anti-mock-data-librarian` | Verify no mock data ships |
| `exit-librarian` | Final ship checklist |

---

## Wing: Quality

**For:** Auditing, reviewing, and hardening an existing project.

**Activate when:** "Audit this" or "review the code" or "is this production ready"

| Librarian | Role in This Wing |
|-----------|-------------------|
| `code-scrutinizer-librarian` | 7-lens code review |
| `hacker-attacker-librarian` | Security vulnerability scan |
| `anti-glitch-librarian` | Performance and loading diagnosis |
| `performance-librarian` | Core Web Vitals targets |
| `testing-librarian` | Test coverage and quality |
| `visual-audit-librarian` | Visual consistency check |
| `consistency-librarian` | Code style consistency |
| `lazy-leaky-librarian` | AI shortcut detection, ignore abuse, info leakage |
| `app-scanner-librarian` | Full architecture discovery, screen/flow/system mapping |
| `connector-librarian` | Completeness audit — dead code, hanging routes, disconnected features |
| `graphify-librarian` | Knowledge graph architecture mapping, graph-first investigation |

---

## Wing: Mobile

**For:** Building or optimizing for iOS and Android.

**Activate when:** "Mobile app" or "React Native" or "Expo" or "App Store"

| Librarian | Role in This Wing |
|-----------|-------------------|
| `mobile-first-librarian` | Mobile-specific standards and compliance |
| `experience-designer-librarian` | Token system (responsive tokens) |
| `flow-librarian` | Mobile user flows (onboarding, payment, notifications) |
| `onboarding-librarian` | First-run experience |
| `anti-glitch-librarian` | Mobile performance optimization |
| `deployment-librarian` | Mobile deploy pipeline (EAS, Fastlane) |
| `live-session-librarian` | Real-time audience/session features |

---

## Wing: Native

**For:** Building, debugging, and shipping iOS/Android apps with SwiftUI and React Native Expo.

**Activate when:** "iOS app" or "SwiftUI" or "TestFlight" or "Expo build" or "EAS" or "App Store" or "Play Store" or "App Intents" or "Liquid Glass"

| Librarian | Role in This Wing |
|-----------|-------------------|
| `swiftui-view-librarian` | SwiftUI view architecture, navigation, refactoring |
| `swiftui-performance-librarian` | Instruments profiling, body evaluation, hang detection |
| `swiftui-liquid-glass-librarian` | iOS 26 Liquid Glass design language |
| `ios-intents-librarian` | App Intents, Siri, Spotlight, Shortcuts integration |
| `ios-debugger-librarian` | Simulator, LLDB, crash logs, network debugging |
| `expo-testflight-librarian` | EAS Build, signing, TestFlight, OTA, CI/CD |
| `expo-building-librarian` | Expo architecture, Router, config plugins |
| `android-librarian` | Gradle, Play Store, Kotlin, secure storage |
| `store-compliance-librarian` | App Store + Play Store review, privacy, ATT |
| `native-testing-librarian` | Detox, Maestro, crash symbolication, device matrix |
| `mobile-first-librarian` | Mobile-first standards (existing, complementary) |

---

## Wing: Content

**For:** Writing, copywriting, and content strategy.

**Activate when:** "Write copy for" or "content strategy" or "marketing page"

| Librarian | Role in This Wing |
|-----------|-------------------|
| `copywriting-librarian` | Voice, tone, AI language ban |
| `research-librarian` | Audience and market research |
| `anti-mock-data-librarian` | Real content, not lorem ipsum |
| `experience-designer-librarian` | Content fits within design system |
| `media-creation-librarian` | Stickers, GIFs, filters, SVG animation routing |
| `threads-librarian` | Threads feed scraping, engagement, social listening |

---

## Wing: Intelligence

**For:** AI features, LLM integration, agent systems.

**Activate when:** "AI feature" or "chatbot" or "LLM" or "agent system"

| Librarian | Role in This Wing |
|-----------|-------------------|
| `multi-agent-librarian` | Multi-agent orchestration |
| `sad-librarian` | Sequential Agentic Development — front gate to quality thinking |
| `prompt-librarian` | Prompt engineering |
| `conversational-ai-librarian` | Chat and conversational UI |
| `google-ai-librarian` | Google AI integration |
| `n8n-librarian` | Workflow automation |
| `hacker-attacker-librarian` | AI-specific security (prompt injection) |
| `notebooklm-librarian` | NotebookLM CLI, knowledge pipelines, research queries |
| `review-orchestration-librarian` | Reviews completed agent waves for evidence and quality |
| `graphify-librarian` | Knowledge graph generation, codebase mapping, cross-document synthesis |
| `rag-librarian` | RAG pipelines, vector search, embeddings, chunking, hybrid retrieval |

---

## Wing: Backend

**For:** Database, API, server-side architecture.

**Activate when:** "Build the backend" or "database design" or "API architecture"

| Librarian | Role in This Wing |
|-----------|-------------------|
| `backend-librarian` | Server architecture |
| `database-librarian` | Schema design, queries |
| `api-integration-librarian` | API patterns |
| `supabase-librarian` | Supabase-specific patterns |
| `security-librarian` | Security policy |
| `algorithm-librarian` | Feed ranking, recommendation engines, scoring formulas |
| `rag-librarian` | RAG pipelines, vector stores (pgvector), embedding models, retrieval |

---

## Wing: Game Studio

**For:** Building browser games with 2D or 3D rendering, physics, and game-specific architecture.

**Activate when:** "Build a game" or "browser game" or "game studio" or "game dev"

| Librarian | Role in This Wing |
|-----------|-------------------|
| `playmaster-librarian` | **Wing Lead** — routes to correct skill, orchestrates multi-skill workflows |
| `game-assessor-librarian` | Feasibility, WebView memory limits, Game Night scaling |
| `web-game-foundations-librarian` | Architecture: engine choice, game loop, input model, scene states |
| `r3f-game-librarian` | React Three Fiber game runtime (if React-hosted) |
| `three-webgl-game-librarian` | Plain Three.js game runtime (if standalone) |
| `playmaster-asset-librarian` | 2D game asset outpainting, sprites, tiles, and props |
| `web-3d-asset-librarian` | 3D model optimization, compression, collision |
| `animation-librarian` | Game UI motion design and transitions |
| `live-session-librarian` | Multiplayer sessions (if applicable) |
| `blender-librarian` | Blender MCP 3D modeling, texturing, rendering, animation |

---

## Wing: API & Resource

**For:** API keys, keyless API integrations, web searching, and server config.

**Activate when:** "I need an API key," "query public data," "what APIs are on the VM," or "search web"

| Librarian | Role in This Wing |
|-----------|-------------------|
| `resource-registry` | **Wing Lead** — configuration of Brave, Tavily, social, and GCE VM utilities |
| `shipfreeapis` | Categorized index of 52 free/keyless external datasets |
| `connector-librarian` | Verifies all routes, flows, and features are connected end-to-end |

---

## Custom Wings

Users can create their own Wings:

```markdown
## Wing: [Name]

**For:** [What this Wing is used for]

**Activate when:** [Trigger phrases]

| Librarian | Role in This Wing |
|-----------|-------------------|
| `[librarian-name]` | [What it does in this context] |
```

---

## Wing Stacking

You can stack Wings when a task spans multiple concerns:

```
"Open Build Wing + Mobile Wing"
→ Loads all librarians from both Wings (deduplicated)

"Ship Wing on top of Quality Wing"
→ Quality audit first, then deployment checklist
```

When Wings overlap (same librarian in multiple Wings), the librarian is loaded once but its rules apply throughout.

---

## Full Librarian Index

For reference, here is every librarian organized by primary concern:

### Visual & Design
- `design-librarian` — **Creative direction, palette, branding, icons, engagement patterns**
- `experience-designer-librarian` — Design token hub
- `creative-motion-librarian` — Premium layout overrides, spatial canvases, ambient/interactive motion loops
- `gamification-librarian` — Hook model progression, variable reward likeloops, 18+ safety gating
- `typography-librarian` — Type system
- `animation-librarian` — Motion design
- `3d-librarian` — 3D/WebGL
- `components-librarian` — Interactive components
- `mobbin-librarian` — Pattern reference
- `interactive-animation-librarian` — Advanced animations

### Quality & Security  
- `code-scrutinizer-librarian` — 7-lens code review
- `hacker-attacker-librarian` — Offensive security scanning
- `security-librarian` — Security policy
- `anti-glitch-librarian` — Performance debugging
- `performance-librarian` — Core Web Vitals
- `testing-librarian` — Test quality
- `code-audit-librarian` — Code audit
- `code-cleaner-librarian` — Code cleanup
- `visual-audit-librarian` — Visual consistency
- `consistency-librarian` — Style consistency
- `reviewer-librarian` — Code review
- `lazy-leaky-librarian` — **AI shortcut detection, ignore abuse, information leakage**

### Building & Architecture
- `flow-librarian` — User story flows
- `mobile-first-librarian` — Mobile standards
- `frontend-librarian` — Frontend architecture
- `backend-librarian` — Server architecture
- `database-librarian` — Database design
- `api-integration-librarian` — API integration
- `supabase-librarian` — Supabase patterns
- `implementation-librarian` — Implementation guidance
- `onboarding-librarian` — Onboarding design
- `live-session-librarian` — **Real-time sessions, audience, WebRTC/WebSocket**

### Game Studio
- `playmaster-librarian` — **Hub: routes to correct game skill, orchestrates builds**
- `game-assessor-librarian` — Feasibility, WebView memory limits, Game Night scaling
- `web-game-foundations-librarian` — Engine choice, game loop, input model, scene states
- `r3f-game-librarian` — React Three Fiber game runtime
- `three-webgl-game-librarian` — Plain Three.js game runtime
- `playmaster-asset-librarian` — 2D game asset creation and alignment
- `web-3d-asset-librarian` — 3D model optimization pipeline

### Content & Copy
- `copywriting-librarian` — Voice, tone, AI ban
- `anti-mock-data-librarian` — Real data enforcement
- `research-librarian` — Research methodology
- `search-librarian` — Search functionality

### DevOps & Shipping
- `deployment-librarian` — Deploy to GitHub/Vercel/Cloudflare
- `pre-deployment-librarian` — Pre-deploy checks
- `exit-librarian` — Final ship gate

### AI & Automation
- `multi-agent-librarian` — Multi-agent systems
- `sad-librarian` — **Sequential Agentic Development — front gate to quality thinking**
- `prompt-librarian` — Prompt engineering
- `conversational-ai-librarian` — Chat/conversational AI
- `google-ai-librarian` — Google AI
- `fine-tuning-librarian` — Model fine-tuning
- `n8n-librarian` — n8n automation
- `orchestration-librarian` — Agent orchestration
- `graphify-librarian` — **Knowledge graph generation, codebase mapping, architecture investigation**
- `rag-librarian` — **RAG pipelines, vector search, embeddings, chunking, reranking, evaluation**

### Operations & Meta
- `facilitator-librarian` — Meeting/collaboration
- `progress-tracker-librarian` — Progress tracking
- `tech-advisor-librarian` — Technology decisions
- `tech-budget-librarian` — **Tech budget analysis, infrastructure cost audit**
- `ux-design-librarian` — UX patterns
- `aws-librarian` — AWS services
- `azure-librarian` — Azure services
- `computer-lab-librarian` — Lab environment
- `ad-planner-librarian` — **First-party ad network: surfaces, placements, compliance**
- `app-scanner-librarian` — **Full app architecture discovery and developer dashboard**
- `clone-mobbin-librarian` — **Automated app cloning from Mobbin flows**
- `live-teardown-librarian` — **CDP-based live app measurement for design specs**
- `review-orchestration-librarian` — **Post-wave quality review with 18-item checklist**
- `connector-librarian` — **Completeness audit: dead code, hanging routes, disconnected features**
- `notebooklm-librarian` — **NotebookLM CLI, research notebooks, knowledge pipelines**
- `media-creation-librarian` — **GrazzHopper media skill routing: stickers, GIFs, filters, SVG**
- `threads-librarian` — **Threads feed intelligence, engagement, social listening**
- `algorithm-librarian` — **Feed ranking, recommendation engines, scoring, content distribution**
- `blender-librarian` — **Blender MCP 3D modeling, texturing, rendering, animation**
