/* ═══ SIGN LIBRARY — browsable gallery of neon signs ═══
 *
 * GRASSHOPPER-SIGNS-2026-07 · Lane 3
 *
 * Gallery page with category filtering, preset + user signs,
 * and a "Create New Sign" CTA that links to the Sign Studio.
 * Each sign card is a compact NeonSign component with hover lift.
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, FunnelSimple, Sparkle, Trash, Copy,
} from '@phosphor-icons/react';
import { NeonSign, hexToRgb } from '../../components/ui';
import {
  getAllSigns, deleteSign, duplicateSign,
  SIGN_CATEGORIES,
} from '../../data/signLibrary';
import type { SignCategory, SignData } from '../../data/signLibrary';
import './SignLibrary.css';

export default function SignLibrary() {
  const [category, setCategory] = useState<SignCategory>('all');
  const [signs, setSigns] = useState<SignData[]>(getAllSigns());

  const filtered = useMemo(() => {
    if (category === 'all') return signs;
    if (category === 'custom') return signs.filter(s => !s.isPreset);
    return signs.filter(s => s.tags.includes(category));
  }, [category, signs]);

  const handleDelete = (id: string) => {
    const updated = deleteSign(id);
    setSigns([...updated, ...getAllSigns().filter(s => s.isPreset)]);
  };

  const handleDuplicate = (id: string) => {
    duplicateSign(id);
    setSigns(getAllSigns());
  };

  return (
    <div className="sign-library community">
      {/* Header */}
      <header className="sign-library__header">
        <div className="sign-library__header-text">
          <h1 className="sign-library__title">
            <Sparkle size={24} weight="fill" />
            Neon Signs
          </h1>
          <p className="sign-library__subtitle">
            Browse the collection or create your own glowing masterpiece
          </p>
        </div>
        <Link to="/community/signs/studio" className="sign-library__create-btn">
          <Plus size={18} weight="bold" />
          Create Sign
        </Link>
      </header>

      {/* Category filter */}
      <nav className="sign-library__filters" aria-label="Filter signs by category">
        <FunnelSimple size={16} weight="bold" className="sign-library__filter-icon" />
        {SIGN_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`sign-library__filter ${category === cat.id ? 'sign-library__filter--active' : ''}`}
            onClick={() => setCategory(cat.id)}
            aria-pressed={category === cat.id}
          >
            {cat.label}
          </button>
        ))}
      </nav>

      {/* Gallery grid */}
      {filtered.length === 0 ? (
        <div className="sign-library__empty">
          <Sparkle size={48} weight="thin" />
          <p>No signs here yet.</p>
          <Link to="/community/signs/studio" className="sign-library__empty-cta">
            Create your first sign
          </Link>
        </div>
      ) : (
        <div className="sign-library__grid">
          {filtered.map(sign => (
            <article key={sign.id} className="sign-library__card">
              <NeonSign
                text={sign.text}
                color={sign.color}
                customRgb={sign.color === 'custom' && sign.customHex ? hexToRgb(sign.customHex) : undefined}
                font={sign.font}
                backdrop={sign.backdrop}
                animation={sign.animation}
                size="sm"
                compact
              />
              <div className="sign-library__card-actions">
                <button
                  className="sign-library__card-btn"
                  onClick={() => handleDuplicate(sign.id)}
                  title="Duplicate"
                >
                  <Copy size={14} weight="bold" />
                </button>
                {!sign.isPreset && (
                  <button
                    className="sign-library__card-btn sign-library__card-btn--danger"
                    onClick={() => handleDelete(sign.id)}
                    title="Delete"
                  >
                    <Trash size={14} weight="bold" />
                  </button>
                )}
              </div>
              <div className="sign-library__card-meta">
                <span className="sign-library__card-tag">
                  {sign.isPreset ? 'Preset' : 'Custom'}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
