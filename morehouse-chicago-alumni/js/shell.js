/**
 * MOREHOUSE CHICAGO ALUMNI — SHARED SHELL  (window.Shell)
 * Lane A (mcaa-wave-002). The one nav + footer + breadcrumb + announce bar +
 * skip link that EVERY page renders. Kills the four mismatched hand-rolled nav
 * copies the prior build carried (dossier Dimension 2).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PUBLIC API — page lanes call exactly this. Do not hand-roll nav markup.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   Shell.render({ page, breadcrumbs })
 *
 *   @param {Object}  opts
 *   @param {string}  opts.page          Route key for the current page. Drives the
 *                                        active nav item + aria-current="page".
 *                                        One of the keys in Shell.ROUTES, e.g.
 *                                        'home' | 'about' | 'events' | 'news' |
 *                                        'scholarships' | 'membership' | 'donate' |
 *                                        'signin' | 'dashboard' | 'directory' |
 *                                        'profile' | 'my-events' | 'my-membership' |
 *                                        'admin'. Unknown keys simply highlight
 *                                        nothing (safe).
 *   @param {Array=}  opts.breadcrumbs   Ordered trail for pages BELOW home. Each
 *                                        item: { label: string, href?: string }.
 *                                        The LAST item is the current page and is
 *                                        rendered as plain text (omit its href).
 *                                        Home is prepended automatically — do NOT
 *                                        include it. Pass [] or omit on the
 *                                        homepage to suppress breadcrumbs.
 *   @returns {Object} Shell             (chainable)
 *
 *   HOW A PAGE WIRES IN (page lanes own this part):
 *     <body>
 *       <div id="site-header"></div>          <!-- shell injects nav + announce + skip link -->
 *       <main id="main-content"> … page … </main>
 *       <div id="site-footer"></div>          <!-- shell injects the footer -->
 *       <script src="js/store.js"></script>
 *       <script src="js/auth.js"></script>
 *       <script src="js/shell.js"></script>
 *       <script>
 *         document.addEventListener('DOMContentLoaded', async () => {
 *           if (window.Store) await window.Store.init();
 *           if (window.Auth)  await window.Auth.init();
 *           Shell.render({
 *             page: 'events',
 *             breadcrumbs: [{ label: 'Events' }]   // Home is auto-prepended
 *           });
 *         });
 *       </script>
 *
 *   The skip link targets #main-content. Give your primary <main> that id (the
 *   shell falls back to <main> or the first landmark if the id is absent).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * AUTH STATES (read, never written, from window.Auth → cached Store session)
 *   public  — signed out: primary links + Donate + "Sign In"
 *   member  — signed in, role member: primary links + Donate + account menu
 *             (Dashboard / My Membership / Directory / My Profile / Sign Out)
 *   admin   — signed in, role admin|board: member menu + an "Admin" entry
 * Re-renders automatically on Supabase auth changes (Auth.updateNavForSession
 * fires; we also listen to a lightweight 'shell:auth' refresh + Store 'init').
 *
 * ACCESSIBILITY (dossier Dimension 3 + WCAG 2.2)
 *   - Skip link is the first focusable element (SC 2.4.1 Bypass Blocks).
 *   - <nav aria-label="Primary"> with aria-current="page" on the active link
 *     (SC 2.4.8 / 4.1.2).
 *   - Mobile drawer = focus-trapped dialog: focus moves in on open, Tab cycles,
 *     Escape closes, focus returns to the toggle (APG Dialog pattern).
 *   - Account menu closes on Escape + outside click; button exposes aria-expanded.
 *   - Breadcrumbs emit schema.org BreadcrumbList JSON-LD for SEO + assistive tech.
 *   - No innerHTML for event/feed/user strings — every dynamic value is set via
 *     textContent / DOM nodes (data-contract §9 #8; evidence-contract G5).
 *
 * NO external deps. Plain DOM. Safe to call render() more than once (idempotent —
 * it clears + repaints the two placeholders).
 */
