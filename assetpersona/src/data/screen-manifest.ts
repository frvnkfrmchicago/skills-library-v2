/**
 * Screen Architecture Manifest — Asset Persona
 *
 * Every real route in the app. Each entry = one distinct screen.
 * Subviews, tabs, modals, and components listed as states WITHIN their parent screen.
 * Derived from: App.tsx routes + component inspection.
 */

export interface FlowLink {
  target: string;
  action: string;
}

export interface ScreenNode {
  path: string;
  label: string;
  group: string;
  kind: 'page' | 'overlay' | 'tab-bar';
  hasLoading: boolean;
  hasError: boolean;
  isDynamic: boolean;
  previewPath?: string;
  states: string[];
  flowLinks: FlowLink[];
  description: string;
  systemDetails?: string;
  apis?: string[];
}

export interface ScreenGroup {
  id: string;
  label: string;
  color: string;
  icon: string;
  flowOrder: number;
  screens: ScreenNode[];
}

// ════════════════════════════════════════════════════════
//  EVERY REAL ROUTE IN THE APP (33 screens)
// ════════════════════════════════════════════════════════
export const SCREEN_MANIFEST: ScreenNode[] = [
  {
    path: '/community/learn/:slug?game=match',
    label: 'Terminology Match Game',
    group: 'community',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: true,
    previewPath: '/community/learn/ai-literacy-2026?game=match',
    states: [
      'Shuffled card grid: Term blocks + Definition blocks',
      'Selection state: selected card highlights with Brand Sky Blue border',
      'Error state: incorrect matches trigger rapid wiggle wiggles (.anim-shake)',
      'Success state: correctly matched cards spark emerald green bubbles (.anim-fade-match) and vanish',
      'Celebration confetti overlay on completion',
    ],
    flowLinks: [
      { target: '/community/learn/:slug', action: 'Complete matching game' }
    ],
    description: 'A tactile, engaging terminology matchmaking game screen within modules',
  },
  {
    path: '/admin/modules/edit/:slug#game',
    label: 'Matching Pairs Admin Editor',
    group: 'admin',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: true,
    previewPath: '/admin/modules/edit/ai-literacy-2026#game',
    states: [
      'Conditional editor: displayed only when module Type is Terminology Match Game',
      'Dynamic term + definition forms rows',
      'Trash icons to delete matching pairs',
      'Auto-generating dynamic learning schemas',
    ],
    flowLinks: [
      { target: '/admin/modules', action: 'Save Matching Pairs' }
    ],
    description: 'Administrative pairs-builder form mapping database schemas on-the-fly',
  },
  {
    path: '/community/portfolio#analytics',
    label: 'Portfolio Click Tracker',
    group: 'community',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Real-time clicks counter summing total project link interactions',
      'Active click badge on individual portfolio grid cards',
      'Dopating feedback loop tracking employer interest stats',
    ],
    flowLinks: [
      { target: '/community/portfolio', action: 'Configure project pins' }
    ],
    description: 'Live statistics panel and analytics summary tracking profile clicks',
  },
  // ─── MARKETING ───
  {
    path: '/',
    label: 'Landing Page',
    group: 'marketing',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Navbar with scroll-aware transparency',
      'ChapterNav floating sidebar navigation',
      'Hero section: headline, subtext, Join Free CTA, Browse Products CTA',
      'SceneSection mood-aware background images',
      'KineticHeadline animated text',
      'Paths grid: Creatives / Businesses / Curious cards with liquid-glass effect',
      'Project collage: 3 staggered portfolio images',
      'SchoolPreview: Agentic Study Hall curriculum tracks with Join Free + Explore CTA',
      'ShopPreview: featured digital products carousel',
      'ProjectsGrid: portfolio showcase cards',
      'BlogFeature: latest blog posts with category pills',
      'InquiryForm: contact/intake form',
      'Footer: brand, nav links, social, legal',
    ],
    flowLinks: [
      { target: '/community/classroom', action: 'Join Free CTA via inline auth' },
      { target: '/shop', action: 'Browse Products CTA' },
      { target: '/agenticstudyhall', action: 'Explore Curriculum link' },
      { target: '/business', action: 'Work with me card' },
      { target: '/resources', action: 'Browse resources card' },
      { target: '/blog', action: 'Blog section link' },
    ],
    description: 'Full marketing landing page with hero, learning paths, curriculum preview, products, portfolio, blog, and inquiry form',
    systemDetails: 'The landing page is built as LandingV2 which orchestrates SceneSection wrappers around each content block. Each SceneSection applies a mood (mix/blue) and optional background image via CSS blend modes. ChapterNav tracks scroll progress via useWindowScrollProgress hook and highlights the active section. KineticHeadline uses CSS animations for character-level reveal. The page is fully static — no API calls. Navigation uses React Router Link components.',
  },
  {
    path: '/about',
    label: 'About',
    group: 'marketing',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Hero: full-bleed brain image with overlay gradient',
      'Framer Motion stagger reveal animations',
      'Mission & Purpose: 2-card grid (mission + vision)',
      'Infographic stat images (90% orgs, 97% leaders)',
      'Services grid: 4 cards (AI Literacy, Digital Marketing, Vibe Coding, Consulting)',
      'Tool stack logos (ChatGPT, Gemini, Claude, Canva, Adobe, etc.)',
      'Leadership section: Frank Lawrence Jr. headshot + bio + LinkedIn link',
    ],
    flowLinks: [],
    description: 'Team, mission, services, toolset, and leadership bio with animated sections',
    systemDetails: 'Built with Framer Motion for scroll-triggered animations via whileInView with stagger variants. Images are served from /images/about/ in the public directory. SEO meta tags rendered via SEOHead component. No API dependencies — fully static content.',
  },
  {
    path: '/blog',
    label: 'Blog Index',
    group: 'marketing',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Featured post hero card',
      'Blog post grid: cover image, title, excerpt, date, read time',
      'Category filter pills',
      'Hover scale animation on cards',
    ],
    flowLinks: [
      { target: '/blog/:slug', action: 'Click blog post card' },
    ],
    description: 'Blog listing page with featured post, category filters, and post cards',
    systemDetails: 'Blog content is authored in TypeScript data files (src/content/blog/*.ts) and rendered client-side. No CMS or API — all content is bundled at build time. Blog posts support SEO keywords, cover images, and markdown content.',
  },
  {
    path: '/blog/:slug',
    label: 'Blog Post',
    group: 'marketing',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: true,
    previewPath: '/blog/ai-literacy-2026',
    states: [
      'Cover image hero',
      'Article title + date + read time + author',
      'Markdown-rendered body content via react-markdown',
      'Module embed component for inline Study Hall references',
      'JSON-LD structured data for SEO',
      'Back to blog link',
    ],
    flowLinks: [
      { target: '/blog', action: '← Back to Blog' },
      { target: '/agenticstudyhall', action: 'Module embed CTA' },
    ],
    description: 'Individual blog article with markdown rendering, SEO structured data, and module embeds',
    systemDetails: 'Blog posts are resolved by slug from the content data files. react-markdown renders the body with custom components (ModuleEmbed). JSON-LD schema.org Article structured data is injected for SEO — includes publisher (Asset Persona), datePublished, and keywords.',
  },
  {
    path: '/shop',
    label: 'Shop',
    group: 'marketing',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Product grid: cover image, title, price, description',
      'Free / Paid badges',
      'CTA buttons per product',
      'Category organization',
    ],
    flowLinks: [],
    description: 'Digital products marketplace — workbooks, templates, starter kits, and bundles',
    systemDetails: 'Product data is defined in src/data/shopProducts.ts. Each product has a cover image from /images/products/, a price (or "Free"), and external purchase links. No cart/checkout — links to external payment provider.',
  },
  {
    path: '/agenticstudyhall',
    label: 'Agentic Study Hall',
    group: 'marketing',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Tier cards: Asset Class (free), Cohort ($29), Insiders ($59), Private ($299)',
      'Feature comparison per tier',
      'Curriculum track cards: Explorer, Builder, Architect',
      'Module preview list with track assignments',
      'Join Free CTA prominent',
    ],
    flowLinks: [
      { target: '/community/classroom', action: 'Join Free CTA via inline auth' },
      { target: '/community/classroom', action: 'Go to Classroom (if authenticated)' },
    ],
    description: 'Agentic Study Hall landing — subscription tiers, curriculum tracks, and module previews',
    systemDetails: 'Tier data comes from src/data/studyhallTiers.ts which defines 4 tiers with pricing, features, and taglines. Curriculum tracks (Explorer, Builder, Architect) are defined inline. This is the marketing page — the actual classroom is at /community/classroom.',
  },
  {
    path: '/live',
    label: 'Talk Through Tech Live',
    group: 'marketing',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Show schedule: 3x/week at 7 PM Central',
      'Segment breakdown table (time + segment + description)',
      'YouTube + LinkedIn live stream embeds/links',
      'Giveaway items list with descriptions',
      'Episode archive link',
    ],
    flowLinks: [
      { target: '/recordings', action: 'Watch past episodes' },
    ],
    description: 'Live workshop schedule — Talk Through Tech show with segment breakdown and giveaways',
    systemDetails: 'Show data (segments, giveaways, schedule) comes from src/data/liveData.ts. No live API integration — schedule is static. External links to YouTube and LinkedIn for actual live streams.',
  },
  {
    path: '/recordings',
    label: 'Recordings',
    group: 'marketing',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Episode grid with thumbnails',
      'Episode title + date',
      'External video links',
    ],
    flowLinks: [
      { target: '/live', action: 'See live schedule' },
    ],
    description: 'Past Talk Through Tech episode recordings',
  },
  {
    path: '/resources',
    label: 'Free Resources',
    group: 'marketing',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Resource cards: AI guides, prompt templates, tool comparisons',
      'Category organization',
      'Download/access CTAs',
    ],
    flowLinks: [
      { target: '/agenticstudyhall', action: 'Upgrade to Study Hall' },
    ],
    description: 'Free AI learning resources — guides, templates, and tool comparisons',
  },
  {
    path: '/business',
    label: 'Business Consulting',
    group: 'marketing',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Service tiers: Audit, Build, Retainer',
      'Pricing and deliverables per tier',
      'Case study references',
      'Discovery call booking CTA',
      'Framer Motion scroll animations',
    ],
    flowLinks: [
      { target: '/contact', action: 'Book a Discovery Call' },
      { target: '/start', action: 'Start intake flow' },
    ],
    description: 'B2B AI consulting page — audit, build, retainer tiers with booking CTAs',
  },
  {
    path: '/contact',
    label: 'Contact',
    group: 'marketing',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Contact form: name, email, message, submit',
      'Social media links',
      'Office/availability info',
    ],
    flowLinks: [],
    description: 'Contact form and social links',
  },
  {
    path: '/start',
    label: 'Intake Flow',
    group: 'marketing',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Multi-step intake wizard',
      'Step indicators/progress bar',
      'Business info collection',
      'Service selection',
      'Summary + submit',
    ],
    flowLinks: [],
    description: 'Multi-step business intake wizard for consulting prospects',
  },

  // ─── AUTH ───
  {
    path: '/login',
    label: 'Login / Signup',
    group: 'auth',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Login mode: email + password form',
      'Signup mode: email + password form with lightweight profile capture',
      'Toggle between login/signup',
      'URL param: ?mode=signup auto-selects signup tab',
      'High-intent routes now prefer inline auth modal before falling back here',
      'Error message display',
      'Demo mode bypass (admin@assetpersona.com)',
      'Redirect to /community on success',
    ],
    flowLinks: [
      { target: '/community', action: 'Successful login → Community' },
    ],
    description: 'Authentication page with login/signup toggle, demo mode, and URL-param deep linking',
    systemDetails: 'Auth is managed by AuthContext with Supabase as the live backend contract plus demo and dev bypass support for local work. The dedicated /login route remains available, but high-intent surfaces now prefer inline auth via AuthModal so activation preserves context. AdminGuard checks for admin@assetpersona.com for admin access.',
  },

  // ─── COMMUNITY ───
  {
    path: '/community',
    label: 'Community Feed',
    group: 'community',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'CommunityLayout sidebar: Agentic Study Hall brand, nav links, user info, gear icon, sign out',
      'Post creation form: content input + submit',
      'Post feed: author avatar + name + timestamp + content',
      'Like button with counter',
      'Comment thread per post',
      'Empty state for no posts',
    ],
    flowLinks: [
      { target: '/community/classroom', action: 'Sidebar: Classroom link' },
      { target: '/community/calendar', action: 'Sidebar: Calendar link' },
      { target: '/community/members', action: 'Sidebar: Members link' },
      { target: '/community/leaderboard', action: 'Sidebar: Leaderboard link' },
      { target: '/community/user-settings', action: 'Gear icon → User Settings' },
    ],
    description: 'Community feed with posts, comments, likes, and sidebar navigation',
    systemDetails: 'CommunityLayout provides the persistent sidebar shell for all /community/* routes. The sidebar shows Agentic Study Hall branding, navigation links (Feed, Classroom, Calendar, Members, Leaderboard), and user profile info with a settings gear link. AuthGuard wraps the entire community ensuring login is required. Data is currently localStorage-backed with a clear Supabase migration path.',
  },
  {
    path: '/community/classroom',
    label: 'Classroom',
    group: 'community',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Course track cards: Explorer, Builder, Architect',
      'Module list per track with lesson count',
      'Progress badges per module',
      'Track filtering',
    ],
    flowLinks: [
      { target: '/community/classroom/:courseId', action: 'Click course → Course Detail' },
    ],
    description: 'Agentic Study Hall classroom — course tracks and module grid',
    systemDetails: 'Renders module data from the admin-managed course system (CourseManager). Modules are organized into 3 tracks (Explorer, Builder, Architect). Currently backed by localStorage CRUD from the admin panel.',
  },
  {
    path: '/community/classroom/:courseId',
    label: 'Course Detail',
    group: 'community',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: true,
    states: [
      'Course header: title, description, track badge',
      'Lesson list with completion checkmarks',
      'Lesson content area: markdown-rendered content',
      'Next/Previous lesson navigation',
      'Progress tracking',
    ],
    flowLinks: [
      { target: '/community/classroom', action: '← Back to Classroom' },
    ],
    description: 'Individual course with lesson content, progress tracking, and sequential navigation',
  },
  {
    path: '/community/calendar',
    label: 'Calendar',
    group: 'community',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Monthly calendar grid',
      'Event dots on dates',
      'Selected date detail panel',
      'Event types: workshop, office hours, community call',
    ],
    flowLinks: [],
    description: 'Community event calendar with monthly view and event details',
  },
  {
    path: '/community/members',
    label: 'Members Directory',
    group: 'community',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Member cards: avatar, name, level, join date',
      'Search/filter members',
      'Grid/list view toggle',
      'Click to view profile',
    ],
    flowLinks: [
      { target: '/community/profile/:memberId', action: 'Click member → Profile' },
    ],
    description: 'Community member directory with search and profile links',
  },
  {
    path: '/community/leaderboard',
    label: 'Leaderboard',
    group: 'community',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Ranked member list by XP/level',
      'Top 3 highlight with medals',
      'Your rank indicator',
      'XP breakdown tooltip',
    ],
    flowLinks: [
      { target: '/community/profile/:memberId', action: 'Click member → Profile' },
    ],
    description: 'Community leaderboard ranked by XP with top 3 highlight',
  },
  {
    path: '/community/profile/:memberId',
    label: 'Member Profile',
    group: 'community',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: true,
    states: [
      'Profile header: avatar, display name, level, join date',
      'Activity feed: recent posts and comments',
      'Badges/achievements section',
      'Course progress summary',
    ],
    flowLinks: [
      { target: '/community/members', action: '← Back to Members' },
    ],
    description: 'Individual member profile with activity feed and achievements',
  },
  {
    path: '/community/user-settings',
    label: 'User Settings',
    group: 'community',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      '4-tab sidebar: Profile, Account, Notifications, Subscription',
      'Profile tab: avatar upload, display name, bio edit, save button',
      'Account tab: email (disabled), password change form',
      'Notifications tab: toggle rows for 5 notification types with slider switches',
      'Subscription tab: current plan card, tier upgrade cards with pricing',
    ],
    flowLinks: [],
    description: 'Member-facing settings — profile, account security, notification preferences, and subscription management',
    systemDetails: 'User settings page with 4 tabs. Profile tab allows avatar change, display name edit, and bio update. Account tab shows email (disabled, contact support to change) and password update form. Notifications tab has iOS-style toggle switches for community posts, courses, newsletter, products, and live reminders. Subscription tab renders current tier from studyhallTiers.ts and shows upgrade options. All changes persist to localStorage (Supabase migration pending).',
  },
  {
    path: '/community/settings',
    label: 'Admin Settings',
    group: 'community',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'AdminGuard: requires admin role',
      'General: community name + description edit',
      'Membership: tier pricing configuration',
      'Feature toggles: calendar, leaderboard, chat',
      'Content moderation settings',
      'Save button per section',
    ],
    flowLinks: [],
    description: 'Admin-only community configuration — name, pricing, features, moderation',
    systemDetails: 'Wrapped in AdminGuard which checks for admin@assetpersona.com. Default values populated from current config. Settings save to localStorage (Supabase migration pending).',
  },

  // ─── ADMIN ───
  {
    path: '/admin',
    label: 'Admin Dashboard',
    group: 'admin',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'AdminLayout sidebar: Dashboard, Blog, Members, Courses, Products, Analytics links',
      'KPI cards: total members, revenue, active courses, blog posts',
      'Recent activity feed',
      'Quick action buttons',
    ],
    flowLinks: [
      { target: '/admin/blog', action: 'Sidebar: Blog Manager' },
      { target: '/admin/members', action: 'Sidebar: Member CRM' },
      { target: '/admin/courses', action: 'Sidebar: Course Manager' },
      { target: '/admin/products', action: 'Sidebar: Product Manager' },
      { target: '/admin/analytics', action: 'Sidebar: Analytics' },
    ],
    description: 'Admin command center with KPIs, activity feed, and quick actions',
    systemDetails: 'AdminLayout provides the persistent sidebar for all /admin/* routes. Wrapped in AdminGuard. KPI data aggregated from localStorage stores (members, courses, products, blog posts). Designed as a migration-ready abstraction layer — swap localStorage reads for Supabase queries.',
  },
  {
    path: '/admin/blog',
    label: 'Blog Manager',
    group: 'admin',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Blog post list with title, date, status (draft/published)',
      'New post button',
      'Edit/delete actions per post',
      'Search and filter',
    ],
    flowLinks: [
      { target: '/admin/blog/new', action: 'New Post button' },
      { target: '/admin/blog/edit/:slug', action: 'Edit post' },
    ],
    description: 'Blog management dashboard with CRUD operations',
  },
  {
    path: '/admin/blog/new',
    label: 'Blog Editor',
    group: 'admin',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Title input',
      'Slug auto-generator',
      'MarkdownEditor: split-pane with raw markdown + live preview',
      'Cover image uploader',
      'SEO fields: meta title, description, keywords',
      'Category selector',
      'Publish/Draft toggle',
      'Save button',
    ],
    flowLinks: [
      { target: '/admin/blog', action: '← Back to Blog Manager' },
    ],
    description: 'Full blog post editor with markdown, live preview, SEO fields, and cover image',
    systemDetails: 'MarkdownEditor component uses a split-pane layout — raw markdown input on the left, live-rendered preview on the right using react-markdown. Posts save to localStorage as BlogPost objects. Slug is auto-generated from the title.',
  },
  {
    path: '/admin/members',
    label: 'Member CRM',
    group: 'admin',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Member table: name, email, tier, join date, status',
      'Search and filter by tier',
      'Bulk actions',
      'Export capability',
      'Empty state with add member CTA',
    ],
    flowLinks: [],
    description: 'Member management CRM with table view, search, and tier filtering',
  },
  {
    path: '/admin/courses',
    label: 'Course Manager',
    group: 'admin',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Module list with track assignment',
      'Add/edit module form',
      'Lesson management per module',
      'Reorder modules via drag',
      'Publish/unpublish toggle',
    ],
    flowLinks: [],
    description: 'Agentic Study Hall curriculum management — modules, lessons, and track assignments',
  },
  {
    path: '/admin/products',
    label: 'Product Manager',
    group: 'admin',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Product list with cover image, title, price',
      'Add/edit product form',
      'Availability toggle',
      'Price editing',
    ],
    flowLinks: [],
    description: 'Digital product management — add, edit, price, and toggle availability',
  },
  {
    path: '/admin/analytics',
    label: 'Analytics',
    group: 'admin',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: [
      'Revenue chart placeholder',
      'Member growth chart placeholder',
      'Top content table',
      'Conversion funnel metrics',
      'Empty state with setup instructions',
    ],
    flowLinks: [],
    description: 'Platform analytics — revenue, growth, content performance, and conversion',
    systemDetails: 'Currently shows placeholder/empty states. Designed for future integration with Supabase analytics queries. Charts will use a charting library (Recharts or similar) once data layer is connected.',
  },

  // ─── LEGAL ───
  {
    path: '/privacy',
    label: 'Privacy Policy',
    group: 'legal',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: ['Privacy policy content', 'Last updated date'],
    flowLinks: [],
    description: 'Privacy policy page',
  },
  {
    path: '/terms',
    label: 'Terms of Service',
    group: 'legal',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: ['Terms of service content', 'Last updated date'],
    flowLinks: [],
    description: 'Terms of service page',
  },
  {
    path: '/accessibility',
    label: 'Accessibility',
    group: 'legal',
    kind: 'page',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    states: ['Accessibility statement', 'WCAG compliance notes'],
    flowLinks: [],
    description: 'Accessibility commitment and compliance information',
  },

  // ─── GLOBAL UI ───
  {
    path: '@layout/navbar',
    label: 'Navbar',
    group: 'global',
    kind: 'overlay',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    previewPath: '/',
    states: [
      'Logo: Asset Persona → home link',
      'Nav links: Agentic Study Hall, Live, Shop, Blog, About',
      'Scroll-aware background (transparent → frosted)',
      'Mobile hamburger menu toggle',
      'Mobile menu slide-down with all links',
    ],
    flowLinks: [
      { target: '/', action: 'Logo click → Home' },
      { target: '/agenticstudyhall', action: 'Agentic Study Hall link' },
      { target: '/live', action: 'Live link' },
      { target: '/shop', action: 'Shop link' },
      { target: '/blog', action: 'Blog link' },
      { target: '/about', action: 'About link' },
    ],
    description: 'Persistent top navigation with scroll-aware frosted glass effect and mobile menu',
  },
  {
    path: '@layout/footer',
    label: 'Footer',
    group: 'global',
    kind: 'overlay',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    previewPath: '/',
    states: [
      'Brand logo + tagline',
      'Navigation sections: Explore, Community, Legal',
      'Social links: YouTube, LinkedIn, Twitter/X',
      'Copyright notice',
    ],
    flowLinks: [
      { target: '/agenticstudyhall', action: 'Agentic Study Hall link' },
      { target: '/privacy', action: 'Privacy link' },
      { target: '/terms', action: 'Terms link' },
      { target: '/accessibility', action: 'Accessibility link' },
    ],
    description: 'Site-wide footer with navigation, social links, and legal pages',
  },
  {
    path: '@layout/community-sidebar',
    label: 'Community Sidebar',
    group: 'global',
    kind: 'overlay',
    hasLoading: false,
    hasError: false,
    isDynamic: false,
    previewPath: '/community',
    states: [
      'Agentic Study Hall brand avatar + name + subtitle',
      'Nav links: Feed, Classroom, Calendar, Members, Leaderboard',
      'Active link highlight',
      'Admin-only: Settings link',
      'User info: display name + level',
      'Settings gear icon → User Settings',
      'Sign out button',
    ],
    flowLinks: [
      { target: '/community', action: 'Feed link' },
      { target: '/community/classroom', action: 'Classroom link' },
      { target: '/community/calendar', action: 'Calendar link' },
      { target: '/community/members', action: 'Members link' },
      { target: '/community/leaderboard', action: 'Leaderboard link' },
      { target: '/community/user-settings', action: 'Gear icon → Settings' },
      { target: '/community/settings', action: 'Admin Settings (admin only)' },
    ],
    description: 'Community sidebar shell with brand, navigation, user profile, and admin access',
  },
];

