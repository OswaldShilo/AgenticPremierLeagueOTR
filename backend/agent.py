"""
Background polling agent — tracks live match events and pushes
AI commentary (+ YouTube highlight videoId for Goals) to all
connected WebSocket clients.
"""
import asyncio
from services.football_api import get_live_fixtures, get_events
from services.gemini import generate_event_commentary
from services.youtube import search_highlight, build_goal_query, build_match_query

# fixture_id -> set of event keys already processed
_seen_events: dict[int, set] = {}

# injected by main.py on startup
broadcast_fn = None


async def poll_loop(interval: int = 30):
    while True:
        try:
            await _check_live_matches()
        except Exception as e:
            print(f"[agent] poll error: {e}")
        await asyncio.sleep(interval)


async def _check_live_matches():
    data = get_live_fixtures()
    fixtures = data.get("response", [])

    for fixture in fixtures:
        fixture_id = fixture["fixture"]["id"]
        home = fixture["teams"]["home"]["name"]
        away = fixture["teams"]["away"]["name"]
        score_h = fixture["goals"]["home"] or 0
        score_a = fixture["goals"]["away"] or 0
        minute = fixture["fixture"]["status"].get("elapsed", 0)

        match_context = {
            "home": home,
            "away": away,
            "score": f"{score_h}-{score_a}",
            "minute": minute,
            "fixture_id": fixture_id,
        }

        events_data = get_events(fixture_id)
        events = events_data.get("response", [])
        seen = _seen_events.setdefault(fixture_id, set())

        for event in events:
            event_key = (
                f"{event['time']['elapsed']}_"
                f"{event['type']}_"
                f"{event.get('player', {}).get('id', '')}"
            )
            if event_key in seen:
                continue
            seen.add(event_key)

            if event["type"] not in ("Goal", "Card", "subst"):
                continue

            # 1. Generate Gemini commentary (all event types)
            commentary = generate_event_commentary(event, match_context)

            # 2. For Goals only → fetch a real YouTube highlight videoId
            video_id = None
            if event["type"] == "Goal":
                player_name = event.get("player", {}).get("name", "")
                query = build_goal_query(home, away, player_name, minute)

                loop = asyncio.get_event_loop()
                video_id = await loop.run_in_executor(None, search_highlight, query)

                # Fallback: broader match query
                if not video_id:
                    fallback = build_match_query(home, away)
                    video_id = await loop.run_in_executor(None, search_highlight, fallback)

            # 3. Broadcast to all connected clients
            if broadcast_fn:
                payload = {
                    "type": "ai_event",
                    "fixture_id": fixture_id,
                    "event": event,
                    "commentary": commentary,
                    "match": match_context,
                }
                if video_id:
                    payload["videoId"] = video_id

                await broadcast_fn(payload)
                print(
                    f"[agent] {event['type']} @ {minute}' | "
                    f"videoId={video_id or 'none'}"
                )
