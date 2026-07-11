import { useMemo } from 'react';
import './KineticHeadline.css';

type Props = {
  kicker?: string;
  headline: string;
  accent?: string;
  subhead?: string;
  as?: 'h1' | 'h2';
  className?: string;
};

function splitLines(text: string) {
  // Intentional “authored” line breaks using a simple delimiter.
  // Caller can pass `headline` with `|` to force breaks.
  return text
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function KineticHeadline({
  kicker,
  headline,
  accent,
  subhead,
  as = 'h2',
  className,
}: Props) {
  const Tag = as;
  const lines = useMemo(() => splitLines(headline), [headline]);

  return (
    <header className={['kinetic', className ?? ''].join(' ')}>
      {kicker ? <p className="kinetic__kicker">{kicker}</p> : null}

      <Tag className="kinetic__headline" aria-label={headline.replaceAll('|', ' ')}>
        <span className="kinetic__outline" aria-hidden="true">
          {lines.map((l, i) => (
            <span key={i} className="kinetic__line">
              <span className="kinetic__lineInner">{l}</span>
            </span>
          ))}
        </span>
        <span className="kinetic__fill">
          {lines.map((l, i) => (
            <span key={i} className="kinetic__line">
              <span className="kinetic__lineInner">{l}</span>
            </span>
          ))}
        </span>
      </Tag>

      {accent ? <div className="kinetic__accent">{accent}</div> : null}
      {subhead ? <p className="kinetic__subhead">{subhead}</p> : null}
    </header>
  );
}

