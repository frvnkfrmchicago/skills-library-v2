/**
 * MOREHOUSE CHICAGO ALUMNI — DASHBOARD MODULE (window.Dashboard)
 * Lane F (mcaa-wave-002). Post-login landing: membership status, renew CTA,
 * upcoming registered events, Find a Brother card.
 *
 * Data reads go direct to Supabase (contract §2.2 — lanes route their own reads).
 * All member-supplied strings are written via textContent (§9 #7, G5).
 * FOAC: dashboard.html ships <body style="visibility:hidden">; Auth.requireAuth()
 * reveals on pass or redirects to signin.html on fail.
 */

const Dashboard = {
  _profile: null,
  _member: null,
  _rsvps: [],
  _events: [],

  async init() {
    const container = document.getElementById('dashboard-container');
    if (!container) return;

    this._renderSkeleton(container);
    await this._load();
    this._render(container);
  },

  // ── data ──────────────────────────────────────────────────────────────────

  async _load() {
    if (!window.supabaseClient) return;

    const userId = this._userId();
    if (!userId) return;

    // Profile row
    try {
      const { data: profile } = await window.supabaseClient
        .from('profiles')
        .select('id, full_name, class_year, bio, directory_visible')
        .eq('id', userId)
        .maybeSingle();
      this._profile = profile || null;
    } catch (_) {}

    // Member row (dues status, tier, expiry)
    try {
      const { data: member } = await window.supabaseClient
        .from('members')
        .select('id, status, tier, dues_paid_through, chapter_role_title')
        .eq('profile_id', userId)
        .maybeSingle();
      this._member = member || null;
    } catch (_) {}

    // The member's RSVPs joined with event details (upcoming only)
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data: rsvps } = await window.supabaseClient
        .from('registrations')
        .select('id, status, event_id, events(id, title, event_date, start_time, location, status)')
        .eq('profile_id', userId)
        .order('created_at', { ascending: false });

      if (Array.isArray(rsvps)) {
        this._rsvps = rsvps.filter((r) => {
          const ev = r.events;
          return ev && ev.event_date >= today && ev.status === 'published';
        }).slice(0, 3);
      }
    } catch (_) {}

    // Fall back to the Store cache when the live query is unavailable
    if (!this._rsvps.length && window.Store && window.Store.get) {
      const cached = window.Store.get(window.STORAGE_KEYS && window.STORAGE_KEYS.EVENTS || 'mca_events');
      if (Array.isArray(cached)) {
        const today = new Date().toISOString().slice(0, 10);
        this._events = cached
          .filter((e) => e && e.date >= today)
          .sort((a, b) => (a.date > b.date ? 1 : -1))
          .slice(0, 3);
      }
    }
  },

  _userId() {
    return (window.Store && window.Store._session && window.Store._session.user
      && window.Store._session.user.id) || null;
  },

  // ── helpers ───────────────────────────────────────────────────────────────

  _displayName() {
    if (this._profile && this._profile.full_name) return this._profile.full_name;
    const s = window.Store && window.Store._session;
    const u = s && s.user;
    if (!u) return 'Member';
    const meta = u.user_metadata || {};
    return meta.full_name || meta.name || u.email || 'Member';
  },

  _memberStatus() {
    if (!this._member) return 'unknown';
    return this._member.status || 'unknown';
  },

  _isActive() {
    const s = this._memberStatus();
    return s === 'active' || s === 'complimentary' || s === 'lifetime';
  },

  _duesPaidThrough() {
    if (!this._member || !this._member.dues_paid_through) return null;
    try {
      return new Date(this._member.dues_paid_through + 'T00:00:00').toLocaleDateString('en-US',
        { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (_) {
      return this._member.dues_paid_through;
    }
  },

  _tier() {
    if (!this._member || !this._member.tier) return null;
    const t = this._member.tier;
    return t.charAt(0).toUpperCase() + t.slice(1);
  },

  _statusBadgeClass(status) {
    if (status === 'active' || status === 'complimentary' || status === 'lifetime') {
      return 'status-badge--approved';
    }
    if (status === 'lapsed') return 'status-badge--rejected';
    return 'status-badge--pending';
  },

  _statusLabel(status) {
    const map = {
      active: 'Active',
      complimentary: 'Complimentary',
      lifetime: 'Lifetime',
      lapsed: 'Lapsed',
      pending: 'Pending',
      suspended: 'Suspended',
    };
    return map[status] || 'Unknown';
  },

  _formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US',
        { weekday: 'long', month: 'long', day: 'numeric' });
    } catch (_) {
      return dateStr;
    }
  },

  _formatTime(timeStr) {
    if (!timeStr) return '';
    try {
      const [h, m] = timeStr.split(':');
      const d = new Date();
      d.setHours(Number(h), Number(m));
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch (_) {
      return timeStr;
    }
  },

  // ── DOM builders (textContent throughout) ─────────────────────────────────

  _el(tag, attrs, text) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        if (k === 'class') node.className = attrs[k];
        else if (attrs[k] != null) node.setAttribute(k, attrs[k]);
      });
    }
    if (text != null) node.textContent = text;
    return node;
  },

  _buildMembershipCard() {
    const status = this._memberStatus();
    const active = this._isActive();
    const through = this._duesPaidThrough();
    const tier = this._tier();

    const card = this._el('div', { class: 'dashboard-card dashboard-card--membership' });

    const head = this._el('div', { class: 'dashboard-card__head' });
    head.appendChild(this._el('h2', { class: 'dashboard-card__title' }, 'Membership'));
    const badge = this._el('span', { class: 'status-badge ' + this._statusBadgeClass(status) });
    badge.textContent = this._statusLabel(status);
    head.appendChild(badge);
    card.appendChild(head);

    if (tier) {
      const tierRow = this._el('div', { class: 'dashboard-meta-row' });
      tierRow.appendChild(this._el('span', { class: 'dashboard-meta-label' }, 'Plan'));
      tierRow.appendChild(this._el('span', { class: 'dashboard-meta-value' }, tier));
      card.appendChild(tierRow);
    }

    if (through) {
      const thruRow = this._el('div', { class: 'dashboard-meta-row' });
      thruRow.appendChild(this._el('span', { class: 'dashboard-meta-label' }, 'Paid through'));
      thruRow.appendChild(this._el('span', { class: 'dashboard-meta-value' }, through));
      card.appendChild(thruRow);
    }

    if (!active || status === 'lapsed') {
      const cta = this._el('a', {
        class: 'btn btn--gold btn--lg dashboard-card__cta',
        href: 'membership.html',
      }, 'Renew Membership');
      card.appendChild(cta);

      const note = this._el('p', { class: 'dashboard-card__note' },
        'Renew to maintain directory access, event priority, and full member benefits.');
      card.appendChild(note);
    } else {
      const cta = this._el('a', {
        class: 'btn btn--secondary dashboard-card__cta',
        href: 'membership.html',
      }, 'Manage Membership');
      card.appendChild(cta);
    }

    return card;
  },

  _buildEventsCard() {
    const card = this._el('div', { class: 'dashboard-card dashboard-card--events' });

    const head = this._el('div', { class: 'dashboard-card__head' });
    head.appendChild(this._el('h2', { class: 'dashboard-card__title' }, 'Upcoming Events'));
    const all = this._el('a', {
      class: 'dashboard-card__head-link',
      href: 'my-events.html',
    }, 'View all');
    head.appendChild(all);
    card.appendChild(head);

    // Prefer live RSVP data; fall back to cached upcoming events
    const items = this._rsvps.length
      ? this._rsvps.map((r) => ({
          id: r.events && r.events.id,
          title: r.events && r.events.title,
          date: r.events && r.events.event_date,
          time: r.events && r.events.start_time,
          location: r.events && r.events.location,
        }))
      : this._events.map((e) => ({
          id: e.id, title: e.title, date: e.date,
          time: e.time, location: e.location,
        }));

    if (!items.length) {
      const empty = this._el('div', { class: 'dashboard-empty' });
      empty.appendChild(this._el('p', { class: 'dashboard-empty__text' },
        'No upcoming registered events. Browse the chapter calendar to find something.'));
      const link = this._el('a', {
        class: 'btn btn--secondary',
        href: 'events.html',
      }, 'Browse Events');
      empty.appendChild(link);
      card.appendChild(empty);
      return card;
    }

    const list = this._el('ul', { class: 'dashboard-event-list', role: 'list' });
    items.forEach((ev) => {
      const li = this._el('li', { class: 'dashboard-event-item' });
      const href = ev.id
        ? ('event-detail.html?id=' + encodeURIComponent(ev.id))
        : 'events.html';
      const a = this._el('a', { class: 'dashboard-event-link', href: href });

      const title = this._el('span', { class: 'dashboard-event-title' });
      title.textContent = ev.title || 'Event';
      a.appendChild(title);

      if (ev.date) {
        const meta = this._el('span', { class: 'dashboard-event-meta' });
        let metaText = this._formatDate(ev.date);
        if (ev.time) metaText += ' at ' + this._formatTime(ev.time);
        if (ev.location) metaText += ' — ' + ev.location.split(',')[0];
        meta.textContent = metaText;
        a.appendChild(meta);
      }

      li.appendChild(a);
      list.appendChild(li);
    });
    card.appendChild(list);

    return card;
  },

  _buildDirectoryCard() {
    const card = this._el('div', { class: 'dashboard-card dashboard-card--directory' });

    const head = this._el('div', { class: 'dashboard-card__head' });
    head.appendChild(this._el('h2', { class: 'dashboard-card__title' }, 'Find a Brother'));
    card.appendChild(head);

    const desc = this._el('p', { class: 'dashboard-card__desc' },
      'Browse the alumni directory to connect with Morehouse men across Chicago. Listings are opt-in and private to members.');
    card.appendChild(desc);

    const cta = this._el('a', {
      class: 'btn btn--secondary dashboard-card__cta',
      href: 'directory.html',
    }, 'Open Directory');
    card.appendChild(cta);

    // Visibility hint
    if (this._profile && this._profile.directory_visible === false) {
      const hint = this._el('p', { class: 'dashboard-visibility-hint' },
        'You are not currently listed. Enable directory visibility in your profile so brothers can find you.');
      const hintLink = this._el('a', { href: 'profile.html', class: 'dashboard-hint-link' },
        'Update profile');
      hint.appendChild(document.createTextNode(' '));
      hint.appendChild(hintLink);
      card.appendChild(hint);
    }

    return card;
  },

  _buildProfileCard() {
    const card = this._el('div', { class: 'dashboard-card dashboard-card--profile' });

    const head = this._el('div', { class: 'dashboard-card__head' });
    head.appendChild(this._el('h2', { class: 'dashboard-card__title' }, 'My Profile'));
    card.appendChild(head);

    const desc = this._el('p', { class: 'dashboard-card__desc' },
      'Keep your bio, class year, and job title up to date so your directory card stays accurate.');
    card.appendChild(desc);

    const cta = this._el('a', {
      class: 'btn btn--secondary dashboard-card__cta',
      href: 'profile.html',
    }, 'Edit Profile');
    card.appendChild(cta);

    return card;
  },

  // ── renders ───────────────────────────────────────────────────────────────

  _renderSkeleton(container) {
    while (container.firstChild) container.removeChild(container.firstChild);
    const skel = this._el('div', { class: 'dashboard-skeleton', 'aria-busy': 'true', 'aria-label': 'Loading dashboard' });
    for (let i = 0; i < 4; i++) {
      const c = this._el('div', { class: 'dashboard-card dashboard-card--skel', 'aria-hidden': 'true' });
      skel.appendChild(c);
    }
    container.appendChild(skel);
  },

  _render(container) {
    while (container.firstChild) container.removeChild(container.firstChild);

    // Greeting
    const greeting = this._el('div', { class: 'dashboard-greeting' });
    const greetText = this._el('h1', { class: 'dashboard-greeting__title' });
    greetText.textContent = 'Welcome, ' + this._displayName();
    greeting.appendChild(greetText);

    if (this._member && this._member.chapter_role_title) {
      const role = this._el('p', { class: 'dashboard-greeting__role' });
      role.textContent = this._member.chapter_role_title;
      greeting.appendChild(role);
    }
    container.appendChild(greeting);

    // Card grid
    const grid = this._el('div', { class: 'dashboard-grid' });
    grid.appendChild(this._buildMembershipCard());
    grid.appendChild(this._buildEventsCard());
    grid.appendChild(this._buildDirectoryCard());
    grid.appendChild(this._buildProfileCard());
    container.appendChild(grid);
  },
};

window.Dashboard = Dashboard;
