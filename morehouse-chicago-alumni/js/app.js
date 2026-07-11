/**
 * MOREHOUSE ALUMNI — APP CORE
 * 2026 Premium: IntersectionObserver for reveals, counter animations,
 * mobile nav, gallery upload handler, donation interactions
 */

const App = {
  // Lane 1 FIRST-TOUCH (mcaa-wave-001, data-contract §10): init is now async and
  // AWAITS Store.init() before any render so grids hydrate from the cache/Supabase
  // instead of painting empty. Auth.init() wires the session + onAuthStateChange.
  async init() {
    await Store.init();
    if (window.Auth) await Auth.init();
    this.initNav();
    this.initScrollReveals();
    this.initDonation();
    this.initGalleryUpload();
    if (window.Auth) Auth.updateNavForSession();
  },

  // ─── NAV ───
  initNav() {
    const btn = document.getElementById('menu-btn');
    const links = document.getElementById('nav-links');
    if (btn && links) {
      btn.addEventListener('click', () => {
        links.classList.toggle('nav__links--open');
        btn.textContent = links.classList.contains('nav__links--open') ? '\u2715' : '\u2630';
      });
      // Close on link click (mobile)
      links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          links.classList.remove('nav__links--open');
          btn.textContent = '\u2630';
        });
      });
    }
    // Nav blur on scroll
    const nav = document.getElementById('main-nav');
    if (nav) {
      window.addEventListener('scroll', () => {
        nav.classList.toggle('nav--scrolled', window.scrollY > 60);
      }, { passive: true });
    }
  },

  // ─── SCROLL REVEALS — IntersectionObserver w/ stagger ───
  initScrollReveals() {
    const revealClasses = ['.slide-in-left', '.slide-in-right', '.slide-in-up', '.scale-reveal', '.stagger-item', '.stat-animate', '.line-draw', '.accent-border-grow'];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // If it has data-count, animate the number
          if (entry.target.dataset.count) {
            this.animateCount(entry.target, parseInt(entry.target.dataset.count));
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealClasses.forEach(cls => {
      document.querySelectorAll(cls).forEach(el => observer.observe(el));
    });
  },

  // ─── COUNTER ANIMATION ───
  animateCount(el, target, duration = 1500) {
    const start = performance.now();
    const prefix = target >= 1000 ? '$' : '';
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      let current = Math.round(eased * target);
      if (prefix) {
        el.textContent = prefix + current.toLocaleString();
      } else {
        el.textContent = current;
      }
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  // ─── DONATION AMOUNTS ───
  // Single amount-chip group on the homepage support card. Tracks the active chip
  // and keeps aria-pressed in sync for assistive tech (WCAG 2.2 / older users).
  // The selected dollar value is read by the PayPal donate button (HomePage below).
  initDonation() {
    const chips = document.querySelectorAll('.donate-amount');
    chips.forEach(btn => {
      if (btn.dataset.donateWired === 'true') return; // idempotent: avoid double listeners
      btn.dataset.donateWired = 'true';
      btn.addEventListener('click', () => {
        chips.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        const custom = document.getElementById('donate-custom');
        if (custom) custom.value = btn.dataset.amount || '';
      });
    });
  },

  // ─── GALLERY UPLOAD — Supabase Storage ───
  // Lane 6 second-touch (mcaa-wave-001, data-contract §10/§11).
  // Lane 1 first-touch (async App.init / Store.init) confirmed present above.
  // Replaces the FileReader/dataURL path with a real Supabase Storage upload.
  // Bucket: 'gallery' (public). Path: gallery/<userId>/<timestamp>-<filename>
  // Falls back gracefully when supabaseClient is not yet initialised (e.g.
  // config.js not loaded) so pages without a gallery never error.
  initGalleryUpload() {
    const uploadZone = document.getElementById('gallery-upload');
    const fileInput  = document.getElementById('gallery-file-input');
    if (!uploadZone || !fileInput) return;

    // Accessibility: the upload zone is a div — make it keyboard-activatable.
    uploadZone.setAttribute('role', 'button');
    uploadZone.setAttribute('tabindex', '0');
    if (!uploadZone.getAttribute('aria-label')) {
      uploadZone.setAttribute('aria-label', 'Upload a gallery photo');
    }
    uploadZone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });

    uploadZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file type and size (5 MB cap) before sending to Storage.
      const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      const MAX_BYTES = 5 * 1024 * 1024;
      if (!ALLOWED_TYPES.includes(file.type)) {
        App._galleryStatus('Only JPEG, PNG, WebP, and GIF images are accepted.', 'error');
        fileInput.value = '';
        return;
      }
      if (file.size > MAX_BYTES) {
        App._galleryStatus('Image must be 5 MB or smaller.', 'error');
        fileInput.value = '';
        return;
      }

      // Guard: supabaseClient must exist (Lane 1 store.js wires it).
      if (!window.supabaseClient) {
        App._galleryStatus('Upload unavailable — storage not initialised.', 'error');
        return;
      }

      // Determine upload path: authenticated users get their own folder.
      const session = window.Store ? Store._session : null;
      const userId  = session?.user?.id || 'anonymous';
      const ext     = file.name.split('.').pop().toLowerCase();
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const storagePath = `gallery/${userId}/${safeName}`;

      // Disable UI during upload.
      uploadZone.setAttribute('aria-busy', 'true');
      App._galleryStatus('Uploading…', 'info');

      const { data, error } = await window.supabaseClient
        .storage
        .from('gallery')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      uploadZone.setAttribute('aria-busy', 'false');
      fileInput.value = ''; // reset so the same file can be re-selected

      if (error) {
        // Surface the error without leaking internal Supabase details.
        const msg = error.message || 'Upload failed. Please try again.';
        App._galleryStatus(msg, 'error');
        return;
      }

      // Retrieve the public URL for the just-uploaded object.
      const { data: urlData } = window.supabaseClient
        .storage
        .from('gallery')
        .getPublicUrl(data.path);

      const publicUrl = urlData?.publicUrl || '';

      if (!publicUrl) {
        App._galleryStatus('Upload succeeded but URL could not be resolved.', 'error');
        return;
      }

      // Add to the in-memory Gallery store and re-render.
      if (window.Gallery) {
        Gallery.add({
          src: publicUrl,
          caption: file.name.replace(/\.[^.]+$/, ''),
          uploadedBy: 'Member Upload',
          featured: false,
          storagePath,  // retained for potential future delete support
        });
      }
      if (typeof renderGallery === 'function') renderGallery();
      App._galleryStatus('Photo uploaded.', 'success');
    });
  },

  // ─── GALLERY STATUS HELPER ───
  // Lightweight status message for the gallery upload zone.
  // Uses the existing toast infrastructure if available; otherwise console.
  _galleryStatus(message, level) {
    // level: 'info' | 'success' | 'error'
    const zone = document.getElementById('gallery-upload');
    if (zone) {
      const existing = zone.querySelector('.gallery-upload__status');
      const el = existing || document.createElement('span');
      el.className = 'gallery-upload__status';
      // textContent — no innerHTML (data-contract §9 #7)
      el.textContent = message;
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      if (!existing) zone.appendChild(el);
      // Auto-clear success/info messages
      if (level !== 'error') {
        setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 4000);
      }
    }
  },
};

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());

