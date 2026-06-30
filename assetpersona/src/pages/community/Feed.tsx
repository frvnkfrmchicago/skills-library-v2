import { useState, useMemo, useCallback, useEffect, useRef, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  getPosts, addPost as persistPost, deletePost as persistDelete, updatePost as persistUpdate, pinPost as persistPin,
  getComments, addComment as persistComment, deleteComment as persistDeleteComment,
  getReactions, toggleReaction as persistToggle,
  getMemberById, getLevelName, registerMember, CATEGORIES,
  fetchPostsRemote, fetchCommentsRemote, fetchUserReactionsRemote,
  applyRemotePostInsert, applyRemotePostUpdate, applyRemotePostDelete,
  applyRemoteCommentInsert, applyRemoteCommentDelete, applyRemoteLikeChange,
} from '../../data/communityData';
import type { CategoryId } from '../../data/communityData';
import { getChannel } from '../../data/channelsStore';
import { useAuth } from '../../context/useAuth';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { isBypassActive } from '../../lib/devBypass';
import type { Post, Comment } from '../../types/supabase';
import {
  DotsThree, PushPin, Pencil, Trash, X,
  ThumbsUp, Fire, Heart, ChatCircle,
  Trophy, Question, BookOpen, HandWaving,
} from '@phosphor-icons/react';
import MediaPicker from '../../components/feed/MediaPicker';
import OnboardingChecklist from '../../components/onboarding/OnboardingChecklist';
import SubTabs from '../../components/community/SubTabs';
import { AuroraField, GlowCard } from '../../components/ui';
import type { GlowAccent } from '../../components/ui';
import './Feed.css';

const COMMUNITY_TABS = [
  { to: '/community', label: 'Discussion', end: true },
  { to: '/community/leaderboard', label: 'Leaderboard' },
  { to: '/community/members', label: 'Members' },
  { to: '/community/calendar', label: 'Calendar' },
];


type SortMode = 'recent' | 'top';
type ReactionType = 'like' | 'fire' | 'heart';

/* Category icon map */
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  wins: <Trophy size={14} weight="bold" />,
  questions: <Question size={14} weight="bold" />,
  resources: <BookOpen size={14} weight="bold" />,
  introductions: <HandWaving size={14} weight="bold" />,
};

/* One accent across the whole feed: coral. Cards, chips, and hover glows all
   read in the single coral accent against charcoal, so the column stays calm
   and the active state is the only thing that lights up. */
