export interface TeamMember {
  id: string;
  display_name: string;
  avatar_url: string | null;
  role: 'Captain' | 'Prompt Mage' | 'Study Buddy' | 'JSON Architect';
  contributedPX: number;
}

export interface TeamMilestone {
  pxRequired: number;
  name: string;
  unlocked: boolean;
}

export interface TeamActivity {
  id: string;
  timestamp: string;
  message: string;
}

export interface StudyTeam {
  id: string;
  name: string;
  description: string;
  avatarUrl: string;
  memberCount: number;
  dailyGoalPX: number;
  currentProgressPX: number;
  members: TeamMember[];
  milestones: TeamMilestone[];
  activityFeed: TeamActivity[];
}

export interface TeamInvite {
  id: string;
  teamId: string;
  teamName: string;
  teamAvatar: string;
  invitedBy: string;
}

const DEFAULT_TEAMS: StudyTeam[] = [
  {
    id: 'team_prompt_wizards',
    name: 'Prompt Wizards',
    description: 'A collaborative unit focusing on advanced reasoning models, chain-of-thought engineering, and jailbreak prevention.',
    avatarUrl: '⚡',
    memberCount: 8,
    dailyGoalPX: 500,
    currentProgressPX: 320,
    members: [
      { id: '1', display_name: 'Alex Vance', avatar_url: null, role: 'Captain', contributedPX: 150 },
      { id: '2', display_name: 'Elena Rostova', avatar_url: null, role: 'Prompt Mage', contributedPX: 110 },
      { id: '3', display_name: 'Marcus Brody', avatar_url: null, role: 'Study Buddy', contributedPX: 60 },
    ],
    milestones: [
      { pxRequired: 200, name: 'Bronze Spark (Double XP Hour)', unlocked: true },
      { pxRequired: 500, name: 'Gold Blaze (Profile Glow)', unlocked: false },
      { pxRequired: 1000, name: 'Archmage Rank (Team Badge)', unlocked: false },
    ],
    activityFeed: [
      { id: 'act_1', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), message: 'Alex Vance completed a Timed Assessment challenge (+50 PX)' },
      { id: 'act_2', timestamp: new Date(Date.now() - 3600000).toISOString(), message: 'Elena Rostova solved the JSON Schema tutorial sandbox (+50 PX)' },
    ],
  },
  {
    id: 'team_json_guild',
    name: 'Structured JSON Guild',
    description: 'Dedicated to mastering JSON schemas, function calling, structured tool use, and type safety constraints.',
    avatarUrl: '📦',
    memberCount: 5,
    dailyGoalPX: 400,
    currentProgressPX: 150,
    members: [
      { id: '4', display_name: 'Sarah Chen', avatar_url: null, role: 'Captain', contributedPX: 90 },
      { id: '5', display_name: 'Tariq Al-Fayed', avatar_url: null, role: 'JSON Architect', contributedPX: 60 },
    ],
    milestones: [
      { pxRequired: 150, name: 'Parser Shield (XP Boost)', unlocked: true },
      { pxRequired: 400, name: 'Strict Schema (Badge)', unlocked: false },
    ],
    activityFeed: [
      { id: 'act_3', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), message: 'Sarah Chen joined the team!' },
    ],
  },
  {
    id: 'team_agent_orch',
    name: 'Agent Swarm Devs',
    description: 'Building next-gen agentic networks, swarm architectures, and multi-layered task routers.',
    avatarUrl: '🤖',
    memberCount: 6,
    dailyGoalPX: 600,
    currentProgressPX: 480,
    members: [
      { id: '6', display_name: 'Kenji Sato', avatar_url: null, role: 'Captain', contributedPX: 280 },
      { id: '7', display_name: 'Chloe Dubois', avatar_url: null, role: 'Prompt Mage', contributedPX: 200 },
    ],
    milestones: [
      { pxRequired: 300, name: 'Swarm Mind (50 points reward)', unlocked: true },
      { pxRequired: 600, name: 'Hyperconductor (Exclusive Theme)', unlocked: false },
    ],
    activityFeed: [
      { id: 'act_4', timestamp: new Date(Date.now() - 3600000).toISOString(), message: 'Kenji Sato contributed 100 PX via prompt battles!' },
    ],
  },
];

const DEFAULT_INVITES: TeamInvite[] = [
  {
    id: 'invite_1',
    teamId: 'team_prompt_wizards',
    teamName: 'Prompt Wizards',
    teamAvatar: '⚡',
    invitedBy: 'Alex Vance',
  },
];

const STORAGE_KEYS = {
  teams: 'ap_study_teams',
  myTeamId: 'ap_my_team_id',
  invites: 'ap_study_team_invites',
};

function loadTeams(): StudyTeam[] {
  const raw = localStorage.getItem(STORAGE_KEYS.teams);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.teams, JSON.stringify(DEFAULT_TEAMS));
    return DEFAULT_TEAMS;
  }
  return JSON.parse(raw) as StudyTeam[];
}

function saveTeams(teams: StudyTeam[]) {
  localStorage.setItem(STORAGE_KEYS.teams, JSON.stringify(teams));
}

export function getTeams(): Promise<StudyTeam[]> {
  return Promise.resolve(loadTeams());
}

