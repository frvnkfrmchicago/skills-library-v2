/* ═══ LEARN LOCAL — bypass-aware local store ═══
 *
 * Mirrors the Wave 1 schema in localStorage so the entire learn experience is
 * testable in dev bypass before any migrations are pushed.
 *
 * In live mode this file is unused — direct Supabase calls take over. The
 * read/write helpers in `learnStore.ts` (Wave 3) route between this local
 * store and Supabase based on `isBypassActive()`.
 */

import { isBypassActive } from './devBypass';
import type {
  LearnModule,
  ModuleCompletion,
  UserStreak,
  Achievement,
  AchievementBadge,
  ModuleDraftQueueRow,
} from '../types/learn';

const KEYS = {
  modules: 'ap_learn_modules',
  completions: 'ap_learn_completions',
  progress: 'ap_learn_progress',
  streak: 'ap_learn_streak',
  achievements: 'ap_learn_achievements',
  drafts: 'ap_learn_drafts_queue',
  todayPin: 'ap_learn_today_pin',
} as const;

function readArr<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeArr<T>(key: string, arr: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(arr.slice(0, 1000)));
  } catch {
    /* quota — drop silently */
  }
}

/* ── Modules ── */

export function listLocalModules(): LearnModule[] {
  return readArr<LearnModule>(KEYS.modules).sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export function getLocalModuleBySlug(slug: string): LearnModule | undefined {
  return readArr<LearnModule>(KEYS.modules).find((m) => m.slug === slug);
}

export function upsertLocalModule(m: LearnModule): LearnModule {
  const all = readArr<LearnModule>(KEYS.modules);
  const idx = all.findIndex((x) => x.id === m.id || x.slug === m.slug);
  const now = new Date().toISOString();
  const next: LearnModule = {
    ...m,
    updated_at: now,
    created_at: idx >= 0 ? all[idx].created_at : (m.created_at ?? now),
    published_at: m.status === 'published' ? (m.published_at ?? now) : null,
  };
  if (idx >= 0) all[idx] = next;
  else all.unshift(next);
  writeArr(KEYS.modules, all);
  return next;
}

export function deleteLocalModule(id: string): void {
  writeArr(
    KEYS.modules,
    readArr<LearnModule>(KEYS.modules).filter((m) => m.id !== id)
  );
}

export function pinTodayDrill(moduleId: string | null): void {
  if (typeof window === 'undefined') return;
  if (moduleId) localStorage.setItem(KEYS.todayPin, moduleId);
  else localStorage.removeItem(KEYS.todayPin);
}

export function getTodayDrill(): LearnModule | undefined {
  const id = typeof window !== 'undefined' ? localStorage.getItem(KEYS.todayPin) : null;
  if (id) {
    const m = readArr<LearnModule>(KEYS.modules).find((x) => x.id === id);
    if (m && m.status === 'published') return m;
  }
  // Fallback: most recently published module
  return listLocalModules().find((m) => m.status === 'published');
}

/* ── Completions ── */

export function listLocalCompletions(userId: string): ModuleCompletion[] {
  return readArr<ModuleCompletion>(KEYS.completions).filter(
    (c) => c.user_id === userId
  );
}

export function isCompleted(userId: string, moduleId: string): boolean {
  return readArr<ModuleCompletion>(KEYS.completions).some(
    (c) => c.user_id === userId && c.module_id === moduleId
  );
}

export function recordLocalCompletion(
  userId: string,
  moduleId: string,
  xp: number,
  reflectText?: string
): ModuleCompletion {
  const all = readArr<ModuleCompletion>(KEYS.completions);
  if (all.some((c) => c.user_id === userId && c.module_id === moduleId)) {
    return all.find((c) => c.user_id === userId && c.module_id === moduleId)!;
  }
  const row: ModuleCompletion = {
    id: crypto.randomUUID(),
    user_id: userId,
    module_id: moduleId,
    xp_earned: xp,
    reflect_text: reflectText ?? null,
    completed_at: new Date().toISOString(),
  };
  all.unshift(row);
  writeArr(KEYS.completions, all);
  bumpLocalStreak(userId);
  return row;
}

/* ── Progress (per-step) ── */

interface ProgressRow {
  id: string;
  user_id: string;
  module_id: string;
  step: string;
  payload?: Record<string, unknown>;
  completed_at: string;
}

export function recordLocalStep(
  userId: string,
  moduleId: string,
  step: string,
  payload?: Record<string, unknown>
): void {
  const all = readArr<ProgressRow>(KEYS.progress);
  if (all.some((p) => p.user_id === userId && p.module_id === moduleId && p.step === step)) {
    return;
  }
  all.unshift({
    id: crypto.randomUUID(),
    user_id: userId,
    module_id: moduleId,
    step,
    payload,
    completed_at: new Date().toISOString(),
  });
  writeArr(KEYS.progress, all);
}

export function listLocalProgress(userId: string, moduleId: string): ProgressRow[] {
  return readArr<ProgressRow>(KEYS.progress).filter(
    (p) => p.user_id === userId && p.module_id === moduleId
  );
}

/* ── Streaks ── */

const EMPTY_STREAK = (userId: string): UserStreak => ({
  user_id: userId,
  current_count: 0,
  longest_count: 0,
  last_completed_on: null,
  freeze_days_used: 0,
  freeze_days_available: 1,
  updated_at: new Date().toISOString(),
});

export function getLocalStreak(userId: string): UserStreak {
  const arr = readArr<UserStreak>(KEYS.streak);
  return arr.find((s) => s.user_id === userId) ?? EMPTY_STREAK(userId);
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000
  );
}

