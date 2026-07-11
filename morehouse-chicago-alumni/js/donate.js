/**
 * MOREHOUSE CHICAGO ALUMNI — DONATE PAGE
 * Lane E — mcaa-wave-002.
 *
 * Renders the PayPal donation button for donate.html.
 * The user picks an amount + designation; the client sends:
 *
 *   supabaseClient.functions.invoke('paypal-checkout', {
 *     body: {
 *       purpose:      'donation',
 *       amount_cents: <integer>,         // user-entered, clamped server-side to [$5, $50000]
 *       designation:  'scholarship' | 'chapter',
 *       donor_email:  '<string|undefined>'  // optional
 *     }
 *   })
 *   Response 200: { order_id, status:'CREATED', approve_url }
 *   -> paypal.Buttons({ createOrder: () => order_id }).render('#paypal-donate-btn')
 *
 * No Stripe. No server-set prices from the client. No innerHTML for user strings.
 * Donation amounts are clamped server-side; the client enforces the same range
 * only for immediate feedback ($5 min, $50,000 max).
 */

var DonatePage = {
  AMOUNT_MIN: 5,      // cents equivalent: $5
  AMOUNT_MAX: 50000,  // cents equivalent: $50,000

  init() {
    this._bindPresets();
    this._bindAmountInput();
    this._mountPayPalButton();
  },

  /* ── Preset buttons ──────────────────────────────────────────────────── */

  _bindPresets() {
    var self = this;
    var presets = document.querySelectorAll('.amount-preset');
    var input = document.getElementById('donate-amount');
    if (!presets.length || !input) return;

    presets.forEach(function (btn) {
      btn.addEventListener('click', function () {
        // Mark active.
        presets.forEach(function (b) { b.classList.remove('amount-preset--active'); });
        btn.classList.add('amount-preset--active');

        // Set input value.
        var amount = btn.getAttribute('data-amount');
        if (amount) {
          input.value = amount;
          self._clearError();
        }
      });
    });
  },

  /* ── Amount input — clear active preset when user types ─────────────── */

  _bindAmountInput() {
    var input = document.getElementById('donate-amount');
    if (!input) return;
    input.addEventListener('input', function () {
      document.querySelectorAll('.amount-preset').forEach(function (b) {
        b.classList.remove('amount-preset--active');
      });
    });
    input.addEventListener('blur', function () {
      DonatePage._validateAmount(input.value);
    });
  },

  /* ── Validation ──────────────────────────────────────────────────────── */

  _validateAmount(raw) {
    var errEl = document.getElementById('amount-error');
    var val = parseFloat(raw);

    if (!raw || isNaN(val) || val <= 0) {
      this._setError(errEl, 'Please enter a donation amount.');
      return false;
    }
    if (val < this.AMOUNT_MIN) {
      this._setError(errEl, 'Minimum donation is $' + this.AMOUNT_MIN + '.');
      return false;
    }
    if (val > this.AMOUNT_MAX) {
      this._setError(errEl, 'Maximum donation is $' + this.AMOUNT_MAX.toLocaleString() + '.');
      return false;
    }
    this._clearError();
    return true;
  },

  _setError(el, msg) {
    if (!el) return;
    el.textContent = msg;
  },

  _clearError() {
    var errEl = document.getElementById('amount-error');
    if (errEl) errEl.textContent = '';
  },

  /* ── Read form values ────────────────────────────────────────────────── */

  _getAmountCents() {
    var input = document.getElementById('donate-amount');
    if (!input || !input.value) return null;
    var val = parseFloat(input.value);
    if (isNaN(val) || val <= 0) return null;
    // Convert dollars → cents, round to nearest cent.
    return Math.round(val * 100);
  },

  _getDesignation() {
    var checked = document.querySelector('input[name="designation"]:checked');
    return (checked && checked.value) || 'scholarship';
  },

  _getDonorEmail() {
    var input = document.getElementById('donor-email');
    if (!input || !input.value.trim()) return undefined;
    // Basic email sanity — the server does not require this field.
    return input.value.trim();
  },

  /* ── PayPal button ───────────────────────────────────────────────────── */

  _mountPayPalButton() {
    var loadingEl = document.getElementById('paypal-donate-loading');
    var container = document.getElementById('paypal-donate-btn');
    if (!container) return;

    if (typeof paypal === 'undefined') {
      // PayPal SDK not yet loaded (defer). Poll.
      var attempts = 0;
      var interval = setInterval(function () {
        attempts++;
        if (typeof paypal !== 'undefined') {
          clearInterval(interval);
          if (loadingEl) loadingEl.remove();
          DonatePage._buildButton(container);
        } else if (attempts > 30) {
          clearInterval(interval);
          if (loadingEl) loadingEl.textContent = 'Secure payment could not load. Please refresh or use Zelle/check.';
        }
      }, 500);
    } else {
      if (loadingEl) loadingEl.remove();
      this._buildButton(container);
    }
  },

  _buildButton(container) {
    paypal.Buttons({
      style: {
        layout: 'vertical',
        color:  'gold',
        shape:  'rect',
        label:  'donate',
      },

      createOrder: async function () {
        // Client-side validation before hitting the server.
        var amountCents = DonatePage._getAmountCents();
        if (!amountCents) {
          var errEl = document.getElementById('amount-error');
          DonatePage._setError(errEl, 'Please enter a donation amount.');
          var input = document.getElementById('donate-amount');
          if (input) input.focus();
          throw new Error('VALIDATION_ERROR');
        }
        if (!DonatePage._validateAmount(DonatePage._getAmountCents() / 100)) {
          throw new Error('VALIDATION_ERROR');
        }

        if (!window.supabaseClient) {
          showToast('Connect the chapter backend to enable donations.', 'error');
          throw new Error('NOT_CONFIGURED');
        }

        // Build the request body (Lane B contract §4.1).
        // Donation allows anonymous; no JWT required.
        var body = {
          purpose:      'donation',
          amount_cents: amountCents,                // integer > 0; server clamps to [500, 5000000]
          designation:  DonatePage._getDesignation(), // 'scholarship' | 'chapter'
        };
        var email = DonatePage._getDonorEmail();
        if (email) body.donor_email = email;

        var result = await window.supabaseClient.functions.invoke('paypal-checkout', {
          body: body,
        });
        var data = result.data;
        var err  = result.error;

        if (err || !data || data.error) {
          var code = (data && data.error) || (err && err.message) || 'CHECKOUT_FAILED';
          var msg = code === 'AMOUNT_OUT_OF_RANGE'
            ? 'Donation amount must be between $5 and $50,000.'
            : 'Could not start donation checkout. Please try again.';
          showToast(msg, 'error');
          throw new Error(code);
        }

        return data.order_id;
      },

      onApprove: async function () {
        showToast('Thank you for your donation! PayPal will send your receipt by email.', 'success');
        // Reset the form after a brief moment.
        setTimeout(function () {
          var input = document.getElementById('donate-amount');
          if (input) input.value = '';
          document.querySelectorAll('.amount-preset').forEach(function (b) {
            b.classList.remove('amount-preset--active');
          });
          var emailInput = document.getElementById('donor-email');
          if (emailInput) emailInput.value = '';
          DonatePage._clearError();
        }, 1500);
      },

      onCancel: function () {
        showToast('No donation was taken.', 'info');
      },

      onError: function () {
        showToast('PayPal could not complete the donation. Please try again.', 'error');
      },

    }).render(container);
  },
};

// showToast: provided by js/app.js (window.showToast) on pages that load it,
// or defined inline as a fallback so donate.html works standalone.
if (typeof showToast === 'undefined') {
  window.showToast = function (message, type) {
    type = type || 'success';
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3500);
  };
}

window.DonatePage = DonatePage;