export function getMyTeamId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.myTeamId);
}

export function getMyTeam(): Promise<StudyTeam | null> {
  const teams = loadTeams();
  const myId = getMyTeamId();
  const found = teams.find(t => t.id === myId);
  return Promise.resolve(found ?? null);
}

export function joinTeam(teamId: string, userDisplayName = 'Frank Lawrence'): Promise<StudyTeam | null> {
  const teams = loadTeams();
  const team = teams.find(t => t.id === teamId);
  if (!team) return Promise.resolve(null);

  // Leave previous team if any
  const previousId = getMyTeamId();
  if (previousId) {
    leaveTeamSync(previousId);
  }

  // Add current user as member
  const memberExists = team.members.some(m => m.id === 'current_user');
  if (!memberExists) {
    team.members.push({
      id: 'current_user',
      display_name: userDisplayName,
      avatar_url: null,
      role: 'Study Buddy',
      contributedPX: 0,
    });
    team.memberCount += 1;
    team.activityFeed.unshift({
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: `${userDisplayName} joined the team!`,
    });
  }

  localStorage.setItem(STORAGE_KEYS.myTeamId, teamId);
  saveTeams(teams);
  return Promise.resolve(team);
}

export function leaveTeam(userDisplayName = 'Frank Lawrence'): Promise<void> {
  const myId = getMyTeamId();
  if (myId) {
    leaveTeamSync(myId, userDisplayName);
    localStorage.removeItem(STORAGE_KEYS.myTeamId);
  }
  return Promise.resolve();
}

function leaveTeamSync(teamId: string, userDisplayName = 'Frank Lawrence') {
  const teams = loadTeams();
  const team = teams.find(t => t.id === teamId);
  if (team) {
    team.members = team.members.filter(m => m.id !== 'current_user');
    team.memberCount = Math.max(0, team.memberCount - 1);
    team.activityFeed.unshift({
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: `${userDisplayName} left the team.`,
    });
    saveTeams(teams);
  }
}

export function contributePX(amount: number, userDisplayName = 'Frank Lawrence'): Promise<StudyTeam | null> {
  const myId = getMyTeamId();
  if (!myId) return Promise.resolve(null);

  const teams = loadTeams();
  const team = teams.find(t => t.id === myId);
  if (!team) return Promise.resolve(null);

  team.currentProgressPX += amount;
  
  // Update member contribution
  const me = team.members.find(m => m.id === 'current_user');
  if (me) {
    me.contributedPX += amount;
  }

  // Update milestones
  team.milestones = team.milestones.map(m => {
    if (team.currentProgressPX >= m.pxRequired && !m.unlocked) {
      team.activityFeed.unshift({
        id: `milestone_${Date.now()}_${m.pxRequired}`,
        timestamp: new Date().toISOString(),
        message: `Milestone Unlocked: "${m.name}" (+100 Group points bonus!)`,
      });
      return { ...m, unlocked: true };
    }
    return m;
  });

  team.activityFeed.unshift({
    id: `cont_${Date.now()}`,
    timestamp: new Date().toISOString(),
    message: `${userDisplayName} contributed +${amount} PX to team progress!`,
  });

  saveTeams(teams);
  return Promise.resolve(team);
}

export function getTeamInvites(): Promise<TeamInvite[]> {
  const raw = localStorage.getItem(STORAGE_KEYS.invites);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.invites, JSON.stringify(DEFAULT_INVITES));
    return Promise.resolve(DEFAULT_INVITES);
  }
  return Promise.resolve(JSON.parse(raw) as TeamInvite[]);
}

export function acceptInvite(inviteId: string, userDisplayName = 'Frank Lawrence'): Promise<StudyTeam | null> {
  const raw = localStorage.getItem(STORAGE_KEYS.invites);
  const invites: TeamInvite[] = raw ? JSON.parse(raw) : DEFAULT_INVITES;
  const invite = invites.find(i => i.id === inviteId);
  if (!invite) return Promise.resolve(null);

  // Remove the invite
  const updatedInvites = invites.filter(i => i.id !== inviteId);
  localStorage.setItem(STORAGE_KEYS.invites, JSON.stringify(updatedInvites));

  // Join the team
  return joinTeam(invite.teamId, userDisplayName);
}

export function declineInvite(inviteId: string): Promise<TeamInvite[]> {
  const raw = localStorage.getItem(STORAGE_KEYS.invites);
  const invites: TeamInvite[] = raw ? JSON.parse(raw) : DEFAULT_INVITES;
  const updated = invites.filter(i => i.id !== inviteId);
  localStorage.setItem(STORAGE_KEYS.invites, JSON.stringify(updated));
  return Promise.resolve(updated);
}

export function sendTeamInvite(teamId: string, inviteeName: string, inviterName = 'Frank Lawrence'): Promise<void> {
  // Simulator: just add an activity entry
  const teams = loadTeams();
  const team = teams.find(t => t.id === teamId);
  if (team) {
    team.activityFeed.unshift({
      id: `invite_${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: `${inviterName} invited ${inviteeName} to join the study group.`,
    });
    saveTeams(teams);
  }
  return Promise.resolve();
}
