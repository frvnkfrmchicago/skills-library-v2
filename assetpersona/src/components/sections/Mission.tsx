import { useRef, useEffect } from 'react';
import { LinkedinLogo } from '@phosphor-icons/react';
import { gsap, ScrollTrigger, useStaggerReveal } from '../../hooks/useGSAP';
import './Mission.css';

export default function Mission() {
  const outlineRef = useRef<HTMLDivElement>(null);
  const containerRef = useStaggerReveal('.mission__block', {
    stagger: 0.2,
    y: 50,
    duration: 0.8,
  });

  // Parallax on outline text
  useEffect(() => {
    if (!outlineRef.current) return;

    gsap.to(outlineRef.current, {
      y: -80,
      ease: 'none',
      scrollTrigger: {
        trigger: outlineRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section className="mission section" ref={containerRef}>
      <div className="container">
        {/* Outline text background with parallax */}
        <div className="mission__outline" ref={outlineRef} aria-hidden="true">ASSET</div>

        <div className="mission__grid">
          <div className="mission__block">
            <p className="text-uppercase text-accent-salmon">Our Mission</p>
            <h3 className="mission__heading">AI for All</h3>
            <p className="mission__text">
              We teach the game of AI and help creators, professionals, and businesses
              play it better: with AI literacy, AI integration, and the tools to
              outpace competition in the digital economy.
            </p>
            <p className="mission__text">
              AI is your personal asset. With Asset Persona, it becomes your
              pro-level power-up.
            </p>
          </div>

          <div className="mission__block">
            <p className="text-uppercase text-accent-blue">Our Purpose</p>
            <h3 className="mission__heading">AI & Tech Education</h3>
            <p className="mission__text">
              We exist to democratize AI technology by making it understandable
              and actionable for everyone. Through our integrated approach to
              AI literacy, AI integration, custom avatar development, and
              strategic marketing solutions, we help clients maintain authentic
              brand identity while capitalizing on AI efficiencies.
            </p>
          </div>

          <div className="mission__block mission__leadership">
            <p className="text-uppercase text-accent-blue">Leadership</p>
            <h3 className="mission__heading">
              <a
                href="https://www.linkedin.com/in/frankdlawrencejr/"
                target="_blank"
                rel="noopener noreferrer"
                className="mission__leader-link"
              >
                Frank Lawrence, Jr.
                <LinkedinLogo size={20} weight="duotone" />
              </a>
            </h3>
            <p className="mission__text">
              AI Integration Specialist, AI Literacy Educator, and Digital
              Marketing Specialist. A Morehouse College graduate with a degree
              in Psychology, he applies a human-first lens to AI marketing,
              combining data, design, and vibe coding to create educational
              AI content.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
