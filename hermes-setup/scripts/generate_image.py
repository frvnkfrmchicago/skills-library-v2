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
    
    cookies_path = os.path.expanduser("~/.hermes/chatgpt-session.json")
    if not os.path.exists(cookies_path):
        cookies_path = os.path.expanduser("~/chatgpt_cookies_profile1.json")
    if not os.path.exists(cookies_path):
        # Check workspace/repository root folder
        workspace_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        cookies_path = os.path.join(workspace_root, "chatgpt_cookies_profile1.json")
        
    if not os.path.exists(cookies_path):
        # Fallback to specific linux/mac absolute paths just in case
        paths_to_check = [
            "/Users/franklawrencejr./.hermes/chatgpt-session.json",
            "/Users/franklawrencejr./chatgpt_cookies_profile1.json",
            "/home/franklawrencejr./.hermes/chatgpt-session.json",
            "/home/franklawrencejr./chatgpt_cookies_profile1.json"
        ]
        for p in paths_to_check:
            if os.path.exists(p):
                cookies_path = p
                break
                
    if not os.path.exists(cookies_path):
        print(f"Error: Cookies file not found (checked ~/.hermes/chatgpt-session.json, ~/chatgpt_cookies_profile1.json, etc.)")
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
        
        print("Navigating to chatgpt.com...")
        page.goto("https://chatgpt.com/", timeout=60000)
        print(f"Page title: {page.title()}")
        
        time.sleep(5)
        
        try:
            div = page.query_selector('div[contenteditable="true"]')
            if not div:
                print("Could not find contenteditable div")
                sys.exit(1)
                
            div.click()
            div.fill(prompt)
            print("Prompt entered")
            
            submit_button = "button[data-testid='send-button']"
            page.wait_for_selector(submit_button, timeout=10000)
            page.click(submit_button)
            print("Prompt submitted")
            
            print("Waiting for generation to finish...")
            time.sleep(5)
            
            page.wait_for_selector("button[data-testid='stop-button']", state="hidden", timeout=180000)
            print("Generation finished!")
            
            chatgpt_img = None
            images = page.locator("img").all()
            for img in images:
                src = img.get_attribute("src") or ""
                if "backend-api/estuary/content" in src:
                    chatgpt_img = src
            
            if chatgpt_img:
                print(f"Found image URL: {chatgpt_img[:120]}...")
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
                    }""", chatgpt_img)
                    
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
                page.screenshot(path="/tmp/chatgpt_error_screenshot.png")
                with open("/tmp/chatgpt_error_page.html", "w") as f:
                    f.write(page.content())
                print("Could not find generated image")
                sys.exit(1)
                
        except Exception as e:
            page.screenshot(path="/tmp/chatgpt_error_screenshot.png")
            try:
                with open("/tmp/chatgpt_error_page.html", "w") as f:
                    f.write(page.content())
            except Exception as ex:
                print(f"Could not save HTML: {ex}")
            print(f"Error: {e}")
            sys.exit(1)
            
        browser.close()

if __name__ == '__main__':
    main()
