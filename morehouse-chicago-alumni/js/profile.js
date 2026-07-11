/**
 * MOREHOUSE CHICAGO ALUMNI — PROFILE MODULE (window.Profile)
 * Lane F (mcaa-wave-002). The member edits their own directory entry:
 * bio, class year, job title (chapter_role_title via members table),
 * and directory_visible toggle.
 *
 * FOAC: profile.html ships <body style="visibility:hidden">; Auth.requireAuth()
 * reveals on pass or redirects to signin.html on fail.
 *
 * All form values read from Supabase and written back via upsert/update.
 * No innerHTML for user-controlled strings (§9 #7, G5).
 */

const Profile = {
  _profile: null,
  _member: null,
  _saving: false,

  async init() {
    const container = document.getElementById('profile-container');
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

    try {
      const { data: profile } = await window.supabaseClient
        .from('profiles')
        .select('id, full_name, class_year, bio, linkedin_url, directory_visible')
        .eq('id', userId)
        .maybeSingle();
      this._profile = profile || null;
    } catch (_) {}

    try {
      const { data: member } = await window.supabaseClient
        .from('members')
        .select('id, chapter_role_title')
        .eq('profile_id', userId)
        .maybeSingle();
      this._member = member || null;
    } catch (_) {}
  },

  _userId() {
    return (window.Store && window.Store._session && window.Store._session.user
      && window.Store._session.user.id) || null;
  },

  // ── save ──────────────────────────────────────────────────────────────────

  async _save(formData) {
    if (this._saving) return;
    this._saving = true;

    const userId = this._userId();
    if (!userId || !window.supabaseClient) {
      this._showStatus('error', 'Not connected to the backend. Changes were not saved.');
      this._saving = false;
      return;
    }

    const profileUpdate = {
      bio: (formData.bio || '').trim(),
      class_year: formData.class_year ? Number(formData.class_year) : null,
      directory_visible: !!formData.directory_visible,
    };

    // linkedin_url: only accept http/https URLs
    const rawLinkedIn = (formData.linkedin_url || '').trim();
    if (rawLinkedIn) {
      try {
        const u = new URL(rawLinkedIn);
        if (u.protocol === 'http:' || u.protocol === 'https:') {
          profileUpdate.linkedin_url = u.href;
        } else {
          this._showStatus('error', 'LinkedIn URL must start with https://');
          this._saving = false;
          return;
        }
      } catch (_) {
        this._showStatus('error', 'Enter a valid LinkedIn URL (e.g. https://linkedin.com/in/yourname).');
        this._saving = false;
        return;
      }
    } else {
      profileUpdate.linkedin_url = null;
    }

    const { error: profileError } = await window.supabaseClient
      .from('profiles')
      .update(profileUpdate)
      .eq('id', userId);

    if (profileError) {
      this._showStatus('error', 'Could not save profile: ' + profileError.message);
      this._saving = false;
      return;
    }

    // Update chapter_role_title on the members row if it exists
    if (this._member && this._member.id && formData.job_title !== undefined) {
      await window.supabaseClient
        .from('members')
        .update({ chapter_role_title: (formData.job_title || '').trim() || null })
        .eq('id', this._member.id);
    }

    // Update local state
    if (this._profile) {
      Object.assign(this._profile, profileUpdate);
    }
    if (this._member && formData.job_title !== undefined) {
      this._member.chapter_role_title = (formData.job_title || '').trim() || null;
    }

    this._showStatus('success', 'Profile saved.');
    this._saving = false;
  },

  // ── DOM helpers ───────────────────────────────────────────────────────────

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

  _showStatus(type, message) {
    const el = document.getElementById('profile-status');
    if (!el) return;
    el.textContent = message;
    el.className = 'profile-status profile-status--' + type;
    el.removeAttribute('hidden');
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
  },

  _labeledInput(id, label, type, value, opts) {
    opts = opts || {};
    const group = this._el('div', { class: 'form-group' });

    const lbl = this._el('label', { class: 'form-label', for: id });
    lbl.textContent = label;
    if (opts.required) {
      const req = this._el('span', { class: 'form-required', 'aria-hidden': 'true' }, ' *');
      lbl.appendChild(req);
    }
    group.appendChild(lbl);

    if (opts.hint) {
      const hint = this._el('p', { class: 'form-hint', id: id + '-hint' });
      hint.textContent = opts.hint;
      group.appendChild(hint);
    }

    const input = this._el('input', {
      class: 'form-input',
      type: type || 'text',
      id: id,
      name: id,
      'aria-describedby': opts.hint ? id + '-hint' : undefined,
    });
    if (value != null) input.value = String(value);
    if (opts.maxlength) input.setAttribute('maxlength', opts.maxlength);
    if (opts.min) input.setAttribute('min', opts.min);
    if (opts.max) input.setAttribute('max', opts.max);
    if (opts.placeholder) input.setAttribute('placeholder', opts.placeholder);
    group.appendChild(input);

    return group;
  },

  _labeledTextarea(id, label, value, opts) {
    opts = opts || {};
    const group = this._el('div', { class: 'form-group' });

    const lbl = this._el('label', { class: 'form-label', for: id });
    lbl.textContent = label;
    group.appendChild(lbl);

    if (opts.hint) {
      const hint = this._el('p', { class: 'form-hint', id: id + '-hint' });
      hint.textContent = opts.hint;
      group.appendChild(hint);
    }

    const ta = this._el('textarea', {
      class: 'form-textarea',
      id: id,
      name: id,
      rows: opts.rows || '4',
      'aria-describedby': opts.hint ? id + '-hint' : undefined,
    });
    if (opts.maxlength) ta.setAttribute('maxlength', opts.maxlength);
    if (opts.placeholder) ta.setAttribute('placeholder', opts.placeholder);
    ta.textContent = value || '';
    group.appendChild(ta);

    return group;
  },

  // ── renders ───────────────────────────────────────────────────────────────

  _renderSkeleton(container) {
    while (container.firstChild) container.removeChild(container.firstChild);
    const skel = this._el('div', {
      class: 'profile-skeleton', 'aria-busy': 'true', 'aria-label': 'Loading profile'
    });
    for (let i = 0; i < 5; i++) {
      skel.appendChild(this._el('div', { class: 'form-group--skel', 'aria-hidden': 'true' }));
    }
    container.appendChild(skel);
  },

  _render(container) {
    while (container.firstChild) container.removeChild(container.firstChild);

    const p = this._profile || {};
    const m = this._member || {};

    // Status region
    const status = this._el('div', {
      id: 'profile-status', class: 'profile-status', hidden: ''
    });
    container.appendChild(status);

    const form = this._el('form', {
      id: 'profile-form', class: 'profile-form', novalidate: ''
    });

    // Display name (read-only — set by Supabase Auth)
    if (p.full_name) {
      const nameGroup = this._el('div', { class: 'form-group form-group--readonly' });
      const nameLbl = this._el('label', { class: 'form-label' }, 'Name');
      const nameVal = this._el('div', { class: 'form-input-readonly' });
      nameVal.textContent = p.full_name;
      const nameNote = this._el('p', { class: 'form-hint' },
        'To update your name, contact the chapter administrator.');
      nameGroup.appendChild(nameLbl);
      nameGroup.appendChild(nameVal);
      nameGroup.appendChild(nameNote);
      form.appendChild(nameGroup);
    }

    // Class year
    form.appendChild(this._labeledInput(
      'profile-class-year', 'Class Year', 'number',
      p.class_year != null ? p.class_year : '',
      { min: '1867', max: new Date().getFullYear(), placeholder: 'e.g. 2002' }
    ));

    // Job title / chapter role
    form.appendChild(this._labeledInput(
      'profile-job-title', 'Job Title', 'text',
      m.chapter_role_title || '',
      {
        maxlength: '120',
        placeholder: 'e.g. Senior Software Engineer at Accenture',
        hint: 'Shown on your directory card.',
      }
    ));

    // Bio
    form.appendChild(this._labeledTextarea(
      'profile-bio', 'Short Bio',
      p.bio || '',
      {
        maxlength: '400',
        rows: '4',
        placeholder: 'A sentence or two about your work, interests, or how you give back.',
        hint: 'Up to 400 characters. Shown to members who can see your directory listing.',
      }
    ));

    // LinkedIn URL
    form.appendChild(this._labeledInput(
      'profile-linkedin', 'LinkedIn Profile URL', 'url',
      p.linkedin_url || '',
      {
        maxlength: '300',
        placeholder: 'https://linkedin.com/in/yourname',
        hint: 'Optional. Must begin with https://.',
      }
    ));

    // Directory visibility toggle
    const visGroup = this._el('div', { class: 'form-group form-group--toggle' });
    const visLabel = this._el('label', { class: 'form-label form-label--toggle', for: 'profile-visible' });

    const toggle = this._el('input', {
      type: 'checkbox',
      id: 'profile-visible',
      name: 'profile-visible',
      class: 'form-toggle',
      role: 'switch',
    });
    toggle.checked = !!p.directory_visible;
    visLabel.appendChild(toggle);

    const toggleText = document.createTextNode('Appear in the alumni directory');
    visLabel.appendChild(toggleText);
    visGroup.appendChild(visLabel);

    const visHint = this._el('p', { class: 'form-hint' },
      'When on, other signed-in members can find your listing. You can turn this off at any time.');
    visGroup.appendChild(visHint);
    form.appendChild(visGroup);

    // Submit
    const footer = this._el('div', { class: 'profile-form__footer' });
    const submitBtn = this._el('button', {
      type: 'submit',
      class: 'btn btn--gold btn--lg',
      id: 'profile-save-btn',
    }, 'Save Profile');
    footer.appendChild(submitBtn);
    form.appendChild(footer);

    // Wire submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';

      const formData = {
        class_year: document.getElementById('profile-class-year').value,
        job_title: document.getElementById('profile-job-title').value,
        bio: document.getElementById('profile-bio').value,
        linkedin_url: document.getElementById('profile-linkedin').value,
        directory_visible: document.getElementById('profile-visible').checked,
      };

      await this._save(formData);

      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Profile';
    });

    container.appendChild(form);
  },
};

window.Profile = Profile;
