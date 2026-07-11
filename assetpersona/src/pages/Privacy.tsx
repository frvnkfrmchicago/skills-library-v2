import SEOHead from '../components/seo/SEOHead';
import './Legal.css';

export default function Privacy() {
  return (
    <>
      <SEOHead
        title="Privacy Policy | Asset Persona"
        description="Learn how Asset Persona collects, uses, and protects your data."
      />
      <section className="legal">
        <div className="container container--narrow">
          <h1 className="legal__title">Privacy Policy</h1>
          <p className="legal__updated">Last updated: March 21, 2026</p>

          <div className="legal__content">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly, such as your name, email, and payment
              details when you create an account or make a purchase. We also collect usage data
              through analytics to improve the platform.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>
              Your information is used to provide and improve our services, process transactions,
              send educational content, and communicate updates. We never sell your personal data
              to third parties.
            </p>

            <h2>3. Data Protection</h2>
            <p>
              We use industry-standard encryption (TLS/SSL) to protect data in transit.
              Authentication is handled through secure providers. Payment processing is handled
              by Stripe, which is PCI-DSS compliant.
            </p>

            <h2>4. Cookies &amp; Analytics</h2>
            <p>
              We use essential cookies for authentication and preferences. Analytics cookies help
              us understand how the platform is used. You can disable non-essential cookies in your
              browser settings.
            </p>

            <h2>5. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal data at any time.
              Contact us at <a href="mailto:hello@assetpersona.com">hello@assetpersona.com</a> to
              exercise these rights.
            </p>

            <h2>6. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Changes will be posted on this page
              with an updated revision date.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
