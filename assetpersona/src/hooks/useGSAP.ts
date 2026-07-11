import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP as useGSAPCore } from '@gsap/react';

/**
 * Lazy ScrollTrigger registration.
 *
 * Previously `gsap.registerPlugin(ScrollTrigger)` ran at module top level,
 * which meant any import of this file (transitive or direct) forced GSAP +
 * ScrollTrigger to register on mount of EVERY route — including admin and
 * community pages that never scroll-animate anything.
 *
 * Now we register exactly once, on the first hook invocation. The module
 * load itself is cheap (just the JS), and the registration cost moves to
 * the first scroll-animated route. Admin / community routes never pay.
 *
 * See: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
 */
let scrollTriggerRegistered = false;
function ensureScrollTrigger() {
  if (scrollTriggerRegistered) return;
  gsap.registerPlugin(ScrollTrigger);
  scrollTriggerRegistered = true;
}

export { useGSAPCore, gsap, ScrollTrigger };

/**
 * Stagger-in children of a container on scroll.
 * Attach the returned ref to the parent element.
 */
export function useStaggerReveal(
  selector: string,
  options?: { stagger?: number; y?: number; duration?: number; start?: string }
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAPCore(
    () => {
      if (!containerRef.current) return;
      ensureScrollTrigger();
      const targets = containerRef.current.querySelectorAll(selector);
      if (!targets.length) return;

      gsap.from(targets, {
        y: options?.y ?? 40,
        opacity: 0,
        duration: options?.duration ?? 0.8,
        stagger: options?.stagger ?? 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: options?.start ?? 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    },
    { scope: containerRef, dependencies: [] }
  );

  return containerRef;
}

/**
 * Animate a single element in on scroll.
 */
export function useScrollReveal(options?: {
  y?: number;
  duration?: number;
  start?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAPCore(
    () => {
      if (!ref.current) return;
      ensureScrollTrigger();

      gsap.from(ref.current, {
        y: options?.y ?? 30,
        opacity: 0,
        duration: options?.duration ?? 0.8,
        delay: options?.delay ?? 0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: options?.start ?? 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    },
    { scope: ref, dependencies: [] }
  );

  return ref;
}

/**
 * Word-by-word reveal animation on scroll.
 * Wraps each word in a span and staggers opacity + y.
 */
export function useWordReveal(options?: { stagger?: number; duration?: number }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ensureScrollTrigger();
    const el = ref.current;
    const text = el.textContent || '';
    const words = text.split(/\s+/).filter(Boolean);

    el.innerHTML = words
      .map((word) => `<span class="word-reveal__word" style="display:inline-block;opacity:0;transform:translateY(20px)">${word}</span>`)
      .join(' ');

    const wordEls = el.querySelectorAll('.word-reveal__word');

    gsap.to(wordEls, {
      y: 0,
      opacity: 1,
      duration: options?.duration ?? 0.6,
      stagger: options?.stagger ?? 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    return () => {
      el.textContent = text;
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [options?.duration, options?.stagger]);

  return ref;
}

/**
 * Parallax drift effect for background elements.
 */
export function useParallax(speed: number = 0.3) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAPCore(
    () => {
      if (!ref.current) return;
      ensureScrollTrigger();

      gsap.to(ref.current, {
        y: () => window.innerHeight * speed * -1,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    },
    { scope: ref, dependencies: [] }
  );

  return ref;
}
