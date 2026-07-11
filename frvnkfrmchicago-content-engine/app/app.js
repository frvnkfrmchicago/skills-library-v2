// =============================================================================
// app.js -- Main application logic for Asset Persona Content Hub
// =============================================================================
// Vanilla JS, no frameworks. ES module loaded from index.html.
// =============================================================================

// ---- Team / Auth ----
var TEAM = [
  { id: 'frank',      name: 'Frank Lawrence Jr.', role: 'admin', pos: 'Lead Developer' },
  { id: 'assistant',  name: 'AI Assistant',       role: 'team',  pos: 'Content Engine' }
];
window.TEAM = TEAM;

var user = null;
var posts = [];
var currentTab = 'posts';
var currentFilter = 'all';
var currentCatFilter = 'all';
var currentStatusFilter = 'all';
var currentPlatformFilter = 'all';
var currentSort = 'newest';
var searchQuery = '';
var selectedPosts = new Set();
window.ghDeleteMode = false;

function ghToggleDeleteMode() {
  window.ghDeleteMode = !window.ghDeleteMode;
  var btn = $('sidebarDeleteBtn');
  if (btn) {
    if (window.ghDeleteMode) {
      btn.classList.add('active');
      btn.textContent = 'Exit Delete Mode';
    } else {
      btn.classList.remove('active');
      btn.textContent = 'Delete posts';
    }
  }
  
  if (!window.ghDeleteMode) {
    selectedPosts.clear();
    updateBulkUI();
  }
  
  render();
}
window.ghToggleDeleteMode = ghToggleDeleteMode;

// ---- Helpers ----
function $(id) { return document.getElementById(id); }

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function escHtml(s) {
  var d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

function generateUniqueImage(topic, category, agentName) {
  try {
    var canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    var ctx = canvas.getContext('2d');
    
    var isDay = document.documentElement.classList.contains('day-mode');
    
    // Background
    var gradient = ctx.createRadialGradient(540, 540, 100, 540, 540, 800);
    if (isDay) {
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
    } else {
      gradient.addColorStop(0, '#0f0e26');
      gradient.addColorStop(1, '#050409');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);
    
    // Tech HUD Mesh Grid
    ctx.strokeStyle = isDay ? 'rgba(79, 70, 229, 0.03)' : 'rgba(0, 194, 255, 0.04)';
    ctx.lineWidth = 1;
    var gridSize = 60;
    for (var x = 0; x < 1080; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1080); ctx.stroke();
    }
    for (var y = 0; y < 1080; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke();
    }
    
    // Seed random from topic
    var seed = 0;
    var str = (topic || "") + (category || "") + (agentName || "");
    for (var i = 0; i < str.length; i++) {
      seed += str.charCodeAt(i);
    }
    var rand = function() {
      var x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
    
    // Draw glowing center UI HUD elements
    ctx.save();
    ctx.translate(540, 480);
    
    var rings = 3 + Math.floor(rand() * 3);
    for (var r = 0; r < rings; r++) {
      var radius = 140 + r * 70;
      var isEven = r % 2 === 0;
      if (isDay) {
        ctx.strokeStyle = isEven ? 'rgba(14, 165, 233, 0.25)' : 'rgba(99, 102, 241, 0.25)';
      } else {
        ctx.strokeStyle = isEven ? 'rgba(0, 194, 255, 0.2)' : 'rgba(139, 92, 246, 0.2)';
      }
      ctx.lineWidth = 1.5 + rand() * 3.5;
      ctx.beginPath();
      var startAngle = rand() * Math.PI * 2;
      var endAngle = startAngle + Math.PI * (0.6 + rand() * 1.1);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.stroke();
      
      // Draw dots
      var dots = 2 + Math.floor(rand() * 4);
      for (var d = 0; d < dots; d++) {
        var angle = startAngle + (endAngle - startAngle) * (d / dots);
        var dx = Math.cos(angle) * radius;
        var dy = Math.sin(angle) * radius;
        if (isDay) {
          ctx.fillStyle = isEven ? '#0284c7' : '#4f46e5';
        } else {
          ctx.fillStyle = isEven ? '#00c2ff' : '#a855f7';
        }
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = isDay ? 6 : 12;
        ctx.beginPath();
        ctx.arc(dx, dy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow
      }
    }
    
    // Draw inner data nodes connection
    ctx.strokeStyle = isDay ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    var nodes = [];
    for (var n = 0; n < 6; n++) {
      var angle = (n / 6) * Math.PI * 2 + rand() * 0.5;
      var dist = 60 + rand() * 40;
      nodes.push({ x: Math.cos(angle)*dist, y: Math.sin(angle)*dist });
    }
    for (var ni = 0; ni < nodes.length; ni++) {
      ctx.beginPath();
      ctx.moveTo(nodes[ni].x, nodes[ni].y);
      ctx.lineTo(nodes[(ni+1)%nodes.length].x, nodes[(ni+1)%nodes.length].y);
      ctx.stroke();
      
      ctx.fillStyle = isDay ? '#334155' : '#ffffff';
      ctx.beginPath();
      ctx.arc(nodes[ni].x, nodes[ni].y, 3, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
    
    // Glassmorphic Card Overlay at Bottom
    var cardGrad = ctx.createLinearGradient(120, 800, 960, 1020);
    if (isDay) {
      cardGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      cardGrad.addColorStop(1, 'rgba(255, 255, 255, 0.6)');
    } else {
      cardGrad.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
      cardGrad.addColorStop(1, 'rgba(255, 255, 255, 0.01)');
    }
    ctx.fillStyle = cardGrad;
    
    var roundRect = function(c, rx, ry, w, h, rad) {
      c.beginPath();
      c.moveTo(rx + rad, ry);
      c.lineTo(rx + w - rad, ry);
      c.quadraticCurveTo(rx + w, ry, rx + w, ry + rad);
      c.lineTo(rx + w, ry + h - rad);
      c.quadraticCurveTo(rx + w, ry + h, rx + w - rad, ry + h);
      c.lineTo(rx + rad, ry + h);
      c.quadraticCurveTo(rx, ry + h, rx, ry + h - rad);
      c.lineTo(rx, ry + rad);
      c.quadraticCurveTo(rx, ry, rx + rad, ry);
      c.closePath();
    };
    
    // Draw bottom card
    ctx.shadowColor = isDay ? 'rgba(15, 23, 42, 0.08)' : 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = isDay ? 16 : 24;
    roundRect(ctx, 120, 800, 840, 220, 18);
    ctx.fill();
    ctx.strokeStyle = isDay ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.07)';
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Draw Content Text Inside Bottom Card
    ctx.fillStyle = isDay ? '#0f172a' : '#ffffff';
    ctx.font = 'bold 36px "Space Grotesk", "Inter", sans-serif';
    var displayHeadline = (topic || "").toUpperCase();
    if (displayHeadline.length > 35) displayHeadline = displayHeadline.slice(0, 32) + '...';
    ctx.fillText(displayHeadline, 160, 875);
    
    ctx.fillStyle = isDay ? '#4f46e5' : '#00c2ff';
    ctx.font = '600 20px "Space Grotesk", "Inter", sans-serif';
    ctx.fillText('DESIGNED BY AGENT: ' + (agentName || "Lil Neutron").toUpperCase() + ' // ' + (category || "creative").toUpperCase(), 160, 920);
    
    ctx.fillStyle = isDay ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.45)';
    ctx.font = '500 16px "Inter", sans-serif';
    ctx.fillText('AGENTIC COMMAND CENTRE v2026 // PIPELINE VERIFIED', 160, 965);
    
    // Logo badge top-left
    ctx.fillStyle = isDay ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.03)';
    roundRect(ctx, 60, 60, 260, 70, 12);
    ctx.fill();
    ctx.strokeStyle = isDay ? 'rgba(79, 70, 229, 0.12)' : 'rgba(0, 194, 255, 0.12)';
    ctx.stroke();
    
    ctx.fillStyle = isDay ? '#0f172a' : '#ffffff';
    ctx.font = 'bold 18px "Space Grotesk", sans-serif';
    ctx.fillText('AGENTIC CENTRE', 110, 102);
    
    ctx.fillStyle = isDay ? '#4f46e5' : '#8b5cf6';
    ctx.beginPath();
    ctx.arc(88, 95, 7, 0, Math.PI*2);
    ctx.fill();
    
    return canvas.toDataURL('image/png');
  } catch (e) {
    console.error('Image rendering failed, returning placeholder:', e);
    return 'assets/rolling_tray_ui_1.png';
  }
}
window.generateUniqueImage = generateUniqueImage;

function relativeDate(ts) {
  if (!ts) return '';
  var d = typeof ts === 'string' ? new Date(ts) : new Date(ts);
  if (isNaN(d.getTime())) return '';
  var now = new Date();
  var diff = now - d;
  var mins = Math.floor(diff / 60000);
  var hrs = Math.floor(diff / 3600000);
  var days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return mins + 'm ago';
  if (hrs < 24) return hrs + 'h ago';
  if (days < 7) return days + 'd ago';
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[d.getMonth()] + ' ' + d.getDate();
}

function fmtHL(text, hlWords) {
  if (!text) return '';
  var s = new Set((hlWords || []).map(function (w) { return w.toLowerCase(); }));
  return text.split(/\s+/).map(function (w) {
    return s.has(w.toLowerCase()) ? '<span class="hl">' + escHtml(w) + '</span>' : escHtml(w);
  }).join(' ');
}

var CATEGORY_LABELS = {
  ai_ml: 'AI / ML',
  ai_education: 'AI in Education',
  ai_finance: 'AI in Finance',
  ai_health: 'AI in Health',
  ai_public_health: 'AI in Public Health',
  ai_dentistry: 'AI in Dentistry',
  dev_tools: 'Dev Tools',
  career: 'Career',
  culture: 'Culture',
  creative: 'Creative',
  industry: 'Industry'
};

var CATEGORY_COLORS = {
  ai_ml: '#00C2FF',
  ai_education: '#38BDF8',
  ai_finance: '#818CF8',
  ai_health: '#F472B6',
  ai_public_health: '#34D399',
  ai_dentistry: '#FB923C',
  dev_tools: '#60A5FA',
  career: '#FBBF24',
  culture: '#FF2E5B',
  creative: '#10B981',
  industry: '#00F5D4'
};

// ---- Data Management ----
function loadPosts() {
  var cached = [];
  try { cached = JSON.parse(localStorage.getItem('ap_posts') || '[]'); } catch (e) {}
  if (cached.length > 0) {
    posts = cached;
  }

  if (window.postsApi) {
    window.postsApi.list()
      .then(function (dbPosts) {
        if (dbPosts && dbPosts.length > 0) {
          posts = dbPosts;
          savePosts();
          render();
        }
      })
      .catch(function (err) {
        console.error('Failed to load posts from API:', err);
      });
  }
}

function savePosts() {
  try { localStorage.setItem('ap_posts', JSON.stringify(posts)); } catch (e) {}
}

function triggerN8NWebhook(url, payload) {
  if (!url) return Promise.resolve(null);
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(function(res) {
    if (!res.ok) throw new Error('HTTP status ' + res.status);
    return res.text().then(function(text) {
      try {
        return JSON.parse(text);
      } catch(e) {
        return { message: text };
      }
    });
  })
  .catch(function(err) {
    console.error('N8N Webhook trigger error:', err);
    throw err;
  });
}
window.triggerN8NWebhook = triggerN8NWebhook;

// ---- Theme Logic ----
function initTheme() {
  var saved = localStorage.getItem('ap_theme') || 'night';
  setTheme(saved);
}

function setTheme(theme) {
  var root = document.documentElement;
  var toggleBtn = $('themeToggleBtn');
  
  if (theme === 'day') {
    root.classList.add('day-mode');
    if (toggleBtn) toggleBtn.classList.add('day-active');
  } else {
    root.classList.remove('day-mode');
    if (toggleBtn) toggleBtn.classList.remove('day-active');
  }
  localStorage.setItem('ap_theme', theme);
}

function toggleTheme() {
  var isDay = document.documentElement.classList.contains('day-mode');
  setTheme(isDay ? 'night' : 'day');
}

window.initTheme = initTheme;
window.setTheme = setTheme;
window.toggleTheme = toggleTheme;

// ---- Today Badge ----
function paintToday() {
  var el = $('sidebarDate');
  if (!el) return;
  var d = new Date();
  var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  el.textContent = days[d.getDay()] + ' ' + months[d.getMonth()] + ' ' + d.getDate();
}

// ---- Login / Auth ----
function initLogin() {
  var grid = $('memberGrid');
  if (!grid) return;

  TEAM.forEach(function (m) {
    var btn = document.createElement('button');
    btn.className = 'member-btn';
    btn.innerHTML = escHtml(m.name) + '<span class="role-tag">' + escHtml(m.pos) + '</span>';
    btn.addEventListener('click', function () { login(m.id); });
    grid.appendChild(btn);
  });

  var saved = localStorage.getItem('ap_centre_user');
  if (saved) login(saved);
}

function login(id) {
  user = TEAM.find(function (m) { return m.id === id; });
  if (!user) return;
  localStorage.setItem('ap_centre_user', user.id);
  document.documentElement.classList.add('authed');
  $('loginScreen').classList.add('hidden');
  $('appScreen').classList.remove('hidden');

  $('sidebarUser').innerHTML =
    '<div class="avatar">' + user.name[0] + '</div>' +
    '<div><div class="name">' + escHtml(user.name) + '</div>' +
    '<div class="role">' + escHtml(user.pos) + '</div></div>' +
    '<button class="logout-btn" title="Sign out" onclick="logout()">&#8617;</button>';

  render();
}

function logout() {
  localStorage.removeItem('ap_centre_user');
  document.documentElement.classList.remove('authed');
  user = null;
  $('loginScreen').classList.remove('hidden');
  $('appScreen').classList.add('hidden');
}
window.logout = logout;

// ---- Sidebar Counts ----
function updateCounts() {
  if (!$('cAll')) return;

  $('cAll').textContent = posts.length;
  $('cDrafts').textContent = posts.filter(function (p) { return p.status === 'draft' || p.status === 'pending'; }).length;
  $('cSent').textContent = posts.filter(function (p) { return p.status === 'published' || p.status === 'scheduled' || p.status === 'approved'; }).length;
  $('cArchive').textContent = posts.filter(function (p) { return p.status === 'archived' || p.status === 'failed'; }).length;

  // Standard categories
  Object.keys(CATEGORY_LABELS).forEach(function (cat) {
    var el = $('c_' + cat);
    if (el) el.textContent = posts.filter(function (p) { return p.category === cat; }).length;
  });

  // Custom categories
  customCategories.forEach(function (cat) {
    var el = $('c_' + cat.key);
    if (el) el.textContent = posts.filter(function (p) { return p.category === cat.key; }).length;
  });
}

// ---- Tab Navigation ----
function toggleSidebarGroup(groupId, header) {
  var content = $(groupId);
  if (content) {
    content.classList.toggle('collapsed');
    header.classList.toggle('collapsed');
  }
}
window.toggleSidebarGroup = toggleSidebarGroup;

// ---- Tab Navigation ----
function setTab(tab, el) {
  currentTab = tab;
  document.querySelectorAll('.sidebar-item').forEach(function (t) { t.classList.remove('active'); });
  if (el) {
    el.classList.add('active');
  } else {
    var fallback = document.querySelector('.sidebar-item[data-sec="' + tab + '"]');
    if (fallback) fallback.classList.add('active');
  }

  var postsSection = $('postsSection');
  var ideasSection = $('ideasSection');
  var feedsSection = $('feedsSection');
  var calendarSection = $('calendarSection');
  var pipelinesSection = $('pipelinesSection');
  var settingsSection = $('settingsSection');
  var gallerySection = $('gallerySection');

  [postsSection, ideasSection, feedsSection, calendarSection, pipelinesSection, settingsSection, gallerySection].forEach(function (s) {
    if (s) s.classList.add('hidden');
  });

  var pageTitleEl = $('pageTitle');
  var pageSubEl = $('pageSub');
  var newPostBtn = document.querySelector('.page-header .new-post-btn');
  
  if (newPostBtn) {
    if (tab === 'posts') {
      newPostBtn.style.display = '';
    } else {
      newPostBtn.style.display = 'none';
    }
  }

  if (pageTitleEl && pageSubEl) {
    if (tab === 'posts') {
      if (currentFolderFilter === 'all') {
        pageTitleEl.textContent = 'All Posts';
        pageSubEl.textContent = 'Manage content across all platforms';
      } else if (currentFolderFilter === 'drafts') {
        pageTitleEl.textContent = 'Drafts';
        pageSubEl.textContent = 'Refine and approve draft contents';
      } else if (currentFolderFilter === 'sent') {
        pageTitleEl.textContent = 'Sent & Published';
        pageSubEl.textContent = 'View active and published social posts';
      } else if (currentFolderFilter === 'archive') {
        pageTitleEl.textContent = 'Archived Posts';
        pageSubEl.textContent = 'Browse archived and failed posts';
      }
    } else if (tab === 'ideas') {
      pageTitleEl.textContent = 'Ideas & Topics';
      pageSubEl.textContent = 'Brainstorm and queue new content ideas';
    } else if (tab === 'feeds') {
      pageTitleEl.textContent = 'Feed Ingestion';
      pageSubEl.textContent = 'Sync and ingest external news sources';
    } else if (tab === 'calendar') {
      pageTitleEl.textContent = 'Content Calendar';
      pageSubEl.textContent = 'Visualize and schedule your publishing pipeline';
    } else if (tab === 'pipelines') {
      pageTitleEl.textContent = 'Execution Pipelines';
      pageSubEl.textContent = 'Monitor background tasks and agent logs';
    } else if (tab === 'settings') {
      pageTitleEl.textContent = 'System Settings';
      pageSubEl.textContent = 'Configure Supabase, API keys, and webhooks';
    } else if (tab === 'gallery') {
      pageTitleEl.textContent = 'Gallery & Assets';
      pageSubEl.textContent = 'Explore generated creatives and visual assets';
    }
  }

  if (tab === 'posts' && postsSection) {
    postsSection.classList.remove('hidden');
    render();
  } else if (tab === 'ideas' && ideasSection) {
    ideasSection.classList.remove('hidden');
    renderIdeas();
  } else if (tab === 'feeds' && feedsSection) {
    feedsSection.classList.remove('hidden');
    if (typeof window.renderTrending === 'function') {
      window.renderTrending(feedsSection);
    }
  } else if (tab === 'calendar' && calendarSection) {
    calendarSection.classList.remove('hidden');
    renderCalendarView();
  } else if (tab === 'pipelines' && pipelinesSection) {
    pipelinesSection.classList.remove('hidden');
    renderPipelines();
  } else if (tab === 'settings' && settingsSection) {
    settingsSection.classList.remove('hidden');
  } else if (tab === 'gallery' && gallerySection) {
    gallerySection.classList.remove('hidden');
    renderGallery();
  }
}
window.setTab = setTab;

// ---- Category Filter (sidebar) ----
function setFilter(cat, el) {
  currentCatFilter = cat;
  currentFolderFilter = 'all';
  currentStatusFilter = 'all';

  // Sync status bar tabs active state (select "All" status tab)
  var allStatusTab = document.querySelector('.status-tab[onclick*="all"]');
  if (allStatusTab) {
    document.querySelectorAll('.status-tab').forEach(function (i) { i.classList.remove('active'); });
    allStatusTab.classList.add('active');
  }

  document.querySelectorAll('.sidebar-item').forEach(function (i) { i.classList.remove('active'); });
  if (el) el.classList.add('active');

  // Switch to posts tab
  if (currentTab !== 'posts') {
    var postsTab = document.querySelector('.sidebar-item[data-sec="posts"]');
    setTab('posts', postsTab);
    // Re-highlight Category item
    document.querySelectorAll('.sidebar-item').forEach(function (i) { i.classList.remove('active'); });
    if (el) el.classList.add('active');
  } else {
    render();
  }
}
window.setFilter = setFilter;

// ---- Category Filter (dropdown) ----
function populateCatDropdown() {
  var sel = $('catSelect');
  if (!sel) return;
  sel.innerHTML = '<option value="all">All Categories</option>';
  Object.keys(CATEGORY_LABELS).forEach(function (key) {
    var opt = document.createElement('option');
    opt.value = key;
    opt.textContent = CATEGORY_LABELS[key];
    sel.appendChild(opt);
  });
}

function setCatChip(cat) {
  currentCatFilter = cat;
  var sel = $('catSelect');
  if (sel) sel.value = cat;
  render();
}
window.setCatChip = setCatChip;

// ---- Status Filter ----
function setStatusFilter(status, el) {
  currentStatusFilter = status;
  document.querySelectorAll('.status-tab').forEach(function (t) { t.classList.remove('active'); });
  if (el) el.classList.add('active');

  // Sync sidebar folder active state
  var folderId = 'sbFolder_all';
  if (status === 'draft' || status === 'pending') {
    folderId = 'sbFolder_drafts';
  } else if (status === 'approved' || status === 'scheduled' || status === 'published') {
    folderId = 'sbFolder_sent';
  } else if (status === 'archived' || status === 'failed') {
    folderId = 'sbFolder_archive';
  }

  document.querySelectorAll('.sidebar-item').forEach(function (i) { i.classList.remove('active'); });
  var folderEl = $(folderId);
  if (folderEl) folderEl.classList.add('active');

  render();
}
window.setStatusFilter = setStatusFilter;

// ---- Platform Filter ----
function setPlatformFilter(platform, el) {
  currentPlatformFilter = platform;
  document.querySelectorAll('.platform-chip').forEach(function (c) { c.classList.remove('active'); });
  if (el) el.classList.add('active');
  render();
}
window.setPlatformFilter = setPlatformFilter;

function filterByPlatform(postList, platform) {
  if (!platform || platform === 'all') return postList;
  return postList.filter(function (p) {
    return (p.platforms || []).indexOf(platform) >= 0;
  });
}
window.filterByPlatform = filterByPlatform;

// ---- Sort ----
function setSort(val) {
  currentSort = val;
  render();
}
window.setSort = setSort;

// ---- Search ----
function setSearch(val) {
  searchQuery = val;
  render();
}
window.setSearch = setSearch;

// ---- Main Render ----
function render() {
  var filtered = getFilteredPosts();

  // Sort
  if (currentSort === 'oldest') {
    filtered.sort(function (a, b) { return new Date(a.created_at) - new Date(b.created_at); });
  } else if (currentSort === 'status') {
    var order = { published: 0, scheduled: 1, approved: 2, pending: 3, draft: 4 };
    filtered.sort(function (a, b) { return (order[a.status] || 5) - (order[b.status] || 5); });
  } else {
    filtered.sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
  }

  updateCounts();

  var grid = $('postsGrid');
  var empty = $('emptyState');
  if (!grid) return;

  if (!filtered.length) {
    grid.innerHTML = '';
    if (empty) empty.classList.remove('hidden');
    return;
  }

  if (empty) empty.classList.add('hidden');

  var html = '';
  filtered.forEach(function (p) {
    var dateStr = relativeDate(p.created_at);
    var catLabel = CATEGORY_LABELS[p.category] || p.category;
    var platformHtml = '';
    if (p.platforms && p.platforms.length) {
      platformHtml = '<div class="platform-icons">';
      p.platforms.forEach(function (pl) {
        var label = pl === 'linkedin' ? 'LinkedIn' : pl === 'threads' ? 'Threads' : pl === 'instagram' ? 'Instagram' : pl === 'facebook' ? 'Facebook' : pl;
        platformHtml += '<span class="platform-icon plat-' + pl + '">' + label + '</span>';
      });
      platformHtml += '</div>';
    }

    var isSelected = selectedPosts.has(p.id);
    html += '<div class="post-card' + (isSelected ? ' selected' : '') + '" data-pid="' + p.id + '">';
    
    // Checkbox selector is always rendered
    html += '<label class="card-select" onclick="event.stopPropagation()"><input type="checkbox" ' + (isSelected ? 'checked' : '') + ' onchange="toggleSelect(\'' + p.id + '\', this.checked)"></label>';
    
    // Delete button is always rendered (visible on hover via CSS)
    html += '<button type="button" class="card-delete" title="Delete post" onclick="event.stopPropagation();deletePost(\'' + p.id + '\')">&times;</button>';
    html += '<div class="post-card-image">';
    if (p.image_url) {
      html += '<img src="' + escHtml(p.image_url) + '" style="width:100%;height:100%;object-fit:cover;display:block;">';
    } else {
      html += '<div style="width:100%;height:100%;background:linear-gradient(135deg,#080612,#100D22)"></div>';
    }
    html += '<div class="grad"></div>';
    html += '<div class="hl-overlay">' + fmtHL(p.headline, p.hlWords) + '</div>';
    html += '</div>';
    html += '<div class="post-card-body">';
    html += '<div class="cap">' + escHtml(p.caption || 'No caption') + '</div>';
    html += '<div class="post-card-meta">';
    html += '<span class="sys-tag tag-' + p.category + '">' + escHtml(catLabel) + '</span>';
    html += '<span class="st-badge st-' + p.status + '">' + escHtml(p.status) + '</span>';
    html += '</div>';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:10px;color:rgba(148,163,184,.35);">';
    html += '<span>' + dateStr + '</span>';
    html += platformHtml;
    html += '</div>';
    html += '</div></div>';
  });

  grid.innerHTML = html;

  // Attach click handlers
  grid.querySelectorAll('.post-card').forEach(function (card) {
    card.addEventListener('click', function () {
      openDetail(card.getAttribute('data-pid'));
    });
  });
}

// ---- Detail Panel ----
function openDetail(id) {
  var p = posts.find(function (x) { return x.id === id; });
  if (!p) return;

  var overlay = $('detailOverlay');
  var panel = $('detailContent');
  if (!overlay || !panel) return;

  var catLabel = CATEGORY_LABELS[p.category] || p.category;
  var html = '';

  // Close button
  html += '<button class="detail-close" onclick="closeDetail()">Close</button>';

  // Category + Status
  html += '<div style="margin-bottom:12px;">';
  html += '<span class="sys-tag tag-' + p.category + '">' + escHtml(catLabel) + '</span> ';
  html += '<span class="st-badge st-' + p.status + '" style="margin-left:6px;">' + escHtml(p.status) + '</span>';
  html += '</div>';

  // Preview
  html += '<div class="detail-preview" style="position:relative;overflow:hidden;">';
  if (p.image_url) {
    html += '<img src="' + escHtml(p.image_url) + '" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;z-index:0;display:block;">';
  } else {
    html += '<div style="width:100%;height:100%;background:linear-gradient(135deg,#080612,#100D22)"></div>';
  }
  html += '<div class="grad" style="z-index:1;"></div>';
  html += '<div class="handle" style="z-index:2;">@assetpersona</div>';
  html += '<div class="hl-text" style="z-index:2;">' + fmtHL(p.headline, p.hlWords) + '</div>';
  html += '</div>';

  // Caption
  html += '<p class="detail-caption">' + escHtml(p.caption || '') + '</p>';

  // Tags
  if (p.tags && p.tags.length) {
    html += '<div class="detail-tags">';
    p.tags.forEach(function (t) {
      html += '<span class="hashtag">' + escHtml(t) + '</span>';
    });
    html += '</div>';
  }

  // Info
  var authorName = TEAM.find(function (m) { return m.id === p.created_by; });
  html += '<div class="detail-info">By ' + escHtml(authorName ? authorName.name : p.created_by) + ' | ' + new Date(p.created_at).toLocaleDateString() + '</div>';

  // Schedule info
  if (p.scheduled_at) {
    html += '<div style="margin:8px 0;padding:8px 12px;border-radius:6px;background:rgba(0,194,255,.06);border:1px solid rgba(0,194,255,.15);font-size:11px;color:#00C2FF">';
    html += 'Scheduled: ' + new Date(p.scheduled_at).toLocaleDateString() + ' ' + new Date(p.scheduled_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    html += '</div>';
  }

  // Actions
  html += '<hr class="section-divider">';
  html += '<div class="section-label">Actions</div>';
  html += '<div class="btn-row">';

  if (p.status === 'pending' || p.status === 'draft') {
    html += '<button class="btn btn-green" onclick="approvePost(\'' + p.id + '\')">Approve</button>';
  }
  if (p.status === 'approved') {
    html += '<button class="btn btn-mint" onclick="publishPost(\'' + p.id + '\')">Publish Now</button>';
  }
  if (p.status !== 'published') {
    html += '<button class="btn" style="background:rgba(0,194,255,.08);color:#00C2FF;border:1px solid rgba(0,194,255,.2)" onclick="schedulePost(\'' + p.id + '\')">Schedule</button>';
  }

  html += '<button type="button" class="btn btn-red" onclick="deletePost(\'' + p.id + '\')">Delete</button>';
  html += '</div>';

  // Platform routing
  html += '<hr class="section-divider">';
  html += '<div class="section-label">Platform Routing</div>';
  html += '<div class="platform-checks">';
  ['LinkedIn', 'Threads', 'Instagram', 'Facebook'].forEach(function (pl) {
    var plKey = pl.toLowerCase();
    var checked = (p.platforms || []).indexOf(plKey) >= 0 ? ' checked' : '';
    html += '<label class="plat-check-label"><input type="checkbox" data-plat="' + plKey + '"' + checked + ' onchange="togglePlatform(\'' + p.id + '\',\'' + plKey + '\',this.checked)"> ' + pl + '</label>';
  });
  html += '</div>';

  // Comments
  html += '<hr class="section-divider">';
  html += '<div class="section-label">Comments (' + (p.comments || []).length + ')</div>';

  (p.comments || []).forEach(function (c) {
    html += '<div class="comment-item">';
    html += '<span class="ca">' + escHtml(c.authorName || c.author || '') + '</span>';
    html += '<span class="ct">' + relativeDate(c.created_at) + '</span>';
    html += '<div class="cx">' + escHtml(c.body || c.x || '') + '</div>';
    html += '</div>';
  });

  html += '<div class="comment-input">';
  html += '<input type="text" id="commentInput" placeholder="Add a comment...">';
  html += '<button onclick="addComment(\'' + p.id + '\')">Send</button>';
  html += '</div>';

  panel.innerHTML = html;
  overlay.classList.add('open');
}
window.openDetail = openDetail;

function closeDetail() {
  var overlay = $('detailOverlay');
  if (overlay) overlay.classList.remove('open');
}
window.closeDetail = closeDetail;

// ---- Post Actions ----
async function generateImageForPost(p) {
  showToast('Generating AI image...', 'info');
  try {
    var webhookUrl = 'http://34.28.216.185:5678/webhook/Cnn0KQRcW5CvlalO/webhook/gh-ai-image';
    var response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: p.img_prompt || p.caption || p.headline || 'A beautiful cannabis brand photograph'
      })
    });
    if (!response.ok) {
      throw new Error('HTTP status ' + response.status);
    }
    var data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    if (data.image) {
      p.image_url = data.image;
      p.img_url = data.image;
      if (window.postsApi && window.postsApi.ready()) {
        await window.postsApi.update(p.id, { img_url: data.image });
      }
      savePosts();
      render();
      var currentDetail = document.getElementById('detailOverlay');
      if (currentDetail && currentDetail.classList.contains('open')) {
        openDetail(p.id);
      }
      showToast('AI image generated successfully', 'success');
    } else {
      throw new Error('No image returned');
    }
  } catch (err) {
    console.error('Image generation failed for post ' + p.id, err);
    showToast('AI image generation failed: ' + err.message, 'error');
  }
}

