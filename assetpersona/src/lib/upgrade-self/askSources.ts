/* ═══ ASK YOUR SOURCES — local grounded Q&A (the Tutor agent) ═══
 * NotebookLM-style: answers are pulled DIRECTLY from the user's added sources
 * (extractive retrieval + citations), so every answer is grounded and cited.
 * Runs fully client-side — no LLM, no backend, no MiniMax required.
 */
import type { NotebookSource } from '../../types/notebook';

export interface Citation {
  sourceTitle: string;
  snippet: string;
}

export interface GroundedAnswer {
  answer: string;
  citations: Citation[];
  grounded: boolean;
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'on', 'for', 'and',
  'or', 'but', 'with', 'as', 'by', 'at', 'from', 'that', 'this', 'it', 'be', 'can',
  'do', 'does', 'did', 'how', 'what', 'why', 'when', 'which', 'who', 'whom', 'about',
  'i', 'you', 'we', 'they', 'he', 'she', 'my', 'your', 'our', 'their', 'me', 'us',
  'so', 'if', 'then', 'than', 'into', 'out', 'up', 'down', 'over', 'tell', 'explain',
  'give', 'show', 'list', 'some', 'any', 'all', 'more', 'most', 'there', 'here',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

interface Passage {
  text: string;
  sourceTitle: string;
}

function splitPassages(source: NotebookSource): Passage[] {
  const clean = source.content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*|__|`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const sentences = clean.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 30);
  const passages: Passage[] = [];
  // Group ~2 sentences per passage so an answer has real context.
  for (let i = 0; i < sentences.length; i += 2) {
    const text = sentences.slice(i, i + 2).join(' ').slice(0, 420).trim();
    if (text.length > 40) passages.push({ text, sourceTitle: source.title });
  }
  return passages;
}

const SUMMARY_INTENT = /\b(summar|overview|tldr|about|gist|main idea|key points?|takeaways?)\b/i;

/**
 * Answer a question using ONLY the provided sources. Returns the most relevant
 * passages as a grounded answer plus citations to the sources they came from.
 */
export function askSources(question: string, sources: NotebookSource[]): GroundedAnswer {
  const q = question.trim();
  if (!q) {
    return { answer: 'Ask a question about your sources.', citations: [], grounded: false };
  }
  if (sources.length === 0) {
    return { answer: 'Add a source above first — then ask it anything.', citations: [], grounded: false };
  }

  const passages = sources.flatMap(splitPassages);
  if (passages.length === 0) {
    return {
      answer: "Your sources don't have enough text to answer from yet. Add more content and try again.",
      citations: [],
      grounded: false,
    };
  }

  // "Summarize / what's this about" → lead with each source's opening passages.
  if (SUMMARY_INTENT.test(q)) {
    const lead = sources
      .map((s) => splitPassages(s)[0])
      .filter((p): p is Passage => !!p);
    if (lead.length > 0) {
      return {
        answer: lead.map((p) => p.text).join(' '),
        citations: lead.slice(0, 3).map((p) => ({ sourceTitle: p.sourceTitle, snippet: p.text })),
        grounded: true,
      };
    }
  }

  const qTokens = new Set(tokenize(q));
  if (qTokens.size === 0) {
    const lead = passages.slice(0, 2);
    return {
      answer: lead.map((p) => p.text).join(' '),
      citations: lead.map((p) => ({ sourceTitle: p.sourceTitle, snippet: p.text })),
      grounded: true,
    };
  }

  const scored = passages
    .map((p) => {
      const pTokens = tokenize(p.text);
      const matched = new Set<string>();
      for (const t of pTokens) if (qTokens.has(t)) matched.add(t);
      // Reward coverage of distinct question terms; lightly penalize very long passages.
      const score = matched.size - 0.0008 * pTokens.length;
      return { ...p, score, hits: matched.size };
    })
    .filter((p) => p.hits > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return {
      answer:
        "I couldn't find anything about that in your sources. Try rephrasing, or add a source that covers it.",
      citations: [],
      grounded: false,
    };
  }

  const top = scored.slice(0, 3);
  // Lead answer = the 1-2 strongest passages; cite up to 3.
  const answer = top.slice(0, 2).map((p) => p.text).join(' ');
  const citations = top.map((p) => ({ sourceTitle: p.sourceTitle, snippet: p.text }));
  return { answer, citations, grounded: true };
}
