"""
Background polling agent — tracks live match events and pushes
AI commentary to all connected WebSocket clients.
"""
import asyncio
from services.football_api import get_live_fixtures, get_events
from services.gemini import generate_event_commentary

# fixture_id -> set of event ids already processed
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
            event_key = f"{event['time']['elapsed']}_{event['type']}_{event.get('player', {}).get('id', '')}"
            if event_key in seen:
                continue

            seen.add(event_key)

            if event["type"] in ("Goal", "Card", "subst"):
                commentary = generate_event_commentary(event, match_context)
                if broadcast_fn:
                    await broadcast_fn({
                        "type": "ai_event",
                        "fixture_id": fixture_id,
                        "event": event,
                        "commentary": commentary,
                        "match": match_context,
                    })
