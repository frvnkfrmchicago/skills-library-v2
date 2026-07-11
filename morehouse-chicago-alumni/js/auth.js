/**
 * MOREHOUSE CHICAGO ALUMNI — AUTH GATE HELPER (window.Auth)
 * Lane 1 (mcaa-wave-001). Implements docs/data-contract.md §2.3 + §2.4.
 *
 * Role model (data-contract §2.3, §5):
 *   - Auth GATES read role from the JWT: session.user.app_metadata.role. This is
 *     fast and unspoofable (the custom_access_token_hook injects it server-side
 *     from profiles.role). UI display may instead read profiles.role.
 *   - Sensitive ops (admin actions, payment initiation) re-validate server-side
 *     with supabaseClient.auth.getUser(), not just getSession() — see
 *     Auth.assertAdminFresh().
 *   - Store.isAdmin() is a UI hint ONLY (§9 #8). Real enforcement is RLS.
 *
 * FOAC (§2.4): protected pages ship <body style="visibility:hidden">. The
 * require* gates flip visibility to 'visible' ONLY after the check passes;
 * otherwise the redirect fires before any protected content is painted.
 *
 * Load order (§2.1): supabase-js CDN -> config.js -> store.js -> auth.js -> app.js.
 * Auth depends on window.Store (already defined by store.js).
 */

const Auth = {
  _subscription: null,
  _ready: false,

  // getSession(), seed Store._session, subscribe to onAuthStateChange.
  async init() {
    if (this._ready) return this;
    const client = window.supabaseClient || (window.Store && window.Store._client) || null;

    if (client) {
      try {
        const { data } = await client.auth.getSession();
        if (window.Store && typeof window.Store._setSession === 'function') {
          window.Store._setSession(data ? data.session : null);
        }
      } catch (e) {
        console.warn('Auth.init getSession failed.', e);
      }

      // Keep the cached session in sync. SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED
      // all update Store._session and re-render the nav.
      const sub = client.auth.onAuthStateChange((_event, session) => {
        if (window.Store && typeof window.Store._setSession === 'function') {
          window.Store._setSession(session || null);
        }
        this.updateNavForSession();
      });
      // supabase-js v2 returns { data: { subscription } }.
      this._subscription = sub && sub.data ? sub.data.subscription : null;
    }

    this._ready = true;
    return this;
  },

  // Cleanup hook (SPA-friendly; static pages unload naturally).
  teardown() {
    if (this._subscription && typeof this._subscription.unsubscribe === 'function') {
      this._subscription.unsubscribe();
    }
    this._subscription = null;
  },

  isSignedIn() {
    return !!(window.Store && window.Store.isSignedIn());
  },

  // JWT role claim — the gate's source of truth.
  role() {
    const s = window.Store ? window.Store._session : null;
    return (s && s.user && s.user.app_metadata && s.user.app_metadata.role) || 'public';
  },

  isAdmin() {
    const r = this.role();
    return r === 'admin' || r === 'board';
  },

  // Reveal a FOAC-hidden body once a check passes.
  _reveal() {
    if (document && document.body) document.body.style.visibility = 'visible';
  },

  _redirect(target) {
    // Body stays hidden through the redirect so protected content never paints.
    window.location.href = target;
  },

  // Require any signed-in user. Returns true if allowed (and reveals the page).
  requireAuth() {
    if (this.isSignedIn()) {
      this._reveal();
      return true;
    }
    this._redirect('index.html?signin=1');
    return false;
  },

  // Require admin/board. requireAuth() first, then role check from the JWT.
  requireAdmin() {
    if (!this.isSignedIn()) {
      this._redirect('index.html?signin=1');
      return false;
    }
    if (!this.isAdmin()) {
      this._redirect('index.html');
      return false;
    }
    this._reveal();
    return true;
  },

  // Server-side re-validation for sensitive ops (admin mutations, payment start).
  // Calls getUser() (hits the Auth server) instead of trusting the cached session.
  async assertAdminFresh() {
    const client = window.supabaseClient || (window.Store && window.Store._client) || null;
    if (!client) return false;
    try {
      const { data, error } = await client.auth.getUser();
      if (error || !data || !data.user) return false;
      const role = data.user.app_metadata && data.user.app_metadata.role;
      return role === 'admin' || role === 'board';
    } catch (e) {
      console.warn('assertAdminFresh failed.', e);
      return false;
    }
  },

  // Toggle Sign In / Sign Out + Admin link across pages. Idempotent; safe to call
  // on load and from onAuthStateChange. Works with the index.html nav markup
  // (#sign-in-btn inside #nav-links) and is a no-op where those ids are absent.
  updateNavForSession() {
    const btn = document.getElementById('sign-in-btn');
    const navLinks = document.getElementById('nav-links');
    const signedIn = this.isSignedIn();

    if (btn) {
      if (signedIn) {
        btn.textContent = 'Sign Out';
        btn.className = 'btn btn--ghost btn--sm';
        btn.onclick = async (e) => {
          if (e && e.preventDefault) e.preventDefault();
          await window.Store.signOut();
          this.updateNavForSession();
          // If we are on a protected page, bounce home after sign-out.
          if (document.body && document.body.dataset && document.body.dataset.protected === 'true') {
            window.location.href = 'index.html';
          }
        };
      } else {
        btn.textContent = 'Sign In';
        btn.className = 'btn btn--secondary btn--sm';
        btn.onclick = (e) => {
          if (e && e.preventDefault) e.preventDefault();
          if (typeof window.openSignIn === 'function') window.openSignIn();
        };
      }
    }

    // Admin nav link (insert once for admin/board; remove otherwise).
    if (navLinks && btn) {
      const existing = document.getElementById('admin-nav-item');
      if (signedIn && this.isAdmin()) {
        if (!existing) {
          const li = document.createElement('li');
          li.id = 'admin-nav-item';
          const a = document.createElement('a');
          a.href = 'admin.html';
          a.className = 'nav__link';
          a.textContent = 'Admin';
          li.appendChild(a);
          navLinks.insertBefore(li, btn.parentElement);
        }
      } else if (existing) {
        existing.remove();
      }
    }
  },
};

window.Auth = Auth;
