---
name: tavily
description: Tavily API for AI-powered web search. Real-time grounding, fact-checking, and research for AI agents.
last_updated: 2026-03
owner: Frank
---

# Tavily

AI-native web search API. Ground your agents in real-time information.

> **See also:** `ai-builder/langchain/SKILL.md`, `ai-builder/agentic-workflows/SKILL.md`

---

## Context Questions

Before using Tavily:

1. **What's the search use case?** — Research, fact-checking, real-time data, news
2. **What's the freshness requirement?** — Real-time, recent (days), or historical
3. **What's the integration method?** — Direct API, LangChain, LlamaIndex, CrewAI
4. **What depth of results?** — Quick answer, full search results, or both
5. **What's the volume?** — Occasional queries vs high-volume production

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Search Depth** | Basic (fast) ←→ Advanced (comprehensive) |
| **Result Type** | Answer only ←→ Full results + sources |
| **Freshness** | Any time ←→ Last 24 hours |
| **Integration** | Direct API ←→ Framework (LangChain) |
| **Volume** | Development ←→ Production scale |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Quick fact check | `search_depth: basic` + answer mode |
| Research task | `search_depth: advanced` + full results |
| Real-time data needed | Set `days` parameter to 1-7 |
| Agent tool | LangChain TavilySearchResults tool |
| News monitoring | Topic-filtered + recent dates |
| RAG grounding | Extract + include_raw_content |

---

## TL;DR

| Need | Approach |
|------|----------|
| **Quick answer** | `tavily.qna_search()` |
| **Full search** | `tavily.search(search_depth="advanced")` |
| **LangChain tool** | `TavilySearchResults` |
| **Context for RAG** | `include_raw_content=True` |
| **News only** | `topic="news"` |

---

## Part 1: Setup

### Installation

```bash
uv add tavily-python
```

### API Key

```bash
# .env
TAVILY_API_KEY=tvly-xxxxxxxxxxxxx
```

Get key: https://tavily.com

### Basic Client

```python
from tavily import TavilyClient
import os

client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
```

---

## Part 2: Search Methods

### Basic Search

```python
# Quick search
results = client.search("What is the latest iPhone model?")

# Access results
for result in results["results"]:
    print(f"Title: {result['title']}")
    print(f"URL: {result['url']}")
    print(f"Content: {result['content'][:200]}...")
```

### Advanced Search

```python
results = client.search(
    query="AI regulations 2026",
    search_depth="advanced",      # More comprehensive
    max_results=10,               # Up to 10 results
    include_domains=["gov.uk", "europa.eu"],  # Limit sources
    exclude_domains=["wikipedia.org"],        # Exclude sources
    include_answer=True,          # Get AI-generated answer
    include_raw_content=True,     # Full page content
    include_images=False,         # Skip images
    days=30,                      # Last 30 days only
)

# Get the generated answer
print(results["answer"])

# Get sources
for r in results["results"]:
    print(f"- {r['title']}: {r['url']}")
```

### Quick Q&A

```python
# One-line answer for simple questions
answer = client.qna_search("Who won the 2024 Super Bowl?")
print(answer)  # "The Kansas City Chiefs won..."
```

### Topic-Specific Search

```python
# News search
news = client.search(
    query="OpenAI announcements",
    topic="news",
    days=7,
)

# General knowledge
general = client.search(
    query="How does RAG work?",
    topic="general",
)
```

---

## Part 3: LangChain Integration

### As Agent Tool

```python
from langchain_community.tools.tavily_search import TavilySearchResults

# Create tool
search_tool = TavilySearchResults(
    max_results=5,
    search_depth="advanced",
    include_answer=True,
)

# Use in agent
from langchain.agents import create_react_agent
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4")
tools = [search_tool]

agent = create_react_agent(llm, tools, prompt)
```

### With LangGraph

```python
from langgraph.prebuilt import create_react_agent
from langchain_community.tools.tavily_search import TavilySearchResults

tools = [TavilySearchResults(max_results=3)]
agent = create_react_agent(model, tools)

result = agent.invoke({
    "messages": [("user", "What's the weather in Tokyo today?")]
})
```

### Custom Tool Wrapper

```python
from langchain.tools import tool
from tavily import TavilyClient

@tool
def research_topic(query: str) -> str:
    """Research a topic using web search. Use for current events or facts."""
    client = TavilyClient()
    results = client.search(query, search_depth="advanced", max_results=5)
    
    # Format for LLM
    output = f"Answer: {results.get('answer', 'No direct answer')}\n\nSources:\n"
    for r in results["results"]:
        output += f"- {r['title']}: {r['content'][:200]}...\n"
    
    return output
```

---

## Part 4: RAG Grounding

### Extract Content for Context

