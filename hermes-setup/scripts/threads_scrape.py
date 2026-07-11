#!/usr/bin/env python3
"""Threads feed scraper and session health check for Hermes.

Validates Threads the way the working flow actually works: load cookies, open
the feed, intercept JSON API responses, and count parsed post objects.

Cookie files can be either:
- raw Playwright cookie arrays at ~/.hermes/threads/sessions/<account>.json
- Playwright storage-state objects with a top-level "cookies" key
"""

from __future__ import annotations

import argparse
import json
import os
import time
from pathlib import Path
from typing import Any

from playwright.sync_api import sync_playwright


HERMES_DIR = Path.home() / ".hermes"
THREADS_DIR = HERMES_DIR / "threads"
SESSIONS_DIR = THREADS_DIR / "sessions"
VERTICALS_DIR = THREADS_DIR / "verticals"
CACHE_DIR = THREADS_DIR / "cache"
DEFAULT_URL = "https://www.threads.net/"
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/148.0.0.0 Safari/537.36"
)


def load_session_file(path: Path) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    data = json.loads(path.read_text())
    if isinstance(data, list):
        cookies = data
        meta = {"format": "raw-cookie-list"}
    elif isinstance(data, dict) and isinstance(data.get("cookies"), list):
        cookies = data["cookies"]
        meta = {"format": "playwright-storage-state"}
    else:
        raise ValueError(f"Unsupported cookie file format: {path}")

    prepared = []
    for cookie in cookies:
        item = {
            "name": cookie["name"],
            "value": cookie["value"],
            "domain": cookie["domain"],
            "path": cookie.get("path", "/"),
            "secure": cookie.get("secure", True),
            "httpOnly": cookie.get("httpOnly", False),
        }
        expires = cookie.get("expires", -1)
        if isinstance(expires, (int, float)) and expires > 0:
            item["expires"] = expires
        same_site = cookie.get("sameSite")
        if same_site in {"Strict", "Lax", "None"}:
            item["sameSite"] = same_site
        prepared.append(item)

    meta["cookie_count"] = len(prepared)
    meta["domains"] = sorted({c.get("domain", "") for c in prepared})
    return prepared, meta


def session_path(account: str | None, explicit: str | None) -> Path:
    if explicit:
        return Path(explicit).expanduser()
    if account:
        return SESSIONS_DIR / f"{account}.json"
    fallback = HERMES_DIR / "threads-session.json"
    if fallback.exists():
        return fallback
    raise FileNotFoundError("Pass --account or --session-file")


def check_cookie_health(cookies: list[dict[str, Any]]) -> dict[str, Any]:
    now = time.time()
    names = {c.get("name") for c in cookies}
    required = ["sessionid", "csrftoken", "ds_user_id"]
    missing = [name for name in required if name not in names]
    session = next((c for c in cookies if c.get("name") == "sessionid"), None)
    expires = session.get("expires") if session else None
    days_left = None
    if isinstance(expires, (int, float)) and expires > 0:
        days_left = round((expires - now) / 86400, 1)
    status = "HEALTHY"
    if missing:
        status = "MISSING_REQUIRED_COOKIES"
    if days_left is not None and days_left < 0:
        status = "SESSION_EXPIRED"
    elif days_left is not None and days_left < 7:
        status = "EXPIRING_SOON"
    return {
        "status": status,
        "required_present": {name: name in names for name in required},
        "session_days_left": days_left,
    }


def load_vertical(name: str | None, extra_keywords: list[str] | None = None) -> dict[str, Any] | None:
    if not name:
        return None
    path = VERTICALS_DIR / f"{name}.json"
    if not path.exists():
        raise FileNotFoundError(f"Vertical not found: {path}")
    vertical = json.loads(path.read_text())
    local_path = VERTICALS_DIR / f"{name}.local.json"
    if local_path.exists():
        overlay = json.loads(local_path.read_text())
        merged = list(vertical.get("keywords", []))
        merged.extend(overlay.get("keywords", []))
        merged.extend(overlay.get("extra_keywords", []))
        vertical["keywords"] = list(dict.fromkeys(str(k) for k in merged if k))
        if overlay.get("match_fields"):
            vertical["match_fields"] = overlay["match_fields"]
    if extra_keywords:
        merged = list(vertical.get("keywords", []))
        merged.extend(extra_keywords)
        vertical["keywords"] = list(dict.fromkeys(str(k) for k in merged if k))
    return vertical


def _keyword_hits(blob: str, keywords: list[Any], match_mode: str) -> bool:
    import re

    text_lower = blob.lower()

    def keyword_in_text(kw: str) -> bool:
        kw_lower = kw.lower()
        if kw_lower.isalnum():
            pattern = r"\b" + re.escape(kw_lower) + r"\b"
            return bool(re.search(pattern, text_lower))
        return kw_lower in text_lower

    if match_mode == "all":
        return all(keyword_in_text(str(keyword)) for keyword in keywords)
    return any(keyword_in_text(str(keyword)) for keyword in keywords)


def matches_vertical(
    text: str,
    vertical: dict[str, Any] | None,
    *,
    username: str = "",
) -> bool:
    if not vertical:
        return True
    keywords = vertical.get("keywords", [])
    match_mode = vertical.get("match_mode", "any")
    fields = vertical.get("match_fields", ["text"])
    blobs: list[str] = []
    if "text" in fields:
        blobs.append(text)
    if "username" in fields and username:
        blobs.append(username)
    if not blobs:
        blobs.append(text)
    return any(_keyword_hits(blob, keywords, match_mode) for blob in blobs)



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


