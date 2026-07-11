/* ═══ /learn/:slug — Public Module Teaser ═══
 *
 * Lane 2 of AP-ENGAGEMENT-LOOP-2026-05. Non-member entry point for share
 * traffic. Loads the hook + outcome surface only (via get_module_teaser RPC)
 * and renders ModuleTeaser, which sticks a sign-up CTA on mobile and gates
 * the full body behind /community/learn/:slug.
 *
 * SEOHead emits article OG tags + the module's cover image so the link
 * renders as a rich card on social platforms even before the member
 * shares their own /learned/:shareId variant.
 */

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import ModuleTeaser from '../components/learn/ModuleTeaser';
import { getModuleTeaser, type ModuleTeaserRow } from '../data/learningPosts';
import './Learn.css';

export default function PublicLearnPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const referrerName = searchParams.get('from') || null;

  const [module, setModule] = useState<ModuleTeaserRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    getModuleTeaser(slug)
      .then((row) => {
        if (cancelled) return;
        setModule(row);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setModule(null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="public-learn public-learn--loading">
        <div className="public-learn__skeleton" aria-hidden="true" />
        <p className="sr-only">Loading module preview…</p>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="public-learn public-learn--missing">
        <SEOHead
          title="Module not found"
          path={`/learn/${slug ?? ''}`}
          description="The module you're looking for isn't published yet."
        />
        <h1>Module not found</h1>
        <p>The module you're looking for isn't published — or the share link is out of date.</p>
        <Link to="/agenticstudyhall" className="btn btn--primary">
          <ArrowLeft size={14} aria-hidden="true" /> Browse the Study Hall
        </Link>
      </div>
    );
  }

  const description = `${module.hook} — ${module.objective}`;
  const ogImage = module.cover_image ?? undefined;

  return (
    <>
      <SEOHead
        title={module.title}
        description={description}
        path={`/learn/${module.slug}`}
        image={ogImage}
        type="article"
        tags={module.tags}
        publishedAt={module.published_at ?? undefined}
        author="Frank Lawrence Jr."
      />
      <ModuleTeaser module={module} referrerName={referrerName} />
    </>
  );
}
