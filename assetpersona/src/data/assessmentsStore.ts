export interface AssessmentQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Assessment {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timePerQuestionSeconds: number;
  xpReward: number;
  questionsCount: number;
  questions: AssessmentQuestion[];
}

export interface AssessmentResult {
  id: string;
  userId: string;
  assessmentId: string;
  score: number; // percentage (e.g. 85)
  totalQuestions: number;
  correctAnswers: number;
  skippedAnswers: number;
  completedAt: string;
}

export const assessmentsData: Assessment[] = [
  {
    id: 'ai-eng-core',
    title: 'Core AI Engineering & LLM Foundations',
    slug: 'core-ai-engineering',
    description: 'Measure your knowledge of LLM parameters, tokenization, context windows, and foundational transformer architecture concepts.',
    difficulty: 'intermediate',
    timePerQuestionSeconds: 20,
    xpReward: 300,
    questionsCount: 5,
    questions: [
      {
        id: 'q1',
        text: 'Which parameter directly controls the diversity or randomness of an LLM\'s token completions by scaling the logits before softmax?',
        options: ['Top-P (Nucleus)', 'Top-K', 'Temperature', 'Frequency Penalty'],
        correctIndex: 2,
        explanation: 'Temperature is a scaling factor applied to the raw logit outputs of the transformer before the softmax activation function. Lowering temperature concentrates probability on the most likely tokens, whereas raising it flattens the distribution and increases randomness.'
      },
      {
        id: 'q2',
        text: 'What is the main limitation of standard transformer-based attention models when processing extremely long inputs?',
        options: [
          'Attention complexity scales quadratically O(N^2) with context length',
          'Token embedding dimensions grow exponentially',
          'GPU memory consumption decreases too rapidly',
          'Positional encodings fail to register long inputs altogether'
        ],
        correctIndex: 0,
        explanation: 'Standard self-attention requires computing all pairwise scores between input tokens, giving it a quadratic time and memory complexity of O(N^2) relative to sequence length N.'
      },
      {
        id: 'q3',
        text: 'If a tokenizer splits the word "Antigravity" into ["Anti", "grav", "ity"], how does the LLM represent these elements internally?',
        options: [
          'As literal raw ASCII characters',
          'As discrete token IDs mapped to dense floating-point vector embeddings',
          'As binary string fragments in standard UTF-8 format',
          'As individual neurons in the output classifier layer'
        ],
        correctIndex: 1,
        explanation: 'Tokenizers convert text into integer token IDs from a fixed vocabulary. The model\'s embedding layer then maps each token ID to a dense vector (embedding) of real numbers.'
      },
      {
        id: 'q4',
        text: 'Which technique is primarily used to reduce token consumption when feeding massive documents into a limited LLM context window?',
        options: [
          'Increasing model temperature',
          'Finetuning the model with LoRA',
          'Recursive summarization and chunking',
          'Using raw byte-pair encoders directly'
        ],
        correctIndex: 2,
        explanation: 'Recursive summarization and chunking partition a massive document into smaller chunks, summarize them individually, and feed only the relevant summaries or chunks to the model, respecting the context window limit.'
      },
      {
        id: 'q5',
        text: 'What happens to the model outputs when the "Top-P" (Nucleus Sampling) parameter is set to a very low value like 0.10?',
        options: [
          'The model samples from only the top 10% most likely tokens in the cumulative distribution',
          'The model selects from the top 10 highest value tokens only, regardless of probability',
          'The model increases its penalty for repeating tokens by 10%',
          'The model shuts down random sampling and uses purely greedy decoding'
        ],
        correctIndex: 0,
        explanation: 'Top-P (Nucleus Sampling) restricts the pool of tokens to sample from to the smallest set whose cumulative probability exceeds the threshold P. Setting it to 0.10 filters out the bottom 90% of the distribution.'
      }
    ]
  },
  {
    id: 'prompt-arch',
    title: 'Advanced Prompt Architecture & Agentics',
    slug: 'prompt-architecture',
    description: 'Validate expertise in advanced prompting strategies, multi-step agent planning, ReAct loops, and securing prompts against injection.',
    difficulty: 'advanced',
    timePerQuestionSeconds: 20,
    xpReward: 400,
    questionsCount: 5,
    questions: [
      {
        id: 'pa1',
        text: 'In the ReAct (Reasoning and Acting) prompting framework, what sequence of behaviors does the model cycle through to solve tasks?',
        options: [
          'Act -> Verify -> Re-prompt',
          'Thought -> Action -> Observation',
          'Prompt -> Embed -> Vector Query',
          'Few-Shot -> Zero-Shot -> CoT'
        ],
        correctIndex: 1,
        explanation: 'ReAct couples reasoning and acting by prompting the LLM to generate alternating steps of Thought (reflecting on what to do), Action (invoking external tools), and Observation (examining tool results).'
      },
      {
        id: 'pa2',
        text: 'What is the primary benefit of Chain-of-Thought (CoT) prompting for complex logical reasoning tasks?',
        options: [
          'It reduces the absolute number of output tokens generated',
          'It allows the model to allocate computational steps to intermediate reasoning before outputting final answers',
          'It completely prevents prompt injections',
          'It bypasses tokenization steps entirely'
        ],
        correctIndex: 1,
        explanation: 'Chain-of-Thought prompts the model to write out its step-by-step reasoning. Because transformers process tokens sequentially, this allows the model to compute intermediate states on the context history before producing the final answer.'
      },
      {
        id: 'pa3',
        text: 'Which prompt injection attack vector occurs when an LLM consumes untrusted external data (like web content or PDF documents) containing hidden instructions?',
        options: [
          'Direct Jailbreak',
          'Reflected Injection',
          'Indirect Prompt Injection',
          'Denial of Service (DoS)'
        ],
        correctIndex: 2,
        explanation: 'Indirect prompt injection occurs when the LLM reads external resource data (e.g. email, web page, file) containing malicious prompts that hijack the model\'s instruction set, rather than the user inputting the prompt directly.'
      },
      {
        id: 'pa4',
        text: 'What does "Few-Shot Prompting" supply to an LLM to align its format and style without updating model weights?',
        options: [
          'Multiple LoRA weight adaptors',
          'A set of input-output examples directly in the context prompt',
          'A custom dictionary for token replacement',
          'A high learning-rate training batch'
        ],
        correctIndex: 1,
        explanation: 'Few-shot prompting provides the model with a few demonstration pairs (input and target output) within the prompt text to guide output formatting and style by in-context learning.'
      },
      {
        id: 'pa5',
        text: 'What is "Prompt Leakage" in the context of LLM application security?',
        options: [
          'The unauthorized leakage of LLM training data into public databases',
          'When a user tricks the system into outputting its original system prompts or developer instructions',
          'The failure of API keys causing server logs to leak',
          'An attack that slows down token generation to freeze the host API'
        ],
        correctIndex: 1,
        explanation: 'Prompt leakage is a specific type of prompt injection where the attacker prompts the LLM to reveal its internal developer instructions, system personas, or safety guidelines.'
      }
    ]
  },
  {
    id: 'rag-spec',
    title: 'Retrieval-Augmented Generation (RAG) Specialist',
    slug: 'rag-specialist',
    description: 'Test your understanding of indexing pipelines, semantic similarity math, hybrid retrieval, and vector storage optimization.',
    difficulty: 'advanced',
    timePerQuestionSeconds: 20,
    xpReward: 500,
    questionsCount: 5,
    questions: [
      {
        id: 'r1',
        text: 'When calculating similarity in vector databases, which mathematical formula is most commonly used for normalized embeddings?',
        options: ['Euclidean Distance', 'Cosine Similarity', 'Manhattan Distance', 'Hamming Distance'],
        correctIndex: 1,
        explanation: 'Cosine similarity measures the cosine of the angle between two multi-dimensional vectors, evaluating their directional alignment rather than magnitude. For normalized vectors, this is equivalent to the dot product.'
      },
      {
        id: 'r2',
        text: 'What does "Hybrid Search" combine in modern RAG systems to improve retrieval accuracy?',
        options: [
          'Dense vector retrieval (semantic) and sparse keyword retrieval (BM25)',
          'SQL queries and NoSQL queries',
          'Local files and global internet searches',
          'Fine-tuning and prompt engineering'
        ],
        correctIndex: 0,
        explanation: 'Hybrid search combines lexical keyword search (e.g. BM25) for precise exact-match terms with dense vector search (embeddings) to capture semantic meanings and synonyms.'
      },
      {
        id: 'r3',
        text: 'What is the main purpose of a "Re-ranker" model in a retrieval pipeline?',
        options: [
          'To assign points to users completing exercises',
          'To evaluate and re-order the top retrieved documents using a more computationally expensive cross-attention model',
          'To count how many documents are indexed in a vector DB',
          'To generate the final response to send to the user'
        ],
        correctIndex: 1,
        explanation: 'A re-ranker acts as a second-stage filter. It takes the top candidates retrieved by fast approximate vector searches and computes a precise query-document relevance score using a deep cross-encoder model.'
      },
      {
        id: 'r4',
        text: 'In document chunking for RAG, why is a "chunk overlap" parameter typically configured?',
        options: [
          'To save storage space in the vector index',
          'To ensure that semantic context at chunk boundaries isn\'t severed or lost',
          'To compress the size of embedding vectors by 50%',
          'To prevent duplicate entries from being written'
        ],
        correctIndex: 1,
        explanation: 'Chunk overlap maintains continuity of context. By duplicating a small set of words or sentences across consecutive chunks, keywords or thoughts that span boundaries remain accessible to both vectors.'
      },
      {
        id: 'r5',
        text: 'What is the primary cause of "Hallucination" in RAG pipelines if retrieval succeeds?',
        options: [
          'The model context window was completely empty',
          'The generator LLM ignores retrieved context, or relies on pre-trained knowledge to fill in gaps, or conflates details',
          'The embedding model vector dimensions were too low',
          'The database index was corrupted'
        ],
        correctIndex: 1,
        explanation: 'Hallucination occurs when the model generates false information. Even when retrieval succeeds, the generator model can fabricate facts if the prompt doesn\'t constrain it, if the context is contradictory, or if it prioritizes its pre-trained weights.'
      }
    ]
  }
];

