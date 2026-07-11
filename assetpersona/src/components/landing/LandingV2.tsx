import { useEffect, useMemo, useState } from 'react';
import Hero from '../sections/Hero';
import StudyHallPreview from '../sections/StudyHallPreview';
import ShopPreview from '../sections/ShopPreview';
import BlogFeature from '../sections/BlogFeature';


import { LANDING_IDS } from './landingIds';
import { useWindowScrollProgress } from './useWindowScrollProgress';
import './LandingV2.css';
import SceneSection from './SceneSection';
import ChapterNav from './ChapterNav';
import KineticHeadline from './KineticHeadline';

import servicesBg from '../../assets/services-bg.webp';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const update = () => setReduced(Boolean(mq.matches));
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

export default function LandingV2() {
  usePrefersReducedMotion(); // hook is included for potential future use
  const progress = useWindowScrollProgress();

  const style = useMemo(() => {
    return {
      // Used by CSS for subtle narrative transitions (non-critical).
      ['--landing-scroll' as never]: String(progress),
    };
  }, [progress]);

  return (
    <div className="landingV2" style={style}>
      <ChapterNav />

      {/* HERO — no bg image: the operational scan line is the only backdrop */}
      <SceneSection id={LANDING_IDS.hero} mood="mix" className="landingV2__scene landingV2__scene--hero">
        <Hero />
      </SceneSection>

      {/* PATHS (re-staged from existing content pillars) */}
      <SceneSection id={LANDING_IDS.paths} mood="blue" bgImage={servicesBg} className="landingV2__scene landingV2__scene--paths section">
        <div className="container">
          <KineticHeadline
            kicker="Choose your path"
            headline="Learn in a way|that feels personal."
            accent=" "
            subhead="This isn't a generic course funnel. It's a studio + school, built to help you build."
            as="h2"
            className="landingV2__pathsHeader"
          />

          <div className="landingV2__pathsGrid">
            <a className="landingV2__pathCard liquid-glass border-glow" href="#curriculum">
              <div className="landingV2__pathTop">
                <span className="landingV2__pathKicker">Creatives</span>
                <span className="landingV2__pathDot landingV2__pathDot--salmon" aria-hidden="true" />
              </div>
              <h3 className="landingV2__pathTitle">Make AI useful without losing your voice.</h3>
              <p className="landingV2__pathDesc">
                Learn literacy + prompting, then turn it into content, products, and workflows you actually enjoy using.
              </p>
              <span className="landingV2__pathAction">Explore curriculum</span>
            </a>

            <a className="landingV2__pathCard liquid-glass border-glow" href="/business">
              <div className="landingV2__pathTop">
                <span className="landingV2__pathKicker">Businesses</span>
                <span className="landingV2__pathDot landingV2__pathDot--blue" aria-hidden="true" />
              </div>
              <h3 className="landingV2__pathTitle">Integrate AI with strategy, not chaos.</h3>
              <p className="landingV2__pathDesc">
                Consulting, systems, and automations so your team ships faster and stays aligned.
              </p>
              <span className="landingV2__pathAction">Work with me</span>
            </a>

            <a className="landingV2__pathCard liquid-glass border-glow" href="/resources">
              <div className="landingV2__pathTop">
                <span className="landingV2__pathKicker">Curious</span>
                <span className="landingV2__pathDot landingV2__pathDot--mix" aria-hidden="true" />
              </div>
              <h3 className="landingV2__pathTitle">Start with free resources and live learning.</h3>
              <p className="landingV2__pathDesc">
                Get oriented fast, then go deeper when it's time. No fluff, no hype.
              </p>
              <span className="landingV2__pathAction">Browse resources</span>
            </a>
          </div>

        </div>
      </SceneSection>

      {/* CURRICULUM */}
      <div className="landingV2__layer" id={LANDING_IDS.curriculum}>
        <StudyHallPreview />
      </div>

      {/* PRODUCTS */}
      <div className="landingV2__layer" id={LANDING_IDS.products}>
        <ShopPreview />
      </div>


      {/* INSIGHTS */}
      <div className="landingV2__layer" id={LANDING_IDS.insights}>
        <BlogFeature />
      </div>

    </div>
  );
}

