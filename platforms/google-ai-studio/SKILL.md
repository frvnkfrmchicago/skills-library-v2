---
name: google-ai-studio
description: Google AI Studio. Gemini models, grounding, function calling, multimodal, structured output, API integration.
last_updated: 2026-03
owner: Frank
---

# Google AI Studio

Your daily driver for AI development.

> **See also:** `platforms/antigravity/SKILL.md`, `platforms/gemini-gems/SKILL.md`

---

## Context Questions

Before using AI Studio, ask:

1. **What's the use case?** — Prototyping, production, research
2. **What model is best?** — Flash (fast), Pro (long context), Thinking (reasoning)
3. **What input type?** — Text, image, video, audio, documents
4. **Need grounding?** — Google Search for current info
5. **What output?** — Freeform, structured JSON, code execution

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Model** | Flash (speed) ←→ Pro (context) |
| **Input** | Text only ←→ Full multimodal |
| **Output** | Freeform ←→ Structured JSON |
| **Grounding** | None ←→ Google Search |
| **Use** | Prototyping ←→ Production API |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Daily prototyping | Gemini 2.0 Flash |
| Long document analysis | Gemini 1.5 Pro (2M context) |
| Complex reasoning | Gemini 2.0 Flash Thinking |
| Production at scale | Gemini 1.5 Flash (cheaper) |
| Need current info | Enable Google Search grounding |
| Need exact format | Use structured output with schema |

---

## TL;DR

| Feature | Description |
|---------|-------------|
| **Models** | Gemini 2.0 Flash, 1.5 Pro (1M context), Gemma |
| **Modes** | Freeform, Chat, Structured Output, Code Execution |
| **Grounding** | Google Search, your files |
| **Multimodal** | Images, video, audio, documents |
| **API** | Python SDK, REST, TypeScript |

---

## Part 1: Models

### Model Comparison

| Model | Context | Speed | Best For |
|-------|---------|-------|----------|
| **Gemini 2.0 Flash** | 1M | Fast | Daily use, most tasks |
| **Gemini 2.0 Flash Thinking** | 32K | Medium | Complex reasoning |
| **Gemini 1.5 Pro** | 2M | Slow | Long documents |
| **Gemini 1.5 Flash** | 1M | Fast | High volume, cheap |
| **Gemma 2** | 8K | Fast | Local, open source |
| **text-embedding-004** | — | Fast | Vector embeddings |

### When to Use Each

```
Daily prototyping         → Gemini 2.0 Flash
Analyze 500-page PDF     → Gemini 1.5 Pro (long context)
Complex math/logic       → Gemini 2.0 Flash Thinking
Production at scale      → Gemini 1.5 Flash (cheaper)
Local/privacy-sensitive  → Gemma 2
Semantic search          → text-embedding-004
```

### Model Selection in Code

```python
import google.generativeai as genai

genai.configure(api_key="YOUR_API_KEY")

# Choose model based on task
model_flash = genai.GenerativeModel('gemini-2.0-flash-exp')
model_pro = genai.GenerativeModel('gemini-1.5-pro-latest')
model_thinking = genai.GenerativeModel('gemini-2.0-flash-thinking-exp')
```

---

## Part 2: Build Modes

### 1. Freeform Prompt

Best for quick testing and iteration.

```
Prompt Box:
┌─────────────────────────────────────────────┐
│ Analyze this product review and extract:    │
│ - Sentiment (positive/negative/neutral)     │
│ - Key points                                │
│ - Suggested improvements                    │
│                                             │
│ Review: {{review_text}}                     │
└─────────────────────────────────────────────┘
```

**Variable Insertion:**
- Use `{{variable}}` syntax
- Define in "Test your prompt" panel
- Export with variables preserved

### 2. Chat Mode

Multi-turn conversations with system instructions.

```
System Instructions:
┌─────────────────────────────────────────────┐
│ You are a senior software engineer.         │
│ - Answer questions about code               │
│ - Suggest best practices                    │
│ - Be concise but thorough                   │
└─────────────────────────────────────────────┘

User: How should I structure a Next.js project?
Model: [Responds with context of system prompt]
User: What about API routes?
Model: [Maintains conversation context]
```

