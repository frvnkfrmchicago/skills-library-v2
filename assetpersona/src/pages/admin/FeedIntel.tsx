/* ═══ ADMIN — Feed Intel ═══
 *
 * Threads "For You" feed monitor & Apple App Store RSS feed monitor.
 * Helps discover trending app types and trigger clones to TwoFace.
 *
 * Pattern: BroadcastsMonitor (social platform data) +
 *          ContentHub (severity-filtered list with toolbar).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowsClockwise,
  CellSignalFull,
  ChatCircle,
  ArrowSquareOut,
  Megaphone,
  MagnifyingGlass,
  Heart,
  Repeat,
  Quotes,
  ShareNetwork,
  SortAscending,
  FunnelSimple,
  Sparkle,
  DownloadSimple,
  Cpu,
  CheckCircle,
} from '@phosphor-icons/react';
import {
  listFeedPosts,
  listVerticals,
  triggerScrape,
  sortPosts,
  type FeedPost,
  type FeedSortMode,
  type Vertical,
} from '../../data/feedIntel';
import {
  fetchAppStoreFeed,
  dispatchCloneToTwoFace,
  type AppStoreItem,
  type AppStoreFeedType,
} from '../../data/appStoreIntel';
import './FeedIntel.css';

/* ── Helpers ── */

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/* ── Sort options ── */

const SORT_OPTIONS: Array<{ value: FeedSortMode; label: string }> = [
  { value: 'newest', label: 'Newest' },
  { value: 'most_engaged', label: 'Most engaged' },
  { value: 'opportunity', label: 'Opportunity' },
];

const APP_STORE_GENRES = [
  { id: 'all', name: 'All Categories' },
  { id: 'productivity', name: 'Productivity' },
  { id: 'utilities', name: 'Utilities' },
  { id: 'finance', name: 'Finance' },
  { id: 'health & fitness', name: 'Health & Fitness' },
  { id: 'social networking', name: 'Social Networking' },
  { id: 'education', name: 'Education' },
  { id: 'games', name: 'Games' }
];

/* ═══════════════════════════════════════════════ */
/* MAIN PAGE                                       */
/* ═══════════════════════════════════════════════ */

