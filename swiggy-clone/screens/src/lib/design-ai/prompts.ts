import type { CopilotCardId } from '../design-queue/types';

const BASE = `You are the Design Studio copilot for a Swiggy food-delivery screen gallery.
Ground every answer in the provided draft spec, manifest slice, and designer notes.
Be direct, actionable, and specific. No generic filler.
Output must help a human designer and a coding agent implement screens in index.html and app.js.`;

const CARD_INSTRUCTIONS: Record<CopilotCardId, string> = {
  scope: `Return JSON only with keys: purpose (string), primaryActions (string[]), outOfScope (string[]).`,
  considerations: `Return JSON only with keys: considerations (string[]), risks (string[]), dependencies (string[]).`,
  'next-screen': `Return JSON only with keys: suggestedFlow (string[]), openQuestions (string[]).`,
  'agent-handoff': `Return JSON only with keys: agentPrompt (string), acceptance (string[]), filesToTouch (string[]).`,
  challenge: `Return JSON only with keys: issues ({text, severity}[]), suggestions (string[]).`,
};

export function buildSystemPrompt(mode: CopilotCardId | 'chat'): string {
  if (mode === 'chat') {
    return `${BASE}
You may answer in markdown. When listing build tasks, reference real file paths from context.
If the user asks for a handoff, include a concise agentPrompt block.`;
  }
  return `${BASE}\n${CARD_INSTRUCTIONS[mode]}`;
}

export function cardUserPrompt(cardId: CopilotCardId, draftTitle: string): string {
  const prompts: Record<CopilotCardId, string> = {
    scope: `Scope the screen design "${draftTitle}". What is in and out of scope?`,
    considerations: `List implementation considerations, risks, and dependencies for "${draftTitle}".`,
    'next-screen': `What screens should come before/after "${draftTitle}" in the user flow?`,
    'agent-handoff': `Write a complete agent handoff prompt to implement "${draftTitle}" from the design queue.`,
    challenge: `Critique the current draft layout and annotations for "${draftTitle}".`,
  };
  return prompts[cardId];
}
