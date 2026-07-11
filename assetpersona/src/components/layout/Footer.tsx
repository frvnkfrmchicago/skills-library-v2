import { Link } from 'react-router-dom';
import { InstagramLogo, LinkedinLogo, EnvelopeSimple } from '@phosphor-icons/react';
import InquiryForm from '../sections/InquiryForm';
import './Footer.css';

const NAV_SECTIONS = [
  {
    title: 'Learn',
    links: [
      {to: '/agenticstudyhall', label: 'Agentic Study Hall' },
      { to: '/recordings', label: 'Talk Through Tech' },
      { to: '/resources', label: 'Free Resources' },
      { to: '/blog', label: 'Blog' },
    ],
  },
  {
    title: 'Products',
    links: [
      { to: '/shop', label: 'Shop All' },
      { to: '/business', label: 'For Business' },
      { to: '/about', label: 'About' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms' },
      { to: '/accessibility', label: 'Accessibility' },
    ],
  },
];

const SOCIALS = [
  { icon: InstagramLogo, href: 'https://www.instagram.com/assetpersona', label: 'Instagram' },
  { icon: LinkedinLogo, href: 'https://www.linkedin.com/in/frankdlawrencejr/', label: 'LinkedIn' },
];

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        {/* ── Contact Strip ── */}
        <div className="footer__contact">
          <div className="footer__contact-header">
            <h2 className="footer__contact-title">
              Get in <span className="text-accent-gold">Touch</span>
            </h2>
            <p className="footer__contact-sub">
              AI training, partnerships, projects, or questions.
            </p>
            <a href="mailto:hello@assetpersona.com" className="footer__email-link">
              <EnvelopeSimple size={18} weight="duotone" />
              hello@assetpersona.com
            </a>
          </div>
          <div className="footer__contact-form">
            <InquiryForm />
          </div>
        </div>

        {/* ── Nav Grid ── */}
        <div className="footer__grid">
          <div className="footer__brand">
            <span className="footer__logo">Asset Persona</span>
            <p className="footer__tagline">
              AI Education, Digital Products, and Vibe Coding
            </p>
            <div className="footer__socials">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__social-link"
                  aria-label={label}
                >
                  <Icon size={24} weight="regular" />
                </a>
              ))}
            </div>
          </div>

          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="footer__section">
              <h4 className="footer__section-title">{section.title}</h4>
              <ul className="footer__section-links">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="footer__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Copyright ── */}
        <div className="footer__bottom">
          <p className="footer__copy">
            &copy; {new Date().getFullYear()} Asset Persona. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
