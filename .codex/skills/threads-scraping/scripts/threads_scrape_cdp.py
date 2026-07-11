#!/usr/bin/env python3
"""Attach to Frank's visible Chrome on CDP 9222 and scrape Threads API responses.

This is the CDP variant of threads_scrape.py. Instead of launching a new browser,
it connects to the already-open Chrome session. Use when the user has Threads
signed in and visible on their screen.

Usage:
    /opt/anaconda3/bin/python3 ~/hermes-agents/scripts/threads_scrape_cdp.py \
      --account grazzhopper --vertical cannabis --scrolls 6

See threads-scraping SKILL.md for full documentation.
"""
from __future__ import annotations

import argparse
import json
import time
from pathlib import Path
from typing import Any

from playwright.sync_api import sync_playwright

REAL_HOME = Path("/Users/franklawrencejr.")
THREADS_DIR = REAL_HOME / ".hermes" / "threads"
VERTICALS_DIR = THREADS_DIR / "verticals"
CACHE_DIR = THREADS_DIR / "cache"


def _merge_vertical_list(vertical: dict[str, Any], key: str, additions: list[str]) -> None:
    if not additions:
        return
    merged = list(vertical.get(key, []))
    merged.extend(additions)
    vertical[key] = list(dict.fromkeys(str(item) for item in merged if item))


def ensure_default_vertical(name: str) -> None:
    VERTICALS_DIR.mkdir(parents=True, exist_ok=True)
    path = VERTICALS_DIR / f"{name}.json"
    if path.exists() or name != "cannabis":
        return
    path.write_text(json.dumps({
        "name": "cannabis",
        "description": "Cannabis culture, legalization, products, and lifestyle",
        "keywords": [
            "weed", "cannabis", "marijuana", "blunt", "smoke", "smoking", "stoner",
            "420", "dispensary", "edibles", "gummies", "thc", "cbd", "joint", "bong",
            "dab", "high", "sativa", "indica", "kush", "strain", "terpene", "flower",
            "pre-roll", "preroll", "hash", "hemp", "budtender", "natures flower",
            "stonerthreads"
        ],
        "match_mode": "any",
        "match_fields": ["text", "username"]
    }, indent=2))


def load_vertical(name: str | None, extra_keywords: list[str] | None = None) -> dict[str, Any] | None:
    if not name:
        return None
    ensure_default_vertical(name)
    path = VERTICALS_DIR / f"{name}.json"
    if not path.exists():
        raise FileNotFoundError(f"Vertical not found: {path}")
    vertical = json.loads(path.read_text())
    local_path = VERTICALS_DIR / f"{name}.local.json"
    if local_path.exists():
        overlay = json.loads(local_path.read_text())
        _merge_vertical_list(vertical, "keywords", overlay.get("keywords", []))
        _merge_vertical_list(vertical, "keywords", overlay.get("extra_keywords", []))
        _merge_vertical_list(vertical, "strain_names", overlay.get("strain_names", []))
        _merge_vertical_list(vertical, "strain_names", overlay.get("extra_strain_names", []))
        if overlay.get("match_fields"):
            vertical["match_fields"] = overlay["match_fields"]
    _merge_vertical_list(vertical, "keywords", extra_keywords or [])
    return vertical


def time_ago(epoch: int | float | None) -> str:
    if not epoch:
        return "?"
    diff = time.time() - float(epoch)
    if diff < 60:
        return f"{int(diff)}s ago"
    if diff < 3600:
        return f"{int(diff / 60)}m ago"
    if diff < 86400:
        return f"{int(diff / 3600)}h ago"
    return f"{int(diff / 86400)}d ago"


def keyword_hits(blob: str, keywords: list[Any], match_mode: str) -> bool:
    import re
    text_lower = blob.lower()
    def hit(kw: str) -> bool:
        kw_lower = kw.lower().strip()
        if not kw_lower:
            return False
        if kw_lower.replace("_", "").isalnum():
            return bool(re.search(r"\b" + re.escape(kw_lower) + r"\b", text_lower))
        return kw_lower in text_lower
    return all(hit(str(k)) for k in keywords) if match_mode == "all" else any(hit(str(k)) for k in keywords)


