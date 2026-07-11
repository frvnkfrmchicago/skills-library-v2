import type { DesignAiRequest, DesignAiResponse } from './types';

export async function callDesignAi(req: DesignAiRequest): Promise<DesignAiResponse> {
  try {
    const res = await fetch('/api/design-ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    const data = (await res.json()) as DesignAiResponse;
    if (!res.ok) {
      return { ok: false, content: '', error: data.error ?? res.statusText };
    }
    return data;
  } catch (e) {
    return {
      ok: false,
      content: '',
      error: e instanceof Error ? e.message : 'Network error',
    };
  }
}
