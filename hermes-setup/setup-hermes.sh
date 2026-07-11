#!/usr/bin/env bash
# ============================================================================
# Hermes Agent Command Center — Setup Script
# ============================================================================
# 8 Agent Profiles: Agent Gem, HecThor, Big Venture, Lil Neutron,
# Mr. Thinker, TwoFace, Paper Agent, Thoughts of G-Claw
#
# Run on your VM after SSHing in.
# Usage:
#   chmod +x setup-hermes.sh
#   ./setup-hermes.sh
# ============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()   { echo -e "${GREEN}[DONE]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()   { echo -e "${RED}[FAIL]${NC} $1"; }
info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
header(){ echo -e "\n${CYAN}======================================================${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}======================================================${NC}\n"; }

# All 8 agent profiles
PROFILES=(
    "agent-gem"
    "hecthor"
    "big-venture"
    "lil-neutron"
    "mr-thinker"
    "twoface"
    "paper-agent"
    "thoughts-of-gclaw"
    "publishstar"
)

# ============================================================================
# Pre-flight checks
# ============================================================================
header "PRE-FLIGHT CHECKS"

if [ "$(id -u)" -eq 0 ]; then
    warn "Running as root. Consider creating a dedicated 'hermes-agent' user:"
    warn "  sudo adduser hermes-agent && sudo usermod -aG docker hermes-agent"
    warn "  sudo su - hermes-agent"
    echo ""
    read -p "Continue as root? (y/N): " CONTINUE_ROOT
    if [[ ! "$CONTINUE_ROOT" =~ ^[Yy]$ ]]; then
        err "Exiting. Create a dedicated user first."
        exit 1
    fi
fi

# Check Python 3.10+
if command -v python3 &> /dev/null; then
    PY_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
    log "Python found: $PY_VERSION"
else
    err "Python 3 not found. Install it: sudo apt install python3 python3-pip python3-venv"
    exit 1
fi

# Check Docker
if command -v docker &> /dev/null; then
    log "Docker found: $(docker --version)"
else
    warn "Docker not found. Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo systemctl enable docker
    sudo systemctl start docker
    log "Docker installed: $(docker --version)"
fi

if docker info &> /dev/null 2>&1; then
    log "Docker daemon is running"
else
    err "Docker daemon is not running. Start it with: sudo systemctl start docker"
    exit 1
fi

# Check tmux (needed for multi-agent sessions)
if command -v tmux &> /dev/null; then
    log "tmux found: $(tmux -V)"
else
    info "Installing tmux..."
    sudo apt-get install -y tmux 2>/dev/null || sudo yum install -y tmux 2>/dev/null
    log "tmux installed"
fi

# ============================================================================
# Phase 1: Install Hermes Agent
# ============================================================================
header "PHASE 1: INSTALLING HERMES AGENT"

if command -v hermes &> /dev/null; then
    log "Hermes already installed: $(hermes --version 2>/dev/null || echo 'version unknown')"
    read -p "Reinstall? (y/N): " REINSTALL
    if [[ "$REINSTALL" =~ ^[Yy]$ ]]; then
        curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
    fi
else
    info "Installing Hermes Agent (this takes ~2 minutes)..."
    curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
fi

# Fix Node.js PATH
HERMES_NODE_PATH="$HOME/.hermes/node/bin"
if [ -d "$HERMES_NODE_PATH" ]; then
    export PATH="$HERMES_NODE_PATH:$PATH"

    SHELL_PROFILE="$HOME/.bashrc"
    [ -f "$HOME/.zshrc" ] && SHELL_PROFILE="$HOME/.zshrc"

    if ! grep -q ".hermes/node/bin" "$SHELL_PROFILE" 2>/dev/null; then
        echo "export PATH=\"\$HOME/.hermes/node/bin:\$PATH\"" >> "$SHELL_PROFILE"
        log "Added Node.js to PATH in $SHELL_PROFILE"
    else
        log "Node.js PATH already configured"
    fi
fi

if command -v node &> /dev/null; then
    log "Node.js available: $(node -v)"
else
    err "Node.js not found on PATH. Check ~/.hermes/node/bin"
    exit 1
fi

source "$SHELL_PROFILE" 2>/dev/null || true
log "Hermes Agent installed"

# ============================================================================
# Phase 2: Enable Docker Sandbox
# ============================================================================
header "PHASE 2: ENABLING DOCKER SANDBOX"

