import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { BlogPost } from '../../content/blog';
import './RelatedPosts.css';

interface RelatedPostsProps {
  current: BlogPost;
  pool: BlogPost[];
  /** Max number to render. Default 3. */
  limit?: number;
}

/**
 * Shows the most-related posts to `current` ranked by tag overlap (Jaccard
 * similarity). Falls back to recency when no tag overlap exists. Replaces the
 * old prev/next-by-array-index navigation, which had no semantic relevance.
 */
export default function RelatedPosts({ current, pool, limit = 3 }: RelatedPostsProps) {
  const ranked = rankByTagOverlap(current, pool);
  const picks = ranked.slice(0, limit);
  if (picks.length === 0) return null;

  return (
    <section className="related-posts" aria-label="Related posts">
      <h2 className="related-posts__heading">Keep reading</h2>
      <div className="related-posts__grid">
        {picks.map((post) => (
          <Link key={post.slug} to={`/blog/${post.slug}`} className="related-posts__card">
            <p className="related-posts__tags">
              {post.tags.slice(0, 2).join(' · ')}
            </p>
            <h3 className="related-posts__title">{post.title}</h3>
            <p className="related-posts__excerpt">{post.excerpt}</p>
            <span className="related-posts__cta">
              Read <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function rankByTagOverlap(current: BlogPost, pool: BlogPost[]): BlogPost[] {
  const currentTags = new Set((current.tags ?? []).map((t) => t.toLowerCase()));

  const scored = pool
    .filter((p) => p.slug !== current.slug)
    .map((p) => {
      const otherTags = new Set((p.tags ?? []).map((t) => t.toLowerCase()));
      let intersection = 0;
      for (const t of currentTags) if (otherTags.has(t)) intersection++;
      const union = new Set([...currentTags, ...otherTags]).size || 1;
      const score = intersection / union;
      return { post: p, score, date: new Date(p.date).getTime() };
    });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.date - a.date; // recency tiebreaker
  });

  return scored.map((s) => s.post);
}
