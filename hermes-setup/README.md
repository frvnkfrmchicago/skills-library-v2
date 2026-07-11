# Hermes Agent Command Center

8 specialized agents operating through Discord with channel-based routing.

## Agents

| # | Name | Profile | Model | Role |
|---|------|---------|-------|------|
| 1 | Agent Gem | `agent-gem` | MiniMax M3 | Lead orchestrator |
| 2 | HecThor | `hecthor` | MiniMax M3 | Coding |
| 3 | Big Venture | `big-venture` | MiniMax M3 | Research & writing |
| 4 | Lil Neutron | `lil-neutron` | MiniMax M3 | frvnkfrmchicago content |
| 5 | Mr. Thinker | `mr-thinker` | MiniMax M3 | AI Study Hall |
| 6 | TwoFace | `twoface` | MiniMax M3 | Cloner |
| 7 | Paper Agent | `paper-agent` | MiniMax M3 | Trading intelligence |
| 8 | Thoughts of G-Claw | `thoughts-of-gclaw` | GLM 5.1 | Security & code review |

## Directory Structure

```
hermes-setup/
├── setup-hermes.sh              # Automated setup (run on VM)
├── README.md                    # This file
├── profiles/
│   ├── agent-gem/SOUL.md        # Orchestrator persona
│   ├── hecthor/SOUL.md          # Coder persona
│   ├── big-venture/SOUL.md      # Research/writing persona
│   ├── lil-neutron/SOUL.md      # FFC content persona
│   ├── mr-thinker/SOUL.md       # AI Study Hall persona
│   ├── twoface/SOUL.md          # Cloner persona
│   ├── paper-agent/SOUL.md      # Trading persona
│   └── thoughts-of-gclaw/SOUL.md # Security persona (GLM 5.1)
├── scripts/
│   ├── discord_bot.py           # Channel-routing Discord bot
│   ├── morning_briefing.py      # Paper Agent morning cron
│   └── market_close.py          # Paper Agent close cron
└── configs/
    ├── webhooks.env             # Discord webhook URLs
    └── watchlist.json           # Trading watchlist tickers
```

## Quick Start

### 1. Transfer to VM

```bash
scp -r hermes-setup/ your-user@your-vm-ip:~/hermes-setup/
```

### 2. Run setup

```bash
ssh your-user@your-vm-ip
cd ~/hermes-setup
chmod +x setup-hermes.sh
./setup-hermes.sh
```

### 3. Follow manual steps

The script outputs remaining steps: Discord bot creation, API keys, channel setup, cron jobs.

## What the Script Does

| Phase | What |
|-------|------|
| Pre-flight | Checks Docker, Python 3, tmux |
| Install Hermes | Runs official installer |
| Docker sandbox | Isolates code execution |
| Create profiles | All 8 agent profiles |
| Deploy SOULs | Copies SOUL.md into each profile |
| Python deps | yfinance, FinBERT, Playwright, discord.py |
| Antigravity CLI | Installs for HecThor coding sub-agents |
| Timezone | Sets to America/Chicago (Central) |
| Directories | Creates ~/hermes-agents/ structure |
| Firewall | Checks UFW status |

## Cron Jobs

```cron
# Paper Agent — morning briefing (weekdays 8:30 AM CT)
30 8 * * 1-5 cd ~/hermes-agents && ~/.hermes/venv/bin/python scripts/morning_briefing.py >> logs/briefing.log 2>&1

# Paper Agent — market close (weekdays 4:15 PM CT)
15 16 * * 1-5 cd ~/hermes-agents && ~/.hermes/venv/bin/python scripts/market_close.py >> logs/close.log 2>&1
```

## Threads Session Check

Threads uses per-account cookie files under:

```text
~/.hermes/threads/sessions/<account>.json
```

Run the real health check by counting intercepted feed posts:

```bash
cd ~/hermes-agents
~/.hermes/hermes-agent/venv/bin/python scripts/threads_scrape.py --account grazzhopper --scrolls 2 --output json
~/.hermes/hermes-agent/venv/bin/python scripts/threads_scrape.py --account frvnkfrmchicago --status-only
```

The script also accepts a Playwright storage-state file:

```bash
~/.hermes/hermes-agent/venv/bin/python scripts/threads_scrape.py --session-file ~/.hermes/threads-session.json --scrolls 2
```

## Security

- All code runs in Docker sandbox
- Bot token stored as env var, never in code
- User allowlist locks bot to your Discord ID only
- G-Claw (Thoughts of G-Claw) runs hacker-scanning on all agent code before deployment
- No API keys in commits or chat messages — use `hermes config set`
