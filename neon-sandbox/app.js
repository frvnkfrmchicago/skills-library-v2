// ═══ STATE MANAGEMENT ═══
const STATE = {
  currentView: 'feed',
  currentBacking: 'brick',
  
  // Customizer Current Settings
  sandbox: {
    id: null, // null if new
    text1: 'BE Cool',
    text2: '',
    font: "'Sacramento', cursive",
    border: 'none',
    glowColor: '#00f0ff',
    coreColor: '#e6ffff',
    glowIntensity: 1.0,
    tubeThickness: 3,
    textSize: 3.5,
    backing: 'brick'
  },
  
  // Storage Lists
  customSigns: [],
  favorites: [], // holds IDs of favorited signs
  posts: [], // user posts with stickers
  composerOverlays: [],
  
  // Profile
  profile: {
    name: 'Frank Lawrence',
    handle: '@frvnkfrmchicago',
    bio: 'AI Content Strategist & Creative Neon Designer. Sandboxing and curating beautiful light constructs. :neon-cannabis:'
  }
};

// ═══ COLOR PALETTE OPTIONS ═══
const NEON_COLORS = [
  { name: 'Ice Cyan', glow: '#00f0ff', core: '#e6ffff' },
  { name: 'Hot Pink', glow: '#ff007f', core: '#ffe6f2' },
  { name: 'Warm Yellow', glow: '#ffdf00', core: '#fffae6' },
  { name: 'Sunset Orange', glow: '#ff5f00', core: '#ffece6' },
  { name: 'Acid Violet', glow: '#bd00ff', core: '#fae6ff' },
  { name: 'Lime Green', glow: '#39ff14', core: '#ebffe6' },
  { name: 'Radical Red', glow: '#ff073a', core: '#ffe6eb' },
  { name: 'Pure White', glow: '#ffffff', core: '#ffffff' }
];

// ═══ CURATED REFERENCE SIGNS (HIGH-FIDELITY CSS & SVG REPRESENTATIONS) ═══
const REFERENCE_SIGNS = [
  {
    id: 'ref-becool',
    name: 'BE Cool',
    author: 'Curated Classic',
    tags: ['Script', 'Minimal'],
    type: 'reference',
    backing: 'minimal',
    glowColor: '#00f0ff',
    coreColor: '#e6ffff',
    font: "'Sacramento', cursive",
    border: 'none',
    htmlContent: `<div class="sign-becool-text">BE Cool</div>`,
    styleData: {
      text1: 'BE Cool',
      text2: '',
      font: "'Sacramento', cursive",
      border: 'none',
      glowColor: '#00f0ff',
      coreColor: '#e6ffff',
      glowIntensity: 1.2,
      tubeThickness: 3,
      backing: 'minimal'
    }
  },
  {
    id: 'ref-open',
    name: "We're OPEN",
    author: 'Curated Classic',
    tags: ['Retro', 'Multi-color'],
    type: 'reference',
    backing: 'plaster',
    glowColor: '#ffdf00',
    coreColor: '#fffae6',
    font: "'Montserrat', sans-serif",
    border: 'custom',
    htmlContent: `
      <div class="sign-open-container">
        <!-- Neon Stars -->
        <svg class="sign-open-star sign-open-star-1" viewBox="0 0 24 24" fill="none" stroke="#ffdf00" stroke-width="2">
          <path d="M12 2v6M12 16v6M2 12h6M16 12h6M6 6l4 4M14 14l4 4M18 6l-4 4M10 14l-4 4"/>
        </svg>
        <svg class="sign-open-star sign-open-star-2" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2">
          <path d="M12 2v6M12 16v6M2 12h6M16 12h6M6 6l4 4M14 14l4 4M18 6l-4 4M10 14l-4 4"/>
        </svg>
        
        <div class="sign-open-inner-border">
          <div class="sign-open-were">We're</div>
          <div class="sign-open-main">OPEN</div>
          <div class="sign-open-comein">COME IN</div>
        </div>
        
        <!-- Glowing Arrow -->
        <svg class="sign-open-arrow" viewBox="0 0 100 30" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 15h80M75 5l15 10-15 10" />
        </svg>
      </div>
    `,
    styleData: {
      text1: "We're OPEN",
      text2: 'COME IN',
      font: "'Montserrat', sans-serif",
      border: 'double-rounded',
      glowColor: '#ffdf00',
      coreColor: '#fffae6',
      glowIntensity: 1.1,
      tubeThickness: 4,
      backing: 'plaster'
    }
  },
  {
    id: 'ref-kaws',
    name: 'KAWS Anatomical',
    author: 'Curated Classic',
    tags: ['Art', 'Complex'],
    type: 'reference',
    backing: 'brick',
    glowColor: '#bd00ff',
    coreColor: '#fae6ff',
    font: 'Art SVG',
    border: 'none',
    htmlContent: `
      <div class="sign-kaws-container">
        <svg class="sign-kaws-svg" viewBox="0 0 150 250" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Ears / Head Outline -->
          <path d="M35 80 C 25 70, 20 50, 35 40 C 45 35, 55 45, 60 55 C 65 35, 85 35, 90 55 C 95 45, 105 35, 115 40 C 130 50, 125 70, 115 80 C 110 85, 100 85, 95 85 C 90 85, 80 85, 75 80 C 70 85, 60 85, 55 85 C 50 85, 40 85, 35 80 Z" stroke="#00f0ff" stroke-width="3" />
          
          <!-- Eyes (X X) -->
          <path d="M48 55 L58 65 M58 55 L48 65" stroke="#ffdf00" stroke-width="3.5" stroke-linecap="round" />
          <path d="M92 55 L102 65 M102 55 L92 65" stroke="#ffdf00" stroke-width="3.5" stroke-linecap="round" />
          
          <!-- Nose/Mouth area -->
          <circle cx="75" cy="72" r="4" stroke="#ffdf00" stroke-width="2" />
          
          <!-- Brain / Anatomical Half (Right side) -->
          <path d="M75 42 C 85 42, 110 50, 110 70 C 110 80, 95 82, 75 82 Z" stroke="#ff007f" stroke-width="2" />
          <path d="M75 50 Q 90 50 90 60 Q 90 70 75 70" stroke="#bd00ff" stroke-width="1.5" />
          <path d="M75 58 H 85" stroke="#bd00ff" stroke-width="1.5" />
          
          <!-- Body skeleton outline -->
          <path d="M50 85 L35 150 L55 170 L60 230 H90 L95 170 L115 150 L100 85 Z" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" />
          <path d="M75 85 V 160" stroke="#ffffff" stroke-width="2" />
          <path d="M55 110 H 95 M55 130 H 95 M55 150 H 95" stroke="#ffffff" stroke-width="2" />
          
          <!-- Organs (Left Half Body) -->
          <!-- Heart -->
          <path d="M55 100 Q 65 90 70 100 Q 75 90 85 100 Q 85 115 70 125 Q 55 115 55 100 Z" stroke="#ff073a" stroke-width="2" fill="none" />
          <!-- Lungs/Intestines -->
          <path d="M60 140 Q 70 135 70 145 Q 70 155 60 150" stroke="#39ff14" stroke-width="1.5" />
          
          <!-- Microphone -->
          <path d="M65 170 L55 200" stroke="#ff5f00" stroke-width="4" stroke-linecap="round" />
          <circle cx="68" cy="166" r="6" stroke="#ff5f00" stroke-width="3" fill="#000" />
        </svg>
      </div>
    `,
    styleData: {
      text1: 'KAWS Figure',
      text2: '',
      font: "'Space Grotesk', sans-serif",
      border: 'none',
      glowColor: '#00f0ff',
      coreColor: '#e6ffff',
      glowIntensity: 1.3,
      tubeThickness: 3,
      backing: 'brick'
    }
  },
  {
    id: 'ref-pizza',
    name: 'Neon Pizza',
    author: 'Curated Classic',
    tags: ['Food', 'Graphic'],
    type: 'reference',
    backing: 'brick',
    glowColor: '#ff5f00',
    coreColor: '#ffece6',
    font: "'Comfortaa', sans-serif",
    border: 'none',
    htmlContent: `
      <div class="sign-pizza-container">
        <!-- Pizza Slice SVG -->
        <svg class="sign-pizza-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Crust -->
          <path d="M15 25 C 35 15, 65 15, 85 25" stroke="#ffdf00" stroke-width="4.5" stroke-linecap="round" />
          <!-- Slice outline -->
          <path d="M17 29 L50 85 L83 29" stroke="#ffdf00" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round" />
          <!-- Cheese grid/inner lines -->
          <path d="M28 32 C 40 38, 60 38, 72 32 M38 48 L62 48 M45 62 L55 62" stroke="#39ff14" stroke-width="2" />
          <!-- Pepperonis -->
          <circle cx="35" cy="38" r="5" stroke="#ff073a" stroke-width="3.5" fill="none" />
          <circle cx="65" cy="40" r="5" stroke="#ff073a" stroke-width="3.5" fill="none" />
          <circle cx="50" cy="60" r="5" stroke="#ff073a" stroke-width="3.5" fill="none" />
        </svg>
        <div class="sign-pizza-text">Pizza</div>
      </div>
    `,
    styleData: {
      text1: 'Pizza',
      text2: '',
      font: "'Comfortaa', sans-serif",
      border: 'none',
      glowColor: '#ffffff',
      coreColor: '#ffffff',
      glowIntensity: 1.1,
      tubeThickness: 4,
      backing: 'brick'
    }
  },
  {
    id: 'ref-vibes',
    name: 'Good VIBES only',
    author: 'Curated Classic',
    tags: ['Quote', 'Border'],
    type: 'reference',
    backing: 'plaster',
    glowColor: '#bd00ff',
    coreColor: '#fae6ff',
    font: "'Sacramento', cursive",
    border: 'rounded-box',
    htmlContent: `
      <div class="sign-vibes-container">
        <div class="sign-vibes-good">Good</div>
        <div class="sign-vibes-main">VIBES</div>
        <div class="sign-vibes-only">only</div>
      </div>
    `,
    styleData: {
      text1: 'Good VIBES',
      text2: 'only',
      font: "'Sacramento', cursive",
      border: 'rounded-box',
      glowColor: '#bd00ff',
      coreColor: '#fae6ff',
      glowIntensity: 1.2,
      tubeThickness: 3,
      backing: 'plaster'
    }
  },
  {
    id: 'ref-slay',
    name: 'Slay Queen',
    author: 'Curated Classic',
    tags: ['Script', 'Pop'],
    type: 'reference',
    backing: 'minimal',
    glowColor: '#ff007f',
    coreColor: '#ffe6f2',
    font: "'Sacramento', cursive",
    border: 'none',
    htmlContent: `
      <div class="sign-slay-container">
        <div class="sign-slay-text">Slay<br>Queen</div>
        <!-- Script Heart SVG -->
        <svg class="sign-slay-heart" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M25 40 C15 32, 5 22, 5 13 C5 7, 10 2, 16 2 C20 2, 23 4, 25 7 C27 4, 30 2, 34 2 C40 2, 45 7, 45 13 C45 22, 35 32, 25 40 Z" stroke="#ff007f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M23 37 Q25 41 28 36" stroke="#ff007f" stroke-width="2.5" />
        </svg>
      </div>
    `,
    styleData: {
      text1: 'Slay Queen',
      text2: '',
      font: "'Sacramento', cursive",
      border: 'none',
      glowColor: '#ff007f',
      coreColor: '#ffe6f2',
      glowIntensity: 1.3,
      tubeThickness: 3,
      backing: 'minimal'
    }
  }
];

// ═══ LOCALSTORAGE INTEGRATION ═══
function loadFromStorage() {
  const custom = localStorage.getItem('neon_custom_signs');
  const favs = localStorage.getItem('neon_favorites');
  const prof = localStorage.getItem('neon_profile');
  const pst = localStorage.getItem('neon_posts');
  
  if (custom) STATE.customSigns = JSON.parse(custom);
  if (favs) STATE.favorites = JSON.parse(favs);
  if (prof) STATE.profile = JSON.parse(prof);
  if (pst) {
    STATE.posts = JSON.parse(pst);
  } else {
    // Populate default mock posts
    STATE.posts = [
      {
        id: 'post-init-1',
        type: 'post',
        author: 'Grazzhopper',
        handle: '@grazzhopper',
        text: 'Vibe check! Check out this new neon piece we are setting up for the dispensaries. Keep it chill, yall!',
        overlays: [
          { shortcode: ':neon-cannabis:', file: 'assets/stickers/neon/neon_cannabis.gif?v=6', type: 'neon', x: 88, y: 35, size: 70, anim: 'none' },
          { shortcode: ':neon-stay-high:', file: 'assets/stickers/neon/neon_stay_high.gif?v=6', type: 'neon', x: 12, y: 72, size: 65, anim: 'none' }
        ],
        timestamp: Date.now() - 3600000 * 2 // 2 hours ago
      },
      {
        id: 'post-init-2',
        type: 'post',
        author: 'Frank Lawrence',
        handle: '@frvnkfrmchicago',
        text: 'Welcome to Neon Sandbox! Play around with fonts and neon glow, save designs to your profile or post them to this feed.',
        overlays: [
          { shortcode: ':pixel-smile:', file: 'assets/stickers/pixel/pixel_emoji_smile.gif?v=6', type: 'pixel', x: 88, y: 35, size: 55, anim: 'none' },
          { shortcode: ':pixel-heart:', file: 'assets/stickers/pixel/pixel_emoji_heart.gif?v=6', type: 'pixel', x: 12, y: 72, size: 50, anim: 'none' }
        ],
        timestamp: Date.now() - 3600000 * 24 // 1 day ago
      }
    ];
  }
  
  // Update Profile views immediately
  updateProfileDetails();
}

function saveToStorage() {
  localStorage.setItem('neon_custom_signs', JSON.stringify(STATE.customSigns));
  localStorage.setItem('neon_favorites', JSON.stringify(STATE.favorites));
  localStorage.setItem('neon_profile', JSON.stringify(STATE.profile));
  localStorage.setItem('neon_posts', JSON.stringify(STATE.posts));
}

// ═══ VIEW ROUTER ═══
function navigateTo(viewId) {
  STATE.currentView = viewId;
  
  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.getAttribute('data-view') === viewId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Show/Hide views
  document.querySelectorAll('.view').forEach(view => {
    if (view.id === `view-${viewId}`) {
      view.classList.add('active');
    } else {
      view.classList.remove('active');
    }
  });

  // Specific view load events
  if (viewId === 'feed') {
    stopLiveStream();
    renderFeed();
  } else if (viewId === 'profile') {
    stopLiveStream();
    renderProfile();
  } else if (viewId === 'live') {
    startLiveStream();
  } else {
    stopLiveStream();
  }
}

// ═══ DYNAMIC COLOR PICKER SETUP ═══
function renderColorSwatches() {
  const container = document.getElementById('color-swatch-picker');
  if (!container) return;
  
  container.innerHTML = '';
  
  NEON_COLORS.forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = `swatch ${STATE.sandbox.glowColor === color.glow ? 'active' : ''}`;
    swatch.style.backgroundColor = color.glow;
    swatch.style.setProperty('--swatch-glow', color.glow);
    swatch.title = color.name;
    
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      
      STATE.sandbox.glowColor = color.glow;
      STATE.sandbox.coreColor = color.core;
      
      updateSandboxPreview();
    });
    
    container.appendChild(swatch);
  });
}

