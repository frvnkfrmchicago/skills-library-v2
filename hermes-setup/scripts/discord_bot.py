#!/usr/bin/env python3
"""
Hermes Command Center — Discord Bot with Channel-Based Routing

Routes messages to the correct agent profile based on which Discord
channel the message was sent in. Single bot token, multiple personas.

Usage:
    export DISCORD_BOT_TOKEN="your-bot-token"
    python discord_bot.py
"""

import os
import sys
import json
import asyncio
import subprocess
import logging
from datetime import datetime

import discord
from discord.ext import commands

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DISCORD_BOT_TOKEN = os.environ.get("DISCORD_BOT_TOKEN")
HERMES_HOME = os.path.expanduser("~/hermes-agents")
CONFIGS_DIR = os.path.join(HERMES_HOME, "configs")
LOGS_DIR = os.path.join(HERMES_HOME, "logs")

# Channel -> Profile mapping
# Keys are channel names (without #), values are Hermes profile IDs
CHANNEL_PROFILES = {
    "gem-commands":       "agent-gem",
    "hecthor-commands":   "hecthor",
    "bigventure-commands": "big-venture",
    "neutron-commands":   "lil-neutron",
    "thinker-commands":   "mr-thinker",
    "twoface-commands":   "twoface",
    "paper-commands":     "paper-agent",
    "gclaw-commands":     "thoughts-of-gclaw",
    "publishstar-commands": "publishstar",
}

# Output channels for each profile (where results get posted)
OUTPUT_CHANNELS = {
    "agent-gem":          "gem-log",
    "hecthor":            "hecthor-output",
    "big-venture":        "bigventure-output",
    "lil-neutron":        "neutron-content",
    "mr-thinker":         "thinker-output",
    "twoface":            "twoface-output",
    "paper-agent":        "paper-briefing",
    "thoughts-of-gclaw":  "gclaw-audits",
    "publishstar":        "publishstar-output",
}

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

os.makedirs(LOGS_DIR, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(LOGS_DIR, "discord_bot.log")),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger("hermes-bot")

# ---------------------------------------------------------------------------
# Bot Setup
# ---------------------------------------------------------------------------

intents = discord.Intents.default()
intents.message_content = True
intents.guilds = True

bot = commands.Bot(command_prefix="!", intents=intents)

# Load allowed user IDs from config
ALLOWED_USERS_FILE = os.path.join(CONFIGS_DIR, "allowed_users.json")


def get_allowed_users():
    """Load allowed Discord user IDs. If no file exists, allow all."""
    if os.path.exists(ALLOWED_USERS_FILE):
        with open(ALLOWED_USERS_FILE) as f:
            return set(json.load(f))
    return None  # None = no restriction (configure after first run)


def get_webhooks():
    """Load webhook URLs from configs/webhooks.env."""
    webhooks = {}
    webhook_file = os.path.join(CONFIGS_DIR, "webhooks.env")
    if os.path.exists(webhook_file):
        with open(webhook_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    webhooks[key.strip()] = value.strip()
    return webhooks


async def run_hermes(profile: str, prompt: str) -> str:
    """Run a Hermes agent with the given profile and prompt."""
    cmd = [
        "hermes",
        "--profile", profile,
        "--non-interactive",
        "--prompt", prompt,
    ]

    log.info(f"Running Hermes: profile={profile}, prompt_len={len(prompt)}")

    try:
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=HERMES_HOME,
        )

        stdout, stderr = await asyncio.wait_for(
            process.communicate(),
            timeout=300,  # 5 minute timeout per agent call
        )

        output = stdout.decode("utf-8", errors="replace").strip()
        if not output and stderr:
            output = f"[ERROR] {stderr.decode('utf-8', errors='replace').strip()}"

        log.info(f"Hermes response: profile={profile}, output_len={len(output)}")
        return output

    except asyncio.TimeoutError:
        log.error(f"Hermes timed out: profile={profile}")
        return "[ERROR] Agent timed out after 5 minutes."
    except FileNotFoundError:
        log.error("Hermes CLI not found on PATH")
        return "[ERROR] Hermes CLI not found. Run setup-hermes.sh first."
    except Exception as e:
        log.error(f"Hermes error: {e}")
        return f"[ERROR] {str(e)}"


