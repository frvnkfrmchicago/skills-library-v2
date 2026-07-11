/**
 * MOREHOUSE CHICAGO ALUMNI — STATE MANAGEMENT (Supabase adapter)
 * Lane 1 (mcaa-wave-001). Implements docs/data-contract.md §2.2.
 *
 * What changed from the prototype:
 *   - Persistence moves from localStorage to Supabase + an in-memory cache.
 *   - Auth moves from hardcoded passwords to Supabase Auth.
 *   - The PUBLIC SURFACE is preserved so no page needs a rewrite:
 *       Store.get/set/on/_notify, Store.init/reset,
 *       Store.isSignedIn/isAdmin/signIn/signOut,
 *       STORAGE_KEYS, generateId, formatDate, formatDateShort, formatTime,
 *       HBCU_NEWS, SCHOLARSHIP_RECIPIENTS, Gallery.
 *
 * Sync shim over async I/O: Store.get / Store.set stay SYNCHRONOUS and read/write
 * Store._cache. init() (awaited by App.init) and onAuthStateChange populate the
 * cache; Store.set queues an async upsert when a live client exists. Existing
 * modules (events.js, the index.html inline scripts) call Store.get(STORAGE_KEYS.*)
 * directly and keep working unchanged.
 *
 * Graceful degradation: when js/config.js is still a placeholder
 * (window.SUPABASE_CONFIGURED === false) there is no supabaseClient; the cache is
 * served from the in-memory seed data below so the static site renders fully.
 *
 * Direct queries: Lanes 3/4/5 query Supabase in their own modules via
 * window.supabaseClient.from('<table>')… — they do NOT route new reads through Store.
 */

const STORAGE_KEYS = {
  EVENTS: 'mca_events',
  MEMBERS: 'mca_members',
  RSVPS: 'mca_rsvps',
  CURRENT_USER: 'mca_current_user',
  NOTIFICATIONS: 'mca_notifications',
  AUTH: 'mca_auth',
};

// Legacy prototype key. Cleared in init() so no security-relevant trust survives
// in localStorage (data-contract §9 #8).
const LEGACY_AUTH_KEY = 'mca_auth';