// ─── Group definitions ──────────────────────────────────
const groupDefs: Array<{ id: string; label: string; color: string; icon: string; flowOrder: number }> = [
  { id: 'marketing', label: 'Marketing', color: '#f08d85', icon: 'megaphone', flowOrder: 1 },
  { id: 'auth', label: 'Auth', color: '#036484', icon: 'lock', flowOrder: 2 },
  { id: 'community', label: 'Community', color: '#389bc1', icon: 'users', flowOrder: 3 },
  { id: 'admin', label: 'Admin', color: '#9e3453', icon: 'shield', flowOrder: 4 },
  { id: 'legal', label: 'Legal', color: '#53111f', icon: 'scroll', flowOrder: 5 },
  { id: 'global', label: 'Global UI', color: '#ffa6aa', icon: 'layout', flowOrder: 6 },
];

export const SCREEN_GROUPS: ScreenGroup[] = groupDefs.map((g) => ({
  ...g,
  screens: SCREEN_MANIFEST.filter((s) => s.group === g.id),
}));

// ─── Stats ───────────────────────────────────────────────
export const MANIFEST_STATS = {
  totalScreens: SCREEN_MANIFEST.length,
  totalLinks: SCREEN_MANIFEST.reduce((sum, s) => sum + s.flowLinks.length, 0),
  totalStates: SCREEN_MANIFEST.reduce((sum, s) => sum + s.states.length, 0),
};

