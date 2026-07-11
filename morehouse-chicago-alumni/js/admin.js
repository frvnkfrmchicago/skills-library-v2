/**
 * MOREHOUSE CHICAGO ALUMNI — ADMIN SHELL
 * Lane I — mcaa-wave-002. Implements docs/data-contract.md §9 #2 (admin gated by
 * Supabase session + RLS, renders nothing until Auth.requireAdmin() passes; FOAC),
 * §9 #7 (no innerHTML for user-controlled strings), and the §6 RLS intent.
 *
 * Gate model (HARD GATE — §9 #2):
 *   - admin.html ships <body style="visibility:hidden"> + data-protected="true".
 *   - Admin.start() FIRST calls Auth.requireAdmin(). If the JWT role is not
 *     admin/board the helper redirects (body stays hidden -> nothing paints).
 *   - For the actual mutations we additionally call Auth.assertAdminFresh()
 *     (server-side getUser revalidation) before writing, so a stale/forged client
 *     session cannot act. RLS is the real backstop on every query.
 *
 * Shell: admin.html carries the Lane A shell placeholders (#site-header,
 * #main-content, #site-footer). Admin.start() calls Shell.render() AFTER the
 * gate passes so only authenticated admin users ever trigger the shell render.
 *
 * Data source: window.supabaseClient (contract §2.2). Events are shown read-only
 * via the async Events module; members come from profiles; the approval queue
 * reads pending event_registrations.
 *
 * XSS (§9 #7): all member/registration strings are rendered with textContent via
 * DOM builders. Section chrome is static developer markup.
 */