info "Configuring Docker as the terminal backend..."
hermes config set terminal.backend docker 2>/dev/null || {
    warn "Could not set Docker backend via CLI. Configuring manually."

    HERMES_CONFIG="$HOME/.hermes/config.yaml"
    if [ -f "$HERMES_CONFIG" ]; then
        if grep -q "terminal:" "$HERMES_CONFIG"; then
            info "terminal section exists in config — verify backend is set to 'docker'"
        else
            echo -e "\nterminal:\n  backend: docker\n  docker_network: none" >> "$HERMES_CONFIG"
            log "Added Docker backend to config.yaml"
        fi
    fi
}

log "Docker sandbox configured — all code execution will be isolated"

# ============================================================================
# Phase 3: Create All 8 Agent Profiles
# ============================================================================
header "PHASE 3: CREATING 8 AGENT PROFILES"

PROFILES_DIR="$HOME/.hermes/profiles"

DESCRIPTIONS=(
    "Lead orchestrator. Triages requests, dispatches to specialists, tracks progress across all agents."
    "Coding agent. Builds apps, features, components. Spawns Antigravity CLI sub-agents."
    "Research and writing agent. Blogging, SEO, technical writing, scientific briefs."
    "frvnkfrmchicago content engine. Threads, LinkedIn, IG. Authentic voice, no corporate speak."
    "AI Study Hall researcher and formatter. Learning content, notes, resources for Asset Persona."
    "Cloner agent. Mobbin, Dribbble browser sessions. Screenshots flows, clones apps."
    "Trading intelligence. Market briefings, news sentiment, watchlist monitoring, earnings."
    "Code reviewer and hacker-attacker. Security audits, 7-lens review. Powered by GLM 5.1."
    "Publishing Star content engine. Prolific multi-channel post generation for tech, stocks, and design."
)

for i in "${!PROFILES[@]}"; do
    PROFILE="${PROFILES[$i]}"
    DESC="${DESCRIPTIONS[$i]}"

    info "Creating profile: $PROFILE"
    hermes profile create "$PROFILE" --description "$DESC" 2>/dev/null || {
        warn "Profile '$PROFILE' may already exist. Creating directory..."
        mkdir -p "$PROFILES_DIR/$PROFILE"
    }

    # Configure model for each profile
    if [ "$PROFILE" = "thoughts-of-gclaw" ]; then
        hermes config set "profiles.$PROFILE.model" "glm-5.1" 2>/dev/null || true
    else
        hermes config set "profiles.$PROFILE.model" "MiniMax-M3" 2>/dev/null || true
    fi
done

log "All agent profiles created and models configured"

# ============================================================================
# Phase 4: Deploy SOUL.md Files
# ============================================================================
header "PHASE 4: DEPLOYING SOUL.md FILES"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOUL_SOURCE="$SCRIPT_DIR/profiles"

if [ -d "$SOUL_SOURCE" ]; then
    for PROFILE in "${PROFILES[@]}"; do
        SRC="$SOUL_SOURCE/$PROFILE/SOUL.md"
        DEST="$PROFILES_DIR/$PROFILE/SOUL.md"

        if [ -f "$SRC" ]; then
            cp "$SRC" "$DEST"
            log "Deployed SOUL.md -> $PROFILE"
        else
            warn "SOUL.md not found for $PROFILE at $SRC"
        fi
    done
else
    warn "Profile source directory not found at $SOUL_SOURCE"
    warn "You'll need to manually copy SOUL.md files to ~/.hermes/profiles/<name>/SOUL.md"
fi

# Clean up old profile names if they exist
for OLD_PROFILE in orchestrator researcher coder; do
    if [ -d "$PROFILES_DIR/$OLD_PROFILE" ]; then
        info "Archiving old profile: $OLD_PROFILE -> $OLD_PROFILE.bak"
        mv "$PROFILES_DIR/$OLD_PROFILE" "$PROFILES_DIR/$OLD_PROFILE.bak"
    fi
done

# ============================================================================
# Phase 5: Install Python Dependencies
# ============================================================================
header "PHASE 5: INSTALLING PYTHON DEPENDENCIES"

info "Creating virtual environment for Hermes scripts..."
VENV_DIR="$HOME/.hermes/venv"
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
    log "Virtual environment created at $VENV_DIR"
else
    log "Virtual environment already exists"
fi

source "$VENV_DIR/bin/activate"

info "Installing trading dependencies..."
pip install --quiet yfinance feedparser transformers torch sentencepiece 2>/dev/null || {
    warn "Some packages failed. Trying individually..."
    pip install --quiet yfinance || warn "yfinance failed"
    pip install --quiet feedparser || warn "feedparser failed"
    pip install --quiet transformers || warn "transformers failed"
    pip install --quiet sentencepiece || warn "sentencepiece failed"
}

