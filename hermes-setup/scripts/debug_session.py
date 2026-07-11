import asyncio
import json
import os
import sys

async def main():
    profile = sys.argv[1] if len(sys.argv) > 1 else 'grazzhopper'
    session_file = os.path.expanduser(f'~/.hermes/threads/sessions/{profile}.json')
    if not os.path.exists(session_file):
        print(f"Profile {profile} not found.")
        return

    with open(session_file) as f:
        session = json.load(f)
    cookies = session.get('cookies', [])
    print(f"Loaded {len(cookies)} cookies.")

    from camoufox.async_api import AsyncCamoufox
    async with AsyncCamoufox(headless=True) as browser:
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 900},
            locale='en-US', timezone_id='America/Chicago'
        )
        await context.add_cookies(cookies)
        page = await context.new_page()
        print("Navigating to threads.net...")
        await page.goto('https://www.threads.net/', wait_until='networkidle', timeout=45000)
        await asyncio.sleep(5)
        print(f"Current URL: {page.url}")
        print(f"Page Title: {await page.title()}")
        
        content = await page.content()
        # Heuristics for login detection
        has_login_button = "Log in" in content or "Log In" in content
        print(f"Has login button in content: {has_login_button}")
        
        screenshot_path = os.path.expanduser(f'~/.hermes/threads/cache/{profile}_debug.png')
        await page.screenshot(path=screenshot_path)
        print(f"Saved screenshot to {screenshot_path}")

if __name__ == '__main__':
    asyncio.run(main())
