import os
import sys
import json
import asyncio
import discord

async def main():
    if len(sys.argv) < 2:
        print("Usage: python3 post_to_discord.py <project-name>")
        return

    project_name = sys.argv[1]
    clones_dir = os.path.expanduser("~/hermes-agents/clones")
    project_dir = os.path.join(clones_dir, project_name)

    if not os.path.exists(project_dir):
        print(f"Error: Project directory {project_dir} does not exist.")
        return

    index_path = os.path.join(project_dir, "index.html")
    assets_dir = os.path.join(project_dir, "assets")

    index_size = 0
    if os.path.exists(index_path):
        index_size = os.path.getsize(index_path)

    asset_files = []
    if os.path.exists(assets_dir):
        asset_files = os.listdir(assets_dir)

    num_css = len([f for f in asset_files if f.endswith('.css')])
    num_js = len([f for f in asset_files if f.endswith('.js')])
    num_img = len([f for f in asset_files if f.endswith(('.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif'))])
    num_fonts = len([f for f in asset_files if f.endswith(('.woff', '.woff2', '.ttf', '.otf'))])

    # Format the message
    msg = f"**[TwoFace Cloner Output]**\n"
    msg += f"✅ **Clone Complete for project:** `{project_name}`\n"
    msg += f"📂 **Path:** `~/hermes-agents/clones/{project_name}/`\n"
    msg += f"📄 **index.html:** {index_size / 1024:.1f} KB\n"
    msg += f"📦 **Total Assets:** {len(asset_files)} files\n"
    msg += f"  - CSS: {num_css}\n"
    msg += f"  - JS: {num_js}\n"
    msg += f"  - Images: {num_img}\n"
    msg += f"  - Fonts: {num_fonts}\n\n"
    msg += f"🚀 Preview command: `npx -y serve ~/hermes-agents/clones/{project_name}`\n"

    token = os.environ.get("DISCORD_BOT_TOKEN")
    if not token:
        print("Error: DISCORD_BOT_TOKEN environment variable not set.")
        return

    intents = discord.Intents.default()
    client = discord.Client(intents=intents)

    @client.event
    async def on_ready():
        for guild in client.guilds:
            channel = discord.utils.get(guild.text_channels, name="twoface-output")
            if channel:
                await channel.send(msg)
                print(f"Successfully posted update to #twoface-output")
                break
        await client.close()

    try:
        await client.start(token)
    except Exception as e:
        print(f"Error connecting to Discord: {e}")

if __name__ == "__main__":
    asyncio.run(main())
