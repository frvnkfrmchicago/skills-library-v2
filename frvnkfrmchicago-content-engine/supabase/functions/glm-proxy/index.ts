// =============================================================================
// supabase/functions/glm-proxy/index.ts
// Edge Function: AI generation proxy for Asset Persona Content Hub.
// =============================================================================
// Accepts POST { model: string, prompt: string }
// Routes to Gemini or OpenAI based on model name, returns { text: string }.
//
// Secrets required (set via `supabase secrets set`):
//   GOOGLE_AI_API_KEY  -- for Gemini models
//   OPENAI_API_KEY     -- for GPT models
//   ANTHROPIC_API_KEY  -- for Claude models
// =============================================================================

interface ProxyRequest {
  model: string;
  prompt: string;
}

interface ProxyResponse {
  text: string;
  model: string;
  provider: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function callGemini(model: string, prompt: string): Promise<string> {
  const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured");

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${body}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callOpenAI(model: string, prompt: string): Promise<string> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${body}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

async function callAnthropic(model: string, prompt: string): Promise<string> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${body}`);
  }

  const data = await response.json();
  return data?.content?.[0]?.text || "";
}

function routeModel(model: string): "gemini" | "openai" | "anthropic" {
  if (model.startsWith("gemini")) return "gemini";
  if (model.startsWith("gpt")) return "openai";
  if (model.startsWith("claude")) return "anthropic";
  return "gemini";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  let body: ProxyRequest;
  try {
    body = await req.json() as ProxyRequest;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  const { model, prompt } = body;

  if (!model || !prompt) {
    return new Response(
      JSON.stringify({ error: "model and prompt are required" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  const targetModel = model === "glm-5.1" ? (Deno.env.get("GEMINI_MODEL") || "gemini-2.0-flash") : model;

  try {
    const provider = routeModel(targetModel);
    let text: string;

    switch (provider) {
      case "openai":
        text = await callOpenAI(targetModel, prompt);
        break;
      case "anthropic":
        text = await callAnthropic(targetModel, prompt);
        break;
      default:
        text = await callGemini(targetModel, prompt);
    }

    const result: ProxyResponse = { text, model: targetModel, provider };

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[glm-proxy] Error:", message);

    return new Response(
      JSON.stringify({ error: message }),
      { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }
});