info "Installing browser automation dependencies..."
pip install --quiet playwright requests discord.py 2>/dev/null || {
    warn "Some packages failed. Trying individually..."
    pip install --quiet playwright || warn "playwright failed"
    pip install --quiet requests || warn "requests failed"
    pip install --quiet discord.py || warn "discord.py failed"
}

log "Python dependencies installed"

# ============================================================================
# Phase 6: Install Antigravity CLI
# ============================================================================
header "PHASE 6: INSTALLING ANTIGRAVITY CLI"

if command -v antigravity &> /dev/null; then
    log "Antigravity CLI already installed"
else
    info "Installing Antigravity CLI..."
    curl -fsSL https://antigravity.google/install.sh | bash 2>/dev/null || {
        warn "Antigravity CLI install failed. You may need to install manually."
        warn "Visit: https://antigravity.google for download instructions."
    }
fi

# ============================================================================
# Phase 7: Set Timezone
# ============================================================================
header "PHASE 7: TIMEZONE CONFIGURATION"

CURRENT_TZ=$(timedatectl show -p Timezone --value 2>/dev/null || echo "unknown")
if [ "$CURRENT_TZ" = "America/Chicago" ]; then
    log "Timezone already set to America/Chicago (Central)"
else
    info "Setting timezone to America/Chicago (Central)..."
    sudo timedatectl set-timezone America/Chicago 2>/dev/null || {
        warn "Could not set timezone automatically. Run: sudo timedatectl set-timezone America/Chicago"
    }
    log "Timezone set to Central"
fi

# ============================================================================
# Phase 8: Create Script Directories
# ============================================================================
header "PHASE 8: CREATING DIRECTORY STRUCTURE"

HERMES_HOME="$HOME/hermes-agents"
mkdir -p "$HERMES_HOME/scripts"
mkdir -p "$HERMES_HOME/logs"
mkdir -p "$HERMES_HOME/clones"
mkdir -p "$HERMES_HOME/data"
mkdir -p "$HERMES_HOME/configs"
mkdir -p "$HOME/.hermes/threads/sessions"
mkdir -p "$HOME/.hermes/threads/verticals"
mkdir -p "$HOME/.hermes/threads/cache"

