# Tencent HunYuan Model

**Tencent's large language and multimodal AI model.**

---

## Context Questions

1. **What task?** — Text generation, code, image understanding?
2. **Language?** — Optimized for Chinese, but supports English
3. **Integration?** — API, cloud deployment, or inference?

---

## TL;DR

| Feature | HunYuan Capability |
|---------|-------------------|
| **Text Generation** | Long-form content, summarization, chat |
| **Code** | Code generation and explanation |
| **Multimodal** | Image understanding, vision tasks |
| **Chinese** | Excellent Chinese language support |
| **API Access** | Via Tencent Cloud |

---

## Model Versions

| Model | Best For |
|-------|----------|
| **HunYuan Large** | Complex reasoning, long context |
| **HunYuan Standard** | General tasks, balanced speed/quality |
| **HunYuan Vision** | Image understanding, multimodal |

---

## API Integration

### Authentication

```python
import os
from tencentcloud.common import credential
from tencentcloud.hunyuan.v20230901 import hunyuan_client, models

cred = credential.Credential(
    os.environ.get("TENCENT_SECRET_ID"),
    os.environ.get("TENCENT_SECRET_KEY")
)

client = hunyuan_client.HunyuanClient(cred, "ap-guangzhou")
```

### Text Generation

```python
req = models.ChatCompletionsRequest()
req.Model = "hunyuan-large"
req.Messages = [
    {"Role": "user", "Content": "Explain quantum computing simply"}
]

resp = client.ChatCompletions(req)
print(resp.Choices[0].Message.Content)
```

### Streaming Response

```python
req.Stream = True

for event in client.ChatCompletions(req):
    print(event.Choices[0].Delta.Content, end="")
```

---

## Prompt Patterns

### System Instructions

```markdown
## For Chinese Content
你是一个专业的[角色]，擅长[领域]。
请用简洁专业的语言回答问题。

## For Technical Tasks
You are an expert in [domain].
Provide detailed, accurate responses with examples.
```

### Few-Shot Pattern

```python
messages = [
    {"Role": "system", "Content": "You generate product descriptions."},
    {"Role": "user", "Content": "Product: Wireless earbuds"},
    {"Role": "assistant", "Content": "Experience pure freedom..."},
    {"Role": "user", "Content": "Product: Smart watch"}
]
```

---

## Best Use Cases

| Use Case | Why HunYuan |
|----------|-------------|
| **Chinese content** | Native Chinese training |
| **Tencent ecosystem** | Tight integration with Tencent Cloud |
| **Enterprise China** | Data residency, compliance |
| **Multimodal Chinese** | Vision + Chinese text |

---

## Comparison

| Model | Chinese | English | Code | Vision |
|-------|---------|---------|------|--------|
| HunYuan | ★★★★★ | ★★★☆☆ | ★★★☆☆ | ★★★★☆ |
| GPT-4 | ★★★★☆ | ★★★★★ | ★★★★★ | ★★★★★ |
| Gemini | ★★★★☆ | ★★★★★ | ★★★★☆ | ★★★★★ |
| Claude | ★★★★☆ | ★★★★★ | ★★★★★ | ★★★★☆ |

---

## Related Skills

- `platforms/google-ai-studio/SKILL.md` — Gemini comparison
- `ai-builder/model-steering/SKILL.md` — Prompt patterns
- `ai-builder/prompt-engineering/SKILL.md` — General prompting
