/* ═══ SIGN STUDIO — neon sign builder / customizer ═══
 *
 * GRASSHOPPER-SIGNS-2026-07 · Lane 2
 *
 * Step-by-step builder: Type → Style → Preview → Save.
 * Live preview updates instantly as the user types and adjusts settings.
 * Signs save to the local sign library and can be posted to the feed.
 */

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  TextT, Palette, Eye, FloppyDisk, ShareNetwork, ArrowLeft,
  PaintBrush, TextAa, Sparkle,
} from '@phosphor-icons/react';
import { NeonSign, NEON_FONTS, COLOR_HEX, hexToRgb } from '../../components/ui';
import type { NeonColor, NeonBackdrop, NeonAnimation, NeonSize, NeonFontId } from '../../components/ui';
import { createSign } from '../../data/signLibrary';
import { useAuth } from '../../context/useAuth';
import './SignStudio.css';

const BACKDROPS: { id: NeonBackdrop; label: string }[] = [
  { id: 'dark', label: 'Dark' },
  { id: 'brick', label: 'Brick' },
  { id: 'wood', label: 'Wood' },
  { id: 'concrete', label: 'Concrete' },
  { id: 'gradient', label: 'Gradient' },
];

const ANIMATIONS: { id: NeonAnimation; label: string; desc: string }[] = [
  { id: 'static', label: 'Static', desc: 'No animation' },
  { id: 'breathe', label: 'Breathe', desc: 'Gentle pulse' },
  { id: 'flicker', label: 'Flicker', desc: 'Neon tube stutter' },
  { id: 'warm-up', label: 'Warm Up', desc: 'Tube turn-on' },
];

const SIZES: { id: NeonSize; label: string }[] = [
  { id: 'sm', label: 'S' },
  { id: 'md', label: 'M' },
  { id: 'lg', label: 'L' },
  { id: 'xl', label: 'XL' },
];

const PRESET_COLORS: { id: Exclude<NeonColor, 'custom'>; label: string }[] = [
  { id: 'pink', label: 'Hot Pink' },
  { id: 'blue', label: 'Electric Blue' },
  { id: 'green', label: 'Neon Green' },
  { id: 'white', label: 'Warm White' },
  { id: 'violet', label: 'Violet' },
];

type StudioStep = 'text' | 'style' | 'preview';

const STEPS: { id: StudioStep; label: string; icon: typeof TextT }[] = [
  { id: 'text', label: 'Text', icon: TextT },
  { id: 'style', label: 'Style', icon: PaintBrush },
  { id: 'preview', label: 'Preview', icon: Eye },
];

