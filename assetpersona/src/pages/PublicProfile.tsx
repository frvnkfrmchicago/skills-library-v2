/* ═══ /u/:handle — public profile page ═══
 *
 * AP-ENGAGEMENT-LOOP-2026-05 · Lane 3
 *
 * Renders a public profile keyed by `handle`. Three-state visibility model:
 *   - 'private'  : page returns 404 for everyone except the owner
 *   - 'unlisted' : renders fully on direct visit, but isn't indexed/listed
 *   - 'public'   : same as unlisted PLUS SEO-discoverable + listed
 *
 * RLS in 20260520100300_public_profile.sql does the actual gating — this
 * component just unwraps the response and renders 404 when it comes back null.
 *
 * Portfolio mount comes from Lane 4 via Lane 7's coordinator pass. This page
 * leaves a stable `<section id="portfolio">` slot ready for that wire-up.
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Globe,
  Link as LinkIcon,
  Trophy,
  CheckCircle,
  Spinner,
  ArrowRight,
} from '@phosphor-icons/react';
import SEOHead from '../components/seo/SEOHead';
import NotFound from './NotFound';
import {
  getByHandle,
  type PublicProfilePayload,
} from '../data/publicProfile';
import { useAuth } from '../context/useAuth';
/* AP-ENGAGEMENT-LOOP-2026-05 · Lane 7 — Portfolio mount.
 * Lane 3 reserved <section id="portfolio"> here. Lane 4's PortfolioGrid
 * fills that slot with the member's pinned projects. Private profiles
 * never reach this branch (RLS + the kind-of-not-found handler upstream). */
import PortfolioGrid from '../components/community/PortfolioGrid';
import './PublicProfile.css';

const BASE_URL = 'https://www.assetpersona.com';