function bumpLocalStreak(userId: string): UserStreak {
  const all = readArr<UserStreak>(KEYS.streak);
  const idx = all.findIndex((s) => s.user_id === userId);
  const today = todayUtc();
  const cur = idx >= 0 ? all[idx] : EMPTY_STREAK(userId);

  let next: UserStreak;
  if (cur.last_completed_on === today) {
    next = cur;
  } else if (cur.last_completed_on && daysBetween(cur.last_completed_on, today) === 1) {
    next = {
      ...cur,
      current_count: cur.current_count + 1,
      longest_count: Math.max(cur.longest_count, cur.current_count + 1),
      last_completed_on: today,
      updated_at: new Date().toISOString(),
    };
  } else if (
    cur.last_completed_on &&
    daysBetween(cur.last_completed_on, today) === 2 &&
    cur.freeze_days_available > 0
  ) {
    next = {
      ...cur,
      current_count: cur.current_count + 1,
      longest_count: Math.max(cur.longest_count, cur.current_count + 1),
      last_completed_on: today,
      freeze_days_used: cur.freeze_days_used + 1,
      freeze_days_available: cur.freeze_days_available - 1,
      updated_at: new Date().toISOString(),
    };
  } else {
    next = {
      ...cur,
      current_count: 1,
      longest_count: Math.max(cur.longest_count, 1),
      last_completed_on: today,
      updated_at: new Date().toISOString(),
    };
  }

  // Earn 1 freeze day every 4 days streaked (cap 3)
  if (next.current_count > 0 && next.current_count % 4 === 0) {
    next.freeze_days_available = Math.min(3, next.freeze_days_available + 1);
  }

  if (idx >= 0) all[idx] = next;
  else all.push(next);
  writeArr(KEYS.streak, all);
  return next;
}

/* ── Achievements ── */

export function listLocalAchievements(userId: string): Achievement[] {
  return readArr<Achievement>(KEYS.achievements).filter((a) => a.user_id === userId);
}

export function awardLocalAchievement(
  userId: string,
  badge: AchievementBadge,
  payload?: Record<string, unknown>
): Achievement | null {
  const all = readArr<Achievement>(KEYS.achievements);
  if (all.some((a) => a.user_id === userId && a.badge === badge)) return null;
  const row: Achievement = {
    id: crypto.randomUUID(),
    user_id: userId,
    badge,
    payload,
    earned_at: new Date().toISOString(),
  };
  all.unshift(row);
  writeArr(KEYS.achievements, all);
  return row;
}

