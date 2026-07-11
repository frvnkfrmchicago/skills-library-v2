/**
 * MOREHOUSE CHICAGO ALUMNI — MEMBERSHIP PAGE
 * Lane E — mcaa-wave-002.
 *
 * Two responsibilities:
 *   1. MembershipPage.init() — public join page (membership.html).
 *      Renders PayPal Smart Buttons for Standard and Premium tiers and
 *      conditionally shows the member dues-status panel when the user is signed in.
 *   2. Member.start() — member portal (kept from wave-001; de-Stripe'd to PayPal).
 *      startDuesCheckout replaces the old Stripe redirect with a PayPal order.
 *
 * PayPal call (dues):
 *   supabaseClient.functions.invoke('paypal-checkout', {
 *     body: { purpose: 'dues', plan_id: '<uuid>' }
 *   })
 *   Response 200: { order_id, status:'CREATED', approve_url }
 *   -> paypal.Buttons({ createOrder: () => order_id, ... }).render(container)
 *
 * Non-billable guard (comped / lifetime / manual members and any $0 plan):
 *   paypal-checkout returns 400 { error:'MEMBER_NOT_BILLABLE' }.
 *   The CTA is replaced with a "no dues" note before the call is made.
 *
 * No Stripe. No client-set amounts. No innerHTML for user strings.
 */

/* ══════════════════════════════════════════════════════════════════════════════
 * Section 1 — MembershipPage: public join page + member dues panel
 * ══════════════════════════════════════════════════════════════════════════════ */

