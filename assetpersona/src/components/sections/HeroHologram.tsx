import { useEffect, useRef, useState } from 'react';
import './HeroHologram.css';

/**
 * Operational scan line behind the hero. A single beam sweeps top → bottom; each
 * time it passes the readout row it advances the status line (with a write-in
 * reveal). One scan, one readout — back in its original bottom-left spot. No
 * grid, no colored orbs, no floating icons, no pulse dots. aria-hidden, z-index 0.
 */
const FEED = [
  'agentic runtime · online',
  'ingest source · 1,204 chunks',
  'embed concepts · index ready',
  'compose course · 6 modules',
  'generate practice · games live',
  'tutor · grounded in source',
  'compile module · ok',
  'commit progress · synced',
];

const PERIOD_MS = 5000;
const READOUT_Y = 80; // matches the original bottom-left readout position

export default function HeroHologram() {
  const beamRef = useRef<HTMLDivElement>(null);
  const idxRef = useRef(0);
  const [line, setLine] = useState({ text: FEED[0], v: 0 });

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (mq?.matches) return; // hold static — no sweeping beam, no rewrites

    let raf = 0;
    let start = 0;
    let prevY = -2;

    const tick = (ts: number) => {
      if (!start) start = ts;
      const phase = ((ts - start) % PERIOD_MS) / PERIOD_MS; // 0 → 1
      const y = phase * 104 - 2; // sweeps -2% → 102%
      if (beamRef.current) beamRef.current.style.top = `${y}%`;

      if (y < prevY) {
        prevY = -2; // beam wrapped back to the top
      } else {
        if (prevY < READOUT_Y && y >= READOUT_Y) {
          idxRef.current = (idxRef.current + 1) % FEED.length;
          const next = FEED[idxRef.current];
          setLine((l) => ({ text: next, v: l.v + 1 }));
        }
        prevY = y;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="holo" aria-hidden="true">
      <div className="holo__readout" style={{ top: `${READOUT_Y}%` }}>
        <span className="holo__readout-prompt">&gt;</span>
        <span key={line.v} className="holo__readout-text">{line.text}</span>
        <span className="holo__readout-caret" />
      </div>
      <div className="holo__scan" ref={beamRef} />
    </div>
  );
}