```python
def get_grounding_context(query: str, max_chars: int = 4000) -> str:
    """Get web content to ground LLM responses."""
    results = client.search(
        query=query,
        search_depth="advanced",
        include_raw_content=True,
        max_results=3,
    )
    
    context = ""
    for r in results["results"]:
        content = r.get("raw_content", r["content"])
        context += f"Source: {r['url']}\n{content}\n\n"
        if len(context) > max_chars:
            break
    
    return context[:max_chars]

# Use in prompt
context = get_grounding_context("Latest AI safety guidelines")
prompt = f"""Based on this current information:

{context}

Answer the user's question: What are the current AI safety guidelines?"""
```

### Fact-Checking Pattern

```python
def fact_check(claim: str) -> dict:
    """Verify a claim against current web sources."""
    results = client.search(
        query=f"Is it true that {claim}",
        search_depth="advanced",
        include_answer=True,
        max_results=5,
    )
    
    return {
        "claim": claim,
        "verdict": results.get("answer"),
        "sources": [r["url"] for r in results["results"]],
    }

# Usage
check = fact_check("GPT-5 was released in 2025")
```

---

## Part 5: Patterns

### Research Agent Pattern

```python
async def research_and_summarize(topic: str) -> str:
    """Multi-step research with synthesis."""
    
    # Step 1: Broad search
    overview = client.search(topic, search_depth="basic", max_results=5)
    
    # Step 2: Extract subtopics from results
    subtopics = extract_subtopics(overview)  # Your LLM call
    
    # Step 3: Deep dive each subtopic
    detailed_results = []
    for subtopic in subtopics[:3]:
        deep = client.search(subtopic, search_depth="advanced", max_results=3)
        detailed_results.extend(deep["results"])
    
    # Step 4: Synthesize
    return synthesize_research(detailed_results)  # Your LLM call
```

### News Monitoring Pattern

```python
def check_for_updates(topics: list[str], last_check_days: int = 1) -> list:
    """Check for new developments on tracked topics."""
    updates = []
    
    for topic in topics:
        results = client.search(
            topic,
            topic="news",
            days=last_check_days,
            max_results=5,
        )
        
        if results["results"]:
            updates.append({
                "topic": topic,
                "new_items": len(results["results"]),
                "headlines": [r["title"] for r in results["results"]],
            })
    
    return updates
```

---

## Part 6: Best Practices

### Query Optimization

```python
# ❌ Bad: Vague query
client.search("AI")

# ✅ Good: Specific query
client.search("Latest AI language model releases 2026")

# ✅ Better: With constraints
client.search(
    "AI language model benchmarks comparison",
    include_domains=["arxiv.org", "huggingface.co"],
    days=90,
)
```

### Rate Limiting

```python
import asyncio
from functools import wraps

def rate_limit(calls_per_minute: int = 60):
    """Simple rate limiter for Tavily calls."""
    interval = 60.0 / calls_per_minute
    last_call = [0.0]
    
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            elapsed = asyncio.get_event_loop().time() - last_call[0]
            if elapsed < interval:
                await asyncio.sleep(interval - elapsed)
            last_call[0] = asyncio.get_event_loop().time()
            return await func(*args, **kwargs)
        return wrapper
    return decorator
```

### Error Handling

```python
from tavily import TavilyClient, InvalidAPIKeyError, UsageLimitExceededError

try:
    results = client.search(query)
except InvalidAPIKeyError:
    print("Check your TAVILY_API_KEY")
except UsageLimitExceededError:
    print("API quota exceeded - upgrade plan or wait")
except Exception as e:
    print(f"Search failed: {e}")
```

---

## Part 7: Pricing & Limits

| Tier | Searches/Month | Price |
|------|----------------|-------|
| **Free** | 1,000 | $0 |
| **Pro** | 10,000 | $50/mo |
| **Business** | 100,000 | Contact |

### Optimize Costs

1. Use `search_depth: basic` when possible
2. Cache frequent queries
3. Batch related searches
4. Use `max_results` wisely

---

## Checklist

- [ ] Tavily API key obtained
- [ ] tavily-python installed
- [ ] Basic search working
- [ ] LangChain integration tested (if using)
- [ ] Error handling implemented
- [ ] Rate limiting for production
- [ ] Caching strategy defined

---

## Resources

- Docs: https://docs.tavily.com
- Python SDK: https://github.com/tavily-ai/tavily-python
- LangChain: https://python.langchain.com/docs/integrations/tools/tavily_search

---

## Related Skills

- `ai-builder/langchain/SKILL.md` — Agent frameworks
- `ai-builder/agentic-workflows/SKILL.md` — Multi-agent patterns
- `ai-builder/rag/SKILL.md` — RAG pipelines
- `content/topic-research/SKILL.md` — Research workflows
