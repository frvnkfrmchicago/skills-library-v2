import { Link } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead';

export default function NotFound() {
  return (
    <>
      <SEOHead title="Page Not Found" path="/404" />
      <section style={{
        minHeight: '60dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <span style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--color-accent)' }}>
          404
        </span>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)' }}>
          Page not found
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '28rem' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn--primary">
          Back to Home
        </Link>
      </section>
    </>
  );
}