/* ── Drafts queue (Wave 5) ── */

export function listLocalDrafts(): ModuleDraftQueueRow[] {
  return readArr<ModuleDraftQueueRow>(KEYS.drafts).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function appendLocalDraft(d: ModuleDraftQueueRow): void {
  const all = readArr<ModuleDraftQueueRow>(KEYS.drafts);
  if (d.source_hash && all.some((x) => x.source_hash === d.source_hash)) return;
  all.unshift(d);
  writeArr(KEYS.drafts, all);
}

export function updateLocalDraft(id: string, patch: Partial<ModuleDraftQueueRow>): void {
  const all = readArr<ModuleDraftQueueRow>(KEYS.drafts);
  const idx = all.findIndex((d) => d.id === id);
  if (idx < 0) return;
  all[idx] = { ...all[idx], ...patch, updated_at: new Date().toISOString() };
  writeArr(KEYS.drafts, all);
}

/* ── Bypass-only seed: 3 demo modules so the hub isn't empty in dev ── */

export function seedLocalLearnIfNeeded(): void {
  if (!isBypassActive()) return;

  const now = new Date().toISOString();

  const seed: LearnModule[] = [
    {
      id: 'what-ai-actually-is-id',
      slug: 'what-ai-actually-is',
      type: 'concept',
      status: 'published',
      hook: 'Cut through the hype and learn what AI really is in plain words.',
      title: 'What AI Actually Is',
      objective: 'Explain what AI is in plain language and know what it can and cannot do.',
      context_md: 'AI is software that learns patterns from a lot of examples and then uses those patterns to guess a good answer. When you type a question, it predicts the most likely helpful reply, one piece at a time. That is the whole trick. It is not magic and it is not alive.\n\nA chat AI has read a huge amount of text, so it is good at writing, explaining, summarizing, and brainstorming. You have already used simpler AI for years. The app that suggests your next word, the photos app that finds every picture of your dog, the email that filters spam. Same idea, smaller scale.\n\nHere is the part most people miss. AI does not actually know things the way a person does. It is making a smart guess based on patterns. Sometimes it guesses wrong and states it with total confidence. When AI makes something up that sounds real but is false, people call that a hallucination. Always double check anything that matters, like names, numbers, dates, or medical and legal facts.\n\nSo treat AI like a fast, eager assistant who is great with words but sometimes wrong. You bring the judgment. It brings the speed.',
      practice_md: 'Open any AI chat tool. Ask it one thing you already know the answer to, like a fact about your hometown or your job. Read the reply and decide if it got everything right. Notice where it was helpful and where it guessed. That instinct to check is the most useful AI skill you can build.',
      practice_starter: 'Tell me three things about [your town or your field of work], and keep it short.',
      reflect_question: 'When was a moment AI gave you an answer that sounded right but turned out to be wrong, and how would you catch that next time?',
      required_role: 'curious',
      tags: ['AI Basics', 'Beginner'],
      cover_image: null,
      estimated_minutes: 6,
      xp_reward: 20,
      pathway_id: null,
      pathway_order: null,
      source_url: null,
      source_published_at: null,
      generated_by_ai: false,
      author_id: null,
      pinned_as_today_drill_at: now.slice(0, 10),
      published_at: now,
      created_at: now,
      updated_at: now,
      resources: [],
    },
    {
      id: 'your-first-real-prompt-id',
      slug: 'your-first-real-prompt',
      type: 'concept',
      status: 'published',
      hook: 'Ask AI the right way and get a useful answer the first time.',
      title: 'Your First Real Prompt',
      objective: 'Write a clear request that gets AI to give you a useful answer.',
      context_md: 'A prompt is just the message you send to AI. Most people type one vague line, get a generic reply, and decide AI is not that good. The truth is the answer is only as clear as the question.\n\nThere is a simple way to fix almost any prompt. Tell the AI three things. First, who it should act as. Second, what you actually want. Third, what a good answer looks like.\n\nHere is the difference. A weak prompt says "write about coffee." A strong prompt says "Act as a friendly barista. Write three short tips for making better coffee at home. Keep each tip to one sentence and skip the fancy equipment." Same topic, far better result, because you told it the role, the task, and the shape of a good answer.\n\nYou do not need special words or tricks. Just be specific, like you would when handing a task to a new coworker who is smart but has never met you.',
      practice_md: 'Think of one small thing you want help with today, like a message you need to send or an idea you want explained. Write a prompt that names a role, says what you want, and says what good looks like. Send it, then read the reply and tweak one detail to make it even better.',
      practice_starter: 'Act as [a helpful role, for example a friendly coach]. Help me [what you want]. A good answer is [short, plain, three bullet points, or whatever fits].',
      reflect_question: 'Which of the three parts, the role, the task, or what good looks like, made the biggest difference in the answer you got back?',
      required_role: 'curious',
      tags: ['Prompting', 'Beginner'],
      cover_image: null,
      estimated_minutes: 6,
      xp_reward: 20,
      pathway_id: null,
      pathway_order: null,
      source_url: null,
      source_published_at: null,
      generated_by_ai: false,
      author_id: null,
      pinned_as_today_drill_at: null,
      published_at: now,
      created_at: now,
      updated_at: now,
      resources: [],
    },
    {
      id: 'make-ai-useful-every-day-id',
      slug: 'make-ai-useful-every-day',
      type: 'concept',
      status: 'published',
      hook: 'Turn AI into a daily helper for email, planning, and writing.',
      title: 'Make AI Useful Every Day',
      objective: 'Use AI for everyday tasks like drafting, summarizing, planning, and rewriting.',
      context_md: 'AI is most useful for small, everyday jobs that eat your time. You do not need a big project. You just need to hand off the boring parts.\n\nDrafting is the easiest win. Stuck on how to start an email or a message? Ask AI for a first draft, then fix it in your own words. A rough start you can edit beats a blank page every time.\n\nSummarizing saves you from long reading. Paste a long article, a thread, or your own messy notes and ask for the main points in plain language. Planning works the same way. Describe your day, your trip, or your grocery run and ask for a simple checklist you can follow.\n\nRewriting helps when the words are not landing. Ask AI to make a paragraph shorter, friendlier, or clearer. You stay in charge. AI just gives you options to pick from.',
      practice_md: 'Pick one real task from your day right now. Maybe a reply you owe someone, a long thing you need to read, or a list you keep forgetting. Ask AI to help with just that one task. Use the answer as a starting point and finish it in your own voice.',
      practice_starter: 'Here is a rough email I need to send. Make it clear and friendly, and keep it short: [paste your rough draft]',
      reflect_question: 'Which everyday task would you most like to hand to AI first, and what would you do with the time you save?',
      required_role: 'curious',
      tags: ['AI Basics', 'Everyday Use', 'Beginner'],
      cover_image: null,
      estimated_minutes: 5,
      xp_reward: 20,
      pathway_id: null,
      pathway_order: null,
      source_url: null,
      source_published_at: null,
      generated_by_ai: false,
      author_id: null,
      pinned_as_today_drill_at: null,
      published_at: now,
      created_at: now,
      updated_at: now,
      resources: [],
    },
    {
      id: 'build-something-with-ai-id',
      slug: 'build-something-with-ai',
      type: 'concept',
      status: 'published',
      hook: 'Make a tiny real thing by describing it to AI in plain words.',
      title: 'Build Something With AI',
      objective: 'Make a small working thing by describing it to AI in plain language.',
      context_md: 'You can make real things with AI without knowing how to code. The skill is describing what you want clearly, then asking for changes until it feels right. Same idea as writing a good prompt, just aimed at building something.\n\nStart tiny. Good first projects are a one page website that introduces you, or a simple checklist tool for a routine you repeat. Small projects finish fast, and finishing one teaches you more than reading ten guides.\n\nDescribe it like you are telling a friend. Say what it is for, who will use it, and what should be on the screen. For example, "Make a simple one page website for my dog walking service. Put my name at the top, three things I offer in the middle, and a way to contact me at the bottom. Keep it clean and friendly."\n\nThen look at what you get and ask for one change at a time. "Make the heading bigger." "Add a photo spot." Building is just a back and forth conversation until it matches the picture in your head.',
      practice_md: 'Pick one tiny thing to make, like a one page site about you or a checklist for a routine. Write a plain description of what it is for and what should be on it. Ask AI to make it, then request two small changes to make it feel like yours.',
      practice_starter: 'Make a simple one page website about [you or your idea]. At the top put [a title]. In the middle put [three things]. At the bottom put [how to reach you]. Keep it clean and easy to read.',
      reflect_question: 'What is one small thing you have always wanted to make but assumed you needed code for, and could you describe it in three plain sentences?',
      required_role: 'crafter',
      tags: ['Building', 'Beginner', 'Hands-On'],
      cover_image: null,
      estimated_minutes: 8,
      xp_reward: 25,
      pathway_id: null,
      pathway_order: null,
      source_url: null,
      source_published_at: null,
      generated_by_ai: false,
      author_id: null,
      pinned_as_today_drill_at: null,
      published_at: now,
      created_at: now,
      updated_at: now,
      resources: [],
    },
    {
      id: 'ai-basics-quick-check-id',
      slug: 'ai-basics-quick-check',
      type: 'quiz',
      status: 'published',
      hook: 'Three quick questions to lock in what you just learned.',
      title: 'AI Basics: Quick Check',
      objective: 'Check that you can spot AI mistakes and ask for better answers.',
      context_md: 'A few plain questions to make sure the basics stuck. No trick wording, no jargon. If one trips you up, that is a good sign of what to review.',
      practice_md: null,
      practice_starter: null,
      reflect_question: null,
      required_role: 'curious',
      tags: ['AI Basics', 'Quiz', 'Beginner'],
      cover_image: null,
      estimated_minutes: 4,
      xp_reward: 20,
      pathway_id: null,
      pathway_order: null,
      source_url: null,
      source_published_at: null,
      generated_by_ai: false,
      author_id: null,
      pinned_as_today_drill_at: null,
      published_at: now,
      created_at: now,
      updated_at: now,
      resources: [],
      quiz_questions: [
        {
          id: 'q1',
          question: 'When AI confidently states something that sounds real but is actually made up, what is that called?',
          options: [
            'A hallucination',
            'A download',
            'A shortcut',
            'A password'
          ],
          correct_option_index: 0,
          explanation: 'When AI makes up something false but states it with confidence, that is called a hallucination. It happens because AI is guessing a likely answer, not looking up a fact. This is why you always double check anything that matters.'
        },
        {
          id: 'q2',
          question: 'What is the best way to get a better answer from AI?',
          options: [
            'Type in all capital letters so it pays attention',
            'Give it clearer, more specific instructions',
            'Ask the same short question over and over',
            'Use longer and fancier words'
          ],
          correct_option_index: 1,
          explanation: 'The clearer and more specific your request, the better the answer. Tell AI who it should act as, what you want, and what a good answer looks like. Vague questions get vague replies.'
        },
        {
          id: 'q3',
          question: 'Which of these is a good everyday job to hand to AI?',
          options: [
            'Deciding your final medical treatment on its own',
            'Drafting a first version of an email you can then edit',
            'Confirming a fact with no need to check it',
            'Replacing your own judgment entirely'
          ],
          correct_option_index: 1,
          explanation: 'AI is great for quick first drafts you finish yourself, like an email or a summary. It saves you from the blank page. Keep the final judgment, the fact checking, and any serious decisions in your own hands.'
        }
      ]
    }
  ];

  for (const m of seed) {
    upsertLocalModule(m);
  }
  pinTodayDrill(seed[0].id);
}
