/* ═══ WORKBOOK BUILDER — source → fillable practice document (the Tutor) ═══
 * A new Upgrade.Self output: a workbook. Where the course builder turns a source
 * into lessons to read, the workbook turns the SAME source into a hands-on sheet
 * the learner fills in. Each section has a short teaching note (what to know),
 * one or more exercises (a prompt plus a place to write the answer or fill a
 * blank), and a reflection question that ties the idea back to their own work.
 *
 * Same rules as the course builder: local, deterministic, no backend. Every
 * teaching note and every exercise is drawn from the source text itself, so
 * nothing is invented. Sections come from the source's own headings exactly the
 * way buildCourse derives modules; a heading-less source is chunked by sentence.
 * Returns null on an empty source so the caller can stay honest about an empty
 * result instead of shipping a blank template.
 *
 * 2026 practice-design model: active recall plus a short reflection beats passive
 * reading. Each exercise asks the learner to produce something (restate a term,
 * complete a real sentence from the source, or check off the steps it names) so
 * the learning is in the doing, not the reading.
 * Refs: Active-recall worksheet design; deliberate-practice fill-in workbooks.
 */
import type { NotebookSource } from '../../types/notebook';

export interface WorkbookExercise {
  prompt: string;
  kind: 'short_answer' | 'fill_blank' | 'checklist';
  /** A short cue toward a good answer, taken from the source. */
  answerHint?: string;
  /** For fill_blank: the words removed from the sentence, in order. */
  blanks?: string[];
}

export interface WorkbookSection {
  heading: string;
  teaching: string;
  exercises: WorkbookExercise[];
  reflection: string;
}

export interface GeneratedWorkbook {
  id: string;
  title: string;
  intro: string;
  sourceTitle?: string;
  sections: WorkbookSection[];
  estimatedMinutes: number;
}

interface KeyTerm {
  term: string;
  definition: string;
}

interface Section {
  title: string;
  body: string;
}

// ── text helpers (mirror courseBuilder so both outputs read the source alike) ──
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
  // Capitalized multi-word phrases on a single line.
  const cap = /(?:^|[ \t])([A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+)+)/g;
  let m: RegExpExecArray | null;
  while ((m = cap.exec(text)) !== null) {
    const i = text.indexOf(m[1]);
    push(m[1], text.slice(Math.max(0, i - 10), i + m[1].length + 110));
  }
  return out.slice(0, 12);
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
  // No usable headings: chunk sentences into 2–6 sections.
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

// ── time estimate (read the note + do the exercises + write a reflection) ──
const WORDS_PER_MINUTE = 130; // adult reading + a beat to think about each idea
function minutesFor(teaching: string, exerciseCount: number): number {
  const words = teaching.split(/\s+/).filter(Boolean).length;
  const read = words / WORDS_PER_MINUTE;
  const write = exerciseCount * 1.5; // ~90s to actually write each answer
  const reflect = 1; // the closing reflection
  const est = Math.round(read + write + reflect);
  return Math.min(12, Math.max(3, est));
}

// ── bullet-step detection (drives checklist exercises) ──
/**
 * Pull ordered or bulleted lines from a section body. These become checklist
 * exercises so a how-to section turns into steps the learner can tick off.
 */