async function approvePost(id) {
  var p = posts.find(function (x) { return x.id === id; });
  if (!p) return;
  try {
    if (window.postsApi && window.postsApi.ready()) {
      var updated = await window.postsApi.transitionStatus(id, 'approved');
      p.status = updated.status;
    } else {
      p.status = 'approved';
    }
    savePosts();
    render();
    openDetail(id);
    showToast('Post approved', 'success');

    // N8N webhook trigger (Social)
    var url = localStorage.getItem('ap_n8n_social_webhook');
    if (url) {
      triggerN8NWebhook(url, {
        event: 'post_approved',
        postId: id,
        post: p
      });
    }

    if (!p.image_url && !p.img_url) {
      generateImageForPost(p);
    }
  } catch (err) {
    showToast('Failed to approve post: ' + err.message, 'error');
  }
}
window.approvePost = approvePost;

function showToast(message, type) {
  var existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  var toast = document.createElement('div');
  toast.className = 'toast-notification toast-' + (type || 'info');
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(function () {
    toast.classList.add('toast-visible');
  });

  setTimeout(function () {
    toast.classList.remove('toast-visible');
    setTimeout(function () { toast.remove(); }, 300);
  }, 3500);
}
window.showToast = showToast;

async function publishPost(id) {
  var p = posts.find(function (x) { return x.id === id; });
  if (!p) return;
  
  try {
    if (window.postsApi && window.postsApi.ready()) {
      var updated = await window.postsApi.transitionStatus(id, 'published');
      p.status = updated.status;
      p.published_at = updated.published_at;
    } else {
      p.status = 'published';
      p.published_at = new Date().toISOString();
    }
    savePosts();
    render();
    openDetail(id);
  } catch (err) {
    showToast('Failed to update publish status: ' + err.message, 'error');
    return;
  }

  // N8N webhook trigger (Social)
  var n8nSocialUrl = localStorage.getItem('ap_n8n_social_webhook');
  if (n8nSocialUrl) {
    triggerN8NWebhook(n8nSocialUrl, {
      event: 'post_published',
      postId: id,
      post: p
    });
  }

  var supaUrl = '';
  var supaKey = '';
  try {
    supaUrl = localStorage.getItem('ap_supabase_url') || '';
    supaKey = localStorage.getItem('ap_supabase_key') || '';
  } catch (e) {}

  if (!supaUrl || !supaKey) return;

  var endpoint = supaUrl.replace(/\/$/, '') + '/functions/v1/social-publish';
  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + supaKey
    },
    body: JSON.stringify({ postId: p.id, platforms: p.platforms || [] })
  })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data && data.platform_post_ids) {
        p.platform_post_ids = data.platform_post_ids;
        if (window.postsApi && window.postsApi.ready()) {
          window.postsApi.update(p.id, { platform_post_ids: data.platform_post_ids });
        }
        savePosts();
      }
      var platformList = (p.platforms || []).join(', ') || 'no platforms';
      showToast('Published to ' + platformList, 'success');
    })
    .catch(function (err) {
      showToast('Edge function unreachable. Saved locally.', 'error');
    });
}
window.publishPost = publishPost;

async function schedulePost(id) {
  var p = posts.find(function (x) { return x.id === id; });
  if (!p) return;
  var tomorrow = new Date(Date.now() + 86400000);
  var defaultDate = tomorrow.toISOString().slice(0, 16);
  var dateStr = prompt('Schedule date/time (YYYY-MM-DDTHH:MM):', defaultDate);
  if (!dateStr) return;
  var d = new Date(dateStr);
  if (isNaN(d.getTime())) { alert('Invalid date'); return; }
  
  var scheduledAt = d.toISOString();
  try {
    if (window.postsApi && window.postsApi.ready()) {
      var updated = await window.postsApi.update(id, { status: 'scheduled', scheduled_at: scheduledAt });
      p.status = updated.status;
      p.scheduled_at = updated.scheduled_at;
    } else {
      p.status = 'scheduled';
      p.scheduled_at = scheduledAt;
    }
    savePosts();
    render();
    openDetail(id);
    showToast('Post scheduled', 'success');
  } catch (err) {
    showToast('Failed to schedule post: ' + err.message, 'error');
  }
}
window.schedulePost = schedulePost;

async function deletePost(id) {
  if (!confirm('Delete this post? This cannot be undone.')) return;
  try {
    if (window.postsApi) {
      await window.postsApi.remove(id);
    }
    posts = posts.filter(function (p) { return p.id !== id; });
    savePosts();
    closeDetail();
    render();
    showToast('Post deleted', 'success');
  } catch (err) {
    showToast('Failed to delete post: ' + err.message, 'error');
  }
}
window.deletePost = deletePost;

async function togglePlatform(id, platform, checked) {
  var p = posts.find(function (x) { return x.id === id; });
  if (!p) return;
  p.platforms = p.platforms || [];
  if (checked && p.platforms.indexOf(platform) === -1) {
    p.platforms.push(platform);
  } else if (!checked) {
    p.platforms = p.platforms.filter(function (pl) { return pl !== platform; });
  }
  
  try {
    if (window.postsApi && window.postsApi.ready()) {
      await window.postsApi.update(id, { platforms: p.platforms });
    }
    savePosts();
  } catch (err) {
    showToast('Failed to update platforms in database', 'error');
  }
}
window.togglePlatform = togglePlatform;

async function addComment(id) {
  var input = $('commentInput');
  if (!input || !input.value.trim()) return;
  var p = posts.find(function (x) { return x.id === id; });
  if (!p) return;
  p.comments = p.comments || [];
  var newComment = {
    id: uuid(),
    author: user ? user.id : 'anon',
    authorName: user ? user.name : 'Anonymous',
    body: input.value.trim(),
    created_at: new Date().toISOString()
  };
  p.comments.push(newComment);
  
  try {
    if (window.postsApi && window.postsApi.ready()) {
      await window.postsApi.update(id, { comments: p.comments });
    }
    savePosts();
    input.value = '';
    openDetail(id);
    
    // N8N webhook trigger (Chat/Notify)
    var url = localStorage.getItem('ap_n8n_chat_webhook');
    if (url) {
      triggerN8NWebhook(url, {
        event: 'comment_added',
        postId: id,
        postTitle: p.title || p.headline,
        comment: newComment
      });
    }
  } catch (err) {
    showToast('Failed to save comment: ' + err.message, 'error');
  }
}
window.addComment = addComment;

// ---- Selection / Bulk Actions ----
function toggleSelect(id, checked) {
  if (checked) {
    selectedPosts.add(id);
  } else {
    selectedPosts.delete(id);
  }
  
  // Directly toggle class on the DOM element for reactive visual feedback
  var card = document.querySelector('.post-card[data-pid="' + id + '"]');
  if (card) {
    if (checked) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  }
  
  updateBulkUI();
}
window.toggleSelect = toggleSelect;

function updateBulkUI() {
  var bulkEl = $('bulkActions');
  var countEl = $('bulkCount');
  var masterCb = $('masterSelectCheckbox');
  if (!bulkEl) return;
  
  if (selectedPosts.size > 0) {
    bulkEl.classList.add('active');
    bulkEl.classList.remove('hidden');
    if (countEl) countEl.textContent = selectedPosts.size + ' selected';
    
    // Check if all filtered posts are selected to toggle master checkbox
    var filtered = getFilteredPosts();
    var allSelected = filtered.length > 0 && filtered.every(function (p) { return selectedPosts.has(p.id); });
    if (masterCb) masterCb.checked = allSelected;
  } else {
    bulkEl.classList.remove('active');
    bulkEl.classList.add('hidden');
    if (masterCb) masterCb.checked = false;
  }
}

function clearSelection() {
  selectedPosts.clear();
  updateBulkUI();
  render();
}
window.clearSelection = clearSelection;

async function bulkApprove() {
  var ids = Array.from(selectedPosts);
  var successCount = 0;
  var errorCount = 0;
  var approvedList = [];
  for (var i = 0; i < ids.length; i++) {
    var p = posts.find(function (x) { return x.id === ids[i]; });
    if (p && p.status !== 'published') {
      try {
        if (window.postsApi && window.postsApi.ready()) {
          var updated = await window.postsApi.transitionStatus(p.id, 'approved');
          p.status = updated.status;
        } else {
          p.status = 'approved';
        }
        successCount++;
        approvedList.push(p);

        if (!p.image_url && !p.img_url) {
          generateImageForPost(p);
        }
      } catch (err) {
        console.error('Error approving post ' + p.id, err);
        errorCount++;
      }
    }
  }
  savePosts();
  selectedPosts.clear();
  updateBulkUI();
  render();
  if (errorCount > 0) {
    showToast('Approved ' + successCount + ' posts. ' + errorCount + ' failed.', 'warning');
  } else {
    showToast('Approved selected posts', 'success');
  }

  if (successCount > 0) {
    var url = localStorage.getItem('ap_n8n_social_webhook');
    if (url) {
      triggerN8NWebhook(url, {
        event: 'bulk_posts_approved',
        postIds: approvedList.map(function(x) { return x.id; }),
        posts: approvedList
      });
    }
  }
}
window.bulkApprove = bulkApprove;

async function bulkSubmit() {
  var ids = Array.from(selectedPosts);
  var successCount = 0;
  var errorCount = 0;
  for (var i = 0; i < ids.length; i++) {
    var p = posts.find(function (x) { return x.id === ids[i]; });
    if (p) {
      var targetStatus = 'pending';
      try {
        if (window.postsApi && window.postsApi.ready()) {
          var updated = await window.postsApi.transitionStatus(p.id, targetStatus);
          p.status = updated.status;
        } else {
          p.status = targetStatus;
        }
        successCount++;
      } catch (err) {
        console.error('Error submitting post ' + p.id, err);
        errorCount++;
      }
    }
  }
  savePosts();
  selectedPosts.clear();
  updateBulkUI();
  render();
  if (errorCount > 0) {
    showToast('Submitted ' + successCount + ' posts. ' + errorCount + ' failed.', 'warning');
  } else {
    showToast('Submitted selected posts for review', 'success');
  }
}
window.bulkSubmit = bulkSubmit;

async function bulkSchedule() {
  var scheduleDays = prompt('Schedule in how many days from now?', '3');
  if (!scheduleDays) return;
  var days = parseInt(scheduleDays, 10) || 3;
  var ids = Array.from(selectedPosts);
  var successCount = 0;
  var errorCount = 0;
  for (var i = 0; i < ids.length; i++) {
    var p = posts.find(function (x) { return x.id === ids[i]; });
    if (p) {
      var scheduledAt = new Date(Date.now() + 86400000 * days).toISOString();
      try {
        if (window.postsApi && window.postsApi.ready()) {
          var updated = await window.postsApi.update(p.id, { status: 'scheduled', scheduled_at: scheduledAt });
          p.status = updated.status;
          p.scheduled_at = updated.scheduled_at;
        } else {
          p.status = 'scheduled';
          p.scheduled_at = scheduledAt;
        }
        successCount++;
      } catch (err) {
        console.error('Error scheduling post ' + p.id, err);
        errorCount++;
      }
    }
  }
  savePosts();
  selectedPosts.clear();
  updateBulkUI();
  render();
  if (errorCount > 0) {
    showToast('Scheduled ' + successCount + ' posts. ' + errorCount + ' failed.', 'warning');
  } else {
    showToast('Scheduled selected posts', 'success');
  }
}
window.bulkSchedule = bulkSchedule;

async function bulkDelete() {
  if (!confirm('Delete ' + selectedPosts.size + ' posts? This cannot be undone.')) return;
  var ids = Array.from(selectedPosts);
  var failedCount = 0;
  for (var i = 0; i < ids.length; i++) {
    try {
      if (window.postsApi) {
        await window.postsApi.remove(ids[i]);
      }
      posts = posts.filter(function (p) { return p.id !== ids[i]; });
    } catch (err) {
      console.error('Failed to delete post ' + ids[i], err);
      failedCount++;
    }
  }
  savePosts();
  selectedPosts.clear();
  updateBulkUI();
  render();
  if (failedCount > 0) {
    showToast('Deleted posts with ' + failedCount + ' errors', 'warning');
  } else {
    showToast('Deleted selected posts', 'success');
  }
}
window.bulkDelete = bulkDelete;

// ---- Ideas View ----
var IDEAS_KEY = 'ap_ideas';

function loadIdeas() {
  try { return JSON.parse(localStorage.getItem(IDEAS_KEY) || '[]'); } catch (e) { return []; }
}

function saveIdeas(ideas) {
  try { localStorage.setItem(IDEAS_KEY, JSON.stringify(ideas)); } catch (e) {}
}

function renderIdeas() {
  var container = $('ideasSection');
  if (!container) return;

  // Handoff check from Trending & Viral board
  if (window.ghTakeContext) {
    var contextText = window.ghTakeContext.text || "";
    var contextAuthor = window.ghTakeContext.author || "";
    var contextSource = window.ghTakeContext.source || "";
    var contextUrl = window.ghTakeContext.url || "";
    var contextCategory = window.ghTakeContext.category || "ai_ml";

    var dbCategory = "ai_ml";
    if (contextCategory === "fintech") {
      dbCategory = "ai_finance";
    } else if (contextCategory === "drones") {
      dbCategory = "industry";
    } else if (contextCategory === "studies") {
      dbCategory = "dev_tools";
    }

    var takeText = "Take on \"" + contextText + "\" by " + contextAuthor + " (" + contextSource + "): [Write your perspective here]";
    
    var currentIdeas = loadIdeas();
    currentIdeas.unshift({
      text: takeText,
      category: dbCategory,
      created_at: new Date().toISOString()
    });
    
    saveIdeas(currentIdeas);
    window.ghTakeContext = null;
    
    if (typeof showToast === 'function') {
      showToast('Draft take added to ideas backlog!', 'success');
    }
  }

  var ideas = loadIdeas();

  var html = '<div class="hub-view" style="max-width:800px;">';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">';
  html += '<h3 style="font-size:18px;font-weight:800;color:#fff;">Ideas Board</h3>';
  html += '<span style="font-size:12px;color:var(--text-muted);">' + ideas.length + ' ideas</span>';
  html += '</div>';

  html += '<div class="ff" style="margin-bottom:20px;">';
  html += '<div style="display:flex;gap:8px;">';
  html += '<input type="text" id="ideaInput" placeholder="Capture an idea, topic, or angle..." style="flex:1;">';
  html += '<select id="ideaCatSelect" style="width:140px;">';
  Object.keys(CATEGORY_LABELS).forEach(function (k) {
    html += '<option value="' + k + '">' + escHtml(CATEGORY_LABELS[k]) + '</option>';
  });
  html += '</select>';
  html += '<button class="btn btn-mint" onclick="addIdea()">Add</button>';
  html += '</div></div>';

  if (!ideas.length) {
    html += '<div class="empty-state"><h3>No ideas yet</h3><p>Type an idea above to start building your content backlog.</p></div>';
  } else {
    ideas.forEach(function (idea, idx) {
      var catLabel = CATEGORY_LABELS[idea.category] || idea.category;
      html += '<div style="display:flex;align-items:center;gap:10px;padding:12px;background:rgba(16,13,34,.5);border:1px solid rgba(255,255,255,.06);border-radius:var(--radius-md);margin-bottom:8px;">';
      html += '<span class="sys-tag tag-' + idea.category + '">' + escHtml(catLabel) + '</span>';
      html += '<span style="flex:1;font-size:13px;color:var(--text-secondary);">' + escHtml(idea.text) + '</span>';
      html += '<span style="font-size:10px;color:var(--text-muted);white-space:nowrap;">' + relativeDate(idea.created_at) + '</span>';
      html += '<button class="btn btn-mint" style="font-size:10px;padding:5px 10px;" onclick="promoteIdea(' + idx + ')">To Post</button>';
      html += '<button class="btn btn-red" style="font-size:10px;padding:5px 10px;" onclick="removeIdea(' + idx + ')">X</button>';
      html += '</div>';
    });
  }

  html += '</div>';
  container.innerHTML = html;
}

