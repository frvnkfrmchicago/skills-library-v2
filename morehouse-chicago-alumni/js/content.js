/**
 * MOREHOUSE CHICAGO ALUMNI — NEWS / CONTENT HUB
 * Lane H (mcaa-wave-002) — content.html
 *
 * Reads only approved/auto_approved content_items from Supabase.
 * RLS enforces this at the DB level; client filter is defence-in-depth.
 *
 * No innerHTML for user/feed-controlled strings — textContent and DOM
 * construction only throughout (evidence-contract G5).
 *
 * Adds schema.org NewsArticle JSON-LD for rendered items (G6 SEO).
 *
 * Skills: frontend-architecting, search-building, research-conducting
 * Librarians: frontend-librarian, search-librarian, research-librarian
 * 2026 refs: https://schema.org/NewsArticle
 *            https://supabase.com/docs/guides/database/postgres/row-level-security
 *            https://www.nngroup.com/articles/information-architecture-study-guide/
 */

(function () {
  'use strict';

  // ─── small DOM helpers (mirrors shell.js contract — no innerHTML) ────────────
  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'class') node.className = attrs[k];
        else if (attrs[k] != null) node.setAttribute(k, attrs[k]);
      });
    }
    if (text != null) node.textContent = text;
    return node;
  }

  // Clear a container without innerHTML.
  function clearEl(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
  }

  // ─── State ───────────────────────────────────────────────────────────────────

  var state = {
    items:           [],
    featured:        [],
    filterType:      'news',   // default to news per brief
    filterRelevance: '',
    page:            0,
    pageSize:        12,
    loading:         false
  };

  // ─── Init ────────────────────────────────────────────────────────────────────

  async function init() {
    // Sync select default to state (the HTML default is also 'news').
    var typeFilter = document.getElementById('filter-type');
    if (typeFilter) typeFilter.value = state.filterType;

    await loadContent();
    bindFilters();
  }

  // ─── Data loader ─────────────────────────────────────────────────────────────

  async function loadContent() {
    state.loading = true;
    renderLoadingState(true);

    var client = window.supabaseClient;
    if (!client) {
      renderError('News is not available right now. Please try again later.');
      state.loading = false;
      renderLoadingState(false);
      return;
    }

    var query = client
      .from('content_items')
      .select(
        'id, title, summary, url, source_url, source_platform, source_date, ' +
        'published_at, relevance_tags, chicago_relevance, content_type, ' +
        'image_url, is_featured, approval_status'
      )
      .in('approval_status', ['approved', 'auto_approved'])
      .order('is_featured', { ascending: false })
      .order('published_at', { ascending: false });

    if (state.filterType) {
      query = query.eq('content_type', state.filterType);
    }
    if (state.filterRelevance) {
      query = query.eq('chicago_relevance', state.filterRelevance);
    }

    var result = await query;
    var data  = result.data;
    var error = result.error;

    if (error) {
      console.error('content.js loadContent:', error.message);
      renderError('Unable to load news. Please try again.');
      state.loading = false;
      renderLoadingState(false);
      return;
    }

    var allItems = data || [];
    state.featured = allItems.filter(function (i) { return i.is_featured; });
    state.items    = allItems;
    state.loading  = false;

    renderLoadingState(false);
    renderFeatured();
    renderGrid();
    renderPagination();
    injectNewsArticleJsonLd(allItems.slice(0, state.pageSize));
  }

  // ─── Featured module ──────────────────────────────────────────────────────────

  function renderFeatured() {
    var container = document.getElementById('featured-module');
    if (!container) return;
    clearEl(container);

    if (state.featured.length === 0) {
      container.style.display = 'none';
      return;
    }
    container.style.display = 'block';

    container.appendChild(el('h2', { class: 'news-section-heading' }, 'Featured'));

    var grid = el('div', { class: 'content-featured-grid' });
    state.featured.slice(0, 3).forEach(function (item) {
      grid.appendChild(buildCard(item, true));
    });
    container.appendChild(grid);
  }

  // ─── Main grid ────────────────────────────────────────────────────────────────

  function renderGrid() {
    var container = document.getElementById('content-grid');
    if (!container) return;
    clearEl(container);

    var start = state.page * state.pageSize;
    var pageItems = state.items.slice(start, start + state.pageSize);

    if (state.items.length === 0) {
      container.appendChild(
        el('p', { class: 'content-empty' }, 'No news available. Check back soon.')
      );
      return;
    }
    if (pageItems.length === 0) {
      container.appendChild(
        el('p', { class: 'content-empty' }, 'No items on this page.')
      );
      return;
    }

    pageItems.forEach(function (item) {
      container.appendChild(buildCard(item, false));
    });
  }

  // ─── Card builder (no innerHTML) ──────────────────────────────────────────────

  function buildCard(item, isFeaturedCard) {
    var card = el('article', {
      class: isFeaturedCard ? 'content-card content-card--featured' : 'content-card',
      role: 'listitem'
    });

    // Image — links to source; no Storage copy per copyright rule
    if (item.image_url) {
      var imgWrap = el('div', { class: 'card-image-wrap' });
      var img = el('img', {
        class: 'card-image',
        src: item.image_url,
        alt: '',
        loading: 'lazy'
      });
      imgWrap.appendChild(img);
      card.appendChild(imgWrap);
    }

    var body = el('div', { class: 'card-body' });

    // Platform + type meta line
    var meta = el('div', { class: 'card-meta-line' });
    meta.appendChild(el('span', { class: 'platform-tag' }, formatPlatform(item.source_platform)));
    if (item.content_type) {
      meta.appendChild(el('span',
        { class: 'type-tag type-' + item.content_type },
        item.content_type.replace('_', ' ')
      ));
    }
    body.appendChild(meta);

    // Title
    body.appendChild(el('h3', { class: 'card-title' }, item.title || 'Untitled'));

    // Summary — excerpt only, never full text
    if (item.summary) {
      body.appendChild(el('p', { class: 'card-summary' }, item.summary));
    }

    // Card footer: date + source link
    var footer = el('div', { class: 'card-footer' });
    if (item.source_date) {
      footer.appendChild(
        el('span', { class: 'card-date' }, formatDateShort(item.source_date))
      );
    }
    if (item.url) {
      var link = el('a', {
        class: 'card-source-link',
        href: item.url,
        target: '_blank',
        rel: 'noopener noreferrer'
      }, item.source_platform ? 'Read on ' + formatPlatform(item.source_platform) : 'Read original');
      footer.appendChild(link);
    }
    body.appendChild(footer);

    // Relevance tags
    if (item.relevance_tags && item.relevance_tags.length > 0) {
      var tags = el('div', { class: 'card-tags' });
      item.relevance_tags.slice(0, 4).forEach(function (tag) {
        tags.appendChild(el('span', { class: 'tag' }, tag));
      });
      body.appendChild(tags);
    }

    card.appendChild(body);
    return card;
  }

  // ─── Pagination ───────────────────────────────────────────────────────────────

  function renderPagination() {
    var container = document.getElementById('content-pagination');
    if (!container) return;
    clearEl(container);

    var total      = state.items.length;
    var totalPages = Math.ceil(total / state.pageSize);
    if (totalPages <= 1) return;

    if (state.page > 0) {
      var prev = el('button', { class: 'btn-page', type: 'button' }, 'Previous');
      prev.addEventListener('click', function () {
        state.page--;
        renderGrid();
        renderPagination();
        scrollToGrid();
      });
      container.appendChild(prev);
    }

    container.appendChild(
      el('span', { class: 'page-info' },
        'Page ' + (state.page + 1) + ' of ' + totalPages)
    );

    if (state.page < totalPages - 1) {
      var next = el('button', { class: 'btn-page', type: 'button' }, 'Next');
      next.addEventListener('click', function () {
        state.page++;
        renderGrid();
        renderPagination();
        scrollToGrid();
      });
      container.appendChild(next);
    }
  }

  function scrollToGrid() {
    var grid = document.getElementById('content-grid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth' });
  }

  // ─── Loading / error helpers ──────────────────────────────────────────────────

  function renderLoadingState(isLoading) {
    var loadingEl = document.getElementById('content-loading');
    if (loadingEl) loadingEl.style.display = isLoading ? 'block' : 'none';
    var grid = document.getElementById('content-grid');
    if (grid) grid.style.display = isLoading ? 'none' : 'grid';
  }

  function renderError(msg) {
    var container = document.getElementById('content-grid');
    if (!container) return;
    clearEl(container);
    container.style.display = 'block';
    container.appendChild(el('p', { class: 'content-error' }, msg));
  }

  // ─── Formatters ───────────────────────────────────────────────────────────────

  function formatPlatform(platform) {
    if (!platform) return 'Source';
    var MAP = {
      morehouse_web:    'Morehouse College',
      morehouse_news:   'Morehouse News',
      morehouse_events: 'Morehouse Events',
      instagram:        'Instagram',
      linkedin:         'LinkedIn',
      national:         'National Alumni',
      chapter:          'Chapter',
      other:            'Source'
    };
    return MAP[platform] || platform.replace(/_/g, ' ');
  }

  function formatDateShort(dateStr) {
    if (window.formatDateShort) {
      try { return window.formatDateShort(dateStr); } catch (_) {}
    }
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US',
        { month: 'long', day: 'numeric', year: 'numeric' });
    } catch (_) { return dateStr || ''; }
  }

  // ─── schema.org NewsArticle JSON-LD ──────────────────────────────────────────
  // Injected into <head> after the first page of items renders.
  // Serialised from a plain object — safe, not user HTML.
  // Reference: https://schema.org/NewsArticle
  // Reference: https://developers.google.com/search/docs/appearance/structured-data/article

  function injectNewsArticleJsonLd(items) {
    try {
      var existing = document.getElementById('news-article-jsonld');
      if (existing) existing.parentNode.removeChild(existing);
      if (!items || !items.length) return;

      var newsItems = items.filter(function (i) {
        return i.content_type === 'news' || !i.content_type;
      });
      if (!newsItems.length) newsItems = items.slice(0, 5);

      var graph = newsItems.map(function (item) {
        var obj = {
          '@type':     'NewsArticle',
          headline:    item.title || '',
          description: item.summary || '',
          url:         item.url || item.source_url || '',
          publisher: {
            '@type': 'Organization',
            name:    'Chicago Area Morehouse College Alumni Association',
            url:     'https://www.morehouse.edu'
          }
        };
        // datePublished — use source_date or published_at if present
        var dateVal = item.source_date || item.published_at;
        if (dateVal) obj.datePublished = dateVal;
        if (item.image_url) {
          obj.image = { '@type': 'ImageObject', url: item.image_url };
        }
        return obj;
      });

      var data = {
        '@context': 'https://schema.org',
        '@graph':   graph
      };

      var script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id   = 'news-article-jsonld';
      script.textContent = JSON.stringify(data); // serialised object — not user HTML
      document.head.appendChild(script);
    } catch (_) {
      // JSON-LD is progressive enhancement; never throw.
    }
  }

  // ─── Filter bindings ─────────────────────────────────────────────────────────

  function bindFilters() {
    var typeFilter      = document.getElementById('filter-type');
    var relevanceFilter = document.getElementById('filter-relevance');

    if (typeFilter) {
      typeFilter.addEventListener('change', async function () {
        state.filterType = typeFilter.value;
        state.page = 0;
        await loadContent();
      });
    }
    if (relevanceFilter) {
      relevanceFilter.addEventListener('change', async function () {
        state.filterRelevance = relevanceFilter.value;
        state.page = 0;
        await loadContent();
      });
    }
  }

  // ─── Bootstrap ───────────────────────────────────────────────────────────────
  // Shell.render() is called from the inline <script> in content.html after
  // Store.init() + Auth.init(). Content loading starts on DOMContentLoaded.

  document.addEventListener('DOMContentLoaded', init);

})();
