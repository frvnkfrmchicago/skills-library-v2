// admin-content-hub.tsx
// Example implementation of a Content Hub admin dashboard.
// This is a reference component, not production code.
// Adapt to your framework (React, Next.js, Vue, Svelte).

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Post {
  id: string;
  system: string;
  headline: string;
  hl_words: string[];
  cap: string;
  tags: string[];
  img: string;
  bg_url: string;
  img_prompt: string;
  status: 'pending' | 'approved' | 'published';
  assignee: string | null;
  created_by: string;
  source: 'manual' | 'ai-single' | 'ai-batch' | 'n8n-cron';
  published_at: string | null;
  publish_result: Record<string, { success: boolean; id?: string; error?: string }> | null;
  created_at: string;
}

interface Comment {
  id: string;
  post_id: string;
  author: string;
  text: string;
  created_at: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: 'admin' | 'editor' | 'creator';
  avatar: string;
}

interface BrandConfig {
  name: string;
  handle: string;
  colors: {
    primary: string;
    accent: string;
    surface: string;
    text: string;
  };
  segments: Array<{ id: string; label: string; cronDay: string }>;
  team: TeamMember[];
  aiProxy: string;
}

// ---------------------------------------------------------------------------
// Supabase Client
// ---------------------------------------------------------------------------

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------------------------------------------------------------------------
// Posts API — mirrors the Supabase CRUD layer from the source implementation
// ---------------------------------------------------------------------------

const postsApi = {
  async list(status?: string): Promise<Post[]> {
    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Post[];
  },

  async create(post: Omit<Post, 'id' | 'created_at'>): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select()
      .single();

    if (error) throw error;
    return data as Post;
  },

  async update(id: string, patch: Partial<Post>): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Post;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ---------------------------------------------------------------------------
// AI Generation — calls the LLM proxy, never exposes API keys
// ---------------------------------------------------------------------------

const AI_TIMEOUT_MS = 60000;

async function generateFullPost(
  topic: string,
  systemPrompt: string,
  proxyUrl: string
): Promise<{
  headline: string;
  highlight_words: string[];
  caption: string;
  hashtags: string;
  image_prompt: string;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'glm-5.1',
        thinking: { type: 'disabled' },
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Topic: ${topic}` },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '';
    return parseFullPostJSON(raw);
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`AI timed out after ${AI_TIMEOUT_MS / 1000}s.`);
    }
    throw err;
  }
}

// Multi-pass JSON repair for malformed LLM output.
// Models sometimes substitute apostrophes where closing double-quotes
// should be. Try strict parse first, then targeted cleanups, then
// a field-by-field regex fallback.
function parseFullPostJSON(raw: string): {
  headline: string;
  highlight_words: string[];
  caption: string;
  hashtags: string;
  image_prompt: string;
} {
  const s = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  function isValid(o: Record<string, unknown>): boolean {
    return !!(o && o.headline && o.caption && o.hashtags && o.image_prompt);
  }

  function tryParse(text: string): Record<string, unknown> | null {
    try {
      const o = JSON.parse(text);
      return isValid(o) ? o : null;
    } catch {
      return null;
    }
  }

  // Pass 1: strict parse
  const r1 = tryParse(s);
  if (r1) return r1 as ReturnType<typeof parseFullPostJSON>;

  // Pass 2: extract outermost braces
  const match = s.match(/\{[\s\S]*\}/);
  if (match) {
    const block = match[0];
    const r2 = tryParse(block);
    if (r2) return r2 as ReturnType<typeof parseFullPostJSON>;

    // Pass 3: repair apostrophe-as-quote before known keys
    let repaired = block;
    const keys = ['headline', 'caption', 'hashtags', 'image_prompt'];
    keys.forEach((k) => {
      const re = new RegExp(`'(\\s*,\\s*)"${k}"\\s*:`, 'g');
      repaired = repaired.replace(re, `"$1"${k}":`);
    });
    const r3 = tryParse(repaired);
    if (r3) return r3 as ReturnType<typeof parseFullPostJSON>;

    // Pass 4: repair trailing apostrophe before closing brace
    repaired = repaired.replace(/'(\s*})/, '"$1');
    const r4 = tryParse(repaired);
    if (r4) return r4 as ReturnType<typeof parseFullPostJSON>;
  }

  // Pass 5: regex fallback — extract each field individually
  function extract(key: string): string {
    const re = new RegExp(`"${key}"\\s*:\\s*"([\\s\\S]*?)(?:"|')\\s*[,}]`);
    const m = s.match(re);
    return m ? m[1] : '';
  }

  return {
    headline: extract('headline'),
    highlight_words: [],
    caption: extract('caption'),
    hashtags: extract('hashtags'),
    image_prompt: extract('image_prompt'),
  };
}

