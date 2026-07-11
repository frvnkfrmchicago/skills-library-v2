import os
import sys
import json
import time
import base64
from playwright.sync_api import sync_playwright

def main():
    prompt = None
    output_path = "/home/franklawrencejr./.hermes/profiles/lil-neutron/cron/output/generated_image.png"
    
    if len(sys.argv) >= 2:
        arg1 = sys.argv[1]
        if os.path.exists(arg1):
            print(f"Reading prompt from file: {arg1}")
            with open(arg1, "r", encoding="utf-8") as f:
                prompt = f.read().strip()
        else:
            prompt = arg1
            
        if len(sys.argv) > 2:
            output_path = sys.argv[2]
    else:
        default_paths = [
            os.path.expanduser("~/prompt.txt"),
            os.path.expanduser("~/image_prompt.txt"),
            "./prompt.txt",
            "./image_prompt.txt"
        ]
        for path in default_paths:
            if os.path.exists(path):
                print(f"Reading prompt from default file: {path}")
                with open(path, "r", encoding="utf-8") as f:
                    prompt = f.read().strip()
                break
                
    if not prompt:
        print("Error: No prompt provided. Provide a string argument or create a prompt.txt file.")
        sys.exit(1)
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    cookies_path = "/home/franklawrencejr./.hermes/gemini-session.json"
    if not os.path.exists(cookies_path):
        cookies_path = "/home/franklawrencejr./gemini_cookies_profile1.json"
        
    if not os.path.exists(cookies_path):
        # Local Mac context fallback
        cookies_path = os.path.expanduser("~/Downloads/skills-library-v2 2/gemini_cookies_profile1.json")
        
    if not os.path.exists(cookies_path):
        print(f"Error: Cookies file not found at {cookies_path}")
        sys.exit(1)
        
    with open(cookies_path) as f:
        data = json.load(f)
        
    if isinstance(data, dict):
        cookies = data.get('cookies', [])
    else:
        cookies = data
        
    print(f"Loaded {len(cookies)} cookies")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-blink-features=AutomationControlled"
            ]
        )
        
        context = browser.new_context(
            user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 720}
        )
        
        context.add_cookies(cookies)
        
        page = context.new_page()
        
        print("Navigating to gemini.google.com...")
        page.goto("https://gemini.google.com/app", timeout=60000)
        print(f"Page title: {page.title()}")
        
        time.sleep(5)
        
        try:
            # Find the input box. Gemini uses a div with contenteditable="true" or role="textbox"
            div = page.query_selector('div[contenteditable="true"]') or page.query_selector('[role="textbox"]')
            if not div:
                print("Could not find contenteditable div or textbox")
                sys.exit(1)
                
            div.click()
            div.fill(prompt)
            print("Prompt entered")
            
            # Find submit button. Typically aria-label matches "Send" or class send-button
            submit_button = page.query_selector('button[aria-label*="Send"]') or page.query_selector('button.send-button')
            if submit_button:
                submit_button.click()
                print("Clicked submit button")
            else:
                page.keyboard.press("Enter")
                print("Pressed Enter key to submit")
                
            print("Waiting for image generation to complete...")
            time.sleep(5)
            
            gemini_img = None
            # Poll for the generated image URL for up to 90 seconds
            for attempt in range(45):
                time.sleep(2)
                images = page.locator("img").all()
                for img in images:
                    src = img.get_attribute("src") or ""
                    # Gemini generated images use googleusercontent with image_generation_content
                    if "image_generation_content" in src or ("googleusercontent.com" in src and "avatar" not in src.lower() and "profile" not in src.lower() and "lh3.google" in src):
                        gemini_img = src
                        break
                if gemini_img:
                    break
            
            if gemini_img:
                print(f"Found generated image URL: {gemini_img[:120]}...")
                try:
                    print("Downloading image via page fetch...")
                    img_data = page.evaluate("""async (url) => {
                        const r = await fetch(url);
                        const blob = await r.blob();
                        return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        });
                    }""", gemini_img)
                    
                    header, base64_data = img_data.split(",", 1)
                    with open(output_path, "wb") as f:
                        f.write(base64.b64decode(base64_data))
                        
                    print(f"Image saved to: {output_path}")
                    size = os.path.getsize(output_path)
                    print(f"File size: {size} bytes")
                    
                    if size > 5000:
                        print("SUCCESS: Image downloaded successfully")
                        print(f"OUTPUT_PATH: {output_path}")
                    else:
                        print(f"ERROR: Downloaded file too small ({size} bytes)")
                        sys.exit(1)
                except Exception as e:
                    print(f"Download error: {e}")
                    sys.exit(1)
            else:
                page.screenshot(path="/tmp/gemini_error_screenshot.png")
                with open("/tmp/gemini_error_page.html", "w") as f:
                    f.write(page.content())
                print("Could not find generated image. Saved debug screenshot/HTML to /tmp/")
                sys.exit(1)
                
        except Exception as e:
            page.screenshot(path="/tmp/gemini_error_screenshot.png")
            try:
                with open("/tmp/gemini_error_page.html", "w") as f:
                    f.write(page.content())
            except Exception as ex:
                print(f"Could not save HTML: {ex}")
            print(f"Error: {e}")
            sys.exit(1)
            
        browser.close()

if __name__ == '__main__':
    main()