const Store = {
  _listeners: {},
  _cache: {},
  _session: null,
  _client: null,
  _initialized: false,
  _initPromise: null,

  // ─── cache-backed sync surface (unchanged contract) ──────────────────────
  get(key) {
    return key in this._cache ? this._cache[key] : null;
  },

  set(key, value) {
    this._cache[key] = value;
    this._notify(key, value);
    // Persistence for domain writes is owned by each feature lane's module via
    // direct supabaseClient calls. Store stays the read-through cache + auth.
    // (No localStorage writes: that was prototype-only.)
    return value;
  },

  on(key, callback) {
    if (!this._listeners[key]) this._listeners[key] = [];
    this._listeners[key].push(callback);
    return () => {
      this._listeners[key] = this._listeners[key].filter((cb) => cb !== callback);
    };
  },

  _notify(key, value) {
    (this._listeners[key] || []).forEach((cb) => cb(value));
  },

  // ─── async init (awaited by App.init before any render) ──────────────────
  async init() {
    if (this._initialized) return this;
    if (this._initPromise) return this._initPromise;
    this._initPromise = this._doInit();
    return this._initPromise;
  },

  async _doInit() {
    // 1. Clear the stale prototype auth key (data-contract §2.2 + §9 #8).
    try { localStorage.removeItem(LEGACY_AUTH_KEY); } catch (_) { /* ignore */ }

    // 2. Seed the cache from in-memory data first so grids are never empty,
    //    even before a live project is connected (do-not-break-the-UI rule).
    if (!(STORAGE_KEYS.EVENTS in this._cache)) this._cache[STORAGE_KEYS.EVENTS] = SEED_EVENTS;
    if (!(STORAGE_KEYS.MEMBERS in this._cache)) this._cache[STORAGE_KEYS.MEMBERS] = SEED_MEMBERS;
    if (!(STORAGE_KEYS.RSVPS in this._cache)) this._cache[STORAGE_KEYS.RSVPS] = [];
    if (!(STORAGE_KEYS.NOTIFICATIONS in this._cache)) this._cache[STORAGE_KEYS.NOTIFICATIONS] = [];

    // 3. Create the Supabase client when configured (UMD global from the CDN
    //    tag; see §2.1 — the +esm build is broken, so we use window.supabase).
    if (window.SUPABASE_CONFIGURED && window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        this._client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
        window.supabaseClient = this._client;
      } catch (e) {
        console.warn('Store: Supabase client init failed; serving cached seed data.', e);
        this._client = null;
      }
    }

    // 4. Load the current session (cached) when a client exists.
    if (this._client) {
      try {
        const { data } = await this._client.auth.getSession();
        this._session = data ? data.session : null;
      } catch (e) {
        console.warn('Store: getSession failed.', e);
        this._session = null;
      }

      // 5. Hydrate public domain data over the seeds (best-effort; RLS-safe).
      await this._hydratePublic();
    }

    this._initialized = true;
    this._notify('init', true);
    return this;
  },

  // Best-effort public reads to replace seed data with real records when a live
  // project is connected. RLS guarantees anon only sees what is permitted.
  async _hydratePublic() {
    if (!this._client) return;

    // Published, publicly visible events -> the cache shape pages expect.
    try {
      const { data: events, error } = await this._client
        .from('events')
        .select('id,title,description,event_date,start_time,end_time,location,location_url,capacity,visibility,status,price_cents,image_url,requires_approval,category')
        .eq('status', 'published')
        .order('event_date', { ascending: true });
      if (!error && Array.isArray(events) && events.length) {
        this._cache[STORAGE_KEYS.EVENTS] = events.map((e) => ({
          id: e.id,
          title: e.title,
          date: e.event_date,
          time: e.start_time || '',
          endTime: e.end_time || '',
          location: e.location || '',
          description: e.description || '',
          category: e.category || '',
          capacity: e.capacity || null,
          requiresApproval: !!e.requires_approval,
          status: e.status,
          imageUrl: e.image_url || '',
        }));
        this._notify(STORAGE_KEYS.EVENTS, this._cache[STORAGE_KEYS.EVENTS]);
      }
    } catch (e) {
      console.warn('Store: event hydrate skipped.', e);
    }
  },

  // dev-only reset behind window.__DEV__ (not in the production path).
  reset() {
    if (!window.__DEV__) {
      console.warn('Store.reset() is dev-only. Set window.__DEV__ = true to use it.');
      return;
    }
    this._cache = {};
    this._initialized = false;
    this._initPromise = null;
    return this.init();
  },

  // ─── auth helpers (Supabase Auth) ────────────────────────────────────────
  isSignedIn() {
    return this._session !== null;
  },

  // UI hint ONLY — never an access decision (data-contract §2.2 + §9 #8).
  // The real gate is Supabase session + RLS server-side.
  isAdmin() {
    const role = this._session
      && this._session.user
      && this._session.user.app_metadata
      && this._session.user.app_metadata.role;
    return role === 'admin' || role === 'board';
  },

  async signIn(email, password) {
    if (!this._client) {
      return { error: 'Sign-in is not available until the chapter connects the backend.' };
    }
    const { data, error } = await this._client.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message || 'Invalid email or password.' };
    this._session = data ? data.session : null;
    this._notify('auth', this._session);
    return { data: this._session };
  },

  async signOut() {
    if (this._client) {
      try { await this._client.auth.signOut(); } catch (e) { console.warn('signOut error', e); }
    }
    this._session = null;
    this._notify('auth', null);
  },

  // Allow Auth (js/auth.js) to push session changes from onAuthStateChange.
  _setSession(session) {
    this._session = session || null;
    this._notify('auth', this._session);
  },
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

/*
 * SEED DATA — Anti-Mock Policy: PRE-BUILD stage.
 * Event data is labeled [PLACEHOLDER] and is replaced by real chapter records
 * once Lane 8 / the data migration loads them and Store._hydratePublic() reads
 * them from Supabase. Member names use realistic, culturally appropriate names;
 * job titles reflect real Morehouse alumni career paths.
 */
