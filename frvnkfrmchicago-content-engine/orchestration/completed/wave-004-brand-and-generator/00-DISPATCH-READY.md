# Wave 004: Brand Identity & Interactive Generator Refinement Dispatch

## Goal
Establish Asset Persona brand identity (plum/peach, SVG logo, moving background, TikTok removal, full text badges) and re-engineer the Post Generator modal to support a split-pane layout, date timeline sorting, and pre-save draft preview review/edit/delete states.

## Lanes
1. **Lane 1: Brand Token & Moving Backgrounds (Agent 1)**
   - Target: `app/styles.css`, `app/index.html`
   - Goal: Add plum/peach vars, SVG logo, animated body mesh backdrop, remove TikTok, clean up badge labels.
2. **Lane 2: Split-Pane Generator Layout (Agent 2)**
   - Target: `app/app.js`
   - Goal: Implement the split navigation/workspace modal structure, date timestamp mapping, and timeline sorting.
3. **Lane 3: Pre-Save Draft Review Funnel (Agent 3)**
   - Target: `app/app.js`
   - Goal: Implement memory queue arrays, preview draft editor fields, and pre-save card delete buttons.
4. **Lane 4: Dynamic Source Filter Dropdown (Agent 4)**
   - Target: `app/src/trending.js`
   - Goal: Add more RSS variants, extract CLEAN publisher names, dynamic filter selector.