function addIdea() {
  var input = $('ideaInput');
  var catSel = $('ideaCatSelect');
  if (!input || !input.value.trim()) return;
  var ideas = loadIdeas();
  ideas.unshift({
    text: input.value.trim(),
    category: catSel ? catSel.value : 'ai_ml',
    created_at: new Date().toISOString()
  });
  saveIdeas(ideas);
  input.value = '';
  renderIdeas();
}
window.addIdea = addIdea;

function promoteIdea(idx) {
  var ideas = loadIdeas();
  if (idx < 0 || idx >= ideas.length) return;
  var idea = ideas[idx];

  var newPost = {
    id: uuid(),
    category: idea.category,
    headline: idea.text.length <= 60 ? idea.text : idea.text.slice(0, 60),
    hlWords: idea.text.split(/\s+/).slice(0, 2),
    caption: 'Drafted from idea: ' + idea.text,
    tags: ['#' + (CATEGORY_LABELS[idea.category] || 'General').replace(/[\s/]+/g, ''), '#AssetPersona'],
    status: 'draft',
    image_url: generateUniqueImage(idea.text, idea.category, user ? user.name : 'AI Assistant'),
    platforms: ['linkedin', 'threads'],
    created_by: user ? user.id : 'assistant',
    created_at: new Date().toISOString(),
    comments: []
  };

  posts.unshift(newPost);
  savePosts();
  ideas.splice(idx, 1);
  saveIdeas(ideas);
  renderIdeas();
  render();
}
window.promoteIdea = promoteIdea;

function removeIdea(idx) {
  var ideas = loadIdeas();
  if (idx < 0 || idx >= ideas.length) return;
  ideas.splice(idx, 1);
  saveIdeas(ideas);
  renderIdeas();
}
window.removeIdea = removeIdea;

// ---- Calendar View ----
function renderCalendarView() {
  var container = $('calendarSection');
  if (!container) return;

  var publishedCount = posts.filter(function (p) { return p.status === 'published'; }).length;
  var scheduledCount = posts.filter(function (p) { return p.scheduled_at && p.status === 'scheduled'; }).length;
  var draftCount = posts.filter(function (p) { return p.status === 'draft'; }).length;

  var summaryHtml = '<div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">';
  summaryHtml += '<div style="padding:10px 16px;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);border-radius:var(--radius-md);min-width:90px;"><div style="font-size:20px;font-weight:800;color:#10B981;">' + publishedCount + '</div><div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;">Published</div></div>';
  summaryHtml += '<div style="padding:10px 16px;background:rgba(0,194,255,.08);border:1px solid rgba(0,194,255,.2);border-radius:var(--radius-md);min-width:90px;"><div style="font-size:20px;font-weight:800;color:#00C2FF;">' + scheduledCount + '</div><div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;">Scheduled</div></div>';
  summaryHtml += '<div style="padding:10px 16px;background:rgba(96,165,250,.08);border:1px solid rgba(96,165,250,.2);border-radius:var(--radius-md);min-width:90px;"><div style="font-size:20px;font-weight:800;color:#60A5FA;">' + draftCount + '</div><div style="font-size:9px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;">Drafts</div></div>';
  summaryHtml += '</div>';

  var calHost = document.createElement('div');
  container.innerHTML = summaryHtml;
  container.appendChild(calHost);

  if (typeof window.renderCalendar === 'function') {
    window.renderCalendar(calHost, posts, function (pid) {
      openDetail(pid);
    });
  }
}

// ---- Pipelines View ----
var PIPELINES = [
  { id: 'gen', name: 'AI Content Generation', desc: 'Generate headlines, captions, and hashtags using LLM models.', status: 'active', trigger: 'Manual / Batch', icon: 'G' },
  { id: 'review', name: 'Content Review Queue', desc: 'Route drafts through approval workflow before publishing.', status: 'active', trigger: 'On post create', icon: 'R' },
  { id: 'schedule', name: 'Scheduled Publishing', desc: 'Auto-publish approved posts at their scheduled time.', status: 'ready', trigger: 'Cron (hourly)', icon: 'S' },
  { id: 'linkedin', name: 'LinkedIn Publisher', desc: 'Push published posts to LinkedIn via API.', status: 'config', trigger: 'On publish', icon: 'L' },
  { id: 'threads', name: 'Threads Publisher', desc: 'Push published posts to Threads via API.', status: 'config', trigger: 'On publish', icon: 'T' },
  { id: 'instagram', name: 'Instagram Publisher', desc: 'Push published posts to Instagram via Graph API.', status: 'config', trigger: 'On publish', icon: 'I' },
  { id: 'analytics', name: 'Engagement Tracker', desc: 'Pull engagement metrics from published posts across platforms.', status: 'planned', trigger: 'Cron (daily)', icon: 'A' },
  { id: 'repurpose', name: 'Content Repurposer', desc: 'Adapt a single post into platform-optimized variants.', status: 'planned', trigger: 'Manual', icon: 'P' }
];

var STATUS_MAP = {
  active:  { label: 'Active',  color: '#10B981' },
  ready:   { label: 'Ready',   color: '#00C2FF' },
  config:  { label: 'Setup',   color: '#FBBF24' },
  planned: { label: 'Planned', color: '#64748B' }
};

function renderPipelines() {
  var container = $('pipelinesSection');
  if (!container) return;

  var html = '<div class="hub-view" style="max-width:900px;">';
  html += '<h3 style="font-size:18px;font-weight:800;color:#fff;margin-bottom:6px;">Content Pipelines</h3>';
  html += '<p style="font-size:12px;color:var(--text-muted);margin-bottom:20px;">Automated workflows powering the content engine. Connect APIs in Settings to activate.</p>';

  var counts = { active: 0, ready: 0, config: 0, planned: 0 };
  PIPELINES.forEach(function (p) { counts[p.status] = (counts[p.status] || 0) + 1; });

  html += '<div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;">';
  Object.keys(STATUS_MAP).forEach(function (k) {
    var s = STATUS_MAP[k];
    html += '<div style="padding:10px 16px;background:rgba(16,13,34,.5);border:1px solid ' + s.color + '33;border-radius:var(--radius-md);min-width:100px;">';
    html += '<div style="font-size:22px;font-weight:800;color:' + s.color + ';">' + (counts[k] || 0) + '</div>';
    html += '<div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;">' + s.label + '</div>';
    html += '</div>';
  });
  html += '</div>';

  PIPELINES.forEach(function (p) {
    var s = STATUS_MAP[p.status] || STATUS_MAP.planned;
    html += '<div style="display:flex;align-items:center;gap:14px;padding:14px;background:rgba(16,13,34,.5);border:1px solid rgba(255,255,255,.06);border-radius:var(--radius-md);margin-bottom:8px;">';
    html += '<div style="width:36px;height:36px;border-radius:var(--radius-sm);background:' + s.color + '15;color:' + s.color + ';display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0;">' + p.icon + '</div>';
    html += '<div style="flex:1;min-width:0;">';
    html += '<div style="font-size:13px;font-weight:600;color:#fff;">' + escHtml(p.name) + '</div>';
    html += '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + escHtml(p.desc) + '</div>';
    html += '</div>';
    html += '<div style="text-align:right;flex-shrink:0;">';
    html += '<span style="font-size:10px;padding:3px 8px;border-radius:20px;background:' + s.color + '18;color:' + s.color + ';font-weight:600;">' + s.label + '</span>';
    html += '<div style="font-size:9px;color:var(--text-muted);margin-top:4px;">' + escHtml(p.trigger) + '</div>';
    html += '</div>';
    html += '</div>';
  });

  html += '</div>';
  container.innerHTML = html;
}

// ---- Batch Generate Panel ----
var SEGMENT_TOPICS = {
  ai_ml: [
    "building agents with Gemini 2.0",
    "fine-tuning LLMs on custom codebases",
    "vector databases and RAG systems",
    "local model deployment with Ollama",
    "AI agent orchestration patterns",
    "evaluation frameworks for LLM apps",
    "multimodal search implementations",
    "inference optimization techniques",
    "prompt engineering in production",
    "context window management"
  ],
  ai_education: [
    "using AI to personalize student learning paths",
    "how LLMs are automating classroom grading",
    "the future of AI-powered university tutors",
    "ethical AI guidelines for secondary schools",
    "adaptive learning algorithms in higher ed",
    "building classroom assistants with Gemini",
    "AI translation tools for multilingual classes",
    "assessing student writing in the age of AI",
    "virtual labs and simulations in science education",
    "training teachers to use generative AI tools"
  ],
  ai_finance: [
    "algorithmic trading strategies with LLMs",
    "AI risk assessment in micro-lending",
    "detecting financial fraud with neural networks",
    "automated wealth management and robo-advisors",
    "how AI is reshaping quantitative analysis",
    "agentic financial planning for small businesses",
    "regulatory compliance (SEC) and AI auditing",
    "real-time market sentiment analysis using LLMs",
    "synthetic data generation for credit scoring",
    "decentralized finance and AI-driven market makers"
  ],
  ai_health: [
    "AI diagnostic support for medical imaging",
    "clinical notes automation for physicians",
    "drug discovery accelerated by deep learning",
    "predictive analytics in patient triage systems",
    "personalized medicine based on genomic AI",
    "LLM reasoning in complex clinical diagnoses",
    "automating prior authorization in healthcare",
    "AI monitoring systems for ICU patients",
    "synthetic clinical data for medical research",
    "wearable health sensors and predictive anomalies"
  ],
  ai_public_health: [
    "epidemiological modeling using neural nets",
    "predicting disease outbreaks from waste water data",
    "optimizing vaccine distribution logistics with AI",
    "analyzing social determinants of health via NLP",
    "urban planning and air quality forecasting",
    "AI tracking of global pathogen mutations",
    "improving rural healthcare access with telemedicine AI",
    "analyzing dietary trends and food security via ML",
    "public health messaging optimization with LLMs",
    "tracking mental health trends from aggregate data"
  ],
  ai_dentistry: [
    "caries detection in dental X-rays using computer vision",
    "AI practice management for dental offices",
    "restorative design automation in CAD/CAM dentistry",
    "predicting periodontal disease progression via ML",
    "3D printing orthodontic models using AI design",
    "natural language patient intake systems for dentistry",
    "AI matching of dental implant compatibility",
    "teledentistry triage powered by image analysis",
    "optimizing appointment schedules in dental groups",
    "predictive maintenance for dental clinical chairs"
  ],
  dev_tools: [
    "automated workflow design with n8n",
    "Supabase migrations and schemas",
    "cursor and editor shortcuts for speed",
    "building custom MCP servers",
    "optimizing build pipelines",
    "debugging memory leaks in production",
    "managing credentials and API keys safely",
    "testing frameworks for agents",
    "version control best practices",
    "Docker setups for local dev"
  ],
  career: [
    "how to land technical consulting clients",
    "from senior engineer to brand builder",
    "releasing open source code to build credibility",
    "negotiating contract rates as a dev",
    "staying relevant as AI changes engineering",
    "balancing product building and consulting",
    "how to build a portfolio that converts",
    "overcoming technical debt in startups",
    "mentoring junior developers effectively",
    "designing your own career roadmap"
  ],
  creative: [
    "3D modeling and rendering in Blender",
    "using GSAP for micro-interactions",
    "creative coding and front-end animations",
    "music production and tech crossover",
    "building interactive canvas games",
    "motion design principles for developers",
    "React Three Fiber implementations",
    "combining AI assets with WebGL",
    "design system tokens and cascading styles",
    "video editing workflows for tech content"
  ],
  industry: [
    "the reality of tech layoffs in 2026",
    "which AI startups are actually shipping",
    "OpenAI vs Google AI developer ecosystems",
    "product management for engineering founders",
    "why open source is winning the model race",
    "how hardware bottlenecks shape AI progress",
    "the state of developer tools funding",
    "what enterprise buyers actually care about",
    "monetizing APIs in the agentic era",
    "tech hubs outside Silicon Valley"
  ],
  culture: [
    "Morehouse and HBCU tech legacy",
    "Chicago tech scene and communities",
    "Black representation in AI and engineering",
    "why Chicago is perfect for builders",
    "navigating tech spaces as a minority",
    "historical tech milestones from Chicago",
    "building community for developers of color",
    "South Side vs Loop tech initiatives",
    "the culture of peer mentoring",
    "legacy and impact beyond the code"
  ],
  threads: [
    "an unpopular opinion about the tech industry",
    "ask the community their go-to dev stack",
    "a hot take that sparks developer debate",
    "what's the most overrated programming language?",
    "a relatable moment from debugging code",
    "a this-or-that question for developers",
    "a bold tech industry prediction for next year",
    "what is a dev tool you cannot live without?",
    "a myth about AI developers that is wrong",
    "a coding habit you had to break"
  ]
};

var CURATED_TOPICS = [
  "how a developer builds their own brand",
  "using AI to draft code vs using AI to ship products",
  "what most people get wrong about prompt engineering",
  "building a consulting business on top of open source",
  "how to survive a winter as a remote builder in Chicago",
  "the legacy of Black engineers in early computing",
  "why taurine and coffee are essential for night coding",
  "budtender style consulting for tech architecture",
  "the transition from engineering manager back to IC",
  "why taurine-style Tavern Pizza is a coding superpower",
  "designing micro-interactions that feel premium",
  "the cost of technical debt in early stage startups"
];

var ghSelectedTopics = []; // [{text, seg, lab}]
var ghActiveCat = 0;
var ghLiveTopics = [];
var GH_TOPIC_CATS = null;
var ghGenCancel = false;

function ghShuffleArr(a) {
  return a.slice().sort(function () { return Math.random() - 0.5; });
}

function ghEscAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function ghEscHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function ghBuildTopicCats() {
  var cats = [];
  
  // 1. RRC
  cats.push({
    label: "RRC",
    seg: "industry",
    src: "RSS & Cannabis Feeds -- MJBizDaily, Leafly, Marijuana Moment, NORML, Ganjapreneur",
    pool: (window.ghFeedSources && window.ghFeedSources.rrc && window.ghFeedSources.rrc.length) ? window.ghFeedSources.rrc.slice() : [
      { title: "MJBizDaily: Cannabis industry legal and economic developments", seg: "industry" },
      { title: "Marijuana Moment: Federal and state legislative updates", seg: "industry" },
      { title: "Ganjapreneur: Cannabis business and entrepreneur insight", seg: "industry" }
    ]
  });

  // 2. Hacker News
  cats.push({
    label: "Hacker News",
    seg: "dev_tools",
    src: "Hacker News RSS -- Developer and tech community trends",
    pool: (window.ghFeedSources && window.ghFeedSources.hacker_news && window.ghFeedSources.hacker_news.length) ? window.ghFeedSources.hacker_news.slice() : [
      { title: "HN: Next-generation distributed systems architecture", seg: "dev_tools" },
      { title: "HN: Open source AI frameworks dominating GitHub trending", seg: "dev_tools" },
      { title: "HN: The evolution of database scaling in 2026", seg: "dev_tools" }
    ]
  });

  // 3. Dev.to
  cats.push({
    label: "Dev.to",
    seg: "dev_tools",
    src: "Dev.to Feed -- Developer tutorials, open source tools, and tips",
    pool: (window.ghFeedSources && window.ghFeedSources.dev_to && window.ghFeedSources.dev_to.length) ? window.ghFeedSources.dev_to.slice() : [
      { title: "Dev.to: Top 10 open-source libraries every developer needs to try", seg: "dev_tools" },
      { title: "Dev.to: Building modular web components with modern CSS", seg: "dev_tools" },
      { title: "Dev.to: Essential guide to API integration retry patterns", seg: "dev_tools" }
    ]
  });

  // 4. TechCrunch
  cats.push({
    label: "TechCrunch",
    seg: "ai_ml",
    src: "TechCrunch AI & Developer -- Tech industry trends, venture capital, and startups",
    pool: (window.ghFeedSources && window.ghFeedSources.techcrunch && window.ghFeedSources.techcrunch.length) ? window.ghFeedSources.techcrunch.slice() : [
      { title: "TechCrunch: The rise of agentic workflow automation in enterprise software", seg: "ai_ml" },
      { title: "TechCrunch: Venture capital funding rounds for open-source AI startups", seg: "dev_tools" },
      { title: "TechCrunch: Developer platforms simplifying cloud deployment pipelines", seg: "dev_tools" }
    ]
  });

  return cats;
}

function ghTopicIsSelected(t) {
  return ghSelectedTopics.some(function (x) { return x.text === t; });
}

function ghCatPoolHTML(cat) {
  return cat.pool.slice(0, 25).map(function (item) {
    var text = typeof item === "string" ? item : item.title;
    var seg = typeof item === "string" ? (cat.seg || "ai_ml") : (item.seg || cat.seg || "ai_ml");
    return '<button type="button" class="topic-tile' + (ghTopicIsSelected(text) ? ' on' : '') + '" data-t="' + ghEscAttr(text) + '" data-seg="' + ghEscAttr(seg) + '" data-lab="' + ghEscAttr(cat.label || "") + '"><span class="tt-txt">' + ghEscHtml(text) + '</span><span class="tt-check"></span></button>';
  }).join("");
}

function ghRenderTopics() {
  var sg = $('suggestedTopics');
  if (!sg) return;
  GH_TOPIC_CATS = ghBuildTopicCats();
  if (ghActiveCat >= GH_TOPIC_CATS.length || ghActiveCat < 0) ghActiveCat = 0;
  var tabs = GH_TOPIC_CATS.map(function (c, ci) {
    return '<button type="button" class="gen-tab' + (ci === ghActiveCat ? ' on' : '') + '" data-ci="' + ci + '">' + ghEscHtml(c.label) + '</button>';
  }).join("");
  var cat = GH_TOPIC_CATS[ghActiveCat] || { label: "", pool: [], seg: "ai_ml" };
  
  var refreshIcon = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>';
  
  sg.innerHTML = '<div class="gen-tabs">' + tabs + '</div>'
    + '<div class="gen-cat-title"><span>' + ghEscHtml(cat.label) + '</span>'
    + '<button type="button" class="topic-refresh" id="ghTopicShuffle" title="Shuffle these">' + refreshIcon + '</button></div>'
    + (cat.src ? '<div class="gen-src">' + ghEscHtml(cat.src) + '</div>' : '')
    + '<div class="topic-tiles" id="ghTopicTiles">' + ghCatPoolHTML(cat) + '</div>';
    
  sg.onclick = function (e) {
    var tab = e.target.closest && e.target.closest(".gen-tab");
    if (tab) {
      ghActiveCat = +tab.getAttribute("data-ci");
      ghRenderTopics();
      return;
    }
    var rf = e.target.closest && e.target.closest(".topic-refresh");
    if (rf) {
      var c = GH_TOPIC_CATS[ghActiveCat];
      if (c) {
        c.pool = ghShuffleArr(c.pool);
        var tl = $('ghTopicTiles');
        if (tl) tl.innerHTML = ghCatPoolHTML(c);
      }
      return;
    }
    var tile = e.target.closest && e.target.closest(".topic-tile");
    if (tile) {
      var t = tile.getAttribute("data-t"), seg = tile.getAttribute("data-seg"), lab = tile.getAttribute("data-lab");
      if (ghTopicIsSelected(t)) {
        ghSelectedTopics = ghSelectedTopics.filter(function (x) { return x.text !== t; });
        tile.classList.remove("on");
      } else {
        ghSelectedTopics.push({ text: t, seg: seg, lab: lab });
        tile.classList.add("on");
      }
      ghUpdateGenCount();
    }
  };
  ghRenderSelTray();
}
window.ghRenderTopics = ghRenderTopics;

function ghGenCount() {
  var ci = $('batchCountInput');
  var n = ci ? parseInt(ci.value, 10) : 0;
  if (isNaN(n) || n < 1) n = 0;
  return n;
}
window.ghGenCount = ghGenCount;

function ghSyncGenButton() {
  var n = ghGenCount();
  var nSel = ghSelectedTopics.length + (($('batchTopic') && $('batchTopic').value.trim()) ? 1 : 0);
  var lbl = $('genCountLabel');
  if (lbl) {
    if (!n) lbl.textContent = "Tap topics, or set a number";
    else if (nSel && n > nSel) lbl.textContent = "Generates " + n + " posts, cycling your " + nSel + " picked topic" + (nSel > 1 ? "s" : "");
    else lbl.textContent = "Generates " + n + " post" + (n > 1 ? "s" : "");
  }
  var btn = $('batchGoBtn');
  if (btn) {
    btn.textContent = n ? ("Generate " + n + " post" + (n > 1 ? "s" : "")) : "Generate";
    btn.disabled = !n;
    btn.style.opacity = n ? "1" : ".5";
  }
  var hiddenCount = $('batchCount');
  if (hiddenCount) hiddenCount.value = n;
}
window.ghSyncGenButton = ghSyncGenButton;

function ghRenderSelTray() {
  var typed = $('batchTopic') ? $('batchTopic').value.trim() : "";
  var total = ghSelectedTopics.length + (typed ? 1 : 0);
  var tray = $('genTray');
  if (tray) {
    if (!total) {
      tray.style.display = "none";
      tray.innerHTML = "";
    tray.style.display = "block";
      var X = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>';
      var items = ghSelectedTopics.map(function (s) {
        var lab = s.lab || s.seg || "";
        return '<span class="sel-item" style="display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:6px; background:rgba(139,92,246,0.12); color:#c084fc; font-size:11px; margin-right:6px; margin-bottom:6px;"><span class="sel-src" style="font-weight:800; opacity:0.6; margin-right:4px;">' + ghEscHtml(lab) + '</span>' + ghEscHtml(s.text) + '<button type="button" class="sel-x" data-t="' + ghEscAttr(s.text) + '" style="background:none; border:none; color:rgba(255,255,255,0.6); cursor:pointer; padding:0; display:inline-flex; margin-left:4px;">' + X + '</button></span>';
      });
      if (typed) items.push('<span class="sel-item" style="display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:6px; background:rgba(139,92,246,0.12); color:#c084fc; font-size:11px; margin-right:6px; margin-bottom:6px;"><span class="sel-src" style="font-weight:800; opacity:0.6; margin-right:4px;">typed</span>' + ghEscHtml(typed) + '<button type="button" class="sel-x" data-typed="1" style="background:none; border:none; color:rgba(255,255,255,0.6); cursor:pointer; padding:0; display:inline-flex; margin-left:4px;">' + X + '</button></span>');
      tray.innerHTML = '<div class="gen-tray-h" style="font-size:10px; font-weight:800; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px;">Picked topics to seed your posts (' + total + ')</div><div class="gen-tray-items" style="display:flex; flex-wrap:wrap;">' + items.join("") + '</div>';
      tray.onclick = function (e) {
        var x = e.target.closest && e.target.closest(".sel-x");
        if (!x) return;
        if (x.getAttribute("data-typed")) {
          if ($('batchTopic')) $('batchTopic').value = "";
        } else {
          var t = x.getAttribute("data-t");
          ghSelectedTopics = ghSelectedTopics.filter(function (z) { return z.text !== t; });
        }
        ghRenderSelTray();
        ghRenderCuratedWorkspace();
        ghUpdateGenCount();
      };
    }
  }
  ghSyncGenButton();
}
window.ghRenderSelTray = ghRenderSelTray;

