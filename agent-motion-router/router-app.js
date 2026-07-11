/* router-app.js */

let registry = null;
let currentCategory = "all";

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize capability registry model
  if (window.CapabilityRegistry) {
    registry = new window.CapabilityRegistry();
  } else {
    console.error("CapabilityRegistry is not loaded. Ensure router-registry.js is loaded first.");
    return;
  }

  // 2. Perform initial visual render sweeps
  renderCapabilityGrid();
  renderRoutesList();
  renderNotesLedger();
  populateSelectorOptions();

  // 3. Connect Event Actions
  setupCategoryTabs();
  setupRouteBinderAction();
  setupNoteLoggerAction();
});

/**
 * Dynamically renders the central grid showcase cards from registry model entries.
 */
function renderCapabilityGrid() {
  const grid = document.getElementById('capabilities-view-grid');
  if (!grid) return;

  grid.innerHTML = '';
  const list = registry.getCapabilities(currentCategory);

  list.forEach(cap => {
    const card = document.createElement('article');
    card.className = 'capability-card';
    card.id = `card-${cap.key}`;

    // Custom Visual Sandbox template based on capability type
    let sandboxHTML = '';
    
    if (cap.key === 'canvas') {
      sandboxHTML = `<canvas id="gesture-grid-canvas" class="interactive-canvas"></canvas>`;
    } else if (cap.key === 'gifs') {
      sandboxHTML = `
        <div class="sticker-injector-panel">
          <div class="sticker-options">
            <button class="sticker-node" type="button" aria-label="Sticker 1">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FC8019"/><circle cx="8" cy="9" r="1.5" fill="#FFF"/><circle cx="16" cy="9" r="1.5" fill="#FFF"/><path d="M12 14c-2 0-3 1-3 1.5s1 1.5 3 1.5 3-1 3-1.5-1-1.5-3-1.5z" fill="#FFF"/></svg>
            </button>
            <button class="sticker-node" type="button" aria-label="Sticker 2">
              <svg viewBox="0 0 24 24"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" fill="#E11C54"/><path d="M12 7l3 5-3 5-3-5z" fill="#FFF"/></svg>
            </button>
            <button class="sticker-node" type="button" aria-label="Sticker 3">
              <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#60B246"/></svg>
            </button>
          </div>
          <div class="sticker-sandbox-viewport" id="sticker-viewport">
            <span style="font-size:0.75rem; color:#475569;">Click sticker to inject</span>
          </div>
        </div>
      `;
    } else if (cap.key === 'floatlabel') {
      sandboxHTML = `
        <div class="floating-label-wrapper">
          <input type="text" id="mob-input-${cap.key}" class="floating-input" placeholder=" ">
          <label for="mob-input-${cap.key}" class="floating-label">Mobile Number</label>
        </div>
      `;
    } else if (cap.key === 'elastic') {
      sandboxHTML = `
        <div class="elastic-underline-wrapper">
          <input type="text" id="elastic-input-${cap.key}" class="elastic-input" placeholder="Type name here...">
          <span class="elastic-bar"></span>
        </div>
      `;
    } else if (cap.key === 'otp') {
      sandboxHTML = `
        <div class="otp-container">
          <input type="text" maxlength="1" class="otp-box" aria-label="Digit 1">
          <input type="text" maxlength="1" class="otp-box" aria-label="Digit 2">
          <input type="text" maxlength="1" class="otp-box" aria-label="Digit 3">
          <input type="text" maxlength="1" class="otp-box" aria-label="Digit 4">
        </div>
      `;
    } else if (cap.key === 'mic') {
      sandboxHTML = `
        <div class="mic-wrapper">
          <div class="mic-pulse-container">
            <div class="mic-ring"></div>
            <div class="mic-ring"></div>
            <button class="mic-trigger-btn" type="button" id="interactive-mic-btn" aria-label="Simulate audio record speak input">
              <svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>
            </button>
          </div>
          <span class="mic-status-text" style="font-size:0.75rem; color:var(--color-text-secondary);">Click to speak</span>
          <div class="audio-waves" aria-hidden="true">
            <span class="audio-bar"></span>
            <span class="audio-bar"></span>
            <span class="audio-bar"></span>
            <span class="audio-bar"></span>
            <span class="audio-bar"></span>
          </div>
        </div>
      `;
    } else if (cap.key === 'scalebtn') {
      sandboxHTML = `<button class="btn-primary accelerated" type="button" style="padding:0.75rem 1.5rem;" onmousedown="this.style.transform='scale(0.92)'" onmouseup="this.style.transform='scale(1)'" onmouseleave="this.style.transform='scale(1)'">Compress Scale</button>`;
    } else if (cap.key === 'glow') {
      sandboxHTML = `
        <div class="accelerated" style="width:100%; padding:1rem; background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.06); border-radius:12px; transition:all 0.3s; text-align:center;" onmouseenter="this.style.borderColor='var(--color-primary)'; this.style.boxShadow='0 0 16px rgba(252,128,25,0.2)'; this.style.background='rgba(252,128,25,0.03)'" onmouseleave="this.style.borderColor='rgba(255,255,255,0.06)'; this.style.boxShadow='none'; this.style.background='rgba(255,255,255,0.01)'">
          <span style="font-size:0.85rem; font-weight:600; color:#FFF;">Hover Glowing</span>
        </div>
      `;
    } else {
      // Basic keyframe animation preview blocks
      sandboxHTML = `<div class="anim-${cap.key} accelerated" style="width: 44px; height: 44px; background: var(--gradient-accent); border-radius: 10px; box-shadow: var(--shadow-premium);"></div>`;
    }

    card.innerHTML = `
      <div class="card-top">
        <div>
          <h3>${cap.name}</h3>
          <p>${cap.description}</p>
        </div>
        <span class="category-tag">${cap.category}</span>
      </div>
      <div class="visual-sandbox" aria-label="Visual sandbox for ${cap.name}">
        ${sandboxHTML}
      </div>
      <button class="card-footer-action" type="button">
        <svg viewBox="0 0 24 24"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 16V8M8 12h8"/></svg>
        Inspect Parameter
      </button>
    `;

    // Visual highlight on hover / click
    card.addEventListener('click', () => {
      document.querySelectorAll('.capability-card').forEach(el => el.classList.remove('selected'));
      card.classList.add('selected');
      
      // Auto-populate target capability selector on inspection click
      const select = document.getElementById('route-cap-select');
      if (select) {
        select.value = cap.key;
      }
    });

    grid.appendChild(card);
  });

  // Re-run dynamic listeners bound to sandboxes (OTP auto-tabs, micro-speech meters, canvas grid)
  if (window.setupSpeechMeter) window.setupSpeechMeter();
  if (window.setupGestureCanvas) window.setupGestureCanvas();
  if (window.setupStickerInjections) window.setupStickerInjections();
  if (window.setupOTPNavigation) window.setupOTPNavigation();
}