// ─── Cross-group edges ──────────────────────────────────
export function getGroupEdges(): Array<{ from: string; to: string }> {
  const edges: Array<{ from: string; to: string }> = [];
  const seen = new Set<string>();
  for (const screen of SCREEN_MANIFEST) {
    for (const link of screen.flowLinks) {
      const target = SCREEN_MANIFEST.find((s) => s.path === link.target);
      if (target && target.group !== screen.group) {
        const key = `${screen.group}->${target.group}`;
        if (!seen.has(key)) {
          seen.add(key);
          edges.push({ from: screen.group, to: target.group });
        }
      }
    }
  }
  return edges;
}

// ════════════════════════════════════════════════════════
//  IMAGE ASSETS — every image in the project
// ════════════════════════════════════════════════════════
export interface ImageAsset {
  path: string;
  label: string;
  category: string;
}

export const IMAGE_ASSETS: ImageAsset[] = [
  // ─── About ───
  { path: '/images/about/FrankSite.webp', label: 'Frank Lawrence Jr.', category: 'About' },
  { path: '/images/about/hero-brain.webp', label: 'Cybernetic Brain Hero', category: 'About' },
  { path: '/images/about/ideate-market.webp', label: 'Ideate Marketing', category: 'About' },
  { path: '/images/about/marketing-brain.webp', label: 'Marketing Brain', category: 'About' },
  { path: '/images/about/wave-face.webp', label: 'Wave Face', category: 'About' },
  { path: '/images/about/logo-blue.webp', label: 'Logo Blue', category: 'About' },
  { path: '/images/about/logo-pink.webp', label: 'Logo Pink', category: 'About' },
  // ─── Stats ───
  { path: '/images/about/stat-90-orgs.webp', label: '90% Organizations Stat', category: 'Infographics' },
  { path: '/images/about/stat-97-leaders.webp', label: '97% Leaders Stat', category: 'Infographics' },
  { path: '/images/about/stat-ai-literacy.webp', label: 'AI Literacy Stat', category: 'Infographics' },
  // ─── Tools ───
  { path: '/images/about/tool-adobe.webp', label: 'Adobe Logo', category: 'Tool Logos' },
  { path: '/images/about/tool-canva.webp', label: 'Canva Logo', category: 'Tool Logos' },
  { path: '/images/about/tool-chatgpt.webp', label: 'ChatGPT Logo', category: 'Tool Logos' },
  { path: '/images/about/tool-claude.webp', label: 'Claude Logo', category: 'Tool Logos' },
  { path: '/images/about/tool-gemini.webp', label: 'Gemini Logo', category: 'Tool Logos' },
  { path: '/images/about/tool-kling.webp', label: 'Kling Logo', category: 'Tool Logos' },
  { path: '/images/about/tool-lovable.webp', label: 'Lovable Logo', category: 'Tool Logos' },
  { path: '/images/about/tool-wix.webp', label: 'Wix Logo', category: 'Tool Logos' },
  // ─── Products ───
  { path: '/images/products/ai-literacy-workbook.webp', label: 'AI Literacy Workbook', category: 'Products' },
  { path: '/images/products/ai-marketing-playbook.webp', label: 'AI Marketing Playbook', category: 'Products' },
  { path: '/images/products/ai-tool-evaluation-worksheet.webp', label: 'AI Tool Evaluation', category: 'Products' },
  { path: '/images/products/ai-website-template-pack.webp', label: 'Website Template Pack', category: 'Products' },
  { path: '/images/products/builder-bundle.webp', label: 'Builder Bundle', category: 'Products' },
  { path: '/images/products/complete-library.webp', label: 'Complete Library', category: 'Products' },
  { path: '/images/products/i-am-digital-book.webp', label: 'I Am Digital Book', category: 'Products' },
  { path: '/images/products/prompt-engineering-worksheet.webp', label: 'Prompt Engineering', category: 'Products' },
  { path: '/images/products/starter-pack.webp', label: 'Starter Pack', category: 'Products' },
  { path: '/images/products/vibe-coding-starter-kit.webp', label: 'Vibe Coding Kit', category: 'Products' },
  { path: '/images/products/workshop-facilitation-kit.webp', label: 'Workshop Kit', category: 'Products' },
  // ─── System ───
  { path: '/favicon.svg', label: 'Favicon', category: 'System' },
  { path: '/icons.svg', label: 'Icon Sprite', category: 'System' },
];
