"""
YouTube search router — proxies YouTube Data API v3 searches
so the frontend doesn't expose the API key client-side.
"""
from fastapi import APIRouter, Query, HTTPException
from services.youtube import search_highlight

router = APIRouter(prefix="/api/youtube", tags=["youtube"])


@router.get("/search")
def youtube_search(q: str = Query(..., min_length=2)):
    """
    Search YouTube for a highlight clip.
    Returns: { videoId: str | null, query: str }
    """
    video_id = search_highlight(q)
    if video_id is None:
        # Return null videoId instead of 404 so the frontend degrades gracefully
        return {"videoId": None, "query": q}
    return {"videoId": video_id, "query": q}
