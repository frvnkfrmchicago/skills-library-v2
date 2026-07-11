import SEOHead from '../components/seo/SEOHead';
import './Legal.css';

export default function Terms() {
  return (
    <>
      <SEOHead
        title="Terms & Conditions | Asset Persona"
        description="Terms and conditions governing the use of Asset Persona's products and services."
      />
      <section className="legal">
        <div className="container container--narrow">
          <h1 className="legal__title">Terms &amp; Conditions</h1>
          <p className="legal__updated">Last updated: March 21, 2026</p>

          <div className="legal__content">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Asset Persona, you agree to be bound by these terms.
              If you do not agree, you may not use the platform.
            </p>

            <h2>2. Use of Services</h2>
            <p>
              Asset Persona provides AI education content, digital products, and community features.
              You agree to use these services for lawful purposes only and in compliance with all
              applicable laws.
            </p>

            <h2>3. Accounts</h2>
            <p>
              You are responsible for maintaining the security of your account credentials.
              You must provide accurate information when creating an account. We reserve the right
              to suspend accounts that violate these terms.
            </p>

            <h2>4. Digital Products &amp; Purchases</h2>
            <p>
              All digital product sales are final. Products are licensed for personal use only.
              Redistribution, resale, or sharing of purchased content is prohibited without
              written permission.
            </p>

            <h2>5. Intellectual Property</h2>
            <p>
              All content, branding, and code on Asset Persona is owned by Frank Lawrence, Jr.
              and protected by copyright law. You may not reproduce, distribute, or create
              derivative works without explicit consent.
            </p>

            <h2>6. Limitation of Liability</h2>
            <p>
              Asset Persona is provided "as is" without warranty. We are not liable for any
              indirect, incidental, or consequential damages arising from your use of the platform.
            </p>

            <h2>7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the platform
              after changes constitutes acceptance.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