function bulletSteps(body: string): string[] {
  const steps: string[] = [];
  for (const line of body.split('\n')) {
    const t = line.trim();
    const m = t.match(/^(?:[-*]|\d+[.)])\s+(.+)$/);
    if (m) {
      const step = m[1].replace(/[#*_`]/g, '').replace(/\s+/g, ' ').trim();
      if (step.length > 6 && step.length < 200) steps.push(step);
    }
  }
  return steps;
}

// ── teaching note: the one or two sentences that frame the section ──
/**
 * The short "what to know" note for a section. We take the first one or two
 * real sentences of the section so the note is always the source's own words,
 * never a generated claim.
 */
function teachingFor(body: string, heading: string): string {
  const sents = sentences(body);
  if (sents.length === 0) return `Read the part of your source about ${heading}, then do the exercises below.`;
  const note = sents.slice(0, 2).join(' ');
  return note.length > 40 ? note : sents.slice(0, 3).join(' ');
}

// ── exercises: short answer on a term, fill-the-blank on a real sentence,
//    and a checklist when the section lists steps ──
/**
 * Build 1–3 exercises for a section, all grounded in its text:
 *  - one short-answer prompt asking the learner to restate a key term in their
 *    own words, with the source sentence as the answer hint;
 *  - one fill-the-blank built from a real sentence that uses a key term;
 *  - one checklist when the section lists steps to follow.
 * A thin section still yields at least one honest exercise.
 */
function buildExercises(body: string, terms: KeyTerm[]): WorkbookExercise[] {
  const sents = sentences(body);
  const exercises: WorkbookExercise[] = [];
  const usedTerms = new Set<string>();

  // 1. Short answer: restate the first key term that appears in the section.
  for (const t of terms) {
    if (usedTerms.has(lc(t.term))) continue;
    const owner = sents.find((s) => new RegExp(`\\b${escapeRe(t.term)}\\b`, 'i').test(s));
    if (owner) {
      usedTerms.add(lc(t.term));
      exercises.push({
        prompt: `In your own words, explain "${t.term}". Write one or two sentences.`,
        kind: 'short_answer',
        answerHint: owner.trim(),
      });
      break;
    }
  }

  // 2. Fill the blank: blank out a key term in a real sentence from the source.
  for (const sentence of sents) {
    if (exercises.some((e) => e.kind === 'fill_blank')) break;
    const hit = terms.find(
      (t) => !usedTerms.has(lc(t.term)) && new RegExp(`\\b${escapeRe(t.term)}\\b`, 'i').test(sentence),
    );
    if (!hit) continue;
    const blanked = sentence.replace(new RegExp(`\\b${escapeRe(hit.term)}\\b`, 'i'), '_____').trim();
    // Need real surrounding context, not a sentence that is basically the term.
    if (blanked.replace(/_+/g, '').replace(/[^a-zA-Z]/g, '').length < 12) continue;
    usedTerms.add(lc(hit.term));
    exercises.push({
      prompt: `Fill in the blank from the source: "${blanked}"`,
      kind: 'fill_blank',
      blanks: [hit.term],
      answerHint: sentence.trim(),
    });
  }

  // 3. Checklist: if the section lists steps, turn them into a do-and-tick list.
  const steps = bulletSteps(body);
  if (steps.length >= 2) {
    exercises.push({
      prompt: 'Work through these steps from the source and check off each one as you do it.',
      kind: 'checklist',
      blanks: steps.slice(0, 6),
    });
  }

  // Honest fallback: a thin section with no term still gets one real exercise
  // built from its own first sentence.
  if (exercises.length === 0 && sents.length > 0) {
    exercises.push({
      prompt: 'Read the line below and restate its one key point in your own words.',
      kind: 'short_answer',
      answerHint: sents[0].trim(),
    });
  }

  return exercises;
}

// ── reflection: tie the section back to the learner's own work ──
/**
 * The closing reflection for a section. We name the section's first key term (or
 * the heading) so the question is specific, and ask the learner to connect it to
 * something they already do. No invented facts, just a prompt to think.
 */
function reflectionFor(terms: KeyTerm[], heading: string): string {
  const focus = terms[0]?.term || heading;
  return `Where could you use ${focus} in your own work this week? Write down one concrete place.`;
}

/** Turn the notebook sources into a structured, fillable workbook. */
export function buildWorkbook(sources: NotebookSource[]): GeneratedWorkbook | null {
  const raw = sources.map((s) => s.content).join('\n\n');
  if (!raw.trim()) return null;

  const sectionData = splitSections(raw);
  if (sectionData.length === 0) return null;

  const allTerms = keyTerms(raw);

  const sections: WorkbookSection[] = sectionData
    .map((sec, idx) => {
      const terms = keyTerms(sec.body);
      const heading = sec.title || terms[0]?.term || `Section ${idx + 1}`;
      const teaching = teachingFor(sec.body, heading);
      const exercises = buildExercises(sec.body, terms);
      const reflection = reflectionFor(terms, heading);
      return { heading, teaching, exercises, reflection };
    })
    .filter((s) => s.exercises.length > 0);

  if (sections.length === 0) return null;

  const firstHeading = raw.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const title = firstHeading ? `${firstHeading}: Workbook` : `${allTerms[0]?.term || 'Your Source'}: Workbook`;
  const sourceTitle = sources.find((s) => s.title.trim())?.title.trim();
  const intro =
    sentences(raw).slice(0, 2).join(' ') ||
    `A hands-on workbook built from your source. Work through ${sections.length} sections, fill in each exercise, and answer the reflection at the end of each one.`;
  const estimatedMinutes = sections.reduce(
    (sum, s) => sum + minutesFor(s.teaching, s.exercises.length),
    0,
  );

  return {
    id: slugify(title),
    title,
    intro,
    sourceTitle,
    sections,
    estimatedMinutes,
  };
}

/** Turn a workbook title into a URL-safe slug (matches the course slug rule). */
function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `workbook-${Date.now()}`
  );
}

/**
 * Render a workbook to clean markdown for display or print. The fillable spots
 * are real blank lines so a learner can print the sheet and write on it, or
 * type into the gaps on screen. Nothing here is invented; every line traces to
 * the workbook the builder produced from the source.
 */
export function workbookToMarkdown(wb: GeneratedWorkbook): string {
  const lines: string[] = [];

  lines.push(`# ${wb.title}`);
  lines.push('');
  if (wb.sourceTitle) {
    lines.push(`Based on: ${wb.sourceTitle}`);
    lines.push('');
  }
  lines.push(wb.intro);
  lines.push('');
  lines.push(`Estimated time: about ${wb.estimatedMinutes} minutes.`);
  lines.push('');

  wb.sections.forEach((section, sIdx) => {
    lines.push(`## ${sIdx + 1}. ${section.heading}`);
    lines.push('');
    lines.push(`What to know: ${section.teaching}`);
    lines.push('');

    section.exercises.forEach((ex, eIdx) => {
      lines.push(`### Exercise ${sIdx + 1}.${eIdx + 1}`);
      lines.push('');
      lines.push(ex.prompt);
      lines.push('');

      if (ex.kind === 'checklist' && ex.blanks && ex.blanks.length > 0) {
        for (const step of ex.blanks) {
          lines.push(`- [ ] ${step}`);
        }
        lines.push('');
      } else if (ex.kind === 'fill_blank') {
        lines.push('Your answer: ____________________');
        lines.push('');
      } else {
        // short_answer: give two ruled lines to write on.
        lines.push('____________________________________________');
        lines.push('');
        lines.push('____________________________________________');
        lines.push('');
      }

      if (ex.answerHint) {
        lines.push(`Hint from the source: ${ex.answerHint}`);
        lines.push('');
      }
    });

    lines.push(`Reflection: ${section.reflection}`);
    lines.push('');
    lines.push('____________________________________________');
    lines.push('');
  });

  return lines.join('\n').trim() + '\n';
}
