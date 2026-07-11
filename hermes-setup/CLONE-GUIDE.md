# Rapid Prototyping & Cloning Guide: The Order of Things

This guide outlines the exact, step-by-step lifecycle for cloning a real-world mobile app into a pixel-perfect, interactive frontend prototype (e.g., the Swiggy iOS UI Prototype). Use this as a playbook for the cloner agent (`twoface`) and coding agent (`hecthor`).

---

## The Order of Things (Cloning Lifecycle)

```
┌────────────────────────────────────────────────────────┐
│ 1. Search & Reference (Mobbin + Chrome Profile 15)      │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. Core Shell Layout (Mobile Device Frame, Status Bar) │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ 3. Define Design Tokens (Brand CSS Variables, HSL)      │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ 4. Markup Screen Sections (Onboarding, Home, Details)  │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ 5. Code Routing Engine (JavaScript Screen Stack)        │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ 6. Add Interactive Logic (Cart state, Live Tracking)   │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ 7. Audit & Local Preview (npx serve / deploy)          │
└────────────────────────────────────────────────────────┘
```

---

## Phase 1: Reference Extraction
- **The Source**: Target the app screens on Mobbin.com or Dribbble.
- **The Session**: Launch Chrome with debug port or extract cookies from the authenticated Google Chrome profile:
  - **Profile 15** contains the active sessions for **Mobbin.com** (`sb-ujasntkfphywizsdaapi-auth-token.0`/`1`) and Google Drive/Docs.
- **Action**: Search for the target application (e.g., "Swiggy"), filter by platform (iOS/Web), and download high-resolution screenshots of the key user flows (Onboarding, Home Feed, Search, Menu Details, Checkout, Order Tracking).

---

## Phase 2: Core Shell Layout
Before building individual screens, create the global outer wrapper that models a mobile viewport.

- **Desktop Centering Frame**: Set up a device container sized at standard mobile viewports (e.g. `390px` x `844px` for iPhone) centered on desktop.
- **iOS Status Bar**: A sticky header bar with mock time (9:41), cellular signal, Wifi, and battery icons.
- **Floating Bottom Navigation Bar**: Tab items mapped to targets (Home, Search, Cart, Account) using flex layout.
- **Screen Wrapper**: A flex/grid area where only one screen section is marked `.active` at any given time, hiding the rest.

---

## Phase 3: Brand Styling & Design Tokens
Establish a clean CSS layout using CSS variables rather than hardcoded colors.

```css
:root {
  /* Swiggy Brand Palette */
  --color-primary: #FC8019;       /* Swiggy Orange */
  --color-primary-light: #FFF2E6; /* Light Orange tint */
  --color-text-main: #1C1E21;
  --color-text-secondary: #686B78;
  --color-border: #E9E9EB;
  --color-success: #60B246;       /* Veg Green */
  --color-success-light: #EAF6E3;
  --color-bg-main: #FFFFFF;
  --color-bg-secondary: #F4F4F5;
  
  /* Fonts & Radius */
  --font-family: 'Inter', -apple-system, sans-serif;
  --font-title: 'Outfit', sans-serif;
  --radius-lg: 16px;
  --radius-md: 12px;
}
```
Apply HSL tailwinds or modern CSS selectors for premium glassmorphic cards, glowing borders, and smooth transitions on active buttons.

---

## Phase 4: Screen Sections Markup
Implement clean, semantic HTML using `<section class="screen">` blocks.

1. **Onboarding Screen (`#screen-onboarding`)**: Brand logo SVG, bold tagline, and phone number text input with automatic focus.
2. **OTP Verification Screen (`#screen-otp`)**: Back button, target phone reference, and 4 sequential individual digits text boxes with automatic cursor forwarding.
3. **Location Screen (`#screen-location`)**: Permission dialog prompt allowing users to select GPS location or search manually.
4. **Dashboard Home Feed (`#screen-home`)**: Header showing active DLF Phase 3 location, profile avatar, search input trigger, a grid layout for core services (Food, Instamart, Dineout, Genie), and horizontal restaurant promo lists.
5. **Search Overlay (`#screen-search`)**: Full-screen input with cancel button and list of recent search queries.
6. **Restaurant Details Menu (`#screen-res-detail`)**: Brand header card (ETA, ratings, pricing), category headers ("Recommended"), and menu item cards (Paneer Makhani, Maggi, Garlic Bread) with "ADD" button triggers.
7. **Checkout Cart (`#screen-cart`)**: Breakdown of selected items with quantity adjusters, bill calculations (delivery partner fees, platform fees, total pay), and Google Pay / UPI selector.
8. **Delivery Tracking Map (`#screen-tracking`)**: An embedded SVG street grid, animated rider marker, ETA badge ("Arriving in 10 Mins"), and a step timeline (Order Confirmed → Cooking → Dispatched → Delivered).

---

## Phase 5: JavaScript Navigation Engine
Use vanilla JavaScript to implement a fast, stack-based routing system.

- **Screen Stack Array**: `const screenStack = ['screen-onboarding'];`
- **History Back/Forward Routing**:
  ```javascript
  function navigateTo(screenId, direction = 'forward') {
    const currentActive = document.querySelector('.screen.active');
    
    if (direction === 'forward') {
      if (currentActive) {
        currentActive.classList.remove('active');
        currentActive.classList.add('prev');
      }
      const target = document.getElementById(screenId);
      target.classList.remove('prev');
      target.classList.add('active');
      screenStack.push(screenId);
    } else if (direction === 'back' && screenStack.length > 1) {
      screenStack.pop();
      const prevScreenId = screenStack[screenStack.length - 1];
      if (currentActive) currentActive.classList.remove('active');
      const target = document.getElementById(prevScreenId);
      target.classList.add('active');
    }
  }
  ```
- **Tab Bar Toggle Logic**: Automatically hide the navigation bar on utility screens (Onboarding, OTP, Tracking) and show it with appropriate active classes on dashboard views.

---

## Phase 6: Micro-App Interactive Engines
To make the clone feel premium and alive, build mini state engines inside JavaScript:

- **Cart State Machine**:
  - Keep a reactive `cart = []` list.
  - When user clicks "ADD", append item with `quantity: 1`. Hide "ADD", display flex quantity button (`− 1 +`).
  - Clicking `+` increments quantity. Clicking `−` decrements quantity, removing from list and reverting button to "ADD" when quantity hits 0.
  - Recalculate bill sums and grand totals instantly in the DOM.
- **Simulated Live Tracker**:
  - When checking out, transition to the tracking view.
  - Run a sequential `setTimeout` timeline to advance the delivery rider marker, change step badges ("Rider Assigned" → "Picked Up" → "Arriving"), and color step checkmarks.

---

## Phase 7: Preview & Verification
- **Validate Chrome DevTools Dev Server**: Serve files locally via `npx -y serve .`
- **Confirm Mobile Feel**: Test touch inputs, scrolling, empty states, and dynamic status bars.