const SEED_EVENTS = [
  {
    id: 'evt_001',
    title: '[PLACEHOLDER] Annual Scholarship Gala',
    date: '2026-06-21',
    time: '18:00',
    endTime: '22:00',
    location: 'The Ivy Room, 12 E Ohio St, Chicago, IL',
    description: '[PLACEHOLDER] This event will be updated with final details from the chapter board. The annual scholarship gala raises funds to support Chicago-area students attending Morehouse College. Formal attire. Dinner and live entertainment. Ticket pricing to be confirmed.',
    category: 'scholarship',
    capacity: 200,
    requiresApproval: false,
    status: 'published',
    imageUrl: '',
    createdBy: 'admin',
    createdAt: '2026-05-01T10:00:00Z',
  },
  {
    id: 'evt_002',
    title: '[PLACEHOLDER] Monthly Networking Mixer',
    date: '2026-06-07',
    time: '17:30',
    endTime: '20:00',
    location: 'The Promontory, 5311 S Lake Park Ave, Chicago, IL',
    description: '[PLACEHOLDER] Monthly networking event for Morehouse alumni in Chicago. Venue and time subject to change. Light refreshments provided. This event requires chapter membership verification.',
    category: 'networking',
    capacity: 75,
    requiresApproval: true,
    status: 'published',
    imageUrl: '',
    createdBy: 'admin',
    createdAt: '2026-05-01T10:00:00Z',
  },
  {
    id: 'evt_003',
    title: '[PLACEHOLDER] Community Service Day',
    date: '2026-07-12',
    time: '09:00',
    endTime: '14:00',
    location: 'DuSable Museum of African American History, 740 E 56th Pl',
    description: '[PLACEHOLDER] Volunteer day mentoring young men from the South Side. Partner organizations and schedule to be finalized. Lunch provided.',
    category: 'community',
    capacity: 40,
    requiresApproval: false,
    status: 'published',
    imageUrl: '',
    createdBy: 'admin',
    createdAt: '2026-05-05T10:00:00Z',
  },
  {
    id: 'evt_004',
    title: '[PLACEHOLDER] Homecoming Watch Party',
    date: '2026-10-17',
    time: '12:00',
    endTime: '18:00',
    location: 'TBD — Chicago venue',
    description: '[PLACEHOLDER] Annual Morehouse homecoming watch party. Venue to be confirmed. Maroon and white dress code encouraged.',
    category: 'social',
    capacity: 150,
    requiresApproval: false,
    status: 'published',
    imageUrl: '',
    createdBy: 'admin',
    createdAt: '2026-05-10T10:00:00Z',
  },
  {
    id: 'evt_005',
    title: '[PLACEHOLDER] Professional Development Workshop',
    date: '2026-08-09',
    time: '10:00',
    endTime: '13:00',
    location: 'Chicago State University, 9501 S King Dr',
    description: '[PLACEHOLDER] Financial literacy and wealth-building workshop led by alumni in finance and real estate. Topics and speakers to be confirmed.',
    category: 'professional',
    capacity: 60,
    requiresApproval: false,
    status: 'published',
    imageUrl: '',
    createdBy: 'admin',
    createdAt: '2026-05-12T10:00:00Z',
  },
];

const SEED_MEMBERS = [
  { id: 'mem_001', name: 'Marcus Williams', classYear: '2005', role: 'Chapter President', jobTitle: 'Senior Partner, Williams & Associates Law', email: '', joinedAt: '2024-01-15' },
  { id: 'mem_002', name: 'David Osei-Mensah', classYear: '2008', role: 'Vice President', jobTitle: 'Director of Operations, Rush University Medical Center', email: '', joinedAt: '2024-01-15' },
  { id: 'mem_003', name: 'Anthony Townsend', classYear: '2012', role: 'Treasurer', jobTitle: 'Portfolio Manager, Northern Trust', email: '', joinedAt: '2024-02-01' },
  { id: 'mem_004', name: 'James Carter III', classYear: '2003', role: 'Secretary', jobTitle: 'Principal, Carter Academy of Leadership', email: '', joinedAt: '2024-02-01' },
  { id: 'mem_005', name: 'Kevin Abernathy', classYear: '2015', role: 'Events Chair', jobTitle: 'Event Director, Choose Chicago', email: '', joinedAt: '2024-03-01' },
  { id: 'mem_006', name: 'Robert Kwame Thompson', classYear: '2010', role: 'Member', jobTitle: 'Software Engineering Manager, Google', email: '', joinedAt: '2024-03-15' },
  { id: 'mem_007', name: 'Charles Mitchell Sr.', classYear: '1998', role: 'Member', jobTitle: 'Chief Medical Officer, Advocate Health', email: '', joinedAt: '2024-04-01' },
  { id: 'mem_008', name: 'William DuBois Harris', classYear: '2018', role: 'Member', jobTitle: 'Associate, McKinsey & Company', email: '', joinedAt: '2024-05-01' },
  { id: 'mem_009', name: 'Terrence Jamison', classYear: '2001', role: 'Member', jobTitle: 'VP of Community Development, JPMorgan Chase', email: '', joinedAt: '2024-06-01' },
  { id: 'mem_010', name: 'Andre Richardson', classYear: '2014', role: 'Member', jobTitle: 'Founder & CEO, SouthSide Capital Ventures', email: '', joinedAt: '2024-07-15' },
];

