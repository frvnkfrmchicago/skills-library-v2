import { useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import { getAllPublishedPosts } from '../content/blog';
import './BlogTag.css';

/**
 * /blog/tag/:tag — lists all posts with the given tag.
 * Matches case-insensitively against the URL slug-style tag.
 */
export default function BlogTagPage() {
  const { tag } = useParams<{ tag: string }>();
  const all = getAllPublishedPosts();

  const tagLower = (tag ?? '').toLowerCase();
  const tagDisplay = useMemo(() => {
    // Try to find the canonical capitalization from any matching post
    for (const p of all) {
      const found = p.tags.find((t) => slugifyTag(t) === tagLower);
      if (found) return found;
    }
    return tag ?? '';
  }, [all, tag, tagLower]);

  const posts = useMemo(
    () => all.filter((p) => p.tags.some((t) => slugifyTag(t) === tagLower)),
    [all, tagLower]
  );

  if (!tag) return <Navigate to="/blog" replace />;

  return (
    <>
      <SEOHead
        title={`${tagDisplay} — Asset Persona Blog`}
        description={`Articles tagged ${tagDisplay} from the Asset Persona blog by Frank Lawrence Jr.`}
        path={`/blog/tag/${tag}`}
        tags={[tagDisplay]}
      />
      <main className="blog-tag">
        <div className="container">
          <Link to="/blog" className="blog-tag__back">
            <ArrowLeft size={16} /> All articles
          </Link>

          <header className="blog-tag__header">
            <p className="blog-tag__eyebrow">Tag</p>
            <h1 className="blog-tag__title">{tagDisplay}</h1>
            <p className="blog-tag__count">
              {posts.length} {posts.length === 1 ? 'article' : 'articles'}
            </p>
          </header>

          {posts.length === 0 ? (
            <div className="blog-tag__empty">
              <p>No published articles with this tag yet.</p>
              <Link to="/blog" className="btn btn--secondary">
                Browse all articles
              </Link>
            </div>
          ) : (
            <ul className="blog-tag__list">
              {posts.map((post) => (
                <li key={post.slug} className="blog-tag__item">
                  <Link to={`/blog/${post.slug}`} className="blog-tag__card">
                    {post.coverImage && (
                      <div className="blog-tag__cover" aria-hidden="true">
                        <img src={post.coverImage} alt="" loading="lazy" />
                      </div>
                    )}
                    <div className="blog-tag__body">
                      <p className="blog-tag__tags">
                        {post.tags.slice(0, 3).map((t, i) => (
                          <span key={t}>
                            {i > 0 && ' · '}
                            <span>{t}</span>
                          </span>
                        ))}
                      </p>
                      <h2 className="blog-tag__post-title">{post.title}</h2>
                      <p className="blog-tag__excerpt">{post.excerpt}</p>
                      <p className="blog-tag__meta">
                        {new Date(post.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' · '}{post.readTime}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}

function slugifyTag(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