const Admin = {
  _section: 'overview',
  _data: { members: [], pending: [], events: [] },

  // Entry point. Gate FIRST; only build the shell if requireAdmin passes.
  async start() {
    if (!window.Auth || !window.Auth.requireAdmin()) return; // redirect already fired

    // Shell render (Lane A) — runs only after the gate passes.
    if (window.Shell) {
      Shell.render({
        page: 'admin',
        breadcrumbs: [{ label: 'Admin' }]
      });
    }

    // Reveal the body now that auth + shell have settled.
    document.body.style.visibility = 'visible';

    this.renderSidebar();
    await this.showSection('overview');
  },

  /* ── helpers ──────────────────────────────────────────────────────────── */

  _setBusy(container, label) {
    // Static developer markup — not user content.
    container.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'admin-content__header';
    const h = document.createElement('h2');
    h.className = 'section-heading';
    h.style.fontSize = 'var(--text-3xl)';
    h.textContent = label;
    header.appendChild(h);
    container.appendChild(header);
    const status = document.createElement('p');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.style.color = 'var(--color-text-tertiary)';
    status.textContent = 'Loading…';
    container.appendChild(status);
  },

  _errorBlock(message) {
    const wrap = document.createElement('div');
    wrap.className = 'empty-state';
    const icon = document.createElement('div');
    icon.className = 'empty-state__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.style.fontSize = 'var(--text-3xl)';
    icon.style.color = 'var(--color-error)';
    icon.textContent = '!';
    const h = document.createElement('h3');
    h.className = 'empty-state__title';
    h.textContent = 'Could not load this section';
    const p = document.createElement('p');
    p.className = 'empty-state__text';
    p.textContent = message || 'Please refresh and try again.';
    wrap.appendChild(icon); wrap.appendChild(h); wrap.appendChild(p);
    return wrap;
  },

  _initials(name) {
    if (!name) return '—';
    return name.trim().split(/\s+/).map((n) => n[0] || '').join('').slice(0, 3).toUpperCase();
  },

  /* ── sidebar (consistent across all three admin pages) ────────────────── */

  renderSidebar() {
    const sidebar = document.getElementById('admin-sidebar');
    if (!sidebar) return;

    // Detect the current page to mark the active sidebar link.
    const page = window.location.pathname.split('/').pop() || 'admin.html';

    sidebar.innerHTML = '';
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Admin sections');

    // Helper: build a sidebar link node (textContent — no innerHTML).
    const makeLink = (label, href, isCurrent, dataSection) => {
      const a = document.createElement('a');
      a.className = 'admin-sidebar__link' + (isCurrent ? ' active' : '');
      a.href = href;
      a.textContent = label;
      if (isCurrent) a.setAttribute('aria-current', 'page');
      if (dataSection) a.dataset.section = dataSection;
      return a;
    };

    // In-page section links (admin.html only).
    if (page === 'admin.html' || page === '') {
      const pendingCount = this._data.pending.length;

      const overviewLink = makeLink('Overview', '#', this._section === 'overview', 'overview');
      nav.appendChild(overviewLink);

      const approvalsLink = makeLink(
        pendingCount > 0 ? 'Approvals (' + pendingCount + ')' : 'Approvals',
        '#',
        this._section === 'approvals',
        'approvals'
      );
      nav.appendChild(approvalsLink);

      nav.appendChild(makeLink('Members', '#', this._section === 'members', 'members'));
      nav.appendChild(makeLink('Events',  '#', this._section === 'events',  'events'));

      // Wire section clicks.
      nav.querySelectorAll('[data-section]').forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.showSection(link.dataset.section);
        });
      });

      nav.appendChild(document.createElement('hr'));
    }

    // Cross-page links — always present.
    nav.appendChild(makeLink('Dues Ledger',    'admin-dues.html',     page === 'admin-dues.html'));
    nav.appendChild(makeLink('Content Queue',  'admin-content.html',  page === 'admin-content.html'));

    sidebar.appendChild(nav);
  },

  async showSection(section) {
    this._section = section;
    this.renderSidebar();
    const content = document.getElementById('admin-content');
    if (!content) return;
    switch (section) {
      case 'overview':  return this.renderOverview(content);
      case 'approvals': return this.renderApprovals(content);
      case 'members':   return this.renderMembers(content);
      case 'events':    return this.renderEvents(content);
      default:          return this.renderOverview(content);
    }
  },

  /* ── overview ─────────────────────────────────────────────────────────── */

  async renderOverview(container) {
    this._setBusy(container, 'Chapter Overview');

    if (!window.supabaseClient) {
      container.innerHTML = '';
      const header = document.createElement('div');
      header.className = 'admin-content__header';
      const h = document.createElement('h2');
      h.className = 'section-heading';
      h.style.fontSize = 'var(--text-3xl)';
      h.textContent = 'Chapter Overview';
      header.appendChild(h);
      container.appendChild(header);
      container.appendChild(this._errorBlock('Connect the chapter backend (js/config.js) to load live data. The admin shell is ready.'));
      return;
    }

    // Pull live counts. head:true to avoid moving PII to the client.
    const client = window.supabaseClient;
    const [membersRes, pendingRes, eventsRes, overdueRes] = await Promise.all([
      client.from('members').select('id', { count: 'exact', head: true }),
      client.from('event_registrations').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      client.from('events').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      client.from('dues_invoices').select('id', { count: 'exact', head: true }).eq('status', 'overdue'),
    ]);

    this._data.pending = pendingRes.error ? [] : new Array(pendingRes.count || 0);

    container.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'admin-content__header';
    const h2 = document.createElement('h2');
    h2.className = 'section-heading';
    h2.style.fontSize = 'var(--text-3xl)';
    h2.textContent = 'Chapter Overview';
    header.appendChild(h2);
    container.appendChild(header);

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fit,minmax(200px,1fr))';
    grid.style.gap = 'var(--space-lg)';

    const cards = [
      { label: 'Members',           value: membersRes.count,  action: 'members' },
      { label: 'Pending approvals', value: pendingRes.count,  action: 'approvals' },
      { label: 'Published events',  value: eventsRes.count,   action: 'events' },
      { label: 'Overdue dues',      value: overdueRes.count,  href: 'admin-dues.html?status=overdue' },
    ];
    cards.forEach((c) => {
      const card = document.createElement(c.href ? 'a' : 'button');
      card.className = 'glass-card';
      card.style.padding = 'var(--space-xl)';
      card.style.textAlign = 'left';
      card.style.cursor = 'pointer';
      card.style.border = '1px solid var(--color-border)';
      card.style.minHeight = '44px';
      if (c.href) {
        card.href = c.href;
        card.style.textDecoration = 'none';
        card.style.color = 'inherit';
      } else {
        card.type = 'button';
        card.addEventListener('click', () => this.showSection(c.action));
      }
      const num = document.createElement('div');
      num.style.fontFamily = 'var(--font-heading)';
      num.style.fontSize = 'var(--text-4xl)';
      num.style.fontWeight = '700';
      num.style.color = 'var(--color-secondary)';
      num.textContent = (c.value == null ? '—' : String(c.value));
      const lab = document.createElement('div');
      lab.style.fontSize = 'var(--text-sm)';
      lab.style.color = 'var(--color-text-secondary)';
      lab.style.marginTop = 'var(--space-xs)';
      lab.textContent = c.label;
      card.appendChild(num); card.appendChild(lab);
      grid.appendChild(card);
    });
    container.appendChild(grid);
  },

  /* ── approvals (event_registrations pending) ──────────────────────────── */

  async renderApprovals(container) {
    this._setBusy(container, 'Pending Approvals');
    if (!window.supabaseClient) {
      container.innerHTML = '';
      container.appendChild(this._errorBlock('Connect the chapter backend to review registrations.'));
      return;
    }

    const { data, error } = await window.supabaseClient
      .from('event_registrations')
      .select('id, guest_count, status, created_at, profiles(full_name, email, class_year), events(title)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    this._data.pending = error ? [] : (data || []);
    this.renderSidebar();

    container.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'admin-content__header';
    const h2 = document.createElement('h2');
    h2.className = 'section-heading';
    h2.style.fontSize = 'var(--text-3xl)';
    h2.textContent = 'Pending Approvals';
    const badge = document.createElement('span');
    badge.className = 'status-badge status-badge--pending';
    badge.textContent = this._data.pending.length + ' pending';
    header.appendChild(h2); header.appendChild(badge);
    container.appendChild(header);

    if (error) { container.appendChild(this._errorBlock(error.message)); return; }

    if (this._data.pending.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      const icon = document.createElement('div');
      icon.className = 'empty-state__icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.style.fontSize = 'var(--text-3xl)';
      icon.style.color = 'var(--color-success)';
      icon.textContent = '✓';
      const h3 = document.createElement('h3');
      h3.className = 'empty-state__title';
      h3.textContent = 'All caught up';
      const p = document.createElement('p');
      p.className = 'empty-state__text';
      p.textContent = 'No pending registrations to review right now.';
      empty.appendChild(icon); empty.appendChild(h3); empty.appendChild(p);
      container.appendChild(empty);
      return;
    }

    // Table with DOM nodes (member-supplied names/emails -> textContent).
    const table = document.createElement('table');
    table.className = 'approval-table';
    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    ['Name', 'Event', 'Class', 'Guests', 'Requested', 'Actions'].forEach((col) => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = col;
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');

    this._data.pending.forEach((r) => {
      const prof = r.profiles || {};
      const tr = document.createElement('tr');

      const nameTd = document.createElement('td');
      const strong = document.createElement('strong');
      strong.textContent = prof.full_name || 'Member';
      const emailLine = document.createElement('div');
      emailLine.style.color = 'var(--color-text-tertiary)';
      emailLine.style.fontSize = 'var(--text-xs)';
      emailLine.textContent = prof.email || '';
      nameTd.appendChild(strong); nameTd.appendChild(emailLine);

      const eventTd = document.createElement('td');
      eventTd.textContent = (r.events && r.events.title) || 'Unknown event';

      const classTd = document.createElement('td');
      classTd.textContent = prof.class_year != null ? 'Class of ' + prof.class_year : '—';

      const guestTd = document.createElement('td');
      guestTd.textContent = String(r.guest_count || 0);

      const dateTd = document.createElement('td');
      dateTd.textContent = window.formatDateShort ? window.formatDateShort(r.created_at) : String(r.created_at);

      const actionsTd = document.createElement('td');
      actionsTd.className = 'approval-actions';
      const approve = document.createElement('button');
      approve.className = 'btn btn--primary btn--sm';
      approve.style.minHeight = '44px';
      approve.textContent = 'Approve';
      approve.type = 'button';
      approve.addEventListener('click', () => this.decideRegistration(r.id, 'approved', approve));
      const deny = document.createElement('button');
      deny.className = 'btn btn--ghost btn--sm';
      deny.style.color = 'var(--color-error)';
      deny.style.minHeight = '44px';
      deny.textContent = 'Deny';
      deny.type = 'button';
      deny.addEventListener('click', () => this.decideRegistration(r.id, 'cancelled', deny));
      actionsTd.appendChild(approve); actionsTd.appendChild(deny);

      tr.appendChild(nameTd); tr.appendChild(eventTd); tr.appendChild(classTd);
      tr.appendChild(guestTd); tr.appendChild(dateTd); tr.appendChild(actionsTd);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
  },

  // Approve / deny with a fresh server-side admin check before writing (§2.3).
  async decideRegistration(id, status, btn) {
    if (btn) btn.disabled = true;
    const fresh = await Auth.assertAdminFresh();
    if (!fresh) {
      showToast('Your admin session expired. Please sign in again.', 'error');
      if (btn) btn.disabled = false;
      return;
    }

    const { error } = await window.supabaseClient
      .from('event_registrations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      showToast(error.message || 'Update failed.', 'error');
      if (btn) btn.disabled = false;
      return;
    }
    showToast(
      status === 'approved' ? 'Registration approved.' : 'Registration denied.',
      status === 'approved' ? 'success' : 'error'
    );
    this.showSection('approvals');
  },

  /* ── members (profiles) ───────────────────────────────────────────────── */

  async renderMembers(container) {
    this._setBusy(container, 'Members');
    if (!window.supabaseClient) {
      container.innerHTML = '';
      container.appendChild(this._errorBlock('Connect the chapter backend to view members.'));
      return;
    }

    const { data, error } = await window.supabaseClient
      .from('profiles')
      .select('id, full_name, email, class_year, role, directory_visible, members(membership_status, chapter_role_title)')
      .order('full_name', { ascending: true });

    this._data.members = error ? [] : (data || []);

    container.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'admin-content__header';
    const h2 = document.createElement('h2');
    h2.className = 'section-heading';
    h2.style.fontSize = 'var(--text-3xl)';
    h2.textContent = 'Members';
    const badge = document.createElement('span');
    badge.className = 'status-badge status-badge--approved';
    badge.textContent = this._data.members.length + ' total';
    header.appendChild(h2); header.appendChild(badge);
    container.appendChild(header);

    if (error) { container.appendChild(this._errorBlock(error.message)); return; }

    if (this._data.members.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      const icon = document.createElement('div');
      icon.className = 'empty-state__icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.style.fontSize = 'var(--text-3xl)';
      icon.style.color = 'var(--color-text-tertiary)';
      icon.textContent = '—';
      const h3 = document.createElement('h3');
      h3.className = 'empty-state__title';
      h3.textContent = 'No members yet';
      const p = document.createElement('p');
      p.className = 'empty-state__text';
      p.textContent = 'Members appear here once the board imports the roster or alumni sign up.';
      empty.appendChild(icon); empty.appendChild(h3); empty.appendChild(p);
      container.appendChild(empty);
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'directory-grid';
    this._data.members.forEach((m) => {
      const mem = m.members || {};
      const card = document.createElement('div');
      card.className = 'member-card';
      const avatar = document.createElement('div');
      avatar.className = 'member-card__avatar';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = this._initials(m.full_name);
      const info = document.createElement('div');
      info.className = 'member-card__info';
      const name = document.createElement('div');
      name.className = 'member-card__name';
      name.textContent = m.full_name || m.email || 'Member';
      const detail = document.createElement('div');
      detail.className = 'member-card__detail';
      const bits = [];
      if (m.class_year != null) bits.push('Class of ' + m.class_year);
      if (mem.chapter_role_title) bits.push(mem.chapter_role_title);
      detail.textContent = bits.join('  \xb7  ') || '—';
      const statusRow = document.createElement('div');
      statusRow.style.marginTop = 'var(--space-sm)';
      statusRow.style.display = 'flex';
      statusRow.style.gap = 'var(--space-xs)';
      statusRow.style.flexWrap = 'wrap';
      const st = document.createElement('span');
      st.className = 'status-badge ' + this._statusClass(mem.membership_status);
      st.textContent = mem.membership_status || 'no record';
      statusRow.appendChild(st);
      if (m.role && m.role !== 'member') {
        const roleBadge = document.createElement('span');
        roleBadge.className = 'status-badge status-badge--approved';
        roleBadge.textContent = m.role;
        statusRow.appendChild(roleBadge);
      }
      info.appendChild(name); info.appendChild(detail); info.appendChild(statusRow);
      card.appendChild(avatar); card.appendChild(info);
      grid.appendChild(card);
    });
    container.appendChild(grid);
  },

  _statusClass(status) {
    if (status === 'active' || status === 'lifetime' || status === 'comped') return 'status-badge--approved';
    if (status === 'lapsed' || status === 'expired' || status === 'suspended')  return 'status-badge--denied';
    return 'status-badge--pending';
  },

  /* ── events (read-only; Lane 3 owns event CRUD) ───────────────────────── */

  async renderEvents(container) {
    this._setBusy(container, 'Events');
    if (!window.Events || typeof window.Events.getAll !== 'function') {
      container.innerHTML = '';
      container.appendChild(this._errorBlock('The events module is unavailable.'));
      return;
    }
    let events = [];
    try { events = await window.Events.getAll(); } catch (_) { events = []; }
    this._data.events = events;

    container.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'admin-content__header';
    const h2 = document.createElement('h2');
    h2.className = 'section-heading';
    h2.style.fontSize = 'var(--text-3xl)';
    h2.textContent = 'Events';
    const newBtn = document.createElement('a');
    newBtn.className = 'btn btn--gold';
    newBtn.href = 'events.html';
    newBtn.textContent = 'Manage on Events page';
    header.appendChild(h2); header.appendChild(newBtn);
    container.appendChild(header);

    if (!events.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      const icon = document.createElement('div');
      icon.className = 'empty-state__icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.style.fontSize = 'var(--text-3xl)';
      icon.style.color = 'var(--color-text-tertiary)';
      icon.textContent = '—';
      const h3 = document.createElement('h3');
      h3.className = 'empty-state__title';
      h3.textContent = 'No published events';
      const p = document.createElement('p');
      p.className = 'empty-state__text';
      p.textContent = 'Create and publish events from the Events page.';
      empty.appendChild(icon); empty.appendChild(h3); empty.appendChild(p);
      container.appendChild(empty);
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'event-grid';
    events.forEach((evt) => {
      const a = document.createElement('a');
      a.className = 'event-card';
      a.href = 'event-detail.html?id=' + encodeURIComponent(evt.id);
      a.style.textDecoration = 'none';
      a.style.color = 'inherit';
      const body = document.createElement('div');
      body.className = 'event-card__body';
      const date = document.createElement('div');
      date.className = 'event-card__date';
      date.textContent = window.formatDateShort
        ? window.formatDateShort(evt.date || evt.event_date)
        : (evt.date || evt.event_date || '');
      const title = document.createElement('h3');
      title.className = 'event-card__title';
      title.textContent = evt.title || 'Untitled event';
      const loc = document.createElement('div');
      loc.className = 'event-card__location';
      loc.textContent = (evt.location || '').split(',')[0] || '';
      body.appendChild(date); body.appendChild(title); body.appendChild(loc);
      a.appendChild(body);
      grid.appendChild(a);
    });
    container.appendChild(grid);
  },
};

// Toast helper (shared; also used by admin-dues.js).
function showToast(message, type) {
  type = type || 'success';
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast toast--' + type;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message; // always textContent, never innerHTML
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

window.Admin = Admin;
window.showToast = showToast;
