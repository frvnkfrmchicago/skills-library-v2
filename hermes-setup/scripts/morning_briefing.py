#!/usr/bin/env python3
"""
Paper Agent — Morning Market Briefing

Runs via cron at 8:30 AM CT on weekdays.
Pulls pre-market data, news headlines, and sentiment scores.
Posts structured briefing to Discord via webhook.

Cron:
    30 8 * * 1-5 cd ~/hermes-agents && ~/.hermes/venv/bin/python scripts/morning_briefing.py >> logs/briefing.log 2>&1
"""

import os
import sys
import json
import requests
from datetime import datetime, timedelta

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

CONFIGS_DIR = os.path.expanduser("~/hermes-agents/configs")
DATA_DIR = os.path.expanduser("~/hermes-agents/data")

os.makedirs(DATA_DIR, exist_ok=True)

# Load webhook URL
def get_webhook_url():
    """Load the Paper Agent webhook from configs."""
    env_file = os.path.join(CONFIGS_DIR, "webhooks.env")
    if os.path.exists(env_file):
        with open(env_file) as f:
            for line in f:
                if line.startswith("PAPER_BRIEFING_WEBHOOK="):
                    return line.split("=", 1)[1].strip()
    return os.environ.get("PAPER_BRIEFING_WEBHOOK")


def get_watchlist():
    """Load watchlist tickers from configs."""
    watchlist_file = os.path.join(CONFIGS_DIR, "watchlist.json")
    if os.path.exists(watchlist_file):
        with open(watchlist_file) as f:
            return json.load(f)
    # Default watchlist
    return {
        "indices": ["^GSPC", "^DJI", "^IXIC", "^VIX"],
        "watchlist": ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META"],
    }


# ---------------------------------------------------------------------------
# Data Collection
# ---------------------------------------------------------------------------

def get_market_data(tickers):
    """Pull current price data via yfinance."""
    try:
        import yfinance as yf
    except ImportError:
        return {"error": "yfinance not installed. Run: pip install yfinance"}

    results = {}
    for ticker in tickers:
        try:
            stock = yf.Ticker(ticker)
            info = stock.fast_info
            hist = stock.history(period="2d")

            if len(hist) >= 2:
                prev_close = hist["Close"].iloc[-2]
                current = hist["Close"].iloc[-1]
                change_pct = ((current - prev_close) / prev_close) * 100
            elif len(hist) == 1:
                current = hist["Close"].iloc[-1]
                change_pct = 0.0
                prev_close = current
            else:
                continue

            results[ticker] = {
                "price": round(current, 2),
                "change_pct": round(change_pct, 2),
                "prev_close": round(prev_close, 2),
            }
        except Exception as e:
            results[ticker] = {"error": str(e)}

    return results


def get_news_headlines(tickers):
    """Pull news headlines via yfinance."""
    try:
        import yfinance as yf
    except ImportError:
        return []

    headlines = []
    for ticker in tickers[:5]:  # Limit to top 5 to avoid rate limits
        try:
            stock = yf.Ticker(ticker)
            news = stock.news
            if news:
                for item in news[:3]:
                    headlines.append({
                        "title": item.get("title", ""),
                        "publisher": item.get("publisher", ""),
                        "ticker": ticker,
                        "link": item.get("link", ""),
                    })
        except Exception:
            pass

    return headlines


def score_sentiment(headlines):
    """Score headline sentiment using FinBERT or fallback to keyword analysis."""
    scored = []

    # Try FinBERT first
    try:
        from transformers import pipeline
        classifier = pipeline(
            "text-classification",
            model="ProsusAI/finbert",
            top_k=None,
            device=-1,  # CPU
        )

        for item in headlines:
            title = item["title"]
            if not title:
                continue

            result = classifier(title[:512])[0]
            sentiment_map = {r["label"]: round(r["score"], 3) for r in result}

            # Net score: positive - negative
            pos = sentiment_map.get("positive", 0)
            neg = sentiment_map.get("negative", 0)
            net = round(pos - neg, 3)

            scored.append({
                **item,
                "sentiment": "BULLISH" if net > 0.3 else "BEARISH" if net < -0.3 else "NEUTRAL",
                "score": net,
            })

        return scored

    except Exception:
        pass

    # Fallback: keyword-based scoring
    bullish_words = ["surge", "rally", "beat", "gain", "high", "up", "rise", "jump", "soar", "boost"]
    bearish_words = ["drop", "fall", "crash", "loss", "down", "decline", "plunge", "sell", "cut", "fear"]

    for item in headlines:
        title = item["title"].lower()
        bull = sum(1 for w in bullish_words if w in title)
        bear = sum(1 for w in bearish_words if w in title)
        net = (bull - bear) / max(bull + bear, 1)

        scored.append({
            **item,
            "sentiment": "BULLISH" if net > 0 else "BEARISH" if net < 0 else "NEUTRAL",
            "score": round(net, 2),
        })

    return scored


def get_earnings_today():
    """Check for earnings reports scheduled today."""
    try:
        import yfinance as yf
        # yfinance doesn't have a dedicated earnings calendar endpoint,
        # so we check each watchlist ticker
        config = get_watchlist()
        earnings = []

        for ticker in config.get("watchlist", []):
            try:
                stock = yf.Ticker(ticker)
                cal = stock.calendar
                if cal is not None and not cal.empty:
                    if "Earnings Date" in cal.index:
                        earn_date = cal.loc["Earnings Date"]
                        if isinstance(earn_date, datetime):
                            if earn_date.date() == datetime.now().date():
                                earnings.append(ticker)
            except Exception:
                pass

        return earnings
    except Exception:
        return []


