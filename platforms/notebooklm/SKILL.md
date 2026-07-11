---
name: notebooklm
description: NotebookLM - source-grounded AI. Research with your own documents. Audio overviews.
last_updated: 2026-03
owner: Frank
---

# NotebookLM

AI that only uses your sources. No hallucination on your documents.

> **See also:** `platforms/gemini-gems/SKILL.md`, `platforms/google-ai-studio/SKILL.md`

---

## Context Questions

Before using NotebookLM, ask:

1. **What sources do you have?** — PDFs, docs, web pages, videos
2. **What's the goal?** — Synthesis, learning, research, review
3. **Need audio summary?** — Generate Audio Overview
4. **Collaborative?** — Sharing with team
5. **What questions?** — Cross-document comparisons, specific queries

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Sources** | Single doc ←→ 50 sources |
| **Use** | Quick questions ←→ Deep synthesis |
| **Output** | Text Q&A ←→ Audio Overview |
| **Sharing** | Private ←→ Team collaboration |
| **Depth** | FAQ ←→ Full research |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Multiple papers | Cross-document synthesis |
| Legal/contract review | Extract obligations + terms |
| Learning new topic | Generate Audio Overview |
| Meeting prep | Summarize past notes |
| Web sources | Download as PDF first |
| Need citations | Ask for page numbers |

---

## TL;DR

| What | Details |
|------|---------|
| **What It Is** | Google's source-grounded AI research tool |
| **Key Feature** | Only references YOUR uploaded sources |
| **Audio Overviews** | AI-generated podcast from your sources |
| **Best For** | Research, learning, document synthesis |
| **Limitation** | No web search mid-conversation

---

## 1. What Makes NotebookLM Different

### Traditional AI
```
You: "What does the contract say about termination?"
AI: *generates answer from training data, may hallucinate*
```

### NotebookLM
```
You: Upload contract.pdf
You: "What does the contract say about termination?"
AI: *quotes exact sections from YOUR contract with citations*
```

**The difference:** NotebookLM only uses what you give it.

---

## 2. Source Types

### Supported

| Source Type | Notes |
|-------------|-------|
| **PDF** | Up to 500,000 words per source |
| **Google Docs** | Direct integration |
| **Google Slides** | Presentation content |
| **Web URLs** | Public pages only |
| **YouTube videos** | With transcripts |
| **Text files** | .txt format |
| **Audio files** | Transcribed automatically |

### Limits
- Up to 50 sources per notebook
- 500,000 words per source
- 25M total words per notebook

---

## 3. Core Features

### Source Grounding

Every response cites its source:
```
According to [Source 1], the contract allows 
termination with 30 days notice (page 4, section 2.1).
```

Click citations to see exact quote.

### Audio Overviews

Generate a podcast-style summary:
1. Upload sources
2. Click "Generate Audio Overview"
3. AI creates 10-15 min "podcast"
4. Two AI hosts discuss your content

**Use cases:**
- Learn while commuting
- Quick review of long documents
- Share summarized content with team

### Notes & Guides

- **Notes:** Your annotations on sources
- **Study Guides:** Auto-generated summaries
- **FAQ:** Auto-generated Q&A from sources
- **Timeline:** Chronological events (if applicable)

---

## 4. Research Workflows

### Document Synthesis

```
1. Upload: Multiple research papers on same topic
2. Ask: "What are the common findings across all sources?"
3. Get: Synthesized answer with citations to each paper
```

### Contract/Legal Review

```
1. Upload: Contract(s)
2. Ask: "What are the key obligations?"
3. Ask: "What are the termination clauses?"
4. Ask: "Compare terms across contracts"
```

### Learning New Topic

```
1. Upload: Textbook, articles, videos on topic
2. Generate: Study guide
3. Generate: Audio overview
4. Ask: Specific questions as you learn
```

### Meeting Prep

```
1. Upload: Previous meeting notes, relevant docs
2. Ask: "Summarize key decisions from past meetings"
3. Ask: "What open items need follow-up?"
```

---

## 5. Prompting Tips

### Effective Prompts

```
✅ Good:
"According to [source name], what does the author say about X?"
"Compare how Source A and Source B approach X"
"Create a bulleted summary of the main arguments"
"What evidence supports claim X in these sources?"

❌ Less Effective:
"Tell me about X" (too vague)
"What's the latest news on X?" (can't search web)
"Is this a good idea?" (opinion, not in sources)
```

### Getting Better Answers

| Tip | Example |
|-----|---------|
| Reference specific source | "In the Q2 report..." |
| Ask for citations | "With page numbers..." |
| Compare sources | "How do these differ on..." |
| Request format | "As a table..." |

---

## 6. Limitations

### Can't Do

| Limitation | Workaround |
|------------|------------|
| **No web search** | Use Perplexity first, then upload findings |
| **No image analysis** | Extract text manually |
| **No real-time data** | Upload current documents |
| **Private/paywalled URLs** | Upload PDF instead |
| **Edit sources** | Re-upload corrected version |

### What It Won't Do
- Generate content not grounded in sources
- Search the web during conversation
- Remember previous notebooks
- Process images or charts (text only)

---

## 7. Integration with Content Workflow

### Research → Content Pipeline

```
1. PERPLEXITY: Web research, find sources
   → Download/save as PDFs

2. NOTEBOOKLM: Deep synthesis
   → Upload PDFs to NotebookLM
   → Generate summaries, find quotes
   → Create Audio Overview for yourself

3. WRITING: Use insights
   → Reference NotebookLM findings
   → Cite sources properly
```

### Why This Combo Works

| Tool | Role |
|------|------|
| **Perplexity** | Find sources, web research |
| **NotebookLM** | Deep dive on sources, synthesis |
| **Writing tool** | Draft content with insights |

---

## 8. Sharing & Collaboration

### Options
- **Private** — Only you
- **View only** — Others can read
- **Edit access** — Others can add sources/notes

### Team Use Cases
- Shared research repository
- Collaborative document review
- Team learning on new topic

---

## Checklist

- [ ] Identified sources to upload
- [ ] Organized sources by topic
- [ ] Uploaded to NotebookLM
- [ ] Generated Audio Overview (if helpful)
- [ ] Asked key research questions
- [ ] Saved important citations
- [ ] Exported findings for writing

---

## Related Skills

- [Topic Research](/content/topic-research/SKILL.md) — Research workflow
- [Blog Writing](/content/blog/SKILL.md) — E-E-A-T compliance
- [Gemini Gems](/platforms/gemini-gems/SKILL.md) — Custom assistants
- [Google AI Studio](/agents/google-ai-studio/SKILL.md) — API access
