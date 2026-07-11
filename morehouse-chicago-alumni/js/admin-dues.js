/**
 * MOREHOUSE CHICAGO ALUMNI — ADMIN DUES LEDGER
 * Lane I — mcaa-wave-002. Implements docs/data-contract.md §4 (dues_invoices,
 * members, profiles), §6 RLS intent (admin/board read all), §9 #2 (admin gate +
 * FOAC, render nothing until requireAdmin passes), §9 #7 (no innerHTML for member
 * strings).
 *
 * Gate: admin-dues.html ships <body style="visibility:hidden">. Dues.start()
 * calls Auth.requireAdmin() FIRST. CSV export and every write re-validate
 * with Auth.assertAdminFresh().
 *
 * Shell: Dues.start() calls Shell.render() AFTER the gate passes (Lane A).
 *
 * Mark-Paid contract (payment-contract-paypal.md §5):
 *   For Zelle / check / cash arriving directly at Chase, an admin selects the
 *   invoice's "Mark Paid" button, picks the method, enters a reference, and
 *   confirms. The write sequence is:
 *     1. Auth.assertAdminFresh()         — fresh server-side role check
 *     2. payments insert                 — payments_admin_insert RLS (migration 011)
 *     3. dues_invoices update → 'paid'   — marks the invoice
 *     4. members update → 'active'       — sets expiry +1 year
 *   payment_method in {check, zelle, cash}. payment_reference captures the
 *   check number / Zelle confirmation for Chase reconciliation.
 *   comped/lifetime/manual members must NOT be marked paid (their dues are waived).
 *
 * Features:
 *   - Ledger of dues_invoices with member name, period, amount, status, due date.
 *   - Filter by status: all / paid / overdue / lapsed / comped / pending /
 *     payment_failed / action_required / waived / refunded / void.
 *   - Aging buckets + outstanding total on the filtered view.
 *   - "Mark Paid" action per open invoice (Zelle/check/cash).
 *   - CSV export of the current filtered view (client-side blob, injection-defended).
 *
 * XSS (§9 #7): all member strings use textContent or DOM construction.
 * No Stripe references. No secrets. Admin RLS is the server-side backstop.
 */

