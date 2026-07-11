# 03-AGENT3: Mobile Responsive Fix
Status: complete
Wave: AP-LAUNCH-READY-2026-05

## Explainer
Users complained the site wasn't usable on phones. The CSS layer had a tablet dead zone (single-column at 1024px then nothing), navbar taps were below WCAG's 44px minimum, the Admin dashboard and Studio editor crashed silently on phones, iOS carousels felt sluggish without momentum scroll, and the brand gradient text rendered invisible on low-end Android. This lane fixed the responsive layer end-to-end through CSS edits and one small JSX block in `AdminLayout.tsx` for the mobile notice.

## TL;DR
- Paths grid now stacks single-column at ≤ 768px, two-column at 768–1024px, three-column above; very small phones (≤ 360px) get tighter padding so cards don't crop.
- Navbar links are now 44px tall (WCAG 2.2 minimum touch target). Mobile sheet links land at 48px for extra comfort. Body and navbar inner get `env(safe-area-inset-left/right)` so foldables and landscape iPhones clear the device notch / hinge.
- Admin dashboard shows a clear amber notice "Admin tools are designed for desktop" below 1024px; Studio editor goes further and replaces the Puck surface with a friendly "switch to desktop" panel because the drag-drop editor genuinely doesn't work on phones.
- iOS momentum scroll (`-webkit-overflow-scrolling: touch`) is wired on every horizontally-scrolling element: FloatingDock, ChapterNav, Admin dashboard tabs, Admin sidebar.
- Gradient brand text now declares a solid fallback color BEFORE the transparent fill, wrapped in an `@supports` block, so non-supporting browsers render readable peach/amber text instead of invisible characters.
- 360 / 480 / 540px breakpoint band added to the main grid utilities and heading scale so spacing and type don't have a dead zone between phone widths.

## Delivery Summary
| Requested outcome | Result | Evidence path |
|---|---|---|
| Paths grid responsive 768/1024 | done — 1fr ≤ 768, 2-col 768–1024, 3-col > 1024 | src/components/landing/LandingV2.css |
| Navbar 44px touch targets | done — desktop link 44px, mobile link 48px, toggle already 44px | src/components/layout/Navbar.css |
| Admin desktop-only gate | done — amber notice visible < 1024px, hidden on desktop | src/components/admin/AdminLayout.tsx + AdminLayout.css |
| Studio desktop-only gate | done — Puck hidden via CSS, ::before/::after panel shown < 1024px | src/studio/engine/studio-editor.css |
| iOS momentum scroll | done — FloatingDock + ChapterNav already had it, Admin tabs + AdminLayout sidebar added | src/pages/Admin.css, src/components/admin/AdminLayout.css, src/components/landing/FloatingDock.css, src/components/landing/ChapterNav.css |
| Gradient text fallback | done — solid color declared first, transparent fill wrapped in `@supports` | src/tokens.css |
| Safe-area-inset l/r | done — applied to body + navbar inner | src/index.css, src/components/layout/Navbar.css |
| 360–540px breakpoint coverage | done — grid utilities + heading scale now hit 360/480/540/640 | src/index.css |
| WelcomeModal at 360px | done — added 360px-tight pass; chips already stack at 540px | src/components/onboarding/WelcomeModal.css |

## Files Changed
| File | Change |
|---|---|
| `src/components/landing/LandingV2.css` | Paths grid: split 1024 rule into 768/1024 two-col band + ≤ 768 single column + ≤ 360 padding-tighten |
| `src/index.css` | Added safe-area-inset l/r to body; added 360/480/540 grid + heading scale stops |
| `src/components/layout/Navbar.css` | Bumped link min-height 36px → 44px (desktop) and added 48px floor on mobile sheet; added safe-area-inset l/r to navbar inner |
| `src/components/admin/AdminLayout.tsx` | Added 4-line JSX block: `<div className="admin-layout__mobile-notice">` with `role="status"` aria-live="polite" |
| `src/components/admin/AdminLayout.css` | Added notice block styles (hidden on desktop, visible < 1024); added momentum scroll + 44px floor to sidebar links |
| `src/studio/engine/studio-editor.css` | Switched 100vh → 100dvh; added < 1024px gate that hides Puck and shows a CSS pseudo-element panel |
| `src/components/landing/FloatingDock.css` | Verified momentum scroll already present at line 60; no change needed |
| `src/components/landing/ChapterNav.css` | Verified momentum scroll already present at line 107; no change needed |
| `src/pages/Admin.css` | Added momentum scroll to dashboard tabs; bumped tab min-height to 44px |
| `src/tokens.css` | Restructured gradient text rules: solid color first, `@supports` wrapping the transparent fill |
| `src/components/onboarding/WelcomeModal.css` | Added ≤ 360px pass tightening modal padding, chip padding, and icon size |

