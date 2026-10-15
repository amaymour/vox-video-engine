#!/usr/bin/env python3
"""fetch_trends.py -- zero-cost public trend scraper.

Reads a niche string (argv[1] or the NICHE env var), queries the public
Google News RSS search channels (no API key, no paid service) and writes a
clean ``live_trends.csv`` at the repository root.

Usage:
    python fetch_trends.py "Tech Tools"
"""

import csv
import os
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

REPO_ROOT = os.path.dirname(os.path.abspath(__file__))
OUT_CSV = os.path.join(REPO_ROOT, "live_trends.csv")

USER_AGENT = "Mozilla/5.0 (compatible; vox-video-engine/1.0; +https://github.com)"


def niche_from_args() -> str:
    if len(sys.argv) > 1 and sys.argv[1].strip():
        return sys.argv[1].strip()
    return os.environ.get("NICHE", "Tech Tools").strip()


def rss_url(query: str) -> str:
    q = urllib.parse.quote(query)
    return (
        "https://news.google.com/rss/search"
        f"?q={q}&hl=en-US&gl=US&ceid=US:en"
    )


def fetch(url: str, timeout: int = 30) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def parse(xml_bytes: bytes) -> list[dict]:
    root = ET.fromstring(xml_bytes)
    items: list[dict] = []
    for item in root.iter("item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        published = (item.findtext("pubDate") or "").strip()
        source_el = item.find("source")
        source = ""
        if source_el is not None and source_el.text:
            source = source_el.text.strip()
        if not source and " - " in title:
            # Google News appends " - Publisher" to some titles.
            title, _, source = title.rpartition(" - ")
        if title:
            items.append(
                {
                    "title": title.strip(),
                    "source": source.strip(),
                    "published": published,
                    "link": link,
                }
            )
    return items


def main() -> int:
    niche = niche_from_args()
    queries = [f'"{niche}"', f"{niche} tips", f"{niche} 2026"]

    rows: list[dict] = []
    seen: set[str] = set()
    for query in queries:
        try:
            items = parse(fetch(rss_url(query)))
        except Exception as exc:  # noqa: BLE001 -- best-effort scraping
            print(f"fetch_trends: query {query!r} failed ({exc})")
            continue
        for item in items:
            key = item["title"].lower()
            if key in seen:
                continue
            seen.add(key)
            rows.append(item)
        if len(rows) >= 25:
            break

    rows = rows[:25]
    with open(OUT_CSV, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(
            fh, fieldnames=["title", "source", "published", "link", "niche"]
        )
        writer.writeheader()
        for row in rows:
            writer.writerow({**row, "niche": niche})

    print(f"fetch_trends: wrote {len(rows)} rows -> {OUT_CSV}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