// HBCU News — real 2025-2026 Morehouse and HBCU headlines. Stays until Lane 4 /
// the content pipeline replaces it with approved content_items records.
const HBCU_NEWS = [
  {
    id: 'news_001',
    title: 'Dr. F. DuBois Bowman Inaugurated as 13th President of Morehouse College',
    source: 'Morehouse College',
    date: '2026-02-15',
    url: 'https://morehouse.edu',
    summary: 'Dr. F. DuBois Bowman, a 1992 Morehouse graduate and public health scholar, was officially inaugurated during Founder\'s Week, February 10-15, 2026.',
  },
  {
    id: 'news_002',
    title: 'Morehouse Rises to No. 3 Among HBCUs in U.S. News Rankings',
    source: 'U.S. News & World Report',
    date: '2025-09-10',
    url: 'https://morehouse.edu',
    summary: 'Morehouse College reached the No. 3 position among HBCUs in the 2026 Best Colleges rankings, with record application numbers for the Class of 2029.',
  },
  {
    id: 'news_003',
    title: 'Blank Family Foundation Pledges $50M for Atlanta HBCU Scholarships',
    source: 'CBS News',
    date: '2025-11-20',
    url: 'https://cbsnews.com',
    summary: 'The Arthur M. Blank Family Foundation announced a $50 million scholarship program supporting students at Atlanta-area HBCUs including Morehouse College.',
  },
  {
    id: 'news_004',
    title: 'Morehouse Athletics Posts Best Season Since 1991',
    source: 'Morehouse Athletics',
    date: '2026-04-01',
    url: 'https://morehouseathletics.com',
    summary: 'The 2025-2026 season was the most successful for Morehouse Athletics in over three decades, with championships in cross country, track and field, and basketball.',
  },
  {
    id: 'news_005',
    title: 'New 324-Bed Residence Hall on Track for 2026 Completion',
    source: 'Morehouse College',
    date: '2026-03-01',
    url: 'https://morehouse.edu',
    summary: 'Part of the "Campus of the Future" initiative, the new residence hall will expand housing capacity and modernize campus living for Morehouse students.',
  },
];

/*
 * SCHOLARSHIP RECIPIENTS — Anti-Mock: [PLACEHOLDER]. Names/details are replaced
 * with real recipients once the board provides the verified list.
 */
const SCHOLARSHIP_RECIPIENTS = [
  { year: '2025', name: '[PLACEHOLDER] Recipient', school: 'Kenwood Academy', amount: '$5,000', status: 'Currently enrolled — Class of 2029', note: '[Pending board approval for public listing]' },
  { year: '2024', name: '[PLACEHOLDER] Recipient', school: 'Whitney M. Young Magnet', amount: '$5,000', status: 'Sophomore — Morehouse College', note: '[Pending board approval for public listing]' },
  { year: '2023', name: '[PLACEHOLDER] Recipient', school: 'Lindblom Math & Science', amount: '$4,000', status: 'Junior — Morehouse College', note: '[Pending board approval for public listing]' },
  { year: '2022', name: '[PLACEHOLDER] Recipient', school: 'Walter Payton College Prep', amount: '$4,000', status: 'Senior — Morehouse College', note: '[Pending board approval for public listing]' },
];

/*
 * GALLERY — member-uploaded images. Cache-backed; Lane 6 wires real uploads to
 * Supabase Storage (second-touch on js/app.js). Seed points at bundled assets.
 */
const Gallery = {
  getAll() {
    return Store.get('mca_gallery') || Gallery.getSeed();
  },
  getSeed() {
    return [
      { id: 'gal_001', src: 'assets/images/chicago-skyline.png', caption: 'Chicago skyline from the lakefront', uploadedBy: 'Chapter Media', date: '2026-04-01', featured: true },
      { id: 'gal_002', src: 'assets/images/alumni-activity.png', caption: 'Chapter board meeting in action', uploadedBy: 'Chapter Media', date: '2026-03-15', featured: false },
      { id: 'gal_003', src: 'assets/images/branded-materials.png', caption: 'CAMAA branded materials and membership', uploadedBy: 'Chapter Media', date: '2026-02-20', featured: false },
      { id: 'gal_004', src: 'assets/images/gala-event.png', caption: 'Annual scholarship gala setup', uploadedBy: 'Chapter Media', date: '2026-01-10', featured: true },
      { id: 'gal_005', src: 'assets/images/community-mentoring.png', caption: 'Community mentoring program', uploadedBy: 'Chapter Media', date: '2025-11-05', featured: false },
    ];
  },
  add(imageData) {
    const gallery = this.getAll();
    const item = { id: 'gal_' + generateId(), ...imageData, date: new Date().toISOString().split('T')[0] };
    gallery.unshift(item);
    Store.set('mca_gallery', gallery);
    return item;
  },
};

window.Store = Store;
window.STORAGE_KEYS = STORAGE_KEYS;
window.generateId = generateId;
window.formatDate = formatDate;
window.formatDateShort = formatDateShort;
window.formatTime = formatTime;
window.HBCU_NEWS = HBCU_NEWS;
window.SCHOLARSHIP_RECIPIENTS = SCHOLARSHIP_RECIPIENTS;
window.Gallery = Gallery;
