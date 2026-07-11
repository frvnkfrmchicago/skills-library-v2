export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'Prompting' | 'JSON' | 'Agents' | 'LLMOps';
  readTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  content: string; // Markdown or structured rich text
  initialCode: string; // Starter code for sandbox runner
  expectedOutputContains?: string; // Verification criteria
}

const DEFAULT_TUTORIALS: Tutorial[] = [
  {
    id: 'prompt-templates',
    title: 'Dynamic Prompt Templating',
    description: 'Learn how to construct structured system instructions and context variables dynamically for LLMs.',
    category: 'Prompting',
    readTime: '6 min read',
    difficulty: 'Beginner',
    initialCode: `// Dynamic Prompt Template Builder
function buildPrompt(role, topic, context) {
  return \`You are a professional \${role}.
Write a short response about \${topic}.

Use this additional context to inform your answer:
- \${context}

Tone: Authoritative, direct.\`;
}

const prompt = buildPrompt("AI Security Analyst", "Jailbreak Protections", "System prompts can be bypassed using wrapper overrides.");
console.log(prompt);
`,
    expectedOutputContains: 'AI Security Analyst',
    content: `### Dynamic Prompt Templates

In professional AI engineering, hardcoded prompts are rare. Instead, we use **Prompt Templating** to separate the instruction skeleton from user variables.

#### Why Templates Matter
1. **Consistency**: Ensure the model receives identical structures for identical tasks.
2. **Context Leakage Prevention**: Sanitize user inputs before interpolation.
3. **Multi-turn Contexts**: Inject conversation history dynamically.

#### Instructions
In this sandbox, you have a helper function \`buildPrompt\`. Your goal is to extend the function to accept a \`tone\` argument and inject it into the prompt.
`
  },
  {
    id: 'json-mode',
    title: 'Strict JSON Output Mode',
    description: 'Structure model responses using type-safe JSON Schemas and parse the outputs reliably.',
    category: 'JSON',
    readTime: '8 min read',
    difficulty: 'Intermediate',
    initialCode: `// Structuring and Parsing JSON Output
const sampleModelResponse = \`{
  "rating": 5,
  "sentiment": "positive",
  "keywords": ["fast", "intuitive", "glowing"]
}\`;

function parseResponse(raw) {
  try {
    const data = JSON.parse(raw);
    if (typeof data.rating !== 'number') throw new Error("Invalid rating type");
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

const parsed = parseResponse(sampleModelResponse);
console.log("Parsed Output:", JSON.stringify(parsed, null, 2));
`,
    expectedOutputContains: 'Parsed Output',
    content: `### Strict JSON Output Mode

When building software integrations, you cannot parse unstructured markdown paragraphs. You need **structured, machine-readable data** (usually JSON).

#### Guidelines for Safe JSON Extraction
- **Always Wrap in Try-Catch**: Even with JSON output mode activated, models can occasionally output trailing commas or incomplete brackets if cut off by token limits.
- **Run Assertive Validation**: Verify critical keys are present and types match your schema (e.g. using Zod or manual type asserts).
- **Graceful Fallbacks**: If parsing fails, fall back to a default object or trigger a retry query.

#### Task
Modify the parser in the sandbox to assert that \`keywords\` is an array containing at least one element. If not, trigger a validation error.
`
  },
  {
    id: 'react-loop',
    title: 'Building a ReAct Agent Loop',
    description: 'Program a basic Reason-Action-Observation loop that calls tools iteratively.',
    category: 'Agents',
    readTime: '12 min read',
    difficulty: 'Advanced',
    initialCode: `// Minimal ReAct Agent Loop
const TOOLS = {
  getWeather: (city) => \`The weather in \${city} is sunny and 72°F.\`,
  calculate: (expr) => eval(expr) // Mock evaluation
};

function runAgent(question) {
  console.log("User Question:", question);
  
  // Step 1: Reason
  console.log("Thought: I need to check the weather in Chicago and calculate the flight time.");
  
  // Step 2: Action (Tool Selection)
  const observation = TOOLS.getWeather("Chicago");
  console.log("Tool Observation:", observation);
  
  // Step 3: Final Answer
  const finalAnswer = \`Based on weather data: \${observation} Perfect flying conditions.\`;
  return finalAnswer;
}

const result = runAgent("Is it a good day to fly to Chicago?");
console.log("Final Agent Answer:", result);
`,
    expectedOutputContains: 'Final Agent Answer',
    content: `### Building a ReAct Agent Loop

The **ReAct (Reason + Action)** framework allows models to alternate between thinking, picking external tools, and evaluating tool outputs to solve multi-step problems.

#### Core Loop Steps:
1. **Thought**: The model decides what step to take next.
2. **Action**: The model requests a tool execution with specific arguments.
3. **Observation**: The system runs the tool and returns the outcome as context.
4. **Repeat**: Repeat until the model reaches a final answer.

#### Task
Inject a secondary tool call into the agent. Use the \`calculate\` tool to compute wind speed adjustments or flight durations, and output the result.
`
  }
];

export async function getTutorials(): Promise<Tutorial[]> {
  const local = localStorage.getItem('ap_tutorials');
  if (local) return JSON.parse(local);
  localStorage.setItem('ap_tutorials', JSON.stringify(DEFAULT_TUTORIALS));
  return DEFAULT_TUTORIALS;
}

export async function toggleBookmark(tutorialId: string): Promise<string[]> {
  const current = localStorage.getItem('ap_bookmarked_tutorials');
  let list: string[] = current ? JSON.parse(current) : [];
  if (list.includes(tutorialId)) {
    list = list.filter((id) => id !== tutorialId);
  } else {
    list.push(tutorialId);
  }
  localStorage.setItem('ap_bookmarked_tutorials', JSON.stringify(list));
  return list;
}

export function getBookmarks(): string[] {
  const current = localStorage.getItem('ap_bookmarked_tutorials');
  return current ? JSON.parse(current) : [];
}

export async function registerHelpfulness(tutorialId: string, helpful: boolean): Promise<Record<string, 'up' | 'down'>> {
  const current = localStorage.getItem('ap_tutorials_helpfulness');
  const dict: Record<string, 'up' | 'down'> = current ? JSON.parse(current) : {};
  dict[tutorialId] = helpful ? 'up' : 'down';
  localStorage.setItem('ap_tutorials_helpfulness', JSON.stringify(dict));
  return dict;
}

export function getHelpfulness(): Record<string, 'up' | 'down'> {
  const current = localStorage.getItem('ap_tutorials_helpfulness');
  return current ? JSON.parse(current) : {};
}