### 3. Structured Output

Force JSON schema compliance.

```python
import google.generativeai as genai
from google.generativeai.types import GenerationConfig

model = genai.GenerativeModel('gemini-2.0-flash-exp')

schema = {
    "type": "object",
    "properties": {
        "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]},
        "score": {"type": "number", "minimum": 0, "maximum": 1},
        "keywords": {"type": "array", "items": {"type": "string"}}
    },
    "required": ["sentiment", "score", "keywords"]
}

response = model.generate_content(
    "Analyze: 'This product is amazing!'",
    generation_config=GenerationConfig(
        response_mime_type="application/json",
        response_schema=schema
    )
)

data = json.loads(response.text)
# {"sentiment": "positive", "score": 0.95, "keywords": ["amazing", "product"]}
```

### 4. Code Execution

Python sandbox for data analysis.

```python
model = genai.GenerativeModel(
    'gemini-2.0-flash-exp',
    tools='code_execution'
)

response = model.generate_content("""
Analyze this data and create a visualization:
- Q1: $125,000
- Q2: $150,000
- Q3: $180,000
- Q4: $210,000

Calculate growth rates and plot the trend.
""")

# Gemini will:
# 1. Write Python code
# 2. Execute it in sandbox
# 3. Return results + visualization
```

---

## Part 3: System Instructions

### Effective Patterns

```markdown
# Persona + Constraints
You are [role]. Your expertise is [domain].

## Rules
- [Behavior 1]
- [Behavior 2]
- [What NOT to do]

## Output Format
[How to structure responses]

## Context
[Background information]
```

### Examples

#### Code Assistant

```
You are a senior TypeScript developer specializing in Next.js 16.1.1 

Rules:
- Use App Router patterns only
- Prefer Server Components
- Use 'use client' only when necessary
- Include error handling
- Add brief comments for non-obvious code

Output Format:
- Start with a brief explanation (1-2 sentences)
- Provide the code
- End with usage example if applicable
```

#### Data Analyst

```
You are a data analyst. You help interpret data and create visualizations.

Rules:
- Always verify data quality before analysis
- State assumptions clearly
- Provide confidence levels when making inferences
- Use appropriate chart types

Output Format:
- Summary of findings (bullet points)
- Supporting data/visualizations
- Recommendations
```

### Safety Settings

```python
from google.generativeai.types import HarmCategory, HarmBlockThreshold

model = genai.GenerativeModel(
    'gemini-2.0-flash-exp',
    safety_settings={
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    }
)
```

---

## Part 4: Grounding

### Google Search Grounding

```python
from google.generativeai.types import Tool

model = genai.GenerativeModel(
    'gemini-2.0-flash-exp',
    tools=[Tool.from_google_search_retrieval()]
)

response = model.generate_content(
    "What are the latest developments in AI regulation in 2025?"
)

# Response includes:
# - Answer grounded in search results
# - Source citations
# - More accurate/current information
```

**When to Enable:**
- Current events
- Factual verification
- Research tasks
- News-dependent questions

**When to Disable:**
- Creative writing
- Code generation
- Personal preference questions
- Speed-critical tasks

### Your Data Grounding (Files)

```python
# Upload files for context
file = genai.upload_file("report.pdf")

model = genai.GenerativeModel('gemini-1.5-pro-latest')

response = model.generate_content([
    file,
    "Summarize the key findings and recommendations from this report."
])
```

**Supported Formats:**
- PDF, DOCX, TXT
- Images (PNG, JPG, GIF, WebP)
- Video (MP4, MOV)
- Audio (MP3, WAV)
- Code files

---

## Part 5: API Integration

### Python SDK

```bash
pip install google-generativeai
```

```python
import google.generativeai as genai

genai.configure(api_key="YOUR_API_KEY")

model = genai.GenerativeModel('gemini-2.0-flash-exp')

# Simple generation
response = model.generate_content("Explain quantum computing")
print(response.text)

# With configuration
response = model.generate_content(
    "Write a poem",
    generation_config=genai.GenerationConfig(
        temperature=0.9,
        max_output_tokens=500,
        top_p=0.95,
    )
)
```

### Streaming

