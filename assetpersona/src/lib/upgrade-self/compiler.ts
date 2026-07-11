export interface CompiledModule {
  title: string;
  slug: string;
  hook: string;
  objective: string;
  context_md: string;
  practice_md: string;
  practice_starter: string;
  reflect_question: string;
  estimated_minutes: number;
  tags: string[];
}

/**
 * Parses raw markdown text into a fully-structured educational module
 * matching the public.modules table schema in Supabase.
 */
export function compileMarkdownToModule(
  markdown: string,
  style: 'visual' | 'skimmer' | 'matrix' = 'visual'
): CompiledModule {
  const lines = markdown.split('\n');
  
  let title = 'Untitled Lesson Module';
  let hook = 'Understand key system concepts to build and secure your stack.';
  let objective = 'After this module, you will be able to explain the core mechanics of this topic.';
  
  let contextLines: string[] = [];
  let practiceLines: string[] = [];
  let practiceStarterLines: string[] = [];
  let reflectQuestion = 'How does this concept apply to your active project?';
  let tags: string[] = ['ai-literacy', 'learning-path'];
  
  let inPracticeSection = false;
  let inCodeBlock = false;
  
  // Clean up input
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const trimmed = line.trim();
    
    // 1. Detect H1 -> Title
    if (trimmed.startsWith('#') && !trimmed.startsWith('##')) {
      title = trimmed.replace(/^#\s+/, '');
      continue;
    }
    
    // 2. Detect Hook annotation or paragraph
    if (trimmed.startsWith('> Hook:')) {
      hook = trimmed.replace(/^>\s*Hook:\s*/, '');
      continue;
    }
    
    // 3. Detect Objective annotation
    if (trimmed.startsWith('> Objective:')) {
      objective = trimmed.replace(/^>\s*Objective:\s*/, '');
      continue;
    }
    
    // 4. Detect Reflect Question
    if (trimmed.startsWith('? Reflect:') || trimmed.startsWith('> Reflect:')) {
      reflectQuestion = trimmed.replace(/^[?>]\s*Reflect:\s*/, '');
      continue;
    }
    
    // 5. Detect Section headers
    if (trimmed.startsWith('##')) {
      const headerText = trimmed.replace(/^##\s+/, '').toLowerCase();
      if (headerText.includes('practice') || headerText.includes('challenge') || headerText.includes('exercise')) {
        inPracticeSection = true;
      } else {
        inPracticeSection = false;
      }
      continue;
    }
    
    // 6. Handle Code Block inside Practice Section
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    
    if (inCodeBlock && inPracticeSection) {
      practiceStarterLines.push(line);
      continue;
    }
    
    // 7. Accumulate content lines
    if (inPracticeSection) {
      if (trimmed) practiceLines.push(line);
    } else {
      if (trimmed && !trimmed.startsWith('> ') && !trimmed.startsWith('? ')) {
        contextLines.push(line);
      }
    }
  }
  
  // Format slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'compiled-lesson';
    
  // Reconstruct markdown blocks depending on the selected cognitive learning style
  let context_md = '';
  if (style === 'skimmer') {
    const bullets = contextLines
      .filter(line => line.trim().length > 15)
      .map(line => {
        const firstSentence = line.split(/[.!?]/)[0] + '.';
        return `- **Focus**: ${firstSentence}`;
      });
    context_md = `> **TL;DR Skimmer View**: ${hook}\n\n### Core Highlights\n${bullets.join('\n')}`;
  } else if (style === 'matrix') {
    const tableRows = contextLines
      .filter(line => line.trim().length > 20)
      .map((line, idx) => {
        const parts = line.split(/[,.:;]/);
        const concept = parts[0]?.trim() || `Concept ${idx + 1}`;
        const mechanism = parts[1]?.trim() || 'Standard Execution';
        const advantage = parts.slice(2).join(', ').trim() || 'Reduces cognitive load';
        return `| **${concept}** | ${mechanism} | ${advantage} |`;
      });
    context_md = `### Concept Comparison Matrix\n\n| Learning Pillar | Target Mechanism | Operational Benefit |\n| :--- | :--- | :--- |\n${
      tableRows.join('\n') || '| **General Core** | Context Ingestion | Visualizing mental paths |'
    }`;
  } else {
    context_md = contextLines.join('\n\n') || 'No context content compiled.';
  }

  const practice_md = practiceLines.join('\n\n') || 'Perform hands-on analysis and document your results.';
  const practice_starter = practiceStarterLines.join('\n') || '';
  
  // Calculate reading time
  const wordCount = context_md.split(/\s+/).length + practice_md.split(/\s+/).length;
  const estimated_minutes = Math.max(3, Math.ceil(wordCount / 180));
  
  // Dynamic tags based on keyword matching
  const contextLower = context_md.toLowerCase();
  if (contextLower.includes('prompt') || contextLower.includes('injection') || contextLower.includes('jailbreak')) {
    tags.push('prompt-engineering');
  }
  if (contextLower.includes('security') || contextLower.includes('defense') || contextLower.includes('vuln')) {
    tags.push('security-ops');
  }
  if (contextLower.includes('agent') || contextLower.includes('orchestrat') || contextLower.includes('webhook')) {
    tags.push('ai-integration');
  }

  return {
    title,
    slug,
    hook,
    objective,
    context_md,
    practice_md,
    practice_starter,
    reflect_question: reflectQuestion,
    estimated_minutes,
    tags
  };
}

/**
 * Ingestion fallback template for creating high-fidelity complete modules
 */
export const DEFAULT_COMPILER_MARKDOWN = `# Orchestrating Decoupled Multi-Agent Systems
> Hook: Decoupling agents via secure message grids prevents memory starvation and build locking in high-throughput applications.
> Objective: By the end of this module, you will configure HMAC signatures and design asynchronous worker handoffs.

Autonomous execution networks require absolute isolation between the orchestrator thread and individual executor loops. Running commands directly within synchronous webhooks causes request timeouts, database deadlocks, and severe memory spikes when scaling to parallel execution streams.

To resolve these failure modes:
1. **Asynchronous Dispatch**: The primary orchestrator receives requests, validates HMAC signatures, logs a pending job ID in the database, and immediately responds with HTTP 202.
2. **Worker Isolation**: A detached background worker polls the database (or consumes an event queue message) to spin up isolated container nodes.
3. **Realtime Channels**: Execution updates are pushed back via Supabase Realtime or secure callback endpoints.

## Practice Challenge
Write an Express middleware to securely verify webhook signatures using crypto HMAC verification before executing agent scripts.

\`\`\`javascript
const crypto = require('crypto');

function verifyWebhook(req, res, next) {
  const signature = req.headers['x-hub-signature-256'];
  const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
  
  if (signature === digest) {
    return next();
  }
  res.status(401).send('Unauthorized Signature');
}
\`\`\`

? Reflect: How do you secure database records when multi-tenant agents require selective access to user secrets?`;