def truncate_for_discord(text: str, max_len: int = 1900) -> list[str]:
    """Split long text into Discord-safe chunks (max 2000 chars per message)."""
    if len(text) <= max_len:
        return [text]

    chunks = []
    while text:
        if len(text) <= max_len:
            chunks.append(text)
            break

        # Find a good split point
        split_at = text.rfind("\n", 0, max_len)
        if split_at == -1:
            split_at = max_len

        chunks.append(text[:split_at])
        text = text[split_at:].lstrip("\n")

    return chunks


# ---------------------------------------------------------------------------
# Event Handlers
# ---------------------------------------------------------------------------

@bot.event
async def on_ready():
    log.info(f"Hermes Command Center online as {bot.user}")
    log.info(f"Connected to {len(bot.guilds)} server(s)")
    log.info(f"Listening on channels: {list(CHANNEL_PROFILES.keys())}")


@bot.event
async def on_message(message: discord.Message):
    # Ignore bot messages (prevents infinite loops between agents)
    if message.author.bot:
        return

    # Check if this channel is mapped to a profile
    channel_name = message.channel.name
    profile = CHANNEL_PROFILES.get(channel_name)

    if not profile:
        return  # Not a command channel, ignore

    # Check user permissions
    allowed = get_allowed_users()
    if allowed is not None and str(message.author.id) not in allowed:
        log.warning(f"Unauthorized user {message.author.id} in {channel_name}")
        return

    # Get the prompt
    prompt = message.content.strip()
    if not prompt:
        return

    log.info(
        f"Request: user={message.author.name}, "
        f"channel={channel_name}, profile={profile}, "
        f"prompt={prompt[:80]}..."
    )

    # Show typing indicator while processing
    async with message.channel.typing():
        response = await run_hermes(profile, prompt)

    # Send response in chunks
    chunks = truncate_for_discord(response)
    for chunk in chunks:
        await message.channel.send(chunk)

    # Check if the response contains an image prompt to generate via ChatGPT
    lower_response = response.lower()
    image_prompt_marker = "image prompt:"
    idx = lower_response.find(image_prompt_marker)
    if idx != -1:
        raw_prompt = response[idx + len(image_prompt_marker):].strip()
        # Strip potential brackets or quotes wrapping the prompt
        if raw_prompt.startswith("[") and raw_prompt.endswith("]"):
            raw_prompt = raw_prompt[1:-1].strip()
        elif raw_prompt.startswith("["):
            end_idx = raw_prompt.find("]")
            if end_idx != -1:
                raw_prompt = raw_prompt[1:end_idx].strip()
        
        if (raw_prompt.startswith('"') and raw_prompt.endswith('"')) or (raw_prompt.startswith("'") and raw_prompt.endswith("'")):
            raw_prompt = raw_prompt[1:-1].strip()
            
        if raw_prompt:
            output_file = "/tmp/generated_image.png"
            if os.path.exists(output_file):
                try:
                    os.remove(output_file)
                except Exception as e:
                    log.warning(f"Could not remove old image: {e}")
            
            # Run image generation script using xvfb-run
            cmd = [
                "xvfb-run",
                "--server-args=-screen 0 1280x720x24",
                "/home/franklawrencejr./.hermes/hermes-agent/venv/bin/python",
                os.path.expanduser("~/generate_image.py"),
                raw_prompt,
                output_file
            ]
            
            log.info(f"Triggering image generation: prompt_len={len(raw_prompt)}")
            await message.channel.send("*Generating companion image via ChatGPT...*")
            
            try:
                process = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                )
                stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=300)
                
                if os.path.exists(output_file) and os.path.getsize(output_file) > 5000:
                    log.info("Image generation succeeded, sending to channel")
                    await message.channel.send(file=discord.File(output_file))
                else:
                    err_msg = stderr.decode("utf-8", errors="replace").strip()
                    log.error(f"Image generation failed: {err_msg}")
                    await message.channel.send("[WARNING] Failed to generate or download the image from ChatGPT")
            except Exception as e:
                log.error(f"Error running image generation script: {e}")
                await message.channel.send("[ERROR] Error occurred while executing the image generation script")

    # Also log to the agent's output channel if different
    output_channel_name = OUTPUT_CHANNELS.get(profile)
    if output_channel_name and output_channel_name != channel_name:
        output_channel = discord.utils.get(
            message.guild.text_channels, name=output_channel_name
        )
        if output_channel:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M CT")
            log_msg = (
                f"**[{profile.upper()}]** {timestamp}\n"
                f"**Request:** {prompt[:200]}\n"
                f"**Response:** {response[:1500]}"
            )
            for chunk in truncate_for_discord(log_msg):
                await output_channel.send(chunk)

    # Process commands (if any ! prefixed commands exist)
    await bot.process_commands(message)