def extract_posts(api_data: list[Any], vertical: dict[str, Any] | None) -> list[dict[str, Any]]:
    seen: set[str] = set()
    posts: list[dict[str, Any]] = []

    def visit(obj: Any, depth: int = 0) -> None:
        if depth > 12 or not obj:
            return
        if isinstance(obj, dict):
            if "like_count" in obj and isinstance(obj.get("user"), dict):
                user = obj["user"]
                caption = obj.get("caption")
                text = caption.get("text", "") if isinstance(caption, dict) else ""
                username = user.get("username", "")
                info = obj.get("text_post_app_info") or {}
                code = obj.get("code", "")
                key = f"{username}:{code}"
                if text and username and code and key not in seen:
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
                        "link": f"https://www.threads.net/@{username}/post/{code}",
                    }
                    if matches_vertical(post["text"], vertical, username=username):
                        posts.append(post)
            for value in obj.values():
                visit(value, depth + 1)
        elif isinstance(obj, list):
            for item in obj:
                visit(item, depth + 1)

    for body in api_data:
        visit(body)

    posts.sort(key=lambda item: item.get("taken_at") or 0, reverse=True)
    return posts


def scrape_feed(
    cookies: list[dict[str, Any]],
    scrolls: int,
    vertical_name: str | None,
    headed: bool,
    url: str,
    extra_keywords: list[str] | None = None,
) -> dict[str, Any]:
    vertical = load_vertical(vertical_name, extra_keywords=extra_keywords)
    api_data: list[Any] = []

    def on_response(response) -> None:
        try:
            content_type = response.headers.get("content-type", "")
            if "json" not in content_type:
                return
            body = response.json()
            raw = json.dumps(body)
            if "like_count" in raw and "username" in raw:
                api_data.append(body)
        except Exception:
            return

    started = time.time()
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=not headed,
            args=["--no-sandbox", "--disable-blink-features=AutomationControlled"],
        )
        context = browser.new_context(
            user_agent=USER_AGENT,
            viewport={"width": 1280, "height": 900},
            locale="en-US",
            timezone_id="America/Chicago",
        )
        context.add_cookies(cookies)
        page = context.new_page()
        page.on("response", on_response)
        page.goto(url, wait_until="domcontentloaded", timeout=30_000)
        page.wait_for_timeout(8_000)
        for _ in range(scrolls):
            page.mouse.wheel(0, 1500)
            page.wait_for_timeout(3_000)
        final_url = page.url
        title = page.title()
        posts = extract_posts(api_data, vertical)
        vertical_fallback = False
        if vertical and not posts and api_data:
            posts = extract_posts(api_data, None)
            vertical_fallback = bool(posts)
        context.close()
        browser.close()

    status = "HEALTHY" if posts else "NO_POSTS_FOUND"
    if vertical_fallback:
        status = "HEALTHY_UNFILTERED_FALLBACK"

    return {
        "status": status,
        "post_count": len(posts),
        "api_response_count": len(api_data),
        "final_url": final_url,
        "title": title,
        "seconds": round(time.time() - started, 1),
        "sample_usernames": [post["username"] for post in posts[:10]],
        "vertical_fallback": vertical_fallback,
        "vertical": vertical.get("name") if vertical else None,
        "posts": posts,
    }


def ensure_dirs() -> None:
    SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
    VERTICALS_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--account", help="Account name under ~/.hermes/threads/sessions")
    parser.add_argument("--session-file", help="Explicit cookie or storage-state JSON path")
    parser.add_argument("--scrolls", type=int, default=4)
    parser.add_argument("--vertical")
    parser.add_argument(
        "--keyword",
        action="append",
        default=[],
        help="Extra match keyword for this run (repeatable). Persist long-term in <vertical>.local.json",
    )
    parser.add_argument("--url", default=DEFAULT_URL)
    parser.add_argument("--headed", action="store_true")
    parser.add_argument("--status-only", action="store_true")
    parser.add_argument("--output", choices=["json", "text"], default="text")
    args = parser.parse_args()

    ensure_dirs()
    path = session_path(args.account, args.session_file)
    cookies, meta = load_session_file(path)
    health = check_cookie_health(cookies)

    base = {
        "account": args.account,
        "session_file": str(path),
        "session": meta,
        "cookie_health": health,
    }

    if args.status_only:
        print(json.dumps(base, indent=2))
        return 0

    result = scrape_feed(
        cookies,
        args.scrolls,
        args.vertical,
        args.headed,
        args.url,
        extra_keywords=args.keyword or None,
    )
    base.update({k: v for k, v in result.items() if k != "posts"})

    cache_name = args.account or path.stem
    cache_path = CACHE_DIR / f"{cache_name}_feed.json"
    cache_path.write_text(json.dumps(result["posts"], indent=2))
    base["cache_file"] = str(cache_path)

    if args.output == "json":
        base["posts"] = result["posts"]
        print(json.dumps(base, indent=2))
    else:
        print(json.dumps(base, indent=2))
        for post in result["posts"][:10]:
            print()
            print(f"@{post['username']} ({post['time_ago']})")
            print(f"  {post['text'][:220]}")
            print(
                "  "
                f"likes={post['likes']} replies={post['replies']} "
                f"reposts={post['reposts']} quotes={post['quotes']} shares={post['shares']}"
            )
            print(f"  {post['link']}")
    return 0 if result["posts"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
