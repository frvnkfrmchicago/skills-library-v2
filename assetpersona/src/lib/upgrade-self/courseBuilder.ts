/* ═══ COURSE BUILDER — source → structured lesson plan (the Curator) ═══
 * HANDOFF W2: "Course Generation Engine — source → modules → lessons → quizzes
 * → projects." Turns any source text into a real, teachable course people can
 * learn AI from. Local, deterministic, no backend — an LLM can refine later.
 *
 * 2026 microlearning model: every lesson is one focused 3–7 minute unit that
 * teaches a single concept (lead with the concept, add supporting detail, end
 * with a quick check). A dense section becomes 2–4 lessons instead of one wall
 * of text. Quiz distractors are drawn from real terms across the WHOLE course,
 * so the wrong answers are always plausible — never "Option 1/2/3".
 * Refs: 5mins.ai microlearning rules 2026; LearnWorlds AI course creator.
 */
import type { NotebookSource } from '../../types/notebook';
import type { QuizQuestion, LearnModule, MatchPair } from '../../types/learn';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface LessonCheck {
  question: string;
  answer: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  objective: string;
  content: string;
  checks: LessonCheck[];
  minutes: number;
  /** ADDED (optional, backward-compatible): the single concept this lesson teaches. */
  concept?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  summary: string;
  lessons: CourseLesson[];
  quiz: QuizQuestion[];
  keyTerms: { term: string; definition: string }[];
}

export interface GeneratedCourse {
  title: string;
  description: string;
  difficulty: Difficulty;
  durationMin: number;
  tags: string[];
  objectives: string[];
  modules: CourseModule[];
  project: { title: string; brief: string };
}

interface KeyTerm {
  term: string;
  definition: string;
}

// ── text helpers ──
function clean(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*|__|`/g, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function sentences(text: string): string[] {
  return clean(text)
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 320);
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Lowercase a term for set membership without losing the original casing. */
function lc(s: string): string {
  return s.toLowerCase();
}

/** Strip a trailing definite/indefinite article so titles read naturally. */
function bareConcept(term: string): string {
  return term.replace(/^(the|a|an)\s+/i, '').trim();
}

function keyTerms(text: string): KeyTerm[] {
  const out: KeyTerm[] = [];
  const seen = new Set<string>();
  const push = (term: string, def: string) => {
    const t = term.replace(/[#*_`]/g, '').replace(/\s+/g, ' ').trim();
    const k = lc(t);
    if (t.length > 2 && t.length < 48 && !seen.has(k)) {
      seen.add(k);
      out.push({ term: t, definition: def.replace(/\s+/g, ' ').trim().slice(0, 160) });
    }
  };
  // Capitalized multi-word phrases on a single line
  const cap = /(?:^|[ \t])([A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+)+)/g;
  let m: RegExpExecArray | null;
  while ((m = cap.exec(text)) !== null) {
    const i = text.indexOf(m[1]);
    push(m[1], text.slice(Math.max(0, i - 10), i + m[1].length + 110));
  }
  return out.slice(0, 12);
}

interface Section {
  title: string;
  body: string;
}

