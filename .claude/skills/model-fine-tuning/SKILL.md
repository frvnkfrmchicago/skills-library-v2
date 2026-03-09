---
name: model-fine-tuning
description: >
  Guides when and how to fine-tune AI models for specific tasks, domains, and
  behaviors. Covers data preparation, training strategies, evaluation metrics,
  and deployment across OpenAI, Google Vertex AI, and open-source (LoRA/PEFT).
  Use when deciding whether to fine-tune, preparing training data, selecting
  hyperparameters, evaluating model quality, or choosing between fine-tuning
  and prompt engineering.
---

# Model Fine-Tuning

Fine-tuning trades flexibility for precision. Use it when you need consistent,
specialized behavior that prompting alone cannot achieve.

---

## Before You Fine-Tune — Answer These

1. **Task?** Classification, generation, extraction, style transfer?
2. **Current approach?** Where does prompting fail?
3. **Data volume?** 10 examples? 100? 10,000?
4. **Base model?** GPT, Gemini, Llama, open-source?
5. **Latency/cost budget?** Can you afford larger models in production?

---

## When to Fine-Tune

### DO Fine-Tune When

- **Consistent format** — need exact output structure every time
- **Domain expertise** — medical, legal, technical jargon
- **Style/tone** — specific brand voice that prompting cannot replicate
- **Reducing tokens** — need shorter prompts for speed/cost
- **Behavior control** — very specific do/don't requirements
- **Edge cases** — prompting fails on specific scenarios repeatedly

### DO NOT Fine-Tune When

- **Few examples** — less than 50-100 high-quality samples
- **Rapidly changing requirements** — specifications shift frequently
- **General tasks** — base model + prompting works fine
- **No evaluation method** — cannot measure whether it improved
- **One-off task** — training investment not justified

---

## Data Preparation

### Training Data Format (JSONL)

```jsonl
{"messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "What's the weather?"}, {"role": "assistant", "content": "I don't have access to real-time weather data."}]}
{"messages": [{"role": "user", "content": "Summarize this: [text]"}, {"role": "assistant", "content": "[summary]"}]}
```

### Data Quality Requirements

Verify before training:

1. **Diverse examples** — cover edge cases, not just happy paths
2. **Correct outputs** — no errors in training data (garbage in, garbage out)
3. **Consistent format** — same structure throughout all examples
4. **Balanced classes** — if classification, balance positive/negative
5. **Sufficient volume** — minimum 50-100 high-quality samples
6. **No duplicates** — deduplicate before training
7. **PII removed** — anonymize personally identifiable information
8. **Validation set** — separate 10-20% for evaluation

### Data Collection Strategies

| Strategy | When to Use |
|----------|-------------|
| Manual curation | High quality needed, low volume |
| Synthetic generation | Bootstrap with AI, then human-validate |
| Production logs | Real user interactions (best quality) |
| Expert annotation | Domain-specific tasks requiring expertise |
| Distillation | Larger model teaching a smaller model |

---

## Platform-Specific Training

### OpenAI

```python
from openai import OpenAI
client = OpenAI()

# Upload training file
file = client.files.create(
    file=open("training_data.jsonl", "rb"),
    purpose="fine-tune"
)

# Create fine-tuning job
job = client.fine_tuning.jobs.create(
    training_file=file.id,
    model="gpt-4o-mini-2024-07-18",
    hyperparameters={
        "n_epochs": 3,
        "batch_size": 1,
        "learning_rate_multiplier": 1.8
    }
)

# Use fine-tuned model
response = client.chat.completions.create(
    model="ft:gpt-4o-mini:org-id::job-id",
    messages=[{"role": "user", "content": "..."}]
)
```

### Google Vertex AI

```python
from google.cloud import aiplatform

aiplatform.init(project="your-project", location="us-central1")

tuning_job = aiplatform.TextGenerationModel.from_pretrained(
    "gemini-1.5-flash"
).tune_model(
    training_data="gs://bucket/training_data.jsonl",
    train_steps=100,
    learning_rate_multiplier=1.0
)
```

### Open Source (Hugging Face + LoRA)

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer

model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.2-3B")
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.2-3B")

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    target_modules=["q_proj", "v_proj"]
)

model = get_peft_model(model, lora_config)

trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    tokenizer=tokenizer,
    max_seq_length=2048,
)
trainer.train()
```

---

## Evaluation

### Metrics by Task Type

| Task | Metrics |
|------|---------|
| Classification | Accuracy, F1, Precision, Recall |
| Generation | Human eval, BLEU, ROUGE, perplexity |
| Extraction | Exact match, Partial match, F1 |
| Style | Human preference, A/B testing |

### Cost/Quality Tradeoffs

| Approach | Cost | Quality | Flexibility |
|----------|------|---------|-------------|
| Prompting large model | $$$ | High | High |
| RAG + medium model | $$ | Good | High |
| Fine-tuned medium model | $$ + training | Very High | Low |
| Fine-tuned small model | $ + training | Good | Low |
| Distillation | $ + training | Good | Medium |

---

## ⛔ STOP GATE

DO NOT start a fine-tuning job without:
1. Confirming that prompt engineering + RAG was tried first and failed
2. Preparing at least 50 high-quality training examples
3. Separating a validation set (10-20%)
4. Defining the evaluation metric before training
5. Setting a baseline score from the un-tuned model