var MembershipPage = {
  _plans: [],         // active membership_plans rows loaded from Supabase
  _member: null,      // members row (signed-in user), or null
  _profile: null,     // profiles row (signed-in user), or null
  _invoices: [],      // dues_invoices for the signed-in member

  // Plan name → HTML element id for the PayPal button container.
  TIER_CONTAINERS: {
    standard: 'paypal-dues-standard',
    premium:  'paypal-dues-premium',
  },

  // Canonical plan names (matched case-insensitively against membership_plans.name).
  TIER_STANDARD_RE: /standard/i,
  TIER_PREMIUM_RE:  /premium/i,

  async init() {
    await this._loadPlans();
    this._renderPublicButtons();
    // Show member dues section only if the user is signed in and has a member record.
    if (window.Auth && window.Auth.getSession && window.Auth.getSession()) {
      await this._loadMemberState();
      this._renderDuesStatus();
    }
  },

  // ── Data loading ─────────────────────────────────────────────────────────

  async _loadPlans() {
    if (!window.supabaseClient) return;
    try {
      const res = await window.supabaseClient
        .from('membership_plans')
        .select('id, name, amount_cents, interval, benefits, active, sort_order')
        .eq('active', true)
        .order('sort_order', { ascending: true });
      // Hide $0 plans (comped marker) from the public join surface.
      this._plans = (res.data || []).filter(function (p) { return (p.amount_cents || 0) > 0; });
    } catch (_) {
      // No plans loaded — buttons stay in loading state; not a fatal page error.
    }
  },

  async _loadMemberState() {
    if (!window.supabaseClient) return;
    var client = window.supabaseClient;
    try {
      var profileId = this._profileId();
      if (!profileId) return;

      var profileRes = await client
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', profileId)
        .maybeSingle();
      this._profile = profileRes.data || null;

      var memberRes = await client
        .from('members')
        .select('id, membership_status, expires_at')
        .eq('profile_id', profileId)
        .maybeSingle();
      this._member = memberRes.data || null;

      if (this._member) {
        var invoicesRes = await client
          .from('dues_invoices')
          .select('id, status, amount_cents, due_date, period_end')
          .eq('member_id', this._member.id)
          .in('status', ['pending', 'overdue', 'payment_failed', 'action_required'])
          .order('due_date', { ascending: false });
        this._invoices = invoicesRes.data || [];
      }
    } catch (_) {
      // Non-fatal — dues status simply won't render.
    }
  },

  _profileId() {
    var s = window.Store && window.Store._session;
    return (s && s.user && s.user.id) || null;
  },

  // ── Public join — render PayPal buttons for Standard + Premium ────────────

  _renderPublicButtons() {
    var self = this;

    // Clear any "loading" placeholder text and render a PayPal button per tier.
    var standardPlan = this._findPlan(this.TIER_STANDARD_RE);
    var premiumPlan  = this._findPlan(this.TIER_PREMIUM_RE);

    if (standardPlan) {
      self._mountPayPalButton('paypal-dues-standard', standardPlan.id, 'paypal-dues-standard-loading');
    } else {
      self._showTierUnavailable('paypal-dues-standard', 'paypal-dues-standard-loading');
    }

    if (premiumPlan) {
      self._mountPayPalButton('paypal-dues-premium', premiumPlan.id, 'paypal-dues-premium-loading');
    } else {
      self._showTierUnavailable('paypal-dues-premium', 'paypal-dues-premium-loading');
    }
  },

  _findPlan(re) {
    for (var i = 0; i < this._plans.length; i++) {
      if (re.test(this._plans[i].name)) return this._plans[i];
    }
    return null;
  },

  _mountPayPalButton(containerId, planId, loadingId) {
    // Remove the loading placeholder.
    var loading = document.getElementById(loadingId);
    if (loading) loading.remove();

    var container = document.getElementById(containerId);
    if (!container) return;

    // PayPal SDK may still be loading (defer). Wait for it.
    if (typeof paypal === 'undefined') {
      // Retry once the script fires. The SDK fires window.onload or similar.
      var self = this;
      var attempts = 0;
      var interval = setInterval(function () {
        attempts++;
        if (typeof paypal !== 'undefined') {
          clearInterval(interval);
          self._buildButton(container, planId);
        } else if (attempts > 30) {
          clearInterval(interval);
          self._showPayPalUnavailable(container);
        }
      }, 500);
    } else {
      this._buildButton(container, planId);
    }
  },

  _buildButton(container, planId) {
    var self = this;
    // The button must sign the user in first (dues require JWT).
    // If not signed in, redirect to sign in before creating the order.
    paypal.Buttons({
      style: {
        layout: 'vertical',
        color:  'gold',
        shape:  'rect',
        label:  'pay',
      },

      createOrder: async function () {
        // Auth guard: dues require a JWT (server validates via supabase.auth.getUser).
        if (!window.supabaseClient) {
          showToast('Connect the chapter backend to enable checkout.', 'error');
          throw new Error('NOT_CONFIGURED');
        }

        var client = window.supabaseClient;

        // Re-validate session server-side before creating the order.
        var uRes = await client.auth.getUser();
        if (!uRes || !uRes.data || !uRes.data.user) {
          showToast('Please sign in to complete your membership purchase.', 'error');
          throw new Error('UNAUTHENTICATED');
        }

        // POST to paypal-checkout: plan_id only — amount is server-side.
        var result = await client.functions.invoke('paypal-checkout', {
          body: { purpose: 'dues', plan_id: planId }
        });
        var data  = result.data;
        var err   = result.error;

        if (err || !data || data.error) {
          var code = (data && data.error) || (err && err.message) || 'CHECKOUT_FAILED';
          showToast(
            code === 'MEMBER_NOT_BILLABLE'
              ? 'Your membership is complimentary — no payment needed.'
              : 'Could not start checkout. Please try again.',
            'error'
          );
          throw new Error(code);
        }

        return data.order_id; // PayPal captures THIS order
      },

      onApprove: async function () {
        showToast('Payment received. Your membership is being confirmed.', 'success');
        // Re-load member state after a brief delay so status reflects the webhook write.
        setTimeout(async function () {
          await self._loadMemberState();
          self._renderDuesStatus();
        }, 3000);
      },

      onCancel: function () {
        showToast('No payment was taken.', 'info');
      },

      onError: function () {
        showToast('PayPal could not complete the payment. Please try again.', 'error');
      },

    }).render(container);
  },

  _showTierUnavailable(containerId, loadingId) {
    var loading = document.getElementById(loadingId);
    if (loading) loading.remove();
    var container = document.getElementById(containerId);
    if (!container) return;
    var msg = document.createElement('p');
    msg.textContent = 'Online enrollment is being set up. Please use Zelle or check, or contact the chapter.';
    msg.style.fontSize = 'var(--text-sm)';
    msg.style.color = 'var(--color-text-secondary)';
    container.appendChild(msg);
  },

  _showPayPalUnavailable(container) {
    var msg = document.createElement('p');
    msg.textContent = 'Secure payment could not load. Please refresh or use Zelle/check.';
    msg.style.fontSize = 'var(--text-sm)';
    msg.style.color = 'var(--color-text-secondary)';
    container.appendChild(msg);
  },

  // ── Member dues status panel (shown only when signed in) ──────────────────

  _renderDuesStatus() {
    var section = document.getElementById('member-dues-section');
    var container = document.getElementById('member-dues-container');
    if (!section || !container) return;

    // Clear and rebuild with DOM nodes (no innerHTML for user strings).
    container.innerHTML = '';

    if (!this._member) {
      // Signed in but no chapter member record.
      section.style.display = 'block';
      var p = document.createElement('p');
      p.textContent = 'You are signed in but not yet a chapter member. Complete an online payment or send Zelle/check to join.';
      p.style.color = 'var(--color-text-secondary)';
      p.style.lineHeight = 'var(--leading-prose)';
      container.appendChild(p);
      return;
    }

    section.style.display = 'block';

    var m = this._member;

    // Status badge row.
    var statusRow = document.createElement('div');
    statusRow.style.cssText = 'display:flex;align-items:center;gap:var(--space-md);flex-wrap:wrap;margin-bottom:var(--space-lg)';

    var statusLabel = document.createElement('span');
    statusLabel.textContent = 'Status:';
    statusLabel.style.cssText = 'font-size:var(--text-sm);text-transform:uppercase;letter-spacing:var(--tracking-wider);color:var(--color-text-tertiary)';

    var badge = document.createElement('span');
    badge.className = 'status-badge ' + this._statusClass(m.membership_status);
    badge.textContent = m.membership_status || 'pending';

    statusRow.appendChild(statusLabel);
    statusRow.appendChild(badge);
    container.appendChild(statusRow);

    // Expiry.
    if (m.expires_at) {
      var expiry = document.createElement('p');
      expiry.style.cssText = 'color:var(--color-text-secondary);margin-bottom:var(--space-md)';
      var expiryDate = window.formatDateShort ? window.formatDateShort(m.expires_at) : m.expires_at;
      expiry.textContent = 'Membership renewal: ' + expiryDate;
      container.appendChild(expiry);
    }

    // Outstanding invoice callout.
    if (this._invoices.length > 0) {
      var inv = this._invoices[0];
      var callout = document.createElement('div');
      callout.style.cssText = 'padding:var(--space-md);border-radius:var(--radius-md);background:var(--color-warning-subtle);border:1px solid var(--color-warning);margin-bottom:var(--space-lg)';
      var calloutText = document.createElement('div');
      calloutText.style.fontWeight = '600';
      var amountStr = inv.amount_cents ? (' — ' + this._money(inv.amount_cents)) : '';
      calloutText.textContent = 'Dues due' + amountStr + (inv.due_date ? (' by ' + (window.formatDateShort ? window.formatDateShort(inv.due_date) : inv.due_date)) : '');
      callout.appendChild(calloutText);
      container.appendChild(callout);
    }

    // Non-billable members: no renew CTA.
    if (Member && Member.NON_BILLABLE && Member.NON_BILLABLE.includes(m.membership_status)) {
      var freeNote = document.createElement('p');
      freeNote.textContent = 'Your membership is complimentary — no dues to pay.';
      freeNote.style.cssText = 'font-size:var(--text-sm);color:var(--color-text-secondary)';
      container.appendChild(freeNote);
      return;
    }

    // Renew CTA — links down to the tier grid on the same page.
    var renewBtn = document.createElement('a');
    renewBtn.href = '#tiers-heading';
    renewBtn.className = 'btn btn--gold';
    renewBtn.textContent = m.membership_status === 'active' ? 'Renew my membership' : 'Activate my membership';
    container.appendChild(renewBtn);
  },

  _money(cents) {
    if (cents == null) return '';
    return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  },

  _statusClass(status) {
    if (['active', 'lifetime', 'comped'].includes(status)) return 'status-badge--approved';
    if (['lapsed', 'expired', 'suspended', 'past_due'].includes(status)) return 'status-badge--denied';
    return 'status-badge--pending';
  },
};

