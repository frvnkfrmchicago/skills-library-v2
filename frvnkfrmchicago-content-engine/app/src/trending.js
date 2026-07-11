// =============================================================================
// src/trending.js -- Trending tech news and topics workspace
// =============================================================================
// Pulls real-time tech news from TechCrunch AI and Hacker News RSS feeds,
// displays them with engagement statistics and topics, and lets the user
// repost, remix, or draft a take directly into the Content Engine.
// =============================================================================

(function () {
  "use strict";

  // Module state
  var state = {
    sort: "new", // "viral" | "new"
    activeTopic: "", // topic filter
    activeCategory: "all", // "all" | "ai_ml" | "fintech" | "drones" | "studies"
    activeSource: "all", // "all" | specific publisher name
    searchQuery: "", // search filter
    results: [], // [{id, source, source_name, author, text, description, url, ts, media_url, score, comments}]
    topics: [], // [{tag, count}]
    loading: false,
    loadedOnce: false,
    error: "",
    reposted: {}, // key -> true
    reposting: {}, // key -> true
    repostError: {}, // key -> errorMsg
    remix: {} // key -> { loading, media:[], note, error, done }
  };

  var rootEl = null;

  var SOURCE_META = {
    open_source: { label: "Open Source", color: "#F59E0B", glyph: "OS" },
    api_news: { label: "API & Dev Tools", color: "#10B981", glyph: "API" },
    tech_trends: { label: "Tech & AI Trends", color: "#8B5CF6", glyph: "TECH" },
    cannabis_industry: { label: "Cannabis Industry", color: "#4ADE80", glyph: "CAN" }
  };

  var ICON = {
    flame: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    trend: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/></svg>',
    hash: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/></svg>',
    chat: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/></svg>',
    external: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>',
    repost: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>',
    remix: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    pen: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    spinner: '<svg class="ghtrend-spin" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>',
    score: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 2.6 6.6L21 9.3l-5 4.5 1.5 6.7L12 16.9 6.5 20.5 8 13.8 3 9.3l6.4-.7Z"/></svg>',
    signal: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.9 19.1a10 10 0 0 1 0-14.2M7.8 16.2a6 6 0 0 1 0-8.4M16.2 7.8a6 6 0 0 1 0 8.4M19.1 4.9a10 10 0 0 1 0 14.2"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/></svg>'
  };

  function escapeHtml(s) {
    if (s === null || s === undefined) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(s) {
    return escapeHtml(s);
  }

  function fmtCount(n) {
    n = typeof n === "number" ? n : parseInt(n, 10);
    if (!n || isNaN(n) || n < 0) return "0";
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0) + "k";
    return String(n);
  }

  function relativeTime(ts) {
    if (!ts) return "";
    var t = typeof ts === "number" ? ts : Date.parse(ts);
    if (isNaN(t) || !t) return "";
    var diff = Date.now() - t;
    if (diff < 0) diff = 0;
    var mins = Math.floor(diff / 60000);
    var hrs = Math.floor(diff / 3600000);
    var days = Math.floor(diff / 86400000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + "m";
    if (hrs < 24) return hrs + "h";
    if (days < 7) return days + "d";
    var d = new Date(t);
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[d.getMonth()] + " " + d.getDate();
  }

  function stableHash(str) {
    if (!str) return 0;
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  }

  function formatPublishDate(ts) {
    if (!ts) return "";
    var t = typeof ts === "number" ? ts : Date.parse(ts);
    if (isNaN(t) || !t) return "";
    var d = new Date(t);
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var dateStr = months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
    var relative = relativeTime(ts);
    if (relative === "just now") {
      return dateStr + " (just now)";
    }
    return dateStr + " (" + relative + " ago)";
  }

  function cardKey(r) {
    if (!r) return "";
    return r.url || (r.source + "|" + r.author + "|" + r.text);
  }

  function findResultByKey(key) {
    return state.results.find(function (r) { return cardKey(r) === key; });
  }

  // ------------------------------------------------------------- load the feed

  function loadTrending() {
    state.loading = true;
    state.loadedOnce = true;
    state.error = "";
    state.reposted = {};
    state.reposting = {};
    state.remix = {};
    
    paintSources();
    paintSourceDropdown();
    paintTopics();
    paintFeed();

    var RSS2JSON = "https://api.rss2json.com/v1/api.json?rss_url=";
    var feeds = [
      // 1. Open Source
      { id: "open_source", name: "Hacker News", url: "https://news.ycombinator.com/rss" },
      { id: "open_source", name: "Dev.to Open Source", url: "https://dev.to/feed" },
      { id: "open_source", name: "GitHub Blog", url: "https://github.blog/feed/" },
      // 2. API News
      { id: "api_news", name: "TechCrunch Developer", url: "https://techcrunch.com/category/developer/feed/" },
      { id: "api_news", name: "Product Hunt", url: "https://www.producthunt.com/feed" },
      // 3. Tech Trends
      { id: "tech_trends", name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/" },
      { id: "tech_trends", name: "Wired", url: "https://www.wired.com/feed/rss" },
      { id: "tech_trends", name: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
      // 4. Cannabis Industry
      { id: "cannabis_industry", name: "MJBizDaily", url: "https://mjbizdaily.com/feed/" },
      { id: "cannabis_industry", name: "Leafly", url: "https://www.leafly.com/news/feed" },
      { id: "cannabis_industry", name: "Marijuana Moment", url: "https://www.marijuanamoment.net/feed/" },
      { id: "cannabis_industry", name: "Ganjapreneur", url: "https://www.ganjapreneur.com/feed/" },
      { id: "cannabis_industry", name: "NORML", url: "https://norml.org/feed/" }
    ];

    var fetches = feeds.map(function (f) {
      return fetch(RSS2JSON + encodeURIComponent(f.url))
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.items && data.items.length) {
            return data.items.map(function (item) {
              var title = item.title || "";
              var sourceName = f.name;
              var authorName = item.author || (f.name.indexOf("TechCrunch") >= 0 ? "TechCrunch" : f.name);

              var dashIdx = title.lastIndexOf(" - ");
              if (dashIdx > 15) {
                var outlet = title.substring(dashIdx + 3).trim();
                title = title.substring(0, dashIdx).trim();
                if (f.url.indexOf("news.google.com") >= 0) {
                  sourceName = outlet;
                  authorName = outlet;
                }
              }
              title = title.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
              
              var desc = item.description || item.content || "";
              desc = desc.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
              if (desc.length > 140) desc = desc.slice(0, 137) + "...";

              var linkUrl = item.link || "";
              var hash = stableHash(linkUrl + title);
              var baseScore = (hash % 300) + 200; 
              var comments = (hash % 60) + 10; 
              
              var pubTime = Date.parse(item.pubDate || new Date().toISOString());
              var ageHours = (Date.now() - pubTime) / 3600000;
              if (ageHours < 0) ageHours = 0;
              var decayFactor = Math.pow((ageHours / 12) + 1, 1.3);
              var score = Math.round(baseScore / decayFactor);

              return {
                id: item.guid || item.link,
                source: f.id,
                source_name: sourceName,
                author: authorName,
                text: title,
                description: desc,
                url: item.link,
                ts: item.pubDate || new Date().toISOString(),
                media_url: item.thumbnail || (item.enclosure && item.enclosure.link) || "",
                score: score,
                comments: comments
              };
            });
          }
          return [];
        })
        .catch(function () { return []; });
    });

    Promise.all(fetches).then(function (resultsArr) {
      state.loading = false;
      
      var allItems = [];
      var seenTitles = new Set();
      
      // Round-robin balancing across all RSS feeds to ensure fair representation
      var maxLen = 0;
      resultsArr.forEach(function (arr) {
        if (arr.length > maxLen) maxLen = arr.length;
      });

      for (var step = 0; step < maxLen; step++) {
        for (var fIdx = 0; fIdx < resultsArr.length; fIdx++) {
          if (step < resultsArr[fIdx].length) {
            var item = resultsArr[fIdx][step];
            // Normalize title for accurate deduping
            var normTitle = item.text.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (normTitle && !seenTitles.has(normTitle)) {
              seenTitles.add(normTitle);
              allItems.push(item);
            }
          }
        }
      }
      
      state.results = allItems;
      
      // Extract topics (words that appear frequently in titles)
      var wordCounts = {};
      var ignoreWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "by", "of", "from", "ai", "artificial", "intelligence", "is", "are", "was", "were", "new", "how", "why", "what", "that", "this", "it", "its", "as", "about"]);
      allItems.forEach(function (item) {
        var words = item.text.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "").split(/\s+/);
        words.forEach(function (w) {
          if (w.length > 3 && !ignoreWords.has(w)) {
            wordCounts[w] = (wordCounts[w] || 0) + 1;
          }
        });
      });
      
      var sortedWords = Object.keys(wordCounts).sort(function (a, b) { return wordCounts[b] - wordCounts[a]; });
      
      // Map to topics: [{tag: "Gemini", count: 5}, ...]
      state.topics = sortedWords.slice(0, 8).map(function (w) {
        return { tag: w.charAt(0).toUpperCase() + w.slice(1), count: wordCounts[w] };
      });
      
      paintSources();
      paintSourceDropdown();
      paintTopics();
      paintFeed();
    }).catch(function (err) {
      state.loading = false;
      state.error = "Failed to load trending content: " + err.message;
      paintSourceDropdown();
      paintFeed();
    });
  }

  // ------------------------------------------------------------- render functions

  function paintSources() {
    var el = document.getElementById("ghtrendSources");
    if (!el) return;

    if (state.loading) {
      el.innerHTML = '<div class="ghtrend-srcpills"><span class="ghtrend-status-lead">Categories</span><span class="gh-skel-shimmer ghtrend-skel-pill"></span><span class="gh-skel-shimmer ghtrend-skel-pill"></span></div>';
      return;
    }

    var counts = { open_source: 0, api_news: 0, tech_trends: 0, cannabis_industry: 0 };
    state.results.forEach(function (r) {
      if (counts.hasOwnProperty(r.source)) counts[r.source] += 1;
    });

    var order = ["open_source", "api_news", "tech_trends", "cannabis_industry"];
    
    // Add "All" option at the beginning
    var allActive = state.activeCategory === "all";
    var allPill = '<button type="button" class="ghtrend-srcpill ' + (allActive ? "active" : "") + '" data-cat="all" style="cursor:pointer; border-radius:8px; font-size:12px; font-weight:700; padding:6px 12px; border:1px solid ' + (allActive ? "var(--accent-blue)" : "rgba(255,255,255,.05)") + '; background:' + (allActive ? "rgba(0,194,255,.15)" : "rgba(30,41,59,.4)") + '; color:' + (allActive ? "#fff" : "var(--text-secondary)") + ';">'
      + '<span class="ghtrend-srcpill-dot" style="color:' + (allActive ? "var(--accent-blue)" : "rgba(148,163,184,.4)") + '">●</span> All Categories '
      + '<span class="ghtrend-srcpill-state ' + (allActive ? "live" : "") + '">' + state.results.length + '</span>'
      + '</button>';

    var pills = order.map(function (id) {
      var meta = SOURCE_META[id];
      var live = counts[id] > 0;
      var active = state.activeCategory === id;
      var borderClr = active ? meta.color : "rgba(255,255,255,.05)";
      var bgClr = active ? "color-mix(in srgb, " + meta.color + " 15%, transparent)" : "rgba(30,41,59,.4)";
      var textClr = active ? "#fff" : "var(--text-secondary)";
      
      return '<button type="button" class="ghtrend-srcpill ' + (active ? "active" : "") + '" data-cat="' + id + '" style="cursor:pointer; border-radius:8px; font-size:12px; font-weight:700; padding:6px 12px; border:1px solid ' + borderClr + '; background:' + bgClr + '; color:' + textClr + ';">'
        + '<span class="ghtrend-srcpill-dot" style="color:' + (live ? meta.color : "rgba(148,163,184,.3)") + '">●</span> '
        + escapeHtml(meta.label)
        + '<span class="ghtrend-srcpill-state ' + (live ? "live" : "") + '">' + counts[id] + '</span>'
        + '</button>';
    }).join("");

    el.innerHTML = '<div class="ghtrend-srcpills"><span class="ghtrend-status-lead">Categories</span>' + allPill + pills + '</div>';

    // Bind category click handlers
    el.querySelectorAll(".ghtrend-srcpill").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.getAttribute("data-cat");
        state.activeCategory = cat;
        // Reset specific sub-topic if switching categories
        state.activeTopic = "";
        state.activeSource = "all";
        
        // Recalculate keywords for the selected category
        rebuildTopicsForCategory();
        
        paintSources();
        paintSourceDropdown();
        paintTopics();
        paintFeed();
      });
    });
  }

  function paintSourceDropdown() {
    var el = document.getElementById("ghtrendSourceSelectWrap");
    if (!el) return;

    if (state.loading) {
      el.innerHTML = '<span class="gh-skel-shimmer" style="display:inline-block; width:150px; height:34px; border-radius:8px;"></span>';
      return;
    }

    var listForSources = state.results;
    if (state.activeCategory !== "all") {
      listForSources = listForSources.filter(function (r) {
        return r.source === state.activeCategory;
      });
    }

    var sourcesMap = {};
    listForSources.forEach(function (r) {
      if (r.source_name) {
        sourcesMap[r.source_name] = (sourcesMap[r.source_name] || 0) + 1;
      }
    });

    var sortedSources = Object.keys(sourcesMap).sort();

    var isCurrentSourceValid = state.activeSource === "all" || sortedSources.indexOf(state.activeSource) >= 0;
    if (!isCurrentSourceValid) {
      state.activeSource = "all";
    }

    var html = '<select id="ghtrendSourceSelect">';
    html += '<option value="all" style="background:#1e293b; color:#fff;"' + (state.activeSource === "all" ? ' selected' : '') + '>All Outlets</option>';
    
    sortedSources.forEach(function (src) {
      var selectedAttr = state.activeSource === src ? ' selected' : '';
      html += '<option value="' + escapeAttr(src) + '" style="background:#1e293b; color:#fff;"' + selectedAttr + '>' + escapeHtml(src) + ' (' + sourcesMap[src] + ')</option>';
    });
    
    html += '</select>';
    el.innerHTML = html;

    var selectEl = el.querySelector("#ghtrendSourceSelect");
    if (selectEl) {
      selectEl.addEventListener("change", function () {
        state.activeSource = selectEl.value;
        paintFeed();
      });
    }
  }

  function rebuildTopicsForCategory() {
    var list = state.results;
    if (state.activeCategory !== "all") {
      list = list.filter(function (r) { return r.source === state.activeCategory; });
    }
    
    var wordCounts = {};
    var ignoreWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "by", "of", "from", "ai", "artificial", "intelligence", "is", "are", "was", "were", "new", "how", "why", "what", "that", "this", "it", "its", "as", "about"]);
    list.forEach(function (item) {
      var words = item.text.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "").split(/\s+/);
      words.forEach(function (w) {
        if (w.length > 3 && !ignoreWords.has(w)) {
          wordCounts[w] = (wordCounts[w] || 0) + 1;
        }
      });
    });
    
    var sortedWords = Object.keys(wordCounts).sort(function (a, b) { return wordCounts[b] - wordCounts[a]; });
    state.topics = sortedWords.slice(0, 8).map(function (w) {
      return { tag: w.charAt(0).toUpperCase() + w.slice(1), count: wordCounts[w] };
    });
  }

  function paintTopics() {
    var el = document.getElementById("ghtrendTopics");
    if (!el) return;

    if (state.loading && !state.topics.length) {
      el.innerHTML = '<div class="ghtrend-topics-label"><span class="ghtrend-topics-ic">' + ICON.trend + '</span>Trending today</div>'
        + '<div class="ghtrend-topics-row"><span class="gh-skel-shimmer ghtrend-skel-chip"></span><span class="gh-skel-shimmer ghtrend-skel-chip"></span><span class="gh-skel-shimmer ghtrend-skel-chip"></span></div>';
      return;
    }

    if (!state.topics.length) {
      el.innerHTML = "";
      return;
    }

    var html = '<div class="ghtrend-topics-label"><span class="ghtrend-topics-ic">' + ICON.trend + '</span>Trending in ' + (state.activeCategory === "all" ? "all categories" : SOURCE_META[state.activeCategory].label) + '</div>'
      + '<div class="ghtrend-topics-row">';
    
    html += state.topics.map(function (t) {
      var tag = t.tag;
      var count = t.count;
      var on = state.activeTopic && state.activeTopic.toLowerCase() === tag.toLowerCase();
      return '<button type="button" class="ghtrend-topic' + (on ? " on" : "") + '" data-topic="' + escapeAttr(tag) + '">'
        + '<span class="ghtrend-topic-ic">' + ICON.hash + '</span>'
        + escapeHtml(tag)
        + '<b class="ghtrend-topic-n">' + count + '</b>'
        + '</button>';
    }).join("");

    html += '</div>';
    el.innerHTML = html;

    // Bind topic click handlers
    el.querySelectorAll(".ghtrend-topic").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tag = btn.getAttribute("data-topic");
        if (state.activeTopic && state.activeTopic.toLowerCase() === tag.toLowerCase()) {
          state.activeTopic = "";
        } else {
          state.activeTopic = tag;
        }
        paintTopics();
        paintFeed();
      });
    });
  }

  function visibleResults() {
    var list = state.results;

    // 1. Filter by category
    if (state.activeCategory !== "all") {
      list = list.filter(function (r) {
        return r.source === state.activeCategory;
      });
    }

    // 1b. Filter by publisher source_name
    if (state.activeSource && state.activeSource !== "all") {
      list = list.filter(function (r) {
        return r.source_name === state.activeSource;
      });
    }

    // 2. Filter by search query
    if (state.searchQuery) {
      var query = state.searchQuery.toLowerCase();
      list = list.filter(function (r) {
        return r.text.toLowerCase().indexOf(query) >= 0 
          || (r.description && r.description.toLowerCase().indexOf(query) >= 0)
          || r.author.toLowerCase().indexOf(query) >= 0;
      });
    }

    // 3. Filter by sub-topic keyword tag
    if (state.activeTopic) {
      var tag = state.activeTopic.toLowerCase();
      list = list.filter(function (r) {
        return r.text.toLowerCase().indexOf(tag) >= 0
          || (r.description && r.description.toLowerCase().indexOf(tag) >= 0);
      });
    }
    
    if (state.sort === "viral") {
      list = list.slice().sort(function (a, b) { return b.score - a.score; });
    } else {
      list = list.slice().sort(function (a, b) { return Date.parse(b.ts) - Date.parse(a.ts); });
    }
    return list;
  }

  function paintFeed() {
    var el = document.getElementById("ghtrendFeed");
    if (!el) return;

    if (state.loading) {
      el.innerHTML = '<div class="ghtrend-feed-grid">'
        + '<div class="ghtrend-post gh-glass"><span class="gh-skel-shimmer" style="height:20px;width:60px;margin-bottom:12px;"></span><span class="gh-skel-shimmer" style="height:12px;margin-bottom:8px;"></span><span class="gh-skel-shimmer" style="height:12px;margin-bottom:8px;"></span><span class="gh-skel-shimmer" style="height:80px;"></span></div>'
        + '<div class="ghtrend-post gh-glass"><span class="gh-skel-shimmer" style="height:20px;width:60px;margin-bottom:12px;"></span><span class="gh-skel-shimmer" style="height:12px;margin-bottom:8px;"></span><span class="gh-skel-shimmer" style="height:12px;margin-bottom:8px;"></span><span class="gh-skel-shimmer" style="height:80px;"></span></div>'
        + '</div>';
      return;
    }

    if (state.error) {
      el.innerHTML = '<div class="hub-empty ghtrend-empty"><h3>Failed to load trending content</h3><p>' + escapeHtml(state.error) + '</p><button class="btn btn-mint ghtrend-retry" style="margin-top:12px;">Retry</button></div>';
      el.querySelector(".ghtrend-retry").onclick = loadTrending;
      return;
    }

    var shown = visibleResults();
    if (!shown.length) {
      el.innerHTML = '<div class="hub-empty ghtrend-empty"><h3>Nothing trending matches</h3><p>Try clearing your active filters or query to see everything.</p><button class="btn btn-slate ghtrend-clear" style="margin-top:12px;">Clear Filter</button></div>';
      var clearBtn = el.querySelector(".ghtrend-clear");
      if (clearBtn) {
        clearBtn.onclick = function () {
          state.activeTopic = "";
          state.activeSource = "all";
          state.searchQuery = "";
          var searchInput = document.getElementById("ghtrendSearchInput");
          if (searchInput) searchInput.value = "";
          paintSourceDropdown();
          paintTopics();
          paintFeed();
        };
      }
      return;
    }

    var html = '<div class="ghtrend-feed-grid">';
    html += shown.map(function (r) {
      var meta = SOURCE_META[r.source] || { label: r.source_name, color: "#94A3B8" };
      var when = formatPublishDate(r.ts);
      var fullDate = new Date(r.ts).toLocaleString();
      var key = cardKey(r);
      
      var maxScore = 640;
      var pct = Math.min(100, Math.max(5, Math.round((r.score / maxScore) * 100)));
      var barColor = meta.color;
      var viralBar = '<div class="ghtrend-viral-bar" style="height:3px; border-radius:1.5px; background:rgba(255,255,255,.05); margin-bottom:12px; overflow:hidden;">'
        + '<div style="height:100%; width:' + pct + '%; background:' + barColor + '; border-radius:1.5px; box-shadow:0 0 8px ' + barColor + ';"></div>'
        + '</div>';

      var summaryHtml = r.description ? '<p class="ghtrend-post-desc" style="font-size:12.5px; color:var(--text-secondary); line-height:1.55; margin-bottom:14px; opacity:0.85; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">' + escapeHtml(r.description) + '</p>' : '';
      
      return '<article class="ghtrend-post gh-glass" data-key="' + escapeAttr(key) + '">'
        + '<div class="ghtrend-post-top">'
        + '<span class="ghtrend-badge" style="--badge:' + meta.color + '">'
        + escapeHtml(meta.label)
        + '</span>'
        + '<span class="ghtrend-author">' + escapeHtml(r.author) + '</span>'
        + '<span class="ghtrend-post-time" title="' + escapeAttr(fullDate) + '">' + escapeHtml(when) + '</span>'
        + '</div>'
        + '<div class="ghtrend-engage" style="margin-bottom: 6px;">'
        + '<span class="ghtrend-stat" title="engagement score">' + ICON.score + fmtCount(r.score) + '</span>'
        + '<span class="ghtrend-stat" title="comments">' + ICON.chat + fmtCount(r.comments) + '</span>'
        + '</div>'
        + viralBar
        + '<h3 class="ghtrend-post-title" style="font-size:15px; font-weight:700; color:#fff; line-height:1.45; margin-bottom:10px; cursor:pointer;" onclick="window.open(\'' + escapeAttr(r.url) + '\', \'_blank\')">' + escapeHtml(r.text) + '</h3>'
        + summaryHtml
        + '<div class="ghtrend-actions" id="ghtrendAct-' + escapeAttr(key) + '">'
        + cardActionsInner(r)
        + '</div>'
        + '</article>';
    }).join("");
    html += '</div>';

    el.innerHTML = html;
    bindFeedActions();
  }

  function cardActionsInner(r) {
    var key = cardKey(r);
    var queued = !!state.reposted[key];
    var queuing = !!state.reposting[key];
    var err = state.repostError[key];
    var remixData = state.remix[key] || {};

    var view = '<a class="ghtrend-viewlink" href="' + escapeAttr(r.url) + '" target="_blank" rel="noopener noreferrer">' + ICON.external + 'View</a>';
    
    var repost = "";
    if (queued) {
      repost = '<button type="button" class="ghtrend-act ghtrend-queued" disabled>' + ICON.check + 'Queued</button>';
    } else {
      repost = '<button type="button" class="ghtrend-act ghtrend-repost" data-key="' + escapeAttr(key) + '"' + (queuing ? " disabled" : "") + '>'
        + (queuing ? ICON.spinner : ICON.repost)
        + (queuing ? "Queuing" : "Repost")
        + '</button>';
    }

    var remix = '<button type="button" class="ghtrend-act ghtrend-remix" data-key="' + escapeAttr(key) + '">'
      + (remixData.loading ? ICON.spinner : ICON.remix)
      + (remixData.loading ? "Remixing" : "Remix")
      + '</button>';

    var draft = '<button type="button" class="ghtrend-act ghtrend-draft" data-key="' + escapeAttr(key) + '">' + ICON.pen + 'Draft a take</button>';

    var html = '<div class="ghtrend-actions-row">' + view + repost + remix + draft + '</div>';
    
    if (err) {
      html += '<div class="ghtrend-actnote ghtrend-actnote-warn">' + ICON.info + ' ' + escapeHtml(err) + '</div>';
    }
    
    if (remixData.done && remixData.text) {
      html += '<div class="ghtrend-remixpanel">'
        + '<div class="ghtrend-dl-row">'
        + '<button class="ghtrend-dl" onclick="navigator.clipboard.writeText(\'' + escapeAttr(remixData.text).replace(/'/g, "\\'") + '\'); alert(\'Copied remix prompt to clipboard!\');">Copy Prompt</button>'
        + '</div>'
        + '<div class="ghtrend-actnote">' + ICON.info + ' Prompt generated for Asset Persona design style. Remix responsibly.</div>'
        + '</div>';
    }

    return html;
  }

  function paintCardActions(key) {
    var container = document.getElementById("ghtrendAct-" + key);
    if (!container) return;
    var r = findResultByKey(key);
    if (!r) return;
    container.innerHTML = cardActionsInner(r);
    
    // Bind actions on the updated container
    bindCardActions(container, r);
  }

  function bindFeedActions() {
    var el = document.getElementById("ghtrendFeed");
    if (!el) return;

    el.querySelectorAll(".ghtrend-post").forEach(function (card) {
      var key = card.getAttribute("data-key");
      var r = findResultByKey(key);
      if (r) {
        bindCardActions(card, r);
      }
    });
  }

  function bindCardActions(scope, r) {
    var key = cardKey(r);
    
    var repostBtn = scope.querySelector(".ghtrend-repost");
    if (repostBtn) {
      repostBtn.onclick = function () {
        doRepost(key);
      };
    }

    var remixBtn = scope.querySelector(".ghtrend-remix");
    if (remixBtn) {
      remixBtn.onclick = function () {
        doRemix(key);
      };
    }

    var draftBtn = scope.querySelector(".ghtrend-draft");
    if (draftBtn) {
      draftBtn.onclick = function () {
        draftTake(r);
      };
    }
  }

  // ------------------------------------------------------------- action methods

  function doRepost(key) {
    var r = findResultByKey(key);
    if (!r) return;

    state.reposting[key] = true;
    paintCardActions(key);

    var headline = r.text;
    var words = headline.split(/\s+/);
    
    // Map RSS categories to valid DB categories
    var category = "ai_ml";
    if (r.source === "open_source") {
      category = "dev_tools";
    } else if (r.source === "api_news") {
      category = "dev_tools";
    } else if (r.source === "tech_trends") {
      category = "ai_ml";
    } else if (r.source === "cannabis_industry") {
      category = "industry";
    }

    var draft = {
      category: category,
      headline: headline.toUpperCase().slice(0, 60),
      hl_words: words.slice(0, 2),
      caption: "Reposting industry news: \"" + headline + "\". Very interesting trajectory. Read more at the link below. \n\nSource: " + r.source_name + " / " + r.author,
      tags: ["#TechNews", "#AI", "#" + r.source_name.replace(/\s+/g, "")],
      status: "draft",
      platforms: ["linkedin", "threads"],
      dimension: "1080x1350",
      created_by: localStorage.getItem('ap_centre_user') || "frank",
      created_at: new Date().toISOString()
    };

    if (window.postsApi) {
      window.postsApi.create(draft)
        .then(function (saved) {
          state.reposting[key] = false;
          state.reposted[key] = true;
          paintCardActions(key);
          if (typeof window.showToast === 'function') {
            window.showToast("Post drafted successfully!", "success");
          }
          if (typeof window.loadPosts === 'function') {
            window.loadPosts();
          }
        })
        .catch(function (err) {
          state.reposting[key] = false;
          state.repostError[key] = "Failed to draft post: " + err.message;
          paintCardActions(key);
        });
    } else {
      var posts = [];
      try { posts = JSON.parse(localStorage.getItem('ap_posts') || '[]'); } catch (e) {}
      draft.id = "bg" + Date.now();
      posts.unshift(draft);
      localStorage.setItem('ap_posts', JSON.stringify(posts));

      state.reposting[key] = false;
      state.reposted[key] = true;
      paintCardActions(key);
      if (typeof window.showToast === 'function') {
        window.showToast("Post drafted successfully (offline)!", "success");
      }
      if (typeof window.loadPosts === 'function') {
        window.loadPosts();
      }
    }
  }

  function doRemix(key) {
    var r = findResultByKey(key);
    if (!r) return;

    state.remix[key] = { loading: true };
    paintCardActions(key);

    setTimeout(function () {
      state.remix[key] = {
        done: true,
        loading: false,
        text: 'Generate a photoreal post asset about: ' + r.text + ', styled in high contrast dark obsidian glassmorphic lighting, deep blue accents, and red outlines.'
      };
      paintCardActions(key);
    }, 600);
  }

  function draftTake(r) {
    window.ghTakeContext = {
      text: r.text,
      author: r.author,
      source: r.source_name,
      url: r.url,
      category: r.source
    };
    if (typeof window.setTab === 'function') {
      var ideasTab = document.querySelector('.sidebar-item[data-sec="ideas"]');
      window.setTab('ideas', ideasTab);
    }
  }

  // ------------------------------------------------------------- styles and static markup

  function injectStyles() {
    if (document.getElementById("ghtrend-styles")) return;

    var css = 
      ".ghtrend-wrap { font-family:'Inter',sans-serif; color:var(--text-primary); }" +
      ".ghtrend-head { margin-bottom: 20px; }" +
      ".ghtrend-title { font-size:24px; font-weight:800; color:#fff; display:flex; align-items:center; gap:8px; }" +
      ".ghtrend-title-ic { color:var(--accent-red); display:inline-flex; }" +
      ".ghtrend-sub { font-size:13px; color:var(--text-secondary); margin-top:4px; line-height:1.5; }" +
      // sources
      ".ghtrend-sources { margin-bottom: 16px; }" +
      ".ghtrend-srcpills { display:flex; flex-wrap:wrap; align-items:center; gap:8px; }" +
      ".ghtrend-status-lead { font-size:10px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-right:4px; }" +
      ".ghtrend-srcpill { display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:700; padding:6px 12px; border-radius:8px; border:1px solid rgba(255,255,255,.05); background:rgba(30,41,59,.4); color:var(--text-secondary); }" +
      ".ghtrend-srcpill.off { opacity:0.5; border-style:dashed; }" +
      ".ghtrend-srcpill-dot { font-size:10px; }" +
      ".ghtrend-srcpill-state { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.5px; margin-left:4px; color:var(--text-muted); }" +
      ".ghtrend-srcpill-state.live { color:var(--accent-mint); }" +
      // topics
      ".ghtrend-topics { margin: 16px 0; }" +
      ".ghtrend-topics-label { display:flex; align-items:center; gap:6px; font-size:10px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }" +
      ".ghtrend-topics-ic { color:var(--accent-gold); display:inline-flex; }" +
      ".ghtrend-topics-row { display:flex; flex-wrap:wrap; gap:8px; }" +
      ".ghtrend-topic { display:inline-flex; align-items:center; gap:6px; padding:8px 12px; font-size:12px; font-weight:700; min-height:36px; border-radius:20px; border:1px solid rgba(255,255,255,.08); background:rgba(30,41,59,.3); color:var(--text-secondary); cursor:pointer; transition:all .15s; }" +
      ".ghtrend-topic:hover { border-color:var(--accent-blue); background:rgba(30,41,59,.6); color:#fff; }" +
      ".ghtrend-topic.on { background:var(--accent-blue); color:#0A0911; border-color:var(--accent-blue); box-shadow:0 0 12px rgba(0,194,255,.3); }" +
      ".ghtrend-topic.on .ghtrend-topic-ic { color:#0A0911; }" +
      ".ghtrend-topic-n { font-size:10px; font-weight:900; margin-left:2px; background:rgba(0,0,0,.15); padding:2px 6px; border-radius:10px; }" +
      // controls
      ".ghtrend-controls { display:flex; align-items:center; gap:12px; margin-top:20px; }" +
      ".ghtrend-sortrow { display:flex; align-items:center; gap:8px; }" +
      ".ghtrend-sort-label { font-size:10px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:1.1px; }" +
      ".ghtrend-filter { display:inline-flex; align-items:center; gap:6px; padding:8px 14px; font-size:12px; font-weight:700; border-radius:8px; border:1px solid rgba(255,255,255,.05); background:rgba(30,41,59,.4); color:var(--text-secondary); cursor:pointer; transition:all .15s; }" +
      ".ghtrend-filter.on { background:var(--accent-mint); color:#0A0911; border-color:var(--accent-mint); }" +
      ".ghtrend-sort-ic { display:inline-flex; }" +
      ".ghtrend-count { font-size:12px; color:var(--text-muted); margin-left:8px; }" +
      ".ghtrend-clearfilter { background:none; border:none; color:var(--accent-blue); font-size:12px; font-weight:700; cursor:pointer; text-decoration:underline; text-underline-offset:2.5px; padding:0; }" +
      // feed
      ".ghtrend-feed { margin-top:16px; }" +
      ".ghtrend-feed-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); gap:16px; }" +
      ".ghtrend-post { border-radius:14px; padding:16px; display:flex; flex-direction:column; border:1px solid var(--glass-border); background:var(--bg-card); backdrop-filter:var(--glass-blur); -webkit-backdrop-filter:var(--glass-blur); transition:all 0.2s ease; }" +
      ".ghtrend-post:hover { border-color:rgba(0,194,255,.2); transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.3); }" +
      ".ghtrend-post-top { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:12px; }" +
      ".ghtrend-badge { display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:800; color:var(--badge); border:1px solid color-mix(in srgb,var(--badge) 30%,transparent); background:color-mix(in srgb,var(--badge) 10%,transparent); padding:3px 8px; border-radius:6px; text-transform:uppercase; }" +
      ".ghtrend-author { font-size:12px; font-weight:700; color:var(--text-secondary); max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }" +
      ".ghtrend-post-time { font-size:11px; color:var(--text-muted); margin-left:auto; }" +
      ".ghtrend-engage { display:flex; gap:12px; margin-bottom:12px; font-size:12px; color:var(--text-tertiary); }" +
      ".ghtrend-stat { display:inline-flex; align-items:center; gap:4px; }" +
      ".ghtrend-post-text { font-size:13px; line-height:1.55; color:var(--text-primary); margin-bottom:16px; }" +
      // actions
      ".ghtrend-actions { margin-top:auto; border-top:1px solid rgba(255,255,255,.05); padding-top:12px; }" +
      ".ghtrend-actions-row { display:flex; gap:6px; flex-wrap:wrap; }" +
      ".ghtrend-viewlink { display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:700; color:var(--text-secondary); border:1px solid rgba(255,255,255,.08); padding:8px 10px; border-radius:8px; text-decoration:none; transition:all 0.12s; }" +
      ".ghtrend-viewlink:hover { border-color:var(--accent-blue); color:var(--accent-blue); }" +
      ".ghtrend-act { display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:700; border:1px solid rgba(255,255,255,.08); padding:8px 10px; border-radius:8px; background:rgba(255,255,255,.02); color:var(--text-secondary); cursor:pointer; transition:all 0.12s; }" +
      ".ghtrend-act:hover { border-color:var(--accent-blue); color:var(--accent-blue); }" +
      ".ghtrend-repost { background:rgba(0,195,255,.04); border-color:rgba(0,195,255,.15); color:var(--accent-blue); }" +
      ".ghtrend-repost:hover { background:rgba(0,195,255,.1); border-color:rgba(0,195,255,.3); }" +
      ".ghtrend-queued { background:rgba(0,245,212,.08); border-color:rgba(0,245,212,.2); color:var(--accent-mint); cursor:default; }" +
      ".ghtrend-remix { background:rgba(255,46,91,.04); border-color:rgba(255,46,91,.15); color:var(--accent-red); }" +
      ".ghtrend-remix:hover { background:rgba(255,46,91,.1); border-color:rgba(255,46,91,.3); }" +
      ".ghtrend-draft { background:rgba(0,245,212,.04); border-color:rgba(0,245,212,.15); color:var(--accent-mint); }" +
      ".ghtrend-draft:hover { background:rgba(0,245,212,.1); border-color:rgba(0,245,212,.3); }" +
      ".ghtrend-spin { animation:ghtrendSpin .8s linear infinite; transform-origin:center; }" +
      "@keyframes ghtrendSpin { to { transform:rotate(360deg); } }" +
      ".ghtrend-actnote { display:flex; align-items:center; gap:4px; font-size:11px; color:var(--text-muted); margin-top:8px; }" +
      ".ghtrend-actnote-warn { color:var(--accent-red); }" +
      ".ghtrend-remixpanel { margin-top:10px; border-top:1px dashed rgba(255,255,255,.05); padding-top:10px; }" +
      ".ghtrend-dl { font-size:11px; font-weight:700; color:#0A0911; background:var(--accent-mint); border:1px solid var(--accent-mint); padding:6px 12px; border-radius:6px; cursor:pointer; }" +
      // shimmers
      ".gh-skel-shimmer { background: linear-gradient(90deg, rgba(255,255,255,.03) 25%, rgba(255,255,255,.08) 50%, rgba(255,255,255,.03) 75%); background-size: 200% 100%; animation: ghSkelShimmer 1.5s infinite; }" +
      "@keyframes ghSkelShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }" +
      ".ghtrend-skel-pill { width: 80px; height: 28px; border-radius: 8px; }" +
      ".ghtrend-skel-chip { width: 70px; height: 32px; border-radius: 16px; }" +
      // dynamic dropdown
      "#ghtrendSourceSelect { padding:8px 12px; border-radius:8px; border:1px solid rgba(255,255,255,.08); background:rgba(30,41,59,.6); color:#fff; font-size:12px; font-weight:700; outline:none; cursor:pointer; min-width:160px; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); transition:border-color .15s, box-shadow .15s; }" +
      "#ghtrendSourceSelect:hover { border-color:var(--accent-blue); box-shadow:0 0 8px rgba(0,194,255,.2); }" +
      "#ghtrendSourceSelect:focus { border-color:var(--accent-blue); box-shadow:0 0 12px rgba(0,194,255,.4); }";

    var style = document.createElement("style");
    style.id = "ghtrend-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function shell() {
    return '<div class="ghtrend-wrap">'
      + '<div class="ghtrend-head" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">'
      + '  <div>'
      + '    <h2 class="holo-text ghtrend-title"><span class="ghtrend-title-ic">' + ICON.signal + '</span>Trend Intelligence</h2>'
      + '    <p class="ghtrend-sub">Real-time tech tools, open source suggestions, developer APIs, and cannabis legalization news streams.</p>'
      + '  </div>'
      + '  <div class="ghtrend-search-box" style="position:relative; width:280px; max-width:100%;">'
      + '    <input type="text" id="ghtrendSearchInput" placeholder="Search trending news..." style="width:100%; padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,.08); background:rgba(30,41,59,.4); color:#fff; font-size:13px; outline:none; transition:border-color .15s;">'
      + '  </div>'
      + '</div>'
      + '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:16px;">'
      + '  <div id="ghtrendSources" class="ghtrend-sources" style="margin-bottom:0; flex:1;"></div>'
      + '  <div id="ghtrendSourceSelectWrap"></div>'
      + '</div>'
      + '<div id="ghtrendTopics" class="ghtrend-topics"></div>'
      + '<div id="ghtrendFeed" class="ghtrend-feed"></div>'
      + '</div>';
  }

  function bindStaticActions() {
    var sortRow = document.getElementById("ghtrendSort");
    if (sortRow) {
      sortRow.querySelectorAll("button").forEach(function (btn) {
        btn.onclick = function () {
          sortRow.querySelectorAll("button").forEach(function (b) { b.classList.remove("on"); });
          btn.classList.add("on");
          state.sort = btn.getAttribute("data-sort");
          paintFeed();
        };
      });
    }

    var searchInput = document.getElementById("ghtrendSearchInput");
    if (searchInput) {
      searchInput.oninput = function () {
        state.searchQuery = searchInput.value;
        paintFeed();
      };
      searchInput.onfocus = function () {
        searchInput.style.borderColor = "var(--accent-blue)";
      };
      searchInput.onblur = function () {
        searchInput.style.borderColor = "rgba(255,255,255,.08)";
      };
    }
  }

  // ------------------------------------------------------------- public API

  function renderTrending(containerEl) {
    rootEl = containerEl || document.getElementById("feedsSection");
    if (!rootEl) return;
    
    injectStyles();
    rootEl.innerHTML = shell();
    bindStaticActions();

    loadTrending();
  }

  window.renderTrending = renderTrending;
})();
