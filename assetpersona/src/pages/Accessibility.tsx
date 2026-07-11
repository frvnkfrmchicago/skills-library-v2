import SEOHead from '../components/seo/SEOHead';
import './Legal.css';

export default function Accessibility() {
  return (
    <>
      <SEOHead
        title="Accessibility Statement | Asset Persona"
        description="Asset Persona's commitment to digital accessibility for all users."
      />
      <section className="legal">
        <div className="container container--narrow">
          <h1 className="legal__title">Accessibility Statement</h1>
          <p className="legal__updated">Last updated: March 21, 2026</p>

          <div className="legal__content">
            <h2>Our Commitment</h2>
            <p>
              Asset Persona is committed to ensuring digital accessibility for people with
              disabilities. We continually improve the user experience for everyone and apply
              the relevant accessibility standards.
            </p>

            <h2>Standards</h2>
            <p>
              We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at
              Level AA. These guidelines explain how to make web content more accessible for
              people with disabilities.
            </p>

            <h2>What We Do</h2>
            <ul>
              <li>Semantic HTML for proper screen reader support</li>
              <li>ARIA labels on all interactive elements</li>
              <li>Keyboard-navigable interfaces</li>
              <li>Color contrast ratios meeting WCAG AA standards</li>
              <li>Responsive design that works across devices</li>
              <li>Respecting prefers-reduced-motion settings</li>
            </ul>

            <h2>Feedback</h2>
            <p>
              We welcome your feedback on the accessibility of Asset Persona. If you encounter
              accessibility barriers, please contact us at{' '}
              <a href="mailto:hello@assetpersona.com">hello@assetpersona.com</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
