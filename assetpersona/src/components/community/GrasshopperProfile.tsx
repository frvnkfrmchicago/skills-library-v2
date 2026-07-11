/* ═══ GRASSHOPPER PROFILE — brand profile with sign gallery ═══
 *
 * GRASSHOPPER-SIGNS-2026-07 · Lane 5
 *
 * The Grasshopper brand profile page: hero section with neon branding,
 * description, and a gallery of featured signs from the library.
 * Acts as a showcase / portfolio for the Grasshopper identity.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkle, Plus, Bug, MapPin, Globe, Lightning,
} from '@phosphor-icons/react';
import { NeonSign, hexToRgb } from '../../components/ui';
import { getPresets, getUserSigns } from '../../data/signLibrary';
import type { SignData } from '../../data/signLibrary';
import './GrasshopperProfile.css';

export default function GrasshopperProfile() {
  const [featuredSigns, setFeaturedSigns] = useState<SignData[]>([]);

  useEffect(() => {
    /* Show user signs first, then fill with presets up to 6 */
    const user = getUserSigns();
    const presets = getPresets();
    const combined = [...user, ...presets].slice(0, 6);
    setFeaturedSigns(combined);
  }, []);

  return (
    <div className="gh-profile community">
      {/* Hero section with neon branding */}
      <section className="gh-profile__hero">
        <div className="gh-profile__hero-bg" aria-hidden="true" />
        <div className="gh-profile__hero-content">
          <NeonSign
            text="Grasshopper"
            color="green"
            font="neonderthaw"
            backdrop="dark"
            animation="warm-up"
            size="xl"
          />
        </div>
      </section>

      {/* Profile info */}
      <section className="gh-profile__info">
        <div className="gh-profile__avatar">
          <Bug size={40} weight="fill" />
        </div>
        <div className="gh-profile__details">
          <h1 className="gh-profile__name">
            Grasshopper
            <Lightning size={18} weight="fill" className="gh-profile__verified" />
          </h1>
          <p className="gh-profile__handle">@grazzhopper</p>
          <p className="gh-profile__bio">
            Curating vibes through neon. Building custom signs that glow different.
            Browse the collection, create your own, and light up your space.
          </p>
          <div className="gh-profile__meta">
            <span className="gh-profile__meta-item">
              <MapPin size={14} weight="bold" />
              The Internet
            </span>
            <span className="gh-profile__meta-item">
              <Globe size={14} weight="bold" />
              signstudio.grasshopper
            </span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="gh-profile__stats">
        <div className="gh-profile__stat">
          <span className="gh-profile__stat-value">{featuredSigns.length}</span>
          <span className="gh-profile__stat-label">Signs</span>
        </div>
        <div className="gh-profile__stat">
          <span className="gh-profile__stat-value">12</span>
          <span className="gh-profile__stat-label">Presets</span>
        </div>
        <div className="gh-profile__stat">
          <span className="gh-profile__stat-value">5</span>
          <span className="gh-profile__stat-label">Colors</span>
        </div>
        <div className="gh-profile__stat">
          <span className="gh-profile__stat-value">6</span>
          <span className="gh-profile__stat-label">Fonts</span>
        </div>
      </section>

      {/* Featured signs gallery */}
      <section className="gh-profile__gallery">
        <header className="gh-profile__gallery-header">
          <h2 className="gh-profile__section-title">
            <Sparkle size={20} weight="fill" />
            Featured Signs
          </h2>
          <Link to="/community/signs/studio" className="gh-profile__gallery-cta">
            <Plus size={16} weight="bold" />
            Create New
          </Link>
        </header>

        <div className="gh-profile__gallery-grid">
          {featuredSigns.map(sign => (
            <article key={sign.id} className="gh-profile__gallery-card">
              <NeonSign
                text={sign.text}
                color={sign.color}
                customRgb={sign.color === 'custom' && sign.customHex ? hexToRgb(sign.customHex) : undefined}
                font={sign.font}
                backdrop={sign.backdrop}
                animation={sign.animation}
                size="sm"
                compact
                interactive
              />
            </article>
          ))}
        </div>

        <div className="gh-profile__gallery-footer">
          <Link to="/community/signs" className="gh-profile__view-all">
            View All Signs →
          </Link>
        </div>
      </section>
    </div>
  );
}