# ---------------------------------------------------------------------------
# Briefing Formatter
# ---------------------------------------------------------------------------

def format_briefing(market_data, scored_headlines, earnings):
    """Format the morning briefing as a structured Discord message."""
    now = datetime.now()
    header = f"**PAPER AGENT — MORNING BRIEFING**\n{now.strftime('%A, %B %d, %Y | %I:%M %p CT')}\n"

    # Section 1: MOVERS
    movers_lines = ["**MOVERS**"]
    config = get_watchlist()

    # Indices first
    for ticker in config.get("indices", []):
        data = market_data.get(ticker, {})
        if "error" in data:
            continue
        arrow = "+" if data["change_pct"] >= 0 else ""
        movers_lines.append(
            f"  {ticker}: ${data['price']} ({arrow}{data['change_pct']}%)"
        )

    movers_lines.append("")

    # Watchlist sorted by absolute change
    watchlist_data = []
    for ticker in config.get("watchlist", []):
        data = market_data.get(ticker, {})
        if "error" not in data:
            watchlist_data.append((ticker, data))

    watchlist_data.sort(key=lambda x: abs(x[1]["change_pct"]), reverse=True)

    for ticker, data in watchlist_data:
        arrow = "+" if data["change_pct"] >= 0 else ""
        flag = " [!!]" if abs(data["change_pct"]) > 3 else ""
        movers_lines.append(
            f"  {ticker}: ${data['price']} ({arrow}{data['change_pct']}%){flag}"
        )

    # Section 2: NEWS
    news_lines = ["\n**NEWS + SENTIMENT**"]
    if scored_headlines:
        for item in scored_headlines[:8]:
            tag = item["sentiment"]
            score = item["score"]
            news_lines.append(
                f"  [{tag} {score:+.2f}] {item['title']}"
            )
            if item.get("publisher"):
                news_lines.append(f"    — {item['publisher']} ({item['ticker']})")
    else:
        news_lines.append("  No headlines available")

    # Section 3: SENTIMENT
    sentiment_lines = ["\n**OVERALL SENTIMENT**"]
    if scored_headlines:
        avg_score = sum(h["score"] for h in scored_headlines) / len(scored_headlines)
        bull_count = sum(1 for h in scored_headlines if h["sentiment"] == "BULLISH")
        bear_count = sum(1 for h in scored_headlines if h["sentiment"] == "BEARISH")
        neutral_count = sum(1 for h in scored_headlines if h["sentiment"] == "NEUTRAL")

        mood = "BULLISH" if avg_score > 0.15 else "BEARISH" if avg_score < -0.15 else "MIXED"
        sentiment_lines.append(f"  Market Mood: {mood} (avg score: {avg_score:+.3f})")
        sentiment_lines.append(f"  Bullish: {bull_count} | Neutral: {neutral_count} | Bearish: {bear_count}")
    else:
        sentiment_lines.append("  Insufficient data")

    # Section 4: EARNINGS
    earnings_lines = ["\n**EARNINGS TODAY**"]
    if earnings:
        for ticker in earnings:
            earnings_lines.append(f"  {ticker} reports today")
    else:
        earnings_lines.append("  No watchlist earnings today")

    # Combine
    sections = [
        header,
        "\n".join(movers_lines),
        "\n".join(news_lines),
        "\n".join(sentiment_lines),
        "\n".join(earnings_lines),
    ]

    return "\n".join(sections)


# ---------------------------------------------------------------------------
# Discord Posting
# ---------------------------------------------------------------------------

def post_to_discord(webhook_url, content):
    """Post a message to Discord via webhook."""
    # Discord has a 2000 char limit per message
    chunks = []
    while content:
        if len(content) <= 1900:
            chunks.append(content)
            break
        split_at = content.rfind("\n", 0, 1900)
        if split_at == -1:
            split_at = 1900
        chunks.append(content[:split_at])
        content = content[split_at:].lstrip("\n")

    for chunk in chunks:
        resp = requests.post(
            webhook_url,
            json={"content": f"```\n{chunk}\n```"},
            timeout=10,
        )
        if resp.status_code not in (200, 204):
            print(f"[WARN] Discord webhook returned {resp.status_code}: {resp.text}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Morning briefing starting...")

    webhook_url = get_webhook_url()
    if not webhook_url:
        print("[FAIL] No webhook URL configured.")
        print("  Add PAPER_BRIEFING_WEBHOOK=https://discord.com/api/webhooks/... to ~/hermes-agents/configs/webhooks.env")
        sys.exit(1)

    config = get_watchlist()
    all_tickers = config.get("indices", []) + config.get("watchlist", [])

    print(f"  Pulling data for {len(all_tickers)} tickers...")
    market_data = get_market_data(all_tickers)

    print(f"  Fetching news headlines...")
    headlines = get_news_headlines(config.get("watchlist", []))

    print(f"  Scoring sentiment on {len(headlines)} headlines...")
    scored = score_sentiment(headlines)

    print(f"  Checking earnings calendar...")
    earnings = get_earnings_today()

    briefing = format_briefing(market_data, scored, earnings)

    print(f"  Posting to Discord...")
    post_to_discord(webhook_url, briefing)

    # Save to data dir for reference
    data_file = os.path.join(DATA_DIR, f"briefing_{datetime.now().strftime('%Y%m%d')}.txt")
    with open(data_file, "w") as f:
        f.write(briefing)

    print(f"[DONE] Briefing posted and saved to {data_file}")


if __name__ == "__main__":
    main()