function ghUpdateGenCount() {
  var typed = $('batchTopic') ? $('batchTopic').value.trim() : "";
  var total = ghSelectedTopics.length + (typed ? 1 : 0);
  var ci = $('batchCountInput');
  if (ci && total) {
    ci.value = total;
    document.querySelectorAll(".count-pick").forEach(function (b) {
      b.classList.toggle("active", parseInt(b.textContent, 10) === total);
    });
  }
  ghRenderSelTray();
}
window.ghUpdateGenCount = ghUpdateGenCount;

function ghSetCount(n, el) {
  var ci = $('batchCountInput');
  if (ci) ci.value = n;
  document.querySelectorAll(".count-pick").forEach(function (b) { b.classList.remove("active"); });
  if (el) el.classList.add("active");
  ghSyncGenButton();
}
window.ghSetCount = ghSetCount;

function ghCountInputChanged() {
  document.querySelectorAll(".count-pick").forEach(function (b) { b.classList.remove("active"); });
  ghSyncGenButton();
}
window.ghCountInputChanged = ghCountInputChanged;

function ghCancelGen() {
  var btn = $('batchGoBtn');
  if (window.ghGenState === "generating") {
    ghGenCancel = true;
    var progressEl = $('batchProgress');
    if (progressEl) {
      var txt = progressEl.querySelector('.batch-progress-text');
      if (txt) txt.textContent = "Stopping after current post...";
    }
  } else {
    closeBatchGen();
  }
}
window.ghCancelGen = ghCancelGen;

var ghGeneratedDrafts = [];
window.ghGenSort = "timeline"; 
window.ghGenState = "select"; 

