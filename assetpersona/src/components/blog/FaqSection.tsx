/* ═══ FaqSection — visually rendered FAQ block on a blog post ═══
 *
 * Existing BlogPost.tsx already emits FAQ JSON-LD for SEO. This component
 * renders the same items VISIBLY — accordion pattern, accessible disclosure.
 */
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FAQItem } from '../../content/blog';
import './FaqSection.css';

interface Props {
  items: FAQItem[];
  heading?: string;
}

export default function FaqSection({ items, heading = 'Frequently asked' }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  if (!items || items.length === 0) return null;

  return (
    <section className="post-faq" aria-labelledby="post-faq-h">
      <h2 id="post-faq-h">{heading}</h2>
      <ul>
        {items.map((it, i) => {
          const isOpen = openIdx === i;
          return (
            <li key={i} className={isOpen ? 'is-open' : ''}>
              <button
                type="button"
                className="post-faq__q"
                aria-expanded={isOpen}
                onClick={() => setOpenIdx(isOpen ? null : i)}
              >
                <span>{it.question}</span>
                <ChevronDown size={16} />
              </button>
              {isOpen && (
                <div className="post-faq__a">
                  <p>{it.answer}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