window.MembershipPage = MembershipPage;


/* ══════════════════════════════════════════════════════════════════════════════
 * Section 2 — Member: member portal (my-membership.html / membership.html auth-gated view)
 * Kept from wave-001. startDuesCheckout replaced: Stripe redirect → PayPal order.
 * ══════════════════════════════════════════════════════════════════════════════ */

var Member = {
  _data: {
    member: null,        // members row
    plans: [],           // active membership_plans
    invoices: [],        // dues_invoices
    payments: [],        // succeeded payments (receipts)
    registrations: [],   // event_registrations
    profile: null,       // profiles row
    loaded: false,
    error: null,
  },

  // Statuses that never get billed (comped/lifetime/manual).
  NON_BILLABLE: ['comped', 'lifetime', 'manual'],

  async start() {
    if (!window.Auth || !window.Auth.requireAuth()) return;
    this._renderLoading();
    await this._load();
    this.render();
    this._maybeShowPaymentResult();
  },

  _profileId() {
    return (window.Store && window.Store._session && window.Store._session.user
      && window.Store._session.user.id) || null;
  },

  /* ── data ─────────────────────────────────────────────────────────────── */

  async _load() {
    var d = this._data;
    d.error = null;
    var profileId = this._profileId();

    if (!window.supabaseClient || !profileId) {
      d.loaded = true;
      if (!window.supabaseClient) d.error = 'not_configured';
      return;
    }

    var client = window.supabaseClient;
    try {
      var profileRes = await client
        .from('profiles')
        .select('id, full_name, email, directory_visible, class_year')
        .eq('id', profileId)
        .maybeSingle();
      d.profile = profileRes.data || null;

      var memberRes = await client
        .from('members')
        .select('id, membership_status, chapter_role_title, joined_at, expires_at, class_year')
        .eq('profile_id', profileId)
        .maybeSingle();
      d.member = memberRes.data || null;

      var plansRes = await client
        .from('membership_plans')
        .select('id, name, amount_cents, interval, benefits, active, sort_order')
        .eq('active', true)
        .order('sort_order', { ascending: true });
      d.plans = (plansRes.data || []).filter(function (p) { return (p.amount_cents || 0) > 0; });

      if (d.member) {
        var memberId = d.member.id;

        var invoicesRes = await client
          .from('dues_invoices')
          .select('id, invoice_type, period_start, period_end, amount_cents, status, due_date, created_at')
          .eq('member_id', memberId)
          .order('due_date', { ascending: false });
        d.invoices = invoicesRes.data || [];

        var paymentsRes = await client
          .from('payments')
          .select('id, amount_cents, currency, purpose_type, designation, status, paid_at, created_at')
          .eq('member_id', memberId)
          .eq('status', 'succeeded')
          .order('paid_at', { ascending: false });
        d.payments = paymentsRes.data || [];
      }

      var regRes = await client
        .from('event_registrations')
        .select('id, status, payment_status, guest_count, created_at, events(title, event_date, location)')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
      d.registrations = regRes.data || [];

      d.loaded = true;
    } catch (e) {
      d.error = (e && e.message) || 'Could not load your membership.';
      d.loaded = true;
    }
  },

  /* ── small helpers ────────────────────────────────────────────────────── */

  _money(cents, currency) {
    if (cents == null) return '—';
    return (cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: (currency || 'usd').toUpperCase(),
    });
  },

  _statusClass(status) {
    if (['active', 'lifetime', 'comped'].includes(status)) return 'status-badge--approved';
    if (['lapsed', 'expired', 'suspended', 'past_due'].includes(status)) return 'status-badge--denied';
    return 'status-badge--pending';
  },

  _isNonBillable() {
    return this._data.member && this.NON_BILLABLE.includes(this._data.member.membership_status);
  },

  _h(tag, opts) {
    var el = document.createElement(tag);
    if (opts && opts.cls) el.className = opts.cls;
    if (opts && opts.text != null) el.textContent = opts.text;
    if (opts && opts.css) Object.assign(el.style, opts.css);
    return el;
  },

  /* ── render ───────────────────────────────────────────────────────────── */

  _renderLoading() {
    var c = document.getElementById('member-container');
    if (!c) return;
    c.innerHTML = '<p role="status" aria-live="polite" style="color:var(--color-text-tertiary)">Loading your membership…</p>';
  },

  render() {
    var c = document.getElementById('member-container');
    if (!c) return;
    var d = this._data;

    c.innerHTML = '';

    if (d.error === 'not_configured') {
      c.appendChild(this._notice('Your dashboard is ready.', 'Connect the chapter backend (js/config.js) to load your live dues, receipts, and events.'));
      return;
    }
    if (d.error) {
      c.appendChild(this._notice('Could not load your membership', 'Please refresh the page. If it keeps happening, contact the chapter.', 'error'));
      return;
    }

    var greet = this._h('div', { css: { marginBottom: 'var(--space-2xl)' } });
    var hello = this._h('h1', { cls: 'section-heading', css: { fontSize: 'var(--text-3xl)' } });
    var firstName = (d.profile && d.profile.full_name ? d.profile.full_name.split(/\s+/)[0] : 'Brother');
    hello.textContent = 'Welcome, ' + firstName;
    greet.appendChild(hello);
    c.appendChild(greet);

    if (!d.member) {
      c.appendChild(this._joinPrompt());
      c.appendChild(this._sectionTitle('My events'));
      c.appendChild(this._eventsBlock());
      return;
    }

    c.appendChild(this._statusCard());
    c.appendChild(this._sectionTitle('Receipts'));
    c.appendChild(this._receiptsBlock());
    c.appendChild(this._sectionTitle('My events'));
    c.appendChild(this._eventsBlock());
    c.appendChild(this._sectionTitle('Directory & privacy'));
    c.appendChild(this._privacyBlock());
  },

  _notice(title, body, kind) {
    var wrap = this._h('div', { cls: 'empty-state', css: { maxWidth: '560px' } });
    var icon = this._h('div', { cls: 'empty-state__icon', text: kind === 'error' ? '!' : 'i' });
    icon.setAttribute('aria-hidden', 'true');
    icon.style.fontSize = 'var(--text-3xl)';
    icon.style.color = kind === 'error' ? 'var(--color-error)' : 'var(--color-secondary)';
    wrap.appendChild(icon);
    wrap.appendChild(this._h('h3', { cls: 'empty-state__title', text: title }));
    wrap.appendChild(this._h('p', { cls: 'empty-state__text', text: body }));
    return wrap;
  },

  _sectionTitle(text) {
    return this._h('h2', {
      cls: 'section-heading',
      text: text,
      css: { fontSize: 'var(--text-2xl)', marginTop: 'var(--space-3xl)', marginBottom: 'var(--space-lg)' },
    });
  },

  // Status + renewal + PayPal dues CTA.
  _statusCard() {
    var d = this._data;
    var m = d.member;
    var card = this._h('div', { cls: 'glass-card', css: { padding: 'var(--space-2xl)', border: '1px solid var(--color-border)' } });

    var row = this._h('div', { css: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' } });
    var left = this._h('div');
    var label = this._h('div', { text: 'Membership status', css: { fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', color: 'var(--color-text-tertiary)' } });
    var badge = this._h('span', { cls: 'status-badge ' + this._statusClass(m.membership_status), text: m.membership_status || 'pending', css: { marginTop: 'var(--space-xs)', fontSize: 'var(--text-base)' } });
    left.appendChild(label); left.appendChild(badge);

    var right = this._h('div', { css: { textAlign: 'right' } });
    var renewLabel = this._h('div', { text: 'Next renewal', css: { fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', color: 'var(--color-text-tertiary)' } });
    var renewVal = this._h('div', { css: { fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: 'var(--text-lg)', marginTop: 'var(--space-xs)' } });
    renewVal.textContent = m.expires_at
      ? (window.formatDateShort ? window.formatDateShort(m.expires_at) : m.expires_at)
      : (this._isNonBillable() ? 'No renewal needed' : 'Not set');
    right.appendChild(renewLabel); right.appendChild(renewVal);

    row.appendChild(left); row.appendChild(right);
    card.appendChild(row);

    var open = d.invoices.find(function (i) {
      return ['pending', 'overdue', 'payment_failed', 'action_required'].includes(i.status);
    });
    if (open) {
      var due = this._h('div', { css: { marginTop: 'var(--space-lg)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', background: 'var(--color-warning-subtle)', border: '1px solid var(--color-warning)' } });
      due.appendChild(this._h('div', { text: 'Dues due: ' + this._money(open.amount_cents) + (open.due_date ? ('  ·  by ' + (window.formatDateShort ? window.formatDateShort(open.due_date) : open.due_date)) : ''), css: { fontWeight: '600' } }));
      card.appendChild(due);
    }

    card.appendChild(this._duesCta());
    return card;
  },

  // ── PayPal dues CTA (replaces Stripe redirect) ────────────────────────────
  _duesCta() {
    var d = this._data;
    var self = this;
    var wrap = this._h('div', { css: { marginTop: 'var(--space-xl)' } });

    if (this._isNonBillable()) {
      wrap.appendChild(this._h('p', { text: 'Your membership is complimentary — there are no dues to pay. Thank you for your service to the chapter.', css: { fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' } }));
      return wrap;
    }

    if (!d.plans.length) {
      wrap.appendChild(this._h('p', { text: 'Membership plans are being finalized by the board. Check back to renew.', css: { fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' } }));
      return wrap;
    }

    var heading = this._h('div', {
      text: d.member.membership_status === 'active' ? 'Renew or upgrade' : 'Activate your membership',
      css: { fontFamily: 'var(--font-heading)', fontWeight: '700', marginBottom: 'var(--space-md)' },
    });
    wrap.appendChild(heading);

    // One PayPal button per billable plan.
    var grid = this._h('div', { css: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 'var(--space-md)' } });

    d.plans.forEach(function (plan) {
      var tier = self._h('div', { css: { border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column' } });
      var name = self._h('div', { text: plan.name, css: { fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: 'var(--text-lg)' } });
      var price = self._h('div', { css: { color: 'var(--color-secondary)', fontWeight: '700', marginTop: 'var(--space-xs)' } });
      price.textContent = self._money(plan.amount_cents) + (plan.interval === 'year' ? ' / year' : plan.interval === 'month' ? ' / month' : '');
      tier.appendChild(name); tier.appendChild(price);

      var benefits = Array.isArray(plan.benefits) ? plan.benefits : [];
      if (benefits.length) {
        var ul = self._h('ul', { css: { listStyle: 'none', padding: '0', margin: 'var(--space-md) 0', flexGrow: '1' } });
        benefits.slice(0, 6).forEach(function (b) {
          var li = self._h('li', { css: { fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xs)' } });
          li.textContent = '· ' + b;
          ul.appendChild(li);
        });
        tier.appendChild(ul);
      }

      // PayPal button container for this plan.
      var btnContainer = self._h('div', { css: { marginTop: 'auto', minHeight: '55px' } });
      btnContainer.id = 'paypal-renew-' + plan.id;
      tier.appendChild(btnContainer);
      grid.appendChild(tier);

      // Mount PayPal button for this plan (uses startDuesCheckout logic).
      self.startDuesCheckout(plan.id, btnContainer);
    });

    wrap.appendChild(grid);

    var trustLine = self._h('p', {
      text: 'Secure checkout by PayPal. Morehouse Chicago does not see your card details. PayPal emails your receipt.',
      css: { fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-md)' },
    });
    wrap.appendChild(trustLine);

    return wrap;
  },

  // Render a PayPal button into the provided container (or element id string).
  // Sends plan_id ONLY — the amount is always resolved server-side (§9 #6).
  startDuesCheckout(planId, containerOrId) {
    var self = this;
    var container = (typeof containerOrId === 'string')
      ? document.getElementById(containerOrId)
      : containerOrId;
    if (!container) return;

    if (this._isNonBillable()) {
      var msg = this._h('p', {
        text: 'Your membership is complimentary — no payment needed.',
        css: { fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' },
      });
      container.appendChild(msg);
      return;
    }

    // If the PayPal SDK is not yet available, wait for it.
    if (typeof paypal === 'undefined') {
      var attempts = 0;
      var interval = setInterval(function () {
        attempts++;
        if (typeof paypal !== 'undefined') {
          clearInterval(interval);
          self._buildDuesButton(container, planId);
        } else if (attempts > 30) {
          clearInterval(interval);
          var fallback = self._h('p', {
            text: 'Secure payment could not load. Please refresh the page or use Zelle/check.',
            css: { fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' },
          });
          container.appendChild(fallback);
        }
      }, 500);
    } else {
      this._buildDuesButton(container, planId);
    }
  },

  // Builds and renders a PayPal Smart Button for dues renewal.
  // Request body: { purpose: 'dues', plan_id: planId } — no amount.
  _buildDuesButton(container, planId) {
    var self = this;

    paypal.Buttons({
      style: {
        layout: 'vertical',
        color:  'gold',
        shape:  'rect',
        label:  'pay',
      },

      createOrder: async function () {
        if (!window.supabaseClient) {
          showToast('Connect the chapter backend to enable checkout.', 'error');
          throw new Error('NOT_CONFIGURED');
        }
        if (self._isNonBillable()) {
          showToast('Your membership is complimentary — no payment needed.', 'success');
          throw new Error('MEMBER_NOT_BILLABLE');
        }

        // Re-validate session server-side.
        var uRes = await window.supabaseClient.auth.getUser();
        if (!uRes || !uRes.data || !uRes.data.user) {
          showToast('Your session expired. Please sign in again.', 'error');
          throw new Error('UNAUTHENTICATED');
        }

        // POST to paypal-checkout — plan_id only; amount is server-side.
        var result = await window.supabaseClient.functions.invoke('paypal-checkout', {
          body: { purpose: 'dues', plan_id: planId }
        });
        var data = result.data;
        var err  = result.error;

        if (err || !data || data.error) {
          var code = (data && data.error) || (err && err.message) || 'CHECKOUT_FAILED';
          showToast(
            code === 'MEMBER_NOT_BILLABLE'
              ? 'Your membership is complimentary — no payment needed.'
              : 'Could not start checkout. Please try again.',
            'error'
          );
          throw new Error(code);
        }

        return data.order_id;
      },

      onApprove: async function () {
        showToast('Payment received. Your membership is being updated.', 'success');
        // Re-fetch member state; the webhook writes the authoritative update.
        setTimeout(async function () {
          await self._load();
          self.render();
        }, 3000);
      },

      onCancel: function () {
        showToast('No payment was taken.', 'info');
      },

      onError: function () {
        showToast('PayPal could not complete the payment.', 'error');
      },

    }).render(container);
  },

  _joinPrompt() {
    var wrap = this._h('div', { cls: 'glass-card', css: { padding: 'var(--space-2xl)', border: '1px solid var(--color-border)' } });
    wrap.appendChild(this._h('h2', { cls: 'section-heading', text: 'Become a chapter member', css: { fontSize: 'var(--text-2xl)' } }));
    wrap.appendChild(this._h('p', { text: 'You are signed in, but you are not yet an active chapter member. Join to access the directory, register for members-only events, and support the chapter.', css: { color: 'var(--color-text-secondary)', marginTop: 'var(--space-sm)' } }));
    var cta = this._h('a', { cls: 'btn btn--gold btn--lg', text: 'View membership options', css: { marginTop: 'var(--space-lg)', display: 'inline-block' } });
    cta.href = 'membership.html';
    wrap.appendChild(cta);
    return wrap;
  },

  _receiptsBlock() {
    var d = this._data;
    var self = this;
    if (!d.payments.length) {
      return this._notice('No receipts yet', 'Your payment receipts will appear here after your first dues payment or donation.');
    }
    var list = this._h('div', { css: { display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' } });
    d.payments.forEach(function (p) {
      var row = self._h('div', { css: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap' } });
      var left = self._h('div');
      var purpose = self._h('div', { css: { fontWeight: '600' } });
      var purposeLabel = ({ dues: 'Annual dues', donation: 'Donation', event_ticket: 'Event ticket', sponsorship: 'Sponsorship' })[p.purpose_type] || 'Payment';
      purpose.textContent = purposeLabel + (p.designation ? ('  ·  ' + p.designation) : '');
      var when = self._h('div', { css: { fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' } });
      when.textContent = p.paid_at ? (window.formatDate ? window.formatDate(p.paid_at) : p.paid_at) : '';
      left.appendChild(purpose); left.appendChild(when);
      var amount = self._h('div', { text: self._money(p.amount_cents, p.currency), css: { fontFamily: 'var(--font-heading)', fontWeight: '700', color: 'var(--color-secondary)' } });
      row.appendChild(left); row.appendChild(amount);
      list.appendChild(row);
    });
    return list;
  },

  _eventsBlock() {
    var d = this._data;
    var self = this;
    if (!d.registrations.length) {
      var wrap = this._notice('No event registrations', 'When you register for chapter events, they will show up here.');
      var cta = this._h('a', { cls: 'btn btn--secondary', text: 'Browse events', css: { marginTop: 'var(--space-md)', display: 'inline-block' } });
      cta.href = 'events.html';
      wrap.appendChild(cta);
      return wrap;
    }
    var grid = this._h('div', { css: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 'var(--space-md)' } });
    d.registrations.forEach(function (r) {
      var evt = r.events || {};
      var card = self._h('div', { cls: 'glass-card', css: { padding: 'var(--space-lg)', border: '1px solid var(--color-border)' } });
      var date = self._h('div', { css: { fontSize: 'var(--text-xs)', color: 'var(--color-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' } });
      date.textContent = evt.event_date ? (window.formatDateShort ? window.formatDateShort(evt.event_date) : evt.event_date) : '';
      var title = self._h('div', { css: { fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: 'var(--text-lg)', margin: 'var(--space-xs) 0' } });
      title.textContent = evt.title || 'Event';
      var statusRow = self._h('div', { css: { display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap', marginTop: 'var(--space-sm)' } });
      var st = self._h('span', { cls: 'status-badge ' + self._regStatusClass(r.status), text: r.status });
      statusRow.appendChild(st);
      if (r.payment_status && r.payment_status !== 'not_required') {
        var pay = self._h('span', { cls: 'status-badge ' + (r.payment_status === 'paid' ? 'status-badge--approved' : 'status-badge--pending'), text: r.payment_status });
        statusRow.appendChild(pay);
      }
      card.appendChild(date); card.appendChild(title); card.appendChild(statusRow);
      grid.appendChild(card);
    });
    return grid;
  },

  _regStatusClass(status) {
    if (['approved', 'checked_in'].includes(status)) return 'status-badge--approved';
    if (['cancelled'].includes(status)) return 'status-badge--denied';
    return 'status-badge--pending';
  },

  _privacyBlock() {
    var d = this._data;
    var self = this;
    var card = this._h('div', { cls: 'glass-card', css: { padding: 'var(--space-xl)', border: '1px solid var(--color-border)' } });
    var visible = !!(d.profile && d.profile.directory_visible);

    var row = this._h('label', { css: { display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)', cursor: 'pointer' } });
    var cb = this._h('input');
    cb.type = 'checkbox';
    cb.checked = visible;
    cb.id = 'directory-visible-toggle';
    cb.style.marginTop = '4px';
    cb.style.width = '20px';
    cb.style.height = '20px';

    var text = this._h('div');
    text.appendChild(this._h('div', { text: 'Show me in the member directory', css: { fontWeight: '600' } }));
    text.appendChild(this._h('div', { text: 'When on, other signed-in members can see your name, class year, chapter role, bio, and LinkedIn. When off (the default), you are hidden from peers. Your information is never public.', css: { fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-xs)' } }));

    row.appendChild(cb); row.appendChild(text);
    card.appendChild(row);

    cb.addEventListener('change', async function () {
      cb.disabled = true;
      var next = cb.checked;
      var result = await window.supabaseClient
        .from('profiles')
        .update({ directory_visible: next, updated_at: new Date().toISOString() })
        .eq('id', self._profileId());
      cb.disabled = false;
      if (result.error) {
        cb.checked = !next;
        showToast(result.error.message || 'Could not update visibility.', 'error');
        return;
      }
      if (d.profile) d.profile.directory_visible = next;
      showToast(next ? 'You now appear in the directory.' : 'You are hidden from the directory.', 'success');
    });

    return card;
  },

  // Show a toast when returning from a PayPal payment (?payment=success|cancelled).
  _maybeShowPaymentResult() {
    var params = new URLSearchParams(window.location.search);
    var r = params.get('payment') || params.get('checkout');
    if (r === 'success') showToast('Payment received. Your membership will update once payment is confirmed.', 'success');
    else if (r === 'cancelled') showToast('Checkout cancelled. No payment was taken.', 'info');
    if (r) {
      params.delete('payment');
      params.delete('checkout');
      var qs = params.toString();
      window.history.replaceState({}, '', window.location.pathname + (qs ? '?' + qs : ''));
    }
  },
};

window.Member = Member;