const Dues = {
  // dues_status enum values (§3) the board filters by, plus 'all'.
  STATUSES: ['all', 'paid', 'overdue', 'pending', 'payment_failed', 'action_required', 'waived', 'refunded', 'void'],

  _state: {
    rows: [],
    filter: 'all',
    compedOnly: false,
    loaded: false,
    error: null,
    // mark-paid modal state
    _markPaidInvoiceId: null,
    _markPaidMemberId: null,
    _markPaidDefaultCents: null,
  },

  async start() {
    if (!window.Auth || !window.Auth.requireAdmin()) return; // redirect already fired

    // Shell render (Lane A) after the gate passes.
    if (window.Shell) {
      Shell.render({
        page: 'admin',
        breadcrumbs: [
          { label: 'Admin', href: 'admin.html' },
          { label: 'Dues Ledger' }
        ]
      });
    }

    // Reveal the body now that auth + shell have settled.
    document.body.style.visibility = 'visible';

    // Render admin sidebar (consistent with admin.html and admin-content.html).
    this._renderSidebar();

    // Honor a deep-link like admin-dues.html?status=overdue (from admin overview).
    const param = new URLSearchParams(window.location.search).get('status');
    if (param && this.STATUSES.includes(param)) this._state.filter = param;
    if (param === 'comped') this._state.compedOnly = true;

    this._renderLoading();
    await this._load();
    this.render();
    this._bindMarkPaidModal();
  },

  /* ── sidebar (mirrors admin.js renderSidebar, page = admin-dues.html) ── */

  _renderSidebar() {
    const sidebar = document.getElementById('admin-sidebar');
    if (!sidebar) return;
    sidebar.innerHTML = '';
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Admin navigation');

    const link = (label, href, current) => {
      const a = document.createElement('a');
      a.className = 'admin-sidebar__link' + (current ? ' active' : '');
      a.href = href;
      a.textContent = label;
      if (current) a.setAttribute('aria-current', 'page');
      return a;
    };

    nav.appendChild(link('Overview',       'admin.html',         false));
    nav.appendChild(link('Approvals',      'admin.html',         false));
    nav.appendChild(link('Members',        'admin.html',         false));
    nav.appendChild(link('Events',         'admin.html',         false));
    nav.appendChild(document.createElement('hr'));
    nav.appendChild(link('Dues Ledger',    'admin-dues.html',    true));
    nav.appendChild(link('Content Queue',  'admin-content.html', false));

    sidebar.appendChild(nav);
  },

  /* ── data ─────────────────────────────────────────────────────────────── */

  async _load() {
    const s = this._state;
    s.error = null;
    if (!window.supabaseClient) { s.loaded = true; s.error = 'not_configured'; return; }

    try {
      // Also fetch members.id and members.member_id via the join so we have it for
      // the mark-paid write. The member row id is at members.id (PK);
      // dues_invoices.member_id is the FK.
      const { data, error } = await window.supabaseClient
        .from('dues_invoices')
        .select(
          'id, member_id, invoice_type, period_start, period_end, amount_cents, ' +
          'status, due_date, created_at, ' +
          'members(id, membership_status, profiles(full_name, email, class_year))'
        )
        .order('due_date', { ascending: true });

      if (error) { s.error = error.message; s.rows = []; s.loaded = true; return; }
      s.rows = data || [];
      s.loaded = true;
    } catch (e) {
      s.error = (e && e.message) || 'Could not load the dues ledger.';
      s.rows = [];
      s.loaded = true;
    }
  },

  /* ── derive ───────────────────────────────────────────────────────────── */

  _filtered() {
    const s = this._state;
    let list = s.rows.slice();
    if (s.compedOnly) {
      list = list.filter((r) => r.members && r.members.membership_status === 'comped');
    } else if (s.filter !== 'all') {
      list = list.filter((r) => r.status === s.filter);
    }
    return list;
  },

  _ageDays(row) {
    if (['paid', 'waived', 'refunded', 'void'].includes(row.status)) return 0;
    if (!row.due_date) return 0;
    const due = new Date(row.due_date + 'T00:00:00');
    const now = new Date();
    const diff = Math.floor((now - due) / 86400000);
    return diff > 0 ? diff : 0;
  },

  _ageBucket(days) {
    if (days <= 0) return 'current';
    if (days <= 30) return '1–30';
    if (days <= 60) return '31–60';
    if (days <= 90) return '61–90';
    return '90+';
  },

  _money(cents) {
    if (cents == null) return '—';
    return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  },

  _statusClass(status) {
    if (['paid', 'waived'].includes(status))                          return 'status-badge--approved';
    if (['overdue', 'payment_failed', 'void'].includes(status))      return 'status-badge--denied';
    return 'status-badge--pending';
  },

  _name(row) {
    const prof = row.members && row.members.profiles;
    return (prof && prof.full_name) || (prof && prof.email) || 'Unknown member';
  },

  // A row is eligible for mark-paid if it is open (not already settled/waived) and
  // not for a comped/lifetime/manual member (they never pay — their dues are waived).
  _canMarkPaid(row) {
    const settled = ['paid', 'waived', 'refunded', 'void'];
    if (settled.includes(row.status)) return false;
    const mem = row.members;
    if (!mem) return false;
    const noPayStatuses = ['comped', 'lifetime', 'manual'];
    if (noPayStatuses.includes(mem.membership_status)) return false;
    return true;
  },

  /* ── render ───────────────────────────────────────────────────────────── */

  _renderLoading() {
    const c = document.getElementById('dues-container');
    if (!c) return;
    c.innerHTML = '';
    const p = document.createElement('p');
    p.setAttribute('role', 'status');
    p.setAttribute('aria-live', 'polite');
    p.style.color = 'var(--color-text-tertiary)';
    p.textContent = 'Loading the dues ledger…';
    c.appendChild(p);
  },

  render() {
    const c = document.getElementById('dues-container');
    if (!c) return;
    const s = this._state;

    if (s.error === 'not_configured') {
      c.innerHTML = '';
      c.appendChild(this._notice('Dues ledger is ready', 'Connect the chapter backend (js/config.js) to load live dues data.'));
      return;
    }

    const rows = this._filtered();

    // Static developer markup — filter buttons and layout shell.
    c.innerHTML = '';

    // Header
    const headerDiv = document.createElement('div');
    headerDiv.className = 'admin-content__header';
    headerDiv.style.flexWrap = 'wrap';
    headerDiv.style.gap = 'var(--space-md)';
    const h1 = document.createElement('h1');
    h1.className = 'section-heading';
    h1.style.fontSize = 'var(--text-3xl)';
    h1.textContent = 'Dues Ledger';
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn--secondary';
    exportBtn.id = 'dues-export';
    exportBtn.type = 'button';
    exportBtn.style.minHeight = '44px';
    exportBtn.textContent = 'Export CSV';
    headerDiv.appendChild(h1); headerDiv.appendChild(exportBtn);
    c.appendChild(headerDiv);

    // Filter buttons
    const filterGroup = document.createElement('div');
    filterGroup.className = 'directory-filters';
    filterGroup.setAttribute('role', 'group');
    filterGroup.setAttribute('aria-label', 'Filter by status');
    filterGroup.style.marginBottom = 'var(--space-lg)';

    this.STATUSES.forEach((st) => {
      const isActive = !s.compedOnly && s.filter === st;
      const btn = document.createElement('button');
      btn.className = 'btn btn--sm ' + (isActive ? 'btn--gold' : 'btn--ghost');
      btn.dataset.filter = st;
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      btn.style.minHeight = '44px';
      btn.textContent = st === 'all' ? 'All' : this._label(st);
      filterGroup.appendChild(btn);
    });

    const compedBtn = document.createElement('button');
    compedBtn.className = 'btn btn--sm ' + (s.compedOnly ? 'btn--gold' : 'btn--ghost');
    compedBtn.dataset.comped = '1';
    compedBtn.setAttribute('aria-pressed', s.compedOnly ? 'true' : 'false');
    compedBtn.style.minHeight = '44px';
    compedBtn.textContent = 'Comped';
    filterGroup.appendChild(compedBtn);
    c.appendChild(filterGroup);

    // Summary section
    const summaryDiv = document.createElement('div');
    summaryDiv.id = 'dues-summary';
    summaryDiv.style.marginBottom = 'var(--space-lg)';
    c.appendChild(summaryDiv);
    this._renderSummary(summaryDiv, rows);

    // Table section
    const tableDiv = document.createElement('div');
    tableDiv.id = 'dues-table';
    c.appendChild(tableDiv);

    if (s.error) {
      tableDiv.appendChild(this._notice('Could not load the dues ledger', 'Please refresh and try again.', 'error'));
      this._bind();
      return;
    }

    if (!rows.length) {
      tableDiv.appendChild(this._notice('No invoices in this view', 'There are no dues invoices matching this filter yet.'));
      this._bind();
      return;
    }

    // Table with DOM nodes (member names -> textContent).
    const table = document.createElement('table');
    table.className = 'approval-table';
    const thead = document.createElement('thead');
    const hr = document.createElement('tr');
    ['Member', 'Type', 'Period', 'Amount', 'Status', 'Due', 'Aging', 'Action'].forEach((col) => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = col;
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');

    rows.forEach((r) => {
      const tr = document.createElement('tr');

      const nameTd = document.createElement('td');
      const strong = document.createElement('strong');
      strong.textContent = this._name(r);
      nameTd.appendChild(strong);
      const prof = r.members && r.members.profiles;
      if (prof && prof.class_year != null) {
        const sub = document.createElement('div');
        sub.style.color = 'var(--color-text-tertiary)';
        sub.style.fontSize = 'var(--text-xs)';
        sub.textContent = 'Class of ' + prof.class_year;
        nameTd.appendChild(sub);
      }

      const typeTd = document.createElement('td');
      typeTd.textContent = this._label(r.invoice_type || '');

      const periodTd = document.createElement('td');
      const ps = r.period_start
        ? (window.formatDateShort ? window.formatDateShort(r.period_start) : r.period_start)
        : '';
      const pe = r.period_end
        ? (window.formatDateShort ? window.formatDateShort(r.period_end) : r.period_end)
        : '';
      periodTd.textContent = ps && pe ? (ps + ' – ' + pe) : (ps || pe || '—');

      const amountTd = document.createElement('td');
      amountTd.textContent = this._money(r.amount_cents);

      const statusTd = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = 'status-badge ' + this._statusClass(r.status);
      badge.textContent = r.status;
      statusTd.appendChild(badge);

      const dueTd = document.createElement('td');
      dueTd.textContent = r.due_date
        ? (window.formatDateShort ? window.formatDateShort(r.due_date) : r.due_date)
        : '—';

      const ageTd = document.createElement('td');
      const days = this._ageDays(r);
      ageTd.textContent = days > 0 ? (days + 'd  \xb7  ' + this._ageBucket(days)) : '—';
      if (days > 0) ageTd.style.color = days > 60 ? 'var(--color-error)' : 'var(--color-warning)';

      // Mark-Paid action column
      const actionTd = document.createElement('td');
      if (this._canMarkPaid(r)) {
        const mpBtn = document.createElement('button');
        mpBtn.className = 'btn btn--sm btn--gold';
        mpBtn.type = 'button';
        mpBtn.style.minHeight = '44px';
        mpBtn.style.whiteSpace = 'nowrap';
        mpBtn.textContent = 'Mark Paid';
        mpBtn.dataset.invoiceId = r.id;
        mpBtn.dataset.memberId  = r.member_id || (r.members && r.members.id) || '';
        mpBtn.dataset.amountCents = r.amount_cents != null ? String(r.amount_cents) : '';
        mpBtn.addEventListener('click', () => {
          this._openMarkPaidModal(r.id, mpBtn.dataset.memberId, r.amount_cents);
        });
        actionTd.appendChild(mpBtn);
      } else {
        actionTd.textContent = '—';
        actionTd.style.color = 'var(--color-text-tertiary)';
      }

      tr.appendChild(nameTd); tr.appendChild(typeTd); tr.appendChild(periodTd);
      tr.appendChild(amountTd); tr.appendChild(statusTd); tr.appendChild(dueTd);
      tr.appendChild(ageTd); tr.appendChild(actionTd);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tableDiv.appendChild(table);

    this._bind();
  },

  _renderSummary(host, rows) {
    if (!host) return;
    const outstanding = rows
      .filter((r) => ['pending', 'overdue', 'payment_failed', 'action_required'].includes(r.status))
      .reduce((sum, r) => sum + (r.amount_cents || 0), 0);
    const buckets = { current: 0, '1–30': 0, '31–60': 0, '61–90': 0, '90+': 0 };
    rows.forEach((r) => { buckets[this._ageBucket(this._ageDays(r))] += 1; });

    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.gap = 'var(--space-lg)';
    wrap.style.flexWrap = 'wrap';

    const stat = (label, value) => {
      const box = document.createElement('div');
      box.style.padding = 'var(--space-md) var(--space-lg)';
      box.style.border = '1px solid var(--color-border-subtle)';
      box.style.borderRadius = 'var(--radius-md)';
      const v = document.createElement('div');
      v.style.fontFamily = 'var(--font-heading)';
      v.style.fontWeight = '700';
      v.style.fontSize = 'var(--text-xl)';
      v.style.color = 'var(--color-secondary)';
      v.textContent = value;
      const l = document.createElement('div');
      l.style.fontSize = 'var(--text-xs)';
      l.style.color = 'var(--color-text-tertiary)';
      l.textContent = label;
      box.appendChild(v); box.appendChild(l);
      return box;
    };

    wrap.appendChild(stat('Outstanding',    this._money(outstanding)));
    wrap.appendChild(stat('Invoices',       String(rows.length)));
    wrap.appendChild(stat('1–30d',     String(buckets['1–30'])));
    wrap.appendChild(stat('31–60d',    String(buckets['31–60'])));
    wrap.appendChild(stat('61–90d',    String(buckets['61–90'])));
    wrap.appendChild(stat('90+d',           String(buckets['90+'])));
    host.appendChild(wrap);
  },

  _notice(title, body, kind) {
    const wrap = document.createElement('div');
    wrap.className = 'empty-state';
    const icon = document.createElement('div');
    icon.className = 'empty-state__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.style.fontSize = 'var(--text-3xl)';
    icon.style.color = kind === 'error' ? 'var(--color-error)' : 'var(--color-text-tertiary)';
    icon.textContent = kind === 'error' ? '!' : '—';
    const h = document.createElement('h3');
    h.className = 'empty-state__title';
    h.textContent = title;
    const p = document.createElement('p');
    p.className = 'empty-state__text';
    p.textContent = body;
    wrap.appendChild(icon); wrap.appendChild(h); wrap.appendChild(p);
    return wrap;
  },

  _bind() {
    document.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._state.filter = btn.dataset.filter;
        this._state.compedOnly = false;
        this.render();
      });
    });
    const compedBtn = document.querySelector('[data-comped]');
    if (compedBtn) {
      compedBtn.addEventListener('click', () => {
        this._state.compedOnly = !this._state.compedOnly;
        this.render();
      });
    }
    const exportBtn = document.getElementById('dues-export');
    if (exportBtn) exportBtn.addEventListener('click', () => this.exportCsv(exportBtn));
  },

  /* ── Mark-Paid modal (payment-contract-paypal.md §5) ──────────────────── */

  _openMarkPaidModal(invoiceId, memberId, amountCents) {
    this._state._markPaidInvoiceId   = invoiceId;
    this._state._markPaidMemberId    = memberId;
    this._state._markPaidDefaultCents = amountCents;

    const modal = document.getElementById('mark-paid-modal');
    if (!modal) return;

    // Reset fields — textContent/value assignments only.
    const methodSel = document.getElementById('mark-paid-method');
    const refInput  = document.getElementById('mark-paid-reference');
    const amtInput  = document.getElementById('mark-paid-amount');
    const errDiv    = document.getElementById('mark-paid-error');
    if (methodSel) methodSel.value = '';
    if (refInput)  refInput.value  = '';
    if (amtInput)  amtInput.value  = amountCents != null ? (amountCents / 100).toFixed(2) : '';
    if (errDiv)  { errDiv.textContent = ''; errDiv.style.display = 'none'; }

    modal.style.display = 'flex';
    if (methodSel) methodSel.focus();
  },

  _closeMarkPaidModal() {
    const modal = document.getElementById('mark-paid-modal');
    if (modal) modal.style.display = 'none';
    this._state._markPaidInvoiceId   = null;
    this._state._markPaidMemberId    = null;
    this._state._markPaidDefaultCents = null;
  },

  _bindMarkPaidModal() {
    const cancelBtn  = document.getElementById('mark-paid-cancel');
    const confirmBtn = document.getElementById('mark-paid-confirm');
    const modal      = document.getElementById('mark-paid-modal');

    if (cancelBtn) cancelBtn.addEventListener('click', () => this._closeMarkPaidModal());

    if (modal) {
      modal.addEventListener('click', (e) => {
        // Close on backdrop click (not on the inner dialog box).
        if (e.target === modal) this._closeMarkPaidModal();
      });
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this._closeMarkPaidModal();
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        await this._submitMarkPaid(confirmBtn);
      });
    }
  },

  async _submitMarkPaid(confirmBtn) {
    const invoiceId = this._state._markPaidInvoiceId;
    const memberId  = this._state._markPaidMemberId;

    const methodSel = document.getElementById('mark-paid-method');
    const refInput  = document.getElementById('mark-paid-reference');
    const amtInput  = document.getElementById('mark-paid-amount');
    const errDiv    = document.getElementById('mark-paid-error');

    const method    = methodSel ? methodSel.value.trim() : '';
    const reference = refInput  ? refInput.value.trim()  : '';
    const amountRaw = amtInput  ? parseFloat(amtInput.value) : NaN;

    // Input validation — error messages via textContent only.
    const errors = [];
    if (!['check', 'zelle', 'cash'].includes(method)) {
      errors.push('Select a payment method (Zelle, Check, or Cash).');
    }
    if (!reference || reference.length < 2) {
      errors.push('A reference (check number, Zelle confirmation, or note) is required.');
    }
    if (isNaN(amountRaw) || amountRaw <= 0) {
      errors.push('Enter a positive amount received.');
    }
    if (!invoiceId || !memberId) {
      errors.push('Invoice data is missing. Close and try again.');
    }

    if (errors.length > 0) {
      if (errDiv) {
        errDiv.textContent = errors.join(' ');
        errDiv.style.display = 'block';
      }
      return;
    }
    if (errDiv) { errDiv.textContent = ''; errDiv.style.display = 'none'; }

    const amountCents = Math.round(amountRaw * 100);
    if (confirmBtn) confirmBtn.disabled = true;

    // Fresh server-side admin check before ANY write (§2.3 / payment-contract §5).
    const fresh = await Auth.assertAdminFresh();
    if (!fresh) {
      if (errDiv) {
        errDiv.textContent = 'Your admin session expired. Please sign in again.';
        errDiv.style.display = 'block';
      }
      if (confirmBtn) confirmBtn.disabled = false;
      return;
    }

    // Resolve the admin profile id for the metadata recorded_by field.
    let adminProfileId = null;
    try {
      const { data: { user } } = await window.supabaseClient.auth.getUser();
      adminProfileId = user ? user.id : null;
    } catch (_) { /* non-critical */ }

    const now       = new Date().toISOString();
    const oneYearOut = new Date();
    oneYearOut.setFullYear(oneYearOut.getFullYear() + 1);
    const expiresAt = oneYearOut.toISOString().slice(0, 10);

    const client = window.supabaseClient;

    // ── Step 1: Insert payments row (payments_admin_insert RLS, migration 011) ─
    const paymentRow = {
      member_id:      memberId,
      amount_cents:   amountCents,
      currency:       'usd',
      purpose_type:   'dues',
      payment_method: method,   // 'check' | 'zelle' | 'cash'
      status:         'succeeded',
      paid_at:        now,
      payment_reference: reference,
      metadata:       adminProfileId ? { recorded_by: adminProfileId } : {},
    };

    const { error: payErr } = await client.from('payments').insert(paymentRow);
    if (payErr) {
      if (errDiv) {
        errDiv.textContent = 'Payment record failed: ' + (payErr.message || 'unknown error');
        errDiv.style.display = 'block';
      }
      if (confirmBtn) confirmBtn.disabled = false;
      return;
    }

    // ── Step 2: Update dues_invoice → paid ────────────────────────────────
    const { error: invErr } = await client
      .from('dues_invoices')
      .update({
        status:            'paid',
        payment_method:    method,
        payment_reference: reference,
        updated_at:        now,
      })
      .eq('id', invoiceId);

    if (invErr) {
      if (errDiv) {
        errDiv.textContent = 'Invoice update failed: ' + (invErr.message || 'unknown error');
        errDiv.style.display = 'block';
      }
      if (confirmBtn) confirmBtn.disabled = false;
      return;
    }

    // ── Step 3: Update member → active with expiry ────────────────────────
    const { error: memErr } = await client
      .from('members')
      .update({
        membership_status: 'active',
        expires_at:        expiresAt,
        updated_at:        now,
      })
      .eq('id', memberId);

    if (memErr) {
      // Payment + invoice already written; log and warn rather than fail silently.
      if (errDiv) {
        errDiv.textContent = 'Member status update failed: ' + (memErr.message || 'unknown error') +
          '. Payment and invoice were recorded. Check the member row manually.';
        errDiv.style.display = 'block';
      }
      if (confirmBtn) confirmBtn.disabled = false;
      return;
    }

    // ── All three writes succeeded ────────────────────────────────────────
    this._closeMarkPaidModal();
    if (confirmBtn) confirmBtn.disabled = false;

    showToast('Payment recorded. Member set to active.', 'success');

    // Reload the ledger to reflect the new state.
    await this._load();
    this.render();
  },

  /* ── CSV export ───────────────────────────────────────────────────────── */

  async exportCsv(btn) {
    // Re-validate admin before exporting member financial data (§2.3).
    if (btn) btn.disabled = true;
    const fresh = await Auth.assertAdminFresh();
    if (!fresh) {
      showToast('Your admin session expired. Please sign in again.', 'error');
      if (btn) btn.disabled = false;
      return;
    }

    const rows = this._filtered();
    if (!rows.length) {
      showToast('Nothing to export in this view.', 'error');
      if (btn) btn.disabled = false;
      return;
    }

    const header = [
      'Member', 'Email', 'Class Year', 'Invoice Type', 'Period Start', 'Period End',
      'Amount USD', 'Status', 'Due Date', 'Days Overdue', 'Aging Bucket'
    ];
    const lines = [header.map(this._csvCell).join(',')];

    rows.forEach((r) => {
      const prof = (r.members && r.members.profiles) || {};
      const days = this._ageDays(r);
      const cells = [
        this._name(r),
        prof.email || '',
        prof.class_year != null ? String(prof.class_year) : '',
        r.invoice_type || '',
        r.period_start || '',
        r.period_end || '',
        r.amount_cents != null ? (r.amount_cents / 100).toFixed(2) : '',
        r.status || '',
        r.due_date || '',
        days > 0 ? String(days) : '0',
        this._ageBucket(days),
      ];
      lines.push(cells.map(this._csvCell).join(','));
    });

    const csv  = lines.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    const scope = this._state.compedOnly ? 'comped' : this._state.filter;
    a.href = url;
    a.download = 'camaa-dues-' + scope + '-' + stamp + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (btn) btn.disabled = false;
    showToast('Exported ' + rows.length + ' rows.', 'success');
  },

  // CSV-escape a cell; prefix '=+-@\t\r' with an apostrophe to defang CSV-injection
  // when the file is opened in a spreadsheet (member-supplied names can be hostile).
  _csvCell(value) {
    let s = value == null ? '' : String(value);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  },

  _label(token) {
    return String(token).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  },
};

window.Dues = Dues;
