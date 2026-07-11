/* ═══ Saved — list of the current user's bookmarks ═══
 *
 * AP-MODERNIZE-2026-05 · Lane 4
 *
 * Groups bookmarks by target_type so the user can scan saved posts, modules,
 * bulletins, and blog entries in one place. Each card links to the live
 * target where one exists; bulletins/comments fall back to id-only labels
 * because their canonical public URLs depend on lanes outside this scope.
 */

import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookmarkSimple,
  ChatCircle,
  BookOpen,
  Megaphone,
  Newspaper,
  CaretRight,
} from '@phosphor-icons/react';
import {
  listBookmarks,
  removeBookmark,
  type Bookmark,
  type BookmarkTargetType,
} from '../../data/bookmarks';
import { getPosts } from '../../data/communityData';
import SubTabs from '../../components/community/SubTabs';
import './Saved.css';

const PORTFOLIO_TABS = [
  { to: '/community/portfolio', label: 'Projects' },
  { to: '/community/credentials', label: 'Credentials' },
  { to: '/community/showcase', label: 'Showcase' },
  { to: '/community/saved', label: 'Saved' },
];

type Group = {
  id: BookmarkTargetType;
  label: string;
  icon: React.ComponentType<any>;
};

const GROUPS: Group[] = [
  { id: 'post', label: 'Posts', icon: ChatCircle },
  { id: 'module', label: 'Modules', icon: BookOpen },
  { id: 'bulletin', label: 'Bulletins', icon: Megaphone },
  { id: 'blog_post', label: 'Blog', icon: Newspaper },
  { id: 'comment', label: 'Comments', icon: ChatCircle },
];

function previewForPost(targetId: string): string {
  const posts = getPosts();
  const match = posts.find((p) => p.id === targetId);
  if (!match) return targetId;
  const body = match.body || '';
  return body.length > 160 ? `${body.slice(0, 160)}…` : body;
}

function hrefFor(b: Bookmark): string | null {
  switch (b.target_type) {
    case 'post':
      // Public feed surface for now. Future lane can add /community/p/:id.
      return '/community';
    case 'module':
      return `/community/learn/${b.target_id}`;
    case 'blog_post':
      return `/blog/${b.target_id}`;
    case 'bulletin':
      // No public bulletin route yet — admins can deep-link from /admin/content-hub.
      return null;
    case 'comment':
      // Comment permalink not implemented — surface in Feed instead.
      return '/community';
    default:
      return null;
  }
}

function labelFor(b: Bookmark): string {
  if (b.target_type === 'post') return previewForPost(b.target_id);
  if (b.target_type === 'comment') return `Comment ${b.target_id.slice(0, 8)}`;
  if (b.target_type === 'bulletin') return `Bulletin ${b.target_id.slice(0, 8)}`;
  return b.target_id;
}

export default function Saved() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listBookmarks()
      .then((rows) => {
        if (!cancelled) setBookmarks(rows);
      })
      .catch(() => {
        if (!cancelled) setBookmarks([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<BookmarkTargetType, Bookmark[]>();
    for (const b of bookmarks) {
      const arr = map.get(b.target_type) ?? [];
      arr.push(b);
      map.set(b.target_type, arr);
    }
    return map;
  }, [bookmarks]);

  async function handleRemove(b: Bookmark) {
    setRemovingId(b.id);
    // Optimistic remove
    setBookmarks((prev) => prev.filter((x) => x.id !== b.id));
    try {
      await removeBookmark(b.target_type, b.target_id);
    } catch {
      // Roll back if the server rejected
      setBookmarks((prev) => [b, ...prev]);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="saved">
      <SubTabs tabs={PORTFOLIO_TABS} />
      <div className="community-page-header">
        <h1>
          <BookmarkSimple size={28} weight="duotone" /> Saved
        </h1>
        <p>Posts, modules, bulletins, and blog entries you saved for later.</p>
      </div>

      {loading && (
        <div className="community-card saved__empty">
          <p>Loading your saved items…</p>
        </div>
      )}

      {!loading && bookmarks.length === 0 && (
        <div className="community-card saved__empty">
          <BookmarkSimple size={40} weight="duotone" />
          <h3>Nothing saved yet</h3>
          <p>
            Tap the bookmark icon on any post, module, or bulletin to keep it
            here for later.
          </p>
        </div>
      )}

      {!loading &&
        bookmarks.length > 0 &&
        GROUPS.map((group) => {
          const rows = grouped.get(group.id);
          if (!rows || rows.length === 0) return null;
          const Icon = group.icon;
          return (
            <section key={group.id} className="saved__group">
              <h2 className="saved__group-title">
                <Icon size={20} weight="duotone" />
                {group.label}
                <span className="saved__group-count">{rows.length}</span>
              </h2>
              <div className="saved__list">
                {rows.map((b) => {
                  const href = hrefFor(b);
                  const text = labelFor(b);
                  const inner = (
                    <>
                      <div className="saved__card-body">
                        <p className="saved__card-text">{text}</p>
                        <span className="saved__card-meta">
                          Saved {new Date(b.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {href && <CaretRight size={18} weight="bold" />}
                    </>
                  );
                  return (
                    <div
                      key={b.id}
                      className={`community-card saved__card ${
                        removingId === b.id ? 'saved__card--removing' : ''
                      }`}
                    >
                      {href ? (
                        <Link to={href} className="saved__card-link">
                          {inner}
                        </Link>
                      ) : (
                        <div className="saved__card-link saved__card-link--static">
                          {inner}
                        </div>
                      )}
                      <button
                        type="button"
                        className="saved__remove"
                        onClick={() => handleRemove(b)}
                        disabled={removingId === b.id}
                        aria-label="Remove bookmark"
                        title="Remove bookmark"
                      >
                        <BookmarkSimple size={18} weight="fill" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
    </div>
  );
}
