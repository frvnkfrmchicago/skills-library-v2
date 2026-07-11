import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive } from '../lib/devBypass';
import { earnPoints } from './leaguesStore';

export interface BriefAsset {
  label: string;
  url: string;
}

export interface Brief {
  id: string;
  title: string;
  slug: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours: number;
  xp_reward: number;
  category: 'Prompt Engineering' | 'LLM Integration' | 'RAG Systems' | 'AI Agents';
  summary: string;
  scenario: string;
  objective: string;
  tasks: string[];
  assets: BriefAsset[];
}

export interface BriefSubmission {
  id: string;
  brief_id: string;
  user_id: string;
  submission_link: string;
  notes?: string;
  submitted_at: string;
}

const SEEDED_BRIEFS: Brief[] = [
  {
    id: 'brief-prompt-hardening',
    title: 'System Prompt Hardening for Financial Chatbots',
    slug: 'system-prompt-hardening-financial',
    difficulty: 'intermediate',
    estimated_hours: 3,
    xp_reward: 250,
    category: 'Prompt Engineering',
    summary: 'Design a system prompt for a retail banking AI that prevents jailbreaks and halts sensitive information leakage.',
    scenario: 'You are hired by ApexBank to secure their new customer service chatbot. In initial testing, users were able to convince the bot to waive credit card fees and explain internal database schemas. Your job is to engineer a robust, defensive system prompt, test it against 5 known vulnerability vectors, and document the outcomes.',
    objective: 'Create a system instruction suite that blocks adversarial attacks (DAN-style instructions, translator-bypass hacks, roleplay overrides) while maintaining high-quality answers for ordinary retail banking questions.',
    tasks: [
      'Analyze the system instructions and identify potential vulnerability pathways.',
      'Develop a multi-layered defensive system prompt using XML tag formatting.',
      'Set clear safety boundaries (e.g., prohibiting any instructions about database schema, developer override keywords, fee-waiving approvals).',
      'Test your prompt against 5 distinct jailbreak payloads (e.g., adversarial suffixes, cognitive dissonance prompts, system emulation).',
      'Export your prompt and document the safety-vs-accuracy trade-offs.'
    ],
    assets: [
      { label: 'ApexBank Vulnerability Report (Doc)', url: 'https://docs.google.com' },
      { label: 'Adversarial Prompt Test Harness', url: 'https://gist.github.com' }
    ]
  },
  {
    id: 'brief-multi-agent-router',
    title: 'Multi-Agent Support Desk Router with LangGraph',
    slug: 'multi-agent-router-langgraph',
    difficulty: 'advanced',
    estimated_hours: 6,
    xp_reward: 400,
    category: 'AI Agents',
    summary: 'Design and build a multi-agent system that routes tickets, runs tools, and executes human handoffs.',
    scenario: 'Your startup is scaling rapidly and support tickets are piling up. You need to build a smart routing agent that parses incoming ticket intent, queries the user status using mock databases, routes billing queries to a refund calculator, and escalates angry users to human staff.',
    objective: 'Construct a stateful multi-agent system using LangGraph (or custom node logic) that ensures structured transitions, tool validation checks, and clean human-in-the-loop triggers.',
    tasks: [
      'Define the state object representing the user session and ticket metadata.',
      'Implement an LLM-based Ticket Intent Classifier using structured output JSON schemas.',
      'Create independent nodes for Billing processing, Technical debugging, and Account Recovery.',
      'Set up conditional routing logic based on LLM output and ticket priority.',
      'Add a human-in-the-loop verification step for refund requests exceeding $100.'
    ],
    assets: [
      { label: 'LangGraph Starter Template (Notebook)', url: 'https://colab.research.google.com' },
      { label: 'Customer Ticket Dataset (JSON)', url: 'https://gist.github.com' }
    ]
  },
  {
    id: 'brief-rag-evaluation',
    title: 'Adversarial RAG Evaluation with Ragas',
    slug: 'rag-evaluation-ragas',
    difficulty: 'advanced',
    estimated_hours: 5,
    xp_reward: 350,
    category: 'RAG Systems',
    summary: 'Set up an automated RAG evaluation pipeline to measure faithfulness, relevance, and recall under retrieval noise.',
    scenario: 'The product team built a PDF search engine for employee handbooks, but users complain that answers are sometimes hallucinated or ignore details. You need to establish an automated evaluation framework to run 30 test queries, score chunking strategies, and isolate where failure occurs.',
    objective: 'Build an evaluation test script that calculates Faithfulness, Answer Relevance, and Context Recall using the Ragas library, comparing chunk size configurations of 256 vs. 512 tokens.',
    tasks: [
      'Load the employee handbook test dataset and clean raw context strings.',
      'Initialize an LLM evaluator using OpenAI or Gemini API connections.',
      'Write an evaluation loop to process test queries through both chunking configurations.',
      'Extract Ragas scores (faithfulness, context_recall, context_precision).',
      'Generate a comparison report showing which configuration performs best under noise.'
    ],
    assets: [
      { label: 'RAG Evaluation Framework (Notebook)', url: 'https://colab.research.google.com' },
      { label: 'Handbook Test Dataset (JSON)', url: 'https://gist.github.com' }
    ]
  },
  {
    id: 'brief-structured-cataloging',
    title: 'Structured Output Generator for E-Commerce',
    slug: 'structured-output-cataloging',
    difficulty: 'beginner',
    estimated_hours: 2,
    xp_reward: 150,
    category: 'LLM Integration',
    summary: 'Use JSON Schema and Pydantic to parse unformatted manufacturer text into normalized database structures.',
    scenario: 'A major clothing distributor has thousands of unformatted, chaotic descriptions from different manufacturers. You need to build a pipeline that extracts structured product attributes (materials, sizes, color palette, dimensions) into standardized database schemas.',
    objective: 'Implement a structured data parser utilizing Chat Completion models with strict JSON response formats, verifying schema compliance and missing value fallbacks.',
    tasks: [
      'Define the target Pydantic / JSON Schema for product inventory specifications.',
      'Implement API calls specifying response_format to guarantee JSON output.',
      'Add parsing validation logic to handle missing or ambiguous fields.',
      'Process 10 chaotic manufacturer description examples and output validated objects.',
      'Implement a fallback logic to log parsing exceptions without crashing.'
    ],
    assets: [
      { label: 'Manufacturer Unstructured Data (JSON)', url: 'https://gist.github.com' },
      { label: 'Target Inventory Schema Specs', url: 'https://docs.google.com' }
    ]
  }
];

