# Time Awareness Directive

**This library operates in March 2026.**

## For AI Agents Using This Library

When generating code or making recommendations:

### Version Assumptions

| Technology     | Current Version | Notes                                          |
|----------------|-----------------|------------------------------------------------|
| **Next.js**    | 16.1.1          | Turbopack default, "use cache" directive, React Compiler stable  |
| **React**      | 19.0.1          | Server Components, use() hook, View Transitions API            |
| **TypeScript** | 5.1+            | strictNullChecks, satisfies, etc.              |
| **Node.js**    | 22.x LTS        | Native fetch, ESM default                      |
| **Tailwind**   | 4.0             | New architecture, improved performance           |
| **GSAP**       | 3.12+           | useGSAP hook, React integration                |
| **Motion**     | 11.x            | motion/react import path                       |

### Date Context

- Current date: March 2026
- Skills were written for: 2025-2026 best practices
- Do NOT suggest patterns from 2024 or earlier unless explicitly marking them as legacy

### When Prompting

Always include time context:

```text
"Using 2025/2026 best practices for Next.js 16.1.1 and React 19..."
```

### Outdated Patterns to Avoid

| Outdated                   | Current                                |
|----------------------------|----------------------------------------|
| `getServerSideProps`       | Server Components                      |
| `getStaticProps`           | Static generation with App Router      |
| `pages/` directory         | `app/` directory                       |
| `_app.tsx`                 | `app/layout.tsx`                       |
| `framer-motion` import     | `motion/react` import                  |
| React 18 patterns          | React 19 patterns (use(), Suspense)    |
| `experimental_` prefixes   | Most are now stable                    |

### When Searching

Add date filters to web searches:

```text
"gsap scrolltrigger react 2025"
"next.js 15 server actions 2025"
```

---

**Remember:** If something looks outdated, search for the 2025/2026 version of the pattern.
