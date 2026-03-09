---
name: prompt-craft
description: The craft of speaking to AI about design. How to prompt for visuals, implement design patterns, and review output quality. Works with any AI tool.
---

# Prompt Craft

The art of speaking to AI about design.

## TL;DR

| Mode | What You're Doing |
|------|-------------------|
| **Prompting** | How to ASK for things |
| **Implementation** | How to BUILD what you asked for |
| **Review** | What to CHECK before shipping |

---

## Why This Matters

AI can build 80-90% of a design from a screenshot + prompt. The bottleneck isn't "can I build this?" anymore. It's:

1. **Do you have taste?** - Knowing what looks good
2. **Can you articulate it?** - Speaking the right language
3. **Can you refine it?** - Knowing what to fix

This skill teaches the language.

---

## The Core Principle

```
Garbage in → Garbage out
Specific in → Specific out
Reference + Words → Professional output
```

**A screenshot is worth 1,000 prompt words.**

Instead of describing every detail, show AI what you want + describe the changes.

---

## Variation Mode

> Activate when user wants "identity," "unique," "memorable," "not a template," or "varied"

When in Variation Mode, add the FORBIDDEN section to all design prompts:

```
## FORBIDDEN (DO NOT USE)

Typography:
- NO Inter, Outfit, Plus Jakarta Sans as primary
- NO centered headlines
- NO 48-64px hero text (go larger)

Layout:
- NO bento grids
- NO symmetrical layouts  
- NO centered max-width containers only

Animation:
- NO generic fadeInUp on scroll
- NO hover:scale-105 as only effect
- NO parallax just because

Components:
- NO shadcn defaults without customization
- NO glassmorphism cards (overused)

If you catch yourself doing any of these, STOP and do something different.
```

Reference: `/agents/anti-template/SKILL.md` for full forbidden list

---

## The Three Modes

### 1. Prompting Mode

How to structure requests for best results.

**Formula:**
```
[WHAT] + [STYLE] + [DETAILS] + [CONSTRAINTS]
```

**Example:**
```
❌ "Make a hero section"

✅ "Create a hero section for a mental health app with:
   - Headline left, image right
   - Soft gradients, calming colors (sage green, cream)
   - Inter font, large headline (48-64px)
   - Subtle fade-in animation on load
   - Mobile: stack headline above image"
```

### 2. Implementation Mode

Patterns and techniques for building.

- Use code snippets for animations (more reliable than prompting)
- Reference existing components with @ syntax
- Build hero first (50% of effort), then other sections
- Generate variations until something clicks

### 3. Review Mode

What to check before shipping.

- [ ] Responsive: No horizontal scrolling
- [ ] Images: None broken
- [ ] Contrast: 4.5:1 minimum for text
- [ ] Touch targets: 44px minimum on mobile
- [ ] Animations: Respect prefers-reduced-motion
- [ ] Typography: Hierarchy is clear

---

## NotebookLM Integration

Your workflow with this skill:

```
1. Create notebook: "Design Intelligence"
   - Add: Prompt Craft files
   - Add: 2025/2026 design trends research
   - Add: Gen Z preferences research
   - Add: Your brand guidelines

2. Before building:
   - Open Gemini/Anti-Gravity
   - Add notebook to conversation
   - Describe what you're building
   - Get design direction grounded in sources

3. While building:
   - Reference Prompt Craft for how to ask
   - Use patterns from your notebook
   - Iterate based on output

4. After building:
   - Run through Review checklist
   - Polish and refine
```

---

## Files in This Skill

| File | What It Covers |
|------|----------------|
| `ANIMATION.md` | Motion, timing, scroll effects, text animation |
| `STYLING.md` | Colors, shadows, themes, accessibility |
| `TYPOGRAPHY.md` | Fonts, pairing, scale, weight |
| `LAYOUT.md` | Responsive, grids, components, device framing |
| `RESOURCES.md` | Inspiration sites, tools, assets, libraries |

---

## Quick Reference

### Prompting Principles

1. **Be specific** - "blue-600" not "blue"
2. **Show don't tell** - Screenshot + words beats words alone
3. **One thing at a time** - Don't ask for hero + features + footer at once
4. **Negative prompts** - "Don't change the nav bar" when AI over-edits
5. **Reference what works** - "Like Apple's style" gives AI context

### Implementation Principles

1. **Hero first** - 50% of effort goes here
2. **Generate variations** - First output rarely best
3. **Use snippets** - More reliable than prompting for animations
4. **Edit mode for small changes** - Don't regenerate everything
5. **Match existing style** - Reference previous sections

### Review Principles

1. **Mobile first** - Check phone before desktop
2. **Fix broken images** - AI often generates bad ones
3. **Check contrast** - Accessibility matters
4. **Test interactions** - Buttons, links, hovers
5. **Performance** - No janky animations

---

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| "Make it look good" | Specify exactly what "good" means |
| Describe everything in words | Show a screenshot reference |
| Ask for entire page at once | Build section by section |
| Accept first output | Generate 3-5 variations |
| Ignore mobile | Design mobile-first |
| Use default everything | Specify fonts, colors, icons |

---

## Good Practices

### File Size Limits

| File Type | Max Lines |
|-----------|-----------|
| Component | 200 |
| Page | 300 |
| Hook | 100 |
| Utility | 50 |

Split files that grow beyond these.

### Code Organization

```
/components
  /ui           # Base components (Button, Card, Input)
  /features     # Feature-specific components
  /layouts      # Layout components (Header, Footer, Sidebar)

/app
  /page.tsx     # Keep pages thin, logic in components
```

### Performance

- Lazy load images below the fold
- Use `loading="lazy"` on images
- Limit animations on scroll (batch with ScrollTrigger)
- Test on slow devices, not just your MacBook

---

## 2025-2026 Design Context

What's trending and what AI should know:

| Trend | What It Means |
|-------|---------------|
| **Bento grids** | Apple-style varied card layouts |
| **Mesh gradients** | Soft, organic color blends |
| **Micro-interactions** | Every element responds to interaction |
| **Dark mode default** | Especially for Gen Z |
| **3D elements** | Spline, R3F for depth |
| **Video backgrounds** | Motion creates life |
| **AI-native features** | Apps that USE AI, not just built by AI |
| **Personality** | Less corporate, more human |
| **Mobile-first** | Phone is primary device |
| **Accessibility** | Not optional, expected |

---

## See Also

- `/prompt-craft/ANIMATION.md` - Motion and timing
- `/prompt-craft/STYLING.md` - Colors and themes
- `/prompt-craft/TYPOGRAPHY.md` - Fonts and scale
- `/prompt-craft/LAYOUT.md` - Structure and responsive
- `/prompt-craft/RESOURCES.md` - Inspiration and tools