function shouldUseRemote(): boolean {
  return isSupabaseConfigured && !isBypassActive();
}

export async function listBriefs(): Promise<Brief[]> {
  // Always return the standard briefs list
  return SEEDED_BRIEFS;
}

export async function getBriefBySlug(slug: string): Promise<Brief | null> {
  const brief = SEEDED_BRIEFS.find((b) => b.slug === slug);
  return brief || null;
}

export async function listSubmissions(userId: string): Promise<BriefSubmission[]> {
  if (!shouldUseRemote()) {
    const key = `ap_brief_submissions_${userId}`;
    const local = localStorage.getItem(key);
    return local ? JSON.parse(local) : [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('brief_submissions')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false });

  return (data as BriefSubmission[]) ?? [];
}

export async function submitBrief(
  briefId: string,
  userId: string,
  submissionLink: string,
  notes?: string
): Promise<BriefSubmission> {
  const brief = SEEDED_BRIEFS.find((b) => b.id === briefId);
  if (!brief) {
    throw new Error('Brief not found');
  }

  const submission: BriefSubmission = {
    id: `sub-${Math.random().toString(36).substring(2, 11)}`,
    brief_id: briefId,
    user_id: userId,
    submission_link: submissionLink,
    notes: notes || '',
    submitted_at: new Date().toISOString(),
  };

  if (!shouldUseRemote()) {
    const key = `ap_brief_submissions_${userId}`;
    const existing = await listSubmissions(userId);
    // Remove previous submission for this brief if any, so we update it
    const filtered = existing.filter((s) => s.brief_id !== briefId);
    filtered.push(submission);
    localStorage.setItem(key, JSON.stringify(filtered));

    // Award XP
    await earnPoints(userId, brief.xp_reward);
    return submission;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('brief_submissions')
    .upsert({
      brief_id: briefId,
      user_id: userId,
      submission_link: submissionLink,
      notes: notes || '',
      submitted_at: new Date().toISOString(),
    }, { onConflict: 'brief_id,user_id' })
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Award XP
  await earnPoints(userId, brief.xp_reward);
  return data as BriefSubmission;
}

export async function isBriefCompleted(briefId: string, userId: string): Promise<boolean> {
  const subs = await listSubmissions(userId);
  return subs.some((s) => s.brief_id === briefId);
}
