import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * /contact route redirects to homepage and scrolls to #contact footer anchor.
 */
export default function ContactPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/', { replace: true });
    // Small delay to let the page render, then scroll
    setTimeout(() => {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [navigate]);

  return null;
}