function ghRenderGeneratorScreen() {
  var panel = $('batchPanel');
  if (!panel) return;
  
  if (window.ghGenState === "select") {
    panel.innerHTML = `
      <div class="batch-inner" style="max-width:1100px; width:95vw; height:85vh; max-height:750px; display:flex; flex-direction:column; box-sizing:border-box; padding:24px;">
        <div class="batch-body" style="padding:0; flex:1; min-height:0; display:flex; flex-direction:column;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <h3 style="font-size:18px; font-weight:800; color:#fff; margin:0;">Generate Content Engine Drafts</h3>
            <button type="button" class="btn btn-sm btn-slate" onclick="closeBatchGen()" style="padding:4px 8px; border-radius:6px; font-size:11px;">Close</button>
          </div>
          <p class="batch-sub" style="margin-bottom:16px;">Select curated topics or fresh news. Customize parameters, review, edit and delete posts before saving.</p>
          
          <div class="gen-modal-split">
            <!-- Left Sidebar Navigation -->
            <div class="gen-modal-sidebar" id="ghGenSidebar"></div>
            
            <!-- Right Workspace -->
            <div class="gen-modal-workspace">
              <!-- Top bar with search and sorting -->
              <div class="gen-sort-bar">
                <div style="flex:1; margin-right:16px;">
                  <input type="text" id="batchTopic" oninput="ghUpdateGenCount()" placeholder="Search topics or enter a custom prompt..." style="width:100%; padding:8px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); background:rgba(10,8,18,0.5); color:#fff; font-size:12.5px; outline:none;">
                </div>
                <div class="gen-sort-options" id="ghGenSortControls" style="display:none;">
                  <span class="gen-sort-label" style="align-self:center; margin-right:6px;">Timeline Sort:</span>
                  <button type="button" class="gen-sort-btn" id="ghSortTimeline" onclick="ghSetGenSort('timeline')">Newest</button>
                  <button type="button" class="gen-sort-btn" id="ghSortViral" onclick="ghSetGenSort('virality')">Most Viral</button>
                </div>
              </div>
              
              <!-- Curated Topics Container -->
              <div class="gen-topics-scroll">
                <div class="gen-topics-list" id="suggestedTopics"></div>
              </div>
              
              <!-- Selection Tray -->
              <div id="genTray" class="gen-tray" style="display:none; margin-bottom:16px; padding:12px; border-radius:8px;"></div>
              
              <!-- Parameters Panel -->
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.05);">
                <div>
                  <label class="gen-sort-label" style="display:block; margin-bottom:6px;">Dimension</label>
                  <select id="batchDimension" style="width:100%; padding:8px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); background:rgba(10,8,18,0.5); color:#fff; font-size:12px; font-weight:700;">
                    <option value="1080x1350" selected>Portrait 4:5 (1080x1350) -- Feed</option>
                    <option value="1080x1080">Square 1:1 (1080x1080) -- Universal</option>
                    <option value="1080x1920">Story/Reel 9:16 (1080x1920) -- Reels</option>
                    <option value="1200x627">Landscape 1.91:1 (1200x627) -- LinkedIn</option>
                    <option value="1440x1920">Threads (1440x1920) -- Threads Optimal</option>
                  </select>
                </div>
                <div>
                  <label class="gen-sort-label" style="display:block; margin-bottom:6px;">Platforms</label>
                  <div id="batchPlatforms" style="display:flex; flex-wrap:wrap; gap:6px; margin-top:4px;">
                    <label style="display:flex; align-items:center; gap:4px; font-size:11px; color:var(--text-secondary); cursor:pointer;"><input type="checkbox" value="linkedin" checked style="accent-color:var(--accent-blue);"> LinkedIn</label>
                    <label style="display:flex; align-items:center; gap:4px; font-size:11px; color:var(--text-secondary); cursor:pointer; margin-left:8px;"><input type="checkbox" value="threads" checked style="accent-color:var(--accent-blue);"> Threads</label>
                    <label style="display:flex; align-items:center; gap:4px; font-size:11px; color:var(--text-secondary); cursor:pointer; margin-left:8px;"><input type="checkbox" value="instagram" style="accent-color:var(--accent-blue);"> Instagram</label>
                    <label style="display:flex; align-items:center; gap:4px; font-size:11px; color:var(--text-secondary); cursor:pointer; margin-left:8px;"><input type="checkbox" value="facebook" style="accent-color:var(--accent-blue);"> Facebook</label>
                  </div>
                </div>
                <div>
                  <label class="gen-sort-label" style="display:block; margin-bottom:6px;">Quantity</label>
                  <div style="display:flex; gap:4px; align-items:center;">
                    <button type="button" class="count-pick btn btn-slate btn-xs" onclick="ghSetCount(1,this)" style="padding:4px 8px; font-size:11px;">1</button>
                    <button type="button" class="count-pick btn btn-slate btn-xs" onclick="ghSetCount(3,this)" style="padding:4px 8px; font-size:11px;">3</button>
                    <button type="button" class="count-pick btn btn-slate btn-xs active" onclick="ghSetCount(5,this)" style="padding:4px 8px; font-size:11px;">5</button>
                    
                    <div class="more-quantity-trigger">
                      <button type="button" class="btn btn-slate btn-xs" style="padding:4px 8px; font-size:11px;">More...</button>
                      <div class="more-quantity-menu">
                        <button type="button" class="count-pick btn btn-slate btn-xs" onclick="ghSetCount(10,this)" style="width:100%; text-align:center;">10</button>
                        <button type="button" class="count-pick btn btn-slate btn-xs" onclick="ghSetCount(20,this)" style="width:100%; text-align:center;">20</button>
                        <button type="button" class="count-pick btn btn-slate btn-xs" onclick="ghSetCount(50,this)" style="width:100%; text-align:center;">50</button>
                      </div>
                    </div>

                    <input type="number" id="batchCountInput" value="5" oninput="ghCountInputChanged()" style="width:40px; padding:3px; font-size:11px; text-align:center; border-radius:4px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.3); color:#fff; margin-left:4px; font-weight:700;">
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Bottom bar -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
            <div id="batchProgress" style="display:none; flex:1; margin-right:16px;"></div>
            <div style="margin-left:auto; display:flex; gap:8px;">
              <button type="button" class="btn btn-slate" onclick="closeBatchGen()">Cancel</button>
              <button type="button" class="btn btn-peach" id="batchGoBtn" onclick="batchGenerate()" style="background:var(--accent-peach); color:#000; font-weight:700; border-color:var(--accent-peach);">Generate Posts</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    ghRenderSidebarCats();
    ghRenderCuratedWorkspace();
    ghUpdateGenCount();
  } else if (window.ghGenState === "generating") {
    panel.innerHTML = `
      <div class="batch-inner" style="max-width:500px; padding:24px; text-align:center;">
        <div class="batch-body" style="padding:0;">
          <h3 style="font-size:18px; font-weight:800; color:#fff; margin-bottom:8px;">Generating Content drafts...</h3>
          <p class="batch-sub" style="margin-bottom:20px;">Orchestrating our AI agent model pipeline...</p>
          <div id="batchProgress" style="display:block; margin:20px 0;"></div>
          <button type="button" class="btn btn-red" onclick="ghCancelGen()">Cancel / Stop</button>
        </div>
      </div>
    `;
  } else if (window.ghGenState === "review") {
    var cards = window.ghGeneratedDrafts.map(function(d, di) {
      var tagsHtml = (d.tags || []).map(function(t){ return `<span class="gen-review-meta-tag">${t}</span>`; }).join("");
      var platformsHtml = (d.platforms || []).map(function(p){ return `<span class="gen-review-meta-tag" style="color:var(--accent-blue);">${p.toUpperCase()}</span>`; }).join("");
      
      return `
        <div class="gen-review-card" data-index="${di}">
          <div class="gen-review-header">
            <span class="gen-review-badge">${CATEGORY_LABELS[d.category] || d.category}</span>
            <button type="button" class="gen-review-delete" onclick="ghDeleteDraft(${di})" title="Discard this draft">✕</button>
          </div>
          <div class="gen-review-field">
            <label>Headline Draft</label>
            <input type="text" class="gen-review-input" value="${ghEscAttr(d.headline)}" oninput="ghUpdateDraftHeadline(${di}, this.value)">
          </div>
          <div class="gen-review-field">
            <label>Caption & Narrative Copy</label>
            <textarea class="gen-review-textarea" oninput="ghUpdateDraftCaption(${di}, this.value)">${ghEscHtml(d.caption)}</textarea>
          </div>
          <div class="gen-review-meta">
            ${platformsHtml}
            <span class="gen-review-meta-tag" style="color:var(--accent-peach);">${d.dimension}</span>
            ${tagsHtml}
          </div>
        </div>
      `;
    }).join("");
    
    panel.innerHTML = `
      <div class="batch-inner" style="max-width:1150px; width:95vw; height:85vh; max-height:750px; display:flex; flex-direction:column; box-sizing:border-box; padding:24px;">
        <div class="batch-body" style="padding:0; flex:1; min-height:0; display:flex; flex-direction:column;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <h3 style="font-size:18px; font-weight:800; color:#fff; margin:0;">Review Generated Drafts</h3>
            <span style="font-size:12px; font-weight:700; color:#c084fc; background:rgba(139,92,246,0.12); padding:4px 10px; border-radius:12px;">${window.ghGeneratedDrafts.length} Drafts Ready</span>
          </div>
          <p class="batch-sub" style="margin-bottom:14px;">Edit the headlines or caption copies directly, and delete any draft you don't want before importing them to the main catalog.</p>
          
          <div class="gen-review-grid">
            ${cards.length ? cards : '<div style="grid-column:1/-1;text-align:center;padding:80px;color:var(--text-muted);">No drafts remaining. Start over to generate more.</div>'}
          </div>
          
          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px; border-top:1px solid rgba(255,255,255,0.05); padding-top:16px;">
            <button type="button" class="btn btn-slate" onclick="ghResetGenerator()">Start Over</button>
            <button type="button" class="btn btn-mint" onclick="ghImportDrafts()" ${!cards.length ? 'disabled' : ''} style="background:var(--accent-mint); color:#000; font-weight:700; border-color:var(--accent-mint);">Confirm &amp; Save Drafts to Agentic Centre</button>
          </div>
        </div>
      </div>
    `;
  }
}
window.ghRenderGeneratorScreen = ghRenderGeneratorScreen;

function ghRenderSidebarCats() {
  var container = $('ghGenSidebar');
  if (!container) return;
  
  var cats = ghBuildTopicCats();
  var html = cats.map(function(c, ci) {
    var active = ci === ghActiveCat;
    return `
      <button type="button" class="gen-sidebar-item ${active ? 'active' : ''}" onclick="ghSelectSidebarCat(${ci})">
        <span style="width:6px; height:6px; border-radius:50%; background:${active ? 'var(--accent-plum)' : 'rgba(255,255,255,0.25)'};"></span>
        ${ghEscHtml(c.label)}
      </button>
    `;
  }).join("");
  container.innerHTML = html;
}
window.ghRenderSidebarCats = ghRenderSidebarCats;

function ghSelectSidebarCat(ci) {
  ghActiveCat = ci;
  var cats = ghBuildTopicCats();
  var cat = cats[ci];
  
  var sortControls = $('ghGenSortControls');
  if (sortControls) {
    var isFeed = ["RRC", "Hacker News", "Dev.to", "TechCrunch"].indexOf(cat.label) >= 0;
    sortControls.style.display = isFeed ? "flex" : "none";
  }
  
  ghRenderSidebarCats();
  ghRenderCuratedWorkspace();
}
window.ghSelectSidebarCat = ghSelectSidebarCat;

function ghSetGenSort(sortType) {
  window.ghGenSort = sortType;
  var tBtn = $('ghSortTimeline');
  var vBtn = $('ghSortViral');
  if (tBtn && vBtn) {
    tBtn.classList.toggle('active', sortType === 'timeline');
    vBtn.classList.toggle('active', sortType === 'virality');
  }
  ghRenderCuratedWorkspace();
}
window.ghSetGenSort = ghSetGenSort;

function ghRenderCuratedWorkspace() {
  var workspace = $('suggestedTopics');
  if (!workspace) return;
  
  GH_TOPIC_CATS = ghBuildTopicCats();
  var cat = GH_TOPIC_CATS[ghActiveCat] || { label: "", pool: [], seg: "ai_ml" };
  
  var pool = cat.pool || [];
  
  if (["RRC", "Hacker News", "Dev.to", "TechCrunch"].indexOf(cat.label) >= 0) {
    pool = pool.slice();
    if (window.ghGenSort === "timeline") {
      pool.sort(function(a, b) { return Date.parse(b.ts || 0) - Date.parse(a.ts || 0); });
    } else {
      pool.sort(function(a, b) { return (b.score || 0) - (a.score || 0); });
    }
  } else {
    pool = pool.slice();
  }
  
  if (!pool.length) {
    workspace.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);font-size:12px;">Pulling fresh topics from feed...</div>';
    return;
  }
  
  var html = pool.map(function(tObj) {
    var text = typeof tObj === "string" ? tObj : tObj.title;
    var seg = typeof tObj === "string" ? (cat.seg || "ai_ml") : tObj.seg;
    var label = typeof tObj === "string" ? cat.label : tObj.label;
    
    var isSel = ghTopicIsSelected(text);
    var cardClass = "gen-topic-card" + (isSel ? " on" : "");
    
    var metaHtml = "";
    if (typeof tObj !== "string" && tObj.ts) {
      var dateStr = relativeDate(tObj.ts);
      metaHtml = `
        <div class="gen-topic-meta">
          <span class="gen-topic-outlet">${ghEscHtml(tObj.source || 'News')}</span>
          <span>${ghEscHtml(dateStr)}</span>
        </div>
      `;
    } else {
      metaHtml = `
        <div class="gen-topic-meta">
          <span class="gen-topic-outlet" style="background:rgba(139,92,246,0.1); color:#c084fc;">Curated</span>
        </div>
      `;
    }
    
    return `
      <div class="${cardClass}" onclick="ghToggleTopicCard('${ghEscAttr(text)}', '${ghEscAttr(seg)}', '${ghEscAttr(label)}')" style="cursor:pointer;">
        <div class="gen-topic-headline">${ghEscHtml(text)}</div>
        ${metaHtml}
      </div>
    `;
  }).join("");
  
  workspace.innerHTML = html;
}
window.ghRenderCuratedWorkspace = ghRenderCuratedWorkspace;

function ghToggleTopicCard(text, seg, label) {
  var idx = ghSelectedTopics.findIndex(function (x) { return x.text === text; });
  if (idx >= 0) {
    ghSelectedTopics.splice(idx, 1);
  } else {
    ghSelectedTopics.push({ text: text, seg: seg, lab: label });
  }
  ghRenderCuratedWorkspace();
  ghUpdateGenCount();
}
window.ghToggleTopicCard = ghToggleTopicCard;

function ghDeleteDraft(di) {
  window.ghGeneratedDrafts.splice(di, 1);
  ghRenderGeneratorScreen();
}
window.ghDeleteDraft = ghDeleteDraft;

function ghUpdateDraftHeadline(di, val) {
  if (window.ghGeneratedDrafts[di]) {
    window.ghGeneratedDrafts[di].headline = val;
  }
}
window.ghUpdateDraftHeadline = ghUpdateDraftHeadline;

function ghUpdateDraftCaption(di, val) {
  if (window.ghGeneratedDrafts[di]) {
    window.ghGeneratedDrafts[di].caption = val;
  }
}
window.ghUpdateDraftCaption = ghUpdateDraftCaption;

async function ghImportDrafts() {
  var successCount = 0;
  var importedList = [];
  for (var i = 0; i < window.ghGeneratedDrafts.length; i++) {
    var d = window.ghGeneratedDrafts[i];
    var words = d.headline.split(/\s+/);
    var postItem = {
      category: d.category,
      headline: d.headline.toUpperCase().slice(0, 60),
      hl_words: words.slice(0, 2),
      caption: d.caption,
      tags: d.tags,
      status: 'draft',
      platforms: d.platforms,
      dimension: d.dimension,
      created_by: user ? user.id : 'assistant',
      created_by_name: user ? user.name : 'AI Assistant',
      created_at: new Date().toISOString()
    };
    
    try {
      if (window.postsApi) {
        var saved = await window.postsApi.create(postItem);
        posts.unshift(saved);
        importedList.push(saved);
      } else {
        var postsArr = [];
        try { postsArr = JSON.parse(localStorage.getItem('ap_posts') || '[]'); } catch (e) {}
        postItem.id = "gen" + Date.now() + Math.random().toString(36).slice(2, 5);
        postsArr.unshift(postItem);
        localStorage.setItem('ap_posts', JSON.stringify(postsArr));
        importedList.push(postItem);
      }
      successCount++;
    } catch (err) {
      console.error("Failed to save draft:", err);
      postItem.id = "gen" + Date.now() + Math.random().toString(36).slice(2, 5);
      var postsArr = [];
      try { postsArr = JSON.parse(localStorage.getItem('ap_posts') || '[]'); } catch (e) {}
      postsArr.unshift(postItem);
      localStorage.setItem('ap_posts', JSON.stringify(postsArr));
      importedList.push(postItem);
      successCount++;
    }
  }
  
  closeBatchGen();
  loadPosts();
  render();
  if (successCount > 0) {
    showToast("Successfully imported " + successCount + " posts as drafts!", "success");
    
    // N8N webhook trigger (Chat/Notify)
    var url = localStorage.getItem('ap_n8n_chat_webhook');
    if (url) {
      triggerN8NWebhook(url, {
        event: 'posts_imported',
        count: successCount,
        posts: importedList
      });
    }
  }
}
window.ghImportDrafts = ghImportDrafts;

function ghResetGenerator() {
  window.ghGenState = "select";
  ghSelectedTopics = [];
  ghGeneratedDrafts = [];
  ghRenderGeneratorScreen();
}
window.ghResetGenerator = ghResetGenerator;

function openBatchGen() {
  var panel = $('batchPanel');
  if (panel) panel.classList.add('open');
  document.body.classList.add('batch-open');
  
  ghSelectedTopics = [];
  ghActiveCat = 0;
  ghGenCancel = false;
  ghGeneratedDrafts = [];
  window.ghGenSort = "timeline"; 
  window.ghGenState = "select"; 
  
  ghRenderGeneratorScreen();
  
  var sg = $('suggestedTopics');
  if (sg) {
    sg.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);font-size:12px;">Pulling fresh topics from feed...</div>';
    fetchTrendingTopics().then(function () {
      ghRenderSidebarCats();
      ghRenderCuratedWorkspace();
    }).catch(function () {
      ghRenderSidebarCats();
      ghRenderCuratedWorkspace();
    });
  }
}
window.openBatchGen = openBatchGen;

function fetchTrendingTopics() {
  var RSS2JSON = "https://api.rss2json.com/v1/api.json?rss_url=";
  var feeds = [
    // RRC
    { name: "MJBizDaily", url: "https://mjbizdaily.com/feed/", group: "rrc", seg: "industry" },
    { name: "Leafly", url: "https://www.leafly.com/news/feed", group: "rrc", seg: "industry" },
    { name: "Marijuana Moment", url: "https://www.marijuanamoment.net/feed/", group: "rrc", seg: "industry" },
    { name: "Ganjapreneur", url: "https://www.ganjapreneur.com/feed/", group: "rrc", seg: "industry" },
    { name: "NORML", url: "https://norml.org/feed/", group: "rrc", seg: "industry" },
    
    // Hacker News
    { name: "Hacker News", url: "https://news.ycombinator.com/rss", group: "hacker_news", seg: "dev_tools" },
    
    // Dev.to
    { name: "Dev.to", url: "https://dev.to/feed", group: "dev_to", seg: "dev_tools" },
    
    // TechCrunch (AI & Developer)
    { name: "TechCrunch Developer", url: "https://techcrunch.com/category/developer/feed/", group: "techcrunch", seg: "dev_tools" },
    { name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/", group: "techcrunch", seg: "ai_ml" }
  ];
  
  window.ghFeedSources = { rrc: [], hacker_news: [], dev_to: [], techcrunch: [] };
  var allItems = [];
  
  var fetches = feeds.map(function(f){
    return fetch(RSS2JSON + encodeURIComponent(f.url))
      .then(function(r){ return r.json(); })
      .then(function(data){
        if (data.items && data.items.length) {
          data.items.slice(0, 15).forEach(function(item){
            var title = item.title || "";
            var sourceName = f.name;
            var dashIdx = title.lastIndexOf(" - ");
            if (dashIdx > 15) {
              sourceName = title.substring(dashIdx + 3).trim();
              title = title.substring(0, dashIdx).trim();
            }
            title = title.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
            
            var score = 100;
            if (title) {
              var hash = 0;
              for (var i = 0; i < title.length; i++) {
                hash = title.charCodeAt(i) + ((hash << 5) - hash);
              }
              score = Math.abs(hash % 300) + 200;
            }

            if (title.length > 10 && title.length < 120) {
              window.ghFeedSources[f.group].push({
                title: title,
                ts: item.pubDate || new Date().toISOString(),
                source: sourceName,
                score: score,
                seg: f.seg
              });
            }
          });
        }
      })
      .catch(function(){});
  });
  
  return Promise.all(fetches).then(function(){
    // Deduplicate each group
    Object.keys(window.ghFeedSources).forEach(function(group){
      var seen = new Set();
      var unique = [];
      window.ghFeedSources[group].forEach(function(item){
        var key = item.title.toLowerCase().slice(0, 30);
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(item);
        }
      });
      window.ghFeedSources[group] = unique;
    });
    return window.ghFeedSources;
  });
}

function closeBatchGen() {
  var panel = $('batchPanel');
  if (panel) panel.classList.remove('open');
  document.body.classList.remove('batch-open');
}
window.closeBatchGen = closeBatchGen;

function batchGenerate() {
  var batchCount = ghGenCount();
  if (!batchCount) {
    alert("Set how many posts to make, or tap some topics.");
    return;
  }
  
  var seeds = ghSelectedTopics.slice();
  var typed = $('batchTopic') ? $('batchTopic').value.trim() : "";
  
  var aCat = (GH_TOPIC_CATS && GH_TOPIC_CATS[ghActiveCat]) || { seg: "ai_ml", pool: SEGMENT_TOPICS.ai_ml };
  var aSeg = aCat.seg || "ai_ml";
  if (typed) {
    seeds.push({ text: typed, seg: aSeg });
  }
  
  var queue = [];
  if (seeds.length) {
    for (var qi = 0; qi < batchCount; qi++) {
      var sd = seeds[qi % seeds.length];
      queue.push({ segment: sd.seg || "ai_ml", subTopic: sd.text });
    }
  } else {
    var pool = ghShuffleArr((aCat.pool || SEGMENT_TOPICS.ai_ml).slice());
    for (var qj = 0; qj < batchCount; qj++) {
      var itemText = typeof pool[qj % pool.length] === "string" ? pool[qj % pool.length] : pool[qj % pool.length].title;
      queue.push({ segment: aSeg, subTopic: itemText });
    }
  }

  var dimensionSelect = $('batchDimension');
  var dimension = dimensionSelect ? dimensionSelect.value : '1080x1350';
  var platformInputs = document.querySelectorAll('#batchPlatforms input[type="checkbox"]:checked');
  var platforms = Array.from(platformInputs).map(function (input) { return input.value; });
  if (platforms.length === 0) {
    platforms = ['linkedin', 'threads'];
  }

  window.ghGenState = "generating";
  ghRenderGeneratorScreen();

  var progressEl = $('batchProgress');
  if (progressEl) {
    progressEl.innerHTML = '<div class="batch-progress-bar"><div class="batch-progress-fill" style="width:0%"></div></div><div class="batch-progress-text">Generating 0 of ' + batchCount + '...</div>';
  }

  var supaUrl = '';
  var supaKey = '';
  try {
    supaUrl = localStorage.getItem('ap_supabase_url') || '';
    supaKey = localStorage.getItem('ap_supabase_key') || '';
  } catch (e) {}

  var completed = 0;
  ghGenCancel = false;
  window.ghGeneratedDrafts = [];

  async function processNext() {
    if (ghGenCancel) {
      window.ghGenState = "review";
      ghRenderGeneratorScreen();
      return;
    }

    if (completed >= batchCount) {
      window.ghGenState = "review";
      ghRenderGeneratorScreen();
      
      var url = localStorage.getItem('ap_n8n_chat_webhook');
      if (url) {
        triggerN8NWebhook(url, {
          event: 'batch_generation_complete',
          count: batchCount,
          category: aSeg,
          drafts: window.ghGeneratedDrafts
        });
      }
      return;
    }

    var item = queue[completed];
    var prefixes = [
      '', 'Hot take: ', 'Deep dive: ', 'Breakdown: ', 'Analysis: ',
      'Why it matters: ', 'The real story behind ', 'What nobody says about ',
      'Unpopular opinion: ', 'Thread-worthy: '
    ];
    var prefix = prefixes[completed % prefixes.length];
    var angle = prefix ? prefix + item.subTopic : item.subTopic;
    
    var updateProgress = function (parsedPost) {
      window.ghGeneratedDrafts.push(parsedPost);
      completed++;
      var pct = Math.round((completed / batchCount) * 100);
      if (progressEl) {
        progressEl.innerHTML = '<div class="batch-progress-bar"><div class="batch-progress-fill" style="width:' + pct + '%"></div></div><div class="batch-progress-text">Generated ' + completed + ' of ' + batchCount + '</div>';
      }
      setTimeout(processNext, 200);
    };

    if (supaUrl && supaKey) {
      var proxyUrl = supaUrl.replace(/\/$/, '') + '/functions/v1/glm-proxy';
      var prompt = buildGenerationPrompt(angle, item.segment);
      try {
        var res = await fetch(proxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + supaKey },
          body: JSON.stringify({ model: 'glm-5.1', prompt: prompt })
        });
        var data = await res.json();
        var parsed = parseAIResponse(data, angle, item.segment);
        updateProgress({
          category: item.segment,
          headline: parsed.headline,
          caption: parsed.caption,
          tags: parsed.tags,
          platforms: platforms,
          dimension: dimension
        });
      } catch (err) {
        var localParsed = buildLocalPost(angle, item.segment);
        updateProgress({
          category: item.segment,
          headline: localParsed.headline,
          caption: localParsed.caption,
          tags: localParsed.tags,
          platforms: platforms,
          dimension: dimension
        });
      }
    } else {
      var localParsed = buildLocalPost(angle, item.segment);
      updateProgress({
        category: item.segment,
        headline: localParsed.headline,
        caption: localParsed.caption,
        tags: localParsed.tags,
        platforms: platforms,
        dimension: dimension
      });
    }
  }

  processNext();
}
window.batchGenerate = batchGenerate;

function generateAngles(topic, count) {
  if (count <= 1) return [topic];
  var prefixes = [
    '', 'Hot take: ', 'Deep dive: ', 'Breakdown: ', 'Analysis: ',
    'Why it matters: ', 'The real story behind ', 'What nobody says about ',
    'Unpopular opinion: ', 'Thread-worthy: '
  ];
  var angles = [];
  for (var i = 0; i < count; i++) {
    angles.push(i === 0 ? topic : prefixes[i % prefixes.length] + topic);
  }
  return angles;
}

async function insertGeneratedPostSilent(parsed, cat, platforms, dimension) {
  var newPost = {
    category: cat,
    headline: parsed.headline,
    hl_words: parsed.hlWords, // map hlWords correctly to schema's hl_words array
    caption: parsed.caption,
    tags: parsed.tags,
    status: 'draft',
    platforms: platforms || ['linkedin', 'threads'],
    dimension: dimension || '1080x1350',
    image_url: generateUniqueImage(parsed.headline, cat, user ? user.name : 'AI Assistant'),
    created_by: user ? user.id : 'assistant',
    created_by_name: user ? user.name : 'AI Assistant',
    created_at: new Date().toISOString()
  };

  try {
    if (window.postsApi) {
      var saved = await window.postsApi.create(newPost);
      posts.unshift(saved);
    } else {
      newPost.id = uuid();
      posts.unshift(newPost);
      savePosts();
    }
  } catch (err) {
    console.error('Failed to save to Supabase:', err);
    newPost.id = uuid();
    posts.unshift(newPost);
    savePosts();
  }
}

function buildGenerationPrompt(topic, cat) {
  var catLabel = CATEGORY_LABELS[cat] || cat;
  return 'You are a content strategist for Asset Persona (@assetpersona), a tech brand focused on AI, developer tools, and industry trends.\n\n' +
    'Generate a social media post about: ' + topic + '\n' +
    'Category: ' + catLabel + '\n\n' +
    'Return valid JSON with these fields:\n' +
    '- headline: bold, all-caps-friendly headline (8-12 words max)\n' +
    '- hlWords: array of 2-3 key words to highlight\n' +
    '- caption: engaging caption (2-4 sentences, direct, no fluff)\n' +
    '- tags: array of 4-6 hashtags relevant to the topic\n\n' +
    'Write in a direct, authoritative voice. No filler phrases.';
}

function parseAIResponse(data, topic, cat) {
  try {
    var text = data.text || data.content || data.response || '';
    var jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      var parsed = JSON.parse(jsonMatch[0]);
      return {
        headline: parsed.headline || topic,
        hlWords: parsed.hlWords || topic.split(/\s+/).slice(0, 2),
        caption: parsed.caption || '',
        tags: parsed.tags || []
      };
    }
  } catch (e) {}
  return buildLocalPost(topic, cat);
}

function buildLocalPost(topic, cat) {
  var words = topic.split(/\s+/);
  var headline = words.length <= 8 ? topic : words.slice(0, 8).join(' ');
  return {
    headline: headline.charAt(0).toUpperCase() + headline.slice(1),
    hlWords: words.slice(0, 2),
    caption: 'Draft post on: ' + topic + '. Refine this caption with your perspective and specific details before publishing.',
    tags: ['#' + CATEGORY_LABELS[cat].replace(/[\s/]+/g, ''), '#AssetPersona', '#Content']
  };
}


// ---- Hamburger ----
function toggleNav() {
  document.body.classList.toggle('nav-open');
}
window.toggleNav = toggleNav;

// ---- Realtime Sync ----
function initRealtime() {
  if (typeof window.subscribeToPostChanges !== 'function') return;
  window.subscribeToPostChanges(function (eventType, payload) {
    if (eventType === 'INSERT' && payload.new) {
      var exists = posts.some(function (p) { return p.id === payload.new.id; });
      if (!exists) {
        posts.unshift(payload.new);
        savePosts();
      }
    } else if (eventType === 'UPDATE' && payload.new) {
      for (var i = 0; i < posts.length; i++) {
        if (posts[i].id === payload.new.id) {
          posts[i] = payload.new;
          break;
        }
      }
      savePosts();
    } else if (eventType === 'DELETE' && payload.old) {
      posts = posts.filter(function (p) { return p.id !== payload.old.id; });
      savePosts();
    }
    render();
    updateCounts();
  });
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', function () {
  initTheme();
  loadPosts();
  renderSidebarCategories();
  populateCatDropdown();
  syncAgentSelects();
  syncOutputFolderSelects();
  paintToday();
  setInterval(paintToday, 60000);
  initLogin();
  initRealtime();

  // Search input
  var searchEl = $('searchInput');
  if (searchEl) {
    searchEl.addEventListener('input', function () {
      setSearch(this.value);
    });
  }

  // Sort select
  var sortEl = $('sortSelect');
  if (sortEl) {
    sortEl.addEventListener('change', function () {
      setSort(this.value);
    });
  }

  // Close detail on overlay click
  var detailOverlay = $('detailOverlay');
  if (detailOverlay) {
    detailOverlay.addEventListener('click', function (e) {
      if (e.target === detailOverlay) closeDetail();
    });
  }

  // Nav scrim close
  var scrim = document.querySelector('.nav-scrim');
  if (scrim) {
    scrim.addEventListener('click', function () {
      document.body.classList.remove('nav-open');
    });
  }
});

// =============================================================================
// =============================================================================
// ---- Agentic Centre & Gallery Implementation ----
// =============================================================================

var GALLERY_FOLDERS = {
  tech: { label: 'Tech & AI Systems', color: '#818CF8' },
  study_hall: { label: 'Study Hall Guides', color: '#FB923C' },
  trading: { label: 'Trading Widgets', color: '#F472B6' }
};

var defaultGallery = [
  {
    id: "concept-1",
    title: "Option 1: AI Command Dashboard UI",
    description: "Clean dark mode dashboard with compartmentalized widgets representing agent stream, prompt execution, and file storage sections.",
    image_url: "assets/rolling_tray_ui_1.png",
    prompt: "A detailed dark mode user interface dashboard design for an AI orchestration control room, showing active agent states, live terminal logs, and system metrics. Neon green accents, high-end tech aesthetic.",
    status: "Generated",
    assigned_agent: "Lil Neutron",
    category: "tech",
    scheduled_at: "2026-06-03T10:00:00.000Z",
    created_at: "2026-06-01T23:31:00.000Z"
  },
  {
    id: "concept-2",
    title: "Option 2: Translucent Agent Network Graphs",
    description: "Futuristic floating UI panels with translucent glass effect showing active agent connections and data pipelines.",
    image_url: "assets/rolling_tray_ui_2.png",
    prompt: "Futuristic floating user interface panels with translucent glassmorphism effects, arranged in a clean layout showing agent conversation chains, decision nodes, and memory blocks. Glowing neon cyan and purple accents.",
    status: "Generated",
    assigned_agent: "Lil Neutron",
    category: "tech",
    scheduled_at: "2026-06-03T14:30:00.000Z",
    created_at: "2026-06-01T23:17:00.000Z"
  },
  {
    id: "concept-3",
    title: "Option 3: Mobile Learning App Mockup",
    description: "Sleek mobile-first design with learning compartment cards and step-by-step interactive guides.",
    image_url: "assets/rolling_tray_ui_3.png",
    prompt: "A mobile application interface shown inside a mock premium smartphone screen. The app screen displays a beautiful clean dark green system instructions guide for prompt engineering, module cards, and progress tracker.",
    status: "Generated",
    assigned_agent: "TwoFace",
    category: "study_hall",
    scheduled_at: "2026-06-04T09:00:00.000Z",
    created_at: "2026-06-01T23:19:00.000Z"
  },
  {
    id: "concept-4",
    title: "Option 4: Circular Trading Analytics Widget",
    description: "Dark interface with central market surface area surrounded by ring-shaped widget modules with neon green accents.",
    image_url: "assets/rolling_tray_ui_4.png",
    prompt: "A high-tech circular dashboard layout for a trading terminal UI. A central circle shows live ticker analysis surrounded by concentric ring widgets showing target positions, movers, settings, and news alerts.",
    status: "Generated",
    assigned_agent: "Lil Neutron",
    category: "trading",
    scheduled_at: "2026-06-04T16:00:00.000Z",
    created_at: "2026-06-01T23:20:00.000Z"
  },
  {
    id: "concept-5",
    title: "Option 5: Split Screen System Architecture",
    description: "Side-by-side comparison of local CLI process containers and their digital dashboard representation.",
    image_url: "",
    prompt: "A split-screen visual comparison. The left side shows a premium terminal workspace showing active CLI processes. The right side shows a matching digital user interface dashboard tracking the processes in real-time.",
    status: "Pending Generation",
    assigned_agent: "TwoFace",
    category: "tech",
    scheduled_at: "2026-06-05T11:00:00.000Z",
    created_at: "2026-06-02T04:30:00.000Z"
  },
  {
    id: "concept-6",
    title: "HecThor: Router Dashboard Mockup",
    description: "Design concept for the local router dashboard.",
    image_url: "assets/rolling_tray_ui_1.png",
    prompt: "A minimalist dashboard concept with purple glowing nodes showing real-time network traffic paths.",
    status: "Generated",
    assigned_agent: "HecThor",
    category: "tech",
    scheduled_at: "2026-06-02T10:00:00.000Z",
    created_at: "2026-05-30T10:00:00.000Z"
  },
  {
    id: "concept-7",
    title: "Mr. Thinker: LLM Prompting Flowchart",
    description: "Visual guide showing system instruction structures.",
    image_url: "",
    prompt: "A structured infographic explaining few-shot prompts and meta-instructions for system configurations.",
    status: "Pending Generation",
    assigned_agent: "Mr. Thinker",
    category: "study_hall",
    scheduled_at: "2026-06-06T01:00:00.000Z",
    created_at: "2026-06-02T01:00:00.000Z"
  },
  {
    id: "concept-8",
    title: "Paper Agent: Stock Movers UI Module",
    description: "Circular widget module displaying top gainers and losers.",
    image_url: "",
    prompt: "Circular ring widget tracking market movers with green and red percentage highlights.",
    status: "Pending Generation",
    assigned_agent: "Paper Agent",
    category: "trading",
    scheduled_at: "2026-06-07T02:00:00.000Z",
    created_at: "2026-06-02T02:00:00.000Z"
  }
];

var AGENTS = [
  { id: 'agent-gem', name: 'Agent Gem', model: 'MiniMax M3', role: 'Lead Orchestrator', desc: 'Frank\'s primary dispatcher and lead coordinator. Manages task delegation and reports progress.', path: '~/.hermes/profiles/agent-gem', status: 'Active' },
  { id: 'hecthor', name: 'HecThor', model: 'MiniMax M3', role: 'Coding & Scaffolding', desc: 'Builds applications, components, and templates. Spawns Antigravity CLI sub-agents.', path: '~/.hermes/profiles/hecthor', status: 'Idle' },
  { id: 'big-venture', name: 'Big Venture', model: 'MiniMax M3', role: 'Research & Writing', desc: 'Gathers intelligence, handles SEO, drafts blogs, and writes detailed briefing guides.', path: '~/.hermes/profiles/big-venture', status: 'Idle' },
  { id: 'lil-neutron', name: 'Lil Neutron', model: 'MiniMax M3', role: 'FFC Content Engine', desc: 'Crafts authentic, plain-language social posts for LinkedIn, Threads, and Instagram.', path: '~/.hermes/profiles/lil-neutron', status: 'Active' },
  { id: 'mr-thinker', name: 'Mr. Thinker', model: 'MiniMax M3', role: 'AI Study Hall', desc: 'Formats learning guides and technical breakdowns for the Asset Persona educational hub.', path: '~/.hermes/profiles/mr-thinker', status: 'Idle' },
  { id: 'twoface', name: 'TwoFace', model: 'MiniMax M3', role: 'Cloning & Capture', desc: 'Runs Playwright sessions on Dribbble/Mobbin to clone designs and mirror assets.', path: '~/.hermes/profiles/twoface', status: 'Idle' },
  { id: 'paper-agent', name: 'Paper Agent', model: 'MiniMax M3', role: 'Trading Intel', desc: 'Pulls watchlist data, analyzes financial news sentiment, and schedules brief reports.', path: '~/.hermes/profiles/paper-agent', status: 'Active' },
  { id: 'thoughts-of-gclaw', name: 'Thoughts of G-Claw', model: 'GLM 5.1', role: 'Adversarial Security', desc: 'Runs offensive hacker scans, searches for secrets, and audits HecThor\'s code.', path: '~/.hermes/profiles/thoughts-of-gclaw', status: 'Active' }
];

var defaultScraperTrends = [
  {
    id: 'trend-1',
    timestamp: '2026-06-01T22:30:00.000Z',
    source: 'grazzhopper',
    summary: 'Audience showing high interest in modular dashboard widgets. Key feedback points to design customizable card layouts and drag-and-drop workflow interfaces.',
    links: 'https://threads.net/@grazzhopper/post/C7xYp1uS921, https://threads.net/search?q=modular+dashboard+design'
  },
  {
    id: 'trend-2',
    timestamp: '2026-06-01T18:45:00.000Z',
    source: 'frvnkfrmchicago (Ref)',
    summary: 'Discussion on the deprecation of legacy image models and the transition to native browser-based API generation. High emphasis on Playwright sessions for cookie management.',
    links: 'https://threads.net/@frvnkfrmchicago/post/C7xAp2vX110, https://openai.com/blog/images-2-0-updates'
  },
  {
    id: 'trend-3',
    timestamp: '2026-05-31T14:15:00.000Z',
    source: 'frvnkfrmchicago (Ref)',
    summary: 'Trending developer culture: building in public. Discussing how small engineering teams expose internal tools via customized CLI dashboards and lightweight static interfaces.',
    links: 'https://threads.net/@frvnkfrmchicago/post/C7wQp9aM827'
  }
];


function getGallery() {
  var cached = [];
  try {
    cached = JSON.parse(localStorage.getItem('ap_gallery') || '[]');
  } catch (e) {}

  var hasCannabis = false;
  if (cached && cached.length > 0) {
    for (var i = 0; i < cached.length; i++) {
      var category = cached[i].category || '';
      var title = (cached[i].title || '').toLowerCase();
      var description = (cached[i].description || '').toLowerCase();
      var prompt = (cached[i].prompt || '').toLowerCase();
      if (category === 'cannabis' || title.indexOf('weed') >= 0 || title.indexOf('rolling tray') >= 0 || description.indexOf('weed') >= 0 || prompt.indexOf('rolling tray') >= 0) {
        hasCannabis = true;
        break;
      }
    }
  }

  if (!cached || cached.length === 0 || hasCannabis) {
    cached = defaultGallery;
    saveGallery(cached);
  }
  return cached;
}


function saveGallery(items) {
  try {
    localStorage.setItem('ap_gallery', JSON.stringify(items));
  } catch (e) {}
}

function getScraperTrends() {
  var cached = [];
  try {
    cached = JSON.parse(localStorage.getItem('ap_scraper_trends') || '[]');
  } catch (e) {}
  
  var hasCannabis = false;
  if (cached && cached.length > 0) {
    for (var i = 0; i < cached.length; i++) {
      var summary = (cached[i].summary || '').toLowerCase();
      if (summary.indexOf('rolling tray') >= 0 || summary.indexOf('weed') >= 0 || summary.indexOf('concentrates') >= 0) {
        hasCannabis = true;
        break;
      }
    }
  }

  if (!cached || cached.length === 0 || hasCannabis) {
    cached = defaultScraperTrends;
    saveScraperTrends(cached);
  }
  return cached;
}


function saveScraperTrends(trends) {
  try {
    localStorage.setItem('ap_scraper_trends', JSON.stringify(trends));
  } catch (e) {}
}

var currentAgenticSubTab = 'concepts';

function setAgenticSubTab(tab, el) {
  currentAgenticSubTab = tab;
  var conceptsView = $('agenticConceptsView');
  var promptsView = $('agenticPromptsView');
  var agentsView = $('agenticAgentsView');
  var scraperView = $('agenticScraperView');
  
  [conceptsView, promptsView, agentsView, scraperView].forEach(function (v) {
    if (v) v.classList.add('hidden');
  });

  document.querySelectorAll('.agentic-subtab').forEach(function (btn) {
    btn.classList.remove('active');
  });

  if (el) {
    el.classList.add('active');
  }

  if (tab === 'concepts' && conceptsView) {
    conceptsView.classList.remove('hidden');
    renderGallery();
  } else if (tab === 'prompts' && promptsView) {
    promptsView.classList.remove('hidden');
    renderPromptsView();
  } else if (tab === 'agents' && agentsView) {
    agentsView.classList.remove('hidden');
    renderAgentDirectory();
  } else if (tab === 'scraper' && scraperView) {
    scraperView.classList.remove('hidden');
    renderScraperFeed();
  }
}
window.setAgenticSubTab = setAgenticSubTab;

var collapsedFolders = {};

function toggleFolderCollapse(folderId) {
  collapsedFolders[folderId] = !collapsedFolders[folderId];
  var el = $(folderId);
  var arrow = $('arrow-' + folderId);
  if (!el) return;
  if (collapsedFolders[folderId]) {
    el.style.display = 'none';
    if (arrow) arrow.style.transform = 'rotate(-90deg)';
  } else {
    el.style.display = 'grid';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
  }
}
window.toggleFolderCollapse = toggleFolderCollapse;

function renderGallery() {
  var container = $('galleryFoldersContainer');
  if (!container) return;

  var items = getGallery();
  var catFilter = $('galleryCatFilter') ? $('galleryCatFilter').value : 'all';
  var sortFilter = $('gallerySortFilter') ? $('gallerySortFilter').value : 'date_desc';

  // Filter items
  var filtered = items.filter(function (c) {
    if (catFilter !== 'all' && c.category !== catFilter) return false;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">No concepts found in this folder.</div>';
    return;
  }

  // Group by Category first
  var categoryGroups = {};
  Object.keys(GALLERY_FOLDERS).forEach(function (catKey) {
    categoryGroups[catKey] = [];
  });

  filtered.forEach(function (item) {
    var catKey = item.category || 'tech';
    if (!categoryGroups[catKey]) categoryGroups[catKey] = [];
    categoryGroups[catKey].push(item);
  });

  var html = '';

  // Render each category folder
  Object.keys(categoryGroups).forEach(function (catKey) {
    if (catFilter !== 'all' && catKey !== catFilter) return;

    var catItems = categoryGroups[catKey];
    if (catItems.length === 0) return; // Skip empty folders unless active filter is on it

    var folderInfo = GALLERY_FOLDERS[catKey] || { label: 'General', color: '#94A3B8' };
    var folderId = 'folder-' + catKey;
    var isCollapsed = collapsedFolders[folderId];
    var contentStyle = isCollapsed ? 'display: none;' : 'display: block;';
    var arrowStyle = isCollapsed ? 'transform: rotate(-90deg);' : 'transform: rotate(0deg);';

    html += '<div class="category-folder" style="margin-bottom: 20px; background: rgba(13,16,26,0.3); border: 1px solid rgba(255,255,255,0.04); border-radius: var(--radius-lg); overflow: hidden;">';
    
    // Folder Header
    html += '<div class="folder-header" onclick="toggleFolderCollapse(\'' + folderId + '\')" style="padding: 14px 20px; background: rgba(22,28,45,0.4); display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none;">';
    html += '<div style="display: flex; align-items: center; gap: 8px;">';
    html += '<span class="folder-icon" style="color: ' + folderInfo.color + '; font-size: 14px;">📁</span>';
    html += '<strong style="font-size: 14px; color: #fff;">' + escHtml(folderInfo.label) + '</strong>';
    html += '<span style="font-size: 11px; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 10px; margin-left: 6px;">' + catItems.length + ' item(s)</span>';
    html += '</div>';
    html += '<span id="arrow-' + folderId + '" style="font-size: 10px; color: var(--text-muted); transition: transform 0.2s; ' + arrowStyle + '">▼</span>';
    html += '</div>';

    // Folder Contents (Container of date timelines)
    html += '<div id="' + folderId + '" class="folder-contents" style="padding: 20px; ' + contentStyle + '">';

    // Group items inside this folder by date
    var dateGroups = {};
    catItems.forEach(function (c) {
      var d = new Date(c.scheduled_at || c.created_at);
      var dateKey = d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
      if (!dateGroups[dateKey]) dateGroups[dateKey] = [];
      dateGroups[dateKey].push(c);
    });

    // Sort date keys
    var sortedDates = Object.keys(dateGroups).sort(function (a, b) {
      var dateA = new Date(a);
      var dateB = new Date(b);
      return sortFilter === 'date_desc' ? dateB - dateA : dateA - dateB;
    });

    sortedDates.forEach(function (dateStr) {
      var dayItems = dateGroups[dateStr];
      html += '<div class="date-timeline-wrapper" style="margin-bottom: 20px;">';
      html += '<div class="timeline-date-label" style="font-size: 11px; font-weight: 800; color: var(--accent-blue); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">';
      html += '<span>📅 ' + escHtml(dateStr) + '</span>';
      html += '<div style="flex: 1; height: 1px; background: rgba(0,194,255,0.08);"></div>';
      html += '</div>';

      // Cards Grid
      html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">';
      dayItems.forEach(function (c) {
        var statusClass = c.status.toLowerCase().replace(/\s+/g, '-');
        html += '<div class="gallery-card" style="background: rgba(16, 13, 34, 0.6); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: var(--radius-md); overflow: hidden; display: flex; flex-direction: column; transition: all 0.2s ease;">';
        
        // Image View
        if (c.status === 'Generated' && c.image_url) {
          html += '<div class="gallery-card-image" style="width: 100%; height: 180px; background: #0A0911; overflow: hidden; position: relative;">';
          html += '<img src="' + escHtml(c.image_url) + '" style="width: 100%; height: 100%; object-fit: cover;" onclick="expandGalleryImage(\'' + escHtml(c.image_url) + '\')">';
          html += '</div>';
        } else {
          html += '<div class="gallery-card-image" style="width: 100%; height: 180px; background: linear-gradient(135deg, rgba(8, 6, 18, 0.9), rgba(16, 13, 34, 0.8)); display: flex; flex-direction: column; align-items: center; justify-content: center; border-bottom: 1px dashed rgba(0, 194, 255, 0.12); position: relative; padding: 16px; text-align: center;">';
          html += '<div class="pulse-indicator" style="width: 10px; height: 10px; border-radius: 50%; background: #FB923C; box-shadow: 0 0 10px #FB923C; margin-bottom: 8px; animation: pulseGlow 1.5s infinite alternate;"></div>';
          html += '<div style="font-size: 10px; font-weight: 800; color: #FB923C; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">Awaiting Generation</div>';
          html += '<div style="font-size: 9px; color: var(--text-muted); margin-bottom: 8px;">Assigned to ' + escHtml(c.assigned_agent) + '</div>';
          html += '<button onclick="simulateGeneration(\'' + c.id + '\')" class="btn btn-mint btn-sm" style="font-size: 10px; padding: 6px 12px; height: auto;">Generate Mockup Image</button>';
          html += '</div>';
        }

        // Card Body
        html += '<div style="padding: 14px; display: flex; flex-direction: column; flex-grow: 1; gap: 10px;">';
        
        // Title & Status
        html += '<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">';
        html += '<h5 style="font-size: 13px; font-weight: 800; color: #fff; margin: 0;">' + escHtml(c.title) + '</h5>';
        html += '<span class="status-badge ' + statusClass + '" style="font-size: 8px; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; white-space: nowrap; ' + getStatusStyle(c.status) + '">' + escHtml(c.status) + '</span>';
        html += '</div>';

        // Description
        html += '<p style="font-size: 11px; color: var(--text-secondary); line-height: 1.45; margin: 0;">' + escHtml(c.description) + '</p>';

        // Meta (Assigned agent)
        html += '<div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); border-top: 1px solid rgba(255, 255, 255, 0.04); padding-top: 8px; margin-top: auto;">';
        html += '<span>Agent: <strong style="color: var(--accent-violet);">' + escHtml(c.assigned_agent) + '</strong></span>';
        html += '</div>';

        // Actions
        html += '<div style="display: flex; gap: 6px; margin-top: 6px;">';
        if (c.status === 'Generated') {
          html += '<button onclick="expandGalleryImage(\'' + escHtml(c.image_url) + '\')" class="btn btn-mint btn-sm" style="flex: 1; justify-content: center; font-size: 10px; font-weight: 800; padding: 6px 10px; height: auto;">Download Asset</button>';
        }
        html += '<button onclick="deleteConcept(\'' + c.id + '\')" class="btn btn-slate btn-sm" style="border: 1px solid rgba(255,46,91,0.15); color: var(--ap-coral); padding: 6px 10px; height: auto;">Delete</button>';
        html += '</div>';

        html += '</div></div>';
      });
      html += '</div>'; // Close Grid
      html += '</div>'; // Close timeline wrapper
    });

    html += '</div></div>'; // Close Category contents & Category folder wrapper
  });

  container.innerHTML = html;
}
window.renderGallery = renderGallery;

function getStatusStyle(status) {
  if (status === 'Generated') {
    return 'background: rgba(16, 185, 129, 0.12); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.25);';
  } else if (status === 'Pending Generation') {
    return 'background: rgba(251, 146, 96, 0.12); color: #FB923C; border: 1px solid rgba(251, 146, 96, 0.25);';
  }
  return 'background: rgba(148, 163, 184, 0.12); color: var(--text-tertiary); border: 1px solid rgba(148, 163, 184, 0.25);';
}

function expandGalleryImage(url) {
  var overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(6, 4, 12, 0.95)';
  overlay.style.zIndex = '9999';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.cursor = 'zoom-out';
  overlay.innerHTML = '<img src="' + escHtml(url) + '" style="max-width: 90vw; max-height: 90vh; border-radius: 12px; box-shadow: 0 0 40px rgba(0, 0, 0, 0.6); object-fit: contain;">';
  overlay.onclick = function () { overlay.remove(); };
  document.body.appendChild(overlay);
}
window.expandGalleryImage = expandGalleryImage;

function copyPromptText(text) {
  navigator.clipboard.writeText(text).then(function () {
    showToast('Prompt copied to clipboard', 'success');
  }).catch(function () {
    showToast('Failed to copy prompt', 'error');
  });
}
window.copyPromptText = copyPromptText;

function simulateGeneration(id) {
  var items = getGallery();
  var item = items.find(function (x) { return x.id === id; });
  if (!item) return;

  showToast('Triggering ' + item.assigned_agent + ' to run ChatGPT image generator...', 'info');

  var mockImg = generateUniqueImage(item.title, item.category, item.assigned_agent);

  setTimeout(function () {
    item.image_url = mockImg;
    item.status = 'Generated';
    saveGallery(items);
    renderGallery();
    showToast(item.assigned_agent + ' saved the concept image from ChatGPT session', 'success');
  }, 2200);
}
window.simulateGeneration = simulateGeneration;

async function createPostFromConcept(id) {
  var items = getGallery();
  var item = items.find(function (x) { return x.id === id; });
  if (!item) return;

  var post = {
    id: uuid(),
    category: item.category || 'creative',
    headline: item.title,
    hl_words: [item.title.split(/\s+/)[0]],
    caption: item.description + '\n\n' + item.prompt,
    tags: ['#AssetPersona', '#RollingTrayUI', '#TechDesign'],
    image_url: item.image_url,
    status: 'draft',
    platforms: ['threads', 'instagram', 'linkedin'],
    dimension: '1080x1080',
    dimension_w: 1080,
    dimension_h: 1080,
    created_by: localStorage.getItem('ap_centre_user') || 'frank',
    created_at: new Date().toISOString(),
    comments: []
  };

  try {
    if (window.postsApi && window.postsApi.ready()) {
      await window.postsApi.create(post);
    }
    
    posts.unshift(post);
    savePosts();

    showToast('Created draft post in Agentic Centre!', 'success');
    
    setTimeout(function() {
      var tabBtn = document.querySelector('.sidebar-item[data-sec="posts"]');
      setTab('posts', tabBtn);
    }, 500);

  } catch (err) {
    showToast('Failed to create post: ' + err.message, 'error');
  }
}
window.createPostFromConcept = createPostFromConcept;

function deleteConcept(id) {
  if (!confirm('Delete this concept from gallery?')) return;
  var items = getGallery();
  var filtered = items.filter(function (x) { return x.id !== id; });
  saveGallery(filtered);
  renderGallery();
  showToast('Concept deleted', 'success');
}
window.deleteConcept = deleteConcept;

function openNewConceptModal() {
  var modal = $('acConceptModal');
  if (modal) {
    modal.classList.add('active');
    var todayStr = new Date().toISOString().substring(0, 10);
    $('acConceptDate').value = todayStr;
  }
}
window.openNewConceptModal = openNewConceptModal;

function closeConceptModal() {
  var modal = $('acConceptModal');
  if (modal) modal.classList.remove('active');
}
window.closeConceptModal = closeConceptModal;

function submitNewConcept(e) {
  if (e) e.preventDefault();
  var title = $('acConceptTitle').value.trim();
  var desc = $('acConceptDesc').value.trim();
  var promptStr = $('acConceptPrompt').value.trim();
  var cat = $('acConceptCategory').value;
  var agent = $('acConceptAgent').value;
  var dateStr = $('acConceptDate').value;

  if (!title || !desc || !promptStr || !dateStr) return;

  var items = getGallery();
  var newItem = {
    id: 'concept-' + Date.now(),
    title: title,
    description: desc,
    image_url: '',
    prompt: promptStr,
    status: 'Pending Generation',
    assigned_agent: agent,
    category: cat,
    scheduled_at: new Date(dateStr + 'T12:00:00').toISOString(),
    created_at: new Date().toISOString()
  };

  items.push(newItem);
  saveGallery(items);
  renderGallery();
  closeConceptModal();
  $('acConceptForm').reset();
  showToast('New concept initialized', 'success');
}
window.submitNewConcept = submitNewConcept;

var AGENT_WORKFLOWS = {
  'agent-gem': [
    { key: 'orchestrate', label: 'Orchestrate Swarm' },
    { key: 'health', label: 'Check System Status' }
  ],
  'hecthor': [
    { key: 'scaffold', label: 'Generate UI Component' },
    { key: 'refactor', label: 'Refactor Code Module' }
  ],
  'big-venture': [
    { key: 'research', label: 'Compile Research Brief' },
    { key: 'seo', label: 'Audit SEO Compliance' }
  ],
  'lil-neutron': [
    { key: 'social', label: 'Create Social Post Drafts' },
    { key: 'narrative', label: 'Calibrate Brand Voice' }
  ],
  'mr-thinker': [
    { key: 'study', label: 'Format Study Hall Note' },
    { key: 'verify', label: 'Verify ML Model Configs' }
  ],
  'twoface': [
    { key: 'clone', label: 'Clone App UI Layout' },
    { key: 'screenshot', label: 'Capture Flow Screenshots' }
  ],
  'paper-agent': [
    { key: 'market', label: 'Generate Morning Market Brief' },
    { key: 'sentiment', label: 'Analyze News FinBERT Sentiment' }
  ],
  'thoughts-of-gclaw': [
    { key: 'scan', label: 'Scan Repo Codebase Security' },
    { key: 'audit', label: 'Run Adversarial Code Review' }
  ]
};

var workflowLogs = {
  'orchestrate': [
    'Initializing Lead Swarm Orchestrator...',
    'Checking status of 8 agent containers on VM...',
    'Gem container online. Dispatched HecThor (coder) to review layouts.',
    'Dispatched Lil Neutron (marketing) to scrape Threads.',
    'Consolidation complete. Ready for manual review.'
  ],
  'health': [
    'Checking VM system health...',
    'Disk usage: 42% of 100GB. RAM: 3.2GB / 8GB free.',
    'Systemd services status: all active.',
    'No active memory leaks detected.'
  ],
  'scaffold': [
    'Spawning HecThor coding container...',
    'Reading index.css and styles.css tokens...',
    'Scaffolding new glassmorphism button UI component...',
    'Validating HTML tag closing blocks...',
    'Saved to component-scaffold.html. Compilation successful!'
  ],
  'refactor': [
    'Spawning HecThor coding container...',
    'Analyzing code organization in app.js...',
    'Removing redundant and duplicate calendar structures...',
    'Refactoring successful.'
  ],
  'research': [
    'Spawning Big Venture research module...',
    'Performing Google search query: "threads api rate limits 2026"',
    'Parsing metadata and reference citations...',
    'Compiling analysis document...',
    'Research Brief completed.'
  ],
  'seo': [
    'Spawning Big Venture SEO analyzer...',
    'Scanning titles, descriptions, and meta tags...',
    'Verifying unique IDs on buttons...',
    'SEO Audit: 100/100 score.'
  ],
  'social': [
    'Spawning Lil Neutron content engine container...',
    'Reading scraped trends from local json cache...',
    'Analyzing brand voice guidelines (no em-dashes, no semicolons)...',
    'Generating post drafts for Threads and LinkedIn...',
    'Post drafts successfully saved.'
  ],
  'narrative': [
    'Spawning Lil Neutron narrative calibration container...',
    'Refining tone values...',
    'Applying raw developer voice calibration...',
    'Narrative setup complete.'
  ],
  'study': [
    'Spawning Mr. Thinker study hall container...',
    'Loading Minimax M3 and GLM 5.1 architecture parameters...',
    'Formatting documentation guide...',
    'Saving artifact to study_hall_m3.md...',
    'Compile complete.'
  ],
  'verify': [
    'Spawning Mr. Thinker verification framework...',
    'Analyzing standard Hermes profiles model keys...',
    'Verified 7 standard profiles set to MiniMax-M3.',
    'Verified thoughts-of-gclaw set to GLM-5.1.'
  ],
  'clone': [
    'Spawning TwoFace Playwright container...',
    'Navigating to Mobbin UI URL path...',
    'Downloading Swiggy mobile iOS dashboard layout assets...',
    'Executing SingleFile CLI layout capture...',
    'App clone saved. Generating preview...'
  ],
  'screenshot': [
    'Spawning TwoFace screenshot capture module...',
    'Initializing viewport context...',
    'Taking high resolution screenshots of Mobbin design flows...',
    'Images saved to local temp folder.'
  ],
  'market': [
    'Spawning Paper Agent market data crawler...',
    'Calling yfinance API for tickers AAPL, MSFT, TSLA...',
    'Fetch RSS financial news feed...',
    'Computing FinBERT news sentiment scores...',
    'Market Briefing Table completed.'
  ],
  'sentiment': [
    'Spawning Paper Agent sentiment scoring container...',
    'Scanning 50 financial headlines...',
    'Running sentiment weights...',
    'Average score: +0.68.'
  ],
  'scan': [
    'Spawning thoughts-of-gclaw container in adversarial mode...',
    'Running secrets grep checks across app/ codebase...',
    'Analyzing route protection and CORS origins...',
    'Auditing HTML for innerHTML XSS injection paths...',
    'Security Scan completed.'
  ],
  'audit': [
    'Spawning thoughts-of-gclaw container in adversarial mode...',
    'Auditing HecThor code changes...',
    'Review complete. No issues found.'
  ]
};

var workflowOutputs = {
  'orchestrate': '<div style="font-family: sans-serif;"><h5 style="color:#fff; margin-bottom:10px;">Swarm Status Log Table</h5><table style="width:100%; border-collapse:collapse; font-size:11px; text-align:left;"><thead><tr style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:6px;"><th style="color:#fff;">Agent</th><th style="color:#fff;">Task</th><th style="color:#fff;">Status</th><th style="color:#fff;">Completion</th></tr></thead><tbody><tr><td>HecThor</td><td>Scaffold UI</td><td>Active</td><td>90%</td></tr><tr><td>Lil Neutron</td><td>Scrape Feed</td><td>Active</td><td>100%</td></tr><tr><td>Paper Agent</td><td>Market Analysis</td><td>Idle</td><td>100%</td></tr><tr><td>Thoughts of G-Claw</td><td>Security Scan</td><td>Active</td><td>80%</td></tr></tbody></table></div>',
  
  'health': '<div style="font-family:sans-serif;"><h5 style="color:#fff; margin-bottom:8px;">System Health</h5><ul style="padding-left:16px; margin:0; line-height:1.6;"><li><strong>CPU Load</strong>: 12% average</li><li><strong>Disk Usage</strong>: 42.1 GB of 100 GB used</li><li><strong>Memory</strong>: 3.2 GB free / 8.0 GB total</li><li><strong>Docker Swarm</strong>: 8 active daemon networks</li></ul></div>',
  
  'scaffold': '<div style="font-family:sans-serif; text-align:center;"><h5 style="color:#fff; margin-bottom:10px; text-align:left;">Glassmorphism Button Component</h5><button style="padding: 10px 20px; background: linear-gradient(135deg, #00c2ff, #818cf8); border: none; border-radius: 8px; color: #fff; font-weight: bold; cursor: pointer; box-shadow: 0 0 15px rgba(0, 194, 255, 0.4); margin-bottom:12px;">Interactive Neon Glow Button</button><pre style="background: #000; padding: 10px; border-radius: 6px; color: #a5f3fc; text-align: left; font-size: 10px; overflow-x: auto; margin:0;">&lt;button style="background: linear-gradient(135deg, #00c2ff, #818cf8); border: none; border-radius: 8px; color: #fff; font-weight: bold; cursor: pointer; box-shadow: 0 0 15px rgba(0, 194, 255, 0.4);"&gt;\n  Interactive Neon Glow Button\n&lt;/button&gt;</pre></div>',
  
  'refactor': '<div style="font-family:sans-serif;"><h5 style="color:#fff; margin-bottom:8px;">Refactoring Audit</h5><p style="color:#10B981; font-weight:bold; margin-bottom:8px;">✓ Refactoring Successful</p><p style="margin:0; font-size:11px;">Consolidated duplicates of calendar render loops into a single module inside <code>calendar.js</code>. Cleaned dead imports and minimized codebase by 42 lines.</p></div>',
  
  'research': '<div style="font-family:sans-serif;"><h5 style="color:#fff; margin-bottom:10px;">Research Brief: Threads API Rate Limits</h5><ul style="padding-left:16px; margin:0; line-height:1.6;"><li><strong>Public Reads</strong>: Up to 1000 requests per hour per authenticated token.</li><li><strong>Media Uploads</strong>: Maximum size 100MB. Limit 20 uploads per hour.</li><li><strong>Token Life</strong>: Access tokens are valid for 60 days. Auto-refresh occurs on API handshake.</li></ul></div>',
  
  'seo': '<div style="font-family:sans-serif;"><h5 style="color:#fff; margin-bottom:8px;">SEO Audit Result</h5><div style="font-size:24px; font-weight:800; color:#10B981; margin-bottom:6px;">100/100</div><p style="margin:0; font-size:11px;">Validated meta tags, document outlines, viewport configurations, and unique testing IDs. Crawl index score is optimized.</p></div>',
  
  'social': '<div style="font-family:sans-serif;"><h5 style="color:#fff; margin-bottom:10px;">Social Post Draft Suite</h5><p><strong>Platform: Threads & LinkedIn</strong></p><blockquote style="border-left:3px solid var(--accent-blue); padding-left:12px; margin:8px 0; font-size:12px; font-style:italic; line-height:1.45; color:#cbd5e1;">Stop hiding your CLI logs. Exposing staging dashboards and sharing terminal scripts is how small teams build authentic trust. We are upgrading all agents to MiniMax M3. The code is running on remote VMs and updating this dashboard in real-time. What are you building today?</blockquote><p style="margin:0; font-size:10px; color:var(--text-muted);">#BuildInPublic #AgenticCentre #AITools</p></div>',
  
  'narrative': '<div style="font-family:sans-serif;"><h5 style="color:#fff; margin-bottom:8px;">Narrative Tone Matrix</h5><table style="width:100%; border-collapse:collapse; font-size:11px; text-align:left;"><thead><tr style="border-bottom:1px solid rgba(255,255,255,0.1);"><th style="color:#fff;">Dimension</th><th style="color:#fff;">Target Weight</th></tr></thead><tbody><tr><td>Developer Authenticity</td><td>95%</td></tr><tr><td>No Em-dashes / Semicolons</td><td>100% (Strict)</td></tr><tr><td>No Corporate Fluff</td><td>90%</td></tr></tbody></table></div>',
  
  'study': '<div style="font-family:sans-serif;"><h5 style="color:#fff; margin-bottom:10px;">AI Study Hall: MiniMax M3 vs GLM 5.1</h5><ul style="padding-left:16px; margin:0; line-height:1.6;"><li><strong>MiniMax M3</strong>: Official API identifier. Runs standard agent flows. Fast latency, high context limits.</li><li><strong>GLM 5.1</strong>: Zhipu AI architecture. Powering thoughts-of-gclaw for adversarial code checks and security audits. Deep reasoning capability.</li></ul></div>',
  
  'verify': '<div style="font-family:sans-serif;"><h5 style="color:#fff; margin-bottom:8px;">Model Configurations Check</h5><ul style="padding-left:16px; margin:0; line-height:1.6; color:#10B981; font-weight:bold;"><li>✓ Swarm profiles successfully compiled.</li><li>✓ MiniMax-M3 configured for Gem, HecThor, Big Venture, Lil Neutron, Thinker, TwoFace, Paper Agent.</li><li>✓ GLM-5.1 configured for thoughts-of-gclaw.</li></ul></div>',
  
  'clone': '<div style="font-family:sans-serif; text-align:center;"><h5 style="color:#fff; margin-bottom:10px; text-align:left;">Swiggy iOS UI Prototype Clone</h5><div style="background: #000; border: 4px solid #334155; border-radius: 12px; width: 180px; margin: 0 auto; overflow: hidden; font-family: sans-serif; text-align: left;"><div style="background: #111; padding: 4px 8px; font-size: 8px; color: #fff; display: flex; justify-content: space-between;"><span>9:41 AM</span><span>📶 🔋</span></div><div style="padding: 10px; background: #e0f2fe; color: #0369a1; font-size: 10px; font-weight: bold; text-align: center;">Swiggy UI Clone</div><div style="padding: 8px; display: flex; flex-direction: column; gap: 6px;"><div style="height: 10px; background: #cbd5e1; border-radius: 2px;"></div><div style="height: 10px; background: #cbd5e1; border-radius: 2px;"></div><div style="height: 10px; background: #cbd5e1; border-radius: 2px;"></div></div></div></div>',
  
  'screenshot': '<div style="font-family:sans-serif;"><h5 style="color:#fff; margin-bottom:8px;">Flow Capture Log</h5><p style="margin:0 0 8px; font-size:11px;">Captured 4 full resolution design flows for Swiggy onboarding journey:</p><ul style="padding-left:16px; margin:0; line-height:1.6; font-size:11px;"><li>Onboarding_Intro.png</li><li>OTP_Verification.png</li><li>GPS_Location_Request.png</li><li>Home_Dashboard_Feed.png</li></ul></div>',
  
  'market': '<div style="font-family:sans-serif;"><h5 style="color:#fff; margin-bottom:10px;">yfinance Ticker sentiment table</h5><table style="width:100%; border-collapse:collapse; font-size:11px; text-align:left;"><thead><tr style="border-bottom:1px solid rgba(255,255,255,0.1);"><th style="color:#fff;">Ticker</th><th style="color:#fff;">Last Price</th><th style="color:#fff;">Change</th><th style="color:#fff;">Sentiment</th></tr></thead><tbody><tr><td>AAPL</td><td>$182.50</td><td style="color:#10B981;">+1.20%</td><td style="color:#10B981;">Positive (0.85)</td></tr><tr><td>MSFT</td><td>$420.10</td><td style="color:#ef4444;">-0.45%</td><td>Neutral (0.02)</td></tr><tr><td>TSLA</td><td>$175.30</td><td style="color:#10B981;">+3.10%</td><td style="color:#10B981;">Positive (0.62)</td></tr></tbody></table></div>',
  
  'sentiment': '<div style="font-family:sans-serif;"><h5 style="color:#fff; margin-bottom:8px;">FinBERT News Sentiment Summary</h5><div style="font-size:24px; font-weight:800; color:#10B981; margin-bottom:6px;">+0.68</div><p style="margin:0; font-size:11px;">Crawled 50 financial news headlines. FinBERT model detected strong positive sentiment trend driven by tech earnings announcements.</p></div>',
  
  'scan': '<div style="font-family:sans-serif;"><h5 style="color:#fff; margin-bottom:10px;">Adversarial Security Scan Report</h5><ul style="padding-left:16px; margin:0; line-height:1.6; font-size:11px;"><li><strong>Secrets Grep</strong>: <span style="color:#10B981;">PASS</span>. No private keys or service_role credentials exposed.</li><li><strong>XSS Check</strong>: <span style="color:#10B981;">PASS</span>. All Threads post elements are escaped via escapeHtml before rendering.</li><li><strong>CORS Policy</strong>: <span style="color:#10B981;">PASS</span>. Restricted to localhost and production domain.</li></ul></div>',
  
  'audit': '<div style="font-family:sans-serif;"><h5 style="color:#fff; margin-bottom:8px;">Thoughts of G-Claw Code Audit</h5><p style="color:#10B981; font-weight:bold; margin-bottom:8px;">✓ Security Audit PASS</p><p style="margin:0; font-size:11px;">Audited coder layout modifications and dynamic tab selectors. No injection entry paths detected.</p></div>'
};

function renderAgentDirectory() {
  var grid = $('agentDirectoryGrid');
  if (!grid) return;

  var html = '';
  AGENTS.forEach(function (a) {
    var statusColor = a.status === 'Active' ? '#10B981' : '#64748B';
    var statusBg = a.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)';
    var modelColor = a.model.indexOf('M3') >= 0 ? '#389bc1' : '#FB923C';

    html += '<div class="agent-card" style="background: rgba(16,13,34,0.7); border: 1px solid rgba(255,255,255,0.06); border-radius: var(--radius-lg); padding: 18px; display: flex; flex-direction: column; gap: 12px; position: relative;">';
    
    // Status light
    html += '<span style="position: absolute; top: 18px; right: 18px; display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 12px; color: ' + statusColor + '; background: ' + statusBg + '; border: 1px solid ' + statusColor + '55;">';
    html += '<span style="width: 6px; height: 6px; border-radius: 50%; background: ' + statusColor + ';"></span>' + a.status + '</span>';

    // Header
    html += '<div>';
    html += '<div style="font-size: 15px; font-weight: 800; color: #fff;">' + escHtml(a.name) + '</div>';
    html += '<div style="font-size: 10px; font-weight: 700; color: ' + modelColor + '; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;">Model: ' + escHtml(a.model) + '</div>';
    html += '</div>';

    // Description
    html += '<p style="font-size: 11.5px; color: var(--text-secondary); line-height: 1.45; margin: 0;">' + escHtml(a.desc) + '</p>';

    // Metadata
    html += '<div style="background: rgba(8,6,18,0.4); border: 1px solid rgba(255,255,255,0.03); border-radius: 6px; padding: 10px; font-size: 10.5px; display: flex; flex-direction: column; gap: 4px;">';
    html += '<div style="color: var(--text-muted);">Role: <strong style="color: #fff;">' + escHtml(a.role) + '</strong></div>';
    html += '<div style="color: var(--text-muted); word-break: break-all;">Path: <strong style="color: var(--accent-violet);">' + escHtml(a.path) + '</strong></div>';
    html += '</div>';

    // Dropdown Task / Workflow triggers
    var workflows = AGENT_WORKFLOWS[a.id] || [];
    html += '<div style="margin-top: auto; display: flex; flex-direction: column; gap: 8px; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 12px;">';
    html += '<div style="font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Trigger Workflow</div>';
    html += '<div style="display: flex; gap: 6px; align-items: center;">';
    html += '<select id="workflow-select-' + a.id + '" style="flex: 1; padding: 6px; font-size: 11px; background: rgba(8,6,18,0.8); border: 1px solid rgba(0,194,255,0.15); color: #fff; border-radius: 6px; height: 30px; line-height: 1;">';
    workflows.forEach(function (w) {
      html += '<option value="' + w.key + '">' + escHtml(w.label) + '</option>';
    });
    html += '</select>';
    html += '<button onclick="runAgentWorkflow(\'' + a.id + '\')" class="btn btn-mint btn-sm" style="padding: 6px 12px; font-size: 11px; font-weight: 800; cursor: pointer; height: 30px; line-height: 1;">Run</button>';
    html += '</div>';
    html += '</div>';

    html += '</div>';
  });

  grid.innerHTML = html;
}
window.renderAgentDirectory = renderAgentDirectory;

function runAgentWorkflow(agentId) {
  var select = $('workflow-select-' + agentId);
  var taskKey = select ? select.value : '';
  
  // Switch to Agentic Centre agents tab
  var agentsSubTab = document.querySelector('.agentic-subtab[onclick*="agents"]');
  if (agentsSubTab) {
    setAgenticSubTab('agents', agentsSubTab);
  }
  
  // Sync centralized controls
  var agentSelect = $('acTargetAgentSelect');
  if (agentSelect) {
    agentSelect.value = agentId;
    syncAgentWorkflows();
  }
  
  var workflowSelect = $('acTargetWorkflowSelect');
  if (workflowSelect && taskKey) {
    workflowSelect.value = taskKey;
  }
  
  // Scroll to execution controls
  var execSection = $('agentExecutionSection');
  if (execSection) {
    execSection.scrollIntoView({ behavior: 'smooth' });
  }
  
  // Focus the topic input
  var topicInput = $('acExecutionTopic');
  if (topicInput) {
    topicInput.focus();
  }
  
  showToast('Selected agent workflow in Control Room. Enter details and run.', 'info');
}
window.runAgentWorkflow = runAgentWorkflow;


// =============================================================================
// ---- Helper State & Functions for Enhancements ----
// =============================================================================

var customCategories = [];
try {
  customCategories = JSON.parse(localStorage.getItem('ap_custom_categories') || '[]');
} catch (e) {}
window.customCategories = customCategories;

var currentFolderFilter = 'all';
window.currentFolderFilter = currentFolderFilter;

function getFilteredPosts() {
  var filtered = posts.slice();

  // Category filter
  if (currentCatFilter && currentCatFilter !== 'all') {
    filtered = filtered.filter(function (p) { return p.category === currentCatFilter; });
  }

  // Folder/Status filter mapping
  if (currentStatusFilter && currentStatusFilter !== 'all') {
    if (currentStatusFilter === 'draft_pending') {
      filtered = filtered.filter(function (p) {
        return p.status === 'draft' || p.status === 'pending';
      });
    } else if (currentStatusFilter === 'sent_active') {
      filtered = filtered.filter(function (p) {
        return p.status === 'published' || p.status === 'scheduled' || p.status === 'approved';
      });
    } else if (currentStatusFilter === 'archived_failed') {
      filtered = filtered.filter(function (p) {
        return p.status === 'archived' || p.status === 'failed';
      });
    } else {
      filtered = filtered.filter(function (p) { return p.status === currentStatusFilter; });
    }
  }

  // Platform filter
  if (currentPlatformFilter && currentPlatformFilter !== 'all') {
    filtered = filtered.filter(function (p) {
      return (p.platforms || []).indexOf(currentPlatformFilter) >= 0;
    });
  }

  // Search
  if (searchQuery) {
    var q = searchQuery.toLowerCase();
    filtered = filtered.filter(function (p) {
      return (p.headline || '').toLowerCase().indexOf(q) >= 0 ||
             (p.caption || '').toLowerCase().indexOf(q) >= 0;
    });
  }
  
  return filtered;
}
window.getFilteredPosts = getFilteredPosts;

function setFolderFilter(folder, el) {
  currentFolderFilter = folder;
  
  document.querySelectorAll('.sidebar-item').forEach(function (i) { i.classList.remove('active'); });
  if (el) el.classList.add('active');
  
  if (folder === 'task_execution') {
    var galleryTab = document.querySelector('.sidebar-item[data-sec="gallery"]');
    setTab('gallery', galleryTab);
    
    var agentsSubTab = document.querySelector('.agentic-subtab[onclick*="agents"]');
    if (agentsSubTab) {
      setAgenticSubTab('agents', agentsSubTab);
    }
    
    var execSection = $('agentExecutionSection');
    if (execSection) {
      execSection.scrollIntoView({ behavior: 'smooth' });
    }
    return;
  }
  
  currentCatFilter = 'all';
  
  if (folder === 'all') {
    currentStatusFilter = 'all';
  } else if (folder === 'drafts') {
    currentStatusFilter = 'draft_pending';
  } else if (folder === 'sent') {
    currentStatusFilter = 'sent_active';
  } else if (folder === 'archive') {
    currentStatusFilter = 'archived_failed';
  }
  
  // Sync status bar tabs active state
  var tabStatus = 'all';
  if (folder === 'drafts') tabStatus = 'draft';
  else if (folder === 'sent') tabStatus = 'published';
  else if (folder === 'archive') tabStatus = 'archived';
  
  var statusTabEl = document.querySelector('.status-tab[onclick*="' + tabStatus + '"]');
  if (statusTabEl) {
    document.querySelectorAll('.status-tab').forEach(function (t) { t.classList.remove('active'); });
    statusTabEl.classList.add('active');
  }

  var pageTitleEl = $('pageTitle');
  var pageSubEl = $('pageSub');
  if (pageTitleEl && pageSubEl && currentTab === 'posts') {
    if (folder === 'all') {
      pageTitleEl.textContent = 'All Posts';
      pageSubEl.textContent = 'Manage content across all platforms';
    } else if (folder === 'drafts') {
      pageTitleEl.textContent = 'Drafts';
      pageSubEl.textContent = 'Refine and approve draft contents';
    } else if (folder === 'sent') {
      pageTitleEl.textContent = 'Sent & Published';
      pageSubEl.textContent = 'View active and published social posts';
    } else if (folder === 'archive') {
      pageTitleEl.textContent = 'Archived Posts';
      pageSubEl.textContent = 'Browse archived and failed posts';
    }
  }
  
  if (currentTab !== 'posts') {
    var postsTab = document.querySelector('.sidebar-item[data-sec="posts"]');
    setTab('posts', postsTab);
  } else {
    render();
  }
}
window.setFolderFilter = setFolderFilter;

function handleAddCategory() {
  var input = $('newCatInput');
  if (!input) return;
  var val = input.value.trim();
  if (!val) return;
  
  var key = 'custom_' + val.toLowerCase().replace(/[^a-z0-9]/g, '_');
  if (CATEGORY_LABELS[key] || customCategories.some(function(c) { return c.key === key; })) {
    showToast('Category already exists!', 'warning');
    return;
  }
  
  var colors = ['#f08d85', '#ffa6aa', '#389bc1', '#9bd1ed', '#00f5d4', '#e0aaff', '#ff9f1c'];
  var randColor = colors[Math.floor(Math.random() * colors.length)];
  
  customCategories.push({
    key: key,
    label: val,
    color: randColor
  });
  
  try {
    localStorage.setItem('ap_custom_categories', JSON.stringify(customCategories));
  } catch (e) {}
  
  input.value = '';
  showToast('Category "' + val + '" added', 'success');
  
  renderSidebarCategories();
  populateCatDropdown();
  updateCounts();
  syncOutputFolderSelects();
}
window.handleAddCategory = handleAddCategory;

function renderSidebarCategories() {
  var container = $('sidebarCategoriesContainer');
  if (!container) return;
  
  var html = '';
  // Standard categories
  Object.keys(CATEGORY_LABELS).forEach(function (key) {
    var activeClass = (currentCatFilter === key) ? ' active' : '';
    html += '<div class="sidebar-item' + activeClass + '" onclick="setFilter(\'' + key + '\', this)">';
    html += '<span class="dot dot-' + key + '"></span>';
    html += CATEGORY_LABELS[key];
    html += '<span class="count" id="c_' + key + '">0</span>';
    html += '</div>';
  });
  
  // Custom categories
  customCategories.forEach(function (cat) {
    var activeClass = (currentCatFilter === cat.key) ? ' active' : '';
    html += '<div class="sidebar-item' + activeClass + '" onclick="setFilter(\'' + cat.key + '\', this)">';
    html += '<span class="dot" style="background:' + cat.color + '; box-shadow:0 0 6px ' + cat.color + '"></span>';
    html += escHtml(cat.label);
    html += '<span class="count" id="c_' + cat.key + '">0</span>';
    html += '</div>';
  });
  
  container.innerHTML = html;
}
window.renderSidebarCategories = renderSidebarCategories;

function syncAgentSelects() {
  var agentSel = $('acTargetAgentSelect');
  if (!agentSel) return;
  
  var html = '';
  AGENTS.forEach(function (a) {
    html += '<option value="' + a.id + '">' + escHtml(a.name) + ' (' + escHtml(a.role) + ')</option>';
  });
  agentSel.innerHTML = html;
  syncAgentWorkflows();
}
window.syncAgentSelects = syncAgentSelects;

function syncAgentWorkflows() {
  var agentSel = $('acTargetAgentSelect');
  var workflowSel = $('acTargetWorkflowSelect');
  if (!agentSel || !workflowSel) return;
  
  var agentId = agentSel.value;
  var workflows = AGENT_WORKFLOWS[agentId] || [];
  
  var html = '';
  workflows.forEach(function (w) {
    html += '<option value="' + w.key + '">' + escHtml(w.label) + '</option>';
  });
  workflowSel.innerHTML = html;
}
window.syncAgentWorkflows = syncAgentWorkflows;

function syncOutputFolderSelects() {
  var folderSel = $('acExecutionFolder');
  if (!folderSel) return;
  
  var html = '';
  html += '<optgroup label="Folders">';
  html += '<option value="drafts">Drafts</option>';
  html += '<option value="sent">Sent (Published)</option>';
  html += '<option value="archive">Archive</option>';
  html += '</optgroup>';
  
  html += '<optgroup label="Standard Categories">';
  Object.keys(CATEGORY_LABELS).forEach(function (key) {
    html += '<option value="' + key + '">' + escHtml(CATEGORY_LABELS[key]) + '</option>';
  });
  html += '</optgroup>';
  
  if (customCategories.length > 0) {
    html += '<optgroup label="Custom Categories">';
    customCategories.forEach(function (cat) {
      html += '<option value="' + cat.key + '">' + escHtml(cat.label) + '</option>';
    });
    html += '</optgroup>';
  }
  
  folderSel.innerHTML = html;
}
window.syncOutputFolderSelects = syncOutputFolderSelects;

function runCentralAgentWorkflow() {
  var agentSelect = $('acTargetAgentSelect');
  var workflowSelect = $('acTargetWorkflowSelect');
  var topicInput = $('acExecutionTopic');
  var folderSelect = $('acExecutionFolder');
  
  if (!agentSelect || !workflowSelect) return;
  
  var agentId = agentSelect.value;
  var workflowKey = workflowSelect.value;
  var topic = topicInput ? topicInput.value.trim() : '';
  var folder = folderSelect ? folderSelect.value : 'drafts';
  
  var temp = $('paramTemp') ? $('paramTemp').value : 0.7;
  var topP = $('paramTopP') ? $('paramTopP').value : 0.9;
  var schema = $('paramSchema') ? $('paramSchema').value.trim() : '';
  var limit = $('paramLimit') ? $('paramLimit').value : 4000;
  
  var agent = AGENTS.find(function (a) { return a.id === agentId; });
  if (!agent) return;
  
  showToast('Initializing execution on ' + agent.name + ' container...', 'info');
  
  var consoleEl = $('acConsole');
  var outputEl = $('acOutputPreview');
  var progressContainer = $('acProgressBarContainer');
  var progressFill = $('acProgressBarFill');
  
  if (!consoleEl || !outputEl) return;
  
  consoleEl.textContent = '> initializing agent container...\n';
  outputEl.innerHTML = '<div style="color:var(--text-muted); font-style:italic;">Agent container online. Awaiting execution stream...</div>';
  
  if (progressContainer) {
    progressContainer.style.opacity = '1';
  }
  if (progressFill) {
    progressFill.style.width = '0%';
  }
  
  // Simulated logs
  var baseLogs = workflowLogs[workflowKey] || ['Running workflow...'];
  var customLogs = [
    'Container started: ' + agent.path,
    'Model endpoint active: ' + agent.model + ' (Role: ' + agent.role + ')',
    'Session parameters parsed: temperature=' + temp + ', top_p=' + topP + ', limit=' + limit + ' tokens',
    topic ? 'Topic context analyzed: "' + topic + '"' : 'Running general prompt templates...',
    schema ? 'Applying structural JSON schema validator...' : 'Using default output parser...',
    'Fetching relative trend data from external_posts memory stream...'
  ];
  
  // Merge logs
  var allLogs = customLogs.concat(baseLogs);
  allLogs.push('Compiling generated content block...');
  allLogs.push('Verifying layout and copywriting constraints (no placeholders)...');
  allLogs.push('Structuring final database payload...');
  allLogs.push('Executing database upsert transaction for target: ' + folder);
  
  var logIdx = 0;
  var totalSteps = allLogs.length;
  
  var interval = setInterval(function () {
    if (logIdx < totalSteps) {
      var timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      consoleEl.textContent += '[' + timestamp + '] ' + allLogs[logIdx] + '\n';
      consoleEl.scrollTop = consoleEl.scrollHeight;
      
      // Update progress bar
      var pct = Math.floor(((logIdx + 1) / totalSteps) * 100);
      if (progressFill) {
        progressFill.style.width = pct + '%';
      }
      
      logIdx++;
    } else {
      clearInterval(interval);
      consoleEl.textContent += '\n[SUCCESS] Transaction committed. Task execution complete.\n';
      consoleEl.scrollTop = consoleEl.scrollHeight;
      
      // Generate the new post
      var newPostTopic = topic || 'AI-Powered Modular Dashboard';
      var category = folder;
      if (['all', 'drafts', 'sent', 'archive'].indexOf(category) >= 0) {
        category = 'ai_ml';
      }
      
      var status = 'draft';
      if (folder === 'sent') {
        status = 'published';
      } else if (folder === 'archive') {
        status = 'archived';
      } else if (folder === 'drafts') {
        status = 'draft';
      }
      
      var newHeadline = 'AGENTS: ' + newPostTopic.toUpperCase();
      var newCaption = 'Streamlining multi-agent coordination with the new ' + newPostTopic + ' interface. Built using modern glassmorphic tokens, offering real-time container log streaming and automatic deployment configurations. #' + category + ' #AgenticAI #' + agent.name.replace(/\s+/g, '');
      
      var newPost = {
        id: uuid(),
        created_at: new Date().toISOString(),
        category: category,
        status: status,
        headline: newHeadline,
        caption: newCaption,
        platforms: ['linkedin', 'threads'],
        image_url: generateUniqueImage(newPostTopic, category, agent.name),
        comments: [],
        hlWords: ['agent', 'agentic', 'coordination']
      };
      
      // Save the post
      if (window.postsApi) {
        window.postsApi.create(newPost)
          .then(function (savedPost) {
            posts.unshift(savedPost);
            savePosts();
            finalizeExecution(savedPost, outputEl, folder);
          })
          .catch(function (err) {
            console.error('Failed to save generated post:', err);
            posts.unshift(newPost);
            savePosts();
            finalizeExecution(newPost, outputEl, folder);
          });
      } else {
        posts.unshift(newPost);
        savePosts();
        finalizeExecution(newPost, outputEl, folder);
      }
    }
  }, 400);
}
window.runCentralAgentWorkflow = runCentralAgentWorkflow;

function finalizeExecution(post, outputEl, folder) {
  outputEl.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:8px;">
        <span style="font-weight:800; color:#fff; font-size:13px;">GENERATE_ARTIFACT_DRAFT</span>
        <span class="st-badge st-${post.status}" style="font-size:9px; padding:2px 6px;">${post.status}</span>
      </div>
      ${post.image_url ? `
      <div style="width:100%; max-height:220px; overflow:hidden; border-radius:8px; border:1px solid rgba(255,255,255,0.08); background:#09090b; display:flex; align-items:center; justify-content:center;">
        <img src="${post.image_url}" alt="Generated graphic" style="width:100%; height:auto; object-fit:contain;" />
      </div>
      ` : ''}
      <div>
        <strong style="color:var(--accent-blue); font-size:13px;">${escHtml(post.headline)}</strong>
      </div>
      <p style="color:var(--text-secondary); line-height:1.4; margin:0; font-size:11.5px;">${escHtml(post.caption)}</p>
      <div style="font-size:10px; color:var(--text-muted); display:flex; justify-content:space-between; margin-top:4px;">
        <span>Category: ${escHtml(post.category)}</span>
        <span>Target: ${escHtml(folder)}</span>
      </div>
    </div>
  `;
  
  showToast('Generated post saved to folder: ' + folder, 'success');
  
  updateCounts();
  
  setTimeout(function () {
    var sidebarFolderId = 'sbFolder_all';
    if (folder === 'drafts' || folder === 'sent' || folder === 'archive') {
      sidebarFolderId = 'sbFolder_' + folder;
    }
    
    var folderEl = $(sidebarFolderId);
    if (folderEl) {
      setFolderFilter(folder === 'drafts' || folder === 'sent' || folder === 'archive' ? folder : 'all', folderEl);
    }
  }, 1500);
}

function toggleSelectAll(checked) {
  var filtered = getFilteredPosts();
  filtered.forEach(function (p) {
    if (checked) {
      selectedPosts.add(p.id);
    } else {
      selectedPosts.delete(p.id);
    }
  });
  
  document.querySelectorAll('#postsGrid input[type="checkbox"]').forEach(function (cb) {
    cb.checked = checked;
    var card = cb.closest('.post-card');
    if (card) {
      if (checked) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    }
  });
  
  updateBulkUI();
}
window.toggleSelectAll = toggleSelectAll;

function parseUsernameFromPermalink(permalink, fallback) {
  if (!permalink) return fallback || 'threads_user';
  var match = permalink.match(/threads\.net\/@([a-zA-Z0-9_\.]+)/i);
  if (match && match[1]) {
    var user = match[1];
    if (user === 'frvnkfrmchicago') {
      return 'frvnkfrmchicago (Ref)';
    }
    return user;
  }
  return fallback || 'threads_user';
}

async function renderScraperFeed() {
  var tbody = $('scraperTrendsTableBody');
  if (!tbody) return;

  var dbPosts = [];
  if (window.apSupabase) {
    try {
      var res = await window.apSupabase
        .from('external_posts')
        .select('*')
        .order('fetched_at', { ascending: false });
      if (!res.error && res.data) {
        dbPosts = res.data;
      }
    } catch (e) {
      console.error('[scraper] Error querying external_posts:', e);
    }
  }

  var trends = [];
  if (dbPosts && dbPosts.length > 0) {
    trends = dbPosts.map(function (p) {
      var source = parseUsernameFromPermalink(p.permalink, 'threads_user');
      return {
        id: p.id,
        timestamp: p.fetched_at || new Date().toISOString(),
        source: source,
        summary: p.body || 'No content parsed.',
        links: p.permalink || '',
        likes: p.engagement ? (p.engagement.likes || 0) : 0,
        replies_count: p.engagement ? (p.engagement.replies_count || 0) : 0,
        raw: p.raw
      };
    });
  } else {
    trends = getScraperTrends();
  }

  window.lastRenderedTrends = trends;

  var html = '';
  trends.forEach(function (t) {
    var dateStr = new Date(t.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    var sourceLabel = t.source;
    var sourceStyle = '';
    if (sourceLabel.indexOf('(Ref)') >= 0 || sourceLabel === 'frvnkfrmchicago') {
      sourceStyle = 'color: #389bc1; font-weight: 700;';
    } else {
      sourceStyle = 'color: #10B981; font-weight: 700;';
    }

    var linksHtml = '';
    if (t.links) {
      var arr = t.links.split(',');
      linksHtml += '<div style="display:flex; flex-direction:column; gap:4px; max-width: 140px; overflow: hidden;">';
      arr.forEach(function (link) {
        var cleanLink = link.trim();
        var label = cleanLink.indexOf('threads.net') >= 0 ? 'Threads' : 'Reference';
        var pillColor = label === 'Threads' ? 'background: rgba(56,155,193,0.12); color: #9bd1ed; border: 1px solid rgba(56,155,193,0.2);' : 'background: rgba(0,194,255,0.08); color: var(--accent-blue); border: 1px solid rgba(0,194,255,0.15);';
        linksHtml += '<a href="' + escHtml(cleanLink) + '" target="_blank" class="sys-tag" style="text-align:center; font-size:10px; padding:3px 6px; border-radius:4px; text-decoration:none; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; ' + pillColor + '">' + label + '</a>';
      });
      linksHtml += '</div>';
    }

    html += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">';
    html += '<td style="padding: 12px; color: var(--text-secondary); white-space: nowrap;">' + escHtml(dateStr) + '</td>';
    html += '<td style="padding: 12px;"><span style="' + sourceStyle + '">' + escHtml(sourceLabel) + '</span></td>';
    html += '<td style="padding: 12px; color: var(--text-secondary); line-height: 1.4; max-width: 400px; word-break: break-word;">' + escHtml(t.summary) + '</td>';
    html += '<td style="padding: 12px;">' + linksHtml + '</td>';
    html += '<td style="padding: 12px; white-space: nowrap;">';
    html += '<div style="display: flex; gap: 6px;">';
    html += '<button onclick="openThreadsDrawer(\'' + t.id + '\')" class="btn btn-slate btn-sm" style="height: auto; padding: 4px 8px; font-size: 11px; border: 1px solid rgba(0,194,255,0.15); color: var(--accent-blue);">View Thread</button>';
    html += '<button onclick="createDraftFromTrend(\'' + t.id + '\')" class="btn btn-mint btn-sm" style="height: auto; padding: 4px 8px; font-size: 11px;">Draft Post</button>';
    html += '</div>';
    html += '</td>';
    html += '</tr>';
  });

  tbody.innerHTML = html;
}
window.renderScraperFeed = renderScraperFeed;

var MOCK_THREADS = {
  'trend-1': {
    username: 'grazzhopper',
    verified: true,
    avatar: 'GH',
    text: 'Designing a modular dashboard widget in dark mode. Need customizable card layouts and drag-and-drop workflow interfaces. Let\'s build it!',
    likes: 124,
    replies_count: 8,
    media: 'assets/rolling_tray_ui_1.png',
    timestamp: 'June 1, 5:30 PM',
    replies: [
      { username: 'designer_xyz', avatar: 'DX', text: 'Love this idea! Glassmorphism panels would look incredibly clean.', timestamp: '10m ago' },
      { username: 'app_builder', avatar: 'AB', text: 'Make sure there is a way to toggle different agent metrics in the widgets.', timestamp: '8m ago' },
      { username: 'frank_fan', avatar: 'FF', text: 'Stunning layout concept, would definitely use this dashboard.', timestamp: '5m ago' }
    ]
  },
  'trend-2': {
    username: 'frvnkfrmchicago',
    verified: true,
    avatar: 'FC',
    text: 'What is the legacy image generator? If OpenAI is phasing it out or changing API access, how are we managing image generation? Let\'s check the browser cookies and ChatGPT session reliability.',
    likes: 312,
    replies_count: 14,
    media: '',
    timestamp: 'June 1, 1:45 PM',
    replies: [
      { username: 'hecthor', avatar: 'HT', text: 'We can use Playwright sessions to automate ChatGPT Web UI generation directly from GCE VM.', timestamp: '1h ago' },
      { username: 'gclaw_security', avatar: 'GC', text: 'Automated session cookies must be protected. Ensure decrypt_cookies key is restricted.', timestamp: '45m ago' },
      { username: 'ai_engineer', avatar: 'AE', text: 'Playwright session persistence works nicely but requires periodic re-auth cookie refreshes.', timestamp: '30m ago' }
    ]
  },
  'trend-3': {
    username: 'frvnkfrmchicago',
    verified: true,
    avatar: 'FC',
    text: 'Building in public is the cheat code. Why hide your internal tools? Show your CLI logs, expose your staging dashboards, and let the community break it.',
    likes: 418,
    replies_count: 22,
    media: '',
    timestamp: 'May 31, 9:15 AM',
    replies: [
      { username: 'open_source_dev', avatar: 'OD', text: 'Yes! Lightweight static interfaces are so much faster than bloated React dashboards.', timestamp: '2h ago' },
      { username: 'security_ninja', avatar: 'SN', text: 'True, but don\'t commit your Supabase service_role keys while doing it!', timestamp: '1h ago' },
      { username: 'indie_hacker', avatar: 'IH', text: 'Already refactoring my app to use this exact structure.', timestamp: '15m ago' }
    ]
  }
};

function openThreadsDrawer(trendId) {
  var drawer = $('acThreadsDrawer');
  var body = $('threadsDrawerBody');
  if (!drawer || !body) return;

  var threadData = null;
  if (window.lastRenderedTrends) {
    threadData = window.lastRenderedTrends.find(function (x) { return String(x.id) === String(trendId); });
  }
  if (!threadData) {
    threadData = MOCK_THREADS[trendId];
  }

  if (!threadData) {
    body.innerHTML = '<div style="color:var(--text-muted); padding:20px; text-align:center;">No conversation detail available for this trend.</div>';
    drawer.classList.add('active');
    return;
  }

  var username = threadData.username || parseUsernameFromPermalink(threadData.links, 'threads_user');
  if (username.indexOf('(Ref)') >= 0) username = username.replace(' (Ref)', '');

  var text = threadData.text || threadData.summary;
  var likes = threadData.likes !== undefined ? threadData.likes : (threadData.raw && threadData.raw.likes ? threadData.raw.likes : 0);
  var repliesCount = threadData.replies_count !== undefined ? threadData.replies_count : (threadData.raw && threadData.raw.replies_count ? threadData.raw.replies_count : 0);
  var avatar = username.slice(0, 2).toUpperCase();
  var media = threadData.media || '';

  var html = '';

  html += '<div class="threads-post-container">';
  html += '  <div class="threads-avatar-col">';
  html += '    <div class="threads-avatar">' + escHtml(avatar) + '</div>';
  html += '    <div class="threads-line"></div>';
  html += '  </div>';
  html += '  <div class="threads-content-col">';
  html += '    <div class="threads-username">@' + escHtml(username) + ' <span class="threads-verified">✓</span></div>';
  html += '    <div class="threads-text">' + escHtml(text) + '</div>';
  
  if (media) {
    html += '  <div class="threads-media" style="margin-top:10px;"><img src="' + escHtml(media) + '" style="width:100%; max-height:220px; object-fit:cover; display:block; border-radius:8px; border:1px solid rgba(255,255,255,0.08);"></div>';
  }
  
  html += '    <div class="threads-actions">';
  html += '      <span class="threads-action-btn">♡ ' + likes + '</span>';
  html += '      <span class="threads-action-btn">💬 ' + repliesCount + '</span>';
  html += '      <span class="threads-action-btn">⤎ Share</span>';
  html += '    </div>';
  html += '  </div>';
  html += '</div>';

  var replies = [];
  if (threadData.replies) {
    replies = threadData.replies;
  } else if (threadData.raw && threadData.raw.replies) {
    replies = threadData.raw.replies;
  }

  if (replies && replies.length > 0) {
    replies.forEach(function (reply, index) {
      var isLast = index === replies.length - 1;
      var lineHtml = isLast ? '' : '<div class="threads-line"></div>';
      var rAvatar = (reply.username || 'user').slice(0, 2).toUpperCase();
      
      html += '<div class="threads-post-container" style="margin-top: 12px;">';
      html += '  <div class="threads-avatar-col">';
      html += '    <div class="threads-avatar" style="width:28px; height:28px; font-size:10px;">' + escHtml(rAvatar) + '</div>';
      html += '    ' + lineHtml;
      html += '  </div>';
      html += '  <div class="threads-content-col">';
      html += '    <div class="threads-username" style="font-size:12px;">@' + escHtml(reply.username || 'reply_user') + '</div>';
      html += '    <div class="threads-text" style="font-size:12px;">' + escHtml(reply.text) + '</div>';
      html += '    <div style="font-size:10px; color:var(--text-muted); margin-top:6px;">' + escHtml(reply.timestamp || 'Just now') + '</div>';
      html += '  </div>';
      html += '</div>';
    });
  } else {
    html += '<div style="padding:16px; text-align:center; color:var(--text-muted); font-size:11px;">End of thread</div>';
  }

  body.innerHTML = html;
  drawer.classList.add('active');
}
window.openThreadsDrawer = openThreadsDrawer;

function closeThreadsDrawer() {
  var drawer = $('acThreadsDrawer');
  if (drawer) drawer.classList.remove('active');
}
window.closeThreadsDrawer = closeThreadsDrawer;

function triggerScraper(type) {
  var logBox = $('scraperConsoleLog');
  if (!logBox) return;

  logBox.style.display = 'block';
  logBox.textContent = '';
  
  var logs = [];
  if (type === 'frank') {
    logs = [
      'Initializing Playwright session for @frvnkfrmchicago...',
      'Loading cookie profile: threads_cookies_frvnkfrmchicago_fresh.json',
      'Navigation successful: https://www.threads.net/@frvnkfrmchicago',
      'Reading feed contents (scrolled 2 times)...',
      'Intercepted 12 threads.',
      '[ANALYZING FEED REFERENCE INTEL]',
      'Note: This is Frank\'s reference feed. Extracting discussion topics, avoiding direct quotes.',
      'Extracted trend: Deprecation of legacy image models and implementation of browser cookies.',
      'Extracted trend: Developer culture of building in public with custom CLI tools.',
      'Saving results to database...',
      'Success! Feed analysis completed.'
    ];
  } else {
    logs = [
      'Initializing Playwright session for @grazzhopper...',
      'Loading cookie profile: threads_cookies_grazzhopper_fresh.json',
      'Navigation successful: https://www.threads.net/@grazzhopper',
      'Reading feed contents (scrolled 2 times)...',
      'Intercepted 8 threads.',
      '[AUDITING BRAND PROFILE STATUS]',
      'Checking user authentication status... OK (Valid session cookies)',
      'Checking inbox notifications... 3 unread comments found.',
      'Extracting feedback on modular dashboard designs.',
      'Saving results to database...',
      'Success! Brand scraper sync completed.'
    ];
  }

  var index = 0;
  function printLog() {
    if (index < logs.length) {
      logBox.textContent += logs[index] + '\n';
      logBox.scrollTop = logBox.scrollHeight;
      index++;
      setTimeout(printLog, 300);
    } else {
      var trends = getScraperTrends();
      var newTrend = {};
      if (type === 'frank') {
        newTrend = {
          id: 'trend-' + Date.now(),
          timestamp: new Date().toISOString(),
          source: 'frvnkfrmchicago (Ref)',
          summary: 'Newly scraped topic: Exposing system-level process logs securely via clean, lightweight local UI dashboards inside static client environments.',
          links: 'https://threads.net/@frvnkfrmchicago/post/' + Math.floor(Math.random() * 999999)
        };
      } else {
        newTrend = {
          id: 'trend-' + Date.now(),
          timestamp: new Date().toISOString(),
          source: 'grazzhopper',
          summary: 'Newly scraped feedback: Demand for visual state machine flowchart panels in agent dashboards to track multi-agent lane progress.',
          links: 'https://threads.net/@grazzhopper/post/' + Math.floor(Math.random() * 999999)
        };
      }

      if (window.apSupabase) {
        var dbRecord = {
          platform: 'threads',
          body: newTrend.summary,
          permalink: newTrend.links,
          engagement: { likes: Math.floor(Math.random() * 100) + 10, replies_count: Math.floor(Math.random() * 8) + 2 },
          raw: { scraped_type: type, source_id: newTrend.id },
          fetched_at: newTrend.timestamp
        };
        window.apSupabase.from('external_posts').insert(dbRecord).then(function (res) {
          if (res.error) {
            console.error('[scraper] Error saving to external_posts table, falling back to local cache:', res.error);
            trends.unshift(newTrend);
            saveScraperTrends(trends);
          } else {
            console.log('[scraper] Saved scraped record to external_posts table successfully.');
          }
          renderScraperFeed();
        }).catch(function (err) {
          console.error('[scraper] Failed to save record to Supabase, falling back to local cache:', err);
          trends.unshift(newTrend);
          saveScraperTrends(trends);
          renderScraperFeed();
        });
      } else {
        trends.unshift(newTrend);
        saveScraperTrends(trends);
        renderScraperFeed();
      }
      showToast('Scraper completed successfully!', 'success');
    }
  }

  printLog();
}
window.triggerScraper = triggerScraper;

function reauthGrazzhopper() {
  showToast('Initiating GrazzHopper cookie refresh via headless browser...', 'info');
  var logBox = $('scraperConsoleLog');
  if (logBox) {
    logBox.style.display = 'block';
    logBox.textContent = 'Launching Playwright authentication gateway...\nLoading meta auth cookies...\nSession cookies refreshed successfully.\nSaved to threads_cookies_grazzhopper_fresh.json\n';
  }
  setTimeout(function () {
    showToast('GrazzHopper re-authenticated successfully!', 'success');
  }, 1500);
}
window.reauthGrazzhopper = reauthGrazzhopper;

function createDraftFromTrend(trendId) {
  var trends = window.lastRenderedTrends || getScraperTrends();
  var trend = trends.find(function (t) { return String(t.id) === String(trendId); });
  if (!trend) return;

  var post = {
    id: uuid(),
    category: 'culture',
    headline: 'Trend Analysis: ' + trend.source,
    hl_words: ['Trend'],
    caption: 'Scraped insight summary:\n\n' + trend.summary + '\n\nSource links:\n' + trend.links,
    tags: ['#AgenticCentre', '#Intelligence', '#TrendDraft'],
    image_url: '',
    status: 'draft',
    platforms: ['threads', 'linkedin'],
    dimension: '1080x1080',
    dimension_w: 1080,
    dimension_h: 1080,
    created_by: localStorage.getItem('ap_centre_user') || 'frank',
    created_at: new Date().toISOString(),
    comments: []
  };

  try {
    if (window.postsApi && window.postsApi.ready()) {
      window.postsApi.create(post);
    }
    posts.unshift(post);
    savePosts();
    showToast('Created draft post in Agentic Centre!', 'success');

    setTimeout(function() {
      var tabBtn = document.querySelector('.sidebar-item[data-sec="posts"]');
      setTab('posts', tabBtn);
    }, 500);
  } catch (err) {
    showToast('Failed to create post from trend: ' + err.message, 'error');
  }
}
window.createDraftFromTrend = createDraftFromTrend;


function renderPromptsView() {
  var listContainer = $('acPromptsList');
  if (!listContainer) return;

  var items = getGallery();
  var searchVal = ($('acPromptSearch') ? $('acPromptSearch').value : '').toLowerCase();

  var filtered = items.filter(function (c) {
    if (!c.prompt) return false;
    if (searchVal) {
      return c.title.toLowerCase().indexOf(searchVal) >= 0 || 
             c.prompt.toLowerCase().indexOf(searchVal) >= 0 ||
             c.assigned_agent.toLowerCase().indexOf(searchVal) >= 0;
    }
    return true;
  });

  if (filtered.length === 0) {
    listContainer.innerHTML = '<div style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 12px;">No prompts found in your library.</div>';
    return;
  }

  var html = '';
  filtered.forEach(function (c) {
    var catInfo = GALLERY_FOLDERS[c.category] || { label: 'General', color: '#94A3B8' };
    
    html += '<div style="background: rgba(16, 13, 34, 0.5); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">';
    
    html += '<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">';
    html += '  <div>';
    html += '    <strong style="color: #fff; font-size: 13px; display: block;">' + escHtml(c.title) + '</strong>';
    html += '    <span style="font-size: 10px; color: var(--text-muted);">Agent: <strong style="color: var(--accent-violet);">' + escHtml(c.assigned_agent) + '</strong></span>';
    html += '  </div>';
    html += '  <span style="font-size: 9px; padding: 2px 6px; border-radius: 4px; border: 1px solid ' + catInfo.color + '25; background: ' + catInfo.color + '12; color: ' + catInfo.color + '; font-weight: 700; text-transform: uppercase;">' + escHtml(catInfo.label) + '</span>';
    html += '</div>';

    html += '<div style="padding: 10px; border-radius: 6px; background: rgba(8, 6, 18, 0.4); border: 1px solid rgba(255, 255, 255, 0.04); position: relative;">';
    html += '  <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.45; word-break: break-word; font-family: monospace; white-space: pre-wrap; max-height: 80px; overflow-y: auto;">' + escHtml(c.prompt) + '</div>';
    html += '</div>';

    html += '<div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 8px; margin-top: 4px;">';
    html += '  <span style="font-size: 10px; color: var(--text-muted);">Created: ' + new Date(c.created_at).toLocaleDateString() + '</span>';
    html += '  <button onclick="copyPromptText(\'' + escHtml(c.prompt.replace(/'/g, "\\'")) + '\')" class="btn btn-mint btn-sm" style="height: auto; padding: 4px 10px; font-size: 10px; font-weight: 700;">Copy Prompt</button>';
    html += '</div>';

    html += '</div>';
  });

  listContainer.innerHTML = html;
}
window.renderPromptsView = renderPromptsView;

function submitDraftPrompt(e) {
  e.preventDefault();
  var title = $('acDraftPromptTitle').value.trim();
  var text = $('acDraftPromptText').value.trim();
  var cat = $('acDraftPromptCategory').value;
  var agent = $('acDraftPromptAgent').value;

  if (!title || !text) return;

  var items = getGallery();
  var newItem = {
    id: 'concept-' + Date.now(),
    title: title,
    description: 'Custom drafted prompt in the Prompts Library.',
    image_url: '',
    prompt: text,
    status: 'Pending Generation',
    assigned_agent: agent,
    category: cat,
    scheduled_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  items.unshift(newItem);
  saveGallery(items);

  $('acDraftPromptTitle').value = '';
  $('acDraftPromptText').value = '';

  renderPromptsView();
  showToast('Prompt saved to library successfully!', 'success');
}
window.submitDraftPrompt = submitDraftPrompt;

// Keyframe pulse animation
var styleEl = document.createElement('style');
styleEl.innerHTML = '\
@keyframes pulseGlow {\
  from { opacity: 0.6; box-shadow: 0 0 6px #FB923C; }\
  to { opacity: 1; box-shadow: 0 0 16px #FB923C; }\
}\
';
document.head.appendChild(styleEl);