window.App = App;

/* ═══════════════════════════════════════════════════════════════════════════
 * HOMEPAGE CONTROLLER (Lane D — mcaa-wave-002)
 * Turns index.html into a ROUTER, not a brochure. Runs ONLY on the homepage
 * (guarded on the markers below) so the shared app.js stays safe on every other
 * page. The shared shell (Lane A, js/shell.js) owns the nav + footer; this
 * controller owns the homepage body: the "What's Happening" strip (next event +
 * live news + scholarships), the conditional sign-in / welcome panel, and the
 * PayPal donation buttons (Lane B seam).
 *
 * Accessibility (dossier Dim 3 + WCAG 2.2 / evidence-contract G5): every dynamic
 * value is written with textContent or built as DOM nodes — NO innerHTML for any
 * feed/user-controlled string. esc()/safeUrl() remain as defense-in-depth on the
 * one place a URL is interpolated (href), matching the repo's hardening rule.
 *
 * Skills: ux-designing, flow-designing, frontend-architecting, copywriting-enforcing.
 * ═══════════════════════════════════════════════════════════════════════════ */
const HomePage = (function () {
  'use strict';

  // Defense-in-depth helpers (data-contract §9 #8). DOM build is primary; these
  // guard the single href interpolation and any future string-to-attribute path.
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = (u) => {
    const s = String(u == null ? '' : u).trim();
    return /^(javascript|data|vbscript):/i.test(s) ? '#' : s;
  };

  function el(tag, attrs, text) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        if (k === 'class') node.className = attrs[k];
        else if (attrs[k] != null) node.setAttribute(k, attrs[k]);
      });
    }
    if (text != null) node.textContent = text; // textContent — never innerHTML
    return node;
  }
  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); }

  function fmtDateShort(d) {
    if (window.formatDateShort) { try { return window.formatDateShort(d); } catch (_) {} }
    return String(d || '');
  }
  function fmtTime(t) {
    if (window.formatTime) { try { return window.formatTime(t); } catch (_) {} }
    return String(t || '');
  }

  // ── Next event: first future-dated event from the Store cache (live or seed) ──
  function nextEvent() {
    try {
      const keys = window.STORAGE_KEYS || {};
      const events = (window.Store && window.Store.get)
        ? window.Store.get(keys.EVENTS || 'mca_events') : null;
      if (!Array.isArray(events) || !events.length) return null;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const upcoming = events
        .filter((e) => e && e.date)
        .map((e) => ({ e, t: new Date(e.date + 'T00:00:00').getTime() }))
        .filter((x) => !isNaN(x.t) && x.t >= today.getTime())
        .sort((a, b) => a.t - b.t);
      return upcoming.length ? upcoming[0].e : null;
    } catch (_) { return null; }
  }

  function renderNextEvent() {
    const host = document.getElementById('home-next-event');
    if (!host) return;
    clear(host);
    const ev = nextEvent();
    if (!ev) {
      host.appendChild(el('h3', { class: 'happening-card__title', id: 'happening-event-title' },
        'New events are on the way'));
      host.appendChild(el('p', { class: 'happening-card__text' },
        'The chapter calendar updates as gatherings are scheduled. Check back soon.'));
      return;
    }
    const when = fmtDateShort(ev.date) + (ev.time ? ' · ' + fmtTime(ev.time) : '');
    host.appendChild(el('p', { class: 'happening-card__date' }, when));
    const title = el('h3', { class: 'happening-card__title', id: 'happening-event-title' }, ev.title || 'Chapter event');
    host.appendChild(title);
    if (ev.location) {
      host.appendChild(el('p', { class: 'happening-card__text' }, String(ev.location).split(',')[0]));
    }
    // Whole card routes to the event when we have an id.
    if (ev.id) {
      const link = el('a', {
        class: 'happening-card__cta',
        href: 'event-detail.html?id=' + encodeURIComponent(ev.id)
      }, 'See details');
      host.appendChild(link);
    }
  }

  // ── Latest news: live content_items (4 latest), HBCU_NEWS fallback ──
  async function loadLatestNews() {
    const configured = !!window.SUPABASE_CONFIGURED && !!window.supabaseClient;
    if (configured) {
      try {
        const { data, error } = await window.supabaseClient
          .from('content_items')
          .select('id, title, summary, url, source_platform, source_date, published_at, approval_status, is_featured')
          .in('approval_status', ['approved', 'auto_approved'])
          .order('published_at', { ascending: false })
          .limit(4);
        if (!error && Array.isArray(data) && data.length) {
          return data.map((i) => ({
            title: i.title,
            url: i.url,
            source: formatPlatform(i.source_platform),
            date: i.source_date || i.published_at
          }));
        }
      } catch (e) {
        console.warn('HomePage: live news read failed; using fallback.', e);
      }
    }
    // Fallback: static HBCU_NEWS (window global from store.js), 4 latest.
    const fb = Array.isArray(window.HBCU_NEWS) ? window.HBCU_NEWS.slice(0, 4) : [];
    return fb.map((n) => ({ title: n.title, url: n.url, source: n.source, date: n.date }));
  }

  function formatPlatform(p) {
    if (!p) return 'Morehouse News';
    const MAP = {
      morehouse_web: 'Morehouse College', morehouse_news: 'Morehouse News',
      morehouse_events: 'Morehouse Events', instagram: 'Instagram', linkedin: 'LinkedIn',
      national: 'National Alumni', chapter: 'Chapter', other: 'Source'
    };
    return MAP[p] || String(p).replace(/_/g, ' ');
  }

  function renderNews(items) {
    const list = document.getElementById('home-news-list');
    if (!list) return;
    clear(list);
    list.setAttribute('aria-busy', 'false');
    if (!items.length) {
      const li = el('li', { class: 'happening-news__loading' }, 'News will appear here soon.');
      list.appendChild(li);
      return;
    }
    items.forEach((n) => {
      const li = el('li', { class: 'happening-news__item' });
      const a = el('a', {
        class: 'happening-news__link',
        href: esc(safeUrl(n.url)),
        target: '_blank', rel: 'noopener noreferrer'
      });
      a.appendChild(el('span', { class: 'happening-news__title' }, n.title || 'Untitled'));
      const meta = (n.source || '') + (n.date ? ' · ' + fmtDateShort(n.date) : '');
      if (meta.trim()) a.appendChild(el('span', { class: 'happening-news__meta' }, meta));
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  // ── Conditional panel: signed-out invite vs. signed-in welcome ──
  function accountName() {
    const s = window.Store && window.Store._session;
    const u = s && s.user;
    if (!u) return '';
    const meta = u.user_metadata || {};
    return meta.full_name || meta.name || '';
  }

  function renderAccountPanel() {
    const panel = document.getElementById('account-panel');
    if (!panel) return;
    clear(panel);
    const signedIn = !!(window.Auth && window.Auth.isSignedIn && window.Auth.isSignedIn());

    if (signedIn) {
      panel.classList.add('account-panel--member');
      const name = accountName();
      panel.appendChild(el('p', { class: 'hero__eyebrow' }, 'Signed in'));
      panel.appendChild(el('h2', {
        class: 'section-heading account-panel__heading', id: 'account-panel-title'
      }, name ? ('Welcome back, ' + name.split(' ')[0]) : 'Welcome back'));
      panel.appendChild(el('p', { class: 'section-subheading' },
        'Pick up where you left off — your dashboard, membership, and the alumni directory.'));
      const row = el('div', { class: 'account-panel__actions' });
      row.appendChild(el('a', { class: 'btn btn--gold btn--lg', href: 'dashboard.html' }, 'Go to my dashboard'));
      row.appendChild(el('a', { class: 'btn btn--secondary btn--lg', href: 'my-membership.html' }, 'My membership'));
      row.appendChild(el('a', { class: 'btn btn--ghost btn--lg', href: 'directory.html' }, 'Alumni directory'));
      panel.appendChild(row);
    } else {
      panel.classList.remove('account-panel--member');
      panel.appendChild(el('p', { class: 'hero__eyebrow' }, 'Members'));
      panel.appendChild(el('h2', {
        class: 'section-heading account-panel__heading', id: 'account-panel-title'
      }, 'Already a member?'));
      panel.appendChild(el('p', { class: 'section-subheading' },
        'Sign in to renew your dues, register for events, and reach the alumni directory. ' +
        'New to the chapter? Joining is quick.'));
      const row = el('div', { class: 'account-panel__actions' });
      row.appendChild(el('a', { class: 'btn btn--gold btn--lg', href: 'signin.html' }, 'Sign in'));
      row.appendChild(el('a', { class: 'btn btn--secondary btn--lg', href: 'membership.html' }, 'Join the chapter'));
      panel.appendChild(row);
    }
  }

  // ── PayPal donation buttons (Lane B seam — docs/payment-contract-paypal.md §3) ──
  // Amount is donor-chosen here (donation flow) but the Edge Function clamps it
  // server-side to [$5, $50,000]; createOrder returns a server-trusted order_id.
  function selectedDonationCents() {
    const card = document.getElementById('donate-amounts') || document;
    const active = card.querySelector('.donate-amount.active') || card.querySelector('.donate-amount');
    const dollars = active ? parseInt(active.dataset.amount, 10) : NaN;
    return (!dollars || dollars < 1) ? 0 : dollars * 100;
  }

  function showToast(message, type) {
    const ex = document.querySelector('.toast'); if (ex) ex.remove();
    const t = document.createElement('div');
    t.className = 'toast toast--' + (type || 'success');
    t.setAttribute('role', 'status');
    t.setAttribute('aria-live', 'polite');
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }

  function initDonateButtons() {
    const container = document.getElementById('paypal-button-container');
    const unavailable = document.getElementById('donate-unavailable');
    const ready = !!(window.paypal && window.paypal.Buttons) &&
                  !!window.SUPABASE_CONFIGURED && !!window.supabaseClient;

    if (!ready) {
      // No live SDK or backend yet — point people to the full giving page.
      if (unavailable) unavailable.hidden = false;
      if (container) container.hidden = true;
      return;
    }
    if (unavailable) unavailable.hidden = true;
    if (container) { container.hidden = false; clear(container); }

    window.paypal.Buttons({
      // createOrder calls OUR Edge Function — the amount is server-trusted/clamped.
      createOrder: async () => {
        const amount_cents = selectedDonationCents();
        if (!amount_cents) { showToast('Choose a donation amount first.', 'error'); throw new Error('NO_AMOUNT'); }
        const { data, error } = await window.supabaseClient.functions.invoke(
          'paypal-checkout',
          { body: { purpose: 'donation', amount_cents, designation: 'scholarship' } }
        );
        if (error || !data || data.error) {
          const code = (data && data.error) || (error && error.message) || 'CHECKOUT_FAILED';
          showToast(code === 'AMOUNT_OUT_OF_RANGE'
            ? 'Please choose an amount between $5 and $50,000.'
            : 'Could not start checkout. Please try again.', 'error');
          throw new Error(code);
        }
        return data.order_id; // PayPal captures THIS order; webhook is source of truth.
      },
      onApprove: async () => {
        showToast('Thank you. Your gift to the scholarship fund was received.', 'success');
      },
      onCancel: () => showToast('No payment was taken.', 'info'),
      onError: () => showToast('PayPal could not complete the payment.', 'error')
    }).render('#paypal-button-container');
  }

  // ── Bootstrap (homepage only) ──
  async function init() {
    // Guard: only run on the router homepage.
    if (!document.getElementById('home-news-list') || !document.getElementById('site-header')) return;

    if (window.Store && window.Store.init) await window.Store.init();
    if (window.Auth && window.Auth.init) await window.Auth.init();

    // Shared shell owns nav + footer. Home gets NO breadcrumbs (top of the trail).
    if (window.Shell && window.Shell.render) window.Shell.render({ page: 'home' });

    // Amount chips (App.initDonation wires click/aria-pressed); then PayPal buttons.
    if (window.App && window.App.initDonation) window.App.initDonation();

    renderNextEvent();
    renderAccountPanel();
    renderNews(await loadLatestNews());
    initDonateButtons();

    // Re-render the panel (and repaint the shared nav) when auth changes. The shell
    // listens for 'shell:auth'; we dispatch it so its nav reflects sign-in/out too.
    if (window.Store && typeof window.Store.on === 'function') {
      window.Store.on('auth', () => {
        renderAccountPanel();
        try { window.dispatchEvent(new Event('shell:auth')); } catch (_) {}
      });
      // Repaint the Next Event card when events hydrate from Supabase.
      const keys = window.STORAGE_KEYS || {};
      if (keys.EVENTS) window.Store.on(keys.EVENTS, renderNextEvent);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
  return { init: init };
})();

window.HomePage = HomePage;
