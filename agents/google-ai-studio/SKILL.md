---
name: google-ai-studio
description: Google AI Studio features - Nano Banana Pro (image gen), Veo 3 (video), Gemini Live, and more. Use when building AI-first features with Google's tools.
---

# Google AI Studio Agent

Google's AI toolkit. Image gen, video, voice, and more.

## TL;DR - What's Available

| Feature | What It Does | When to Use |
|---------|--------------|-------------|
| **Nano Banana Pro** | Generate images from text | Product images, illustrations, assets |
| **Veo 3** | Generate video from text/image | Animations, promotional video |
| **Gemini Live API** | Real-time voice conversation | Voice assistants, conversational apps |
| **Speech Generation** | Text to speech | Read aloud, voice UX |
| **Transcription** | Speech to text | Voice input, dictation |
| **Image Analysis** | Understand images | Describe, analyze uploaded images |
| **Video Understanding** | Analyze video content | Summarize, find moments |
| **2.5 Flash-Lite** | Fast responses | Real-time, low-latency needs |
| **Thinking Mode** | Extended reasoning | Complex problems |
| **Google Search Grounding** | Real-time web data | Current info in responses |

---

## When to Use AI Studio vs Code

```
AI-FIRST APPROACH:
Start in AI Studio → Prototype → Bring code to IDE

If you're generating:
- Images → AI Studio first (Nano Banana Pro)
- Video → AI Studio first (Veo 3)
- Voice features → AI Studio first (Live API)

If you're building:
- UI/logic → IDE (Cursor, Anti-Gravity, Claude Code)
- Then call AI Studio APIs for AI features
```

---

## Nano Banana Pro (Image Generation)

### What It Is
Text-to-image generation. Describe what you want, get an image.

### How to Use (AI Studio)
1. Go to aistudio.google.com
2. Select Nano Banana Pro model
3. Enter prompt
4. Adjust aspect ratio if needed
5. Generate

### Prompting for Good Images

```
STRUCTURE:
[Subject] + [Style] + [Details] + [Mood/Lighting]

EXAMPLE:
"A glowing candle made of crystallized amber, 
photorealistic product photography, 
soft warm lighting, dark background, 
high detail macro shot"
```

### Aspect Ratios

| Ratio | Use Case |
|-------|----------|
| 1:1 | Social media, icons |
| 16:9 | Hero images, web banners |
| 9:16 | Mobile, stories, vertical video |
| 4:3 | Product photos |
| 3:2 | Photography style |

### In Code (API)

```typescript
// Using Google AI SDK
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" })

const result = await model.generateImages({
  prompt: "A glowing candle made of crystallized amber...",
  numberOfImages: 1,
  aspectRatio: "1:1",
})

// result.images[0] contains the generated image
```

---

## Veo 3 (Video Generation)

### What It Is
Generate video from text prompts or animate images.

### Use Cases
- Product animations
- Social media content
- Promotional videos
- Animated backgrounds
- Explainer visuals

### Prompting for Video

```
STRUCTURE:
[Subject] + [Action/Motion] + [Style] + [Camera movement]

EXAMPLE:
"A candle flame flickering and dancing,
close-up macro shot,
cinematic warm lighting,
slow motion, camera slowly pulling back"
```

### Text-to-Video vs Image-to-Video

| Mode | Input | Output |
|------|-------|--------|
| Text-to-Video | Text prompt | New video |
| Image-to-Video | Image + motion prompt | Image animated |

**Image-to-Video is powerful:** Generate still with Nano Banana → Animate with Veo 3

---

## Gemini Live API (Voice)

### What It Is
Real-time bidirectional voice conversation with AI.

### Use Cases
- Voice assistants in apps
- Conversational interfaces
- Accessibility features
- Hands-free interactions

### Key Features
- Low latency (real-time)
- Interruption handling
- Natural conversation flow
- Multiple voice options

---

## Speech Generation (TTS)

### What It Is
Convert text to natural-sounding speech.

### Use Cases
- Read content aloud
- Voiceover for videos
- Accessibility
- Guided experiences

---

## Transcription (STT)

### What It Is
Convert speech to text.

### Use Cases
- Voice input in forms
- Dictation
- Meeting notes
- Voice commands

---

## Image Analysis

### What It Is
Gemini can understand and describe images.

### Use Cases
- Describe uploaded images
- Extract text from images (OCR)
- Identify objects, scenes
- Answer questions about images

### In Code

```typescript
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

const result = await model.generateContent([
  "What's in this image? Describe in detail.",
  {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64ImageData
    }
  }
])
```

---

## Model Selection

| Need | Model | Why |
|------|-------|-----|
| Fast responses | Gemini 2.5 Flash-Lite | Lowest latency |
| Balanced | Gemini 2.5 Flash | Good speed + capability |
| Complex reasoning | Gemini 3 Pro | Best intelligence |
| Deep thinking | Gemini 3 Pro (Thinking) | Extended reasoning |
| Image gen | Nano Banana Pro | Best quality |
| Video gen | Veo 3 | Video generation |

---

## Workflow: AI-First Building

```
1. IDEATE in AI Studio
   - Generate images with Nano Banana
   - Test video concepts with Veo 3
   - Prototype voice interactions

2. EXTRACT what works
   - Download assets
   - Note prompts that worked
   - Identify API calls needed

3. BUILD in IDE
   - Integrate AI Studio APIs
   - Build UI around generated content
   - Connect voice/image features

4. ITERATE
   - Refine prompts
   - Regenerate assets
   - Polish integration
```

---

## Official Resources

- **AI Studio:** aistudio.google.com
- **Documentation:** ai.google.dev/docs
- **API Reference:** ai.google.dev/api
- **Pricing:** ai.google.dev/pricing

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using Vercel AI SDK for image gen | Use Google AI SDK + Nano Banana |
| Skipping AI Studio prototyping | Start in Studio, then code |
| Generic prompts | Be specific: subject + style + details |
| Wrong aspect ratio | Match your use case |
| Not saving working prompts | Document prompts that work |