```python
# Real-time token output
response = model.generate_content(
    "Write a long story",
    stream=True
)

for chunk in response:
    print(chunk.text, end="", flush=True)
```

### Async

```python
import asyncio

async def generate():
    response = await model.generate_content_async(
        "Explain machine learning"
    )
    return response.text

result = asyncio.run(generate())
```

### TypeScript/JavaScript

```bash
npm install @google/generative-ai
```

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

// Generate
const result = await model.generateContent('Hello');
console.log(result.response.text());

// Stream
const streamResult = await model.generateContentStream('Write a story');
for await (const chunk of streamResult.stream) {
  process.stdout.write(chunk.text());
}

// Chat
const chat = model.startChat({
  history: [
    { role: 'user', parts: [{ text: 'Hello' }] },
    { role: 'model', parts: [{ text: 'Hi! How can I help?' }] },
  ],
});

const chatResult = await chat.sendMessage('What can you do?');
console.log(chatResult.response.text());
```

### REST API

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{"text": "Explain AI"}]
    }]
  }'
```

---

## Part 6: Function Calling

### Define Tools

```python
def get_weather(location: str, unit: str = "celsius") -> dict:
    """Get weather for a location."""
    # Actual implementation
    return {"temperature": 22, "condition": "sunny"}

def search_products(query: str, max_results: int = 5) -> list:
    """Search product catalog."""
    return [{"name": "Product A", "price": 29.99}]

model = genai.GenerativeModel(
    'gemini-2.0-flash-exp',
    tools=[get_weather, search_products]
)
```

### Automatic Tool Declaration

```python
from google.generativeai.types import FunctionDeclaration, Tool

get_weather_func = FunctionDeclaration(
    name="get_weather",
    description="Get current weather for a location",
    parameters={
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "City name"
            },
            "unit": {
                "type": "string",
                "enum": ["celsius", "fahrenheit"]
            }
        },
        "required": ["location"]
    }
)

weather_tool = Tool(function_declarations=[get_weather_func])
model = genai.GenerativeModel('gemini-2.0-flash-exp', tools=[weather_tool])
```

### Handle Tool Calls

```python
response = model.generate_content("What's the weather in Tokyo?")

# Check for function call
for part in response.parts:
    if fn := part.function_call:
        # Execute the function
        result = get_weather(**dict(fn.args))
        
        # Send result back
        response = model.generate_content([
            "What's the weather in Tokyo?",
            response.candidates[0].content,
            genai.protos.Content(
                parts=[genai.protos.Part(
                    function_response=genai.protos.FunctionResponse(
                        name=fn.name,
                        response={"result": result}
                    )
                )]
            )
        ])
```

### Multi-Tool Orchestration

```python
tools = [
    get_weather,
    search_products,
    book_appointment,
    send_email,
]

model = genai.GenerativeModel('gemini-2.0-flash-exp', tools=tools)

# Model can call multiple tools in sequence
response = model.generate_content(
    "Check the weather in SF, find umbrella products if rainy, and email me the results"
)
```

---

## Part 7: Multimodal

### Image Analysis

```python
import PIL.Image

image = PIL.Image.open('photo.jpg')

response = model.generate_content([
    "Describe this image in detail",
    image
])
```

### Video Understanding

```python
video_file = genai.upload_file("video.mp4")

# Wait for processing
while video_file.state.name == "PROCESSING":
    time.sleep(2)
    video_file = genai.get_file(video_file.name)

response = model.generate_content([
    video_file,
    "Summarize what happens in this video"
])
```

### Audio Transcription

```python
audio_file = genai.upload_file("audio.mp3")

response = model.generate_content([
    audio_file,
    "Transcribe this audio and identify speakers"
])
```

### Document Analysis

```python
pdf_file = genai.upload_file("document.pdf")

response = model.generate_content([
    pdf_file,
    """Extract:
    1. Key dates and deadlines
    2. Financial figures
    3. Action items
    Return as JSON."""
])
```

### File Limits

| Type | Max Size | Duration Limit |
|------|----------|----------------|
| Image | 20MB | — |
| Video | 2GB | 1 hour |
| Audio | 40MB | 9.5 hours |
| PDF | 300 pages | — |

---

## Part 8: Context Caching

