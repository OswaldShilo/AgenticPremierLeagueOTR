"""
YouTube Data API v3 service.
Searches for match highlight clips and returns a real videoId.
"""
import httpx
from config import YOUTUBE_API_KEY

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"


def search_highlight(query: str, max_results: int = 1) -> str | None:
    """
    Search YouTube for a highlight clip.
    Returns the first videoId found, or None on error / empty results.
    """
    if not YOUTUBE_API_KEY:
        print("[youtube] YOUTUBE_API_KEY not set — skipping search")
        return None

    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "order": "relevance",
        "maxResults": max_results,
        "key": YOUTUBE_API_KEY,
        # Prefer shorter clips (< 4 min) for goal highlights
        "videoDuration": "short",
        "safeSearch": "none",
    }

    try:
        resp = httpx.get(YOUTUBE_SEARCH_URL, params=params, timeout=8)
        resp.raise_for_status()
        items = resp.json().get("items", [])
        if items:
            video_id = items[0]["id"]["videoId"]
            print(f"[youtube] Found videoId={video_id} for query: {query!r}")
            return video_id
        print(f"[youtube] No results for query: {query!r}")
    except Exception as exc:
        print(f"[youtube] Search error: {exc}")

    return None


def build_goal_query(home: str, away: str, player: str, minute: int | None) -> str:
    """Build a tight search query for a goal highlight."""
    parts = [home, "vs", away, player, "goal"]
    if minute:
        parts.append(f"{minute}th minute")
    parts.append("highlights")
    return " ".join(p for p in parts if p)


def build_match_query(home: str, away: str) -> str:
    """Build a search query for general match highlights."""
    return f"{home} vs {away} highlights"