(function () {
  'use strict';

  // ─── Routes: the single source of truth for nav labels + destinations ──────
  // Plain-English, older-user labels (dossier Dim 2). No A/B/C menus anywhere.
  var ROUTES = {
    home:           { label: 'Home',         href: 'index.html' },
    about:          { label: 'About',        href: 'about.html' },
    events:         { label: 'Events',       href: 'events.html' },
    news:           { label: 'News',         href: 'content.html' },
    scholarships:   { label: 'Scholarships', href: 'scholarships.html' },
    membership:     { label: 'Membership',   href: 'membership.html' },
    donate:         { label: 'Donate',       href: 'donate.html' },
    signin:         { label: 'Sign In',      href: 'signin.html' },
    // Member area (account menu).
    dashboard:      { label: 'Dashboard',     href: 'dashboard.html' },
    'my-membership':{ label: 'My Membership', href: 'my-membership.html' },
    directory:      { label: 'Alumni Directory', href: 'directory.html' },
    profile:        { label: 'My Profile',    href: 'profile.html' },
    'my-events':    { label: 'My Events',     href: 'my-events.html' },
    // Admin.
    admin:          { label: 'Admin',         href: 'admin.html' }
  };

  // Primary top-nav order (public-facing). Donate renders as a button, Sign In/
  // Account is the trailing action — both handled separately below.
  var PRIMARY = ['about', 'events', 'news', 'scholarships', 'membership'];

  // Account-menu order for signed-in members.
  var ACCOUNT_LINKS = ['dashboard', 'my-membership', 'directory', 'profile'];

  // ─── Footer columns (Dim 2 cross-linking) ──────────────────────────────────
  var FOOTER_CHAPTER = ['about', 'events', 'news', 'scholarships'];
  var FOOTER_MEMBERS = ['membership', 'donate', 'directory', 'signin'];
  // External link-outs (Dimension 5: plain <a> link-outs only — no widgets).
  // Placeholder hrefs are the public chapter destinations; the board swaps in the
  // real handles. target=_blank + rel=noopener noreferrer on every one.
  var FOOTER_EXTERNAL = [
    { label: 'Morehouse College',          href: 'https://www.morehouse.edu' },
    { label: 'National Alumni Association', href: 'https://morehousealumni.org' }
  ];
  var SOCIAL = [
    { label: 'Instagram', href: 'https://www.instagram.com/' },
    { label: 'Facebook',  href: 'https://www.facebook.com/' },
    { label: 'LinkedIn',  href: 'https://www.linkedin.com/' }
  ];

  var DISMISS_KEY = 'mcaa_announce_dismissed'; // sessionStorage: announcement id

  // ─── small DOM helpers (no innerHTML for data) ─────────────────────────────
  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'dataset') {
          Object.keys(attrs[k]).forEach(function (d) { node.dataset[d] = attrs[k][d]; });
        } else if (attrs[k] != null) node.setAttribute(k, attrs[k]);
      });
    }
    if (text != null) node.textContent = text; // always textContent — never innerHTML
    return node;
  }
  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); }

  // ─── auth read (window.Auth first; degrade to cached Store session) ─────────
  function authState() {
    var a = window.Auth;
    if (a && typeof a.isSignedIn === 'function') {
      if (!a.isSignedIn()) return 'public';
      return (typeof a.isAdmin === 'function' && a.isAdmin()) ? 'admin' : 'member';
    }
    // Fallback: read the cached Supabase session directly.
    var s = window.Store && window.Store._session;
    if (!s || !s.user) return 'public';
    var role = s.user.app_metadata && s.user.app_metadata.role;
    return (role === 'admin' || role === 'board') ? 'admin' : 'member';
  }

  function accountLabel() {
    var s = window.Store && window.Store._session;
    var u = s && s.user;
    if (!u) return 'Account';
    var meta = u.user_metadata || {};
    return meta.full_name || meta.name || u.email || 'Account';
  }
  function accountInitial() {
    var lbl = accountLabel();
    var ch = (lbl || 'A').trim().charAt(0);
    return ch ? ch.toUpperCase() : 'A';
  }

  // ─── next event for the announce bar (from Store cache; future-dated) ───────
  // Store.get(STORAGE_KEYS.EVENTS) returns { id, title, date, time, location } …
  // sorted ascending by date (store.js). We pick the first one not in the past.
  function nextEvent() {
    try {
      var keys = window.STORAGE_KEYS || {};
      var events = (window.Store && window.Store.get) ? window.Store.get(keys.EVENTS || 'mca_events') : null;
      if (!Array.isArray(events) || !events.length) return null;
      var today = new Date(); today.setHours(0, 0, 0, 0);
      var upcoming = events
        .filter(function (e) { return e && e.date; })
        .map(function (e) { return { e: e, t: new Date(e.date + 'T00:00:00').getTime() }; })
        .filter(function (x) { return !isNaN(x.t) && x.t >= today.getTime(); })
        .sort(function (a, b) { return a.t - b.t; });
      return upcoming.length ? upcoming[0].e : null;
    } catch (_) { return null; }
  }

  function formatEventDate(dateStr) {
    if (window.formatDate) { try { return window.formatDate(dateStr); } catch (_) {} }
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US',
        { weekday: 'long', month: 'long', day: 'numeric' });
    } catch (_) { return dateStr; }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDERERS
  // ═══════════════════════════════════════════════════════════════════════════

  function buildSkipLink() {
    var a = el('a', { class: 'skip-link', href: '#main-content' }, 'Skip to main content');
    a.addEventListener('click', function () {
      // Move real focus to the target so the next Tab continues from main.
      var target = document.getElementById('main-content') ||
                   document.querySelector('main');
      if (target) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus();
      }
    });
    return a;
  }

  function buildAnnounceBar() {
    var ev = nextEvent();
    if (!ev) return null;
    var announceId = 'evt-' + (ev.id || ev.date || ev.title || 'next');
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === announceId) return null;
    } catch (_) { /* sessionStorage may be unavailable; show the bar */ }

    var bar = el('div', {
      class: 'announce-bar', role: 'region', 'aria-label': 'Next chapter event'
    });
    bar.appendChild(el('span', { class: 'announce-bar__label' }, 'Next Event'));
    bar.appendChild(el('span', { class: 'announce-bar__text' },
      ev.title + ' · ' + formatEventDate(ev.date)));
    var href = ev.id ? ('event-detail.html?id=' + encodeURIComponent(ev.id)) : ROUTES.events.href;
    bar.appendChild(el('a', { class: 'announce-bar__link', href: href }, 'Details'));

    var dismiss = el('button', {
      class: 'announce-bar__dismiss', type: 'button', 'aria-label': 'Dismiss announcement'
    }, '×');
    dismiss.addEventListener('click', function () {
      try { sessionStorage.setItem(DISMISS_KEY, announceId); } catch (_) {}
      document.body.classList.remove('has-announce');
      document.documentElement.style.setProperty('--shell-offset', 'var(--nav-height)');
      if (bar.parentNode) bar.parentNode.removeChild(bar);
    });
    bar.appendChild(dismiss);
    return bar;
  }

  function navLink(routeKey, currentPage, cls) {
    var r = ROUTES[routeKey];
    if (!r) return null;
    var attrs = { class: cls || 'nav__link', href: r.href };
    if (routeKey === currentPage) attrs['aria-current'] = 'page';
    var a = el('a', attrs, r.label);
    if (routeKey === currentPage) a.classList.add('active');
    return a;
  }

  function buildAccountMenu(state, currentPage) {
    var wrap = el('div', { class: 'nav__account', dataset: { open: 'false' } });
    var btnId = 'shell-account-btn';
    var menuId = 'shell-account-menu';
    var btn = el('button', {
      class: 'nav__account-btn', type: 'button', id: btnId,
      'aria-haspopup': 'true', 'aria-expanded': 'false', 'aria-controls': menuId
    });
    btn.appendChild(el('span', { class: 'nav__account-avatar', 'aria-hidden': 'true' }, accountInitial()));
    btn.appendChild(el('span', { class: 'nav__account-name' }, accountLabel()));
    btn.appendChild(el('span', { class: 'nav__account-caret', 'aria-hidden': 'true' }, '▾'));
    wrap.appendChild(btn);

    var menu = el('div', { class: 'nav__menu', id: menuId, role: 'menu', 'aria-labelledby': btnId });
    ACCOUNT_LINKS.forEach(function (k) {
      var lnk = navLink(k, currentPage, 'nav__menu-link');
      if (lnk) { lnk.setAttribute('role', 'menuitem'); menu.appendChild(lnk); }
    });
    if (state === 'admin') {
      var adm = navLink('admin', currentPage, 'nav__menu-link');
      if (adm) { adm.setAttribute('role', 'menuitem'); menu.appendChild(adm); }
    }
    menu.appendChild(el('hr', { class: 'nav__menu-sep' }));
    var out = el('button', { class: 'nav__menu-link', type: 'button', role: 'menuitem' }, 'Sign Out');
    out.addEventListener('click', signOut);
    menu.appendChild(out);
    wrap.appendChild(menu);

    function setOpen(open) {
      wrap.dataset.open = open ? 'true' : 'false';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(wrap.dataset.open !== 'true');
    });
    // Outside-click + Escape close. The handlers self-detach once this menu node
    // leaves the DOM (a later Shell.render() replaces it), so repeated renders do
    // not accumulate live listeners.
    function onDocClick(e) {
      if (!document.contains(wrap)) { document.removeEventListener('click', onDocClick); return; }
      if (wrap.dataset.open === 'true' && !wrap.contains(e.target)) setOpen(false);
    }
    function onDocKey(e) {
      if (!document.contains(wrap)) { document.removeEventListener('keydown', onDocKey); return; }
      if (e.key === 'Escape' && wrap.dataset.open === 'true') { setOpen(false); btn.focus(); }
    }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onDocKey);
    return wrap;
  }

  function buildNav(state, currentPage) {
    var header = el('header', { class: 'nav', id: 'main-nav' });
    var inner = el('div', { class: 'nav__inner' });

    // Brand
    var brand = el('a', { class: 'nav__brand', href: ROUTES.home.href, 'aria-label': 'Chicago Area Morehouse College Alumni Association — home' });
    var logo = el('span', { class: 'nav__logo' });
    logo.appendChild(document.createTextNode('MOREHOUSE '));
    logo.appendChild(el('span', { class: 'nav__logo-accent' }, 'CHICAGO'));
    brand.appendChild(logo);
    inner.appendChild(brand);

    // Primary nav (desktop)
    var nav = el('nav', { class: 'nav__group', 'aria-label': 'Primary' });
    var ul = el('ul', { class: 'nav__links', id: 'nav-links' });
    PRIMARY.forEach(function (k) {
      var li = el('li');
      var lnk = navLink(k, currentPage);
      if (lnk) { li.appendChild(lnk); ul.appendChild(li); }
    });
    nav.appendChild(ul);
    inner.appendChild(nav);

    // Trailing actions: Donate (button) + Sign In / Account
    var actions = el('div', { class: 'nav__actions' });
    actions.appendChild(el('a', { class: 'btn btn--gold btn--sm nav__cta', href: ROUTES.donate.href }, 'Donate'));
    if (state === 'public') {
      actions.appendChild(el('a', { class: 'btn btn--secondary btn--sm', href: ROUTES.signin.href }, 'Sign In'));
    } else {
      actions.appendChild(buildAccountMenu(state, currentPage));
    }
    inner.appendChild(actions);

    // Hamburger (mobile) — opens the drawer. Three CSS bars (no icon glyph/emoji).
    var burger = el('button', {
      class: 'nav__menu-btn', id: 'menu-btn', type: 'button',
      'aria-label': 'Open menu', 'aria-expanded': 'false', 'aria-controls': 'shell-drawer'
    });
    var bars = el('span', { class: 'nav__menu-icon', 'aria-hidden': 'true' });
    bars.appendChild(el('span'));
    bars.appendChild(el('span'));
    bars.appendChild(el('span'));
    burger.appendChild(bars);
    inner.appendChild(burger);

    header.appendChild(inner);
    return { header: header, burger: burger };
  }

  function buildDrawer(state, currentPage, burger) {
    var backdrop = el('div', { class: 'nav__drawer-backdrop', dataset: { open: 'false' } });
    var drawer = el('aside', {
      class: 'nav__drawer', id: 'shell-drawer', role: 'dialog',
      'aria-modal': 'true', 'aria-label': 'Site menu'
    });

    var head = el('div', { class: 'nav__drawer-header' });
    head.appendChild(el('span', { class: 'nav__logo' }, 'MENU'));
    var closeBtn = el('button', { class: 'nav__drawer-close', type: 'button', 'aria-label': 'Close menu' }, '×');
    head.appendChild(closeBtn);
    drawer.appendChild(head);

    // Primary links
    PRIMARY.forEach(function (k) {
      var lnk = navLink(k, currentPage, 'nav__drawer-link');
      if (lnk) drawer.appendChild(lnk);
    });
    // Account links when signed in
    if (state !== 'public') {
      drawer.appendChild(el('hr', { class: 'nav__menu-sep' }));
      ACCOUNT_LINKS.forEach(function (k) {
        var lnk = navLink(k, currentPage, 'nav__drawer-link');
        if (lnk) drawer.appendChild(lnk);
      });
      if (state === 'admin') {
        var adm = navLink('admin', currentPage, 'nav__drawer-link');
        if (adm) drawer.appendChild(adm);
      }
    }

    // CTA block: Donate always; Sign In or Sign Out
    var cta = el('div', { class: 'nav__drawer-cta' });
    cta.appendChild(el('a', { class: 'btn btn--gold', href: ROUTES.donate.href }, 'Donate'));
    if (state === 'public') {
      cta.appendChild(el('a', { class: 'btn btn--secondary', href: ROUTES.signin.href }, 'Sign In'));
    } else {
      var out = el('button', { class: 'btn btn--ghost', type: 'button' }, 'Sign Out');
      out.addEventListener('click', signOut);
      cta.appendChild(out);
    }
    drawer.appendChild(cta);
    backdrop.appendChild(drawer);

    // ── open/close + focus trap (APG Dialog) ──
    var lastFocused = null;
    function focusable() {
      return Array.prototype.slice.call(drawer.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter(function (n) { return n.offsetParent !== null || n === document.activeElement; });
    }
    function open() {
      lastFocused = document.activeElement;
      backdrop.dataset.open = 'true';
      if (burger) burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      var f = focusable();
      if (f.length) f[0].focus();
      document.addEventListener('keydown', onKey, true);
    }
    function closeDrawer() {
      backdrop.dataset.open = 'false';
      if (burger) burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey, true);
      if (lastFocused && lastFocused.focus) lastFocused.focus();
      else if (burger) burger.focus();
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); closeDrawer(); return; }
      if (e.key !== 'Tab') return;
      var f = focusable();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    // Wire the toggle, the close button, the backdrop, and in-drawer links.
    if (burger) burger.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) closeDrawer(); });
    drawer.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a.nav__drawer-link');
      if (a) closeDrawer();
    });

    return backdrop;
  }

  // ─── footer ─────────────────────────────────────────────────────────────────
  function footerColumn(heading, routeKeys) {
    var col = el('div', { class: 'footer__col' });
    col.appendChild(el('h3', { class: 'footer__heading' }, heading));
    routeKeys.forEach(function (k) {
      var r = ROUTES[k];
      if (r) col.appendChild(el('a', { class: 'footer__link', href: r.href }, r.label));
    });
    return col;
  }
  function footerExternalColumn() {
    var col = el('div', { class: 'footer__col' });
    col.appendChild(el('h3', { class: 'footer__heading' }, 'External'));
    FOOTER_EXTERNAL.concat(SOCIAL).forEach(function (item) {
      col.appendChild(el('a', {
        class: 'footer__link', href: item.href,
        target: '_blank', rel: 'noopener noreferrer'
      }, item.label));
    });
    return col;
  }

  function buildFooter() {
    var footer = el('footer', { class: 'footer', role: 'contentinfo' });
    var container = el('div', { class: 'container' });
    var grid = el('div', { class: 'footer__grid' });

    // Brand column
    var brandCol = el('div', { class: 'footer__col' });
    var brand = el('div', { class: 'footer__brand' });
    brand.appendChild(document.createTextNode('MOREHOUSE '));
    brand.appendChild(el('span', { class: 'nav__logo-accent' }, 'CHICAGO'));
    brandCol.appendChild(brand);
    brandCol.appendChild(el('p', { class: 'footer__desc' },
      'The Chicago Area Morehouse College Alumni Association — brotherhood, ' +
      'scholarship, and service across the greater Chicago area.'));
    grid.appendChild(brandCol);

    grid.appendChild(footerColumn('Chapter', FOOTER_CHAPTER));
    grid.appendChild(footerColumn('Members', FOOTER_MEMBERS));
    grid.appendChild(footerExternalColumn());

    container.appendChild(grid);

    var bottom = el('div', { class: 'footer__bottom' });
    var year = new Date().getFullYear();
    bottom.appendChild(document.createTextNode(
      '© ' + year + ' Chicago Area Morehouse College Alumni Association. All rights reserved.'));
    container.appendChild(bottom);

    footer.appendChild(container);
    return footer;
  }

  // ─── breadcrumbs (schema.org BreadcrumbList) ────────────────────────────────
  function buildBreadcrumbs(crumbs) {
    if (!Array.isArray(crumbs) || !crumbs.length) return null;
    // Always prepend Home.
    var trail = [{ label: ROUTES.home.label, href: ROUTES.home.href }].concat(crumbs);

    var nav = el('nav', { class: 'breadcrumbs', 'aria-label': 'Breadcrumb' });
    var ol = el('ol', {
      class: 'breadcrumbs__list',
      itemscope: '', itemtype: 'https://schema.org/BreadcrumbList'
    });

    trail.forEach(function (c, i) {
      var isLast = i === trail.length - 1;
      var li = el('li', {
        class: 'breadcrumbs__item',
        itemprop: 'itemListElement', itemscope: '', itemtype: 'https://schema.org/ListItem'
      });
      if (isLast || !c.href) {
        var cur = el('span', { class: 'breadcrumbs__current', itemprop: 'name', 'aria-current': 'page' }, c.label);
        li.appendChild(cur);
      } else {
        var a = el('a', { class: 'breadcrumbs__link', href: c.href, itemprop: 'item' });
        a.appendChild(el('span', { itemprop: 'name' }, c.label));
        li.appendChild(a);
      }
      li.appendChild(el('meta', { itemprop: 'position', content: String(i + 1) }));
      ol.appendChild(li);
      if (!isLast) {
        var sep = el('li', { class: 'breadcrumbs__sep', 'aria-hidden': 'true' }, '›');
        ol.appendChild(sep);
      }
    });
    nav.appendChild(ol);
    return nav;
  }

  // ─── sign out (shared) ──────────────────────────────────────────────────────
  async function signOut() {
    try {
      if (window.Store && typeof window.Store.signOut === 'function') {
        await window.Store.signOut();
      }
    } catch (e) { /* fall through to redirect */ }
    // Protected pages bounce home; public pages just re-render.
    var protectedPage = document.body && document.body.dataset && document.body.dataset.protected === 'true';
    if (protectedPage) { window.location.href = ROUTES.home.href; return; }
    Shell.render(Shell._last || { page: '' });
  }

  // ─── shell offset (announce bar + nav) so pages clear the fixed header ──────
  function applyShellOffset(hasAnnounce) {
    var root = document.documentElement;
    if (hasAnnounce) {
      document.body.classList.add('has-announce');
      root.style.setProperty('--shell-offset',
        'calc(var(--nav-height) + var(--announce-bar-height))');
    } else {
      document.body.classList.remove('has-announce');
      root.style.setProperty('--shell-offset', 'var(--nav-height)');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC: Shell.render
  // ═══════════════════════════════════════════════════════════════════════════
  var Shell = {
    ROUTES: ROUTES,
    _last: null,
    _wired: false,

    render: function (opts) {
      opts = opts || {};
      var page = opts.page || '';
      var crumbs = opts.breadcrumbs || [];
      this._last = { page: page, breadcrumbs: crumbs };

      var state = authState();
      var headerHost = document.getElementById('site-header');
      var footerHost = document.getElementById('site-footer');

      // ── header host: skip link → announce bar → nav → drawer → breadcrumbs ──
      if (headerHost) {
        clear(headerHost);
        headerHost.appendChild(buildSkipLink());

        var announce = buildAnnounceBar();
        if (announce) headerHost.appendChild(announce);
        applyShellOffset(!!announce);

        var navParts = buildNav(state, page);
        headerHost.appendChild(navParts.header);
        headerHost.appendChild(buildDrawer(state, page, navParts.burger));

        var bc = buildBreadcrumbs(crumbs);
        if (bc) {
          document.body.classList.add('shell-has-breadcrumbs');
          var bcWrap = el('div', { class: 'shell-breadcrumbs-bar' });
          var bcInner = el('div', { class: 'container' });
          bcInner.appendChild(bc);
          bcWrap.appendChild(bcInner);
          headerHost.appendChild(bcWrap);
          // schema.org JSON-LD twin for crawlers.
          injectBreadcrumbJsonLd([{ label: ROUTES.home.label, href: ROUTES.home.href }].concat(crumbs));
        } else {
          document.body.classList.remove('shell-has-breadcrumbs');
        }
      }

      // ── footer host ──
      if (footerHost) {
        clear(footerHost);
        footerHost.appendChild(buildFooter());
      }

      // ── re-render on auth/data changes (wire once) ──
      // Pages or Auth can fire `window.dispatchEvent(new Event('shell:auth'))`
      // after a sign-in/out to repaint the nav. Store('init') repaints once the
      // session + live events hydrate (so the announce bar gets the real next
      // event, and the account menu reflects the real role).
      if (!this._wired) {
        this._wired = true;
        var self = this;
        window.addEventListener('shell:auth', function () { self.render(self._last); });
        if (window.Store && typeof window.Store.on === 'function') {
          window.Store.on('init', function () { self.render(self._last); });
          var keys = window.STORAGE_KEYS || {};
          // Repaint the announce bar when events hydrate from Supabase.
          if (keys.EVENTS) window.Store.on(keys.EVENTS, function () { self.render(self._last); });
        }
      }
      return this;
    },

    // Convenience: page lanes call after a sign-in/out without re-passing opts.
    refresh: function () { return this.render(this._last || { page: '' }); }
  };

  function injectBreadcrumbJsonLd(trail) {
    try {
      var existing = document.getElementById('shell-breadcrumb-jsonld');
      if (existing) existing.parentNode.removeChild(existing);
      var data = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map(function (c, i) {
          return {
            '@type': 'ListItem', position: i + 1, name: c.label,
            item: c.href ? new URL(c.href, document.baseURI).href : undefined
          };
        })
      };
      var s = document.createElement('script');
      s.type = 'application/ld+json';
      s.id = 'shell-breadcrumb-jsonld';
      s.textContent = JSON.stringify(data); // serialized object — safe, not user HTML
      document.head.appendChild(s);
    } catch (_) { /* JSON-LD is progressive enhancement */ }
  }

  window.Shell = Shell;
})();