def matches_vertical(text: str, username: str, vertical: dict[str, Any] | None) -> bool:
    if not vertical:
        return True
    fields = vertical.get("match_fields", ["text"])
    blobs = []
    if "text" in fields:
        blobs.append(text)
    if "username" in fields:
        blobs.append(username)
    keywords = vertical.get("keywords", [])
    strains = vertical.get("strain_names", [])
    for blob in blobs or [text]:
        lower = blob.lower()
        if any(str(s).strip().lower() in lower for s in strains if len(str(s).strip()) >= 3):
            return True
        if keywords and keyword_hits(blob, keywords, vertical.get("match_mode", "any")):
            return True
    return False


def extract_posts(api_data: list[Any], vertical: dict[str, Any] | None) -> list[dict[str, Any]]:
    seen: set[str] = set()
    posts: list[dict[str, Any]] = []
    def visit(obj: Any, depth: int = 0) -> None:
        if depth > 14 or not obj:
            return
        if isinstance(obj, dict):
            if "like_count" in obj and isinstance(obj.get("user"), dict):
                user = obj.get("user") or {}
                caption = obj.get("caption")
                text = caption.get("text", "") if isinstance(caption, dict) else (obj.get("text") or "")
                username = user.get("username", "")
                info = obj.get("text_post_app_info") or {}
                code = obj.get("code", "")
                key = f"{username}:{code or text[:60]}"
                if text and username and key not in seen:
                    seen.add(key)
                    post = {
                        "username": username,
                        "text": text[:500],
                        "likes": obj.get("like_count", 0),
                        "replies": info.get("direct_reply_count", 0),
                        "reposts": info.get("repost_count", 0),
                        "quotes": info.get("quote_count", 0),
                        "shares": info.get("share_count", 0),
                        "taken_at": obj.get("taken_at", 0),
                        "time_ago": time_ago(obj.get("taken_at", 0)),
                        "code": code,
                        "link": f"https://www.threads.net/@{username}/post/{code}" if code else "",
                    }
                    if matches_vertical(post["text"], username, vertical):
                        posts.append(post)
            for value in obj.values():
                visit(value, depth + 1)
        elif isinstance(obj, list):
            for item in obj:
                visit(item, depth + 1)
    for body in api_data:
        visit(body)
    posts.sort(key=lambda p: p.get("taken_at") or 0, reverse=True)
    return posts


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--account", default="frvnkfrmchicago")
    ap.add_argument("--vertical", default="cannabis")
    ap.add_argument("--scrolls", type=int, default=6)
    ap.add_argument("--cdp", default="http://127.0.0.1:9222")
    ap.add_argument("--keyword", action="append", default=[])
    ap.add_argument("--output", choices=["json", "text"], default="text")
    args = ap.parse_args()

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    vertical = load_vertical(args.vertical, args.keyword)
    api_data: list[Any] = []
    started = time.time()

    def on_response(response) -> None:
        try:
            ct = response.headers.get("content-type", "")
            url = response.url
            if "json" not in ct and not any(x in url for x in ["graphql", "api", "query"]):
                return
            body = response.json()
            raw = json.dumps(body)
            if "like_count" in raw and "username" in raw:
                api_data.append(body)
        except Exception:
            return

    with sync_playwright() as p:
        browser = p.chromium.connect_over_cdp(args.cdp)
        contexts = browser.contexts
        pages = [pg for ctx in contexts for pg in ctx.pages]
        page = next((pg for pg in pages if "threads." in pg.url), None)
        if page is None:
            ctx = contexts[0] if contexts else browser.new_context()
            page = ctx.new_page()
            page.goto("https://www.threads.net/", wait_until="domcontentloaded", timeout=30000)
        page.on("response", on_response)
        if "threads." not in page.url:
            page.goto("https://www.threads.net/", wait_until="domcontentloaded", timeout=30000)
        else:
            try:
                page.reload(wait_until="domcontentloaded", timeout=30000)
            except Exception as reload_err:
                print(f"Reload failed ({reload_err}), navigating instead...")
                page.goto("https://www.threads.net/", wait_until="domcontentloaded", timeout=30000)
        try:
            page.wait_for_timeout(6000)
            for _ in range(args.scrolls):
                page.mouse.wheel(0, 1600)
                page.wait_for_timeout(3000)
        except Exception as scroll_err:
            # CDP reload can invalidate the page handle — grab a fresh one
            print(f"Scroll interrupted ({scroll_err}), reconnecting...")
            try:
                browser.close()
            except Exception:
                pass
            browser = p.chromium.connect_over_cdp(args.cdp)
            contexts = browser.contexts
            pages = [pg for ctx in contexts for pg in ctx.pages]
            page = next((pg for pg in pages if "threads." in pg.url), None)
            if page is None:
                ctx = contexts[0] if contexts else browser.new_context()
                page = ctx.new_page()
                page.goto("https://www.threads.net/", wait_until="domcontentloaded", timeout=30000)
            remaining = args.scrolls // 2
            page.wait_for_timeout(3000)
            for _ in range(remaining):
                page.mouse.wheel(0, 1600)
                page.wait_for_timeout(3000)
        final_url = page.url
        title = page.title()
        posts = extract_posts(api_data, vertical)
        vertical_fallback = False
        if vertical and not posts and api_data:
            posts = extract_posts(api_data, None)
            vertical_fallback = True
        try:
            browser.close()
        except Exception:
            pass

    cache_path = CACHE_DIR / f"{args.account}_feed.json"
    cache_path.write_text(json.dumps(posts, indent=2))

    # --- Supabase Ingest ---
    # POST scraped posts to the Content Hub pipeline if ANON_KEY is available
    ingest_status = "SKIPPED"
    ingest_stored = 0
    try:
        env_local = REAL_HOME / "Documents" / "Automation Centre" / "grazzhopper-content-hub" / ".env.local"
        if env_local.exists():
            env_text = env_local.read_text()
            anon_key = ""
            for line in env_text.splitlines():
                if line.startswith("SUPABASE_ANON_KEY="):
                    anon_key = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break
            if anon_key:
                sb_url = ""
                for line in env_text.splitlines():
                    if line.startswith("SUPABASE_URL="):
                        sb_url = line.split("=", 1)[1].strip().strip('"').strip("'")
                        break
                if sb_url and posts:
                    import urllib.request
                    ingest_url = f"{sb_url}/functions/v1/threads-scrape-ingest?action=ingest"
                    payload = json.dumps({
                        "keyword": args.vertical,
                        "captured_by": f"cdp-scraper-{args.account}",
                        "results": [
                            {
                                "author": f"@{p['username']}",
                                "text": p["text"],
                                "permalink": p["link"],
                            }
                            for p in posts
                        ],
                    }).encode()
                    req = urllib.request.Request(
                        ingest_url,
                        data=payload,
                        headers={
                            "Content-Type": "application/json",
                            "apikey": anon_key,
                            "Authorization": f"Bearer {anon_key}",
                            "x-ingest-key": "ghscrape_2026_t9x4m2k7",
                        },
                    )
                    with urllib.request.urlopen(req, timeout=15) as resp:
                        result = json.loads(resp.read())
                        ingest_status = result.get("ok") and "OK" or "FAILED"
                        ingest_stored = result.get("stored", 0)
    except Exception as ingest_err:
        ingest_status = f"ERROR: {ingest_err}"

    base = {
        "ingest_status": ingest_status,
        "ingest_stored": ingest_stored,
        "account": args.account,
        "vertical": args.vertical,
        "status": "HEALTHY" if posts else "NO_POSTS_FOUND",
        "post_count": len(posts),
        "api_response_count": len(api_data),
        "final_url": final_url,
        "title": title,
        "seconds": round(time.time() - started, 1),
        "cache_file": str(cache_path),
        "vertical_fallback": vertical_fallback,
        "sample_usernames": [p["username"] for p in posts[:10]],
    }
    if args.output == "json":
        base["posts"] = posts
    print(json.dumps(base, indent=2))
    if args.output == "text":
        for post in posts[:15]:
            print(f"\n@{post['username']} ({post['time_ago']})")
            print(f"  {post['text'][:220]}")
            print(
                "  "
                f"likes={post['likes']} replies={post['replies']} "
                f"reposts={post['reposts']} quotes={post['quotes']} shares={post['shares']}"
            )
            print(f"  {post['link']}")
    return 0 if posts else 2


if __name__ == "__main__":
    raise SystemExit(main())