export default function FeedIntel() {
  const navigate = useNavigate();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'threads' | 'appstore'>('threads');

  // Threads states
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scraping, setScraping] = useState(false);
  const [activeVertical, setActiveVertical] = useState<string | 'all'>('all');
  const [sortMode, setSortMode] = useState<FeedSortMode>('newest');
  const [query, setQuery] = useState('');

  // App Store states
  const [appStoreItems, setAppStoreItems] = useState<AppStoreItem[]>([]);
  const [appStoreLoading, setAppStoreLoading] = useState(false);
  const [appStoreFeed, setAppStoreFeedType] = useState<AppStoreFeedType>('top-free');
  const [appStoreGenre, setAppStoreGenre] = useState<string>('all');
  const [appStoreQuery, setAppStoreQuery] = useState('');
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  /* ── Threads Data fetch ── */

  const loadThreads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [feedPosts, verts] = await Promise.all([
        listFeedPosts(activeVertical === 'all' ? undefined : activeVertical),
        listVerticals(),
      ]);
      setPosts(feedPosts);
      setVerticals(verts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load feed data.'
      );
    } finally {
      setLoading(false);
    }
  }, [activeVertical]);

  useEffect(() => {
    if (activeTab === 'threads') {
      loadThreads();
    }
  }, [activeTab, loadThreads]);

  /* ── App Store Feed Fetch ── */

  const loadAppStore = useCallback(async () => {
    setAppStoreLoading(true);
    setError('');
    try {
      const data = await fetchAppStoreFeed(appStoreFeed);
      setAppStoreItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load App Store feeds.');
    } finally {
      setAppStoreLoading(false);
    }
  }, [appStoreFeed]);

  useEffect(() => {
    if (activeTab === 'appstore') {
      loadAppStore();
    }
  }, [activeTab, loadAppStore]);

  /* ── Scrape trigger ── */

  async function handleScrape() {
    setScraping(true);
    setError('');
    try {
      const result = await triggerScrape();
      if (!result.ok) {
        setError('Scrape did not return new data. The edge function may not be deployed yet.');
      }
      await loadThreads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scrape failed.');
    } finally {
      setScraping(false);
    }
  }

  /* ── Threads Filtering ── */

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = posts;

    if (q) {
      result = result.filter(
        (p) =>
          p.username.toLowerCase().includes(q) ||
          p.text.toLowerCase().includes(q)
      );
    }

    if (activeVertical !== 'all') {
      result = result.filter((p) =>
        p.vertical_tags?.includes(activeVertical)
      );
    }

    return sortPosts(result, sortMode);
  }, [posts, query, activeVertical, sortMode]);

  /* ── App Store Filtering ── */

  const filteredApps = useMemo(() => {
    const q = appStoreQuery.trim().toLowerCase();
    let result = appStoreItems;

    if (q) {
      result = result.filter(
        (app) =>
          app.name.toLowerCase().includes(q) ||
          app.developer.toLowerCase().includes(q) ||
          app.summary.toLowerCase().includes(q)
      );
    }

    if (appStoreGenre !== 'all') {
      result = result.filter(
        (app) => app.category.toLowerCase() === appStoreGenre.toLowerCase()
      );
    }

    return result;
  }, [appStoreItems, appStoreQuery, appStoreGenre]);

  /* ── Bulletin Actions ── */

  function handleTurnIntoBulletin(post: FeedPost) {
    const params = new URLSearchParams({
      prefill_title: `Re: @${post.username}`,
      prefill_summary: post.text.slice(0, 280),
      prefill_source_url: post.link,
    });
    navigate(`/admin/content-hub/new?${params.toString()}`);
  }

  function handleAppStoreBulletin(app: AppStoreItem) {
    const params = new URLSearchParams({
      prefill_title: `Trending App: ${app.name} (${app.category})`,
      prefill_summary: `Scouted trending app ${app.name} by ${app.developer} in the App Store RSS feeds. Category: ${app.category}. Release Date: ${app.releaseDate}. Summary: ${app.summary.slice(0, 200)}...`,
      prefill_source_url: app.appStoreUrl,
    });
    navigate(`/admin/content-hub/new?${params.toString()}`);
  }

  /* ── TwoFace Clone Action ── */

  async function handleCloneRequest(app: AppStoreItem) {
    setCloningId(app.id);
    setNotification(null);
    try {
      const result = await dispatchCloneToTwoFace(app.name, app.appStoreUrl);
      if (result.ok) {
        setNotification(result.message);
      }
    } catch (err) {
      setError('Failed to request app clone.');
    } finally {
      setCloningId(null);
    }
  }

  return (
    <div className="feed-intel">
      {/* ── Header ── */}
      <header className="feed-intel__head">
        <div>
          <h1>Automation Centre & Feed Intel</h1>
          <p className="feed-intel__sub">
            Monitor active trends, feeds, and dispatch automated tasks to TwoFace and Lil Neutron.
          </p>
        </div>
        
        <div className="feed-intel__tabs-wrapper">
          <div className="feed-intel__nav-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'threads'}
              className={`feed-intel__tab-btn ${activeTab === 'threads' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('threads')}
            >
              <ChatCircle size={16} />
              <span>Threads Monitor</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'appstore'}
              className={`feed-intel__tab-btn ${activeTab === 'appstore' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('appstore')}
            >
              <Cpu size={16} />
              <span>App Store Intel</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Notification Banner ── */}
      {notification && (
        <div className="feed-intel__notif liquid-glass" role="status">
          <CheckCircle size={18} weight="fill" className="feed-intel__notif-icon" />
          <div className="feed-intel__notif-body">
            <p className="feed-intel__notif-text">{notification}</p>
            <button
              type="button"
              className="feed-intel__notif-close"
              onClick={() => setNotification(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error ? (
        <p role="alert" className="feed-intel__error">
          {error}
        </p>
      ) : null}

      {/* ── THREADS MONITOR VIEW ── */}
      {activeTab === 'threads' && (
        <>
          <div className="feed-intel__head-actions" style={{ justifyContent: 'flex-end', marginTop: '-12px' }}>
            <button
              type="button"
              className={`feed-intel__refresh${loading ? ' is-spinning' : ''}`}
              onClick={loadThreads}
              disabled={loading}
              aria-label="Refresh feed"
            >
              <ArrowsClockwise size={16} weight="bold" />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              className="feed-intel__scrape"
              onClick={handleScrape}
              disabled={scraping || loading}
            >
              <CellSignalFull size={16} weight="fill" />
              <span>{scraping ? 'Scraping...' : 'Scrape now'}</span>
            </button>
          </div>

          <div className="feed-intel__toolbar">
            <label className="feed-intel__search">
              <MagnifyingGlass size={14} />
              <input
                type="search"
                placeholder="Search posts..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>

            <div className="feed-intel__filters" role="radiogroup" aria-label="Vertical filter">
              <button
                type="button"
                role="radio"
                aria-checked={activeVertical === 'all'}
                className={activeVertical === 'all' ? 'is-active' : ''}
                onClick={() => setActiveVertical('all')}
              >
                <FunnelSimple size={12} weight="bold" />
                All
              </button>
              {verticals.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={activeVertical === v.id}
                  className={activeVertical === v.id ? 'is-active' : ''}
                  onClick={() => setActiveVertical(v.id)}
                >
                  {v.name}
                </button>
              ))}
            </div>

            <div className="feed-intel__sort">
              <span className="feed-intel__sort-label">
                <SortAscending size={12} weight="bold" />
              </span>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as FeedSortMode)}
                aria-label="Sort posts"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!loading && posts.length > 0 && (
            <span className="feed-intel__count">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
              {query || activeVertical !== 'all' ? ` (filtered from ${posts.length})` : ''}
            </span>
          )}

          {loading ? (
            <SkeletonList />
          ) : filteredPosts.length === 0 ? (
            <EmptyState hasAny={posts.length > 0} onScrape={handleScrape} />
          ) : (
            <ul className="feed-intel__list">
              {filteredPosts.map((post) => (
                <FeedCard
                  key={post.id}
                  post={post}
                  onBulletin={handleTurnIntoBulletin}
                />
              ))}
            </ul>
          )}
        </>
      )}

      {/* ── APP STORE INTEL VIEW ── */}
      {activeTab === 'appstore' && (
        <>
          <div className="feed-intel__head-actions" style={{ justifyContent: 'space-between', width: '100%', marginTop: '-12px' }}>
            <div className="feed-intel__feed-types">
              <button
                type="button"
                className={`feed-intel__feed-btn ${appStoreFeed === 'top-free' ? 'is-active' : ''}`}
                onClick={() => setAppStoreFeedType('top-free')}
              >
                Top Free Apps
              </button>
              <button
                type="button"
                className={`feed-intel__feed-btn ${appStoreFeed === 'top-paid' ? 'is-active' : ''}`}
                onClick={() => setAppStoreFeedType('top-paid')}
              >
                Top Paid Apps
              </button>
              <button
                type="button"
                className={`feed-intel__feed-btn ${appStoreFeed === 'top-grossing' ? 'is-active' : ''}`}
                onClick={() => setAppStoreFeedType('top-grossing')}
              >
                Top Grossing
              </button>
            </div>

            <button
              type="button"
              className={`feed-intel__refresh${appStoreLoading ? ' is-spinning' : ''}`}
              onClick={loadAppStore}
              disabled={appStoreLoading}
              aria-label="Refresh App Store RSS Feed"
            >
              <ArrowsClockwise size={16} weight="bold" />
              <span>Reload RSS Feed</span>
            </button>
          </div>

          <div className="feed-intel__toolbar">
            <label className="feed-intel__search">
              <MagnifyingGlass size={14} />
              <input
                type="search"
                placeholder="Search trending apps..."
                value={appStoreQuery}
                onChange={(e) => setAppStoreQuery(e.target.value)}
              />
            </label>

            <div className="feed-intel__filters" role="radiogroup" aria-label="Genre filter">
              {APP_STORE_GENRES.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  role="radio"
                  aria-checked={appStoreGenre === genre.id}
                  className={appStoreGenre === genre.id ? 'is-active' : ''}
                  onClick={() => setAppStoreGenre(genre.id)}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          {!appStoreLoading && appStoreItems.length > 0 && (
            <span className="feed-intel__count">
              {filteredApps.length} {filteredApps.length === 1 ? 'app' : 'apps'} found
              {appStoreQuery || appStoreGenre !== 'all' ? ` (filtered from ${appStoreItems.length})` : ''}
            </span>
          )}

          {appStoreLoading ? (
            <SkeletonList />
          ) : filteredApps.length === 0 ? (
            <div className="feed-intel__empty">
              <Cpu size={28} weight="duotone" />
              <p>No trending applications found matching filters.</p>
            </div>
          ) : (
            <div className="feed-intel__app-grid">
              {filteredApps.map((app, index) => (
                <div key={app.id} className="feed-intel__app-card liquid-glass">
                  <div className="feed-intel__app-head">
                    <span className="feed-intel__app-rank">#{index + 1}</span>
                    <img
                      src={app.iconUrl || '/apple-app-icon.png'}
                      alt={`${app.name} icon`}
                      className="feed-intel__app-icon"
                      loading="lazy"
                    />
                    <div className="feed-intel__app-title-group">
                      <h3 className="feed-intel__app-name">
                        <a href={app.appStoreUrl} target="_blank" rel="noopener noreferrer">
                          {app.name}
                        </a>
                      </h3>
                      <span className="feed-intel__app-dev">{app.developer}</span>
                    </div>
                  </div>

                  <p className="feed-intel__app-summary">{app.summary}</p>

                  <div className="feed-intel__app-meta">
                    <div className="feed-intel__app-meta-left">
                      <span className="feed-intel__app-tag">{app.category}</span>
                      <span className="feed-intel__app-tag feed-intel__app-tag--type">
                        <Sparkle size={10} weight="fill" />
                        {app.trendingType}
                      </span>
                    </div>
                    <div className="feed-intel__app-meta-right">
                      <span className="feed-intel__app-price">{app.price}</span>
                      <span className="feed-intel__app-date">{app.releaseDate}</span>
                    </div>
                  </div>

                  <div className="feed-intel__app-actions">
                    <button
                      type="button"
                      className="feed-intel__action feed-intel__action--primary"
                      onClick={() => handleCloneRequest(app)}
                      disabled={cloningId !== null}
                      title="Request TwoFace to run a full 15-screen browser capture and clone"
                    >
                      <DownloadSimple size={14} weight="bold" />
                      <span>{cloningId === app.id ? 'Scraping UI...' : 'Request Clone'}</span>
                    </button>

                    <button
                      type="button"
                      className="feed-intel__action"
                      onClick={() => handleAppStoreBulletin(app)}
                      title="Turn this trending app into a Content Hub bulletin"
                    >
                      <Megaphone size={14} />
                      <span>Scout Bulletin</span>
                    </button>

                    <a
                      href={app.appStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="feed-intel__action"
                      title="Open in Apple App Store"
                    >
                      <ArrowSquareOut size={14} />
                      <span>App Store</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
/* FEED CARD                                       */
/* ═══════════════════════════════════════════════ */

interface FeedCardProps {
  post: FeedPost;
  onBulletin: (post: FeedPost) => void;
}

function FeedCard({ post, onBulletin }: FeedCardProps) {
  return (
    <li className="feed-intel__card liquid-glass">
      {/* Meta */}
      <div className="feed-intel__card-meta">
        <span className="feed-intel__card-user">@{post.username}</span>
        <span className="feed-intel__card-time">{timeAgo(post.taken_at)}</span>
      </div>

      {/* Post text */}
      <p className="feed-intel__card-text">{post.text}</p>

      {/* Vertical tags */}
      {post.vertical_tags?.length > 0 && (
        <div className="feed-intel__card-tags">
          {post.vertical_tags.map((tag) => (
            <span key={tag} className="feed-intel__tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Stats — all 7 required fields */}
      <div className="feed-intel__card-stats">
        <span className="feed-intel__stat" title="Likes">
          <Heart size={12} weight="fill" />
          {formatCount(post.likes)}
        </span>
        <span className="feed-intel__stat" title="Replies">
          <ChatCircle size={12} />
          {formatCount(post.replies)}
        </span>
        <span className="feed-intel__stat" title="Reposts">
          <Repeat size={12} />
          {formatCount(post.reposts)}
        </span>
        <span className="feed-intel__stat" title="Quotes">
          <Quotes size={12} />
          {formatCount(post.quotes)}
        </span>
        <span className="feed-intel__stat" title="Shares">
          <ShareNetwork size={12} />
          {formatCount(post.shares)}
        </span>
      </div>

      {/* Actions */}
      <div className="feed-intel__card-actions">
        <button
          type="button"
          className="feed-intel__action feed-intel__action--primary"
          onClick={() => onBulletin(post)}
          title="Create a Content Hub bulletin from this post"
        >
          <Megaphone size={14} weight="duotone" />
          <span>Turn into bulletin</span>
        </button>
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="feed-intel__action"
          title="View original post on Threads"
        >
          <ArrowSquareOut size={14} />
          <span>Open on Threads</span>
        </a>
        <button
          type="button"
          className="feed-intel__action"
          title="Reply to this post (coming soon)"
          onClick={() => {
            /* Placeholder — will connect to Threads API */
          }}
        >
          <ChatCircle size={14} weight="duotone" />
          <span>Reply</span>
        </button>
      </div>
    </li>
  );
}

/* ═══════════════════════════════════════════════ */
/* SKELETON STATE                                  */
/* ═══════════════════════════════════════════════ */

function SkeletonList() {
  return (
    <div className="feed-intel__skeleton-list" aria-busy="true" aria-label="Loading feed">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="feed-intel__skeleton-card">
          <div className="feed-intel__skeleton-line feed-intel__skeleton-line--short" />
          <div className="feed-intel__skeleton-line feed-intel__skeleton-line--long" />
          <div className="feed-intel__skeleton-line feed-intel__skeleton-line--mid" />
          <div className="feed-intel__skeleton-row">
            <div className="feed-intel__skeleton-line" />
            <div className="feed-intel__skeleton-line" />
            <div className="feed-intel__skeleton-line" />
            <div className="feed-intel__skeleton-line" />
            <div className="feed-intel__skeleton-line" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
/* EMPTY STATE                                     */
/* ═══════════════════════════════════════════════ */

interface EmptyStateProps {
  hasAny: boolean;
  onScrape: () => void;
}

function EmptyState({ hasAny, onScrape }: EmptyStateProps) {
  return (
    <div className="feed-intel__empty">
      <CellSignalFull size={28} weight="duotone" />
      {hasAny ? (
        <p>No posts match that search or filter.</p>
      ) : (
        <>
          <p>
            No feed data yet. Deploy the threads-feed edge function and hit
            Scrape to pull in the latest posts.
          </p>
          <button
            type="button"
            className="feed-intel__scrape"
            onClick={onScrape}
          >
            <CellSignalFull size={14} weight="fill" />
            <span>Scrape now</span>
          </button>
        </>
      )}
    </div>
  );
}
