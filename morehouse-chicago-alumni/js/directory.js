/**
 * MOREHOUSE CHICAGO ALUMNI — DIRECTORY MODULE
 * Lane 5 — mcaa-wave-001. Implements docs/data-contract.md §9 (#3 privacy,
 * #7 no innerHTML for user strings) and the §6 RLS intent for profiles.
 *
 * Privacy model (HARD GATE — §9 #3):
 *   - Unauthenticated visitors see a sign-in GATE with ZERO member PII. No names,
 *     emails, class years, employers — nothing. The peer query never runs until a
 *     session exists.
 *   - Signed-in members see only peers whose profiles.directory_visible = true.
 *     RLS enforces this server-side (a member can only select their own row plus
 *     directory_visible=true rows); the client filter is defense-in-depth, not the
 *     gate. The member always sees their own card even if their visibility is off,
 *     with a hint to turn it on.
 *
 * XSS posture (§9 #7): every value that originates from member data
 * (full_name, class_year, chapter_role_title, bio, linkedin_url) is written with
 * textContent / DOM construction — never innerHTML. Only static, developer-authored
 * markup uses innerHTML. A small set of DOM builders below enforces this.
 *
 * Data source: window.supabaseClient.from('profiles') + a join to members for the
 * chapter role title. Reads go direct to Supabase (contract §2.2 — lanes 3/4/5 do
 * not route new reads through Store). Graceful degradation: when the project is not
 * yet configured (window.supabaseClient absent), the signed-out gate is shown.
 */

