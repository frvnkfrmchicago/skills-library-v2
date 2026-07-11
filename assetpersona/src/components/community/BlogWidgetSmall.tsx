import { Link } from 'react-router-dom';
import { getAllPublishedPosts } from '../../content/blog';
import './BlogWidgetSmall.css';

interface BlogWidgetSmallProps {
  /** Maximum number of posts to render. Defaults to 3. */
  limit?: number;
}

/**
 * Compact list of the most recent published blog posts.
 *
 * Designed for the community sidebar. No state, no fetching, no realtime —
 * just a synchronous read from the shared `getAllPublishedPosts()` source
 * which already merges static, Supabase, and localStorage posts.
 *
 * This component does NOT mount itself anywhere. CommunityLayout (Lane 6)
 * decides whether to surface it.
 */
export default function BlogWidgetSmall({ limit = 3 }: BlogWidgetSmallProps) {
  const posts = getAllPublishedPosts().slice(0, Math.max(0, limit));

  if (posts.length === 0) {
    return null;
  }

  return (
    <aside className="blog-widget-small" aria-label="Recent blog posts">
      <header className="blog-widget-small__header">
        <h2 className="blog-widget-small__title">From the blog</h2>
        <Link to="/blog" className="blog-widget-small__all">
          All posts
        </Link>
      </header>
      <ul className="blog-widget-small__list">
        {posts.map((post) => (
          <li key={post.slug} className="blog-widget-small__item">
            <Link to={`/blog/${post.slug}`} className="blog-widget-small__card">
              <p className="blog-widget-small__post-title">{post.title}</p>
              <p className="blog-widget-small__meta">
                {new Date(post.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
                {' · '}
                {post.readTime}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
