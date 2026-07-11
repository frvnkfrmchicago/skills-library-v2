import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import type { AiMessage, CopilotCardId, DesignDraft } from '@/lib/design-queue/types';
import { callDesignAi } from '@/lib/design-ai/client';
import { cardUserPrompt } from '@/lib/design-ai/prompts';
import { glass } from '@/screens-theme';

const CARDS: { id: CopilotCardId; label: string }[] = [
  { id: 'scope', label: 'Scope screen' },
  { id: 'considerations', label: 'Considerations' },
  { id: 'next-screen', label: 'Next screen' },
  { id: 'agent-handoff', label: 'Agent handoff' },
  { id: 'challenge', label: 'Challenge layout' },
];

interface Props {
  draft: DesignDraft;
  screenPaths: string[];
  onThreadUpdate: (thread: AiMessage[]) => void;
  onApplyNotes?: (text: string) => void;
  accent: string;
  accentSoft: string;
  txtMuted: string;
  txtHeadline: string;
  hairline: string;
}

function newMsg(role: AiMessage['role'], content: string, cardId?: string): AiMessage {
  return {
    id: `ai-${Date.now().toString(36)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
    cardId,
  };
}

function formatStructured(content: string, structured?: Record<string, unknown>): string {
  if (!structured) return content;
  const lines: string[] = [];
  for (const [k, v] of Object.entries(structured)) {
    if (Array.isArray(v)) lines.push(`**${k}**\n${v.map((x) => `- ${String(x)}`).join('\n')}`);
    else if (typeof v === 'string') lines.push(`**${k}:** ${v}`);
  }
  return lines.length ? lines.join('\n\n') : content;
}

export function DesignCopilot({
  draft,
  screenPaths,
  onThreadUpdate,
  onApplyNotes,
  accent,
  accentSoft,
  txtMuted,
  txtHeadline,
  hairline,
}: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (mode: CopilotCardId | 'chat', userMessage: string) => {
    setLoading(true);
    setError(null);
    const user = newMsg('user', userMessage, mode === 'chat' ? undefined : mode);
    const thread = [...draft.aiThread, user];
    onThreadUpdate(thread);

    const res = await callDesignAi({
      mode,
      draft,
      userMessage,
      screenPaths,
    });

    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? 'GLM request failed');
      return;
    }
    const text = formatStructured(res.content, res.structured as Record<string, unknown> | undefined);
    onThreadUpdate([...thread, newMsg('assistant', text, mode === 'chat' ? undefined : mode)]);
    if (mode === 'agent-handoff' && res.structured?.agentPrompt && onApplyNotes) {
      onApplyNotes(String(res.structured.agentPrompt));
    }
  };

  return (
    <aside
      className={`${glass.raised} flex h-full w-[260px] shrink-0 flex-col overflow-hidden`}
      aria-label="Design copilot"
    >
      <div className="flex items-center gap-2 border-b px-3 py-2.5" style={{ borderColor: hairline }}>
        <Sparkles className="h-4 w-4" style={{ color: accent }} />
        <div>
          <p className="text-[12px] font-bold" style={{ color: txtHeadline }}>
            GLM Copilot
          </p>
          <p className="text-[10px]" style={{ color: txtMuted }}>
            glm-5.1 · prompting modes
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b p-2" style={{ borderColor: hairline }}>
        {CARDS.map((c) => (
          <button
            key={c.id}
            type="button"
            disabled={loading}
            onClick={() => void run(c.id, cardUserPrompt(c.id, draft.title))}
            className="rounded-md px-2 py-1 text-[10px] font-semibold"
            style={{ backgroundColor: accentSoft, color: accent }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2 space-y-2">
        {draft.aiThread.length === 0 && (
          <p className="text-[11px] leading-relaxed px-1" style={{ color: txtMuted }}>
            Use prompt cards for structured output, or chat below. Uses GLM_API_KEY from
            screens/.env.local (same as GrazzHopper Content Hub).
          </p>
        )}
        {draft.aiThread.slice(-8).map((m) => (
          <div
            key={m.id}
            className="rounded-lg px-2 py-1.5 text-[11px] leading-relaxed whitespace-pre-wrap"
            style={{
              backgroundColor: m.role === 'user' ? 'rgba(255,255,255,0.04)' : accentSoft,
              color: m.role === 'user' ? txtMuted : txtHeadline,
            }}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-[11px]" style={{ color: accent }}>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Thinking…
          </div>
        )}
        {error && (
          <p className="text-[11px]" style={{ color: '#f87171' }}>
            {error}
          </p>
        )}
      </div>

      <div className="border-t p-2" style={{ borderColor: hairline }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={2}
          placeholder="Ask about this screen…"
          className={`${glass.inset} w-full rounded-lg px-2 py-1.5 text-[12px]`}
          style={{ color: txtHeadline }}
        />
        <button
          type="button"
          disabled={loading || !input.trim()}
          onClick={() => {
            const msg = input.trim();
            setInput('');
            void run('chat', msg);
          }}
          className="mt-1.5 w-full rounded-lg py-1.5 text-[12px] font-semibold disabled:opacity-40"
          style={{ backgroundColor: accentSoft, color: accent }}
        >
          Send
        </button>
      </div>
    </aside>
  );
}