# ---------------------------------------------------------------------------
# Utility Commands
# ---------------------------------------------------------------------------

@bot.command(name="agents")
async def list_agents(ctx):
    """List all active agents and their channels."""
    lines = ["**Hermes Command Center — Active Agents**\n"]
    agents = [
        ("Agent Gem", "agent-gem", "#gem-commands", "MiniMax M3", "Orchestrator"),
        ("HecThor", "hecthor", "#hecthor-commands", "MiniMax M3", "Coding"),
        ("Big Venture", "big-venture", "#bigventure-commands", "MiniMax M3", "Research/Writing"),
        ("Lil Neutron", "lil-neutron", "#neutron-commands", "MiniMax M3", "FFC Content"),
        ("Mr. Thinker", "mr-thinker", "#thinker-commands", "MiniMax M3", "AI Study Hall"),
        ("TwoFace", "twoface", "#twoface-commands", "MiniMax M3", "Cloner"),
        ("Paper Agent", "paper-agent", "#paper-commands", "MiniMax M3", "Trading"),
        ("Thoughts of G-Claw", "thoughts-of-gclaw", "#gclaw-commands", "GLM 5.1", "Security/Review"),
        ("Publish Star", "publishstar", "#publishstar-commands", "MiniMax M3", "Content Engine"),
    ]

    for name, profile_id, channel, model, role in agents:
        lines.append(f"**{name}** ({profile_id}) | {channel} | {model} | {role}")

    await ctx.send("\n".join(lines))


@bot.command(name="status")
async def agent_status(ctx):
    """Check if Hermes CLI is responding."""
    try:
        result = subprocess.run(
            ["hermes", "doctor"],
            capture_output=True, text=True, timeout=10,
        )
        status = result.stdout.strip() or result.stderr.strip() or "No output"
        await ctx.send(f"**Hermes Status:**\n```\n{status[:1800]}\n```")
    except Exception as e:
        await ctx.send(f"**Hermes Status:** [ERROR] {str(e)}")


@bot.command(name="profiles")
async def list_profiles(ctx):
    """List Hermes profiles."""
    try:
        result = subprocess.run(
            ["hermes", "profile", "list"],
            capture_output=True, text=True, timeout=10,
        )
        output = result.stdout.strip() or "No profiles found"
        await ctx.send(f"**Hermes Profiles:**\n```\n{output[:1800]}\n```")
    except Exception as e:
        await ctx.send(f"**Profiles:** [ERROR] {str(e)}")


# ---------------------------------------------------------------------------
# Entry Point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    if not DISCORD_BOT_TOKEN:
        print("[FAIL] DISCORD_BOT_TOKEN not set.")
        print("  export DISCORD_BOT_TOKEN='your-bot-token'")
        print("  Or add it to ~/hermes-agents/configs/webhooks.env")
        sys.exit(1)

    os.makedirs(CONFIGS_DIR, exist_ok=True)
    os.makedirs(LOGS_DIR, exist_ok=True)

    log.info("Starting Hermes Command Center Discord bot...")
    bot.run(DISCORD_BOT_TOKEN)
