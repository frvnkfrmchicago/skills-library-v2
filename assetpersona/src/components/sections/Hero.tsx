import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import HeroHologram from './HeroHologram';
import './Hero.css';

const HERO_IMAGES = [
  '/images/hero/hero-learning.webp',
  '/images/hero/hero-building.webp',
  '/images/hero/hero-marketing.webp',
];

const WORDS = ['Learning', 'Building', 'Marketing'] as const;

export default function Hero() {
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Cycle underline + image every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero">
      <HeroHologram />
      <div className={`hero__fullwidth ${visible ? 'hero--visible' : ''}`}>

        {/* ── HEADLINE — "Agentic" leads at full size; beam scans the middle line ── */}
        <h1 className="hero__title">
          <span className="hero__title-line0">Agentic</span>
          <span className="hero__title-line1">
            {WORDS.map((word, i) => (
              <span key={word} className="hero__word-wrapper">
                {i > 0 && (i === 2 ? ', & ' : ', ')}
                <span className={`hero__word ${i === activeIndex ? 'hero__word--scanning' : ''}`}>
                  {word}
                </span>
              </span>
            ))}
          </span>
          <span className="hero__title-line2">for Humans</span>
        </h1>

        {/* ── TRIPTYCH: left copy / center image / right copy ── */}
        <div className="hero__triptych">

          <div className="hero__copy hero__copy--left">
            <p>We teach the game of AI.<br />
            Creators, Professionals, &amp; Businesses play it better</p>
          </div>

          <div className="hero__visual-center">
            {HERO_IMAGES.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`${WORDS[i]} AI`}
                className={`hero__cycle-image ${i === activeIndex ? 'hero__cycle-image--active' : ''}`}
                width={800}
                height={800}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'auto'}
                decoding="async"
              />
            ))}
          </div>

          <div className="hero__copy hero__copy--right">
            <p>AI fluency, strategic automation, &amp; other tools to outpace competition in the digital economy.</p>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="hero__cta">
          <Link to="/login?mode=signup" className="btn btn--primary magnetic-btn">
            Join Free <ArrowRight size={16} />
          </Link>
          <Link to="/shop" className="btn btn--ghost magnetic-btn">
            Browse Products
          </Link>
        </div>
      </div>
    </section>
  );
}
