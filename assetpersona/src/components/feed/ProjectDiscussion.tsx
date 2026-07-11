/* ═══ ProjectDiscussion — per-project chat thread ═══
 *
 * AP-STUDYHALL-REBUILD-2026-06 · Lane 4
 *
 * The "let users chat about a specific project / share ideas, concepts,
 * thoughts" ask. Mounted by the Portfolio (Lane 6) under each project so a
 * member's work has its own discussion thread, built on the new
 * posts.project_id column via channelsStore.
 */

import { useEffect, useState } from 'react';
import { PaperPlaneTilt, ChatCircleDots } from '@phosphor-icons/react';
import { listProjectThread, postToProject, type ProjectPost } from '../../data/channelsStore';
import { useAuth } from '../../context/useAuth';
import './ProjectDiscussion.css';

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function ProjectDiscussion({ projectId }: { projectId: string }) {
  const { profile, isBypass } = useAuth();
  const [posts, setPosts] = useState<ProjectPost[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const authorId = profile?.id ?? (isBypass ? 'bypass-member' : null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listProjectThread(projectId).then((rows) => {
      if (!cancelled) {
        setPosts(rows);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  async function send() {
    if (!draft.trim() || !authorId) return;
    setBusy(true);
    try {
      const row = await postToProject(projectId, authorId, draft);
      setPosts((prev) => [row, ...prev]);
      setDraft('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="project-discussion">
      <header className="project-discussion__head">
        <ChatCircleDots size={18} weight="duotone" />
        <h3>Discussion</h3>
        <span className="project-discussion__count">{posts.length}</span>
      </header>

      {authorId && (
        <div className="project-discussion__composer">
          <textarea
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Share a thought, an idea, or feedback on this project..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send();
            }}
          />
          <button
            className="btn btn--primary btn--sm"
            onClick={send}
            disabled={busy || !draft.trim()}
          >
            <PaperPlaneTilt size={15} /> {busy ? 'Posting…' : 'Post'}
          </button>
        </div>
      )}

      {loading ? (
        <p className="project-discussion__empty">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="project-discussion__empty">
          No comments yet. Start the conversation about this project.
        </p>
      ) : (
        <ul className="project-discussion__list">
          {posts.map((p) => (
            <li key={p.id} className="project-discussion__item">
              <p className="project-discussion__body">{p.body}</p>
              <span className="project-discussion__meta">{timeAgo(p.created_at)} ago</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
