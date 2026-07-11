export interface Comment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  creatorName: string;
  creatorAvatar?: string;
  creatorId: string;
  tags: string[];
  likesCount: number;
  likedBy: string[]; // List of user IDs who liked this
  embedUrl?: string; // e.g. HuggingFace Space, Figma, GitHub, or Colab link
  comments: Comment[];
  createdAt: string;
}

const LOCAL_STORAGE_KEY = 'ap_showcase_projects';

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-ship-free-apis',
    title: 'Ship Free APIs',
    description: 'A curated, verified monthly database of 52 free-tier and keyless APIs for developers. Built to enable rapid prototyping of AI apps, dashboards, and bots with zero API costs, clear rate limits, and pre-built code snippets.',
    imageUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80',
    creatorName: 'Frank Lawrence',
    creatorId: 'frank-id',
    tags: ['Vibe Coding', 'Keyless APIs', 'Open Source', 'Next.js'],
    likesCount: 52,
    likedBy: ['user-2', 'user-3', 'user-4'],
    embedUrl: 'https://shipfreeapis.vercel.app/',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    comments: [
      {
        id: 'c-sf-1',
        authorName: 'Sarah Chen',
        authorId: 'user-2',
        body: 'Having a verified list of 100% keyless endpoints is a massive timesaver. No more signup wait times for quick prototypes!',
        createdAt: new Date(Date.now() - 1 * 86400000 + 3600000).toISOString()
      }
    ]
  },
  {
    id: 'proj-agentic-centre',
    title: 'Asset Persona Agentic Centre',
    description: 'An AI-powered content operations command center with multi-pipeline automation. Automatically ingests RSS feeds (HN, Tech News, Reddit), scores content using Gemini Flash, generates optimized drafts across 5 target platforms, and coordinates automated publishing via n8n workflows.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    creatorName: 'Frank Lawrence',
    creatorId: 'frank-id',
    tags: ['AI Agents', 'n8n', 'Supabase', 'Vibe Marketing', 'Content Operations'],
    likesCount: 88,
    likedBy: ['user-2', 'user-3', 'user-4', 'frank-id'],
    embedUrl: 'file:///Users/franklawrencejr./Downloads/skills-library-v2%202/frvnkfrmchicago-content-engine/app/index.html',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    comments: [
      {
        id: 'c-ac-1',
        authorName: 'Alex Rivera',
        authorId: 'user-3',
        body: 'The multi-platform draft pipeline is insane. The state preservation with Supabase makes team review super clean.',
        createdAt: new Date(Date.now() - 2 * 86400000 + 7200000).toISOString()
      }
    ]
  },

];

export async function getProjects(): Promise<Project[]> {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
    return INITIAL_PROJECTS;
  }
  try {
    return JSON.parse(data) as Project[];
  } catch {
    return INITIAL_PROJECTS;
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((p) => p.id === id) || null;
}

export async function saveProjects(projects: Project[]): Promise<void> {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
}

export async function addProject(
  projectData: Omit<Project, 'id' | 'likesCount' | 'likedBy' | 'comments' | 'createdAt'>
): Promise<Project> {
  const projects = await getProjects();
  const newProject: Project = {
    ...projectData,
    id: `proj-${Date.now()}`,
    likesCount: 0,
    likedBy: [],
    comments: [],
    createdAt: new Date().toISOString()
  };
  projects.unshift(newProject);
  await saveProjects(projects);
  return newProject;
}

export async function toggleLikeProject(projectId: string, userId: string): Promise<Project | null> {
  const projects = await getProjects();
  const index = projects.findIndex((p) => p.id === projectId);
  if (index === -1) return null;

  const project = projects[index];
  const hasLiked = project.likedBy.includes(userId);

  if (hasLiked) {
    project.likedBy = project.likedBy.filter((id) => id !== userId);
    project.likesCount = Math.max(0, project.likesCount - 1);
  } else {
    project.likedBy.push(userId);
    project.likesCount += 1;
  }

  projects[index] = project;
  await saveProjects(projects);
  return project;
}

export async function addCommentToProject(
  projectId: string,
  commentData: Omit<Comment, 'id' | 'createdAt'>
): Promise<Project | null> {
  const projects = await getProjects();
  const index = projects.findIndex((p) => p.id === projectId);
  if (index === -1) return null;

  const project = projects[index];
  const newComment: Comment = {
    ...commentData,
    id: `c-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  project.comments.push(newComment);
  projects[index] = project;
  await saveProjects(projects);
  return project;
}
