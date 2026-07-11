/* ═══ ADMIN DASHBOARD — Full Site Control ═══ */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, BarChart3, Users, BookOpen, Radio, ShoppingBag,
  FileText, Settings, Calendar, TrendingUp, Eye
} from 'lucide-react';
import { Article, GraduationCap, Lightning } from '@phosphor-icons/react';
import SEOHead from '../components/seo/SEOHead';
import { useScrollReveal, useStaggerReveal } from '../hooks/useGSAP';
import { STUDYHALL_TIERS } from '../data/studyhallTiers';
import { MODULES } from '../data/modules';
import './Admin.css';

type AdminTab = 'overview' | 'content' | 'studyhall' | 'workshops' | 'shop';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const headerRef = useScrollReveal({ y: 30, duration: 0.6 });
  const cardRef = useStaggerReveal('.admin-dash__stat', { stagger: 0.08, y: 25, duration: 0.5 });

  const upcomingWorkshops: { id: string; title: string; date: string; time: string; status: string }[] = [];

  const TABS: { id: AdminTab; label: string; icon: typeof BarChart3 }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'studyhall', label: 'Study Hall', icon: BookOpen },
    { id: 'workshops', label: 'Workshops', icon: Radio },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
  ];

  return (
    <>
      <SEOHead title="Admin Dashboard" path="/admin" />

      <div className="admin-dash">
        <div className="container">
          {/* ── HEADER ── */}
          <div className="admin-dash__header" ref={headerRef}>
            <Link to="/" className="admin-dash__back">
              <ArrowLeft size={16} /> Back to site
            </Link>
            <h1 className="admin-dash__title">
              Command <span className="text-accent-blue">Center</span>
            </h1>
          </div>

          {/* ── TABS ── */}
          <div className="admin-dash__tabs">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`admin-dash__tab ${activeTab === id ? 'admin-dash__tab--active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <div className="admin-dash__overview">
              <div className="admin-dash__stats" ref={cardRef}>
                <div className="admin-dash__stat liquid-glass">
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--blue">
                    <Article size={22} weight="duotone" />
                  </div>
                  <div>
                    <p className="admin-dash__stat-number">—</p>
                    <p className="admin-dash__stat-label">Blog Posts</p>
                  </div>
                </div>

                <div className="admin-dash__stat liquid-glass">
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--salmon">
                    <Users size={22} />
                  </div>
                  <div>
                    <p className="admin-dash__stat-number">—</p>
                    <p className="admin-dash__stat-label">Members</p>
                  </div>
                </div>

                <div className="admin-dash__stat liquid-glass">
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--green">
                    <Lightning size={22} weight="fill" />
                  </div>
                  <div>
                    <p className="admin-dash__stat-number">{upcomingWorkshops.length}</p>
                    <p className="admin-dash__stat-label">Upcoming Workshops</p>
                  </div>
                </div>

                <div className="admin-dash__stat liquid-glass">
                  <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
                    <GraduationCap size={22} weight="duotone" />
                  </div>
                  <div>
                    <p className="admin-dash__stat-number">{MODULES.length}</p>
                    <p className="admin-dash__stat-label">Course Modules</p>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="admin-dash__quick-grid">
                <Link to="/admin/blog" className="admin-dash__quick liquid-glass">
                  <FileText size={20} />
                  <div>
                    <h3>Content Studio</h3>
                    <p>Manage blog posts, SEO scores, and AEO</p>
                  </div>
                  <ArrowLeft size={14} className="admin-dash__quick-arrow" />
                </Link>

                <Link to="/community/settings" className="admin-dash__quick liquid-glass">
                  <Settings size={20} />
                  <div>
                    <h3>Community Settings</h3>
                    <p>Manage courses, levels, and group config</p>
                  </div>
                  <ArrowLeft size={14} className="admin-dash__quick-arrow" />
                </Link>

                <Link to="/live" className="admin-dash__quick liquid-glass">
                  <Radio size={20} />
                  <div>
                    <h3>View Live Page</h3>
                    <p>Check workshop schedule and giveaways</p>
                  </div>
                  <ArrowLeft size={14} className="admin-dash__quick-arrow" />
                </Link>

                <Link to="/business" className="admin-dash__quick liquid-glass">
                  <TrendingUp size={20} />
                  <div>
                    <h3>Business Page</h3>
                    <p>Review B2B consulting and automation tiers</p>
                  </div>
                  <ArrowLeft size={14} className="admin-dash__quick-arrow" />
                </Link>
              </div>
            </div>
          )}

          {/* ── CONTENT TAB ── */}
          {activeTab === 'content' && (
            <div className="admin-dash__panel">
              <div className="admin-dash__panel-header">
                <h2>Content Management</h2>
                <Link to="/admin/blog" className="btn btn--primary btn--sm">
                  <Eye size={14} /> Open Content Studio
                </Link>
              </div>
              <p className="text-secondary">
                The full Content Studio with SEO scoring, AEO rich results, and Google Preview is available at the dedicated page.
              </p>
            </div>
          )}

          {/* ── STUDY HALL TAB ── */}
          {activeTab === 'studyhall' && (
            <div className="admin-dash__panel">
              <div className="admin-dash__panel-header">
                <h2>Study Hall Management</h2>
              </div>

              <h3 className="admin-dash__sub-title">Active Tiers</h3>
              <div className="admin-dash__tier-grid">
                {STUDYHALL_TIERS.map((tier) => (
                  <div key={tier.id} className="admin-dash__tier-item liquid-glass">
                    <h4>{tier.name}</h4>
                    <span className="admin-dash__tier-price">
                      {tier.price === null ? 'Free' : `$${tier.price}${tier.interval}`}
                    </span>
                    <p className="text-secondary text-sm">{tier.tagline}</p>
                    <div className="admin-dash__tier-enrolled">
                      <Users size={14} /> — enrolled
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="admin-dash__sub-title">Course Modules ({MODULES.length})</h3>
              <div className="admin-dash__module-list">
                {MODULES.map((mod) => (
                  <div key={mod.id} className="admin-dash__module-item liquid-glass">
                    <div>
                      <h4>{mod.title}</h4>
                      <p className="text-secondary text-sm">{mod.lessons.length} lessons · {mod.tier}</p>
                    </div>
                    <span className={`admin-dash__module-badge admin-dash__module-badge--${mod.tier}`}>
                      {mod.tier}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── WORKSHOPS TAB ── */}
          {activeTab === 'workshops' && (
            <div className="admin-dash__panel">
              <div className="admin-dash__panel-header">
                <h2>Workshop Management</h2>
                <Link to="/live" className="btn btn--secondary btn--sm">
                  <Eye size={14} /> View Live Page
                </Link>
              </div>

              <h3 className="admin-dash__sub-title">Upcoming Sessions ({upcomingWorkshops.length})</h3>
              <div className="admin-dash__module-list">
                {upcomingWorkshops.length === 0 && (
                  <p className="text-secondary">No upcoming workshops. Create events via the Event Manager.</p>
                )}
                {upcomingWorkshops.map((ws: { id: string; title: string; date: string; time: string; status: string }) => (
                  <div key={ws.id} className="admin-dash__module-item liquid-glass">
                    <div>
                      <h4>{ws.title}</h4>
                      <p className="text-secondary text-sm">
                        <Calendar size={12} /> {new Date(ws.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {' · '}{ws.time}
                      </p>
                    </div>
                    <span className="admin-dash__module-badge admin-dash__module-badge--upcoming">
                      {ws.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SHOP TAB ── */}
          {activeTab === 'shop' && (
            <div className="admin-dash__panel">
              <div className="admin-dash__panel-header">
                <h2>Shop Management</h2>
                <Link to="/shop" className="btn btn--secondary btn--sm">
                  <Eye size={14} /> View Shop
                </Link>
              </div>
              <p className="text-secondary">
                Full product CRUD is live. <Link to="/admin/products">Open Product Manager →</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
