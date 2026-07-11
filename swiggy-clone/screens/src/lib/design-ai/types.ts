import type { CopilotCardId, DesignDraft } from '../design-queue/types';

export type CopilotMode = 'chat' | CopilotCardId;

export interface DesignAiRequest {
  mode: CopilotMode;
  draft: DesignDraft;
  userMessage: string;
  screenPaths: string[];
  manifestSnippet?: string;
}

export interface StructuredCopilotResult {
  purpose?: string;
  considerations?: string[];
  risks?: string[];
  openQuestions?: string[];
  agentPrompt?: string;
  acceptance?: string[];
  filesToTouch?: string[];
  issues?: Array<{ text: string; severity: string }>;
  suggestions?: string[];
  suggestedFlow?: string[];
  reply?: string;
}

export interface DesignAiResponse {
  ok: boolean;
  content: string;
  structured?: StructuredCopilotResult;
  error?: string;
}