// ---------------------------------------------------------------------------
// Realtime Subscription — keeps multi-user dashboards in sync
// ---------------------------------------------------------------------------

function useRealtimePosts(onUpdate: (posts: Post[]) => void) {
  useEffect(() => {
    const channel = supabase
      .channel('posts-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => {
          // Refetch all posts on any change. For large datasets,
          // optimize by applying the individual change to local state.
          postsApi.list().then(onUpdate);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}

// ---------------------------------------------------------------------------
// Content Hub Component
// ---------------------------------------------------------------------------

export default function ContentHub({ config }: { config: BrandConfig }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);

  // Initial fetch
  useEffect(() => {
    postsApi.list(statusFilter).then(setPosts);
  }, [statusFilter]);

  // Realtime sync
  const handleRealtimeUpdate = useCallback(
    (updated: Post[]) => {
      const filtered = statusFilter
        ? updated.filter((p) => p.status === statusFilter)
        : updated;
      setPosts(filtered);
    },
    [statusFilter]
  );
  useRealtimePosts(handleRealtimeUpdate);

  // Status change handler
  async function changeStatus(postId: string, newStatus: Post['status']) {
    const updated = await postsApi.update(postId, { status: newStatus });
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
    if (selectedPost?.id === postId) setSelectedPost(updated);

    // Trigger team notification via n8n webhook
    fetch(process.env.NEXT_PUBLIC_N8N_NOTIFY_WEBHOOK!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'status_change',
        postId,
        data: { newStatus },
      }),
    }).catch(console.error);
  }

  // Publish handler
  async function publishPost(postId: string) {
    const response = await fetch(process.env.NEXT_PUBLIC_N8N_SOCIAL_WEBHOOK!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId,
        platforms: ['threads', 'instagram', 'facebook', 'linkedin'],
      }),
    });

    const result = await response.json();
    if (result.success) {
      const updated = await postsApi.update(postId, {
        status: 'published',
        published_at: new Date().toISOString(),
        publish_result: result.results,
      });
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
    }
  }

  return (
    <div className="content-hub" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="./logo.png" alt={config.name} />
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item active">Compose</button>
          <button className="nav-item">Calendar</button>
          <button className="nav-item">Ideate</button>
          <button className="nav-item">Listen</button>
          <button className="nav-item">Discover</button>
          <button className="nav-item">Measure</button>
          <button className="nav-item">Inbox</button>
          <button className="nav-item">Reports</button>
          <button className="nav-item">Team</button>
          <button className="nav-item">Tasks</button>
          <button className="nav-item">Assets</button>
        </nav>
        <div className="sidebar-actions">
          <button className="btn-mint" onClick={() => setIsBatchOpen(true)}>
            Generate Posts
          </button>
          <button className="btn-purple" onClick={() => setIsCreatorOpen(true)}>
            New Post
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-area">
        {/* Status Tabs */}
        <div className="status-tabs">
          {['pending', 'approved', 'published'].map((status) => (
            <button
              key={status}
              className={`status-tab ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Post Grid */}
        <div className="posts-grid">
          {posts.length === 0 ? (
            <div className="empty-state">
              <h3>No posts yet</h3>
              <p>Click "Generate Posts" to create content with AI.</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => setSelectedPost(post)}
              />
            ))
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedPost && (
        <DetailModal
          post={selectedPost}
          config={config}
          onClose={() => setSelectedPost(null)}
          onApprove={() => changeStatus(selectedPost.id, 'approved')}
          onReject={() => changeStatus(selectedPost.id, 'pending')}
          onPublish={() => publishPost(selectedPost.id)}
          onEdit={() => {
            setSelectedPost(null);
            setIsCreatorOpen(true);
          }}
        />
      )}

      {/* Creator Modal */}
      {isCreatorOpen && (
        <CreatorModal
          config={config}
          onClose={() => setIsCreatorOpen(false)}
          onSave={async (draft) => {
            const saved = await postsApi.create(draft);
            setPosts((prev) => [saved, ...prev]);
            setIsCreatorOpen(false);
          }}
        />
      )}

      {/* Batch Generator Modal */}
      {isBatchOpen && (
        <BatchGeneratorModal
          config={config}
          onClose={() => setIsBatchOpen(false)}
          onComplete={(generated) => {
            setPosts((prev) => [...generated, ...prev]);
            setIsBatchOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-Components (stubs — implement with component-building skill)
// ---------------------------------------------------------------------------

function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const segmentColors: Record<string, string> = {
    news: '#33fecc',
    engage: '#cc99ff',
    facts: '#fde9c3',
    regulation: '#ff6b6b',
    studies: '#64c8ff',
  };

  return (
    <div className="post-card" onClick={onClick}>
      <div className="card-image">
        <img src={post.img} alt={post.headline} loading="lazy" />
      </div>
      <div className="card-body">
        <span
          className="segment-badge"
          style={{ color: segmentColors[post.system] || '#cc99ff' }}
        >
          {post.system}
        </span>
        <h4 className="card-headline">{post.headline}</h4>
        <div className="card-meta">
          <span className={`status-dot status-${post.status}`} />
          <time>{new Date(post.created_at).toLocaleDateString()}</time>
        </div>
      </div>
    </div>
  );
}

function DetailModal({
  post,
  config,
  onClose,
  onApprove,
  onReject,
  onPublish,
  onEdit,
}: {
  post: Post;
  config: BrandConfig;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onPublish: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-back-btn" onClick={onClose}>Back</button>
        <div className="modal-left">
          <img src={post.img} alt={post.headline} />
        </div>
        <div className="modal-right">
          <div className="detail-status">{post.status}</div>
          <h2>{post.headline}</h2>
          <p>{post.cap}</p>
          <div className="detail-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="hashtag">{tag}</span>
            ))}
          </div>
          <div className="detail-actions">
            {post.status === 'pending' && (
              <button className="btn-mint" onClick={onApprove}>Approve</button>
            )}
            {post.status === 'approved' && (
              <>
                <button className="btn-mint" onClick={onPublish}>Publish</button>
                <button className="btn-ghost" onClick={onReject}>Back to Pending</button>
              </>
            )}
            <button className="btn-purple" onClick={onEdit}>Edit in Creator</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreatorModal({
  config,
  onClose,
  onSave,
}: {
  config: BrandConfig;
  onClose: () => void;
  onSave: (draft: Omit<Post, 'id' | 'created_at'>) => Promise<void>;
}) {
  // Implement using the Visual Creator canvas pattern from references/ui-patterns.md.
  // Key features:
  // - Draggable background, logo, and headline on the canvas
  // - Design tab with dimension presets, gradient controls, headline word picker
  // - AI tab with one-click generator and conversational chat
  // - Save button calls html2canvas to bake the image, then onSave()
  return (
    <div className="creator">
      <div className="canvas-area">{/* Canvas implementation */}</div>
      <div className="controls">{/* Controls implementation */}</div>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

function BatchGeneratorModal({
  config,
  onClose,
  onComplete,
}: {
  config: BrandConfig;
  onClose: () => void;
  onComplete: (posts: Post[]) => void;
}) {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  async function runBatch() {
    setIsGenerating(true);
    const generated: Post[] = [];
    const previousHeadlines: string[] = [];

    for (let i = 0; i < count; i++) {
      setProgress(i + 1);
      try {
        const topicWithContext = previousHeadlines.length
          ? `${topic}\n\nAvoid these headlines already used: ${previousHeadlines.join('; ')}`
          : topic;

        const result = await generateFullPost(
          topicWithContext,
          '', // system prompt loaded from brand config
          config.aiProxy
        );

        const saved = await postsApi.create({
          system: 'news',
          headline: result.headline,
          hl_words: result.highlight_words,
          cap: result.caption,
          tags: result.hashtags.split(/\s+/).filter(Boolean),
          img: '',
          bg_url: '',
          img_prompt: result.image_prompt,
          status: 'pending',
          assignee: null,
          created_by: '',
          source: 'ai-batch',
          published_at: null,
          publish_result: null,
        });

        generated.push(saved);
        previousHeadlines.push(result.headline);
      } catch (err) {
        console.error(`Batch post ${i + 1} failed:`, err);
        // Continue to next post on failure
      }
    }

    setIsGenerating(false);
    onComplete(generated);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="batch-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Generate Posts</h2>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Type a topic or angle..."
        />
        <div className="count-picker">
          {[1, 5, 10, 20].map((n) => (
            <button
              key={n}
              className={count === n ? 'active' : ''}
              onClick={() => setCount(n)}
            >
              {n}
            </button>
          ))}
        </div>

        {isGenerating && (
          <div className="batch-progress">
            <div className="progress-text">
              Generating post {progress} of {count}
            </div>
            <div className="progress-bar">
              <div style={{ width: `${(progress / count) * 100}%` }} />
            </div>
          </div>
        )}

        <button
          className="btn-mint"
          onClick={runBatch}
          disabled={isGenerating || !topic}
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