### What Is It?

Cache large prompts/files to reduce latency and cost on repeated use.

### When to Use

- Same system prompt across many requests
- Large reference documents used repeatedly
- Reducing latency for production apps

### Implementation

```python
from google.generativeai import caching

# Create cache
cache = caching.CachedContent.create(
    model='models/gemini-1.5-flash-001',
    contents=[
        genai.upload_file("large_reference.pdf"),
        "You are an expert on this document. Answer questions about it."
    ],
    ttl=datetime.timedelta(hours=2),
    display_name="Reference Doc Cache"
)

# Use cached model
cached_model = genai.GenerativeModel.from_cached_content(cache)

# Subsequent requests are faster and cheaper
response = cached_model.generate_content("What does section 5 say?")
```

### Cost Savings

| Without Cache | With Cache |
|---------------|------------|
| Full context tokensevery request | Reduced input tokens |
| Higher latency | Lower latency |
| Pay per token | Caching fee + reduced tokens |

---

## Part 9: Safety Settings

### Harm Categories

| Category | What It Catches |
|----------|-----------------|
| `HARM_CATEGORY_HATE_SPEECH` | Hate, discrimination |
| `HARM_CATEGORY_HARASSMENT` | Bullying, threats |
| `HARM_CATEGORY_SEXUALLY_EXPLICIT` | Adult content |
| `HARM_CATEGORY_DANGEROUS_CONTENT` | Violence, self-harm |

### Threshold Levels

| Level | Behavior |
|-------|----------|
| `BLOCK_NONE` | Never block |
| `BLOCK_LOW_AND_ABOVE` | Block most content |
| `BLOCK_MEDIUM_AND_ABOVE` | Balanced (default) |
| `BLOCK_ONLY_HIGH` | Only block extreme |

### Production Settings

```python
# Strict (consumer app)
safety_strict = {
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
}

# Relaxed (internal tool)
safety_relaxed = {
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
}
```

---

## Part 10: Comparison

| Feature | Google AI Studio | OpenAI | Claude | AWS Bedrock |
|---------|-----------------|--------|--------|-------------|
| **Top Model** | Gemini 2.0 Flash | GPT-4o | Claude 3.5 Sonnet | Various |
| **Context** | 2M tokens | 128K | 200K | Varies |
| **Free Tier** | Generous | Limited | None | None |
| **Grounding** | Google Search | No | No | No |
| **Code Execution** | Yes | Code Interpreter | No | No |
| **Multimodal** | Image/Video/Audio | Image/Audio | Image | Varies |
| **Pricing** | Low | Medium | High | Medium |

### When to Use Google AI Studio

- Long context needs (1M+ tokens)
- Multimodal (especially video)
- Cost-sensitive projects
- Google Search grounding
- Python data analysis

### When to Use Others

- GPT-4o: Best for function calling complexity
- Claude: Best for writing quality
- Bedrock: AWS-native, compliance needs

---

## Part 11: Build Templates

### 1. Chatbot App

```python
import streamlit as st

model = genai.GenerativeModel(
    'gemini-2.0-flash-exp',
    system_instruction="You are a helpful assistant."
)
chat = model.start_chat()

for msg in st.session_state.get("messages", []):
    st.chat_message(msg["role"]).write(msg["content"])

if prompt := st.chat_input():
    st.session_state.messages.append({"role": "user", "content": prompt})
    st.chat_message("user").write(prompt)
    
    response = chat.send_message(prompt)
    st.session_state.messages.append({"role": "assistant", "content": response.text})
    st.chat_message("assistant").write(response.text)
```

### 2. Document Q&A

```python
def create_doc_qa(file_path: str):
    doc = genai.upload_file(file_path)
    model = genai.GenerativeModel('gemini-1.5-pro-latest')
    
    def ask(question: str) -> str:
        response = model.generate_content([doc, question])
        return response.text
    
    return ask

qa = create_doc_qa("report.pdf")
answer = qa("What are the key recommendations?")
```

### 3. Data Extraction Pipeline

```python
def extract_data(text: str, schema: dict) -> dict:
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    response = model.generate_content(
        f"Extract data from this text according to the schema:\n\n{text}",
        generation_config=GenerationConfig(
            response_mime_type="application/json",
            response_schema=schema
        )
    )
    
    return json.loads(response.text)
```