function accentForCategory(_category: string): GlowAccent {
  return 'coral';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function Avatar({ member, size = 'md' }: { member: { id: string; display_name: string; avatar_url?: string | null }; size?: 'sm' | 'md' | 'lg' }) {
  const initial = member.display_name?.charAt(0) ?? '?';
  if (member.avatar_url) {
    return <img src={member.avatar_url} alt={member.display_name} className={`avatar avatar--${size}`} />;
  }
  return (
    <div className={`avatar avatar--${size} avatar--${(member.id.charCodeAt(member.id.length - 1) % 5) + 1}`}>
      {initial}
    </div>
  );
}

export default function Feed() {
  const { profile } = useAuth();
  const [sort, setSort] = useState<SortMode>('recent');
  const [category, setCategory] = useState<CategoryId>('all');
  const [composerText, setComposerText] = useState('');
  const [composerCategory, setComposerCategory] = useState<string>('general');
  const [composerMedia, setComposerMedia] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>(() => getPosts());
  const [comments, setComments] = useState<Comment[]>(() => getComments());
  const [reactions, setReactions] = useState(() => getReactions());
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Register current user as member on first visit
  useEffect(() => {
    if (profile) registerMember(profile);
  }, [profile]);

  // ── Hydrate posts + comments + the current user's reactions from Supabase ──
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [hydratedPosts, hydratedComments] = await Promise.all([
        fetchPostsRemote(),
        fetchCommentsRemote(),
      ]);
      if (cancelled) return;
      setPosts(hydratedPosts);
      setComments(hydratedComments);
      if (profile?.id) {
        const r = await fetchUserReactionsRemote(profile.id);
        if (!cancelled) setReactions({ ...r });
      }
    })();
    return () => { cancelled = true; };
  }, [profile?.id]);

  // ── Realtime subscription on posts / comments / likes ──
  // Skipped in bypass or unconfigured environments since there's no remote channel.
  useEffect(() => {
    if (!isSupabaseConfigured || isBypassActive()) return;

    const channel = supabase
      .channel('feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          const row = payload.new as Parameters<typeof applyRemotePostInsert>[0];
          applyRemotePostInsert(row);
          setPosts(getPosts());
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload) => {
          const row = payload.new as Parameters<typeof applyRemotePostUpdate>[0];
          applyRemotePostUpdate(row);
          setPosts(getPosts());
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'posts' },
        (payload) => {
          const id = (payload.old as { id?: string })?.id;
          if (id) {
            applyRemotePostDelete(id);
            setPosts(getPosts());
            setComments(getComments());
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'post_comments' },
        (payload) => {
          const row = payload.new as Parameters<typeof applyRemoteCommentInsert>[0];
          applyRemoteCommentInsert(row);
          setComments(getComments());
          setPosts(getPosts());
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'post_comments' },
        (payload) => {
          const old = payload.old as { id?: string; post_id?: string };
          if (old.id && old.post_id) {
            applyRemoteCommentDelete(old.id, old.post_id);
            setComments(getComments());
            setPosts(getPosts());
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'post_likes' },
        (payload) => {
          const row = payload.new as Parameters<typeof applyRemoteLikeChange>[0];
          applyRemoteLikeChange(row, 1);
          setPosts(getPosts());
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'post_likes' },
        (payload) => {
          const old = payload.old as Parameters<typeof applyRemoteLikeChange>[0];
          if (old?.post_id) {
            applyRemoteLikeChange(old, -1);
            setPosts(getPosts());
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    let list = [...posts];
    if (category !== 'all') list = list.filter((p) => p.category === category);
    return list;
  }, [posts, category]);

  const sorted = useMemo(() => {
    const pinned = filtered.filter((p) => p.pinned);
    const unpinned = filtered.filter((p) => !p.pinned);

    if (sort === 'top') {
      unpinned.sort((a, b) => {
        const aScore = a.reaction_counts.like + a.reaction_counts.fire + a.reaction_counts.heart;
        const bScore = b.reaction_counts.like + b.reaction_counts.fire + b.reaction_counts.heart;
        return bScore - aScore;
      });
    } else {
      unpinned.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return [...pinned, ...unpinned];
  }, [filtered, sort]);

  const handlePost = useCallback(() => {
    if ((!composerText.trim() && composerMedia.length === 0) || !profile) return;
    const newPost: Post = {
      id: crypto.randomUUID(),
      author_id: profile.id,
      body: composerText.trim(),
      media_urls: composerMedia,
      category: composerCategory,
      reaction_counts: { like: 0, fire: 0, heart: 0 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      comment_count: 0,
    };
    const updated = persistPost(newPost);
    setPosts(updated);
    setComposerText('');
    setComposerMedia([]);
  }, [composerText, composerCategory, composerMedia, profile]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePost();
    }
  }

  function handleDelete(postId: string) {
    const updated = persistDelete(postId);
    setPosts(updated);
    setComments(getComments());
  }

  function handleEdit(postId: string, newBody: string) {
    const updated = persistUpdate(postId, { body: newBody });
    setPosts(updated);
    setEditingPostId(null);
    setEditText('');
  }

  function handlePin(postId: string, pinned: boolean) {
    const updated = persistPin(postId, !pinned);
    setPosts(updated);
  }

  function handleReaction(postId: string, type: ReactionType) {
    const updatedReactions = persistToggle(postId, type, profile?.id);
    setReactions({ ...updatedReactions });
    const userHas = updatedReactions[postId]?.includes(type) ?? false;
    setPosts((prev) => prev.map((p) => {
      if (p.id !== postId) return p;
      return {
        ...p,
        reaction_counts: {
          ...p.reaction_counts,
          [type]: Math.max(0, p.reaction_counts[type] + (userHas ? 1 : -1)),
        },
      };
    }));
  }

  function handleAddComment(postId: string, body: string, parentId: string | null = null) {
    if (!body.trim() || !profile) return;
    const newComment: Comment = {
      id: crypto.randomUUID(),
      post_id: postId,
      author_id: profile.id,
      parent_id: parentId,
      body: body.trim(),
      created_at: new Date().toISOString(),
    };
    const updatedComments = persistComment(newComment);
    setComments(updatedComments);
    setPosts((prev) => prev.map((p) =>
      p.id === postId ? { ...p, comment_count: (p.comment_count ?? 0) + 1 } : p
    ));
  }

  function handleDeleteComment(commentId: string, postId: string) {
    const updated = persistDeleteComment(commentId);
    setComments(updated);
    setPosts((prev) => prev.map((p) =>
      p.id === postId ? { ...p, comment_count: Math.max(0, (p.comment_count ?? 1) - 1) } : p
    ));
  }

  return (
    <div className="feed-shell">
      {/* ── A single soft coral wash behind the column so the charcoal base
            reads alive, not flat. Decorative, pointer-events off, settles to
            still under reduced motion. ── */}
      <AuroraField intensity="soft" className="feed-shell__aurora" />

      <div className="feed">
        <SubTabs tabs={COMMUNITY_TABS} />
        {/* ── Onboarding checklist (Lane 4 handoff — mounts once until complete) ── */}
        <OnboardingChecklist />

        {/* ── Composer — charcoal card with a hairline border and the coral accent ── */}
        <GlowCard accent="coral" className="feed__composer">
          <div className="feed__composer-row">
            {profile && <Avatar member={profile} size="md" />}
            <textarea
              className="feed__composer-input"
              placeholder="Share something with the community"
              rows={3}
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              onKeyDown={handleKeyDown}
              data-onboarding-anchor="feed-composer"
            />
          </div>
          <div className="feed__composer-actions">
            <div className="feed__composer-attach">
              <select
                className="feed__category-select"
                value={composerCategory}
                onChange={(e) => setComposerCategory(e.target.value)}
              >
                {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <MediaPicker onAdded={(url) => setComposerMedia((m) => [...m, url])} />
            </div>
            <button
              className="btn btn--primary btn--sm"
              disabled={!composerText.trim() && composerMedia.length === 0}
              onClick={handlePost}
            >
              Post
            </button>
          </div>
          {composerMedia.length > 0 && (
            <div className="feed__composer-media">
              {composerMedia.map((url, i) => (
                <div key={`${url}-${i}`} className="feed__composer-media-item">
                  <img src={url} alt="Attached media" />
                  <button
                    type="button"
                    className="feed__composer-media-remove"
                    aria-label="Remove media"
                    onClick={() => setComposerMedia((m) => m.filter((_, idx) => idx !== i))}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </GlowCard>

        {/* ── Category Filter + Sort Tabs ── */}
        <div className="feed__toolbar">
          <div className="feed__categories">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                className={`feed__cat-btn ${category === c.id ? 'feed__cat-btn--active' : ''}`}
                data-accent={accentForCategory(c.id)}
                onClick={() => setCategory(c.id)}
              >
                {CATEGORY_ICONS[c.id] && <span className="feed__cat-icon">{CATEGORY_ICONS[c.id]}</span>}
                {c.label}
              </button>
            ))}
          </div>
          <div className="feed__sort">
            <button className={`feed__sort-btn ${sort === 'recent' ? 'feed__sort-btn--active' : ''}`} onClick={() => setSort('recent')}>Recent</button>
            <button className={`feed__sort-btn ${sort === 'top' ? 'feed__sort-btn--active' : ''}`} onClick={() => setSort('top')}>Top</button>
          </div>
        </div>

        {/* ── Channel banner — names the space and its purpose. The coral left
              rail comes from the CSS, so every channel reads in one accent. ── */}
        {category !== 'all' && getChannel(category) && (
          <div className="feed__channel-banner">
            <strong className="feed__channel-banner-title"># {getChannel(category)!.label}</strong>
            <span className="feed__channel-banner-desc">{getChannel(category)!.description}</span>
          </div>
        )}

        {/* ── Empty State ── */}
        {sorted.length === 0 && (
          <div className="feed__empty">
            <h3>{category === 'all' ? 'No posts yet' : `No ${CATEGORIES.find(c => c.id === category)?.label} posts yet`}</h3>
            <p>{category !== 'all' && getChannel(category) ? getChannel(category)!.description : 'Be the first to share something with the community.'}</p>
          </div>
        )}

        {/* ── Posts ── */}
        <div className="feed__posts">
          {sorted.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isOwner={post.author_id === profile?.id}
              isAdmin={profile?.role === 'admin'}
              comments={comments.filter((c) => c.post_id === post.id)}
              userReactions={reactions[post.id] ?? []}
              editing={editingPostId === post.id}
              editText={editText}
              onReact={(type) => handleReaction(post.id, type)}
              onComment={(body, parentId) => handleAddComment(post.id, body, parentId)}
              onDeleteComment={(commentId) => handleDeleteComment(commentId, post.id)}
              onDelete={() => handleDelete(post.id)}
              onStartEdit={() => { setEditingPostId(post.id); setEditText(post.body); }}
              onCancelEdit={() => { setEditingPostId(null); setEditText(''); }}
              onSaveEdit={() => handleEdit(post.id, editText)}
              onEditTextChange={(text) => setEditText(text)}
              onPin={() => handlePin(post.id, !!post.pinned)}
              currentUserId={profile?.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Reaction config — NO EMOJIS, Phosphor icons only ── */
const REACTION_CONFIG: { type: ReactionType; icon: React.ReactNode; label: string }[] = [
  { type: 'like', icon: <ThumbsUp size={16} weight="bold" />, label: 'Like' },
  { type: 'fire', icon: <Fire size={16} weight="bold" />, label: 'Fire' },
  { type: 'heart', icon: <Heart size={16} weight="bold" />, label: 'Love' },
];

/* ── Reaction button — a small satisfying pop on tap.
 *  The pop is a transform-only spring (scale), so it stays on the GPU. Under
 *  reduced motion the pop is dropped and the button settles to a still active
 *  state. The toggle handler is unchanged; this only adds the feedback. ── */
function ReactionButton({
  icon, label, count, active, onReact,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  active: boolean;
  onReact: () => void;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.button
      type="button"
      className={`feed__reaction ${active ? 'feed__reaction--active' : ''}`}
      onClick={onReact}
      title={label}
      aria-pressed={active}
      whileTap={reduceMotion ? undefined : { scale: 0.86 }}
      transition={{ type: 'spring', stiffness: 600, damping: 18, mass: 0.5 }}
    >
      {icon} {count}
    </motion.button>
  );
}

/* ── Post Card ── */
function PostCard({
  post, isOwner, isAdmin, comments, userReactions, editing, editText,
  onReact, onComment, onDeleteComment, onDelete, onStartEdit, onCancelEdit, onSaveEdit, onEditTextChange, onPin, currentUserId,
}: {
  post: Post;
  isOwner: boolean;
  isAdmin: boolean;
  comments: Comment[];
  userReactions: string[];
  editing: boolean;
  editText: string;
  onReact: (type: ReactionType) => void;
  onComment: (body: string, parentId: string | null) => void;
  onDeleteComment: (commentId: string) => void;
  onDelete: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditTextChange: (text: string) => void;
  onPin: () => void;
  currentUserId?: string;
}) {
  const author = getMemberById(post.author_id);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const topComments = comments.filter((c) => !c.parent_id);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    }
    if (showMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);

  function handleCommentSubmit(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && commentText.trim()) {
      onComment(commentText, null);
      setCommentText('');
    }
  }

  const categoryLabel = CATEGORIES.find((c) => c.id === post.category)?.label;
  const accent = accentForCategory(post.category);

  return (
    <GlowCard
      as="article"
      accent={accent}
      className={`feed__post ${post.pinned ? 'feed__post--pinned' : ''}`}
    >
      <div className="feed__post-header">
        {author && <Avatar member={author} size="md" />}
        <div className="feed__post-meta">
          <div className="feed__post-meta-top">
            <span className="feed__post-author">{author?.display_name ?? 'Community Member'}</span>
            {author && <span className="level-badge">Lvl {author.level} · {getLevelName(author.level)}</span>}
            <span className="feed__post-time">{timeAgo(post.created_at)}</span>
          </div>
          {categoryLabel && post.category !== 'general' && (
            <span className="feed__post-category">
              {CATEGORY_ICONS[post.category] && <span className="feed__cat-icon">{CATEGORY_ICONS[post.category]}</span>}
              {categoryLabel}
            </span>
          )}
        </div>

        {(isOwner || isAdmin) && (
          <div className="feed__menu-wrap" ref={menuRef}>
            <button className="feed__menu-btn" onClick={() => setShowMenu(!showMenu)} title="Options">
              <DotsThree size={22} weight="bold" />
            </button>
            {showMenu && (
              <div className="feed__menu">
                {isAdmin && (
                  <button className="feed__menu-item" onClick={() => { onPin(); setShowMenu(false); }}>
                    <PushPin size={16} /> {post.pinned ? 'Unpin' : 'Pin to top'}
                  </button>
                )}
                {isOwner && (
                  <button className="feed__menu-item" onClick={() => { onStartEdit(); setShowMenu(false); }}>
                    <Pencil size={16} /> Edit
                  </button>
                )}
                <button className="feed__menu-item feed__menu-item--danger" onClick={() => { onDelete(); setShowMenu(false); }}>
                  <Trash size={16} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {post.pinned && <div className="feed__pinned-badge"><PushPin size={14} /> Pinned</div>}

      {editing ? (
        <div className="feed__edit-wrap">
          <textarea className="feed__composer-input" value={editText} onChange={(e) => onEditTextChange(e.target.value)} rows={3} autoFocus />
          <div className="feed__edit-actions">
            <button className="btn btn--primary btn--sm" onClick={onSaveEdit} disabled={!editText.trim()}>Save</button>
            <button className="btn btn--ghost btn--sm" onClick={onCancelEdit}><X size={16} /> Cancel</button>
          </div>
        </div>
      ) : (
        <>
          {post.body && <p className="feed__post-body">{post.body}</p>}
          {post.media_urls && post.media_urls.length > 0 && (
            <div className="feed__post-media">
              {post.media_urls.map((url, i) => (
                <a
                  key={`${url}-${i}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="feed__post-media-item"
                >
                  <img src={url} alt={`Post media ${i + 1}`} loading="lazy" />
                </a>
              ))}
            </div>
          )}
        </>
      )}

      <div className="feed__post-footer">
        <div className="feed__reactions">
          {REACTION_CONFIG.map(({ type, icon, label }) => (
            <ReactionButton
              key={type}
              icon={icon}
              label={label}
              count={post.reaction_counts[type]}
              active={userReactions.includes(type)}
              onReact={() => onReact(type)}
            />
          ))}
        </div>
        <button className="feed__comment-toggle" onClick={() => setShowComments(!showComments)}>
          <ChatCircle size={16} /> {post.comment_count ?? 0}
        </button>
      </div>

      {showComments && (
        <div className="feed__comments">
          {topComments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              allComments={comments}
              isOwner={c.author_id === currentUserId}
              isAdmin={isAdmin}
              onReply={(body) => onComment(body, c.id)}
              onDelete={() => onDeleteComment(c.id)}
            />
          ))}
          <div className="feed__comment-input-row">
            <input
              type="text"
              className="feed__comment-input"
              placeholder="Write a comment... (Enter to submit)"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleCommentSubmit}
            />
          </div>
          {topComments.length === 0 && !commentText && (
            <p className="feed__no-comments">No comments yet. Be the first!</p>
          )}
        </div>
      )}
    </GlowCard>
  );
}

/* ── Comment ── */
function CommentItem({ comment, allComments, isOwner, isAdmin, onReply, onDelete }: {
  comment: Comment;
  allComments: Comment[];
  isOwner: boolean;
  isAdmin: boolean;
  onReply: (body: string) => void;
  onDelete: () => void;
}) {
  const author = getMemberById(comment.author_id);
  const replies = allComments.filter((c) => c.parent_id === comment.id);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');

  function handleReplySubmit(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && replyText.trim()) {
      onReply(replyText);
      setReplyText('');
      setShowReply(false);
    }
  }

  return (
    <div className="feed__comment">
      <div className="feed__comment-header">
        {author && <Avatar member={author} size="sm" />}
        <span className="feed__comment-author">{author?.display_name ?? 'Member'}</span>
        <span className="feed__comment-time">{timeAgo(comment.created_at)}</span>
        {(isOwner || isAdmin) && (
          <button className="feed__comment-delete" onClick={onDelete} title="Delete comment">
            <Trash size={14} />
          </button>
        )}
      </div>
      <p className="feed__comment-body">{comment.body}</p>
      {comment.media_urls && comment.media_urls.length > 0 && (
        <div className="feed__comment-media">
          {comment.media_urls.map((url, i) => (
            <a
              key={`${url}-${i}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="feed__comment-media-item"
            >
              <img src={url} alt={`Comment media ${i + 1}`} loading="lazy" />
            </a>
          ))}
        </div>
      )}
      <button className="feed__reply-btn" onClick={() => setShowReply(!showReply)}>Reply</button>

      {showReply && (
        <div className="feed__reply-input-row">
          <input type="text" className="feed__comment-input" placeholder="Reply... (Enter)" value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={handleReplySubmit} autoFocus />
        </div>
      )}

      {replies.map((r) => {
        const replyAuthor = getMemberById(r.author_id);
        return (
          <div key={r.id} className="feed__comment feed__reply">
            <div className="feed__comment-header">
              {replyAuthor && <Avatar member={replyAuthor} size="sm" />}
              <span className="feed__comment-author">{replyAuthor?.display_name ?? 'Member'}</span>
              <span className="feed__comment-time">{timeAgo(r.created_at)}</span>
            </div>
            <p className="feed__comment-body">{r.body}</p>
            {r.media_urls && r.media_urls.length > 0 && (
              <div className="feed__comment-media">
                {r.media_urls.map((url, i) => (
                  <a
                    key={`${url}-${i}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="feed__comment-media-item"
                  >
                    <img src={url} alt={`Reply media ${i + 1}`} loading="lazy" />
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