function splitSections(raw: string): Section[] {
  const matches = [...raw.matchAll(/^(#{1,3})\s+(.+)$/gm)];
  if (matches.length >= 2) {
    const out: Section[] = [];
    for (let i = 0; i < matches.length; i++) {
      const title = matches[i][2].trim();
      const start = (matches[i].index ?? 0) + matches[i][0].length;
      const end = i + 1 < matches.length ? (matches[i + 1].index ?? raw.length) : raw.length;
      const body = raw.slice(start, end).trim();
      if (body.length > 0) out.push({ title, body });
    }
    if (out.length >= 2) return out;
  }
  // No usable headings: chunk sentences into 2–6 modules.
  const sents = sentences(raw);
  if (sents.length === 0) return [];
  const n = Math.min(6, Math.max(2, Math.round(sents.length / 4)));
  const per = Math.ceil(sents.length / n);
  const out: Section[] = [];
  for (let i = 0; i < sents.length; i += per) {
    const chunk = sents.slice(i, i + per);
    if (chunk.length) out.push({ title: '', body: chunk.join(' ') });
  }
  return out;
}

// ── minutes estimate (microlearning: clamp every unit to 3–7 min) ──
const WORDS_PER_MINUTE = 130; // adult reading + a beat to think about each idea
function minutesFor(content: string, checkCount: number): number {
  const words = content.split(/\s+/).filter(Boolean).length;
  const read = words / WORDS_PER_MINUTE;
  const checks = checkCount * 0.4; // ~25s per quick check
  const est = Math.round(read + checks);
  return Math.min(7, Math.max(3, est));
}

// ── concept naming ──
/**
 * The single concept a lesson is about: the key term that appears in the unit,
 * else the module title. Returned bare (no leading article) for clean titles.
 */
function conceptFor(chunk: string[], terms: KeyTerm[], moduleTitle: string): string {
  const joined = chunk.join(' ');
  const hit = terms.find((t) => new RegExp(`\\b${escapeRe(t.term)}\\b`, 'i').test(joined));
  return bareConcept(hit?.term || moduleTitle);
}

/**
 * A specific, action-verb objective naming the concept. Picks the verb from the
 * lesson's own wording so "Apply", "Compare" etc. fit the content, and avoids
 * AI-filler phrasing (no "unlock", "leverage", no em dashes).
 */
function objectiveFor(concept: string, content: string): string {
  const c = lc(content);
  const noun = concept.charAt(0).toUpperCase() + concept.slice(1);
  if (/\b(step|first|then|process|how to|workflow|pipeline)\b/.test(c)) {
    return `Walk through how ${concept} works step by step.`;
  }
  if (/\b(versus|vs\.?|compared|difference|unlike|whereas|rather than)\b/.test(c)) {
    return `Tell ${concept} apart from the alternatives.`;
  }
  if (/\b(use|apply|build|write|create|implement|configure|deploy)\b/.test(c)) {
    return `Apply ${concept} to a real task.`;
  }
  if (/\b(why|because|reason|matters|important|risk|tradeoff|trade-off)\b/.test(c)) {
    return `Explain why ${concept} matters.`;
  }
  return `Explain what ${noun} is and how it works.`;
}

// ── lessons: 2–4 focused single-concept units per module ──
function buildLessons(
  moduleTitle: string,
  body: string,
  terms: KeyTerm[],
  lessonBase: number,
): CourseLesson[] {
  const sents = sentences(body);
  if (sents.length === 0) return [];

  // Aim for ~3-sentence focused units, then bound the count to 2–4 lessons.
  // A thin section (1–3 sentences) still yields a single honest lesson.
  const ideal = Math.max(1, Math.round(sents.length / 3));
  const lessonCount = sents.length <= 3 ? 1 : Math.min(4, Math.max(2, ideal));
  const per = Math.ceil(sents.length / lessonCount);

  const lessons: CourseLesson[] = [];
  for (let i = 0; i < sents.length && lessons.length < 4; i += per) {
    const chunk = sents.slice(i, i + per);
    if (!chunk.length) continue;
    const content = chunk.join(' ');
    const concept = conceptFor(chunk, terms, moduleTitle);

    // Up to 2 quick checks from terms that actually appear in this unit.
    const checks: LessonCheck[] = [];
    const usedTerm = new Set<string>();
    for (const t of terms) {
      if (checks.length >= 2) break;
      if (usedTerm.has(lc(t.term))) continue;
      const owner = chunk.find((s) => new RegExp(`\\b${escapeRe(t.term)}\\b`, 'i').test(s));
      if (owner) {
        usedTerm.add(lc(t.term));
        checks.push({ question: `In your own words, what is "${t.term}"?`, answer: owner.trim() });
      }
    }
    if (checks.length === 0) {
      checks.push({ question: 'What is the one key point of this lesson?', answer: chunk[0].trim() });
    }

    const single = lessonCount === 1;
    const conceptTitle = concept.charAt(0).toUpperCase() + concept.slice(1);
    const title = single ? moduleTitle : `${moduleTitle}: ${conceptTitle}`;
    lessons.push({
      id: `l-${lessonBase + lessons.length}`,
      title,
      objective: objectiveFor(concept, content),
      content,
      checks,
      minutes: minutesFor(content, checks.length),
      concept,
    });
  }
  return lessons;
}

// ── quiz: distractors from the WHOLE course, never numbered placeholders ──

/** Synthesize a plausible term-like distractor when the real pool runs dry. */
function syntheticDistractors(answer: string, avoid: Set<string>, need: number): string[] {
  // Prefixes/suffixes that produce believable AI/ML-flavored vocabulary.
  const prefixes = ['Adaptive', 'Latent', 'Contextual', 'Semantic', 'Dynamic', 'Recursive', 'Guided'];
  const suffixes = ['Model', 'Layer', 'Pattern', 'Pipeline', 'Heuristic', 'Schema', 'Routine', 'Vector'];
  const out: string[] = [];
  // Deterministic walk over the cross product so output is stable per build.
  for (let p = 0; p < prefixes.length && out.length < need; p++) {
    for (let s = 0; s < suffixes.length && out.length < need; s++) {
      const cand = `${prefixes[p]} ${suffixes[s]}`;
      const k = lc(cand);
      if (k === lc(answer) || avoid.has(k)) continue;
      avoid.add(k);
      out.push(cand);
    }
  }
  return out;
}

/**
 * Build up to 4 fill-the-blank questions for a module.
 * `coursePool` is every key term in the course, so distractors are real terms
 * the learner has seen elsewhere — plausible, never "Option N".
 */
function buildQuiz(body: string, terms: KeyTerm[], coursePool: string[]): QuizQuestion[] {
  const sents = sentences(body);
  const used = new Set<string>();
  const qs: QuizQuestion[] = [];

  for (const sentence of sents) {
    if (qs.length >= 4) break;
    const hit = terms.find(
      (t) => !used.has(lc(t.term)) && new RegExp(`\\b${escapeRe(t.term)}\\b`, 'i').test(sentence),
    );
    if (!hit) continue;
    const blanked = sentence.replace(new RegExp(`\\b${escapeRe(hit.term)}\\b`, 'i'), '_____').trim();
    if (blanked.replace(/_+/g, '').replace(/[^a-zA-Z]/g, '').length < 12) continue;
    used.add(lc(hit.term));

    // Pull distractors from the whole-course pool first.
    const avoid = new Set<string>([lc(hit.term)]);
    const distractors: string[] = [];
    // Rotate the starting point per question so the same 3 terms aren't reused.
    const start = (qs.length * 5 + 2) % Math.max(1, coursePool.length);
    for (let off = 0; off < coursePool.length && distractors.length < 3; off++) {
      const term = coursePool[(start + off) % coursePool.length];
      const k = lc(term);
      if (avoid.has(k)) continue;
      avoid.add(k);
      distractors.push(term);
    }
    // Still short (tiny source)? Synthesize plausible terms — never numbered.
    if (distractors.length < 3) {
      distractors.push(...syntheticDistractors(hit.term, avoid, 3 - distractors.length));
    }

    const options = [hit.term, ...distractors.slice(0, 3)];
    // Rotate so the answer isn't always first.
    const rot = qs.length % options.length;
    for (let r = 0; r < rot; r++) options.unshift(options.pop() as string);
    qs.push({
      id: `q-${qs.length}`,
      question: `Which term best completes: "${blanked}"?`,
      options,
      correct_option_index: options.indexOf(hit.term),
      explanation: `"${hit.term}" — ${sentence.trim()}`,
    });
  }
  return qs;
}

// ── difficulty: weighted signal scoring, not first-match ──
/**
 * Score concrete signals instead of returning on the first keyword hit:
 *  - vocabulary load (advanced/intermediate/beginner cue words, weighted)
 *  - term density (distinct multi-word terms per 100 words)
 *  - sentence length (longer prose tends to be denser material)
 * Thresholds map the blended score onto the three levels.
 */
function difficultyFor(text: string): Difficulty {
  const t = lc(text);
  const words = t.split(/\s+/).filter(Boolean).length || 1;

  const count = (re: RegExp) => (t.match(re) || []).length;
  const advanced = count(
    /\b(advanced|architecture|orchestrat\w*|distributed|optimiz\w*|production|scal\w*|asynchronous|concurrency|throughput|latency|infrastructure)\b/g,
  );
  const intermediate = count(
    /\b(intermediate|implement\w*|integrat\w*|build|deploy|engineer\w*|configure|pipeline|framework|workflow|api)\b/g,
  );
  const beginner = count(/\b(introduction|basic|beginner|overview|getting started|what is|fundamental|simple)\b/g);

  // Cue score per 1000 words so length doesn't dominate.
  const cue = ((advanced * 3 + intermediate * 1.5 - beginner * 2) / words) * 1000;

  // Density: distinct multi-word capitalized terms per 100 words.
  const density = (keyTerms(text).length / words) * 100;

  // Average sentence length (words) as a prose-complexity proxy.
  const sents = sentences(text);
  const avgLen = sents.length ? sents.join(' ').split(/\s+/).length / sents.length : 0;

  const score = cue + density * 1.5 + Math.max(0, avgLen - 14) * 0.4;

  if (score >= 9) return 'Advanced';
  if (score >= 3.5) return 'Intermediate';
  return 'Beginner';
}

/** Turn the notebook sources into a structured, teachable course. */
export function buildCourse(sources: NotebookSource[]): GeneratedCourse | null {
  const raw = sources.map((s) => s.content).join('\n\n');
  if (!raw.trim()) return null;

  const sectionData = splitSections(raw);
  if (sectionData.length === 0) return null;

  // Whole-course term pool (deduped, ordered) — the distractor source so wrong
  // answers are always real terms the learner has met somewhere in the course.
  const allTerms = keyTerms(raw);
  const coursePool: string[] = [];
  const poolSeen = new Set<string>();
  for (const sec of sectionData) {
    for (const t of keyTerms(sec.body)) {
      const k = lc(t.term);
      if (t.term.length > 2 && !poolSeen.has(k)) {
        poolSeen.add(k);
        coursePool.push(t.term);
      }
    }
  }
  for (const t of allTerms) {
    const k = lc(t.term);
    if (!poolSeen.has(k)) {
      poolSeen.add(k);
      coursePool.push(t.term);
    }
  }

  let lessonBase = 0;
  const modules: CourseModule[] = sectionData
    .map((sec, idx) => {
      const terms = keyTerms(sec.body);
      const title = sec.title || terms[0]?.term || `Module ${idx + 1}`;
      const lessons = buildLessons(title, sec.body, terms, lessonBase);
      lessonBase += lessons.length;
      const quiz = buildQuiz(sec.body, terms, coursePool);
      const summary = sentences(sec.body)[0] || `Core ideas of ${title}.`;
      return {
        id: `m-${idx}`,
        title,
        summary,
        lessons,
        quiz,
        keyTerms: terms.slice(0, 6),
      };
    })
    .filter((m) => m.lessons.length > 0);

  if (modules.length === 0) return null;

  const firstHeading = raw.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const title = firstHeading || `${allTerms[0]?.term || 'Your'} — A Course`;
  const description =
    sentences(raw).slice(0, 2).join(' ') || `A course built from your source covering ${modules.length} modules.`;
  const durationMin = modules.reduce((sum, m) => sum + m.lessons.reduce((s, l) => s + l.minutes, 0), 0);
  const objectives = modules.slice(0, 5).map((m) => `Understand ${m.title}`);
  const project = {
    title: `Apply it: ${title}`,
    brief: `Build or write something that uses the ideas from this course. Pick one concept (${allTerms
      .slice(0, 3)
      .map((t) => t.term)
      .join(', ')}) and produce a short artifact — a prompt, a script, a one-page explainer — that demonstrates it. Share it to your portfolio.`,
  };

  return {
    title,
    description,
    difficulty: difficultyFor(raw),
    durationMin,
    tags: allTerms.slice(0, 5).map((t) => t.term),
    objectives,
    modules,
    project,
  };
}

/* ═══ BRIDGE: GeneratedCourse → LearnModule ═══
 *
 * The learn store (src/data/learnStore.ts) is the SINGLE canonical source of
 * truth for every learnable module on the platform. A generated course must be
 * converted into that one shape before it is published, so the Learn hub and
 * the Classroom both read the exact same record. This mapper does that
 * conversion and nothing else. It is pure and side-effect free: it does not
 * write anywhere. The publish path calls publishGeneratedCourse() in the learn
 * store, which uses this mapper and then upserts the result.
 *
 * The field mapping mirrors the hand-built object the Upgrade.Self publish
 * handler used to assemble inline, so existing published courses keep the same
 * anatomy:
 *  - title       → module title
 *  - description → hook (trimmed to a one-line teaser) + module objective
 *  - first lesson content (+ optional human notes) → context_md
 *  - project brief → practice_md
 *  - every module's quiz, flattened → quiz_questions
 *  - first 8 key terms across the course → match_pairs
 *  - course tags → module tags (with a sensible fallback)
 *  - course durationMin → estimated_minutes
 */

/** Turn a course title into a URL-safe slug, matching the publish handler. */
export function slugifyCourseTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `course-${Date.now()}`
  );
}

/** Optional, caller-supplied context the mapper folds into the published module. */
export interface GeneratedCourseToModuleOptions {
  /**
   * Stable id for the module. Pass the source notebook id so re-publishing the
   * same notebook updates one record instead of creating duplicates. Defaults
   * to the slug.
   */
  id?: string;
  /** The human's free-text notes on the first module, folded into context_md. */
  firstModuleNotes?: string;
  /** The original source URL, recorded for provenance on the module. */
  sourceUrl?: string | null;
  /** Author id to stamp on the module. Defaults to 'upgrade-self-author'. */
  authorId?: string | null;
}

/**
 * Convert a GeneratedCourse into a learn-store LearnModule.
 *
 * Returns a fully typed LearnModule. created_at / updated_at / published_at are
 * stamped here; the local upsert helper re-stamps updated_at and preserves the
 * original created_at on re-publish, so those timestamps are safe to set now.
 */
export function generatedCourseToModule(
  course: GeneratedCourse,
  options: GeneratedCourseToModuleOptions = {},
): LearnModule {
  const slug = slugifyCourseTitle(course.title);
  const firstLesson = course.modules[0]?.lessons[0];
  const allQuiz: QuizQuestion[] = course.modules.flatMap((m) => m.quiz);

  // Fold the human's per-module notes into the first lesson's context so the
  // edits-beyond-the-text ship with the published plan.
  const notes = (options.firstModuleNotes ?? '').trim();
  const contextWithNotes = [firstLesson?.content || course.description, notes]
    .filter(Boolean)
    .join('\n\nMy notes: ');

  const matchPairs: MatchPair[] = course.modules
    .flatMap((m) => m.keyTerms)
    .slice(0, 8)
    .map((t) => ({ term: t.term, definition: t.definition }));

  const nowIso = new Date().toISOString();

  return {
    id: options.id || slug,
    slug,
    type: 'concept',
    status: 'published',
    hook: course.description.slice(0, 120),
    title: course.title,
    objective: course.objectives[0] || 'Learn the core concepts of this course.',
    context_md: contextWithNotes,
    practice_md: course.project.brief,
    practice_starter: null,
    reflect_question: firstLesson?.checks[0]?.question || null,
    quiz_questions: allQuiz,
    match_pairs: matchPairs,
    required_role: 'curious',
    tags: course.tags.length ? course.tags.slice(0, 4) : ['course', 'self-upgrade'],
    cover_image: null,
    estimated_minutes: course.durationMin,
    xp_reward: 50,
    pathway_id: null,
    pathway_order: null,
    source_url: options.sourceUrl ?? null,
    source_published_at: null,
    generated_by_ai: true,
    author_id: options.authorId ?? 'upgrade-self-author',
    pinned_as_today_drill_at: null,
    published_at: nowIso,
    created_at: nowIso,
    updated_at: nowIso,
    resources: [],
  };
}