export async function getAssessments(): Promise<Assessment[]> {
  return assessmentsData;
}

export async function getAssessmentBySlug(slug: string): Promise<Assessment | undefined> {
  return assessmentsData.find((a) => a.slug === slug);
}

export async function getAssessmentResults(userId: string): Promise<AssessmentResult[]> {
  const dataStr = localStorage.getItem(`ap_assessment_results_${userId}`);
  if (!dataStr) return [];
  try {
    return JSON.parse(dataStr);
  } catch (_) {
    return [];
  }
}

export async function checkCooldown(userId: string, assessmentId: string): Promise<{ onCooldown: boolean; remainingDays: number }> {
  const results = await getAssessmentResults(userId);
  const matched = results
    .filter((r) => r.assessmentId === assessmentId)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  if (matched.length === 0) {
    return { onCooldown: false, remainingDays: 0 };
  }

  const lastSubmit = new Date(matched[0].completedAt).getTime();
  const cooldownDuration = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
  const now = Date.now();
  const timePassed = now - lastSubmit;

  if (timePassed < cooldownDuration) {
    const remainingMs = cooldownDuration - timePassed;
    const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
    return { onCooldown: true, remainingDays };
  }

  return { onCooldown: false, remainingDays: 0 };
}

export async function saveAssessmentResult(
  userId: string,
  assessmentId: string,
  correctCount: number,
  skippedCount: number,
  totalQuestions: number
): Promise<AssessmentResult> {
  const score = Math.round((correctCount / totalQuestions) * 100);
  const results = await getAssessmentResults(userId);

  const newResult: AssessmentResult = {
    id: `res-${Math.random().toString(36).substring(2, 9)}`,
    userId,
    assessmentId,
    score,
    totalQuestions,
    correctAnswers: correctCount,
    skippedAnswers: skippedCount,
    completedAt: new Date().toISOString()
  };

  results.push(newResult);
  localStorage.setItem(`ap_assessment_results_${userId}`, JSON.stringify(results));

  // Award XP to user if score is high enough (e.g. >= 60%)
  const assessment = assessmentsData.find((a) => a.id === assessmentId);
  if (assessment && score >= 60) {
    const awardedXp = Math.round((score / 100) * assessment.xpReward);
    // Fetch and update user's profile XP in localStorage
    const localProfile = localStorage.getItem('ap_user_profile');
    if (localProfile) {
      try {
        const parsed = JSON.parse(localProfile);
        parsed.xp = (parsed.xp || 0) + awardedXp;
        // recalculate level
        parsed.level = Math.floor(Math.sqrt(parsed.xp / 100)) + 1;
        localStorage.setItem('ap_user_profile', JSON.stringify(parsed));
      } catch (_) {}
    }
  }

  return newResult;
}
