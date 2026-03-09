# Agent 6 Handoff — Google AI Studio (EXPANSIVE)

## Context

Skills Library for AI-assisted development. **This is a priority skill.** User works in this platform daily. Make it comprehensive.

**Location:** `/Users/franklawrencejr./Downloads/skills-library-v2 2/`

---

## What to Build

### `platforms/google-ai-studio/SKILL.md`

**This should be EXPANSIVE. Cover everything.**

---

## Part 1: Models

- **Gemini 2.0 Flash** — Fast, multimodal, best for most tasks
- **Gemini 1.5 Pro** — Long context (1M tokens)
- **Gemini 1.5 Flash** — Fast, cheap
- **Gemma 2** — Open source, local deployment
- **Embedding Models** — text-embedding-004
- Model comparison table with use cases

---

## Part 2: Build Modes

1. **Freeform Prompt**
   - Quick testing
   - Prompt iteration
   - Variable insertion

2. **Chat Mode**
   - Multi-turn conversations
   - System instructions
   - Context management

3. **Structured Output**
   - JSON schema enforcement
   - Type safety
   - Parsing patterns

4. **Code Execution**
   - Python sandbox
   - Data analysis
   - Visualization

---

## Part 3: System Instructions

- Persona design patterns
- Safety settings
- Output formatting rules
- Context priming
- Examples of effective system prompts

---

## Part 4: Grounding

1. **Google Search Grounding**
   - When to enable
   - Citation handling
   - Accuracy improvements

2. **Your Data Grounding**
   - File uploads
   - Context window usage
   - RAG-like patterns

---

## Part 5: API Integration

1. **REST API**
   - Authentication (API keys)
   - Endpoint structure
   - Request/response formats
   - Error handling

2. **Python SDK**
   ```python
   import google.generativeai as genai
   genai.configure(api_key="...")
   model = genai.GenerativeModel('gemini-2.0-flash')
   response = model.generate_content("Hello")
   ```

3. **Streaming**
   - Stream responses
   - Token-by-token output
   - Real-time apps

4. **TypeScript/JavaScript**
   - @google/generative-ai package
   - Node.js patterns
   - Browser usage

---

## Part 6: Function Calling

- Defining functions
- Tool use patterns
- Multi-tool orchestration
- Parallel function calls
- Error handling in tools

---

## Part 7: Multimodal

1. **Image Input**
   - Image analysis
   - OCR
   - Visual QA

2. **Video Input**
   - Video understanding
   - Frame analysis
   - Temporal reasoning

3. **Audio Input**
   - Speech transcription
   - Audio analysis

4. **File Handling**
   - Supported formats
   - Size limits
   - Best practices

---

## Part 8: Context Caching

- What is context caching
- When to use it
- Cost savings
- Implementation patterns
- TTL management

---

## Part 9: Safety Settings

- Harm categories
- Threshold levels
- Customization
- Production settings

---

## Part 10: Comparison

| Feature | Google AI Studio | OpenAI | Claude | Bedrock |
|---------|-----------------|--------|--------|---------|
| Models | Gemini | GPT-4 | Claude | Multi |
| Context | 1M tokens | 128K | 200K | Varies |
| Free Tier | Yes | Limited | No | No |
| Grounding | Yes | No | No | No |
| Code Exec | Yes | Code Interpreter | No | No |

---

## Part 11: Build Templates

1. **Chatbot App**
2. **Document Analysis Tool**
3. **Code Assistant**
4. **Data Extraction Pipeline**
5. **Multimodal Content Creator**

---

## Part 12: Best Practices

- Prompt engineering for Gemini
- Token optimization
- Cost management
- Rate limiting
- Production deployment

---

## Part 13: Limitations

- What Gemini can't do
- Known issues
- Workarounds
- When to use other models

---

## Format

YAML frontmatter:

```yaml
---
name: google-ai-studio
description: Google AI Studio. Gemini models, grounding, function calling, multimodal, API.
last_updated: 2026-03
---
```

---

## After Building (REQUIRED)

1. Add to `SKILL-NAVIGATION.md` under platforms
2. Add to `platforms/` directory overview
3. Add to `_meta/CHANGELOG.md`

---

## Completion Report

1. Path to created file
2. Confirmation navigation updated
3. Any issues
