import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChatCircle,
  Question,
  Lock,
  ShieldCheck,
  Plus,
  Trash,
  Sparkle,
  GraduationCap,
  FilePdf,
  CheckCircle,
  Wrench,
  Database,
  MonitorPlay,
  Flame,
  Trophy,
  Briefcase,
  Code,
  Lightning
} from '@phosphor-icons/react';
import { getMembers, getPosts, getLevelName, getNextLevel, updateMember } from '../../data/communityData';
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { isBypassActive } from '../../lib/devBypass';
import { useAuth } from '../../context/useAuth';
import { canDmMember, startThreadWith } from '../../data/messages';
import type { Profile as ProfileType } from '../../types/supabase';
import { getCredentials } from '../../data/credentialsStore';
import type { Credential } from '../../data/credentialsStore';
import { listMyCompletions, listPublishedModules } from '../../data/learnStore';
import PortfolioGrid from '../../components/community/PortfolioGrid';
import SkillRadarGraph from '../../components/profile/SkillRadarGraph';
import '../../components/profile/SkillRadarGraph.css';
import './Profile.css';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return 'Just now';
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

type ExtendedProfile = ProfileType & {
  points?: number;
  level?: number;
  cover_url?: string | null;
  social_links?: Record<string, string> | null;
  bio?: string | null;
  visibility?: 'private' | 'unlisted' | 'public' | null;
  resume_url?: string | null;
  currently_studying?: string[];
  stickers?: any;
  custom_references?: any;
};

// Sticker types catalog definition (no emojis, uses vector icon references)
export const STICKER_CATALOG: Record<string, { label: string; iconName: string; colorClass: string }> = {
  'ai-apprentice': { label: 'AI Apprentice', iconName: 'GraduationCap', colorClass: 'sticker--salmon' },
  'vibe-builder': { label: 'Vibe Builder', iconName: 'Wrench', colorClass: 'sticker--purple' },
  'prompt-master': { label: 'Prompt Master', iconName: 'Sparkle', colorClass: 'sticker--blue' },
  'rag-architect': { label: 'RAG Architect', iconName: 'Database', colorClass: 'sticker--emerald' },
  'talk-watcher': { label: 'Talk Watcher', iconName: 'MonitorPlay', colorClass: 'sticker--indigo' },
  'streak-fire': { label: 'On Fire', iconName: 'Flame', colorClass: 'sticker--orange' },
  'trophy-winner': { label: 'Trophy Winner', iconName: 'Trophy', colorClass: 'sticker--gold' },
  'stripe-earner': { label: 'Builder Pro', iconName: 'Briefcase', colorClass: 'sticker--green' },
  'code-wizard': { label: 'Code Wizard', iconName: 'Code', colorClass: 'sticker--cyan' },
  'lightning-fast': { label: 'Lightning Fast', iconName: 'Lightning', colorClass: 'sticker--yellow' },
};

const renderStickerIcon = (iconName: string) => {
  switch (iconName) {
    case 'GraduationCap': return <GraduationCap size={14} weight="fill" />;
    case 'Wrench': return <Wrench size={14} weight="fill" />;
    case 'Sparkle': return <Sparkle size={14} weight="fill" />;
    case 'Database': return <Database size={14} weight="fill" />;
    case 'MonitorPlay': return <MonitorPlay size={14} weight="fill" />;
    case 'Flame': return <Flame size={14} weight="fill" />;
    case 'Trophy': return <Trophy size={14} weight="fill" />;
    case 'Briefcase': return <Briefcase size={14} weight="fill" />;
    case 'Code': return <Code size={14} weight="fill" />;
    case 'Lightning': return <Lightning size={14} weight="fill" />;
    default: return <Sparkle size={14} weight="fill" />;
  }
};