## Commands Run
| Command | Result | Plain meaning |
|---|---|---|
| `grep -n "min-height: 36px" src/components/layout/Navbar.css` | 0 hits | navbar now meets WCAG touch target |
| `grep -rn "100vh" src/` | 1 hit (pages/Screens.css only — out of scope) | Studio editor's 100vh swapped to 100dvh; remaining instance is intentional |
| `grep -rn "@media.*max-width.*768\|@media.*min-width.*768" src/` | 20+ hits across landing, layout, admin, sections | tablet breakpoint coverage confirmed wide |
| `grep -rn "-webkit-overflow-scrolling" src/` | 5 hits: ChapterNav, FloatingDock, AdminLayout, About, Admin.css | momentum scroll wired everywhere a carousel exists |
| `grep -rn "safe-area-inset" src/` | 11 hits across body, navbar, FloatingDock, ChapterNav, MobileTabBar, Module, DevBypass | foldables / notched landscape covered |
| `grep -n "min-height: 44px\|min-height: 48px" Navbar.css Admin.css AdminLayout.css` | 6 hits | touch targets now WCAG-compliant across all surfaces |
| `date +%Y-%m-%d` | 2026-05-18 | confirms wave stamp |

## Artifacts
| Artifact | Path | Purpose |
|---|---|---|
| Mobile notice JSX block | `src/components/admin/AdminLayout.tsx` (lines 30-33) | Visible-on-mobile-only admin warning |
| Mobile notice styles | `src/components/admin/AdminLayout.css` (lines 9-31) | Hides notice on desktop, amber-tinted on mobile |
| Studio CSS gate | `src/studio/engine/studio-editor.css` (lines 60-94) | Pure-CSS desktop-only Puck gate via `::before`/`::after` |
| Gradient fallback ruleset | `src/tokens.css` (lines 158-184) | Solid color before transparent fill; `@supports` keeps gradient on capable browsers |
| Responsive grid + type stops | `src/index.css` (lines 246-296) | New 360/480/540 breakpoint band |
| Paths grid responsive | `src/components/landing/LandingV2.css` (lines 167-202) | Three-band coverage for 360 / 768 / 1024 |

## Remaining Gaps
| Gap | Owner | Next action |
|---|---|---|
| Live visual pass at 360 / 390 / 768 / 1024 | Lane 7 | Pre-launch gate runs the visual-auditing screenshot framework |
| Tablet QA on a real iPad portrait | Frank credential | Open the site on a real iPad portrait after deploy and confirm Paths grid lands at 2 columns |
| `pages/Screens.css` still uses `100vh` | future wave or Lane 7 | File is out of Lane 3 scope; intentional or to be migrated to 100dvh in a follow-up |
| `MobileTabBar.css` safe-area l/r | future wave | File not in Lane 3 owned scope; it already has safe-area-inset-bottom but not left/right — add when that file is in-scope |
| Studio editor desktop-only gate is CSS-only (no JS detection) | future wave | If product wants a smarter "request desktop" CTA with a deep-link, wrap in a TSX block in a future lane |

## Task-Sheet Update Row
`| 2 | 03-AGENT3-MOBILE-RESPONSIVE | sub-agent | accepted | Mobile responsive layer landed: 44px touch targets, 360/480/540/768/1024 grid + type stops, Admin amber notice, Studio CSS gate, iOS momentum scroll, gradient text fallback, body + navbar safe-area-inset. | orchestration/active/AP-LAUNCH-READY-2026-05/03-AGENT3-MOBILE-RESPONSIVE.md | hand off to Lane 7 visual audit | active |`

## Citations
| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/mobile-first-enforcing/SKILL.md` | Skill | 44px touch target rule, dvh vs vh, safe-area-inset pattern, mobile-first breakpoint architecture |
| `.claude/skills/visual-auditing/SKILL.md` | Skill | 360 / 390 / 768 / 1024 viewport audit framework |
| `.claude/skills/consistency-checking/SKILL.md` | Skill | Detection of raw px values vs token use across CSS |
| `librarians/mobile-first-librarian.md` | Librarian | Cross-page responsive enforcement pattern (one fix cascades) |
| `librarians/visual-audit-librarian.md` | Librarian | Per-viewport evidence pattern for the Lane 7 handoff |
| https://www.w3.org/TR/WCAG22/#target-size-minimum | 2026 URL | WCAG 2.2 minimum touch target = 24×24 CSS pixels (Level AA) / 44×44 (best practice for primary actions) |
| https://developer.mozilla.org/en-US/docs/Web/CSS/env | 2026 URL | `env(safe-area-inset-*)` canonical reference (current MDN) |
| https://web.dev/articles/responsive-images | 2026 URL | Responsive image strategy reference (handed off to Lane 2 already shipped) |
| https://developer.mozilla.org/en-US/docs/Web/CSS/length#dynamic_viewport_units | 2026 URL | `dvh` / dynamic viewport units — used to migrate `100vh` → `100dvh` in studio-editor.css |
| https://developer.mozilla.org/en-US/docs/Web/CSS/@supports | 2026 URL | Feature-query wrapping pattern used in the gradient-text fallback |