export default function SignStudio() {
  const { profile } = useAuth();
  const [step, setStep] = useState<StudioStep>('text');
  const [text, setText] = useState('Be Cool');
  const [color, setColor] = useState<NeonColor>('pink');
  const [customHex, setCustomHex] = useState('#ff00de');
  const [font, setFont] = useState<NeonFontId>('neonderthaw');
  const [backdrop, setBackdrop] = useState<NeonBackdrop>('brick');
  const [animation, setAnimation] = useState<NeonAnimation>('breathe');
  const [size, setSize] = useState<NeonSize>('lg');
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    createSign({
      text,
      color,
      customHex: color === 'custom' ? customHex : undefined,
      font,
      backdrop,
      animation,
      size,
      authorId: profile?.id ?? null,
      tags: ['custom'],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  }, [text, color, customHex, font, backdrop, animation, size, profile?.id]);

  const customRgb = color === 'custom' ? hexToRgb(customHex) : undefined;

  return (
    <div className="sign-studio community">
      {/* Header */}
      <header className="sign-studio__header">
        <Link to="/community/signs" className="sign-studio__back">
          <ArrowLeft size={18} weight="bold" />
          Sign Library
        </Link>
        <h1 className="sign-studio__title">
          <Sparkle size={22} weight="fill" />
          Sign Studio
        </h1>
      </header>

      {/* Step indicator */}
      <nav className="sign-studio__steps" aria-label="Builder steps">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            className={`sign-studio__step ${step === s.id ? 'sign-studio__step--active' : ''}`}
            onClick={() => setStep(s.id)}
            aria-current={step === s.id ? 'step' : undefined}
          >
            <span className="sign-studio__step-number">{i + 1}</span>
            <s.icon size={16} weight={step === s.id ? 'fill' : 'regular'} />
            {s.label}
          </button>
        ))}
      </nav>

      <div className="sign-studio__layout">
        {/* Live preview */}
        <section className="sign-studio__preview" aria-label="Live sign preview">
          <NeonSign
            text={text || 'Type something...'}
            color={color}
            customRgb={customRgb}
            font={font}
            backdrop={backdrop}
            animation={animation}
            size={size}
          />
        </section>

        {/* Controls panel */}
        <section className="sign-studio__controls" aria-label="Sign settings">
          {step === 'text' && (
            <div className="sign-studio__panel">
              <h2 className="sign-studio__panel-title">
                <TextT size={18} weight="bold" />
                Sign Text
              </h2>
              <textarea
                className="sign-studio__textarea"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type your neon sign text..."
                rows={3}
                maxLength={60}
                autoFocus
              />
              <p className="sign-studio__hint">{text.length}/60 characters · Use Enter for line breaks</p>

              <h3 className="sign-studio__label">Size</h3>
              <div className="sign-studio__chips">
                {SIZES.map(s => (
                  <button
                    key={s.id}
                    className={`sign-studio__chip ${size === s.id ? 'sign-studio__chip--active' : ''}`}
                    onClick={() => setSize(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <button className="sign-studio__next" onClick={() => setStep('style')}>
                Next: Style <PaintBrush size={16} weight="bold" />
              </button>
            </div>
          )}

          {step === 'style' && (
            <div className="sign-studio__panel">
              <h2 className="sign-studio__panel-title">
                <Palette size={18} weight="bold" />
                Color
              </h2>
              <div className="sign-studio__color-grid">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c.id}
                    className={`sign-studio__color-swatch ${color === c.id ? 'sign-studio__color-swatch--active' : ''}`}
                    style={{ '--swatch-color': COLOR_HEX[c.id] } as React.CSSProperties}
                    onClick={() => setColor(c.id)}
                    aria-label={c.label}
                    title={c.label}
                  />
                ))}
                <label className={`sign-studio__color-swatch sign-studio__color-swatch--custom ${color === 'custom' ? 'sign-studio__color-swatch--active' : ''}`}>
                  <input
                    type="color"
                    value={customHex}
                    onChange={e => { setCustomHex(e.target.value); setColor('custom'); }}
                    className="sign-studio__color-input"
                  />
                </label>
              </div>

              <h3 className="sign-studio__label">
                <TextAa size={16} weight="bold" />
                Font
              </h3>
              <div className="sign-studio__font-grid">
                {NEON_FONTS.map(f => (
                  <button
                    key={f.id}
                    className={`sign-studio__font-btn ${font === f.id ? 'sign-studio__font-btn--active' : ''}`}
                    style={{ fontFamily: f.family }}
                    onClick={() => setFont(f.id)}
                  >
                    {f.name}
                  </button>
                ))}
              </div>

              <h3 className="sign-studio__label">Backdrop</h3>
              <div className="sign-studio__chips">
                {BACKDROPS.map(b => (
                  <button
                    key={b.id}
                    className={`sign-studio__chip ${backdrop === b.id ? 'sign-studio__chip--active' : ''}`}
                    onClick={() => setBackdrop(b.id)}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              <h3 className="sign-studio__label">Animation</h3>
              <div className="sign-studio__animation-grid">
                {ANIMATIONS.map(a => (
                  <button
                    key={a.id}
                    className={`sign-studio__animation-btn ${animation === a.id ? 'sign-studio__animation-btn--active' : ''}`}
                    onClick={() => setAnimation(a.id)}
                  >
                    <strong>{a.label}</strong>
                    <span>{a.desc}</span>
                  </button>
                ))}
              </div>

              <div className="sign-studio__nav-row">
                <button className="sign-studio__back-btn" onClick={() => setStep('text')}>
                  Back
                </button>
                <button className="sign-studio__next" onClick={() => setStep('preview')}>
                  Preview <Eye size={16} weight="bold" />
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="sign-studio__panel">
              <h2 className="sign-studio__panel-title">
                <Eye size={18} weight="bold" />
                Your Sign
              </h2>
              <p className="sign-studio__preview-text">
                Looking good? Save it to your library or share it to the feed.
              </p>

              <div className="sign-studio__action-grid">
                <button
                  className={`sign-studio__save-btn ${saved ? 'sign-studio__save-btn--saved' : ''}`}
                  onClick={handleSave}
                  disabled={saved}
                >
                  <FloppyDisk size={18} weight="bold" />
                  {saved ? 'Saved!' : 'Save to Library'}
                </button>
                <Link to="/community/signs" className="sign-studio__share-btn">
                  <ShareNetwork size={18} weight="bold" />
                  View Library
                </Link>
              </div>

              <button className="sign-studio__back-btn" onClick={() => setStep('style')}>
                Back to Style
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
