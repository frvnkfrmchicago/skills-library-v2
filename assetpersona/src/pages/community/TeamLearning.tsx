import { useState, useEffect } from 'react';
import { Users, Trophy, PaperPlaneRight, Sparkle, SealCheck, Plus, ArrowRight, UserPlus } from '@phosphor-icons/react';
import {
  getTeams,
  getMyTeam,
  getTeamInvites,
  joinTeam,
  leaveTeam,
  contributePX,
  acceptInvite,
  declineInvite,
  sendTeamInvite
} from '../../data/teamsStore';
import type { StudyTeam, TeamInvite } from '../../data/teamsStore';
import { getMembers } from '../../data/communityData';
import { useAuth } from '../../context/useAuth';
import SubTabs from '../../components/community/SubTabs';
import './TeamLearning.css';

const CLASSROOM_TABS = [
  { to: '/community/learn', label: 'Modules' },
  { to: '/community/classroom', label: 'Simulations' },
  { to: '/community/briefs', label: 'Briefs' },
  { to: '/community/tutorials', label: 'Tutorials' },
  { to: '/community/assessments', label: 'Assessments' },
  { to: '/community/teams', label: 'Study Teams' },
];


export default function TeamLearning() {
  const { profile } = useAuth();
  const userDisplayName = profile?.display_name || 'Frank Lawrence';

  const [teams, setTeams] = useState<StudyTeam[]>([]);
  const [myTeam, setMyTeam] = useState<StudyTeam | null>(null);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [communityMembers, setCommunityMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite form state
  const [selectedInvitee, setSelectedInvitee] = useState('');
  // Chat / message feed state
  const [chatMessage, setChatMessage] = useState('');

  const loadData = async () => {
    const allTeams = await getTeams();
    setTeams(allTeams);
    const activeTeam = await getMyTeam();
    setMyTeam(activeTeam);
    const allInvites = await getTeamInvites();
    setInvites(allInvites);
    const members = getMembers().filter(m => m.display_name !== userDisplayName);
    setCommunityMembers(members);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userDisplayName]);

  const handleJoinTeam = async (teamId: string) => {
    const updated = await joinTeam(teamId, userDisplayName);
    setMyTeam(updated);
    await loadData();
  };

  const handleLeaveTeam = async () => {
    if (window.confirm('Are you sure you want to leave this study team? Your contributed Skill Points will remain with the team.')) {
      await leaveTeam(userDisplayName);
      setMyTeam(null);
      await loadData();
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    const updated = await acceptInvite(inviteId, userDisplayName);
    setMyTeam(updated);
    await loadData();
  };

  const handleDeclineInvite = async (inviteId: string) => {
    const updated = await declineInvite(inviteId);
    setInvites(updated);
  };

  const handleSimulateContribution = async (amount: number) => {
    const updated = await contributePX(amount, userDisplayName);
    setMyTeam(updated);
    await loadData();
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myTeam || !selectedInvitee) return;
    await sendTeamInvite(myTeam.id, selectedInvitee, userDisplayName);
    setSelectedInvitee('');
    await loadData();
    alert(`Invite sent to ${selectedInvitee}!`);
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myTeam || !chatMessage.trim()) return;

    // Simulate sending chat message by adding it to the team's activity feed
    const updatedTeams = [...teams];
    const teamIdx = updatedTeams.findIndex(t => t.id === myTeam.id);
    if (teamIdx >= 0) {
      updatedTeams[teamIdx].activityFeed.unshift({
        id: `chat_${Date.now()}`,
        timestamp: new Date().toISOString(),
        message: `${userDisplayName}: ${chatMessage}`,
      });
      localStorage.setItem('ap_study_teams', JSON.stringify(updatedTeams));
      setMyTeam(updatedTeams[teamIdx]);
    }
    setChatMessage('');
  };

  if (loading) {
    return (
      <div className="team-learning-page">
        <p className="loading-text">Loading co-op study details…</p>
      </div>
    );
  }

  // ── LOBBY VIEW (Not in a team) ──
  if (!myTeam) {
    return (
      <div className="team-learning-page">
        <SubTabs tabs={CLASSROOM_TABS} />
        <div className="lobby-hero">
          <div className="hero-sparkle-row">
            <Sparkle className="hero-sparkle" size={24} />
            <h1>Co-op Team Study Hub</h1>
          </div>
          <p className="hero-desc">
            Join forces with other engineers. Complete daily targets together, share live activity streams, unlock collective milestones, and climb the team leaderboards.
          </p>
        </div>

        {/* Invites Box */}
        {invites.length > 0 && (
          <section className="invites-section">
            <h2>Pending Study Invites</h2>
            <div className="invites-grid">
              {invites.map((inv) => (
                <div key={inv.id} className="invite-card">
                  <div className="invite-avatar">{inv.teamAvatar}</div>
                  <div className="invite-details">
                    <h3>{inv.teamName}</h3>
                    <p>Invited by <strong>{inv.invitedBy}</strong></p>
                  </div>
                  <div className="invite-actions">
                    <button onClick={() => handleAcceptInvite(inv.id)} className="accept-btn">
                      Accept
                    </button>
                    <button onClick={() => handleDeclineInvite(inv.id)} className="decline-btn">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Available Teams Grid */}
        <section className="teams-lobby-section">
          <h2>Find a Team to Join</h2>
          <div className="teams-grid">
            {teams.map((t) => (
              <div key={t.id} className="team-card">
                <div className="team-card__top">
                  <div className="team-icon">{t.avatarUrl}</div>
                  <div>
                    <h3 className="team-name">{t.name}</h3>
                    <span className="member-count">
                      <Users size={14} /> {t.memberCount} members
                    </span>
                  </div>
                </div>
                <p className="team-desc">{t.description}</p>
                
                <div className="team-card__progress">
                  <div className="progress-text">
                    <span>Daily Goal</span>
                    <span>{t.currentProgressPX} / {t.dailyGoalPX} Skill Points</span>
                  </div>
                  <div className="bar-outer">
                    <div
                      className="bar-inner"
                      style={{ width: `${Math.min(100, (t.currentProgressPX / t.dailyGoalPX) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="team-members-snippet">
                  <h4>Members</h4>
                  <div className="avatar-pile">
                    {t.members.map((m, idx) => (
                      <div key={idx} className="pile-avatar" title={`${m.display_name} (${m.role})`}>
                        {m.display_name.charAt(0)}
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={() => handleJoinTeam(t.id)} className="join-team-btn">
                  Join Team <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // ── ACTIVE TEAM VIEW ──
  const myProgressPct = Math.min(100, (myTeam.currentProgressPX / myTeam.dailyGoalPX) * 100);

  return (
    <div className="team-learning-page active-team-dashboard">
      <SubTabs tabs={CLASSROOM_TABS} />
      <div className="dashboard-header">
        <div className="team-profile-header">
          <div className="dashboard-team-icon">{myTeam.avatarUrl}</div>
          <div>
            <h1>{myTeam.name}</h1>
            <p className="team-sub">{myTeam.description}</p>
          </div>
        </div>
        <button onClick={handleLeaveTeam} className="leave-btn">
          Leave Team
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Progress, Simulator, and Invites */}
        <div className="column-main">
          {/* Progress Card */}
          <div className="dashboard-card progress-card">
            <div className="card-header-row">
              <h2>Collective Daily Progress</h2>
              <span className="goal-flag">{myTeam.currentProgressPX} / {myTeam.dailyGoalPX} Skill Points</span>
            </div>
            
            <div className="big-progress-bar">
              <div className="progress-outer">
                <div className="progress-inner" style={{ width: `${myProgressPct}%` }}>
                  <span className="progress-glow" />
                </div>
              </div>
              <span className="percentage-label">{Math.floor(myProgressPct)}% Complete</span>
            </div>

            {/* Milestones list */}
            <div className="milestones-block">
              <h3>Collective Milestones & Rewards</h3>
              <div className="milestones-list">
                {myTeam.milestones.map((m, idx) => (
                  <div key={idx} className={`milestone-item ${m.unlocked ? 'milestone-item--unlocked' : ''}`}>
                    <SealCheck size={20} weight={m.unlocked ? 'fill' : 'regular'} />
                    <div className="milestone-details">
                      <span className="milestone-name">{m.name}</span>
                      <span className="milestone-req">Requires {m.pxRequired} Team Skill Points</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity / Contribution Simulator */}
          <div className="dashboard-card simulator-card">
            <h2>Log Co-op Actions</h2>
            <p className="section-instruction">
              Complete Study Hall exercises to earn points for your team! Click any simulated action below to contribute points in real-time.
            </p>
            <div className="simulator-actions">
              <button onClick={() => handleSimulateContribution(30)} className="sim-btn">
                <Plus size={14} /> Solved Prompt Battle (+30 Skill Points)
              </button>
              <button onClick={() => handleSimulateContribution(50)} className="sim-btn">
                <Plus size={14} /> Solved Sandbox Exercise (+50 Skill Points)
              </button>
              <button onClick={() => handleSimulateContribution(15)} className="sim-btn">
                <Plus size={14} /> Posted Learning Wins (+15 Skill Points)
              </button>
            </div>
          </div>

          {/* Co-op Invite Form */}
          <div className="dashboard-card invite-members-card">
            <h2>Recruit Teammates</h2>
            <form onSubmit={handleSendInvite} className="invite-form">
              <select
                value={selectedInvitee}
                onChange={(e) => setSelectedInvitee(e.target.value)}
                className="invite-select"
                required
              >
                <option value="">Select a member to invite…</option>
                {communityMembers.map((m) => (
                  <option key={m.id} value={m.display_name}>
                    {m.display_name} (Level {m.level})
                  </option>
                ))}
              </select>
              <button type="submit" className="invite-submit-btn">
                <UserPlus size={16} /> Invite
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Standings and Activity Feed */}
        <div className="column-side">
          {/* Team Standings / Leaderboard */}
          <div className="dashboard-card standings-card">
            <div className="title-row">
              <Trophy size={18} className="trophy-icon" />
              <h2>Internal Standings</h2>
            </div>
            <div className="standings-list">
              {myTeam.members
                .sort((a, b) => b.contributedPX - a.contributedPX)
                .map((m, idx) => (
                  <div key={m.id} className="standing-item">
                    <div className="rank-badge">#{idx + 1}</div>
                    <div className="standing-user">
                      <div className="standing-name">{m.display_name}</div>
                      <div className="standing-role">{m.role}</div>
                    </div>
                    <div className="standing-px">{m.contributedPX} Skill Points</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Team Activity Feed & Message board */}
          <div className="dashboard-card activity-card">
            <h2>Activity & Chat</h2>
            
            <form onSubmit={handleSendChatMessage} className="chat-form">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Send message to group..."
                className="chat-input"
                required
              />
              <button type="submit" className="chat-submit-btn">
                <PaperPlaneRight size={16} />
              </button>
            </form>

            <div className="activity-list">
              {myTeam.activityFeed.map((act) => (
                <div key={act.id} className="activity-item">
                  <span className="activity-time">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <p className="activity-text">{act.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
