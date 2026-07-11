// =============================================================================
// src/posts-api.js -- CRUD wrapper for Agentic Centre
// =============================================================================
// Exposes window.postsApi with:
//   postsApi.ready()                   -> boolean
//   postsApi.list()                    -> Promise<Post[]>
//   postsApi.create(post)              -> Promise<Post>
//   postsApi.update(id, partial)       -> Promise<Post>
//   postsApi.remove(id)                -> Promise<true>
//   postsApi.transitionStatus(id, newStatus) -> Promise<Post>
//
// Falls back to localStorage when Supabase is unavailable.
// =============================================================================

(function () {
  'use strict';

  var STORAGE_KEY = 'ap_posts';

  // Valid status transitions
  var VALID_TRANSITIONS = {
    draft:     ['pending', 'approved'],
    pending:   ['draft', 'approved'],
    approved:  ['scheduled', 'published', 'pending'],
    scheduled: ['approved', 'published', 'pending'],
    published: ['pending']
  };

  var CATEGORIES = {
    ai_ml:           { label: 'AI / ML',            color: '#00C2FF' },
    ai_education:    { label: 'AI in Education',    color: '#38BDF8' },
    ai_finance:      { label: 'AI in Finance',      color: '#818CF8' },
    ai_health:       { label: 'AI in Health',       color: '#F472B6' },
    ai_public_health:{ label: 'AI in Public Health', color: '#34D399' },
    ai_dentistry:    { label: 'AI in Dentistry',    color: '#FB923C' },
    dev_tools:       { label: 'Dev Tools',          color: '#60A5FA' },
    career:          { label: 'Career',             color: '#FBBF24' },
    culture:         { label: 'Culture',            color: '#FF2E5B' },
    creative:        { label: 'Creative',           color: '#10B981' },
    industry:        { label: 'Industry',           color: '#00F5D4' }
  };

  function getClient() {
    return window.apSupabase || null;
  }

  // ---- localStorage helpers ----
  function loadCache() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveCache(posts) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (e) { /* quota exceeded, etc */ }
  }

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  // ---- API ----
  var api = {
    CATEGORIES: CATEGORIES,

    ready: function () {
      return !!getClient();
    },

    /**
     * List all posts, newest first.
     */
    list: async function () {
      var sb = getClient();
      if (!sb) {
        return loadCache();
      }

      var res = await sb
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (res.error) throw res.error;
      var posts = res.data || [];
      for (var i = 0; i < posts.length; i++) {
        if (posts[i].img_url && !posts[i].image_url) {
          posts[i].image_url = posts[i].img_url;
        }
      }
      saveCache(posts);
      return posts;
    },

    /**
     * List all ingested feed items, newest first.
     */
    listIngestItems: async function () {
      var sb = getClient();
      if (!sb) {
        return [
          {
            id: 'mock-1',
            title: 'Google Announces Gemini 2.0 and Zhipu Partnership',
            summary: 'A deep collaboration in building the next generation of multilingual large language models.',
            source_name: 'TechCrunch',
            published_at: new Date().toISOString(),
            category_hint: 'ai_ml',
            item_url: 'https://techcrunch.com/'
          },
          {
            id: 'mock-2',
            title: 'AI in Education: How tutoring systems are shifting classroom dynamics',
            summary: 'Using GLM 5.1 agents for automated student guidance and personalized homework feedback.',
            source_name: 'VentureBeat',
            published_at: new Date(Date.now() - 3600000).toISOString(),
            category_hint: 'ai_education',
            item_url: 'https://venturebeat.com/'
          }
        ];
      }

      var res = await sb
        .from('ingest_items')
        .select('*')
        .order('published_at', { ascending: false });

      if (res.error) throw res.error;
      return res.data || [];
    },

    /**
     * Create a new post.
     */
    create: async function (post) {
      post.id = post.id || uuid();
      post.status = post.status || 'pending';
      post.created_at = post.created_at || new Date().toISOString();

      if (post.image_url && !post.img_url) post.img_url = post.image_url;
      if (post.img_url && !post.image_url) post.image_url = post.img_url;

      var sb = getClient();
      if (!sb) {
        var cached = loadCache();
        cached.unshift(post);
        saveCache(cached);
        return post;
      }

      var res = await sb.from('posts').insert(post).select().single();
      if (res.error) throw res.error;
      var created = res.data;
      if (created && created.img_url && !created.image_url) {
        created.image_url = created.img_url;
      }
      return created;
    },

    /**
     * Update a post by id (partial update).
     */
    update: async function (id, partial) {
      if (partial.image_url !== undefined && partial.img_url === undefined) {
        partial.img_url = partial.image_url;
      }
      if (partial.img_url !== undefined && partial.image_url === undefined) {
        partial.image_url = partial.img_url;
      }

      var sb = getClient();
      if (!sb) {
        var cached = loadCache();
        var idx = -1;
        for (var i = 0; i < cached.length; i++) {
          if (cached[i].id === id) { idx = i; break; }
        }
        if (idx >= 0) {
          Object.assign(cached[idx], partial);
          saveCache(cached);
          return cached[idx];
        }
        throw new Error('Post not found: ' + id);
      }

      var res = await sb.from('posts').update(partial).eq('id', id).select().single();
      if (res.error) throw res.error;
      var updated = res.data;
      if (updated && updated.img_url && !updated.image_url) {
        updated.image_url = updated.img_url;
      }
      return updated;
    },

    /**
     * Delete a post by id.
     */
    remove: async function (id) {
      var cached = loadCache();
      saveCache(cached.filter(function (p) { return p.id !== id; }));

      var sb = getClient();
      if (!sb) {
        return true;
      }

      var res = await sb.from('posts').delete().eq('id', id);
      if (res.error) throw res.error;
      return true;
    },

    /**
     * Transition a post status with validation.
     */
    transitionStatus: async function (id, newStatus) {
      var posts = loadCache();
      var post = null;
      for (var i = 0; i < posts.length; i++) {
        if (posts[i].id === id) { post = posts[i]; break; }
      }
      if (!post) throw new Error('Post not found: ' + id);

      var allowed = VALID_TRANSITIONS[post.status] || [];
      if (allowed.indexOf(newStatus) === -1) {
        throw new Error(
          'Invalid transition: ' + post.status + ' -> ' + newStatus +
          '. Allowed: ' + allowed.join(', ')
        );
      }

      var patch = { status: newStatus };
      if (newStatus === 'published') {
        patch.published_at = new Date().toISOString();
      }

      return api.update(id, patch);
    },

    /**
     * Filter posts by criteria.
     */
    filter: function (posts, opts) {
      var result = posts.slice();

      if (opts.category && opts.category !== 'all') {
        result = result.filter(function (p) { return p.category === opts.category; });
      }

      if (opts.status && opts.status !== 'all') {
        result = result.filter(function (p) { return p.status === opts.status; });
      }

      if (opts.platform) {
        result = result.filter(function (p) {
          return p.platforms && p.platforms.indexOf(opts.platform) >= 0;
        });
      }

      if (opts.search) {
        var q = opts.search.toLowerCase();
        result = result.filter(function (p) {
          return (p.headline || '').toLowerCase().indexOf(q) >= 0 ||
                 (p.caption || '').toLowerCase().indexOf(q) >= 0;
        });
      }

      return result;
    },

    /**
     * Sort posts.
     */
    sort: function (posts, by) {
      var sorted = posts.slice();
      if (by === 'oldest') {
        sorted.sort(function (a, b) {
          return new Date(a.created_at) - new Date(b.created_at);
        });
      } else if (by === 'status') {
        var order = { published: 0, approved: 1, pending: 2, draft: 3 };
        sorted.sort(function (a, b) {
          return (order[a.status] || 5) - (order[b.status] || 5);
        });
      } else {
        // newest (default)
        sorted.sort(function (a, b) {
          return new Date(b.created_at) - new Date(a.created_at);
        });
      }
      return sorted;
    }
  };

  // Expose globally
  window.postsApi = api;
})();
