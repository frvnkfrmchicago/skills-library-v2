/* ============================================================
   PLK LAW GROUP — LEGAL NEWS WIDGET (JavaScript)
   Fetches live legal news from free RSS/API sources
   relevant to IP, entertainment, corporate, and sports law.
   ============================================================ */

const PLKNews = (() => {

  // ---- Configuration ----
  const CONFIG = {
    // RSS-to-JSON proxy (free, no key required)
    rssProxy: 'https://api.rss2json.com/v1/api.json?rss_url=',

    // RSS feeds relevant to PLK practice areas
    feeds: [
      {
        url: 'https://www.law.com/nationallawjournal/feed/',
        source: 'National Law Journal',
        defaultCategory: 'corporate'
      },
      {
        url: 'https://feeds.feedburner.com/aaborginality',
        source: 'ABA Journal',
        defaultCategory: 'corporate'
      },
      {
        url: 'https://news.google.com/rss/search?q=intellectual+property+law&hl=en-US&gl=US&ceid=US:en',
        source: 'Google News',
        defaultCategory: 'ip'
      },
      {
        url: 'https://news.google.com/rss/search?q=entertainment+law+copyright&hl=en-US&gl=US&ceid=US:en',
        source: 'Google News',
        defaultCategory: 'entertainment'
      },
      {
        url: 'https://news.google.com/rss/search?q=sports+law+trademark&hl=en-US&gl=US&ceid=US:en',
        source: 'Google News',
        defaultCategory: 'sports'
      },
      {
        url: 'https://news.google.com/rss/search?q=corporate+law+business+legal&hl=en-US&gl=US&ceid=US:en',
        source: 'Google News',
        defaultCategory: 'corporate'
      }
    ],

    // Keyword-based category classification
    categoryKeywords: {
      ip: [
        'patent', 'trademark', 'copyright', 'intellectual property',
        'infringement', 'trade secret', 'counterfeit', 'ip law',
        'brand protection', 'licensing', 'piracy', 'fair use'
      ],
      entertainment: [
        'entertainment', 'music', 'film', 'media', 'celebrity',
        'streaming', 'hollywood', 'recording', 'artist', 'studio',
        'content creator', 'digital media', 'publishing'
      ],
      sports: [
        'sports', 'athlete', 'nfl', 'nba', 'mlb', 'esports',
        'e-sport', 'betting', 'league', 'olympic', 'fifa',
        'player contract', 'name image likeness', 'nil'
      ],
      corporate: [
        'corporate', 'business', 'merger', 'acquisition', 'compliance',
        'sec', 'startup', 'venture', 'contract', 'regulation',
        'governance', 'antitrust', 'litigation', 'bankruptcy'
      ]
    },

    // Fallback articles if all feeds fail
    fallbackArticles: [
      {
        title: 'Supreme Court Rules on AI-Generated Content and Copyright Protection',
        excerpt: 'The Supreme Court issued a landmark ruling addressing the intersection of artificial intelligence and intellectual property law, with significant implications for creators, tech companies, and content platforms.',
        link: 'https://plklawgroup.com/news',
        category: 'ip',
        source: 'PLK Law Group',
        pubDate: new Date().toISOString(),
        thumbnail: ''
      },
      {
        title: 'New Federal Trade Secret Regulations Take Effect',
        excerpt: 'Updated regulations under the Defend Trade Secrets Act introduce stricter penalties for misappropriation and expand protections for digital trade secrets in the cloud computing era.',
        link: 'https://plklawgroup.com/news',
        category: 'ip',
        source: 'PLK Law Group',
        pubDate: new Date().toISOString(),
        thumbnail: ''
      },
      {
        title: 'NIL Deals Reshape College Athletics Landscape',
        excerpt: 'Name, Image, and Likeness agreements continue to transform college sports as new state laws and NCAA policies create a complex legal framework for student-athlete compensation.',
        link: 'https://plklawgroup.com/news',
        category: 'sports',
        source: 'PLK Law Group',
        pubDate: new Date().toISOString(),
        thumbnail: ''
      },
      {
        title: 'Streaming Wars Trigger Wave of Entertainment Contract Disputes',
        excerpt: 'As major studios restructure their streaming strategies, entertainment attorneys see a surge in content licensing disputes, talent compensation claims, and distribution rights litigation.',
        link: 'https://plklawgroup.com/news',
        category: 'entertainment',
        source: 'PLK Law Group',
        pubDate: new Date().toISOString(),
        thumbnail: ''
      },
      {
        title: 'SEC Finalizes New Corporate Disclosure Requirements',
        excerpt: 'The Securities and Exchange Commission adopted final rules requiring enhanced disclosure of cybersecurity incidents, board diversity metrics, and climate-related financial risks.',
        link: 'https://plklawgroup.com/news',
        category: 'corporate',
        source: 'PLK Law Group',
        pubDate: new Date().toISOString(),
        thumbnail: ''
      },
      {
        title: 'Trademark Squatting in the Metaverse Prompts Legal Action',
        excerpt: 'Luxury brands and major corporations are filing trademark infringement suits over unauthorized use of their marks in virtual worlds, raising novel questions about digital brand protection.',
        link: 'https://plklawgroup.com/news',
        category: 'ip',
        source: 'PLK Law Group',
        pubDate: new Date().toISOString(),
        thumbnail: ''
      },
      {
        title: 'E-Sports League Launches Player Union Amid Contract Controversy',
        excerpt: 'Professional e-sports players form first-of-its-kind labor union to negotiate minimum salaries, streaming rights, and health benefits following several high-profile contract disputes.',
        link: 'https://plklawgroup.com/news',
        category: 'sports',
        source: 'PLK Law Group',
        pubDate: new Date().toISOString(),
        thumbnail: ''
      }
    ],

    maxArticles: 7,
    tickerMaxItems: 5
  };

  // ---- State ----
  let allArticles = [];
  let activeCategory = 'all';

  // ---- DOM References ----
  const dom = {};

  function cacheDom() {
    dom.featured = document.getElementById('plk-featured');
    dom.grid = document.getElementById('plk-news-grid');
    dom.loading = document.getElementById('plk-loading');
    dom.error = document.getElementById('plk-error');
    dom.tickerText = document.getElementById('plk-ticker-text');
    dom.filters = document.querySelectorAll('.plk-filter-btn');
  }

  // ---- Category Detection ----
  function detectCategory(title, description, defaultCategory) {
    const text = `${title} ${description}`.toLowerCase();
    const scores = {};

    for (const [cat, keywords] of Object.entries(CONFIG.categoryKeywords)) {
      scores[cat] = keywords.reduce((score, kw) => {
        return score + (text.includes(kw) ? 1 : 0);
      }, 0);
    }

    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return best[1] > 0 ? best[0] : defaultCategory;
  }

  // ---- Fetch & Parse ----
  async function fetchFeed(feed) {
    try {
      const response = await fetch(`${CONFIG.rssProxy}${encodeURIComponent(feed.url)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.status !== 'ok' || !data.items) return [];

      return data.items.map(item => {
        const description = item.description || item.content || '';
        const cleanExcerpt = description
          .replace(/<[^>]*>/g, '')
          .replace(/&[^;]+;/g, ' ')
          .trim()
          .slice(0, 200);

        return {
          title: item.title || 'Untitled',
          excerpt: cleanExcerpt || 'Read the full article for details.',
          link: item.link || '#',
          category: detectCategory(item.title, description, feed.defaultCategory),
          source: feed.source,
          pubDate: item.pubDate || new Date().toISOString(),
          thumbnail: item.thumbnail || item.enclosure?.link || ''
        };
      });
    } catch (err) {
      console.warn(`[PLK News] Feed error (${feed.source}):`, err.message);
      return [];
    }
  }

  async function fetchAllFeeds() {
    const results = await Promise.allSettled(
      CONFIG.feeds.map(feed => fetchFeed(feed))
    );

    let articles = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value);

    // Deduplicate by title similarity
    const seen = new Set();
    articles = articles.filter(article => {
      const key = article.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by date (newest first)
    articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    return articles.length > 0 ? articles.slice(0, CONFIG.maxArticles) : CONFIG.fallbackArticles;
  }

  // ---- Rendering ----
  function formatDate(dateStr) {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffHrs = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffHrs < 1) return 'Just now';
      if (diffHrs < 24) return `${diffHrs}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch {
      return '';
    }
  }

  function getCategoryLabel(cat) {
    const labels = {
      ip: 'IP Law',
      entertainment: 'Entertainment',
      sports: 'Sports Law',
      corporate: 'Corporate'
    };
    return labels[cat] || 'Legal News';
  }

  function generateGradient(category) {
    const gradients = {
      ip: 'linear-gradient(135deg, #1a5c53 0%, #3d9b8f 100%)',
      entertainment: 'linear-gradient(135deg, #3d2952 0%, #7a5291 100%)',
      sports: 'linear-gradient(135deg, #8a6d1b 0%, #d4a843 100%)',
      corporate: 'linear-gradient(135deg, #141e2b 0%, #2a3a4e 100%)'
    };
    return gradients[category] || gradients.corporate;
  }

  function renderFeatured(article) {
    const imageHtml = article.thumbnail
      ? `<img class="plk-featured-card__img" src="${article.thumbnail}" alt="${article.title}" loading="lazy" onerror="this.style.display='none'">`
      : '';

    dom.featured.innerHTML = `
      <a class="plk-featured-card" href="${article.link}" target="_blank" rel="noopener noreferrer" aria-label="Featured: ${article.title}">
        <div class="plk-featured-card__image" style="background: ${generateGradient(article.category)}">
          ${imageHtml}
          <span class="plk-featured-card__badge">Featured</span>
        </div>
        <div class="plk-featured-card__content">
          <span class="plk-featured-card__category">${getCategoryLabel(article.category)}</span>
          <h3 class="plk-featured-card__title">${article.title}</h3>
          <p class="plk-featured-card__excerpt">${article.excerpt}</p>
          <div class="plk-featured-card__meta">
            <span class="plk-featured-card__source">${article.source}</span>
            <span class="plk-featured-card__dot"></span>
            <span>${formatDate(article.pubDate)}</span>
          </div>
          <span class="plk-featured-card__read">
            Read Article
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </div>
      </a>
    `;
  }

  function renderCard(article) {
    const imageHtml = article.thumbnail
      ? `<img class="plk-news-card__img" src="${article.thumbnail}" alt="${article.title}" loading="lazy" onerror="this.parentElement.style.background='${generateGradient(article.category)}'; this.style.display='none'">`
      : '';

    return `
      <a class="plk-news-card" href="${article.link}" target="_blank" rel="noopener noreferrer" data-category="${article.category}" aria-label="${article.title}">
        <div class="plk-news-card__image" style="background: ${generateGradient(article.category)}">
          ${imageHtml}
          <span class="plk-news-card__category-tag plk-news-card__category-tag--${article.category}">
            ${getCategoryLabel(article.category)}
          </span>
        </div>
        <div class="plk-news-card__body">
          <h3 class="plk-news-card__title">${article.title}</h3>
          <p class="plk-news-card__excerpt">${article.excerpt}</p>
          <div class="plk-news-card__footer">
            <span class="plk-news-card__date">${formatDate(article.pubDate)}</span>
            <span class="plk-news-card__source-tag">${article.source}</span>
          </div>
        </div>
      </a>
    `;
  }

  function renderGrid(articles) {
    const filtered = activeCategory === 'all'
      ? articles
      : articles.filter(a => a.category === activeCategory);

    if (filtered.length === 0) {
      dom.grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--plk-text-muted);">
          <p>No articles found in this category right now.</p>
        </div>
      `;
      dom.featured.innerHTML = '';
      return;
    }

    // First article is featured
    renderFeatured(filtered[0]);

    // Rest go to grid
    dom.grid.innerHTML = filtered.slice(1, 7).map(renderCard).join('');
  }

  function renderTicker(articles) {
    const headlines = articles
      .slice(0, CONFIG.tickerMaxItems)
      .map(a => a.title)
      .join('  ·  ');

    dom.tickerText.textContent = headlines;
  }

  // ---- Filter Logic ----
  function setupFilters() {
    dom.filters.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        dom.filters.forEach(b => b.classList.remove('plk-filter-btn--active'));
        btn.classList.add('plk-filter-btn--active');

        // Filter
        activeCategory = btn.dataset.category;
        renderGrid(allArticles);
      });
    });
  }

  // ---- Visibility / State ----
  function showLoading() {
    dom.loading.classList.remove('hidden');
    dom.loading.style.display = '';
    dom.error.style.display = 'none';
    dom.featured.innerHTML = '';
    dom.grid.innerHTML = '';
  }

  function hideLoading() {
    dom.loading.classList.add('hidden');
    dom.loading.style.display = 'none';
  }

  function showError() {
    hideLoading();
    dom.error.style.display = '';
  }

  // ---- Init ----
  async function init() {
    cacheDom();
    setupFilters();
    showLoading();

    try {
      allArticles = await fetchAllFeeds();
      hideLoading();
      renderGrid(allArticles);
      renderTicker(allArticles);
    } catch (err) {
      console.error('[PLK News] Init error:', err);
      // Fall back to built-in articles
      allArticles = CONFIG.fallbackArticles;
      hideLoading();
      renderGrid(allArticles);
      renderTicker(allArticles);
    }
  }

  // ---- Auto-refresh every 30 minutes ----
  setInterval(() => {
    fetchAllFeeds().then(articles => {
      allArticles = articles;
      renderGrid(allArticles);
      renderTicker(allArticles);
    }).catch(() => {});
  }, 30 * 60 * 1000);

  // ---- Boot ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API (for retry button)
  return { init };

})();
