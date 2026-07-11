import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../hooks/useGSAP';
import './Narrative.css';

export default function Narrative() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!titleRef.current || !sectionRef.current) return;

    const el = titleRef.current;
    const original = el.innerHTML;

    // Split into words, preserving HTML spans
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = original;

    const walkTextNodes = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = (node.textContent || '').split(/(\s+)/);
        return words
          .map((w) =>
            w.trim()
              ? `<span class="narrative__word" style="display:inline-block">${w}</span>`
              : w
          )
          .join('');
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const tag = el.tagName.toLowerCase();
        const attrs = Array.from(el.attributes)
          .map((a) => `${a.name}="${a.value}"`)
          .join(' ');
        const inner = Array.from(node.childNodes).map(walkTextNodes).join('');
        if (tag === 'br') return '<br />';
        return `<${tag} ${attrs}>${inner}</${tag}>`;
      }
      return '';
    };

    el.innerHTML = Array.from(tempDiv.childNodes).map(walkTextNodes).join('');

    const wordEls = el.querySelectorAll('.narrative__word');

    gsap.from(wordEls, {
      y: 30,
      opacity: 0,
      duration: 0.5,
      stagger: 0.06,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
    });

    return () => {
      el.innerHTML = original;
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section className="narrative section" ref={sectionRef}>
      <div className="narrative__glow" aria-hidden="true" />
      <div className="container">
        <div className="narrative__heading">
          <h2 className="narrative__title" ref={titleRef}>
            <span className="text-accent-salmon">Where AI Expertise</span>
            <br />
            Meets
            <br />
            Creative Storytelling
          </h2>

          <div className="narrative__links">
            <Link to="/portfolio" className="narrative__link">
              Projects <ArrowUpRight size={16} />
            </Link>
            <Link to="/blog" className="narrative__link">
              Articles <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