export default function PublicProfile() {
  const { handle } = useParams<{ handle: string }>();
  const { user } = useAuth();
  const [state, setState] = useState<
    | { kind: 'loading' }
    | { kind: 'not-found' }
    | { kind: 'loaded'; data: PublicProfilePayload }
  >({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    if (!handle) {
      setState({ kind: 'not-found' });
      return;
    }
    setState({ kind: 'loading' });
    void (async () => {
      const payload = await getByHandle(handle);
      if (cancelled) return;
      if (!payload) {
        setState({ kind: 'not-found' });
        return;
      }
      // Private rows that came through RLS belong to the owner. We still want
      // /u/:handle to act as "not found" for a private profile so the owner
      // sees the same external shape as visitors — they can flip to public/
      // unlisted from Settings and re-visit.
      if (payload.profile.visibility === 'private') {
        setState({ kind: 'not-found' });
        return;
      }
      setState({ kind: 'loaded', data: payload });
    })();
    return () => {
      cancelled = true;
    };
  }, [handle]);

  if (state.kind === 'loading') {
    return (
      <div className="pubprof pubprof--loading">
        <Spinner size={28} className="pubprof__spinner" />
        <p>Loading profile…</p>
      </div>
    );
  }

  if (state.kind === 'not-found') {
    return <NotFound />;
  }

  const { profile, credentials, modulesCompleted } = state.data;
  const isUnlisted = profile.visibility === 'unlisted';
  const isPublic = profile.visibility === 'public';
  const viewerIsAuthed = !!user;

  // Surface socials in a stable order so the row doesn't reshuffle on render.
  const socials = profile.social_links
    ? Object.entries(profile.social_links).filter(([, url]) => !!url)
    : [];

  return (
    <>
      <SEOHead
        title={`${profile.display_name} · @${profile.handle ?? ''}`}
        description={profile.bio ?? `${profile.display_name} on Asset Persona`}
        path={`/u/${profile.handle ?? ''}`}
        image={profile.avatar_url ?? undefined}
      />
      {/* Unlisted profiles get noindex so search engines don't surface them. */}
      {isUnlisted && (
        <meta name="robots" content="noindex,nofollow" />
      )}

      <article className="pubprof">
        <header
          className="pubprof__cover"
          style={
            profile.cover_url
              ? { backgroundImage: `url(${profile.cover_url})` }
              : undefined
          }
        >
          <div className="pubprof__avatar-wrap">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="pubprof__avatar"
              />
            ) : (
              <div className="pubprof__avatar pubprof__avatar--initial" aria-hidden="true">
                {profile.display_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </header>

        <section className="pubprof__identity">
          <h1 className="pubprof__name">{profile.display_name}</h1>
          {profile.handle && (
            <p className="pubprof__handle">@{profile.handle}</p>
          )}

          <div className="pubprof__badges">
            <span className="pubprof__pill">Lvl {profile.level}</span>
            <span className="pubprof__pill pubprof__pill--muted">{profile.points} pts</span>
            {profile.role === 'admin' && (
              <span className="pubprof__pill pubprof__pill--admin">Founder</span>
            )}
            {profile.role === 'moderator' && (
              <span className="pubprof__pill pubprof__pill--mod">Moderator</span>
            )}
            {isUnlisted && (
              <span className="pubprof__pill pubprof__pill--unlisted" title="This profile is unlisted">
                <LinkIcon size={12} weight="bold" /> Unlisted
              </span>
            )}
          </div>

          {profile.bio && <p className="pubprof__bio">{profile.bio}</p>}

          {socials.length > 0 && (
            <ul className="pubprof__socials">
              {socials.map(([key, url]) => (
                <li key={key}>
                  <a href={url} target="_blank" rel="noopener noreferrer me">
                    <Globe size={14} /> {key}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="pubprof__stats" aria-label="Activity">
          <div className="pubprof__stat">
            <strong>{modulesCompleted}</strong>
            <span>Module{modulesCompleted === 1 ? '' : 's'} completed</span>
          </div>
          <div className="pubprof__stat">
            <strong>{credentials.length}</strong>
            <span>Credential{credentials.length === 1 ? '' : 's'} earned</span>
          </div>
          <div className="pubprof__stat">
            <strong>
              {new Date(profile.joined_at).toLocaleDateString(undefined, {
                month: 'short',
                year: 'numeric',
              })}
            </strong>
            <span>Joined</span>
          </div>
        </section>

        {credentials.length > 0 && (
          <section className="pubprof__section" aria-label="Credentials">
            <h2 className="pubprof__h2"><Trophy size={20} weight="duotone" /> Credentials</h2>
            <ul className="pubprof__cred-grid">
              {credentials.map((c) => (
                <li key={c.id} className="pubprof__cred">
                  <Link
                    to={`/c/${c.share_id}`}
                    className="pubprof__cred-link"
                  >
                    <span className="pubprof__cred-kind">{c.kind === 'certificate' ? 'Certificate' : 'Badge'}</span>
                    <span className="pubprof__cred-label">{c.label}</span>
                    <span className="pubprof__cred-date">
                      <CheckCircle size={14} weight="fill" />
                      {new Date(c.earned_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Stable slot for Lane 4's PortfolioGrid (wired by Lane 7). */}
        <section id="portfolio" className="pubprof__section" aria-label="Portfolio">
          <PortfolioGrid profileId={profile.id} />
        </section>

        {/* Sticky bottom CTA for unauthenticated viewers — drives signup loop */}
        {!viewerIsAuthed && isPublic && (
          <aside className="pubprof__signup-cta" role="complementary">
            <p>
              <strong>Want your own profile?</strong>{' '}
              Join Asset Persona — practical AI literacy, daily modules, your own share URL.
            </p>
            <Link
              to={`/login?intent=signup&ref=${encodeURIComponent(`/u/${profile.handle}`)}`}
              className="btn btn--primary btn--sm"
            >
              Join free <ArrowRight size={14} />
            </Link>
          </aside>
        )}

        {/* Canonical link footer — helps visitors confirm the URL on share */}
        <footer className="pubprof__footer">
          <span>{BASE_URL}/u/{profile.handle}</span>
        </footer>
      </article>
    </>
  );
}