// ═══ SANDBOX LIVE PREVIEW COMPILER ═══
function updateSandboxPreview() {
  const canvas = document.getElementById('sandbox-canvas');
  const line1 = document.getElementById('sandbox-text-line1');
  const line2 = document.getElementById('sandbox-text-line2');
  const borderContainer = document.getElementById('sandbox-border-container');
  const glowOverlay = document.getElementById('sandbox-glow-reflection');
  
  if (!canvas || !line1 || !line2 || !borderContainer) return;
  
  // Set background backing texture class
  canvas.className = `sandbox-preview-frame neon-backing-${STATE.sandbox.backing}`;
  
  // Primary Text Line
  line1.textContent = STATE.sandbox.text1 || 'Neon';
  
  // Secondary Text Line
  if (STATE.sandbox.text2.trim()) {
    line2.textContent = STATE.sandbox.text2;
    line2.style.display = 'block';
  } else {
    line2.style.display = 'none';
  }
  
  // Bind CSS custom variables to target selectors dynamically
  const glowColor = STATE.sandbox.glowColor;
  const coreColor = STATE.sandbox.coreColor;
  const intensity = STATE.sandbox.glowIntensity;
  const thickness = STATE.sandbox.tubeThickness;
  const font = STATE.sandbox.font;
  const textSize = STATE.sandbox.textSize || 3.5;
  
  // Apply styles to text lines
  [line1, line2].forEach(line => {
    line.style.setProperty('--glow-color', glowColor);
    line.style.setProperty('--core-color', coreColor);
    line.style.setProperty('--glow-intensity', intensity);
    line.style.setProperty('--tube-thickness', `${thickness}px`);
    line.style.setProperty('--text-size', `${textSize}rem`);
    line.style.setProperty('--font-style', font);
  });
  
  // Setup Border Shapes classes
  borderContainer.className = ''; // reset
  if (STATE.sandbox.border !== 'none') {
    if (STATE.sandbox.border === 'rounded-box') {
      borderContainer.className = 'border-frame-rounded-box neon-custom-border';
    } else if (STATE.sandbox.border === 'double-rounded') {
      // Need a nested inner box structure for double line
      borderContainer.className = 'border-frame-double-rounded neon-custom-border';
      
      // Let's restructure DOM dynamically if needed or apply double border styles
      borderContainer.innerHTML = `
        <div class="border-frame-double-rounded-inner neon-custom-border" style="--glow-color: ${glowColor}; --core-color: ${coreColor}; --glow-intensity: ${intensity}; --tube-thickness: ${thickness}px;">
          <div id="sandbox-text-line1" class="neon-text neon-custom-sign" style="--glow-color: ${glowColor}; --core-color: ${coreColor}; --glow-intensity: ${intensity}; --tube-thickness: ${thickness}px; --text-size: ${textSize}rem; --font-style: ${font};">${STATE.sandbox.text1 || 'Neon'}</div>
          <div id="sandbox-text-line2" class="neon-text neon-custom-sign" style="--glow-color: ${glowColor}; --core-color: ${coreColor}; --glow-intensity: ${intensity}; --tube-thickness: ${thickness}px; --text-size: ${textSize}rem; --font-style: ${font}; ${STATE.sandbox.text2.trim() ? 'display:block;' : 'display:none;'}">${STATE.sandbox.text2}</div>
        </div>
      `;
    } else if (STATE.sandbox.border === 'hexagon') {
      borderContainer.className = 'border-frame-hexagon neon-custom-border';
    }
    
    // Apply custom properties to border container
    borderContainer.style.setProperty('--glow-color', glowColor);
    borderContainer.style.setProperty('--core-color', coreColor);
    borderContainer.style.setProperty('--glow-intensity', intensity);
    borderContainer.style.setProperty('--tube-thickness', `${thickness}px`);
  } else {
    // Plain reset structure
    borderContainer.innerHTML = `
      <div id="sandbox-text-line1" class="neon-text neon-custom-sign" style="--glow-color: ${glowColor}; --core-color: ${coreColor}; --glow-intensity: ${intensity}; --tube-thickness: ${thickness}px; --text-size: ${textSize}rem; --font-style: ${font};">${STATE.sandbox.text1 || 'Neon'}</div>
      <div id="sandbox-text-line2" class="neon-text neon-custom-sign" style="--glow-color: ${glowColor}; --core-color: ${coreColor}; --glow-intensity: ${intensity}; --tube-thickness: ${thickness}px; --text-size: ${textSize}rem; --font-style: ${font}; ${STATE.sandbox.text2.trim() ? 'display:block;' : 'display:none;'}">${STATE.sandbox.text2}</div>
    `;
  }
  
  // Ambient glow overlay mapping (simulating the neon color reflection on the wall texture)
  if (glowOverlay) {
    glowOverlay.style.background = `radial-gradient(circle at center, ${hexToRgba(glowColor, 0.45 * intensity)} 0%, ${hexToRgba(glowColor, 0.1 * intensity)} 40%, transparent 75%)`;
  }
  
  // Update control value readouts
  document.getElementById('val-glow').textContent = `${intensity.toFixed(1)}x`;
  document.getElementById('val-thickness').textContent = `${thickness}px`;
  document.getElementById('val-size').textContent = `${textSize.toFixed(1)}rem`;
}