/**
 * Renders the active routes mapped indicator rows inside the sidebar ledger.
 */
function renderRoutesList() {
  const container = document.getElementById('active-routes-list-wrapper');
  if (!container) return;

  container.innerHTML = '';
  const list = registry.getRoutes();

  list.forEach(route => {
    const item = document.createElement('div');
    item.className = 'route-item';
    
    // Fetch user-friendly capability name
    const cap = registry.getCapability(route.capability);
    const capName = cap ? cap.name : route.capability;

    item.innerHTML = `
      <div class="route-header">
        <span>${capName}</span>
        <span class="route-target">#${route.target}</span>
      </div>
      <span class="route-text">${route.notes || 'Mapped injection boundary'}</span>
    `;
    container.appendChild(item);
  });
}

/**
 * Renders collaborative workspaces notes bubble list in the right sidebar.
 */
function renderNotesLedger() {
  const container = document.getElementById('visual-notes-ledger');
  if (!container) return;

  container.innerHTML = '';
  const notes = registry.getNotes();

  notes.forEach(note => {
    const bubble = document.createElement('div');
    bubble.className = 'note-bubble';
    
    const isAgent = note.author.includes('Agent') || note.author.includes('AI');
    const badgeClass = isAgent ? 'author-badge agent' : 'author-badge';

    bubble.innerHTML = `
      <div class="note-author">
        <span class="${badgeClass}">${note.author}</span>
        <span class="note-time">${note.timestamp || 'active'}</span>
      </div>
      <p class="note-content">${note.text}</p>
    `;
    container.appendChild(bubble);
  });
}

/**
 * populates the dropdown lists with all registered options from the model.
 */
function populateSelectorOptions() {
  const select = document.getElementById('route-cap-select');
  if (!select) return;

  select.innerHTML = '';
  const list = registry.getCapabilities('all');

  list.forEach(cap => {
    const opt = document.createElement('option');
    opt.value = cap.key;
    opt.textContent = cap.name;
    select.appendChild(opt);
  });
}

function setupCategoryTabs() {
  const menuButtons = document.querySelectorAll('.nav-item');

  menuButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      menuButtons.forEach(el => el.classList.remove('active'));
      btn.classList.add('active');

      currentCategory = btn.getAttribute('data-category');
      renderCapabilityGrid();
    });
  });
}

function setupRouteBinderAction() {
  const bindBtn = document.getElementById('btn-bind-route-action');
  if (!bindBtn) return;

  bindBtn.addEventListener('click', () => {
    const capKey = document.getElementById('route-cap-select').value;
    const targetSelector = document.getElementById('route-target-input').value.trim();
    const description = document.getElementById('route-desc-input').value.trim();

    if (!targetSelector) {
      alert("Please input an app injection point selector!");
      return;
    }

    // Call model binding
    const result = registry.bindRoute(capKey, targetSelector, description);
    
    if (result.success) {
      renderRoutesList();
      
      // Auto-add system log note documenting route mapping action
      registry.addNote("System Router", `Successfully routed capability [${capKey}] dynamically to injection selector [${targetSelector}].`);
      renderNotesLedger();

      // Clear inputs
      document.getElementById('route-target-input').value = '';
      document.getElementById('route-desc-input').value = '';
    } else {
      alert(result.msg);
    }
  });
}

function setupNoteLoggerAction() {
  const noteBtn = document.getElementById('btn-add-note-action');
  if (!noteBtn) return;

  noteBtn.addEventListener('click', () => {
    const textEl = document.getElementById('note-workspace-text');
    if (!textEl) return;

    const text = textEl.value.trim();
    if (!text) return;

    // Save notes
    registry.addNote("Collaborator", text);
    
    renderNotesLedger();
    textEl.value = '';

    // Scroll notes container to bottom
    const notesContainer = document.getElementById('visual-notes-ledger');
    if (notesContainer) {
      notesContainer.scrollTop = notesContainer.scrollHeight;
    }
  });
}