const Directory = {
  _state: {
    query: '',
    classYear: 'all',
    peers: [],      // directory_visible=true profiles (signed-in only)
    me: null,       // the current member's own profile row
    loaded: false,
    error: null,
  },

  async init() {
    const container = document.getElementById('directory-container');
    if (!container) return;

    // GATE: no session -> render the sign-in gate and STOP. No PII query runs.
    if (!this._isSignedIn()) {
      this._renderSignInGate(container);
      return;
    }

    // Signed in: show a loading state, then fetch peers + own profile.
    this._renderLoading(container);
    await this._load();
    this.render();
  },

  _isSignedIn() {
    return !!(window.Store && window.Store.isSignedIn());
  },

  _currentProfileId() {
    return (window.Store && window.Store._session && window.Store._session.user
      && window.Store._session.user.id) || null;
  },

  /* ── data ─────────────────────────────────────────────────────────────── */

  async _load() {
    const s = this._state;
    s.error = null;

    if (!window.supabaseClient) {
      // Configured-but-offline fallback: nothing to show, no crash.
      s.peers = [];
      s.me = null;
      s.loaded = true;
      return;
    }

    const myId = this._currentProfileId();

    // Peers: RLS returns own row + directory_visible=true rows. We request the
    // members relation for chapter_role_title (1:1 via members.profile_id).
    try {
      const { data, error } = await window.supabaseClient
        .from('profiles')
        .select('id, full_name, class_year, bio, linkedin_url, directory_visible, members(chapter_role_title)')
        .order('full_name', { ascending: true });

      if (error) {
        s.error = error.message;
        s.peers = [];
        s.me = null;
        s.loaded = true;
        return;
      }

      const rows = Array.isArray(data) ? data : [];
      // Split out my own row; defense-in-depth filter on directory_visible for peers.
      s.me = rows.find((r) => r.id === myId) || null;
      s.peers = rows.filter((r) => r.id !== myId && r.directory_visible === true);
      s.loaded = true;
    } catch (e) {
      s.error = (e && e.message) || 'Could not load the directory.';
      s.peers = [];
      s.me = null;
      s.loaded = true;
    }
  },

  _visiblePeers() {
    const s = this._state;
    let list = s.peers.slice();

    if (s.query) {
      const q = s.query.toLowerCase();
      list = list.filter((m) => {
        const name = (m.full_name || '').toLowerCase();
        const year = m.class_year != null ? String(m.class_year) : '';
        const role = (m.members && m.members.chapter_role_title || '').toLowerCase();
        return name.includes(q) || year.includes(q) || role.includes(q);
      });
    }

    if (s.classYear !== 'all') {
      list = list.filter((m) => String(m.class_year) === s.classYear);
    }
    return list;
  },

  _classYears() {
    const years = new Set();
    this._state.peers.forEach((m) => {
      if (m.class_year != null) years.add(String(m.class_year));
    });
    // Most recent first.
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  },

  /* ── DOM builders (no innerHTML for member data — §9 #7) ───────────────── */

  // Build a member card entirely with textContent so any value is inert.
  _memberCard(m, opts) {
    opts = opts || {};
    const card = document.createElement('div');
    card.className = 'member-card stagger-item';

    const avatar = document.createElement('div');
    avatar.className = 'member-card__avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = this._initials(m.full_name);
    card.appendChild(avatar);

    const info = document.createElement('div');
    info.className = 'member-card__info';

    const name = document.createElement('div');
    name.className = 'member-card__name';
    name.textContent = m.full_name || 'Member';
    info.appendChild(name);

    const detail = document.createElement('div');
    detail.className = 'member-card__detail';
    const roleTitle = m.members && m.members.chapter_role_title;
    const parts = [];
    if (m.class_year != null) parts.push('Class of ' + m.class_year);
    if (roleTitle) parts.push(roleTitle);
    detail.textContent = parts.join('  ·  ');
    info.appendChild(detail);

    if (m.bio) {
      const bio = document.createElement('div');
      bio.className = 'member-card__detail';
      bio.style.color = 'var(--color-text-secondary)';
      bio.style.marginTop = '2px';
      bio.textContent = m.bio;
      info.appendChild(bio);
    }

    // LinkedIn: only render as a link when it is a valid http(s) URL. The href is
    // assigned via the property (not interpolated into markup); javascript: and
    // other schemes are rejected so a malicious profile value can't run.
    const safeLinked = this._safeHttpUrl(m.linkedin_url);
    if (safeLinked) {
      const a = document.createElement('a');
      a.href = safeLinked;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'member-card__detail';
      a.style.color = 'var(--color-secondary)';
      a.style.marginTop = 'var(--space-xs)';
      a.style.display = 'inline-block';
      a.textContent = 'LinkedIn profile';
      info.appendChild(a);
    }

    if (opts.isSelf) {
      const badge = document.createElement('span');
      badge.className = 'status-badge status-badge--approved';
      badge.style.marginTop = 'var(--space-sm)';
      badge.style.display = 'inline-block';
      badge.textContent = 'You';
      info.appendChild(badge);
    }

    card.appendChild(info);
    return card;
  },

  _initials(name) {
    if (!name) return '—';
    return name.trim().split(/\s+/).map((n) => n[0] || '').join('').slice(0, 3).toUpperCase();
  },

  // Accept only absolute http/https URLs. Returns the URL string or null.
  _safeHttpUrl(value) {
    if (!value || typeof value !== 'string') return null;
    try {
      const u = new URL(value.trim());
      return (u.protocol === 'http:' || u.protocol === 'https:') ? u.href : null;
    } catch (_) {
      return null;
    }
  },

  /* ── renders ──────────────────────────────────────────────────────────── */

  // Signed-out gate. ZERO member PII. Static developer markup only (§9 #3).
  // Links point to signin.html (dedicated sign-in page, Lane F) and membership.html.
  _renderSignInGate(container) {
    // Build entirely with DOM — no innerHTML for user data; this block is static
    // developer markup so innerHTML is safe per the contract, but we use DOM
    // construction throughout for consistency.
    const wrap = document.createElement('div');
    wrap.className = 'empty-state';
    wrap.style.cssText = 'max-width:520px;margin:0 auto;text-align:center';

    const title = document.createElement('h2');
    title.className = 'empty-state__title';
    title.textContent = 'Members only';
    wrap.appendChild(title);

    const text = document.createElement('p');
    text.className = 'empty-state__text';
    text.textContent = 'The alumni directory is private to chapter members. Sign in to connect with brothers across Chicago who have chosen to appear in the directory.';
    wrap.appendChild(text);

    const actions = document.createElement('div');
    actions.style.cssText = 'margin-top:var(--space-xl);display:flex;gap:var(--space-md);justify-content:center;flex-wrap:wrap';

    const signInBtn = document.createElement('a');
    signInBtn.href = 'signin.html?next=' + encodeURIComponent('directory.html');
    signInBtn.className = 'btn btn--gold btn--lg';
    signInBtn.textContent = 'Sign In';
    actions.appendChild(signInBtn);

    const joinBtn = document.createElement('a');
    joinBtn.href = 'membership.html';
    joinBtn.className = 'btn btn--secondary btn--lg';
    joinBtn.textContent = 'Become a Member';
    actions.appendChild(joinBtn);
    wrap.appendChild(actions);

    const note = document.createElement('p');
    note.style.cssText = 'margin-top:var(--space-lg);font-size:var(--text-xs);color:var(--color-text-tertiary)';
    note.textContent = 'Your information is never shown publicly. Listings are opt-in.';
    wrap.appendChild(note);

    while (container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(wrap);
  },

  _renderLoading(container) {
    // Skeleton grid (developer markup; no data).
    const cards = Array.from({ length: 6 }).map(() => `
      <div class="member-card" aria-hidden="true" style="opacity:.6">
        <div class="member-card__avatar" style="background:var(--surface-raised)"></div>
        <div class="member-card__info" style="width:100%">
          <div style="height:14px;width:60%;background:var(--surface-raised);border-radius:var(--radius-sm)"></div>
          <div style="height:11px;width:40%;background:var(--surface-raised);border-radius:var(--radius-sm);margin-top:var(--space-sm)"></div>
        </div>
      </div>
    `).join('');
    container.innerHTML = `
      <p role="status" aria-live="polite" style="font-size:var(--text-sm);color:var(--color-text-tertiary);margin-bottom:var(--space-lg)">Loading the directory&hellip;</p>
      <div class="directory-grid">${cards}</div>
    `;
  },

  render() {
    const container = document.getElementById('directory-container');
    if (!container) return;

    const s = this._state;
    const peers = this._visiblePeers();
    const years = this._classYears();

    // Shell: search + class-year filter (static, developer-authored markup).
    // value="" is hardcoded empty; we restore the live query via .value after.
    container.innerHTML = `
      <div class="directory-header">
        <div class="directory-search">
          <label for="dir-search" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap">Search members</label>
          <input class="directory-search__input" type="search" id="dir-search"
            placeholder="Search by name, class year, or role&hellip;" autocomplete="off">
        </div>
        <div class="directory-filters" role="group" aria-label="Filter by class year">
          ${['all'].concat(years).map((y) => `
            <button class="btn btn--sm ${s.classYear === y ? 'btn--gold' : 'btn--ghost'}"
              data-year="${y === 'all' ? 'all' : this._attr(y)}"
              aria-pressed="${s.classYear === y ? 'true' : 'false'}">
              ${y === 'all' ? 'All years' : 'Class of ' + this._attr(y)}
            </button>
          `).join('')}
        </div>
      </div>
      <div id="dir-results"></div>
    `;

    const search = document.getElementById('dir-search');
    if (search) search.value = s.query;

    const results = document.getElementById('dir-results');

    // Error state.
    if (s.error) {
      results.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon" aria-hidden="true" style="font-size:var(--text-3xl);color:var(--color-error)">&#9888;</div>
          <h3 class="empty-state__title">Could not load the directory</h3>
          <p class="empty-state__text">Please refresh the page. If it keeps happening, contact the chapter.</p>
        </div>
      `;
      this._bind(container);
      return;
    }

    // Always show the member their own card first (with a visibility hint).
    const grid = document.createElement('div');
    grid.className = 'directory-grid';

    if (s.me) {
      grid.appendChild(this._memberCard(s.me, { isSelf: true }));
      if (s.me.directory_visible === false) {
        const hint = document.createElement('div');
        hint.className = 'member-card';
        hint.style.alignItems = 'center';
        hint.style.background = 'var(--color-warning-subtle)';
        hint.style.border = '1px solid var(--color-warning)';
        const t = document.createElement('div');
        t.className = 'member-card__info';
        const h = document.createElement('div');
        h.className = 'member-card__name';
        h.textContent = 'You are hidden from peers';
        const p = document.createElement('div');
        p.className = 'member-card__detail';
        p.textContent = 'Other members cannot see your listing. Turn on directory visibility in your profile to appear here.';
        const profileLink = document.createElement('a');
        profileLink.href = 'profile.html';
        profileLink.style.cssText = 'margin-left:var(--space-xs);color:var(--color-secondary)';
        profileLink.textContent = 'Update profile';
        p.appendChild(document.createTextNode(' '));
        p.appendChild(profileLink);
        t.appendChild(h); t.appendChild(p);
        hint.appendChild(t);
        grid.appendChild(hint);
      }
    }

    if (peers.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = (s.query || s.classYear !== 'all')
        ? `<div class="empty-state__icon" aria-hidden="true" style="font-size:var(--text-3xl);color:var(--color-text-tertiary)">&mdash;</div>
           <h3 class="empty-state__title">No members match</h3>
           <p class="empty-state__text">Try a different name, class year, or clear the filter.</p>`
        : `<div class="empty-state__icon" aria-hidden="true" style="font-size:var(--text-3xl);color:var(--color-text-tertiary)">&mdash;</div>
           <h3 class="empty-state__title">No public listings yet</h3>
           <p class="empty-state__text">Members appear here once they opt in to the directory. Be the first &mdash; enable directory visibility in your dashboard.</p>`;
      results.appendChild(grid);
      results.appendChild(empty);
    } else {
      peers.forEach((m) => grid.appendChild(this._memberCard(m, {})));
      // Result count for screen readers.
      const count = document.createElement('p');
      count.setAttribute('role', 'status');
      count.setAttribute('aria-live', 'polite');
      count.style.fontSize = 'var(--text-sm)';
      count.style.color = 'var(--color-text-tertiary)';
      count.style.marginBottom = 'var(--space-lg)';
      count.textContent = peers.length + (peers.length === 1 ? ' member' : ' members') + ' in the directory';
      results.appendChild(count);
      results.appendChild(grid);
    }

    // Cross-links for signed-in members (dashboard / edit profile).
    const crossLinks = document.createElement('div');
    crossLinks.className = 'directory-cross-links';
    crossLinks.style.cssText = 'margin-top:var(--space-3xl);padding-top:var(--space-xl);border-top:1px solid var(--color-border);display:flex;gap:var(--space-md);flex-wrap:wrap';
    const dashLink = document.createElement('a');
    dashLink.href = 'dashboard.html';
    dashLink.className = 'btn btn--secondary btn--sm';
    dashLink.textContent = 'Back to Dashboard';
    const profileLink = document.createElement('a');
    profileLink.href = 'profile.html';
    profileLink.className = 'btn btn--ghost btn--sm';
    profileLink.textContent = 'Edit My Profile';
    crossLinks.appendChild(dashLink);
    crossLinks.appendChild(profileLink);
    container.appendChild(crossLinks);

    this._bind(container);

    requestAnimationFrame(() => {
      container.querySelectorAll('.stagger-item').forEach((el) => el.classList.add('visible'));
    });
  },

  _bind(container) {
    const search = document.getElementById('dir-search');
    if (search) {
      search.addEventListener('input', (e) => {
        this._state.query = e.target.value;
        this.render();
        // Keep focus + caret in the search field across re-render.
        const next = document.getElementById('dir-search');
        if (next) { next.focus(); next.setSelectionRange(next.value.length, next.value.length); }
      });
    }
    container.querySelectorAll('[data-year]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._state.classYear = btn.dataset.year;
        this.render();
      });
    });
  },

  // Escape a value for safe use inside a double-quoted HTML attribute. Used only
  // for class-year numbers (already numeric), but kept strict as a guard.
  _attr(v) {
    return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },
};

window.Directory = Directory;