// Helper: Hex color to RGBA transition
function hexToRgba(hex, alpha) {
  let c;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
    c= hex.substring(1).split('');
    if(c.length== 3){
      c= [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c= '0x' + c.join('');
    return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
  }
  return `rgba(255,255,255,${alpha})`;
}

// ═══ FEED SIGN RENDERER ═══
function renderFeed(filter = 'all') {
  const container = document.getElementById('feed-grid-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Merge reference signs, custom user signs, and user posts
  let allItems = [];
  if (filter === 'all') {
    allItems = [
      ...REFERENCE_SIGNS.map(s => ({ ...s, sortDate: 0 })),
      ...STATE.customSigns.map(s => ({ ...s, sortDate: s.timestamp || 0 })),
      ...STATE.posts.map(p => ({ ...p, sortDate: p.timestamp || 0, isPost: true }))
    ];
    allItems.sort((a, b) => b.sortDate - a.sortDate);
  } else if (filter === 'custom') {
    allItems = [
      ...STATE.customSigns.map(s => ({ ...s, sortDate: s.timestamp || 0 })),
      ...STATE.posts.map(p => ({ ...p, sortDate: p.timestamp || 0, isPost: true }))
    ];
    allItems.sort((a, b) => b.sortDate - a.sortDate);
  } else if (filter === 'reference') {
    allItems = REFERENCE_SIGNS;
  } else if (filter === 'favorites') {
    allItems = [...REFERENCE_SIGNS, ...STATE.customSigns].filter(s => STATE.favorites.includes(s.id));
  }
  
  if (allItems.length === 0) {
    container.innerHTML = `
      <div class="empty-state liquid-glass">
        <div class="empty-state-icon">💡</div>
        <h3>No Vibes Found</h3>
        <p>There are no signs or posts matching this filter. Switch views or share a vibe!</p>
        <button class="btn-primary-action" id="btn-empty-goto-sandbox" style="margin-top: 10px;">Open Sandbox</button>
      </div>
    `;
    
    const emptyBtn = document.getElementById('btn-empty-goto-sandbox');
    if (emptyBtn) {
      emptyBtn.addEventListener('click', () => {
        navigateTo('sandbox');
      });
    }
    return;
  }
  
  allItems.forEach(item => {
    if (item.isPost) {
      const card = document.createElement('div');
      card.className = 'sign-card liquid-glass post-card';
      
      const timeString = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateString = new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
      
      card.innerHTML = `
        <div class="composer-header" style="padding: var(--space-md); border-bottom: 1px solid var(--color-border); align-items: center; width: 100%;">
          <div class="composer-avatar" style="width: 32px; height: 32px; font-size: 0.8rem; font-weight: 800; background: linear-gradient(135deg, var(--neon-purple-glow), var(--neon-cyan-glow));">
            ${item.author.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <div style="flex: 1; margin-left: 12px; text-align: left;">
            <div class="sign-name" style="font-size: 0.9rem; font-weight: bold; margin: 0;">${item.author}</div>
            <div class="sign-author" style="font-size: 0.75rem; color: var(--color-text-secondary); margin: 0;">${item.handle}</div>
          </div>
          <div style="font-size: 0.7rem; color: var(--color-text-secondary);">${dateString} ${timeString}</div>
        </div>
        <div style="padding: var(--space-md); font-size: 0.95rem; line-height: 1.6; word-break: break-word; text-align: left; width: 100%; z-index: 6;">
          ${parseStickerShortcodes(item.text)}
        </div>
        <div style="padding: var(--space-sm) var(--space-md); display: flex; gap: var(--space-md); border-top: 1px solid var(--color-border); font-size: 0.8rem; color: var(--color-text-secondary); width: 100%; margin-top: auto; z-index: 6; background: rgba(16, 16, 24, 0.9);">
          <span>💚 Reacted</span>
          <span style="margin-left: auto; cursor: pointer; color: var(--neon-cyan-glow);" onclick="window.showToast('Link copied to clipboard!')">🔗 Share</span>
        </div>
      `;
      
      // Render overlays absolutely on the post card
      if (item.overlays && item.overlays.length > 0) {
        const overlayContainer = document.createElement('div');
        overlayContainer.className = 'flying-reactions-container';
        overlayContainer.style.position = 'absolute';
        overlayContainer.style.inset = '0';
        overlayContainer.style.zIndex = '5';
        overlayContainer.style.pointerEvents = 'none';
        
        item.overlays.forEach(ov => {
          const ovEl = document.createElement('div');
          ovEl.className = `overlaid-sticker ${ov.type === 'pixel' ? 'sticker-pixel' : ''}`;
          ovEl.style.setProperty('--overlay-x', `${ov.x}%`);
          ovEl.style.setProperty('--overlay-y', `${ov.y}%`);
          ovEl.style.setProperty('--overlay-size', `${ov.size}px`);
          ovEl.innerHTML = getStickerMarkup({
            type: ov.type,
            file: ov.file,
            shortcode: ov.shortcode,
            animationClass: ov.anim
          });
          overlayContainer.appendChild(ovEl);
        });
        
        card.appendChild(overlayContainer);
      }
      
      container.appendChild(card);
    } else {
      const sign = item;
      const card = document.createElement('div');
      card.className = 'sign-card liquid-glass';
      
      const glowColor = sign.glowColor || '#ff007f';
      const isLiked = STATE.favorites.includes(sign.id);
      
      card.innerHTML = `
        <div class="sign-card-preview neon-backing-${sign.backing}">
          <div class="neon-glow-overlay" style="background: radial-gradient(circle at center, ${hexToRgba(glowColor, 0.4)} 0%, ${hexToRgba(glowColor, 0.08)} 50%, transparent 80%);"></div>
          <div style="z-index: 3;">
            ${sign.htmlContent}
          </div>
        </div>
        
        <div class="sign-card-details">
          <div class="sign-card-meta">
            <div>
              <div class="sign-name">${sign.name}</div>
              <div class="sign-author">by ${sign.author}</div>
            </div>
            <div class="sign-tags">
              ${sign.tags.map(t => `<span class="sign-tag">${t}</span>`).join('')}
            </div>
          </div>
          
          <div class="sign-actions">
            <button class="btn-primary-action" data-action="clone" data-id="${sign.id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
              Edit Sign
            </button>
            
            <div class="action-group">
              <button class="card-action-btn ${isLiked ? 'liked' : ''}" data-action="like" data-id="${sign.id}" title="Add to Favorites">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <button class="card-action-btn" data-action="copy" data-id="${sign.id}" title="Copy CSS Code">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;
      container.appendChild(card);
    }
  });
}

// Handle action triggers inside Feed
document.getElementById('feed-grid-container').addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  
  const action = btn.getAttribute('data-action');
  const signId = btn.getAttribute('data-id');
  if (!action || !signId) return;
  
  handleCardAction(action, signId, btn);
});

// ═══ PROFILE GALLERY RENDERER ═══
function renderProfile(tab = 'creations') {
  const container = document.getElementById('profile-gallery-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  let list = [];
  if (tab === 'creations') {
    list = STATE.customSigns;
  } else if (tab === 'favorites') {
    const allSigns = [...REFERENCE_SIGNS, ...STATE.customSigns];
    list = allSigns.filter(s => STATE.favorites.includes(s.id));
  }
  
  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state liquid-glass" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">💭</div>
        <h3>No designs here yet</h3>
        <p>${tab === 'creations' ? 'Use the Sandbox workspace to design and save your first custom neon sign!' : 'Explore the Feed gallery and tap the heart icon to save designs.'}</p>
        <button class="btn-primary-action" id="btn-profile-empty-action" style="margin-top: 10px;">
          ${tab === 'creations' ? 'Go to Sandbox' : 'Explore Feed'}
        </button>
      </div>
    `;
    
    document.getElementById('btn-profile-empty-action').addEventListener('click', () => {
      navigateTo(tab === 'creations' ? 'sandbox' : 'feed');
    });
    return;
  }
  
  list.forEach(sign => {
    const card = document.createElement('div');
    card.className = 'sign-card liquid-glass';
    card.style.height = '420px'; // Slightly shorter card for profile gallery
    
    const glowColor = sign.glowColor || '#ff007f';
    const isLiked = STATE.favorites.includes(sign.id);
    
    card.innerHTML = `
      <div class="sign-card-preview neon-backing-${sign.backing}" style="min-height: 260px;">
        <div class="neon-glow-overlay" style="background: radial-gradient(circle at center, ${hexToRgba(glowColor, 0.4)} 0%, ${hexToRgba(glowColor, 0.08)} 50%, transparent 80%);"></div>
        <div style="z-index: 3; transform: scale(0.85);">
          ${sign.htmlContent}
        </div>
      </div>
      
      <div class="sign-card-details" style="padding: 12px; gap: 4px;">
        <div class="sign-card-meta">
          <div>
            <div class="sign-name" style="font-size: 1rem;">${sign.name}</div>
          </div>
          <div class="sign-tags">
            ${sign.tags.map(t => `<span class="sign-tag" style="padding: 1px 6px; font-size: 0.65rem;">${t}</span>`).join('')}
          </div>
        </div>
        
        <div class="sign-actions" style="margin-top: 4px; padding-top: 8px;">
          <button class="btn-primary-action" style="padding: 6px 10px; font-size: 0.75rem;" data-action="clone" data-id="${sign.id}">
            Edit Sign
          </button>
          
          <div class="action-group">
            <button class="card-action-btn ${isLiked ? 'liked' : ''}" style="width:30px; height:30px;" data-action="like" data-id="${sign.id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            <button class="card-action-btn" style="width:30px; height:30px;" data-action="copy" data-id="${sign.id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// Handle action triggers inside Profile
document.getElementById('profile-gallery-container').addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  
  const action = btn.getAttribute('data-action');
  const signId = btn.getAttribute('data-id');
  if (!action || !signId) return;
  
  handleCardAction(action, signId, btn);
});

// ═══ CORE ACTION ROUTERS ═══
function handleCardAction(action, signId, element) {
  const allSigns = [...REFERENCE_SIGNS, ...STATE.customSigns];
  const sign = allSigns.find(s => s.id === signId);
  if (!sign) return;
  
  if (action === 'clone') {
    // Load config into Sandbox State
    STATE.sandbox.id = sign.type === 'custom' ? sign.id : null; // Keep ID if custom, so overwrite works
    STATE.sandbox.text1 = sign.styleData.text1;
    STATE.sandbox.text2 = sign.styleData.text2;
    STATE.sandbox.font = sign.styleData.font;
    STATE.sandbox.border = sign.styleData.border;
    STATE.sandbox.glowColor = sign.styleData.glowColor;
    STATE.sandbox.coreColor = sign.styleData.coreColor;
    STATE.sandbox.glowIntensity = sign.styleData.glowIntensity;
    STATE.sandbox.tubeThickness = sign.styleData.tubeThickness;
    STATE.sandbox.textSize = sign.styleData.textSize || (sign.styleData.font.includes('Sacramento') ? 4.5 : 3.5);
    STATE.sandbox.backing = sign.styleData.backing;
    
    // Update inputs
    document.getElementById('input-text-1').value = STATE.sandbox.text1;
    document.getElementById('input-text-2').value = STATE.sandbox.text2;
    document.getElementById('select-font').value = STATE.sandbox.font;
    document.getElementById('input-glow').value = STATE.sandbox.glowIntensity;
    document.getElementById('input-thickness').value = STATE.sandbox.tubeThickness;
    document.getElementById('input-size').value = STATE.sandbox.textSize;
    
    // Border buttons
    document.querySelectorAll('.border-option-btn').forEach(btn => {
      if (btn.getAttribute('data-border') === STATE.sandbox.border) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Backing buttons
    document.querySelectorAll('.backdrop-btn').forEach(btn => {
      if (btn.getAttribute('data-backing') === STATE.sandbox.backing) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Update color swatches active state
    document.querySelectorAll('.swatch').forEach(sw => {
      if (sw.style.backgroundColor === hexToRgbString(STATE.sandbox.glowColor)) {
        sw.classList.add('active');
      } else {
        sw.classList.remove('active');
      }
    });
    
    updateSandboxPreview();
    renderColorSwatches();
    navigateTo('sandbox');
    showToast('Sign configuration loaded in Sandbox!');
    
  } else if (action === 'like') {
    const index = STATE.favorites.indexOf(signId);
    if (index > -1) {
      STATE.favorites.splice(index, 1);
      element.classList.remove('liked');
      element.querySelector('svg').setAttribute('fill', 'none');
      showToast('Removed from favorites.');
    } else {
      STATE.favorites.push(signId);
      element.classList.add('liked');
      element.querySelector('svg').setAttribute('fill', 'currentColor');
      showToast('Added to favorites!');
    }
    saveToStorage();
    updateProfileDetails();
    
    // Refresh lists dynamically
    if (STATE.currentView === 'feed') {
      const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
      renderFeed(activeFilter);
    } else if (STATE.currentView === 'profile') {
      const activeTab = document.querySelector('.profile-tab-btn.active').getAttribute('data-tab');
      renderProfile(activeTab);
    }
    
  } else if (action === 'copy') {
    const cssCode = generateCSSRuleString(sign);
    copyToClipboard(cssCode);
  }
}

// Color conversion helper for swatches match
function hexToRgbString(hex) {
  let c;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
    c= hex.substring(1).split('');
    if(c.length== 3){
      c= [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c= '0x' + c.join('');
    return 'rgb(' + [(c>>16)&255, (c>>8)&255, c&255].join(', ') + ')';
  }
  return hex;
}

// ═══ GENERATING AND COPYING CLEAN CSS CODES ═══
function generateCSSRuleString(sign) {
  const data = sign.styleData;
  const borderRule = data.border !== 'none' ? `
/* Border Frame styles */
.neon-border {
  border: ${data.tubeThickness}px solid ${data.coreColor};
  border-radius: 12px;
  box-shadow:
    0 0 2px #fff,
    inset 0 0 ${data.tubeThickness}px ${data.coreColor},
    0 0 ${data.tubeThickness}px ${data.coreColor},
    inset 0 0 ${8 * data.glowIntensity}px ${data.glowColor},
    0 0 ${8 * data.glowIntensity}px ${data.glowColor},
    inset 0 0 ${15 * data.glowIntensity}px ${data.glowColor},
    0 0 ${15 * data.glowIntensity}px ${data.glowColor};
}` : '';

  return `/* ═══ CUSTOM NEON CSS RENDERER ═══ */
.neon-sign {
  font-family: ${data.font};
  font-size: ${data.textSize || 3.5}rem;
  color: ${data.coreColor};
  font-weight: 400;
  text-align: center;
  letter-spacing: 2px;
  
  /* Multilayer tube outer & inner glow simulation */
  text-shadow:
    0 0 ${2 * data.glowIntensity}px #fff,
    0 0 ${data.tubeThickness * data.glowIntensity}px ${data.coreColor},
    0 0 ${8 * data.glowIntensity}px ${data.glowColor},
    0 0 ${15 * data.glowIntensity}px ${data.glowColor},
    0 0 ${30 * data.glowIntensity}px ${data.glowColor},
    0 0 ${50 * data.glowIntensity}px ${data.glowColor},
    0 0 ${80 * data.glowIntensity}px ${data.glowColor};
}${borderRule}
`;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('CSS Styles copied to clipboard!');
  }).catch(() => {
    // Fallback text copy
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('CSS Styles copied to clipboard!');
    } catch (err) {
      showToast('Failed to copy code.');
    }
    document.body.removeChild(textarea);
  });
}

// ═══ TOAST FEEDBACK MODULE ═══
function showToast(message) {
  const container = document.getElementById('toast-holder');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ═══ DYNAMIC FEED COMPILER ═══
function compileCustomSignHTML(data) {
  const glowColor = data.glowColor;
  const coreColor = data.coreColor;
  const intensity = data.glowIntensity;
  const thickness = data.tubeThickness;
  const font = data.font;
  const textSize = data.textSize || 3.5;
  
  const inlineStyles = `style="--glow-color: ${glowColor}; --core-color: ${coreColor}; --glow-intensity: ${intensity}; --tube-thickness: ${thickness}px; --text-size: ${textSize}rem; --font-style: ${font};"`;
  
  let borderClass = '';
  let borderOpen = '';
  let borderClose = '';
  
  if (data.border === 'rounded-box') {
    borderClass = 'border-frame-rounded-box neon-custom-border';
  } else if (data.border === 'double-rounded') {
    borderOpen = `<div class="border-frame-double-rounded neon-custom-border" ${inlineStyles}><div class="border-frame-double-rounded-inner neon-custom-border" ${inlineStyles}>`;
    borderClose = `</div></div>`;
  } else if (data.border === 'hexagon') {
    borderClass = 'border-frame-hexagon neon-custom-border';
  }
  
  if (data.border === 'double-rounded') {
    return `
      <div style="z-index: 3;">
        ${borderOpen}
          <div class="neon-text neon-custom-sign" ${inlineStyles}>${data.text1}</div>
          ${data.text2 ? `<div class="neon-text neon-custom-sign" ${inlineStyles}>${data.text2}</div>` : ''}
        ${borderClose}
      </div>
    `;
  }
  
  return `
    <div class="${borderClass}" ${borderClass ? inlineStyles : ''}>
      <div class="neon-text neon-custom-sign" ${inlineStyles}>${data.text1}</div>
      ${data.text2 ? `<div class="neon-text neon-custom-sign" ${inlineStyles}>${data.text2}</div>` : ''}
    </div>
  `;
}

// ═══ SANDBOX ACTION TRIGGERS ═══
function publishSandboxSign() {
  const text1 = document.getElementById('input-text-1').value.trim();
  const text2 = document.getElementById('input-text-2').value.trim();
  
  if (!text1) {
    showToast('Primary Text cannot be empty!');
    return;
  }
  
  const id = STATE.sandbox.id || `custom-${Date.now()}`;
  
  const styleData = {
    text1: text1,
    text2: text2,
    font: STATE.sandbox.font,
    border: STATE.sandbox.border,
    glowColor: STATE.sandbox.glowColor,
    coreColor: STATE.sandbox.coreColor,
    glowIntensity: STATE.sandbox.glowIntensity,
    tubeThickness: STATE.sandbox.tubeThickness,
    textSize: STATE.sandbox.textSize || 3.5,
    backing: STATE.sandbox.backing
  };
  
  const signObject = {
    id: id,
    name: text1,
    author: STATE.profile.name,
    tags: [STATE.sandbox.font.split(',')[0].replace(/'/g, ''), STATE.sandbox.border === 'none' ? 'Clean' : 'Framed'],
    type: 'custom',
    backing: STATE.sandbox.backing,
    glowColor: STATE.sandbox.glowColor,
    coreColor: STATE.sandbox.coreColor,
    htmlContent: compileCustomSignHTML(styleData),
    styleData: styleData
  };
  
  // Save or Update
  const existingIdx = STATE.customSigns.findIndex(s => s.id === id);
  if (existingIdx > -1) {
    STATE.customSigns[existingIdx] = signObject;
    showToast('Custom sign updated in feed!');
  } else {
    STATE.customSigns.push(signObject);
    showToast('Custom sign published to feed!');
  }
  
  saveToStorage();
  updateProfileDetails();
  navigateTo('feed');
}

function saveSandboxSignToProfile() {
  const text1 = document.getElementById('input-text-1').value.trim();
  const text2 = document.getElementById('input-text-2').value.trim();
  
  if (!text1) {
    showToast('Primary Text cannot be empty!');
    return;
  }
  
  const id = STATE.sandbox.id || `custom-${Date.now()}`;
  
  const styleData = {
    text1: text1,
    text2: text2,
    font: STATE.sandbox.font,
    border: STATE.sandbox.border,
    glowColor: STATE.sandbox.glowColor,
    coreColor: STATE.sandbox.coreColor,
    glowIntensity: STATE.sandbox.glowIntensity,
    tubeThickness: STATE.sandbox.tubeThickness,
    textSize: STATE.sandbox.textSize || 3.5,
    backing: STATE.sandbox.backing
  };
  
  const signObject = {
    id: id,
    name: text1,
    author: STATE.profile.name,
    tags: [STATE.sandbox.font.split(',')[0].replace(/'/g, ''), STATE.sandbox.border === 'none' ? 'Clean' : 'Framed'],
    type: 'custom',
    backing: STATE.sandbox.backing,
    glowColor: STATE.sandbox.glowColor,
    coreColor: STATE.sandbox.coreColor,
    htmlContent: compileCustomSignHTML(styleData),
    styleData: styleData
  };
  
  const existingIdx = STATE.customSigns.findIndex(s => s.id === id);
  if (existingIdx > -1) {
    STATE.customSigns[existingIdx] = signObject;
    showToast('Saved update to profile creations.');
  } else {
    STATE.customSigns.push(signObject);
    showToast('Saved sign to profile creations!');
  }
  
  saveToStorage();
  updateProfileDetails();
}

// ═══ PROFILE DATA UPDATER ═══
function updateProfileDetails() {
  // Stats
  document.getElementById('stat-created-count').textContent = STATE.customSigns.length;
  document.getElementById('stat-favorites-count').textContent = STATE.favorites.length;
  
  // Fields
  document.getElementById('profile-name-display').textContent = STATE.profile.name;
  document.getElementById('profile-handle-display').textContent = STATE.profile.handle;
  document.getElementById('profile-bio-display').innerHTML = parseStickerShortcodes(STATE.profile.bio);
  
  // Avatar letters
  const letters = STATE.profile.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  document.getElementById('profile-avatar-display').textContent = letters || 'FL';
  
  const composerAvatar = document.getElementById('composer-avatar-display');
  if (composerAvatar) {
    composerAvatar.textContent = letters || 'FL';
  }
}

function saveProfileEdits() {
  const name = document.getElementById('edit-display-name').value.trim();
  const handle = document.getElementById('edit-handle').value.trim();
  const bio = document.getElementById('edit-bio').value.trim();
  
  if (!name || !handle) {
    showToast('Name and Handle are required.');
    return;
  }
  
  STATE.profile.name = name;
  STATE.profile.handle = handle;
  STATE.profile.bio = bio;
  
  saveToStorage();
  updateProfileDetails();
  
  // Close Modal
  document.getElementById('modal-edit-profile').classList.remove('active');
  showToast('Profile settings updated successfully!');
}

// ═══ STICKER & LIVE STREAM INTEGRATION ═══
const STICKER_ASSETS = [
  { name: 'Neon Cannabis', file: 'assets/stickers/neon/neon_cannabis.gif?v=6', shortcode: ':neon-cannabis:', type: 'neon', animationClass: 'none' },
  { name: 'Pixel Smile', file: 'assets/stickers/pixel/pixel_emoji_smile.gif?v=6', shortcode: ':pixel-smile:', type: 'pixel', animationClass: 'none' },
  { name: 'Stay High', file: 'assets/stickers/neon/neon_stay_high.gif?v=6', shortcode: ':neon-stay-high:', type: 'neon', animationClass: 'none' },
  { name: 'Neon Heart Joint', file: 'assets/stickers/neon/neon_heart_joint.gif?v=6', shortcode: ':neon-heart-joint:', type: 'neon', animationClass: 'none' },
  { name: 'Pixel Heart', file: 'assets/stickers/pixel/pixel_emoji_heart.gif?v=6', shortcode: ':pixel-heart:', type: 'pixel', animationClass: 'none' },
  { name: 'Neon Chill Cloud', file: 'assets/stickers/neon/neon_chill_cloud.gif?v=6', shortcode: ':neon-chill-cloud:', type: 'neon', animationClass: 'none' },
  { name: 'Neon Blunt Flame', file: 'assets/stickers/neon/neon_blunt_flame.gif?v=6', shortcode: ':neon-blunt-flame:', type: 'neon', animationClass: 'none' },
  { name: 'Pixel Coffee Steam', file: 'assets/stickers/pixel/pixel_coffee_steam.gif?v=6', shortcode: ':pixel-coffee-steam:', type: 'pixel', animationClass: 'none' },
  { name: 'Cyberpunk Skull', file: 'assets/stickers/cyberpunk/cyberpunk_optic_skull.gif?v=6', shortcode: ':cyberpunk-skull:', type: 'cyberpunk', animationClass: 'none' },
  { name: 'Anime Sparkle Eyes', file: 'assets/stickers/anime/anime_sparkle_eyes.gif?v=6', shortcode: ':anime-sparkle-eyes:', type: 'anime', animationClass: 'none' },
  { name: 'Flying Eyeball Pi', file: 'assets/stickers/anime/eyeball_pi_flyaway.gif?v=6', shortcode: ':eyeball-pi:', type: 'anime', animationClass: 'none' },
  { name: 'Swooping Eyeball Pi', file: 'assets/stickers/anime/eyeball_pi_swoop.gif?v=6', shortcode: ':eyeball-pi-swoop:', type: 'anime', animationClass: 'none' },
  { name: 'July 4th Chill', file: 'assets/stickers/pixel/pixel_july4_chill.gif?v=6', shortcode: ':july4-chill:', type: 'pixel', animationClass: 'none' },
  { name: 'Cyberpunk Hologram', file: 'assets/stickers/cyberpunk/cyberpunk_hologram.gif?v=6', shortcode: ':cyberpunk-hologram:', type: 'cyberpunk', animationClass: 'none' },
  { name: 'Scene: Waterfall Chill', file: 'assets/stickers/cyberpunk/cyberpunk_hologram_waterfall.jpg?v=6', shortcode: ':scene-waterfall:', type: 'cyberpunk', animationClass: 'none' },
  { name: 'Scene: Pixel Forest', file: 'assets/stickers/cyberpunk/pixel_cyberpunk_nature.jpg?v=6', shortcode: ':scene-pixel-forest:', type: 'pixel', animationClass: 'none' },
  { name: 'Scene: Sunset Beach', file: 'assets/stickers/cyberpunk/pixel_sunset_beach.jpg?v=6', shortcode: ':scene-sunset-beach:', type: 'pixel', animationClass: 'none' },

  // 10 Partying & Cannabis Action Stickers
  { name: 'Pixel Party Dance', file: 'assets/stickers/pixel/pixel_party_dance.jpg?v=7', shortcode: ':pixel-party-dance:', type: 'pixel', animationClass: 'none' },
  { name: 'Pixel Smoke Ring', file: 'assets/stickers/pixel/pixel_smoke_ring.jpg?v=7', shortcode: ':pixel-smoke-ring:', type: 'pixel', animationClass: 'none' },
  { name: 'Neon DJ Groove', file: 'assets/stickers/neon/neon_dj_groove.jpg?v=7', shortcode: ':neon-dj-groove:', type: 'neon', animationClass: 'none' },
  { name: 'Neon Cheers Toast', file: 'assets/stickers/neon/neon_cheers_toast.jpg?v=7', shortcode: ':neon-cheers-toast:', type: 'neon', animationClass: 'none' },
  { name: 'Anime Lounge Chill', file: 'assets/stickers/anime/anime_lounge_chill.gif?v=6', shortcode: ':anime-lounge-chill:', type: 'anime', animationClass: 'none' },
  { name: 'Anime Dance Party', file: 'assets/stickers/anime/anime_dance_party.jpg?v=7', shortcode: ':anime-dance-party:', type: 'anime', animationClass: 'none' },
  { name: 'Cyberpunk Smoke Visor', file: 'assets/stickers/cyberpunk/cyberpunk_smoke_visor.jpg?v=7', shortcode: ':cyberpunk-smoke-visor:', type: 'cyberpunk', animationClass: 'none' },
  { name: 'Cyberpunk Deck Spin', file: 'assets/stickers/cyberpunk/cyberpunk_deck_spin.jpg?v=7', shortcode: ':cyberpunk-deck-spin:', type: 'cyberpunk', animationClass: 'none' },
  { name: 'Cyberpunk Neon Puff', file: 'assets/stickers/cyberpunk/cyberpunk_neon_puff.jpg?v=7', shortcode: ':cyberpunk-neon-puff:', type: 'cyberpunk', animationClass: 'none' },
  { name: 'Cyberpunk Dance Flow', file: 'assets/stickers/cyberpunk/cyberpunk_dance_flow.jpg?v=7', shortcode: ':cyberpunk-dance-flow:', type: 'cyberpunk', animationClass: 'none' },

  // 5 Cannabis & Food Mixed Stickers
  { name: 'Pixel Coffee Weed', file: 'assets/stickers/pixel/pixel_coffee_weed.jpg?v=7', shortcode: ':pixel-coffee-weed:', type: 'pixel', animationClass: 'none' },
  { name: 'Pixel Pizza Weed', file: 'assets/stickers/pixel/pixel_pizza_weed.jpg?v=7', shortcode: ':pixel-pizza-weed:', type: 'pixel', animationClass: 'none' },
  { name: 'Neon Donut Weed', file: 'assets/stickers/neon/neon_donut_weed.jpg?v=7', shortcode: ':neon-donut-weed:', type: 'neon', animationClass: 'none' },
  { name: 'Anime Baking Weed', file: 'assets/stickers/anime/anime_baking_weed.gif?v=6', shortcode: ':anime-baking-weed:', type: 'anime', animationClass: 'none' },
  { name: 'Pixel Popcorn Weed', file: 'assets/stickers/pixel/pixel_popcorn_weed.gif?v=6', shortcode: ':pixel-popcorn-weed:', type: 'pixel', animationClass: 'none' }
];


function getStickerMarkup(sticker, customClass = '', customStyle = '') {
  const isPixel = sticker.type === 'pixel';
  const baseClass = isPixel ? 'inline-sticker sticker-pixel' : 'inline-sticker';
  const animClass = (sticker.animationClass && sticker.animationClass !== 'none') ? sticker.animationClass : '';
  const finalClass = animClass ? `${baseClass} ${animClass} ${customClass}` : `${baseClass} ${customClass}`;
  const styleAttr = customStyle ? `style="${customStyle}"` : '';
  
  return `<img src="${sticker.file}" class="${finalClass}" alt="${sticker.name}" title="${sticker.shortcode}" ${styleAttr}>`;
}

function parseStickerShortcodes(text) {
  if (!text) return '';
  let output = text;
  STICKER_ASSETS.forEach(sticker => {
    const baseShortcode = sticker.shortcode.replace(/:/g, '');
    const escapedBase = baseShortcode.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    
    // Match :baseShortcode|size|speed|anim: where each parameter is optional
    const regex = new RegExp(`:${escapedBase}(?:\\|(\\d+))?(?:\\|([a-z0-9.]+))?(?:\\|([a-z-]+))?:`, 'g');
    
    output = output.replace(regex, (match, size, speed, anim) => {
      let customStyle = '';
      if (size) {
        customStyle += `width: ${size}px; height: ${size}px;`;
      }
      
      let speedVal = '';
      if (speed) {
        if (speed === 'slow') speedVal = '1.8';
        else if (speed === 'fast') speedVal = '0.5';
        else if (speed === 'normal') speedVal = '1.0';
        else speedVal = speed;
      }
      
      const activeAnim = (anim && anim !== 'none') ? `animate-${anim}` : sticker.animationClass;
      
      if (speedVal && activeAnim && activeAnim !== 'none') {
        let baseDuration = 1.5;
        if (activeAnim.includes('pulse')) baseDuration = 2.5;
        else if (activeAnim.includes('bounce')) baseDuration = 1.5;
        else if (activeAnim.includes('flicker')) baseDuration = 4.0;
        else if (activeAnim.includes('heartbeat')) baseDuration = 1.2;
        else if (activeAnim.includes('float')) baseDuration = 3.0;
        
        const finalDuration = parseFloat(speedVal) * baseDuration;
        customStyle += `animation-duration: ${finalDuration}s;`;
      }
      
      return getStickerMarkup({
        ...sticker,
        animationClass: activeAnim
      }, '', customStyle);
    });
  });
  return output;
}

function filterGridStickers(grid, config, category) {
  grid.innerHTML = '';
  const filtered = STICKER_ASSETS.filter(sticker => category === 'all' || sticker.type === category);

  filtered.forEach(sticker => {
    const item = document.createElement('div');
    item.className = 'sticker-item';
    item.innerHTML = getStickerMarkup(sticker);
    
    item.addEventListener('click', () => {
      if (config.isLive) {
        triggerFloatingReaction(sticker.file, sticker.type);
        const input = document.getElementById(config.textareaId);
        if (input) {
          input.value += ' ' + sticker.shortcode + ' ';
          input.focus();
        }
      } else if (config.textareaId === 'composer-textarea') {
        openStickerPopover(item, sticker, config.textareaId);
      } else {
        const textarea = document.getElementById(config.textareaId);
        if (textarea) {
          const startPos = textarea.selectionStart;
          const endPos = textarea.selectionEnd;
          const value = textarea.value;
          textarea.value = value.substring(0, startPos) + sticker.shortcode + value.substring(endPos);
          textarea.focus();
          textarea.selectionStart = textarea.selectionEnd = startPos + sticker.shortcode.length;
        }
      }
    });
    grid.appendChild(item);
  });
}

function renderStickerKeyboards() {
  const keyboardConfigs = [
    { gridId: 'composer-sticker-grid', textareaId: 'composer-textarea' },
    { gridId: 'bio-sticker-grid', textareaId: 'edit-bio' },
    { gridId: 'live-sticker-grid', textareaId: 'live-chat-input', isLive: true }
  ];

  keyboardConfigs.forEach(config => {
    const grid = document.getElementById(config.gridId);
    if (!grid) return;

    // Check if category bar already exists, if not, create it
    const keyboardContainer = grid.parentElement;
    let categoriesBar = keyboardContainer.querySelector('.sticker-categories');
    if (!categoriesBar) {
      categoriesBar = document.createElement('div');
      categoriesBar.className = 'sticker-categories';
      categoriesBar.innerHTML = `
        <button class="category-tab active" data-category="all">All</button>
        <button class="category-tab" data-category="neon">Neon</button>
        <button class="category-tab" data-category="pixel">Pixel</button>
        <button class="category-tab" data-category="cyberpunk">Cyberpunk</button>
        <button class="category-tab" data-category="anime">Anime</button>
      `;
      // Insert right before the grid
      keyboardContainer.insertBefore(categoriesBar, grid);
      
      // Add event listeners to tabs
      categoriesBar.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
          categoriesBar.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const category = tab.getAttribute('data-category');
          filterGridStickers(grid, config, category);
        });
      });
    }

    // Reset categories tabs to 'All'
    categoriesBar.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
    categoriesBar.querySelector('[data-category="all"]').classList.add('active');

    // Populate all stickers initially
    filterGridStickers(grid, config, 'all');
  });
}

let streamActive = false;
let streamDuration = 0;
let streamTimer = null;
let viewerCount = 420;
let reactionCount = 0;
let chatMockInterval = null;

const MOCK_CHAT_MESSAGES = [
  "Yooo that cannabis leaf neon is insane! 🔥",
  "stay high fellas :neon-stay-high:",
  "this app is gorgeous, love the glassmorphism layout",
  "chill vibes only here :neon-chill-cloud:",
  "can we buy these signs??",
  "omg crossed joints heart! :neon-heart-joint: so creative",
  "Is this running on Nano Banana? 😂",
  "such a sick profile setup",
  "check the bio! :neon-cannabis: :pixel-smile:",
  "reaction spam go!! :pixel-heart: :pixel-heart: :pixel-heart:",
  "absolute masterpiece design!"
];

const MOCK_USERNAMES = [
  "@stoned_coder", "@neon_dreams", "@retro_gamer", "@grazzhopper", "@bud_builder", "@cyber_chill", "@glass_glow"
];

function startLiveStream() {
  if (streamActive) return;
  streamActive = true;
  streamDuration = 0;
  reactionCount = 0;
  viewerCount = 420;
  
  document.getElementById('live-viewer-count').innerText = `${viewerCount} viewers`;
  document.getElementById('live-stat-likes').innerText = reactionCount;
  document.getElementById('live-stat-duration').innerText = '00:00';
  document.getElementById('btn-toggle-stream-state').innerText = 'Pause Live Stream';
  
  const chatBox = document.getElementById('live-chat-messages');
  if (chatBox) {
    chatBox.innerHTML = '<div class="chat-msg system"><span>System:</span> Live stream started. Send reactions and vibes!</div>';
  }

  streamTimer = setInterval(() => {
    streamDuration++;
    const mins = String(Math.floor(streamDuration / 60)).padStart(2, '0');
    const secs = String(streamDuration % 60).padStart(2, '0');
    document.getElementById('live-stat-duration').innerText = `${mins}:${secs}`;
    
    viewerCount += Math.floor(Math.random() * 7) - 3;
    if (viewerCount < 10) viewerCount = 10;
    document.getElementById('live-viewer-count').innerText = `${viewerCount} viewers`;
  }, 1000);

  chatMockInterval = setInterval(() => {
    if (!streamActive) return;
    const randomUser = MOCK_USERNAMES[Math.floor(Math.random() * MOCK_USERNAMES.length)];
    const randomText = MOCK_CHAT_MESSAGES[Math.floor(Math.random() * MOCK_CHAT_MESSAGES.length)];
    
    sendChatMessage(randomUser, randomText);
    
    if (Math.random() > 0.4) {
      const randomSticker = STICKER_ASSETS[Math.floor(Math.random() * STICKER_ASSETS.length)];
      triggerFloatingReaction(randomSticker.file, randomSticker.type);
    }
  }, 3500);

  updateLiveStreamBackdrop();
}

function stopLiveStream() {
  streamActive = false;
  clearInterval(streamTimer);
  clearInterval(chatMockInterval);
  const btn = document.getElementById('btn-toggle-stream-state');
  if (btn) btn.innerText = 'Resume Live Stream';
}

function updateLiveStreamBackdrop() {
  const select = document.getElementById('select-live-bg');
  const canvas = document.getElementById('live-bg-canvas');
  if (!select || !canvas) return;
  
  canvas.className = `live-background-canvas ${select.value}`;
}

function sendChatMessage(username, text) {
  const chatBox = document.getElementById('live-chat-messages');
  if (!chatBox) return;
  
  const msgEl = document.createElement('div');
  msgEl.className = 'chat-msg';
  msgEl.innerHTML = `<span>${username}:</span> ${parseStickerShortcodes(text)}`;
  chatBox.appendChild(msgEl);
  
  chatBox.scrollTop = chatBox.scrollHeight;
}

function triggerFloatingReaction(stickerPath, type) {
  const container = document.getElementById('reactions-container');
  if (!container) return;
  
  reactionCount++;
  document.getElementById('live-stat-likes').innerText = reactionCount;
  
  const sticker = STICKER_ASSETS.find(s => s.file === stickerPath || s.file.split('?')[0] === stickerPath.split('?')[0]);
  const reaction = document.createElement('div');
  reaction.className = `flying-reaction ${type === 'pixel' ? 'sticker-pixel' : ''}`;
  if (sticker) {
    reaction.innerHTML = getStickerMarkup(sticker);
  } else {
    reaction.innerHTML = `<img src="${stickerPath}" alt="reaction">`;
  }
  
  const startX = 10 + Math.random() * 70;
  const rotation = Math.floor(Math.random() * 60) - 30;
  const speedSlider = document.getElementById('input-reaction-speed');
  const speedFactor = speedSlider ? parseFloat(speedSlider.value) : 2;
  const duration = (3 + Math.random() * 2) / speedFactor;
  
  reaction.style.left = `${startX}%`;
  reaction.style.transform = `rotate(${rotation}deg)`;
  
  const driftX = (Math.random() * 160 - 80);
  reaction.style.setProperty('--drift-x', `${driftX}px`);
  
  const animName = `flyUp_${Math.floor(Math.random() * 100000)}`;
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes ${animName} {
      0% {
        bottom: -50px;
        opacity: 0;
        transform: scale(0.3) rotate(${rotation}deg);
      }
      15% {
        opacity: 0.95;
        transform: scale(1.1) rotate(${rotation + 5}deg);
      }
      50% {
        transform: scale(1.0) translate(${driftX / 2}px, -150px) rotate(${rotation - 5}deg);
      }
      100% {
        bottom: 85%;
        opacity: 0;
        transform: scale(0.8) translate(${driftX}px, -350px) rotate(${rotation + 15}deg);
      }
    }
  `;
  document.head.appendChild(style);
  
  reaction.style.animation = `${animName} ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
  
  container.appendChild(reaction);
  
  setTimeout(() => {
    reaction.remove();
    style.remove();
  }, duration * 1000 + 100);
}

function publishVibePost() {
  const textarea = document.getElementById('composer-textarea');
  if (!textarea) return;
  const text = textarea.value.trim();
  const hasOverlays = STATE.composerOverlays && STATE.composerOverlays.length > 0;
  
  if (!text && !hasOverlays) {
    showToast('Post content cannot be empty.');
    return;
  }
  
  const newPost = {
    id: `post-${Date.now()}`,
    type: 'post',
    author: STATE.profile.name,
    handle: STATE.profile.handle,
    text: text,
    overlays: [...STATE.composerOverlays],
    timestamp: Date.now()
  };
  
  STATE.posts.unshift(newPost);
  saveToStorage();
  
  textarea.value = '';
  STATE.composerOverlays = [];
  
  const kb = document.getElementById('composer-sticker-keyboard');
  if (kb) kb.style.display = 'none';
  
  const previewCard = document.getElementById('composer-post-preview');
  if (previewCard) previewCard.style.display = 'none';
  
  renderFeed();
  showToast('Vibe shared to gallery!');
}

// ═══ EVENT LISTENERS BINDING ═══
function setupEventListeners() {
  // Navigation tabs
  document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      const viewId = btn.getAttribute('data-view');
      navigateTo(viewId);
    });
  });
  
  // Feed Filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderFeed(btn.getAttribute('data-filter'));
    });
  });
  
  // Profile Tabs
  document.querySelectorAll('.profile-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.profile-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProfile(btn.getAttribute('data-tab'));
    });
  });
  
  // Sandbox Text Customization inputs
  document.getElementById('input-text-1').addEventListener('input', e => {
    STATE.sandbox.text1 = e.target.value;
    updateSandboxPreview();
  });
  
  document.getElementById('input-text-2').addEventListener('input', e => {
    STATE.sandbox.text2 = e.target.value;
    updateSandboxPreview();
  });
  
  document.getElementById('select-font').addEventListener('change', e => {
    STATE.sandbox.font = e.target.value;
    updateSandboxPreview();
  });
  
  // Border selection
  document.querySelectorAll('.border-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.border-option-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      STATE.sandbox.border = btn.getAttribute('data-border');
      updateSandboxPreview();
    });
  });
  
  // Backing selection
  document.querySelectorAll('.backdrop-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.backdrop-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      STATE.sandbox.backing = btn.getAttribute('data-backing');
      updateSandboxPreview();
    });
  });
  
  // Sliders
  document.getElementById('input-glow').addEventListener('input', e => {
    STATE.sandbox.glowIntensity = parseFloat(e.target.value);
    updateSandboxPreview();
  });
  
  document.getElementById('input-thickness').addEventListener('input', e => {
    STATE.sandbox.tubeThickness = parseInt(e.target.value);
    updateSandboxPreview();
  });

  document.getElementById('input-size').addEventListener('input', e => {
    STATE.sandbox.textSize = parseFloat(e.target.value);
    updateSandboxPreview();
  });
  
  // Sandbox actions
  document.getElementById('btn-publish-sign').addEventListener('click', publishSandboxSign);
  document.getElementById('btn-save-profile').addEventListener('click', saveSandboxSignToProfile);
  document.getElementById('btn-copy-css-quick').addEventListener('click', () => {
    const styleData = {
      text1: STATE.sandbox.text1 || 'Neon',
      text2: STATE.sandbox.text2,
      font: STATE.sandbox.font,
      border: STATE.sandbox.border,
      glowColor: STATE.sandbox.glowColor,
      coreColor: STATE.sandbox.coreColor,
      glowIntensity: STATE.sandbox.glowIntensity,
      tubeThickness: STATE.sandbox.tubeThickness,
      textSize: STATE.sandbox.textSize || 3.5,
      backing: STATE.sandbox.backing
    };
    const cssCode = generateCSSRuleString({ styleData });
    copyToClipboard(cssCode);
  });
  
  // Profile Edits Modal
  document.getElementById('btn-edit-profile').addEventListener('click', () => {
    document.getElementById('edit-display-name').value = STATE.profile.name;
    document.getElementById('edit-handle').value = STATE.profile.handle;
    document.getElementById('edit-bio').value = STATE.profile.bio;
    document.getElementById('modal-edit-profile').classList.add('active');
  });
  
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('modal-edit-profile').classList.remove('active');
    });
  });
  
  document.getElementById('btn-save-profile-modal').addEventListener('click', saveProfileEdits);
  
  // Toggling composer sticker drawer
  document.getElementById('btn-toggle-composer-stickers').addEventListener('click', () => {
    const kb = document.getElementById('composer-sticker-keyboard');
    kb.style.display = kb.style.display === 'none' ? 'block' : 'none';
  });

  // Submitting vibe post
  document.getElementById('btn-post-submit').addEventListener('click', publishVibePost);

  // Toggling bio sticker drawer inside modal
  document.getElementById('btn-toggle-bio-stickers').addEventListener('click', () => {
    const kb = document.getElementById('bio-sticker-keyboard');
    kb.style.display = kb.style.display === 'none' ? 'block' : 'none';
  });

  // Toggling live studio sticker drawer
  document.getElementById('btn-toggle-live-stickers').addEventListener('click', () => {
    const kb = document.getElementById('live-sticker-keyboard');
    kb.style.display = kb.style.display === 'none' ? 'block' : 'none';
  });

  // Sending chat message in live view
  document.getElementById('btn-live-send-chat').addEventListener('click', () => {
    const input = document.getElementById('live-chat-input');
    const val = input.value.trim();
    if (val) {
      sendChatMessage(STATE.profile.handle, val);
      STICKER_ASSETS.forEach(sticker => {
        if (val.includes(sticker.shortcode)) {
          triggerFloatingReaction(sticker.file, sticker.type);
        }
      });
      input.value = '';
    }
  });

  document.getElementById('live-chat-input').addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      document.getElementById('btn-live-send-chat').click();
    }
  });

  // Change simulated backdrop in live studio
  document.getElementById('select-live-bg').addEventListener('change', updateLiveStreamBackdrop);

  // Toggle stream pause/play
  document.getElementById('btn-toggle-stream-state').addEventListener('click', () => {
    if (streamActive) {
      stopLiveStream();
    } else {
      startLiveStream();
    }
  });

  // Composer textarea live change preview
  document.getElementById('composer-textarea').addEventListener('input', updateComposerPreview);
}

// ═══ FLOATING STICKER CONTEXTUAL POPOVERS (CANVA-STYLE) ═══
function openStickerPopover(targetEl, sticker, targetTextareaId) {
  const oldPopover = document.getElementById('sticker-mode-popover');
  if (oldPopover) oldPopover.remove();
  
  const popover = document.createElement('div');
  popover.id = 'sticker-mode-popover';
  popover.className = 'sticker-popover liquid-glass';
  document.body.appendChild(popover);
  
  popover.innerHTML = `
    <button class="popover-btn inline-btn" id="popover-btn-inline">
      <span class="icon">✏️</span> Inline (In Text)
    </button>
    <button class="popover-btn overlay-btn" id="popover-btn-overlay">
      <span class="icon">✨</span> Outline (Anywhere)
    </button>
  `;
  
  const rect = targetEl.getBoundingClientRect();
  const popoverW = 180;
  const popoverH = 82;
  
  let left = rect.left + (rect.width / 2) - (popoverW / 2);
  let top = rect.top + window.scrollY - popoverH - 8;
  
  if (left < 10) left = 10;
  if (left + popoverW > window.innerWidth - 10) {
    left = window.innerWidth - popoverW - 10;
  }
  if (top < window.scrollY + 10) {
    top = rect.bottom + window.scrollY + 8;
  }
  
  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
  
  requestAnimationFrame(() => {
    popover.classList.add('active');
  });
  
  document.getElementById('popover-btn-inline').onclick = (e) => {
    e.stopPropagation();
    insertStickerInline(sticker, targetTextareaId);
    popover.classList.remove('active');
    setTimeout(() => popover.remove(), 150);
  };
  
  document.getElementById('popover-btn-overlay').onclick = (e) => {
    e.stopPropagation();
    insertStickerOverlay(sticker);
    popover.classList.remove('active');
    setTimeout(() => popover.remove(), 150);
  };
  
  const clickAway = (e) => {
    if (!popover.contains(e.target) && !targetEl.contains(e.target)) {
      popover.classList.remove('active');
      setTimeout(() => popover.remove(), 150);
      document.removeEventListener('mousedown', clickAway);
    }
  };
  document.addEventListener('mousedown', clickAway);
}

function insertStickerInline(sticker, targetTextareaId) {
  const textarea = document.getElementById(targetTextareaId);
  if (textarea) {
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const value = textarea.value;
    const shortcode = sticker.shortcode;
    textarea.value = value.substring(0, startPos) + shortcode + value.substring(endPos);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = startPos + shortcode.length;
    updateComposerPreview();
  }
}

function insertStickerOverlay(sticker) {
  const newOverlay = {
    shortcode: sticker.shortcode,
    file: sticker.file,
    type: sticker.type,
    x: 50,
    y: 45,
    size: 100, // Clear resizable size
    speed: 'normal',
    anim: 'none'
  };
  STATE.composerOverlays.push(newOverlay);
  updateComposerPreview();
  
  setTimeout(() => {
    const overlays = document.querySelectorAll('.draggable-sticker');
    if (overlays.length > 0) {
      overlays.forEach(o => o.classList.remove('active'));
      overlays[overlays.length - 1].classList.add('active');
    }
  }, 50);
}

function openInlineStickerEditorPopover(targetEl, sticker, targetTextareaId) {
  const oldPopover = document.getElementById('sticker-mode-popover');
  if (oldPopover) oldPopover.remove();
  
  const textarea = document.getElementById(targetTextareaId);
  if (!textarea) return;
  
  let currentSize = 28;
  let currentSpeed = 'normal';
  let currentAnim = sticker.animationClass || 'none';
  
  const baseShortcode = sticker.shortcode.replace(/:/g, '');
  const escapedBase = baseShortcode.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`:${escapedBase}(?:\\|(\\d+))?(?:\\|([a-z0-9.]+))?(?:\\|([a-z-]+))?:`);
  const match = textarea.value.match(regex);
  if (match) {
    if (match[1]) currentSize = parseInt(match[1]);
    if (match[2]) currentSpeed = match[2];
    if (match[3]) currentAnim = match[3] === 'none' ? 'none' : `animate-${match[3]}`;
  }
  
  const popover = document.createElement('div');
  popover.id = 'sticker-mode-popover';
  popover.className = 'sticker-popover liquid-glass';
  popover.style.minWidth = '200px';
  document.body.appendChild(popover);
  
  popover.innerHTML = `
    <button class="popover-btn overlay-btn" id="popover-convert-overlay">
      <span class="icon">✨</span> Convert to Outline
    </button>
    <button class="popover-btn delete-btn" id="popover-delete-inline">
      <span class="icon">🗑️</span> Remove Sticker
    </button>
    <div class="popover-slider-group">
      <label>
        <span>Sticker Size</span>
        <span id="popover-size-label">${currentSize}px</span>
      </label>
      <input type="range" id="popover-size-slider" min="20" max="200" value="${currentSize}">
    </div>
  `;
  
  const rect = targetEl.getBoundingClientRect();
  const popoverW = 200;
  const popoverH = 135;
  
  let left = rect.left + (rect.width / 2) - (popoverW / 2);
  let top = rect.top + window.scrollY - popoverH - 8;
  
  if (left < 10) left = 10;
  if (left + popoverW > window.innerWidth - 10) {
    left = window.innerWidth - popoverW - 10;
  }
  if (top < window.scrollY + 10) {
    top = rect.bottom + window.scrollY + 8;
  }
  
  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
  
  requestAnimationFrame(() => {
    popover.classList.add('active');
  });
  
  const slider = document.getElementById('popover-size-slider');
  slider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    document.getElementById('popover-size-label').textContent = `${val}px`;
    targetEl.style.width = `${val}px`;
    targetEl.style.height = `${val}px`;
    updatePlacedInlineSticker(sticker, targetTextareaId, val, currentSpeed, currentAnim);
  });
  
  document.getElementById('popover-convert-overlay').onclick = (e) => {
    e.stopPropagation();
    const cleanVal = textarea.value.replace(regex, '');
    textarea.value = cleanVal;
    insertStickerOverlay(sticker);
    popover.classList.remove('active');
    setTimeout(() => popover.remove(), 150);
  };
  
  document.getElementById('popover-delete-inline').onclick = (e) => {
    e.stopPropagation();
    textarea.value = textarea.value.replace(regex, '');
    updateComposerPreview();
    popover.classList.remove('active');
    setTimeout(() => popover.remove(), 150);
  };
  
  const clickAway = (e) => {
    if (!popover.contains(e.target) && !targetEl.contains(e.target)) {
      popover.classList.remove('active');
      setTimeout(() => popover.remove(), 150);
      document.removeEventListener('mousedown', clickAway);
    }
  };
  document.addEventListener('mousedown', clickAway);
}

function updatePlacedInlineSticker(sticker, textareaId, newSize, newSpeed, newAnim) {
  const textarea = document.getElementById(textareaId);
  if (!textarea) return;
  
  const baseShortcode = sticker.shortcode.replace(/:/g, '');
  const escapedBase = baseShortcode.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`:${escapedBase}(?:\\|\\d+)?(?:\\|[a-z0-9.]+)?(?:\\|[a-z-]+)?:`);
  
  const animName = newAnim === 'none' ? 'none' : newAnim.replace(/^animate-/, '');
  let finalShortcode = sticker.shortcode;
  if (newSize !== 28 || newSpeed !== 'normal' || newAnim !== 'none') {
    finalShortcode = sticker.shortcode.replace(/:$/, `|${newSize}|${newSpeed}|${animName}:`);
  }
  
  if (regex.test(textarea.value)) {
    textarea.value = textarea.value.replace(regex, finalShortcode);
  }
}

// ═══ STICKER OVERLAYS LOGIC ═══
let activeStickerConfig = {
  sticker: null,
  mode: 'inline',
  anim: 'none',
  targetTextarea: null
};

function openStickerConfigModal(sticker, targetTextareaId) {
  const textarea = document.getElementById(targetTextareaId);
  let currentSize = 28;
  let currentSpeed = 'normal';
  let currentAnim = sticker.animationClass || 'none';
  let currentMode = 'inline';
  
  if (textarea) {
    const baseShortcode = sticker.shortcode.replace(/:/g, '');
    const escapedBase = baseShortcode.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`:${escapedBase}(?:\\|(\\d+))?(?:\\|([a-z0-9.]+))?(?:\\|([a-z-]+))?:`);
    const match = textarea.value.match(regex);
    if (match) {
      if (match[1]) currentSize = parseInt(match[1]);
      if (match[2]) currentSpeed = match[2];
      if (match[3]) {
        currentAnim = match[3] === 'none' ? 'none' : `animate-${match[3]}`;
      }
    }
  }

  activeStickerConfig = {
    sticker: sticker,
    mode: currentMode,
    anim: currentAnim,
    size: currentSize,
    speed: currentSpeed,
    targetTextarea: targetTextareaId
  };
  
  // Set default active tab states
  document.getElementById('btn-mode-inline').classList.add('active');
  document.getElementById('btn-mode-overlay').classList.remove('active');
  document.getElementById('select-sticker-anim').value = activeStickerConfig.anim;
  
  const speedSelect = document.getElementById('select-sticker-speed');
  if (speedSelect) {
    speedSelect.value = activeStickerConfig.speed;
  }
  
  // Update size slider UI
  const sizeInput = document.getElementById('input-sticker-size');
  const sizeLabel = document.getElementById('label-sticker-size');
  if (sizeInput && sizeLabel) {
    sizeInput.value = activeStickerConfig.size;
    sizeLabel.textContent = `${activeStickerConfig.size}px`;
  }
  
  updateStickerModalPreview();
  
  document.getElementById('modal-sticker-config').classList.add('active');
}

function updateStickerModalPreview() {
  const box = document.getElementById('sticker-preview-box');
  if (!box || !activeStickerConfig.sticker) return;
  
  const sticker = activeStickerConfig.sticker;
  const anim = activeStickerConfig.anim;
  const size = activeStickerConfig.size || 28;
  
  box.innerHTML = '';
  const tempEl = document.createElement('div');
  tempEl.style.width = '140px';
  tempEl.style.height = '140px';
  tempEl.style.display = 'flex';
  tempEl.style.alignItems = 'center';
  tempEl.style.justifyContent = 'center';
  
  // Constrain visual size inside preview container (max 130px)
  const displaySize = Math.min(130, size);
  const customStyle = `width: ${displaySize}px; height: ${displaySize}px;`;
  
  tempEl.innerHTML = getStickerMarkup({
    type: sticker.type,
    file: sticker.file,
    shortcode: sticker.shortcode,
    animationClass: anim
  }, 'modal-preview-sticker', customStyle);
  
  box.appendChild(tempEl);
}

function updateComposerPreview() {
  const textarea = document.getElementById('composer-textarea');
  const previewCard = document.getElementById('composer-post-preview');
  const previewText = document.getElementById('composer-preview-text');
  const overlaysBox = document.getElementById('composer-preview-overlays');
  
  if (!textarea || !previewCard) return;
  
  const text = textarea.value.trim();
  const hasOverlays = STATE.composerOverlays && STATE.composerOverlays.length > 0;
  
  if (text || hasOverlays) {
    previewCard.style.display = 'flex';
    previewText.innerHTML = parseStickerShortcodes(textarea.value);
    
    // Add click to edit for inline stickers in the composer preview
    const inlineStickers = previewText.querySelectorAll('.inline-sticker');
    inlineStickers.forEach(el => {
      el.style.cursor = 'pointer';
      el.title = "Click to resize/edit";
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const alt = el.getAttribute('alt');
        const title = el.getAttribute('title');
        const sticker = STICKER_ASSETS.find(s => s.name === alt || s.shortcode === title);
        if (sticker) {
          openInlineStickerEditorPopover(el, sticker, 'composer-textarea');
        }
      });
    });
    
    // Render overlays inside preview
    overlaysBox.innerHTML = '';
    STATE.composerOverlays.forEach((ov, idx) => {
      const ovEl = document.createElement('div');
      ovEl.className = `draggable-sticker ${ov.type === 'pixel' ? 'sticker-pixel' : ''}`;
      
      // Initial positioning values
      ovEl.style.left = `${ov.x}%`;
      ovEl.style.top = `${ov.y}%`;
      ovEl.style.width = `${ov.size}px`;
      ovEl.style.height = `${ov.size}px`;
      
      // Calculate speed multiplier
      let speedVal = '';
      if (ov.speed) {
        if (ov.speed === 'slow') speedVal = '1.8';
        else if (ov.speed === 'fast') speedVal = '0.5';
        else if (ov.speed === 'normal') speedVal = '1.0';
      }
      
      let customStyle = '';
      if (speedVal && ov.anim && ov.anim !== 'none') {
        let baseDuration = 1.5;
        if (ov.anim.includes('pulse')) baseDuration = 2.5;
        else if (ov.anim.includes('bounce')) baseDuration = 1.5;
        else if (ov.anim.includes('flicker')) baseDuration = 4.0;
        else if (ov.anim.includes('heartbeat')) baseDuration = 1.2;
        else if (ov.anim.includes('float')) baseDuration = 3.0;
        
        const finalDuration = parseFloat(speedVal) * baseDuration;
        customStyle = `animation-duration: ${finalDuration}s;`;
      }
      
      // Render sticker element inside along with control handles
      ovEl.innerHTML = `
        ${getStickerMarkup({
          type: ov.type,
          file: ov.file,
          shortcode: ov.shortcode,
          animationClass: ov.anim
        }, '', customStyle)}
        <div class="sticker-delete-handle" title="Delete sticker">&times;</div>
        <div class="sticker-resize-handle" title="Drag to resize"></div>
      `;
      
      // Setup drag and resize handlers
      makeStickerInteractive(ovEl, idx);
      
      overlaysBox.appendChild(ovEl);
    });
  } else {
    previewCard.style.display = 'none';
  }
}

function makeStickerInteractive(el, ovIndex) {
  let isDragging = false;
  let isResizing = false;
  let startX, startY;
  let startLeft, startTop;
  let startWidth;
  
  const handleDragStart = (e) => {
    if (e.target.classList.contains('sticker-resize-handle') || e.target.classList.contains('sticker-delete-handle')) {
      return;
    }
    
    // Select this sticker
    document.querySelectorAll('.draggable-sticker').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    
    isDragging = true;
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
    startX = clientX;
    startY = clientY;
    
    const rect = el.getBoundingClientRect();
    const parentRect = el.parentElement.getBoundingClientRect();
    startLeft = rect.left - parentRect.left;
    startTop = rect.top - parentRect.top;
    
    // Attach event listeners temporarily to window
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);
    
    e.preventDefault();
  };
  
  const handleResizeStart = (e) => {
    isResizing = true;
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    startX = clientX;
    startWidth = el.offsetWidth;
    
    // Attach event listeners temporarily to window
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleResizeEnd);
    window.addEventListener('touchend', handleResizeEnd);
    
    e.stopPropagation();
    e.preventDefault();
  };
  
  const handleMove = (e) => {
    if (!isDragging && !isResizing) return;
    
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
    
    const parentRect = el.parentElement.getBoundingClientRect();
    
    if (isDragging) {
      const dx = clientX - startX;
      const dy = clientY - startY;
      
      let newLeft = startLeft + dx;
      let newTop = startTop + dy;
      
      // Convert to percent
      let leftPct = ((newLeft + el.offsetWidth / 2) / parentRect.width) * 100;
      let topPct = ((newTop + el.offsetHeight / 2) / parentRect.height) * 100;
      
      // Constrain inside card
      leftPct = Math.max(5, Math.min(95, leftPct));
      topPct = Math.max(5, Math.min(90, topPct));
      
      el.style.left = `${leftPct}%`;
      el.style.top = `${topPct}%`;
      
      STATE.composerOverlays[ovIndex].x = leftPct;
      STATE.composerOverlays[ovIndex].y = topPct;
    }
    
    if (isResizing) {
      const dx = clientX - startX;
      let newWidth = startWidth + dx;
      
      newWidth = Math.max(30, Math.min(200, newWidth));
      
      el.style.width = `${newWidth}px`;
      el.style.height = `${newWidth}px`;
      
      STATE.composerOverlays[ovIndex].size = newWidth;
    }
  };
  
  const handleDragEnd = () => {
    isDragging = false;
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('touchmove', handleMove);
    window.removeEventListener('mouseup', handleDragEnd);
    window.removeEventListener('touchend', handleDragEnd);
  };
  
  const handleResizeEnd = () => {
    isResizing = false;
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('touchmove', handleMove);
    window.removeEventListener('mouseup', handleResizeEnd);
    window.removeEventListener('touchend', handleResizeEnd);
  };
  
  // Drag bindings
  el.addEventListener('mousedown', handleDragStart);
  el.addEventListener('touchstart', handleDragStart, { passive: false });
  
  // Resize bindings
  const resizeH = el.querySelector('.sticker-resize-handle');
  if (resizeH) {
    resizeH.addEventListener('mousedown', handleResizeStart);
    resizeH.addEventListener('touchstart', handleResizeStart, { passive: false });
  }
  
  // Delete bindings
  const deleteH = el.querySelector('.sticker-delete-handle');
  if (deleteH) {
    deleteH.addEventListener('click', (e) => {
      e.stopPropagation();
      STATE.composerOverlays.splice(ovIndex, 1);
      updateComposerPreview();
    });
  }
}

function setupStickerModalListeners() {
  const modal = document.getElementById('modal-sticker-config');
  if (!modal) return;
  
  // Close buttons
  const closeBtns = [
    document.getElementById('btn-close-sticker-modal'),
    document.getElementById('btn-cancel-sticker-modal')
  ];
  
  closeBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => modal.classList.remove('active'));
    }
  });
  
  // Mode tabs
  const btnInline = document.getElementById('btn-mode-inline');
  const btnOverlay = document.getElementById('btn-mode-overlay');
  
  btnInline.addEventListener('click', () => {
    btnInline.classList.add('active');
    btnOverlay.classList.remove('active');
    activeStickerConfig.mode = 'inline';
    
    // Default size for inline
    activeStickerConfig.size = 28;
    const sizeInput = document.getElementById('input-sticker-size');
    const sizeLabel = document.getElementById('label-sticker-size');
    if (sizeInput && sizeLabel) {
      sizeInput.value = 28;
      sizeLabel.textContent = '28px';
    }
    updateStickerModalPreview();
  });
  
  btnOverlay.addEventListener('click', () => {
    btnOverlay.classList.add('active');
    btnInline.classList.remove('active');
    activeStickerConfig.mode = 'overlay';
    
    // Default size for overlay
    activeStickerConfig.size = 70;
    const sizeInput = document.getElementById('input-sticker-size');
    const sizeLabel = document.getElementById('label-sticker-size');
    if (sizeInput && sizeLabel) {
      sizeInput.value = 70;
      sizeLabel.textContent = '70px';
    }
    updateStickerModalPreview();
  });
  
  // Size Slider Change
  const sizeInput = document.getElementById('input-sticker-size');
  if (sizeInput) {
    sizeInput.addEventListener('input', e => {
      const val = parseInt(e.target.value);
      activeStickerConfig.size = val;
      const sizeLabel = document.getElementById('label-sticker-size');
      if (sizeLabel) {
        sizeLabel.textContent = `${val}px`;
      }
      updateStickerModalPreview();
    });
  }
  
  // Animation Select
  const selectAnim = document.getElementById('select-sticker-anim');
  selectAnim.addEventListener('change', e => {
    activeStickerConfig.anim = e.target.value;
    updateStickerModalPreview();
  });
  
  // Speed Select Change
  const selectSpeed = document.getElementById('select-sticker-speed');
  if (selectSpeed) {
    selectSpeed.addEventListener('change', e => {
      activeStickerConfig.speed = e.target.value;
      updateStickerModalPreview();
    });
  }
  
  // Click outside stickers to deselect active border
  document.addEventListener('mousedown', e => {
    if (!e.target.closest('.draggable-sticker')) {
      document.querySelectorAll('.draggable-sticker').forEach(s => s.classList.remove('active'));
    }
  });
  document.addEventListener('touchstart', e => {
    if (!e.target.closest('.draggable-sticker')) {
      document.querySelectorAll('.draggable-sticker').forEach(s => s.classList.remove('active'));
    }
  });
  
  // Confirm Apply
  document.getElementById('btn-apply-sticker-modal').addEventListener('click', () => {
    const config = activeStickerConfig;
    const sticker = config.sticker;
    if (!sticker) return;
    
    if (config.mode === 'inline') {
      const textarea = document.getElementById(config.targetTextarea);
      if (textarea) {
        const baseShortcode = sticker.shortcode.replace(/:/g, '');
        const escapedBase = baseShortcode.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`:${escapedBase}(?:\\|\\d+)?(?:\\|[a-z0-9.]+)?(?:\\|[a-z-]+)?:`);
        
        // Format: :shortcode|size|speed|anim:
        const animName = config.anim === 'none' ? 'none' : config.anim.replace(/^animate-/, '');
        let finalShortcode = sticker.shortcode;
        
        if (config.size !== 28 || config.speed !== 'normal' || config.anim !== 'none') {
          finalShortcode = sticker.shortcode.replace(/:$/, `|${config.size}|${config.speed}|${animName}:`);
        }
        
        if (regex.test(textarea.value)) {
          textarea.value = textarea.value.replace(regex, finalShortcode);
        } else {
          const startPos = textarea.selectionStart;
          const endPos = textarea.selectionEnd;
          const value = textarea.value;
          textarea.value = value.substring(0, startPos) + finalShortcode + value.substring(endPos);
        }
        textarea.focus();
      }
    } else {
      // Spawn at center of card canvas with selected size, speed and animation
      const newOverlay = {
        shortcode: sticker.shortcode,
        file: sticker.file,
        type: sticker.type,
        x: 50,
        y: 45,
        size: config.size || 70,
        speed: config.speed || 'normal',
        anim: config.anim
      };
      STATE.composerOverlays.push(newOverlay);
      
      // Auto-focus the newly spawned sticker and show handles immediately!
      setTimeout(() => {
        const cards = document.querySelectorAll('.draggable-sticker');
        if (cards.length > 0) {
          cards.forEach(c => c.classList.remove('active'));
          cards[cards.length - 1].classList.add('active');
        }
      }, 50);
    }
    
    // Close modal
    modal.classList.remove('active');
    
    // Update live preview in composer
    updateComposerPreview();
  });
}

// ═══ INITIALIZATION / APP LOAD ═══
function init() {
  loadFromStorage();
  renderColorSwatches();
  updateSandboxPreview();
  renderStickerKeyboards();
  setupEventListeners();
  
  // Default to Feed View rendering
  renderFeed();
  
  // Initialize hologram simulator
  initHologramSimulator();
}

// ═══ CYBERPUNK HOLOGRAM SIMULATOR ═══
function initHologramSimulator() {
  const modeBtns = document.querySelectorAll('[data-sandbox-mode]');
  const neonWrapper = document.getElementById('neon-controls-wrapper');
  const holoWrapper = document.getElementById('hologram-controls-section');
  const neonBorderContainer = document.getElementById('sandbox-border-container');
  const holoSimContainer = document.getElementById('hologram-sim-container');
  
  const scaleInput = document.getElementById('input-holo-scale');
  const scaleVal = document.getElementById('val-holo-scale');
  const speedInput = document.getElementById('input-holo-speed');
  const speedVal = document.getElementById('val-holo-speed');
  
  // GIF mode elements
  const gifWrapper = document.getElementById('hologram-gif-wrapper');
  const figureWrapper = document.getElementById('hologram-figure-wrapper');
  const gifElement = document.getElementById('hologram-gif-element');
  const iconsOverlay = document.getElementById('hologram-icons-overlay');
  const matrixOverlay = document.getElementById('hologram-matrix-overlay');
  
  // HD Web mode elements
  const webWrapper = document.getElementById('hologram-web-wrapper');
  const hdCanvas = document.getElementById('holo-hd-canvas');
  const lightRay = document.getElementById('holo-light-ray');
  const hdMenu = document.getElementById('holo-hd-menu');
  const hdScanline = document.getElementById('holo-hd-scanline');

  // Sprite mapping elements
  const spriteCanvas = document.getElementById('holo-sprite-canvas');
  const lightRaySprite = document.getElementById('holo-light-ray-sprite');
  const hdMenuSprite = document.getElementById('holo-hd-menu-sprite');
  const hdScanlineSprite = document.getElementById('holo-sprite-scanline');
  
  // Mode controls
  const modeGifBtn = document.getElementById('btn-holo-mode-gif');
  const modeWebBtn = document.getElementById('btn-holo-mode-web');
  let currentHoloMode = 'web'; // Default to the new high-fidelity version
  
  const stateBtns = document.querySelectorAll('[data-holo-state]');
  const triggerSeqBtn = document.getElementById('btn-holo-trigger-sequence');
  const holoIconBtns = document.querySelectorAll('.holo-icon-btn');

  if (!modeBtns.length) return;

  // ═══ HTML5 CANVAS SHADER ANIMATION ENGINE ═══
  let canvasAnimId = null;
  let imgMotherboard = null;
  let imgBase = null;
  let imgBeachEmpty = null;
  let imgBeachBlunt = null;
  let imagesLoadedCount = 0;
  
  let stageOpacities = { motherboard: 1.0, beachEmpty: 0.0, beachBlunt: 0.0 };
  let targetOpacities = { motherboard: 1.0, beachEmpty: 0.0, beachBlunt: 0.0 };
  
  let particles = [];
  let smokeParticles = [];
  let mousePos = { x: -1000, y: -1000 };
  let currentOffset = { x: 0, y: 0 };
  let targetOffset = { x: 0, y: 0 };
  const canvas = document.getElementById('holo-displacement-canvas');

  if (webWrapper) {
    webWrapper.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.x = ((e.clientX - rect.left) / rect.width) * 800;
      mousePos.y = ((e.clientY - rect.top) / rect.height) * 800;
      
      targetOffset.x = ((mousePos.x - 400) / 400) * 16;
      targetOffset.y = ((mousePos.y - 400) / 400) * 12;
    });
    webWrapper.addEventListener('mouseleave', () => {
      mousePos.x = -1000;
      mousePos.y = -1000;
      targetOffset.x = 0;
      targetOffset.y = 0;
    });
  }

  function startHDCanvasAnimation() {
    if (canvasAnimId) return;
    
    const totalImages = 4;
    function onImageLoad() {
      imagesLoadedCount++;
      if (imagesLoadedCount === totalImages) {
        runLoop();
      }
    }
    
    if (!imgMotherboard) {
      imagesLoadedCount = 0;
      imgMotherboard = new Image();
      imgMotherboard.src = 'assets/stickers/cyberpunk/cyberpunk_hologram_motherboard.jpg';
      imgMotherboard.onload = onImageLoad;
      
      imgBase = new Image();
      imgBase.src = 'assets/stickers/cyberpunk/cyberpunk_hologram_base.png';
      imgBase.onload = onImageLoad;
      
      imgBeachEmpty = new Image();
      imgBeachEmpty.src = 'assets/stickers/cyberpunk/cyberpunk_hologram_beach_empty.jpg';
      imgBeachEmpty.onload = onImageLoad;
      
      imgBeachBlunt = new Image();
      imgBeachBlunt.src = 'assets/stickers/cyberpunk/cyberpunk_hologram_beach_blunt.jpg';
      imgBeachBlunt.onload = onImageLoad;
    } else {
      runLoop();
    }
  }

  function stopHDCanvasAnimation() {
    if (canvasAnimId) {
      cancelAnimationFrame(canvasAnimId);
      canvasAnimId = null;
    }
  }

  function runLoop() {
    if (!canvas || !holoSimContainer || holoSimContainer.style.display === 'none') {
      stopHDCanvasAnimation();
      return;
    }
    const ctx = canvas.getContext('2d');
    const ctx2 = spriteCanvas ? spriteCanvas.getContext('2d') : null;
    const speed = speedInput ? parseFloat(speedInput.value) : 1.0;
    
    ctx.clearRect(0, 0, 800, 800);
    if (ctx2) {
      ctx2.clearRect(0, 0, 800, 800);
    }
    
    // Calculate Option 2 snap frame coordinates based on 3x3 sectors
    let sx = 0;
    let sy = 0;
    if (mousePos.x > 0 && mousePos.y > 0) {
      const zoneX = Math.floor((mousePos.x / 800) * 3);
      const zoneY = Math.floor((mousePos.y / 800) * 3);
      sx = (zoneX - 1) * 22;
      sy = (zoneY - 1) * 16;
    }

    // Smoothly transition opacities between scenes
    const ease = 0.08 * speed;
    stageOpacities.motherboard += (targetOpacities.motherboard - stageOpacities.motherboard) * ease;
    stageOpacities.beachEmpty += (targetOpacities.beachEmpty - stageOpacities.beachEmpty) * ease;
    stageOpacities.beachBlunt += (targetOpacities.beachBlunt - stageOpacities.beachBlunt) * ease;
    
    // Smoothly interpolate mouse parallax offsets
    const easeOffset = 0.12 * speed;
    currentOffset.x += (targetOffset.x - currentOffset.x) * easeOffset;
    currentOffset.y += (targetOffset.y - currentOffset.y) * easeOffset;
    
    const tx = currentOffset.x * 0.4;
    const ty = currentOffset.y * 0.3;
    const hx = currentOffset.x * 1.0;
    const hy = currentOffset.y * 0.8;

    const numSlices = 100;
    const sliceH = 800 / numSlices;
    const time = Date.now() * 0.0018 * speed;
    
    const isGlitching = document.getElementById('btn-state-glitch-transition')?.classList.contains('active') ||
                        (stageOpacities.beachEmpty > 0.05 && stageOpacities.beachEmpty < 0.95);
    
    // Sub-layer clipping shapes for character parallax
    function clipHead(c, dx, dy) {
      c.beginPath();
      c.moveTo(40 + dx, 270 + dy);
      c.lineTo(40 + dx, 150 + dy);
      c.quadraticCurveTo(80 + dx, 75 + dy, 160 + dx, 75 + dy);
      c.quadraticCurveTo(240 + dx, 75 + dy, 280 + dx, 140 + dy);
      c.lineTo(290 + dx, 250 + dy);
      c.lineTo(250 + dx, 285 + dy);
      c.lineTo(160 + dx, 285 + dy);
      c.closePath();
    }

    function clipTorso(c, dx, dy) {
      c.beginPath();
      c.moveTo(0 + dx, 800 + dy);
      c.lineTo(0 + dx, 280 + dy);
      c.lineTo(160 + dx, 285 + dy);
      c.lineTo(250 + dx, 285 + dy);
      c.lineTo(290 + dx, 270 + dy);
      c.lineTo(340 + dx, 320 + dy);
      c.lineTo(365 + dx, 400 + dy);
      c.lineTo(430 + dx, 420 + dy);
      c.lineTo(600 + dx, 460 + dy);
      c.lineTo(460 + dx, 510 + dy);
      c.lineTo(360 + dx, 800 + dy);
      c.closePath();
    }

    // Wavy slicing render function with optional section clipping
    function drawWavyImageSection(c, img, opacity, clipFn, dx, dy, isBaseBackground = false) {
      if (!img || !c) return;
      c.save();
      c.globalAlpha = opacity;
      
      if (!isBaseBackground && clipFn) {
        clipFn(c, dx, dy);
        c.clip();
      }
      
      const shiftX = isBaseBackground ? 0 : dx;
      const shiftY = isBaseBackground ? 0 : dy;
      
      for (let i = 0; i < numSlices; i++) {
        const sliceY = i * sliceH;
        let offset = Math.sin(sliceY * 0.03 + time) * 3.5;
        
        if (sliceY < 250) {
          offset *= 0.4;
        }
        
        if (isGlitching) {
          offset += (Math.random() - 0.5) * 12;
        }

        const srcY = (sliceY / 800) * img.height;
        const srcH = (sliceH / 800) * img.height;
        
        if (isGlitching && Math.random() > 0.65) {
          c.save();
          c.globalAlpha = opacity * 0.65;
          c.drawImage(img, 0, srcY, img.width, srcH, offset - 12 + shiftX, sliceY + shiftY, 800, sliceH);
          c.drawImage(img, 0, srcY, img.width, srcH, offset + 12 + shiftX, sliceY + shiftY, 800, sliceH);
          c.restore();
        } else {
          c.drawImage(img, 0, srcY, img.width, srcH, offset + shiftX, sliceY + shiftY, 800, sliceH);
        }
      }
      c.restore();
    }
    
    // ═════ RENDER OPTION 1: LAYERED PARALLAX (ctx) ═════
    // 1. Draw Background Plates (offset = 0)
    if (stageOpacities.motherboard > 0.01) {
      drawWavyImageSection(ctx, imgMotherboard, stageOpacities.motherboard, null, 0, 0, true);
    }
    if (stageOpacities.beachEmpty > 0.01 || stageOpacities.beachBlunt > 0.01) {
      const beachBgOpacity = Math.max(stageOpacities.beachEmpty, stageOpacities.beachBlunt);
      drawWavyImageSection(ctx, imgBeachEmpty, beachBgOpacity, null, 0, 0, true);
    }
    
    // 2. Draw Torso Layer (offset = tx, ty)
    if (stageOpacities.motherboard > 0.01) {
      drawWavyImageSection(ctx, imgBase, stageOpacities.motherboard, clipTorso, tx, ty, false);
    }
    if (stageOpacities.beachEmpty > 0.01) {
      drawWavyImageSection(ctx, imgBase, stageOpacities.beachEmpty, clipTorso, tx, ty, false);
    }
    if (stageOpacities.beachBlunt > 0.01) {
      drawWavyImageSection(ctx, imgBeachBlunt, stageOpacities.beachBlunt, clipTorso, tx, ty, false);
    }
    
    // 3. Draw Head Layer (offset = hx, hy)
    if (stageOpacities.motherboard > 0.01) {
      drawWavyImageSection(ctx, imgBase, stageOpacities.motherboard, clipHead, hx, hy, false);
    }
    if (stageOpacities.beachEmpty > 0.01) {
      drawWavyImageSection(ctx, imgBase, stageOpacities.beachEmpty, clipHead, hx, hy, false);
    }
    if (stageOpacities.beachBlunt > 0.01) {
      drawWavyImageSection(ctx, imgBeachBlunt, stageOpacities.beachBlunt, clipHead, hx, hy, false);
    }
    
    // Visor cyber-grid overlay (X = 90 to 210, Y = 165 to 215) - tracks head hx, hy
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(90 + hx, 165 + hy);
    ctx.lineTo(210 + hx, 185 + hy);
    ctx.lineTo(200 + hx, 215 + hy);
    ctx.lineTo(95 + hx, 200 + hy);
    ctx.closePath();
    ctx.clip();
    
    ctx.fillStyle = 'rgba(0, 255, 128, 0.12)';
    ctx.fillRect(80 + hx, 150 + hy, 150, 80);
    
    ctx.strokeStyle = 'rgba(0, 255, 128, 0.45)';
    ctx.lineWidth = 2;
    const scrollY = (Date.now() * 0.035 * speed) % 15;
    for (let y = 150 + scrollY; y < 230; y += 15) {
      ctx.beginPath();
      ctx.moveTo(80 + hx, y + hy);
      ctx.lineTo(230 + hx, y + hy);
      ctx.stroke();
    }
    ctx.restore();

    // ═════ RENDER OPTION 2: DIRECTIONAL SPRITE MAPPING (ctx2) ═════
    if (ctx2) {
      // 1. Draw Background Plates (offset = sx, sy - everything moves together!)
      if (stageOpacities.motherboard > 0.01) {
        drawWavyImageSection(ctx2, imgMotherboard, stageOpacities.motherboard, null, sx, sy, true);
      }
      if (stageOpacities.beachEmpty > 0.01 || stageOpacities.beachBlunt > 0.01) {
        const beachBgOpacity = Math.max(stageOpacities.beachEmpty, stageOpacities.beachBlunt);
        drawWavyImageSection(ctx2, imgBeachEmpty, beachBgOpacity, null, sx, sy, true);
      }
      
      // 2. Draw Torso Layer (offset = sx, sy)
      if (stageOpacities.motherboard > 0.01) {
        drawWavyImageSection(ctx2, imgBase, stageOpacities.motherboard, null, sx, sy, false);
      }
      if (stageOpacities.beachEmpty > 0.01) {
        drawWavyImageSection(ctx2, imgBase, stageOpacities.beachEmpty, null, sx, sy, false);
      }
      if (stageOpacities.beachBlunt > 0.01) {
        drawWavyImageSection(ctx2, imgBeachBlunt, stageOpacities.beachBlunt, null, sx, sy, false);
      }
      
      // 3. Draw Head Layer (offset = sx, sy)
      if (stageOpacities.motherboard > 0.01) {
        drawWavyImageSection(ctx2, imgBase, stageOpacities.motherboard, null, sx, sy, false);
      }
      if (stageOpacities.beachEmpty > 0.01) {
        drawWavyImageSection(ctx2, imgBase, stageOpacities.beachEmpty, null, sx, sy, false);
      }
      if (stageOpacities.beachBlunt > 0.01) {
        drawWavyImageSection(ctx2, imgBeachBlunt, stageOpacities.beachBlunt, null, sx, sy, false);
      }
      
      // Visor cyber-grid overlay (X = 90 to 210, Y = 165 to 215) - snaps by sx, sy
      ctx2.save();
      ctx2.beginPath();
      ctx2.moveTo(90 + sx, 165 + sy);
      ctx2.lineTo(210 + sx, 185 + sy);
      ctx2.lineTo(200 + sx, 215 + sy);
      ctx2.lineTo(95 + sx, 200 + sy);
      ctx2.closePath();
      ctx2.clip();
      
      ctx2.fillStyle = 'rgba(0, 255, 128, 0.12)';
      ctx.fillRect(80 + sx, 150 + sy, 150, 80);
      
      ctx2.strokeStyle = 'rgba(0, 255, 128, 0.45)';
      ctx2.lineWidth = 2;
      for (let y = 150 + scrollY; y < 230; y += 15) {
        ctx2.beginPath();
        ctx2.moveTo(80 + sx, y + sy);
        ctx2.lineTo(230 + sx, y + sy);
        ctx2.stroke();
      }
      ctx2.restore();
    }
    
    // Volumetric particle projection from her palm (X = 330, Y = 460) - tracks body offset tx, ty
    const isHoloActive = document.getElementById('btn-state-hologram-up')?.classList.contains('active') || isGlitching;
    
    if (isHoloActive && stageOpacities.motherboard > 0.3) {
      const emitCount = isGlitching ? 4 : 2;
      for (let p = 0; p < emitCount; p++) {
        if (particles.length < 300) {
          particles.push({
            x: 330 + tx + (Math.random() - 0.5) * 15,
            y: 460 + ty + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -1.2 * (1 + Math.random() * 1.8),
            size: 2 + Math.random() * 3.5,
            alpha: 0.85 + Math.random() * 0.15,
            life: 0,
            maxLife: 90 + Math.random() * 50
          });
        }
      }
    }
    
    // Update and draw hologram vector particles
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00ffff';
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += speed;
      
      p.x += p.vx * speed;
      p.y += p.vy * speed;
      p.vy -= 0.015 * speed; // Slowly accelerate upwards
      
      if (mousePos.x > 0 && mousePos.y > 0) {
        const dx = mousePos.x - p.x;
        const dy = mousePos.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          p.x += (dx / dist) * 2.2 * speed;
          p.y += (dy / dist) * 2.2 * speed;
        }
      }
      
      const lifeRatio = p.life / p.maxLife;
      const alpha = p.alpha * (1 - lifeRatio);
      
      ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Option 2 corresponding snapped particles drawing
    if (ctx2) {
      ctx2.save();
      ctx2.shadowBlur = 8;
      ctx2.shadowColor = '#00ffff';
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const lifeRatio = p.life / p.maxLife;
        const alpha = p.alpha * (1 - lifeRatio);
        
        ctx2.fillStyle = `rgba(0, 255, 255, ${alpha})`;
        ctx2.beginPath();
        // Snap coordinates relative to sprite shift offsets
        ctx2.arc(p.x - tx + sx, p.y - ty + sy, p.size, 0, Math.PI * 2);
        ctx2.fill();
      }
      ctx2.restore();
    }

    // Clean particles array
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (p.life >= p.maxLife || p.y < 0) {
        particles.splice(i, 1);
      }
    }
    
    // ═══ Spark Blunt Purple Volumetric Smoke Particle Emitter ═══
    if (stageOpacities.beachBlunt > 0.5) {
      if (Math.random() < 0.3 * speed) {
        smokeParticles.push({
          x: 600 + hx + (Math.random() - 0.5) * 10,
          y: 460 + hy + (Math.random() - 0.5) * 10,
          vx: 0.5 + Math.random() * 0.7,
          vy: -0.8 - Math.random() * 1.2,
          size: 4 + Math.random() * 6,
          alpha: 0.4 + Math.random() * 0.3,
          life: 0,
          maxLife: 160 + Math.random() * 80
        });
      }
    }
    
    // Update and draw blunt smoke clouds
    if (smokeParticles.length > 0) {
      // 1. Draw Option 1 (ctx)
      ctx.save();
      ctx.filter = 'blur(5px)';
      for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const p = smokeParticles[i];
        const ratio = p.life / p.maxLife;
        const alpha = p.alpha * (1 - ratio);
        
        ctx.fillStyle = `rgba(175, 120, 220, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 2. Draw Option 2 (ctx2)
      if (ctx2) {
        ctx2.save();
        ctx2.filter = 'blur(5px)';
        for (let i = smokeParticles.length - 1; i >= 0; i--) {
          const p = smokeParticles[i];
          const ratio = p.life / p.maxLife;
          const alpha = p.alpha * (1 - ratio);
          
          ctx2.fillStyle = `rgba(175, 120, 220, ${alpha})`;
          ctx2.beginPath();
          ctx2.arc(p.x - hx + sx, p.y - hy + sy, p.size, 0, Math.PI * 2);
          ctx2.fill();
        }
        ctx2.restore();
      }

      // Update particle physics once
      for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const p = smokeParticles[i];
        p.life += speed;
        p.x += p.vx * speed;
        p.y += p.vy * speed;
        p.size += 0.08 * speed; // Expands as it rises

        if (p.life >= p.maxLife || p.y < 0) {
          smokeParticles.splice(i, 1);
        }
      }
    }
    
    canvasAnimId = requestAnimationFrame(runLoop);
  }



  // Toggle modes (Neon vs Hologram)
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const mode = btn.getAttribute('data-sandbox-mode');
      if (mode === 'neon') {
        stopHDCanvasAnimation();
        if (neonWrapper) neonWrapper.style.display = 'block';
        if (holoWrapper) holoWrapper.style.display = 'none';
        if (neonBorderContainer) neonBorderContainer.style.display = 'block';
        if (holoSimContainer) holoSimContainer.style.display = 'none';
      } else {
        if (neonWrapper) neonWrapper.style.display = 'none';
        if (holoWrapper) holoWrapper.style.display = 'block';
        if (neonBorderContainer) neonBorderContainer.style.display = 'none';
        if (holoSimContainer) holoSimContainer.style.display = 'flex';
        resetHoloState();
        resetWebHoloState();
        syncSubMode();
        
        // Auto-activate the hologram so the user sees the floating menu and glowing beam immediately
        setTimeout(() => {
          const btnHolo = document.getElementById('btn-state-hologram-up');
          if (btnHolo) btnHolo.click();
        }, 50);
      }
    });
  });

  // Sub-mode switching (GIF vs HD Web)
  if (modeGifBtn && modeWebBtn) {
    modeGifBtn.addEventListener('click', () => {
      modeGifBtn.classList.add('active');
      modeWebBtn.classList.remove('active');
      currentHoloMode = 'gif';
      syncSubMode();
    });
    modeWebBtn.addEventListener('click', () => {
      modeWebBtn.classList.add('active');
      modeGifBtn.classList.remove('active');
      currentHoloMode = 'web';
      syncSubMode();
    });
  }

  function syncSubMode() {
    if (currentHoloMode === 'gif') {
      stopHDCanvasAnimation();
      if (gifWrapper) gifWrapper.style.display = 'flex';
      if (webWrapper) webWrapper.style.display = 'none';
      resetHoloState();
    } else {
      if (gifWrapper) gifWrapper.style.display = 'none';
      if (webWrapper) webWrapper.style.display = 'flex';
      resetWebHoloState();
      startHDCanvasAnimation();
    }
  }

  // Reset standard GIF states
  function resetHoloState() {
    if (iconsOverlay) {
      iconsOverlay.style.opacity = '0';
      iconsOverlay.style.transform = 'translateY(20px)';
    }
    if (matrixOverlay) matrixOverlay.style.opacity = '0';
    if (figureWrapper) figureWrapper.classList.remove('digitize-glitch-canvas');
    stateBtns.forEach(b => b.classList.remove('active'));
    const btnDown = document.getElementById('btn-state-hand-down');
    if (btnDown) btnDown.classList.add('active');
  }

  // Reset HD Web states
  function resetWebHoloState() {
    targetOpacities = { motherboard: 1.0, beachEmpty: 0.0, beachBlunt: 0.0 };
    if (lightRay) {
      lightRay.style.opacity = '0';
      lightRay.style.transform = 'scaleY(0)';
    }
    if (hdMenu) {
      hdMenu.style.opacity = '0';
      hdMenu.style.transform = 'translateY(30px) scale(0.9)';
      hdMenu.style.animation = 'none';
    }
    if (matrixOverlay) {
      matrixOverlay.style.opacity = '0';
      matrixOverlay.style.pointerEvents = 'none';
    }
    if (hdScanline) {
      hdScanline.style.opacity = '0';
      hdScanline.style.animation = 'none';
    }
    if (hdCanvas) {
      hdCanvas.style.filter = 'none';
    }
    stateBtns.forEach(b => b.classList.remove('active'));
    const btnDown = document.getElementById('btn-state-hand-down');
    if (btnDown) btnDown.classList.add('active');
  }

  // Scale handler (Applies to both)
  if (scaleInput) {
    scaleInput.addEventListener('input', () => {
      const val = scaleInput.value;
      if (scaleVal) scaleVal.textContent = `${val}x`;
      if (figureWrapper) figureWrapper.style.transform = `scale(${val})`;
      if (hdCanvas) hdCanvas.style.transform = `scale(${val})`;
    });
  }

  // Speed handler
  if (speedInput) {
    speedInput.addEventListener('input', () => {
      const val = speedInput.value;
      if (speedVal) speedVal.textContent = `${val}x`;
      if (iconsOverlay) iconsOverlay.style.transitionDuration = `${0.5 / val}s`;
      if (matrixOverlay) matrixOverlay.style.transitionDuration = `${0.3 / val}s`;
      if (lightRay) lightRay.style.transitionDuration = `${0.8 / val}s`;
      if (hdMenu) hdMenu.style.transitionDuration = `${0.8 / val}s`;
    });
  }

  // Manual state machine triggers
  stateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stateBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const state = btn.getAttribute('data-holo-state');
      const speed = speedInput ? parseFloat(speedInput.value) : 1.0;
      
      if (currentHoloMode === 'gif') {
        // GIF mode actions
        if (state === 'down') {
          resetHoloState();
        } else if (state === 'hologram') {
          if (iconsOverlay) {
            iconsOverlay.style.opacity = '1';
            iconsOverlay.style.transform = 'translateY(0)';
          }
          if (matrixOverlay) matrixOverlay.style.opacity = '0';
          if (figureWrapper) figureWrapper.classList.remove('digitize-glitch-canvas');
        } else if (state === 'glitch') {
          if (iconsOverlay) {
            iconsOverlay.style.opacity = '1';
            iconsOverlay.style.transform = 'translateY(0)';
          }
          if (matrixOverlay) matrixOverlay.style.opacity = '1';
          if (figureWrapper) figureWrapper.classList.add('digitize-glitch-canvas');
        }
      } else {
        // HD Web mode actions
        if (state === 'down') {
          targetOpacities = { motherboard: 1.0, beachEmpty: 0.0, beachBlunt: 0.0 };
          if (lightRay) {
            lightRay.style.opacity = '0';
            lightRay.style.transform = 'scaleY(0)';
          }
          if (lightRaySprite) {
            lightRaySprite.style.opacity = '0';
            lightRaySprite.style.transform = 'scaleY(0)';
          }
          if (hdMenu) {
            hdMenu.style.opacity = '0';
            hdMenu.style.transform = 'translateY(30px) scale(0.9)';
            hdMenu.style.animation = 'none';
          }
          if (hdMenuSprite) {
            hdMenuSprite.style.opacity = '0';
            hdMenuSprite.style.transform = 'translateY(30px) scale(0.9)';
            hdMenuSprite.style.animation = 'none';
          }
          if (hdScanline) {
            hdScanline.style.opacity = '0';
            hdScanline.style.animation = 'none';
          }
          if (hdScanlineSprite) {
            hdScanlineSprite.style.opacity = '0';
            hdScanlineSprite.style.animation = 'none';
          }
        } else if (state === 'hologram') {
          targetOpacities = { motherboard: 1.0, beachEmpty: 0.0, beachBlunt: 0.0 };
          if (lightRay) {
            lightRay.style.opacity = '1';
            lightRay.style.transform = 'scaleY(1)';
          }
          if (lightRaySprite) {
            lightRaySprite.style.opacity = '1';
            lightRaySprite.style.transform = 'scaleY(1)';
          }
          if (hdMenu) {
            hdMenu.style.opacity = '1';
            hdMenu.style.transform = 'translateY(0) scale(1)';
            hdMenu.style.animation = 'floatSway 6s ease-in-out infinite';
          }
          if (hdMenuSprite) {
            hdMenuSprite.style.opacity = '1';
            hdMenuSprite.style.transform = 'translateY(0) scale(1)';
            hdMenuSprite.style.animation = 'floatSway 6s ease-in-out infinite';
          }
          if (hdScanline) {
            hdScanline.style.opacity = '0';
            hdScanline.style.animation = 'none';
          }
          if (hdScanlineSprite) {
            hdScanlineSprite.style.opacity = '0';
            hdScanlineSprite.style.animation = 'none';
          }
        } else if (state === 'beach') {
          targetOpacities = { motherboard: 0.0, beachEmpty: 1.0, beachBlunt: 0.0 };
          if (lightRay) {
            lightRay.style.opacity = '0';
            lightRay.style.transform = 'scaleY(0)';
          }
          if (lightRaySprite) {
            lightRaySprite.style.opacity = '0';
            lightRaySprite.style.transform = 'scaleY(0)';
          }
          if (hdMenu) {
            hdMenu.style.opacity = '0';
            hdMenu.style.transform = 'translateY(20px) scale(0.95)';
          }
          if (hdMenuSprite) {
            hdMenuSprite.style.opacity = '0';
            hdMenuSprite.style.transform = 'translateY(20px) scale(0.95)';
          }
          if (hdScanline) {
            hdScanline.style.opacity = '1';
            hdScanline.style.animation = `scanlineAnim ${1.2 / speed}s linear infinite`;
          }
          if (hdScanlineSprite) {
            hdScanlineSprite.style.opacity = '1';
            hdScanlineSprite.style.animation = `scanlineAnim ${1.2 / speed}s linear infinite`;
          }
          // Scanline fade-out after transition settles
          setTimeout(() => {
            if (hdScanline && targetOpacities.beachEmpty > 0.5) {
              hdScanline.style.opacity = '0';
              hdScanline.style.animation = 'none';
            }
            if (hdScanlineSprite && targetOpacities.beachEmpty > 0.5) {
              hdScanlineSprite.style.opacity = '0';
              hdScanlineSprite.style.animation = 'none';
            }
          }, 1500 / speed);
        } else if (state === 'blunt') {
          targetOpacities = { motherboard: 0.0, beachEmpty: 0.0, beachBlunt: 1.0 };
          if (lightRay) {
            lightRay.style.opacity = '0';
            lightRay.style.transform = 'scaleY(0)';
          }
          if (lightRaySprite) {
            lightRaySprite.style.opacity = '0';
            lightRaySprite.style.transform = 'scaleY(0)';
          }
          if (hdMenu) {
            hdMenu.style.opacity = '0';
            hdMenu.style.transform = 'translateY(20px) scale(0.95)';
          }
          if (hdMenuSprite) {
            hdMenuSprite.style.opacity = '0';
            hdMenuSprite.style.transform = 'translateY(20px) scale(0.95)';
          }
          if (hdScanline) {
            hdScanline.style.opacity = '0';
            hdScanline.style.animation = 'none';
          }
          if (hdScanlineSprite) {
            hdScanlineSprite.style.opacity = '0';
            hdScanlineSprite.style.animation = 'none';
          }
        }
      }
    });
  });

  // Interactive icon click handlers (runs transition then navigates to target page)
  holoIconBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPage = btn.getAttribute('data-holo-target');
      if (!targetPage) return;

      btn.classList.add('pulse-touch');
      setTimeout(() => btn.classList.remove('pulse-touch'), 400);

      if (currentHoloMode === 'gif') {
        const btnGlitch = document.getElementById('btn-state-glitch-transition');
        if (btnGlitch) btnGlitch.click();
        setTimeout(() => {
          window.location.href = `${targetPage}.html`;
        }, 1500);
      } else {
        // Materialize beach empty scene on icon click
        const btnBeach = document.getElementById('btn-state-beach-empty');
        if (btnBeach) btnBeach.click();

        // 1.5 seconds later: spark the blunt
        setTimeout(() => {
          const btnBlunt = document.getElementById('btn-state-beach-blunt');
          if (btnBlunt) btnBlunt.click();
          
          // Immersive zoom effect on the canvas to simulate entering the portal
          if (hdCanvas) {
            hdCanvas.style.transform = `scale(2.5) translate(-10px, -20px)`;
            hdCanvas.style.transition = 'transform 1.8s cubic-bezier(0.7, 0, 0.3, 1)';
          }
        }, 1600);

        // 3.5 seconds later: load the actual target HTML page!
        setTimeout(() => {
          if (hdCanvas) {
            hdCanvas.style.transform = 'scale(1)';
            hdCanvas.style.transition = 'transform 0.3s';
          }
          resetWebHoloState();
          window.location.href = `${targetPage}.html`;
        }, 3600);
      }
    });
  });

  // Play Full Story Sequence Timeline
  let timelineTimeouts = [];
  if (triggerSeqBtn) {
    triggerSeqBtn.addEventListener('click', () => {
      timelineTimeouts.forEach(t => clearTimeout(t));
      timelineTimeouts = [];

      const speed = speedInput ? parseFloat(speedInput.value) : 1.0;

      if (currentHoloMode === 'gif') {
        if (gifElement) {
          gifElement.src = `assets/stickers/cyberpunk/cyberpunk_hologram.gif?t=${Date.now()}`;
        }
        resetHoloState();

        timelineTimeouts.push(setTimeout(() => {
          const btnHolo = document.getElementById('btn-state-hologram-up');
          if (btnHolo) btnHolo.click();
        }, 1100 / speed));

        timelineTimeouts.push(setTimeout(() => {
          const activeIcon = document.querySelector('#hologram-icons-overlay .holo-icon-btn.active') || document.querySelector('#hologram-icons-overlay .holo-icon-btn');
          if (activeIcon) {
            activeIcon.classList.add('pulse-touch');
            setTimeout(() => activeIcon.classList.remove('pulse-touch'), 400);
          }
        }, 2200 / speed));

        timelineTimeouts.push(setTimeout(() => {
          const btnGlitch = document.getElementById('btn-state-glitch-transition');
          if (btnGlitch) btnGlitch.click();
        }, 2500 / speed));

        timelineTimeouts.push(setTimeout(() => {
          navigateTo('feed');
          resetHoloState();
        }, 3600 / speed));
      } else {
        // HD Web mode cinematic 9-second timeline sequence
        resetWebHoloState();

        // Stage 1: Idle Motherboard (empty hand) is active immediately on reset

        // Stage 2: Activate Hologram Projection (1.0s)
        timelineTimeouts.push(setTimeout(() => {
          const btnHolo = document.getElementById('btn-state-hologram-up');
          if (btnHolo) btnHolo.click();
        }, 1000 / speed));

        // Stage 3: Hover and touch icon (2.5s)
        timelineTimeouts.push(setTimeout(() => {
          const activeIcon = document.querySelector('#holo-hd-menu .holo-icon-btn.active') || document.querySelector('#holo-hd-menu .holo-icon-btn');
          if (activeIcon) {
            activeIcon.classList.add('pulse-touch');
            setTimeout(() => activeIcon.classList.remove('pulse-touch'), 400);
          }
        }, 2500 / speed));

        // Stage 4: Trigger Beach Materialization (pixel dissolve/wipe) (3.2s)
        timelineTimeouts.push(setTimeout(() => {
          const btnBeach = document.getElementById('btn-state-beach-empty');
          if (btnBeach) btnBeach.click();
        }, 3200 / speed));

        // Stage 5: Spark Purple Blunt & Smoke (5.5s)
        timelineTimeouts.push(setTimeout(() => {
          const btnBlunt = document.getElementById('btn-state-beach-blunt');
          if (btnBlunt) btnBlunt.click();
        }, 5500 / speed));

        // Stage 6: Zoom Transition Matrix to Feed (8.0s)
        timelineTimeouts.push(setTimeout(() => {
          if (hdCanvas) {
            hdCanvas.style.transform = `scale(2.5) translate(-10px, -20px)`;
            hdCanvas.style.transition = `transform ${1.5 / speed}s cubic-bezier(0.7, 0, 0.3, 1)`;
          }
        }, 8000 / speed));

        // Stage 7: Navigation complete (9.5s)
        timelineTimeouts.push(setTimeout(() => {
          navigateTo('feed');
          if (hdCanvas) {
            hdCanvas.style.transform = 'scale(1)';
            hdCanvas.style.transition = 'transform 0.3s';
          }
          resetWebHoloState();
        }, 9500 / speed));
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', init);
