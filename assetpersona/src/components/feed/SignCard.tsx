/* ═══ SIGN CARD — neon sign preview card for the community feed ═══
 *
 * GRASSHOPPER-SIGNS-2026-07 · Lane 4
 *
 * Renders a compact NeonSign inside a feed-compatible card with
 * author attribution and interaction hooks. Designed to drop into
 * the existing Feed post stream as a rich media attachment.
 *
 * Usage in feed posts:
 *   <SignCard sign={signData} onOpen={() => navigate(`/community/signs/${sign.id}`)} />
 */

import { Link } from 'react-router-dom';
import { Sparkle, ArrowSquareOut } from '@phosphor-icons/react';
import { NeonSign, hexToRgb } from '../ui';
import type { SignData } from '../../data/signLibrary';
import './SignCard.css';

export interface SignCardProps {
  /** The sign data to render. */
  sign: SignData;
  /** Optional click handler (e.g. navigate to full sign view). */
  onOpen?: () => void;
  /** Show author attribution. */
  showAuthor?: boolean;
  /** Compact mode for tighter layouts. */
  compact?: boolean;
}

/**
 * SignCard renders a neon sign as a feed-embeddable card.
 * Wraps the NeonSign component in a card surface with metadata.
 */
export function SignCard({ sign, onOpen, compact = false }: SignCardProps) {
  const customRgb = sign.color === 'custom' && sign.customHex
    ? hexToRgb(sign.customHex)
    : undefined;

  return (
    <article className={`sign-card ${compact ? 'sign-card--compact' : ''}`}>
      <div className="sign-card__preview" onClick={onOpen} role={onOpen ? 'button' : undefined} tabIndex={onOpen ? 0 : undefined}>
        <NeonSign
          text={sign.text}
          color={sign.color}
          customRgb={customRgb}
          font={sign.font}
          backdrop={sign.backdrop}
          animation={sign.animation}
          size="sm"
          compact
        />
      </div>

      <footer className="sign-card__footer">
        <div className="sign-card__meta">
          <Sparkle size={14} weight="fill" className="sign-card__icon" />
          <span className="sign-card__label">
            {sign.isPreset ? 'Neon Sign' : 'Custom Sign'}
          </span>
        </div>
        <Link to="/community/signs" className="sign-card__link" title="View in library">
          <ArrowSquareOut size={14} weight="bold" />
        </Link>
      </footer>
    </article>
  );
}

export default SignCard;
