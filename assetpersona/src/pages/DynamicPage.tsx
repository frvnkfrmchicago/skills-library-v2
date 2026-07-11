/* ══════════════════════════════════════════
   DYNAMIC PAGE
   Public renderer for studio-created pages.
   Renders saved Puck JSON at /p/:slug.
   ══════════════════════════════════════════ */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPageBySlug } from '../studio/data/studioStorage';
import { RenderPage } from '../studio/engine/renderPage';
import type { StudioPage } from '../studio/data/types';

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<StudioPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      try {
        const result = await getPageBySlug(slug);
        if (result) {
          setPage(result);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('[DynamicPage] Error:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-secondary)',
        fontFamily: 'var(--font-body)',
      }}>
        Loading...
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-md)',
        fontFamily: 'var(--font-body)',
      }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>Page not found</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>This page doesn't exist or hasn't been published yet.</p>
      </div>
    );
  }

  return (
    <main>
      <RenderPage data={page.puck_data} />
    </main>
  );
}
