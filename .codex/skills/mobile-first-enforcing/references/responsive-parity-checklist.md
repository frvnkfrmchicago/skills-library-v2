# Responsive Parity Audit Checklist

Use this when desktop and mobile look like different platforms. Run these checks in order.

## 1. Find Hardcoded Heights

    grep -rn 'h-\[\d\+px\]' --include='*.tsx' . | grep -v node_modules | grep -v '.next'
    grep -rn 'min-h-\[\d\+px\]' --include='*.tsx' . | grep -v node_modules | grep -v '.next'

Each hit is a candidate for clamp() replacement.

## 2. Find Breakpoint Cascades

    grep -rn 'sm:min-h\|md:min-h\|lg:min-h\|sm:h-\|md:h-\|lg:h-' --include='*.tsx' . | grep -v node_modules

Multi-breakpoint height overrides should be collapsed into a single clamp() value.

## 3. Check for max-width Media Queries (Anti-Pattern)

    grep -n 'max-width' globals.css

Every `@media (max-width: ...)` is a desktop-first override. Convert to `@media (min-width: ...)` by making small-screen values the base and large-screen values the enhancement.

## 4. Count min-h-screen / h-screen

    grep -rn 'min-h-screen\|h-screen' --include='*.tsx' . | grep -v node_modules | grep -v '.next' | wc -l

Target: 0. All should be min-h-dvh / h-dvh.

## 5. Check for Container Queries

    grep -rn '@container' --include='*.css' . | grep -v node_modules

Target: at least 1. Components with responsive layout switches need container queries, not just viewport media queries.

## 6. Verify dvh Support

dvh is supported in Safari 15.4+, Chrome 108+, Firefox 94+. If you need older browser support, use:

    min-height: 100vh;
    min-height: 100dvh;

The dvh line overrides vh in modern browsers. Old browsers fall back to vh.

## 7. Verify Fluid Typography

    grep -rn 'text-\[clamp(' --include='*.tsx' . | grep -v node_modules

Hero headlines and section titles should use clamp() for fluid sizing:
- Hero: `text-[clamp(2rem,5vw,4.5rem)]`
- Sub-headline: `text-[clamp(1rem,1.2vw,1.5rem)]`

## 8. Touch Targets

    grep -rn 'min-w-\[44px\]\|min-h-\[44px\]' --include='*.tsx' . | grep -v node_modules | wc -l

All interactive elements must be at least 44px (WCAG 2.5.8).

## Verification Commands (run after fixes)

    # Zero hardcoded screen heights
    grep -rn 'min-h-screen\|h-screen' --include='*.tsx' . | grep -v node_modules | grep -v '.next' | wc -l  # should be 0
    
    # Zero max-width breakpoints in CSS
    grep -c 'max-width' app/globals.css  # should count only content-width max-widths, not @media max-width
    
    # Clamp usage exists
    grep -rn 'clamp(' --include='*.tsx' --include='*.css' . | grep -v node_modules | grep -v '.next' | wc -l  # should be > 0
    
    # dvh usage exists  
    grep -rn 'dvh\|min-h-dvh\|h-dvh' --include='*.tsx' --include='*.css' . | grep -v node_modules | grep -v '.next' | wc -l  # should be > 0
    
    # Container queries exist
    grep -rn '@container' --include='*.css' . | grep -v node_modules | wc -l  # should be > 0

## Inverted Height Detection

If mobile gets MORE height than desktop, that is a bug. Pattern to search for:

    # Lines where smaller sizes follow larger sizes (inverted)
    grep -rn 'min-h-\[7.*px\].*md:min-h-\[6.*px\]' --include='*.tsx' . | grep -v node_modules

This catches the pattern where mobile = 700px and desktop = 650px — backwards. Fix with a single clamp() where dvh naturally scales correctly.

## Commit Message Convention

    refactor: migrate N min-h-screen/h-screen instances to min-h-dvh/h-dvh across N files
    fix: [component] responsive parity — fluid clamp() sizing, eliminate hardcoded dimensions
    refactor: convert globals.css to mobile-first, add container query and fluid sizing utilities
