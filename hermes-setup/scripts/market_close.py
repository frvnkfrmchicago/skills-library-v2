#!/usr/bin/env python3
"""
Paper Agent — Market Close Summary

Runs via cron at 4:15 PM CT on weekdays (15 min after close).
Summarizes the day's market activity, significant movers, and after-hours.

Cron:
    15 16 * * 1-5 cd ~/hermes-agents && ~/.hermes/venv/bin/python scripts/market_close.py >> logs/close.log 2>&1
"""

import os
import sys
import json
import requests
from datetime import datetime

# Reuse shared functions from morning_briefing
sys.path.insert(0, os.path.dirname(__file__))
from morning_briefing import (
    get_webhook_url,
    get_watchlist,
    get_market_data,
    get_news_headlines,
    score_sentiment,
    post_to_discord,
)

DATA_DIR = os.path.expanduser("~/hermes-agents/data")


def format_close_briefing(market_data, scored_headlines):
    """Format the closing briefing."""
    now = datetime.now()
    header = f"**PAPER AGENT — MARKET CLOSE**\n{now.strftime('%A, %B %d, %Y | %I:%M %p CT')}\n"

    config = get_watchlist()

    # DAY SUMMARY
    lines = ["**DAY SUMMARY**"]
    for ticker in config.get("indices", []):
        data = market_data.get(ticker, {})
        if "error" in data:
            continue
        arrow = "+" if data["change_pct"] >= 0 else ""
        lines.append(f"  {ticker}: ${data['price']} ({arrow}{data['change_pct']}%)")

    # SIGNIFICANT MOVES (>3%)
    lines.append("\n**SIGNIFICANT MOVES**")
    significant = []
    for ticker in config.get("watchlist", []):
        data = market_data.get(ticker, {})
        if "error" not in data and abs(data["change_pct"]) > 3:
            significant.append((ticker, data))

    if significant:
        significant.sort(key=lambda x: abs(x[1]["change_pct"]), reverse=True)
        for ticker, data in significant:
            arrow = "+" if data["change_pct"] >= 0 else ""
            lines.append(f"  [!!] {ticker}: ${data['price']} ({arrow}{data['change_pct']}%)")
    else:
        lines.append("  No tickers moved >3% today")

    # FULL WATCHLIST
    lines.append("\n**WATCHLIST CLOSE**")
    watchlist_data = []
    for ticker in config.get("watchlist", []):
        data = market_data.get(ticker, {})
        if "error" not in data:
            watchlist_data.append((ticker, data))

    watchlist_data.sort(key=lambda x: x[1]["change_pct"], reverse=True)
    for ticker, data in watchlist_data:
        arrow = "+" if data["change_pct"] >= 0 else ""
        lines.append(f"  {ticker}: ${data['price']} ({arrow}{data['change_pct']}%)")

    # NEWS RECAP
    lines.append("\n**END-OF-DAY NEWS**")
    if scored_headlines:
        for item in scored_headlines[:5]:
            tag = item["sentiment"]
            lines.append(f"  [{tag}] {item['title']}")
    else:
        lines.append("  No headlines")

    # SENTIMENT
    lines.append("\n**CLOSING SENTIMENT**")
    if scored_headlines:
        avg = sum(h["score"] for h in scored_headlines) / len(scored_headlines)
        mood = "BULLISH" if avg > 0.15 else "BEARISH" if avg < -0.15 else "MIXED"
        lines.append(f"  Market Mood: {mood} (avg: {avg:+.3f})")
    else:
        lines.append("  Insufficient data")

    return header + "\n".join(lines)


def main():
    print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Market close summary starting...")

    webhook_url = get_webhook_url()
    if not webhook_url:
        print("[FAIL] No webhook URL. Set PAPER_BRIEFING_WEBHOOK in ~/hermes-agents/configs/webhooks.env")
        sys.exit(1)

    config = get_watchlist()
    all_tickers = config.get("indices", []) + config.get("watchlist", [])

    print(f"  Pulling close data for {len(all_tickers)} tickers...")
    market_data = get_market_data(all_tickers)

    print(f"  Fetching headlines...")
    headlines = get_news_headlines(config.get("watchlist", []))

    print(f"  Scoring sentiment...")
    scored = score_sentiment(headlines)

    briefing = format_close_briefing(market_data, scored)

    print(f"  Posting to Discord...")
    post_to_discord(webhook_url, briefing)

    data_file = os.path.join(DATA_DIR, f"close_{datetime.now().strftime('%Y%m%d')}.txt")
    with open(data_file, "w") as f:
        f.write(briefing)

    print(f"[DONE] Close summary posted and saved to {data_file}")


if __name__ == "__main__":
    main()