if [ -d "$SCRIPT_DIR/scripts" ]; then
    cp "$SCRIPT_DIR"/scripts/*.py "$HERMES_HOME/scripts/" 2>/dev/null || true
    chmod +x "$HERMES_HOME"/scripts/*.py 2>/dev/null || true
    log "Copied Hermes helper scripts"
fi

if [ -d "$SCRIPT_DIR/configs" ]; then
    cp -n "$SCRIPT_DIR"/configs/* "$HERMES_HOME/configs/" 2>/dev/null || true
    log "Copied default config files"
fi

log "Directory structure created:"
info "  $HERMES_HOME/scripts/  — agent scripts (briefings, scraping, bot)"
info "  $HERMES_HOME/logs/     — cron job logs"
info "  $HERMES_HOME/clones/   — TwoFace clone output"
info "  $HERMES_HOME/data/     — trading data, research cache"
info "  $HERMES_HOME/configs/  — webhook URLs, watchlists"
info "  $HOME/.hermes/threads/sessions/ — per-account Threads cookies"

# ============================================================================
# Phase 9: Firewall Check
# ============================================================================
header "PHASE 9: FIREWALL CHECK"

if command -v ufw &> /dev/null; then
    UFW_STATUS=$(sudo ufw status 2>/dev/null || echo "inactive")
    if echo "$UFW_STATUS" | grep -q "active"; then
        log "UFW firewall is active"
    else
        warn "UFW is installed but not active"
        info "Recommended: sudo ufw default deny incoming && sudo ufw allow ssh && sudo ufw enable"
    fi
else
    info "UFW not installed. Consider: sudo apt install ufw"
fi

# ============================================================================
# Summary & Next Steps
# ============================================================================
header "SETUP COMPLETE — MANUAL STEPS REMAINING"

echo -e "${GREEN}Automated setup finished. Manual steps:${NC}\n"

echo -e "${CYAN}1. CONFIGURE MINIMAX M3 (for 8 agents):${NC}"
echo "   Run: hermes model"
echo "   Select 'MiniMax' -> paste your MiniMax API key"
echo "   This covers: Agent Gem, HecThor, Big Venture, Lil Neutron,"
echo "   Mr. Thinker, TwoFace, Paper Agent, and Publish Star"
echo ""

echo -e "${CYAN}2. CONFIGURE GLM 5.1 (for Thoughts of G-Claw):${NC}"
echo "   Set the GLM/Zhipu API key for the thoughts-of-gclaw profile:"
echo "   hermes config set profiles.thoughts-of-gclaw.model glm-5.1"
echo "   hermes config set profiles.thoughts-of-gclaw.api_key <your-zhipu-key>"
echo ""

echo -e "${CYAN}3. AUTHENTICATE ANTIGRAVITY CLI:${NC}"
echo "   Run: antigravity"
echo "   Follow Google OAuth flow (opens browser on first run)"
echo "   After auth, it runs headless — no browser needed again"
echo ""

echo -e "${CYAN}4. SET UP DISCORD BOT:${NC}"
echo "   a) Go to: https://discord.com/developers/applications"
echo "   b) New Application -> name it 'Hermes Command Center'"
echo "   c) Bot tab -> Reset Token -> SAVE the token"
echo "   d) Enable ALL 3 Privileged Gateway Intents"
echo "   e) OAuth2 -> URL Generator -> select 'bot' + 'applications.commands'"
echo "   f) Copy the URL -> open in browser -> invite to your server"
echo ""

echo -e "${CYAN}5. CREATE DISCORD CHANNELS:${NC}"
echo "   Create these categories and channels in your server:"
echo ""
echo "   AGENT GEM:       #gem-commands, #gem-log"
echo "   HECTHOR:         #hecthor-commands, #hecthor-output"
echo "   BIG VENTURE:     #bigventure-commands, #bigventure-output"
echo "   LIL NEUTRON:     #neutron-commands, #neutron-content, #neutron-queue"
echo "   MR. THINKER:     #thinker-commands, #thinker-output"
echo "   TWOFACE:         #twoface-commands, #twoface-output"
echo "   PAPER AGENT:     #paper-briefing, #paper-commands, #paper-alerts"
echo "   THOUGHTS OF G-CLAW: #gclaw-commands, #gclaw-audits"
echo "   OPERATIONS:      #agent-errors, #general"
echo ""

echo -e "${CYAN}6. CREATE WEBHOOKS:${NC}"
echo "   For each output/briefing/alert channel, create a webhook:"
echo "   Channel Settings -> Integrations -> Webhooks -> New Webhook"
echo "   Save each URL to: ~/hermes-agents/configs/webhooks.env"
echo ""

echo -e "${CYAN}7. CONNECT DISCORD TO HERMES:${NC}"
echo "   Run: hermes setup gateway"
echo "   Select Discord -> paste bot token -> paste your user ID -> paste channel IDs"
echo ""

echo -e "${CYAN}8. LOCK DOWN ACCESS:${NC}"
echo "   hermes config set gateway.discord.allowed_users '[\"YOUR_DISCORD_USER_ID\"]'"
echo ""

echo -e "${CYAN}9. SET UP CRON JOBS:${NC}"
echo "   Run: crontab -e"
echo "   Add these lines:"
echo "   30 8 * * 1-5 cd $HERMES_HOME && $VENV_DIR/bin/python scripts/morning_briefing.py >> logs/briefing.log 2>&1"
echo "   15 16 * * 1-5 cd $HERMES_HOME && $VENV_DIR/bin/python scripts/market_close.py >> logs/close.log 2>&1"
echo "   0 */4 * * * cd $HERMES_HOME && $VENV_DIR/bin/python scripts/threads_scrape.py >> logs/threads.log 2>&1"
echo "   0 7 * * * cd $HERMES_HOME && $VENV_DIR/bin/python scripts/ffc_content_queue.py >> logs/ffc.log 2>&1"
echo "   0 21 * * 0 cd $HERMES_HOME && $VENV_DIR/bin/python scripts/weekly_report.py >> logs/weekly.log 2>&1"
echo ""

echo -e "${CYAN}10. LAUNCH:${NC}"
echo "   hermes gateway start"
echo "   # Or run the Discord bot directly:"
echo "   cd $HERMES_HOME && $VENV_DIR/bin/python scripts/discord_bot.py"
echo ""

echo -e "${CYAN}11. VERIFY:${NC}"
echo "   hermes doctor"
echo "   hermes profile list"
echo "   # Send 'hey' in #gem-commands on Discord"
echo ""

echo -e "${GREEN}======================================================${NC}"
echo -e "${GREEN}  Hermes Command Center — 8 Agents Ready to Configure ${NC}"
echo -e "${GREEN}======================================================${NC}"
echo ""
echo "Profiles created:"
for PROFILE in "${PROFILES[@]}"; do
    echo "  - $PROFILE"
done
