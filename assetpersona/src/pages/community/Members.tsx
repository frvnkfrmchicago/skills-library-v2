import { Link } from 'react-router-dom';
import { getMembers, getLevelName } from '../../data/communityData';
import SubTabs from '../../components/community/SubTabs';
import './Members.css';

const COMMUNITY_TABS = [
  { to: '/community', label: 'Discussion', end: true },
  { to: '/community/leaderboard', label: 'Leaderboard' },
  { to: '/community/members', label: 'Members' },
  { to: '/community/calendar', label: 'Calendar' },
];

export default function Members() {
  const members = getMembers();

  return (
    <div className="members">
      <SubTabs tabs={COMMUNITY_TABS} />
      <div className="community-page-header">
        <h1>Members</h1>
        <p>{members.length} {members.length === 1 ? 'member' : 'members'} in this community</p>
      </div>

      {members.length === 0 && (
        <div className="community-card feed__empty">
          <h3>No members yet</h3>
          <p>Members will appear here as people join the community.</p>
        </div>
      )}

      <div className="members__grid">
        {members.map((m) => (
          <Link
            key={m.id}
            to={`/community/profile/${m.id}`}
            className="community-card members__card"
          >
            {m.avatar_url ? (
              <img src={m.avatar_url} alt={m.display_name} className="avatar avatar--lg" />
            ) : (
              <div className={`avatar avatar--lg avatar--${(m.id.charCodeAt(m.id.length - 1) % 5) + 1}`}>
                {m.display_name.charAt(0)}
              </div>
            )}
            <h3 className="members__name">{m.display_name}</h3>
            <span className="level-badge">Lvl {m.level} · {getLevelName(m.level)}</span>
            <span className="members__points">{m.points} pts</span>
            <span className="members__joined">
              Joined {new Date(m.joined_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