export default function Profile() {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const { profile: viewer } = useAuth();
  const localMembers = getMembers();
  const localMember = localMembers.find((m) => m.id === memberId);
  const [remoteMember, setRemoteMember] = useState<ExtendedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'posts' | 'portfolio' | 'about'>('posts');
  const [opening, setOpening] = useState(false);

  // Sticker customize state
  const [isEditingStickers, setIsEditingStickers] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [originalStickers, setOriginalStickers] = useState<any[]>([]);

  // Add peer reference state
  const [isAddingReference, setIsAddingReference] = useState(false);
  const [refAuthor, setRefAuthor] = useState('');
  const [refTitle, setRefTitle] = useState('');
  const [refRelationship, setRefRelationship] = useState('');
  const [refQuote, setRefQuote] = useState('');

  // Learning journey timeline state
  const [completions, setCompletions] = useState<any[]>([]);
  const [allModules, setAllModules] = useState<any[]>([]);

  // Pull live profile from Supabase when configured + not in bypass.
  // Falls back cleanly to the localStorage stub for dev / unauthenticated.
  useEffect(() => {
    let cancelled = false;
    if (!memberId) {
      setLoading(false);
      return;
    }
    if (isBypassActive() || !isSupabaseConfigured) {
      setRemoteMember(localMember ?? null);
      setLoading(false);
      return;
    }
    void (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', memberId)
        .maybeSingle();
      if (!cancelled) {
        setRemoteMember((data as ExtendedProfile) ?? localMember ?? null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [memberId, localMember]);

  // Live Supabase row wins when present; otherwise the local stub.
  const member = (remoteMember ?? localMember) as ExtendedProfile | undefined;

  const [userCredentials, setUserCredentials] = useState<Credential[]>([]);
  useEffect(() => {
    if (member?.display_name) {
      getCredentials().then(creds => {
        const filtered = creds.filter(c => c.recipientName.toLowerCase() === member.display_name.toLowerCase());
        setUserCredentials(filtered);
      });
    }
  }, [member?.display_name]);

  // Load completed modules timeline data
  useEffect(() => {
    if (member?.id) {
      listMyCompletions(member.id)
        .then((data) => {
          setCompletions(data);
        })
        .catch((err) => console.error('Timeline completions load failed:', err));

      listPublishedModules()
        .then((data) => {
          setAllModules(data);
        })
        .catch((err) => console.error('Timeline modules load failed:', err));
    }
  }, [member?.id]);

  if (loading && !member) {
    return (
      <div className="profile">
        <Link to="/community/members" className="profile__back"><ArrowLeft size={20} /> Back to Members</Link>
        <p className="profile__empty">Loading profile…</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div>
        <Link to="/community/members" className="profile__back"><ArrowLeft size={20} /> Back to Members</Link>
        <p>Member not found.</p>
      </div>
    );
  }

  const level = member.level ?? 1;
  const points = member.points ?? 0;
  const nextLevel = getNextLevel(level);
  const progress = nextLevel ? Math.min(100, Math.round((points / nextLevel.points_required) * 100)) : 100;
  const userPosts = getPosts().filter((p) => p.author_id === member.id);

  /* AP-ENGAGEMENT-LOOP-2026-05 · Lane 7 — Portfolio tab visibility. */
  const isViewingOwnProfile = !!viewer && viewer.id === member.id;
  const portfolioVisible = isViewingOwnProfile || member.visibility !== 'private';

  const stickers = Array.isArray(member.stickers) ? member.stickers : [];
  const customReferences = Array.isArray(member.custom_references) ? member.custom_references : [];
  const currentlyStudying = Array.isArray(member.currently_studying) ? member.currently_studying : [];

  const timelineItems = completions.map((comp) => {
    const mod = allModules.find((m) => m.id === comp.module_id);
    return {
      id: comp.id,
      title: mod ? mod.title : 'Learning Module Checkpoint',
      type: mod ? mod.type : 'concept',
      completed_at: comp.completed_at,
      xp_earned: comp.xp_earned,
      reflect_text: comp.reflect_text
    };
  });

  const saveProfileData = async (nextFields: Partial<ExtendedProfile>) => {
    if (!member) return;
    const updated = { ...member, ...nextFields };
    setRemoteMember(updated);

    if (isSupabaseConfigured && !isBypassActive()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('profiles')
        .update(nextFields)
        .eq('id', member.id);
      if (error) {
        console.error('DB update error:', error);
      }
    } else {
      updateMember(member.id, nextFields);
    }
  };

  const handleBannerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditingStickers || !selectedSticker) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newSticker = {
      id: Math.random().toString(36).substring(2, 11),
      type: selectedSticker,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10
    };

    setRemoteMember((prev) => {
      if (!prev) return null;
      const prevStickers = Array.isArray(prev.stickers) ? prev.stickers : [];
      return {
        ...prev,
        stickers: [...prevStickers, newSticker]
      };
    });
  };

  const startEditingStickers = () => {
    setOriginalStickers(stickers);
    setIsEditingStickers(true);
    setSelectedSticker('prompt-master');
  };

  const saveStickers = async () => {
    await saveProfileData({ stickers });
    setIsEditingStickers(false);
  };

  const cancelEditingStickers = () => {
    setRemoteMember((prev) => (prev ? { ...prev, stickers: originalStickers } : null));
    setIsEditingStickers(false);
  };

  const handleAddReferenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refAuthor || !refQuote) return;

    const newRef = {
      id: Math.random().toString(36).substring(2, 11),
      author_name: refAuthor,
      author_title: refTitle,
      relationship: refRelationship,
      quote: refQuote,
      created_at: new Date().toISOString()
    };

    const nextRefs = [...customReferences, newRef];
    await saveProfileData({ custom_references: nextRefs });

    setRefAuthor('');
    setRefTitle('');
    setRefRelationship('');
    setRefQuote('');
    setIsAddingReference(false);
  };

  const handleDeleteReference = async (refId: string) => {
    if (!confirm('Are you sure you want to remove this peer reference?')) return;
    const nextRefs = customReferences.filter((r: any) => r.id !== refId);
    await saveProfileData({ custom_references: nextRefs });
  };

  return (
    <div className="profile">
      <Link to="/community/members" className="profile__back"><ArrowLeft size={20} /> Back</Link>
      
      <div
        className={`profile__cover ${isEditingStickers ? 'is-editing' : ''}`}
        style={
          member.cover_url
            ? { backgroundImage: `url(${member.cover_url})` }
            : undefined
        }
        onClick={handleBannerClick}
      >
        {/* Render Placed Sticker Badges */}
        {stickers.map((s: any) => {
          const detail = STICKER_CATALOG[s.type] || STICKER_CATALOG['prompt-master'];
          return (
            <div
              key={s.id}
              className={`profile__placed-sticker ${detail.colorClass} ${isEditingStickers ? 'is-removable' : ''}`}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              onClick={(e) => {
                if (isEditingStickers) {
                  e.stopPropagation();
                  setRemoteMember((prev) => {
                    if (!prev) return null;
                    const prevStickers = Array.isArray(prev.stickers) ? prev.stickers : [];
                    return {
                      ...prev,
                      stickers: prevStickers.filter((x: any) => x.id !== s.id)
                    };
                  });
                }
              }}
              title={detail.label}
            >
              <span className="sticker-badge-icon">
                {renderStickerIcon(detail.iconName)}
              </span>
              <span className="sticker-badge-label">{detail.label}</span>
              {isEditingStickers && <span className="sticker-remove-badge">×</span>}
            </div>
          );
        })}

        {isViewingOwnProfile && !isEditingStickers && (
          <button
            type="button"
            className="profile__edit-banner-btn"
            onClick={(e) => {
              e.stopPropagation();
              startEditingStickers();
            }}
          >
            <Sparkle size={14} /> Customize Banner
          </button>
        )}
      </div>

      {isEditingStickers && (
        <div className="profile__sticker-editor-controls" onClick={(e) => e.stopPropagation()}>
          <span className="controls-label">Select sticker badge below, then click cover image to stick it:</span>
          <div className="sticker-palette">
            {Object.entries(STICKER_CATALOG).map(([key, item]) => (
              <button
                key={key}
                type="button"
                className={`sticker-palette-item ${item.colorClass} ${selectedSticker === key ? 'is-selected' : ''}`}
                onClick={() => setSelectedSticker(key)}
                title={item.label}
              >
                {renderStickerIcon(item.iconName)}
                <span style={{ fontSize: '11px', fontWeight: 600 }}>{item.label}</span>
              </button>
            ))}
          </div>
          <div className="controls-actions">
            <button type="button" className="btn btn--primary btn--sm" onClick={saveStickers}>Save Banner</button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={cancelEditingStickers}>Cancel</button>
          </div>
        </div>
      )}

      <div className="profile__header">
        <h1 className="profile__name">{member.display_name}</h1>
        <div className="profile__badges">
          <span className="level-badge">Lvl {level} · {getLevelName(level)}</span>
          <span className="profile__points">{points} pts</span>
          {member.role === 'admin' && <span className="profile__admin-badge">Admin</span>}
          {member.role === 'moderator' && <span className="profile__mod-badge">Moderator</span>}
        </div>
        
        {member.bio && <p className="profile__bio">{member.bio}</p>}

        {member.resume_url && (
          <div className="profile__resume-wrapper">
            <a
              href={member.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="profile__resume-btn"
            >
              <FilePdf size={16} /> View Resume
            </a>
          </div>
        )}

        {member.social_links && Object.keys(member.social_links).length > 0 && (
          <ul className="profile__social-list">
            {Object.entries(member.social_links).map(([k, url]) => (
              <li key={k}>
                <a href={url as string} target="_blank" rel="noopener noreferrer">
                  {k}
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* DM CTA — tier-gated */}
        {viewer && viewer.id !== member.id && (() => {
          const gate = canDmMember(
            { id: viewer.id, role: viewer.role, tier: (viewer as any).tier ?? null },
            { id: member.id, role: member.role, tier: (member as any).tier ?? null },
          );

          if (gate.allowed) {
            return (
              <button
                type="button"
                className="btn btn--primary profile__message-btn"
                disabled={opening}
                onClick={async () => {
                  setOpening(true);
                  try {
                    const threadId = await startThreadWith(member.id);
                    if (threadId) navigate(`/community/messages/${threadId}`);
                  } finally {
                    setOpening(false);
                  }
                }}
              >
                <ChatCircle size={16} /> {opening ? 'Opening…' : 'Message'}
              </button>
            );
          }

          if (gate.reason === 'admin-target-needs-private') {
            return (
              <div className="profile__message-gate">
                <Link to="/faq" className="btn btn--ghost profile__message-btn">
                  <Question size={16} /> Ask Frank publicly
                </Link>
                <p className="profile__message-hint">
                  Private 1:1 messages with Frank are a Private Lessons perk.{' '}
                  <Link to="/agenticstudyhall#pricing">See plans</Link>.
                </p>
              </div>
            );
          }

          if (gate.reason === 'viewer-not-paid' || gate.reason === 'target-not-paid') {
            return (
              <div className="profile__message-gate">
                <button type="button" className="btn btn--ghost profile__message-btn" disabled>
                  <Lock size={16} /> Message
                </button>
                <p className="profile__message-hint">
                  Member messages are a Cohort+ perk.{' '}
                  <Link to="/agenticstudyhall#pricing">See plans</Link>.
                </p>
              </div>
            );
          }

          return null;
        })()}
      </div>

      {nextLevel && (
        <div className="profile__level-progress">
          <div className="profile__level-bar"><div className="profile__level-fill" style={{ width: `${progress}%` }} /></div>
          <span className="profile__level-label">{points} / {nextLevel.points_required} pts to Level {nextLevel.level} ({nextLevel.name})</span>
        </div>
      )}

      {userCredentials.length > 0 && (
        <div className="profile__credentials-showcase">
          <h3 className="credentials-showcase-title">Verified Certifications</h3>
          <div className="credentials-badge-grid">
            {userCredentials.map((cred) => (
              <Link to={`/community/credentials/${cred.verificationCode}`} key={cred.id} className="badge-showcase-card">
                <div className="badge-icon-wrapper">
                  <ShieldCheck size={24} className="badge-shield-icon" />
                </div>
                <div className="badge-details">
                  <span className="badge-card-name">{cred.courseOrTestName}</span>
                  <span className="badge-meta">{cred.type} · Score: {cred.score}% ({cred.percentile})</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="community-tabs">
        <button className={`community-tab ${tab === 'posts' ? 'community-tab--active' : ''}`} onClick={() => setTab('posts')}>Posts</button>
        {portfolioVisible && (
          <button
            className={`community-tab ${tab === 'portfolio' ? 'community-tab--active' : ''}`}
            onClick={() => setTab('portfolio')}
          >
            Portfolio
          </button>
        )}
        <button className={`community-tab ${tab === 'about' ? 'community-tab--active' : ''}`} onClick={() => setTab('about')}>About & Learning</button>
      </div>

      {tab === 'posts' && (
        <div className="profile__posts">
          {userPosts.length === 0 && <p className="profile__empty">No posts yet.</p>}
          {userPosts.map((post) => (
            <div key={post.id} className="community-card profile__post">
              <p>{post.body}</p>
              <span className="profile__post-time">{timeAgo(post.created_at)}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'portfolio' && portfolioVisible && (
        <div className="profile__portfolio-tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <SkillRadarGraph memberId={member.id} />
          <PortfolioGrid
            profileId={member.id}
            editable={isViewingOwnProfile}
            className="profile__portfolio"
          />
        </div>
      )}

      {tab === 'about' && (
        <div className="profile__about-grid">
          {/* Left Panel: Profile info & Currently Studying */}
          <div className="profile__about-column">
            <div className="community-card profile__info-card">
              <h3 className="profile__section-title">General Info</h3>
              <div className="profile__about-row">
                <span className="profile__about-label">Joined</span>
                <span>{new Date(member.joined_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="profile__about-row">
                <span className="profile__about-label">Level</span>
                <span>{getLevelName(level)}</span>
              </div>
              <div className="profile__about-row">
                <span className="profile__about-label">Points</span>
                <span>{points} pts</span>
              </div>
            </div>

            <div className="community-card profile__studying-card">
              <div className="profile__section-header">
                <h3 className="profile__section-title">Currently Studying</h3>
                {isViewingOwnProfile && (
                  <Link to="/community/user-settings" className="profile__manage-link">
                    Manage
                  </Link>
                )}
              </div>
              {currentlyStudying.length === 0 ? (
                <p className="profile__empty-inline">No active topics declared.</p>
              ) : (
                <div className="profile__studying-tags">
                  {currentlyStudying.map((topic, i) => (
                    <span key={i} className="profile__studying-tag">
                      <GraduationCap size={12} style={{ marginRight: '4px' }} />
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Completed Modules Timeline */}
          <div className="profile__about-column">
            <div className="community-card profile__timeline-card">
              <h3 className="profile__section-title">Learning Journey</h3>
              {timelineItems.length === 0 ? (
                <p className="profile__empty-inline">No modules completed yet. Start learning to build a timeline!</p>
              ) : (
                <div className="profile__timeline">
                  {timelineItems.slice(0, 10).map((item, idx) => (
                    <div key={item.id || idx} className="profile__timeline-item">
                      <div className="profile__timeline-icon">
                        <CheckCircle size={16} weight="fill" className="profile__timeline-check" />
                      </div>
                      <div className="profile__timeline-content">
                        <div className="profile__timeline-header">
                          <span className="profile__timeline-title">{item.title}</span>
                          <span className="profile__timeline-date">{timeAgo(item.completed_at)}</span>
                        </div>
                        <div className="profile__timeline-sub">
                          <span className="profile__timeline-type">{item.type.replace('_', ' ')}</span>
                          <span className="profile__timeline-xp">+{item.xp_earned} XP</span>
                        </div>
                        {item.reflect_text && (
                          <div className="profile__timeline-reflection">
                            "{item.reflect_text}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Peer References & Testimonials Section */}
          <div className="profile__references-container">
            <div className="profile__section-header">
              <h3 className="profile__section-title">Peer Recommendations</h3>
              {isViewingOwnProfile && (
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => setIsAddingReference(true)}
                >
                  <Plus size={14} style={{ marginRight: '4px' }} /> Request Reference
                </button>
              )}
            </div>

            {customReferences.length === 0 ? (
              <div className="community-card profile__references-empty">
                <p className="profile__empty-inline">No references added yet. Ask peers or collaborators to endorse your project contributions!</p>
              </div>
            ) : (
              <div className="profile__references-grid">
                {customReferences.map((ref: any) => (
                  <div key={ref.id} className="community-card profile__reference-card">
                    {isViewingOwnProfile && (
                      <button
                        type="button"
                        className="profile__delete-ref-btn"
                        onClick={() => handleDeleteReference(ref.id)}
                        title="Delete reference"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                    <div className="profile__reference-quote">
                      "{ref.quote}"
                    </div>
                    <div className="profile__reference-author">
                      <div className="profile__reference-avatar">
                        {ref.author_name.charAt(0)}
                      </div>
                      <div className="profile__reference-info">
                        <div className="profile__reference-name">{ref.author_name}</div>
                        {ref.author_title && <div className="profile__reference-title">{ref.author_title}</div>}
                        {ref.relationship && <div className="profile__reference-rel">{ref.relationship}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Reference Modal Overlay */}
      {isAddingReference && (
        <div className="profile__modal-backdrop" onClick={() => setIsAddingReference(false)}>
          <div className="profile__modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="profile__modal-title">Add Reference & Recommendation</h3>
            <form onSubmit={handleAddReferenceSubmit} className="profile__modal-form">
              <div className="profile__form-group">
                <label className="profile__form-label">Author Name</label>
                <input
                  type="text"
                  required
                  className="profile__form-input"
                  placeholder="e.g. Sarah Jenkins"
                  value={refAuthor}
                  onChange={(e) => setRefAuthor(e.target.value)}
                />
              </div>
              <div className="profile__form-group">
                <label className="profile__form-label">Job Title & Company</label>
                <input
                  type="text"
                  className="profile__form-input"
                  placeholder="e.g. Senior UX Designer at Google"
                  value={refTitle}
                  onChange={(e) => setRefTitle(e.target.value)}
                />
              </div>
              <div className="profile__form-group">
                <label className="profile__form-label">Relationship / Context</label>
                <input
                  type="text"
                  className="profile__form-input"
                  placeholder="e.g. Collaborated on Prompt Design Module"
                  value={refRelationship}
                  onChange={(e) => setRefRelationship(e.target.value)}
                />
              </div>
              <div className="profile__form-group">
                <label className="profile__form-label">Recommendation Text</label>
                <textarea
                  required
                  rows={4}
                  className="profile__form-input profile__form-textarea"
                  placeholder="Tell others what it is like working with this user..."
                  value={refQuote}
                  onChange={(e) => setRefQuote(e.target.value)}
                />
              </div>
              <div className="profile__modal-actions">
                <button type="submit" className="btn btn--primary">Save Reference</button>
                <button type="button" className="btn btn--ghost" onClick={() => setIsAddingReference(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