---

## Part 12: Best Practices

### Prompt Engineering for Gemini

1. **Be specific** — Gemini follows instructions closely
2. **Use examples** — Few-shot works well
3. **Structure output** — Use JSON mode when possible
4. **Iterate in Studio** — Test before coding

### Token Optimization

```python
# Count tokens before sending
model.count_tokens("Your prompt here")

# Use efficient prompts
prompt = """
Task: Summarize
Input: {text}
Output: JSON with title, points, conclusion
"""  # Better than verbose instructions
```

### Cost Management

```python
# Use Flash for high volume
model_cheap = genai.GenerativeModel('gemini-1.5-flash-latest')

# Use Pro only when needed
model_quality = genai.GenerativeModel('gemini-1.5-pro-latest')

# Cache for repeated large contexts
cache = caching.CachedContent.create(...)
```

### Rate Limiting

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=60)
)
def generate_with_retry(prompt: str):
    return model.generate_content(prompt)
```

---

## Part 13: Limitations

### What Gemini Can't Do

- Real-time information (without grounding)
- Execute arbitrary system code
- Access the internet (except grounding)
- Remember across sessions (by default)

### Known Issues

| Issue | Workaround |
|-------|------------|
| Hallucinations | Use grounding, verify facts |
| Refusals | Adjust safety settings |
| Format inconsistency | Use structured output |
| Long output truncation | Set max_output_tokens |

### When to Use Other Models

| Need | Better Choice |
|------|---------------|
| Coding with tools | GPT-4o |
| Long-form writing | Claude |
| Image generation | ChatGPT Images 2.0, Midjourney |
| Real-time voice | OpenAI Realtime |

---

## Checklist

Before production:

- [ ] API key secured (not in code)
- [ ] Rate limiting implemented
- [ ] Error handling for blocked content
- [ ] Safety settings appropriate for use case
- [ ] Caching for repeated contexts
- [ ] Streaming for long responses
- [ ] Fallback model configured
- [ ] Usage monitoring in place

---

## Resources

### Official Documentation (Source of Truth)

**Core:**
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs) — Main documentation
- [Google AI Studio](https://aistudio.google.com) — Web interface
- [API Quickstart](https://ai.google.dev/gemini-api/docs/get-started/tutorial)

**Models:**
- [Model Overview](https://ai.google.dev/gemini-api/docs/models) — All available models
- [Gemini 3 Pro/Flash](https://ai.google.dev/gemini-api/docs/models#gemini-3-pro) — Latest frontier models
- [Gemini 2.5 Pro/Flash](https://ai.google.dev/gemini-api/docs/models/gemini)

**Capabilities:**
- [Image Generation (Nano Banana)](https://ai.google.dev/gemini-api/docs/image-generation) — Native image gen
- [Video Generation (Veo 3.1)](https://ai.google.dev/gemini-api/docs/video)
- [Function Calling](https://ai.google.dev/gemini-api/docs/function-calling) — Tools and agents
- [Live API](https://ai.google.dev/gemini-api/docs/live) — Real-time voice agents
- [Long Context](https://ai.google.dev/gemini-api/docs/long-context) — 1M+ tokens
- [Thinking Models](https://ai.google.dev/gemini-api/docs/thinking) — Reasoning
- [Structured Output](https://ai.google.dev/gemini-api/docs/structured-output) — JSON schemas
- [Document Processing](https://ai.google.dev/gemini-api/docs/document-processing)

**Development:**
- [Python SDK Reference](https://ai.google.dev/api/python/google/generativeai)
- [JavaScript SDK](https://ai.google.dev/gemini-api/docs/sdks)
- [REST API](https://ai.google.dev/api/rest)
- [Cookbook (Examples)](https://github.com/google-gemini/cookbook)

**Limits & Pricing:**
- [Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- [Pricing](https://ai.google.dev/pricing)

---

## Related Skills

- `langchain/SKILL.md` — LangChain with Gemini
- `ai-sdk/SKILL.md` — Vercel AI SDK integration
- `antigravity/SKILL.md` — Antigravity IDE patterns
